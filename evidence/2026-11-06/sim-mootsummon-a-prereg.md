# sim-mootsummon-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-mootsummon-a (Loop A, food-economy / narration).
Run: fleshout-20261106T0821Z, axis food-economy, arm sim-mootsummon-a.
Assignment: CENSUS / DIAGNOSIS ONLY — zero src/js, no behavior change.
Moot-turns-to-you summons still reach stranded scholars: measure the
rate, the response surface, and the resolution; NAME the fix for the
next run; do NOT build it.

Base HEAD at prereg time: b5fb49607 (branch sim-mootsummon-a,
2026-11-06 08:17:13 +0000). No single canon doc covers moots /
endDay delivery; the design lives in docs/CANON.md (read first — no
moot canon doc is registered there) and in the precedent evidence
below. No canon is invented here.

## Precedent (read, not re-measured)

- evidence/2026-11-05/sim-enddaybeats-fix-a.md (§7 + §1): the
  enddaybeats-fix enumeration found moot summons reaching stranded
  scholars in 2 windows on BOTH legs — before s46017 d14, s46018 d9;
  after the same seeds/days, unchanged (LEAVE beat). "The moot turns
  to you. Your vote matters here — and everyone will remember it."
  with no return-time vote surface — the scholar is summoned with no
  way to answer when they will be back. That enumeration is STALE on
  current master (GOSSIPCENSUS STALE finding) and is NEVER a baseline
  here; it is the question, not the answer.
- evidence/2026-11-05/sim-enddaybeats-a.md ("other" enumeration):
  1/17 stranded sleep windows carried a moot summons (17016-12,
  trial moot: "🔴 LIVE! THE MOOT!" + "Giuseppe calls the moot." +
  "The moot turns to you...").
- evidence/2026-11-05/sim-gossipcensus-a.md: the stranded-window
  instrument (strandnarr-a full-transcript recorder + sleep/upkeep
  window machinery), reused verbatim here.
- evidence/2026-11-05/sim-winnability-round-0030.md (0028Z
  coordinator evidence): wall picture consistent — wins
  lesser-only, full seat 0, wave-5 kills 0.

## The questions, precisely

(a) PRIMARY: at what rate do moot-turns-to-you summons fire inside
a stranded scholar's sleep window, vs the non-stranded sleep
baseline? (Windows holding >= 1 summons line / windows.)
(b) RESPONSE SURFACE: when the summons reaches a stranded scholar,
what can they do in response — is there any way to answer, defer,
or vote a return time? Answered by code read (the vote surfaces
below) PLUS observed resolution in the corpus (did any stranded
summons get answered before its backstop?).
(c) RESOLUTION: what happens to the moot — does it proceed without
them, wait, or resolve against them? Observed per summons over the
following 3 loop-days (backstop line? verdict-count line? vote-cast
line? scholar's return to Haven before the backstop?).
(d) VERBATIM: every stranded-window summons quoted verbatim with
its full sleep window read (SENSE-TESTING LAW).

## Code facts (read, not assumed — verified by grep/read on base b5fb49607)

Two sites say the summons line, and they are DIFFERENT moots:

1. TRIAL moot — betrayal.js conductTrial (~1932): `if
   (t.playerVoter) { say("The moot turns to you. Your vote matters
   here — and everyone will remember it."); c.trial.awaitingPlayerVote
   = true; return { awaitingPlayerVote: true, ... }; }`.
   tallyVotes (~1854): `playerVoter = !exiled && !accused.includes
   (villagerId) && (playerConvened ? true : R() < 0.9)` — position-
   blind except exile. No scholarAtHaven check anywhere in the
   path. Convened autonomously by npcMootTick / playerCaseTick via
   callMoot (~1548) inside betrayalDailyFull, which rides the day
   boundary — so a trial moot CAN be convened (and its summons said)
   inside a stranded scholar's sleep window. Preceding lines in the
   window identify it: "🔴 LIVE! THE MOOT! ..." (sysSay, ~1583) and
   "<X> calls the moot. ..." (~1592).
2. PETITION moot — villageAgency.js conductPetitionMoot (~802):
   `playerVoter = !(scholar.exiled)`; if playerVoter, the same
   summons line, `pet.awaitingPlayerVote = true`. Called ONLY from
   app.js:16918 (the player pressing "Call a moot" in the Haven
   petition panel) — player-initiated, synchronous. A petition
   summons therefore CANNOT fire inside a stranded sleep window by
   construction (the scholar must be present to call it); the
   census verifies this empirically (kind classification below).
   Preceding line: "You call a moot on it. ...".

Vote surfaces (question (b), code read):

- TRIAL vote: conversation choices only — betrayal.js ~4645-4646:
  `vote_guilty` / `vote_acquit` offered in convoChoices while
  `cs.trial.awaitingPlayerVote`, casting via castPlayerVote (~1939),
  which finishes with "Counted." / "GUILTY." / "NOT GUILTY.".
  Conversation requires talking to a villager at the fire; a
  stranded scholar cannot reach one. NO defer, NO return-time vote,
  NO remote vote exists anywhere in the trial path (whole-file grep
  for vote surfaces: only the convoChoices pair).
- PETITION vote: Haven-panel buttons only — app.js ~320:
  `pet:vote:accept` / `pet:vote:reject` rendered when
  `pp.awaitingPlayerVote`, answered via answerPetition (~811).
  The panel is the Haven panel; no defer, no return-time vote.
- The exiled precedent (castPlayerVote ~1943): "The moot doesn't
  wait for the exiled. The count is taken without you." — the moot
  proceeds without an absent scholar, said aloud. The trial
  backstop (trialVoteTick, betrayal.js ~5526-5540, runs in
  betrayalDailyFull): after 2 days of silence, awaitingPlayerVote
  is cleared, playerVoter set false (the scholar leaves the
  denominator too), "The moot doesn't wait forever. Two days of
  silence from the fire's edge — the count is taken without you."
  is said, and finishTrial(c, 0) resolves the case. So a trial
  moot summoned while stranded resolves WITHOUT the scholar at
  most 2 days later, and the scholar's uncast vote counts as
  nothing (not even an acquit: playerVoter=false removes them
  from the count). The verdict lines to watch for: "The fire is
  built high. ..." + "<X> counts on their fingers ... \"N for
  guilty. M against.\"" + "Guilty." / "Not guilty — this time."
  (finishTrial ~1990-2040).
- PETITION moot: NO backstop found anywhere (villageAgencyDaily
  ~183 turns away only petitions with !vote && !awaitingPlayerVote
  after 3 days; a petition AT awaitingPlayerVote waits). A
  petition summons is player-convened, so the stranded case
  cannot arise there — but if the corpus shows one, that is a
  finding in itself (it would mean the bot convened a moot while
  away, or the window label misfired).

Sim limitation (disclosed in advance): the census policy stack
does NOT set COMPETENT_TALK, so the bot's talkRound opens a
conversation and walks straight out (competent.js ~653-670,
endConvo 'left', zero exchanges) — no conversation choice is
ever picked, so NO trial vote is ever cast in sims, stranded or
not. The resolution observed in the corpus is therefore the
backstop (or a return followed by silence until the backstop),
in BOTH legs. Question (b) is answered by the code read above
(the surfaces exist only at the fire) plus the observed
backstop; the sim cannot show a player voting. The census does
NOT claim a stranded scholar "loses their vote" by sim behavior
alone — it measures the summons rate and the backstop
resolution, and the vote-loss follows from the code read (the
2-day backstop clears awaitingPlayerVote before any stranded
scholar could return and converse, unless they return within
2 days — which the per-summons follow-up records).

## Primary metric

Stranded sleep rate vs non-stranded sleep rate (windows holding
>= 1 moot-turns-to-you line / windows). Upkeep reported as a
mechanism check only (expected 0 — no moot machinery runs inside
a competentEat upkeep call). Kind split per summons (trial vs
petition, by context lines in the window). Mid-window-return
rule (adopted from the enddaybeats-fix metric review, item 1):
a hit is judged by the scholar's position AT FIRING TIME — a
summons line preceded in the same window by a "You walk back
into Haven" return line is POST-RETURN, not stranded, and is
counted separately (strict window-label count stated alongside).

- POWER BAR (pre-registered): >= 20 stranded sleep windows
  observed across >= 4 stranding seeds (pooled pilot + screen +
  extension if triggered). If the bar fails, the verdict is
  INSUFFICIENT-DATA, never re-scored.
- VERDICT RULE (pre-registered): DIAG-GO iff the census is
  powered AND questions (a)–(d) are all answered (stranded rate
  vs baseline with denominators, kind split, response surface
  from code read + observed resolutions, every stranded hit
  quoted verbatim). The rate itself decides the DEFECT verdict,
  not the DIAG verdict: stranded rate ≈ non-stranded rate (or
  above) = the summons is position-blind (defect confirmed, fix
  named); stranded rate 0 with a live non-stranded rate = the
  summons is already gated (no defect — report it as such).
  Either way the census is DIAG-GO when powered. A residual
  question left unanswered (e.g. a summons whose resolution
  cannot be traced) is named in the evidence, not hidden.
- SENSE TEST (SENSE-TESTING LAW): every stranded-window summons
  is quoted verbatim with its full sleep window read; per hit:
  reads-true / still-wrong, with the reason (the scholar is
  asleep miles from the fire and cannot vote; the line promises
  "everyone will remember it" for a vote that will never be
  cast).

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (same substrate as the census family;
  dead villages stop simulating, so 60 is a cap, not a sentence).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over
  competent, env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1 (the census leg, verbatim). COMPETENT_TALK unset
  (default OFF — see the sim limitation above).
- PILOT (8 seeds, judged first, before any confirm spend):
  48001–48008. Expected from the census-family rate (~0.55
  stranded windows/seed): ~4–5 stranded windows — the pilot is
  expected to MISS the power bar by construction and trigger the
  pre-registered screen below. The pilot is still judged (its
  incidence is reported, not hidden).
- SCREEN / CONFIRM (pre-registered, runs ONLY after the pilot):
  the same driver over 48009–48040 (32 fresh seeds). Every seed
  in the band runs, stranding or not, so the screen cannot
  inflate the rate by selection.
- EXTENSION RULE (pre-registered): if the pooled pilot+screen
  stranded windows are < 20 (or < 4 stranding seeds), extend with
  48065–48088 (24 fresh seeds, verified fresh below) and re-pool.
  No cherry-picking, no other seeds.
- SEQUENCING: (1) prereg commit; (2) instrument + proof commit
  (no src/js); (3) pilot → judge; (4) screen; (5) extension only
  if the bar fails; (6) evidence. Single-leg census (no before/
  after — there is no fix in this arm, and the 46001–46040 corpus
  is STALE on current master and is never treated as a baseline).
- BALANCED PANEL (§15): not run — this is a narration census on
  current master with zero game-code change; there is no
  before/after to compare. The panel is the instrument for
  before/after comparisons, and this arm has none.

## Band freshness (verified BEFORE any judged sim)

Fresh band 48001–48040 (pilot + screen), extension 48065–48088.
Search scope and result (whole-token grep, run 2026-11-06 ~08:30Z):

- ALL dated preregs (evidence/*/sim-*-prereg.md): ZERO 48xxx
  tokens of any kind.
- ALL evidence .md (evidence/ --include='*.md'): ZERO tokens in
  48001–48040 and ZERO in 48065–48088. The 48xxx tokens present
  (48120, 48130, 48137, 48271, 48530, 48605, 48632, 48772, 48986,
  48988) are all outside both ranges. 48045 occurs once, in
  evidence/2026-11-01/sim-shelling-b.md:85 — as a SUMMED KCAL
  measurement value (the BAND row's baseUnload total), not a
  seed-band naming (that arm's seeds are 514xx). It falls in the
  originally-considered extension 48041–48064, so the extension
  was shifted to 48065–48088 to avoid even the appearance of a
  collision.
- sim-findings.md: ZERO 48xxx tokens.
- scripts/*.js + docs/: ZERO tokens in 48001–48040 or
  48065–48088 (48000 in scripts/test-poolscholar-b.js is outside
  both ranges; 48902 likewise).
- Goal hidden_files: 48xxx tokens occur only inside archived
  October per-seed JSON corpora as measurement values (e.g.
  pantry kcal), never as seed-band namings — same class as the
  enddaybeats-fix §10 note; raw JSON corpora were never in the
  naming scope.
- Sibling arm sim-lingergorge-a band 47001–47040: NOT used (its
  band is named in evidence/2026-11-06/sim-spandraw-census-a-prereg.md
  — a different arm; no overlap with 48001–48040).
- Forbidden-band lists (99201–99248, named in the 2026-11-04
  preregs sim-standacc-b, sim-diplo-b, sim-tendfloor-guard-b,
  sim-tendbelow-b): the band does not touch them.
- OUT-OF-SCOPE note: whole-token 48xxx values DO occur inside
  archived October per-seed JSON corpora (goal hidden_files/) as
  measurement values, not seed-band namings; the filenames there
  carry their own seeds, none 48xxx. No collision in scope; the
  band stands.

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood evening
records, morning records, first-upkeep kcal series, and daily-entry
scholar kcal must be identical. Any divergence = instrument
contamination; the run stops and the instrument is fixed first.
The driver adds no new state edit beyond the census markers; the
det-gate covers the whole driver.

## Anchor reproduction (judged in the proof test, before the pilot)

- 17021 CURRENT-SUBSTRATE FACTS (verify — do not assume): the
  enddaybeats-a re-pin says 17021 is 60d SURVIVED, 0 stranded
  nights on its master. The proof test asserts the mootsummon
  driver reproduces 17021's current-substrate daysAlive and
  stranded-night count on THIS master (b5fb49607). If it does not
  match the re-pin, that is reported as a finding (substrate
  drift), not silently re-anchored — the proof is revised to pin
  the measured facts with the drift documented.
- 15003 loop-day-7 gossip anchor (strandnarr-a §2): the proof
  test asserts the driver captures a `Word gets around the haven`
  line inside the loop-day-7 sleep window on seed 15003,
  classified non-stranded sleep with the scholar inside Haven.
  (Gossip mechanism anchor — proves the window machinery is live
  on this master; the moot itself has no stable single-seed
  anchor, moots being rarer than gossip bursts.)
- The 46017 d14 / 46018 d9 summons are NOT proof anchors: that
  corpus is stale on current master. Stranded windows are
  established by the pilot+screen itself.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA per the rules above, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file with a revision proposed for
the NEXT run. Every evidence file carries a "metric review" section.

## Wall numbers (carried, NOT re-measured)

This is a narration census corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24. Consistent with the 0028Z round
(evidence/2026-11-05/sim-winnability-round-0030.md): wins
lesser-only, full seat 0, wave-5 kills 0.

## Deliverables

- evidence/2026-11-06/sim-mootsummon-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-06/sim-mootsummon-a.md (verdict, rates with
  denominators, kind split, response surface + resolutions, every
  stranded-window hit quoted verbatim, sense verdict per hit, the
  named fix for the next run, metric review, wall numbers)
- evidence/2026-11-06/sim-mootsummon-a-corpus/ (per-seed JSON:
  judged windows + every classified line + per-loop-day counts;
  stranded sleep windows kept in full transcript; per-summons
  3-day follow-up)
- scripts/policies/mootsummon-diag.js (classifiers ONLY — summons,
  moot-call, backstop, verdict-count, vote-cast, return line;
  kind classification by context) on top of the judged
  strandnarr-diag recorder (reused verbatim, no changes)
- scripts/mootsummon-trace-a.js (driver: the enddaybeats-trace-a
  driver with ONLY the disclosed changes — OUTDIR/prefix for the
  moot corpus, moot analysis + per-summons follow-up)
- scripts/test-mootsummon-a.js (proof: unit classifiers + kind
  classification + follow-up tracking + det-gate + anchors)
- Zero src/js. Zero game-code change. No push, no bump, no live
  verification (coordinator merges; ship loop owns deploys).
