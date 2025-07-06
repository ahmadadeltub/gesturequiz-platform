# Test Users for GestureQuiz Platform

## 🧑‍🏫 Teacher Test Users

### Teacher 1 - Primary Test Account
- **Name**: John Smith
- **Email**: teacher@test.com
- **Password**: teacher123
- **Type**: Teacher
- **Use Case**: Create classes, manage students, view analytics

### Teacher 2 - Secondary Test Account
- **Name**: Sarah Johnson
- **Email**: sarah.teacher@school.edu
- **Password**: password123
- **Type**: Teacher
- **Use Case**: Advanced features testing

## 👨‍🎓 Student Test Users

### Student 1 - Primary Test Account
- **Name**: Alex Wilson
- **Email**: student@test.com
- **Password**: student123
- **Type**: Student
- **Use Case**: Take quizzes, view progress

### Student 2 - Secondary Test Account
- **Name**: Emma Davis
- **Email**: emma.student@school.edu
- **Password**: password123
- **Type**: Student
- **Use Case**: Multiple student testing

### Student 3 - Additional Test Account
- **Name**: Michael Brown
- **Email**: mike.student@school.edu
- **Password**: password123
- **Type**: Student
- **Use Case**: Group testing scenarios

## 🔧 Testing Instructions

### For Teacher Testing:
1. Go to: `http://localhost:8000/quiz-app/`
2. Click "Get Started" or "Login"
3. Use any of the teacher credentials above
4. Select "Teacher" as user type
5. Access: Class Management, Quiz Creation, Analytics

### For Student Testing:
1. Go to: `http://localhost:8000/quiz-app/`
2. Click "Get Started" or "Login"
3. Use any of the student credentials above
4. Select "Student" as user type
5. Access: Join Classes, Take Quizzes, View Progress

## 🌟 Key Features to Test

### Teacher Features:
- ✅ Class creation and management
- ✅ Student enrollment (individual and bulk)
- ✅ Quiz creation and publishing
- ✅ Analytics dashboard
- ✅ Performance tracking

### Student Features:
- ✅ Class joining
- ✅ Quiz taking with gesture controls
- ✅ Progress tracking
- ✅ Score viewing

## 📱 Testing Scenarios

### Scenario 1: Complete Teacher Workflow
1. Login as teacher
2. Create a new class
3. Add students (both individually and in bulk)
4. Create a quiz
5. Publish the quiz
6. View analytics

### Scenario 2: Complete Student Workflow
1. Login as student
2. Join a class (using class code)
3. Take an available quiz
4. View results and progress

### Scenario 3: Multi-User Testing
1. Use multiple browser tabs/windows
2. Login as teacher in one, student in another
3. Test real-time interactions
4. Verify data synchronization

## 🎯 Note
The authentication system accepts any credentials for demo purposes, so you can also create your own test users on the fly!
