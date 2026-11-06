# Journey succession r143 — Lane B, leg 7 (succession): the newcomer channel answers — CAP-NC PASSES 3/3

Leg 7 (succession). Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout, verified by re-read after landing.
Base master 792ab8814 (branch base; master moved to abc4df164 during
pre-flight when a sibling merged sim-spandraw-census-a — the r143
branch rebases onto the new master before merge). Run number r143
follows r142 (succession, previous day); the rotation file, not the
number, is the authority.

## Run setup — lock, registration, heartbeat

- No lock at run start. Fresh lock written (run_id 2026-11-06T05:55:28Z).
- Pre-flight: main tree clean, disk 26% (24% by closeout). Reap STALLED:
  the reaper's `git status --short` in sim-catchup-summary-a (8.7G
  tree) sat in uninterruptible disk sleep (D-state, folio_wait) for
  8+ minutes with no output; the reap session was killed (its only
  active child was that read-only status check, no removal in
  progress — safe kill, registry lock released). Cap verified by
  direct inspection instead: 9/16 trees live, under cap. The reap
  stall is infrastructure noise (box load avg 8–11 from sibling sims
  + reaps), not a repo problem; the reaper itself was left to finish
  on its own in a sibling run.
- Registration took THREE attempts (~25 min total, the run's biggest
  cost): attempt 1 (timeout 120) and attempt 2 (timeout 300) both
  died inside `git worktree add` — the checkout itself takes >5 min
  on this loaded disk, and each timeout left an orphaned git that
  then cleaned up its own partial tree (directory vanished, branch
  kept). Attempt 3, run with NO inner timeout and left to background,
  completed in ~12 min (register-exit 0; worktree 7.6G). Lesson for
  the next run: never wrap worktree-register.sh in a short `timeout`
  on this box — let the exec background and deliver. The plain slug
  journey2-succession is still stale-registered (status done-merged,
  Oct 30; its directory is an orphaned non-git copy, NOT deleted —
  needs a main-session disposition, same as r137/r142), so this run
  used the run-suffixed slug journey2-succession-r143, the same
  deviation prior runs used.
- Heartbeat: immediate heartbeat landed after registration; detached
  setsid loop (sleep 300) started (pid 47524). A service restart
  mid-run killed the loop (and the smoke seed mid-flight — see
  below); the loop was restarted within ~1 min (pid 1788) and the
  registry heartbeat stayed fresh throughout (never >6 min old).
- Service restart at ~06:34Z killed the first smoke-seed run after
  its d+3 convos (stdout.json 0 bytes — no record, clean re-run, not
  a duplicate). The fresh smoke run completed cleanly.

## Pre-registration (binding, written before any scored seed)

Prereg: evidence/2026-11-06/journey-succession-r143-prereg.md.
Question carried from r142 (verdict INSUFFICIENT-DATA): can a bearer
bond with a NEWCOMER they talk to, by d+14 after arrival (or after
the probe conversation, whichever is later)? r143 applies r142's
metric-review revision verbatim: probe the newcomer channel directly
— the first newcomer who arrives after the handoff and talks to the
bearer, bond by the deadline. Panel stop rule: run seeds 33701–33708
in order, stop at 3 eligible or after 33708.
Smoke seed 33799 (EARLY_KILL_DAY=5, POST_DAYS=25) proved the
instrument before the panel: newcomer tracking runs (relPost roster
11, _newcomerSeen tracked, no-arrival recorded cleanly as
{none:'no newcomer arrived'}), bondDaily 25/25 entries carry
bearerId, stranger probe opens (Rafael trust 33, curious) and bonds
by d+14 descriptively. Zero newcomers arrived in the 25-day smoke
window — the instrument's no-arrival branch, not a failure.

## Binding verdict: CAP-NC = PASS (capacity holds)

- CAP-NC bar: ≥3 eligible seeds AND ≥3 bonded by the deadline AND
  bonded/eligible ≥ 2/3. Result: 3 ELIGIBLE seeds out of 3 run — and
  ALL 3 bonded by the deadline. The stop rule fired after 33703.
  - 33701: Cuan arrived d+15, probe d+15 (trust 28, curious),
    bonded by deadline d+29. Probe bearer Rosa (organic handoff d11).
  - 33702: Nikolai arrived d+16, probe d+16 (trust 18, curious),
    bonded by deadline d+30. Probe bearer Linh (scripted d41).
    Nikolai bonded at trust 18 — low-trust bonding works.
  - 33703: Ingrid arrived d+14, probe d+14 (trust 27, curious),
    bonded by deadline d+28. Probe bearer Susan — the SECOND bearer
    (Heinrich died before d+14); the instrument correctly attributes
    to the bearer at probe time, not the first bearer.
  - No seed was skipped (all 3 handoffs fired: 2 organic, 1
    scripted), no probe refused, no village ended before its
    deadline. Per §14 the bar is NOT re-scored against a friendlier
    metric mid-run. 3/3 bonded is the binding verdict: PASS.
- BONDED-EVER (descriptive): 3/3 probe-opened pairs bonded in a
  snapshot or bondDaily entry.
- The denominator problem is SOLVED by the design change, not by
  sampling harder: r137 got 2 eligible of 6, r142 got 1 of 8, r143
  got 3 of 3 — because the bar now measures the channel that
  actually supplies bonds. The r142 metric-review revision is
  validated as written.

## The mechanism answer (descriptive): newcomers are the whole supply, and the bond is fast

- First arrivals land d+14–d+16 on every panel seed (33701: 6
  arrivals, 33702: 4, 33703: 3; 13 total). The first newcomer is
  probed the same day they are first seen — arrival and probe are
  the same day on all 3 seeds, so the deadline is arrival+14 in
  every case.
- FIRST-bearer new bonds, relPost→relEnd, all 3 panel seeds: 4
  total — 3 with NEWCOMERS, 1 with a pre-existing roster member
  (33703: 1 pre-existing; 33701/33702: 0 pre-existing). Combined
  with r142's 9/9 and r137's 100%, the cross-run picture is that
  newcomers supply essentially all of a first bearer's new bonds.
  NPC-NPC new bonds: 47 across the panel — the autonomous bonding
  engine runs daily; the bearer is not excluded from it.
- Two of the three probe newcomers later held the mantle themselves
  (33701: Cuan, Rosa→Cuan; 33702: Natalia arrived d+34 and later
  held it). The newcomer channel feeds succession itself, not just
  the bearer's social life.
- Descriptive stranger-probe CAP-D14 (r142 bar, not binding here):
  not-bonded-by-d14 (33701 Anuar), no-stranger-pool (33702),
  second-handoff-before-d14 (33703 Maya, bondedEver true),
  bonded-d14 (smoke 33799 Rafael). The old channel's saturation is
  confirmed again — 1 of 3 panel seeds had no stranger pool at all.

## Self-request regression check (r133 fix, in the wild)

selfReqDayEntries = 0 on all 3 panel seeds (and on the smoke seed).
The r133 ledger.js purge holds in wild play: no stale self-addressed
talk request survives a handoff on this panel. The r133 selftalk
proof test also re-runs ALL GREEN on this base
(scripts/test-journey-succession-r133-selftalk.js).

## People check (sense, not counts) — PASS, with one noted pattern

Read in full: all three newcomer-probe transcripts + one d+14
successor transcript per scored seed.
- Cuan (33701): a newcomer with a real plan (learn one useful thing
  a week — weather-reading this week), accepts the invite
  ("Someone should watch your back"), takes Scout from Henry with a
  proper handoff ("Henry nods, stepping back"). One muddy line,
  noted not scored: his "lately" answer — "Wheel of Teeth. They
  just... took you. Came back like nothing happened." — the referent
  is unclear (who was taken?). Ends resolved.
- Nikolai (33702): opens with a real question (what did you do for
  fun), shares a specific ache (Vladivostok — "Places don't miss
  people. ...Do they?"), deflects with character at the end ("I've
  got things to do. People to avoid."). Ends resolved. Bonded at
  trust 12.
- Ingrid (33703): the richest — opens with hands/trade (physical
  therapy aide, clipboards → wire and wood), mourns Heinrich BY NAME
  ("Since Heinrich died... I keep expecting to see Heinrich at the
  fire") — CORRECT mourning, verified against the record (Heinrich,
  the first bearer, died between relPost and the probe; the mantle
  had already passed to Susan). Accepts the invite ("Okay. Yeah. I
  trust you."), names the party "The Company" with Maya, takes
  Scout. Ends resolved.
- Nancy (33701 d+14): confides a secret (sneaking out at night, a
  clear spring), deflects the confrontation with character ("I don't
  remember saying that"), accepts the invite eagerly, teaches
  serviceberry, takes Scout from Benoit. Ends resolved.
- Tyler (33702 d+14): opens with a resumed thread ("We never did
  finish talking about what's been happening — that was 11 days
  back"), grief with character ("We bury, we grieve, we keep going.
  There's no step four."), names the party "The Company". ONE
  FIZZLE, second sighting of the pattern (r142's James, same shape):
  the bearer asks "Is there something you need? Really."
  (alive:want:ask_favor) and Tyler drops it ("...Sorry, lost my
  train of thought") — the want evaporates without being engaged or
  deflected with character. Filed as the run's blank (below).
- Maya (33703 d+14): opens with a want (eat well), a walk with a
  real beat (fresh tracks — go back quietly), teaches cacao, the
  confrontation resolves with an explanation, accepts the invite
  reluctantly with character ("...Fine. This had better be worth
  it."). Ends resolved.
- Recurring cosmetic wrinkle (r137, confirmed again): the recap pick
  renders in second person ("Still on your plan here", "Still on
  what you did for fun") — reads naturally here, unlike r137's
  third-person "Still on what they confided". No longer a wrinkle
  on this panel; noted for the record.

## The run's blank (filed, not fixed — instrument-only run)

- ASK_FAVOR WANT-FIZZLE (second sighting): when the bearer asks a
  villager "Is there something you need? Really." (alive:want:
  ask_favor), the NPC answers "...Sorry, lost my train of thought"
  and the want evaporates — no engagement, no characterful
  deflection. Seen on r142 (James, 33605) and r143 (Tyler, 33702).
  The ask_favor want path needs a real answer or a real refusal, not
  a dropped thread. Builder's list; no src/js change this run
  (instrument-only by prereg).

## Village assessment (plain words)

Three villages, all reached a handoff, none skipped:
- 33701 (Chris→Rosa, organic d11): the steady one. Three bearers
  (Rosa→Cuan→Pavel), 9 alive at handoff, 5 at the end. Six newcomers
  arrived across the window; Rosa bonded with the first (Cuan), who
  then held the mantle himself. The village kept bonding (relEnd 77
  bonds, up from 40 at handoff).
- 33702 (Emma→Linh, scripted d41): the churn. Eight bearers in the
  window (Linh→Tyler→Sam→Tancredi→Ruth→Nancy→Natalia→Marit), 10
  alive at handoff, 0 at the end — the village died out entirely.
  Linh bonded with Nikolai, the first newcomer; Natalia, a later
  newcomer, held the mantle near the end. Even a dying village
  keeps making new faces and new bonds until the last days.
- 33703 (Kate→Heinrich, organic d12): the handover. Four bearers
  (Heinrich→Susan→Ella→Leo), 11 alive at handoff, 6 at the end.
  Heinrich died before the first newcomer arrived; Susan, the
  second bearer, bonded with Ingrid the day she arrived, and Ingrid
  still holds Scout at d+64.
- 33799 (smoke, Hilda→Jesse, scripted d6): the quiet one. One
  handoff, 11 alive at handoff, 9 at the end, zero newcomers in 25
  days — and Jesse still bonded twice, both with people already
  there. A short window with no arrivals is not a dead village.
The pattern across the panel: newcomers arrive on every village
within two weeks of a handoff, the bearer meets the first one the
day they arrive, and the bond follows within the fortnight. The
successor's social life runs on arrivals — and the arrivals keep
coming (3–6 per village over 70 days).

## Verdicts for the leg

- REACHABLE: yes — succession fires on 3/3 panel seeds (2 organic,
  1 scripted), the pick follows trust on every handoff (rank 1),
  the funeral arc fires, and the new bearer's social life continues
  through newcomers, now measured on the channel that supplies it. A
  real player reaches this content by surviving to a death, which is
  the ordinary game.
- FUN: yes — the successor's second life is social through
  newcomers, and the conversations read like people (Ingrid's
  mourning, Tyler's grief, Cuan's plan). The one fizzle is the
  ask_favor drop, filed above.
- WINNABLE: unchanged by this run (no gate, price, or power changed;
  instrument-only run). The winnability chain is untouched, as
  ordered. The carried design question — can a bearer bond with a
  stranger they talk to — is now answered YES on the channel that
  matters, which removes a suspected blocker from the succession leg
  rather than adding one.

## Determinism proof

Seed 33701 re-run to a scratch file (/tmp/r143-33701-rerun.json):
BYTE-IDENTICAL to the panel file — the read-only wraps are
trajectory-neutral on this base.

## Metric review (§14)

- The r142 metric-review revision is VALIDATED: probing the newcomer
  channel directly solved the denominator problem (3/3 eligible in
  3 seeds vs 1/8 in r142). The eligible-subset design is now the
  standing instrument for this question; the next succession run
  should keep CAP-NC as the binding bar and NOT revert to the
  relPost-roster stranger pool.
- The no-stranger-pool rate (1/3 this panel, 6/8 in r142) stays a
  saturation datapoint, not a denominator — correctly so, since the
  relPost roster is a near-clique by handoff day on every seed.
- The ask_favor want-fizzle is now a two-run pattern, not a one-off:
  the next run that touches dialogue should check whether the
  ask_favor path has a real answer, or file it to the builder with
  both sightings cited.
- The smoke seed's zero-arrival window (25 days) vs the panel's
  first arrivals at d+14–16 says the smoke window should stay short
  (it proves the instrument, not the phenomenon) — no change.
- r142's bond counts are NOT re-scored here; r143 scores only the
  new decomposition (CAP-NC on the eligible subset + OPP with
  newcomer attribution), per its prereg.

## Telemetry deviation check (step 14) — LOUD lines, all EXPLAINED, baseline NOT rolled forward

Command (per-seed, single files — r133's aggregation lesson applied):
node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-06/journey-succession-r143-tele-<seed>.json'
--metrics deaths.bearer,census.alive,census.fallen,
census.integrationStage,week2.deadBearerMentions, per seed.
- LOUD: census.integrationStage -80% (baseline 15 -> current 3) on
  ALL 4 seeds (panel + smoke). EXPLAINED — baseline artifact, not a
  game deviation: Game.integrationStage() returns 0–3, so a baseline
  of 15 is definitionally impossible; the baseline was seeded when
  the metric meant something else. Current 3 is Full Integration,
  the ceiling. Same family as r137/r142.
- LOUD: census.alive -82% to -100% (baseline 49 -> current 0–9).
  EXPLAINED — scale + extinction: baseline 49 is a large grown
  village; this panel's villages are small (9–11 alive at handoff,
  0–9 at end), and 33702 went extinct (0 alive). Same as r142.
- LOUD: deaths.bearer +60% (5 -> 8) on 33702; -80% (5 -> 1) on
  33799. EXPLAINED — window length + churn: the 8 is the churn
  village (8 bearers); the 1 is the stable single-handoff smoke
  seed. Same as r142.
- LOUD: census.fallen +70% (10 -> 17) on 33702; -70% (10 -> 3) on
  33799. EXPLAINED — same regime: fallen tracks window length and
  churn; 33702's village died out entirely, 33799 is the 25-day
  smoke window.
- No LOUD on week2.deadBearerMentions on any seed (funeral echo
  healthy; values 4/4/4/2 against baseline 3).
- Baseline NOT updated this run: the LOUD lines are per-seed spread
  around a coherent panel, not a systematic shift — the panel mean
  for deaths.bearer is exactly the baseline (5.0), and the other
  metrics diverge by regime (small villages, one extinction), not by
  a game change. Panel means (33701–33703, smoke excluded):
  deaths.bearer 5.0, census.alive 3.7, census.fallen 13.0,
  census.integrationStage 3, week2.deadBearerMentions 4.0. The next
  re-baseline should use stated panel means like these (integrationStage
  corrected to 3 definitionally), not any single seed's values.

## Gate

[GATE PENDING — check.js --quick running in worktree at note time;
result to be filled before commit.]

## Seed-band freshness re-check (skill: local_seed_band_freshness)

Band 33701–33703 + smoke 33799 verified FRESH before the run:
exact patterns 33701–33703 and 33799 across ALL dated preregs
(evidence/*/sim-*-prereg.md and evidence/*/journey-*-prereg.md,
732 files) — zero matches. Loose-hit explanation checked and
dismissed: a "3379" hit in
evidence/2026-11-03/sim-verifyfield-b-prereg.md is the seed 83379 in
a seed list, not a 33799 reservation. Forbidden bands named in Nov
preregs (73641–73648, 73671–73678, 78201–78208) do not intersect.
Note: the full band 33701–33708 was verified fresh; only 33701–33703
were used (stop rule), so 33704–33708 remain fresh for a later run.

## Files

- Prereg: evidence/2026-11-06/journey-succession-r143-prereg.md
- Driver: scripts/journey-succession-r143-20261106.js (r142 verbatim
  + NEWCOMER-PROBE)
- Analyzer: scripts/analyze-journey-succession-r143-20261106.js
  (r142 analyzer + CAP-NC newcomer-channel scoring)
- Panel records: evidence/2026-11-06/journey-succession-r143-{33701,33702,33703,33799}.{stdout.json,stderr.log,saydump.txt,tele-*.json}
  + transcripts journey-succession-r143-transcript-*.txt
  + evidence/2026-11-06/journey-succession-r143-analysis.txt
- No src/js change this run. [needs-eyes] is NOT attached: instrument
  only, no feel change for Steve to playtest.
