# sim-mournblooded-b — HOLD BEATS MOURN THE BLOODED (backlog #472)

Loop B arm 3 of 3, run fleshout-loop-b-20261111T1830Z. Axis: scale-onramp /
winnability chain. Verdict: **GO** (prereg metric met: 2/2 death-day
transitions voiced, 0 false voicings on 7 non-death transitions).

## Prereg header

- **Primary metric:** fixture/transcript shows the eulogy line fires on the
  death-day transition of a blooded veteran AND on no other hold-beat
  transition in the fixture band.
- **GO threshold:** 100% of death-day transitions voiced, 0 false voicings
  on the fixture's non-death transitions.
- **Fixture:** scripts/test-mournblooded-b.js — one loadGame, seed 99107, no
  policy, constructed state (see below). No seed band, no policy arm.
- **Horizon:** fixture band only (7 hold-beat transitions across 63 staged
  days). Wall numbers: N/A with reason — this is a fiction fix verified by
  fixture + transcript, not a band lever; no sim band ran.
- **Prereg:** evidence/2026-11-11/sim-mournblooded-b-prereg.md (written
  before building; amendments below in Metric review).

## The finding (#472)

sim-vetcompose sense reads #2/#3 (evidence/2026-10-17/sim-vetcompose.md):
leadseat-armed-s2601457's hold beat read "(1 of 2 veterans)" at d55 and
"(0 of 2 veterans)" at d62; belongseat-armed-s2931793's read 1 at d71, 0
at d78. The killer died between snapshots — the bar fell back silently
between two identical hold beats. "The village was told the truth about
the bar; it was not told about the death that moved it."

## The fix (src/js/standing.js, +140/−21)

Three pieces, all inside the hold/standing area. No count logic, no
readiness gate, no win price / deed gate touched.

1. **`livingVeteranIds(w)`** (new): the SET behind `waveCombatReadiness`'s
   veteran count — living roster members with a wave-(w-1)+ kill in
   `state.waveKillLog`. The count IS this set's size, so the gate and the
   mourning can never drift apart. Same log filter + isLiving rule as the
   old inline block (roster membership + not dead; scholar always counts),
   VETSHAPE branch preserved verbatim. `waveCombatReadiness` now reads its
   veteran count from this helper (single source of truth).
2. **`_standingMournFallen(key, wave)`** (new): diffs the living-veteran
   set across hold-beat firings, against a snapshot stored in
   `state._standingVeteranSet[key] = {day, scholar, vids}`. A veteran
   present last beat and gone now is mourned ONLY with positive evidence
   of death — `state.village.deathSeen[vid]` (set by `registerDeath`, the
   one death hook; audited every villager death path calls it) OR a
   `state.village.fallen` memorial entry. A count drop with no death
   evidence — exile, flight, roster move, snapshot noise — stays silent.
   The snapshot's scholar id is skipped: a scholar's death is succession
   fiction (playerDeath's own beat), not a hold-beat eulogy. The snapshot
   updates on EVERY firing (stored before speaking), so a death is
   mourned exactly once, on the first hold beat after it.
3. **`_standingHoldBeat`** calls it after the hold line, for defer4/defer5
   only (cap holds have no veteran bar). One short 📡 line per fallen
   veteran, in the hold beat's own System voice, naming them and the beast
   they blooded (latest qualifying kill in `waveKillLog`):
   `📡 Kwame blooded The Congregation — and the cameras lost them. One
   veteran fewer tonight. Remember the name.`

Naming calls (judgment, Steve can overrule):
- The person is named by `npcName` (true name), not `disp`/`displayName`:
  those are the SCHOLAR's knowledge gate — a stranger reads as "A man,
  maybe 60s, with deep-set eyes" until the scholar learns them, and
  "Remember the name" with no name is a nonsense line. The eulogy speaks
  for the village about its own blooded fighter (the kill beat already
  told the village to remember the name; the fire retells their kills by
  name). The System's broadcast names the dead.
- The beast is named via `monsterNoun` + `articlePhrase` (the
  companionKillBeat convention). When the village has not named the beast,
  `monsterNoun` returns `'something'` — treated as unnameable, and the
  line falls back to `📡 Jerome was blooded — and the cameras lost them.
  ...` (never "blooded the something").
- "and the cameras lost them" is cause-neutral by design: the eulogy
  fires for any death (monster, wound, thirst, beam), and the hold beat
  never knew the cause.

## Before / after (transcript)

BEFORE (historical, sim-vetcompose — the silent fallback):
```
d55  📡 The next act is still waiting — blood your fighters (1 of 2 veterans).
d62  📡 The next act is still waiting — blood your fighters (0 of 2 veterans).
     [nothing. The killer died between the two beats; the village hears
      the number fall and no word about why.]
```

AFTER (fixture band, seed 99107 — the T1→T2 passage):
```
d8   📡 The fifth draft stays in the wings. It wants a village that can fight —
     learn their tricks (0 of 3 known); blood your fighters (1 of 2 veterans).
d15  📡 The fifth draft stays in the wings — learn their tricks (0 of 3 known);
     blood your fighters (0 of 2 veterans).
     📡 Kwame blooded The Congregation — and the cameras lost them.
     One veteran fewer tonight. Remember the name.
```

Full band count sequence (hold-beat "(N of 2 veterans)" lines):
`1, 0, 1, 1, 0, 1, 0, 1, 0` — the numbers are unchanged by the fix (the
fix voices deaths, it never moves a number). Exactly two eulogy lines in
the whole band, both on death-day transitions (T2 Kwame, T7b Jerome).

## Proof (scripts/test-mournblooded-b.js — PASS 10/10)

One loadGame (seed 99107), staged state mirroring the vetcompose villages:
wave 4 already released (`_standingPeakWave = 4`), standing capped 250 ≥
t5 200 (war 150 from ledger kills + plenty 100 from 6 feastLog entries),
one wave-4 killer. Hold beats driven through the real
`villageStandingTotal()`; sysSay captured per step; day +7 per firing.

| Step | Transition | Hold beat | Eulogy | Verdict |
|------|-----------|-----------|--------|---------|
| T1 | establish | (1 of 2) | none (no prior snapshot) | correct |
| T2 | **death-day** (hurtVillager kill) | (0 of 2) | **Kwame blooded The Congregation…** | **voiced** |
| T3 | rise (new blood) | (1 of 2) | none | correct |
| T4 | no-change | (1 of 2) | none | correct |
| T5 | exile (roster move) | (0 of 2) | none | correct |
| T6a | scholar blooded | (1 of 2) | none | correct |
| T6b | succession (scholar dies) | (0 of 2) | none (old scholar not eulogized) | correct |
| T7a | pre-arrival rise | (1 of 2) | none | correct |
| T7b | **death-day, beast unnameable** | (0 of 2) | **Jerome was blooded…** | **voiced** |

Also pinned at every step: `livingVeteranIds(5).length ===
waveCombatReadiness(5).veterans` (count/set agreement).

- **RED check:** on unpatched code (stash of standing.js) the test fails
  (`Game.livingVeteranIds is not a function`) — the test gates on the fix.
  The original silent fallback is documented in the vetcompose evidence
  (the before-transcript above), not re-run on unpatched code.
- **Regression:** test-readiness-20261016 29/29 PASS (with fix).
  test-vetshape-20261017 det-gate 10 passed / 6 failed and
  test-holdbeatfix-20261104 (`4 !== 5`, duplicate-call counter assert)
  fail IDENTICALLY on pristine code — both pre-existing on this base
  (reconcile-era staleness: the vetcount-reconcile change made counters
  follow the dedupe verdict, which the holdbeatfix test's old "+2"
  assertion predates; the det-gate baseline predates the merge). Zero new
  failures from this change. test-vetshape-20261104 32/33, the one failure
  an EPERM write in its smoke driver (flap, see below).
  test-readiness-audit-20261020 stops before running (requires
  FEASTSCALE_R13=1). `node scripts/check.js --quick` hung with no output
  8+ min and was killed — not run to completion; the targeted surface
  above is the regression evidence. validate-ontology.js: clean on
  re-run (see flap note).

## Sense-check (SENSE-TESTING LAW — read in full, not just counts)

The T1→T2 passage reads as a village story, not a counter. The hold beat
names the bind ("blood your fighters (1 of 2 veterans)"); the next beat
names the lowered count AND the loss in the same breath, same voice. "The
cameras lost them" is the System's voice (the show host), cause-neutral,
and "Remember the name" completes the arc the kill beat opened ("That's a
veteran kill, folks. REMEMBER the name"). The fallback line ("Jerome was
blooded") reads clean when the beast can't be named. Two sense-caught
fixes during the build (the test was green 8/8 before them, the lines were
wrong): `disp` gave a stranger-descriptor ("A man, maybe 60s…") instead of
a name, and `monsterNoun` gave "the something" for an unidentified beast —
both fixed in code (npcName; 'something' → generic line) and pinned by
assertions (T2, T7b). One fixture bug also caught by the run: the T7
villager had been chosen as the T6b successor, so their death was
succession, correctly skipped — T7 now uses a fourth villager with the
successor explicitly excluding them.

## Metric review

- **Prereg amendments (before the judged run, recorded here):** the band
  gained T7 (pre-arrival fallback) after the sense-check showed the
  fixture's pre-arrival state produced unnameable beasts — the metric
  itself is unchanged in kind (100% of death-day transitions voiced, 0
  false), now 2/2 death-day transitions instead of 1/1. The fixture stages
  `systemArrived = true` because a wave-5 hold only ever bites long after
  the System arrives (~day 7; holds need day 25+ standing) — the
  pre-arrival state was fixture-unrealistic, not a game state.
- **Metric held:** GO 2/2 voiced, 0/7 false voicings. No re-scoring.
- **What the metric does not cover:** deaths before the hold begins (no
  prior snapshot — the village never heard the veteran counted); deaths
  while the hold itself has ended (no beat fires); two veterans dying
  between beats get one line each (unexercised — rare, same code path).
- **Wall numbers:** N/A — fiction fix, fixture + transcript proof (see
  prereg header).

## Infrastructure note — write flap + ONTOLOGY.md truncation (2026-11-11 ~20:05Z)

Mid-run the host hit an intermittent write flap (four consecutive EPERM
write denials: `git stash push` index.lock, a `/tmp` redirect, `git stash
pop`, a `cp` to ~/workspace). During it, the first `validate-ontology.js`
run crashed on an EPERM write and left `docs/ONTOLOGY.md` TRUNCATED to 0
bytes in this worktree (HEAD: 352,880 bytes) — I never edited that file.
Recovery (after the probe `git update-ref refs/heads/probe HEAD` passed and
the flap cleared): backed up standing.js / test / prereg to
~/workspace/mournblooded-backup/ (verified byte-identical), restored
ONTOLOGY.md with `git checkout HEAD -- docs/ONTOLOGY.md` (352,880 bytes,
verified), confirmed `git status` shows only this arm's files, re-ran the
proof test 10/10. The flap also voided the first baseline attempt (the
stash never happened, so the "baseline" runs actually ran with the fix in
place and their log files were never written) — the baseline comparison was
redone properly afterward via backup + checkout + restore. No work lost.
Backup dir ~/workspace/mournblooded-backup/ holds the pre-commit copies
plus the pristine-baseline logs; delete after merge.

## [needs-eyes]

**Included in the commit message.** The eulogy wording is a new
player-facing fiction line in the System's voice — feel/design, not code —
and the "and the cameras lost them" phrasing is a tone call Steve polices.
One glance at the two quoted lines above is the review.

## Disposition

- Findings #472: **fixed** by this arm (coordinator updates
  `hidden_files/sim-findings.md` at closeout — not edited here).
- No canon doc covers the hold/standing area (CANON.md manifest has none)
  — the fix invents no system and cites the standing.js design-call
  comments instead. The npcName-vs-displayName call is documented in code
  as a judgment Steve can overrule.

## Files

- src/js/standing.js — livingVeteranIds, _standingMournFallen, hold-beat hook
- scripts/test-mournblooded-b.js — proof, PASS 10/10 (seed 99107)
- evidence/2026-11-11/sim-mournblooded-b-prereg.md — prereg (pre-build)
- evidence/2026-11-11/sim-mournblooded-b.md — this file
