use crate::client::EcoleDirecteHttpClient;
use crate::config::APP_VERSION;
use crate::error::AppError;
use crate::modules::notes::models::{Grade, NotesOverview, Period, SubjectAverage};
use serde_json::Value;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct NotesService {
    http: Arc<EcoleDirecteHttpClient>,
}

impl NotesService {
    pub fn new(http: Arc<EcoleDirecteHttpClient>) -> Self {
        Self { http }
    }

    pub async fn get_notes(&self, student_id: u64, annee_scolaire: Option<String>) -> Result<NotesOverview, AppError> {
        let endpoint = format!("eleves/{}/notes.awp?verbe=get&v={}", student_id, APP_VERSION);
        let payload = serde_json::json!({
            "anneeScolaire": annee_scolaire.unwrap_or_default()
        });

        let resp = self
            .http
            .post_ed(&endpoint, "Notes", &payload, false, true)
            .await?;

        if resp.code != 200 {
            return Err(AppError::EcoleDirecte {
                code: resp.code,
                message: resp.message.unwrap_or_else(|| "Erreur lors de la récupération des notes".to_string()),
                data: resp.data,
            });
        }

        let data = resp.data.unwrap_or_default();
        let periods = parse_periods(&data);
        let grades = parse_grades(&data);

        Ok(NotesOverview { periods, grades })
    }
}

fn parse_french_float(val: &Value) -> Option<f64> {
    if let Some(n) = val.as_f64() {
        return Some(n);
    }
    if let Some(s) = val.as_str() {
        let clean = s.trim().replace(',', ".");
        return clean.parse::<f64>().ok();
    }
    None
}

fn parse_periods(data: &Value) -> Vec<Period> {
    let mut periods = Vec::new();
    if let Some(arr) = data.get("periodes").and_then(|p| p.as_array()) {
        for p in arr {
            let id = p.get("idPeriode").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let code = p.get("codePeriode").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let name = p.get("periode").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let is_annual = p.get("annuel").and_then(|v| v.as_bool()).unwrap_or(false);
            let start_date = p.get("dateDebut").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let end_date = p.get("dateFin").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let is_closed = p.get("cloture").and_then(|v| v.as_bool()).unwrap_or(false);

            let em = p.get("ensembleMatieres");
            let student_avg = em.and_then(|e| e.get("moyenneGenerale")).and_then(parse_french_float);
            let class_avg = em.and_then(|e| e.get("moyenneClasse")).and_then(parse_french_float);
            let class_min = em.and_then(|e| e.get("moyenneMin")).and_then(parse_french_float);
            let class_max = em.and_then(|e| e.get("moyenneMax")).and_then(parse_french_float);
            let main_teacher = em.and_then(|e| e.get("nomPP")).and_then(|v| v.as_str()).map(|s| s.to_string());

            let mut subjects = Vec::new();
            if let Some(disc_arr) = em.and_then(|e| e.get("disciplines")).and_then(|d| d.as_array()) {
                for d in disc_arr {
                    let disc_id = d.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
                    let subject_code = d.get("codeMatiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let subject_name = d.get("discipline").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let s_avg = d.get("moyenne").and_then(parse_french_float);
                    let c_avg = d.get("moyenneClasse").and_then(parse_french_float);
                    let c_min = d.get("moyenneMin").and_then(parse_french_float);
                    let c_max = d.get("moyenneMax").and_then(parse_french_float);
                    let coef = d.get("coef").and_then(parse_french_float).unwrap_or(1.0);

                    let mut teachers = Vec::new();
                    if let Some(profs) = d.get("professeurs").and_then(|p| p.as_array()) {
                        for prof in profs {
                            if let Some(nom) = prof.get("nom").and_then(|v| v.as_str()) {
                                teachers.push(nom.to_string());
                            }
                        }
                    }

                    subjects.push(SubjectAverage {
                        id: disc_id,
                        subject_code,
                        subject_name,
                        student_avg: s_avg,
                        class_avg: c_avg,
                        class_min: c_min,
                        class_max: c_max,
                        coef,
                        teachers,
                    });
                }
            }

            periods.push(Period {
                id,
                code,
                name,
                is_annual,
                start_date,
                end_date,
                is_closed,
                student_avg,
                class_avg,
                class_min,
                class_max,
                main_teacher,
                subjects,
            });
        }
    }
    periods
}

fn parse_grades(data: &Value) -> Vec<Grade> {
    let mut grades = Vec::new();
    if let Some(arr) = data.get("notes").and_then(|n| n.as_array()) {
        for n in arr {
            let id = n.get("id").and_then(|v| v.as_u64()).unwrap_or(0);
            let title = n.get("devoir").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let subject_code = n.get("codeMatiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let subject_name = n.get("libelleMatiere").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let period_code = n.get("codePeriode").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let duty_type = n.get("typeDevoir").and_then(|v| v.as_str()).map(|s| s.to_string());
            let value = n.get("valeur").and_then(parse_french_float);
            let value_str = n.get("valeur").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let out_of = n.get("noteSur").and_then(parse_french_float);
            let out_of_str = n.get("noteSur").and_then(|v| v.as_str()).unwrap_or("20").to_string();
            let coef = n.get("coef").and_then(parse_french_float).unwrap_or(1.0);
            let class_avg = n.get("moyenneClasse").and_then(parse_french_float);
            let class_min = n.get("minClasse").and_then(parse_french_float);
            let class_max = n.get("maxClasse").and_then(parse_french_float);
            let date = n.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let comment = n.get("commentaire").and_then(|v| v.as_str()).map(|s| s.to_string());
            let non_significant = n.get("nonSignificatif").and_then(|v| v.as_bool()).unwrap_or(false);

            grades.push(Grade {
                id,
                title,
                subject_code,
                subject_name,
                period_code,
                duty_type,
                value,
                value_str,
                out_of,
                out_of_str,
                coef,
                class_avg,
                class_min,
                class_max,
                date,
                comment,
                non_significant,
            });
        }
    }
    grades
}
