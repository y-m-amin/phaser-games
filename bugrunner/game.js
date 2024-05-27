function preload() {
    this.load.image('bug1', 'https://content.codecademy.com/courses/learn-phaser/physics/bug_1.png');
    this.load.image('bug2', 'https://content.codecademy.com/courses/learn-phaser/physics/bug_2.png');
    this.load.image('bug3', 'https://content.codecademy.com/courses/learn-phaser/physics/bug_3.png');
    this.load.image('platform', 'https://content.codecademy.com/courses/learn-phaser/physics/platform.png');
    this.load.image('codey', 'https://content.codecademy.com/courses/learn-phaser/physics/codey.png');
  }
  
  const gameState = {
    score: 0
  };
  
  function create() {
    gameState.player = this.physics.add.sprite(225, 450, 'codey').setScale(.5);
    
    const platforms = this.physics.add.staticGroup();
    platforms.create(225, 490, 'platform').setScale(1, .3).refreshBody();
    
    gameState.scoreText = this.add.text(195, 485, 'Score: 0', { fontSize: '15px', fill: '#000000' });
    
    gameState.player.setCollideWorldBounds(true);
    this.physics.add.collider(gameState.player, platforms);
    
    gameState.cursors = this.input.keyboard.createCursorKeys();
    
    const bugs = this.physics.add.group();
    
    function bugGen() {
      const xCoord1 = Math.random() * 450;
      const xCoord2 = Math.random() * 450;
      const xCoord3 = Math.random() * 450;
      bugs.create(xCoord1, 10, 'bug1');
      bugs.create(xCoord2, 10, 'bug2');
      bugs.create(xCoord3, 15, 'bug3');
    }
    
    const bugGenLoop = this.time.addEvent({
      delay: 200,
      callback: bugGen,
      callbackScope: this,
      loop: true,
    });
    
    this.physics.add.collider(bugs, platforms, function (bug) {
      bug.destroy();
      gameState.score += 10;
      gameState.scoreText.setText(`Score: ${gameState.score}`);
    });
    
    this.physics.add.collider(gameState.player, bugs, () => {
      bugGenLoop.destroy();
      this.physics.pause();
      this.add.text(180, 250, 'Game Over', { fontSize: '15px', fill: '#000000' });
      this.add.text(152, 270, 'Click to Restart', { fontSize: '15px', fill: '#000000' });
      
      // Add your code below:
      this.input.on('pointerup', () => {
        gameState.score = 0;
        this.scene.restart();
      });
    });
  
    // Mobile touch controls
    const leftZone = this.add.zone(0, 500, 225, 500).setOrigin(0, 1).setInteractive();
    const rightZone = this.add.zone(225, 500, 225, 500).setOrigin(0, 1).setInteractive();
  
    leftZone.on('pointerdown', () => gameState.moveLeft = true);
    leftZone.on('pointerup', () => gameState.moveLeft = false);
    leftZone.on('pointerout', () => gameState.moveLeft = false);
  
    rightZone.on('pointerdown', () => gameState.moveRight = true);
    rightZone.on('pointerup', () => gameState.moveRight = false);
    rightZone.on('pointerout', () => gameState.moveRight = false);
  }
  
  
  function update() {
    if (gameState.cursors.left.isDown || gameState.moveLeft) {
      gameState.player.setVelocityX(-160);
    } else if (gameState.cursors.right.isDown || gameState.moveRight) {
      gameState.player.setVelocityX(160);
    } else {
      gameState.player.setVelocityX(0);
    }
  }
  
  
  const config = {
    type: Phaser.AUTO,
    width: 450,
    height: 500,
    backgroundColor: "b9eaff",
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 200 },
        enableBody: true,
      }
    },
    scene: {
      preload,
      create,
      update
    }
  };
  
  const game = new Phaser.Game(config);
  