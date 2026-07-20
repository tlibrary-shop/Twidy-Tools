const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let isChangingDirection = false; // Mencegah bug bunuh diri karena pencet tombol terlalu cepat

// Simpan High Score di localStorage dengan nama unik agar tidak bentrok
let highScore = localStorage.getItem("twidy-snake-highscore") || 0;
highScoreElement.innerHTML = `<i class="fas fa-trophy" style="color: #f97316;"></i> High Score: ${highScore}`;

const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

const handleGameOver = () => {
    clearInterval(setIntervalId);
    finalScore.innerText = `Skor Akhir: ${score}`;
    gameOverScreen.classList.remove("hidden");
}

const restartGame = () => {
    gameOverScreen.classList.add("hidden");
    snakeX = 5; snakeY = 5;
    velocityX = 0; velocityY = 0;
    snakeBody = [];
    score = 0;
    scoreElement.innerHTML = `<i class="fas fa-star" style="color: #fbbf24;"></i> Score: ${score}`;
    gameOver = false;
    isChangingDirection = false;
    updateFoodPosition();
    clearInterval(setIntervalId);
    setIntervalId = setInterval(initGame, 110); // Kecepatan disesuaikan
}

const changeDirection = e => {
    // Mencegah PC scroll layar saat main pakai panah keyboard
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }

    if(isChangingDirection) return; // Tunggu ular maju dulu sebelum belok lagi

    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0; velocityY = -1; isChangingDirection = true;
    } else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0; velocityY = 1; isChangingDirection = true;
    } else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1; velocityY = 0; isChangingDirection = true;
    } else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1; velocityY = 0; isChangingDirection = true;
    }
}

// Event untuk tombol UI di layar HP
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

// --- Fitur SWIPE untuk HP agar lebih lincah tanpa mencet tombol ---
let touchStartX = 0;
let touchStartY = 0;

playBoard.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: false});

playBoard.addEventListener('touchmove', e => e.preventDefault(), {passive: false}); // Mencegah layar ketarik

playBoard.addEventListener('touchend', e => {
    if(isChangingDirection) return;
    
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;
    
    if(Math.abs(dx) > Math.abs(dy)) {
        // Swipe Horizontal
        if(dx > 30 && velocityX != -1) { velocityX = 1; velocityY = 0; isChangingDirection = true; }
        else if(dx < -30 && velocityX != 1) { velocityX = -1; velocityY = 0; isChangingDirection = true; }
    } else {
        // Swipe Vertikal
        if(dy > 30 && velocityY != -1) { velocityX = 0; velocityY = 1; isChangingDirection = true; }
        else if(dy < -30 && velocityY != 1) { velocityX = 0; velocityY = -1; isChangingDirection = true; }
    }
});

const initGame = () => {
    if(gameOver) return handleGameOver();
    
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // Cek jika ular memakan makanan
    if(snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); 
        score += 10; // Skor dinaikkan 10 per apel
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("twidy-snake-highscore", highScore);
        scoreElement.innerHTML = `<i class="fas fa-star" style="color: #fbbf24;"></i> Score: ${score}`;
        highScoreElement.innerHTML = `<i class="fas fa-trophy" style="color: #f97316;"></i> High Score: ${highScore}`;
    }

    snakeX += velocityX;
    snakeY += velocityY;
    
    // Geser setiap bagian tubuh ular maju 1 langkah mengikuti kepala
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY]; 

    // Cek jika nabrak tembok
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        // Beri warna kepala lebih terang dari badannya
        let headStyle = i === 0 ? "background: #60a5fa;" : "";
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}; ${headStyle}"></div>`;
        
        // Cek jika nabrak badan sendiri
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    
    playBoard.innerHTML = html;
    isChangingDirection = false; // Buka kunci arah setelah ular selesai bergerak 1 kotak
}

updateFoodPosition();
setIntervalId = setInterval(initGame, 110);

// PERBAIKAN PC: Ubah keyup ke keydown agar respon langsung tanpa jeda
document.addEventListener("keydown", changeDirection);

// Ekspos fungsi restart ke window HTML
window.restartGame = restartGame;
