// API Simulation Layer for Live Website Preparation
// This layer simulates a real backend API for seamless transition to live server

class APISimulator {
    constructor() {
        this.baseUrl = 'https://api.gesturequiz.com'; // Future live API URL
        this.isSimulation = true; // Set to false when connecting to live server
        this.requestDelay = 500; // Simulate network delay
        this.authToken = localStorage.getItem('authToken');
        
        this.setupInterceptors();
    }

    setupInterceptors() {
        // Setup request/response interceptors for future axios/fetch integration
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': this.authToken ? `Bearer ${this.authToken}` : ''
        };
    }

    // Simulate network delay
    async simulateDelay(ms = this.requestDelay) {
        if (this.isSimulation) {
            await new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Authentication APIs
    async login(credentials) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            // Simulate login validation
            const { email, password, type } = credentials;
            
            if (email && password) {
                const user = {
                    id: this.generateId('user'),
                    email: email,
                    name: email.split('@')[0],
                    type: type,
                    token: this.generateToken(),
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('authToken', user.token);
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                return { success: true, user: user };
            }
            throw new Error('Invalid credentials');
        }
        
        // Real API call would go here
        return fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: JSON.stringify(credentials)
        });
    }

    async register(userData) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const user = {
                id: this.generateId('user'),
                ...userData,
                token: this.generateToken(),
                registrationTime: new Date().toISOString()
            };
            
            localStorage.setItem('authToken', user.token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            return { success: true, user: user };
        }
        
        return fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: JSON.stringify(userData)
        });
    }

    async logout() {
        await this.simulateDelay();
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        if (this.isSimulation) {
            return { success: true };
        }
        
        return fetch(`${this.baseUrl}/auth/logout`, {
            method: 'POST',
            headers: this.defaultHeaders
        });
    }

    // User Management APIs
    async getUsers(filters = {}) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            return { success: true, data: this.applyFilters(users, filters) };
        }
        
        const queryParams = new URLSearchParams(filters);
        return fetch(`${this.baseUrl}/users?${queryParams}`, {
            headers: this.defaultHeaders
        });
    }

    async updateUser(userId, updates) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updates };
                localStorage.setItem('users', JSON.stringify(users));
                return { success: true, data: users[userIndex] };
            }
            throw new Error('User not found');
        }
        
        return fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'PUT',
            headers: this.defaultHeaders,
            body: JSON.stringify(updates)
        });
    }

    // Class Management APIs
    async getClasses(filters = {}) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
            return { success: true, data: this.applyFilters(classes, filters) };
        }
        
        const queryParams = new URLSearchParams(filters);
        return fetch(`${this.baseUrl}/classes?${queryParams}`, {
            headers: this.defaultHeaders
        });
    }

    async createClass(classData) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
            const newClass = {
                id: this.generateId('class'),
                ...classData,
                code: this.generateClassCode(),
                createdAt: new Date().toISOString(),
                students: []
            };
            
            classes.push(newClass);
            localStorage.setItem('teacherClasses', JSON.stringify(classes));
            return { success: true, data: newClass };
        }
        
        return fetch(`${this.baseUrl}/classes`, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: JSON.stringify(classData)
        });
    }

    async updateClass(classId, updates) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
            const classIndex = classes.findIndex(c => c.id === classId);
            
            if (classIndex !== -1) {
                classes[classIndex] = { ...classes[classIndex], ...updates };
                localStorage.setItem('teacherClasses', JSON.stringify(classes));
                return { success: true, data: classes[classIndex] };
            }
            throw new Error('Class not found');
        }
        
        return fetch(`${this.baseUrl}/classes/${classId}`, {
            method: 'PUT',
            headers: this.defaultHeaders,
            body: JSON.stringify(updates)
        });
    }

    async deleteClass(classId) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
            const filteredClasses = classes.filter(c => c.id !== classId);
            localStorage.setItem('teacherClasses', JSON.stringify(filteredClasses));
            return { success: true };
        }
        
        return fetch(`${this.baseUrl}/classes/${classId}`, {
            method: 'DELETE',
            headers: this.defaultHeaders
        });
    }

    // Quiz Management APIs
    async getQuizzes(filters = {}) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const quizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
            return { success: true, data: this.applyFilters(quizzes, filters) };
        }
        
        const queryParams = new URLSearchParams(filters);
        return fetch(`${this.baseUrl}/quizzes?${queryParams}`, {
            headers: this.defaultHeaders
        });
    }

    async createQuiz(quizData) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const quizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
            const newQuiz = {
                id: this.generateId('quiz'),
                ...quizData,
                createdAt: new Date().toISOString(),
                published: false
            };
            
            quizzes.push(newQuiz);
            localStorage.setItem('teacherQuizzes', JSON.stringify(quizzes));
            return { success: true, data: newQuiz };
        }
        
        return fetch(`${this.baseUrl}/quizzes`, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: JSON.stringify(quizData)
        });
    }

    async updateQuiz(quizId, updates) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const quizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
            const quizIndex = quizzes.findIndex(q => q.id === quizId);
            
            if (quizIndex !== -1) {
                quizzes[quizIndex] = { ...quizzes[quizIndex], ...updates };
                localStorage.setItem('teacherQuizzes', JSON.stringify(quizzes));
                return { success: true, data: quizzes[quizIndex] };
            }
            throw new Error('Quiz not found');
        }
        
        return fetch(`${this.baseUrl}/quizzes/${quizId}`, {
            method: 'PUT',
            headers: this.defaultHeaders,
            body: JSON.stringify(updates)
        });
    }

    async publishQuiz(quizId) {
        return this.updateQuiz(quizId, { 
            published: true, 
            publishedAt: new Date().toISOString() 
        });
    }

    // Submission and Progress APIs
    async submitQuiz(quizId, submission) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const submissions = JSON.parse(localStorage.getItem('quizResults') || '[]');
            const progress = JSON.parse(localStorage.getItem('studentProgress') || '[]');
            
            const newSubmission = {
                id: this.generateId('submission'),
                quizId: quizId,
                ...submission,
                submittedAt: new Date().toISOString()
            };
            
            submissions.push(newSubmission);
            localStorage.setItem('quizResults', JSON.stringify(submissions));
            
            // Update progress
            const progressEntry = {
                id: this.generateId('progress'),
                ...newSubmission,
                completedAt: new Date().toISOString()
            };
            
            progress.push(progressEntry);
            localStorage.setItem('studentProgress', JSON.stringify(progress));
            
            return { success: true, data: newSubmission };
        }
        
        return fetch(`${this.baseUrl}/quizzes/${quizId}/submit`, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: JSON.stringify(submission)
        });
    }

    async getProgress(filters = {}) {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const progress = JSON.parse(localStorage.getItem('studentProgress') || '[]');
            return { success: true, data: this.applyFilters(progress, filters) };
        }
        
        const queryParams = new URLSearchParams(filters);
        return fetch(`${this.baseUrl}/progress?${queryParams}`, {
            headers: this.defaultHeaders
        });
    }

    // Analytics APIs
    async getAnalytics(type = 'dashboard') {
        await this.simulateDelay();
        
        if (this.isSimulation) {
            const analytics = await this.generateAnalytics(type);
            return { success: true, data: analytics };
        }
        
        return fetch(`${this.baseUrl}/analytics/${type}`, {
            headers: this.defaultHeaders
        });
    }

    async generateAnalytics(type) {
        const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
        const quizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
        const submissions = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const progress = JSON.parse(localStorage.getItem('studentProgress') || '[]');
        
        const analytics = {
            overview: {
                totalClasses: classes.length,
                totalStudents: classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0),
                totalQuizzes: quizzes.length,
                totalSubmissions: submissions.length,
                averageScore: submissions.length > 0 ? 
                    submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length : 0
            },
            engagement: {
                activeStudents: this.calculateActiveStudents(progress),
                completionRate: this.calculateCompletionRate(quizzes, submissions),
                averageTimeSpent: this.calculateAverageTimeSpent(submissions)
            },
            performance: {
                classPerformance: this.calculateClassPerformance(classes, submissions),
                quizPerformance: this.calculateQuizPerformance(quizzes, submissions),
                topPerformers: this.getTopPerformers(submissions)
            },
            trends: {
                dailyActivity: this.calculateDailyActivity(submissions),
                weeklyProgress: this.calculateWeeklyProgress(progress),
                monthlyGrowth: this.calculateMonthlyGrowth(classes, quizzes)
            }
        };
        
        return type === 'dashboard' ? analytics : analytics[type];
    }

    // Real-time Updates
    async subscribeToUpdates(callback) {
        if (this.isSimulation) {
            // Simulate real-time updates with polling
            setInterval(async () => {
                const updates = await this.checkForUpdates();
                if (updates.length > 0) {
                    callback(updates);
                }
            }, 5000);
        } else {
            // Real WebSocket connection would go here
            const ws = new WebSocket(`${this.baseUrl.replace('https', 'wss')}/ws`);
            ws.onmessage = (event) => {
                const update = JSON.parse(event.data);
                callback([update]);
            };
        }
    }

    async checkForUpdates() {
        // Simulate checking for updates
        const lastCheck = localStorage.getItem('lastUpdateCheck') || '0';
        const now = Date.now();
        
        if (now - parseInt(lastCheck) > 10000) { // 10 seconds
            localStorage.setItem('lastUpdateCheck', now.toString());
            return []; // No updates for simulation
        }
        
        return [];
    }

    // Utility Functions
    generateId(type) {
        return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    generateToken() {
        return btoa(Date.now() + Math.random().toString(36));
    }

    generateClassCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    applyFilters(data, filters) {
        return data.filter(item => {
            return Object.keys(filters).every(key => {
                return !filters[key] || item[key] === filters[key];
            });
        });
    }

    calculateActiveStudents(progress) {
        const recentActivity = progress.filter(p => {
            const date = new Date(p.completedAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return date > weekAgo;
        });
        
        return [...new Set(recentActivity.map(p => p.studentEmail))].length;
    }

    calculateCompletionRate(quizzes, submissions) {
        if (quizzes.length === 0) return 0;
        
        const publishedQuizzes = quizzes.filter(q => q.published);
        const completedQuizzes = [...new Set(submissions.map(s => s.quizId))];
        
        return publishedQuizzes.length > 0 ? 
            (completedQuizzes.length / publishedQuizzes.length) * 100 : 0;
    }

    calculateAverageTimeSpent(submissions) {
        if (submissions.length === 0) return 0;
        
        const totalTime = submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
        return totalTime / submissions.length;
    }

    calculateClassPerformance(classes, submissions) {
        return classes.map(cls => {
            const classSubmissions = submissions.filter(s => s.classId === cls.id);
            const avgScore = classSubmissions.length > 0 ? 
                classSubmissions.reduce((sum, s) => sum + s.score, 0) / classSubmissions.length : 0;
            
            return {
                className: cls.name,
                averageScore: Math.round(avgScore),
                submissions: classSubmissions.length,
                studentCount: cls.students?.length || 0
            };
        });
    }

    calculateQuizPerformance(quizzes, submissions) {
        return quizzes.map(quiz => {
            const quizSubmissions = submissions.filter(s => s.quizId === quiz.id);
            const avgScore = quizSubmissions.length > 0 ? 
                quizSubmissions.reduce((sum, s) => sum + s.score, 0) / quizSubmissions.length : 0;
            
            return {
                quizTitle: quiz.title,
                averageScore: Math.round(avgScore),
                submissions: quizSubmissions.length,
                difficulty: avgScore >= 80 ? 'Easy' : avgScore >= 60 ? 'Medium' : 'Hard'
            };
        });
    }

    getTopPerformers(submissions) {
        const studentScores = {};
        
        submissions.forEach(submission => {
            if (!studentScores[submission.studentEmail]) {
                studentScores[submission.studentEmail] = {
                    name: submission.studentName,
                    email: submission.studentEmail,
                    scores: []
                };
            }
            studentScores[submission.studentEmail].scores.push(submission.score);
        });
        
        return Object.values(studentScores)
            .map(student => ({
                ...student,
                averageScore: student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length
            }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 10);
    }

    calculateDailyActivity(submissions) {
        const daily = {};
        
        submissions.forEach(submission => {
            const date = new Date(submission.submittedAt).toDateString();
            daily[date] = (daily[date] || 0) + 1;
        });
        
        return Object.keys(daily).map(date => ({
            date: date,
            count: daily[date]
        }));
    }

    calculateWeeklyProgress(progress) {
        const weekly = {};
        
        progress.forEach(p => {
            const week = this.getWeekNumber(new Date(p.completedAt));
            weekly[week] = (weekly[week] || 0) + 1;
        });
        
        return Object.keys(weekly).map(week => ({
            week: week,
            count: weekly[week]
        }));
    }

    calculateMonthlyGrowth(classes, quizzes) {
        const monthly = {};
        
        [...classes, ...quizzes].forEach(item => {
            const month = new Date(item.createdAt).toISOString().slice(0, 7);
            monthly[month] = (monthly[month] || 0) + 1;
        });
        
        return Object.keys(monthly).map(month => ({
            month: month,
            count: monthly[month]
        }));
    }

    getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }
}

// Initialize API simulator
const apiSimulator = new APISimulator();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.apiSimulator = apiSimulator;
}
