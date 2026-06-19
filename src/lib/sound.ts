/* ─────────────────────────────────────────────────────────────────────────────
   AIryan FC — cinematic audio cue hooks for the walkout.

   Synthesized on the fly (no asset files). Built from filtered noise sweeps and
   sub-bass hits through a generated reverb, so the cues read cinematic
   (whoosh / riser / impact) rather than tonal/cartoonish.

   `cue(type)` fires at each reveal beat. Audio only ever plays during the
   walkout, which the visitor starts with a tap (a user gesture), so autoplay
   policies are satisfied. Opt out with `setSoundEnabled(false)`; never used
   under reduced-motion.
   ──────────────────────────────────────────────────────────────────────────── */

type CueType = "whoosh" | "beat" | "rise" | "impact";

let audio: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let enabled = true;

function build(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audio) {
    audio = new Ctor();
    master = audio.createGain();
    master.gain.value = 0.9;
    master.connect(audio.destination);

    // Generated impulse response → a short cinematic room tail.
    reverb = audio.createConvolver();
    const len = Math.floor(audio.sampleRate * 1.6);
    const imp = audio.createBuffer(2, len, audio.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = imp.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    reverb.buffer = imp;
    const rgain = audio.createGain();
    rgain.gain.value = 0.5;
    reverb.connect(rgain).connect(master);
  }
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

/** A burst of filtered noise — the body of whooshes, risers and impacts. */
function noise(
  a: AudioContext,
  o: {
    dur: number;
    type: BiquadFilterType;
    f0: number;
    f1: number;
    q?: number;
    gain: number;
    wet?: number;
  }
) {
  const frames = Math.floor(a.sampleRate * o.dur);
  const buf = a.createBuffer(1, frames, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;

  const filter = a.createBiquadFilter();
  filter.type = o.type;
  filter.Q.value = o.q ?? 0.7;
  const t0 = a.currentTime;
  filter.frequency.setValueAtTime(o.f0, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(o.f1, 20), t0 + o.dur);

  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain, t0 + Math.min(0.08, o.dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);

  src.connect(filter).connect(g);
  if (master) g.connect(master);
  if (reverb && o.wet) {
    const send = a.createGain();
    send.gain.value = o.wet;
    g.connect(send).connect(reverb);
  }
  src.start(t0);
  src.stop(t0 + o.dur + 0.05);
}

/** A pitched sub for weight under impacts (kept low + short, never a melody). */
function sub(a: AudioContext, from: number, to: number, dur: number, gain: number) {
  const t0 = a.currentTime;
  const osc = a.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 20), t0 + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  if (master) g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

export function cue(type: CueType) {
  if (!enabled) return;
  const a = build();
  if (!a) return;
  try {
    switch (type) {
      case "whoosh":
        // Air movement as the figure emerges.
        noise(a, { dur: 0.7, type: "bandpass", f0: 1800, f1: 300, q: 0.8, gain: 0.12, wet: 0.4 });
        break;
      case "beat":
        // Soft reveal tick: a short filtered "tss" + a touch of low body.
        noise(a, { dur: 0.22, type: "highpass", f0: 1200, f1: 3000, q: 0.6, gain: 0.09, wet: 0.3 });
        sub(a, 140, 70, 0.18, 0.06);
        break;
      case "rise":
        // Tension riser under the 0→99 count.
        noise(a, { dur: 1.25, type: "bandpass", f0: 200, f1: 5000, q: 1.4, gain: 0.1, wet: 0.5 });
        break;
      case "impact":
        // Cinematic boom: sub drop + filtered noise hit + reverb tail.
        sub(a, 90, 34, 0.8, 0.32);
        noise(a, { dur: 0.5, type: "lowpass", f0: 4000, f1: 200, q: 0.7, gain: 0.18, wet: 0.7 });
        break;
    }
  } catch {
    /* audio is a non-critical enhancement */
  }
}
