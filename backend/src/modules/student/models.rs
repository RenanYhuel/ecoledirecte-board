use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StudentTimelineItem {
    pub date: String,
    pub element_type: String,
    pub element_id: u64,
    pub title: String,
    pub subtitle: Option<String>,
    pub content: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StudentProfile {
    pub id: u64,
    pub first_name: String,
    pub last_name: String,
    pub sex: Option<String>,
    pub email: Option<String>,
    pub establishment_name: String,
    pub class_name: String,
    pub class_code: String,
    pub photo_url: Option<String>,
}
