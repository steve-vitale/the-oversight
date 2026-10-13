# Journey landing r9 — days 1–14, competent player, 4 seeds (2026-10-13)

Base: worktree `journey-landing` (pre-fix tree). Harness:
`scripts/journey-landing-r9-20261013.js` (r8 template + gossip/information
instrumentation: player rumor plant on day 3, daily gossip census, daily
monster-codex snapshot, `ask:gossip` in transcript sittings, tellbeast/
namebeast asks, favor promise/kept/broken counters, starvation autopsy
carried over). Seeds: **121, 212, 313, 414** (fresh; r8 used 111/222/333).
Seeded RNG before module eval; window stub for eval, deleted before play;
full src/js list in index.html order minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js.
Full transcripts: /tmp/journey-landing-r9-transcript-*.txt (44 files);
censuses: /tmp/journey-landing-r9-census-{121,212,313,414}.json;
run log: /tmp/journey-landing-r9-run.log.

## Pre-registration (docs/MEASUREMENT.md §§9–12)

- **Question:** (a) does the gossip/information machinery fire in the
  fortnight — news spread, name-debate seeds, favorTask teaching,
  trust-vs-rep movement; (b) is the early player-starvation death mechanism
  coherent when it fires (r8 left seed-999's day-11 starvation unconfirmed).
- **Interesting finding bar:** ≥1 sense-tested gossip arc per seed with
  transcripts that read like people; OR confirmed silence = documented blank.
  Starvation autopsy firing with coherent mechanism, or confirmed absence.
- **Pilot:** 4 seeds × 14d. Expand only if something interesting fires.

## Village assessment (plain words)

**Seed 121 — Jude.** Twelve people wake under the wrong stars; all twelve
live to day 14. Jude forages hard (141 forage trips across the run), hauls,
delegates — the competent policy assigns tasks constantly, and the village
watches: 'order' gossip dominates the news. Pantry 47,250 → 38,484.
Trust 11–90 (mean 33.7) — wary, a couple won over. Plant leaders: Jude and
Carmen 16, Sofia 15. The planted 'generous' rumor about Barbara traveled to
11 hearers with distortion 10 before fading on day 7.

**Seed 212 — Milo.** The brutal one. Milo (the player) dies in combat on
day 13 — and the run continues: a successor carries the village to day 14.
Another villager dies the same day. Monster kills by villagers all run
(hummice, lockpick_raccoon, mirrormoth — real field fights). Pantry
47,250 → 10,257, the thinnest margin — real pressure. Trust 0–54
(mean 27.3). A gallowdeer encounter got reported to the village but the
naming debate hadn't kicked by day 14 (1 knower — honest pending state).

**Seed 313 — Nolan.** All twelve live. Pantry 47,250 → 8,858 — the
thinnest of all, genuine scarcity by the end. Trust 15–66 (mean 29.8).
A nightcourt encounter became NEWS: reported, spread, debated, and NAMED —
"Judge Hoot" (9 proposals from Harold, August, Nicole, Anya, James, Emma).
Full naming arc inside the fortnight.

**Seed 414 — Hank.** All twelve live. Pantry 47,250 → 18,502. Trust
15–90 (mean 34.0). A sunbasker encounter went the whole way: told to Lena
("a gold flash in the grass, gone when you look"), word got around,
argument started, proposals from Piper/Autumn/Aurora/Katsumi — converged
on "The Big Beast" (11 proposals). Plant leader Piper 18.

## The information machinery fires (question a)

- **Gossip volume is real.** Daily gossip census: 0 on day 1 → 21–32 live
  items by day 14 (stories fade after ~3 days, by design). Actions seen:
  order (task delegation, witnessed), departure/return (villagers drifting),
  deed, haven_need, haven_built, share_knowledge, talk, feast, raid,
  changed — plus the player's planted rumor.
- **Player rumor propagates and decays honestly.** All 4 planted 'generous'
  rumors spread within a day (day-4 snapshots: 1–4 hearers, distortion 0–3;
  peak 11 hearers / distortion 10 by day 6), then faded on day 7 per the
  3-day fade rule. Subject rep.generous rose (Barbara 11→43, Esther
  12→40, Harold 0→16, Piper 4→40) while the story lived.
- **Trust vs rep holds (canon: gossip moves REP only, never trust).** The
  rumor subjects' trust of the player moved independently of the rumor —
  Barbara 19→90 and Piper 37→90 (competent-play trust: talking, giving),
  Harold 12→21, Esther 20→9. Esther's is the interesting one: her rumor
  spread widest (11 hearers) and her trust FELL — consistent with the
  trace-and-catch path (15%/hop/part; caught → bumpTrust(subject, -2) for
  non-nasty rumors). Correlation, not proven causation — but the mechanism
  that explains it exists and the canon line holds: no trust was ever
  *granted* by gossip.
- **Name debates seed and converge in-leg.** 2/4 seeds ran the full arc:
  report → tell → spread → kick → proposals → villageName ("Judge Hoot",
  "The Big Beast"). 1/4 pending honestly (gallowdeer, 1 knower). The
  tellbeast/namebeast conversation asks render the whole chain (see
  transcripts: 313-day9/10, 414-day8/9/10/11).
- **"Heard anything?" renders.** 15 gossip asks in sittings → 5 rendered
  gossip, 10 honest "quiet lately" no-news lines. Renders read like people:
  `"Good question." "Did you hear? Marcus just walked away from Haven.
  Didn't look back."` — a beat, then the news. Departure gossip matched
  real drifters.
- **Favor machinery fires; the harness always deflects.** 8 ask_favor wants
  seen, all deflected by the policy's deepen-first pick order (a harness
  artifact, not a game blank). The arcs read true — see people check. No
  promises were made, so favorKept/favorBroken stayed 0; the counters are
  wired for a policy that accepts.

## People check (SENSE-TESTING LAW)

Read full transcripts across all 4 seeds (44 sittings). Verdict: **the
village acts like people** — with one real blank found and fixed.

- **Naming debate, up close (414-day9).** Lena: `"That thing — a gold flash
  in the grass, gone when you look. We're naming it. So far: "The Ugly
  Beast" (Piper); "Big-Eyes" (Autumn); "The Big Beast" (Aurora); "The Loud
  Beast" (Katsumi). What's your vote?"` — distinct people, distinct names,
  the descriptor gated (never the true name), the player invited to weigh
  in (backMonsterName exists in the UI). The argument *starts* in-fiction:
  `"Back at the haven the argument starts: Piper is calling it "The Ugly
  Beast." They'll fight it out — weigh in if you want."`
- **Favor arc with consequences (121-day12).** `"We're eating through
  stores faster than we replace them. Forage with me tomorrow? I know the
  maypop patch past the treeline."` → deflect → `"...Okay. I'll figure it
  out." They won't ask twice. That much is clear.` — the NPC wants
  something specific, the deflection lands, the ending plants a consequence.
- **Lures:** 15/15 spoken (the r8 fix holds), 15/15 declines acknowledged
  in-fiction. Zero "I just said", zero phantom names, zero stutters across
  44 sittings. 3 verbatim repeats flagged (transcript-level dupes, minor).
- **THE BLANK (fixed):** the gossip-ask composition leaked the player's
  own doubt narration into the NPC's mouth (414-day1): `THEM: "Huh. Let me
  think about that." ❓ Piper just told you something about the woman in
  her 40s, the hvac tech — says they're not really an ER nurse. Worth
  remembering. Piper lowers their voice. "the woman in her 40s, the hvac
  tech?" Piper lowers their voice.` — Root cause: convoAskTopic's gossip
  branch captures askAbout's beats and re-emits only 📓 lines as asides;
  checkGossipClaim emits its doubt beats as ❓, which the 📓-only filter
  missed, so the NPC "said" the player's journal note. Fix: the asides
  filter now treats ❓ like 📓 (src/js/conversation.js). Sibling fix in the
  same area: the tellbeast branch rendered the unknown descriptor with its
  raw lowercase opener (`"a gold flash in the grass..."`) while
  identifyMonster capitalizes on render (hunter playtest 2026-10-07 rule);
  now matches (src/js/game.js).
- **Proof:** `scripts/test-landing-gossip-aside-20261013.js` — RED on
  pristine tree (3 fail: ❓ inside the spoken line nearly verbatim, ❓
  swallowed as aside, lowercase opener), GREEN after fix: **5/5 pass**.
- **Regressions (node, sequential):** lure-spoken 9/9, lure-respeak 11/11,
  favor-system 30/30, gossip-rumors 11/11, gossip-norepeat 17/17,
  gossip-drama 5/5, gossip-question 3/3, truth 42/42, decline-line 7/7,
  deflect-pool 16/16, convo-norepeat 9/9, convo-seed-voice 37/37,
  convo-deflect-cycle 11/11, dialog-coherence 37/37, dialog-gating ALL
  GREEN, dialog-stream 43/43, gossip-teller-reflexive ALL GREEN,
  ontology 86/86.

## Starvation (question b)

**Still unconfirmed.** 0 starvation deaths across 4 seeds — the autopsy hook
(location/pack/pantry-edibility/3-day series tail) is wired and waiting but
didn't fire. Seed 999's (r7) day-11 player starvation with ~30k pantry
remains unexplained. The competent policy keeps the player fed (final
scholar kcal 1169–1640, pantry never below 8,858). The mechanism question
stays open for a hungrier policy or a dedicated probe.

## Other notes

- System contact fired day 8 on all 4 seeds (3/3 in r8 too — the fortnight
  rhythm is stable).
- Feast social half: 1 unarmed feast hosted (ctx; r8 saw 2/3 seeds). The
  "no villager ever pushes for a feast" blank holds (villagerFeastPush=0).
- 'order' gossip dominates the census because the competent policy
  delegates constantly — the village watches leadership, as designed.
- Seed 212: player death day 13 → succession carried the village to day 14.
  Failure resolves, the run continues. Again.

## Verdict: REACHABLE / FUN / WINNABLE

- **Reachable:** the whole information layer fires in the fortnight —
  gossip volume, player-rumor propagation with honest decay, two full
  monster-naming arcs, favor arcs with consequences, System contact day 8,
  succession after player death.
- **Fun:** the fortnight has texture — act-0 wariness (trust means ~30),
  real food pressure (pantry 47k → 8–38k), a village that argues about
  what to call the thing in the dark, favors that remember refusal. The
  ❓-leak fix removes a real immersion break in the gossip path.
- **Winnable:** 4/4 villages reach day 14 with growing knowledge and
  trust; the one player death was honestly resolved by succession.

## Open questions / not completed

- Seed 999's day-11 player starvation mechanism still unconfirmed; the
  autopsy hook stays in the harness.
- Favor promise→kept/broken machinery untested in-sim (policy deflects
  8/8); needs a policy that accepts, or a targeted probe.
- The per-strike FEASTED spam and armed feast chain remain correctly out
  of reach in-leg (r8's finding stands).

## Files changed

- `src/js/conversation.js` (modified): gossip-ask asides filter now treats
  ❓ doubt beats like 📓 journal toasts — re-emitted outside the NPC's
  spoken line.
- `src/js/game.js` (modified): tellbeast branch capitalizes the unknown
  descriptor on render (matches identifyMonster).
- `scripts/journey-landing-r9-20261013.js` (new): this run's harness.
- `scripts/test-landing-gossip-aside-20261013.js` (new): proof test
  (RED 2/5 on pristine → GREEN 5/5 after fix).
- `evidence/2026-10-13/journey-landing-r9.md` (new): this note.

**DIALOGUE CHANGED — FLAG FOR LIVE CHECK:** `src/js/conversation.js`
gossip-ask composition changed (what renders inside vs outside the NPC's
spoken line on "heard anything?" asks that surface identity-doubt gossip).
Worth a 390×844 look at a gossip ask the next time the ship goes out.
