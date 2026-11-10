// bindingtrace-b — the BELONG → Binding chain tracer
// (sim-bindingtrace-b, 2026-11-10, flesh-out loop B, axis scale-onramp /
// winnability chain).
//
// THE QUESTION (follow-up to sim-binddiag-b, 2026-11-08): that arm proved
// the LEAD road delivers national on the tableseat-nowait substrate
// (4/8 national, all five beats First Court, day 77) and that The Binding
// (the BELONG road's beat, swear/serve/walk) NEVER FIRED — because the
// substrate forms ZERO Haven-subordinate links on that band. This arm does
// NOT re-assert that it fails; it traces the BELONG chain stage by stage
// and names the FIRST failing link per seed:
//
//   B0 foreign realm forms (a foreign polity reaches size >= 4)
//   B1 Haven becomes a subordinate (a link with subordinate='haven' forms)
//   B2 the belong link reaches good standing (trust >= 50, arrears 0, age >= 14)
//   B3 the belong link's primary holds a foreign 4-realm while B2 holds
//       (BELONG qualifies — _belongPolity() non-null)
//   B4 The Binding stages (shape priority: LEAD is checked first, so a
//       simultaneous LEAD qualification MASKS belong — recorded as such)
//   B5 The Binding resolves: answered (swear/serve) / walked (refuses the
//       scale) / died — and WHY (exiled answerer, link broke, realm
//       dissolved/shrank)
//
// CODE AUTHORITY (src/js/hierarchy.js, read before writing this):
//   - The ONLY way Haven becomes a subordinate on this substrate:
//     leanlinkrescue proposes ONLY asSubordinate:false
//     (leanlinkrescue.js), but a proposal scoring 35-54 stages a COUNTER
//     (_stageCounter, hierarchy.js:686) whose terms are "they'll TAKE
//     Haven" (asSubordinate:true, tribute 5000-6000). leanlinkrescue
//     answers counters accept (pantry <= 25k) or sweeten (pantry > 25k);
//     accept forms the link Haven-subordinate; a successful sweeten
//     re-judges at the PROPOSAL's terms (Haven-primary). So belong links
//     are counter-accepts, nothing else, on this substrate.
//   - Foreign polities grow off-screen (_foreignPolitySim, 2335): weekly,
//     only once networkLive; drift ~12%/wk SEEDS a pair but never grows
//     past one; growth to 3-4 fires needs engagement (stirRegion beats
//     banked by the player's deeds, ~3 beats move the region that week)
//     and consolidates around the largest polity. Candidates are other
//     villages that know Haven and are not already in a foreign polity.
//   - BELONG qualification (polityOf, non-HOME branch, 2216): the link
//     must be active, subordinate HOME, good standing (trust >= 50 via
//     _succTrustOf, arrears 0, age >= 14 days), AND the primary's foreign
//     polity must hold >= 4 villages (primary + Haven + >= 2 subs).
//   - Shape priority (_havenPolity, 2237; _checkNational, 2517): lead ->
//     belong -> covenant -> trade. A LEAD qualification stages the First
//     Court first; once nationalLive is set via LEAD, belong can never
//     stage (nationalLive blocks _checkNational, 2501).
//   - Staging gate (_checkNational, 2425): networkLive AND regional age
//     >= 30 days (one rung per season), never when scaleRefused, never
//     while the answerer is exiled, never while a beat is pending.
//   - The Binding's answer (answerNationalChoice, belong branch, 2745)
//     re-checks ONLY the link (active, subordinate HOME) — NOT the
//     foreign polity size. A realm that shrank between staging and
//     answering does not kill the oath at answer time.
//   - Death modes: exiled answerer kills a staged beat aloud at the next
//     day boundary (2487); a broken belong link kills it aloud at answer
//     time ("The Binding never happens — the link came apart", 2749);
//     realm dissolution clears nationalLive aloud (2428).
//
// This layer is a PURE-READ instrument (BINDINGTRACE=1; unset delegates
// to the wrapped policy byte-identically): it composes OUTSIDE binddiag-b
// (withBindingTrace(withBindDiag(...))) and records AFTER the inner daily
// runs. It writes NOTHING to game state and draws NO RNG. It never calls
// polityOf() (which initializes state.foreignPolities on the non-HOME
// branch) or villageStandingTotal() (side effects) — BELONG qualification
// is reproduced from pure reads, exactly as binddiag-b does for LEAD.
// It READS ctx._binddiag (the inner recorder's beats) to attribute
// Binding staging/resolution and LEAD-mask events — never writes to it.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';

// BINDINGTRACE=1 is the only on-switch. Unset delegates to the wrapped
// policy byte-identically (the proof's guard pins that).
function layerOn() { return process.env.BINDINGTRACE === '1'; }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// belongGood(l, day): the valued-subordinate bar, reproduced from
// polityOf's non-HOME branch (hierarchy.js:2227): trust >= 50, arrears 0,
// link age >= 14 days. SUCCPOLITY grace is env-gated default OFF, so the
// plain trust is the authority here (same call binddiag-b makes).
function belongGood(l, day) {
  if (!l || l.status !== 'active' || l.subordinate !== 'haven') return false;
  return ((l.trust | 0) >= 50) && (((l.arrears | 0) === 0)) && ((day - (l.day | 0)) >= 14);
}

// foreignSizeFor(primaryId, fps): polity size as polityOf computes it:
// primary + Haven + the primary's foreign subs (2 + fp.subs.length).
function foreignSizeFor(primaryId, fps) {
  for (const fp of (fps || [])) {
    if (fp && fp.primary === primaryId) return 2 + ((fp.subs || []).length);
  }
  return 2; // primary + Haven, no foreign subs on record
}

// classifyBelong(D): the FIRST failing link of the belong chain for one
// seed, from the plain recorded data (no Game). Returns {stage, link}
// where stage is the deepest stage REACHED (B0..B5) and link names the
// first stage that failed — or 'binding-answered' when the chain ran to
// the end. Stages: B0 foreign 4-realm exists; B1 belong link formed; B2
// belong link good-standing; B3 belong qualifies (good + realm >= 4);
// B4 Binding staged; B5 Binding answered.
function classifyBelong(D) {
  const F = D.first || {};
  if (F.firstBindingAnsweredDay != null) return { stage: 'B5', link: 'binding-answered' };
  if (F.firstBindingStagedDay != null) {
    const b = (D.bindingBeats || []).find(x => x.shape === 'belong' && x.resolvedDay != null);
    if (b) {
      if (b.outcome === 'died') return { stage: 'B4', link: 'binding-died:' + (b.deathWhy || 'unknown') };
      if (b.outcome === 'refused') return { stage: 'B4', link: 'binding-walked' };
      return { stage: 'B4', link: 'binding-staged-' + (b.outcome || 'unresolved') };
    }
    return { stage: 'B4', link: 'binding-staged-unresolved' };
  }
  if (F.firstBelongQualifyDay != null) {
    // Qualified but never staged: either masked by LEAD (the shape
    // priority) or the village died / the rung gate never opened.
    if ((D.maskStageDays || 0) > 0) return { stage: 'B3', link: 'masked-by-lead' };
    if (D.nationalLiveViaLead) return { stage: 'B3', link: 'masked-by-lead-national-live' };
    return { stage: 'B3', link: 'qualified-never-staged' };
  }
  if (F.firstBelongGoodDay != null) return { stage: 'B2', link: 'belong-good-no-realm' };
  if (F.firstBelongLinkDay != null) return { stage: 'B1', link: 'belong-link-never-good' };
  if (F.foreignRealmDay != null) return { stage: 'B0', link: 'foreign-realm-no-belong-link' };
  return { stage: 'none', link: 'no-foreign-realm' };
}

function ensureBT(ctx) {
  let D = ctx._bindingtrace;
  if (!D) {
    D = ctx._bindingtrace = {
      days: 0, errs: 0,
      // Foreign-polity trajectory (pure reads of state.foreignPolities).
      traj: [], // {day, fps:[{primary, subs}], maxSize, stir, stirKinds[]}
      first: {
        foreignPairDay: null, foreignTripleDay: null, foreignRealmDay: null,
        firstCounterDay: null, firstBelongLinkDay: null,
        firstBelongGoodDay: null, firstBelongQualifyDay: null,
        firstBindingStagedDay: null, firstBindingAnsweredDay: null,
      },
      maxForeignSize: 0, maxForeignPrimary: null,
      // Counter events: {target, day, asSubordinate} staged; resolved with
      // outcome accept-sub | sweeten-primary | no-link | unresolved.
      counters: [],
      // Link-formation events: {id, target, role: 'subordinate'|'primary',
      // day, viaCounter, trust}
      linkForms: [],
      // Belong-link daily state, per link id.
      belongLinks: {}, // id -> {primary, formedDay, firstGoodDay, maxTrust, brokeDay, brokeTrust}
      belongQualifyDays: 0, leadMaskDays: 0, maskStageDays: 0,
      nationalLiveViaLead: false,
      // Binding beats (shape 'belong' only, attributed from _binddiag).
      bindingBeats: [], // {stagedDay, resolvedDay, outcome, deathWhy, nationalDay}
      seenLinkIds: {},
      seenCounters: {}, // targetId -> {day, asSubordinate}
      pendingCounterSeen: null, // {targetId, day, asSubordinate} currently open
      lastLeadQualify: false, lastBelongQualify: false,
      lastNationalLive: false,
      endDay: null, endReason: null,
    };
  }
  return D;
}

function snapBelong(Game) {
  const s = { day: dayOf(Game), errs: [] };
  const st = (Game.state || {});
  try { s.exiled = !!((st.scholar || {}).exiled); } catch (e) { s.exiled = false; }
  try { s.nationalLive = !!st.nationalLive; s.nationalShape = st.nationalShape || null; s.scaleRefused = !!st.scaleRefused; } catch (e) {}
  try { s.stir = (st._regionStir | 0) || 0; s.stirKinds = (st._regionStirKinds || []).slice(); } catch (e) { s.stir = 0; s.stirKinds = []; }
  try {
    const pc = st.pendingCounter;
    s.pendingCounter = pc ? { targetId: String(pc.targetId || ''), asSubordinate: !!pc.asSubordinate, day: pc.day | 0 } : null;
  } catch (e) { s.pendingCounter = null; }
  // Foreign polities, read from state (never written by this recorder).
  let fps = [];
  try { fps = (st.foreignPolities || []).slice(); } catch (e) { fps = []; }
  s.fps = fps.map(fp => ({ primary: String((fp && fp.primary) || '?'), subs: ((fp && fp.subs) || []).slice(), day: (fp && fp.day) | 0 }));
  // Polity SIZE, as polityOf computes it: primary + Haven + subs.
  // (A foreign polity with 2 subs IS a 4-fire realm.)
  s.maxForeignSize = 0;
  for (const fp of s.fps) s.maxForeignSize = Math.max(s.maxForeignSize, 2 + fp.subs.length);
  // Links, straight from hierarchyState() (the substrate calls it daily).
  let links = [];
  try { links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : []; } catch (e) { links = []; }
  const seasoned = (l) => {
    try { return (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered, true) : false; } catch (e) { return false; }
  };
  let seasonedSubs = 0;
  s.links = [];
  for (const l of links) {
    if (!l) continue;
    const rec = {
      id: String(l.id || '?'), status: String(l.status || '?'),
      primary: String(l.primary || '?'), subordinate: String(l.subordinate || '?'),
      trust: l.trust | 0, arrears: l.arrears | 0, day: l.day | 0,
      kind: String(l.kind || 'sub'), conquered: !!l.conquered,
      age: s.day - (l.day | 0),
    };
    rec.seasoned = seasoned(l);
    if (rec.status === 'active' && rec.primary === 'haven' && rec.subordinate !== 'haven' && rec.seasoned) seasonedSubs++;
    s.links.push(rec);
  }
  s.seasonedSubs = seasonedSubs;
  s.leadQualify = seasonedSubs >= 3;
  // Belong links: active, subordinate haven.
  s.belongLinks = [];
  for (const l of s.links) {
    if (l.status !== 'active' || l.subordinate !== 'haven') continue;
    const good = belongGood({ status: l.status, subordinate: l.subordinate, trust: l.trust, arrears: l.arrears, day: l.day }, s.day);
    const fsize = foreignSizeFor(l.primary, s.fps);
    s.belongLinks.push({ id: l.id, primary: l.primary, trust: l.trust, arrears: l.arrears, age: l.age, good, foreignSize: fsize, qualifies: good && fsize >= 4 });
  }
  s.belongQualify = s.belongLinks.some(b => b.qualifies);
  return s;
}

function recordDaily(Game, ctx) {
  const D = ensureBT(ctx);
  try {
    const s = snapBelong(Game);
    D.days++;
    D.endDay = s.day;
    const F = D.first;
    // Foreign-polity trajectory (compact daily point + first-days).
    D.traj.push({ day: s.day, fps: s.fps.map(f => ({ p: f.primary, n: f.subs.length })), maxSize: s.maxForeignSize, stir: s.stir, stirKinds: s.stirKinds.slice() });
    if (s.errs.length) D.errs += s.errs.length;
    if (s.maxForeignSize > D.maxForeignSize) { D.maxForeignSize = s.maxForeignSize; D.maxForeignPrimary = (s.fps.find(f => 2 + f.subs.length === s.maxForeignSize) || {}).primary || null; }
    if (s.maxForeignSize >= 2 && F.foreignPairDay == null) F.foreignPairDay = s.day;
    if (s.maxForeignSize >= 3 && F.foreignTripleDay == null) F.foreignTripleDay = s.day;
    if (s.maxForeignSize >= 4 && F.foreignRealmDay == null) F.foreignRealmDay = s.day;
    // Counter events: staged (pendingCounter visible at today's sample),
    // resolved (a seen counter is gone with no pendingCounter for it).
    if (s.pendingCounter) {
      const pc = s.pendingCounter;
      if (!D.seenCounters[pc.targetId] || D.seenCounters[pc.targetId].day !== pc.day) {
        D.seenCounters[pc.targetId] = { day: pc.day, asSubordinate: pc.asSubordinate };
        D.counters.push({ target: pc.targetId, day: pc.day, asSubordinate: pc.asSubordinate, resolvedDay: null, outcome: null });
        if (F.firstCounterDay == null) F.firstCounterDay = pc.day;
      }
      D.pendingCounterSeen = pc;
    } else if (D.pendingCounterSeen) {
      // A counter that was open is now gone without a pendingCounter:
      // resolved — but the link (if any) forms in the SAME daily the
      // substrate answers it, i.e. today's link scan below sees it. The
      // outcome is fixed up when the link is detected; if no link ever
      // appears for that target, the counter stays 'no-link' (sweeten
      // failed — accept always forms a link).
      const open = D.pendingCounterSeen;
      D.pendingCounterSeen = null;
      const c = D.counters[D.counters.length - 1];
      if (c && c.target === open.targetId && c.resolvedDay == null) {
        c.resolvedDay = s.day;
        c.outcome = 'no-link'; // refined to accept-sub/sweeten-primary if a link lands
      }
    }
    // Link-formation events: any link id not seen before.
    for (const l of s.links) {
      if (D.seenLinkIds[l.id]) continue;
      D.seenLinkIds[l.id] = true;
      // A link born the same day it is first seen counts as formed today
      // (formation day == link.day; the first sighting is the same daily
      // the substrate formed it — the recorder samples every day).
      const prior = D.seenCounters[l.primary === 'haven' ? l.subordinate : l.primary];
      const viaCounter = !!prior;
      const role = (l.subordinate === 'haven') ? 'subordinate' : 'primary';
      D.linkForms.push({ id: l.id, target: (l.primary === 'haven' ? l.subordinate : l.primary), role, day: l.day, viaCounter, trust: l.trust });
      // Refine the counter outcome if this link resolves a seen counter.
      if (viaCounter) {
        for (let i = D.counters.length - 1; i >= 0; i--) {
          const c = D.counters[i];
          // Only refine a counter resolved TODAY: an old sweeten-fail
          // ('no-link') must not be re-attributed to a later direct-accept
          // link for the same target.
          if (c.target === (l.primary === 'haven' ? l.subordinate : l.primary) && c.outcome === 'no-link' && c.resolvedDay === s.day) {
            c.outcome = (role === 'subordinate') ? 'accept-sub' : 'sweeten-primary';
            c.resolvedDay = s.day;
            break;
          }
        }
      }
      if (role === 'subordinate') {
        if (F.firstBelongLinkDay == null) F.firstBelongLinkDay = l.day;
        D.belongLinks[l.id] = { primary: l.primary, formedDay: l.day, firstGoodDay: null, maxTrust: l.trust, brokeDay: null, brokeTrust: null };
      }
    }
    // Belong-link daily state: good-standing first-days, max trust, breaks.
    for (const b of s.belongLinks) {
      const rec = D.belongLinks[b.id];
      if (rec) {
        if (b.trust > rec.maxTrust) rec.maxTrust = b.trust;
        if (b.good && rec.firstGoodDay == null) {
          rec.firstGoodDay = s.day;
          if (F.firstBelongGoodDay == null) F.firstBelongGoodDay = s.day;
        }
      }
    }
    // Broken belong links: a tracked belong id no longer active.
    for (const id of Object.keys(D.belongLinks)) {
      const rec = D.belongLinks[id];
      if (rec.brokeDay != null) continue;
      const live = s.links.find(l => l.id === id);
      if (!live || live.status !== 'active') {
        rec.brokeDay = s.day;
        rec.brokeTrust = live ? live.trust : rec.maxTrust;
      }
    }
    // Qualification + masking.
    if (s.belongQualify) {
      D.belongQualifyDays++;
      if (F.firstBelongQualifyDay == null) F.firstBelongQualifyDay = s.day;
      if (s.leadQualify) D.leadMaskDays++;
    }
    if (s.nationalLive && s.nationalShape === 'lead') D.nationalLiveViaLead = true;
    // Binding beats, attributed from the inner binddiag recorder (which
    // runs its daily BEFORE this layer's, so today's resolutions are
    // already in ctx._binddiag.beats).
    try {
      const BD = ctx._binddiag;
      if (BD && BD.beats) {
        for (const b of BD.beats) {
          if (b.shape !== 'belong') continue;
          const known = D.bindingBeats.find(x => x.stagedDay === b.stagedDay);
          if (!known && b.stagedDay != null) {
            D.bindingBeats.push({ shape: 'belong', stagedDay: b.stagedDay, resolvedDay: b.resolvedDay, outcome: b.outcome || null, deathWhy: null, nationalDay: b.nationalDay || null });
            if (F.firstBindingStagedDay == null) F.firstBindingStagedDay = b.stagedDay;
          } else if (known && b.resolvedDay != null && known.resolvedDay == null) {
            known.resolvedDay = b.resolvedDay;
            known.outcome = b.outcome || null;
            known.nationalDay = b.nationalDay || null;
          }
          if (b.outcome === 'answered' && b.nationalDay != null && F.firstBindingAnsweredDay == null) F.firstBindingAnsweredDay = b.nationalDay;
        }
        // Death-why attribution: a belong beat resolved 'died' TODAY gets
        // its reason from TODAY's snapshot (exiled answerer / belong link
        // broken or un-good / foreign realm shrunk below 4).
        for (const bb of D.bindingBeats) {
          if (bb.outcome === 'died' && bb.resolvedDay === s.day && !bb.deathWhy) {
            if (s.exiled) bb.deathWhy = 'exiled-answerer';
            else {
              const anyBelong = s.belongLinks.length > 0;
              if (!anyBelong) bb.deathWhy = 'belong-link-gone';
              else if (!s.belongLinks.some(x => x.good)) bb.deathWhy = 'belong-link-not-good';
              else if (!s.belongLinks.some(x => x.qualifies)) bb.deathWhy = 'foreign-realm-shrank';
              else bb.deathWhy = 'unknown-still-qualified';
            }
          }
        }
        // LEAD-mask staging: a lead beat staged on a day belong qualified.
        // Counted once per staging day, in this layer's own surface.
        D._leadBeatStagedDays = D._leadBeatStagedDays || {};
        for (const b of BD.beats) {
          if (b.shape === 'lead' && b.stagedDay === s.day && s.belongQualify && !D._leadBeatStagedDays[b.stagedDay]) {
            D._leadBeatStagedDays[b.stagedDay] = true;
            D.maskStageDays++;
          }
        }
      }
    } catch (e) { D.errs = (D.errs | 0) + 1; }
    D.lastLeadQualify = s.leadQualify;
    D.lastBelongQualify = s.belongQualify;
    D.lastNationalLive = s.nationalLive;
  } catch (e) { D.errs = (D.errs | 0) + 1; }
  return D;
}

function withBindingTrace(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // PURE-READ discipline: record AFTER the inner daily runs, and the
      // record path itself performs no writes to game state and draws no
      // RNG — only reads + logging into ctx (the probe's own surface).
      const r = inner.daily(Game, ctx);
      if (layerOn()) recordDaily(Game, ctx);
      return r;
    },
  });
}

module.exports = { layerOn, withBindingTrace, snapBelong, recordDaily, ensureBT, belongGood, foreignSizeFor, classifyBelong };
