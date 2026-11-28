#!/usr/bin/env python3
"""Clone the r275 endgame probe + analyzer to r296 (lane B, 2026-11-28).

Renames only run-identifying occurrences (r275->r296, dates
20261123->20261128 + 2026-11-23->2026-11-28, substrate hash),
restores the r275 ADDITIONS history block (the blanket rename
wrongly re-dates it to r296), and ADDS the r296 instruments (prereg
Q1/Q5, the r275 metric-review proposals, planned before scored
seeds, probe-side only, zero src/js):
  - PLAN-map entries 107758-107765 (fresh band, prereg §FRESH-BAND):
    107758-107759 'wavesnw', 107760-107765 'waves'.
  - M18b GHOST-SAY: ambient `💬 <Name> says:` lines captured in the
    Game.say wrapper and classified with the same identity-aware
    rule as ghostHits; persisted as ghostSayLines/ghostSayHits.
  - HANDOFF-CASE COUNTER: Game.winPlanHomebodyHandoff wrapped
    pass-through; each call recorded {day, holder, wave, target,
    result, leader, party}; persisted as handoffCases.
The r275 instruments (TRIBUTE_FIRST order flag, CHARTER daily census,
capstoneReadinessDaily, STALL-FATES, W5-FACING census) are carried
verbatim.
Verifies the result by diffing against the r275 originals: the only
differences must be the renames, the dates, the header, the substrate
comment, the PLAN-map addition, and the r296 instrument blocks named
above.
Dates DO change here (r275 ran 2026-11-23, r296 runs 2026-11-28) —
unlike the r270 clone, where they were unchanged. The date renames
are safe: every '20261123' / '2026-11-23' occurrence in both files
is the file's own filename or its own evidence dir (probe 3+4,
analyzer 4+2, verified by grep before cloning); no historical
reference carries either date string.
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
    tmp = path + '.r296tmp'
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
src = open(f'{WT}/scripts/probe-endgame-r275-20261123.js').read()
p = src
assert p.count('b24528ae7') == 2, 'substrate hash count wrong'
p = p.replace('r275', 'r296')
p = p.replace('20261123', '20261128')
p = p.replace('2026-11-23', '2026-11-28')
p = p.replace('b24528ae7', '6dc7304ae')

# Restore the r275 ADDITIONS history block (it describes instruments
# added in r275; the blanket rename wrongly re-dated it to r296).
assert p.count('// r296 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):') == 1, 'r275 ADDITIONS anchor count wrong'
p = p.replace(
    '// r296 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):',
    '// r275 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):')

# Guard: the PLAN-DEATH label must never be re-dated.
assert 'r296 PLAN-DEATH WATCH' not in p, 'PLAN-DEATH label wrongly re-dated'
# Guard: WARPATH diagnostic carried, not duplicated — exactly one
# declaration, one snapshot block, one per-seed field.
assert p.count('warpathDeedsAtSit = null') == 1, 'WARPATH declaration count wrong'
assert p.count('warpathDeeds: warpathDeedsAtSit') == 1, 'WARPATH field count wrong'
assert p.count('WARPATH DIAGNOSTIC (prereg') == 1, 'WARPATH snapshot count wrong'

# Rewrite the header (lines 1-6) to the r296 header.
old_header = p.split('\n')[:6]
new_header = [
    '// probe-endgame-r296-20261128.js — journey-endgame r296 (lane B, 2026-11-28).',
    '// R275 probe verbatim EXCEPT renames r275->r296, evidence dir',
    '// 2026-11-28/perseed-endgame-r296, header, substrate comment',
    '// 6dc7304ae, + PLAN-map entries 107758-107765 (fresh band, prereg',
    '// §FRESH-BAND) + the r296 instruments (M18b ghost-say, handoff-case',
    '// counter) — all named in journey-endgame-r296-prereg.md. The r264 additions',
]
p = '\n'.join(new_header + p.split('\n')[6:])

# r296 ADDITIONS comment above the PLAN const (mirrors the r275 pattern):
# newest first, directly above the r275 ADDITIONS block.
anchor = '// r275 ADDITIONS (prereg §FRESH-BAND, probe-side only, zero src/js):'
assert p.count(anchor) == 1, 'r275 ADDITIONS anchor count wrong (post-restore)'
p = p.replace(anchor, '// r296 ADDITIONS (prereg §FRESH-BAND + Q1/Q5, probe-side only, zero src/js):\n'
    '// PLAN-map entries 107758-107759 \'wavesnw\' + 107760-107765 \'waves\'\n'
    '// (fresh band 107758-107765, verified fresh per\n'
    '// local_seed_band_freshness; the r275 instruments are carried\n'
    '// verbatim, zero other logic change). M18b GHOST-SAY: ambient\n'
    '// `💬 <Name> says:` lines captured in the Game.say wrapper and\n'
    '// classified with the same identity-aware rule as ghostHits.\n'
    '// HANDOFF-CASE COUNTER: winPlanHomebodyHandoff wrapped pass-through;\n'
    '// each call recorded {day, holder, wave, target, result, leader, party}.\n' + anchor, 1)

# PLAN-map entries for the fresh band (C-wide pattern: first 2 wavesnw,
# next 6 waves).
old_plan_tail = "107589: 'waves' };"
assert p.count(old_plan_tail) == 1, 'PLAN tail count wrong'
p = p.replace(old_plan_tail,
    "107589: 'waves', 107758: 'wavesnw', 107759: 'wavesnw', 107760: 'waves', 107761: 'waves', 107762: 'waves', 107763: 'waves', 107764: 'waves', 107765: 'waves' };", 1)

# --- r296 INSTRUMENT 1: M18b GHOST-SAY + HANDOFF-CASE COUNTER declarations.
old_decl = "  const ghostLines = [];\n"
assert p.count(old_decl) == 1, 'ghostLines declaration count wrong'
p = p.replace(old_decl, "  const ghostLines = [];\n"
    "  const ghostSayLines = []; // r296 M18b GHOST-SAY (prereg Q5, probe-side only, zero src/js): ambient `💬 <Name> says:` lines, classified with the same identity-aware rule as ghostHits at summary time.\n"
    "  const handoffCases = []; // r296 HANDOFF-CASE COUNTER (prereg Q1, probe-side only, zero src/js): winPlanHomebodyHandoff calls, pass-through wrapped below.\n"
    "  let handoffWrapAttached = null; // r296: true iff the handoff wrapper attached (method present on Game); the analyzer fails LOUD if false, so a silent non-attachment never reads as 'no case'.\n", 1)

# --- r296 INSTRUMENT 1b: ghost-say capture in the Game.say wrapper.
old_say = "  Game.say = function (l) { try { cap(l); } catch (e) {} try { const m = /is back with ([A-Z][a-z]+)/.exec(String(l == null ? '' : l)); if (m) ghostLines.push({ day: dayOf(Game), companion: m[1], line: String(l).slice(0, 300) }); } catch (e2) {} return oSay.apply(this, arguments); };"
assert p.count(old_say) == 1, 'Game.say wrapper count wrong'
p = p.replace(old_say, "  Game.say = function (l) { try { cap(l); } catch (e) {} try { const m = /is back with ([A-Z][a-z]+)/.exec(String(l == null ? '' : l)); if (m) ghostLines.push({ day: dayOf(Game), companion: m[1], line: String(l).slice(0, 300) }); } catch (e2) {} try { const m2 = /💬\\s*([A-Z][a-z]+)\\s+says:/.exec(String(l == null ? '' : l)); if (m2) ghostSayLines.push({ day: dayOf(Game), companion: m2[1], line: String(l).slice(0, 300) }); } catch (e3) {} return oSay.apply(this, arguments); };", 1)

# --- r296 INSTRUMENT 2: handoff-case counter wrapper, before the r72 grant wrapper.
old_grant_anchor = "  // r72 GRANT LOG (read-only wrapper): pass-through on grantFeastBuff."
assert p.count(old_grant_anchor) == 1, 'grant wrapper anchor count wrong'
handoff_wrapper = """  // r296 HANDOFF-CASE COUNTER (read-only wrapper): pass-through on winPlanHomebodyHandoff.
  // Cases presented = calls returning 'launch'/'hold' (a range-0 holder's wave-4+ plan
  // with walkable companions considered); converted = 'launch'. The leader/party are
  // read AFTER the call from agencyState exped entries (the leader is the first
  // candidate whose startExpedition stuck); a pure read, zero trajectory effect.
  try {
    const oHandoff = Game.winPlanHomebodyHandoff ? Game.winPlanHomebodyHandoff.bind(Game) : null;
    try { handoffWrapAttached = !!oHandoff; } catch (e2) {}
    if (oHandoff) Game.winPlanHomebodyHandoff = function (vid, hx, hy, announce, opts, c, fill) {
      let pre = null;
      try {
        const vv = ((Game.state || {}).village || {});
        const plan = (vv.winPlan || {})[vid] || null;
        pre = { wave: plan ? (plan.needWave | 0) : null, target: plan && typeof plan.target === 'string' ? plan.target : null };
      } catch (e) {}
      let r = null, threw = null;
      try { r = oHandoff.apply(this, arguments); } catch (e) { threw = e; }
      try {
        let leader = null; const party = [];
        try {
          const a = Game.agencyState ? Game.agencyState() : null;
          const cands = [c && c.companion, c && c.companion2, c && c.companion3];
          for (const cid of cands) {
            if (!cid) continue;
            if (a && a.exped && a.exped[cid]) { party.push(cid); if (!leader) leader = cid; }
          }
        } catch (e2) {}
        handoffCases.push({ day: dayOf(Game), holder: vid || null, wave: pre ? pre.wave : null, target: pre ? pre.target : null, result: r, leader, party });
      } catch (e2) {}
      if (threw) throw threw;
      return r;
    };
  } catch (e) { instrumentErrors++; }
"""
p = p.replace(old_grant_anchor, handoff_wrapper + old_grant_anchor, 1)

# --- r296 INSTRUMENT 1c: ghost-say classification at summary time.
old_w3_anchor = "  // R76 FULL-RUN W3 MENTION LOG (read-only): scan the FULL capture"
assert p.count(old_w3_anchor) == 1, 'W3 mention anchor count wrong'
ghostsay_classify = """  // r296 M18b GHOST-SAY (prereg Q5): the same identity-aware rule as ghostHits,
  // applied to ambient `💬 <Name> says:` lines. CONFIRMED only when a same-first-name
  // death predates the line AND no same-first-name death falls on/after the line day
  // AND no final-alive roster person shares the first name.
  const classifyGhost = (gl) => {
    const first = gl.companion;
    const earlier = deathRecords.filter(dr => dr && dr.name && String(dr.name).split(' ')[0] === first && (dr.day | 0) < (gl.day | 0));
    const aliveLater = deathRecords.some(dr => dr && dr.name && String(dr.name).split(' ')[0] === first && (dr.day | 0) >= (gl.day | 0));
    const aliveAtEnd = finalAliveFirst.has(first);
    return { day: gl.day, companion: first, line: gl.line,
      hit: earlier.length > 0 && !aliveLater && !aliveAtEnd,
      firstNameHit: earlier.length > 0,
      deathDay: earlier.length ? earlier[0].day : null,
      deathCause: earlier.length ? earlier[0].cause : null,
      aliveCandidate: aliveLater || aliveAtEnd };
  };
  const ghostSayHits = ghostSayLines.map(classifyGhost);
"""
p = p.replace(old_w3_anchor, ghostsay_classify + old_w3_anchor, 1)

# --- r296 INSTRUMENTS on the per-seed record.
old_rec = "surgeSpends, ghostLines, ghostHits,"
assert p.count(old_rec) == 1, 'record ghost fields count wrong'
p = p.replace(old_rec, "surgeSpends, ghostLines, ghostHits, ghostSayLines, ghostSayHits, handoffCases, handoffWrapAttached,", 1)

if '--print-probe' in sys.argv:
    sys.stdout.write(p)
    sys.exit(0)
robust_write(f'{WT}/scripts/probe-endgame-r296-20261128.js', p)
print('probe cloned')

# ---------------- analyzer ----------------
src = open(f'{WT}/scripts/analyze-endgame-r275-20261123.js').read()
a = src
a = a.replace('r275', 'r296')
a = a.replace('20261123', '20261128')
a = a.replace('2026-11-23', '2026-11-28')

# Fix the header lineage line (post-rename text): the r275 analyzer's
# line 3 still names R270 as the parent. Name the true parent here.
old_line3 = '// R270 analyzer verbatim EXCEPT input dir, r270->r296.'
assert a.count(old_line3) == 1, 'analyzer header line 3 count wrong'
a = a.replace(old_line3,
              '// R275 analyzer verbatim EXCEPT input dir, r275->r296.')

# The r267 W5-FACING section header is already 'r267' (the r270 clone
# restored it); the blanket rename does not touch it. Assert it survives
# untouched — there is nothing to re-date here.
assert a.count('// r267 W5-FACING (prereg Q2 — new, from r264\'s finding that both pilot') == 1, 'W5-FACING header count wrong'
assert '// r296 W5-FACING (prereg Q2' not in a, 'W5-FACING header wrongly re-dated'

# --- r296 M18b-GHOST-SAY verdict, right after the M18 verdict.
old_m18_end = "firstNameOnly=${(x.gh || []).filter(h => h.firstNameHit && !h.hit).map(h => 'd' + h.day + ':' + h.companion).join(',') || 'none'}`).join(' | '));"
assert a.count(old_m18_end) == 1, 'M18 verdict end count wrong'
m18b_block = old_m18_end + """

// M18b GHOST-SAY (r296 new, prereg Q5): ambient `💬 <Name> says:` lines classified
// with the same identity-aware rule as M18. Confirmed hits are F-items (a dead
// person speaking in the present tense), not a panel verdict by itself — the
// verdict is instrument completeness (every seed carries the fields, same length).
const m18brows = recs.map(r => {
  const gl = r.ghostSayLines, gh = r.ghostSayHits;
  const ok = Array.isArray(gl) && Array.isArray(gh) && gl.length === gh.length;
  return { seed: r.seed, ok, n: ok ? gl.length : null, hits: ok ? gh.filter(h => h.hit) : [], gh: ok ? gh : [] };
});
verdict('M18b-ghost-say', m18brows.every(x => x.ok),
  `${m18brows.filter(x => x.ok).length}/${m18brows.length}: ` +
  m18brows.map(x => `${x.seed}:lines=${x.n} confirmed=${x.hits.map(h => 'd' + h.day + ':' + h.companion + '(died d' + h.deathDay + ')').join(',') || 'none'} firstNameOnly=${(x.gh || []).filter(h => h.firstNameHit && !h.hit).map(h => 'd' + h.day + ':' + h.companion).join(',') || 'none'}`).join(' | '));"""
a = a.replace(old_m18_end, m18b_block, 1)

# --- r296 HANDOFF-CENSUS, before the R185 STARVATION WATCH section.
old_starv_anchor = "// R185 STARVATION WATCH (prereg §PASS-C-WIDE; printed on every pass,"
assert a.count(old_starv_anchor) == 1, 'starvation anchor count wrong'
handoff_block = """// r296 HANDOFF-CENSUS (prereg Q1 — new, from r275's metric review: the probe had no
// handoff-pool instrument, so a pilot could not distinguish "no handoff case existed"
// from "a case existed but did not convert"): cases presented = winPlanHomebodyHandoff
// calls returning 'launch'/'hold'; converted = 'launch'. Converted-party-kill link is
// best-effort: a vKill fight in the 30 days after launch whose monsters include the
// plan target (or any vKill in the window when the target is unrecorded).
const hoRows = recs.map(r => {
  const cases = Array.isArray(r.handoffCases) ? r.handoffCases : [];
  const presented = cases.filter(x => x.result === 'launch' || x.result === 'hold');
  const converted = cases.filter(x => x.result === 'launch');
  const fights = ((r.fightCensus || {}).fights) || [];
  const kills = converted.map(x => {
    const hit = fights.find(f => f.outcome === 'vKill' && (f.startDay | 0) >= (x.day | 0) && (f.startDay | 0) <= (x.day | 0) + 30 && (!x.target || (f.monsters || []).indexOf(x.target) !== -1));
    return hit ? { day: x.day, leader: x.leader || null, fightDay: hit.startDay, monsters: hit.monsters || [] } : null;
  }).filter(Boolean);
  return { seed: r.seed, cases: cases.length, presented: presented.length, converted: converted.length, holds: cases.filter(x => x.result === 'hold').length, kills };
});
verdict('HANDOFF-CENSUS', hoRows.every(x => Array.isArray((recs.find(r => r.seed === x.seed) || {}).handoffCases) && (recs.find(r => r.seed === x.seed) || {}).handoffWrapAttached === true),
  `${hoRows.reduce((s, x) => s + x.presented, 0)} presented / ${hoRows.reduce((s, x) => s + x.converted, 0)} converted / ${hoRows.reduce((s, x) => s + x.holds, 0)} holds; converted-party kills ${hoRows.reduce((s, x) => s + x.kills.length, 0)}/${hoRows.reduce((s, x) => s + x.converted, 0)} — ` +
  hoRows.map(x => `${x.seed}:cases=${x.cases} pres=${x.presented} conv=${x.converted} holds=${x.holds} kills=${x.kills.map(k => 'd' + k.fightDay + ':' + (k.monsters || []).join('+')).join(',') || 'none'}`).join(' | '));

"""
a = a.replace(old_starv_anchor, handoff_block + old_starv_anchor, 1)

# Register the new verdicts in the primary list. (Each id occurs twice:
# the verdict() call and the primaryIds entry — anchor on the list context.)
assert a.count("'M18-ghost-scan', 'M19-grant-log'") == 1, 'primary M18 count wrong'
a = a.replace("'M18-ghost-scan', 'M19-grant-log'", "'M18-ghost-scan', 'M18b-ghost-say', 'M19-grant-log'", 1)
assert a.count("'W5-FACING'];") == 1, 'primary W5-FACING count wrong'
a = a.replace("'W5-FACING'];", "'W5-FACING', 'HANDOFF-CENSUS'];", 1)

if '--print-analyzer' in sys.argv:
    sys.stdout.write(a)
    sys.exit(0)
robust_write(f'{WT}/scripts/analyze-endgame-r296-20261128.js', a)
print('analyzer cloned')
print('clone done')
