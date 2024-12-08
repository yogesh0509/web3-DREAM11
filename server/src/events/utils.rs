use alloy::{providers::{ProviderBuilder, RootProvider, WsConnect}, pubsub::PubSubFrontend};
use std::error::Error;

pub async fn get_provider() -> Result<RootProvider<PubSubFrontend>, Box<dyn Error>>{
    let rpc_url = "wss://base-sepolia.g.alchemy.com/v2/ZXlHMZsPDpR82kjqBEH8KpPvacbKpmsI";
    let ws = WsConnect::new(rpc_url);
    let provider = ProviderBuilder::new().on_ws(ws).await?;
    Ok(provider)
}