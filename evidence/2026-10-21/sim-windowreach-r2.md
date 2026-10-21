# sim-windowreach-r2 — post-unlock-window diagnostic (run fleshout-20261021T0730Z, axis scale-onramp)

Arm: sim-windowreach-r2 (DIAG-GO candidate). Re-derives the dead run's
sim-windowreach arm (worker died pre-sweep; pre-registration survives, code
lost). Instrument-only: ZERO src/js changes, ZERO scripts/policies changes.

Question (backlogs #741/#748/#737): wave-5 UNLOCK is not wave-5 REACH.
sim-vgearconfirm proved the veteran channel fires on the VGEAR=1 winning
substrate (2/16 armed seeds reach w5vetsMax≥2, 1 wave-5 unlock, GO);
sim-w5gates decomposed the unlock gate (16/16 attributed, GO). The one
measured unlock (belongfeast s64406, d97) died d170 in the window — the unlock
did not save the village. This arm measures what happens IN the post-unlock
window on the winning substrate.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15)

**PRIMARY (DIAG-GO):** attribution completeness on unlocking runs — 100% of
wave-4+ engagements AND wave-5 engagements attributed with 0 unexplained
outcomes; 0 instrumentErrors. Definitions: attributed = known mid +
resolvable wave (from data) + taxonomy shape + (captured fight-id joined to a
kill record OR explicit unresolved reason: fled/aborted/unrecorded). Wave-5
kill attributed = day + mid + resolvable wave + killer + via. Unexplained =
unresolvable wave OR engagement without fight-id AND without day+mid fallback
kill match. instrumentErrors = any entry in the instrument's error sink.

**GO:** every unlocking run 100% attributed, 0 unexplained, 0
instrumentErrors.
**Minimum:** ≥2 unlocking runs. Below 2 = insufficient-data: report-only, NOT
a failure (diagnostic, no lever killed).
**Unit:** the run (32 runs). No baseline-vs-variant contrast — diagnostic arm,
not a lever confirm.
**SECONDARY (report, don't judge):** wall numbers (national/table/wins,
wave-4/5 unlocks, median/max survival, exiled); was wave-5 content actually
FOUGHT (fights, by whom, outcomes)? deaths by mechanism in the post-unlock
window? window survival days? did the unlock change the village's fate?
SENSE-TESTING on post-unlock window transcripts (narration-live re-runs of
unlocking runs — never the silenced sweep capture).
**Horizon:** 180d death-aware (+10d tail max). The door opens ~d75–d97 on this
substrate; wins truncate ~d90–130.
**Seeds:** 16 FRESH seeds 64851–64866 (verified unused 2026-10-21) ×
{leadfeast, belongfeast} = 32 runs.
**Policies:** VCE.armedFor (VGEAR=1 winning substrate stack,
scripts/policies/vgearconfirm.js, pinned). Armed only; no control
(diagnostic).
**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 VGEAR=1 KILLDISC=1 (asserted up front; SUCCGRACE/RAIDDENSITY/
NODEWITNESS/FULLSEAT unset). Sweep FAILS LOUD unless env matches exactly.
**§15 note:** no before/after comparison — diagnostic with no intervention and
no control arm (§15 panel is for lever before/after; same unit note as
sim-w5gates).

## Instrument design

`scripts/windowreach-instrument-20261021.js` — the post-unlock-window
observation layer, installed ON TOP of the killdisc v2 base
(`scripts/killdisc-instrument-20261021.js`, on master, proven
non-perturbing). install(Game, t) calls the killdisc install first, then
wraps Game.sleep a second time (outer) to capture the daily window trace.
All reads pure: villageStanding().total (raw), standingPlentyCappedTotal()
(capped), unlockedWave(), waveEngaged(4/5), waveCombatReadiness(4/5) bars,
roster via Game.getPerson(id).dead. The game's one-way peak
(state._standingPeakWave) is a WAVE number, so "peak" is the
instrument-observed max of raw/capped across the trace, tracked in the trace
object itself — never written to Game.state. The beat-firing
villageStandingTotal() is deliberately NEVER called (substrate update vs the
0515Z pre-registration, which built on killdisc v1; v2 is on master now).

Window entry: {day, uw, prevUw, unlocked, raw, capped, peakRaw, peakCapped,
r4, r5, w4faced, w5faced, veterans5, living, dead, rosterUnknown,
scholarAlive}. Unlock detection = first trace day the door is seen open at
wave w. r5.veterans = living wave-4+ killers (the VGEAR veteran channel
read). The sweep performs the fight-id joins in-process (fight ids contain
Date.now and are never persisted); the analyzer
(`scripts/windowreach-analyze-20261021.js`) works purely from the JSONs +
src/data/monsters.json.

Proof: `scripts/test-windowreach-20261021.js` — E0 shape; E1 det-gate
(instrument-on vs off byte-identical on the armed substrate, 2 seeds × 60d);
E2 RED→GREEN on synthetic fixtures (unlock-day detection, engagement/kill
join, outcome taxonomy); E3 read-only static scan of both instrument sources;
E4 armed+instrument determinism; D2 180d armed run completes + deterministic
re-run. Gates all GREEN before the sweep.

## Results

Sweep: 32/32 runs completed, 0 errors, 0 instrumentErrors across the whole
corpus. Seeds 64851–64866 × {leadfeast, belongfeast}, 180d death-aware, exact
substrate env. Corpus: `evidence/2026-10-21/perseed-windowreach-r2/`.

### PRIMARY — insufficient-data (report-only)

**1/32 runs unlocked wave-5** (belongfeast s64858, unlock d81) — below the
pre-registered minimum of ≥2. Per the pre-registration: report-only, NOT a
failure, no lever judged. The instrument itself is proven healthy: across all
32 runs, **364 wave-4+ census units (engagements + field fights + wave-5
kills) — 0 unexplained, 0 instrumentErrors**. Attribution classes observed:
outcome-join 79, kill-join 25, aborted (TB-REFUSED) 168, field outcomes
evade/vDie/vFlee 92.

The single unlocking run: 3/3 wave-4 engagements attributed (kill-join),
1/1 wave-5 field fight attributed (outcome:evade), 0 wave-5 kills, 0
instrumentErrors — 100% attributed on the letter, but n=1, so report-only.

### SECONDARY (report, don't judge)

**Wall numbers (32 runs):** national 22/32 · table 26/32 · wins 22/32 ·
wave-4 unlocks 26/32 · **wave-5 unlocks 1/32** · median survival 90d · max
181d · endReasons over-other 22 / village-lost 9 / survived 1. Death causes
led by combat 617 + villager combat 234 + monster 59 (sickness 26,
starvation 13 — the winning substrate eats).

Note vs sim-w5gates (same day, 0/16 wins): that arm ran WITHOUT the win-side
layers (WINPURSUIT/WINDEFER/SEATDRIVE); this arm's pinned substrate includes
them, and the table reach converts to wins. Not a discrepancy — the win
stack doing its job.

**The unlocking run (belongfeast s64858)** — the door opened d81 and the
village WON d90 (THE FEARED path, light road):
- Unlock state: raw 260 / capped 200 (plenty cap exactly met), 2 living
  veterans, r5 bars armored 8/4 · armed 10/6 · tricks 17/3 · veterans 2/2
  (ready), 3 wave-4 types faced, 10 living / 0 dead.
- Wave-5 fought? Once: villager diana_osei met a **timeslot** (a Producer)
  on d87 and **evaded** (0 rounds). No scholar TB fight with a Producer, no
  wave-5 kills. The village walked through the door without fighting what
  was behind it.
- Window deaths (d81–d90): 8, all monster combat — understudy, strike,
  sweeps_week, chorus_line ×2, alien_tick, heckler, buffering (waves 1–3
  monsters, never Producers). "villager combat" 9 total across the run.
- Did the unlock change the village's fate? No — the village was already
  national-bound with the table waiting; the door opened 9 days before a
  scheduled win. Of the three measured wave-5 unlocks on this substrate
  family (vgearconfirm s64703 won d90 no wave-5 faced; w5gates s64406 died
  d170 in the window; this one won d90), two won through the window and one
  died in it. The pattern: **the wave-5 door is a lagging indicator of a
  village about to win, not a new survival test** — it opens at capped 200
  on villages whose win is already staged.

**SENSE-TESTING judgment (narration-live re-run, windowreach-sense):**
the unlock beat lands honestly on d81 ("You've gotten too big for the story.
Ratings are GREAT, by the way — but you're threatening the narrative now.
So the narrative is fighting back. Meet the PRODUCERS.") — same beat as a
Gauntlet win, which reads right for a village peaking. The Herald titan acts
IN THE WORLD on d83 (struck The Bloodied III in the night — coalition
warfare, never a duel), Hank of The Bloodied II's food ask goes unanswered
on d87 (real social consequence, remembered). The d90 table sequence voices
the full win — audit, ABILITY beat naming the Nielsen, THE FEARED path with
"Look what eating built," and "You won. Say it plainly: you won." The window
reads as coherent fiction: wave-5 arrives as narrative escalation on a
village at its peak, not as a survival wall. The audit fiction's wave-4/5
deed silence (finding #738) is audible here too — the audit cites waves
1–3 faced (14/8/4) and never the wave-4 deeds that opened the door.

**The Herald titan (out-of-arm observation → findings #749):** 163 of the
168 TB-REFUSED engagements are the Herald — the wave-4 tutorial titan,
whose canon is "no solo fights — hard gate, not a stat check"
(titans.js:3). Zero herald kills, zero started herald engagements: the gate
holds perfectly. The other 8 wave-4 monsters are fought and killed normally
(104 started TB engagements, 25 kills: congregation 10, strike 7, audit 3,
suburb 2, reunion/eulogy/influencer 1). The scholar-side wave-4 census is
dominated by titan refusals; villager field fights (91) show the village
fighting the rest. Not a bug — but it quantifies why "wave-4 engagements"
look inflated in any census that doesn't split the titan class.

### Metric review

The pre-registered minimum (≥2 unlocking runs) missed because the wave-5
unlock rate on the winning substrate is ~3% (1/32) and wins truncate runs at
~d90 before the door (d75–97) can open — the same truncation that already
killed the s64703 measurement. The miss is a SAMPLE-SIZE question, not an
instrument question (364/364 attributed, 0 errors). Revision for the next
run: pre-screen seeds on a known-unlocking set (s64406, s64703, s64858 are
three measured unlocks now) or run a post-win-continuation / no-win policy
per finding #748, instead of hoping fresh seeds unlock.

### Convergence

**Converging.** The instrument is proven (det-gate green, 0 errors on 32
runs, full attribution on the only unlocking run). The window is measured
once: the door opens on a winning village and the village wins through it
without fighting wave-5. DIAG-GO on the letter needs ≥2 unlocking runs;
recommend the next arm claim #748 with a pre-screened unlocking seed set.

## Proof gates (all GREEN before the sweep)

`scripts/test-windowreach-20261021.js`: E0 shape (7) · E1 det-gate (7, armed
substrate, 2 seeds × 60d, noinstr stability pre-check) · E2 RED→GREEN on
synthetic fixtures (18: unlock-day detection, engagement/kill join, outcome
taxonomy; RED cases fire on unresolvable-wave / no-fight-id-no-kill-match /
unresolved-outcome / missing-killer) · E3 read-only static scan of both
instrument sources · E4+D2 180d armed run + deterministic re-run.
41 passed, 0 failed. (One mid-proof fix: attributeKill read k.day while the
sweep writes d — caught by the RED fixture, fixed in the analyzer, full
re-run green.)
