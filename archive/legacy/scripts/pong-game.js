// Pong Game Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log("Pong game script loaded");
    
    // Global variables
    let pongGame = null;
    let pongCanvas = null;
    let pongContext = null;
    let gameContainer = null;
    
    // Pong game class
    class PongGame {
        constructor(canvas, context) {
            this.canvas = canvas;
            this.context = context;
            this.width = canvas.width;
            this.height = canvas.height;
            
            // Game elements
            this.paddleWidth = 15;
            this.paddleHeight = 80;
            this.ballSize = 10;
            
            // Player paddle (left)
            this.playerPaddle = {
                x: 20,
                y: this.height / 2 - this.paddleHeight / 2,
                width: this.paddleWidth,
                height: this.paddleHeight,
                color: '#4CAF50',
                speed: 8,
                score: 0
            };
            
            // Computer paddle (right)
            this.computerPaddle = {
                x: this.width - 20 - this.paddleWidth,
                y: this.height / 2 - this.paddleHeight / 2,
                width: this.paddleWidth,
                height: this.paddleHeight,
                color: '#F44336',
                speed: 5,
                score: 0
            };
            
            // Ball
            this.ball = {
                x: this.width / 2,
                y: this.height / 2,
                size: this.ballSize,
                speedX: 5,
                speedY: 5,
                color: '#FFFFFF',
                hue: 0 // For color animation
            };
            
            // Game state
            this.gameOver = false;
            this.maxScore = 5; // Game ends when a player reaches this score
            this.gameLoopId = null;
            
            // Controls
            this.keys = {
                up: false,
                down: false
            };
            
            // Add border to canvas
            this.canvas.style.border = '4px solid #333';
            this.canvas.style.borderRadius = '8px';
            this.canvas.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            
            // Set up event listeners
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            document.addEventListener('keyup', this.handleKeyUp.bind(this));
            this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
            
            // Create score display
            this.scoreDisplay = document.createElement('div');
            this.scoreDisplay.style.fontSize = '24px';
            this.scoreDisplay.style.fontWeight = 'bold';
            this.scoreDisplay.style.marginBottom = '10px';
            this.scoreDisplay.style.textAlign = 'center';
            this.scoreDisplay.style.color = '#fff';
            this.scoreDisplay.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
            this.canvas.parentNode.insertBefore(this.scoreDisplay, this.canvas);
            
            // Start game
            this.start();
        }
        
        start() {
            this.gameOver = false;
            this.playerPaddle.score = 0;
            this.computerPaddle.score = 0;
            this.resetBall();
            this.updateScore();
            this.gameLoop();
        }
        
        resetBall() {
            this.ball.x = this.width / 2;
            this.ball.y = this.height / 2;
            
            // Randomize ball direction
            this.ball.speedX = Math.random() > 0.5 ? 5 : -5;
            this.ball.speedY = Math.random() > 0.5 ? 5 : -5;
        }
        
        gameLoop() {
            if (this.gameOver) return;
            
            this.update();
            this.draw();
            
            this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
        }
        
        update() {
            if (this.gameOver) return;
            
            // Update player paddle based on keys
            if (this.keys.up) {
                this.playerPaddle.y = Math.max(0, this.playerPaddle.y - this.playerPaddle.speed);
            }
            if (this.keys.down) {
                this.playerPaddle.y = Math.min(this.height - this.playerPaddle.height, this.playerPaddle.y + this.playerPaddle.speed);
            }
            
            // Update computer paddle (simple AI)
            const computerCenter = this.computerPaddle.y + this.computerPaddle.height / 2;
            const ballCenter = this.ball.y;
            
            // Only move if the ball is moving towards the computer
            if (this.ball.speedX > 0) {
                if (computerCenter < ballCenter - 10) {
                    this.computerPaddle.y += this.computerPaddle.speed;
                } else if (computerCenter > ballCenter + 10) {
                    this.computerPaddle.y -= this.computerPaddle.speed;
                }
                
                // Keep paddle within canvas
                this.computerPaddle.y = Math.max(0, Math.min(this.height - this.computerPaddle.height, this.computerPaddle.y));
            }
            
            // Update ball position
            this.ball.x += this.ball.speedX;
            this.ball.y += this.ball.speedY;
            
            // Ball collision with top and bottom walls
            if (this.ball.y <= 0 || this.ball.y >= this.height - this.ball.size) {
                this.ball.speedY = -this.ball.speedY;
            }
            
            // Ball collision with paddles
            if (this.ball.speedX < 0 && 
                this.ball.x <= this.playerPaddle.x + this.playerPaddle.width &&
                this.ball.y >= this.playerPaddle.y && 
                this.ball.y <= this.playerPaddle.y + this.playerPaddle.height) {
                // Hit player paddle
                this.ball.speedX = -this.ball.speedX;
                this.ball.hue = (this.ball.hue + 30) % 360; // Change color
                
                // Adjust angle based on where the ball hits the paddle
                const hitPosition = (this.ball.y - this.playerPaddle.y) / this.playerPaddle.height;
                this.ball.speedY = 10 * (hitPosition - 0.5);
            }
            
            if (this.ball.speedX > 0 && 
                this.ball.x >= this.computerPaddle.x - this.ball.size &&
                this.ball.y >= this.computerPaddle.y && 
                this.ball.y <= this.computerPaddle.y + this.computerPaddle.height) {
                // Hit computer paddle
                this.ball.speedX = -this.ball.speedX;
                this.ball.hue = (this.ball.hue + 30) % 360; // Change color
                
                // Adjust angle based on where the ball hits the paddle
                const hitPosition = (this.ball.y - this.computerPaddle.y) / this.computerPaddle.height;
                this.ball.speedY = 10 * (hitPosition - 0.5);
            }
            
            // Ball goes out of bounds
            if (this.ball.x <= 0) {
                // Computer scores
                this.computerPaddle.score++;
                this.updateScore();
                this.resetBall();
            }
            
            if (this.ball.x >= this.width) {
                // Player scores
                this.playerPaddle.score++;
                this.updateScore();
                this.resetBall();
            }
            
            // Check for game over
            if (this.playerPaddle.score >= this.maxScore || this.computerPaddle.score >= this.maxScore) {
                this.endGame();
            }
        }
        
        draw() {
            // Clear canvas
            this.context.fillStyle = '#222';
            this.context.fillRect(0, 0, this.width, this.height);
            
            // Draw center line
            this.context.strokeStyle = '#444';
            this.context.setLineDash([10, 10]);
            this.context.beginPath();
            this.context.moveTo(this.width / 2, 0);
            this.context.lineTo(this.width / 2, this.height);
            this.context.stroke();
            this.context.setLineDash([]);
            
            // Draw player paddle
            this.context.fillStyle = this.playerPaddle.color;
            this.context.fillRect(
                this.playerPaddle.x, 
                this.playerPaddle.y, 
                this.playerPaddle.width, 
                this.playerPaddle.height
            );
            
            // Add inner highlight to player paddle
            this.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.context.fillRect(
                this.playerPaddle.x + 2, 
                this.playerPaddle.y + 2, 
                this.playerPaddle.width - 4, 
                this.playerPaddle.height / 2
            );
            
            // Draw computer paddle
            this.context.fillStyle = this.computerPaddle.color;
            this.context.fillRect(
                this.computerPaddle.x, 
                this.computerPaddle.y, 
                this.computerPaddle.width, 
                this.computerPaddle.height
            );
            
            // Add inner highlight to computer paddle
            this.context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.context.fillRect(
                this.computerPaddle.x + 2, 
                this.computerPaddle.y + 2, 
                this.computerPaddle.width - 4, 
                this.computerPaddle.height / 2
            );
            
            // Draw ball with color animation
            this.context.fillStyle = `hsl(${this.ball.hue}, 100%, 60%)`;
            this.context.beginPath();
            this.context.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
            this.context.fill();
            
            // Add shine to ball
            this.context.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.context.beginPath();
            this.context.arc(
                this.ball.x - this.ball.size / 3,
                this.ball.y - this.ball.size / 3,
                this.ball.size / 3,
                0,
                Math.PI * 2
            );
            this.context.fill();
        }
        
        handleKeyDown(event) {
            switch(event.key) {
                case 'ArrowUp':
                    this.keys.up = true;
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    this.keys.down = true;
                    event.preventDefault();
                    break;
                case 'r':
                case 'R':
                    if (this.gameOver) this.start();
                    break;
            }
        }
        
        handleKeyUp(event) {
            switch(event.key) {
                case 'ArrowUp':
                    this.keys.up = false;
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    this.keys.down = false;
                    event.preventDefault();
                    break;
            }
        }
        
        handleMouseMove(event) {
            // Get mouse position relative to canvas
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = event.clientY - rect.top;
            
            // Move paddle to mouse position
            const paddleCenter = this.playerPaddle.height / 2;
            this.playerPaddle.y = Math.max(0, Math.min(this.height - this.playerPaddle.height, mouseY - paddleCenter));
        }
        
        updateScore() {
            this.scoreDisplay.textContent = `${this.playerPaddle.score} : ${this.computerPaddle.score}`;
        }
        
        endGame() {
            this.gameOver = true;
            cancelAnimationFrame(this.gameLoopId);
            
            // Display game over message
            this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.context.fillRect(0, 0, this.width, this.height);
            
            this.context.fillStyle = '#fff';
            this.context.font = '30px Arial';
            this.context.textAlign = 'center';
            
            if (this.playerPaddle.score > this.computerPaddle.score) {
                this.context.fillText('You Win!', this.width / 2, this.height / 2 - 30);
                
                // Increase friendship level if player wins
                if (typeof window.increaseFriendshipLevel === 'function') {
                    window.increaseFriendshipLevel(10);
                }
            } else {
                this.context.fillText('Computer Wins!', this.width / 2, this.height / 2 - 30);
                
                // Small friendship increase for playing
                if (typeof window.increaseFriendshipLevel === 'function') {
                    window.increaseFriendshipLevel(3);
                }
            }
            
            this.context.fillText(`Final Score: ${this.playerPaddle.score} - ${this.computerPaddle.score}`, this.width / 2, this.height / 2 + 10);
            this.context.font = '20px Arial';
            this.context.fillText('Press R to restart', this.width / 2, this.height / 2 + 50);
        }
    }
    
    // Function to start the pong game
    window.startPongGame = function() {
        // Remove any existing game
        if (gameContainer) {
            gameContainer.remove();
        }
        
        // Create game container
        gameContainer = document.createElement('div');
        gameContainer.id = 'pong-game-container';
        gameContainer.className = 'game-container';
        gameContainer.style.position = 'fixed'; // Changed from absolute to fixed
        gameContainer.style.top = '50%';
        gameContainer.style.left = '50%';
        gameContainer.style.transform = 'translate(-50%, -50%)';
        gameContainer.style.backgroundColor = '#333';
        gameContainer.style.padding = '20px';
        gameContainer.style.borderRadius = '10px';
        gameContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
        gameContainer.style.zIndex = '10001'; // Increased z-index
        
        // Create canvas
        pongCanvas = document.createElement('canvas');
        pongCanvas.width = 400;
        pongCanvas.height = 300;
        pongCanvas.style.display = 'block';
        
        // Create controls guide
        const controls = document.createElement('div');
        controls.innerHTML = 'Use mouse or arrow keys to move paddle. Press R to restart after game over.';
        controls.style.color = '#fff';
        controls.style.textAlign = 'center';
        controls.style.marginTop = '10px';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.color = '#fff';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function() {
            gameContainer.remove();
            gameContainer = null;
        };
        
        // Append elements
        gameContainer.appendChild(closeButton);
        gameContainer.appendChild(pongCanvas);
        gameContainer.appendChild(controls);
        document.body.appendChild(gameContainer);
        
        // Initialize game
        pongContext = pongCanvas.getContext('2d');
        pongGame = new PongGame(pongCanvas, pongContext);
    };
});
