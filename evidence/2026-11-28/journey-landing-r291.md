# Journey landing r291 — leg 0 LANDING (days 1–14 judged, horizon d28)

Run `playtest-loop-20261128T0145Z`, scheduled Fri 2026-11-27 19:45 CST.
Lane A leg 0. Base master `ab3c2637a` (includes r288 scale
sim-scalecensus-a, sim-fourthseat-a, sim-callfirst-a evidence-only
landings). Lock `playtest-loop.lock` run_id
`playtest-loop-20261128T0145Z`, created 2026-11-28T02:35:00Z. Rotation
read `0` → write `0→1` at closeout. Worktree
`~/workspace/worktrees/journey-landing`, branch `journey-landing`.

## Pre-flight

Main tree NOT clean at first check: 2 untracked files,
`evidence/2026-11-27/journey-succession-r291fix-panel.log` (91 bytes)
and `evidence/2026-11-27/journey-succession-r293-check-quick.log`
(53 bytes) — Lane B run playtest-loop-2-20261128T0100Z's leftovers
from a misdirected post-restart invocation at ~01:12Z (machine
restarted ~01:09Z; uptime 1:23 at 02:32Z): the commands ran from the
main tree instead of the journey2-7 worktree. Verified before touching
them: Lane B is ALIVE in its own worktree (journey2-7 files written
02:24–02:25Z, live panel log 3812 bytes there at 02:25:35Z); its real
logs live in the worktree, not these stubs; no process held either
stub open (lsof empty); both stubs stale since 01:12Z. Archived
byte-identical (md5-verified) to
`hidden_files/playtest-loop-a/salvage-20261128/` with a README naming
the provenance and the live worktree copies, then removed from the
main tree. `git status --short` then empty (0 files). Disk 52%.
`git pull --ff-only`: already up to date. `worktree-reap.sh`: LOUD on
dirty trees held by other loops (never auto-removed), active 13/16.
Registration took ~4 min (registry-lock contention under load);
heartbeat at registration, hbloop re-established (setsid, 10-min
ticks, first beat 02:39:39Z).

## Prereg summary

`evidence/2026-11-28/journey-landing-r291-prereg.md`. Seeds **1412–1421**
(fresh band; the "1412" hits in earlier preregs are the transplant
"14+12" family naming and 5-digit seeds 14125/14137 — no prereg or
.md names the band 1412–1421; landing bands used: 1362–1371, 1372–1381,
1382–1391, 1392–1401, 1402–1411). DAYS=28, policy competent
verbatim, driver `scripts/journey-landing-r291-20261128.js`
(r289 driver verbatim except header/seeds/OUTDIR).

**Questions:** (1) Q1 GO re-check on a fresh band with the current
master; (2) M-PR2 under the r289 metric-review re-scoping
(participant deaths OR ended contests); (3) mantle-latency watch,
now written in (bar ≤ 2); (4) scholar-death watch re-read (bar ≤ 2);
(5) orphaned invite lines re-count (r289: 6/29, 21%).

**Pilot:** seeds 1412–1414, exit 0. System contact d8–d9 on all
three; all alive at d28. Pilot gate passes; full panel ran.

## Panel

Driver exit 0, all 10 seeds, 148 files in
`hidden_files/evidence/2026-11-28/landing-r291-after/`. Analyzers
`evidence/2026-11-28/journey-landing-r291-analyzers.sh`, 15/15 exit 0,
1608 lines. Log:
`hidden_files/evidence/2026-11-28/journey-landing-r291-analyzers.log`.

| seed | spawn | systemDay | over | villager deaths | pantry/person d28 |
|---|---|---|---|---|---|
| 1412 | Anh | 9 | no | 1 | 1,648 |
| 1413 | Klaus | 8 | no | 0 | 5,248 |
| 1414 | Chris | 8 | no | 0 | 2,596 |
| 1415 | Aurora | 8 | no | 3 | 2,508 (d27) |
| 1416 | Chen | 8 | no | 1 | 4,001 |
| 1417 | Willie | 9 | no | 3 | 942 |
| 1418 | Hans | 8 | no | 2 | 5,511 |
| 1419 | Cheryl | 9 | no | 2 | 5,627 |
| 1420 | August | 8 | no | 4 | 519 |
| 1421 | Willie | 8 | no | 0 | 2,965 |

10/10 villages alive at d28. Scholar deaths 2, both on seed 1420
(August d8 "the wild", lost Choir Toad fight; successor Naran d15
"the wild", lost Highbeam Deer fight solo) — mantle passed same-day
both times (latency 0, 0), village alive at d28 with pop 8. Villager
deaths 16 total: monster 5, sickness 5, wound-fever 2, ambush by a
person 2, "the wild" 2. All grief-registered (griefMiss 0/16,
fallenAudit dupes 0). Contests: fired 18, ended 16, open at horizon
2 (1418 Lottery, 1420 Blood Tithe — both fired d28, still in
progress, not a defect). Monster kills 386 (r289: 430; r284: 386).
Fights: 15 total; stuckFights 0, pocketFights 0, sealed regions 0.

**M-PR1 (primary): 0 terminated-but-open ledger entries on the band
(bar 0).** Checker
`hidden_files/evidence/2026-11-28/mpr1-check-r291.py` run WITH the
corpus dir (the first file-list invocation printed a vacuous open=0
and was discarded — same trap as r289): TOTAL open=2 (both fired d28,
participants None), M-PR1-fail=0.

**M-PR2 (re-scoped): 0 nulls (bar 0).** Literal scan also finds 0
autopsies with context LEDGER and null contestOutcome — the re-scope
was not needed to pass this band; the first judged band under the
re-scoped metric is clean under both readings.

## Q1 adjudication — GO

- **M1 ALIVE-D14: PASS** — 10/10 alive at d14.
- **M2 SYSTEM CONTACT: PASS** — 10/10 by d9 (d8 on seven seeds, d9
  on three).
- **M3 FIGHT-LOG: PASS** — all 15 fights carry known triggers; 0
  unknown; stuckFights 0.
- **Zero-DMG refused-turns: PASS (BINDS)** — refusedTurns 0 in the
  one zero-DMG fight (1419 d22, B-scholar-stood-through, won).
  refusedTurnsAllFights=9, all in the 1420 d8 Choir Toad fight where
  the scholar died — see Watches.
- **Practice: PASS** — 10/10 seeds moved (49 cells d1→d14, 100
  d1→d28, attributed 100, skill0→pos 71, 2828 reps).
- **Pocket: PASS (BINDS)** — 0 pocket fights, 0 sealed regions.
- **D1: PASS** — 0 garbled-label renders. D2: 0. D3: 0.
- **HEED: legacy 0; HEED-V: PASS (BINDS)** — 0. WARNED-BUT-UNRESOLVED 0.
  One warn_you sitting this band (vs two on r289); it ends resolved
  (see People check).
- **M-PR1 commit-offer: PASS — 1/26 ≈ 4% ≤ 15%.** R107: sittings=30,
  offered=20, picked=20, promised=15, statedAfterPick=5,
  neverOffered=5, settled=5. Established = 30 − 4 unestablished =
  26; the residual is the single 1419 d9 sitting (Yuki, ask_favor):
  the favor surfaced ("I still need help with the food I needed"),
  the player wandered to the mourning thread instead of accepting
  it, and the sitting closed with an honest "stated" resolution —
  the bot declined by choice, not an engine failure to offer (see
  People check). The 5 statedAfterPick are all honest away-guard
  refusals ("I'm out on the road, away from Haven… find me when I'm
  back"), each naming the remedy.
- **Bridges: PASS** — 0 repeats in every pool. Topics with no ask
  pick in corpus: grief, cheer, secret (same shape as r289).
- **R66 HUNGRY: NOT-HUNGRY** — starvationDeaths=0, slideSeeds=0,
  bandSeeds=7, noSlideSeeds=3. Pantries thinner than r289's band:
  3/10 below 2000/person at d28 (1412, 1417, 1420) vs 2/10 on r289 —
  the thin-pantry watch fires, not the HUNGRY gate.
- **Scholar deaths: PASS (bar ≤2)** — 2 on 1/10 seeds, both on 1420
  (r289: 2; r284: 5; r158: 1). Four bands now read 1, 5, 2, 2 —
  band variation, not a deadlier regime. The watch stays as written.
- **Mantle latency: PASS (bar ≤2, new)** — latencies [0, 0]; both
  successions same-day.
- **Other watches:** CONTEST LEDGER GO, OUTING GO (27 favors, 5 kept,
  6 broken, 16 open, 7 departs, 5 hauls delivered), R68 PARTY GO
  (offered 5, picks 5, spoken 5, dry 0 — accepted 0, see Watches),
  NOD-LOOP 0, silentTurns / dry lines 0, HUNTPRACTICE kills 386.

Q1 is GO because the binding metrics (M-PR1, M-PR2 re-scoped, M1,
M2, M3, zero-DMG, pocket, HEED-V, commit-offer) all pass.

## Watches (not fails)

- **Deaths up: 16 vs 7 on r289 (telemetry LOUD, see Telemetry).**
  Explained as band variation, not a bug: causes spread across
  monster 5, sickness 5, wound-fever 2, ambush 2, wild 2 — no single
  class dominates; all 16 carry a cause and grief (unexplained 0,
  griefMiss 0/16); no starvation. The sharpest cluster is 1415's
  three sickness deaths in six days (d16, d19, d22) — the corpus
  names no disease for them (cause recorded only as "sickness"),
  so one outbreak vs three independent illnesses cannot be told
  apart from this corpus. Watch: sickness naming in the census.
- **1420 d8: the scholar died in a fight with 9 failed moves.**
  August (85 HP) + Devon vs a wave-1 Choir Toad (54 HP): the scholar
  struck it dead (3×26) but its spawns kept the fight going 35
  monster turns and the croaks chipped him down (85→57→33→7→dead).
  From (3,7) the bot retried the same three destinations three
  rounds running: (2,7) "You don't stroll through the Choir Toad."
  (occupied, honest), (2,8) "No path there." (honest), (2,6) silent
  — no line at all, three times. The loss itself is a legit played
  fight; the watch is the silent (2,6) refusal and the bot's
  narrow retry loop. Not a defect class this run; the binding
  zero-DMG count is 0 and stuckFights is 0 (filter is living
  scholar).
- **R68 PARTY accepted=0.** 5 invites offered, 5 picked, 5 spoken,
  0 accepted. The speech side is GO (every outcome spoke), but no
  invitation was ever accepted on this band — the same shape as the
  orphaned-invite blank from the other side. Watch, carried.
- **1415's pantry ends at d27, not d28** (series last row d27) —
  the d28 pantry/person (2,508) is a d27 reading. Cosmetic; noted
  so the table is not misread.
- **HORIZON PANTRY hungry=3 PATTERN** (collapse recurs — lever work
  candidate, carried from the analyzer). 1420 ends at 519/person
  after losing 4 people including two scholars — thin but alive.

## Q4 — people check: PASS with watches

Delegated full-transcript read (worker report on file in the run
record): 1412 and 1414 read in full (11 sittings each); all 27
ask_favor sittings, all 6 "Walk with me?" sittings, the warn_you
sitting, and the wry-closing sittings read in full; spot sittings
across the other seeds. 128 transcript files.

Wants are stated, options engage or deflect them, endings resolve,
plant, or owe. Promises pay off (5 favors kept to pantry delivery:
Chantal 1414, Miguel 1415, Bessie 1416, Cuong 1418, Ingrid 1419).
Deflection stings (Leo 1412-d6: "Sure." The warmth drains out of
their eyes.). Best lines: Aurora 1412-d7 ("Did you leave someone
behind? ...Sorry. You don't have to answer that." → "Yeah." A long
quiet. "Me too."); Wanjiru 1414-d10 ("Protection looks boring when
it works. I aim for boring."); Yuki on Ella 1419-d9 ("The fire
feels smaller without Ella. The rest of us will have to be bigger.");
Rafael's warning 1420-d12 ("I've watched people walk out sure and
not walk back. Don't be the next one I have to stop waiting for."
— resolves "heeded"). No dead villager speaks; no fabricated shared
history; no filler loops (LOOP=0, HEED loops 0).

**The orphaned-invite blank is REFRAMED, not just re-counted —
this is the run's headline correction.** Strict count: **1/27 ask_favor
sittings (4%)** — Yuki 1419-d9 only (see Q1). But the lure lines
tell a different story than the last four runs recorded: all 6 "Walk
with me?" lines this band ARE answerable — the menu offers
`[betrayal:accept] "All right. Let's go."` in every lure sitting
(74 offers band-wide, 24 lure lines in 21 sittings counting sibling
variants). The driver picked it **0 times** (declined 27×) and the
r289 corpus shows the same shape (betrayal:accept present in all 4
of its "Walk with me?" sittings, picked 0 times). So the prior
bands' 21–26% "never answerable" rates were miscounted: the take-up
was on the menu all along, keyed as betrayal. What is actually
unverified is the ACCEPT outcome — no landing corpus has ever taken
the walk, so nobody knows whether accepting leads to a real outing,
an ambush, or nothing. The blank's next step is a probe (accept the
walk once), not a menu fix — plus a design question for Steve: is
the walk meant to be a betrayal lure (declining is correct play) or
an innocent outing (in which case keying it betrayal steers every
competent player away)?

**Watches:** (1) the wry closing "Well. That was almost a
conversation. We're improving." recurs verbatim 2× (1419-d19
Stephen, 1421-d7 Anjali) plus a variant — in 1419-d19 it undercuts
a sincere exchange ("Are you going to stay? With us. For real.").
(2) The seek_taken script is verbatim across NPCs/seeds ("I keep
dreaming about rows of pods. Humming." — Gina 1417-d14, Kenneth
1414-d16), and the case line flips wording for the same case type
("murder of Hermann" 1416-d24, "murder of Ella" 1419-d11; the ledger
says ambush). (3) Worst sitting: Hannah 1418-d7 — opener "I had a
whole conversation in my head just now. It went well. Your turn."
plus a flagged mood ("something curdled") that no menu can ever
engage; the sitting dies after 2 turns. Farid 1418-d11 has a dry
patch (two consecutive "Well." / "So." listens), and Farid 1412-d4
carries a garbled line ("I'm not sure, but Noted. Filing that under
'extremely useful.'"). (4) Grief is thin: 16 deaths, one grief beat
in transcripts (Yuki on Ella); 1415 and 1418 have no transcripts
after their death days. No contest death occurred this band (no dead
name in any contest participant list), so the contest-death grief
watch is untestable. (5) The 5× ask-then-I'm-away refusals (see Q1);
worst in 1421-d7, where the refusal is immediately followed by
"Walk my trap line with me?" in the same sitting — contradictory.
(6) The warn_you line appears once only (Rafael 1420-d12) — no
cross-NPC verbatim repeat this band.

Per-seed verdicts: 1412 PASS, 1413 WATCH, 1414 PASS, 1415 WATCH,
1416 WATCH, 1417 WATCH, 1418 WATCH, 1419 PASS, 1420 PASS, 1421 WATCH.

## Census in plain words

Ten villages, all ten alive at day 28 — but this was a harder month
than last band's: sixteen dead across the ten villages (seven last
band), including two scholars on the same seed, August's village
losing its leader twice in a week and still standing at day 28 with
eight people and the thinnest pantry on the band. They talk, grieve,
and keep promises: 18 contests fired and all but the two that started
on the last day closed, every death carries its cause and its grief,
and when a scholar dies in the wild somebody picks up the mantle the
same day. The month's cost is spread, not spiked: five deaths to monsters,
five sicknesses, two wound-fevers, two ambushes by a person, two
deaths in the wild. No village starved. The visible crack changed
shape this band: villagers keep saying "Walk with me?" and the game
DOES offer a yes — but only as a betrayal-flagged choice, and no
competent player ever takes it (0 accepts in 74 offers), so nobody
knows what the walk actually does. And this band no invitation of
any kind was accepted at all.

## Reachable / fun / winnable

- **Reachable: YES.** The landing leg plays end to end on all 10 seeds;
  System contact by d9 everywhere; contests fire from d14 and close.
- **Fun: HOLDS, with the crack reframed.** People talk well (Yuki's
  mourning thread for Ella is the run's best sitting; the succession
  seam names the dead); the visible crack is no longer "no way to say
  yes" but "the only yes is a betrayal-flagged choice nobody takes"
  — the walk's outcome is unverified (see People check).
- **Winnable: not judged on this leg** (landing horizon d28; the win
  chain is a later-leg question).

## Fixes (this run's blank)

- **None — no src/js change. But the carried blank is REFRAMED
  (see Q4).** For five runs the blank was "the game never lets you
  say yes to a walk" — this band proves the take-up IS on the menu
  (`[betrayal:accept]`, 74 offers, 0 picks) and was on r289's band
  too. The fix owed is no longer a menu change; it is a probe (a
  driver arm that accepts the walk once and records what happens)
  plus a Steve design call (lure vs innocent outing — see Metric
  review). The strict favor-orphan (Yuki 1419-d9, 1/27) is the only
  remaining unanswerable case. The 1420 silent-move watch and the
  sickness-naming thinness are watches, not fixes this run.

## Metric review (standing)

- M-PR1 holds as written (0 fails this run). The two open entries
  (1418 Lottery, 1420 Blood Tithe) both fired d28 and are
  legitimately in progress; the death-join rule correctly excludes
  them.
- **M-PR2 re-scope adopted and judged:** this is the first band
  judged under the r289-proposed scoping (participant deaths OR
  ended contests). Literal nulls with context LEDGER: 0; re-scoped
  failures: 0. The scoping holds; no further revision proposed.
- Mantle-latency watch (≤2) written in this run per the r289
  proposal: latencies [0, 0]. Holds.
- Scholar-death watch (≤2/band): 2 this band (both 1420) vs 2 on
  r289, 5 on r284, 1 on r158. Four bands now read 1, 5, 2, 2 —
  band variation. The watch stays as written.
- Commit-offer accounting confirmed again: established = sittings −
  unestablished; settled excluded per the R122 rule. 1/26 this run;
  the single residual (1419 d9) is a player-declined-by-wandering
  case, not an engine miss. The residual route stays closed.
- **Orphaned-invite counting method — CORRECTION (this run).** The
  historical rates (r283 26%, r284 23%, r289 21%) counted lure
  lines as unanswerable. Verified against both corpora: every "Walk
  with me?" sitting on r289's band AND r291's band offers
  `[betrayal:accept]` on the menu (r289: 4/4 sittings; r291: 6/6,
  74 offers band-wide). The historical rates are NOT comparable to
  this band's strict 1/27 (4%). Going forward: (a) strict
  favor-orphan rate (favor spoken, no take-up offered) is the
  carried number; (b) lure-accept rate (accepts/offers) is the new
  watch — 0/74 this band, 0 on r289's. The blank is re-scoped to
  the accept-outcome probe + the lure-vs-outing design call. Do NOT
  re-score past runs: their verdicts stand; only the method changes.
- The staged contest-heavy probe (r284 metric-review proposal) is
  still owed if a live refusal/arena-loss terminal read is wanted;
  it needs its own prereg as a dedicated driver arm. The walk-accept
  probe joins it in the owed-probe queue.

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r291-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
**LOUD on one line: villagerDeaths swung 60%: baseline 10 ->
current 16 (n=10 files).** Investigated same-run (see Watches):
explained as band variation — causes spread, all grieved, no
starvation, no unexplained deaths; the r284 band read 14 on the
same instrument, so 16 is inside the observed band range, not a
new regime. Baseline NOT rolled (bands read 7–16; rolling to 16
would chase noise). All other metrics quiet.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest-r291`
in the worktree: **336 passed, 8 failed in 1173s** (GATE_EXIT 1). Log:
`hidden_files/evidence/2026-11-28/journey-landing-r291-gate.log`.

The 8: 5× 120s timeouts (living-garden + one-person-army deed
attainment, occupation-panels, trust-observer-neutrality,
capable-bot-20261014) + stale neutrality-proof failure in
test-measurement-proof-update + test-measurement-workflow + stale
phone receipt in test-phone-frame-proof. The 2 deed timeouts, the 2
measurement staleness failures, and the phone receipt are the
standing 5 from r289/r284/r158, identical in kind. The 3 extra
timeouts (occupation-panels, trust-observer-neutrality,
capable-bot-20261014) passed on r289's gate; this run changed no
src/js (driver + analyzers + note only), so they read as load flakes
under a heavily contended box (Lane B panel + gate and the
flesh-out check running concurrently, load avg 9+). Standalone
re-runs on the branch confirm it: occupation-panels 25/25 pass,
trust-observer-neutrality 6/6 pass, capable-bot-20261014 40/40 pass,
all exit 0. The r289 flap artifact (test-deathcleanup EPERM) did NOT
recur this run.

**Adjudication: 5 standing pre-existing + 3 load flakes (proven
passing standalone), 0 attributable to r291.**

## Closeout record (filled as the closeout proceeds)

- Run note written: evidence/2026-11-28/journey-landing-r291.md (this file).
- Telemetry check: LOUD villagerDeaths 10→16, investigated, explained, baseline NOT rolled (see above).
- Gate: [PENDING]
- Commit: [PENDING]
- Merge / rotation / release / lock: [PENDING]
