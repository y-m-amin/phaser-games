class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  create() {
    const { width, height } = this.sys.game.config;

    this.add.text(110, 180, "Bug Invaders", {
      fontSize: "40px",
      fill: "#000000",
      fontStyle: "600",
    });

    this.add.text(75, 250, "Tap / Click / Space to Start", {
      fontSize: "22px",
      fill: "#000000",
    });

    // this.add.text(55, 300, "Desktop:  ← → move   Space shoots", {
    //   fontSize: "16px",
    //   fill: "#000000",
    // });

    // this.add.text(35, 330, "Mobile: Hold bottom-left/right to move", {
    //   fontSize: "16px",
    //   fill: "#000000",
    // });

    // this.add.text(70, 355, "Tap above controls to shoot", {
    //   fontSize: "16px",
    //   fill: "#000000",
    // });

    // Start on pointer or space
    this.input.once("pointerdown", () => this.scene.start("GameScene"));

    this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}

window.StartScene = StartScene;