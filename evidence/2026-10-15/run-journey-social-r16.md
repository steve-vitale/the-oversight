# journey-social r16 (2026-10-15) — leg 5 "social life"

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE any run)

**Leg question:** r15 proved the grief conversation thread is structurally
unreachable (0 grief-thread convos in 3,908 conversations across 8 runs with
43 villager deaths): `villageEvent('death')` opens a ~3-day acute window
(`v.grief = 3`), but the grief opener is fallback #4 in `convoOpening` —
behind talk requests, the table, unfinished-business seeds, secrets,
taught-plant callbacks, recalls, and the want opener (which is the default
and almost always fires). This run is the pre-registered behavior-change
run r15 promised: does promoting the grief thread above the want opener
during the acute grief window make grief conversations actually fire, and do
they read like real people grieving?

**The change (design call, this run):** insert an ACUTE-GRIEF gate in
`convoOpening` after unfinished business (step 3) and before the
secret/want blocks. Fires when `v.grief > 0`. Yields to: pending talk
requests / the table / unfinished business (concrete commitments owed to
the player, unchanged ahead of it), and acute favor needs (`ask_favor`
with urgency >= 4 — a villager doubled up with sickness/starvation/wounds
owns the opening; crisis-leg precedent). Uses the existing 2-line grief
pool via the existing no-repeat ledger (each villager says each line once
per life, then the thread stops re-opening — natural anti-spam). No new
content: promotion only.

**Primary metric M1a (grief thread):** grief-thread convos observed in the
pilot (driver counts any convo with `c.thread === 'grief'` at any turn).
**GO: ≥5 grief-thread convos across the pilot AND ≥4/5 sampled grief
transcripts pass the conversation quality bar** (NPC grieves something
concrete; options engage or deflect; ending resolves, plants a thread, or
creates an obligation; zero fabricated shared history; no filler loops;
no static menus). If the pilot's mortality fails (0 deaths), M1a is NO-GO
by construction — a coverage failure of the policy choice, not the engine.

**Guardrail G1 (no grief-spam):** no villager opens with grief in more than
50% of their conversations during a single acute window; grief never
displaces a pending talk request, the table, unfinished business, or an
acute favor need (verified in the proof test + sampled transcripts).

**Interesting finding:** a grief conversation that lands as a person; grief
displacing urgent business (a miss); grief copy reading robotic; grief
firing outside any death window (a leak).

**Horizon:** DAYCAP=60, death-aware stop + 10d tail max (r13/r14/r15
established social-leg pilot horizon).

**Seeds:** 1201, 1202, 1203, 1204 (identical to r15 — direct comparison).

**Policies:** competent + larceny-leaning, identical seeds.

**Driver:** r15 pattern verbatim (one driveOne convo per living villager
per day, 12-turn budget, day-5 walkaway probe, death capture of 3
nearest-affinity survivors on day-of-death ±3d, moot beats at resolution
time, player-vote by room-majority rule). Script:
`scripts/journey-social-r16-pilot-20261015.js` (copy of the r15 driver,
only file-name/schema keys changed).

**Telemetry guard:** qa counters vs `telemetry-baselines/social.json`
(quiet check; r15's note documented the schema mismatch — this run's
driver keeps the r15 schema keys; if the checker still raises LOUD lines,
investigate same-run and explain before any re-baseline decision).

**§14 anti-drift:** M1a/G1 above bind this run. A miss is NO-GO — never
re-scored mid-run; doubts go in "metric review" for the next run.

## Run state

(Pilot results appended after the run.)

## Pilot results

8/8 runs completed, DAYCAP=60, death-aware stop + 10d tail. Driver:
`scripts/journey-social-r16-pilot-20261015.js` (r15 pattern verbatim +
transcript-dir cleanup at start — r16 process lesson: the dir accumulated
stale files across executions and a pre-fix transcript was misread as
post-fix evidence; the driver now wipes TRDIR on launch).
All 8 runs bit-identical across two full executions (determinism verified).

### Pilot table (final code: all 5 fixes)

| seed | policy | endDay | alive | fallen | convos | griefThreads | mootsFired |
|------|--------|--------|-------|--------|--------|--------------|------------|
| 1201 | competent | 62 | 8 | 6 | 456 | 21 | 0 |
| 1201 | larceny-leaning | 62 | 8 | 1 | 494 | 13 | 16 |
| 1202 | competent | 61 | 7 | 9 | 463 | 16 | 0 |
| 1202 | larceny-leaning | 62 | 8 | 4 | 557 | 8 | 14 |
| 1203 | competent | 53 | 11 | 1 | 605 | 9 | 0 |
| 1203 | larceny-leaning | 33 | 12 | 0 | 660 | 0 | 8 |
| 1204 | competent | 53 | 9 | 3 | 586 | 7 | 0 |
| 1204 | larceny-leaning | 62 | 11 | 6 | 519 | 19 | 11 |

**93 grief-thread convos in 4,340 conversations** (r15: 0 in 3,908).
Zero runs with deaths-but-no-grief (1203/larceny had 0 deaths — 0 grief
threads is correct behavior). An intermediate pilot run (promotion only,
pre-window-fix) produced 30 griefThreads with 2 zero-grief runs despite
deaths — the window bug below explains them.

Per-seed JSONs: `evidence/2026-10-15/journey-social-r16-pilot-<seed>-<policy>.json`
(+ `journey-social-r16-pilot.json` aggregate). Transcripts:
`evidence/2026-10-15/social-r16-transcripts/` (289 files: grief-capture +
moot beats, all from the final code — dir wiped before the final run).

### Census in plain words

Eight villages, 30 dead. The competent villages absorbed losses (combat,
monsters, sickness, starvation) and kept 7–11 standing; the larceny
villages ran the justice system hot (8–16 moots each — theft trials,
acquittals, weregild, exiles). The bearer <redacted> 15 times across the pilot;
succession held every time. What they knew: the dead are grieved out loud
now — villagers open conversations with it for ~3 days after a death
("It's quiet today. Wrong kind of quiet."), then the village moves on.
What was missing: nothing structural this run — the five blanks below
were all filled.

### M1a (grief thread): GO

Pre-registered GO needed ≥5 grief-thread convos AND ≥4/5 sampled grief
transcripts passing the quality bar. Result: **93 grief-thread convos**;
5/5 sampled transcripts pass (see People check). **M1a: GO.**

### G1 (no grief-spam): GO

No villager opened with grief in more than 2 sittings per death window
(the 2-line pool + per-life no-repeat ledger caps it); grief never
displaced a pending talk request, the table, unfinished business, or an
acute favor need (proof test 8/8 covers all four guards; pilot transcripts
show favors and moot business proceeding inside grief windows).

## Blank #1 (filled): the grief thread was structurally unreachable

**Found by:** r15 pilot (0 grief-thread convos in 3,908 conversations with
43 deaths). **Root cause:** the grief opener was fallback #4 in
`convoOpening` — behind talk requests, the table, unfinished-business
seeds, secrets, taught-plant callbacks, recalls, and the want opener
(which is the default and almost always fires). **Fix**
(src/js/conversation.js): ACUTE-GRIEF gate after unfinished business —
while `v.grief > 0`, the grief thread displaces the DEFAULT want/small-talk
opening. Yields to concrete commitments (talk requests, table, unfinished
business) and acute bodily needs (`ask_favor` urgency ≥ 4 — crisis-leg
precedent). No new content: promotion only; the existing 2-line pool +
no-repeat ledger caps re-fires. **Proof:**
scripts/test-grief-promotion-20261015.js — RED (0/11 grief opens pre-fix),
GREEN (11/11 post-fix; acute favor and talk-request guards verified).
**Regressions:** convo norepeat/cycle/deflect suites, curious-seed-resume
(1 pre-existing RED identical on pre-fix HEAD), dialog-phase2,
validate-ontology 96/96.

## Blank #2 (filled): the grief window was 0.75 days, not 3

**Found by:** the r16 pilot's first execution (promotion only): 2 of 8 runs
had deaths but zero grief-thread conversations. **Root cause:** `v.grief`
is documented in DAYS ("days of village-wide grief (death)") but decayed
in `tickNeeds()`, which runs once per day-PART (4/day) — a 3-day window
burned in 3 parts. The acute window opened and closed between the driver's
daily conversation rounds. **Fix** (src/js/game.js): the grief/cheer decay
moved from `tickNeeds()` to `endDay()` — exactly once per day, as the
field's own comment says (sleep routes through endDay; verified no other
day-advance path). **Proof:**
scripts/test-grief-window-days-20261015.js — RED (3 parts drained 3→0),
GREEN (3 parts leave it 3; one endDay drains exactly 1). Pilot
re-measurement: 30 → 82 griefThreads, zero-grief runs gone.

## Blank #3 (filled): false "I just said — did you miss it?" across sittings

**Found by:** r16 grief transcripts (5 occurrences): after a legitimate
first follow-up ("What have you heard?" via betrayal:askheard), the NPC
snapped "I just said — did you miss it?" — an accusation about something
never said in that conversation. **Root cause:** `sayLine`'s no-repeat
ledger (`c.saidLines`) persists across sittings by design, but the
self-repeat fallback's contract is "said in THIS conversation". A reveal
line said days ago about another case re-blocked and produced a false
accusation. **Fix** (src/js/conversation.js): new per-sitting ledger
`c.saidLinesConvo` (reset in `startConvo`); only within-sitting blocks
keep the accusation fallback — older blocks get the honest dry line, like
run-blocks. **Proof:**
scripts/test-sayline-sitting-repeat-20261015.js — RED (cross-sitting repeat
→ accusation), GREEN (→ dry line; same-sitting repeat still → accusation
pool). Fresh pilot transcripts: 0 askheard→deflection occurrences (was 5
in the stale set).

## Blank #4 (filled): dry-line counter never reset — silent turns

**Found by:** r16 grief transcript (1201-competent-grief-10): 12
consecutive "Look at me." (betrayal:wounds) picks with ZERO NPC replies —
a no-silent-actions violation. **Root cause:** `c.dryLines` (the 9-use dry
pool cap, documented "in one conversation") never reset — per-RUN, not
per-sitting. After 9 lifetime dry uses, blocked beats went permanently
silent. (With blank #3 routing cross-sitting blocks to the dry path, this
became reachable in ordinary play.) **Fix** (src/js/conversation.js):
`c.dryLines = 0` in `startConvo`, next to the self-repeat reset.
**Proof:** scripts/test-drylines-wounds-20261015.js (A) — RED (null/silence
in a new sitting), GREEN (dry line).

## Blank #5 (filled): betrayal:wounds lied with no wounds

**Found by:** the same transcript investigation. `showWounds` honestly
narrates "You have no wounds to show" — but the handler then spoke "The
wounds speak for themselves." in dialogue ANYWAY, a lie the player hears
in the conversation UI (the narration feed may not be visible there).
**Fix** (src/js/betrayal.js): branch on `showWounds`' return — no wounds →
`"Nothing to show. Just my word."`; wounds → unchanged.
**Proof:** test-drylines-wounds-20261015.js (B) — RED (lie), GREEN (honest;
with-wounds path unchanged).

## People check

Read in full: 5 grief transcripts (fresh, post-fix). The villagers read
as people where it counts:
- grief-33 (1201/competent): the curious question ("Did you leave someone
  behind?") lands, "Me too." in the quiet, the r15 thread-resume fix
  working mid-conversation ("About grief — that was Ethan's thread. We
  never did get back to that."), comfort lines varying with no verbatim
  repeats, a natural ending ("Okay. We'll pick this up later.").
- grief-1/grief-41: grief opener → comfort arc, all NPC lines varied,
  endings resolve ("Right. Back to it, then.", grieving-voice closers).
- Fabricated-history incidents: 0. Robotic where the driver spams (the
  "Are you okay?" ×6 loops — driver-exaggerated; the NPC keeps varying,
  which is the engine behaving correctly under spam).
**People check: PASS (5/5).**

## Reachable / fun / winnable

- **Reachable:** yes — 93 grief-thread convos fired in natural 60d play
  across all mortality-bearing runs; the fixed paths (promotion guards,
  window length, deflection, dry reset, wounds honesty) are ordinary-play
  paths.
- **Fun:** yes — the village grieving out loud for ~3 days after a death
  is the village feeling alive; the deflection/dry/wounds fixes remove
  three "the game is lying to me / ignoring me" moments.
- **Winnable:** n/a for the social leg; nothing gates. (Noted: larceny
  runs show the justice system still has teeth — 16 moots in
  1201/larceny-leaning with repeat-offender escalation intact.)

## Metric review (docs/MEASUREMENT.md §14)

- **M1a: GO** (93 ≥ 5 grief-thread convos; 5/5 transcripts pass the bar).
  The split proposed in r15's metric review worked as designed.
- **G1: GO** (no spam; guards hold in proof + pilot).
- The pilot's `qa` key schema (`asked`/`answered`/`recalls`) still differs
  from `telemetry-baselines/social.json` (`askedTotal/...`) — the r15 note
  documented this; the telemetry-checker raises schema-mismatch LOUD lines,
  not data deviations. Next social run should adopt one schema before
  re-baselining. No baseline rolled forward this run.
- Process lesson (r16): the transcript dir accumulated stale files across
  pilot executions and a pre-fix transcript was misread as post-fix
  evidence. The driver now wipes TRDIR on launch.
- Mid-run master movement: the 08:15 CDT master↔origin reconciliation
  (682caa3b) and the region-content-wave1 merge (15614d03) landed while
  this run was in flight — the branch is rebased onto the new master and
  proof + regression suites re-run on the new base before landing (see
  commit message).

## Telemetry

`telemetry-check.js` vs `telemetry-baselines/social.json`: LOUD lines are
the known schema mismatch (r15 key names vs baseline key names) — no data
deviation; qa counters healthy (asked == answered every run). Explained,
not rolled forward (per r15's standing note).

## Convergence line

Social-life axis (leg 5): grief thread reachable (blank #1, M1a GO);
grief window actually 3 days (blank #2); cross-sitting false accusations
eliminated (blank #3); dry-line silence fixed (blank #4); wounds honesty
(blank #5). Transcript quality bar holds (people check 5/5 PASS, 0
fabricated history). Villager-agency axis unaffected. Blanks #3–#5 also
harden the moot/justice paths (betrayal:askheard/wounds are case-system
verbs, not grief-specific).
