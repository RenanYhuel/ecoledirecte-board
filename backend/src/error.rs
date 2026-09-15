use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub success: bool,
    pub code: u32,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

#[derive(Debug)]
pub enum AppError {
    Reqwest(String),
    Json(String),
    Base64(String),
    EcoleDirecte { code: u32, message: String, data: Option<serde_json::Value> },
    Unauthorized(String),
    NotFound(String),
    Internal(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Reqwest(e) => write!(f, "Network/HTTP error: {}", e),
            AppError::Json(e) => write!(f, "JSON serialization error: {}", e),
            AppError::Base64(e) => write!(f, "Base64 decoding error: {}", e),
            AppError::EcoleDirecte { code, message, .. } => {
                write!(f, "EcoleDirecte error (code {}): {}", code, message)
            }
            AppError::Unauthorized(e) => write!(f, "Unauthorized: {}", e),
            AppError::NotFound(e) => write!(f, "Not found: {}", e),
            AppError::Internal(e) => write!(f, "Internal server error: {}", e),
        }
    }
}

impl std::error::Error for AppError {}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        AppError::Reqwest(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Json(err.to_string())
    }
}

impl From<base64::DecodeError> for AppError {
    fn from(err: base64::DecodeError) -> Self {
        AppError::Base64(err.to_string())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message, details) = match self {
            AppError::EcoleDirecte { code, message, data } => {
                let http_status = match code {
                    250 => StatusCode::OK,
                    505 => StatusCode::UNAUTHORIZED,
                    520 | 525 => StatusCode::UNAUTHORIZED,
                    404 => StatusCode::NOT_FOUND,
                    _ => StatusCode::BAD_REQUEST,
                };
                (http_status, code, message, data)
            }
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, 401, msg, None),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, 404, msg, None),
            AppError::Reqwest(msg) => (StatusCode::BAD_GATEWAY, 502, msg, None),
            AppError::Json(msg) => (StatusCode::UNPROCESSABLE_ENTITY, 422, msg, None),
            AppError::Base64(msg) => (StatusCode::BAD_REQUEST, 400, msg, None),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, 500, msg, None),
        };

        let body = Json(ErrorResponse {
            success: false,
            code,
            message,
            details,
        });

        (status, body).into_response()
    }
}
