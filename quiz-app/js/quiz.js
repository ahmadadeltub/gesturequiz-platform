// Quiz Interface with Gesture Recognition
function loadQuizInterface(quizId) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="quiz-interface">
            <div class="quiz-header">
                <button class="btn secondary back-button" onclick="loadStudentDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
                <div class="quiz-info">
                    <h2 id="quizTitle">Loading Quiz...</h2>
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressBar"></div>
                        </div>
                        <span id="questionCounter">1 / 10</span>
                    </div>
                </div>
                <div class="quiz-timer">
                    <i class="fas fa-clock"></i>
                    <span id="timeRemaining">10:00</span>
                </div>
            </div>

            <div class="quiz-content">
                <div class="camera-section">
                    <div class="camera-container">
                        <video id="quizVideo" autoplay playsinline></video>
                        <canvas id="quizCanvas"></canvas>
                        <div class="gesture-overlay">
                            <div class="gesture-status">
                                <h3 id="detectedGesture">No gesture detected</h3>
                                <div class="confidence-indicator">
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" id="gestureConfidence"></div>
                                    </div>
                                    <span id="confidenceText">0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="camera-controls">
                        <button id="toggleCamera" class="btn secondary">
                            <i class="fas fa-video"></i> Camera On
                        </button>
                        <button id="toggleGestures" class="btn secondary">
                            <i class="fas fa-hand-paper"></i> Gestures On
                        </button>
                    </div>
                </div>

                <div class="question-section">
                    <div class="question-container">
                        <div class="question-number">
                            <span id="currentQuestionNum">1</span>
                        </div>
                        <div class="question-text">
                            <h3 id="questionText">Loading question...</h3>
                        </div>
                        <div class="question-options">
                            <div class="option-item" data-option="a">
                                <div class="option-gesture">👍</div>
                                <div class="option-content">
                                    <span class="option-label">A</span>
                                    <span class="option-text" id="optionA">Option A</span>
                                </div>
                                <div class="option-status"></div>
                            </div>
                            <div class="option-item" data-option="b">
                                <div class="option-gesture">✌️</div>
                                <div class="option-content">
                                    <span class="option-label">B</span>
                                    <span class="option-text" id="optionB">Option B</span>
                                </div>
                                <div class="option-status"></div>
                            </div>
                            <div class="option-item" data-option="c">
                                <div class="option-gesture">👌</div>
                                <div class="option-content">
                                    <span class="option-label">C</span>
                                    <span class="option-text" id="optionC">Option C</span>
                                </div>
                                <div class="option-status"></div>
                            </div>
                            <div class="option-item" data-option="d">
                                <div class="option-gesture">✋</div>
                                <div class="option-content">
                                    <span class="option-label">D</span>
                                    <span class="option-text" id="optionD">Option D</span>
                                </div>
                                <div class="option-status"></div>
                            </div>
                        </div>
                    </div>

                    <div class="question-actions">
                        <button id="prevQuestion" class="btn secondary" disabled>
                            <i class="fas fa-arrow-left"></i> Previous
                        </button>
                        <button id="nextQuestion" class="btn primary" disabled>
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button id="submitQuiz" class="btn success hidden">
                            <i class="fas fa-check"></i> Submit Quiz
                        </button>
                    </div>
                </div>
            </div>

            <div class="gesture-help">
                <button class="help-toggle" onclick="toggleGestureHelp()">
                    <i class="fas fa-question-circle"></i> Gesture Help
                </button>
                <div class="help-content" id="gestureHelpContent">
                    <h4>How to Answer:</h4>
                    <div class="help-gestures">
                        <div class="help-item">
                            <span class="gesture">👍</span>
                            <span class="description">Thumbs Up = Option A</span>
                        </div>
                        <div class="help-item">
                            <span class="gesture">✌️</span>
                            <span class="description">Peace Sign = Option B</span>
                        </div>
                        <div class="help-item">
                            <span class="gesture">👌</span>
                            <span class="description">OK Sign = Option C</span>
                        </div>
                        <div class="help-item">
                            <span class="gesture">✋</span>
                            <span class="description">Open Palm = Option D</span>
                        </div>
                        <div class="help-item">
                            <span class="gesture">✊</span>
                            <span class="description">Fist = Next Question</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize quiz
    initializeQuiz(quizId);
}

class QuizManager {
    constructor(quizId) {
        this.quizId = quizId;
        this.currentQuestion = 0;
        this.answers = {};
        this.score = 0;
        this.timeRemaining = 0;
        this.timer = null;
        this.gestureDetector = null;
        this.camera = null;
        this.hands = null;
        this.selectedAnswer = null;
        this.confirmationTimer = null;
        this.gestureDetectionEnabled = true;
        this.gestureDetectionEnabled = true;
        
        this.loadQuizData();
        this.initializeGestureRecognition();
        this.bindEvents();
    }

    async loadQuizData() {
        // Load quiz data from localStorage
        const quizzes = Utils.loadFromStorage('quizzes', []);
        this.quizData = quizzes.find(quiz => quiz.id === this.quizId);
        
        if (!this.quizData) {
            Utils.showNotification('Quiz not found', 'error');
            loadStudentDashboard();
            return;
        }
        
        this.timeRemaining = this.quizData.timeLimit * 60; // Convert minutes to seconds
        this.displayQuizInfo();
        this.displayCurrentQuestion();
        this.startTimer();
    }

    displayQuizInfo() {
        document.getElementById('quizTitle').textContent = this.quizData.title;
        document.getElementById('questionCounter').textContent = 
            `${this.currentQuestion + 1} / ${this.quizData.questions.length}`;
    }

    displayCurrentQuestion() {
        const question = this.quizData.questions[this.currentQuestion];
        
        document.getElementById('currentQuestionNum').textContent = this.currentQuestion + 1;
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('optionA').textContent = question.options.a;
        document.getElementById('optionB').textContent = question.options.b;
        document.getElementById('optionC').textContent = question.options.c;
        document.getElementById('optionD').textContent = question.options.d;

        // Update progress bar
        const progress = ((this.currentQuestion + 1) / this.quizData.questions.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;

        // Reset option styles
        document.querySelectorAll('.option-item').forEach(option => {
            option.classList.remove('selected', 'correct', 'wrong');
            option.querySelector('.option-status').innerHTML = '';
        });

        // Update navigation buttons
        document.getElementById('prevQuestion').disabled = this.currentQuestion === 0;
        document.getElementById('nextQuestion').disabled = true;
        
        if (this.currentQuestion === this.quizData.questions.length - 1) {
            document.getElementById('nextQuestion').classList.add('hidden');
            document.getElementById('submitQuiz').classList.remove('hidden');
        } else {
            document.getElementById('nextQuestion').classList.remove('hidden');
            document.getElementById('submitQuiz').classList.add('hidden');
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.submitQuiz();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timeRemaining').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    async initializeGestureRecognition() {
        try {
            // Copy gesture detection from original app
            this.gestureDetector = new GestureDetector();
            
            // Initialize MediaPipe
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults((results) => this.onGestureResults(results));
            
            // Start camera
            await this.startCamera();
            
        } catch (error) {
            console.error('Error initializing gesture recognition:', error);
        }
    }

    async startCamera() {
        try {
            const video = document.getElementById('quizVideo');
            const canvas = document.getElementById('quizCanvas');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            
            video.srcObject = stream;
            
            video.addEventListener('loadedmetadata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                this.camera = new Camera(video, {
                    onFrame: async () => {
                        if (this.hands) {
                            await this.hands.send({ image: video });
                        }
                    },
                    width: 640,
                    height: 480
                });
                
                this.camera.start();
            });
            
        } catch (error) {
            console.error('Error starting camera:', error);
        }
    }

    onGestureResults(results) {
        if (!this.gestureDetectionEnabled) return;
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const gestureResult = this.gestureDetector.detectGesture(landmarks);
            
            this.updateGestureDisplay(gestureResult);
            this.handleGestureSelection(gestureResult);
        } else {
            this.resetGestureDisplay();
        }
    }

    updateGestureDisplay(gestureResult) {
        const detectedGestureEl = document.getElementById('detectedGesture');
        const confidenceEl = document.getElementById('gestureConfidence');
        const confidenceTextEl = document.getElementById('confidenceText');
        
        if (gestureResult.gesture !== 'none') {
            const gestureInfo = this.gestureDetector.getGestureInfo(gestureResult.gesture);
            detectedGestureEl.textContent = `${gestureInfo.emoji} ${gestureInfo.name}`;
            
            const confidence = Math.round(gestureResult.confidence * 100);
            confidenceEl.style.width = `${confidence}%`;
            confidenceTextEl.textContent = `${confidence}%`;
        } else {
            detectedGestureEl.textContent = 'No gesture detected';
            confidenceEl.style.width = '0%';
            confidenceTextEl.textContent = '0%';
        }
    }

    resetGestureDisplay() {
        document.getElementById('detectedGesture').textContent = 'No gesture detected';
        document.getElementById('gestureConfidence').style.width = '0%';
        document.getElementById('confidenceText').textContent = '0%';
    }

    handleGestureSelection(gestureResult) {
        if (gestureResult.confidence < 0.8) return;
        
        const gestureToOption = {
            'thumbs_up': 'a',
            'peace_sign': 'b',
            'ok_sign': 'c',
            'open_palm': 'd',
            'fist': 'next'
        };
        
        const option = gestureToOption[gestureResult.gesture];
        
        if (option && option !== 'next') {
            this.selectAnswer(option);
        } else if (option === 'next' && this.selectedAnswer) {
            this.nextQuestion();
        }
    }

    selectAnswer(option) {
        // Clear previous selection
        document.querySelectorAll('.option-item').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select new option
        const optionElement = document.querySelector(`[data-option="${option}"]`);
        optionElement.classList.add('selected');
        
        this.selectedAnswer = option;
        this.answers[this.currentQuestion] = option;
        
        // Enable next button
        document.getElementById('nextQuestion').disabled = false;
        
        // Show confirmation
        optionElement.querySelector('.option-status').innerHTML = 
            '<i class="fas fa-check-circle"></i>';
    }

    nextQuestion() {
        if (this.currentQuestion < this.quizData.questions.length - 1) {
            this.currentQuestion++;
            this.selectedAnswer = null;
            this.displayQuizInfo();
            this.displayCurrentQuestion();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.selectedAnswer = this.answers[this.currentQuestion] || null;
            this.displayQuizInfo();
            this.displayCurrentQuestion();
            
            // Restore previous selection
            if (this.selectedAnswer) {
                this.selectAnswer(this.selectedAnswer);
            }
        }
    }

    submitQuiz() {
        clearInterval(this.timer);
        
        // Calculate score
        let correctAnswers = 0;
        this.quizData.questions.forEach((question, index) => {
            if (this.answers[index] === question.correct) {
                correctAnswers++;
            }
        });
        
        this.score = Math.round((correctAnswers / this.quizData.questions.length) * 100);
        
        // Save quiz result
        this.saveQuizResult();
        
        // Show results
        this.showResults();
    }

    saveQuizResult() {
        const user = window.authSystem.getCurrentUser();
        if (!user) return;
        
        const result = {
            id: Utils.generateId(),
            userId: user.id,
            userName: user.name,
            quizId: this.quizId,
            quizTitle: this.quizData.title,
            score: this.score,
            answers: this.answers,
            questions: this.quizData.questions.length,
            completedAt: new Date().toISOString(),
            timeSpent: (this.quizData.timeLimit * 60) - this.timeRemaining
        };
        
        const results = Utils.loadFromStorage('quizResults', []);
        results.push(result);
        Utils.saveToStorage('quizResults', results);
        
        Utils.showNotification('Quiz results saved!', 'success');
    }

    showResults() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="quiz-results">
                <div class="results-header">
                    <h2>Quiz Complete!</h2>
                    <div class="score-display">
                        <div class="score-circle">
                            <span class="score-number">${this.score}%</span>
                        </div>
                        <p class="score-text">
                            You scored ${this.score}% 
                            (${Object.keys(this.answers).length} out of ${this.quizData.questions.length} questions)
                        </p>
                    </div>
                </div>
                
                <div class="results-breakdown">
                    <h3>Question Breakdown</h3>
                    <div class="breakdown-list">
                        ${this.quizData.questions.map((question, index) => `
                            <div class="breakdown-item ${this.answers[index] === question.correct ? 'correct' : 'incorrect'}">
                                <div class="question-number">${index + 1}</div>
                                <div class="question-content">
                                    <p class="question-text">${question.text}</p>
                                    <div class="answer-info">
                                        <span class="your-answer">Your answer: ${question.options[this.answers[index]] || 'Not answered'}</span>
                                        <span class="correct-answer">Correct answer: ${question.options[question.correct]}</span>
                                    </div>
                                </div>
                                <div class="result-icon">
                                    ${this.answers[index] === question.correct ? 
                                        '<i class="fas fa-check-circle"></i>' : 
                                        '<i class="fas fa-times-circle"></i>'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn primary" onclick="loadStudentDashboard()">
                        <i class="fas fa-home"></i> Back to Dashboard
                    </button>
                    <button class="btn secondary" onclick="retakeQuiz('${this.quizId}')">
                        <i class="fas fa-redo"></i> Retake Quiz
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('nextQuestion').addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevQuestion').addEventListener('click', () => this.previousQuestion());
        document.getElementById('submitQuiz').addEventListener('click', () => this.submitQuiz());
        
        // Camera control buttons
        document.getElementById('toggleCamera').addEventListener('click', () => this.toggleCamera());
        document.getElementById('toggleGestures').addEventListener('click', () => this.toggleGestures());
    }
    
    toggleCamera() {
        const button = document.getElementById('toggleCamera');
        const video = document.getElementById('quizVideo');
        
        if (this.camera && this.camera.h) {
            // Camera is running, stop it
            this.camera.stop();
            button.innerHTML = '<i class="fas fa-video-slash"></i> Camera Off';
            video.style.display = 'none';
        } else {
            // Camera is stopped, start it
            this.startCamera();
            button.innerHTML = '<i class="fas fa-video"></i> Camera On';
            video.style.display = 'block';
        }
    }
    
    toggleGestures() {
        const button = document.getElementById('toggleGestures');
        
        if (this.gestureDetectionEnabled) {
            this.gestureDetectionEnabled = false;
            button.innerHTML = '<i class="fas fa-hand-paper-slash"></i> Gestures Off';
            this.resetGestureDisplay();
        } else {
            this.gestureDetectionEnabled = true;
            button.innerHTML = '<i class="fas fa-hand-paper"></i> Gestures On';
        }
    }
}

function initializeQuiz(quizId) {
    window.currentQuiz = new QuizManager(quizId);
}

function toggleGestureHelp() {
    const helpContent = document.getElementById('gestureHelpContent');
    helpContent.classList.toggle('show');
}

function retakeQuiz(quizId) {
    loadQuizInterface(quizId);
}

// Make functions global
window.loadQuizInterface = loadQuizInterface;
window.initializeQuiz = initializeQuiz;
window.toggleGestureHelp = toggleGestureHelp;
window.retakeQuiz = retakeQuiz;
