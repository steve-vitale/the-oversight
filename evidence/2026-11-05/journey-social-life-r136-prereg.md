# Journey social life r136 — PRE-REGISTRATION (Lane B, 2026-11-05)

Leg 5 (social life). Rotation-b read 5 at run start; this run writes 6
(crisis next) at closeout. Run number: r136 follows r135 (endgame,
merged 0f6a43bba; rotation-b 4→5).
Base: master b79821db8 (post r135 + deepening r103 + secondkiller DIAG).
Lock: playtest-loop-2.lock run_id 2026-11-05T07:58:22Z.
Worktree slug: journey2-social (branch journey2-social).

RE-EXECUTION NOTE: a first r136 attempt started 07:49:36Z, wrote only this
prereg as a DRAFT, and timed out 07:55:23Z before any driver/analyzer/seed
ran; the main session established death (zero worker processes, zero
heartbeat-loop processes) and closed it out done-abandoned (tree+branch
removed, lock deleted, rotation-b stayed 5). This run re-executes the same
pre-registration verbatim, with only the lock run_id and this note changed,
plus the OUTDIR-env deviation noted below.

INSTRUMENT CORRECTION (pre-judgment, before any verdict is read): the
first full panel (seeds 41701–41704, run with the driver as written
above) exposed that the inviter split as specified — inviter ==
end-of-run scholarName — is WRONG under succession. Evidence: seed
41701's smoke (5d) scholar was Jordan, the panel (26d) scholar was Jae,
Jordan fell d20 "the wild", and the d8 party decision names Jordan as
inviter. The mantle passes mid-run, so an end-name comparison
mislabels a bearer-invited decision as NPC-invited. Root cause, from
the code census: party.js:206 is the ONLY party-kind call site and
always passes villagerId, so every party decision is bearer-initiated
by construction; lure decisions come from betrayal.js:4217 with the
plot inviter. CORRECTION (read-only, no Game call changes, no RNG):
the npcInviteDecision wrap now records bearer (villagerId at call
time) and inviterWasBearer per decision, and the daily wrapper tracks
successions {day, from, to}. The analyzer splits on inviterWasBearer.
The first panel's JSONs are DISCARDED as the measurement (kept only
as the bug's evidence in the run note, not as verdict inputs) and the
panel is RE-RUN with the corrected driver; the determinism proof is
re-run on the corrected driver too. The metrics themselves (M1–M5)
are unchanged — only the instrument that reads them. The 41701
succession (Jordan→Jae, successor then leads the d12 plot) is itself
a people-check observation, reported in the run note.

Driver: scripts/journey-social-life-r136-20261105.js = r132 driver
(scripts/journey-social-life-r132-20261104.js) verbatim EXCEPT:
fresh seeds 41701–41704, OUTDIR evidence/2026-11-05, filenames r136,
PLUS the bond-initiation instrument below (added BEFORE any scored
seed; read-only wraps, no Game call changes, no RNG).
Analyzer: scripts/analyze-journey-social-r136-20261105.js = r132
analyzer verbatim EXCEPT filenames + a BOND section (see below).
DEVIATION (noted pre-run, before any scored seed): the r136 driver also
accepts an OUTDIR env override for the smoke test (default path
unchanged); the smoke run writes to a scratch subdir and the panel
writes to evidence/2026-11-05.

## Bond-initiation instrument (new this run)
Steve's ruling 2026-11-04 22:32: villagers initiate bonds on their own
(link proposals and bond formation generally, perception-gated). The
build is QUEUED separately — this run measures, does not build.
- Wrap Game.proposeLink / proposeCovenant / proposeTrade (driver-side,
  read-only): record { day, kind, initiatorName, targetName, result }.
  propose* act only for the player's village by construction (no
  initiator parameter; the only callers in src/js are app.js UI
  buttons — a grep census found no NPC caller), so any call observed is
  scholar-initiated. In sim play these are UI-only, so the expected
  count is 0 calls; the wrap PROVES that in wild play rather than
  assuming it.
- Analyzer BOND section: split lureDecisions by inviter — player
  (inviter == scholar name) vs NPC — per kind (party/lure); count
  propose* calls by initiator; count bonds at end (bondSnaps/bondEnd)
  and note whether any bond exists whose formation was NPC-initiated
  (if the engine records no initiator, say so — do not infer one).
  The driver also records one bond sample per seed so the initiator
  question can be answered from the record itself.
- Determinism proof (before judging the panel): re-run seed 41701
  with the r136 driver and require the panel JSON byte-identical to
  its first run. If the JSON differs, the driver change is NOT
  trajectory-neutral: stop, diagnose, do not judge the panel.

## Leg questions
1. Q1 (primary): do villagers EVER initiate a bond in wild social
   play — a link/covenant/trade proposal, or a party/outing/visit
   invitation extended by an NPC to the player or to another NPC?
   Baseline so far: linkseek 0 propose verbs, standaccum 0 links,
   deepening r103 0/19 sittings. This panel is the fourth datapoint,
   on the leg that most directly measures social life.
2. Q2 (continuity): arming motive — does every plot still arm
   grievance-linked; does the d30 drought bound hold; are
   accomplices still cold (motive 0 / ambition) while the leader
   is hot?
3. Q3 (continuity): invite refusal — party/lure accept/decline
   counts, split by inviter (player vs NPC).
4. Q4 (sense): do full transcripts still read as real people?
5. Q5 (guardrail): survival — how many villages past d100?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 41701–41704, sequential.
- Smoke first: SEED=41701 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: ≥1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR ≥1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. Drought read: any plot arming after d30
  breaks the d9–d19 drought bound; none after d30 confirms it again.
- M2 villager-initiated bonds: COUNT question, no GO/NO-GO bar.
  Report propose* calls by initiator, lureDecisions by inviter
  (player vs NPC) per kind, and end bonds. ANSWERED if ≥1
  villager-initiated bond proposal occurs in the wild panel;
  still open if 0 (fourth baseline datapoint for the queued build).
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: ≥1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Death-cluster census reported as recorded;
  cause attribution beyond the recorded cause is NOT claimed.
  Third consecutive 1/4 (after r125, r132) raises the r132
  metric-review question (threshold vs survival story) — report
  it, do not re-score it mid-run.

## What would count as interesting
- ≥1 villager-initiated bond proposal (Q1 answered YES — overturns
  the construction finding in wild play).
- A plot arming after d30 (drought broken).
- A grievance-holder accomplice (cold-friends pattern broken).
- A second d100+ village (M5 threshold met), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).

## Out of scope this run (held, not killed)
- No src/js change unless a finding names a concrete
  inconsistency with its own proof test; gating/threshold retunes
  are frozen and Steve-call.
- No survival bisect (separate larger job; this panel adds one
  more matched point on current master).
- No live-build screenshot pass: this run touches no UI and no
  dialogue text; transcripts are re-read the r125/r132 way.
- No bonds BUILD: the build is queued separately; a 0 count here
  is a measurement for its brief, not a fix this run invents.

## Telemetry
- Metrics: same l3.* keys as r125/r132 vs baseline
  telemetry-baselines/social.json. The r112/r113/r120/r125/r132
  schema drift is known: the social driver never emits l3.*
  fields, so LOUD-disappeared lines are explained, not a bug.
  Baseline NOT rolled on a single 4-seed panel.
