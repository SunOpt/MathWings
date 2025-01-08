const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let planes = [];
let bullets = [];
let level = 1;
let speed = 1;
let health = 5; // 初始血量
let enemyBullets = [];

// 加载飞机图片
const planeImage = new Image();
planeImage.src = 'plane.png'; // 确保路径正确

planeImage.onload = () => {
    setInterval(createPlane, 3000);
    gameLoop();
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
    const speed = 5;
    bullets.push({
        x: cannonX,
        y: cannonY,
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

function drawPlanes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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

function drawCannon() {
    ctx.fillStyle = 'gray';
    const cannonWidth = 40;
    const cannonHeight = 20;
    const x = (canvas.width - cannonWidth) / 2;
    const y = canvas.height - cannonHeight - 10;
    
    // 绘制炮台
    ctx.fillRect(x, y, cannonWidth, cannonHeight);

    // 绘制炮筒
    ctx.fillStyle = 'darkgray';
    const barrelWidth = 10;
    const barrelHeight = 30;
    const barrelX = (canvas.width - barrelWidth) / 2;
    const barrelY = y - barrelHeight;
    ctx.fillRect(barrelX, barrelY, barrelWidth, barrelHeight);
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
            showExplosion(plane.x, plane.y);
        }
    });
}

function showExplosion(x, y) {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(x + 30, y + 30, 30, 0, Math.PI * 2);
    ctx.fill();
}

function drawHealthBar() {
    const barWidth = 100;
    const barHeight = 20;
    const x = canvas.width - barWidth - 20;
    const y = canvas.height - barHeight - 20;
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, (barWidth / 5) * health, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

function showCannonExplosion() {
    const x = canvas.width / 2;
    const y = canvas.height - 40;
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // 短暂显示爆炸效果
    setTimeout(() => {
        drawCannon(); // 重新绘制防空炮以覆盖爆炸效果
    }, 100); // 100毫秒后清除爆炸效果
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
            // 击中防空炮，扣除血量
            health--;
            enemyBullets.splice(bulletIndex, 1);
            if (health <= 0) {
                alert('游戏结束');
                health = 5; // 重置血量
            }
        }
    });
}

function gameLoop() {
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