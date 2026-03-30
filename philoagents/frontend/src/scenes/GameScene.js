/**
 * GameScene: the anatomy viewer world where the user explores a selected body system.
 */
import { ChatManager } from "../ui/ChatManager.js";

const SYSTEM_CONFIG = {
  skeletal_system: {
    title: "Skeletal System",
    imageKey: "system-skeletal",
    points: [
      { id: "bones", name: "Skull", x: 400, y: 88, color: 0xf4d03f },
      { id: "bones", name: "Rib Cage", x: 400, y: 206, color: 0x7fb3d5 },
      {
        id: "bones",
        name: "Vertebral Column",
        x: 400,
        y: 304,
        color: 0x76d7c4,
      },
      { id: "bones", name: "Pelvis", x: 400, y: 388, color: 0xf5b041 },
      { id: "bones", name: "Femur", x: 400, y: 500, color: 0xec7063 },
    ],
  },
  muscular_system: {
    title: "Muscular System",
    imageKey: "system-muscular",
    points: [
      { id: "bones", name: "Shoulder", x: 370, y: 168, color: 0xd98880 },
      { id: "bones", name: "Pectorals", x: 402, y: 214, color: 0xcd6155 },
      { id: "bones", name: "Abdominals", x: 402, y: 312, color: 0xec7063 },
      { id: "bones", name: "Quadriceps", x: 390, y: 460, color: 0xaf7ac5 },
      { id: "bones", name: "Calf Group", x: 390, y: 548, color: 0x9b59b6 },
    ],
  },
  cardiovascular_system: {
    title: "Cardiovascular System",
    imageKey: "system-cardiovascular",
    points: [
      { id: "heart", name: "Heart", x: 406, y: 214, color: 0xe74c3c },
      { id: "heart", name: "Aorta", x: 398, y: 164, color: 0xcb4335 },
      {
        id: "heart",
        name: "Upper Circulation",
        x: 370,
        y: 258,
        color: 0xec7063,
      },
      {
        id: "heart",
        name: "Lower Circulation",
        x: 402,
        y: 410,
        color: 0xf1948a,
      },
      {
        id: "heart",
        name: "Peripheral Vessels",
        x: 405,
        y: 548,
        color: 0xf5b7b1,
      },
    ],
  },
  digestive_system: {
    title: "Digestive System",
    imageKey: "system-digestive",
    points: [
      {
        id: "digestive_system",
        name: "Esophagus",
        x: 400,
        y: 166,
        color: 0xf5b041,
      },
      {
        id: "digestive_system",
        name: "Stomach",
        x: 410,
        y: 238,
        color: 0xf39c12,
      },
      {
        id: "digestive_system",
        name: "Liver",
        x: 360,
        y: 250,
        color: 0xd68910,
      },
      {
        id: "digestive_system",
        name: "Small Intestine",
        x: 400,
        y: 348,
        color: 0xca6f1e,
      },
      {
        id: "digestive_system",
        name: "Large Intestine",
        x: 400,
        y: 434,
        color: 0xa04000,
      },
    ],
  },
  endocrine_system: {
    title: "Endocrine System",
    imageKey: "system-endocrine",
    points: [
      { id: "bones", name: "Pituitary", x: 400, y: 96, color: 0x85c1e9 },
      { id: "bones", name: "Thyroid", x: 400, y: 172, color: 0x5dade2 },
      { id: "bones", name: "Pancreas", x: 405, y: 294, color: 0x5499c7 },
      { id: "bones", name: "Adrenal Glands", x: 380, y: 334, color: 0x2e86c1 },
      { id: "bones", name: "Gonads", x: 400, y: 438, color: 0x1f618d },
    ],
  },
  nervous_system: {
    title: "Nervous System",
    imageKey: "system-nervous",
    points: [
      { id: "brain", name: "Brain", x: 400, y: 90, color: 0x9b59b6 },
      { id: "brain", name: "Cranial Nerves", x: 400, y: 138, color: 0x884ea0 },
      { id: "brain", name: "Spinal Cord", x: 400, y: 270, color: 0x7d3c98 },
      {
        id: "brain",
        name: "Peripheral Nerves",
        x: 402,
        y: 392,
        color: 0x6c3483,
      },
      {
        id: "brain",
        name: "Lumbosacral Plexus",
        x: 401,
        y: 500,
        color: 0x5b2c6f,
      },
    ],
  },
  respiratory_system: {
    title: "Respiratory System",
    imageKey: "system-respiratory",
    points: [
      { id: "lungs", name: "Nasal Cavity", x: 400, y: 104, color: 0x48c9b0 },
      { id: "lungs", name: "Trachea", x: 400, y: 168, color: 0x45b39d },
      { id: "lungs", name: "Lungs", x: 400, y: 222, color: 0x1abc9c },
      { id: "lungs", name: "Bronchi", x: 380, y: 248, color: 0x17a589 },
      { id: "lungs", name: "Diaphragm", x: 400, y: 318, color: 0x148f77 },
    ],
  },
  immune_system: {
    title: "Immune System",
    imageKey: "system-immune",
    points: [
      { id: "bones", name: "Tonsils", x: 400, y: 106, color: 0x58d68d },
      { id: "bones", name: "Thymus", x: 400, y: 188, color: 0x52be80 },
      { id: "bones", name: "Spleen", x: 448, y: 268, color: 0x27ae60 },
      { id: "bones", name: "Lymph Nodes", x: 350, y: 286, color: 0x229954 },
      { id: "bones", name: "Bone Marrow", x: 402, y: 512, color: 0x1e8449 },
    ],
  },
  urinary_system: {
    title: "Urinary System",
    imageKey: "system-urinary",
    points: [
      { id: "bones", name: "Kidneys", x: 400, y: 286, color: 0x5dade2 },
      { id: "bones", name: "Ureters", x: 400, y: 356, color: 0x3498db },
      { id: "bones", name: "Bladder", x: 402, y: 432, color: 0x2e86c1 },
      { id: "bones", name: "Renal Artery", x: 370, y: 292, color: 0x2874a6 },
      { id: "bones", name: "Renal Vein", x: 432, y: 292, color: 0x1f618d },
    ],
  },
  female_reproductive_system: {
    title: "Female Reproductive System",
    imageKey: "system-female-reproductive",
    points: [
      { id: "bones", name: "Ovaries", x: 366, y: 402, color: 0xf1948a },
      { id: "bones", name: "Fallopian Tubes", x: 404, y: 382, color: 0xec7063 },
      { id: "bones", name: "Uterus", x: 402, y: 424, color: 0xe74c3c },
      { id: "bones", name: "Cervix", x: 402, y: 458, color: 0xcb4335 },
      { id: "bones", name: "Vaginal Canal", x: 402, y: 500, color: 0xa93226 },
    ],
  },
  male_reproductive_system: {
    title: "Male Reproductive System",
    imageKey: "system-male-reproductive",
    points: [
      { id: "bones", name: "Prostate", x: 402, y: 436, color: 0xf5b7b1 },
      {
        id: "bones",
        name: "Seminal Vesicles",
        x: 400,
        y: 404,
        color: 0xf1948a,
      },
      { id: "bones", name: "Vas Deferens", x: 430, y: 384, color: 0xec7063 },
      { id: "bones", name: "Testes", x: 402, y: 512, color: 0xcd6155 },
      { id: "bones", name: "Urethra", x: 402, y: 470, color: 0xb03a2e },
    ],
  },
  integumentary_system: {
    title: "Integumentary System",
    imageKey: "system-integumentary",
    points: [
      { id: "bones", name: "Epidermis", x: 400, y: 110, color: 0xf8c471 },
      { id: "bones", name: "Dermis", x: 402, y: 178, color: 0xf5b041 },
      {
        id: "bones",
        name: "Sebaceous Glands",
        x: 430,
        y: 262,
        color: 0xeb984e,
      },
      { id: "bones", name: "Sweat Glands", x: 378, y: 352, color: 0xdc7633 },
      { id: "bones", name: "Hair Follicles", x: 418, y: 486, color: 0xca6f1e },
    ],
  },
};

const INTERACT_DISTANCE = 80;
const BODY_IMAGE_X = 400;
const BODY_IMAGE_Y = 300;
const BODY_IMAGE_WIDTH = 300;
const BODY_IMAGE_HEIGHT = 590;

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this._chat = new ChatManager();
    this._system = SYSTEM_CONFIG.skeletal_system;
  }

  create() {
    const selectedSystemId =
      window.bodyAgentsState?.selectedSystemId || "skeletal_system";
    this._system =
      SYSTEM_CONFIG[selectedSystemId] || SYSTEM_CONFIG.skeletal_system;

    // Background
    this.add.rectangle(400, 300, 800, 600, 0xd7e7f5);
    this._drawGrid();
    this._drawBodyLayout();

    this.add
      .text(20, 14, this._system.title.toUpperCase(), {
        fontFamily: "Rajdhani",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#1e3850",
      })
      .setDepth(4);

    this.add
      .text(20, 46, "Use WASD/Arrow Keys and press E near markers", {
        fontFamily: "Rajdhani",
        fontSize: "14px",
        color: "#355874",
      })
      .setDepth(4);

    // Player
    this._player = this.add.rectangle(120, 540, 24, 24, 0x2e86de);
    this.physics.add.existing(this._player);
    this._player.body.setCollideWorldBounds(true);

    // Create NPCs
    this._npcs = this._system.points.map((p) => {
      const npc = this.add
        .circle(p.x, p.y, 20, p.color)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(p.x, p.y + 26, p.name, {
          fontFamily: "Rajdhani",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#143046",
          backgroundColor: "rgba(235, 245, 255, 0.65)",
          padding: { left: 5, right: 5, top: 1, bottom: 1 },
        })
        .setOrigin(0.5);
      npc.on("pointerdown", () => this._chat.open(p.id, p.name));
      return { ...p, sprite: npc, label };
    });

    // Interaction hint
    this._hintText = this.add
      .text(400, 570, "", {
        fontFamily: "Rajdhani",
        fontSize: "13px",
        color: "#173950",
        fontStyle: "bold",
        backgroundColor: "rgba(234, 244, 255, 0.9)",
        padding: { left: 8, right: 8, top: 2, bottom: 2 },
      })
      .setOrigin(0.5);

    // Controls
    this._cursors = this.input.keyboard.createCursorKeys();
    this._interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );

    // WASD
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
    if (this._chat.isOpen()) return; // Pause movement while chatting

    const speed = 160;
    const body = this._player.body;
    body.setVelocity(0);

    if (this._cursors.left.isDown || this._wasd.left.isDown)
      body.setVelocityX(-speed);
    else if (this._cursors.right.isDown || this._wasd.right.isDown)
      body.setVelocityX(speed);

    if (this._cursors.up.isDown || this._wasd.up.isDown)
      body.setVelocityY(-speed);
    else if (this._cursors.down.isDown || this._wasd.down.isDown)
      body.setVelocityY(speed);

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

  _drawGrid() {
    const graphics = this.add.graphics({
      lineStyle: { width: 1, color: 0xbbd1e4 },
    });
    for (let x = 0; x <= 800; x += 40) graphics.lineBetween(x, 0, x, 600);
    for (let y = 0; y <= 600; y += 40) graphics.lineBetween(0, y, 800, y);
  }

  _drawBodyLayout() {
    if (this.textures.exists(this._system.imageKey)) {
      this.add
        .image(BODY_IMAGE_X, BODY_IMAGE_Y, this._system.imageKey)
        .setDisplaySize(BODY_IMAGE_WIDTH, BODY_IMAGE_HEIGHT);
      return;
    }

    const body = this.add.graphics({ fillStyle: { color: 0xfdfefe } });
    body.fillEllipse(400, 120, 120, 120); // head
    body.fillRoundedRect(315, 180, 170, 330, 50); // torso
    body.fillRoundedRect(270, 200, 35, 220, 18); // left arm
    body.fillRoundedRect(495, 200, 35, 220, 18); // right arm
    body.fillRoundedRect(350, 510, 40, 80, 18); // left leg
    body.fillRoundedRect(410, 510, 40, 80, 18); // right leg
  }
}
