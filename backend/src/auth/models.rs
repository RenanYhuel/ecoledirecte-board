use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub identifiant: String,
    pub motdepasse: String,
    pub fa: Option<Vec<LoginFactor>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginFactor {
    pub cn: String,
    pub cv: String,
    #[serde(default)]
    pub uniq: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QcmProposition {
    pub raw: String,
    pub decoded: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QcmChallenge {
    pub question_raw: String,
    pub question_decoded: String,
    pub propositions: Vec<QcmProposition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoubleAuthSubmitRequest {
    pub choix: String,
    #[serde(default)]
    pub identifiant: Option<String>,
    #[serde(default)]
    pub motdepasse: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountInfo {
    pub id: u64,
    pub id_login: Option<u64>,
    pub uid: Option<String>,
    pub identifiant: String,
    pub account_type: String,
    pub first_name: String,
    pub last_name: String,
    pub email: Option<String>,
    pub establishment_name: Option<String>,
    pub class_name: Option<String>,
    pub class_code: Option<String>,
    pub photo_url: Option<String>,
    pub is_main: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status")]
pub enum AuthResponse {
    #[serde(rename = "authenticated")]
    Authenticated {
        token: String,
        accounts: Vec<AccountInfo>,
        current_account: Option<AccountInfo>,
    },
    #[serde(rename = "double_auth_required")]
    DoubleAuthRequired {
        challenge: QcmChallenge,
        token: Option<String>,
    },
    #[serde(rename = "error")]
    Error {
        code: u32,
        message: String,
    },
}
