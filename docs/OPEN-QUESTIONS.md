# OPEN QUESTIONS for Steve

Only questions **not already answered** in `docs/godpath/STEVE-ANSWERS.md`.
Check that file first. When Steve answers, copy his words there (dated) and
delete the question here. The early-October list is archived in
`docs/_archive-OPEN-QUESTIONS-2026-10-03.md`.

Format: question, the default in place now, and where the lever is.

**Q2 (2026-11-07, sim-alienplayer-canon-b) — The word "stranger" is
overloaded: road teacher vs alien killer. Intended?** Default: both
systems keep the word — the road stranger teaches, the alien player
kills, and only the death cause `a stranger` names the killer. If the
overload is a problem, the road encounter is the one to rename (the
alien branch is load-bearing: death records, Codex, and
knowledge-gating all key off it). Lever: the road-stranger encounter
copy (encounters.js road text) — a prose change, not a system change.
See docs/ALIEN-PLAYERS.md, Open questions Q2.

**Q4 (2026-11-07, journey-endgame-r152) — Exile locks the endgame:
should a villager's feast-surge spend count toward the food deed when
the scholar can never feast?** Default: no — the lesser seat requires
`foodDeeds = sentimentTaught && feastSurgeUsed`, and `feastSurgeUsed`
is set only by the scholar's own feast buff (`_spendFeastedPower`,
feastBuff.js); an exiled scholar can never feast, so the surge can
never spend even when the village does everything else (seed 89703:
standing 386, 3 wave-4 kills, 3 living veterans banked, wave 5
unlocked, table never came). If Steve wants a villager's spend to
count, that is a deed-gate change, not a tuning change. Win prices
and deed gates stay untouched unless Steve orders otherwise. Lever:
table.js tableSeat / progression.js deedGateReady +
feastBuff.js `_spendFeastedPower`. See
evidence/2026-11-07/journey-endgame-r152.md (89703 investigation).
