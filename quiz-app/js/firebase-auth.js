/**
 * Firebase-Integrated Authentication System for GestureQuiz
 * Handles user authentication with Firebase backend
 */

class FirebaseAuthSystem {
    constructor() {
        this.currentUser = null;
        this.currentAuthType = '';
        this.dataManager = null;
        this.isOnlineMode = true;
        
        // Fallback test accounts for offline mode
        this.testAccounts = {
            'teacher@gesturequiz.com': {
                email: 'teacher@gesturequiz.com',
                password: 'password123',
                name: 'Dr. Sarah Johnson',
                role: 'teacher',
                avatar: '👩‍🏫',
                bio: 'Mathematics Professor with 10+ years of experience',
                department: 'Mathematics',
                classes: ['Math 101', 'Calculus I', 'Statistics'],
                createdAt: '2024-01-15T08:00:00Z',
                isVerified: true
            },
            'student@gesturequiz.com': {
                email: 'student@gesturequiz.com',
                password: 'password123',
                name: 'Alex Chen',
                role: 'student',
                avatar: '👨‍🎓',
                grade: '11th Grade',
                subjects: ['Mathematics', 'Physics', 'Chemistry'],
                enrolledClasses: ['Math 101', 'Physics Advanced'],
                createdAt: '2024-01-20T09:00:00Z',
                isVerified: true
            },
            'student2@gesturequiz.com': {
                email: 'student2@gesturequiz.com',
                password: 'password123',
                name: 'Maria Rodriguez',
                role: 'student',
                avatar: '👩‍🎓',
                grade: '12th Grade',
                subjects: ['Mathematics', 'Biology', 'English'],
                enrolledClasses: ['Math 101', 'Biology Advanced'],
                createdAt: '2024-01-22T10:00:00Z',
                isVerified: true
            }
        };
        
        this.initializeAuth();
    }

    async initializeAuth() {
        // Hide loading screen first
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1500);

        // Wait for Firebase to initialize
        if (window.firebaseDataManager) {
            this.dataManager = window.firebaseDataManager;
            
            // Wait for Firebase initialization
            let attempts = 0;
            while (!this.dataManager.isInitialized && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (this.dataManager.isInitialized) {
                console.log('✅ Firebase auth initialized');
                this.isOnlineMode = true;
                
                // Set up auth state listener
                this.dataManager.onUserSignedIn = (user) => {
                    this.handleUserSignedIn(user);
                };
                
                this.dataManager.onUserSignedOut = () => {
                    this.handleUserSignedOut();
                };
                
                // Create test accounts if needed
                await this.createTestAccountsIfNeeded();
            } else {
                console.log('⚠️ Firebase failed to initialize, using offline mode');
                this.isOnlineMode = false;
                this.ensureTestAccountsOffline();
            }
        } else {
            console.log('⚠️ Firebase not available, using offline mode');
            this.isOnlineMode = false;
            this.ensureTestAccountsOffline();
        }

        // Check existing session
        setTimeout(() => this.checkExistingSession(), 1500);
        
        // Bind form events
        setTimeout(() => this.bindFormEvents(), 1600);
    }

    async handleUserSignedIn(user) {
        try {
            // Get user profile from Firebase
            const profileResult = await this.dataManager.getUserProfile(user.uid);
            
            if (profileResult.success) {
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...profileResult.data
                };
                
                // Save to localStorage for offline access
                localStorage.setItem('gestureQuizUser', JSON.stringify(this.currentUser));
                
                // Show main app
                this.showMainApp();
            } else {
                console.error('❌ Failed to load user profile');
                this.showAuthScreen();
            }
        } catch (error) {
            console.error('❌ Handle user signed in failed:', error);
            this.showAuthScreen();
        }
    }

    handleUserSignedOut() {
        this.currentUser = null;
        localStorage.removeItem('gestureQuizUser');
        this.showAuthScreen();
    }

    async checkExistingSession() {
        if (this.isOnlineMode && this.dataManager) {
            // Check if user is signed in to Firebase
            const currentUser = this.dataManager.getCurrentUser();
            if (currentUser) {
                await this.handleUserSignedIn(currentUser);
                return;
            }
        }
        
        // Check localStorage for offline mode
        const savedUser = localStorage.getItem('gestureQuizUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            setTimeout(() => this.showMainApp(), 100);
        } else {
            setTimeout(() => this.showAuthScreen(), 100);
        }
    }

    async createTestAccountsIfNeeded() {
        if (!this.isOnlineMode || !this.dataManager) return;
        
        try {
            // Try to sign in with test teacher account
            const teacherResult = await this.dataManager.signIn('teacher@gesturequiz.com', 'password123');
            
            if (!teacherResult.success) {
                console.log('🔄 Creating test accounts in Firebase...');
                
                // Create test accounts
                await this.dataManager.signUp('teacher@gesturequiz.com', 'password123', this.testAccounts['teacher@gesturequiz.com']);
                await this.dataManager.signUp('student@gesturequiz.com', 'password123', this.testAccounts['student@gesturequiz.com']);
                await this.dataManager.signUp('student2@gesturequiz.com', 'password123', this.testAccounts['student2@gesturequiz.com']);
                
                console.log('✅ Test accounts created in Firebase');
            } else {
                console.log('✅ Test accounts already exist in Firebase');
                // Sign out after checking
                await this.dataManager.signOut();
            }
        } catch (error) {
            console.error('❌ Error creating test accounts:', error);
        }
    }

    ensureTestAccountsOffline() {
        // Check if test accounts already exist in localStorage
        const authData = localStorage.getItem('gesturequiz_auth');
        if (!authData) {
            console.log('Creating test accounts offline...');
            this.createTestAccountsOffline();
        } else {
            console.log('Test accounts already exist offline');
        }
    }

    createTestAccountsOffline() {
        // Store test accounts in localStorage for offline mode
        localStorage.setItem('gesturequiz_auth', JSON.stringify(this.testAccounts));
        console.log('✅ Test accounts created offline');
    }

    showAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) {
            authScreen.style.display = 'block';
        }
    }

    showMainApp() {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) {
            authScreen.style.display = 'none';
        }
        
        // Redirect to appropriate dashboard
        if (this.currentUser) {
            this.redirectToDashboard();
        }
    }

    redirectToDashboard() {
        if (!this.currentUser) return;
        
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('/pages/');
        
        if (this.currentUser.role === 'teacher') {
            if (!isInPages) {
                window.location.href = 'pages/teacher-dashboard.html';
            }
        } else if (this.currentUser.role === 'student') {
            if (!isInPages) {
                window.location.href = 'pages/student-dashboard.html';
            }
        }
    }

    bindFormEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Test account buttons
        const testButtons = document.querySelectorAll('.test-account-btn');
        testButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTestLogin(e));
        });

        // Form toggles
        const loginToggle = document.getElementById('show-login');
        const registerToggle = document.getElementById('show-register');
        
        if (loginToggle) {
            loginToggle.addEventListener('click', () => this.showLoginForm());
        }
        
        if (registerToggle) {
            registerToggle.addEventListener('click', () => this.showRegisterForm());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        this.showLoading('Signing in...');
        
        try {
            if (this.isOnlineMode && this.dataManager) {
                // Firebase login
                const result = await this.dataManager.signIn(email, password);
                
                if (result.success) {
                    // Firebase will handle the redirect via auth state change
                    console.log('✅ Firebase login successful');
                } else {
                    this.showError('Login failed: ' + result.error);
                }
            } else {
                // Offline login
                await this.handleOfflineLogin(email, password);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showError('Login failed. Please try again.');
        }
        
        this.hideLoading();
    }

    async handleOfflineLogin(email, password) {
        const authData = JSON.parse(localStorage.getItem('gesturequiz_auth') || '{}');
        const account = authData[email];
        
        if (account && account.password === password) {
            this.currentUser = { ...account };
            localStorage.setItem('gestureQuizUser', JSON.stringify(this.currentUser));
            this.showMainApp();
            console.log('✅ Offline login successful');
        } else {
            this.showError('Invalid email or password');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        
        if (!name || !email || !password || !role) {
            this.showError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        this.showLoading('Creating account...');
        
        try {
            if (this.isOnlineMode && this.dataManager) {
                // Firebase registration
                const result = await this.dataManager.signUp(email, password, {
                    name: name,
                    role: role,
                    avatar: role === 'teacher' ? '👨‍🏫' : '👨‍🎓'
                });
                
                if (result.success) {
                    this.showSuccess('Account created successfully! Please sign in.');
                    this.showLoginForm();
                } else {
                    this.showError('Registration failed: ' + result.error);
                }
            } else {
                // Offline registration
                await this.handleOfflineRegister(name, email, password, role);
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            this.showError('Registration failed. Please try again.');
        }
        
        this.hideLoading();
    }

    async handleOfflineRegister(name, email, password, role) {
        const authData = JSON.parse(localStorage.getItem('gesturequiz_auth') || '{}');
        
        if (authData[email]) {
            this.showError('Account with this email already exists');
            return;
        }
        
        authData[email] = {
            email: email,
            password: password,
            name: name,
            role: role,
            avatar: role === 'teacher' ? '👨‍🏫' : '👨‍🎓',
            createdAt: new Date().toISOString(),
            isVerified: true
        };
        
        localStorage.setItem('gesturequiz_auth', JSON.stringify(authData));
        
        this.showSuccess('Account created successfully! Please sign in.');
        this.showLoginForm();
        console.log('✅ Offline registration successful');
    }

    async handleTestLogin(e) {
        const email = e.target.dataset.email;
        const password = e.target.dataset.password;
        
        if (!email || !password) return;
        
        this.showLoading('Signing in with test account...');
        
        try {
            if (this.isOnlineMode && this.dataManager) {
                // Firebase test login
                const result = await this.dataManager.signIn(email, password);
                
                if (result.success) {
                    console.log('✅ Firebase test login successful');
                } else {
                    this.showError('Test login failed: ' + result.error);
                }
            } else {
                // Offline test login
                await this.handleOfflineLogin(email, password);
            }
        } catch (error) {
            console.error('❌ Test login error:', error);
            this.showError('Test login failed. Please try again.');
        }
        
        this.hideLoading();
    }

    async logout() {
        try {
            if (this.isOnlineMode && this.dataManager) {
                await this.dataManager.signOut();
            } else {
                this.handleUserSignedOut();
            }
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Force logout
            this.handleUserSignedOut();
        }
    }

    showLoginForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    }

    showRegisterForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
    }

    showError(message) {
        const errorElement = document.getElementById('auth-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    showSuccess(message) {
        const successElement = document.getElementById('auth-success');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 5000);
        }
    }

    showLoading(message) {
        const loadingElement = document.getElementById('auth-loading');
        if (loadingElement) {
            loadingElement.textContent = message;
            loadingElement.style.display = 'block';
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('auth-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isOnline() {
        return this.isOnlineMode && navigator.onLine;
    }

    getStorageType() {
        return this.isOnlineMode ? 'firebase' : 'localStorage';
    }
}

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new FirebaseAuthSystem();
});

// Export for global use
window.FirebaseAuthSystem = FirebaseAuthSystem;
