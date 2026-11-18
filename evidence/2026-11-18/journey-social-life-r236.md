# Journey social life r236 — Lane B (2026-11-18)

## Run

- Lane B occurrence 04:00 CST Nov 18, 2026 (run_id `2026-11-18T09:55:45Z`).
- Rotation-b read 5 at run start. This run plays 5 (social life) and writes 6 at closeout (written at run start with read-back).
- Base at registration: `5fac3cb71` (master; worktree branch `journey2-5`).
- Leg 5 (social life). Seeds 45725–45728 (fresh band, verified in the prereg), DAYCAP 140, policy journey.
- **ADOPTION:** none needed — r235's adoption completed before this run (DRY3 `9d5a45fcc` and DRY2 `39eaa043e` both ancestors of master; `journey2-social` tree and branch both gone). No held work was found.

## Leg question (carried from r226 + r229 + r231 + r234 + r235)

Does social life hold up across a full run — invitations sometimes taken,
bonds proposed and answered by character, moots firing, conversations
reading as people, wants surviving across sittings without drying into the
"...lost my train of thought." dead line — and do the r226 F6 fix, the r231
C3d fix, the r234 DRY2 fix, and the r235 DRY3 fix hold in the wild, with
the r236 TRAILTALK fix closing the 2-line trail-talk loop?

## Fix arm: TRAILTALK — landed [needs-eyes]

The r234/r235 finding: during a joint forage outing the driver (and a real
player mashing "Talk on the trail for a while") hears the same two lines
verbatim, alternating — r235 seed 45720: line A 12x + line B 12x.
Mechanism (traced from code): `talkLine` (`src/js/favor-forage.js`) held
one 2-line pool per temperament selected by `pool[n % pool.length]`, and
the line is spoken via `sayLine(vid, line, { diegeticAct: true })`, which
exempts it from BOTH no-repeat ledgers (r25) — so the ledger cannot catch
this repeat; the fix had to live in the pool/selection itself.

Fix (`src/js/favor-forage.js`, `talkLine` only):

1. Every pool 2 → 6 lines. The two originals stay first, in order, so the
   first two presses of any outing are byte-identical to before. New lines
   use only live state already in scope (partner first name, haul kcal)
   or plain trail flavor — no fabricated shared history, no named plants,
   no claims about unseen things.
2. Selection is no-repeat-until-exhausted within one outing: `r.talkUsed`
   (pool indices spoken on THIS outing, persisted on the forageRun) —
   each press takes the first unused pool index; the set resets only when
   the pool is exhausted. Deterministic, no RNG.

Proof `scripts/test-journey-social-life-r236-trailtk-20261118.js` (real
outing staged the test-joint-outing way, 12 talk presses):
**30/30 on fix (SEED=42 and SEED=7), 26/30 on base.** DRY3 proof 37/37
and joint-outing 36/36 stay green on the fix; proof re-run 30/30 after
the base-direction file restore (byte-identical diff-verified).

**Prereg-count correction:** the prereg says "exactly the 3 discriminator
assertions fail on base" — the actual count is 4, because the talkUsed
GUARD also fails on base (the mechanism does not exist there). The intent
(discriminators fail on base; behavior guards pass on both) holds exactly:
the three discriminators + the mechanism guard fail; the behavior guards
(original openers, second lines, talkCount, kcal interpolation, outing
completes) all pass on base.

## Panel

- **3/4 villages survived (45725 d141, 45726 d142, 45727 d141); 45728
  village-lost d110 (scattered, 5 alive, pantry 0 kcal).** 540
  conversations, 536 transcripts read by the analyzer.
- **M1 GO** — plots 3 (all early, d6–10), arms 3, grievance-linked 3/3
  by the reasons bar (binding judge). Springs 3 (escaped 1, killed 1,
  hurt 1), 0 expired plots. Vendetta max 2 (Hector<->Katarina).
- **M2 rate 0.283** proposals per village-day (151 proposals / 534 lived
  days; r235 0.31, r195 0.328 — watch only, no bar).
- **M3 GO (sometimes-taken)** — lure accept 378 / decline 349; party
  accept 28 / decline 22; bond accept 7 / decline 16.
- **M4 (human-read):** 536 transcripts, 257 nearDupFlags. The printed
  candidates are the same two families as r234/r235: the Haven-door
  positioning instruction ("same side of the Haven door", many paraphrase
  variants — the game re-explaining how to stand next to your partner)
  and repeated live-want re-asks (pantry run) plus the teach-lesson
  same-opening template. Verdict: instructional repeats + template
  families, not conversational parroting. The M4 split proposal
  (instructional vs conversational) stands.
- **M5 REPORT-ONLY** — 4/4 past d100. **Moots 9** (2+2+3+2).
- **M6 GO** (re-aligned gate definition) — no naming-beat line emitted
  beyond radius-1 of Haven; debates alive (177 kicked, 175 settled).
  Strict-definition away total 77 = the known metric/gate discrepancy,
  does not fail M6 (prereg).
- **M7 HOLDS** — NARR-DUP verbatimRepeats 0. **M9 HOLDS** — recap cap
  fires (296 presses, 0 after cap). **M10 HOLDS** — no NARR coach line
  repeats verbatim in one sitting. **FACE HOLDS** — no accuseFace
  repeats.
- **M11 GO** — recap-empty flags 0/257. **M12 informational** —
  door-req flags 197/257 (36.75%); M12-native HOLDS (threeTimes 111,
  max 1 per sitting, 0 sittings 2+, exits 129).
- **M8 SETTLED** — 1 link formed via driver settle, no BLOCKED
  re-raise.
- **B5:** 15 funerals — **10 full / 4 partial / 1 none** (r235: 12/4/1;
  r234: 12/3/1). Funeral feasts honest (12,000–37,268 kcal mended).
- **B6 GO** — 549 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 30 total, 14 confessed, 6 already-confessed, 8
  deflected, 1 cleared, 1 attacked, 0 double-confession sittings.
- **BOND ANSWERED** — 151 villager-initiated proposals (76 link, 75
  person; 42 accepted, 16 refused, 64 staged, 29 expired). Person
  accepted 22. End bonds per seed: 75 / 80 / 100 / 78.
- **F1 GO** — 5 "has an edge today" hits, all legitimate NARR mood
  beats ("Mujgan/David/Diana/Joyce/Vikram has an edge today — something
  curdled."). **F3 watch** — no commit-refusal-as-memory sighting.
- **F5 WILD CHECK — 0 servings** (all three r225 variants 0 across all
  seeds; r234: 3, r235: 0). Fifth thin panel in a row — the targeted
  harness from the r229 metric review stays owed.
- **F6 WILD HOLD — GO: 0 dry servings panel-wide.** Second consecutive
  clean panel (r235: 0, r234: 4). Verified by grep over all four
  per-seed JSONs, the analyzer log, and the panel log — the dry-line
  text appears nowhere.
- **TRAIL WILD HOLD — VACUOUS (not GO, not MISS): 0 trail-talk lines
  on all 4 seeds.** No forage outing started on any seed (the
  departure line "falls in beside you" appears 0x panel-wide), so the
  talk option never fired and the fix's wild effect is unmeasured this
  run. Per the prereg's thinness rule the bar is judged on the seeds
  where trail talk fires — none did — so the thinness is recorded, not
  re-scored. The proof test (30/30 on fix, discriminators red on base)
  is the binding instrument for the fix. The outing drought itself is
  the finding: r235 had outings on 1/4 seeds, r236 on 0/4 — the driver
  never converts a pantry-run ask into a dawn outing on this band.
  Filed as a remainder: driver seeking for outings (promoted from
  proposal to owed).
- **DRY3 site-1 wild hold — PROVEN:** the expedition ask ("What did you
  see out there?") was asked 17x panel-wide (r235: 4x) and the DRY3
  fallback line ("Saw things with too many joints…") fired 4x with
  **0 dry lines** — the exact collision the DRY3 fix guards against
  happened in the wild and held.

## People check (full transcripts read)

- **Anna (45725, D-talk-request, d~19, confrontation)** reads like a
  person cornered: deflects three times ("Nope. No." / "Ha. Funny. ...
  Interrogations?" / "That can wait — it isn't going anywhere."), then
  cracks with a real confession — "I wasn't a surgeon. I was a hotel
  housekeeper. Everyone out here is selling something. I was selling a
  better version of me." The lure ask gets a real deflection-then-accept
  ("I can't. Not today." → "Alright. But I'm not carrying your stuff.").
  Coherent arc, characterful voice.
- **Tebogo (45728, D-talk-request, trap line + theft confession)** —
  the trap-line walk, then "Okay. It was me. 2× Stick — I was hungry
  and I... I'm sorry." Then table talk ("Seven doors and it chose US.
  I save the best bite for last and try to feel chosen instead of
  chosen-at.") that lands as a person thinking aloud, ending "This was
  good. They mean it." Sour note: the "I save the best bite for last"
  image repeats in two consecutive goal-thread lines — a same-sitting
  image repeat, not a verbatim line repeat. Minor finding, filed, not
  fixed here.
- **Katarina (45725, D-talk-request, dropped-thread resume)** — the
  resume machinery works: "We never finished talking about what they
  confided — we wandered off it, 4 days back..." with the escalating
  prefixes ("Like I said — we're still on what they confided." /
  "We're going in circles — still on what they confided."), then a real
  question ("Have you ever hurt someone?") with a remembered answer.
  Ends warmly ("Good talk. I feel like I know you a little better now.").
- **Anna (45725, C-friendship, d27)** — "I used to be a hotel
  housekeeper who worried about being on time. Now I worry about being
  alive. Same worry, bigger font." A person with a past, a present, a
  view — plus a real deed inside the conversation (stockpile share:
  "Take half. You've got the hands for it." +4 wood, +4 fiber). "I think
  we're an experiment someone forgot to label. And the unlabeled part is
  what scares me — it means nobody's coming to check the results."
  Natural ending ("We're done for now. Not done-done. For now.").

## Census

- 45725: Hector survives d141, 5 alive; 7 successions
  (Ursula→Anna→Mounir→Wanjiru→Morris→Aki→Desmond→Hector); 11 fallen
  (Katarina ambush d10; Ursula/Anna/Wanjiru/Desmond "a stranger";
  Mounir/Morris the wild; Enyonam/Nipaporn monster; Amina starvation
  d104; Aki contest d130); 20 feasts, 2 moots; pantry 9,877 kcal.
- 45726: Carmen survives d142, 8 alive; 4 successions
  (Nora→David→Wanjiru→Ingrid→Carmen); 6 fallen; 20 feasts, 2 moots;
  pantry 10,873 kcal.
- 45727: Rafael survives d141, 5 alive; 5 successions
  (Caroline→Joyce→Diana→Andre→Nikolai→Ingrid); 12 fallen; 20 feasts,
  3 moots; pantry 6,501 kcal.
- 45728: Desmond's village lost d110 (scattered), 5 alive; 7
  successions (Meera→Vikram→Yuki→Ethan→Caleb→Sigrun→Terrence→Desmond);
  10 fallen incl. a **d66 death cluster ×3** (Brendan "a stranger",
  Yuki contest, Ethan the wild — one bad day); 15 feasts, 2 moots;
  pantry 0 kcal.
- Scholar deaths (mantle passes): 23 panel-wide (7/4/5/7). No village
  won or ended.

## Telemetry

`telemetry-check.js` vs the social baseline: **QUIET** (4 files, 4
metrics, no large deviations). Baseline NOT rolled (same as r231/r234/
r235 — the social.json baseline carries only stale-era l3.* keys the
driver never emits; the metric-mapping re-seed stays deferred).

Determinism proof: seed 45726 re-run to a scratch OUTDIR — JSONs
identical except the `ms` timing field. The driver wraps add no RNG and
mutate no state.

## Gate

`node scripts/check.js --quick` on the branch tip (adoption re-run,
solo, 2026-11-18 ~12:16–12:46Z, log
`evidence/2026-11-18/journey-social-life-r236-gate-adopt.log`):
**329 passed, 12 failed in 1759s, 0 attributable to this run's change.**
The 12: measurement-proof staleness pair (proof-update "Proof source
inputs are not current" + workflow), phone-frame stale receipt
("Phone receipt source is stale or missing: index.html"), ladder-bundle
control (1 fail: "200 monster turns WITHOUT delivery fire the ambient
raid"), measurement-cache-flags 0/4 (known load artifact), and 7× 120s
timeouts under load (living-garden-deed, occupation-panels,
one-person-army-deed, solo-campaign-endings, trust-observer-neutrality,
synergy-stall, capable-bot) — two verified green standalone
(synergy-stall exit 0; solo-campaign-endings 15/15). None touches
favor-forage.js or trail talk. The run's own gate attempt timed out
with the occurrence (partial log `journey-social-life-r236-gate.log`,
dots only, no summary); the first adoption gate attempt was killed
~1 min in for concurrency with the sim-wildavoid-a gate and re-run
clean after it finished.

## Metric review

- **F6 bar (0 dry panel-wide) is MET for the second time** (r226: 21 →
  r231: 4 → r234: 4 → r235: 0 → r236: 0). The per-site patch program is
  holding; with DRY3 site-1 now proven in the wild too, the
  sayLine choke-point question closes as "sites were the whole story"
  unless a new site appears on a later panel.
- **Prereg count correction:** "exactly the 3 discriminator assertions
  fail on base" undercounts — 4 fail (the talkUsed mechanism guard).
  The bar's intent (discriminators fail on base, behavior guards pass
  on both) is the binding reading; the count is corrected here, not
  re-scored. (Same class as r235's correction.)
- **TRAIL bar thinness:** the panel bar went vacuous (0/4 seeds fired
  trail talk). The proof test is the binding instrument; the panel is
  the wild check only when outings happen. The next run needs the
  driver-seeking proposal as an arm, not a watch — two panels in a row
  with ≤1 seed exercising the site (r235: 1/4, r236: 0/4) means the
  wild hold cannot be judged from the standard panel at all.
- **M4 split:** the near-dup count (257) is still dominated by
  instructional lines (Haven-door cluster + live-want re-asks + teach
  templates). The split proposal stands for the next run.
- **F5:** fifth thin panel in a row (1, 3, 0, 0). The targeted harness
  stays owed; the analyzer still carries no settled-favor counter
  (this count was produced by grepping the three r225 variant texts,
  as r231/r234/r235 did).

## Verdicts

- **Reachable:** yes — invitations, bonds, moots, funerals,
  confessions, and the full want arc all fire across a full run.
- **Fun:** mostly — villages read like people and wants survive
  across sittings, the dry line is silent for the second panel in a
  row, DRY3 site-1 held in the wild, but the trail-talk fix has no
  wild proof yet (no outings on this band) and the instructional
  repeats (Haven-door, accept-first) still nag.
- **Winnable:** not judged on this leg.

## Remainders

- F5 targeted harness (owed per the r231 rule — fifth thin panel).
- Driver seeking for outings (promoted from proposal to owed — the
  TRAILTALK wild hold is vacuous without it; r235: 1/4 seeds, r236:
  0/4).
- Trail-talk pool widening — LANDED this run (proof-carried; wild hold
  still unproven).
- Tebogo goal-thread image repeat ("I save the best bite for last"
  twice in one sitting) — minor, filed.
- repay.engageBeat broken/open pools (same class as F6, unobserved);
  all-3-blocked F5 residual (r226).
- Proof refresh round 21 (measurement-proof pair fails on any src/js
  change until refreshed).
- M4 split (instructional vs conversational) — proposal for next run.
