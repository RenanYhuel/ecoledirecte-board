use crate::client::EcoleDirecteHttpClient;
use crate::error::AppError;
use crate::inspector::InspectorLogger;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Clone)]
pub struct InspectorAppState {
    pub logger: Arc<InspectorLogger>,
    pub http_client: Arc<EcoleDirecteHttpClient>,
}

#[derive(Debug, Deserialize)]
pub struct LogsQuery {
    pub limit: Option<usize>,
    pub category: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RawRequestPayload {
    pub endpoint: String,
    pub payload: serde_json::Value,
    pub category: Option<String>,
}

pub async fn get_logs_handler(
    State(state): State<InspectorAppState>,
    Query(query): Query<LogsQuery>,
) -> Result<impl IntoResponse, AppError> {
    let logs = state.logger.get_logs(query.limit, query.category);
    Ok(Json(serde_json::json!({
        "success": true,
        "count": logs.len(),
        "logs": logs
    })))
}

pub async fn clear_logs_handler(
    State(state): State<InspectorAppState>,
) -> Result<impl IntoResponse, AppError> {
    state.logger.clear();
    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Logs cleared"
    })))
}

pub async fn execute_raw_request_handler(
    State(state): State<InspectorAppState>,
    Json(req): Json<RawRequestPayload>,
) -> Result<impl IntoResponse, AppError> {
    let cat = req.category.unwrap_or_else(|| "SandboxRaw".to_string());
    let resp = state
        .http_client
        .post_ed(&req.endpoint, &cat, &req.payload, true, true)
        .await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "response": resp
    })))
}
