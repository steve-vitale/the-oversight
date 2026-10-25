#!/usr/bin/env python3
"""Patch r51 analyzer -> r52 analyzer. Every replacement asserted."""
import sys

P = 'scripts/analyze-endgame-r52-20261025.js'
s = open(P).read()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        print(f'FAIL: expected {n} of {old[:90]!r}, found {c}')
        sys.exit(1)
    s = s.replace(old, new)

rep('// analyze-endgame-r51-20261025.js — journey-endgame r51 verdict.',
    '// analyze-endgame-r52-20261025.js — journey-endgame r52 verdict.')
rep('// Reads evidence/2026-10-25/perseed-endgame-r51/endgame-r51-*.json,',
    '// Reads evidence/2026-10-25/perseed-endgame-r52/endgame-r52-*.json,')
rep('// evaluates the pre-registered bindings (see journey-endgame-r51-prereg.md).',
    '// evaluates the pre-registered bindings (see journey-endgame-r52-prereg.md).')
rep("const DIR = path.join(__dirname, '..', 'evidence', '2026-10-25', 'perseed-endgame-r51');",
    "const DIR = path.join(__dirname, '..', 'evidence', '2026-10-25', 'perseed-endgame-r52');")
rep("/^endgame-r51-\\d+\\.json$/", "/^endgame-r52-\\d+\\.json$/")
rep('`endgame-r51-${r.seed}-transcript.txt`', '`endgame-r52-${r.seed}-transcript.txt`')
rep("""function voicedNonTable(r) {
  if (r.endReason === 'village-lost') return 'honest-death';
  try {
    const t = fs.readFileSync(path.join(DIR, `endgame-r52-${r.seed}-transcript.txt`), 'utf8');
    if (/PELLET HUMS/.test(t)) return 'reactor-honesty';
  } catch (e) {}
  return null;
}""",
    """function voicedNonTable(r) {
  if (r.endReason === 'village-lost') return 'honest-death';
  if (r.withdrawal) return 'withdrawal';
  try {
    const t = fs.readFileSync(path.join(DIR, `endgame-r52-${r.seed}-transcript.txt`), 'utf8');
    if (/PELLET HUMS/.test(t)) return 'withdrawal';
  } catch (e) {}
  return null;
}""")
# M2c ENGINE COVERAGE, inserted after the M2 verdict block
rep("""// M2b ATTRIBUTION (r51 instrument question): every dieFlag fight is""",
    """// M2c ENGINE COVERAGE (r52 instrument question): census fights ==
// distinct wave-4 opens (engine opens + policy-only opens), no errors,
// no double-count.
const m2crows = wavesAll.map(r => {
  const fc = r.fightCensus || {};
  const opens = (fc.engineOpensW4 | 0) + (fc.policyOnlyOpensW4 | 0);
  const n = (fc.fights || []).length;
  return { seed: r.seed, n, opens, eng: fc.engineOpensW4 | 0, pol: fc.policyOnlyOpensW4 | 0, errs: fc.censusErrors | 0, ok: n === opens && (fc.censusErrors | 0) === 0 };
});
verdict('M2c-engine-coverage', m2crows.every(x => x.ok),
  `${m2crows.filter(x => x.ok).length}/${m2crows.length}: ` +
  m2crows.map(x => `${x.seed}:fights=${x.n} opens=${x.opens}(eng=${x.eng}+pol=${x.pol}) errs=${x.errs}`).join(' | '));

// M2b ATTRIBUTION (r52 instrument question): every dieFlag fight is""")
rep('  const classified = dieFights.every(x => Array.isArray(x.fight.causalDeaths));',
    '  const classified = dieFights.every(x => Array.isArray(x.fight.causalDeaths));')
# census detail print: add source/escapeKind/context fields
rep("""    console.log(`${r.seed}(${r.plan}): d${f.startDay}-d${f.endDay} ${f.monsters.join('+')} turns=${f.turns} outcome=${f.outcome} kill=${f.killFlag} die=${f.dieFlag} talk=${f.talkDown} gotAway=${f.gotAway} pFled=${f.playerFled} vFled=${f.villFled} mFled=${f.monFled} result=${f.result} close=${f.closeWhy} causal=${(f.causalDeaths || []).map(d => (d.name || d.vid) + ':' + d.channel).join('+') || 'none'} diedDay=${(f.diedInFight || []).join(',') || 'none'}`);""",
    """    console.log(`${r.seed}(${r.plan}): d${f.startDay}-d${f.endDay} ${f.monsters.join('+')} turns=${f.turns}${f.turnsObserved ? '' : '(turns-unobs)'} outcome=${f.outcome} src=${f.source || '?'} esc=${f.escapeKind || '?'} drv=${f.openDriver || '?'} com=${f.committed !== false} arena=${f.arenaMention ? 'Y' : 'n'} deathCauses=${(f.deathCauses || []).join(',') || 'none'} kill=${f.killFlag} die=${f.dieFlag} talk=${f.talkDown} gotAway=${f.gotAway} pFled=${f.playerFled} vFled=${f.villFled} mFled=${f.monFled} result=${f.result} close=${f.closeWhy} causal=${(f.causalDeaths || []).map(d => (d.name || d.vid) + ':' + d.channel).join('+') || 'none'} diedDay=${(f.diedInFight || []).join(',') || 'none'}`);""")
# fast table header: r52 merged fast fights into the census
rep("""console.log('=== journey-endgame r51: fast wave-4 fights (single-call resolutions) ===');""",
    """console.log('=== journey-endgame r52: fast wave-4 fights (merged into census as source=policy-fast; separate tally retired) ===');""")
# r51 -> r52 in section headers and summary labels
s = s.replace('journey-endgame r51:', 'journey-endgame r52:')
s = s.replace('journey-endgame r51 verdict', 'journey-endgame r52 verdict')
s = s.replace("r51 FAST-FIGHT TALLY", "r52 FAST-FIGHT NOTE")
# M5 comment seed number
rep('// M5 VOICING CANONICAL: 88064 (forcedrift) — crossings >= 1 AND notices >= 1.',
    '// M5 VOICING CANONICAL: 88074 (forcedrift) — crossings >= 1 AND notices >= 1.')
# primary verdict set: r52 primary = M1, M2, M2c, M3, M4
rep("""const primary = ['M1-guard', 'M2-census', 'M3-conversion', 'M4-wave5-or-full'].every(id => (verdicts.find(v => v.id === id) || {}).ok);""",
    """const primary = ['M1-guard', 'M2-census', 'M2c-engine-coverage', 'M3-conversion', 'M4-wave5-or-full'].every(id => (verdicts.find(v => v.id === id) || {}).ok);""")

open(P, 'w').write(s)
print('analyzer patched OK, bytes', len(s))
