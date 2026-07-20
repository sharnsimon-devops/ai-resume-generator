<#
.SYNOPSIS
Deploys the Resume Backend to Render.

.DESCRIPTION
Render works best by automatically building your Dockerfile directly from your connected Git repository. 
You don't need to build the Docker image locally! This script ensures your latest code is pushed to GitHub, 
and then triggers Render to build the Docker image on their servers and deploy it.

.INSTRUCTIONS
1. Go to dashboard.render.com and create a new "Blueprint" using the `render.yaml` file in this repository.
2. In your Render Web Service settings, look for "Deploy Hook" and copy the URL.
3. Paste that URL into the $RENDER_DEPLOY_HOOK variable below.
4. Run this script: .\deploy-to-render.ps1
#>

$RENDER_DEPLOY_HOOK = "YOUR_RENDER_DEPLOY_HOOK_URL_HERE"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Deploying Backend to Render (Docker)  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Step 1: Ensure code is pushed to GitHub
Write-Host "`n[1/2] Syncing code with GitHub..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "Uncommitted changes found. Committing to Git..."
    git add .
    git commit -m "Auto-commit for Render deployment"
    git push origin master
} else {
    Write-Host "Working tree clean. Pushing any pending commits..."
    git push origin master
}

Write-Host "Code successfully pushed to GitHub!" -ForegroundColor Green

# Step 2: Trigger Render to build the Docker image and deploy
Write-Host "`n[2/2] Triggering Render Docker Build & Deploy..." -ForegroundColor Yellow

if ($RENDER_DEPLOY_HOOK -eq "YOUR_RENDER_DEPLOY_HOOK_URL_HERE") {
    Write-Host "WARNING: You need to paste your Render Deploy Hook URL into this script!" -ForegroundColor Red
    Write-Host "Once you've connected Render to your GitHub repo, Render will automatically build the Dockerfile every time you push. You only need the Deploy Hook if you want to trigger it manually via this script." -ForegroundColor Gray
} else {
    try {
        Invoke-RestMethod -Uri $RENDER_DEPLOY_HOOK -Method Post
        Write-Host "Deployment triggered successfully! Render is now building your Docker image." -ForegroundColor Green
        Write-Host "Check your Render dashboard for the build progress." -ForegroundColor Gray
    } catch {
        Write-Host "Failed to trigger Render deployment. Please check your Deploy Hook URL." -ForegroundColor Red
    }
}
