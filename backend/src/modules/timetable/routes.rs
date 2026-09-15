use crate::error::AppError;
use crate::modules::timetable::service::TimetableService;
use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use serde::Deserialize;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct TimetableQuery {
    pub date_debut: Option<String>,
    pub date_fin: Option<String>,
    pub avec_trous: Option<bool>,
}

pub async fn get_student_timetable(
    State(service): State<Arc<TimetableService>>,
    Path(student_id): Path<u64>,
    Query(query): Query<TimetableQuery>,
) -> Result<impl IntoResponse, AppError> {
    let today = Utc::now().format("%Y-%m-%d").to_string();
    let date_debut = query.date_debut.unwrap_or_else(|| today.clone());
    let date_fin = query.date_fin.unwrap_or_else(|| today);
    let avec_trous = query.avec_trous.unwrap_or(false);

    let slots = service
        .get_timetable(student_id, &date_debut, &date_fin, avec_trous)
        .await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "data": slots
    })))
}
