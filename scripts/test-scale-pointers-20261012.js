#!/usr/bin/env node
// test-scale-pointers-20261012.js — scale discoverability beats 4+5
// (SCALE-DISCOVERY.md, Steve 2026-10-12; retimed 2026-10-12).
// PROOF: the wave gates are scale-gated (wave 4 needs regional, wave 5 needs
// national — unlockedWave), but nothing ever told the player. These forward
// pointers fire ONCE, at the unlock, when the stage is too small:
//   - Beat 4: wave 3 UNLOCKS + below regional -> System producer beat
//     ("the next act needs a BIGGER STAGE... Get me a NETWORK") + a villager
//     echo at dawn the next day.
//   - Beat 5: wave 4 UNLOCKS + regional but below national -> escalation
//     ("FINALES need a NATION... The producers are WAITING").
// Retimed 2026-10-12: the old bar-banked trigger was a nearly unreachable
// window (scale-seekers are regional before banking 4 wave-3 points,
// non-seekers die in wave-3 combat first — 0 firings in 26 completion sims).
// The discoverability question arises the moment a new wave lands.
// Reactive (checked on every unlock check, never a timer), once-only (state
// flags), knowledge-gated (never names "Mirror Draft" — it's "the next act"
// until earned). The System never talks mechanics.
// SENSE: the test prints every fired pointer line for the human read;
// structural asserts keep the copy honest.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SYS_RE = /\u{1F4FA} "([^"]+)"/u;
const FIRE_RE = /\u{1F525} (\S+), at the fire: "(.+)"/u;

async function fresh(seed) {
  const { Game } = await loadGame({ seed, mode: 'reach' });
  await setupGame(Game);
  Game.state.scholar.day = 30;
  return Game;
}

function capture(Game) {
  const said = [];
  const orig = Game.say, origSys = Game.sysSay;
  // The harness stubs say/sysSay to no-ops for sims; re-enable both for
  // capture. sysSay mirrors production format (minus the systemArrived gate,
  // which tests set explicitly).
  Game.say = function (...a) { said.push(a.join(' ')); return orig.apply(this, arguments); };
  Game.sysSay = function (text) { said.push(`📺 SYSTEM: "${text}"`); };
  return { said, restore() { Game.say = orig; Game.sysSay = origSys; } };
}

// Drive the real kill path to a wave-3 UNLOCK: wave-2 bar is 5, perTypeCap 2,
// so three types (2+2+1). Day 30 >= day floor 25.
function unlockWave3(Game) {
  Game.checkWaveUnlockBeat(); // adopt-on-first-seen
  for (let i = 0; i < 2; i++) Game.recordWaveKill('bright_idea');
  for (let i = 0; i < 2; i++) Game.recordWaveKill('voice_mimic_radio');
  Game.recordWaveKill('mirror_stag');
  assert.strictEqual(Game.waveLedgerPoints(2), 5, 'pre: wave-2 bar banked');
  assert.strictEqual(Game.unlockedWave(), 3, 'pre: wave 3 unlocked');
}

// Bank the wave-3 bar (4 points, perTypeCap 2 -> two types). Does NOT unlock
// wave 4 without regional.
function bankWave3bar(Game) {
  for (let i = 0; i < 2; i++) Game.recordWaveKill('redactor');
  for (let i = 0; i < 2; i++) Game.recordWaveKill('gavel');
  assert.strictEqual(Game.waveLedgerPoints(3), 4, 'pre: wave-3 bar banked');
}

// Bank the wave-4 bar (3 points: 2+1).
function bankWave4bar(Game) {
  for (let i = 0; i < 2; i++) Game.recordWaveKill('congregation');
  Game.recordWaveKill('strike');
  assert.strictEqual(Game.waveLedgerPoints(4), 3, 'pre: wave-4 bar banked');
}

function livingFirsts(Game) {
  const v = Game.state.village || {};
  const me = Game.villagerId;
  return (v.roster || []).filter(id => {
    if (!id || id === me) return false;
    const p = Game.getPerson(id);
    return !!(p && !p.dead && p.name);
  }).map(id => String(Game.getPerson(id).name).split(' ')[0]);
}

(async () => {
  let pass = 0, fail = 0;
  const t = (name, fn) => { try { fn(); pass++; console.log('ok -', name); } catch (e) { fail++; console.log('FAIL -', name, '::', e.message); } };
  const allLines = [];

  // RED CONTROL: without checkScalePointers, the real unlock path emits no
  // pointer beats — proves the beats come from the new code.
  {
    const Game = await fresh(501);
    const keep = Game.checkScalePointers;
    delete Game.checkScalePointers;
    const { said, restore } = capture(Game);
    unlockWave3(Game);
    restore(); Game.checkScalePointers = keep;
    t('RED: no pointer beats without checkScalePointers', () =>
      assert.strictEqual(said.filter(s => /BIGGER STAGE|FINALES need/.test(s)).length, 0));
  }

  // BEAT 4 — fires at wave-3 unlock when still one fire.
  {
    const Game = await fresh(502);
    const { said, restore } = capture(Game);
    unlockWave3(Game);
    restore();
    const ptr = said.filter(s => /BIGGER STAGE/.test(s));
    ptr.forEach(l => allLines.push('w4: ' + l));
    t('beat 4: fires at wave-3 unlock below regional', () => {
      assert.strictEqual(Game.state._scalePtrW4, true, 'flag set');
      assert.ok(ptr.length >= 1, 'pointer beat fired');
      assert.ok(said.some(s => /CLEARED THE BOARD/.test(s)), 'cleared-board opener fired');
      assert.ok(said.some(s => /Get me a NETWORK/.test(s)), 'network ask fired');
    });
    t('beat 4: knowledge gate — never names Mirror Draft', () =>
      assert.strictEqual(said.filter(s => /mirror draft/i.test(s)).length, 0));
    t('beat 4: never mechanics-voice', () =>
      assert.strictEqual(said.filter(s => /scaleRank|unlockedWave|gate requires/i.test(s)).length, 0));
    t('beat 4: echo scheduled for tomorrow', () =>
      assert.strictEqual(Game.state._scalePtrW4EchoDay, 31));
  }

  // BEAT 4 — silent when already regional at wave-3 unlock (the unlock, not
  // the pointer, fires; banking the wave-3 bar then unlocks wave 4).
  {
    const Game = await fresh(503);
    Game.state.networkLive = true; // regional
    const { said, restore } = capture(Game);
    unlockWave3(Game);
    assert.strictEqual(Game.unlockedWave(), 3, 'pre: wave 3 live, wave 4 needs the bar');
    bankWave3bar(Game);
    restore();
    t('beat 4: silent when already regional', () => {
      assert.strictEqual(Game.state._scalePtrW4 || false, false, 'flag not set');
      assert.strictEqual(said.filter(s => /BIGGER STAGE/.test(s)).length, 0);
      assert.strictEqual(Game.unlockedWave(), 4, 'wave 4 unlocked instead');
    });
  }

  // BEAT 4 — silent when the wave-3 bar is banked but wave 3 hasn't unlocked
  // (day floor). The old trigger fired here; the retimed one waits for the
  // unlock — the question hasn't arisen yet.
  {
    const Game = await fresh(504);
    Game.state.scholar.day = 20; // below the wave-3 day floor (25)
    const { said, restore } = capture(Game);
    Game.checkWaveUnlockBeat(); // adopt-on-first-seen
    bankWave3bar(Game);
    restore();
    t('beat 4: silent when bar banked but wave 3 not unlocked', () => {
      assert.strictEqual(Game.unlockedWave(), 1, 'pre: still wave 1');
      assert.strictEqual(Game.state._scalePtrW4 || false, false);
      assert.strictEqual(said.filter(s => /BIGGER STAGE/.test(s)).length, 0);
    });
  }

  // BEAT 4 — silent when wave 3 isn't close (partial wave-2 bar).
  {
    const Game = await fresh(505);
    const { said, restore } = capture(Game);
    Game.checkWaveUnlockBeat();
    Game.recordWaveKill('bright_idea');
    Game.recordWaveKill('bright_idea');
    restore();
    t('beat 4: silent when wave 3 not unlocked', () => {
      assert.strictEqual(Game.unlockedWave(), 1);
      assert.strictEqual(Game.state._scalePtrW4 || false, false);
      assert.strictEqual(said.filter(s => /BIGGER STAGE/.test(s)).length, 0);
    });
  }

  // BEAT 4 — once-only: later kills and unlock checks never re-fire it.
  {
    const Game = await fresh(506);
    const { said, restore } = capture(Game);
    unlockWave3(Game);
    const first = said.filter(s => /BIGGER STAGE/.test(s)).length;
    assert.ok(first >= 1, 'pre: pointer fired once');
    for (let i = 0; i < 3; i++) Game.recordWaveKill('voice_mimic_radio');
    Game.checkWaveUnlockBeat();
    Game.checkWaveUnlockBeat();
    restore();
    t('beat 4: fires exactly once', () =>
      assert.strictEqual(said.filter(s => /BIGGER STAGE/.test(s)).length, first, 'no re-fire'));
  }

  // BEAT 4 ECHO — a living villager answers at dawn the next day.
  {
    const Game = await fresh(507);
    unlockWave3(Game); // pointer fired, echo scheduled day 31
    const { said, restore } = capture(Game);
    Game.scalePointerEcho(); // the dawn delivery (wired into endDay)
    restore();
    const echos = said.filter(s => FIRE_RE.test(s));
    echos.forEach(l => allLines.push('echo: ' + l));
    const firsts = livingFirsts(Game);
    t('beat 4 echo: one fire-side line, living speaker', () => {
      assert.strictEqual(echos.length, 1);
      const m = echos[0].match(FIRE_RE);
      assert.ok(firsts.includes(m[1]), `${m[1]} is a living roster member`);
      assert.ok(/one fire faces it/.test(m[2]), 'the designed line');
    });
  }

  // BEAT 4 ECHO — skipped if Haven went regional overnight.
  {
    const Game = await fresh(508);
    unlockWave3(Game);
    Game.state.networkLive = true; // the stage grew overnight
    const { said, restore } = capture(Game);
    Game.scalePointerEcho();
    restore();
    t('beat 4 echo: skipped when regional by dawn', () =>
      assert.strictEqual(said.filter(s => FIRE_RE.test(s)).length, 0));
  }

  // BEAT 5 — fires at wave-4 unlock when regional but below national.
  {
    const Game = await fresh(509);
    Game.state.networkLive = true; // regional
    const { said, restore } = capture(Game);
    Game.checkWaveUnlockBeat(); // adopt-on-first-seen
    bankWave3bar(Game); // regional + bar -> wave 4 unlocks
    restore();
    assert.strictEqual(Game.unlockedWave(), 4, 'pre: wave 4 unlocked');
    const ptr = said.filter(s => /FINALES need/.test(s));
    ptr.forEach(l => allLines.push('w5: ' + l));
    t('beat 5: fires at wave-4 unlock below national', () => {
      assert.strictEqual(Game.state._scalePtrW5, true, 'flag set');
      assert.ok(ptr.length >= 1, 'pointer beat fired');
      assert.ok(said.some(s => /A REGION!/.test(s)), 'region celebration fired');
      assert.ok(said.some(s => /producers are WAITING/.test(s)), 'producer wait fired');
    });
    t('beat 5: knowledge gate — never names the Producers wave', () =>
      assert.strictEqual(said.filter(s => /meet the producers/i.test(s)).length, 0));
    t('beat 5: never mechanics-voice', () =>
      assert.strictEqual(said.filter(s => /scaleRank|unlockedWave|gate requires/i.test(s)).length, 0));
  }

  // BEAT 5 — silent when already national (the unlock fires instead).
  {
    const Game = await fresh(510);
    Game.state.networkLive = true;
    Game.state.nationalLive = true; // national
    const { said, restore } = capture(Game);
    Game.checkWaveUnlockBeat();
    bankWave3bar(Game);
    assert.strictEqual(Game.unlockedWave(), 4, 'pre: wave 4 live');
    bankWave4bar(Game); // national + bar -> wave 5 unlocks
    for (let i = 0; i < 2; i++) Game.recordWaveKill('strike');
    Game.checkWaveUnlockBeat();
    restore();
    t('beat 5: silent when already national', () => {
      assert.strictEqual(Game.state._scalePtrW5 || false, false, 'flag not set');
      assert.strictEqual(said.filter(s => /FINALES need/.test(s)).length, 0);
      assert.strictEqual(Game.unlockedWave(), 5, 'wave 5 unlocked instead');
    });
  }

  // BEAT 5 — once-only, and silent after wave 5 is live.
  {
    const Game = await fresh(511);
    Game.state.networkLive = true;
    const { said, restore } = capture(Game);
    Game.checkWaveUnlockBeat();
    bankWave3bar(Game); // wave 4 unlocks -> pointer fires
    const first = said.filter(s => /FINALES need/.test(s)).length;
    assert.ok(first >= 1, 'pre: pointer fired once');
    for (let i = 0; i < 3; i++) Game.recordWaveKill('congregation');
    Game.checkWaveUnlockBeat();
    restore();
    t('beat 5: fires exactly once', () =>
      assert.strictEqual(said.filter(s => /FINALES need/.test(s)).length, first, 'no re-fire'));
  }

  // LEDGER 100% lines are scale-aware: no mechanics-voice gate sentence when
  // the scale floor binds; accurate line when the floor is met.
  {
    const Game = await fresh(512);
    Game.state.systemArrived = true; // sysSay gate: the System is here by day 30
    const { said, restore } = capture(Game);
    Game.checkWaveUnlockBeat();
    bankWave3bar(Game); // village-scale: bar-full reported, gate sentence withheld
    restore();
    t('ledger: no "goes regional" mechanics-voice when floor binds', () =>
      assert.strictEqual(said.filter(s => /goes regional|goes national/i.test(s)).length, 0));
    t('ledger: bar-full still reported', () =>
      assert.ok(said.some(s => /wave 3's bar is full/.test(s))));
  }
  {
    const Game = await fresh(513);
    Game.state.networkLive = true;
    Game.state.systemArrived = true;
    const { said, restore } = capture(Game);
    Game.checkWaveUnlockBeat();
    bankWave3bar(Game); // regional: wave 4 unlocks; ledger names what's next
    restore();
    t('ledger: accurate next-step line when floor already met', () =>
      assert.ok(said.some(s => /cleared for release/.test(s))));
  }

  console.log('\n--- pointer copy (sense read) ---');
  allLines.forEach(l => console.log(l));
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
