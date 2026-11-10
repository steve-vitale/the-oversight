# sim-volleysoft-b — prereg: size a volley-softened finish (DIAG + SIZING, zero src/js)

- Arm: sim-volleysoft-b (Loop B, DIAG + SIZING arm, run fleshout-loop-b-20261110T0429Z)
- Branch: sim-volleysoft-b; base anchor `91650a90faa83df2e948d6c803e1735940252eb9`
  (worktree `~/workspace/worktrees/sim-volleysoft-b`, `git status --short` empty at prereg time)
- Grounding: evidence/2026-11-09/sim-vetfinish-b.md + sim-findings.md entry
  VOLLEY-SOFTENED EXCLUSION, MEASURED (open, design decision, 2026-11-09).
  Vetfinish measured: 51/90 constructed bow-only meetings reach below break,
  0 convert at FS sizing (bow contact strike [15,19] cannot cover a ~135 HP
  remainder; the 3-strike window is ~57 HP); the wild volley-damage exclusion
  fired 1x on the re-run grind band. This arm sizes what a volley-softened
  finish would need. It does NOT decide whether the wound-mill ruling
  ("finish a crippled beast you meet if you can") should cover
  volley-crippled beasts, and it does NOT extend the FS gate or land any
  gate change. Zero src/js in this arm (instrument + proof + evidence +
  corpora only). If any src/js change starts looking necessary, STOP and
  report it as the sizing outcome instead of making it.

## Premise corrections (from code read BEFORE any judged computation here)

1. **"Flees free" is wrong for wave 4.** The brief's framing — a beast the
   volley drops below its break line "flees free with no finish attempt" —
   holds only for kinds carrying a flee component. `var mCanFlee =
   !!(mdef && mdef.flee)` (fieldFights.js:699); only lockpick_raccoon
   (wave 1) carries `flee` in src/data/monsters.json — NO wave-3+ kind
   does (verified by census in this run: 23 wave-4+ kinds, 0 with flee).
   A volley-softened wave-4 beast therefore does NOT flee: the volley-break
   block (fieldFights.js:1015-1180) sets fsMetBelowBreak + fsNoCommitWhy
   'volley-damage', sets NO outcome, and execution falls through to
   "// ---- rounds ----". In rounds the in-round break check (line ~2476)
   takes the `!mCanFlee` branch — committedHold, "wounded past its line —
   and holds its ground. It is not leaving." — and the fight runs to a
   kill, a death, the round cap, or a fighter walk-away. The exclusion's
   real cost for wave 4 is therefore narrower: the fighter loses the free
   riskless contact strike (one lroll([4+wb,8+wb]) blow, no return damage)
   and loses the FS commit (whose beast-holding half is redundant here —
   the beast holds anyway — leaving only the fighter-morale hold,
   fsHoldLogged, as the commit's causal channel). The wild leg must record
   what actually happens next (rounds, vKill / vDie / vFlee / round-cap,
   fighter HP left), not assume a flee. The constructed leg measures the
   fighter-flee share (vFlee) in volley-softened fights: those are the
   fights a volley-softened finish's commit could in principle hold.
2. **The suggested band 99651-99658 is NOT fresh.** It was used 2026-11-05
   by sim-toggle-rescreen-b / gearoff / sigoff / trickoff confirms
   (evidence/2026-11-05/perseed-toggle-rescreen-b/gearoff-9965{1..8}.json
   + transcripts; named in sim-gearoff-confirm-b, sim-sigoff-confirm-b,
   sim-trickoff-confirm-b, sim-toggle-rescreen-b preregs + evidence).
   Collision recorded here so the next worker does not repeat it.
   Other candidates checked and REJECTED as used: 99671-99678 (44-file
   hits on 99671), 99682-99687 (killersurvive-b pilot corpus),
   99702-99707 (holdbeat-a corpus), 99711-99718 and 99721-99728
   (prereg + filename hits on most seeds).

## Band + freshness verification (this run, before the run)

- **Band: 99591-99598 (8 seeds), FRESH.** Verification, per seed:
  `rg -l <seed> evidence/*/sim-*-prereg.md` = 0 hits for all 8;
  `rg -l <seed> evidence/ -g '*.md'` = 0 hits for all 8;
  `find evidence -name '*<seed>*'` = 0 files for all 8;
  `rg -l "9959[1-8]" scripts/` = 0 hits; the five preregs naming a
  forbidden/contaminated list (sitdrive-winseek-b, fightblend-reask-b,
  medheadcount-metricfix-a, arenadecomp-b, tenddrive-a) contain no 9959x
  seed. Search scope: all 695 preregs under evidence/*/sim-*-prereg.md,
  all dated .md under evidence/, all evidence filenames, scripts/.
- Policy: competent, verbatim (scripts/policies/competent.js).
- Horizon: 150d death-aware (runDays ends on village death / win;
  +10d tail max). Same horizon as the vetfinish before-leg, so the wild
  numbers are comparable to it.
- Driver: scripts/finishersize-driver-20261106.js (reused verbatim),
  OUTDIR evidence/2026-11-10/perseed-volleysoft-b, RUN=volleysoft-wild.
  The driver already records everything this leg needs on each
  field-fight row (grind instrument + FS decoration): entryHp,
  entryMaxHp, entryFrac, volley {shots, hits, dmg}, mDealt, mHpLeft,
  outcome, rounds, vHpLeft, fsMetBelowBreak, fsNoCommitWhy,
  contactFinishAttempted. No new instrument needed for the wild leg.

## Classification bars (bind this run, §14)

- **Volley-softened meeting (wild):** wave >= 4 field fight with
  volley.dmg > 0, entryFrac >= 0.15 (pre-volley at/above the break line),
  post-volley frac (entryHp - volley.dmg) / entryMaxHp < 0.15,
  post-volley HP > 0 (a volley kill is not a meeting — the pack dies
  with the lead). Post-volley remainder R = entryHp - volley.dmg.
- **What happened next (wild):** the fight's outcome (vKill / vDie /
  vFlee / round-cap vFlee / mFlee), rounds, vHpLeft, mHpLeft, mDealt;
  plus trail-chaining: whether the same beast instance (same mid +
  maxHp) is met again later with entryHp == that fight's mHpLeft
  (the grind instrument's chaining signal), and that later meeting's
  outcome if any.
- **Constructed sizing shapes:** bow-ONLY fighter (bow + 4 arrows +
  ally), the shape the wild actually produces (60/296 wild wave-4 field
  rows carry volley shots; bow+spear fighters never volley — spear in
  the ranged slot, vetfinish V2 probe 6/6). Entry HPs just above the
  break line: audit 180/200/220 of 1200 (vetfinish V2 replication),
  herald 120/140/160 of 800, influencer 140/160/180 of 950 — 30 seeded
  streams each, 270 fights, re-driven through the REAL Game.fieldFight
  (same harness as scripts/test-vetfinish-b.js, seed 87104 family).
  Fighter entry HP 100, ally from start.
- **Hypothetical finish strike (constructed, counterfactual — labeled
  as such, never presented as an engine outcome):** the strike the
  contact finish would have landed had the volley-softened meeting been
  eligible: lroll([4+wb, 8+wb]) with the bow's wb (11) → [15,19],
  drawn on a separate seeded stream (mulberry32, streamSeed+1) so the
  real fight's RNG is untouched. Strike-kill share: R <= strike.
  FS-window share: R - strike <= 3 * strike (the FS size gate, applied
  to the volley-softened remainder). Also recorded with a spear's strike
  [19,23] (wb 15) for the bow+spear-carrier shape, as a sensitivity —
  the spear shape never volleys in the wild today, so it sizes a
  hypothetical, not a reachable window.
- **Costs/risks (constructed):** for volley-softened fights, the
  fighter's outcome distribution without any finish (vKill / vDie /
  vFlee / round-cap), rounds spent, fighter HP lost (100 - vHpLeft),
  and the vFlee share — the pool a commit's morale hold could in
  principle convert. A volley-softened finish's cost is spelled out as:
  the free strike is riskless (beast below break, turning — no return
  damage in the contact-finish exchange); the commit's hold costs
  rounds spent striking instead of fleeing, and displaces the fighter's
  own flee decision while the beast still hits back in rounds.

## Primary metric (binds this run, §14)

This is a DIAG + SIZING arm, not a lever arm — there is no before/after
and no GO/NO-GO on a lever. The primary is the **wild window rate**:
volley-softened meetings on the fresh band, with their outcomes.
- **DIAG-GO if >= 1 volley-softened meeting is observed** on the 8-seed
  band (the window exists in the wild at this scale, with its outcome
  distribution recorded). **DIAG (field-unmeasurable) if 0** — report
  0/8 seeds and 0 per wave-4 field fight; do NOT extend the band mid-run
  to chase the window. Either way the constructed sizing is the
  deliverable: it does not depend on the wild count.
- The sizing is judged complete when it reports, for each constructed
  shape: post-volley remainder distribution (median + range), strike-kill
  share, FS-window share, fighter outcome distribution + rounds + HP
  lost without a finish, and the vFlee (convertible-by-hold) share —
  plus the lever spec below.

## Lever spec (to be written into the evidence file, not built here)

The evidence file carries a pre-registered spec for a future build run:
primary metric, GO threshold, cost bar, band, horizon — so the next run
can build against it without re-sizing. Draft shape (to be fixed by the
measured numbers): primary = volley-softened committed kills / |V|
where |V| = volley-softened meetings with R in the FS window (the
sizing's FS-window share sets the expected |V|); GO threshold and cost
bar set from the measured fighter-risk numbers (vDie / vFlee shares,
rounds, HP lost). If the sizing shows the FS window covers ~0 of the
remainder distribution, the spec says so plainly and names the
alternative sizing (e.g. a wider tail gate or a spear-strike window)
with its own numbers, rather than recommending the FS gate.

## Wall numbers (reported every run)

National / table / wins, wave 4-5 unlocks, wave-4 kills (all channels
+ field), wave-5 kills, median survival, scholar deaths — from the
analyzer on the wild corpus, same shape as vetfinish.

## Sense-test + village assessment

Read transcripts / fightLines / deathSays from the wild corpus; judge
meaning, coherence, relevance, consequences — never just counts. Flag
anything robotic, static, or repeated. Village assessment in plain
words: what the village looked like, who thrived and who died and why,
what knowledge/capabilities were missing, which blank this arm filled
(sizing + spec) or documented.

## Metric review (§14a, in the evidence file)

Any metric problem found goes here for the NEXT run; no re-scoring
mid-run. Known candidates: the volley-softened definition counts only
meetings the volley itself drops below break — a beast met below break
with volley.dmg > 0 but already below break at entry is a different
shape (wall-delivered, volley-touched) and is counted separately if it
appears; the hypothetical strike is a counterfactual draw, so its
shares are sizing estimates, not engine outcomes.
