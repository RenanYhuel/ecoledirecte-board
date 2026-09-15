mod auth;
mod client;
mod config;
mod error;
mod inspector;
mod modules;
mod routes;

use auth::AuthService;
use client::EcoleDirecteHttpClient;
use config::get_server_port;
use inspector::InspectorLogger;
use modules::{
    dashboard::{routes as dashboard_routes, DashboardService},
    homework::{routes as homework_routes, HomeworkService},
    messages::{routes as messages_routes, MessagesService},
    notes::{routes as notes_routes, NotesService},
    school_life::{routes as school_life_routes, SchoolLifeService},
    student::{routes as student_routes, StudentService},
    timetable::{routes as timetable_routes, TimetableService},
};
use routes::{
    auth_routes::{auth_status_handler, double_auth_submit_handler, login_handler, logout_handler, AuthAppState},
    inspector_routes::{clear_logs_handler, execute_raw_request_handler, get_logs_handler, InspectorAppState},
};

use axum::{
    routing::{get, post, put},
    Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    dotenvy::from_filename("../.env").ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting EcoleDirecte Proxy & Parser Backend...");

    let inspector = Arc::new(InspectorLogger::new());
    let http_client = Arc::new(EcoleDirecteHttpClient::new(inspector.clone()));

    let auth_service = Arc::new(AuthService::new(http_client.clone()));
    let student_service = Arc::new(StudentService::new(http_client.clone()));
    let notes_service = Arc::new(NotesService::new(http_client.clone()));
    let timetable_service = Arc::new(TimetableService::new(http_client.clone()));
    let homework_service = Arc::new(HomeworkService::new(http_client.clone()));
    let school_life_service = Arc::new(SchoolLifeService::new(http_client.clone()));
    let messages_service = Arc::new(MessagesService::new(http_client.clone()));

    let dashboard_service = Arc::new(DashboardService::new(
        http_client.clone(),
        auth_service.clone(),
        student_service.clone(),
        notes_service.clone(),
        timetable_service.clone(),
        homework_service.clone(),
        school_life_service.clone(),
        messages_service.clone(),
    ));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let auth_app_state = AuthAppState {
        auth_service: auth_service.clone(),
        http_client: http_client.clone(),
    };

    let auth_router = Router::new()
        .route("/login", post(login_handler))
        .route("/status", get(auth_status_handler))
        .route("/doubleauth", post(double_auth_submit_handler))
        .route("/logout", post(logout_handler))
        .with_state(auth_app_state);

    let inspector_app_state = InspectorAppState {
        logger: inspector.clone(),
        http_client: http_client.clone(),
    };

    let inspector_router = Router::new()
        .route("/logs", get(get_logs_handler))
        .route("/logs", axum::routing::delete(clear_logs_handler))
        .route("/raw", post(execute_raw_request_handler))
        .with_state(inspector_app_state);

    let dashboard_router = Router::new()
        .route("/overview", get(dashboard_routes::get_dashboard_overview))
        .with_state(dashboard_service);

    let student_router = Router::new()
        .route("/:id/timeline", get(student_routes::get_student_timeline))
        .with_state(student_service);

    let notes_router = Router::new()
        .route("/:id", get(notes_routes::get_student_notes))
        .with_state(notes_service);

    let timetable_router = Router::new()
        .route("/:id", get(timetable_routes::get_student_timetable))
        .with_state(timetable_service);

    let homework_router = Router::new()
        .route("/:id", get(homework_routes::get_student_homework))
        .route("/:id/:date", get(homework_routes::get_student_homework_day))
        .route("/:id/toggle", put(homework_routes::toggle_student_homework))
        .with_state(homework_service);

    let school_life_router = Router::new()
        .route("/:id", get(school_life_routes::get_student_school_life))
        .with_state(school_life_service);

    let messages_router = Router::new()
        .route("/:id", get(messages_routes::get_student_messages))
        .route("/:id/:msg_id", get(messages_routes::get_student_message_detail))
        .route("/:id/:msg_id/read", put(messages_routes::toggle_student_message_read))
        .route("/:id/:msg_id/toggle", put(messages_routes::toggle_student_message_read))
        .with_state(messages_service);

    let app = Router::new()
        .nest("/api/auth", auth_router)
        .nest("/api/inspector", inspector_router)
        .nest("/api/dashboard", dashboard_router)
        .nest("/api/student", student_router)
        .nest("/api/notes", notes_router)
        .nest("/api/timetable", timetable_router)
        .nest("/api/homework", homework_router)
        .nest("/api/school-life", school_life_router)
        .nest("/api/messages", messages_router)
        .layer(cors);

    let port = get_server_port();
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Backend running and listening on http://localhost:{}", port);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
