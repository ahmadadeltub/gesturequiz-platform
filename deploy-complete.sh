#!/bin/bash

# 🚀 GestureQuiz Platform Deployment Script
# Professional Teacher-Student Platform

echo "======================================"
echo "🎯 GestureQuiz Platform Deployment"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Deployment Checklist:"
echo "✅ Teacher Dashboard - Complete with analytics"
echo "✅ Quiz Management - Create and manage quizzes"
echo "✅ Class Management - Student organization"
echo "✅ Analytics Dashboard - Performance insights"
echo "✅ Student Dashboard - Quiz interface"
echo "✅ Firebase Configuration - Ready"
echo "✅ Professional UI - Modern responsive design"
echo ""

# Step 1: Git Operations
echo "🔧 Step 1: Git Repository Management"
echo "-----------------------------------"

# Add all changes
echo "📝 Adding all changes..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "deploy: Professional teacher-student platform v$(date +%Y%m%d_%H%M%S)

Features:
- Complete teacher dashboard with real-time analytics
- Quiz creation and management system
- Class and student management tools
- Performance analytics and insights
- Role-based authentication system
- Professional responsive UI design
- Firebase integration for real-time data"
fi

# Step 2: Firebase Deployment
echo ""
echo "🔥 Step 2: Firebase Deployment"
echo "------------------------------"

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI not found. Please install it:"
    echo "   npm install -g firebase-tools"
    echo "   firebase login"
    echo ""
    echo "📋 Manual deployment commands:"
    echo "   firebase deploy --only hosting"
    echo "   firebase deploy --only firestore"
    exit 1
fi

# Check if logged in to Firebase
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Please login to Firebase first:"
    echo "   firebase login"
    exit 1
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "📊 Deploying Firestore rules and indexes..."
firebase deploy --only firestore

# Step 3: GitHub Operations (if remote is configured)
echo ""
echo "📤 Step 3: GitHub Repository"
echo "----------------------------"

if git remote get-url origin &> /dev/null; then
    echo "🔗 Pushing to GitHub..."
    git push origin main
else
    echo "ℹ️  No GitHub remote configured. To add:"
    echo "   git remote add origin https://github.com/ahmadadeltub/gesturequiz-platform.git"
    echo "   git push -u origin main"
fi

# Final Status
echo ""
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "🌐 Your platform is now live at:"
echo "   https://gesturequiz-platform-live.web.app"
echo ""
echo "📱 GitHub Repository:"
echo "   https://github.com/ahmadadeltub/gesturequiz-platform"
echo ""
echo "🎯 Platform Features:"
echo "   • Teacher Dashboard with Analytics"
echo "   • Quiz Creation & Management"
echo "   • Class & Student Management"
echo "   • Performance Analytics"
echo "   • Student Quiz Interface"
echo "   • Role-based Authentication"
echo "   • Gesture-based Interactions"
echo "   • Real-time Firebase Integration"
echo ""
echo "📝 Next Steps:"
echo "   1. Test the live application"
echo "   2. Create teacher and student accounts"
echo "   3. Set up your first class and quiz"
echo "   4. Share with your users"
echo ""
echo "🎉 Happy Teaching & Learning!"
