// Enhanced Firebase Data Manager for Complete Platform Integration
// Handles: Users, Classes, Quizzes, Submissions, Analytics, Global Sync

class EnhancedFirebaseDataManager {
    constructor() {
        this.firebase = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.analytics = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.realtimeListeners = new Map();
        
        this.initializeFirebase();
    }

    async initializeFirebase() {
        try {
            console.log('🚀 Initializing Enhanced Firebase Data Manager...');
            
            // Wait for Firebase to be available
            while (typeof firebase === 'undefined') {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Initialize Firebase services
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();
            
            if (firebase.analytics) {
                this.analytics = firebase.analytics();
            }

            // Set up authentication listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('✅ User authenticated:', user.email);
                    this.onUserAuthenticated(user);
                } else {
                    console.log('❌ User signed out');
                    this.onUserSignedOut();
                }
            });

            this.isInitialized = true;
            console.log('✅ Enhanced Firebase Data Manager initialized');
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            throw error;
        }
    }

    // ========== AUTHENTICATION METHODS ==========
    
    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Get or create user profile
            const profile = await this.getUserProfile(user.uid);
            
            // Track login analytics
            this.trackEvent('user_login', {
                user_id: user.uid,
                email: user.email,
                timestamp: new Date().toISOString()
            });

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
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Create user profile in Firestore
            const profileData = {
                uid: user.uid,
                email: user.email,
                name: userData.name || '',
                role: userData.role || 'student',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                },
                stats: {
                    loginCount: 1,
                    lastLogin: new Date().toISOString()
                }
            };

            await this.createUserProfile(user.uid, profileData);
            
            // Track registration analytics
            this.trackEvent('user_registration', {
                user_id: user.uid,
                email: user.email,
                role: userData.role,
                timestamp: new Date().toISOString()
            });

            return { 
                success: true, 
                user: user,
                profile: profileData
            };
        } catch (error) {
            console.error('❌ Account creation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            if (this.currentUser) {
                // Track logout analytics
                this.trackEvent('user_logout', {
                    user_id: this.currentUser.uid,
                    timestamp: new Date().toISOString()
                });
            }
            
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== USER PROFILE METHODS ==========
    
    async createUserProfile(userId, profileData) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            await userRef.set(profileData, { merge: true });
            return { success: true, data: profileData };
        } catch (error) {
            console.error('❌ Create user profile failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserProfile(userId) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Update last active
                await userRef.update({
                    lastActive: new Date().toISOString(),
                    'stats.loginCount': firebase.firestore.FieldValue.increment(1),
                    'stats.lastLogin': new Date().toISOString()
                });
                
                return { success: true, data: userData };
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
            const userRef = this.db.collection('users').doc(userId);
            await userRef.update({
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
        } catch (error) {
            console.error('❌ Update user profile failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== CLASS METHODS ==========
    
    async createClass(classData) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const classRef = this.db.collection('classes');
            const newClass = {
                ...classData,
                createdBy: this.currentUser.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                students: classData.students || [],
                settings: {
                    allowLateSubmissions: true,
                    showScores: true,
                    allowRetakes: false,
                    ...classData.settings
                },
                stats: {
                    totalStudents: 0,
                    activeQuizzes: 0,
                    totalSubmissions: 0
                }
            };

            const docRef = await classRef.add(newClass);
            
            // Track class creation
            this.trackEvent('class_created', {
                class_id: docRef.id,
                teacher_id: this.currentUser.uid,
                subject: classData.subject,
                timestamp: new Date().toISOString()
            });

            return { success: true, id: docRef.id, data: newClass };
        } catch (error) {
            console.error('❌ Create class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getClasses(userId = null) {
        try {
            const targetUserId = userId || this.currentUser?.uid;
            if (!targetUserId) {
                throw new Error('User ID required');
            }

            const classesRef = this.db.collection('classes');
            const q = classesRef.where('createdBy', '==', targetUserId);
            
            const querySnapshot = await q.get();
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
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const classRef = this.db.collection('classes').doc(classId);
            
            // Verify ownership
            const classDoc = await classRef.get();
            if (!classDoc.exists()) {
                throw new Error('Class not found');
            }
            
            const classData = classDoc.data();
            if (classData.createdBy !== this.currentUser.uid) {
                throw new Error('Not authorized to update this class');
            }

            await classRef.update({
                ...updateData,
                updatedAt: new Date().toISOString()
            });

            // Track class update
            this.trackEvent('class_updated', {
                class_id: classId,
                teacher_id: this.currentUser.uid,
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Update class failed:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteClass(classId) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const classRef = this.db.collection('classes').doc(classId);
            
            // Verify ownership
            const classDoc = await classRef.get();
            if (!classDoc.exists()) {
                throw new Error('Class not found');
            }
            
            const classData = classDoc.data();
            if (classData.createdBy !== this.currentUser.uid) {
                throw new Error('Not authorized to delete this class');
            }

            // Delete class
            await classRef.delete();
            
            // Track class deletion
            this.trackEvent('class_deleted', {
                class_id: classId,
                teacher_id: this.currentUser.uid,
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('❌ Delete class failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== QUIZ METHODS ==========
    
    async createQuiz(quizData) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const quizRef = this.db.collection('quizzes');
            const newQuiz = {
                ...quizData,
                createdBy: this.currentUser.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                settings: {
                    timeLimit: 30,
                    allowRetakes: false,
                    showCorrectAnswers: true,
                    randomizeQuestions: false,
                    ...quizData.settings
                },
                stats: {
                    totalAttempts: 0,
                    averageScore: 0,
                    completionRate: 0
                },
                isActive: true
            };

            const docRef = await quizRef.add(newQuiz);
            
            // Track quiz creation
            this.trackEvent('quiz_created', {
                quiz_id: docRef.id,
                teacher_id: this.currentUser.uid,
                class_id: quizData.classId,
                question_count: quizData.questions?.length || 0,
                timestamp: new Date().toISOString()
            });

            return { success: true, id: docRef.id, data: newQuiz };
        } catch (error) {
            console.error('❌ Create quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuizzes(classId = null) {
        try {
            const quizzesRef = this.db.collection('quizzes');
            let q = quizzesRef;
            
            if (classId) {
                q = q.where('classId', '==', classId);
            }
            
            if (this.currentUser) {
                q = q.where('createdBy', '==', this.currentUser.uid);
            }
            
            const querySnapshot = await q.get();
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

    // ========== SUBMISSION METHODS ==========
    
    async submitQuiz(submissionData) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const submissionRef = this.db.collection('submissions');
            const newSubmission = {
                ...submissionData,
                studentId: this.currentUser.uid,
                submittedAt: new Date().toISOString(),
                score: this.calculateScore(submissionData.answers, submissionData.questions),
                timeSpent: submissionData.timeSpent || 0,
                isCompleted: true
            };

            const docRef = await submissionRef.add(newSubmission);
            
            // Update quiz stats
            await this.updateQuizStats(submissionData.quizId, newSubmission.score);
            
            // Track submission
            this.trackEvent('quiz_submitted', {
                submission_id: docRef.id,
                quiz_id: submissionData.quizId,
                student_id: this.currentUser.uid,
                score: newSubmission.score,
                timestamp: new Date().toISOString()
            });

            return { success: true, id: docRef.id, data: newSubmission };
        } catch (error) {
            console.error('❌ Submit quiz failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getSubmissions(quizId = null, studentId = null) {
        try {
            const submissionsRef = this.db.collection('submissions');
            let q = submissionsRef;
            
            if (quizId) {
                q = q.where('quizId', '==', quizId);
            }
            
            if (studentId) {
                q = q.where('studentId', '==', studentId);
            }
            
            const querySnapshot = await q.get();
            const submissions = [];
            
            querySnapshot.forEach((doc) => {
                submissions.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, data: submissions };
        } catch (error) {
            console.error('❌ Get submissions failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== REAL-TIME METHODS ==========
    
    subscribeToClasses(userId, callback) {
        try {
            const q = this.db.collection('classes').where('createdBy', '==', userId);
            
            const unsubscribe = q.onSnapshot((snapshot) => {
                const classes = [];
                snapshot.forEach((doc) => {
                    classes.push({ id: doc.id, ...doc.data() });
                });
                callback(classes);
            });

            this.realtimeListeners.set(`classes_${userId}`, unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Subscribe to classes failed:', error);
        }
    }

    subscribeToQuizzes(classId, callback) {
        try {
            const q = this.db.collection('quizzes').where('classId', '==', classId);
            
            const unsubscribe = q.onSnapshot((snapshot) => {
                const quizzes = [];
                snapshot.forEach((doc) => {
                    quizzes.push({ id: doc.id, ...doc.data() });
                });
                callback(quizzes);
            });

            this.realtimeListeners.set(`quizzes_${classId}`, unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Subscribe to quizzes failed:', error);
        }
    }

    // ========== REAL-TIME LISTENERS ==========
    
    setupRealtimeListeners() {
        if (!this.currentUser) {
            console.warn('⚠️ No user authenticated for real-time listeners');
            return;
        }
        
        console.log('🔄 Setting up real-time listeners...');
        
        // Listen for user classes
        this.listenToUserClasses();
        
        // Listen for user quizzes
        this.listenToUserQuizzes();
        
        // Listen for user submissions
        this.listenToUserSubmissions();
        
        // Listen for user profile changes
        this.listenToUserProfile();
    }
    
    listenToUserClasses() {
        if (!this.currentUser) return;
        
        const unsubscribe = this.db.collection('classes')
            .where('createdBy', '==', this.currentUser.uid)
            .onSnapshot((snapshot) => {
                const classes = [];
                snapshot.forEach((doc) => {
                    classes.push({ id: doc.id, ...doc.data() });
                });
                
                // Update localStorage for offline use
                localStorage.setItem('teacherClasses', JSON.stringify(classes));
                
                // Trigger custom event for UI updates
                window.dispatchEvent(new CustomEvent('classesUpdated', { detail: classes }));
                
                console.log('🔄 Classes updated via real-time listener:', classes.length);
            }, (error) => {
                console.error('❌ Classes listener error:', error);
            });
        
        this.realtimeListeners.set('classes', unsubscribe);
    }
    
    listenToUserQuizzes() {
        if (!this.currentUser) return;
        
        const unsubscribe = this.db.collection('quizzes')
            .where('createdBy', '==', this.currentUser.uid)
            .onSnapshot((snapshot) => {
                const quizzes = [];
                snapshot.forEach((doc) => {
                    quizzes.push({ id: doc.id, ...doc.data() });
                });
                
                // Update localStorage for offline use
                localStorage.setItem('teacherQuizzes', JSON.stringify(quizzes));
                
                // Trigger custom event for UI updates
                window.dispatchEvent(new CustomEvent('quizzesUpdated', { detail: quizzes }));
                
                console.log('🔄 Quizzes updated via real-time listener:', quizzes.length);
            }, (error) => {
                console.error('❌ Quizzes listener error:', error);
            });
        
        this.realtimeListeners.set('quizzes', unsubscribe);
    }
    
    listenToUserSubmissions() {
        if (!this.currentUser) return;
        
        const unsubscribe = this.db.collection('submissions')
            .where('userId', '==', this.currentUser.uid)
            .onSnapshot((snapshot) => {
                const submissions = [];
                snapshot.forEach((doc) => {
                    submissions.push({ id: doc.id, ...doc.data() });
                });
                
                // Update localStorage for offline use
                localStorage.setItem('userSubmissions', JSON.stringify(submissions));
                
                // Trigger custom event for UI updates
                window.dispatchEvent(new CustomEvent('submissionsUpdated', { detail: submissions }));
                
                console.log('🔄 Submissions updated via real-time listener:', submissions.length);
            }, (error) => {
                console.error('❌ Submissions listener error:', error);
            });
        
        this.realtimeListeners.set('submissions', unsubscribe);
    }
    
    listenToUserProfile() {
        if (!this.currentUser) return;
        
        const unsubscribe = this.db.collection('users')
            .doc(this.currentUser.uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const profile = { id: doc.id, ...doc.data() };
                    
                    // Update localStorage for offline use
                    localStorage.setItem('userProfile', JSON.stringify(profile));
                    
                    // Trigger custom event for UI updates
                    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
                    
                    console.log('🔄 Profile updated via real-time listener');
                }
            }, (error) => {
                console.error('❌ Profile listener error:', error);
            });
        
        this.realtimeListeners.set('profile', unsubscribe);
    }
    
    // Clean up listeners
    cleanupRealtimeListeners() {
        console.log('🧹 Cleaning up real-time listeners...');
        
        this.realtimeListeners.forEach((unsubscribe, key) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
                console.log(`✅ Cleaned up ${key} listener`);
            }
        });
        
        this.realtimeListeners.clear();
    }
    
    // ========== STUDENT-SPECIFIC METHODS ==========
    
    async joinClass(classCode) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            // Find class by code
            const classesRef = this.db.collection('classes');
            const q = classesRef.where('code', '==', classCode);
            const querySnapshot = await q.get();
            
            if (querySnapshot.empty) {
                throw new Error('Class not found. Please check the class code.');
            }
            
            const classDoc = querySnapshot.docs[0];
            const classData = classDoc.data();
            
            // Check if student is already in class
            const students = classData.students || [];
            const studentExists = students.some(student => 
                student.uid === this.currentUser.uid || 
                student.email === this.currentUser.email
            );
            
            if (studentExists) {
                throw new Error('You are already a member of this class.');
            }
            
            // Add student to class
            const studentData = {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                name: this.currentUser.displayName || this.currentUser.email,
                joinedAt: new Date().toISOString(),
                status: 'active'
            };
            
            students.push(studentData);
            
            await classDoc.ref.update({
                students: students,
                updatedAt: new Date().toISOString()
            });
            
            // Track class joining
            this.trackEvent('class_joined', {
                class_id: classDoc.id,
                student_id: this.currentUser.uid,
                class_code: classCode,
                timestamp: new Date().toISOString()
            });
            
            return { success: true, classData: { id: classDoc.id, ...classData } };
            
        } catch (error) {
            console.error('❌ Join class failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getStudentClasses() {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            const classesRef = this.db.collection('classes');
            const querySnapshot = await classesRef.get();
            
            const studentClasses = [];
            
            querySnapshot.forEach((doc) => {
                const classData = doc.data();
                const students = classData.students || [];
                
                // Check if current user is in this class
                const isStudent = students.some(student => 
                    student.uid === this.currentUser.uid ||
                    student.email === this.currentUser.email
                );
                
                if (isStudent) {
                    studentClasses.push({ id: doc.id, ...classData });
                }
            });
            
            return { success: true, data: studentClasses };
            
        } catch (error) {
            console.error('❌ Get student classes failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getClassQuizzes(classId) {
        try {
            const quizzesRef = this.db.collection('quizzes');
            const q = quizzesRef.where('classId', '==', classId).where('isActive', '==', true);
            
            const querySnapshot = await q.get();
            const quizzes = [];
            
            querySnapshot.forEach((doc) => {
                quizzes.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, data: quizzes };
            
        } catch (error) {
            console.error('❌ Get class quizzes failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async submitQuizAnswers(quizId, answers, timeTaken) {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            // Get quiz data for scoring
            const quizDoc = await this.db.collection('quizzes').doc(quizId).get();
            if (!quizDoc.exists) {
                throw new Error('Quiz not found');
            }
            
            const quizData = quizDoc.data();
            
            // Calculate score
            const score = this.calculateScore(answers, quizData.questions);
            
            // Create submission
            const submissionData = {
                userId: this.currentUser.uid,
                userEmail: this.currentUser.email,
                quizId: quizId,
                classId: quizData.classId,
                answers: answers,
                score: score,
                maxScore: quizData.questions.length,
                timeTaken: timeTaken,
                submittedAt: new Date().toISOString(),
                isCompleted: true
            };
            
            const submissionRef = this.db.collection('submissions');
            const docRef = await submissionRef.add(submissionData);
            
            // Update quiz stats
            await this.updateQuizStats(quizId);
            
            // Track submission
            this.trackEvent('quiz_submitted', {
                quiz_id: quizId,
                student_id: this.currentUser.uid,
                score: score,
                max_score: quizData.questions.length,
                time_taken: timeTaken,
                timestamp: new Date().toISOString()
            });
            
            return { 
                success: true, 
                id: docRef.id, 
                score: score, 
                maxScore: quizData.questions.length 
            };
            
        } catch (error) {
            console.error('❌ Submit quiz answers failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    calculateScore(answers, questions) {
        let correct = 0;
        
        questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const correctAnswer = question.correct;
            
            if (userAnswer === correctAnswer) {
                correct++;
            }
        });
        
        return correct;
    }
    
    async updateQuizStats(quizId) {
        try {
            const submissionsRef = this.db.collection('submissions');
            const q = submissionsRef.where('quizId', '==', quizId);
            const querySnapshot = await q.get();
            
            let totalAttempts = 0;
            let totalScore = 0;
            let completedAttempts = 0;
            
            querySnapshot.forEach((doc) => {
                const submission = doc.data();
                totalAttempts++;
                
                if (submission.isCompleted) {
                    completedAttempts++;
                    totalScore += submission.score;
                }
            });
            
            const averageScore = completedAttempts > 0 ? totalScore / completedAttempts : 0;
            const completionRate = totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0;
            
            await this.db.collection('quizzes').doc(quizId).update({
                'stats.totalAttempts': totalAttempts,
                'stats.averageScore': averageScore,
                'stats.completionRate': completionRate,
                updatedAt: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Update quiz stats failed:', error);
        }
    }

    // ========== ANALYTICS METHODS ==========
    
    async getTeacherAnalytics() {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            // Get teacher's classes
            const classesResult = await this.getClasses();
            if (!classesResult.success) {
                throw new Error('Failed to fetch classes');
            }
            
            const classes = classesResult.data;
            const classIds = classes.map(cls => cls.id);
            
            // Get quizzes for all classes
            const quizzesRef = this.db.collection('quizzes');
            const quizPromises = classIds.map(classId => 
                quizzesRef.where('classId', '==', classId).get()
            );
            
            const quizSnapshots = await Promise.all(quizPromises);
            const allQuizzes = [];
            
            quizSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    allQuizzes.push({ id: doc.id, ...doc.data() });
                });
            });
            
            // Get submissions for all quizzes
            const submissionsRef = this.db.collection('submissions');
            const submissionPromises = allQuizzes.map(quiz => 
                submissionsRef.where('quizId', '==', quiz.id).get()
            );
            
            const submissionSnapshots = await Promise.all(submissionPromises);
            const allSubmissions = [];
            
            submissionSnapshots.forEach(snapshot => {
                snapshot.forEach(doc => {
                    allSubmissions.push({ id: doc.id, ...doc.data() });
                });
            });
            
            // Calculate analytics
            const analytics = {
                totalClasses: classes.length,
                totalStudents: classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0),
                totalQuizzes: allQuizzes.length,
                totalSubmissions: allSubmissions.length,
                averageScore: allSubmissions.length > 0 
                    ? allSubmissions.reduce((sum, sub) => sum + sub.score, 0) / allSubmissions.length 
                    : 0,
                completionRate: allQuizzes.length > 0 
                    ? (allSubmissions.filter(sub => sub.isCompleted).length / allSubmissions.length) * 100 
                    : 0,
                recentActivity: allSubmissions
                    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                    .slice(0, 10)
            };
            
            return { success: true, data: analytics };
            
        } catch (error) {
            console.error('❌ Get teacher analytics failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getStudentAnalytics() {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            // Get student's submissions
            const submissionsRef = this.db.collection('submissions');
            const q = submissionsRef.where('userId', '==', this.currentUser.uid);
            const querySnapshot = await q.get();
            
            const submissions = [];
            querySnapshot.forEach((doc) => {
                submissions.push({ id: doc.id, ...doc.data() });
            });
            
            // Get student's classes
            const classesResult = await this.getStudentClasses();
            const classes = classesResult.success ? classesResult.data : [];
            
            // Calculate analytics
            const analytics = {
                totalClasses: classes.length,
                totalQuizzes: submissions.length,
                completedQuizzes: submissions.filter(sub => sub.isCompleted).length,
                averageScore: submissions.length > 0 
                    ? submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length 
                    : 0,
                bestScore: submissions.length > 0 
                    ? Math.max(...submissions.map(sub => sub.score)) 
                    : 0,
                totalTimeSpent: submissions.reduce((sum, sub) => sum + (sub.timeTaken || 0), 0),
                recentSubmissions: submissions
                    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                    .slice(0, 10)
            };
            
            return { success: true, data: analytics };
            
        } catch (error) {
            console.error('❌ Get student analytics failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ========== MIGRATION METHODS ==========
    
    async migrateLocalStorageToFirebase() {
        try {
            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }
            
            console.log('🔄 Starting localStorage to Firebase migration...');
            
            // Migrate user profile
            await this.migrateUserProfile();
            
            // Migrate classes (teacher only)
            await this.migrateClasses();
            
            // Migrate quizzes
            await this.migrateQuizzes();
            
            // Migrate submissions
            await this.migrateSubmissions();
            
            console.log('✅ Migration completed successfully');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async migrateUserProfile() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.email) {
            const profileData = {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                name: currentUser.name || this.currentUser.displayName || '',
                role: currentUser.role || 'student',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                preferences: currentUser.preferences || {}
            };
            
            await this.createUserProfile(profileData);
            console.log('✅ User profile migrated');
        }
    }
    
    async migrateClasses() {
        const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
        const userClasses = classes.filter(cls => 
            cls.createdBy === this.currentUser.email || 
            cls.createdBy === this.currentUser.uid
        );
        
        for (const classData of userClasses) {
            const result = await this.createClass(classData);
            if (result.success) {
                console.log(`✅ Class '${classData.name}' migrated`);
            } else {
                console.error(`❌ Failed to migrate class '${classData.name}':`, result.error);
            }
        }
    }
    
    async migrateQuizzes() {
        const quizzes = JSON.parse(localStorage.getItem('teacherQuizzes') || '[]');
        const userQuizzes = quizzes.filter(quiz => 
            quiz.createdBy === this.currentUser.email || 
            quiz.createdBy === this.currentUser.uid
        );
        
        for (const quizData of userQuizzes) {
            const result = await this.createQuiz(quizData);
            if (result.success) {
                console.log(`✅ Quiz '${quizData.title}' migrated`);
            } else {
                console.error(`❌ Failed to migrate quiz '${quizData.title}':`, result.error);
            }
        }
    }
    
    async migrateSubmissions() {
        const submissions = JSON.parse(localStorage.getItem('userSubmissions') || '[]');
        const userSubmissions = submissions.filter(sub => 
            sub.userId === this.currentUser.uid || 
            sub.userEmail === this.currentUser.email
        );
        
        for (const submissionData of userSubmissions) {
            const submissionRef = this.db.collection('submissions');
            await submissionRef.add(submissionData);
            console.log(`✅ Submission for quiz '${submissionData.quizId}' migrated`);
        }
    }
    
    // ========== UTILITY METHODS ==========
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    async signOut() {
        try {
            // Clean up listeners
            this.cleanupRealtimeListeners();
            
            // Sign out from Firebase
            await this.auth.signOut();
            
            // Clear localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userProfile');
            
            console.log('✅ User signed out successfully');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    trackEvent(eventName, eventData) {
        if (this.analytics) {
            this.analytics.logEvent(eventName, eventData);
            console.log(`📊 Analytics event: ${eventName}`, eventData);
        }
    }
    
    onUserAuthenticated(user) {
        console.log('👤 User authenticated:', user.email);
        
        // Set up real-time listeners
        this.setupRealtimeListeners();
        
        // Update user's last active time
        this.updateUserProfile(user.uid, { lastActive: new Date().toISOString() });
        
        // Track login
        this.trackEvent('login', {
            user_id: user.uid,
            method: 'email'
        });
    }
    
    onUserSignedOut() {
        console.log('👤 User signed out');
        
        // Clean up listeners
        this.cleanupRealtimeListeners();
        
        // Clear current user
        this.currentUser = null;
        
        // Track logout
        this.trackEvent('logout', {
            timestamp: new Date().toISOString()
        });
    }
}

// Initialize global instance
window.enhancedFirebaseDataManager = new EnhancedFirebaseDataManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFirebaseDataManager;
}

console.log('🚀 Enhanced Firebase Data Manager loaded and initialized');
