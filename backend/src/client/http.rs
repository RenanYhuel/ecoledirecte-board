use crate::config::{API_BASE, API_VERSION, APP_VERSION, USER_AGENT};
use crate::error::AppError;
use crate::inspector::{ApiCallLog, InspectorLogger};
use chrono::Utc;
use parking_lot::RwLock;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, ACCEPT, CONTENT_TYPE, COOKIE, USER_AGENT as REQ_UA};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;
use tracing::{info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RawApiResponse {
    pub code: u32,
    pub token: Option<String>,
    pub message: Option<String>,
    pub host: Option<String>,
    pub data: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StoredSession {
    pub token: Option<String>,
    pub gtk: Option<String>,
    pub two_fa_token: Option<String>,
    pub cookies: HashMap<String, String>,
    pub accounts: Vec<Value>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Clone)]
pub struct EcoleDirecteHttpClient {
    client: reqwest::Client,
    cookies: Arc<RwLock<HashMap<String, String>>>,
    x_gtk: Arc<RwLock<Option<String>>>,
    x_token: Arc<RwLock<Option<String>>>,
    two_fa_token: Arc<RwLock<Option<String>>>,
    saved_accounts: Arc<RwLock<Vec<Value>>>,
    session_path: PathBuf,
    inspector: Arc<InspectorLogger>,
}

impl EcoleDirecteHttpClient {
    pub fn new(inspector: Arc<InspectorLogger>) -> Self {
        let client = reqwest::Client::builder()
            .danger_accept_invalid_certs(true)
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());

        let session_path = PathBuf::from("session.json");

        let mut instance = Self {
            client,
            cookies: Arc::new(RwLock::new(HashMap::new())),
            x_gtk: Arc::new(RwLock::new(None)),
            x_token: Arc::new(RwLock::new(None)),
            two_fa_token: Arc::new(RwLock::new(None)),
            saved_accounts: Arc::new(RwLock::new(Vec::new())),
            session_path,
            inspector,
        };

        instance.load_session();
        instance
    }

    pub fn set_saved_accounts(&self, accounts: Vec<Value>) {
        *self.saved_accounts.write() = accounts;
        self.save_session();
    }

    pub fn get_saved_accounts(&self) -> Vec<Value> {
        self.saved_accounts.read().clone()
    }

    pub fn set_token(&self, token: String) {
        let mut t = self.x_token.write();
        *t = Some(token);
        drop(t);
        self.save_session();
    }

    pub fn get_token(&self) -> Option<String> {
        self.x_token.read().clone()
    }

    pub fn set_gtk(&self, gtk: String) {
        let mut g = self.x_gtk.write();
        *g = Some(gtk);
        drop(g);
        self.save_session();
    }

    pub fn get_gtk(&self) -> Option<String> {
        self.x_gtk.read().clone()
    }

    pub fn clear_auth(&self) {
        *self.x_token.write() = None;
        *self.x_gtk.write() = None;
        *self.two_fa_token.write() = None;
        self.cookies.write().clear();
        self.saved_accounts.write().clear();
        let _ = fs::remove_file(&self.session_path);
    }

    fn save_session(&self) {
        let session = StoredSession {
            token: self.x_token.read().clone(),
            gtk: self.x_gtk.read().clone(),
            two_fa_token: self.two_fa_token.read().clone(),
            cookies: self.cookies.read().clone(),
            accounts: self.saved_accounts.read().clone(),
            updated_at: Some(Utc::now().to_rfc3339()),
        };

        if let Ok(json) = serde_json::to_string_pretty(&session) {
            let _ = fs::write(&self.session_path, json);
        }
    }

    fn load_session(&mut self) {
        if let Ok(content) = fs::read_to_string(&self.session_path) {
            if let Ok(session) = serde_json::from_str::<StoredSession>(&content) {
                if let Some(tok) = session.token {
                    *self.x_token.write() = Some(tok);
                }
                if let Some(gtk) = session.gtk {
                    *self.x_gtk.write() = Some(gtk);
                }
                if let Some(two_fa) = session.two_fa_token {
                    *self.two_fa_token.write() = Some(two_fa);
                }
                *self.cookies.write() = session.cookies;
                *self.saved_accounts.write() = session.accounts;
            }
        }
    }

    fn build_cookie_header(&self) -> String {
        let cookies = self.cookies.read();
        cookies
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect::<Vec<_>>()
            .join("; ")
    }

    fn ingest_cookies(&self, headers: &HeaderMap) {
        let mut cookies = self.cookies.write();
        let mut changed = false;
        for cookie_val in headers.get_all("set-cookie") {
            if let Ok(cookie_str) = cookie_val.to_str() {
                for part in cookie_str.split(';') {
                    let part = part.trim();
                    if let Some((k, v)) = part.split_once('=') {
                        let key = k.trim().to_string();
                        let val = v.trim().to_string();
                        if !key.eq_ignore_ascii_case("path")
                            && !key.eq_ignore_ascii_case("domain")
                            && !key.eq_ignore_ascii_case("expires")
                            && !key.eq_ignore_ascii_case("samesite")
                            && !key.eq_ignore_ascii_case("secure")
                            && !key.eq_ignore_ascii_case("httponly")
                        {
                            cookies.insert(key, val);
                            changed = true;
                        }
                    }
                    break;
                }
            }
        }
        drop(cookies);
        if changed {
            self.save_session();
        }
    }

    fn capture_headers(&self, headers: &HeaderMap) {
        self.ingest_cookies(headers);
        if let Some(gtk) = headers.get("x-gtk").and_then(|h| h.to_str().ok()) {
            *self.x_gtk.write() = Some(gtk.to_string());
        }
        if let Some(token) = headers.get("x-token").and_then(|h| h.to_str().ok()) {
            if !token.trim().is_empty() {
                *self.x_token.write() = Some(token.to_string());
            }
        }
        if let Some(two_fa) = headers.get("2fa-token").and_then(|h| h.to_str().ok()) {
            *self.two_fa_token.write() = Some(two_fa.to_string());
        }
        self.save_session();
    }

    fn build_headers(&self, include_gtk: bool, include_token: bool) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(REQ_UA, HeaderValue::from_static(USER_AGENT));
        headers.insert(ACCEPT, HeaderValue::from_static("application/json, text/plain, */*"));

        let cookie_str = self.build_cookie_header();
        if !cookie_str.is_empty() {
            if let Ok(val) = HeaderValue::from_str(&cookie_str) {
                headers.insert(COOKIE, val);
            }
        }

        if include_gtk {
            let gtk_opt = self.x_gtk.read().clone().or_else(|| self.cookies.read().get("GTK").cloned());
            if let Some(gtk) = gtk_opt {
                if let Ok(val) = HeaderValue::from_str(&gtk) {
                    headers.insert(HeaderName::from_static("x-gtk"), val);
                }
            }
        }

        if include_token {
            if let Some(token) = self.x_token.read().clone() {
                if let Ok(val) = HeaderValue::from_str(&token) {
                    headers.insert(HeaderName::from_static("x-token"), val);
                }
            }
        }

        if let Some(two_fa) = self.two_fa_token.read().clone() {
            if let Ok(val) = HeaderValue::from_str(&two_fa) {
                headers.insert(HeaderName::from_static("2fa-token"), val);
            }
        }

        headers
    }

    pub async fn bootstrap_gtk(&self) -> Result<String, AppError> {
        let url = format!("{}/{}/login.awp?gtk=1&v={}", API_BASE, API_VERSION, APP_VERSION);
        let start = Instant::now();
        let headers = self.build_headers(false, false);

        let mut header_json = serde_json::Map::new();
        for (k, v) in &headers {
            header_json.insert(k.to_string(), Value::String(v.to_str().unwrap_or("").to_string()));
        }

        info!("[ED REQUEST] GET {} (bootstrap gtk)", url);
        let resp = self.client.get(&url).headers(headers).send().await?;
        let duration_ms = start.elapsed().as_millis() as u64;
        let status = resp.status().as_u16();
        let resp_headers = resp.headers().clone();
        self.capture_headers(&resp_headers);

        let resp_body = resp.text().await.unwrap_or_default();
        let raw_json: Value = serde_json::from_str(&resp_body).unwrap_or(Value::String(resp_body.clone()));

        let mut resp_header_json = serde_json::Map::new();
        for (k, v) in &resp_headers {
            resp_header_json.insert(k.to_string(), Value::String(v.to_str().unwrap_or("").to_string()));
        }

        let gtk = self
            .x_gtk
            .read()
            .clone()
            .or_else(|| self.cookies.read().get("GTK").cloned())
            .unwrap_or_default();

        info!("[ED RESPONSE] GET {} -> HTTP {} ({}ms, gtk_present={})", url, status, duration_ms, !gtk.is_empty());

        self.inspector.record(ApiCallLog {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            category: "Auth".to_string(),
            method: "GET".to_string(),
            url: url.clone(),
            request_headers: Value::Object(header_json),
            request_body: Value::Null,
            response_status: status,
            ed_code: Some(200),
            duration_ms,
            response_headers: Value::Object(resp_header_json),
            raw_response: raw_json,
            parsed_summary: Some(serde_json::json!({ "gtk_extracted": !gtk.is_empty() })),
            is_error: status >= 400,
        });

        Ok(gtk)
    }

    pub async fn post_ed<T: Serialize>(
        &self,
        endpoint_relative_or_full: &str,
        category: &str,
        payload: &T,
        include_gtk: bool,
        include_token: bool,
    ) -> Result<RawApiResponse, AppError> {
        let url = if endpoint_relative_or_full.starts_with("http://") || endpoint_relative_or_full.starts_with("https://") {
            endpoint_relative_or_full.to_string()
        } else {
            let clean = endpoint_relative_or_full.trim_start_matches('/');
            format!("{}/{}/{}", API_BASE, API_VERSION, clean)
        };

        let start = Instant::now();
        let mut headers = self.build_headers(include_gtk, include_token);
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/x-www-form-urlencoded"));

        let payload_json_val = serde_json::to_value(payload)?;
        let json_str = serde_json::to_string(payload)?;
        let post_body = format!("data={}", urlencoding::encode(&json_str));

        let mut header_json = serde_json::Map::new();
        for (k, v) in &headers {
            header_json.insert(k.to_string(), Value::String(v.to_str().unwrap_or("").to_string()));
        }

        info!("[ED REQUEST] [{}] POST {} (has_token={}, has_gtk={})", category, url, include_token, include_gtk);

        let resp = self
            .client
            .post(&url)
            .headers(headers)
            .body(post_body)
            .send()
            .await?;

        let duration_ms = start.elapsed().as_millis() as u64;
        let status = resp.status().as_u16();
        let resp_headers = resp.headers().clone();
        self.capture_headers(&resp_headers);

        let resp_body = resp.text().await.unwrap_or_default();
        let raw_api: RawApiResponse = serde_json::from_str(&resp_body).unwrap_or(RawApiResponse {
            code: status as u32,
            token: None,
            message: Some(resp_body.clone()),
            host: None,
            data: None,
        });

        info!(
            "[ED RESPONSE] [{}] POST {} -> HTTP {} | ED Code {} | Message: \"{}\" | Data: {} ({}ms)",
            category,
            url,
            status,
            raw_api.code,
            raw_api.message.as_deref().unwrap_or(""),
            if raw_api.data.is_some() { "present" } else { "none" },
            duration_ms
        );

        if raw_api.code != 200 && raw_api.code != 250 {
            warn!(
                "[ED WARNING] [{}] Code {} returned for {}: \"{}\" | Body: {}",
                category,
                raw_api.code,
                url,
                raw_api.message.as_deref().unwrap_or(""),
                resp_body
            );
        }

        if let Some(token) = &raw_api.token {
            if !token.trim().is_empty() {
                self.set_token(token.clone());
            }
        }

        let mut resp_header_json = serde_json::Map::new();
        for (k, v) in &resp_headers {
            resp_header_json.insert(k.to_string(), Value::String(v.to_str().unwrap_or("").to_string()));
        }

        let is_err = raw_api.code != 200 && raw_api.code != 250;

        self.inspector.record(ApiCallLog {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            category: category.to_string(),
            method: "POST".to_string(),
            url: url.clone(),
            request_headers: Value::Object(header_json),
            request_body: payload_json_val,
            response_status: status,
            ed_code: Some(raw_api.code),
            duration_ms,
            response_headers: Value::Object(resp_header_json),
            raw_response: serde_json::to_value(&raw_api).unwrap_or(Value::String(resp_body)),
            parsed_summary: None,
            is_error: is_err,
        });

        if let Some(tok) = &raw_api.token {
            if !tok.trim().is_empty() {
                self.set_token(tok.clone());
            }
        }

        Ok(raw_api)
    }
}
