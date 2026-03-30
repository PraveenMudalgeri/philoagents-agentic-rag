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

    this._uiContainer = this.add.container(0, 0).setDepth(50);
    this._worldContainer = this.add.container(0, 0).setDepth(5);
    this._uiContainer.setScrollFactor(0);

    this._createPlayerAnimations();
    this._drawBackground();
    this._drawBodyMap();
    this._createMarkers();
    this._createPlayer();
    this._createHud();
    this._createMinimap();
    this._createActiveNpcHighlight();

    this._initAriaAccessibility();

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

    this._onChatOpened = (event) => {
      this.input.keyboard.enabled = false;
      this._setActiveNpcHighlight(event?.detail?.npcId || null);
    };

    this._onChatClosed = () => {
      this.input.keyboard.enabled = true;
      this._setActiveNpcHighlight(null);
    };

    window.addEventListener("chat-opened", this._onChatOpened);
    window.addEventListener("chat-closed", this._onChatClosed);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("chat-opened", this._onChatOpened);
      window.removeEventListener("chat-closed", this._onChatClosed);
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
    this._updateMinimap();
    this._drawTargetPath();
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
    this._bodyMapScale = Phaser.Math.Clamp(this.scale.width / 1100, 0.9, 1.25);
    const mapWidth = BODY_WIDTH * this._bodyMapScale;
    const mapHeight = BODY_HEIGHT * this._bodyMapScale;

    const bodyMapImage = this.add
      .image(BODY_X, BODY_Y, "body-map")
      .setDisplaySize(mapWidth, mapHeight)
      .setDepth(2);

    const border = this.add.graphics();
    border.lineStyle(3, 0xe8d4af, 0.95);
    border.strokeRoundedRect(
      BODY_X - mapWidth / 2 - 16,
      BODY_Y - mapHeight / 2 - 16,
      mapWidth + 32,
      mapHeight + 32,
      28,
    );
    border.setDepth(3);

    const titleY = BODY_Y - mapHeight / 2 - 120;
    this._bodyMapTitle = this.add
      .text(BODY_X, titleY + 30, "BODY MAP", {
        fontFamily: "Georgia",
        fontSize: "82px",
        fontStyle: "bold",
        color: "#fff8d8",
        stroke: "#ffe4ba",
        strokeThickness: 12,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#ffd760",
          blur: 50,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5, 0)
      .setAlpha(0)
      .setDepth(10)
      .setScrollFactor(1);

    this._worldContainer.add([bodyMapImage, border, this._bodyMapTitle]);

    this.tweens.add({
      targets: this._bodyMapTitle,
      y: titleY,
      alpha: 1,
      ease: "Quad.easeOut",
      duration: 900,
      delay: 100,
    });
  }

  _scaledMarkerPos(marker) {
    const markerScale = Phaser.Math.Clamp(this.scale.width / 1200, 0.9, 1.12);
    return {
      x: BODY_X + (marker.x - BODY_X) * markerScale,
      y: BODY_Y + (marker.y - BODY_Y) * markerScale,
    };
  }

  _createMarkers() {
    this._npcs = MARKERS.map((marker) => {
      const scaled = this._scaledMarkerPos(marker);
      marker.x = scaled.x;
      marker.y = scaled.y;

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

    this.cameras.main.startFollow(this._player, true, 0.15, 0.15);
    this.cameras.main.setDeadzone(240, 180);

    const baseZoom = Phaser.Math.Clamp(this.scale.width / 1200, 0.85, 1.05);
    this.cameras.main.setZoom(baseZoom);
    this._baseZoom = baseZoom;
  }

  _createHud() {
    const viewportWidth = this.scale.width;
    const viewportHeight = this.scale.height;

    this._mapTitle = this.add
      .text(viewportWidth / 2, 10, "BODY MAP", {
        fontFamily: "Georgia",
        fontSize: "68px",
        fontStyle: "bold",
        color: "#f9e69e",
        stroke: "#ffffff",
        strokeThickness: 6,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#ffeea2",
          blur: 28,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(30);

    this._mapTitle.setPipeline("Light2D");

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

  _createMinimap() {
    const size = Math.min(240, this.scale.width * 0.20);
    const x = this.scale.width - size - 16;
    const y = 16;

    this._minimapBounds = new Phaser.Geom.Rectangle(x, y, size, size);
    this._minimapScale = size / BODY_WIDTH;

    this._minimapGraphics = this.add.graphics({
      x: 0,
      y: 0,
    });
    this._minimapGraphics.setScrollFactor(0);
    this._minimapGraphics.setDepth(42);

    this._minimapLabel = this.add
      .text(x + 8, y + 6, "Mini-map", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#ffecc0",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(43);

    this._miniMapToggleText = this.add
      .text(x + 8, y + size - 16, "Press M to toggle", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#e6e6e6",
      })
      .setScrollFactor(0)
      .setDepth(43);

    this._pathGraphics = this.add.graphics().setDepth(9).setScrollFactor(1);
    this._targetLineGraphics = this.add.graphics().setDepth(11).setScrollFactor(1);

    this._minimapVisible = true;
    this._uiContainer.add([
      this._minimapGraphics,
      this._minimapLabel,
      this._miniMapToggleText,
    ]);

    this.input.keyboard.on("keydown-M", () => {
      this._minimapVisible = !this._minimapVisible;
      this._minimapGraphics.setVisible(this._minimapVisible);
      this._minimapLabel.setVisible(this._minimapVisible);
      this._miniMapToggleText.setText(
        this._minimapVisible ? "Press M to hide" : "Press M to show",
      );
    });
  }

  _updateMinimap() {
    if (!this._minimapGraphics) return;

    const worldRect = {
      x: 0,
      y: 0,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
    };

    const bodyRect = {
      x: BODY_X - BODY_WIDTH / 2,
      y: BODY_Y - BODY_HEIGHT / 2,
      width: BODY_WIDTH,
      height: BODY_HEIGHT,
    };

    const norm = (value, min, max) => Phaser.Math.Clamp((value - min) / (max - min), 0, 1);
    const toMiniX = (x) => this._minimapBounds.x + norm(x, worldRect.x, worldRect.x + worldRect.width) * this._minimapBounds.width;
    const toMiniY = (y) => this._minimapBounds.y + norm(y, worldRect.y, worldRect.y + worldRect.height) * this._minimapBounds.height;

    this._minimapGraphics.clear();
    this._minimapGraphics.fillStyle(0x121825, 0.9);
    this._minimapGraphics.fillRect(
      this._minimapBounds.x,
      this._minimapBounds.y,
      this._minimapBounds.width,
      this._minimapBounds.height,
    );
    this._minimapGraphics.lineStyle(2, 0x8a7f5e, 0.9);
    this._minimapGraphics.strokeRect(
      this._minimapBounds.x,
      this._minimapBounds.y,
      this._minimapBounds.width,
      this._minimapBounds.height,
    );

    // Show where the body image sits in the full world so the minimap context stays intuitive.
    const bodyMiniX = toMiniX(bodyRect.x);
    const bodyMiniY = toMiniY(bodyRect.y);
    const bodyMiniW =
      toMiniX(bodyRect.x + bodyRect.width) - bodyMiniX;
    const bodyMiniH =
      toMiniY(bodyRect.y + bodyRect.height) - bodyMiniY;
    this._minimapGraphics.fillStyle(0x22344d, 0.35);
    this._minimapGraphics.fillRect(bodyMiniX, bodyMiniY, bodyMiniW, bodyMiniH);
    this._minimapGraphics.lineStyle(1, 0xa8c7ff, 0.65);
    this._minimapGraphics.strokeRect(bodyMiniX, bodyMiniY, bodyMiniW, bodyMiniH);

    const markerRadius = 4;
    for (const npc of this._npcs || []) {
      const mx = toMiniX(npc.x);
      const my = toMiniY(npc.y);

      this._minimapGraphics.fillStyle(0xffe18e, 1);
      this._minimapGraphics.fillCircle(mx, my, markerRadius);
    }

    const px = this._player.x;
    const py = this._player.y;
    const pMapX = toMiniX(px);
    const pMapY = toMiniY(py);

    this._minimapGraphics.fillStyle(0x71dcff, 1);
    this._minimapGraphics.fillCircle(pMapX, pMapY, 5);
  }

  _drawTargetPath() {
    if (!this._pathGraphics || !this._player) return;

    this._pathGraphics.clear();
    this._targetLineGraphics.clear();

    if (!this._currentTarget) return;

    this._pathGraphics.lineStyle(2, 0x6fda6e, 0.65);
    this._pathGraphics.beginPath();
    this._pathGraphics.moveTo(this._player.x, this._player.y);
    this._pathGraphics.lineTo(this._currentTarget.x, this._currentTarget.y);
    this._pathGraphics.strokePath();

    this._targetLineGraphics.lineStyle(4, 0xffe1a4, 0.7);
    this._targetLineGraphics.beginPath();
    this._targetLineGraphics.moveTo(this._player.x, this._player.y);
    this._targetLineGraphics.lineTo(this._currentTarget.x, this._currentTarget.y);
    this._targetLineGraphics.strokePath();
  }

  _createActiveNpcHighlight() {
    this._activeNpcId = null;
    this._activeNpcHighlight = this.add
      .ellipse(BODY_X, BODY_Y, 120, 80, 0x71dcff, 0.18)
      .setDepth(9)
      .setVisible(false);

    this._activeNpcHighlightRing = this.add
      .ellipse(BODY_X, BODY_Y, 140, 96)
      .setStrokeStyle(3, 0xc4f3ff, 0.85)
      .setDepth(10)
      .setVisible(false);
  }

  _setActiveNpcHighlight(npcId) {
    this._activeNpcId = npcId;

    if (!this._activeNpcHighlight || !this._activeNpcHighlightRing) return;

    this.tweens.killTweensOf(this._activeNpcHighlight);
    this.tweens.killTweensOf(this._activeNpcHighlightRing);

    if (!npcId) {
      this._activeNpcHighlight.setVisible(false);
      this._activeNpcHighlightRing.setVisible(false);
      return;
    }

    const npc = this._npcs?.find((item) => item.id === npcId);
    if (!npc) {
      this._activeNpcHighlight.setVisible(false);
      this._activeNpcHighlightRing.setVisible(false);
      return;
    }

    this._activeNpcHighlight
      .setPosition(npc.x, npc.y)
      .setVisible(true)
      .setScale(1);

    this._activeNpcHighlightRing
      .setPosition(npc.x, npc.y)
      .setVisible(true)
      .setScale(1);

    this.tweens.add({
      targets: [this._activeNpcHighlight, this._activeNpcHighlightRing],
      alpha: { from: 0.9, to: 0.35 },
      scaleX: { from: 0.95, to: 1.08 },
      scaleY: { from: 0.95, to: 1.08 },
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  _initAriaAccessibility() {
    let ariaEl = document.getElementById("philoagents-aria-live");
    if (!ariaEl) {
      ariaEl = document.createElement("div");
      ariaEl.id = "philoagents-aria-live";
      ariaEl.setAttribute("role", "status");
      ariaEl.setAttribute("aria-live", "polite");
      ariaEl.style.position = "absolute";
      ariaEl.style.left = "-9999px";
      ariaEl.style.top = "-9999px";
      ariaEl.style.width = "1px";
      ariaEl.style.height = "1px";
      ariaEl.style.overflow = "hidden";
      document.body.appendChild(ariaEl);
    }
    this._ariaLive = ariaEl;

    this.input.keyboard.on("keydown-I", () => {
      this._hintText.setText("Instructions: Arrow/WASD to move, E to interact, ESC to menu.");
      if (this._ariaLive) {
        this._ariaLive.textContent = "Instructions shown: Arrow or WASD keys to move. Press E to interact with highlighted NPC.";
      }
    });
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
      this._currentTarget = nearestNpc;
      nearestNpc.glow.setAlpha(0.42);
      nearestNpc.sprite.setFrame(
        `${nearestNpc.baseFrame}-${this._directionTowardPlayer(nearestNpc)}`,
      );
      this._hintText.setText(
        `Press [E] or click to chat about ${nearestNpc.name}`,
      );

      if (this._ariaLive) {
        this._ariaLive.textContent = `Target is ${nearestNpc.name}. Press E to chat.`;
      }

      if (Phaser.Input.Keyboard.JustDown(this._interactKey)) {
        this._chat.open(nearestNpc.id, nearestNpc.name);
      }
    } else {
      this._currentTarget = null;
      this._hintText.setText("");
      if (this._ariaLive) {
        this._ariaLive.textContent = "No NPC in range.";
      }
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
    if (this._hintText) {
      this._hintText.setPosition(gameSize.width / 2, gameSize.height - 42);
    }
    if (this._mapTitle) {
      this._mapTitle.setPosition(gameSize.width / 2, 24);
      const scaleFactor = Math.max(1, gameSize.width / 900);
      this._mapTitle.setFontSize(42 * scaleFactor);
    }

    if (this._minimapBounds) {
      const size = Math.min(220, gameSize.width * 0.20);
      this._minimapBounds.setSize(size, size);
      this._minimapBounds.setPosition(gameSize.width - size - 16, 16);
      this._minimapLabel.setPosition(gameSize.width - size - 8, 24);
    }

    const zoom = Phaser.Math.Clamp(gameSize.width / 1200, 0.85, 1.05);
    this.cameras.main.setZoom(zoom);

    this._npcs?.forEach((npc, idx) => {
      const original = MARKERS[idx];
      const adjusted = this._scaledMarkerPos(original);
      npc.x = adjusted.x;
      npc.y = adjusted.y;
      npc.sprite.setPosition(adjusted.x, adjusted.y);
      npc.glow.setPosition(adjusted.x, adjusted.y + 18);
      npc.label.setPosition(adjusted.x, adjusted.y + 44);
      MARKERS[idx].x = adjusted.x;
      MARKERS[idx].y = adjusted.y;
    });

    if (this._activeNpcId) {
      this._setActiveNpcHighlight(this._activeNpcId);
    }
  }
}
