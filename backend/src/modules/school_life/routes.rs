use crate::error::AppError;
use crate::modules::school_life::service::SchoolLifeService;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

pub async fn get_student_school_life(
    State(service): State<Arc<SchoolLifeService>>,
    Path(student_id): Path<u64>,
) -> Result<impl IntoResponse, AppError> {
    let overview = service.get_school_life(student_id).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": overview
    })))
}
