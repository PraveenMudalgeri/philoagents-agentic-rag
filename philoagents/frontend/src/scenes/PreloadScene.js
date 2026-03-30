import Phaser from "phaser";

const BODY_MAP_URL = new URL("../assets/body_map.png", import.meta.url).toString();
const CHARACTER_ASSETS = {
  sophia: {
    image: new URL("../assets/characters/sophia/atlas.png", import.meta.url).toString(),
    atlas: new URL("../assets/characters/sophia/atlas.json", import.meta.url).toString(),
  },
  plato: {
    image: new URL("../assets/characters/plato/atlas.png", import.meta.url).toString(),
    atlas: new URL("../assets/characters/plato/atlas.json", import.meta.url).toString(),
  },
  aristotle: {
    image: new URL("../assets/characters/aristotle/atlas.png", import.meta.url).toString(),
    atlas: new URL("../assets/characters/aristotle/atlas.json", import.meta.url).toString(),
  },
  turing: {
    image: new URL("../assets/characters/turing/atlas.png", import.meta.url).toString(),
    atlas: new URL("../assets/characters/turing/atlas.json", import.meta.url).toString(),
  },
  descartes: {
    image: new URL("../assets/characters/descartes/atlas.png", import.meta.url).toString(),
    atlas: new URL("../assets/characters/descartes/atlas.json", import.meta.url).toString(),
  },
};

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    const { width, height } = this.scale;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Loading BodyAgents...", {
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
    this.load.image("body-map", BODY_MAP_URL);
    Object.entries(CHARACTER_ASSETS).forEach(([key, value]) => {
      this.load.atlas(key, value.image, value.atlas);
    });
  }

  create() {
    this.scene.start("MainMenuScene");
  }
}
