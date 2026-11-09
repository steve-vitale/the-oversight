# Journey r118 — establishment, leg 1 (days 14–40) — RUN NOTE

- Run: `oversight-playtest-loop`, Lane A, run r118, run_id `playtest-loop-a-20261109T1145Z`
- Rotation read `1` (establishment); write `2` (deepening next) at closeout
- Branch `journey-establishment`, base master `2215e22d4` (r117 landed)
- Seeds (fresh band): 1901–1916. Policy: competent + HUNTSTAFF=2. Horizon 42 days.
- Prereg: `evidence/2026-11-09/journey-establishment-r118-prereg.md` (§14 bars bind; no mid-run re-scoring)
- Analysis: `evidence/2026-11-09/journey-establishment-r118-analysis.txt`
- This run's first half closed out the dead r117 run (stale-lock recovery;
  registry heartbeat 16:37:22Z, >1h stale; no live process) — r117 committed
  as `2215e22d4`, proof re-run ALL GREEN on the rebased base, ff-only
  merged, tree released. The r117 lock was already gone at takeover; this
  run's own lock is `2026-11-09T17:43:26Z`. The safe-commit index clobber
  struck the adoption commit (all 15 files D + ??); repaired per AGENTS.md,
  hash-verified, tree clean.

## The leg's question

r117's 4-seed pilot fired a pace03 REGRESSION SIGNAL (2 vs bar ≤1) on
fresh seeds. This run is the **full 16-seed panel the pilot called for** —
the judge. Second question: does the driver invitation-answer rule
(r117's owed measurement fix) work — do NPC invitations get answered now?

## Verdicts

| Check | Bar | Measured | Verdict |
|---|---|---|---|
| Q1 pace (moves) | ≥8/16 seeds | **11/16** | GO (leg) |
| Q1 pace (pace03) | ≤4/16 | **7** | **REGRESSION CONFIRMED** |
| Q2(a) game offer | accept+decline on every invite menu | **17/17 menus** | PASS |
| Q2(b) driver answer | ≥80% answered | **17/17 menus; 12/13 spoken lines** | PASS |
| Q3 null THEM lines | 0 | **0** | PASS (holds) |
| M3 villages surviving to day 42 | ≥12/16 | **16/16** | pass |
| M4 villages with no starvation death | ≥12/16 | **15/16** | pass |

**Q1 REGRESSION CONFIRMED.** Seven villagers raced from nothing to
specialist level 3 in 42 days on fresh seeds — Priya (1901, preserver,
fx 37), Nolan (1904, butcher, fx 66), Benoit (1907, preserver, fx 68),
Brendan (1908, preserver, fx 84), Gina (1911, preserver, fx 41 at d28),
Alex (1916, preserver) and Francesca (1916, preserver, fx 55) — two on
one seed. Rate 0.44/seed vs r116's 0.25/seed (4/16) and the pilot's
0.5/seed. Per the binding prereg this is CONFIRMED, not a signal: the
next dial is the **grant rate** (how much credit a rack batch or a hunt
kill awards), per r116's metric review. Do not re-run the rung. Two
things sharpen the dial: (1) Nolan is the first BUTCHER racer — 71 hunt
kills on seed 1904, fx 1→30 between d14 and d28 — so the grant-rate dial
covers the hunt-kill grant site as well as the rack-batch site; (2)
Brendan reached fx 72 by d28, so the race is often decided by day 28,
not day 42 — the dial has to bite early, not just at the top.
**Q2 PASS, both halves.** (a) The game offers the answer on every
invitation-owned menu presented on the panel (17/17; proof test 26/26).
(b) The driver answered 17/17 menus presented (16 accept, 1 decline).
12 of 13 spoken invitation lines were answered in-transcript; the 13th
(Nikolai, 1915, "Walk my trap line with me?") was spoken on the final
sampled turn, so the answer menu was never reached in the 8-turn window
— a sampling-window miss, not a game defect. Four of the 16 accepts came
from pending invites surfacing at convo start with no fresh spoken line
(Eric 1902, Nolan 1904, Tejaswi 1904, Ella 1911) — see metric review on
the denominator. The single decline is the rule working as designed:
Victor (1910), trust 8, "Not this time." / "Another time, then." — and
the convo carries a small chill afterwards ("A small chill settles
between you. They're choosing words more carefully."). Two accepts
bailed out after agreeing — Hanadi (1906) and Brunhilde (1913), same
line both times: "Maybe not today. The fire's got me." — the walk
doesn't happen; counted as accepted, noted as a variant outcome.
**Q3 PASS.** 0 null THEM lines; the r116 fix holds on the full panel.
**M3/M4 PASS.** All 16 villages alive at d40 (8–12 people each from a 12
start); 15/16 with zero starvation deaths — seed 1914 has 1 starvation
death, the only one on the panel.

## Village assessment (plain words)

Sixteen villages, all alive at day 42–44, 8–12 people each. The food
work is visibly happening at scale: 911 cook resolutions, 357 drying-
rack batches, 151 hunt kills across the panel. The villages that hunt
hardest eat best — 1908 (34 kills) ends with 161,486 kcal in the pantry,
while 1915 (6 kills) ends lean at 18,019 — but even the lean village
survives with 10 people alive and no starvation death. Everyone reached
wave 3 of the monsters; 7 of 16 reached wave 4. The ladder moves on 11
of 16 villages but only through preserving and butchering: every move is
preserver (11) or butcher (5); cook, spotter and builder move nowhere,
foodXp totals preserver 705 / butcher 131 / rest 0 (dEnd foodXp is a
lower bound — see metric review on the read artifact). Nobody starved
except one villager on 1914. The quiet villages this time are 1906 and
1910: racks fire (20 and 17 batches) and people cook, but nobody picks a
food skill up — the same shape as r116's seed 17107 and r117's 1802, and
like them it is not a ladder problem; the village survives without
specialists.

## People check (all 64 held convos read in full)

The conversations read like people, and this panel the invitations
finally get answered — the accept lines lead somewhere real: Sigrun's
ridge walk, Nolan teaching slope-reading for water ("how their
grandmother did it"), Tejaswi carrying a link proposal to Thornfield,
party namings (PLOT ARMOR, THE NIGHT SHIFT, MEAT AND FRIENDS, THE
ENSEMBLE, THE PROTAGONISTS — 5 picked; Marco's 1905 naming menu was
offered but unpicked at the 8-turn cap). The player-initiated party
invite ([dlg:invite]) is answered every time, with character: "Someone
should watch your back. Might as well be me." / "Not right now. I've got
my own things to handle." / "Okay. Yeah. I trust you." / "We've barely
spoken. Ask me after we've bled together." (Charlotte, 1914 — a
characterful refusal). The no-shared-language beats are the strongest
threads on the panel — 7 villagers across 6 seeds (Ingy, Manh,
Sebastián, Ayan, Abdallah, Chantal, Nurlan) — including Abdallah miming
the trap-line invitation with no shared words at all, and Chantal
laughing at the player's French ("Good try! Again — D'accord."). Jae
(1909) plants a real thread: "I know who took the extra rations but
won't say." Imani (1909) on the left-behind: "I don't talk about that.
Not because it's secret — because saying it out loud makes it real in a
way I can't afford yet."

Defects and watches, all read in full:
1. **Pace03 regression confirmed (7/16)** — see Q1. The game fix is the
   grant rate, next run's dial; not this run's scope.
2. **Taken-kin template still repeats verbatim.** "Went up in the Taking
   with the boring half. He was the funniest person I knew. Their
   metrics are broken. ... rows of them, humming like a held note" —
   full verbatim in 1903 (Henry/Declan, Leroy/Frank, Molly/Majed — three
   in one seed), 1908 (Willie/Roman), 1916 (Kate/Jessica); "boring half"
   7× across the panel. Fresh variants are appearing — Violeta (1905):
   "She was nineteen. Nineteen years of being interesting was not
   enough, apparently."; Brunhilde (1913): "She made soup from nothing
   and they called that boring."; Nikolai (1915): "He asked if they were
   boring. I did not answer." — but the template is still the dominant
   shape.
3. **"Something in them almost softens — then doesn't. Not yet."** 12×
   across 64 convos (1901, 1902, 1903×2, 1905, 1908×2, 1913, 1915×2,
   1916). In voice, but the beat is doing a lot of work across the panel.
4. **Deflect pivot** "Sorry — I shouldn't load that on you. What's up?"
   8× across the panel. Same class as (3): pivots, not filler loops; the
   most-repeated THEM line in any sitting is 2×.
5. **The favour-requirements line still reads like a system
   instruction**: "Move next to them, on the same side of the Haven
   door, to help." 4× (Alejandra 1901, Greta 1906, Aaliyah 1909, Linh
   1912). Carried from r116–r117. Variants exist and read better in
   context — "Finish the fight before helping." (Mai 1907, Sean/Rehab
   1908), "Your partner is inside the Haven hall. Go through the door to
   meet them." (Tom/Diana 1912) — but the Haven-door phrasing is the one
   that repeats.
6. **Water-haul favour repeats 3× in one seed** (1912: Tom, Linh, Diana
   — same "3 liters" numbers, same ask). Same class as the taken-kin
   template: one favour, no per-villager variation in the numbers.
7. **Stalls: 3 on the panel** (r117: 0, r116: 1). Chantal (1914) and
   Nurlan (1916): no-shared-language menu exhaustion — every nv:* used
   once, the driver won't pick leave, nothing new offered. Karen (1915):
   post-silence dead menu — after [silence] the only offers are the
   already-visited subject, leave, and silence. All three are
   driver-hygiene artifacts (never pick leave), but Karen's shape is the
   game offering no fresh thread after a silence. Five more no-picks were
   clean winding-down endings, not stalls.
8. **Accept-then-bail (2 cases).** Hanadi (1906) and Brunhilde (1913)
   accept an invitation and then don't go, same line both times. The
   accept is counted and the outcome recorded; in-voice it reads as a
   villager who agrees and then can't get up — characterful, but the
   line is identical both times.
9. **preserve_food, carried.** Holders 0–8 per seed; cook resolutions BY
   holders track holders doing cook duty, not the skill being used — the
   skill's own villager-side read site remains the open gap (r114–r118).
   Same class: the panel's specialist moves are all preserver/butcher,
   yet preserve_food itself still has no job a villager can do on their
   own.

## Reachable / fun / winnable

- **Reachable: yes.** The ladder moves on 11 of 16 fresh villages inside
  the leg, racks fire 357 times, food gets stored, wave 3–4 reached.
  Everything this leg is about is reached by a competent player.
- **Fun: yes, better than r117.** The invitations finally get answered
  and the answers lead somewhere — walks, lessons, link proposals, party
  namings. The villages read like people, and the leg's stakes — food,
  water, the wild — are live in every conversation. The remaining fun
  gaps are the repeated lines (taken-kin template, softens beat, deflect
  pivot, Haven-door line) — the same four carried items, now measured on
  16 seeds instead of 4.
- **Winnable: unchanged by this leg, with a flag.** Establishment is not
  the binding link (scale r112: the veteran wall and the trade-route
  wall). But the pace confirmation matters for the standing path: the
  Standing ladder's Craft track mints from the same practice credit, so
  seven fresh-seed racers reaching the top in 42 days is a real tailwind
  on the standing path — the grant-rate dial is now the owed fix, and it
  touches the standing path too.

## Metric review

- **The pace bar missed by three at full scale (7 vs ≤4) — REGRESSION
  CONFIRMED, not a signal.** The pilot's 0.5/seed held at 0.44/seed on
  16 seeds. The verdict is final per the prereg: next dial the grant
  rate (rack-batch and hunt-kill credit), do not re-run the rung.
  Sharpest cases for the dial: Brendan (1908, fx 4→72 by d28) and Nolan
  (1904, butcher fx 1→30 by d28 on 71 hunt kills) — the race is usually
  decided by day 28.
- **Q2's denominator was the wrong shape.** "Offered invitations" as
  spoken THEM lines undercounts offers: 4 of 17 invitation-owned menus
  were presented at convo start from a pending invite with no fresh
  spoken line in the transcript. Proposed revision for the next run: the
  analyzer should count invitation-owned menus presented (INVITE-ANSWER
  lines + spoken lines followed by silence) rather than spoken lines
  alone. The bar itself passed on either denominator (17/17 menus,
  12/13 spoken lines), so no verdict changes — only the instrument.
- **dEnd foodXp reads are unreliable.** The practice snapshot reads
  foodXp only via `villagePeople()._src.foodXp`; at dEnd that read
  returns 0 for some villagers (Gina 1911: 41 at d28 → 0 at dEnd; Alex
  1916: 23 → 0; widespread zero-fx-with-positive-specialist cells at
  dEnd on every seed) while `specialistSkill` — which reads the live
  `getPerson` record — still returns 3, which requires ≥30 XP by the
  code. The game state is fine; the instrument misreads at dEnd. The
  pace03 verdict is unaffected (it uses specialistSkill, consistent
  d1→dEnd). The dEnd foodXp totals (preserver 705) are a lower bound;
  d28 is the last fully reliable foodXp read. Next run's driver should
  fall back to `p.foodXp` in the snapshot (the same fallback the
  snapshot already uses for practice). No re-run: the binding metric
  never depended on foodXp.
- **Analyzer hunt-kills fix verified.** The r117 analyzer counted a
  `kills` key the driver never writes (always 0); r118 counts huntLog
  entries with kcal>0 and the panel total (151) matches the drivers'
  per-seed console lines.
- **Stall counting holds.** 3 plain no-picks vs 5 winding-down no-picks;
  the r109 amendment (winding-down annotation) cleanly separates them.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/establishment.json
--current 'evidence/2026-11-09/journey-establishment-r118-seed*.json'
--metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
fired 3 LOUD lines. All EXPLAINED, no baseline roll-forward:
- guardrails.deaths 123 → 677, popAlive 33 → 166, pantryKcal 101205 →
  1234408: the tool SUMS across files and the baseline is a 4-seed
  gate-off control (r108, 2026-11-06) vs this 16-seed HUNTSTAFF=2
  panel — pure n-mismatch on the sums (the class r120 named). Per-seed
  means: deaths 30.75 → 42.3, popAlive 8.25 → 10.4, pantry 25,301 →
  77,150. The direction was already visible in the r117 pilot under the
  same policy (deaths mean 37.75, pantry mean 56,947): HUNTSTAFF=2
  villages hunt more, preserve more, and end with fuller pantries and
  more people alive. The baseline predates the hunt-staffing regime;
  rolling a 16-seed HUNTSTAFF=2 panel into a 4-seed gate-off control
  would mix regimes, so the baseline stands and a fresh current-policy
  baseline is an owed item for the next run, not a silent roll-forward
  here.
- c3.starvationDeaths did NOT fire LOUD (baseline 0, current 1 — the
  single 1914 starvation death, consistent with M4 passing 15/16).

## Gate

`node scripts/check.js --quick` in worktree: **296 passed, 4 failed in
403s** (log `evidence/2026-11-09/journey-establishment-r118-gate.log`).
All 4 failures are the standing set, exit 1, zero timeouts:
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes (racks-full voice gate: "next day voices once
more" expected 2, got 1). The r117 measurement-proof staleness pair now
PASSES on this base. **No lever-attributable failure. Gate adjudicated
GO.** This run changes zero src/js.

## Proof test

`scripts/test-journey-establishment-r118-invite-answer.js` — 26/26 green
on first run (11 unit checks on the rule module + 15 live checks: control
/ accept at trust 90 / decline at trust 10; seed 1901, single harness
process). `scripts/journey-invite-pick.js` is the shared rule (one
implementation, required by the driver and the proof test). No src/js
change in this run.

## Regression check

`node scripts/check.js --quick` in worktree: (see gate log
`evidence/2026-11-09/journey-establishment-r118-gate.log` — filled at
closeout). This run changes zero src/js; the relevant suites are the new
proof test (26/26) and the analyzer (full panel, re-run after the
hunt-kills fix).

## Files

- Prereg: `evidence/2026-11-09/journey-establishment-r118-prereg.md`
- Driver: `scripts/journey-establishment-r118-20261109.js` (r117 clone,
  tag rename + invitation-answer rule in the people-check picker)
- Rule module: `scripts/journey-invite-pick.js` (new; trust ≥40 accept,
  else decline; no hidden plot state)
- Analyzer: `scripts/analyze-journey-establishment-r118-20261109.py`
  (r117 clone: 16 seeds, hunt-kills fix, invite answer counting)
- Proof test: `scripts/test-journey-establishment-r118-invite-answer.js`
  (new; 26/26)
- Panels: `evidence/2026-11-09/journey-establishment-r118-seed{1901..1916}.json`
  + `-convo-seed{1901..1916}.txt`
- Analysis: `evidence/2026-11-09/journey-establishment-r118-analysis.txt`
- Gate log: `evidence/2026-11-09/journey-establishment-r118-gate.log`

## Next leg

Deepening (rotation 1→2). Open items carried forward:
- **Grant-rate dial** for the confirmed pace regression (pace03 7/16):
  how much credit a rack batch or a hunt kill awards. The dial, not the
  rung. Sharpest cases: Brendan (1908), Nolan (1904, butcher).
- **Driver snapshot foodXp fallback** (`p.foodXp` when `_src.foodXp`
  reads empty at dEnd) + analyzer denominator fix (count menus
  presented, not spoken lines).
- preserve_food still has no villager-side job — the leg that gives the
  skill a job owns it.
- The four carried repetition items: taken-kin template, softens beat,
  deflect pivot, Haven-door favour line. Water-haul favour numbers
  (3× in seed 1912) join them.
- Accept-then-bail variant: same line twice — needs a second line or a
  distinct outcome.
