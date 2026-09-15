use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageSummary {
    pub id: u64,
    pub subject: String,
    pub sender: String,
    pub sender_role: Option<String>,
    pub sender_function: Option<String>,
    pub date: String,
    pub is_read: bool,
    pub has_attachments: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageAttachment {
    pub id: u64,
    pub name: String,
    pub size: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageDetail {
    pub id: u64,
    pub subject: String,
    pub sender: String,
    pub date: String,
    pub content_html: String,
    pub attachments: Vec<MessageAttachment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessagesOverview {
    pub received: Vec<MessageSummary>,
    pub sent: Vec<MessageSummary>,
}
