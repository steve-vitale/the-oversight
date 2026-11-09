# Journey r116 — establishment, leg 1 (days 14–40) — RUN NOTE

- Run: `oversight-playtest-loop`, Lane A, run r116, run_id `2026-11-09T07:44:54Z`
- Rotation read `1` (establishment); write `2` (deepening next) at closeout
- Branch `journey-establishment`, base master `9d6ebf59c`
- Seeds (matched reuse, same 16 as r112–r115): 1502, 1504, 1603, 1604, 17101–17112. Policy: competent player, HUNTSTAFF=2. Horizon 42 days.
- Prereg: `evidence/2026-11-09/journey-establishment-r116-prereg.md` (§14 bars bind; no mid-run re-scoring)
- Analysis: `evidence/2026-11-09/journey-establishment-r116-analysis.txt` (1435 lines)

## The leg's question and the fix

Last run (r115) found the food-skill ladder open and moving, but villagers who
teach themselves food skills by doing the work race from nothing to the top
level too fast — 9 of them did it inside 42 days. r115 tried capping how much
practice credit one job can bank (+3 per job); that changed nothing, because
the racers bank their credit through many small jobs, not one big one. r115
named the next dial "a steeper rung or a +2 cap — pre-register which".

**The call this run (Steve can overrule): the steeper rung, not the +2 cap.**
The +2 cap could not move the pace number: the top racer banks 78 practice
credits in 42 days, and even halving every racer's credit leaves them above
the 15-credit top level. Only a steeper rung touches it.

**The fix (one file, `src/js/food.js`, commit `507e4e8fc`):** a villager who
teaches themselves a food skill by doing it now needs 5 credits for level 1,
15 for level 2, and 30 for level 3 — where before it was 5 / 10 / 15.
Unchanged: people who already hold a food skill still get +1 at 5 credits;
drying-rack batches still award credit without a cap; hunt kills still award
butcher credit; asking a specialist still works the same way. Win prices and
deed gates untouched.

**Static prediction (recorded in the prereg before any seed ran):** top-level
racers 9 → 5 on the r115 panel — a predicted miss by one against the bar of
≤4, with the open question whether slower skills would also slow the work
that earns the credit. What actually happened is below.

## Verdicts

| Check | Bar | Measured | Verdict |
|---|---|---|---|
| Q1 ladder moves (villages where someone went from no food skill to having one) | ≥8/16 | **9/16** | GO |
| Q1 pace (villagers reaching top level from nothing in 42 days) | ≤4 | **before 7 → after 4** | GO |
| Q2 null THEM lines (empty dialogue lines) | 0 | **0** | FIXED |
| M3 villages surviving to day 42 | ≥12/16 | **16/16** | pass |
| M4 villages with no starvation death | ≥12/16 | **15/16** | pass |

**Q1 GO.** The rung did exactly what the prereg said it would do, and the
fresh panel was kinder than the prediction: the before-panel (unfixed engine)
had 7 top-level racers, not 9 — the engine has moved since r115 — and the
rung demoted exactly the three racers in the 15–29 credit band (DeShawn 15,
Joyce 27, Devon 21 — all now stop at level 2). The four who still reach the
top all banked 30 or more credits: Ezequiel 32, Rahul 38, Ruth 50, Maricela
34 — every one of them a food preserver. Total practice credit barely moved
(451 → 433), so the rung changed how credit turns into skill, not how much
credit the villages earn — no dynamic feedback showed up at this panel size.
226 drying-rack batches finished and awarded 544 preserver credits; all 76
hunt kills awarded butcher credit.

**Q2 FIXED.** Zero empty dialogue lines on the whole panel.

## Village assessment (plain words)

All 16 villages lived to day 42 or 43. Between 7 and 12 people were still
alive in each at the end (142 living villagers in total). 782 people died
across the run: 434 in fights with villagers, 254 on expeditions, 50 of them
the scholar in combat. Only one person starved (seed 17101) and one died in
the arena. Pantries ended between 8,776 and 153,969 calories — nobody went
hungry as a village; the one starvation death is a single person's story, not
a village running dry. Every village reached wave 3 or 4 of the monsters.

The food work is visibly happening: 226 drying-rack batches turned fresh
kills into stored food, hunters brought in 76 kills, and the villages that
hunt hardest (seed 17110: 48 hunts, 40 kills) are also the ones that eat
best. But the ladder is open on just over half the villages — 7 of the 16
never saw anyone go from no food skill to having one, including seed 17107,
the quiet village whose racks still fire (13 batches, 25 credits) but whose
people never pick the skill up. That is not a ladder problem (r115 said the
same); it is a village that survives without specialists.

## People check

Read all four held conversations from seed 17107 in full, and counted
invitation lines across all 16 after-panel conversation files (64
conversations).

The four 17107 conversations read like people. Linh, Dagmar and Miriam all
open with the same real village need — the water is nearly gone, 2 litres
left, will you haul with me at dawn — and the answers are honest: Linh and
Miriam set the dawn meeting; Dagmar, out on the road, says plainly she can't
promise a dawn meet while she's away, find her when she's back. Marisol
talks about why she heals ("Every person I help is a vote for the world
making sense again"). Dagmar teaches a plant by leaf, stem and smell, and
tells you about a spring that runs clear. And the village shares one story:
Linh reports that Miriam won Gauntlet on the cameras, and Miriam says it
herself, proud of it. The conversations cohere with each other.

Four defects, all mild, all previously noted, all still present:

1. **Invitations offered and never answered** (the scale-r112 defect). 14
   invitation lines across the panel — "Walk my trap line with me?",
   "Come see what I found. You won't believe it.", "Walk with me?", "Come
   get air with me" — and in every case the conversation moves on without
   an answer: silence, then "Anyway — where was I?" or "A comfortable quiet
   settles." Once, honestly: "You don't answer. The quiet turns pointed."
   The villager offers something real and nothing comes of it.
2. **The water-haul opener repeats across three of the four 17107
   conversations**, nearly word for word ("2 litres left"). It is one shared
   village need, so it is plausible — but the template shows.
3. **The favour-requirements line reads like a system instruction, not a
   person**: "Move next to your partner, on the same side of the Haven
   door." It appears twice (Linh, Miriam).
4. **Marisol's "almost softens — then doesn't. Not yet." beat fires twice
   in one conversation.**

One stall on the whole panel (seed 17110): an unanswered "Come see what I
found" left the driver with no pick, and the menu fell back to
betrayal-accept / betrayal-decline / leave — the r115 menu-hygiene note, still
present. A player hitting a stall is offered betrayal as if it were the
topic, when the topic was a found thing. (Conversation fix is out of this
run's prereg scope — reported only.)

The best line on the panel, from that same 17110 conversation: "A full
night's sleep. Just one. Where I don't wake up listening." — "God, yes.
That's the dream now. Eight hours of not being afraid." The follow-up prompt
then repeats the same beat back, which is mildly redundant but in voice.

## Reachable / fun / winnable

- **Reachable: yes.** The ladder moves on 9 of 16 villages inside the leg,
  preservers form, racks fire 226 times, food gets stored. Everything this
  leg is about is reached by a competent player.
- **Fun: mostly.** The villages read like people, and the leg's stakes —
  food, water, the wild — are live in every conversation. The main fun gap
  is the unanswered invitations: villagers keep offering things and nothing
  comes of it, which makes them feel less like people with plans and more
  like people with lines.
- **Winnable: unchanged by this leg.** Establishment is not the binding
  link (scale r112: the veteran wall and the trade-route wall). This change
  slows the top of the food-skill ladder without touching win prices or deed
  gates, so it doesn't move the win chain either way. One watch item: the
  Standing ladder's Craft track mints from the same practice credit, so a
  slower top level means slower Craft standing — a small headwind on the
  standing path, worth watching on the scale leg, not a block.

## Metric review

- **The pace bar held at exactly 4 — the rung lands on the bar's edge.**
  If pace regresses on the next panel, the next dial is the grant rate
  itself (how much credit a rack batch or a hunt kill awards), per the
  prereg's diagnosis: credit totals barely moved (451 → 433), so the rung
  did the work and the grant rate is what's left. Do not re-run the rung.
- **Moves 9/16, one above the bar.** 7 villages with no 0→positive move.
  The ladder is open but not universal — that spread is the thing to watch,
  not the average.
- **The preserve_food gap is now sharper.** Masters form at the right pace,
  but the skill itself still has no job a villager can do on their own: 33
  holders, 0 uses — no villager-side read site (r114, r115). Same class:
  wound_care 74 holders / 0 uses, herbal_remedy 38 / 0, diplomat 23 / 0.
  By contrast field_dressing is used 50 times and triage 63 times, and the
  medic duty is live (670 care ticks, 183 healer rounds). The preserve_food
  gap belongs to a leg that can give the skill a job — carried, not fixed
  here.
- **Watch items (not verdicts):** held-kill food vs unheld-kill food ratio
  5.73 (r115: 3.15) — likely panel noise (seed 17110's heavy hunting), not
  a fix effect. Practice repetitions 5,443 (r115 after-panel: 7,159) and
  living villagers 142 (r115: 151) — same direction, consistent with
  slightly smaller villages on this panel; the rung doesn't touch practice,
  and the before→after trajectories are near-identical, so this is panel
  drift, not the fix.

## Proof test

`scripts/test-journey-establishment-r116-ladder.js` — pre-fix run 53 passed /
4 failed (exactly the rung legs W, X, Y, Y2 — the old rung gives level 2/3
where the new rung wants 1/2); post-fix run 57 passed / 0 failed, including
the determinism gate (the rung change does not move the 5-day funnel).
(The pre-fix run's /tmp log was later delivered back into the run as a stale
background result and confirms the numbers: 53 passed, 4 failed — legs W,
X, Y, Y2.)

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**294 passed, 6 failed in 450s.** All 6 are the pre-existing assertion
failures r115 recorded in its gate attribution — **zero branch-caused
failures**:
- `godpath/test-occupation-panels.js` — CLI workflow throws
- `godpath/test-phone-frame-proof.js` — 3 failed: phone receipt stale
  (index.html moved since the receipt; needs a receipt refresh, not a
  game fix)
- `test-establishment-r20-fixes-20261020.js` — 1 failed: racks-full voice
  gate, expected 2 lines next day, got 1 (reproduces standalone on r115)
- `godpath/test-mobile-combat-cadence.js` — 1 failed job (2 assertions):
  Continue double-wraps the announced round

r115's quick-gate reconstruction had 7 failures (these 4 plus 3
load-timeouts under sibling load); this run had no load-timeouts — the box
was quieter. The branch's only src change is the one rung line in food.js;
none of the four failing files touches the specialist ladder, and the proof
test (57/57) is not on the green list so it doesn't count in check.js
either way.

## Infrastructure — FAIL LOUDLY

- **ORIGIN/MASTER DIVERGENCE (loud).** Local master is **ahead 194 /
  behind 156** vs origin/master. Origin received a large batch of
  Cursor/OVE pull-request merges overnight; its tip is `a628aeaf3`
  ("Merge pull request #121 from steve-vitale/cursor/ove-161-capable-seed-65",
  2026-11-09 05:15Z). Merge-base `d229b58f5` (2026-11-08 11:29Z batch ship).
  **No reconciliation was attempted** — no rebase onto origin, no merge of
  origin/master, no push. This run merges locally ff-only as usual; the
  divergence is the ship loop's to reconcile.
- Master moved during this run (sibling r161 succession landed;
  `ed8f37560` at closeout). The branch bases on `9d6ebf59c` — rebase onto
  the explicit master SHA read immediately before rebasing, re-run the proof
  test, then merge.
- Worktree registration was slow (~10 minutes under load) at run start.
- The first before-panel exec session vanished mid-run after 6 seeds (no
  driver process, heartbeat stale); resumed seeds 17103–17112 in a new
  session, completed 16/16 with no seed lost or duplicated.
- The index clobber hit after all three safe-commits this run (committed
  files showing as staged-deleted / untracked, worktree hashes matching HEAD
  blobs; once as `MM` on food.js). Repair each time: `git ls-tree -r HEAD
  -- <paths> | git update-index --add --index-info`, then verify `git
  status --short` empty + `git diff HEAD` empty. Commits were always
  correct; only the index lied.

## Files

- Prereg: `evidence/2026-11-09/journey-establishment-r116-prereg.md`
- Driver: `scripts/journey-establishment-r116-20261109.js`
- Analyzer: `scripts/analyze-journey-establishment-r116-20261109.py`
- Proof test: `scripts/test-journey-establishment-r116-ladder.js`
- Panels: `evidence/2026-11-09/journey-establishment-r116-{before,after}-seed*.json`
  + `-convo-seed*.txt` (16 + 16 files each)
- Analysis: `evidence/2026-11-09/journey-establishment-r116-analysis.txt` (+ `.err`)

## Next leg

Deepening (rotation 1→2). Open items carried forward: preserve_food still
has no villager-side job (33 holders, 0 uses) — the leg that gives the skill
a job owns it; the betrayal menu is still the standing stall menu; invitations
are still offered and never answered (14 lines on this panel); seed 17107 is
still the quiet village (racks fire, nobody picks the skill up) and is not a
ladder problem. If pace03 regresses, the next dial is the grant rate, not
the rung.
