// Teacher Dashboard
function loadTeacherDashboard() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="dashboard-header">
            <h1 style="color: white;">Teacher Dashboard</h1>
            <p style="color: white;">Manage your quizzes and track student progress</p>
        </div>

        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-number" id="totalQuizzes">-</div>
                <div class="stat-label">Total Quizzes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalStudents">23</div>
                <div class="stat-label">Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="completedQuizzes">-</div>
                <div class="stat-label">Completed Quizzes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="averageScore">-</div>
                <div class="stat-label">Average Score</div>
            </div>
        </div>

        <div class="dashboard-actions">
            <button class="btn primary" onclick="showCreateQuiz()">
                <i class="fas fa-plus"></i> Create New Quiz
            </button>
            <button class="btn secondary" onclick="showQuizList()">
                <i class="fas fa-list"></i> Manage Quizzes
            </button>
            <button class="btn secondary" onclick="showStudentResults()">
                <i class="fas fa-chart-bar"></i> View Results
            </button>
        </div>

        <div class="recent-activity">
            <h3>Recent Activity</h3>
            <div class="activity-list">
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-user-graduate"></i></div>
                    <div class="activity-content">
                        <p><strong>John Doe</strong> completed "Math Basics Quiz"</p>
                        <small>2 hours ago - Score: 90%</small>
                    </div>
                </div>
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-user-graduate"></i></div>
                    <div class="activity-content">
                        <p><strong>Jane Smith</strong> completed "Science Quiz"</p>
                        <small>4 hours ago - Score: 85%</small>
                    </div>
                </div>
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-plus"></i></div>
                    <div class="activity-content">
                        <p>Created new quiz: "History Quiz"</p>
                        <small>1 day ago</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load real statistics
    loadTeacherStats();
}

function loadTeacherStats() {
    const quizzes = Utils.loadFromStorage('quizzes', []);
    const results = Utils.loadFromStorage('quizResults', []);
    
    // Update quiz count
    document.getElementById('totalQuizzes').textContent = quizzes.length;
    
    // Update completed quizzes count
    document.getElementById('completedQuizzes').textContent = results.length;
    
    // Calculate average score
    if (results.length > 0) {
        const totalScore = results.reduce((sum, result) => sum + result.score, 0);
        const averageScore = Math.round(totalScore / results.length);
        document.getElementById('averageScore').textContent = `${averageScore}%`;
    } else {
        document.getElementById('averageScore').textContent = '0%';
    }
}

// Student Dashboard
function loadStudentDashboard() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="dashboard-header">
            <h1 style="color: white;">Student Dashboard</h1>
            <p style="color: white;">Take quizzes using hand gestures and track your progress</p>
        </div>

        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-number" id="quizzesCompleted">-</div>
                <div class="stat-label">Quizzes Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="studentAverageScore">-</div>
                <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="currentStreak">-</div>
                <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="gesturesUsed">-</div>
                <div class="stat-label">Gestures Used</div>
            </div>
        </div>

        <div class="available-quizzes">
            <h3>Available Quizzes</h3>
            <div class="quiz-grid">
                <!-- Quizzes will be loaded dynamically -->
            </div>
        </div>

        <div class="gesture-guide">
            <h3>Gesture Guide</h3>
            <div class="gesture-instructions">
                <div class="gesture-item">
                    <span class="gesture-emoji">👍</span>
                    <div class="gesture-info">
                        <strong>Thumbs Up</strong>
                        <p>Select option A</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <span class="gesture-emoji">✌️</span>
                    <div class="gesture-info">
                        <strong>Peace Sign</strong>
                        <p>Select option B</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <span class="gesture-emoji">👌</span>
                    <div class="gesture-info">
                        <strong>OK Sign</strong>
                        <p>Select option C</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <span class="gesture-emoji">✋</span>
                    <div class="gesture-info">
                        <strong>Open Palm</strong>
                        <p>Select option D</p>
                    </div>
                </div>
                <div class="gesture-item">
                    <span class="gesture-emoji">✊</span>
                    <div class="gesture-info">
                        <strong>Fist</strong>
                        <p>Next question</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load available quizzes after rendering
    setTimeout(() => {
        loadAvailableQuizzes();
        loadStudentStats();
    }, 100);
}

function loadStudentStats() {
    const user = window.authSystem.getCurrentUser();
    if (!user) return;
    
    const results = Utils.loadFromStorage('quizResults', []);
    const userResults = results.filter(result => result.userId === user.id);
    
    // Update completed quizzes count
    document.getElementById('quizzesCompleted').textContent = userResults.length;
    
    // Calculate average score
    if (userResults.length > 0) {
        const totalScore = userResults.reduce((sum, result) => sum + result.score, 0);
        const averageScore = Math.round(totalScore / userResults.length);
        document.getElementById('studentAverageScore').textContent = `${averageScore}%`;
        
        // Calculate streak (simplified - consecutive passing quizzes)
        let streak = 0;
        for (let i = userResults.length - 1; i >= 0; i--) {
            if (userResults[i].score >= 70) {
                streak++;
            } else {
                break;
            }
        }
        document.getElementById('currentStreak').textContent = streak;
    } else {
        document.getElementById('studentAverageScore').textContent = '0%';
        document.getElementById('currentStreak').textContent = '0';
    }
    
    // Estimate gestures used (simplified calculation)
    const gesturesUsed = userResults.reduce((sum, result) => sum + (result.questions || 0), 0);
    document.getElementById('gesturesUsed').textContent = gesturesUsed;
}

// Create Quiz Form
function showCreateQuiz(quizData = null) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="create-quiz-container">
            <div class="quiz-header">
                <button class="btn secondary back-button" onclick="loadTeacherDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
                <h2>${quizData ? 'Edit' : 'Create New'} Quiz</h2>
            </div>

            <div class="quiz-form-container">
                <form id="createQuizForm">
                    <div class="form-group">
                        <label for="quizTitle">Quiz Title</label>
                        <input type="text" id="quizTitle" required placeholder="Enter quiz title" value="${quizData ? quizData.title : ''}">
                    </div>

                    <div class="form-group">
                        <label for="quizDescription">Description</label>
                        <textarea id="quizDescription" placeholder="Enter quiz description">${quizData ? quizData.description : ''}</textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="quizCategory">Category</label>
                            <select id="quizCategory" required>
                                <option value="">Select category</option>
                                <option value="math" ${quizData && quizData.category === 'math' ? 'selected' : ''}>Math</option>
                                <option value="science" ${quizData && quizData.category === 'science' ? 'selected' : ''}>Science</option>
                                <option value="history" ${quizData && quizData.category === 'history' ? 'selected' : ''}>History</option>
                                <option value="english" ${quizData && quizData.category === 'english' ? 'selected' : ''}>English</option>
                                <option value="geography" ${quizData && quizData.category === 'geography' ? 'selected' : ''}>Geography</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="quizDifficulty">Difficulty</label>
                            <select id="quizDifficulty" required>
                                <option value="">Select difficulty</option>
                                <option value="easy" ${quizData && quizData.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                                <option value="medium" ${quizData && quizData.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="hard" ${quizData && quizData.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="timeLimit">Time Limit (minutes)</label>
                            <input type="number" id="timeLimit" min="1" max="60" value="${quizData ? quizData.timeLimit : 10}">
                        </div>
                        <div class="form-group">
                            <label for="passingScore">Passing Score (%)</label>
                            <input type="number" id="passingScore" min="0" max="100" value="${quizData ? quizData.passingScore : 70}">
                        </div>
                    </div>

                    <div class="questions-section">
                        <h3>Questions</h3>
                        <div id="questionsContainer">
                            ${quizData ? quizData.questions.map((q, index) => `
                                <div class="question-item">
                                    <div class="question-header">
                                        <h4>Question ${index + 1}</h4>
                                        <button type="button" class="btn-remove" onclick="removeQuestion(this)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div class="form-group">
                                        <label>Question Text</label>
                                        <textarea name="question_${index + 1}" required placeholder="Enter your question">${q.text}</textarea>
                                    </div>
                                    <div class="options-container">
                                        <div class="form-group">
                                            <label>Option A (👍 Thumbs Up)</label>
                                            <input type="text" name="option_a_${index + 1}" required placeholder="Enter option A" value="${q.options.a}">
                                        </div>
                                        <div class="form-group">
                                            <label>Option B (✌️ Peace Sign)</label>
                                            <input type="text" name="option_b_${index + 1}" required placeholder="Enter option B" value="${q.options.b}">
                                        </div>
                                        <div class="form-group">
                                            <label>Option C (👌 OK Sign)</label>
                                            <input type="text" name="option_c_${index + 1}" required placeholder="Enter option C" value="${q.options.c}">
                                        </div>
                                        <div class="form-group">
                                            <label>Option D (✋ Open Palm)</label>
                                            <input type="text" name="option_d_${index + 1}" required placeholder="Enter option D" value="${q.options.d}">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Correct Answer</label>
                                        <select name="correct_${index + 1}" required>
                                            <option value="">Select correct answer</option>
                                            <option value="a" ${q.correct === 'a' ? 'selected' : ''}>A - Thumbs Up</option>
                                            <option value="b" ${q.correct === 'b' ? 'selected' : ''}>B - Peace Sign</option>
                                            <option value="c" ${q.correct === 'c' ? 'selected' : ''}>C - OK Sign</option>
                                            <option value="d" ${q.correct === 'd' ? 'selected' : ''}>D - Open Palm</option>
                                        </select>
                                    </div>
                                </div>
                            `).join('') : ''}
                        </div>
                        <button type="button" class="btn secondary" onclick="addQuestion()">
                            <i class="fas fa-plus"></i> Add Question
                        </button>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn primary">
                            <i class="fas fa-save"></i> ${quizData ? 'Update' : 'Create'} Quiz
                        </button>
                        <button type="button" class="btn secondary" onclick="previewQuiz()">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Reset question counter and add questions
    questionCount = 0;
    
    // Add first question by default or load existing questions
    if (!quizData) {
        addQuestion();
    } else {
        // Load existing questions for editing
        quizData.questions.forEach((question, index) => {
            addQuestion(question, index + 1);
        });
    }

    // Bind form submission
    document.getElementById('createQuizForm').addEventListener('submit', (e) => handleCreateQuiz(e));
}

let questionCount = 0;

function addQuestion(existingQuestion = null, questionNumber = null) {
    if (questionNumber) {
        questionCount = Math.max(questionCount, questionNumber);
    } else {
        questionCount++;
    }
    
    const container = document.getElementById('questionsContainer');
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.innerHTML = `
        <div class="question-header">
            <h4>Question ${questionCount}</h4>
            <button type="button" class="btn-remove" onclick="removeQuestion(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Question Text</label>
            <textarea name="question_${questionCount}" required placeholder="Enter your question">${existingQuestion ? existingQuestion.text : ''}</textarea>
        </div>
        <div class="options-container">
            <div class="form-group">
                <label>Option A (👍 Thumbs Up)</label>
                <input type="text" name="option_a_${questionCount}" required placeholder="Enter option A" value="${existingQuestion ? existingQuestion.options.a : ''}">
            </div>
            <div class="form-group">
                <label>Option B (✌️ Peace Sign)</label>
                <input type="text" name="option_b_${questionCount}" required placeholder="Enter option B" value="${existingQuestion ? existingQuestion.options.b : ''}">
            </div>
            <div class="form-group">
                <label>Option C (👌 OK Sign)</label>
                <input type="text" name="option_c_${questionCount}" required placeholder="Enter option C" value="${existingQuestion ? existingQuestion.options.c : ''}">
            </div>
            <div class="form-group">
                <label>Option D (✋ Open Palm)</label>
                <input type="text" name="option_d_${questionCount}" required placeholder="Enter option D" value="${existingQuestion ? existingQuestion.options.d : ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Correct Answer</label>
            <select name="correct_${questionCount}" required>
                <option value="">Select correct answer</option>
                <option value="a" ${existingQuestion && existingQuestion.correct === 'a' ? 'selected' : ''}>A - Thumbs Up</option>
                <option value="b" ${existingQuestion && existingQuestion.correct === 'b' ? 'selected' : ''}>B - Peace Sign</option>
                <option value="c" ${existingQuestion && existingQuestion.correct === 'c' ? 'selected' : ''}>C - OK Sign</option>
                <option value="d" ${existingQuestion && existingQuestion.correct === 'd' ? 'selected' : ''}>D - Open Palm</option>
            </select>
        </div>
    `;
    
    container.appendChild(questionDiv);
}

function removeQuestion(button) {
    const questionItem = button.closest('.question-item');
    if (document.querySelectorAll('.question-item').length > 1) {
        questionItem.remove();
        Utils.showNotification('Question removed', 'success');
    } else {
        Utils.showNotification('At least one question is required', 'warning');
    }
}

// Preview Quiz Function
function previewQuiz() {
    Utils.showNotification('Quiz preview feature coming soon!', 'info');
}

// Professional Handle Create/Edit Quiz Function
function handleCreateQuiz(e) {
    e.preventDefault();
    
    try {
        const isEdit = window.editingQuiz !== undefined && window.isEditMode === true;
        console.log('Handling quiz submission - Edit mode:', isEdit);
        
        const quizData = {
            title: document.getElementById('quizTitle').value.trim(),
            description: document.getElementById('quizDescription').value.trim(),
            category: document.getElementById('quizCategory').value,
            difficulty: document.getElementById('quizDifficulty').value,
            timeLimit: parseInt(document.getElementById('timeLimit').value),
            passingScore: parseInt(document.getElementById('passingScore').value),
            questions: []
        };

        // Validate form
        if (!quizData.title || !quizData.category || !quizData.difficulty) {
            Utils.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (quizData.timeLimit < 1 || quizData.timeLimit > 120) {
            Utils.showNotification('Time limit must be between 1 and 120 minutes', 'error');
            return;
        }

        if (quizData.passingScore < 0 || quizData.passingScore > 100) {
            Utils.showNotification('Passing score must be between 0 and 100', 'error');
            return;
        }

        // Collect questions with improved validation
        const questionItems = document.querySelectorAll('.question-item');
        let questionNumber = 1;
        
        questionItems.forEach((item) => {
            const questionTextArea = item.querySelector(`textarea[name*="question_"]`);
            const optionAInput = item.querySelector(`input[name*="option_a_"]`);
            const optionBInput = item.querySelector(`input[name*="option_b_"]`);
            const optionCInput = item.querySelector(`input[name*="option_c_"]`);
            const optionDInput = item.querySelector(`input[name*="option_d_"]`);
            const correctSelect = item.querySelector(`select[name*="correct_"]`);
            
            if (questionTextArea && optionAInput && optionBInput && optionCInput && optionDInput && correctSelect) {
                const question = {
                    id: questionNumber,
                    text: questionTextArea.value.trim(),
                    options: {
                        a: optionAInput.value.trim(),
                        b: optionBInput.value.trim(),
                        c: optionCInput.value.trim(),
                        d: optionDInput.value.trim()
                    },
                    correct: correctSelect.value
                };
                
                // Validate question completeness
                if (question.text && question.options.a && question.options.b && 
                    question.options.c && question.options.d && question.correct) {
                    quizData.questions.push(question);
                    questionNumber++;
                }
            }
        });

        // Validate questions
        if (quizData.questions.length === 0) {
            Utils.showNotification('Please add at least one complete question', 'error');
            return;
        }

        // Save quiz
        const quizzes = Utils.loadFromStorage('quizzes', []);
        const currentUser = window.authSystem.getCurrentUser();
        
        if (isEdit) {
            // Update existing quiz
            quizData.id = window.editingQuiz.id;
            quizData.createdBy = window.editingQuiz.createdBy;
            quizData.createdAt = window.editingQuiz.createdAt;
            quizData.updatedAt = new Date().toISOString();
            quizData.updatedBy = currentUser ? currentUser.id : 'unknown';
            
            const quizIndex = quizzes.findIndex(q => q.id === quizData.id);
            if (quizIndex !== -1) {
                quizzes[quizIndex] = quizData;
                console.log('Updated quiz:', quizData);
                Utils.showNotification(`Quiz "${quizData.title}" updated successfully!`, 'success');
            } else {
                throw new Error('Quiz not found for update');
            }
            
            // Clear edit mode
            delete window.editingQuiz;
            delete window.isEditMode;
        } else {
            // Create new quiz
            quizData.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            quizData.createdBy = currentUser ? currentUser.id : 'unknown';
            quizData.createdAt = new Date().toISOString();
            quizData.version = 1;
            
            quizzes.push(quizData);
            console.log('Created new quiz:', quizData);
            Utils.showNotification(`Quiz "${quizData.title}" created successfully!`, 'success');
        }
        
        // Save to storage
        Utils.saveToStorage('quizzes', quizzes);
        
        // Reset question counter
        questionCount = 0;
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
            loadTeacherDashboard();
        }, 1500);
        
    } catch (error) {
        console.error('Error in handleCreateQuiz:', error);
        Utils.showNotification('Error saving quiz. Please try again.', 'error');
    }
}

// Start Quiz Function
function startQuiz(quizId) {
    // Show camera permission dialog first
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Camera Permission Required</h3>
            <p>This quiz uses hand gesture recognition. Please allow camera access to continue.</p>
            <div class="modal-actions">
                <button class="btn primary" onclick="initializeQuizCamera('${quizId}')">
                    <i class="fas fa-camera"></i> Enable Camera
                </button>
                <button class="btn secondary" onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function initializeQuizCamera(quizId) {
    closeModal();
    loadQuizInterface(quizId);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Quiz List Function
function showQuizList() {
    const contentArea = document.getElementById('content-area');
    const quizzes = Utils.loadFromStorage('quizzes', []);
    
    let quizListHTML = '';
    if (quizzes.length === 0) {
        quizListHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <h3>No quizzes created yet</h3>
                <p>Start building your quiz collection to engage your students</p>
                <button class="btn primary large" onclick="showCreateQuiz()">
                    <i class="fas fa-plus"></i> Create Your First Quiz
                </button>
            </div>
        `;
    } else {
        quizListHTML = quizzes.map(quiz => `
            <div class="quiz-card-modern">
                <div class="quiz-card-header">
                    <div class="quiz-category-badge ${quiz.category.toLowerCase()}">${quiz.category}</div>
                    <div class="quiz-difficulty-badge ${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</div>
                </div>
                <div class="quiz-card-body">
                    <h3>${quiz.title}</h3>
                    <p>${quiz.description || 'No description provided'}</p>
                    <div class="quiz-stats-grid">
                        <div class="stat-item">
                            <i class="fas fa-question-circle"></i>
                            <span>${quiz.questions.length} Questions</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <span>${quiz.timeLimit} Minutes</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-target"></i>
                            <span>${quiz.passingScore}% to Pass</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Created ${new Date(quiz.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="quiz-card-actions">
                    <button class="btn-modern edit" onclick="handleEditQuiz('${quiz.id}')" title="Edit Quiz">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button class="btn-modern view" onclick="handleViewQuizResults('${quiz.id}')" title="View Results">
                        <i class="fas fa-chart-bar"></i>
                        <span>Results</span>
                    </button>
                    <button class="btn-modern delete" onclick="handleDeleteQuiz('${quiz.id}')" title="Delete Quiz">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    contentArea.innerHTML = `
        <div class="quiz-list-container">
            <div class="page-header">
                <button class="btn secondary back-button" onclick="loadTeacherDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
                <div class="header-content">
                    <h2>Manage Quizzes</h2>
                    <p>Create, edit, and organize your quiz collection</p>
                </div>
                <button class="btn primary" onclick="showCreateQuiz()">
                    <i class="fas fa-plus"></i> Create New Quiz
                </button>
            </div>
            
            <div class="quiz-grid-modern">
                ${quizListHTML}
            </div>
        </div>
    `;
}

// Show Student Results Function (All Results Page)
function showStudentResults() {
    const contentArea = document.getElementById('content-area');
    const results = Utils.loadFromStorage('quizResults', []);
    const quizzes = Utils.loadFromStorage('quizzes', []);
    
    // Calculate overall statistics
    const totalResults = results.length;
    const averageScore = totalResults > 0 ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / totalResults) : 0;
    const highestScore = totalResults > 0 ? Math.max(...results.map(r => r.score)) : 0;
    const passedCount = results.filter(r => {
        const quiz = quizzes.find(q => q.id === r.quizId);
        return quiz && r.score >= quiz.passingScore;
    }).length;
    const passRate = totalResults > 0 ? Math.round((passedCount / totalResults) * 100) : 0;
    
    let resultsHTML = '';
    if (results.length === 0) {
        resultsHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>No Results Yet</h3>
                <p>No students have completed any quizzes yet.</p>
                <button class="btn primary" onclick="loadTeacherDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
        `;
    } else {
        resultsHTML = `
            <div class="results-stats-grid">
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${totalResults}</div>
                        <div class="stat-label">Total Results</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${averageScore}%</div>
                        <div class="stat-label">Average Score</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${highestScore}%</div>
                        <div class="stat-label">Highest Score</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${passRate}%</div>
                        <div class="stat-label">Pass Rate</div>
                    </div>
                </div>
            </div>
            
            <div class="results-table-modern">
                <div class="table-header">
                    <h3>All Student Results</h3>
                    <div class="table-actions">
                        <button class="btn secondary btn-small" onclick="handleExportAllResults()">
                            <i class="fas fa-download"></i> Export All
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Quiz</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Time Taken</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(result => {
                                const quiz = quizzes.find(q => q.id === result.quizId);
                                const quizTitle = quiz ? quiz.title : 'Unknown Quiz';
                                const passingScore = quiz ? quiz.passingScore : 70;
                                const passed = result.score >= passingScore;
                                
                                return `
                                    <tr>
                                        <td>
                                            <div class="student-info">
                                                <div class="student-avatar">
                                                    <i class="fas fa-user-graduate"></i>
                                                </div>
                                                <div class="student-details">
                                                    <strong>${result.studentName || 'Anonymous Student'}</strong>
                                                    <small>${result.studentEmail || 'No email'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="quiz-info">
                                                <strong>${quizTitle}</strong>
                                                <small>${quiz ? quiz.category : 'Unknown'}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="score-display">
                                                <span class="score-number">${result.score}%</span>
                                                <div class="score-bar">
                                                    <div class="score-fill" style="width: ${result.score}%"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="grade-badge ${passed ? 'passed' : 'failed'}">
                                                ${passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="time-taken">
                                                <i class="fas fa-clock"></i>
                                                ${result.timeTaken || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="date-taken">
                                                ${new Date(result.completedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn-small secondary" onclick="viewDetailedResult('${result.id}')" title="View Details">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn-small primary" onclick="viewQuizResults('${result.quizId}')" title="View Quiz Results">
                                                    <i class="fas fa-chart-bar"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    contentArea.innerHTML = `
        <div class="student-results-container">
            <div class="page-header-modern">
                <button class="btn secondary back-button" onclick="loadTeacherDashboard()">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
                <div class="header-content">
                    <h2>All Student Results</h2>
                    <p>View and analyze all quiz results across your courses</p>
                </div>
            </div>
            
            ${resultsHTML}
        </div>
    `;
}

// Add the missing viewQuizResults function
function viewQuizResults(quizId) {
    const quizzes = Utils.loadFromStorage('quizzes', []);
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (!quiz) {
        Utils.showNotification('Quiz not found', 'error');
        return;
    }
    
    showQuizResults(quiz);
}

// Modern Quiz Results Function
function showQuizResults(quiz) {
    const contentArea = document.getElementById('content-area');
    const results = Utils.loadFromStorage('quizResults', []);
    const quizResults = results.filter(result => result.quizId === quiz.id);
    
    // Calculate statistics
    const totalAttempts = quizResults.length;
    const averageScore = totalAttempts > 0 ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / totalAttempts) : 0;
    const highestScore = totalAttempts > 0 ? Math.max(...quizResults.map(r => r.score)) : 0;
    const passedCount = quizResults.filter(r => r.score >= quiz.passingScore).length;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
    
    let resultsHTML = '';
    if (quizResults.length === 0) {
        resultsHTML = `
            <div class="empty-state-modern">
                <div class="empty-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>No Results Yet</h3>
                <p>This quiz hasn't been taken by any students yet.</p>
                <button class="btn primary" onclick="showQuizList()">
                    <i class="fas fa-arrow-left"></i> Back to Quiz List
                </button>
            </div>
        `;
    } else {
        resultsHTML = `
            <div class="results-stats-grid">
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${totalAttempts}</div>
                        <div class="stat-label">Total Attempts</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${averageScore}%</div>
                        <div class="stat-label">Average Score</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${highestScore}%</div>
                        <div class="stat-label">Highest Score</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-number">${passRate}%</div>
                        <div class="stat-label">Pass Rate</div>
                    </div>
                </div>
            </div>
            
            <div class="results-table-modern">
                <div class="table-header">
                    <h3>Recent Results</h3>
                    <div class="table-actions">
                        <button class="btn secondary btn-small" onclick="handleExportResults('${quiz.id}')">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Time Taken</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quizResults.map(result => `
                                <tr>
                                    <td>
                                        <div class="student-info">
                                            <div class="student-avatar">
                                                <i class="fas fa-user-graduate"></i>
                                            </div>
                                            <div class="student-details">
                                                <strong>${result.studentName || 'Anonymous Student'}</strong>
                                                <small>${result.studentEmail || 'No email'}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="score-display">
                                            <span class="score-number">${result.score}%</span>
                                            <div class="score-bar">
                                                <div class="score-fill" style="width: ${result.score}%"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="grade-badge ${result.score >= quiz.passingScore ? 'passed' : 'failed'}">
                                            ${result.score >= quiz.passingScore ? 'Passed' : 'Failed'}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="time-taken">
                                            <i class="fas fa-clock"></i>
                                            ${result.timeTaken || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="date-taken">
                                            ${new Date(result.completedAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-small secondary" onclick="viewDetailedResult('${result.id}')" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    contentArea.innerHTML = `
        <div class="quiz-results-container">
            <div class="page-header-modern">
                <button class="btn secondary back-button" onclick="showQuizList()">
                    <i class="fas fa-arrow-left"></i> Back to Quiz List
                </button>
                <div class="header-content">
                    <h2>Quiz Results</h2>
                    <p>Results for "${quiz.title}"</p>
                </div>
                <div class="header-actions">
                    <button class="btn primary" onclick="editQuiz('${quiz.id}')">
                        <i class="fas fa-edit"></i> Edit Quiz
                    </button>
                </div>
            </div>
            
            <div class="quiz-info-card">
                <div class="quiz-info-header">
                    <h3>${quiz.title}</h3>
                    <div class="quiz-badges">
                        <span class="quiz-category-badge ${quiz.category.toLowerCase()}">${quiz.category}</span>
                        <span class="quiz-difficulty-badge ${quiz.difficulty.toLowerCase()}">${quiz.difficulty}</span>
                    </div>
                </div>
                <div class="quiz-info-details">
                    <div class="detail-item">
                        <i class="fas fa-question-circle"></i>
                        <span>${quiz.questions.length} questions</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${quiz.timeLimit} minutes</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-target"></i>
                        <span>${quiz.passingScore}% to pass</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Created ${new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            
            ${resultsHTML}
        </div>
    `;
}

// View Detailed Result Function
function viewDetailedResult(resultId) {
    const results = Utils.loadFromStorage('quizResults', []);
    const result = results.find(r => r.id === resultId);
    
    if (!result) {
        Utils.showNotification('Result not found', 'error');
        return;
    }
    
    const quizzes = Utils.loadFromStorage('quizzes', []);
    const quiz = quizzes.find(q => q.id === result.quizId);
    
    if (!quiz) {
        Utils.showNotification('Quiz not found', 'error');
        return;
    }
    
    showDetailedResultPage(result, quiz);
}

// Show Detailed Result Page
function showDetailedResultPage(result, quiz) {
    const contentArea = document.getElementById('content-area');
    
    // Calculate detailed statistics
    const correctAnswers = result.answers ? result.answers.filter(a => a.correct).length : 0;
    const totalQuestions = quiz.questions.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const timePerQuestion = result.timeTaken ? calculateTimePerQuestion(result.timeTaken, totalQuestions) : 'N/A';
    
    // Generate question-by-question breakdown
    const questionBreakdown = quiz.questions.map((question, index) => {
        const userAnswer = result.answers ? result.answers.find(a => a.questionId === index + 1) : null;
        const isCorrect = userAnswer ? userAnswer.correct : false;
        const selectedOption = userAnswer ? userAnswer.answer : 'No answer';
        
        return {
            question: question,
            userAnswer: selectedOption,
            correctAnswer: question.correct,
            isCorrect: isCorrect,
            questionNumber: index + 1
        };
    });
    
    contentArea.innerHTML = `
        <div class="detailed-result-container">
            <div class="page-header-modern">
                <button class="btn secondary back-button" onclick="showQuizResults(${JSON.stringify(quiz).replace(/"/g, '&quot;')})">
                    <i class="fas fa-arrow-left"></i> Back to Results
                </button>
                <div class="header-content">
                    <h2>Detailed Result</h2>
                    <p>Complete breakdown for ${result.studentName || 'Anonymous Student'}</p>
                </div>
            </div>
            
            <div class="result-summary-card">
                <div class="student-header">
                    <div class="student-avatar-large">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="student-info-large">
                        <h3>${result.studentName || 'Anonymous Student'}</h3>
                        <p>${result.studentEmail || 'No email provided'}</p>
                        <div class="completion-info">
                            <span><i class="fas fa-calendar-alt"></i> ${new Date(result.completedAt).toLocaleDateString()}</span>
                            <span><i class="fas fa-clock"></i> ${result.timeTaken || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="score-display-large">
                        <div class="score-circle">
                            <div class="score-number">${result.score}%</div>
                            <div class="score-label">Final Score</div>
                        </div>
                        <div class="grade-badge-large ${result.score >= quiz.passingScore ? 'passed' : 'failed'}">
                            ${result.score >= quiz.passingScore ? 'PASSED' : 'FAILED'}
                        </div>
                    </div>
                </div>
                
                <div class="detailed-stats-grid">
                    <div class="stat-item-detailed">
                        <div class="stat-icon-small">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${correctAnswers}/${totalQuestions}</div>
                            <div class="stat-label">Correct Answers</div>
                        </div>
                    </div>
                    <div class="stat-item-detailed">
                        <div class="stat-icon-small">
                            <i class="fas fa-percentage"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${accuracy}%</div>
                            <div class="stat-label">Accuracy</div>
                        </div>
                    </div>
                    <div class="stat-item-detailed">
                        <div class="stat-icon-small">
                            <i class="fas fa-stopwatch"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${timePerQuestion}</div>
                            <div class="stat-label">Time/Question</div>
                        </div>
                    </div>
                    <div class="stat-item-detailed">
                        <div class="stat-icon-small">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${quiz.passingScore}%</div>
                            <div class="stat-label">Required</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="question-breakdown">
                <div class="breakdown-header">
                    <h3>Question-by-Question Breakdown</h3>
                    <div class="breakdown-legend">
                        <span class="legend-item correct"><i class="fas fa-check"></i> Correct</span>
                        <span class="legend-item incorrect"><i class="fas fa-times"></i> Incorrect</span>
                        <span class="legend-item unanswered"><i class="fas fa-minus"></i> Unanswered</span>
                    </div>
                </div>
                
                <div class="questions-list">
                    ${questionBreakdown.map(item => `
                        <div class="question-result-card ${item.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="question-header">
                                <div class="question-number">
                                    <span class="q-number">${item.questionNumber}</span>
                                    <div class="result-indicator ${item.isCorrect ? 'correct' : 'incorrect'}">
                                        <i class="fas fa-${item.isCorrect ? 'check' : 'times'}"></i>
                                    </div>
                                </div>
                                <div class="question-text">
                                    <p>${item.question.text}</p>
                                </div>
                            </div>
                            
                            <div class="answer-options">
                                ${Object.entries(item.question.options).map(([key, value]) => `
                                    <div class="option ${key === item.userAnswer ? 'selected' : ''} ${key === item.correctAnswer ? 'correct-answer' : ''}">
                                        <div class="option-label">
                                            <span class="option-letter">${key.toUpperCase()}</span>
                                            <span class="gesture-icon">${getGestureIcon(key)}</span>
                                        </div>
                                        <div class="option-text">${value}</div>
                                        <div class="option-indicators">
                                            ${key === item.userAnswer ? '<i class="fas fa-hand-point-right" title="Your answer"></i>' : ''}
                                            ${key === item.correctAnswer ? '<i class="fas fa-check-circle" title="Correct answer"></i>' : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="result-actions">
                <button class="btn primary" onclick="showQuizResults(${JSON.stringify(quiz).replace(/"/g, '&quot;')})">
                    <i class="fas fa-arrow-left"></i> Back to All Results
                </button>
                <button class="btn secondary" onclick="printDetailedResult()">
                    <i class="fas fa-print"></i> Print Result
                </button>
            </div>
        </div>
    `;
}

// Helper function to calculate time per question
function calculateTimePerQuestion(timeTaken, totalQuestions) {
    if (!timeTaken || totalQuestions === 0) return 'N/A';
    
    // Parse time format (e.g., "4:32" -> 4.53 minutes)
    const timeParts = timeTaken.split(':');
    const minutes = parseInt(timeParts[0]) || 0;
    const seconds = parseInt(timeParts[1]) || 0;
    const totalMinutes = minutes + (seconds / 60);
    const timePerQuestion = totalMinutes / totalQuestions;
    
    if (timePerQuestion < 1) {
        return `${Math.round(timePerQuestion * 60)}s`;
    } else {
        return `${Math.round(timePerQuestion * 10) / 10}m`;
    }
}

// Helper function to get gesture icon for each option
function getGestureIcon(option) {
    const icons = {
        'a': '👍',
        'b': '✌️',
        'c': '👌',
        'd': '✋'
    };
    return icons[option] || '?';
}

// Professional wrapper functions for better error handling
function handleEditQuiz(quizId) {
    console.log('=== EDIT QUIZ DEBUG ===');
    console.log('Edit quiz button clicked for ID:', quizId);
    console.log('Utils object available:', typeof Utils);
    console.log('editQuiz function available:', typeof editQuiz);
    
    if (!quizId) {
        console.error('No quiz ID provided');
        Utils.showNotification('Invalid quiz ID', 'error');
        return;
    }
    
    try {
        editQuiz(quizId);
    } catch (error) {
        console.error('Error in handleEditQuiz:', error);
        Utils.showNotification('Error editing quiz: ' + error.message, 'error');
    }
}

function handleDeleteQuiz(quizId) {
    console.log('Delete quiz button clicked for ID:', quizId);
    if (!quizId) {
        console.error('No quiz ID provided');
        Utils.showNotification('Invalid quiz ID', 'error');
        return;
    }
    deleteQuiz(quizId);
}

function handleViewQuizResults(quizId) {
    console.log('View results button clicked for ID:', quizId);
    if (!quizId) {
        console.error('No quiz ID provided');
        Utils.showNotification('Invalid quiz ID', 'error');
        return;
    }
    viewQuizResults(quizId);
}

function handleExportResults(quizId) {
    console.log('Export results button clicked for ID:', quizId);
    if (!quizId) {
        console.error('No quiz ID provided');
        Utils.showNotification('Invalid quiz ID', 'error');
        return;
    }
    exportResults(quizId);
}

function handleExportAllResults() {
    console.log('Export all results button clicked');
    exportAllResults();
}

// Print detailed result
function printDetailedResult() {
    try {
        window.print();
    } catch (error) {
        console.error('Error printing:', error);
        Utils.showNotification('Error printing document', 'error');
    }
}

// Professional Edit Quiz Function
function editQuiz(quizId) {
    try {
        console.log('=== EDIT QUIZ FUNCTION ===');
        console.log('Editing quiz with ID:', quizId);
        console.log('Utils available:', typeof Utils);
        console.log('Utils.loadFromStorage available:', typeof Utils.loadFromStorage);
        
        const quizzes = Utils.loadFromStorage('quizzes', []);
        console.log('Loaded quizzes:', quizzes);
        console.log('Number of quizzes:', quizzes.length);
        
        const quiz = quizzes.find(q => q.id === quizId);
        console.log('Found quiz:', quiz);
        
        if (!quiz) {
            console.error('Quiz not found with ID:', quizId);
            console.log('Available quiz IDs:', quizzes.map(q => q.id));
            Utils.showNotification('Quiz not found', 'error');
            return;
        }
        
        console.log('Setting edit mode...');
        
        // Reset question counter for editing
        questionCount = 0;
        
        // Set global variable for editing mode
        window.editingQuiz = quiz;
        window.isEditMode = true;
        
        console.log('Edit mode set, calling showCreateQuiz...');
        
        // Load the edit form
        showCreateQuiz(quiz);
        
        Utils.showNotification('Quiz loaded for editing', 'info');
        
    } catch (error) {
        console.error('Error in editQuiz:', error);
        console.error('Error stack:', error.stack);
        Utils.showNotification('Error loading quiz for editing: ' + error.message, 'error');
    }
}

// Professional Delete Quiz Function
function deleteQuiz(quizId) {
    try {
        console.log('=== DELETE QUIZ FUNCTION ===');
        console.log('Deleting quiz with ID:', quizId);
        
        // Show professional confirmation dialog
        const confirmDelete = confirm(`Are you sure you want to delete this quiz?\n\nThis action cannot be undone and will also remove all associated student results.`);
        
        if (!confirmDelete) {
            console.log('Delete cancelled by user');
            return;
        }
        
        const quizzes = Utils.loadFromStorage('quizzes', []);
        console.log('Loaded quizzes for deletion:', quizzes.length);
        
        const quizIndex = quizzes.findIndex(q => q.id === quizId);
        
        if (quizIndex === -1) {
            console.error('Quiz not found for deletion:', quizId);
            Utils.showNotification('Quiz not found', 'error');
            return;
        }
        
        const quizTitle = quizzes[quizIndex].title;
        console.log('Deleting quiz:', quizTitle);
        
        // Remove quiz
        quizzes.splice(quizIndex, 1);
        Utils.saveToStorage('quizzes', quizzes);
        
        // Also remove associated results
        const results = Utils.loadFromStorage('quizResults', []);
        const filteredResults = results.filter(result => result.quizId !== quizId);
        const removedResultsCount = results.length - filteredResults.length;
        Utils.saveToStorage('quizResults', filteredResults);
        
        console.log(`Deleted quiz: ${quizTitle}, removed ${removedResultsCount} associated results`);
        
        Utils.showNotification(`Quiz "${quizTitle}" deleted successfully`, 'success');
        
        // Refresh the current view
        setTimeout(() => {
            showQuizList();
        }, 1000);
        
    } catch (error) {
        console.error('Error in deleteQuiz:', error);
        console.error('Error stack:', error.stack);
        Utils.showNotification('Error deleting quiz: ' + error.message, 'error');
    }
}

// Professional Export Results Function
function exportResults(quizId) {
    try {
        console.log('=== EXPORT RESULTS FUNCTION ===');
        console.log('Exporting results for quiz ID:', quizId);
        
        const results = Utils.loadFromStorage('quizResults', []);
        const quizzes = Utils.loadFromStorage('quizzes', []);
        const quiz = quizzes.find(q => q.id === quizId);
        
        if (!quiz) {
            Utils.showNotification('Quiz not found', 'error');
            console.error('Quiz not found for export:', quizId);
            return;
        }
        
        const quizResults = results.filter(result => result.quizId === quizId);
        
        if (quizResults.length === 0) {
            Utils.showNotification('No results to export for this quiz', 'warning');
            console.log('No results found for quiz:', quiz.title);
            return;
        }
        
        // Prepare comprehensive data for export
        const exportData = quizResults.map((result, index) => ({
            'Entry #': index + 1,
            'Student Name': result.studentName || 'Anonymous Student',
            'Student Email': result.studentEmail || 'No email provided',
            'Quiz Title': quiz.title,
            'Quiz Category': quiz.category,
            'Quiz Difficulty': quiz.difficulty,
            'Score (%)': result.score,
            'Points': `${Math.round((result.score / 100) * quiz.questions.length)}/${quiz.questions.length}`,
            'Grade': result.score >= quiz.passingScore ? 'PASSED' : 'FAILED',
            'Time Taken': result.timeTaken || 'Not recorded',
            'Completion Date': new Date(result.completedAt).toLocaleDateString(),
            'Completion Time': new Date(result.completedAt).toLocaleTimeString(),
            'Passing Score Required': `${quiz.passingScore}%`,
            'Total Questions': quiz.questions.length,
            'Time Limit': `${quiz.timeLimit} minutes`,
            'Attempt ID': result.id
        }));
        
        // Generate CSV content with proper escaping
        const headers = Object.keys(exportData[0]);
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma or quote
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Generate professional filename
        const safeTitle = quiz.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${safeTitle}-results-${timestamp}.csv`;
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log(`Exported ${quizResults.length} results for quiz: ${quiz.title}`);
        Utils.showNotification(`Exported ${quizResults.length} results for "${quiz.title}"`, 'success');
        
    } catch (error) {
        console.error('Error in exportResults:', error);
        console.error('Error stack:', error.stack);
        Utils.showNotification('Error exporting results: ' + error.message, 'error');
    }
}

// Professional Export All Results Function
function exportAllResults() {
    try {
        console.log('=== EXPORT ALL RESULTS FUNCTION ===');
        console.log('Exporting all quiz results');
        
        const results = Utils.loadFromStorage('quizResults', []);
        const quizzes = Utils.loadFromStorage('quizzes', []);
        
        if (results.length === 0) {
            Utils.showNotification('No results available to export', 'warning');
            console.log('No results found in storage');
            return;
        }
        
        // Prepare comprehensive data for export
        const exportData = results.map((result, index) => {
            const quiz = quizzes.find(q => q.id === result.quizId);
            const quizTitle = quiz ? quiz.title : 'Unknown Quiz';
            const quizCategory = quiz ? quiz.category : 'Unknown';
            const quizDifficulty = quiz ? quiz.difficulty : 'Unknown';
            const passingScore = quiz ? quiz.passingScore : 70;
            const totalQuestions = quiz ? quiz.questions.length : 0;
            const timeLimit = quiz ? quiz.timeLimit : 0;
            
            return {
                'Entry #': index + 1,
                'Student Name': result.studentName || 'Anonymous Student',
                'Student Email': result.studentEmail || 'No email provided',
                'Quiz Title': quizTitle,
                'Quiz Category': quizCategory,
                'Quiz Difficulty': quizDifficulty,
                'Score (%)': result.score,
                'Points': `${Math.round((result.score / 100) * totalQuestions)}/${totalQuestions}`,
                'Grade': result.score >= passingScore ? 'PASSED' : 'FAILED',
                'Time Taken': result.timeTaken || 'Not recorded',
                'Completion Date': new Date(result.completedAt).toLocaleDateString(),
                'Completion Time': new Date(result.completedAt).toLocaleTimeString(),
                'Passing Score Required': `${passingScore}%`,
                'Total Questions': totalQuestions,
                'Time Limit': `${timeLimit} minutes`,
                'Quiz Created': quiz ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown',
                'Attempt ID': result.id,
                'Quiz ID': result.quizId
            };
        });
        
        // Sort by completion date (newest first)
        exportData.sort((a, b) => new Date(b['Completion Date']) - new Date(a['Completion Date']));
        
        // Generate CSV content with proper escaping
        const headers = Object.keys(exportData[0]);
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma or quote
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Generate professional filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `all-quiz-results-${timestamp}.csv`;
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log(`Exported ${results.length} total results from ${quizzes.length} quizzes`);
        Utils.showNotification(`Exported ${results.length} results from all quizzes`, 'success');
        
    } catch (error) {
        console.error('Error in exportAllResults:', error);
        console.error('Error stack:', error.stack);
        Utils.showNotification('Error exporting all results: ' + error.message, 'error');
    }
}

// Complete Global function exports
window.loadTeacherDashboard = loadTeacherDashboard;
window.loadStudentDashboard = loadStudentDashboard;
window.loadTeacherStats = loadTeacherStats;
window.loadStudentStats = loadStudentStats;
window.showCreateQuiz = showCreateQuiz;
window.showQuizList = showQuizList;
window.showQuizResults = showQuizResults;
window.showStudentResults = showStudentResults;
window.filterResults = filterResults;
window.exportAllResults = exportAllResults;
window.editQuiz = editQuiz;
window.deleteQuiz = deleteQuiz;
window.viewQuizResults = viewQuizResults;
window.viewDetailedResult = viewDetailedResult;
window.showDetailedResultPage = showDetailedResultPage;
window.calculateTimePerQuestion = calculateTimePerQuestion;
window.getGestureIcon = getGestureIcon;
window.printDetailedResult = printDetailedResult;
window.exportResults = exportResults;
window.startQuiz = startQuiz;
window.addQuestion = addQuestion;
window.removeQuestion = removeQuestion;
window.previewQuiz = previewQuiz;
window.handleCreateQuiz = handleCreateQuiz;
window.loadAvailableQuizzes = loadAvailableQuizzes;
window.initializeQuizCamera = initializeQuizCamera;
window.closeModal = closeModal;
window.loadQuizInterface = loadQuizInterface;
// Professional wrapper functions
window.handleEditQuiz = handleEditQuiz;
window.handleDeleteQuiz = handleDeleteQuiz;
window.handleViewQuizResults = handleViewQuizResults;
window.handleExportResults = handleExportResults;
window.handleExportAllResults = handleExportAllResults;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sample data
    if (typeof Utils !== 'undefined' && Utils.initializeSampleData) {
        Utils.initializeSampleData();
    }
    
    // Initialize auth system
    if (typeof AuthSystem !== 'undefined') {
        window.authSystem = new AuthSystem();
    }
    
    console.log('✅ Quiz app initialized successfully');
});
