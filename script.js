const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const healthUI = document.getElementById('health');
const scoreUI = document.getElementById('score');
const roundUI = document.getElementById('roundNum');
const bossIndicator = document.getElementById('bossIndicator');

const mainMenu = document.getElementById('mainMenu');
const startBtn = document.getElementById('startBtn');

const gameOverMenu = document.getElementById('gameOverMenu');
const restartBtn = document.getElementById('restartBtn');
const mainMenuBtn = document.getElementById('mainMenuBtn');
const quitBtn = document.getElementById('quitBtn');

const highScoreGameOverUI = document.getElementById('highScoreGameOver');
const lastRoundGameOverUI = document.getElementById('lastRoundGameOver');

let player, zombies, bullets, score, floor, keys;
let gameRunning = false;
let highScore = 0;
let spawnInterval;
let zombiesRemaining = 0;
let round = 1;
let bossHealth = 50;
let bossAlive = false;

let shooting = false;
let shootInterval;
let mouseX = 0, mouseY = 0;
let touchX = null, touchY = null;

const playerImg = new Image(); playerImg.src = 'assets/player.png';
const zombieImg = new Image(); zombieImg.src = 'assets/zombie.png';
const zombieBossImg = new Image(); zombieBossImg.src = 'assets/zombie_boss.png';
const stairsUpImg = new Image(); stairsUpImg.src = 'assets/stairs_up.png';
const stairsDownImg = new Image(); stairsDownImg.src = 'assets/stairs_down.png';

const floors = [
  { name:"FLOOR 1", type:"checkered", color1:'#333', color2:'#444', baseZombies:5, stairs:[{img: stairsUpImg, x:700, y:250, width:50, height:100}] },
  { name:"FLOOR 2", type:"checkered", color1:'#333', color2:'#444', baseZombies:7, stairs:[{img: stairsDownImg, x:50, y:50, width:50, height:100},{img: stairsUpImg, x:700, y:450, width:50, height:100}] },
  { name:"FLOOR 3", type:"checkered", color1:'#333', color2:'#444', baseZombies:10, stairs:[{img: stairsDownImg, x:50, y:500, width:50, height:100}] }
];

keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', e => { shooting = true; startShooting(); });
canvas.addEventListener('mouseup', e => { shooting = false; clearInterval(shootInterval); });

canvas.addEventListener('touchstart', e => {
    shooting = true;
    const rect = canvas.getBoundingClientRect();
    touchX = e.touches[0].clientX - rect.left;
    touchY = e.touches[0].clientY - rect.top;
    startShooting();
});
canvas.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    touchX = e.touches[0].clientX - rect.left;
    touchY = e.touches[0].clientY - rect.top;
});
canvas.addEventListener('touchend', e => { shooting = false; clearInterval(shootInterval); touchX=null; touchY=null; });

function startShooting(){
    if(shootInterval) clearInterval(shootInterval);
    shootInterval = setInterval(()=>{
        if(!shooting || !gameRunning) return;

        let targetX = touchX !== null ? touchX : mouseX;
        let targetY = touchY !== null ? touchY : mouseY;

        const angle = Math.atan2(targetY - (player.y + player.height/2), targetX - (player.x + player.width/2));

        bullets.push({
            x: player.x + player.width/2,
            y: player.y + player.height/2,
            dx: Math.cos(angle)*8,
            dy: Math.sin(angle)*8,
            radius: 5
        });
    }, 150);
}

function drawFloor(){
    const f = floors[floor];
    const tileSize = 50;
    for(let y=0;y<canvas.height;y+=tileSize){
        for(let x=0;x<canvas.width;x+=tileSize){
            ctx.fillStyle = ((x/tileSize + y/tileSize)%2===0) ? f.color1 : f.color2;
            ctx.fillRect(x,y,tileSize,tileSize);
        }
    }
    ctx.fillStyle='red';
    ctx.font='48px Arial';
    ctx.fillText(f.name, 50,50);

    f.stairs.forEach(stair => ctx.drawImage(stair.img, stair.x, stair.y, stair.width, stair.height));
}

function spawnZombie(){
    if(round % 5 === 0 && !bossAlive){
        bossAlive = true;
        bossIndicator.innerText = 'BOSS INCOMING';
        bossIndicator.style.display='block';
        setTimeout(()=>{ bossIndicator.style.display='none'; },2000);
        zombies.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, width:80, height:80, speed:1, health:bossHealth, isBoss:true});
        return;
    }

    const edge = Math.floor(Math.random()*4);
    let x,y;
    switch(edge){
        case 0: x=0; y=Math.random()*canvas.height; break;
        case 1: x=canvas.width; y=Math.random()*canvas.height; break;
        case 2: x=Math.random()*canvas.width; y=0; break;
        case 3: x=Math.random()*canvas.width; y=canvas.height; break;
    }
    zombies.push({x,y,width:50,height:50,speed:1+Math.random()*1.5});
}

function startFloor(){
    player.health = 100;
    bullets=[];
    zombies=[];
    bossAlive = false;
    const f = floors[floor];

    zombiesRemaining = f.baseZombies + round;

    clearInterval(spawnInterval);
    spawnInterval = setInterval(()=>{
        if(zombiesRemaining<=0){ clearInterval(spawnInterval); return; }
        spawnZombie();
        zombiesRemaining--;
    }, 500);
}

function drawPlayerHealth(){
    const barWidth = player.width;
    const barHeight = 6;
    const x = player.x;
    const y = player.y - 10;
    ctx.fillStyle = '#555';
    ctx.fillRect(x,y,barWidth,barHeight);
    const healthWidth = barWidth*(player.health/100);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x,y,healthWidth,barHeight);
    if(player.health<30){ ctx.fillStyle='rgba(255,0,0,0.5)'; ctx.fillRect(x,y,healthWidth,barHeight); }
}

function rectCollision(a,b){ return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y; }

function updateGame(){
    if(!gameRunning) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawFloor();
    const f = floors[floor];

    if(keys['w'] || keys['ArrowUp']) player.y = Math.max(0, player.y - player.speed);
    if(keys['s'] || keys['ArrowDown']) player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    if(keys['a'] || keys['ArrowLeft']) player.x = Math.max(0, player.x - player.speed);
    if(keys['d'] || keys['ArrowRight']) player.x = Math.min(canvas.width - player.width, player.x + player.speed);

    f.stairs.forEach(stair => {
        if(rectCollision(player, stair)){
            if(stair.img===stairsUpImg && floor<2){ floor++; startFloor(); }
            if(stair.img===stairsDownImg && floor>0){ floor--; startFloor(); }
        }
    });

    ctx.drawImage(playerImg,player.x,player.y,player.width,player.height);

    drawPlayerHealth();

    bullets.forEach((b,i)=>{
        b.x+=b.dx; b.y+=b.dy;
        ctx.fillStyle='cyan';
        ctx.beginPath();
        ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);
        ctx.fill();
        if(b.x<0||b.x>canvas.width||b.y<0||b.y>canvas.height) bullets.splice(i,1);
    });

    zombies.forEach((z,zi)=>{
        const dx=player.x-z.x, dy=player.y-z.y, dist=Math.hypot(dx,dy);
        z.x+=(dx/dist)*z.speed; z.y+=(dy/dist)*z.speed;

        if(z.isBoss){
            ctx.drawImage(zombieBossImg,z.x,z.y,z.width,z.height);
            ctx.fillStyle='#555'; ctx.fillRect(z.x,z.y-10,z.width,8);
            ctx.fillStyle='#f00'; ctx.fillRect(z.x,z.y-10,z.width*(z.health/bossHealth),8);
        } else { ctx.drawImage(zombieImg,z.x,z.y,z.width,z.height); }

        if(rectCollision(player,z)) player.health -= z.isBoss ? 1 : 0.5;

        bullets.forEach((b,bi)=>{
            if(b.x>z.x && b.x<z.x+z.width && b.y>z.y && b.y<z.y+z.height){
                bullets.splice(bi,1);
                if(z.isBoss){
                    z.health -=5;
                    if(z.health<=0){ zombies.splice(zi,1); bossAlive=false; bossHealth +=20; score+=50; }
                } else { zombies.splice(zi,1); score+=10; }
            }
        });
    });

    if(zombies.length === 0 && zombiesRemaining <=0){
        round++;
        startFloor();
    }

    healthUI.innerText=Math.max(0,Math.floor(player.health));
    scoreUI.innerText=score;
    roundUI.innerText=round;

    if(player.health<=0){ gameRunning=false; showGameOver(); return; }

    requestAnimationFrame(updateGame);
}

function showMainMenu(){ mainMenu.style.display='flex'; gameOverMenu.style.display='none'; }

function startGame(){
    mainMenu.style.display='none'; gameOverMenu.style.display='none';
    player={x:100,y:canvas.height/2-25,width:50,height:50,speed:4,health:100};
    bullets=[]; zombies=[]; score=0; floor=0; round=1; bossHealth=50; bossAlive=false;
    gameRunning=true; startFloor(); updateGame();
}

function showGameOver(){
    gameOverMenu.style.display='flex';
    if(score>highScore) highScore=score;
    highScoreGameOverUI.innerText=highScore;
    lastRoundGameOverUI.innerText=round;
}

startBtn.addEventListener('click',()=>startGame());
restartBtn.addEventListener('click',()=>startGame());
mainMenuBtn.addEventListener('click',()=>showMainMenu());
quitBtn.addEventListener('click',()=>{ window.close(); });

// Rating feature
const stars = document.querySelectorAll('#stars .star');
let selectedRating = 0;

stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.getAttribute('data-value'));
    stars.forEach(s => s.classList.remove('selected'));
    for (let i = 0; i < selectedRating; i++) {
      stars[i].classList.add('selected');
    }
  });
});

document.getElementById('submitRating').addEventListener('click', () => {
  const comment = document.getElementById('commentBox').value;
  // You can send the rating + comment to server here if needed
  document.getElementById('ratingSection').style.display = 'none';
  alert('Thank you for rating my game!');
}); 

/* ===== PRELOAD FIX ===== */
const imagesToLoad = [playerImg, zombieImg, zombieBossImg, stairsUpImg, stairsDownImg];
let loadedCount = 0;
imagesToLoad.forEach(img=>{
    img.onload = ()=>{
        loadedCount++;
        if(loadedCount===imagesToLoad.length){
            showMainMenu(); // show menu only after all images are loaded
        }
    }
});
// Contact Me button opens email
const contactBtn = document.getElementById('contactBtn');
contactBtn.addEventListener('click', () => {
  window.location.href = "mailto:hallracing24@gmail.com";
});

// Portfolio link opens new tab (only clickable on text and arrow)
const arrow = document.getElementById('arrow');
document.getElementById('arrow'); arrow.addEventListener('click', () => {

    window.open("https://hallracer24-eng.github.io/WebPortfolioV2/", "_blank");
});