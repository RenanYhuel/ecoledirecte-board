$cargoPath = "$env:USERPROFILE\.cargo\bin\cargo.exe"
if (Test-Path $cargoPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$cargoPath' run --manifest-path backend/Cargo.toml"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cargo run --manifest-path backend/Cargo.toml"
}
Start-Sleep -Seconds 2
npm --prefix dashboard run dev
