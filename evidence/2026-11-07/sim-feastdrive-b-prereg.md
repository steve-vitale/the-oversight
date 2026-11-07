# sim-feastdrive-b — prereg v1 (DIAG phase + pilot skeleton)

**Arm:** sim-feastdrive-b (run fleshout-loop-b-20261107T1049Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
policy file composing a feast drive onto the FROZEN staged substrate
(`scripts/policies/competent-stageally-a.js`, unmodified).
**Base:** master 2cf4d19f0 (Loop A landed lingergorge-a mid-run).
**Band:** 53001–53008, DELIBERATELY REUSED (balanced panel:
before/after on identical seeds — the same band the regionalstep
diag and the sibling link-drive arm use, so all three columns are
comparable). **Horizon:** 150d death-aware. **Policies:** baseline =
frozen staged policy; armed = staged + feast drive
(`scripts/policies/competent-feastdrive-b.js`, composition frozen in
prereg v2 after the diag, before any judged pilot sim).

## Canon

READ first: `docs/CANON.md`. **No canon doc covers the feast/surge
system** — the manifest lists no feast doc, and no doc under `docs/`
is a feast-surge canon doc. The design record is the code itself:
`src/js/feastBuff.js` (ontology header: timed buff, devotion gate,
feast draw, honest use marking) and `src/js/progression.js`
(`teachSentiment`, `channelSentiment` arming lanes,
`foodDeeds = sentimentTaught && feastSurgeUsed`). Nothing is
invented from scratch; every mechanism claim below is read from
that code and cited to it.

## The blank (from sim-sitstep-b)

On pair seed 53006 the feast surge was NEVER spent in 150 days
(`feastSurgeUsed` false all 150 days); sentiment taught 8/8,
`feastSurgeUsed` false on 7/8. The food-thesis deed
(`sentimentTaught + feastSurgeUsed`) is the second half of the seat,
and its second half never happens on this band. The competent
policy already contains a feast road (`scripts/policies/competent.js`
food r7: `channelDevotion` daily, `eveningFeast` at dusk,
`feastFightRoad` facing the draw while feasted) and the staged
policy inherits it via `upkeep`/`daily` — so the road is present
and still never spends. The diag phase finds WHICH link breaks
before the drive is designed; the drive targets that link, it does
not re-build the road blind.

## The chain, as read from code (the diag's links)

1. **ARM** — `prog.feastSurge` set by `channelSentiment` when the
   mastery lane (3+ abilities at L3) or the devotion lane
   (`surgeResonance >= 35`, fed +1 per ability use, +5 per
   level-up, +10 per synergy) is met (`progression.js`).
   Channeling needs a keepsake held and `sentimentTaught` (taught
   at integration t=60; true 8/8 on this band).
2. **FEAST** — `hostFeast()` at dusk at the haven, pantry affording
   it (`feastPlan().ok`, have >= cost × 1.5 in the base policy);
   `grantFeastBuff` grants FEASTED (2-dawn window) ONLY when armed;
   refused while a fusion reactor is online, or unarmed.
3. **DRAW** — a fresh armed grant draws a scavenger as a pending
   encounter (`drawFeastScavenger`, chance 1.0; one draw per buff).
4. **FIGHT** — the draw is faced while feasted (`faceFeastDraw`;
   the harness also faces any pending encounter via `startCombat`)
   or the scholar patrols while the window is live; any feasted
   blow landing in real TB combat (or feasted ability resolving)
   calls `_spendFeastedPower('combat')`.
5. **SPEND** — first real combat use sets `prog.feastSurgeUsed`
   (and spends the arming); `foodDeeds` completes iff
   `sentimentTaught && feastSurgeUsed`.

Known non-goals (Steve calls, NOT this arm): the choice-price gap
(`evidence/2026-10-26/sim-choiceprice-a.md` finding #1096 — 34
feast draws offered, all 34 driven off, 0/8 villages ever meet a
surface naming the surge deed as the price). Do NOT re-measure the
choice-price gap, and do NOT build any of its steve-call options
(voice the price / count a driven-off draw / another in-window
fight) without the ruling. If the drive cannot spend the surge
because draws are always driven off or no in-window fight exists,
that is a DIAG outcome: report it with counts and name the next
arm; do not silently convert it into a game-code fix.

## Phase 1 — DIAG (this prereg)

Replay the FROZEN staged policy on 53001–53008 with a feast-chain
recorder (`scripts/feastdrive-instrument-20261107.js`): wraps
`channelSentiment`, `teachSentiment`, `hostFeast`,
`grantFeastBuff`, `drawFeastScavenger`, `faceFeastDraw`,
`driveOffFeastDraw`, `_spendFeastedPower` (record-after-delegate,
no RNG draws, never throws into the engine) plus a daily snapshot
(sentiment taught, keepsakes ready, `surgeResonance`, L3 count,
armed, `feastSurgeUsed`, feasted active, feast plan ok/cost/have,
pending draw). Corpus:
`evidence/2026-11-07/perseed-feastdrive-b-diag/`.

**DIAG-GO bar (frozen):** the recorder names, per seed, the FIRST
failing link of the chain above, with per-day state shown; DIAG-GO
iff ONE link is first-failing on ≥ 6/8 seeds. If no single link
dominates (or the chain is intact and the spend still fails), the
outcome is DIAG-NO-GO with the per-seed first-failing links
tabulated and the next measurement named — the drive is NOT
designed on a guess.

**Baseline reproduction guard (frozen):** the diag replay IS the
baseline leg's instrument run; its headline numbers must reproduce
the regionalstep replay on this base (0 links, 0 regional, median
114.5d, wave-4+ kills 1/1/2/1/0/8/4/0, `feastSurgeUsed` false 7/8)
or the divergence is reported EXACTLY in the evidence file — never
silently re-based. (Note: this base 2cf4d19f0 differs from the
regionalstep base 32d79b713 by Loop A's lingergorge-a landing; the
sitstep-r2 re-run already showed a master move can shift 53006
from 11 kills / 42 pair days to 8 kills / 51 pair days, so
divergence is possible and must be named, not absorbed.)

## Phase 2 — PILOT (composition frozen in prereg v2, AFTER the diag)

**Drive shape (hypothesis, NOT frozen):** compose the feastseek
devotion engine onto staged — channel keepsakes daily, feast at
dusk when armed, fight with ability actions, face the draw while
feasted — PLUS the diag-targeted repair (candidates, to be chosen
from the diag: channel EVERY ready keepsake per day if resonance
is the blocker; feast on a 2–3 day armed cadence instead of the
base 7-day cadence if fights fall outside the 2-dawn window;
patrol/sweep while feasted if no draw is pending). The v2
amendment names the exact composition, the exact counters, and
freezes them before any judged pilot sim.

**Primary metric (frozen in v1, judged in v2):**
`feastSurgeUsed` achieved on ≥ 3/8 seeds (baseline 0–1/8) AND
`foodDeeds` complete on ≥ 2/8 seeds (baseline 0/8).

**Cost bar (frozen in v1):** starvation deaths ≤ control + 2
total AND arm-only (i.e. no starvation death on a seed where the
control had none... precisely: total starvation deaths across the
armed leg ≤ total across the baseline leg + 2), AND median
survival ≥ 0.8× control median. A primary hit that breaches the
cost bar is NO-GO.

**Secondaries (frozen in v1):** surge armed rate (seeds ever
armed; armed days), feast rate (feasts, armed feasts), draws
offered / faced / driven off, feasted damage, wave-4 kills and
pair days vs baseline (must not regress staged pair production),
`foodDeeds` per seed, scale-wall numbers (national / table /
wins, wave 4–5 unlocks, median survival).

**Judge:** the run is judged against this header. A miss is
NO-GO, never re-scored against a friendlier metric mid-run. If a
metric proves wrong, write it under "metric review" and propose
the revision for the NEXT run.

**Panel (§15):** before/after through `scripts/balance-panel.js`
— both policies registered in `scripts/sweep-compare.js`
(additive try/catch entries, the established entrywindow /
multisweep pattern; no existing policy file touched), same seeds,
same days, one combined campaign; the compare `.md` is attached
to the evidence file. The panel is the instrument, the
pre-registered threshold is the judge. The panel measures the
neutral before/after (survival, wins, rank, arc); the feast
metrics come from this arm's own driver corpora
(`perseed-feastdrive-b-baseline/` and
`perseed-feastdrive-b-armed/`).

**Convergence state reported:** converging | converged | parked
| killed-at-pilot, per axis scale-onramp.

## Proof (before any judged sim)

`scripts/test-feastdrive-20261107.js`: instrument wrap/record
fixtures on fake Games (record-after-delegate, no-throw,
no-RNG-draw, counts exact), chain-link classifier fixtures, and a
live 1-seed smoke leg (53006 diag in /tmp) asserting structural
invariants only (snapshots present, zero instrument errors, the
baseline headline fields present). Proof green BEFORE the judged
diag run; re-run green after each commit that touches the
instrument, driver, or policy.
