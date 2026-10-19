#!/usr/bin/env node
// scripts/link-pipeline-20261014.js — LINK PIPELINE INSTRUMENT (fourthlink arm).
//
// MEASUREMENT ONLY. No game-code changes. Wraps Game.proposeLink, tendLink,
// breakLink, answerCounter, payTribute with PURE pass-through recorders
// (no Math.random consumption — the RNG stream is untouched) and snapshots
// the link roll daily. Answers the r19 question: WHERE does the 4th link die?
//   (a) never proposed (policy cap / pantry gate / no candidates / cooldown)
//   (b) proposed but declined/countered (judgeLink bands)
//   (c) accepted/counter-formed but never seasoned (trust / age / break)
// Also records seasoning timelines for links 1..3 (formed day -> seasoned
// day) so a lever can be judged on whether a 4th could ever season in 180d.
//
// Honesty checks in scripts/test-fourthlink-20261014.js: identical-seed
// trajectories with/without the instrument must match (byte-identical
// survival days + end Standing), proving the wrappers perturb nothing.
'use strict';

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const pantryKcalOf = (Game) => {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
};

// leadcourt's proposal-branch predicates, recomputed read-only so the
// instrument can say WHY a proposal didn't happen. Mirrors the policy's
// guards without touching the policy.
function leadcourtWindow(Game) {
  try {
    const day = dayOf(Game), st = Game.state || {};
    const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    const active = links.filter(l => l && l.status === 'active');
    const subs = active.filter(l => l.primary === 'haven' && !l.conquered).length;
    const pending = !!(st.pendingCounter || st.pendingAccord || st.pendingNational);
    const cands = (st.otherVillages || []).filter(v => v && v.id !== 'haven' &&
      Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
    return {
      day, pantry: pantryKcalOf(Game), subs, cands: cands.length, pending,
      open: day >= 25 && !pending && pantryKcalOf(Game) > 12000 && cands.length > 0,
      capFires: subs >= 3,
    };
  } catch (e) { return { day: 0, pantry: 0, subs: 0, cands: 0, pending: true, open: false, capFires: false, error: String(e?.message ?? e) }; }
}

// belongseek's proposal predicates (single-link design: one Haven-subordinate
// link at a time).
function belongseekWindow(Game) {
  try {
    const day = dayOf(Game), st = Game.state || {};
    const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    const sub = links.some(l => l && l.status === 'active' && l.subordinate === 'haven' && !l.kind);
    const pending = !!(st.pendingCounter || st.pendingAccord || st.pendingNational);
    const known = (st.otherVillages || []).filter(v => v && v.id !== 'haven' &&
      Game.knowsVillage && Game.knowsVillage(v) && !(Game.linkWith && Game.linkWith(v.id)));
    return {
      day, pantry: pantryKcalOf(Game), hasSub: sub, pending, cands: known.length,
      open: day >= 20 && !pending && !sub && pantryKcalOf(Game) > 12000 && known.length > 0,
    };
  } catch (e) { return { day: 0, pantry: 0, hasSub: true, pending: true, cands: 0, open: false, error: String(e?.message ?? e) }; }
}

function attachLinkPipe(Game, m) {
  const p = m.linkpipe = {
    proposals: [],   // {day, target, asSub, tribute, ret}
    counters: [],    // {day, how, ret}
    tends: [],       // {day, linkId, dir, paid, trustAfter, age}
    breaks: [],      // {day, linkId, dir, reason, age, trust}
    tributes: [],    // {day, linkId, paid}
    roll: [],        // daily snapshots {day, links:[{id,target,dir,age,trust,status,arrears,conquered,seasoned}]}
    win: [],         // daily proposal-window rows {day, open, capFires, subs, cands, pantry}
    formed: {},      // linkId -> {day (null if unknown), observedDay, target, dir}
    errors: [],
  };
  const seenIds = new Set();
  const dirOf = (l) => (l.primary === 'haven' ? 'lead' : (l.subordinate === 'haven' ? 'belong' : 'other'));

  const wrap = (name) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function () {
      const d = dayOf(Game);
      let ret;
      try { ret = orig.apply(this, arguments); }
      catch (e) { p.errors.push({ where: name, message: String(e?.message ?? e) }); throw e; }
      try {
        if (name === 'proposeLink') {
          const opts = arguments[1] || {};
          p.proposals.push({
            day: d, target: arguments[0],
            asSub: !!opts.asSubordinate, tribute: opts.tributeKcalPerWeek || 0,
            ret: (ret && typeof ret === 'object' && ret.id) ? 'accept'
              : (ret === 'counter' ? 'counter' : (ret == null ? 'null' : String(ret))),
          });
        } else if (name === 'answerCounter') {
          p.counters.push({ day: d, how: arguments[0], ret: (ret && ret.id) ? 'link' : (ret == null ? 'null' : String(ret)) });
        } else if (name === 'tendLink') {
          const l = (Game.hierarchyState() || []).find(x => x && x.id === arguments[0]);
          p.tends.push({ day: d, week: typeof Game._week === 'function' ? Game._week() : null, linkId: arguments[0], dir: l ? dirOf(l) : '?', paid: ret | 0, trustAfter: l ? (l.trust | 0) : -1, age: l && Number.isFinite(l.day) ? d - l.day : null });
        } else if (name === 'breakLink') {
          p.breaks.push({ day: d, linkId: arguments[0], reason: String(arguments[1] || ''), trust: -1, age: -1 });
        } else if (name === 'payTribute') {
          p.tributes.push({ day: d, linkId: arguments[0], paid: ret | 0 });
        }
      } catch (e) { p.errors.push({ where: name + ':record', message: String(e?.message ?? e) }); }
      return ret;
    };
  };
  wrap('proposeLink'); wrap('answerCounter'); wrap('tendLink'); wrap('breakLink'); wrap('payTribute');

  // daily snapshot: link roll + proposal window. Called BEFORE the policy's
  // daily so the window rows describe what the policy will see.
  p.snapshot = (Game, pid) => {
    try {
      const d = dayOf(Game);
      const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      const row = { day: d, links: [] };
      for (const l of links) {
        if (!l || !l.id) continue;
        const dir = dirOf(l);
        if (!seenIds.has(l.id)) { seenIds.add(l.id); p.formed[l.id] = { day: Number.isFinite(l.day) ? l.day : null, observedDay: d, target: l.primary === 'haven' ? l.subordinate : l.primary, dir }; }
        let seasoned = false;
        try { seasoned = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered) : false; } catch (e) { p.errors.push({ where: 'seasoned', message: String(e?.message ?? e) }); }
        row.links.push({
          id: l.id, dir, age: Number.isFinite(l.day) ? d - l.day : null, trust: l.trust | 0,
          status: l.status, arrears: l.arrears | 0, conquered: !!l.conquered, seasoned,
        });
      }
      p.roll.push(row);
      const w = pid === 'belongseek' ? belongseekWindow(Game) : leadcourtWindow(Game);
      if (w.error) p.errors.push({ where: 'window', message: w.error });
      p.win.push({ day: d, pid, open: w.open, capFires: !!w.capFires, subs: w.subs | 0, hasSub: !!w.hasSub, cands: w.cands | 0, pantry: Math.round(w.pantry) });
    } catch (e) { p.errors.push({ where: 'snapshot', message: String(e?.message ?? e) }); }
  };
  return p;
}

// finalizeLinkPipe: per-run pipeline report. The diagnosis lives here.
function finalizeLinkPipe(Game, m) {
  const p = m.linkpipe;
  const n = (xs, f) => xs.filter(f).length;
  const prop = {
    total: p.proposals.length,
    accept: n(p.proposals, x => x.ret === 'accept'),
    counter: n(p.proposals, x => x.ret === 'counter'),
    null: n(p.proposals, x => x.ret === 'null'),
    byDir: {},
  };
  for (const x of p.proposals) {
    const k = x.asSub ? 'belong' : 'lead';
    prop.byDir[k] = prop.byDir[k] || { total: 0, accept: 0, counter: 0, null: 0 };
    prop.byDir[k].total++;
    if (prop.byDir[k][x.ret] != null) prop.byDir[k][x.ret]++;
  }
  const wins = p.win;
  const openDays = n(wins, w => w.open);
  const capBlockedDays = n(wins, w => w.open && w.capFires);
  // per-link lifecycle from the roll snapshots
  const life = {};
  for (const row of p.roll) {
    for (const l of row.links) {
      const lf = life[l.id] = life[l.id] || Object.assign({ id: l.id, seasonedDay: null, brokeDay: null, trustAt30: null, maxTrust: 0, tendWeeks: 0, lastSeen: 0 }, p.formed[l.id] || {});
      lf.lastSeen = row.day;
      if (l.trust > lf.maxTrust) lf.maxTrust = l.trust;
      if (lf.trustAt30 == null && l.age >= 30) lf.trustAt30 = l.trust;
      if (lf.seasonedDay == null && l.seasoned) lf.seasonedDay = row.day;
      if (l.status !== 'active' && lf.brokeDay == null) lf.brokeDay = row.day;
    }
  }
  // Attempts, successful payments and distinct paid weeks are different units.
  const tendByLink = {};
  for (const t of p.tends) {
    const counts = tendByLink[t.linkId] ||= { attempts: 0, paid: 0, weeks: new Set(), unknownWeeks: 0 };
    counts.attempts++;
    if (t.paid > 0) {
      counts.paid++;
      if (Number.isFinite(t.week)) counts.weeks.add(t.week); else counts.unknownWeeks++;
    }
  }
  const links = Object.values(life).map(lf => Object.assign({}, lf, {
    age: lf.day == null ? null : lf.lastSeen - lf.day,
    tendAttempts: tendByLink[lf.id]?.attempts || 0,
    successfulTends: tendByLink[lf.id]?.paid || 0,
    unknownTendWeeks: tendByLink[lf.id]?.unknownWeeks || 0,
    tendWeeks: tendByLink[lf.id]?.unknownWeeks ? null : (tendByLink[lf.id]?.weeks.size || 0),
    brokeWhy: lf.brokeDay != null ? ((p.breaks.find(b => b.linkId === lf.id) || {}).reason || 'unrecorded') : null,
  }));
  const seasoned = links.filter(l => l.seasonedDay != null);
  const leads = links.filter(l => l.dir === 'lead');
  const formationOrderKnown = leads.every(l => l.day != null);
  const fourth = formationOrderKnown ? (leads.sort((a, b) => a.day - b.day)[3] || null) : null;
  return {
    proposals: prop,
    counters: { total: p.counters.length, accept: n(p.counters, c => c.how === 'accept'), sweeten: n(p.counters, c => c.how === 'sweeten'), walk: n(p.counters, c => c.how === 'walk') },
    tends: p.tends.length, tributePays: p.tributes.length,
    windowOpenDays: openDays, capBlockedDays,
    winDays: wins.length,
    linksFormed: links.length, // historical alias: observed lifecycles, not new formation events
    linksObserved: links.length,
    unknownFormationDates: links.filter(l => l.day == null).length,
    formationOrderKnown,
    errors: (p.errors || []).slice(),
    linksSeasoned: seasoned.length,
    links,                       // full lifecycle detail for the evidence
    fourthLeadLink: fourth ? { formedDay: fourth.day, target: fourth.target, seasonedDay: fourth.seasonedDay, brokeWhy: fourth.brokeWhy, trustAt30: fourth.trustAt30, tendWeeks: fourth.tendWeeks } : null,
  };
}

module.exports = { attachLinkPipe, finalizeLinkPipe, leadcourtWindow, belongseekWindow };
