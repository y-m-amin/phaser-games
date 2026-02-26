class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
  }

  preload() {
    this.load.image(
      "endScreen",
      "https://content.codecademy.com/courses/learn-phaser/cube-matcher/end.png"
    );
  }

  create() {
    this.add.image(0, 0, "endScreen").setOrigin(0);

    const scoreText = this.add.text(150, 520, `Score: ${score}`, {
      fontSize: "25px",
      fill: "#ff0000",
    });
    scoreText.setDepth(1);

    this.input.once("pointerup", () => {
      this.scene.start("GameScene");
    });

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });
  }
}