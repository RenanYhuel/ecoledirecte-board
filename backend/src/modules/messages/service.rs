use crate::client::EcoleDirecteHttpClient;
use crate::config::APP_VERSION;
use crate::error::AppError;
use crate::modules::messages::models::{MessageAttachment, MessageDetail, MessageSummary, MessagesOverview};
use base64::prelude::*;
use serde_json::Value;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct MessagesService {
    http: Arc<EcoleDirecteHttpClient>,
}

impl MessagesService {
    pub fn new(http: Arc<EcoleDirecteHttpClient>) -> Self {
        Self { http }
    }

    pub async fn get_messages(&self, student_id: u64) -> Result<MessagesOverview, AppError> {
        let endpoint = format!(
            "eleves/{}/messages.awp?force=false&typeRecuperation=received&idClasseur=0&orderBy=date&order=desc&query=&onlyRead=&page=0&itemsPerPage=100&getAll=0&verbe=get&v={}",
            student_id, APP_VERSION
        );

        let resp = self
            .http
            .post_ed(&endpoint, "Messages", &serde_json::json!({}), false, true)
            .await?;

        if resp.code != 200 {
            return Err(AppError::EcoleDirecte {
                code: resp.code,
                message: resp.message.unwrap_or_else(|| "Erreur lors de la récupération des messages".to_string()),
                data: resp.data,
            });
        }

        let mut received = Vec::new();
        if let Some(messages) = resp.data.as_ref().and_then(|d| d.get("messages")).and_then(|m| m.get("received")).and_then(|r| r.as_array()) {
            for m in messages {
                let id = m.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
                let subject = m.get("subject").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let sender = extract_sender(m);
                let sender_role = m.get("from").and_then(|f| f.get("role")).and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                let sender_function = m.get("from").and_then(|f| f.get("fonctionPersonnel")).and_then(|v| v.as_str()).filter(|s| !s.is_empty()).map(|s| s.to_string());
                let date = m.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let is_read = m.get("read").and_then(|v| v.as_bool()).unwrap_or(true);
                let has_attachments = m.get("files").and_then(|v| v.as_array()).map(|a| !a.is_empty()).unwrap_or(false);

                received.push(MessageSummary {
                    id,
                    subject,
                    sender,
                    sender_role,
                    sender_function,
                    date,
                    is_read,
                    has_attachments,
                });
            }
        }

        Ok(MessagesOverview {
            received,
            sent: Vec::new(),
        })
    }

    pub async fn get_message_detail(
        &self,
        student_id: u64,
        message_id: u64,
    ) -> Result<MessageDetail, AppError> {
        let endpoint = format!(
            "eleves/{}/messages/{}.awp?verbe=get&mode=destinataire&v={}",
            student_id, message_id, APP_VERSION
        );

        let resp = self
            .http
            .post_ed(&endpoint, "MessageDetail", &serde_json::json!({ "anneeMessages": "" }), false, true)
            .await?;

        if resp.code != 200 {
            return Err(AppError::EcoleDirecte {
                code: resp.code,
                message: resp.message.unwrap_or_else(|| "Erreur lors de la récupération du message".to_string()),
                data: resp.data,
            });
        }

        let data = resp.data.unwrap_or_default();
        let id = data.get("id").and_then(|v| v.as_u64()).unwrap_or(message_id);
        let subject = data.get("subject").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let sender = extract_sender(&data);
        let date = data.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();

        let raw_content = data.get("content").and_then(|v| v.as_str()).unwrap_or("");
        let content_html = BASE64_STANDARD
            .decode(raw_content)
            .map(|bytes| String::from_utf8_lossy(&bytes).to_string())
            .unwrap_or_else(|_| raw_content.to_string());

        let mut attachments = Vec::new();
        if let Some(files) = data.get("files").and_then(|f| f.as_array()) {
            for f in files {
                let file_id = f.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
                let name = f.get("libelle").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let size = f.get("taille").and_then(|v| v.as_u64());

                attachments.push(MessageAttachment {
                    id: file_id,
                    name,
                    size,
                });
            }
        }

        Ok(MessageDetail {
            id,
            subject,
            sender,
            date,
            content_html,
            attachments,
        })
    }

    pub async fn toggle_read_status(
        &self,
        student_id: u64,
        message_id: u64,
        is_read: bool,
    ) -> Result<bool, AppError> {
        let action = if is_read { "marquerCommeLu" } else { "marquerCommeNonLu" };
        let endpoint = format!(
            "eleves/{}/messages.awp?verbe=put&v={}",
            student_id, APP_VERSION
        );

        let payload = serde_json::json!({
            "action": action,
            "ids": [message_id],
        });

        let resp = self
            .http
            .post_ed(&endpoint, "MessageAction", &payload, false, true)
            .await;

        if let Ok(r) = resp {
            if r.code == 200 {
                return Ok(is_read);
            }
        }

        let alt_action = if is_read { "read" } else { "unread" };
        let alt_payload = serde_json::json!({
            "action": alt_action,
            "ids": [message_id],
        });

        let resp_alt = self
            .http
            .post_ed(&endpoint, "MessageAction", &alt_payload, false, true)
            .await;

        if let Ok(r) = resp_alt {
            if r.code == 200 {
                return Ok(is_read);
            }
        }

        if is_read {
            let _ = self.get_message_detail(student_id, message_id).await;
        }

        Ok(is_read)
    }
}

fn extract_sender(m: &Value) -> String {
    if let Some(from) = m.get("from").or_else(|| m.get("expediteur")).or_else(|| m.get("sender")) {
        if let Some(s) = from.as_str() {
            if !s.trim().is_empty() {
                return s.trim().to_string();
            }
        }

        let civilite = from.get("civilite").and_then(|v| v.as_str()).unwrap_or("").trim();
        let prenom = from.get("prenom").and_then(|v| v.as_str()).unwrap_or("").trim();
        let nom = from.get("nom").and_then(|v| v.as_str()).unwrap_or("").trim();
        let particule = from.get("particule").and_then(|v| v.as_str()).unwrap_or("").trim();
        let fonction = from.get("fonctionPersonnel").and_then(|v| v.as_str()).unwrap_or("").trim();

        let full_nom = if !particule.is_empty() && !nom.is_empty() {
            format!("{} {}", particule, nom)
        } else {
            nom.to_string()
        };

        let mut parts = Vec::new();
        if !civilite.is_empty() {
            parts.push(civilite);
        }
        if !prenom.is_empty() {
            parts.push(prenom);
        }
        if !full_nom.is_empty() {
            parts.push(&full_nom);
        }

        let full_name = parts.join(" ").trim().to_string();
        if !full_name.is_empty() {
            if !fonction.is_empty() {
                return format!("{} ({})", full_name, fonction);
            }
            return full_name;
        }

        if let Some(name) = from.get("name").and_then(|v| v.as_str()) {
            if !name.trim().is_empty() {
                return name.trim().to_string();
            }
        }
        if let Some(lib) = from.get("libelle").and_then(|v| v.as_str()) {
            if !lib.trim().is_empty() {
                return lib.trim().to_string();
            }
        }
        if !fonction.is_empty() {
            return fonction.to_string();
        }
    }

    let nom = m.get("nomProf").or_else(|| m.get("nom")).and_then(|v| v.as_str()).unwrap_or("").trim();
    let prenom = m.get("prenomProf").or_else(|| m.get("prenom")).and_then(|v| v.as_str()).unwrap_or("").trim();
    if !nom.is_empty() || !prenom.is_empty() {
        return format!("{} {}", prenom, nom).trim().to_string();
    }

    "Établissement".to_string()
}
