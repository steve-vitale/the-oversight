#!/usr/bin/env node
// sim-instrument-kit.js — shared sim-instrument helpers (gap Phase 2, W2).
//
// One module for the attribution / canonicalization / guardrail helpers that
// a dozen loop arms each re-invented (and each got slightly wrong). Pure
// functions, no game load, no I/O: sweep drivers and analyzers require it
// and call the function that matches their gap, instead of hand-rolling a
// new variant. Each function names the gap line(s) it closes in its comment.
//
// Gap lines closed (bundle W2-instruments, sim-findings lines):
//   123 villageEats dedupe            176 lineage ledgers
//   217 n-floor on new-death-mode     357 endReason over-other split
//   358 generic 'combat' cause        456 scholar-death kind
//   467 reposition schema             468 fight-seq-keyed join (no +/-1d)
//   482 telemetry-check key schema    515 death-cause set-diff canonical
//   517 death-tele duplication        525 death-tele kind pollution
//   530 phantom 'person' teles        543 non-roster combat teles
//   544 dehydration mapping           554/562 via=player mis-tag
//   760 win-path instrument           870 repro normalization (ms strip)
//   883 post-unlock death attribution (linkDeathToFight + attributeWindowDeaths)
//
// NOT closed here (honest limits, see docs/SIM-INSTRUMENTS.md):
//   104/112/151 determinism root cause (seed-88 class) — unknown source;
//     normalizeRepro only strips comparison artifacts, it does not fix runs.
//   110/118/119 perf + wall-clock budgets — need driver profiling, not a lib.
//   429/684 pre-existing suite failures — verification, not instrument work.
'use strict';

function normStr(v) {
  return String(v == null ? '' : v).trim().toLowerCase();
}

// ---- 544 + 515: canonical death cause -------------------------------------
// Label noise that broke set-diffs and classifiers: 'thirst' vs
// 'dehydration' are one cause; 'starved' vs 'starvation' are one cause.
// Canonical form is used for SET COMPARISONS ONLY; raw cause is preserved
// on every row so no information is destroyed.
const CAUSE_CANON = {
  thirst: 'dehydration',
  dehydrated: 'dehydration',
  dehydration: 'dehydration',
  starved: 'starvation',
  starving: 'starvation',
  starvation: 'starvation',
  killed: 'combat',
  slain: 'combat',
};
function canonicalDeathCause(raw) {
  const c = normStr(raw);
  if (!c || c === 'unknown') return 'unknown';
  return CAUSE_CANON[c] || c;
}

// ---- 358: generic 'combat' cause ------------------------------------------
// A raw 'combat' cause with no monster/killer is a flag, not an attribution:
// callers must attach killer info (linkDeathToFight) before counting it as
// a monster kill. isGenericCombat lets analyzers quarantine such rows.
function isGenericCombat(death) {
  const c = normStr(death && death.cause);
  if (c !== 'combat') return false;
  const killer = death && (death.killer || death.oppMid || death.monsterId || death.monster);
  return !killer;
}

// ---- 456: scholar-death kind ----------------------------------------------
// The 'player'-kind convention undercounts scholar deaths: a death whose
// victim IS the scholar is kind 'scholar' even when the tele kind says
// 'player' or is absent. Field-fight instruments must run this before
// counting, or scholar deaths vanish from the villager series.
function scholarKind(death, scholarVid) {
  if (!death) return null;
  const who = String(death.who || death.whoId || death.vid || '');
  if (scholarVid != null && who !== '' && who === String(scholarVid)) return 'scholar';
  return death.kind != null ? String(death.kind) : null;
}

// ---- 517 + 856-class: death-row dedupe ------------------------------------
// Engine double-emits (tele + registerDeath repair) inflate counts. Key on
// (day, who, kind, canonical cause, fight-seq when present). Fight-seq in
// the key is what keeps two same-day same-cause deaths to DIFFERENT
// victims/fights from collapsing, and collapses only true re-emits.
function deathRowKey(row) {
  const who = String(row.who || row.whoId || row.vid || row.name || '?');
  const kind = String(row.kind || 'person');
  const cause = canonicalDeathCause(row.cause);
  const seq = row.fightSeq != null ? String(row.fightSeq)
    : row.mid != null ? String(row.mid) : '';
  return [row.day | 0, who, kind, cause, seq].join('|');
}
function dedupeDeathRows(rows) {
  const seen = new Set();
  const out = [];
  for (const r of (rows || [])) {
    const k = deathRowKey(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

// ---- 525 + 530 + 543: person-death filter ---------------------------------
// Villager monster-KILLS (kind 'kill', victim a monster, or a row flagged
// killerOnly) polluted villager-death counts, and phantom 'person' teles
// from alien-players overcounted. A row counts as a person death only when:
//   - kind is person/villager/scholar (after scholarKind), AND
//   - it is not flagged as a kill/killerOnly row, AND
//   - when a roster set is supplied, the victim is (or was) on it.
// Without a roster set, the kind/killer flags still filter the pollution.
function isPersonDeath(row, rosterSet) {
  if (!row) return false;
  if (row.killerOnly === true || row.isKill === true) return false;
  const kind = normStr(row.kind);
  if (kind === 'kill' || kind === 'monster' || kind === 'monster-kill') return false;
  if (kind !== '' && kind !== 'person' && kind !== 'villager' && kind !== 'scholar' && kind !== 'player') return false;
  if (row.victimKind === 'monster' || row.victimIsMonster === true) return false;
  if (rosterSet && rosterSet.size) {
    const who = String(row.who || row.whoId || row.vid || '');
    if (who && !rosterSet.has(who)) return false;
  }
  return true;
}
function filterPersonDeaths(rows, rosterIds) {
  const set = rosterIds ? new Set(rosterIds.map(String)) : null;
  return (rows || []).filter(r => isPersonDeath(r, set));
}

// ---- 554 + 562: via mis-tag -----------------------------------------------
// waveKillLog rows tagged via='player' when the killer is NOT the scholar
// are villager kills. Key on `by` vs the scholar vid, never on the tag.
function resolveVia(row, scholarVid) {
  if (!row) return row;
  const out = Object.assign({}, row);
  const by = row.by != null ? String(row.by) : null;
  if (out.via === 'player' && by != null && scholarVid != null && by !== String(scholarVid)) {
    out.via = 'villager';
    out.viaCorrected = true;
  }
  return out;
}

// ---- 123: villageEats dedupe ----------------------------------------------
function dedupeVillageEats(rows) {
  const seen = new Set();
  const out = [];
  for (const r of (rows || [])) {
    const k = [String(r.vid || r.who || '?'), r.day | 0].join('|');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

// ---- 176: lineage-summed ledgers ------------------------------------------
// Per-vid cumulative ledgers freeze at scholar death; summing across the
// succession lineage (same lineageId, or chained successorOf) restores the
// story. Rows without a lineage key fall back to their own vid.
function lineageLedgerSum(rows) {
  const sums = {};
  for (const r of (rows || [])) {
    const key = String(r.lineageId || r.lineage || r.vid || r.who || '?');
    if (!sums[key]) sums[key] = { lineage: key, takes: 0, gives: 0, members: 0 };
    sums[key].takes += (r.takes | 0);
    sums[key].gives += (r.gives | 0);
    sums[key].members += 1;
  }
  return sums;
}

// ---- 217: new-death-mode guardrail with an n-floor --------------------------
// A "new death mode" fires only when the canonical cause is absent from the
// control set AND appears at least minEvents times in the armed set.
// minEvents default 3 (guardrail-review proposal: rare causes at n=8 seeds
// are noise, not a mode). This is a TOOL default, not a verdict: §14
// pre-registration still binds any given run; metric-review owns changes.
function deathCauseSetDiff(controlRows, armedRows, opts) {
  const minEvents = (opts && opts.minEvents != null) ? opts.minEvents : 3;
  const control = new Set((controlRows || []).map(r => canonicalDeathCause(r.cause)));
  const counts = {};
  for (const r of (armedRows || [])) {
    const c = canonicalDeathCause(r.cause);
    counts[c] = (counts[c] || 0) + 1;
  }
  const novel = [];
  for (const [cause, n] of Object.entries(counts)) {
    if (!control.has(cause) && n >= minEvents) novel.push({ cause, n });
  }
  novel.sort((a, b) => b.n - a.n);
  return { controlCauses: [...control].sort(), armedCounts: counts, novel, minEvents };
}

// ---- 468 + 883: fight-seq-keyed death attribution ---------------------------
// Join rule (replaces the +/-1d join that over-attributed across same-mid
// fights): in priority order —
//   1. fightSeq exact match (strong)
//   2. same-day fight whose party/victim includes the victim, or whose
//      monster matches the cause-named monster (strong)
//   3. cause-names-monster with no fight row (medium: killer named, no fight)
//   4. nearest PRIOR fight within 3 days (weak: flagged, never silent)
// Never a forward (+1d) match, never a same-mid different-day match.
// Returns { linked, basis, strength, fight } — basis 'none' when unlinked.
function linkDeathToFight(death, fights) {
  const list = fights || [];
  const day = death.day | 0;
  const who = String(death.who || death.whoId || death.vid || '');
  const causeName = normStr(death.cause);
  if (death.fightSeq != null) {
    const f = list.find(x => x && String(x.seq || x.fightSeq || '') === String(death.fightSeq));
    if (f) return { linked: true, basis: 'fightSeq', strength: 'strong', fight: f };
  }
  const sameDay = list.filter(x => x && (x.day | 0) === day);
  for (const f of sameDay) {
    const party = (f.party || f.victims || []).map(String);
    const mid = normStr(f.mid || f.monsterId || f.monster);
    if ((who && party.includes(who)) || (mid && causeName && causeName.includes(mid))) {
      return { linked: true, basis: 'same-day:victim-or-monster', strength: 'strong', fight: f };
    }
  }
  if (sameDay.length === 1 && !death.cause) {
    return { linked: true, basis: 'same-day:only-fight', strength: 'medium', fight: sameDay[0] };
  }
  // Cause-names-monster: the cause string itself names the killer (a kill
  // resolved outside the turn-based fight path). Killer named, fight absent.
  for (const f of list) {
    const mid = normStr(f.mid || f.monsterId || f.monster);
    if (mid && causeName === mid) {
      return { linked: true, basis: 'cause-names-monster', strength: 'medium', fight: f };
    }
  }
  // Nearest prior fight, flagged weak — documents the honest limit instead
  // of leaving the row silently unattributed or inventing a same-mid link.
  let prior = null;
  for (const f of list) {
    const fd = f.day | 0;
    if (fd <= day && day - fd <= 3 && (!prior || fd > (prior.day | 0))) prior = f;
  }
  if (prior) {
    return { linked: true, basis: 'nearest-prior-fight', strength: 'weak', fight: prior, dayDistance: day - (prior.day | 0) };
  }
  return { linked: false, basis: 'none', strength: null, fight: null };
}

// 883: post-unlock window attribution pass. deaths = postunlockDeaths rows
// (day/who/cause/fightBasis/nearestFight), fights = postunlockFights rows.
// Rows already linked (fightBasis set and not 'none') pass through; unlinked
// rows get the kit join, and rows whose only link is a recorded
// nearestFight are promoted to an explicit weak link instead of staying
// 'none'. Nothing is invented: a row with no fight in window stays
// unlinked with reason 'no-fight-in-window'.
function attributeWindowDeaths(deaths, fights) {
  const out = [];
  for (const d of (deaths || [])) {
    const basis = d.fightBasis != null ? String(d.fightBasis) : '';
    if (basis && basis !== 'none') {
      out.push(Object.assign({}, d, { attributed: true, linkStrength: 'prior' }));
      continue;
    }
    const joined = linkDeathToFight(d, fights || []);
    if (joined.linked) {
      out.push(Object.assign({}, d, {
        attributed: true, fightBasis: 'postpass:' + joined.basis,
        linkStrength: joined.strength, linkedFight: joined.fight || null,
        dayDistance: joined.dayDistance != null ? joined.dayDistance : null,
      }));
      continue;
    }
    if (d.nearestFight) {
      out.push(Object.assign({}, d, {
        attributed: true, fightBasis: 'postpass:nearest-fight-recorded',
        linkStrength: 'weak', linkedFight: d.nearestFight,
        dayDistance: d.nearestFight.dayDistance != null ? d.nearestFight.dayDistance : null,
      }));
      continue;
    }
    out.push(Object.assign({}, d, { attributed: false, linkStrength: null, unlinkedReason: 'no-fight-in-window' }));
  }
  const linked = out.filter(r => r.attributed).length;
  return {
    total: out.length, linked, unlinked: out.length - linked,
    byStrength: {
      strong: out.filter(r => r.linkStrength === 'strong').length,
      medium: out.filter(r => r.linkStrength === 'medium').length,
      weak: out.filter(r => r.linkStrength === 'weak').length,
      prior: out.filter(r => r.linkStrength === 'prior').length,
    },
    rows: out,
    unlinkedRows: out.filter(r => !r.attributed),
  };
}

// ---- 357: endReason split ---------------------------------------------------
// 'over-other' covers table wins AND the nomad road ending; analyzers must
// not infer wins from it. Split on the persisted win flags instead.
function splitEndReason(row) {
  const er = String(row.endReason || row.end || '');
  if (er !== 'over-other') return { endReason: er, inferred: null };
  if (row.won === true || row.tableWon === true || row.table === 'won') return { endReason: er, inferred: 'table-win' };
  if (row.nomad === true || row.roadEnding === true) return { endReason: er, inferred: 'nomad-road' };
  return { endReason: er, inferred: 'unknown-over-other' };
}

// ---- 760: win-path instrument ----------------------------------------------
// One extractor for seat + regional + ever-national, so wall metrics stop
// overcounting 'table reach' (invitation vs sitting) and stop dropping the
// regional/ever-national axes. Field-name fallbacks cover the instruments
// that recorded these under different keys.
function winPath(row) {
  const seat = row.seatTaken === true || row.satAtTable === true || row.seated === true;
  const invited = row.tableInvited === true || row.invited === true;
  const regional = row.regional === true || row.everRegional === true || (typeof row.regional === 'number' && row.regional > 0);
  const everNational = row.everNational === true || row.national === true || row.everNationalDays > 0;
  const path = row.winPath || row.tablePath || row.path || null;
  return { seat, invited, tableReach: invited || seat, seated: seat, regional, everNational, path };
}

// ---- 467: reposition schema -------------------------------------------------
// Movement-kind performances were unresolvable (no outcome/result). The
// canonical reposition row carries outcome + result + the waveKillLog join
// keys; analyzers reject rows missing them instead of silently pooling.
function repositionRow(r) {
  return {
    day: r.day | 0, who: String(r.who || r.whoId || ''),
    kind: 'reposition', outcome: r.outcome != null ? String(r.outcome) : null,
    result: r.result != null ? String(r.result) : null,
    fightSeq: r.fightSeq != null ? String(r.fightSeq) : null,
    waveKill: r.waveKill != null ? r.waveKill : null,
    valid: r.outcome != null && r.result != null,
  };
}

// ---- 870: repro normalization ------------------------------------------------
// Byte-reproduce checks must never fail on wall-clock diag.ms. Strip every
// ms-valued diagnostic key recursively; everything else compares exactly.
const MS_KEYS = new Set(['ms', 'wallMs', 'diagMs', 'elapsedMs', 'durationMs', 'wallClockMs']);
function normalizeRepro(v) {
  if (Array.isArray(v)) return v.map(normalizeRepro);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (MS_KEYS.has(k)) continue;
      out[k] = normalizeRepro(val);
    }
    return out;
  }
  return v;
}

// ---- 482: telemetry-check key schema ----------------------------------------
// Canonical per-seed keys, so telemetry-check stops expecting per-seed
// keys that only exist at summary level (national/table/wins/exiled are
// summary/flag fields, not per-seed counters).
const PER_SEED_KEYS = ['seed', 'policy', 'days', 'daysAlive', 'endReason', 'won',
  'deaths', 'deathCauses', 'wave', 'maxWave', 'national', 'table', 'exiled'];
const SUMMARY_ONLY_KEYS = ['wins', 'winRate', 'medianDays', 'nSeeds'];
function telemetryKeyKind(key) {
  if (PER_SEED_KEYS.includes(key)) return 'per-seed';
  if (SUMMARY_ONLY_KEYS.includes(key)) return 'summary-only';
  return 'unknown';
}

module.exports = {
  canonicalDeathCause, isGenericCombat, scholarKind,
  deathRowKey, dedupeDeathRows,
  isPersonDeath, filterPersonDeaths,
  resolveVia, dedupeVillageEats, lineageLedgerSum,
  deathCauseSetDiff, linkDeathToFight, attributeWindowDeaths,
  splitEndReason, winPath, repositionRow,
  normalizeRepro, telemetryKeyKind, PER_SEED_KEYS, SUMMARY_ONLY_KEYS,
};
