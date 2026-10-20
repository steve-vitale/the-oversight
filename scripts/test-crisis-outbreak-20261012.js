#!/usr/bin/env node
// test-crisis-outbreak-20261012.js — PROOF for the crisis-leg r3 blanks:
//
// BEFORE (sense-tested on outbreak sims + full transcripts, 2026-10-12):
//  F1. Sick villagers worked like the healthy: a villager "doubled up with
//      gut cramps" foraged, hauled, and socialized at full capacity —
//      npcTakeAction had zero sickness handling (the dawn tick's "stay home,
//      recover-or-die" comment was aspirational).
//  F2. A medic doubled up themselves (sev2+) still tended others at full
//      capacity — patient and tender in the same body.
//  F3. raiseRelief spoke ONE fixed speech for every speaker: three different
//      villagers proposed relief word-for-word in a single outbreak.
//  F4. The "You're already boiling water. It's handled." reassurance appended
//      after EVERY sick announcement — eight sick villagers, eight identical
//      reassurances.
//  F5. The run-ledger dry-lined the 2nd+ sick villager's favor beats: "How can
//      I help?" -> "...Sorry, lost my train of thought." and "I'll do it" ->
//      "Hm. Never mind — go on." — the favor dissolved for everyone but the
//      first asker.
//
// AFTER:
//  F1. Sick villagers rest by the fire/tent (adults and kids); outbreaks cost
//      hands — the village bends.
//  F2. Severity-2+ medics stay down (patients); sev1 medics push through.
//  F3. Each relief speaker gets their own phrasing (stable per person);
//      the severely sick never "stand up by the fire" to propose.
//  F4. One reassurance per dawn tick.
//  F5. sick_help carries per-symptom whyLines + commitLines pools; ask_favor
//      engageBeat/commitBeat cycle per-speaker (convoPickCycle is run-ledger
//      aware) — every sick villager states their need in their own words.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-crisis-outbreak-20261012.js
//        SEED=7 node scripts/test-crisis-outbreak-20261012.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261012', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED); // seeded BEFORE eval

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// (fix-disease 2026-10-13: no head -80 — the old cap silently dropped safetynets.js from sims)
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
});
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.state.scholar.kcal = 50000;
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.convoSeeds = {};
  v.sick = {};
  v.health = v.health || {};
  return (v.roster || []).filter(id => id !== Game.villagerId);
}
const adult = (ids) => ids.find(id => { try { return Game.npcAge(id) >= 15; } catch (e) { return true; } });

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ---------- F1. the sick stay down ----------
  console.log('\n-- F1. sick villagers rest instead of working --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const vid = adult(ids);
    v.positions[vid] = { mx: 4, my: 4 };
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    detail[5][4] = 'plant'; detail[3][4] = 'tent';
    const t = Game.playerTile();
    t.detailRegrow = {};
    const n = Game.npcNeeds(vid);
    n.hunger = 90; n.energy = 80; // hungry: a healthy villager forages
    v.sick[vid] = { name: 'gut rot', daysLeft: 4, severity: 2 };
    const ctx = { night: false, announced: 99 };
    const e0 = n.energy;
    for (let i = 0; i < 6; i++) { try { Game.npcTakeAction(vid, detail, ctx); } catch (e) {} }
    ok('sick villager does not forage the adjacent plant', !t.detailRegrow['4,5'],
      'detailRegrow=' + JSON.stringify(t.detailRegrow));
    ok('sick villager rests (energy rises, not spent)', Game.npcNeeds(vid).energy > e0,
      `energy ${e0} -> ${Game.npcNeeds(vid).energy}`);
  }
  {
    // control: the same setup healthy DOES forage (validates the test rig)
    const ids = freshGame();
    const v = Game.state.village;
    const vid = adult(ids);
    v.positions[vid] = { mx: 4, my: 4 };
    const detail = Game.genDetail(Game.map.px, Game.map.py);
    detail[5][4] = 'plant'; detail[3][4] = 'tent';
    const t = Game.playerTile();
    t.detailRegrow = {};
    const n = Game.npcNeeds(vid);
    n.hunger = 90; n.energy = 80;
    const ctx = { night: false, announced: 99 };
    for (let i = 0; i < 6; i++) { try { Game.npcTakeAction(vid, detail, ctx); } catch (e) {} }
    ok('healthy control forages the adjacent plant', !!t.detailRegrow['4,5']);
  }

  // ---------- F2. sick medics ----------
  console.log('\n-- F2. severity-2+ medics stay down; sev1 pushes through --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const p0 = Game.getPerson(ids[0]); p0.formerOccupation = 'nurse';
    for (const id of ids.slice(1)) {
      const p = Game.getPerson(id);
      if (/nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i.test(String(p.formerOccupation || '')))
        p.formerOccupation = 'laborer';
    }
    const nm = () => 'X';
    v.sick[ids[0]] = { name: 'gut rot', daysLeft: 5, severity: 2 };
    v.sick[ids[1]] = { name: 'gut rot', daysLeft: 4, severity: 1 };
    const before = v.sick[ids[1]].daysLeft;
    Game.villagerCareTick(nm);
    ok('sev2-sick medic tends nobody', v.sick[ids[1]].daysLeft === before,
      `patient daysLeft ${before} -> ${v.sick[ids[1]].daysLeft}`);
    v.sick[ids[0]] = { name: 'gut rot', daysLeft: 5, severity: 1 };
    const before2 = v.sick[ids[1]].daysLeft;
    Game.villagerCareTick(nm);
    ok('sev1-sick medic pushes through and tends', v.sick[ids[1]].daysLeft === before2 - 1,
      `patient daysLeft ${before2} -> ${v.sick[ids[1]].daysLeft}`);
  }

  // ---------- F3. relief speakers have their own voice ----------
  console.log('\n-- F3. relief proposals vary by speaker; the severely sick never propose --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const said = [];
    Game.say = (t) => said.push(String(t));
    const forceSpeaker = (idx) => {
      v.sick = {};
      ids.forEach((id, j) => { v.health[id] = j === idx ? 100 : 40; });
    };
    const raiseAs = (idx) => {
      forceSpeaker(idx);
      said.length = 0;
      Game.state.relief = null;
      Game.raiseRelief('sickness', {});
      const oi = said.findIndex(s => s.includes('stands up by the fire'));
      const full = said[oi] || '';
      // the quoted opener text only (not the speaker name — that always differs)
      const m = full.match(/stands up by the fire\. "([^"]*?) Here's what we CAN do/);
      return {
        speaker: Game.state.relief && Game.state.relief.speaker,
        opener: full,
        openerText: m ? m[1] : full,
        detail: said[oi + 1],
      };
    };
    const got = [];
    for (let i = 0; i < 6; i++) got.push(raiseAs(i));
    const openers = new Set(got.map(g => g.openerText));
    ok('six speakers produce >= 2 distinct opener texts', openers.size >= 2,
      openers.size + ' distinct');
    ok('every detail line keeps the three honest options legible',
      got.every(g => /triage|tend|nurse/i.test(g.detail) && /ration|belt|lean/i.test(g.detail) && /hunt/i.test(g.detail)),
      got.map(g => (g.detail || '').slice(0, 70)).join(' | '));
    // stability: same speaker, same village -> same voice
    const again = raiseAs(0);
    ok('a speaker keeps their own voice (stable)', again.openerText === got[0].openerText);
    // the severely sick never propose (compare via firstRef: pre-System the
    // speaker is announced by descriptor, not true name)
    v.sick = {};
    ids.forEach((id) => { v.health[id] = 50; });
    v.sick[ids[0]] = { name: 'gut rot', daysLeft: 5, severity: 2 };
    v.health[ids[0]] = 100; // highest health — but doubled up
    said.length = 0;
    Game.state.relief = null;
    Game.raiseRelief('sickness', {});
    const spk = Game.state.relief && Game.state.relief.speaker;
    const sickRef = Game.firstRef(ids[0]);
    ok('sev2-sick villager does not propose relief', spk !== sickRef,
      `speaker=${spk}, sick would be=${sickRef}`);
  }

  // ---------- F4. one reassurance per tick ----------
  console.log('\n-- F4. the healer reassurance fires once per tick --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    const p0 = Game.getPerson(ids[0]); p0.formerOccupation = 'nurse';
    v.sick = {};
    v.water = { clean: 0, dirty: 20 };
    v.drankDirty = true;
    const said = [];
    Game.say = (t) => said.push(String(t));
    const realRandom = Math.random;
    Math.random = () => 0.05; // force the 10% dirty-water vector for everyone
    try { Game.villageSicknessTick(); } finally { Math.random = realRandom; }
    const news = said.filter(s => /Rest and clean water/.test(s));
    const reassured = said.filter(s => /It's handled\./.test(s));
    ok('outbreak-scale news: multiple sick announcements', news.length >= 2,
      news.length + ' announcements');
    ok('reassurance spoken exactly once', reassured.length === 1,
      reassured.length + ' reassurances');
  }

  // ---------- F5. outbreak favor voices ----------
  console.log('\n-- F5. every sick villager states their need in their own words --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    v.trust = v.trust || {};
    const sickIds = [ids[0], ids[1], ids[2]].filter(Boolean);
    sickIds.forEach((id, i) => {
      v.sick[id] = { name: i === 1 ? 'wound fever' : 'gut rot', daysLeft: 5, severity: 2 };
      v.trust[id] = 40;
    });
    const DRY = /lost my train of thought|Never mind — go on|Actually, forget it/;
    const results = [];
    for (const vid of sickIds) {
      Game.startConvo(vid);
      // drive like a player: answer their opening question first (that
      // unlocks the want menu), then "How can I help?", then commit.
      let engaged = false, committed = false;
      for (let t = 0; t < 8 && !committed; t++) {
        const ch = Game.convoChoices(vid) || [];
        if (!ch.length) break;
        let pick = ch.find(c => /^gq:/.test(c.id));
        if (!pick && !engaged) pick = ch.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
        if (!pick && engaged) pick = ch.find(c => c.id === 'dlg:commit');
        if (!pick) break;
        if (/^(leave|bye|goodbye)/.test(pick.id)) break;
        try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
        if (/^dlg:(help|details)/.test(pick.id)) engaged = true;
        if (/^dlg:commit/.test(pick.id)) committed = true;
        const cc = Game.convoGet(vid);
        if (!cc || !cc.active) break;
      }
      const c = Game.convoGet(vid);
      const text = (c.transcript || []).map(e => e.text).join(' ');
      results.push({ vid, text, engaged, committed });
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
    ok('all three villagers engaged the favor', results.every(r => r.engaged),
      JSON.stringify(results.map(r => r.engaged)));
    ok('all three villagers took the commitment', results.every(r => r.committed),
      JSON.stringify(results.map(r => r.committed)));
    results.forEach((r, i) => {
      ok(`sick villager ${i + 1} states the need (no dry line)`, !DRY.test(r.text),
        r.text.slice(0, 160));
    });
    // and the three "how can I help" answers are not verbatim-identical
    const helps = results.map(r => (r.text.split(/How can I help|Tell me why you need this/)[1] || '').slice(0, 120));
    const distinct = new Set(helps.map(h => h.slice(0, 60)));
    ok('the three engagements differ in wording', distinct.size >= 2,
      distinct.size + ' distinct of 3');
  }

  // ---------- F6. acute needs beat secrets ----------
  console.log('\n-- F6. a sick villager opens with the sickness, not a secret --');
  {
    const ids = freshGame();
    const v = Game.state.village;
    // find a villager who HAS a secret (else the pre-fix red is vacuous)
    let vid = null;
    for (const id of ids) {
      try {
        const ch = (Game.data.villagers || []).find(x => x.id === id);
        const proto = (ch && ch.prototype) || (Game.synthPrototype ? Game.synthPrototype(ch || {}) : null);
        if (proto && proto.secret) { vid = id; break; }
      } catch (e) {}
    }
    ok('test rig: a villager with a secret exists', !!vid);
    if (vid) {
      v.sick[vid] = { name: 'gut rot', daysLeft: 5, severity: 2 };
      v.trust[vid] = 45; // secret-eligible trust
      const realRandom = Math.random;
      Math.random = () => 0.1; // the 20% secret roll WOULD fire (0.1 < 0.2)
      let opener = '';
      try {
        Game.startConvo(vid);
        const c = Game.convoGet(vid);
        opener = (c.transcript || []).map(e => e.text).join(' ');
      } finally { Math.random = realRandom; }
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      ok('no secret opener while acutely sick', !/Can I tell you something/.test(opener),
        opener.slice(0, 110));
      ok('the sickness leads the opening', /cramp|doubled|fever|gut/i.test(opener),
        opener.slice(0, 110));
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
