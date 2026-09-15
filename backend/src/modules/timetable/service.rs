use crate::client::EcoleDirecteHttpClient;
use crate::config::APP_VERSION;
use crate::error::AppError;
use crate::modules::timetable::models::CourseSlot;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct TimetableService {
    http: Arc<EcoleDirecteHttpClient>,
}

impl TimetableService {
    pub fn new(http: Arc<EcoleDirecteHttpClient>) -> Self {
        Self { http }
    }

    pub async fn get_timetable(
        &self,
        student_id: u64,
        date_debut: &str,
        date_fin: &str,
        avec_trous: bool,
    ) -> Result<Vec<CourseSlot>, AppError> {
        let endpoint = format!("E/{}/emploidutemps.awp?verbe=get&v={}", student_id, APP_VERSION);
        let payload = serde_json::json!({
            "dateDebut": date_debut,
            "dateFin": date_fin,
            "avecTrous": avec_trous
        });

        let resp = self
            .http
            .post_ed(&endpoint, "Timetable", &payload, false, true)
            .await?;

        if resp.code != 200 {
            return Err(AppError::EcoleDirecte {
                code: resp.code,
                message: resp.message.unwrap_or_else(|| "Erreur lors de la récupération de l'emploi du temps".to_string()),
                data: resp.data,
            });
        }

        let mut slots = Vec::new();
        if let Some(arr) = resp.data.as_ref().and_then(|d| d.as_array()) {
            for item in arr {
                let id = item.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
                let title = item.get("text").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let subject_code = item.get("codeMatiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let subject_name = item.get("matiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let course_type = item.get("typeCours").and_then(|v| v.as_str()).unwrap_or("COURS").to_string();
                let start_date = item.get("start_date").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let end_date = item.get("end_date").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let color = item.get("color").and_then(|v| v.as_str()).unwrap_or("#3b82f6").to_string();
                let teacher = item.get("prof").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                let room = item.get("salle").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                let class_name = item.get("classe").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                let group_name = item.get("groupe").and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                let is_cancelled = item.get("isAnnule").and_then(|v| v.as_bool()).unwrap_or(false);
                let is_modified = item.get("isModifie").and_then(|v| v.as_bool()).unwrap_or(false);
                let has_homework = item.get("devoirAFaire").and_then(|v| v.as_bool()).unwrap_or(false);
                let has_session_content = item.get("contenuDeSeance").and_then(|v| v.as_bool()).unwrap_or(false);

                slots.push(CourseSlot {
                    id,
                    title,
                    subject_code,
                    subject_name,
                    course_type,
                    start_date,
                    end_date,
                    color,
                    teacher,
                    room,
                    class_name,
                    group_name,
                    is_cancelled,
                    is_modified,
                    has_homework,
                    has_session_content,
                });
            }
        }

        Ok(slots)
    }
}
