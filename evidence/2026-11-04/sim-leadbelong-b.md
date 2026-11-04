# LEAD-vs-BELONG shape reporting — Loop B, arm sim-leadbelong-b

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: scripts +
analyzer + evidence, ZERO src/js changes. This arm is the third
named next blank from Loop B run 0730Z (coordinator evidence
`evidence/2026-11-04/sim-winnability-round-0730.md`, arm
sim-diplo-b): 12 context proposals -> 12 links, 11 direct
accepts plus 1 counter-accept that flipped Haven into
subordinate (99401 village_1), plus a say-line over-catch
note. The question: for every link, which side LEADs and
which BELONGs — and does shape predict anything? When a
counter is accepted, how often does the shape flip, and
does shape correlate with seasoning, holding, or diplomacy
value?

NO gate/price/deed change follows from this arm, whatever
it finds. A diagnosis names the next lever; it does not
turn it.

## Pre-registration (committed before any judged analysis)

Full text: `evidence/2026-11-04/sim-leadbelong-b-prereg.md`
(commit b143a1e41, before any judged analyzer run).
In short:

- Corpus: the stored sim-diplo-b corpus, 8 files under
  `evidence/2026-11-04/perseed-diplo-b/` — leadcourt
  99401–99404 (140d, death-aware) + competent long-horizon
  99405–99408 (180d cap, death-aware). All 8 files were
  present with the diplo anchor; no file was re-derived,
  nothing was invented or filled from another seed.
- Canon: docs/CANON.md first, then docs/SCALE.md (the scale
  canon — the manifest does not list it, but the file
  exists and hierarchy.js cites it): six roads, LEAD =
  Haven primary of >=3 active subordinates, BELONG =
  Haven subordinate in good standing (trust >=50, arrears
  0, age >=14d) to a primary whose realm holds >=4
  villages, COVENANT/TRADE = >=3 seasoned peer links,
  seasoning = 30+ days AND trust 40+, diplomacy = 34 x
  seasoned REGIONAL+ links, a lone splinter bond scores 0.
- Shape read from link objects (primary / subordinate,
  kind + a/b, conquered flag), never from a say-line.
  Formation day = first daily snapshot showing the link
  id. Flip = a counter proposal whose intent shape
  (opts.asSubordinate) differs from the resulting link's
  shape at formation, formed via answerCounter accept.
- PRIMARY METRIC + DIAG BAR: reporting completeness +
  quantified flip rate. DIAG iff (1) 8/8 seeds carry a
  per-seed shape table (including explicit 0-link
  tables); (2) every link id carries exactly one shape
  at formation and one at end, none unclassified;
  (3) the flip rate is quantified with all three
  denominators and every accepted counter is traced;
  (4) every link carries seasoned-ever, held-to-end,
  regional+-ever, and diplomacy value while
  seasoned-regional+. Otherwise DIAG-NO-CANDIDATE.
- PREDICTION RULE (binding, separate): shape-vs-outcome
  is a raw cross-tab only. NO "shape predicts X" claim
  unless >=3 BELONG AND >=3 LEAD links exist with
  divergent outcomes; below that, "no predictive claim
  possible on this corpus" and the corpus that could
  settle it is named. No correlation coefficient on a
  single-digit minority shape.
- SAY-LINE OVER-CATCH CHECK: the stored sayLines (the
  diplo instrument's SAY_RE capture) re-classified by a
  STRICT rule — diplomacy-relevant only if it names a
  proposal / counter-negotiation / decline / polity /
  codex-study event concerning another village, a "Word
  will travel" opinion line, the "don't know them well
  enough" gate, or "They're watching". A bare "counter"
  does NOT qualify (see metric review for why that
  clause had to be nailed down).
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic,
  no before/after change; no comparison is fabricated
  and none is attached.
- HARD LIMITS (binding, honored): zero src/js; no
  gate/price/deed change; no new sims (no file was
  missing, so the re-derivation path was not used); no
  sibling-arm files; no other worktree; no push, bump,
  or live verification by this worker.

## Anchor

Stored corpus anchor (anchorCommit on all 8 files, as
recorded by the diplo arm): the sim-diplo-b anchor. This
arm re-reads the stored files; it does not re-simulate
and does not pool these numbers with any other anchor's
numbers as a before/after claim.

## Per-seed shape tables (every link, every seed)

Shape at formation = shape at end on all 12 links: NO
link changes shape mid-life. "Held" = status active on
the seed's last daily snapshot. "RegDays" = days the
link's own detail read regionalPlus. MaxTrust = highest
trust reading on any daily snapshot.

### 99401 — leadcourt, 98d, village-lost, scale regional

| other village | shape | formed | seasoned | regional+ | held | maxTrust |
|---------------|-------|--------|----------|-----------|------|----------|
| Emberhold (village_0) | LEAD | d25 | yes, d55 | never, 0d | yes | 83 |
| Stonebridge (village_1) | BELONG | d27, via counter-accept | yes, d57, for ONE day only | never, 0d | NO — broken d97 | 68 |
| Thornfield (village_2) | LEAD | d27 | yes, d57 | never, 0d | yes | 71 |

Proposals: d25 LEAD -> direct accept (Emberhold);
d26 LEAD -> counter (Stonebridge); d27 answerCounter
accept -> BELONG link; d27 LEAD -> direct accept
(Thornfield). Seed diplomacy: 0 on every day.
Regional+ days: 0. Scale reads regional from d47
despite diplomacy 0 (rank is not the polity filter,
as the diplo pilot found).

### 99402 — leadcourt, 140d, SURVIVED, scale regional, wave 5 unlocked

| other village | shape | formed | seasoned | regional+ | held | maxTrust |
|---------------|-------|--------|----------|-----------|------|----------|
| Emberhold | LEAD | d25 | yes, d55 | yes, d60–88, 29d | yes | 84 |
| Stonebridge | LEAD | d26 | yes, d56 | yes, d60–88, 29d | yes | 100 |
| Thornfield | LEAD | d30 | yes, d60 | yes, d60–88, 29d | yes | 62 |

Proposals: 3 LEAD -> 3 direct accepts, 0 counters.
Max diplomacy 102 while all three links were
seasoned-regional+; diplomacy 0 at end (polity
dissolved d89, as the diplo pilot reported).
Readiness-5-ready days: 27 (the only seed in the
corpus with any).

### 99403 — leadcourt, 118d, village-lost, scale regional

| other village | shape | formed | seasoned | regional+ | held | maxTrust |
|---------------|-------|--------|----------|-----------|------|----------|
| Emberhold | LEAD | d25 | yes, d55 | yes, d57–116, 60d | yes | 62 |
| Stonebridge | LEAD | d26 | yes, d56 | yes, d57–116, 60d | yes | 80 |
| Thornfield | LEAD | d27 | yes, d57 | yes, d57–116, 60d | yes | 68 |

Proposals: 3 LEAD -> 3 direct accepts, 0 counters.
Max diplomacy 102 for the full 60-day window.

### 99404 — leadcourt, 76d, village-lost, scale regional

| other village | shape | formed | seasoned | regional+ | held | maxTrust |
|---------------|-------|--------|----------|-----------|------|----------|
| The Hungry Road (splinter) | LEAD | d34 | yes, d64 | never, 0d | yes | 72 |
| Thornfield | LEAD | d35 | yes, d65 | never, 0d | yes | 80 |
| The Hungry Road II (splinter) | LEAD | d47 | NO — village lost d76 at age 29d, trust 58 | never, 0d | yes | 58 |

Proposals: 3 LEAD -> 3 direct accepts, 0 counters.
Seed diplomacy: 0 every day. Two of three links are
splinter bonds (score 0 by rule), leaving only one
countable link — no polity can form from one link,
whatever its shape.

### 99405–99408 — competent, long horizon, all village-lost (67/84/78/37d)

0 proposals, 0 links, 0 counters on all 4 seeds.
Shape tables are empty BY OBSERVATION, not omitted:
there is nothing to classify, which is itself the
competent finding carried over from the diplo pilot
(the baseline never asks, so it never has a shape).

## Finding 1 — the flip rate, with all three denominators

- Accepted counters: exactly 1 in the whole corpus
  (99401, Stonebridge, d26 counter -> d27 accept).
- Flips: 1 (that counter, LEAD intent -> BELONG link).
- Flip rate: **1/1 accepted counters (100%)**,
  **1/12 proposals (8.3%)**, **1/12 links (8.3%)**.
- No BELONG->LEAD flip exists in the corpus (there
  are no BELONG-intent proposals: leadcourt proposes
  LEAD only, competent proposes nothing). No LEAGUE
  flip exists (there are no covenant/trade proposals
  and no peer links at all). The 100% figure is a
  denominator of one — it says "the only counter in
  the corpus flipped", not "counters usually flip".
  Any report quoting 100% without "1/1" is
  misreporting this arm.

## Finding 2 — shape does NOT predict seasoning

Cross-tab, seasoned-ever:

| shape | links | seasoned-ever | never seasoned |
|-------|-------|---------------|----------------|
| LEAD | 11 | 10 | 1 |
| BELONG | 1 | 1 | 0 |
| LEAGUE | 0 | — | — |

Both shapes season on the same 30-day schedule when
trust holds: LEAD links season at d55–65 (formation
+30, once tending lifts trust 30 -> 40+); the BELONG
link seasons at d57 (formation d27 + 30, trust 41).
The one unseasoned LEAD link is a time miss, not a
trust miss: formed d47, village lost d76 at age 29
days with trust 58 — one day short of the season.
The BELONG link's seasoning is the interesting case,
and it cuts against any shape story: it seasons, but
for exactly ONE day (d57, trust 41), then reads
unseasoned from d58 (trust 33) and never re-seasons.
Seasoning here is a trust-trajectory story, not a
shape story — see Finding 3 for why the trust fell.

## Finding 3 — the holding gap is confounded 100% by the tend filter (do not attribute it to shape)

Cross-tab, held-to-end (active on the last daily):

| shape | links | held | broken/lost |
|-------|-------|------|-------------|
| LEAD | 11 | 11 | 0 |
| BELONG | 1 | 0 | 1 (broken d97) |

Read alone, that table says BELONG links break and
LEAD links hold. Read with the policy code, it says
nothing about shape at all:

- leadcourt's tend loop tends ONLY links with
  `primary === 'haven'` (scripts/policies/leadcourt.js).
  The BELONG link (primary Stonebridge) received ZERO
  tendLink calls in 70 days — the courtshipEvents for
  99401 show tends only to the two LEAD links, weekly
  to d49. Its trust climbs on formation terms to a
  peak of 68 (d39), then decays without tending:
  68 -> 54 -> 47 -> 41 (d57, the one seasoned day) ->
  33 (d58) -> 16 (d70s) -> 0 (d85) -> broken (d97),
  the day before the village itself is lost (d98).
- The break is therefore a policy artifact: a
  LEAD-policy village that accidentally gains a
  BELONG link does not tend it, because its tend
  loop is written for links it heads. Whether a
  BELONG link held by a policy that tends it (e.g.
  belongseek, which pays tribute with arrears-0
  priority) would hold is UNMEASURED here — that is
  the named follow-up corpus, not a conclusion.
- The same confound applies in reverse to the LEAD
  links: 11/11 held is 11/11 tended links held, not
  proof that LEAD shape holds by itself.

## Finding 4 — shape predicts diplomacy value only through polity arithmetic, not per-link worth

Cross-tab, regional+-ever / diplomacy while regional:

| shape | links | regional+-ever | max diplomacy while regional |
|-------|-------|---------------|------------------------------|
| LEAD | 11 | 6 (all on 99402/99403) | 102 |
| BELONG | 1 | 0 | 0 (never regional) |
| LEAGUE | 0 | — | — |

Diplomacy is a polity property, not a link property,
and the per-link table misleads if read link by link:

- 99402/99403 (pure LEAD, 3 real-village links):
  all 6 links read regional+ together for 29 / 60
  days, paying the full 102 = 3 x 34. No single
  link "earns" 34 alone; the value appears only
  while all three hold seasoned at once.
- 99401 (2 LEAD + 1 BELONG, all seasoned at d57):
  diplomacy 0 on every day, including d57 when all
  three links read seasoned. The LEAD polity needs
  THREE Haven-primary subordinates; the flip left
  Haven with two. The BELONG link cannot count
  toward Haven's LEAD polity, and it never reads
  regional+ itself (a BELONG link counts only inside
  its primary's polity, and no Stonebridge polity is
  ever recorded in this corpus — the corpus does not
  record foreign polity composition, so whether
  Stonebridge's realm was short, or the link's trust
  was short, cannot be separated here; both were
  short at different times).
- 99404 (3 LEAD, 2 splinter): diplomacy 0 every day.
  Same zero, different cause — splinter bonds score
  0 by rule, leaving one countable link. Two seeds
  at diplomacy 0 with opposite shapes of failure:
  99401 fails on polity composition (shape mix),
  99404 fails on link countability (splinter).
- Seed-level consequence of the flip (descriptive,
  mechanism-backed, not a panel claim): the flip
  permanently capped 99401's LEAD polity at 2.
  leadcourt's proposal loop counts only
  Haven-primary subordinates and stops proposing at
  3; with all three known villages already linked
  (2 LEAD + 1 BELONG), no fourth proposal could
  restore a third LEAD subordinate. One counter-accept
  cost this seed its entire diplomacy income (0 vs
  102 on the pure-LEAD seeds) — not because BELONG
  links are worthless, but because a mixed-shape
  seed satisfies NEITHER polity's membership rule:
  too few LEAD subs for a LEAD realm, and no
  recorded foreign polity for a BELONG count.

Per the prereg prediction rule: with BELONG n=1,
LEAGUE n=0, and the holding result fully confounded
by the tend filter, NO predictive claim is made.
What the corpus supports is a composition claim:
polity value follows from the SET of shapes a seed
holds, not from any one link's shape — and a single
flip can move a seed from one polity's membership
rule to neither.

## Finding 5 — say-line over-catch, quantified (and a second, bigger capture hole)

Stored sayLines: 1,496 across 8 seeds (max 264 on a
seed, so the instrument's 400/seed cap never bound).
Re-classified by the STRICT rule:

| class | lines | share of captured |
|-------|-------|-------------------|
| Named over-catch, total | 619 | 41.4% |
| — gossip "opinions" lines | 270 | 18.1% |
| — COUNTER LEARNED lines | 208 | 13.9% |
| — reluctance "Not today" lines | 132 | 8.8% |
| — "proposed relief" journal lines | 8 | 0.5% |
| — keepsake-bond lines | 1 | 0.1% |
| Strict diplomacy | 79 | 5.3% |
| Other captured, non-diplomacy | 798 | 53.3% |

The "other" 798 are the instrument's wider catch:
combat-tactic "Counter:" journal/codex lines, pantry
"onto the counter" lines, chewing/encounter lines,
and haul lines — all matched by SAY_RE's broad
patterns ("counter", "opinion", "bond") but none of
them diplomacy. So the instrument's TRUE diplomacy
yield is 79/1,496 (5.3%), and within those 79, only
14 lines are about villages or polities at all: 12
"Word will travel" opinion lines and 2 GOVERNANCE
LAYER realm-built lines (99402, 99403). The other
65 strict lines are audience talk ("Do you think
they're watching right now?", "If they're watching,
let them watch me work") — matched by the diplo
pilot's own strict pattern, but about the audience,
not about another village.

The sharper hole: ZERO captured lines on any seed
narrate a proposal, a counter-negotiation, a decline,
or a covenant — pooled counts are 0 for "propos"
(other than "proposed relief"), "covenant",
"trade league", "decline", and village-context
"counter". The flip itself is narrated NOWHERE in
the captured sample: 99401's d25–28 say-lines
contain no proposal or counter line at all, only
the generic d25 "Coordination layer: warming up.
It'll be ready when the bond is." The link exists
in the ledger (proposalEvents + courtshipEvents +
daily detail all agree) but never in the village's
voice. Whether the game narrates proposals through
a channel this instrument does not wrap (a non-say
path) or does not narrate them at all is an OPEN
INSTRUMENT QUESTION, not a game finding — the
corpus cannot distinguish those two, and this arm
does not claim one. What it does establish: any
future shape reporting that relies on say-lines
alone will miss the flip entirely; shape must be
read from link objects, as this arm does.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

- The diplomacy transcript is silent where it
  should speak: 12 proposals, 1 counter, 1 flip, 3
  realm-builds (2 seeds reaching regional+), and not
  one proposal/counter/covenant line captured. The
  village's voice covers the audience, the pantry,
  and combat tactics in detail, and covers its own
  foreign policy not at all. That is the same
  silence the diplo pilot found under competent,
  now found under a proposing policy too — the
  silence is not a baseline-policy artifact.
- What IS narrated reads coherently: "Word will
  travel" lines state the opinion mechanism honestly
  (+2 clean hands, -4 turned away the hungry);
  the GOVERNANCE LAYER line on realm-build ("Four
  fires. One head... You built a realm. Try not to
  lose it the way you found it.") lands as a real
  consequence of deeds, not a counter increment.
  No robotic, static, or repeated DIPLOMACY dialogue
  was found, because almost no diplomacy dialogue
  was captured to judge — the repetition in the
  sample is audience lines and gossip lines, which
  are ambient, not diplomatic.
- The BELONG story, told from the ledger rather
  than the voice, reads as neglect, not drama: a
  village proposes as head, is answered with "you
  kneel instead", accepts, and then simply never
  sends grain to the bond it now owes — while
  diligently tending the two bonds it heads. The
  ledger story is legible and human (an accidental
  subordinate, untended); the missing piece is that
  no villager ever SAYS so.

## Village assessment (plain words)

Picture four villages that actually ask. Three ask
as head and are answered at once: three bonds each,
ripening in thirty days, two of them becoming a
realm that pays its people back in standing — one
holding 29 days, one holding 60, one of those
villages living long enough to meet the fifth wave.
The fourth village asks the same way and gets a
different answer from one neighbor: kneel instead.
It says yes, and that yes quietly costs it
everything the other villages gained — not because
kneeling is worthless, but because it now holds two
kinds of bond and neither kind adds up to a realm:
two bonds it heads are one short of a court, and
the bond it kneels in belongs to a court that never
forms on camera. Worse, the village keeps feeding
only the bonds it heads, so the kneeling bond
starves — trusted, then doubted, then broken the
day before the village itself dies. Meanwhile four
villages that never ask have no bonds at all, and
no shape to report: they live shorter, die younger,
and never meet the scale game. What is missing is
not a number. It is a policy that knows what to do
with a yes that changes the shape of the answer —
tend the bond you kneel in, or go find a third
bond you head — and a voice that tells the village
what it just agreed to.

## Wall numbers (8-seed corpus, for the record)

Wins 0/8. National 0/8. Table 0/8. Wave-4 unlocks
(maxWave >= 4) 6/8; wave-5 unlocks 1/8 (99402 only).
Wave-4 faced (waveEngaged(4) > 0 on any day) 6/8;
wave-5 faced 1/8 (99402 only). Readiness-5-ready
days: 27, all on 99402, 0 on the other 7 seeds.
Median survival 81 days (sorted 37, 67, 76, 78, 84,
98, 118, 140); 7/8 villages lost, 1/8 survived to
its horizon. Split: leadcourt median 108d (76, 98,
118, 140), 1/4 survived; competent-long median
72.5d (37, 67, 78, 84), 0/4 survived. Arc reach:
not instrumented by this corpus — stated, not
faked. These are corpus descriptions, not wall
movement and not a before/after claim (the corpus
is the diplo pilot's context legs, not a judged
leg, and its anchor differs from other arms').

## Metric review (§14 — no in-run re-scoring)

- The DIAG bar was judged exactly as written and
  is MET on all four legs: (1) 8/8 seeds carry
  per-seed shape tables, including explicit empty
  tables for the 4 competent seeds; (2) 12/12 links
  carry exactly one shape at formation and one at
  end, 0 unclassified, 0 mid-life shape changes;
  (3) the flip rate is quantified with all three
  denominators (1/1 accepted counters, 1/12
  proposals, 1/12 links) and the single accepted
  counter is traced proposal -> counter -> accept
  -> link; (4) every link carries seasoned-ever,
  held-to-end, regional+-ever, and diplomacy value
  while seasoned-regional+.
- The prediction rule held: no "shape predicts X"
  claim is made. The cross-tabs are reported raw,
  and the two apparent shape effects (holding,
  diplomacy) are both shown to be composition /
  policy confounds, not shape effects. A run that
  reported "BELONG links break" or "LEAD links pay"
  from this corpus would be misreading it.
- One implementation correction, disclosed, not
  hidden: the first judged analyzer run's STRICT
  rule matched bare "counter", which flooded the
  strict class with combat-tactic "Counter:"
  journal/codex lines and pantry "onto the counter"
  lines (the first run's strict counts were
  garbage: 50–162 per seed of mostly combat text).
  The classifier was corrected to the prereg's
  stated intent — a counter line counts only with
  village/tribute/primacy/terms context, and
  Journal/Codex "Counter:" lines are excluded
  outright (they also contain the word "terms":
  "on your terms") — the proof was extended to
  35/35, and the judged say numbers were recomputed
  from the stored corpus. The DIAG bar itself never
  moved, and the shape / flip / wall numbers are
  identical between the two runs (only say
  classification changed). Lesson for the next run:
  pre-register the strict classifier's test cases
  (combat Counter:, pantry counter) alongside the
  rule, not just the rule's intent.
- Say-line caveat carried forward: the stored
  sayLines are a capped SAY_RE sample, not a full
  transcript. The "zero proposal lines" finding
  means zero in the captured sample; a full
  transcript could in principle contain narration
  the sample missed (the sample is 1,496 lines over
  8 seeds, and the instrument wraps `say` only).
  The instrument question in Finding 5 stands
  regardless: shape reporting must not depend on
  say-lines.
- Balanced panel: still inapplicable (no change
  compared). Telemetry deviation check: the
  coordinator's step, not this arm's.

## Verdict — DIAG

Reporting complete (8/8 seeds, 12/12 links shaped,
0 unclassified), flip quantified (1/1 accepted
counters, 1/12 proposals, 1/12 links), cross-tabs
complete — and, per the binding prediction rule,
NO predictive claim: shape does not predict
seasoning on this corpus, the holding gap is fully
confounded by leadcourt's primary-only tend loop,
and diplomacy value follows from the seed's shape
SET (polity membership), not from any one link's
shape. NO gate/price/deed change follows.

## Next blank, precisely (no fix in this run)

1. A BELONG-intent proposing panel (belongseek or
   equivalent) at panel scale, with a policy that
   TENDS its subordinate links: does a tended
   BELONG link hold, season, and count — and does
   a foreign polity ever reach 4 in the corpus, so
   a BELONG link can read regional+ at all? Until
   that corpus exists, BELONG holding and BELONG
   diplomacy value are both unmeasured, and any
   claim about them is speculation.
2. A peer-link corpus (covenant/trade proposals)
   for LEAGUE shape: this corpus contains zero
   peer links, so LEAGUE seasoning, holding, and
   value are entirely unobserved.
3. An instrument fix, not a game fix: SAY_RE (or
   its successor) should anchor on first words,
   exclude combat "Counter:" and pantry "counter",
   and — more importantly — proposal/counter verbs
   need a dedicated event channel, because the
   current capture narrates zero proposals on 8/8
   seeds. Whether the game narrates proposals
   elsewhere is the open question to settle with
   that channel, before anyone claims the game is
   silent.
4. A policy question for the next proposing arm,
   not a lever: when a LEAD proposal flips to
   BELONG, should the policy (a) tend the BELONG
   link, (b) propose a replacement third LEAD
   subordinate from any unlinked village, or (c)
   both? On 99401, (a) alone would not have
   restored diplomacy (still 2 LEAD subs), and (b)
   alone would not have saved the BELONG link —
   the seed needed both, and the current leadcourt
   does neither.

## Proof and landing

- Proof: `scripts/test-leadbelong-20261104.js` —
  35/35 PASS (shape classifier LEAD / BELONG /
  LEAGUE / conquered modifier / unclassified, intent
  LEAD / BELONG / LEAGUE, say classifier
  over-catch classes + combat-Counter / pantry
  exclusions, synthetic LEAD+BELONG mini-corpus:
  seasoning, holding, flip detection both
  directions, direct-accept no-flip).
- Analyzer: `scripts/leadbelong-analyze-20261104.js`
  (reads only the 8 stored JSONs; summary output
  `evidence/2026-11-04/sim-leadbelong-b-summary.json`).
- Arm commits on branch sim-leadbelong-b
  (coordinator merges via --ff-only; committed on
  branch, pending coordinator merge — no push, no
  bump, no live verification by this worker):
  - b143a1e41 sim-leadbelong-b prereg (before any
    judged analysis)
  - 3d14ce88b sim-leadbelong-b instruments + proof
    31/31 (zero src/js)
  - 3c5330f99 strict say classifier fix (combat
    Counter lines excluded) + summary (proof 35/35)
  - (this landing) sim-leadbelong-b evidence
    (zero src/js)
- Files: prereg + evidence + summary JSON in
  `evidence/2026-11-04/sim-leadbelong-b*`; scripts
  `leadbelong-analyze-20261104.js`,
  `test-leadbelong-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus
  staged deletions in the worktree index after all
  three commits (prereg + instruments + fix);
  repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified
  `git status` empty + `git diff HEAD` empty. The
  commits themselves were always correct.
- Worktree state at handoff: only committed work
  after this landing commit; no uncommitted
  leftovers (verified before reporting).
