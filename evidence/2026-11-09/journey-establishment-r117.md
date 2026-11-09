# Journey r117 — establishment, leg 1 (days 14–40) — RUN NOTE

- Run: `oversight-playtest-loop`, Lane A, run r117, run_id `playtest-loop-a-20261109T1445Z`
- Rotation read `1` (establishment); write `2` (deepening next) at closeout
- Branch `journey-establishment`, base master `ae7daf40c` (r121 landed)
- Seeds (fresh band): 1801–1804. Policy: competent + HUNTSTAFF=2. Horizon 42 days.
- Prereg: `evidence/2026-11-09/journey-establishment-r117-prereg.md` (§14 bars bind; no mid-run re-scoring)
- Analysis: `evidence/2026-11-09/journey-establishment-r117-analysis.txt`
- This run's first half closed out the dead r121 landing run (stale-lock
  recovery; see `evidence/2026-11-09/journey-landing-r121.md`, "Adoption
  closeout"). This note covers the establishment leg only.

## The leg's question

r116 landed the steeper rung (5/15/30) and went GO on pace (7→4, bar ≤4,
**on the bar's edge**) on the SAME 16 seeds as r112–r115. This run is a
**fresh-seed regression pilot**: 4 new seeds on current master, one panel.
Two questions from r116: does pace03 hold, and do the unanswered
invitations recur?

## Verdicts

| Check | Bar | Measured | Verdict |
|---|---|---|---|
| Q1 pace (moves) | ≥2/4 seeds | **3/4** | GO (leg) |
| Q1 pace (pace03) | ≤1 on 4 seeds | **2** | **REGRESSION SIGNAL** |
| Q2 invitations | answered if offered | **0/2 answered** | **RECLASSIFIED — driver artifact, not a game defect** |
| Q3 null THEM lines | 0 | **0** | PASS (holds) |
| M3 villages surviving to day 42 | ≥3/4 | **4/4** | pass |
| M4 villages with no starvation death | ≥3/4 | **4/4** | pass |

**Q1 REGRESSION SIGNAL.** Two villagers raced from nothing to specialist
level 3 in 42 days on fresh seeds — Zoe (1801, journalist, preserver
foodXp 2→11→31, 132 cook resolutions, 12 rack batches) and Arlo (1803,
appliance repair tech, preserver foodXp 0→13→61, 69 cook resolutions, 28
rack batches). Both are preserver, as r116 predicted (8 of 9 races). Rate
0.5/seed vs r116's 0.25/seed (4/16). Per the prereg this is a REGRESSION
SIGNAL, not a final verdict: the pilot is 4 seeds. Next run: full 16-seed
panel; if pace03 regresses there, the next dial is the grant rate (how
much credit a rack batch or hunt kill awards), per r116's metric review.
Do not re-run the rung. Arlo's trajectory is the sharpest case for the
grant-rate dial: his fx deltas jump +2/+3/+5 per batch (the uncapped
+n/batch grant) — 61 XP is double the 30-XP bar, so no rung below ~35
could have held him.
**Q2 RECLASSIFIED.** The two invitations on the pilot (Lucas 1802,
"Help me haul something back? Too much for one."; Jada 1803, "Walk my
trap line with me?") both went unanswered — the driver picked [silence]
both times. The mechanism, read from code: the game DOES offer the
answer. When a pending invite exists, betrayalChoices offers
betrayal:accept / betrayal:decline, and convoMenuPage OWNS the
invitation turn's menu to exactly [accept, decline, leave, silence]
(conversation.js convoMenuPage, spokenBeat.tag === 'invitation'). The
panel's 0-answered is the r109 DRIVER HYGIENE rule ("betrayal:* is
NEVER picked while sampling") + never-pick-leave: silence is the only
remaining option. A real player sees "All right. Let's go." / "Not this
time." and can answer. Proof test
`scripts/test-journey-establishment-r117-invite-answer.js` proves the
channel end to end, 17/17: the invitation-owned menu is exactly
[accept, decline, leave, silence]; accept resolves the walk (accepted++,
outcome 'small', "It's quiet at the trap line..."); decline counts it
and costs exactly 1 trust (90→89); with no pending invite the menu
offers neither accept nor decline. The measurement fix belongs to the
driver, not the game: the next run's prereg should carry a competent-
player rule for answering micro-quest invitations (accept sometimes, by
character/trust — never by reading hidden plot state, which would cheat
the tell-reading game; plot lures travel the same betrayal:accept
channel by design). No game-code change in this run.
**Q3 PASS.** 0 null THEM lines; the r116 fix holds.
**M3/M4 PASS.** All 4 villages alive at d40 (10, 10, 12, 12), 0
starvation deaths, pantries 8,950–105,930 kcal at end.

## Village assessment (plain words)

Four villages, all alive at day 42–43, 10–12 people each from a 12 start.
The food work is visibly happening: 350 cook resolutions, 79 drying-rack
batches, 14 hunt kills across the panel. The villages that hunt hardest
eat best — 1803 (10 kills, 28 rack batches) ends with 105,930 kcal in the
pantry, while 1804 (4 kills) ends lean at 8,950. Everyone reached wave 3
of the monsters; 1804 reached wave 4. The ladder moves on 3 of 4 villages
but only through preserving: every move is preserver, foodXp totals
preserver 188 / butcher 14 / cook, spotter, builder 0. Nobody starved.
The quiet village this time is 1802: racks fire (14 batches) and people
cook (23 resolutions) but nobody picks a food skill up — the same shape
as r116's seed 17107, and like 17107 it is not a ladder problem; the
village survives without specialists.

## People check (all 16 held convos read in full)

The conversations read like people. The strongest threads are the
taken-kin stories: Emilio (1802) and Milo (1804) both carry a sister
taken at the Scattering — "the boring half, they said" — dreaming of
"rows of pods, humming," and both answer a promise to ask the System
with "Even asking is more than the silence." Natalia (1801) on regret:
"I dream about soup. Actual soup, with a spoon." / "I miss being
bored." The player-initiated party invite ([dlg:invite]) is answered
every time, with character: "I can't. Not today. Ask me when the work's
done." / "Someone should watch your back. Might as well be me." (×4) /
"Alright. But I'm not carrying your stuff." / "...Fine. This had better
be worth it."

Defects and watches, all read in full:
1. **NPC invitations unanswered (2 cases, reclassified — see Q2).**
   The game offers accept/decline; the sampling driver refuses them.
2. **Taken-kin template repeats across villagers.** Emilio's and Milo's
   stories are nearly word for word (same "boring half", same pods,
   same "can't tell if it was a dream or a broadcast") — only the
   sister's name changes (Amanda vs Emma). One shared trauma template,
   so it is plausible — but the template shows, same class as r116's
   water-haul opener.
3. **The favour-requirements line still reads like a system
   instruction**: "Move next to them, on the same side of the Haven
   door, to help." (Jada, Dakota, Arlo — 1803). Carried from r116.
4. **"Something in them almost softens — then doesn't. Not yet."**
   fires once in each of four conversations (Emilio, Dakota, Carol,
   Valentin). In voice, but the beat is doing a lot of work across the
   panel; r116 flagged it firing twice in one conversation.
5. **Deflect repetition:** "Sorry — I shouldn't load that on you.
   What's up?" is the subject-change pivot in 5 conversations (Wanda,
   Natalia, Nada, Nicole, Milo). Same shape as r121's finding: pivots,
   not filler loops; the most-repeated THEM line in any sitting is 2×.
6. **No stall on the panel.** No '(no pick)' line; the betrayal menu
   as standing stall menu did not fire this run (the r116 stall was a
   1-case event).

## Reachable / fun / winnable

- **Reachable: yes.** The ladder moves on 3 of 4 fresh villages inside
  the leg, racks fire 79 times, food gets stored, wave 3–4 reached.
  Everything this leg is about is reached by a competent player.
- **Fun: mostly.** The villages read like people, and the leg's stakes
  — food, water, the wild — are live in every conversation. The main
  fun gap is the one this run reclassified: on a real player's screen
  the invitations ARE answerable, but the panel kept showing them
  unanswered because the driver would not take them. The fix is to the
  measurement, and it is owed.
- **Winnable: unchanged by this leg, with a flag.** Establishment is
  not the binding link (scale r112: the veteran wall and the trade-
  route wall). But the pace signal matters for the standing path: the
  Standing ladder's Craft track mints from the same practice credit,
  so two fresh-seed racers reaching the top in 42 days is a small
  tailwind on the standing path, worth watching on the scale leg.

## Metric review

- **The pace bar missed by one at pilot scale (2 vs ≤1).** The pilot
  is 4 seeds; the verdict is SIGNAL, not NO-GO — the full 16-seed
  panel next run is the judge. If it confirms, the dial is the grant
  rate, not the rung (Arlo's 61 XP proves the rung cannot hold him).
- **Q2's bar was the wrong shape.** "Answered if offered" measured the
  driver, not the game. Proposed revision for the next run: the bar
  judges the GAME's offer (accept/decline present on the invitation-
  owned menu — now proof-tested 17/17) and the DRIVER's answer rate
  separately, once the driver carries an answer rule.
- **The analyzer missed a def on first run.** The first analysis
  counted 1 invitation; reading the transcripts in full found the
  second (Lucas 'carry' — "Help me haul something back?"). The regex
  was fixed to match all five INVITE_DEFS labels and the analysis
  re-run (2 total). Lesson: the analyzer's invitation patterns must be
  derived from INVITE_DEFS, not hand-rolled — a future pass should
  read the labels from the source.
- **preserve_food, carried.** Holders 4/3/2/0 across the pilot; cook
  resolutions BY holders 0/23/21/0. That is holders doing cook duty,
  not the skill being used — the skill's own villager-side read site
  remains the open gap (r114–r116). Same class: the panel's
  specialist moves are all preserver, yet preserve_food itself still
  has no job a villager can do on their own.

## Telemetry deviation check (r121 adoption, recorded here)

`telemetry-check.js` against the SUPERSEDED `landing.json` baseline
fired 3 LOUD lines; against the live `landing-split.json` baseline, 2
LOUD lines. All EXPLAINED, no baseline roll-forward:
- systemDay 33 → 81: the tool SUMS across files (baseline: 4-seed sum,
  33; current: 10-seed sum, 81). Per-seed mean is unchanged (8.25 vs
  8.1; current seeds all 8–9, matching the r121 System-contact days).
  Pure n-mismatch, the class r120 named.
- folTelemetry.fires 0 → 8: the baseline predates the instrument (0 =
  unmeasured). The 8 fires are real and coherent — villagers
  volunteering to accompany the player (Sofia, Aaliyah, Maya, James,
  Ursula, Kgomotso, Blanca, Tao; trust 50–57, each with a named goal),
  2 each on seeds 1144/1145/1146/1150.
- deaths 12 → 271: the superseded baseline's pre-split combined
  series; not comparable. The split baseline's villageDeaths /
  playerDeaths did not fire LOUD.

## Proof test

`scripts/test-journey-establishment-r117-invite-answer.js` — 17/17
green on first run (control / accept / decline / no-pending control;
seed 1801, single harness process). No src/js change in this run.

## Regression check

`node scripts/check.js --quick` in worktree: (see gate log
`evidence/2026-11-09/journey-establishment-r117-gate.log` — filled at
closeout). This run changes zero src/js; the relevant suites are the
new proof test (17/17) and the analyzer (re-run after the regex fix).

## Files

- Prereg: `evidence/2026-11-09/journey-establishment-r117-prereg.md`
- Driver: `scripts/journey-establishment-r117-20261109.js` (r116 clone,
  tag rename + header)
- Analyzer: `scripts/analyze-journey-establishment-r117-20261109.py`
  (new; Q1/Q2/Q3/M3/M4 + preserve_food carry)
- Proof test: `scripts/test-journey-establishment-r117-invite-answer.js`
  (new; 17/17)
- Panels: `evidence/2026-11-09/journey-establishment-r117-seed{1801..1804}.json`
  + `-convo-seed{1801..1804}.txt`
- Analysis: `evidence/2026-11-09/journey-establishment-r117-analysis.txt`
- Gate log: `evidence/2026-11-09/journey-establishment-r117-gate.log`

## Next leg

Deepening (rotation 1→2). Open items carried forward:
- **Full 16-seed establishment panel** to judge the pace regression
  signal (pace03 2/4); if it confirms, the dial is the grant rate.
- **Driver invitation-answer rule** (the Q2 measurement fix): the
  sampling driver needs a competent-player rule for answering
  micro-quest invitations — accept sometimes, by character/trust,
  never by reading hidden plot state.
- preserve_food still has no villager-side job — the leg that gives
  the skill a job owns it.
- The favour-requirements line still reads like a system instruction;
  the taken-kin template repeats verbatim across villagers.

## GATE — COMPLETE, adjudicated by main session (2026-11-09 ~16:51Z)

The timeout handoff's "118/300, mid-execution" snapshot was stale: the
gate RAN TO COMPLETION after the checkpoint. Final: **294 passed,
6 failed in 523s** (log journey-establishment-r117-gate.log).
All 6 failures are the standing set, exit 1, zero timeouts:
measurement-proof-update + measurement-workflow (retained-proof
staleness pair, r122 + later src/ landings), mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes.
**No lever-attributable failure. Gate adjudicated GO.**
Remaining closeout (for the adopting run): commit via the worktree's
own safe-commit.sh (verify index clobber), rebase onto then-current
master (re-read SHA first), re-run proofs, ff-only merge, rotation
1->2, delete playtest-loop.lock (re-read first: run_id
playtest-loop-a-20261109T1445Z / 2026-11-09T14:48:00Z). The 1445Z run
timed out at its 2h budget; heartbeat last 16:37:22Z, no hbloop alive.
