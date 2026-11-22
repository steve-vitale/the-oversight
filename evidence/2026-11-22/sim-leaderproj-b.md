# sim-leaderproj-b — the leader-PROJECTION gate (Loop B run fleshout-loop-b-20261122T1630Z)

**Verdict: NO-GO — D1, D2, D3 fail; D4, D5 pass; M1–M3i + analyzer selftest all green; M5 passes.**
**Classification (§14a): METRIC-BROKEN.** The gate fires (8 times) and keeps every
projected-collapse leader out of every door the armed leg fought (S10 armed:
0 dead/collapse bands vs control's 2 of 3) — but the D1 attribution mechanism
cannot see the gate's avoids: gate-avoid notes are written to the leader's
expedition record, which `expeditionReturn` deletes when the leader comes home
(`src/js/villager-agency.js:1097`; death path `:1011`), and avoided meetings
write no `v4encounters` row at all. The end-of-run note census therefore sees
9 fires as 1 note. D1 scores both pool doors as "divergence" = BAD by the
frozen rule, not because the gate failed but because the instrument is blind.
D2/D3 fail on a 3-vs-5-door band where one door swings the rate by 13pp+ —
thin-band noise, not a lever signal. The lever stays env-gated / default-OFF
exactly as built. **No default flip. No game-code change lands from this arm.**

## The question (finding #2619, next step after the leaderhpgate NO-GO)

The leaderhpgate pilot proved the leader-HP floor mechanically live but
subsumed (never fired once; both legs trajectory-identical; NO-GO kind
CONCEPT-DEAD). Its §9 named this arm verbatim: refuse a wave-4+ door when
the leader is projected at or below the floor within 2 rounds of focused
wave-4 damage (~25 HP/round), not when they are already below it. The
projection gate sits after LEADERHPGATE in `expeditionMonster`
(`src/js/villager-agency.js`, +45/−0, env-gated `LEADERPROJ=1`): leader HP
≤ 75 (projected ≤ 25 after two rounds) on a pinned wave-4+ door → refuse
with the avoid verb, counter `st.leaderprojFires`, narrated note. No RNG;
off-mode byte-identical (proof §5).

## Frozen bars (judged as frozen — a miss is NO-GO, never re-scored)

Band 107391–107398, FRESH (zero hits in preregs + evidence at freeze).
Anchor `1c11dbb14` (full `1c11dbb149a660b7946aaefb2e95c29c14bf5548`), policySha
`1884c8852d38`. Substrate both legs: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1
DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`; armed adds `LEADERPROJ=1` only. Horizon
150d, death-aware. 8 seeds/leg, chunked 4/call. 0 instrument errors on all
16 judged corpora; every corpus file carries the frozen anchor + policySha
(D5 verifies).

| Bar | Control | Armed | Bar | Result |
|---|---|---|---|---|
| M1 `test-allyslot3-b.js` | — | — | 18/18 | **18/18 PASS** |
| M2 `test-pinquaddoor-b.js` | — | — | 35/35 | **35/35 PASS** |
| M2w `test-pinquaddoor-wide-b.js` | — | — | 16/16 | **16/16 PASS** |
| M3 `test-dmgpin-b.js` | — | — | 29/29 | **29/29 PASS** |
| M3d `test-doorflee2-b.js` | — | — | 49/49 | **49/49 PASS** |
| M3e `test-downedtwice-b.js` | — | — | 25/25, exit 0 | **25/25 PASS** |
| M3f `test-hypofloor-b.js` | — | — | 48/48 | **48/48 PASS** |
| M3g `test-hpgate-b.js` | — | — | 43/43 | **43/43 PASS** |
| M3h `test-leaderhpgate-b.js` | — | — | 50/50 | **50/50 PASS** |
| M3i `test-leaderproj-b.js` (NEW) | — | — | 55/55 | **55/55 PASS** |
| Analyzer selftest | — | — | 30/30 | **30/30 PASS** |
| D1 matched-pool bad rate (PRIMARY) | 1/2 = 50% | 2/2 = 100% | armed ≤ control − 20pp | **FAIL** (−50pp) |
| D2 kill rate / fought door | 0.667 (2/3) | 0.600 (3/5) | ≥ control − 2pp | **FAIL** (−6.7pp) |
| D3 damage / door | 1157.3 | 804.4 (0.695×) | ≥ 0.9× control | **FAIL** |
| D4 mechanism engagement | 0 fires | 8 fires | armed ≥ 1 | **PASS** |
| D5 substrate sanity | 0 bad | 0 bad | all flags + anchor + policy | **PASS** |
| M5 guardrail | — | — | panel review_required, no regression_signal; starvation ≤ control+2; median ≥ 0.8× control | **PASS** (review_required, no regression_signal; starvation 1 vs 3; median 150 vs 150) |

## Door-fight table (every fought door, both legs)

Control fought 3 doors (vKill 2, vDie 1, vFlee 0, mFlee 0); armed fought 5
(vKill 3, vDie 0, vFlee 1, mFlee 1). Leader entry HP + projection band
(projHp2 = HP after two rounds at 25/round; bands: dead1/dead2/collapse2/safe).

| Leg | Seed | Day | Monster | Wave | Rounds | Outcome | Dealt | Leader HP | Band (projHp2) |
|---|---|---|---|---|---|---|---|---|---|
| Control | 107391 | 65 | reunion | 4 | 6 | vKill | 1270 | 86 | safe (36) |
| Control | 107391 | 98 | reunion | 4 | 3 | vDie | 892 | 61 | collapse2 (11) |
| Control | 107394 | 113 | rerun | 5 | 6 | vKill | 1310 | 38 | dead2 (−12) |
| Armed | 107391 | 65 | reunion | 4 | 6 | vKill | 1270 | 86 | safe (36) |
| Armed | 107391 | 100 | suburb | 4 | 1 | vFlee | 236 | 83 | safe (33) |
| Armed | 107392 | 57 | eulogy | 4 | 7 | vKill | 1018 | 88 | safe (38) |
| Armed | 107392 | 97 | audit | 4 | 3 | vKill | 1166 | 80 | safe (30) |
| Armed | 107395 | 143 | eulogy | 4 | 3 | mFlee | 332 | 78 | safe (28) |

Read it plainly: the control leg fought 2 of its 3 doors with the leader
projected to collapse (dead2 1 + collapse2 1); the armed leg fought ZERO
doors in any collapse band — all 5 safe. The gate did exactly what it was
built to do to the doors it fought. The doors it refused never appear in
either table: refused meetings write no encounter row.

## Matched-pool table (D1 — the primary)

Pool = every CONTROL fought door whose leader entered ≤ 75 HP (2 doors).
Armed outcome on the SAME door (same seed + day + monster):

| Seed | Day | Monster | Control outcome | Leader HP | Armed outcome | D1 score |
|---|---|---|---|---|---|---|
| 107391 | 98 | reunion | vDie (3 rounds) | 61 (collapse2, proj 11) | divergence — no armed row, no gate note | BAD |
| 107394 | 113 | rerun | vKill (6 rounds) | 38 (dead2, proj −12) | divergence — no armed row, no gate note | BAD |

Armed bad rate 2/2 vs control 1/2 → drop −50pp, bar ≥ +20pp. **D1 FAILS.**
Both pool doors "diverged": the armed trajectories had already moved on
(the gate fired on both seeds — 107391 ×1, 107394 ×1 — and the worlds
diverged from there), so the d98/d113 meetings never recurred, and the
frozen rule scores divergence BAD. Whether either fire WAS the pool door
is unprovable from the corpora: the gate's only per-door record is the
note, and the notes are gone (see Diag).

## Gate fires + notes (S8/S9)

| | Control | Armed |
|---|---|---|
| `leaderprojFires` (counter) | 0 | **8** (107391 ×1, 107392 ×5, 107394 ×1, 107395 ×1) |
| `hpgateFires` (whole-party) | 0 | 1 (107394) |
| `leaderhpgateFires` | 0 | 0 |
| Gate-avoid notes persisted | 0 | **1** — hold only: 107394 congregation, Brian 9 HP ("gave congregation room — Brian is too hurt to hold a door (9 HP)") |
| Projection notes persisted | 0 | **0** |

9 fires, 1 note. The 8 projection fires left no per-door trace anywhere
in the corpora. D4 passes on the counter; D1/S9 cannot attribute a single
fire to a single door.

## Wall numbers (control vs armed, 8 seeds)

| | Control | Armed |
|---|---|---|
| Wins | 0/8 | 0/8 |
| National (scaleRank ≥ 2 / standing ≥ 200) | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wave-4 unlocks | 8/8 | 8/8 |
| Wave-5 unlocks (maxWave 5) | 4/8 | 6/8 |
| Median survival | 150d | 150d |
| Village deaths (total) | 727 | 780 |
| Deaths / 100d (panel) | 68.54 | 66.57 |
| Starvation deaths | 3 | 1 |
| Villages lost | 1 (107392 d71) | 1 (107394 d120) |

No seat movement anywhere (the wall stands: wins 0, national 0, table 0
on both legs). The armed leg's extra wave-5 unlocks (6 vs 4) ride the
107391 trajectory change (standing 199 → 755) — arrival luck on a
diverged world, not a gate effect; the gate refuses doors, it does not
open the wave-5 road.

## Sense test — read the doors as a person would

**Pool door 1 — control 107391 d98 reunion, vDie (3 rounds), leader Hasna
at 61 HP (collapse2, projected 11).** The quad charges in as one —
"Utpal is already at the door too — charges in with Hasna! Tariq is
already at the door too — charges in with Hasna! Kambale is already at
the door — charges in with Hasna!" Coordinated strikes land (Utpal 144,
Tariq 86), then "R1: Your Move hits Kambale for 37 (33 left)". The
projection was right: Hasna entered at 61 with two rounds of focused
damage ahead of her, and the village died in the room. This is the door
the gate exists for — and on the armed leg the d98 meeting never
happened at all (the gate had already fired once on this seed and the
world had moved on).

**Pool door 2 — control 107394 d113 rerun, vKill (6 rounds), leader Jovan
at 38 HP (dead2, projected −12).** "Jovan walks straight into The
Rerun. No avoiding it." Six rounds, Blooded 1.5×, the quad kills it
(1310 dealt). The forecast was WRONG here: projected dead in two rounds,
alive and killing in six. This is the prereg's own worked warning (the
d112 eulogy shape) — a pool door the gate would refuse that the village
won. The gate's price includes refusing winnable doors; D2/D3 are the
guards for exactly that, and on this thin band they cannot clear it
(see Metric review).

**Armed door — 107392 d97 audit, vKill (3 rounds), leader Vasyl at 80 HP
(safe, projected 30).** Tripwire set, Rage burning ("Vasyl's eyes go
red. Next 3 strikes hit twice as hard"), the quad kills in three rounds
(1166 dealt, Thao 156). Reads as people fighting smart with a healthy
leader — the gate left this door alone, correctly.

**The one surviving gate note — armed 107394, congregation, Brian 9 HP.**
"gave congregation room — Brian is too hurt to hold a door (9 HP)" — a
whole-party (hold) fire, not a projection fire. It is the ONLY gate-avoid
note in all 16 corpora. The meeting itself left no encounter row
anywhere: on the armed leg there is no congregation row in
`v4encounters` at all, and on the control leg the congregation meeting
never occurred. An avoided meeting exists only as its note — and the
note's home is deleted when the expedition ends.

## Diag — why the instrument is blind (verified, not assumed)

1. **The note is written, then destroyed.** The projection gate pushes its
   note to `st.exped[vid].encounters` (`villager-agency.js`, in the
   `LEADERPROJ` block after LEADERHPGATE). `expeditionReturn` deletes
   the whole entry — `delete st.exped[vid]` (`villager-agency.js:1097`)
   — when the leader comes home; the death path does the same (`:1011`).
   The driver's end-of-run census reads the LIVE `exped` state, so it
   sees only notes from expeditions still open at day 150.
2. **Avoided meetings write no encounter row.** The gate returns before
   `fieldFight`, and no `v4encounters` row is recorded for a refused
   meeting (verified: zero congregation rows on the armed 107394 corpus
   despite the persisted hold note for that meeting). The note is the
   ONLY per-door record of an avoid.
3. **The counter survives; the attribution does not.** `st.leaderprojFires`
   is an agency-state counter that persists to end of run (8 fires read
   off the corpora). The per-door notes do not. D4 (counter ≥ 1) passes;
   D1/S9 (note attribution) cannot see a single fire.
4. **The proof test cannot catch this.** M3i (55/55) stages the gate in
   isolation, where the note push is verified against the live exped
   entry — the push works. What no staged proof checks is that the note
   survives to the end of a 150-day run. The defect is in the census's
   assumption (notes persist), not in the gate.
5. **Same class as the rejudge arm's blocker:** the launchfield-rejudge
   proof's §4 live run fails on `no-target` holder rows for the same
   reason — the frozen shape checks assume a game state the live
   trajectory no longer produces. Both arms hit test-strictness
   divergence exposed by trajectory change, not game defects.

## Probe + determinism tripwire

Probe (control config, 8/8 seeds, 0 instrument errors, anchor
`1c11dbb14`, policySha `1884c8852d38`): fought doors 3 (vKill 2, vDie 1);
D1 pool 2 doors, bad 1/2 = 50% (107391 d98 reunion vDie, leader 61;
107394 d113 rerun vKill, leader 38); S10 dead1 0 / dead2 1 / collapse2 1 /
safe 1. Seeds 107396–107398 added no fought doors (v4encounters 1/20/32,
pinFights 0 each). **Tripwire PASSES: the judged control leg reproduces
the probe's door table exactly** — same 3 fought doors, same
seed/day/monster/outcomes, per-seed summary lines identical (the driver
is deterministic per seed across processes; the earlier hand-joined
"8 pool doors, 7 bad (87.5%)" table was WRONG — joined `v4encounters`
without the analyzer's `isDoorFight` + rounds≥1 filter; the analyzer's
numbers govern).

## Metric review (judged as frozen; proposals for the NEXT run)

- **D1 is unmeasurable as built, not failed as a lever.** The
  matched-pool rule needs per-door attribution, and the only
  attribution channel (the note) is deleted before the census reads
  it. The gate fired 8 times and the armed leg fought zero
  collapse-band doors — the mechanism's effect is visible in S10
  (control 2/3 collapse, armed 0/5) but D1 cannot price it.
  **Proposal:** make gate-avoid notes durable — a dedicated
  agency-state array (e.g. `st.gateAvoids`) appended at fire time
  and never deleted at `expeditionReturn` — then re-judge D1 on a
  fresh band. Until the notes are durable, any door-avoiding gate
  priced on S9 attribution will fail D1 the same way.
- **D2/D3 on a 3-vs-5-door band are noise, not signal.** One door
  swings D2 by 13pp and D3 by ~20%; the armed leg fought MORE doors
  (5 vs 3) because the gate's avoids diverged trajectories
  (107391 pinFights 9 → 24, 107392 7 → 26), and the extra doors
  were a 1-round flee and a monster-flee. **Proposal:** the next
  run needs a door-richer band (or a 12–16-seed confirm) before D2/D3
  can bind — do not re-score this pilot's D2/D3.
- **Divergence is scored BAD by design, and it should stay that way
  for this arm** — but note the consequence: once the gate fires
  anywhere on a seed, the world diverges and the matched pool doors
  may never recur, so a working gate can fail D1 even with durable
  notes unless the fire IS the pool door. The re-judge should match
  on seed + monster with a day window, or price D1 on the counter +
  S10 bands, not on same-day recurrence.
- **D4's bar (≥ 1 fire) is too weak as written** — 8 fires with zero
  attributable avoids still passes it. The next run should pair the
  fire count with a durability check (notes persisted ≥ fires × 0.5
  or similar) so D4 cannot pass a blind gate.
- **Corrections to the record:** (a) the interim D1 table "8 pool
  doors, 7 bad" is withdrawn — analyzer numbers govern (2 doors,
  1 bad); (b) the interim M3h 48/50 was a flap artifact — the
  clean re-run on this tree is 50/50; (c) the rejudge arm's
  badShape=188 (no-target holder rows) is the same test-strictness
  class as the notes gap, not a game defect.

## Verdict section (per §14a)

**NO-GO kind METRIC-BROKEN.** D1 fails on a broken attribution
channel (notes deleted at expeditionReturn; avoided meetings write no
encounter row); D2/D3 fail on thin-band noise (3 vs 5 fought doors).
The lever itself is mechanically sound: proof 55/55, fires 8 times,
zero collapse-band doors fought on the armed leg, no substrate breach,
M5 cost bar passes (starvation 1 vs 3, median 150 vs 150), panel
`review_required` with no `regression_signal`. **Next lever (not this
arm's to build silently): a durable gate-avoid log + a re-judge of D1
on a fresh band.** The lever stays env-gated OFF; flipping it on is a
design call, not this arm's. The held pinquaddoor branch is untouched;
no pinquaddoor content anywhere in this arm (contamination check
re-verified from both diffs in full by the resume adoption).

## Files

- Prereg: `evidence/2026-11-22/sim-leaderproj-b-prereg.md` (frozen;
  TODO-PROBE filled from the analyzer: full 8-seed probe, 2-door pool)
- Instrument: `scripts/pinquaddoor-driver-b.js` (leaderprojFlag +
  leaderprojFires stamps + 'proj' notes parse), `scripts/analyze-leaderproj-b.js`
  (D1 matched-pool + S8b/S9 'proj' kind + S10, selftest 30/30),
  `scripts/test-leaderproj-b.js` (M3i, NEW, 55 checks)
- Probe corpora: `evidence/2026-11-22/perseed-leaderproj-b-probe/` (8 files)
- Judged corpora: `evidence/2026-11-22/perseed-leaderproj-b-control/` (8 files)
  + `evidence/2026-11-22/perseed-leaderproj-b-armed/` (8 files)
- Analysis: `evidence/2026-11-22/leaderproj-b-analysis.json` (analyzer --json;
  the analyzer exits 1 on a NO-GO verdict — the JSON is still written)
- Panel: `evidence/2026-11-22/leaderproj-b-panel.md` + `.json` +
  `leaderproj-b-panel-before.json.gz` / `-after.json.gz` (compare:
  `review_required`, no `regression_signal`)
- `src/` diff: the LEADERPROJ lever in `src/js/villager-agency.js` only
  (+45/−0). No default flip.
- Adoption note: the first adoption coordinator (ca934b25) stalled on the
  write flap (window from ~19:12:41Z, still active at 20:55Z) with the
  probe 5/8 done; this resume adoption finished the probe (107396–107398,
  one at a time, stdout to the exec pipe — never redirected to a file
  during the flap), ran both judged legs, the full proof battery, the
  panel, and this evidence. The flap cleared for writes ~21:03Z (26KB
  probes + git update-ref passing); the flap-watch log still showed
  A/B/G/H FAIL at 20:59:58Z — per-file selectivity, not a uniform clear.
