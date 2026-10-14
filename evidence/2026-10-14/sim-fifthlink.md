# ARM "fifthlink" — the tend-vs-decay race on 5th+ links (scale-onramp) — KILLED

Worktree: `~/workspace/worktrees/sim-fifthlink`. Run: oversight-flesh-out-loop, run 2026-10-14T02:16:00Z, axis scale-onramp.
Finding: sim-findings.md "late-link trust lag" (scale/diplomacy, 2026-10-14) — the r21 fourthlink arm measured that the uncapped LEAD road reaches 4-6 links but the 5th+ link stalls: armed s55's 5th lead link (formed d49) sat at trust 24 on day 30 despite 9 tend weeks.
Commit under test: worktree tip 54a29088. No game-code changes — policy layer + instruments + evidence only. No base files modified (verified via git status: all new files).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sim

- **Question**: can a policy-side layer win the tend-vs-decay race on 5th+ lead links — read each live link's trust + recent tribute history, prioritize honest tend actions toward thin links (trust<30 or short-tribute weeks), budget against the decay linkTick applies?
- **Primary metric**: seeds where a 5th lead link SEASONS (30+d, trust 40+) on 8 seeds × leadcourt-FOURTHLINK, identical-seed before/after.
- **GO**: armed ≥2/8 AND armed ≥ baseline+2. (Baseline MEASURED, not assumed.)
- **Guardrails**: median survival within ±10d of identical-seed baseline; national not below baseline on identical seeds.
- **Horizon**: 180d death-aware (Steve's WIN-PATH HORIZON 180).
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt (FOURTHLINK=1 both sides; armed adds FIFTHLINK=1).
- **Proof**: `scripts/test-fifthlink-20261014.js` — REAL RED phase (scripted in-engine race: baseline lets a thin link decay 24→14 net-negative; the layer flips it 24→54 net-positive).

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

## Diagnosis (scripts/diag-fifthlink-s55-20261014.js) — the race, day by day

Replayed leadcourt s55 (FOURTHLINK=1) and traced the 5th link (formed d48, trust 30):

| day | trust | event |
|---|---|---|
| d49 | 30→28 | tribute: nothing (empty fields), −2, arrears +4000 |
| d50 | 28→36 | tend +8 (landed) |
| d55 | 36→28 | succession crisis (Haven leader death), −8; young-link renegotiation staged |
| d56 | 28→36 | tend +8; tribute nothing, −2 |
| d62 | 36→28 | succession crisis, −8; renegotiation staged again |
| d63 | 28→36 | tend +8; tribute paid, +1 → 37 |
| d66 | 37→29 | succession crisis, −8 |
| d70 | 29→37 | tend +8; tribute paid, +1 → 38 |
| d74 | 38→24 | succession crisis, −14 ("pressed tribute down in Haven's chaos"); MOURNING (gains blocked) |
| d77–80 | 24 | tend calls REFUSED in mourning ("the grain waits", paid=0, no stamp) |
| d81 | 24→32 | tend +8 (mourning lifted) |
| d84 | 32→33 | tribute paid, +1 |
| d87 | 33→25 | succession crisis, −8; MOURNING; run ends d89 village-lost |

Race losers, in order: (1) succession haircuts −8/−14 on Haven leader deaths; (2) **two UNANSWERED young-link renegotiation beats** (−6 each on 7-day expiry — leadcourt never clicks `answerRenegotiation`; winseek.js already answers them, leadcourt/competent never adopted it); (3) thin-tribute decay −1/−2 per short week while their fields ran dry. Tends landed +40 but couldn't outrun −38 of losses.

Engine subtlety found while proving: for primary-Haven links each `linkTick` call IS a tribute week (no week-1 settlement grace like the subordinate-Haven branch); the `lastLinkWeek` guard makes it fire once per week.

## The layer (scripts/policies/fifthlink.js, FIFTHLINK=1, default OFF) — DELETED per kill protocol

Gate off → exported fourthlink itself (inert; proof R2). Gate on → fourthlink.daily + `fifthlinkLayer`, honest engine verbs only, no engine edits:

1. **Young-link grief, answered**: `answerRenegotiation(link.id, 'gift'|'visit')` on live primary-Haven links — gift (1,500 kcal, +8, same pricing as a tend) when pantry > 8000, visit otherwise (winseek's bar). Swing per beat vs baseline's silence: +8 vs −6 = +14.
2. **Thin-first tends at the lower gate**: the base tends every link at pantry > 20000 and none below; the layer tended THIN links first when the pantry sat between the 12000 courtship floor and the fat gate — never spending below 12000. Thin = trust<30, or 2+ short-tribute weeks in the last 3 read from the link's own tribute history ("paid thin:" / "paid nothing" notes). `tendedWeek` deduped against the base's pass.

Budgeting: every grain spent was the same 1,500 kcal the base already spends per tend; the layer never touched the tribute the subordinate owes (their fields are the engine's honest economy — no policy verb feeds their pantry).

Proof: `scripts/test-fifthlink-20261014.js` 14/14 green — R1 REAL RED (baseline 24→14, net −10), R2 gate-off = fourthlink, G1 layer flips it (24→54, net +30), G2 gift answers the beat (+8) vs baseline expiry (−6), G3 history-thin (35→57 vs baseline 35→25).

## Results — GO MISSED → KILL

Baseline (FOURTHLINK=1, 8 seeds, `evidence/2026-10-14/sim-fifthlink-base.json`):
- PRIMARY: 5th-link seasoned **0/8** (5th formed on 2/8: s44 d71, s55 d49)
- median survival 84d; national 4/8; wave4 4/8; wave5 0/8; table 0; won 0; maxStanding 161
- Cross-check: 6/8 rows byte-identical to the fourthlink arm's armed leadcourt rows (days + Standing + linksSeasoned + national); s66/s77 diverged by landed commits since (takeFromPantry zero-trust 54a29088, spoilsmoke ce1c680c) — the baseline was re-measured on the current tree, which is what the armed run compares against.

Armed (FOURTHLINK=1 FIFTHLINK=1, per-seed files `evidence/2026-10-14/sim-fifthlink-armed-s*.json`):
- s11: 5th −, d41 | s22: 5th −, d45 | s33: 5th −, d51 | s44: **HANG** (see below)
- s55: **5th SEASONED d78** (formed d49, trustAt30=40, 10 tend weeks), d80, Standing **170** (vs 136 baseline), national 1
- s66: 5th −, d39 | s77: 5th −, d124, Standing 161 | s88: 5th −, d109, Standing 136
- PRIMARY: **1/7 measurable** (s44 unmeasurable) — vs 0/8 baseline.
- GO (≥2/8 AND ≥ baseline+2): **MISSED** → KILL per §14. Layer file deleted; no base edits to revert.

Guardrails on the 7 measurable seeds:
- Survival per-seed: 6/7 byte-identical days (s11/s22/s33/s66/s77/s88), s55 89→80 (−9d). Script-median 84→51 is driven by s44's exclusion (89d) from the set, not by faster deaths — no seed died earlier than −9d.
- National per-seed: identical (s55/s77/s88 = 1 both sides; others 0). Not below baseline. ✓
- Wave4/table/won: no regression per-seed. ✓

The s55 win, in detail: the layer answered two young-link renegotiations with grain (+8 each; baseline let both expire at −6) and thin-tended the 5th link; it seasoned at trust exactly 40 on day 78 (baseline: 24). Standing 136→170 (+34 = the 5th seasoned link). The mechanism works — the threshold didn't.

### The s44 hang (engine bug, filed in sim-findings.md)

Armed s44 never completes: a turn-based fight vs **The Focus Group** (289 HP, day 61) grinds 500k+ rounds without resolving (`[DF] exit: loop-end guard=201 ... round=535598 over=false`, repeating). Baseline s44 completes (d84) — the armed trajectory's RNG divergence walks into the encounter. The layer doesn't touch combat; the stalemate is a pre-existing engine pathology (both sides whiff forever; driveFights' no-progress guard never fires because HP/positions keep shifting). Filed as [open] in sim-findings.md — needs a lever run or Steve call; out of this arm's scope (no game-code changes allowed).

## Village assessment

The uncapped LEAD road courts 4–6 villages and tends them weekly, but the 5th+ links live in a harsher world than the first four: their subordinates are usually late-formed splinters with dry fields (tribute nothing for weeks), and Haven's own leader deaths shake every link (−8 a death). On s55 the village fed five bonds at once — 104 tend-week equivalents across the run — and the fifth bond seasoned because the grief beats got answered instead of expiring. The villages that die early (s11/s22/s33/s66, d39–51) never form a 5th link at all; there the mortality wall binds first and no diplomacy lever can help. The diplomacy ceiling is real but narrow: even with the layer, only seeds that both survive past ~day 75 AND court a 5th village see any gain — on this suite, exactly one.

## SENSE-TESTING (scripts/sense-fifthlink-20261014.js, seed 55, narration on)

The 5th link's history (The Bloodied, formed d48) reads as village diplomacy, not theater:
- d49: "The Bloodied paid nothing — empty fields. Arrears +4,000." — the shortfall is said aloud, with the reason (empty fields, not defiance).
- d55/d65: "Met grief with grain (4,000 kcal, trust +8); the tribute leverage never landed." — the renegotiation answer is the engine's designed fiction (grief met with grain), and the layer clicked it instead of letting the silence answer.
- d71: "The Bloodied pressed tribute down in Haven's chaos." — succession leverage lands, said aloud.
- d75/d81: "Another death while the link already grieves — the grief is priced in; the new speaker inherits the same table." — coalesced grief, no multiplication.

Every trust move has a named cause; the tended link's story (dry fields → grain sent → grief answered → seasoned at 40) is legible. The one wrinkle: tend notes report whole-unit takes ("Haven sent grain (4,320 kcal...)") larger than the 1,500 kcal price — honest per the whole-unit take doctrine, but a player reading "4,320" may wonder where the number came from. Noted, not chased.

## Blanks filled / documented

- **Measured** (not chased): the tend-vs-decay race is now quantified end to end — proof 14/14 in-engine, s55's day-by-day replay, and the 8-seed pilot. The layer works (s55: 5th seasoned, +34 Standing) but missed the pre-registered GO.
- **Documented** (sim-findings.md): (1) the s44 infinite Focus Group fight — engine bug, needs its own arm; (2) the late-link trust lag item updated with this arm's outcome; (3) metric-design note: 5th links form on ~2/8 seeds, so an absolute ≥2/8 GO demands ~100% conversion — the denominator should be forming seeds.

## Metric review (§14)

GO missed: armed 1/8 (1/7 measurable) vs ≥2/8 required. Per §14 this is NO-GO, not re-scored — the layer is killed.

The metric proved miscalibrated, and the revision is for the NEXT run: the GO denominator (all 8 seeds) assumed 5th links form widely; they form on ~2/8 baseline seeds (s44, s55). No tend layer can season a link that never forms, so ≥2/8 demands near-100% conversion of forming seeds. A better primary: 5th-link seasoning **conditional on formation** (baseline 0/2 → armed 1/1 measurable on this suite), or an intermediate metric (seeds where a 5th link reaches trust ≥30 by day 30). Also: the s44 engine hang made one seed unmeasurable — future pilots on this road should pre-screen seeds for the Focus Group stalemate or carry a fight-round budget.

Honest counterpoint recorded: the layer's real measured effect (1 conversion on the only measurable forming seed, +34 Standing, zero guardrail regressions, 14/14 proof) is a working lever killed by a miscalibrated threshold — the textbook false-kill the throughput notes warn about. §14 still binds: killed, with the revision proposed for next run rather than applied to this one.

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianSurv |
|---|---|---|---|---|---|---|---|
| baseline (8) | 4/8 | 0/8 | 0/8 | 4/8 | 0/8 | 161 | 84d |
| armed (7 measurable) | 3/7 | 0/7 | 0/7 | 3/7 | 0/7 | 170 | 51d* |

\* median on the reduced set; per-seed survival identical except s55 −9d (see guardrails). s44 armed unmeasurable (engine hang).
