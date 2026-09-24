// Snake Game Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log("Snake game script loaded");
    
    // Global variables
    let snakeGame = null;
    let snakeCanvas = null;
    let snakeContext = null;
    let gameContainer = null;
    
    // Snake game class
    class SnakeGame {
        constructor(canvas, context) {
            this.canvas = canvas;
            this.context = context;
            this.cellSize = 20;
            this.snake = [{x: 10, y: 10}]; // Start with one segment
            this.direction = 'right';
            this.food = this.generateFood();
            this.score = 0;
            this.gameOver = false;
            this.gameLoopId = null;
            this.lastTime = 0;
            this.speed = 150; // ms per move
            
            // Add border to canvas
            this.canvas.style.border = '4px solid #333';
            this.canvas.style.borderRadius = '8px';
            this.canvas.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            
            // Set up event listeners
            document.addEventListener('keydown', this.handleKeyPress.bind(this));
            
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
            this.score = 0;
            this.snake = [{x: 10, y: 10}];
            this.direction = 'right';
            this.food = this.generateFood();
            this.updateScore();
            this.gameLoop();
        }
        
        gameLoop(timestamp) {
            if (this.gameOver) return;
            
            if (!timestamp) timestamp = 0;
            const elapsed = timestamp - this.lastTime;
            
            if (elapsed > this.speed) {
                this.lastTime = timestamp;
                this.update();
                this.draw();
            }
            
            this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
        }
        
        update() {
            if (this.gameOver) return;
            
            // Calculate new head position
            const head = {...this.snake[0]};
            
            switch(this.direction) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }
            
            // Check for collisions
            if (
                head.x < 0 || 
                head.x >= this.canvas.width / this.cellSize ||
                head.y < 0 || 
                head.y >= this.canvas.height / this.cellSize ||
                this.snake.some(segment => segment.x === head.x && segment.y === head.y)
            ) {
                this.endGame();
                return;
            }
            
            // Add new head
            this.snake.unshift(head);
            
            // Check if food was eaten
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                this.updateScore();
                this.food = this.generateFood();
                
                // Speed up slightly as score increases
                this.speed = Math.max(50, 150 - Math.floor(this.score / 50) * 10);
            } else {
                // Remove tail if no food was eaten
                this.snake.pop();
            }
        }
        
        draw() {
            // Clear canvas
            this.context.fillStyle = '#222';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw border
            this.context.strokeStyle = '#444';
            this.context.lineWidth = 2;
            this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw snake
            this.snake.forEach((segment, index) => {
                // Use different colors for head and body
                if (index === 0) {
                    this.context.fillStyle = '#4CAF50'; // Head color
                } else {
                    // Gradient from head to tail
                    const green = 76 - Math.min(76, index * 3);
                    this.context.fillStyle = `rgb(76, ${175 - index * 5}, ${green})`;
                }
                
                this.context.fillRect(
                    segment.x * this.cellSize, 
                    segment.y * this.cellSize, 
                    this.cellSize, 
                    this.cellSize
                );
                
                // Add inner rectangle for 3D effect
                this.context.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.context.fillRect(
                    segment.x * this.cellSize + 2, 
                    segment.y * this.cellSize + 2, 
                    this.cellSize - 4, 
                    this.cellSize - 4
                );
            });
            
            // Draw food with random color
            const hue = (this.food.colorHue) ? this.food.colorHue : 0;
            this.context.fillStyle = `hsl(${hue}, 100%, 60%)`;
            
            // Draw circular food
            this.context.beginPath();
            this.context.arc(
                this.food.x * this.cellSize + this.cellSize / 2,
                this.food.y * this.cellSize + this.cellSize / 2,
                this.cellSize / 2,
                0,
                Math.PI * 2
            );
            this.context.fill();
            
            // Add shine to food
            this.context.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.context.beginPath();
            this.context.arc(
                this.food.x * this.cellSize + this.cellSize / 3,
                this.food.y * this.cellSize + this.cellSize / 3,
                this.cellSize / 6,
                0,
                Math.PI * 2
            );
            this.context.fill();
        }
        
        generateFood() {
            // Generate food at random position (not on snake)
            let position;
            do {
                position = {
                    x: Math.floor(Math.random() * (this.canvas.width / this.cellSize)),
                    y: Math.floor(Math.random() * (this.canvas.height / this.cellSize)),
                    colorHue: Math.floor(Math.random() * 360) // Random color
                };
            } while (this.snake.some(segment => segment.x === position.x && segment.y === position.y));
            
            return position;
        }
        
        handleKeyPress(event) {
            // Change direction based on arrow keys
            switch(event.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    event.preventDefault();
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    event.preventDefault();
                    break;
                case 'r':
                case 'R':
                    if (this.gameOver) this.start();
                    break;
            }
        }
        
        updateScore() {
            this.scoreDisplay.textContent = `Score: ${this.score}`;
        }
        
        endGame() {
            this.gameOver = true;
            cancelAnimationFrame(this.gameLoopId);
            
            // Display game over message
            this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.context.fillStyle = '#fff';
            this.context.font = '30px Arial';
            this.context.textAlign = 'center';
            this.context.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.context.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.context.font = '20px Arial';
            this.context.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
            
            // Increase friendship level if score is good
            if (this.score >= 50) {
                increaseFriendshipLevel(10);
            } else if (this.score >= 20) {
                increaseFriendshipLevel(5);
            }
        }
    }
    
    // Function to start the snake game
    window.startSnakeGame = function() {
        // Remove any existing game
        if (gameContainer) {
            gameContainer.remove();
        }
        
        // Create game container
        gameContainer = document.createElement('div');
        gameContainer.id = 'snake-game-container';
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
        snakeCanvas = document.createElement('canvas');
        snakeCanvas.width = 400;
        snakeCanvas.height = 400;
        snakeCanvas.style.display = 'block';
        
        // Create controls guide
        const controls = document.createElement('div');
        controls.innerHTML = 'Use arrow keys to move. Press R to restart after game over.';
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
        gameContainer.appendChild(snakeCanvas);
        gameContainer.appendChild(controls);
        document.body.appendChild(gameContainer);
        
        // Initialize game
        snakeContext = snakeCanvas.getContext('2d');
        snakeGame = new SnakeGame(snakeCanvas, snakeContext);
    };
});
