import { useEffect } from "react";
import { audioParts, getSoundSettings, onAudioReady, subscribeSound } from "./sfx";

type Parts = NonNullable<ReturnType<typeof audioParts>>;

interface Scape {
  out: GainNode;
  stops: Array<() => void>;
}

const wind = (p: Parts, scape: Scape, level: number, cutoff: number, speed: number) => {
  const { ctx, noise } = p;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = cutoff;
  f.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.value = level;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = speed;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = cutoff * 0.45;
  const lfoLevel = ctx.createGain();
  lfoLevel.gain.value = level * 0.5;
  lfo.connect(lfoGain);
  lfoGain.connect(f.frequency);
  lfo.connect(lfoLevel);
  lfoLevel.connect(g.gain);
  src.connect(f);
  f.connect(g);
  g.connect(scape.out);
  src.start();
  lfo.start();
  scape.stops.push(() => {
    src.stop();
    lfo.stop();
  });
};

const waves = (p: Parts, scape: Scape, level: number) => {
  const { ctx, noise } = p;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 700;
  const g = ctx.createGain();
  g.gain.value = level * 0.55;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.11;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = level * 0.45;
  lfo.connect(lfoGain);
  lfoGain.connect(g.gain);
  src.connect(f);
  f.connect(g);
  g.connect(scape.out);
  src.start();
  lfo.start();
  scape.stops.push(() => {
    src.stop();
    lfo.stop();
  });
};

const pad = (p: Parts, scape: Scape, freqs: number[], gain: number, type: OscillatorType = "sine", cutoff = 900, tremolo = 0.08) => {
  const { ctx } = p;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.value = gain;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = tremolo;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = gain * 0.5;
  lfo.connect(lfoGain);
  lfoGain.connect(g.gain);
  f.connect(g);
  g.connect(scape.out);
  const oscs = freqs.flatMap((fr, i) =>
    [-4, 4].map((d) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = fr;
      o.detune.value = d * (i + 1);
      o.connect(f);
      o.start();
      return o;
    }),
  );
  lfo.start();
  scape.stops.push(() => {
    oscs.forEach((o) => o.stop());
    lfo.stop();
  });
};

const every = (scape: Scape, min: number, max: number, fn: () => void) => {
  let timer = 0;
  const next = () => {
    timer = window.setTimeout(() => {
      fn();
      next();
    }, min + Math.random() * (max - min));
  };
  next();
  scape.stops.push(() => window.clearTimeout(timer));
};

const note = (p: Parts, scape: Scape, freq: number, dur: number, gain: number, type: OscillatorType = "sine", slideTo?: number, filter?: number) => {
  const { ctx } = p;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.04, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = filter;
    o.connect(f);
    f.connect(g);
  } else o.connect(g);
  g.connect(scape.out);
  o.start(t);
  o.stop(t + dur + 0.05);
};

const click = (p: Parts, scape: Scape, freq: number, gain: number) => {
  const { ctx, noise } = p;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  src.connect(f);
  f.connect(g);
  g.connect(scape.out);
  src.start(t, Math.random());
  src.stop(t + 0.06);
};

const bell = (p: Parts, scape: Scape, freq: number, gain: number, dur = 2.2) => {
  [1, 2.76, 5.4].forEach((m, i) => note(p, scape, freq * m, dur / (i + 1), gain / (i * 1.8 + 1)));
};

const chirp = (p: Parts, scape: Scape, base: number) => {
  const n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    window.setTimeout(() => note(p, scape, base + Math.random() * 600, 0.09, 0.05, "sine", base * 1.6 + Math.random() * 500), i * 110);
  }
};

const cricket = (p: Parts, scape: Scape, gain: number) => {
  for (let i = 0; i < 5; i++) window.setTimeout(() => note(p, scape, 4300, 0.05, gain, "sine"), i * 70);
};

const owl = (p: Parts, scape: Scape) => {
  note(p, scape, 360, 0.5, 0.07, "sine", 330, 800);
  window.setTimeout(() => note(p, scape, 330, 0.7, 0.07, "sine", 290, 800), 650);
};

const bubble = (p: Parts, scape: Scape) => {
  const f = 400 + Math.random() * 700;
  note(p, scape, f, 0.12, 0.05, "sine", f * 1.8);
};

const build = (id: string, p: Parts): Scape => {
  const out = p.ctx.createGain();
  out.gain.value = 0;
  out.connect(p.bus);
  const s: Scape = { out, stops: [] };
  switch (id) {
    case "halloween":
      wind(p, s, 0.1, 420, 0.07);
      pad(p, s, [55, 58.3], 0.05, "sawtooth", 260, 0.05);
      every(s, 9000, 18000, () => owl(p, s));
      every(s, 14000, 26000, () => bell(p, s, 196, 0.03, 3));
      break;
    case "natale":
      wind(p, s, 0.05, 500, 0.06);
      pad(p, s, [130.8, 196], 0.025, "sine", 700, 0.06);
      every(s, 6000, 12000, () => {
        for (let i = 0; i < 5; i++) window.setTimeout(() => bell(p, s, 1500 + Math.random() * 900, 0.014, 0.9), i * 90);
      });
      every(s, 12000, 22000, () => bell(p, s, [392, 523.25, 659.25][Math.floor(Math.random() * 3)], 0.04, 2.4));
      break;
    case "biblioteca":
      wind(p, s, 0.03, 260, 0.05);
      pad(p, s, [82.4], 0.02, "sine", 300, 0.04);
      {
        let flip = false;
        every(s, 1000, 1000, () => {
          flip = !flip;
          click(p, s, flip ? 1900 : 1500, 0.05);
        });
      }
      every(s, 14000, 28000, () => {
        const { ctx, noise } = p;
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const f = ctx.createBiquadFilter();
        f.type = "highpass";
        f.frequency.value = 2400;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.03, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        src.connect(f);
        f.connect(g);
        g.connect(s.out);
        src.start(t, Math.random());
        src.stop(t + 0.4);
      });
      break;
    case "spazio":
      pad(p, s, [65.4, 98, 130.8], 0.05, "sine", 600, 0.04);
      pad(p, s, [523.25, 784], 0.008, "sine", 2000, 0.07);
      every(s, 6000, 12000, () => note(p, s, 1800 + Math.random() * 1500, 1.6, 0.012, "sine", undefined));
      break;
    case "oceano":
      waves(p, s, 0.12);
      pad(p, s, [73.4], 0.02, "sine", 300, 0.05);
      every(s, 900, 3000, () => bubble(p, s));
      break;
    case "tramonto":
      wind(p, s, 0.07, 650, 0.08);
      every(s, 3000, 8000, () => chirp(p, s, 2200 + Math.random() * 700));
      break;
    case "giappone":
      wind(p, s, 0.035, 500, 0.06);
      every(s, 1500, 4000, () => cricket(p, s, 0.01));
      every(s, 7000, 14000, () => {
        const scale = [587.33, 659.25, 783.99, 880, 1046.5];
        for (let i = 0; i < 3; i++) window.setTimeout(() => bell(p, s, scale[Math.floor(Math.random() * scale.length)], 0.025, 1.8), i * 260);
      });
      break;
    case "foresta":
      wind(p, s, 0.06, 450, 0.07);
      every(s, 1200, 3500, () => cricket(p, s, 0.011));
      every(s, 12000, 24000, () => owl(p, s));
      every(s, 5000, 11000, () => note(p, s, 2600 + Math.random() * 800, 0.5, 0.012, "sine"));
      break;
    case "deserto":
      wind(p, s, 0.12, 380, 0.05);
      every(s, 12000, 24000, () => note(p, s, 180, 2.4, 0.03, "sine", 150, 400));
      every(s, 3000, 7000, () => cricket(p, s, 0.006));
      break;
    case "citta":
      pad(p, s, [55, 110], 0.04, "sawtooth", 350, 0.1);
      wind(p, s, 0.035, 900, 0.09);
      every(s, 7000, 16000, () => {
        const { ctx, noise } = p;
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.setValueAtTime(300, t);
        f.frequency.exponentialRampToValueAtTime(1100, t + 1.6);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.04, t + 0.8);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        src.connect(f);
        f.connect(g);
        g.connect(s.out);
        src.start(t, Math.random());
        src.stop(t + 2);
      });
      break;
    case "aurora":
      pad(p, s, [130.8, 196, 261.6], 0.035, "sine", 1200, 0.05);
      pad(p, s, [784, 1174.7], 0.007, "sine", 2400, 0.09);
      every(s, 5000, 11000, () => bell(p, s, [784, 987.77, 1174.7][Math.floor(Math.random() * 3)], 0.02, 3));
      break;
    default:
      pad(p, s, [110, 164.8], 0.03, "sine", 500, 0.05);
      wind(p, s, 0.03, 400, 0.06);
  }
  return s;
};

let current: { id: string; scape: Scape } | null = null;
let wanted = "none";

const release = (scape: Scape, ctx: AudioContext) => {
  const t = ctx.currentTime;
  scape.out.gain.cancelScheduledValues(t);
  scape.out.gain.setValueAtTime(scape.out.gain.value, t);
  scape.out.gain.linearRampToValueAtTime(0, t + 1.4);
  window.setTimeout(() => {
    scape.stops.splice(0).forEach((s) => {
      try {
        s();
      } catch {
        return;
      }
    });
    scape.out.disconnect();
  }, 1500);
};

const sync = () => {
  const settings = getSoundSettings();
  const wantId = settings.ambient && wanted !== "none" ? wanted : "none";
  if (current && current.id === wantId) return;
  const parts = audioParts();
  if (!parts) return;
  if (current) {
    release(current.scape, parts.ctx);
    current = null;
  }
  if (wantId === "none") return;
  const scape = build(wantId, parts);
  const t = parts.ctx.currentTime;
  scape.out.gain.setValueAtTime(0, t);
  scape.out.gain.linearRampToValueAtTime(1, t + 2);
  current = { id: wantId, scape };
};

let hooked = false;

export const setAmbient = (id: string) => {
  wanted = id;
  if (!hooked) {
    hooked = true;
    subscribeSound(sync);
  }
  onAudioReady(sync);
  sync();
};

export const useAmbient = (id: string) => {
  useEffect(() => {
    setAmbient(id);
  }, [id]);
};
