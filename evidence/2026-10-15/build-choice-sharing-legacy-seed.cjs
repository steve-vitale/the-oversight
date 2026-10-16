// Forensic preload for existing legacy tests; not a replacement game harness.
let state=Number(process.env.OVERSIGHT_LEGACY_PROBE_SEED)>>>0;
Math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
