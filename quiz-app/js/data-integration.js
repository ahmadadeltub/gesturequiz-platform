// Data Integration System for GestureQuiz
// This script handles all data synchronization between teacher and student dashboards

class DataIntegration {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.setupStorageListener();
        this.initializeData();
    }

    // Setup cross-tab storage listener for real-time sync
    setupStorageListener() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'teacherClasses' || 
                event.key === 'teacherQuizzes' || 
                event.key === 'studentProgress' ||
                event.key === 'quizResults') {
                this.refreshDisplays();
            }
        });
    }

    // Initialize data structures if they don't exist
    initializeData() {
        if (!localStorage.getItem('teacherClasses')) {
            localStorage.setItem('teacherClasses', '[]');
        }
        if (!localStorage.getItem('teacherQuizzes')) {
            localStorage.setItem('teacherQuizzes', '[]');
        }
        if (!localStorage.getItem('studentProgress')) {
            localStorage.setItem('studentProgress', '[]');
        }
        if (!localStorage.getItem('quizResults')) {
            localStorage.setItem('quizResults', '[]');
        }
    }

    // Get all classes for current user
    getClasses() {
        const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
        
        if (this.currentUser.type === 'teacher') {
            return classes.filter(cls => cls.createdBy === this.currentUser.email);
        } else if (this.currentUser.type === 'student') {
            return classes.filter(cls => 
                cls.students && cls.students.some(student => 
                    student.email === this.currentUser.email
                )
            );
        }
        return [];
    }

    // Get all quizzes for current user
    getQuizzes() {
        const quizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
        const userClasses = this.getClasses();
        const userClassIds = userClasses.map(cls => cls.id);
        
        if (this.currentUser.type === 'teacher') {
            return quizzes.filter(quiz => 
                quiz.createdBy === this.currentUser.email ||
                userClassIds.includes(quiz.classId)
            );
        } else if (this.currentUser.type === 'student') {
            return quizzes.filter(quiz => 
                userClassIds.includes(quiz.classId) && quiz.published
            );
        }
        return [];
    }

    // Get student progress for current user
    getStudentProgress() {
        const progress = JSON.parse(localStorage.getItem('studentProgress') || '[]');
        
        if (this.currentUser.type === 'student') {
            return progress.filter(p => p.studentEmail === this.currentUser.email);
        } else if (this.currentUser.type === 'teacher') {
            const userClasses = this.getClasses();
            const userClassIds = userClasses.map(cls => cls.id);
            return progress.filter(p => userClassIds.includes(p.classId));
        }
        return [];
    }

    // Add quiz result (when student completes a quiz)
    addQuizResult(quizId, classId, score, answers, timeSpent) {
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const progress = JSON.parse(localStorage.getItem('studentProgress') || '[]');
        
        const newResult = {
            id: 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            studentId: this.currentUser.id,
            studentEmail: this.currentUser.email,
            studentName: this.currentUser.name,
            quizId: quizId,
            classId: classId,
            score: score,
            answers: answers,
            timeSpent: timeSpent,
            completedAt: new Date().toISOString()
        };

        results.push(newResult);
        
        // Also add to progress tracking
        const quiz = this.getQuizzes().find(q => q.id === quizId);
        if (quiz) {
            const progressEntry = {
                id: 'progress_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                studentId: this.currentUser.id,
                studentEmail: this.currentUser.email,
                studentName: this.currentUser.name,
                quizId: quizId,
                classId: classId,
                quizTitle: quiz.title,
                score: score,
                totalQuestions: quiz.questions.length,
                correctAnswers: answers.filter(a => a.correct).length,
                completedAt: new Date().toISOString(),
                timeSpent: timeSpent
            };
            progress.push(progressEntry);
        }

        localStorage.setItem('quizResults', JSON.stringify(results));
        localStorage.setItem('studentProgress', JSON.stringify(progress));
        
        // Trigger storage event for real-time sync
        this.triggerStorageEvent('quizResults');
    }

    // Get analytics data for teacher dashboard
    getAnalyticsData() {
        const classes = this.getClasses();
        const quizzes = this.getQuizzes();
        const progress = this.getStudentProgress();
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        
        const userClassIds = classes.map(cls => cls.id);
        const userResults = results.filter(r => userClassIds.includes(r.classId));
        
        return {
            totalClasses: classes.length,
            totalStudents: classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0),
            totalQuizzes: quizzes.length,
            totalSubmissions: userResults.length,
            averageScore: userResults.length > 0 ? 
                userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length : 0,
            recentActivity: this.getRecentActivity(),
            classPerformance: this.getClassPerformance(),
            topPerformers: this.getTopPerformers(),
            quizStats: this.getQuizStats()
        };
    }

    // Get recent activity for dashboard
    getRecentActivity() {
        const progress = this.getStudentProgress();
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        
        const activities = [
            ...progress.map(p => ({
                type: 'quiz_completed',
                student: p.studentName,
                quiz: p.quizTitle,
                score: p.score,
                time: p.completedAt
            })),
            ...results.map(r => ({
                type: 'quiz_submitted',
                student: r.studentName,
                quiz: this.getQuizzes().find(q => q.id === r.quizId)?.title || 'Unknown Quiz',
                score: r.score,
                time: r.completedAt
            }))
        ];

        return activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 10);
    }

    // Get class performance data
    getClassPerformance() {
        const classes = this.getClasses();
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        
        return classes.map(cls => {
            const classResults = results.filter(r => r.classId === cls.id);
            const avgScore = classResults.length > 0 ? 
                classResults.reduce((sum, r) => sum + r.score, 0) / classResults.length : 0;
            
            return {
                className: cls.name,
                studentCount: cls.students?.length || 0,
                avgScore: Math.round(avgScore),
                submissions: classResults.length,
                lastActivity: classResults.length > 0 ? 
                    Math.max(...classResults.map(r => new Date(r.completedAt).getTime())) : null
            };
        });
    }

    // Get top performing students
    getTopPerformers() {
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const userClasses = this.getClasses();
        const userClassIds = userClasses.map(cls => cls.id);
        
        const studentScores = {};
        
        results.filter(r => userClassIds.includes(r.classId)).forEach(result => {
            if (!studentScores[result.studentEmail]) {
                studentScores[result.studentEmail] = {
                    name: result.studentName,
                    email: result.studentEmail,
                    totalScore: 0,
                    quizCount: 0,
                    scores: []
                };
            }
            
            studentScores[result.studentEmail].totalScore += result.score;
            studentScores[result.studentEmail].quizCount++;
            studentScores[result.studentEmail].scores.push(result.score);
        });

        return Object.values(studentScores)
            .map(student => ({
                ...student,
                avgScore: student.quizCount > 0 ? student.totalScore / student.quizCount : 0
            }))
            .sort((a, b) => b.avgScore - a.avgScore)
            .slice(0, 10);
    }

    // Get quiz statistics
    getQuizStats() {
        const quizzes = this.getQuizzes();
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        
        return quizzes.map(quiz => {
            const quizResults = results.filter(r => r.quizId === quiz.id);
            const avgScore = quizResults.length > 0 ? 
                quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length : 0;
            
            return {
                id: quiz.id,
                title: quiz.title,
                submissions: quizResults.length,
                avgScore: Math.round(avgScore),
                published: quiz.published,
                createdAt: quiz.createdAt,
                difficulty: this.calculateDifficulty(quizResults)
            };
        });
    }

    // Calculate quiz difficulty based on results
    calculateDifficulty(results) {
        if (results.length === 0) return 'Unknown';
        
        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        
        if (avgScore >= 80) return 'Easy';
        if (avgScore >= 60) return 'Medium';
        return 'Hard';
    }

    // Trigger storage event for cross-tab sync
    triggerStorageEvent(key) {
        // Create a custom event to trigger storage listeners
        const event = new StorageEvent('storage', {
            key: key,
            newValue: localStorage.getItem(key),
            storageArea: localStorage
        });
        window.dispatchEvent(event);
    }

    // Refresh all displays (to be implemented in each page)
    refreshDisplays() {
        // This will be overridden by each page
        console.log('Refreshing displays...');
    }

    // Join a class (for students)
    joinClass(classCode) {
        const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
        const classIndex = classes.findIndex(cls => cls.code === classCode);
        
        if (classIndex === -1) {
            throw new Error('Class not found with this code');
        }

        const targetClass = classes[classIndex];
        
        // Check if student is already in the class
        if (targetClass.students && targetClass.students.some(s => s.email === this.currentUser.email)) {
            throw new Error('You are already enrolled in this class');
        }

        // Initialize students array if it doesn't exist
        if (!targetClass.students) {
            targetClass.students = [];
        }

        // Add student to class
        targetClass.students.push({
            id: 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: this.currentUser.name,
            email: this.currentUser.email,
            joinedAt: new Date().toISOString()
        });

        localStorage.setItem('teacherClasses', JSON.stringify(classes));
        this.triggerStorageEvent('teacherClasses');
        
        return targetClass;
    }

    // Get available quizzes for a student
    getAvailableQuizzes() {
        const quizzes = this.getQuizzes();
        const completedQuizzes = this.getStudentProgress().map(p => p.quizId);
        
        return quizzes.filter(quiz => 
            quiz.published && !completedQuizzes.includes(quiz.id)
        );
    }

    // Get completed quizzes for a student
    getCompletedQuizzes() {
        const progress = this.getStudentProgress();
        const quizzes = this.getQuizzes();
        
        return progress.map(p => {
            const quiz = quizzes.find(q => q.id === p.quizId);
            return {
                ...p,
                quizTitle: quiz?.title || p.quizTitle,
                className: this.getClasses().find(c => c.id === p.classId)?.name || 'Unknown Class'
            };
        });
    }
}

// Initialize data integration
const dataIntegration = new DataIntegration();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.dataIntegration = dataIntegration;
}
