// Script to add test quiz results data for analytics demonstration
// Run this in the browser console on the quiz management page

function addTestData() {
    // First, let's create a test quiz if none exists
    const testQuiz = {
        id: 1234567890,
        title: "JavaScript Fundamentals",
        description: "Test your knowledge of JavaScript basics",
        questions: [
            {
                id: 1,
                question: "What is the correct way to declare a variable in JavaScript?",
                choices: ["var x = 5", "let x = 5", "const x = 5", "All of the above"],
                correct: 3,
                gesture: "peace"
            },
            {
                id: 2,
                question: "Which method is used to add an element to the end of an array?",
                choices: ["push()", "pop()", "shift()", "unshift()"],
                correct: 0,
                gesture: "thumbs-up"
            },
            {
                id: 3,
                question: "What does '===' operator do in JavaScript?",
                choices: ["Assignment", "Comparison", "Strict equality", "Logical AND"],
                correct: 2,
                gesture: "ok"
            },
            {
                id: 4,
                question: "Which of the following is not a JavaScript data type?",
                choices: ["String", "Boolean", "Float", "Object"],
                correct: 2,
                gesture: "point"
            },
            {
                id: 5,
                question: "What is the output of 'typeof null' in JavaScript?",
                choices: ["null", "undefined", "object", "boolean"],
                correct: 2,
                gesture: "fist"
            }
        ],
        category: "Programming",
        createdAt: new Date().toISOString(),
        status: "published",
        published: true,
        publishedAt: new Date().toISOString()
    };

    // Add the test quiz to localStorage
    const quizzes = JSON.parse(localStorage.getItem('gestureQuizzes') || '[]');
    const existingQuiz = quizzes.find(q => q.id === testQuiz.id);
    if (!existingQuiz) {
        quizzes.push(testQuiz);
        localStorage.setItem('gestureQuizzes', JSON.stringify(quizzes));
    }

    // Create sample quiz results
    const sampleResults = [
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "alice@example.com",
            score: 100,
            totalQuestions: 5,
            correctAnswers: 5,
            completedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "bob@example.com",
            score: 80,
            totalQuestions: 5,
            correctAnswers: 4,
            completedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        },
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "charlie@example.com",
            score: 60,
            totalQuestions: 5,
            correctAnswers: 3,
            completedAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
        },
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "diana@example.com",
            score: 40,
            totalQuestions: 5,
            correctAnswers: 2,
            completedAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
        },
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "eve@example.com",
            score: 100,
            totalQuestions: 5,
            correctAnswers: 5,
            completedAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
        },
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "frank@example.com",
            score: 80,
            totalQuestions: 5,
            correctAnswers: 4,
            completedAt: new Date(Date.now() - 518400000).toISOString() // 6 days ago
        },
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "grace@example.com",
            score: 100,
            totalQuestions: 5,
            correctAnswers: 5,
            completedAt: new Date(Date.now() - 604800000).toISOString() // 7 days ago
        },
        {
            quizId: 1234567890,
            quizTitle: "JavaScript Fundamentals",
            userEmail: "henry@example.com",
            score: 80,
            totalQuestions: 5,
            correctAnswers: 4,
            completedAt: new Date(Date.now() - 691200000).toISOString() // 8 days ago
        }
    ];

    // Add results to localStorage
    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const newResults = [...existingResults, ...sampleResults];
    localStorage.setItem('quizResults', JSON.stringify(newResults));

    console.log('Test data added successfully!');
    console.log('Quiz with ID 1234567890 created');
    console.log('8 sample quiz results added');
    
    // Reload the page to see the new data
    if (typeof loadQuizzes === 'function') {
        loadQuizzes();
    }
}

// Run the function
addTestData();
