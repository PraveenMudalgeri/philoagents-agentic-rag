/**
 * PhiloAgents – Phaser.js entry point.
 */
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#1a1a2e",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [PreloadScene, GameScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
