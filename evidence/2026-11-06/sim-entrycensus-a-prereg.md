# sim-entrycensus-a — prereg: census of wave-4+ fight traces with entry HP < 100

**Arm:** sim-entrycensus-a (run fleshout-20261106T1515Z, Loop A, axis
scale-onramp / winnability chain) · **DIAG-ONLY. No src/js changes. No
new seeds. No new sims** unless a reproduction probe is unavoidable to
classify a trace — if so it is named here first (none named at
prereg time) and kept minimal.
**Follow-up to:** sim-congtrace-a (`evidence/2026-11-06/sim-congtrace-a.md`),
which proved a wanderer-cast Congregation spawned at 20/20 HP
(`spawnWorldMonster` bare-`{id}` object path, game.js:20271 fallback
`|| 20`) and died to one ordinary 56-damage strike on seed 53006 day
149. That kill was recorded as a wave-4 kill in the stageally-confirm
corpus. Question: how many RECORDED wave-4 kills may be 20-HP spawn
artifacts rather than real kills?

## Primary metric

Count of wave-4+ fight traces with entry HP < 100, and count of
recorded wave-4 kills attributable to 20-HP spawns — with every trace
classified (artifact / legitimate wounded entry / unclassifiable with
reason) and every searched corpus listed, including zero-hit corpora.

**GO = census complete across every listed corpus, with every
wave-4+ entry-HP<100 trace classified or explicitly marked
unclassifiable-with-reason.** No threshold on how many artifacts are
found: a zero-artifact census is a GO if the search was complete.

## Corpora to search (minimum scope)

All committed per-seed corpora under `evidence/`, at minimum:

| Corpus dir | Band / seeds | Why in scope |
|---|---|---|
| `evidence/2026-11-06/perseed-stageally-confirm-b` | 53001–53008 | confirm band; contains the proven 53006 d149 artifact kill |
| `evidence/2026-11-06/perseed-fightinterior-b` | 51001–51008 | turn-based fight interiors; reported 51005 d66 Reunion at 123 HP |
| `evidence/2026-11-06/perseed-finishprobe-a` | 55001–55008 | finishing probe; entry-HP traces present |
| `evidence/2026-11-06/perseed-killerwild-b` | 56001–56008 | wild-kill band |
| `evidence/2026-11-06/perseed-stageally-a` | 55001–55008 | stageally pilot band |
| `evidence/2026-11-06/perseed-killersurvive-verify` | 53004, 53006 | killer-survival recheck on the confirm band |
| `evidence/2026-11-06/perseed-congtrace-a` | 53006 | the proven artifact trace itself (anchor) |
| `evidence/2026-11-05/perseed-tbretreat-refind-b` + `perseed-tbretreat-refind-confirm-b` | 92xxx/93xxx/96xxx | entry-HP traces present (rg hit) — wave-4 fights if any |
| Any other `perseed-*` dir under `evidence/` that records wave-4 fights | — | discovered by scanning every `perseed-*` dir for `waveKillLog` wave ≥ 4 entries and for `entryHp` fields; listed in the evidence file even with zero hits |

Discovery rule: the census scans EVERY `perseed-*` directory under
`evidence/` (all dates). A corpus is "searched" when its per-seed
files were opened and checked for (a) `traces[]` with `entryHp`,
(b) `waveKillLog`/`killsLive` wave-4+ kills, (c) `tbFights` wave-4+
rows. Corpora whose recorder carries no entry HP are recorded as
**unclassifiable-by-recorder** (not as zero artifacts) — the absence
of entry HP in a corpus is a recorder gap, not evidence of no
artifact. Known in advance: the stageally-confirm recorder's
`tbFights` rows carry only `monsterHpFracEnd`, no entry HP; only the
congtrace/fightinterior/finishprobe-class recorders carry `traces[]`
with `entryHp`/`entryMaxHp`.

Also consulted (not corpora): the preregs/evidence files naming
bands with wave-4 fights (trickoff 99761–99772, enddaybeats
46001–46040, etc.) — checked for whether a per-seed corpus exists
under `evidence/`; if no corpus exists, recorded as "band named, no
corpus on disk".

## Classifier (decided before reading any trace beyond the known anchor)

Wave-4 canonical HP band (docs/MONSTER-WAVES.md): 850–1500; wave-5:
1000–2200. Exact per-monster `hp` ranges taken from
`src/data/monsters.json` at census time and recorded in the evidence
file. A trace is a wave-4+ fight trace if `wave >= 4` (turn-based
`traces[]`/`tbFights`, or a `waveKillLog`/`killsLive` wave-4+ kill).

For each wave-4+ trace with entry HP < 100:

- **artifact (spawn-crippled)** iff `entryMaxHp` is far below the
  species' canonical band — in practice `entryMaxHp < 100` when the
  species' canonical low is ≥ 700 (every wave-4/5 species: lowest
  canonical low is herald/finale_crew at 700). The proven signature
  is 20/20 (born at maxHp 20 via the `|| 20` fallback); a trace born
  crippled and then ground down further (e.g. 15/20) is the same
  class, since the max itself is the bug. Spawn source recorded only
  where provable: 53006 Congregation = wanderer (proven live by the
  congtrace probe: spawned d75 at 20/20, drifted 74 days, zero prior
  fights). All other artifact traces: source
  `unknown-with-reason` unless the corpus carries spawn/field-fight
  evidence that pins it (wanderer / trap / finale /
  maintainWorldMonsters / tile-entry); the reason is stated per trace.
- **legitimate wounded entry** iff `entryMaxHp` is inside (or above,
  e.g. veteran ×1.5) the species' canonical band AND `entryHp <
  entryMaxHp`, i.e. the designed world-HP rule carrying prior field
  grind into the fight (e.g. Eulogy 675/900, Strike 750/1000 from
  congtrace-a). A grind trail (prior field fights vs the same monster
  type in the same corpus) supports the call and is noted where
  present; its absence does not by itself reclassify a trace whose
  `entryMaxHp` is canonical.
- **unclassifiable-with-reason** iff the corpus records the fight/kill
  but no entry HP (recorder gap — e.g. `tbFights`-only rows,
  `fights[]` field-fight rows with no HP), or the trace's
  `entryMaxHp` is missing, or `entryMaxHp` falls between 100 and the
  species' canonical low (no known mechanism produces that — would
  need a probe to classify). The reason is stated per trace or per
  corpus.

A recorded wave-4 kill is **suspect** iff it matches (same seed, day,
monster) a trace classified artifact, or a `waveKillLog` wave-4+ kill
whose fight has no entry-HP record at all AND no independent evidence
rules the artifact out — in the latter case it is counted separately
as **unresolvable-from-corpus**, never silently as clean.

## What counts as a verdict change

For each past evidence file that counted wave-4 kills (stageally
confirm/pilot, fightinterior-b, killerwild-b, killersurvive-verify,
finishprobe-a, endgame panels, and any other verdict citing a kill
count): if a kill it counted is classified artifact, the verdict
change is stated explicitly (kill removed, count restated, and
whether the arm's GO/NO-GO flips). If no counted kill is an artifact,
the verdict is "no past verdict changes" with the per-corpus
reasoning. Unresolvable-from-corpus kills do NOT change a verdict by
themselves; they are reported as an uncertainty bound on it.

## Method

1. Census tooling: `scripts/entrycensus-analyze-20261106.js` (read-only
   scan over committed corpora; writes the JSON table + a human
   summary to /tmp during development, evidence file at the end).
   Scan design (decided at prereg time, before the judged run):
   1047 `perseed-*` dirs / 21,750 JSON files under `evidence/`
   (8.9 GB) is too large to fully parse file-by-file in this arm's
   budget, so the scan is two-stage. Stage A (classifiable traces):
   full JSON parse of the 325 files containing `"entryHp"` (found by
   `rg` over the whole tree) — the ONLY files where entry-HP
   classification is possible. Stage B (kill denominator): regex
   extraction of `waveKillLog`/`killsLive` wave-4+ entries over the
   975 files containing `"w": 4/5` kill markers, matched to Stage A
   traces by (seed, day, mid). Stage C (coverage): every one of the
   1047 `perseed-*` dirs is enumerated; a dir with no file in any
   marker list is recorded as searched with zero wave-4 traces/kills.
   A file is only ever read, never written, by the analyzer.
2. Proof test: `scripts/test-entrycensus-20261106.js` proving the
   classifier on known traces BEFORE the judged census run: the 53006
   d149 Congregation 20/20 must classify **artifact**; a ground-down
   Eulogy 675/900 must classify **legitimate wounded entry**; a
   `tbFights`-only row with no entry HP must classify
   **unclassifiable (recorder gap)**.
3. No sims. If — and only if — a trace cannot be classified from the
   corpus and a minimal deterministic reproduction on its recorded
   seed would settle it, that probe is named here in an amendment
   BEFORE running it. None is named at prereg time.
4. Deliverables: this prereg, `evidence/2026-11-06/sim-entrycensus-a.md`
   (census table, verdict, verdict-change list, village assessment in
   plain words, metric review), machine-readable JSON table beside it
   (`evidence/2026-11-06/sim-entrycensus-a.json`), tooling + proof
   test under `scripts/`.

## Metric review (to be filled at run end)

Pre-registered metrics bind this run. A miss is NO-GO, never
re-scored against a friendlier metric mid-run.

## Convergence

scale-onramp / winnability chain: converging, not converged. This arm
is a measurement-integrity census: it sizes how much of the recorded
wave-4 kill evidence is spawn-artifact contamination. It changes no
gate, price, or deed.
