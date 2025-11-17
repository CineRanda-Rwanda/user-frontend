#!/bin/bash

# Cineranda Frontend Setup Script

echo "🎬 Setting up Cineranda User Frontend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your API URL and keys."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and set your VITE_API_BASE_URL"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Follow DEVELOPMENT_GUIDE.md to build remaining pages"
echo ""
echo "📚 Documentation:"
echo "- README.md - Project overview"
echo "- DEVELOPMENT_GUIDE.md - Implementation guide"
echo "- PROJECT_SUMMARY.md - Current status"
echo "- USER_FRONTEND_REQUIREMENTS.md - Full specification"
echo ""
echo "Happy coding! 🚀"
