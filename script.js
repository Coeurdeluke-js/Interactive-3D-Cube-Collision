// Select DOM elements
const ball = document.querySelector('.ball');
const cube = document.querySelector('.cube');
const faces = document.querySelectorAll('.face');
const scene = document.querySelector('.scene');

// Add edge gradient elements to the DOM
function createEdgeGradients() {
    const edgePositions = ['left', 'right', 'top', 'bottom'];
    
    edgePositions.forEach(position => {
        const edgeElement = document.createElement('div');
        edgeElement.className = `edge-gradient ${position}`;
        document.body.appendChild(edgeElement);
    });
}

// Create edge gradients
createEdgeGradients();

// Get edge gradient elements
const leftEdge = document.querySelector('.edge-gradient.left');
const rightEdge = document.querySelector('.edge-gradient.right');
const topEdge = document.querySelector('.edge-gradient.top');
const bottomEdge = document.querySelector('.edge-gradient.bottom');

// Dynamic sizing based on viewport
function updateCubeSize() {
    let baseSize;
    if (window.innerWidth <= 480) {
        baseSize = 200;
    } else if (window.innerWidth <= 768) {
        baseSize = 250;
    } else {
        baseSize = 300;
    }
    
    // Update global cubeSize
    cubeSize = baseSize;
    halfSize = baseSize / 2;
    
    // Adjust ball radius proportionally
    ballRadius = baseSize * 0.05;
    ball.style.width = `${ballRadius * 2}px`;
    ball.style.height = `${ballRadius * 2}px`;
    
    // Reset ball position if outside bounds
    if (Math.abs(x) > halfSize - ballRadius) x = 0;
    if (Math.abs(y) > halfSize - ballRadius) y = 0;
    if (Math.abs(z) > halfSize - ballRadius) z = 0;
}

// Ball position and velocity
let x = 0;
let y = 0;
let z = 0;
let vx = 3;
let vy = 2;
let vz = 2.5;

// Cube dimensions - will be updated by updateCubeSize()
let cubeSize = 300;
let halfSize = cubeSize / 2;
let ballRadius = 15;

// Update dimensions on load
updateCubeSize();

// Cube rotation
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotateX = -30;
let rotateY = 45;

// Last delta values for movement direction
let lastDeltaX = 0;
let lastDeltaY = 0;

// Function to show edge gradients based on rotation direction
function showEdgeGradients(deltaX, deltaY) {
    // Store the last deltas for animation frame use
    lastDeltaX = deltaX;
    lastDeltaY = deltaY;
    
    // Set opacity based on movement strength (normalize to 0-1 range)
    const maxDelta = 10; // Threshold for max effect
    
    // Horizontal movement (affects left/right edges)
    if (deltaX > 0) {
        // Moving right, highlight left edge
        leftEdge.style.opacity = Math.min(Math.abs(deltaX) / maxDelta, 0.8);
        rightEdge.style.opacity = 0;
    } else if (deltaX < 0) {
        // Moving left, highlight right edge
        rightEdge.style.opacity = Math.min(Math.abs(deltaX) / maxDelta, 0.8);
        leftEdge.style.opacity = 0;
    }
    
    // Vertical movement (affects top/bottom edges)
    if (deltaY > 0) {
        // Moving down, highlight top edge
        topEdge.style.opacity = Math.min(Math.abs(deltaY) / maxDelta, 0.8);
        bottomEdge.style.opacity = 0;
    } else if (deltaY < 0) {
        // Moving up, highlight bottom edge
        bottomEdge.style.opacity = Math.min(Math.abs(deltaY) / maxDelta, 0.8);
        topEdge.style.opacity = 0;
    }
    
    // Automatically fade out gradients after movement stops
    clearTimeout(window.gradientTimeout);
    window.gradientTimeout = setTimeout(() => {
        leftEdge.style.opacity = 0;
        rightEdge.style.opacity = 0;
        topEdge.style.opacity = 0;
        bottomEdge.style.opacity = 0;
    }, 300);
}

// Correctly map axes to faces
const faceIndices = {
    'z+': 0, // front
    'z-': 1, // back
    'x+': 2, // right
    'x-': 3, // left
    'y-': 4, // top (negative y is up in 3D space)
    'y+': 5  // bottom
};

// Flag to prevent collision effects from triggering too rapidly
let collisionCooldown = false;

// Function to create a collision effect
function createCollisionEffect(faceIndex) {
    // Prevent collision effects during cooldown
    if (collisionCooldown) return;
    collisionCooldown = true;
    
    // Apply collision effect to the ball
    ball.classList.add('collision');
    
    // Apply collision effect to the face
    if (faceIndex >= 0 && faceIndex < faces.length) {
        faces[faceIndex].classList.add('collision');
    }
    
    // Remove collision effects after a delay
    setTimeout(() => {
        clearCollisionEffects();
        // Reset cooldown after a bit longer to prevent rapid triggers
        setTimeout(() => {
            collisionCooldown = false;
        }, 50);
    }, 200);
}

// Function to clear all collision effects
function clearCollisionEffects() {
    ball.classList.remove('collision');
    faces.forEach(face => face.classList.remove('collision'));
}

// Animation function
function animate() {
    // Store previous position to detect which face was hit
    const prevX = x;
    const prevY = y;
    const prevZ = z;
    
    // Update position with scaled velocity based on cube size
    const velocityScale = cubeSize / 300;
    x += vx * velocityScale;
    y += vy * velocityScale;
    z += vz * velocityScale;
    
    let collisionDetected = false;
    let hitFaceIndex = -1;
    
    // X-axis collisions (right/left faces)
    if (Math.abs(x) > halfSize - ballRadius) {
        vx = -vx;
        x = Math.sign(x) * (halfSize - ballRadius);
        
        // Determine which face was hit
        hitFaceIndex = (x > 0) ? faceIndices['x+'] : faceIndices['x-'];
        collisionDetected = true;
    }
    
    // Y-axis collisions (top/bottom faces)
    if (Math.abs(y) > halfSize - ballRadius) {
        vy = -vy;
        y = Math.sign(y) * (halfSize - ballRadius);
        
        // Determine which face was hit
        hitFaceIndex = (y > 0) ? faceIndices['y+'] : faceIndices['y-'];
        collisionDetected = true;
    }
    
    // Z-axis collisions (front/back faces)
    if (Math.abs(z) > halfSize - ballRadius) {
        vz = -vz;
        z = Math.sign(z) * (halfSize - ballRadius);
        
        // Determine which face was hit
        hitFaceIndex = (z > 0) ? faceIndices['z+'] : faceIndices['z-'];
        collisionDetected = true;
    }
    
    // Apply visual effect if collision occurred
    if (collisionDetected) {
        createCollisionEffect(hitFaceIndex);
    }
    
    // Update ball position using translate3d for better performance
    ball.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    
    // Update cube rotation - SIMPLIFIED to ensure it works
    cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Gradually fade edge gradients if we're not actively dragging
    if (!isDragging && (lastDeltaX !== 0 || lastDeltaY !== 0)) {
        // Apply a decay factor
        const decay = 0.95;
        lastDeltaX *= decay;
        lastDeltaY *= decay;
        
        // If movement is minimal, set to zero
        if (Math.abs(lastDeltaX) < 0.1) lastDeltaX = 0;
        if (Math.abs(lastDeltaY) < 0.1) lastDeltaY = 0;
        
        // Update gradients with decaying values
        showEdgeGradients(lastDeltaX, lastDeltaY);
    }
    
    requestAnimationFrame(animate);
}

// Start animation
animate();

// Fix mouse event handlers for cube rotation
cube.addEventListener('mousedown', function(e) {
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
    cube.classList.add('grabbing');
    e.preventDefault();
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    cube.classList.remove('grabbing');
});

document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    // Calculate sensitivity based on screen size
    const sensitivity = window.innerWidth <= 480 ? 0.7 : 0.5;
    
    const deltaX = e.clientX - previousMouseX;
    const deltaY = e.clientY - previousMouseY;
    
    rotateY += deltaX * sensitivity;
    rotateX -= deltaY * sensitivity;
    
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
    
    // Show edge gradients based on rotation direction
    showEdgeGradients(deltaX, deltaY);
});

// Fix touch event handlers
cube.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
        cube.classList.add('grabbing');
        e.preventDefault();
    }
});

document.addEventListener('touchend', function() {
    isDragging = false;
    cube.classList.remove('grabbing');
});

document.addEventListener('touchmove', function(e) {
    if (!isDragging || e.touches.length !== 1) return;
    
    // Calculate sensitivity based on screen size
    const sensitivity = window.innerWidth <= 480 ? 0.8 : 0.6;
    
    const deltaX = e.touches[0].clientX - previousMouseX;
    const deltaY = e.touches[0].clientY - previousMouseY;
    
    rotateY += deltaX * sensitivity;
    rotateX -= deltaY * sensitivity;
    
    previousMouseX = e.touches[0].clientX;
    previousMouseY = e.touches[0].clientY;
    
    // Show edge gradients based on rotation direction
    showEdgeGradients(deltaX, deltaY);
    
    e.preventDefault();
});

// Handle window resize for responsiveness
window.addEventListener('resize', function() {
    updateCubeSize();
});

// Apply initial size update
updateCubeSize();