/**
 * Mini-Games Library for VishwaBot Arcade
 * This file contains games that can be played through the chatbot
 * including Hangman, Number Guess, and Quiz games.
 */

(function() {
    // Game state tracking
    let gameState = null;
    let speechElement = document.getElementById('character-speech');
    let speechText = document.getElementById('character-speech-text');
    
    // Create or get speech elements if they don't exist
    function ensureSpeechElements() {
        if (!speechElement) {
            speechElement = document.getElementById('character-speech');
        }
        if (!speechText) {
            speechText = document.getElementById('character-speech-text');
        }
    }
    
    // Clear any existing game containers
    function clearGameContainers() {
        const existingContainers = document.querySelectorAll('.game-container');
        existingContainers.forEach(container => {
            if (speechElement.contains(container)) {
                speechElement.removeChild(container);
            }
        });
    }
    
    // Initialize games from the arcade panel
    function initializeGame(gameType) {
        ensureSpeechElements();
        clearGameContainers();
        
        switch (gameType) {
            case 'number-guess':
                gameState = {
                    game: 'number-guess',
                    target: Math.floor(Math.random() * 100) + 1, // Random number 1-100
                    attempts: 0,
                    maxAttempts: 10
                };
                renderNumberGuessGame();
                break;
                
            case 'hangman':
                const words = ['javascript', 'python', 'algorithm', 'function', 'variable', 
                             'database', 'interface', 'repository', 'framework', 'compiler'];
                const randomWord = words[Math.floor(Math.random() * words.length)];
                
                gameState = {
                    game: 'hangman',
                    word: randomWord,
                    guessed: Array(randomWord.length).fill('_'),
                    wrongGuesses: [],
                    maxWrongGuesses: 6
                };
                renderHangmanGame();
                break;
                
            case 'quiz':
                const quizQuestions = [
                    {
                        question: "Which programming language was created first?",
                        options: ["Python", "JavaScript", "Fortran", "C++"],
                        answer: 2 // Fortran
                    },
                    {
                        question: "What does CPU stand for?",
                        options: ["Central Processing Unit", "Computer Personal Unit", 
                                  "Central Process Utility", "Computer Processing Unit"],
                        answer: 0
                    },
                    {
                        question: "Which company developed React.js?",
                        options: ["Google", "Microsoft", "Facebook", "Amazon"],
                        answer: 2
                    }
                ];
                
                gameState = {
                    game: 'quiz',
                    questions: quizQuestions,
                    currentQuestion: 0,
                    score: 0
                };
                renderQuizGame();
                break;
        }
        
        // Increase friendship for playing games
        if (typeof window.increaseFriendship === 'function') {
            window.increaseFriendship(2);
        }
    }
    
    // Number Guessing Game
    function renderNumberGuessGame() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container number-guess-game';
        
        // Gold-black styling
        styleGameContainer(gameContainer);
        
        // Game title
        const title = document.createElement('div');
        title.innerText = '🎮 Number Guessing Game 🎮';
        styleGameTitle(title);
        gameContainer.appendChild(title);
        
        // Game instructions
        const instructions = document.createElement('div');
        instructions.innerText = `I'm thinking of a number between 1-100. You have ${gameState.maxAttempts} attempts to guess it!`;
        styleText(instructions);
        gameContainer.appendChild(instructions);
        
        // Status display
        const status = document.createElement('div');
        status.id = 'number-guess-status';
        status.innerText = `Attempts: ${gameState.attempts}/${gameState.maxAttempts}`;
        styleStatusText(status);
        gameContainer.appendChild(status);
        
        // Input area
        const inputArea = document.createElement('div');
        inputArea.style.display = 'flex';
        inputArea.style.gap = '10px';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '100';
        input.placeholder = 'Enter your guess...';
        input.style.flex = '1';
        styleInput(input);
        
        const guessBtn = document.createElement('button');
        guessBtn.innerText = 'Guess';
        styleButton(guessBtn, true);
        
        inputArea.appendChild(input);
        inputArea.appendChild(guessBtn);
        gameContainer.appendChild(inputArea);
        
        // Hint area
        const hint = document.createElement('div');
        hint.id = 'number-guess-hint';
        hint.style.marginTop = '15px';
        hint.style.minHeight = '20px';
        styleText(hint);
        gameContainer.appendChild(hint);
        
        // Exit button
        const exitButton = document.createElement('button');
        exitButton.innerText = 'Exit Game';
        styleButton(exitButton, false);
        exitButton.style.marginTop = '15px';
        
        exitButton.onclick = () => {
            if (speechElement.contains(gameContainer)) {
                speechElement.removeChild(gameContainer);
            }
            gameState = null;
            speechText.textContent = "Game exited! Let me know if you want to play again.";
        };
        
        gameContainer.appendChild(exitButton);
        
        // Handle guess submission
        guessBtn.onclick = () => {
            handleNumberGuess(parseInt(input.value), hint, status, input, gameContainer);
        };
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                handleNumberGuess(parseInt(input.value), hint, status, input, gameContainer);
            }
        };
        
        // Add to speech bubble
        ensureSpeechElements();
        clearGameContainers();
        speechElement.appendChild(gameContainer);
        if (speechText) speechText.textContent = "Number Guessing Game launched!";
    }
    
    function handleNumberGuess(guess, hintElement, statusElement, inputElement, gameContainer) {
        if (isNaN(guess) || guess < 1 || guess > 100) {
            hintElement.innerText = "Please enter a valid number between 1-100.";
            hintElement.style.color = "#ff6666";
            return;
        }
        
        gameState.attempts++;
        statusElement.innerText = `Attempts: ${gameState.attempts}/${gameState.maxAttempts}`;
        
        if (guess === gameState.target) {
            // Win!
            gameContainer.innerHTML = '';
            gameContainer.style.textAlign = 'center';
            
            const winMessage = document.createElement('div');
            winMessage.innerHTML = `🎉 YOU WIN! 🎉<br>You guessed the number ${gameState.target} in ${gameState.attempts} attempts!`;
            styleWinMessage(winMessage);
            gameContainer.appendChild(winMessage);
            
            const playAgainBtn = document.createElement('button');
            playAgainBtn.innerText = 'Play Again';
            styleButton(playAgainBtn, true);
            playAgainBtn.style.margin = '10px';
            
            playAgainBtn.onclick = () => {
                initializeGame('number-guess');
            };
            
            const exitBtn = document.createElement('button');
            exitBtn.innerText = 'Exit';
            styleButton(exitBtn, false);
            exitBtn.style.margin = '10px';
            
            exitBtn.onclick = () => {
                if (speechElement.contains(gameContainer)) {
                    speechElement.removeChild(gameContainer);
                }
                gameState = null;
                speechText.textContent = "Congratulations on your win! What would you like to do next?";
                
                // Increase friendship for winning
                if (typeof window.increaseFriendship === 'function') {
                    window.increaseFriendship(5);
                }
            };
            
            gameContainer.appendChild(playAgainBtn);
            gameContainer.appendChild(exitBtn);
        } else if (gameState.attempts >= gameState.maxAttempts) {
            // Game over
            gameContainer.innerHTML = '';
            gameContainer.style.textAlign = 'center';
            
            const loseMessage = document.createElement('div');
            loseMessage.innerHTML = `Game Over!<br>The number was ${gameState.target}`;
            loseMessage.style.color = '#ff6666';
            loseMessage.style.fontSize = '18px';
            loseMessage.style.fontWeight = 'bold';
            loseMessage.style.marginBottom = '20px';
            gameContainer.appendChild(loseMessage);
            
            const playAgainBtn = document.createElement('button');
            playAgainBtn.innerText = 'Play Again';
            styleButton(playAgainBtn, true);
            playAgainBtn.style.margin = '10px';
            
            playAgainBtn.onclick = () => {
                initializeGame('number-guess');
            };
            
            const exitBtn = document.createElement('button');
            exitBtn.innerText = 'Exit';
            styleButton(exitBtn, false);
            exitBtn.style.margin = '10px';
            
            exitBtn.onclick = () => {
                if (speechElement.contains(gameContainer)) {
                    speechElement.removeChild(gameContainer);
                }
                gameState = null;
                speechText.textContent = "Better luck next time! What would you like to do next?";
            };
            
            gameContainer.appendChild(playAgainBtn);
            gameContainer.appendChild(exitBtn);
        } else {
            // Give hint
            const diff = guess - gameState.target;
            inputElement.value = '';
            
            if (diff > 0) {
                hintElement.innerText = "Too high! Try a lower number.";
                hintElement.style.color = "#ff9966";
            } else {
                hintElement.innerText = "Too low! Try a higher number.";
                hintElement.style.color = "#66ccff";
            }
            
            // Give warmer/colder hints after a few attempts
            if (gameState.attempts > 2) {
                const absDiff = Math.abs(diff);
                if (absDiff < 5) {
                    hintElement.innerText += " You're very close!";
                } else if (absDiff < 10) {
                    hintElement.innerText += " Getting warmer!";
                }
            }
        }
    }
    
    // Hangman Game
    function renderHangmanGame() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container hangman-game';
        
        // Gold-black styling
        styleGameContainer(gameContainer);
        
        // Game title
        const title = document.createElement('div');
        title.innerText = '🎮 Hangman: Programming Terms 🎮';
        styleGameTitle(title);
        gameContainer.appendChild(title);
        
        // Word display
        const wordDisplay = document.createElement('div');
        wordDisplay.className = 'hangman-word';
        wordDisplay.style.letterSpacing = '5px';
        wordDisplay.style.fontSize = '20px';
        wordDisplay.style.fontFamily = 'monospace';
        wordDisplay.style.textAlign = 'center';
        wordDisplay.style.marginBottom = '15px';
        wordDisplay.style.color = '#d4af37';
        wordDisplay.innerText = gameState.guessed.join(' ');
        gameContainer.appendChild(wordDisplay);
        
        // Hangman figure
        const hangmanFigure = document.createElement('div');
        hangmanFigure.className = 'hangman-figure';
        hangmanFigure.style.height = '100px';
        hangmanFigure.style.margin = '0 auto';
        hangmanFigure.style.position = 'relative';
        hangmanFigure.style.width = '100px';
        hangmanFigure.style.border = '1px solid rgba(212,175,55,0.3)';
        hangmanFigure.style.marginBottom = '15px';
        
        // Draw hangman based on wrong guesses
        updateHangmanFigure(hangmanFigure, gameState.wrongGuesses.length);
        gameContainer.appendChild(hangmanFigure);
        
        // Wrong guesses
        const wrongGuessesDisplay = document.createElement('div');
        wrongGuessesDisplay.innerText = `Wrong guesses (${gameState.wrongGuesses.length}/${gameState.maxWrongGuesses}): ${gameState.wrongGuesses.join(', ')}`;
        wrongGuessesDisplay.style.marginBottom = '15px';
        wrongGuessesDisplay.style.color = 'rgba(255, 99, 99, 0.9)';
        gameContainer.appendChild(wrongGuessesDisplay);
        
        // Letter buttons
        const lettersContainer = document.createElement('div');
        lettersContainer.style.display = 'flex';
        lettersContainer.style.flexWrap = 'wrap';
        lettersContainer.style.justifyContent = 'center';
        lettersContainer.style.gap = '10px'; // Increased gap
        lettersContainer.style.marginBottom = '15px';
        lettersContainer.style.position = 'relative';
        lettersContainer.style.zIndex = '10010'; // Higher z-index to ensure it's above any overlapping elements
        lettersContainer.style.padding = '10px'; // Add padding
        lettersContainer.style.backgroundColor = 'rgba(30, 33, 48, 0.95)'; // Darker background for better visibility
        lettersContainer.style.borderRadius = '8px'; // Rounded corners
        lettersContainer.className = 'hangman-keyboard';
        
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(97 + i); // a-z
            const letterButton = document.createElement('button');
            letterButton.innerText = letter;
            letterButton.style.width = '30px';
            letterButton.style.height = '30px';
            letterButton.style.backgroundColor = 'rgba(212,175,55,0.7)';
            letterButton.style.border = 'none';
            letterButton.style.borderRadius = '5px';
            letterButton.style.color = '#1e2130';
            letterButton.style.cursor = 'pointer';
            letterButton.style.fontWeight = 'bold';
            letterButton.style.position = 'relative';
            letterButton.style.zIndex = '10010';
            letterButton.style.margin = '3px';
            
            // Extra protection for the 'o' button which seems to get overlapped
            if (letter === 'o') {
                letterButton.style.zIndex = '10015';
                letterButton.style.position = 'relative';
                letterButton.style.transform = 'translateZ(0)';
                letterButton.style.boxShadow = '0 0 5px #d4af37';
                letterButton.style.backgroundColor = 'rgba(212,175,55,0.9)'; // Make it more visible
            }
            
            // Disable if already guessed
            if (gameState.wrongGuesses.includes(letter) || 
                (gameState.word.includes(letter) && 
                 !gameState.guessed.includes('_'))) {
                letterButton.disabled = true;
                letterButton.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
                letterButton.style.cursor = 'default';
            }
            
            letterButton.onclick = () => {
                if (!letterButton.disabled) {
                    handleHangmanGuess(letter, wordDisplay, wrongGuessesDisplay, hangmanFigure, letterButton, gameContainer);
                }
            };
            
            lettersContainer.appendChild(letterButton);
        }
        
        gameContainer.appendChild(lettersContainer);
        
        // Exit button
        const exitButton = document.createElement('button');
        exitButton.innerText = 'Exit Game';
        styleButton(exitButton, false);
        
        exitButton.onclick = () => {
            if (speechElement.contains(gameContainer)) {
                speechElement.removeChild(gameContainer);
            }
            gameState = null;
            speechText.textContent = "Game exited! Let me know if you want to play again.";
        };
        
        gameContainer.appendChild(exitButton);
        
        // Add to speech bubble
        ensureSpeechElements();
        clearGameContainers();
        speechElement.appendChild(gameContainer);
        if (speechText) speechText.textContent = "Hangman Game launched!";
    }
    
    function updateHangmanFigure(figureElement, wrongGuesses) {
        const goldColor = '#d4af37';
        const hangmanParts = [
            // Head
            `<div style="position:absolute;width:20px;height:20px;border-radius:50%;border:2px solid ${goldColor};top:10px;left:39px;"></div>`,
            // Body
            `<div style="position:absolute;width:2px;height:30px;background-color:${goldColor};top:30px;left:50px;"></div>`,
            // Left arm
            `<div style="position:absolute;width:20px;height:2px;background-color:${goldColor};top:35px;left:30px;transform:rotate(30deg);"></div>`,
            // Right arm
            `<div style="position:absolute;width:20px;height:2px;background-color:${goldColor};top:35px;left:50px;transform:rotate(-30deg);"></div>`,
            // Left leg
            `<div style="position:absolute;width:20px;height:2px;background-color:${goldColor};top:60px;left:30px;transform:rotate(-30deg);"></div>`,
            // Right leg
            `<div style="position:absolute;width:20px;height:2px;background-color:${goldColor};top:60px;left:50px;transform:rotate(30deg);"></div>`,
        ];
        
        // Gallows (always shown)
        figureElement.innerHTML = `
            <div style="position:absolute;width:60px;height:2px;background-color:${goldColor};top:10px;left:20px;"></div>
            <div style="position:absolute;width:2px;height:80px;background-color:${goldColor};top:10px;left:20px;"></div>
            <div style="position:absolute;width:80px;height:2px;background-color:${goldColor};top:90px;left:10px;"></div>
        `;
        
        // Add body parts based on wrong guesses
        for (let i = 0; i < wrongGuesses; i++) {
            if (i < hangmanParts.length) {
                figureElement.innerHTML += hangmanParts[i];
            }
        }
    }
    
    function handleHangmanGuess(letter, wordDisplay, wrongGuessesDisplay, hangmanFigure, letterButton, gameContainer) {
        letterButton.disabled = true;
        letterButton.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
        
        if (gameState.word.includes(letter)) {
            // Correct guess
            for (let i = 0; i < gameState.word.length; i++) {
                if (gameState.word[i] === letter) {
                    gameState.guessed[i] = letter;
                }
            }
            wordDisplay.innerText = gameState.guessed.join(' ');
            
            // Check for win
            if (!gameState.guessed.includes('_')) {
                // Win!
                gameContainer.innerHTML = '';
                gameContainer.style.textAlign = 'center';
                
                const winMessage = document.createElement('div');
                winMessage.innerHTML = `🎉 YOU WIN! 🎉<br>The word was: ${gameState.word}`;
                styleWinMessage(winMessage);
                gameContainer.appendChild(winMessage);
                
                const playAgainBtn = document.createElement('button');
                playAgainBtn.innerText = 'Play Again';
                styleButton(playAgainBtn, true);
                playAgainBtn.style.margin = '10px';
                
                playAgainBtn.onclick = () => {
                    initializeGame('hangman');
                };
                
                const exitBtn = document.createElement('button');
                exitBtn.innerText = 'Exit';
                styleButton(exitBtn, false);
                exitBtn.style.margin = '10px';
                
                exitBtn.onclick = () => {
                    if (speechElement.contains(gameContainer)) {
                        speechElement.removeChild(gameContainer);
                    }
                    gameState = null;
                    speechText.textContent = "Congratulations on your win! What would you like to do next?";
                    
                    // Increase friendship for winning
                    if (typeof window.increaseFriendship === 'function') {
                        window.increaseFriendship(5);
                    }
                };
                
                gameContainer.appendChild(playAgainBtn);
                gameContainer.appendChild(exitBtn);
            }
        } else {
            // Wrong guess
            gameState.wrongGuesses.push(letter);
            wrongGuessesDisplay.innerText = `Wrong guesses (${gameState.wrongGuesses.length}/${gameState.maxWrongGuesses}): ${gameState.wrongGuesses.join(', ')}`;
            updateHangmanFigure(hangmanFigure, gameState.wrongGuesses.length);
            
            // Check for loss
            if (gameState.wrongGuesses.length >= gameState.maxWrongGuesses) {
                // Game over
                gameContainer.innerHTML = '';
                gameContainer.style.textAlign = 'center';
                
                const loseMessage = document.createElement('div');
                loseMessage.innerHTML = `Game Over!<br>The word was: <b>${gameState.word}</b>`;
                loseMessage.style.color = '#ff6666';
                loseMessage.style.fontSize = '18px';
                loseMessage.style.fontWeight = 'bold';
                loseMessage.style.marginBottom = '20px';
                gameContainer.appendChild(loseMessage);
                
                const playAgainBtn = document.createElement('button');
                playAgainBtn.innerText = 'Play Again';
                styleButton(playAgainBtn, true);
                playAgainBtn.style.margin = '10px';
                
                playAgainBtn.onclick = () => {
                    initializeGame('hangman');
                };
                
                const exitBtn = document.createElement('button');
                exitBtn.innerText = 'Exit';
                styleButton(exitBtn, false);
                exitBtn.style.margin = '10px';
                
                exitBtn.onclick = () => {
                    if (speechElement.contains(gameContainer)) {
                        speechElement.removeChild(gameContainer);
                    }
                    gameState = null;
                    speechText.textContent = "Better luck next time! What would you like to do next?";
                };
                
                gameContainer.appendChild(playAgainBtn);
                gameContainer.appendChild(exitBtn);
            }
        }
    }
    
    // Quiz Game
    function renderQuizGame() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'game-container quiz-game';
        
        // Gold-black styling
        styleGameContainer(gameContainer);
        
        // Game title
        const title = document.createElement('div');
        title.innerText = '🎮 Tech Quiz 🎮';
        styleGameTitle(title);
        gameContainer.appendChild(title);
        
        // Question counter
        const counter = document.createElement('div');
        counter.innerText = `Question ${gameState.currentQuestion + 1}/${gameState.questions.length}`;
        counter.style.marginBottom = '10px';
        counter.style.color = '#d4af37';
        counter.style.textAlign = 'center';
        gameContainer.appendChild(counter);
        
        // Current question
        const question = document.createElement('div');
        question.innerText = gameState.questions[gameState.currentQuestion].question;
        question.style.fontSize = '16px';
        question.style.marginBottom = '15px';
        question.style.color = 'white';
        question.style.textAlign = 'center';
        question.style.fontWeight = 'bold';
        gameContainer.appendChild(question);
        
        // Options
        const options = gameState.questions[gameState.currentQuestion].options;
        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.flexDirection = 'column';
        optionsContainer.style.gap = '10px';
        
        options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.innerText = option;
            optionBtn.style.padding = '10px';
            optionBtn.style.borderRadius = '5px';
            optionBtn.style.backgroundColor = 'rgba(212,175,55,0.2)';
            optionBtn.style.color = 'white';
            optionBtn.style.border = '1px solid rgba(212,175,55,0.5)';
            optionBtn.style.cursor = 'pointer';
            optionBtn.style.transition = 'all 0.2s';
            
            optionBtn.onmouseover = () => {
                optionBtn.style.backgroundColor = 'rgba(212,175,55,0.4)';
            };
            
            optionBtn.onmouseout = () => {
                optionBtn.style.backgroundColor = 'rgba(212,175,55,0.2)';
            };
            
            optionBtn.onclick = () => {
                handleQuizAnswer(index, gameContainer);
            };
            
            optionsContainer.appendChild(optionBtn);
        });
        
        gameContainer.appendChild(optionsContainer);
        
        // Exit button
        const exitButton = document.createElement('button');
        exitButton.innerText = 'Exit Quiz';
        styleButton(exitButton, false);
        exitButton.style.marginTop = '15px';
        
        exitButton.onclick = () => {
            if (speechElement.contains(gameContainer)) {
                speechElement.removeChild(gameContainer);
            }
            gameState = null;
            speechText.textContent = "Quiz exited! Let me know if you want to play again.";
        };
        
        gameContainer.appendChild(exitButton);
        
        // Add to speech bubble
        ensureSpeechElements();
        clearGameContainers();
        speechElement.appendChild(gameContainer);
        if (speechText) speechText.textContent = "Tech Quiz launched!";
    }
    
    function handleQuizAnswer(selectedIndex, gameContainer) {
        const correctAnswer = gameState.questions[gameState.currentQuestion].answer;
        
        if (selectedIndex === correctAnswer) {
            // Correct answer
            gameState.score++;
        }
        
        gameState.currentQuestion++;
        
        // Check if quiz is complete
        if (gameState.currentQuestion >= gameState.questions.length) {
            // Quiz complete
            gameContainer.innerHTML = '';
            gameContainer.style.textAlign = 'center';
            
            const resultMessage = document.createElement('div');
            resultMessage.innerHTML = `Quiz Complete!<br>Your Score: ${gameState.score}/${gameState.questions.length}`;
            
            // Style based on score
            if (gameState.score === gameState.questions.length) {
                styleWinMessage(resultMessage);
                resultMessage.innerHTML = `🎉 PERFECT SCORE! 🎉<br>Your Score: ${gameState.score}/${gameState.questions.length}`;
                // Increase friendship for perfect score
                if (typeof window.increaseFriendship === 'function') {
                    window.increaseFriendship(8);
                }
            } else if (gameState.score >= gameState.questions.length / 2) {
                resultMessage.style.color = '#d4af37';
                resultMessage.style.fontSize = '18px';
                resultMessage.style.fontWeight = 'bold';
                resultMessage.style.marginBottom = '20px';
                // Increase friendship for passing score
                if (typeof window.increaseFriendship === 'function') {
                    window.increaseFriendship(3);
                }
            } else {
                resultMessage.style.color = '#ff6666';
                resultMessage.style.fontSize = '18px';
                resultMessage.style.fontWeight = 'bold';
                resultMessage.style.marginBottom = '20px';
            }
            
            gameContainer.appendChild(resultMessage);
            
            const playAgainBtn = document.createElement('button');
            playAgainBtn.innerText = 'Play Again';
            styleButton(playAgainBtn, true);
            playAgainBtn.style.margin = '10px';
            
            playAgainBtn.onclick = () => {
                initializeGame('quiz');
            };
            
            const exitBtn = document.createElement('button');
            exitBtn.innerText = 'Exit';
            styleButton(exitBtn, false);
            exitBtn.style.margin = '10px';
            
            exitBtn.onclick = () => {
                if (speechElement.contains(gameContainer)) {
                    speechElement.removeChild(gameContainer);
                }
                gameState = null;
                speechText.textContent = "Thanks for playing the quiz! What would you like to do next?";
            };
            
            gameContainer.appendChild(playAgainBtn);
            gameContainer.appendChild(exitBtn);
        } else {
            // Next question
            renderQuizGame();
        }
    }
    
    // Styling helper functions - Gold/Black theme
    function styleGameContainer(container) {
        Object.assign(container.style, {
            backgroundColor: 'rgba(30, 33, 48, 0.95)',
            borderRadius: '10px',
            padding: '15px',
            marginTop: '15px',
            border: '2px solid #d4af37',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
            position: 'relative',
            zIndex: '9999',
            overflow: 'visible'
        });
    }
    
    function styleGameTitle(element) {
        Object.assign(element.style, {
            color: '#d4af37',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '10px',
            textShadow: '0 0 3px rgba(212, 175, 55, 0.5)'
        });
    }
    
    function styleText(element) {
        Object.assign(element.style, {
            color: 'white',
            marginBottom: '15px',
            fontSize: '14px'
        });
    }
    
    function styleStatusText(element) {
        Object.assign(element.style, {
            marginBottom: '15px',
            color: 'rgba(212, 175, 55, 0.8)'
        });
    }
    
    function styleInput(element) {
        Object.assign(element.style, {
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            borderRadius: '5px',
            color: 'white'
        });
    }
    
    function styleButton(element, isPrimary) {
        Object.assign(element.style, {
            display: 'block',
            width: '100%',
            padding: '8px',
            backgroundColor: isPrimary ? 'rgba(212, 175, 55, 0.8)' : 'rgba(150, 60, 60, 0.7)',
            border: 'none',
            borderRadius: '5px',
            color: isPrimary ? '#1e2130' : 'white',
            cursor: 'pointer',
            fontWeight: isPrimary ? 'bold' : 'normal',
            marginTop: '10px'
        });
    }
    
    function styleWinMessage(element) {
        Object.assign(element.style, {
            color: '#d4af37',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '0 0 5px rgba(212, 175, 55, 0.5)'
        });
    }

    // Export functions to global scope
    window.ArcadeGames = {
        initializeGame,
        renderNumberGuessGame,
        renderHangmanGame,
        renderQuizGame,
        clearGameContainers
    };
    
    // Add listener to initializeGame to support Snake and Pong
    const originalInitializeGame = initializeGame;
    window.ArcadeGames.initializeGame = function(gameType) {
        if (gameType === 'snake') {
            // Start Snake game
            if (typeof window.startSnakeGame === 'function') {
                window.startSnakeGame();
            } else {
                ensureSpeechElements();
                if (speechText) speechText.textContent = "Snake game is loading. Please try again in a moment.";
            }
        } else if (gameType === 'pong') {
            // Start Pong game
            if (typeof window.startPongGame === 'function') {
                window.startPongGame();
            } else {
                ensureSpeechElements();
                if (speechText) speechText.textContent = "Pong game is loading. Please try again in a moment.";
            }
        } else {
            // Use original implementation for other games
            originalInitializeGame(gameType);
        }
    };
})();
