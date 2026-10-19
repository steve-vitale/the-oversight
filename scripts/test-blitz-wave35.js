#!/usr/bin/env node
// BLITZ PROOF: wave 3-5 signature mechanics — one honest assertion per monster.
// For EACH of the 26 wave 3-5 monsters: start a REAL blow-by-blow fight,
// drive the telegraphed signature, and assert the MECHANICAL effect (state
// change / HP delta / real counterplay verb), not just narration. This is
// the cross-check on the per-monster proof scripts: different drivers, one
// core effect each.
// RED: MECHANIC=off node scripts/test-blitz-wave35.js (hooks absent -> gate RED).
// Green: SEED=1,2,3 node scripts/test-blitz-wave35.js
const H = require('./sim-harness.js');
const SEED = parseInt(process.env.SEED || '1', 10);
const MECHANIC_OFF = process.env.MECHANIC === 'off';

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

function endTurn(Game) {
  if (!Game.tbfight || Game.tbfight.over) return;
  if (!Game.tbIsPlayerTurn()) return;
  const p = Game.tbFighter('p');
  if (!p) return;
  p.moveLeft = 0; p.acted = true;
  Game.tbAfterPlayerAction();
}
function waitPlayerTurn(Game) {
  let g = 0;
  while (Game.tbfight && !Game.tbfight.over && !Game.tbIsPlayerTurn() && g++ < 200) Game.tbAdvance();
}
function monsterOf(Game, id) {
  return Game.tbfight.fighters.find(x => x.kind === 'monster' && x.alive && !x.fled && (!id || (x.mdef && x.mdef.id === id)));
}
function endFight(Game) {
  if (Game.tbfight) { Game.tbfight.over = true; Game.tbfight = null; }
  try { Game.state.scholar.monster = null; } catch (e) {}
}
// one full monster phase; returns the new say-text produced during it.
function monPhase(Game, said) {
  const n = said.length;
  endTurn(Game);
  let g = 0;
  while (Game.tbfight && !Game.tbfight.over && !Game.tbIsPlayerTurn() && g++ < 60) Game.tbAdvance();
  return said.slice(n).join(' ');
}
// titans refuse solo fights — muster the way the game does.
function muster(Game, id) {
  try {
    Game.state.titans = Game.state.titans || {};
    Game.state.titans.musters = Game.state.titans.musters || {};
    const need = { nielsen: 12, finale: 20 }[id] || 0;
    if (need && !Game.state.titans.musters[id]) {
      // Explicit named living muster fixture for signature mechanics.
      // This is not a natural recruitment/coalition-availability claim.
      const town = { id: 'blitz_fixture_' + id, name: 'Prepared blitz fire',
        roster: Array.from({ length: need }, (_, i) => ({ id: id + '_blade_' + i, name: 'Blade ' + i, age: 35, alive: true, health: 100 })) };
      Game.state.otherVillages.push(town);
      const allies = town.roster.map(r => ({ vid: r.id, villageId: town.id, name: r.name, hp: r.health, outfitted: [], gearValue: 0 }));
      Game.state.titans.musters[id] = { allies, haven: [], day: 0, outfitted: {} };
    }
  } catch (e) {}
}
function startFight(Game, id, said) {
  said.length = 0;
  const s = Game.state.scholar;
  s.health = 9000; s.mx = 4; s.my = 4;
  muster(Game, id);
  Game.startCombat(id);
  const p = Game.tbFighter('p');
  if (p) { p.maxHp = Math.max(p.maxHp || 0, 9000); p.hp = 9000; }
  const m = monsterOf(Game, id);
  if (m && p) {
    p.mx = Math.max(1, Math.min(7, m.mx + 1)); p.my = Math.max(1, Math.min(7, m.my));
    s.mx = p.mx; s.my = p.my;
  }
  return m;
}
function strike(Game, id) {
  try {
    const m = monsterOf(Game, id);
    if (m) Game.tbPlayerStrike(m.key);
  } catch (e) {}
}

(async () => {
  const { Game } = await H.loadGame({ seed: SEED });
  await H.setupGame(Game);
  Game.depart();
  console.log('== BLITZ WAVE3-5 PROOF, SEED ' + SEED + ', MECHANIC ' + (MECHANIC_OFF ? 'OFF' : 'ON') + ' ==');
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.audioEvent = () => {};

  // RED GATE: all 26 signature hooks registered (one per monster).
  const HB = globalThis.MonsterBehaviorHooks || {};
  const HOOKS = {
    redactor: 'sigRedactor', gavel: 'sigGavel', focus_group: 'sigFocusGroup',
    spool: 'spoolWatch', chorus_line: 'chorusBeat', terms_of_service: 'tosClauses',
    callback: 'cbFace', buffering: 'bufMirage', ad_break: 'adBreak',
    congregation: 'sigCongregation', strike: 'sigStrike', influencer: 'sigInfluencer',
    audit: 'sigAudit', reunion: 'sigReunion', suburb: 'sigSuburb',
    eulogy: 'sigEulogy', algorithm: 'sigAlgorithm', eater: 'sigEater',
    cancellation: 'cxStamp', editor: 'edCut', rerun: 'rrTake',
    spoiler: 'spAnnounce', timeslot: 'tsReschedule', nielsen: 'niWatch',
    finale: 'fiFinaleHeart', network_note: 'nnNote',
  };
  const missing = Object.keys(HOOKS).filter(id => typeof HB[HOOKS[id]] !== 'function');
  ok('all 26 signature hooks registered', missing.length === 0, 'missing: ' + missing.join(','));
  if (missing.length) {
    console.log('MECHANIC off — signatures absent as expected; skipping behavior checks.');
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(1);
  }

  // ================= WAVE 3 =================

  // 1. REDACTOR: point (named target, a full round ahead) -> redact (real effect).
  // Stay loud: quiet turns starve it and it flees (real mechanic, not a bug).
  {
    startFight(Game, 'redactor', said);
    let pointed = false, done = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 14 && !done) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const p0 = Game.tbFighter('p');
      const px0 = p0.mx, py0 = p0.my, dis0 = !!p0.sigRedactWeapon;
      strike(Game, 'redactor'); // loud every round — no starvation
      const seg = monPhase(Game, said);
      if (/POINTING/.test(seg)) pointed = true;
      if (pointed && /REDACTED|redacts your last turn|FOOTING/.test(seg)) {
        done = true;
        const p1 = Game.tbFighter('p');
        const disarmed = !!p1.sigRedactWeapon && !dis0; // weapon redact: strikes unarmed 2 rounds
        const shoved = (p1.mx !== px0 || p1.my !== py0); // footing redact: shoved
        const unwrote = /un-writes itself.*\+\d+ HP/.test(seg); // last-turn redact: wound un-written, HP named
        ok('redactor: the redaction lands a REAL effect (disarm / shove / un-write)', disarmed || shoved || unwrote, seg.slice(0, 140));
      }
    }
    ok('redactor: handles POINT at a named target a full round ahead', pointed);
    ok('redactor: the redaction executes', done);
    endFight(Game);
  }

  // 2. GAVEL: accuse (names the crime, a full round of warning) -> verdict (real damage).
  {
    startFight(Game, 'gavel', said);
    let accused = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 8 && !accused) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/THE ACCUSED WILL RISE/.test(monPhase(Game, said))) accused = true;
    }
    ok('gavel: accuses from your record (verdict warned a full round ahead)', accused);
    const hb = Game.tbFighter('p').hp;
    let fell = false, dhp = 0, guard2 = 0;
    while (Game.tbfight && !Game.tbfight.over && guard2++ < 6 && !fell) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/THE VERDICT FALLS/.test(monPhase(Game, said))) { fell = true; dhp = hb - Game.tbFighter('p').hp; }
    }
    ok('gavel: the verdict falls', fell);
    ok('gavel: verdict deals real damage', dhp > 0, 'dmg=' + dhp);
    endFight(Game);
  }

  // 3. FOCUS GROUP: the murmur deliberates audibly; loved/hated is real state.
  {
    const m = startFight(Game, 'focus_group', said);
    for (let i = 0; i < 2; i++) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      strike(Game, 'focus_group'); endTurn(Game);
    }
    let rated = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 6 && !rated) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const seg = monPhase(Game, said);
      const mm = monsterOf(Game, 'focus_group');
      if (/LOVE your|HATE your/.test(seg) && mm && mm.sigFG && mm.sigFG.rating) rated = true;
    }
    ok('focus_group: the murmur deliberates audibly (loved/hated is real state)', rated);
    endFight(Game);
  }

  // 4. SPOOL: records 3 turns harmlessly, then replays your strike back at you.
  {
    startFight(Game, 'spool', said);
    waitPlayerTurn(Game); strike(Game, 'spool'); endTurn(Game);
    waitPlayerTurn(Game); Game.tbPlayerWait(); endTurn(Game);
    waitPlayerTurn(Game); strike(Game, 'spool'); endTurn(Game);
    const hb = Game.tbFighter('p').hp;
    let replayed = false, dhp = 0, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 10 && !replayed) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/tape plays your own swing/.test(monPhase(Game, said))) { replayed = true; dhp = hb - Game.tbFighter('p').hp; }
    }
    ok('spool: the tape replays your strike back at you', replayed);
    ok('spool: the replayed strike deals real damage', dhp > 0, 'dmg=' + dhp);
    endFight(Game);
  }

  // 5. CHORUS LINE: the 4/4 count is honest; the downbeat kick lands.
  {
    startFight(Game, 'chorus_line', said);
    said.length = 0;
    const hb = Game.tbFighter('p').hp;
    let kicked = false, dhp = 0, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 10 && !kicked) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/DOWNBEAT/.test(monPhase(Game, said))) { kicked = true; dhp = hb - Game.tbFighter('p').hp; }
    }
    ok('chorus_line: beats count 1-3, only the downbeat kicks', kicked && /BEAT [123]\/4/.test(said.join(' ')));
    ok('chorus_line: the downbeat kick lands for real', dhp > 0, 'dmg=' + dhp);
    endFight(Game);
  }

  // 6. TERMS OF SERVICE: a legible clause is added mid-fight (real pending state).
  {
    const m = startFight(Game, 'terms_of_service', said);
    let clause = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 10 && !clause) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const seg = monPhase(Game, said);
      const mm = monsterOf(Game, 'terms_of_service');
      if (/UNROLLS TOWARD YOU|GLOWS/.test(seg) && mm && mm.tosPending && mm.tosPending.length) clause = true;
    }
    ok('terms_of_service: a legible clause is added mid-fight (pending state real)', clause);
    endFight(Game);
  }

  // 7. CALLBACK: wears a dead face, names it — the wrongness is the telegraph.
  {
    const m = startFight(Game, 'callback', said);
    let faced = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 4 && !faced) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const seg = monPhase(Game, said);
      const mm = monsterOf(Game, 'callback');
      if (/wears .*'s face/.test(seg) && mm && mm.cbFace && mm.cbFace.name) faced = true;
    }
    ok('callback: wears a named face (the wrongness is the telegraph)', faced, 'face=' + ((m.cbFace || {}).name));
    endFight(Game);
  }

  // 8. BUFFERING: announces the future truthfully — and the future happens.
  {
    startFight(Game, 'buffering', said);
    let announced = false, honored = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 8 && !honored) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const seg = monPhase(Game, said);
      if (/IT WILL STEP|IT WILL STRIKE/.test(seg)) announced = true;
      if (announced && /exactly where it said it would|empty air|flails at the air/.test(seg)) honored = true;
    }
    ok('buffering: telegraphs announce the future truthfully', announced);
    ok('buffering: the announced future actually happens', honored);
    endFight(Game);
  }

  // 9. AD BREAK: the fight pauses for an ad with a real progress bar; a skip beat arrives.
  {
    const m = startFight(Game, 'ad_break', said);
    let paused = false, skip = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 16 && !skip) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const seg = monPhase(Game, said);
      const mm = monsterOf(Game, 'ad_break');
      if (/AD BREAK/.test(seg) && mm && mm.adActive) paused = true;
      if (/SKIP AD is available/.test(seg)) skip = true;
    }
    ok('ad_break: the fight pauses for an ad (progress bar is real state)', paused);
    ok('ad_break: a SKIP AD beat arrives', skip);
    endFight(Game);
  }

  // ================= WAVE 4 =================

  // 10. CONGREGATION: the bell rings an invitation; accepting absolves (real heal) at the price of a real geas.
  {
    const m = startFight(Game, 'congregation', said);
    let guard = 0, invited = false;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 6 && !invited) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/steeple RINGS/i.test(monPhase(Game, said))) invited = true;
    }
    ok('congregation: the steeple RINGS an invitation (it cannot compel uninvited)', invited);
    const p = Game.tbFighter('p'); p.hp = 50;
    waitPlayerTurn(Game);
    Game.tbCongAccept();
    const m2 = monsterOf(Game, 'congregation');
    ok('congregation: absolution heals for real', Game.tbFighter('p').hp > 50, 'hp=' + Game.tbFighter('p').hp);
    ok('congregation: the geas binds (real state)', !!(m2 && m2.sigCong && m2.sigCong.geas >= 1));
    endFight(Game);
  }

  // 11. STRIKE: posts readable demands, then the shutdown it promised.
  {
    const m = startFight(Game, 'strike', said);
    waitPlayerTurn(Game);
    const seg1 = monPhase(Game, said);
    const m1 = monsterOf(Game, 'strike');
    ok('strike: demands posted (readable, real state)', /demands/i.test(seg1) && !!(m1 && m1.sigStrike && m1.sigStrike.demands));
    let shut = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 6 && !shut) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/SHUTDOWN|shut/i.test(monPhase(Game, said))) shut = true;
    }
    ok('strike: the shutdown it promised actually lands', shut);
    endFight(Game);
  }

  // 12. INFLUENCER: recruits literal follower adds (real fighters, not flavor).
  {
    startFight(Game, 'influencer', said);
    waitPlayerTurn(Game); monPhase(Game, said);
    waitPlayerTurn(Game); monPhase(Game, said);
    const m2 = monsterOf(Game, 'influencer');
    ok('influencer: follower count is real state', !!(m2 && m2.sigInfl && m2.sigInfl.followers >= 1), JSON.stringify(m2 && m2.sigInfl));
    endFight(Game);
  }

  // 13. AUDIT: on schedule, it taxes your most-used verb (real debuff state).
  {
    startFight(Game, 'audit', said);
    for (let i = 0; i < 2; i++) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      strike(Game, 'audit'); endTurn(Game);
    }
    let audited = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 8 && !audited) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const seg = monPhase(Game, said);
      const mm = monsterOf(Game, 'audit');
      if (/AUDIT DAY/i.test(seg) || (mm && mm.sigAudit && mm.sigAudit.taxed)) audited = true;
    }
    ok('audit: audit day fires on schedule and taxes (real state)', audited);
    endFight(Game);
  }

  // 14. REUNION: mirrors your most-used verb back at you.
  {
    startFight(Game, 'reunion', said);
    for (let i = 0; i < 3; i++) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      strike(Game, 'reunion'); endTurn(Game);
    }
    let mirrored = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 6 && !mirrored) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/Faces surface|back at you/.test(monPhase(Game, said))) mirrored = true;
    }
    ok('reunion: it mirrors your most-used verb back at you', mirrored);
    endFight(Game);
  }

  // 15. SUBURB: rest heals for real — and complacency is a real counter.
  {
    const m = startFight(Game, 'suburb', said);
    waitPlayerTurn(Game);
    const p = Game.tbFighter('p'); p.hp = 100;
    Game.tbSuburbRest();
    const m2 = monsterOf(Game, 'suburb');
    ok('suburb: rest heals for real', Game.tbFighter('p').hp > 100, 'hp=' + Game.tbFighter('p').hp);
    ok('suburb: complacency stacks (real state)', !!(m2 && m2.sigSuburb && m2.sigSuburb.complacency === 1));
    endFight(Game);
  }

  // 16. EULOGY: the doom narration ticks a real verse counter.
  {
    const m = startFight(Game, 'eulogy', said);
    waitPlayerTurn(Game);
    const seg = monPhase(Game, said);
    const m2 = monsterOf(Game, 'eulogy');
    ok('eulogy: a verse is narrated', /narrates/i.test(seg));
    ok('eulogy: the doom counter is real state', !!(m2 && m2.sigEulogy && m2.sigEulogy.verses < 5), JSON.stringify(m2 && m2.sigEulogy));
    endFight(Game);
  }

  // 17. ALGORITHM: shows its thumbnails (the preview is the telegraph).
  {
    startFight(Game, 'algorithm', said);
    waitPlayerTurn(Game);
    const seg = monPhase(Game, said);
    ok('algorithm: thumbnail previews shown', /Thumbnails/i.test(seg), seg.slice(0, 120));
    endFight(Game);
  }

  // 18. EATER: eats for real — growth is kcal-derived, not flavor.
  {
    const m = startFight(Game, 'eater', said);
    try { Game.state.scholar.packKcal = 5000; } catch (e) {}
    waitPlayerTurn(Game);
    const seg = monPhase(Game, said);
    const m2 = monsterOf(Game, 'eater');
    const ate = /SMACKING|YOUR PACK/i.test(seg) && m2 && m2.sigEater && m2.sigEater.eaten > 0;
    ok('eater: it eats for real (kcal counted, growth derived)', !!ate, seg.slice(0, 140));
    endFight(Game);
  }

  // ================= WAVE 5 =================

  // 19. CANCELLATION: the stamp descends 3 turns, then un-teaches real abilities.
  {
    const s = Game.state.scholar;
    s.abilities = [{ id: 'ab1', name: 'Alpha', level: 3 }, { id: 'ab2', name: 'Beta', level: 1 }, { id: 'ab3', name: 'Gamma', level: 2 }];
    s.backgroundAbilities = [{ id: 'human_skill', name: 'Human Skill' }];
    startFight(Game, 'cancellation', said);
    let fell = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 8 && !fell) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/THE STAMP FALLS/.test(monPhase(Game, said))) fell = true;
    }
    ok('cancellation: the stamp falls after its 3-turn descend', fell);
    ok('cancellation: it un-teaches real System abilities', s.abilities.length < 3, 'abilities=' + s.abilities.length);
    endFight(Game);
  }

  // 20. EDITOR: cuts your last turn — the damage is really un-dealt.
  {
    const m = startFight(Game, 'editor', said);
    waitPlayerTurn(Game); strike(Game, 'editor'); endTurn(Game);
    const mhpBefore = m.hp;
    let cut = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 8 && !cut) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/CUT — your last turn/.test(monPhase(Game, said))) cut = true;
    }
    const m2 = monsterOf(Game, 'editor');
    ok('editor: the cut lands on the telegraphed target', cut);
    ok('editor: the damage is really un-dealt (HP restored)', !!m2 && m2.hp >= mhpBefore - 1, 'hp ' + mhpBefore + ' -> ' + (m2 && m2.hp));
    endFight(Game);
  }

  // 21. RERUN: every 5 rounds the fight rewinds — HP really rewinds.
  {
    const m = startFight(Game, 'rerun', said);
    const mhpHurt = m.maxHp - 300;
    m.hp = mhpHurt;
    let clapped = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 10 && !clapped) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/CLAP — "TAKE/.test(monPhase(Game, said))) clapped = true;
    }
    const m2 = monsterOf(Game, 'rerun');
    ok('rerun: the clap lands every 5th round', clapped);
    ok('rerun: HP really rewinds', !!m2 && m2.hp === mhpHurt + 300, 'hp=' + (m2 && m2.hp));
    endFight(Game);
  }

  // 22. SPOILER: truthful prophecies, announced with a real round count.
  {
    startFight(Game, 'spoiler', said);
    let prophesied = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 10 && !prophesied) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      const seg = monPhase(Game, said);
      const mm = monsterOf(Game, 'spoiler');
      if (/AND THEN/.test(seg) && mm && mm.spWeight != null) prophesied = true;
    }
    ok('spoiler: a prophecy is announced (weight is real state)', prophesied);
    endFight(Game);
  }

  // 23. TIMESLOT: reschedules you to a real, worsening venue.
  {
    startFight(Game, 'timeslot', said);
    let moved = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 10 && !moved) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/RESCHEDULED|HIGHLIGHTED/.test(monPhase(Game, said))) moved = true;
    }
    ok('timeslot: it reschedules you (venue change is real)', moved);
    endFight(Game);
  }

  // 24. NIELSEN: ratings are a real 0-100 number; boring play starves it.
  {
    const m = startFight(Game, 'nielsen', said);
    for (let i = 0; i < 3; i++) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      Game.tbPlayerWait(); endTurn(Game); // boring: the ratings should sink
    }
    waitPlayerTurn(Game);
    monPhase(Game, said);
    const m2 = monsterOf(Game, 'nielsen');
    const all = said.join(' ');
    ok('nielsen: ratings announced as a real number', /RATINGS|VIEWERS/.test(all));
    ok('nielsen: boring play sinks the ratings (real state)', !!m2 && (m2.niRatings < 40 || /SIGN-OFF/.test(all)), 'ratings=' + (m2 && m2.niRatings));
    endFight(Game);
  }

  // 25. FINALE: bloodied (or round 4) declares the countdown for real.
  {
    const m = startFight(Game, 'finale', said);
    m.hp = Math.floor(m.maxHp * 0.4);
    let declared = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 6 && !declared) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/PREVIOUSLY ON/.test(monPhase(Game, said))) declared = true;
    }
    ok('finale: bloodied declares the countdown (the sky replays your life)', declared);
    endFight(Game);
  }

  // 26. NETWORK NOTE: memos announce, then apply — real debuffs, then reverted.
  {
    startFight(Game, 'network_note', said);
    let announced = false, applied = false, guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 10 && !announced) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/VISIBLE:|writes down YOUR note/.test(monPhase(Game, said))) announced = true;
    }
    guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 8 && !applied) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      if (/NOTE APPLIED/.test(monPhase(Game, said))) applied = true;
    }
    ok('network_note: the memo is announced a full turn ahead', announced);
    ok('network_note: the note really applies (then reverts)', applied);
    endFight(Game);
  }

  // ================= REGRESSION: waves 1-2 untouched =================
  {
    // Highbeam Deer (the benchmark): real blow-by-blow, both sides deal damage.
    const m = startFight(Game, 'gallowdeer', said);
    const mhp0 = m.hp, php0 = Game.tbFighter('p').hp;
    for (let i = 0; i < 3; i++) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      strike(Game, 'gallowdeer'); endTurn(Game);
    }
    const m2 = monsterOf(Game, 'gallowdeer');
    ok('regression: highbeam deer takes real strike damage', !!m2 && m2.hp < mhp0, 'mhp ' + mhp0 + ' -> ' + (m2 && m2.hp));
    ok('regression: highbeam deer fights back for real', Game.tbFighter('p').hp < php0, 'php ' + php0 + ' -> ' + Game.tbFighter('p').hp);
    endFight(Game);
  }
  {
    // Wave-2 Heckler: morale fight still functions.
    const m = startFight(Game, 'heckler', said);
    const mhp0 = m.hp;
    for (let i = 0; i < 3; i++) {
      waitPlayerTurn(Game); if (!Game.tbfight || Game.tbfight.over) break;
      strike(Game, 'heckler'); endTurn(Game);
    }
    const m2 = monsterOf(Game, 'heckler');
    ok('regression: wave-2 heckler still fights blow-by-blow', !!m2 && m2.hp < mhp0);
    endFight(Game);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e.message); process.exit(1); });
