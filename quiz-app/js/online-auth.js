// Online Authentication System - Firebase Integration
// This replaces localStorage authentication with Firebase Auth

class OnlineAuthManager {
    constructor() {
        this.dataManager = null;
        this.currentUser = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize the data manager
            this.dataManager = new OnlineDataManager();
            await this.dataManager.initialize();
            
            // Listen for auth state changes
            this.dataManager.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.handleAuthStateChange(user);
            });
            
            this.initialized = true;
            console.log('✅ Online Auth initialized');
        } catch (error) {
            console.error('❌ Online Auth initialization failed:', error);
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            // User is signed in
            console.log('✅ User signed in:', user.email);
            this.loadUserProfile(user.uid);
        } else {
            // User is signed out
            console.log('❌ User signed out');
            this.currentUser = null;
            
            // Redirect to login if not on public pages
            if (!this.isPublicPage()) {
                window.location.href = '../index.html';
            }
        }
    }

    async loadUserProfile(userId) {
        try {
            const result = await this.dataManager.getUserProfile(userId);
            if (result.success) {
                this.currentUser = {
                    uid: userId,
                    ...result.data
                };
                
                // Update UI with user data
                this.updateUI();
            }
        } catch (error) {
            console.error('❌ Error loading user profile:', error);
        }
    }

    async signIn(email, password) {
        try {
            const result = await this.dataManager.signIn(email, password);
            
            if (result.success) {
                // Get user profile
                const profile = await this.dataManager.getUserProfile(result.user.uid);
                
                if (profile.success) {
                    const userData = profile.data;
                    
                    // Redirect based on role
                    if (userData.role === 'teacher') {
                        window.location.href = 'pages/teacher-dashboard.html';
                    } else if (userData.role === 'student') {
                        window.location.href = 'pages/student-dashboard.html';
                    } else {
                        window.location.href = 'pages/dashboard.html';
                    }
                    
                    return { success: true, user: userData };
                }
            }
            
            return result;
        } catch (error) {
            console.error('❌ Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signUp(email, password, userData) {
        try {
            const result = await this.dataManager.signUp(email, password, userData);
            
            if (result.success) {
                // Show success message
                this.showMessage('Account created successfully! Please sign in.', 'success');
                
                // Redirect to login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await this.dataManager.signOut();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('❌ Sign out error:', error);
        }
    }

    async updateProfile(profileData) {
        if (!this.currentUser) return { success: false, error: 'Not authenticated' };
        
        try {
            const result = await this.dataManager.updateProfile(this.currentUser.uid, profileData);
            
            if (result.success) {
                // Update local user data
                this.currentUser = { ...this.currentUser, ...profileData };
                
                // Update UI
                this.updateUI();
                
                // Show success message
                this.showMessage('Profile updated successfully!', 'success');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Profile update error:', error);
            return { success: false, error: error.message };
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isPublicPage() {
        const publicPages = ['index.html', 'login.html', 'register.html', ''];
        const currentPage = window.location.pathname.split('/').pop();
        return publicPages.includes(currentPage);
    }

    updateUI() {
        if (!this.currentUser) return;

        // Update welcome message
        const welcomeText = document.getElementById('welcomeText');
        if (welcomeText) {
            welcomeText.textContent = `Welcome back, ${this.currentUser.name}!`;
        }

        // Update user name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = this.currentUser.name;
        }

        // Update user avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            if (this.currentUser.avatar) {
                userAvatar.textContent = this.currentUser.avatar;
            } else {
                const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                userAvatar.textContent = initials;
            }
        }

        // Update profile form if present
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const currentProfileAvatar = document.getElementById('currentProfileAvatar');

        if (profileName) profileName.value = this.currentUser.name || '';
        if (profileEmail) profileEmail.value = this.currentUser.email || '';
        if (currentProfileAvatar) currentProfileAvatar.textContent = this.currentUser.avatar || '👤';
    }

    showMessage(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#0284c7'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 2000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Create test users for demonstration
    async createTestUsers() {
        const testUsers = [
            {
                email: 'teacher@gesturequiz.com',
                password: 'password123',
                userData: {
                    name: 'Dr. Sarah Johnson',
                    role: 'teacher',
                    avatar: '👩‍🏫'
                }
            },
            {
                email: 'student@gesturequiz.com',
                password: 'password123',
                userData: {
                    name: 'Alex Student',
                    role: 'student',
                    avatar: '👨‍🎓'
                }
            },
            {
                email: 'student2@gesturequiz.com',
                password: 'password123',
                userData: {
                    name: 'Emma Student',
                    role: 'student',
                    avatar: '👩‍🎓'
                }
            }
        ];

        for (const user of testUsers) {
            try {
                const result = await this.signUp(user.email, user.password, user.userData);
                if (result.success) {
                    console.log(`✅ Test user created: ${user.email}`);
                } else {
                    console.log(`ℹ️  Test user exists: ${user.email}`);
                }
            } catch (error) {
                console.log(`ℹ️  Test user exists: ${user.email}`);
            }
        }
    }

    // Migrate data from localStorage to Firebase
    async migrateFromLocalStorage() {
        try {
            console.log('🔄 Migrating data from localStorage to Firebase...');
            
            // Migrate user data
            const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (localUser.email && this.currentUser) {
                await this.updateProfile(localUser);
            }

            // Migrate quizzes
            const localQuizzes = JSON.parse(localStorage.getItem('gestureQuizzes') || '[]');
            for (const quiz of localQuizzes) {
                if (quiz.createdBy === this.currentUser.email) {
                    await this.dataManager.createQuiz(quiz);
                }
            }

            // Migrate classes
            const localClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
            for (const cls of localClasses) {
                if (cls.createdBy === this.currentUser.email) {
                    await this.dataManager.createClass(cls);
                }
            }

            // Clear localStorage after successful migration
            localStorage.removeItem('currentUser');
            localStorage.removeItem('gestureQuizzes');
            localStorage.removeItem('teacherClasses');

            console.log('✅ Data migration completed successfully');
            this.showMessage('Data migrated to online storage successfully!', 'success');
        } catch (error) {
            console.error('❌ Data migration failed:', error);
            this.showMessage('Data migration failed. Please try again.', 'error');
        }
    }

    // Handle offline mode
    handleOfflineMode() {
        if (!navigator.onLine) {
            this.showMessage('You are offline. Some features may be limited.', 'info');
        }
    }
}

// Initialize auth manager
const authManager = new OnlineAuthManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    await authManager.initialize();
});

// Handle online/offline events
window.addEventListener('online', function() {
    authManager.showMessage('Back online! Syncing data...', 'success');
    authManager.dataManager.syncOfflineData();
});

window.addEventListener('offline', function() {
    authManager.handleOfflineMode();
});

// Export for global use
window.authManager = authManager;
