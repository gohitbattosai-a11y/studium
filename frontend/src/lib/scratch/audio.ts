let ctx: AudioContext | null = null;

const context = (): AudioContext | null => {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

const beep = (freq: number, start: number, dur: number, type: OscillatorType = "square", gain = 0.07) => {
  const c = context();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(gain, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.02);
};

export const unlockAudio = () => {
  context();
};

export const playSound = (name: string) => {
  switch (name) {
    case "coin":
      beep(988, 0, 0.08);
      beep(1319, 0.08, 0.25);
      break;
    case "win":
      [523, 659, 784, 1047].forEach((f, i) => beep(f, i * 0.11, 0.2, "triangle", 0.09));
      break;
    case "lose":
      [392, 330, 262].forEach((f, i) => beep(f, i * 0.14, 0.22, "sawtooth", 0.06));
      break;
    case "pop":
      beep(520, 0, 0.09, "sine", 0.12);
      break;
    case "laser":
      beep(1400, 0, 0.05, "sawtooth", 0.05);
      beep(900, 0.05, 0.05, "sawtooth", 0.05);
      beep(500, 0.1, 0.08, "sawtooth", 0.05);
      break;
    default:
      beep(660, 0, 0.18);
  }
};

export const playTone = (note: number, secs: number) => {
  if (secs <= 0) return;
  const freq = 440 * Math.pow(2, (Math.max(0, Math.min(127, note)) - 69) / 12);
  beep(freq, 0, Math.min(secs, 3), "triangle", 0.1);
};
