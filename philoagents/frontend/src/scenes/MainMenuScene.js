import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
    this._instructionElements = [];
  }

  create() {
    this._renderLayout(this.scale.width, this.scale.height);
    this.scale.on("resize", this._handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this._handleResize, this);
    });
  }

  _renderLayout(width, height) {
    this.children.removeAll(true);

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0d12);
    this._drawBackdrop(width, height);

    const imageWidth = Math.min(340, Math.max(240, width * 0.24));
    const imageHeight = imageWidth * 1.5;
    this.add
      .image(width * 0.72, height / 2 + 20, "body-map")
      .setDisplaySize(imageWidth, imageHeight)
      .setAlpha(0.95);

    this.add
      .text(width * 0.12, height * 0.16, "BODYAGENTS", {
        fontFamily: "Georgia",
        fontSize: `${Math.round(Math.max(42, Math.min(64, width * 0.055)))}px`,
        fontStyle: "bold",
        color: "#f6e7c1",
      })
      .setShadow(0, 4, "#000000", 8, false, true);

    this.add.text(
      width * 0.12,
      height * 0.25,
      "A human-body map inspired by the PhiloAgents town UI.",
      {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#d7d2c1",
        wordWrap: { width: Math.min(420, width * 0.34) },
        lineSpacing: 6,
      },
    );

    this.add.text(
      width * 0.12,
      height * 0.35,
      "Only your attached body image is used in this experience.",
      {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#c7b48d",
        wordWrap: { width: Math.min(380, width * 0.3) },
        lineSpacing: 6,
      },
    );

    const buttonX = Math.max(100, width * 0.5 - 170);
    this._createButton(buttonX, height * 0.68, "Enter Body Map", () => {
      this.scene.start("GameScene");
    });

    this._createButton(buttonX, height * 0.78, "Instructions", () => {
      this._showInstructions();
    });
  }

  _drawBackdrop(width, height) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x121925, 1);
    graphics.fillRoundedRect(72, 72, width - 144, height - 144, 28);
    graphics.lineStyle(2, 0x66573a, 0.9);
    graphics.strokeRoundedRect(72, 72, width - 144, height - 144, 28);

    graphics.lineStyle(1, 0x322819, 0.55);
    for (let y = 98; y < height - 96; y += 26) {
      graphics.lineBetween(90, y, width - 90, y);
    }
  }

  _createButton(x, y, label, onClick) {
    const buttonWidth = 300;
    const buttonHeight = 56;
    const radius = 18;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(x + 4, y + 4, buttonWidth, buttonHeight, radius);

    const button = this.add.graphics();
    button.fillStyle(0xf1e4c0, 1);
    button.fillRoundedRect(x, y, buttonWidth, buttonHeight, radius);
    button.lineStyle(2, 0x2f2519, 0.95);
    button.strokeRoundedRect(x, y, buttonWidth, buttonHeight, radius);

    const text = this.add
      .text(x + buttonWidth / 2, y + buttonHeight / 2, label, {
        fontFamily: "Arial",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#231b12",
      })
      .setOrigin(0.5);

    const hitbox = new Phaser.Geom.Rectangle(x, y, buttonWidth, buttonHeight);
    button.setInteractive(hitbox, Phaser.Geom.Rectangle.Contains);

    button.on("pointerover", () => {
      button.clear();
      button.fillStyle(0xf9efcf, 1);
      button.fillRoundedRect(x, y, buttonWidth, buttonHeight, radius);
      button.lineStyle(2, 0x2f2519, 0.95);
      button.strokeRoundedRect(x, y, buttonWidth, buttonHeight, radius);
      text.setY(y + buttonHeight / 2 - 1);
    });

    button.on("pointerout", () => {
      button.clear();
      button.fillStyle(0xf1e4c0, 1);
      button.fillRoundedRect(x, y, buttonWidth, buttonHeight, radius);
      button.lineStyle(2, 0x2f2519, 0.95);
      button.strokeRoundedRect(x, y, buttonWidth, buttonHeight, radius);
      text.setY(y + buttonHeight / 2);
    });

    button.on("pointerdown", onClick);
  }

  _showInstructions() {
    this._hideInstructions();

    const { width, height } = this.scale;
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.72,
    );
    const panel = this.add.graphics();
    panel.fillStyle(0xf3e7c8, 1);
    panel.fillRoundedRect(212, 154, 600, 460, 24);
    panel.lineStyle(3, 0x2f2519, 1);
    panel.strokeRoundedRect(212, 154, 600, 460, 24);

    const title = this.add
      .text(width / 2, 214, "How To Explore", {
        fontFamily: "Georgia",
        fontSize: "36px",
        fontStyle: "bold",
        color: "#22180f",
      })
      .setOrigin(0.5);

    const copy = this.add.text(
      270,
      284,
      [
        "Use arrow keys or WASD to move around the body map.",
        "Walk near a marker and press E, or click the marker directly.",
        "The chat box opens the existing agent backend for that body region.",
        "Press ESC inside the map to return to this menu.",
      ].join("\n\n"),
      {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#2f2519",
        wordWrap: { width: 480 },
        lineSpacing: 10,
      },
    );

    const close = this._createOverlayCloseButton(width / 2 - 90, 534, () => {
      this._hideInstructions();
    });

    overlay.setInteractive();
    overlay.on("pointerdown", () => this._hideInstructions());

    this._instructionElements = [overlay, panel, title, copy, ...close];
  }

  _createOverlayCloseButton(x, y, onClick) {
    const width = 180;
    const height = 50;
    const radius = 14;
    const button = this.add.graphics();
    button.fillStyle(0x1d2430, 1);
    button.fillRoundedRect(x, y, width, height, radius);
    button.lineStyle(2, 0xf3e7c8, 1);
    button.strokeRoundedRect(x, y, width, height, radius);
    const text = this.add
      .text(x + width / 2, y + height / 2, "Close", {
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#f3e7c8",
      })
      .setOrigin(0.5);

    button.setInteractive(
      new Phaser.Geom.Rectangle(x, y, width, height),
      Phaser.Geom.Rectangle.Contains,
    );
    button.on("pointerdown", onClick);

    return [button, text];
  }

  _hideInstructions() {
    this._instructionElements.forEach((element) => element.destroy());
    this._instructionElements = [];
  }

  _handleResize(gameSize) {
    this._hideInstructions();
    this._renderLayout(gameSize.width, gameSize.height);
  }
}
