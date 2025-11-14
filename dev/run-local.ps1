#!/usr/bin/env pwsh
# Start a simple static server serving the repo root so you can open
# http://localhost:8080/dev/local-settings.html

Set-StrictMode -Version Latest

Push-Location -Path (Join-Path $PSScriptRoot "..")
Write-Host "Serving repository root at http://localhost:8080"
Write-Host "Open: http://localhost:8080/dev/local-settings.html"

# Use npx http-server if available, otherwise fallback to Python HTTP server
try {
    npx http-server -p 8080 -c-1
}
catch {
    Write-Host "npx http-server not available; trying Python http.server (requires Python)."
    python -m http.server 8080
}

Pop-Location
