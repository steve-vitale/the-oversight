# journey-scale r219 — SCALE leg (days 80–140): national on-ramp + sortie arm

**Run id:** `playtest-loop-a-scale-r219-20261116T0245Z` (lock run_id
`2026-11-16T02:34:45Z`). **Base:** local master `4c30c022a`.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout.**
**Prereg:** `evidence/2026-11-16/journey-scale-r219-prereg.md`
(committed `21ca75abe`); instruments committed `334642b5b`
(analyzer proof 70/70 green before the panel).
**Panel:** paired two-arm, same 4 fresh seeds under both arms —
135609–135612. Arm A control (`ARM=A`, policy
`scalecourt-traderoad-r113-linkraise-sit`, same as r215). Arm B
identical + a driver-local sortie step after the base daily
(lingerfinish Step 1 gates verbatim from
`scripts/policies/partyfinish.js`, calling
`Game.answerLingerer('sortie')`; policy-side only, zero `src/js`
change for the sortie step). 8 sims, all exit 0. Per-seed corpora in
the goal hidden dir `evidence/2026-11-16/arm-a/` and `arm-b/`.

## The pilot defect — found, proven, fixed in this run

The pilot (seed 135609, both arms) turned up a Claudete-guard breach
in the spoken-raise class: on d130 Felipe answered a link proposal
he had never heard. The transcript (`arm-a/…-raisetalk-135609-5.txt`,
pre-fix) shows the player answering "All right. Let's ask them." to
a sitting where the raise line ("We should link with them — we'd be
stronger together.") was never spoken, and the link to The Red Table
II formed that day.

**Mechanism** (proven with a driver-local `RAISE_DEBUG=1` probe that
replays the seed and logs every `bondChoices` call with a pending
raise plus every flag-setting call): Felipe's raise line *was* spoken
on d128, so it sat in the 48-entry run ledger. On d130 the raise was
held, queued into `heldBeats`, and the goon/continuer tried to speak
it — but `convoWouldBlock` fired (run ledger), so the goon
substituted an alternate thread beat ("Huh. I wouldn't have guessed
that about you.") **while keeping the ask tag** (`{tag:'linkraise'}`).
`sayLine` recorded the substitute with that tag, flipping
`linkRaiseSpoken` for a line that never voiced the proposal, and
`bondChoices` offered `link:accept`. The r132 spoken-ask gate was
bypassed by a mis-tagged beat, not by a missing gate. The same shape
existed for `bondproposal` (shared branch).

**Fix** (commit `11b938e8d`, `[needs-eyes]`): in
`src/js/conversation.js`, the goon's run-block substitution branch
resets `goonOpts` to `{}` when it swaps in the alternate thread beat.
The held ask stays pending for a later sitting; the substitute speaks
as a thread beat with the thread's own tag. One fix covers link +
bond. Dialogue/narration-scoped — no demand, number, bar, or line
changes; inside the combat-play gate. The driver probe
(`RAISE_DEBUG=1` instrumentation) is committed with it, and the
`R215 SUMMARY` label is fixed to `R219 SUMMARY`.

**Proof:** `scripts/test-journey-scale-r219-goon-ask-tag-20261116.js`
— **27/27 green** with the fix; **23/27 red** without it (exactly
the 4 defect assertions: flag + choice for link and bond; both
good-flow controls stay green). The red control used the patch-file
method (no stash — the stash stack is shared across worktrees).
Writing the test taught two things worth keeping: a 'small'/'trade'
opener has no thread beat at all, and a 'want' opener's engageBeat can
be ledger-blocked — both land the goon on the else branch, so the test
stages the thread to 'village' (always has a beat) and guards loudly
against the else-branch fallback instead of passing vacuously.

**The fix, proven live in the panel** (seed 135609, both arms
identical): the raise line is spoken aloud on d128 with the accept
choice properly offered (raisedebug: `spoken=True`,
`offered=['link:accept','link:decline']`, the player doesn't take
it); on d130 the substitute line carries `tag=None` and
`offered=[]` — the sitting ends honestly ("Good talk. I feel like I
know you a little better now.") with outcome `not-offered`. On d138
Milagros voices the proposal properly and the player accepts it; on
d139 the link forms — as **Haven joining The Red Table II as
subordinate** (the pilot's blind d130 formation had it the other way
round). The fix didn't kill the link; it delayed it 9 days and routed
it through an honest voicing. The post-fix 135609 trajectory diverges
slightly from the pilot (lead 1/3→2/1 seasoned/active, lrTalks 5→6,
wave-5 fights 5→9) — that divergence *is* the fix working.

## Results — the village in plain words

**National 0/8.** No village on either arm reached national. The wall
didn't move — but every seed names its blocker, so the run is
informative under the prereg's rule (0/8 with a named per-seed
blocker).

- **135609 (Haven):** alive to d141, 7/7 people, regional, lesser
  seat d40. Six links, all still active, first on d6. Tribute ready
  d99 but **unpayable** — 8 attempts, all veterans-short (the M23
  shape again). Blocker: closest road LEAD 1/3 seasoned (2 active) —
  needs 2 more seasoned links. 13 deaths, 38 fights (5 of them
  wave-5).
- **135610:** wiped out d87, one person left. Three links (first
  d16), lesser seat d38, tribute never ready. Blocker: **collapse**
  before the national window (final: LEAD 1/3, COV 0/3, TRADE 1/3).
  13 deaths, 17 fights, no wave-5 at all — the village died before
  wave 5 arrived.
- **135611:** wiped out d76, three people left. Three links (first
  d11), lesser seat d39, tribute never ready. Blocker: **collapse**
  (final: LEAD 0/3, COV 0/3, TRADE 1/3). 11 deaths, 14 fights.
- **135612:** alive to d140, 5/5 people, regional, lesser seat d47.
  Five links (first d25), tribute ready d117 but **unpayable** —
  8 attempts, all veterans-short. Blocker: LEAD 2/3 seasoned (2
  active) — needs 1 more. 13 deaths, 18 fights, no wave-5 fights
  even though wave-5 entities were live in the world 21 days. The
  fusion reactor is online (`fusion=true`) — the only seed to get
  there.

**Survival:** 2/4 per arm (135609, 135612 alive; 135610, 135611
over). **Lived-days 444** vs the 3-band rolling mean 513 (−13.5%,
guardrail 385–641: HOLD). **Lesser seat priced 4/4** (HOLD).
**Tribute delivered 0/4** — a step back from r215's first deliveries
(2/4); both ready villages were veterans-short on every attempt.

**Arm A vs arm B: identical everywhere except the sortie ledger.**
Every analyzer section, every transcript, every raise talk is
byte-identical between arms (the only diffs are the arm-tag strings
in the regional/trust JSONs). The sortie step never fired, so it
changed nothing — which is itself the arm-B finding (below).

## Q1 — national on-ramp: NO-GO on the wall, blocker named per seed

National 0/8, informative by the prereg's rule: 135609 LEAD 1/3
seasoned (needs 2 more); 135610 collapse d87; 135611 collapse d76;
135612 LEAD 2/3 seasoned (needs 1 more). The binding gap is still
seasoned-link production, not survival and not tribute — the two
survivors both had the tribute ready and couldn't pay it for lack of
veterans, and both were a seasoned link or two short of national.
No seed overturns the picture (no national, no full seat, no
wave-5 kill).

## Q2 / Q3 / Q4 guards (per arm — both arms identical)

- **Spoken-raise: GO.** 16 raise talks (3 properly-answered, 2
  counter, 11 correct holds), **0 not-offered-spoken, 0 defects**.
  The pilot defect is gone in the panel data.
- **Vetbar: GO.** 0 disagreements on all four seeds (140/87/76/140
  rows).
- **Trap-line: HOLD.** 1 driver sitting with a mime, answered,
  0 defects; 26 mimes in the say-capture overall.
- **Betrayal sibling: HOLD.** 1 turn-0 betrayal:accept offer, invite
  label in the opening, 0 defects.
- **Nod-loop: HOLD.** Worst streak 3x (Omar's nods, d90 and d120 on
  135612); 0 sittings at ≥4.
- **Lived-days: HOLD** (444 vs 513, −13.5%). **Lesser: HOLD** (4/4).
- **Q3 daily-play mime (read-only):** 25 daily-play mimes in the
  capture, **0 daily accepts proven** (capture lower bound 0, 0
  off-day events in the betray watch). The carried gap stands:
  the shared chooser never takes an invite in daily play, verbal or
  mimed. Lane decision owed — teach the chooser to take
  `betrayal:accept` + `nv:accept` when offered, or keep proving
  fixes only where the driver looks. No build claimed.

## Q5 census (per seed, both arms identical)

| seed | days | end | pop | rank | lesser | fights (w1/w2/w3/w4/w5) | deaths | books |
|---|---|---|---|---|---|---|---|---|
| 135609 | 141 | alive | 7/7 | regional | d40 | 38 (6/5/2/20/5) | 13: monster 4, arena 3, wild 2, stranger 1, wound 1, contest 1, dehydration 1 | close, 0 unattrib |
| 135610 | 87 | over | 1/1 | regional | d38 | 17 (6/5/3/3/0) | 13: wild 4, stranger 3, starvation 2, ambush 1, arena 1, wound 1, monster 1 | close, 0 unattrib |
| 135611 | 76 | over | 3/3 | regional | d39 | 14 (4/0/4/6/0) | 11: wild 3, night 1, monster 1, arena 1, dehydration 1, wound 1, contest 1, starvation 1, Ugly Beast 1 | close, 0 unattrib |
| 135612 | 140 | alive | 5/5 | regional | d47 | 18 (5/2/2/9/0) | 13: wild 6, monster 3, wound 1, stranger 1, contest 1, Ad Break 1 | close, 0 unattrib |

What they knew: every village linked early (first link d6/d16/d11/
d25) and kept its links (6/3/3/5 ever, all still active at the end
or at collapse). Nobody reached national; nobody held a living
veteran at the end except 135612 (1). What was missing: seasoned
links (the national bar), veterans for the tribute (8 failed
attempts on each ready village), and — on 135612 — any answer at
all to three weeks of live wave-5 entities in the world.

**Funeral-mend watch:** no funeral/mourning shape change vs r215's
band observed in the read material.

## Spotter — thin on this band

- **d90 (binding read):** 135609 — Wei 8 food XP, spotter skill ≥1:
  Wei and Tashi. 135612 — Tao 2 XP, no skill yet. 135610/135611 —
  roster 0, village already over (no d90 read exists).
- **End:** 135609 — Meera 5 XP (only spotter). 135611 — Catalina 1
  XP. 135612 — Aria 2 XP. 135610 — none.
- The spotter is barely alive on this band: one village in four had
  a skilled spotter at d90, and by the end only one villager per
  surviving village holds any spotter XP at all. The r215 blank
  ("spotter FILLED") is not re-filled here — the skill exists, but
  almost nobody is learning it.

## W5-INSTANCE — MIXED on one seed, UNANSWERED on three

- **135609: MIXED.** 9 wave-5 fights (5 scholar, 4 field). Three
  distinct lingerKeys; two recur — ling17 fought twice (Editor
  1500→1125→1107 HP across d102–d134), ling18 twice. Three of the
  nine were fresh full-HP spawns. Live wave-5 entities max 4/day on
  36/140 days; the Editor lived at the treeline d101–d140 (64 days),
  finale_crew d118–d140, cancellation d122–d140, timeslot d135–d140.
  So: the same wounded Editor *is* fought again (ONE-shape evidence),
  *and* fresh full-HP Editors keep arriving (SUCCESSIVE-shape
  evidence) — both shapes live in one village. The question's answer
  is "both".
- **135610 / 135611: UNANSWERED.** No wave-5 fights, no live wave-5
  entities at all — both villages died before wave 5 arrived.
- **135612: UNANSWERED.** 0 wave-5 fights, but live wave-5 entities
  max 4/day on 21/140 days. Present for weeks, never fought — the
  r215 shape again, on a village that survived to d140.

## The sortie arm — the gates are the blocker

Arm B recorded **99 lingerer days** (135609: 40, 135610: 18, 135611:
6, 135612: 35) and called **0 sorties**. Every lingerer day has a
named held reason: `sumHp` 64× (the lingering monsters' combined
HP over the 300 cap), `minHp` 27× (no lingerer weak enough — none
at ≤80 HP), `tbfight` 2×, `pantry` 6× (pantry under 12,000 kcal).
Wave-5 entities were seen on only 10 of those days (all on 135609).
Arm B is informative under the prereg's second disjunct (0 calls +
named held reason on every lingerer day): **the gates, not the
policy, are the blocker.** The next fix is a gate question, not a
policy question — the two binding gates are the HP caps: lingering
wave-5 monsters are never weak enough (min HP > 80) and almost
never few enough (sum > 300). A sortie that can only fire at a
wounded straggler will almost never fire while Editors linger at
full strength for weeks. (That gate call is owed, not made here —
the gating freeze stands and the sortie step is driver-side.)

No survival split between arms (identical trajectories), so no
paired attribution for the sortie step on survival, tribute, or
national — it never engaged.

## People check (6 transcripts + 16 raise talks, read in full)

Both arms' material is byte-identical, so the read below covers both.
No stutter recurrence ("About X — <the same X as a question>") in
any sitting. No r137 want-thread resume defect, no r218
commit-refusal noBeat, no r216 funeral-mend line seen in these
sittings.

- **135609 d90 — Tashi (arborist, steady, trust 91).** A real
  conversation: "Any regrets? The real kind, not the small stuff."
  The player answers honestly; Tashi answers with a specific,
  grounded regret (rushed Kathmandu mornings she'd pay anything to
  have back). The NPC wants something, the answer engages, the
  ending resolves. Good.
- **135609 d120 — Nawal (blacksmith, mischievous, trust 27).** Asks
  the player to haul creek water at dawn; the player commits — and
  Nawal answers honestly that she's away on the road and can't
  promise a dawn meet, deferring to when she's back. Perception-
  grounded honesty: she doesn't pretend to be somewhere she isn't.
  The favor is left pending, voiced, not silent.
- **135612 d90 — Sigrun (night security guard, withdrawn, trust
  20).** A grief-thread opening ("I don't know what to do with my
  hands today. Seen worse."), the player accepts the walk, she shows
  a private thinking place and asks not to tell the others. She
  ends it when she needs quiet. The pivot to her curious want is
  abrupt but it's a want surfacing, not a defect.
- **135612 d120 — Lada (mechanic, steady, trust 59).** A goal-thread
  conversation about being alone vs. people ("I like people fine.
  In doses. Small doses. With exits." / "When I'm alone I'm not
  lonely. I'm recharging."). Consistent voice, coherent, resolves.
  Observation, not a defect: her `warn_you` want never surfaced
  (stage 0) — the player kept asking for more and she kept talking
  about herself instead. The warning she carries never got delivered.
- **135612 d90-nv / d120-nv — Omar (piano tuner, dry, trust 90).**
  The Arabic-only nonverbal sittings. d90: three nods, each answered
  with a distinct line, the sitting thins naturally and closes with
  a palm-press. d120: the mime invite — Omar mimes walking to the
  ridge, the player accepts (`nv:accept`), quiet companionship, "A
  promise without words." The trap-line guard counts d120 as
  answered. The 3x nod streaks are the driver picking nod, not the
  NPC looping. These read like people.
- **Raise talks (16).** All properly voiced or correctly held.
  Lillian (135610) waits two days, then voices the Thornfield
  proposal properly on d16 and it's accepted — a clean arc. Gunther
  (135611) holds on d8 (he wants teaching, not the raise), voices
  Stonebridge on d10. Jayden voices Ashford on d24. Omar (135612)
  holds across four sittings (d17–d24) — he speaks only Arabic, so
  he literally cannot voice a link proposal in words, and the engine
  doesn't fake it. Correct.
- **Observations (not defects):** Lillian's woods secret ("I saw
  something in the woods I'm not telling anyone about.", d14) is
  raised and never returned to in that sitting — a dangling thread.
  The translation asides in Omar's sittings ("Great for ratings!",
  "The gamblers are taking notes!") are jokey System-voice
  intrusions — consistent with the System's tone, not a defect.

## Verdicts

- **REACHABLE:** yes for the leg's content — lesser 4/4, tribute
  ready 2/4, links raised and formed, the Editor present and (on
  135609) fought. National: **not reached** (0/8). The wall is
  seasoned links and veterans, not survival or tribute readiness.
- **FUN:** the conversations are the leg's strength — Tashi's
  regrets, Sigrun's grief walk, Omar's wordless ridge visit read as
  people with things they want. The dullest edge is the wave-5 door
  again: monsters pace at the treeline for weeks while the village
  never meets them, and now we know the sortie that was supposed to
  answer them can't fire — its gates never open on a healthy Editor.
  A player who sorties gets a fight; this policy never does, and the
  gates say why.
- **WINNABLE:** not yet. No full seat, no national. Two villages
  survived everything else and stalled one seasoned link short with
  a tribute they couldn't pay for lack of veterans. The binding
  links this band are seasoned-link production and veteran
  production — the same wall r215 named, one band later.

## Telemetry check: 2 LOUD lines, both DOWN — investigated, baseline NOT rolled

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'.../journey-scale-r219-trust-*.json' --metrics
fightsTotal,fightsByWave.4,maxGameDay` → **2 LOUD lines** per arm
(identical): fightsTotal −64% (241 → 87); wave-4 −79% (178 → 38).
maxGameDay QUIET (444 vs 468, −5%).

**Investigation (before rolling):** no combat-initiation,
wild-encounter, spawn-rate, or fight-frequency code changed since
r215 — the net `src/js` diff since r215's base is dialogue-only,
and this run's own change is dialogue-only (the goon tag fix); the
driver policy is identical to r215, and arm A (no sortie step) shows
the same swing as arm B, so the sortie step can't be the cause. The
swing is band composition: two villages collapsed before the wave-4
window could accumulate fights (135610: 3 wave-4 fights, 135611: 6),
and the metric is known to swing ±60–85% band to band with no code
change (r196 215, r197 370, r204 137, r206 400, r215 237, r219 87).
The lived-days guard already catches the same band-shape signal
(444 vs 513, HOLD). **Baseline NOT rolled** — same reasoning as
r206: rolling to this band would chase noise. The baseline stays
241/178/468.

(First attempt fed the regional JSONs to the check and got three
"disappeared" LOUD lines — the regional files don't carry those
fields at all. That was an instrument-input mistake, not a game
signal; the trust JSONs are the correct input shape, as r206/r215
used. The baseline was not touched either way.)

## Gate: 332 passed, 8 failed — 0 attributable; 7 standing/pre-existing + 1 flaky timeout

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
(re-run with full output, 1076s): **332 passed, 8 failed**. The first
run was 333/7 — the one-count difference is the trust-observer
timeout below, which passed in run 1. The 8 failures are r215's 7
standing/pre-existing failures plus that flaky timeout:

- **measurement-proof pair** (update + workflow): standing staleness,
  same as r215 — the proof inputs track src hashes, so any src change
  invalidates them. Not a regression.
- **living-garden + one-person-army timeouts:** r207 knowns, unchanged
  (both hit the 120s cap, exit null — timeouts, not assertion
  failures).
- **trust-observer-neutrality:** 120s timeout (exit null, 120.1s) —
  passed in the first run of this gate. Load flakiness on a heavily
  loaded box, not an assertion failure, not attributable.
- **phone-frame stale receipt:** r207/r215 known, unchanged (my
  change is dialogue-only; the phone-frame proof tracks browser
  inputs and index.html).
- **ladder-bundle** (ambient-raid control fires 0) and
  **person-trust** (HAUL:3 vs 0): r215 proved both pre-existing —
  they fail identically with the fix stashed. Dialogue code cannot
  reach either.
- **Zero attributable to this run's fix.** The fix's own proof test
  is not green-listed (new proof tests run standalone, as in r215)
  and re-runs **27/27 green** on the committed code.

Full gate NOT re-run a third time: the two runs agree on the
standing set, the only difference is one load timeout, and the
attributable count is 0 in both.

## Metric review (§14)

- **Q1:** the interesting-finding rule as written — national 0/8
  with a named per-seed blocker per arm (informative, NO-GO on the
  wall). Arm-B informative rule, second disjunct: 0 sortie calls
  with a named held reason on every lingerer day (informative — the
  gates are the blocker). No overturn (no national, no full seat,
  no wave-5 kill on either arm). No survival split between arms.
- **Q2:** guards as written — spoken-raise GO, vetbar GO, trap-line
  HOLD, betrayal HOLD, nod-loop HOLD, lived-days HOLD (444 vs the
  rolled-forward 3-band mean 513), lesser HOLD (4/4). The
  lived-days control roll (478 → 513) was recorded in the prereg
  before the panel ran, per the rolling-mean practice.
- **Q3/Q4/Q5:** as written. Spotter d90 is the binding read
  (second live band) — thin on this band (see above). W5-INSTANCE
  answered per arm by the sortie variant: MIXED on 135609,
  UNANSWERED on the other three. Daily-play mime read-only, gap
  carried, lane decision owed.
- **Telemetry:** scale.json baseline is the r204 3-band roll
  (241/178/468); r219 is 2 LOUD lines down, investigated, baseline
  NOT rolled (see above).
- **Metric-change note for the next run:** the telemetry fight
  metrics are noise-dominated on a 4-seed panel (six bands now span
  87–400 with no code change between several of them). The
  lived-days guard already carries the band-shape signal; the fight
  totals add little beyond it at this panel size. A future run could
  propose dropping fightsTotal/wave-4 from the per-run telemetry
  check in favor of the lived-days guard alone — that proposal is
  owed, not decided here.

## Fix landed this run

- **Goon ask-tag leak → fixed + proven** (commit `11b938e8d`,
  `[needs-eyes]`): the goon's run-block substitution no longer
  carries the held ask's tag onto substitute text. Proof test
  `scripts/test-journey-scale-r219-goon-ask-tag-20261116.js`
  (27/27 green; 23/27 red without the fix). The pilot's blind
  accept is gone in the panel data; the link it had formed now
  forms 9 days later through a properly voiced proposal.
- **Driver:** the `RAISE_DEBUG=1` probe committed; `R215 SUMMARY`
  label fixed.
- **Not built (documented):** the sortie gates (min/sum HP caps)
  are the next fix's question — the gating freeze stands and the
  sortie step is driver-side, so no gate change was made. Lada's
  unsurfaced warning and Lillian's dangling woods secret are
  observations, not fixes.

## Closeout

- Panel complete: 8 sims, all exit 0; analyzer run once per arm
  (both exit 0); arms identical except the sortie ledger.
- Rotation: 3 → 0 (written at closeout).
- Merge: `git merge --ff-only journey-scale` in the main tree;
  report "merged locally, pending ship" — no version tag, no push,
  no live verification (the ship loop owns that).
- Worktree released (`worktree-release.sh journey-scale merged`),
  worktree + branch removed, final reap, main tree verified clean.
- Lock deleted at closeout. Heartbeat loop killed at closeout.
