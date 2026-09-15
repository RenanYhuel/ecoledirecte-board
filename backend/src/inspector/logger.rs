use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::Arc;
use uuid::Uuid;

const MAX_LOG_ENTRIES: usize = 200;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiCallLog {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub category: String,
    pub method: String,
    pub url: String,
    pub request_headers: serde_json::Value,
    pub request_body: serde_json::Value,
    pub response_status: u16,
    pub ed_code: Option<u32>,
    pub duration_ms: u64,
    pub response_headers: serde_json::Value,
    pub raw_response: serde_json::Value,
    pub parsed_summary: Option<serde_json::Value>,
    pub is_error: bool,
}

#[derive(Debug, Clone)]
pub struct InspectorLogger {
    logs: Arc<RwLock<VecDeque<ApiCallLog>>>,
}

impl InspectorLogger {
    pub fn new() -> Self {
        Self {
            logs: Arc::new(RwLock::new(VecDeque::with_capacity(MAX_LOG_ENTRIES))),
        }
    }

    pub fn record(&self, mut log: ApiCallLog) {
        if log.id.is_empty() {
            log.id = Uuid::new_v4().to_string();
        }
        let mut logs = self.logs.write();
        if logs.len() >= MAX_LOG_ENTRIES {
            logs.pop_front();
        }
        logs.push_back(log);
    }

    pub fn get_logs(&self, limit: Option<usize>, category: Option<String>) -> Vec<ApiCallLog> {
        let logs = self.logs.read();
        let iter = logs.iter().rev();
        let filtered: Vec<ApiCallLog> = if let Some(cat) = category {
            iter.filter(|l| l.category.eq_ignore_ascii_case(&cat))
                .cloned()
                .collect()
        } else {
            iter.cloned().collect()
        };

        if let Some(lim) = limit {
            filtered.into_iter().take(lim).collect()
        } else {
            filtered
        }
    }

    pub fn clear(&self) {
        let mut logs = self.logs.write();
        logs.clear();
    }
}
