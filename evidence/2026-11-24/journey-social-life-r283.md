# Journey — social life r283 (Lane B, leg 5)

Run: `playtest-loop2-20261124T1600Z` adopting the timed-out
`playtest-loop2-20261124T1455Z` (r283). Base at adoption: master
`500d65ea7`; master has since moved to `9810670a0` (sim-w5lateface-b
+ sim-scale-onramp-round-1215) — rebase before merge, gate on the
rebased tip. Worktree `journey2-social`, branch `journey2-social`.
Rotation-b read 5 at run start (social life); this run plays 5 and
writes 6 at closeout.

## Adoption / stale-lock recovery

- Lock `playtest-loop-2.lock` held `playtest-loop2-20261124T1455Z`
  (created 14:55:00Z). Registry heartbeat for its tree
  `journey2-social` was 15:29:07Z — 27 min stale at check (~15:56Z).
- Liveness check before recovery (AGENTS.md stale-lock lesson): `ps`
  showed no process with cwd in `journey2-social` and no sim node
  process; `subagent.list` showed no live agent owned by
  `oversight-playtest-loop-2`; file writes in the tree had stopped
  (last write 15:47:31Z, none in the 13 min before the decision).
  The 1455Z run is DEAD. Lock deleted in the same call that verified
  its run_id; new lock `playtest-loop2-20261124T1600Z` written 16:16Z
  (first attempt 16:02 failed under the flap — 0-byte file — rewritten
  after the clear; see flap note below).
- Recovered state: the dead run had finished the prereg, the driver
  and the analyzer — all UNCOMMITTED in the worktree. It died before
  the fixes, the proof tests, the panel, the gate and closeout. This
  run built the fixes + proofs, ran the panel, and judged it. The
  prereg is frozen as written (seeds 45853–45856, metrics binding);
  the only change to the dead run's staging is the proof-test harness
  fix (WARN_DEF capture — a test-only change, see below).
- Write-flap windows this run: the dead run's window ~15:03Z–ongoing
  at its staging; this run's probes failed 16:01Z and 16:06Z, cleared
  16:16Z (two consecutive OKs 30s apart). Flickers after the clear:
  shell `>` redirects to /tmp (16:26Z) and ~/workspace (16:31Z,
  16:33Z) were refused with 0-byte files; terminal output and
  muse.write/muse.edit were unaffected. The panel driver's own
  20-attempt write loop caught an EPERM on seed 45853's JSON and
  landed it on a later attempt. Lesson (again): never trust a
  redirected log's emptiness during a flap — re-run to the terminal.
- Registry-lock jam (shared infra, NOT this run's fault): the
  `REGISTRY.lock` has been held continuously by live sibling work
  since ~16:14Z (Loop A `worktree-register.sh journey-landing`, then
  sim-bowopen-recheck-a register, fightcap/tbrefuse heartbeats queued
  behind it). Three heartbeat attempts failed (16:18Z flock timeout,
  16:40Z flap EPERM on the registry write, 16:36–16:38Z flock
  timeout). The tree's registry heartbeat is stale since 15:29:07Z —
  reaper margin is ~4h (until ~19:29Z), so the adoption is safe, but
  the heartbeat MUST be re-established when the lock clears and the
  release step may need the same retry. Do NOT kill the live register
  processes to clear it.

## Pre-registration (see journey-social-life-r283-prereg.md)

**Leg question:** does social life hold up across a full run — and do
the r277 NO-GO items get FIXED: M4 teach-frame pool cycling (25
flags), the F6 post-warning dry line (1), the F5W settled re-ask (0),
outing conversion (14.3% < 25% watch)?

**Seeds:** 45853–45856 (FRESH — band check in prereg; backup
45865–45868). DAYCAP 140.

**Arms (this run):** A — variety pools 4→8 (plant/place teach
frames), mood up:warm 2→4, hunger-plea whyBits/whyTails 3→4.
B — F6 post-warning dry site: heed generic pool 3→6 +
convoWouldBlock pre-check + convoWantWarning fallback. C — F5W +
outing blockers report-only.

## Verdict: NO-GO (4 of 6 binding bars GO)

| Metric | Bar | Result | Verdict |
|---|---|---|---|
| OUTING attempts | ≥ 4 | **38** (kept 15, 8,420 kcal) | GO |
| TRAIL distinct / max recurrence | ≥ 6 / ≤ 4 | **17 / 5** | NO-GO |
| F6 dry | 0 | **0** | GO |
| F5W total | ≥ 1 | **1** (45854, V2) | GO |
| M4-SPLIT conversational | ≤ 12 | **9** (r277: 25) | GO |
| M12-NATIVE | max ≤ 1, 0 sittings 2+, exits ≥ 1 | **max 2, 1 sitting 2+, 115 exits** | NO-GO |

The headline is real progress: the two fixes the run was built to
land both hold in the wild — F6 dry 0 (was 1), M4 conversational 25→9
— and F5W serves a settled favor for the first time on this leg
(exactly 1, seed 45854 V2), and outing conversion jumps 14.3%→39.5%.
The two misses are narrow: TRAIL by one recurrence on one seed
(45855, two fixed lines at 5×), M12-native by one sitting with one
extra threeTimes press (45853 amina_diallo). Both are diagnosis
items, not re-scores (metric binding §14).

## Panel

- 45853: d141 survived, 2 alive, 138 full convs, 117 natural ends,
  20 feasts, 0 moots.
- 45854: d104 village-lost (scattered, 1 alive), 61 full convs, 52
  natural ends, 15 feasts, 0 moots.
- 45855: d111 village-lost (scattered, 1 alive), 123 full convs,
  105 natural ends, 15 feasts, 2 moots.
- 45856: d40 village-lost (scattered, 8 alive), 46 full convs, 41
  natural ends, 5 feasts, 2 moots.
- Panel: 358 transcripts, 91 near-dup flags (82 instructional, 9
  conversational), 368 conversations, 403 want-resolutions.

## Arm A — verdict in the wild: the pool widening works

M4 conversational 25 → 9 (bar ≤ 12, GO). The teach-frame cycling
that drove r277's 25 is gone: no teach-frame pair appears in the 9
conversational flags at all. The remaining 9 are honest near-dups,
not pool cycling: 3 same-opening grief/belonging lines
("I've never really had people…" vs "I've never really fit
anywhere…"), 2 survival-openers, 2 grief lines about Miriam, 1
forage "nothing left" pair, 1 mood-beat pair. The instructional 82
are dominated by one family — the Haven-door helper ("Move next to
them, on the same side of the Haven door" in 4–5 wordings, ~30
flags) — an instruction, not a conversation, and the split correctly
keeps it out of the binding count. Proof test
`test-journey-social-life-r283-variety-pools-20261124.js` 33/33
(RED before: plant 4/8, place 4/8, mood 2/4, BIT4/TAIL4 absent).

## Arm B — verdict in the wild: the heed dry site is fixed

F6 dry 0 panel-wide (bar 0, GO). warn_you engaged 16 times and
committed 5 times in the wild (B6) with zero dry servings — the
r277 defect shape (details → heed → dry) never fired. Proof test
`test-journey-social-life-r283-heed-dry-20261124.js` 33/33 (RED
before: the exact r277 transcript shape dried — "…Sorry, lost my
train of thought." after details-delivered warning, all 3 generic
lines poisoned). Test harness note: the first draft failed sections
3–4 because `convoSelectWant` does not always offer warn_you to a
given speaker on a given fresh run; the test now captures the shared
WANTS.warn_you def once from whichever villager selects it
naturally and re-hangs it (r150 sitting-2 pattern, test-only). The
deepen branch (heeds ≥ 4) has the same un-pre-checked exposure and
is the known next suspect — NOT fixed this run, per prereg.

## F6 — GO (see Arm B)

## F5W — GO, exactly 1 (first settled favor in the wild on this leg)

F5W total 1 (V2, seed 45854). Legacy F5 total 0 by design. The
F5-REASK funnel is the structural story: scanned 8194 dawns,
askFavorSeeds 2338 (147 distinct), settled-at-last-sight 0,
attempted 0, reasks 0. No settled favor ever survived to a position
where the re-ask could fire — the one serve came through the
ordinary favor flow, not the re-ask path. The seed-lifetime design
(seed survives sittings until the favor settles, or a
settlement-triggered re-ask) is still owed; this panel is its
evidence, unchanged from r268/r277.

## M4 — GO (see Arm A)

## TRAIL — NO-GO on max recurrence (distinct clears easily)

Presses 48, distinct 17 (bar ≥ 6, clears), max recurrence 5 (bar
≤ 4). The miss is seed 45855: two fixed lines at 5× each —
"Two pairs of eyes, twice the ground. That was the deal, and it is
working." and "The pantry is counting on us. Eyes on the ground,
ears open." — plus kcal-slot variants of "Between us we are
carrying N kcal…" (×2/×1/×1/×1). 45853 and 45854 sit exactly at
4; 45856 pressed 0 times (village lost d40). The pool is small for
the 3-press driver; the r261 metric review stands — the next TRAIL
question is new lines, not counting.

## M12 — NO-GO on one sitting

maxPerSitting 2, sittings2plus 1 (bar max ≤ 1, 0 sittings 2+),
exits 115. The one sitting is 45853 amina_diallo (D-talk-request,
10 turns): the driver pressed "Wait — what were we talking about?"
three times and the NPC answered with three distinct resume lines,
escalating to the honest "We're going in circles — still on
whether you're staying." The mechanism works; the metric counts
driver presses. See metric review: the next run should ask whether
the third press is a driver artifact (the driver keeps pressing the
same choice) rather than a villager loop. M12 door-req flags 62 of
91 (17.32% of 358 conversations; r189 anchor 86/143).

## Village assessment (plain words)

Four villages, one survivor. Seed 45853 lived to day 141 with two
people left — Vasyl the soldier and Amel the artist, both warm
toward the player — after the scholar's mantle passed eight times
(Bessie → Dominic → Ernesto → Didier → Hannah → Owen → Amina →
Kacper → Vasyl). Fifteen fell along the way: six to the wild, four
to monsters, the rest to sickness, dehydration, a stranger, a wound
that wouldn't close. The village held 20 feasts and never once held
a moot. Hannah proposed links to other villages from day 5, Miguel
kept proposing person-bonds; Amina nursed a grievance against Jesse
into an armed plot that sprang as an ambush and ended acquitted.
The other three villages scattered: 45854 churned through twelve
scholars in 104 days and ended with Ingrid alone; 45855 lasted 111
days with Ivy proposing sixteen bonds — the most social villager on
the panel — and ended with Consuelo alone; 45856 collapsed at day
40 with eight people still alive — scattered, not dead. The pattern
is the same as every social run: the village talks, bonds, grieves
and feasts while the wild steadily takes people, and the ones left
at the end are whoever the mantle happened to land on.

## People check (sense-testing)

Two full transcripts read end to end, plus the gen_954a55d
candidate from the analyzer tail.

- **Ella, seed 45854 (11 turns, grief):** reads as a person. "Since
  Declan died... I keep expecting to see Declan at the fire.
  Stupid." / "I rinse the cup twice. It doesn't bring anyone back."
  / "The fire feels smaller without Declan. The rest of us will
  have to be bigger." Declan really did die on day 12 of this seed;
  the grief names the actual dead, the NPC wants something real
  (joining the party — "Someone should watch your back"), and the
  sitting ends naturally. No fabricated history, no filler loop.
- **Amina, seed 45853 (9 turns, deflect):** reads as a person with
  something to hide. She deflects twice with plausible
  explanations, asks a real question ("Are you going to stay? With
  us. For real."), and ducks the player's probe with "Idle
  curiosity, I swear." When the player repeats the resume line she
  escalates honestly ("We're going in circles"). Natural end,
  comfortable silence.
- **gen_954a55d, seed 45856 (11 turns, "who did you leave
  behind"):** coherent; the player pressing "Take your time" four
  times gets varied replies, and the NPC names the circle honestly.

## Determinism

Seed 45853 re-run to `~/workspace/r283-determinism`, JSONs diffed
byte-identical (890,076 bytes both) before judging.

## Standing proofs (re-run on the worktree, fixed code)

- M4-split (r250): 49 passed, 0 failed
- F5 harness (r238): 50 passed, 0 failed
- F6 proof (r226): 49 passed, 0 failed
- TRAILTALK (r236): 30 passed, 0 failed
- repay-fallback (r238): 36 passed, 0 failed
- gossip-dry (r256): 9 passed, 0 failed
- resume-fallthrough (r268): 36 passed, 0 failed
- driver-commit (r277): 9 passed, 0 failed
- New proofs: variety-pools (r283) 33/33, heed-dry (r283) 33/33 —
  both RED-verified before their fixes.

## Telemetry

No canonical baseline exists for the current metric set. Ad-hoc
comparison, r277 precedent: baseline built from the r277 panel
JSONs (45845–45848) into `~/workspace/r283-social-baseline.json`
(the /tmp copy from r277 is gone — /tmp volatility, again), r283
checked against it with `telemetry-check.js` on the real-signal
metrics (`social.moots`, `social.fullConvs`,
`social.transcripts`, `bondProposed`, `confrontEvents`,
`outingArm`, `mootNotes`, `funeralMendStats.funerals`). Baseline:
moots 4, fullConvs 469, transcripts 469, bondProposed 122,
confrontEvents 39, outingArm 49, mootNotes 4, funerals 13.
**Quiet — no LOUD lines, baseline NOT rolled** (ad-hoc artifact,
not committed). r283 aggregates for the record: moots 4, fullConvs
368, transcripts 368, bondProposed 112, confrontEvents 29,
outingArm 38, mootNotes 4, funerals 13.

## Gate

NOT RUN by this occurrence — the occurrence budget ran out after
the panel + analysis (r239/r256/r261/r277 precedent: gate goes to
adoption). `node scripts/check.js --quick` is owed on the rebased
tip. NOTE FOR THE ADOPTION: this landing touches 4 src/js files
(villager-agency.js, convo-mood.js, convo-wants.js,
convo-dialogue.js), so the 3 standing stale proofs from r277's gate
(the measurement-proof staleness pair +
`test-phone-frame-proof.js`) may now be ATTRIBUTABLE to this run —
the adoption must refresh the balance proof / phone-frame receipts
or record why not, not just cite r277's "0 src files" exemption.
Expected standing failures otherwise: the flap-EPERM / 120s-load
timeout set from r277's gate log.

## Metric review (for the NEXT run, §14 — bars never re-scored)

- If M4 still reads > 12, the next question is teach DENSITY per
  sitting (11 lessons in one sitting cycles even an 8-frame pool
  once) — a driver-ask cap or a per-sitting lesson cap — not more
  frames. (This run: 9, GO — the question is parked, not closed.)
- If F6 still reads > 0, name the exact site (heed generic branch is
  fixed here; the deepen branch is the known next suspect).
  (This run: 0, GO.)
- If F5W still reads 0 with promises flowing, the seed-lifetime
  design is next (funnel from this panel is its evidence).
  (This run: 1, GO — thin. The funnel still says 0 settled at last
  sight in 8194 dawns; the design question stands either way.)
- If outing conversion stays < 25%, the next question stays the
  depart/forage blockers, not the commit step. (This run: 39.5%,
  GO — blockers now positioning-heavy: 10 positioning, 6 forage,
  4 depart. The `unexpected-action:?` probe recurred: 2 cases, r277
  had 1 — the dawn arm meeting a villager state with no action.)
- If TRAIL distinct clears 6 but the pool is still kcal-slot
  variants, the next TRAIL question is new lines (r261 metric
  review), not counting. (This run: distinct 17, but two fixed lines
  at 5× each on 45855 — new trail lines are the next lever.)
- M12-native: the miss is one sitting where the DRIVER pressed the
  resume line three times and the NPC answered correctly three
  times. Next run: check whether threeTimes counts driver presses
  rather than villager loops before tuning the cap.

## Handover / adoption notes

- **Gate owed** (see above) + the src-touching staleness question.
  Run `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
  on the rebased tip; expect the standing load-artifact/timeout set
  from r277's gate log; standalone re-run any timeout before
  attributing.
- **Registry heartbeat stale since 15:29:07Z** — re-heartbeat
  `journey2-social` as soon as the REGISTRY.lock queue drains (do
  not kill the live journey-landing / bowopen registrations).
  Release (`worktree-release.sh journey2-social merged`) also needs
  the lock; retry it, don't force it.
- **Lock:** `playtest-loop-2.lock` holds
  `playtest-loop2-20261124T1600Z` (written 16:16:00Z) — delete at
  closeout after the merge + release, in the same call that verifies
  the run_id.
- **Rotation:** write 6 to `journey-rotation-b.txt` at closeout
  (5 → 6, crisis leg next).
- **Determinism artifact:** `~/workspace/r283-determinism/` holds
  the re-run JSON (byte-identical); the ad-hoc telemetry baseline is
  `~/workspace/r283-social-baseline.json` (NOT committed, NOT
  rolled). The analyzer log is `~/workspace/r283-analyzer.log`.
- **Files to land:** prereg + driver + analyzer + 2 proof tests +
  4 src/js fixes + 4 panel JSONs + this run note. Commit via
  safe-commit.sh in the worktree; rebase onto current master
  (9810670a0 at run start — re-check before merging); ff-merge;
  release; rotation 5 → 6; delete lock. No bump, no push, no live
  verification — the ship loop owns those.

## Adoption 1800Z (playtest-loop2-20261124T1800Z) — closeout

- Stale-lock recovery: lock `playtest-loop2-20261124T1700Z` (created
  17:06:55Z) held by the dead 11:00 CST adoption. Registry heartbeat
  for `journey2-social` was 17:25:22Z — 33 min stale at check
  (~17:58Z). Liveness check (AGENTS.md stale-lock lesson): no
  process with cwd in journey2-social, no sim node process (only
  Lane A's journey-establishment-r285), no live agent owned by
  oversight-playtest-loop-2; last file write 17:34Z (gate.log, 24
  min quiet). The 1700Z run is DEAD. Lock deleted in the same call
  that verified its run_id; new lock
  `playtest-loop2-20261124T1800Z` written 17:59:36Z.
- Rebase: branch rebased onto master `fb5dd00a0` cleanly (no
  conflicts, no stop-at-pick quirk), new HEAD `dd6e0a4f1`. Master
  had moved from 8616c6b2f (fightcap/bowopen evidence + scale-onramp
  closeout — evidence only).
- Proofs re-run on the rebased tip: variety-pools 33/33, heed-dry
  33/33.
- Gate: `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest2` on the rebased tip,
  18:02–18:22Z, **335 passed, 9 failed** (1183s). Tail capture in
  `journey-social-life-r283-gate-1800z.log` (piped through `tail
  -60`; the first 3 FAIL blocks scrolled above the capture — all 9
  are identified below via --only subsets + standalone re-runs).
  The 1700Z run's partial gate log
  (`journey-social-life-r283-gate.log`, 220 bytes, killed mid-run)
  is committed alongside as the record of the interrupted attempt.
- Gate adjudication — all 9 identified, none attributable to this
  branch:
  1. test-measurement-cache-flags.js — gate 0/4; standalone 4/4
     (18s); passes in the measurement subset (38s). Load artifact.
  2. test-phone-frame-proof.js — 3 failed; failing inputs are
     index.html + src/data files last touched by ship-loop version
     bumps (430fab777 etc.); this branch touches none of them.
     STANDING staleness; refresh needs the MOBILE-PLAYTEST.md
     browser recipe (fresh receipts 390x736/390x844) — owed to a
     phone-frame run, not this adoption.
  3. test-occupation-panels.js — gate TIMEOUT 120s; standalone
     25/25. Load flake.
  4. test-one-person-army-deed-attainment.js — gate TIMEOUT 120s;
     standalone EXIT 0. Load flake.
  5. test-trust-observer-neutrality.js — gate TIMEOUT 120s;
     standalone 6/6. Load flake.
  6. test-capable-bot-20261014.js — gate TIMEOUT 120s; standalone
     40/40. Load flake.
  7. test-living-garden-deed-attainment.js — gate TIMEOUT
     (reproduced in the deed --only subset); standalone EXIT 0.
     Load flake.
  8. test-measurement-workflow.js — DETERMINISTIC: "retained
     neutrality proof covers the current Game/controller/harness
     inputs". STANDING — the same staleness pair failed on the
     scale r283 gate (339/5), which ran without this branch.
     Refresh via scripts/balance-proof-update.js is owed as
     maintenance (panel re-observation; does not fit this
     adoption window).
  9. test-measurement-proof-update.js — DETERMINISTIC: "Proof
     source inputs are not current" (balance-proof-update.js:8).
     Same standing pair as #8; same disposition.
  Subsets: measurement 5/2, balance 4/0, deed 14/2 (both
  timeouts). All 7 load flakes verified green standalone
  serialized (r277 precedent). Merge proceeds on the established
  standing-set standard (scale r283 landed at 339/5 with the same
  set). The balance-proof / phone-frame refreshes the 1600Z note
  called for are recorded here as WHY NOT: both are standing
  pre-branch staleness, and both refreshes are maintenance runs
  (panel re-observation / browser receipts), not adoption work.
- Telemetry: `telemetry-check.js` vs canonical `social.json`, 8
  LOUD lines — all "newly appeared: baseline 0 -> current N".
  EXPLAINED, not a bug: social.json carries an older metric set
  (l3.bonds, l3.deepBonds, l3.mootsConvened, ...) that the r283
  panel JSONs don't emit; the r283 note's ad-hoc comparison vs
  the r277 panel was quiet. Baseline NOT rolled (a metric-set
  migration is a deliberate act, not a mid-adoption overwrite).
- Reaper: exit 0, nothing removed; 11 LOUD dirty trees never
  auto-removed (incl. journey2-social — this run's own untracked
  gate log — and Lane A's live journey-establishment). Active
  11/16.
- Heartbeat: fresh 18:00:41Z, refreshed 18:05:15Z; later attempts
  jammed (registry lock held by live sibling sim-ammosupply-a
  registration — do NOT kill; retry later). Reaper margin to
  ~19:29Z.
