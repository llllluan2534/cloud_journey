// Web Audio API sound synthesis for cozy, soothing ambient micro-sounds
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a soothing wind chime sound (Tiếng chuông gió khẽ ngân êm dịu)
 */
export function playChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Pentatonic frequencies for sweet celestial chime: C6, E6, G6, B6, C7
  const notes = [1046.5, 1318.5, 1568.0, 1975.5, 2093.0];
  // Pick 3-4 random notes for natural chime variation
  const shuffled = [...notes].sort(() => 0.5 - Math.random()).slice(0, 3);

  shuffled.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + index * 0.06);

    // Soft attack & long dreamy decay
    const startTime = now + index * 0.06;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 1.7);
  });
}

/**
 * Play gentle rain droplet sounds (Tiếng mưa rơi tí tách nhẹ nhàng)
 */
export function playRainSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const numDrops = 4;

  for (let i = 0; i < numDrops; i++) {
    const delay = i * 0.12 + Math.random() * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pitch drops quickly to mimic water droplet "plop"
    const startFreq = 1200 + Math.random() * 400;
    const endFreq = 400 + Math.random() * 200;

    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, now + delay);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + 0.05);

    gain.gain.setValueAtTime(0.001, now + delay);
    gain.gain.linearRampToValueAtTime(0.09, now + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.15);
  }
}

/**
 * Play a magical twinkle sound for shooting star (Tiếng sao băng lướt qua)
 */
export function playShootingStarSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(2400, now + 0.8);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 2.5);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 3.1);
}

/**
 * Play a cute, gentle sheep bleat sound (Tiếng cừu "beee~" êm ái, dễ thương)
 */
export function playSheepSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();

  // Sheep bleat pitch (~340Hz)
  osc.type = "triangle";
  osc.frequency.setValueAtTime(340, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.65);

  // Vibrato (the classic gentle sheep wobble: ~11Hz)
  vibrato.frequency.setValueAtTime(11, now);
  vibratoGain.gain.setValueAtTime(16, now);
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);

  // Envelope: soft attack, gentle bleat, natural decay
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.07);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

  osc.connect(gain);
  gain.connect(ctx.destination);

  vibrato.start(now);
  osc.start(now);

  vibrato.stop(now + 0.7);
  osc.stop(now + 0.7);
}

