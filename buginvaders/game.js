// Helper Methods
function sortedEnemies(enemiesGroup) {
  return enemiesGroup.getChildren().sort((a, b) => a.x - b.x);
}
function numOfTotalEnemies(enemiesGroup) {
  return enemiesGroup.getChildren().length;
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    // Touch control state
    this.leftTouchIds = new Set();
    this.rightTouchIds = new Set();
    this.controlBandTopY = 360; // updated in create() based on game height
    this.shootCooldownMs = 180;
    this.lastShotAt = 0;
  }

  preload() {
    this.load.image(
      "bug1",
      "https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bug_1.png"
    );
    this.load.image(
      "bug2",
      "https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bug_2.png"
    );
    this.load.image(
      "bug3",
      "https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bug_3.png"
    );
    this.load.image(
      "platform",
      "https://content.codecademy.com/courses/learn-phaser/physics/platform.png"
    );
    this.load.image(
      "codey",
      "https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/codey.png"
    );
    this.load.image(
      "bugPellet",
      "https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugPellet.png"
    );
    this.load.image(
      "bugRepellent",
      "https://content.codecademy.com/courses/learn-phaser/Bug%20Invaders/bugRepellent.png"
    );
  }

  create() {
    this.activeGame = true;
    this.enemyVelocity = 1;

    // Reset touch state
    this.leftTouchIds.clear();
    this.rightTouchIds.clear();

    // Controls band (bottom area) for hold-to-move
    const h = Number(this.sys.game.config.height);
    this.controlBandTopY = Math.floor(h * 0.72); // bottom ~28% of screen is "controls"

    // Platforms
    const platforms = this.physics.add.staticGroup();
    platforms.create(225, 490, "platform").setScale(1, 0.3).refreshBody();

    // Score text
    this.scoreText = this.add.text(175, 482, "Bugs Left: 24", {
      fontSize: "15px",
      fill: "#000000",
    });

    // Player
    this.player = this.physics.add.sprite(225, 450, "codey").setScale(0.5);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    // Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();

    // Enemies
    this.enemies = this.physics.add.group();
    for (let yVal = 1; yVal < 4; yVal++) {
      for (let xVal = 1; xVal < 9; xVal++) {
        this.enemies
          .create(50 * xVal, 50 * yVal, "bug1")
          .setScale(0.6)
          .setGravityY(-200);
      }
    }

    // Enemy pellets
    const pellets = this.physics.add.group();
    const genPellet = () => {
      const kids = this.enemies.getChildren();
      if (!kids.length) return;
      const randomBug = Phaser.Utils.Array.GetRandom(kids);
      pellets.create(randomBug.x, randomBug.y, "bugPellet");
    };

    this.pelletsLoop = this.time.addEvent({
      delay: 300,
      callback: genPellet,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(pellets, platforms, (pellet) => {
      pellet.destroy();
    });

    this.physics.add.collider(pellets, this.player, () => {
      this.endGame("lose");
    });

    // Player shots
    this.bugRepellent = this.physics.add.group();

    this.physics.add.collider(this.enemies, this.bugRepellent, (bug, repellent) => {
      bug.destroy();
      repellent.destroy();
      this.scoreText.setText(`Bugs Left: ${numOfTotalEnemies(this.enemies)}`);
    });

    this.physics.add.collider(this.enemies, this.player, () => {
      this.endGame("lose");
    });

    // Mobile controls: hold bottom left/right to move, tap above band to shoot
    this.bindTouchControls();
  }

  bindTouchControls() {
    const w = Number(this.sys.game.config.width);

    const handleDown = (pointer) => {
      if (!this.activeGame) return;

      // If tap is ABOVE controls band => shoot
      if (pointer.y < this.controlBandTopY) {
        this.tryShoot();
        return;
      }

      // Bottom band: hold to move
      if (pointer.x < w / 2) this.leftTouchIds.add(pointer.id);
      else this.rightTouchIds.add(pointer.id);
    };

    const handleUp = (pointer) => {
      this.leftTouchIds.delete(pointer.id);
      this.rightTouchIds.delete(pointer.id);
    };

    this.input.on("pointerdown", handleDown);
    this.input.on("pointerup", handleUp);
    this.input.on("pointerupoutside", handleUp);

    // If finger moves across halves while holding, update direction
    this.input.on("pointermove", (pointer) => {
      if (!pointer.isDown) return;
      if (pointer.y < this.controlBandTopY) return;

      // If it crossed halves, move id sets accordingly
      const inLeft = pointer.x < w / 2;
      if (inLeft) {
        this.rightTouchIds.delete(pointer.id);
        this.leftTouchIds.add(pointer.id);
      } else {
        this.leftTouchIds.delete(pointer.id);
        this.rightTouchIds.add(pointer.id);
      }
    });
  }

  tryShoot() {
    const now = Date.now();
    if (now - this.lastShotAt < this.shootCooldownMs) return;
    this.lastShotAt = now;

    if (!this.activeGame) return;

    this.bugRepellent
      .create(this.player.x, this.player.y, "bugRepellent")
      .setGravityY(-400);
  }

  endGame(result) {
    if (!this.activeGame) return;

    this.activeGame = false;
    this.enemyVelocity = 1;

    if (this.pelletsLoop) this.pelletsLoop.destroy();

    this.physics.pause();

    // small delay so it feels responsive but clean
    this.time.delayedCall(150, () => {
      this.scene.start("EndScene", { result });
    });
  }

  update() {
    if (!this.activeGame) return;

    // Keyboard movement
    let movingLeft = this.cursors.left.isDown;
    let movingRight = this.cursors.right.isDown;

    // Touch movement overrides / adds
    if (this.leftTouchIds.size > 0) {
      movingLeft = true;
      movingRight = false;
    } else if (this.rightTouchIds.size > 0) {
      movingRight = true;
      movingLeft = false;
    }

    if (movingLeft) this.player.setVelocityX(-160);
    else if (movingRight) this.player.setVelocityX(160);
    else this.player.setVelocityX(0);

    // Keyboard shoot
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.tryShoot();
    }

    // Win condition
    if (numOfTotalEnemies(this.enemies) === 0) {
      this.endGame("win");
      return;
    }

    // Enemy movement
    this.enemies.getChildren().forEach((bug) => {
      bug.x += this.enemyVelocity;
    });

    const ordered = sortedEnemies(this.enemies);
    const leftMost = ordered[0];
    const rightMost = ordered[ordered.length - 1];

    if (leftMost.x < 10 || rightMost.x > 440) {
      const remaining = numOfTotalEnemies(this.enemies);

      if (remaining < 6) {
        this.enemyVelocity = Math.sign(this.enemyVelocity) * -1.5;
        this.enemies.getChildren().forEach((bug) => (bug.y += 13));
      } else if (remaining < 15) {
        this.enemyVelocity = Math.sign(this.enemyVelocity) * -1.2;
        this.enemies.getChildren().forEach((bug) => (bug.y += 10));
      } else {
        this.enemyVelocity = Math.sign(this.enemyVelocity) * -1;
        this.enemies.getChildren().forEach((bug) => (bug.y += 5));
      }
    }
  }
}

window.GameScene = GameScene;

// Phaser config + boot
const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  backgroundColor: "b9eaff",
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      enableBody: true,
    },
  },
  scene: [window.StartScene, window.GameScene, window.EndScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);