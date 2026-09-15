use crate::error::AppError;
use crate::modules::homework::models::ToggleHomeworkRequest;
use crate::modules::homework::service::HomeworkService;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

pub async fn get_student_homework(
    State(service): State<Arc<HomeworkService>>,
    Path(student_id): Path<u64>,
) -> Result<impl IntoResponse, AppError> {
    let homework = service.get_homework(student_id).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": homework
    })))
}

pub async fn get_student_homework_day(
    State(service): State<Arc<HomeworkService>>,
    Path((student_id, date)): Path<(u64, String)>,
) -> Result<impl IntoResponse, AppError> {
    let detail = service.get_day_detail(student_id, &date).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": detail
    })))
}

pub async fn toggle_student_homework(
    State(service): State<Arc<HomeworkService>>,
    Path(student_id): Path<u64>,
    Json(req): Json<ToggleHomeworkRequest>,
) -> Result<impl IntoResponse, AppError> {
    let success = service.toggle_homework(student_id, req.id_devoir, req.is_done).await?;
    Ok(Json(serde_json::json!({
        "success": success
    })))
}
