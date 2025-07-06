// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.currentAuthType = '';
        this.initializeAuth();
    }

    initializeAuth() {
        // Hide loading screen first
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1500);

        // Ensure test accounts exist
        this.ensureTestAccounts();

        // Check if user is already logged in
        const savedUser = localStorage.getItem('gestureQuizUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            setTimeout(() => this.showMainApp(), 1500);
        } else {
            setTimeout(() => this.showAuthScreen(), 1500);
        }

        // Bind form events
        setTimeout(() => this.bindFormEvents(), 1600);
    }

    ensureTestAccounts() {
        // Check if test accounts already exist
        const authData = localStorage.getItem('gesturequiz_auth');
        if (!authData) {
            console.log('Creating test accounts...');
            this.createTestAccounts();
        } else {
            console.log('Test accounts already exist');
        }
    }

    showAuthScreen() {
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) {
            authScreen.style.display = 'block';
        }
    }

    bindFormEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const userType = document.getElementById('userType').value;

        if (!email || !password || !userType) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        this.showLoading('loginForm');

        try {
            // Simulate API call
            await this.delay(1000);
            
            // Check for test accounts first
            const authData = localStorage.getItem('gesturequiz_auth');
            let user = null;
            
            if (authData) {
                const accounts = JSON.parse(authData);
                if (accounts[email] && accounts[email].password === password) {
                    // Use the stored test account data
                    user = accounts[email].userData;
                    user.loginTime = new Date().toISOString();
                } else {
                    this.showMessage('Invalid email or password', 'error');
                    return;
                }
            } else {
                // If no test data exists, create it automatically
                this.createTestAccounts();
                
                // Try again with test accounts
                const newAuthData = localStorage.getItem('gesturequiz_auth');
                if (newAuthData) {
                    const accounts = JSON.parse(newAuthData);
                    if (accounts[email] && accounts[email].password === password) {
                        user = accounts[email].userData;
                        user.loginTime = new Date().toISOString();
                    } else {
                        // For demo purposes, accept any other login
                        user = {
                            id: Date.now(),
                            name: email.split('@')[0],
                            email: email,
                            role: userType,
                            type: userType,
                            loginTime: new Date().toISOString()
                        };
                    }
                } else {
                    // Fallback: accept any login
                    user = {
                        id: Date.now(),
                        name: email.split('@')[0],
                        email: email,
                        role: userType,
                        type: userType,
                        loginTime: new Date().toISOString()
                    };
                }
            }

            this.currentUser = user;
            localStorage.setItem('gestureQuizUser', JSON.stringify(user));
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
            
            this.showMessage('Login successful!', 'success');
            this.hideAuthModal();
            setTimeout(() => this.showMainApp(), 1000);

        } catch (error) {
            this.showMessage('Login failed. Please try again.', 'error');
        } finally {
            this.hideLoading('loginForm');
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const userType = document.getElementById('registerType').value;

        if (!name || !email || !password || !userType) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        this.showLoading('registerForm');

        try {
            // Simulate API call
            await this.delay(1000);
            
            const user = {
                id: Date.now(),
                name: name,
                email: email,
                type: userType,
                registrationTime: new Date().toISOString()
            };

            this.currentUser = user;
            localStorage.setItem('gestureQuizUser', JSON.stringify(user));
            this.showMessage('Registration successful!', 'success');
            this.hideAuthModal();
            setTimeout(() => this.showMainApp(), 1000);

        } catch (error) {
            this.showMessage('Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading('registerForm');
        }
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    startAuth(type) {
        this.currentAuthType = type;
        this.hideLoginModal();
        this.showAuthModal();
        
        // Set the user type in hidden fields
        const userTypeField = document.getElementById('userType');
        const registerTypeField = document.getElementById('registerType');
        if (userTypeField) userTypeField.value = type;
        if (registerTypeField) registerTypeField.value = type;
        
        // Update modal title
        const modalTitle = document.getElementById('auth-modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Login as ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        }
        
        // Show login form by default
        this.switchAuthMode('login');
    }

    switchAuthMode(mode) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const modalTitle = document.getElementById('auth-modal-title');
        
        if (mode === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            modalTitle.textContent = `Login as ${this.currentAuthType.charAt(0).toUpperCase() + this.currentAuthType.slice(1)}`;
        } else {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
            modalTitle.textContent = `Register as ${this.currentAuthType.charAt(0).toUpperCase() + this.currentAuthType.slice(1)}`;
        }
    }

    demoLogin(type) {
        this.hideLoginModal();
        this.hideAuthModal();
        
        // Create demo user
        const user = {
            id: Date.now(),
            name: `Demo ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            email: `demo@${type}.com`,
            type: type,
            loginTime: new Date().toISOString(),
            isDemo: true
        };

        this.currentUser = user;
        localStorage.setItem('gestureQuizUser', JSON.stringify(user));
        
        this.showMessage(`Welcome, Demo ${type.charAt(0).toUpperCase() + type.slice(1)}!`, 'success');
        setTimeout(() => this.showMainApp(), 1000);
    }

    showProfile() {
        // For now, just show user info
        const user = this.getCurrentUser();
        if (user) {
            this.showMessage(`Profile: ${user.name} (${user.type})`, 'info');
        }
    }

    logout() {
        localStorage.removeItem('gestureQuizUser');
        this.currentUser = null;
        this.showMessage('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showAuthScreen() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        // Hide loading and auth screens
        const loadingScreen = document.getElementById('loading-screen');
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (authScreen) authScreen.style.display = 'none';
        if (mainApp) {
            mainApp.classList.remove('hidden');
            mainApp.classList.add('active');
            mainApp.style.display = 'block';
        }
        
        // Update user name in navbar
        const userNameElement = document.getElementById('userName');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name;
        }
        
        // Load appropriate dashboard
        if (this.currentUser && this.currentUser.type === 'teacher') {
            this.loadTeacherDashboard();
        } else {
            this.loadStudentDashboard();
        }
    }

    loadTeacherDashboard() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="dashboard-header">
                    <h1>Teacher Dashboard</h1>
                    <p>Welcome back, ${this.currentUser.name}!</p>
                </div>
                <div class="dashboard-content">
                    <div class="card">
                        <h3>Create New Quiz</h3>
                        <p>Start creating interactive quizzes for your students</p>
                        <button class="btn btn-primary" onclick="window.location.href='#create-quiz'">
                            <i class="fas fa-plus"></i> Create Quiz
                        </button>
                    </div>
                    <div class="card">
                        <h3>Manage Quizzes</h3>
                        <p>View and edit your existing quizzes</p>
                        <button class="btn btn-outline" onclick="window.location.href='#manage-quizzes'">
                            <i class="fas fa-edit"></i> Manage
                        </button>
                    </div>
                    <div class="card">
                        <h3>Student Analytics</h3>
                        <p>View student performance and progress</p>
                        <button class="btn btn-outline" onclick="window.location.href='#analytics'">
                            <i class="fas fa-chart-line"></i> Analytics
                        </button>
                    </div>
                </div>
            `;
        }
    }

    loadStudentDashboard() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="dashboard-header">
                    <h1>Student Dashboard</h1>
                    <p>Welcome back, ${this.currentUser.name}!</p>
                </div>
                <div class="dashboard-content">
                    <div class="card">
                        <h3>Available Quizzes</h3>
                        <p>Take quizzes using hand gestures</p>
                        <button class="btn btn-primary" onclick="window.location.href='#take-quiz'">
                            <i class="fas fa-play"></i> Take Quiz
                        </button>
                    </div>
                    <div class="card">
                        <h3>My Results</h3>
                        <p>View your quiz results and progress</p>
                        <button class="btn btn-outline" onclick="window.location.href='#results'">
                            <i class="fas fa-chart-bar"></i> View Results
                        </button>
                    </div>
                    <div class="card">
                        <h3>Practice Mode</h3>
                        <p>Practice hand gestures for better accuracy</p>
                        <button class="btn btn-outline" onclick="window.location.href='#practice'">
                            <i class="fas fa-hand-paper"></i> Practice
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} show`;
        messageDiv.textContent = message;

        // Insert at the top of active form
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) {
            activeForm.insertBefore(messageDiv, activeForm.firstChild);
        }

        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }

    showLoading(formId) {
        const form = document.getElementById(formId);
        const button = form.querySelector('.btn');
        button.classList.add('loading');
        button.disabled = true;
    }

    hideLoading(formId) {
        const form = document.getElementById(formId);
        const button = form.querySelector('.btn');
        button.classList.remove('loading');
        button.disabled = false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    createTestAccounts() {
        // Create comprehensive test accounts
        const teacherAccount = {
            id: 'teacher_001',
            name: 'Dr. Sarah Johnson',
            email: 'teacher@gesturequiz.com',
            password: 'teacher2025',
            role: 'teacher',
            type: 'teacher',
            school: 'Lincoln High School',
            department: 'Mathematics',
            phone: '+1-555-0123',
            avatar: 'https://images.unsplash.com/photo-1559582927-62cddd4a4b8d?w=150&h=150&fit=crop&crop=face',
            createdAt: new Date().toISOString(),
            stats: {
                totalClasses: 3,
                totalStudents: 45,
                totalQuizzes: 12,
                averageScore: 87.5
            }
        };

        const studentAccounts = [
            {
                id: 'student_001',
                name: 'Alex Martinez',
                email: 'student@gesturequiz.com',
                password: 'student2025',
                role: 'student',
                type: 'student',
                grade: '10th Grade',
                studentId: 'ST001',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                createdAt: new Date().toISOString(),
                stats: {
                    totalQuizzes: 8,
                    averageScore: 92.3,
                    completedQuizzes: 8,
                    totalClasses: 3,
                    rank: 1
                }
            },
            {
                id: 'student_002',
                name: 'Emma Wilson',
                email: 'student2@gesturequiz.com',
                password: 'student2025',
                role: 'student',
                type: 'student',
                grade: '10th Grade',
                studentId: 'ST002',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b74a6caa?w=150&h=150&fit=crop&crop=face',
                createdAt: new Date().toISOString(),
                stats: {
                    totalQuizzes: 7,
                    averageScore: 85.7,
                    completedQuizzes: 7,
                    totalClasses: 2,
                    rank: 3
                }
            }
        ];

        // Save test accounts
        localStorage.setItem('teacherAccount', JSON.stringify(teacherAccount));
        localStorage.setItem('studentAccounts', JSON.stringify(studentAccounts));
        
        // Create user authentication data
        const authData = {
            'teacher@gesturequiz.com': {
                password: 'teacher2025',
                userData: teacherAccount
            },
            'student@gesturequiz.com': {
                password: 'student2025',
                userData: studentAccounts[0]
            },
            'student2@gesturequiz.com': {
                password: 'student2025',
                userData: studentAccounts[1]
            }
        };
        localStorage.setItem('gesturequiz_auth', JSON.stringify(authData));
        
        console.log('✅ Test accounts created successfully!');
    }
}

// Global functions for HTML onclick handlers
window.showLoginModal = function() {
    if (window.authSystem) {
        window.authSystem.showLoginModal();
    }
}

window.hideLoginModal = function() {
    if (window.authSystem) {
        window.authSystem.hideLoginModal();
    }
}

window.hideAuthModal = function() {
    if (window.authSystem) {
        window.authSystem.hideAuthModal();
    }
}

window.startAuth = function(type) {
    if (window.authSystem) {
        window.authSystem.startAuth(type);
    }
}

window.switchAuthMode = function(mode) {
    if (window.authSystem) {
        window.authSystem.switchAuthMode(mode);
    }
}

window.demoLogin = function(type) {
    if (window.authSystem) {
        window.authSystem.demoLogin(type);
    }
}

window.scrollToFeatures = function() {
    const featuresSection = document.querySelector('.intro-section');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

window.toggleMobileMenu = function() {
    // Add mobile menu toggle functionality
    console.log('Mobile menu toggle');
}

// Initialize the authentication system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.authSystem = new AuthSystem();
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.authSystem = new AuthSystem();
    });
} else {
    window.authSystem = new AuthSystem();
}

// Modal Functions
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function startAuth(userType) {
    // Set the user type
    document.getElementById('userType').value = userType;
    document.getElementById('registerType').value = userType;
    
    // Update modal title
    const modalTitle = document.getElementById('auth-modal-title');
    if (modalTitle) {
        modalTitle.textContent = `Login as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
    }
    
    // Hide login modal and show auth modal
    hideLoginModal();
    setTimeout(() => showAuthModal(), 200);
}

function switchAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const modalTitle = document.getElementById('auth-modal-title');
    
    if (mode === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        modalTitle.textContent = 'Login';
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        modalTitle.textContent = 'Register';
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Modal close on click outside
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'login-modal') {
                    hideLoginModal();
                } else if (this.id === 'auth-modal') {
                    hideAuthModal();
                }
            }
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideLoginModal();
            hideAuthModal();
        }
    });
});

// Export modal functions
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.startAuth = startAuth;
window.switchAuthMode = switchAuthMode;
window.toggleMobileMenu = toggleMobileMenu;

// New tab functionality
function showAuthTab(tabName) {
    // Hide all forms
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('about-form').classList.remove('active');
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected form and activate tab
    if (tabName === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelector('[onclick="showAuthTab(\'login\')"]').classList.add('active');
    } else if (tabName === 'register') {
        document.getElementById('register-form').classList.add('active');
        document.querySelector('[onclick="showAuthTab(\'register\')"]').classList.add('active');
    } else if (tabName === 'about') {
        document.getElementById('about-form').classList.add('active');
        document.querySelector('[onclick="showAuthTab(\'about\')"]').classList.add('active');
    }
}

function demoLogin(userType) {
    window.authSystem.demoLogin(userType);
}

function logout() {
    window.authSystem.logout();
}

function showProfile() {
    const user = window.authSystem.getCurrentUser();
    if (user) {
        showNotification(`Profile: ${user.name} (${user.type})`, 'info');
    }
}

window.scrollToFeatures = function() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Export for use in other modules
window.showRegister = showRegister;
window.showLogin = showLogin;
window.showAuthTab = showAuthTab;
window.demoLogin = demoLogin;
window.logout = logout;
window.showProfile = showProfile;

// Add error handling and debug logging
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    console.error('Error message:', e.message);
    console.error('Error source:', e.filename, 'line:', e.lineno);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// Debug logging
console.log('Auth.js loaded successfully');

// Make sure DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Show the auth screen immediately for debugging
    const authScreen = document.getElementById('auth-screen');
    const loadingScreen = document.getElementById('loading-screen');
    
    if (authScreen) {
        console.log('Auth screen found, showing it');
        authScreen.style.display = 'block';
    } else {
        console.error('Auth screen not found!');
    }
    
    if (loadingScreen) {
        console.log('Loading screen found, hiding it');
        loadingScreen.style.display = 'none';
    }
});
