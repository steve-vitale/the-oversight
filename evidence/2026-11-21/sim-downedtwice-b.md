# sim-downedtwice-b — fix finding #2634: a downed companion is struck again and "goes down" a second time

**Verdict: [TO FILL after guardrail]**

**The answer in one paragraph.** [TO FILL]

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

[TO FILL: RED-before / GREEN-after table]

## 5. Staged proof (M2) — the fixed transcript

[TO FILL: quote the fixed staged fight]

## 6. Guardrail — 8-seed fresh band, control vs armed

[TO FILL: bars table, per-seed table, downed census, wall numbers, panel compare]

## 7. Wall numbers (descriptive)

[TO FILL]

## 8. Sense-test: reading the fixed fight

[TO FILL]

## 9. Metric review

[TO FILL]

## 10. Blanks filled / documented

- Finding #2634 FIXED (this arm): [TO FILL verdict].
- [TO FILL any further findings]
