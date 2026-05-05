#!/usr/bin/env pwsh

# Minimal and parser-safe feature validation script

$api = "http://localhost:5000/api"
$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [int[]]$ExpectedStatus = @(200)
    )

    $url = "$api$Endpoint"
    try {
        $response = Invoke-WebRequest -Uri $url -Method $Method -UseBasicParsing -ErrorAction Stop
        $ok = $response.StatusCode -in $ExpectedStatus
        $color = if ($ok) { "Green" } else { "Red" }
        $label = if ($ok) { "PASS" } else { "FAIL" }
        Write-Host "$label | $Name | Status: $($response.StatusCode)" -ForegroundColor $color
        return @{ Name = $Name; Status = $ok; Code = $response.StatusCode; Url = $url }
    }
    catch {
        $statusCode = "ERROR"
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        $ok = $statusCode -in $ExpectedStatus
        $color = if ($ok) { "Green" } else { "Red" }
        $label = if ($ok) { "PASS" } else { "FAIL" }
        Write-Host "$label | $Name | Status: $statusCode" -ForegroundColor $color
        return @{ Name = $Name; Status = $ok; Code = $statusCode; Url = $url }
    }
}

Write-Host "Career Intelligence Portal - Feature Validation" -ForegroundColor Cyan
Write-Host "API Base: $api" -ForegroundColor DarkCyan
Write-Host ""

$checks = @(
    # 503 when MongoDB is unavailable is valid degraded-mode behavior
    @{ Name = "API Health"; Method = "GET"; Endpoint = "/health"; ExpectedStatus = @(200, 503) },
    @{ Name = "Auth Status"; Method = "GET"; Endpoint = "/auth/status"; ExpectedStatus = @(200) },
    @{ Name = "Contact Route Reachable"; Method = "POST"; Endpoint = "/contact/send-message"; ExpectedStatus = @(400, 503) }
)

foreach ($check in $checks) {
    $results += Test-Endpoint -Name $check.Name -Method $check.Method -Endpoint $check.Endpoint -ExpectedStatus $check.ExpectedStatus
}

$total = $results.Count
$passed = ($results | Where-Object { $_.Status }).Count
$failed = $total - $passed
$passPct = if ($total -eq 0) { 0 } else { [math]::Round(($passed / $total) * 100, 0) }

Write-Host ""
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "Passed: $passed/$total ($passPct%)" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "Failed: $failed/$total" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed Checks:" -ForegroundColor Yellow
    $results | Where-Object { -not $_.Status } | ForEach-Object {
        Write-Host " - $($_.Name) [$($_.Code)] $($_.Url)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Failed: 0/$total" -ForegroundColor Green
}
