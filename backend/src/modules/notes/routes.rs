use crate::error::AppError;
use crate::modules::notes::service::NotesService;
use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct NotesQuery {
    pub annee_scolaire: Option<String>,
}

pub async fn get_student_notes(
    State(service): State<Arc<NotesService>>,
    Path(student_id): Path<u64>,
    Query(query): Query<NotesQuery>,
) -> Result<impl IntoResponse, AppError> {
    let notes = service.get_notes(student_id, query.annee_scolaire).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": notes
    })))
}
