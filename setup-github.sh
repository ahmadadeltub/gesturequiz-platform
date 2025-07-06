#!/bin/bash

# GestureQuiz GitHub Pages Deployment Setup Script
echo "🚀 Setting up GestureQuiz for GitHub Pages deployment..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "quiz-app/index.html" ]; then
    echo "❌ Please run this script from the webgues directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore file..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
.env

# IDE files
.vscode/
.DS_Store

# Logs
*.log

# Temporary files
tmp/
temp/
EOF
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: GestureQuiz platform ready for GitHub Pages"

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. Create a new repository on GitHub.com"
echo "2. Copy the repository URL"
echo "3. Run these commands:"
echo ""
echo "   git remote add origin YOUR_GITHUB_REPO_URL"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Enable GitHub Pages in your repository settings"
echo "5. Your site will be live at: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/quiz-app/"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Your GestureQuiz platform will soon be live and free for everyone!"
