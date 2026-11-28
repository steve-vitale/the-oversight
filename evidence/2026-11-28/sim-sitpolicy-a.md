# sim-sitpolicy-a — the sitting policy (Loop A, scale-onramp)

- Run: `fleshout-20261128T0815Z`, Loop A, axis scale-onramp (the scale wall)
- Worktree: `~/workspace/worktrees/sim-sitpolicy-a`
- Base: master tip `aa3860792b17abfaa755b40bc893267dd40069f9`
- Prereg: `evidence/2026-11-28/sim-sitpolicy-a-prereg.md` (committed
  `ea4975a00`, correction §7 committed `30f84fc9`)
- Instruments: policy + driver + analyzer + proof test, committed
  `e1daf92d` (proof test 90/90 green)
- Panel registration: `scripts/sweep-compare.js` (competent-sit entry)
- Seeds: **113601–113608**, horizon **150d death-aware**, 8 seeds pilot
- **Verdict: NO-GO (seated 3/8, bar ≥4/8)** — the miss is a NO-GO by the
  frozen bars (§14), never re-scored. The sitting mechanism itself is
  proven: where the seat is reached, the policy sits and wins 3/3.

## §1. The lever, in plain words

The competent bot knew how to earn the lesser seat but had no verb for
sitting in it — it waited for a better seat that never came (0/8 seated
on the census band). This arm teaches it to sit: a new policy,
`scripts/policies/competent-sit.js`, that plays the competent game and,
each dawn at Haven, in frozen order (a) answers any staged national
court beat, (b) buys out the feast bundle when the feast deed is
bundle-blocked and the pantry holds ≥16,000 kcal, (c) delivers a ready
capstone (tribute first, then charter, then feast), (d) takes the lesser
seat the first dawn it is offered and plays the table by answering the
first presented option, and (e) while waiting for the seat, ends the day
at Haven. No `src/js` changes; the policy plays the game as coded.

## §2. Before / after on identical seeds

| Seed | Before: lesser | Before: end | After: lesser | After: seated | After: path | After: won | After: delivered |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 113601 | d50 | lost d138 | d149 | d150 lesser | feared | **d150** | feast d28 |
| 113602 | d53 | survived | never | — | — | no | feast d27 |
| 113603 | d54 | survived | d123 | d124 lesser | feared | **d124** | feast d40 |
| 113604 | d50 | survived | never | — | — | no | feast d30 |
| 113605 | d46 | lost d121 | never | — | — | no | feast d29 |
| 113606 | d39 | lost d100 | never | — | — | no | feast d15 |
| 113607 | d63 | lost d137 | never | — | — | no | feast d37 |
| 113608 | d51 | survived | d134 | d135 lesser | feared | **d135** | feast d32 |

Band aggregates:

| Metric | Before (competent) | After (competent-sit) | Frozen bar |
| --- | --- | --- | --- |
| Seated | 0/8 | **3/8** | ≥4/8 — **MISS** |
| Capstone delivered | 0/8 | **8/8** (all feast_embassy) | ≥2/8 — pass |
| Wins | 0/8 | **3/8** (d124, d135, d150) | headline, not a bar |
| National reached | 0/8 | 0/8 | — |
| Regional reached | 8/8 | 8/8 | — |
| Lesser reached | 8/8 (d39–63) | 3/8 (d123–149) | — |
| Median survival | 144d | 150d | pool floor ≥6/8 alive d80: 8/8 pass |
| Village-lost | 4/8 | 0/8 | — |
| Feast bundle bought | — | 8/8, all day 1 | — |
| Court beats answered | — | 0 (none ever staged) | — |
| Instrument errors | 0 | 0 | 0 — pass |
| Snapshot coverage | — | 1167/1167 = 1.00 | ≥0.95 — pass |
| Reconciliation mismatches | — | 0 | 0 — pass |
| Determinism | — | byte-identical rerun (proof test) | pass |

Before-leg detail: the tribute deed was ready on 3 seeds (113603 from
d105, 42 ready days; 113604 from d129, 2 days; 113608 from d120, 3 days)
but never delivered — the competent bot has no delivery verb. The
after leg's feast deliveries (d15–40) end the other deeds'
observability: once a capstone is delivered, tribute/charter readiness
reads "delivered" in the daily snapshots, so their after-leg readiness
is only observable before the feast delivers — and before that, neither
was ready (the tribute needs wave-4 kills, which do not happen that
early).

## §3. Reachability verdict

- **National: 0/8 on both legs.** The scale wall stands. No polity ever
  qualifies, no court beat ever stages (0 answers, 0 unknown shapes on
  the after leg), so the full seat is unreachable on this band from
  either policy. The scalerank-a finding is unchanged.
- **Table: 3/8 seated, 3/8 won.** The lesser seat is reachable and,
  once sat, winnable: all three sittings walked the feared path and won
  (d124, d135, d150). The table is not the wall on this band — reaching
  the lesser seat is.
- **Wins: 0/8 → 3/8.** The first competent-band wins via sitting on
  this base. All three are lesser-seat wins through the feared path;
  none needed the full seat, national standing, or a delivered tribute.
- **Wave reach (panel):** before 4,4,4,5,4,4,4,5; after
  4,5,4,3,3,3,3,3. The after villages fight less and climb less: four
  stall at wave 3 and never earn the lesser seat. The before villages
  all reached wave 4 and two reached wave 5.
- **Median survival:** 144d → 150d. Nobody is lost on the after leg
  (before: 4 lost). End populations: before 1,9,3,8,0,5,1,9; after
  10,11,8,10,8,10,9,10.
- **Sitting count:** 3 (all lesser, all first-ready-dawn, all feared).
- **Capstone deliveries:** 8/8, all feast_embassy, days 15–40. The
  bundle is bought on day 1 on all 8 seeds (pantry 47,250, stage 0 —
  stage 1 on 113606).
- **Feast-bundle progress:** the bundle is the live road. Once bought,
  the feast deed is ready the day the ladder reaches stage 3 and is
  delivered the same dawn.
- **Deaths (deathcensus module, after leg):** 28 total, 28 named,
  classification completeness 1.00. Largest causes: ambush 4, the wild
  4, monster 3, the arena 3, contest 3, starvation 2, a stranger 2,
  the rest singles (lockjaw, The Ugly Beast, the night, Hushpuppy,
  Highbeam Deer, sickness, a wound that wouldn't close). The panel's
  death counts (all deaths incl. monster kills) are roughly half the
  before leg's: village deaths/run 86.9 → 42.6, player deaths/run
  7.5 → 2.0.

## §4. What the villages looked like, and what sitting feels like

The after villages live quiet, fat lives. They grow to 8–11 people,
almost never run low on food or water (panel: sampled reserve below
500 kcal 1.2% → 0.1%; sampled hydration below 25% 9.9% → 0.3%), and
die about half as often as their verbatim twins. But they do not climb:
five of eight never face wave 4, never reach the lesser rung, and end
day 150 regional, unseated, alive and uneventful. The three that do
climb sit the first dawn the seat is priced and win.

The before villages are the opposite picture: leaner, bloodier, all
eight reach the lesser seat by day 63 — and then sit outside it for
60–100 days while the table says nothing. On 113602 the seat is
announced on day 90 ("THE TABLE IS SET. A ring of pale light waits —
take your seat from Haven when you are ready") and then the table goes
silent for sixty days except overtime warnings; raids keep taking food;
the pellet passes from Sam to Ruth to Miguel. The competent bot never
sits, so the seat just waits. That is the census finding, reproduced
exactly on the fresh band.

What sitting feels like, from the winning seed 113603 (day 124):

- The feast delivery on day 40 is voiced right, with the seatvoice fix
  in place: "THE EMBASSY — the table is set, the bundle is served, and
  the galaxy ate from it. The deed is done — the seat still waits on
  the deeds." And the mercy line: "between now and the seat, the world
  holds its breath. The wild can still take your food — but it cannot
  take your people."
- Day 90, the wait is voiced once and names the missing deed: "the ring
  of pale light flickers at the edge of the sky... and does not come.
  Not yet. The table is being set for those whose deeds are done, and
  yours are not done. The ledger still wants: wave-3 monsters faced.
  The climb is not over."
- Day 123: "The table is being set — a lesser seat, priced for what
  you built. They are watching to see who comes to it."
- Day 124, the sit: "it is not a table. It's a ring of pale light, and
  around it, things with too many angles to be faces. Above it all —
  the audience. Trillions of eyes, and every one of them knows your
  name. The System speaks, and for once it isn't performing: HUMANITY
  PRESENTS ITS CASE." Then the audit reads the run back: "A lesser
  seat — regional standing, waves 1–3 faced (15/10/3), 16 contests
  survived, 3 crises weathered. The table does not rise. It prices."
- The feared path plays as one coherent story across five first-option
  beats: walk the path of the Feared; lead with the kill ("Look what
  eating built"); lean in ("The deer. The cleanest kill. The table goes
  very still"); spend the terror shielding them ("You spend it — the
  shield, not the sword"); show mercy ("The most frightening thing you
  ever did... mercy from a predator... the audience weeps, and the
  galaxy learns that the feared one chose gentleness"). It ends: "You
  won. Say it plainly: you won. The village endures. The table signed."

Two sense-test findings, stated plainly:

1. **The wait is announced once and then goes quiet.** On the
   non-seated seeds the day-90 "not yet" line fires and the table says
   nothing more for 30–60 days while the village lives a full, eventful
   life (on 113602: Emberhold splits into a cannibal faction, the Red
   Table forms, Lucia walks in hungry twice and nobody answers,
   Ashford burns). The census §7 waiting-talk variety finding is NOT
   resolved by this arm — the wait leg itself never fires a multi-day
   wait on this band (waitLogDays 0 on all 8 seeds; the winning seeds
   wait exactly 1 day, the seat day itself, because the policy sits on
   the first ready dawn and the seat arrives late). A village that
   earns the seat early would wait longer, and we have not heard what
   that sounds like yet.
2. **The drain plays sensibly.** Fifteen drain answers across the three
   wins, zero drain errors, zero blocked drains, zero sit errors. The
   first-option rule never picked a trial beat or a conscript (none
   were offered on this band); the seat-carve-outs (own character id,
   trial refusal) are proven only in the fake-Game unit legs, not live.

## §5. The reshuffle: why the seated bar missed

The miss is not the sitting. Where the seat is reached, the policy
sits and wins 3/3. The miss is upstream: on the after leg only 3/8
villages ever reach the lesser rung (days 123–149, vs 39–63 before),
and the other five end the run regional and unseated.

The divergence starts on day 1. The frozen bundle rule fires on the
first dawn of every seed (pantry 47,250 ≥ 16,000), spending 8,000 kcal
and banking the feast deed. That single state change reshuffles the
whole trajectory — verified on 113301 during the proof phase (day-2
pantry 34,140 sit vs 41,630 verbatim) and confirmed by the band: the
after villages live in a different, quieter regime from day 1 (fewer
fights, fewer deaths, lower wave reach, later-or-never lesser). The
leg-2 pairing property (non-delivery seeds byte-identical) does not
transfer to this arm, as corrected in prereg §7 before any judged sim.

What is NOT established: whether the bundle buy-out itself causes the
wave-3 stall, or whether it is reshuffle noise (chaotic trajectories
amplifying one early state change). The mechanism is unproven — a
bundle buy gives +4 ladder points per stage and banks a deed, which
should help the ladder, not hurt it; the stall may come through the
pantry (fewer feasts hosted on a thinner pantry → fewer track points)
or through pure reshuffle. Eight seeds cannot separate those. The
honest statement is the correlation: after-leg villages are safer,
fatter, and climb less. The next diagnostic is a bundle-deferred (or
bundle-disabled) sit variant on the same seeds: if wave reach and
lesser timing recover, the buy-out is the cause; if not, the stall is
reshuffle. That diagnostic is for the next arm, not this one — the
bars were frozen, and retuning the bundle rule mid-run on one seed
would be small-n overfitting.

A second, smaller attribution note: the after leg's survival
improvement (0/8 lost vs 4/8) is likewise a reshuffle correlate, not
an attributable policy effect. Do not claim "the sitting policy saves
villages."

## §6. Balanced panel (column compare)

`balance-panel.js compare` refuses cross-policy panels by design
("Unmatched policies" / "Unmatched cases" — see
`sitpolicy-panel.json`, decision invalid): it is built for source
levers, same policies on two game roots. A policy lever IS the policy
column, so the comparison here is a column compare
(`scripts/compare-sitpolicy-panels.js`): the two single-policy panels
(competent / competent-sit, same 8 seeds, 150d, same observer digest
`f37e5ce03414`, same contract digest `37bbb0fad947`, both
sourcesStable, both neutrality proofs match with zero warnings) paired
by seed through the scorecard's own `compareMetric` over the same
23-metric contract. Full table: `sitpolicy-panel-compare.md`.

- **Decision: review_required** (screen only, 8 pairs — not
  confirmation-sized).
- Table win rate 0 → 0.375 (+0.375, 95% exploratory interval 0 to
  0.75) — **change_watch** (neutral direction, reviewChanges, delta >
  tolerance; interval includes 0).
- Table entry / sitting 0 → 0.375, no_material_signal (direction
  higher, improvement).
- National scale access 0 → 0, no_material_signal.
- First bearer alive through day 30: 1.00 → 0.75 (−0.25) —
  **regression_watch**. On two seeds the first bearer dies before day
  30 on the after leg; the before leg had 8/8 alive. Unproven whether
  the day-1 pantry spend is the cause.
- Player named-class access 1.00 → 0.75 — **regression_watch**.
- Player deaths/run 7.5 → 2.0; village deaths/run 86.9 → 42.6;
  community loss 0.5 → 0; mean living NPCs 7.53 → 9.22; sampled
  reserve below 500 kcal 1.2% → 0.1%; sampled hydration below 25%
  9.9% → 0.3% — all no_material_signal (directions lower/higher as
  specified, all improvements), but all in the same direction: the
  after villages are safer and fatter.
- Table reach (raw, display only): invitations observed 8/8 before →
  3/8 after; sittings 0/8 → 3/8. The invitation count FALLS because
  the after villages reach the lesser rung less often — the panel
  confirms the §5 reshuffle in its own numbers.
- The panel is the instrument, not the judge (§15). Its
  review_required (three watch flags) is an investigation note, not a
  re-score: the frozen verdict stands at NO-GO SEATED.

## §7. Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-28/perseed-sitpolicy-a-arm/s*.json' --metrics national,table,wins,exiled --sweep-rows`
(the `--sweep-rows` flag matters: without it the checker reads a
literal `wins` field, finds none, and reports a spurious "wins
disappeared → current 0"; with it the alias `wins → won` applies and
the wall reads `table=3/8 entered=3/8 won=3/8`):

- LOUD: national disappeared: baseline 12 → current 0
- LOUD: table swung −81%: baseline 16 → current 3
- LOUD: wins swung −81%: baseline 16 → current 3

**Verdict: regime artifact, not a bug.** The baseline's own `_regime`
note labels it "winseat — full win-side win stack, ~100%-win suite"
(national 12/16, table 16/16, wins 16/16 under FEASTSCALE_R13 /
WINPURSUIT / SEATDRIVE flags) and says explicitly: "DO NOT compare
pre-seat / courtship / readiness substrates against this baseline —
wins are structurally ~0 there." This arm is a pre-seat competent
substrate; the LOUD lines are the expected regime gap. Notably the
sitting policy moved wins 0/8 → 3/8 on its own band, above the
structural ~0 the note expects. No baseline roll-forward — coordinator
say-so required, not requested.

## §8. Metric review (§14)

- The frozen bars measured what they claimed. Seated ≥4/8 was the
  right primary: it is the thing the lever was built to move, and it
  missed honestly at 3/8. Delivered ≥2/8 was too easy in hindsight —
  the feast road delivers on 8/8 once the bundle is bought on day 1;
  the bar did not discriminate. A future run should set the delivery
  bar per-kind (tribute/charter) or drop it as a GO bar and keep it
  descriptive.
- The miss is NO-GO, never re-scored against a friendlier metric
  mid-run. The 3/8 wins are a headline secondary, not a rescue: wins
  were frozen as secondary, and a 3/8 win rate on a band where 5/8
  never reach the seat does not overturn the seated bar.
- What the bars could not see: the seated bar conflates two things —
  reaching the lesser rung and sitting once there. The policy is 3/3
  on the second and the band is 3/8 on the first. The next run should
  split the bar (lesser-reached ≥6/8 AND seated-given-lesser ≥3/4) so
  a ladder failure cannot masquerade as a sitting failure.
- The panel's three watch flags (win-rate change, day-30 survival,
  named-class access) are investigation notes for the next arm, not
  verdicts.
- Confirm 12–16 seeds: **not warranted.** The pilot failed its GO
  bar; the next spend is the bundle-deferred diagnostic (§5), not a
  confirm.

## §9. What remains open

1. **Bundle-deferred diagnostic (next arm):** same 8 seeds, sit
   policy with the day-1 buy-out deferred (or disabled) — does wave
   reach / lesser timing recover? Decides whether the buy-out causes
   the wave-3 stall.
2. **National road:** 0/8 on both legs; the scalerank-a wall stands.
   The sitting policy cannot help a village that never reaches
   national, and the full seat stays unreachable on this band.
3. **Waiting-talk variety (census §7, still open):** the wait is
   voiced once (day-90 "not yet") and then goes quiet for 30–60 days.
   Untested on a village that earns the seat early and waits long.
4. **Court beats:** 0 staged on this band, so the answer mapping
   (lead→feast, conquest→mercy, belong→swear, covenant→pact,
   trade→sign) is proven only in the fake-Game unit legs, not live.
   Same for the drain carve-outs (trial refusal, conscript refusal,
   own-character seat pick) — unit-proven, not live-proven.
5. **Feast-bundle stage question (filed in sim-findings.md):** a
   bundle bought at stage 0/1 satisfies the stage-3 feast deed
   (`_ladderFeastBundleDone` accepts any bundle flag regardless of
   stage). Steve-call whether the deed should require a bundle banked
   at stage 3.
6. **Panel compare for policy levers:** `comparePanels` cannot compare
   two policies; the column-compare script
   (`scripts/compare-sitpolicy-panels.js`) is the workaround used here
   and is committed for the next policy-lever arm.

## Attachments

- Prereg (frozen + §7 correction):
  `evidence/2026-11-28/sim-sitpolicy-a-prereg.md`
- Before corpus (competent verbatim):
  `evidence/2026-11-28/perseed-sitpolicy-a-before-arm/` (8 rows)
- After corpus (competent-sit):
  `evidence/2026-11-28/perseed-sitpolicy-a-arm/` (8 rows)
- Analyzer verdict: NO-GO SEATED (seated 3/8, delivered 8/8, pool
  8/8, coverage 1.00, reconciliation 0, instrument errors 0)
- Before panel: `evidence/2026-11-28/sitpolicy-panel-before/panel.json.gz`
- After panel: `evidence/2026-11-28/sitpolicy-panel-after/panel.json.gz`
- comparePanels refusal record: `evidence/2026-11-28/sitpolicy-panel.json` /
  `.md` (decision invalid — Unmatched policies/cases)
- Column compare: `evidence/2026-11-28/sitpolicy-panel-compare.json` /
  `.md` (decision review_required)
- Proof test: `scripts/test-sitpolicy-a.js` — 90/90 green, including the
  two-phase live sit that won on day 96 via the feared path.
