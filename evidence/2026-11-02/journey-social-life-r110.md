# Journey social life r110 — VILLAGES THAT LIVE LONG ENOUGH TO BE SOCIAL (lane B, 2026-11-02)

Leg 5 (social life). Rotation-b read 5 at run start → write 6 at
closeout (social → crisis), VERIFIED after writing (see closeout
section). Base: local master 6674df432 at registration. Slug
journey2-social. No push, no bump, no live check — ship loop owns
those. Gating freeze stands; no gate/deed/standing/wave/table
change. Pre-registration:
evidence/2026-11-02/journey-social-life-r110-prereg.md (plus the
in-run addendum: pilot v1 discarded, scored panel re-run).

## The question, in one line

Three weeks after the last social run (r5/r6, 2026-10-12), do
friendships, rivalries, gossip, and moots form, persist, and
matter across a full run — and does the moot transcript capture
now hold the exchange?

## Play (scored panel)

Competent + socialite policy, DAYCAP=140, seeds 31101–31104,
driver scripts/journey-social-life-r110-20261102.js (the 20261012
driver + bond snapshots, per-villager rumor read, moot exchange
lines; zero src/js changes in the driver). Narration ON
(loadGame narration: true) — see the v1 addendum for why.

| seed | end | fullConvs | natural | feasts | moots | met |
|------|-----|-----------|---------|--------|-------|-----|
| 31101 | survived d141 | 170 | 165 (97%) | 20 | 3 | 15 |
| 31102 | village-lost d139 | 98 | 94 (96%) | 19 | 1 | 19 |
| 31103 | survived d141 | 118 | 102 (86%) | 20 | 2 | 20 |
| 31104 | village-lost d117 | 101 | 92 (91%) | 23 | 1 | 15 |

## Village assessment (plain words)

**Seed 31101 — the village that made it.** Eight people alive at
day 141, and they like each other: Greta, Leo, Brian, Ines,
Olivia, Malik, Lucia all at trust 89–91, Zahra at 40. Pantry
10,665 kcal, 55 plants in the codex. Eight dead, mostly late
(a d93–135 cluster of wild/combat/monster deaths) plus Deborah
to Hushpuppy on day 8. This is the social layer's home: a
village with a full century of days behind it and friendships
to show for it.

**Seed 31102 — the long slow loss.** One woman left (Laya,
trust 67) at day 139, pantry empty, 21 fallen — including five
to the wild on a single day (d72). It lived nearly the whole
horizon and then ran out of people, not out of days.

**Seed 31103 — the remnant that held.** Two alive at day 141
(Booker the paramedic, Aria the musician, trust 63/66), 21
fallen, pantry still 8,622 kcal. Survival without a crowd.

**Seed 31104 — the one that didn't.** One left (Piper, trust 66)
at day 117, pantry empty, 14 fallen to wild, monster, contest,
and arena in roughly equal shares.

Contrast with r6 (day-78 phoenix wipe, day-26 monster wipe):
every r110 village lived 117–141 days. The r6 verdict — "the
social layer is solid, it just needs villages that live long
enough to be social" — is now answered. They live. It pays rent.

## Pre-registered metric verdicts (BINDING)

- **M1 reach: GO (4/4).** ≥10 full conversations and ≥80%
  natural ends on every seed (lowest: 86% on 31103).
- **M2 bonds: GO, with a correction (see below).** Friendships
  (trust ≥ 50) formed on all 4 seeds — snapshot counts at d30
  were 5–7 friends per village, peaking at 11–12. Conflicts
  recorded 1–2 per village on all seeds. Grievances: the panel
  instrument read the wrong store (village.grievances, always
  0); the supplementary probe (below) reads the real store and
  finds 9–10 live grievances including moot-vote grievances.
  The bar as written (≥1 friendship in ≥3 seeds; ≥1
  rivalry/conflict/grievance record in ≥2 seeds) is met, and
  the grievance half is now evidenced, not assumed.
- **M3 gossip: GO, honestly caveated.** Village rep ledger
  holds 16–23 rumor keys per seed (reputation ABOUT each
  person, with trait vectors), and gossip events fire visibly
  in narration with telephone-game distortion ("Nora telling
  Oliver about himself. The truth left this story two fires
  ago."). Per-villager rumor carriage read None — there is no
  per-person rumors field to read; spread is evidenced at the
  ledger + event level, not per-villager carriage. See metric
  review.
- **M4 moots: GO — the r6 blank is CLOSED.** Moots fired on
  all 4 seeds (7 total), and every moot capture now holds
  26–48 exchange lines (v1, narration off, captured 0 — the
  blank was a harness artifact: sim-harness silences G.say
  unless narration is true, and moot speeches travel via say
  → emit). The exchange itself reads like a village deciding
  (quoted below).
- **M5 sense: GO with one prevalent break fixed.** Transcripts
  read like people (see people check). The break: the
  justice-moot recall loop, 69 repeated lines across 15
  conversations in the panel — fixed same-run with proof
  (below). The panel ran pre-fix, so the fix is proven by
  proof test + a post-fix full-run probe, not by a panel
  re-run; stated plainly, not hidden.

## People check (sense-tested transcripts)

**A moot that decides (31101, day 26, petition
pet_25_village_2).** The fire gets built up, the petitioners
sit just outside the light, Leo stands against — "They EAT
people. I don't care how hungry the road made them. No." —
the count is spoken aloud ("1 for taking them in. 9
against."), the moot votes no, and the consequence has a
face: Victor nods like he expected it, thanks them for the
fire, and walks — to The Red Table. Then the reputation
consequence lands: "Haven is clean hands. (Opinion +2 with
every village that knows you.)" A decision with a cost, a
face, and a footprint. That is the moot working.

**Grief, remembered honestly (31103, day 75, trust 63).** "I
keep expecting to see them by the fire. Then I remember."
Asked the same thing twice, the NPC answers honestly — "You
asked me that before. It's a different question now." —
then: "Someone died. The work didn't. That's the part that
feels wrong." Warmth offered and not yet taken: "They hear
the warmth in it. They're not ready to let it in." A real
person at a fire.

**Taken kin, an owed ending (31104, day 63, trust 90).**
"About what happened to my taken kin — I keep dreaming
about rows of pods. Humming. Tell me I'm not the only one."
The player offers to ask the System; the NPC answers with
gratitude and an open thread: "If it answers — you'll tell
me? Whatever it says. I can take it." Want, engagement, and
something owed. The conversation quality bar holds.

**Checked and NOT a break:** the "Why can't I do this now?"
escalation ladder (As I said → Like I said → Still the same
thing → I've told you three times now) behaves as designed
under 5× spam: the escalation serves twice, then the choice
spends out of the menu for the sitting (r35 spend-out). The
repeat in the transcript is the designed final warning, not
a parrot. The driver is the spammer here — a real player
asks once and gets a true requirement.

## Blank filled: the justice-moot recall loop (FIXED)

**The defect.** In r110v1 seed 31103 (days 13–15) and across
the scored panel (69 lines, 15 conversations; worst seed
31103: 49 lines in 10 conversations), the conversation choice
"Call a moot — put the ambush of Salvador to the village"
re-offered after the moot was already in session, and
re-picks spoke "The moot is called. The fire gets built up."
verbatim while the engine no-opped.

**The mechanism (traced, not guessed).** First moot call →
callMoot runs conductTrial → trial set. Then "Say nothing.
Watch your back." (letItLie) parks the case dormant WITHOUT
clearing the trial. The menu guard only hid the choice for
open + awaitingPlayerVote, so a dormant case with a pending
trial kept offering a moot that callMoot — idempotent on
c.trial since break-it social r11 — could never re-convene.
The handler then spoke a fresh-moot line on a no-op.

**The fix (src/js/betrayal.js, 13 insertions).**
1. The moot choice is hidden whenever cs.trial exists, any
   status — a trial in session is a moot already called.
2. The handler speaks honestly when callMoot returns null:
   "The moot is already called. The fire is built — the
   village is still deciding."
No trial lifecycle change: a pending vote is still cast
through the trial's own path, and a genuinely re-opened case
(trial null) still offers a fresh moot.

**Proof.** scripts/test-journey-social-r110-moot-recall.js:
reproduced the bug pre-fix (moot re-offered after
moot → letlie; direct re-call lied), 8/8 GREEN post-fix.
Regressions: norepeat-fallback 9/9, deflect-cycle 11/11,
crisis-moot-cannibal 42/42, fameseeker-moot 14/14.
test-betrayal.js and test-betrayal-fixes-20261008.js fail
identically on HEAD code (harness error: `Text` is not
defined in genCharacter — a pre-existing node/DOM gap in
character generation, untouched by this change; verified by
running both against unmodified HEAD betrayal.js).
Post-fix full-run probe (seed 31101, supplementary, not
panel-scored): survived d141, 124 conversations, 112
natural ends, 20 feasts, 2 moots with 26/36-line captures —
the fix breaks nothing in full play.

## Supplementary probe: grievances (instrument correction)

The panel's bondSnap read village.grievances (always 0).
Grievances actually live in betrayalState().grievances.
Probe driver scripts/journey-social-life-r110-grievprobe-20261102.js
(same panel driver + corrected read + conflict detail,
post-fix worktree, seed 31101 only, NOT panel-scored):
grievances 9 by d30, 10 by d60, stable to end — kinds
ambushed ×2, voted_guilty ×6, voted_for_petitioners ×2 (the
moot-vote grievance: the player's accept-vote against the
against-speaker). The village's single conflict is a seeded
'old_wound' (Autumn/Deborah) marked resolved — so: seeded
conflicts are few and resolve; grievances are the live
rivalry channel. Next run's driver reads betrayalState
directly (see metric review).

## Pilot v1, honestly

Pilot v1 (narration off) ran all 4 seeds to completion before
the say-silencing root cause was caught: 31101 survived d141
(170/165, 20 feasts, 3 moots); 31102 village-lost d109 (75/71,
15 feasts, 1 moot); 31103 survived d141 (118/102, 20 feasts,
2 moots); 31104 village-lost d117 (101/92, 23 feasts, 1 moot).
Every v1 mootNote captured 0 lines. V1 is supporting evidence
only; the scored panel is v2. Two blemishes, owned:
(1) v1's 31101/31102 JSON files were deleted before the
v1-rename (to avoid a v2 filename collision) — their numbers
above are preserved here, but the per-day series are lost.
v1 31103/31104 files are kept as
journey-social-life-r110v1-3110{3,4}.json.
(2) Seed 31102 diverges between v1 (d109) and v2 (d139):
3 of 4 seeds are trajectory-identical across the narration
change; 31102 is not. Narration-on shifts something that
tips one roll on that seed (chaos amplifies it); the
mechanism is not isolated — sysSay itself draws no RNG, so
the coupling is elsewhere (log-dependent branch or a
say-gated draw). Flagged for panel comparability: future
social panels must all run narration-on, never mixed. The
scored panel is internally consistent (all v2), so no verdict
above depends on the v1 comparison.

## Telemetry deviation check

`telemetry-check.js` against hidden_files/telemetry-baselines/social.json
(metrics l3.bonds, l3.deepBonds, l3.betrayalCases,
l3.mootsConvened, l3.gossipConvos, dryRate) reports 5 LOUD
lines, all "disappeared: baseline N → current 0". VERDICT:
EXPLAINED, not a game deviation — the journey evidence JSONs
carry none of the l3.* keys (0 of 4 files; the baseline is
from a different telemetry shape, the same stale-baseline
class r109 reported). The panel's own quantities are healthy
(bonds 78–102, moots 1–3, conversations 98–170). Baseline NOT
rolled: writing zeros into it would destroy the reference.

## Metric review (for the NEXT run, never re-scored here)

- M2: read grievances from betrayalState().grievances, not
  village.grievances (probe driver already does).
- M3: there is no per-person rumors field — measure spread
  via rep-ledger growth across snapshots + gossip-event
  counts, not per-villager carriage. Note that rep keys are
  person IDs (reputation ABOUT each person).
- M4: keep narration: true on all future social panels;
  never mix narration-on/off seeds in one panel (31102).
- M1/M5 stand as written. The moot-recall fix needs no
  panel re-run: the proof + post-fix probe cover it, and
  re-running the panel post-fix would measure the fix, not
  the leg — a different run's job if Steve wants it.

## Verdict

- **Reachable: YES.** Conversations (98–170 per run), talk
  requests, feasts (19–23), moots (1–3), naming debates, and
  justice cases all fire organically in competent play.
- **Fun: YES, with the robot-shaped hole now patched.** The
  favor/want arcs, NPC memory, grief beats, and moot
  consequences read like people. The moot-recall parrot was
  the one recurring break — fixed, with proof.
- **Winnable: YES, for the social leg's own terms.** Villages
  now live 117–141 days and the social layer pays rent across
  the whole horizon — friendships at trust 90, moots that
  change the village's standing with the world, grievances
  that crack bonds. The binding constraint is no longer
  "villages die before they can be social."

## Closeout

- Commits: (to be filled at merge — driver + proof + fix +
  evidence, via safe-commit.sh in the worktree).
- Merged locally, pending ship. No bump, no push, no live
  check — the ship loop owns those.
- Rotation-b: 5 → 6 (verified after writing).
- Lock file deleted at closeout.
- Driver wart, noted not fixed: the pilot log's elapsed
  "ms=-33229761s" is a cosmetic driver bug (the game mocks
  Date during play; the driver computes elapsed from
  Date.now()). Evidence values are unaffected.
