#!/usr/bin/env node
// scripts/holdloss-lib-20261015.js — NATIONAL HOLD LOSS-MODE DIAGNOSTIC
// (sim-holdloss, 2026-10-15, scale-onramp axis).
//
// INSTRUMENT-ONLY: every function here READS persisted run records and
// returns plain data. Nothing writes game state, consumes RNG, or calls
// Date.now(). Pure-classifier design: classifyDeathFamily + nationalLoss
// are total functions on plain inputs; the proof test
// (scripts/test-holdloss-20261015.js) pins every bucket.
//
// THE QUESTION: of the runs that reach national, HOW is the hold lost?
// Village-death is the modal loss (tracker: "national hold duration" is
// the wall's remaining face), but village-death is a mechanism-agnostic
// label. This instrument decomposes it into the NAMED loss modes the
// run is asking for:
//
//   combat            villager deaths in fights the village walked into
//                     (party combat, raids, raid-defense, ambush, contests)
//   monster           villagers killed BY monsters (cause 'monster',
//                     cause = a real monster name — expedition predation)
//   sickness          disease deaths (cause 'sickness', disease ids/names,
//                     food-poisoning symptom names) — DISEASES.md pools
//   starvation        cause 'starvation' (+ 'thirst', food-economy adjacent,
//                     sub-tallied, never silent)
//   wounds            'a wound that wouldn't close', 'injuries'
//   succession-chain  repeated succession shocks around the loss day
//                     (the tworung 'succession-collapse' death +/-3d, or
//                     >=3 succession beats within 14d of the loss day).
//                     r5: SUCCGRACE-era beats ("the bond is fraying", "grief
//                     delays the verdict", "the silence answered") count as
//                     succession-context; the count of grace-mediated beats
//                     is reported in the evidence (graceBeats).
//   wave-unlock       wave-4/5 unlock day within 10d of the loss day AND
//                     combat/monster deaths plural in the loss window —
//                     the unlock's escalation killed the village
//   tribute-collapse  r6: PROMOTED to a named mode (sim-tribcollapse
//                     2026-10-15; sim-findings #342, the open grief-leverage
//                     steve-call). The polity lost national rank while the
//                     village lived — NOT a village-death loss — AND
//                     Haven's belong-link arrears rose by >2,000 kcal in
//                     the 7 days before the loss day AND stood at >=2,000
//                     kcal at/after the loss AND a grief-leverage trail
//                     ("Tribute rises to ... kcal/week") appears in the
//                     beats within 14d of the loss AND the loss-window
//                     deaths are not starvation-plural. The mode where the
//                     village lives to pay (TRIBFLOOR-era: payments capped
//                     at the pantry floor, shortfalls posted as arrears,
//                     never forgiven) but the polity dissolves on the
//                     arrears — the BELONG road's characteristic loss.
//                     Falsifiable on the rows: scaleRows.links arrears
//                     deltas per link-kind, beat text, the rank path +
//                     endReason, the window family tally.
//   other-named       everything else, with the FULL evidence trail
//                     preserved (fam counts, exact causes, beats) — never
//                     silently bucketed
//
// Priority order for village-death losses (context first, then family):
//   1. wave-unlock   (the unlock is the newest, most specific event)
//   2. succession-chain (repeated leader deaths dissolve the polity)
//   3. family plurality (>=40% of loss-window villager deaths in one family)
//   4. tie / no-deaths -> 'other-named' with the trail
//
// Priority order for rank-fell-while-the-village-lived losses (B-branch):
//   1. link-break     (a recorded link break within 3d of the loss)
//   2. succession-exile (scholar.exiled fired)
//   3. tribute-collapse (the named mode above: belong-arrears spike +
//      level gate + grief-leverage trail + not-starved guard)
//   4. arrears-spike without the named mode's guards -> 'other-named'
//      WITH the trail (honest remainder, never silently bucketed)
//   5. deaths-in-3d -> succession-chain
//   6. nothing fires -> 'other-named' with the negative trail
//
// 'held-to-end' is not a loss (rank national at the horizon, village alive)
// and sits OUTSIDE the loss-mode denominator. The diagnostic GO metric is
// computed over national-reaching runs WITH a loss.
//
// DISEASE NAME AUTHORITY: docs/DISEASES.md (Steve's roster, two pools,
// never mixed). Sickness families use both pools' ids/names.
//
// MONSTER NAME AUTHORITY: the top-level `name` of each def in
// src/data/monsters.json (59 defs, waves 1-5). Cause strings from
// expedDeath (villager-agency.js) carry encDescribeMonster output which
// can be a descriptor, not a name — those fall to other-named with the
// exact string preserved; the suite report lists the top other-named
// causes so a descriptor pattern can be promoted honestly later.
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. cause -> family
// ---------------------------------------------------------------------------

const DISEASE_IDS = [
  'gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles',
  'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw',
  'flockmind', 'eurika', 'east_nile', 'lemons',
];
const DISEASE_NAMES = [
  'gut rot', 'trichinosis', 'fever', 'lockjaw', 'wound fever', 'trembles',
  'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness maw',
  'flockmind', 'eurika', 'east nile', 'lemons',
];
const SICK_SYMPTOMS = [
  'food poisoning', 'bad belly', 'spoiled gut', 'poisoned',
];

// Monster-name corpus: built from src/data/monsters.json at load (the file
// is canon-adjacent data, not game code). Two lists, both lowercased:
//   - top-level `name` (59 defs, waves 1-5) — the known-true names
//     (Highbeam Deer, Bulldozer...)
//   - top-level `unknown` (59 descriptors) — what an unnamed monster looks
//     like before the village names it ("a dog-shaped silence at the
//     treeline"). expedDeath carries encDescribeMonster output, which is
//     one of these two forms.
let MONSTER_NAMES = [];
let MONSTER_DESCRIPTORS = [];
function loadMonsterNames(dataDir) {
  MONSTER_NAMES = []; MONSTER_DESCRIPTORS = [];
  try {
    const dir = dataDir || path.join(__dirname, '..', 'src', 'data');
    const defs = JSON.parse(fs.readFileSync(path.join(dir, 'monsters.json'), 'utf8'));
    for (const m of defs) {
      if (m && typeof m.name === 'string' && m.name.trim()) {
        MONSTER_NAMES.push(m.name.trim().toLowerCase());
      }
      if (m && typeof m.unknown === 'string' && m.unknown.trim()) {
        MONSTER_DESCRIPTORS.push(m.unknown.trim().toLowerCase());
      }
    }
  } catch (e) { /* corpora stay empty; everything falls to other-named honestly */ }
  return MONSTER_NAMES;
}
loadMonsterNames();

// classifyDeathFamily(cause): the cause-string -> family mapping, with the
// exact cause preserved. Returns {family, raw}. family is one of
// 'combat' | 'monster' | 'sickness' | 'starvation' | 'wounds' | null
// (null = unnameable -> caller keeps the raw cause under 'other-named').
function classifyDeathFamily(cause) {
  const raw = String(cause == null ? '' : cause).slice(0, 120);
  const c = raw.trim().toLowerCase();
  if (!c) return { family: null, raw };
  // sickness: the disease verb first (hurtVillager(vid, dmg, 'sickness')),
  // then disease ids ('gutrot', 'east_nile'...), then canon names, then
  // symptom names the engine passes through.
  if (c === 'sickness' ||
      DISEASE_IDS.indexOf(c) !== -1 ||
      DISEASE_NAMES.indexOf(c) !== -1 ||
      SICK_SYMPTOMS.some(s => c.indexOf(s) !== -1)) {
    return { family: 'sickness', raw };
  }
  // starvation: 'starvation' plus 'thirst' (food/water economy deaths — the
  // thirst sub-cause is tallied separately by the caller, never merged silently).
  if (/starv/.test(c) || c === 'thirst' || /dehydrat/.test(c)) {
    return { family: 'starvation', raw };
  }
  // wounds: 'a wound that wouldn't close', 'injuries'.
  if (/wound/.test(c) || /injur/.test(c)) {
    return { family: 'wounds', raw };
  }
  // monster: the field-fight/expedition 'monster' hurt verb, alien players,
  // a death whose cause IS a monster name (expedDeath), or an unnamed
  // monster's descriptor (the `unknown` field — a pre-naming kill).
  if (c === 'monster' || c === 'alien' ||
      MONSTER_NAMES.indexOf(c) !== -1 || MONSTER_DESCRIPTORS.indexOf(c) !== -1) {
    return { family: 'monster', raw };
  }
  // combat: fights the village walked into — the blow-by-blow 'combat'
  // verb (includes field-fight deaths vs monsters; that limitation is
  // documented in the evidence file), raids (village-on-village, per
  // villageAgency.js + hierarchy.js), ambushes, contests.
  if (/combat/.test(c) ||
      /^ambush$/i.test(raw) ||
      /^split-fight/i.test(raw) ||
      /^raid(-defense)?$/i.test(raw) ||
      /^aid-runner$/i.test(raw) ||
      /^the wild$/i.test(raw) ||
      /^contest$/i.test(raw) ||
      /^(hunting|emergency hunt|experiment|expedition)$/i.test(raw)) {
    return { family: 'combat', raw };
  }
  return { family: null, raw };
}

// ---------------------------------------------------------------------------
// 2. national hold + loss-mode attribution
// ---------------------------------------------------------------------------

const NATL = { national: true, global: true };
const DEATH_END = /village-dead|village-lost|pop-zero/;
const PERSON_KIND = /player|scholar|villager|person/i;
// r5 (sim-holdloss2 2026-10-15): SUCCGRACE stages an answerable
// renegotiation beat for sub-bar links at the funeral — its text ("the
// bond is fraying", "grief delays the verdict", "the silence answered") is
// succession-context and counts toward the chain threshold. Without these
// the instrument would go blind on grace-mediated chains (the old "dead
// hold no treaties" line never fires for them). "silence answered" is the
// renegotiation expiry ("Seven days of silence, and the silence answered
// for Haven") — it appears ONLY in hierarchy.js's expiry path, no false
// positives in the corpus. "grief delays the verdict" also fires on the
// pre-existing young-link grace beat (succession-context, honest to count).
const SUCC_BEAT = /dead hold no treaties|realm came apart|succession|bond is fraying|silence answered|grief delays the verdict/i;
const GRACE_BEAT = /bond is fraying|silence answered|grief delays the verdict/i;
const WAVE_BEAT = /wave (4|5)|fourth draft|fifth draft|mirror draft/i;

function num(x, d) { const n = Number(x); return Number.isFinite(n) ? n : (d == null ? 0 : d); }

// sumArrears(row, kind): home-link arrears for the spike check. kind
// restricts to one link direction — 'belong' for the tribute-collapse
// mode (Haven pays; the old-link x1.5 grief-leverage only fires when
// Haven is the subordinate — hierarchy.js successionCrisis). No kind =
// all links (the r5 behavior, kept for the honest-remainder trail).
function sumArrears(row, kind) {
  try {
    return (row.links || []).reduce((t, l) => t + ((kind && l.kind !== kind) ? 0 : num(l.arrears, 0)), 0);
  } catch (e) { return 0; }
}
// arrearsSpike(scaleRows, lossDay, kind): home-link arrears rose by
// >2,000 kcal in the 7 days before the loss day. Returns
// {before, after, lossDay, trail} or null. The 2,000 bar separates the
// ratchet-driven collapse from thin-week noise: the BELONG
// good-standing bar is arrears===0 (hierarchy.js polityOf), so the
// DISSOLVE fires on any positive arrears — the mode's bar is the spike,
// which is what the s44 tribute-collapse showed (0 -> 37,970).
function arrearsSpike(scaleRows, lossDay, kind) {
  try {
    const win = (scaleRows || []).filter(r => r.day >= lossDay - 7 && r.day <= lossDay && r.links);
    if (win.length < 2) return null;
    const before = sumArrears(win[0], kind), after = sumArrears(win[win.length - 1], kind);
    if (after - before > 2000) return {
      before: Math.round(before), after: Math.round(after), lossDay,
      trail: `home-link arrears ${Math.round(before)} -> ${Math.round(after)} kcal in the 7d before loss day ${lossDay}` + (kind ? ` (kind=${kind})` : ''),
    };
    return null;
  } catch (e) { return null; }
}

// The grief-leverage ratchet line (old-link succession, Haven the
// subordinate — hierarchy.js successionCrisis, verbatim): "With Haven
// grieving, Thornfield installs their own speaker at the table. Tribute
// rises to 25,313 kcal/week. Grief is leverage, and they know it." The
// SUCCGRACE-era lapsed variant rides the same "tribute rises to" line
// ("Grief became leverage, and they knew it would") — one regex covers
// both. This is the x1.5 compounding whose unpaid balances post as the
// arrears the polity dissolves on.
const GRIEF_LEVERAGE_RE = /tribute rises to/i;
// The TRIBFLOOR floor-cap line (the "village lives to pay" evidence):
// "tribute takes 12,645 of 25,313 kcal and no more. What isn't paid rides
// as arrears; the village eats first."
const TRIBFLOOR_CAP_RE = /tribute takes .* of .* no more/i;

function griefLeverageTrail(beats, lossDay) {
  try {
    return (beats || [])
      .filter(b => GRIEF_LEVERAGE_RE.test(String(b.text || '')) && Math.abs(num(b.day, 0) - lossDay) <= 14)
      .map(b => `d${b.day} "${String(b.text).slice(0, 110)}"`);
  } catch (e) { return []; }
}
function tribfloorCaps(beats, lossDay) {
  try {
    return (beats || [])
      .filter(b => TRIBFLOOR_CAP_RE.test(String(b.text || '')) && Math.abs(num(b.day, 0) - lossDay) <= 14)
      .map(b => `d${b.day} "${String(b.text).slice(0, 110)}"`);
  } catch (e) { return []; }
}

// tributeCollapse(rec, loss): the named-mode detector. rec is the full
// persisted record; loss is the in-progress attribution from nationalLoss
// (carries lossDay and famCounts). Returns {fires, evidence[]} or
// {fires:false, why, spike?, trail?} describing WHY not — the guard
// failures stay auditable, never silent.
//
// The definition (falsifiable on the rows):
//   1. B-branch loss (polity lost national rank while the village lived —
//      NOT a village-death loss; the caller guarantees this).
//   2. Haven's BELONG-link arrears rose by >2,000 kcal in the 7 days
//      before the loss day AND stood at >=2,000 kcal at/after the loss
//      (the spike + the level gate at the same X=2,000 bar — a spike
//      paid back down before the loss is not this mode).
//   3. A grief-leverage trail in the beats within 14d of the loss: at
//      least one "Tribute rises to ... kcal/week" succession-leverage
//      line (the x1.5 ratchet whose unpaid balances posted as the
//      arrears).
//   4. The loss-window deaths are not starvation-plural (<40% starvation
//      family): the village lived to pay. A starvation-plural window is
//      the "starve paying" story — TRIBFLOOR did not hold — not this
//      mode.
// B-branch priority (link-break, exile) is applied by the caller BEFORE
// this detector; deaths-in-3d succession is checked AFTER it.
function tributeCollapse(rec, loss) {
  const ld = loss.lossDay;
  const spike = arrearsSpike(rec.scaleRows, ld, 'belong');
  if (!spike) return { fires: false, why: 'no belong-arrears spike (>2,000 kcal/7d)' };
  if (spike.after < 2000) {
    return { fires: false, why: `belong arrears paid back down before the loss (after=${spike.after})`, spike };
  }
  const trail = griefLeverageTrail(rec.beats, ld);
  if (!trail.length) {
    return { fires: false, why: 'arrears spike without a grief-leverage trail', spike };
  }
  const fams = loss.famCounts || {};
  const total = Object.keys(fams).reduce((t, f) => t + fams[f], 0);
  const starv = fams['starvation'] || 0;
  if (total > 0 && starv / total >= 0.4) {
    return { fires: false, why: `starvation-plural window (${starv}/${total}) — starve-paying, not tribute-collapse`, spike, trail };
  }
  const caps = tribfloorCaps(rec.beats, ld);
  const ev = [
    `belong-link arrears ${spike.before.toLocaleString()} -> ${spike.after.toLocaleString()} kcal in the 7d before loss day ${ld} (level gate >=2,000 holds)`,
    `grief-leverage trail (${trail.length} ratchet line${trail.length > 1 ? 's' : ''} within 14d): ` + trail.slice(0, 3).join('; '),
  ];
  if (caps.length) {
    ev.push(`TRIBFLOOR held the payments (${caps.length} floor-cap${caps.length > 1 ? 's' : ''} in the window): ` + caps.slice(0, 3).join('; '));
  } else {
    ev.push('no TRIBFLOOR floor-cap lines in the window — payments were not floor-capped here');
  }
  ev.push(`loss-window deaths ${total} (tally ${JSON.stringify(fams)}) — not starvation-plural; the village lived to pay but the polity dissolved on the arrears`);
  return { fires: true, evidence: ev, spike, trail, caps };
}

// nationalLoss(rec): full hold-duration + loss-mode attribution for one
// national-reaching run's persisted record. rec fields:
//   {seed, policy, days, endReason, won, scaleRows, foodRows, standingRows,
//    deaths, beats, waveUnlockDays:{4,5}, breaks, exiledEver, exiledDay}
function nationalLoss(rec) {
  rec = rec || {};
  const scaleRows = rec.scaleRows || [];
  const deaths = rec.deaths || [];
  const beats = rec.beats || [];
  const natRows = scaleRows.filter(r => NATL[r.rank]);
  if (!natRows.length) return { reached: false };
  const firstDay = Math.min.apply(null, natRows.map(r => r.day));
  const lastNatDay = Math.max.apply(null, natRows.map(r => r.day));
  const holdDays = natRows.length;
  const lastRow = scaleRows[scaleRows.length - 1] || {};
  const er = String(rec.endReason || '?');
  const fDay = num(rec.days, -1);
  const diedAtEnd = DEATH_END.test(er);
  const heldToEnd = !!NATL[lastRow.rank] && !diedAtEnd;
  const out = {
    reached: true, firstDay, lastNatDay, holdDays, won: !!rec.won,
    endState: heldToEnd ? 'held-to-end' : 'lost',
    lossDay: heldToEnd ? null : (NATL[lastRow.rank] ? fDay : lastNatDay + 1),
    lossMode: heldToEnd ? 'held-to-end' : 'unattributed',
    lossEvidence: [],
    windowDeaths: [],
    famCounts: {},
    subCauses: {},
  };
  if (heldToEnd) return out;
  const ld = out.lossDay;
  const near = (d, w) => Math.abs(num(d, 0) - ld) <= (w == null ? 3 : w);
  // The loss window: the 20 days ending on the loss. The window END extends
  // to finalDay+1 for village-death losses: the harness can record deaths on
  // the day after the returned days count (gday off-by-one observed in
  // sim-holdloss s77: daysRan=91, a starvation death recorded d92), and a
  // death on the village's last day must never be excluded by bookkeeping.
  const winEnd = diedAtEnd ? Math.max(ld, fDay) + 1 : ld;
  const wd = deaths.filter(d => PERSON_KIND.test(d.kind || '') && d.day >= ld - 20 && d.day <= winEnd);
  out.windowDeaths = wd.map(d => {
    const f = classifyDeathFamily(d.cause);
    return { day: d.day, name: d.name, cause: d.cause, family: f.family || 'other-named' };
  });
  const fams = {};
  const subs = {};
  for (const w of out.windowDeaths) {
    fams[w.family] = (fams[w.family] || 0) + 1;
    if (w.family === 'starvation' && /thirst|dehydrat/i.test(String(w.cause))) {
      subs.thirst = (subs.thirst || 0) + 1;
    } else {
      subs[w.cause] = (subs[w.cause] || 0) + 1;
    }
  }
  out.famCounts = fams;
  out.subCauses = subs;

  const succBeats = beats.filter(b => SUCC_BEAT.test(String(b.text || '')) && Math.abs(num(b.day, 0) - ld) <= 14);
  // r5: grace-mediated shocks — how many of the chain's beats went through
  // the SUCCGRACE renegotiation staging/expiry instead of the old
  // "dead hold no treaties" line. Kept as evidence, not a threshold.
  const graceBeats = succBeats.filter(b => GRACE_BEAT.test(String(b.text || '')));
  // 'dead hold no treaties' fires per leader death (sim-succpolity: 12
  // leader deaths -> 12 identical beats), so >=3 succession beats in the
  // loss window = a repeated succession shock chain.
  const succChain = succBeats.length >= 3;
  const linkBreaks = (rec.breaks || []).filter(b => near(b.day, 3));
  const unlockNear = [4, 5].filter(w => rec.waveUnlockDays && rec.waveUnlockDays[w] != null &&
    Math.abs(num(rec.waveUnlockDays[w], 0) - ld) <= 10);

  // A. the village died at/losing national — the modal loss; decompose it.
  const villageDiedHolding = (diedAtEnd && NATL[lastRow.rank]) || (diedAtEnd && Math.abs(fDay - ld) <= 5);
  if (villageDiedHolding) {
    // A1. wave-unlock: a wave-4/5 unlock within 10d + combat/monster deaths
    //     plural in the window — the escalation killed the village.
    const cmDeaths = wd.filter(d => {
      const f = classifyDeathFamily(d.cause);
      return f.family === 'combat' || f.family === 'monster';
    });
    if (unlockNear.length && cmDeaths.length >= 2) {
      out.lossMode = 'wave-unlock';
      out.lossEvidence = [
        `wave-${unlockNear.join(',wave-')} unlock day ${unlockNear.map(w => rec.waveUnlockDays[w]).join(',')} within 10d of loss day ${ld}`,
        `${cmDeaths.length}/${wd.length} loss-window deaths are combat/monster: ` +
        cmDeaths.slice(0, 6).map(d => `d${d.day} ${d.name} (${d.cause})`).join('; '),
      ];
      return out;
    }
    // A2. succession-chain: repeated succession shocks around the loss.
    if (succChain) {
      out.lossMode = 'succession-chain';
      out.graceBeats = graceBeats.length;
      out.lossEvidence = [
        `${succBeats.length} succession beats within 14d of loss day ${ld} (${graceBeats.length} grace-mediated): ` +
        succBeats.slice(0, 4).map(b => `d${b.day} "${String(b.text).slice(0, 80)}"`).join('; '),
        `${wd.length} person deaths in the loss window (fam tally ${JSON.stringify(fams)})`,
      ];
      return out;
    }
    // A3. family plurality: >=40% of loss-window deaths in one family.
    const famNames = Object.keys(fams).filter(f => f !== 'other-named');
    const total = wd.length;
    if (total > 0) {
      const ranked = famNames.map(f => [f, fams[f]]).sort((a, b) => b[1] - a[1]);
      const top = ranked[0];
      const second = ranked[1] ? ranked[1][1] : 0;
      if (top && top[1] / total >= 0.4 && top[1] > second) {
        out.lossMode = top[0];
        out.lossEvidence = [
          `${top[1]}/${total} loss-window deaths are ${top[0]}-family: ` +
          out.windowDeaths.filter(w => w.family === top[0]).slice(0, 8)
            .map(w => `d${w.day} ${w.name} (${w.cause})`).join('; '),
          `full window tally: ${JSON.stringify(fams)}`,
        ];
        return out;
      }
    }
    // A4. tie / no-deaths / no-family -> other-named WITH the trail.
    out.lossMode = 'other-named';
    out.lossEvidence = total === 0
      ? [`no villager deaths recorded in the loss window d${ld - 20}-d${ld} (endReason=${er})`]
      : [`no family reaches 40% plurality in the loss window (tally ${JSON.stringify(fams)})`,
         `exact causes: ${JSON.stringify(subs)}`,
         out.windowDeaths.slice(0, 8).map(w => `d${w.day} ${w.name} (${w.cause} -> ${w.family})`).join('; ')];
    return out;
  }

  // B. the rank fell while the village lived — the tworung mechanisms.
  if (linkBreaks.length) {
    out.lossMode = 'other-named';
    out.lossEvidence = ['link-break: ' + linkBreaks.map(b => `d${b.day} link=${b.link}`).join('; ')];
    return out;
  }
  if (rec.exiledEver) {
    out.lossMode = 'other-named';
    out.lossEvidence = [`succession-exile: scholar.exiled fired (day ${rec.exiledDay != null ? rec.exiledDay : '?'})`];
    return out;
  }
  // r6: tribute-collapse is a NAMED mode now (see the detector above).
  // The r5 all-links arrearsSpike stays as the honest-remainder trail when
  // the named mode's guards don't fire — a spike that isn't
  // tribute-collapse by the definition is still a named mechanism, never
  // silently bucketed.
  const tc = tributeCollapse(rec, out);
  if (tc.fires) {
    out.lossMode = 'tribute-collapse';
    out.lossEvidence = tc.evidence;
    return out;
  }
  if (tc.spike) {
    out.lossMode = 'other-named';
    out.lossEvidence = [`arrears-spike, not tribute-collapse (${tc.why}): ${tc.spike.trail}`];
    return out;
  }
  const anySpike = arrearsSpike(scaleRows, ld);
  if (anySpike) {
    out.lossMode = 'other-named';
    out.lossEvidence = ['arrears-spike on non-belong links: ' + anySpike.trail + ' — honest remainder'];
    return out;
  }
  const dd = wd.filter(d => near(d.day, 3));
  if (dd.length) {
    out.lossMode = 'succession-chain';
    out.lossEvidence = dd.slice(0, 6).map(d => `d${d.day} ${d.name} died (${String(d.cause || '?').slice(0, 60)}) — polity dissolved on succession`);
    return out;
  }
  out.lossMode = 'other-named';
  out.lossEvidence = [`no mechanism fires within 3d of loss day ${ld} (breaks ${linkBreaks.length}, exiled ${!!rec.exiledEver}, arrears-spike ${!!(tc.spike || anySpike)}, deaths-in-3d ${dd.length})`];
  return out;
}

// holdBucket(holdDays): the hold-duration distribution bins.
function holdBucket(holdDays) {
  const h = num(holdDays, 0);
  if (h <= 10) return '1-10d';
  if (h <= 30) return '11-30d';
  if (h <= 60) return '31-60d';
  if (h <= 120) return '61-120d';
  return '121d+';
}

// last20Narrative(rec, loss): the loss narrative — what the last 20 days
// looked like, in plain words + the raw rows for audit.
function last20Narrative(rec, loss) {
  rec = rec || {};
  loss = loss || {};
  const ld = loss.lossDay != null ? loss.lossDay : num(rec.days, 0);
  // same window-end rule as nationalLoss (see there): final-day deaths count.
  const diedAtEnd = /village-dead|village-lost|pop-zero/.test(String(rec.endReason || ''));
  const winEnd = diedAtEnd ? Math.max(ld, num(rec.days, 0)) + 1 : ld;
  const d0 = ld - 20;
  const food = (rec.foodRows || []).filter(r => r.day >= d0 && r.day <= winEnd);
  const scale = (rec.scaleRows || []).filter(r => r.day >= d0 && r.day <= winEnd);
  const beats = (rec.beats || []).filter(b => b.day >= d0 && b.day <= winEnd);
  const deaths = (rec.deaths || []).filter(d => d.day >= d0 && d.day <= winEnd);
  const lines = [];
  lines.push(`national hold: first day ${loss.firstDay}, last national day ${loss.lastNatDay}, ${loss.holdDays} hold-days; loss day ${ld}, loss mode ${loss.lossMode}.`);
  if (food.length) {
    const f0 = food[0], f1 = food[food.length - 1];
    const minPantry = Math.min.apply(null, food.map(r => num(r.pantryDays, 0)));
    const minAte = Math.min.apply(null, food.map(r => num(r.ateShare, 100)));
    lines.push(`roster: ${num(f0.pop, 0)} -> ${num(f1.pop, 0)} villagers; pantry ${num(f0.pantryDays, 0).toFixed(1)}d -> ${num(f1.pantryDays, 0).toFixed(1)}d (window min ${minPantry.toFixed(1)}d); ate-share min ${minAte.toFixed(0)}%.`);
  }
  if (scale.length) {
    const path = scale.filter((_, i) => i % 4 === 0).map(r => String(r.rank || '?')[0]).join('');
    lines.push(`rank path (every 4d): ${path}`);
  }
  if (loss.waveUnlockDays) {
    const u = [4, 5].filter(w => loss.waveUnlockDays[w] != null && Math.abs(loss.waveUnlockDays[w] - ld) <= 20);
    if (u.length) lines.push(`wave unlocks near the loss: ${u.map(w => `wave-${w} d${loss.waveUnlockDays[w]}`).join(', ')}.`);
  }
  if (deaths.length) {
    lines.push(`${deaths.length} deaths in the last 20d:`);
    for (const d of deaths.slice(0, 20)) {
      const f = classifyDeathFamily(d.cause);
      lines.push(`  d${d.day} ${d.name} (${d.kind}) — ${d.cause} [${f.family || 'unnameable'}]`);
    }
  } else {
    lines.push('no villager deaths recorded in the last 20d.');
  }
  const sig = beats.filter(b => SUCC_BEAT.test(String(b.text || '')) || WAVE_BEAT.test(String(b.text || '')) ||
    /died|dead|starv|realm|treaty|table|national/i.test(String(b.text || '')));
  if (sig.length) {
    lines.push(`${sig.length} signal beats in the last 20d (showing first 12):`);
    for (const b of sig.slice(0, 12)) lines.push(`  d${b.day} ${String(b.text).slice(0, 140)}`);
  }
  return {
    text: lines.join('\n'),
    rows: { food: food.slice(0, 25), scale: scale.slice(0, 25), deaths: deaths.slice(0, 25), beats: sig.slice(0, 25) },
  };
}

module.exports = {
  classifyDeathFamily, nationalLoss, holdBucket, last20Narrative,
  tributeCollapse, arrearsSpike, griefLeverageTrail, sumArrears,
  loadMonsterNames, MONSTER_NAMES: () => MONSTER_NAMES.slice(),
  MONSTER_DESCRIPTORS: () => MONSTER_DESCRIPTORS.slice(),
  DISEASE_IDS, DISEASE_NAMES,
};
