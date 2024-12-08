use serde::Serialize;
use warp::{http::StatusCode, Rejection, Reply};

#[derive(Serialize)]
struct ErrorResponse {
    status: String,
    message: String,
}

// This function handles rejections (e.g., invalid ID or database errors)
pub async fn handle_rejection(err: Rejection) -> Result<impl Reply, warp::Rejection> {
    if let Some(_) = err.find::<warp::filters::body::BodyDeserializeError>() {
        let json = warp::reply::json(&ErrorResponse {
            status: "error".to_string(),
            message: "Invalid request body".to_string(),
        });
        return Ok(warp::reply::with_status(json, StatusCode::BAD_REQUEST));
    } else if let Some(_) = err.find::<warp::reject::MissingHeader>() {
        let json = warp::reply::json(&ErrorResponse {
            status: "error".to_string(),
            message: "Missing required header".to_string(),
        });
        return Ok(warp::reply::with_status(json, StatusCode::BAD_REQUEST));
    } else if let Some(_) = err.find::<warp::reject::InvalidQuery>() {
        let json = warp::reply::json(&ErrorResponse {
            status: "error".to_string(),
            message: "Invalid query parameter".to_string(),
        });
        return Ok(warp::reply::with_status(json, StatusCode::BAD_REQUEST));
    } else if err.is_not_found() {
        println!("error: {:?}", err);
        let json = warp::reply::json(&ErrorResponse {
            status: "error".to_string(),
            message: "Resource not found".to_string(),
        });

        return Ok(warp::reply::with_status(json, StatusCode::NOT_FOUND));
    }
    // Fallback case for any other errors
    println!("Rejection error: {:?}", err);
    let json = warp::reply::json(&ErrorResponse {
        status: "error".to_string(),
        message: "Unknown error occurred".to_string(),
    });
    Ok(warp::reply::with_status(
        json,
        StatusCode::INTERNAL_SERVER_ERROR,
    ))
}
