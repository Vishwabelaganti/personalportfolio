// Trivia Quiz implementation
function startTriviaQuiz() {
    console.log("Starting trivia quiz");
    
    try {
        // Clear any existing content
        window.clearSpeechGameContainers();
        
        const speechText = document.getElementById('character-speech-text');
        if (!speechText) {
            console.error("speechText element not found in startTriviaQuiz");
            return;
        }
        
        // Quiz questions with multiple-choice options
        const quizQuestions = [
            {
                question: "Which programming language is known for being used in data science and machine learning?",
                options: ["JavaScript", "Python", "C++", "PHP"],
                answer: 1 // Python
            },
            {
                question: "What does HTML stand for?",
                options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink Text Management Language", "Home Tool Markup Language"],
                answer: 0
            },
            {
                question: "Which of these is NOT a JavaScript framework or library?",
                options: ["React", "Angular", "Django", "Vue"],
                answer: 2 // Django
            },
            {
                question: "What is the purpose of CSS?",
                options: ["Server-side scripting", "Database management", "Styling web pages", "Backend development"],
                answer: 2
            },
            {
                question: "Which of these companies developed TypeScript?",
                options: ["Google", "Microsoft", "Apple", "Facebook"],
                answer: 1 // Microsoft
            },
            {
                question: "What does API stand for?",
                options: ["Application Programming Interface", "Automated Program Integration", "Advanced Programming Interaction", "Application Process Integration"],
                answer: 0
            },
            {
                question: "Which of these is a version control system?",
                options: ["Docker", "Kubernetes", "Git", "Jenkins"],
                answer: 2 // Git
            },
            {
                question: "What's the primary purpose of a firewall in cybersecurity?",
                options: ["Encrypting data", "Monitoring network traffic", "Creating secure passwords", "Backing up data"],
                answer: 1
            },
            {
                question: "Which data structure operates on a First-In-First-Out (FIFO) principle?",
                options: ["Stack", "Queue", "Tree", "Graph"],
                answer: 1 // Queue
            },
            {
                question: "What is the purpose of SQL?",
                options: ["Web page styling", "3D modeling", "Database management", "Image processing"],
                answer: 2
            }
        ];
        
        // Set up game state
        gameState = {
            currentQuestion: 0,
            score: 0,
            totalQuestions: quizQuestions.length
        };
        
        // Create quiz container
        const quizContainer = document.createElement('div');
        quizContainer.className = 'quiz-container';
        
        // Display first question
        displayQuestion(quizContainer, quizQuestions, gameState);
        
        // Append to speech bubble
        speechText.innerHTML = '';
        speechText.appendChild(quizContainer);
    } catch (e) {
        console.error("Error in startTriviaQuiz:", e);
    }
}

function displayQuestion(quizContainer, questions, gameState) {
    quizContainer.innerHTML = '';
    
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        // Quiz completed, show results
        showQuizResults(quizContainer, gameState);
        return;
    }
    
    const currentQ = questions[gameState.currentQuestion];
    
    // Add question title
    const questionTitle = document.createElement('div');
    questionTitle.className = 'game-title';
    questionTitle.textContent = `Question ${gameState.currentQuestion + 1}/${gameState.totalQuestions}`;
    quizContainer.appendChild(questionTitle);
    
    // Add question text
    const questionText = document.createElement('div');
    questionText.className = 'quiz-question';
    questionText.textContent = currentQ.question;
    questionText.style.margin = '15px 0';
    questionText.style.fontWeight = 'bold';
    quizContainer.appendChild(questionText);
    
    // Add options
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-options';
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.gap = '8px';
    
    currentQ.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.className = 'game-button';
        optionButton.textContent = option;
        optionButton.style.textAlign = 'left';
        optionButton.style.padding = '10px 15px';
        
        optionButton.addEventListener('click', () => {
            // Check answer
            if (index === currentQ.answer) {
                gameState.score++;
                optionButton.style.backgroundColor = '#4caf50';
                optionButton.style.color = 'white';
            } else {
                optionButton.style.backgroundColor = '#f44336';
                optionButton.style.color = 'white';
                
                // Highlight correct answer
                const correctButton = optionsContainer.children[currentQ.answer];
                if (correctButton) {
                    correctButton.style.backgroundColor = '#4caf50';
                    correctButton.style.color = 'white';
                }
            }
            
            // Disable all options
            Array.from(optionsContainer.children).forEach(btn => {
                btn.disabled = true;
            });
            
            // Show next button
            setTimeout(() => {
                gameState.currentQuestion++;
                displayQuestion(quizContainer, questions, gameState);
            }, 1500);
        });
        
        optionsContainer.appendChild(optionButton);
    });
    
    quizContainer.appendChild(optionsContainer);
    
    // Add progress info
    const progressInfo = document.createElement('div');
    progressInfo.style.marginTop = '15px';
    progressInfo.style.fontSize = '14px';
    progressInfo.style.textAlign = 'center';
    progressInfo.textContent = `Score: ${gameState.score}/${gameState.totalQuestions}`;
    quizContainer.appendChild(progressInfo);
}

function showQuizResults(quizContainer, gameState) {
    quizContainer.innerHTML = '';
    
    const resultTitle = document.createElement('div');
    resultTitle.className = 'game-title';
    resultTitle.textContent = 'Quiz Results';
    quizContainer.appendChild(resultTitle);
    
    const scoreText = document.createElement('div');
    scoreText.style.fontSize = '24px';
    scoreText.style.margin = '20px 0';
    scoreText.style.textAlign = 'center';
    
    let message = '';
    const score = gameState.score;
    const total = gameState.totalQuestions;
    const percentage = Math.floor((score / total) * 100);
    
    if (percentage >= 90) {
        message = "🏆 Amazing! You're a tech genius!";
    } else if (percentage >= 70) {
        message = "🎉 Great job! You know your tech well!";
    } else if (percentage >= 50) {
        message = "👍 Not bad! You've got decent tech knowledge.";
    } else {
        message = "📚 Keep learning! Tech is always evolving.";
    }
    
    scoreText.innerHTML = `${score}/${total} correct (${percentage}%)<br><br>${message}`;
    quizContainer.appendChild(scoreText);
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'game-controls';
    buttonContainer.style.marginTop = '20px';
    
    const playAgainButton = document.createElement('button');
    playAgainButton.className = 'game-button';
    playAgainButton.textContent = 'Play Again';
    playAgainButton.addEventListener('click', startTriviaQuiz);
    
    const menuButton = document.createElement('button');
    menuButton.className = 'game-button secondary';
    menuButton.textContent = 'Back to Menu';
    menuButton.addEventListener('click', showInteractiveOptions);
    
    buttonContainer.appendChild(playAgainButton);
    buttonContainer.appendChild(menuButton);
    
    quizContainer.appendChild(buttonContainer);
}
