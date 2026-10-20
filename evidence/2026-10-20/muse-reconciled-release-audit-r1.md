# Shared Muse/Codex release reconciliation

Build: `347cce498-20261020-194257`. This combines Codex runtime repairs
`3329c74bf` / `dedc46db7` and release stamp `347cce498` with Muse's
`699c56ba8`. Their common ancestor is
`a4404566ccfee345813469a842b1994b9083cc2b`: three local commits versus 33
later upstream commits. A normal two-parent merge preserves both histories.
Only generated release files conflicted: index.html, build.js, sw.js and
version.json. Runtime changes merged without conflicts and Muse's departure,
knack and gossip behavior is retained. The historical disjoint
`codex/resume-claude` branch is not the source for this release. A direct Git
check also finds that older branch's common ancestor `7d011395d` with Muse
699c56ba8, with 149 unique local commits and 876 upstream commits. The dated
3,470/disjoint lane note is stale. Preserve those 149 commits for separate
review and use current master/main for release/calibration.

## Verification

- Initial quick: 261 passed, zero failed. Initial full: 1032 passed, one
  inherited observer-fixture failure. Final quick: 261/0 in 42s; final full:
  1033/0 in 202s, including the revised 84-check predation proof (82s).
- Favor action contract: 50 passed. Muse departure-purpose 8, knack-dedupe 4,
  gossip-walkdown 2 and taking-phrase 18 checks pass. Two proof openers now
  use the shared real paged-menu navigator; their original gameplay
  assertions are unchanged. The original arbitrary-first-choice walk was
  inconclusive after the conversation repair, not proof the gossip broke.
- Predation observer proof: 84 checks pass after retaining four original
  idle-seed endings and independently checking the original 30-day coverage
  bar using the real capable controller on those same seeds. It passes the
  full policy context and preserves the controller's fight/contest/choice
  hooks, with policy exceptions surfaced as warnings. The initial full
  failure was idle seed 7 ending at day 11: a read-only run of actual Muse
  699c56ba8 produces the same ending, every state snapshot and RNG tail as
  the merge. No survival lever was changed, no assertion lowered and no
  seed dropped. The baseline comparison and final proof log are retained.
- Two real touch-emulation journeys at 390x736 / 390x844: 16 checkpoints
  each, zero page errors, 164 exact boot inputs validated, no outer scroll.
  Both cover real conversation menus and the saved Deer fight's zero-move
  Wait and edge escape. Duplicate CDP response-body captures can fail while
  another capture provides the required exact source; this is source
  coverage proof, not a certificate of flawless network recording.
- A fresh four-policy seed-7 panel plus four observer-off controls passed
  neutrality against the actual merged source. It is a source/observer
  maintenance proof, not a new matched balance study. Historical final-r3
  64-case panels and 36 exact replays retain their warnings and source
  labels; they do not become measurements of Muse's later combined changes.
- Installed update from actual Muse `699c56ba8` build
  `b9441dd46-20261020-172432` to this build preserves the saved localStorage
  byte-for-byte, then cold offline Continue succeeds with a current service
  worker, page height 736 and no page errors. Desktop emulation remains
  distinct from physical iOS/Android clearance.
- Additional six-world conversation sample: 55 conversations, 478 turns,
  actual day 1/32/90. Zero unknown reply context, unseen generic questions,
  label/selected-word drift, closing-topic leaks or focus leaks. One formal
  stem flag is the known Ingrid laugh-memory question's added "friend?"
  vocative; the offered answers still address the actual question. Six
  sampled exchanges and that flag were manually read. Vague recaps remain
  visible; this does not claim all dialogue prose is fixed. Day-90 campaigns
  end `over-other`, so this is not new play-until-death clearance.

Retained artifacts use `muse-reconciled-*` prefixes in this directory.
The source-bound maintenance proofs are updated through their normal tools.
No survival/reward lever was tuned to recover a win-rate target.

## Shared workflow

`docs/MUSE-CALIBRATION-HANDOFF.md`, `AGENT-LANES.md` and `ROADMAP.md` now name
the shared history, ownership and update path. Muse should fetch the shared
master/main tip and calibrate there, preserving local work. A wholesale port
or unrelated-history merge is unnecessary for this release. The five
unfinished joint favor jobs and favor-journal/deadline work remain open.

Steve approved the host-only scope repair in ChangePilot proposal
`01dfd195-de60-4ec6-9fa1-0335d74e89dd`. Its local backup/application receipt
and effective verification are under
`C:/Users/Steve/.codex/tmp/changepilot-repository-scope-20261020/`.
Effective configuration is verified in 46 moc-ai worktrees and three
excluded roots: 49 MCP checks, 230 trusted project-scoped handlers. Global
ChangePilot hooks and MCP are disabled; Oversight has no enabled handlers.
Credentials, unrelated integrations, sandbox and permission settings are
preserved. A fresh session is required to discard instructions already
injected into this conversation. This is host maintenance, not an Oversight
approval workflow. No host config or credentials are committed to this game.

Publication target: the same reconciled commit on origin/master, origin/main
and origin/codex/conversation-structure-20261020. This audit records pre-push
verification; confirm delivery from the actual remote refs and production
version.json. The release receipt is recorded after readback.
