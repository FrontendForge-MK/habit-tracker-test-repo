const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getLocalDayKey,
  isLocalDayKey,
  prepareHabitsForToday,
} = require("../date-utils.js");

const habits = [
  { id: "water", title: "Woda", completed: true },
  { id: "walk", title: "Spacer", completed: false },
];

test("creates a stable local-day key", () => {
  assert.equal(getLocalDayKey(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
});

test("recognizes only real local-day keys", () => {
  assert.equal(isLocalDayKey("2026-02-28"), true);
  assert.equal(isLocalDayKey("2026-02-29"), false);
  assert.equal(isLocalDayKey("2026-2-28"), false);
  assert.equal(isLocalDayKey("not-a-date"), false);
  assert.equal(isLocalDayKey(null), false);
});

test("keeps progress when reopened on the same local day", () => {
  const result = prepareHabitsForToday(habits, "2026-07-15", new Date(2026, 6, 15));

  assert.equal(result.needsReset, false);
  assert.equal(result.todayKey, "2026-07-15");
  assert.equal(result.habits, habits);
});

test("resets only completed fields on the next local day", () => {
  const result = prepareHabitsForToday(habits, "2026-07-14", new Date(2026, 6, 15));

  assert.equal(result.needsReset, true);
  assert.equal(result.todayKey, "2026-07-15");
  assert.deepEqual(result.habits, [
    { id: "water", title: "Woda", completed: false },
    { id: "walk", title: "Spacer", completed: false },
  ]);
});

test("resets safely when the saved day key is missing or invalid", () => {
  for (const savedDayKey of [null, "2026-99-40", "yesterday"]) {
    const result = prepareHabitsForToday(habits, savedDayKey, new Date(2026, 6, 15));

    assert.equal(result.needsReset, true);
    assert.equal(result.habits[0].completed, false);
  }
});
