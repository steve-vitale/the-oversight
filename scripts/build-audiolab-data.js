// scripts/build-audiolab-data.js
// Builds tools/audio-lab-data.js — the Audio Lab's item registry.
//
// One entry per monster (from src/data/monsters.json), each with its OWN
// label, fiction derivation, and asset reference (Steve 2026-10-13: every
// item on a judgment surface carries its own label and design derivation).
// Plus the SFX set with the same per-item labeling.
//
// Origins: 'real' = real-world recording on disk, 'synth' = Web Audio synth
// retained by design (no meaningful real-world voice), 'gap' = documented
// gap (no recording found; synth stand-in), 'none' = no dedicated asset at
// all (honest hole, flagged).
//
// Sources for 'real' entries come from the three ATTRIBUTION.md files
// (animals/, signatures/, wave2/, weapons/). Signature files NOT documented
// in an ATTRIBUTION.md are marked "source unattributed" — they exist and
// play, but Steve should not judge them as sourced recordings until the
// attribution lands.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function loadJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function loadBrowserVar(rel, name) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const mod = { exports: {} };
  new Function('module', 'exports', src)(mod, mod.exports);
  return mod.exports || mod.exports[name];
}

const monsters = loadJSON('src/data/monsters.json');
const byId = {};
for (const k of Object.keys(monsters)) byId[monsters[k].id] = monsters[k];

// Signature hooks (waves 3-5): hook -> file.
const registry = loadBrowserVar('src/js/audio-registry.js', 'AudioRegistry');
const SIG = {};
for (const [hook, e] of Object.entries(registry.signatures)) SIG[hook] = e.file;
const MONSTER_SIG = registry.monsterSig;

// ---------------------------------------------------------------------------
// Per-monster curated table.
// file: repo-relative path (verified against disk by the proof test).
// synth: Game.audio hook name when the voice is synthesized.
// ---------------------------------------------------------------------------
const M = {
  // ---- Wave 1 -------------------------------------------------------------
  bulldozer: { hook: 'boarSnort', files: ['src/audio/animals/boar/1.mp3'], origin: 'real',
    source: 'Domestic pig grunting, Cuba (Sus scrofa domesticus)', license: 'CC BY 2.0',
    why: 'Bulldozer is a territorial boar at charge-line speed. The domestic pig is the same species as wild boar, so this grunt is literally its own voice — heavy, impatient, unimpressed by you.' },
  hushwolf: { hook: 'wolfSnarl', files: ['src/audio/animals/wolf/1.mp3'], origin: 'real',
    source: 'Wolf howls', license: 'Public domain',
    why: 'Pack hunter — silent until it isn\u2019t, and then it\u2019s too late. The howl is the pack announcing itself: the last sound before it stops being silent.' },
  gallowdeer: { hook: 'deerAggro', files: ['src/audio/animals/deer/1.mp3'], origin: 'real',
    source: 'Fallow deer buck bellowing, Haldon Forest, Devon (Dama dama)', license: 'CC BY-SA 4.0',
    why: 'The horror is that it\u2019s just a deer. An honest deer bellow — never a monster roar — because Highbeam Deer is scary precisely because the animal is real.' },
  mirrormoth: { hook: 'mirrormothFlash', synth: 'mirrormothFlash', origin: 'synth',
    source: 'Web Audio synth — no real-world flash-moth voice exists', license: 'n/a',
    why: 'A drifter curious about light, including the light in you. Synth by design: a detuned flash-burst with one wingbeat too loud.' },
  belltoad: { hook: 'belltoadChorus', files: ['src/audio/animals/frog/1.mp3'], origin: 'real',
    source: 'Upland chorus frog (Pseudacris feriarum)', license: 'CC BY-SA 4.0',
    why: 'Pack singer — the croak is the warning, the chorus is the attack. An honest frog chorus, amplified for the toad.' },
  lockpick_raccoon: { hook: 'lockpickFingers', files: ['src/audio/animals/raccoon/1.mp3'], origin: 'real',
    source: 'Baby raccoon chatter (Procyon lotor)', license: 'CC BY 3.0',
    why: 'A curious thief who wants your stuff, not your life. Probably. Baby-raccoon chatter: small, quick, clever-sounding.' },
  white_noise_heron: { hook: 'heronStrike', files: ['src/audio/animals/heron/1.mp3'], origin: 'real',
    source: 'Great blue heron (Ardea herodias)', license: 'Public domain',
    why: 'Territorial fisher — you are standing in its creek. The real heron call, with the air going staticky around it.' },
  hummice: { hook: 'humRise', synth: 'humRise', origin: 'synth',
    source: 'Web Audio synth — the swarm is one instrument', license: 'n/a',
    why: 'The swarm is one instrument: N detuned voices for N stacks, a voice dropping out with a stutter when one falls. No real recording — synth by design.' },
  speedbump_turtle: { hook: 'turtleSnap', synth: 'turtleSnap', origin: 'gap',
    source: 'Documented gap — no usable snapping-turtle recording found on Commons', license: 'n/a',
    why: 'Territorial rock — doesn\u2019t move, doesn\u2019t need to, you come to it. No recording found: synth stand-in — the shell sealing like a door closing, then the snap with no warning, by design.' },
  nightlight_catfish: { hook: 'catfishLure', synth: 'catfishLure', origin: 'synth',
    source: 'Web Audio synth — no meaningful real-world voice for a glowing catfish', license: 'n/a',
    why: 'Ambush predator — the light is the lure, and you\u2019re curious, aren\u2019t you. The lure-hum is synth by design; a real catfish recording would sound like nothing.' },
  ducks_in_a_row: { hook: 'ducksQuack', files: ['src/audio/animals/duck/1.mp3'], origin: 'real',
    source: 'Mallard (Anas platyrhynchos), xeno-canto', license: 'CC BY-SA 3.0',
    why: 'A line of ducks moving as one. The mallard quack keeps the line honest — break the line and you have two problems.' },
  glasswing: { hook: 'glasswingDive', synth: 'glasswingDive', origin: 'synth',
    source: 'Web Audio synth — no real insect sounds like a dive-bomber', license: 'n/a',
    why: 'The sky is its, and you\u2019re under it. Synth thin whine with vibrato circling high, then the falling whistle 2000\u2192300Hz on the dive.' },
  sunbasker: { hook: 'baskCharge', synth: 'baskCharge', origin: 'synth',
    source: 'Web Audio synth — a creature made of sunlight has no field recording', license: 'n/a',
    why: 'It was here first, and the sun is its. Heat shimmer that brightens with charge — synth by design.' },
  nevermore: { hook: 'nevermoreCroak', files: ['src/audio/animals/crow/1.mp3', 'src/audio/animals/crow/2.mp3'], origin: 'real',
    source: 'American crow (Corvus brachyrhynchos), xeno-canto', license: 'CC BY-SA 3.0',
    why: 'It knows your name and says it wrong on purpose. Exact-species corvid croak with beak-hammer percussion.' },
  nightcourt: { hook: 'nightcourtTurn', files: ['src/audio/animals/owl/1.mp3'], origin: 'real',
    source: 'Great horned owl (Bubo virginianus), recorded from a tent before sunrise', license: 'CC BY-SA 4.0',
    why: 'Court is in session; you are the docket. Exact-species owl voice — and the dive makes NO sound. The silence IS the telegraph, by design.' },

  // ---- Wave 2 -------------------------------------------------------------
  voice_mimic_radio: { hook: 'staticCry', files: ['src/audio/wave2/static-cry.mp3'], origin: 'real',
    source: 'Numbers station broadcast (German lady, G06), 5442 kHz', license: 'CC0',
    why: 'A dead radio that learned to cry like people. A numbers station — a voice reading to nobody — because Static is a broadcast pretending to be a person.' },
  mirror_stag: { hook: 'stagSnort', files: ['src/audio/animals/deer/1.mp3'], origin: 'real',
    source: 'Same fallow-deer bellow as Highbeam Deer (Dama dama); resolves via the deer animal pool', license: 'CC BY-SA 4.0',
    why: 'The System\u2019s most successful design, iterated: the deer worked, so they built it again and taught it grief. Same bellow, deliberately — with glass harmonics, wrong.' },
  review_drone: { hook: 'droneHum', synth: 'droneHum', origin: 'gap',
    source: 'Documented gap — no usable open recording found; Web Audio synth', license: 'n/a',
    why: 'It is grading you; you are failing. A machine hum — cold, constant, bureaucratic. Synth by design: bureaucracy has no field recording.' },
  bright_idea: { hook: 'eurekaTick', synth: 'eurekaTick', origin: 'gap',
    source: 'Documented gap — no usable open recording found; Web Audio synth', license: 'n/a',
    why: 'A guttering bright idea that detonates. Documented gap: no usable open recording found — the synth aha-tick stands in.' },
  memory_projector: { hook: 'projectorHum', files: ['src/audio/wave2/projector-hum.mp3'], origin: 'real',
    source: 'Film projector running with the light on', license: 'CC BY 4.0',
    why: 'It shows you what you miss; the missing is the trap. A real projector hum — your own memories screened at you.' },
  warranty_caller: { hook: 'lineCut', synth: 'lineCut', origin: 'gap',
    source: 'Documented gap — no usable open recording found; Web Audio synth', license: 'n/a',
    why: 'It has decided you are the car, and the warranty has expired. Hold music — the worst sound in customer service — because the scam IS the monster.' },
  understudy: { hook: 'understudyWatch', synth: 'understudyWatch', origin: 'gap',
    source: 'Documented gap — no usable open recording found; Web Audio synth', license: 'n/a',
    why: 'It has no tricks of its own, so it steals yours. A blank watching shape that rehearses your moves back at you — the synth copies the player, not the monster.' },
  landlord: { hook: 'landlordClaim', files: ['src/audio/wave2/landlord-claim.mp3'], origin: 'real',
    source: 'Light wood creaks (Red Library foley)', license: 'CC0',
    why: 'It doesn\u2019t chase you; it buys the ground under you. Wood creaking — floorboards settling under new ownership.' },
  heckler: { hook: 'hecklerLaugh', files: ['src/audio/wave2/heckler-laugh.mp3'], origin: 'real',
    source: 'Booing, laughter, whistles, applause (Red Library)', license: 'CC0',
    why: 'It doesn\u2019t want to kill you; it wants you to quit. A real crowd turning on you.' },
  paparazzo: { hook: 'paparazzoShutter', files: ['src/audio/wave2/paparazzo-shutter.mp3'], origin: 'real',
    source: 'Canon T50 shutter', license: 'CC BY-SA 3.0',
    why: 'It doesn\u2019t want content; it wants YOU, specifically, understood. A camera shutter burst — being captured.' },
  union_rep: { hook: 'unionBullhorn', files: ['src/audio/wave2/union-bullhorn.mp3'], origin: 'real',
    source: 'Street protest, TriBeCa', license: 'CC0',
    why: 'It doesn\u2019t fight; it organizes. A real protest bullhorn — collective power, amplified.' },
  moderator: { hook: 'modNotice', files: ['src/audio/wave2/mod-notice.mp3'], origin: 'real',
    source: 'Referee whistle in a gymnasium', license: 'CC0',
    why: 'It stopped watching content and started removing it — you are the content. A referee\u2019s whistle: the game stops when it blows.' },
  statickite: { hook: 'kiteUnfold', files: ['src/audio/wave2/kite-unfold.mp3'], origin: 'real',
    source: 'Wind on Pic du Canigou (radio aporee field recording)', license: 'Public domain',
    why: 'It is not hunting you; it is COVERING you. Mountain wind over a kite — vast, indifferent, overhead.' },
  giant_mosquito: { hook: 'mosquitoDive', synth: 'mosquitoDive', origin: 'gap',
    source: 'Documented gap — no usable open recording found; Web Audio synth', license: 'n/a',
    why: 'A whine with a body count. Synth by design; a real mosquito would be honest but inaudible next to the horror.' },
  alien_tick: { hook: 'tickLatch', synth: 'tickLatch', origin: 'gap',
    source: 'Documented gap — no usable open recording found; Web Audio synth', license: 'n/a',
    why: 'Patience with mouthparts. Synth clicks — the latch you hear a moment too late.' },
};
// Wave 3-5 fragment — appended into build-audiolab-data.js's M table.
// Each monster's primary signature hook comes from MONSTER_SIG (audio-registry.js);
// source/license from src/audio/signatures/ATTRIBUTION.md. Files NOT documented
// there are marked "source unattributed" — they play, but their origin is
// unverified and Steve should not judge them as sourced recordings yet.
const W35 = {
  // ---- Wave 3 -------------------------------------------------------------
  redactor: { files: ['src/audio/signatures/sfx-redactor-censor.mp3'], origin: 'real',
    source: 'Paper crumpling (Red Library)', license: 'CC0',
    why: 'Censorship made flesh — polite, total, already editing you. Paper crumpling: your words, balled up.' },
  gavel: { files: ['src/audio/signatures/sfx-gavel-verdict.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The audience voted for accountability, and the System complied with unusual enthusiasm. A gavel\u2019s fall — the verdict, final. (Attribution missing; verify before judging.)' },
  focus_group: { files: ['src/audio/signatures/sfx-focusgroup-murmur.mp3'], origin: 'real',
    source: 'Serious walla in a government chamber (USC SFX library)', license: 'CC0',
    why: 'The audience\u2019s id, rating your every move out loud. Real crowd murmur — deliberation as a weapon.' },
  spool: { files: ['src/audio/signatures/sfx-spool-tangle.mp3'], origin: 'real',
    source: 'Cinemeccanica Victoria 9 projector running', license: 'CC BY 4.0',
    why: 'Your own blooper reel, and it\u2019s been saving the good stuff. A projector tangling — your past, replaying wrong.' },
  chorus_line: { files: ['src/audio/signatures/sfx-chorus_line-unison.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'Sweeps week — extremely long legs, extremely committed. Many voices in unison, and the unison is the threat. (Attribution missing; verify before judging.)' },
  terms_of_service: { files: ['src/audio/signatures/sfx-terms_of_service-fineprint.mp3'], origin: 'real',
    source: 'Turning magazine pages (Red Library)', license: 'CC0',
    why: 'The System\u2019s lawyers got a monster budget, and the paper is everywhere. Pages turning — the fine print, enforced.' },
  callback: { files: ['src/audio/signatures/sfx-callback-ringback.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The family thread, weaponized — it knows what makes you hesitate. A ringback tone: someone calling you back. (Attribution missing; verify before judging.)' },
  buffering: { files: ['src/audio/signatures/sfx-buffering-spin.mp3'], origin: 'real',
    source: 'Dial-up modem handshake', license: 'Public domain',
    why: 'Three seconds ago, and angry about it. A dial-up handshake — the sound of waiting, weaponized.' },
  ad_break: { files: ['src/audio/signatures/sfx-ad_break-jingle.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The sponsors demanded inventory, and the System complied. A jingle that interrupts — the show stops for no one. (Attribution missing; verify before judging.)' },

  // ---- Wave 4 -------------------------------------------------------------
  congregation: { files: ['src/audio/signatures/sfx-congregation-invite.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'Faith as a weapon — the invitation is always spoken, never sprung. (Primary invite recording; geas = church organ, absolve = long bells, both CC0. Attribution missing on the invite; verify before judging.)' },
  strike: { files: ['src/audio/signatures/sfx-strike-shutdown.mp3'], origin: 'real',
    source: 'Street protest, TriBeCa', license: 'CC0',
    why: 'The System\u2019s labor content, scaled up — it doesn\u2019t fight, it withholds. A real protest going quiet: the strike dies, and so does the noise.' },
  influencer: { files: ['src/audio/signatures/sfx-influencer-shutter.mp3'], origin: 'real',
    source: 'Nikon D7100 shutter burst', license: 'CC BY-SA 3.0',
    why: 'The show found its star — the followers are the real body. A shutter burst: going live.' },
  audit: { files: ['src/audio/signatures/sfx-audit-stamp.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The most boring-looking thing in the wave — which is the joke and the horror. A stamp, landing. (Attribution missing; verify before judging.)' },
  reunion: { files: ['src/audio/signatures/sfx-reunion-calling.mp3'], origin: 'real',
    source: 'Wound-up music-box lullaby', license: 'Public domain',
    why: 'The village you failed, given teeth — it moves like a crowd. A music-box lullaby: the past, wound up and calling.' },
  suburb: { files: ['src/audio/signatures/sfx-suburb-hum.mp3'], origin: 'real',
    source: 'Diesel lawnmower', license: 'Public domain',
    why: 'Comfort as a trap — the lawns are too green, the dog isn\u2019t a dog. A lawnmower: maintained normalcy, wrong.' },
  eulogy: { files: ['src/audio/signatures/sfx-eulogy-verse.mp3'], origin: 'real',
    source: 'Deep bell (Red Library)', license: 'CC0',
    why: 'The System\u2019s prestige drama division — the narration is honest, and that\u2019s the horror. A deep bell, tolling.' },
  algorithm: { files: ['src/audio/signatures/sfx-algorithm-tick.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The recommender, embodied — usually right, and that\u2019s the scary part. A ticking calculation. (Attribution missing; verify before judging.)' },
  eater: { files: ['src/audio/signatures/sfx-eater-gorge.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The aliens watched humans eat and thought it looked like fun — a vast maw that eats the grid. (Attribution missing; verify before judging.)' },
  herald: { files: ['src/audio/signatures/sfx-herald-trumpet.mp3'], origin: 'real',
    source: '1930s fanfare, bombastic (Designer\u2019s Choice)', license: 'CC0',
    why: 'It stands at the edge of the world, getting bigger. It is not attacking — it is ARRIVING. A bombastic fanfare: the sky has a face in it.' },

  // ---- Wave 5 -------------------------------------------------------------
  cancellation: { files: ['src/audio/signatures/sfx-cancellation-descend.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'Bureaucracy at a geological scale — the show is fighting back. (Attribution missing; verify before judging.)' },
  editor: { files: ['src/audio/signatures/sfx-editor-cut.mp3'], origin: 'real',
    source: 'Scissors cutting card stock', license: 'CC BY-SA 4.0',
    why: 'The director\u2019s cut — and you\u2019re not the director. Scissors through card stock: you, cut.' },
  rerun: { files: ['src/audio/signatures/sfx-rerun-clap.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The network ordered more episodes — the episode airs again. Applause for something you\u2019ve already survived. (Attribution missing; verify before judging.)' },
  spoiler: { files: ['src/audio/signatures/sfx-spoiler-spoil.mp3'], origin: 'real',
    source: 'PA announcement, Kempegowda International Airport', license: 'CC BY-SA 4.0',
    why: 'The marketing department leaked the finale — and it was right. A PA announcement: the truth, over the speakers.' },
  timeslot: { files: ['src/audio/signatures/sfx-timeslot-tick.mp3'], origin: 'real',
    source: 'Clock ticking (Vienna Clock Museum)', license: 'CC BY-SA 4.0',
    why: 'Programming — the schedule changed, and it\u2019s worse now. A clock, ticking.' },
  nielsen: { files: ['src/audio/signatures/sfx-nielsen-watch.mp3'], origin: 'real',
    source: 'Slow-starting applause', license: 'Public domain',
    why: 'Ratings, embodied — you can watch the audience arrive. Applause, starting slow.' },
  finale: { files: ['src/audio/signatures/sfx-finale-titlecard.mp3'], origin: 'real',
    source: 'Ten-minute timer', license: 'CC0',
    why: 'Every season needs its climax — this one is yours. A timer, running out.' },
  finale_crew: { files: ['src/audio/signatures/sfx-finale_crew-quiet.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The show\u2019s crew — the venue, fighting. (Attribution missing; verify before judging.)' },
  finale_opening: { files: ['src/audio/signatures/sfx-finale_opening-sting.mp3'], origin: 'real',
    source: 'SOURCE UNATTRIBUTED — no entry in signatures/ATTRIBUTION.md; origin unverified', license: 'unknown',
    why: 'The finale, still arriving — the opening credits. (Attribution missing; verify before judging.)' },
  network_note: { files: ['src/audio/signatures/sfx-network_note-slip.mp3'], origin: 'real',
    source: 'Typewriter', license: 'CC BY 4.0',
    why: 'The worst meeting you\u2019ve ever been in, with teeth — the executives are watching. A typewriter: the note, being written.' },
};

// ---------------------------------------------------------------------------
// SFX set — same per-item labeling.
// ---------------------------------------------------------------------------
const SFX = [
  { id: 'weaponSwing', label: 'Weapon swing', hook: 'weaponSwing', files: ['src/audio/weapons/swing.mp3'], origin: 'real',
    source: 'Whip whoosh (USC SFX library)', license: 'CC0',
    why: 'The melee whoosh — the weapon leaving the hand\u2019s intention.' },
  { id: 'heavySwing', label: 'Heavy swing', hook: 'heavySwing', files: ['src/audio/weapons/heavySwing.mp3'], origin: 'real',
    source: 'Whip swishes (USC SFX library)', license: 'CC0',
    why: 'Heavy weapons need a heavier whoosh.' },
  { id: 'bowRelease', label: 'Bow release', hook: 'bowRelease', files: ['src/audio/weapons/bowRelease.mp3'], origin: 'real',
    source: 'Shooting arrows from bow, indoors (USC SFX library)', license: 'CC0',
    why: 'The bow\u2019s release — string and air.' },
  { id: 'weaponHit', label: 'Weapon impact (flesh)', hook: 'weaponHit', files: ['src/audio/weapons/impactFlesh.mp3'], origin: 'real',
    source: 'Arrow hitting person (USC SFX library)', license: 'CC0',
    why: 'The hit landing on flesh — a different truth than armor.' },
  { id: 'armorHit', label: 'Weapon impact (armor)', hook: 'armorHit', files: ['src/audio/weapons/impactArmor.mp3'], origin: 'real',
    source: 'Metal hits against metal, foley (USC SFX library)', license: 'CC0',
    why: 'The hit landing on armor — the clang that means your edge met its match.' },
  { id: 'trapSpring', label: 'Trap spring', hook: 'trapSpring', files: ['src/audio/weapons/trapSpring.mp3'], origin: 'real',
    source: 'Snap and break large stick (Red Library foley)', license: 'CC0',
    why: 'The trap\u2019s promise, kept.' },
  { id: 'itemUse', label: 'Item use', hook: 'itemUse', files: ['src/audio/weapons/itemUse.mp3'], origin: 'real',
    source: 'Uncorking and first pour of a bottle', license: 'CC BY-SA 4.0',
    why: 'Using an item — the uncorking moment.' },
  { id: 'itemEat', label: 'Eating', hook: 'itemEat', files: ['src/audio/weapons/itemEat.mp3'], origin: 'real',
    source: 'Chewing, mouth open', license: 'Public domain',
    why: 'Eating — the core verb of the game. Food is everything, and it sounds like it.' },
  { id: 'itemDrink', label: 'Drinking', hook: 'itemDrink', files: ['src/audio/weapons/itemDrink.mp3'], origin: 'real',
    source: 'Drinking a glass of water', license: 'Public domain',
    why: 'Drinking — clean water, audible. The decision \u201cdo I risk the creek?\u201d has a sound.' },
  { id: 'footstep', label: 'Footstep', hook: 'footstep', synth: 'footstep', origin: 'synth',
    source: 'Web Audio synth — per-biome step family', license: 'n/a',
    why: 'Your own careful step — subtle by design. Footsteps change by ground; the quietest beat in the hunt.' },
  { id: 'uiSelect', label: 'UI tap', hook: 'uiSelect', synth: 'uiSelect', origin: 'synth',
    source: 'Web Audio synth — inside the audio bus, mute-safe', license: 'n/a',
    why: 'The tap\u2019s own sound. Also the first sound that unlocks the audio context on mobile.' },
  { id: 'shout', label: 'Shout', hook: 'shout', synth: 'shout', origin: 'synth',
    source: 'Web Audio synth — raw noise, no words', license: 'n/a',
    why: 'The player\u2019s bellow: raw noise, no words, all lungs.' },
  { id: 'animalStalk', label: 'Stalking', hook: 'animalStalk', synth: 'animalStalk', origin: 'synth',
    source: 'Web Audio synth — near-silent footfalls, held breath', license: 'n/a',
    why: 'The hunt\u2019s quietest beat — your heartbeat slightly too fast. Fired from the Stalk dispatch.' },
  { id: 'telegraph', label: 'Telegraph windup', hook: 'telegraph', synth: 'telegraph', origin: 'synth',
    source: 'Web Audio synth — generic-per-pattern windup pairs', license: 'n/a',
    why: 'Charge declare / windup tick. Per-pattern pairs; \u2018ambush\u2019 is silent BY DESIGN (the turtle\u2019s snap is the resolve).' },
  { id: 'impact', label: 'Impact resolve', hook: 'impact', synth: 'impact', origin: 'synth',
    source: 'Web Audio synth — per-pattern resolve', license: 'n/a',
    why: 'The hit resolving — fire or flesh, dispatched by attack pattern.' },
  { id: 'round', label: 'Combat round tick', hook: 'round', synth: 'round', origin: 'synth',
    source: 'Web Audio synth — the System\u2019s metronome', license: 'n/a',
    why: 'The System\u2019s metronome — heavier each round.' },
  { id: 'monsterDown', label: 'Monster down', hook: 'monsterDown', synth: 'monsterDown', origin: 'synth',
    source: 'Web Audio synth — death fallthrough', license: 'n/a',
    why: 'The death fallthrough for monsters with no dedicated death voice.' },
  { id: 'monsterHurt', label: 'Monster hurt', hook: 'monsterHurt', synth: 'monsterHurt', origin: 'synth',
    source: 'Web Audio synth — solid hits, once per round', license: 'n/a',
    why: 'Solid hits land — gated to once per round so a flurry doesn\u2019t become noise.' },
  { id: 'wound', label: 'Wound', hook: 'wound', synth: 'wound', origin: 'synth',
    source: 'Web Audio synth — the generic wound voice', license: 'n/a',
    why: 'Damage that stays. The generic wound voice — and the safety net so the temperament dispatch can never go silent.' },
  { id: 'combatEnd', label: 'Combat end', hook: 'combatEnd', synth: 'combatEnd', origin: 'synth',
    source: 'Web Audio synth', license: 'n/a',
    why: 'The fight\u2019s exhale — the all-clear that the grid is yours again.' },
  { id: 'victory', label: 'Victory', hook: 'victory', synth: 'victory', origin: 'synth',
    source: 'Web Audio synth — felt, not fanfared', license: 'n/a',
    why: 'Winning, audible — not a fanfare. Felt, not heard.' },
  { id: 'horrorSting', label: 'Horror sting', hook: 'horrorSting', synth: 'horrorSting', origin: 'synth',
    source: 'Web Audio synth — the UI dread-beat', license: 'n/a',
    why: 'The UI dread-beat sting — the System watching.' },
  { id: 'stingNightmare', label: 'Nightmare sting', hook: 'stingNightmare', synth: 'stingNightmare', origin: 'synth',
    source: 'Web Audio synth', license: 'n/a',
    why: 'Nightmare sting — dreams with teeth.' },
  { id: 'stingWave', label: 'Wave sting', hook: 'stingWave', synth: 'stingWave', origin: 'synth',
    source: 'Web Audio synth — the escalation, announced', license: 'n/a',
    why: 'Wave unlock sting — the escalation, announced.' },
  { id: 'waveUnlock', label: 'Wave unlock', hook: 'waveUnlock', synth: 'waveUnlock', origin: 'synth',
    source: 'Web Audio synth', license: 'n/a',
    why: 'A new wave enters the world.' },
  { id: 'levelup', label: 'Level up', hook: 'levelup', synth: 'levelup', origin: 'synth',
    source: 'Web Audio synth — soft breathy rise, no fanfare', license: 'n/a',
    why: 'A stat grows: soft breathy rise, no fanfare — felt, not heard.' },
  { id: 'knowledgeReveal', label: 'Knowledge reveal', hook: 'knowledgeReveal', synth: 'knowledgeReveal', origin: 'synth',
    source: 'Web Audio synth', license: 'n/a',
    why: 'Knowledge landing — the game\u2019s real currency, and it has a sound.' },
  { id: 'synergyDiscovered', label: 'Synergy discovered', hook: 'synergyDiscovered', synth: 'synergyDiscovered', origin: 'synth',
    source: 'Web Audio synth', license: 'n/a',
    why: 'Two things becoming more than two.' },
  { id: 'trialFanfare', label: 'Trial fanfare', hook: 'trialFanfare', synth: 'trialFanfare', origin: 'synth',
    source: 'Web Audio synth', license: 'n/a',
    why: 'A trial offered — the System\u2019s stage lights.' },
  { id: 'traderArrive', label: 'Trader arrives', hook: 'traderArrive', synth: 'traderArrive', origin: 'synth',
    source: 'Web Audio synth', license: 'n/a',
    why: 'The trader\u2019s arrival — commerce, announced.' },
  { id: 'systemCooking', label: 'System cooking', hook: 'systemCooking', synth: 'systemCooking', origin: 'synth',
    source: 'Web Audio synth — the System, busy', license: 'n/a',
    why: 'The System, busy — something is being made.' },
];

// ---------------------------------------------------------------------------
// Merge + emit.
// ---------------------------------------------------------------------------
Object.assign(M, W35);
for (const [id, hook] of Object.entries(MONSTER_SIG)) {
  if (!M[id]) { console.error('FATAL: MONSTER_SIG id not in curated table: ' + id); process.exit(1); }
  M[id].hook = hook;
}

const monstersArr = Object.keys(byId).map(id => {
  const v = byId[id];
  const e = M[id];
  if (!e) return { id, name: v.name, wave: v.wave, missing: true };
  return { id, name: v.name, wave: v.wave, hook: e.hook || null,
           files: e.files || [], synth: e.synth || null,
           origin: e.origin, source: e.source, license: e.license, why: e.why };
});

const data = { generated: new Date().toISOString(), monsters: monstersArr, sfx: SFX };
const out = 'window.AUDIO_LAB_DATA = ' + JSON.stringify(data, null, 1) + ';\n';
fs.writeFileSync(path.join(ROOT, 'tools/audio-lab-data.js'), out);
console.log('wrote tools/audio-lab-data.js: ' + monstersArr.length + ' monsters, ' + SFX.length + ' sfx');
