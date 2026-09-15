use crate::auth::models::{
    AccountInfo, AuthResponse, DoubleAuthSubmitRequest, LoginRequest, QcmChallenge,
    QcmProposition,
};
use crate::client::EcoleDirecteHttpClient;
use crate::config::{get_auto_solve_2fa, get_ecoledirecte_password, get_ecoledirecte_username, APP_VERSION};
use crate::error::AppError;
use base64::prelude::*;
use serde_json::Value;
use std::sync::Arc;
use tracing::info;

#[derive(Debug, Clone)]
pub struct AuthService {
    http: Arc<EcoleDirecteHttpClient>,
}

impl AuthService {
    pub fn new(http: Arc<EcoleDirecteHttpClient>) -> Self {
        Self { http }
    }

    pub async fn login(&self, req: &LoginRequest) -> Result<AuthResponse, AppError> {
        self.http.clear_auth();

        self.http.bootstrap_gtk().await?;

        let login_payload = serde_json::json!({
            "identifiant": req.identifiant,
            "motdepasse": req.motdepasse,
            "isReLogin": false,
            "uuid": "",
            "fa": req.fa.clone().unwrap_or_default()
        });

        let endpoint = format!("login.awp?v={}", APP_VERSION);
        let resp = self
            .http
            .post_ed(&endpoint, "Auth", &login_payload, true, false)
            .await?;

        if resp.code == 200 {
            return self.process_success_auth(resp);
        }

        if resp.code == 250 {
            info!("Double auth required (code 250)");
            let challenge = self.fetch_qcm_challenge().await?;

            if req.auto_solve_2fa {
                if let Some(matching_choice) = self.try_auto_solve(&challenge) {
                    info!("Auto-solving 2FA challenge");
                    return self
                        .submit_double_auth(&DoubleAuthSubmitRequest {
                            choix: matching_choice.raw.clone(),
                            identifiant: req.identifiant.clone(),
                            motdepasse: req.motdepasse.clone(),
                        })
                        .await;
                }
            }

            return Ok(AuthResponse::DoubleAuthRequired {
                challenge,
                token: resp.token,
            });
        }

        Ok(AuthResponse::Error {
            code: resp.code,
            message: resp
                .message
                .unwrap_or_else(|| "Identifiant ou mot de passe invalide".to_string()),
        })
    }

    pub async fn fetch_qcm_challenge(&self) -> Result<QcmChallenge, AppError> {
        let endpoint = format!("connexion/doubleauth.awp?verbe=get&v={}", APP_VERSION);
        let empty_payload = serde_json::json!({});
        let resp = self
            .http
            .post_ed(&endpoint, "Auth", &empty_payload, false, true)
            .await?;

        if let Some(data) = resp.data {
            let q_b64 = data.get("question").and_then(|v| v.as_str()).unwrap_or("");
            let q_decoded = BASE64_STANDARD
                .decode(q_b64)
                .map(|b| String::from_utf8_lossy(&b).to_string())
                .unwrap_or_else(|_| q_b64.to_string());

            let mut props = Vec::new();
            if let Some(arr) = data.get("propositions").and_then(|v| v.as_array()) {
                for item in arr {
                    if let Some(p_b64) = item.as_str() {
                        let decoded = BASE64_STANDARD
                            .decode(p_b64)
                            .map(|b| String::from_utf8_lossy(&b).to_string())
                            .unwrap_or_else(|_| p_b64.to_string());
                        props.push(QcmProposition {
                            raw: p_b64.to_string(),
                            decoded,
                        });
                    }
                }
            }

            return Ok(QcmChallenge {
                question_raw: q_b64.to_string(),
                question_decoded: q_decoded,
                propositions: props,
            });
        }

        Err(AppError::EcoleDirecte {
            code: resp.code,
            message: resp.message.unwrap_or_else(|| "Impossible de charger le challenge 2FA".to_string()),
            data: None,
        })
    }

    pub fn try_auto_solve<'a>(&self, challenge: &'a QcmChallenge) -> Option<&'a QcmProposition> {
        let q = challenge.question_decoded.to_lowercase();
        let q_ascii = unidecode_lowercase(&q);

        for prop in &challenge.propositions {
            let p = prop.decoded.to_lowercase();
            let p_ascii = unidecode_lowercase(&p);

            if (q_ascii.contains("rouge") && (p_ascii.contains("rouge") || p_ascii.contains("red")))
                || (q_ascii.contains("bleu") && (p_ascii.contains("bleu") || p_ascii.contains("blue")))
                || (q_ascii.contains("vert") && (p_ascii.contains("vert") || p_ascii.contains("green")))
                || (q_ascii.contains("jaune") && (p_ascii.contains("jaune") || p_ascii.contains("yellow")))
                || (q_ascii.contains("noir") && (p_ascii.contains("noir") || p_ascii.contains("black")))
                || (q_ascii.contains("blanc") && (p_ascii.contains("blanc") || p_ascii.contains("white")))
                || (q_ascii.contains("orange") && p_ascii.contains("orange"))
                || (q_ascii.contains("rose") && (p_ascii.contains("rose") || p_ascii.contains("pink")))
            {
                return Some(prop);
            }

            if (q_ascii.contains("chien") && p_ascii.contains("chien"))
                || (q_ascii.contains("chat") && p_ascii.contains("chat"))
                || (q_ascii.contains("cheval") && p_ascii.contains("cheval"))
                || (q_ascii.contains("oiseau") && p_ascii.contains("oiseau"))
                || (q_ascii.contains("poisson") && p_ascii.contains("poisson"))
            {
                return Some(prop);
            }

            let q_tokens: Vec<&str> = q_ascii.split(|c: char| !c.is_alphanumeric()).filter(|s| s.len() > 3).collect();
            for tok in q_tokens {
                if p_ascii.contains(tok) {
                    return Some(prop);
                }
            }
        }

        challenge.propositions.first()
    }

    pub async fn submit_double_auth(
        &self,
        req: &DoubleAuthSubmitRequest,
    ) -> Result<AuthResponse, AppError> {
        let endpoint_post = format!("connexion/doubleauth.awp?verbe=post&v={}", APP_VERSION);
        let submit_payload = serde_json::json!({ "choix": req.choix });
        let resp = self
            .http
            .post_ed(&endpoint_post, "Auth", &submit_payload, false, true)
            .await?;

        if resp.code != 200 {
            return Ok(AuthResponse::Error {
                code: resp.code,
                message: resp
                    .message
                    .unwrap_or_else(|| "Échec de validation de la réponse 2FA".to_string()),
            });
        }

        let cn = resp
            .data
            .as_ref()
            .and_then(|d| d.get("cn"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let cv = resp
            .data
            .as_ref()
            .and_then(|d| d.get("cv"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        self.http.bootstrap_gtk().await?;

        let final_payload = serde_json::json!({
            "identifiant": req.identifiant,
            "motdepasse": req.motdepasse,
            "isReLogin": false,
            "uuid": "",
            "cn": cn,
            "cv": cv,
            "fa": [{ "cn": cn, "cv": cv, "uniq": false }]
        });

        let login_endpoint = format!("login.awp?v={}", APP_VERSION);
        let final_resp = self
            .http
            .post_ed(&login_endpoint, "Auth", &final_payload, true, true)
            .await?;

        if final_resp.code == 200 {
            return self.process_success_auth(final_resp);
        }

        if final_resp.code == 250 {
            let next_challenge = self.fetch_qcm_challenge().await?;
            return Ok(AuthResponse::DoubleAuthRequired {
                challenge: next_challenge,
                token: final_resp.token,
            });
        }

        Ok(AuthResponse::Error {
            code: final_resp.code,
            message: final_resp
                .message
                .unwrap_or_else(|| "Connexion finale échouée".to_string()),
        })
    }

    pub async fn reauthenticate(&self) -> Result<String, AppError> {
        info!("Authenticating using environment credentials...");
        self.http.clear_auth();

        let username = get_ecoledirecte_username();
        let password = get_ecoledirecte_password();
        let auto_solve = get_auto_solve_2fa();

        if username.is_empty() || password.is_empty() {
            return Err(AppError::Unauthorized(
                "ECOLEDIRECTE_USERNAME or ECOLEDIRECTE_PASSWORD environment variables are not set".to_string(),
            ));
        }

        let login_res = self
            .login(&LoginRequest {
                identifiant: username,
                motdepasse: password,
                auto_solve_2fa: auto_solve,
                fa: None,
            })
            .await?;

        match login_res {
            AuthResponse::Authenticated { token, .. } => Ok(token),
            AuthResponse::DoubleAuthRequired { .. } => {
                Err(AppError::Unauthorized("2FA challenge required but could not be auto-solved".to_string()))
            }
            AuthResponse::Error { message, .. } => Err(AppError::Unauthorized(message)),
        }
    }

    pub async fn ensure_authenticated(&self) -> Result<String, AppError> {
        if let Some(token) = self.http.get_token() {
            if !token.trim().is_empty() {
                return Ok(token);
            }
        }

        self.reauthenticate().await
    }

    pub fn get_current_session(&self) -> Option<AuthResponse> {
        let token = self.http.get_token()?;
        if token.trim().is_empty() {
            return None;
        }

        let saved = self.http.get_saved_accounts();
        let mut accounts = Vec::new();
        for val in &saved {
            if let Some(info) = parse_account_info(val) {
                accounts.push(info);
            }
        }

        if accounts.is_empty() {
            return None;
        }

        let current = accounts.first().cloned();
        Some(AuthResponse::Authenticated {
            token,
            accounts,
            current_account: current,
        })
    }

    fn process_success_auth(&self, resp: crate::client::RawApiResponse) -> Result<AuthResponse, AppError> {
        let token = resp
            .token
            .or_else(|| self.http.get_token())
            .unwrap_or_default();

        let mut accounts = Vec::new();
        if let Some(data) = &resp.data {
            if let Some(arr) = data.get("accounts").and_then(|a| a.as_array()) {
                self.http.set_saved_accounts(arr.clone());
                for acc_val in arr {
                    if let Some(info) = parse_account_info(acc_val) {
                        accounts.push(info);
                    }
                }
            }
        }

        let current = accounts.first().cloned();

        Ok(AuthResponse::Authenticated {
            token,
            accounts,
            current_account: current,
        })
    }
}

fn unidecode_lowercase(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            'à' | 'â' | 'ä' => 'a',
            'é' | 'è' | 'ê' | 'ë' => 'e',
            'î' | 'ï' => 'i',
            'ô' | 'ö' => 'o',
            'ù' | 'û' | 'ü' => 'u',
            'ç' => 'c',
            _ => c,
        })
        .collect()
}

fn parse_account_info(val: &Value) -> Option<AccountInfo> {
    let id = val.get("id")?.as_u64()?;
    let identifiant = val
        .get("identifiant")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let account_type = val
        .get("typeCompte")
        .and_then(|v| v.as_str())
        .unwrap_or("E")
        .to_string();
    let first_name = val
        .get("prenom")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let last_name = val
        .get("nom")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let email = val.get("email").and_then(|v| v.as_str()).map(|s| s.to_string());
    let establishment_name = val
        .get("nomEtablissement")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let is_main = val.get("main").and_then(|v| v.as_bool()).unwrap_or(true);
    let id_login = val.get("idLogin").and_then(|v| v.as_u64());
    let uid = val.get("uid").and_then(|v| v.as_str()).map(|s| s.to_string());

    let profile = val.get("profile");
    let class_name = profile
        .and_then(|p| p.get("classe"))
        .and_then(|c| c.get("libelle"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let class_code = profile
        .and_then(|p| p.get("classe"))
        .and_then(|c| c.get("code"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let photo_url = profile
        .and_then(|p| p.get("photo"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    Some(AccountInfo {
        id,
        id_login,
        uid,
        identifiant,
        account_type,
        first_name,
        last_name,
        email,
        establishment_name,
        class_name,
        class_code,
        photo_url,
        is_main,
    })
}
