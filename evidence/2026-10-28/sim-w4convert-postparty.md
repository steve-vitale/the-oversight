# sim-w4convert-postparty — wave-4 conversion re-census after partyfinish: DIAG-GO, kills CHANGED 0 → 2, attribution NOT partyfinish

Run: fleshout loop, run fleshout-20261028T1415Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4convert-postparty. Worktree:
`~/workspace/worktrees/sim-w4convert-postparty` (branch
sim-w4convert-postparty).
CENSUS / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever. This arm does NOT re-judge the lethality, w4damage,
or partyfinish verdicts.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-w4convert-postparty-prereg.md (commit
11acfab3f7ea33822c7eb87c43c280e8e177f466).
Corpus: evidence/2026-10-28/perseed-w4convert-postparty/ (8 rows +
summary.json + analysis.json).
Instruments (new this arm, copies only): scripts/
test-w4convert-postparty-sweep.js (copy of test-w4convert-sweep.js,
differing ONLY in corpus dir, labels, loadGame mode label),
test-w4convert-postparty.js (copy of test-w4convert.js; censusSeed,
scholarOnDay, classifyKiller, recorderClean copied VERBATIM —
verified by function diff — differing ONLY in corpus dir, the
0416Z comparison legs, and the partyfinish-control cross-check),
test-w4convert-postparty-sense.js (copy of
test-w4convert-sense.js, labels only).
DETGATE: PASS on 75101 before any judged sweep (baseline days=132,
gameDays=132, tsNationalDay=77 — IDENTICAL to the 0416Z detgate
numbers, no amendment needed; wrapped-all-OFF identical, no diag
surface, no wraps installed).

## Plain words first

The 0416Z census found villages meeting wave-4 monsters and killing
none of them: 31 met, 0 killed. This re-census, on the same seeds
with the same policy after partyfinish landed, finds 21 met and
2 killed — both in turn-based fights against lingering beasts the
village kept throwing itself at until one finally fell. Field
fights still kill nothing (0 of 11 faced). Raids still mostly never
turn into a fight at all (9 of 16 raiders only ever drafted, never
met in combat).

Read the headline carefully, because it is easy to misread: the
kills did NOT come from partyfinish. Partyfinish only changes
fights when a mustered party corners a beast on a sortie — and
this census's policy never sends a sortie, so that mechanism never
fires here (zero sortie fights in the whole corpus, same as 0416Z).
The proof is mechanical, not an argument: running this same census
over partyfinish's own control band — which has the partyfinish
code but no sortie driver, exactly like this run — reproduces the
new census exactly, same 2 kills, same days, same beasts. The
0 → 2 move happened between the 0416Z base and the partyfinish
base, in other landed changes (map, calm-beast, finale-omen gate,
and the rest of that range) — not in partyfinish. Partyfinish's
own verdict stands on its own driver substrate; it neither gains
nor loses anything from this census.

The wall still stands: wave 5 reached on 0 of 8 seeds, the full
seat on 0 of 8, wins 3 of 8 (all lesser seat). What moved is
narrow: turn-based attrition against lingering wave-4 beasts now
sometimes finishes, where before it never did.

## Verdict: DIAG-GO (binding prereg) + kills CHANGED (with attribution)

Judged by scripts/test-w4convert-postparty.js (exit 0):

- CENSUS COMPLETE: 8/8 seeds, every row days > 0, every recorder
  clean (errs 0, no overflow).
- EVERY SPAWN CLASSIFIED: unclassified 0, vanished 0. All 44
  universe spawns are faced (21) or never-met (23, all still
  present at end — none removed-unfought, none vanished).
- COMPARISON PUBLISHED (below): wave-4 kills NEW 2 vs 0416Z 0 →
  verdict CHANGED. Field kills 0 vs 0 (unchanged). TB wins 2 vs 0
  (the whole move sits in TB).
- CROSS-CHECK GATE: PASS 8/8 seeds vs the partyfinish CONTROL band
  (days, gameDays, won, waveReach, nationalEver/Final, table,
  entered, deathTotal, starvationDeaths, courtship combined all
  identical per seed). No investigation stop was triggered.
- SUBSTRATE GATE: PASS (courtship combined 110, 8/8 seeds active).
- SELF-CHECK: PASS — re-censusing the 0416Z corpus with the same
  definitions reproduces its published band exactly (51 / 31 / 29 /
  0, all 11 fields).
- w4damage parity is DIAGNOSTIC ONLY per prereg (base moved):
  PASS on 75101/75104/75106/75107, FAIL on 75102/75103/75105/75108
  (days, deaths, spawn sets moved) — expected base drift, never
  a gating leg, never hidden.

DIAG-GO is a census verdict, not a lever verdict: it certifies the
counts and the comparison, not that any game change worked.

## The comparison (identical seeds 75101–75108, tableseat-nowait substrate)

Band, NEW (postparty tip) vs 0416Z:

| measure | NEW | 0416Z | delta |
|---|---|---|---|
| wave-4 universe (spawns) | 44 | 51 | −7 |
| faced | 21 | 31 | −10 |
| engaged | 21 | 29 | −8 |
| KILLED | 2 | 0 | +2 → CHANGED |
| field kills | 0 | 0 | 0 |
| raid kills | 0 | 0 | 0 |
| TB kills / TB wins | 2 / 2 | 0 / 0 | +2 / +2 |
| never-met | 23 | 20 | +3 |
| met-but-no-kill | 19 | 31 | −12 |
| multi-touch instances | 15 | 19 | −4 |
| non-world TB / field | 2 / 1 | 3 / 2 | −1 / −1 |
| wins | 3 | 3 | 0 |
| national ever / final | 7 / 6 | 7 / 5 | 0 / +1 |
| table invited / entered | 4 / 3 | 6 / 3 | −2 / 0 |
| wave-4 reach / wave-5 reach | 6 / 0 | 5 / 0 | +1 / 0 |
| median survival | 146d | 162d | −16d |
| deaths total | 286 | 286 | 0 |
| starvation deaths | 1 | 2 | −1 |

Per channel, NEW vs 0416Z (faced / engaged / killed):

| channel | NEW | 0416Z |
|---|---|---|
| field | 11 / 11 / 0 | 16 / 16 / 0 |
| raid | 16 / 2 / 0 (9 drafted-only) | 22 / 4 / 0 (12 drafted-only) |
| TB | 14 / 14 / 2 | 18 / 18 / 0 |

Per seed, NEW (days, universe, faced, engaged, killed, never-met):

| seed | days | universe | faced | engaged | killed | never-met | 0416Z kills |
|---|---|---|---|---|---|---|---|
| 75101 | 132 | 0 | 0 | 0 | 0 | 0 | 0 |
| 75102 | 180 | 10 | 5 | 5 | 1 | 5 | 0 |
| 75103 | 132 | 9 | 2 | 2 | 0 | 7 | 0 |
| 75104 | 90 | 0 | 0 | 0 | 0 | 0 | 0 |
| 75105 | 180 | 1 | 0 | 0 | 0 | 1 | 0 |
| 75106 | 146 | 13 | 9 | 9 | 0 | 4 | 0 |
| 75107 | 180 | 0 | 0 | 0 | 0 | 0 | 0 |
| 75108 | 102 | 11 | 5 | 5 | 1 | 6 | 0 |

Per-seed wall deltas vs 0416Z worth naming: 75103 flips from
village-lost d180 (50 deaths, no win) to lesser win d132 (28
deaths) — the biggest trajectory move in the band — while 75105
flips the other way (lesser win d162 → survived d180, 36 → 48
deaths). 75102 gains a day-count (177 → 180) and its kill; 75108
shortens (114 → 102) and gains its kill. Band wins hold at 3;
the wall numbers below are the NEW band's, not a pool.

## The two kills (the whole CHANGED verdict, in full)

Both are scholar-led TB-party kills of LINGERING beasts, both
removed as `player-fight-kill`, both worn down across repeated
turn-based fights — not one clean duel:

1. 75102, seq 21, The Reunion, spawned d145 (tile-entry, 1200 HP).
   Raid-drafted, never field-fought. On d172 the scholar-led party
   fought it FOUR times in one day: lost (monster 171 HP left),
   lost (120), lost (120), then won round 7 (monster −24, scholar
   alive at 35 HP). Three lost fights in the same day each ended
   with the scholar dead (HP −20/−19/−16) before the fourth party
   finished it. Conversion here is attrition plus persistence:
   a beast that stays at the treeline gets fought until a party
   survives the fight.
2. 75108, seq 32, The Suburb, spawned d91 (tile-entry, 1300 HP).
   One field fight first (a villager died, vDie), then TB: d94
   lost (832 left), d95 lost (507 left), d95 won round 6 (−27)
   with villager ally ruth_goldstein standing in the party
   (100/100 HP). Same shape: linger, re-engage, wear down, finish.

Killer identity per the binding definitions: 'scholar-led TB
party' for both — the recorders carry fighter keys but no
killing-blow attribution, so no individual is named for a TB
kill (ruth_goldstein is named only as a standing party member
in the winning fight's fighter list, not as the killer).

## Why this is NOT a partyfinish effect (attribution, pre-registered)

Three independent checks, all pointing the same way:

1. ZERO sortie caller rows in the new corpus (callers: resolve
   1030, other 201, aid 41; wave-4 callers: resolve 20, aid 6,
   other 1). The partyfinish mechanism can only fire on a sortie
   caller (lingerSortie sets opts.cornered; no other caller
   does). No sortie rows → the mechanism never fired here.
2. The tableseat-nowait policy contains no linger/sortie call
   (grep-verified), and in node the only other answerLingerer
   caller is app.js (DOM, excluded). The engine default for
   unanswered lingerers is 'endure'.
3. The clincher: the census analyzer run over the partyfinish
   CONTROL corpus (mechanism present, driver OFF — the same
   dormancy as this run) returns the IDENTICAL census: universe
   44, faced 21, engaged 21, killed 2, the same two instances on
   the same days, channel table identical. (Temporary analyzer
   copy used for this check only; created, run, and deleted in
   the same step — not committed, not a deliverable.) The 2 kills
   therefore already existed in the partyfinish-era code WITHOUT
   its driver. The 0416Z → postparty move is base drift between
   bcf137c40 and 37aa0a4fb, and this evidence does NOT assign it
   to any single change in that range — that range holds
   tackle-map, calmbeast, the P2 finale-omen gate, barwhy,
   caughtlift, divedeep, and more, and a single-change
   attribution would need a bisection this census was not asked
   to run (blank for the backlog, not chased here).

Corollaries, stated plainly: (a) partyfinish's counted finishes
were sortie fights under its own driver policy — a different
substrate — and this census says nothing for or against them.
(b) Anyone citing "wave-4 kills went 0 → 2 after partyfinish"
without the dormancy qualifier is misreading this run.

## Wall numbers (THIS band only, never pooled)

| field | NEW band |
|---|---|
| national ever / final | 7/8 / 6/8 |
| table invited / entered | 4/8 / 3/8 |
| wins (lesser / full) | 3/8 (3 / 0) |
| wave-4 unlock / wave-5 unlock | 6/8 / 0/8 |
| median survival | 146d (days: 90, 102, 132, 132, 146, 180, 180, 180) |
| starvation deaths | 1 (75108) |
| deaths total | 286 |

Death-cause shares (286): villager combat 110, villager-vs-
villager combat 80, arena 43, expedition 22, monster 14, ambush
4, sickness 5 (player 2, villager 3), night 2, contest 2,
starvation 1, thirst 1, alien 1, toad-war-drum 1. Combat-family
(villager combat + villager-vs-villager + monster + ambush +
expedition + alien) = 231 (80.8%); the arena alone = 43 (15.0%).
Starvation is not the wall on this band; fighting is.

Reachability verdict: waves 1–4 reached (wave-4 on 6/8 seeds);
wave 5 on 0/8; national on 7/8 ever but the full seat on 0/8;
Arc IV (table entered) on 3/8, all lesser. The scale wall is
narrower than in 0416Z (wave-4 reach 5 → 6, a TB kill path now
exists) but still standing: nothing here reaches wave 5 or the
full seat.

## The census in full (so the next arm can build on it, not re-derive it)

- Spawn sources (44): tile-entry 37, scripted-titan herald 3,
  maintain 4. Spawn types: eulogy 15, reunion 12, influencer 4,
  suburb 3, herald 3, audit 2, eater 2, algorithm 2, strike 1.
  Eulogy dominates the spawn pool (15/44) and the faced pool
  alike — the Mirror Draft villages actually meet is, more
  often than not, the thing that narrates their death.
- Field outcomes (26 rows): field:vFlee 16, field:vDie 8,
  raid:vFlee 2. Field fights end in flight or villager death,
  never a kill, never a monster flight. TB results (24 fights):
  lost 22, won 2.
- Met-but-no-kill (19) by shape: TB+raid lost 8; field-only
  vFlee 3; field+raid vFlee 1; TB+field+raid vDie+lost 3;
  TB+field+raid vFlee+lost 1; raid-only vFlee 1; field-only
  vDie 2. The two recurring endings are "lost the turn-based
  fight" and "fled the field fight" — there is no third ending
  in this band.
- Never-met (23): ALL still present at end. No wave-4 spawn was
  removed without a fight, and none vanished — the census has
  no holes, and the never-met are beasts the village simply
  never got to, not bookkeeping gaps.
- Non-world reconciliation (never inflating the census):
  non-world TB 2 (75101 influencer, null-origin, lost; 75106
  audit, world-origin-mismatch), non-world field 1 (75102
  suburb, evade, rounds 0). Deed-faced wave-4 types per seed:
  75101 [influencer]; 75102 [audit, eulogy, reunion]; 75103
  [audit, eater]; 75106 [algorithm, audit, eater, eulogy,
  influencer, reunion]; 75108 [eulogy, reunion, suburb].
- Mechanism hypothesis, grounded in the counts (carried from
  0416Z, updated): wave-4 conversion on this substrate runs
  ONLY through lingering-beast TB attrition — a beast that
  stays gets re-fought until a scholar-led party survives a
  fight against its worn-down HP. The field channel cannot
  convert (villagers deal ~0–10 damage per meeting against
  900–1300 HP beasts and take 45–81 in return), and the raid
  channel barely engages (2 of 16) because drafted raiders
  are usually never met in combat at all — they gorge, then
  drift off. Partyfinish's sortie path is a fourth channel
  that this substrate never opens; whether it converts wave-4
  (not just wave-1/2 lingerers) is still unmeasured, and needs
  the partyfinish driver on a wave-4-facing band to answer.

## Sense-testing: one faced-not-killed encounter, read in plain words

Sense seed by the binding rule (most faced, tie → lowest):
75106 (9 faced). Window: first faced d89 − 10 = d79 to last
faced d146 + 10, capped at the seed's end d146. Sense replay:
scripts/test-w4convert-postparty-sense.js, SEED=75106, DAYS=146,
FROM_DAY=79 (NON-MEASURED; replay text never enters any count;
the replay trajectory shifts, as stated in the 0416Z arm).

First faced-not-killed instance in the window: seq 42, The
Eulogy, spawned d79 at 900 HP, field-only, still present at
d146 with 890 HP. What the village actually did, from the
measured rows: on d104 a villager met it twice — 2 rounds,
dealt 10, took 78, fled; then 1 round, dealt 0, took 45, fled.
On d111 catalina_reyes met it — 2 rounds, dealt 0, took 81,
fled. Three meetings, 10 damage dealt, 204 taken, beast
essentially unharmed, everyone who met it walked away alive.
The replay's own language for this beast says the same thing
before any fight happens: d79, "MUSTER — scouts report The
Eulogy hunting near Haven, and it is beyond us. Everyone
inside. No one walks the treeline alone — the garden crews
double up, the hunters stand down. We outlast it." That is a
coherent village policy (don't fight what you cannot dent)
enacted by the fights that follow: meet, take a beating, flee,
survive. It reads as judgment, not as a bug — the same village
that flees the Eulogy also endures its gorge nights (d86–88:
1,595 / 1,000 / 630 kcal gone) because the alternative the
game itself names every night — "or send a sortie: fighters,
rations, real risk" — is a choice this policy never takes.
The Eulogy thread is sensible throughout; what is missing is
not sense but a taken choice.

Villager behavior sample (same replay window): villagers act
like people in the small decisions — Walt checks a full pantry
and turns to the wood run instead of hauling more; Valeria
teaches Tulsi and Chinese Chive unasked and the Codex grows;
Jorge waves off his share when the shelves are full ("Dinner's
on me tonight, then"); Chantal speaks only French and is met
with eyes, hands, and patience; shared meals, garden work, and
grief talk fill the days between raids. Two robotic notes,
both minor, both ambient rather than census-affecting: Fatima's
belonging line repeats verbatim on d80 and d86 ("talks about
wanting to belong somewhere the way people talk about weather —
often, and with no plans to change it"), and the Contract Quill
inventory-reflection line ("The feast was the weapon") fires
nearly every day. Neither changes any count; both are the kind
of repetition a player would notice on a long run.

## Blanks found (reported for the findings backlog, NOT chased here)

- Field channel still zero: 11 faced, 11 engaged, 0 killed, 0
  monster flights. Villagers cannot dent wave-4 in the field
  (10 damage across 3 meetings vs 900 HP, 204 taken). If field
  conversion is ever meant to exist, it needs a damage path,
  not a meeting-rate change.
- Raid-drafted wave-4 raiders usually never fight: 9 of 16
  raid-faced instances are drafted-only; the replay shows why
  (raid night: "Nobody met The Eulogy — it's still out there
  at the treeline. It'll gorge every night until it's driven
  off"). The gorge-then-drift loop is the raid channel's real
  ending on this substrate.
- TB attrition shape needs a design look (steve-call candidate):
  the two kills each took 3–4 turn-based fights, with the
  scholar dying in the lost attempts on the same day before
  the winning party finished the beast. Is same-day re-
  engagement of a lingering beast after a scholar death the
  intended conversion path, or an attrition loophole? The
  census proves it happens; it does not rule on whether it
  should.
- Wave-4 conversion under the partyfinish driver is still
  unmeasured: this census proves the mechanism is dormant
  without its driver, so the question "does a sortie party
  finish a wave-4 beast?" needs a band with PARTYFINISH=1 on
  wave-4-facing seeds, not another tableseat-nowait census.
- Minor robotic notes (above): Fatima's verbatim-repeat
  belonging line; daily Contract Quill reflection spam.

## Convergence state

converging (measurement only — the scale-onramp axis is not
converged: wave-4 kills exist now but only via TB attrition,
wave 5 and the full seat remain at 0/8).

## Metric review

- None — metrics held. One review note FOR THE NEXT RUN, not
  this one: the CHANGED verdict and the mechanism attribution
  are separate judgments, and this run kept them apart only
  because the prereg forced the dormancy check up front. A
  future post-lever re-census should pre-register the caller
  census (sortie rows present/absent) as a formal leg, not a
  narrative aside — without it, a counts verdict like this
  one's CHANGED would have been misread as a partyfinish win.
- The DIAG-GO bar worked as designed: no kill-count threshold
  was needed, and the 0 → 2 move was judged on counts while
  attribution was judged on caller evidence.

## Balanced panel (§15) and telemetry

- PANEL. scripts/balance-panel.js has NO corpus-ingest mode
  for a single-arm census corpus (confirmed this run: the tool
  errors without --out and builds panels from live roots, not
  census rows). No panel artifact was faked; the paired sweep
  tables + analyzer outputs above (cross-check 8/8, self-check
  exact) are the section-15 substitute, as in 0416Z. This arm
  changes nothing in the game, so a same-base panel would show
  zero movement; a panel against the 0416Z-era panel would
  show base drift, which the comparison tables already measure
  directly.
- TELEMETRY DEVIATION CHECK (loop body step 10):
  `node scripts/telemetry-check.js --baseline ~/workspace/goals/
  the-scattering-roguelite-survival-game/hidden_files/
  telemetry-baselines/scale-wall.json --current
  'evidence/2026-10-28/perseed-w4convert-postparty/*.json'
  --metrics national,table,wins,exiled` → 3 LOUD lines
  (national 12→0, table −75% 16→4, wins 16→0, n=10 files).
  Verdict: KNOWN ARTIFACT, no investigation, baseline NOT
  rolled. Two independent reasons, both documented (same as
  the census family): (a) the baseline's own regime note
  forbids this comparison (a ~100%-win winseat suite vs a
  tableseat-nowait census substrate); (b) the field-shape
  artifact repeats (per-seed rows carry nationalEver/entered/
  won, not top-level national/table/wins paths; summary.json +
  analysis.json are the 9th and 10th files). The corpus's real
  wall numbers are nationalEver 7/8, table entered 3/8, wins
  3/8. No exiled LOUD line.

## Infrastructure notes

- Sweep: scripts/test-w4convert-postparty-sweep.js, 8 seeds,
  ~3.5 min wall (the 0416Z arm's ~9 min included its detgate +
  sense replays; the judged sweep alone ran faster here).
  Corpus: evidence/2026-10-28/perseed-w4convert-postparty/
  (8 rows + summary.json + analysis.json). Analyzer:
  scripts/test-w4convert-postparty.js (proof validator; exit 0
  on the re-run, mechanical PASS, unclassified 0, vanished 0).
  Sense: scripts/test-w4convert-postparty-sense.js (NON-
  MEASURED replay only; 75106 window d79–d146).
- INDEX CLOBBER (loud, repaired, commit correct): after the
  prereg safe-commit (11acfab3f), the worktree's main index
  showed the prereg file as a bogus staged deletion plus an
  untracked copy (worktree file byte-identical to HEAD, blob
  6c2a6113). Repaired via `git update-index --add --cacheinfo
  "100644,6c2a6113,<path>"` and re-verified (`git status
  --short` empty, `git diff HEAD` empty). No reset, no stash
  touched, commit verified via `git show --stat HEAD`. The
  same check runs after every safe-commit in this run.
- Temp control-check analyzer (scripts/
  test-w4convert-postparty-controlcheck.js) was created, run,
  and deleted in one step; its scratch analysis went to /tmp
  and was deleted with it. Neither is committed. The judged
  corpus lives only under evidence/ in this worktree.
