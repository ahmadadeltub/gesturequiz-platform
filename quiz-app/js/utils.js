// Utility functions for the quiz app

// Copy the gesture detector from the original app
class GestureDetector {
    constructor() {
        this.gestures = {
            'open_palm': { name: 'Open Palm', emoji: '✋', confidence: 0 },
            'fist': { name: 'Fist', emoji: '✊', confidence: 0 },
            'ok_sign': { name: 'OK Sign', emoji: '👌', confidence: 0 },
            'thumbs_up': { name: 'Thumbs Up', emoji: '👍', confidence: 0 },
            'point_up': { name: 'Point Up', emoji: '☝️', confidence: 0 },
            'peace_sign': { name: 'Peace Sign', emoji: '✌️', confidence: 0 }
        };
    }

    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    isFingerExtended(landmarks, fingerTip, fingerPip, fingerMcp) {
        const tipY = landmarks[fingerTip].y;
        const pipY = landmarks[fingerPip].y;
        const mcpY = landmarks[fingerMcp].y;
        
        return tipY < pipY && pipY < mcpY;
    }

    isThumbExtended(landmarks) {
        const thumbTip = landmarks[4];
        const thumbPip = landmarks[3];
        const thumbMcp = landmarks[2];
        
        return Math.abs(thumbTip.x - thumbMcp.x) > Math.abs(thumbPip.x - thumbMcp.x);
    }

    detectOpenPalm(landmarks) {
        const fingers = [
            this.isThumbExtended(landmarks),
            this.isFingerExtended(landmarks, 8, 6, 5),
            this.isFingerExtended(landmarks, 12, 10, 9),
            this.isFingerExtended(landmarks, 16, 14, 13),
            this.isFingerExtended(landmarks, 20, 18, 17)
        ];
        
        const extendedCount = fingers.filter(f => f).length;
        return extendedCount >= 4 ? 0.8 + (extendedCount - 4) * 0.05 : 0;
    }

    detectFist(landmarks) {
        const fingers = [
            this.isThumbExtended(landmarks),
            this.isFingerExtended(landmarks, 8, 6, 5),
            this.isFingerExtended(landmarks, 12, 10, 9),
            this.isFingerExtended(landmarks, 16, 14, 13),
            this.isFingerExtended(landmarks, 20, 18, 17)
        ];
        
        const extendedCount = fingers.filter(f => f).length;
        return extendedCount <= 1 ? 0.9 - extendedCount * 0.2 : 0;
    }

    detectOkSign(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        const thumbIndexDistance = this.calculateDistance(thumbTip, indexTip);
        const isCircleFormed = thumbIndexDistance < 0.05;
        
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        if (isCircleFormed && middleExtended && ringExtended && pinkyExtended) {
            return 0.85;
        }
        
        return 0;
    }

    detectThumbsUp(landmarks) {
        const thumbExtended = this.isThumbExtended(landmarks);
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            const thumbTip = landmarks[4];
            const thumbMcp = landmarks[2];
            const isThumbUp = thumbTip.y < thumbMcp.y;
            
            return isThumbUp ? 0.9 : 0;
        }
        
        return 0;
    }

    detectPointUp(landmarks) {
        const thumbExtended = this.isThumbExtended(landmarks);
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        if (indexExtended && !thumbExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 0.85;
        }
        
        return 0;
    }

    detectPeaceSign(landmarks) {
        const thumbExtended = this.isThumbExtended(landmarks);
        const indexExtended = this.isFingerExtended(landmarks, 8, 6, 5);
        const middleExtended = this.isFingerExtended(landmarks, 12, 10, 9);
        const ringExtended = this.isFingerExtended(landmarks, 16, 14, 13);
        const pinkyExtended = this.isFingerExtended(landmarks, 20, 18, 17);
        
        if (indexExtended && middleExtended && !thumbExtended && !ringExtended && !pinkyExtended) {
            const indexTip = landmarks[8];
            const middleTip = landmarks[12];
            const fingerDistance = this.calculateDistance(indexTip, middleTip);
            
            return fingerDistance > 0.05 ? 0.9 : 0.7;
        }
        
        return 0;
    }

    detectGesture(landmarks) {
        if (!landmarks || landmarks.length < 21) {
            return { gesture: 'none', confidence: 0 };
        }

        const confidences = {
            'open_palm': this.detectOpenPalm(landmarks),
            'fist': this.detectFist(landmarks),
            'ok_sign': this.detectOkSign(landmarks),
            'thumbs_up': this.detectThumbsUp(landmarks),
            'point_up': this.detectPointUp(landmarks),
            'peace_sign': this.detectPeaceSign(landmarks)
        };

        let bestGesture = 'none';
        let maxConfidence = 0;

        for (const [gesture, confidence] of Object.entries(confidences)) {
            if (confidence > maxConfidence && confidence > 0.5) {
                maxConfidence = confidence;
                bestGesture = gesture;
            }
        }

        return {
            gesture: bestGesture,
            confidence: maxConfidence,
            allConfidences: confidences
        };
    }

    getGestureInfo(gestureKey) {
        return this.gestures[gestureKey] || { name: 'Unknown', emoji: '❓', confidence: 0 };
    }
}

// Make GestureDetector available globally
window.GestureDetector = GestureDetector;

// Utility functions
const Utils = {
    // Format time from seconds to MM:SS
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // Generate random ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Shuffle array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Save to localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    // Load from localStorage
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    },

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            case 'warning':
                notification.style.background = '#ffc107';
                notification.style.color = '#000';
                break;
            default:
                notification.style.background = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    },

    // Check if device has camera
    async checkCameraAvailability() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.some(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error checking camera availability:', error);
            return false;
        }
    },

    // Request camera permission
    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            return false;
        }
    },

    // Calculate quiz score
    calculateScore(answers, correctAnswers) {
        if (!answers || !correctAnswers || correctAnswers.length === 0) return 0;
        
        let correct = 0;
        correctAnswers.forEach((correctAnswer, index) => {
            if (answers[index] === correctAnswer) {
                correct++;
            }
        });
        
        return Math.round((correct / correctAnswers.length) * 100);
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Get grade from score
    getGrade(score) {
        if (score >= 90) return { grade: 'A', color: '#28a745' };
        if (score >= 80) return { grade: 'B', color: '#17a2b8' };
        if (score >= 70) return { grade: 'C', color: '#ffc107' };
        if (score >= 60) return { grade: 'D', color: '#fd7e14' };
        return { grade: 'F', color: '#dc3545' };
    },

    // Initialize sample data
    initializeSampleData() {
        // Check if sample quizzes already exist
        const existingQuizzes = this.loadFromStorage('quizzes', []);
        const existingResults = this.loadFromStorage('quizResults', []);
        
        if (existingQuizzes.length === 0) {
            const sampleQuizzes = [
                {
                    id: 'quiz-1',
                    title: 'Basic Math Quiz',
                    description: 'Test your basic math skills with simple arithmetic problems.',
                    category: 'math',
                    difficulty: 'easy',
                    timeLimit: 5,
                    passingScore: 70,
                    questions: [
                        {
                            text: 'What is 2 + 2?',
                            options: { a: '3', b: '4', c: '5', d: '6' },
                            correct: 'b'
                        },
                        {
                            text: 'What is 5 × 3?',
                            options: { a: '15', b: '12', c: '18', d: '20' },
                            correct: 'a'
                        },
                        {
                            text: 'What is 10 - 4?',
                            options: { a: '5', b: '6', c: '7', d: '8' },
                            correct: 'b'
                        }
                    ],
                    createdBy: 'Demo Teacher',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'quiz-2',
                    title: 'Science Basics',
                    description: 'Fundamental science concepts for beginners.',
                    category: 'science',
                    difficulty: 'medium',
                    timeLimit: 10,
                    passingScore: 75,
                    questions: [
                        {
                            text: 'What is the chemical symbol for water?',
                            options: { a: 'H2O', b: 'CO2', c: 'O2', d: 'N2' },
                            correct: 'a'
                        },
                        {
                            text: 'How many planets are in our solar system?',
                            options: { a: '7', b: '8', c: '9', d: '10' },
                            correct: 'b'
                        },
                        {
                            text: 'What gas do plants absorb from the atmosphere?',
                            options: { a: 'Oxygen', b: 'Nitrogen', c: 'Carbon Dioxide', d: 'Hydrogen' },
                            correct: 'c'
                        }
                    ],
                    createdBy: 'Demo Teacher',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'quiz-3',
                    title: 'World Geography',
                    description: 'Test your knowledge of world geography.',
                    category: 'geography',
                    difficulty: 'medium',
                    timeLimit: 8,
                    passingScore: 70,
                    questions: [
                        {
                            text: 'What is the capital of France?',
                            options: { a: 'London', b: 'Berlin', c: 'Paris', d: 'Rome' },
                            correct: 'c'
                        },
                        {
                            text: 'Which is the largest continent?',
                            options: { a: 'Africa', b: 'Asia', c: 'North America', d: 'Europe' },
                            correct: 'b'
                        },
                        {
                            text: 'What is the longest river in the world?',
                            options: { a: 'Amazon', b: 'Nile', c: 'Mississippi', d: 'Congo' },
                            correct: 'b'
                        }
                    ],
                    createdBy: 'Demo Teacher',
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.saveToStorage('quizzes', sampleQuizzes);
            
            // Add sample quiz results
            const sampleResults = [
                {
                    id: 'result-1',
                    quizId: 'quiz-1',
                    studentName: 'John Doe',
                    studentEmail: 'john.doe@example.com',
                    score: 92,
                    timeTaken: '4:32',
                    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                    answers: [
                        { questionId: 1, answer: 'b', correct: true },
                        { questionId: 2, answer: 'a', correct: true },
                        { questionId: 3, answer: 'b', correct: true }
                    ]
                },
                {
                    id: 'result-2',
                    quizId: 'quiz-1',
                    studentName: 'Jane Smith',
                    studentEmail: 'jane.smith@example.com',
                    score: 75,
                    timeTaken: '3:45',
                    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
                    answers: [
                        { questionId: 1, answer: 'b', correct: true },
                        { questionId: 2, answer: 'a', correct: true },
                        { questionId: 3, answer: 'c', correct: false }
                    ]
                },
                {
                    id: 'result-3',
                    quizId: 'quiz-2',
                    studentName: 'Alice Johnson',
                    studentEmail: 'alice.johnson@example.com',
                    score: 88,
                    timeTaken: '7:15',
                    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                    answers: [
                        { questionId: 1, answer: 'a', correct: true },
                        { questionId: 2, answer: 'b', correct: true },
                        { questionId: 3, answer: 'c', correct: true }
                    ]
                },
                {
                    id: 'result-4',
                    quizId: 'quiz-1',
                    studentName: 'Bob Wilson',
                    studentEmail: 'bob.wilson@example.com',
                    score: 58,
                    timeTaken: '4:58',
                    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                    answers: [
                        { questionId: 1, answer: 'a', correct: false },
                        { questionId: 2, answer: 'a', correct: true },
                        { questionId: 3, answer: 'b', correct: true }
                    ]
                }
            ];
            
            this.saveToStorage('quizResults', sampleResults);
        }
        
        // Always ensure we have some sample results for demo
        if (existingResults.length === 0) {
            const sampleResults = [
                {
                    id: 'result-1',
                    quizId: 'quiz-1',
                    studentName: 'John Doe',
                    studentEmail: 'john.doe@example.com',
                    score: 92,
                    timeTaken: '4:32',
                    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    answers: [
                        { questionId: 1, answer: 'b', correct: true },
                        { questionId: 2, answer: 'a', correct: true },
                        { questionId: 3, answer: 'b', correct: true }
                    ]
                },
                {
                    id: 'result-2',
                    quizId: 'quiz-1',
                    studentName: 'Jane Smith',
                    studentEmail: 'jane.smith@example.com',
                    score: 75,
                    timeTaken: '3:45',
                    completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    answers: [
                        { questionId: 1, answer: 'b', correct: true },
                        { questionId: 2, answer: 'a', correct: true },
                        { questionId: 3, answer: 'c', correct: false }
                    ]
                },
                {
                    id: 'result-3',
                    quizId: 'quiz-2',
                    studentName: 'Alice Johnson',
                    studentEmail: 'alice.johnson@example.com',
                    score: 88,
                    timeTaken: '7:15',
                    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    answers: [
                        { questionId: 1, answer: 'a', correct: true },
                        { questionId: 2, answer: 'b', correct: true },
                        { questionId: 3, answer: 'c', correct: true }
                    ]
                },
                {
                    id: 'result-4',
                    quizId: 'quiz-1',
                    studentName: 'Bob Wilson',
                    studentEmail: 'bob.wilson@example.com',
                    score: 58,
                    timeTaken: '4:58',
                    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    answers: [
                        { questionId: 1, answer: 'a', correct: false },
                        { questionId: 2, answer: 'a', correct: true },
                        { questionId: 3, answer: 'b', correct: true }
                    ]
                }
            ];
            
            this.saveToStorage('quizResults', sampleResults);
        }
    }
};

// Make Utils available globally
window.Utils = Utils;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize sample data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    Utils.initializeSampleData();
});
