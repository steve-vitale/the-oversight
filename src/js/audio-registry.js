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
  var ANI_DIR = 'src/audio/animals/';
  var WPN_DIR = 'src/audio/weapons/';

  // Wave 3-5 monster signature placeholders. hook -> file.
  // monsterId -> primary hook is in MONSTER_SIG.
  var SIGNATURES = {
    congregationInvite:  { file: SIG_DIR + 'sfx-congregation-invite.mp3',  placeholder: true, monster: 'congregation',      label: 'The Congregation invites you — PLACEHOLDER' },
    congregationGeas:    { file: SIG_DIR + 'sfx-congregation-geas.mp3',    placeholder: true, monster: 'congregation',      label: 'The Congregation binds you — PLACEHOLDER' },
    congregationAbsolve: { file: SIG_DIR + 'sfx-congregation-absolve.mp3', placeholder: true, monster: 'congregation',      label: 'The Congregation releases you — PLACEHOLDER' },
    strikeShutdown:      { file: SIG_DIR + 'sfx-strike-shutdown.mp3',      placeholder: true, monster: 'strike',            label: 'The Strike dies — PLACEHOLDER' },
    suburbHum:           { file: SIG_DIR + 'sfx-suburb-hum.mp3',           placeholder: true, monster: 'suburb',            label: 'The Suburb aura — PLACEHOLDER' },
    focusGroupMurmur:    { file: SIG_DIR + 'sfx-focusgroup-murmur.mp3',   placeholder: true, monster: 'focus_group',       label: 'Focus Group deliberates — PLACEHOLDER' },
    redactorPoint:       { file: SIG_DIR + 'sfx-redactor-censor.mp3',      placeholder: true, monster: 'redactor',          label: 'The Redactor censors — PLACEHOLDER' },
    gavelVerdict:        { file: SIG_DIR + 'sfx-gavel-verdict.mp3',        placeholder: true, monster: 'gavel',             label: 'The Gavel judges — PLACEHOLDER' },
    spoolReplay:         { file: SIG_DIR + 'sfx-spool-tangle.mp3',         placeholder: true, monster: 'spool',             label: 'The Spool tangles — PLACEHOLDER' },
    chorusBeat:          { file: SIG_DIR + 'sfx-chorus_line-unison.mp3',   placeholder: true, monster: 'chorus_line',       label: 'Chorus Line syncs — PLACEHOLDER' },
    tosClause:           { file: SIG_DIR + 'sfx-terms_of_service-fineprint.mp3', placeholder: true, monster: 'terms_of_service', label: 'Terms of Service enforces — PLACEHOLDER' },
    callbackRing:        { file: SIG_DIR + 'sfx-callback-ringback.mp3',    placeholder: true, monster: 'callback',          label: 'Callback calls back — PLACEHOLDER' },
    bufferStall:         { file: SIG_DIR + 'sfx-buffering-spin.mp3',       placeholder: true, monster: 'buffering',         label: 'Buffering stalls — PLACEHOLDER' },
    adbreakCut:          { file: SIG_DIR + 'sfx-ad_break-jingle.mp3',      placeholder: true, monster: 'ad_break',          label: 'Ad Break interrupts — PLACEHOLDER' },
    influencerRecruit:   { file: SIG_DIR + 'sfx-influencer-shutter.mp3',   placeholder: true, monster: 'influencer',        label: 'The Influencer goes live — PLACEHOLDER' },
    auditTax:            { file: SIG_DIR + 'sfx-audit-stamp.mp3',           placeholder: true, monster: 'audit',             label: 'The Audit stamps — PLACEHOLDER' },
    reunionMirror:       { file: SIG_DIR + 'sfx-reunion-calling.mp3',      placeholder: true, monster: 'reunion',           label: 'The Reunion calls — PLACEHOLDER' },
    niWatch:             { file: SIG_DIR + 'sfx-nielsen-watch.mp3',        placeholder: true, monster: 'nielsen',           label: 'Nielsen locks on — PLACEHOLDER' },
    eaterGorge:          { file: SIG_DIR + 'sfx-eater-gorge.mp3',           placeholder: true, monster: 'eater',             label: 'The Eater feeds — PLACEHOLDER' },
    algorithmTick:       { file: SIG_DIR + 'sfx-algorithm-tick.mp3',       placeholder: true, monster: 'algorithm',         label: 'The Algorithm calculates — PLACEHOLDER' },
    heraldTrumpet:       { file: SIG_DIR + 'sfx-herald-trumpet.mp3',       placeholder: true, monster: 'herald',            label: 'The Herald announces — PLACEHOLDER' },
    cxDescend:           { file: SIG_DIR + 'sfx-cancellation-descend.mp3', placeholder: true, monster: 'cancellation',      label: 'Cancellation axes it — PLACEHOLDER' },
    edCut:               { file: SIG_DIR + 'sfx-editor-cut.mp3',           placeholder: true, monster: 'editor',            label: 'The Editor cuts — PLACEHOLDER' },
    rrClap:              { file: SIG_DIR + 'sfx-rerun-clap.mp3',            placeholder: true, monster: 'rerun',             label: 'The Rerun encores — PLACEHOLDER' },
    spSpoil:             { file: SIG_DIR + 'sfx-spoiler-spoil.mp3',         placeholder: true, monster: 'spoiler',           label: 'Spoiler spoils — PLACEHOLDER' },
    tsTick:              { file: SIG_DIR + 'sfx-timeslot-tick.mp3',        placeholder: true, monster: 'timeslot',          label: 'Timeslot counts down — PLACEHOLDER' },
    fiTitleCard:         { file: SIG_DIR + 'sfx-finale-titlecard.mp3',     placeholder: true, monster: 'finale',            label: 'The Finale arrives — PLACEHOLDER' },
    fiSacrifice:         { file: SIG_DIR + 'sfx-finale-sacrifice.mp3',    placeholder: true, monster: 'finale',            label: "The Finale's rite — PLACEHOLDER" },
    eulogyVerse:         { file: SIG_DIR + 'sfx-eulogy-verse.mp3',         placeholder: true, monster: 'eulogy',            label: 'The Eulogy speaks — PLACEHOLDER' },
    nnNote:              { file: SIG_DIR + 'sfx-network_note-slip.mp3',    placeholder: true, monster: 'network_note',      label: 'Network Note mandates — PLACEHOLDER' },
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
    raccoon: { files: [], placeholder: true, hooks: ['lockpickFingers'],
               monsters: ['lockpick_raccoon'], label: 'Raccoon — GAP: no recording found, synth placeholder' },
    turtle:  { files: [], placeholder: true, hooks: ['turtleGrind', 'turtleSnap'],
               monsters: ['speedbump_turtle'], label: 'Snapping turtle — GAP: no recording found, synth placeholder' },
  };

  // Weapon/item sounds that never existed — synth placeholders, all flagged.
  var WEAPONS = {
    weaponSwing: { file: WPN_DIR + 'swing.mp3',       placeholder: true, label: 'Weapon swing whoosh — PLACEHOLDER' },
    heavySwing:  { file: WPN_DIR + 'heavySwing.mp3',  placeholder: true, label: 'Heavy swing whoosh — PLACEHOLDER' },
    bowRelease:  { file: WPN_DIR + 'bowRelease.mp3',  placeholder: true, label: 'Bow release twang — PLACEHOLDER' },
    weaponHit:   { file: WPN_DIR + 'impactFlesh.mp3', placeholder: true, label: 'Weapon impact (flesh) — PLACEHOLDER' },
    armorHit:    { file: WPN_DIR + 'impactArmor.mp3', placeholder: true, label: 'Weapon impact (armor) — PLACEHOLDER' },
    itemUse:     { file: WPN_DIR + 'itemUse.mp3',      placeholder: true, label: 'Item use — PLACEHOLDER' },
    itemEat:     { file: WPN_DIR + 'itemEat.mp3',      placeholder: true, label: 'Eating — PLACEHOLDER' },
    itemDrink:   { file: WPN_DIR + 'itemDrink.mp3',   placeholder: true, label: 'Drinking — PLACEHOLDER' },
    trapSpring:  { file: WPN_DIR + 'trapSpring.mp3',  placeholder: true, label: 'Trap spring — PLACEHOLDER' },
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
      return { kind: 'signature', file: s.file, placeholder: true, label: s.label, monster: s.monster };
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
    if (WEAPONS[name]) {
      var w = WEAPONS[name];
      return { kind: 'weapon', file: w.file, placeholder: true, label: w.label };
    }
    return null;
  }

  return {
    signatures: SIGNATURES,
    monsterSig: MONSTER_SIG,
    animals: ANIMALS,
    weapons: WEAPONS,
    resolveHook: resolveHook,
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AudioRegistry;
