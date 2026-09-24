// Lofi study radio. Every sound is generated in the browser with the Web Audio API,
// so there are no audio files and nothing copyrighted. Off until someone presses play.
(function(){
"use strict";
const btn = document.getElementById("lofiBtn"), vol = document.getElementById("lofiVol"), label = document.getElementById("lofiLabel");
if (!btn) return;
const store = { get(k, d){ try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch(e){ return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };
vol.value = store.get("purr_lofi_vol", 0.5);

let ctx = null, master, lp, noiseBuf, playing = false, timer = null;
let nextTime = 0, step = 0;
const BPM = 74, STEP = 60 / BPM / 2;          // eighth notes
// Fmaj7, Em7, Dm7, Cmaj7 (two bars each), voiced low and soft
const CHORDS = [[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]];
const SCALE = [72,74,76,79,81,84];           // C major pentatonic for the melody
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

function setup(){
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0;
  lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800; lp.Q.value = 0.4;
  master.connect(lp); lp.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  crackle();
}
function crackle(){
  // vinyl hiss plus the odd pop
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000;
  const g = ctx.createGain(); g.gain.value = 0.012;
  src.connect(hp); hp.connect(g); g.connect(master); src.start();
}
function keys(t, notes, len){
  notes.forEach((m, i) => {
    [0, 7].forEach(detune => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = detune ? "triangle" : "sine"; o.frequency.value = hz(m); o.detune.value = detune;
      const at = t + i * 0.025;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(detune ? 0.018 : 0.045, at + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0008, at + len);
      o.connect(g); g.connect(master); o.start(at); o.stop(at + len + 0.1);
    });
  });
}
function bell(t, m){
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.value = hz(m);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.4);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.5);
}
function kick(t){
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
  g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.4);
}
function noiseHit(t, freq, gain, len){
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 0.9;
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + len);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + len + 0.05);
}
function schedule(){
  while (nextTime < ctx.currentTime + 0.2) {
    const s = step % 64, beat = s % 8, swing = (s % 2) ? STEP * 0.18 : 0, t = nextTime + swing;
    if (s % 16 === 0) keys(t, CHORDS[(s / 16) | 0], STEP * 15);
    if (beat === 0 || beat === 5) kick(t);
    if (beat === 2 || beat === 6) noiseHit(t, 1800, 0.07, 0.18);
    noiseHit(t, 7000, s % 2 ? 0.012 : 0.02, 0.05);
    if (Math.random() < 0.16 && beat !== 0) bell(t, SCALE[(Math.random() * SCALE.length) | 0]);
    nextTime += STEP; step++;
  }
}
function fade(to){ const now = ctx.currentTime; master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(to, now + 0.8); }
function render(){
  btn.setAttribute("aria-pressed", playing ? "true" : "false");
  label.textContent = playing ? "lofi: on" : "lofi: off";
  document.body.classList.toggle("lofi-on", playing);
}
btn.addEventListener("click", async () => {
  if (!ctx) setup();
  if (ctx.state === "suspended") { try { await ctx.resume(); } catch(e){} }
  playing = !playing;
  if (playing) { nextTime = ctx.currentTime + 0.1; step = 0; schedule(); timer = setInterval(schedule, 50); fade(Number(vol.value) * 0.9); }
  else { fade(0); clearInterval(timer); }
  render();
});
vol.addEventListener("input", () => { store.set("purr_lofi_vol", Number(vol.value)); if (ctx && playing) fade(Number(vol.value) * 0.9); });
render();
})();
