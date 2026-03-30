/**
 * PhiloAgents – Phaser.js entry point.
 */
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";

const SYSTEMS = [
  {
    id: "skeletal_system",
    name: "Skeletal System",
    image: new URL("./assets/skeletal_system.jpg", import.meta.url).toString(),
    tag: "Framework",
  },
  {
    id: "muscular_system",
    name: "Muscular System",
    image: new URL("./assets/muscular_system.jpg", import.meta.url).toString(),
    tag: "Motion",
  },
  {
    id: "cardiovascular_system",
    name: "Cardiovascular System",
    image: new URL(
      "./assets/cardiovascular_system.jpg",
      import.meta.url,
    ).toString(),
    tag: "Circulation",
  },
  {
    id: "digestive_system",
    name: "Digestive System",
    image: new URL("./assets/digestive_system.jpg", import.meta.url).toString(),
    tag: "Nutrition",
  },
  {
    id: "endocrine_system",
    name: "Endocrine System",
    image: new URL("./assets/endocrine_system.jpg", import.meta.url).toString(),
    tag: "Hormones",
  },
  {
    id: "nervous_system",
    name: "Nervous System",
    image: new URL("./assets/nervous_system.jpg", import.meta.url).toString(),
    tag: "Signals",
  },
  {
    id: "respiratory_system",
    name: "Respiratory System",
    image: new URL(
      "./assets/respiratory_system.jpg",
      import.meta.url,
    ).toString(),
    tag: "Breathing",
  },
  {
    id: "immune_system",
    name: "Immune System",
    image: new URL("./assets/immune_system.jpg", import.meta.url).toString(),
    tag: "Defense",
  },
  {
    id: "urinary_system",
    name: "Urinary System",
    image: new URL("./assets/urinary_system.jpg", import.meta.url).toString(),
    tag: "Filtration",
  },
  {
    id: "female_reproductive_system",
    name: "Female Reproductive System",
    image: new URL(
      "./assets/female_reproductive_system.jpg",
      import.meta.url,
    ).toString(),
    tag: "Reproduction",
  },
  {
    id: "male_reproductive_system",
    name: "Male Reproductive System",
    image: new URL(
      "./assets/male_reproductive_system.jpg",
      import.meta.url,
    ).toString(),
    tag: "Reproduction",
  },
  {
    id: "integumentary_system",
    name: "Integumentary System",
    image: new URL(
      "./assets/integumentary_system.jpg",
      import.meta.url,
    ).toString(),
    tag: "Protection",
  },
];

const state = {
  selectedSystemId: "skeletal_system",
};

window.bodyAgentsState = state;

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

const game = new Phaser.Game(config);

function getSelectedSystem() {
  return (
    SYSTEMS.find((system) => system.id === state.selectedSystemId) || SYSTEMS[0]
  );
}

function updateSelectedUI() {
  const selected = getSelectedSystem();
  const selectedNameEl = document.getElementById("selected-system-name");
  const activeLabelEl = document.getElementById("active-system-label");
  const previewImageEl = document.getElementById("hero-preview-image");

  if (selectedNameEl) selectedNameEl.textContent = selected.name;
  if (activeLabelEl) activeLabelEl.textContent = selected.name;
  if (previewImageEl) previewImageEl.src = selected.image;

  const cards = document.querySelectorAll(".system-card");
  cards.forEach((card) => {
    const isActive = card.getAttribute("data-system-id") === selected.id;
    card.classList.toggle("selected", isActive);
  });
}

function launchSelectedSystem() {
  const gameShell = document.getElementById("game-shell");
  if (gameShell) gameShell.style.display = "block";

  const scene = game.scene.getScene("GameScene");
  if (scene) {
    game.scene.stop("GameScene");
    game.scene.start("GameScene");
  }

  updateSelectedUI();
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function hideSystemViewer() {
  const gameShell = document.getElementById("game-shell");
  const chatOverlay = document.getElementById("chat-overlay");

  if (chatOverlay) chatOverlay.style.display = "none";
  if (gameShell) gameShell.style.display = "none";
}

function renderSystemCards() {
  const grid = document.getElementById("systems-grid");
  if (!grid) return;

  grid.innerHTML = "";
  SYSTEMS.forEach((system, index) => {
    const card = document.createElement("article");
    card.className = "system-card frost-panel";
    card.setAttribute("data-system-id", system.id);
    card.style.animationDelay = `${index * 45}ms`;
    card.innerHTML = `
      <img src="${system.image}" alt="${system.name}" loading="lazy" />
      <div class="card-meta">
        <h3>${system.name}</h3>
        <p>${system.tag}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      state.selectedSystemId = system.id;
      updateSelectedUI();
      launchSelectedSystem();
    });

    grid.appendChild(card);
  });
}

function bootstrapLanding() {
  renderSystemCards();
  updateSelectedUI();

  const openSelectedBtn = document.getElementById("open-selected-btn");
  const backToLandingBtn = document.getElementById("back-to-landing");
  const showGridBtn = document.getElementById("show-grid-btn");

  openSelectedBtn?.addEventListener("click", launchSelectedSystem);
  backToLandingBtn?.addEventListener("click", hideSystemViewer);
  showGridBtn?.addEventListener("click", () => {
    document
      .getElementById("systems-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

bootstrapLanding();
