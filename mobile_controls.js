const canvas = document.getElementById('gameCanvas');
const joystick = document.getElementById('joystick');
const fireBtn = document.getElementById('fireBtn');

let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;
let moving = false;
let mobileShoot = false;

const maxJoystickDistance = 50; // radius of joystick movement

// Listen for joystick touch events
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

    // Calculate movement direction
    const dx = touchCurrentX - touchStartX;
    const dy = touchCurrentY - touchStartY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Normalize speed if moved beyond joystick max radius
    const distance = Math.min(dist, maxJoystickDistance);
    const normalizedDx = Math.cos(angle) * (distance / maxJoystickDistance);
    const normalizedDy = Math.sin(angle) * (distance / maxJoystickDistance);

    // Update player position proportionally
    if (window.player) {
        player.x += normalizedDx * player.speed * 2;
        player.y += normalizedDy * player.speed * 2;

        // Keep player inside canvas bounds
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
});

joystick.addEventListener('touchend', e => {
    moving = false;
});

// Fire button touch events
fireBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    mobileShoot = true;
    shooting = true; // global shooting used in script.js
    startShooting(); // same function in script.js
});

fireBtn.addEventListener('touchend', e => {
    e.preventDefault();
    mobileShoot = false;
    shooting = false;
    clearInterval(shootInterval); // stop shooting interval
});

// Optional: allow continuous shooting even while moving joystick
// Shooting direction uses last touch on canvas
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