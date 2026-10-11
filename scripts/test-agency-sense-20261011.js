#!/usr/bin/env node
// test-agency-sense-20261011.js — SENSE-TESTING for lever 3 (villager agency).
// Steve 2026-10-11: testing must prove things are SENSICAL, not just
// functional. This script captures what the player would actually READ:
//   1. ambient villager say-lines over 12 days (expedition departures,
//      returns, deed talk, objective departures, indoor life, teaching)
//   2. two FULL conversation transcripts: one agency "what did you see out
//      there?" teach conversation, one ordinary social conversation
//   3. a one-day objective census: what every villager is doing, in words
// Unlike the sweeps, Game.say is RESTORED (captured, not silenced) so the
// text under test is exactly the player-facing text.
// Run: node scripts/test-agency-sense-20261011.js [seed]
// Human reads the output and judges meaning/coherence/relevance.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const seed = parseInt(process.argv[2] || '7', 10);

(async () => {
  const { Game } = await loadGame({ seed, mode: 'sense', fullTelemetry: false });
  // restore say as a CAPTURING function (loadGame stubs it to a no-op)
  const sayLines = [];
  Game.say = function (msg) { sayLines.push(String(msg)); };
  Game.sysSay = function (msg) { sayLines.push('[SYS] ' + String(msg)); };
  await setupGame(Game);

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    // ask villagers with fresh explorer news about the wild (real teach path)
    try {
      const v = G.state.village || {};
      for (const vid of Object.keys(v.explorerNews || {})) {
        if (vid === G.villagerId) continue;
        try {
          if (!((v.roster || []).includes(vid))) continue;
          const st = G.startConvo(vid);
          if (!st) continue;
          const choices = G.convoChoices(vid) || [];
          const ac = choices.find(c => c.id && String(c.id).indexOf('agency:') === 0);
          if (ac) { try { G.convoTurn(vid, ac.id); } catch (e) {} }
          try { G.endConvo(vid, 'left'); } catch (e) {}
        } catch (e) {}
      }
    } catch (e) {}
  };

  await runDays(Game, policy, { days: 12 });

  console.log('########## 1. AMBIENT SAY-LINES (12 days, what the player read) ##########');
  const villagerLines = sayLines.filter(l =>
    /🎒|🧭|📣|◈|🕯️|👥|🪤|💧|🍲|😴|📖|🚶|💬/.test(l));
  console.log(`(total say lines: ${sayLines.length}; villager-agency/objective lines: ${villagerLines.length})`);
  const seen = new Set();
  for (const l of villagerLines) {
    // dedupe identical repeats for readability, count them
    const key = l.slice(0, 80);
    seen.add(key);
  }
  const counts = {};
  for (const l of villagerLines) counts[l.slice(0, 80)] = (counts[l.slice(0, 80)] || 0) + 1;
  const uniq = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  for (const k of uniq.slice(0, 40)) {
    const full = villagerLines.find(l => l.slice(0, 80) === k);
    console.log(`  [x${counts[k]}] ${full}`);
  }
  if (uniq.length > 40) console.log(`  ... +${uniq.length - 40} more unique lines`);

  console.log('\n########## 2. AGENCY TEACH CONVERSATION (full transcript) ##########');
  // find a villager with field lessons to teach
  let teacher = null;
  try {
    const v = Game.state.village || {};
    for (const vid of (v.roster || [])) {
      if (vid === Game.villagerId) continue;
      try {
        const lessons = Game.npcFieldLessons ? Game.npcFieldLessons(vid) : [];
        if (lessons && lessons.length) { teacher = vid; break; }
      } catch (e) {}
    }
  } catch (e) {}
  if (!teacher) {
    // force the situation: pick an explorer and give them an earned lesson
    console.log('(no natural teacher found in 12 days — forcing one for the read)');
    try {
      const v = Game.state.village || {};
      for (const vid of (v.roster || [])) {
        if (vid === Game.villagerId) continue;
        try {
          if (Game.npcRangeProfile && /explorer|wanderer/.test(Game.npcRangeProfile(vid))) {
            teacher = vid;
            const st = Game.agencyState();
            st.teachable[vid] = st.teachable[vid] || [];
            st.teachable[vid].push({ topic: 'plants', day: (Game.state.scholar || {}).day || 1 });
            const a = Game.agencyOf(vid);
            if (a.know[vid].fought.indexOf('hushwolf') === -1) a.know[vid].fought.push('hushwolf');
            v.explorerNews = v.explorerNews || {};
            v.explorerNews[vid] = { day: (Game.state.scholar || {}).day || 1, agency: true, dist: 4 };
            break;
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  function printConvo(vid, takeChoices) {
    let nm = '???';
    try { nm = Game.displayName(vid); } catch (e) {}
    console.log(`--- talking to ${nm} ---`);
    let prof = '?', goal = '?', temp = '?';
    try { prof = Game.npcRangeProfile(vid); } catch (e) {}
    try { goal = Game.npcGoal(vid); } catch (e) {}
    try { temp = Game.npcTemper(vid); } catch (e) {}
    console.log(`(profile: ${prof} | goal: ${goal} | temper: ${temp})`);
    const st = Game.startConvo(vid);
    if (!st) { console.log('(could not open conversation)'); return; }
    console.log('THEM (opening):', st.line);
    let choices = st.choices || Game.convoChoices(vid) || [];
    const showChoices = () => {
      for (const c of choices.slice(0, 8)) console.log(`   [${c.id}] ${c.label}`);
    };
    console.log('CHOICES:'); showChoices();
    for (const pickId of takeChoices) {
      let target = null;
      if (pickId === 'agency?') target = choices.find(c => c.id && String(c.id).indexOf('agency:') === 0);
      else target = choices.find(c => c.id === pickId) || choices[0];
      if (!target) { console.log('(no choices left)'); break; }
      console.log(`\nYOU pick: [${target.id}] ${target.label}`);
      let r = null;
      try { r = Game.convoTurn(vid, target.id); } catch (e) { console.log('(convoTurn threw: ' + e.message + ')'); break; }
      if (!r) { console.log('(no response)'); break; }
      console.log('THEM:', r.line);
      if (r.ended) { console.log('(conversation ended)'); break; }
      choices = r.choices || [];
    }
    // full transcript dump
    let tr = [];
    try {
      const c = (Game.state.village.conv || {})[vid];
      tr = (c && c.transcript) || [];
    } catch (e) {}
    console.log(`\n--- full transcript (${tr.length} beats) ---`);
    for (const e of tr) console.log(`  ${e.who === 'you' ? 'YOU ' : 'THEM'}: ${String(e.text).slice(0, 220)}`);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }
  if (teacher) {
    printConvo(teacher, ['agency?', 'goal', 'past']);
  } else {
    console.log('(no teacher available at all — SKIPPED)');
  }

  console.log('\n########## 3. ORDINARY SOCIAL CONVERSATION (full transcript) ##########');
  let social = null;
  try {
    const v = Game.state.village || {};
    for (const vid of (v.roster || [])) {
      if (vid === Game.villagerId || vid === teacher) continue;
      social = vid; break;
    }
  } catch (e) {}
  if (social) printConvo(social, ['goal', 'past', 'village']);
  else console.log('(no social partner — SKIPPED)');

  console.log('\n########## 4. ONE-DAY OBJECTIVE CENSUS (who is doing what) ##########');
  try {
    const v = Game.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    for (const vid of (v.roster || [])) {
      if (vid === Game.villagerId) continue;
      let nm = '?', o = null, prof = '?', node = null, away = null;
      try { nm = Game.displayName(vid).split(' ')[0]; } catch (e) {}
      try { o = Game.objOf(vid); } catch (e) {}
      try { prof = Game.npcRangeProfile(vid); } catch (e) {}
      try { node = Game.npcNode(vid); } catch (e) {}
      try { away = (v.away || {})[vid]; } catch (e) {}
      const where = away ? `AWAY@${away.nx},${away.ny} (${away.purpose})` : (node ? `home(${node.nx},${node.ny})` : '?');
      console.log(`  ${nm} [${prof}] obj=${o ? o.kind + '/' + o.state : '?'}${o && o.chore ? '(' + o.chore + ')' : ''} ${where}`);
    }
  } catch (e) { console.log('(census failed: ' + e.message + ')'); }

  console.log('\n########## 5. TEACHABLE/LESSON STATE ##########');
  try {
    const a = Game.agencyState();
    for (const vid of Object.keys(a.teachable || {})) {
      const t = a.teachable[vid] || [];
      if (!t.length) continue;
      let nm = '?';
      try { nm = Game.displayName(vid).split(' ')[0]; } catch (e) {}
      console.log(`  ${nm}: ${t.length} unspent teachable entries`);
    }
    const taught = Object.entries((Game.state.codex || {}).plants || {}).filter(([id, p]) => p && p.source === 'taught');
    console.log(`  codex plants learned via teaching: ${taught.length}`);
  } catch (e) { console.log('(lesson state failed: ' + e.message + ')'); }
})();
