/**
 * GameScene: the main game world where the player moves and interacts with philosopher NPCs.
 */
import { ChatManager } from "../ui/ChatManager.js";

const PHILOSOPHERS = [
  { id: "socrates", name: "Socrates", x: 200, y: 200 },
  { id: "plato", name: "Plato", x: 400, y: 300 },
  { id: "aristotle", name: "Aristotle", x: 600, y: 200 },
  { id: "nietzsche", name: "Nietzsche", x: 300, y: 450 },
  { id: "kant", name: "Kant", x: 550, y: 450 },
];

const INTERACT_DISTANCE = 80;

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this._chat = new ChatManager();
  }

  create() {
    // Background
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
    this._drawGrid();

    // Player
    this._player = this.add.rectangle(100, 100, 24, 24, 0x8ab4d8);
    this.physics.add.existing(this._player);
    this._player.body.setCollideWorldBounds(true);

    // Create NPCs
    this._npcs = PHILOSOPHERS.map((p) => {
      const npc = this.add.circle(p.x, p.y, 18, 0xc8a96e);
      const label = this.add
        .text(p.x, p.y + 26, p.name, {
          fontFamily: "Georgia",
          fontSize: "11px",
          fill: "#f0e6d2",
        })
        .setOrigin(0.5);
      return { ...p, sprite: npc, label };
    });

    // Interaction hint
    this._hintText = this.add
      .text(400, 570, "", {
        fontFamily: "Georgia",
        fontSize: "13px",
        fill: "#a0a0d0",
      })
      .setOrigin(0.5);

    // Controls
    this._cursors = this.input.keyboard.createCursorKeys();
    this._interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    // WASD
    this._wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update() {
    if (this._chat.isOpen()) return; // Pause movement while chatting

    const speed = 160;
    const body = this._player.body;
    body.setVelocity(0);

    if (this._cursors.left.isDown || this._wasd.left.isDown) body.setVelocityX(-speed);
    else if (this._cursors.right.isDown || this._wasd.right.isDown) body.setVelocityX(speed);

    if (this._cursors.up.isDown || this._wasd.up.isDown) body.setVelocityY(-speed);
    else if (this._cursors.down.isDown || this._wasd.down.isDown) body.setVelocityY(speed);

    // Check proximity to NPCs
    const px = this._player.x;
    const py = this._player.y;
    let nearestNpc = null;
    let nearestDist = Infinity;

    for (const npc of this._npcs) {
      const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
      if (dist < INTERACT_DISTANCE && dist < nearestDist) {
        nearestDist = dist;
        nearestNpc = npc;
      }
    }

    if (nearestNpc) {
      this._hintText.setText(`Press [E] to talk to ${nearestNpc.name}`);
      if (Phaser.Input.Keyboard.JustDown(this._interactKey)) {
        this._chat.open(nearestNpc.id, nearestNpc.name);
      }
    } else {
      this._hintText.setText("");
    }
  }

  _drawGrid() {
    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0x2a2a4e } });
    for (let x = 0; x <= 800; x += 40) graphics.lineBetween(x, 0, x, 600);
    for (let y = 0; y <= 600; y += 40) graphics.lineBetween(0, y, 800, y);
  }
}
