use std::env;

pub const API_BASE: &str = "https://api.ecoledirecte.com";
pub const API_VERSION: &str = "v3";
pub const APP_VERSION: &str = "4.101.4";
pub const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

pub fn get_server_port() -> u16 {
    env::var("SERVER_PORT")
        .ok()
        .and_then(|v| v.parse::<u16>().ok())
        .unwrap_or(3001)
}

pub fn get_ecoledirecte_username() -> String {
    env::var("ECOLEDIRECTE_USERNAME").unwrap_or_default()
}

pub fn get_ecoledirecte_password() -> String {
    env::var("ECOLEDIRECTE_PASSWORD").unwrap_or_default()
}

pub fn get_ecoledirecte_student_id() -> Option<u64> {
    env::var("ECOLEDIRECTE_STUDENT_ID")
        .ok()
        .and_then(|v| v.parse::<u64>().ok())
}

pub fn get_auto_solve_2fa() -> bool {
    env::var("ECOLEDIRECTE_AUTO_SOLVE_2FA")
        .map(|v| v.to_lowercase() == "true" || v == "1")
        .unwrap_or(true)
}
