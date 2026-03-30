import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#06080d",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [PreloadScene, MainMenuScene, GameScene],
};

export default new Phaser.Game(config);
