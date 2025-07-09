// Notification System for Live Website
// Handles real-time notifications, alerts, and user feedback

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.container = null;
        
        this.initializeContainer();
        this.setupServiceWorker();
    }

    initializeContainer() {
        // Create notification container if it doesn't exist
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }

        // Add CSS if not already present
        if (!document.getElementById('notification-styles')) {
            this.addNotificationStyles();
        }
    }

    addNotificationStyles() {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            }

            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                margin-bottom: 12px;
                padding: 16px 20px;
                max-width: 400px;
                min-width: 300px;
                pointer-events: auto;
                transform: translateX(100%);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border-left: 4px solid #3b82f6;
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                transform: translateX(0);
            }

            .notification.success {
                border-left-color: #10b981;
            }

            .notification.warning {
                border-left-color: #f59e0b;
            }

            .notification.error {
                border-left-color: #ef4444;
            }

            .notification.info {
                border-left-color: #3b82f6;
            }

            .notification-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
            }

            .notification-icon {
                width: 20px;
                height: 20px;
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .notification-icon.success {
                color: #10b981;
            }

            .notification-icon.warning {
                color: #f59e0b;
            }

            .notification-icon.error {
                color: #ef4444;
            }

            .notification-icon.info {
                color: #3b82f6;
            }

            .notification-title {
                font-weight: 600;
                color: #1f2937;
                flex: 1;
            }

            .notification-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: color 0.2s;
            }

            .notification-close:hover {
                color: #374151;
            }

            .notification-message {
                color: #4b5563;
                line-height: 1.5;
            }

            .notification-actions {
                margin-top: 12px;
                display: flex;
                gap: 8px;
            }

            .notification-action {
                background: #f3f4f6;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 14px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .notification-action:hover {
                background: #e5e7eb;
            }

            .notification-action.primary {
                background: #3b82f6;
                color: white;
            }

            .notification-action.primary:hover {
                background: #2563eb;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                transition: width linear;
            }

            @media (max-width: 640px) {
                .notification-container {
                    left: 20px;
                    right: 20px;
                    top: 20px;
                }

                .notification {
                    min-width: auto;
                    max-width: none;
                    transform: translateY(-100%);
                }

                .notification.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }

    show(message, type = 'info', options = {}) {
        const notification = {
            id: this.generateId(),
            message: message,
            type: type,
            title: options.title || this.getDefaultTitle(type),
            duration: options.duration || this.defaultDuration,
            actions: options.actions || [],
            persistent: options.persistent || false,
            timestamp: new Date()
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        // Auto-remove if not persistent
        if (!notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        // Limit number of notifications
        if (this.notifications.length > this.maxNotifications) {
            const oldestId = this.notifications[0].id;
            this.remove(oldestId);
        }

        return notification.id;
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { duration: 0, ...options });
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    }

    renderNotification(notification) {
        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = `notification ${notification.type}`;

        const icon = this.getIcon(notification.type);
        const actions = notification.actions.map(action => 
            `<button class="notification-action ${action.style || ''}" onclick="notificationSystem.handleAction('${notification.id}', '${action.id}')">${action.label}</button>`
        ).join('');

        element.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon ${notification.type}">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-title">${notification.title}</div>
                <button class="notification-close" onclick="notificationSystem.remove('${notification.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-message">${notification.message}</div>
            ${actions ? `<div class="notification-actions">${actions}</div>` : ''}
            ${notification.duration > 0 && !notification.persistent ? 
                `<div class="notification-progress" style="animation: countdown ${notification.duration}ms linear forwards;"></div>` : ''}
        `;

        this.container.appendChild(element);

        // Trigger animation
        setTimeout(() => {
            element.classList.add('show');
        }, 100);
    }

    handleAction(notificationId, actionId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        const action = notification.actions.find(a => a.id === actionId);
        if (action && action.handler) {
            action.handler();
        }

        // Remove notification after action
        this.remove(notificationId);
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            warning: 'Warning',
            error: 'Error',
            info: 'Info'
        };
        return titles[type] || 'Notification';
    }

    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    // Push notification support
    setupServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            // Don't await this - let it run in background without blocking
            this.registerServiceWorker().catch(error => {
                console.log('Service Worker setup failed, continuing without it:', error.message);
            });
        } else {
            console.log('Service Worker or Push notifications not supported in this browser');
        }
    }

    async registerServiceWorker() {
        try {
            // Determine the correct service worker path
            let swPath;
            
            if (window.location.hostname.includes('github.io')) {
                // GitHub Pages - use relative path
                swPath = window.location.pathname.includes('/quiz-app/') ? 
                    '../sw.js' : '/gesturequiz-platform/quiz-app/sw.js';
            } else {
                // Firebase Hosting or local - use absolute path
                swPath = window.location.pathname.includes('/quiz-app/') ? 
                    '/quiz-app/sw.js' : '/sw.js';
            }
            
            console.log('🔧 Attempting to register service worker at:', swPath);
            const registration = await navigator.serviceWorker.register(swPath);
            console.log('✅ Service Worker registered:', registration);
            
            // Request notification permission
            if (Notification.permission === 'default') {
                await this.requestNotificationPermission();
            }
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            // Don't throw the error - just log it so the app continues to work
            console.log('⚠️ Continuing without service worker...');
        }
    }

    async requestNotificationPermission() {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            this.success('Notifications enabled! You\'ll receive updates even when the page is closed.');
        }
        return permission;
    }

    // Real-time notifications for live features
    notifyNewQuiz(quiz) {
        this.show(
            `New quiz "${quiz.title}" is available in your class!`,
            'info',
            {
                title: 'New Quiz Available',
                actions: [
                    {
                        id: 'take-quiz',
                        label: 'Take Quiz',
                        style: 'primary',
                        handler: () => window.location.href = `quiz-interface.html?id=${quiz.id}`
                    },
                    {
                        id: 'later',
                        label: 'Later',
                        handler: () => {}
                    }
                ]
            }
        );
    }

    notifyGradeUpdate(quiz, score) {
        this.show(
            `Your quiz "${quiz.title}" has been graded. Score: ${score}%`,
            score >= 80 ? 'success' : score >= 60 ? 'warning' : 'info',
            {
                title: 'Quiz Graded',
                actions: [
                    {
                        id: 'view-results',
                        label: 'View Results',
                        style: 'primary',
                        handler: () => window.location.href = `student-dashboard.html`
                    }
                ]
            }
        );
    }

    notifyClassUpdate(className, type) {
        const messages = {
            'student-added': `You've been added to class "${className}"`,
            'quiz-published': `New quiz published in "${className}"`,
            'assignment-due': `Assignment due soon in "${className}"`
        };

        this.show(
            messages[type] || `Update in class "${className}"`,
            'info',
            {
                title: 'Class Update'
            }
        );
    }

    notifySystemUpdate(message, type = 'info') {
        this.show(message, type, {
            title: 'System Update',
            persistent: type === 'error'
        });
    }
}

// Add countdown animation CSS
const countdownCSS = `
    @keyframes countdown {
        from { width: 100%; }
        to { width: 0%; }
    }
`;

const style = document.createElement('style');
style.textContent = countdownCSS;
document.head.appendChild(style);

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Export for global use
if (typeof window !== 'undefined') {
    window.notificationSystem = notificationSystem;
    window.showNotification = (message, type = 'info', options = {}) => {
        return notificationSystem.show(message, type, options);
    };
}
