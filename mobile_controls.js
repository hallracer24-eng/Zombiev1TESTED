const canvas = document.getElementById('gameCanvas');
const joystick = document.getElementById('joystick');
const fireBtn = document.getElementById('fireBtn');

let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;
let moving = false;
let mobileShoot = false;
const maxJoystickDistance = 50; // joystick radius

// Detect if mobile device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Show/hide mobile controls based on device
if (!isMobile) {
    document.getElementById('mobileControls').style.display = 'none';
} else {
    document.getElementById('mobileControls').style.display = 'flex';
}

// ---- Joystick movement ----
joystick.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchCurrentX = touchStartX;
    touchCurrentY = touchStartY;
    moving = true;
});

joystick.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!moving) return;
    const touch = e.touches[0];
    touchCurrentX = touch.clientX;
    touchCurrentY = touch.clientY;

    // Calculate movement
    const dx = touchCurrentX - touchStartX;
    const dy = touchCurrentY - touchStartY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(dist, maxJoystickDistance);
    const normalizedDx = Math.cos(angle) * (distance / maxJoystickDistance);
    const normalizedDy = Math.sin(angle) * (distance / maxJoystickDistance);

    // Move player proportionally
    if (window.player) {
        player.x += normalizedDx * player.speed * 2;
        player.y += normalizedDy * player.speed * 2;
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
});

joystick.addEventListener('touchend', e => {
    moving = false;
});

// ---- Fire button ----
fireBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    mobileShoot = true;
    shooting = true; // global shooting in script.js
    startShooting();
});
fireBtn.addEventListener('touchend', e => {
    e.preventDefault();
    mobileShoot = false;
    shooting = false;
    clearInterval(shootInterval);
});

// ---- Canvas touch aiming for bullets ----
canvas.addEventListener('touchstart', e => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});
canvas.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});

// Optional: continuously update canvas scaling for mobile
if (isMobile) {
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
} 