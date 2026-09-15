use crate::client::EcoleDirecteHttpClient;
use crate::config::APP_VERSION;
use crate::error::AppError;
use crate::modules::homework::models::{Attachment, DayHomework, HomeworkItem};
use base64::prelude::*;
use serde_json::Value;
use std::collections::BTreeMap;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct HomeworkService {
    http: Arc<EcoleDirecteHttpClient>,
}

impl HomeworkService {
    pub fn new(http: Arc<EcoleDirecteHttpClient>) -> Self {
        Self { http }
    }

    pub async fn get_homework(&self, student_id: u64) -> Result<Vec<DayHomework>, AppError> {
        let endpoint = format!("Eleves/{}/cahierdetexte.awp?verbe=get&v={}", student_id, APP_VERSION);
        let resp = self
            .http
            .post_ed(&endpoint, "Homework", &serde_json::json!({}), false, true)
            .await?;

        if resp.code != 200 {
            return Err(AppError::EcoleDirecte {
                code: resp.code,
                message: resp.message.unwrap_or_else(|| "Erreur lors de la récupération des devoirs".to_string()),
                data: resp.data,
            });
        }

        let mut days_map: BTreeMap<String, Vec<HomeworkItem>> = BTreeMap::new();
        if let Some(obj) = resp.data.as_ref().and_then(|d| d.as_object()) {
            for (date, items_val) in obj {
                if let Some(arr) = items_val.as_array() {
                    let mut items = Vec::new();
                    for item in arr {
                        let id = item.get("idDevoir").and_then(|v| v.as_u64()).unwrap_or(0);
                        let subject_name = item.get("matiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        let subject_code = item.get("codeMatiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        let given_date = item.get("donneLe").and_then(|v| v.as_str()).map(|s| s.to_string());
                        let is_done = item.get("effectue").and_then(|v| v.as_bool()).unwrap_or(false);
                        let interrogation = item.get("interrogation").and_then(|v| v.as_bool()).unwrap_or(false);
                        let submit_online = item.get("rendreEnLigne").and_then(|v| v.as_bool()).unwrap_or(false);

                        items.push(HomeworkItem {
                            id,
                            subject_name,
                            subject_code,
                            due_date: date.clone(),
                            given_date,
                            is_done,
                            interrogation,
                            submit_online,
                            description_html: None,
                            attachments: Vec::new(),
                        });
                    }
                    days_map.insert(date.clone(), items);
                }
            }
        }

        let result = days_map
            .into_iter()
            .map(|(date, items)| DayHomework { date, items })
            .collect();

        Ok(result)
    }

    pub async fn get_day_detail(&self, student_id: u64, date: &str) -> Result<DayHomework, AppError> {
        let endpoint = format!("Eleves/{}/cahierdetexte/{}.awp?verbe=get&v={}", student_id, date, APP_VERSION);
        let resp = self
            .http
            .post_ed(&endpoint, "HomeworkDetail", &serde_json::json!({}), false, true)
            .await?;

        if resp.code != 200 {
            return Err(AppError::EcoleDirecte {
                code: resp.code,
                message: resp.message.unwrap_or_else(|| "Erreur lors de la récupération des détails de devoirs".to_string()),
                data: resp.data,
            });
        }

        let mut items = Vec::new();
        if let Some(matieres) = resp.data.as_ref().and_then(|d| d.get("matieres")).and_then(|m| m.as_array()) {
            for m in matieres {
                let subject_name = m.get("matiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let subject_code = m.get("codeMatiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let interrogation = m.get("interrogation").and_then(|v| v.as_bool()).unwrap_or(false);

                if let Some(afaire) = m.get("aFaire") {
                    let id = afaire.get("idDevoir").and_then(|v| v.as_u64()).unwrap_or_else(|| {
                        m.get("id").and_then(|v| v.as_u64()).unwrap_or(0)
                    });
                    let given_date = afaire.get("donneLe").and_then(|v| v.as_str()).map(|s| s.to_string());
                    let is_done = afaire.get("effectue").and_then(|v| v.as_bool()).unwrap_or(false);
                    let submit_online = afaire.get("rendreEnLigne").and_then(|v| v.as_bool()).unwrap_or(false);

                    let mut description_html = None;
                    if let Some(c_b64) = afaire.get("contenu").and_then(|v| v.as_str()) {
                        if !c_b64.is_empty() {
                            let decoded = BASE64_STANDARD
                                .decode(c_b64)
                                .map(|bytes| String::from_utf8_lossy(&bytes).to_string())
                                .unwrap_or_else(|_| c_b64.to_string());
                            description_html = Some(decoded);
                        }
                    }

                    let mut attachments = Vec::new();
                    if let Some(docs) = afaire.get("documents").and_then(|d| d.as_array()) {
                        for doc in docs {
                            let doc_id = doc.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
                            let name = doc.get("libelle").and_then(|v| v.as_str()).unwrap_or("").to_string();
                            let doc_date = doc.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();
                            let size = doc.get("taille").and_then(|v| v.as_u64());

                            attachments.push(Attachment {
                                id: doc_id,
                                name,
                                date: doc_date,
                                size,
                            });
                        }
                    }

                    items.push(HomeworkItem {
                        id,
                        subject_name,
                        subject_code,
                        due_date: date.to_string(),
                        given_date,
                        is_done,
                        interrogation,
                        submit_online,
                        description_html,
                        attachments,
                    });
                }
            }
        }

        Ok(DayHomework {
            date: date.to_string(),
            items,
        })
    }

    pub async fn toggle_homework(
        &self,
        student_id: u64,
        id_devoir: u64,
        is_done: bool,
    ) -> Result<bool, AppError> {
        let endpoint = format!("Eleves/{}/cahierdetexte.awp?verbe=put&v={}", student_id, APP_VERSION);
        let payload = if is_done {
            serde_json::json!({
                "idDevoirsEffectues": [id_devoir],
                "idDevoirsNonEffectues": []
            })
        } else {
            serde_json::json!({
                "idDevoirsEffectues": [],
                "idDevoirsNonEffectues": [id_devoir]
            })
        };

        let resp = self
            .http
            .post_ed(&endpoint, "HomeworkToggle", &payload, false, true)
            .await?;

        Ok(resp.code == 200)
    }
}
