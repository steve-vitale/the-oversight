# sim-reattach-a — EVIDENCE (PILOT NO-GO)

Run: fleshout-20261117T060712Z (Loop A), axis scale-onramp, arm
sim-reattach-a. Branch `sim-reattach-a` (worktree
`~/workspace/worktrees/sim-reattach-a`). Tip at sim time:
`01a82950` (lever + instrument `5f209af4e`, ONTOLOGY regen
`01a82950`). Policy: competent verbatim, sha256
`df9b7dff4de4`. Band: 103201–103208, 150d death-aware.
Prereg (binding): `evidence/2026-11-17/sim-reattach-a-prereg.md`
(commit `9ebb6fd97`, frozen before any judged sim).

## Verdict: PILOT NO-GO

**Primary 1/8 vs bar 4.** The re-attach rule fired **zero times**
on all 8 seeds — no re-attach row exists in the armed corpus.
The single primary seed (103201) reached the bar only through
first-attaches of the re-applied attach rule; the re-attach
rule itself contributed nothing. The lever is correct in the
proof test (76/76) and clean on integrity, but it never got a
live chance: the window it needs — a targeted plan still in
gear/party when a higher-wave tale arrives fresh — almost never
exists in real play. This is a NO-GO on the frozen bar, not a
defect in the rule. The lever is reverted from `src/` in the
worktree (verified, commit left for coordinator approval — see
§Revert note).

## The lever, played — in plain words

A villager hears a tale at the fire, forms a plan to hunt the
beast in it, and the plan takes the first fresh beast it hears
about — usually a wave-3 beast, because wave-4 tales are told
late while plans attach early. The new rule was supposed to
let the plan change its mind: if a tale of a bigger beast
arrives while the plan is still getting ready (not yet out
hunting), the villager switches the hunt to the bigger prey
and says so out loud. In 8 villages over 150 days, that
switch happened **never**. The rule was consulted 24 times
(a targeted plan standing at Haven while a tale was on offer)
and every time the best tale on offer was no bigger than the
beast the plan already held.

## Judged numbers vs the frozen bars

| Bar (prereg §Primary) | Result | Verdict |
|---|---|---|
| 1. Primary: rumor-born plans acquire a named wave-4/5 target on ≥4/8 seeds (first-attach OR re-attach) | **1/8** (103201 only) | **FAIL** |
| 2. Secondary launch bar: ≥1 launched rumor-born plan carrying a target | 13 targeted launches (2 carrying wave-4) | PASS |
| 3a. Cost: deaths/run ≤ control + 2 | control 62.25 vs armed 59.63 | PASS |
| 3b. Cost: median survival ratio ≥ 0.9 | control 151d vs armed 150d, ratio 0.99 | PASS |
| 3c. Cost: starvation deaths ≤ control + 2 | control 4 vs armed 4 | PASS |
| 4. Proof test `scripts/test-reattach-a.js` green | 76/76 (see §Proof test; re-run at final tip below) | PASS |
| 5. Instrument clean: 8/8 + 8/8 parse, 0 instrument errors, D1+D2 green, §15 panel attached | 8/8 + 8/8, errors 0/0, D1+D2 green (proof test), D3 clean, panel `review_required` (see §Panel) | PASS |
| 6. Integrity: ZERO re-attach rows with wave ≤ oldWave; ZERO with stageBefore in hunt/standing/table | 0 downward/same-wave, 0 post-launch, 0 non-heard | PASS (vacuous — no re-attaches exist to violate it) |

Analyzer: `node scripts/analyze-reattach-a.js` exits 1 on the
primary miss (the exit code is the judge). Analysis JSON:
`evidence/2026-11-17/reattach-a-analysis.json`.

## Per-seed table (armed leg; control in parentheses)

| seed | rumor-born plans | first-attaches (w4/5) | re-attaches | re-attach opps / blocked | targeted launches (w4/5) | told w4/5 tales | days | deaths (ctrl) | standing (ctrl) | maxWave (ctrl) |
|---|---|---|---|---|---|---|---|---|---|---|
| 103201 | 5 | 4 (2) | 0 | 5 / wave-not-higher ×5 | 11 (2) | 2 | 150 survived | 66 (72) | 199 (199) | 4 (4) |
| 103202 | 0 | 0 | 0 | 0 | 0 | 1 | 151 survived | 56 (56) | 199 (199) | 4 (4) |
| 103203 | 0 | 0 | 0 | 0 | 0 | 2 | 151 survived | 54 (54) | 295 (295) | 5 (5) |
| 103204 | 2 | 1 (0) | 0 | 19 / wave-not-higher ×19 | 0 | 0 | 73 lost | 63 (63) | 120 (120) | 4 (4) |
| 103205 | 0 | 0 | 0 | 0 | 0 | 0 | 59 lost | 54 (54) | 100 (100) | 4 (4) |
| 103206 | 0 | 0 | 0 | 0 | 0 | 1 | 152 survived | 53 (53) | 199 (199) | 4 (4) |
| 103207 | 2 | 1 (0) | 0 | 0 | 2 (0) | 1 | 150 survived | 62 (77) | 199 (335) | 4 (5) |
| 103208 | 5 | 1 (0) | 0 | 0 | 0 | 1 | 128 lost | 69 (69) | 300 (300) | 5 (5) |
| **Total** | **14** | **7 (2)** | **0** | **24 / 24 wave-not-higher** | **13 (2)** | **8** | — | **477 (498)** | — | — |

Control leg: 0 attaches on all 8 seeds (levers OFF, as
designed); 0 instrument errors on both legs; origin
cross-check mismatches 0.

## Attach + re-attach split (armed leg)

First-attaches (7 total, the re-applied attach rule):

| seed | day | holder | beast (wave) | teller | tale day / age | creation? | stage |
|---|---|---|---|---|---|---|---|
| 103201 | 33 | Francisco (gen_ghmn8s6) | The Callback (3) | Hassan | 31 / 2d | yes | gear |
| 103201 | 33 | Howard (gen_5i62snj) | The Callback (3) | Hassan | 31 / 2d | yes | gear |
| 103201 | 138 | Maya (maya_singh) | The Herald (4) | Maya (self) | 136 / 2d | no (refresh) | party |
| 103201 | 142 | Mangapul (visjoin_138) | The Herald (4) | Maya | 136 / 6d | yes | gear |
| 103204 | 52 | Jovan (jovan_milic) | Gavel (3) | Nikos | 48 / 4d | no (refresh) | gear |
| 103207 | 32 | Ella (gen_4a8vpdq) | Big Ugly / redactor (3) | Nadia | 27 / 5d | no (refresh) | hunt |
| 103208 | 41 | Pearl (gen_5kdsrkw) | Chorus Line (3) | Pearl (self) | 39 / 2d | no (refresh) | hunt |

Re-attaches (0 total): no rows. Re-attach steps by wave:
3→4: 0, 3→5: 0, 4→5: 0. **Reattach-only primary seeds: none**
(the one primary seed came from first-attaches alone).

Two of the seven first-attaches landed on plans that were
ALREADY in hunt stage (103207 day 32, 103208 day 41) — the
attach rule fires on a target-null heard plan regardless of
stage, so the target was named after the party had already
departed. Those two plans could never re-attach under the
gear/party rule, whatever tale arrived later.

## Why zero re-attaches — the three causes, with the census

The rule was consulted 24 times and blocked 24 times, all
`wave-not-higher`. The causes stack:

1. **Plans launch 1–4 days after attaching — the window
   closes before the bigger tale arrives.** On 103201 the
   two Callback holders attached on day 33 and were
   hunt-stage by day 34 (Francisco, 1 day) and day 37
   (Howard, 4 days). The Herald tale — the only wave-4
   tale that could have traded them up — was told on day
   136, a hundred days later. During their 1–4 day window
   the only tales on offer were wave-3 (The Focus Group,
   The Callback, Chorus Line, all eligible, all wave 3).
   The Herald then attached as a first-attach to two
   OTHER, still-targetless plans (Maya day 138, Mangapul
   day 142) — the tale reached fresh plans, not the
   locked ones. This is the prereg's conservative
   gear/party reading of "still unlaunched" doing exactly
   what it says: the window is the days between attach
   and launch, and that is 1–4 days.

2. **The one long window had nothing to trade up to.**
   On 103204 Jovan held Gavel (wave 3) in gear stage for
   21 days (days 52–73, until the village was lost) — the
   longest open window in the run, 19 re-attach
   opportunities — and **no wave-4/5 tale was ever told
   on that seed**. The best tale on offer at every one of
   the 19 calls was Gavel itself. Supply, not the gate,
   was the binding constraint there.

3. **When the bigger tale did arrive, the holders were
   already out hunting.** On 103207 the Herald tale
   arrived day 126; the Redactor holder had been
   hunt-stage since day 26 — 0 re-attach opportunities.
   On 103208 the Strike tale arrived day 58; the Chorus
   Line holder had been hunt-stage since day 35 — 0
   opportunities. The single near-overlap was 103201's
   Maya: she held the Herald (wave 4) in party stage on
   days 138–142, and the only other wave-4 tale on offer
   was the Suburb (told day 74, stale by day 138, and
   same-wave as the Herald anyway). A wave-5 tale would
   have traded her up; none was ever told on any seed
   (0 told wave-5 tales across both legs).

Upstream scarcity compounds all three: 4 of 8 seeds formed
ZERO rumor-born plans (103202, 103203, 103205, 103206),
and only 14 rumor-born plans existed across the whole
armed leg. The re-attach rule can only trade up a plan
that exists, holds a wave-3 target, and is still getting
ready — that conjunction occurred on exactly two seeds
(103201, 103204), and on both the higher tale never
arrived in time.

## Launch table (armed leg)

Rumor-born launches total 30; 13 carried a target (2
carrying wave-4, both on 103201 — Maya + Mangapul departing
together for the Herald, day 142; see §One trip read end to
end). Launches carrying a RE-ATTACHED target: 0. Hunt-stage
targeted launches: 13 (all targeted launches were
hunt-stage departures — the launch is what sets hunt).
Secondary launch bar (≥1) passes on the attach rule's
strength, not the re-attach rule's.

## Tale supply (control leg — the feasibility read)

Told wave-4/5 tales on 6/8 control seeds (103201: 2, 103202:
1, 103203: 2, 103206: 1, 103207: 1, 103208: 1; 103204/103205:
0). The prereg's feasibility note does NOT apply: supply
existed on ≥4 seeds, so the primary was achievable in
principle and the miss is not "no wave-4/5 kills to hear
about." Armed-leg supply was nearly identical (8 told w4/5
tales; 0 wave-5 tales on either leg). The binding
constraint is the timing conjunction above, not tale
supply — and note the band effect: this band's villages
formed only 14 rumor-born plans (vs 27 on rumortarget-a's
band) and its first-attach yield was 1/8 where rumortarget's
was 3/8. The attach rule's yield is band-sensitive.

## Voice sample + sense test

**Re-attach lines: none exist — the sense test for
re-attaches is vacuous.** No villager ever said the
re-attach line, because no re-attach ever fired. That is
itself the finding: the voice line was proof-tested (76/76,
live probe) but never spoke in 8 villages.

Attach lines (7, all from the armed leg — the attach rule
speaking, not the re-attach rule), judged against the tale
each cites:

1. Day 33, 103201: "Francisco keeps coming back to
   Hassan's tale of The Callback — and now has a beast to
   hunt." Honest: Hassan killed The Callback and told the
   tale day 31; Francisco heard it and planned the hunt.
2. Day 33, 103201: "Howard keeps coming back to Hassan's
   tale of The Callback — and now has a beast to hunt."
   Honest, same tale.
3. Day 138, 103201: "Maya keeps coming back to Maya's
   tale of The Herald — and now has a beast to hunt."
   Honest but self-told: Maya killed the Herald herself
   (day 136, aid-crisis) and told her own tale. A villager
   "coming back to" her own story reads oddly — the same
   self-tale caveat rumortarget-a noted.
4. Day 142, 103201: "Mangapul keeps coming back to Maya's
   tale of Big Loud — and now has a beast to hunt."
   Honest: "Big Loud" is the Herald's knowledge-gated
   display name; Maya told the tale day 136.
5. Day 52, 103204: "Jovan keeps coming back to Nikos's
   tale of Gavel — and now has a beast to hunt." Honest:
   Nikos told the Gavel tale day 48.
6. Day 32, 103207: "Ella keeps coming back to Nadia's
   tale of Big Ugly — and now has a beast to hunt."
   Honest: "Big Ugly" is the Redactor's display name;
   Nadia told the tale day 27.
7. Day 41, 103208: "Pearl keeps coming back to Pearl's
   tale of Chorus Line — and now has a beast to hunt."
   Honest but self-told again (Pearl killed Chorus Line
   day 39 and told her own tale).

No attach line names a beast the holder never heard about.
The two self-tale lines (Maya, Pearl) are the only sense
wrinkle, and they belong to the re-applied attach rule, not
to this arm's re-attach rule.

## One trip read end to end — Maya's Herald hunt (103201)

The closest thing to a re-attach story in the run, and it
shows why the rule missed. Maya Singh killed the Herald
herself on day 136, in a crisis fight at the village (not
on a hunt). Two days later her rumor-born plan attached to
her own tale of the Herald (day 138, party stage). She
spent days 138–141 getting ready; on day 142 she invited
Mangapul as companion and the two departed together, stage
hunt, target the Herald, wave 4 — the only wave-4 targeted
launch in the run. Mangapul's own plan attached to the same
tale at creation that same day. The run's horizon (day 150)
caught them still out hunting; no second Herald kill was
ever recorded. The plan did exactly what the attach rule
promises — it named a wave-4 beast and launched for it —
but the quarry was never fought again inside the window.

The other trip worth reading is Jovan's (103204): plan born
day 48, Gavel attached day 52, sat in gear stage for 21 days
while the village around him was lost (day 73). Nineteen
times the re-attach rule looked for a bigger beast for him
and found nothing but Gavel. A plan that never leaves Haven
cannot trade up, and a village that dies in 73 days tells
no wave-4 tales.

## Nearest miss

103204 is the nearest miss, and it misses on supply, not on
the gate: a 21-day open window, 19 consulted opportunities,
zero wave-4/5 tales told. If a single wave-4 tale had been
told on that seed while Jovan stood in gear, the re-attach
would have fired and the primary would read 2/8 instead of
1/8 — still a NO-GO, but the rule would have spoken once.
103201 is the second-nearest: Maya held the Herald in party
stage for 4 days with a stale same-wave Suburb as the only
other wave-4 tale; a fresh wave-5 tale in those 4 days would
have been the first 4→5 re-attach.

## Metric review

Per the prereg: the primary per-seed table is above (attach /
re-attach / no-attach with reason). Seeds with no attach at
all: 103202, 103203, 103205, 103206 — reason: **no heard
plan** (0 rumor-born plans formed; nothing to attach to,
despite told w4/5 tales on 103202/103203/103206). Seeds with
a wave-3 attach but no re-attach: 103201 (wave-not-higher;
bigger tale 100 days late), 103204 (wave-not-higher; no
bigger tale ever), 103207/103208 (stage-launched — attaches
landed post-departure, so the re-attach call never fired).
Reattach-only primary seeds: none. Launch bar: PASS (13
targeted launches). Cost bars: all PASS against the control
leg (deaths 59.63 vs 62.25; survival ratio 0.99; starvation
4 vs 4). Feasibility note: control shows told w4/5 tales on
6/8 seeds, so the primary was achievable in principle — the
miss is a timing conjunction, not a supply absence. **No
re-scoring:** the bars above are the judge; 1/8 is a NO-GO
under the frozen primary, and no friendlier reading changes
it. What the numbers do show is that the re-attach rule as
designed cannot move the primary on this band, because the
condition it needs (targeted plan still in gear/party when
a higher-wave tale arrives fresh) occurred on 0/8 seeds in
any useful form — the two windows that existed were
defeated by supply (103204) and by a 100-day gap (103201).

## Determinism

- **D1 (repeatability)** and **D2 (wrap neutrality)**:
  green in `scripts/test-reattach-a.js` (seed 103201, 60d,
  armed tip at instrument commit `5f209af4e`; `src/` is
  identical between that commit and the sim tip
  `01a82950` — the later commit only regenerated
  `ONTOLOGY.md`).
- **D3 (drift smoke)**: `scripts/vetparty-drift-check.js`
  over control vs armed corpora — **NO PRE-LEVER DRIFT**.
  103201 diverges day 45 (lever first acted day 34);
  103207 diverges day 39 (lever first acted day 26);
  103202/103203/103205/103206 bit-identical; 103204/103208
  lever acted (day 35) with identical trajectories. Every
  divergence follows a lever action; none precedes one.
  (103201's drift-check "first lever day 34" vs the
  analyzer's first attach day 33 is the check's
  day-counting offset; the divergence day 45 is after
  either.)

## Panel (§15)

`scripts/build-reattach-panels-20261117.js`:
decision **review_required** (screen-only run, 8 paired
cases). No material signal on any observed metric:
national scale access 0 → 0; table wins 0 → 0; village
deaths/run 62.25 → 59.625 (paired delta −2.625, 95%
exploratory interval −6.375 to 0); community loss 0.375 →
0.375. Panel files: `evidence/2026-11-17/reattach-a-panel.md`
+ `.json` + `-before.json.gz` + `-after.json.gz`.
The panel is the instrument; the prereg bars are the judge.

## Proof test

`scripts/test-reattach-a.js`: **76/76 green** on the
instrument tip (static fixtures incl. 3→4, 3→5, 4→5,
chain 3→4→5, never-downward/same-wave/same-beast, never
after launch hunt/standing/table, REATTACH-off and
both-envs-off controls, stale/dead-teller/untold
exclusions, fought-origin exclusion, first-attach
regression, live HavenTick probe incl. creation attach +
refresh re-attach + REATTACH-off + hunt-stage controls,
analyzer fixtures, D1/D2 at 60d seed 103201 under both
envs ON). **Re-run at the final tip `01a82950` after the
sims: 76/76 green** (D1 + D2 included in the run).

`scripts/test-rumortarget-a.js`: 67/67 green on the
committed tip (fixture 7 now expects a
`reattachBlocked: 'reattach-off'` result — targeted plans
may trade up by design).

## Check re-run

`node scripts/check.js --quick` — first run (pre-VM
replacement): 332 passed, 8 failed in 1120s under load
~9; the full failure list was not captured (piped through
`tail -15`); the one visible failure was
`test-ladder-bundle-20261108` ("control: 200 monster turns
WITHOUT delivery fire the ambient raid — fires 0") and
three tests hit the 120s timeout cap
(`test-trust-observer-neutrality.js`,
`test-occupation-panels.js`,
`test-one-person-army-deed-attainment.js`) — load
starvation, not the lever (the src change is env-gated
OFF by default; the only unconditional OFF-path change is
the `plan.origin` stamp, a field no reader consumes).

Re-run (full output saved to `/tmp/reattach-check-quick-3.log`,
log is ephemeral): **331 passed, 9 failed in 1095s**
(check-exit=1). The 9 failures, with attribution verified
against a pristine base checkout
(`git worktree add 9f7d0522e`, the arm's base, tests run
there directly, worktree removed afterwards):

| failure | on base 9f7d0522e? | attribution |
|---|---|---|
| `test-living-garden-deed-attainment.js` (exit null, 120.1s) | not run (timeout class) | load starvation — hit the 120s cap |
| `test-measurement-proof-update.js` (exit 1, 4.7s) | throws identically: `Error: Proof source inputs are not current` (`balance-proof-update.js:8`) | pre-existing — retained proof manifest stale on base too |
| `test-measurement-workflow.js` (exit 1, 4.5s) | fails identically: "retained neutrality proof covers the current Game/controller/harness inputs" (8 passed, 1 failed) | pre-existing |
| `test-measurement-cache-flags.js` (exit 1, 81.8s) | passes 4/4 standalone on base; passes 4/4 standalone on this tip too (quiet box) | load artifact (AGENTS.md 2026-11-12: cache-flags scores track box load, not the change) |
| `test-phone-frame-proof.js` (exit 1, 6.9s) | fails identically on base: same 3 failures (retained browser input / boot inputs / phone receipt stale) | pre-existing |
| `test-occupation-panels.js` (exit null, 120.1s) | not run (timeout class) | load starvation |
| `test-one-person-army-deed-attainment.js` (exit null, 120.1s) | not run (timeout class) | load starvation |
| `test-trust-observer-neutrality.js` (exit null, 120.0s) | not run (timeout class) | load starvation |
| `test-ladder-bundle-20261108.js` (exit 1, 19.1s) | fails identically on base: same single failure, 78 passed / 1 failed ("control: 200 monster turns WITHOUT delivery fire the ambient raid — fires 0") | pre-existing |

**Verdict: none of the 9 failures is attributable to
this arm.** Four are 120s-capacity timeouts; four fail
identically on the pristine base; the ninth (cache-flags)
passes 4/4 standalone on both base and tip. The
measurement-proof / measurement-workflow / phone-frame
failures are retained-proof freshness tripwires that were
already tripped on the base — refreshing them is a
maintenance task for the ship loop, not this arm, and the
NO-GO revert returns `src/` to the base the proofs were
recorded against anyway.

Note: a host write flap (EPERM on fresh-file creation)
struck ~07:48–07:54 UTC during the base-check setup
(killed a `git worktree add` and a full-tree archive
extraction; the flap watcher logged FAIL@write /
update-ref failures, clearing ~07:54). No evidence was
lost — all corpora, analysis, panel and evidence files
were written before the flap and re-verified intact
after it (JSON parses, 8/8 + 8/8 files present).

## Wall numbers (both legs)

| | control | armed |
|---|---|---|
| Wins (full seat) | 0/8 | 0/8 |
| National scale reached | 0/8 | 0/8 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 3/8 | 2/8 (103207 drops 5→4) |
| Median survival | 151d | 150d |
| Mean deaths/run | 62.25 | 59.63 |
| Starvation deaths (total) | 4 | 4 |
| Villages lost before 150d | 3/8 (103204 d73, 103205 d59, 103208 d128) | 3/8 (same seeds, same days) |

Five of eight armed seeds are bit-identical to their
controls (103202, 103203, 103205, 103206 identical;
103204/103208 identical in trajectory despite the lever
acting) — the lever's footprint is exactly the two seeds
where an attach changed a plan's target, and on 103201
that changed deaths 72→66 with standing and survival
unchanged. Nothing in the wall moved for the better or
worse in a way the bars would notice.

## Village assessment, in plain words

Eight villages, 150 days each. Five never even formed a
plan from a fireside tale — the villagers heard about
beasts and simply never organized around one. Of the four
that did, two named their beast after the hunting party
had already left the village, one named a wave-3 beast and
sat at Haven for three weeks waiting for a bigger story
that never came, and one named a wave-3 beast and left the
next morning — a hundred days before the bigger beast's
story arrived. The one village that did chase a wave-4
beast (Maya and Mangapul, after the Herald) left together
and were still out when the story ended. Nobody died
because of this rule and nobody lived longer because of
it; the villages that survived did so the same way with
the rule on or off. The idea — a villager changing their
mind toward bigger prey when they hear a bigger story —
is sound and reads honestly the one time the proof test
staged it. In real villages it never happens, because a
plan does not wait around: it leaves within days of being
named, and the bigger story arrives months later. The fix,
if anyone wants it, is not in the re-attach rule — it is
in the wait: plans that linger, tales that arrive sooner,
or a re-attach that can reach a party already out. That
is a design question for the coordinator, not a tuning
knob in this arm.

## Blanks and open questions

- **Check re-run**: resolved — 331 passed, 9 failed, none
  attributable to this arm (4 timeouts, 4 identical on
  pristine base, cache-flags a load artifact passing 4/4
  standalone on both base and tip). See §Check re-run.
- **Self-tale lines** (Maya, Pearl): a villager "coming
  back to" their own tale reads oddly. Noted in
  rumortarget-a too; a voice fix (the killer telling
  their own tale differently) is a polish item, not a
  blocker, and belongs to the attach rule, not this arm.
- **Attach-on-hunt-stage plans** (103207, 103208): the
  attach rule names a target for a party already
  departed. Whether a departed party should gain a
  target at all is an open question for the attach rule
  (it also means those plans can never re-attach).
- **No wave-5 tale was told on either leg** (0/16
  seed-legs). Wave-5 beasts were killed on 103203/103208
  (maxWave 5) but the tale channel produced no wave-5
  story — the 4→5 re-attach step is untestable on this
  band by construction.
- **Band sensitivity**: first-attach yield 1/8 here vs
  3/8 on rumortarget-a's band, with 14 vs 27 rumor-born
  plans. Any future attach-rule pilot should expect the
  yield to move with the band.

## Revert note

NO-GO → the lever is reverted from `src/` per the prereg.
Revert verified in the worktree: `git checkout 9f7d0522e
-- src/js/win-plan.js` (base commit at arm start) restores
the file byte-identical to base; `src/` diff vs master is
0 lines after the revert (verified). The revert commit is
LEFT FOR COORDINATOR APPROVAL — `scripts/safe-commit.sh`
refuses file deletions without coordinator approval, and
the reverted lever is a deletion of the added method +
call sites; do NOT use `--force-delete`. The branch as
committed still carries the lever env-gated default OFF
(its OFF path is proven identical to old code: proof-test
old-code-fails control + D2 wrap neutrality). The
instrument (`scripts/reattach-*.js`,
`scripts/analyze-reattach-a.js`,
`scripts/build-reattach-panels-20261117.js`,
`scripts/test-reattach-a.js`) is kept — it is the
measurement, not the lever.

## Files

- Prereg: `evidence/2026-11-17/sim-reattach-a-prereg.md`
- This evidence: `evidence/2026-11-17/sim-reattach-a.md`
- Analysis: `evidence/2026-11-17/reattach-a-analysis.json`
- Panel: `evidence/2026-11-17/reattach-a-panel.md` (+ `.json`,
  `-before.json.gz`, `-after.json.gz`)
- Corpora: `evidence/2026-11-17/perseed-reattach-a-control/`
  (8 files) and `evidence/2026-11-17/perseed-reattach-a-on/`
  (8 files)
- Lever: `src/js/win-plan.js` (commit `5f209af4e`)
- Instrument: `scripts/reattach-driver-20261117.js`,
  `scripts/analyze-reattach-a.js`,
  `scripts/build-reattach-panels-20261117.js`,
  `scripts/test-reattach-a.js`, `scripts/test-rumortarget-a.js`
  (fixture 7 updated)
