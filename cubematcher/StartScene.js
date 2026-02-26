class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  preload() {
    this.load.image(
      "startScreen",
      "https://content.codecademy.com/courses/learn-phaser/cube-matcher/start.png"
    );
  }

  create() {
    this.add.image(0, 0, "startScreen").setOrigin(0);

    // Use once() so it can't stack handlers
    this.input.once("pointerup", () => {
      this.scene.start("GameScene");
    });

    // Optional: allow Space to start (nice for desktop)
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });
  }
}