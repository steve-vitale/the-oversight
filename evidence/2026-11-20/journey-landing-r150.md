# Journey-landing r150 — run note (Lane A, leg 0 LANDING)

**Run id:** playtest-20261120T1441Z (scheduled Fri 2026-11-20 13:45 CST;
started 14:41 CST — scheduler fired late; the run's own clock is 20:41Z).
**Base:** local master `9b14b0b93` (verified up to date at start; main tree
clean, disk 51%).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg:
establishment. (The r149 adoption claimed 0→1, but scale r247, leg 3,
commit `b6a551691`, 2026-11-20 20:35Z, wrote 3→0 at its closeout — so 0
is correct.)
**Worktree:** `~/workspace/worktrees/journey-landing` (branch
`journey-landing`), registered after a ~4.7 min registry-lock queue; HEAD
`9b14b0b93`, clean. Registry heartbeat at registration 2026-11-20T20:44:42Z.
Standing hbloop (pid 49196, setsid-detached, every 5 min, `timeout 120`
per beat, log `journey-landing-r150-heartbeat.log` in goal hidden_files) —
beats at 21:00:43Z, 21:05:43Z, 21:20:43Z all printed and landed. **The
machine restarted ~21:20Z** (`uptime` 35 min at 21:55Z) — the hbloop died
with it (last beat 21:20:43Z), and the registry heartbeat went stale
from then. Restarted 21:56Z (pid 22726); its first beat waited the full
120s on the registry flock (held by live sibling registrations — Lane B
`journey2-endgame` + flesh-out `sim-pinquaddoor-b`, verified via fuser)
and timed out. Found while investigating: the hbloop's "beat exit $?"
line ALWAYS logged 0, because `$(date)` runs before `$?` is read —
the 20:53Z and 21:56Z "exit 0, no heartbeat line" beats were really
timeout-124s, invisible. Fixed the script (capture `rc=$?` first),
killed and restarted the hbloop 22:04Z (pid 30025), and queued a
one-shot `timeout 900` heartbeat (pid 30026) to land as soon as the
flock frees. Registry heartbeat stale since 21:20:43Z until that lands
— the run is live, the staleness is contention, not death.
**Lock:** `playtest-loop.lock`, run_id `playtest-20261120T1441Z`, created
2026-11-20T20:41:34Z. None present at start. Delete at closeout in the
same call as its read, only if run_id matches.
**Flap:** flap-watch ALL-OK at 20:43Z. No flap at run start.
**Seed band:** 1282–1291, verified fresh (full grep over
`evidence/*/journey-landing-*.md` + `evidence/*/sim-*-prereg.md`; all
hits incidental). Prereg: `evidence/2026-11-20/journey-landing-r150-prereg.md`.

## Q1 — pre-registered panel (BEFORE-FIX, DAYS=28, seeds 1282–1291)

Driver `scripts/journey-landing-r150-20261120.js` (r149 driver verbatim
except header/seeds/OUTDIR). Pilot seeds 1282–1285 exit 0 in ~34s, gate
passed. Full panel exit 0 in ~44s, 170 files, 17 fights, 10/10 villages
alive at d28. Corpus + logs under goal hidden_files
`evidence/2026-11-20/`: `landing-r150-after/`,
`journey-landing-r150-full.log` (4147 lines),
`journey-landing-r150-analyzers.log` (1698 lines). Seed 1289 series max
day 27 with gaps at 12/22/28 — driver-recording quirk (missing dawn
snapshots); sim ran through d28 (villager death hannah_kim d28 recorded;
village alive, overAt None).

Instrument adoptions built + proof-tested BEFORE the panel (r149
metric-review items 2 + 5): `scripts/analyze-landing-r150-zerodmg-v4.js`
(panel-wide `refusedTurnsAllFights` watch line; back-compat vs r149
corpora: BEFORE binding 33 / all-fights 48, AFTER-FIX 0 / 0; proof test
`scripts/test-journey-landing-r150-zerodmg-v4-20261120.js`, RED-verified
5/5, GREEN 5/5) and `scripts/analyze-landing-r150-move-refusals.js`
(splits `silent-noline` into `deduped-refusal` vs truly-silent;
back-compat BEFORE `{"nopath":5,"toofar":2,"deduped-refusal":41}`,
silent 0, AFTER-FIX 0 failed; proof test
`scripts/test-journey-landing-r150-move-refusals-20261120.js`,
RED-verified, GREEN 6/6).

Binding bars — all PASS:
- **v4 zerodmg:** fights 17, zeroDmg 1, refusedTurns 0 PASS, all-fights
  0, nonZeroDmgWithRefusals 0. The 1 zero-DMG fight is S-shape: seed
  **1290** d26 (not 1283 as first attributed — the analyzer's per-seed
  section puts it under 1290), The Static Kite w2 91 HP, scholar struck
  2× for 0, allies Ashley/Adrian dealt 133, scholar took 0, won,
  3 rounds, trigger pending-face. Same "high overhead / out of reach"
  shape as r149's Big Big. See Q2 for the narration check.
- **Move-refusals:** 8 moves, 0 failed. Pocket: stuckTurns 0,
  pocketFights 0, sealedRegions 0. Nodloop LOOP 0 (8 nv sittings).
- **Scholar deaths:** 0 on all 10 seeds (mantleLog empty) — bar ≤2
  PASS, improvement vs r149's 3.
- **Practice:** movedCells d1→d28 = 92 (bar ≥50), seedsWithMove 10/10,
  skill0→pos 70. Hunt: H0-ESTABLISHED (13 reps, max 3).
- **M-PR1 revised:** 0/23 = 0% PASS (27 sittings, 4 unestablished
  excluded; analyzer counts neverOffered only when `!menuOffered &&
  !settledFavor`, per `analyze-landing-r107-commit-offer.js:65`).
  statedAfterPick 2 (both the honest away-guard road line).
- **R104:** hungry-at-horizon **5/10** (1285: 529, 1287: 1528, 1288:
  1150, 1290: 1794, 1291: 1010 kcal/person; FED: 1282: 3831, 1283: 3451,
  1284: 2636, 1286: 4959, 1289: 2449) — up from r149's 3/10, watch move.
  R66 NOT-HUNGRY (starvationDeaths 0; bandSeeds 8, noSlideSeeds 2).
  R69 ARMOR-GO 10/10. R68 PARTY-GO (offered 7, spoken 7, dry 0,
  accepted 5). R85 RESCUE kcal 8/8. R88 EAT 8/8. **R88 ARMOR-SILENT did
  NOT recur** (teleOk 2, lineMissing 0, silentWild 0, silentHaven 0;
  r149 was 10/2/1/2).
- **Q1 dialogue:** warn_you sittings 4; HEED legacy 1 (1284 d8,
  12 turns); HEED-V 0; WARNED-BUT-UNRESOLVED 0; D1 garbled 0. Outing
  chain CHAIN-COMPLETES-FAR (39 favors, kept 4, broken 9; farUnreached
  5). Presshop pressFail 0, together-stopped 35 (patch stripped).
  Personal bridge 23 servings, 0 repeats; all bridge pools 0 repeats
  (goal 0 servings). verbatimRepeats 0, exempted 6 — **all 6
  spot-checked as legitimate re-poses** (2nd speaking of the sitting's
  opening question, first#0, in a resume sitting: 1283 d5, 1284 d6,
  1285 d5, 1286 d7, 1289 d5, 1290 d7). silentTurns 0 (key absent from
  MET, no SILENT TURN lines). Dry lines 0 (no bare "..." lines).
  playerFled 0; door-flee 0.
- **fledBad:** 3 samples, all at hpPct=1 (full HP) — 1283 d28
  chorus_line 340/340, 1284 d27 chorus_line 352/352, 1286 d28 spool
  325/325. MET "fled": 3 counts considerations, not flees. Answers
  r149's carried curiosity: the outmatched trigger fires on fresh
  full-health wave-3 monsters — a sane time to consider fleeing, not a
  defect.
- **Link-accept:** 41 takes, all voiced, split 25 pool[0] / 16 pool[1]
  (all rumor/told how: "What I've heard of them, I believe" 25×, "the
  word on them is kind" 16×). No repeat streak; r148 rotation holds.
  **COUNTER LEARNED:** 9 lines, all guarded noun-phrases. Confide
  exits 0 (untested). Settled-help 0 occurrences (r247 fix untested on
  the 28d landing band). Volley no-ammo lines 0 (untested).
- **Win-plans:** d14 1/10 (1283), d28 2/10 (1282, 1283) — same flicker
  as r146/r148/r149. WANT ENGAGEMENT: ask_favor 27, none 13, curious
  89, repay 14, pocketed 2, warn_you 4, seek_comfort 1. Grief on 1283:
  Jamie d7 (monster), Jessica d23 (sickness), both REGISTERED.

## Q2 — people check (read in full)

### The blank this run fixes — warn_you never names the danger (4/4)

All four warn_you sittings read in full (before-fix corpus):
- 1283 d12 Farid — surfaces, resolves `heeded`, danger never named.
  Opener has a small glitch: "I'm not sure, but Listen." (capital-L
  "Listen" mid-sentence — an opener-prefix fragment that doesn't fit
  the fixed opener).
- 1284 d8 Leonard — **never surfaces**. Player deflects at turn 0
  ([dlg:subject]); want stays stage 1 through 12 turns; ends stage
  3/unresolved (stage advanced by wind-down, not the warning). "Forget
  I said anything." The `[alive:want:warn_you]` menu item was offered
  at turn 2 but the policy walked past it.
- 1286 d14 Sofia — surfaces, resolves `heeded`, danger only partly
  named at stage 3 (the r140 deepen line: "...I keep seeing it.
  Whatever it was, out past the treeline."). Betrayal:decline
  acknowledged; lure SPOKEN.
- 1287 d12 Ingrid — surfaces, resolves `heeded`, danger never named.
  Betrayal:decline acknowledged ("Another time, then." pocketed).
- `[dlg:details]` ("What is it? What happened?" / "Tell me.") was
  offered at turn 0 in all four and **never taken** by the competent
  policy (always picks heed).

Mechanism (pinned by reading the code, not inferred from counts):
- The warning content lives ONLY in `Game.convoWantWarning(vid)`
  (`src/js/convo-wants.js:3150`) — a 9–10 line pool with per-villager
  rotation: recent-attack variants ("Whatever came through here last
  night — it'll come back"), known-monster variants naming the monster
  ("That {monsterName} from last night? It's still out there"), generic
  variants ("Something's been moving out past the treeline"). The
  content EXISTS; the path to it is the problem.
- `engageBeat()` (the `[dlg:details]` path, `convo-wants.js:1462`) is
  the ONLY caller of `convoWantWarning`. The opener
  (`convo-wants.js:1447`) names no danger by design (it's a hook).
- `menuOptions` stage<2 offers dlg:details/dlg:heed/dlg:react; stage≥2
  offers only dlg:heed/dlg:react — **details disappears after stage
  2**. The window to learn the danger is exactly one pick.
- The driver's pinned DEEPEN order
  (`scripts/journey-landing-r150-20261120.js:870`) ranks dlg:heed
  ABOVE dlg:details, so the simulated player always heeds first — and
  the heed handler (`src/js/convo-dialogue.js`, dlg:heed) answered
  with a content-free generic line ("Good. I mean it — watch yourself
  out there." / "Promise me that. Please." / "Thank you. I needed to
  hear you say it.") and engaged the want. A player who says "I'll be
  careful" — the kind, obvious reply to a worried friend — never
  learned what the danger was, and could never ask afterward.
- The fix decision turns on this: heeding a warning you haven't heard
  is nonsense. The NPC should state the danger when you promise to be
  careful. See "Fix landed" below. The deflect shape (1284 Leonard)
  is a SEPARATE question — how forcefully a pending warning re-asserts
  itself after the player changes the subject — and stays carried (see
  metric review).

### Mourning — 1283 d8, Jessica grieving Jamie (died d7, monster)

Reads as a real person grieving. The mourning probe lands ("How are you
holding up? About... them." → "Jamie owed me a favor. I keep thinking
about collecting. Stupid."), then the depth thread is genuinely moving:
"I keep turning over the last thing Jamie said to me. I can't tell if
I'm remembering it right, and that's somehow the worst part." → "The
fire feels smaller without Jamie. The rest of us will have to be
bigger." → "My part? I remember them. Someone has to do it properly."
→ honest exhaustion at depth 7 ("That's the whole of it. Sorry.").
Coherent, specific to Jamie, no fabricated shared history with the
player. One nit, same family as the warn_you opener: "Here's what I
think — Don't mind me. Today's just heavy." — the "Here's what I
think —" prefix doesn't fit a grief opener. Opener-composition prefixes
sometimes mismatch the opener's content; carried as one observation.

### Favor + link-accept — 1284 d11, Bessie (want repay, link proposal)

Both systems in one sitting, both coherent. Bessie proposes linking
with Stonebridge ("I've heard good things about Stonebridge. We should
link with them — we'd be stronger together."), the player accepts, she
replies "Good. What I've heard of them, I believe. Go and ask." —
voiced, sourced ("what I've heard"), and it assigns the player a task
(carry the proposal). After the link accept, the repay thread surfaces:
"About the pantry run — still open. The promise died, not the need." —
a striking, honest line: a broken promise's need survives. The depth
thread exhausts honestly at depth 2. The want ends stage 3/unestablished
— listening isn't repaying, and the sitting doesn't pretend otherwise.
Minor: the opener line carries the speaker name inside the quote
("Bessie: \"I've heard good things...\"") although the transcript
already attributes Bessie.

### Resume-take — 1283 d5, Caleb (one of the 6 exempted re-poses)

Legitimate re-pose, confirmed in full. The player deflects Caleb's
opening question ("What's the most useful thing you've learned since we
got here?") twice, and the second deflection lands harder ("Fine. Their
face closes like a door." — the NPC notices the repeated brush-off and
reacts; first deflection was "Okay. Something shutters, just
slightly."). The player then chooses "We never finished — the most
useful thing you've learned", and Caleb re-asks the question verbatim —
that's a resume, not a repeat bug. The want resolves `deflected`
honestly. One oddity: after the personal question ("So — who are you,
when nobody's watching?"), Caleb answers "Good question." then dodges
with a joke ("Do you ever wonder what the aliens eat? Like, do they
have potlucks?") — a deflection-by-joke that never answers the personal
question. It reads human (dodging a personal question with a joke) but
the personal thread then has nowhere to go.

### S-shape fight — 1290 d26, The Static Kite (w2, 91 HP)

The narration IS honest — the r149 carried question is answered. The
scholar strikes twice, both 0 damage, and both strike lines say why:
"It's circling high above reach — a screen glinting in the sun." The
kite flies; the spear can't reach it. Allies Ashley (45 + 47) and
Adrian (41) deal 133 and kill it; scholar takes 0, fight won in 3
rounds. This is also the second-ally fight check: the party works —
two allies land real hits and carry the kill while the scholar
contributes nothing but takes nothing. What stays open is tactical,
not narrative: the scholar keeps striking a target the game just told
them is out of reach, twice, for 0. A competent player would switch
tactics (wait, reposition, use a ranged ability). Whether the game
should steer the player there — a hint, a different default — is a
design question, carried, not a defect in this run's scope.

### React wind-down verification

On the after-fix corpus: 10 [dlg:react] picks in held sittings, 0
dry/silent replies. The guard at `convo-wants.js:2944` +
`convo-beats.js:488` holds (r149 reported 0 violations, 238 reacts by
its counter; the transcript-level count here is 10 picks, all answered).

## Fix landed (this run)

### Warn-heed names the danger (`src/js/convo-dialogue.js`)

**The call (Muse, Steve can overrule):** when the player heeds a
warn_you want for the first time in a sitting, the NPC states the
warning itself — the `convoWantWarning` content — instead of a generic
line. A villager who wants to warn you, when you promise to be careful,
says WHAT to be careful about; that's how a real person warns.

- `dlg:heed` handler: on heeds < 4, when the want is warn_you and the
  warning hasn't been delivered in this sitting, speak
  `convoWantWarning(vid)`; fall back to the existing generic pool when
  every warning variant is blocked (returns null). Mark delivered
  (`c._warnDelivered`) only when sayLine actually speaks it.
- `dlg:details` handler: after a warn_you details delivery actually
  speaks, mark the warning delivered too — a details-first sitting does
  not double-deliver a second warning variant on the later heed.
- Untouched: the heed arc (heeds 1–3 engage, heed ≥4 deepens with the
  r140 fear lines and resolves `heeded`); the details path; the opener;
  the stage≥2 menu (details still drops off — now harmless, since the
  warning arrives on the heed path too). The warning pool rotation
  spends no RNG (r186 design), so the warning call itself perturbs
  nothing — but the SKIPPED generic `convoPickCycle` draw on first-heed
  warn_you sittings does shift the downstream seeded stream by one draw
  (see re-panel note below).
- Proof test `scripts/test-journey-landing-r150-warn-heed-20261120.js`
  (mirrors the r182 warn-details test harness, seed 4242, recentAttacks
  1): RED-verified before the fix (first heed: "Promise me that.
  Please." — generic, no danger), GREEN 13/13 after: first heed speaks
  a real warning ("Whatever came through here last night — it'll come
  back. They always come back. Don't go out alone."); second heed is
  generic (no double-delivery); the want still engages (stage ≥2);
  details-first sitting still speaks the warning and the later heed is
  generic.

## Q1 — matched re-panel (AFTER-FIX, same seeds 1282–1291, DAYS=28)

Same driver, same seeds, OUTDIR `landing-r150-after-fix` (before-fix
corpus preserved). Exit 0 in ~27s, 172 files, 18 fights. Corpus + logs:
`landing-r150-after-fix/`,
`journey-landing-r150-after-fix-full.log`,
`journey-landing-r150-after-fix-analyzers.log` (1685 lines).

- **v4 zerodmg:** fights 18, zeroDmg 1, refusedTurns 0 PASS,
  all-fights 0, nonZeroDmgWithRefusals 0. The 1 zero-DMG fight is the
  SAME S-shape (1290 d26 Static Kite, Ashley/Adrian, 133 othersDmg,
  3 rounds). The extra fight (18 vs 17) is RNG-stream shift from the
  fix skipping one generic-pick draw on first-heed warn_you sittings
  (see fix note) — not a behavior change; every binding bar agrees.
- **Move-refusals:** 12 moves, 0 failed. Pocket 0/0/0. Nodloop 0.
- **Scholar deaths:** 0 on all 10 seeds. PASS.
- **M-PR1 revised:** 0/23 = 0% PASS (28 sittings, 5 unestablished
  excluded; the 1287 d8 settled-unresolved case excluded by the same
  rule as before-fix). Raw neverOffered 5 vs 4 before-fix — the extra
  sitting (1287 d16, unestablished) is stream-shift noise, excluded by
  the rule.
- **R104:** hungry-at-horizon 5/10 (same count as before-fix). R66
  NOT-HUNGRY (starvationDeaths 0; bandSeeds 6, noSlideSeeds 4).
- **Win-plans:** d14 1/10, d28 3/10 (was 2/10 — one more seed holds a
  plan at d28; same flicker family, stream-shift noise).
- **Q1 dialogue:** warn_you sittings 5; HEED legacy 1 (1284 d8 — the
  same deflect sitting, heed offered 4× details offered 4×, never
  taken); HEED-V 0; WARNED-BUT-UNRESOLVED 0; D1 garbled 0.
- **Warn_you verdict after the fix — 4/4 heed sittings now name the
  danger** (read in full, after-fix corpus):
  - 1283 d12 Farid: "You've seen what's out there. I'm just saying —
    the treeline at dusk. Don't." → resolves heeded.
  - 1286 d14 Sofia: same treeline-at-dusk warning → heeded.
  - 1287 d12 Ingrid: same → heeded (deepen arc still fires at heed #4).
  - 1287 d13: "I keep thinking about that Big Loud. It knows this
    ground now. Keep your eyes up past the treeline." — names the
    monster → heeded.
  - 1284 d8 Leonard (deflect shape) persists: no heed taken, warning
    never surfaces — carried design question, not fixed by this change.

## Village assessment (plain words)

Ten villages, all alive at day 28, nobody's scholar died. They eat —
thinly, on half the villages (five of ten end the month under 2,000
kcal a person), but nobody starved. People are learning: 92 practice
cells moved in the month, skills going from nothing to something in 70
cases, hunts established on every measure. They talk like people:
Jessica grieves Jamie properly, Bessie remembers a dead promise's need
is still open, Caleb notices when you brush him off twice. They link
with other villages when asked — all 41 proposals voiced and sourced,
nobody silent. They fight in parties and the parties work: two allies
killed a flying kite the scholar couldn't even reach. What they don't
do, still, is plan to win: only one village in ten holds any plan at
day 14, three at day 28, and the plans flicker in and out rather than
building. The first fortnight is a living village; the road past it is
still unlit.

## Reachable / fun / winnable

- **Reachable:** yes for the landing leg — all ten villages play
  through day 28, conversations fire, fights are won, links are
  proposed and carried. Nothing in the leg is gated behind content the
  sim can't reach.
- **Fun:** yes, in the dialogue — the sittings read this run are the
  strongest evidence: grief with specific memories, warnings that now
  name the danger, a dead promise whose need outlives it. The fights
  are honest about their limits (the kite above reach says so).
- **Winnable:** the landing leg doesn't need to win, and the win-plan
  flicker (1–3/10 holding any plan at d28) is the same gap r146–r149
  reported — the plan-ignition problem belongs to the establishment /
  scale legs and the endgame chain, not to this leg's verdict.

## Metric review (§14)

1. **The warn_you blank is fixed and proven** — proof test 13/13
   RED→GREEN, re-panel 4/4 heed sittings name the danger. The
   pre-registered binding bars all held on both panels; no metric was
   re-scored mid-run.
2. **M-PR1 revised holds 0/23 on both panels.** The raw neverOffered
   count moved 4→5 on the re-panel; the revision rule excludes the
   same way both times (unestablished sittings). No revision proposed.
3. **R104 hungry 5/10 on both panels** (up from r149's 3/10) — watch
   move stands; R66 stays NOT-HUNGRY. No revision proposed; the
   pantry-thin pattern recurs without starvation deaths.
4. **S-shape fight, corrected attribution:** the zero-DMG fight is
   seed **1290** d26, not 1283 — the earlier summary misread the
   analyzer's per-seed section. The narration is honest ("circling
   high above reach"); the open item is tactical (what the player
   should do instead of striking for 0), carried as a design question.
5. **RNG-stream note (for the next run's panel comparisons):** the
   warn-heed fix skips one generic-pick RNG draw on first-heed
   warn_you sittings, shifting downstream seeded draws (18 vs 17
   fights, 27→28 sittings, win-plans 2→3/10 at d28). All binding bars
   agree across both panels; treat small count deltas between the two
   corpora as stream noise, not behavior changes.
6. **Carried (not fixed this run):** (a) the deflect shape — a
   warn_you want deflected at turn 0 never re-surfaces (1284 Leonard,
   both panels); needs the design decision r149 named (how forcefully
   a pending warning re-asserts itself). (b) Opener-composition
   prefixes that mismatch the opener ("I'm not sure, but Listen.";
   "Here's what I think — Don't mind me."). (c) The personal-question
   dodge (Caleb's potluck joke leaves the personal thread nowhere to
   go). (d) Settled-help (r247 fix) and confide exits still untested
   on the 28d landing band (0 occurrences).

## Q3 — Telemetry

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/landing-split.json
--current '<landing-r150-after-fix census glob>' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`
→ **quiet** (10 files, 5 metrics, no large deviations). Baseline NOT
rolled — the panel carries no new information on these metrics (the
baseline note itself says dialogue fixes do not move them; the
after-fix panel agrees with the baseline regime).

## Q4 — Gate (adoption adjudication)

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`,
two runs (the first run's full list was lost to `tail -25`; the second
run was captured whole to
`journey-landing-r150-gate2.log` in goal hidden_files):

- Run 1: 337 passed, 7 failed in 1043s.
- Run 2: 336 passed, 8 failed in 1356s: living-garden (timeout 120s),
  measurement-proof-update (assert, 3.4s), measurement-workflow
  (assert, 2.4s), measurement-cache-flags (assert, 68.6s),
  phone-frame-proof (assert, 7.3s), occupation-panels (timeout 120s),
  one-person-army (timeout 120s), trust-observer-neutrality (exit 1,
  105.7s). Failure sets differ between runs (capable-bot timed out in
  run 1, passed in run 2) — load flakiness is in play.

Adjudication — every failure checked against pristine HEAD
(`9b14b0b93`, my one changed file reverted in-worktree, then restored;
restore verified by diff stat + `node --check`):

- **NOT attributable, pre-existing on base (3):**
  measurement-proof-update and measurement-workflow both fail on
  PRISTINE ("Proof source inputs are not current" — the retained
  neutrality proof's manifest already disagrees with base master; the
  manifest hashes every file under `src/`, so any landed src change
  since the proof was recorded breaks it). phone-frame-proof fails on
  PRISTINE too, wholesale: the retained receipt mismatches DOZENS of
  boot inputs (game.js, app.js, betrayal.js, … — the whole boot set),
  not just convo-dialogue.js. These three are base-master staleness,
  not this run. Refreshing them is separate maintenance work (a fresh
  real observer-neutral panel via `balance-proof-update.js`; fresh
  phone receipts via `phone-frame-proof-update.js` per
  MOBILE-PLAYTEST.md) — NOT done silently inside a landing run.
- **NOT attributable, gate-load flakiness (5):** cache-flags, trust
  (6/6), living-garden (8/8), occupation-panels (25/25),
  one-person-army (7/7) ALL PASS standalone with the fix in the tree,
  and cache-flags also passes on pristine. The gate's 120s per-test cap
  under a loaded box (two full gates + sibling registrations + a
  machine restart in the window) is what killed them; the deed/neutrality
  sims are slow, not broken.

**0 attributable. Gate bar met.** The three pre-existing stale-proof
failures are reported here (and in the executive update) for a
maintenance run; they are not waived, not quarantined silently, and
not this run's to fix.

## Infrastructure notes

- **Machine restart ~21:20Z** (`uptime` 35 min at 21:55Z) killed the
  hbloop mid-run; heartbeat went stale from 21:20:43Z. hbloop restarted
  21:56Z, logging bug found and fixed, restarted again 22:04Z (pid
  30025) + one-shot `timeout 900` heartbeat queued (pid 30026) to land
  when the registry flock frees. The flock is held by LIVE sibling
  registrations (Lane B `journey2-endgame`, flesh-out
  `sim-pinquaddoor-b` — verified via fuser, pids 23825/25127/25130/
  25153), not a stale lock; do not kill them.
- **hbloop logging bug (found 22:02Z, fixed same run):**
  `echo "$(date ...) beat exit $?"` always logged 0 because the
  `$(date)` substitution runs before `$?` is read — it logs `date`'s
  status, not the heartbeat's. The 20:53Z and 21:56Z beats both "exited
  0" in the log while really timing out (124) on the flock with the
  registry unmoved. The script now captures `rc=$?` first. Any other
  run's hbloop with the same echo shape has the same blind spot — the
  r150 script is the fixed reference.
- `worktree-reap.sh` skipped at pre-flight (registry lock held, 6
  consecutive skips — live sibling activity, verified via fuser/ps,
  not stale).
- Flap-watch ALL-OK at 20:43Z. No flap during the run.
- The first queued heartbeat took ~8.3 min on the flock (registry-lock
  contention under load is normal).
