# Journey endgame r74 — EVIDENCE (lane B, completed 2026-10-30)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start (succession r79 closeout
advanced 7 -> 4); this run writes 5 (social life next) at run end.
Substrate r73 EXACTLY (capable + deedhunt + vetcommit + greedy deferral
defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive + fullseat-diag +
vetguard on waves seeds; forcedrift control clean). 180d, death-aware.
NEW vs r73: the M18 identity-aware ghost classifier (probe-side: a
back-with line is CONFIRMED only when a same-first-name death predates the
line AND no same-first-name death falls on/after the line day AND no
final-alive roster person shares the first name; the old rule is kept as
firstNameHit), M9b watch band vs r73 shares, M3 tie printing. Analyzer:
`scripts/analyze-endgame-r74-20261030.js`, full output in
`evidence/2026-10-30/journey-endgame-r74-analysis.txt`. The analyzer exits
1 on the tally-only M3 NO-GO by design — PRIMARY reads GO (see verdict);
that exit code is NOT a run failure.

TWO narration-only game fixes landed this run (see Blank), each with a
before/after proof test: the pellet-quote variant
(`scripts/test-pellet-quote-banked-20261030.js`) and the return-ghost
guard (`scripts/test-return-ghost-guard-20261030.js`). Both tests FAIL on
pre-fix code (case B, with the exact pre-fix wrong lines quoted in the
failure output) and PASS post-fix. No gate, seat-logic, deed-value, or
trip-logic change. The sweep itself ran on pre-fix code; the fixes touch
only voiced lines (and one dead-bond skip), so no sweep metric is
re-scored — the fixes are reported as landed narration, not as sweep
results.

Seeds: 88971-88973 waves (Arm A), 88974 forcedrift control,
88975-88977 wavesnw (Arm B, waves + NOWALKIN_W4). 180d, death-aware.

## Village assessment, in plain words

Five villages won the lesser seat, none won the full seat, two villages
were lost — and for the first time in this series a seed unlocked wave 5
AND sat the lesser seat with two living veterans banked.

- 88971 (waves): won lesser, feared/light, announced d90, sat d93 after a
  3-day veteran-banked wait. 11 alive at close. The strongest village in
  the block: 10 committed wave-4 fights (3 kills, 7 talked down), 9 scale
  feasts, surge spent 10 times, peak 2 living veterans at d86 — and the
  d86 release snapshot reads uw=5 with rd5 short=[] (armor 10, armed 11,
  tricks 17, veterans 2). Wave-5 breadth 2/2 faced. What still blocks the
  FULL seat is now EARLIER breadth, not wave 5: w3 3/4 (one wave-3 type
  short) and crises 2/3 (one crisis short). The audit reads the run back
  honestly (global standing, 12/8/3 + 6 wave-4 + 2 wave-5, 14 contests,
  2 crises).
- 88972 (waves): the village was lost (1 alive at d160). A pellet-bearer
  withdrawal at d90 — the withdrawal beat fired honestly here, because
  this bearer never feasted: the miss list names only the food-thesis
  deeds, and the original "NO FEAST, NO SURGE" quote is TRUE for this
  run. 4 fights (2 kills, 1 suburb escape, 1 other end), peak 1 veteran
  at d98, standing peak exactly 199. Also the block's confirmed ghost
  (see M18).
- 88973 (waves): won lesser, witness/light, announced d90, sat d118 after
  a 28-day deferral (sat penalty tier 4, 2 losses). 9 alive. 7 fights (1
  suburb escape, 5 talked down, 1 other end), 5 feasts, surge d66, standing
  peak exactly 199. Full-seat gap w5:0/2 only on the unlock check — but
  with 0 veterans and no wave-5 fight, the last mile is still two
  problems on this seed.
- 88974 (forcedrift control): won lesser, relay-dark, announced and sat
  d97. 10 alive. 6 feasts, surge d25, 1 band crossing, noticed. The
  relay-dark merge again (see people check). Series relay tally now
  dark 7, grey 1, light 1.
- 88975 (wavesnw): won lesser, feared/light, announced and sat d90. 9
  alive. Only 2 committed fights (1 villager fled, 1 other end) and 0
  wave-4+ kills — a lesser win on breadth and survival alone, as in r73.
  Standing peak exactly 199.
- 88976 (wavesnw): the village SCATTERED at day 20, not killed outright.
  Three hungry days with an empty pantry and people walked in different
  directions — "The scattering, again." 7 deaths by d20 (wound, wild,
  starvation x3, sickness x2), mantle passed once (Sisa Vilca -> Kavya
  Nguyen, 60, trail crew lead, Beast-calm) before the scatter. 5 roster
  alive at the end but no village left to tick — death-aware stop, no
  filler days. An honest early failure: the run starved before it ever
  met wave 2.
- 88977 (wavesnw): won lesser, feared/light, announced d90, sat d120
  after a 30-day deferral (sat penalty tier 4, 3 losses). 7 alive. Zero
  committed wave-4 fights, 1 scale feast, surge d32, standing peak only
  70. Full-seat gap w4:0/3 + w5:0/2.

The shape of the wall MOVED, for the first time in four blocks: wave-5
breadth is no longer the binding constraint on the best seed. 88971 has
wave-5 done, veterans banked, and the table announced — and still sits
lesser because one wave-3 monster type was never faced and one crisis
was never weathered. The last mile is now early-wave breadth + crisis
count, not the wave-5 hunt. Every other waves seed still reads the old
shapes (w5:0/2, veterans 0).

## Leg questions, answered

1. WALL CONTINUITY — YES, movement. M3b-peak GO (88971 peaked 2 living
   veterans, first GO in two blocks) and M4 GO (88971 unlocked wave 5)
   and M4b conjunction GO (uw=5 AND announced, first in this series).
   Full seat still 0/6 — but the binding bars moved (see above).
2. CONFIRMED GHOSTS — YES, one, and it is real. 88972 d124 "Felix is back
   with Alaa": Alaa (joiner visjoin_112) died d123 by monster, the Codex
   closed her entry ("No more pages"), trust dropped 8 — and the next
   day Felix is narrated as back WITH her. The identity-aware classifier
   confirms it (only one Alaa exists; no alive candidate). The paired
   d117 line (Felix back with Alaa while she lived) is clean. Root cause
   found and fixed this run (see Blank): the visit companion is
   snapshotted at departure and never re-checked at return.
   R73 CROSS-CHECK (not a re-score): under the new rule, r73's 88966 d49
   Grace line reads firstNameHit=true, confirmed=false — grace_obi died
   d81, after the line — exactly as r73's note predicted. The classifier
   fix works.
3. CONTENTION WATCH — one FLAG. wavesnw share 93.1% (27 blocked, 2
   committed) vs r73 80.3% = +12.8 points, over the 10-point watch band.
   Waves 79.4% vs 86.4% (-7.0, inside the band). Control share undefined
   (0 blocked, 0 fights — the forcedrift control met no wave-4 pressure
   at all this block). The wavesnw flag is a watch item, not a verdict:
   the arm's 2 committed fights on 29 arrival pressures is the thinnest
   conversion in the series, and it rides on one seed (88975) plus two
   seeds with zero fights (88976 died at d20, 88977 met none).
4. FEAST-HOLD REGRESSION — shape holds, with one shift. Waves: AWAY 39%
   (r73 41%), CONTRIBUTION 33% (r73 36%), HELD 9%, CADENCE 12%. Wavesnw:
   AWAY 65% (r73 55%, up), CONTRIBUTION 26% (r73 33%), HELD 3%.
   Control: CONTRIBUTION 43% (r73 65%, down), CADENCE 34% (r73 25%, up —
   spacing after real holds: 12 held vs 6). Median contribution shortfall
   is still the full 1500 kcal on every arm: on blocked dusks the scholar
   gave nothing that week. Pantry buffer still almost never binds (1%).
   New plan-refusal texture: 17 waves dusks refused for "Nobody is here
   to feast with" (88972 alone: 10) — the scholar home alone at dusk is
   a named sub-shape of the away/contribution story, worth watching.
5. FULL SEAT LAST MILE — THIRD SHAPE, new. Beyond r71/r72/r73's two
   (breadth-short; veteran-survival + w5-breadth short): 88971 is
   wave-5-complete + veteran-banked + announced, short on w3 (3/4) and
   crises (2/3). The other sat seeds keep the old shapes (88973 w5-only
   on the unlock check but 0 veterans; 88975 w4 2/3 + w5 0/2; 88977
   w4 0/3 + w5 0/2).
6. NOWALKIN REPLICATION, eighth block — Arm A wins, 5-0. Arm A kills 5
   (88971: 3, 88972: 2, 88973: 0) vs Arm B 0. Series tally now Arm A 4,
   Arm B 3, ties 1 (r60 A, r61 B, r65 B, r68 A, r71 A, r72 B, r73 tie,
   r74 A). Tally only — no lever fate on small counts, and this block's
   margin rides on Arm B's thin fight count (2 committed fights total),
   not on a demonstrated kill-rate difference.
7. RELAY-BRANCH TALLY — one relay final: the control, dark. Series now
   dark 7, grey 1, light 1. No second grey or light observation.
8. DECLINE vs SILENT NO-SHOW — no decline at all (fourth block running).
   Non-announced classifications: 88972 withdrawal (pellet beat, voiced),
   88976 village-lost/scattered (voiced). No silent no-show.
9. 199 MECHANISM (regression) — holds, with one breakthrough. Four seeds
   peaked at exactly 199 with raw above and a defer5/cap hold (88972 raw
   227, 30 days; 88973 raw 402, 74 days; 88974 raw 372, 18 days; 88975 raw
   227, 30 days). 88971 broke through to 512 on the uw=5 release. 88977
   peaked at only 70 (never near the cap).
10. AUDIT CROSS-CHECK — holds 5/5. Every sat seed's audit line parses
    and equals satWaves exactly on all five counts (M21 GO).

## Pre-registered verdict

PRIMARY: GO — the first PRIMARY GO in this series' recent blocks, driven
by M3b-peak and M4/M4b finally going GO together. (The analyzer's exit
code is 1 because the tally-only M3 prints NO-GO on Arm B 0 vs Arm A 5;
M3 is excluded from PRIMARY by the prereg, as in r73.)

- GO: M1 (7/7 resolved), M2 (Arm A with fights 3/3, all outcomes named),
  M2c (census == engine+policy opens 6/6, 0 errors), M2d (13 uncommitted
  fights, all classified never-observed), M3b-peak (88971 peak 2),
  M4 (88971 uw=5), M4b (88971 uw=5 + announced), M5 (control crossed +
  voiced), M5b (1 relay final tabulated), M6 (deferred sat guards named:
  veteran-banked, not-ready, tier-cap), M7 (2 beats sense-read, 0
  senseless flags), M8 (2 mFlee suburb fights, both matched to codex
  counter text — binding this block), M10 (full-seat gaps named 4/4),
  M11 (peaks reported 6/6), M12 (readiness-bar records 4/4, short bars
  named), M13 (88971 release snapshot d86, vets=2, rd5 short=[] —
  NON-vacuous), M14 (invite classification 6/6), M15 (feast census 7/7),
  M16 (dusk census 7/7, away-shares 3-74%), M17 (surge spends named 7/7 —
  all combat, player + villagers banking), M18 (ghost scan 7/7; the one
  confirmed hit is the finding, fixed this run), M19 (grant log 7/7; 2
  reactor refusals, both classified — 88972's pellet grant and the
  control's), M20 (standing trace 7/7, mech199 classified per seed),
  M21 (audit cross-check 5/5), M22 (feast-hold 7/7, 0 unclassified
  dusks), REG r35/r37 (5/5 each).
- TALLY ONLY (not PRIMARY-gating): M3 conversion (Arm A 5, Arm B 0),
  M9b contention share (waves 79.4%, wavesnw 93.1% WATCH-FLAG, control
  n/a).
- M9 SUPPLY: 108 blocked wave-4 arrivals counted across 7 seeds (per
  seed 0-38), every one carrying the verified contention line. Judged
  GO against the code rule: the single-occupant boundary rule firing as
  designed, not a spawn failure.

M2 reading per the carried metric review: M2 GO this block (3/3 Arm A
with fights), but 88975 and 88977 still won lesser with zero or two
wave-4 fights — coverage is not winnability, as ever.

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 88971 feared/light lesser finale. The audit reads the run back
honestly (global standing, 12/8/3 + 6 wave-4 + 2 wave-5, 14 contests,
2 crises — all matching the analyzer), the war path names real kills
(Aubrey put down Ugly-Eyes d86, the player put down The Ugly Beast d60),
the pledge-the-terror resolution carries its price (restraint as shield,
"the table writes it down and doesn't understand it"), the architect
credit lands (Nadia Khoury ascended through relay doors the player
built — "The galaxy will remember the god's name. The village will
remember who built the door. Both are true."), and the Oversight coda
owes (the pods still napping, "the oversight is the looking away").
Sensical, and the strongest finale in this block.

Beat 2 — 88974 relay-dark finale. The audit is honest (global standing,
15/6/3, 10 contests, 2 crises), the war path names the veteran bar the
seat missed (0 of 2 veterans), and the merge plays its price without
flinching: children as "little warm nodes", pods opening "not like
morning, like a barracks", Morgan and Monique each watching a sister
measured for boots, the village quiet, the System delighted and not
understanding why nobody else is. The closing cost is voiced too (food
conversions fade — "you don't eat anymore; the thought is quaint").
Sensical.

No fabricated shared history, no filler loops, no static menus in either
beat. (The block's one senseless line — the 88972 ghost return — is
counted under M18, not M7: it is a narration bug, now fixed, not a beat
failure.)

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes for the lesser seat (5/7 won it across feared, witness,
  and relay-dark paths); wave 5 is now REACHABLE (88971 unlocked it and
  sat with it); the full seat is still unreached (0/6), but its binding
  bars are now named and nearer (one wave-3 type + one crisis on the
  best seed).
- FUN: the finale beats are strong — a feared pledge with its price, a
  dark merge with its price, an audit that reads the run back honestly.
  The field-fight texture is thinner on Arm B (2 committed fights in 3
  seeds; 93% of arrival pressure never becomes a fight) and the early
  game still kills honestly (88976 scattered at d20 on an empty pantry).
- WINNABLE: the lesser seat is winnable by a competent player on this
  substrate; the full seat is not yet demonstrated winnable, but r74
  moves the goalposts measurably closer: the first uw=5 + announced +
  veteran-banked lesser win.

## Blank filled / documented

TWO narration-only fixes landed, each with a before/after proof test
(both tests FAIL pre-fix on case B, PASS post-fix):

(a) PELLET-QUOTE VARIANT (r73's documented blank, prereg item 11):
`src/js/progression.js` — the withdrawal beat now branches on
`detail.foodDeeds`: a bearer <redacted> banked food deeds before the pellet
gets "THE FIRE BURNED BEFORE THE PELLET, AND WHAT IT BANKED STANDS — BUT
THE PELLET HUMS WHERE THE FIRE SHOULD BE, AND NO NEW FEAST CAN CARRY THE
SURGE" instead of the never-feasted "NO FEAST, NO SURGE... COLD SPOT"
quote. The miss list and the mantle-passing out are unchanged. A
never-feasted pellet bearer (r74's own 88972) still gets the original
quote, which is TRUE for that run. Proof:
`scripts/test-pellet-quote-banked-20261030.js` (case A original intact,
case B variant + true wave-3 bar named, fires exactly once). Existing
`scripts/test-table-reactor-seat-honesty-20261017.js` still passes.
Narration only — no gate, no seat logic, no deed value changed.

(b) RETURN-GHOST GUARD (r74's own M18 finding): `src/js/villager-objectives.js`
`objReturnEffect` visit/guard branch — the companion clause is now gated
on the companion being alive at return time (getPerson/vpOf dead flag);
a dead companion drops the "with X" clause ("Felix is back.") and no
bond is struck with the dead. A living companion still reads "X is back
with Y", and an unknown id still reads as before. Proof:
`scripts/test-return-ghost-guard-20261030.js` (living clause intact,
dead clause dropped, guard follows the record). This does not change
trip logic, departure, or the return event itself.

Documented, not fixed: the wavesnw contention WATCH-FLAG (93.1%) — a
watch item for the next block, not a bug (the boundary rule fires as
coded); the "Nobody is here to feast with" plan-refusal sub-shape (17
waves dusks) as a feast-hold watch item; the 88976 scatter shape (empty
pantry -> walk-away at d20) as an honest early failure, not a defect.

## Metric review (for the NEXT run, not this one)

- M18 identity-aware classifier worked first time: 345 lines scanned,
  1 confirmed ghost (real), 0 first-name-only false positives in this
  block, and the r73 cross-check reads as predicted. Keep it; the
  return-ghost guard should drive confirmed ghosts toward zero — the
  next run's M18 is a regression check on the guard, not a fresh hunt.
- M9b watch band worked first time: one FLAG (wavesnw +12.8pt). Keep the
  band; do NOT turn it into a GO/NO-GO bar — the share describes supply
  pressure, and this block's flag rides on thin Arm B fight counts.
- M3 tie printing was not exercised (Arm A won 5-0); keep the TIE print
  for a future tied block.
- M22 stays regression reporting: away + contribution still dominate,
  with the "Nobody is here to feast with" refusal as a named sub-shape
  to track.
- M13 is non-vacuous for the first time in this series (88971 d86
  snapshot) — the release-day instrument earns its keep; keep it.
- NOWALKIN tally 4-3 Arm A with one tie (eight blocks). Still no lever
  fate; keep it a tally — and note this block's margin rides on Arm B's
  thin fight counts.
- Telemetry baseline: still the r37-era 2-metric snapshot. This run's
  check LOUD lines (won 0->5, announceDay newly appeared) are the same
  stale-baseline artifact as r48-r74: EXPLAINED, baseline NOT rolled.
  The re-seed proposal stands.
- Next run's question, named: on the best seed's new last mile, what
  actually blocks the final wave-3 type and the third crisis — is it
  opportunity (the types never arrive), attention (the scholar never
  goes), or the same contention that thins wave-4 fights? 88971's
  w3/crises gap is the first last-mile question that is NOT about
  wave 5.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/endgame.json --current
'evidence/2026-10-30/perseed-endgame-r74/*.json' --metrics
won,announceDay,satSeatKind` → LOUD: won newly appeared (baseline 0 ->
current 5, n=7); LOUD: announceDay newly appeared (baseline 0 -> current
457, n=7). Verdict: EXPLAINED — the baseline file contains only
maxTier/satPenalty from an older regime and says so itself; won/
announceDay are not in it at all. Not a bug, baseline not rolled.
