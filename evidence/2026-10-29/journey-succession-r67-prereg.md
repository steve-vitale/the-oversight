# Journey succession r67 — SIBLING SEAM TRACE (lane B, leg 7, pre-registration 2026-10-29)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
Base: master a6fa0710c (r64's base 930fc9674 + hunthold instruments + armor
build + ship bump; src/js delta since r64 is armor-only, no conversation change).
Instrument only unless a fix below is pre-authorized. NO game change in this run.

## The question

r64 closed the invite seam in full-run play (21/21 invite outcomes spoken)
but counted 10 sibling deflections it deliberately did not fix: want-detail
("Tell me why you need this.") 6, teach ("Teach me something from the wild.")
3, show ("Can I show you something?") 1 — every one the first dry line
("...Sorry, lost my train of thought."). r64 reported their mechanism as
"consistent-with" the ledger block but explicitly NOT traced. This run traces
them. Fix-all C left widening the diegetic-act exemption to teach/tell-me as
a Steve-call; this run does NOT widen it — it produces the traced evidence
that call needs.

## Instrument

r64 driver verbatim → r67 (names, date, EVID, mode only) + SAYTRACE:
- sayLine wrapper: records every fellBack event and every null return with
  pre-call ledger state (key in saidLinesConvo = SELF candidate, key in the
  run ledger = RUN candidate), opts flags (diegeticAct / inviteBeat /
  structural), the returned chunk, the driven-convo tag + pick, and stack
  sites. Behaviour unchanged: forwarded, return preserved.
- Pool-draw wrappers on convoDryLine / convoSelfRepeatLine: record the drawn
  line + caller stack sites, so a dry line drawn directly by a dlg handler
  is distinguishable from a sayLine fallback draw (sites[0] in
  convo-dialogue.js = DLG-DIRECT; in conversation.js = SAYLINE-INTERNAL).
- Analyzer TRACE JOIN: every transcript deflection joined by (seed, vid,
  line text) to pool-draw and sayLine-fallback candidates; day printed for
  hand-verification against the transcript's dplus checkpoint
  (convo day ~= death day + dplus). Join is reported, never auto-judged:
  the run note names each deflection's mechanism by hand from the join.

Static scope audit (read, not changed): the convoTurn tail emits through
sayLine with diegeticAct only when choiceId === 'invite_party'
(conversation.js, fix-all C comment: "teach / tell-me drops share the ledger
but ride different handlers and are not touched here"). The trace tests
whether the live deflections actually travel that path.

## Seeds, regime, policy

Matched seeds from r64 (same seeds, new master): pilot 26131, 26132
(chain-forced, SECOND_KILL_DPLUS=20), 26134, 26135 (controls).
Competent policy, POST_DAYS=45, EARLY_KILL_DAY=40 (mature window label
carried from r64's metric review: staging is an aspiration, 0/4 scripted
in r64, and is NOT re-judged here).
PILOT FIRST (§9–12): if the pilot shows 0 sibling deflections across all
4 seeds, the trace verdict is INSUFFICIENT-DATA (opportunity-0), never
TRACED-by-absence; the carried invite check is still judged. Expansion to
the full r56 band (26133 chain + 26136 control) only if the pilot is
opportunity-0 for the trace AND the invite check needs more outcomes.

## Binding verdicts (§14 — a miss is NO-GO, never re-scored)

- TRACE-CLASS (binds): for each sibling deflection joined to a trace event,
  class is RUN-BLOCK (sayLine fellBack, preRun, no exemption flag),
  SELF-BLOCK (sayLine fellBack, preSelf), DLG-DIRECT (pool draw with a
  convo-dialogue.js first site and no sayLine fellBack for the turn), or
  UNJOINED (no candidate — reported as a trace gap, not a mechanism).
  Verdict SAME-CLASS iff ≥1 joined sibling deflection is RUN-BLOCK (the
  invite pre-fix shape: a speech-content line dry-replaced because another
  villager recently said the same line). MIXED if classes split across
  deflections. DIFFERENT if all joined deflections are DLG-DIRECT or
  SELF-BLOCK. UNJOINED deflections are listed, never folded into a class.
- CARRIED-INVITE (binds): 0 deflected invite outcomes across the pilot
  (seam stays closed). Any deflected invite outcome = OPEN (regression),
  transcript + seed named.
- CHAIN SPOT (reported, not re-baselined): second-handoff bond counts from
  the analyzer's carried sections; a wipe vs r64's 19/19 would outrank the
  trace question and be named as such.
- PEOPLE CHECK (binds): every transcript containing a deflection read in
  full; remaining transcripts diffed against r64's same-seed transcripts
  (armor-only src delta expected — any non-armor drift read in full too).
  0 fabrication flags or the flags are named.

## What would count as an interesting finding

- A sibling deflection that is NOT a run-block (e.g. a dlg handler drawing
  the dry pool directly, or a self-block across sittings misread as a run
  block) — the exemption-widening call differs by class: a run-block wants
  the invite exemption extended; a direct draw wants the handler fixed.
- A sibling deflection whose outcome line was never composed at all
  (no sayLine call for the turn) — missing content, not a ledger block.
- An invite outcome deflecting after r64's close (regression) or a
  second-handoff bond wipe (carried-integrity break).

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (r54 prereg,
unchanged). Bond rules are betrayal.js header; close-read definition is
convoTopics.js (depth >= 2 = close). No canon is invented here.
Gating freeze (2026-10-27) untouched: no gate, deed-bar, standing, wave,
or table-price change is in scope. Perception law untouched: invites here
are player-chosen; no partner-selection change is in scope.

## Metric review (carried)

- r64: SEAM-INVITE GO (21/21 spoken, 14 accepts / 7 declines);
  SEAM-SIBLINGS 10 deflections, all first dry line, mechanism untraced;
  second-successor bonds 19/19; phantoms compound per handoff (r56 pattern).
- r64 telemetry check: 2 LOUD lines, both EXPLAINED (metric-shape
  artifacts), baseline NOT rolled; succession baseline stale vs the r55+
  instrument — re-seeding needs a regime note by its owner, not a silent
  roll from this run. Same treatment here.
- r56 M4-partial organic-detection anomaly did not recur in r64.
