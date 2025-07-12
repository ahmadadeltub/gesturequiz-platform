/**
 * Firebase Data Manager for GestureQuiz Platform
 * Handles all online data storage, authentication, and real-time sync using Firebase v8
 */

class FirebaseDataManager {
    constructor() {
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.isOnlineMode = true;
        
        // Callback functions
        this.onUserSignedIn = null;
        this.onUserSignedOut = null;
    }

    async initialize() {
        try {
            // Wait for Firebase v8 to be available
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase v8 not loaded');
            }

            // Use Firebase v8 services from global scope
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();

            console.log('🔥 FirebaseDataManager initialized with v8');

            // Set up auth state listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('👤 User signed in:', user.email);
                    if (this.onUserSignedIn) {
                        this.onUserSignedIn(user);
                    }
                } else {
                    console.log('👤 User signed out');
                    if (this.onUserSignedOut) {
                        this.onUserSignedOut();
                    }
                }
            });

            this.isInitialized = true;
            return true;

        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    // Authentication Methods
    async signIn(email, password) {
        try {
            if (!this.isInitialized) {
                throw new Error('Firebase not initialized');
            }

            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('✅ User signed in successfully:', userCredential.user.email);
            return { success: true, user: userCredential.user };

        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    async createAccount(email, password, userData) {
        try {
            if (!this.isInitialized) {
                throw new Error('Firebase not initialized');
            }

            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            await this.createUserProfile(user.uid, {
                email: user.email,
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Account created successfully:', user.email);
            return { success: true, user: user };

        } catch (error) {
            console.error('❌ Account creation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            console.log('✅ User signed out successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    // User Profile Methods
    async createUserProfile(userId, userData) {
        try {
            await this.db.collection('users').doc(userId).set(userData);
            console.log('✅ User profile created');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to create user profile:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            if (doc.exists) {
                return { success: true, data: doc.data() };
            } else {
                return { success: false, error: 'User profile not found' };
            }
        } catch (error) {
            console.error('❌ Failed to get user profile:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserProfile(userId, userData) {
        try {
            await this.db.collection('users').doc(userId).update({
                ...userData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ User profile updated');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to update user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Class Management Methods
    async createClass(classData) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const classDoc = await this.db.collection('classes').add({
                ...classData,
                teacherId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Class created:', classDoc.id);
            return { success: true, id: classDoc.id };
        } catch (error) {
            console.error('❌ Failed to create class:', error);
            return { success: false, error: error.message };
        }
    }

    async getClasses(userId, role = 'teacher') {
        try {
            let query;
            if (role === 'teacher') {
                query = this.db.collection('classes').where('teacherId', '==', userId);
            } else {
                query = this.db.collection('classes').where('students', 'array-contains', userId);
            }

            const snapshot = await query.get();
            const classes = [];
            snapshot.forEach(doc => {
                classes.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: classes };
        } catch (error) {
            console.error('❌ Failed to get classes:', error);
            return { success: false, error: error.message };
        }
    }

    // Quiz Management Methods
    async createQuiz(quizData) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const quizDoc = await this.db.collection('quizzes').add({
                ...quizData,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✅ Quiz created:', quizDoc.id);
            return { success: true, id: quizDoc.id };
        } catch (error) {
            console.error('❌ Failed to create quiz:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuizzes(userId) {
        try {
            const snapshot = await this.db.collection('quizzes')
                .where('createdBy', '==', userId)
                .get();
            
            const quizzes = [];
            snapshot.forEach(doc => {
                quizzes.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: quizzes };
        } catch (error) {
            console.error('❌ Failed to get quizzes:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility Methods
    getCurrentUser() {
        return this.currentUser;
    }

    isSignedIn() {
        return this.currentUser !== null;
    }

    getTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    // Test connection
    async testConnection() {
        try {
            // Try to read from Firestore
            await this.db.collection('test').limit(1).get();
            console.log('✅ Firebase connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Firebase connection test failed:', error);
            return false;
        }
    }
}

// Export for use in other files
window.FirebaseDataManager = FirebaseDataManager;
