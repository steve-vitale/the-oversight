# sim-contactrec2-a — evade-row HP gap, closed policy-side; contact class re-census on a fresh pilot (DIAG-GO)

Run: Loop A worker, axis scale-onramp (converging, NOT converged),
run fleshout-loop-a-20261101T0125Z. Arm type: DIAG, instrument
ONLY. ZERO files under src/ changed in this branch (verified:
`git diff` against base shows no src/ path; the sibling arm
sim-contactfinish-a owns game-code changes to src/js/fieldFights.js
this run, untouched here). No spikecontact/contactrec/
contactfinish recorder or analyzer file edited; sibling Loop B
food-economy work untouched; main tree untouched.
Pre-registration: evidence/2026-10-31/sim-contactrec2-a-prereg.md
(committed BEFORE any judged sims, commit 8ffb60a92; I/O-only
amendment committed before any judged verdict — see
"Infrastructure" below; no GO threshold, seed, policy, or
classifier change at any point).
Candidate instruments: scripts/policies/contactrec2-diag.js
(emission-independent recorder), scripts/contactrec2-sweep-20261031.js,
scripts/contactrec2-split-20261031.js,
scripts/contactrec2-contact-20261031.js (contact analyzer with
spear-inclusive sensitivity), scripts/contactrec2-det-20261031.sh,
scripts/contactrec2-det-compare-20261031.js,
scripts/contactrec2-parse-20261031.js (byte-identical copy of
the shared parser), scripts/test-contactrec2-20261031.js.
Proof test: scripts/test-contactrec2-20261031.js (20 passed,
0 failed on synthetic + file-content + classifier sections;
corpus section runs once the analysis JSONs are written —
see "Landing status").

## Question (from sim-contactbreak-a / sim-spikecontact-a)

Evade rows systematically lacked mHpStart/mMaxHp in the landed
fieldfinish2 corpus, and evades are exactly where contact-shaped
rows concentrate, so the judged contact share was a FLOOR
(baseline 27-36/104, lever 0-4/71). Spikecontact's prereg states
the contact-finish BUILD must not silently inherit a floor.
This arm closes that gap for the next BUILD judgement — with a
recorder that does NOT depend on the sibling-owned
src/js/fieldFights.js emission, so the BUILD judgement survives
whatever the sibling arm does to that file.

## Code reading (before any judged sims; the finding that shaped the arm)

In current src/js/fieldFights.js (this branch's base):

- Members construction: for pi == 0 with a world entity m,
  php = m.hp and pmax = m.maxHp; for ephemeral (m null),
  php = lroll(hpDef) inside [lo, hi] and
  pmax = max(php, hpDef[1]) = hpDef[1] exactly.
- Emission (~lines 643-644): rec.mHpStart = members[0].hp,
  rec.mMaxHp = members[0].maxHp, placed immediately after
  members construction and BEFORE every return path below it
  (no `return rec` inside fieldFight precedes it).
- Awareness evade return (~lines 833-838): outcome 'evade',
  rec.mHpLeft = members[0].hp, then return. It follows the
  emission, and no damage has landed before it (it precedes
  ambush, volley, and all rounds).

Therefore, for an evade row, opening HP = rec.mHpLeft EXACTLY,
and for an ephemeral evade, max HP = mdef.hp[1] EXACTLY —
both provable from engine order, not estimated. The evade gap
is closable POLICY-SIDE, with no game-code change. The
candidate recorder therefore deliberately NEVER reads
rec.mHpStart/rec.mMaxHp (proven by file-content assertions in
the proof test, which strip // comments before matching).
Rule: (a) pre-call world-entity HP when m is non-null;
(b) evade-only exact fill mHpStart = rec.mHpLeft and, when
m is null, mMaxHp = mdef.hp[1]. Rule (b) NEVER fills a fought
row's mHpStart (unrecoverable post-hoc); the m-null band-top
max is an equality from members construction, not a
derivation, and applies to fought rows' maxima as well
(exact, same proof). Consequence, stated plainly: the
candidate leg leaves fought ephemeral rows UNCLASSIFIED
(missing:mHpStart) by design — that remainder is exactly the
set the landed emission resolves, and it is why a BUILD
judgement that needs fought-row HP must use the
emission-carrying recorder (spikecontact), while a BUILD
judgement on evades needs no emission at all.

## Control-driver step (base-pinning discipline)

Prior instrument verbatim (spikecontact sweep, SPIKECONTACT=1)
on 2 pilot seeds (87104, 87127) on this base, to a worktree
scratch dir deleted before commit: dayHash arrays
BYTE-IDENTICAL to the spikecontact judged pilot corpus on
both seeds (159/159, 127/127), end fields identical, and
fieldFights arrays byte-identical. The base moved (ship bump,
chorus-hold BUILD landing, coordinator evidence) without
moving trajectories on the control seeds.

## Fresh pilot (judged legs, 8 seeds, identical policy stack except recorder)

Policy stack, both legs:
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, plus SPIKECONTACT=1 (BASELINE leg, spikecontact
recorder verbatim) or CONTACTREC2=1 (CANDIDATE leg, new
recorder). Horizon 200 loop-days, death-aware cap. Seeds:
87104, 87109, 87119, 87124, 87140, 87115, 87123, 87127.
Recorder errors 0 on every seed of every leg.

Trajectory identity, candidate vs baseline (the internal
comparison that matters): dayHash arrays + end fields
IDENTICAL on all 8 seeds (verified per seed through the
compact extractor; see "Infrastructure" for why compact
verification was used). The candidate recorder moves no
trajectory, as designed (pure reads + post-delegation
recording, zero game-state writes, zero RNG draws).

Base drift vs the spikecontact judged corpus (reported, not
averaged away): 7 of 8 baseline-leg seeds are byte-identical
to spikecontact's pilot corpus (hashes, ends, fieldFights).
Seed 87123 diverges: first differing dayHash at day 76
(one state field 4 vs 3, another 269 vs 267), gameDays 115 vs
112, all other end fields identical (won, national, table,
wave-4, global, lesser seat). The plausible cause is the
landed chorus-hold BUILD (fieldFights.js game change between
the anchors: spikecontact pilot anchor e890a2890, this
branch's base dbe04551): s87123 is the chorus-heavy seed
(9 CONTACT meetings on spikecontact's band), and a
committed-fighter hold through a downbeat dance round changes
chorus-fight outcomes exactly where this seed lives. The
divergence is a game-code landing effect, not a recorder
artifact — the baseline leg uses the spikecontact instrument
verbatim. Consequence for D4: this band is a NEW band, not a
re-measurement of spikecontact's band, and its BUILD numbers
restate spikecontact's (see D4 below).

## Headline numbers (per leg, never pooled)

### BASELINE leg (spikecontact recorder verbatim, current base)

| Metric | Value |
| --- | ---: |
| Total wave-3 field meetings | 86 |
| CONTACT n (share) | 13 (15.1%) |
| FOUGHT n (share) | 73 (84.9%) |
| UNCLASSIFIED n (share) | 0 (0.0%) |
| Reconciliation | 13+73+0 = 86 ✓ |
| Evade rows / HP-captured | 13 / 13 (100%) |
| Evade CONTACT meetings | 0 (all 13 evades are healthy-beast avoidances, classified FOUGHT) |
| CONTACT by outcome | mFlee 13, evade 0 |
| BUILD universe (finishable mFlee) | 10 |
| No-real-instrument mFlee remainder | 3 |
| Spear-inclusive BUILD universe | 11 |
| Unarmed-inclusive sensitivity | 13 |
| Lie rate (mFlee drive-offs) | 13/13 = 100% (no-ranged-at-all 9, bow-no-arrows 3, other-ranged-no-arrows 1; lie-with-melee 10) |

### CANDIDATE leg (contactrec2 recorder, emission-independent)

| Metric | Value |
| --- | ---: |
| Total wave-3 field meetings | 86 |
| CONTACT n (share) | 13 (15.1%) |
| FOUGHT n (share) | 67 (77.9%) |
| UNCLASSIFIED n (share) | 6 (7.0%), all reason missing:mHpStart |
| Reconciliation | 13+67+6 = 86 ✓ |
| Evade rows / HP-captured | 13 / 13 (100%) |
| Evade CONTACT meetings | 0 (same 13 healthy-beast avoidances, classified FOUGHT) |
| CONTACT by outcome | mFlee 13, evade 0 |
| BUILD universe (finishable mFlee) | 10 |
| No-real-instrument mFlee remainder | 3 |
| Spear-inclusive BUILD universe | 11 |
| Unarmed-inclusive sensitivity | 13 |
| Lie rate (mFlee drive-offs) | 13/13 = 100% (same split as baseline) |

The candidate CONTACT set is IDENTICAL to the baseline
CONTACT set (same seed/day/monster/HP keys on all 13 rows;
no CONTACT row is expedition-caller, so none depends on the
emission). The 6 candidate unclassified rows are exactly the
6 fought ephemeral rows the census predicts (baseline
caller census: expedition non-evade rows = 6: s87119 d79
chorus vFlee; s87124 d33 chorus vKill + d33 chorus mFlee;
s87140 d182 callback vFlee + d182 ad_break vFlee; s87127
d122 ad_break vFlee). No other row differs between legs.
The candidate leg therefore proves the evade gap closes
without the emission, and prices the emission's remaining
value precisely: 6 fought ephemeral rows per 86 meetings
(7.0%), zero of them contact-shaped.

### Per-seed candidate band (total / contact / fought / unc / evade captured / BUILD)

- 87104: 11 / 2 / 9 / 0 / 0-0 / 2
- 87109: 6 / 0 / 6 / 0 / 2-2 / 0
- 87119: 3 / 0 / 2 / 1 / 0-0 / 0
- 87124: 10 / 0 / 8 / 2 / 6-6 / 0
- 87140: 28 / 7 / 19 / 2 / 4-4 / 7
- 87115: 11 / 2 / 9 / 0 / 0-0 / 1
- 87123: 15 / 2 / 13 / 0 / 1-1 / 0
- 87127: 2 / 0 / 1 / 1 / 0-0 / 0

## GO verdict: DIAG-GO (all four bars hold)

- D1 (100% classified-or-explicitly-unclassified, reconciled,
  BOTH legs): baseline 13+73+0 = 86 ✓; candidate
  13+67+6 = 86 ✓, every unclassified row carrying reason
  missing:mHpStart.
- D2(a) (candidate classifies >= 90% of fresh-pilot evade
  rows, no invented HP, capture point stated + no-derivation
  proven): 13/13 = 100%. Capture points: pre-call entity HP
  (m present) or the awareness-evade return's mHpLeft
  (= members[0].hp, before any damage) plus the m-null
  band-top max (= members[0].maxHp by construction). No
  derivation: fought rows are never filled, and the proof
  test asserts the emission is ignored even when present in
  rec. Outcome (b) (exact game-code spec) is NOT needed —
  the evade path provably reaches policy-visible values, and
  the candidate leg proves it empirically. For the record:
  had a spec been needed, the emission point would be
  fieldFights.js ~line 643 (after members construction,
  before the alreadyDead and awareness returns) — but no
  game change is proposed or needed for evades.
- D3 (det-gate / instrument purity): recorder ON vs OFF
  dayHash arrays + end fields byte-identical on 2 pilot
  seeds (87104, 87127; OFF leg run through the same sweep
  without CONTACTREC2, hashes identical to the ON leg via
  the baseline leg's byte-identity on those seeds); judged
  pilot seed 87124 re-run reproduces its judged compact
  output exactly (total 10, contact 0, fought 8,
  unclassified 2 — the same d33 vKill + d33 mFlee rows —
  evades 6/6 with identical HPs, hashes identical).
  Full-JSON byte comparison awaits file materialization
  (see "Infrastructure"); hashes + all judged fields are
  identical, which is the substance of the gate.
- D4 (BUILD-universe sensitivity): restated below — YES,
  the BUILD prereg numbers need restating for the current
  band.

## D4 — BUILD-universe restatement (read this before writing the BUILD prereg)

Spikecontact's BUILD prereg numbers were 14 / 17 / 20
(primary finishable-mFlee / spear-inclusive /
unarmed-inclusive), remainder 6 / 3 / 0, on spikecontact's
fresh-pilot band (92 wave-3 rows, 20 CONTACT meetings).
On THIS fresh-pilot band (86 wave-3 rows, 13 CONTACT
meetings), with evade rows resolved (all 13 evades are
healthy-beast avoidances, 0 evade CONTACT meetings — evades
were never in the drive-off universe, and they still are
not), the numbers are:

- PRIMARY finishable-mFlee BUILD universe: 10 (not 14)
- SPEAR-INCLUSIVE: 11 (not 17) — the single spear row is
  s87123 d112, Luis, Hunting spear in the ranged slot, no
  melee, beast at 1 HP
- UNARMED-INCLUSIVE sensitivity: 13 (not 20)
- No-real-instrument mFlee remainder: 3 (not 6) /
  spear-remainder 2 / unarmed-remainder 0

The BUILD prereg numbers NEED RESTATING if the BUILD is
judged on current master: use 10 / 11 / 13, remainder
3 / 2 / 0. Spikecontact's 14 / 17 / 20 remain valid for
ITS band and must not be quoted as current-band numbers;
the two bands must not be pooled. The move is concentrated
in s87123 (CONTACT 9 → 2), consistent with the chorus-hold
landing changing chorus-fight outcomes on the chorus-heavy
seed; s87140's CONTACT count is unchanged (7). The
evade-resolution itself moves nothing: evades were FOUGHT
on both bands, so the 27–36-style dark-matter range does
not reappear here — the candidate leg's evade capture is
100% and its evade CONTACT count is 0.

## Sense-testing (SENSE-TESTING LAW — transcripts read in full)

Candidate-direct reads (from candidate-leg output):

1. Evade, s87109 d63, Buffering at 314/340 (0.92): "Leo saw
   Buffering in time and gave it room." A healthy beast
   spotted early is given room — HP and narration agree.
2. Evade, s87124 d95, Terms of Service at 412/420 (0.98):
   "Theo saw The Terms of Service in time and gave it room."
   Same agreement at near-full health.
3. Contact, s87104 d148, Callback at 1/260, Weronika, crowbar
   melee, no ranged: "Weronika drove The Callback off with
   the bow — it broke before it ever closed." The beast
   reads broken in HP (1 HP) and broken in narration — but
   the instrument is still the lie: Weronika holds a crowbar,
   not a bow, and no weapon line precedes the drive-off.
4. Contact, s87104 d157, Callback at 1/260, Theo, kitchen
   knife: same shape — 1-HP beast, knife-holder, "with the
   bow".
5. All 13 candidate evade logs (0.81–0.98 of max, all
   caller=expedition): each is the single "saw X in time and
   gave it room" line. Zero HP/narration mismatches: no
   evade beast reads broken, no contact beast reads healthy.
   The newly captured HP values match what the narration
   implies in every case read.

Carry-over (same meetings, trajectories byte-identical, so
the baseline logs are the same meetings' logs; instrument
fields on the candidate leg confirm the same states):

- The bow-no-arrows contradiction persists unchanged:
  s87115 d84 Dmitri (Crude bow, 0 arrows, no melee),
  s87123 d89 David (Crude bow, 0 arrows, no melee),
  s87140 d165 Mia (Crossbow, 0 arrows, sharpened stick) —
  each log carries the "has X but no arrows — the string
  stays drawn, useless" line directly above "drove X off
  with the bow". A future BUILD must still not let a
  no-arrows bow count as the finish instrument.
- The spear edge persists: s87123 d112 Luis, Hunting spear
  in the ranged slot, beast at 1 HP, single line "drove The
  Ugly Beast off with the bow" — no weapon line at all. The
  BUILD prereg must still decide the spear explicitly
  (this arm's primary counts it no-instrument; the
  sensitivity counts it finishable).
- The re-served-beast finding persists: s87140 meets the
  same Spool at 29/280 on d163, d165, d169, d171, and the
  same Redactor at 16/260 on d191, d194, d195 — a wounded
  beast nobody finishes keeps coming back. A contact-finish
  rule would resolve these repeats; the drive-off rule as
  shipped repeats them.
- Lie rate unchanged at 100% (13/13): the drive-off line
  credits "the bow" for fighters holding no ranged weapon
  (9), a bow with no arrows (3), or a spear with no arrows
  (1) — including 10 cases where a real melee weapon goes
  unnamed. Naming the real weapon only helps if the BUILD
  also requires holding it.

## Wall numbers (fresh-pilot band, per leg identical — never pooled)

National 7/8, table 7/8, wins 7/8, wave-4 5/8, wave-5 0/8,
full seat 0/8 (bestSeat: lesser 7, none 1), median survival
121d, max 197d. Per seed (gameDays): 87104 159 won/global/w4;
87109 146 lost/regional/w4 (the one non-win, non-national
seed); 87119 90 won/global/w4; 87124 112 won/global/w4;
87140 197 won/national/w3; 87115 90 won/global/w3; 87123
115 won/global/w4; 87127 127 won/global/w3. Full seat 0 and
wave-5-reached 0 stand. No wall movement is claimed: this is
a DIAG arm, no lever was judged. Arc reach, four-realm
formation, trap acquisition by source, counter discovery
rates, and young-link succession survival are NOT in this
corpus — unmeasured, not zero.

## Metric review (mandatory, §14)

- The candidate recorder's deliberate emission-blindness
  costs exactly the fought ephemeral remainder (6 rows,
  7.0% of the band, zero contact-shaped) and buys
  independence from the sibling-owned src file. That is the
  right trade for an evade-gap arm, and the wrong trade for
  a BUILD judgement that needs fought-row HP — the BUILD
  must use the emission-carrying recorder for fought rows,
  and may use either recorder for evades. State the choice
  in the BUILD prereg; do not inherit a recorder silently.
- The fresh-pilot band moved vs spikecontact's band
  (92 → 86 rows, CONTACT 20 → 13, BUILD 14 → 10), driven by
  s87123. A DIAG arm re-measuring on a moved base must
  report the new band as the new band, as done here — the
  spikecontact numbers are not "wrong", they are last
  band's numbers.
- The classifier's rounds <= 1 bound remains untested by
  real rows (all 13 contact rows are rounds-0 mFlee; no
  rounds-1 or evade-outcome contact row occurs even with
  full capture — the 13 corrected evades are all
  healthy-beast FOUGHT). A future arm wanting rounds-1 or
  evade-outcome contact rows must find them first; they do
  not occur here.
- The prereg's two-outcome framing held: outcome (a)
  landed, so no spec was needed. The spec fallback's
  location note (fieldFights.js ~line 643) is recorded
  above for completeness, not as a proposal.
- Control-driver scope, stated not overstated: the
  2-seed control licenses same-trajectory citation at that
  scope; the 8-seed baseline leg extends trajectory
  identity to the full band for the candidate comparison,
  and the 1-seed s87123 divergence vs the old corpus is
  reported as base movement with its plausible cause, not
  hidden inside an average.

## Infrastructure (EPERM flap — read before judging the landing state)

A container EPERM flap (write(2) returning EPERM, the known
2026-10-23/24 class) hit this run from ~01:58Z and was still
active at last probe (~02:45Z):

- The candidate sweep's console.log-to-redirect path lost
  seed lines three ways: loud EPERM on seed 87119's JSON
  line (three 8-seed attempts), and silent 0-byte files on
  clean exits (same command gave 232934 bytes once and 0
  bytes once for seed 87104). Buffered stdout is lost when
  the process dies on a later line's EPERM.
- safe-commit.sh failed three times on its /tmp private
  index (sha1 lock write EPERM) — including for the I/O
  amendment commit below. This is an environment failure,
  not a safe-commit refusal: no --force-delete was used, and
  no bare git commit was made.
- Shell-spawned writes fail everywhere right now (worktree
  and /tmp, small and large, python and node); file creation
  succeeds (0-byte files appear) but data writes EPERM.
  The muse.write tool path still writes, and pipes + tool
  capture still flow — which is how this arm's numbers were
  verified (see next paragraph).

Recovery used (documented, no metric touched): the candidate
sweep gained an optional CONTACTREC2_OUT path (append with
writeFileSync + byte-size verification + retry, the
splitter's writeResilient pattern; JSON content identical to
the console.log path), committed as a prereg I/O amendment
before any judged verdict — but that amendment commit itself
is currently blocked by the flap (see "Landing status").
Judged candidate numbers were then verified through a
read-only compact extractor (scratch-contactrec2-diag/
extract-compact.js, written via muse.write): per-seed sweep
output piped through it, printing wave-3 rows + summaries +
dayHash identity vs the baseline leg, with no file writes.
Every number in "Headline numbers" above comes from that
live candidate output (or the on-disk baseline corpus), not
from prediction — the pre-registered prediction (candidate
86 / 13 / 67 / 6, evades 13/13) matched the measured
candidate band exactly, which cross-validates both.

## Landing status (honest state at closeout)

- COMMITTED: prereg (8ffb60a92), candidate instruments
  (dbe04551: recorder, parser copy, sweep, splitter,
  contact analyzer, det scripts, proof test).
- VERIFIED BUT NOT YET FILE-COMMITTED (flap-blocked, in
  worktree as uncommitted modifications + untracked files):
  prereg I/O amendment + resilient sweep writer
  (evidence/2026-10-31/sim-contactrec2-a-prereg.md [M],
  scripts/contactrec2-sweep-20261031.js [M] — modifications
  present in the worktree, commit blocked by the flap);
  this evidence file (evidence/2026-10-31/
  sim-contactrec2-a.md [??], written via muse.write);
  baseline corpus (evidence/2026-10-31/
  contactrec2-baseline.jsonl [??] + .err [??] +
  perseed-contactrec2-baseline/ [??] — on disk,
  uncommitted); compact-verification tool
  (scratch-contactrec2-diag/extract-compact.js [??] — the
  read-only extractor used for all candidate-leg
  verification above; commit it with the evidence or keep
  it as scratch, coordinator's call);
  candidate compact verification (per-seed summaries above;
  full candidate corpus JSONL + per-seed JSONs NOT yet
  materialized — they require shell file writes).
- PENDING AT LANDING (coordinator: do these when writes
  recover, before merging): (1) retry safe-commit for the
  amendment + sweep change; (2) re-run the candidate sweep
  with CONTACTREC2_OUT to evidence/2026-10-31/
  contactrec2-candidate.jsonl, split to
  perseed-contactrec2-candidate/, and verify dayHash
  identity vs the baseline leg + the compact numbers above;
  (3) run the contactrec2 analyzers with --out to write
  contactrec2-analysis-baseline.json and
  contactrec2-analysis-candidate.json; (4) re-run the proof
  test (corpus section exercises then) and
  `node scripts/check.js --quick`; (5) commit evidence +
  corpora + analyses via safe-commit, verify
  `git status --short` empty after index-clobber repair if
  it recurs, then --ff-only merge. If master moved under
  this branch via sibling landings, do NOT merge here —
  rebase onto current master + proof re-run is needed at
  landing.
- The DIAG-GO verdict does NOT depend on the pending file
  steps: every judged number above was measured from live
  candidate output (compact extraction) and the on-disk
  baseline corpus, with trajectories proven identical by
  dayHash. The pending steps materialize and commit that
  evidence; they are not expected to change any number
  (deterministic re-runs reproduce the same meetings —
  demonstrated by the 87124 re-run).

## Village assessment (plain words)

The village's wave-3 meetings now read clearly at both ends.
When a villager spots a healthy beast in time, she gives it
room and walks on — thirteen times on this band, every one a
whole beast at four-fifths health or better, and the story
says so honestly. When she meets a beast already broken, the
story still lies about the weapon: thirteen times out of
thirteen meetings the line says "with the bow" — for
crowbar-holders, knife-holders, a spear-holder, and people
holding bows with no arrows at all. Ten of those thirteen
broken-beast meetings could honestly become real finishes
under a rule that costs a weapon strike instead of giving
the flee away free; three could not, because the villager
holds no usable weapon. That ten is the next BUILD's
universe on this band — down from fourteen last band,
because the chorus-hold landing changed what the
chorus-heavy seed's fights look like. And the gap this arm
was asked to close is closed where it matters: a recorder
that never touches the sibling-owned game file still reads
every evade beast's health exactly, so the next BUILD need
never again judge a contact share from a floor.

## Blanks filled or documented

- FILLED (measured): the evade-row HP gap, closed
  policy-side without the src emission — evade capture
  13/13 = 100% on the candidate leg, with the capture point
  and the no-derivation proof; the fought-ephemeral
  remainder priced at 6 rows (7.0%, zero contact-shaped).
- FILLED (measured): the contact class re-census on the
  fresh pilot band — 13 CONTACT meetings (15.1%), BUILD
  universe 10 / 11 / 13, lie rate 100%, with the D4
  restatement the next BUILD prereg must use.
- DOCUMENTED (future arms, not built here): the
  chorus-hold base drift on s87123 (report legs separately,
  never pool bands); the re-served-beast repeats (same
  wounded Spool/Redactor met 4×/3×); the no-arrows and
  spear narration lies, unchanged.
- NOT re-opened: the break line, the 60% HP gate, the
  engage intent gate, the committed-finish NO-GO history,
  any gate threshold, or the diverged lever leg's zero.

scale-onramp stays converging (NOT converged): a DIAG arm
lands no game change, and no wave-5 or full-seat reachability
is shown. food-economy untouched (sibling Loop B lane).
DIAG-GO means the numbers above are citable for the next
BUILD arm — on this band, with the restated 10 / 11 / 13.
