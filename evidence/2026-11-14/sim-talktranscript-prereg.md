# sim-talktranscript-prereg — OVE-48 SPOKEN-DRIVE JUDGED TRANSCRIPT RUN (Loop A, fleshout-20261115T0427Z)

Run: fleshout-20261115T0427Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-talktranscript-a, branch `sim-talktranscript-a`,
worktree `~/workspace/worktrees/sim-talktranscript-a`. Tracker next
blank #1, from run fleshout-20261115T0215Z. This arm settles whether
the ove48-mech (b) NO-GO was a channel artifact. It does NOT make the
revert-vs-keep call — the coordinator decides after this verdict.

## Authority

- evidence/2026-11-14/sim-ove48-mech-a.md + sim-ove48-mech-prereg.md
  (mechanism GO: dawn-aligned 28.7% → 74.9% on band 190457–190464,
  150d, competent verbatim; (b) NO-GO on a Game.say instrument: 18.7%
  of held sittings name the drive in turn lines vs a 25% bar, n=3,952
  pooled; mean exchanges aligned 3.52 vs misaligned 3.55).
- docs/CANON.md read first; docs/CONVERSATIONS.md read for this
  arm's area (dialogue/talk). Canon: a conversation costs 10 kcal +
  1 tick to open; deep beats cost 1 tick each, not energy; the
  endConvo trust stipend scales with exchanges (0 = none, 1–2 = +1,
  3+ = +3) and the mood residue lingers only after 3+ exchanges in a
  SUBSTANTIVE conversation. **Spoken dialogue lives ONLY in
  c.transcript** — sayLine (conversation.js:910) pushes spoken beats
  directly to `c.transcript` as `{who:'them', text}`, and the "ONE
  TEXT STREAM" rule (dialog-ui-fix 2026-10-11) keeps NPC speech out
  of the narration feed entirely. `c.transcript` is reset only at
  open (talkTo, conversation.js:5764) and is never cleared by
  endConvo — verified on all three trees (master tip, far end,
  subject): exactly one `transcript = []` in conversation.js, and
  the ONE TEXT STREAM comment present at both old legs. No
  standalone canon doc covers OVE-48 itself. Nothing here invents
  canon.

## The question (one sub-question — the (b) channel artifact)

The ove48-mech (b) instrument listened to `Game.say`. Spoken
dialogue does not go through `Game.say`. A scratch probe (seed
190457, 30d, COMPETENT_TALK=1, master tip, unjudged — same
classifier, transcript beats instead of say lines) found 56 held
sittings, ALL with spoken beats (294 them-beats, ~5.25 per sitting),
drive-naming on transcript beats 35/56 = 62.5%, and 24/56 = 42.9%
excluding sittings whose ONLY match is the generic word "promise".
This judged run re-measures (b) on the spoken channel with the same
bar, the same legs, the same seeds, the same policy — changing ONLY
the capture channel.

## Capture channel (committed here; proven by the smoke test)

Capture channel = **c.transcript, snapshotted at endConvo after the
original runs** (scripts/talktranscript-instrument-20261114.js). The
snapshot is taken after the original endConvo because endConvo
itself speaks the goodbye + want-closing beats via sayLine, so the
post-close snapshot is the sitting's complete spoken record. Only
`who === 'them'` beats count as spoken dialogue (`'you'` entries
are the player's words, `'narr'` entries are stage directions).
`seq` is the 0-based index within the sitting's them-beats: seq 0
is the opener beat, seq >= 1 are the turn lines — the same
positional non-opener rule as the mech instrument.

SMOKE TEST (stage-1 proof, run BEFORE this prereg is committed and
BEFORE any judged leg): a scratch seed (12345, 15d verbatim + 15d
held under COMPETENT_TALK=1, master tip, unjudged) must show
transcript lines from real held sittings — ≥5 held sittings, ≥10
them-beats joined to opens via openIdx, at least one held sitting
with ≥2 them-beats (opener + a turn beat), and Game.say untouched
by the instrument (identity check). If the channel captures
nothing, STOP and report — do not judge on an empty channel. The
smoke test prints the first two held sittings' full transcripts to
stdout as the visible proof.

## Legs (TWO; same as the ove48-mech talk legs)

- L-TALK-BASE: far end 203a32775, STEP t-talktranscript-base,
  COMPETENT_TALK=1. Purpose: (b) held-conversation leg, baseline.
- L-TALK-SUBJ: subject branch `transplant-15a-narrowed-subject` at
  493d7a975, STEP t-talktranscript-subj, COMPETENT_TALK=1. Purpose:
  (b) held-conversation leg, subject.
  Subject verified at run start before any sim (exactly 1 commit on
  the far end; tree 6d6216e3e414518d2c335829e130e65ec849941b; diff vs
  far end exactly 3 files +320/-3; green-list.txt byte-identical to
  the far end — same verification as the ove48-mech prereg).
  Read-only use; NEVER commit onto it; NEVER rebuild it. If
  verification fails, FAIL LOUDLY and stop.
- Both legs: band 190457–190464 (deliberate reuse — same
  trajectories as ove48-conv/mech), 150d death-aware horizon,
  roster-check standing fix swapped in for every step exactly as
  the bisect prereg specifies (fix file sha f8fda4295a99, from
  commit 5157782a4; native restored byte-identical afterwards,
  sha-verified 75762cb2…). Own-policy per step (each step runs its
  commit's OWN competent.js). COMPETENT_TALK=1 on both legs (held
  conversations, up to 2/day, 5 turns).

## Step mechanics

`scripts/talktranscript-step.sh` (modeled on
scripts/ove48-mech-step.sh; SEEDS=190457,…,190464; restores tooling
scratch — talktranscript driver + analyzer + instrument, vetfirst
instrument, masterregress analyzer — from branch
sim-talktranscript-a, NOT master, because this tooling is not on
master; the script checks out the step commit detached, so run from
the /tmp copy with REPO set to the worktree for EVERY step
including the first). The repo step script is NOT modified. Corpus
paths: evidence/2026-11-14/perseed-talktranscript-<STEP>/, driver
logs + summaries in evidence/2026-11-14/
(talktranscript-<STEP>-driver.log / -summary.json). Commit corpus
directories by expanding to FILE LISTS first — safe-commit.sh
refuses directory paths.

## Instrument (transcript — the ONE change vs the mech instrument)

`scripts/talktranscript-instrument-20261114.js` = the mech
instrument with the Game.say wrapper REMOVED (the instrument does
not wrap say at all; the proof test asserts Game.say identity after
install) and transcript capture added at endConvo. Per open, the
same bookkeeping as mech (openIdx join key, exchangesAtClose,
turnLines, held) plus transcriptBeats / themBeats. Caps: 200 beats
per sitting (the engine's own transcript cap), 20000 lines per
seed. Same pure observer discipline (no RNG draws, no state
writes). The ove48-mech instrument is NOT modified; the
talktranscript driver uses the talktranscript instrument.

## (b) Drive-naming classifier — DRIVE LEXICON (pre-registered, VERBATIM from sim-ove48-mech-prereg.md)

A held conversation's NON-OPENER transcript beat (a 'them' beat
with seq >= 1; the opener beat is the pick's output, not the
sitting's speech) counts as drive-naming for that open's dawn drive
if it matches the drive's plain-word lexicon below
(case-insensitive, word-boundary where noted) OR the generic
dawn/commitment words. Opener-beat matches are reported separately
as secondary (they must NOT carry the GO). Drives with no lexicon
entry in the game are still classified by the generic words only.
The lexicon is reused VERBATIM — only the capture channel changes,
so a GO/NO-GO flip here is attributable to the channel, not to a
lexicon change. (The proof test deep-equals this lexicon against
scripts/ove48-mech-analyze-20261114.js.)

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

SECONDARY (reported, not judged): the ex-"promise" share — the
same classifier with "promise" removed from GENERIC. Rationale
(recorded here, not applied to the verdict): "promise" matches
favor-talk, not drive-talk, and endConvo's want-closing beat can
speak a promise at the goodbye, so a sitting could count as
drive-naming via its farewell. The mech scratch probe's ex-promise
share was 42.9% (vs 62.5% with "promise") — both above the bar,
but the coordinator should see both numbers.

QUOTED-ONLY SECONDARY (reported, not judged): the share of held
sittings whose drive-naming turn beat is a QUOTED beat (text
contains '"'). Rationale: a few 'them' beats in the transcript are
unquoted interface narration, not spoken words (smoke test: "You
need edible, unspoiled food in your pack…" and clue beats like
"The ground remembers."). If the naming share holds on quoted
beats alone, the verdict is about speech, not narration.

Sitting length: `exchanges` at close (conversation.js `c.exchanges`).
Held sitting: exchanges >= 1. Aligned vs misaligned: the analyzer's
`isAligned` on the open (weighted-pick opens with dawn state; same
DAWN tables as ove48-mech, diffed against the subject source by the
proof test).

## Pre-registered bars (judge exactly this)

(b) UNSPOKEN DRIVE, SPOKEN CHANNEL — GO (both halves): (i) ≥25%
    of held conversations (pooled across both talk legs; per-leg
    reported) contain a drive/commitment-naming NON-OPENER
    transcript beat ('them', seq >= 1) for the opener's dawn drive;
    AND (ii) mean sitting length (exchanges) higher on
    dawn-aligned opens than misaligned opens (pooled held sittings;
    per-leg reported). NO-GO: instrument valid but either half
    misses — in particular NO-GO if 0 transcript beats name the
    drive on either leg. INSUFFICIENT (DIAG, not NO-GO): the
    aligned-vs-misaligned split has <10 held sittings on a side
    pooled — the length half cannot be judged.
    Validity for talk legs: V1 opens ≥200/leg; V2 ≥95%
    classified/leg; V3 dawn reads >0 subject / =0 base; V4 0
    instrument errors; V6 ≥20 held sittings (exchanges ≥1) per leg
    (else the policy did not hold and the leg cannot judge (b)).
    V5 replication does NOT apply (COMPETENT_TALK changes the
    policy; trajectories are not band-3's).

## Secondary (reported, not judged)

Per leg: want distribution + TVD, pre-emptor rates, dawn-present
rate, opener-produced rate, opener threads, stage-at-close,
pickDawn cross-check agreement, wall numbers (survived/8,
national/table/wins, wave-5, median survival, death-cause shares),
per-seed aligned shares, per-drive alignment, held-sitting count +
exchanges distribution + drive-naming share with opener beats
included (talk legs), ex-"promise" drive-naming share (pooled +
per-leg), quoted-only drive-naming share (pooled + per-leg),
transcript-beat counts (them-beats per held sitting,
sittings with zero them-beats).

## Metric review (section in the evidence file)

Pre-registered here so the evidence carries it: if any bar
misses, write under "metric review" whether the bar or the
instrument was wrong (e.g. the 25% drive-naming bar too strict
for a lexicon over transcript beats; the aligned/misaligned split
too thin because deepTalk targets want-holders first; the
goodbye/closing beats inflating the naming share via "promise"),
and propose the revision for the NEXT run. Do not re-score this
run. If the verdict flips to GO on the transcript channel, say
plainly that the ove48-mech (b) NO-GO is superseded as a channel
finding — the villagers were speaking the drive all along, the
old instrument was deaf to it.

## Fix policy

Bisect prereg §Fix policy binds this arm: no game-code change
lands from this measurement arm. This arm builds instrument
scripts + evidence only. ZERO src/js changes. No revert, no keep
decision — that call follows with (b) settled on the spoken
channel (coordinator/Steve).

## Freshness / band note

Deliberate reuse of band 190457–190464 (band 3) for both legs.
This is NOT a freshness violation: the transplant protocol reuses
the band where the effect was proven, so the mechanism is measured
on the same trajectories. The band is named in the band-3
prereg/evidence and the 2115Z round record; no new band is
consumed.

## Ordering note

Subject verification ran as part of prereg preparation, before
this file was committed (same precedent as the band-3 prereg).
The binding requirement is met: this prereg is committed BEFORE
any judged sim runs. No STEP t-talktranscript-base / -subj corpus,
summary, or driver log exists at commit time. The stage-1 proof
(instrument validation on a scratch seed, 30d, unjudged, including
the one-sitting smoke test) is committed WITH this prereg, same as
the band-3 arm.
