#!/usr/bin/env node
// probe-linkdissolve-instruments.js — SHARED link-dissolution instruments for
// sim-linkdissolve-b (loop B, run fleshout-loop-b-20261020T2235Z).
//
// Named next from sim-surplusfeed-national-b (landed c7697540c, verdict
// 'open'): WHY do armed runs lose the realm more often post-court (9/12 vs
// 6/13) when the standing-accumulation-tax hypothesis was rejected? Answer
// by instrumenting link-dissolution causes vs trim on the paired substrate.
//
// Mechanism chain under test (all engine code, read-only here):
//   nationalLive clears ONLY at hierarchy.js:2113, when _havenPolity()
//   returns null while national is live. Polity bars: LEAD = >=3 active
//   HOME-primary links seasoned (age>=30d AND trust>=40; conquered: age
//   only); BELONG = Haven-subordinate link in good standing (trust>=50,
//   arrears=0, age>=14d) to a primary whose foreign realm holds >=4 fires;
//   COVENANT/TRADE = >=3 seasoned peer links (age>=30, trust>=40).
//   Trust falls via tribute shortfalls, leader-death haircuts (-8),
//   neglect, covenant pool-pour shorts (-4 league-wide), refused calls
//   (-15), sabotage/revolt, renegotiation silence (-6), crisis hits (-10).
//   Haven's pantry pays the upkeep: tendLink 1500/wk/link, payTribute
//   owed/wk, covenant pool pour 2000/wk, trade upkeep 400/wk. Policies gate
//   upkeep on pantry (leadcourt: skip tending <20k; belongseek: skip
//   tribute <2x owed). Trim -> leaner pantry -> upkeep gaps -> trust decay
//   -> bars fail -> dissolution.
//
// Instruments (pure telemetry wraps; every wrap calls through, draws no
// RNG, writes no game state; verified by the det-gate):
//   1. dissolution detector: a _checkNational wrap (call-through) records
//      the wasLive->!isLive transition with the pre-call road, court day,
//      and a full link snapshot.
//   2. court detector + daily link census: a Game.sleep wrap (outside the
//      standing probe's, also call-through) samples, at each dawn: the
//      engine's own _havenPolity() (RNG-clean: foreignPolities is a state
//      read; _linkSeasoned reads only), an independent bar-replication
//      (agreement check = two-source honesty), per-link
//      [id,kind,other,trust,arrears,status,ageDays,tribKcalPerWeek,
//      conquered], and pantry kcal. nationalDay changes stage court events.
//   3. upkeep flows: a channel stack pushed by wraps of payTribute
//      ('tribute'), tendLink ('tend'), covenantTick ('pool'), tradeTick
//      ('tariff'), answerRenegotiation ('reneg'); a _removePantryKcal wrap
//      attributes the engine's own paid return value to the top channel,
//      per day. Per-call records carry {day, channel, link, paid} from the
//      engine's real return values (actual pantry kcal paid, 0 on refusal).
//   4. link histories: at end of run, each link's day-stamped history
//      ledger (named cause kinds: arrears/tribute/tended/pool/tariff/
//      succession/renegotiation/crisis/demand/call/revolt/sabotage/broken/
//      dissolve/formed) is snapshotted for post-court window attribution.
//
// Usage: same env as the parent driver (FEASTSCALE_R13=1 SEATDRIVE=0,
// SURPLUSFEED=1 armed / unset control).
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

function otherOf(l) {
  try {
    if (l.subordinate === 'haven') return l.primary;
    if (l.primary === 'haven') return l.subordinate;
    if (l.a === 'haven') return l.b;
    if (l.b === 'haven') return l.a;
    return '?';
  } catch (e) { return '?'; }
}

function kindOf(l) {
  try {
    if (l.kind === 'covenant' || l.kind === 'trade') return l.kind;
    return 'vassal';
  } catch (e) { return '?'; }
}

// seasoned exactly as the engine's _linkSeasoned (RNG-clean read path).
function seasoned(l, day) {
  try {
    if (!l || l.status !== 'active') return false;
    if ((day - (l.day || 0)) < 30) return false;
    if (l.conquered) return true;
    return (l.trust || 0) >= 40;
  } catch (e) { return false; }
}

// myPolity: independent replication of the engine's _havenPolity bars,
// RNG-clean (foreignPolities() is a pure state read; no R() anywhere on
// this path). Used for the agreement honesty check, never for game logic.
function myPolity(Game, day) {
  try {
    const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    // LEAD
    const subs = links.filter(l => l.status === 'active' && l.primary === 'haven' && seasoned(l, day));
    if (subs.length >= 3) {
      const conq = subs.every(l => !!l.conquered);
      return { shape: conq ? 'conquest' : 'lead', ids: subs.map(l => l.id) };
    }
    // BELONG
    const fps = (typeof Game.foreignPolities === 'function') ? Game.foreignPolities() : [];
    for (const l of links) {
      if (l.status !== 'active' || l.subordinate !== 'haven') continue;
      const good = (l.trust || 0) >= 50 && (l.arrears || 0) === 0 && (day - (l.day || 0)) >= 14;
      if (!good) continue;
      let fp = null;
      for (const f of fps) if (f && f.primary === l.primary) { fp = f; break; }
      const size = 2 + (fp && fp.subs ? fp.subs.length : 0);
      if (size >= 4) return { shape: 'belong', ids: [l.id], primary: l.primary };
    }
    // COVENANT
    const cov = links.filter(l => l.status === 'active' && l.kind === 'covenant' &&
      (l.a === 'haven' || l.b === 'haven') && seasoned(l, day));
    if (cov.length >= 3) return { shape: 'covenant', ids: cov.map(l => l.id) };
    // TRADE
    const tr = links.filter(l => l.status === 'active' && l.kind === 'trade' &&
      (l.a === 'haven' || l.b === 'haven') && seasoned(l, day));
    if (tr.length >= 3) return { shape: 'trade', ids: tr.map(l => l.id) };
    return null;
  } catch (e) { return null; }
}

function dirOf(l) {
  try {
    if (l.kind === 'covenant') return 'C';
    if (l.kind === 'trade') return 'T';
    if (l.primary === 'haven') return 'P';
    if (l.subordinate === 'haven') return 'S';
    return '?';
  } catch (e) { return '?'; }
}

function snapLinks(Game) {
  const out = [];
  try {
    const day = dayOf(Game);
    const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (const l of links) {
      out.push([
        l.id || '?', kindOf(l), otherOf(l),
        Math.round(l.trust || 0), Math.round(l.arrears || 0),
        l.status || '?', Math.max(0, day - (l.day || 0)),
        Math.round(l.tributeKcalPerWeek || 0), l.conquered ? 1 : 0,
        dirOf(l),
      ]);
    }
  } catch (e) {}
  return out;
}

function attachLinkProbe(Game) {
  const W = {
    dissolutions: [], // {day, road, courtDay, pantry, links}
    courts: [],       // {day, shape} — nationalDay staging events
    linkTraj: [],      // per dawn {d, nat, natDay, engShape, myShape, agree, links, pantry}
    upkeepDay: {},    // day -> {channel: paidKcal}
    upkeepCalls: [],  // {d, ch, link, paid}
    agreeN: 0, agreeBad: 0,
    stack: [],
    _prevNatDay: 0,
  };

  function top() { return W.stack.length ? W.stack[W.stack.length - 1] : null; }
  function withCh(ch, fn) {
    W.stack.push(ch);
    try { return fn(); } finally { W.stack.pop(); }
  }
  function recUpkeep(ch, linkId, paid) {
    try {
      const d = dayOf(Game);
      const m = W.upkeepDay[d] || (W.upkeepDay[d] = {});
      m[ch] = Math.round((m[ch] || 0) + (paid || 0));
      W.upkeepCalls.push({ d, ch, link: linkId || '?', paid: Math.round(paid || 0) });
    } catch (e) {}
  }

  // --- dissolution detector (_checkNational wrap, call-through) ---
  {
    const o = Game._checkNational;
    if (typeof o === 'function') Game._checkNational = function () {
      let wasLive = false, preShape = '', preDay = 0;
      try {
        const st = Game.state || {};
        wasLive = !!st.nationalLive;
        preShape = st.nationalShape || '';
        preDay = st.nationalDay || 0;
      } catch (e) {}
      const r = o.apply(this, arguments);
      try {
        const st = Game.state || {};
        if (wasLive && !st.nationalLive) {
          W.dissolutions.push({
            day: dayOf(Game), road: preShape, courtDay: preDay,
            pantry: Math.round(pantryKcal(Game)), links: snapLinks(Game),
          });
        }
      } catch (e) {}
      return r;
    };
  }

  // --- court detector + daily link census (sleep wrap, call-through) ---
  {
    const o = Game.sleep;
    if (typeof o === 'function') Game.sleep = function () {
      const r = o.apply(this, arguments);
      try {
        const d = dayOf(Game);
        const st = Game.state || {};
        const natDay = st.nationalDay || 0;
        if (natDay !== W._prevNatDay) {
          if (natDay > 0) W.courts.push({ day: natDay, shape: st.nationalShape || '' });
          W._prevNatDay = natDay;
        }
        let eng = null, engShape = '';
        try {
          if (typeof Game._havenPolity === 'function') {
            eng = Game._havenPolity();
            engShape = eng ? (eng.shape || '?') : '';
          }
        } catch (e) { eng = 'ERR'; }
        const mine = myPolity(Game, d);
        const myShape = mine ? mine.shape : '';
        const agree = (eng === 'ERR') ? -1 : (((eng == null) === (mine == null)) ? 1 : 0);
        W.agreeN++;
        if (agree !== 1) W.agreeBad++;
        W.linkTraj.push({
          d, nat: st.nationalLive ? 1 : 0, natDay,
          engShape, myShape, agree,
          links: snapLinks(Game), pantry: Math.round(pantryKcal(Game)),
        });
      } catch (e) {}
      return r;
    };
  }

  // --- upkeep channel attribution (_removePantryKcal wrap, call-through) ---
  {
    const o = Game._removePantryKcal;
    if (typeof o === 'function') Game._removePantryKcal = function (kcal) {
      const paid = o.apply(this, arguments);
      try {
        const ch = top();
        if (ch) {
          const d = dayOf(Game);
          const m = W.upkeepDay[d] || (W.upkeepDay[d] = {});
          m[ch] = Math.round((m[ch] || 0) + (paid || 0));
        }
      } catch (e) {}
      return paid;
    };
  }

  // --- upkeep verb wraps (call-through, record engine return values) ---
  {
    const op = Game.payTribute;
    if (typeof op === 'function') Game.payTribute = function (linkId, kcal) {
      let r = null;
      withCh('tribute', () => { r = op.apply(this, arguments); });
      try { recUpkeep('tribute', linkId, r); } catch (e) {}
      return r;
    };
  }
  {
    const ot = Game.tendLink;
    if (typeof ot === 'function') Game.tendLink = function (linkId) {
      let r = null;
      withCh('tend', () => { r = ot.apply(this, arguments); });
      try { recUpkeep('tend', linkId, r); } catch (e) {}
      return r;
    };
  }
  {
    const oc = Game.covenantTick;
    if (typeof oc === 'function') Game.covenantTick = function (link) {
      let r;
      withCh('pool', () => { r = oc.apply(this, arguments); });
      return r;
    };
  }
  {
    const ot2 = Game.tradeTick;
    if (typeof ot2 === 'function') Game.tradeTick = function (link) {
      let r;
      withCh('tariff', () => { r = ot2.apply(this, arguments); });
      return r;
    };
  }
  {
    const oa = Game.answerRenegotiation;
    if (typeof oa === 'function') Game.answerRenegotiation = function (linkId, how) {
      let r;
      withCh('reneg', () => { r = oa.apply(this, arguments); });
      return r;
    };
  }

  // --- dissolution say-lines (sense-testing source; the engine says every
  // realm death aloud — capture the exact copy for transcript reads) ---
  W.dissolveLines = [];
  {
    const o = Game.say;
    if (typeof o === 'function') Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (/realm came apart|no polity answers|no longer describe this village/i.test(s)) {
          W.dissolveLines.push({ day: dayOf(Game), line: s.slice(0, 400) });
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  return W;
}

// endLinkHistories: snapshot every link's day-stamped history ledger at
// end of run (post-court window attribution source).
function endLinkHistories(Game) {
  const out = [];
  try {
    const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (const l of links) {
      out.push({
        id: l.id || '?', kind: kindOf(l), other: otherOf(l),
        status: l.status || '?', trust: Math.round(l.trust || 0),
        arrears: Math.round(l.arrears || 0),
        history: ((l.history || []).map(h => ({ day: h.day || 0, kind: h.kind || '?', note: String(h.note || '').slice(0, 160) }))),
      });
    }
  } catch (e) {}
  return out;
}

module.exports = { attachLinkProbe, endLinkHistories, dayOf, pantryKcal, myPolity, seasoned };
