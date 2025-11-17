# Cineranda Frontend Setup Script (Windows)

Write-Host "🎬 Setting up Cineranda User Frontend..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "✅ .env file created. Please edit it with your API URL and keys." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env and set your VITE_API_BASE_URL"
Write-Host "2. Run 'npm run dev' to start development server"
Write-Host "3. Open http://localhost:3000 in your browser"
Write-Host "4. Follow DEVELOPMENT_GUIDE.md to build remaining pages"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- README.md - Project overview"
Write-Host "- DEVELOPMENT_GUIDE.md - Implementation guide"
Write-Host "- PROJECT_SUMMARY.md - Current status"
Write-Host "- USER_FRONTEND_REQUIREMENTS.md - Full specification"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
