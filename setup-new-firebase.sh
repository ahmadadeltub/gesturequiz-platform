#!/bin/bash

# Firebase Project Setup Script for GestureQuiz Platform
# This script helps update Firebase configuration across all files

echo "🚀 GestureQuiz Firebase Project Setup Script"
echo "=============================================="

echo ""
echo "📋 This script will help you:"
echo "1. Backup current Firebase config"
echo "2. Update Firebase configuration in all files"
echo "3. Test the new configuration"
echo "4. Deploy the updated website"

echo ""
echo "⚠️  IMPORTANT: Make sure you have:"
echo "✅ Created new Firebase project"
echo "✅ Enabled Authentication, Firestore, Storage"
echo "✅ Set up security rules"
echo "✅ Got the new Firebase config object"

echo ""
read -p "Do you want to continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

echo ""
echo "🔧 Step 1: Backing up current configuration..."
cp quiz-app/js/firebase-config.js quiz-app/js/firebase-config.js.backup
echo "✅ Backup created: quiz-app/js/firebase-config.js.backup"

echo ""
echo "📝 Step 2: Firebase Configuration Update"
echo "Please provide your new Firebase configuration:"
echo ""

read -p "Enter API Key: " api_key
read -p "Enter Auth Domain: " auth_domain
read -p "Enter Project ID: " project_id
read -p "Enter Storage Bucket: " storage_bucket
read -p "Enter Messaging Sender ID: " messaging_sender_id
read -p "Enter App ID: " app_id
read -p "Enter Measurement ID (optional): " measurement_id

echo ""
echo "🔄 Step 3: Updating configuration files..."

# Create new Firebase config
cat > quiz-app/js/firebase-config.js << EOF
// Firebase Configuration for GestureQuiz Platform
const firebaseConfig = {
  apiKey: "${api_key}",
  authDomain: "${auth_domain}",
  projectId: "${project_id}",
  storageBucket: "${storage_bucket}",
  messagingSenderId: "${messaging_sender_id}",
  appId: "${app_id}",
  measurementId: "${measurement_id}"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Export for use in other files
window.firebaseConfig = firebaseConfig;
window.auth = auth;
window.db = db;
window.storage = storage;
window.analytics = analytics;

console.log('✅ Firebase initialized successfully');
EOF

echo "✅ Firebase configuration updated!"

echo ""
echo "🧪 Step 4: Testing new configuration..."
echo "Opening testing tools..."

# Open testing tools
open "quiz-app/firebase-connection-validator.html"
open "quiz-app/fresh-user-creation-test.html"

echo ""
echo "🎉 Setup Complete!"
echo "===================="
echo ""
echo "Next steps:"
echo "1. Test the Firebase connection using the opened tools"
echo "2. Try creating a new user account"
echo "3. Verify all features work correctly"
echo "4. Commit and push changes to GitHub"
echo ""
echo "Testing tools opened:"
echo "- Firebase Connection Validator"
echo "- Fresh User Creation Test"
echo ""
echo "If everything works, run: git add . && git commit -m 'Update Firebase configuration' && git push"
echo ""
echo "🌐 Your website: https://ahmadadeltub.github.io/gesturequiz-platform/"
