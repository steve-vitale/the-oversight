// @ontology
// system: regional-audio
// description: Shared regional creature synth voices for the game mixer and Audio Lab. Presentation only; never draws game randomness or changes combat timing.
// provides:
//   - play (code: regional-audio.js)
//   - install (code: regional-audio.js)
// consumes:
//   - (none documented)
(function (root) {
  'use strict';
  // Authored stand-ins, not field recordings. Frequency, sweep, duration,
  // waveform and filtered breath distinguish each creature's material.
  const specs = {
    sporefallShimmer: { hz: 520, end: 610, dur: 0.7, type: 'sine', band: 1900, breath: 0.08 },
    sporefallBreath: { hz: 110, end: 62, dur: 1.05, type: 'triangle', band: 700, breath: 0.65 },
    rutKingBellow: { hz: 92, end: 64, dur: 1.1, type: 'sawtooth', band: 390, breath: 0.15 },
    rutKingCharge: { hz: 130, end: 48, dur: 0.55, type: 'sawtooth', band: 1100, breath: 0.45 },
    wireCrackle: { hz: 1550, end: 310, dur: 0.42, type: 'square', band: 3400, breath: 0.55 },
    anacondaCoil: { hz: 64, end: 42, dur: 0.95, type: 'triangle', band: 460, breath: 0.6 },
    dustboarGrunt: { hz: 145, end: 78, dur: 0.45, type: 'sawtooth', band: 850, breath: 0.3 },
    sunbackHiss: { hz: 210, end: 155, dur: 0.8, type: 'triangle', band: 2600, breath: 0.8 },
    tigerBreath: { hz: 105, end: 72, dur: 0.8, type: 'sawtooth', band: 600, breath: 0.5 },
    crocJaw: { hz: 75, end: 32, dur: 0.32, type: 'triangle', band: 1300, breath: 0.7 },
    mountainTigerGrowl: { hz: 165, end: 85, dur: 0.95, type: 'sawtooth', band: 980, breath: 0.35 },
    tanukiDrum: { hz: 190, end: 48, dur: 0.38, type: 'sine', band: 340, breath: 0.1, beats: [0, 0.24] },
  };
  const monsters = {
    murkcap: { notice: 'sporefallShimmer', aggro: 'sporefallBreath', why: 'The cap breathes spores rather than roaring. A thin shimmer gives way to a low, dusty exhale: the fungal body is an air chamber, and the threat lives in the cloud.' },
    rut_king: { notice: 'rutKingBellow', aggro: 'rutKingCharge', why: 'The stag claims the clearing with a long, low bellow; its charge compresses that breath into a rough descending grunt. The voice follows the rack and lungs, without adding a new attack warning.' },
    living_wire: { notice: 'wireCrackle', aggro: 'wireCrackle', why: 'The eel is a living electrical fault in the water. A brief, dry-edged crackle bends down in pitch as the charge drains. This is a creature voice, not an extra grid telegraph or a promise of discharge timing.' },
    anaconda_empress: { notice: null, aggro: 'anacondaCoil', why: 'The empress is pressure and wet muscle rather than a mammal roar. Low friction and breath sink together as a heavy coil tightens; the sound suggests mass without announcing an otherwise hidden ambush.' },
    dustboar: { notice: 'dustboarGrunt', aggro: 'dustboarGrunt', why: 'A short, abrasive boar grunt breaks through dusty breath. The compact falling note belongs to a heavy body close to the ground; its grit distinguishes it from the long territorial stag bellow.' },
    sunback: { notice: 'sunbackHiss', aggro: 'sunbackHiss', why: 'The monitor expels a high, grainy hiss over a low body tone. Its sustained breath is reptilian and dry, keeping the sun-warmed animal distinct from electrical crackle or a cat growl.' },
    sweeps_week: { notice: null, aggro: 'tigerBreath', why: 'The tiger has a low, rough breath once combat is underway. It adds no pre-contact world warning and changes no silent ambush or grid indicator: the absence of birds remains the authored clue.' },
    cliffhanger: { notice: 'crocJaw', aggro: 'crocJaw', why: 'A heavy jaw closes with a brief wet clack and a low thump. The crocodile stays terse; it does not borrow a mammal roar or add a warning phase to the water ambush.' },
    sanjun: { notice: 'mountainTigerGrowl', aggro: 'mountainTigerGrowl', why: 'The mountain tiger carries a higher, longer chest growl than the quiet stalker. A rough falling tone and restrained breath give it weight without changing the pounce, cover or facing rules.' },
    drumbelly_tanuki: { notice: 'tanukiDrum', aggro: 'tanukiDrum', why: 'Two hollow, falling drum notes make the inflated belly audible. This is the creature voice; the existing swell animation and combat windup still own the counter window and thunder timing.' },
  };
  function play(name, port) {
    const spec = specs[name];
    if (!spec || !port) return null; // Muted game mixer deliberately returns no port.
    const { ctx, sfx } = port;
    const bus = ctx.createGain(), sources = [], nodes = [bus], beats = spec.beats || [0];
    const duration = spec.dur + beats[beats.length - 1], now = ctx.currentTime;
    bus.gain.value = 0.16; bus.connect(sfx);
    let pending = 0, stopped = false;
    function envelope(node, at, level) {
      const gain = ctx.createGain(); nodes.push(gain);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(level, at + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + spec.dur);
      node.connect(gain); gain.connect(bus);
    }
    function schedule(node, at) {
      sources.push(node); pending++;
      node.onended = function () {
        node._regionalEnded = true;
        if (--pending === 0) nodes.forEach(n => n.disconnect());
      };
      node.start(at); node.stop(at + spec.dur);
    }
    // Private deterministic noise: playback never consumes Math.random,
    // including when the player auditions several voices between turns.
    let bits = 2166136261;
    for (const c of name) bits = Math.imul(bits ^ c.charCodeAt(0), 16777619);
    for (const offset of beats) {
      const at = now + offset, tone = ctx.createOscillator(); nodes.push(tone);
      tone.type = spec.type;
      tone.frequency.setValueAtTime(spec.hz, at);
      tone.frequency.exponentialRampToValueAtTime(spec.end, at + spec.dur);
      envelope(tone, at, 0.45); schedule(tone, at);
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * spec.dur), ctx.sampleRate), data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) { bits ^= bits << 13; bits ^= bits >>> 17; bits ^= bits << 5; data[i] = (bits >>> 0) / 2147483648 - 1; }
      const breath = ctx.createBufferSource(), filter = ctx.createBiquadFilter(); nodes.push(breath, filter);
      breath.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = spec.band; filter.Q.value = 0.65;
      breath.connect(filter); envelope(filter, at, spec.breath); schedule(breath, at);
    }
    return { hook: name, duration, nodes: nodes.length, stop() {
      if (stopped) return; stopped = true;
      sources.forEach(n => { if (!n._regionalEnded) n.stop(ctx.currentTime); });
    } };
  }
  function install(audio) {
    for (const name of Object.keys(specs)) {
      if (audio[name]) throw new Error('Duplicate regional audio hook: ' + name);
      audio[name] = function () {
        const port = audio.port();
        if (!port) return null;
        if (port.duck) port.duck();
        return play(name, port);
      };
    }
    return audio;
  }
  const regionalAudio = { specs, monsters, play, install };
  root.Scattering = root.Scattering || {};
  root.Scattering.regionalAudio = regionalAudio;
  if (typeof module !== 'undefined' && module.exports) module.exports = regionalAudio;
})(globalThis);
