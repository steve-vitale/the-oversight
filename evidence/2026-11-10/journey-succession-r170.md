# Journey succession r170 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r170 (next Lane B number after r169 succession) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master 53185abea (meleefirst-b adoption) at merge; r169
work based on b5f3540d0, rebased onto 53185abea at closeout ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-10/journey-succession-r170-prereg.md.

## Standing state: stale-lock recovery + r169 adoption

r169 died at its gate. Lock 2026-11-10T08:55:31Z (~2h old at this
run's 10:57Z start); journey2-succession registry heartbeat
09:53:40Z (63 min stale); no live processes in the tree (the two
`check.js --quick` processes the main session saw live at 09:50Z/
09:56Z had exited; last file write 09:46Z). Dead by the guard's
own test (heartbeat stale + no live processes). Stale-lock
recovery: lock deleted, this run's lock created
(2026-11-10T10:57:19Z), tree adopted in place (same slug — the
register script refuses a registered slug, and the tree still
exists with its branch and uncommitted work intact; heartbeated
immediately + 5-min hbloop for the whole run).

Adopted from r169, verified before committing:
- Commit 836993301 [needs-eyes]: dlg:more dry closer is wind-down
  grammar (Javier 34003 d71).
- Amendment A1 (was uncommitted): blocked dlg:more beats fall
  through honestly (Ernst 34015 d55) + proof-test 3rd case +
  transcript-scan assertion + prereg amendment + full panel
  evidence + run note. r169 proof re-run ALL GREEN on the A1 tip;
  family proofs r146/r147/r151/r155/r157/r161/r166 7/7 GREEN.
- Committed as c27c3dad1 [needs-eyes]. Safe-commit index clobber
  struck (154 files staged-as-deleted + 3 MM); repaired with the
  documented pipe (`git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info`); status + diff vs HEAD empty
  after repair, commit blob-verified.
- r169's gate NEVER completed (checkquick.log ends mid-progress,
  204 bytes) — re-run in this run, on the final tip (see Gate).

## The carried blank, answered (Catalina ask:lately dry)

Mechanism pinned pre-play from the committed r169 sayTrace
(seed 34016 d62 Catalina, the seed's only fellBack entry): pick
ask:lately, the composed ack + change + event line
('"Huh. Let me think about that." "You asked me that before.
It\'s a different question now." "Have you felt it? Like the air
before a storm, but — bigger. Something\'s on its way."'),
preRun=TRUE, fellBack=true. The lately topic is the village-wide
table-waiting event (2 variants); the composed line is ack +
change + event, so two villagers can compose the IDENTICAL
string — the first speaker ledgers it, the second speaker's
sayLine (structural:false) run-blocks it and dry-replaces it.

## Design call (this run — Steve can overrule)

A lately answer is shared village news, not per-villager content
— the same class as the r17 structural beats, the r25
mood-silence line ("two villagers filling quiet the same way on
one day is not parroting"), and the r169 dlg:more closer. The
fix: the ask:lately branch sets `structuralTurn = true`, so the
generic emission at conversation.js:7169 skips the run-ledger
block for the lately answer (the r25 silence precedent, a
one-line flag in the branch). The per-sitting ledger still
applies; the event/ack/change pools still cycle per villager;
the dry line stays available for genuine content-beat blocks.
Scope: the ask:lately branch in src/js/conversation.js ONLY.

## The fix (src/js, conversation.js ask: branch, +14)

One line + comment. Proof test
scripts/test-journey-succession-r170-lately-dry.js, 2 cases:
- collision (seed 5600): A + C speak lately, then B asks lately
  and composes A's exact line. B must speak the honest event
  line (the SAME shared line), never a dry line, no dry line
  anywhere in B's transcript. RED on unfixed code (4 FAILs — B
  dries), GREEN after. ALL GREEN.
- control (seed 5601, no poisoning): B's line does not collide,
  a genuinely unblocked turn. All three answer honestly.
  Passes on fixed AND unfixed code (the unblocked path is
  untouched). ALL GREEN.
Staging note: a 2-speaker search found 0 hits in 150 seeds —
convoPick's village-fresh preference steers each speaker to the
variant nobody said yet, so two speakers can never compose the
same line. Three speakers fix it: A speaks one variant, C the
other, both village-stale for B, and B's event pick is a free
draw. Seed 5600 collides on the first try. Search script (throw-
away, kept outside the repo):
~/workspace/worktrees/journey2-succession-r170-lately-search.js.

## After-leg (wild re-run, seed 34016 on the fixed code) — VERDICTS

Driver scripts/journey-succession-r170-20261110.js (r169 driver,
rename only), analyzer same rename. Seed 34016
(EARLY_KILL_DAY=40, POST_DAYS=70) + the committed r169 panel
re-analyzed with the revised analyzer (see below).

- **DRY CENSUS (binding, ask:lately turns): PASS.** The re-run's
  sayTrace is EMPTY (the driver records a sayTrace entry only on
  fellBack/null) — 0 fellBack anywhere on the seed, against 1 in
  the r169 run (the Catalina dry). Catalina d62 speaks the event
  line (transcript-verified, see below). No NEW dry anywhere.
- **Catalina d62, before/after (transcript-verified):** the two
  dplus30-Catalina transcripts are byte-identical except the one
  turn. Unfixed: "How are you holding up — really?" → "...Sorry,
  lost my train of thought." — then the player says "..." and the
  sitting moves on. Fixed: the same question → "Huh. Let me think
  about that." "You asked me that before. It's a different
  question now." "Have you felt it? Like the air before a storm,
  but — bigger. Something's on its way." — and the player answers
  "Yes." and Catalina says "All right. Thank you for telling me."
  The fixed line OPENS a genuine follow-up exchange (the
  gq:yn:yes pick appears in the fixed run's pick list, absent in
  the unfixed run).
- **Controls unchanged:** the re-run's tele dict is byte-identical
  to the r169 34016 run (deaths.bearer 4, alive 2, fallen 11,
  stage 3, mentions 4; same death d32 Hudson -> Joyce, same 3
  chain deaths). The fix touches only dialogue.
- **MANTLE-FINE (re-run seed): PASS** (4 deaths, all synchronous;
  0 day-skips; pick rank 1; funeral INCALL true; selfReq 0).
  CAP-NC bonded-by-deadline 1/1 (single-seed, INSUFFICIENT-DATA
  as a panel — expected).

## Analyzer revision (r169 metric review, implemented this run)

The r170 analyzer implements the r169 proposal and re-runs it on
the committed r169 panel JSONs (PREFIX=r169):
- VILLAGE-OVER exclusion: over==true rows classified apart
  (34013 d90, 34018 d68) and excluded from the binding verdict.
- SAME-DAY-CASCADE classification: fineLatency==1 with an
  earlier same-day sibling death is SAMPLING-or-CLEAN (34013
  d89: six earlier deaths shared the day). A latency-1 with
  neither roll cover nor a same-day sibling stays
  UNEXPLAINED-1 — the bar keeps its teeth.
- Result: **MANTLE-FINE PASS** — deaths observed 67 (village-over
  excluded: 2; flippedImmediate=false: 0; fineLatency>=2: 0;
  fineLatency==1 unexplained: 0; held-briefly 6; day-skips 0).
  This matches the r169 adjudicated substance exactly (65/65
  synchronous handoffs with a living successor, 0 real
  deferrals). The r169 letter-FAIL stands (NOT re-scored); the
  revision is validated for the NEXT run's bar. CAP-NC still
  INSUFFICIENT-DATA (unchanged).

## Gate

[GATE — line appended at closeout.]

## Rotation

7 → 4 (endgame next). [Advance at closeout; verify the file reads 4.]

## Telemetry

[Line appended at closeout — run on the r169 panel tele files +
the 34016 re-run tele file.]

## Village assessment (plain words)

The villages bled the same as r169 found them — this run changed
nothing about who lives or dies (the re-run's numbers are
byte-identical to r169's). What changed is one conversation: a
woman who had just watched the table's summons hang over her
village, asked how she was holding up, no longer loses her train
of thought mid-sentence. She answers — the storm is coming, the
air feels wrong — and the talk goes on from there, honestly. The
mantle still passes every time there is anyone left to pass it
to, and the instrument that judges that now knows the difference
between a village that ended and a mantle that failed.

## PEOPLE CHECK (sense)

The Catalina d62 transcript read in full (both versions) + the
proof-test collision transcripts. The fixed turn has meaning:
a caring question gets a real answer about shared news, and the
answer opens a real follow-up ("Yes." → "All right. Thank you
for telling me."). No new filler, no line promising a need that
isn't there. The one remaining same-class site (convoThreadBeat's
`exh` closers, base `more` choice) never dried on either panel;
carried, covered by the same design call for a future run.

## Metric review

- The r169 MANTLE-FINE proposals are IMPLEMENTED and VALIDATED
  this run (see Analyzer revision above): the revised verdict on
  the r169 panel is PASS, matching the adjudicated substance.
  The NEXT succession run judges MANTLE-FINE under the revised
  rules. The r169 letter-FAIL stands, un-rescored.
- The day-skip instrument correction stays open (r166/r169/r170:
  zero day-skips across 67 deaths / 9 seeds / ~800 sleeps + 0
  across the 34016 re-run's 102 sleep rolls, no deterministic
  staging path) — carried, not implemented.
- CAP-NC denominator: stays descriptive (r169: 2 eligible; r170
  re-run: 1/1 bonded-by-deadline on a single seed). A decisive
  verdict needs a longer panel or a band with earlier arrivals —
  a future run's question, not this run's.
- The 2-speaker lately collision is unformable by construction
  (village-fresh preference steers speakers apart) — the
  three-speaker staging is now the documented pattern for
  shared-news collision proofs; future dry-path tests on
  village-wide event lines should stage three speakers, not two.
