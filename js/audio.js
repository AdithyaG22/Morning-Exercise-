// Beeps (Web Audio) and voice cues (speech synthesis). Both built into the browser — no sound files.
let ctx = null;

export const sound = { beeps: true, voice: true };

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* audio not available */ }
}

export function beep(freq = 880, ms = 140, vol = 0.25) {
  if (!sound.beeps || !ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + ms / 1000 + 0.05);
}

export function say(text) {
  if (!sound.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.lang = 'en-US';
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
