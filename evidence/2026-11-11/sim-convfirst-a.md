# Conversations — first numbers (arm sim-convfirst-a)

Run fleshout-20261111T1015Z (Loop A), adopting run
fleshout-20261111T0815Z, which timed out. Coverage Program Tier 2
(Steve 2026-11-10 "Measure all"). Prereg:
`evidence/2026-11-11/sim-convfirst-a-prereg.md` (committed
8c15e4f29, before any judged sim; seeds 190201–190208, 150d
death-aware, competent, COMPETENT_TALK unset, control+neutral).

## Adoption note

The 0815Z worker built the v2 instrument/driver/analyzer/proof
and ran pilot 1, then timed out before the PlayerDeath purge wrap
and before committing. The main session verified at ~10:20Z (see
`evidence/2026-11-11/ADOPTION-0815Z.md`): proof 17/17 PASS on the
uncommitted state; pilot 1 control 8/8 valid, neutral 4/8 (the
EPERM flap killed seed 190205's neutral leg); headline 893 talkTo
opens, 0 turns, 0 answers, 32 confessions; v2 reclassification of
the pilot-1 corpus 62 unclassified sources -> 0, 55 unknown fates
-> 2. This run finished the owed work: the purge wrap (below),
commit, pilot 2 on the committed instrument, this evidence file.

## What changed this run (v2 wrap, then commit)

**PlayerDeath purge wrap** (the worker stopped before it).
`playerDeath` (ledger.js) deletes the successor's own talk request
(`v.talkRequests[newId]`, SELF-TALK-REQUEST PURGE,
journey-succession r133) with no event record — a request staged by
the inheriting villager vanished between snapshots and the analyzer
called it 'unknown', a GO failure. The instrument now wraps
`Game.playerDeath` with a fingerprint-valued pre/post diff on the
talk-request roll (same pattern as `villagerInitiative`) and
records every vanished entry as a purge event (vid, stage day,
line, flags, successor, kind: `successor-self` / `dead-bearer` /
`other`). `removeVillager` deletes no talk requests (verified by
reading betrayal.js `removeVillager`), so the diff captures exactly
the r133 purge. `wipe()` clears only the save, never the in-memory
roll, so a village-lost death diffs empty — honestly no purge.
The analyzer classifies purged requests fate `purged`, in
precedence delivered > purged > decided > expired > superseded >
pending-at-end > unknown; a delivered record purged later keeps
`delivered`. Proof: fixture (two deaths, purged + delivered-
survives-purge) + live (real `playerDeath`, exactly one purge
event, kind `successor-self`, every other request untouched).

Commits (branch `sim-convfirst-a`, rebased onto explicit master
SHA 071df74d5b12142c70c3b8bcec20464fcd35f3df — the rebase hit the
known stop-at-pick quirk on the 2nd pick, verified clean +
unapplied, `git rebase --continue` sailed through):

- eab3d77bf `sim-convfirst-a: v2 instrument + analyzer
  (PlayerDeath purge, classification fix)` — the 4 script files
  (instrument, driver, analyzer, proof 19/19).
- 5d6d98e99 `sim-convfirst-a: wall survivors counts runDays
  'survived' endReason (was 'horizon', never fired)` — one-line
  analyzer fix, summary regenerated (diff: exactly one line,
  survivors 0 -> 1).
- 155944245 `sim-convfirst-a: v1 pilot corpus (invalid round,
  retained) + 0815Z adoption note` — 13 files.
- Pilot-2 corpus + summary + this evidence file (this commit).

Proof `scripts/test-convfirst-a.js`: **19/19 PASS** on the
committed tree and again after the rebase (exit 0). The two new
tests are the purge fixture (test 11) and the live purge test
(test 19).

## Pre-registered header (from the prereg, unchanged)

- **Primary metric:** complete first-numbers capture of the
  conversation system under default competent play — every
  `talkTo` open classified by opening thread and ending, every
  `convoTurn` classified by choice kind, every talk request
  classified by source and fate, every villager-initiated staging
  counted, metrics 1–9 counted or explicitly marked unmeasurable.
- **GO threshold:** 0 unclassified opens; 0 unclassified turns;
  0 unclassified requests (source + fate); every wrapped method
  live in the pilot or proven live in a fixture and marked dead;
  neutrality 8/8 exact (days + end pantry kcal + deaths);
  0 instrument errors; per-seed tables for metrics 1–9 +
  sense-test scenes; engagement floor ≥5 talkTo opens band-wide.
  A miss on any row is NO-GO, never re-scored mid-run (§14).
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail
  max). Why: conversation is a whole-life question (does talk die
  out as the village thins? do secrets surface late?); same
  horizon as the sibling first-numbers pilots for comparability.
- **Seeds:** 190201–190208 (8, fresh band per the prereg's
  freshness search).
- **Policies:** control = competent verbatim, COMPETENT_TALK
  unset (default, flag OFF), instrument ON (judged leg); neutral
  = same policy, instrument OFF (wall numbers only).

## Pilot 1 recap (v1 instrument, invalid round — retained)

Corpus `evidence/2026-11-11/perseed-convfirst-a/`
(`convfirst-pilot-*`, 12 files: control 8/8, neutral 4/8 — the
flap took seed 190205's neutral leg and one control write).
Headline: 893 talkTo opens, 0 turns, 0 answers, 32 confessions.
The v1 round is invalid because its key-set diff missed
overwrite-supersessions (62 unclassified sources, 55 unknown
fates). Pilot 2 re-runs the same seeds/policies on the committed
v2 instrument; pilot 1 is NOT re-run and its numbers are NOT
judged.

## Pilot 2 (v2 committed instrument, RUN=convfirst-pilot2)

Control 8/8, neutral 8/8, 0 instrument errors on every seed.
Neutrality **8/8 exact** (days + end pantry kcal + death count).
Per-seed control leg:

| seed | days | end | scale | wave | standing | opens | turns | reqs | deaths |
|---|---|---|---|---|---|---|---|---|---|
| 190201 | 138 | village-lost | regional | 5 | 400 | 135 | 0 | 42 | 86 |
| 190202 | 88 | village-lost | regional | 4 | 199 | 91 | 0 | 32 | 64 |
| 190203 | 150 | survived | regional | 5 | 325 | 154 | 0 | 72 | 88 |
| 190204 | 142 | village-lost | regional | 4 | 300 | 145 | 0 | 43 | 79 |
| 190205 | 107 | village-lost | regional | 4 | 100 | 108 | 0 | 40 | 68 |
| 190206 | 133 | village-lost | regional | 4 | 199 | 141 | 0 | 69 | 76 |
| 190207 | 43 | village-lost | village | 3 | 0 | 53 | 0 | 35 | 35 |
| 190208 | 66 | village-lost | regional | 4 | 199 | 66 | 0 | 27 | 59 |

Days, pantry, and deaths reproduce pilot 1 exactly per seed —
the instrument is record-only and the band is deterministic.

### Metric 1 — opens (893 total)

All 893 opens via `talkRound`, all ended `left`, 0 exchanges
(max 0). Opening threads: `want` 572, `grief` 87, `request` 86,
`nonverbal` 66, `goal` 39, `secret` 32, `trade` 6, `small` 4,
`cheer` 1. By day band: 1–30: 280, 31–60: 223, 61–90: 180,
91+: 210 — talk does NOT die out as villages thin; it persists
to the last day. 0 failed opens. The scholar opens roughly one
conversation a day and walks straight out of every one.

### Metric 2 — turns (0 total)

Zero `convoTurn` calls band-wide. `keepPromiseSocial` — the only
held-turn path under default play — took no turns on this band
either: no belong/understand promise needed holding, or none
fired. The conversation system is entirely unexercised beyond
the walk-out open. This is the finding the prereg anticipated
("a 0-turn band is a FINDING, not a failed floor") and it matches
talkturn-a's control leg (869 talks, 0 turns) on a fresh band.

### Metric 3 — threads & depth

`more` picks 0, natural ends 0, `left` ends 893. No thread is
ever followed up, no conversation ever ends by budget — every
sitting is 0 exchanges by construction of the walk-out policy.

### Metrics 4–5 — talk requests (360 total)

By source: `villagerInitiative` 193, `linkRaise` 115,
`bondProposal` 24, `invitation` 20, `betrayal-day1` 8,
`other` **0**. By fate: `delivered` 88, `expired` 210,
`superseded` 53, `purged` 6, `pending-at-end` 3, `unknown` **0**.
Initiative stagings 205 (193 instances — 12 were same-day
overwrites of an instance already counted), expiries 247 recorded
prune events, 133 supersession events. Player deaths 71 across the band; purge
events 10 (6 undelivered requests -> `purged` fate; 4 already-
delivered records purged, fate stays `delivered` — the purge
wrap's precedence working as designed). Per-seed purged fates:
190201: 1, 190202: 1, 190203: 1, 190205: 1, 190206: 1,
190208: 1; 190204 and 190207: 0.

### Metric 5 tail — NPC questions asked

262 question-bearing opens: `pendingQ` 199, `genericQ` 63.
Answers: 0 — there is no turn in which to answer. Villagers DO
ask the scholar things (origin, plans, fears, missing, trust,
worldview, plus generic questions); under default play the
scholar walks out on every one. The questions are asked into a
void.

### Metric 6 — gossip

`ask:gossip` 0, `ask:spread_rumor` 0, rumor subjects {} — no
gossip pick can happen with 0 turns. The rumor queue is empty in
every snapshot. Gossip as a system is as unexercised as the rest
of conversation under default play.

### Metric 7 — teaching

`teach` 0, `skill_learn:` 0, `skill_teach:` 0. No teaching beat
exists in 868 village-days of default play.

### Metric 8 — secrets / hawker / compareMaps / link-in-conversation

Secret opens 32, confessed sittings 32 — every secret-thread open
confessed in the same sitting (the engine's secret open IS the
confession; nothing second-guesses it). Hawker offers 0, buys 0
(same as tradefirst-a: resident trade lives only inside a
conversation branch competent never takes). `compareMaps` 0.
Bond picks 0, link picks 0. Talks with a raiser pending: 48 —
the scholar walked into 48 conversations while a link raise was
waiting and answered none of them. `stageLinkRaise` /
`acceptLinkRaise` / `declineLinkRaise` / `proposeLink` calls: 0
under competent (the verbs are proven live by direct calls in
the proof test; the 0 is a real 0, not a dead wrap).
`npcBondTick` / `npcLinkRaiseTick`: 867 calls each.

Bond/link reconcile (tele `bond_proposed`): staged person 24 /
link 117; expired person 24 / link 116; accepted person 16 /
refused person 10 / link 0. Bond instances 24 (17 expired, 7
delivered-unsettled), link instances 115 (83 expired, 24
delivered-unsettled, 4 purged, 4 superseded), decided instances
**0**. The 26 tele decisions were all villager–villager bonds:
verified against the corpus — none targeted the scholar on its
day (the analyzer's target check uses the snapshot scholarId,
and every one of the 16 person decisions that named an
ever-scholar named them on a day when someone else held the
office). NPCs decide bonds among themselves; proposals TO the
scholar are never decided — they expire (17/24 bonds, 83/115
links) or get walked into and left unsettled (7 bonds, 24
links). Two tele link stagings have no request instance
(117 vs 115) — stagings fired during `setupGame`, before the
lazy tele wrap installs at the first daily (see Metric review).

### Metric 9 — wall numbers

Wins 0/8, national 0, table 0, wave-4 unlocks 7/8, wave-5
unlocks 3/8, median survival 120d, survivors 1/8 (190203
reached the 150d horizon; 7/8 village-lost). Deaths 555 total,
starvation 4. Top causes: villager combat 246, combat 115,
expedition 86, the wild 58. Standing 0–400, all regional except
190207 (village, died day 43). The scale wall stands: regional
is the ceiling on this band, same as every sibling first-numbers
pilot.

## GO table (pre-registered bar, judged once)

| GO check | Bar | Pilot 2 | Verdict |
|---|---|---|---|
| Opens classified | 0 unclassified opens | 0 | PASS |
| Turns classified | 0 unclassified turns | 0 (0 turns) | PASS |
| Requests classified | 0 unclassified sources, 0 unknown fates | 0 / 0 | PASS |
| Wraps live or marked dead | each wrap live in pilot or proven live in fixture | all live in pilot except bond/link verbs (proven live by direct call, 0 under competent is real) | PASS |
| Neutrality | 8/8 exact | 8/8 | PASS |
| Instrument errors | 0 | 0 | PASS |
| Complete capture | per-seed tables metrics 1–9 + sense scenes | this file + `convfirst-summary-convfirst-pilot2.json` | PASS |
| Engagement floor | ≥5 opens band-wide | 893 | PASS |

**GO — instrument valid, first-numbers census complete.** A GO
makes NO landing claim and spends NO confirm band: there is no
lever here to land.

## Village assessment (plain words)

Eight villages, eight versions of the same quiet story. People
keep coming to the scholar to talk — 360 times someone stages a
"can we talk?" — and the scholar opens a conversation almost
every day (893 opens) and walks out of every single one without
saying anything back. The villagers ask real questions (262
times: where are you from, what are you afraid of, who did you
lose) and get silence. They propose closeness (24 bond
proposals) and village links (115 link raises) and get silence —
the proposals mostly rot for two days and expire, a few get
walked into and left hanging. Meanwhile the villagers DO talk
among themselves: they decide 26 bonds with each other while
the scholar's own proposals die unanswered. The village talks
around the scholar, not with them.

The talk itself is warm but samey. The same "Can we talk? ...
Just talk. Like people used to." line opens conversation after
conversation, from villager after villager, for 150 days; the
overheard lines repeat too ("I love that. It's crazy enough to
work." from three different people). The day-one scripted line
lands identically on all eight seeds. Nothing in the lines is
wrong — the overheard chatter about the creek, the pantry, the
watch rotation reads like people living together — but the
conversation system has about a dozen lines doing the work of a
village, and under default play nobody ever gets past the first
one.

Death is the other constant: 71 scholar deaths across the band
(the mantle passes 7–15 times per village), 555 deaths total,
and the villages that push toward regional starve mid-ambition
or bleed out in combat. One village (190203) survived the full
150 days; the rest died between day 43 and day 142. The
conversation census is a census of a village that is, mostly,
dying while trying to talk to someone who won't answer.

## Sense-test scenes (SENSE-TESTING LAW)

The sense corpus is capped at 200 lines/seed and the cap is
exhausted by day 2–3 on every seed (1,600 lines over 91,866
`say` calls) — late-game conversation texture is UNOBSERVED by
this instrument (see Metric review). What the corpus does show,
day 1–3 on all eight seeds:

- d1, every seed: `"Hey." ... settles near you, not too close.
  "Day one. Everyone's pretending they're fine. ...Can we talk?
  Just talk — like people used to."` — the scripted betrayal
  day-1 request, identical everywhere. It reads as the village's
  opening line, and it works exactly once per run.
- d2, every seed: `(Talking costs a little energy — 10 kcal a
  conversation. Small talk is cheap; going deep costs time, not
  more food.)` — the cost is named honestly, every time.
- Overheard, d2–3: `"We should eat together tonight. All of
  us. It matters."` / `"If we rotate the watch, nobody pulls two
  nights running. Fair's fair."` / `"The creek's lower than
  yesterday. Markedly."` — people noticing shared problems out
  loud. This is the village sounding like people.
- Repetition: `"I love that. It's crazy enough to work."`
  overheard from three different villagers on seed 190202 alone;
  `"Right. Let's do it, then. Talking doesn't chop wood."` twice
  on seed 190201. The overheard pool is small and it shows
  within the first three days.

Late-game texture comes only from request lines in the snapshots
(the corpus has no late `say` lines). They show the asking does
not stop: d61–98 on seed 190201, Olivia Bennett stages link
raises to Stonebridge, The Red Table II, and Thornfield in turn
(two delivered, the rest expired); Hassan Ali on d83 still asks
"I need something to do. Anything. Please."; a bond proposal on
d98 — "I've been thinking. You and me — we should be bonded.
Not just neighbors." — expires unanswered on a village 40 days
from death. The villagers keep asking until the end.

## Metric review (§14 — the metric set held, with four gaps for the NEXT run)

1. **'Delivered' does not settle a bond/link proposal.** For a
   plain talk request, delivered = the opener fired and the
   moment passed. For a bond/link request, delivered means the
   scholar walked in and walked out — the proposal itself is
   still open, and the analyzer has no fate for "proposal
   settled". The 7 delivered bonds and 24 delivered links are
   unsettled proposals wearing a settled-looking fate. Proposed
   revision: track proposal settlement separately — match tele
   decisions to instances by initiator + stage-day window, not
   only by the snapshot scholarId on the event day — and report
   bond/link settlement as its own row. NOT re-scored here: the
   GO bar counts request fates, and all 360 are classified.
2. **Wall survivors string.** `wallOf` counted
   `endReason === 'horizon'`; `runDays` reports a horizon-reached
   run as `'survived'` (sim-harness.js), so the summary read
   survivors 0 while seed 190203 survived 150d. Fixed this run
   (analyzer counts both spellings); the summary was regenerated
   and the re-run diff is exactly one line (survivors 0 -> 1),
   GO unchanged. Lesson: wall strings are a contract — the next
   arm to touch `wallOf` should assert the mapping in the proof
   test.
3. **Two tele link stagings with no request instance** (117
   staged vs 115 instances). Stagings fired during `setupGame`
   leave no instance because the lazy tele wrap installs at the
   first daily and the first snapshot is day 1. Proposed revision:
   install the tele wrap before `setupGame` in the driver, or
   take a day-0 snapshot. A 2-instance gap on a 360-instance
   census; the GO bar is about classification of recorded
   instances and is unaffected.
4. **Sense corpus is early-game-only.** The 200-line/seed cap is
   exhausted by day 2–3 (combat and daily chatter eat it, even
   with the narrowed regex). Late-game conversation texture is
   unobserved. Proposed revision: reservoir-sample the corpus
   across the run (e.g. per-band caps) instead of first-200.
5. **Not measured: requests whose villager died before
   delivery.** The prereg's metric 4 asked for it; the analyzer
   has no `requester-died` fate and this run does not count it.
   It is unknown whether a dead villager's request lingers to
   expiry or is pruned with them. Carried to the next run as an
   open question, not a number.

No metric was re-scored. The GO verdict stands on the
pre-registered bar.

## What blank this fills

- **First standing instrument for the default-play conversation
  census.** Coverage audit §4 had conversations at Partial with
  NO panel metric and no standing instrument. This arm supplies
  it: every open, turn, request, staging, and question counted
  on a fresh 8-seed band, with a proof test that stays green.
- **The PlayerDeath purge fate.** Six requests that would have
  read `unknown` (a GO failure) are now classified `purged`,
  with the mechanism named (ledger.js r133) and proven live.
- **The bond/link asymmetry, measured.** NPCs decide bonds among
  themselves (26 tele decisions); proposals to the scholar are
  never decided (0/24 bonds, 0/115 links). talkturn-a showed the
  link mail expiring; this census shows the whole proposal class
  expiring, on the default policy, with the numbers.

## Findings (appended to the backlog)

- [open] conversations — scholar-directed bond/link proposals
  are never decided under default play (see § Metric 8 above):
  24 bond proposals (17 expired, 7 delivered-unsettled) and 115
  link raises (83 expired, 24 delivered-unsettled, 4 purged, 4
  superseded), 0 decided, while villagers decide 26 bonds among
  themselves on the same band. Second sighting of the
  trustfirst-a link finding, now with the bond side and the
  NPC–NPC contrast. Next: a design call on whether proposals to
  the scholar should be answerable under default play (a
  held-conversation seat for a pending raiser, per the talkturn-a
  150206 finding), or whether expiry-without-answer is the
  intended quiet no.

## Balanced panel (§15)

No panel comparison: measurement arm, no lever change, no
before/after arms (same position as the sibling first-numbers
arms). The control/neutral legs are the neutrality proof, not a
panel. No panel metric for conversations exists; this arm
supplies the first-numbers census the panel lacks.

## Files

- Prereg: `evidence/2026-11-11/sim-convfirst-a-prereg.md`
- Instrument/driver/analyzer/proof:
  `scripts/convfirst-instrument-20261111.js`,
  `scripts/convfirst-driver-20261111.js`,
  `scripts/convfirst-analyze-20261111.js`,
  `scripts/test-convfirst-a.js`
- Pilot 1 corpus (v1, invalid round, retained):
  `evidence/2026-11-11/perseed-convfirst-a/convfirst-*-convfirst-pilot-*.json`
  (12 files)
- Pilot 2 corpus (v2, judged): `evidence/2026-11-11/
  perseed-convfirst-a/convfirst-*-convfirst-pilot2-*.json`
  (16 files: 8 control + 8 neutral)
- Summary: `evidence/2026-11-11/convfirst-summary-convfirst-pilot2.json`
- Adoption note: `evidence/2026-11-11/ADOPTION-0815Z.md`
