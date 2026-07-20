<#
.SYNOPSIS
Builds the backend Docker image locally, pushes it to a container registry, and triggers Render to deploy it.

.DESCRIPTION
This script replaces the automated Git-based Render Blueprint. It allows you to manually build the 
Docker image on your local machine, push it to Docker Hub, and then ping Render to pull the latest image.

.INSTRUCTIONS
1. Create a "Web Service" in the Render Dashboard manually.
2. Select "Existing image" and enter your Docker Hub image name (e.g., yourusername/resume-backend:latest).
3. Copy the "Deploy Hook" URL from the Render settings.
4. Update the variables below with your Docker Hub username and the Deploy Hook URL.
5. Make sure Docker Desktop is running, then execute this script!
#>

$DOCKER_USERNAME = "sharnsimon"
$IMAGE_NAME = "resume-backend"
$TAG = "latest"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Manual Docker Build & Render Deploy   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Step 1: Build the Docker Image Locally
Write-Host "`n[1/3] Building the Docker image locally..." -ForegroundColor Yellow
# We run this from the root directory but point the context and file to apps/backend
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG} -f apps/backend/Dockerfile apps/backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed! Please make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}
Write-Host "Docker image built successfully!" -ForegroundColor Green

# Step 2: Push the Docker Image to Docker Hub
Write-Host "`n[2/3] Pushing the image to Docker Hub..." -ForegroundColor Yellow
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed! Please make sure you are logged in (run 'docker login')." -ForegroundColor Red
    exit 1
}
Write-Host "Docker image pushed successfully!" -ForegroundColor Green

# Step 3: Trigger Render to Deploy
Write-Host "`n[3/3] Render Deployment Instructions" -ForegroundColor Yellow
Write-Host "Since Render Deploy Hooks are a paid feature, you will need to trigger the deployment manually."
Write-Host "1. Go to your Render Dashboard (dashboard.render.com)."
Write-Host "2. Open your Web Service."
Write-Host "3. Click the 'Manual Deploy' button (top right) to pull this latest image!" -ForegroundColor Green

Write-Host "`nAll done!" -ForegroundColor Cyan
