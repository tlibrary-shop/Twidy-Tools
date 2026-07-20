document.addEventListener("DOMContentLoaded", () => {
    candyCrushGame();
});

function candyCrushGame() {
    // DOM Elements
    const grid = document.querySelector(".grid");
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");
    const modeSelection = document.getElementById("modeSelection");
    const endlessButton = document.getElementById("endlessMode");
    const timedButton = document.getElementById("timedMode");
    const changeModeButton = document.getElementById("changeMode");

    // Game State Variables
    const width = 8;
    const squares = [];
    let score = 0;
    let currentMode = null;
    let timeLeft = 0;
    let gameInterval = null;
    let timerInterval = null;

    const candyColors = [
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/red-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/blue-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/green-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/yellow-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/orange-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/purple-candy.png)",
    ];

    function createBoard() {
        grid.innerHTML = "";
        squares.length = 0;  
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("div");
            square.setAttribute("draggable", true);
            square.setAttribute("id", i);
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundImage = candyColors[randomColor];
            grid.appendChild(square);
            squares.push(square);
        }
        
        // Mouse Events (Desktop)
        squares.forEach(square => square.addEventListener("dragstart", dragStart));
        squares.forEach(square => square.addEventListener("dragend", dragEnd));
        squares.forEach(square => square.addEventListener("dragover", dragOver));
        squares.forEach(square => square.addEventListener("dragenter", dragEnter));
        squares.forEach(square => square.addEventListener("dragleave", dragLeave));
        squares.forEach(square => square.addEventListener("drop", dragDrop));

        // Touch Events (Mobile/Tablet)
        squares.forEach(square => square.addEventListener("touchstart", handleTouchStart, {passive: false}));
        squares.forEach(square => square.addEventListener("touchmove", handleTouchMove, {passive: false}));
        squares.forEach(square => square.addEventListener("touchend", handleTouchEnd));
    }

    let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;
    let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

    // --- MOBILE TOUCH CONTROLS ---
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        colorBeingDragged = this.style.backgroundImage;
        squareIdBeingDragged = parseInt(this.id);
    }

    function handleTouchMove(e) {
        e.preventDefault(); // Cegah layar HP scroll saat menggeser permen
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        if (!touchEndX || !touchEndY) return; 

        let diffX = touchStartX - touchEndX;
        let diffY = touchStartY - touchEndY;
        let swipeDir = '';

        // Deteksi arah swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            swipeDir = diffX > 0 ? 'left' : 'right';
        } else {
            swipeDir = diffY > 0 ? 'up' : 'down';
        }

        let isLeftEdge = squareIdBeingDragged % width === 0;
        let isRightEdge = squareIdBeingDragged % width === width - 1;

        if (swipeDir === 'left' && !isLeftEdge) squareIdBeingReplaced = squareIdBeingDragged - 1;
        else if (swipeDir === 'right' && !isRightEdge) squareIdBeingReplaced = squareIdBeingDragged + 1;
        else if (swipeDir === 'up') squareIdBeingReplaced = squareIdBeingDragged - width;
        else if (swipeDir === 'down') squareIdBeingReplaced = squareIdBeingDragged + width;
        else return;

        if (squareIdBeingReplaced >= 0 && squareIdBeingReplaced < width * width) {
            let targetSquare = squares[squareIdBeingReplaced];
            colorBeingReplaced = targetSquare.style.backgroundImage;

            targetSquare.style.backgroundImage = colorBeingDragged;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;

            dragEnd(); 
        }

        touchEndX = 0;
        touchEndY = 0;
    }

    // --- DESKTOP DRAG CONTROLS ---
    function dragStart() {
        colorBeingDragged = this.style.backgroundImage;
        squareIdBeingDragged = parseInt(this.id);
    }
    function dragOver(e) { e.preventDefault(); }
    function dragEnter(e) { e.preventDefault(); }
    function dragLeave() {}

    function dragDrop() {
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    }

    function dragEnd() {
        let validMoves = [
            squareIdBeingDragged - 1,
            squareIdBeingDragged - width,
            squareIdBeingDragged + 1,
            squareIdBeingDragged + width
        ];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        // Perbaikan bug index 0 yang dianggap false jika tidak menggunakan typeof
        if (typeof squareIdBeingReplaced !== 'undefined' && squareIdBeingReplaced !== null && validMove) {
            squareIdBeingReplaced = null; 
        } else if (typeof squareIdBeingReplaced !== 'undefined' && squareIdBeingReplaced !== null && !validMove) {
            squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        } else {
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
    }

    function moveIntoSquareBelow() {
        for (let i = 0; i < width; i++) {
            if (squares[i].style.backgroundImage === "") {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
        for (let i = 0; i < width * (width - 1); i++) {
            if (squares[i + width].style.backgroundImage === "") {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = "";
            }
        }
    }

    function checkRowForFour() {
        for (let i = 0; i < 60; i++) {
            if (i % width >= width - 3) continue; 
            let rowOfFour = [i, i + 1, i + 2, i + 3];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (rowOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4;
                scoreDisplay.innerHTML = score;
                rowOfFour.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    function checkColumnForFour() {
        for (let i = 0; i < 40; i++) {
            let columnOfFour = [i, i + width, i + 2 * width, i + 3 * width];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (columnOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 4;
                scoreDisplay.innerHTML = score;
                columnOfFour.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    function checkRowForThree() {
        for (let i = 0; i < 62; i++) {
            if (i % width >= width - 2) continue; 
            let rowOfThree = [i, i + 1, i + 2];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (rowOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                rowOfThree.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    function checkColumnForThree() {
        for (let i = 0; i < 48; i++) {
            let columnOfThree = [i, i + width, i + 2 * width];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === "";
            if (columnOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                columnOfThree.forEach(index => squares[index].style.backgroundImage = "");
            }
        }
    }

    function gameLoop() {
        checkRowForFour();
        checkColumnForFour();
        checkRowForThree();
        checkColumnForThree();
        moveIntoSquareBelow();
    }

    function startGame(mode) {
        currentMode = mode;
        modeSelection.style.display = "none";
        
        // Sesuaikan dengan display layout CSS yang baru dirombak
        grid.style.display = "grid"; 
        scoreDisplay.parentElement.parentElement.style.display = "flex"; 
        
        createBoard();
        score = 0;
        scoreDisplay.innerHTML = score;
        gameInterval = setInterval(gameLoop, 100);

        if (mode === "timed") {
            timeLeft = 120; 
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    endGame();
                }
            }, 1000);
        } else {
            timerDisplay.innerHTML = ""; 
        }
    }

    function updateTimerDisplay() {
        if (currentMode === "timed") {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.innerHTML = `Time Left: ${minutes}:${seconds.toString().padStart(2, "0")}`;
        } else {
            timerDisplay.innerHTML = "";
        }
    }

    function endGame() {
        clearInterval(gameInterval);
        squares.forEach(square => square.setAttribute("draggable", false));
        // Remove touch event to prevent further play
        squares.forEach(square => square.removeEventListener("touchstart", handleTouchStart));
        alert(`Time's Up! Your score is ${score}`);
    }

    function changeMode() {
        clearInterval(gameInterval);
        if (currentMode === "timed") {
            clearInterval(timerInterval);
        }
        grid.style.display = "none";
        scoreDisplay.parentElement.parentElement.style.display = "none";
        modeSelection.style.display = "flex"; 
    }

    endlessButton.addEventListener("click", () => startGame("endless"));
    timedButton.addEventListener("click", () => startGame("timed"));
    changeModeButton.addEventListener("click", changeMode);
}
