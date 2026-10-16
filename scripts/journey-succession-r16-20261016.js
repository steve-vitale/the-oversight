#!/usr/bin/env node
// journey-succession-r16-20261016.js — SUCCESSION LEG (7) r16: "the revolving door"
//
// Pre-registered (evidence/2026-10-16/journey-succession-r16.md): the mantle
// passes on every death (proven through r15). What happens when the Codex
// passes THREE times in five days? Does the handoff fiction hold when the
// new bearer <redacted> bearer <redacted> 2 days? Does the village grieve three fresh
// deaths, or only the last? Do burials stack sanely? Does trust inheritance
// behave across fast chains?
//
// Substrate: r15 (16d competent + scripted hushwolf deaths), deaths at
// d18/d20/d22 + 18d tail → ~d40 horizon. 9 successions total.
// Usage: SEEDS=841,842,843 TAILDAYS=18 node scripts/journey-succession-r16-20261016.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '16', 10);
const DEATH_DAYS = (process.env.DEATHDAYS || '18,20,22').split(',').map(x => parseInt(x, 10));
const TAILDAYS = parseInt(process.env.TAILDAYS || '18', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '841,842,843';
  return s.split(',').map(x => parseInt(x, 10)).filter(Number.isFinite);
}
function charOf(Game, vid) {
  try { return (Game.data.villagers || []).find(x => x.id === vid) || {}; } catch (e) { return {}; }
}
function nameOf(Game, vid) {
  const c = charOf(Game, vid);
  return c.name || String(vid).slice(0, 12);
}
function firstOf(name) { return String(name).split(' ')[0]; }

function captureConvo(Game, seed, talked, label, endDay) {
  const out = [`## seed ${seed} ${label}: bearer [${nameOf(Game, Game.villagerId)}] talks to ${nameOf(Game, talked)} (trust ${(Game.state.village.trust || {})[talked] || 0}), day ${endDay}`];
  const seen = new Set();
  try {
    Game.startConvo(talked);
    for (let t = 0; t < 16; t++) {
      const choices = Game.convoChoices(talked) || [];
      if (!choices.length) { out.push('(no choices)'); break; }
      const live = choices.filter(c => !/^(betrayal:|leave|bye|goodbye)/.test(c.id));
      let pick = live.find(c => !seen.has(c.id)) || live.find(c => !/^(leave|bye|goodbye)/.test(c.id));
      if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
      seen.add(pick.id);
      out.push(`> YOU [${pick.id}] ${(pick.text || pick.label || '').slice(0, 90)}`);
      try { Game.convoTurn(talked, pick.id); } catch (e) { out.push('(turn threw: ' + e.message + ')'); break; }
      const c = Game.convoGet(talked);
      if (!c || !c.active) { out.push('(ended by engine)'); break; }
    }
    try { Game.endConvo(talked, 'left'); } catch (e) {}
    const c = Game.convoGet(talked);
    out.push('### FULL TRANSCRIPT');
    for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
  } catch (e) { out.push('(convo threw: ' + e.message + ')'); }
  return out.join('\n');
}

// Handoff-beat completeness checklist on a slice of say-lines.
function auditHandoff(lines, oldFirst, newFirst) {
  const j = lines.join('\n');
  return {
    deathLine: /is dead —/.test(j),
    youreNotHer: new RegExp("You're not " + oldFirst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(j),
    codexSync: /picks up the journal|Codex doesn't pause for grief|picks up the Codex/i.test(j),
    systemLine: /MANTLE TRANSFER DETECTED/.test(j),
    turnsPage: /turns a page/i.test(j),
    orientation: /wake up somebody else/i.test(j),
    vouch: /speaks? for .+ — ".+trusted them/.test(j) || /speaks? for/.test(j),
    ownRecord: /The fire knew /.test(j),
  };
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r16', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, deaths: [], griefSeries: [], convos: [], tele: {} };

  await runDays(Game, competent, { days: DAYS1 });
  if (Game.over) { rec.error = 'village died before death script'; return rec; }

  // --- the revolving door: 3 scripted deaths ---
  const marks = [];
  for (const dd of DEATH_DAYS) {
    // advance to the target day (competent play between deaths)
    while (!Game.over && ((Game.state.scholar || {}).day || 0) < dd) {
      await runDays(Game, competent, { days: 1 });
    }
    if (Game.over) { rec.deaths.push({ day: dd, oldBearer: '(none)', outcome: 'village died mid-chain' }); break; }
    const oldId = Game.villagerId, oldName = nameOf(Game, oldId);
    const trustBefore = Object.assign({}, Game.state.village.trust || {});
    marks.push(says.length);
    Game.playerDeath('a hushwolf');
    if (Game.over) {
      rec.deaths.push({ day: dd, oldBearer: oldName, outcome: 'village-lost' });
      break;
    }
    const newId = Game.villagerId, newName = nameOf(Game, newId);
    const trustAfter = (Game.state.village.trust || {})[newId];
    // one day of aftermath so the bring-home beat's due-date passes
    // (recoverBearer fires when day > p.day, i.e. the 2nd endDay after death)
    await runDays(Game, competent, { days: 1 });
    // direct mourning-topic probe while this death is fresh
    const probe = { fresh: 0, ev: null };
    try {
      const day = (Game.state.scholar || {}).day || 0;
      const corpses = (typeof Game.corpses === 'function' ? Game.corpses() : Game.state.corpses) || [];
      const fresh = corpses.filter(c => c && c.kind === 'villager' && (day - (c.dayDied || 0)) <= 3);
      probe.fresh = fresh.length;
      const living = (Game.state.village.roster || []).filter(id => id !== newId);
      if (living.length && typeof Game.t2LatelyEvent === 'function') {
        const ev = Game.t2LatelyEvent(living[0]);
        probe.ev = ev ? { kind: ev.kind, name: ev.name || null, names: ev.names || null, bearer: !!ev.bearer } : null;
      }
    } catch (e) { probe.error = String(e && e.message || e); }
    rec.deaths.push({
      day: dd, oldBearer: oldName, newBearer: newName,
      officeTrustBefore: trustBefore[oldId], ownTrustBefore: trustBefore[newId],
      inheritAfter: trustAfter,
      bearerDays: dd - (dd === DEATH_DAYS[0] ? 0 : DEATH_DAYS[DEATH_DAYS.indexOf(dd) - 1]),
      probe,
    });
    rec.griefSeries.push({ day: dd, grief: (Game.state.village.grief || 0),
      corpses: ((Game.state.corpses || []).length),
      pendingBurials: ((Game.state.village.pendingBurials || []).length) });
  }
  if (Game.over) return rec;

  // --- tail ---
  await runDays(Game, competent, { days: TAILDAYS });

  // --- widen handoff slices: each death gets [its mark, next mark);
  // the last death gets [mark, end of run] so its bring-home beat is covered
  marks.push(says.length);
  for (let i = 0; i < rec.deaths.length; i++) {
    const d = rec.deaths[i];
    if (d.outcome) continue;
    const slice = says.slice(marks[i], marks[i + 1]);
    d.audit = Object.assign(auditHandoff(slice, firstOf(d.oldBearer), firstOf(d.newBearer)),
      { bringHome: slice.some(t => /they bring .+ home/i.test(t)) });
    d.handoffLines = slice.map(t => t.slice(0, 200));
  }

  // --- census ---
  const v = Game.state.village || {};
  const roster = (v.roster || []).map(id => nameOf(Game, id));
  const fallen = (v.fallen || []).map(f => `${nameOf(Game, f.villagerId)} (d${f.day}, ${f.cause})`);
  let pantryKcal = 0;
  try { pantryKcal = Game.pantryKcal ? Game.pantryKcal() : 0; } catch (e) {}
  let breadth = -1;
  try { breadth = Game.codexBreadth(); } catch (e) {}
  const curBid = Game.villagerId, curName = nameOf(Game, curBid);
  rec.census = {
    day: (Game.state.scholar || {}).day, alive: roster.length, roster: roster.join(', '),
    fallen: fallen.join(' | ') || '(none)',
    scholar: curName, scholarTrust: (v.trust || {})[curBid],
    pantryKcal, codexBreadth: breadth,
    integrationStage: (() => { try { return Game.integrationStage(); } catch (e) { return -1; } })(),
    mantleOf: ((v.mantleOf || []).map(m => `${m.fromName}→${m.toName} (d${m.day})`)),
    epithet: (() => { try { return Game.leadershipEpithet(); } catch (e) { return null; } })(),
  };
  if (rec.deaths.length && curBid !== null) {
    const lastNew = rec.deaths[rec.deaths.length - 1].newBearer;
    if (curName !== lastNew) rec.census.secondDeath = `scholar changed again in tail: ${curName}`;
  }

  // --- PEOPLE CHECK: 3 conversations as the final bearer ---
  const trustMap = v.trust || {};
  const living = (v.roster || []).filter(id => id !== curBid)
    .sort((a, b) => (trustMap[b] || 0) - (trustMap[a] || 0)).slice(0, 3);
  const deadFirsts = rec.deaths.map(d => firstOf(d.oldBearer));
  for (const [i, vid] of living.entries()) {
    const txt = captureConvo(Game, seed, vid, 'post-chain-' + (i + 1), (Game.state.scholar || {}).day);
    const npcLines = txt.split('\n').filter(l => l.startsWith('NPC:'));
    const mourningLines = npcLines.filter(l => /died|is gone|grief|grave|buried|ashes/i.test(l));
    const multiName = mourningLines.filter(l => deadFirsts.filter(n => l.includes(n)).length >= 2);
    const deadMentions = npcLines.filter(l => deadFirsts.some(n => l.includes(n))).length;
    rec.convos.push({ text: txt, npcLineCount: npcLines.length,
      mourningLineCount: mourningLines.length, multiNameCount: multiName.length,
      deadBearerMentions: deadMentions });
  }

  // --- telemetry (flat dotted-key schema) ---
  // (b): only the 6 core beats score; youreNotHer/vouch/ownRecord are conditional (captured, not scored)
  const CORE = ['deathLine', 'codexSync', 'systemLine', 'turnsPage', 'orientation', 'bringHome'];
  const complete = rec.deaths.filter(d => d.audit).map(d => CORE.every(k => d.audit[k]));
  rec.tele = {
    'deaths.bearer': rec.deaths.filter(d => !d.outcome).length,
    'deaths.chain3': rec.deaths.filter(d => !d.outcome).length === 3 ? 1 : 0,
    'handoff.completeness': complete.filter(Boolean).length + '/' + complete.length,
    'mourning.multiName': rec.convos.reduce((n, c) => n + c.multiNameCount, 0),
    'week2.deadBearerMentions': rec.convos.reduce((n, c) => n + c.deadBearerMentions, 0),
    'trust.inheritChain': rec.deaths.filter(d => !d.outcome).map(d => `${firstOf(d.oldBearer)}:${d.officeTrustBefore}→${firstOf(d.newBearer)}:${d.inheritAfter}`).join(' | '),
    'census.alive': rec.census.alive,
    'census.fallen': (v.fallen || []).length,
    'census.integrationStage': rec.census.integrationStage,
    'end.day': rec.census.day,
  };
  return rec;
}

(async () => {
  const out = [];
  for (const seed of parseSeeds()) {
    try {
      const rec = await playSeed(seed);
      out.push(rec);
      console.log(JSON.stringify({ seed, tele: rec.tele, census: rec.census, deaths: rec.deaths.map(d => ({ day: d.day, oldBearer: d.oldBearer, newBearer: d.newBearer, audit: d.audit, probe: d.probe, inheritAfter: d.inheritAfter, outcome: d.outcome })), griefSeries: rec.griefSeries, error: rec.error }));
    } catch (e) {
      console.log(JSON.stringify({ seed, error: String(e && e.message || e) }));
      console.error('SEED ' + seed + ' THREW: ' + (e && e.stack || e));
    }
  }
  require('fs').writeFileSync(path.join(ROOT, 'evidence', '2026-10-16', 'journey-succession-r16-seeds.jsonl'),
    out.map(r => JSON.stringify(r)).join('\n'));
})();
