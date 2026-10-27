#!/usr/bin/env node
// test-teach-new-band.js — MEASUREMENT BAND for tackle-teach (frozen).
// Pre-registered in evidence/2026-10-27/tackle-teach-prereg.md BEFORE any
// measurement on this band. Same script, same seeds, before and after.
//
// Band: 6 seeds x 30 village days. Fresh run per seed, System arrived
// (seeking is System-era by design), villagers at home with neutral needs
// and a fed pantry, so objPick is not swallowed by REST/EAT gates. Each
// day: villagerBuildDay() (skill lessons + sheet resolution) plus one
// fresh objPick per living non-bearer villager at home (obj reset to idle
// first, exactly like scripts/test-motivation-wire.js, so each day samples
// "does this villager want to seek today" cleanly).
//
// Counts (band totals across seeds):
//   SEEK-ATTEMPTS: objPick results of kind SEEK.
//   WANTS: daily villagerWantsKnowledge samples (sheet/build/null).
//   SEEK-SUCCESS: villager_seek_knowledge tele events.
//   NEW-ABILITY: npcKnow gains where the learner's before-level was
//     absent/0, split by same-day source: seek-teacher, seek-system
//     (System broadcast fallback inside the seek), sheet (System sheet
//     show on level-up resolution), other (witness/talk/unattributed).
//   RETEACH-ABILITY: npcKnow level raises on an already-known id.
//   SKILL-NEW: skillLessons ledger entries (skill lane, never counted
//     as ability teaches).
//   CONVO-TEACH: npcLearnFromTalk gains from one driven held conversation
//     per seed, and whether each produced a tele or journal entry.
//   HOLDERS: villagers holding >=1 ability (teacher availability).
//
// No file writes; prints JSON. No gating thresholds are touched by this
// script. Exit 0 always (it measures; the proof test asserts).
const lib = require('./godpath/lib.js');

const SEEDS = [71001, 71002, 71003, 71004, 71005, 71006];
const DAYS = 30;

function knowSnap(Game, vid) {
  return Object.assign({}, ((((Game.state.village || {}).npcKnow) || {})[vid] || {}));
}
function skillsSnap(Game, vid) {
  return ((((Game.state.village || {}).npcSkills) || {})[vid] || []).slice();
}
function teleCount(Game, type) {
  return lib.teleEvents(Game, type).length;
}
function livingVillagers(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    const vp = Game.vpOf ? Game.vpOf(id) : null;
    return !(vp && vp.dead);
  });
}
function atHome(Game, vid, hx, hy) {
  try { Game.npcSetNode(vid, hx, hy); } catch (e) {}
  try { Game.npcSetInside(vid, true); } catch (e) {}
  try {
    const n = Game.npcNeeds(vid);
    n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10;
  } catch (e) {}
}

async function runSeed(seed) {
  const Game = await lib.load({ seed });
  lib.newRun(Game);
  const v = Game.state.village;
  const s = Game.state.scholar || {};
  Game.state.systemArrived = true;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = livingVillagers(Game);
  for (const id of ids) { atHome(Game, id, hx, hy); try { v.trust[id] = 50; } catch (e) {} }

  const R = {
    seed, villagers: ids.length, wantsSheet: 0, wantsBuild: 0, wantsNull: 0,
    nullTargetFull: 0, nullThrottled: 0, nullOther: 0,
    seekAttempts: 0, seekSuccess: 0, newSeekTeacher: 0, newSeekSystem: 0,
    newSheet: 0, newOther: 0, reteach: 0, skillNew: 0,
    holdersDay1: 0, holdersDay30: 0, targetDist30: '',
    convoTried: 0, convoTaught: 0, convoLedgered: 0, convoLines: [],
  };
  const heldBy = (vid) => ((v.npcAbilities || {})[vid] || []).length;

  for (let d = 1; d <= DAYS; d++) {
    s.day = d;
    const knowBefore = {}, skillsBefore = {};
    for (const id of ids) { knowBefore[id] = knowSnap(Game, id); skillsBefore[id] = skillsSnap(Game, id); }
    const seekBefore = teleCount(Game, 'villager_seek_knowledge');
    const lessonsBefore = ((v.skillLessons || []).length);
    const seekEvsBefore = lib.teleEvents(Game, 'villager_seek_knowledge');

    try { if (Game.villagerBuildDay) Game.villagerBuildDay(); } catch (e) {}
    const daySeekEvs = [];
    for (const id of ids) {
      atHome(Game, id, hx, hy);
      let wk = null;
      try { wk = Game.villagerWantsKnowledge ? Game.villagerWantsKnowledge(id) : null; } catch (e) {}
      if (wk === 'sheet') R.wantsSheet++;
      else if (wk === 'build') R.wantsBuild++;
      else {
        R.wantsNull++;
        // diagnostic breakdown of the null: plan full, or throttled?
        try {
          const tb = Game.villagerTargetBuild ? Game.villagerTargetBuild(id).length : 0;
          const ls = (Game.npcXp(id) || {}).lastSeek;
          if (tb >= 3) R.nullTargetFull++;
          else if (ls != null && (s.day || 0) - ls < 4) R.nullThrottled++;
          else R.nullOther++;
        } catch (e) { R.nullOther++; }
      }
      let o = null;
      try {
        const oo = Game.objOf(id);
        oo.kind = 'idle'; oo.state = 'idle';
        o = Game.objPick(id, hx, hy);
      } catch (e) {}
      if (o && o.kind === 'SEEK') R.seekAttempts++;
    }
    const seekEvsAfter = lib.teleEvents(Game, 'villager_seek_knowledge');
    for (let i = seekEvsBefore.length; i < seekEvsAfter.length; i++) daySeekEvs.push(seekEvsAfter[i]);
    R.seekSuccess += (teleCount(Game, 'villager_seek_knowledge') - seekBefore);

    // classify npcKnow deltas for the day
    for (const id of ids) {
      const after = knowSnap(Game, id);
      const before = knowBefore[id];
      const seekForVid = daySeekEvs.filter(e => e.vid === id);
      const grantForVid = lib.teleEvents(Game, 'villager_grant').some(e => e.vid === id);
      for (const aid of Object.keys(after)) {
        const b = before[aid] || 0, a = after[aid] || 0;
        if (a <= b) continue;
        if (b === 0) {
          if (seekForVid.length) {
            if (seekForVid.some(e => e.teacher === 'system')) R.newSeekSystem++;
            else R.newSeekTeacher++;
          } else if (grantForVid) R.newSheet++;
          else R.newOther++;
        } else R.reteach++;
      }
      const skAfter = skillsSnap(Game, id);
      for (const sid of skAfter) if (skillsBefore[id].indexOf(sid) < 0) R.skillNew++;
    }
    void lessonsBefore;
    if (d === 1) R.holdersDay1 = ids.filter(id => heldBy(id) > 0).length;
    if (d === DAYS) {
      R.holdersDay30 = ids.filter(id => heldBy(id) > 0).length;
      const dist = {};
      for (const id of ids) {
        let n = 0;
        try { n = Game.villagerTargetBuild(id).length; } catch (e) {}
        dist[n] = (dist[n] || 0) + 1;
      }
      R.targetDist30 = JSON.stringify(dist);
    }
  }

  // CONVO sub-probe: one driven held conversation per seed. The bearer
  // must hold something teachable; a fresh bearer holds nothing, so give
  // the bearer one magic ability first (test-only setup of the
  // conversation's precondition, not a grant to the villager).
  try {
    let bearerHeld = ((Game.state.scholar || {}).abilities || []).map(e => (e && (e.evolvedFrom || e.id)) || e);
    if (!bearerHeld.length) {
      const magic = ((Game.data || {}).abilities || []).find(a => a && a.id && a.lane === 'magic');
      if (magic) { try { lib.giveAbility(Game, magic.id); } catch (e) {} }
      bearerHeld = ((Game.state.scholar || {}).abilities || []).map(e => (e && (e.evolvedFrom || e.id)) || e);
    }
    const cand = ids.find(id => {
      const k = knowSnap(Game, id);
      return bearerHeld.some(a => (k[a] || 0) < 2);
    });
    if (cand && bearerHeld.length) {
      R.convoTried = 1;
      const knowB = knowSnap(Game, cand);
      const teleB = teleCount(Game, 'villager_seek_knowledge') + teleCount(Game, 'villager_level_up') + teleCount(Game, 'villager_talk_teach');
      const notesB = (((Game.state.codex || {}).notes) || []).length;
      const sayLines = [];
      const origSay = Game.say;
      Game.say = function (m) { if (typeof m === 'string') sayLines.push(m); try { return origSay.apply(this, arguments); } catch (e) {} };
      let r = null;
      try { r = Game.startConvo(cand); } catch (e) {}
      let turns = 0;
      while (r && !r.ended && turns < 8) {
        turns++;
        const choices = (r.choices && r.choices.length) ? r.choices : (Game.convoChoices ? Game.convoChoices(cand) : []);
        const pick = (choices || []).find(x => x && x.id === 'dlg:react') ||
          (choices || []).find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0);
        if (!pick) break;
        try { r = Game.convoTurn(cand, pick.id); } catch (e) { break; }
      }
      const c = Game.convoGet ? Game.convoGet(cand) : {};
      const transcriptLen = (c && c.transcript) ? c.transcript.length : 0;
      try { Game.endConvo(cand, 'done'); } catch (e) {}
      Game.say = origSay;
      const knowA = knowSnap(Game, cand);
      let gained = null;
      for (const aid of Object.keys(knowA)) {
        if ((knowA[aid] || 0) > (knowB[aid] || 0) && (knowB[aid] || 0) < 2) gained = aid;
      }
      if (gained) {
        R.convoTaught = 1;
        // ledgered? a villager_talk_teach tele event or a codex journal
        // note for this teach (the tackle-teach ledger fix). sayLines
        // also carry the journal note's spoken line.
        const teleNow = teleCount(Game, 'villager_seek_knowledge') + teleCount(Game, 'villager_level_up') + teleCount(Game, 'villager_talk_teach');
        const notesNow = (((Game.state.codex || {}).notes) || []).length;
        const noteHit = (((Game.state.codex || {}).notes) || []).some(n => n.key === 'talk-teach:' + cand + ':' + gained);
        const journalHit = sayLines.some(l => l.indexOf('picked up') >= 0 && l.indexOf(gained) >= 0) || noteHit || notesNow > notesB;
        if (teleNow > teleB || journalHit) R.convoLedgered = 1;
        if (noteHit || sayLines.some(l => l.indexOf('picked up') >= 0)) {
          const line = sayLines.find(l => l.indexOf('picked up') >= 0) || ('note: talk-teach:' + cand + ':' + gained);
          R.convoLines.push(`  ledger line: ${line}`);
        }
        R.convoLines.push(`seed ${seed}: talk taught ${gained} (transcript ${transcriptLen}, ledgered=${R.convoLedgered})`);
      } else {
        R.convoLines.push(`seed ${seed}: talk taught nothing (transcript ${transcriptLen}, bearerHeld ${bearerHeld.length})`);
      }
    }
  } catch (e) { R.convoLines.push(`seed ${seed}: convo probe error ${e && e.message}`); }

  return R;
}

async function main() {
  // One harness per process (AGENTS.md: never two harnesses in one node
  // process). --seed N runs a single seed; the default loop is only for
  // quick local runs where a fresh load per seed is acceptable.
  const onlyArg = (process.argv.find(a => a.indexOf('--seed=') === 0) || '').slice(7);
  const runSeeds = onlyArg ? [parseInt(onlyArg, 10)] : SEEDS;
  const per = [];
  for (const seed of runSeeds) {
    try {
      const r = await runSeed(seed);
      per.push(r);
      console.log(`SEED ${seed}: villagers=${r.villagers} wants sheet=${r.wantsSheet} build=${r.wantsBuild} null=${r.wantsNull} (null: targetFull=${r.nullTargetFull} throttled=${r.nullThrottled} other=${r.nullOther}) SEEK=${r.seekAttempts} seekOK=${r.seekSuccess} NEW teacher=${r.newSeekTeacher} system=${r.newSeekSystem} sheet=${r.newSheet} other=${r.newOther} RETEACH=${r.reteach} SKILLNEW=${r.skillNew} holders ${r.holdersDay1}->${r.holdersDay30} targetDist30=${r.targetDist30} convo ${r.convoTaught}/${r.convoTried} ledgered=${r.convoLedgered}`);
      for (const l of r.convoLines) console.log('  ' + l);
    } catch (e) {
      console.log(`SEED ${seed}: ERROR ${e && e.stack || e}`);
      per.push({ seed, error: String(e && e.message || e) });
    }
  }
  const sum = (k) => per.reduce((a, r) => a + (r[k] || 0), 0);
  const band = {
    seeds: SEEDS, days: DAYS,
    seekAttempts: sum('seekAttempts'), wantsSheet: sum('wantsSheet'),
    wantsBuild: sum('wantsBuild'), wantsNull: sum('wantsNull'),
    nullTargetFull: sum('nullTargetFull'), nullThrottled: sum('nullThrottled'),
    nullOther: sum('nullOther'),
    seekSuccess: sum('seekSuccess'),
    newTeacher: sum('newSeekTeacher'), newSystem: sum('newSeekSystem'),
    newSheet: sum('newSheet'), newOther: sum('newOther'),
    newTotal: sum('newSeekTeacher') + sum('newSeekSystem') + sum('newSheet') + sum('newOther'),
    reteach: sum('reteach'), skillNew: sum('skillNew'),
    convoTaught: sum('convoTaught'), convoTried: sum('convoTried'),
    convoLedgered: sum('convoLedgered'),
  };
  console.log('BAND ' + JSON.stringify(band));
}
main().catch(e => { console.error(e); process.exit(1); });
