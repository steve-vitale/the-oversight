# journey-endgame r49 (lane B) — DEFEND THE FIRST VETERAN (2026-10-24)

Leg 4 (endgame). Rotation-b 4 -> 5. Worktree journey2-endgame, branch
journey2-endgame, base 47d962743 (master tip at run start).

## Pre-registration (bound before the sweep)

Leg question: r48 named r49's question verbatim — a veteran-first road
that banks the kill BEFORE the announce, so the window is spent defending
a living killer, not making one. This run asks it with the tool built for
it: CAPABLE_VETGUARD=1 (scripts/policies/capable.js greedyWaits: once
waveCombatReadiness(5) counts >= 1 living veteran, greedy stops waiting
and sits at once). The window is spent defending by CLOSING it: a kill
banked before the announce is defended by a 0-day window; a kill banked
during deferral ends the deferral that day. The tradeoff is deliberate
and named: banking ONE veteran at the table vs pursuing the second the
wave-5 bar wants (demand veterans 2) — vetcommit keeps hunting for #2
until the sit, but the sit now comes first. If M3 GOes while M4 stays
NO-GO, the run has split defense from the bar's count, and the remaining
blocker is the count (2), not mortality.

Canon read first: docs/CANON.md, docs/TABLE.md (the table prices the
run, never gates on godhood; full seat = deed gate; overtime prices the
wait), docs/MONSTER-WAVES.md § readiness (standing opens the wave door,
combat readiness — armor/weapons/veterans — decides whether the village
walks through). Nothing invented; the vetguard rule is a player timing
rule of the same class as greedy deferral, and the living-veteran count
is the engine's own readiness-bar number.

Bindings (a miss is NO-GO, never re-scored mid-run):
- M1 GUARD (carried): >=3/4 seeds reach the window (announceDay != null)
  OR resolve via a voiced non-table path.
- M2 ARMORY ENGAGES (carried): >=2/3 waves seeds show >=1 armory
  donation (armory.donations >= 1).
- M3 LIVING VETERAN — THE DEFENSE TEST: >=1/3 waves seeds ends with
  >=1 LIVING veteran. Baseline r46/r47/r48: 0/3, 0/3, 0/3.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/3 waves seeds unlocks
  wave 5 OR earns the FULL seat. EXPECTED NO-GO on this road (one
  veteran != the bar's two) — still binding as written, not softened.
- M5 VOICING CANONICAL (carried): 88044 (forcedrift, capable substrate,
  sit-promptly, greedy OFF, armory OFF, vetguard OFF) — bandCrossings
  >= 1 AND noticedCount >= 1.
- M6 GUARD NAMED (r48 metric-review item 5, now scoped): every sat
  waves seed with deferDays >= 1 records a named window-end guard (not
  'unknown'). Same-day sits are reported as announce-day-fix
  verification, NOT scored into this binding — exactly the scope r48's
  metric review promised.
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

Instrument fixes carried from r48 metric review (both items):
- Item 5a: the guard snapshot now runs on the ANNOUNCE DAY itself (the
  probe detects the announce before snapshotting, not after the day's
  policy runs), so same-day sits get a guard entry.
- Item 5b: the snapshot mirrors the vetguard rule — a new
  'veteran-banked' decision, recorded when all other guards pass and a
  living veteran exists; the guard trace also carries the live veteran
  count per day (vets).
- Item 5c (found while building r49): the announce usually flips INSIDE
  the day's policy run (progression beats), so a pre-daily snapshot alone
  still misses flip-inside-the-day same-day sits. The probe now computes
  the pre-daily snapshot EVERY day and, when the announce is first
  detected post-daily, pushes a retroactive announce-day entry: the
  day-start sit guard when it already implied a sit (sit guards are
  stable-or-worsening intraday), else 'intraday' — named, not 'unknown',
  and never dressed up as a guard that was not there.

Substrate (PILOT, 4 seeds): r48's substrate exactly — capable base +
deed-seeking's deedPatrol + surgeUpkeep + fullseat-diag outside
everything + vetcommit on waves seeds only + CAPABLE_GREEDY=1 on waves
seeds only (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + ARMORYDRIVE=1
on waves seeds only — PLUS CAPABLE_VETGUARD=1 on waves seeds only.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), RELAYGREY=1 (forcedrift seed only),
TELEMETRY_FULL=1. 180d, death-aware. Seeds fresh 88041-88044 (verified
unused: no 88041-88044 in prior endgame notes or probes). Baseline:
r48's waves seeds (0/3 living veterans, 0/3 wave-5, 0/3 full seats,
armory 7/7/5, windows ended hp/losses/roster-unknown). Interesting-
finding bar: a living veteran at the table; a 'veteran-banked'
window-end guard; a same-day sit with a NAMED guard (the announce-day
fix working); OR kills landing with vetguard never firing (the road
measures nothing — say so).

Instrument: scripts/probe-endgame-r49-20261024.js (r48 probe + vetguard
gate + announce-day snapshot + retroactive entry + vets per day),
scripts/analyze-endgame-r49-20261024.js (M1–M6 + REG + vetguard trace),
scripts/policies/capable.js (VETGUARD rule, env-gated, default off),
scripts/test-vetguard-20261024.js (proof, 9/9).
Gates: PILOT (88041, 180d, full sweep mode on one seed) then sweep;
DET (instrument-on twice, 2x120d, seed 88041); FID (env unset: wrapped ==
pure capable+deedhunt, mini gameDays/won/alive/pantry).

## RESULTS (4/4 seeds)

- **M1 GUARD: GO 4/4** — 88041 announced d170, 88042 d90, 88043 d90,
  88044 d90. All four won lesser seats (88041 witness/light, 88042
  feared/light, 88043 relay/grey, 88044 relay/dark). Final choices
  resolved 4/4.
- **M2 ARMORY ENGAGES: GO 3/3** — waves donations 6/2/4 (craft-donations
  0/1/0, donated bonus +194/+40/+75). The layer arms fighters on every
  waves seed; the control correctly shows 0 (armory OFF).
- **M3 LIVING VETERAN — THE DEFENSE TEST: NO-GO (binding) 0/3** — no
  waves seed ends with a living veteran. w4+ kills: 88041 0, 88042 0,
  88043 0. Committed vet fight decisions: 23/41/2, DPS-race bails 0 on
  all three. Vetguard NEVER FIRED: every guard-trace day on every waves
  seed reads v0 — there was no kill to defend. The rule is proven sound
  (unit proof 9/9) but unexercised: the sweep produced zero wave-4+
  kills at all, so the defense question could not engage. This is NOT
  a vetguard failure — it is an upstream finding (see below).
- **M4 WAVE-5 OPEN / FULL-SEAT: NO-GO (binding, expected) 0/3** — 0/3
  wave-5 unlocks, 0/3 full seats. The component reach table is the whole
  story: on ALL FOUR seeds the ONLY full-seat blocker is w5 (0/2) —
  every other bar is met (w1/w2/w3/w4, contests, crises, stage,
  foodDeeds). The chain is fully visible: veterans 0 → wave-5 locked
  → w5 deeds 0 → full seat blocked. Nothing else stands in the way.
- **M5 VOICING CANONICAL: GO 1/1** — 88044: bandCrossings=1,
  noticed=1. The control still fires on the capable substrate,
  sit-promptly, greedy OFF, armory OFF, vetguard OFF.
- **M6 GUARD NAMED (deferred scope): GO 1/1** — the only deferred sat
  waves seed (88043, 16d) ends on 'losses', named. Same-day sits are
  ALSO named this run (fix verification, not scored): 88041 'horizon'
  (announced d170, past LASTDAY 145), 88042 'roster' (4-person village
  at the announce). r48's 'unknown' class is closed on both instances:
  the announce-day snapshot + retroactive entry work. The 88044 control
  (1d deferral) ends on 'not-ready:Finish the current encounter
  before taking your seat' — the table cannot be taken mid-encounter,
  same class as r48's 88032 not-ready days.
- **M7 PEOPLE: GO** — 4 beats sense-read in full (below), 0 senseless
  flags.
- **REG r35: GO 4/4** — audit names w4/w5 aloud on all sat seeds with
  nonzero w4/w5. **REG r37: GO 4/4** — satPenalty records present, no
  voiced-line mismatch.
- **PRIMARY: NO-GO** (M3/M4 binding). **ALL: NO-GO.**

## WHY ZERO KILLS — THE UPSTREAM FINDING (read before the next run)

r49's headline (0 living veterans) hides a sharper fact: there were no
kills to evaporate. r46–r48's evaporation law (a kill lands, then its
killer dies before the sit) could not engage because this seed set
produced zero wave-4+ kills in the first place. Three mechanisms, all
visible in the transcripts and the engine:

1. **Wave-4 encounters resolve by TALK, not by killing.** On 88043 the
   bearer met The Algorithm, The Congregation, and The Reunion — all
   wave 4 — and talked each one down with Walk In ("You walk in
   open-handed, talking — low, steady, unafraid. And impossibly, they
   listen. They stand down. ... It got away. No meat, no trophy").
   The capable road's peacemaker tools end wave-4 encounters without a
   kill. A road that wants veterans must decide whether to fight these
   encounters to the death — that is a real road choice, and it has a
   price (the talk-downs also banked trick sightings 1/2 each).
2. **The bearer's kills were all wave ≤2.** 88043's d96 Big Big kill
   (heron, "Fishy. Obviously."), Big-Eyes (wolf), Night Court (owl),
   Loud Beast (tick, wave 2) — the party's real kills land on low-wave
   beasts. "Big Big" and "Big-Eyes" are villager-given NAMES (the naming
   debate: "Nina is calling it 'Big Big.'"), not wave-4 monsters — the
   audit's war path says FACED, not killed, and the ledger agrees
   (w4plusKills 0). Do not read villager names as wave numbers.
3. **Companion damage is single digits vs 850–1500 HP pools.** In the
   d96 Big Big fight, companions hit for 4–8 per strike while the
   bearer's Dead Aim finisher lands 210. The armory's weapons (bonus
   +194 across 88041's donations) do not close that gap — r48's named
   lever (companion damage output vs wave-4 HP pools) is still the
   binding constraint on the fight side, and vetcommit's committed
   decisions (23/41/2) convert at 0 with 0 DPS-race bails: the fights
   are not bailing on conviction, they are ending another way
   (talk-downs, flights, retreats — the current instrument counts
   decisions, not outcomes).

Named next work (r50, instrument first): a fight-outcome census for
committed wave-4 fights — vKill / mFlee / vFlee / vDie per fight, not
per turn — so the run can say HOW wave-4 fights end; then, on the same
substrate, a FIGHT-DON'T-TALK variant that declines Walk In on wave-4
encounters (single variable vs r49) to test whether fighting to the
death converts encounters to kills, and what it costs. Vetguard stays
in the substrate: the day a kill lands, it is the rule that defends it.

## VILLAGE ASSESSMENT (plain words)

- **88041 — Álvaro Sullca's village, 3 alive, pantry 7,700, regional.**
  Samuel Domingo, Álvaro, Sergio Villa. A late village: the table
  waited until day 170, past the deferral horizon, so it sat at once on
  the horizon guard. Armed itself (6 donations) for a wave-4 fight that
  never became a kill. Won witness anyway — the trial of the judges,
  "Offer them a way back," and the Oversight coda.
- **88042 — Chantal Mukendi's village, 2 alive, pantry 8,649,
  regional.** James Okonkwo and Chantal. The two-person village: too
  small to wait (roster guard), so it sat at once and won feared on
  the spot — "Pledge the terror," plus the architect beat (James
  ascended through doors the village built). Seven wave-4 types faced,
  zero killed.
- **88043 — Nathan Lee's village, 4 alive, pantry 10,062, global.**
  Nathan, Yara Haddad, Vasyl Shevchenko, Naz Pasa. The window village:
  16 days of waiting, overtime tiers voiced twice (×1, ×2), three
  deaths during the wait (Zoltan d92, Kwame d100 in the Blood Tithe,
  Matilda d105), sat on the losses guard with the audit pricing it
  exactly ("2 weeks kept waiting, 3 of Haven lost meanwhile. Every
  door's standing −17"). Won relay/grey, both-hands — the machine
  learned grief and totality from the village and accepted an unclean
  answer.
- **88044 — Marcus Webb's village, 5 alive, pantry 24,017, global.**
  The fat control village: five people, a huge pantry, a dark relay
  road that sat a day after the announce (mid-encounter not-ready
  day). The pods opened like a barracks, the village went quiet, and
  the merge completed anyway ("Power immense. Self eroded.").
- (Census lists survivors; the fallen ledger prints alongside the
  living. The fallen carry names, days, and causes — arena, contest,
  monster, sickness, starvation, wounds — and the ledger is how the
  run's deaths stay countable.)

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The priced wait + both-hands win (88043, full 2,177-line window).**
   The table wants its price; the village wants to wait; overtime
   wants its RERUNS (tier lines voiced twice over, −7 then −14 — the
   spoken running penalties; the final audit penalty −17 is tier 2×4 +
   losses 3×3, matching the live penalty math). The wait costs real people (Kwame's fourth measure in the
   Blood Tithe — "There is no fourth measure" — and the mantle passing
   to Nathan Lee mid-window, with the village having to earn the new
   face), and the finale resolves (both-hands: the machine accepts an
   unclean answer) and owes (the same Oversight coda, the pods still
   napping). 0 senseless flags.
2. **The dark merge (88044, full 112-line window).** The relay wants
   integration; the System offers the pods ("children adapt SO
   fast... You were already thinking it."); the village answers with
   silence ("The village has never been this quiet."); the merge
   completes ("Power immense. Self eroded.") and Marcus Webb's
   ascension closes it. Villagers act like people throughout: Derya
   leaves the harvest standing because the pantry can't take more,
   Colleen whispers about food left out that Wren won't admit to,
   Owen asks to talk "like people used to." 0 senseless flags.
3. **The late witness win (88041, full 159-line window).** The audit is
   honest about the gap (wave-4 bar: veterans 0/1; wave-5 bar: armor
   3/4, veterans 0/2) and the finale still resolves (the trial of the
   judges, "Offer them a way back") and owes (the Oversight coda).
   The System's caretaking lesson ("THE CLOSED DOOR IS THE CARETAKING
   ... I WILL PRACTICE LOSING THINGS I NEVER HAD") is the kind of
   beat that only works if the village taught it. 0 senseless flags.
4. **The two-person feared win (88042, full 42-line window).** A village
   of two sits at once and wins feared on restraint ("the most
   frightening thing in the room"), and the architect beat fires
   honestly (James ascended through doors the village built — the
   village is remembered as the builder, not the hero). 0 senseless
   flags.
- Announce-day guard fix (r48 metric-review item 5) DELIVERED on both
  instances: 88041's horizon guard and 88042's roster guard are both
  recorded on their same-day sits — no 'unknown' anywhere in the run.

## BLANKS

- Filled (instrument, r48 metric-review item 5 in full): the guard
  trace now covers the announce day itself (early detection +
  retroactive entry for flip-inside-the-day announces), records the
  vetguard decision ('veteran-banked') and the live veteran count per
  day (vets) — and the sweep proves it: 0 'unknown' guards in 4/4
  windows, including two same-day sits.
- Filled (policy, new): CAPABLE_VETGUARD — the sit-on-first-veteran
  rule, env-gated, default off, proof 9/9. It is proven sound and
  unexercised: no kill existed to defend. It stays in the substrate
  for the run that banks a kill.
- Documented, not filled (instrument gap, r50's work): the probe counts
  committed wave-4 fight DECISIONS, not fight OUTCOMES. A 0-kill result
  cannot yet say whether fights end in monster flight, party retreat,
  talk-down, or death. The fight-outcome census (vKill/mFlee/vFlee/
  vDie per fight) is the named next instrument.
- Documented, not filled (road question, r50's candidate): whether a
  veteran-first road should FIGHT wave-4 encounters to the death
  instead of talking them down (decline Walk In on wave-4, single
  variable vs r49) — and what that costs in blood, trust, and the
  trick sightings the talk-downs bank.
- Documented, not filled (Steve-call territory, carried): whether the
  full seat is MEANT to require banking living veterans through a
  mortality-heavy endgame. r49 adds a prior question: on this seed
  set, no wave-4 kill exists at all — the bar's count (2) is downstream
  of a conversion problem (talk-downs + companion damage vs HP
  pools), not just a defense problem.
- No src/js changes (kill discipline: the finding is about roads,
  bars, guards, and fight outcomes, not broken code — greedy, overtime,
  the armory, vetcommit, and the audit all work exactly as canon
  describes, and the table voices all of it).

## Metric review (§14)

1. **M1's restatement held again** — 4/4 announced, 0 non-table
   resolutions needed. Keep the restated form.
2. **M2 is still the armory gate, and it held** — donations 6/2/4, so
   the run measured an armed road, not an absent layer. Keep.
3. **M3's 0/3 is a different finding than r46–r48's 0/3** — those runs
   had kills that evaporated; this run had NO kills at all. The metric
   measured exactly what it should (living veterans at end), and the
   distinction matters: do not re-score 0 kills as "almost" — the bar
   counts LIVING killers, and there was no killer, living or dead.
4. **M4's 0/3 is expected on this road and still binding** — one
   veteran would not have opened wave 5 anyway (demand 2). The
   component table shows w5 as the SOLE blocker on all four seeds:
   the road is one mechanism (conversion) away from the full seat on
   every other bar, not several.
5. **M5's substrate rule held** — control fired on capable,
   sit-promptly, greedy OFF, armory OFF, vetguard OFF (1/1). Keep the
   control clean.
6. **M6's deferred scope held (1/1) AND the same-day fix verified
   (2/2 named)** — the scope change from r48's review is honored
   (binding counts deferred seeds only) while the fix is reported
   separately, not re-scored into the binding. Both halves of r48
   item 5 are now closed.
7. **Telemetry deviation check:** run below.
8. **Balanced panel (§15):** no panel comparison applies — the only
   behavior change is the env-gated vetguard rule (default off), and
   no src/js changes. The comparison is r48→r49 via identical
   substrate plus the vetguard layer, and the leg's own analyzer (the
   leg's instrument, per r44–r49 precedent), not a panel re-run. The
   FID proof (wrapped == pure capable+deedhunt, byte-identical mini)
   is the default-off evidence.

## Regressions / checks

- PILOT (88041, 180d, sweep mode): pipeline end-to-end; armory
  engaged (6 donations), window ended on the horizon guard, transcript
  sliced from the announce day.
- SMOKE-equivalent: covered by the pilot (stronger than 120d).
- DET (instrument-on twice, 2x120d, seed 88041): GREEN byte-identical
  (exit 0; the DET branch exits 1 on any difference).
- FID (env unset: wrapped == pure capable+deedhunt, mini gameDays/won/
  alive/pantry): GREEN byte-identical (122d, won false, alive 3,
  pantry 1000 both sides).
- VETGUARD proof (scripts/test-vetguard-20261024.js): 9/9 pass —
  sits on 1 and 2 veterans, waits with 0 veterans, waits with the gate
  off, key/losses/roster guards still sit first, read error waits.
- Existing suites: check.js --quick — 279 passed, 8 failed in 1609s
  (recovery run 2026-10-24, worktree at r49 files). r48's baseline was
  280/7, so this is one net-new failing suite; the run's tail output
  retained only two failing suites (test-phone-frame-proof, 3 legs;
  test-parity-20261014, 1 leg on gear spear/jacket), and BOTH reproduce
  identically on the clean master tip with no r49 files — pre-existing,
  unrelated to this run (r49 touches no src/js). The full 8-suite list
  was not retained from the tail output; the delta suite is
  unidentified but cannot be an r49 game-code regression (no src/js
  changed, vetguard proof 9/9 green).
- Policy change: scripts/policies/capable.js (VETGUARD rule, additive,
  env-gated, default off). Tooling: probe-endgame-r49-20261024.js,
  analyze-endgame-r49-20261024.js (new), test-vetguard-20261024.js
  (new). No src/js changes.

## Telemetry deviation check (2026-10-24)

- LOUD: maxTier swung -87% (baseline 16 -> current 2, n=4 files).
  LOUD: satPenalty.penalty swung -81% (baseline 91 -> current 17, n=4).
- VERDICT: EXPLAINED, not a behavior change — the same LOUD lines as
  r48, for the same reason. The baseline was seeded on long-deferral
  sits (r37: 38 days, tier 6, penalty 91) — a different population
  from r49's guard-ended windows (max tier 2, max penalty 17: two
  same-day sits at tier 0/penalty 0, one 16-day deferral at tier 2/
  penalty 17, one 1-day control at tier 0/penalty 0). Baseline NOT
  rolled — it still describes sitting runs that wait out the clock,
  and rolling it would erase that reference.

## Evidence

- evidence/2026-10-24/journey-endgame-r49.md (this note)
- evidence/2026-10-24/perseed-endgame-r49/endgame-r49-{88041..88044}.json
- evidence/2026-10-24/perseed-endgame-r49/endgame-r49-{88041..88044}-transcript.txt
- scripts/probe-endgame-r49-20261024.js
- scripts/analyze-endgame-r49-20261024.js
- scripts/policies/capable.js (VETGUARD rule)
- scripts/test-vetguard-20261024.js
