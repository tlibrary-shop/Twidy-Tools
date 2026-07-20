/* General Styling */
body {
  background-image: url('https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/bg.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  color: #85796b;
  overflow: hidden; /* Mencegah layar HP scrolling/bouncing saat menggeser permen */
  touch-action: none;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

/* Scoreboard Styling Mobile-Friendly */
.scoreBoard {
  background-color: cyan;
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  padding: 15px 20px;
  margin-bottom: 20px;
  display: none; /* Dinyalakan JS saat game mulai */
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

h3, h1 {
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  margin: 0;
  color: #85796b;
}

h3 { font-size: 14px; }
h1 { font-size: 24px; margin-top: 5px; }

/* Mode Selection Styling */
#modeSelection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: rgba(240, 240, 240, 0.95);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}

#modeSelection h2 {
  margin-bottom: 20px;
  color: #333;
}

#modeSelection button {
  margin: 10px;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  background-color: #87ceeb;
  border: none;
  border-radius: 10px;
  color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

#timer {
  font-size: 16px;
  font-weight: bold;
}

#changeMode {
  padding: 10px 15px;
  background-color: #ff6347;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

/* Grid Responsif */
.grid {
  display: none; /* Dinyalakan JS saat game mulai */
  grid-template-columns: repeat(8, 1fr);
  width: 95vw;
  max-width: 480px;
  height: 95vw;
  max-height: 480px;
  background-color: rgba(109, 127, 151, 0.5);
  padding: 5px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) inset, 0 1px 0 #fff;
  box-sizing: border-box;
  gap: 2px; /* Jarak antar permen */
}

.grid div {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  transition: transform 0.2s ease;
  cursor: pointer;
}

/* Interactivity */
.grid div:hover, .grid div:active {
  transform: scale(1.1);
  z-index: 2;
}
