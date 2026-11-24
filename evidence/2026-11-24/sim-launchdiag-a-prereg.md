# sim-launchdiag-a — PREREG (frozen)

**Arm:** sim-launchdiag-a · **Loop A run:** fleshout-20261124T0215Z
(ADOPTION of the dead run fleshout-20261123T2315Z)
**Axis:** scale-onramp · **Type:** DIAGNOSTIC — instrument only, zero
`src/js` changes. No game-code default change is expected on either
sub-arm; if a fix is found worth landing, it is reported, not flipped.
**Base master:** `7344d8a56` (worktree
`~/workspace/worktrees/sim-launchdiag-a`, branch `sim-launchdiag-a`;
fast-forwarded from `f5d2c3caa` onto local master tip at run start
2026-11-24 ~02:30 UTC; branch held zero own commits, verified clean
before the fast-forward).
**Frozen:** 2026-11-24 ~02:45 UTC, before any judged run. No judged
run has run.

## 0. Why this run (read first)

Two tracker blanks, one tree, run sequentially. Both are DIAG
instrument arms on frozen corpora + harness fixtures. Nothing in
either sub-arm re-selects a seed band or re-runs a sim band.

- **(1a) pick-early-return delay-vs-wall** (tracker blank #5, from run
  fleshout-20261123T2015Z / sim-musterask-a,
  evidence/2026-11-23/sim-musterask-a.md §9): of the 82 never-scored
  holder-days, 14 are `pick-early-return` (EAT 12, SEEK 2) — the
  holder was picked, but hunger answered before the line-660 feed,
  and the same-day commit then blocked the rest of the day. The
  musterask evidence calls this "the largest single *fixable*
  silence class that is not a succession artifact" and asks the next
  arm's question: on those 14 days, is the dawn body gate a one-day
  DELAY (the holder is asked the next day) or the first WALL (the
  silence persists)? This sub-arm classifies each of the 14 days by
  next-day fate.
- **(1b) corpseloot — Omar's corpse thread** (tracker blank #3;
  context evidence/2026-11-22/sim-gunloss-a.md,
  evidence/2026-11-23/sim-rearm-b.md): Omar's gun + worn cell went
  onto his corpse when he died in the wild as the scholar (day 136,
  seed 107369) and nobody ever took them; the cellgate sense-test
  (Emma Larsen, seed 107539) ends the same way — a gun on an
  unburied corpse, never looted. The question: do villagers ever
  loot a scholar's / wild corpse? Census corpse-takes by taker kind
  on the frozen bands, plus a forced wild-corpse fixture (gun+cells)
  that tests the exact channel live.

## 0a. What the code already says (read before the run)

### (1a) The dawn body gate

Per musterask prereg §0a (base `dbe748d46`, unchanged on this base
for the cited files — `src/js/villager-objectives.js`,
`src/js/villager-brain.js` byte-identical in the rebase range, verified
by `git diff f5d2c3caa..7344d8a56 --stat` showing no change to either
file): `objPick` early returns (REST/EAT/SEEK/HAUL/LEAVE) fire before
the line-660 `vbrainFeedExtras` call, so a holder picked by an early
return is never fed, never scored — and the gate pick writes a
same-day brain commit (`vbrainLogGate`) blocking any mid-day refresh.
The next-day question is therefore purely empirical: does the holder
come back to the dawn fire fed and asked tomorrow, or does the same
gate (or another dawn cause) eat tomorrow too?

### (1b) Who can take from a corpse

Read from `src/js/corpses.js` on this base (line numbers current):

- **Scholar-only loot:** every `corpseTakeItem` / `lootCorpse` path
  is scholar-only (`lootCorpse`, corpses.js:708, requires the scholar
  on the same node + adjacent cell). Villagers have NO general
  corpse-loot path.
- **The only villager corpse-take is the re-arm** (corpses.js:1049–
  1265, sim-rearm-b): `villagerRearmFromCorpse` moves a searcaster +
  fusion cells, and ONLY when (a) `REARM_CELLS=1` (env-gated,
  default off — `_rearmCellsOn`, corpses.js:1081), (b) cells sit on
  the corpse ("no cells, no take — a dry gun alone is not a second
  life"), (c) the taker needs it (dry holder takes cells only;
  gun-less takes gun + cells; already-armed takes nothing), and
  (d) the taker perceived the corpse — fight witness at the death
  (`villagerRearmWitnessTake`, called from `registerDeath`,
  corpses.js:326–330) or same Haven tile at the fire
  (`villagerRearmHavenSweep`, once a day from `endDay`,
  corpses.js:1238, takers from `campPeopleIds('haven')`, never a
  roster scan).
- **Scholar deaths record no witnesses:** `playerDeath`
  (ledger.js:658) calls `registerDeath({kind:'villager', ...})`
  with NO `node` and NO `witnesses` (ledger.js:747). The corpse node
  defaults to the scholar's map position at death
  (`opts.node || {x: map.px, y: map.py}`, corpses.js:257) — a wild
  death leaves a wild corpse — and `witnesses: []` means the witness
  channel can NEVER fire on a scholar's corpse.
- **The village brings the scholar home:** `recoverBearer`
  (corpses.js:950, fired from `endDay` one day after the death, game
  .js:34407) moves a dead scholar's corpse to the Haven node
  (`c.node = {hx, hy}`, `c.mx = 4, c.my = 4`) with the death pack
  riding on it. `endDay` then runs the Haven sweep immediately
  after (game.js:34412). So a scholar's wild gun reaches Haven one
  day late — and only then can the sweep take it (REARM on).
- **Villager corpses are NOT recovered:** `recoverBearer` serves
  only `v.pendingBurials`, which only `playerDeath` writes. A
  villager who dies in the wild leaves a wild corpse forever; the
  Haven sweep (same-tile only) can never reach it, and only a death
  -time witness can take from it.

## 1. Sub-arm (1a) — frozen judged set

The 14 `pick-early-return` holder-days, re-extracted verbatim from
`evidence/2026-11-23/musterask-a-analysis.json` (`neverScored` rows
with cause `never-asked:pick-early-return`). No other days are
judged; no day is added or dropped.

| # | Seed | Day | Holder | Stage | Target | Early-return kinds |
|---|---|---|---|---|---|---|
| 1 | 107617 | 109 | visjoin_84 | party | congregation | EAT@p1, EAT@p3 |
| 2 | 107617 | 136 | visjoin_130 | party | herald | SEEK@p0; mid-day refresh refused (same-day commit, part 2) |
| 3 | 107620 | 141 | visjoin_135 | party | eulogy | SEEK@p1, EAT@p3 |
| 4 | 107620 | 144 | visjoin_135 | party | eulogy | EAT@p2 |
| 5 | 107622 | 120 | james_okonkwo | standing | reunion | EAT@p0, EAT@p3 |
| 6 | 107623 | 124 | daniyar_askarov | party | herald | EAT@p1, EAT@p3; mid-day refresh refused (same-day commit, part 2) |
| 7 | 107623 | 126 | daniyar_askarov | party | herald | EAT@p1 |
| 8 | 107624 | 74 | sofia_chen | hunt | congregation | EAT@p2, EAT@p3 |
| 9 | 107624 | 74 | tashi_sherpa | hunt | congregation | EAT@p2, EAT@p3 |
| 10 | 107624 | 79 | gen_o96e0k3 | hunt | congregation | EAT@p1, EAT@p2 |
| 11 | 107624 | 116 | meera_reddy | hunt | congregation | EAT@p2, EAT@p3 |
| 12 | 107624 | 116 | sofia_chen | hunt | congregation | EAT@p2 |
| 13 | 107624 | 117 | meera_reddy | hunt | congregation | EAT@p1, EAT@p2, EAT@p3 |
| 14 | 107624 | 120 | henry_zhang | hunt | congregation | EAT@p2 |

Notes frozen with the set: #10 `gen_o96e0k3` is Otto Herrera, who
becomes the scholar on d81 — d79 is BEFORE his succession, so he is
a villager on the judged day. #8/#9 and #11/#12 are two holders on
the same day; each holder-day is classified independently. Max
judged day is 144; all five seeds survived to 150d, so no D+1 falls
past the run end (verified by the analyzer; if it ever did, that day
would classify `unclassified`, never guessed).

### 1a. Judged corpus (frozen — replay, reuse required)

`evidence/2026-11-23/perseed-musterask-a-ctl/` (8 seeds,
107617–107624, anchor `dbe748d46`, competent verbatim, 150d
death-aware) — the musterask replay WITH the dawn-body tracer
streams (`dawnState`, `objTickTrace`, `objPickLog`, `refreshLog`),
already on master. **No new sim run is made and none is permitted
for this sub-arm:** the musterask driver hard-refuses unless HEAD
IS `dbe748d46` (`scripts/musterask-driver-a.js:1800`), and this
branch sits on `7344d8a56` (25 `src/js` commits past the gunloss
anchor alone). Re-freezing the driver would be a different
experiment, not the frozen replay. The replay already exists; reuse
is required by the brief. Determinism of the underlying sims was
proven by musterask (fresh 107617 replay byte-identical to the
inherited file; game fields identical on all 8 seeds — evidence
§4). The new analyzer reads the frozen corpora read-only and never
writes into them.

## 2. Sub-arm (1a) — taxonomy: next-day fate (first match wins)

For each judged day (seed, D, vid), the fate on day D+1, read from
the frozen corpus of that seed:

| Class | Verdict side | Corpus-grounded definition |
|---|---|---|
| `delay-scored-next-day` | DELAY | A `muster` row exists for the holder on day D+1 (any part, any askKind — the feed ran with their plan; the ask happened, whatever the pool said). |
| `delay-launched-next-day` | DELAY | No muster row on D+1, but a `v4departs` row for the holder on D+1 (`result: launch`) — the plan departed; the silence did not block the ask's outcome. |
| `wall-early-return-again` | WALL | No muster row and no launch on D+1, and the D+1 cause (re-derived by the musterask extended taxonomy from the same corpus) is `pick-early-return` again. The detail names the D+1 kinds. |
| `wall-other-dawn-cause` | WALL | No muster row and no launch on D+1, and the D+1 cause is another dawn cause (`holder-scholar-at-dawn`, `holder-away-at-dawn`, `holder-on-expedition-at-dawn`, `holder-engaged-at-dawn`, `objective-live-all-day`, `plan-created-after-dawn`). The detail names it. |
| `wall-holder-dead` | WALL | A `deaths` row for the holder with day ≤ D+1 (holder dead by end of D+1). |
| `wall-plan-gone` | WALL | No `planCensus` row with a wave-4+ plan (`needWave >= 4`) for the holder on D+1 — the plan was dropped / completed / abandoned; the question dissolved, not deferred. Checked only after the dead check (a dead holder has no plan row either). |
| `wall-village-lost` | WALL | The corpus `days`/`endReason` show the village lost on or before D+1. |
| `unclassified` | — | None of the above named it. Counts against bar 1. |

Order matters: scored/launch first (the ask resolved), then the
D+1 dawn cause, then dead, then plan-gone, then village-lost.
Secondary (recorded, NOT judged): the first scored day within
D+1..D+3, if any — context for whether a WALL on D+1 is a one-day
or multi-day silence.

NOT a class: the D+1 pool state. A scored D+1 with eligible 0 is
still DELAY — the question is the body gate, not the pool.

## 3. Sub-arm (1a) — bars (judge — DIAG-GO / DIAG-NO-GO)

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — classification completeness | ≥ 13/14 judged holder-days named with a concrete next-day class (≥ 90%, the musterask bar; ≤ 1 `unclassified`). |
| 2 | PRIMARY — mechanism proof | Each named class proven by ≥ 1 probe: seed/day/vid + the corpus row that names it (muster row, v4departs row, D+1 cause + its dawn rows, death row, planCensus absence). A label alone does not count. |
| 3 | Instrument validity | Proof test `scripts/test-launchdiag-a.js` green; analyzer `scripts/analyze-launchdiag-a.js --selftest` green; 0 instrument errors on the judged corpora; D+1 cause cross-check: the analyzer's re-derived D+1 causes reproduce the musterask analysis's `neverScored` causes on every re-derived D+1 day. |
| 4 | Determinism | Analyzer run twice over the frozen corpora → byte-identical classification output; the 14-day set re-extracted from the frozen analysis JSON matches the §1 table exactly (same seeds/days/vids/kinds). |
| 5 | Instrument errors | 0 instrument errors on all judged corpora. |

**Verdict rule:** DIAG-GO iff bars 1–5 pass. The finding is the
DELAY/WALL split itself: if ≥ half the 14 are WALL (still silent on
D+1), the dawn body gate forms the first wall on those days, not a
one-day deferral; if ≥ half are DELAY, it is a one-day deferral and
the wall sits elsewhere. Either split is a GO finding — the verdict
judges the classification, never the split direction. Balanced panel
(§15): N/A — single control leg, no before/after comparison.

## 4. Sub-arm (1a) — sense-test (frozen)

Two day-pairs, read as stories whatever they classify as:

- **s107617 d109→d110, visjoin_84** (the musterask §7 sense case):
  d109 he spent finishing a chore and eating twice (EAT@p1, EAT@p3);
  d110 he was scored again at dawn. Judge whether the next-day ask
  reads as a man fed and back at the fire, or as a scorer that only
  sometimes notices him.
- **s107624 d116→d117, meera_reddy:** EAT@p2, EAT@p3 on d116 and
  EAT@p1, EAT@p2, EAT@p3 on d117 — three eats in one day. Judge
  whether a two-day hunger silence reads as a body in genuine need
  or as a gate that never lets go.

## 5. Sub-arm (1b) — census (frozen corpora)

Census every `corpseTakeEvents` row (scholar takes, choke point
`_corpseTakeStack`) plus every `rearmTakeEvents` row (villager
re-arm takes) on three frozen bands. No new sims.

| Band | Corpus | Seeds | REARM | Anchor |
|---|---|---|---|---|
| gunloss | `evidence/2026-11-22/perseed-gunloss-a-diag/` | 107369 (1) | off | `c8c30bd55` |
| corpsecap | `evidence/2026-11-21/perseed-corpsecap-a-diag/` | 107271–107278 (8) | off | `c55bc8503` |
| rearm-b ctl | `evidence/2026-11-21/perseed-rearm-b-ctl/` | 107533–107548 (16) | off | `ca5f8f987` |
| rearm-b arm | `evidence/2026-11-21/perseed-rearm-b-arm/` | 107533–107548 (16) | on | `ca5f8f987` |

Census fields per take: taker kind (scholar / villager), channel
(`haven` / `witness` — rearm rows only; scholar rows carry no
channel in the frozen data), item (gun / cells / other), corpseVid,
corpse kind (person vs non-person: `corpseVid` null ⇒ non-person
corpse — the drivers record `c.villagerId`, null for monster /
animal corpses; verified against the driver wraps before judging).

**Corpse location is NOT in the frozen rows** (the `deaths` rows
carry no node; `corpseTakeEvents` carry no node) — the analyzer
records location as `unrecorded`, never guessed. The location
question is answered live by the fixture (§6), not by re-reading
the frozen corpora.

### Pre-registered expectations (from reads, NOT judged results)

Recorded here before judging so the census confirms or overturns
them:

- gunloss: 50 takes, all scholar, 0 gun/cell takes (Omar's gun
  never taken — gunloss evidence §0).
- corpsecap: 405 takes, all scholar, 3 gun/cell takes — all scholar,
  all seed 107275 (fusion_cell d66 from katarina_novak; searcaster +
  fusion_cell d113 from giulia_bianchi — corpsecap evidence §1/§5).
- rearm-b ctl: 956 takes, all scholar; rearm-b arm: 965 takes, all
  scholar, PLUS 4 villager rearm takes, all `haven` channel, 0
  `witness` (rearm evidence §2–§3). Gun/cell scholar takes 4 per
  leg (s107539 d61 searcaster from corpse_57, corpseVid null — a
  non-person corpse, flagged for the analyzer to name; s107545 d78
  gun+cell from elena_petrova; s107547 d116 cell from yuki_mori).
- Emma Larsen, seed 107539, armed leg: died d86 "the wild" as the
  scholar (`player: true`); her corpse `corpse_86_z6zl89` holds the
  gun with **0 cells** at d148 — the cells-gate explains the
  never-looted gun (rearm-b §10 + cellgate sense-test). The census
  must reproduce this row exactly (gun 1, cells 0, unburied).

## 6. Sub-arm (1b) — forced wild-corpse fixture (live harness)

`scripts/test-launchdiag-corpseloot-a.js` — in-memory harness
fixtures, no repo writes, staged with the test-rearm-b `--live`
pattern (`stageArrival` gives a holder searcaster + 2 cells;
`Game.registerDeath` builds the corpse). Each cell states the
code-predicted outcome BEFORE running (the prediction IS the bar).

| Cell | Setup (gun + 2 cells unless noted) | REARM | Prediction (code §0a) |
|---|---|---|---|
| F1 | Villager holder dies in the WILD, no witnesses. Haven sweeps × 3 days. | on | NO take — wild corpse, never at Haven; villager corpses are not recovered. Corpse keeps gun + 2 cells. |
| F2 | Villager holder dies at HAVEN (corpse node = Haven). Haven sweep. | on | TAKE (second-life, haven channel) — the rearm-b path re-proven in this arm's harness. |
| F3 | SCHOLAR dies in the WILD holding gun + 2 cells (playerDeath-faithful setup: `registerDeath` wild node + `pendingBurials` entry, mirroring ledger.js:747–751). Run `endDay` → `recoverBearer` moves the corpse to Haven → sweep. | on | TAKE on the day after death (second-life, haven channel) — Omar's case WITH the lever on: the gun gets its second life one day late. |
| F4 | Same as F3. | off | NO take even after recovery — the take is the lever, not the recovery. Corpse keeps gun + 2 cells at Haven. |
| F5 | Villager holder dies in the WILD WITH a witness present. | on | TAKE at death time (second-life, witness channel) — the only wild path. |
| F6 | Same as F5. | off | NO take — witness channel is env-gated. |
| F7 | SCHOLAR dies in the WILD holding gun + 0 cells (dry gun — Emma s107539 live). Recovery + sweep. | on | NO take — cells-gated; a dry gun alone is not a second life. |
| F8 | Villager holder dies in the WILD, no witnesses; the SCHOLAR (successor) walks to the corpse node and calls `lootCorpse`. | n/a | TAKE by the scholar (scholar-only path, proximity-gated) — the control proving the wild corpse IS lootable, just not by villagers. |

F3's setup note: `playerDeath` itself is not called (it runs the
full mantle/succession); the fixture mirrors its two corpse-visible
writes (`registerDeath` with the scholar's vid + wild node, and the
`pendingBurials` push) and documents the mirror. The mechanism under
test (recoverBearer → Haven sweep) reads only those two writes.

## 7. Sub-arm (1b) — bars (judge — DIAG-GO / DIAG-NO-GO)

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — census completeness | Every corpse-take event on the three bands classified by taker kind, 0 unclassified; every gun/cell take has its corpse kind named (person / non-person). |
| 2 | PRIMARY — fixture proof | Fixture matrix F1–F8: every cell behaves as its §6 prediction (take / no-take + channel + day). The wild-scholar-corpse question (F3/F4) is answered with a recorded take/no-take on the named day. |
| 3 | Instrument validity | Proof test `scripts/test-launchdiag-corpseloot-a.js` green (fixture matrix + census fixtures + analyzer selftest); census totals reproduce the frozen analyses' counts (gunloss 50, corpsecap 405, rearm ctl 956 + arm 965 scholar takes, 4 rearm takes); 0 instrument errors. |
| 4 | Determinism | Census analyzer run twice over the frozen corpora → byte-identical output; fixture matrix run twice (same seeds) → identical take/no-take per cell. |
| 5 | Instrument errors | 0 instrument errors on all judged corpora and fixture runs. |

**Verdict rule:** DIAG-GO iff bars 1–5 pass. The finding names the
answer in one line: villagers loot a scholar's / wild corpse never /
only via (channel), proven by census counts + fixture cells. If the
fixture shows a take the code says cannot happen (e.g. F1 takes),
the verdict is DIAG-NO-GO on the code reading and the evidence says
which line lied. Balanced panel (§15): N/A — census + fixture, no
before/after comparison.

## 8. Sub-arm (1b) — sense-test (frozen)

- **s107275 d113, giulia_bianchi** (corpsecap evidence §5, cited
  not re-read): the scholar strips her whole death pack in one pass
  — nine `loot_taken` rows, the gun one line among nine, no grief
  beat. The census must not re-litigate this; it cites it.
- **Fixture F3's say line** (new material): the take is voiced
  ("lifts …'s Searcaster from the body"). Judge whether the line
  reads as a village moment when it fires one day after the
  scholar's wild death, or as a mechanic firing on a schedule.

## 9. Wall numbers (reported every run, never judged)

- (1a) musterask replay corpus, 8 seeds: wins 0, national 0, table
  0, wave-5 reached 3, wave-4 reached 8, median survival 150, max
  150, villages lost 2, total deaths 778 (musterask evidence §6 —
  the analyzer reproduces these from the frozen corpora as a
  consistency check).
- (1b) frozen bands: gunloss 1 seed (lost d145, wave 4, standing
  199); corpsecap 8 seeds (wins 0, national 0, wave-5 3/8, wave-4
  8/8, median 150.5); rearm-b 16/leg (wins 0, national 0, wave-5
  11/16, median 149).

## 10. Metric review (to fill at evidence time, never mid-run)

- (1a) Whether the DELAY/WALL split shows the body gate as a wall
  or a one-day deferral, and on how many of the 14 the same gate
  fires again the next day (wall-early-return-again count).
- (1a) Whether any WALL day is a succession artifact in disguise
  (holder-scholar-at-dawn on D+1) rather than a body fact.
- (1a) Whether the D+1..D+3 secondary shows WALL days resolving
  within 3 days or persisting longer.
- (1b) Whether the census overturns any §5 expectation, and whether
  the s107539 d61 non-person-corpse searcaster take is a kill-loot
  gun (name the corpse kind from the corpus, do not guess).
- (1b) Whether F3's one-day-late take changes the Omar reading
  (the gun was recoverable with the lever on, one day after death)
  or the gunloss band's REARM-off setting is the whole story.
- (1b) Whether any fixture cell contradicts its §6 prediction, and
  which code line the contradiction points at.

## 11. Freshness check (record)

No new seed band is used anywhere in this arm: (1a) replays frozen
band 107617–107624 by design (freshness verified by sim-muster-a,
prereg §11); (1b) reuses frozen bands 107369, 107271–107278,
107533–107548 by design; the (1b) fixture uses harness seeds only
(fixed staging seeds, no sim band). Nothing re-banded, nothing
re-selected. The seed-band skill was not needed for a new band
choice; this section records that none was made.

## 12. Canon note (read first, per the brief)

Read: `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave 4/5 gates:
standing ≥ 100 / ≥ 200 + wave-4 faced; readiness bars
armored/armed/tricks/veterans). **No canon doc covers the win-plan
muster** (musterask prereg §12) or **villager corpse-looting** —
the re-arm mechanism is grounded in code only (`src/js/corpses.js`
`villagerRearmFromCorpse` / witness take / Haven sweep, with call
text cited in §0a). Nothing in either taxonomy is invented canon;
where the frozen corpora are silent (corpse location), the analyzer
says `unrecorded` rather than guessing.

## 13. Findings update (for the coordinator)

- (1a) update to tracker blank #5 (pick-early-return delay-vs-wall):
  the coordinator appends the verdict from the evidence file; this
  arm writes the update text as a section in
  `evidence/2026-11-24/sim-launchdiag-a.md` and states it verbatim
  in its final report. This arm does NOT edit files outside its
  worktree.
- (1b) update to tracker blank #3 (Omar's corpse thread): same
  handling.

## 14. Files (planned)

- Prereg (this file): `evidence/2026-11-24/sim-launchdiag-a-prereg.md`
- Evidence: `evidence/2026-11-24/sim-launchdiag-a.md`
- (1a) analyzer: `scripts/analyze-launchdiag-a.js`; proof test:
  `scripts/test-launchdiag-a.js`; analysis:
  `evidence/2026-11-24/launchdiag-a-analysis.json`
- (1b) census analyzer: `scripts/analyze-launchdiag-corpseloot-a.js`;
  fixture + proof test: `scripts/test-launchdiag-corpseloot-a.js`;
  analysis: `evidence/2026-11-24/launchdiag-corpseloot-a-analysis.json`
