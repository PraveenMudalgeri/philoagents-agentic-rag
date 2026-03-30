/**
 * PreloadScene: loads all game assets before the main scene starts.
 */
const SYSTEM_IMAGE_URLS = {
  "system-skeletal": new URL(
    "../assets/skeletal_system.jpg",
    import.meta.url,
  ).toString(),
  "system-muscular": new URL(
    "../assets/muscular_system.jpg",
    import.meta.url,
  ).toString(),
  "system-cardiovascular": new URL(
    "../assets/cardiovascular_system.jpg",
    import.meta.url,
  ).toString(),
  "system-digestive": new URL(
    "../assets/digestive_system.jpg",
    import.meta.url,
  ).toString(),
  "system-endocrine": new URL(
    "../assets/endocrine_system.jpg",
    import.meta.url,
  ).toString(),
  "system-nervous": new URL(
    "../assets/nervous_system.jpg",
    import.meta.url,
  ).toString(),
  "system-respiratory": new URL(
    "../assets/respiratory_system.jpg",
    import.meta.url,
  ).toString(),
  "system-immune": new URL(
    "../assets/immune_system.jpg",
    import.meta.url,
  ).toString(),
  "system-urinary": new URL(
    "../assets/urinary_system.jpg",
    import.meta.url,
  ).toString(),
  "system-female-reproductive": new URL(
    "../assets/female_reproductive_system.jpg",
    import.meta.url,
  ).toString(),
  "system-male-reproductive": new URL(
    "../assets/male_reproductive_system.jpg",
    import.meta.url,
  ).toString(),
  "system-integumentary": new URL(
    "../assets/integumentary_system.jpg",
    import.meta.url,
  ).toString(),
};

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
    Object.entries(SYSTEM_IMAGE_URLS).forEach(([key, imageUrl]) => {
      this.load.image(key, imageUrl);
    });
  }

  create() {
    this.scene.start("GameScene");
  }
}
