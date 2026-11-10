# Journey succession r169 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r169 (next Lane B number after r168 crisis) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master b5f3540d0 (journey-crisis r168) ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-10/journey-succession-r169-prereg.md.

## Standing state

r166-succession LANDED on master (askfavor exhaustion fix f9ef1c0dd
[needs-eyes]; gate 292/8 adjudicated GO, family proofs 7/7). r167
social life + r168 crisis landed since. This run answers the ONE
carried owed item r166 left open: the Javier dlg:more dry (seed
34003, r165 panel) — "same defect class, no binding bar; next
succession run owns it and it needs a design call, not a knob."

## The carried blank, answered (Javier dlg:more dry)

Mechanism pinned pre-play from the committed r165 sayTrace
(seed 34003 d71 Javier, the run's only fellBack entry): pick
dlg:more, key '"I wish there was more to tell. That\'s it."'
(variant 2 of the dlg:more dry pool), preSelf=false, preRun=TRUE,
fellBack=true, returned the dry line. The secret thread has no
follow-ups, so convoThreadBeat returns null and the handler falls
to its dry pool; all 3 closers had been spoken to Javier across
sittings, the cross-key reset freed the oldest, and convoPick's
run-ledger handling is a preference, not a filter — so it returned
the freed variant anyway even though it sat in the 48-entry run
ledger. sayLine dry-replaced it, truthy, so the handler's `||`
fallback never fired (the r166 lesson).

## Design call (this run — Steve can overrule)

Thread wind-down closers are conversation GRAMMAR, not content —
the same class as the r17 structural beats (resume openers, recap
lines, thread-resume responses). Canon backs it:
docs/CONVERSATIONS.md — "Required answer acknowledgments and
commitment confirmations are dialogue grammar, not interchangeable
flavor. The repeat ledger must not replace a successful promise
with 'lost my train of thought.'" and "Generic pools (exits, 'told
you everything', acknowledgment filler) cycle in varying order."
A villager saying "That's the whole of it" after another villager
said it earlier in the day is not parroting; it is how people end
a thread.

## The fix (src/js, convo-dialogue.js dlg:more handler, +32/-3)

Two parts, both in the dlg:more handler:

1. **Dry-pool closer is structural** (the Javier path): the closer
   is emitted with `{tag:'endtopic', structural: true}`, so sayLine
   skips the run-ledger block for it. The pool still cycles per
   villager (pickCycle keep=2, no immediate verbatim repeat); the
   line still lands in the per-villager ledgers, just not the run
   ledger; the dry line stays available for genuine content-beat
   blocks. The `||` fallback literal rides the same call.
2. **Blocked beats fall through honestly** (the Ernst path, found
   on this run's own panel — see below): when the thread HAS a
   beat but sayLine would block it, the handler must fall through
   to the closer pool instead of returning the unspoken beat. Two
   guards, both needed:
   - `!c._sayFellBack` after each sayLine (the r166 lesson: the
     dry line comes back truthy). Without this the handler returned
     the composed beat as said while the transcript held the dry
     line — and cleared threadDryFor, claiming the thread alive.
   - `convoWouldBlock` PRE-CHECK before each sayLine (the r19
     opener pattern). The fell-back guard alone is not enough:
     sayLine EMITS the dry line into the transcript before the
     handler can fall through, so the 34015 re-run transcript held
     the dry line AHEAD of the closer ("...lost my train of
     thought." then "That's the whole of it. Sorry."). Never hand
     a blocked beat to sayLine. Applies to the secret-followup path
     too (same shape, same hole).
   - Side effect, correct: a blocked beat no longer grants its
     trust +1 or engages the want — the old code did both for
     content never delivered (the gap-closure comment's
     ledger-mute class). Unblocked beats are unchanged.

Scope: the dlg:more handler only (the observed miss + its adjacent
beat path). Same-class sites NOT touched: convoThreadBeat's `exh`
closers (conversation.js:3423 small-talk opener, :3808 topic
re-ask) and the base `more` choice (:6545) — none dried on this
panel; the design call above already covers them for a future run.
No ledger, trust, RNG, gate, deed, wave, or table change beyond
the blocked-beat trust note above.

## Proof test (scripts/test-journey-succession-r169-dlgmore-dry.js)

3 cases (each in its own process):
- dry-allblocked (Javier state: all 3 closers poisoned + said to
  this villager): reply is an honest closer, never a dry line.
- beat-blocked (Ernst state: goal thread, whole goalFollow pool
  poisoned): reply is an honest closer, thread marked dry.
- control (unblocked): reply is a closer, thread marked dry.
Verified RED on unfixed code in both directions:
- dry-allblocked on the committed code: reply was the dry line.
- beat-blocked on the fell-back-only (v1) code: last line was the
  closer BUT the dry line sat ahead of it in the transcript — the
  transcript-scan assertion (added after the 34015 re-run caught
  it) FAILS on v1 and PASSES on v2. The last-line check alone is
  not enough; the test now asserts NO dry line anywhere in the
  transcript.
GREEN after the fix (ALL GREEN, 18 checks). r146/r147/r151/r155/
r157/r161/r166 family proofs re-run GREEN on the fixed tip
(before the panel; re-run again on the final tip — see Gate).

## After-leg (fresh panel, fixed code) — VERDICTS

Driver scripts/journey-succession-r169-20261110.js (r166 driver,
rename only), analyzer same rename. Seeds: FRESH BAND 34011–
34018 (EARLY_KILL_DAY=40, POST_DAYS=70) + smoke 33998
(EARLY_KILL_DAY=5, POST_DAYS=25). Analyzer:
evidence/2026-11-10/journey-succession-r169-analyzer.txt.

- **DRY CENSUS (binding, dlg:more turns): PASS, after the second
  fix.** Panel (pre-beat-fix code): 1 miss — seed 34015 d55
  Ernst, dlg:more, the Najla-pods goal beat run-blocked
  ("Tell me about them." → dry line). The beat-path fix above
  answers it; the 34015 re-run on the fixed code speaks the
  closer ("Tell me about them." → "That's the whole of it.
  Sorry."), 0 dry lines in the transcript, 0 dlg:more fellBack.
  The dry-pool path (Javier's) produced ZERO misses on the panel:
  no dlg:more:dry fellBack anywhere. The only remaining dry line
  on the panel is seed 34016 d62 Catalina, pick ask:lately —
  the lately topic line run-blocked. Same defect class, different
  turn type, no binding bar: CARRIED, documented below.
- **AGENCY-DRY / TEACH-DRY / OPENER-DRY (binding, carried):
  PASS.** 0 on all seeds. (The remaining fellBack entries are
  foreign-language lines — Boris/Sanne/Faten — returning the r81
  nonverbal gesture narration, not dry lines; honest by design.)
- **MANTLE-FINE (binding, carried): FAIL on the letter, PASS on
  the substance — adjudicated below.** 67 deaths observed.
- **CAP-NC: INSUFFICIENT-DATA** (2/2 eligible bonded-by-deadline;
  denominator < 3). Descriptive bondedEver 6/6 probe-opened
  seeds. No re-score; the longer/earlier-arrival panel stays a
  future run's question.
- **Control:** smoke 33998 byte-identical across r161-before,
  r165, r166, r169 (deaths 1, alive 11, fallen 1, stage 3,
  mentions 2). DeAndre d+14 still speaks the trapline line —
  the r161 agency fix holds. SELF-REQUEST 0 everywhere.
  CARRIED: pick rank 1, funeral INCALL true, every seed.
- **The panel ran bloody:** 64 bearer deaths on the 8 fresh
  seeds (r165: 16), two villages at 0 alive (34013, 34018 — both
  ended). Band variance, not the fix: the fix touches only
  dialogue wind-downs (and the blocked-beat trust note, which
  can only lower trust for unspoken content), and the smoke
  control is byte-identical. Deaths are "the wild"/stranger/
  arena/contest, not trust-starvation.

### MANTLE-FINE adjudication (the FAIL, in full)

Analyzer verdict: FAIL — notFlipped [d90, d68], unexplained1
[d89]. All three are explained, none is a mantle deferral:

1. **34013 d90 + 34018 d68 (flippedImmediate=false): VILLAGE
   OVER, not a deferral.** Both rows carry `over: true` and the
   overCause reads `villageLost: true, alive: 0` — the bearer who
   died was the LAST living villager. Game code confirms the
   behavior is designed: ledger.js:843-854 — when the successor
   candidate list is empty, playerDeath sets over/villageLost,
   says "No one is left to pick up the Codex. The village dies
   out...", records the legend, wipes, and returns WITHOUT
   flipping villagerId. There is no one to flip TO. The
   instrument counts a game-over death as a mantle failure; the
   bar's intent (r165: "does EVERY bearer death flip...") presumes
   a successor exists.
2. **34013 d89 (fineLatency 1, rollCover false): SAME-DAY
   CASCADE sampler lag, not game latency.** flippedImmediate is
   TRUE at return (the game flipped synchronously — newIdAfter
   differs from oldId). Three deaths shared d89; the sampler's
   sleep/post checkpoints caught only the cascade's endpoints,
   so the first sample showing the new bearer landed d90. The
   latency is the sampler's, not the game's — the same class as
   the r165 sampling adjudication, now in same-day-cascade shape.

Substance: 65/65 handoffs with a living successor flipped
synchronously; 0 real deferrals; 0 day-skips; 0 fineLatency>=2.
The binding bar as pre-registered FAILS on the letter because
the instrument has no VILLAGE-OVER exclusion and no
SAME-DAY-CASCADE classification. Per §14 the metric is NOT
re-scored this run — the FAIL stands on the letter, the
adjudication above is the substance, and the instrument revision
is proposed for the NEXT run (metric review).

### Carried: Catalina ask:lately dry (34016 d62)

Player asks "How are you holding up — really?" (ask:lately) and
hears "...Sorry, lost my train of thought." — the lately topic
line ("Huh. Let me think about that." + "You asked me that
before..." + storm line) was run-blocked; another villager had
said the same lately line recently. Same defect class as Ernst,
different turn type (topic2 'lately' rather than dlg:more), no
binding bar. The lately handler needs the same WouldBlock
pre-check + graceful fallback treatment; the design call above
(wind-down/content-beat honesty) covers it, but the emission site
is a different handler — a future run owns the fix + proof, same
as Javier was carried by r166. NOT fixed this run.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. The check
LOUD-flagged deaths.bearer (sum 65 vs baseline mean 7.6) and
census.fallen (sum 94 vs 14.3). **Diagnosis: summation artifact
(known, r151/r155/r157/r161/r166) — the checker sums across 9
files while the baseline holds per-seed means.** Per-seed means
on the r169 panel (n=8, from the original stdout JSONs):
deaths.bearer 8.0, census.alive 3.1, census.fallen 11.6,
census.integrationStage 3.0, week2.deadBearerMentions 4.1 —
against baseline 7.6 / 3.8 / 14.3 / 3.0 / 4.2. Deaths slightly
up, alive down, fallen down: a harder band draw (two villages
ended), not a base change — the smoke seed is byte-identical and
the fix touches only dialogue. No real deviation; baseline NOT
rolled forward. (Note: the checker's glob also swept the two
34015 after-run stdout files; the means above are from the
original panel stdout JSONs only.)

## Village assessment (plain words)

This band of villages bled. Eight villages, sixty-four bearers
dead, two of them down to the last person standing — one village
lost its bearer nine times in a single day before the last of
them died alone. And still the mantle never once failed to pass
while there was anyone left to pass it to: sixty-five handoffs,
every one in the same breath as the death. The people in them
talked like people all the way down — a man who keeps the fire
lit where it sits because somebody should tend the waiting; a
woman doing the water math out loud, one liter for nine people;
a villager who writes down everything strange because someone
should; a refusal with character ("Out there? I'd rather not
die today, thanks."). The one real blemish the panel found was a
villager losing his train of thought mid-sentence about his taken
kin — fixed, and the same seed now answers him properly. One
blemish remains, carried: asking "how are you holding up" can
still dry out when another villager said the same line first.

## PEOPLE CHECK (sense)

8 panel d+14 transcripts read in full (one per seed; 34018 has
no d+14 file — read its d+15 Avery instead) + smoke control +
the Ernst/Catalina dry transcripts. Conversations have meaning:
real wants with live numbers (Aaron's cistern: 1 liter, 9
people), real grief with names (Hank: "Angela and I never did
finish talking..."), real refusals (Felipe's invite decline),
real nonverbal conversation (Cem's Turkish gestures, no English
meta-speech), the r166 favor-details fix holding in the wild
(Aaron: "Tell me why you need this." → "Do the math with me...").
No new filler, no line promising a need that isn't there. The
two dry lines found are the Ernst (fixed, verified in the wild)
and Catalina (carried) cases above.

## Gate

[GATE PENDING — check.js --quick running in the worktree at note
time; line appended at closeout.]

## Rotation

7 → 4 (endgame next). [Advance at closeout; verify the file reads 4.]

## Metric review

- The MANTLE-FINE bar as pre-registered is WRONG for two
  instrument reasons, both observed this run for the first time
  (r165/r166 panels never had a village-ending bearer death or a
  same-day cascade this dense): (a) it counts game-over deaths
  (over==true, alive==0) as mantle failures — the analyzer needs
  a VILLAGE-OVER exclusion; (b) its fineLatency==1 /
  rollCover==false "UNEXPLAINED-1" class has no SAME-DAY-CASCADE
  classification — when ≥2 deaths share an entryDay, the sampler
  can only observe the cascade's endpoints, so a latency-1 first
  sample is sampler lag. Proposed revision for the NEXT run:
  exclude over==true rows from the binding verdict, and classify
  fineLatency==1 as SAMPLING-or-CLEAN when an earlier death shares
  the entryDay (or when flippedImmediate==true at return, which
  already proves the synchronous flip). The bar is NOT re-scored
  this run: the letter-FAIL stands above, with the adjudication.
- The day-skip instrument correction stays open (r166: zero
  day-skips across 22 deaths; now 0 across 67 deaths / 9 seeds /
  ~800 sleeps, no deterministic staging path) — carried, not
  implemented.
- CAP-NC denominator: 2 eligible again (second handoffs
  dominate). A decisive CAP-NC verdict needs a longer panel or a
  band with earlier arrivals — a prereg question for the NEXT
  run, not a re-score.
- Catalina ask:lately dry (34016) is the same defect class on a
  turn type with no binding bar; carried as a documented finding
  with the mechanism pinned (lately topic line run-blocked; no
  graceful fallback at that emission site). The next run owns it.
- The proof test's last-line check is NOT sufficient on its own
  (v1 lesson): a fall-through after sayLine leaves the dry line
  visible ahead of the closer. The transcript-scan assertion is
  now part of the r169 test; future dry-path tests should assert
  on the transcript, not the returned line.
