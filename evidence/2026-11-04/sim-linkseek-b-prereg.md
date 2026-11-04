# Link-seeking diag — PRE-REGISTRATION (arm sim-linkseek-b)

Run: fleshout-loop-b-20261104T2015Z. Loop B re-point queue: tracker-named
next blank #1 from Loop B run 1830Z, and sim-standaccum-b's own next
blank #1. Committed BEFORE any judged sim. DIAG ONLY, zero src/js —
a recorder/instrument, no game change. No gate/price/deed/win-price
change. Do NOT rebuild an asking arm (sim-askplus-a already PROVED
asking works on band 99501–99508); this arm attributes the zero-link
outcome on the gearbar band itself.

## Canon read before this prereg

- `docs/CANON.md` (manifest) read first. The manifest lists NO doc
  covering standing scoring — but `docs/SCALE.md` EXISTS in the tree
  (unlisted in the manifest) and covers the ladder, the polity
  definition (>=3 seasoned subordinates = a realm), and seasoning
  (30+ days AND trust 40+; links form at trust 30 — tending
  required). SCALE.md was read for ladder/polity rules. The
  standing formula (diplomacy = 34 x seasoned REGIONAL+ links) is
  in NO canon doc found; it is code-read from `src/js/standing.js`
  and stated as code-read, not invented canon. This matches
  sim-askplus-a's correction of sim-diplo-b's "no canon doc" line.
- Prior evidence read (in this worktree; NOT re-run): 
  `evidence/2026-11-04/sim-diplo-b.md` + prereg (S0–S8 pipeline
  decomposition on band 99301–99308; competent never proposes),
  `evidence/2026-11-04/sim-askplus-a.md` (competent-plus-ask PROVED
  asking works on band 99501–99508 — 23/23 proposals end in a link),
  `evidence/2026-11-04/sim-standaccum-b.md` + prereg (the finding
  this arm explains: linkTotal 0 on all ~860 snapshots, no
  village-visit line in any say sample, 3 seeds clearing 200 raw
  standing yet held at gated 199 because veterans (0 of 2) are
  the only short bar).

## The question

On the gearbar band seeds 99101–99108 under competent play
verbatim, why does competent play never form a single
inter-village link — are villages never met/contacted, or are
bond offers refused? Two rival attributions, distinguished
by this arm:

- NEVER-MET: villages never become known (S1 fails), so no
  offer is even possible.
- NEVER-ASKED: villages are known (and opinion moves), but no
  offer point of ANY channel ever fires — no propose verb, no
  raid/conquest answer, no counter/accord answer, no
  conversation link-choice, no bid for primacy.
- ASKED-BUT-REFUSED: offer points fire and are refused
  (knowledge/opinion gate refusals, judge declines, counters
  walked away from, raid terms refused, conversation
  link-choices declined).

Sim-diplo-b already answered NEVER-ASKED for the propose-verb
channel on band 99301–99308. This arm re-tests on the gearbar
band AND closes diplo-b's open channel gap: the conversation
answer path, the raid/conquest channel, the aid channel, and
bids for primacy — every decision point at which a bond could
be offered or answered, with the policy's choice AND the
code-read reason.

## Code-read conversation-answer path (verified by grep, not assumed)

Competent's conversation behaviour under default env
(`scripts/policies/competent.js`, current file at this anchor):

- `talkRound` (the daily talk): `talkTo(vid)` then immediately
  `endConvo(vid, 'left')` — ZERO exchanges. No `convoTurn` call
  exists on this path.
- `deepTalk` (held sittings, up to 2/day, up to 5 turns each,
  choice rule: answer their question first, then teach, then
  canon questions, then ask) is gated by `talkOn()` =
  `COMPETENT_TALK === '1'` — default OFF. Under the default env
  this arm runs, held conversations never happen.
- `answerAidBeats` (runs daily when `COMPETENT_WARM`, default
  ON): answers `pendingAidOffer` with 'accept' and
  `pendingAidBeg` with 'give'/'refuse'. Aid answers NEVER form
  a link in code (`src/js/safetynets.js` answerAidOffer/
  answerAidBeg only move trust +/- on an EXISTING link, or
  ledger aid credit) — the aid channel is a non-link decision
  point, reported separately, never counted as a link offer.
- Grep of competent.js finds ZERO references to: proposeLink,
  proposeCovenant, proposeTrade, proposeAlliance, raidVillage,
  answerRaid, bidForPrimacy, tendLink, studyVillageCodex,
  knowsVillage, otherVillages, answerCounter, answerAccord,
  pendingCounter, pendingAccord, pendingRaid. The policy file
  contains no scale code by design (leadcourt header: plain
  competent "contains zero scale code by design").

Engine-side inbound-offer check (grep-verified):

- `pendingCounter` arises ONLY after a propose verb scores
  35–54; `pendingAccord` is staged at link formation
  (`_formLink`/stageFirstAccord). Neither can exist before
  a player-initiated proposal. `pendingRaid` arises ONLY
  after `raidVillage`. `bidForPrimacy` requires an existing
  subordinate link (winseek calls it only when
  `l.subordinate === 'haven'`).
- The conversation engine contains NO propose/hierarchy call
  (grep of `src/js/conversation.js`, `convo-*.js` for
  proposeLink/_formLink: zero hits), and
  `scripts/policies/conversation-pages.js` contains no
  link/bond/covenant/alliance/village choice id. A villager
  conversation therefore cannot offer a bond the policy
  could accept or refuse — unless the instrument's menu
  capture proves otherwise, which is exactly what the
  convoTurn wrap tests.
- Link birthplaces in code (complete list from grep):
  propose verbs -> judgeLink/_proposePeer -> `_formLink`;
  `answerCounter` (counter-accept) -> `_formLink`;
  `answerRaid` ('terms'/'strike') -> `_formLink` (conquered);
  debug scenarios only (excluded from the harness). No
  engine path and no villager-agency path proposes.

## Pipeline stages (diplo-b's S0–S8, reused)

  S0 villages exist: state.otherVillages non-empty at day 1.
  S1 known: knowsVillage(v) true for at least one village.
  S2 courtship currency: opinion >= 10 on at least one known
      village (the PEER-proposal prerequisite bar), and any
      opinion movement (nonzero opinion).
  S3 travel: scholar stands on another village's tile at
      least once, and/or studies a village codex.
  S4 proposal attempted: any proposeLink / proposeCovenant /
      proposeTrade call (proposeAlliance counted separately).
  S5 proposal outcome: accept / counter / decline / refused,
      read from returns + pending state, never from a say-line.
  S6 link formed: hierarchyState() gains a link id.
  S7 seasoned: a link reaches 30+ days with trust 40+.
  S8 regional+: a seasoned link passes _linkRegionalPlus.

CRITICAL-PATH STALL (this arm's judging rule, stated here so
the verdict cannot drift): S2 and S3 are NOT on the critical
path for a LEAD link — the peer-opinion gate (opinion 10+)
applies only to covenant/trade proposals, and travel is NOT
a proposal prerequisite in code (knowledge can come from a
rumor or generation; diplo-b's leadcourt leg formed links
with 0 village-tile days). A seed's stall stage is therefore
the FIRST zero stage on the critical path S0 -> S1 -> S4 ->
S5 -> S6 -> S7 -> S8. S2/S3 are reported as context stages
for every seed, never as stall candidates. The OFFER-POINT
table (below) is the S4 evidence: a seed stalls at S4 iff
its offer-point count is zero across ALL channels.

## Offer-point taxonomy (every channel instrumented)

  O-propose: proposeLink / proposeCovenant / proposeTrade /
      proposeAlliance calls (with returns).
  O-raid: raidVillage calls and answerRaid calls (with args).
  O-answer: answerCounter / answerAccord / answerNationalChoice /
      answerDefenseCall calls, plus any snapshot showing
      pendingCounter / pendingAccord / pendingNational /
      pendingGlobal / pendingRaid non-null (an offer the
      policy faced but did not answer is still an offer
      point, reported as pending-unanswered).
  O-convo: convoTurn calls, with the pre-turn menu choice ids
      captured via convoGet — an offer point fires iff a menu
      contains a link/bond/covenant/alliance/primacy choice
      id, whatever the policy picks. talkTo/endConvo counts
      prove the conversation path was exercised at all.
  O-aid (NON-LINK, reported separately): answerAidOffer /
      answerAidBeg calls and pendingAidOffer / pendingAidBeg
      snapshots. Never counted toward S4.
  O-bid: bidForPrimacy calls.

A seed's attribution is complete only when its offer-point
table names, for each channel, calls + pending-ever + the
policy's choice (or "no call, no pending — channel never
entered").

## Method

- Policy: `scripts/policies/competent.js` `{competent}`
  VERBATIM, default env (COMPETENT_TALK unset, COMPETENT_WARM
  default on). No policy variants — this is a diag, not a lever.
- Seeds: 99101–99108, the gearbar band re-run on CURRENT
  master. Trajectories WILL drift with base moves since
  2026-11-03; cite only this run's numbers. Band-level
  pairing with standaccum-b, not trajectory-identical pairing.
- Horizon: 150 days, death-aware (dead villages stop
  simulating; +10d tail max as implemented by runDays).
  This diag IS the 8-seed pilot-scale run; no confirm follows
  in this run (per brief).
- Instrument (`scripts/linkseek-instrument-20261104.js`,
  derived from `scripts/diplo-instrument-20261104.js` VERBATIM
  for the shared snapshot fields, PLUS the additions below;
  zero src/js): daily snapshots of otherVillages (known/
  opinion/coords), scholar tile vs village tiles, travelTo
  calls and landings, propose*/study/tend/answer calls with
  returns, pendingCounter/Accord/National/Global/Raid/Aid
  state, hierarchy links via the game's own reads, standing
  breakdown, linkTotal (current) AND ever-formed link count
  (hierarchyState id diff — the precise ever-created
  instrument; standaccum-b's linkTotal was the current
  count per snapshot, consistent with ever-0 only jointly
  with daily snapshots, and this arm states the
  distinction rather than repeating the shorthand), plus:
  raidVillage/answerRaid/bidForPrimacy/answerAidOffer/
  answerAidBeg/talkTo/endConvo/convoTurn wraps (convoTurn
  captures the pre-turn menu via convoGet). The snapshot
  NEVER calls villageStandingTotal() or unlockedWave()
  (both side-effecting); ONE end-of-run unlockedWave() call
  is reported separately and never counted as a natural
  door-open.
- Say filter (TIGHT, per brief, plus the proven link lines):
  `Standing \d|FEAST|HELD|draft waits` plus the three
  link-formation narration patterns askplus-a proved the
  diplo regex misses (`bows|brings it home|Tribute:`) plus
  `Word will travel` (the opinion-broadcast line). Still
  excludes the pantry noise: no bare 'standing', no 'link'
  substring, no 'bond' substring. Cap 400 lines. The
  extension is pre-registered HERE, not added in-run.
- Sense-test: tight-filter say samples + offer-point menus
  read for coherence (do villagers ever talk about other
  villages as partners, rivals, or courtship targets?).
- Scale-wall numbers every run, AS OBSERVED BY THIS CORPUS
  (baseline observations, not wall-movement claims): wins,
  national/table (scaleRank), wave 4–5 unlocks and facings,
  median survival, readiness-5 days, death-cause shares.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run), death-aware horizons, pre-registration
  (this file), metric binding (§14), balanced panel (§15 —
  INAPPLICABLE for a pure diagnostic; stated explicitly,
  no comparison fabricated, none attached).

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. ONE named stall stage accounts for the zero-link outcome
   on at least 6 of 8 judged seeds (same critical-path stall
   stage per the rule above, with its offer-point / stall
   counts stated per seed).
2. Instrument errors 0 on all judged seeds.
Otherwise DIAG-NO-CANDIDATE. INSUFFICIENT-DATA only if > 2
seeds carry instrument errors or zero otherVillages at day 1.
A miss is NO-GO, never re-scored against a friendlier metric
mid-run. Metric problems go under "metric review" for the
NEXT run. (Note the diplo-b lesson applied here by
construction: judging by critical-path stall, not by
furthest stage, so opinion-noise variation between S1/S2
cannot split the verdict.)

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether daily snapshots, the
  critical-path stall rule, the offer-point taxonomy, and
  the tight say filter held up.
