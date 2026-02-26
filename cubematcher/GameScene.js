// Global variables
const cubeSize = 38;
let board;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load images for board and cubes
    this.load.spritesheet('blocks', 'https://content.codecademy.com/courses/learn-phaser/cube-matcher/blocks.png', {
      frameWidth: cubeSize,
      frameHeight: cubeSize
    });
    this.load.image('grid', 'https://content.codecademy.com/courses/learn-phaser/cube-matcher/grid.png');
  }

  create() {
    // Add background
    this.add.image(0, 0, 'grid').setOrigin(0).setScale(0.50);
    // Set boundaries of the game
    this.physics.world.setBounds(0, 0, 480, 640);
    // Create a 12 x 12 board
    board = this.makeBoard(12);
    // Create and display high score
    let highScoreText = this.add.text(15, 580, `High Score: ${highScore}`, {
      fontSize: '25px',
      fill: '#fff'
    });
    // Create and display score
    score = 0;
    let scoreText = this.add.text(15, 610, `Score: ${score}`, {
      fontSize: '25px',
      fill: '#fff'
    });
    // Start and display a timer
    this.initialTime = 60; // in seconds
    let timerText = this.add.text(
      250,
      610,
      `Time Left: ${formatTime(this.initialTime)}`,
      { fontSize: '25px', fill: '#fff' }
    );
    // Phaser timer event
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: onTimedEvent,
      callbackScope: this,
      loop: true,
    });
    // Helper function to format time in minutes and seconds
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      seconds %= 60;
      const secondsString = seconds.toString().padStart(2, '0');
      
      return `${minutes}:${secondsString}`; // 08:00 for example
    }
    // Callback function for timer counts down or ends game
    function onTimedEvent() {
      if (this.initialTime === 0) {
        this.endGame();
      } else {
        this.initialTime--;
        timerText.setText(`Time Left: ${formatTime(this.initialTime)}`);
      }
    }
    // Listener for clicks on cubes
    this.input.on("gameobjectdown", (pointer, cube) => {
    const neighborCubes = getNeighbors(cube);

    if (neighborCubes.length > 1) {
      score += neighborCubes.length;
      scoreText.setText(`Score: ${score}`);

      if (score > highScore) {
        highScore = score;
        highScoreText.setText(`High Score: ${highScore}`);
        localStorage.setItem("highScore", highScore);
      }

      // Remove from board FIRST, then destroy sprites
      neighborCubes.forEach((cb) => {
        // clear from board so future lookups never see dead cubes
        if (board[cb.col] && board[cb.col][cb.row] === cb) {
          board[cb.col][cb.row] = null;
        }
        cb.destroy();
      });

      collapseBoard(this);
    }
  });
  }

  update() {
    // If no more remaining valid moves, end game below
    if (remainingMoves() === false) {
      this.endGame();
    }
  }

  makeBoard(size) {
    const board = Array(size).fill(null).map((_, colIndex) => 
      Array(size).fill(null).map((_, rowIndex) => this.makeCube(colIndex, rowIndex))
    );
    return board;
  }
  
  makeCube(colIndex, rowIndex) {
    const sideMargin = 31;
    const topMargin = 30;
    // Create a Phaser sprite
    const cube = this.physics.add.sprite(
      colIndex * cubeSize + sideMargin,
      rowIndex * cubeSize + topMargin,
      'blocks'
    );
    // Choose color randomly
    const max = 3;
    const min = 0;
    const color = Math.floor(Math.random() * (max - min + 1)) + min;
    // Don't let cube move beyond edges of board
    cube.setCollideWorldBounds(true);
    cube.body.collideWorldBounds = true;
    // Set the cube to a specific color
    cube.setFrame(color);
    // Make the cube clickable
    cube.setInteractive();
    // Add some information to make it easier to find a cube
    cube.col = colIndex;
    cube.row = rowIndex;
    //cube.removed = false;

    return cube;
  }
  
  endGame() {
    if (this.ending) return;
    this.ending = true;

    if (this.timerEvent) this.timerEvent.remove(false);
    this.physics.pause();

    this.cameras.main.fade(800, 0, 0, 0);

    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("EndScene");
    });
  }
}


// ===== Helpers (new model: board holds Cube sprites or null) =====

const BOARD_SIZE = 12;
const sideMargin = 31;
const topMargin = 30;

const cubeX = (col) => col * cubeSize + sideMargin;
const cubeY = (row) => row * cubeSize + topMargin;

const inBounds = (col, row) =>
  col >= 0 && col < board.length && row >= 0 && row < BOARD_SIZE;

const getCubeAt = (col, row) => (inBounds(col, row) ? board[col][row] : null);

const getNeighbors = (startCube) => {
  if (!startCube || !startCube.active) return [];

  const targetColor = startCube.frame.name;
  const visited = new Set();
  const queue = [startCube];
  const results = [];

  const keyOf = (cube) => `${cube.col},${cube.row}`;

  while (queue.length) {
    const curr = queue.shift();
    if (!curr || !curr.active) continue;

    const k = keyOf(curr);
    if (visited.has(k)) continue;
    visited.add(k);

    if (curr.frame.name !== targetColor) continue;

    results.push(curr);

    const dirs = [
      { dc: -1, dr: 0 },
      { dc: 1, dr: 0 },
      { dc: 0, dr: -1 },
      { dc: 0, dr: 1 },
    ];

    for (const { dc, dr } of dirs) {
      const next = getCubeAt(curr.col + dc, curr.row + dr);
      if (next && next.active) queue.push(next);
    }
  }

  return results.length >= 2 ? results : [];
};

const collapseBoard = (scene) => {
  // 1) collapse each column downward
  for (let c = 0; c < board.length; c++) {
    const col = board[c];
    const remaining = col.filter((cube) => cube && cube.active);

    const newCol = Array(BOARD_SIZE).fill(null);
    const startRow = BOARD_SIZE - remaining.length;

    for (let i = 0; i < remaining.length; i++) {
      const cube = remaining[i];
      const newRow = startRow + i;

      newCol[newRow] = cube;
      cube.row = newRow;

      scene.tweens.killTweensOf(cube);
      scene.tweens.add({
        targets: cube,
        y: cubeY(newRow),
        duration: 120,
        ease: "Quad.easeOut",
      });
    }

    board[c] = newCol;
  }

  // 2) remove empty columns
  board = board.filter((col) => col.some((cube) => cube && cube.active));

  // 3) update col and shift x
  for (let c = 0; c < board.length; c++) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const cube = board[c][r];
      if (!cube || !cube.active) continue;

      cube.col = c;

      scene.tweens.killTweensOf(cube);
      scene.tweens.add({
        targets: cube,
        x: cubeX(c),
        duration: 120,
        ease: "Quad.easeOut",
      });
    }
  }
};

const remainingMoves = () => {
  for (let c = 0; c < board.length; c++) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const cube = board[c][r];
      if (!cube || !cube.active) continue;

      const color = cube.frame.name;

      const n1 = getCubeAt(c - 1, r);
      const n2 = getCubeAt(c + 1, r);
      const n3 = getCubeAt(c, r - 1);
      const n4 = getCubeAt(c, r + 1);

      if (
        (n1 && n1.active && n1.frame.name === color) ||
        (n2 && n2.active && n2.frame.name === color) ||
        (n3 && n3.active && n3.frame.name === color) ||
        (n4 && n4.active && n4.frame.name === color)
      ) {
        return true;
      }
    }
  }
  return false;
};