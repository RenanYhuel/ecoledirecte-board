use crate::error::AppError;
use crate::modules::messages::service::MessagesService;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

pub async fn get_student_messages(
    State(service): State<Arc<MessagesService>>,
    Path(student_id): Path<u64>,
) -> Result<impl IntoResponse, AppError> {
    let overview = service.get_messages(student_id).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": overview
    })))
}

pub async fn get_student_message_detail(
    State(service): State<Arc<MessagesService>>,
    Path((student_id, message_id)): Path<(u64, u64)>,
) -> Result<impl IntoResponse, AppError> {
    let detail = service.get_message_detail(student_id, message_id).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": detail
    })))
}

#[derive(Debug, serde::Deserialize)]
pub struct ToggleMessageReadRequest {
    pub is_read: bool,
}

pub async fn toggle_student_message_read(
    State(service): State<Arc<MessagesService>>,
    Path((student_id, message_id)): Path<(u64, u64)>,
    Json(payload): Json<ToggleMessageReadRequest>,
) -> Result<impl IntoResponse, AppError> {
    let result = service.toggle_read_status(student_id, message_id, payload.is_read).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "is_read": result
    })))
}
