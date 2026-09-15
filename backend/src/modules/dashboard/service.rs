use crate::auth::models::AccountInfo;
use crate::auth::service::AuthService;
use crate::client::EcoleDirecteHttpClient;
use crate::config::get_ecoledirecte_student_id;
use crate::error::AppError;
use crate::modules::dashboard::models::{
    DashboardHomeworkSummary, DashboardMessagesSummary, DashboardNotesSummary,
    DashboardOverview, DashboardSchoolLifeSummary, DashboardTimetableSummary,
};
use crate::modules::homework::HomeworkService;
use crate::modules::messages::MessagesService;
use crate::modules::notes::NotesService;
use crate::modules::school_life::SchoolLifeService;
use crate::modules::student::StudentService;
use crate::modules::timetable::models::CourseSlot;
use crate::modules::timetable::TimetableService;
use chrono::Utc;
use std::sync::Arc;
use tracing::warn;

#[derive(Clone)]
pub struct DashboardService {
    http: Arc<EcoleDirecteHttpClient>,
    auth_service: Arc<AuthService>,
    _student_service: Arc<StudentService>,
    notes_service: Arc<NotesService>,
    timetable_service: Arc<TimetableService>,
    homework_service: Arc<HomeworkService>,
    school_life_service: Arc<SchoolLifeService>,
    messages_service: Arc<MessagesService>,
}

impl DashboardService {
    pub fn new(
        http: Arc<EcoleDirecteHttpClient>,
        auth_service: Arc<AuthService>,
        student_service: Arc<StudentService>,
        notes_service: Arc<NotesService>,
        timetable_service: Arc<TimetableService>,
        homework_service: Arc<HomeworkService>,
        school_life_service: Arc<SchoolLifeService>,
        messages_service: Arc<MessagesService>,
    ) -> Self {
        Self {
            http,
            auth_service,
            _student_service: student_service,
            notes_service,
            timetable_service,
            homework_service,
            school_life_service,
            messages_service,
        }
    }

    pub async fn get_overview(&self, explicit_student_id: Option<u64>) -> Result<DashboardOverview, AppError> {
        self.auth_service.ensure_authenticated().await?;

        let session = self.auth_service.get_current_session();
        let student_account = match &session {
            Some(crate::auth::models::AuthResponse::Authenticated { current_account, accounts, .. }) => {
                current_account.clone().or_else(|| accounts.first().cloned())
            }
            _ => None,
        };

        let student = student_account.ok_or_else(|| {
            AppError::Unauthorized("Aucun compte élève disponible dans la session ÉcoleDirecte".to_string())
        })?;

        let student_id = explicit_student_id
            .or_else(|| get_ecoledirecte_student_id())
            .unwrap_or(student.id);

        let now = chrono::Local::now();
        let today_str = now.format("%Y-%m-%d").to_string();
        let tomorrow = now + chrono::Duration::days(1);
        let tomorrow_str = tomorrow.format("%Y-%m-%d").to_string();

        let notes_fut = self.notes_service.get_notes(student_id, None);
        let homework_fut = self.homework_service.get_homework(student_id);
        let school_life_fut = self.school_life_service.get_school_life(student_id);
        let messages_fut = self.messages_service.get_messages(student_id);
        let timetable_fut = self.timetable_service.get_timetable(student_id, &today_str, &tomorrow_str, true);

        let (mut notes_res, mut homework_res, mut school_life_res, mut messages_res, mut timetable_res) =
            tokio::join!(notes_fut, homework_fut, school_life_fut, messages_fut, timetable_fut);

        fn is_520<T>(res: &Result<T, AppError>) -> bool {
            match res {
                Err(AppError::EcoleDirecte { code: 520, .. }) => true,
                _ => false,
            }
        }

        if is_520(&notes_res) || is_520(&homework_res) || is_520(&school_life_res) || is_520(&messages_res) || is_520(&timetable_res) {
            warn!("Token expired during overview fetch, reauthenticating and retrying...");
            if self.auth_service.reauthenticate().await.is_ok() {
                let n_fut = self.notes_service.get_notes(student_id, None);
                let h_fut = self.homework_service.get_homework(student_id);
                let s_fut = self.school_life_service.get_school_life(student_id);
                let m_fut = self.messages_service.get_messages(student_id);
                let t_fut = self.timetable_service.get_timetable(student_id, &today_str, &tomorrow_str, true);
                let (nr, hr, sr, mr, tr) = tokio::join!(n_fut, h_fut, s_fut, m_fut, t_fut);
                notes_res = nr;
                homework_res = hr;
                school_life_res = sr;
                messages_res = mr;
                timetable_res = tr;
            }
        }

        let notes_summary = match notes_res {
            Ok(overview) => {
                let mut grades = overview.grades;
                grades.sort_by(|a, b| b.date.cmp(&a.date));

                let (gen_avg, class_avg) = if let Some(last_period) = overview.periods.last() {
                    (last_period.student_avg, last_period.class_avg)
                } else {
                    (None, None)
                };

                DashboardNotesSummary {
                    periods: overview.periods,
                    recent_grades: grades,
                    general_average: gen_avg,
                    class_average: class_avg,
                }
            }
            Err(e) => {
                warn!("Dashboard: Failed to load notes: {}", e);
                DashboardNotesSummary {
                    periods: Vec::new(),
                    recent_grades: Vec::new(),
                    general_average: None,
                    class_average: None,
                }
            }
        };

        let homework_summary = match homework_res {
            Ok(days) => {
                let mut enriched_days = Vec::new();
                let mut pending = 0;
                let mut done = 0;

                for (idx, day) in days.iter().enumerate() {
                    if idx < 5 {
                        if let Ok(detailed) = self.homework_service.get_day_detail(student_id, &day.date).await {
                            for item in &detailed.items {
                                if item.is_done {
                                    done += 1;
                                } else {
                                    pending += 1;
                                }
                            }
                            enriched_days.push(detailed);
                            continue;
                        }
                    }

                    for item in &day.items {
                        if item.is_done {
                            done += 1;
                        } else {
                            pending += 1;
                        }
                    }
                    enriched_days.push(day.clone());
                }

                DashboardHomeworkSummary {
                    days: enriched_days,
                    pending_count: pending,
                    done_count: done,
                }
            }
            Err(e) => {
                warn!("Dashboard: Failed to load homework: {}", e);
                DashboardHomeworkSummary {
                    days: Vec::new(),
                    pending_count: 0,
                    done_count: 0,
                }
            }
        };

        let school_life_summary = match school_life_res {
            Ok(overview) => {
                let mut total_abs = 0;
                let mut total_lat = 0;
                let mut unjustified = 0;

                for item in &overview.absences_retards {
                    let is_retard = item.item_type.to_lowercase().contains("retard");
                    if is_retard {
                        total_lat += 1;
                    } else {
                        total_abs += 1;
                    }
                    if !item.is_justified {
                        unjustified += 1;
                    }
                }

                DashboardSchoolLifeSummary {
                    absences_retards: overview.absences_retards,
                    sanctions: overview.sanctions,
                    total_absences: total_abs,
                    total_lateness: total_lat,
                    unjustified_count: unjustified,
                }
            }
            Err(e) => {
                warn!("Dashboard: Failed to load school life: {}", e);
                DashboardSchoolLifeSummary {
                    absences_retards: Vec::new(),
                    sanctions: Vec::new(),
                    total_absences: 0,
                    total_lateness: 0,
                    unjustified_count: 0,
                }
            }
        };

        let messages_summary = match messages_res {
            Ok(overview) => {
                let unread = overview.received.iter().filter(|m| !m.is_read).count();
                DashboardMessagesSummary {
                    received: overview.received,
                    unread_count: unread,
                }
            }
            Err(e) => {
                warn!("Dashboard: Failed to load messages: {}", e);
                DashboardMessagesSummary {
                    received: Vec::new(),
                    unread_count: 0,
                }
            }
        };

        let timetable_summary = match timetable_res {
            Ok(slots) => {
                let now_str = now.format("%Y-%m-%d %H:%M").to_string();
                let today_slots: Vec<CourseSlot> = slots
                    .iter()
                    .filter(|s| s.start_date.starts_with(&today_str))
                    .cloned()
                    .collect();
                let tomorrow_slots: Vec<CourseSlot> = slots
                    .iter()
                    .filter(|s| s.start_date.starts_with(&tomorrow_str))
                    .cloned()
                    .collect();

                let next_slot = today_slots
                    .iter()
                    .find(|s| !s.is_cancelled && s.end_date.as_str() >= now_str.as_str())
                    .cloned();

                DashboardTimetableSummary {
                    today: today_slots,
                    tomorrow: tomorrow_slots,
                    next_slot,
                }
            }
            Err(e) => {
                warn!("Dashboard: Failed to load timetable: {}", e);
                DashboardTimetableSummary {
                    today: Vec::new(),
                    tomorrow: Vec::new(),
                    next_slot: None,
                }
            }
        };

        let server_time = Utc::now().to_rfc3339();
        let authenticated = self.http.get_token().is_some();

        Ok(DashboardOverview {
            student: Some(student),
            notes: notes_summary,
            homework: homework_summary,
            school_life: school_life_summary,
            messages: messages_summary,
            timetable: timetable_summary,
            server_time,
            authenticated,
        })
    }
}
