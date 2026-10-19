# sim-posttable — post-table mortality attribution diagnostic (flesh-out loop, 2026-10-19, ARM sim-posttable)

Run: fleshout-20261019T1415Z, arm sim-posttable. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only. Zero file overlap with sibling arms: scripts/*posttable*,
scripts/test-posttable*, evidence/2026-10-19/sim-posttable* only.

Canon: docs/CANON.md. No canon doc covers the table's internal state machine — the
win-side flow (tableWaiting → tableAnnounce → tableTakeSeat → tableScene → paths →
challenge → finals → won) is read from src/js/table.js, ledger.js, progression.js
directly, and cited below. The win-flag requirement ("what the win flag requires") is
code-derived: a table path's final resolution (tableResolveFinal / tableResolveDemandPrice /
rock-bottom comfort) sets this.over=true; this.won=true, gated by winDayFloorOk() (day ≥ 90).
Sanctity (tableActive, Steve 2026-10-12): while the table sits, ambient monster pressure
is suspended; all stakes during the finale come from the table itself.

Named blank (sim-armory out-of-arm finding #3, 2026-10-19): villages reach national
~29/32 and the table ~15/16 on the pre-seat full win-side stack, but WINS 0/32 —
32/32 villages die. The table entry does not stop the dying. This blank has never been
diagnosed: does the table ever sit on this substrate (SEATDRIVE=0: no policy calls
tableTakeSeat), what the post-table-entry death vectors are, and what win-side state
sat unmet at each death.

Substrate (this arm): the windowsurvive pre-seat substrate — policy
`withSeatDrive(withWinDefer(TF base))` on {leadfeast, belongfeast} tribfloor bases,
SEATDRIVE=0 (pure delegation — the seat-taking driver stays off; this is the PRE-SEAT
substrate), env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 (KILLDISC instrument: the existing
scripts/killdisc-instrument-20261018.js, read-only, reused — no new layer). No VETREL,
no REPOSITION.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (diagnostic GO):** ≥12/16 table-reaching runs fully attributed to a named
mechanism with day-exact state (0 unattributed). "Table-reaching" = pg.tableWaiting
ever true (the invitation). If fewer than 12/16 reach the table, attribute what you
have and judge DIAG-GO/NO-GO on the attributed set with the shortfall named LOUD.

**DIAGNOSTIC MISS:** any attributed-set death unattributable (unattributed > 0 on
table-reaching runs) or the table-state trace unreadable (no phase/trace data). A
miss is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating; runDays handles this —
the honest surface for a post-table mortality question).

**Seeds:** 8 FRESH 64201–64208 (verified: zero filename/content hits in scripts/ and
evidence/2026-10-19 before the sweep) × {leadfeast, belongfeast} = 16 runs.

**Instrument:** scripts/probe-posttable-20261019.js (death capture with the vetwindow/
windowsurvive-identical channel classifier + death-time state snapshots; daily table
telemetry: tableWaiting/tableDone/tableSittingId/T.phase/T.path/T.branch/T.beat/
T.seat/T.winDeferred/winDayFloorOk()/tableActive(); KILLDISC read-only instrument
reused; DET gate pins instrument-on vs instrument-off byte-identical),
scripts/analyze-posttable-20261019.js (post-table attribution + taxonomy + corpus
summary writer), scripts/posttable-transcripts-20261019.js (SAY-line probe with
sysSay restored), scripts/test-posttable-20261019.js (proof: SMOKE, DET, classifier
parity fixtures, table-telemetry fidelity, attribution completeness).

**Table-outcome taxonomy (pre-registered):** for every table-reaching run — invitation
day; did the table ever SIT (tableSittingId>0); withdrawn-vs-never-sat distinction
(tableWaiting→false with sitting==0); phase trace (paths→challenge→finals→done);
table-active days; days from invitation to death ("day-after-table" index).

**Post-table death taxonomy (pre-registered):** deaths with day ≥ invitation day, with
the vetwindow-identical classifier (channel + rule), killer-wave join (the
windowsurvive fightStarts pattern), day-after-table index, and state at death
(pantry, roster, succession count, table phase at death, floor-ok).

**Win-state at death (pre-registered):** what the win flag requires (a table path's
final resolution + day ≥ 90) and what state sat unmet at each run's death
(T.phase, T.path, T.beat, T.seat, winDeferred, floor-ok, tableActive).

**§15:** the sweep runs through scripts/balance-panel.js as the describe-the-sweep
instrument (leadfeast vs belongfeast compare, descriptive); the compare .md is
attached. The panel is the instrument, the pre-registered DIAG-GO threshold is the
judge.

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

16/16 runs, 0 bad files, 0 instrument errors. 12/16 reached the table; the table
sat on **0/16** runs. Wall: national 10/16, table 12/16, wins 0/16, wave-4 11/16,
wave-5 0/16, median survival 110d, max 182d. End reasons: 14 village-lost,
2 survived.

**Verdict: DIAG-GO.** 12/12 table-reaching runs fully attributed to a named
mechanism with day-exact state (0 unattributed). The primary bar (≥12/16
table-reaching fully attributed) is met exactly — 12 reached, 12 attributed.

### The named mechanism: the table never sits, and OVERTIME starts the clock

On the pre-seat substrate (SEATDRIVE=0) no policy calls `Game.tableTakeSeat()`,
so the table NEVER sits: 12/12 table outcomes are `invitation-only`, phases
trace empty, tableActiveDays 0/12, withdrawals 0/12 (the invitation sits pending
until the village dies or survives the horizon — it never withdraws).

The invitation is not inert. Once the Table exists for the player (announced,
day 90+, seat not none) and the seat is not taken, **OVERTIME** ticks every 7
days to tier 6 (src/js/overtime.js, Steve 2026-10-14: "waiting should have a
cost"): wave-4/5 fights become RERUNS (+25% HP / +12% damage per tier, pack size
stacks), raids come sooner and more often, lingering raiders gorge harder, the
seat price drops per tier. The tier never falls; a withdrawn seat pauses the
clock, it does not reset it; tableDone stops the clock — but nothing stops the
clock on this substrate, because nobody sits.

The transcript beats say it aloud: "◈ OVERTIME ×1 — wave 4–5 monsters return as
RERUNS (+25% HP, +12% damage). Raids come sooner. ... Take your seat from Haven
to stop the clock." (d97, d104, d111, d118, d125, d132 — ×6 by d132.)

### Post-table death taxonomy (114 deaths, 0 unattributed — diagnostic bar met)

- WHO: scholar successions 72, villager attrition 42 — the scholar dies more
  than the village (63%, matching windowsurvive's 58%).
- WHERE (vetwindow-identical classifier): raid 61 (53.5%), wild 38, other 7,
  haven 4, expedition 3, disease 1. Raids are the #1 post-table killer.
- WHAT (killer-wave join): wave-4 57 (50%), wave-3 24, wave-1 15, wave-2 4,
  wave-5 2, unmapped 12. Wave-4+ = 59/114 (51.8%) — the overtime RERUN tier
  is wave-4/5 by design.
- WHEN: median day-after-table 33d; mean inter-death gap 2–9.5d (clustered
  scholar successions); daysPostTable up to 126d (belongfeast-s64204:
  invited d45, died d171).
- STATE at death (means): pantry 17,407 kcal, roster shrinking run-over-run
  (end rosters 0–8 on died runs), hungry streak 0 at most deaths. They die
  rich fighting — the pantry collapses only at the very end (10/14 died runs
  end with pantry ≤ 1,400; the rump starves after the fighters are gone).

### The death rate DOUBLES after table entry

Pre-table: 0.080 deaths/day (70 deaths / 879 days). Post-table: 0.157
deaths/day (114 deaths / 725 days). **Ratio 1.97x.** The table entry does not
stop the dying — on the pre-seat substrate it accelerates it. The "wall
numbers" (national 10/16, table 12/16) move while the village bleeds out under
an escalating overtime clock.

### Win-state at death (what the win flag requires, what sat unmet)

The win flag requires: a table path's final resolution (tableResolveFinal /
tableResolveDemandPrice / rock-bottom comfort) with day ≥ 90 (winDayFloorOk).
At every table-reaching death: seat-never-taken (12/12), table-never-completed
(12/12); day-90-floor-unmet-at-invite on 8/12 (the invitation came pre-90 —
the win-day floor was already a deferral at entry). The 4 no-table runs:
no-invitation. The 2 survivors: invitation-only, unmet at horizon the same two.

### §15 balanced panel (the instrument; the DIAG-GO bar is the judge)

`evidence/2026-10-19/posttable-panel.md` — self-compare of the single
diagnostic corpus (no lever exists to compare; the only valid panel compare
is corpus→corpus): decision valid, all paired metrics no_material_signal,
win rate descriptive (0/16), table invitation 0.625, national 0.75,
community loss 0.75. (First attempt built leadfeast→belongfeast panels and
came back invalid — the scorecard requires matched case spaces; corrected to
the self-compare and documented in build-posttable-panels.js.)

## Metric review

The pre-registered diagnostic bar (≥12/16 table-reaching runs fully
attributed with day-exact state, 0 unattributed) is met exactly: 12 reached,
12/12 attributed, 0 unattributed deaths. No re-score — the instrument did
what it was built to do.

**§14 honest metric doubts — for the NEXT run, not this one (the bar is met
and the DIAG-GO verdict stands):**
1. **"Table reach" measured tableWaiting, not the sitting.** The pre-run
   corpus (sim-armory's 29/32) counts invitations; this diagnostic shows the
   sitting rate is 0/16 on this substrate. Any future "table reach" metric
   must distinguish invitation from sitting, or it measures the wrong thing.
2. **Killer-wave join is thin**: 12/114 post-table deaths wave-unmapped; the
   wave-4 dominance claim leans on channel+wave joins that are 89.5% mapped.
   Harden the join before sizing any overtime-counter lever by wave.
3. **Death-count clustering**: successions cluster within runs (belongfeast-
   s64204: 3 scholars in 2 days at d116–d117). 114 deaths is not 114
   independent events; use per-run survival as any confirm primary.
4. **Overtime-tier attribution is channel-proxied**: the 1.97x death-rate
   ratio and the w4/killer shares are consistent with the overtime RERUN
   escalation, but the tier at each death was not stamped per-rec (the
   transcript series shows the tiers; the probe's daily tb rec does not
   include overtimeTier). A follow-up lever arm should stamp the tier per
   day before claiming an overtime dose-response.
5. **Base-relativity**: the sweep measured base e374e9a3a. Sibling game-code
   landings move sim trajectories (windowsurvive metric doubt #4) —
   FIDELITY re-run byte-identical 4/4 on this base before commit. Re-sweep
   on current master before sizing any overtime lever.
6. **Transcript fidelity**: all 3 transcripts generated on the sweep's base
   and pin FIDELITY-OK (probe end-day == sweep end-day exactly).

## Village assessment

What the villages looked like: 16 villages on the pre-seat win-side stack
(leadfeast/belongfeast, 180d death-aware). Twelve of them received the table
invitation (d45–d109) and then lived under a clock they could not stop: the
table announced at day 90 ("◈ THE TABLE IS SET. A ring of pale light waits —
take your seat from Haven when you are ready"), the seat sat in the Haven
panel untaken, and every 7 days the overtime tier ticked up — RERUNS with
+25% HP and +12% damage per tier, raids sooner and more often. The villages
did not slow down, did not change posture, did not hide: the same competent
village kept fishing, cooking, hauling, and answering raids while the
monsters got hungrier.

Who thrived and who died and why: the scholar dies more than the village —
72 scholar successions vs 42 villager deaths across the 12 table-reaching
runs (7–13 scholars per run, even the 2 survivors burned 7 and 10). The
scholar is the combatant of last resort against escalated rerun raids: raid
61/114, wave-4 killers 57/114. belongfeast-s64204 is the long tragedy:
invited d45, held 126 days post-table, lost Norman/Krit/Carl in the first
week, then Zoe, Viviane, Abylai (thirst), Baglan, Milana+Nathan (same day),
Fabio, Petra+Beibit (same day), Katiuska, Nicolás, Ibtissam, Maya — and
finally Grace, the last scholar, who won a Hardened Duel on camera, gained
the Blink ability, walked home to an empty pantry, and starved: "No one is
left to pick up the Codex. The village dies out — quietly, the way villages
do." The two survivors (leadfeast s64202, s64204) held to d182 with 3-person
rump villages and empty pantries — survival by exhaustion, not by winning.

What was missing: the seat-taking verb. Nothing in the policy stack calls
tableTakeSeat on this substrate (SEATDRIVE=0 by design); the win-side layers
(winpursuit/windefer) are inert without the seat; the overtime clock has no
policy-side stop. The blank this run fills is the attribution: the table
entry accelerates death 1.97x via overtime on the pre-seat substrate. The
blank it names is the seated table — what kills villages DURING the table
(the table's own stakes: pricing, trial by combat, light/dark branches) is
still undiagnosed.

## Sense-testing (SENSE-TESTING LAW)

Read: 3 base-faithful transcripts — leadfeast-s64204 (12,222 SAY lines,
d63–182, survived), belongfeast-s64204 (12,173, d42–171, died d171),
leadfeast-s64207 (6,716, d48–110, died d110) — all FIDELITY-OK (probe end-day
== sweep end-day exactly).

**The overtime beats read as the System performing the kill.** "OVERTIME!
The season was supposed to END. You didn't sit. So we kept the cameras
rolling. RERUNS, folks — the hits, but HUNGRIER." (×1, d97); "OVERTIME ×4!
Raids every few nights now! Bigger packs! Is this cruel? It's TELEVISION."
The fiction earns the mechanism: the audience loves a stall, the producers
draft something big, and the village pays per tier. The d90 announcement
("Nothing is final until you sit") is the last honest beat before the
clock starts — after that, every 7 days the world gets meaner and the
System narrates why.

**Post-table deaths read as attrition, not event.** No single catastrophe —
the village bleeds one scholar and one villager at a time under escalating
tiers, with cascade days (d118: Mia+Zoe; d116: Milana+Nathan; d132:
Petra+Beibit) where the escalated pack lands twice in a day. The death
liturgy still fires per death with mechanical teeth (treaty shake, tribute
press, mantle transfer, unanswered questions) — but the mass-casualty
templating blank repeats verbatim ("The village stops. Somebody screams.
Somebody else starts digging." ×N in a day; "Nobody's talking much. The
fire feels smaller tonight."), noticeable in cascades. Filed as out-of-arm
content blank.

**Villagers act like people after the table.** Grace holds her Trail compass
to ease the shaking (−6 trauma) after winning a duel; the village brings
Maya home and digs the grave by the fire without being asked; someone leaves
food out and Grace knows it wasn't one of them; the fire debates and the
gossip keep mutating. The community reads alive to the end — its leadership
is being ground down by reruns while the pantry empties.

**The dehydration death is coherent.** leadfeast-s64207: Willie (scholar)
dehydrates d55 (+4 post-table) while the village pantry reads 28k — the
'the wild' classifier trap stays kept-identical ('dehydration' → other,
cause-unmapped, named in the row).

**Blanks (robotic/static):**
1. Mass-casualty grief templating repeats verbatim per death in cascades
   (content blank, filed).
2. The "take your seat from Haven" line repeats per overtime tier with the
   same seat sitting untaken — fine as fiction (the System would repeat it),
   but a policy that could sit and doesn't is the simulation artifact, not
   a content bug.

## Named nexts

1. **sim-seatdrive-posttable — GO** (the direct next diagnostic): re-run the
   attribution with SEATDRIVE=1 (the seat drive layer ON, same env otherwise)
   — does the table sit, what phases does it reach, what kills the village
   DURING the table (the table's own stakes: pricing, trial by combat,
   light/dark branches, the win-day-floor deferral)? This arm deliberately
   measured the pre-seat substrate; the seated-table mortality is the
   undiagnosed remainder. Pre-register per-run seated survival as primary.
2. **Overtime-tier dose-response (instrument hardening)**: stamp
   overtimeTier per daily rec before any overtime lever is sized — the
   1.97x ratio and w4 shares are channel-proxied; a tier-stamped series
   would pin the dose-response (metric doubt #4).
3. **The day-90-floor deferral path**: 8/12 invitations came pre-90. A
   seated arm will hit winDayFloorDefer — the deferred table (tableStillHere
   promise, sanctity holds during deferral) is its own mortality surface.

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chased — staying on the diagnostic.)
- **OVERTIME is the post-table mortality engine** (src/js/overtime.js, Steve
  2026-10-14 "waiting should have a cost"): on any substrate where the seat
  is never taken, the overtime tier clock (7d/tier, cap 6; w4/w5 RERUN
  escalation; raids sooner/more often) drives the 1.97x post-table death
  acceleration. Documented, not invented — tuning is data in titans.json
  _overtime.
- **"Table reach" overcounts without the sitting distinction**: pre-run
  corpora count tableWaiting; the sitting rate here is 0/16. Future wall
  metrics should name invitation vs sitting separately.
- **Mass-casualty grief templating repeats verbatim** (content blank):
  the death liturgy lines repeat identically per death in cascade days.
- **'dehydration' → 'other' trap fired again** (leadfeast-s64207 Willie d55):
  the vetwindow classifier trap, kept identically, named in the row.

## Convergence

**converging.** The diagnostic answered its question (DIAG-GO: 12/16
table-reaching runs fully attributed, 0 unattributed, the named mechanism is
OVERTIME on the never-sat table) and hands the coordinator a GO seated-table
arm (sim-seatdrive-posttable). The axis stays converging: wins 0/16, wave-5
0/16. Flag for coordinator/tracker: national reached 10/16 on this
substrate (windowsurvive measured 11/16 on the w5path substrate) — the
STANDING DIRECTIVE's lift condition ("a run demonstrates national reached in
sims") is met on the numbers, but wins are structurally 0 while the seat is
never taken; lift is a coordinator/Steve call, not this arm's.

## Files

- scripts/probe-posttable-20261019.js — sweep probe (death capture + daily table telemetry + KILLDISC install + DET gate; EPERM-flap write retry)
- scripts/analyze-posttable-20261019.js — post-table attribution + taxonomy + corpus summary writer
- scripts/posttable-transcripts-20261019.js — SAY-line probe (sysSay restored; base-faithful; fidelity pin)
- scripts/test-posttable-20261019.js — proof: classifier-parity + table-telemetry fixtures, SMOKE, DET, KILLER-WAVE — 75/75 pass; +COMPLETE=1 gate 124/124
- scripts/build-posttable-panels.js — §15 panel builder (self-compare of the diagnostic corpus)
- evidence/2026-10-19/perseed-posttable/{leadfeast,belongfeast}/s64201–s64208.json — 16 per-seed sweep JSONs (base e374e9a3a; FIDELITY re-run byte-identical 4/4; top-level boolean won/national/table)
- evidence/2026-10-19/posttable-corpus-summary.json — corpus summary (analyzer output)
- evidence/2026-10-19/posttable-taxonomy.md — full taxonomy + per-run table + day-after-table death rows
- evidence/2026-10-19/posttable-transcripts/leadfeast-s64204.txt — 12,222 SAY lines, d63–182, survived [FIDELITY-OK]
- evidence/2026-10-19/posttable-transcripts/belongfeast-s64204.txt — 12,173 SAY lines, d42–171, died d171 [FIDELITY-OK]
- evidence/2026-10-19/posttable-transcripts/leadfeast-s64207.txt — 6,716 SAY lines, d48–110, died d110 [FIDELITY-OK]
- evidence/2026-10-19/posttable-panel.md + .json + -before/-after.json.gz — §15 compare (self-compare: valid, no_material_signal; win rate descriptive 0/16)
- evidence/2026-10-19/sim-posttable.md — this file

## Telemetry deviation check (Steve 2026-10-13)

Ran per-policy (the tool's minimal glob takes one `*` in the basename):
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current "evidence/2026-10-19/perseed-posttable/<policy>/s*.json" --metrics national,table,wins,exiled`.
LOUD lines: leadfeast — "table swung -69%: 16 -> 5", "wins disappeared: 16 -> 0";
belongfeast — "national swung -67%: 12 -> 4", "wins disappeared: 16 -> 0".
VERDICT: regime artifact, no same-run investigation needed. The scale-wall
baseline's own `_regime` block (fleshout-20261015T201630Z, winseat) says verbatim:
"DO NOT compare pre-seat / courtship / readiness substrates against this
baseline — wins are structurally ~0 there and telemetry-check will fire a
spurious LOUD 'wins disappeared'." This substrate is pre-seat by design
(SEATDRIVE=0 — the arm's question is exactly what happens when the seat is
never taken). The baseline was NOT rolled (--update-baseline would have
destroyed the winseat regime note); the LOUDs are the expected artifact of
comparing a never-sat substrate against a wins-16/16 baseline.
