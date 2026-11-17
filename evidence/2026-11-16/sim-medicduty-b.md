# sim-medicduty-b — evidence (DIAG: the medic-duty candidate starves expeditions on whole seeds)

Run: fleshout-loop-b-20261116T2230Z (Loop B), axis winnability chain, arm
sim-medicduty-b — DIAG: the medic-duty candidate starves expeditions on
whole seeds (tracker blank #6; findings backlog line 2444). Branch
`sim-medicduty-b` (worktree `~/workspace/worktrees/sim-medicduty-b`).
Frozen prereg: `evidence/2026-11-16/sim-medicduty-b-prereg.md` (commit
aa3abc3c4). Instrument: `scripts/medicduty-driver-20261116.js`,
`scripts/analyze-medicduty-b.js`, `scripts/test-medicduty-b.js`
(commit bc66bbc4e). Anchor (both legs): `bc66bbc4e296`. Policy:
competent verbatim, sha256
`df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`.
Band 102801–102808 (8 seeds), horizon 150d death-aware, OFF leg first
(recorder off) then ON leg (recorder on). No balanced panel (DIAG, no
game change). No canon doc covers expedition candidate picking or the
duty gate's interaction with it (prereg CANON GAP, recorded not
invented); `docs/PARTY.md` covers party dynamics only.

## VERDICT — DIAG GO

All 4 frozen GO bars hold (see §GO bars). The instrument is valid and
the table is trustworthy. The verdict is the count table itself:

**The medic-duty starvation is REAL on a fresh band, but rarer and
narrower than the haventarget band suggested — and it is not the
dominant zero-launch cause here.** Medic-duty blocks are 6 of 208
attempts (2.9%). Zero-launch seeds are 3 of 8, but only one of the
three is medic-duty-attributable — and it misses the frozen starved
definition by one re-pick (Asher re-picked twice, bar is ≥3). The
other two zero-launch seeds never attempted a launch at all (0
attempts in 150 days): a different, unmeasured starvation mechanism.

## Count table — attempts by block reason per seed (ON leg)

| seed | days | end | attempts | landed | blocked | medic-duty | hurt-no-care | sick | unknown |
|------|------|-----|----------|--------|---------|------------|--------------|------|---------|
| 102801 | 150 | survived | 63 | 55 | 8 | 4 | 1 | 3 | 0 |
| 102802 | 150 | survived | 25 | 25 | 0 | 0 | 0 | 0 | 0 |
| 102803 | 150 | survived | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 102804 | 150 | survived | 65 | 65 | 0 | 0 | 0 | 0 | 0 |
| 102805 | 108 | village-lost | 39 | 39 | 0 | 0 | 0 | 0 | 0 |
| 102806 | 119 | village-lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 102807 | 150 | survived | 2 | 0 | 2 | 2 | 0 | 0 | 0 |
| 102808 | 100 | village-lost | 14 | 14 | 0 | 0 | 0 | 0 | 0 |
| **total** | — | — | **208** | **198** | **10** | **6** | **1** | **3** | **0** |

Blocked share of all attempts: medic-duty 2.9%, sick 1.4%,
hurt-no-care 0.5%, unknown 0%. All 198 landed launches are
`vbrain-party_launch` (dawn-brain `vbrainExecuteDepart`); zero
`random-agency` and zero `winplan-party_launch` attempts fired on the
whole band. Trips: 182 complete, 11 open-at-end, 3 died on expedition,
2 overwritten (see §Overwritten trips).

Comparison with the haventarget band (102201–102208, descriptive
only — different band AND a different policy blob: haventarget ran
the pre-r140 `74a890f0844e` competent, this band the re-pinned
`df9b7dff`): medic-duty blocks 26/198 (13.1%) there vs 6/208 (2.9%)
here; blocked share 95/198 (48%) vs 10/208 (4.8%); zero-launch seeds
3/8 on both bands, but there 3/3 were medic-duty-attributable and
here 1/3 is, below the starved bar. The mechanism is the same — the
dawn brain picks the duty holder and never re-picks — but its bite
varies sharply by band.

## Re-pick table — medic-duty blocks per holder per seed

| seed | holder | blocks | days | seed launches | starved? |
|------|--------|--------|------|---------------|----------|
| 102801 | Tanya (gen_bt919up) | 4 | 24, 24, 28, 28 | 55 | no |
| 102807 | Asher (gen_myf806x) | 2 | 17, 17 | 0 | no (<3 re-picks) |

**Starved seeds (frozen definition: same holder re-picked ≥3 times
AND 0 launches): none.** 102807 is the near miss: Asher was picked
twice on day 17 and the village launched nothing all run, but the
bar is ≥3 and the count is 2 — so the verdict is "not starved by the
frozen definition", not "starved". 102801 shows the other shape: the
same holder re-picked 4 times, yet the seed launched 55 expeditions
— re-picking alone does not starve a village when other candidates
get picked on other days.

## Pool — was a non-duty candidate available on the blocked attempts?

| blocked attempt | holder | poolDepth | pool |
|-----------------|--------|-----------|------|
| 102801 day 24 part 1 | Tanya | 0 | — |
| 102801 day 24 part 2 | Tanya | 3 | Abdelilah, Lucas, Aria |
| 102801 day 28 part 0 | Tanya | 0 | — |
| 102801 day 28 part 1 | Tanya | 1 | Norman |
| 102807 day 17 part 0 | Asher | 1 | Luis |
| 102807 day 17 part 1 | Asher | 1 | Luis |

Pool on medic-duty blocks (n=6): empty 2, non-empty 4, median 1,
max 3. **On 4 of 6 blocks a launch-eligible non-duty villager
existed and was never tried — candidate-selection failure, not
pool exhaustion.** On the other 2 the pool was empty — but both
were Tanya on days when the pool was non-empty one part later
(day 24 part 1: empty; part 2: three people. Day 28 part 0: empty;
part 1: Norman). The pool varies within a day as villagers move,
sicken, and heal, so "pool empty at the attempt" is a
momentary fact, not a property of the village. On 102807, Luis was
available on both of Asher's blocks and was never picked; Luis
himself became the duty holder the next day (day 18).

## Zero-launch seeds — three different stories

- **102803: 0 attempts.** The dawn brain never attempted a launch
  in 150 days. No medic-duty involvement (no attempt to block).
  The village survived to 150d, reached wave 5, standing 275.
- **102806: 0 attempts.** Same: no launch ever attempted, village
  lost day 119, wave 4, standing 175.
- **102807: 2 attempts, both medic-duty-blocked.** The only
  zero-launch seed attributable to medic-duty candidacy. Asher
  re-picked twice on day 17; Luis was in the pool both times.
  Village survived to 150d, reached wave 5, standing 500 — the
  highest on the band, with zero expeditions.

The instrument records only `startExpedition` calls, so it cannot
tell why 102803/102806 never attempted one — no EXPEDITION commit
held, a commit held but never departed, or the agency chance roll
never firing are all invisible to it. That distinction is owed by
the next DIAG on expedition ignition (see §Metric review).

## Blocked launches in detail (the other 4)

- **Sam, 102801 day 56 (hurt-no-care):** 68 HP, no medicine, no
  camp healer at that moment. Tanya, the duty holder, was away on
  her own directed expedition (she had launched at 56/0, exempt),
  so the duty read vacant and the heal check found no healer.
  The fiction voiced it (see §Sense-testing).
- **Ada, 102801 day 62 (sick ×3):** 14 / 39 / 64 HP across parts
  1–2, sick, with a camp healer present. The heal check would
  have patched her (healer present), so the sick gate is the true
  blocker — the reason is 'sick' under both the true gate order
  and the haventarget order. Her HP rises across the three blocks
  (14 → 39 → 64): the healer patched her between attempts, but
  sickness still sat her out each time.
- **Gate-order correction check:** 0 rows change reason relative
  to the haventarget derivation order on this band. The correction
  (pre-call snapshot, true order) was instrument hygiene, not a
  recount — no villager on this band was both sick and
  hurt-without-care at an attempt.

## Overwritten trips — the companion call clobbers a live expedition

12 landed `startExpedition` calls replaced a live expedition record
for the same villager mid-flight. `startExpedition` has no
already-out guard: the companion leg of a `party_launch` overwrites
whatever expedition the companion is already on, and the orphaned
trip's legs/finds vanish with no return ever firing.

- **2 distinguishable orphans** (overwriter in a different part, so
  the keys differ): Tanya's day-56 trip (1 leg, 806 kcal of finds
  lost — Sam's party_launch at 56/1 took her as companion the same
  part she launched her own party); Norman's day-66 trip (1 leg,
  873 kcal lost).
- **10 same-part replacements** (overwriter in the same part the
  trip launched, legs 0–1): Devon ×2, Dylan ×3, Kamil, Ethan,
  Himel, Ada ×2 (102801 days 60/69). The replacement lands in the
  same part the villager launched their own trip, so the orphan and
  the overwriter share a sinceDay/sincePart key and the analyzer
  attributes the single eventual return to the first launch — the
  second trip's legs/finds are silently folded into the first
  row's. Trip counts stay honest (198 landed launches → 182
  complete + 11 open + 3 died + 2 overwritten), but 10 of the
  "complete" trips are key-collisions of two launches.

This is a game behavior the recorder caught, not an instrument
artifact: the same-part pattern (inviter launches, companion call
follows in the same part) is the normal party_launch shape, so a
companion who launched their own party that same part loses it.
Appended to the findings backlog as a new open item.

## Wall numbers — both legs (scale wall)

| | OFF leg | ON leg |
|--|---------|--------|
| national by standing ≥200 | 3/8 (s102802: 435, s102803: 275, s102807: 500) | 3/8 (same seeds) |
| national by scaleRank | 0/8 (all regional) | 0/8 |
| national or global | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave 4 unlocked | 8/8 | 8/8 |
| wave 5 unlocked | 3/8 (s102802, s102803, s102807) | 3/8 |
| median survival | 150d | 150d |
| wave-4 kills (total) | 22 | 22 |
| deaths (total) | 629 | 629 |

Per-seed OFF/ON wall fields agree exactly (days, standing,
scaleRank, deaths, w4kills identical per seed). **D2 full-band: 0
divergences** — the recorder moved nothing. Standing 199 recurs on
3 of 8 seeds (102801/102804/102805), as on the haventarget band.

## Sense-testing

**No say line fires for a blocked launch.** Asher's two blocks on
102807 day 17 produced nothing — no line names the blocked
departure, the re-pick, or the village launching nothing for 150
days. What the fiction DOES say is the duty itself, and it reads
as a noble choice, not a grounding:

- Assignment, seed 102807 day 2: `Asher is staying at Haven as the
  camp healer now — tending the sick instead of ranging out.`
- The duty passing, seed 102807 day 18: `Luis is staying at Haven
  as the camp healer now — tending the sick instead of ranging out.`
- The same line on 102801 day 5 (Tanya), day 56 (Onni, taking the
  duty while Tanya was away on her directed expedition).

The hurt-no-care sit-out DOES get a line, and it fired on the one
hurt-no-care block in the corpus — seed 102801 day 56: `🩹 Sam is
still hurting (68 HP) — no healer at haven. They rest today instead
of ranging out.` It is honest about that moment (Tanya was away, so
there really was no healer at Haven), and it is the only blocked
launch the fiction ever notices. The sick blocks got no line; the
medic-duty blocks got no line; the two zero-attempt villages
(102803, 102806) got no line about never ranging out — their
return lines (`🧭 Vasyl is back from the north...`) come from
non-expedition departures, so the fiction looks busy while the
expedition system never fires.

## Village assessment

The villages on this band look like the standing wall, not the
expedition system, is the binding constraint: 5/8 survive to 150d,
wave 4 unlocks everywhere, wave 5 on 3/8, standing 500 on the seed
that launched nothing at all — but national-by-rank never moves
off regional and the table stays unreached. Expeditions themselves
are busy when they launch (198 trips, 182 complete) — the system
works; it is the candidate picking that fails narrowly and
silently. Tanya's village launched 55 times despite her four
blocks; Asher's launched zero times because of two. The difference
between a working village and a grounded one was two dawn picks on
one day. And on two more seeds the dawn brain never picked anyone
at all — a bigger silence the medic-duty question does not cover.

## GO bars (frozen prereg §Primary metric)

1. **100% classified, unknown 0** — PASS. 208/208 attempts
   classified by block reason (landed → null, blocked → one of
   medic-duty / hurt-no-care / sick / range-0); unknown-block 0,
   D3 re-derivation mismatches 0.
2. **Corpus 16/16 files parse** — PASS. 8 OFF + 8 ON, one file per
   seed per leg; all parse as JSON, 0 instrument errors on every
   file.
3. **Proof green** — PASS. `node scripts/test-medicduty-b.js`:
   **74 passed, 0 failed** on the instrument tip (commit
   bc66bbc4e). D1 determinism + D2 neutrality green inside the
   proof; D2 full-band 0 divergences confirmed by the analyzer.
4. **Wall numbers reported, both legs** — PASS. Table above; ON
   national-by-standing 3, national-by-rank 0, table 0, wins 0,
   wave 4/5 8/3, median survival 150d, wave-4 kills 22, deaths
   629; OFF identical.

## Metric review (do NOT re-score; for the next run)

- **Gate-order correction: 0 reclassifications on this band.**
  The haventarget order (sick before hurt-no-care, post-call
  read) would have produced the same 10 block reasons here. The
  correction stays correct — a villager both sick and
  hurt-without-care would still be mislabelled by the old order —
  but this corpus cannot show the difference. A band with a
  sicker, poorer village would.
- **Pool depth at the attempt is the right availability unit, with
  one caveat:** the pool varies within a day (Tanya's day 24: empty
  at part 1, three people at part 2), so a single attempt's pool is
  a momentary fact. The per-block table captures that; a
  per-day pool (any eligible villager that day) would be the
  steadier unit for the "could anyone have gone" question.
- **The dawn-brain commit pool differs from the launch-eligible
  pool.** The pool counts who COULD launch; it does not say who
  held an EXPEDITION commit that dawn. On 102803/102806 the
  instrument cannot distinguish "no commit" from "commit but no
  depart" from "chance roll never fired" — the next expedition
  DIAG needs a commit/attempt row (who held the commit, what the
  depart returned) before the zero-attempt mechanism can be
  judged.
- **Companion-call rows carry the companion's own dawnCommit, not
  the inviter's.** The recorder reads `vbrainCommit(vid)` for the
  callee, so a companion-call row's `dawnCommit` is the
  companion's own commit (e.g. Tanya's 56/1 row shows her own
  party_launch commit although Sam's launch called her). The
  candidate/block/pool fields are unaffected — only the commit
  attribution on companion rows is misleading. The stack (which
  names the inviter's `vbrainExecuteDepart` frame) is the
  reliable inviter signal.
- **Overwrite key collision:** 10 of 12 overwrites share a
  sinceDay/sincePart key with the trip they replaced (same-part
  companion call), so the analyzer attributes the single return
  to the first launch. The 2 distinguishable orphans are exact;
  the 10 same-part ones are counted as complete with the second
  trip's legs/finds folded in. A per-call trip id (rather than
  vid+since) would separate them.
- **150d horizon was right for the count question** — the
  medic-duty blocks clustered early (days 17–28, all 6 before day
  29); nothing blocked after day 62. A 60d horizon would have
  caught the same 6 blocks.
- **D2 full-band: 0 divergences.** The recorder moved nothing
  (identical days/standing/deaths/w4kills per seed, OFF vs ON).

## Instrument notes (proof-phase, before any judged sim)

- The D3 live check on the proof seed (102801, 60d) caught a
  landed launch with no return/death/open record: Tanya's day-56
  directed party launch was overwritten mid-flight by Sam's
  companion call in the next part. The instrument gained the
  `overwrote` capture + `overwritten` trip status before any
  judged sim ran (driver/analyzer/test all in commit bc66bbc4e);
  the prereg's classification and GO bars are unchanged (an
  overwritten trip is classified, not unknown). The overwrite
  taxonomy is a trip-status refinement, not a re-score.
- The proof run also showed the medic-duty phenomenon reproducing
  on the fresh band within 60 days (4 medic-duty blocks by Tanya
  on 102801) — a preview, not a judged number; the judged 150d
  corpus is the table above.

## Corpora

- ON: `evidence/2026-11-16/perseed-medicduty-b-on/` (8 files)
- OFF: `evidence/2026-11-16/perseed-medicduty-b-off/` (8 files)
- Analysis: `evidence/2026-11-16/medicduty-b-analysis.json`
  (analyzer stdout: onFiles 8, offFiles 8, totalAttempts 208,
  landedLaunches 198, blockedAttempts 10, unknowns 0,
  mismatches 0, d2divergences 0)

## Diff check

Zero `src/` changes in the branch diff (`git diff --stat HEAD --
src/` empty) — DIAG, recorder wraps only (scripts-side). No game
change, no lever, no balance change. Nothing to land as gameplay;
the evidence + corpora are the deliverable.
