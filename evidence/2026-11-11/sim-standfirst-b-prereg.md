# Standing points — first numbers: pre-registration (arm sim-standfirst-b)

Run fleshout-loop-b-20261111T1131Z, Loop B. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit b09cf584e. No judged sim has run on this base yet;
the pilot runs on b09cf584e, recorded in the evidence.

## Canon

- docs/CANON.md read first. **There is NO dedicated standing/ladder
  canon doc in the CANON.md manifest.** The manifest points at
  docs/SYSTEMS.md for "abilities, slots, deepening" and at docs/SCALE.md
  for the scale ladder — but SCALE.md is the OLD ladder (village →
  regional → national → global by links and seasons, hierarchy.js),
  NOT the standing-points ladder measured here. The operative design
  for standing points is the victory-gating build brief
  (`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/victory-gating-build-brief-draft.md`,
  Steve approved the build 2026-11-07 19:28 CST) and its three leg run
  notes / preregs (evidence/2026-11-08/sim-ladder-leg1-prereg.md,
  sim-ladder-leg2-prereg.md, sim-ladder-leg2-run-note.md,
  sim-ladder-leg3-*), plus docs/TABLE.md (the seat section, which
  prices the lesser/full seat on ladder peak stage) and docs/SCALE.md
  (the scale ladder the full seat still needs alongside the points
  ladder). Nothing is invented here; the code citations below are the
  source of truth. (Canon gap, recorded in the evidence: standing
  points need a canon doc the way diseases have docs/DISEASES.md. The
  brief lives in goal hidden_files, not in docs/.)
- **The Standing ladder (leg 1, live 2026-11-08)** — src/js/ladder.js.
  One ladder, four rungs (Village 12 / Regional 26 / National 40
  COUNTED points, cumulative), filled by five kinds of village work
  (Fight, Forage, Craft, Talk, Explore) with a per-track cap (60% of
  the next rung's threshold: 7 @ 12; 15 @ 26; 24 @ 40) so no one kind
  of work can carry a rung alone. A second bar beside Standing
  (standing.js): Standing opens waves, the ladder opens seats.
  Village-level computed bar, reads existing state only, never the
  scholar alone; a new adventurer inherits the village's ladder.
  - Fight: 1 point per 2 wave-ledger points, waves 3–5 only
    (`fightPerLedger: 2`, `waveLedgerPoints(w)`).
  - Forage: 1 point per 12 summed field XP across the LIVING roster +
    the scholar (`_ladderSummedXp('field')`, `foragePerXp: 12`). The
    whole summed field total counts as Forage, once, never twice.
  - Craft: 1 point per 12 summed craft XP (`craftPerXp: 12`).
  - Talk: 2 points per seasoned regional+ link (`talkPerLink: 2`) + 1
    per contest survived (`deedState().contestsSurvived`).
  - Explore: 1 per 4 discovery deeds (READS 0 — `_ladderDiscoveryDeeds()`
    returns 0; no lifetime per-deed store exists, npcXp holds per-track
    totals only) + 1 per 4 codex breadth above the base 8
    (`codexBreadth()`) + 1 per active link (formation, not seasoning).
  - Feast bundle bonus (leg 2, brief §b.5): +4 ladder points per
    distinct `bundleStage` on feast-log bundle entries, added to
    counted/total AFTER the per-track cap, once per stage.
  - Stage = the highest rung whose capped total meets its threshold,
    checked rung by rung; the rungs nest (a rung cannot pass while the
    one below fails). `ladderStage()` never returns 4 — stage 4
    (Galactic Seat) is the capstone delivery, recorded on progState
    by leg 2's surgery. Peak stage is monotonic memory
    (`state._ladderPeakStage`, written only by `ladderTick()`).
  - The cap is never silent: `ladderLine()` names every capped track
    ("Fight 9 → 7 · capped"); `ladderCapBeat()` says it aloud the
    first time a track caps on a rung. Stage beats (`ladderStageBeat`)
    speak each rung aloud. `ladderTick()` runs daily from the
    `Game.endDay` wrap chain.
  - NPC XP lean caveat (flagged in ladder.js for leg 4): `npcXp`
    seeds a villager's record with their occupation lean on first
    touch, so the summed XP includes starting lean (up to 12/track/
    person) as well as earned XP. The ladder counts it as work.
- **The OLD Standing bar (standing.js) — the wave bar, still live.**
  One total, three sources: war (+25 per wave-3+ ledger kill point),
  diplomacy (+34 per seasoned regional+ link), plenty (+20 per major
  feast, quality ≥ 1). Wave 4 unlocks at 100, wave 5 at 200.
  Three layers gate the number `villageStandingTotal()` returns:
  (1) plenty cap — plenty counts at most 100 toward the T5 bar
  (bread alone cannot buy the fifth draft); (2) combat-readiness
  deferral — wave 4 releases only when the village's real fighting
  strength meets the draft's demand (`waveCombatReadiness`: armored /
  armed / tricks / veterans bars read from LIVE village state;
  recalibrated 2026-10-18: w4 {armored 3 @ P10, armed 5, tricks 3,
  veterans 1}, w5 {armored 4 @ P15, armed 6, tricks 3, veterans 2});
  while deferred the total holds at t4-1 / t5-1 with the hold beat +
  weekly reminders naming the short bars; (3) monotonic peak ratchet
  — once the gated total releases a wave, `_standingPeakWave` floors
  the total at that wave's threshold forever. Every hold/cap is
  named aloud (`standingLine`, `_standingHoldBeat`,
  `_standingReleaseBeat`).
- **The wave ledger (waveLedger.js)** — the Fight source's source:
  1 point per kill, 2 per counter-kill, per-type cap 2; bars 5/5/4/3/2
  per wave 1–5; day floors 8 (wave 2) / 25 (waves 3+).
- **The feast bundle (leg 2, game.js)** — the feast gains a bundle
  sheet: 6 slots filled from 12 contributions (hunted meat, cooked
  meat, foraged feast, crafted centrepiece (pemmican), monster meat,
  guest of honor (star guest), explorer's rare, preserved food,
  medicine brewed, garden harvest, kept recipe, codex recipe ≥ 1,
  keepsake channel armed). Any 6 distinct contributions complete the
  bundle; one served item fills at most one slot. Completing it writes
  `bundle: true` (+ `bundleStage`: the live ladder stage) on the
  feast-log entry and grants +4 ladder points once per stage.
  `feastBundleBuyOut()`: pay 8,000 kcal straight from the pantry, no
  feast held, no guests; the record is a feast-log entry with
  `bundle: true`, quality 0 — so Standing's bread source (quality ≥ 1)
  never mints from a buy-out. Refuses honestly when the pantry is
  short, the stage already banked its bonus, exiled, away, or over.
- **The capstones (leg 2, table.js + ladder-capstones.json)** — three
  any-of deeds; completing any one opens the Galactic Seat (the full
  seat, priced as in TABLE.md §b.4): (1) military tribute — 2 living
  wave-4 veterans leave Haven in the table's service (never the
  scholar; `removeVillager(vid, 'tribute')`); (2) trade charter — a
  sealed charter with a national-scale polity (active trade link with
  `chartered: true` + scale national+); (3) feast embassy — the feast
  bundle completed while at National stage. `ladderCapstoneReady(kind)`
  is the readiness READ; `ladderDeliverCapstone(kind)` is the delivery
  surgery (records `progState().ladderCapstone`, irreversible).
  Readiness/delivery split (Steve RULED 2026-11-10: the scholar counts
  as a villager): readiness counts the scholar toward the veteran BAR,
  delivery still pays 2 NON-scholar veterans — a scholar-veteran + 1
  villager reads ready but delivery refuses `veterans-short`.
- **Mercy rule (brief §b.9, table.js `tableActive()`)** — the table's
  sanctity window starts at capstone DELIVERY, not at sitting: between
  delivery and the seat, no raid or roaming monster can kill
  villagers. It ends when the finale resolves (phase 'done'); a
  village that delivers and never sits stays under sanctity, and the
  overtime clock still docks the seat while it waits. After the
  finale, the usual failure rules apply (the mercy protects the WIN,
  not the grade).
- **Standing buys time (brief §b.6, overtime.js)** — the ONLY waiting
  clock is overtime: after the table is announced, every unseated
  interval raises a tier (cap 6); each tier makes wave-4/5 fights
  RERUNS (HP/damage/pack stack), raids sooner/more often, and docks
  the live seat price (standing penalty: min(40, tier×4 + losses×3)).
  The tier interval stretches with ladder points: `overtimeInterval()`
  = 7 + floor(counted ladder points / 4) days — a 12-point village
  waits ~10 days per tier, a 40-point village ~17. The stretch is
  named aloud on tier-up. Pre-announcement the ladder's time benefit
  is indirect (readiness gate + wave unlocks run on Standing).
- **Per-stage rewards (brief §b.8, metaProgression.js)** — one concrete
  grant per stage (main-session call Q4, NOT memberBenefits):
  Village (1) a river trader arrives today; Regional (2) a free
  shelter rises, housing +2, no wood cost; National (3) a village
  bows to Haven — a link forms with the best-known unlinked village,
  Haven primary, 4,000 kcal/week tribute (fallback: a free shelter
  when no known unlinked village exists). `ladderGrantStageReward(stage)`
  grants every ungranted rung up to `stage`, once per stage, recorded
  on `progState().ladderRewards`; a grant that cannot land is NOT
  recorded, so it can still land later. It rides the `ladderStageBeat`
  wrap in metaProgression `attach()` — stage completion rides the
  existing beat path, so a jump 0→2 grants both missed stages.
- **Cash-out (brief §b.10, metaProgression.js `ladderCashOut()`)** —
  a Haven action offered once the village holds at least Regional
  PEAK stage (≥ 2): end the run as a Respected Village. Records the
  ending as a `table_won` frame (legend + Records table frame, never
  the mt-table achievement), banks the village's counted ladder
  points under the b.11 capped rule, says the ending lines from
  `table-endings.json` (paths.respected-village, picked by the
  village's top counted track), then ends the run (over + won +
  wipe, mirroring the table-win ending sequence).
- **Failure persistence (brief §b.11, metaProgression.js)** — when a
  village is lost (game over) or cashes out, its counted ladder
  points bank into a small persistent record (meta store
  `oversight.meta.v1`, `ladderBank: {points, at, kind}` — REPLACE, the
  most recent fallen/cashed-out village only). At most 6 banked points
  count toward the NEXT village's Village stage only — never
  Regional/National, never wave Standing. The bank is spent (cleared)
  once the new village reaches Village peak. The bank write rides
  the `wipe` wrap in `attach()` (only when over + villageLost, not
  won, once per run via `pg._ladderBanked`); cash-out banks explicitly
  inside `ladderCashOut()` before wipe. The bank read side is a
  `villageLadder` wrap (`_ladderBankApply`, original kept on
  `__ladderBankOrig` so `ladderBankPoints` banks the village's OWN
  counted points, never the inherited head start). This is the ONE
  approved exception to the Records rule (achievements never grant
  power); knowledge persists without cap as today.
- **The seat (TABLE.md + table.js `tableSeat()`)** — lesser seat:
  waves faced 4/4/3 distinct (w1/w2/w3), 2+ contests survived, 2+
  crises, scale ≥ regional, integration stage ≥ 2, `sentimentTaught`
  alone (the feast surge is no longer a seat deed), ladder PEAK ≥
  Village (12 counted points). Full seat: `deedGateReady()` (waves
  5/5/4/3/2 distinct fought, 3+ contests, 3+ crises, national/global
  scale, stage ≥ 2, `sentimentTaught`) + ladder PEAK ≥ National (40)
  + a capstone deed delivered. The seat gate reads PEAK stage, not
  live stage (leg-2 decision: the capstone delivery is irreversible
  and Steve's 2026-11-06 standing-offer ruling — once offered, the
  offer does not withdraw — so deaths must not steal a priced seat;
  the ladder bar/line still show the LIVE stage, and `tableSeat()`
  detail carries both so the voicing can name a dip honestly).
- **What the ladder deliberately does NOT fix (brief §b.4):** the
  realm-formation wall. The full seat still needs national scale and
  the lesser still needs regional. The ladder fixes the feast gate,
  not the realm gate.
- **Godpath/godhood is OUT OF SCOPE for this arm** (Tier 3,
  unmeasured): capstone delivery is counted only as a ladder event;
  no judgement on godhood builds.
- Audit row: hidden_files/coverage-audit-20261110.md §4, Ladder /
  standing + capstones — **Measured, Partly**: capable `tableRoad`
  climbs ladder; standing points are engine-scored, not
  driver-played; panel `national`, `table`, `entered`;
  `sim-ladder-leg1/2/3` Nov 8; `sim-capstoneready-b` + re-measures
  Nov 10. The audit also lists standing accumulation under
  "Measured but never played by the driver (instrument-only)". This
  arm supplies the first-numbers analogue under DEFAULT competent
  play: what the ladder actually accumulates when nobody climbs it
  on purpose.

## What the existing ladder tests prove — and what they do NOT

The ladder tests (test-ladder-seat-20261108, test-ladder-bundle-20261108,
test-ladder-leg1, test-ladder-leg3, test-capstoneready-*, test-overtime-*)
prove the verbs work when CALLED on rigged states: thresholds/caps,
bundle sheets, buy-out refusals, capstone readiness/delivery, mercy
window, cash-out banking, overtime stretch. None of them measures
whether standing points ever ACCUMULATE in a lived village under
default competent play: no per-track points over time, no stage
reach distribution, no cap-hit frequency, no bundle completions in
the wild, no capstone readiness ever reached, no overtime tier ever
stretched, no reward ever granted, no cash-out ever offered. This arm
measures exactly that, on a plain competent band.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked
2026-11-11: no open line names standing-points first numbers; the
closest lines are about specific levers, not this census.) Any
standing gap this arm surfaces is APPENDED as [open] in the evidence
file's findings section and in sim-findings.md, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the ladder is read daily by the engine itself —
   `ladderTick()` rides the `Game.endDay` wrap chain (ladder.js) and
   fires stage/cap beats; `villageLadder()` is read by the Haven
   panel, `tableSeat()`, `overtimeInterval()`, and the bank wrap.
   `feastBundleCheck` is called by `hostFeast`/`feastPlan` whenever
   a feast is held or planned; `overtimeTick()` runs daily from the
   endDay chain. The pilot will confirm live counts in the corpus,
   not assume them. `ladderCashOut`, `ladderDeliverCapstone` and
   `feastBundleBuyOut` are Haven-panel actions (app.js only) that
   competent never calls — expected dead-under-competent, proven
   live in the fixture by direct calls and marked dead if the pilot
   never fires them. `ladderBankPoints('lost')` IS engine-called: the
   `wipe` wrap in metaProgression `attach()` banks a lost village's
   climb at game over — expected LIVE on every village-lost seed.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio
   to size. The addressable pool is every ladder read, every stage/cap
   beat, every bundle sheet, every capstone-readiness read, every
   overtime tick, every reward grant, every bank write on the band.
   The engagement floor (GO table) is set from the pool's nature: if
   the band's counted ladder points stay at 0, the census is
   uninterpretable, not a GO.
3. **Verb existence**: `ladderCfg`, `villageLadder`, `ladderStage`,
   `ladderPeakStage`, `ladderLine`, `ladderTick`, `ladderStageBeat`,
   `ladderCapBeat`, `ladderCapstoneReady`, `ladderCapstoneDelivered`,
   `ladderCapstones`, `ladderGrantStageReward`, `ladderCashOut`,
   `ladderBankPoints`, `ladderBankedHeadStart`, `villageStanding`,
   `villageStandingTotal`, `standingPlentyCappedTotal`,
   `standingDeferral`, `waveCombatReadiness`, `waveUnlockReady`,
   `standingLine`, `waveLedgerPoints`, `feastBundleDefs`,
   `feastBundleCheck`, `feastBundleBuyOut`, `hostFeast`, `overtimeActive`,
   `overtimeTier`, `overtimeInterval`, `overtimeStanding`, `overtimeTick`,
   `tableSeat`, `scaleRank`, `unlockedWave`, `deedState`,
   `codexBreadth` all exist in the engine (citations above). The
   policy drives XP, kills, feasts and links through ordinary play —
   that asymmetry (what accumulates vs what never gets driven) IS one
   of the first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 116–140d); standing is a whole-life question (the
   ladder needs seasons of summed XP; the old bar needs wave-3+ kills;
   overtime needs the table announced at day 90+). Same horizon as
   the siblings for comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of standing points
in a lived village** — every ladder event classified by track + stage
+ outcome; every stage/cap beat counted; every bundle sheet
classified; every capstone readiness read classified; every overtime
tier/stretch counted; every reward grant counted; every bank write
counted; every metric in the list below counted or explicitly marked
unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every standing event classified by track + stage + outcome, none 'other' | 0 unclassified standing events across the pilot (stage beats carry a stage 1–3; cap beats carry a track; bundle events carry contributions + complete; capstone events carry a kind + ready/reason; reward events carry a stage + kind; overtime events carry tier + interval; bank events carry kind + points) |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | ≥5 counted ladder points band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Ladder points by track over time: per-track totals vs counted
   (cap) at day 30/60/90/120/150 (or death); cap hits per track per
   rung (which track caps, at which rung, how often); the raw inputs
   (fight ledger points w3–5, summed field/craft XP, seasoned
   regional+ links, contests survived, codex breadth, active links,
   discovery deeds = 0 by construction); bundle bonus points.
2. Stage reached + days at each stage: live stage trajectory per
   seed; peak stage; live-vs-peak dips (deaths stealing points —
   does the peak memory hold the seat bar while the live stage
   falls?); days from Village to Regional to National; seeds that
   never leave Unranked and why (which tracks are short, which are
   capped).
3. Feast bundle: feasts held per seed; bundle sheets per feast
   (contributions filled, count, complete or not); completions;
   buy-outs (expected 0 — competent never buys); bundle bonus
   points banked per stage; contributions by kind (which of the 12
   ever fill, which never do).
4. Capstone readiness: `ladderCapstoneReady` per kind per seed over
   time (ready / reason); deliveries (expected 0 — competent never
   delivers); the mercy window: observed only if a delivery happens,
   otherwise honestly unobserved (not zero — the instrument records
   `tableActive()` after any delivery; with no delivery there is no
   window to observe).
5. Old Standing: war/bonds/bread breakdown over time; gated total
   vs raw; deferrals (which bar binds — armor/weapons/tricks/
   veterans — and for how many days); plenty-cap holds; peak
   ratchet (waves released and held open after the raw total falls);
   wave 4/5 unlock days.
6. Standing vs the wave timer: overtime active/tier/interval per
   seed; the stretch (interval − 7) vs ladder counted points; the
   seat-price penalty (tier + losses); overtime tier-ups named aloud
   with the stretch line; wave unlocks vs overtime (does the clock
   ever start — table announced day 90+ — before the village is
   ready?).
7. Stage rewards: grants by kind (trader/shelter/link/shelter-
   fallback) per stage per seed; skipped reasons (already-granted /
   grant-failed / no-link-candidate); missed stages (a jump 0→2
   grants both — observed or not).
8. Cash-out + bank: `ladderCashOut` calls (expected 0 — competent
   never cashes out); `ladderBankPoints` writes at game over (kind
   'lost', points banked per seed); banked head start read at run
   start (expected 0 — each seed is a fresh process with a fresh
   in-memory meta store; the fixture proves a fresh loadGame reads
   0 even after a sibling run banked points); the bank's read side
   (head start applied) is therefore unobserved in-run, recorded
   honestly, not zero.
9. Say-line coherence: every ladder/stage/cap/overtime/feast/
   capstone say line in the corpus classified (stage beat vs live
   stage, cap beat vs capped track, overtime line vs tier/interval,
   bundle line vs bundle state, hold/release beat vs gated total);
   any line whose number contradicts the live state it describes;
   the stage-beat wording (does it read as a rung earned?).
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing (old bar), ladder stage.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: standing is a whole-life question (the ladder needs
  seasons of summed XP and kills; overtime needs the table announced
  at day 90+); sibling first-numbers pilots ran 150d with median
  survival 116–140d, so 150d captures the full village life without
  ticking dead villages. Same horizon as the siblings for
  comparability.
- **Seeds: 190351–190358 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190351–190358:
    zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    word-boundary grep, one seed at a time): zero hits for all
    eight seeds.
  - Searched ALL evidence `perseed-*` directory names for 19035x:
    no directory names any seed 190351–190358.
  - Searched ALL goal hidden_files `*.md` (coverage audit,
    convergence tracker, arm briefs, run notes) for 190351–190358:
    zero hits. (A full raw grep of the 3.4G hidden_files tree was
    started and killed after its .md-bearing portions completed —
    the remaining unread portion is .json/.log bulk that names no
    seed bands; recorded honestly.)
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190221–190228 (abilityfirst-a), 190301–190308 (vetfirst-b),
    191702, 199585 — none overlap.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
  - Search scope recorded so a later reader can retrace it.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg). No COMPETENT_TALK, no other env gate — default
    competent is the measurement substrate.
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal +
    deaths only), same seeds — must match the instrumented control
    leg exactly on days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/standfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- ladderTick: every call — stage/peak/counted before/after, capped
  tracks before/after, beat marks written (state._ladderPeakStage /
  _ladderCapBeat before/after).
- ladderStageBeat: every call — stage, ladder line at the time.
- ladderCapBeat: every call — track, rung attempted.
- ladderGrantStageReward: every call — stage arg, granted/skipped
  (kind per stage).
- ladderCashOut: every call — returned ok/kind/banked/peak/day.
- ladderBankPoints: every call — kind, points banked, already flag.
- ladderCapstoneReady: every call — kind, ready, reason, veterans/
  payable / charteredLinks / stage as returned.
- ladderDeliverCapstone: every call — kind, ok, reason.
- feastBundleCheck: every call — contributions, count, complete,
  ctx star/surge.
- feastBundleBuyOut: every call — ok, why, spent, bundleStage.
- hostFeast: every call — feast-log length before/after, last entry
  (day/quality/bundle/bundleStage), returned ok/why.
- overtimeTick: every call — tier/interval/active before/after,
  penalty.
- tele cross-check: 'overtime_tier' events only (the only tele type
  any standing/ladder/overtime module fires; ladder.js and
  standing.js fire no tele — recorded, not assumed).
- Daily snapshot: villageLadder() full object (tracks, countedTracks,
  capped, stage, peakStage, counted, total, nextThreshold, shortfall,
  detail incl. fightLedger/fieldXp/craftXp/links/contests/discovery/
  breadth/activeLinks/bundleBonus/bundleStages); capstone readiness
  per kind (military_tribute / trade_charter / feast_embassy);
  capstone delivered; ladderBankedHeadStart(); old standing:
  villageStanding(), standingPlentyCappedTotal(),
  standingDeferral(4), standingDeferral(5), _standingPeakWave(),
  waveCombatReadiness(4), waveCombatReadiness(5); overtime:
  overtimeActive(), overtimeTier(), overtimeInterval(),
  overtimeStanding(); table: tableSeat() (pure read — verified: reads
  only, no writes); scaleRank, nationalLive, globalLive,
  unlockedWave; waveLedgerPoints(3/4/5); deedState contestsSurvived;
  feastLog summary (entries, bundle entries, qualities);
  progState ladder fields (ladderRewards, ladderCapstone,
  ladderCashedOut, overtime, tableDone/Waiting/Announced);
  pantry kcal, roster size, bearer id (mantle detection), day.
  Snapshot reads are PURE: villageStandingTotal() is deliberately
  NOT called from the snapshot (it writes the peak ratchet and fires
  beats) — the gated total is recomputed in the analyzer from the
  snapshot's raw/capped/readiness/peak fields, using standing.js's
  own gating rules, and cross-checked against the engine's number
  wherever the engine already computed it (unlockedWave's wave).
Driver: scripts/standfirst-driver-20261111.js (mirrors
abilityfirst-driver; Game.say wrap with a standing/ladder regex for
the sense corpus, 200 lines/seed cap — same early-game-only caveat
as the siblings). Analyzer:
scripts/standfirst-analyze-20261111.js (classifiers for standing
events by track/stage/outcome; gated-total recomputation; stage
trajectories; cap-hit tallies; bundle tallies; readiness
trajectories; snapshot reconciliation for bank writes). Proof:
scripts/test-standfirst-b.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction; bank-freshness miniature: a banked run followed by
a fresh loadGame reads head start 0).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-abilityfirst-a,
sim-trustfirst-a, sim-fishstaff-b, cookfirst-a, preserve-a,
fishfirst-a, travelfirst-a, tradefirst-a). The control/neutral legs
are the neutrality proof, not a panel. Panel context: the standing
panel judges `national`, `table`, `entered` (wall numbers) but has
no metric for standing POINTS, ladder tracks, caps, bundle deeds,
capstone readiness, overtime stretch, or banked points (coverage
audit §4) — this arm supplies its first-numbers analogue (Metrics
1–9); the panel's `national`/`table` are the only existing
standing-adjacent panel fields.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (abilityfirst-a: median survival 116d, 1/8 survived,
630 deaths over 851 village-days; trustfirst-a: median 133d, 2/8
survived, 651 deaths over 1,150 village-days). If the instrument
changes any numeric field vs the recorder-free baseline, the arm is
NO-GO on neutrality. Bank-read-side guard: if any snapshot's
`ladderBankedHeadStart()` reads > 0 mid-run, the seed is flagged —
the head start would mean cross-seed meta-store leakage, and the
ladder numbers for that seed are quarantined in the evidence (the
fixture proves a fresh loadGame reads 0).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
