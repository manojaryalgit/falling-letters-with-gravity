const canvas = document.getElementById('fallingLetters');
const ctx = canvas.getContext('2d');
let letters = [];
const gravity = 9.8;  // Gravity constant in m/s²
const density = 1;    // Density of water (for simplicity, we consider all letters with similar properties)
let width, height;

// Handle resizing of the canvas
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Define the Letter class
class Letter {
    constructor(letter) {
        this.char = letter;
        this.size = Math.random() * 30 + 10;  // Random size between 10 and 40
        this.x = Math.random() * width;
        this.y = -this.size;  // Start above the canvas
        this.vy = Math.random() * 2 + 2;  // Random fall speed between 2 and 4
        this.vx = Math.random() * 1 - 0.5;  // Random horizontal speed
        this.density = density;  // Default density, can be customized per letter
        this.color = `hsl(${Math.random() * 360}, 100%, 80%)`;  // Random color for each letter
    }

    // Update the letter's position based on velocity and gravity
    update() {
        this.vy += gravity * 0.02;  // Apply gravity to vertical velocity
        this.x += this.vx;
        this.y += this.vy;

        // Handle collision with ground
        if (this.y + this.size > height) {
            this.y = height - this.size;
            this.vy *= -0.8;  // Bounce effect with reduced velocity
        }

        // Handle collision with screen boundaries
        if (this.x < 0 || this.x + this.size > width) {
            this.vx *= -0.8;  // Reverse direction with reduced velocity
        }

        // Handle collision with other letters
        for (let other of letters) {
            if (other !== this && this.collidesWith(other)) {
                this.resolveCollision(other);
            }
        }
    }

    // Draw the letter on the canvas
    draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.char, this.x, this.y);
    }

    // Check for collision with another letter
    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size / 2 + other.size / 2);
    }

    // Resolve collision with another letter
    resolveCollision(other) {
        // Get the vector from this letter to the other letter
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only resolve the collision if the letters are colliding
        if (distance < (this.size / 2 + other.size / 2)) {
            // Calculate the angle of collision
            const angle = Math.atan2(dy, dx);

            // Calculate the velocities along the normal (line connecting centers of the letters)
            const thisSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const otherSpeed = Math.sqrt(other.vx * other.vx + other.vy * other.vy);

            // Calculate the normal and tangent components of the velocity
            const normalX = dx / distance;
            const normalY = dy / distance;

            // Normal velocity components for each letter
            const thisVelocityNormal = this.vx * normalX + this.vy * normalY;
            const otherVelocityNormal = other.vx * normalX + other.vy * normalY;

            // Reflect the velocities using the elastic collision formula
            const totalVelocity = thisVelocityNormal - otherVelocityNormal;

            // Update the velocities of the letters
            this.vx -= totalVelocity * normalX;
            this.vy -= totalVelocity * normalY;
            other.vx += totalVelocity * normalX;
            other.vy += totalVelocity * normalY;

            // Prevent letters from overlapping by repositioning them
            const overlap = (this.size / 2 + other.size / 2) - distance;
            const correctionFactor = overlap / 2;
            
            // Move both letters out of overlap
            this.x += normalX * correctionFactor;
            this.y += normalY * correctionFactor;
            other.x -= normalX * correctionFactor;
            other.y -= normalY * correctionFactor;
        }
    }
}

// Create random letters to fall
function generateLetters() {
    const lettersArray = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomLetter = lettersArray[Math.floor(Math.random() * lettersArray.length)];
    const letter = new Letter(randomLetter);
    letters.push(letter);
}

// Main animation loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Generate new letters at random intervals
    if (Math.random() < 0.02) {
        generateLetters();
    }

    // Update and draw all letters
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        letter.update();
        letter.draw();

        // Remove letters that have fallen off the screen
        if (letter.y > height) {
            letters.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(animate);
}

animate();
