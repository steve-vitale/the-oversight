'use strict';
// Each child uses the shared seeded Game and real barrier/Save/Continue paths.
Promise.resolve(require('../../evidence/2026-10-21/barrier-settlement-proof-r1.cjs').run()).catch(e=>{console.error(e.stack);process.exitCode=1;});
