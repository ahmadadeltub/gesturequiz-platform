#!/bin/bash

echo "🚀 Deploying GestureQuiz Platform..."
echo ""

# Navigate to project directory
cd /Volumes/Data/webgues

# Add all changes to Git
echo "📝 Adding changes to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "deploy: Complete teacher-student platform with analytics and management tools"

# Push to GitHub (if remote is configured)
echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your platform should now be live at: https://quizgames-e1fd5.web.app"
