# Journey crisis r42 — sick-stay-home gates (2026-10-22, lane B)

## Pre-registration (§14)
- Question: do sick villagers inappropriately leave on expeditions / get asked to walk guard during disease outbreaks?
- Seeds: 101/202/303/404 (pilot). Policy: competent.
- GO bar: sick villagers never depart on expeditions, never asked as guard companions.

## Finding
Pre-fix pilot: the feverish shouldered packs for multi-day expeditions and were asked to walk guard — the expedition departure gate (objMaybeDepart) saw them, but the companion-depart path inside the LEADER's call never checked sickness.

## Fix (11 lines, 2 files)
- `src/js/villager-agency.js`: expedition launch returns early for sick villagers (parity with objMaybeDepart).
- `src/js/villager-objectives.js`: guard-companion selection skips sick villagers.
- Proof: `scripts/test-sick-stayhome-gates-20261022.js` 7/7 GREEN (re-verified by recovery agent).

## Metric review
- M6 (16 transcript sense-reads) NOT completed at timeout — transcripts on disk (journey-crisis-r42-seed*-d*.txt).
- Post-fix before/after panel NOT run — next crisis run should run it.
- Regression suites NOT run at recovery — fix is additive early-returns with green proof; next run to confirm via check.js.

## Recovery note
Timed-out run adopted by main agent 2026-10-22 ~12:00 CDT: no live processes, heartbeat 16:28Z stale. Fix re-verified, committed, tree released.
