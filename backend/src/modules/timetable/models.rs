use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CourseSlot {
    pub id: u64,
    pub title: String,
    pub subject_code: String,
    pub subject_name: String,
    pub course_type: String,
    pub start_date: String,
    pub end_date: String,
    pub color: String,
    pub teacher: Option<String>,
    pub room: Option<String>,
    pub class_name: Option<String>,
    pub group_name: Option<String>,
    pub is_cancelled: bool,
    pub is_modified: bool,
    pub has_homework: bool,
    pub has_session_content: bool,
}
