// Unified Analytics Data Manager for GestureQuiz Platform
// Ensures synchronized analytics across all pages for teachers and students

class UnifiedAnalyticsManager {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.analytics = null;
        this.cache = new Map();
        this.realtimeListeners = new Map();
        this.isInitialized = false;
        
        this.initializeAnalytics();
    }

    async initializeAnalytics() {
        try {
            console.log('🚀 Initializing Unified Analytics Manager...');
            
            // Wait for Firebase to be available
            while (typeof firebase === 'undefined') {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            if (firebase.analytics) {
                this.analytics = firebase.analytics();
            }

            // Set up authentication listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    this.onUserAuthenticated(user);
                } else {
                    this.onUserSignedOut();
                }
            });

            this.isInitialized = true;
            console.log('✅ Unified Analytics Manager initialized');
            
        } catch (error) {
            console.error('❌ Analytics initialization failed:', error);
            throw error;
        }
    }

    // ========== REAL-TIME ANALYTICS METHODS ==========

    async getTeacherAnalytics(teacherId = null) {
        try {
            const userId = teacherId || this.currentUser?.uid;
            if (!userId) {
                throw new Error('User ID required for teacher analytics');
            }

            console.log('📊 Fetching teacher analytics for:', userId);

            // Get teacher's classes
            const classesSnapshot = await this.db.collection('classes')
                .where('createdBy', '==', userId)
                .get();

            const classes = [];
            classesSnapshot.forEach(doc => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            // Get all quizzes for these classes
            const quizPromises = classes.map(cls => 
                this.db.collection('quizzes')
                    .where('classId', '==', cls.id)
                    .get()
            );

            const quizSnapshots = await Promise.all(quizPromises);
            const allQuizzes = [];
            
            quizSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    allQuizzes.push({ id: doc.id, ...doc.data() });
                });
            });

            // Get all submissions for these quizzes
            const submissionPromises = allQuizzes.map(quiz => 
                this.db.collection('submissions')
                    .where('quizId', '==', quiz.id)
                    .get()
            );

            const submissionSnapshots = await Promise.all(submissionPromises);
            const allSubmissions = [];
            
            submissionSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    allSubmissions.push({ id: doc.id, ...doc.data() });
                });
            });

            // Calculate comprehensive analytics
            const analytics = this.calculateTeacherAnalytics(classes, allQuizzes, allSubmissions);
            
            // Cache results
            this.cache.set(`teacher_analytics_${userId}`, analytics);
            
            return { success: true, data: analytics };

        } catch (error) {
            console.error('❌ Teacher analytics failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getStudentAnalytics(studentId = null) {
        try {
            const userId = studentId || this.currentUser?.uid;
            if (!userId) {
                throw new Error('User ID required for student analytics');
            }

            console.log('📊 Fetching student analytics for:', userId);

            // Get student's submissions
            const submissionsSnapshot = await this.db.collection('submissions')
                .where('userId', '==', userId)
                .get();

            const submissions = [];
            submissionsSnapshot.forEach(doc => {
                submissions.push({ id: doc.id, ...doc.data() });
            });

            // Get quizzes for these submissions
            const quizIds = [...new Set(submissions.map(sub => sub.quizId))];
            const quizPromises = quizIds.map(quizId => 
                this.db.collection('quizzes').doc(quizId).get()
            );

            const quizDocs = await Promise.all(quizPromises);
            const quizzes = quizDocs
                .filter(doc => doc.exists)
                .map(doc => ({ id: doc.id, ...doc.data() }));

            // Get classes for these quizzes
            const classIds = [...new Set(quizzes.map(quiz => quiz.classId))];
            const classPromises = classIds.map(classId => 
                this.db.collection('classes').doc(classId).get()
            );

            const classDocs = await Promise.all(classPromises);
            const classes = classDocs
                .filter(doc => doc.exists)
                .map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate comprehensive analytics
            const analytics = this.calculateStudentAnalytics(submissions, quizzes, classes);
            
            // Cache results
            this.cache.set(`student_analytics_${userId}`, analytics);
            
            return { success: true, data: analytics };

        } catch (error) {
            console.error('❌ Student analytics failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getGlobalAnalytics() {
        try {
            console.log('🌍 Fetching global analytics...');

            // Get all collections in parallel
            const [usersSnapshot, classesSnapshot, quizzesSnapshot, submissionsSnapshot] = await Promise.all([
                this.db.collection('users').get(),
                this.db.collection('classes').get(),
                this.db.collection('quizzes').get(),
                this.db.collection('submissions').get()
            ]);

            const users = [];
            const classes = [];
            const quizzes = [];
            const submissions = [];

            usersSnapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
            classesSnapshot.forEach(doc => classes.push({ id: doc.id, ...doc.data() }));
            quizzesSnapshot.forEach(doc => quizzes.push({ id: doc.id, ...doc.data() }));
            submissionsSnapshot.forEach(doc => submissions.push({ id: doc.id, ...doc.data() }));

            // Calculate global analytics
            const analytics = this.calculateGlobalAnalytics(users, classes, quizzes, submissions);
            
            // Cache results
            this.cache.set('global_analytics', analytics);
            
            return { success: true, data: analytics };

        } catch (error) {
            console.error('❌ Global analytics failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== CALCULATION METHODS ==========

    calculateTeacherAnalytics(classes, quizzes, submissions) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Basic counts
        const totalClasses = classes.length;
        const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
        const totalQuizzes = quizzes.length;
        const totalSubmissions = submissions.length;

        // Active metrics
        const activeQuizzes = quizzes.filter(quiz => quiz.isActive).length;
        const recentSubmissions = submissions.filter(sub => 
            new Date(sub.submittedAt) >= oneWeekAgo
        ).length;

        // Performance metrics
        const completedSubmissions = submissions.filter(sub => sub.isCompleted);
        const averageScore = completedSubmissions.length > 0 
            ? completedSubmissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / completedSubmissions.length
            : 0;

        const completionRate = totalSubmissions > 0 
            ? (completedSubmissions.length / totalSubmissions) * 100 
            : 0;

        // Time-based analytics
        const dailyActivity = this.calculateDailyActivity(submissions, 7);
        const weeklyActivity = this.calculateWeeklyActivity(submissions, 4);
        const monthlyActivity = this.calculateMonthlyActivity(submissions, 6);

        // Subject performance
        const subjectPerformance = this.calculateSubjectPerformance(classes, quizzes, submissions);

        // Class rankings
        const classRankings = this.calculateClassRankings(classes, quizzes, submissions);

        // Recent activity
        const recentActivity = submissions
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 20)
            .map(sub => ({
                ...sub,
                relativeTime: this.getRelativeTime(sub.submittedAt)
            }));

        // Growth metrics
        const growthMetrics = this.calculateGrowthMetrics(submissions, classes, quizzes);

        return {
            overview: {
                totalClasses,
                totalStudents,
                totalQuizzes,
                totalSubmissions,
                activeQuizzes,
                recentSubmissions,
                averageScore: Math.round(averageScore * 100) / 100,
                completionRate: Math.round(completionRate * 100) / 100
            },
            performance: {
                averageScore,
                completionRate,
                topPerformers: this.getTopPerformers(submissions, 5),
                strugglingStudents: this.getStrugglingStudents(submissions, 5),
                improvementTrends: this.getImprovementTrends(submissions)
            },
            activity: {
                daily: dailyActivity,
                weekly: weeklyActivity,
                monthly: monthlyActivity,
                recent: recentActivity
            },
            insights: {
                subjectPerformance,
                classRankings,
                growthMetrics,
                recommendations: this.generateRecommendations(classes, quizzes, submissions)
            },
            lastUpdated: new Date().toISOString()
        };
    }

    calculateStudentAnalytics(submissions, quizzes, classes) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Basic counts
        const totalQuizzes = submissions.length;
        const completedQuizzes = submissions.filter(sub => sub.isCompleted).length;
        const totalClasses = classes.length;

        // Performance metrics
        const completedSubmissions = submissions.filter(sub => sub.isCompleted);
        const averageScore = completedSubmissions.length > 0 
            ? completedSubmissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / completedSubmissions.length
            : 0;

        const bestScore = completedSubmissions.length > 0 
            ? Math.max(...completedSubmissions.map(sub => sub.score / sub.maxScore * 100))
            : 0;

        const totalTimeSpent = submissions.reduce((sum, sub) => sum + (sub.timeTaken || 0), 0);

        // Recent activity
        const recentSubmissions = submissions.filter(sub => 
            new Date(sub.submittedAt) >= oneWeekAgo
        ).length;

        // Progress tracking
        const progressData = this.calculateStudentProgress(submissions, quizzes);

        // Subject performance
        const subjectPerformance = this.calculateStudentSubjectPerformance(submissions, quizzes, classes);

        // Time-based analytics
        const dailyActivity = this.calculateDailyActivity(submissions, 7);
        const weeklyActivity = this.calculateWeeklyActivity(submissions, 4);

        // Ranking and comparison
        const classRankings = this.calculateStudentClassRankings(submissions, classes);

        // Achievement tracking
        const achievements = this.calculateStudentAchievements(submissions, quizzes);

        return {
            overview: {
                totalQuizzes,
                completedQuizzes,
                totalClasses,
                recentSubmissions,
                averageScore: Math.round(averageScore * 100) / 100,
                bestScore: Math.round(bestScore * 100) / 100,
                totalTimeSpent
            },
            performance: {
                averageScore,
                bestScore,
                progressData,
                subjectPerformance,
                improvementTrend: this.calculateImprovementTrend(submissions)
            },
            activity: {
                daily: dailyActivity,
                weekly: weeklyActivity,
                classRankings
            },
            achievements: achievements,
            recommendations: this.generateStudentRecommendations(submissions, quizzes, classes),
            lastUpdated: new Date().toISOString()
        };
    }

    calculateGlobalAnalytics(users, classes, quizzes, submissions) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Basic counts
        const totalUsers = users.length;
        const totalTeachers = users.filter(user => user.role === 'teacher').length;
        const totalStudents = users.filter(user => user.role === 'student').length;
        const totalClasses = classes.length;
        const totalQuizzes = quizzes.length;
        const totalSubmissions = submissions.length;

        // Activity metrics
        const activeUsers = users.filter(user => 
            new Date(user.lastActive) >= oneWeekAgo
        ).length;

        const recentSubmissions = submissions.filter(sub => 
            new Date(sub.submittedAt) >= oneWeekAgo
        ).length;

        // Performance metrics
        const completedSubmissions = submissions.filter(sub => sub.isCompleted);
        const globalAverageScore = completedSubmissions.length > 0 
            ? completedSubmissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / completedSubmissions.length
            : 0;

        const globalCompletionRate = totalSubmissions > 0 
            ? (completedSubmissions.length / totalSubmissions) * 100 
            : 0;

        // Growth metrics
        const userGrowth = this.calculateUserGrowth(users);
        const engagementMetrics = this.calculateEngagementMetrics(users, submissions);

        return {
            overview: {
                totalUsers,
                totalTeachers,
                totalStudents,
                totalClasses,
                totalQuizzes,
                totalSubmissions,
                activeUsers,
                recentSubmissions
            },
            performance: {
                globalAverageScore: Math.round(globalAverageScore * 100) / 100,
                globalCompletionRate: Math.round(globalCompletionRate * 100) / 100,
                topPerformingClasses: this.getTopPerformingClasses(classes, submissions, 5),
                mostActiveTeachers: this.getMostActiveTeachers(users, classes, 5)
            },
            growth: userGrowth,
            engagement: engagementMetrics,
            lastUpdated: new Date().toISOString()
        };
    }

    // ========== HELPER METHODS ==========

    calculateDailyActivity(submissions, days) {
        const now = new Date();
        const dailyData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            const daySubmissions = submissions.filter(sub => 
                sub.submittedAt.split('T')[0] === dateStr
            );

            dailyData.push({
                date: dateStr,
                submissions: daySubmissions.length,
                averageScore: daySubmissions.length > 0 
                    ? daySubmissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / daySubmissions.length
                    : 0
            });
        }

        return dailyData;
    }

    calculateWeeklyActivity(submissions, weeks) {
        const now = new Date();
        const weeklyData = [];

        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            
            const weekSubmissions = submissions.filter(sub => {
                const subDate = new Date(sub.submittedAt);
                return subDate >= weekStart && subDate < weekEnd;
            });

            weeklyData.push({
                week: `Week ${weeks - i}`,
                submissions: weekSubmissions.length,
                averageScore: weekSubmissions.length > 0 
                    ? weekSubmissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / weekSubmissions.length
                    : 0
            });
        }

        return weeklyData;
    }

    calculateMonthlyActivity(submissions, months) {
        const now = new Date();
        const monthlyData = [];

        for (let i = months - 1; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            
            const monthSubmissions = submissions.filter(sub => {
                const subDate = new Date(sub.submittedAt);
                return subDate >= monthStart && subDate <= monthEnd;
            });

            monthlyData.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                submissions: monthSubmissions.length,
                averageScore: monthSubmissions.length > 0 
                    ? monthSubmissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / monthSubmissions.length
                    : 0
            });
        }

        return monthlyData;
    }

    calculateSubjectPerformance(classes, quizzes, submissions) {
        const subjectData = {};

        classes.forEach(cls => {
            const subject = cls.subject || 'General';
            const classQuizzes = quizzes.filter(quiz => quiz.classId === cls.id);
            const classSubmissions = submissions.filter(sub => 
                classQuizzes.some(quiz => quiz.id === sub.quizId)
            );

            if (!subjectData[subject]) {
                subjectData[subject] = {
                    totalQuizzes: 0,
                    totalSubmissions: 0,
                    totalScore: 0,
                    completedSubmissions: 0
                };
            }

            subjectData[subject].totalQuizzes += classQuizzes.length;
            subjectData[subject].totalSubmissions += classSubmissions.length;
            
            const completed = classSubmissions.filter(sub => sub.isCompleted);
            subjectData[subject].completedSubmissions += completed.length;
            subjectData[subject].totalScore += completed.reduce((sum, sub) => 
                sum + (sub.score / sub.maxScore * 100), 0
            );
        });

        return Object.keys(subjectData).map(subject => ({
            subject,
            averageScore: subjectData[subject].completedSubmissions > 0 
                ? subjectData[subject].totalScore / subjectData[subject].completedSubmissions
                : 0,
            totalQuizzes: subjectData[subject].totalQuizzes,
            totalSubmissions: subjectData[subject].totalSubmissions,
            completionRate: subjectData[subject].totalSubmissions > 0 
                ? (subjectData[subject].completedSubmissions / subjectData[subject].totalSubmissions) * 100
                : 0
        }));
    }

    getRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
    }

    // ========== REAL-TIME UPDATES ==========

    setupRealtimeAnalytics() {
        if (!this.currentUser) return;

        console.log('🔄 Setting up real-time analytics...');

        // Listen for submissions changes
        const submissionsListener = this.db.collection('submissions')
            .onSnapshot((snapshot) => {
                console.log('📊 Submissions updated - refreshing analytics');
                this.clearCache();
                this.notifyAnalyticsUpdate();
            });

        // Listen for quiz changes
        const quizzesListener = this.db.collection('quizzes')
            .onSnapshot((snapshot) => {
                console.log('📝 Quizzes updated - refreshing analytics');
                this.clearCache();
                this.notifyAnalyticsUpdate();
            });

        // Listen for class changes
        const classesListener = this.db.collection('classes')
            .onSnapshot((snapshot) => {
                console.log('🏫 Classes updated - refreshing analytics');
                this.clearCache();
                this.notifyAnalyticsUpdate();
            });

        this.realtimeListeners.set('submissions', submissionsListener);
        this.realtimeListeners.set('quizzes', quizzesListener);
        this.realtimeListeners.set('classes', classesListener);
    }

    notifyAnalyticsUpdate() {
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('analyticsUpdated', {
            detail: { timestamp: new Date().toISOString() }
        }));
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Analytics cache cleared');
    }

    // ========== LIFECYCLE METHODS ==========

    onUserAuthenticated(user) {
        console.log('👤 User authenticated - setting up analytics');
        this.setupRealtimeAnalytics();
    }

    onUserSignedOut() {
        console.log('👤 User signed out - cleaning up analytics');
        this.cleanupRealtimeListeners();
        this.clearCache();
    }

    cleanupRealtimeListeners() {
        this.realtimeListeners.forEach((unsubscribe, key) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
                console.log(`✅ Cleaned up ${key} analytics listener`);
            }
        });
        this.realtimeListeners.clear();
    }

    // ========== ADDITIONAL HELPER METHODS ==========

    calculateClassRankings(classes, quizzes, submissions) {
        return classes.map(cls => {
            const classQuizzes = quizzes.filter(quiz => quiz.classId === cls.id);
            const classSubmissions = submissions.filter(sub => 
                classQuizzes.some(quiz => quiz.id === sub.quizId)
            );
            
            const completed = classSubmissions.filter(sub => sub.isCompleted);
            const averageScore = completed.length > 0 
                ? completed.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / completed.length
                : 0;

            return {
                className: cls.name,
                studentCount: cls.students?.length || 0,
                quizCount: classQuizzes.length,
                submissionCount: classSubmissions.length,
                averageScore: Math.round(averageScore * 100) / 100,
                completionRate: classSubmissions.length > 0 
                    ? (completed.length / classSubmissions.length) * 100
                    : 0
            };
        }).sort((a, b) => b.averageScore - a.averageScore);
    }

    getTopPerformers(submissions, count = 5) {
        const userPerformance = {};
        
        submissions.forEach(sub => {
            if (sub.isCompleted) {
                const userId = sub.userId;
                if (!userPerformance[userId]) {
                    userPerformance[userId] = {
                        userId,
                        userEmail: sub.userEmail,
                        scores: [],
                        totalSubmissions: 0
                    };
                }
                userPerformance[userId].scores.push(sub.score / sub.maxScore * 100);
                userPerformance[userId].totalSubmissions++;
            }
        });

        return Object.values(userPerformance)
            .map(user => ({
                ...user,
                averageScore: user.scores.reduce((sum, score) => sum + score, 0) / user.scores.length
            }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, count);
    }

    generateRecommendations(classes, quizzes, submissions) {
        const recommendations = [];
        
        // Check for classes with low engagement
        const lowEngagementClasses = classes.filter(cls => {
            const classQuizzes = quizzes.filter(quiz => quiz.classId === cls.id);
            const classSubmissions = submissions.filter(sub => 
                classQuizzes.some(quiz => quiz.id === sub.quizId)
            );
            
            const studentCount = cls.students?.length || 0;
            const submissionRate = studentCount > 0 ? classSubmissions.length / studentCount : 0;
            
            return submissionRate < 0.5 && studentCount > 0;
        });

        if (lowEngagementClasses.length > 0) {
            recommendations.push({
                type: 'engagement',
                title: 'Improve Class Engagement',
                description: `${lowEngagementClasses.length} classes have low submission rates. Consider creating more engaging quizzes or reminding students to participate.`,
                priority: 'high',
                classes: lowEngagementClasses.map(cls => cls.name)
            });
        }

        // Check for subjects with low performance
        const subjectPerformance = this.calculateSubjectPerformance(classes, quizzes, submissions);
        const lowPerformingSubjects = subjectPerformance.filter(subject => subject.averageScore < 70);

        if (lowPerformingSubjects.length > 0) {
            recommendations.push({
                type: 'performance',
                title: 'Focus on Challenging Subjects',
                description: `Students are struggling with ${lowPerformingSubjects.map(s => s.subject).join(', ')}. Consider additional practice or different teaching approaches.`,
                priority: 'medium',
                subjects: lowPerformingSubjects
            });
        }

        return recommendations;
    }

    // Export for use in other files
    getCurrentUser() {
        return this.currentUser;
    }

    isInitialized() {
        return this.isInitialized;
    }
}

// Initialize global instance
window.unifiedAnalyticsManager = new UnifiedAnalyticsManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedAnalyticsManager;
}

console.log('📊 Unified Analytics Manager loaded and initialized');
