# journey-scale r132 — RUN NOTE (lane A, leg 3 SCALE, raise-answer template fix)

**Run id:** `playtest-loop-a-20261112T0043Z`, scheduled Wed 2026-11-11 18:45 CST
(00:45 UTC). **Rotation read 3 → leg 3 SCALE.**
**Base:** local master `f888f7ce3` (bisect-mournblooded-a evidence+corpus).
**Branch:** `journey-scale`, worktree `~/workspace/worktrees/journey-scale`.
**Policy:** scalecourt-traderoad-r113-linkraise-sit (same as r131).
**Seeds: FRESH 132101–132104** (0 filename hits; 0 dated-prereg mentions
other than this run's own; full-tree sweep 10 files, all false positives —
a kcal total and float substrings, see prereg). Fixture seed 132100.
**Horizon:** DAYCAP=140, death-aware stop. Seeds run one-per-process
(r183 adoption: driver multi-seed state leak).
**Registration:** slow (~16 min — `git worktree add`'s inner `git reset
--hard` ran 5+ min under host load, then the registry lock was contended
by concurrent heartbeats). Heartbeat kept; re-heartbeated 01:38Z after a
~30-min gap during the fix/proof work — no reaper action taken against
the tree (verified alive throughout).

## Q1 (PRIMARY) — RAISE-ANSWER TEMPLATE FIX: GO

**The defect (r131-carried, seed 131102 d120 Claudete, outcome counter):**
the NPC asked to forage tomorrow; the player answered "All right. Let's
ask them." and carried a link proposal to The Bloodied II — a village
never mentioned in the sitting. The link-raise line was never spoken.

**Mechanism (read in code):** `bond-initiation.js bondChoices` prepended
`link:accept`/`link:decline` to EVERY menu in the sitting whenever a link
raise was pending, unconditional on what the NPC just said.
`conversation.js startConvo` speaks the pending raise as its own beat
("the player is never asked to accept or decline something they were
never asked", INVITATION HONESTY r7) — but when the opener owns the
reply (`openerOwnsReply`: the opener asked a question, e.g. the forage
want line, thread 'want' stage < 3), the raise is HELD in `c.linkPending`
for the continuer instead of spoken. The menu still offered `link:accept`
on turn 1, and the linkraise policy ("picks link:accept when it is
offered") took it immediately. Canon (`docs/CONVERSATIONS.md`):
"Replies belong to the spoken exchange."

**The fix (one task, one commit).** Per-sitting "ask spoken" flags:
- `src/js/convo-beats.js` `convoRecordSpokenBeat`: tag `'linkraise'` sets
  `c.linkRaiseSpoken`, tag `'bondproposal'` sets `c.bondProposalSpoken`.
  The single choke point every speaking path funnels through (`sayLine`
  records via it; `recordStagedBeat` calls it directly; the goon speaks
  held beats through `sayLine` with the tag). A queued-but-unspoken beat
  sets no flag — queuing is not hearing.
- `src/js/conversation.js` `startConvo`: both flags reset alongside
  `c.spokenBeat = null` (per-sitting, like the other sitting ledgers).
- `src/js/bond-initiation.js` `bondChoices`: `link:accept`/`link:decline`
  only when the pending raise exists AND `c.linkRaiseSpoken`;
  `bond:accept`/`bond:decline` only when the pending proposal exists AND
  `c.bondProposalSpoken`. Fail-open with no convo record (unknown caller,
  old behaviour); fail-closed with a record whose ask was not spoken.
  No demand, number, bar, or line changes; the raise stays pending
  (3-day expiry, re-spoken next sitting) when the player answers
  something else first.

**Proof test:** `scripts/test-journey-scale-r132-raise-answer-20261111.js`
— **RED on unfixed code (18 passed, 13 failed: the defect reproduces —
bondChoices offers link:accept/link:decline and bond:accept/bond:decline
while the ask is unspoken) and GREEN on fixed code (31 passed, 0
failed).** All seven sections green after the fix, including the good
flows (sayLine-spoken, opener-carried, goon-spoken held beat, bond
mirror, per-sitting reset) and the no-pending control. One note: the
full-menu read in §1 skips in the fixture (in a fresh run most openers
own the reply, so no unfiltered opening was found — the gate proof is
the bondChoices-level read, which is decisive; the panel proves the
full-menu behaviour in the wild).

## Q2 PANEL RAISE-TALKS: GO (0 defect talks in 11)

Analyzer `scripts/analyze-journey-scale-r132-20261111.js` (exit 0):
**11 raise talks, 4 properly-answered, 0 defect** (r131 baseline: 1
defect talk in 6). All 11 read in full:
- Properly answered (4): 132101-1 Xiaojuan d12 (counter — raise spoken
  first, then accept); 132102-1 Otto d134 (accepted); 132103-4 Leo d16
  (accepted); 132104-5 Thabo d21 (accepted — the raise is spoken
  MID-conversation after the sleep exchange, then accepted: the
  held-beat path working live).
- Not-offered (7): the raise went unanswered in that sitting — 132103-2/3
  and 132104-2 (raise never spoken; the policy held a real conversation
  instead of blind-accepting — the fix changing behaviour correctly in
  the wild); 132103-1, 132104-1/3/4 (raise spoken, then a follow-on beat
  — "Come get air with me" / "Come see what I found" — took the menu
  before the player could answer; the raise stays pending). No senseless
  accept anywhere.
- **Observation (not a defect):** a spoken raise's answer window can be
  crowded out when the opening speaks a second beat right after it
  (raise line, then an invitation/follow-on line, menu built for the
  second). The raise survives pending and is answered on a later day
  (Thabo d21), so nothing is lost — but the answer waits a sitting.
- **Vetbar guard (kept): GO** — zero readiness/ladder disagreements on
  all 4 seeds (disagree4=0, disagree5=0). Shadow counts found one
  phantom day (132102 d140, both waves — the old rule would have
  overcounted a veteran on the last day; the fixed engine reads
  honestly). The r131 fix holds.

## Q2-secondary TRAP-LINE: investigated, NOT built (carried, pinned)

Tarek's mimed trap-line invitation: the NPC (no shared language) SHOWS
the invitation in `nvOpen` (`src/js/conversation.js:8404` — the gesture
line, `inv.spoken = true`) but the nonverbal menu
(`conversation.js:4896-4910` — nv:nod / nv:smile / nv:pointself /
nv:listen / nv:translate only) offers NO way to answer it, and the
`nv:` turn router (`conversation.js:8547+` → `nvRespond`) has no invite
branch. The invitation evaporates. **It fired again this band:** Mario
(Italian, no shared words), seed 132101 d120 — mimed toward "the cache
spot", menu offered only gestures, the policy nodded 4 times and left.
Same class as r131 Tarek, different villager/spot. The fix is NOT the
same template as Q1 (it needs a gesture accept/decline in the nonverbal
menu + routing to the invite's accept/decline handlers + the outing
semantics of following a mimed invitation) and is not small — carried
with the pinned locations above. **Baraka: 0 mentions** in all captures
and raise-talks this band (did not fire).

**Sibling pattern found (next-run investigation, not this run's build):**
`betrayal.js:4351-4360` `betrayalChoices` offers `betrayal:accept` /
`betrayal:decline` whenever a `pendingInvite` exists, with NO
per-sitting spoken check — the same unguarded shape Q1 fixed for
bond/link. It fired in this band: Thabo, seed 132103 d120 — turn-0
choices were betrayal:accept/decline while the sitting's transcript
shows only the grief line ("I don't know what to do with my hands
today."), no invitation line; the accept resolved sensibly into the
quiet-place walk ("Thabo shows you where they go to think. 'Don't tell
the others.'"). Whether the invite was heard in a PRIOR sitting is
unverified (the transcript instrument does not record invite staging /
spoken history) — needs that history before a verdict. Not expanded
into this run: Q1 is scoped to bond/link as preregistered, and the
panel proves it.

## Q3 TRAJECTORY SHAPE: HOLD

- Lived-days total **497 vs r131 band 409 (+21.5%, inside ±25%)**.
- Alive/dead: 1 alive / 3 dead (r131: 2 alive / 2 dead) — no flip
  without cause: the three deaths are scatter-hunger (132101 d138,
  132103 d129 — the Hunger Winter, pantry empty, 5th hungry day) and
  killed-outright (132104 d89, 0 left). The collapse shape (wild deaths
  dominate: 15/10/14/7 per seed) matches the bisect's standing
  mournblooded window; no death is attributable to a missed or delayed
  link (per the pre-registered attribution rule — the fix can only delay
  a link answer, never change a demand).
- Lesser seat priced **4/4** (d45/d47/d45/d51). Full seat never,
  national never live. 132102 delivered the military tribute @d140
  (the band's only delivery; r131 had 1/4).

## Q4 PEOPLE CHECK: 6/6 transcripts sensible (raise-answer class)

Read in full: 132101 d90 (Ingrid — wound-close, policy left at once;
thin but sensible), 132101 d120 (Mario — nonverbal, see trap-line
above; plus a nod loop: nv:nod ×4 with near-identical nod-backs —
thin variety, noted as an observation, not a defect), 132102 d90
(Ella, seek_comfort — real grief, comfort, staying by the fire, gossip;
"Good. Company's company."), 132102 d120 (Ella, curious — "What do
you make of all this?" answered honestly, "Bleak. Probably true."),
132103 d90 (George, curious — night sounds, sleep in shifts,
"Columbus, Ohio never taught me that. The treeline did."), 132103
d120 (Thabo, grief — quiet-place walk, Cape Town dream, "Then it's not
gone. Not really. Keep going back."). Senseless 0 for the raise-answer
class. 132104 died d89, so no d90/d120 transcripts exist for it.

## Q5 CENSUS (plain words)

- **132101 — scattered d138, 1 left at the end.** 19 deaths (the wild
  15, monster 2, contest 1, arena 1). Reached regional, ladder stage 3
  (d33), lesser seat priced d45. 27 fights (19 wave-4); 6 wave-4 kills
  (3 scholar, 3 villager, 2 distinct villagers, 0 living at end).
  Blooded 23 days. The village fought, then the pantry emptied and
  people walked away on the fifth hungry day.
- **132102 — lived to the d141 cap, 5 alive.** The strongest village:
  12 deaths (wild 7, stranger 2, monster 2, arena 1). Stage 3 (d45),
  lesser d47, military tribute DELIVERED d140 (the only delivery in
  the band — the village paid its veterans away on the last day and
  still stood). Blooded 53 days. 24 fights.
- **132103 — scattered d129, 6 alive at the scatter.** 19 deaths
  (wild 14, arena 3, monster 1, starvation 1). The fightiest village:
  100 fights (63 wave-4), learned counters in the wild (Choir Toad:
  break the chorus). Stage 3 (d32), lesser d45. Dionisio cured Ruby's
  fever in camp and the camp saw it (medic-cure channel live). The
  Hunger Winter ended it: pantry empty, fifth hungry day, people
  walked in different directions.
- **132104 — died d89, 0 left.** 17 deaths (wild 10, stranger 2,
  monster 2, arena 1, ambush 1, The Mountain Lord 1). Stage 3 (d37),
  lesser d51. 19 fights. Killed outright, not scattered — the wild and
  strangers took everyone.

**Leg verdict:** reachable yes (scale content on 4/4: regional links,
ladder stage 3, lesser seat priced 4/4, tribute delivered 1/4, wave 5
never — the living-veteran pair is still the wall, same as r127/r130/
r131); fun yes (the d90/d120 transcripts are the best of the recent
bands — grief, comfort, secrets, a dream of Cape Town); winnable
unchanged (0/4 full seat, national never live).

## Telemetry

`telemetry-check.js` vs `scale.json`: 2 LOUD lines — fightsTotal −62%
(446→170), fightsByWave.4 −65% (289→102). **EXPLAINED, baseline NOT
rolled:** (a) the stale 646-day baseline regime (same as r130/r131);
(b) one early village death (132104 d89) cut the band's exposure; (c)
the wave-4 total is actually UP on r131's band (102 vs 50) — 132103's
63 wave-4 fights in 129 days are the band's shape, not a fight-rate
collapse. Per-day check: 132102 fought wave-4 at 10/141d, 132101 at
19/138d. The scale.json re-label is still owed.

## Gate

`node scripts/check.js --quick` (log
`journey-scale-r132-check-quick.log`): **335 passed, 5 failed in 623s.
Verdict GO.** The 5 = the standing staleness pair + phone-frame-proof
+ 2 load-artifact timeouts:
- test-measurement-proof-update.js + test-measurement-workflow.js —
  "Proof source inputs are not current" / "retained neutrality proof
  covers the current Game/controller/harness inputs" — the expected
  src-touch consequence of this run's `src/js` change; the proof refresh
  is owed as a follow-up, not a merge blocker (same as r131).
- test-phone-frame-proof.js — the stale inputs listed are index.html,
  foreignSpeech.json, regions.json, statusEffects.json,
  table-endings.json, alienPlayers.js — NONE is a file this run touched;
  the staleness predates this change (standing failure, same as r131).
- test-living-garden-deed-attainment.js + test-one-person-army-deed-
  attainment.js — both TIMEOUT at the 120s gate cap (load artifacts;
  standalone re-runs green: garden 8/8, army 7/7 — logs
  `journey-scale-r132-garden-standalone.log`,
  `journey-scale-r132-army-standalone.log`).

## Metric review

- Q1 as written held cleanly (RED 13-fail → GREEN 31/31; the good-flow
  sections stayed green on the unfixed engine too, as preregistered).
- Q2's "zero defect talks AND ≥1 properly-answered talk" held (0/11
  defect, 4 properly-answered). The classifier's "properly-answered"
  count (4) understates the fix's wild effect: 3 more talks show the
  policy holding a real conversation instead of blind-accepting an
  unspoken raise (132103-2/3, 132104-2) — worth counting as "withheld
  correctly" in the next classifier revision.
- Q3's guardrail held (+21.5%); the pre-registered collapse-attribution
  rule was not needed (no breach), but the deaths' shape (wild
  dominates everywhere) matches the bisect window and is recorded.
- Q4's "senseless 0" held for the raise-answer class; the carried
  defects fired in the nonverbal + invitation paths instead (see above)
  — the Q4 protocol should name the raise-talks AND the nonverbal
  transcripts explicitly next run (the nod loop and the unanswerable
  mime live there, not in the d90/d120 verbals).

## Carried (not this run's to build)

Trap-line / mimed-invitation answering (nonverbal menu + nv: routing;
pinned above; fired twice now — Tarek r131, Mario r132); the
betrayal:accept sibling pattern (needs invite staging/spoken history
before a verdict); Baraka unvoiced raise (0 mentions this band);
monster-veteran +3 damage gap (Steve call / sized prereg);
`tbVillagerFalls` vp.dead lie (wider fix, needs a panel); guest-death
(Bing) prereg; survival-collapse cause (bisect owns it);
scholar-payment open item (steve-call); scale.json baseline regime
re-label; origin/master divergence (ship loop owns); measurement-proof
refresh (b5 — this run's `src/js` touch re-staled it; the next refresh
round re-points); the nod-loop variety observation; the spoken-raise
answer window crowded out by a follow-on beat (observation).
