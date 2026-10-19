# Journey — crisis leg r29 (lane B): the moot-conviction exile route

**Pre-registration.** Leg question (named next from r28): the moot-conviction
exile route is unproven — r28 ran 51 hot cases (theft/larceny + drain arms)
and produced ZERO 'exile' verdicts. A murder conviction norms to exile at
avgBelief < -5 (betrayal.js sentenceCase: `exileAt = sev >= 4 ? -5 : ...`) —
but does the belief ever bite? The murder-spree policy (new,
scripts/policies/murder-spree.js) commits witnessed murders at Haven through
the REAL machinery: `playerAttacks(vid)` → real betrayal combat (fight hook
strikes the hostile, closes distance) → real `villageEvent('murder')` →
real crime recording → the real justice ladder (heat → confrontation →
silence-is-refusal → moot demand → `forcePlayerAccusation` charges the
witnessed murder → moot trial → sentence). Murder cadence: first day per
7-day cycle (from day 12) when conditions hold (at Haven, ≥1 witness,
hp ≥ 50%, ≥5 alive) — a fixed single day kept missing (player foraging, or
nobody near). Seeds: 7, 42, 99, 424242 (continuity with r25/r28). Horizon:
120d death-aware (+10d tail); +10d aftermath tail after schism fires.
Interesting finding bar: ≥1/4 seeds reach a moot 'exile' verdict → route
proven; 0/4 → blank (unfireable route) + diagnose why (no accusation? belief
never drops? ladder intervenes? village kills the player first?).
Primary metric: moot 'exile' verdicts per seed (bound: any >0 = proven).
Secondary: murder cases opened, avgBelief at sentence, moot firings,
exilePlayer calls, schism fires, player death cause.

## Verdict: PROVEN — 3/4 seeds, plus the repeat-offender fix

| seed | schism | exile verdict | sentence avgBelief | notes |
|---|---|---|---|---|
| 7 | d18 | murder | -11.625 | accusation d16 (Elie) → exile |
| 42 | 0 | 0 | -4.14 / +2.43 | 5 moots, 6 murder cases; borderline beliefs, never under -5 |
| 99 | d87 | murder | -7.0 | first moot d25 didn't exile; second (d84) did |
| 424242 | d16 | murder | -27.57 | accusation d14 (Blanca) → exile |

The route fires end-to-end: witnessed murder → accusation ("Elie stands up
at the fire, pointing. 'This one. Murder. There — said plain — and we all
know it.'") → moot → sentence under -5 → `resolveCase('exile')` →
`exilePlayer('moot')` → `fireCrisis('schism')` → the beat ("You are cast out.
The village chose, and the choosing cut something that won't heal clean.").

Seed 42 is the find: a SIX-time murderer faced FIVE moots and was never
exiled — avgBelief -4.14 (one point above the bar) then +2.43. Root cause:
**the moot is amnesiac about its own verdicts.** `initPlayerCaseBelief` and
`initBelief` seed every case at the same base no matter how many prior
convictions the accused has. Each trial starts fresh; bonds and trust rebuild
between cases pull belief back above -5. Fixed (see below).

Post-fix pilots (seeds 100–103): 100 exiled d14 (belief -26.3); 102 exiled
d15 on an ASSAULT charge (belief -26.64 < assault's -25 bar — the route also
bites for assault); 103 is the repeat-offender end-to-end — first murder
moot d32 sentenced at exactly -5.0 → weregild (borderline, not exile), second
murder moot d63 sentenced at -22 (with the prior weregild in the ledger) →
EXILE → schism d65. 101 survived 120d with 1/7 alive: the assault moot went
to the justice-path schism split, the murder case stayed open as the village
collapsed below quorum — honest (no quorate moot can sit with 1–2 alive).

## The blanks found + fixed

**Blank 1: the moot forgot its own verdicts.** `src/js/betrayal.js` —
new `countPriorConvictions(accusedId, charge)`; wired into
`initPlayerCaseBelief` (player lane) and `initBelief` (NPC lane, dock's worst
record sets the tone). Each resolved weregild for the same charge — or the
same violence class (murder/assault/ambush/cannibalism) — seeds belief -15
colder ("convicted and still doing it", sibling of the theft-warning wire,
mem-wire 2026-10-13, Steve: "warned and still doing it" vs "never warned").
Acquittals don't count (the fire didn't hold it); schism/cold_war aren't
convictions; exile ends the arc. A theft weregild doesn't chill a murder
case (different ledger).
Proof: `scripts/test-crisis-prior-convictions-20261019.js` — 12/12 GREEN
(RED 5/11 on pristine: deltas 0, openers identical). Covers: -15/-30 per
prior, acquittal adds nothing, theft≠murder, assault→murder crossover -15,
open cases don't count, NPC lane -15, other-NPC record doesn't chill.

**Blank 2: the accusation line was a single verbatim template.**
`openPlayerCase` said the identical "stands up at the fire, pointing" line
for every moot (seed 42: Dina, Xavier, Hassan, Ingrid — 4× identical).
Now three openers, picked per case (same shape: accuser acts, charge said
plain, fire reacts, moot timing, "Use them"). Caught by the sense pass:
variant 2 initially read "...said plain. Said plain, in front of everyone."
(murder's chargeLine already contains "said plain") — fixed to "...In front
of everyone." Proof C3 guards the duplication class. Post-fix seed 103 shows
all three variants firing across one arc (Devon v3, Devon v2-fixed, Valeria
v1, Valeria v3) — no verbatim repeats.

## People check (sense-testing)

The arc reads as people. Accusation: "Elie stands up at the fire, pointing.
'This one. Murder. There — said plain — and we all know it.' Heads turn."
The sentence: "The oldest among them stands. The fire seems to lean in.
'You — take what you can carry and go.'" The crisis beat lands. The
moot-aftermath for a failed accusation (seed 101, Ingrid): "Ingrid looks at
you across the cooling fire, and something between you is over. They called
a moot on you — and the fire said no." The justice-path schism split
(seed 101, Aurora): "Aurora got their moot. The village got two fires and
the space between them. Nobody calls that a win — least of all Aurora."
No fabricated history, no filler loops. The village bends: it accuses, it
tries, it splits, it casts out.

## Village assessment

Seed 7: exiled d18 at 9 alive; the village carried on. Seed 99: exiled d87
at 5 alive after two trials — the village gave the murderer two chances,
then chose. Seed 424242: exiled d16 at 5 alive, fast and decisive. Seed 42
(pre-fix): the village tried five times and couldn't convict past -5 while
the murderer kept killing — 11→1 alive by d92, the last villager (Fatima)
still calling a moot at d120. Seed 101 (post-fix): the murderer's assault
split the village into two fires; the murder trial couldn't reach quorum as
the village died. Seed 103 (post-fix): weregild d34, exile d65 — the village
remembers. The miserable ones are the accusers who watch the fire say no.

## Regressions

- `scripts/test-crisis-prior-convictions-20261019.js` (new proof): 12/12 GREEN (5 RED on pristine).
- `scripts/test-justice.js`: 61/61 green.
- `scripts/test-betrayal.js`: 80/80 green (re-run; one earlier flaky failure matches r28's documented pre-existing "no strangers before notability").
- `scripts/test-crisis-20261009.js`: 18/18 green.
- `scripts/test-crisis-exile-refrain-20261019.js` (r28 proof): 8/8 green.
- `scripts/test-betrayal-aftermath.js`: CRASHES — pre-existing, unrelated: the test hand-evals its own file list (not sim-harness) which omits `src/js/statusEffects.js`, so `seTickFighter` is undefined at `tbBeginTurn`. Not in the green list. My diff touches only belief seeding + accusation lines.
- `node scripts/check.js --quick`: 96 passed, 0 failed in 537s.

## Telemetry

Baseline `telemetry-baselines/crisis.json` tracks combat metrics
(defenderFights, playerFights, defendedCount, latelyDefenseCount). This run's
pilot records schism/case instruments, not combat telemetry — the check's
four LOUD "disappeared" lines are instrument mismatch, not behavior change
(same as r28). The fix touches belief seeding + accusation narration; no
combat code paths. Baseline NOT rolled.

## Metric review

Pre-registered primary metric (any moot 'exile' verdict >0 = route proven):
**3/4 seeds → PROVEN.** The metric was the right one; seed 42's 0/4 fired
the blank as designed (amnesiac moot) and the fix addresses it, not a
re-score. Revision for the next crisis run: the fix's long-run behavior —
does the -15/prior ever over-punish a reformed player (weregild → long
clean stretch → new charge)? The ledger has no decay; worth a probe.

## Reachable / fun / winnable (crisis leg)

Reachable: yes — the moot-conviction exile route fires through real play
(murder → accusation → trial → exile → schism), 3/4 hot seeds, plus assault.
Fun: the accusation → trial → sentence → exile arc is the game's best social
consequence machinery — public, specific, remembered (now literally, in the
belief ledger). Winnable: the deed gate doesn't need schism (r25); criminal
play pays the honest price, and repeat criminals pay it faster.

## Files

- Fix: `src/js/betrayal.js` (countPriorConvictions + both belief lanes + accusation variants)
- Proof: `scripts/test-crisis-prior-convictions-20261019.js` (12/12 GREEN, 5 RED on pristine)
- Policy: `scripts/policies/murder-spree.js` (new; competent + weekly witnessed murder via real playerAttacks)
- Instrument: `scripts/pilot-crisis-mootexile-20261019.js` (new)
- Diag: `scripts/diag-murder-spree-20261019.js` (new; murder-window calibration)
- Per-seed records: `evidence/2026-10-19/journey-crisis-r29-seed{100,101,102,103}.json` (+ /tmp/mootexile-*.log, ephemeral)
- check.js --quick: 96 passed, 0 failed in 537s
