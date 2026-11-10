const { evaluate, TESTS } = require("./engine.js");
let fail = 0;
for (const [id, d, a, chk, exp] of TESTS) { const ok = chk(evaluate(a)); if (!ok) fail++; console.log((ok ? "PASS " : "FAIL ") + id + "  " + d + "  -> " + exp); }
console.log(`\n${TESTS.length - fail}/${TESTS.length} passed`); process.exit(fail ? 1 : 0);
