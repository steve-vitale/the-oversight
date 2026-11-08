// tendtrust-b — the Binding-leg tend/trust DIAG recorder
// (sim-tendtrust-b, 2026-11-08, flesh-out loop B, axis scale-onramp).
//
// THE QUESTION (tracker blank 5 from the 1030Z tracker): size the
// tend/trust lever for the Binding leg, so the next run can build it.
// Binddiag (evidence/2026-11-08/sim-binddiag-b.md) decomposed the national
// pipeline on band 76401-76408: LEAD qualifies 5/8, national held to end
// 2/8. The binding stages are LEAD qualification (trust, not age) and
// national persistence (trust dips un-season links). Seasoning fails in
// two faces: too poor to tend, or tends not lifting enough.
//
// THE GATE, EXACTLY (hierarchy.js, all code citations in the prereg):
//   links form at trust 30; seasoned = 30+ days AND trust 40+
//   (_linkSeasoned). A fresh link needs +10 net trust to season.
//   tendLink: 1,500 kcal -> +8 trust via _trustGain, once per week per
//   link (tendedWeek), refuses during mourning, partial pantry ->
//   proportional gain. _trustGain: the single choke — no gains land while
//   the link's village grieves (mourningUntil, 7d after a speaker death).
//   Weekly tribute tick: full payment +1, partial -1, nothing -2.
//   NO passive weekly trust decay — trust moves only through events
//   (tribute, tends, leader-death shake -8, First Court feast +10 /
//   cold -12, demands).
//   The substrate's rescue-tend gate (leanlinkrescue.js:87): tends ONLY
//   to active Haven-primary links with trust < 40, once per week, and
//   ONLY when Haven's pantry reads > 20,000 kcal.
//
// This layer is a PURE-READ instrument (TENDTRUST=1; unset delegates to
// the wrapped policy byte-identically): every daily, BEFORE delegating
// inward it snapshots pure-read tend/trust state, and AFTER it snapshots
// again and records the diff. It writes NOTHING to game state and draws
// NO RNG. It NEVER calls villageStandingTotal() during a run and NEVER
// calls polityOf() — LEAD qualification is reproduced from the
// seasoned-sub count, as in binddiag-b.js (whose snapBindingEnd the sweep
// reuses for the post-run end snapshot + engine-gated validation).
//
// PRE/POST DAILY SAMPLING (the binddiag same-day-inference lesson):
// end-of-day sampling cannot observe a tend that fires and is then masked
// inside one day. A POLICY tend is identified by the durable tendedWeek
// flip between the pre and post snapshots of the SAME daily call, and its
// lift is the pre->post trust delta on that link. An ENGINE tend (the
// villagers' own win-plan drive, winPlanBondsTick — trust < 50,
// pantryDays >= 3, never while nationalLive) fires between the previous
// post snapshot and the next pre snapshot, so it is promoted from the
// 'tended' history entries added overnight, with its lift parsed from the
// note ("trust +N") — the overnight delta can mix the tend with
// same-night moves. Engine-side trust events (weekly tribute tick,
// leader-death shake) land during sleep(), AFTER the post snapshot, so
// they appear as the OVERNIGHT delta between one day's post snapshot and
// the next day's pre snapshot, attributed via the link's day-stamped
// history entries. A nationalLive flip with no open beat is recorded as
// an INFERRED same-day stage+answer beat with the shape the engine
// stamped (binddiag's fix, same logic).
//
// The recorder also reads the substrate's own tend-attempt counters
// (ctx.tended / ctx.tendTrusts, written by leanlinkrescue during the inner
// daily): an attempt with no tendedWeek flip is a REFUSED tend (mourning
// is the only refusal path left once the pantry gate has passed), and the
// deficit is reported, never hidden.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

// TENDTRUST=1 is the only on-switch. Unset delegates to the wrapped
// policy byte-identically (the proof's guard pins that).
function layerOn() { return process.env.TENDTRUST === '1'; }

function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function weekOf(Game) { try { return (typeof Game._week === 'function') ? (Game._week() | 0) : Math.floor(dayOf(Game) / 7); } catch (e) { return 0; } }

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

function subPantryKcal(Game, vid) {
  try {
    const ovs = (Game.state || {}).otherVillages || [];
    for (const v of ovs) if (v && v.id === vid) return Math.max(0, Math.round(v.pantryKcal || 0));
  } catch (e) {}
  return null;
}

// tendsNeeded(shortfall, meanLift): how many tends close a trust gap of
// `shortfall` points at `meanLift` points per tend. Pure arithmetic — the
// sizing computation, never a simulation.
function tendsNeeded(shortfall, meanLift) {
  const s = shortfall | 0, l = meanLift | 0;
  if (s <= 0) return 0;
  if (l <= 0) return null; // lift zero or unknown: no finite tend count closes it
  return Math.ceil(s / l);
}

// bufferTends(dipPoints, meanLift): how many tends of headroom a trust dip
// of `dipPoints` points costs — same arithmetic, named for the persistence leg.
function bufferTends(dipPoints, meanLift) { return tendsNeeded(dipPoints, meanLift); }

// noteGainFromEntries(entries): parse the trust number out of the first
// 'tended' history entry's note ("... trust +8); ..."). Returns the parsed
// gain or null. The note is the clean lift measure for an engine tend:
// the overnight trust delta can mix the tend with same-night moves
// (a tribute tick, a succession shake), but the note names the tend's own
// gain.
function noteGainFromEntries(entries) {
  try {
    for (const h of (entries || [])) {
      if (!h || h.kind !== 'tended') continue;
      const m = /trust \+(\d+)/.exec(h.note || '');
      if (m) return parseInt(m[1], 10);
    }
  } catch (e) {}
  return null;
}

// snapTT(Game): the tend/trust state in one pure-read object. Plain-data
// copies throughout — snapshots must never alias live link objects, or
// pre/post diffs collapse.
function snapTT(Game) {
  const s = { day: dayOf(Game), week: weekOf(Game), errs: [] };
  try { s.pantry = pantryKcal(Game); } catch (e) { s.pantry = 0; }
  // pantryDays: the engine's own estimate (win-plan.js pantryDays ->
  // Game.pantryDaysEstimate) — the exact number the villagers' tend gate
  // reads (pantryDays >= 3). Pure read; null when unavailable.
  try {
    const d = (typeof Game.pantryDaysEstimate === 'function') ? Game.pantryDaysEstimate() : null;
    s.pantryDays = (typeof d === 'number' && isFinite(d)) ? d : null;
  } catch (e) { s.pantryDays = null; }
  try { s.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { s.rank = 'village'; }
  const st = (Game.state || {});
  try {
    s.nationalLive = !!st.nationalLive;
    s.nationalShape = st.nationalShape || null;
    s.globalLive = !!st.globalLive;
    s.scaleRefused = !!st.scaleRefused;
  } catch (e) {}
  try {
    const pn = st.pendingNational;
    s.pendingNational = pn ? { shape: String(pn.shape || ''), day: pn.day | 0 } : null;
  } catch (e) { s.pendingNational = null; }
  const links = [];
  try { const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; for (const l of (ls || [])) if (l) links.push(l); } catch (e) {}
  const day = s.day;
  const seasoned = (l, forConquest) => {
    try { return (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!forConquest, true) : false; } catch (e) { return false; }
  };
  s.links = [];
  let seasonedSubs = 0, subs = 0;
  for (const l of links) {
    if (!l || l.status !== 'active') continue;
    const isSub = l.primary === 'haven' && l.subordinate !== 'haven';
    const sea = isSub ? seasoned(l, !!l.conquered) : false;
    if (isSub) { subs++; if (sea) seasonedSubs++; }
    const other = isSub ? String(l.subordinate || l.id || '?') : String(l.id || '?');
    let hist = [];
    try { hist = ((l.history || []).map(h => ({ day: h.day | 0, kind: String(h.kind || ''), note: String(h.note || '') }))); } catch (e) {}
    s.links.push({
      id: String(l.id || '?'), other, primary: String(l.primary || ''),
      kind: String(l.kind || ''), isSub: !!isSub, conquered: !!l.conquered,
      trust: l.trust | 0, age: day - (l.day | 0), formedDay: l.day | 0,
      seasoned: sea, trustGap: sea ? 0 : Math.max(0, 40 - (l.trust | 0)),
      daysToSeason: sea ? 0 : Math.max(0, 30 - (day - (l.day | 0))),
      tendedWeek: (l.tendedWeek == null ? null : (l.tendedWeek | 0)),
      mourningUntil: (l.mourningUntil == null ? null : (l.mourningUntil | 0)),
      lastKeptDay: (l.lastKeptDay == null ? null : (l.lastKeptDay | 0)),
      arrears: l.arrears | 0, tributePerWeek: l.tributeKcalPerWeek | 0,
      subPantry: isSub ? subPantryKcal(Game, other) : null,
      history: hist,
    });
  }
  s.subs = subs;
  s.seasonedSubs = seasonedSubs;
  s.shortfallSubs = Math.max(0, 3 - seasonedSubs);
  s.leadQ = seasonedSubs >= 3;
  return s;
}

// Compact daily trajectory point (one per day; full snapshot at end via
// the sweep's snapBindingEnd).
function trajPoint(post) {
  return {
    day: post.day, pantry: post.pantry, pantryDays: post.pantryDays, rank: post.rank,
    subs: post.subs, sSubs: post.seasonedSubs, shortfallSubs: post.shortfallSubs,
    leadQ: post.leadQ ? 1 : 0, nat: post.nationalLive ? 1 : 0, glob: post.globalLive ? 1 : 0,
    links: post.links.filter(l => l.isSub).map(l => ({
      id: l.id, other: l.other, trust: l.trust, age: l.age,
      seasoned: l.seasoned ? 1 : 0, gap: l.trustGap, ageGap: l.daysToSeason,
      tendedWeek: l.tendedWeek, mourningUntil: l.mourningUntil,
      lastKeptDay: l.lastKeptDay, arrears: l.arrears, subPantry: l.subPantry,
    })),
    gateBlocked: post.links.filter(l => l.isSub && !l.seasoned && (l.trust | 0) < 40
      && l.tendedWeek !== post.week && post.pantry <= 20000)
      .map(l => ({ id: l.id, other: l.other, trust: l.trust, gap: l.trustGap })),
  };
}

function ensureTT(ctx) {
  let D = ctx._tendtrust;
  if (!D) {
    D = ctx._tendtrust = {
      days: 0, errs: 0,
      pre: null, lastPost: null,
      tends: [],         // {day, linkId, other, trustBefore, trustAfter, lift, pantryPre, pantryPost, week, noteGain, refused}
      tendAttempts: [],  // substrate attempts (ctx.tendTrusts), incl. refused ones
      overnight: [],     // {day, linkId, other, delta, kinds[]}
      intradayOther: [], // {day, linkId, other, delta, kinds[]} — non-tend trust moves inside a daily
      traj: [],
      gateBlockedDays: 0, gateBlocked: [], // {day, linkId, other, trust, gap, pantryPre, pantryPost}
      nationalLost: [],  // {day, rankAfter, dips:[{id, other, trustThen, trustNow, dip}], trajTail}
      beats: [],         // inferred same-day + observed-pending beats (binddiag logic)
      first: { nationalDay: null, nationalShape: null, leadQualifyDay: null },
      maxSeasonedSubs: 0,
      lastPending: null, lastNationalLive: false, lastRank: null,
      winSnap: null, winDay: null,
    };
  }
  return D;
}

// historyEntriesAdded(beforeHist, afterHist): the history entry objects
// in `afterHist` that were not in `beforeHist` (set difference on JSON —
// history caps at 40 and shifts, so length diffs are unreliable).
function historyEntriesAdded(beforeHist, afterHist) {
  try {
    const before = new Set((beforeHist || []).map(h => JSON.stringify(h)));
    return (afterHist || []).filter(h => !before.has(JSON.stringify(h)));
  } catch (e) { return []; }
}

// historyKindsAdded(beforeHist, afterHist): kinds of history entries in
// `afterHist` that were not in `beforeHist` (set difference on JSON —
// history caps at 40 and shifts, so length diffs are unreliable).
function historyKindsAdded(beforeHist, afterHist) {
  try { return historyEntriesAdded(beforeHist, afterHist).map(h => h.kind); }
  catch (e) { return []; }
}

// noteGainFromHistory(hist, day): parse the trust number out of a 'tended'
// history note ("... trust +8); ...") stamped today. Returns the parsed
// gain or null.
function noteGainFromHistory(hist, day) {
  try {
    for (let i = (hist || []).length - 1; i >= 0; i--) {
      const h = hist[i];
      if (!h || h.kind !== 'tended') continue;
      if (h.day !== day) continue;
      const m = /trust \+(\d+)/.exec(h.note || '');
      if (m) return parseInt(m[1], 10);
    }
  } catch (e) {}
  return null;
}

function recordPre(Game, ctx) {
  const D = ensureTT(ctx);
  try {
    const pre = snapTT(Game);
    // OVERNIGHT DELTA: engine-side trust events (weekly tribute tick,
    // leader-death shake) land during sleep(), after the previous day's
    // post snapshot. Any per-link trust move between lastPost and this
    // pre is overnight, attributed via history entries added since.
    if (D.lastPost) {
      for (const l of pre.links) {
        const prev = D.lastPost.links.find(x => x.id === l.id);
        if (!prev) continue; // new link: formation, not a delta
        const delta = (l.trust | 0) - (prev.trust | 0);
        const added = historyEntriesAdded(prev.history, l.history);
        if (delta !== 0) {
          D.overnight.push({
            day: pre.day, linkId: l.id, other: l.other, delta,
            trustBefore: prev.trust, trustAfter: l.trust,
            kinds: added.map(h => h.kind),
          });
        }
        // ENGINE TENDS (instrument fix, sweep run 1 finding): the
        // villagers' own win-plan drive (winPlanBondsTick, win-plan.js)
        // tends links engine-side — trust < 50, pantryDays >= 3, >=2
        // primary links, an actor at Haven, never while nationalLive —
        // between the previous post snapshot and this pre snapshot, so
        // the pre/post tend detection never sees them. Run 1 logged them
        // only as overnight deltas (69 'tended' kinds) and counted 5
        // policy tends — a tend log missing 93% of tends. A 'tended'
        // history entry added overnight IS a tend: promote it into the
        // tend log with source 'engine-winplan'. The lift comes from the
        // note ("trust +N"), not the overnight delta — the delta can mix
        // the tend with same-night moves (a tribute tick, a succession
        // shake), and a tend+shake same night nets to a 0 delta that the
        // delta check above would miss entirely. The pantry read is the
        // pre snapshot's (post-tend — the 1,500 kcal already left); the
        // engine gate reads pantryDays, which the trajectory now carries
        // exactly. Detection is by set-difference on history entries, so
        // each tend promotes exactly once (the entry is in lastPost from
        // the next post snapshot on).
        const tendedAdded = added.filter(h => h && h.kind === 'tended');
        for (const h of tendedAdded) {
          const gain = noteGainFromEntries([h]);
          D.tends.push({
            day: pre.day, linkId: l.id, other: l.other,
            trustBefore: prev.trust, trustAfter: l.trust,
            lift: gain != null ? gain : delta,
            measuredDelta: delta,
            pantryPre: pre.pantry, pantryPost: pre.pantry,
            pantryDays: pre.pantryDays,
            week: pre.week, source: 'engine-winplan',
            noteGain: gain, noteDay: h.day,
          });
        }
      }
      // Links that vanished overnight (broken / revolt / died).
      for (const prev of D.lastPost.links) {
        if (!pre.links.find(x => x.id === prev.id)) {
          D.overnight.push({
            day: pre.day, linkId: prev.id, other: prev.other, delta: null,
            trustBefore: prev.trust, trustAfter: null,
            kinds: ['link-gone'],
          });
        }
      }
    }
    // Stash the substrate's tend-attempt counters so the post step can
    // attribute attempts made during this daily.
    D.pre = pre;
    D.preTendAttempts = ((ctx.tendTrusts || []).length) | 0;
    D.preTended = (ctx.tended || 0) | 0;
  } catch (e) { D.errs = (D.errs | 0) + 1; }
}

function recordPost(Game, ctx) {
  const D = ensureTT(ctx);
  try {
    const pre = D.pre;
    const post = snapTT(Game);
    D.days++;
    const week = post.week;
    // Tend events: the durable tendedWeek flip between pre and post.
    // A flip implies a successful tend (tendLink refuses during mourning
    // BEFORE stamping tendedWeek, and the rescue gate already passed the
    // pantry check) — the lift is the pre->post trust delta on that link.
    for (const l of post.links) {
      const pl = pre ? pre.links.find(x => x.id === l.id) : null;
      if (!pl) continue;
      if ((l.tendedWeek == null ? -1 : l.tendedWeek) !== (pl.tendedWeek == null ? -1 : pl.tendedWeek)
        && l.tendedWeek === week) {
        const lift = (l.trust | 0) - (pl.trust | 0);
        D.tends.push({
          day: post.day, linkId: l.id, other: l.other,
          trustBefore: pl.trust, trustAfter: l.trust, lift,
          pantryPre: pre.pantry, pantryPost: post.pantry,
          week, source: 'policy', noteGain: noteGainFromHistory(l.history, post.day),
        });
      }
      // Non-tend intraday moves: any other trust delta inside this daily
      // (First Court feast +10, accord gift, renegotiation, demand).
      const tendLift = D.tends.length && D.tends[D.tends.length - 1].linkId === l.id
        && D.tends[D.tends.length - 1].day === post.day
        ? D.tends[D.tends.length - 1].lift : 0;
      const other = ((l.trust | 0) - (pl.trust | 0)) - tendLift;
      if (other !== 0) {
        D.intradayOther.push({
          day: post.day, linkId: l.id, other: l.other, delta: other,
          trustBefore: pl.trust, trustAfter: l.trust,
          kinds: historyKindsAdded(pl.history, l.history),
        });
      }
    }
    // Tend attempts the substrate made during this daily (ctx.tendTrusts
    // grows inside inner.daily). An attempt with no flip is a REFUSED
    // tend — mourning is the only refusal path left once the pantry gate
    // has passed — verified against mourningUntil in the trajectory.
    const attempts = (ctx.tendTrusts || []).slice(D.preTendAttempts || 0);
    for (const a of attempts) {
      const flipped = D.tends.some(t => t.day === post.day && t.linkId === a.id);
      const pl = pre ? pre.links.find(x => x.id === a.id) : null;
      D.tendAttempts.push({
        day: post.day, linkId: a.id, trustAtAttempt: a.trust,
        flipped: !!flipped,
        mourningUntil: pl ? pl.mourningUntil : null,
        pantryPre: pre ? pre.pantry : null,
      });
    }
    // Gate-blocked tend opportunities TODAY: a sub link below trust 40,
    // untended this week, pantry (pre-daily, the conservative read — the
    // gate reads inside the daily, after accord gifts can only lower it)
    // at or under the 20,000 rescue threshold. The gate would have
    // refused even before any same-day spending.
    for (const l of post.links) {
      if (!l.isSub || l.seasoned || (l.trust | 0) >= 40) continue;
      if (l.tendedWeek === week) continue; // tended (this week) — not blocked
      if ((pre ? pre.pantry : post.pantry) > 20000) continue;
      D.gateBlocked.push({
        day: post.day, linkId: l.id, other: l.other, trust: l.trust, gap: l.trustGap,
        pantryPre: pre ? pre.pantry : null, pantryPost: post.pantry,
      });
    }
    D.gateBlockedDays = D.gateBlocked.length;
    // Daily trajectory point + shortfall.
    const tp = trajPoint(post);
    D.traj.push(tp);
    if (post.seasonedSubs > D.maxSeasonedSubs) D.maxSeasonedSubs = post.seasonedSubs;
    const F = D.first;
    if (post.leadQ && F.leadQualifyDay == null) F.leadQualifyDay = post.day;
    // Beat events: pending appears -> staged; pending disappears ->
    // resolved (same logic as binddiag-b — the substrate answers a staged
    // beat the same tick it stages, so pendingNational never survives to
    // an end-of-day sample; a nationalLive flip with no open beat is an
    // INFERRED same-day stage+answer).
    const prev = D.lastPending;
    const cur = post.pendingNational;
    if (cur && !prev) {
      D.beats.push({ stagedDay: post.day, shape: cur.shape, resolvedDay: null, outcome: null, nationalDay: null });
    } else if (!cur && prev) {
      const b = D.beats[D.beats.length - 1];
      if (b && b.resolvedDay == null) {
        b.resolvedDay = post.day;
        if (post.nationalLive) { b.outcome = 'answered'; b.nationalDay = post.day; }
        else if (post.scaleRefused) b.outcome = 'refused';
        else b.outcome = 'died';
      }
    }
    D.lastPending = cur ? { shape: cur.shape, day: cur.day } : null;
    // National transitions.
    if (post.nationalLive && !D.lastNationalLive) {
      if (F.nationalDay == null) { F.nationalDay = post.day; F.nationalShape = post.nationalShape || (cur ? cur.shape : null) || 'unknown'; }
      const openBeat = (D.beats.length && D.beats[D.beats.length - 1].resolvedDay == null) ? D.beats[D.beats.length - 1] : null;
      if (!openBeat) {
        const shape = post.nationalShape || (cur ? cur.shape : null) || 'unknown';
        D.beats.push({ stagedDay: post.day, shape, resolvedDay: post.day, outcome: 'answered', nationalDay: post.day, inferred: 'same-day' });
      }
    }
    if (!post.nationalLive && D.lastNationalLive) {
      // The trust dip that killed it: for each sub link, trust 7 days ago
      // (from the trajectory) vs now — the link(s) that fell below 40.
      const then = D.traj.length >= 8 ? D.traj[D.traj.length - 8] : (D.traj[0] || null);
      const dips = [];
      for (const l of post.links) {
        if (!l.isSub) continue;
        const tl = then ? (then.links || []).find(x => x.id === l.id) : null;
        const trustThen = tl ? tl.trust : null;
        const wasSeasoned = tl ? !!tl.seasoned : null;
        if (wasSeasoned && !l.seasoned) {
          dips.push({ id: l.id, other: l.other, trustThen, trustNow: l.trust, dip: (trustThen == null ? null : trustThen - l.trust) });
        }
      }
      D.nationalLost.push({
        day: post.day, rankAfter: post.rank, dips,
        linksNow: post.links.filter(x => x.isSub).map(x => ({ id: x.id, other: x.other, trust: x.trust, seasoned: x.seasoned, age: x.age })),
        trajTail: D.traj.slice(-14),
      });
    }
    if (post.globalLive && F.globalDay == null) F.globalDay = post.day;
    D.lastNationalLive = post.nationalLive;
    D.lastRank = post.rank;
    D.lastPost = post;
    D.pre = null;
    // The win ends the measurement window — snapshot the tend/trust state AT THE WIN.
    let won = false;
    try { won = !!Game.won; } catch (e) {}
    if (won && !D.winSnap) { D.winSnap = post; D.winDay = post.day; }
  } catch (e) { D.errs = (D.errs | 0) + 1; }
}

function withTendTrust(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // PURE-READ discipline: snapshot BEFORE delegating inward, record
      // AFTER — the record path performs no writes to game state and
      // draws no RNG, only reads + logging into ctx (the probe's own
      // surface). With TENDTRUST unset this is a pure pass-through.
      if (!layerOn()) return inner.daily(Game, ctx);
      recordPre(Game, ctx);
      const r = inner.daily(Game, ctx);
      recordPost(Game, ctx);
      return r;
    },
  });
}

module.exports = { layerOn, withTendTrust, snapTT, recordPre, recordPost, ensureTT, tendsNeeded, bufferTends, noteGainFromHistory, noteGainFromEntries, historyKindsAdded, historyEntriesAdded, trajPoint };
