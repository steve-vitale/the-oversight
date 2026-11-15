# sim-ove48-mech-prereg — OVE-48 REVERT-vs-KEEP SUB-QUESTIONS (Loop A, fleshout-20261115T0215Z)

Run: fleshout-20261115T0215Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-mech-a, branch `sim-ove48-mech-a`, worktree
`~/workspace/worktrees/sim-ove48-mech-a`. Tracker next blank #1;
evidence/2026-11-14/sim-ove48-conv.md "WHAT IS STILL UNPROVEN" +
"DOCUMENTED (open...)". This arm does NOT make the revert-vs-keep
call — it resolves the three sub-questions so the coordinator can.

## Authority

- evidence/2026-11-14/sim-ove48-conv.md + sim-ove48-conv-prereg.md
  (mechanism GO: dawn-aligned share 28.7% → 74.9% on band
  190457–190464, 150d, competent verbatim; survival 3/8 → 0/8;
  `dawnKind` null on ALL 1,810 opens on BOTH legs; 0 drive mentions
  in 811 sampled lines because the verbatim policy walks out of
  every conversation).
- evidence/2026-11-14/sim-transplant15a-band3.md (band 3: far end
  3/8 survived vs OVE-48 subject 0/8 on fresh band 190457–190464,
  150d, competent verbatim — CARRIER verdict, causal path unproven).
- docs/CANON.md read first; docs/CONVERSATIONS.md read for this
  arm's area (dialogue/talk). Canon: a conversation costs 10 kcal +
  1 tick to open; deep beats cost 1 tick each, not energy
  (conversation.js:5902-5916, 3129-3134); the endConvo trust
  stipend scales with exchanges (0 = none, 1–2 = +1, 3+ = +3) and
  the mood residue lingers only after 3+ exchanges in a SUBSTANTIVE
  conversation (conversation.js header, goodbye_once_real).
  TICKS_PER_DAY = 512 (4 parts × 128). No standalone canon doc
  covers OVE-48 itself. Nothing here invents canon.

## The three sub-questions (all on deliberate band reuse 190457–190464)

(a) KIND HALF. `dawnKind` is null on ALL 1,810 opens on both legs
    of ove48-conv — the kind half of OVE-48's contract is
    unexercised. Find whether vbrainCommit kind is EVER populated
    in any sim/live path.
(b) UNSPOKEN DRIVE. Nobody says the drive aloud (0 mentions in 811
    sampled lines) because the verbatim policy walks out of every
    conversation. Run the COMPETENT_TALK=1 follow-up (held
    conversations, up to 2/day, 5 turns): does a dawn-aligned opener
    lead to longer sittings and lines naming the drive/commitment?
(c) CAUSAL PATH pick → 0/8 survival. Trace per-seed on
    190457–190464 which opener picks change, what downstream state
    changes, and which deaths follow. The pick changes no kcal cost,
    damage, armor, spawn, yield, spoilage, wave or table number (per
    ove48-conv) — a survival effect through opener choice would be
    third-order.

## (a) Code-read result (done BEFORE this prereg; not a sim)

`src/js/villager-brain.js` does NOT exist at either ove48-conv leg:
`git show 203a32775:src/js/villager-brain.js` and
`git show 493d7a975:src/js/villager-brain.js` both fail ("exists on
disk, but not in '<commit>'"). The writer — `vbrainScorePick` /
`writeCommit` / `vbrainCommit` (villager-brain.js:607-641) — landed
with the phase-1 dawn-brain merge (PR #7, 816404356, 2026-11-08
21:05Z), AFTER both legs' bases. The reader
(`convoDawnPriorities`, convo-wants.js) guards the read with
`typeof this.vbrainCommit === 'function'` and returns kind null
when the writer is absent. So on BOTH ove48-conv legs the kind
half was STRUCTURALLY unpopulatable — no writer existed to fill
it. That is the code-read answer for the band-3 legs; it is NOT a
failure of the reader. The probe below tests whether kind IS
populated where writer + reader both exist (current master, which
carries both: vbrain merge IS an ancestor of master, and
`convoDawnPriorities` is present in master:src/js/convo-wants.js,
introduced by c937de65f).

Writer wiring (quoted, current master):
- Dawn pick: villager-objectives.js:1817 `objRefreshPick(rid, hx,
  hy, { dawn: true })` at dayPart 0, only when the villager's
  objective is empty/done/returning; `objPick` calls
  `vbrainScorePick` (villager-objectives.js:662) or a hard-gate
  `vbrainLogGate` (LEAVE/REST/EAT/HAUL/SEEK early returns) — both
  write a commit via `writeCommit` with `kind: chosen.kind`,
  `day: dayOf(self)` (scholar day), `part: partOf(self)`.
- Read: `vbrainCommit(vid)` returns `state.village.vbrain.commit[vid]`
  or null; the instrument and `convoDawnPriorities` discard a commit
  whose `day !== scholar.day`.
- Kinds written: FORAGE / WATER / HAUL / VISIT / HAVEN_CHORE /
  TRAPS / HUNT / SEEK / EXPLORE / EXPEDITION / REST / EAT / LEAVE /
  DUTY / ASSIGN (the DAWN_KIND_WANTS keys plus DUTY/ASSIGN, which
  have no kind table entry and therefore contribute no kind boost).

Scratch probe (UNJUDGED, seed 190457, 30d, verbatim, this worktree
— NOT evidence): `Game.vbrainCommit(vid)` at `convoSelectWant`
time returned a commit with a kind on 32/32 calls (25 same-day,
7 stale-yesterday); kinds EAT/DUTY/WATER/VISIT/SEEK/HAVEN_CHORE/
LEAVE. The judged leg below re-runs this properly.

## Legs (THREE; all band 190457–190464, 150d death-aware)

- L-KIND: master tip a4d0b2038, STEP t-ove48-mech-kind, competent
  verbatim (COMPETENT_TALK NOT set — same walk-out policy as
  ove48-conv, so opens stay comparable). Purpose: (a) probe — kind
  population where writer + reader both exist. New tooling (mech
  instrument/driver/analyzer/step); V5 band-3 replication does NOT
  apply (different code base — no band-3 counterpart on master
  tip); survival is recorded, not replicated.
- L-TALK-BASE: far end 203a32775, STEP t-ove48-mech-talk-base,
  COMPETENT_TALK=1. Purpose: (b) held-conversation leg, baseline.
- L-TALK-SUBJ: subject branch `transplant-15a-narrowed-subject` at
  493d7a975, STEP t-ove48-mech-talk-subj, COMPETENT_TALK=1. Purpose:
  (b) held-conversation leg, subject.
  Subject verified at run start before any sim (exactly 1 commit on
  the far end; tree 6d6216e3e414518d2c335829e130e65ec849941b; diff vs
  far end exactly 3 files +320/-3; green-list.txt byte-identical to
  the far end — same verification as the ove48-conv prereg).
  Read-only use; NEVER commit onto it; NEVER rebuild it. If
  verification fails, FAIL LOUDLY and stop.
- All three legs: roster-check standing fix swapped in for every
  step exactly as the bisect prereg specifies (fix file sha
  f8fda4295a99, from commit 5157782a4; native restored
  byte-identical afterwards, sha-verified 75762cb2…). Own-policy
  per step (each step runs its commit's OWN competent.js).
- (c) needs NO new leg: it analyzes the EXISTING ove48-conv
  corpora (evidence/2026-11-14/perseed-ove48-conv-t-ove48-conv-base/
  and -subj/, V5-replicated to band 3) with a new causal analyzer.
  If the corpora lack a needed field, that is recorded as a gap —
  no new survival leg is run for (c) without a prereg amendment.

## Step mechanics

`scripts/ove48-mech-step.sh` (modeled on scripts/ove48-conv-step.sh;
SEEDS=190457,…,190464; restores tooling scratch — mech driver +
analyzer + instrument + causal analyzer + vetfirst instrument +
masterregress analyzer — from branch sim-ove48-mech-a, NOT master,
because this tooling is not on master; the script checks out the
step commit detached, so run from the /tmp copy with REPO set to
the worktree for EVERY step including the first). The repo step
script is NOT modified. Corpus paths:
evidence/2026-11-14/perseed-ove48-mech-<STEP>/, driver logs +
summaries in evidence/2026-11-14/ (ove48-mech-<STEP>-driver.log /
-summary.json). Commit corpus directories by expanding to FILE
LISTS first — safe-commit.sh refuses directory paths.
COMPETENT_TALK=1 is exported by the step script ONLY for the two
talk legs (never for L-KIND).

## Instrument (mech — extends the committed ove48-conv instrument)

`scripts/ove48-mech-instrument-20261114.js` = the ove48-conv
instrument plus, per open: `openIdx` on every captured line (join
key: the say-wrapper's in-progress open), `exchangesAtClose` +
`turnLines` (lines captured after the opener) written at endConvo
from `convoGet(vid).exchanges` before the original runs, `held`
(exchanges ≥ 1). Caps raised for held sittings: 40 lines per
conversation (was 6), 4000 lines per seed (was 1500). Same pure
observer discipline (no RNG draws, no state writes). The
ove48-conv instrument is NOT modified; the mech driver uses the
mech instrument. The L-KIND leg reuses the mech instrument too
(same records; held fields simply read 0 under the walk-out policy).

## (b) Drive-naming classifier — DRIVE LEXICON (pre-registered)

A held conversation's NON-OPENER line (turn lines after the opener;
the opener is the pick's output, not the sitting's speech) counts
as drive-naming for that open's dawn drive if it matches the
drive's plain-word lexicon below (case-insensitive, word-boundary
where noted) OR the generic dawn/commitment words. Opener-line
matches are reported separately as secondary (they must NOT carry
the GO). Drives with no lexicon entry in the game are still
classified by the generic words only.

- food_security: pantry, forage, hungry, hunger, food, eat,
  starv, meal, pack, thin, cook, harvest, ration
- party_up: party, together, join, companion, beside, team,
  "find people", people, hunt together, fight beside
- safety: safe, danger, warn, monster, beast, alive, surviv,
  "watch out", careful, guard, protect, scar, wound
- gear_up: gear, armor, weapon, tool, craft, blade, bow, spear,
  shield, leather, bark
- build_standing: standing, table, village, reputation, deed,
  tribute, seat, region, link, moot
- knowledge: know, learn, curious, wonder, trick, secret, story,
  beast, plant, herb, lesson, teach
- bonds: friend, bond, close, trust, miss, grief, comfort, kin,
  family, together, love
- bank_veterans: veteran, blooded, kill, wave, fighter, scarred,
  elder, pack-leader, slain
- GENERIC (any drive): dawn, commit, "what I'm doing", "today I",
  plan, "my job", drive, promise, duty, "set out"

Sitting length: `exchanges` at close (conversation.js `c.exchanges`).
Held sitting: exchanges ≥ 1. Aligned vs misaligned: the analyzer's
`isAligned` on the open (weighted-pick opens with dawn state; same
DAWN tables as ove48-conv, diffed against the subject source by the
proof test).

## Pre-registered bars (judge exactly this)

(a) KIND HALF — GO: a NAMED condition under which kind is non-null
    on ≥1 open, with the code path quoted. Concretely on L-KIND:
    `pickDawn.kind` non-null on ≥1% of weighted-pick opens AND the
    independent read's `dawnKind` non-null on ≥1% of opens, with the
    writer path quoted (dawn pick → writeCommit → vbrainCommit).
    PROVEN NEGATIVE: kind never set in any reachable path — the
    code-read shows no writer on any leg probed AND the L-KIND leg
    records kind null on 100% of opens despite the writer existing
    (with every policy tried named: verbatim walk-out on master tip;
    COMPETENT_TALK=1 held on both old legs). Either outcome
    resolves (a); the verdict is GO or PROVEN-NEGATIVE, never
    re-scored.
    Validity for L-KIND: V1 opens ≥200; V2 ≥95% classified;
    V4 0 instrument errors; V6 kind-read attempted on 100% of
    opens (dawnSource recorded, never 'error'). V3/V5 do not apply
    (no dawn-priority read on the far-end sense — L-KIND is master
    tip; no band-3 counterpart).

(b) UNSPOKEN DRIVE — GO (both halves): (i) ≥25% of held
    conversations (pooled across both talk legs; per-leg reported)
    contain a drive/commitment-naming NON-OPENER line for the
    opener's dawn drive; AND (ii) mean sitting length (exchanges)
    higher on dawn-aligned opens than misaligned opens (pooled
    held sittings; per-leg reported). NO-GO: instrument valid but
    either half misses — in particular NO-GO if 0 lines name the
    drive on either leg (the task's stated NO-GO). INSUFFICIENT
    (DIAG, not NO-GO): the aligned-vs-misaligned split has <10 held
    sittings on a side pooled — the length half cannot be judged.
    Validity for talk legs: V1 opens ≥200/leg; V2 ≥95%
    classified/leg; V3 dawn reads >0 subject / =0 base; V4 0
    instrument errors; V6 ≥20 held sittings (exchanges ≥1) per leg
    (else the policy did not hold and the leg cannot judge (b)).
    V5 replication does NOT apply (COMPETENT_TALK changes the
    policy; trajectories are not band-3's).

(c) CAUSAL PATH — GO: a NAMED causal chain with per-seed evidence
    linking pick → state delta → death. The chain must name a
    semantic mechanism from this checklist, each quantified
    per-seed on the existing ove48-conv corpora: (1) kcal cost of
    opens (10 kcal × opens; subject +60 opens = +600 kcal over 8
    seeds); (2) tick cost of opens (1 tick × opens) + deep beats
    (0 on walk-out legs) vs the 512-tick day; (3) trust stipend
    (0-exchange walk-outs pay 0; any nonzero stipend must be shown
    in the corpus); (4) mood residue (requires 3+ exchanges in a
    substantive conversation — 0 on walk-out legs by construction);
    (5) favor promises / teaching / knowledge (require turns or
    acceptance — 0 on walk-out legs by construction); (6) fight
    outcomes (fights/casts/killCalls per seed); (7) pantry/roster/
    trust/standing daily trajectories — the first per-seed day on
    which any state series diverges, vs the first per-seed day on
    which the death sets diverge. PROVEN NEGATIVE: no downstream
    state delta attributable to opener choice beyond the pick
    itself — i.e. checklist (1)–(5) all quantify to <1% of the
    relevant budget (kcal vs pantry flow, ticks vs 512/day, trust
    0, mood 0, favors/teaching 0) AND no state series diverges
    before the first death divergence on any seed. In that case the
    survival effect is unexplained by this mechanism; the evidence
    recommends a fresh-band re-test of the survival effect or
    treating 0/8 as a seed-band artifact. RNG-draw-count drift
    (weighted-pick draws 515 vs 569 → chaotic trajectory divergence
    with no semantic content) is named as a candidate non-semantic
    carrier if (1)–(7) show nothing semantic — it is NOT itself a
    causal chain, and must be labeled as such.

## Secondary (reported, not judged)

Per leg: want distribution + TVD, pre-emptor rates, dawn-present
rate, opener-produced rate, opener threads, stage-at-close,
pickDawn cross-check agreement, wall numbers (survived/8,
national/table/wins, wave-5, median survival, death-cause shares),
per-seed aligned shares, per-drive alignment, kind-population
share by kind (L-KIND), held-sitting count + exchanges
distribution + drive-naming share with opener lines included
(talk legs), per-seed (c) state-divergence table.

## Metric review (section in the evidence file)

Pre-registered here so the evidence carries it: if any bar
misses, write under "metric review" whether the bar or the
instrument was wrong (e.g. the 25% drive-naming bar too strict
for a lexicon over turn lines; the aligned/misaligned split too
thin because deepTalk targets want-holders first; the <1%
budget test for (c) too lax for a chaotic system), and propose
the revision for the NEXT run. Do not re-score this run.

## Fix policy

Bisect prereg §Fix policy binds this arm: no game-code change
lands from this measurement arm. This arm builds instrument
scripts + evidence only. ZERO src/js changes. No revert, no keep
decision — that call follows with these three sub-questions
resolved (coordinator/Steve).

## Freshness / band note

Deliberate reuse of band 190457–190464 (band 3) for all three
legs. This is NOT a freshness violation: the transplant protocol
reuses the band where the effect was proven, so the mechanism is
measured on the same trajectories. The band is named in the
band-3 prereg/evidence and the 2115Z round record; no new band is
consumed. The L-KIND leg reuses the same band on master tip for
the kind-population probe (a probe, not a survival comparison).

## Ordering note

Subject verification ran as part of prereg preparation, before
this file was committed (same precedent as the band-3 prereg).
The binding requirement is met: this prereg is committed BEFORE
any judged sim runs. No STEP t-ove48-mech-kind / -talk-base /
-talk-subj corpus, summary, or driver log exists at commit time.
The stage-1 proof (instrument validation on a scratch seed, 30d,
unjudged) is committed WITH this prereg, same as the band-3 arm.
