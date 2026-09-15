use crate::client::EcoleDirecteHttpClient;
use crate::config::APP_VERSION;
use crate::error::AppError;
use crate::modules::school_life::models::{AbsenceRetard, SanctionEncouragement, SchoolLifeOverview};
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct SchoolLifeService {
    http: Arc<EcoleDirecteHttpClient>,
}

impl SchoolLifeService {
    pub fn new(http: Arc<EcoleDirecteHttpClient>) -> Self {
        Self { http }
    }

    pub async fn get_school_life(&self, student_id: u64) -> Result<SchoolLifeOverview, AppError> {
        let endpoint = format!("eleves/{}/viescolaire.awp?verbe=get&v={}", student_id, APP_VERSION);
        let resp = self
            .http
            .post_ed(&endpoint, "SchoolLife", &serde_json::json!({}), false, true)
            .await?;

        if resp.code != 200 {
            return Err(AppError::EcoleDirecte {
                code: resp.code,
                message: resp.message.unwrap_or_else(|| "Erreur lors de la récupération de la vie scolaire".to_string()),
                data: resp.data,
            });
        }

        let mut absences_retards = Vec::new();
        let mut sanctions = Vec::new();

        if let Some(data) = resp.data {
            if let Some(arr) = data.get("absencesRetards").and_then(|a| a.as_array()) {
                for item in arr {
                    let id = item.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
                    let item_type = item.get("typeElement").and_then(|v| v.as_str()).unwrap_or("Absence").to_string();
                    let date = item.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let display_date = item.get("displayDate").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let label = item.get("libelle").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let reason = item.get("motif").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                    let is_justified = item.get("justifie").and_then(|v| v.as_bool()).unwrap_or(false);
                    let comment = item.get("commentaire").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());

                    absences_retards.push(AbsenceRetard {
                        id,
                        item_type,
                        date,
                        display_date,
                        label,
                        reason,
                        is_justified,
                        comment,
                    });
                }
            }

            if let Some(arr) = data.get("sanctionsEncouragements").and_then(|a| a.as_array()) {
                for item in arr {
                    let id = item.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
                    let item_type = item.get("typeElement").and_then(|v| v.as_str()).unwrap_or("Sanction").to_string();
                    let date = item.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let label = item.get("libelle").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let reason = item.get("motif").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                    let comment = item.get("commentaire").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());

                    sanctions.push(SanctionEncouragement {
                        id,
                        item_type,
                        date,
                        label,
                        reason,
                        comment,
                    });
                }
            }
        }

        Ok(SchoolLifeOverview {
            absences_retards,
            sanctions,
        })
    }
}
