// Clean implementation of interactive options
document.addEventListener('DOMContentLoaded', function() {
    console.log("Loading interactive options");
    
    // Function to show interactive options
    window.showInteractiveOptions = function() {
        console.log("Showing interactive options");
        
        // Remove any existing options container
        const existingContainer = document.getElementById('interactive-options-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create container
        const container = document.createElement('div');
        container.id = 'interactive-options-container';
        container.style.position = 'absolute';
        container.style.bottom = '80px';
        container.style.right = '20px';
        container.style.backgroundColor = '#fff';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        container.style.padding = '15px';
        container.style.zIndex = '9999';
        container.style.width = '300px';
        
        // Add header
        const header = document.createElement('div');
        header.textContent = '🎮 Fun Stuff';
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '10px';
        header.style.borderBottom = '1px solid #eee';
        header.style.paddingBottom = '5px';
        header.style.fontSize = '18px';
        container.appendChild(header);
        
        // Define options
        const options = [
            { text: '🐍 Snake Game', value: 'snake-game', description: 'Play the classic Snake game' },
            { text: '🏓 Pong Game', value: 'pong-game', description: 'Play the classic Pong game' },
            { text: '🎲 Number Guessing Game', value: 'number-game', description: 'Try to guess a number between 1 and 100' },
            { text: '📝 Tech Quiz', value: 'quiz', description: 'Test your tech knowledge' },
            { text: '📊 Show Friendship Level', value: 'friendship', description: 'See how well we\'re getting along' }
        ];
        
        // Add options
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.style.display = 'block';
            button.style.width = '100%';
            button.style.padding = '10px';
            button.style.margin = '5px 0';
            button.style.backgroundColor = '#f5f5f5';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.textAlign = 'left';
            button.style.transition = 'background-color 0.2s';
            
            // Add description
            const description = document.createElement('div');
            description.textContent = option.description;
            description.style.fontSize = '12px';
            description.style.color = '#666';
            description.style.marginTop = '3px';
            button.appendChild(description);
            
            // Hover effect
            button.onmouseover = function() {
                this.style.backgroundColor = '#e0e0e0';
            };
            
            button.onmouseout = function() {
                this.style.backgroundColor = '#f5f5f5';
            };
            
            button.onclick = function() {
                handleOptionClick(option.value);
            };
            
            container.appendChild(button);
        });
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.display = 'block';
        closeButton.style.width = '100%';
        closeButton.style.padding = '10px';
        closeButton.style.margin = '10px 0 0 0';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        
        closeButton.onclick = function() {
            container.remove();
        };
        
        container.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(container);
    };
    
    // Function to handle option clicks
    function handleOptionClick(value) {
        switch(value) {
            case 'snake-game':
                if (typeof window.startSnakeGame === 'function') {
                    window.startSnakeGame();
                } else {
                    console.error('startSnakeGame function is not defined');
                }
                break;
            case 'pong-game':
                if (typeof window.startPongGame === 'function') {
                    window.startPongGame();
                } else {
                    console.error('startPongGame function is not defined');
                }
                break;
            case 'number-game':
                startNumberGame();
                break;
            case 'quiz':
                startQuiz();
                break;
            case 'friendship':
                if (typeof window.showFriendshipLevel === 'function') {
                    window.showFriendshipLevel();
                } else {
                    console.error('showFriendshipLevel function is not defined');
                }
                break;
        }
        
        // Remove options after selection
        const optionsContainer = document.getElementById('interactive-options-container');
        if (optionsContainer) {
            optionsContainer.remove();
        }
    }
    
    // Number guessing game
    function startNumberGame() {
        console.log("Starting number game");
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.id = 'number-game-container';
        gameContainer.style.position = 'fixed';
        gameContainer.style.top = '50%';
        gameContainer.style.left = '50%';
        gameContainer.style.transform = 'translate(-50%, -50%)';
        gameContainer.style.backgroundColor = '#333';
        gameContainer.style.color = '#fff';
        gameContainer.style.padding = '20px';
        gameContainer.style.borderRadius = '10px';
        gameContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
        gameContainer.style.zIndex = '10000';
        gameContainer.style.width = '300px';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Number Guessing Game';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        gameContainer.appendChild(title);
        
        // Add instructions
        const instructions = document.createElement('p');
        instructions.textContent = 'I\'m thinking of a number between 1 and 100. Try to guess it!';
        instructions.style.marginBottom = '15px';
        gameContainer.appendChild(instructions);
        
        // Add input field
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '100';
        input.placeholder = 'Enter your guess';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.marginBottom = '15px';
        input.style.borderRadius = '5px';
        input.style.border = 'none';
        gameContainer.appendChild(input);
        
        // Add guess button
        const guessButton = document.createElement('button');
        guessButton.textContent = 'Guess';
        guessButton.style.width = '100%';
        guessButton.style.padding = '8px';
        guessButton.style.backgroundColor = '#4CAF50';
        guessButton.style.color = '#fff';
        guessButton.style.border = 'none';
        guessButton.style.borderRadius = '5px';
        guessButton.style.cursor = 'pointer';
        guessButton.style.marginBottom = '15px';
        gameContainer.appendChild(guessButton);
        
        // Add result area
        const result = document.createElement('div');
        result.id = 'guess-result';
        result.style.marginBottom = '15px';
        result.style.minHeight = '50px';
        gameContainer.appendChild(result);
        
        // Add attempts counter
        const attempts = document.createElement('div');
        attempts.id = 'guess-attempts';
        attempts.textContent = 'Attempts: 0';
        attempts.style.marginBottom = '15px';
        gameContainer.appendChild(attempts);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.width = '100%';
        closeButton.style.padding = '8px';
        closeButton.style.backgroundColor = '#f44336';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
            gameContainer.remove();
        };
        gameContainer.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(gameContainer);
        
        // Game logic
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        let attemptCount = 0;
        
        // Focus input
        input.focus();
        
        // Handle guess
        function handleGuess() {
            const guess = parseInt(input.value);
            if (isNaN(guess) || guess < 1 || guess > 100) {
                result.textContent = 'Please enter a valid number between 1 and 100.';
                result.style.color = '#ffcc00';
                return;
            }
            
            attemptCount++;
            attempts.textContent = `Attempts: ${attemptCount}`;
            
            if (guess === targetNumber) {
                result.textContent = `Congratulations! You guessed the number ${targetNumber} in ${attemptCount} attempts!`;
                result.style.color = '#4CAF50';
                input.disabled = true;
                guessButton.disabled = true;
                
                // Increase friendship level
                if (typeof window.increaseFriendshipLevel === 'function') {
                    window.increaseFriendshipLevel(5);
                }
            } else if (guess < targetNumber) {
                result.textContent = `Your guess ${guess} is too low. Try again!`;
                result.style.color = '#ff9800';
            } else {
                result.textContent = `Your guess ${guess} is too high. Try again!`;
                result.style.color = '#ff9800';
            }
            
            input.value = '';
            input.focus();
        }
        
        guessButton.onclick = handleGuess;
        input.onkeypress = function(e) {
            if (e.key === 'Enter') {
                handleGuess();
            }
        };
    }
    
    // Quiz game
    function startQuiz() {
        console.log("Starting quiz");
        
        // Quiz questions
        const questions = [
            {
                question: "What field is Vishwa passionate about?",
                options: ["Music Production", "UI/UX Design", "Data Science", "Game Development"],
                answer: 1 // UI/UX Design
            },
            {
                question: "What type of music does Vishwa enjoy?",
                options: ["Classical", "Pop and Soul", "Heavy Metal", "Only Jazz"],
                answer: 1 // Pop and Soul
            },
            {
                question: "What is the purpose of the Konami code in this portfolio?",
                options: ["To access a secret game", "To download resume", "To unlock theme change", "To show contact info"],
                answer: 0 // To access a secret game
            }
        ];
        
        // Create quiz container
        const quizContainer = document.createElement('div');
        quizContainer.id = 'quiz-container';
        quizContainer.style.position = 'fixed';
        quizContainer.style.top = '50%';
        quizContainer.style.left = '50%';
        quizContainer.style.transform = 'translate(-50%, -50%)';
        quizContainer.style.backgroundColor = '#333';
        quizContainer.style.color = '#fff';
        quizContainer.style.padding = '20px';
        quizContainer.style.borderRadius = '10px';
        quizContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
        quizContainer.style.zIndex = '10000';
        quizContainer.style.width = '400px';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Tech Quiz';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        quizContainer.appendChild(title);
        
        // Add quiz content area
        const quizContent = document.createElement('div');
        quizContent.id = 'quiz-content';
        quizContainer.appendChild(quizContent);
        
        // Add to document
        document.body.appendChild(quizContainer);
        
        let currentQuestion = 0;
        let correctAnswers = 0;
        
        // Function to show the current question
        function showQuestion() {
            if (currentQuestion >= questions.length) {
                showResults();
                return;
            }
            
            const q = questions[currentQuestion];
            
            // Clear content
            quizContent.innerHTML = '';
            
            // Add question number
            const questionNumber = document.createElement('div');
            questionNumber.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
            questionNumber.style.marginBottom = '10px';
            quizContent.appendChild(questionNumber);
            
            // Add question text
            const questionText = document.createElement('div');
            questionText.textContent = q.question;
            questionText.style.fontWeight = 'bold';
            questionText.style.marginBottom = '15px';
            questionText.style.fontSize = '18px';
            quizContent.appendChild(questionText);
            
            // Add options
            q.options.forEach((option, index) => {
                const optionButton = document.createElement('button');
                optionButton.textContent = option;
                optionButton.style.display = 'block';
                optionButton.style.width = '100%';
                optionButton.style.padding = '10px';
                optionButton.style.margin = '5px 0';
                optionButton.style.backgroundColor = '#f5f5f5';
                optionButton.style.color = '#333';
                optionButton.style.border = 'none';
                optionButton.style.borderRadius = '5px';
                optionButton.style.cursor = 'pointer';
                optionButton.style.textAlign = 'left';
                
                optionButton.onclick = function() {
                    checkAnswer(index);
                };
                
                quizContent.appendChild(optionButton);
            });
        }
        
        // Function to check the answer
        function checkAnswer(selectedIndex) {
            const q = questions[currentQuestion];
            const isCorrect = selectedIndex === q.answer;
            
            // Clear content
            quizContent.innerHTML = '';
            
            // Add feedback
            const feedback = document.createElement('div');
            feedback.style.textAlign = 'center';
            feedback.style.marginBottom = '20px';
            
            if (isCorrect) {
                feedback.textContent = 'Correct!';
                feedback.style.color = '#4CAF50';
                feedback.style.fontWeight = 'bold';
                feedback.style.fontSize = '24px';
                correctAnswers++;
            } else {
                feedback.textContent = 'Incorrect!';
                feedback.style.color = '#f44336';
                feedback.style.fontWeight = 'bold';
                feedback.style.fontSize = '24px';
                
                // Show correct answer
                const correctAnswer = document.createElement('div');
                correctAnswer.textContent = `The correct answer is: ${q.options[q.answer]}`;
                correctAnswer.style.marginTop = '10px';
                feedback.appendChild(correctAnswer);
            }
            
            quizContent.appendChild(feedback);
            
            // Next button
            const nextButton = document.createElement('button');
            nextButton.textContent = currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results';
            nextButton.style.padding = '10px 20px';
            nextButton.style.backgroundColor = '#4CAF50';
            nextButton.style.color = '#fff';
            nextButton.style.border = 'none';
            nextButton.style.borderRadius = '5px';
            nextButton.style.cursor = 'pointer';
            nextButton.style.margin = '10px auto';
            nextButton.style.display = 'block';
            
            nextButton.onclick = function() {
                currentQuestion++;
                showQuestion();
            };
            
            quizContent.appendChild(nextButton);
        }
        
        // Function to show the results
        function showResults() {
            // Clear content
            quizContent.innerHTML = '';
            
            // Calculate score
            const score = Math.round((correctAnswers / questions.length) * 100);
            
            // Add results
            const results = document.createElement('div');
            results.style.textAlign = 'center';
            
            const scoreText = document.createElement('div');
            scoreText.textContent = `Your Score: ${score}%`;
            scoreText.style.fontSize = '24px';
            scoreText.style.fontWeight = 'bold';
            scoreText.style.marginBottom = '10px';
            results.appendChild(scoreText);
            
            const correctText = document.createElement('div');
            correctText.textContent = `You answered ${correctAnswers} out of ${questions.length} questions correctly.`;
            correctText.style.marginBottom = '20px';
            results.appendChild(correctText);
            
            // Determine friendship points
            let friendshipPoints = 0;
            if (score >= 100) {
                friendshipPoints = 10;
            } else if (score >= 66) {
                friendshipPoints = 7;
            } else if (score >= 33) {
                friendshipPoints = 4;
            } else {
                friendshipPoints = 2;
            }
            
            // Show friendship points earned
            const pointsText = document.createElement('div');
            pointsText.textContent = `+${friendshipPoints} friendship points earned!`;
            pointsText.style.color = '#4CAF50';
            pointsText.style.fontWeight = 'bold';
            pointsText.style.marginBottom = '20px';
            results.appendChild(pointsText);
            
            // Increase friendship level
            if (typeof window.increaseFriendshipLevel === 'function') {
                window.increaseFriendshipLevel(friendshipPoints);
            }
            
            // Close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.padding = '10px 20px';
            closeButton.style.backgroundColor = '#f44336';
            closeButton.style.color = '#fff';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '5px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.margin = '10px auto';
            closeButton.style.display = 'block';
            
            closeButton.onclick = function() {
                quizContainer.remove();
            };
            
            results.appendChild(closeButton);
            quizContent.appendChild(results);
        }
        
        // Start the quiz
        showQuestion();
    }
    
    // Make functions available globally
    window.showInteractiveOptions = showInteractiveOptions;
    window.startNumberGame = startNumberGame;
    window.startQuiz = startQuiz;
    
    console.log("Interactive options loaded");
});
