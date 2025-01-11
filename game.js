const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let planes = [];
let bullets = [];
let level = 1;
let speed = 1;
let health = 100; // 初始血量
let hits = 0; // 击中计数
let enemyBullets = [];
let gameTime = 60; // 游戏时间60秒
let gameTimer; // 游戏计时器

// 加载飞机图片
const planeImage = new Image();
planeImage.src = 'plane.png'; // 确保路径正确

planeImage.onload = () => {
    setInterval(createPlane, 3000);
    startGame();
};

function createPlane() {
    const x = Math.random() * (canvas.width - 50);
    const y = 0;
    let num1 = Math.floor(Math.random() * 50);
    let num2 = Math.floor(Math.random() * 50);
    const operator = Math.random() > 0.5 ? '+' : '-';

    // 确保结果不为负数
    if (operator === '-' && num1 < num2) {
        [num1, num2] = [num2, num1];
    }

    const result = operator === '+' ? num1 + num2 : num1 - num2;
    const dx = (Math.random() - 0.5) * 2; // 随机水平速度
    planes.push({ x, y, num1, num2, operator, result, dx, dy: speed });
}

function updatePlanes() {
    planes.forEach(plane => {
        plane.x += plane.dx;
        plane.y += plane.dy;
    });
    planes = planes.filter(plane => plane.y < canvas.height && plane.x > 0 && plane.x < canvas.width);
}

function createBullet(targetX, targetY, planeIndex) {
    const cannonX = canvas.width / 2;
    const cannonY = canvas.height - 40;

    // 预测飞机位置
    const distance = Math.sqrt((targetX - cannonX) ** 2 + (targetY - cannonY) ** 2);
    const timeToTarget = distance / 5;
    const predictedX = targetX + planes[planeIndex].dx * timeToTarget;
    const predictedY = targetY + planes[planeIndex].dy * timeToTarget;

    const angle = Math.atan2(predictedY - cannonY, predictedX - cannonX);
    cannonAngle = angle; // 更新炮管角度
    const speed = 5;
    // 计算炮口位置
    const barrelLength = 35; // 炮管长度
    const barrelEndX = cannonX + Math.cos(angle) * barrelLength;
    const barrelEndY = cannonY - 40 + Math.sin(angle) * barrelLength;
    
    bullets.push({
        x: barrelEndX,
        y: barrelEndY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        targetIndex: planeIndex // 存储目标飞机的索引
    });
}

function updateBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
    });
    bullets = bullets.filter(bullet => bullet.y > 0 && bullet.y < canvas.height && bullet.x > 0 && bullet.x < canvas.width);
}

let lastExplosionTime = 0;

function drawPlanes() {
    // 绘制防空炮
    drawCannon();

    // 绘制血条
    drawHealthBar();

    planes.forEach(plane => {
        // 保存当前画布状态
        ctx.save();

        // 移动到飞机的中心
        ctx.translate(plane.x + 60, plane.y + 60);

        // 旋转画布
        ctx.rotate(Math.PI); // 顺时针旋转180度

        // 绘制飞机图片
        ctx.drawImage(planeImage, -60, -60, 120, 120);

        // 恢复画布状态
        ctx.restore();

        // 绘制算式在飞机上方
        ctx.fillStyle = 'white';
        ctx.font = '32px Arial';
        ctx.fillText(`${plane.num1} ${plane.operator} ${plane.num2}`, plane.x + 10, plane.y - 20);
    });
}

function drawBullets() {
    ctx.fillStyle = 'red';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

let cannonAngle = 0; // 存储炮管角度

function drawCannon() {
    const cannonX = canvas.width / 2;
    const cannonY = canvas.height - 40;
    
    // 绘制炮台底座
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cannonX - 50, cannonY);
    ctx.lineTo(cannonX - 30, cannonY - 20);
    ctx.lineTo(cannonX + 30, cannonY - 20);
    ctx.lineTo(cannonX + 50, cannonY);
    ctx.closePath();
    
    // 炮台渐变
    const gradient = ctx.createLinearGradient(cannonX - 50, cannonY, cannonX + 50, cannonY);
    gradient.addColorStop(0, '#555');
    gradient.addColorStop(1, '#333');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 炮台阴影
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // 绘制防护板
    ctx.beginPath();
    ctx.moveTo(cannonX - 40, cannonY - 20);
    ctx.lineTo(cannonX - 20, cannonY - 40);
    ctx.lineTo(cannonX + 20, cannonY - 40);
    ctx.lineTo(cannonX + 40, cannonY - 20);
    ctx.closePath();
    ctx.fillStyle = '#444';
    ctx.fill();
    
    // 绘制炮管
    ctx.save();
    ctx.translate(cannonX, cannonY - 40);
    
    // 使用存储的炮管角度，调整旋转方向
    ctx.rotate(cannonAngle + Math.PI / 2);
    
    // 炮管渐变
    const barrelGradient = ctx.createLinearGradient(0, -5, 0, -35);
    barrelGradient.addColorStop(0, '#666');
    barrelGradient.addColorStop(1, '#444');
    
    // 绘制炮管主体
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(5, -5);
    ctx.lineTo(5, -35);
    ctx.lineTo(-5, -35);
    ctx.closePath();
    ctx.fillStyle = barrelGradient;
    ctx.fill();
    
    // 绘制炮管细节
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, -35);
    ctx.stroke();
    
    ctx.restore();
    ctx.restore();
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        const plane = planes[bullet.targetIndex];
        if (plane && // 确保目标飞机存在
            bullet.x > plane.x &&
            bullet.x < plane.x + 120 &&
            bullet.y > plane.y &&
            bullet.y < plane.y + 120
        ) {
            // 只有在击中目标飞机时才爆炸
            planes.splice(bullet.targetIndex, 1);
            bullets.splice(bulletIndex, 1);
            hits++;
            updateHitsDisplay();
            showExplosion(plane.x, plane.y);
        }
    });
}

function showExplosion(x, y) {
    lastExplosionTime = Date.now();
    
    // 绘制大爆炸效果
    ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(x + 60, y + 60, 60, 0, Math.PI * 2);
    ctx.fill();

    // 绘制小爆炸效果
    ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(x + 60, y + 60, 40, 0, Math.PI * 2);
    ctx.fill();

    // 绘制火花效果
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 50 + 30;
        ctx.strokeStyle = `rgba(255, ${Math.random() * 155 + 100}, 0, ${Math.random() * 0.8 + 0.2})`;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(x + 60, y + 60);
        ctx.lineTo(
            x + 60 + Math.cos(angle) * length,
            y + 60 + Math.sin(angle) * length
        );
        ctx.stroke();
    }
}

function drawHealthBar() {
    const barWidth = 200;
    const barHeight = 20;
    const x = canvas.width - barWidth - 20;
    const y = canvas.height - barHeight - 20;
    
    // 绘制背景
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);

    // 绘制当前血量
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, barWidth * (health / 100), barHeight);

    // 绘制边框
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

function updateHitsDisplay() {
    const hitsDisplay = document.getElementById('hitsDisplay');
    hitsDisplay.textContent = `击中数: ${hits}`;
}


function createEnemyBullet(plane) {
    const cannonX = canvas.width / 2;
    const cannonY = canvas.height - 40;
    const angle = Math.atan2(cannonY - (plane.y + 30), cannonX - (plane.x + 30));
    const speed = 4;
    enemyBullets.push({
        x: plane.x + 30,
        y: plane.y + 30,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed
    });
}

function updateEnemyBullets() {
    enemyBullets.forEach(bullet => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
    });
    enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height && bullet.x > 0 && bullet.x < canvas.width);
}

function drawEnemyBullets() {
    ctx.fillStyle = 'green';
    enemyBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function checkEnemyCollisions() {
    enemyBullets.forEach((bullet, bulletIndex) => {
        const cannonX = canvas.width / 2;
        const cannonY = canvas.height - 40;
        if (
            bullet.x > cannonX - 20 &&
            bullet.x < cannonX + 20 &&
            bullet.y > cannonY - 20 &&
            bullet.y < cannonY + 20
        ) {
            // 击中防空炮，扣除10点血量
            health = Math.max(0, health - 10);
            enemyBullets.splice(bulletIndex, 1);
            if (health <= 0) {
                endGame();
            }
        }
    });
}

function startGame() {
    health = 100;
    hits = 0;
    gameTime = 60;
    cannonAngle = - Math.PI / 2; // 初始化炮管朝上
    gameTimer = setInterval(updateGameTimer, 1000);
    gameLoop();
}

function updateGameTimer() {
    gameTime--;
    if (gameTime <= 0) {
        endGame();
    }
    // 随时间减少血量
    health = Math.max(0, health - 1.67); // 60秒内从100降到0
}

function endGame() {
    clearInterval(gameTimer);
    alert('游戏结束!');
    health = 100;
    hits = 0;
    gameTime = 60;
    updateHitsDisplay();
}

function gameLoop() {
    // 清除画布，保留爆炸效果
    if (Date.now() - lastExplosionTime > 200) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    updatePlanes();
    updateBullets();
    updateEnemyBullets();
    drawPlanes();
    drawBullets();
    drawEnemyBullets();
    checkCollisions();
    checkEnemyCollisions();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = prompt('输入结果:');
        const result = parseInt(input, 10);
        const index = planes.findIndex(plane => plane.result === result);
        if (index !== -1) {
            const targetX = planes[index].x + 60;
            const targetY = planes[index].y + 60;
            createBullet(targetX, targetY, index);
        } else {
            // 输入错误，随机选择一架飞机发射绿色炮弹
            if (planes.length > 0) {
                const randomPlane = planes[Math.floor(Math.random() * planes.length)];
                createEnemyBullet(randomPlane);
            }
        }
    }
}); 