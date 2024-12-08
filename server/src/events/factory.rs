use super::utils;
use alloy::{
    contract::{ContractInstance, Interface},
    dyn_abi::DynSolValue,
    json_abi::JsonAbi,
    primitives::{address, Address, B256, U256},
    providers::Provider,
    rpc::types::{BlockNumberOrTag, Filter},
    sol,
    sol_types::SolEvent,
};
use chrono::{Duration, Utc};
use entity::{
    bidding, game_details, player_details,
    prelude::{Bidding, GameDetails, PlayerDetails},
};
use futures_util::StreamExt;
use sea_orm::{DatabaseConnection, EntityTrait, Set};
use std::error::Error;

sol! {
    event GameStarted(
        address indexed gameAddress,
        uint256 indexed auctionStartTime,
        uint256 indexed totalPlayesrs
    );
}

pub async fn monitor_events(db: DatabaseConnection) -> Result<(), Box<dyn Error>> {
    let game_abi = r#"[
    {
        "inputs": [],
        "name": "s_auctionTime",
        "outputs": [{"type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAuctionContract",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPICContract",
        "outputs": [{"type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
]"#;

    let pic_abi = r#"[
        {
            "type": "function",
            "name": "getplayerDetails",
            "inputs": [
                {
                    "name": "tokenId",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "tuple",
                    "internalType": "struct IPlayer.PlayerQuery",
                    "components": [
                        {
                            "name": "imageURI",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "name",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "role",
                            "type": "string",
                            "internalType": "string"
                        },
                        {
                            "name": "id",
                            "type": "uint256",
                            "internalType": "uint256"
                        }
                    ]
                }
            ],
            "stateMutability": "view"
        }
]"#;

    let provider = utils::get_provider().await?;

    let contract_address = address!("7FD625ba0a3b5E05d1a8E0FE697eA24E0feca20C"); // GAME_FACTORY
    let filter = Filter::new()
        .address(contract_address)
        .event("GameCreated(address,uint256,uint256)")
        .from_block(BlockNumberOrTag::Latest);

    let sub = provider.subscribe_logs(&filter).await?;
    let mut stream = sub.into_stream();

    // let logs = provider.get_logs(&filter).await?;
    // println!("Found {} past events", logs.len());

    while let Some(log) = stream.next().await {
        // for log in logs {
        let topics = GameStarted::decode_topics(log.data().topics())?;
        let abi: JsonAbi = serde_json::from_str(game_abi)?;
        let contract = ContractInstance::new(topics.1, &provider, Interface::new(abi));

        // Get contract addresses and auction time
        let auction_address = contract.function("getAuctionContract", &[])?.call().await?;
        let pic_address = contract.function("getPICContract", &[])?.call().await?;
        let auction_time = contract.function("s_auctionTime", &[])?.call().await?;
        let auction_time = auction_time
            .first()
            .unwrap()
            .as_uint()
            .unwrap()
            .0
            .to::<i64>();
        let total_players = topics.3.to::<i32>();

        // Calculate auction timings
        let auction_start = Utc::now() + Duration::milliseconds(topics.2.to::<i64>());
        let total_auction_duration = auction_time * (total_players as i64);
        let auction_end = auction_start + Duration::seconds(total_auction_duration);
        let final_results = auction_end + Duration::seconds(auction_time);

        // Create game details entry first
        let game_row = game_details::ActiveModel {
            game_address: Set(topics.1.to_string().to_owned()),
            auction_address: Set(auction_address
                .first()
                .unwrap()
                .as_address()
                .unwrap()
                .0
                .to_string()
                .to_owned()),
            pic_address: Set(pic_address
                .first()
                .unwrap()
                .as_address()
                .unwrap()
                .0
                .to_string()
                .to_owned()),
            auction_start_time: Set(auction_start),
            auction_end_time: Set(auction_end),
            final_results_time: Set(final_results),
            total_players: Set(total_players),
            ..Default::default()
        };

        let inserted_game = GameDetails::insert(game_row)
            .exec_with_returning(&db)
            .await?;

        // Get PIC contract instance and total players
        let pic_abi: JsonAbi = serde_json::from_str(pic_abi)?;
        let pic_contract = ContractInstance::new(
            pic_address.first().unwrap().as_address().unwrap(),
            &provider,
            Interface::new(pic_abi),
        );

        // Create players for this game
        for token_id in 0..total_players {
            // Convert i32 to DynSolValue for the contract call
            let token_id_u256 = U256::from(token_id as u64);
            let token_id_sol = DynSolValue::Uint(token_id_u256, 256);

            // Get player details from PIC contract
            let player_result = pic_contract
                .function("getplayerDetails", &[token_id_sol])
                .map_err(|e| {
                    println!("Error preparing function call: {:?}", e);
                    e
                })?
                .call()
                .await
                .map_err(|e| {
                    println!("Error calling contract: {:?}", e);
                    e
                })?;

            let player = player_result.first().ok_or_else(|| {
                let err = "No player data returned".to_string();
                println!("{}", err);
                std::io::Error::new(std::io::ErrorKind::Other, err)
            })?;

            let components = player.as_tuple().ok_or_else(|| {
                let err = "Player data is not in expected tuple format".to_string();
                println!("{}", err);
                std::io::Error::new(std::io::ErrorKind::Other, err)
            })?;

            println!("Player components: {:?}", components);

            // Create player details entry with game_id
            let player_row = player_details::ActiveModel {
                image: Set(components[0].as_str().unwrap().to_string()),
                name: Set(components[1].as_str().unwrap().to_string()),
                role: Set(components[2].as_str().unwrap().to_string()),
                game_id: Set(inserted_game.id),
                ..Default::default()
            };

            PlayerDetails::insert(player_row)
                .exec_with_returning(&db)
                .await?;
        }
    }

    Ok(())
}
