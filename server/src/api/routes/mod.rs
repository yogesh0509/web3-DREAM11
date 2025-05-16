use crate::api::handlers::error::handle_rejection;
use super::handlers;
use sea_orm::DatabaseConnection;
use warp::filters::BoxedFilter;
use warp::{path, Filter};

fn path_prefix() -> BoxedFilter<()> {
    path!("api" / ..).boxed()
}

fn with_db(
    db: DatabaseConnection,
) -> impl Filter<Extract = (DatabaseConnection,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || db.clone())
}

// Health Check Route
pub fn health_check() -> BoxedFilter<()> {
    warp::get()
        .and(path_prefix())
        .and(warp::path("healthchecker"))
        .and(warp::path::end())
        .boxed()
}

// Game Routes
pub fn get_all_games() -> BoxedFilter<()> {
    warp::get()
        .and(path_prefix())
        .and(warp::path("games"))
        .and(warp::path("all"))
        .and(warp::path::end())
        .boxed()
}

pub fn get_game_by_address() -> BoxedFilter<(String,)> {
    warp::get()
        .and(path_prefix())
        .and(warp::path("games"))
        .and(warp::path::param::<String>())
        .and(warp::path::end())
        .boxed()
}

pub fn create_game() -> BoxedFilter<()> {
    warp::post()
        .and(path_prefix())
        .and(warp::path("games"))
        .and(warp::path("create"))
        .and(warp::path::end())
        .boxed()
}

// Player Routes
pub fn get_player_details() -> BoxedFilter<(i32,)> {
    warp::get()
        .and(path_prefix())
        .and(warp::path("players"))
        .and(warp::path::param::<i32>()) // game_id
        .and(warp::path::end())
        .boxed()
}

pub fn create_player() -> BoxedFilter<()> {
    warp::post()
        .and(path_prefix())
        .and(warp::path("players"))
        .and(warp::path("create"))
        .and(warp::path::end())
        .boxed()
}

// Bidding Routes
pub fn create_bid() -> BoxedFilter<()> {
    warp::post()
        .and(path_prefix())
        .and(warp::path("bids"))
        .and(warp::path("create"))
        .and(warp::path::end())
        .boxed()
}

pub fn get_bids_for_player() -> BoxedFilter<(i32,)> {
    warp::get()
        .and(path_prefix())
        .and(warp::path("bids"))
        .and(warp::path("player"))
        .and(warp::path::param::<i32>()) // player_id
        .and(warp::path::end())
        .boxed()
}

pub fn setup_routes(
    db: DatabaseConnection,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    health_check()
        .and_then(handlers::health_checker_handler)
        .or(get_all_games()
            .and(with_db(db.clone()))
            .and_then(handlers::get_all_games))
        .or(get_game_by_address()
            .and(with_db(db.clone()))
            .and_then(handlers::get_game_by_address))
        .or(get_player_details()
            .and(with_db(db.clone()))
            .and_then(handlers::get_player_details))
        .or(get_bids_for_player()
            .and(with_db(db.clone()))
            .and_then(handlers::get_bids_for_player))
        .recover(handle_rejection)
        .with(
            warp::cors()
                .allow_any_origin()
                .allow_headers(vec!["content-type"])
                .allow_methods(vec!["GET", "POST"]),
        )
        .with(warp::log("api"))
}

// API Endpoints Summary:
// Health Check:
// GET /api/healthchecker

// Games:
// GET  /api/games/all               - Get all games
// GET  /api/games/:address          - Get game by address
// POST /api/games/create            - Create a new game

// Players:
// GET  /api/players/:game_id        - Get all players for a game
// POST /api/players/create          - Create a new player

// Bids:
// POST /api/bids/create             - Create a new bid
// GET  /api/bids/player/:player_id  - Get all bids for a player
