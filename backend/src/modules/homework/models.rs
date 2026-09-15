use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attachment {
    pub id: u64,
    pub name: String,
    pub date: String,
    pub size: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HomeworkItem {
    pub id: u64,
    pub subject_name: String,
    pub subject_code: String,
    pub due_date: String,
    pub given_date: Option<String>,
    pub is_done: bool,
    pub interrogation: bool,
    pub submit_online: bool,
    pub description_html: Option<String>,
    pub attachments: Vec<Attachment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DayHomework {
    pub date: String,
    pub items: Vec<HomeworkItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToggleHomeworkRequest {
    pub id_devoir: u64,
    pub is_done: bool,
}
