$cargoPath = "$env:USERPROFILE\.cargo\bin\cargo.exe"
if (Test-Path $cargoPath) {
    & $cargoPath run --manifest-path backend/Cargo.toml
} else {
    cargo run --manifest-path backend/Cargo.toml
}
