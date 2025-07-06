// Hybrid Storage Manager - Works with both localStorage and Firebase
// This provides online storage with localStorage fallback

class HybridStorageManager {
    constructor() {
        this.useFirebase = false;
        this.firebase = null;
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        
        // Firebase config - UPDATE WITH YOUR KEYS
        this.firebaseConfig = {
            apiKey: "demo-key", // Replace with your actual API key
            authDomain: "gesturequiz-demo.firebaseapp.com",
            projectId: "gesturequiz-demo",
            storageBucket: "gesturequiz-demo.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abcdef123456"
        };
    }

    async initialize() {
        try {
            // Try to initialize Firebase
            await this.initializeFirebase();
            console.log('🔥 Firebase initialized - Using online storage');
        } catch (error) {
            console.warn('⚠️  Firebase initialization failed, using localStorage fallback');
            this.useFirebase = false;
        }
    }

    async initializeFirebase() {
        // Check if Firebase is already loaded
        if (typeof firebase !== 'undefined') {
            this.firebase = firebase;
        } else {
            // Load Firebase scripts
            await this.loadFirebaseScripts();
            this.firebase = firebase;
        }

        // Initialize Firebase
        this.firebase.initializeApp(this.firebaseConfig);
        this.db = this.firebase.firestore();
        this.auth = this.firebase.auth();
        this.useFirebase = true;

        // Set up auth state listener
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ User authenticated:', user.email);
            }
        });
    }

    async loadFirebaseScripts() {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js',
            'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js'
        ];

        for (const src of scripts) {
            await this.loadScript(src);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // User Management
    async signIn(email, password) {
        if (this.useFirebase) {
            try {
                const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
                return { success: true, user: userCredential.user };
            } catch (error) {
                return { success: false, error: error.message };
            }
        } else {
            // Fallback to localStorage authentication
            return this.localSignIn(email, password);
        }
    }

    async signUp(email, password, userData) {
        if (this.useFirebase) {
            try {
                const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
                
                // Save user profile
                await this.db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    name: userData.name,
                    role: userData.role,
                    avatar: userData.avatar || '👤',
                    createdAt: this.firebase.firestore.FieldValue.serverTimestamp()
                });

                return { success: true, user: userCredential.user };
            } catch (error) {
                return { success: false, error: error.message };
            }
        } else {
            // Fallback to localStorage
            return this.localSignUp(email, password, userData);
        }
    }

    async signOut() {
        if (this.useFirebase) {
            await this.auth.signOut();
        } else {
            localStorage.removeItem('currentUser');
        }
        this.currentUser = null;
    }

    // Data Management
    async saveData(collection, data) {
        if (this.useFirebase && this.currentUser) {
            try {
                const docRef = await this.db.collection(collection).add({
                    ...data,
                    userId: this.currentUser.uid,
                    createdAt: this.firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Firebase save failed, using localStorage:', error);
                return this.localSaveData(collection, data);
            }
        } else {
            return this.localSaveData(collection, data);
        }
    }

    async getData(collection) {
        if (this.useFirebase && this.currentUser) {
            try {
                const snapshot = await this.db.collection(collection)
                    .where('userId', '==', this.currentUser.uid)
                    .get();
                
                const data = [];
                snapshot.forEach(doc => {
                    data.push({ id: doc.id, ...doc.data() });
                });
                
                return { success: true, data: data };
            } catch (error) {
                console.error('Firebase get failed, using localStorage:', error);
                return this.localGetData(collection);
            }
        } else {
            return this.localGetData(collection);
        }
    }

    async updateData(collection, id, data) {
        if (this.useFirebase && this.currentUser) {
            try {
                await this.db.collection(collection).doc(id).update({
                    ...data,
                    updatedAt: this.firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true };
            } catch (error) {
                console.error('Firebase update failed, using localStorage:', error);
                return this.localUpdateData(collection, id, data);
            }
        } else {
            return this.localUpdateData(collection, id, data);
        }
    }

    async deleteData(collection, id) {
        if (this.useFirebase && this.currentUser) {
            try {
                await this.db.collection(collection).doc(id).delete();
                return { success: true };
            } catch (error) {
                console.error('Firebase delete failed, using localStorage:', error);
                return this.localDeleteData(collection, id);
            }
        } else {
            return this.localDeleteData(collection, id);
        }
    }

    // localStorage Fallback Methods
    localSignIn(email, password) {
        const testUsers = [
            { email: 'teacher@gesturequiz.com', password: 'password123', name: 'Dr. Sarah Johnson', role: 'teacher', avatar: '👩‍🏫' },
            { email: 'student@gesturequiz.com', password: 'password123', name: 'Alex Student', role: 'student', avatar: '👨‍🎓' },
            { email: 'student2@gesturequiz.com', password: 'password123', name: 'Emma Student', role: 'student', avatar: '👩‍🎓' }
        ];

        const user = testUsers.find(u => u.email === email && u.password === password);
        if (user) {
            const userData = { ...user };
            delete userData.password;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            this.currentUser = userData;
            return { success: true, user: userData };
        }
        
        return { success: false, error: 'Invalid credentials' };
    }

    localSignUp(email, password, userData) {
        // In a real app, you'd validate and store properly
        const user = { email, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
        return { success: true, user: user };
    }

    localSaveData(collection, data) {
        try {
            const existing = JSON.parse(localStorage.getItem(collection) || '[]');
            const newData = { ...data, id: this.generateId() };
            existing.push(newData);
            localStorage.setItem(collection, JSON.stringify(existing));
            return { success: true, id: newData.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    localGetData(collection) {
        try {
            const data = JSON.parse(localStorage.getItem(collection) || '[]');
            return { success: true, data: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    localUpdateData(collection, id, data) {
        try {
            const existing = JSON.parse(localStorage.getItem(collection) || '[]');
            const index = existing.findIndex(item => item.id === id);
            if (index !== -1) {
                existing[index] = { ...existing[index], ...data };
                localStorage.setItem(collection, JSON.stringify(existing));
                return { success: true };
            }
            return { success: false, error: 'Item not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    localDeleteData(collection, id) {
        try {
            const existing = JSON.parse(localStorage.getItem(collection) || '[]');
            const filtered = existing.filter(item => item.id !== id);
            localStorage.setItem(collection, JSON.stringify(filtered));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCurrentUser() {
        if (this.useFirebase) {
            return this.currentUser;
        } else {
            return JSON.parse(localStorage.getItem('currentUser') || 'null');
        }
    }

    isOnline() {
        return this.useFirebase && navigator.onLine;
    }

    // Specific methods for the app
    async saveQuiz(quizData) {
        return await this.saveData('quizzes', quizData);
    }

    async getQuizzes() {
        return await this.getData('quizzes');
    }

    async updateQuiz(id, quizData) {
        return await this.updateData('quizzes', id, quizData);
    }

    async deleteQuiz(id) {
        return await this.deleteData('quizzes', id);
    }

    async saveClass(classData) {
        return await this.saveData('classes', classData);
    }

    async getClasses() {
        return await this.getData('classes');
    }

    async updateClass(id, classData) {
        return await this.updateData('classes', id, classData);
    }

    async deleteClass(id) {
        return await this.deleteData('classes', id);
    }

    async saveProfile(profileData) {
        if (this.useFirebase && this.currentUser) {
            try {
                await this.db.collection('users').doc(this.currentUser.uid).update(profileData);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        } else {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                const updatedUser = { ...currentUser, ...profileData };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                this.currentUser = updatedUser;
                return { success: true };
            }
            return { success: false, error: 'No user logged in' };
        }
    }

    showStatus() {
        if (this.useFirebase) {
            console.log('🔥 Using Firebase (Online Storage)');
        } else {
            console.log('💾 Using localStorage (Offline Storage)');
        }
    }
}

// Initialize global storage manager
const storageManager = new HybridStorageManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    await storageManager.initialize();
    storageManager.showStatus();
});

// Export for global use
window.storageManager = storageManager;
