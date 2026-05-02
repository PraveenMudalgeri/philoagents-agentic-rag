import Phaser from "phaser";
import { ensureLightBgmPlaying } from "../audio/lightBgm.js";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
    this._instructionElements = [];
  }

  create() {
    this._renderLayout(this.scale.width, this.scale.height);
    this.input.once("pointerdown", () => {
      ensureLightBgmPlaying();
    });
    this.input.keyboard.once("keydown", () => {
      ensureLightBgmPlaying();
    });
    this.scale.on("resize", this._handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this._handleResize, this);
    });
  }

  _renderLayout(width, height) {
    this.children.removeAll(true);

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0d12);
    const frame = this._drawBackdrop(width, height);

    const isMobile = width < 920;
    const contentPadX = Math.max(18, Math.min(44, width * 0.035));
    const contentPadY = Math.max(20, Math.min(36, height * 0.05));
    const contentLeft = frame.x + contentPadX;
    const contentRight = frame.x + frame.width - contentPadX;
    const contentTop = frame.y + contentPadY;
    const contentBottom = frame.y + frame.height - contentPadY;
    const contentWidth = contentRight - contentLeft;
    const contentHeight = contentBottom - contentTop;

    const leftRatio = isMobile ? 1 : 0.58;
    const leftWidth = Math.max(260, contentWidth * leftRatio);
    const rightWidth = Math.max(180, contentWidth - leftWidth);

    const leftX = isMobile
      ? width / 2
      : contentLeft + leftWidth * 0.06;
    const textWidth = isMobile
      ? Math.min(contentWidth * 0.92, 540)
      : Math.min(leftWidth * 0.84, 560);

    const title = this.add
      .text(leftX, contentTop + (isMobile ? contentHeight * 0.44 : contentHeight * 0.06), "BODYAGENTS", {
        fontFamily: "Georgia",
        fontSize: `${Math.round(Math.max(36, Math.min(66, width * 0.056)))}px`,
        fontStyle: "bold",
        color: "#f6e7c1",
      })
      .setOrigin(isMobile ? 0.5 : 0, 0)
      .setShadow(0, 4, "#000000", 8, false, true);

    const bodyCopy = this.add.text(
      leftX,
      title.y + title.height + 14,
      "A human-body map inspired by the PhiloAgents town UI.",
      {
        fontFamily: "Arial",
        fontSize: `${Math.round(isMobile ? 24 : 20)}px`,
        color: "#d7d2c1",
        align: isMobile ? "center" : "left",
        wordWrap: { width: textWidth },
        lineSpacing: 6,
      },
    ).setOrigin(isMobile ? 0.5 : 0, 0);

    const bodyNote = this.add.text(
      leftX,
      bodyCopy.y + bodyCopy.height + 18,
      "Only your attached body image is used in this experience.",
      {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#c7b48d",
        align: isMobile ? "center" : "left",
        wordWrap: { width: Math.min(textWidth, 460) },
        lineSpacing: 6,
      },
    ).setOrigin(isMobile ? 0.5 : 0, 0);

    const imageAreaX = isMobile
      ? width / 2
      : contentLeft + leftWidth + rightWidth * 0.5;
    const imageAreaY = isMobile
      ? contentTop + contentHeight * 0.21
      : contentTop + contentHeight * 0.52;
    const maxImageW = isMobile
      ? Math.min(220, contentWidth * 0.5)
      : Math.min(360, rightWidth * 0.9);
    const imageWidth = Math.max(170, maxImageW);
    const imageHeight = imageWidth * 1.5;

    this.add
      .image(imageAreaX, imageAreaY, "body-map")
      .setDisplaySize(imageWidth, imageHeight)
      .setAlpha(0.95)
      .setDepth(1);

    const buttonWidth = isMobile ? Math.min(340, contentWidth * 0.9) : 300;
    const buttonHeight = 56;
    const buttonX = isMobile
      ? width / 2 - buttonWidth / 2
      : leftX;
    const btnStartY = Math.min(
      contentBottom - buttonHeight * 2 - 16,
      bodyNote.y + bodyNote.height + 36,
    );

    this._createButton(buttonX, btnStartY, "Enter Body Map", () => {
      ensureLightBgmPlaying();
      this.scene.start("GameScene");
    }, buttonWidth, buttonHeight);

    this._createButton(buttonX, btnStartY + buttonHeight + 16, "Instructions", () => {
      this._showInstructions();
    }, buttonWidth, buttonHeight);
  }

  _drawBackdrop(width, height) {
    const marginX = Math.max(12, Math.min(72, width * 0.06));
    const marginY = Math.max(12, Math.min(72, height * 0.08));
    const frameX = marginX;
    const frameY = marginY;
    const frameW = width - marginX * 2;
    const frameH = height - marginY * 2;

    const graphics = this.add.graphics();
    graphics.fillStyle(0x121925, 1);
    graphics.fillRoundedRect(frameX, frameY, frameW, frameH, 28);
    graphics.lineStyle(2, 0x66573a, 0.9);
    graphics.strokeRoundedRect(frameX, frameY, frameW, frameH, 28);

    graphics.lineStyle(1, 0x322819, 0.55);
    for (let y = frameY + 26; y < frameY + frameH - 24; y += 26) {
      graphics.lineBetween(frameX + 18, y, frameX + frameW - 18, y);
    }

    return { x: frameX, y: frameY, width: frameW, height: frameH };
  }

  _createButton(x, y, label, onClick, buttonWidth = 300, buttonHeight = 56) {
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
