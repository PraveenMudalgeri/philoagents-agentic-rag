const BRAIN_IMAGE_URL = new URL("../assets/body-parts/brain-labeled.webp", import.meta.url).toString();
const HEART_IMAGE_URL = new URL("../assets/body-parts/heart-labeled.jpg", import.meta.url).toString();
const LUNGS_IMAGE_URL = new URL("../assets/body-parts/lungs-labeled.jpg", import.meta.url).toString();
const DIGESTIVE_IMAGE_URL = new URL("../assets/body-parts/digestive-system-labeled.jpg", import.meta.url).toString();
const BONES_IMAGE_URL = new URL("../assets/body-parts/bones-labeled.jpg", import.meta.url).toString();
const BRAIN_SVG_URL = new URL("../assets/body-parts/brain-interactive.svg", import.meta.url).toString();

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

const BRAIN_LOBES = {
  frontal: {
    label: "Frontal Lobe",
    color: "#c8a800",
    hoverFill: "#ffe033",
    desc: "Decision-making, personality, voluntary movement & speech (Broca's area). The largest lobe — it makes you 'you'.",
  },
  parietal: {
    label: "Parietal Lobe",
    color: "#b00000",
    hoverFill: "#ff5555",
    desc: "Processes touch, temperature, pain & spatial awareness. Helps you know where your body is in space.",
  },
  temporal: {
    label: "Temporal Lobe",
    color: "#007700",
    hoverFill: "#33dd33",
    desc: "Handles hearing, language comprehension (Wernicke's area) & memory. The hippocampus lives here!",
  },
  occipital: {
    label: "Occipital Lobe",
    color: "#3355ff",
    hoverFill: "#5577ff",
    desc: "Visual cortex — every colour, shape & motion you see is decoded here at the back of the brain.",
  },
  cerebellum: {
    label: "Cerebellum",
    color: "#880088",
    hoverFill: "#ee44ee",
    desc: "Balance, coordination & fine motor control. Has more neurons than the rest of the brain combined!",
  },
  brainstem: {
    label: "Brain Stem",
    color: "#006666",
    hoverFill: "#00cccc",
    desc: "Controls breathing, heart rate, sleep & reflexes automatically — the oldest, most primitive part of the brain.",
  },
};

export class BodyMapPanel {
  constructor(rootEl) {
    this._rootEl = rootEl;
    this._imageEl = null;
    this._titleEl = null;
    this._descEl = null;
    this._svgWrap = null;
    this._infoCard = null;
    this._selectedLobe = null;
  }

  mount() {
    if (!this._rootEl) return;

    this._rootEl.innerHTML = `
      <div class="part-image-title">Selected Body Part</div>
      <div class="part-image-wrap" id="bmp-image-wrap">
        <div class="part-image" id="part-image-view" role="img" aria-label="Selected body part image"></div>
      </div>
      <div id="bmp-svg-wrap" style="display:none;flex-direction:column;gap:10px;">
        <div id="bmp-svg-container" style="width:100%;min-height:280px;border-radius:10px;border:1px solid rgba(236,219,180,0.18);background:rgba(10,15,22,0.85);overflow:hidden;display:flex;align-items:center;justify-content:center;"></div>
        <div id="bmp-lobe-info" style="border:1px solid rgba(236,219,180,0.18);border-radius:10px;background:rgba(14,20,30,0.9);padding:12px;min-height:90px;font-family:Arial,sans-serif;transition:all .2s;">
          <p style="margin:0;font-size:12px;color:#d9be8b;font-style:italic;">Click a coloured region to learn about that brain lobe.</p>
        </div>
      </div>
      <div class="part-image-meta">
        <h4 id="part-image-name">No part selected</h4>
        <p id="part-image-description">Open an NPC to view its related body part.</p>
      </div>
    `;

    this._imageEl = this._rootEl.querySelector("#part-image-view");
    this._titleEl = this._rootEl.querySelector("#part-image-name");
    this._descEl = this._rootEl.querySelector("#part-image-description");
    this._svgWrap = this._rootEl.querySelector("#bmp-svg-wrap");
    this._infoCard = this._rootEl.querySelector("#bmp-lobe-info");
  }

  setActivePart(partId) {
    if (!this._rootEl) return;
    const part = NPC_IMAGE_MAP[partId];
    if (!part) return;

    if (this._titleEl) this._titleEl.textContent = part.name;
    if (this._descEl) this._descEl.textContent = part.description;

    if (partId === "brain") {
      this._setSelectedLobe(null);
      this._showBrainSVG();
    } else {
      this._setSelectedLobe(null);
      this._showStaticImage(part);
    }
  }

  clear() {
    if (this._titleEl) this._titleEl.textContent = "No part selected";
    if (this._descEl) this._descEl.textContent = "Open an NPC to view its related body part.";
    if (this._imageEl) {
      this._imageEl.style.backgroundImage = "none";
      this._imageEl.classList.remove("show");
    }
    if (this._svgWrap) this._svgWrap.style.display = "none";
    const imgWrap = this._rootEl && this._rootEl.querySelector("#bmp-image-wrap");
    if (imgWrap) imgWrap.style.display = "";
    if (this._infoCard) {
      this._infoCard.innerHTML = `<p style="margin:0;font-size:12px;color:#d9be8b;font-style:italic;">Click a coloured region to learn about that brain lobe.</p>`;
    }
    this._setSelectedLobe(null);
  }

  _showStaticImage(part) {
    const imgWrap = this._rootEl.querySelector("#bmp-image-wrap");
    if (imgWrap) imgWrap.style.display = "";
    if (this._svgWrap) this._svgWrap.style.display = "none";
    if (this._imageEl) {
      this._imageEl.classList.remove("show");
      this._imageEl.style.backgroundImage = `url(${part.image})`;
      this._imageEl.style.backgroundPosition = "center";
      this._imageEl.style.backgroundSize = "contain";
      window.requestAnimationFrame(() => this._imageEl.classList.add("show"));
    }
  }

  _setSelectedLobe(lobeId) {
    const normalized = lobeId || null;
    if (this._selectedLobe === normalized) return;
    this._selectedLobe = normalized;
    window.dispatchEvent(
      new CustomEvent("brain-lobe-selected", {
        detail: { lobeId: this._selectedLobe },
      }),
    );
  }

  _showBrainSVG() {
    const imgWrap = this._rootEl.querySelector("#bmp-image-wrap");
    if (imgWrap) imgWrap.style.display = "none";
    if (this._svgWrap) this._svgWrap.style.display = "flex";
    const container = this._rootEl.querySelector("#bmp-svg-container");
    if (!container) return;

    fetch(BRAIN_SVG_URL)
      .then((r) => r.text())
      .then((svgText) => {
        container.innerHTML = svgText;
        const svgEl = container.querySelector("svg");
        if (!svgEl) return;
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "auto");
        svgEl.style.display = "block";
        svgEl.setAttribute("role", "img");
        svgEl.setAttribute("aria-label", "Interactive brain diagram");
        this._attachLobeListeners(svgEl);
      })
      .catch((err) => {
        console.warn("[BodyMapPanel] Could not load brain SVG:", err);
        container.innerHTML = `<p style="color:#d9be8b;font-size:13px;padding:12px;font-family:Arial,sans-serif;">Brain diagram unavailable. Make sure <em>brain-interactive.svg</em> is in your assets/body-parts/ folder.</p>`;
      });
  }

  _attachLobeListeners(svgEl) {
    const regionNodes = Array.from(svgEl.querySelectorAll(".brain-region"));
    if (!regionNodes.length) return;

    const lobeMap = new Map();
    const originalStylesByNode = new Map();

    regionNodes.forEach((node) => {
      const lobeId = node.getAttribute("data-lobe");
      if (!lobeId) return;
      if (!lobeMap.has(lobeId)) lobeMap.set(lobeId, []);
      lobeMap.get(lobeId).push(node);

      originalStylesByNode.set(node, {
        fill: node.style.fill || node.getAttribute("fill") || "",
        opacity: node.style.opacity || "",
      });

      node.style.cursor = "pointer";
      node.style.transition = "fill 0.2s ease, opacity 0.2s ease";
      node.dataset.selected = "false";
      node.style.opacity = "0.65";
    });

    const resetLobe = (lobeNodes) => {
      lobeNodes.forEach((n) => {
        const original = originalStylesByNode.get(n);
        if (!original) return;
        n.dataset.selected = "false";
        n.style.opacity = "0.65";
        if (original.fill) n.style.fill = original.fill;
      });
    };

    const activateLobe = (lobeNodes, lobeData) => {
      lobeNodes.forEach((n) => {
        n.dataset.selected = "true";
        n.style.opacity = "1";
        n.style.fill = lobeData.hoverFill;
      });
    };

    const allLobeIds = Array.from(lobeMap.keys());
    allLobeIds.forEach((lobeId) => {
      const nodes = lobeMap.get(lobeId);
      const lobeData = BRAIN_LOBES[lobeId];
      if (!lobeData) return;

      nodes.forEach((node) => {
        node.addEventListener("mouseenter", () => {
          if (node.dataset.selected !== "true") {
            nodes.forEach((n) => {
              if (n.dataset.selected !== "true") {
                n.style.opacity = "0.82";
                n.style.fill = lobeData.hoverFill;
              }
            });
          }
        });

        node.addEventListener("mouseleave", () => {
          if (node.dataset.selected !== "true") {
            nodes.forEach((n) => {
              if (n.dataset.selected !== "true") {
                n.style.opacity = "0.65";
                const original = originalStylesByNode.get(n);
                if (original && original.fill) {
                  n.style.fill = original.fill;
                }
              }
            });
          }
        });

        node.addEventListener("click", () => {
          allLobeIds.forEach((resetId) => resetLobe(lobeMap.get(resetId)));
          activateLobe(nodes, lobeData);
          this._setSelectedLobe(lobeId);

          if (this._infoCard) {
            this._infoCard.innerHTML = `
              <h4 style="margin:0 0 5px;font-size:13px;font-weight:700;color:${lobeData.color};font-family:Arial,sans-serif;">${lobeData.label}</h4>
              <p style="margin:0;font-size:11px;line-height:1.5;color:#e8edf8;font-family:Arial,sans-serif;">${lobeData.desc}</p>
            `;
          }
        });
      });
    });
  }
}
