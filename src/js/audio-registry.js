// @ontology
// system: audio-registry
// description: File-backed audio placeholder registry (Steve 2026-10-12). The 32 judged synth monster signatures ship as PLACEHOLDER-flagged MP3s (src/audio/signatures/); real animal field recordings back 8 animal pools (placeholder:false, see src/audio/animals/ATTRIBUTION.md); weapon/item sounds that never existed are synth placeholders (src/audio/weapons/). Single source of truth for placeholder:true tagging; Game.audioEvent (game.js) plays files first with synth fallback; the debug board reads tags from this data.
// provides:
//   - SIGNATURES: 32 hook-name -> {file, placeholder:true, label, monster} entries
//   - MONSTER_SIG: 29 wave 3-5 monster ids -> their primary signature hook
//   - ANIMALS: 10 pools incl. 2 documented gaps (raccoon, turtle)
//   - WEAPONS: 9 weapon/item placeholder hooks
//   - resolveHook: DOM-free hook resolver (name) -> {kind, file, placeholder, label} or null
//   - AudioRegistry: public surface bundling the above
var AudioRegistry = (function () {
  'use strict';
  var SIG_DIR = 'src/audio/signatures/';
  var W2_DIR = 'src/audio/wave2/';
  var ANI_DIR = 'src/audio/animals/';
  var WPN_DIR = 'src/audio/weapons/';

  // Wave 3-5 monster signature placeholders. hook -> file.
  // monsterId -> primary hook is in MONSTER_SIG.
  var SIGNATURES = {
    congregationInvite:  { file: SIG_DIR + 'sfx-congregation-invite.mp3',  placeholder: true, monster: 'congregation',      label: 'The Congregation invites you — PLACEHOLDER' },
    congregationGeas:    { file: SIG_DIR + 'sfx-congregation-geas.mp3',    placeholder: false, monster: 'congregation',      label: 'The Congregation binds you — PLACEHOLDER' },
    congregationAbsolve: { file: SIG_DIR + 'sfx-congregation-absolve.mp3', placeholder: false, monster: 'congregation',      label: 'The Congregation releases you — PLACEHOLDER' },
    strikeShutdown:      { file: SIG_DIR + 'sfx-strike-shutdown.mp3',      placeholder: false, monster: 'strike',            label: 'The Strike dies — PLACEHOLDER' },
    suburbHum:           { file: SIG_DIR + 'sfx-suburb-hum.mp3',           placeholder: false, monster: 'suburb',            label: 'The Suburb aura — PLACEHOLDER' },
    focusGroupMurmur:    { file: SIG_DIR + 'sfx-focusgroup-murmur.mp3',   placeholder: false, monster: 'focus_group',       label: 'Focus Group deliberates — PLACEHOLDER' },
    redactorPoint:       { file: SIG_DIR + 'sfx-redactor-censor.mp3',      placeholder: false, monster: 'redactor',          label: 'The Redactor censors — PLACEHOLDER' },
    gavelVerdict:        { file: SIG_DIR + 'sfx-gavel-verdict.mp3',        placeholder: true, monster: 'gavel',             label: 'The Gavel judges — PLACEHOLDER' },
    spoolReplay:         { file: SIG_DIR + 'sfx-spool-tangle.mp3',         placeholder: false, monster: 'spool',             label: 'The Spool tangles — PLACEHOLDER' },
    chorusBeat:          { file: SIG_DIR + 'sfx-chorus_line-unison.mp3',   placeholder: true, monster: 'chorus_line',       label: 'Chorus Line syncs — PLACEHOLDER' },
    tosClause:           { file: SIG_DIR + 'sfx-terms_of_service-fineprint.mp3', placeholder: false, monster: 'terms_of_service', label: 'Terms of Service enforces — PLACEHOLDER' },
    callbackRing:        { file: SIG_DIR + 'sfx-callback-ringback.mp3',    placeholder: true, monster: 'callback',          label: 'Callback calls back — PLACEHOLDER' },
    bufferStall:         { file: SIG_DIR + 'sfx-buffering-spin.mp3',       placeholder: false, monster: 'buffering',         label: 'Buffering stalls — PLACEHOLDER' },
    adbreakCut:          { file: SIG_DIR + 'sfx-ad_break-jingle.mp3',      placeholder: true, monster: 'ad_break',          label: 'Ad Break interrupts — PLACEHOLDER' },
    influencerRecruit:   { file: SIG_DIR + 'sfx-influencer-shutter.mp3',   placeholder: false, monster: 'influencer',        label: 'The Influencer goes live — PLACEHOLDER' },
    auditTax:            { file: SIG_DIR + 'sfx-audit-stamp.mp3',           placeholder: true, monster: 'audit',             label: 'The Audit stamps — PLACEHOLDER' },
    reunionMirror:       { file: SIG_DIR + 'sfx-reunion-calling.mp3',      placeholder: false, monster: 'reunion',           label: 'The Reunion calls — PLACEHOLDER' },
    niWatch:             { file: SIG_DIR + 'sfx-nielsen-watch.mp3',        placeholder: false, monster: 'nielsen',           label: 'Nielsen locks on — PLACEHOLDER' },
    eaterGorge:          { file: SIG_DIR + 'sfx-eater-gorge.mp3',           placeholder: true, monster: 'eater',             label: 'The Eater feeds — PLACEHOLDER' },
    algorithmTick:       { file: SIG_DIR + 'sfx-algorithm-tick.mp3',       placeholder: true, monster: 'algorithm',         label: 'The Algorithm calculates — PLACEHOLDER' },
    heraldTrumpet:       { file: SIG_DIR + 'sfx-herald-trumpet.mp3',       placeholder: false, monster: 'herald',            label: 'The Herald announces — PLACEHOLDER' },
    cxDescend:           { file: SIG_DIR + 'sfx-cancellation-descend.mp3', placeholder: true, monster: 'cancellation',      label: 'Cancellation axes it — PLACEHOLDER' },
    edCut:               { file: SIG_DIR + 'sfx-editor-cut.mp3',           placeholder: false, monster: 'editor',            label: 'The Editor cuts — PLACEHOLDER' },
    rrClap:              { file: SIG_DIR + 'sfx-rerun-clap.mp3',            placeholder: true, monster: 'rerun',             label: 'The Rerun encores — PLACEHOLDER' },
    spSpoil:             { file: SIG_DIR + 'sfx-spoiler-spoil.mp3',         placeholder: false, monster: 'spoiler',           label: 'Spoiler spoils — PLACEHOLDER' },
    tsTick:              { file: SIG_DIR + 'sfx-timeslot-tick.mp3',        placeholder: false, monster: 'timeslot',          label: 'Timeslot counts down — PLACEHOLDER' },
    fiTitleCard:         { file: SIG_DIR + 'sfx-finale-titlecard.mp3',     placeholder: false, monster: 'finale',            label: 'The Finale arrives — PLACEHOLDER' },
    fiSacrifice:         { file: SIG_DIR + 'sfx-finale-sacrifice.mp3',    placeholder: false, monster: 'finale',            label: "The Finale's rite — PLACEHOLDER" },
    eulogyVerse:         { file: SIG_DIR + 'sfx-eulogy-verse.mp3',         placeholder: false, monster: 'eulogy',            label: 'The Eulogy speaks — PLACEHOLDER' },
    nnNote:              { file: SIG_DIR + 'sfx-network_note-slip.mp3',    placeholder: false, monster: 'network_note',      label: 'Network Note mandates — PLACEHOLDER' },
    fiCrewQuiet:         { file: SIG_DIR + 'sfx-finale_crew-quiet.mp3',    placeholder: true, monster: 'finale_crew',       label: 'Finale Crew rolls — PLACEHOLDER' },
    fiOpeningSting:      { file: SIG_DIR + 'sfx-finale_opening-sting.mp3', placeholder: true, monster: 'finale_opening',    label: 'Finale Opening themes you — PLACEHOLDER' },
  };

  // Every wave 3-5 monster id -> its PRIMARY signature hook (exactly one).
  var MONSTER_SIG = {
    congregation: 'congregationInvite', strike: 'strikeShutdown',
    suburb: 'suburbHum', focus_group: 'focusGroupMurmur',
    redactor: 'redactorPoint', gavel: 'gavelVerdict', spool: 'spoolReplay',
    chorus_line: 'chorusBeat', terms_of_service: 'tosClause',
    callback: 'callbackRing', buffering: 'bufferStall', ad_break: 'adbreakCut',
    influencer: 'influencerRecruit', audit: 'auditTax', reunion: 'reunionMirror',
    nielsen: 'niWatch', eater: 'eaterGorge', algorithm: 'algorithmTick',
    herald: 'heraldTrumpet', cancellation: 'cxDescend', editor: 'edCut',
    rerun: 'rrClap', spoiler: 'spSpoil', timeslot: 'tsTick',
    finale: 'fiTitleCard', finale_crew: 'fiCrewQuiet',
    finale_opening: 'fiOpeningSting', eulogy: 'eulogyVerse',
    network_note: 'nnNote',
    // THE NETWORK (2026-10-14): the pieces reuse the finale campaign's
    // stings until they get their own (placeholder reuse, said here).
    network_tower: 'fiCrewQuiet', network_limb: 'fiOpeningSting', network_heart: 'fiTitleCard',
  };

  // Real animal field recordings. placeholder:false = the real thing.
  // hook -> pool key. Pools without files are documented gaps (placeholder:true).
  var ANIMALS = {
    boar:  { files: [ANI_DIR + 'boar/1.mp3'],  placeholder: false,
             hooks: ['boarNotice', 'boarSnort', 'boarCharge'], monsters: ['bulldozer'],
             label: 'Wild boar (Sus scrofa domesticus grunts) — REAL RECORDING' },
    deer:  { files: [ANI_DIR + 'deer/1.mp3'],  placeholder: false,
             hooks: ['deerCall', 'deerSnort', 'deerAggro', 'deerNotice', 'deerDown',
                     'stagSnort', 'stagCharge', 'stagMirror'], monsters: ['gallowdeer', 'mirror_stag'],
             label: 'Deer bellow (Dama dama) — REAL RECORDING' },
    wolf:  { files: [ANI_DIR + 'wolf/1.mp3'],  placeholder: false,
             hooks: ['wolfSnarl'], monsters: ['hushwolf'],
             label: 'Wolf howls — REAL RECORDING (public domain)' },
    crow:  { files: [ANI_DIR + 'crow/1.mp3', ANI_DIR + 'crow/2.mp3'], placeholder: false,
             hooks: ['nevermoreCroak', 'nevermoreUnfold', 'nevermoreLand',
                     'nevermoreStrafe', 'nevermoreClimb'], monsters: ['nevermore'],
             label: 'American Crow (Corvus brachyrhynchos) — REAL RECORDING' },
    owl:   { files: [ANI_DIR + 'owl/1.mp3'],   placeholder: false,
             hooks: ['nightcourtTurn', 'nightcourtLand'], monsters: ['nightcourt'],
             label: 'Great Horned Owl (Bubo virginianus) — REAL RECORDING' },
    duck:  { files: [ANI_DIR + 'duck/1.mp3'],  placeholder: false,
             hooks: ['ducksQuack', 'ducksQuackCut', 'duckSqueak'], monsters: ['ducks_in_a_row'],
             label: 'Mallard (Anas platyrhynchos) — REAL RECORDING' },
    heron: { files: [ANI_DIR + 'heron/1.mp3'], placeholder: false,
             hooks: ['heronUnfold', 'heronStrike', 'heronStatic'], monsters: ['white_noise_heron'],
             label: 'Great Blue Heron (Ardea herodias) — REAL RECORDING (public domain)' },
    frog:  { files: [ANI_DIR + 'frog/1.mp3'],  placeholder: false,
             hooks: ['belltoadCroak', 'belltoadStun', 'belltoadChorus'], monsters: ['belltoad'],
             label: 'Chorus frog (Pseudacris feriarum) — REAL RECORDING' },
    // Documented gaps: no usable Commons recording found — synth retained.
    raccoon: { files: [ANI_DIR + 'raccoon/1.mp3'], placeholder: false,
               hooks: ['lockpickFingers'], monsters: ['lockpick_raccoon'],
               label: 'Baby raccoon chatter (Procyon lotor) — REAL RECORDING' },
    turtle:  { files: [], placeholder: true, hooks: ['turtleGrind', 'turtleSnap'],
               monsters: ['speedbump_turtle'], label: 'Snapping turtle — GAP: no recording found, synth placeholder' },
  };

  // Weapon/item sounds that never existed — synth placeholders, all flagged.
  var WEAPONS = {
    weaponSwing: { file: WPN_DIR + 'swing.mp3',       placeholder: false, label: 'Weapon swing whoosh — PLACEHOLDER' },
    heavySwing:  { file: WPN_DIR + 'heavySwing.mp3',  placeholder: false, label: 'Heavy swing whoosh — PLACEHOLDER' },
    bowRelease:  { file: WPN_DIR + 'bowRelease.mp3',  placeholder: false, label: 'Bow release twang — PLACEHOLDER' },
    weaponHit:   { file: WPN_DIR + 'impactFlesh.mp3', placeholder: false, label: 'Weapon impact (flesh) — PLACEHOLDER' },
    armorHit:    { file: WPN_DIR + 'impactArmor.mp3', placeholder: false, label: 'Weapon impact (armor) — PLACEHOLDER' },
    itemUse:     { file: WPN_DIR + 'itemUse.mp3',      placeholder: false, label: 'Item use — PLACEHOLDER' },
    itemEat:     { file: WPN_DIR + 'itemEat.mp3',      placeholder: false, label: 'Eating — PLACEHOLDER' },
    itemDrink:   { file: WPN_DIR + 'itemDrink.mp3',   placeholder: false, label: 'Drinking — PLACEHOLDER' },
    trapSpring:  { file: WPN_DIR + 'trapSpring.mp3',  placeholder: false, label: 'Trap spring — PLACEHOLDER' },
  };

  // Wave-2 monsters: conceptual/system horrors. Evocative real-world recordings
  // matched per-monster to each one's fiction. placeholder:false = real recording
  // in place; placeholder:true with files:[] = documented gap (synth retained).
  var WAVE2 = {
    staticCry:        { files: [W2_DIR + 'static-cry.mp3'],      placeholder: false,
                        monsters: ['voice_mimic_radio'],
                        label: 'Numbers-station transmission (German G06) — REAL RECORDING (CC0)' },
    projectorHum:     { files: [W2_DIR + 'projector-hum.mp3'],   placeholder: false,
                        monsters: ['memory_projector'],
                        label: 'Film projector running — REAL RECORDING (CC BY 4.0)' },
    hecklerLaugh:     { files: [W2_DIR + 'heckler-laugh.mp3'],   placeholder: false,
                        monsters: ['heckler'],
                        label: 'Booing, laughter, whistles — REAL RECORDING (CC0)' },
    paparazzoShutter: { files: [W2_DIR + 'paparazzo-shutter.mp3'], placeholder: false,
                        monsters: ['paparazzo'],
                        label: 'Canon T50 camera shutter — REAL RECORDING (CC BY-SA 3.0)' },
    unionBullhorn:    { files: [W2_DIR + 'union-bullhorn.mp3'],  placeholder: false,
                        monsters: ['union_rep'],
                        label: 'Street protest, TriBeCa NYC — REAL RECORDING (CC0)' },
    modNotice:        { files: [W2_DIR + 'mod-notice.mp3'],      placeholder: false,
                        monsters: ['moderator'],
                        label: "Referee's whistle — REAL RECORDING (CC0)" },
    landlordClaim:    { files: [W2_DIR + 'landlord-claim.mp3'],  placeholder: false,
                        monsters: ['landlord'],
                        label: 'Light wood creaks — REAL RECORDING (CC0)' },
    kiteUnfold:       { files: [W2_DIR + 'kite-unfold.mp3'],     placeholder: false,
                        monsters: ['statickite'],
                        label: 'Mountain wind — REAL RECORDING (public domain)' },
    // Documented gaps: no usable open-licensed recording found — synth retained.
    stagSnort:        { files: [], placeholder: true, monsters: ['mirror_stag'],
                        label: 'Deer bellow — no usable open recording found; synth gap' },
    droneHum:         { files: [], placeholder: true, monsters: ['review_drone'],
                        label: 'Drone/quadcopter — no usable open recording found; synth gap' },
    eurekaTick:       { files: [], placeholder: true, monsters: ['bright_idea'],
                        label: 'Aha-moment tick — no usable open recording found; synth gap' },
    lineCut:          { files: [], placeholder: true, monsters: ['warranty_caller'],
                        label: 'Telephone line — no usable open recording found; synth gap' },
    understudyWatch:  { files: [], placeholder: true, monsters: ['understudy'],
                        label: 'Theater hush — no usable open recording found; synth gap' },
    mosquitoDive:     { files: [], placeholder: true, monsters: ['giant_mosquito'],
                        label: 'Mosquito whine — no usable open recording found; synth gap' },
    tickLatch:        { files: [], placeholder: true, monsters: ['alien_tick'],
                        label: 'Tick — silent by nature; synth gap' },
  };

  // Every wave-2 monster id -> its PRIMARY hook (exactly one).
  var MONSTER_HOOK_W2 = {
    voice_mimic_radio: 'staticCry', mirror_stag: 'stagSnort',
    review_drone: 'droneHum', bright_idea: 'eurekaTick',
    memory_projector: 'projectorHum', warranty_caller: 'lineCut',
    understudy: 'understudyWatch', landlord: 'landlordClaim',
    heckler: 'hecklerLaugh', paparazzo: 'paparazzoShutter',
    union_rep: 'unionBullhorn', moderator: 'modNotice',
    statickite: 'kiteUnfold', giant_mosquito: 'mosquitoDive',
    alien_tick: 'tickLatch',
  };

  var hookToAnimal = {};
  Object.keys(ANIMALS).forEach(function (k) {
    ANIMALS[k].hooks.forEach(function (h) { hookToAnimal[h] = k; });
  });

  // resolveHook(name) -> {kind:'signature'|'animal'|'weapon', file, files,
  // placeholder, label} | null. DOM-free.
  function resolveHook(name) {
    if (SIGNATURES[name]) {
      var s = SIGNATURES[name];
      return { kind: 'signature', file: s.file, placeholder: s.placeholder, label: s.label, monster: s.monster };
    }
    var ak = hookToAnimal[name];
    if (ak) {
      var a = ANIMALS[ak];
      if (a.files.length) {
        var f = a.files[Math.floor(Math.random() * a.files.length)];
        return { kind: 'animal', file: f, placeholder: false, label: a.label, pool: ak };
      }
      return { kind: 'animal', file: null, placeholder: true, label: a.label, pool: ak, gap: true };
    }
    if (WAVE2[name]) {
      var q = WAVE2[name];
      if (q.files.length) {
        return { kind: 'wave2', file: q.files[0], placeholder: false,
                 label: q.label, monsters: q.monsters };
      }
      return { kind: 'wave2', file: null, placeholder: true,
               label: q.label, monsters: q.monsters, gap: true };
    }
    if (WEAPONS[name]) {
      var w = WEAPONS[name];
      return { kind: 'weapon', file: w.file, placeholder: w.placeholder, label: w.label };
    }
    return null;
  }

  return {
    signatures: SIGNATURES,
    monsterSig: MONSTER_SIG,
    animals: ANIMALS,
    weapons: WEAPONS,
    wave2: WAVE2,
    monsterHookW2: MONSTER_HOOK_W2,
    resolveHook: resolveHook,
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AudioRegistry;
