const BGM_URL = new URL("../assets/audio/light-game-bgm.mp3", import.meta.url).toString();

let bgmAudio = null;
let started = false;
let isMuted = false;

export async function ensureLightBgmPlaying() {
  if (typeof window === "undefined") return;

  if (!bgmAudio) {
    bgmAudio = new Audio(BGM_URL);
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = isMuted ? 0 : 0.3;
  }

  if (started) return;

  try {
    await bgmAudio.play();
    started = true;
  } catch {
    // Ignore autoplay errors until the next user interaction.
  }
}

export function stopLightBgm() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }
  started = false;
}

export function toggleBgmMute() {
  isMuted = !isMuted;
  if (bgmAudio) {
    bgmAudio.volume = isMuted ? 0 : 0.3;
  }
  return isMuted;
}

export function isBgmMuted() {
  return isMuted;
}
