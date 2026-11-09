# OVE-97 — Dialog residual sampler on tip through #73

**Verdict:** `DIALOG_TIP_SAMPLER_NEW_RESIDUAL`  
**Tip:** `29fbbfab67cc` (PR #73 head). Kickoff local `7a30ef99b` not on this checkout.

Store result (source of truth): Project docs `ove-97-dialog-tip-sampler-result.md`.  
Raw audit/review: Project `internal/ove-97-dialog-tip-sampler/`.

## Proofs (#1–#7)

All GREEN on tip: favor-debt Help, snippet stage-direction (unit shapes), curious stale opener, live-thread engage dry, voice-question decoration, recap hammer, resume Teach ownership. Story-offer Yes also GREEN.

## Natural band

`conversation-audit.js --seeds 1,7,42,99 --stages 0,30` → 8 worlds / 78 convos / 638 turns.  
Mechanical self-compare: 0 unknown / word-mismatch / focus leak; 2 formal-question mismatches (prior class).

## Residual

#2 leftovers on unfinished resume openers (Nino tired-smile hybrid, Jesse teach-diegesis+dialogue, Luke “Like I said — still on…”, Toan “A breath”). Cause: `convoSnippetIsStageDirection` early-outs on any embedded `"`, then quote hygiene strips quotes. Smallest fix + Muse-adjacent dry/yn/voice findings recorded in the store result — no Muse `conversation.js` edit in this evidence commit.
