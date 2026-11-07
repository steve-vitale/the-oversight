# sim-durablepair-a — durable-pair re-judge of the drive64 corpora + narrated-telling hook

Run: `fleshout-20261107T0221Z`, axis scale-onramp / winnability chain.
Tracker blank #2 (0059Z metric review): judge a DURABLE pair next +
narrated telling, then re-judge the drive.
Prereg: `evidence/2026-11-06/sim-durablepair-a-prereg.md` (binding).

## VERDICT (durable bar): NO-GO — ON 1 durable pair vs OFF 0 (bar: ON >= 2, OFF 0)

The count bar over-credited the drive 4x. Of the four count-bar pairs,
only one survives the durable bar — seed 99063, where both killers lived
16 and 22 days past the second kill. The other three pairs were
same-day overlaps whose killers were dead within 9 days. The 0059Z
metric review was right: `pairFormed` counted fleeting overlaps as
banked veterans. The drive64 NO-GO stands, and the durable bar makes it
sharper: the drive's pair-forming effect, judged on pairs that live long
enough to act on, is 1 seed in 64, not 4.

## Part (a): durable-pair re-judge

Judge: `scripts/durablepair-judge-20261106.js` (lands on master).
Proof: `scripts/test-durablepair-20261106.js` — 26/26 green.
Verdict file: `evidence/2026-11-06/durablepair-verdict.json`.
Corpus fixtures: `evidence/2026-11-06/durablepair-corpus/` (stripped
panel projections + byte-identical transcript copies; full-corpus
sha256 in the prereg).

Rule (preregged): a `pairFormed` pair (first two distinct wave-4
killers by first-kill day) is DURABLE iff BOTH killers are alive 14
days after the second kill (no death record, or `deathDay -
secondKillDay > 14`, strict) or both are living at horizon end
(`livingKillers == 2`). A pair seed with no death-day source is
UNJUDGED, never counted either way.

Gate (before judging): the judge reproduces the published drive64 pair
lists and pooled counts exactly — ON pairs [99063, 99091, 99854, 99866],
OFF pairs [], ON/OFF w4Kills 25/25. Gate PASS; the judge is reading the
corpus the drive64 run judged. The stripped-panel verdict JSON is
byte-identical to the full-panel verdict JSON (verified by diff).

| seed (arm ON) | 2nd kill | killer 1 survived | killer 2 survived | durable? |
|---|---|---|---|---|
| 99063 | d101 | Owen Smith d101→d117 (+16) | Lucas Brown d101→d123 (+22) | YES |
| 99091 | d89 | Verónica Colmenares d89→d98 (+9) | Sanne Bakker d89→d90 (+1) | no |
| 99854 | d88 | Karl Donnelly d87→d88 (0) | Ruth Goldstein d88→d89 (+1) | no |
| 99866 | d104 | Naran Tumen d100→d107 (+3) | Bienvenu Mbiya d104→d109 (+5) | no |

- Pooled 64: durable ON 1 vs OFF 0. GO required ON >= 2 → **MISS**.
- Fresh 48 alone: durable ON 1 (99063) vs OFF 0. Screen 16: ON 0.
- Count-bar over-credit: ON 4 count pairs → 1 durable (ratio 0.25).
- No unjudged pairs (all four pair seeds have transcripts).
- Sensitivity (99854 later killers): Valeria Quispe's first kill d110,
  Meera Reddy's d134 — Valeria died d131, before Meera's kill, so no
  later pair forms. No missed durable pair hides behind the first two.
- Boundary note: no corpus pair sits on the +14d boundary (survivals
  are 0, 1, 3, 5, 9, 16, 22 days), so the strict `> 14` rule vs `>= 14`
  cannot change this verdict. The proof test pins the boundary both
  ways (+14 not durable, +15 durable).

What the one durable pair means: 99063 is the seed the 0059 evidence
already flagged as the drive's real contribution — the second kill was
pulled 7 days forward, into the first killer's remaining life, and both
killers then lived more than two weeks. The drive CAN bank a pair; at
n=64 it did so once. The binding problem stays upstream (0059): kills
are rare (25 per 64 villages per arm) and killers die almost as fast as
they are made — six of eight pair killers dead within 9 days of their
kill.

## Part (b): narrated-telling audit + hook (BRANCH PATCH, not a landing)

Audit (drive branch `sim-drive64-measure`, tip ad0788cdc):

- The drive's telling site is `objTellHuntSite` in
  `src/js/villager-objectives.js`, called from `objHuntFromSite` when a
  firsthand hunter departs on a HUNT (a scout does not re-tell). The
  teller is the departing hunter; the hearers are up to two roster
  villagers standing at the hunter's own node; the beast is the hunt
  site's `mid` (+ tile). Each hearer gains a second-hand heard record
  via `objNoteHeardSighting` (naming the teller in `toldBy`), which
  increments `driveSeek.told` — with NO SAY anywhere. That is the whole
  of the invisibility: the telling is a silent bookkeeping write.
- Master has no `objTellHuntSite`, `objNoteHeardSighting`,
  `monsterHeard` or `objSeekCandidate` (verified: 0 hits in this
  worktree), so the hook cannot land on master without the drive build.
  Per the prereg decision rule it is delivered as a patch file.
- Master's existing kill-telling channel is the fireside killer tale
  (`queueKillerTale` → `killerTaleBeat` → `tellKillerTale`, via
  `sayHavenNews`), which fires only for a monster type nobody has
  reported yet — so repeat wave-4 kills of known types never get a
  tale either. That is a separate, master-side gap (recorded in
  sim-findings.md, not built here): the patch narrates the drive's
  hunt-departure telling; the fireside repeat-kill tale is a different
  change with its own feel review.

The hook (patch: `evidence/2026-11-06/sim-durablepair-a-telling-hook.patch`):
one SAY line in `objTellHuntSite`, only when a genuinely-new heard
record is born — `driveSeek.told` counts new records only (a refresh
returns before the count), so `toldAfter > toldBefore` is the
new-record test. Through `sayHavenNews` (kind `'telling'`), the same
relay the fireside tale uses: it queues while the scholar is away and
delivers at the fire. The beast is named by `monsterDisplayName` (the
descriptor with its article, or the village name — never the true
name), with a prose guard mirroring `monsterNoun` (a long punctuated
descriptor falls back to `'something'`). No state change, no RNG.
Example lines from the proof run (seed 99866):
"Thabo tells the hall: going after the thing with headlights for eyes,
standing too still." / "Marisol tells the hall: going after The
Anaconda Empress." / "Daniyar tells the hall: going after Big Loud."

Proof (throwaway copies of the drive branch at
`~/workspace/tmp-drivepatch-throw/` — plain extracted copies, not
worktrees; removed at run end):
- Probe: `scripts/tellinghook-probe-20261106.js` (loads the drive root,
  wraps `Game.say`, full 150d, seed 99866, drive64 env, DRIVESEEK on).
  Proof test: `scripts/test-tellinghook-20261106.js` — 28/28 green
  (patch hygiene + applies-cleanly via `git archive`, recorded probe
  outputs, probe-instrument fidelity).
- Unpatched probe reproduces the committed drive64 transcript values
  EXACTLY (told 27, seeks 5, scoutSeen 0, scoutEmpty 5, 2 wave-4 kills
  Naran d100 / Bienvenu d104, 0 telling lines, 13,672 SAY lines) — the
  instrument is anchored on the published run.
- Patched probe (final patch text): 15 telling lines; driveSeek
  counters IDENTICAL (27/5/0/5), kills identical, killer death days
  identical, run length identical (151d); SAY lines 13,672 → 13,687
  (delta exactly +15). Narration-only, proven: the hook adds the
  telling and moves nothing else.
- The patch applies cleanly to a pristine drive-branch copy
  (`git apply --check` + apply + diff-identical to the proven work
  copy, verified twice, including after the wording fix).
- First wording used `monsterNoun`, which strips the article ("going
  after thing with headlights…") — caught by reading the probe output,
  fixed to `monsterDisplayName` (descriptors carry their articles),
  patch regenerated + re-verified + probe re-run on the final text.
  The numbers above are from the final text.

## Wall numbers (re-judged corpora, pooled 64)

| arm | national | table | wins | wave-4 reach | wave-5 reach | w4 kills | median survival |
|---|---|---|---|---|---|---|---|
| OFF | 0 | 0 | 0 | 45 | 1 | 25 | 100d |
| ON | 0 | 0 | 0 | 47 | 2 | 25 | 93d |

No village reached national, let alone the table, on either arm. The
scale wall stands untouched by this re-judge (it judges existing
corpora; it does not move the wall). Living killers at end: ON 3 vs
OFF 4 — the drive did not increase the number of living wave-4 killers
at the end of runs, which is what the readiness bar actually needs.

## Sense-testing

Read the four pair windows' transcripts (committed in
`durablepair-corpus/`): the kills read as people joining the player's
fights on camera, and the one durable pair (99063) reads as a second
killer stepping up beside a living first killer — Owen and Lucas kill
on the same day, then both live three more weeks. The fleeting pairs
read as the opposite: Karl dies the day of the second kill, Ruth the
day after; Sanne dies one day after her kill. With the patch, the
telling that connects a hunt to its hearers is now a sentence a reader
can find, instead of a counter only a panel can see. The fireside
repeat-kill tale is still missing (see findings) — a wave-4 kill of an
already-named beast still gets no fireside telling on master.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current '/tmp/drive64-*.json'
--metrics national,table,wins,exiled`, run on the full drive64 panels
(the same corpora 0059 checked):
- 3 LOUD lines: national 12→0, table 16→0, wins 16→0.
- Verdict: the documented spurious regime class, identical to 0059 —
  the scale-wall baseline's own `_regime` note is the "winseat — full
  win-side win stack" regime and forbids comparing pre-seat /
  competent-only substrates against it. These corpora are competent-only
  / pre-seat substrates, and 0 national/table/wins matches the standing
  wall state. Baseline NOT rolled, no investigation item. (A first
  `--current` glob typo — `/tmp/drive64-panel-*.json` — matched nothing;
  the checker said so LOUDly and the corrected glob
  `/tmp/drive64-*.json` was used.)

## Metric review

- The durable bar does what the 0059 review hoped: it separates a
  banked pair from same-day overlaps (4 → 1) without moving the
  drive64 NO-GO. It is the right bar for the drive's successor and for
  the finisher-size / killer-survivorship arms: judge durable pairs
  alongside count pairs, and report the over-credit ratio.
- The GO bar (ON >= 2) was set from the count-bar baseline before the
  judge ran; the miss is a verdict, not a failure of this run. The
  re-judge's job was to produce the durable numbers and the instrument,
  and both are delivered.
- The telling hook's success is separate from the durable verdict: the
  narration legibility fix is proven (15 lines, zero trajectory
  change) regardless of the NO-GO.
- Fresh band 99841–99848 was verified fresh (prereg) and NOT consumed
  — the patch proof used deterministic re-runs of existing pair seeds,
  so no fresh panel was needed. The band stays free for the next run.

## Convergence state

scale-onramp stays **converging** (NOT converged): the durable
re-judge sharpens the drive64 NO-GO (1 durable pair in 64, not 4);
no village banks two living wave-4 killers and sits; wins 0
everywhere. Next blanks, in order (unchanged from 0059): (1)
FINISHER-SIZE build; (2) this run's durable bar + narrated telling,
now delivered — the drive's successor is judged on the durable bar
with the telling patch applied; (3) killer survivorship — pairs die
within days, the upstream binding problem.

## Files

- Prereg: `evidence/2026-11-06/sim-durablepair-a-prereg.md`
- Judge: `scripts/durablepair-judge-20261106.js`; proof:
  `scripts/test-durablepair-20261106.js` (26/26)
- Probe: `scripts/tellinghook-probe-20261106.js`; proof:
  `scripts/test-tellinghook-20261106.js` (28/28)
- Corpus fixtures: `evidence/2026-11-06/durablepair-corpus/`
  (drive64-panel-off/on-stripped.json, drive64-transcript-99063 /
  -99091 / -99854 / -99866.json)
- Verdict: `evidence/2026-11-06/durablepair-verdict.json`
- Telling-hook patch:
  `evidence/2026-11-06/sim-durablepair-a-telling-hook.patch`
- Probe outputs:
  `evidence/2026-11-06/tellinghook-probe-99866-unpatched.json`,
  `evidence/2026-11-06/tellinghook-probe-99866-patched.json`
- `check.js --quick`: 280 passed, 10 failed in 1537s (this worktree,
  2026-11-07). NONE of the failures are this run's files (judge, probe
  and both proof tests pass standalone: 26/26 + 28/28). The 10: three
  120s TIMEOUTs under sibling load (solo-campaign-endings,
  trust-observer-neutrality, capable-bot — the contention class);
  test-capable-bot also shows the already-filed pre-existing food-deed
  assertion (sim-findings.md open item); measurement-proof-update +
  measurement-workflow (retained neutrality proof staleness, #1353);
  mobile-combat-cadence (2 assertions), occupation-panels, measurement-cache-flags,
  phone-frame-proof (stale phone receipt), establishment-r20-fixes
  (racks-full daily gate). Three re-run standalone on this tip and fail
  identically (establishment-r20 1 failure, mobile-combat-cadence 13/2,
  measurement-proof-update "inputs not current") — pre-existing on the
  tip, not caused by this scripts+evidence-only run. Standing profile
  was 282/8 (Loop B 0130Z); this run is 280/10, the +2 being timeout
  flakes at load avg 25. No src/js changed, so no game-code regression
  is possible from this run.

Drive branch `sim-drive64-measure` was NOT merged, NOT checked out as a
base; it was read via `git show` / `git archive` only. The throwaway
proof copies were plain extracted copies, removed at run end.
