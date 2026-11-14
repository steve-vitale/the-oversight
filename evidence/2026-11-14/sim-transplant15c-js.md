# H1 transplant — family 15C NARROWED JS-ONLY SPLIT, OVE-52 js hunks alone (arm sim-transplant15c-js-a)

Run: fleshout-20261114T1452Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant15c-js-a` (worktree
`~/workspace/worktrees/sim-transplant15c-js-a`).
Prereg: evidence/2026-11-14/sim-transplant15c-js-prereg.md —
**a TRUE pre-registration, written and committed BEFORE the subject
was cut** (commit 054c493f6, stage-1 proof 64/64).

## Verdict: CARRIER — OVE-52's js hunks alone collapse the far end

**Survived 1/8.** The far end reads 4/8 on this band; OVE-52's four
js files alone (no test refresh, no ONTOLOGY hunk, no OVE-49) drop
it to 1/8 — the merge's level. Per the binding thresholds (round-2115
§3): ≤1/8 CARRIER. No re-run needed: 1/8 is decisive, and the
deterministic re-run rule (round-1355 metric review) could not move
it.

The split question is now ANSWERED: the group CARRIER (OVE-49 +
OVE-52 together, 1/8) is carried entirely by OVE-52's game code.
OVE-49 contributes nothing — its content is test-only, and the
js-only STEP reproduces the group STEP per-seed-file-for-field
(8/8 identical, §Group identity below). **OVE-52 (1c1b23482,
"wire shared fighterState into both fight brains") IS the carrier
of family 15C's share of the collapse.**

## Subject

- Branch: `transplant-15c-split-js-subject`, LEFT in place.
- Hash: `d56206f70e53f909c7271a776ecce4dad07a3cf4`
- Tree: `009173473853d4dd5a33cb9448fd256b95a351aa`
- Parent: far end `203a32775` (single parent).
- Content: far end + OVE-52's js hunks ONLY — `src/js/engine/combat.js`
  (+26/−0), `src/js/fieldFights.js` (+90/−23), `src/js/game.js`
  (+59/−11), `src/js/villager-agency.js` (+172/−0); total +347/−34.
- Dropped per prereg: the probe-test refresh
  (`scripts/test-fight-brain-knowledge-probe.js`, +163/−123 — the
  file does not exist at the far end) and the docs/ONTOLOGY.md
  hunk (1-line Provides refresh).

Subject verification (asserted by the proof test, stage 2):

- `git diff 203a32775 <subject> -- src/js` vs
  `git diff 748cce3b8 1c1b23482 -- src/js`: numstat identical
  per file (26/0, 90/23, 59/11, 172/0) and the 370 added/removed
  content lines identical, in order. (Correction to the prereg's
  letter: the RAW diff texts differ only in hunk headers — line
  numbers and base blob hashes — which necessarily differ because
  the far-end base files differ from the pick parent's. See
  §Metric review. The hunks are the same hunks.)
- `git diff --stat 203a32775 <subject>`: ONLY the 4 src/js files,
  4 files changed, 347 insertions(+), 34 deletions(−).
- Probe test ABSENT at the subject, as at the far end.
- `docs/ONTOLOGY.md` at the subject byte-identical to the far end
  (diff 0 lines).
- `src/js/standing.js` and `scripts/policies/competent.js` at the
  subject identical to the far end (native standing sha
  `75762cb2259d`, policy sha `a7ff5c516440`).

### Construction-method deviation (infrastructure, recorded honestly)

The prereg's exact method was `git checkout -b <subject> 203a32775`
then `git cherry-pick -n 1c1b23482` with the two drops. The checkout
could not complete under the box load: `git status` takes 280s+
without finishing (4m40s wall, 14s user — I/O-starved, not
computing) and the checkout itself was killed by a 500s timeout.
Verified: the killed checkout wrote ZERO files — no subject branch
was created, HEAD stayed on the arm branch, and all six sampled
files (the 4 js files + ONTOLOGY + standing.js, all of which differ
between HEAD and the far end) were byte-identical to HEAD on disk.

The subject was therefore built by plumbing from the merge-tree
result instead: `git merge-tree --write-tree --merge-base=748cce3b8
203a32775 1c1b23482` (result tree
`4a315a997194d3fb45d0e79aa7c52d1e7e42e53b`, the same tree the
pre-check predicted), loaded into a TEMPORARY index
(`GIT_INDEX_FILE=/tmp/idx-t15c-js`, the worktree index untouched),
probe test removed (`git update-index --force-remove`), ONTOLOGY
restored to the far-end blob (`git update-index --cacheinfo`),
`git write-tree` + `git commit-tree -p 203a32775`. The merge-tree
IS the cherry-pick's three-way merge result, so removing the
probe-test entry and restoring ONTOLOGY to the far-end blob yields
exactly the tree the cherry-pick-with-drops would have produced —
and the verification legs above (numstat + content-line identity,
stat, absence, ONTOLOGY identity) prove it, rather than assuming
it. No game code was hand-edited; no file outside the two
pre-authorized drops differs from the pick. The deviation is
mechanics only; the subject's content is what the prereg specified.

## Results — STEP t15c-split-js, seeds 190391–190398, 150d death-aware, competent verbatim own-policy

Standing-fix swap f8fda4295a99 per seed (native standing.js restored
byte-identical afterwards, sha-verified by the step script);
own-policy sha a7ff5c516440 on every seed; instrument errors 0.

| seed | days | end | maxWave | rank | standing | deaths | blooded |
|------|------|-----|---------|------|----------|--------|---------|
| 190391 | 60 | village-lost | 4 | regional | 199 | 80 | false |
| 190392 | 75 | village-lost | 4 | village | 125 | 62 | false |
| 190393 | 115 | village-lost | 4 | regional | 199 | 66 | false |
| 190394 | 150 | survived | 5 | regional | 350 | 130 | false |
| 190395 | 106 | village-lost | 4 | regional | 199 | 107 | false |
| 190396 | 128 | village-lost | 4 | regional | 199 | 90 | false |
| 190397 | 121 | village-lost | 5 | regional | 250 | 86 | false |
| 190398 | 149 | village-lost | 4 | regional | 199 | 69 | false |

- **Survived 1/8** (190394 only) — median survival **121d**
  (analyzer upper-median; the conventional median of the 8 days
  60/75/106/115/121/128/149/150 is 118d — see §Metric review).
- **Wall:** wins 0, national 0, table 0, regional 7/8 (REGIONAL_INTACT),
  village 1/8, wave-5 2/8 (190394, 190397), wave-4 8/8, deaths 690,
  standing 125–350, blooded 0/8.
- **Death causes (690):** villager combat 269, expedition 193,
  combat 108, the wild 86, monster 16, the arena 5, contest 5,
  ambush 2, thirst 2, dehydration 1, a stranger 1, a wound that
  wouldn't close 1, Captain Bright-Eyes 1. Villages die fighting,
  not hungry (starvation 0; end-pantry 0 kcal on 3 seeds is
  end-state emptiness after the village is already lost, not the
  killer — the killer is combat/exposure).
- **Readiness:** ready4/ready5 short on armor, weapons, veterans
  on ALL 8 seeds; ladder wave-4+ veterans 0 on ALL 8; tribute
  ready 0/8, veterans-short 0/2 on ALL 8. Five seeds end pinned
  at standing exactly 199 (the wave-5 readiness hold, t5−1).
- **Far-end comparison (same band):** far end 4/8, days
  86/144/150/43/150/87/150/150, median 147d. Seed-for-seed:
  190391 86→60, 190392 144→75, 190393 150→115, 190394 43→150 (the
  only seed that improves — it died day 43 on the far end and
  survives here), 190395 150→106, 190396 87→128 (improves but
  still lost), 190397 150→121, 190398 150→149. Six of eight seeds
  die earlier on the subject; the collapse is broad, not one seed.

## Group identity — the js-only STEP IS the group STEP

Field-for-field comparison of the 8 per-seed JSONs against the
group arm's corpus (`perseed-culpritbisect-a-t15c-narrowed`,
anchor 12fd9d694d3f), ignoring only the step/anchorCommit labels:
**8/8 IDENTICAL** — every field, every seed (days, end reason,
standing, wave, rank, deaths, blooded, ready bars, kill calls,
snapshots, transcripts). The group evidence's own table matches
this STEP's table row for row, including its hand-computed median
118d. OVE-49's test-only content changes nothing in the sim: the
probe test is never loaded by the harness, the green-list is never
read by it. The carrier is OVE-52's fighterState wiring, alone,
with no contribution from OVE-49.

## What OVE-52 changes (mechanism, from the diff)

OVE-52 wires one shared `fighterState` into both fight brains
(TB combat in `src/js/engine/combat.js` + `src/js/game.js`, and
field fights in `src/js/fieldFights.js` + `src/js/villager-agency.js`):
knows-vs-naive flips field opening intent and TB hopeless flee,
and fighterState feeds TB hopeless/reactive flee and field morale.
The measured effect on this band is not that villages stop
fighting — they fight MORE and die in it (combat deaths dominate,
190392's village kills three wave-3 monsters on day 41 and still
dies day 75). The readiness bars tell the story: kills happen,
but the killers do not survive to count as living veterans
(ladderVets4 0/8, tribute veterans 0/2 on all 8), armor and weapons
stay short on all 8, and standing pins at 199 on five seeds. The
fighterState wiring makes fights bloodier for the village without
banking veterans — the exact choke the scale-onramp program has
been measuring (veterans bar, wave-5 door). This arm does NOT
decide the fix: whether the wiring is a defect (flee/morale
mis-tuned) or a design trade-off (harder fights, fairly priced)
is the next arm's question, with its own prereg. Per the bisect
fix policy, no game-code change lands from this measurement arm.

## Sense-testing (SENSE-TESTING LAW)

Read the vetSays transcripts. Villagers still act like people on
the subject: they fetch water and forage with named yields ("back
with a full skin", "1478 kcal. Two days of food from one person"),
push back when trust is low ("Why should I listen to you?"),
speak languages the scholar does not share (Hindi, no shared
language), defend the door in named groups and come back hurt
("Michelle, Daniyar, Ursula and the woman in her 30s, with
weathered hands met them at the door — 4 put down... are hurt"),
and the System narrates veteran kills on camera ("Gabriela just
put down Spool... on CAMERA. That's a veteran kill, folks.
REMEMBER the name."). The collapse is not villagers going robotic:
190392's village kills The Redactor, Spool, and The Terms of
Service on day 41 — real blow-by-blow wins — and still dies day
75 with zero living veterans. The tragedy is legible in the
transcripts, not a silent number.

## Secondary check (Blooded beat vs end-state)

End-state `blooded` reads FALSE on all 8 seeds, as in the group
corpus. In the sampled vetSays, the Blooded beat fires on exactly
one seed — 190394, days 133 AND 142 ("Blooded — the village knows
where the Producers bleed. (Strikes hit 1.5× as hard; their blows
land at 0.75× strength.)") — and that seed ends blooded FALSE at
day 150. The other "blood" mentions are the TV finale line
("blood, bonds, or bread") and the Cold-Blooded ability, not the
beat. Third corroboration of the open sim-findings item, same
direction as the group arm and 15A's 190398 (beat fires /
end-state false); 15A's 190396 showed the reverse (end-state true
/ zero beats) and 15F showed end-state true on 4/8, so the flag
is not lost in general — it is seed- and path-dependent, and on
this corpus the beat fires without the flag sticking. No new
backlog entry; the open item stands.

## Metric review (§14)

- Thresholds judged exactly as pre-registered: 1/8 → CARRIER, no
  re-run (decisive). No metric proved wrong.
- **Median convention note.** The analyzer reports median 121d
  (upper-median: sorted days 60/75/106/115/121/128/149/150, index
  4). The conventional median is 118d (mean of 115 and 121) — the
  number the group arm's evidence hand-computed. Both describe the
  same 8 days; the analyzer's figure is the comparable one across
  arms (same instrument), the conventional one is the quotable
  one. Future evidence should quote both, or the analyzer should
  adopt the conventional median — a tooling note for the next run,
  not a re-score of this verdict (the verdict turns on the count,
  not the median).
- **Prereg verification wording correction.** The prereg said the
  subject's js diff would be "EXACTLY equal to" the pick's js
  diff. Raw `git diff` text can never be exactly equal across
  different bases: hunk headers embed line numbers and base blob
  hashes, which differ (far-end game.js vs pick-parent game.js
  sit at different offsets). The correct leg — and the one the
  proof test asserts — is numstat equality per file PLUS
  added/removed content-line identity (370 lines, in order). The
  prereg's intent (same hunks) is satisfied; its letter was
  unachievable for any cherry-pick onto a different base. Future
  preregs should pre-register the content-line leg, not raw-diff
  equality.
- The deterministic re-run caveat (round-1355) was not exercised:
  1/8 needs no re-run. It stands for future 2/8 reads.
- The field-for-field corpus comparison (round-1355 metric review
  note 2) proved decisive here: it turns "same count" into "same
  run" and exonerates OVE-49 outright. Keep it as a standing leg
  for split arms.

## Infrastructure

- **Host load, not flap.** No EPERM window struck (flap-watch log
  ALL-OK at run start and throughout; writes all landed first
  try). The box was heavily loaded instead (load 11–17, a sibling
  `git worktree add` + `git reset --hard` running at arm start):
  `git status --porcelain --untracked-files=no` never finished
  inside 280s (4m40s wall, 14s user — I/O-starved, no lock held,
  no index.lock anywhere), and the subject `git checkout -b`
  was killed by a 500s timeout having written zero files. Pure
  object operations (log, diff, merge-tree, commit-tree) stayed
  fast (≤7s). The step script's two status calls each cost ~5
  min of wall time inside its ~8.7-min run; the driver itself
  (8 seeds) ran at normal speed once the checkout landed.
- **Safe-commit index clobber (struck FOUR times, repaired each
  time).** The stage-1 commit (054c493f6) is correct — both files
  present, 244 + 198 lines — but the worktree's main index showed
  them as staged-deleted with the worktree copies byte-identical
  to HEAD (hash-object == HEAD blob for both, verified BEFORE
  repair). The corpus commit (f9549c2ec) clobbered the same way
  (all 10 index entries purged; disk files intact, hash-object ==
  HEAD blob). The stage-2 commit (83157c1c) clobbered in a new
  variant: the evidence file's entry purged, the proof file's entry
  left STALE at the stage-1 blob (cached diff showed the whole
  stage-2 addition as deletions). The addendum commit (5a011850c)
  clobbered the same stale way (both entries held the previous
  blobs; disk files already matched the new HEAD blobs). All four
  repaired with the documented pipe (`git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info`); verified `git
  diff --cached --quiet` + disk blobs equal HEAD blobs after each
  repair. No work lost; every commit was verified correct first.
  The clobber hits every safe-commit on this tree under load —
  future arms should run the hash-object + cached-diff check after
  EVERY safe-commit, not just the first.
- **Heartbeat.** First attempt timed out at 240s (REGISTRY.lock
  contention); retry landed ("heartbeat sim-transplant15c-js-a",
  rc=0). Registry heartbeat is fresh at closeout.
- **STEP-script hazard (avoided).** The step ran from the /tmp
  copy with REPO set to the worktree, per the round-1355 fix —
  all steps including the first. STEP t15c-split-js ran clean,
  rc=0, ~8.7 min wall.
- **Telemetry deviation check: REFUSED** (recorder-corpus class,
  rc=2): "refusing recorder-corpus input: all 8 --current rows
  carry top-level anchorCommit, so they are sweep recorder rows,
  not runs." Recorded, baseline NOT rolled. No LOUD lines — the
  tool refused to compare at all. The verdict stands on its
  pre-registered thresholds and corpora.
- `scripts/test-culpritbisect-a.js` re-run at closeout:
  **116 passed, 0 failed**.
- Tree at closeout: arm branch `sim-transplant15c-js-a` only;
  subject branch `transplant-15c-split-js-subject` LEFT in place
  at d56206f70e53 (per the transplant prereg); no src/js change
  on the arm branch; no uncommitted leftovers (verified by
  path-limited diffs + hash-object; full `git status` is
  unusable under current load — see above).

## Files

- Prereg (true pre-registration):
  `evidence/2026-11-14/sim-transplant15c-js-prereg.md`
- Evidence (this file):
  `evidence/2026-11-14/sim-transplant15c-js.md`
- Proof: `scripts/test-transplant15c-js.js` (stage 1: 64/0 with
  the prereg; stage 2: 153/153 — subject identity, STEP verdict,
  group identity 8/8, evidence records, closeout)
- Corpus: `evidence/2026-11-13/perseed-culpritbisect-a-t15c-split-js/`
  (8 per-seed JSONs) + driver log
  `evidence/2026-11-13/culpritbisect-a-t15c-split-js-driver.log` +
  summary `evidence/2026-11-13/culpritbisect-a-t15c-split-js-summary.json`
- STEP: `t15c-split-js` (fresh), subject
  `transplant-15c-split-js-subject` at
  `d56206f70e53f909c7271a776ecce4dad07a3cf4`
