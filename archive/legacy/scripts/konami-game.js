// Function to check if fun mode is enabled
function isFunModeEnabled() {
    // Check if a funMode flag is set in localStorage
    return localStorage.getItem('funModeEnabled') === 'true';
}

// Function to toggle fun mode
function toggleFunMode(enable) {
    localStorage.setItem('funModeEnabled', enable ? 'true' : 'false');
    
    // Update button text if it exists
    const statusElem = document.getElementById('funModeStatus');
    if (statusElem) {
        statusElem.textContent = enable ? 'Disable Fun Mode' : 'Enable Fun Mode';
    }
    
    // Optional: Add visual feedback for any fun mode button if it exists
    const funModeButton = document.querySelector('.fun-mode-button');
    if (funModeButton) {
        funModeButton.classList.add('updated');
        setTimeout(() => funModeButton.classList.remove('updated'), 300);
    }
    
    // If we're enabling fun mode, initialize elements
    if (enable) {
        initKonamiCodeElements();
    } else {
        // Remove any fun mode elements
        const progressBarContainer = document.getElementById('konami-progress-container');
        if (progressBarContainer) {
            document.body.removeChild(progressBarContainer);
        }
    }
    
    console.log(`Fun mode ${enable ? 'enabled' : 'disabled'}`);
}

// Function to enable fun mode
function enableFunMode() {
    toggleFunMode(true);
    return true;
}

// Function to disable fun mode
function disableFunMode() {
    toggleFunMode(false);
    return false;
}

// Function to initialize the Konami code elements
function initKonamiCodeElements() {
    console.log('Initializing Konami code features dynamically');
    
    // Make sure we don't create duplicate elements
    const existingContainer = document.getElementById('konami-progress-container');
    if (existingContainer) {
        console.log('Konami elements already exist, skipping initialization');
        return; // Already initialized
    }
    
    try {
        // Create a progress bar container that will be shown at the top of the screen
        progressBarContainer = document.createElement('div');
        progressBarContainer.id = 'konami-progress-container';
        progressBarContainer.style.position = 'fixed';
        progressBarContainer.style.top = '20px';
        progressBarContainer.style.left = '50%';
        progressBarContainer.style.transform = 'translateX(-50%)';
        progressBarContainer.style.width = '90%';
        progressBarContainer.style.maxWidth = '600px';
        progressBarContainer.style.padding = '15px';
        progressBarContainer.style.background = 'rgba(0, 0, 0, 0.9)';
        progressBarContainer.style.borderRadius = '10px';
        progressBarContainer.style.overflow = 'visible';
        progressBarContainer.style.display = 'none'; // Hide until needed
        progressBarContainer.style.zIndex = '999999'; // Very high z-index
        progressBarContainer.style.border = '3px solid #d4af37';
        progressBarContainer.style.boxShadow = '0 0 20px #d4af37, 0 0 40px rgba(212, 175, 55, 0.4)';
        progressBarContainer.style.pointerEvents = 'none'; // Don't block clicks
        
        console.log('Created progress bar container');
        
        // Create sequence display for Unicode symbols
        sequenceDisplay = document.createElement('div');
        sequenceDisplay.className = 'konami-sequence';
        sequenceDisplay.style.fontFamily = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
        sequenceDisplay.style.fontSize = '24px';
        sequenceDisplay.style.textAlign = 'center';
        sequenceDisplay.style.marginBottom = '10px';
        sequenceDisplay.style.letterSpacing = '5px';
        
        // Create the progress bar itself
        progressBar = document.createElement('div');
        progressBar.style.height = '5px';
        progressBar.style.width = '0%';
        progressBar.style.background = '#d4af37'; // Solid gold color instead of gradient
        progressBar.style.transition = 'width 0.3s ease-in-out';
        progressBar.style.borderRadius = '8px';
        
        // Add a label to the progress bar
        progressLabel = document.createElement('div');
        progressLabel.style.color = 'white';
        progressLabel.style.fontWeight = 'bold';
        progressLabel.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.8)';
        progressLabel.style.fontSize = '16px';
        progressLabel.style.fontFamily = 'Arial, sans-serif';
        progressLabel.style.width = '100%';
        progressLabel.style.textAlign = 'center';
        progressLabel.style.marginTop = '10px';
        progressLabel.textContent = 'SECRET CODE PROGRESS (0/11)';
        
        // Add the elements to the container
        progressBarContainer.appendChild(sequenceDisplay);
        progressBarContainer.appendChild(progressBar);
        progressBarContainer.appendChild(progressLabel);
        
        // Add the container to the body
        document.body.appendChild(progressBarContainer);
        
        // Initialize the sequence display
        updateKonamiSequenceDisplay();
        
        console.log('Konami code elements fully initialized');
    } catch (error) {
        console.error('Error initializing Konami code elements:', error);
    }
}

// Function to get a random tech joke
function getTechJoke() {
    const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "Why did the developer go broke? Because they used up all their cache!",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
        "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
        "Why was the JavaScript developer sad? Because they didn't know how to 'null' their feelings!",
        "Why do Java developers wear glasses? Because they don't C#!",
        "What's a pirate's favorite programming language? R!",
        "Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25!",
        "Why was the computer cold? It left its Windows open!",
        "What do you call 8 hobbits? A hobbyte!",
        "Why don't programmers like nature? It has too many bugs and no debugging tool!",
        "What's the object-oriented way to become wealthy? Inheritance!",
        "What did the router say to the doctor? 'It hurts when IP!'",
        "Why did the functions stop calling each other? They had too many arguments!",
        "Why did the developer go broke? Because they lost their domain in a crash!",
        "What do you call a computer that sings? A Dell!",
        "Why was the database administrator kicked out of the bar? They kept joining the tables!",
        "What's a programmer's favorite hangout place? Foo Bar!",
        "Why did the programmer quit their job? Because they didn't get arrays!"
    ];
    
    return jokes[Math.floor(Math.random() * jokes.length)];
}

// Function to update the Konami sequence display with Unicode symbols
function updateKonamiSequenceDisplay() {
    if (!sequenceDisplay) return;
    
    // Define symbol mapping for keys
    const keySymbols = {
        'ArrowUp': '⬆️',
        'ArrowDown': '⬇️',
        'ArrowLeft': '⬅️',
        'ArrowRight': '➡️',
        'b': '🅱️',
        'a': '🅰️',
        'Enter': '▶️'  // "Start" button
    };
    
    // Build the sequence display
    let displayHTML = '';
    for (let i = 0; i < konamiCode.length; i++) {
        if (i < konamiCodePosition) {
            // Completed keys
            displayHTML += keySymbols[konamiCode[i]] + ' ';
        } else {
            // Upcoming keys (shown as empty boxes)
            displayHTML += '⬜ ';
        }
    }
    
    sequenceDisplay.innerHTML = displayHTML;
}

// Konami Code Implementation
// Global variables for Konami code
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
let konamiCodePosition = 0;
let progressBarContainer, progressBar, progressLabel, sequenceDisplay;
let hideTimeout;

// Initialize Konami code elements when DOM is loaded and fun mode is active
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Konami code features');
    
    // Check if we've already initialized to prevent duplicate handlers
    if (window.konamiInitialized) {
        console.log('Konami code already initialized, skipping');
        return;
    }
    
    // Mark as initialized to prevent duplicate initialization
    window.konamiInitialized = true;
    
    // Enable fun mode by default
    enableFunMode();
    
    // Make sure we remove any existing listeners before adding a new one
    if (window.konamiKeyHandler) {
        document.removeEventListener('keydown', window.konamiKeyHandler);
        console.log('Removed existing keydown handler');
    }
    
    // Create the keydown handler and store it for potential removal
    window.konamiKeyHandler = function(e) {
        // Only process when fun mode is enabled or when entering the konami code to activate fun mode
        if (!isFunModeEnabled() && konamiCodePosition === 0) {
            // If fun mode is not enabled, still allow the user to enter the konami code to enable it
            const key = e.key;
            const requiredKey = konamiCode[konamiCodePosition];
            
            if (key.toLowerCase() === requiredKey.toLowerCase()) {
                konamiCodePosition++;
                
                if (konamiCodePosition === konamiCode.length) {
                    enableFunMode();
                    showHint('✨ Fun Mode Activated! ✨ Welcome to the secret side of this website...');
                    konamiCodePosition = 0;
                }
            } else {
                konamiCodePosition = 0;
            }
            return; // Exit if not in fun mode
        }
        
        // Check if DOM is loaded and elements exist when in fun mode
        if (!progressBarContainer || !progressBar || !progressLabel) {
            console.log('Konami code elements not yet initialized');
            initKonamiCodeElements(); // Try to initialize if not already done
            if (!progressBarContainer) {
                console.log('Failed to initialize Konami code elements');
                return; // Exit if elements aren't initialized yet
            }
        }
        
        // Get the key pressed
        const key = e.key;
        console.log('Key pressed:', key, 'at position:', konamiCodePosition);
        
        // Get the required key from the konami code
        const requiredKey = konamiCode[konamiCodePosition];
        
        // Check if the key is correct
        if (key.toLowerCase() === requiredKey.toLowerCase()) {
            console.log('Correct key at position:', konamiCodePosition);
            
            // Increment position first
            konamiCodePosition++;
            
            // Show the progress bar only after the first 3 correct keys (Up, Up, Down)
            if (konamiCodePosition === 3) {
                progressBarContainer.style.display = 'block';
                progressBarContainer.style.zIndex = '999999'; // Super high z-index to ensure visibility
                progressBarContainer.style.position = 'fixed';
                progressBarContainer.style.top = '10px';
                console.log('Showing progress bar after first 3 keys with high z-index');
                console.log('Progress bar element:', progressBarContainer);
                console.log('Progress bar display:', progressBarContainer.style.display);
                console.log('Progress bar z-index:', progressBarContainer.style.zIndex);
                showHint('Great! You found the secret pattern! Continue with arrow keys to unlock more...');
            }
            
            // Update the progress bar (only if it's visible)
            if (konamiCodePosition >= 3) {
                const progress = (konamiCodePosition / konamiCode.length) * 100;
                progressBar.style.width = `${progress}%`;
                progressLabel.textContent = `SECRET CODE PROGRESS (${konamiCodePosition}/${konamiCode.length})`;
                
                // Update the sequence display
                updateKonamiSequenceDisplay();
            }
            
            // Show different hints based on position in the sequence
            if (konamiCodePosition === 3) {
                // After ↑↑↓ - this is when the progress bar first appears
                showHint('Great! You found the secret pattern! Continue with arrow keys to unlock more...');
            } else if (konamiCodePosition === 7) {
                // After ↑↑↓↓←→←→
                showHint('Excellent! Almost there! Now you need two letters at the start of the alphabet...');
            } else if (konamiCodePosition === 9) {
                // After B and A letters
                showHint('Complete the sacred sequence with the button that begins the journey...');
            }
            
            // If the full sequence is entered, activate the easter egg
            if (konamiCodePosition === konamiCode.length) {
                // Flash the progress bar
                progressBar.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
                
                setTimeout(() => {
                    progressBarContainer.style.display = 'none';
                    activateKonamiEasterEgg();
                    konamiCodePosition = 0;
                }, 500);
            }
            
            // Clear any existing timeout to prevent hiding the progress bar
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        } else {
            // User made a mistake
            console.log('Incorrect key. Expected:', requiredKey, 'Got:', key);
            
            // Reset the position
            konamiCodePosition = 0;
            
            // Hide the progress bar since we're resetting
            progressBarContainer.style.display = 'none';
            
            // Update sequence display
            updateKonamiSequenceDisplay();
            
            // User made a mistake, reset and show error in the progress bar
            if (progressBarContainer.style.display === 'block') {
                // Update the progress bar to show failure
                progressBar.style.background = '#f44336'; // Red for failure
                progressBar.style.width = '100%';
                progressLabel.textContent = 'Try Again!';
                
                showHint('Oops! That\'s not the right sequence. Try again with arrow keys: ↑↑...');
                
                // Hide the progress bar after a delay
                hideTimeout = setTimeout(() => {
                    progressBarContainer.style.display = 'none';
                    progressBar.style.background = '#d4af37'; // Reset to gold
                    progressLabel.textContent = 'SECRET CODE PROGRESS (0/11)';
                }, 1500);
            }
        }
    };
    
    // Add the event listener now that we have the handler defined
    document.addEventListener('keydown', window.konamiKeyHandler);
    console.log('Added keydown event listener for Konami code');
});

// Function to show hints to the user
function showHint(message) {
    // Remove any existing hint
    const existingTooltip = document.getElementById('konami-tooltip');
    if (existingTooltip) {
        document.body.removeChild(existingTooltip);
    }
    
    // Create new tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'konami-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.top = '70px';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.background = 'rgba(0, 0, 0, 0.9)';
    tooltip.style.color = '#d4af37';
    tooltip.style.padding = '10px 15px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.fontSize = '14px';
    tooltip.style.zIndex = '10000';
    tooltip.style.textAlign = 'center';
    tooltip.style.border = '2px solid #d4af37';
    tooltip.innerHTML = message;
    document.body.appendChild(tooltip);
    
    // Remove tooltip after some time
    setTimeout(() => {
        if (document.getElementById('konami-tooltip')) {
            document.body.removeChild(tooltip);
        }
    }, 5000);
}

// Function to activate the Konami Code easter egg
function activateKonamiEasterEgg() {
    console.log("Konami Code activated!");
    
    // Give a small friendship boost for discovering the Konami code
    if (window.increaseFriendship) {
        window.increaseFriendship(1); // Small bonus for finding the code
        console.log('Increased friendship by 1 for discovering Konami code');
    }
    
    // Start the game
    startKonamiGame();
}

// Function to return to interactive options (close game)
function showInteractiveOptions() {
    // Increase friendship level for completing the secret Konami code game
    if (window.increaseFriendship) {
        window.increaseFriendship(3); // Give a nice bonus for finding the secret game
        console.log('Increased friendship by 3 for completing Konami game');
    }
    
    // Get the main chatbot speech elements
    const character = document.getElementById('floating-character');
    const speech = document.getElementById('character-speech');
    const speechText = document.getElementById('character-speech-text');
    
    if (character && speech && speechText) {
        // Make sure the main chatbot is visible
        character.classList.add('active');
        speech.classList.add('active');
        
        // Show congratulatory message in the main chatbot style
        speechText.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p style="color: #d4af37; font-weight: bold; margin-bottom: 10px;">🎉 Secret Konami Game Completed! 🎉</p>
                <p style="margin-bottom: 15px;">Wow! You found and completed my secret star-collecting game! That was impressive.</p>
                <p style="margin-bottom: 15px;">Your friendship level increased by <span style="color: #d4af37; font-weight: bold;">+3</span> for discovering this hidden feature!</p>
                <div style="margin-top: 15px;">
                    <button class="game-button primary" onclick="startKonamiGame()" style="margin: 5px; padding: 8px 16px; background: #d4af37; color: #1e2130; border: none; border-radius: 6px; cursor: pointer;">Play Again</button>
                    <button class="game-button secondary" onclick="closeKonamiGame()" style="margin: 5px; padding: 8px 16px; background: rgba(212,175,55,0.15); color: #fff; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; cursor: pointer;">Continue Chatting</button>
                </div>
            </div>
        `;
    } else {
        console.log('Main chatbot elements not found, using fallback');
        // Fallback if main chatbot elements aren't available
        alert('🎉 Konami Code game completed! Friendship increased by +3!');
    }
}

// Function to close the Konami game and return to normal chat
function closeKonamiGame() {
    const speechText = document.getElementById('character-speech-text');
    if (speechText) {
        speechText.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <p>Thanks for playing my secret game! 🎮</p>
                <p>What else would you like to chat about?</p>
                <div style="margin-top: 15px;">
                    <button onclick="window.showChatInput && window.showChatInput()" style="padding: 8px 16px; background: #d4af37; color: #1e2130; border: none; border-radius: 6px; cursor: pointer;">Continue Conversation</button>
                </div>
            </div>
        `;
    }
}

// Function to play the game again
function playAgain() {
    startKonamiGame();
}

// Function to close the chat
function closeChat() {
    const character = document.getElementById('floating-character');
    const speech = document.getElementById('character-speech');
    
    if (character) character.classList.remove('active');
    if (speech) speech.classList.remove('active');
}

// Function to start the Konami Code game
function startKonamiGame() {
    // Clear any existing speech/game content
    if (window.clearSpeechGameContainers) {
        window.clearSpeechGameContainers();
    }
    
    // Get the speech text element
    const speechText = document.getElementById('character-speech-text');
    if (!speechText) {
        console.error("speechText element not found in startKonamiGame");
        return;
    }
    
    // Make character and speech bubble visible if not already
    const character = document.getElementById('floating-character');
    const speech = document.getElementById('character-speech');
    
    if (character) character.classList.add('active');
    if (speech) speech.classList.add('active');
    
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.className = 'game-container';
    gameContainer.style.padding = '15px';
    
    // Add title
    const gameTitle = document.createElement('div');
    gameTitle.className = 'game-title';
    gameTitle.textContent = '⭐ Konami Code Activated! ⭐';
    gameTitle.style.marginBottom = '15px';
    gameContainer.appendChild(gameTitle);
    
    // Create canvas for the game
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 200;
    canvas.style.border = '2px solid var(--elegant-gold)';
    canvas.style.borderRadius = '8px';
    canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    gameContainer.appendChild(canvas);
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.fontSize = '12px';
    instructions.style.marginTop = '10px';
    instructions.style.textAlign = 'center';
    instructions.style.color = '#ccc';
    instructions.innerHTML = 'Use arrow keys or buttons to move. Collect stars ⭐<br>Press ESC to exit the game';
    gameContainer.appendChild(instructions);
    
    // Add touch controls
    const touchControls = document.createElement('div');
    touchControls.className = 'touch-controls';
    touchControls.style.display = 'flex';
    touchControls.style.justifyContent = 'center';
    touchControls.style.marginTop = '15px';
    touchControls.style.gap = '10px';
    
    // Create direction buttons
    const directions = ['left', 'up', 'down', 'right'];
    const arrowSymbols = {
        'left': '←',
        'up': '↑',
        'down': '↓',
        'right': '→'
    };
    
    directions.forEach(dir => {
        const btn = document.createElement('button');
        btn.className = 'arcade-button';
        btn.textContent = arrowSymbols[dir];
        btn.style.width = '40px';
        btn.style.height = '40px';
        btn.style.border = '2px solid var(--elegant-gold)';
        btn.style.borderRadius = '8px';
        btn.style.background = 'rgba(0, 0, 0, 0.5)';
        btn.style.color = 'var(--elegant-gold)';
        btn.style.fontSize = '18px';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s';
        
        // Add hover effect
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(212, 175, 55, 0.3)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(0, 0, 0, 0.5)';
        });
        
        // Handle button press
        btn.addEventListener('mousedown', () => {
            // Simulate key press
            if (dir === 'left') game.keysPressed['ArrowLeft'] = true;
            if (dir === 'right') game.keysPressed['ArrowRight'] = true;
            if (dir === 'up') game.keysPressed['ArrowUp'] = true;
            if (dir === 'down') game.keysPressed['ArrowDown'] = true;
            
            btn.style.transform = 'scale(0.9)';
        });
        
        btn.addEventListener('mouseup', () => {
            // Release key press
            if (dir === 'left') game.keysPressed['ArrowLeft'] = false;
            if (dir === 'right') game.keysPressed['ArrowRight'] = false;
            if (dir === 'up') game.keysPressed['ArrowUp'] = false;
            if (dir === 'down') game.keysPressed['ArrowDown'] = false;
            
            btn.style.transform = 'scale(1)';
        });
        
        // Also handle touch for mobile
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Simulate key press
            if (dir === 'left') game.keysPressed['ArrowLeft'] = true;
            if (dir === 'right') game.keysPressed['ArrowRight'] = true;
            if (dir === 'up') game.keysPressed['ArrowUp'] = true;
            if (dir === 'down') game.keysPressed['ArrowDown'] = true;
            
            btn.style.transform = 'scale(0.9)';
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Release key press
            if (dir === 'left') game.keysPressed['ArrowLeft'] = false;
            if (dir === 'right') game.keysPressed['ArrowRight'] = false;
            if (dir === 'up') game.keysPressed['ArrowUp'] = false;
            if (dir === 'down') game.keysPressed['ArrowDown'] = false;
            
            btn.style.transform = 'scale(1)';
        });
        
        touchControls.appendChild(btn);
    });
    
    gameContainer.appendChild(touchControls);
    
    // Add score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.style.fontSize = '14px';
    scoreDisplay.style.marginTop = '10px';
    scoreDisplay.style.textAlign = 'center';
    scoreDisplay.style.fontWeight = 'bold';
    scoreDisplay.style.color = 'var(--elegant-gold)';
    scoreDisplay.textContent = 'Score: 0';
    gameContainer.appendChild(scoreDisplay);
    
    // Add exit button
    const exitButton = document.createElement('button');
    exitButton.className = 'game-button secondary';
    exitButton.textContent = 'Exit Game';
    exitButton.style.marginTop = '10px';
    exitButton.style.display = 'block';
    exitButton.style.margin = '10px auto 0';
    exitButton.addEventListener('click', () => {
        // Stop the game
        window.removeEventListener('keydown', handleGameInput);
        
        // Return to interactive options
        showInteractiveOptions();
    });
    gameContainer.appendChild(exitButton);
    
    // Append the game container to the speech bubble
    speechText.innerHTML = '';
    speechText.appendChild(gameContainer);
    
    // Game state
    const game = {
        ctx: canvas.getContext('2d'),
        player: {
            x: 20,
            y: 100,
            width: 20,
            height: 20,
            speed: 5,
            color: 'var(--elegant-gold)'
        },
        stars: [],
        score: 0,
        animationFrame: null,
        keysPressed: {}
    };
    
    // Create initial stars
    for (let i = 0; i < 5; i++) {
        createStar(game);
    }
    
    // Game input handler
    function handleGameInput(e) {
        // Track pressed keys
        game.keysPressed[e.key] = e.type === 'keydown';
        
        // Exit game on ESC
        if (e.key === 'Escape') {
            window.cancelAnimationFrame(game.animationFrame);
            window.removeEventListener('keydown', handleGameInput);
            window.removeEventListener('keyup', handleGameInput);
            showInteractiveOptions();
        }
        
        // Prevent scrolling with arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    }
    
    // Add event listeners for the game
    window.addEventListener('keydown', handleGameInput);
    window.addEventListener('keyup', handleGameInput);
    
    // Start the game loop
    gameLoop(game, scoreDisplay);
}

// Create a star at a random position
function createStar(game) {
    const canvas = game.ctx.canvas;
    game.stars.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: Math.random() * (canvas.height - 30) + 15,
        radius: 8,
        color: 'gold',
        rotation: 0
    });
}

// Game loop
function gameLoop(game, scoreDisplay) {
    // Clear canvas
    game.ctx.clearRect(0, 0, game.ctx.canvas.width, game.ctx.canvas.height);
    
    // Handle player movement
    if (game.keysPressed['ArrowUp']) {
        game.player.y = Math.max(game.player.y - game.player.speed, 0);
    }
    if (game.keysPressed['ArrowDown']) {
        game.player.y = Math.min(game.player.y + game.player.speed, game.ctx.canvas.height - game.player.height);
    }
    if (game.keysPressed['ArrowLeft']) {
        game.player.x = Math.max(game.player.x - game.player.speed, 0);
    }
    if (game.keysPressed['ArrowRight']) {
        game.player.x = Math.min(game.player.x + game.player.speed, game.ctx.canvas.width - game.player.width);
    }
    
    // Draw player as a small character
    game.ctx.fillStyle = game.player.color;
    game.ctx.beginPath();
    // Draw body
    game.ctx.fillRect(
        game.player.x, 
        game.player.y, 
        game.player.width, 
        game.player.height
    );
    // Draw eyes
    game.ctx.fillStyle = 'black';
    game.ctx.fillRect(
        game.player.x + 4, 
        game.player.y + 5, 
        3, 
        3
    );
    game.ctx.fillRect(
        game.player.x + 13, 
        game.player.y + 5, 
        3, 
        3
    );
    // Draw smile
    game.ctx.beginPath();
    game.ctx.arc(
        game.player.x + 10, 
        game.player.y + 12, 
        5, 
        0.1 * Math.PI, 
        0.9 * Math.PI
    );
    game.ctx.stroke();
    
    // Draw and check collision with stars
    for (let i = game.stars.length - 1; i >= 0; i--) {
        const star = game.stars[i];
        
        // Update star rotation
        star.rotation += 0.05;
        
        // Draw star
        game.ctx.save();
        game.ctx.translate(star.x, star.y);
        game.ctx.rotate(star.rotation);
        game.ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            game.ctx.lineTo(
                Math.cos((0.2 + 0.4 * j) * Math.PI) * star.radius,
                Math.sin((0.2 + 0.4 * j) * Math.PI) * star.radius
            );
            game.ctx.lineTo(
                Math.cos((0.4 * j) * Math.PI) * star.radius / 2,
                Math.sin((0.4 * j) * Math.PI) * star.radius / 2
            );
        }
        game.ctx.closePath();
        game.ctx.fillStyle = star.color;
        game.ctx.fill();
        game.ctx.restore();
        
        // Check collision
        const dx = star.x - (game.player.x + game.player.width / 2);
        const dy = star.y - (game.player.y + game.player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < star.radius + game.player.width / 2) {
            // Collect star
            game.stars.splice(i, 1);
            game.score++;
            scoreDisplay.textContent = `Score: ${game.score}`;
            
            // Add new star
            createStar(game);
            
            // Flash effect
            game.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            game.ctx.fillRect(0, 0, game.ctx.canvas.width, game.ctx.canvas.height);
            
            // Increase player speed slightly
            if (game.score % 5 === 0) {
                game.player.speed += 0.5;
            }
        }
    }
    
    // Continue the game loop
    game.animationFrame = window.requestAnimationFrame(() => gameLoop(game, scoreDisplay));
}
