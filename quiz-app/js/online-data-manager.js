// Online Database Manager - Firebase Integration
// This replaces localStorage with Firebase Firestore for online data storage

class OnlineDataManager {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.config = {
            apiKey: "your-api-key",
            authDomain: "gesturequiz-platform.firebaseapp.com",
            projectId: "gesturequiz-platform",
            storageBucket: "gesturequiz-platform.appspot.com",
            messagingSenderId: "your-sender-id",
            appId: "your-app-id"
        };
    }

    // Initialize Firebase
    async initialize() {
        if (this.initialized) return;

        try {
            // Load Firebase scripts dynamically
            await this.loadFirebaseScripts();
            
            // Initialize Firebase
            firebase.initializeApp(this.config);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            this.initialized = true;
            console.log('🔥 Firebase initialized successfully');
            
            // Setup authentication state listener
            this.setupAuthListener();
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            // Fallback to localStorage if Firebase fails
            this.fallbackToLocalStorage();
        }
    }

    // Load Firebase scripts
    async loadFirebaseScripts() {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js'
        ];

        for (const src of scripts) {
            await this.loadScript(src);
        }
    }

    // Load single script
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Setup authentication state listener
    setupAuthListener() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ User authenticated:', user.email);
                this.currentUser = user;
            } else {
                console.log('❌ User not authenticated');
                this.currentUser = null;
            }
        });
    }

    // User Authentication
    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return {
                success: true,
                user: userCredential.user,
                message: 'Successfully signed in'
            };
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signUp(email, password, userData) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Save user profile to Firestore
            await this.db.collection('users').doc(user.uid).set({
                email: email,
                name: userData.name,
                role: userData.role,
                avatar: userData.avatar || '👤',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                success: true,
                user: user,
                message: 'Account created successfully'
            };
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    // User Profile Management
    async updateProfile(userId, profileData) {
        try {
            await this.db.collection('users').doc(userId).update({
                ...profileData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Profile update failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserProfile(userId) {
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            if (doc.exists) {
                return { success: true, data: doc.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('❌ Get user profile failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Quiz Management
    async createQuiz(quizData) {
        try {
            const docRef = await this.db.collection('quizzes').add({
                ...quizData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Create quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    async updateQuiz(quizId, quizData) {
        try {
            await this.db.collection('quizzes').doc(quizId).update({
                ...quizData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Update quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteQuiz(quizId) {
        try {
            await this.db.collection('quizzes').doc(quizId).delete();
            return { success: true };
        } catch (error) {
            console.error('❌ Delete quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuizzes(userId) {
        try {
            const snapshot = await this.db.collection('quizzes')
                .where('createdBy', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const quizzes = [];
            snapshot.forEach((doc) => {
                quizzes.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: quizzes };
        } catch (error) {
            console.error('❌ Get quizzes failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Class Management
    async createClass(classData) {
        try {
            const docRef = await this.db.collection('classes').add({
                ...classData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Create class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async updateClass(classId, classData) {
        try {
            await this.db.collection('classes').doc(classId).update({
                ...classData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Update class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteClass(classId) {
        try {
            await this.db.collection('classes').doc(classId).delete();
            return { success: true };
        } catch (error) {
            console.error('❌ Delete class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getClasses(userId) {
        try {
            const snapshot = await this.db.collection('classes')
                .where('createdBy', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const classes = [];
            snapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: classes };
        } catch (error) {
            console.error('❌ Get classes failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Student Management
    async addStudentToClass(classId, studentData) {
        try {
            await this.db.collection('classes').doc(classId).update({
                students: firebase.firestore.FieldValue.arrayUnion(studentData),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Add student to class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async removeStudentFromClass(classId, studentId) {
        try {
            const classDoc = await this.db.collection('classes').doc(classId).get();
            if (classDoc.exists) {
                const classData = classDoc.data();
                const updatedStudents = classData.students.filter(s => s.id !== studentId);
                
                await this.db.collection('classes').doc(classId).update({
                    students: updatedStudents,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                return { success: true };
            }
            return { success: false, error: 'Class not found' };
        } catch (error) {
            console.error('❌ Remove student from class failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Analytics and Results
    async saveQuizResult(resultData) {
        try {
            const docRef = await this.db.collection('results').add({
                ...resultData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Save quiz result failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuizResults(quizId) {
        try {
            const snapshot = await this.db.collection('results')
                .where('quizId', '==', quizId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const results = [];
            snapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: results };
        } catch (error) {
            console.error('❌ Get quiz results failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getAnalytics(userId) {
        try {
            // Get all quizzes for the user
            const quizzesResult = await this.getQuizzes(userId);
            if (!quizzesResult.success) return quizzesResult;
            
            // Get all classes for the user
            const classesResult = await this.getClasses(userId);
            if (!classesResult.success) return classesResult;
            
            // Calculate analytics
            const totalQuizzes = quizzesResult.data.length;
            const totalClasses = classesResult.data.length;
            const totalStudents = classesResult.data.reduce((sum, cls) => sum + (cls.students ? cls.students.length : 0), 0);
            
            return {
                success: true,
                data: {
                    overview: {
                        totalQuizzes,
                        totalClasses,
                        totalStudents,
                        averageScore: 85 // Calculate from actual results
                    },
                    engagement: {
                        completionRate: 78,
                        averageTime: 12.5
                    }
                }
            };
        } catch (error) {
            console.error('❌ Get analytics failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Fallback to localStorage if Firebase fails
    fallbackToLocalStorage() {
        console.warn('⚠️  Falling back to localStorage');
        
        // Implement localStorage fallback methods
        this.getItem = (key) => {
            try {
                return JSON.parse(localStorage.getItem(key) || 'null');
            } catch {
                return null;
            }
        };

        this.setItem = (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        };

        this.removeItem = (key) => {
            try {
                localStorage.removeItem(key);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        };
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isOnline() {
        return navigator.onLine && this.initialized;
    }

    // Sync offline data when coming back online
    async syncOfflineData() {
        if (!this.isOnline()) return;

        try {
            // Get offline data from localStorage
            const offlineData = this.getItem('offlineData') || {};
            
            // Sync each data type
            for (const [key, value] of Object.entries(offlineData)) {
                await this.syncDataType(key, value);
            }
            
            // Clear offline data after successful sync
            this.removeItem('offlineData');
            
            console.log('✅ Offline data synced successfully');
        } catch (error) {
            console.error('❌ Offline sync failed:', error);
        }
    }

    async syncDataType(type, data) {
        switch (type) {
            case 'quizzes':
                for (const quiz of data) {
                    if (quiz.id.startsWith('offline_')) {
                        await this.createQuiz(quiz);
                    }
                }
                break;
            case 'classes':
                for (const cls of data) {
                    if (cls.id.startsWith('offline_')) {
                        await this.createClass(cls);
                    }
                }
                break;
            // Add more sync types as needed
        }
    }
}

// Export for use
window.OnlineDataManager = OnlineDataManager;
