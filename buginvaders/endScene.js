class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndScene" });
  }

  init(data) {
    this.result = data?.result || "lose"; // "win" | "lose"
  }

  create() {
    const title = this.result === "win" ? "You Win!" : "Game Over!";
    const subtitle = "Tap / Click / Space to restart";

    this.add.text(125, 230, title, {
      fontSize: "40px",
      fill: "#000000",
    });

    this.add.text(50, 290, subtitle, {
      fontSize: "22px",
      fill: "#000000",
    });

    this.input.once("pointerdown", () => this.scene.start("StartScene"));
    this.input.keyboard.once("keydown-SPACE", () => this.scene.start("StartScene"));
  }
}

window.EndScene = EndScene;