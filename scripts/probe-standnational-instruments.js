#!/usr/bin/env node
// probe-standnational-instruments.js — SHARED standing-economy instruments for
// sim-surplusfeed-national-b (loop B, run fleshout-loop-b-20261020T20xxZ).
//
// Question (#702 named next): does the landed default-OFF SURPLUSFEED governor
// tax the feast/gift economy that builds standing — and does that explain the
// armed-vs-control national gap (4/16 vs 9/16) in sim-surplusfeed-curvecheck-b?
//
// Mechanism chain under test (all engine code, read-only here):
//   SURPLUSFEED trim (share_surplus inflow at villagerMealDay) -> leaner pantry
//   -> feasts spend less / land thinner (hostFeast: thin-pickings -1 at
//      <300 kcal/head, variety needs pantry stock; feastLog quality<1 scores 0
//      plenty standing, 20 pts each at quality>=1)
//   -> gifts/oaths/court ceremonies are kcal-priced (accord gift 1500-2000,
//      renegotiation gift 1500, oath 3000, feast-court 5000; honor proportional
//      to paid) -> less trust per answer -> slower seasoned-link accumulation
//      (diplomacy standing) and thinner courts (national itself).
//
// Instruments (pure telemetry wraps; every wrap calls through, draws no RNG,
// writes no game state; verified by the det-gate):
//   1. spend markers: a channel stack pushed by wraps of hostFeast ('feast'),
//      answerNationalChoice ('court'), answerAccord ('gift'),
//      answerRenegotiation ('gift'). pantryDraw and _removePantryKcal wraps
//      attribute the engine's own paid/taken numbers to the top marker —
//      'unattributed' otherwise. Named-channel attribution of the
//      standing-economy spend is exact by construction (engine return values).
//   2. standing trajectory: a Game.sleep wrap (outside attachProbe's, also
//      call-through) samples Game.villageStanding() at each dawn — pure
//      reads (ledger, hierarchyState, feastLog; no R() in the read path),
//      ints only. Also samples state.nationalDay / pendingNational shape.
//   3. event log: each answered beat records {day, path, how, shape, paidKcal}
//      and each hostFeast records {day, paidKcal, quality} from the engine's
//      own return value.
//   4. feast honesty cross-check: the feast say-line "(-X kcal from the
//      pantry)" is parsed and matched against recorded paid; >=99% must match
//      (the binding honesty bar, like the curve-check's).
//
// Usage: same env as the curvecheck driver (FEASTSCALE_R13=1 SEATDRIVE=0,
// SURPLUSFEED=1 armed / unset control).
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function attachStandingProbe(Game) {
  const W = {
    stack: [],
    spend: {},        // channel -> total kcal
    spendDay: {},     // day -> {channel: kcal}
    spendTotal: 0,    // independent total: every attributed + unattributed paid
    feastEvents: [],  // {day, paid, quality}
    courtEvents: [],  // {day, shape, how, paid}
    giftEvents: [],   // {day, path, how, paid}
    stand: [],        // dawn trajectory {d, t, war, dip, ple, feasts}
    feastHonest: 0, feastHonestN: 0,
  };

  function cell(d, ch) {
    const m = W.spendDay[d] || (W.spendDay[d] = {});
    return m;
  }
  function record(ch, kcal) {
    kcal = Math.round(kcal || 0);
    if (kcal <= 0) return;
    W.spend[ch] = (W.spend[ch] || 0) + kcal;
    W.spendTotal += kcal;
    const d = dayOf(Game);
    const m = cell(d, ch);
    m[ch] = (m[ch] || 0) + kcal;
  }
  function withMarker(name, fn) {
    W.stack.push(name);
    try { return fn(); } finally { W.stack.pop(); }
  }
  function top() { return W.stack.length ? W.stack[W.stack.length - 1] : 'unattributed'; }

  // pantry draw attribution (feasts draw via pantryDraw; also meals/tributes).
  // feastPlan runs pantryDraw on a COPY of the pantry (menu preview, no
  // mutation) — attribute only draws against the REAL village object, else
  // the plan-phase preview would double-count the feast's spend.
  {
    const o = Game.pantryDraw;
    if (typeof o === 'function') Game.pantryDraw = function (v, want, opts) {
      const r = o.apply(this, arguments);
      try {
        const realV = (Game.state || {}).village;
        if (v && v === realV) record(top(), (r && r.taken) || 0);
      } catch (e) {}
      return r;
    };
  }
  // direct kcal removal attribution (gifts, oaths, court payments, tribute)
  {
    const o = Game._removePantryKcal;
    if (typeof o === 'function') Game._removePantryKcal = function (kcal) {
      const paid = o.apply(this, arguments);
      try { record(top(), paid || 0); } catch (e) {}
      return paid;
    };
  }

  // feast path: records engine-returned quality + paid under the 'feast' marker
  {
    const o = Game.hostFeast;
    if (typeof o === 'function') Game.hostFeast = function (opts) {
      const before = W.spendTotal;
      const r = withMarker('feast', () => o.apply(this, arguments));
      try {
        const paid = W.spendTotal - before;
        W.feastEvents.push({
          day: dayOf(Game), paid, ok: !!(r && r.ok),
          quality: r && typeof r.quality === 'number' ? r.quality : -1,
        });
      } catch (e) {}
      return r;
    };
  }
  // answered-beat paths
  {
    const o = Game.answerAccord;
    if (typeof o === 'function') Game.answerAccord = function (how) {
      const before = W.spendTotal;
      const r = withMarker('gift', () => o.apply(this, arguments));
      try { W.giftEvents.push({ day: dayOf(Game), path: 'accord', how: String(how), paid: W.spendTotal - before }); } catch (e) {}
      return r;
    };
  }
  {
    const o = Game.answerRenegotiation;
    if (typeof o === 'function') Game.answerRenegotiation = function (id, how) {
      const before = W.spendTotal;
      const r = withMarker('gift', () => o.apply(this, arguments));
      try { W.giftEvents.push({ day: dayOf(Game), path: 'reneg', how: String(how), paid: W.spendTotal - before }); } catch (e) {}
      return r;
    };
  }
  {
    const o = Game.answerNationalChoice;
    if (typeof o === 'function') Game.answerNationalChoice = function (how) {
      let shape = '?';
      try { shape = ((Game.state || {}).pendingNational || {}).shape || '?'; } catch (e) {}
      const before = W.spendTotal;
      const r = withMarker('court', () => o.apply(this, arguments));
      try { W.courtEvents.push({ day: dayOf(Game), shape, how: String(how), paid: W.spendTotal - before }); } catch (e) {}
      return r;
    };
  }

  // dawn standing sampler (sleep wrap OUTSIDE attachProbe's — both call through)
  {
    const o = Game.sleep;
    if (typeof o === 'function') Game.sleep = function () {
      const r = o.apply(this, arguments);
      try {
        const d = dayOf(Game);
        const s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
        const st = Game.state || {};
        W.stand.push({
          d,
          t: s ? (s.total | 0) : 0,
          war: s ? (s.war | 0) : 0,
          dip: s ? (s.diplomacy | 0) : 0,
          ple: s ? (s.plenty | 0) : 0,
          feasts: s && typeof s.feasts === 'number' ? (s.feasts | 0) : 0,
          nat: st.nationalDay || 0,
          pend: (st.pendingNational && st.pendingNational.shape) || '',
        });
      } catch (e) {}
      return r;
    };
  }

  // feast say-lines, full-length (attachProbe's capture truncates at 220 chars
  // and the spent kcal sit past it). Used by the honesty cross-check.
  W.feastLines = [];
  {
    const o = Game.say;
    if (typeof o === 'function') Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (/🍖 FEAST/.test(s)) W.feastLines.push({ day: dayOf(Game), line: s });
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  return W;
}

// feast honesty: match recorded feastEvents against the engine's own feast
// say-lines "(−X kcal from the pantry)". feastLines are the full-length
// captures from attachStandingProbe (attachProbe's say capture truncates).
// Returns {ok, matches, total} — binding >=99%.
function checkFeastHonesty(feastEvents, feastLines) {
  const parsed = [];
  for (const s of (feastLines || [])) {
    const m = /−([\d,]+) kcal from the pantry/.exec(String(s.line || ''));
    if (m) parsed.push({ day: s.day | 0, paid: parseInt(m[1].replace(/,/g, ''), 10) });
  }
  let matches = 0, total = 0;
  for (const f of (feastEvents || [])) {
    if (!f.ok) continue;
    total++;
    if (parsed.some(p => p.day === f.day && p.paid === f.paid)) matches++;
  }
  return { ok: total === 0 || matches / total >= 0.99, matches, total, parsed: parsed.length };
}

module.exports = { attachStandingProbe, checkFeastHonesty, dayOf };
