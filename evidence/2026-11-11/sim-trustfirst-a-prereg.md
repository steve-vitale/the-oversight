# Trust + gossip — first numbers: pre-registration (arm sim-trustfirst-a)

Run fleshout-20261111T0815Z, Loop A. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit 7638d4bbf at writing; rebased onto explicit master
SHA 5bb3c595ab77d46898e45c7ef7ec20d68783a52d before this commit
landed (the first rebase attempt failed on the host write-denial
flap with `fatal: could not write to
'.../.git/worktrees/sim-trustfirst-a/rebase-merge/head-name':
Operation not permitted`; the stale rebase-merge state from that
killed attempt was removed per git's own instruction and the rebase
retried once writes cleared — infrastructure, not a conflict).
No judged sim has run on either base yet; the pilot runs on
5bb3c595a, recorded in the evidence.

## Canon

- docs/CANON.md read first. **There is NO dedicated trust/gossip
  canon doc in the CANON.md manifest.** The manifest lists
  docs/CONVERSATIONS.md for "dialogue, talk, gossip" — read in full:
  it covers conversation mechanics (threads, questions gated by
  trust, energy budgets, no-repeat ledger, favor actions) and
  records the talk economics ("Trust +3 on natural end (same 40-cap
  as before: words only go so far)") — but it contains NO gossip
  system section and the word "gossip" appears in it only inside
  code-adjacent asides, never as a designed mechanic. The operative
  canon line is in CANON.md itself: **"Trust ≠ reputation
  (break-it 2026-10-09): gossip/rumors move REP only, never
  trust."** Nothing is invented here; the code citations below are
  the source of truth. (Canon gap, recorded in the evidence:
  trust/gossip/reputation needs a canon doc the way travel has
  docs/MAP.md. CONVERSATIONS.md's gossip coverage is a section
  title, not a design.)
- **Four different numbers share the word "trust"** (all in
  src/js unless noted):
  1. **Villager trust** `state.village.trust[vid]` — that
     villager's trust OF the player/scholar. Default 10 when unset
     (game.js `bumpTrust` ~8300: `cur = v.trust[vid] === undefined
     ? 10 : v.trust[vid]`; same default everywhere, after the r1
     break-it fix that stopped `|| 10` resurrecting real 0s).
     Bands (`trustBand`, game.js ~29245): 0–10 hostile, 11–24
     distrustful, 25–49 wary, 50–74 friendly, 75–89 loyal, 90–100
     devoted. Moved by `bumpTrust(vid, n, reason)` (gains through
     `trustGainProgressive` — 0–50 full rate, 50–75 half, 75–90
     quarter, 90–100 one point at a time for acts ≥5; losses land
     whole; every move teles `tele('trust', {who, delta,
     reason})`), `_evTrustAll(n)` (game.js ~26736: every KNOWN
     villager's trust by n — gains progressive per villager,
     losses raw), `applyRep` drift (0.6× the rep delta, witness
     gated, progressive on gains), deed paths that write
     `trustGainProgressive` directly (giveFood, tend, care,
     convo-scene), and the conversation stipend (`endConvo`,
     conversation.js header ~58: 0 exchanges = none, 1–2 = +1,
     3+ = +3; talk-capped at 40; mood residue only after 3+
     exchanges in a SUBSTANTIVE conversation).
  2. **Village opinion** `ov.trust` — an OTHER village's trust of
     the scholar (betrayal.js, `ov` = an `otherVillages` record).
     Moved by `villageDeal` (split +5 gated on trust ≥20, refused
     split −3, tribute +8 for 2000 real kcal, threaten −15),
     `villageTalk` (+8 first sit / +4 after, +4 for teaching them
     something new; teaching breadth gated 10/30/60), `villageShareFood`
     (+10 for a 700 gift, +18 for ≥1500, +4 when their pot was
     empty, same-day repeats capped at +6), `joinVillageReal` (sets 5),
     `probationTick` (vote at 15+). Every one of these verbs also
     `seedGossip`s the act home (gift/visit/deal/threat).
  3. **Link trust** `link.trust` — inter-village LINK trust
     (hierarchy.js), 100-cap, moved through the `_trustGain`
     choke plus direct writers in comms.js / safetynets.js /
     titans.js. trustgrowth-b attributed 138/138 link-days on
     its band; this arm does NOT re-measure link-trust
     attribution — it reuses the trustgrowth instrument's
     link-trust capture as one column of the census and cites
     trustgrowth-b for the attribution result.
  4. **Reputation** `state.village.rep[vid]` — per-villager dims
     `{generous, brave, honest, competent}` (game.js `repOf`
     ~17756; `applyRep` also writes `trustworthy`/`kind` keys on
     some paths). Moved by `observe()` (witness lens:
     temperament/goal/target bend the dims; only witnesses see
     directly) and by `spreadGossip` secondhand (0.4 weight,
     `noTrust=true` — REP only, per canon). Read by `repWords` /
     `repTalkLines` (plain-language opinions, ±25/±30 bars) and
     by gossip-driven talk requests (`talkReason`: a villager who
     heard a negative rumor asks "People are saying things. About
     you. Is any of it true?").
- **Gossip engine** (game.js ~17909–18320):
  - `seedGossip(action, dims, heardBy, noTrust)` — dedupes per
    action+day-part; a gossip item is `{action, dims, heard[],
    distortion, day, partKey, noTrust}`. Seeded from actual
    witnesses only (`observe()`); no witnesses, no tale.
  - `spreadGossip()` — runs at every part change (game.js ~6681)
    and on travel steps (~13079): each hearer tells one
    non-hearer at a temperament rate (warm 0.65, base 0.35,
    prickly/withdrawn 0.12), preferring their own group mates;
    `distortion++` per hop; at distortion ≥2 a 45% chance the
    dims mutate ×1.6. Per hop it applies rep to the SUBJECT
    (`gossipActionDims` → `applyRep(repTarget, repDims, 0.4,
    true)` — REP only, never trust; subject-targeted gossip
    routes to the subject, player-action gossip routes to the
    hearer, player-subject gossip routes to hearers). Stories
    fade after ~3 days. A 15% trace chance per hop lets the
    subject trace a player rumor to the player (`bumpTrust −6/−2`
    + rep hit — the only trust cost gossip ever carries, and
    only when caught lying).
  - `spreadRumor(targetId, rumorType, firstHearerId)` — the
    player starts a rumor; seeded with the first hearer so it
    can travel; `noTrust: true` (the r6 farm fix: rumors move
    REP, not trust).
  - `talkReason` — gossip is an event source for NPC-initiated
    talk; `spreadMonsterNews` and `apVillageGossip` ride the
    same flow.
- **Trust gates — what trust ever DECIDES** (grep-verified
  2026-11-11): moot close line trust ≥40 (justice.js ~310, 560,
  633: "close" friends break the cold shoulder at a −10 trust
  cost; defenders at the exile mob are trust ≥60, justice.js
  ~792; mob attackers are lowest-trust-first, ~783); moot votes
  pay `bumpTrust ±6` (betrayal.js ~2049–2055); bond proposals
  read `trustOf(vid)` (bond-initiation.js ~117) and a declined
  proposal costs −1 (bond-initiation.js ~443); conversation
  questions are gated by `minTrust` (characterGen.json) and
  goal-share thresholds by temperament; `villageTalk` teaching
  breadth 10/30/60; commons split 20+; probation vote 15+;
  `aidFight` allies need trust ≥15 + earshot; the village meal
  halves below scholar trust 30 (the ledger/half-ration bind
  documented in sim-findings #153–157); `tendLink` is the
  +8/week link-trust verb (hierarchy.js ~1177).
- **Who calls the trust/gossip verbs under competent** (grep-verified
  2026-11-11): `scripts/policies/competent.js` runs ONE
  `talkRound` a day — `talkTo(vid)` then immediately
  `endConvo(vid, 'left')`, ZERO exchanges (competent.js ~657:
  "the trust stipend without the talk"). The held-conversation
  wedge `deepTalk` (up to two 5-turn sittings a day, answering
  questions, teaching, canon questions) is env-gated
  `COMPETENT_TALK=1`, DEFAULT OFF — so under default competent
  verbatim, the whole dialogue engine (wants, grief, teaching,
  gossip, canon questions) is unreachable BY CONSTRUCTION and
  the conversation stipend pays +0 (0 exchanges). `tendLink`
  is called by NO plain-competent path: the only policy callers
  are the `competent-answermail-a` and `competent-linkdrive-b`
  variants. `villageTalk` / `villageShareFood` / `villageDeal` /
  `spreadRumor` are app.js UI verbs (or drama) — no policy
  calls them. `observe()` / `seedGossip()` / `spreadGossip()`
  fire from game paths the policy DOES drive (giving food,
  fighting, fleeing, dying, moots, funerals) — so the gossip
  census under competent measures what the scholar's driven
  actions seed, not what villagers say to each other. That
  asymmetry IS one of the first numbers.
- **"Village trust +N" say lines** (game.js ~26983 +8 river
  trader feed, ~27000 +3 partial feed, ~27062 +2 river trade,
  ~27075 −3 rudeness, ~27190 +5 trial-by-talking, ~48171 +10
  life-debt; betrayal.js ~1107 −8 apprentice death): these lines
  describe `_evTrustAll` moves on the per-villager trust map
  (every KNOWN villager), NOT a separate aggregate — there is
  no scalar `village.trust` aggregate in code; `v.trust` is the
  per-villager map and the line's number is the REQUESTED amount
  while each villager's applied gain is progressive-scaled (a
  60-trust villager gains +4 on a "+8" line). The task brief's
  "sense finding #2068" could NOT be located as a finding: no
  `#2068` exists in `hidden_files/sim-findings.md` (2154 lines,
  searched 2026-11-11) or in any dated evidence file — the only
  "2068" hits are a betrayal.js gate-site number in an old
  role-audit and a hierarchy.js line in a gaps ledger. This arm
  therefore verifies the coherence question directly instead of
  citing a finding number: for every "trust" say line in the
  corpus, which of the four numbers it names, whether the
  printed number equals the applied move, and whether the two
  "trust" wordings (villager trust vs village opinion vs link
  trust) ever contradict each other in one village's story.
- Audit row: hidden_files/coverage-audit-20261110.md §4,
  Trust/gossip/reputation — **Partial**: base driver makes
  ZERO market/buy/sell calls in competent.js; "gossip" 4
  mentions; `analyze-gossipcensus-a`, `sweep-trust-r2–r7`
  (Oct); 5 trust tests; **no panel metric**.

## What the 5 trust tests + gossip census prove — and what they do NOT

The 5 trust tests (test-trustgain-20261014, test-trustdelta-20261015,
test-trustcensus-20261015, test-trustgrowth-b, test-trustdrift-voice
family + the r2–r7 sweeps) prove the verbs work when CALLED:
progressive gains, whole losses, the 40 talk cap, the r6
rumor-farm fix, link-trust attribution 138/138. The gossip
census (analyze-gossipcensus-a / scripts/test-gossipcensus-a.js /
scripts/gossipcensus-trace-a.js) proves gossip bursts can be
classified in transcripts on a bankfood road. None of them
measures whether trust or gossip ever HAPPENS in a lived village
under default competent play: no link-trust trajectories, no
per-villager trust trajectories, no gossip event counts, no
second-hearer reach, no rep moves that change anything observable,
no trust gate ever firing in sims. This arm measures exactly that,
on a plain competent band.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked
2026-11-11: the trust/gossip lines in the backlog are all
[fixed]/[killed]/[diagnosed]/[answered] — #153–157 ledger/trust,
#87 late-link trust lag, #131 formation-without-feeding — or
about other systems; no open line names this measurement.) Any
trust/gossip gap this arm surfaces is APPENDED as [open] in the
evidence file's findings section, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: trust/gossip verbs exist and are wired — `observe()`
   fires from policy-driven acts (give_food, fight, flee, talk,
   hoard, donate, comfort, amends, rally, mediate, promise,
   confront, murder, loot_corpse, theft); `seedGossip` is called
   from ~30 game paths; `spreadGossip` runs every part change.
   The pilot will confirm live counts in the corpus, not assume
   them. The conversation stipend is proven +0 under competent
   in the proof fixture (talkRound shape: open + immediate
   'left', 0 exchanges → no stipend); `deepTalk` is marked
   dead-under-default-env (COMPETENT_TALK unset). `tendLink`,
   `villageTalk`, `villageShareFood`, `villageDeal`,
   `spreadRumor`, `feedRiverTrader` are proven live in the
   fixture by direct calls and marked dead-under-competent
   (no policy caller) / dead-under-harness (drama stubbed).
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every trust write,
   every rep write, every gossip seed/spread, every trust-gated
   decision on the band. The engagement floor (GO table) is set
   from the pool's nature: if the band produces <5 trust events
   total, the census is uninterpretable, not a GO.
3. **Verb existence**: bumpTrust, _evTrustAll,
   trustGainProgressive, repOf, applyRep, observe, witnesses,
   seedGossip, spreadGossip, spreadRumor, gossipActionDims,
   endConvo, talkReason, mootQuorum, mootFriendVoice,
   mootAccuserAftermath, tendLink, _trustGain, villageTalk,
   villageDeal, villageShareFood, joinVillageReal, probationTick
   all exist in the engine (citations above). The policy calls
   almost none of the trust verbs directly — that asymmetry IS
   one of the first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling
   pilots' median survival 122.5–140d); trust is a whole-life
   question (link seasoning takes 30+ days, moots and funerals
   accumulate, gossip fades in 3 days so the window must be
   long enough to catch rare seeds). Same horizon as the
   siblings for comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of trust +
gossip in a lived village** — every trust write classified by
number (villager / opinion / link) and attributed source, every
rep write classified, every gossip seed classified by action and
seeder, every spread hop counted with teller → listener and
distortion, every trust-gated decision counted by gate and
outcome, every metric in the list below counted or explicitly
marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every trust write classified by number + source, none 'unattributed' | 0 unclassified trust writes across the pilot (villager-trust writes reconcile against the bumpTrust/_evTrustAll/applyRep/deed event log; link-trust writes reuse the trustgrowth reconciler — 0 residue) |
| Every gossip seed classified by action, none 'other' | 0 unclassified gossip seeds across the pilot |
| Every gossip spread hop classified (teller → listener), second-hearer reach measured | 0 hops with an unknown teller or listener; per-gossip max-hearers reported |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness / dead-under-default-env |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | ≥5 trust events band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Villager trust trajectories: per-villager `trust[vid]` at day 1 /
   30 / 60 / 90 / 120 / 150 (or death), start/end/min/max, band
   crossings (hostile/distrustful/wary/friendly/loyal/devoted),
   trust writes by source (bumpTrust reason, _evTrustAll, applyRep
   drift, deed direct, endConvo stipend, moot, bond-decline,
   trace-caught-lying, other) with requested vs applied amounts
   (progressive scaling visible or not).
2. Village opinion trajectories: `ov.trust` per other village at the
   same checkpoints, moves by verb (talk/deal/gift/join/probation)
   with requested vs applied, gates hit (split 20+, teaching
   10/30/60, probation vote 15+).
3. Link-trust trajectories: per-link `link.trust` daily snapshots
   (reused trustgrowth capture), end values, seasoned or not —
   cited, not re-attributed (trustgrowth-b 138/138).
4. Gossip events: seeds by action (theft/bully/give_food/death/
   deal/threat/visit/gift/exile/fled/cannibalism/drove_off/
   departure/rescue/other), seeder (observe vs direct call site),
   witnesses vs heard counts; spread hops (teller → listener,
   distortion at hop, mutated or not); per-gossip max hearers,
   second-hearer reach (does a rumor EVER reach a second
   villager?); stories alive per day; gossip lines the scholar
   overhears (fireside fragments, talkReason prompts).
5. Reputation moves: per-villager rep dims start/end, moves by
   source (observe direct vs gossip secondhand vs moot vs
   trace), rep words earned (±25/±30 bars crossed), and whether
   any rep move changed anything observable (a repTalkLine
   spoken, a talkReason fired, a decision changed).
6. Trust-gated decisions: every gate evaluation counted by gate
   (moot close ≥40, exile defenders ≥60, mob lowest-trust,
   bond-proposal trust read + outcome, convo-question minTrust,
   villageTalk breadth, commons split, probation vote,
   aidFight ≥15, meal half-ration <30, tendLink) with the
   outcome (fired / blocked / never evaluated).
7. Moot/justice trust effects: moots demanded/held, quorum and
   friend voices, votes and their ±6 trust moves, cold-shoulder
   breaks (−10), exile-mob composition by trust, funerals and
   their trust/gossip effects, if any occur.
8. Bond-proposal trust reads: proposals made (villager-initiated
   vs scholar-side), trustOf at proposal, accept/decline and
   the −1 decline cost, link-raise proposals and their trust
   reads, if any occur.
9. Say-line coherence (#2068 question, verified directly): every
   "trust" say line in the corpus classified by which of the
   four numbers it names; requested vs applied on "Village
   trust +N" lines (progressive scaling); any line whose number
   contradicts the live state it describes; village opinion vs
   link trust vs villager trust in one village's story.
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: trust is a whole-life question (link seasoning 30d+,
  moots/funerals accumulate, gossip fades in 3d); sibling
  first-numbers pilots (cookfirst-a, preserve-a, fishfirst-a,
  travelfirst-a, tradefirst-a) ran 150d with median survival
  122.5–140d, so 150d captures the full village life without
  ticking dead villages. Same horizon as the siblings for
  comparability.
- **Seeds: 190211–190218 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190211–190218:
    zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    word-boundary grep, one seed at a time): zero hits for all
    eight seeds.
  - Searched ALL dated evidence `.json`/`.json.gz` (ripgrep
    word-boundary): exactly ONE hit — seed 190218 as the VALUE
    of `"totalDraws": 190218` at line 7128 of
    evidence/2026-11-07/perseed-stageally-stab-b/stab-s53003-stab-staged-perturbed.json
    (a draw count in a seed-53003 corpus, not a seed naming).
    No seed is named as a seed anywhere; the band is fresh.
  - No perseed directory names any seed 190211–190218 (listing
    of evidence/ checked).
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked; only preregs matched
    "band" — same finding as the travelfirst/tradefirst preregs).
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` + full-tree word-boundary seed
    grep over evidence/*.md + ripgrep word-boundary over
    evidence/*.json + perseed directory names + goal hidden_files
    listing.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg). No COMPETENT_TALK, no other env gate — default
    competent is the measurement substrate.
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal +
    deaths only), same seeds — must match the instrumented control
    leg exactly on days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/trustfirst-instrument-20261111.js — wraps (record-only, never
alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game). REUSE: the
link-trust capture is imported from
scripts/trustgrowth-instrument-20261109.js (setter interception +
_trustGain wrap + daily link snapshots + seq) rather than
re-implemented; the trustgrowth cause classifier is reused for
link-trust events. New wraps in this file:
- bumpTrust: every call — vid, requested n, applied (after−before),
  reason, caller stack.
- _evTrustAll: every call — requested n, per-vid applied, caller stack.
- trustGainProgressive: every call — vid, base, scaled, current band
  (records the scaling law in action; read-only — returns the
  engine's own value).
- applyRep: every call — vid, dims, weight, noTrust, trustRippleTo,
  rep before/after, trust before/after (drift visible or not).
- observe: every call — action, opts (target/noTrust/noGossip),
  witness list, seeded-or-not.
- repOf: NOT wrapped (pure read, called in hot loops; snapshots
  read it directly).
- seedGossip: every call — action, dims, heardBy (ids), noTrust,
  dedupe-hit or new, caller stack.
- spreadGossip: every call — per gossip item: hops this call
  (teller → listener, distortion before/after, mutated dims or
  not, rep applied to whom), fragments said or gated, items
  expired.
- spreadRumor: every call — target, type, first hearer, result.
- gossipActionDims: every call — action/dims in, rep dims out.
- endConvo: every call — vid, exchanges, substantive?, stipend
  applied (before/after trust), reason ('left' vs natural end).
- talkTo: every call — vid (conversation opens; cross-check
  against endConvo for 0-exchange sittings).
- mootQuorum / mootFriendVoice / mootAccuserAftermath: every call —
  case id, quorum, voices, aftermath path (trust moves ride the
  bumpTrust wrap; these wraps classify the cause).
- tendLink / _trustGain: via the reused trustgrowth instrument
  (tend is a link-trust source; expected 0 under plain competent).
- villageTalk / villageDeal / villageShareFood / joinVillageReal /
  probationTick: every call — village, verb, trust before/after,
  result (all expected 0 under competent — proven live in the
  fixture, marked dead-under-competent).
- feedRiverTrader / tradeRiverTrader / snubRiverTrader /
  evRiverTrader: every call — result (all expected 0 under the
  harness; proven live in the fixture, marked
  dead-under-harness).
- Daily snapshot: per-villager trust (whole map), per-villager rep
  dims (whole map), per-villager trustBand, ov.trust per other
  village, link-trust snapshot (trustgrowth), gossip items alive
  (action/heard/distortion/day), groups, pantry kcal, roster
  size, deaths, standing, scaleRank, nationalLive, pending
  flags, moot/justice state summary, bond proposals/raises
  state summary.
Driver: scripts/trustfirst-driver-20261111.js (mirrors
tradefirst-driver; Game.say wrap with a trust/gossip regex for
the sense corpus, 200 lines/seed cap — same early-game-only
caveat as the siblings, narrowed regex so combat "trusted
hands" flavor does not eat the cap: trust|gossip|rumor|rep
word|they trust|village trust|word gets around|fragments by
the fire|people are saying|moot|cold shoulder|exile). Analyzer:
scripts/trustfirst-analyze-20261111.js (reuses the trustgrowth
cause classifier for link events; its own classifier for
villager-trust events from bumpTrust reason + caller stack, and
for gossip events from action + seeder stack). Proof:
scripts/test-trustfirst-a.js (each wrap proven live on a fixture
or miniature; RED checks on the pre-fix instrument where a wrap
is dead by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-fishstaff-b,
cookfirst-a, preserve-a, fishfirst-a, travelfirst-a, tradefirst-a).
The control/neutral legs are the neutrality proof, not a panel.
Panel context: **no panel metric for trust/gossip** (coverage
audit §4) — this arm supplies its first-numbers analogue
(Metrics 1–9).

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (tradefirst-a: to be read from its evidence;
fishfirst-a: median survival 122.5d, 7/8 village-lost, 650
deaths over 869 village-days). If the instrument changes any
numeric field vs the recorder-free baseline, the arm is NO-GO on
neutrality.

## Pre-run correction (before any judged sim — not a re-score)

- **Gossip-hop teller (GO row 3):** while building the instrument
  (2026-11-11, before the pilot), the engine was found to store NO
  per-hop teller — a gossip item keeps only the `heard` set and the
  `distortion` count (`spreadGossip`, game.js ~18100). An exact
  teller→listener pair is therefore unmeasurable without
  re-implementing the RNG stream, which the record-only instrument
  must not do. The GO row is corrected to: every spread hop
  classified by (gossip, new listener, distortion before/after,
  mutated-or-not, rep applied), 0 hops with an unknown listener;
  the teller is recorded as "a prior hearer", never invented. The
  census question "does a rumor ever reach a second villager?" is
  answered by heard-set growth, which the engine does store.
- **`joinVillage` → `joinVillageReal`:** the proof test caught
  that `joinVillage` is an app.js UI function (DOM-only, absent
  from the node load); the engine method is `joinVillageReal`
  (betrayal.js:2450). Instrument + prereg corrected before the
  pilot; the proof is green on the corrected name.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
