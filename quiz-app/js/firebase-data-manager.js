/**
 * Firebase Data Manager for GestureQuiz Platform
 * Handles all online data storage, authentication, and real-time sync
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMGOSAICQQbbduHDBvLzhcdImJkTrlTmc",
    authDomain: "gesturequiz-platform-429dd.firebaseapp.com",
    projectId: "gesturequiz-platform-429dd",
    storageBucket: "gesturequiz-platform-429dd.firebasestorage.app",
    messagingSenderId: "911639818705",
    appId: "1:911639818705:web:22d5bf2845c469185e70f0",
    measurementId: "G-Z8W4H5WDG7"
};

class FirebaseDataManager {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.isOnlineMode = true;
        
        // Initialize Firebase
        this.initialize();
    }

    async initialize() {
        try {
            // Import Firebase modules
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
            const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js');
            const { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
            const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js');

            // Initialize Firebase
            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            this.db = getFirestore(this.app);
            this.storage = getStorage(this.app);

            // Store Firebase methods
            this.firebase = {
                signInWithEmailAndPassword,
                createUserWithEmailAndPassword,
                signOut,
                onAuthStateChanged,
                doc,
                setDoc,
                getDoc,
                collection,
                query,
                where,
                getDocs,
                addDoc,
                updateDoc,
                deleteDoc,
                onSnapshot,
                ref,
                uploadBytes,
                getDownloadURL,
                deleteObject,
                listAll
            };

            // Listen for auth state changes
            this.firebase.onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                this.handleAuthStateChange(user);
            });

            this.isInitialized = true;
            console.log('✅ Firebase initialized successfully');
            console.log('📁 Storage bucket:', firebaseConfig.storageBucket);
            
            return { success: true };
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.isOnlineMode = false;
            return { success: false, error: error.message };
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('👤 User signed in:', user.email);
            // Update UI to show logged in state
            this.onUserSignedIn(user);
        } else {
            console.log('👤 User signed out');
            // Update UI to show logged out state
            this.onUserSignedOut();
        }
    }

    onUserSignedIn(user) {
        // Override in your app to handle sign in
        console.log('User signed in:', user.email);
    }

    onUserSignedOut() {
        // Override in your app to handle sign out
        console.log('User signed out');
    }

    // Authentication Methods
    async signIn(email, password) {
        try {
            const userCredential = await this.firebase.signInWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            
            // Get user profile from Firestore
            const profile = await this.getUserProfile(user.uid);
            
            return { 
                success: true, 
                user: user,
                profile: profile.success ? profile.data : null
            };
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    async createAccount(email, password, userData) {
        try {
            const userCredential = await this.firebase.createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            
            // Create user profile in Firestore
            await this.createUserProfile(user.uid, {
                email: email,
                name: userData.name || 'New User',
                role: userData.role || 'student',
                avatar: userData.avatar || (userData.role === 'teacher' ? '👩‍🏫' : '👨‍🎓'),
                createdAt: new Date().toISOString(),
                ...userData
            });
            
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Create account failed:', error);
            let errorMessage = 'Account creation failed. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'An account with this email already exists. Please sign in instead.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters.';
            }
            
            return { success: false, error: errorMessage };
        }
    }

    async getUserData(userId) {
        try {
            const userRef = this.firebase.doc(this.db, 'users', userId);
            const userDoc = await this.firebase.getDoc(userRef);
            
            if (userDoc.exists()) {
                return userDoc.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error('❌ Get user data failed:', error);
            return null;
        }
    }

    async signUp(email, password, userData) {
        try {
            const userCredential = await this.firebase.createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            
            // Create user profile in Firestore
            await this.createUserProfile(user.uid, {
                email: email,
                name: userData.name || 'New User',
                role: userData.role || 'student',
                avatar: userData.avatar || '👤',
                createdAt: new Date().toISOString(),
                ...userData
            });
            
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await this.firebase.signOut(this.auth);
            this.currentUser = null;
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isSignedIn() {
        return this.currentUser !== null;
    }

    // User Profile Methods
    async createUserProfile(userId, userData) {
        try {
            const userRef = this.firebase.doc(this.db, 'users', userId);
            await this.firebase.setDoc(userRef, userData);
            return { success: true };
        } catch (error) {
            console.error('❌ Create user profile failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserProfile(userId) {
        try {
            const userRef = this.firebase.doc(this.db, 'users', userId);
            const userDoc = await this.firebase.getDoc(userRef);
            
            if (userDoc.exists()) {
                return { success: true, data: userDoc.data() };
            } else {
                return { success: false, error: 'User profile not found' };
            }
        } catch (error) {
            console.error('❌ Get user profile failed:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserProfile(userId, updateData) {
        try {
            const userRef = this.firebase.doc(this.db, 'users', userId);
            await this.firebase.updateDoc(userRef, {
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Update user profile failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Quiz Methods
    async createQuiz(quizData) {
        try {
            const quizzesRef = this.firebase.collection(this.db, 'quizzes');
            const docRef = await this.firebase.addDoc(quizzesRef, {
                ...quizData,
                createdBy: this.currentUser.uid,
                createdAt: new Date().toISOString()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Create quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuizzes(userId = null) {
        try {
            const quizzesRef = this.firebase.collection(this.db, 'quizzes');
            const q = userId ? 
                this.firebase.query(quizzesRef, this.firebase.where('createdBy', '==', userId)) :
                quizzesRef;
            
            const querySnapshot = await this.firebase.getDocs(q);
            const quizzes = [];
            
            querySnapshot.forEach((doc) => {
                quizzes.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: quizzes };
        } catch (error) {
            console.error('❌ Get quizzes failed:', error);
            return { success: false, error: error.message };
        }
    }

    async updateQuiz(quizId, updateData) {
        try {
            const quizRef = this.firebase.doc(this.db, 'quizzes', quizId);
            await this.firebase.updateDoc(quizRef, {
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Update quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteQuiz(quizId) {
        try {
            const quizRef = this.firebase.doc(this.db, 'quizzes', quizId);
            await this.firebase.deleteDoc(quizRef);
            return { success: true };
        } catch (error) {
            console.error('❌ Delete quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Class Methods
    async createClass(classData) {
        try {
            const classesRef = this.firebase.collection(this.db, 'classes');
            const docRef = await this.firebase.addDoc(classesRef, {
                ...classData,
                createdBy: this.currentUser.uid,
                createdAt: new Date().toISOString(),
                students: classData.students || []
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Create class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getClass(classId) {
        try {
            const classRef = this.firebase.doc(this.db, 'classes', classId);
            const classDoc = await this.firebase.getDoc(classRef);
            
            if (classDoc.exists()) {
                return { success: true, data: { id: classDoc.id, ...classDoc.data() } };
            } else {
                return { success: false, error: 'Class not found' };
            }
        } catch (error) {
            console.error('❌ Get class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getClasses(userId = null) {
        try {
            const classesRef = this.firebase.collection(this.db, 'classes');
            const q = userId ? 
                this.firebase.query(classesRef, this.firebase.where('createdBy', '==', userId)) :
                classesRef;
            
            const querySnapshot = await this.firebase.getDocs(q);
            const classes = [];
            
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: classes };
        } catch (error) {
            console.error('❌ Get classes failed:', error);
            return { success: false, error: error.message };
        }
    }

    async updateClass(classId, updateData) {
        try {
            const classRef = this.firebase.doc(this.db, 'classes', classId);
            await this.firebase.updateDoc(classRef, {
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Update class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteClass(classId) {
        try {
            const classRef = this.firebase.doc(this.db, 'classes', classId);
            await this.firebase.deleteDoc(classRef);
            return { success: true };
        } catch (error) {
            console.error('❌ Delete class failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Student Management Methods
    async addStudentToClass(classId, studentData) {
        try {
            const classRef = this.firebase.doc(this.db, 'classes', classId);
            const classDoc = await this.firebase.getDoc(classRef);
            
            if (!classDoc.exists()) {
                return { success: false, error: 'Class not found' };
            }
            
            const classDataCurrent = classDoc.data();
            const students = classDataCurrent.students || [];
            
            // Check if student already exists
            if (students.some(s => s.email.toLowerCase() === studentData.email.toLowerCase())) {
                return { success: false, error: 'Student with this email already exists in the class' };
            }
            
            // Add student with unique ID
            const newStudent = {
                id: this.generateId(),
                ...studentData,
                addedAt: new Date().toISOString()
            };
            
            students.push(newStudent);
            
            await this.firebase.updateDoc(classRef, {
                students: students,
                updatedAt: new Date().toISOString()
            });
            
            return { success: true, student: newStudent };
        } catch (error) {
            console.error('❌ Add student to class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async removeStudentFromClass(classId, studentId) {
        try {
            const classRef = this.firebase.doc(this.db, 'classes', classId);
            const classDoc = await this.firebase.getDoc(classRef);
            
            if (!classDoc.exists()) {
                return { success: false, error: 'Class not found' };
            }
            
            const classData = classDoc.data();
            const students = classData.students || [];
            
            // Remove student
            const updatedStudents = students.filter(s => s.id !== studentId);
            
            await this.firebase.updateDoc(classRef, {
                students: updatedStudents,
                updatedAt: new Date().toISOString()
            });
            
            return { success: true };
        } catch (error) {
            console.error('❌ Remove student from class failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Results/Analytics Methods
    async saveQuizResult(resultData) {
        try {
            const resultsRef = this.firebase.collection(this.db, 'results');
            const docRef = await this.firebase.addDoc(resultsRef, {
                ...resultData,
                submittedAt: new Date().toISOString()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Save quiz result failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuizResults(quizId) {
        try {
            const resultsRef = this.firebase.collection(this.db, 'results');
            const q = this.firebase.query(resultsRef, this.firebase.where('quizId', '==', quizId));
            
            const querySnapshot = await this.firebase.getDocs(q);
            const results = [];
            
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: results };
        } catch (error) {
            console.error('❌ Get quiz results failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Real-time listeners
    onQuizzesChange(callback, userId = null) {
        try {
            const quizzesRef = this.firebase.collection(this.db, 'quizzes');
            const q = userId ? 
                this.firebase.query(quizzesRef, this.firebase.where('createdBy', '==', userId)) :
                quizzesRef;
            
            return this.firebase.onSnapshot(q, (querySnapshot) => {
                const quizzes = [];
                querySnapshot.forEach((doc) => {
                    quizzes.push({ id: doc.id, ...doc.data() });
                });
                callback(quizzes);
            });
        } catch (error) {
            console.error('❌ Quiz listener failed:', error);
            return null;
        }
    }

    onClassesChange(callback, userId = null) {
        try {
            const classesRef = this.firebase.collection(this.db, 'classes');
            const q = userId ? 
                this.firebase.query(classesRef, this.firebase.where('createdBy', '==', userId)) :
                classesRef;
            
            return this.firebase.onSnapshot(q, (querySnapshot) => {
                const classes = [];
                querySnapshot.forEach((doc) => {
                    classes.push({ id: doc.id, ...doc.data() });
                });
                callback(classes);
            });
        } catch (error) {
            console.error('❌ Class listener failed:', error);
            return null;
        }
    }

    // Utility methods
    isOnline() {
        return this.isOnlineMode && navigator.onLine;
    }

    async uploadFile(file, path) {
        try {
            const fileRef = this.firebase.ref(this.storage, path);
            const snapshot = await this.firebase.uploadBytes(fileRef, file);
            const downloadURL = await this.firebase.getDownloadURL(snapshot.ref);
            
            return { success: true, url: downloadURL };
        } catch (error) {
            console.error('❌ File upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Offline fallback methods
    getLocalStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '{}');
        } catch (error) {
            return {};
        }
    }

    setLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ Local storage failed:', error);
            return false;
        }
    }

    // Storage Methods
    async uploadFile(filePath, file, metadata = {}) {
        try {
            if (!this.currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const storageRef = this.firebase.ref(this.storage, filePath);
            const uploadMetadata = {
                contentType: file.type,
                customMetadata: {
                    uploadedBy: this.currentUser.uid,
                    uploadedAt: new Date().toISOString(),
                    ...metadata
                }
            };

            const snapshot = await this.firebase.uploadBytes(storageRef, file, uploadMetadata);
            const downloadURL = await this.firebase.getDownloadURL(snapshot.ref);
            
            console.log('✅ File uploaded successfully:', filePath);
            return { 
                success: true, 
                downloadURL,
                fullPath: snapshot.ref.fullPath,
                size: snapshot.metadata.size
            };
        } catch (error) {
            console.error('❌ File upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    async uploadProfileImage(file) {
        try {
            if (!this.currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const fileName = `profile_${this.currentUser.uid}_${Date.now()}.${file.name.split('.').pop()}`;
            const filePath = `users/${this.currentUser.uid}/profile/${fileName}`;
            
            return await this.uploadFile(filePath, file, {
                type: 'profile_image',
                userId: this.currentUser.uid
            });
        } catch (error) {
            console.error('❌ Profile image upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    async uploadQuizAsset(quizId, file) {
        try {
            if (!this.currentUser) {
                return { success: false, error: 'User not authenticated' };
            }

            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `quizzes/${quizId}/assets/${fileName}`;
            
            return await this.uploadFile(filePath, file, {
                type: 'quiz_asset',
                quizId: quizId,
                userId: this.currentUser.uid
            });
        } catch (error) {
            console.error('❌ Quiz asset upload failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getFileDownloadURL(filePath) {
        try {
            const storageRef = this.firebase.ref(this.storage, filePath);
            const downloadURL = await this.firebase.getDownloadURL(storageRef);
            return { success: true, downloadURL };
        } catch (error) {
            console.error('❌ Get download URL failed:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteFile(filePath) {
        try {
            const storageRef = this.firebase.ref(this.storage, filePath);
            await this.firebase.deleteObject(storageRef);
            console.log('✅ File deleted successfully:', filePath);
            return { success: true };
        } catch (error) {
            console.error('❌ File deletion failed:', error);
            return { success: false, error: error.message };
        }
    }

    async listFiles(folderPath) {
        try {
            const listRef = this.firebase.ref(this.storage, folderPath);
            const listResult = await this.firebase.listAll(listRef);
            
            const files = await Promise.all(
                listResult.items.map(async (itemRef) => {
                    const downloadURL = await this.firebase.getDownloadURL(itemRef);
                    return {
                        name: itemRef.name,
                        fullPath: itemRef.fullPath,
                        downloadURL
                    };
                })
            );
            
            return { success: true, files };
        } catch (error) {
            console.error('❌ List files failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserFiles(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.uid;
            if (!targetUserId) {
                return { success: false, error: 'User ID required' };
            }

            return await this.listFiles(`users/${targetUserId}`);
        } catch (error) {
            console.error('❌ Get user files failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuizAssets(quizId) {
        try {
            return await this.listFiles(`quizzes/${quizId}/assets`);
        } catch (error) {
            console.error('❌ Get quiz assets failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper method to validate file types
    validateFileType(file, allowedTypes = []) {
        if (allowedTypes.length === 0) {
            return { valid: true };
        }

        const fileType = file.type.toLowerCase();
        const isValid = allowedTypes.some(type => fileType.includes(type));
        
        return {
            valid: isValid,
            error: isValid ? null : `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    // Helper method to validate file size
    validateFileSize(file, maxSizeMB = 10) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const isValid = file.size <= maxSizeBytes;
        
        return {
            valid: isValid,
            error: isValid ? null : `File size exceeds ${maxSizeMB}MB limit`
        };
    }

    // Test accounts creation
    async createTestAccounts() {
        try {
            console.log('🔄 Creating test accounts...');
            
            // Create test teacher
            const teacherResult = await this.signUp('teacher@gesturequiz.com', 'password123', {
                name: 'Dr. Sarah Johnson',
                role: 'teacher',
                avatar: '👩‍🏫'
            });
            
            if (teacherResult.success) {
                console.log('✅ Test teacher created');
            }
            
            // Create test students
            const student1Result = await this.signUp('student@gesturequiz.com', 'password123', {
                name: 'Alex Chen',
                role: 'student',
                avatar: '👨‍🎓'
            });
            
            if (student1Result.success) {
                console.log('✅ Test student 1 created');
            }
            
            const student2Result = await this.signUp('student2@gesturequiz.com', 'password123', {
                name: 'Maria Rodriguez',
                role: 'student',
                avatar: '👩‍🎓'
            });
            
            if (student2Result.success) {
                console.log('✅ Test student 2 created');
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Create test accounts failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Global instance
window.firebaseDataManager = new FirebaseDataManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseDataManager;
}
