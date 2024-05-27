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
    this.physics.world.setBounds(0, 0, 480, 600);
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
    this.time.addEvent({
      delay: 1000, // in milliseconds = 1 second
      callback: onTimedEvent,
      callbackScope: this,
      loop: true
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
    this.input.on('gameobjectdown', function(pointer, cube, event) {
      // Declare a constant, neighborCubes, below
      const neighborCubes = getNeighbors(cube);
      // Remove matching cubes from game if there's at least 2 of them
      if (neighborCubes.length > 1) {
        // Update score
        score += neighborCubes.length;
        scoreText.setText(`Score: ${score}`);
        // Update high score if necessary
        if (score > highScore) {
          highScore = score;
          highScoreText.setText(`High Score: ${highScore}`);
          localStorage.setItem('highScore', highScore);
        }
        // Update each cube in neighborCubes here
        neighborCubes.forEach(neighbor => {
          neighbor.destroy();
          renderCubes(neighbor);
        });
        removeCols();
      }

      // Helper function moves cube sprites down
      function renderCubes(cube) {
        for (let row = 0; row < cube.row; row++) {
          board[cube.col][row].y += cubeSize;
          board[cube.col][row].row += 1;
        }
        let removed = board[cube.col].splice(cube.row, 1);
        board[cube.col] = removed.concat(board[cube.col]);
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
    cube.removed = false;

    return cube;
  }
  
  endGame() {
    // Stop sprites moving
    this.physics.pause();
    // Transition to end scene w/fade
    this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
      if (progress > 0.5) {
        this.scene.stop('GameScene');
        this.scene.start('EndScene');
      }
    });
  }
}

// Helper function that only checks the immediate neighbors of a cube
const checkClosest = (cube) => {
  const results = [];
  const directions = [
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    { row: -1, col: 0 },
    { row: 1, col: 0 }
  ];
  const currCol = cube.col;
  const currRow = cube.row;
  const color = cube.frame.name;

  directions.forEach(direction => {
    const newCol = currCol + direction.col;
    const newRow = currRow + direction.row;

    if (
      !board[newCol] ||
      !board[newCol][newRow] ||
      board[newCol][newRow].removed
    ) {
      return;
    }

    if (color === board[newCol][newRow].frame.name) {
      results.push(board[newCol][newRow]);
    }
  });

  return results;
}

// Helper function to get neighborCubes of a block
const getNeighbors = (cube) => {
  let start = cube;
  let cubesToCheck = [start];
  let validNeighborCubes = [];

  while (cubesToCheck.length > 0) {
    let curr = cubesToCheck.shift();

    if (curr.removed === false) {
      validNeighborCubes.push(curr);
      curr.removed = true;
    }

    const matches = checkClosest(curr);
    matches.forEach(match => {
      if (!match.removed) {
        match.removed = true;
        validNeighborCubes.push(match);
        cubesToCheck.push(match);
      }
    });
  }

  if (validNeighborCubes.length === 1) {
    validNeighborCubes[0].removed = false;
    validNeighborCubes = [];
  }

  console.log("Neighboring cubes:", validNeighborCubes);
  return validNeighborCubes;
}

// Helper function shifts removes empty columns
const removeCols = () => {
  const emptyCols = board.map((col, i) => {
    const isEmpty = col.every(cube => cube.removed);
    return isEmpty ? i : -1;
  }).filter(index => index !== -1);

  emptyCols.forEach(emptyCol => {
    const columnsToMove = board.slice(emptyCol + 1);
    columnsToMove.forEach(col => {
      col.forEach(cube => {
        cube.x -= cubeSize;
        cube.col--;
      });
    });
  });

  board.splice(emptyCols[0], emptyCols.length);
}

// Helper function to check remaining moves
const remainingMoves = () => {
  return board.some(col => doesColumnContainValidMoves(col));
}

const doesColumnContainValidMoves = (column) => {
  return column.some(cube => !cube.removed && checkClosest(cube).length > 0);
}
