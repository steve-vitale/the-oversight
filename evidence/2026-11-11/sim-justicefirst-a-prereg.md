# Justice + moots — first numbers: pre-registration (arm sim-justicefirst-a)

Run fleshout-20261111T1115Z, Loop A. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit b09cf584e (branch rebased onto explicit master SHA
b09cf584e before any sim; zero local commits, trivial fast-forward).
No judged sim has run on this base yet; the pilot runs on b09cf584e,
recorded in the evidence.

## Canon

- docs/CANON.md read first. **There is NO dedicated justice/moot
  canon doc in the CANON.md manifest.** No docs/ file covers moots,
  justice, disputes, or exile (checked the full docs/ listing:
  CORRUPTION, VISION, DESIGN, DIRECTIVES, DISEASES, BEAR,
  PRESERVATION, MONSTER-WAVES, CONTESTS, CONVERSATIONS, PARTY,
  SYSTEMS, BALANCING, TIME-ECONOMY, KIN, MAP, FANS,
  ABILITY-REFUSALS, ALIEN-PLAYERS — none of them is a justice doc).
  The operative canon is the code's own headers, which this arm
  treats as the source of truth and does not invent beyond:
  - src/js/justice.js header: "Two systems, one file: (1) VILLAGE
    JUSTICE — antisocial behavior escalates along ONE ladder. The
    village doesn't just lower a trust number; it goes quiet (cold
    shoulder), confronts you (restitution or else), and then goes
    formal: the moot in betrayal.js is the single formal resolution
    — no parallel exile vote, no double jeopardy. While the moot
    has you, the ladder freezes; nobody gets mobbed mid-trial.
    Exile is enforced, defiance ends in the uprising. Every stage
    is earned, visible in advance, and has an amends path — until
    there isn't one."
  - justice.js ontology block: one_ladder (cold shoulder ->
    confrontation -> moot -> uprising; the moot is the ONE formal
    track), confrontation_first (heat 50+ holds the formal track
    until the ladder demands the moot — refusal, silence-timeout,
    or heat 70+), refused_payment_not_taken, judged_heat_halved
    (judged crimes count half heat — no double jeopardy),
    summons_voice (the moot demand is generated from the
    confronter's identity + the strongest witnessed crime + why
    it's happening now; never names unwitnessed crimes),
    accuser_aftermath (the verdict moves the accuser's standing
    too — weak cases cost them, held cases earn them respect).
  - betrayal.js mootQuorum comment (blitz-succession 2026-10-13,
    Steve's exact spec): "a binding moot requires a quorum of MORE
    THAN HALF of living villagers present. Below quorum the moot
    may still meet and talk, but it cannot render binding verdicts
    (exile/conviction) — any verdict is advisory only, clearly
    marked as such in the fiction."
  - betrayal.js §13 header (symmetric jeopardy, Steve: "obviously
    a player should have to face the judge. Exile is a real
    risk."): player crimes become prosecutable cases; the trial
    runs the SAME machinery from the other side.
  - docs/CORRUPTION.md (read for the cannibalism charge only):
    "Healthy village → exile. ... Exile, not a trust hit" — the
    cannibalism conviction norms to exile, not weregild.
- (Canon gap, recorded in the evidence: justice/moot needs a
  canon doc the way diseases have docs/DISEASES.md. The ladder,
  the quorum spec, and the sentence ladder currently live only in
  code comments.)

## What the existing justice/moot tests prove — and what they do NOT

The justice tests (test-moot-convene-repeat-20261022.js,
test-moot-juror-trust-20261014.js, plus the moot-adjacent
test-mootgate coverage in sim-mootgate-a, test-feastconv-b.js
moot lines, and the 5 justice tests the audit counts) prove the
verbs work when CALLED: a moot convenes, votes tally, quorum
binds or advises, the backstop resolves a silent vote, the
accuser's trust moves on the verdict. The prior sim arms
(sim-mootgate-a, sim-mootsummon-a, Nov 6–7) proved the convening
gate (mootConveneHeld: stranded summons 0/22 after the fix) and
the backstop (52/56 moots resolved via the 2-day backstop before
the gate). None of them measures whether justice or moots ever
HAPPEN in a lived village under default competent play: no crime
counts by type, no ladder-stage counts, no case-open rate by
path, no moot trigger/quorum/verdict rates, no sentence
distribution, no trust actually moved by moots, no exile lived
through. This arm measures exactly that, on a plain competent
band.

## Backlog claim

Two open sim-findings.md lines name this arm's census directly
(checked 2026-11-11):
- [open] 2026-11-09 — social / moots — MOOTS BARELY FIRE (1/4
  villages, 378 village-days) (Lane B r163 social,
  evidence/2026-11-09/journey-social-life-r163.md § M9).
- [open] 2026-11-11 — moot — moot vote trust moves (±6) are
  player-gated; the scholar never votes under competent, so 43
  quorate moots move 0 trust (sim-trustfirst-a).
Neither line is claimed by this arm mid-run (they are the
census's subject, not a lever to build); this arm's numbers
speak to both, and any new gap it surfaces is APPENDED as
[open] in the evidence file's findings section and in
sim-findings.md, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the verbs exist and are wired — recordCrime is
   called from stealFrom / murder / attack / intimidation /
   cannibalism / desecration sites; justiceTick runs on the daily
   clock; considerPlayerAccusation / forcePlayerAccusation open
   player cases; openCase opens NPC cases from ambush/murder
   plots; playerCaseTick / npcMootTick / mootAdvisoryTick /
   trialVoteTick run in betrayalDailyFull (endDay wrap);
   conductTrial / tallyVotes / finishTrial / sentenceCase /
   resolveCase are the one trial machinery. The pilot will
   confirm live counts in the corpus, not assume them.
   `bribeVoter` / `exposeBribery` / `investigateBribery` are
   player-initiated via conversation choices — competent never
   calls them, so they are expected dead-under-competent unless
   the pilot shows otherwise; proven live in the fixture by
   direct calls and marked dead-under-competent if the pilot
   never fires them. Same for `castPlayerVote` (competent never
   votes — trustfirst-a: 0/43), `justiceRespond` (competent
   never answers a confrontation), and `stealFrom` (competent
   never steals — kind.js / selfeed.js state the absence as
   policy). **Expectation, recorded before the pilot**: the
   scholar-side justice ladder is mostly silent under competent;
   NPC-vs-NPC moots from plots are the live path. If the pilot
   shows the opposite, that overturns the expectation and is
   reported as such.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every crime booked,
   every ladder stage, every case opened, every moot called,
   every vote cast, every verdict, every sentence, every
   moot-attributed trust move, every exile and uprising on the
   band. The engagement floor (GO table) is set from the pool's
   nature: if the band produces <1 case or moot total, the
   census is uninterpretable, not a GO. (Trustfirst-a on the
   sibling band saw 43 quorate moots in 8 seeds, so zero is
   unlikely — but the floor is honest about what zero would
   mean.)
3. **Verb existence**: recordCrime, justiceState, justiceHeat,
   justiceStage, justiceTick, justiceConfront, justiceRespond,
   justiceDemandMoot, justiceRestitutionOwed,
   syncJusticeAfterMoot, mootAccuserAftermath, startVillageUprising,
   uprisingAftermath, justiceExileColdResolve,
   justiceExileCutsTalk, justiceExileLoyalty, exilePlayer,
   theftConfrontation, stealFrom, openCase, openPlayerCase,
   considerPlayerAccusation, forcePlayerAccusation,
   playerCaseTick, npcMootTick, mootAdvisoryTick, trialVoteTick,
   mootConveneHeld, callMoot, conductTrial, tallyVotes,
   mootQuorum, castPlayerVote, finishTrial, sentenceCase,
   resolveCase, bribeVoter, exposeBribery, investigateBribery,
   removeVillager, bumpTrust, recordGrievance all exist in the
   engine (citations above). There are NO justice/moot tele
   types (grep of tele('...') across betrayal.js / justice.js /
   membership.js returns only godpath_deed) — so this arm has
   no tele cross-check; recorded honestly, not faked.
4. **Horizon fit**: 150d covers the full village life (sibling
   pilots' median survival 122.5–140d); justice/moot is a
   whole-life question (cases open from plots across the run,
   the ladder needs heat to accumulate, exiles and uprisings
   are late events). Same horizon as the siblings for
   comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of justice +
moots in a lived village** — every crime classified by type,
victim, villain, witnessed; every ladder stage transition
counted; every case attributed by open path and charge; every
moot classified by caller, quorum, and outcome; every verdict
and sentence counted; every moot-attributed trust move
attributed (or explicitly marked direct-write); every metric
in the list below counted or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every recordCrime call classified by type + victim + witnessed, none 'unclassified' | 0 unclassified crime events across the pilot (type in the known set {theft, attack, murder, intimidation, cannibalism, desecration, threat, assault} or explicitly 'other:<type>'; villain player-or-id; witnessed true/false) |
| Every case attributed by open path + charge, none 'unattributed' | 0 unattributed cases (open path in {considerPlayerAccusation, forcePlayerAccusation, openCase-plot, other-named}; charge in the known set or null-with-reason) |
| Every moot classified by caller + quorum + outcome, none 'unclassified' | 0 unclassified moots (caller named, quorum quorate/advisory recorded, outcome in {acquitted, exile, weregild, schism, cold_war, advisory, fled, already} or explicitly 'open-at-end') |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–11; sense-test scenes quoted |
| Engagement floor | ≥1 case or moot band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 11)

1. Crimes: recordCrime events by type, victim, villain (player
   vs NPC id — NPC-villain calls are DROPPED by the engine, not
   booked: recordCrime returns early when villain != player, so
   the wrap records the call AND the drop), witnessed, caught;
   crimes per seed; crimes that ever reach a caseId (charged)
   vs never charged.
2. The justice ladder: justiceHeat trajectory (daily snapshot);
   stage transitions 0→1 (cold shoulder), 1→2 (confrontation),
   2→3 (moot demanded), 3→4 (uprising); confrontations
   (confronter identity, known crimes named); confrontation
   answers (justiceRespond pay/refuse/silence-timeout, kcal
   paid, restitution owed); moot demands (reason:
   refused/silence/heat; charge named); cooling (stage relaxes
   1→0); uprisings (reason, attackers/defenders, outcome).
3. Cases: opens by path (considerPlayerAccusation,
   forcePlayerAccusation, openCase from plots, other); charges;
   fabricated accusations; accusers (victim vs motive vs
   confronter); accused (player vs NPC, single vs multi);
   cases open at end; cases dormant/advisory at end; days
   from open to moot (mootIn).
4. Moots: callMoot calls by caller (player/NPC, named);
   convening holds (mootConveneHeld true — the scholar away
   from Haven); conductTrial wild days; tallyVotes attendance
   (present count, voter count, playerVoter); quorum
   (quorate vs advisory, present/living); player votes
   (castPlayerVote guilty/acquit — expected 0 under competent);
   backstop resolutions (trialVoteTick: the moot taken without
   the scholar); advisory re-opens (mootAdvisoryTick).
5. Verdicts + sentences: finishTrial convicted/acquitted by
   charge; sentenceCase exile/weregild/schism/cold_war by
   charge and avgBelief; resolveCase paths; exiles (player via
   exilePlayer vs NPC via removeVillager 'exiled'); weregild
   payments (3000 kcal, payer); schism feud groups; cold_war
   counts; the accuser aftermath (mootAccuserAftermath path,
   trust delta, weak-case cost vs held-case gain).
6. Trust moves from moots: bumpTrust events whose stack names
   a moot/justice site (finishTrial vote ±6, mootAccuserAftermath
   -12/-8/+6/-4, justiceRespond +4, justiceExileColdResolve
   -10), with before/after; direct trust writes that bypass
   bumpTrust (finishTrial acquittal -8, resolveCase weregild
   -20 / schism -15 / cold_war -25) reconciled from daily
   trust snapshots; recordGrievance vote grievances
   (voted_guilty 22 / voted_acquit 16); the trustfirst-a
   finding re-tested: do quorate moots move ANY trust under
   competent?
7. Bribery: bribeVoter calls (expected 0 under competent),
   exposeBribery, investigateBribery; bought votes in
   tallyVotes (bribes list) — if any appear without a
   bribeVoter call, that is an unclassified event.
8. Exile life: exilePlayer (how: moot/other); justiceExiled
   state; justiceExileColdResolve outcomes (refused vs broke,
   by loyalty); justiceExileCutsTalk (talk cut or not);
   exileDay / defied-exile uprising; uprisingAftermath
   (result, dead/alive attackers).
9. Theft: stealFrom calls (expected 0 under competent);
   theftConfrontation (pantry freeloader confrontations,
   totalKcal); recordCrime theft events by caught/witnessed;
   the takes/gives net that feeds justiceHeat.
10. Say-line coherence: every justice/moot say line in the
    corpus classified (summons line vs provable crime named,
    verdict line vs live count, advisory line vs quorum
    numbers, exile line vs who walked, uprising line vs
    reason); any line whose number contradicts the live state
    it describes; repeat/echo check on accusation and
    convening lines (the r29/r41b verbatim-repeat fixes).
11. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: justice/moot is a whole-life question (cases open
  from plots across the run, the ladder needs heat to
  accumulate, exiles/uprisings are late events); sibling
  first-numbers pilots ran 150d with median survival
  122.5–140d, so 150d captures the full village life without
  ticking dead villages. Same horizon as the siblings for
  comparability.
- **Seeds: 190311–190318 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190311–190318:
    zero hits.
  - Searched ALL dated evidence `.md` under evidence/2026-11-11
    (word-boundary grep, one seed at a time): zero hits for all
    eight seeds.
  - No perseed directory names any seed 190311–190318 (listing
    of evidence/2026-11-11 checked: perseed-abilityfirst-a,
    perseed-convfirst-a, perseed-trustfirst-a, perseed-vetfirst-b,
    perseed-endgame-r178*).
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190221–190228 (abilityfirst-a), 190301–190308 (vetfirst-b),
    191702, 199585 — none overlap.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
  - A full evidence-tree grep over all dated `.md`/`.json`
    (word-substring, all eight seeds) completed after the prereg
    was written: the only `.md` hit is this prereg itself. The
    `.json` hits are numeric coincidences inside longer digit
    strings (e.g. `1903120`, `8877911903175955`,
    `3315311903134`) — never the 6-digit seeds 190311–190318 as
    standalone seed values. The band is fresh as a SEED naming,
    which is what the skill guards.
  - Search scope recorded so a later reader can retrace it.
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

scripts/justicefirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- recordCrime: every call — type, victim, villain, witnessed,
  caught, caseId at call time, booked-or-dropped (engine drops
  NPC-villain crimes: the wrap records the call and whether the
  crime landed on the books).
- justiceTick: every call — stage/heat before/after (heat read
  via justiceHeat(), a pure read).
- justiceHeat: every call — value returned (read-only tally of
  the ladder's pressure; counted, not re-derived).
- justiceConfront: every call — confronter, known crime counts
  (cannibalism/murder/attack/theft, witnessed only).
- justiceRespond: every call — choice, paid, enough, refused
  reason, stage before/after.
- justiceDemandMoot: every call — reason (refused/silence/heat),
  serious crime type, chargeWord.
- syncJusticeAfterMoot: every call — path.
- mootAccuserAftermath: every call — path, accuser, trust
  before/after on the accuser.
- startVillageUprising: every call — reason, attacker/defender
  counts.
- uprisingAftermath: every call — result, dead/alive attackers.
- justiceExileColdResolve: every call — vid, refused/broke, line
  class (first 40 chars only — the line itself lives in the say
  corpus).
- justiceExileCutsTalk: every call — vid, result.
- exilePlayer: every call — how.
- theftConfrontation: every call — totalKcal.
- stealFrom: every call — vid, return.
- openCase: every call — plot charge, accused (plot-opened
  NPC cases).
- openPlayerCase: every call — accuser, charge, fabricated,
  mootIn.
- considerPlayerAccusation: every call — return (case opened
  or null).
- forcePlayerAccusation: every call — return (existing/new/null).
- mootConveneHeld: every call — held or not (the convening
  gate).
- callMoot: every call — caseId, caller, playerConvened.
- conductTrial: every call — caseId, wildDay, playerVoter,
  awaitingPlayerVote, guiltySoFar, need.
- tallyVotes: every call — present count, votes (vid/vote/
  score), guilty count, playerVoter, wildDay.
- mootQuorum: every call — living, present, quorum.
- castPlayerVote: every call — caseId, guiltyVote.
- finishTrial: every call — caseId, convicted, advisory or
  not, guilty/total, resolution.
- sentenceCase: every call — caseId, charge, avgBelief,
  exileAt/weregildAt thresholds.
- resolveCase: every call — caseId, path, accused, exiled
  list, already-resolved flag.
- bribeVoter: every call — caseId, voter, by, amount, ok.
- exposeBribery: every call — caseId, voter, ok.
- investigateBribery: every call — caseId, found count.
- removeVillager: every call — vid, reason (exiled/killed/fled/
  splinter).
- bumpTrust: every call — vid, requested delta, trust before/
  after, reason, stack (moot-attribution classifier reads the
  stack).
- recordGrievance: every call — from, to, kind, weight.
- Daily snapshot: justice state (stage, heat, crimes [{type,
  victim, witnessed, caseId}], exiled, exileDay, amendsCredit,
  confrontedBy, pendingConfront, mootDemanded); betrayal cases
  [{id, charge, accused, accuser, target, status, resolution,
  fabricated, mootIn, trial {present, guilty, playerVoter,
  wildDay, convicted, finalGuilty}, advisoryDay}]; trust map;
  roster; pantry kcal, standing, scaleRank, nationalLive, wave,
  bearer id.
Driver: scripts/justicefirst-driver-20261111.js (mirrors
abilityfirst-driver; Game.say wrap with a justice/moot regex
for the sense corpus, 200 lines/seed cap — same early-game-only
caveat as the siblings). Analyzer:
scripts/justicefirst-analyze-20261111.js (classifiers for crime
events, cases by open path, moots by caller/quorum/outcome,
moot trust-move attribution from bumpTrust stacks + snapshot
reconciliation for direct trust writes). Proof:
scripts/test-justicefirst-a.js (each wrap proven live on a
fixture or miniature; RED checks on the pre-fix instrument
where a wrap is dead by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-trustfirst-a,
sim-abilityfirst-a, sim-convfirst-a). The control/neutral legs are
the neutrality proof, not a panel. Panel context: **no panel
metric for justice/moot** (coverage audit §4) — this arm supplies
its first-numbers analogue (Metrics 1–10); there is no existing
moot-adjacent panel field at all.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (trustfirst-a: median survival 133d, 2/8 survived,
651 deaths over 1,150 village-days; abilityfirst-a: 851
village-days). If the instrument changes any numeric field vs
the recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
