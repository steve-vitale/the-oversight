# Journey — crisis, run r181: ADOPTION note (Lane B, leg 6)

**Adoption:** the 16:00 CST coordinator timed out before closeout (gate still
running, no commit, no merge, no rotation write, lock held). The main session
adopted the run per the loop-closeout skill and finished it. The coordinator's
run note (`evidence/2026-11-11/journey-crisis-r181.md`) stands as the run's
own record; this note records what the adoption did and corrects two of its
closing claims.

**Corrections to the run note:**
- It closes "Merged locally, pending ship. Rotation written 7 (succession
  next)." Neither was true at write time: nothing was merged, and
  `journey-rotation-b.txt` still read 6. This adoption performs the merge and
  writes rotation 7. (Succession is next, as the note says.)
- Everything else in the run note checked out against the staged corpus.

**Adoption verification:**
- Proof test re-run on the branch: `scripts/test-journey-crisis-r181-regional-meds.js`
  ALL PASS, 10/10, exit 0. The U2 fix (regional ruin medicines ease/cure as
  labeled) is verified.
- Fix diff reviewed hunk-by-hunk: 5 files, +29/−5 — cure-table entries in
  `src/data/statusEffects.json` (Fever: antimalarial cure / cold_remedy ease /
  ORS ease; Gut Rot: ORS ease; Wound Fever: bandage ease), `medType: 'ors'`
  on ORS packets (`src/data/regions.json`), `useMedicine` KIND_CLASS map +
  medic-duty channel 2 takes antimalarial (`src/js/game.js`), pharmacy
  admits any `medType` item (`src/js/storage.js`), DISEASES.md changelog.
  Nothing else in the diff.
- Gate re-run by the adoption: `node scripts/check.js --quick` — **335
  passed, 5 failed in 583s** (340 scripts). Adjudication:
  - 2 = measurement-proof staleness pair (standing failure; this branch's
    `src/js/game.js` change re-stales the b6 proof — the next proof-refresh
    round re-points, as with r180's convo-dialogue.js change).
  - 1 = phone-frame-proof stale receipt (standing failure; the receipt was
    already stale on the base for index.html, foreignSpeech.json,
    table-endings.json, alienPlayers.json — none touched by this run; r181
    adds regions.json + statusEffects.json to an already-stale receipt).
  - 2 = 120s load timeouts (living-garden + one-person-army deed
    attainment); both re-run standalone GREEN (exit 0).
  Gate verdict: **GO**.
- Post-fix/pilot analysis identity: `journey-crisis-r181-postfix-analysis.txt`
  is byte-identical to `journey-crisis-r181-pilot-analysis.txt`. Verified
  correct, not a copy error: the three post-fix seed JSONs
  (`postfix-r181/journey-crisis-r181-delayed-seed1441{1,2,3}.json`) are
  byte-identical (sha1) to the pre-fix pilot JSONs — the fix never fires on
  these trajectories (ruin searches 0, so no medicine is ever acquired), so
  the trajectories and their analyses are identical. The panel is a
  no-regression check only, as the run note says; the fix is proven by the
  unit test.
- Telemetry check (crisis baseline): 1 LOUD line — "defendedCount
  disappeared: baseline 21 -> current 0 (n=5 files)". Investigated:
  explained, not a regression. The current panel JSONs carry no
  `defendedCount` field at all, and the baseline's own note (r117) records
  defendedCount as an orphan with no proven correspondence to any current
  panel field. defendedFights totals 99 across the 5 seeds vs baseline 95 —
  inside tolerance, no LOUD. Baseline NOT rolled.
- Run commit: `ebab2e49` (16 files: the 5 fix files, 3 scripts, run note,
  6 analysis files, gate log + err). Carries `[needs-eyes]` — cure fiction
  changed, Steve can overrule.

**New finding from adoption review (filed in sim-findings.md, open):**
`useMedicine`'s `kindName` is still `kind === 'antibiotics' ? 'antibiotics'
: 'antiparasitic'`, so using an antimalarial, cold remedy, bandage, or ORS
narrates as taking "antiparasitic" in every say line ("You dry-swallow the
antiparasitic…"). Cure behavior is correct and unit-proven; only the spoken
pill name is wrong. Fix: map kindName per kind, extend the r181 proof test
to assert the spoken name. Small follow-up, not a landing blocker.

**Carried forward (not fixed here):** the Rafael Mendez resume-opener defect
(seed 14411 d57, filed in the run note) — fix item for the next run. The
Q6 gorge-after watch is at 19 consecutive panels of zero; the run note
proposes re-judging the bar if it stays zero through r190.

**Infrastructure:** host write flap 22:28–22:36Z (coordinator; cleared),
reaper EPERM twice, `git pull --ff-only` "no such ref" quirk (nothing to
pull; ship loop owns pushes). The gate's 120s timeouts are load artifacts
under 4-parallel contention. The adoption hit the safe-commit index clobber
(again) and repaired it via the ls-tree pipe; commit verified correct.
