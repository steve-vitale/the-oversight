# Journey endgame r73 — EVIDENCE (lane B, completed 2026-10-30)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start — the r72 adoption run
completed analysis but did NOT write the rotation forward, so this run
replayed leg 4 and writes 5 (social life next) at run end. Substrate
r72 EXACTLY (capable + deedhunt + vetcommit + greedy deferral defaults
MAXTIER 4 / LASTDAY 145 + armorydrive + fullseat-diag + vetguard on
waves seeds; forcedrift control clean). ZERO src/js changes (gating
freeze, Steve 2026-10-27 16:53, stands). One new read-only instrument:
the feast-hold diagnostic (see prereg). Analyzer:
`scripts/analyze-endgame-r73-20261030.js`, full output in
`evidence/2026-10-30/journey-endgame-r73-analysis.txt`. The analyzer
exits 1 on PRIMARY NO-GO by design — that exit code IS the verdict,
not a crash.

Seeds: 88961-88963 waves (Arm A), 88964 forcedrift control,
88965-88967 wavesnw (Arm B, waves + NOWALKIN_W4). 180d, death-aware.

## Village assessment, in plain words

Six villages won the lesser seat, none won the full seat, none met a
wave-5 monster, one village died outright.

- 88961 (waves): won lesser, beloved/light. 4 deaths, 8 alive. The
  best-fed road in the block: 11 feasts held (7 scale + 4 competent),
  surge spent 4 times, 5 wave-4 fights (1 kill, 2 fled, 2 talked down).
  Full-seat gap only w3:3/4 + w5:0/2; one living veteran at close.
- 88962 (waves): won lesser, feared/light. 9 deaths, 7 alive. One
  wave-4 fight, won by kill; its veteran lived to the end (peak 1,
  d87). Full-seat gap w4:1/3 + w5:0/2.
- 88963 (waves): won lesser, feared/light. 12 deaths, 4 alive — the
  harshest surviving toll on Arm A. Zero wave-4 fights, zero veterans,
  yet sat anyway: the lesser seat again does not demand wave-4 kills.
- 88964 (forcedrift control): won lesser, relay-dark. 4 deaths, 9
  alive. The withdrawal-then-announce seed (see people check): the
  table refused at d115 and came at d120. 6 scale feasts, surge d47,
  2 wave-4 fights.
- 88965 (wavesnw): won lesser, beloved/light, announced late (d151).
  21 deaths, 3 alive — the bloodiest surviving village in the block.
  13 wave-4 fights (2 kills, 5 villager deaths in fights, 3 monsters
  fled, 1 other end). The closest to the full seat in the block: its
  only waveUnlockReady(5) gap is w5:0/2 — but its veterans are dead
  (peak 1, 0 at close) and its readiness bar still reads armor /
  weapons / veterans short, so the last mile is two problems, not one.
- 88966 (wavesnw): the village died (19 deaths, 0 alive, wave 3).
  Never feasted, never surged, never fought a wave-4 fight. An honest
  death, no filler days ticked.
- 88967 (wavesnw): won lesser, witness/light. 10 deaths, 4 alive.
  Zero wave-4 fights, zero veterans — a lesser win on breadth and
  survival alone.

The shape of the wall is unchanged: every waves seed reads wave-5
breadth 0/2, and no seed peaked at 2 living veterans (peaks 1, 1, 0,
0, 1, 0, 0). The villages that win are well-tricked and well-fought
or well-fed, but not veteran villages.

## Leg question 1 — FEAST-HOLD: which gate blocks scale feasts? ANSWERED

M22 GO 7/7 with ZERO unexplainable dusks in the block (567 dusks
classified, 0 UNEXPLAINED, 0 UNKNOWN, 0 NO_PLAN). The choke is two
gates, in different proportions per arm:

- Arm A waves (221 dusks): AWAY 41%, CONTRIBUTION 36%, CADENCE 14%,
  HELD 7%, PLAN_REFUSED 1%, BUFFER_SHORT 1%.
- Arm B wavesnw (247 dusks): AWAY 55%, CONTRIBUTION 33%, HELD 1%,
  BUFFER_SHORT 6%, PLAN_REFUSED 5%, CADENCE 1%.
- Control forcedrift (99 dusks): CONTRIBUTION 65%, CADENCE 25%,
  HELD 6%, AWAY 3%, BUFFER_SHORT 1%.

In plain words: on the waves road the scholar is usually NOT at the
haven at dusk (away 41–55% — the deedhunt road keeps them out), and
even when home they usually have NOT given 1500 kcal to the village
in the last 7 days (contribution is the plurality block on Arm A and
the control alike). The median contribution shortfall on blocked
dusks is the full 1500 — on most blocked dusks the scholar gave
nothing at all that week. The pantry buffer almost never binds
(1–6%): this is not a famine problem. Cadence binds only where
feasts actually happen (control 25% — spacing after real holds).
Every grant still granted (23/23 calls across the block, 0
refusals): r72's ruling stands — the choke is upstream of the grant,
at holding, and now holding has its two named gates: be home at
dusk, and give. A future lever, if Steve ever wants one, lives at
those two gates — not at the grant, not at the pantry.

## Other leg questions, answered

2. FULL SEAT LAST MILE — no third shape, no progress. No fresh seed
   faced a wave-5 type (w5 faced 0 on all six), none earned the full
   seat. The two r71/r72 shapes persist: breadth-short (88961 w3 3/4,
   88962 w4 1/3, 88963 w4 0/3, 88967 w4 0/3) and veteran-survival +
   w5-breadth short (88965: w5-only gap on the unlock check, but
   veterans dead and readiness bar short).
3. PEAK LIVING VETERANS, fourth block — NO. 0/6 peaked >= 2 (peaks
   1, 1, 0, 0, 1, 0). Two blocks running now with no >=2 peak, after
   r68+r71 each peaked >=2 somewhere. Direction still down, not a
   blip to wave away — but still small counts, so watch, not law.
4. RELEASE-DAY SNAPSHOT — vacuous. No seed reached uw=5. M13 vacuous GO.
5. NOWALKIN REPLICATION, seventh block — TIE. Arm B kills 2 vs Arm A
   kills 2 (88961 1 + 88962 1 + 88963 0 vs 88965 2 + 88966 0 + 88967 0).
   Series tally stays 3–3 Arm A with one tied block. No lever fate —
   kill discipline holds.
6. RELAY-BRANCH TALLY — one relay final: the control, dark (88964,
   noticed, 1 band crossing, 79 verbs, 8 communes). Series now dark 6,
   grey 1, light 1. No second grey or light observation.
7. DECLINE vs SILENT NO-SHOW — no decline at all (same as r71/r72).
   The one non-announced surviving classification is the village-lost
   seed, not a no-show. New shape instead: WITHDRAWAL-THEN-ANNOUNCE
   (88964, see people check) — the table refused at d115 and came at
   d120. That is neither decline-and-return nor silent no-show; it is
   the "table will still be here" promise kept.
8. GHOST LINES — one first-name hit, NOT a recurrence on inspection.
   88966 d49 "Yuki is back with Grace" matches Grace Sullivan (died
   d16) by first name only — but a second Grace (grace_obi) was alive
   at d49 and died d81, and the paired line "Grace is back with Yuki"
   is two living villagers returning together. The scan's first-name
   heuristic over-flags on shared first names. Verdict: 0 confirmed
   ghost returns; the instrument needs identity-aware matching (see
   metric review). Block totals: 293 lines scanned, 1 first-name hit,
   0 confirmed.
9. 199 MECHANISM (regression) — holds. Three seeds derived a gated
   peak of exactly 199 with raw far above and a defer5/cap hold:
   88961 (raw 422, 87 days at 199), 88962 (raw 262, 47 days), 88964
   control (raw 272, 123 days). Full-seat max standing never exceeded
   199 on any seed.
10. AUDIT CROSS-CHECK — holds 6/6. Every sat seed's audit line parses
    and equals satWaves exactly on all five counts (M21 GO).

## Pre-registered verdict

PRIMARY: NO-GO — driven by M3b-peak and M4 together.

- GO: M1 (7/7 resolved), M2 (Arm A with fights 2/3, all outcomes
  named), M2c (census == engine+policy opens 6/6, 0 errors), M2d (3
  uncommitted fights, all classified never-observed), M2b (5 villager
  deaths attributed, all named), M5 (control crossed + voiced), M5b
  (1 relay final tabulated), M6 (deferred sat guards named), M8 (3
  mFlee fights, all matched to codex counter text — binding this
  block), M10 (full-seat gaps named 5/5), M11 (peaks reported 6/6),
  M12 (readiness-bar records 5/5, short bars named), M13 vacuous (no
  uw=5), M14 (invite classification 6/6), M15 (feast census 7/7),
  M16 (dusk census 7/7, away-shares 0–62%), M17 (surge spends named
  7/7 — all combat, player + villagers banking), M18 (ghost scan
  7/7; the one hit judged a false positive in the note, not a NO-GO
  — hits are findings per the prereg), M19 (grant log 7/7, 0
  refusals), M20 (standing trace 7/7, mech199 classified per seed),
  M21 (audit cross-check 6/6), M22 (feast-hold diagnostic 7/7, 0
  unclassified dusks), REG r35/r37 (6/6 each).
- NO-GO: M3b-peak (0/6 peaked >= 2 living veterans), M4 (0/6 wave-5
  unlock or full seat).
- TALLY ONLY (not PRIMARY-gating): M3 conversion (tie 2–2, counted
  as NO-GO by the analyzer's strict greater-than but excluded from
  PRIMARY by the prereg), M4b conjunction 0/6, M9b contention share
  (waves 86.4%, wavesnw 80.3%, control 88.9% — blocked arrivals
  dominate meetings roughly 5:1 on every arm; no bar yet, see metric
  review).
- VACUOUS (labeled, not counted as proof): M13 (no uw=5).
- M9 SUPPLY: 107 blocked wave-4 arrivals counted across 7 seeds
  (per seed 3–22), every one carrying the verified contention line.
  Judged GO against the code rule: the single-occupant boundary rule
  firing as designed, not a spawn failure. With M9b, the share is now
  the comparable number: ~80–89% of wave-4 arrival pressure never
  becomes a fight.

M2 reading per the carried metric review: M2 GO this block (2/3 Arm A
with fights), but 88963 and 88967 still won lesser with zero wave-4
fights — coverage is not winnability, as ever.

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags,
with one honesty flaw documented below as the run's blank)

Beat 1 — 88964 withdrawal-then-announce + relay-dark finale. At d115
the table does not come ("the ring of pale light flickers... and
does not come"), the ledger names the true missing item (wave-3
monsters faced), and the beat leaves the door open ("the mantle may
pass to hungrier hands; the table will still be here"). At d120 the
table announces and sits, and the relay-dark merge plays out with
its named price (children as "little warm nodes", the pods opening
"not like morning, like a barracks", the village quiet, the System
delighted and not understanding why nobody else is). The promise
kept is the beat's payoff: a refused table that returns is a
stronger story than a refused table that vanishes. Sensical.
HONESTY FLAW (the run's blank, not a senseless flag): the beat's
System quote says "NO FEAST, NO SURGE, NOTHING HERE WE CAN PRICE"
— but this bearer feasted 6 times and spent surge 5 times before
taking the pellet on d115 (feastHold shows reactor False through
d114, True from d115 on, including sit day d120). The beat fires on
(reactor online + seat none) and its fixed quote assumes a bearer
who never feasted; for a post-feast pellet bearer the quote
contradicts the record, even though the ledger clause ("still
wants: wave-3 faced") names the true blocker and the seat then
clears on wave-3 breadth alone with the pellet still online. The
pellet does NOT erase banked food deeds — the r14 comment's
"permanently uncompletable" holds only for bearers who never
feasted. Proposed fix (not landed here — narration + seat logic,
needs a builder's proof): condition the pellet quote on food deeds
unbanked, or make the quote name the ledger's true missing bar.

Beat 2 — 88965 beloved finale. The audit reads the run back honestly
(lesser seat, regional standing, waves 17/8/8, 7 wave-4 fought, 16
contests, 4 crises — all matching the analyzer), the war path names
real kills (Arman put down The Loud Beast d135, Loud-Eyes d92), and
the showrunner's finale resolves (the village endures, the table
signed, the credits list everyone alphabetically) and owes (the
pods are still napping, "the oversight is the looking away").
Supporting texture in the same window: the System's commune offer
to carry the village's grief ("LET ME CARRY IT... IT IS —
EXPENSIVE") is a want with a price, voiced in its own alien terms.
Sensical.

No fabricated shared history, no filler loops, no static menus in
either beat.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes for the lesser seat (6/7 won it across feared,
  witness, beloved, and relay-dark paths); no for the full seat and
  wave 5 (0/6, fourth block running with the same wall).
- FUN: the finale beats are strong — a refused table that returns,
  a dark merge with its price, a beloved coda that owes. The
  field-fight texture is thinner: two Arm A/B seeds never met a
  committed wave-4 fight at all, and ~85% of wave-4 arrival pressure
  never becomes a fight (contention share).
- WINNABLE: the lesser seat is winnable by a competent player on
  this substrate; the full seat is not yet demonstrated winnable
  on any seed in this series. That is the leg's standing verdict,
  unchanged by r73.

## Blank filled / documented

No game fix this run — deliberately none. The instrument answered its
question (feast-hold gates named: away + contribution, 0
unexplained), and the answers are not bugs: the gates fire as coded.
The blank this run documents for a builder: (a) the 88964
withdrawal-beat quote overclaims for post-feast pellet bearers
(mechanism above; pellet does not erase banked deeds); (b) the
M18 ghost scan's first-name heuristic false-positives on shared
first names — the next run's analyzer should match on villager id /
full name where the capture allows, and re-classify 88966 d49 as
not-a-ghost. What this run fills is the feast-hold answer r72 asked
for, plus the withdrawal-then-announce shape and the contention
share's first values.

## Metric review (for the NEXT run, not this one)

- M22 worked first time: 567 dusks, 0 unclassified. Keep it; the
  distribution (away + contribution) is now the feast question's
  answer, and future runs report it as regression unless a lever
  moves one of the two gates.
- M9b's first shares (86.4 / 80.3 / 88.9%) propose an r74 bar:
  pre-register the share as a reported metric with a watch band
  (e.g. flag a >10-point arm swing), not a GO/NO-GO bar — the share
  describes supply pressure, and no target exists yet.
- M18: fix the classifier before r74 (identity-aware matching);
  keep the scan, keep hits-as-findings. Do NOT re-score r73's M18:
  the prereg bound the scan + classification, and the false positive
  is documented here as a finding.
- M3's strict greater-than makes a tie read NO-GO in the analyzer
  output while the prereg excludes M3 from PRIMARY. Keep the prereg
  (tally only); optionally print ties as TIE in r74's analyzer so
  the output stops looking like a verdict.
- NOWALKIN tally 3–3 with one tied block (seven blocks). Still no
  lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot. This
  run's check LOUD lines (won 0->6, announceDay newly appeared)
  are the same stale-baseline artifact as r48–r72: EXPLAINED,
  baseline NOT rolled. The re-seed proposal stands.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/endgame.json --current
'evidence/2026-10-30/perseed-endgame-r73/*.json' --metrics
won,announceDay,satSeatKind` → LOUD: won newly appeared
(baseline 0 -> current 6, n=7); LOUD: announceDay newly appeared
(baseline 0 -> current 631, n=7). Verdict: EXPLAINED — the baseline
file contains only maxTier/satPenalty from an older regime and
says so itself; won/announceDay are not in it at all. Not a bug,
baseline not rolled.
