const assert = require("assert");
const { calculateWh, recommendChargerWatts } = require("./app.js");

// 1. 20000mAh @ 3.7V = 74Wh -> ok
const r1 = calculateWh(20000, 3.7);
assert.strictEqual(r1.wh, 74);
assert.strictEqual(r1.status, "ok");

// 2. 30000mAh @ 3.7V = 111Wh -> approval
const r2 = calculateWh(30000, 3.7);
assert.strictEqual(r2.wh, 111);
assert.strictEqual(r2.status, "approval");

// 3. 50000mAh @ 3.7V = 185Wh -> banned
const r3 = calculateWh(50000, 3.7);
assert.strictEqual(r3.wh, 185);
assert.strictEqual(r3.status, "banned");

// 4. Charger: phone (25W) + ultrabook (65W) = 90W -> 100W 3C1A
const c1 = recommendChargerWatts(["phone", "ultrabook"]);
assert.strictEqual(c1.totalWatts, 90);
assert(c1.recommendedTier.includes("100W"));

console.log("ALL_TRAVEL_POWER_TESTS_PASSED");
