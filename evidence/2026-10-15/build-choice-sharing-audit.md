# Shared passive build-choice observer

2026-10-15. Base f1ab62c7dc390fe0293b32571b846cf7953ad31a on
codex/balanced-measurement. Port only the standalone observer/test from
primary e928d576c25f76c1fa018e9e94de829b79d48e09. No game, regional,
policy, balanced collector, metric contract or balance-proof changes.
Primary's rejected Miser Social-kit reorder is not imported.

`scripts/lib/build-choice-observer.js` records original actual score/decision
calls; it never requests an extra evaluation, knowledge query, random draw,
clock tick or telemetry event. Such evaluations can mutate NPC target plans,
so an observer must not manufacture them. Install/restore instructions and
counting/receipt/truncation limits are in SIMULATING.md. The primary branch's
deed-screen --choices1 integration depends on its Garden observer and stays
there; this branch provides the helper without importing game alternatives.

The shared-harness test passes9/9. A natural seed7 merchant using the
unchanged standard driver matches its observer-off result row and full
gameplay hash exactly:41 actual decision records, zero drops/warnings,
same source manifest, flags, Node and helper/probe hashes. Both raw arms are
retained in build-choice-sharing-proofs.json.gz. Reproduce in separate
processes:

```text
node scripts/godpath/test-build-choice-observer.js
node evidence/2026-10-15/build-choice-sharing-probe.cjs . 1
node evidence/2026-10-15/build-choice-sharing-probe.cjs . 0
```

This is a transparency control, not balance or all-build equivalence proof.
Primary's additional48 replay rows/two off controls and Miser experiment
are in evidence/2026-10-15/miser-access-audit.md at e928d576. Candidate
availability increased without sampled starter picks/classes; keep deliberate
knowledge-bound strategy/value separate from generic shared-brain preference.

The shared branch is still red. Quick97/99 has the same sprite/where tests
failing. Full820/871 has51 failing scripts, versus the previous retained
822/870 with48. Four newly failing legacy names: drifter-joinstay,
enter-building-guard, item-use, moot-justice-aftermath. Previously failing
past-deflect-gate now passes. Do not report these as an unchanged count or
claim a green full run.

The five changing failure categories are independently reproduced on an
unchanged frozen f1ab baseline with the new helper/test absent. Tracked
baseline source files retain their actual raw line endings; normalized
game/policy manifests match the current root, and all five legacy test
files match byte-for-byte. A bounded forensic preload seeds Math.random
before their old module evaluation; their real clock and assertions stay
unchanged. Same-category failures occur on both roots:

| Legacy test | Pre-evaluation seed | Failure category |
|---|---:|---|
| drifter-joinstay |2| joined village did not deplete forage turf |
| enter-building-guard |3| travel did not leave Haven, then location assertions |
| item-use |24| young-character keepsake age gate |
| moot-justice-aftermath |16| judged heat not half of original |
| past-deflect-gate |1| no qualifying deflect-capable villager found |

These are forensic controls for existing tests, not the shared harness for
new gameplay work or a deterministic campaign comparison. Raw attempts,
matching baseline/current outputs, test hashes and preload/probe sources
are retained. No assertions weakened, scripts quarantined or full-suite
reruns selected for a preferred result. The primary suite remains938/938;
shared red failures remain visible in draft PR1. The ontology validator's
generated Windows slash-only doc drift was restored because no system
module changed. No merge, release, deployment or SW bump.
