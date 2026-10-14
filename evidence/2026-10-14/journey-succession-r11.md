# journey-succession r11 (2026-10-14): "whose word broke?"

## Pre-registration (§11; binding per §14)
- **Question:** when the bearer dies, is blame personal and memory communal?
  The blitz-succession promise-decay design (Steve 2026-10-13) stamped
  `maker` on `promise_broken` so a dead bearer's broken word dies with them —
  canon: "it's not yours to carry — but I remember." Code reading before the
  run found two makerless paths that contradict this:
  (1) `convoFavorRenounce` (convo-wants.js:1287) stamps `promise_broken` with
  NO maker — the maker gate (`maker == null → mine`) then treats it as the
  CURRENT bearer's word, so the SUCCESSOR gets refused ("You said that
  before…") and offered amends for a promise the PREDECESSOR renounced.
  (2) Open promises rot after the maker's death with `maker: this.villagerId`
  stamped at ROT time — i.e. the successor is stamped as the breaker of a
  promise they never made (nothing stamps maker at creation).
- **Primary metric (binding):** three-lane promise test per seed. Old bearer:
  (A) `promiseHelp` promise (open), (B) favor-commit promise (open favor
  promise, not renounced), (C) favor-commit + renounce (broken favor promise).
  Then death. As the successor:
  - F1 (the fix): C's renounced memory has `maker` === oldId;
    `canMakeAmends(C)` === false; `promiseHelp(C)` is NOT refused
    ("You said that before" must not fire for the predecessor's word).
  - F2 (design verification, no fix): A's and B's open promises are
    RELEASED at death (`kept === 'released'`, `inherited === true`), never
    left to rot against the successor; B's favor reverts to 'asked' and
    `inheritedName` names the predecessor on the re-ask.
  GO = all 4 seeds green post-fix. Pre-fix run documents F1 RED.
  CORRECTION (recorded, not quietly edited): the original header's F2
  ("promise rots after death with maker=oldId") was premise-wrong — the
  release loop at ledger.js:930-946 already settles open promises at death
  ("the promiser is dead"), so rot-after-death is impossible by design. F2
  now verifies the release instead.
- **Secondary metric:** mourning survives crisis r8 — ≥1 post-death line
  naming the dead Bearer <redacted> within 3 days on ≥3/4 seeds (the r8 outbreak
  kind must not displace grief/mantle beats).
- **Horizon:** 16 days competent play (post-System death like r10) + 8 days
  successor tail. Death-aware: a dead/scattered village stops (+10d max).
- **Seeds:** 611, 612, 613, 614. Policy: competent (scripts/policies/competent.js).
- **Interesting-finding bar:** the renounce-maker hole confirmed in the RED
  run; a mourning regression from crisis r8; or any mantle-chain break.
- **What this run does NOT re-prove:** the mantle inheritance audit,
  phantom-name scan, wipe, background-kit use (r10, 2026-10-12 — verified,
  unchanged since).

## Metric review
- The original F2 ("promise rots after death with maker=oldId") was
  premise-wrong: ledger.js:930-946 already RELEASES open promises at death
  ("the promiser is dead" — kept='released', inherited=true; favor reverts to
  'asked'). Recorded as a correction above; F2 now verifies the release.
- Seed substitution: 614 → 615. 614's village was healthy (12 alive, day 18)
  but only 2 villagers had keep-kind goals; the script needs 3 lanes. Sample
  artifact, not a game finding. Seeds actually run: 611, 612, 613, 615.
- Check precision fix (not a metric change): canMakeAmends has two lanes
  (rep + broken-word). On 611/613 the renounce's -15 trust opened the REP
  lane ('trustworthy' -45), so the whole-button check couldn't isolate the
  promise lane. The check now evaluates the broken-word lane's own predicate
  (lastPromiseWord + maker gate) directly. The promise-lane behavior is what
  the fix changes; the rep lane is untouched by design.

## Results (post-fix, seeds 611/612/613/615 — 15/15 each)
- F1 RED→GREEN: renounced favor promise now stamps
  `{trustAtBreak, maker: oldId}`. Successor: broken-word lane closed
  (no amends button for it, no "You said that before" refusal), and a new
  promise is created with `maker === newId`. The memory stays — bitterness,
  and the line: "Seamus never got to make that right. It's not yours to
  carry — but I remember."
- Pre-fix behavior (documented, seed 611): the successor WAS refused
  ("You said that before... Not again. Not until that's answered.") and
  offered amends for the predecessor's renounced promise — the canon
  violation, live in the engine.
- F2 (design verification, no fix needed): open promises release at death
  (`kept='released'`, `inherited=true`); the favor reverts to 'asked' and
  the re-ask names the predecessor via the death stamp (`inh`). The chain
  is honest: the NPC re-asks the new bearer, naming who asked before.
- Secondary: mourning names the dead bearer <redacted> 3 days (4+ lines/seed:
  the death beat, the Codex page, the "mantle passes to X" line, the
  body-recovery beat). Crisis r8 did not displace grief/mantle — the
  outbreak kind stays outranked per its own spec.
- Regression: test-blitz-succession 30/30, test-corpses 37/37,
  test-crisis-outbreak-convo 24/24, test-ledger 91/95 (4 pre-existing fails,
  identical on pristine — matches r10 baseline), test-mantle-memory 5/9
  (4 pre-existing fails, identical on pristine), validate-ontology 94/94.
- New proof: scripts/test-promise-maker-succession-20261014.js 14/14 GREEN
  (7 fail on pristine via patch-swap — RED verified without touching the
  stash stack).

## Village assessment (plain words, seed 615, day 23 — 3 days after the death)
Eleven people alive, nobody else fallen. Seamus Conti died to a hushwolf on
day 20; Esther Fischer — a lawyer, the highest-trust villager at 42 —
picked up the Codex. The pantry holds ~16k kcal (the village eats well);
the codex knows 14 plants; integration is at stage 2 with three System
abilities (gossip_network, green_thumb, iron_stomach). Trust is
mid-rebuild: the line cook Alejandro sits at 82, the new Bearer <redacted> 42,
everyone else in the 20s-60s — the office's standing survived the death
at a discount, exactly as designed. The village is grieving but functional:
someone picked up Seamus's share of the work, the grave is dug by the fire,
and life goes on. That's the design working.

## People check (SENSE-TESTING LAW — full transcripts read raw)
- Seed 615 (Esther Fischer → Ella Johnson, the renounced villager): the
  "About what you promised..." ask fires "Seamus never got to make that
  right. It's not yours to carry — but I remember." Grief by name: "Since
  Seamus died... I keep expecting to see Seamus at the fire. Stupid."
  "I'm picking up Seamus's share of the work. Someone should, and it might
  as well be me." "We bury, we grieve, we keep going. There's no step four."
  Closer earned: "This was good. They mean it."
- Seed 611 (Jesse Cortez → Zoltan Nagy): "Ernestine never got to make that
  right. It's not yours to carry — but I remember." Zoltan has his own
  betrayal-investigation thread running — the NPC wants something
  independent of the player. Repeated presses get honest pushback ("I just
  said — did you miss it?", "We've covered this one. Ask me something else.").
- Seed 613 (Hermann Qian → Esteban Schroeder): "LaToya never got to make that
  right. It's not yours to carry — but I remember." "LaToya is gone and the
  world just... continues. That's the part I can't stand." "Nobody says
  LaToya's name right yet. We will. Give it a few days." Plus the honest
  handoff: ""LaToya's gone." Mario looks at you for a long moment. "You're
  not LaToya." No heat in it. Just fact. You'll have to earn this face."
- No fabricated shared history with any new bearer; grief names the dead;
  every conversation has a want, a middle, and an earned ending.

## Reachable / fun / winnable
- Reachable: yes — all three promise lanes, the release, the re-ask, and the
  mourning beats fire through real engine paths (scripted death only to
  guarantee the event; r10 already proved natural deaths drive the same chain).
- Fun: yes — the successor inherits the office, not the blame. The new
  Bearer <redacted> re-earn trust and make their own promises while the village
  keeps the dead on its tongue by name.
- Winnable: yes for the leg — nothing in the promise/maker machinery blocks
  progression; the release prevents phantom refusals from bricking the
  successor's social game.

## Flags for other loops
- Convo loop: test-mantle-memory-20261012's 4 mourning-name failures are
  pre-existing (identical on pristine) — the convoWantNews mourning surface
  names "the man in his 20s" (stranger descriptor) where the test expects
  the true name. Knowledge-gating vs test expectation; not this run's scope.
- `p.inherited = true` (ledger.js:935) is write-only — set on release, never
  read. Harmless provenance; noting for the dead-ledger, not fixing unasked.
- Sim loop: only 2/12 villagers had keep-kind goals on seed 614 — promise
  coverage in long sims may be thinner than assumed. Not a bug, a sample note.
