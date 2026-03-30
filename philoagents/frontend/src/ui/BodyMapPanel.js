const BRAIN_IMAGE_URL = new URL("../assets/body-parts/brain-labeled.webp", import.meta.url).toString();
const HEART_IMAGE_URL = new URL("../assets/body-parts/heart-labeled.jpg", import.meta.url).toString();
const LUNGS_IMAGE_URL = new URL("../assets/body-parts/lungs-labeled.jpg", import.meta.url).toString();
const DIGESTIVE_IMAGE_URL = new URL("../assets/body-parts/digestive-system-labeled.jpg", import.meta.url).toString();
const BONES_IMAGE_URL = new URL("../assets/body-parts/bones-labeled.jpg", import.meta.url).toString();

export const NPC_IMAGE_MAP = {
  brain: {
    name: "Brain",
    description: "Controls thinking, memory, and body coordination.",
    image: BRAIN_IMAGE_URL,
  },
  lungs: {
    name: "Lungs",
    description: "Bring oxygen into blood and remove carbon dioxide.",
    image: LUNGS_IMAGE_URL,
  },
  heart: {
    name: "Heart",
    description: "Pumps blood to deliver oxygen and nutrients.",
    image: HEART_IMAGE_URL,
  },
  digestive_system: {
    name: "Digestive System",
    description: "Breaks food down and absorbs nutrients for energy.",
    image: DIGESTIVE_IMAGE_URL,
  },
  bones: {
    name: "Skeleton",
    description: "Supports the body and protects vital organs.",
    image: BONES_IMAGE_URL,
  },
};

export class BodyMapPanel {
  constructor(rootEl) {
    this._rootEl = rootEl;
    this._imageEl = null;
    this._titleEl = null;
    this._descEl = null;
  }

  mount() {
    if (!this._rootEl) return;

    this._rootEl.innerHTML = `
      <div class="part-image-title">Selected Body Part</div>
      <div class="part-image-wrap">
        <div class="part-image" id="part-image-view" role="img" aria-label="Selected body part image"></div>
      </div>
      <div class="part-image-meta">
        <h4 id="part-image-name">No part selected</h4>
        <p id="part-image-description">Open an NPC to view its related body part image.</p>
      </div>
    `;

    this._imageEl = this._rootEl.querySelector("#part-image-view");
    this._titleEl = this._rootEl.querySelector("#part-image-name");
    this._descEl = this._rootEl.querySelector("#part-image-description");
  }

  setActivePart(partId) {
    if (!this._rootEl || !NPC_IMAGE_MAP[partId]) return;

    const part = NPC_IMAGE_MAP[partId];
    if (this._titleEl) this._titleEl.textContent = part.name;
    if (this._descEl) this._descEl.textContent = part.description;

    if (this._imageEl) {
      this._imageEl.classList.remove("show");
      this._imageEl.style.backgroundImage = `url(${part.image})`;
      this._imageEl.style.backgroundPosition = "center";
      this._imageEl.style.backgroundSize = "contain";
      window.requestAnimationFrame(() => {
        this._imageEl.classList.add("show");
      });
    }
  }

  clear() {
    if (this._titleEl) this._titleEl.textContent = "No part selected";
    if (this._descEl) this._descEl.textContent = "Open an NPC to view its related body part image.";
    if (this._imageEl) {
      this._imageEl.style.backgroundImage = "none";
      this._imageEl.classList.remove("show");
    }
  }
}
