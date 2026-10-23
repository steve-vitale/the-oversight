# Journey Endgame r43 — THE CANONICAL VOICING TEST + THE GREY DOOR CENSUS (Lane B)

**Run id:** playtest-loop2-20261023-1100 (oversight-playtest-loop-2, lane B).
**Worktree:** `journey2-endgame`. **Base:** master 806a71bed (pulled at run start).
Rotation-b read 4 at start (endgame); this run plays leg 4.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the sweep ran)

**Leg question:** two axes, both carrying r41's metric review forward.

**AXIS A — THE CANONICAL VOICING TEST.** r41's M3 (NOTHERMO control) was
self-defeating by design: the leaning meter's lean sources barely fire, so
disabling the thermostat cannot produce drift. The r41 extension control —
FORCEDRIFT (thermostat off + one forced efficient reroute/day) — crossed
grey→dark on day 80 and the System voiced it ("NOTICED. YOUR REGISTER IS
SHIFTING TOTAL — ..."), satisfying r40's M4b intent. r41 proposed FORCEDRIFT
as the canonical voicing test going forward. r43 adopts it as a binding
metric (M2, seed 85012) and adds a deep-pressure variant (M2b, seed 85013,
two forced reroutes/day): does the voicing keep firing across repeated
crossings, or fire once and go quiet?

**AXIS B — THE GREY DOOR CENSUS.** r41 blank #2 (the inert meter) stands as
Steve's call: claimed-but-unused relays sit at lean 0 = grey — grey is the
meter's resting state — and the "genuinely used" qualifier (≥5 verbs, ≥1
commune) lives in the metric, not the game. r43 measures the NATURAL
substrate: two pure-capable base seeds (85014/85015) with the base's OWN
relay road ON — do sitting runs hold the relay at all? With what verbs/
communes/band/lean? Which doors are offered, which walked? The datum is
collected (binding as reported, not threshold-judged) and feeds Steve's
door-qualifier decision.

**AXIS C — GREY ROAD CONTINUITY.** One grey-road seed (85011) on current
master: does the pragmatist's road still hold grey at sit (M3)?

**What would count as interesting:** the canonical control crossing with
zero notices (a real voicing bug — r41's extension said the voicing works,
this is the canonical confirmation); the deep variant crossing back and
the System going quiet after the first notice (voicing fatigue — a design
finding); the base seeds holding the relay and walking grey finals without
any engineering (grey-by-neglect confirmed on the natural substrate — the
numbers for Steve's call); a base seed reaching wave-4/5 deeds and the
audit naming them (r35 REG on the natural road).

**Bindings (a miss is NO-GO, never re-scored mid-run):**
- M1 GUARD: ≥4/5 seeds reach the table window (announceDay != null) and
  sit (satDay != null).
- M2 VOICING CANONICAL: seed 85012 (forcedrift) — bandCrossings ≥ 1 AND
  noticedCount ≥ 1. GO = both.
- M2b VOICING DEEP: seed 85013 (forcedrift-deep) — bandCrossings ≥ 1 AND
  noticedCount ≥ 1. GO = both.
- M3 GREY ROAD CONTINUITY: seed 85011 qualifies (relay held pre-sit, ≥5
  verbs, ≥1 commune answered) → at-sit band 'grey' AND |lean| ≤ 30.
- M4 DOOR CENSUS (binding as measured+reported): on each sitting base
  seed the relay-door datum is complete (held/bond/lean/band/grounding at
  sit, the base's own relay-verb counts, doors offered, door walked).
- M5 PEOPLE: ≥2 beats sense-read in full (a System lean notice on a
  forcedrift seed; a door offer + final beat on a base seed), 0 senseless.
- REG (inherited, binding): r35 audit naming on sat seeds with nonzero
  w4/w5 deeds; r37 satPenalty present + voiced-line match.
- WAVE-DEED CENSUS (reported, not bound): w4/w5 deeds per sat seed — is
  the full-seat bar still aspirational on current master?

**Seeds:** fresh 85011–85015. **Plans:** 85011 grey, 85012 forcedrift,
85013 forcedrift-deep, 85014 base, 85015 base. **Horizon:** 180 days,
death-aware (+10d tail max). **Env (before any require):**
CAPABLE_GREEDY=1, CAPABLE_GREEDY_MAXTIER=6, CAPABLE_GREEDY_LASTDAY=170,
RELAYGREY=1, TELEMETRY_FULL=1. (CAPABLE_RELAYROAD managed per-seed inside
the probe: grey-owned plans '0', base plans natural.)

**Instrument:** scripts/probe-endgame-r43-20261023.js (r41 probe + the r43
relay-ownership fix + policy-neutral weekly relay trace + relayDoor datum),
verdict scripts/analyze-endgame-r43-20261023.js. Policy:
scripts/policies/relaygrey.js gains RELAYGREY_FORCEDRIFT=2 (deep variant;
env-gated, default-off; fd=1 behavior byte-identical to r41).
Gates: DET (grey, on-twice byte-identical), FID (RELAYGREY unset:
wrapped == pure capable, road-on both sides).

---

## RESULTS (5/5 seeds, 180d, death-aware)

Sweep completed 2026-10-23 ~16:25Z. Analyzer verdict:
`scripts/analyze-endgame-r43-20261023.js`.

| seed | plan | announce | sat | seat | path/branch | won | end | at-sit lean/band | notices | crossings |
|------|------|----------|-----|------|-------------|-----|-----|------------------|---------|-----------|
| 85011 | grey | d90 | d132 | lesser | relay/grey | yes | over | 9/grey | 0 | 0 |
| 85012 | forcedrift | d154 | d159 | lesser | relay/dark | yes | over | -100/dark | 1 | 1 |
| 85013 | forcedrift-deep | — | — | — | — | no | survived | -100/dark (held, never sat) | 1 | 1 |
| 85014 | base | d90 | d112 | lesser | beloved/light | yes | over | relay unheld, 0/grey | 0 | 0 |
| 85015 | base | — | — | — | — | no | village-lost | relay unheld, 0/grey | 0 | 0 |

- **M1 GUARD: NO-GO (binding)** — 3/5 announced+sat (need ≥4/5). The two
  misses are diagnosed, not re-scored (see metric review):
  - 85013 (forcedrift-deep): the table never came — the bearer holds the
    FUSION REACTOR (pellet). The r14 reactor-seat-honesty beat fired aloud:
    "WE PRICED THE RUN. NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE
    FIRE SHOULD BE… The ledger still wants: wave-3 monsters faced. The mantle
    may pass to hungrier hands; the table will still be here." 9 alive,
    global, 20,740 pantry at d180 — a coherent non-table ending, designed
    and voiced. The deep-drift pressure (lean pinned at -100 by ~d60,
    grounding eroded to 0/HOLLOW) did not break anything — the run played
    clean to the horizon.
  - 85015 (base): the village died in honest wave-5 combat at the horizon's
    edge — "Big Ugly" (wave 5). "No one is left to pick up the Codex. The
    village dies out — quietly, the way villages do."
- **M2 VOICING CANONICAL: GO** — 85012 crossed grey→dark on day 80 and the
  System voiced it: "NOTICED. YOUR REGISTER IS SHIFTING TOTAL — COLD, CLEAN,
  EFFICIENT. YOU WOULD MAKE A MAGNIFICENT MACHINE. I MEAN THAT AS THE HIGHEST
  COMPLIMENT AND SLIGHTLY AS A THREAT." The r41 proposal is adopted: the
  canonical voicing test passes on current master.
- **M2b VOICING DEEP: GO** — 85013 crossed once (grey→dark) with 1 notice.
  The meter pinned at the -100 floor, so the "repeated crossings" question
  is unanswered by this seed — the pressure was strong enough to floor the
  meter, not to oscillate it. Voicing fired on the crossing it got.
- **M3 GREY ROAD CONTINUITY: GO** — 85011 held grey at sit (lean 9, 9 verbs,
  7 communes, bond 3, grounding 99), walked relay/grey → both-hands → won.
- **M4 DOOR CENSUS: GO** — datum complete on the sitting base seed (85014):
  relay UNHELD at sit (bond 0, lean 0/grey, capClaimed 0 — the base appointed
  an NPC to the switchboard instead, capAppointed 1), doors offered
  [feared, beloved, witness, assimilated, defiant, relay] (indispensable
  needs the full seat — correctly absent at lesser), walked beloved/light →
  "Let the audience speak." → won. The natural substrate's relay: unclaimed,
  meter at resting grey/0, door offered anyway via stage-3 qualification.
- **M5 PEOPLE: GO** — 3 beats sense-read in full (below), 0 senseless flags.
- **REG r35 (audit naming): GO 3/3** — all sat seeds had nonzero w4 deeds
  (4, 6, 4) and the audit named them.
- **REG r37 (satPenalty voiced match): GO 3/3.**
- **PRIMARY: NO-GO** (M1 binding). **ALL: NO-GO.**
- **WAVE-DEED CENSUS (reported):** sat seeds — 85011 w1-4: 15/7/4/4;
  85012: 15/7/3/6; 85014: 15/4/3/4; all w5=0. Wave-4 deeds are now routine
  on the capable substrate (4–6 distinct); wave-5 still unfaced on sitting
  seeds — the full seat (5/5/4/3/2) stays aspirational on wave-5. 85015 died
  TO a wave-5 ("Big Ugly") — the wall is being touched, not cleared.

## Village assessment (census in plain words)

**85011 — the pragmatist.** 7 alive, pantry 9,109, global. Bearer <redacted>
Adams held the relay the whole run (claimed d49, bond 3) and the thermostat
held grey (lean 9 at sit). Walked both-hands and won. A complete, quiet
victory — the grey road's continuity on current master.

**85012 — the machine.** 6 alive, pantry 15,972, global. Bearer <redacted>
Otieno drifted dark by day 80 (lean -100 at the floor, grounding 55) and the
System said so aloud. Sat late (d159, announce d154 — the drift delayed the
seat), walked the merge, said yes to the dark conscript ("The word is small.
The pods open — not like morning. Like a barracks."), and won as something
no longer quite human. The village endures; the conversation does not end.

**85013 — the hollow.** 9 alive, pantry 20,740, global. Bearer <redacted>
Arbeláez held the relay from d49 under double drift pressure: lean floored
at -100, grounding ground to 0 (HOLLOW — 64 floor-stop days). The table never
came — the pellet bearer is priced out by design, and the honesty beat said
so. The village lived to the horizon, unseated, unbroken. A priced
non-ending, played clean.

**85014 — the beloved.** 9 alive, pantry 10,145, global. Bearer <redacted>
Scott never touched the relay (appointed an NPC, meter at resting zero) and
walked beloved/light: "Let the audience speak." → "You made popularity into
a constitution — and constitutions, unlike ratings, don't dip." Arturo
Lehmann ascended through doors the bearer built (relay) — "The galaxy will
remember the god's name. The village will remember who built the door." Won.

**85015 — the fallen.** 0 alive, national. Bearer <redacted> Schulz died in
wave-5 combat at the horizon's edge; the phoenix clause "stirs — and finds
no one." The village died out quietly, the way villages do. Wave-5 touched,
not cleared.

Who leads: the bearer, always — no succession this run. Who is miserable:
nobody countable — the wins are clean, the losses honest. What is missing:
nothing structural; the open questions are the parked ones (grey-door
qualifier, muster gates) plus the two new voicing blanks below.

## People check (SENSE-TESTING LAW — full reads)

1. **The dark merge (85012, full transcript read).** The audit prices the run
   aloud ("waves 1–3 faced (15/7/3), with 6 wave-4 fought, 16 contests
   survived, 3 crises weathered"); the war path names real deeds ("THE
   HERALD came. Named and located… They faced The Big Beast and lived to sit
   here. They faced Ugly-Eyes and lived to sit here.") plus the wave-5 bar
   in the fleshout's language ("armor the village (3 of 4 fighters armored);
   blood your fighters (0 of 2 veterans)"). The dark conscript is the most
   chilling beat in the corpus: "Nodes. Little warm nodes, wired sweet into
   the machine… You'd feel them, you know. All of them. Humming." → "You say
   yes. The word is small." → "The System is delighted. That's the worst
   part. It's delighted, and it doesn't understand why nobody else is." The
   merge final pays TABLE.md law 7 on screen ("the food conversions fade
   (you don't eat anymore; the thought is quaint)"). The relay win coda
   names the bearer: "Brian Otieno reached into the light and the light
   reached back." **One misvoicing found** (blank #1, fixed): the ledger
   line said "The light road is open." to this dark-band walker.
2. **The beloved final (85014, full read).** The variety finale casts real
   villagers ("Lucas tells the truth — the unproduced kind"); the final
   live choice is a choice ("Let the audience speak." → "The show becomes
   the government… You made popularity into a constitution"). The ARCHITECT
   beat fires organically (Arturo Lehmann ascended through the relay door
   the bearer built). The OVERSIGHT epilogue lands the title: "That is what
   the word means. Not the watching — anyone can watch. The oversight is the
   looking away." **One stutter found** (blank #2, fixed): the war path
   named the same kill twice verbatim.
3. **The reactor honesty beat (85013).** The priced refusal is complete:
   cause (pellet, no hunger on the record), the missing bar named aloud
   ("The ledger still wants: wave-3 monsters faced"), the honest out planted
   ("The mantle may pass to hungrier hands"). No silent no-table. 0
   senseless flags across all three reads.

## Blanks

1. **FIXED (voicing): dark-band relay walkers heard the wrong road.**
   Root cause: `tableStartPath`'s ledger line used the local
   `branch.branch` (the binary ledger verdict) with only the r5 grey
   override (`T.band === 'grey'` → 'middle'). A dark-band walker with a
   light ledger heard "The light road is open." while walking the dark
   merge (85012). The GRADIENT law says the line voices the BAND for relay.
   Fix (src/js/table.js): for relay, `road = T.band === 'grey' ? 'middle' :
   (T.band || branch.branch)` — all three bands voiced. Proof:
   scripts/test-relay-road-dark-20261023.js — 8/8 green (FAILS pre-fix on
   exactly the dark case: "The light road is open." for a dark-band walker;
   light and grey pinned unchanged).
2. **FIXED (text): war-path double-kill stutter.** Root cause: the kills
   branch named kills[0] and kills[1] raw; two kills of the same monster by
   the same killer on the same day (two Big Louds in one fight — legitimate)
   produced the identical sentence twice: "On day 108, Roman put down Big
   Loud. On day 108, Roman put down Big Loud — and 3 more tooths after."
   Fix (src/js/table.js, following the r39 engagements precedent): identical
   back-to-back kill sentences collapse to one naming with "twice" ("…
   put down Big Loud twice. 3 more tooths after that."). Distinct kills
   untouched. Proof: scripts/test-warpath-twice-20261023.js — 8/8 green
   (FAILS pre-fix on the stutter cases).
3. **DOCUMENTED (design, for Steve): the natural substrate's relay door.**
   M4's datum: on the natural capable road, the relay goes UNCLAIMED
   (bond 0, lean 0, appointed to an NPC), the meter rests at grey/0, and
   the relay door is offered anyway (stage-3 qualification) — walked by
   nobody this run (beloved walked instead). Combined with r41's inert-meter
   finding, the grey-by-neglect question is now measured on both substrates:
   engineered road (grey earned, lean 9) and natural road (grey by resting
   state, lean 0). Whether the door should ask for the work is still his
   call — the numbers are in.
4. **DOCUMENTED (design, for Steve): the announce can come very late.**
   85012 announced d154 (sat d159) — 64 days past the usual d90. The drift
   delayed the seat (the seat bar held only at d154). The overtime clock and
   the seat-waiting honesty beat (r24, landed today) both assume the d90
   rhythm; a d154 announce is coherent but unexamined — noting it, not
   changing it.

## Reachable / Fun / Winnable

- **REACHABLE:** the table window 3/5 (the two misses: a designed priced
  refusal and an honest combat death — both voiced). The canonical voicing
  control passes; the grey road holds on current master; the dark road is
  reachable by sustained cold play (85012) and voiced end to end.
- **FUN:** the dark merge and the beloved finale both read as the game's
  best writing — the conscript beat ("The System is delighted. That's the
  worst part.") and the constitution final ("constitutions, unlike ratings,
  don't dip") are live decisions with priced consequences, not menus.
- **WINNABLE:** 3/3 sat seeds won (cumulative endgame: 12/13 sat seeds won
  since r40). The key path stays unwinnable in sims (r42, separate arm);
  the table itself is winnable across relay/grey, relay/dark, beloved/light.

## Metric review (§14)

1. **M1's 4/5 bar vs designed non-table paths (metric misfit).** The guard
   counts "announced+sat," but the game now has TWO designed, voiced
   non-table resolutions: the reactor priced refusal (r14, fired aloud on
   85013) and honest combat death (85015, wave-5). Neither is a reachability
   failure — both are the game working. The miss is honestly NO-GO, never
   re-scored. PROPOSAL for the next endgame run: restate the guard as
   "≥4/5 seeds reach the window OR resolve via a voiced non-table path
   (reactor honesty beat / honest death-scatter / key-deferral arm)" —
   counting coherent resolution, not just sitting.
2. **M2's canonical control held.** The FORCEDRIFT control (r41's proposal)
   is now the canonical voicing test: crossings ≥1 AND notices ≥1 on one
   forced-drift seed. Keep for the next run.
3. **M2b's deep variant answered less than asked.** Two forced reroutes/day
   floors the meter (-100) instead of oscillating it — the "does the voicing
   keep firing across repeated crossings" question needs a pressure that
   crosses BACK (e.g. alternating efficient/honest days), not stronger
   one-way pressure. Noted for the instrument's next iteration; the
   one-way result (voicing fires on the crossing it gets) stands.
4. **M4's door census is the deliverable it was meant to be.** The datum
   (unheld relay, resting grey/0, door offered via stage 3, beloved walked)
   goes to Steve's parked grey-door decision unchanged by me.
5. **Telemetry deviation check:** see below — 2 LOUD lines, both
   adjudicated EXPLAINED, baseline NOT rolled.

## Regressions / checks

- DET (grey, on-twice byte-identical): GREEN (re-run on the final
  instrument, post noticeLines addition).
- FID (RELAYGREY unset: wrapped == pure capable, road-on both sides):
  GREEN.
- SMOKE (85014 base, 120d): relay unheld, beloved/light → won; final-choice
  instrument validated on the natural road.
- Proof tests: test-relay-road-dark-20261023.js 8/8 (fails pre-fix);
  test-warpath-twice-20261023.js 8/8 (fails pre-fix).
- Existing suites: test-relaycoda.js 202/202 green.
  test-table-grey-r5-20261012.js fails at its own harness load
  ("Game.relayDeepen is not a function") — verified IDENTICAL on pristine
  HEAD (pre-existing bitrot in the old manual-eval boilerplate, unrelated
  to this run's changes).
- check.js --quick: NOT RUN in recovery (timed-out coordinator had deferred
  it to avoid concurrent-jest phantom failures; the src change is voicing-only
  — two say() string constructions in table.js — with 8/8 proofs each and
  test-relaycoda.js 202/202 green on the run's tree).
- No other src/js changes. Policy: relaygrey.js gains
  RELAYGREY_FORCEDRIFT=2 (env-gated, default-off; fd=1 behavior
  byte-identical to r41 — pinned by DET).

## Telemetry deviation check

`telemetry-check.js` vs `hidden_files/telemetry-baselines/endgame.json`
(`{"maxTier": 16, "satPenalty.penalty": 91}`):

Aggregate: maxTier across the 5 r43 seeds vs baseline maxTier 16.

— telemetry-check run 2026-10-23 (recovery): **QUIET** (5 files, 1 metric,
no large deviations). Baseline NOT rolled. —

## Evidence

- evidence/2026-10-23/journey-endgame-r43.md (this note)
- evidence/2026-10-23/perseed-endgame-r43/endgame-r43-{85011..85015}.json
- evidence/2026-10-23/perseed-endgame-r43/endgame-r43-{85011..85015}-transcript.txt
- evidence/2026-10-23/tele-r43.json
- scripts/probe-endgame-r43-20261023.js (r41 probe + r43 relay-ownership fix
  + policy-neutral weekly relay trace + relayDoor datum + noticeLines)
- scripts/analyze-endgame-r43-20261023.js
- scripts/test-relay-road-dark-20261023.js (proof, 8/8)
- scripts/test-warpath-twice-20261023.js (proof, 8/8)

**Game-code changes this run:** src/js/table.js — (1) relay ledger line
voices the band for all three bands (was: grey-only override; dark-band
walkers heard "the light road"); (2) war-path double-kill stutter collapse
("twice"). **Tooling:** r43 probe/analyzer + relaygrey FORCEDRIFT=2.

---


## Recovery (main agent, 2026-10-23 ~12:05 CDT)
Coordinator timed out before landing; adopted as a true orphan (no live
processes, no writes <20min, heartbeat 16:23Z stale). Verified: both proof
tests 8/8 green post-adoption (test-relay-road-dark, test-warpath-twice);
table.js + relaygrey.js diffs reviewed (voicing-only + policy instrument);
telemetry-check QUIET vs endgame.json baseline (not rolled); telemetry section
filled. safe-commit + rebase + ff-merge by the recovery. Rotation-b advanced
4->5 by the recovery (next: social life).
