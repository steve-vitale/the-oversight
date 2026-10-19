# Journey social r26 — "you've probably heard" reframe + full-run social arcs (2026-10-18, lane B)

## Stale-lock recovery
Prior run (run_id 2026-10-19T01:55:44Z) died ~54 min after registering
journey2-social, heartbeat 54 min stale — DEAD per the overlap guard. Lock
deleted, tree adopted by this run (same loop, same leg). Pilot outputs were
complete (both seeds written 02:05); the run note was never filled in.
Adopted run_id: 2026-10-19T02:56:43Z.

## Pre-registration (written before the pilot ran)
- **Leg question**: when the day's news is re-asked across villagers (or the
  same event stays live across sittings) and EVERY lately candidate line is
  run-ledger-blocked, does the engine reframe honestly ("you've probably
  heard...") with the villager's own take — or strand the player in dry
  deflections?
- **Interesting-finding bar**: an `ask:lately` (or `alive:event` show) ask
  whose NPC reply is deflection-class/dry while the news was already broken
  by another villager; or the reframe firing but parroting a blocked line
  verbatim / fabricating content.
- **Binding (pilot)**:
  - L1 reframe-opportunity: >=1 lately-ask where ALL filled candidates are
    emission-blocked (convoWouldBlock) and the emitted NPC line is
    deflection-class or exhausted-pool -> gap real -> fix.
  - L2 reframe-honesty: >=1 lately-ask producing a verbatim repeat of a
    ledger-blocked line, or a "you've probably heard" line that names an
    event that never happened / contradicts canon (wrong disease name,
    wrong corpse list) -> fix.
  - L3 social-arc (full-run horizon): moots, gossip, bond deepening,
    friendships/rivalries over 140d — if any counter is ~0 across seeds,
    investigate (social content must persist into the late run).
  - Any GO -> the gap is real -> fix. All miss -> document and move on.
- **Rate metric** (r25 proposal, adopted): dry NPC lines (deflection +
  exhausted) per 12 NPC turns, pilot-wide.
- **Seeds**: 1901, 1902 (fresh). Horizon DAYCAP=140, death-aware (+10d tail).
  Policy: 'deep' driver (answer questions, 'more' to exhaustion, fresh
  topics, reacts, leave last) + favoritism wrapper (2 favorites kind,
  2 outsiders hostile/theft every 5d), inherited from r24/r25.
- **Planned fix** (queued from r25, to be written only if L1 fires):
  "you've probably heard" framing in the lately machinery
  (`convoTopics.js topic2Ask`): when all filled lately candidates are
  emission-blocked, compose a reframe from the (gated) event noun +
  the villager's own identity-generated take — fresh per villager, never a
  ledger exemption. Not a lemma change: the ledger keeps doing its job.

## Pilot results (re-run with corrected L3 keys — see Metric review)

seed 1901: days=142 convos=47 (deep=7) lately=2 alive=4 dryRate=1.75/12
  L1 reframe-opportunities: 0
  L3 social-arc: bonds=92 deepBonds=26 betrayalCases=15 moots=0 gossipConvos=0 avgTrust=74.3
  regression: P1-streaks=0 P2-reactDry=0
seed 1902: days=142 convos=105 (deep=69) lately=22 alive=7 dryRate=1.39/12
  L1 reframe-opportunities: 0
  L3 social-arc: bonds=55 deepBonds=27 betrayalCases=19 moots=0 gossipConvos=0 avgTrust=51.9
  regression: P1-streaks=0 P2-reactDry=3

- **L1: MISS (0/2 seeds).** The queued "you've probably heard" reframe fix
  is NOT warranted — never re-scored. Documented, moving on.
- **L2: MISS.** No ledger-blocked verbatim repeats, no canon contradictions
  in lately lines.
- **L3: bonds and betrayal cases are alive** (55–92 bonds, 26–27 deep,
  15–19 cases over 140d — the social graph forms and conflicts fire).
  moots=0 and gossipConvos=0 were investigated (see below) — both are
  driver artifacts, and both systems were probe-verified reachable.
- dryRate 1.75 / 1.39 per 12 NPC turns (informational; no threshold was
  pre-registered). P2 reactDry=3 in s1902 (down from r25's watch level —
  the samples are "lost my train of thought" deflections after repeat
  questions, honest dryness, not a gap).

## Fix

Four dialogue-truth fixes, each with a RED->GREEN proof test
(`scripts/test-*-20261018.js`):

1. **Doubt third-person self-reference** (`src/js/truth.js`:
   `confrontSecondPerson`, called in `confrontWindup`). Doubts are voiced
   TO their subject (confront menu only offers `getDoubts(vid)`), but
   observation texts are journal-voice third person. Transcript-caught:
   "I've been watching, Elijah. Elijah has been suddenly warm toward
   you — and there's a new something in their pack." Now: "I've been
   watching, Elijah. You've been suddenly warm toward me — and there's a
   new something in your pack." Ordered rules: (1) journal-voice player
   "you" -> I/me/my first; (2) subject name forms -> you/your;
   (2b) stale pre-knowledge descriptors ("the person in their 60s...")
   -> you (doubt texts bake whoTag at creation; the name can become
   known before voicing); (3) subject they/their -> you/your.
   Covers the whole current doubt corpus (bribe trace, wavered,
   their-story, confessed, accusation, contradiction/gossip variants).
   Proof: `scripts/test-doubt-secondperson-20261018.js` — 6/6 GREEN.

2. **Lately verbatim repeat** (`src/js/convoTopics.js`: `t2pick` no longer
   falls back to `pool[0]`). Root cause: `t2pick`'s `|| pool[0]` defeated
   the no-repeat ledger — single-line pools (gratitude) re-served the
   verbatim line on re-ask instead of letting `topic2Ask`'s honest
   exhausted-pool fallback fire. Transcript-caught (s1902-deep-1-Asiri):
   "What's going on out there?" got the ack "Huh. I answered that once"
   + the verbatim same "Someone helped me recently..." seconds after
   "What's new with you?" got it. Now the second ask gets "That's...
   yeah, that's everything I've got on that." `t2changeLine` keeps its
   ack-cycling via an explicit local fallback (acks are delivery, not
   content). Proof: `scripts/test-lately-norepeat-20261018.js` — GREEN.
   NOTE: this is adjacent to L2's spirit (verbatim repeat) but the
   repeated line was NOT ledger-blocked — it was a pool-exhaustion
   fallback bug, a distinct root cause. L2's binding stands as scored.

3. **Confront transcript double-push** (`src/js/truth.js`: confront wrapper).
   The wrapper pushed `r.line` to `c.transcript` AND called
   `sayLine(vid, r.line)` — which pushes it again. Transcript-caught
   (s1902-late-d106-Elijah): "Wait, wait —" twice back-to-back, verbatim.
   Removed the manual push; sayLine owns the record (chunked, like every
   other path). Proof: `scripts/test-confront-nodouble-20261018.js` —
   GREEN.

4. **Others-pronoun agreement** (`src/js/convoTopics.js`: `t2fol_others`).
   The "was a {occupation}, before" line hardcoded "the way they handle
   things" — wrong for she/he villagers. Transcript-caught
   (s1902-deep-2): "Camila was a police officer, before. You can still
   see it — the way they handle things." Now uses `t2pro(ovp, oid)`:
   "the way she handles things". Proof:
   `scripts/test-others-pronoun-20261018.js` — GREEN (she + he).

Regressions: green-list truth (3), lately (1), confront (3), conversation
(2), doubt (1), gossip — all pass. (social-batch check pending at commit
time; see below.)

## Village assessment (plain words)

Two villages, 140 days each, same policy, wildly different fates — the
sim is telling us about early-game fragility, not late-game society.

**Seed 1901 — the hollow village.** 14 of 18 dead by day 142; 4 left
standing. Deaths came in waves: Ursula Rosen and Fritz Bailey (days
12/17 — likely the player's day-2 favorites, which is why only 7 deep
conversations happened all run), then a long bleed from day 41 to 130.
And yet: 92 bonds formed, 26 of them deep, 15 betrayal cases, average
trust 74.3 among the living. The four who remain are close — a small,
tight, grieving fire. The social graph did its job; the food/attrition
didn't.

**Seed 1902 — the bruised village.** 7 of ~14 dead, 7 alive at day 142.
69 deep conversations, 22 lately-asks, 55 bonds (27 deep), 19 betrayal
cases, trust 51.9 — lower trust, more conflict, more talk. Elijah is
still there at day 106, nursing a favor from 12 days back and a bribe
trace in his pack. Asiri is stockpiling where nobody looks and sharing
anyway. A man in his 60s is keeping the boiled-water plan alive while 3
are down with a wringing-out sickness.

What's missing: neither village held a moot (the driver never convenes
one — 15–19 cases sat without trial), and nobody gossiped (the driver
never picks ask:gossip). The social *capacity* is proven; the social
*institutions* went unexercised by the bot. A real player convening moots
and gossiping is untested by this policy — flagged for the next run's
driver, not a game gap (both probe-verified reachable).

## People check (sense-testing law — full transcripts read)

Read all 5 transcripts end to end. Verdict: villagers talk like people
with inner lives — trap lines, stockpiles, theories that are "just fear
with better lighting," the sick row nobody says out loud. Four
senselessness bugs found and fixed (see Fix §1–4). Remaining observations
(not fixed — judgment calls):

- s1902-late-d106-Elijah ends in a derail: after a good confrontation
  ("Fair enough. I'd rather hear that than a confident lie."), the
  exchange collapses into "...Actually, forget it." / "...Where was I?
  Gone. Ask me something else." The 'clears' pool cycled into its
  give-up lines. Honest, but two give-ups in a row reads as the engine
  shrugging. Worth a pool tune, not a bug.
- s1901-deep-2 ends on "Sorry, lost my train of thought." / "Hm. Never
  mind — go on." after "What's going on out there?" is asked twice.
  That's the repeat-question deflection — honest dryness, and the r26
  lately fix now routes the *content* repeat to the exhausted line
  instead of parroting.
- Gossip beat ("People are keeping to themselves.") is thin but true —
  the engine declined to invent gossip when there was none. Good
  discipline; richer gossip wants more village state to chew on.

No fabricated shared history found. No filler loops (the old
bribeDigMissLine verbatim x6-8 class is gone). No static menus.

## Reachable / fun / winnable (social leg)

- **Reachable**: yes. Bonds form on their own (55–92/run); betrayal cases
  fire (15–19/run); moots convene end-to-end (probe: callMoot ->
  conductTrial -> castPlayerVote -> acquitted); gossip asks, threads, and
  beats (probe: ask:gossip in menu at trust>=20 -> thread='gossip' ->
  sensible beat). The lately re-ask path now degrades honestly instead
  of parroting.
- **Fun**: the transcripts are the evidence — Asiri's laugh, the 60s
  man's boiled-water plan, Elijah's favor ledger. The fixes remove four
  immersion breaks a real player would have felt.
- **Winnable**: not this leg's question (legs 4/7 own the win), but both
  villages survived to day 142 with social fabric intact — the social
  layer doesn't collapse under attrition.

## Metric review (§14)

1. **L3 counters read the wrong state keys.** The pilot as written measured
   `Game.state.bonds` and `Game.state.betrayal.cases` — both always empty.
   Bonds live at `Game.state.village.bonds`, cases at
   `Game.state.village.betrayal.cases`. The original pilot reported
   bonds=0/cases=0/moots=0 — a pure instrumentation artifact that looked
   like "the social graph never forms." Fixed in
   `scripts/journey-social-r26-pilot-20261018.js`, pilot re-run, numbers
   above. **Proposed revision for the next run**: the L3 counter block
   gets a self-test — assert `Object.keys(village.bonds).length` can be
   nonzero on a 10-day smoke seed before the full run, so a key regression
   fails fast instead of reporting phantom zeros.
2. **L2's binding missed the unblocked-repeat class.** L2 only counted
   verbatim repeats of *ledger-blocked* lines. The Asiri repeat was a
   *pool-exhaustion* repeat (never blocked, just re-served) — same player
   pain, different root cause, invisible to the binding. **Proposed
   revision**: L2' = any verbatim content-line repeat within one
   conversation, regardless of ledger state.
3. **The pilot policy doesn't exercise moots or gossip.** moots=0 and
   gossipConvos=0 were driver artifacts (never convened / never picked),
   and the moot counter checked flags (`c.moot`/`c.mootHeld`) that are
   never set — the real marker is `c.trial`. **Proposed revision**: next
   social pilot convenes ≥1 moot when a case is open (via the player
   path) and forces ≥3 ask:gossip picks; moot counter reads `c.trial`.
4. L1's question ("you've probably heard" reframe) remains open as a
   design idea but the pilot found zero opportunities in 152
   conversations — the ledger is doing its job. Not worth building
   against a non-finding.

## Regressions

- Green-list: truth (3/3), lately (1/1), confront (3/3), conversation
  (2/2), doubt (1/1), gossip (11/11) — pass.
- `check.js --only social`: 46 pass, 3 fail — **all three verified
  PRE-EXISTING, not regressions**: I saved my diff as a patch, reverted
  `src/js/truth.js` + `src/js/convoTopics.js` to pristine HEAD
  (2b2d37230), and all three failed identically there; patch re-applied,
  4 proof tests re-verified GREEN after restore. The failures:
  1. `test-social-animals-20261008.js` — "all 52 behaviors have a cue"
     (animal cue coverage; untouched by this run's files).
  2. `test-social-play-20261008.js` — "liars: more than one branch of
     human behavior seen" (1/76 assertions).
  3. `test-socialite-r8-deadends.js` — "S1 no stranded menus"
     (menu offered gq:open/agree/silence with no leave).
  These were failing on master before this run — flagged for the fleet,
  not quarantined (not this run's breakage).
- 4 new proof tests, all GREEN (see Fix).

## Telemetry

Deviation check (`scripts/telemetry-check.js`) — first corrected-baseline
run for the social leg: baselines were seeded from the artifact-zero
pilot, so this run *is* the baseline reset. Per-leg key metrics for the
next run: bonds/run, deepBonds/run, betrayalCases/run, mootsConvened/run
(new counter), gossipConvos/run (driver-forced), dryRate/12, L1 count.
