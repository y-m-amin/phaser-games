const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  backgroundColor: "000000",
  parent: "game-container",
  scene: [StartScene, GameScene, EndScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: 200,
      enableBody: true,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
  
  const game = new Phaser.Game(config);
  