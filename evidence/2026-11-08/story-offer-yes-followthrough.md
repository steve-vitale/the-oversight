# Story-offer Yes follow-through (2026-11-08)

Branch based on PR #10 tip (`e4836747e`, stage-direction snippet guard) atop `origin/master` `816404356`. Does **not** reimplement `convoSnippetIsStageDirection` (owned by #10). Does **not** touch `convo-wants.js` (PR #9).

## Defect

prove-out-plan §1.4 / ROADMAP + tip sampler: resume invite “Want to hear where it left off?” → `gq:yn:yes` → `"I see."` with no unfinished-thread content (Owen seed 99 ≈ day 91).

## Fix (this PR only)

In `src/js/conversation.js`:

1. `convoResumeOpener` tags `resumeOffer` when the spoken invite asks to hear / pick up / keep the unfinished thread.
2. `startConvo` copies that onto the hanging `genericQ`.
3. `gq:yn:yes` with `resumeOffer` mirrors `alive:thread`: clear open ledger entry, deliver `convoThreadBeat`, else name-the-thread fallback — never GQ_ACK.

Stage-direction quote rejection remains PR #10.

## Proof

```
node scripts/test-story-offer-yes-20261108.js
```

Fails if Yes is empty or ack-shaped (`I see.` / `Thank you for telling me.`).

## Out of scope

Jesse seed 42 Columbus yn tone (OVE-11).