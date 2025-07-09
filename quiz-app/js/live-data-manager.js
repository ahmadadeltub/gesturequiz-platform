// Complete Data Management System for Live Website
// This system will handle all data synchronization, user management, and real-time updates

class LiveDataManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.wsConnection = null;
        this.syncInterval = null;
        this.isOnline = navigator.onLine;
        this.pendingSync = [];
        this.lastSync = localStorage.getItem('lastSync') || '0';
        
        this.initializeSystem();
        this.setupEventListeners();
        this.startPeriodicSync();
    }

    initializeSystem() {
        try {
            // Initialize all data structures
            this.initializeDataStructures();
            
            // Setup offline/online handling (call directly since it's defined in this class)
            this.setupOfflineHandling();
            
            // Setup real-time sync
            this.setupRealtimeSync();
            
            // Setup cross-tab communication
            this.setupCrossTabSync();
        } catch (error) {
            console.error('❌ Error initializing live data manager:', error);
        }
    }

    initializeDataStructures() {
        // Core data structures for live system
        const dataStructures = {
            users: '[]',
            classes: '[]',
            quizzes: '[]',
            submissions: '[]',
            progress: '[]',
            notifications: '[]',
            settings: '{}',
            cache: '{}'
        };

        Object.keys(dataStructures).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, dataStructures[key]);
            }
        });
    }

    setupOfflineHandling() {
        // Handle online/offline status
        this.isOnline = navigator.onLine;
        
        // Set up online/offline event listeners
        window.addEventListener('online', () => {
            console.log('🌐 Back online - resuming sync');
            this.isOnline = true;
            this.syncPendingChanges();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Gone offline - enabling offline mode');
            this.isOnline = false;
        });
        
        // Check connection status periodically
        setInterval(() => {
            const wasOnline = this.isOnline;
            this.isOnline = navigator.onLine;
            
            if (!wasOnline && this.isOnline) {
                console.log('🔄 Connection restored - syncing pending changes');
                this.syncPendingChanges();
            }
        }, 5000);
        
        console.log(`🔌 Offline handling initialized - Status: ${this.isOnline ? 'Online' : 'Offline'}`);
    }

    setupEventListeners() {
        // Storage events for cross-tab sync
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
        
        // Online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Page visibility for sync optimization
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Before unload for cleanup
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    // User Management
    async createUser(userData) {
        const user = {
            id: this.generateId('user'),
            ...userData,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            status: 'active'
        };
        
        await this.saveData('users', user);
        await this.syncToServer('users', user);
        return user;
    }

    async updateUser(userId, updates) {
        const users = await this.getData('users');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
            await this.saveData('users', users[userIndex], 'update');
            await this.syncToServer('users', users[userIndex]);
            return users[userIndex];
        }
        throw new Error('User not found');
    }

    // Class Management
    async createClass(classData) {
        const newClass = {
            id: this.generateId('class'),
            ...classData,
            code: this.generateClassCode(),
            createdBy: this.currentUser.id,
            createdAt: new Date().toISOString(),
            students: [],
            quizzes: [],
            status: 'active'
        };
        
        await this.saveData('classes', newClass);
        await this.syncToServer('classes', newClass);
        this.notifyUpdate('classes', newClass);
        return newClass;
    }

    async updateClass(classId, updates) {
        const classes = await this.getData('classes');
        const classIndex = classes.findIndex(c => c.id === classId);
        
        if (classIndex !== -1) {
            classes[classIndex] = { ...classes[classIndex], ...updates, updatedAt: new Date().toISOString() };
            await this.saveData('classes', classes[classIndex], 'update');
            await this.syncToServer('classes', classes[classIndex]);
            this.notifyUpdate('classes', classes[classIndex]);
            return classes[classIndex];
        }
        throw new Error('Class not found');
    }

    async enrollStudent(classId, studentData) {
        const classes = await this.getData('classes');
        const classIndex = classes.findIndex(c => c.id === classId);
        
        if (classIndex !== -1) {
            const student = {
                id: this.generateId('student'),
                ...studentData,
                enrolledAt: new Date().toISOString(),
                status: 'active'
            };
            
            classes[classIndex].students.push(student);
            await this.saveData('classes', classes[classIndex], 'update');
            await this.syncToServer('classes', classes[classIndex]);
            this.notifyUpdate('classes', classes[classIndex]);
            return student;
        }
        throw new Error('Class not found');
    }

    // Quiz Management
    async createQuiz(quizData) {
        const quiz = {
            id: this.generateId('quiz'),
            ...quizData,
            createdBy: this.currentUser.id,
            createdAt: new Date().toISOString(),
            published: false,
            submissions: [],
            analytics: {
                totalAttempts: 0,
                averageScore: 0,
                completionRate: 0
            }
        };
        
        await this.saveData('quizzes', quiz);
        await this.syncToServer('quizzes', quiz);
        this.notifyUpdate('quizzes', quiz);
        return quiz;
    }

    async publishQuiz(quizId) {
        const quiz = await this.updateQuiz(quizId, { 
            published: true, 
            publishedAt: new Date().toISOString() 
        });
        
        // Notify all students in the class
        await this.notifyStudentsOfNewQuiz(quiz);
        return quiz;
    }

    async submitQuiz(quizId, answers) {
        const submission = {
            id: this.generateId('submission'),
            quizId: quizId,
            studentId: this.currentUser.id,
            answers: answers,
            submittedAt: new Date().toISOString(),
            score: this.calculateScore(answers),
            timeSpent: this.calculateTimeSpent()
        };
        
        await this.saveData('submissions', submission);
        await this.updateQuizAnalytics(quizId);
        await this.updateStudentProgress(submission);
        await this.syncToServer('submissions', submission);
        this.notifyUpdate('submissions', submission);
        return submission;
    }

    // Data Management
    async getData(type, filter = null) {
        const data = JSON.parse(localStorage.getItem(type) || '[]');
        return filter ? data.filter(filter) : data;
    }

    async saveData(type, item, action = 'create') {
        const data = await this.getData(type);
        
        if (action === 'create') {
            data.push(item);
        } else if (action === 'update') {
            const index = data.findIndex(d => d.id === item.id);
            if (index !== -1) {
                data[index] = item;
            }
        }
        
        localStorage.setItem(type, JSON.stringify(data));
        this.addToPendingSync(type, item, action);
    }

    // Real-time Sync
    setupRealtimeSync() {
        // WebSocket connection for real-time updates
        // This would connect to your live server
        if (this.isOnline) {
            this.connectWebSocket();
        }
    }

    connectWebSocket() {
        // WebSocket connection logic for live server
        // const wsUrl = 'wss://your-server.com/ws';
        // this.wsConnection = new WebSocket(wsUrl);
        
        // For now, simulate with periodic sync
        console.log('WebSocket connection would be established here for live server');
    }

    startPeriodicSync() {
        this.syncInterval = setInterval(() => {
            if (this.isOnline && this.pendingSync.length > 0) {
                this.syncPendingData();
            }
        }, 5000); // Sync every 5 seconds
    }

    async syncPendingData() {
        const toSync = [...this.pendingSync];
        this.pendingSync = [];
        
        for (const item of toSync) {
            try {
                await this.syncToServer(item.type, item.data);
            } catch (error) {
                console.error('Sync failed:', error);
                this.pendingSync.push(item); // Re-add to pending
            }
        }
    }

    async syncToServer(type, data) {
        // This would sync to your live server
        // For now, simulate successful sync
        console.log(`Syncing ${type} data to server:`, data);
        localStorage.setItem('lastSync', Date.now().toString());
        return Promise.resolve();
    }

    // Cross-tab Communication
    setupCrossTabSync() {
        // Enable real-time updates across browser tabs
        this.broadcastChannel = new BroadcastChannel('gesturequiz-sync');
        this.broadcastChannel.onmessage = (event) => {
            this.handleCrossTabMessage(event.data);
        };
    }

    notifyUpdate(type, data) {
        // Notify other tabs of updates
        this.broadcastChannel.postMessage({
            type: 'data-update',
            dataType: type,
            data: data,
            timestamp: Date.now()
        });
    }

    handleCrossTabMessage(message) {
        if (message.type === 'data-update') {
            // Update local data and refresh UI
            this.refreshUI(message.dataType, message.data);
        }
    }

    // Analytics and Reporting
    async getAnalytics(type = 'all') {
        const analytics = {
            users: await this.getUserAnalytics(),
            classes: await this.getClassAnalytics(),
            quizzes: await this.getQuizAnalytics(),
            engagement: await this.getEngagementAnalytics()
        };
        
        return type === 'all' ? analytics : analytics[type];
    }

    async getUserAnalytics() {
        const users = await this.getData('users');
        const submissions = await this.getData('submissions');
        
        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            newUsersToday: users.filter(u => this.isToday(u.createdAt)).length,
            usersByType: this.groupBy(users, 'type'),
            averageActivityScore: this.calculateAverageActivity(users, submissions)
        };
    }

    async getClassAnalytics() {
        const classes = await this.getData('classes');
        const submissions = await this.getData('submissions');
        
        return {
            totalClasses: classes.length,
            activeClasses: classes.filter(c => c.status === 'active').length,
            totalStudents: classes.reduce((sum, c) => sum + c.students.length, 0),
            classPerformance: await this.calculateClassPerformance(classes, submissions),
            engagementRates: await this.calculateEngagementRates(classes, submissions)
        };
    }

    async getQuizAnalytics() {
        const quizzes = await this.getData('quizzes');
        const submissions = await this.getData('submissions');
        
        return {
            totalQuizzes: quizzes.length,
            publishedQuizzes: quizzes.filter(q => q.published).length,
            totalSubmissions: submissions.length,
            averageScore: this.calculateOverallAverageScore(submissions),
            completionRates: await this.calculateCompletionRates(quizzes, submissions),
            popularQuizzes: await this.getPopularQuizzes(quizzes, submissions)
        };
    }

    // Utility Functions
    generateId(type) {
        return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    generateClassCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    calculateScore(answers) {
        // Calculate quiz score based on answers
        const correct = answers.filter(a => a.correct).length;
        return Math.round((correct / answers.length) * 100);
    }

    calculateTimeSpent() {
        // Calculate time spent on quiz
        const startTime = parseInt(localStorage.getItem('quizStartTime') || '0');
        return Date.now() - startTime;
    }

    isToday(dateString) {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    addToPendingSync(type, data, action) {
        this.pendingSync.push({
            type: type,
            data: data,
            action: action,
            timestamp: Date.now()
        });
    }

    handleStorageChange(event) {
        if (event.key && event.newValue) {
            this.refreshUI(event.key, JSON.parse(event.newValue));
        }
    }

    handleOnline() {
        this.isOnline = true;
        this.connectWebSocket();
        this.syncPendingData();
    }

    handleOffline() {
        this.isOnline = false;
        if (this.wsConnection) {
            this.wsConnection.close();
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, reduce sync frequency
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = setInterval(() => this.syncPendingData(), 30000); // 30 seconds
            }
        } else {
            // Page is visible, increase sync frequency
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.startPeriodicSync();
            }
        }
    }

    refreshUI(dataType, data) {
        // This will be overridden by each page to refresh their specific UI
        console.log(`Refreshing UI for ${dataType}:`, data);
        
        // Trigger custom event for pages to listen to
        const event = new CustomEvent('dataUpdate', {
            detail: { type: dataType, data: data }
        });
        document.dispatchEvent(event);
    }

    cleanup() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        if (this.wsConnection) {
            this.wsConnection.close();
        }
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
        }
    }
}

// Initialize the live data manager
const liveDataManager = new LiveDataManager();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.liveDataManager = liveDataManager;
}