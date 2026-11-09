# Journey leg ESTABLISHMENT — r118 pre-registration (2026-11-09, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r117 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261109T1145Z` (scheduled Mon 2026-11-09 11:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Adoption first:** this run's first half closed out the dead r117
establishment run (lock gone, registry heartbeat 16:37:22Z, >1h stale at
takeover 17:43Z) — see `evidence/2026-11-09/journey-establishment-r117.md`,
"GATE" section (main-session adjudicated GO, 294 passed / 6 failed, all 6
standing). r117 committed as `2215e22d4` (safe-commit index clobber struck,
repaired per AGENTS.md, hash-verified), proof re-run ALL GREEN on rebased
base, ff-only merged to master `2215e22d4`, tree released. This run's base
is that master. The r117 lock was already gone at takeover; this run's own
lock is `2026-11-09T17:43:26Z`.
**Rotation note:** r117's note says "Next leg: Deepening (rotation 1→2)"
but its open items name the full 16-seed establishment panel as the next
run's job. The rotation file still reads `1` (r117 died before writing
`2`). This run plays the leg the file names AND the owed panel:
establishment, 16 seeds. Rotation `1→2` at closeout.
**Base:** master `2215e22d4` (r117 landed: establishment pilot evidence +
invite-answer proof).

## Leg questions (named by r117's metric review + open items)
r117's 4-seed pilot on fresh seeds went GO on pace moves (3/4, bar ≥2)
but fired a **REGRESSION SIGNAL on pace03 (2 vs bar ≤1)**: Zoe (1801) and
Arlo (1803) raced 0→3 preserver in 42 days (foodXp 31 and 61; Arlo's
grant jumps +2/+3/+5 per rack batch — the uncapped +n/batch grant, so no
rung below ~35 could have held him). r116's rate was 0.25/seed (4/16);
the pilot's is 0.5/seed. This run is the **full 16-seed panel the pilot
called for** — the judge, not another pilot.

**Q1 — PACE REGRESSION, FULL PANEL.** Does pace03 regress on 16 fresh
seeds at the r116 rate? Per r116's metric review (carried by r117): if
it confirms, the next dial is the grant rate (how much credit a rack
batch or hunt kill awards). Do not re-run the rung.
**Q2 — INVITATIONS, DRIVER FIX IN.** r117 reclassified the defect: the
game DOES offer accept/decline (proof-tested 17/17); the sampling driver
refused them (r109 hygiene: betrayal:* never picked). This run ships the
measurement fix r117 owed: the driver carries a competent-player answer
rule — on an invitation-owned menu, accept iff the villager's trust is
≥40, else decline (trust is the live village trust map; no hidden plot
state is read). The bar now judges the GAME's offer and the DRIVER's
answer rate separately (r117 metric review).
**Q3 (standing) — NULL THEM LINES.** r116 FIXED (0), r117 held (0).
Regression check on the full panel's convo files.

## Bars (binding, §14 — no mid-run re-scoring)
- Q1 PACE (16 seeds): GO iff (a) moves (seeds with a specialist
  0→positive move, d1→dEnd) ≥8/16 AND (b) pace03 (villager, spec-task
  cells 0 at d1 → 3 at dEnd) ≤4/16. pace03 ≥5 is a REGRESSION
  CONFIRMED: next dial the grant rate, per r116/r117 metric review; do
  not re-run the rung. (r116 rates: moves 9/16, pace03 4/16.)
- Q2 INVITATIONS: (a) GAME OFFER — every invitation-owned menu on the
  panel offers betrayal:accept + betrayal:decline (proof-tested by the
  r118 proof test; any menu missing either is a game defect, fix in
  run). (b) DRIVER ANSWER — ≥80% of offered invitations answered
  (accept or decline; silence is the miss). Accept rate reported, not
  barred. If 0 invitations are offered, Q2 is no-data — report, do not
  pass or fail.
- Q3 NULL LINES: 0 literal THEM: (null) lines across the panel convo
  files.
- M3 survival-42 ≥12/16; M4 0 starvation deaths ≥12/16 (r116 bars 12/16
  carried at full scale).

## Seeds, policy, horizon
Seeds: **fresh band 1901–1916** (see freshness below). Policy:
competent + HUNTSTAFF=2 (same as r116/r117). Horizon 42d. Single panel
on current master — no before/after pair (no game fix is built yet; if
Q2(a) yields a fix, the before/after pair is that fix's proof, run on
the same seeds).
Driver: `scripts/journey-establishment-r118-20261109.js` (r117 driver
clone — tag rename + invitation-answer rule in the people-check picker
via `scripts/journey-invite-pick.js`; neutrality otherwise by
construction, same as r117).
Analyzer: `scripts/analyze-journey-establishment-r118-20261109.py`
(r117 analyzer clone: 16 seeds; hunt-kills fix — the r117 analyzer
counted a `kills` key the driver never writes, so it printed 0 on every
seed; r118 counts huntLog entries with kcal>0; plus invite answer
counting from the convo files).
Proof test: `scripts/test-journey-establishment-r118-invite-answer.js`
(proves the driver rule end to end on the live game: invitation-owned
menu detection, accept at trust ≥40 resolves the walk, decline at trust
<40 costs exactly 1 trust, no-pending control offers neither).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1901–1916**, verified fresh across ALL dated preregs:
  word-boundary grep for `190[1-9]|191[0-6]` over
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`
  returns **3 incidental matches, 0 seed namings**: "1912 kcal" (a
  pantry measurement, sim-upkeepbf52-a-prereg.md), "Findings: #1901"
  and "findings #1901" (a findings number, sim-xphalf-rejudge-b-
  prereg.md). The bare-word grep for `1901` returns only that findings
  number. No range "1901–1916" is named anywhere. The forbidden-band
  list (hidden_files/sim-heraldband-pilot-prereg-2018.md) names nothing
  in this band (grep for 190x/191x: 0 hits).
- No corpus files for these seeds exist (no establishment-r118-* files
  yet; `ls evidence/2026-11-09/ | grep 190[1-9]|191[0-6]` empty).
- Contaminated bands NOT reused: 1502, 1504, 1603, 1604, 17101–17112
  (r112–r116 matched reuse); 1142–1151 (r121 landing); 1801–1804
  (r117 pilot); all bands named in the r117 prereg's contaminated list.

## Canon
docs/CANON.md read at run start (this run). No canon doc covers the
invitation answer path or the specialist ladder's grant rate — Q1 rests
on code (`src/js/food.js` specialistSkill rung 5/15/30, rack/hunt grant
sites, per the r116 prereg mechanism check) + panel, not invented canon.
Q2 rests on the conversation engine (`src/js/conversation.js`,
`src/js/convo-wants.js`) + panel transcripts. docs/CONVERSATIONS.md
covers dialogue generally; the invitation-owned menu shape
([accept, decline, leave, silence]) is the engine's, proof-tested.

## People check
Read the held convos from the panel in full (same method as
r114–r117). Standing watch: the r117 people-check items — taken-kin
template repeating verbatim across villagers; the favour-requirements
line reading like a system instruction ("Move next to them, on the same
side of the Haven door, to help."); "Something in them almost softens —
then doesn't. Not yet." firing once per conversation; deflect pivot
"Sorry — I shouldn't load that on you. What's up?" as the repeated
subject-change. Note whether they recur; a fix is out of this run's
prereg scope unless Q2(a)'s mechanism turns out to be the same path.

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only. The invite-answer rule reads the live trust map only.

## Pilot gate
4 seeds first (1901–1904), current master, 42d. The pilot validates (a)
seeds run; (b) practice snapshots present in census JSON (d1/d14/d28/
dEnd, non-null competence maps, specialist fields present); (c) ≥1
forage/preserve favor observed or the leg's food work visible (racks
firing, hunts); (d) convo files written (4 held convos); (e) the invite
rule fires at least once OR 0 invitations offered (either is a valid
pilot outcome — the rule is exercised by the proof test regardless).
If the pilot shows 0 food work, document and stop — do not burn a full
panel on a dead question. On pilot GO, run seeds 1905–1916 the same way.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
