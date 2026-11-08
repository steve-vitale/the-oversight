# Journey leg: DEEPENING (days 40–80) R118 — "LISTENING, UNSTUCK: DOES THE ARC COMPLETE?" — 2026-11-07/08

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r118 plays deepening, wrote 2->3
at run start with verified read-back ("3"). (Rotation history: r113
establishment closed out 1->2; r117 landing closed out 0->1; r116
deepening wrote 2->3.)
Base: master fdff404ddfb3702f32ae20ef7ab7dc563c2ce60b at worktree
creation (worktree registered at b1dc80086 02:13Z, rebased onto
fdff404dd 02:20Z — three landings during the flap-wait: pellet-pass
685dc9ec4 01:36Z, endgame r156 b1dc80086 01:xxZ (src/js/party.js:
party-invite refusals vary by villager+day), mirror-cap evidence
fdff404dd; ba9859e13 was HEAD at pre-flight). Run id:
laneA-20261108T0122Z (scheduled 18:45 CST 2026-11-07).
Policy: competent (r116 driver lineage, LISTEN in BOTH panels now — the
policy is fixed; the CODE changes between panels). CONVO_DAYS [45, 60, 80],
DAYCAP=100, death-aware stop.
Seeds: fresh 96601–96604. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 96600 (outside the main band) x DAYCAP=45 proves the r118
driver + instruments before the main run; smoke outputs deleted after
the check.

Freshness check for 96601–96604 + smoke 96600 (full check per the
2026-11-05 AGENTS.md lesson + local_seed_band_freshness skill — ALL dated
preregs + ALL dated .md + evidence filenames + seed-context patterns +
live processes, not just today's files): COMPLETED before the panel ran.
Word-boundary .md mentions of 96600–96604 across evidence/ + docs/: 0.
Filename hits for 9660*: none. Prereg hits: none. Scripts hits: none.
Live processes on 9660x: none. REJECTED band on the way here:
96501–96504 (+ smoke 96500) — NAMED in sim-preserverleg2-a-prereg.md
(band 96500–96515, live sim loop; corpus files
preserverleg2-a-corpus/*-s9650x.json exist; scripts reference the band).
A band named in any prior prereg is not fresh even with no judged corpus
behind it — the skill's rule, applied.

## The questions

### Q1 (PRIMARY) — THE LISTEN-MENU FLIP FIX: DOES THE ARC COMPLETE WHEN LISTENING ISN'T CUT OFF?

**Basis.** r116 proved the arc FIRES (Turkish 25-crossing day 61, the
grant fired) but its payoff died with the bearer (mantle fix landed
r116) — AND proved the listen path itself stalls: a listen sitting
yields 2–3 listens (+7 to +10 exposure), not the ~+19 the cost model
assumed. Mechanism (this run, verified in source before the panel):
the listen response is one fixed narration + a 4-variant foreign
phrase; once the 4 phrases are used, the 5th listen repeats verbatim
→ sayLine's no-repeat fallback tags the beat `endtopic` →
buildMenu's endtopic branch (which precedes the nonverbal branch)
returns only dlg:subject/leave (+goon) — a VERBAL menu in a no-words
sitting, no gestures, no nv:listen, for the rest of the sitting. The
same branch is one source of dlg:subject in nonverbal sittings;
agency:ask_expedition is injected into EVERY menu by the
G.convoChoices wrapper in villager-agency.js (no thread check).

**Fixes (game code, before/after panel).**
- A. buildMenu: the endtopic early-return skips when
  c.thread === 'nonverbal' — a no-words sitting keeps its gestural
  menu (leave still offered; the budget wind-down still ends it).
- B. nvRespond listen: the narration cycles through 3 variants via
  convoPickCycle (first preserves the old line), mirroring the r72
  react pools — 4 foreign phrases x 3 narrations = 12 distinct
  listen lines, so no verbatim repeat inside a sitting's budget.
- C. G.convoChoices wrapper (villager-agency.js): skip agencyChoices
  extras when the convo thread is nonverbal — no verbal ask where no
  words exist.
- D. speakBack: strip trailing sentence punctuation from the attempted
  phrase before embedding — the data phrase "Eso mismo. Diste en el
  clavo." plus the template's "." produced "clavo.." (and "clavo.,"
  in the elder branch).

**Instruments (driver-only, both panels).** grantEvents (wrap
langExposureGain; a 0→1 languages[lang] flip on the 25-crossing is a
grant — the r116 metric-review #1 fix: the analyzer no longer counts
end-state languages as flips); menuFlip scan (transcript
(offered=...) lines: a turn offering dlg:subject with no nv: id after
a previous turn offered nv:listen in the same sitting);
langArc/langGate/goalLineDays unchanged from r116.
**Policy: LISTEN in BOTH panels** (speak_back if offered, else
nv:listen every turn after the goon pass) — the policy is fixed; the
before-panel runs base code, the after-panel runs fixed code, same
seeds. Panels one seed per process (r116 metric-review #3 — the
cross-seed leak).

**Pre-registered verdicts (binding, panel-level):**
- **ARC-FIRES** if ≥1 grant event AND ≥1 bond/link decision at
  partial-or-better follows a grant on that language = the arc pays
  off when listening isn't cut off. POLICY DECISION (binding): the
  competent player KEEPS sitting no-language holders and listens; the
  dead npcComm guards are removed as dead code in a cleanup commit
  (they must not become a skip — the evidence says sitting +
  listening is the play). Same decision shape as r116's, now with the
  grant instrument.
- **ARC-FLIPS-NO-PAYOFF** if grants happen but 0 decisions follow =
  the arc works, the payoff is unproven (carry: does the villager
  re-stage inside the leg?).
- **ARC-STILL-DEAD** if 0 grants despite listening, with ≥1 'none'
  holder sat ≥2 sittings = the promise is hollow in-leg — a GAME
  finding for the main session; no driver change; skip-vs-sit carries.
- **NO-CONTACT** if 0 'none' holders sat ≥2 sittings in either panel
  → no verdict; carry.
- **MENU-FLIP (fix evidence, reported per panel):** before-panel flips
  > 0 with after-panel flips = 0 → the fix holds in the wild;
  after-panel flips > 0 → the fix is incomplete, name the sitting.

### Q2 — SAFETY GOAL LINES: THE INDOOR CHANNEL

**Basis.** r116 Q2 GOALS-FAULT (both panels): safety tops exist
(14/7), lines almost never annotate (1 lined), capture 0. Mechanism
(verified in source): safety maps only to HAVEN_CHORE (GOAL_KINDS),
and HAVEN_CHORE objectives are indoor — they never depart, so the
departure line (the ONLY goalLine channel,
villager-objectives.js:1070) never speaks for them. The annotation is
written onto the objective and silently dropped. Knowledge has the
same shape (SEEK only, indoor, and by an explicit design comment
"the beat is quiet — the seeking is the behavior, not a line" — no
beat at all in objTick).

**Fix (game code, before/after panel).**
- E. objTick indoor beats: append o.goalLine to the spoken line when
  present — HAVEN_CHORE chore beat, HAVEN_CHORE 'finds' fallback,
  and the indoor VISIT beat (bonds-via-visit-at-home). The beat fires
  only ~22% of day-parts per villager (R() < 0.22 gate) and only when
  playerAtHaven, so volume stays departure-like. SEEK gets NO new
  beat (the quiet-beat design stands — reported, not overridden).

**Instruments:** goalLineDays + goalSnaps unchanged (the chore/visit
lines go through say() → capture, so the existing counter reads
them); analyzer adds indoorLined (lined objectives with objState
'indoor') to show the mechanism.

**Pre-registered verdicts (binding, after-panel):**
- **GOALS-FIXED** if safety capture > 0 on the after-panel with
  tops → lined(indoor) → capture join shown = the indoor channel
  speaks.
- **GOALS-STILL-FAULT** if safety capture = 0 despite lined-indoors
  > 0 = the channel is still broken somewhere; name the gap.
- **NO-DATA** if safety tops = 0 → carry.
- Knowledge reported descriptively (tops / lined-indoor / capture)
  with the quiet-beat design quoted — no verdict, no fix this run.

## Secondary (carried, r113/r114/r116 verdicts re-judged fresh)

- **SURV-CONTROL-4 (8th control point):** lineage r107 2/4, r108 3/4,
  r109 2/4, r110 2/4, r113-before 4/4, r113-after 2/4, r114-before 4/4,
  r114-after 3/4, r116-before 4/4, r116-after 3/4. Verdict rule as
  r110's: >=2/4 survive -> funnel unchanged; 0/4 -> base moved
  (bisect job, no claim about which change); 1/4 -> ambiguous. NOTE:
  base moved since r116 (pellet-pass 685dc9ec4 landed 01:36Z, after
  r116's base a2e005cbe; alien expansion 2bc17d793 was already in
  r116's base). Any funnel move is reported, not attributed without
  a bisect.
- **P-KEEP (revised, minus bare "forgot"), RE-ASK (4 variants +
  origin split), DEBRIEF-CAPTURE, B-SIT / B-FOLLOW / B-LEAD,
  FIZZLE-WATCH, S-TRACE, D-THING (revised per r110 metric review),
  G-STICK (distribution, not stuck-count), G-SENSE, AWAY-LINE (r113
  Q2, regression watch), Q1-REQUESTS (r113, carried),
  INVITE-REPLAY WATCH (hand-read), V-INIT (bondSittings count —
  should a villager walk up and ask face-to-face?), r110 nits
  #3/#4/#6:** same scans as r116.
- **ELIF TRUST (r116 carried question — ANSWERED in source this run,
  mechanism only, NO fix):** the playerDeath wrap in
  villager-agency.js pays EVERY roster member
  min(12, floor(agencyScore/4)) trust on EVERY scholar death.
  agencyScore = achievements + expeditions×2 + monsterKills×8 +
  nodes + tier×4 — earned without ever talking to the scholar.
  96401-after: 9 scholar deaths × ~+6 (score ~24) ≈ +54, matching
  Elif's 39→92 (+53). The wrap's intent is succession sorting
  (playerDeath sorts by trust); the trust write is the side effect.
  Fix/no-fix is a design call — carried to the main session, NOT
  changed this run. Panel check (descriptive): the r118
  before-panel data should show trust jumps on death days for
  never-spoken-to villagers.
- **Mantle latency (r117 carried):** the 2-day mantle latency
  mechanism stays open — a later run instruments the succession
  sweep timing. Not this run's question; noted.
- **All-tracks read (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS):**
  the village assessment carries a descriptive all-tracks read
  (goal-top distribution per seed, mapped to tracks).

## Carried context (reported, not re-judged)

- r114 Q1/Q2 fixes are IN the base (bond-initiation.js language gate +
  decided-ask clear, commit 344b7cd2, live in the Nov 7 ship): the
  r118 panels re-prove them as regression watches (langGate: 0 'none'
  offers/decisions expected on BOTH panels; replay scan: 0 replays
  expected on BOTH panels). A regression is a LOUD finding, not a
  re-verdict — r114 already judged the fixes FIX-WORKS.
- One-brain order (Steve 2026-11-06 17:12 CST): noted as context.
  Bond proposals and link raises are a second decision channel that
  never reaches the one scorer — a later-phase fold-in, per the
  order.
- Gating freeze (2026-10-27 16:53) stands — no threshold, bar,
  price, or gate change in this run. Perception law (2026-10-28)
  stands — all instruments read-only; pickers press offered menu
  items only. DELIVER OVER MEASURE (2026-11-01): a code change lands
  ONLY if a defect is proven in game code with a before/after proof
  test.
- The r116 driver finding (dead npcComm guards) is ANSWERED by Q1's
  policy decision, not fixed before the panels: the before/after
  comparison needs the same guards in both panels (dead in both —
  the policy change is the LISTEN branch, not the guards).

## What this run does NOT do

- Does not build a new bond system or a new language system. The
  language arc is merged; this run measures whether the competent
  player can walk it once listening isn't cut off, and changes only
  the menu/narration/agency-offer paths and the indoor goal-line
  channel.
- Does not change staging (stageBondProposal / stageLinkRaise), the
  warmth window, the 3-day expiry, the 14-day refusal cooldown, or any
  bond probability.
- Does not change the r114 language gate or the decided-ask clear.
- Does not add a SEEK beat (quiet-beat design stands).
- Does not change the playerDeath trust wrap (Elif) — mechanism
  reported only.
- Does not touch win prices, deed gates, or any balance number.
- Does not re-judge wave 4 (r90), beast-trick teaching (r92),
  standing/scale two-rulers (r93), villager goals as a system, or the
  standing/scale question. Carried as context only.
- Does not re-score the r116 panel. r116 stands as computed.

## Seeds, pilot, shape

- Panel: fresh seeds 96601–96604, DAYS=100 (DAYCAP), OUTDIR
  deepening-r118 (goal hidden_files evidence/2026-11-08/).
- Before/after file separation (r116 metric review): before-panel
  writes `journey-deepening-r118-before-seedNNNN.json` +
  `...-before-transcript-...`; after-panel writes `...-after-...`.
  The analyzer takes PANEL=before|after (default before) and reads
  the matching seed files.
- PILOT FIRST: smoke 96600 x DAYCAP=45 proves the r118 driver +
  instruments before the main run (seeds run, snapshots present,
  talkReqSnaps + langGateDecisions + langArc + langGrants present,
  transcripts written; smoke outputs deleted after the check). Then
  2-seed pilot (96601–96602) before expanding to 4 — the pilot
  validates the langGrants + menuFlip instruments on real output
  before the panel expands.
- Shape: prereg commit → proof tests (listen-menu + goalline +
  analyzer, RED before the fix) → smoke → pilot (2 seeds) →
  before-panel (4 seeds, ONE SEED PER PROCESS — r116 metric review
  #3) → analyzer verdicts → fixes → proof tests GREEN → after-panel
  (same 4 seeds, one seed per process) → analyzer both panels → run
  note → gate → merge.
- Proof tests: scripts/test-journey-deepening-r118-listen-menu-20261107.js
  (endtopic-tagged beat in a nonverbal sitting keeps nv:listen;
  listen narration cycles; agency extras skipped in nonverbal;
  speakBack no double period) +
  scripts/test-journey-deepening-r118-goalline-20261107.js
  (chore/finds/visit-indoor beats append goalLine; no goalLine → no
  append) +
  scripts/test-journey-deepening-r118-analyzer-20261107.js
  (grant-event flips, menuFlip scan, indoorLined join).

## Metric review (filled at closeout, never mid-run)
- (to be filled)

## Infrastructure notes
- EPERM FLAP at registration: first `worktree-register.sh` attempt
  failed ~01:43Z (checkout write errors: "unable to write file
  tools/mobile-sim.html", "version.json"; "Could not reset index file
  to revision 'HEAD'"). No partial state: no journey-deepening dir,
  no registry entry. Probe protocol per local_write_flap_response:
  git update-ref probe FAILS, O_EXCL create in .git/refs/heads/
  FAILS Errno 1 Operation not permitted, plain file writes OK.
  Flap start ~01:37Z (pellet-pass merge 685dc9ec4 wrote refs fine at
  01:36:11Z). Registration retry awaits a clear window; prereg +
  rotation write done during the wait (rotation verified read-back).
- Stale 0-byte probe residue in .git/refs/heads/ (Oct 31–Nov 5:
  .flap-probe.tmp, .probe-r79*, flap-mimic.lock, flap-x.lock) — left
  by earlier flap probes; harmless, not this run's to clean.
- Lock created 2026-11-08T01:22:39Z, run_id 2026-11-08T01:22:39Z.
  NOTE: this run holds NO registered tree while flap-waiting, so the
  overlap guard's registry check would judge it dead — a later Lane A
  occurrence could delete the lock mid-wait. Flagged; re-check the
  lock at each probe.
