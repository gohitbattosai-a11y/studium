import { useSyncExternalStore } from "react";
import { toast } from "sonner";

export type SoundSettings = { sfx: boolean; ambient: boolean; volume: number };

const KEY = "studium-sound";
const DEFAULTS: SoundSettings = { sfx: true, ambient: true, volume: 0.6 };

const load = (): SoundSettings => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = JSON.parse(raw) as Partial<SoundSettings>;
    return {
      sfx: p.sfx !== false,
      ambient: p.ambient !== false,
      volume: typeof p.volume === "number" ? Math.min(1, Math.max(0, p.volume)) : DEFAULTS.volume,
    };
  } catch {
    return DEFAULTS;
  }
};

let settings = load();
const listeners = new Set<() => void>();

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let ambientBus: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let unlocked = false;
const readyCallbacks: Array<() => void> = [];

const applyLevels = () => {
  if (!ctx || !master || !sfxBus || !ambientBus) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(settings.volume, t, 0.03);
  sfxBus.gain.setTargetAtTime(settings.sfx ? 1 : 0, t, 0.03);
  ambientBus.gain.setTargetAtTime(settings.ambient ? 0.55 : 0, t, 0.2);
};

export const getSoundSettings = () => settings;

export const setSoundSettings = (patch: Partial<SoundSettings>) => {
  settings = { ...settings, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    settings = { ...settings };
  }
  applyLevels();
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const subscribeSound = subscribe;

export const useSoundSettings = () => useSyncExternalStore(subscribe, getSoundSettings, getSoundSettings);

const ensure = (): AudioContext | null => {
  if (ctx) return ctx;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const c = new Ctor();
    const comp = c.createDynamicsCompressor();
    master = c.createGain();
    sfxBus = c.createGain();
    ambientBus = c.createGain();
    sfxBus.connect(master);
    ambientBus.connect(master);
    master.connect(comp);
    comp.connect(c.destination);
    const len = c.sampleRate * 2;
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    ctx = c;
    applyLevels();
    return c;
  } catch {
    return null;
  }
};

const live = (): AudioContext | null => {
  if (!unlocked) return null;
  const c = ensure();
  if (c && c.state === "suspended") void c.resume().catch(() => undefined);
  return c;
};

const unlock = () => {
  if (unlocked) return;
  unlocked = true;
  const c = ensure();
  if (!c) return;
  void c.resume().catch(() => undefined);
  readyCallbacks.splice(0).forEach((cb) => cb());
};

export const onAudioReady = (cb: () => void) => {
  if (unlocked && ctx) cb();
  else readyCallbacks.push(cb);
};

export const audioParts = () => {
  const c = live();
  if (!c || !ambientBus || !noiseBuf) return null;
  return { ctx: c, bus: ambientBus, noise: noiseBuf };
};

const tone = (freq: number, at: number, dur: number, type: OscillatorType = "sine", gain = 0.1, slideTo?: number, dest?: AudioNode) => {
  const c = live();
  const bus = dest ?? sfxBus;
  if (!c || !bus || !settings.sfx) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + dur + 0.03);
};

const hiss = (at: number, dur: number, freq: number, gain = 0.05, type: BiquadFilterType = "highpass", slideTo?: number, dest?: AudioNode) => {
  const c = live();
  const bus = dest ?? sfxBus;
  if (!c || !bus || !noiseBuf || !settings.sfx) return;
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  const f = c.createBiquadFilter();
  const g = c.createGain();
  src.buffer = noiseBuf;
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (slideTo) f.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(bus);
  src.start(t, Math.random() * 1.5);
  src.stop(t + dur + 0.03);
};

const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

export type SfxName =
  | "click"
  | "hover"
  | "open"
  | "close"
  | "success"
  | "error"
  | "coin"
  | "pop"
  | "toggleOn"
  | "toggleOff"
  | "correct"
  | "wrong"
  | "match"
  | "flip"
  | "win"
  | "swoosh";

export const sfx = (name: SfxName) => {
  switch (name) {
    case "click":
      tone(760, 0, 0.07, "sine", 0.09, 520);
      hiss(0, 0.025, 3000, 0.02);
      break;
    case "hover":
      tone(1250, 0, 0.03, "sine", 0.018);
      break;
    case "open":
      tone(420, 0, 0.12, "sine", 0.08, 640);
      tone(640, 0.07, 0.14, "triangle", 0.06, 880);
      break;
    case "close":
      tone(640, 0, 0.1, "sine", 0.07, 420);
      tone(420, 0.06, 0.12, "triangle", 0.05, 300);
      break;
    case "success":
      tone(659.25, 0, 0.14, "triangle", 0.09);
      tone(987.77, 0.1, 0.3, "triangle", 0.09);
      break;
    case "error":
      tone(220, 0, 0.16, "sawtooth", 0.05, 160);
      tone(196, 0.14, 0.22, "sawtooth", 0.05, 130);
      break;
    case "coin":
      tone(988, 0, 0.08, "square", 0.05);
      tone(1319, 0.08, 0.28, "square", 0.05);
      break;
    case "pop":
      tone(520, 0, 0.09, "sine", 0.12, 700);
      break;
    case "toggleOn":
      tone(520, 0, 0.07, "sine", 0.09);
      tone(780, 0.06, 0.1, "sine", 0.09);
      break;
    case "toggleOff":
      tone(780, 0, 0.07, "sine", 0.08);
      tone(520, 0.06, 0.1, "sine", 0.08);
      break;
    case "correct":
      tone(784, 0, 0.12, "triangle", 0.1);
      tone(1175, 0.09, 0.28, "triangle", 0.1);
      break;
    case "wrong":
      tone(250, 0, 0.2, "sawtooth", 0.06, 150);
      break;
    case "match":
      tone(880, 0, 0.09, "sine", 0.1);
      tone(1320, 0.07, 0.2, "sine", 0.1);
      break;
    case "flip":
      hiss(0, 0.06, 2200, 0.05, "bandpass", 3600);
      tone(600, 0, 0.05, "sine", 0.05, 900);
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.24, "triangle", 0.1));
      break;
    case "swoosh":
      hiss(0, 0.28, 400, 0.07, "bandpass", 3200);
      break;
  }
};

type Voice = { c: AudioContext; out: GainNode };

const voice = (): Voice | null => {
  const c = live();
  if (!c || !sfxBus || !settings.sfx) return null;
  const out = c.createGain();
  out.connect(sfxBus);
  return { c, out };
};

const fadeOut = (v: Voice) => {
  const t = v.c.currentTime;
  v.out.gain.cancelScheduledValues(t);
  v.out.gain.setValueAtTime(v.out.gain.value, t);
  v.out.gain.linearRampToValueAtTime(0, t + 0.06);
  window.setTimeout(() => v.out.disconnect(), 150);
};

const sequence = (build: (v: Voice) => Array<() => void>) => {
  let v: Voice | null = null;
  let stops: Array<() => void> = [];
  const timer = window.setTimeout(() => {
    v = voice();
    if (v) stops = build(v);
  }, 0);
  return () => {
    window.clearTimeout(timer);
    if (!v) return;
    fadeOut(v);
    const pending = stops;
    stops = [];
    window.setTimeout(() => {
      pending.forEach((stop) => {
        try {
          stop();
        } catch {
          return;
        }
      });
    }, 120);
  };
};

const SHAKE_SECONDS = 1.9;
const SHAKE_STEP_MS = 95;

export const sfxGachaShake = () =>
  sequence(({ c, out }) => {
    if (!noiseBuf) return [];
    const t0 = c.currentTime;
    const started = performance.now();
    const osc = c.createOscillator();
    const lp = c.createBiquadFilter();
    const og = c.createGain();
    osc.type = "sawtooth";
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(220, t0);
    lp.frequency.exponentialRampToValueAtTime(1400, t0 + SHAKE_SECONDS);
    osc.frequency.setValueAtTime(55, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + SHAKE_SECONDS);
    og.gain.setValueAtTime(0.0001, t0);
    og.gain.exponentialRampToValueAtTime(0.06, t0 + SHAKE_SECONDS);
    osc.connect(lp);
    lp.connect(og);
    og.connect(out);
    osc.start(t0);
    const src = c.createBufferSource();
    const bp = c.createBiquadFilter();
    const ng = c.createGain();
    src.buffer = noiseBuf;
    src.loop = true;
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(250, t0);
    bp.frequency.exponentialRampToValueAtTime(2600, t0 + SHAKE_SECONDS);
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.05, t0 + SHAKE_SECONDS);
    src.connect(bp);
    bp.connect(ng);
    ng.connect(out);
    src.start(t0);
    let n = 0;
    const timer = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - started) / (SHAKE_SECONDS * 1000));
      tone(85 + (n++ % 2) * 16 + k * 60, 0, 0.09, "square", 0.018 + 0.05 * k, undefined, out);
      hiss(0, 0.05, 600 + k * 900, 0.012 + 0.03 * k, "lowpass", undefined, out);
    }, SHAKE_STEP_MS);
    return [() => window.clearInterval(timer), () => osc.stop(), () => src.stop()];
  });

export const sfxGachaCrack = () =>
  sequence(({ out }) => {
    hiss(0, 0.14, 1800, 0.1, "highpass", undefined, out);
    tone(170, 0, 0.2, "sawtooth", 0.06, 70, out);
    tone(220, 0, 0.65, "sawtooth", 0.035, 1200, out);
    hiss(0, 0.65, 400, 0.05, "bandpass", 5000, out);
    for (let i = 0; i < 6; i++) tone(1700 + (i % 3) * 300, 0.14 + i * 0.08, 0.03, "square", 0.012, undefined, out);
    return [];
  });

export const sfxGachaBurst = (tier: number) =>
  sequence(({ out }) => {
    hiss(0, 0.07, 1400, 0.1, "bandpass", 2600, out);
    tone(320, 0, 0.12, "triangle", 0.07, 120, out);
    tone(130 - tier * 10, 0.1, 0.7 + tier * 0.08, "sine", 0.2, 36, out);
    hiss(0.1, 0.6 + tier * 0.1, 260, 0.12, "bandpass", 5200, out);
    [1568, 2093, 2637].forEach((f, i) => tone(f, 0.17 + i * 0.05, 0.5, "sine", 0.035, undefined, out));
    if (tier >= 3) hiss(0.14, 0.9, 5000, 0.05, "highpass", undefined, out);
    return [];
  });

export const sfxGachaReveal = (tier: number) =>
  sequence(({ out }) => {
    tone(260, 0, 0.3, "sine", 0.08, 720, out);
    hiss(0, 0.3, 700, 0.04, "bandpass", 3200, out);
    for (let i = 0; i <= tier; i++) tone(NOTES[i], 0.35 + i * 0.09, 0.28 + i * 0.03, "triangle", 0.085, undefined, out);
    hiss(1.1, 0.5, 3800, 0.04, "highpass", undefined, out);
    tone(1318.5, 1.16, 0.55, "sine", 0.06, undefined, out);
    if (tier >= 3) [NOTES[tier - 2], NOTES[tier], NOTES[tier] * 1.5].forEach((f) => tone(f, 1.16, 1, "sine", 0.05, undefined, out));
    return [];
  });

const INTERACTIVE = "button, a[href], [role=button], [role=tab], [role=menuitem], [role=option], [role=switch], summary, select, input[type=checkbox], input[type=radio], label[for]";

const target = (e: Event): HTMLElement | null => {
  const el = e.target instanceof Element ? (e.target.closest(INTERACTIVE) as HTMLElement | null) : null;
  if (!el) return null;
  if (el.closest("[data-sfx=off]")) return null;
  if (el instanceof HTMLButtonElement && el.disabled) return null;
  if (el.getAttribute("aria-disabled") === "true") return null;
  return el;
};

let installed = false;

export const installGlobalSfx = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const first = () => unlock();
  window.addEventListener("pointerdown", first, { capture: true });
  window.addEventListener("keydown", first, { capture: true });

  let lastHover: Element | null = null;
  let lastHoverAt = 0;

  window.addEventListener(
    "pointerdown",
    (e) => {
      const el = target(e);
      if (!el) return;
      const mode = el.dataset.sfx;
      if (mode === "none") return;
      if (el.matches("[role=switch], input[type=checkbox]")) return;
      sfx(mode === "pop" ? "pop" : "click");
    },
    { capture: true },
  );

  window.addEventListener(
    "change",
    (e) => {
      const t = e.target;
      if (t instanceof HTMLInputElement && (t.type === "checkbox" || t.type === "radio")) sfx(t.checked ? "toggleOn" : "toggleOff");
    },
    { capture: true },
  );

  window.addEventListener(
    "pointerover",
    (e) => {
      if (e.pointerType !== "mouse") return;
      const el = target(e);
      if (!el || el === lastHover) return;
      lastHover = el;
      const now = performance.now();
      if (now - lastHoverAt < 60) return;
      lastHoverAt = now;
      if (el.dataset.sfx === "none") return;
      sfx("hover");
    },
    { capture: true },
  );

  window.addEventListener(
    "pointerout",
    (e) => {
      if (e.target === lastHover) lastHover = null;
    },
    { capture: true },
  );

  const observer = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n instanceof Element && (n.matches("[data-slot=dialog-content]") || n.querySelector("[data-slot=dialog-content]"))) sfx("open");
      });
      r.removedNodes.forEach((n) => {
        if (n instanceof Element && (n.matches("[data-slot=dialog-content]") || n.querySelector("[data-slot=dialog-content]"))) sfx("close");
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const okToast = toast.success;
  const errToast = toast.error;
  toast.success = ((...args: Parameters<typeof toast.success>) => {
    sfx("success");
    return okToast(...args);
  }) as typeof toast.success;
  toast.error = ((...args: Parameters<typeof toast.error>) => {
    sfx("error");
    return errToast(...args);
  }) as typeof toast.error;

  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend().catch(() => undefined);
    else if (unlocked) void ctx.resume().catch(() => undefined);
  });
};
