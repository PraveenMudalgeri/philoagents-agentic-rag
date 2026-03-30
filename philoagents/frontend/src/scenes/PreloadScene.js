/**
 * PreloadScene: loads all game assets before the main scene starts.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    // Create a simple loading bar
    const { width, height } = this.scale;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Loading PhiloAgents...", {
        fontFamily: "Georgia",
        fontSize: "18px",
        fill: "#f0e6d2",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xc8a96e, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.load.setCORS("anonymous");
    this.load.image(
      "body-walkthrough",
      "https://github.com/user-attachments/assets/98ee40b0-960a-4222-9821-33797d34e0f7"
    );
  }

  create() {
    this.scene.start("GameScene");
  }
}
