use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AbsenceRetard {
    pub id: u64,
    pub item_type: String,
    pub date: String,
    pub display_date: String,
    pub label: String,
    pub reason: Option<String>,
    pub is_justified: bool,
    pub comment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SanctionEncouragement {
    pub id: u64,
    pub item_type: String,
    pub date: String,
    pub label: String,
    pub reason: Option<String>,
    pub comment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchoolLifeOverview {
    pub absences_retards: Vec<AbsenceRetard>,
    pub sanctions: Vec<SanctionEncouragement>,
}
