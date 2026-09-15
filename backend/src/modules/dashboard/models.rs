use crate::auth::models::AccountInfo;
use crate::modules::homework::models::DayHomework;
use crate::modules::messages::models::MessageSummary;
use crate::modules::notes::models::{Grade, Period};
use crate::modules::school_life::models::{AbsenceRetard, SanctionEncouragement};
use crate::modules::timetable::models::CourseSlot;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardNotesSummary {
    pub periods: Vec<Period>,
    pub recent_grades: Vec<Grade>,
    pub general_average: Option<f64>,
    pub class_average: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardHomeworkSummary {
    pub days: Vec<DayHomework>,
    pub pending_count: usize,
    pub done_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardSchoolLifeSummary {
    pub absences_retards: Vec<AbsenceRetard>,
    pub sanctions: Vec<SanctionEncouragement>,
    pub total_absences: usize,
    pub total_lateness: usize,
    pub unjustified_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardMessagesSummary {
    pub received: Vec<MessageSummary>,
    pub unread_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardTimetableSummary {
    pub today: Vec<CourseSlot>,
    pub tomorrow: Vec<CourseSlot>,
    pub next_slot: Option<CourseSlot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardOverview {
    pub student: Option<AccountInfo>,
    pub notes: DashboardNotesSummary,
    pub homework: DashboardHomeworkSummary,
    pub school_life: DashboardSchoolLifeSummary,
    pub messages: DashboardMessagesSummary,
    pub timetable: DashboardTimetableSummary,
    pub server_time: String,
    pub authenticated: bool,
}
