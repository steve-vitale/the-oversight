# sim-vetcompose — vetrel's companion-veteran channel composed into the win-side stack (2026-10-17)

Run: flesh-out loop arm sim-vetcompose (run_id fleshout-20261017T1102Z), axis scale-onramp (blocking).
Canon: docs/CANON.md + docs/TABLE.md (read first). ZERO src/js changes — policy-side composition only.
LANE CONSTRAINT: loop B owns src/js/game.js + src/js/engine/calories.js this run — untouched.

## The question

The wave-4 census (evidence/2026-10-17/sim-wave4census.md, today's diagnostic):
veterans is the binding bar on 29/34 non-winning win-side-stack runs — 100% of
deferral days, demand (2 living veterans) never met on any run. The named next:
compose vetrel's companion-veteran channel (scripts/policies/vetrel.js,
VETREL=1, gate-off = pure delegation) into the FULL win-side stack
(FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1, ALLOWGATE2 unset) — policies = withVetrel over the
seatdrive-composed leadseat/belongseat (scripts/policies/seatdrive.js
exports). Vetrel stood alone on the pre-seat courtship substrate
(evidence/2026-10-16/sim-vetrel.md): 18–0 companion wave-3 kills armed vs
control across 40 runs, wave-4 unlocks 3v1 at confirm. The open question is
compositional: does the win-side stack adopt the companion-veteran driver
(the stack wins at the day-90 floor; the veteran bar is measured on non-win
and pre-win snapshots — the two questions don't collide, they stack)?

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Arms (identical seeds, 180d death-aware, own in-sweep control):**
- control: withVetrel(leadseat), withVetrel(belongseat) — VETREL EXPLICITLY
  unset (gate-off = pure delegation; the det-gate proves byte-identical to the
  naked seatdrive stack).
- armed: the same two wrappers, VETREL=1.
**Substrate both sides:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1, ALLOWGATE2 unset.
**Seeds (8 fresh, collision-checked against evidence/ filenames before use):**
2271121, 2381233, 2491345, 2601457, 2711569, 2821681, 2931793, 3041905.
**Horizon:** 180d death-aware (dead villages stop; +10d tail max; wins truncate).
**Proof:** scripts/test-vetcompose-20261017.js — (a) layer markers honest both
sides (VETREL live only armed, seatdrive live both sides); (b) det-gate
byte-identical: control vs naked stack (60d × 2 seeds × 2 policies); (c)
instrument-neutrality det-gate (daily readiness read doesn't perturb);
(d) SMOKE schema-clean both sides. RED→GREEN where applicable.

**PRIMARY (binding):** runs reaching 2 living veterans (the engine's own
waveCombatReadiness(4).veterans ≥ 2 at any daily snapshot, INCLUDING pre-win
snapshots — wins truncate) armed − control ≥ +3 across 16 runs/side.
A miss on PRIMARY = NO-GO, never re-scored against a friendlier metric.

**MECHANISM SECONDARY (report):** companion wave-3 killing blows (waveKillLog
entries w≥3 AND via='companion' — the tricktag channel) armed − control ≥ +6.

**GUARDRAILS (binding):**
- wins armed ≥ control − 2
- national armed ≥ control − 2
- exiled 0 both sides
- no new death mode at n≥3 armed (paired against the run's OWN in-sweep
  controls, identical seeds — the corrected rule from sim-wincensus-c)
- matched non-win median survival armed ≥ control − 10d

**Secondaries (report-only):** vet2-peak rate by policy, wave-4/5 unlocks,
median/max survival, death-cause shares, vest/national reach, table
invitations, seat sittings, waveKillLog w3-by-via decomposition, vetrel
telemetry (hunts/yields/breakoffs).

**SENSE-TESTING LAW:** read 2–3 full transcripts of veteran-making runs —
does the companion-veteran story read as a village story, not a stat line?

## Results

Sweep: scripts/sweep-vetcompose-20261017.js completed SWEEP_EXIT=0 with 32/32
per-seed JSONs (evidence/2026-10-17/perseed-vetcompose/). Proof:
scripts/test-vetcompose-20261017.js 32/32 GREEN (see Metric review for the
wins measurement correction — the per-seed JSONs were repaired, the sweep
script fixed, both documented).

Corrected aggregates (16 runs/side, identical seeds):

| metric | armed | control | bar | verdict |
|---|---|---|---|---|
| PRIMARY vet2peak (runs ever showing ≥2 living veterans in a daily snapshot) | 1/16 | 0/16 | diff ≥ +3 | **MISS (+1) — NO-GO** |
| MECHANISM companionW3 (via='companion', w≥3) | 8 | 0 | diff ≥ +6 | **GO (+8)** |
| wins | 13/16 | 15/16 | armed ≥ control−2 | PASS (13 ≥ 13, at the floor) |
| national | 14/16 | 13/16 | armed ≥ control−2 | PASS |
| table (invitations) | 16/16 | 16/16 | — | — |
| exiled | 0 | 0 | 0 both | PASS |
| wave-4 unlocks | 0/16 | 0/16 | — | — |
| median survival | 90.0d | 90.0d | — | (wins truncate) |
| matched non-win pair | n=1 (belongseat-s2601457: armed 82d survived vs control 86d village-lost) | — | armed ≥ control−10d | PASS (−4d) |
| scholar deaths | 67 | 74 | — | — |

The single armed vet2 run: **belongseat-armed-s2601457** — maxVeterans=4,
companionW3=4, no seat, no win, ran the full horizon. Every other armed run
won at day ~90 (13/16) or died/lost early. Control's wave-3 kills are
player-only (w3by {player:19}); armed's are {companion:8, player:12} — the
composition added the companion channel without removing the scholar's.

Armed vetrel telemetry (16 runs): vetInvitesOk 113, vetHunts 179,
vetHuntLegs 276, vetHuntEngaged 22, vetHuntFights 34, vetBreakoffs 5,
vetYields 1, vetRescues 0. The yield fired once — the ≤20%-HP finish window
stays structurally narrow (matches vetrel's own finding: 17/40). The hunts
fire; the kills land organically.

Death modes (paired counterfactual — armed vs OWN in-sweep controls):
control: combat×284, villager combat×96, monster×24, expedition×22,
contest×4, ambush×2, dehydration×2, starvation×2, Inspiration×1,
Choir Toad×1, Ugly-Eyes×1, sickness×1, alien×1.
armed: combat×233, villager combat×107, monster×35, expedition×24,
alien×13, dehydration×6, contest×2, ambush×2, starvation×2,
Inspiration×1, Ugly-Eyes×1, the night×1.
No armed mode at n≥3 is absent from own controls (alien×13 vs alien×1
present; the night×1 <3; control-only Choir Toad×1) — guardrail PASSES
under the corrected rule (sim-wincensus-c).

**Verdict: PRIMARY NO-GO (binding), mechanism GO.** The composition moved
the companion-kill channel 8–0 onto the win substrate — the lever works —
but it did not convert into 2-living-veteran snapshots (1–0, bar +3).
Per §14: not re-scored. The mechanism decomposition says WHY (below),
and the named-next question from the census stays open with a sharper
formulation.

Why the primary missed (measured, not excuse): the win-side stack
truncates at the win (28/32 runs ended day ~90, 26 at exactly 90). The
veteran channel needs horizon: vetrel's standalone confirm (pre-seat
courtship, SEATDRIVE=0, runs to 158–182d) produced vet=2 peaks on 5/24
armed. Here the ONLY armed run that ever showed 2 living veterans was
the one that did NOT win (belongseat-armed-s2601457 — the full horizon,
4 companion kills, maxVet 4). Two other armed runs showed the bar
half-met ("blood your fighters (1 of 2 veterans)" at d55 leadseat-s2601457
and d71 belongseat-s2931793) then fell back to 0 — the blooded companion
died before a second could be blooded. Same killer-mortality mechanism the
census named: the bar demands 2 LIVING killers from a channel that
produces at most one at a time, and the win truncation removes the
horizon the channel needs to compound. The composition is proven
working; the constraint it was composed to move is horizon-starved by
the stack's own success.

## Metric review (§14 — binding, never re-scored)

1. **WINS measurement bug (caught during analysis, corrected
transparently).** The sweep's oneRun read `result.won` — a field runDays
does not return — writing wins=0 on all 32 per-seed JSONs. The sweep
script is FIXED (reads `Game.won`, the engine flag table.js sets at
won=true; 3-line change, node --check clean). The 32 already-written
JSONs were repaired by scripts/fix-vetcompose-wins-20261017.js from the
beat captures: the pods.js epilogue line "You won. Say it plainly: you
won." fires ONLY on the won path (table.js won=true → pods epilogue;
the deferred variant carries different text), and the script asserted
1:1 sits/winline consistency on every run before writing (a sat run
with no win-line, or a win-line with no sit, = STOP, no writes).
28/32 corrected to wins=1; the 4 without (2 village-lost, 2
survived-early, all sittings=0) are consistent. All numbers above are
post-correction; the in-sweep summary lines (printed pre-correction)
are superseded. The primary and mechanism metrics never touched wins —
the PRIMARY verdict is unaffected by the bug.

2. **Matched-pair guardrail denominator.** The in-sweep summary printed
n=16 matched non-winning pairs (it ran pre-correction, when all runs
read wins=0). Post-correction the true count is n=1
(belongseat-s2601457: armed 82d vs control 86d, armed −4d, within
±10d — PASS). The successor metric (control survived ≥ armed seatDay)
is 12/13 scorable pairs — honest report, not the binding verdict (the
n≥3 rule applied).

3. **PRIMARY miss is real.** Diff +1 vs bar +3 is not close, and the
mechanism decomposition (below) explains it structurally: horizon
starvation + killer mortality. No re-scoring, no friendlier metric.
The mechanism secondary GO (+8 vs +6) stands as its own measurement —
the lever moved its channel; the bar it was meant to satisfy needs
horizon the win stack doesn't give it.

4. **Mechanism decomposition (report):** w3by armed {companion:8,
player:12} vs control {player:19} — the composition added 8 companion
kills and the scholar's own 12–19 stayed; vetInvitesOk 113, vetHunts
179, vetHuntEngaged 22, vetYields 1. The kills come from (a)+(c)+(d),
not (b) — the yield fired once in 16 runs. Same finding as vetrel's
own decomposition. Not tuned here — the mechanism bar was met.

## Convergence

**killed-at-pilot equivalent (primary NO-GO).** The arm's binding
question — does composing vetrel into the win-side stack produce 2
living veterans on the win substrate — is answered NO on 16 runs/side
(+1, bar +3). Per the kill protocol the composition leaves zero trace:
no game-code changes existed to revert; the policy files
(scripts/policies/vetrel.js, seatdrive.js) are UNTOUCHED and remain
landed-but-uncomposed, exactly as before this arm. The arm's
deliverables are instruments + evidence (kept): sweep, lib, proof,
beat captures, sense transcript, per-seed JSONs.

What survives the kill: (a) the composition is PROVEN working —
gate-off byte-identical to the naked stack (proof C3, 4/4), markers
honest (C2), instrument neutral (C5), and the companion channel fires
8–0 on the win substrate with zero vetrel activity on control (C6);
(b) the sharpened question for the axis: veterans bind wave-4 (census),
the proven companion channel now runs ON the win stack, but the win
truncates the horizon the channel needs — the next move is a design
call, not another composition: loosen the 2-living-veteran demand
(Steve's call, per the standingCfg "sim starting point" comment), or
count veteran kills rather than living veterans (fiction consequences),
or accept that wave-4 is reached on the non-win path (the census's 1/34
unlock came from a control run that never sat). The scale-onramp axis
stays open; the rotation does not resume.

## Village assessment (plain words)

These are winning villages that never get to use their veterans. The
modal armed village: Emberhold/Stonebridge/Thornfield linked by ~day 30,
national by ~day 80, lesser seat at the day-90 floor, FEARED/light, win
the same day — 13/16 of them. The composition's hunts fire underneath
the courtship (179 vet hunts across 16 runs, 113 combat-ranked invites)
but the win arrives before the second killer is blooded. The exception
is belongseat-armed-s2601457: no seat, no win, 180 days of war —
Rahmat, Sanne, Meera, Tariq, Yuki, Ines bringing down the Anaconda
Empress (d52), Chorus Line (d54), Loud-Eyes (d71), the Landlord (d78),
the Loud Beast and four Choir Toads (d79), "Together. (The village
watches the broadcast. Nobody blinks.)" — and Cauã telling the fire
about Sanne the same evening. Four living veterans at once (maxVet=4),
the only time in 32 runs the readiness bar was satisfied.

Who died: the blooded. Leadseat-armed-s2601457's hold beat read "(1 of
2 veterans)" at d55 and "(0 of 2 veterans)" at d62; belongseat-armed-
s2931793's read 1 at d71, 0 at d78. The killer died between snapshots —
the exact mechanism the census diagnosed. The fiction is honest about
it: the village hears "blood your fighters" name the true bind, and
hears it fall back when the blood doesn't survive.

What was missing: horizon. Not gear (armor/weapons/tricks all
satisfiable), not the kill channel (8–0 companion kills), not wins
(13/16 armed — the stack wins fine). The two systems the arm composed
are each working; they are working on incompatible clocks. The win
ends the story the veterans need time to tell.

## Sense-testing (SENSE-TESTING LAW)

**1. belongseat-armed-s2601457 d50–79 (full transcript, the vet2 run).**
A village preparing for war, not a bot farm. The deliberate hunts read
as expeditions (d50: care packages, contests, the Auction — village
life continues around them). d52: "The Anaconda Empress falls." →
"📺 Rahmat, Sanne, Meera, Tariq, Yuki brought down The Anaconda Empress.
Together. (The village watches the broadcast. Nobody blinks.)" d54:
Chorus Line, same five names. d71: Loud-Eyes — now with Ines. d78: "You
catch Cauã telling the fire about Sanne. 'Sanne, Meera, Tariq, Yuki,
Ines brought down The Landlord. Together.' The story's already growing."
The readiness hold beats track the measured bar exactly: d54 "(0 of 2
veterans)", d61 "(1 of 2 veterans)". The companion-veteran story reads
as a village story — named people, a growing crew, the fire retelling
it. Full transcript:
evidence/2026-10-17/vetcompose-sense-belongseat-s2601457.txt.

**2. leadseat-armed-s2601457 (beat capture).** The veteran who died:
"(1 of 2 veterans)" at d55, "(0 of 2 veterans)" at d62 — and the hold
beat just says it, no eulogy, no fiction for the loss. The bar fell
back silently between two identical hold beats. The companion kill
(via='companion' in the waveKillLog) has NO broadcast beat — it
happened off-screen (companion agency, scholar not in the fight), but
it moved the ledger and the hold fiction. The village was told the
truth about the bar; it was not told about the death that moved it.

**3. belongseat-armed-s2931793 (beat capture).** Same shape: 1 at d71,
0 at d78. Armor climbed (2 of 4 → 3 of 4) while veterans flickered —
the co-binder (armor fragility from the census) visible in the same
beats. No broadcast for the off-screen companion kill.

Sense verdict: the veteran story reads as a village story when the
scholar fights alongside (broadcast, names, the fire retelling); when
the companion kills off-screen, the ledger moves but the village never
hears about it — the kill is real (veteran status accrues) but
narratively silent. And the hold beats name the bind honestly but don't
mourn the blooded who die between snapshots — a small fiction gap worth
a future beat ("we blooded one and lost them"), not this arm's call.

## Files

- scripts/vetcompose-lib-20261017.js — shared composition + instrument lib
- scripts/sweep-vetcompose-20261017.js — sweep (Game.won fix applied)
- scripts/test-vetcompose-20261017.js — proof (32/32 GREEN)
- scripts/fix-vetcompose-wins-20261017.js — one-time wins correction (with 1:1 sits/winline consistency assertion)
- evidence/2026-10-17/perseed-vetcompose/ — 32 per-seed JSONs (wins corrected)
- evidence/2026-10-17/vetcompose-beats/ — 32 beat captures
- evidence/2026-10-17/vetcompose-sense-belongseat-s2601457.txt — sense transcript
- evidence/2026-10-17/sim-vetcompose.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (composition-only arm;
  policies/ files untouched — killed arm leaves zero trace)
