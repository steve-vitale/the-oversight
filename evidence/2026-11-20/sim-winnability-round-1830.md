# sim-winnability-round-1830 — Loop B lever round, 2026-11-20 18:30Z (adoption closeout)

**Run:** fleshout-loop-b-20261120T1830Z, axis winnability chain. Coordinator timed out
before closeout; this record is the adoption closeout (verified against git/files,
not taken from the handoff on trust).
**Master at closeout:** `ef5e65cb1` (includes Lane A scale r247 `b6a551691` and Lane B
succession r258 `ef5e65cb1`, both landed mid-adoption — see Infrastructure).
**Verdicts:** dmgcheck BAND VARIANCE (#2627 RESOLVED) · sense3 GO diagnostic (#2619
ANSWERED) · reseed NO-GO METRIC-BROKEN (#2626 stays OPEN, HELD unmerged).

## Arm 1 — sim-dmgcheck-b: BAND VARIANCE, merged `9b14b0b93`

The decisive check the 1530Z round owed first: re-run the dmgsurvey instrument on
its designated band 106181–106188 on the current base, before choosing between a
4th-band screen and fixing the launch engine. Base `d352834ef`, policy competent
verbatim `1884c8852d38`, 150d death-aware, 8 seeds.

- Launches **16** (bar ≥ 12), first-fights **9 counted / 6 distinct** (bar ≥ 6),
  fled 6, killed 0, died 3, no-fight launches 7, quad launches 9, trio 12.
- The reproduction is exact, not aggregate-equal: `v4departs` and `v4encounters`
  are byte-identical to the dmgsurvey corpora on all 8 seeds — same days, deaths,
  standing. The r149 fight-step policy change is proven launch-neutral.
- Wall: wins 0, national 0, table 0, wave 5 2/8, wave 4 7/8, median 150d,
  survived 5/8, deaths 713, starvation 4, standing exactly 199 on 4/8.
- Proof `scripts/test-dmgcheck-b.js` **34/34**, re-run green on the rebased tip;
  analyzer selftest 26/26. Instrument + evidence only, 0 `src/js` changes.
- **Finding #2627 RESOLVED as band variance.** The 1530Z collapse (9 launches /
  24 seeds on fresh bands) was the seed draw, not the base. No bisect owed.
  Designation stands for the next dmgshape run (plan on 6 distinct fled fights;
  port ALLYSLOT3 first and re-verify the pool on arrival). Next step per the
  frozen bars: the 4th-band screen 106241–106248 — coordinator-authorized,
  fresh prereg — now a lottery ticket against a proven-working engine, not a
  broken one.
- Evidence: `evidence/2026-11-20/sim-dmgcheck-b.md` + prereg + survey JSON +
  corpora `perseed-dmgcheck-b-106181-106188/` (commits `693c325e7`–`9b14b0b93`).

## Arm 2 — sim-sense3-b: GO (diagnostic), merged `c0ac4c3c9`

The third-ally sense investigation (finding #2619): why does a launched quad's
sense never return a third companion to a live wave-4+ fight? Base `d352834ef`,
fresh band 106251–106258 (verified fresh) + designated-band reproduction corpus
106181–106188, 150d death-aware, substrate SENSEEXPED=1 PARTYSIZE4=1
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1, ALLYSLOT3 absent.

**Answer: THE DISSOLVING QUAD + THE THREE-HOPELESS-ROUND WALL.**
- Gate 1 — the dissolving quad: a launch is a one-dawn decision, re-scored
  daily; the launcher may not travel and companions churn overnight. Fresh
  band: 3 counted quad launches → 0 three-vid encounters in 143. Designated
  band: the sense returns 3 only when a party actually holds together
  (tashi d131–d135, sari d138–d140).
- Gate 2 — the three-hopeless-round wall: the third shout needs three hopeless
  rounds (rounds 2, 3, 4 — one shout per hopeless round) and live wave-4
  fights end first. On the designated band the sense returned three companions
  8 times and every one of those fights ended with at most 1 shout.
- The door is closed by construction: only `aidFight` sets `allyFromStart`,
  and it overwrites `allyVids` first (0/156 + 0/143).
- Next lever shape (for the next arm): **PIN THE QUAD + OPEN THE DOOR** — the
  pinned launch party travels as a unit and its companions enter at the door
  (or the third companion joins on the second hopeless round — the next arm's
  prereg chooses the variant). Panel against the sense3-b control band on
  `ally3Vid` rate, `ally3Dealt`, wave-4 kill conversion.
- Wall: wins 0, national 0, table 0 both bands; wave 5 3/8 both; wave 4 7/8
  designated / 8/8 fresh; survived 5/8 / 3/8; median 151d / 136d.
- Proof `scripts/test-sense3-b.js` **20/20 on the judged base** (`d352834ef`,
  verified by the adoption on the pre-rebase tip `fa96cafb8`); **19/20 on the
  rebased tip** — the single §0 failure is a base-identity artifact, not an
  arm regression: the rebase pulled in Lane A's scale r247 landing
  (`b6a551691`, `src/js/convo-dialogue.js` +17/−1, settled-favor naming),
  and the §0 pin measures branch-vs-frozen-base src diff. Verified by the
  adoption: the diff frozen-base→rebased-tip is byte-identical to the diff
  frozen-base→r247 — the arm contributed zero src drift — and the arm's diff
  vs current master is 0 `src/js`. No assertion was loosened. Analyzer
  selftest 17/17.
- **Finding #2619 ANSWERED** (mechanism named with encounter-level evidence;
  update already filed to `sim-findings.md` by the arm worker, verified
  present by the adoption). The "4th member's damage" question stays
  unmeasurable from live first-fights until the lever lands.
- Evidence: `evidence/2026-11-20/sim-sense3-b.md` + prereg + analysis +
  corpora `perseed-sense3-b/` (commits `13bcc3020`–`c0ac4c3c9`).

## Arm 3 — sim-reseed-b: NO-GO METRIC-BROKEN, HELD unmerged at `0f34690b7`

The #2626 re-seed lever (fresh prereg, new arm): when a plan's target is
dead at commit time, re-seed the plan from a rumor the holder actually
heard (fought species → fight memories → village fire knowledge), or expire
the plan with a fireside beat. Base `e103a64cc`, band 106081–106092 (12
seeds), 150d death-aware, substrate SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FLEEREPAIR2=1 FIGHTALLY2=1, ALLYSLOT3 absent. Proofs 96/96 + analyzer
selftest 40/40, re-run green by the adoption on the committed tip.

- **The re-seed works in live play.** Dead-target launches 2/16 → **0/18**
  armed; 6 re-seed commits, 4 re-seed launches; the 106081 pair (Frieda +
  Chantal) that never fought again on the targetless arm re-seeded
  herald→reunion d119 and launched. The 106084 dead pair is gone.
- **The expiry half never fired.** `planExpiries` 0 on all 12 armed seeds —
  a rumor was always available — so the re-seed bar's part (b) and the
  holders-fight-again bar have no denominator: METRIC-BROKEN per the frozen
  prereg, not a pass and not a fail of the mechanism.
- Guardrail (revised 12-seed band, coordinator-set before legs ran): PASS —
  survived 7=7, median 150=150d, starvation 3 vs 4 control. Seed flips cancel
  (106084 survived→lost d106, 106091 lost→survived). One seed paid for the
  re-seed (106081 standing 410/wave 5 → 199/wave 4). Two re-seeds never
  launched (106091 Wenhao + Nikolai, range-0 through d149).
- Wall: wins 0, national 0, table 0 both legs; wave 5 7→6, wave 4 12→12,
  standing ≥ 200 7→6, median 150d→150d, survived 7→7, deaths 170→162.
- **Disposition: HELD, not merged** — the arm's own evidence recommends
  against merging on this verdict, and the held-arm precedent holds (no
  held-arm evidence is on master: targetless / deadsuppress / deadgate
  evidence is absent from master; only round records land). The full arm
  (game code + evidence + instrument) is committed on branch `sim-reseed-b`
  at `0f34690b7`; worktree left in place and heartbeated (21:00:34Z).
  **#2626 stays OPEN** (update already filed by the arm worker, verified
  present). What would close it: a band/condition where expiries actually
  occur (rumor-poor holders), or a coordinator call to judge the re-seed
  on part (a) + dead-0 + guardrail alone.
- Gate: `check.js --quick` on the worktree **335 passed, 9 failed**
  (`reseed-b-check-quick.log`, 1477s) — 0 attributable. The 9: 5 standing-set
  (measurement-proof staleness pair ×2, phone-frame stale receipt ×1,
  deed-attainment 120s timeouts ×2) + 4 load timeouts at the 120s cap with
  no assertion failure (occupation-panels, trust-observer-neutrality,
  synergy-stall, capable-bot — the last verified green standalone twice
  before). Telemetry check: designed refusal (recorder-corpus input) on
  both legs, identical — no LOUD lines, no baseline rolled.
- Evidence: `evidence/2026-11-20/sim-reseed-b.md` + prereg + panel +
  corpora `perseed-reseed-b-control/` + `perseed-reseed-b-armed/` (on the
  held branch, not on master).

## Wall (round)

Wins 0, national 0, table 0 on every judged band. Wave 5: 2–7/8 by band;
wave 4: 7–8/8; median survival 136–150d. The launch engine is proven
working on its designated band (16 launches, 9 first-fights, byte-identical
corpora) while fresh bands still launch thin — the drought was band
variance, but band-to-band variance itself is still unmeasured. The third
ally's absence is now a named two-gate mechanism with a concrete lever
shape. The re-seed half of #2626 is proven; its expiry half is unmeasured.

## Telemetry

Designed refusals (recorder-corpus input) for sense3 and reseed with the
absolute baseline path (the sense3 worker's relative-path failure is
corrected here — the baseline exists at goal
`hidden_files/telemetry-baselines/scale-wall.json`). No LOUD lines, no
baseline rolled. Dmgcheck ran no telemetry (single-band check, no
before/after; recorder corpora).

## Infrastructure

- Write flap: QUIET this round (all probes first-attempt OK).
- Safe-commit index clobber struck once (reseed commit `0f34690b7`) —
  repaired via the documented `ls-tree -r` pipe, status + diff HEAD verified
  empty, hash-object == HEAD blob.
- Registry-lock contention at closeout: the release chain queued ~11 min
  behind a live reaper scan and the r258 adoption's own release
  (journey2-succession released merged in the same window). No D-state
  processes; the queue cleared on its own.
- Master moved twice mid-adoption: `b6a551691` (Lane A scale r247, incl. a
  `src/js/convo-dialogue.js` fix) then `ef5e65cb1` (Lane B succession r258,
  self-witness fix). Both rebases were clean; dmgcheck proof re-ran 34/34
  on the new tip, sense3's §0 artifact is adjudicated above.
- A temporary verify worktree (`sim-sense3-verify`) was registered to
  confirm the sense3 proof on its pre-rebase tip, then removed + branch
  deleted + registry released done-abandoned (the proof was instead
  confirmed 20/20 via a detached checkout in the arm's own worktree,
  returned to `c0ac4c3c9`, status clean).
- Gate: no fresh full `check.js` on the merged tip (round-record commit is
  evidence-only, no `src/js` change); arm gates as recorded above, 0
  attributable. Reseed's 335/9 gate is the only full gate this round.

## Convergence state

Winnability chain stays converging (NOT converged): #2627 resolved (launch
collapse was band variance), #2619 answered (third-ally absence is the
dissolving quad + the three-hopeless-round wall, lever shape concrete),
#2626 re-seed half proven but expiry half unmeasured and the fix unlanded.
Next blanks, in order: (1) #2605 damage — 4th-band screen 106241–106248
against the proven-working engine (fresh prereg; the designated band
106181–106188 stands for the next dmgshape run, ALLYSLOT3 port first);
(2) #2619 lever — pin the quad + open the door (prereg chooses door vs
second-hopeless-round variant; panel on ally3Vid rate, ally3Dealt, wave-4
kill conversion); (3) #2626 expiry — a rumor-poor band/condition where
expiries occur, or a coordinator call to judge the re-seed on part (a) +
dead-0 + guardrail. The standing walls — launch decision + damage, deed
gate after national, standing-199 stall — are unchanged by this round.
Claim deleted; lock deleted.

Evidence: evidence/2026-11-20/sim-winnability-round-1830.md (this file);
arm evidence evidence/2026-11-20/sim-dmgcheck-b.md + sim-sense3-b.md
(on master) and sim-reseed-b.md (held branch `sim-reseed-b` @ `0f34690b7`).
