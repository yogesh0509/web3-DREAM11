use ::entity::prelude::{GameDetails, PlayerDetails, Bidding};
use ::entity::{game_details, player_details, bidding};
use sea_orm::*;
use serde::Serialize;
use warp::{reject::Reject, Rejection, Reply};
pub mod error;

#[derive(Serialize)]
struct GenericResponse {
    status: String,
    message: String,
}

#[derive(Debug)]
pub struct DatabaseError(pub DbErr);

impl Reject for DatabaseError {}

// Game Details handlers
pub async fn get_all_games(db: DatabaseConnection) -> Result<impl Reply, Rejection> {
    match GameDetails::find().all(&db).await {
        Ok(games) => {
            if games.is_empty() {
                Ok(warp::reply::json(&Vec::<game_details::Model>::new()))
            } else {
                Ok(warp::reply::json(&games))
            }
        }
        Err(err) => {
            eprintln!("Database error when fetching all games: {:?}", err);
            Err(warp::reject::custom(DatabaseError(err)))
        }
    }
}

pub async fn get_game_by_address(
    game_address: String,
    db: DatabaseConnection,
) -> Result<impl Reply, Rejection> {
    match GameDetails::find()
        .filter(game_details::Column::GameAddress.eq(game_address))
        .one(&db)
        .await 
    {
        Ok(Some(game)) => Ok(warp::reply::json(&game)),
        Ok(None) => Err(warp::reject::not_found()),
        Err(err) => {
            eprintln!("Database error: {:?}", err);
            Err(warp::reject::custom(DatabaseError(err)))
        }
    }
}

// Player Details handlers
pub async fn get_player_details(
    game_id: i32,
    db: DatabaseConnection,
) -> Result<impl Reply, Rejection> {
    match PlayerDetails::find()
        .find_also_related(GameDetails)
        .filter(game_details::Column::Id.eq(game_id))
        .all(&db)
        .await 
    {
        Ok(players) => Ok(warp::reply::json(&players)),
        Err(err) => {
            eprintln!("Database error: {:?}", err);
            Err(warp::reject::custom(DatabaseError(err)))
        }
    }
}

pub async fn get_bids_for_player(
    player_id: i32,
    db: DatabaseConnection,
) -> Result<impl Reply, Rejection> {
    match Bidding::find()
        .find_also_related(PlayerDetails)
        .filter(player_details::Column::Id.eq(player_id))
        .all(&db)
        .await 
    {
        Ok(bids) => Ok(warp::reply::json(&bids)),
        Err(err) => {
            eprintln!("Database error: {:?}", err);
            Err(warp::reject::custom(DatabaseError(err)))
        }
    }
}

pub async fn health_checker_handler() -> Result<impl Reply, Rejection> {
    const MESSAGE: &str = "Game Auction API Health Check";

    let response_json = &GenericResponse {
        status: "success".to_string(),
        message: MESSAGE.to_string(),
    };
    Ok(warp::reply::json(response_json))
}