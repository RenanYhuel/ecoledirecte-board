use crate::client::EcoleDirecteHttpClient;
use crate::config::APP_VERSION;
use crate::error::AppError;
use crate::modules::student::models::StudentTimelineItem;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct StudentService {
    http: Arc<EcoleDirecteHttpClient>,
}

impl StudentService {
    pub fn new(http: Arc<EcoleDirecteHttpClient>) -> Self {
        Self { http }
    }

    pub async fn get_timeline(&self, student_id: u64) -> Result<Vec<StudentTimelineItem>, AppError> {
        let endpoint = format!("eleves/{}/timeline.awp?verbe=get&v={}", student_id, APP_VERSION);
        let resp = self
            .http
            .post_ed(&endpoint, "StudentTimeline", &serde_json::json!({}), false, true)
            .await?;

        let mut items = Vec::new();
        if let Some(arr) = resp.data.as_ref().and_then(|d| d.as_array()) {
            for item in arr {
                let date = item.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let element_type = item.get("typeElement").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let element_id = item.get("idElement").and_then(|v| v.as_u64()).unwrap_or(0);
                let title = item.get("titre").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let subtitle = item.get("soustitre").and_then(|v| v.as_str()).map(|s| s.to_string());
                let content = item.get("contenu").and_then(|v| v.as_str()).map(|s| s.to_string());

                items.push(StudentTimelineItem {
                    date,
                    element_type,
                    element_id,
                    title,
                    subtitle,
                    content,
                });
            }
        }

        Ok(items)
    }
}
