use crate::auth::models::{DoubleAuthSubmitRequest, LoginRequest};
use crate::auth::service::AuthService;
use crate::client::EcoleDirecteHttpClient;
use crate::error::AppError;
use axum::{
    extract::State,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct AuthAppState {
    pub auth_service: Arc<AuthService>,
    pub http_client: Arc<EcoleDirecteHttpClient>,
}

pub async fn login_handler(
    State(state): State<AuthAppState>,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let auth_res = state.auth_service.login(&req).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "result": auth_res
    })))
}

pub async fn double_auth_submit_handler(
    State(state): State<AuthAppState>,
    Json(req): Json<DoubleAuthSubmitRequest>,
) -> Result<impl IntoResponse, AppError> {
    let auth_res = state.auth_service.submit_double_auth(&req).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "result": auth_res
    })))
}

pub async fn auth_status_handler(
    State(state): State<AuthAppState>,
) -> Result<impl IntoResponse, AppError> {
    let token = state.http_client.get_token();
    let gtk = state.http_client.get_gtk();
    let session = state.auth_service.get_current_session();
    let is_authenticated = token.is_some() && !token.as_ref().unwrap().is_empty();

    Ok(Json(serde_json::json!({
        "authenticated": is_authenticated,
        "token": token,
        "gtk": gtk,
        "session": session
    })))
}

pub async fn logout_handler(
    State(state): State<AuthAppState>,
) -> Result<impl IntoResponse, AppError> {
    state.http_client.clear_auth();
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Logged out successfully"
    })))
}
