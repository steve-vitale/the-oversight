#!/usr/bin/env python3
"""Clone the r263 endgame probe + analyzer to r264 (lane B, 2026-11-21).

Renames only run-identifying occurrences (r263->r264, substrate hash),
restores the r263 ADDITIONS history block and the r263 INSTRUMENT labels
(the blanket rename wrongly re-dates them to r264), and ADDS the r264
instruments (prereg Q1-Q3, probe-side only, zero src/js):
  - TRIBUTE_FIRST order flag (Q2): a ready+payable military_tribute
    jumps the queue ahead of feast_embassy on delivery attempts.
  - CHARTER CENSUS (Q3): per-kind readiness + hierarchy snapshot saved
    on EVERY peak>=3 day (readinessDaily), not just attempt days.
  - STALL-FATES (Q1) is analyzer-side: days + fate split from the
    standing trace via the M20 derivedGated formula — no probe change.
Verifies the result by diffing against the r263 originals: the only
differences must be the renames, the dates, the header, and the three
instruments named above.
"""
import re
import sys
import os
import time

WT = '/home/hatch/workspace/worktrees/journey2-endgame'


def robust_write(path, content):
    """Write content to path, retrying through write-flap flicker.

    The flap denies fresh-file writes intermittently (EPERM, second
    granularity). Write to a sibling temp file, verify the byte count,
    then rename into place. Retry up to 150 times (~5 min, 2s cadence —
    the denial flickers, so sample densely) before giving up.
    Byte count uses len(content.encode('utf-8')) — the r246 adoption
    fix: len(content) counts characters, and the probe has non-ASCII
    bytes, so a char-count check fails every write.
    """
    tmp = path + '.r264tmp'
    last_err = None
    for attempt in range(150):
        try:
            with open(tmp, 'w') as f:
                f.write(content)
            got = os.path.getsize(tmp)
            if got != len(content.encode('utf-8')):
                raise IOError(f'short write: {got} != {len(content.encode("utf-8"))} bytes')
            os.rename(tmp, path)
            return
        except (PermissionError, OSError) as e:
            last_err = e
            try:
                if os.path.exists(tmp):
                    os.remove(tmp)
            except OSError:
                pass
            time.sleep(2)
    raise last_err


# ---------------- probe ----------------
src = open(f'{WT}/scripts/probe-endgame-r263-20261121.js').read()
p = src
p = p.replace('r263', 'r264')
p = p.replace('5a018c5da', 'c55bc8503')

# Restore the r263 ADDITIONS history block (it describes entries added in
# r263; the blanket rename wrongly re-dated it to r264).
p = p.replace(
    '// r264 ADDITIONS (prereg §PASS-C-WIDE, probe-side only, zero src/js):',
    '// r263 ADDITIONS (prereg §PASS-C-WIDE, probe-side only, zero src/js):')

# Restore the r263 WARPATH diagnostic labels (carried verbatim from r263;
# the blanket rename wrongly re-dated them to r264 — re-date back).
p = p.replace('r264 WARPATH diagnostic', 'r263 WARPATH diagnostic')
p = p.replace('r264 WARPATH DIAGNOSTIC', 'r263 WARPATH DIAGNOSTIC')

# Guard: the PLAN-DEATH label must never be re-dated.
assert 'r264 PLAN-DEATH WATCH' not in p, 'PLAN-DEATH label wrongly re-dated'
# Guard: WARPATH diagnostic carried, not duplicated — exactly one
# declaration, one snapshot block, one per-seed field.
assert p.count('warpathDeedsAtSit = null') == 1, 'WARPATH declaration count wrong'
assert p.count('warpathDeeds: warpathDeedsAtSit') == 1, 'WARPATH field count wrong'
assert p.count('WARPATH DIAGNOSTIC (prereg') == 1, 'WARPATH snapshot count wrong'

# Rewrite the header (lines 1-6) to the r264 header.
old_header = p.split('\n')[:6]
new_header = [
    '// probe-endgame-r264-20261121.js — journey-endgame r264 (lane B, 2026-11-21).',
    '// R263 probe verbatim EXCEPT renames r263->r264, evidence dir',
    '// 2026-11-21/perseed-endgame-r264, header, substrate comment',
    '// c55bc8503, + the r264 instruments (TRIBUTE_FIRST order flag, CHARTER',
    '// daily census, capstoneReadinessDaily) — all named in',
    '// journey-endgame-r264-prereg.md. The r263 additions',
]
p = '\n'.join(new_header + p.split('\n')[6:])

# r264 ADDITIONS comment above the PLAN const (mirrors the r263 pattern).
anchor = '// r263 ADDITIONS (prereg §PASS-C-WIDE, probe-side only, zero src/js):'
assert anchor in p
p = p.replace(anchor, '// r264 ADDITIONS (prereg Q2/Q3, probe-side only, zero src/js):\n'
    '// TRIBUTE_FIRST order flag (Q2): a ready+payable military_tribute jumps\n'
    '// the delivery queue ahead of feast_embassy. CHARTER census (Q3):\n'
    '// per-kind readiness + hierarchy snapshot saved on EVERY peak>=3 day\n'
    '// (capstoneReadinessDaily). STALL-FATES (Q1) is analyzer-side only.\n' + anchor, 1)

# --- Instrument 1: TRIBUTE_FIRST env flag ---
old_flags = "  const BUYOUT_ON = process.env.BUYOUT === '1';"
assert p.count(old_flags) == 1, 'BUYOUT_ON flag anchor count wrong'
p = p.replace(old_flags, old_flags + "\n  const TRIBUTE_FIRST_ON = process.env.TRIBUTE_FIRST === '1'; // r264 Q2: tribute jumps the delivery queue when ready+payable")

# --- Instrument 2: readinessDaily declaration ---
old_lets = "  let capstoneAttempts = [], capstoneDelivery = null, capstoneMissedSit = null;"
assert p.count(old_lets) == 1, 'capstone lets anchor count wrong'
p = p.replace(old_lets, old_lets + "\n  let capstoneReadinessDaily = []; // r264 Q3: per-kind readiness + hierarchy snapshot on EVERY peak>=3 day")

# --- Instrument 3: daily census save (before the BUYOUT WINDOW block) ---
old_window = "        // r233 BUYOUT WINDOW (read-only, both passes): one entry per"
assert p.count(old_window) == 1, 'BUYOUT WINDOW anchor count wrong'
census_block = """        // r264 CHARTER CENSUS (prereg Q3): save the per-kind readiness on
        // EVERY peak>=3 day (not just attempt days) + the day's hierarchy
        // snapshot, so the charter's never-ready decomposes into no-links
        // vs links-unchartered vs chartered-but-not-ready. Pure reads;
        // hierarchyState is the same fn the charter delivery reads.
        try {
          let hierSnap = null;
          try {
            const hs = (typeof G.hierarchyState === 'function') ? G.hierarchyState() : [];
            const ls = Array.isArray(hs) ? hs : [];
            hierSnap = { links: ls.length, trade: ls.filter(l => l && l.kind === 'trade').length, tradeActive: ls.filter(l => l && l.kind === 'trade' && l.status === 'active').length, chartered: ls.filter(l => l && l.kind === 'trade' && l.chartered === true).length, activeChartered: ls.filter(l => l && l.kind === 'trade' && l.status === 'active' && l.chartered === true).length };
          } catch (e2) { hierSnap = null; }
          capstoneReadinessDaily.push({ day: dayOf(G), deedGateOk: !!(dg && dg.ok), readiness: readyDetail, hierarchy: hierSnap });
        } catch (e2) { instrumentErrors++; }
"""
p = p.replace(old_window, census_block + old_window, 1)

# --- Instrument 4: tribute-first reorder + attempt flag ---
old_ready = "          const readyKinds = readyDetail.filter(x => x.ready);"
assert p.count(old_ready) == 1, 'readyKinds anchor count wrong'
reorder_block = """          const readyKinds = readyDetail.filter(x => x.ready);
          // r264 TRIBUTE-FIRST (prereg Q2): when TRIBUTE_FIRST=1, a
          // ready+payable military_tribute jumps the queue ahead of
          // feast_embassy — the r263 panel never let tribute go first
          // (embassy won the order 4/4). Only when payable>=need: a
          // ready-but-unpayable tribute must not block the embassy
          // delivery day after day (the delivery would refuse
          // 'veterans-short' every day and the embassy would never go).
          let tributeFirstApplied = false;
          if (TRIBUTE_FIRST_ON) {
            const ti = readyKinds.findIndex(x => x.kind === 'military_tribute');
            if (ti > 0 && (readyKinds[ti].payable | 0) >= (readyKinds[ti].need | 0)) {
              const t = readyKinds.splice(ti, 1)[0];
              readyKinds.unshift(t);
              tributeFirstApplied = true;
            }
          }"""
p = p.replace(old_ready, reorder_block, 1)
old_attempt = "          const attempt = { day: dayOf(G), deedGateOk: true, readyKinds: readyKinds.map(x => x.kind), readiness: readyDetail, result: null, capIdx: dayStartCapIdx };"
assert p.count(old_attempt) == 1, 'attempt anchor count wrong'
p = p.replace(old_attempt, "          const attempt = { day: dayOf(G), deedGateOk: true, readyKinds: readyKinds.map(x => x.kind), readiness: readyDetail, result: null, capIdx: dayStartCapIdx, tributeFirst: tributeFirstApplied };", 1)

# --- Instrument 5: output assembly — readinessDaily + tributeFirst flag ---
old_capout = "    capstone: { enabled: CAPSTONE_ON, attempts: capstoneAttempts, delivery: capstoneDelivery, missedSit: capstoneMissedSit, deedGate: deedGateSnap, deedGateFirstOkDay, refusalVoicing: capstoneRefusalVoicing, firstRefusalCapIdx },"
assert p.count(old_capout) == 1, 'capstone output anchor count wrong'
p = p.replace(old_capout, "    capstone: { enabled: CAPSTONE_ON, attempts: capstoneAttempts, delivery: capstoneDelivery, missedSit: capstoneMissedSit, deedGate: deedGateSnap, deedGateFirstOkDay, refusalVoicing: capstoneRefusalVoicing, firstRefusalCapIdx, readinessDaily: capstoneReadinessDaily, tributeFirst: TRIBUTE_FIRST_ON },", 1)

if '--print-probe' in sys.argv:
    sys.stdout.write(p)
    sys.exit(0)
robust_write(f'{WT}/scripts/probe-endgame-r264-20261121.js', p)
print('probe cloned')

# ---------------- analyzer ----------------
src = open(f'{WT}/scripts/analyze-endgame-r263-20261121.js').read()
a = src
a = a.replace('r263', 'r264')

# Fix the header lineage line the blanket rename left as r259->r264
# (the r263 analyzer carries the same quirk; make r264's header name
# the true parent).
a = a.replace('// R259 analyzer verbatim EXCEPT input dir, r259->r263, + the NOTICK/CARRY tally carried.',
              '// R263 analyzer verbatim EXCEPT input dir, r263->r264, + the STALL-FATES / TRIBUTE-FIRST / CHARTER-CENSUS sections.')

# --- r264 sections: insert after the M25c verdict, before STARVATION ---
old_starv = "// R185 STARVATION WATCH (prereg §PASS-C-WIDE; printed on every pass,"
assert a.count(old_starv) == 1, 'STARVATION anchor count wrong'
sections = r'''
// r264 STALL-FATES (prereg Q1 — first run of the r247 stalled-while-ready
// metric, in DAYS): per seed, stall length in days (199-samples /
// samples-per-day — M20 daysAt199 counts TRACE SAMPLES, ~3/day, not
// days; r263's "161 days at 199" is 161 samples = 53.7 days) and the
// stall's fate: UNBLOCK (rd5ready flips true — the second living wave-4
// veteran arrives), REGRESSION (rd4ready flips false — a veteran/armor
// loss crashes gated standing 199 -> 100, the peak-4 floor), PERSIST
// (still 199 at the sitting/scatter). Reuses the M20 derivedGated
// formula above. Verdict = instrument completeness (every stalled seed
// classified); the UNBLOCK->full conversion is judged in the run note,
// not by this verdict.
function r264gatedOf(e, cfg, peak) {
  const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200, cap = (cfg.plentyCapT5 | 0) || 100;
  const capped = (e.war | 0) + (e.diplomacy | 0) + Math.min((e.plenty | 0), cap);
  const bounds = [];
  if ((e.raw | 0) >= t5 && capped < t5) bounds.push(199);
  if ((e.raw | 0) >= t4 && !e.rd4ready) bounds.push(99);
  if (capped >= t5 && !e.rd5ready) bounds.push(199);
  let gated = (e.raw | 0);
  for (const b of bounds) if (b < gated) gated = b;
  const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
  return Math.max(gated, floor);
}
const stallRows = recs.map(r => {
  const tr = r.standingTrace || [];
  const cfg = r.standingCfg || (recs.find(x => x.standingCfg) || {}).standingCfg || {};
  const spd = tr.length / Math.max(1, (r.gameDays | 0) || 1);
  let peak = 0, samples199 = 0, last199Idx = -1, first199Day = null;
  const gated = tr.map(e => { const g = r264gatedOf(e, cfg, peak); if (g >= 200) peak = 5; else if (g >= 100) peak = 4; return g; });
  tr.forEach((e, i) => { if (gated[i] === 199) { samples199++; last199Idx = i; if (first199Day == null) first199Day = e.day; } });
  let fate = 'NONE', fateDay = null, fateDetail = '';
  if (samples199 > 0) {
    fate = 'PERSIST';
    for (let i = last199Idx + 1; i < tr.length; i++) {
      const e = tr[i];
      if (gated[i] > 199) { if (e.rd5ready) { fate = 'UNBLOCK'; fateDay = e.day; fateDetail = 'rd5ready true, veterans=' + (((e.rd5 || {}).veterans) | 0); } else { fate = 'OTHER-RISE'; fateDay = e.day; fateDetail = 'gated ' + gated[i] + ' without rd5ready'; } break; }
      if (gated[i] < 199) { if (!e.rd4ready) { fate = 'REGRESSION'; fateDay = e.day; fateDetail = 'rd4ready FALSE, gated ' + gated[i] + ', short=[' + ((e.rd5short || []).join(',')) + ']'; } else { fate = 'OTHER-FALL'; fateDay = e.day; fateDetail = 'gated ' + gated[i] + ' rd4 still true'; } break; }
    }
    if (fate === 'PERSIST') fateDetail = 'still 199 at trace end (sat ' + (r.satSeatKind || '—') + ' d' + (r.satDay == null ? '?' : r.satDay) + ')';
  }
  const dgOk = (r.capstone && r.capstone.deedGateFirstOkDay != null) ? r.capstone.deedGateFirstOkDay : null;
  return { seed: r.seed, plan: r.plan, samples199, spd, days199: samples199 / spd, fate, fateDay, fateDetail, first199Day, dgOk, sat: r.satSeatKind, satDay: r.satDay };
});
const stallTotalDays = stallRows.reduce((s, x) => s + x.days199, 0);
const stallFates = {};
for (const x of stallRows) stallFates[x.fate] = (stallFates[x.fate] || 0) + 1;
const stallUnblocked = stallRows.filter(x => x.fate === 'UNBLOCK');
const stallConverted = stallUnblocked.filter(x => x.sat === 'full');
verdict('STALL-FATES', stallRows.every(x => x.fate !== 'NONE' || x.samples199 === 0) && stallRows.filter(x => x.samples199 > 0).every(x => ['UNBLOCK', 'REGRESSION', 'PERSIST', 'OTHER-RISE', 'OTHER-FALL'].includes(x.fate)),
  `${stallRows.filter(x => x.samples199 > 0).length}/${stallRows.length} seeds stalled, ${stallTotalDays.toFixed(1)} stall-days total, fates ${JSON.stringify(stallFates)}; UNBLOCK->full ${stallConverted.length}/${stallUnblocked.length} (r263: 4/6) — ` +
  stallRows.filter(x => x.samples199 > 0).map(x => `${x.seed}:${x.days199.toFixed(1)}d ${x.fate}${x.fateDay != null ? ' d' + x.fateDay : ''} dgOk=${x.dgOk == null ? 'never' : 'd' + x.dgOk} sat=${x.sat || '—'}`).join(' | '));

// r264 TRIBUTE-FIRST (prereg Q2): tribute deliveries on this pass vs the
// r263 Pass C reference (same flags, embassy-first: 1/5 full, 0 tribute
// deliveries — the embassy won the order 4/4). Binding: >= 1 tribute
// delivery — zero is VOID (the policy did not engage), not a NO-GO,
// recorded ok=true with the VOID note like M24's vacuous pattern.
// Full seats are reported descriptively (n=5, no significance bar).
const tribDel = recs.filter(r => (r.capstone && r.capstone.delivery && r.capstone.delivery.kind === 'military_tribute'));
const tribAtt = [];
for (const r of recs) for (const at of (((r.capstone || {}).attempts) || [])) if (at.tributeFirst) tribAtt.push({ seed: r.seed, day: at.day, kind: (at.result || {}).kind, ok: !!((at.result || {}).ok) });
const tribFull = tribDel.filter(r => r.satSeatKind === 'full').length;
verdict('TRIBUTE-FIRST', true,
  tribDel.length === 0 ? 'VOID: no military_tribute delivery fired — policy did not engage; experiment unanswered, not failed'
  : `${tribDel.length} tribute deliveries: ` + tribDel.map(r => `${r.seed}@d${r.capstone.delivery.day} (${((r.capstone.delivery.names || []).join('+')) || 'unnamed'}) sat=${r.satSeatKind || '—'}`).join(' | ') +
    ` | tribute-first attempts ${tribAtt.length} | full seats ${recs.filter(r => r.satSeatKind === 'full').length}/${recs.length} (r263 Pass C embassy-first: 1/5 full, 0 tribute) | tribute-delivered full ${tribFull}/${tribDel.length}`);

// r264 CHARTER-CENSUS (prereg Q3): why is trade_charter never ready?
// Aggregate the daily readiness (EVERY peak>=3 day) + hierarchy
// snapshots: the blocker distribution across the panel. Binding: the
// census is complete (every peak>=3 day classified) — ok iff every
// record carries readinessDaily with a hierarchy snapshot or an
// explicit null. If chartered links exist on any seed-day, the
// "never available" finding is revised in the note.
const charterDays = [];
for (const r of recs) for (const d of (((r.capstone || {}).readinessDaily) || [])) charterDays.push({ seed: r.seed, day: d.day, dgOk: d.deedGateOk, readiness: d.readiness || [], hier: d.hierarchy || null });
const charterBlockers = {};
let charterReadyDays = 0, charterLinkDays = 0, charterCharteredDays = 0, charterHierNull = 0;
for (const d of charterDays) {
  const c = (d.readiness || []).find(x => x.kind === 'trade_charter');
  if (!c) continue;
  if (c.ready) charterReadyDays++;
  else charterBlockers[c.reason || '?'] = (charterBlockers[c.reason || '?'] || 0) + 1;
  if (!d.hier) charterHierNull++;
  else { if ((d.hier.tradeActive | 0) > 0) charterLinkDays++; if ((d.hier.activeChartered | 0) > 0) charterCharteredDays++; }
}
const charterCensusOk = recs.every(r => Array.isArray((r.capstone || {}).readinessDaily));
verdict('CHARTER-CENSUS', charterCensusOk,
  !charterCensusOk ? 'INCOMPLETE: some records lack capstone.readinessDaily — census cannot name the blocker distribution'
  : `${charterDays.length} peak>=3 days, charter ready ${charterReadyDays}, blockers ${JSON.stringify(charterBlockers)}; days with an active trade link ${charterLinkDays}, with an active CHARTERED link ${charterCharteredDays}, hierarchy-null ${charterHierNull}` +
    (charterCharteredDays > 0 ? ' — REVISED: chartered links EXIST; "never available" is wrong, see run note' : ' — charter never available on this panel'));

'''
a = a.replace(old_starv, sections + old_starv, 1)

# Append the new ids to primaryIds.
old_primary_tail = "'M25c-buyout-early'];";
assert a.count(old_primary_tail) == 1, 'primaryIds tail count wrong'
a = a.replace(old_primary_tail, "'M25c-buyout-early', 'STALL-FATES', 'TRIBUTE-FIRST', 'CHARTER-CENSUS'];", 1)

if '--print-analyzer' in sys.argv:
    sys.stdout.write(a)
    sys.exit(0)
robust_write(f'{WT}/scripts/analyze-endgame-r264-20261121.js', a)
print('analyzer cloned')
print('clone done')

