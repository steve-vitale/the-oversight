# Link-seeking diag — Loop B verdict (run fleshout-loop-b-20261104T2015Z, arm sim-linkseek-b)

Axis: winnability chain (tracker-named next blank #1 from Loop B
run 1830Z, and sim-standaccum-b's own next blank #1).
DIAG ONLY, zero src/js. Gates and prices untouched. No asking
arm rebuilt: sim-askplus-a already PROVED asking works on band
99501–99508 — this arm attributes the zero-link outcome on the
gearbar band itself.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-linkseek-b-prereg.md`
(commit 0db9c5068). In short: competent policy verbatim,
default env, seeds 99101–99108 (the gearbar band re-run on
current master), 150d death-aware horizon, daily snapshots +
the offer-point taxonomy (propose verbs, raid/conquest
answers, counter/accord answers, pending states, conversation
menus via convoGet, primacy bids; aid answers reported
separately as a NON-link channel), tight say filter.
DIAG-GO iff ONE named critical-path stall stage accounts for
the zero-link outcome on at least 6 of 8 judged seeds AND
instrument errors 0 on all judged seeds. Otherwise
DIAG-NO-CANDIDATE. INSUFFICIENT-DATA only if > 2 seeds carry
instrument errors or zero otherVillages at day 1.

## Grounding verified in code before the judged run (not assumed)

- `docs/CANON.md` read first; `docs/SCALE.md` (unlisted in the
  manifest) covers the ladder, the polity definition (>=3
  seasoned subordinates = a realm), and seasoning (30+ days
  AND trust 40+; links form at trust 30). The standing formula
  (diplomacy = 34 x seasoned REGIONAL+ links) is in NO canon
  doc found — it is code-read from `src/js/standing.js`
  (`diplomacyPerLink: 34`) and stated as code-read, not
  invented canon.
- Competent's conversation-answer path
  (`scripts/policies/competent.js`): `talkRound` (line 653)
  opens with `talkTo` and immediately `endConvo('left')` —
  ZERO exchanges; `deepTalk` (line 786, held sittings) is
  gated by `talkOn()` = `COMPETENT_TALK === '1'`, default OFF;
  `answerAidBeats` (line 198, daily when COMPETENT_WARM,
  default ON) answers aid offers/begs only — aid answers
  never form a link in code (`src/js/safetynets.js`: trust
  moves on an EXISTING link, or aid credit). Grep of
  competent.js finds ZERO references to proposeLink,
  proposeCovenant, proposeTrade, proposeAlliance,
  raidVillage, answerRaid, bidForPrimacy, tendLink,
  studyVillageCodex, knowsVillage, otherVillages,
  answerCounter, answerAccord, pendingCounter,
  pendingAccord, pendingRaid.
- Engine inbound-offer check (grep-verified): pendingCounter
  arises ONLY after a propose verb scores 35–54;
  pendingAccord is staged at link formation; pendingRaid
  ONLY after raidVillage; bidForPrimacy requires an existing
  subordinate link. The conversation engine contains NO
  propose/hierarchy call (grep of `src/js/conversation.js`,
  `convo-*.js`: zero hits), and
  `scripts/policies/conversation-pages.js` contains no
  link/bond/covenant/alliance/village choice id. Link
  birthplaces in code, complete list: propose verbs ->
  judgeLink/_proposePeer -> `_formLink` (hierarchy.js:658,
  717, 730); `answerCounter` -> `_formLink`;
  `answerRaid` ('terms'/'strike') -> `_formLink` (conquered,
  hierarchy.js:3720, 3754); debug scenarios only (excluded
  from the harness). No engine path and no villager-agency
  path proposes.
- Critical-path rule (pre-registered): S2 (opinion 10+) is a
  PEER-only prerequisite and S3 (travel) is NOT a proposal
  prerequisite in code, so neither is a stall candidate. A
  seed's stall is the first zero stage on
  S0 -> S1 -> S4 -> S5 -> S6 -> S7 -> S8, where S4 means
  zero offer points across ALL channels.

## Verdict — DIAG-GO (judged only against the prereg)

1. ONE named stall stage accounts for the zero-link outcome
   on 8/8 judged seeds: S4 — zero offer points on every
   channel, on every seed (see the offer-point table).
2. Instrument errors 0 on all 8 judged seeds (702 say lines,
   760 daily snapshots, 2,692 travel calls, 785 talkTo /
   endConvo pairs, all recorded without error).
Proof: `scripts/test-linkseek-20261104.js` — 33/33 PASS
(25 fixture tests + 8 live harness smoke checks + determinism leg:
two separate-process 2-day fingerprints identical).
No balanced-panel comparison exists for a diag, so none is
fabricated and none is attached (per §15, stated not
omitted silently).

## THE ANSWER (plain words)

The villages are not refusing bonds. They are never offered
one, and they never offer one either — on any channel, in
any form, for five months.

Villages ARE met: every seed knows 3–6 other villages by
day 4 (first snapshot day 2), and the region's opinion of
Haven moves on all 8 seeds (to 10+ on 6/8, best 26). The
villages hear about Haven — "Word will travel" lines fire
on 7/8 seeds, both ways ("clean hands" +2, "turned away
the hungry" −4). The scholar even walks across other
villages' tiles mid-day on 4 seeds (10 landings) — and
still nothing happens, because crossing a tile is not an
offer, and no offer follows it.

What never happens, anywhere: no proposal verb is called
(0 proposeLink/Covenant/Trade/Alliance on 8/8); no raid is
mustered and no raid answered (0 raidVillage, 0
answerRaid); no counter or accord is ever pending, so
there is nothing to answer (pendingCounter/Accord/
National/Global/Raid all false on every snapshot of every
seed); no primacy bid (0 bidForPrimacy — there is no
subordinate link to bid from); no conversation turn at
all (785 talkTo/endConvo pairs, 0 convoTurn calls — the
policy opens conversations and walks straight out, and
held talk is env-gated off by default), so no conversation
menu ever presents a link choice (0 link menus, 0 link
picks); and the aid channel never even presents an offer
(pendingAidOffer/pendingAidBeg false everywhere, 0 aid
answers — competent would answer aid, but nothing asks).

Refusal is therefore DEAD as an explanation: refusal
requires an offer, and the instrument proves no offer point
fired on any channel. "Never met" is dead too: villages
are known by day 4 with moving opinions. The zero is at
S4, and it is a policy-design zero, not a game-engine
stall and not a failed courtship: the competent way of
playing contains no move that asks, no move that raids,
and no conversation in which asking could happen. The
engine's side is exonerated twice over — askplus proved
the road works the month it is asked (23/23 proposals end
in a link), and this arm proves the baseline never steps
onto it.

## Per-seed pipeline table

Columns: days, end, scale, maxW, ov day1/max, known (first
known day), best opinion (villages >= 10), village-tile days,
codex studies, travel calls (village-tile landings),
offer points (all channels), links formed (ever-formed via
hierarchyState diff), furthest (diplo-b definition), stall
(critical-path rule), readiness-5 days, wave-4 faced,
final capped standing, deaths, instrument errors.

| seed | days | end | scale | maxW | ov | known | bestOp (op10) | tileD | codex | travel (hits) | offers | links | furthest | stall | ready | w4 | cappedEnd | deaths | err |
|------|------|-----|-------|------|----|-------|---------------|-------|-------|---------------|--------|-------|----------|-------|-------|----|-----------|--------|-----|
| 99101 | 150 | survived | village | 4 | 3/6 | 6 (d4) | 20 (5) | 0 | 0 | 574 (3) | 0 | 0 (0) | S2 | S4 | 0 | yes | 355 | 98 | 0 |
| 99102 | 116 | lost | village | 4 | 3/5 | 5 (d4) | 21 (3) | 0 | 0 | 322 (3) | 0 | 0 (0) | S2 | S4 | 0 | no | 215 | 60 | 0 |
| 99103 | 121 | lost | village | 4 | 3/5 | 5 (d4) | 18 (2) | 0 | 0 | 413 (2) | 0 | 0 (0) | S2 | S4 | 0 | yes | 180 | 75 | 0 |
| 99104 | 150 | survived | village | 4 | 3/5 | 4 (d4) | 14 (3) | 0 | 0 | 544 (0) | 0 | 0 (0) | S2 | S4 | 0 | yes | 225 | 72 | 0 |
| 99105 | 52 | lost | village | 4 | 4/6 | 5 (d4) | 8 (0) | 0 | 0 | 194 (0) | 0 | 0 (0) | S1 | S4 | 0 | yes | 140 | 50 | 0 |
| 99106 | 59 | lost | village | 4 | 3/4 | 4 (d4) | 26 (4) | 0 | 0 | 249 (1) | 0 | 0 (0) | S2 | S4 | 0 | no | 150 | 81 | 0 |
| 99107 | 72 | lost | village | 3 | 4/7 | 5 (d4) | 14 (1) | 0 | 0 | 259 (1) | 0 | 0 (0) | S2 | S4 | 0 | no | 50 | 44 | 0 |
| 99108 | 48 | lost | village | 3 | 3/6 | 3 (d4) | 4 (0) | 0 | 0 | 137 (0) | 0 | 0 (0) | S1 | S4 | 0 | no | 20 | 35 | 0 |

Pooled: proposals 0/8 seeds, 0 calls total. Links formed 0.
Ever-formed (id diff) 0, max current linkTotal 0 — the
ever-created zero is instrumented, not inferred from the
current count alone (standaccum-b's linkTotal was the
current count per snapshot; the two agree here because
the diff also reads 0, and daily snapshots cannot hide a
formation). Max diplomacy standing 0 on all 8 seeds.
First-opinion days 17–23; first-opinion-10 days 33–75
(never on 99105, 99108 — opinion still moved, to 8 and 4).
TalkTo/endConvo pairs per seed: 156 / 120 / 113 / 154 /
56 / 58 / 76 / 52 (785 total); convoTurn 0 on all 8.
Pending-ever: every pending flag false on every seed.
Travel: 2,692 calls, 10 village-tile landings (99101: 3,
99102: 3, 99103: 2, 99106: 1, 99107: 1), 0 day-end village-
tile days, 0 codex studies — mid-day crossings change
nothing, and diplo-b's leadcourt leg already proved links
form with 0 tile days, so travel is exonerated as the
binding cause for the second time.

## Offer-point table (the S4 evidence — all channels, all seeds)

| channel | calls (8 seeds) | pending-ever (seeds) | policy choice |
|---------|-----------------|----------------------|---------------|
| proposeLink / Covenant / Trade | 0 | n/a | never called |
| proposeAlliance (not a link) | 0 | n/a | never called |
| raidVillage / answerRaid | 0 / 0 | raid pending 0/8 | never mustered |
| answerCounter / answerAccord | 0 / 0 | counter 0/8, accord 0/8 | nothing to answer |
| answerNational / answerDefense | 0 / 0 | national 0/8, global 0/8 | nothing to answer |
| bidForPrimacy | 0 | n/a | no link to bid from |
| convoTurn (menus with a link choice) | 0 turns (0 link menus) | n/a | 785 opens, 0 turns taken |
| answerAidOffer / answerAidBeg (NON-link) | 0 / 0 | aidOffer 0/8, aidBeg 0/8 | nothing asked |

## Wall numbers (this corpus, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on
all 8; no seed leaves village scale). Wave-4 unlocks 6/8
(maxW 4 on 99101–99106), wave-4 faced 4/8 (99101, 99103,
99104, 99105 — matching standaccum-b exactly), wave-5
unlocks 0/8, wave-5 faced 0/8. Readiness-5-ready days 0.
Median run-days 94 by the plain sorted median (days
48, 52, 59, 72, 116, 121, 150, 150; 2 seeds censored at the
150d horizon: 99101, 99104 survived). NOTE: standaccum-b
reported median 116 for the SAME eight day-counts — a
median-convention difference, not a trajectory difference:
every seed's days AND final capped standing here
(355 / 215 / 180 / 225 / 140 / 150 / 50 / 20) are identical
to standaccum-b's peak-raw table, so this run reproduces
standaccum-b on the same base rather than drifting from
it. Deaths 515 total: villager combat 211, combat 96,
expedition 84, the wild 56, monster 25, sickness 8,
starvation 6, the arena 5, contest 4, a wound that
wouldn't close 4, ambush 6, named-monster/edge causes 10
— villages die fighting (307/515 combat-shaped, 60%),
not starving, on this band. Arc reach: not instrumented
by this arm (stated, not faked).

## Village assessment (plain words)

Picture eight villages playing competently for seven
weeks to five months. They know their neighbors within
four days — names, reputations that move as deeds are
heard about, once as high as 26 — and they talk about
the outside world only in the region's voice ("Word will
travel"), never in their own. Nobody ever walks to
another village's fire with a purpose, nobody studies
another village's book, nobody musters a war party
against one, nobody sits down for a real conversation
with anyone — the daily talk opens a conversation and
walks straight out again, 785 times, without a single
turn taken. So no bond is ever offered, refused, or
broken, because the offer itself is not in the village's
repertoire. The standing ledger tells the same story in
numbers: war and bread climb, bonds sit at zero on every
day of every village, and the fifth door stays shut for
lack of veterans, not for lack of trying at diplomacy —
diplomacy was never tried. The villages don't lack
friends, and they don't lack courage to ask. They lack
the act of asking, in every channel the game offers.

## Sense-test

- The tight say filter works as pre-registered for its
  purpose and fails instructively in two places. It
  EXCLUDES the pantry noise (0 "fish nets standing" /
  "blink" lines in 702 lines), and it catches the opinion
  mechanism honestly: 12 "Word will travel" lines, both
  valences, matching the opinion moves. But FEAST lines
  still dominate the sample (569/702 — the brief's FEAST
  pattern matches every feast narration), and the "bows"
  link pattern over-catches exactly like the old filters:
  all 14 "bows" hits are false positives ("embarrasses
  bows" in a sling recipe, "elbows" in the alien tutorial,
  "the detective bows to you", "The System bows") — zero
  are link lines. The link-specific patterns are clean:
  0 "brings it home", 0 "Tribute:" on all 8 seeds.
  Future instruments should match link lines on their
  first words ("⛓️ … brings it home", "Tribute:") and
  should NOT use bare "bows" or bare "FEAST" as a
  diplomacy signal.
- No Standing / HELD / "draft waits" line passed through
  say/sysSay in 702 lines (0/8 seeds). `standingLine()`
  (standing.js:447) RETURNS the honest readout — it does
  not say it — and a tree grep finds no game-code caller
  of it (only other instruments' capture fields). The
  standing/HELD narration is therefore a readout, not an
  announcement on this path; the next arm should not
  cite the readout's text as spoken dialogue without
  checking which beat, if any, speaks it
  (`_standingHoldBeat` / `_standingReleaseBeat` are the
  beat functions named in standing.js's header).
- No robotic villager behavior was flagged by this arm's
  corpus — the sense finding is again the absence: no
  villager ever talks about another village as a partner,
  rival, or courtship target, because no one ever acts
  toward one. Feast narration is coherent and specific
  (named host, menu, eaters); opinion narration is
  coherent and valenced. The diplomacy story is untold
  because it is unplayed, not because it is mis-narrated.

## Metric review (§14 — no in-run re-scoring)

- The prereg bar was judged exactly as written: DIAG-GO
  on stall S4 8/8 + errors 0. No metric moved. The
  critical-path stall rule worked as designed: under
  diplo-b's furthest-stage rule this corpus would read
  S2 6/8 + S1 2/8 (still a majority, but split on opinion
  noise — 99105/99108 never reach opinion 10 through no
  fault of the stall); under the critical-path rule the
  verdict is unanimous S4 8/8, because the opinion-10
  difference is irrelevant to a LEAD link and to the
  question asked. The rule is recommended for the next
  pipeline diag.
- The offer-point taxonomy proved its worth negatively:
  every channel reads zero, which is what lets this arm
  kill the refusal hypothesis outright instead of merely
  repeating diplo-b's propose-verb zero. The one channel
  that could still hide an offer is a conversation menu
  whose link choice id does not match LINK_MENU_RE
  (/link|bond|covenant|alliance|primacy/i) — but with
  0 convoTurn calls on 8/8 seeds, no menu was ever
  presented to the policy at all, so the regex's recall
  is moot for this corpus. A future arm with held
  conversations enabled (COMPETENT_TALK=1) must re-test
  menu recall.
- Snapshot cadence is ~daily (149 snapshots over 150 days
  on 99101; first snapshot day 2): firstKnownDay 4 means
  "known by the day-4 snapshot", not "known at dawn on
  day 4". A link needs 30 days alive to season, so daily
  snapshots cannot miss one; and everFormed (id diff) is
  0, so no link formed and dissolved between snapshots
  either.
- Say-filter limitation carried forward (see Sense-test):
  FEAST floods, bare "bows" false-positives. The verdict
  does not depend on the say sample (it depends on verb
  wraps + pending snapshots + link diffs), so the noise
  does not touch the GO bar.

## Next blanks, in order

1. HOLDING, not asking (the named next lever; owned in
   part by the sibling polity-fragility arm — do not
   duplicate it here): askplus proved asking works
   (23/23 proposals end in a link) and this arm proves
   the baseline never asks, so the open problem is what
   happens AFTER asking — diplomacy flowed to 102 on 5/8
   askplus seeds but held to end of run on only 2/8
   (all-or-nothing polity collapse when one link's trust
   crosses 40 downward, boundary flicker, tend/pantry
   economics). Any new arm here must judge holding
   (e.g. diplomacy > 0 on >= X days, or held >= 14
   consecutive days), not end-state diplomacy and not
   asking.
2. STEVE-CALL — who should ask? The baseline competent
   policy is "scale-free by design" (leadcourt header),
   so putting asking INTO competent changes what the
   baseline means; villager-agency courtship (villagers
   pursuing bonds on their own, through perception) is
   the other road, and it does not exist in code today
   (no villager path proposes). Whether the asking move
   belongs in the baseline policy, in a climb policy
   players opt into, or in villager agency is a design
   ruling, not a measurement — no gate/price/deed change
   follows from this evidence.
3. Veterans-production + killer survival (vetbar blank 1,
   still open, sharpened by standaccum-b): readiness-5's
   only short bar at peak on the three 199-held seeds is
   veterans (0 of 2). The 199-hold is a veterans problem
   wearing a standing costume, and it survives this arm
   untouched — diplomacy-absent is now explained, but
   veterans remain the release blocker.

## Proof and landing

- Proof: `scripts/test-linkseek-20261104.js` — 33/33 PASS
  (tight-filter matches/rejects incl. pantry-noise
  rejects, stall S1/S4/S4-refused/S5-declined, pending-
  unanswered counting, convo-link-menu counting, aid
  exclusion, first-known/opinion-10 days, judgeGo
  majority/error-blocks/insufficient/scattered semantics,
  live harness smoke: snapshot shape incl. pending
  raid/aid + linkTotal/everFormed, talkTo exercised,
  convoTurn 0 under default env, 0 offer points in 2
  days, 0 instrument errors; determinism leg: two
  separate-process fingerprints identical).
- Commits (this worktree branch sim-linkseek-b; coordinator
  merges via --ff-only; merged locally, pending ship — no
  push, no bump, no live verification by this worker):
  - 0db9c5068 sim-linkseek-b prereg (before any judged sim)
  - 2200bd886 sim-linkseek-b instruments + proof 33/33 +
    determinism leg (zero src/js)
  - (this landing) sim-linkseek-b pilot + evidence
    (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-linkseek-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-linkseek-b/` (8 files);
  scripts `linkseek-instrument-20261104.js`,
  `linkseek-driver-20261104.js`,
  `linkseek-analyze-20261104.js`,
  `test-linkseek-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after both commits
  (prereg + instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- Worktree state at handoff: only committed work after the
  evidence commit below (verified before reporting).
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence).
- Heartbeats: registry `sim-linkseek-b` heartbeated through
  the run.
