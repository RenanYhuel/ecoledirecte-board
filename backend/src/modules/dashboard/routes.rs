use crate::error::AppError;
use crate::modules::dashboard::DashboardService;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct OverviewQuery {
    pub student_id: Option<u64>,
}

pub async fn get_dashboard_overview(
    State(service): State<Arc<DashboardService>>,
    Query(params): Query<OverviewQuery>,
) -> Result<impl IntoResponse, AppError> {
    let overview = service.get_overview(params.student_id).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "data": overview
    })))
}
