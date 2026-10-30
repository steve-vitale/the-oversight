# sim-dissolve-a — dissolved-meeting fates in the draftflag corpus (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met; the dissolved 120 are
fully classified, the lingerer-origin question is answered with
zero lacking a restore fate, and the fled half stays unobserved
as a measured zero, not an assumption).
Run: flesh-out loop, run fleshout-20261030T1122Z, worker
sim-dissolve-a, axis scale-onramp (blocking axis, converging,
NOT converged). DIAG ONLY — no game changes, no default flip,
no gate move, no deed-bar move. No [needs-eyes]: this arm
changes no feel, combat, or UI — it only analyzes an
already-recorded corpus.
Committed on branch, pending coordinator merge. No push, no
version bump, no live verification (the batch ship job owns
deploys).

Prereg: `evidence/2026-10-30/sim-dissolve-a-prereg.md` (committed
341cf596, BEFORE any judged analysis).
Corpus (read-only, untouched): `evidence/2026-10-30/perseed-draftflag-a/`
(the draftflag corpus — this arm ran NO new sweep and NO new
sims). Cross-check source (read-only, untouched):
`evidence/2026-10-30/sim-scholarmelt-a-analysis.json`.
Analysis: `evidence/2026-10-30/sim-dissolve-a-analysis.json`.
Analyzer: `scripts/analyze-dissolve-a.js` (pure: reads corpus
JSON, never touches game state, never writes into either
corpus). Fixtures: `scripts/test-dissolve-a.js`.

## What was asked

Blockedrestore counted 120 scholarmelt meetings with result
'dissolved-no-tbend' (s75102: 32, s75104: 45, s75105: 43) and
reported them UNMEASURED for the blocked-restore question,
because dissolved meetings end without a tbEnd call and
therefore have no tbend event by construction — with the
named missing hook "a dissolve-path recorder". This arm's
first job was reconciliation, not construction: the 0738Z
scholarmelt arm had already reported (finding #1491) 120
dissolved rows, all herald — 75 SCHOLAR-RESTORED, 45
SPAWN-ENDED, 0 dissolved melts — with the warning never to
read a dissolved result as a melt without a post-end
identity check. Were those the same 120?

## Reconciliation (the path choice, made before judging)

Yes — the same population, row for row, not merely the same
size:

- Same band (seeds 75101-75116), same 180d death-aware
  horizon, same tableseat-nowait policy and env, in both
  the scholarmelt arm and the draftflag arm whose corpus
  blockedrestore censused.
- The whole `scholarmelt` recorder field is VALUE-IDENTICAL
  between the two corpora on all 16 seeds (parsed-JSON
  equality of meetings + diag, per seed).
- Per-seed dissolved counts agree exactly (75102: 32,
  75104: 45, 75105: 43, all other seeds 0; band total 120).

**Path choice: PATH A.** The identity-check method already
covers this population — same rows, same fields, same
classifier inputs — so a new recorder + fresh sweep would
re-measure a fate that is already recorded. That is exactly
the redundancy the task forbade building. The gap that
survives reconciliation is dissolve CAUSE (which code path
dissolved each fight — no call-site field exists), not
dissolve FATE, and cause is ranked-next, not built here
(see ranked-next #1). Blockedrestore's "UNMEASURED" label
was true for ITS instrument (tbend events) and is not true
for the corpus as a whole: the scholarmelt field in that
same corpus already carries the post-end identity check
for every dissolved row.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — 341cf596 before any judged analysis |
| Pilot gate | fixtures + seed 75102 reproduction + corpus integrity + instrument firing before full classification judged | PASS — fixtures 18/18; pilot s75102 dissolved 32, all SCHOLAR-RESTORED, lingerer-origin 27/27 restored, fled tbend 0, cross-check 32/32; corpus clean; scholarmelt errs 0 |
| Seeds | 16/16 valid | PASS — 16/16 (days > 0, scholarmelt errs 0, overflow empty, census sorted + lastDay within 1) |
| Classification completeness | 120/120 dissolved classified, 0 UNCLASSIFIED | PASS — 120/120, 0 UNCLASSIFIED, 0 DISSOLVED-MELT |
| Cross-check | 120/120 per-(seed,fightSeq) fates agree with scholarmelt-a, or every mismatch investigated | PASS — 120/120 agree, 0 mismatches |
| Lingerer-origin completeness | sub-population fate split reported, lacking count stated | PASS — 60 rows, 60 SCHOLAR-RESTORED, lacking 0 |
| Fled | tbend fled count re-verified, dissolved contribution stated | PASS — fled tbend 0/16 seeds; dissolved adds 0 by construction |
| Determinism | analyzer run twice, byte-identical, scratch removed | PASS — DETERMINISM-PASS, scratch removed |
| Sense | >= 2 dissolved chains read end to end | PASS — 3 chains read end to end (see sense section) |
| Fixtures | test script green before judged classification analyzed | PASS — FIXTURES-PASS 18/18 |
| Wall numbers | carried, verified from the same corpus | PASS — recomputed numbers match blockedrestore exactly (see below) |

**Formal verdict is DIAG-GO.**

## The judged counts

Band dissolved fate split (draftflag corpus, this arm's
independent analyzer run):

| Fate | Count | Share |
|---|---|---|
| SCHOLAR-RESTORED (identity subflag) | 75 | 62.5% |
| SPAWN-ENDED (no lift) | 45 | 37.5% |
| DISSOLVED-MELT | 0 | 0% |
| BYSTANDER-OR-NONMONSTER | 0 | 0% |
| UNCLASSIFIED | 0 | 0% |
| **Total** | **120** | **100%** |

Per-seed dissolved: 75102: 32 (all restored), 75104: 45
(all spawn-ended), 75105: 43 (all restored), all other
seeds 0. The seed split is itself the story: s75104's
dissolved fights never had a world monster at stake, while
s75102's and s75105's always did — and in every case the
world object survived.

Lingerer-origin sub-population (dissolved rows whose
pre-start lift snapshot is a lingering tile monster — the
only measurable lingerer-origin definition for rows that
never reach tbEnd, since worldOrigin is null on all 120
by construction):

| Fate | Count |
|---|---|
| SCHOLAR-RESTORED | 60 |
| DISSOLVED-MELT | 0 |
| UNCLASSIFIED | 0 |
| Lacking a restore fate | **0** |
| **Total lingerer-origin** | **60** |

The other 15 restored rows are non-lingering titan lifts
(herald at (4,4) before its draft pin or after lingering
cleared); the 45 spawn-ended rows have no lift and are
never lingerer-origin by definition.

Fled: tbend events with result 'fled' in the draftflag
corpus: 0 on all 16 seeds, re-verified by this arm's
analyzer (reconciles to blockedrestore's fled count of
0). Dissolved rows carry result 'dissolved-no-tbend',
never 'fled', so they add 0 fled observations by
construction.

Identity-vs-entry note (3 rows, disclosed, not a fate
change): 3 restored rows are identity-true but
entry-false — s75102 fightSeq 55 (d80), s75105 fightSeq
38 (d144) and fightSeq 81 (d156). All three are the last
dissolved row of a cluster before the herald walks off
(4,4) (census: s75102 herald to (8,3) on d81, s75105
herald to (4,3) on d145 and to (4,2) on d157). The
entry check requires an id+tile match, so a herald that
moved before the flush day fails entry while identity
still holds. The classifier's restored-first order
handles this correctly (identity wins); the entry
mismatch is a movement artifact, not a second fate.

## The three assigned questions, answered plainly

1. **Do dissolved lingerers get a restore fate, or do they
   melt? They get a restore fate — none melt.** All 60
   lingerer-origin dissolved rows classify SCHOLAR-RESTORED
   by the post-end identity check, and 0 classify as
   melts. Stated precisely, as the prereg requires: there
   is no tbEnd restore for these rows (no tbEnd ever
   ran), and the recorder's post-start presence test says
   the tile object was never removed by the fight
   (lifted=false on all 120). The honest plain-words
   reading is "the herald never left": the fight
   dissolved, the beast stayed on the tile, and it is
   still there at flush. SCHOLAR-RESTORED is the
   classifier's label for that presence, not a tbEnd
   event. No dissolved lingerer lacks a fate at all:
   120/120 classified, 0 unclassified.
2. **Is the fled half of lingerer-keeps still
   unobserved? Yes.** Zero tbend 'fled' events on this
   band, and dissolved rows cannot supply fled
   observations (different result value, by
   construction). The fled half of the lingerer-keeps
   rule (fled -> restore) has zero observations on this
   band and on this arm — not a zero rate, an empty
   population. A band where the scholar flees a lingerer
   fight is still needed to exercise it.
3. **What, if anything, still needs a recorder? Only
   dissolve CAUSE — fate needs no recorder.** The
   backlog item "dissolved meetings need a dissolve-path
   recorder" is retired for fate and narrowed for cause:
   what remains unmeasured is which code path dissolved
   each fight (no call-site field exists in the
   recorder), plus the scholar-HP steps observed within
   dissolved clusters (see sense notes). A follow-up
   dissolve-cause recorder — a call-site field on the
   scholarmelt recorder plus a fresh sweep — is ranked
   next #1. It is NOT built here, because this arm's
   judged questions did not need it and Path A was the
   correct scope.

## Wall numbers (carried, verified — not before/after)

Recomputed from the same draftflag corpus rows and
checked against blockedrestore's carried numbers: exact
match on every figure. Wins 9/16 (all lesser, full 0),
national ever 13/16, national final 11/16, table
reached 12/16, table entered 9/16, wave reach
16/16/14/9/0, median survival 118d, deaths 527. No
before/after claim is made: this arm ran no sweep and
changed no game code.

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4
reachable, wave 5 unreachable on this band (0/16), the
table reachable only through the lesser seat, the full
seat unreached. What this arm changes is the wall's
plumbing, not its height: the dissolved half of
lingerer-keeps is no longer a blank — dissolved
lingerers persist, they do not melt — and the only
lingerer-keeps half still unobserved is the fled half.

## Village assessment (plain words)

When the scholar's fight against the great herald beast
falls apart before it starts, the beast does not vanish.
On two seeds the scholar meets the herald again and again
at the haven's edge — five times in a day, nine times
the next — and every time the fight dissolves, the beast
is still standing there afterwards, at the same strength,
until its siege posting ends and it wanders off on its
own. On the third seed the scholar spends six days
starting fights against a herald that isn't there at all
— no beast on the tile, no beast in the daily count —
and those empty fights end with nothing at stake, because
nothing was ever there to lose. Nothing dissolved ever
melted. The one thing still unseen is the scholar
actually fleeing a siege fight: that half of the rule
has no example on this band, dissolved or otherwise.

## Sense notes (chains read end to end)

- SENSE-PASS on three chains. Node-sim stubs Game.say to
  no-op, so there is no say transcript; sense evidence is
  the structured trace (meeting rows, draft events,
  census trajectories), stated as such.
- Chain 1 — s75102 herald uid 29 (the pinned herald).
  Raid d73 drafts it (5,5)->(4,4), lingering false->true,
  hp unchanged 700 (toll 0, recorded tollExact). On d74
  the scholar first fights a giant_mosquito (routed, then
  won, scholar 100->77->65) and then starts 5 dissolved
  herald fights the same day (seq 24-28, lift 700
  lingering, scholar 65->63). Census d74 shows the herald
  at (4,4) lingering at 700; d75 at 679 — 21 damage
  appears between the d74 and d75 snapshots from a
  source outside the scholar trace (the dissolved rows
  carry no fighters, so the damage cannot be attributed
  from this corpus; it is noted, not explained). The
  dissolved fights continue d75-d80 (seq 29-55, lift 679
  lingering, then non-lingering on d80) while the census
  holds the herald at (4,4) at 679 through d80; on d81 it
  wanders to (8,3) at 679. Thirty-two dissolved fights,
  zero removals: the herald leaves only when its posting
  ends, not because any fight dissolved.
- Chain 2 — s75104 spawn-ended grind (the phantom
  herald). All 45 dissolved rows have no lift, and the
  census shows NO herald on any day d95-102 (or anywhere
  in the seed's dissolved window). The scholar starts 5
  dissolved herald fights on d96 at 100 HP, then 9 on d97
  at 88, 9 on d98 at 76, 10 on d99 at 64, 9 on d100 at 47,
  and 3 on d101 at 35 — a steady ~12 HP per day decline
  across six days of fights against nothing. The seed
  ends on d102 with no further scholar meeting recorded.
  The HP decline's source is NOT in the scholar trace
  (dissolved rows have no scholarHpEnd and no fighters),
  so it is reported as an observed trace pattern, not a
  causal claim: something wears the scholar down across
  these days, and the dissolved fights are the only
  scholar-fight records on those days. A dissolve-cause
  recorder that also captures scholar HP at dissolve
  time would settle whether the dissolved starts
  themselves cost the HP.
- Chain 3 — s75105 herald uid 38 (draft, wound, persist).
  Census d143-144: herald at (4,4) at 525, non-lingering;
  d144 brings 7 dissolved fights at 525 non-lingering.
  It wanders d145-149, then raid d149 drafts it back:
  (2,4)->(4,4), lingering false->true, toll 175 =
  round(700 x 0.25) exactly (tollExact), 525->350. From
  d150 to d156 the dissolved fights continue at 350
  lingering (d150: 4, d151: 8, d153: 3, d154: 6, d155:
  12, d156: 3 non-lingering), interleaved with REAL
  fights on d151 (three won, scholar 76->48->46, then a
  lost fight, scholar 41->-25 — the scholar dies, and
  the herald's restoredHp is still 350). Census holds
  the herald at (4,4) at 350 through d156; on d157 it
  wanders to (4,2) at 350. The dissolved fights never
  touch it, and neither does the scholar's death: the
  beast outlasts the scholar at exactly the strength
  the draft left it.
- A within-day pattern across all three chains, stated
  as observation only: scholar HP at successive dissolved
  starts on the same day steps down (s75102 d75:
  89,87,87,87,87,85,85,85,85; s75105 d151 dissolved at
  41 after the day's real fights). The dissolved rows
  record scholarHpStart but not scholarHpEnd, so the
  steps cannot be attributed to the dissolved starts
  from this corpus. It is the kind of thing a
  dissolve-cause recorder should capture (HP at dissolve
  time), and it is not smuggled into any verdict here.

## Metric review

- The prereg bound the run and was honored: no metric
  was re-scored mid-run. The classification rules are
  scholarmelt-a's dissolved branch verbatim (restored
  first), and every dissolved row fell into exactly one
  fate with zero unclassified — so the "0 melts" result
  is a classification outcome, not a definitional dodge:
  a lifted-and-absent dissolved row WOULD have counted
  as DISSOLVED-MELT, and none exists in this corpus.
- Two prereg-wording notes for the NEXT run (not
  revisions to this run's verdict): (a) "restore fate"
  for dissolved rows must always be glossed as
  presence-at-flush, never left to sound like a tbEnd
  restore — the prereg's distinction held, but the
  scholarmelt fate name SCHOLAR-RESTORED invites the
  misreading, and a future arm may rename the
  dissolved-restored subflag to never-left; (b) the
  "linger-origin" population for dissolved rows must
  always be defined via lift.lingering (as here), never
  via worldOrigin, which is null on every dissolved row
  by construction — an assignment that says
  "linger-origin dissolved fights" without that
  definition invites a vacuous zero.
- The fled population being empty is a coverage note,
  not a finding: the fled half of lingererKeeps has zero
  observations on this band, so no fled-rate claim is
  made in either direction.
- Instrument lesson (disclosed): see Infrastructure
  notes — the safe-commit index clobber (known class)
  hit the prereg commit, and the container EPERM flap
  hit analyzer writes (retries succeeded). Both were
  repaired/retried the same way as prior arms; neither
  touched the corpora.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber (known class from the
  repo's AGENTS.md lessons) hit the prereg commit
  (341cf596): bogus staged deletion, worktree file
  intact, commit contents verified byte-identical to
  the worktree file before repair; repaired via
  update-index --cacheinfo from the HEAD blob and
  verified `git status` clean + `git diff HEAD` empty
  before proceeding. The commit itself is correct; only
  the main index lied.
- Container EPERM flap (known class) hit analyzer
  writes: the pilot write failed twice (0-byte file
  created, write denied) before succeeding on the third
  attempt into a worktree scratch dir, and the
  determinism second run needed retries before
  succeeding. No data was lost: the analyzer is pure
  and re-runnable, and the final analysis JSON was
  verified by the byte-identical determinism diff.
- Corpus untouched: no file under
  evidence/2026-10-30/perseed-draftflag-a/ or
  perseed-scholarmelt-a/ was written by this arm
  (analyzer output goes to the analysis JSON beside
  them; scratch went to a worktree scratch dir and was
  removed). `git status` clean on both corpus dirs at
  every commit.
- No jest was run by this arm (analyzer + test are
  plain node scripts over committed JSON); the
  --cacheDirectory rule is vacuous here, recorded as
  such in the prereg rather than claimed.

## RANKED NEXT (with numbers — no lever built here)

1. DISSOLVE-CAUSE RECORDER (the surviving recorder
   need): 120 dissolved fights, 0 with a recorded cause.
   The scholarmelt recorder needs a call-site field
   (which dissolve path fired — the known barrier-death
   dissolve site in game.js is a lead to check, NOT a
   finding, since whether herald dissolved rows come
   from that site is unmeasured) plus scholar HP at
   dissolve time (to settle the within-day HP steps in
   the sense chains), then a fresh sweep on the same
   substrate. This is a follow-up arm's build, not a
   re-run of this one: fate is settled, cause is not.
2. FLED-WITH-ORIGIN COVERAGE: 0 fled tbend events on
   this band — the fled half of lingererKeeps is still
   unobserved. A band or scenario where the scholar
   flees a lingerer fight would exercise it (and would
   also test whether a fled restore blocks the same
   way as a lost restore).
3. DISSOLVED-RESTORED RENAMING (nomenclature, no game
   change): the dissolved-restored subflag reads as a
   tbEnd restore that never happened. Renaming it to
   never-left in the analyzer vocabulary (and stating
   the presence-at-flush gloss wherever the fate name
   appears) would prevent the misreading this arm had
   to guard against in its prereg.
4. S75104 PHANTOM-HERALD TRACE: 45 spawn-ended
   dissolved fights against a herald that exists
   nowhere in the census, with the scholar grinding
   100->35 HP across six days and the seed ending on
   d102. What starts a herald fight with no tile monster
   and no world instance, and what wears the scholar
   down across those days, is a question for the
   dissolve-cause arm's recorder, not answerable from
   this corpus.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0,
wave 5 0 on this band, as on every band this cycle. No
axis is converged. No gate number was moved on this
evidence, per the 2026-10-29 gate-sequencing note (prove
behavior normal before tuning gates to it). What
converged further is the dissolve plumbing: a dissolved
scholar fight now has a measured fate — restored 75,
spawn-ended 45, melts 0 — the dissolved half of
lingerer-keeps is no longer a blank, and the only
lingerer-keeps half still unobserved is the fled half.
The backlog item "dissolved meetings need a
dissolve-path recorder" is retired for fate and narrowed
to cause, with the missing instrument named.
