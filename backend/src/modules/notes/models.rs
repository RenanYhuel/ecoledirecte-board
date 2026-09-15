use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Grade {
    pub id: u64,
    pub title: String,
    pub subject_code: String,
    pub subject_name: String,
    pub period_code: String,
    pub duty_type: Option<String>,
    pub value: Option<f64>,
    pub value_str: String,
    pub out_of: Option<f64>,
    pub out_of_str: String,
    pub coef: f64,
    pub class_avg: Option<f64>,
    pub class_min: Option<f64>,
    pub class_max: Option<f64>,
    pub date: String,
    pub comment: Option<String>,
    pub non_significant: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubjectAverage {
    pub id: u64,
    pub subject_code: String,
    pub subject_name: String,
    pub student_avg: Option<f64>,
    pub class_avg: Option<f64>,
    pub class_min: Option<f64>,
    pub class_max: Option<f64>,
    pub coef: f64,
    pub teachers: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Period {
    pub id: String,
    pub code: String,
    pub name: String,
    pub is_annual: bool,
    pub start_date: String,
    pub end_date: String,
    pub is_closed: bool,
    pub student_avg: Option<f64>,
    pub class_avg: Option<f64>,
    pub class_min: Option<f64>,
    pub class_max: Option<f64>,
    pub main_teacher: Option<String>,
    pub subjects: Vec<SubjectAverage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotesOverview {
    pub periods: Vec<Period>,
    pub grades: Vec<Grade>,
}
