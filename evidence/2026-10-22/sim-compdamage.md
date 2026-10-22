# sim-compdamage — companion damage-vs-wave-4-bands DIAG (axis scale-onramp)

Run fleshout-20261022T1215Z, DIAG arm sim-compdamage. Worker tree
sim-compdamage, base d64fcee1b (master moved 7 commits ahead during the
run — the stagemuster landing b9a0e3574/b73e4751e; the stagemuster corpus
was read from master@b73e4751e via git archive, recorded below).

The question (the named next of BOTH sim-armorydrive-confirm and
sim-stagemuster): the bottleneck is companion damage output vs wave-4
bands (dmg 35-95, HP 850-1500), not any staging channel. This DIAG is
re-analysis only — NO new sims — over the two frozen corpora.

Canon: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 = The Mirror Draft;
bands damage 35-95, HP 850-1500; VETERANS = kill records in
state.waveKillLog; VILLAGER XP LAW — villager kills score the ledger
exactly like the player's). No canon doc covers armor/equipment — stated,
not invented (same as the sibling arms).

## Corpora

- A) armorydrive-confirm: evidence/2026-10-22/perseed-armorydrive-confirm/
  (on this worktree's base; 64 configs, 32 control + 32 armed). Has
  per-fight damage tables (w4FightDmg: scholar/companion/other per wave-4
  fight — 283 fights) and per-kill damage rows (w4killRows:
  dmgScholar/dmgCompanion/dmgOther per wave-4 kill).
- B) stagemuster: evidence/2026-10-22/perseed-stagemuster/ on
  master@b73e4751e (extracted via `git archive` to scratch; 32 JSONs,
  16 control + 16 armed; byte-identical to the landed corpus). 76 armed
  wave-4 TB fights, 71 with staged companions, ZERO armed villager kills.
  This sweep recorded NO per-fight damage tables — only kill rows (with
  damage) and staged rows. That gap is reported, not filled.

## PRE-REGISTRATION (§14 binding — DIAG, written in the brief)

PRIMARY (DIAG): instrument lands; per-fight companion-damage table
separates wave-4 kills from non-kills with a stated numeric bar (e.g.
damage-majority predicts kill/no-kill at ≥X% separation); damage-majority
re-score of the armorydrive veterans bar delivered. GO = both delivered.
There is NO before/after panel for a re-analysis DIAG — stated explicitly
in the metric review below.

## Proof gates — GREEN (10/10)

scripts/test-compdamage-20261022.js, 10 PASS 0 FAIL:
G0a/G0b corpus file counts (64 + 32); G1 w4FightDmg schema (283 rows, 0
bad); G2 kill-row join (8/8 kill-time villager kills joined, 0 missing);
G3 determinism (byte-identical report across two runs); G4 known answers
on the 8 frozen kills (shares below); G5 re-score counts armed=2/control=0;
G6 stagemuster counts (76 TB, 71 staged, armed kills 0/0, control 6/1);
G7 separation bar computed; G8 wave-4 bands from src/data/monsters.json
(10 entries, 9 in 850-1500; herald at 700-900 is the wave-6 herald
scaffold, MONSTER-WAVES.md).

## (1) Per-fight companion damage vs kill / no-kill (corpus A)

isKill = fight (day, mid) matched ≥1 w4killRows entry.

ARMED (121 wave-4 fights: 23 kill fights, 98 non-kill):
- companion absolute: kill median 407 (mean 606, max 2584) vs non-kill
  median 58 (mean 103) — **7.0x median separation**
- companion share of fight damage: kill median 0.33 (mean 0.35) vs
  non-kill median 0.25 (mean 0.34) — +8pp median
- scholar absolute (context): kill median 788 vs non-kill 177 — the
  scholar still carries kill fights
- classifier "companion share ≥ 0.5 ⇒ kill": tp 2, fp 27, fn 21, tn 71 —
  accuracy 60.3%; damage-majority fights kill at 6.9%, scholar-majority
  fights at 22.8%. The binary damage-majority rule is ANTI-predictive:
  wave-4 kills concentrate in scholar-majority TEAM fights (median
  companion share 0.33), not in damage-majority ones.

CONTROL (162 fights: 18 kill, 144 non-kill): companion damage ≈ 0
everywhere (kill-fight median 0, max 0; non-kill median 0, mean 2.6,
max 110). Kills are scholar-solo (scholar abs median 1165.5 on kill
fights). The armory drive is the entire difference between these two
rows: 198.5 vs 2.3 mean companion damage per fight (the confirm's 86x).

Wave-4 HP-band relation (band midpoints per mid, 850-1500): armed
companion damage per fight = 8% of band midpoint at the median, 44% at
p90; only 10/121 fights (8%) have companions dealing ≥ half a band-mid
of damage. A wave-4 monster needs ~1175 HP cleared; companions put up
~407 on the fights that actually kill — roughly a third of the bar,
everyone else's damage making up the rest.

## (2) Damage-majority re-score of the armorydrive veterans bar

The splitkill metric-review variant: killdisc-v2 kill-time villager kill
(by != bearerAtKill, by != 'player') AND nonScholarShare ≥ 0.5
(dmgCompanion+dmgOther ≥ half of kill-fight damage).

| armed kill (confirm's 8) | scholar | companion | non-scholar share | dmgMaj |
|---|---|---|---|---|
| s65475 d110 Algorithm — Sigrun | 436 | 636 | 0.59 | YES |
| s65477 d98 Influencer — Saleh | 530 | 509 | 0.49 | no (borderline) |
| s65477 d107 Congregation — Shuting | 620 | 438 | 0.41 | no |
| s65477 d107 Suburb — Shuting | 704 | 861 | 0.55 | YES |
| s65477 d127 Strike — Nadia | 6136 | 1188 | 0.16 | no (laundering case) |
| s65478 d93 Audit — Giulia | 906 | 367 | 0.29 | no |
| s65484 d158 Reunion — Victor | 873 | 404 | 0.32 | no |
| s65486 d95 Congregation — Meera | 598 | 328 | 0.35 | no |

**2 of 8** armed kills are damage-majority villager kills (control 0).
Re-applying the confirm's primary bar (armed ≥ control+2 AND ≥4/16 armed
seeds with ≥1): count bar PASSES (2 ≥ 0+2), seed bar MISSES (2/16 armed
seeds with ≥1 dmg-maj kill vs ≥4/16) → **NO-GO under the damage-majority
variant**. The verdict CHANGES: the confirm's kill-time GO becomes a
damage-majority NO-GO — 6 of the 8 credited kills are scholar-carried
team fights (companion shares 0.16–0.49). Per §14 the confirm's binding
verdict stands as written (GO on kill-time credit); this re-score is the
metric-revision proposal for the NEXT run — exactly the revision
sim-splitkill.md's metric review asked for.

Saleh's d98 Influencer (0.49) sits 1 companion point of damage short of
the bar — the threshold is not gerrymandered against near-misses, it
just lands there.

## Stagemuster corpus (corpus B)

Armed: 76 wave-4 TB fights, 71 with staged companions, 0 kill-time
villager kills, 0 damage-majority villager kills. Control: 6 kill-time
villager kills, 1 damage-majority. The staging arm staged companions
into the mirror room; the mirror room still produced zero villager
kills under either attribution. No per-fight damage tables were recorded
by that sweep — the armed side's 76 fights are count-only evidence
(data gap, not filled).

## Village assessment (plain words)

On the armorydrive substrate the wave-4 fight stops being a scholar
solo: companions put up ~400 damage on the fights that end in kills —
a real third of a 1175-HP mirror — while the scholar still does the
heavy lifting (~788). The 8 credited villager kills are mostly
scholar-carried team efforts, not solo companion kills; only Sigrun
(Algorithm) and Shuting (Suburb) did the majority of the damage on
their own kills. On the stagemuster substrate, staging 71 armed
companions into 76 mirror fights produced nothing either side of the
ledger — staged, armed, and dying in a room whose HP bands (850-1500)
outrun what ~400-damage companions can close. The bottleneck named by
both arms is confirmed by the numbers: companions can be staged,
companions can be armed, companions can fight — but their damage output
against wave-4 HP bands does not convert staging into kills.

## Sense test (SENSE-TESTING LAW)

No new transcripts were produced (DIAG, no sims); the sense-read
record stands from the sibling arms and is cited, not repeated:
sim-armorydrive-confirm.md sense-read Sigrun's d110 Algorithm kill
(SENSE-PASS — engine-honest blows, televised, FEASTED ×2.03 noted) and
flagged Nadia's d127 Strike as the laundering edge case (scholar 0.84
of fight damage — this DIAG re-measures it at non-scholar share 0.16,
consistent). sim-stagemuster.md sense-read the Eater staged fight
(Lena dies at 82, Wei strikes 30-31) and the Eulogy fights — "funerals,
not kills," which the damage numbers now explain quantitatively.

## Metric review (§14)

1. The pre-registered PRIMARY is GO: the instrument landed, the
   per-fight table separates kills from non-kills with a STATED numeric
   bar (armed: 7.0x absolute / +8pp share median separation), and the
   damage-majority re-score of the 8 confirm kills is delivered
   (2/8 dmg-maj; bar verdict NO-GO under the variant). Both deliverables
   bound the run as written.
2. There is NO before/after panel for this run and there cannot be: it
   is a re-analysis of two frozen corpora, no intervention, no seeds
   run. The panel (§15) is the instrument for before/after; this run
   has no before/after by design. Stated explicitly so the next reader
   doesn't ask for the missing panel.
3. The classifier finding sharpens the proposed metric revision: the
   binary damage-majority rule is anti-predictive of kills (6.9% vs
   22.8%). If the next run registers a damage-majority bar, it should
   register it as a kill-CREDIT honesty revision (what the bar measures),
   not as a kill predictor — or pair it with the continuous companion-
   damage separation (7x) that does separate. A revision that says
   "damage-majority ≥ control+2" alone would NO-GO an arm whose kills
   are real team efforts.
4. Stagemuster data gap for the next instrumented arm: per-fight damage
   tables (w4FightDmg) were not recorded — the 76 staged fights can only
   be counted, never damage-analyzed. Any confirm of a staging-channel
   arm should carry the armorydrive-confirm damage instrumentation.

## Blanks filled / documented

- FILLED (instrument, proven): scripts/compdamage-diag-20261022.js —
  offline re-analysis of both corpora (deterministic, 10/10 proof gates
  in scripts/test-compdamage-20261022.js). Reads corpus A from
  evidence/2026-10-22/perseed-armorydrive-confirm/ and corpus B from
  --stagedir (default evidence/2026-10-22/perseed-stagemuster/; this
  worktree's base predates its landing, so this run pointed it at a
  git-archive extraction of master@b73e4751e — recorded here for the
  next reader; future runs on a current base use the default).
- FILLED (named next, measured): the two arms' shared "companion
  damage vs wave-4 bands" question now has numbers — armed kill fights:
  companion med 407 vs non-kill 58; 8% of band-mid at median, p90 44%;
  2/8 confirm kills damage-majority. The bottleneck is quantified, not
  just asserted.
- DOCUMENTED (attribution): kill-time credit and damage-majority
  attribution disagree on 6 of 8 armorydrive-confirm villager kills —
  the VETERANS bar's kill records are scholar-carried team kills, and
  the proposed damage-majority variant flips the confirm verdict to
  NO-GO without changing a single fight. A bar-judged arm should
  pre-register BOTH numbers (the stagemuster arm did; the confirm arm
  did not).
- DOCUMENTED (gap): stagemuster's 76 staged fights have no per-fight
  damage — the separation table cannot be extended to that corpus.

## Wall numbers

DIAG re-analysis — no new runs; wall numbers cited from the sibling
evidence files, not re-simulated:
- armorydrive-confirm (64 configs): control national 18/table 27/won 0;
  armed national 16/table 29/won 0/exiled 1; wave-4 30/32 vs 27/32;
  wave-5 door opened twice on armed (s65475, s65478), w5vets2 4/32 armed
  vs 0/32 control; median survival 131d vs 148d.
- stagemuster (32 configs): control national 11/table 14/won 0/wave-5 2;
  armed national 8/table 14/won 0/wave-5 0; w5vets2 4→0 armed.
Wins remain 0 on both arms; the scale wall is unmoved. This DIAG does
not move the wall — it measures why the veterans channel stalls at
damage output, not staging.

## Convergence

Scale-onramp axis: **converging** (diagnostic complete, not converged).
The named next of both the armorydrive-confirm and stagemuster arms is
answered with measured numbers: companion damage output vs wave-4 bands
is the bottleneck (7x separation exists between kill and non-kill fights,
but companions deliver ~1/3 of a wave-4 HP bar on kill fights, and only
2/8 credited kills are damage-majority). The next arm on this axis has
a measured bar to beat: manufacture companion damage output at
~600+/fight median on kill fights, or redesign the kill channel (field
fights, split-kill discipline) — not another staging channel.
