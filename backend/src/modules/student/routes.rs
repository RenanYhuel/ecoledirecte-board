use crate::error::AppError;
use crate::modules::student::service::StudentService;
use axum::{extract::{Path, State}, response::IntoResponse, Json};
use std::sync::Arc;

pub async fn get_student_timeline(
    State(service): State<Arc<StudentService>>,
    Path(student_id): Path<u64>,
) -> Result<impl IntoResponse, AppError> {
    let timeline = service.get_timeline(student_id).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": timeline
    })))
}
