# sim-downedtwice-b — fix finding #2634: a downed companion is struck again and "goes down" a second time

**Verdict: GO — LAND (fix arm, finding #2634 fixed)**

**The answer in one paragraph.** A downed companion could be hit
again because the monster-phase ally pick hardcoded slot numbers 1/2
instead of indexing the live-allies list, and the "goes down!" fall
block fired on post-hit HP alone, so it re-fired — line and flat-30
fall wound included — on any re-hit. The fix (two edits, one file,
`src/js/fieldFights.js`) indexes `_liveAllies` for the pick and gates
the fall on the transition to 0. The proof test is RED before (4
fails) and GREEN after (25/25); the staged fixed fight reads true
("goes down!" exactly once, downed ally never struck again); and the
8-seed guardrail is trajectory-identical to control on all 8 seeds —
0 wins, 0 national, 0 table, wave 5 on 4/8, median survival 150.5d,
624 deaths, 0 downed re-hits on both legs — with the balanced-panel
compare at `review_required` and no `regression_signal`. Both halves
of the defect were real: targeting was already correct on master for
the two-slot case (proved by §2 GREEN-before) but wrong for the
three-slot shapes the held pin branch introduces; the narration guard
was genuinely missing and is now in place.

## 1. The defect, reproduced

Finding #2634 (Loop B arm sim-pinquaddoor-reprereg-b, run
fleshout-loop-b-20261121T0230Z, evidence/2026-11-21/sim-pinquaddoor-reprereg-b.md
§1/§8): on the pinned door fight 106705 d144 (audit, wave 4), Lenkina
(visjoin_132, ally slot 2, entered at 16 HP) is hit for 37 (0 left) —
"Lenkina goes down!" — and the next round the monster hits her again for
42 (0 left) — "Lenkina goes down!" a second time. She then lies at 0 HP
for the rest of the fight without striking (coherent — down, not dead),
but the re-hit at 0 HP with a repeated going-down line reads wrong.

The full transcript and rounds detail were recovered from the reprereg
corpus (`perseed-pinquaddoor-reprereg-b-armed/...-s106705-....json`,
v4encounters audit d144):

```
Borys + Lenkina + Zhasulan + Xavier vs The Audit, 1,281 HP, 4 rounds, vFlee
R1: Borys strikes 28, Zhasulan 18, Lenkina 25, Xavier 34 (monster 1281 → 1176)
    Lenkina's gear absorbs 30.
    R1: Assessment hits Lenkina for 37 (0 left)
    Lenkina goes down!
R2: Lenkina's gear absorbs 33.
    R2: Assessment hits Lenkina for 42 (0 left)
    Lenkina goes down!
    Borys strikes 23, Zhasulan 18, Xavier 29 (monster 1176 → 1106)
R3: Assessment hits Zhasulan for 13 (73 left); Borys fumbles (audit trick)
R4: Assessment hits Borys for 20 (18 left); Borys runs.
```

Rounds detail: R1 ally2Hp 16 → −21; R2 ally2Hp −21 → −63; R3/R4 ally2Hp
stays −63 (never struck again, never strikes). The R2 re-hit is the one
incoherent beat.

## 2. The mechanism (verified, not assumed)

The monster phase in `src/js/fieldFights.js` builds `_liveAllies` only
from allies with HP > 0 (correct), then picks the target with:

```js
if (hittingAlly) _hitAllyIdx = _liveAllies.length === 2
  ? (RR() < 0.5 ? 1 : 2) : _liveAllies[0];
```

The two-live pick hardcodes slot numbers 1/2 instead of indexing
`_liveAllies`. On master (two ally slots) the two live allies can only
be slots 1 and 2, so the pick is correct there. On the held pin branch
(three slots) the live pair can be (1,3) or (2,3): in R2 `_liveAllies`
was [1,3] (Zhasulan 86 HP, Xavier 67 HP; Lenkina down at −21), the roll
resolved to literal slot 2, and the monster hit the downed Lenkina.

The pick line is the unique mechanism, established by elimination:

- It is the only HP-subtraction site for allies (`_hHp -= ...`, one
  site in the file).
- No attack pattern hits all fighters (pattern only feeds the beam
  share); the audit's attacks are direct.
- The signature hooks (`sigFieldMonster`, `sigW4FieldMonster`) do not
  touch ally HP.
- The monster is a single entity (one hit line per round), so the two
  hits are two rounds, not two pack members in one round.

The fall block then re-fires on the re-hit, because it keys only on the
post-hit HP:

```js
if (_hHp <= 0) { ... rec.log.push(_hName + ' goes down!'); ...
  hurtVillager(_hVid, 30, 'monster', ...) ... }
```

So the same fall settles twice: the "goes down!" line repeats AND the
flat-30 fall wound (`hurtVillager`) is applied a second time, against
the design intent recorded at the wound-carryover site ("A downed ally
is excluded: their fall already settled as the flat 30 during the
fight").

## 3. The fix (two edits, one file, `src/js/fieldFights.js`)

1. **Pick fix (targeting):** the two-live pick indexes `_liveAllies`
   instead of hardcoding slot numbers — `_liveAllies[Math.floor(RR() *
   _liveAllies.length)]` for 2+ live allies, `_liveAllies[0]` for one
   (no extra RNG draw). On master this is behavior-identical for
   identical draws (length 2: `floor(RR()*2)` picks index 0 iff `RR()
   < 0.5`, exactly the old 1/2 split; length 1: unchanged, no draw
   consumed). It closes the defect class for the three-slot form when
   the held pin branch lands.
2. **Fall guard (narration + settlement):** capture whether the hit
   target was live before this blow (`var _hWasLive = _hHp > 0`) and
   gate the fall block on the transition (`_hWasLive && _hHp <= 0`),
   so "goes down!" and the flat-30 fall settlement fire exactly once
   per fall, even if a re-hit ever lands through another path.

No new systems; no behavior change beyond the downed-targeting /
narration rows. `villager-brain.js` / `win-plan.js` untouched (#2605
stays BLOCKED). The held `sim-pinquaddoor-b` branch untouched.

CONFLICT NOTE (for the coordinator's closeout): both edits touch lines
the held pin branch also modified (its pick line and its `ally3In`
line inside the fall block) — a rebase of the pin branch onto the fixed
master will conflict there. The conflict must be resolved keeping the
fixed form (index `_liveAllies`; transition-gated fall).

## 4. Proof test (`scripts/test-downedtwice-b.js`)

Run with `FIGHTALLY2=1 node scripts/test-downedtwice-b.js` (25 checks).

| Section | Pre-fix (commit `3a4154a21`, unfixed code) | Post-fix (commit `8546cb96`) |
|---|---|---|
| §1 pick invariant (all live-set shapes × 7 RR draws) | **FAIL** — live `[1,3]` resolves to downed slot 2 on draws ≥ 0.5 (4 cases shown; `[2,3]` likewise on draws < 0.5) | PASS |
| §1b RNG parity (1 draw for 2+ live, 0 for one) | **FAIL** — 3-live case draws 0 (falls through to `_liveAllies[0]`, always the first live ally) | PASS |
| §3 was-live captured before the HP subtraction | **FAIL** | PASS |
| §3 fall block gated on the transition | **FAIL** | PASS |
| §2 fight-level no-repeat (6 rigged + 6 natural fights) | PASS — 0 violations in 12 fights, 6 with a down | PASS — same shape, 0 violations |
| **Total** | **21 passed, 4 failed (exit 1)** | **25 passed, 0 failed (exit 0)** |

The two halves split exactly as the prereg predicted:

- **(a) Targeting — already correct on master for the two-slot case.**
  §2 is GREEN before and after: across 12 staged fights (6 rigged-RNG,
  6 natural-RNG) with the low-HP ally downed in 6 of them, no ally was
  ever hit after going down and no "goes down!" line ever repeated. The
  defect's targeting half is real but unreachable on master — it only
  bites when a third ally slot exists, which is why §1 proves it at
  unit level against the actual pick line: RED before (the hardcoded
  1/2 pick resolves to a downed or absent slot for live pairs (1,3)
  and (2,3)), GREEN after (the pick always indexes `_liveAllies`).
- **(b) Narration — genuinely broken, now fixed.** §3 is RED before
  (the fall block keys only on post-hit HP, so it re-fires on any
  re-hit) and GREEN after (transition-gated: `_hWasLive && _hHp <= 0`).
  On master the re-hit is unreachable through targeting, so the guard
  is defense-in-depth against the double settlement the observed fight
  performed — the flat-30 fall wound (`hurtVillager`) fired twice for
  one fall. Both halves are fixed in this arm, as the prereg allowed.

## 5. Staged proof (M2) — the fixed transcript

Geared wave-4 party (encounter-gear rule: hide armor + hunting spear
throughout; holder 84 HP, ally1 100 HP, ally2 staged at 16 HP —
Lenkina's shape), vs the wave-4 audit, rigged RNG seed 47, on the
fixed tip. Party: Gladys Corpuz (holder), Anh Alvarado (ally1),
Tika Chambi (ally2, "the woman in her 40s", 16 HP). Outcome vFlee,
3 rounds:

```
00 | the woman in her 40s is already at the door too — charges in with the person in their 40s!
01 | the person in their 20s is already at the door — charges in with the person in their 40s!
02 | R1: the person in their 40s strikes for 6 (1220 left)
03 | R1: the person in their 20s strikes for 8 (x1.3) (1212 left)
04 | R1: the woman in her 40s strikes for 7 (1205 left)
05 | R1: Field Audit hits the woman in her 40s for 52 (0 left)
06 | the woman in her 40s goes down!
07 | R2: the person in their 40s strikes for 5 (1200 left)
08 | R2: the person in their 20s strikes for 6 (x1.3) (1194 left)
09 | R2: the person in their 40s's gear absorbs 41.
10 | R2: Assessment hits the person in their 40s for 24 (60 left)
11 | R3: the person in their 40s strikes for 7 (1187 left)
12 | R3: the person in their 20s strikes for 9 (x1.3) (1178 left)
13 | R3: the person in their 40s's gear absorbs 42.
14 | R3: Assessment hits the person in their 40s for 24 (36 left)
15 | R3: the person in their 40s sees how this ends — and runs while running still works.
```

It reads true: the 16-HP ally takes one blow to 0, "goes down!" fires
exactly once (line 06), and in R2–R3 the monster hits only the
holder — the downed ally is never struck again, never strikes again,
and lies at 0 HP for the rest of the fight (ally2HpLeft=0). Compare
the original #2634 transcript (§1): same shape, but the R2 blow
landed on the downed Lenkina for 42 with a second "goes down!". That
beat is gone.

## 6. Guardrail — 8-seed fresh band, control vs armed

Band 106801–106808 (fresh, per the frozen prereg), competent policy
verbatim (sha `1884c8852d38`), 150d death-aware, substrate
`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`.
Control leg on `b20328ad9` (pre-fix, `fixPresent=false`); armed leg
on `8546cb96` (post-fix, `fixPresent=true`). Corpora:
`evidence/2026-11-21/perseed-downedtwice-b-control/` and
`...-armed/`.

### Bars table (prereg §14, M3)

| Bar | Required | Result |
|---|---|---|
| B1 downed re-hits, armed leg | 0 | **0** (0 repeats, 0 re-hits, 0 strike-after-down across 960 fights) |
| B1 downed re-hits, control leg | 0 (defect unreachable on master; any nonzero investigated) | **0** (same census: 960 fights, 5 goes-down lines, 0 repeats) |
| B2 no outcome change | deaths / wins / wave-4/5 unlocks / median survival within noise of control; expected per-seed trajectory-identical | **8/8 seeds trajectory-identical** (full per-seed JSONs equal after stripping anchor/mode/leg/run/fixPresent — including standing, deaths, end reason, gameDays) |
| B3 balanced-panel compare | `review_required`, no `regression_signal` | **`review_required`**, 0 occurrences of `regression_signal` in `downedtwice-b-panel.json` (1 descriptive, 6 no_material_signal, 24 not_observed) |
| M1 proof test | all sections green on fixed tip; RED before | RED before (21/25, 4 fails), GREEN after (**25/25**) |
| M2 staged proof | geared party, one ally down, transcript reads true | quoted in §5 — "goes down!" once, downed ally never re-struck |

### Per-seed table (identical on both legs — one table serves both)

| Seed | End | Days | Rank | Standing | Max wave | Deaths | Fights | Goes-down |
|---|---|---|---|---|---|---|---|---|
| 106801 | survived | 151 | regional | 635 | 5 | 82 | 126 | 1 |
| 106802 | survived | 151 | regional | 275 | 5 | 74 | 82 | 1 |
| 106803 | survived | 150 | regional | 199 | 4 | 79 | 87 | 0 |
| 106804 | survived | 151 | regional | 475 | 5 | 99 | 212 | 1 |
| 106805 | village-lost | 145 | regional | 199 | 4 | 123 | 277 | 1 |
| 106806 | village-lost | 80 | village | 175 | 4 | 39 | 35 | 0 |
| 106807 | survived | 151 | regional | 199 | 4 | 79 | 104 | 1 |
| 106808 | village-lost | 135 | regional | 350 | 5 | 49 | 37 | 0 |
| **Total / median** | 5 survived, 3 lost | **median 150.5** | 7 regional, 1 village | — | **wave 5: 4/8** | **624** | **960** | **5** |

### Downed census (both legs, identical)

960 field fights censused per leg; 5 fights with a down; 5
"goes down!" lines total; 0 repeat goes-down, 0 re-hit lines,
0 strike-after-down, 0 instrument errors. The fix changes no fight
outcome: the pick consumes the same RNG draws on master (length-2
split identical: `floor(RR()*2)` picks index 0 iff `RR() < 0.5`, the
old 1/2 split), and the fall guard never fires on master because the
re-hit is unreachable through targeting there.

### Panel compare

`evidence/2026-11-21/downedtwice-b-panel.{json,md}` (before/after
`.json.gz` alongside). Decision `review_required`; every observed
metric delta 0 (wins 0→0, national 0→0, village deaths 78→78,
deaths/100d 55.4666→55.4666, community loss 0.375→0.375, survival30/60
1→1). No metric moved, so there is nothing to review in the delta —
the `review_required` verdict is the panel's standing posture on an
8-pair screen, not a signal.

## 7. Wall numbers (descriptive)

Both legs identical (see §6 table): wins 0/8, national 0/8, table
0/8 (no table wait, no entry), wave-4 unlocks 8/8, wave-5 unlocks
4/8 (106801, 106802, 106804, 106808), median survival 150.5 days
(range 80–151), deaths 624 total (mean 78/seed; per-seed 82, 74, 79,
99, 123, 39, 79, 49), 5 villages survived to 150d, 3 village-lost
(106805 d145, 106806 d80, 106808 d135). Standing per seed: 635, 275,
199, 475, 199, 175, 199, 350. Nothing in the wall moved with the
fix, as expected for a narration/targeting-only change that is inert
on master's two-slot fights.

## 8. Sense-test: reading the fixed fight

Read the §5 transcript as a player would. Round 1: three companions
strike, the audit answers by flooring the 16-HP ally in one blow —
"Field Audit hits the woman in her 40s for 52 (0 left)" / "the woman
in her 40s goes down!". That is the whole of her fall: one blow, one
line. Rounds 2–3: the monster turns on the still-standing holder
("Assessment hits the person in their 40s for 24"), whose gear
absorbs part of each blow, until the holder reads the fight and
runs. The downed ally is never mentioned again — no second hit, no
second "goes down!", no strike from the floor. The fight ends with
her at 0 HP, down but not dead, exactly the state the original
finding said was coherent. The defect's incoherent beat — a corpse-
cold fighter taking a second full blow and "going down" again — is
gone, and nothing else in the fight's shape changed: same blows,
same absorptions, same flee. The fix is invisible in a healthy
fight and only removes the impossible beat.

## 9. Metric review

The frozen bars held without revision. Two notes for the next run:

1. **The guardrail's B1 control expectation was the sharpest part of
   the prereg** — it demanded 0 re-hits on the control leg too, with
   any nonzero treated as an investigation item rather than a pass.
   The control leg delivered exactly that (960 fights, 0 re-hits),
   which is what licenses calling the targeting half "already
   correct on master" instead of merely "untested".
2. **The proof test's §2 cannot stage the three-slot shapes** (no
   ally3 code on master), so the targeting half's proof for those
   shapes stays at unit level (§1, against the actual pick line).
   That is the honest limit of this arm: the fight-level proof for
   (1,3)/(2,3) live pairs can only run once the held pin branch's
   third slot lands — at which point the fixed pick line is already
   in place. No metric change proposed; the next arm that touches
   ally3 should re-run §1 against the merged line.

No bar was missed, re-scored, or swapped. The metric proved right:
M1 (proof test) + M2 (staged transcript) carry the fix's evidence,
M3 (guardrail) carries its safety, and the two did not trade off
against each other.

## 10. Blanks filled / documented

- Finding #2634 FIXED (this arm): **GO — LAND.** Two edits, one
  file (`src/js/fieldFights.js`, commit `8546cb96`): pick indexes
  `_liveAllies`; fall gated on the transition to 0.
- Both halves fixed in this arm: (a) targeting — real defect, but
  unreachable on master two-slot (proved §2 GREEN-before; §1 RED→
  GREEN at unit level for the three-slot shapes); (b) narration —
  genuinely broken (fall block unguarded, §3 RED→GREEN), now
  transition-gated. The double flat-30 fall settlement is closed
  with the same gate.
- No new findings. No behavior change beyond the downed-targeting /
  narration rows; `villager-brain.js` / `win-plan.js` untouched
  (#2605 stays BLOCKED); the held `sim-pinquaddoor-b` branch
  untouched.
- CONFLICT NOTE (for the coordinator's closeout): both edits touch
  lines the held pin branch also modified (its pick line and its
  `ally3In` line inside the fall block) — a rebase of the pin branch
  onto the fixed master will conflict there. Resolve keeping the
  fixed form (index `_liveAllies`; transition-gated fall).
- Ready to land: fix commit `8546cb96` + proof test + evidence +
  both corpora + panel compare. Held: nothing in this arm. The
  coordinator merges; no rebase, no push, no version bump, no live
  verification done by this arm.
