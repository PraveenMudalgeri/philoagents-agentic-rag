import Phaser from "phaser";
import { ChatManager } from "../ui/ChatManager.js";

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 2400;
const BODY_X = WORLD_WIDTH / 2;
const BODY_Y = WORLD_HEIGHT / 2 + 40;
const BODY_WIDTH = 900;
const BODY_HEIGHT = 1350;
const INTERACT_DISTANCE = 90;
const PLAYER_SPEED = 205;
const PLAYER_START_X = BODY_X;
const PLAYER_START_Y = BODY_Y + BODY_HEIGHT / 2 + 120;

const MARKERS = [
  {
    id: "brain",
    name: "Brain",
    x: BODY_X,
    y: BODY_Y - 515,
    atlas: "plato",
    baseFrame: "plato",
  },
  {
    id: "lungs",
    name: "Lungs",
    x: BODY_X - 12,
    y: BODY_Y - 320,
    atlas: "aristotle",
    baseFrame: "aristotle",
  },
  {
    id: "heart",
    name: "Heart",
    x: BODY_X + 12,
    y: BODY_Y - 250,
    atlas: "descartes",
    baseFrame: "descartes",
  },
  {
    id: "digestive_system",
    name: "Digestive System",
    x: BODY_X,
    y: BODY_Y - 50,
    atlas: "turing",
    baseFrame: "turing",
  },
  {
    id: "bones",
    name: "Skeleton",
    x: BODY_X,
    y: BODY_Y + 320,
    atlas: "aristotle",
    baseFrame: "aristotle",
  },
];

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this._chat = new ChatManager();
  }

  create() {
    if (this._chat.isOpen()) {
      this._chat.close();
    }

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this._createPlayerAnimations();
    this._drawBackground();
    this._drawBodyMap();
    this._createMarkers();
    this._createPlayer();
    this._createHud();

    this.scale.on("resize", this._handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this._handleResize, this);
    });

    this._cursors = this.input.keyboard.createCursorKeys();
    this._interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );
    this._escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );
    this._wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    window.addEventListener("chat-opened", () => {
      this.input.keyboard.enabled = false;
    });

    window.addEventListener("chat-closed", () => {
      this.input.keyboard.enabled = true;
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this._escapeKey)) {
      this._chat.close();
      this.scene.start("MainMenuScene");
      return;
    }

    if (this._chat.isOpen()) return;

    this._updatePlayerMovement();
    this._updateInteractionState();
  }

  _createPlayerAnimations() {
    const directions = ["left", "right", "front", "back"];

    directions.forEach((direction) => {
      const key = `sophia-${direction}-walk`;
      if (this.anims.exists(key)) return;

      this.anims.create({
        key,
        frames: this.anims.generateFrameNames("sophia", {
          prefix: `sophia-${direction}-walk-`,
          start: 0,
          end: 8,
          zeroPad: 4,
        }),
        frameRate: 10,
        repeat: -1,
      });
    });
  }

  _drawBackground() {
    this.add.rectangle(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      0x0b1017,
    );

    const grid = this.add.graphics({
      lineStyle: { width: 1, color: 0x161e28, alpha: 0.7 },
    });
    for (let x = 0; x <= WORLD_WIDTH; x += 64) {
      grid.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 64) {
      grid.lineBetween(0, y, WORLD_WIDTH, y);
    }

    const frame = this.add.graphics();
    frame.fillStyle(0x131b26, 1);
    frame.fillRoundedRect(220, 120, 1160, 1960, 36);
    frame.lineStyle(3, 0x685538, 0.9);
    frame.strokeRoundedRect(220, 120, 1160, 1960, 36);

    const rule = this.add.graphics({
      lineStyle: { width: 1, color: 0x2f2618, alpha: 0.75 },
    });
    for (let y = 170; y < 2040; y += 32) {
      rule.lineBetween(260, y, 1340, y);
    }
  }

  _drawBodyMap() {
    this.add
      .image(BODY_X, BODY_Y, "body-map")
      .setDisplaySize(BODY_WIDTH, BODY_HEIGHT)
      .setDepth(2);

    const border = this.add.graphics();
    border.lineStyle(3, 0xe8d4af, 0.95);
    border.strokeRoundedRect(
      BODY_X - BODY_WIDTH / 2 - 16,
      BODY_Y - BODY_HEIGHT / 2 - 16,
      BODY_WIDTH + 32,
      BODY_HEIGHT + 32,
      28,
    );
    border.setDepth(3);
  }

  _createMarkers() {
    this._npcs = MARKERS.map((marker) => {
      const glow = this.add
        .ellipse(marker.x, marker.y + 18, 42, 14, 0x000000, 0.28)
        .setDepth(8);

      const sprite = this.add
        .sprite(marker.x, marker.y, marker.atlas, `${marker.baseFrame}-front`)
        .setScale(1.4)
        .setDepth(12)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(marker.x, marker.y + 44, marker.name, {
          fontFamily: "Arial",
          fontSize: "18px",
          fontStyle: "bold",
          color: "#f5e7c7",
          backgroundColor: "#121925",
          padding: { left: 8, right: 8, top: 4, bottom: 4 },
        })
        .setOrigin(0.5)
        .setDepth(13);

      sprite.on("pointerdown", () => this._chat.open(marker.id, marker.name));

      this.tweens.add({
        targets: sprite,
        y: marker.y - 5,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      return { ...marker, sprite, label, glow };
    });
  }

  _createPlayer() {
    this._player = this.physics.add.sprite(
      PLAYER_START_X,
      PLAYER_START_Y,
      "sophia",
      "sophia-front",
    );

    this._player.setSize(28, 42);
    this._player.setOffset(0, 4);
    this._player.setDepth(20);
    this._player.setCollideWorldBounds(true);

    this.cameras.main.startFollow(this._player);
    this.cameras.main.setZoom(1);
  }

  _createHud() {
    const viewportWidth = this.scale.width;
    const viewportHeight = this.scale.height;

    this.add
      .text(40, 26, "BODY MAP", {
        fontFamily: "Georgia",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#f5e7c7",
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.add
      .text(
        40,
        68,
        "Move with WASD or arrow keys. Press E near a character. Press ESC to return.",
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#d8ccb1",
          wordWrap: { width: Math.max(320, viewportWidth - 220) },
        },
      )
      .setScrollFactor(0)
      .setDepth(30);

    this._hintText = this.add
      .text(viewportWidth / 2, viewportHeight - 42, "", {
        fontFamily: "Arial",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#f5e7c7",
        backgroundColor: "#131b26",
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);
  }

  _updatePlayerMovement() {
    const body = this._player.body;
    const previousVelocity = body.velocity.clone();
    body.setVelocity(0);

    if (this._cursors.left.isDown || this._wasd.left.isDown) {
      body.setVelocityX(-PLAYER_SPEED);
    } else if (this._cursors.right.isDown || this._wasd.right.isDown) {
      body.setVelocityX(PLAYER_SPEED);
    }

    if (this._cursors.up.isDown || this._wasd.up.isDown) {
      body.setVelocityY(-PLAYER_SPEED);
    } else if (this._cursors.down.isDown || this._wasd.down.isDown) {
      body.setVelocityY(PLAYER_SPEED);
    }

    body.velocity.normalize().scale(PLAYER_SPEED);

    const moving = Math.abs(body.velocity.x) > 0 || Math.abs(body.velocity.y) > 0;

    if (this._cursors.left.isDown || this._wasd.left.isDown) {
      this._player.anims.play("sophia-left-walk", true);
      this._lastDirection = "left";
    } else if (this._cursors.right.isDown || this._wasd.right.isDown) {
      this._player.anims.play("sophia-right-walk", true);
      this._lastDirection = "right";
    } else if (this._cursors.up.isDown || this._wasd.up.isDown) {
      this._player.anims.play("sophia-back-walk", true);
      this._lastDirection = "back";
    } else if (this._cursors.down.isDown || this._wasd.down.isDown) {
      this._player.anims.play("sophia-front-walk", true);
      this._lastDirection = "front";
    } else if (!moving) {
      this._player.anims.stop();
      const direction = this._lastDirection || this._directionFromVelocity(previousVelocity);
      this._player.setTexture("sophia", `sophia-${direction}`);
    }
  }

  _updateInteractionState() {
    const px = this._player.x;
    const py = this._player.y;
    let nearestNpc = null;
    let nearestDist = Infinity;

    for (const npc of this._npcs) {
      npc.glow.setAlpha(0.2);
      npc.sprite.setFrame(`${npc.baseFrame}-front`);
      const dist = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
      if (dist < INTERACT_DISTANCE && dist < nearestDist) {
        nearestDist = dist;
        nearestNpc = npc;
      }
    }

    if (nearestNpc) {
      nearestNpc.glow.setAlpha(0.42);
      nearestNpc.sprite.setFrame(
        `${nearestNpc.baseFrame}-${this._directionTowardPlayer(nearestNpc)}`,
      );
      this._hintText.setText(
        `Press [E] or click to chat about ${nearestNpc.name}`,
      );

      if (Phaser.Input.Keyboard.JustDown(this._interactKey)) {
        this._chat.open(nearestNpc.id, nearestNpc.name);
      }
    } else {
      this._hintText.setText("");
    }
  }

  _directionFromVelocity(velocity) {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      return velocity.x < 0 ? "left" : "right";
    }

    if (velocity.y < 0) return "back";
    return "front";
  }

  _directionTowardPlayer(npc) {
    const dx = this._player.x - npc.x;
    const dy = this._player.y - npc.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx < 0 ? "left" : "right";
    }

    return dy < 0 ? "back" : "front";
  }

  _handleResize(gameSize) {
    if (!this._hintText) return;
    this._hintText.setPosition(gameSize.width / 2, gameSize.height - 42);
  }
}
