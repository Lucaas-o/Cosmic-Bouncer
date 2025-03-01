// Canvas setup
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const width = canvas.width;
const height = canvas.height;

// State variables
let balls = [];
let animationId;
let isPaused = false;
let mouse = { x: width / 2, y: height / 2 };
let speedMultiplier = 1;
let ballCount = 25; // Added ballCount

// FPS variables
let fps = 0;
let lastFrameTime = performance.now();

const attraction = {
    enabled: false,
    distance: 100,
    factor: 0.02
};

const GRAVITY = {
    enabled: false,
    amount: 0.1
};

// Function to generate random numbers
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Function to generate random colors
function randomColor() {
    return `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
}

// Ball constructor
function Ball(x, y, velX, velY, color, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.size = size;

    this.draw = function() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    };

    this.update = function() {
        if (GRAVITY.enabled) this.velY += GRAVITY.amount;

        if (this.x + this.size >= width) this.velX = -Math.abs(this.velX);
        if (this.x - this.size <= 0) this.velX = Math.abs(this.velX);
        if (this.y + this.size >= height) this.velY = -Math.abs(this.velY);
        if (this.y - this.size <= 0) this.velY = Math.abs(this.velY);

        if (attraction.enabled) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < attraction.distance) {
                const force = attraction.factor * (1 - distance / attraction.distance);
                this.velX += dx * force;
                this.velY += dy * force;
            }
        }

        this.x += this.velX * speedMultiplier;
        this.y += this.velY * speedMultiplier;
    };

    this.collisionDetect = function() {
        for (const ball of balls) {
            if (this !== ball) {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.size + ball.size) {
                    ball.color = this.color = randomColor();
                }
            }
        }
    };
}

// Attraction visualization with cursor
const drawAttraction = () => {
    if (!attraction.enabled) return;

    // Draw attraction range (faint circle)
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, attraction.distance, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw cursor circle
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
};

// Draw FPS counter
const drawFPS = () => {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 20);
};

// Animation loop
const loop = () => {
    // Calculate FPS
    const now = performance.now();
    const deltaTime = now - lastFrameTime;
    fps = 1000 / deltaTime; // FPS = 1000ms / time between frames
    lastFrameTime = now;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, width, height);

    // Maintain ball count
    while (balls.length < ballCount) {
        balls.push(new Ball(
            random(0, width),
            random(0, height),
            random(-7, 7),
            random(-7, 7),
            randomColor(),
            random(10, 20)
        ));
    }
    while (balls.length > ballCount) balls.pop();

    // Update and draw balls
    balls.forEach(ball => {
        ball.draw();
        ball.update();
        ball.collisionDetect();
    });

    // Draw attraction and FPS
    drawAttraction();
    drawFPS();

    // Continue loop if not paused
    if (!isPaused) animationId = requestAnimationFrame(loop);
};

// Button click effect
const buttonClickEffect = (btn) => {
    btn.style.backgroundColor = '#555';
    setTimeout(() => btn.style.backgroundColor = '#333', 100);
};

// Event listeners
document.getElementById('pauseResumeBtn').addEventListener('click', (e) => {
    buttonClickEffect(e.target);
    isPaused = !isPaused;
    e.target.textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) loop();
    else cancelAnimationFrame(animationId);
});

document.getElementById('speedBtn').addEventListener('click', (e) => {
    buttonClickEffect(e.target);
    speedMultiplier = speedMultiplier === 1 ? 2 : speedMultiplier === 2 ? 0.5 : 1;
    e.target.textContent = `Speed: ${speedMultiplier}x`;
});

document.getElementById('attractionBtn').addEventListener('click', (e) => {
    buttonClickEffect(e.target);
    attraction.enabled = !attraction.enabled;
    e.target.textContent = `Attraction: ${attraction.enabled ? 'ON' : 'OFF'}`;
    e.target.style.backgroundColor = attraction.enabled ? '#555' : '#333';
    canvas.style.cursor = attraction.enabled ? 'none' : 'default';
});

// Event to detect mouse movement
canvas.addEventListener('mousemove', function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// Start the animation loop
loop();