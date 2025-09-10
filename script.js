// 获取Canvas元素和上下文
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 获取按钮、分数、状态和难度选择元素
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const gameStatusElement = document.getElementById('game-status');
const difficultySelect = document.getElementById('difficulty-select');

// 游戏配置
const gridSize = 20; // 网格大小
const tileCount = canvas.width / gridSize; // 网格数量

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let score = 0;

// 蛇的初始位置和速度
let snake = [
    { x: 10, y: 10 } // 蛇头位置
];
let velocityX = 0;
let velocityY = 0;
let speed = parseInt(difficultySelect.value); // 游戏速度

// 食物位置
let food = {
    x: 5,
    y: 5
};

// 游戏循环
let gameLoop;

// 初始化游戏
function initGame() {
    // 重置游戏状态
    gameRunning = false;
    gamePaused = false;
    gameOver = false;
    score = 0;
    scoreElement.textContent = score;
    
    // 重置蛇
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    
    // 生成新食物
    generateFood();
    
    // 绘制初始状态
    drawGame();
}

// 开始游戏
function startGame() {
    if (!gameRunning && !gameOver) {
        // 设置初始方向（向右）
        if (velocityX === 0 && velocityY === 0) {
            velocityX = 1;
            velocityY = 0;
        }
        gameRunning = true;
        gameStatusElement.textContent = '游戏进行中';
        gameLoop = setInterval(drawGame, 1000 / speed);
    } else if (gamePaused) {
        gamePaused = false;
        gameStatusElement.textContent = '游戏进行中';
        gameLoop = setInterval(drawGame, 1000 / speed);
    }
}

// 暂停游戏
function pauseGame() {
    if (gameRunning && !gamePaused) {
        gamePaused = true;
        gameStatusElement.textContent = '游戏已暂停 - 按空格键继续';
        clearInterval(gameLoop);
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameLoop);
    initGame();
    gameStatusElement.textContent = '按空格键或点击开始按钮开始游戏';
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // 确保食物不会生成在蛇身上
    for (let i = 0; i < snake.length; i++) {
        if (food.x === snake[i].x && food.y === snake[i].y) {
            generateFood(); // 如果食物生成在蛇身上，重新生成
            break;
        }
    }
}

// 检查碰撞
function checkCollision() {
    // 检查是否撞墙
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) {
        return true;
    }
    
    // 检查是否撞到自己（从第4个身体部分开始检查，避免误判）
    // 蛇长度小于4时不可能撞到自己
    if (snake.length > 3) {
        for (let i = 4; i < snake.length; i++) {
            if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                return true;
            }
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 检查是否打破最高分
        checkHighScore();
        
        // 生成新食物
        generateFood();
        
        // 不删除蛇尾，让蛇变长
        return true;
    }
    return false;
}

// 排行榜系统
let highScores = JSON.parse(localStorage.getItem('snakeHighScores')) || [];

// 检查并更新最高分
function checkHighScore() {
    const lowestScore = highScores.length < 5 ? 0 : highScores[highScores.length - 1]?.score || 0;
    
    // 如果当前分数高于排行榜最低分或排行榜不足5个记录
    if (score > lowestScore || highScores.length < 5) {
        // 显示新纪录提示
        if (highScores.length === 0 || score > highScores[0]?.score) {
            showNewRecordAnimation();
        }
    }
}

// 显示新纪录动画
function showNewRecordAnimation() {
    // 创建新纪录提示元素
    const newRecord = document.createElement('div');
    newRecord.className = 'new-record';
    newRecord.textContent = '新纪录！';
    document.querySelector('.score-container').appendChild(newRecord);
    
    // 3秒后移除动画
    setTimeout(() => {
        newRecord.remove();
    }, 3000);
}

// 绘制游戏
function drawGame() {
    if (gamePaused || !gameRunning) return;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver = true;
        gameRunning = false;
        gameStatusElement.textContent = '游戏结束 - 按空格键或重新开始按钮再玩一次';
        clearInterval(gameLoop);
        drawGameOver();
        return;
    }
    
    // 清空画布
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制食物
    ctx.fillStyle = '#E91E63';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        
        // 绘制蛇身边框
        ctx.strokeStyle = '#45a049';
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
    
    // 绘制蛇头
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize, gridSize);
    
    // 绘制网格线（可选）
    drawGrid();
}

// 绘制网格线
function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= tileCount; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// 绘制游戏结束
function drawGameOver() {
    // 保存分数到排行榜
    saveScore();
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 游戏结束文字
    ctx.fillStyle = 'white';
    ctx.font = '30px -apple-system, BlinkMacSystemFont, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 60);
    
    // 显示分数
    ctx.font = '20px -apple-system, BlinkMacSystemFont, Arial';
    ctx.fillText(`最终分数: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
    
    // 显示排行榜
    ctx.font = '18px -apple-system, BlinkMacSystemFont, Arial';
    ctx.fillText('排行榜', canvas.width / 2, canvas.height / 2 + 10);
    
    // 显示前5名
    const topScores = [...highScores].sort((a, b) => b.score - a.score).slice(0, 5);
    let yPos = canvas.height / 2 + 40;
    
    if (topScores.length > 0) {
        topScores.forEach((entry, index) => {
            ctx.fillText(`${index + 1}. ${entry.score}分`, canvas.width / 2, yPos);
            yPos += 25;
        });
    } else {
        ctx.fillText('暂无记录', canvas.width / 2, yPos);
    }
    
    // 重新开始提示
    ctx.font = '16px -apple-system, BlinkMacSystemFont, Arial';
    ctx.fillText('点击"重新开始"按钮再玩一次', canvas.width / 2, canvas.height - 40);
}

// 保存分数到排行榜
function saveScore() {
    if (score <= 0) return;
    
    // 创建新的分数记录
    const newScore = {
        score: score,
        date: new Date().toISOString()
    };
    
    // 添加到排行榜
    highScores.push(newScore);
    
    // 按分数排序
    highScores.sort((a, b) => b.score - a.score);
    
    // 只保留前10名
    if (highScores.length > 10) {
        highScores = highScores.slice(0, 10);
    }
    
    // 保存到本地存储
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
    
    // 更新排行榜显示
    updateLeaderboardDisplay();
}

// 移动蛇
function moveSnake() {
    // 检查是否吃到食物
    const ateFood = checkFood();
    
    // 移动蛇身体
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i].x = snake[i - 1].x;
        snake[i].y = snake[i - 1].y;
    }
    
    // 移动蛇头
    snake[0].x += velocityX;
    snake[0].y += velocityY;
    
    // 如果吃到食物，增加蛇的长度
    if (ateFood) {
        snake.push({
            x: snake[snake.length - 1].x,
            y: snake[snake.length - 1].y
        });
    }
}

// 键盘控制
document.addEventListener('keydown', function(event) {
    // 如果游戏未开始或已结束，不响应键盘
    if (!gameRunning || gameOver) return;
    
    // 上
    if ((event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    }
    // 下
    else if ((event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    }
    // 左
    else if ((event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    }
    // 右
    else if ((event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
    // 空格键暂停/开始
    else if (event.key === ' ') {
        if (gameRunning && !gamePaused) {
            pauseGame();
        } else if (gamePaused) {
            startGame();
        } else if (!gameRunning && !gameOver) {
            startGame();
        } else if (gameOver) {
            restartGame();
        }
    }
});

// 触摸屏控制
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(event) {
    if (!gameRunning || gameOver) return;
    
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    
    // 阻止默认行为（滚动）
    event.preventDefault();
});

canvas.addEventListener('touchmove', function(event) {
    if (!gameRunning || gameOver || gamePaused) return;
    
    // 阻止默认行为（滚动）
    event.preventDefault();
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 确定滑动方向（水平或垂直）
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && velocityX !== -1) {
            // 右滑
            velocityX = 1;
            velocityY = 0;
        } else if (diffX < 0 && velocityX !== 1) {
            // 左滑
            velocityX = -1;
            velocityY = 0;
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && velocityY !== -1) {
            // 下滑
            velocityX = 0;
            velocityY = 1;
        } else if (diffY < 0 && velocityY !== 1) {
            // 上滑
            velocityX = 0;
            velocityY = -1;
        }
    }
    
    // 更新起始位置
    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

// 按钮事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// 难度选择事件监听
difficultySelect.addEventListener('change', function() {
    speed = parseInt(this.value);
    
    // 如果游戏正在运行，更新游戏速度
    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, 1000 / speed);
    }
});

// 更新排行榜显示
function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    // 清空当前排行榜
    leaderboardList.innerHTML = '';
    
    // 获取排序后的前5名
    const topScores = [...highScores].sort((a, b) => b.score - a.score).slice(0, 5);
    
    if (topScores.length > 0) {
        // 添加排行榜项
        topScores.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const rank = document.createElement('div');
            rank.className = 'leaderboard-rank';
            rank.textContent = `#${index + 1}`;
            
            const scoreEl = document.createElement('div');
            scoreEl.className = 'leaderboard-score';
            scoreEl.textContent = `${entry.score}分`;
            
            item.appendChild(rank);
            item.appendChild(scoreEl);
            leaderboardList.appendChild(item);
        });
    } else {
        // 如果没有记录
        const empty = document.createElement('div');
        empty.className = 'leaderboard-empty';
        empty.textContent = '暂无记录';
        leaderboardList.appendChild(empty);
    }
}

// 初始化游戏
window.onload = function() {
    initGame();
    updateLeaderboardDisplay();
};