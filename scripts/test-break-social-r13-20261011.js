// BREAK-IT social r13 (2026-10-11): hostile-player pass, fresh ground.
// r12 killed bespoke/heldAsk question-dodge softlocks; r11 killed moot
// re-convene/vote stalls/weregild minting; r10 killed yieldChallenge +10,
// 0-resurrections, ghost leadership; r9 killed exiled-vote/phantom-witness/
// double-exile; r6 killed rumor trust-farming; r2 killed comfort farming;
// r5 armored applyRep. Canon: docs/CANON.md (Trust != reputation; gossip/
// rumors move REP only, never trust), docs/CONVERSATIONS.md.
//
//   T1 EXPLOIT — contest "comfort" (+3 trust, contests.js) bypasses
//      trustGainProgressive: at 90+ trust an ordinary act pays 0 by design
//      ("only extraordinary acts move the needle"), but comfort paid a flat
//      +3 anyway — the only live trust gain outside the progressive gate,
//      trust.gain_mult, and tele telemetry. One click, no kcal, ~2x/week.
//   T2 HONESTY — petition moot phantom vote (villageAgency.js): when the
//      player never votes (exiled fire), _vaFinishPetition announced
//      total = present + 1 — the "Y against" count included a vote that
//      doesn't exist, and the need threshold was computed against a phantom
//      voter. The count must name only cast votes.
//   T3 SOFTLOCK — exile of the last villager: remove every NPC via the real
//      removeVillager('exiled') choke point, then run the social pipeline
//      (justiceTick, spreadGossip, villageMood, petition moot, advancePart,
//      petition walk-away). Nothing may throw, NaN, or strand state.
//   T4 DEAD-CODE — every src/js module in index.html is loaded; the social
//      surface (moot/petition/justice/rumor/trust chokepoints) is present
//      and reachable on Game.
// Run: node scripts/test-break-social-r13-20261011.js (SEED=... optional)
// BEFORE=1 evals contests.js + villageAgency.js from git HEAD (pre-fix).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const BEFORE = !!process.env.BEFORE;
const SEED = parseInt(process.env.SEED || '20261011', 10);
const PREFILE = new Set(['src/js/contests.js', 'src/js/villageAgency.js']);
const srcOf = (f) => (BEFORE && PREFILE.has(f))
  ? execSync('git show HEAD:' + f, { cwd: ROOT, encoding: 'utf8' })
  : fs.readFileSync(path.join(ROOT, f), 'utf8');
if (BEFORE) console.log('MODE: BEFORE (contests.js + villageAgency.js from git HEAD)');
function mulberry32(seed) {
  let s = seed >>> 0;
  const f = function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.reset = (ns) => { s = ns >>> 0; }; return f;
}
Math.random = mulberry32(SEED);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SKIP = new Set(['src/js/app.js', 'src/js/sprites.js', 'src/js/tile-scenes.js', 'src/js/move-anim.js', 'src/js/drama.js']);
const MODRE = /src\/js\/[^\/\\\"\']+\.js|src\/js\/engine\/[^\/\\\"\']+\.js/g;
[...html.matchAll(MODRE)].map(m => m[0]).filter(f => !SKIP.has(f))
  .forEach(f => eval(srcOf(f)));
delete global.window;
const Game = globalThis.Scattering.Game;
const fails = [];
const check = (name, cond, extra) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : '')); if (!cond) fails.push(name); };

async function fresh() {
  await Game.init(); Game.debugScenario('day1');
  Game.say = () => {}; Game.sysSay = () => {};
  const S = Game.state, v = S.village, me = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== me);
  return { S, v, me, npcs };
}

(async () => {
  // ================= T1: contest comfort trust bypass =================
  {
    const { v, npcs } = await fresh();
    const pid = npcs[0];
    // Isolate the trust path: the contest engine's verdict (fights argued,
    // ordeals endured) is not under test — force a survived 'lost' so the
    // comfort block runs against a living contestant.
    const realResolve = Game.contestResolveGroup;
    Game.contestResolveGroup = function (pids) { const o = {}; for (const p of pids) o[p] = { outcome: 'lost', log: [] }; return o; };
    const prog = (id, amt) => Game.trustGainProgressive(id, amt);
    for (const start of [95, 30]) {
      v.trust[pid] = start;
      Game._contestVerdict({ participant: pid, participants: [pid], comfort: true, contestId: 'no-such-contest', cheer: 0 });
      const after = v.trust[pid];
      const expected = Math.max(0, Math.min(100, start + prog(pid, 3)));
      check(`T1 comfort@${start}: engine delta equals progressive gate`, after === expected,
        `start=${start} after=${after} expected=${expected} progressive(${start},3)=${prog(pid, 3)}`);
    }
    Game.contestResolveGroup = realResolve;
  }

  // ================= T2: petition moot phantom vote =================
  for (const force of ['reject', 'accept']) {
    const { S, npcs, me } = await fresh();
    for (const id of npcs.slice(0, 2)) Game.removeVillager(id, 'exiled'); // make room: day1 roster is 12/12
    S.scholar.exiled = true; // the exiled aren't at the fire — no vote cast
    const lines = [];
    Game.say = (l) => lines.push(String(l)); Game.sysSay = () => {};
    const pet = {
      id: 'pet_t2_' + force, petitioners: [{ name: 'Ash' }, { name: 'Birch' }],
      cause: 'peaceful', originVillage: 'ov1', originName: 'Far Fire',
      day: S.scholar.day, interviews: [],
    };
    S.pendingPetition = pet;
    const realScore = Game._vaPetitionScore;
    Game._vaPetitionScore = () => (force === 'accept' ? 50 : -50); // isolate count honesty from vote RNG
    Game.conductPetitionMoot(pet.id);
    Game._vaPetitionScore = realScore;
    const announced = (lines.find(l => /for taking them in/.test(l)) || '');
    const m = announced.match(/(\d+) for taking them in\. (\d+) against\./);
    const realFor = pet.vote.accept, realTotal = pet.vote.present;
    const realAgainst = realTotal - realFor;
    check(`T2 phantom vote (${force}): announced counts name only cast votes`,
      !!m && +m[1] === realFor && +m[2] === realAgainst,
      `announced="${announced.trim()}" real=${realFor}for/${realAgainst}against present=${realTotal}`);
    check(`T2 phantom vote (${force}): petition resolved, no stranded state`,
      S.pendingPetition === null || S.pendingPetition.id !== pet.id);
  }

  // ================= T3: exile of the last villager =================
  {
    const { v, me, S } = await fresh();
    for (const id of [...(v.roster || [])]) if (id !== me) Game.removeVillager(id, 'exiled');
    check('T3 setup: roster holds only the player', Game.npcIds().length === 0,
      `npcIds=${Game.npcIds().length}`);
    let threw = null;
    const t3lines = [];
    Game.say = (l) => t3lines.push(String(l)); Game.sysSay = () => {};
    try {
      Game.justiceTick();
      Game.spreadGossip();
      Game.villageMood();
      S.pendingPetition = {
        id: 'pet_t3', petitioners: [{ name: 'Ash' }], cause: 'peaceful',
        originVillage: 'ov1', originName: 'Far Fire', day: S.scholar.day, interviews: [],
      };
      Game.conductPetitionMoot('pet_t3'); // 0 voters present; player still votes
      Game.answerPetition('pet_t3', 'reject');
      Game.advancePart();
      // a petition ignored 3+ days walks — never a silent limbo, even empty
      S.pendingPetition = {
        id: 'pet_t3b', petitioners: [{ name: 'Ash' }], cause: 'peaceful',
        originVillage: 'ov1', originName: 'Far Fire', day: S.scholar.day - 5, interviews: [],
      };
      Game.villageAgencyDaily();
    } catch (e) { threw = e; }
    check('T3 empty village: social pipeline never throws', !threw, threw && (threw.stack || threw.message).split('\n').slice(0, 3).join(' | '));
    check('T3 empty village: mood stays finite', Number.isFinite(Game.villageMood()),
      `mood=${Game.villageMood()}`);
    check('T3 empty village: stale petition walked, none stranded',
      !S.pendingPetition || S.pendingPetition.id !== 'pet_t3b');
    // 0 NPC voters present, player voted reject: the only cast vote is the
    // player's — "0 for taking them in. 1 against." names exactly that.
    const t3ann = (t3lines.find(l => /for taking them in/.test(l)) || '');
    const t3m = t3ann.match(/(\d+) for taking them in\. (\d+) against\./);
    check('T3 empty village: moot with no voters announced an honest count',
      !!t3m && +t3m[1] === 0 && +t3m[2] === 1, `announced="${t3ann.trim()}"`);
  }

  // ================= T4: dead-code / wiring =================
  {
    const diskFiles = fs.readdirSync(path.join(ROOT, 'src/js')).filter(f => f.endsWith('.js')).sort()
      .concat(fs.readdirSync(path.join(ROOT, 'src/js/engine')).filter(f => f.endsWith('.js')).map(f => 'engine/' + f).sort());
    const htmlFiles = [...html.matchAll(MODRE)].map(m => m[0].replace('src/js/', '')).sort();
    const missing = diskFiles.filter(f => !htmlFiles.includes(f));
    check('T4 dead-code: every src/js module is loaded by index.html', missing.length === 0,
      missing.length ? 'missing: ' + missing.join(',') : `${diskFiles.length} modules wired`);
    const surface = ['conductPetitionMoot', 'answerPetition', '_vaFinishPetition',
      'justiceTick', 'justiceDemandMoot', 'syncJusticeAfterMoot', 'mootAccuserAftermath',
      'startVillageUprising', 'spreadRumor', 'spreadGossip', 'seedGossip', 'applyRep',
      'resolveConsequence', 'trustGainProgressive', 'bumpTrust', 'trustBand', 'trustTone',
      'callMoot', 'tallyVotes', 'castPlayerVote', 'finishTrial', 'trialVoteTick',
      'severMembership', 'rejoinMembership', 'removeVillager', 'observe', 'bribeVoter',
      '_contestVerdict'];
    const dead = surface.filter(fn => typeof Game[fn] !== 'function');
    check('T4 dead-code: social surface reachable on Game', dead.length === 0,
      dead.length ? 'dead: ' + dead.join(',') : `${surface.length} functions live`);
  }

  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
