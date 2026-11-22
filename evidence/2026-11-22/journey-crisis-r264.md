# Journey — Crisis r264

**Run:** `playtest-loop-2-20261122T1856Z`, scheduled 13:00 CST Sat 2026-11-22 / 19:00Z.
**Seeds:** 14599–14601 (pilot of 3). **Base:** master `8ec902e56` at prereg.
**Finisher:** the scheduled occurrence hit its 3600s limit during write-flap
window 8 (active since 19:36:03Z) and did no panel work. This finisher
verified no live coordinator, heartbeated the tree, waited for writes to
clear (machine replaced ~21:00Z), and played the panel 21:04:31–21:06:46Z.
**Lock discrepancy:** none. The lock file reads
`playtest-loop-2-20261122T1856Z`; the prereg records the same run_id.
Closeout deletes the lock only if the file matches, read in the same call
as the delete (per-line `grep -qx`).

**Number correction:** this run is crisis **r264**, not r268. The parent
brief's "r268" is a slip (r268 is the establishment run, a different leg).
The frozen prereg is `evidence/2026-11-22/journey-crisis-r264-prereg.md`
(seeds 14599–14601, base `8ec902e56`); its frozen bars are carried from r263.

## Leg question (prereg)

The STUCK-KEY-CHURN diagnostic: does the stuck trace show the fight key
changing before `_closeStuck` reaches 3 (mechanism CONFIRMED — fight-object
churn defeats the counter), or a stable key with a named reset (REFUTED)?

**Short answer:** MIXED, and churn is not the defeat. The trace shows key
churn on 6 of 9 fight stall-days — but 3 stall-days have a perfectly STABLE
key, the counter reaching 119, and the flee firing 117 times in a single
day without the fight closing. The flee fires now (618 unreachable flees
panel-wide, vs 0 in r263) — but firing is not resolving. The fight keeps
attempting the move through `v2Fight` and failing ~237 times a day; the
flee is a side effect that never disengages it. See FIGHT-STALL.

Frozen bars: FIGHT-STALL-FIGHT 0, FIGHT-STALL-TRAVEL 0, C3b 0 false
settlements, DRY 0, WRAP 0, DOWNEDTWICE 0, M12 0 same-reason repeats.

## Panel numbers (main, seeds 14599–14601)

| Seed | End | Raids | Gorge nights | Sorties | Alive | Pantry (kcal) |
|------|-----|-------|--------------|---------|-------|---------------|
| 14599 | 130d GAME-OVER | 9 | 20 | 2 | 1 | 0 |
| 14600 | 150d horizon | 13 | 44 | 9 | 4 | 800 |
| 14601 | 150d horizon | 13 | 124 | 9 | 4 | 5,010 |

2/3 reached the 150-day horizon. 14599 starved out (pantry 0 from d63;
starvation corpse Elif Demir d74; 6 deaths). 14600 held with 4 alive
(pantry 0 on d133; 6 deaths). 14601 held with 4 alive (pantry 0 on d63,
recovered to 5,010; wound corpse Ursula d100; 7 deaths). Medicine supply
still thin: 0 pharmacy days on all three seeds (medSupply
daysWithPharmacy 0/130, 0/150, 0/150).

- Attempts 20, ok 15, refused 5, cleared 5, deltaExact 15, deltaBad [].
- Gorge 188 nights / 219,090 kcal. Sortie fights 31. Convos 24, fabricHits 0.
- D1 snapshots 20/20. D2 clear rate 5/15. D3 drift labels: player-drawn-off
  9, moved-on-valve 26, sortie-clear 20, unknown 0.
- R181 SOFTLOCK seeds 0. R57 TRUE early resolutions 0 (legacy count 3).
- R181 BENCH: refused 5 (gateOneShort 3, supplyEmpty 1, availabilityDrain
  1); nodeAway exclusions 10 across refusals — the muster bench is drained
  by people away from the node, not by deaths.
- DEATHCLEANUP: 13 cleanups, 0 dead-holder entries. TITAN: seed 14599's
  Herald gate refused 171 outcomes (0 allied blades, 20 gate-refusal
  lines); slain-field kills 2 (Saida d86 on 14600, Fiona d74 on 14601).
- STRANGER: VACUOUS (0 alien kills on all three seeds).

## FIGHT-STALL — NO-GO (9 fight / 0 travel)

Split (instrumented `nopathBySource`, per-source day ≥10 failed calls):
**9 fight stall-days, 0 travel.** The r263 travel stall day does not
recur — every stall day this run is fight-source.

| Seed | Fight stall-days (failed calls) |
|------|----------------------------------|
| 14599 | d37 (11), d44 (22), d73 (237) |
| 14600 | d88 (237), d106 (13) |
| 14601 | d26 (237), d84 (11), d103 (237), d144 (241) |

The unsplit transcript count ("No path there." lines) gives 4 stall-days
(14599 d73: 236, d44: 18, d37: 10; 14601 d103: 119). The split is the
honest instrument — the wrap counts every failed `tbPlayerMove` call,
the transcript count counts the lines that surface. Panel no-path lines
423 (14599: 274, 14600: 9, 14601: 140).

## STUCK-TRACE — the key is not the defeat

Per fight stall day (trace entries / key changes / max stuck / flee fires):

| Seed/day | Entries | Key changes | Max stuck | Flees |
|----------|---------|-------------|-----------|-------|
| 14599 d37 | 6 | 1 | 3 | 1 |
| 14599 d44 | 22 | 1 | 9 | 8 |
| 14599 d73 | 237 | **0** | **119** | **117** |
| 14600 d88 | 237 | **0** | **119** | **117** |
| 14600 d106 | 3 | 2 | 0 | 0 |
| 14601 d26 | 237 | **0** | **119** | **117** |
| 14601 d84 | 12 | 1 | 4 | 3 |
| 14601 d103 | 238 | 1 | 119 | 117 |
| 14601 d144 | 238 | 1 | 119 | 117 |

Panel: 9 fight stall-days, key-churn days 6, stable-key days 3,
flee-fired days 8. **Resets recorded: none, on any day** (`resets {}` 
everywhere) — the prereg's REFUTED branch expected a named reset; no
reset was ever named.

Reading: key churn is real on 6/9 days, but it cannot be the defeat —
on the three stable-key days (14599 d73, 14600 d88, 14601 d26) the key
never changes, the counter climbs to 119 (the `_closeStuck` threshold
is 3), and the flee fires 117 times in one day without the fight
closing. The flee is firing and the counter is not resetting. The
nopath stacks name the call sites: the big stall days come through
`oracleV2.js:413` (`v2Fight`'s own move attempt → `policy.fight`),
not the flee path (`:319`/`:370`). The fight itself is stuck — the
fighter cannot path to the monster and keeps trying ~237 times a day —
while the flee fires alongside it as a side effect that never
disengages the fight.

**Next fix must make the flee actually disengage** (or cap the attempts
/ end the fight after N failed moves). Keying the counter differently
will not help: on the stable-key days the counter already reaches 119
and the flee already fires 117 times.

## ORACLE-CTX — measured on 3 seeds

Run-summed policy counters: fled 750 (unreachable 618, nodeed 66,
outmatched 11, neardeath 55), struck 71, engagedFavored 3,
stuckTraceDropped 0. The context dump works — nothing is absent this
run. Two readings: (1) the r263 "flee never fires" finding is reversed —
the unreachable flee is now the single most common policy outcome;
(2) posture: fighters flee on unreachable ~8.7× more often than they
strike (618 vs 71), and engage when favored only 3 times panel-wide.

## C3b — GO (0 false settlements)

C3b-TRANSCRIPT: settledLines 8 — negation 2, vote 1, closer 1, TRUE 4.
The 4 TRUE hits are all one sitting, seed 14600 d41, Alba Lindqvist —
adjudicated **not a false settlement**:

- The favor was genuinely done: `heal_help`, favorState `thanked`
  (closed). The player healed Alba's wound; she opens "You came through
  on this wound. I won't forget it."
- Player picks [dlg:react] → "We're square." / NPC "Good. Then we're
  square." — the player acknowledging a paid debt, not marking an unpaid
  one settled. NPC agrees. [dlg:cant] → "Don't worry about it." /
  "Okay. Your call." They file it away — settled, and counted. Silence
  → "Good — that debt, settled. Feels better said out loud."
- The r263 caveat is answered: the closer DOES fire in the wild (d41
  end-of-sitting + d50) and on a paid debt it is correct.

Wrinkle, not a false settlement: the same sitting says "still on that
debt" three times AFTER the debt was settled (recap answers), and the
closer fires three times in one sitting. The topic tracker does not know
the debt closed. Negations are clean — the murder of Omar is correctly
unsettled on 14601 d10 and d13. Vote "Counted." ×1.

## DRY — GO

DRY-CENSUS: 0 dry lines across 24 transcripts, deflect_q 0.

## WRAP — GO

R128: 24/24 transcripts marked (23 engine-ended, 1 driver-cap break),
0 unmarked.

## DOWNEDTWICE — NO-GO (regression of #2634)

3 `goes down` lines, 1 duplicate group: seed 14600 d95, Maya Cohen ×2.
The full 4-line block repeats verbatim, adjacent in `sayLines`
(11644–11647 then 11648–11651): "Maya Cohen of Thornfield goes down in
Haven's dirt…" + "They paid in blood…" + "The village feels it…" +
"One down — but 2 still hold the treeline. The gorge goes on." The side
effects double too (trust −12 instead of −6, 2,000 kcal forgiven instead
of 1,000). The d100 line is a legitimate separate down (different day).

The #2634 fix (`f11b30882`, fieldFights.js pick + fall guard) guards the
per-blow live→0 transition inside a single `fieldFight` call. It does
not cover this path: the double-emit comes from `aidFight` being entered
twice for the same down in the tick (or the same down processed by two
tick passes) — `aidAllyDown` (comms.js:727) has no dedup guard of its
own, and the tick fights are not recorded per-call in the seed JSON, so
the exact call path is not pinned from this panel. Next: guard
`aidAllyDown` itself (per ally+day) or dedup the `aidFight` entry.

## M12 — GO

4 circles lines across 4 sittings, 0 same-reason repeats.

## People check — PASS

Four sittings read in full (14600 d41, 14601 d10, 14599 d55, 14601 d63):
all read as people, 0 fabric hits, 0 dry lines.

- 14599 d55 (Caleb Jones): mourning Hassan — "Hassan always took the
  burnt piece. Said someone had to. I take it now." Roles as promises;
  "We bury, we grieve, we keep going. There's no step four."
- 14601 d10 (Marcus Jiang): link-accept works ("All right. Let's ask
  them." / "Go and ask."); the murder press escalates then exhausts
  honestly ("You've walked them through it every way you know how.");
  Omar's murder correctly unsettled.
- 14601 d63 (Fiona Navarro): wound-care favor declined gracefully
  ("…Okay. I'll figure it out."); foraging teaching names real plants.
- Carried observation: `favor_requirements` still reads as a mechanics
  instruction ("You need to be right next to them, same side of the
  Haven door, to help." — 14601 d63). Recap fragments read slightly off
  ("that wound care — that's still where we are.").

## Instruments (r264)

- A (`oracleV2.js` `_stuckTrace`): works — 309/284/794 entries per seed,
  0 dropped.
- B (driver ctx dump + nopath wraps): works — `nopathBySource` present
  on all seeds; `nopathStacks` printed for all 9 stall days.
- C (analyzer sections): works — FIGHT-STALL SPLIT, STUCK-TRACE,
  ORACLE-CTX, NOPATH-STACKS all printed.
- D (travel guard): NOT BUILT — conditional on the stack sample naming
  a driver/policy call site for travel stalls. There were 0 travel
  stall-days, so D stays unbuilt.

## Method notes (for the next run)

- The driver prints the per-seed JSON to stdout and never writes a seed
  file (same as the r262 driver). This panel captured stdout into
  `journey-crisis-r264-panel.log` and the finisher extracted the three
  JSONs from it (`journey-crisis-r264-delayed-seed{14599,14600,14601}.json`,
  validated: parse clean, days 130/150/150, ends game-over/horizon/horizon,
  no errors). Next run: redirect each seed's stdout straight to its JSON
  file, as r263 evidently did.
- The first analyzer run was SIGPIPE-killed by a `| head` in the
  finisher's own invocation (output truncated at R57 D3, exit code
  misread as 0 through the pipe). Re-ran with a direct redirect: full
  965 lines, exit 0. Never pipe the analyzer through head.
- Panel speed: 3 seeds in ~2m15s (18s / 39s / 78s). The flap window, not
  the panel, consumed the run's window.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r264-gate`
on the rebased tip `241490396`, run detached from a script file (never
concurrent with another gate; no other gate was running): **332 passed,
12 failed in 890s** (21:26:04–21:40:54Z). Log:
`evidence/2026-11-22/journey-crisis-r264-gate.log`.

**0 attributable.** The 12 break down as 6 standing + 6 flap/load
artifacts, all green standalone with writes clear:

Standing (not attributable — the standing set):
- measurement-proof-update + measurement-workflow (staleness pair:
  "Proof source inputs are not current"; the r269 src fixes landed on
  master just before this rebase, so the proof is stale relative to the
  new master — not this delta, which touches no `src/js` file).
- living-garden + one-person-army deed-attainment (120s timeouts under
  load; load avg hit 11.9 during the gate).
- measurement-cache-flags ("both actual CLI configurations complete
  valid neutral panels").
- phone-frame-proof (stale receipt: index.html + 5 data files changed
  since the receipt).

Flap/load artifacts (all pass standalone on the rebased tip):
- prepared-runner-custody 4/0, proof-text-identity 9/0,
  telemetry-check-recorder 8/0, sw-audio-cache 7/7 — all four failed in
  the gate with `EPERM: operation not permitted, write`. Flap window 9
  was active mid-gate (21:33:14–21:35:27Z, three consecutive failing
  watcher cycles, A/B failing) — see Flap below.
- occupation-panels 25/0 ("real CLI workflow completed" in the gate;
  79.4s under load 11+).
- foodpower 30/0 (ontology validator failed in the gate; passes
  standalone; no `src/js` change in this delta).

Gate verdict stands at the standing 6.

## Flap (window 9, during this closeout)

Window 9, boot `ebfbfaba`, two episodes on the same machine with a clear
gap between them (the 08:49Z pattern — cleared then returned on the same
boot):
- Episode 1: ~21:33–~21:36Z (failing cycles 21:33:14, 21:34:20,
  21:35:27Z; cleared by 21:36:35Z) — mid-gate, explains the four EPERM
  gate failures.
- Episode 2: ~21:41–~21:47Z (failing cycles 21:42:02–21:46:08Z; cleared
  by 21:47:10Z, probes TMP-OK + HOME-OK at 21:47:22Z). Strace captured
  the exact failing write 3× per cycle (`write(3, "{\"x\": ", 6) = -1
  EPERM`).

Onset + closure are owed as a flap note by the parent (this finisher
reports the window here). Nothing was lost; the gate re-runs above were
done after the clear.

## Closeout

- Rebased onto current master `f2d03db92` (deepening r269) clean, tip
  `241490396`; proofs re-run on the rebased tip (nopath 16/0, stucktrace
  16/0); gate 332/12, 0 attributable (above).
- Merged ff-only into master (ff-only, so master moves to exactly the
  branch tip — see git log for the tip); worktree released, branch
  `journey2-crisis` deleted.
- Rotation-b 6→7, read back.
- Lock `playtest-loop-2.lock` deleted LAST with same-call per-line
  run_id verification.
- Telemetry: quiet (3 files, 1 metric, no large deviations); baseline
  NOT rolled.
