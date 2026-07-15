(function attachHabitDateUtils(globalScope) {
  function getLocalDayKey(date = new Date()) {
    if (
      Object.prototype.toString.call(date) !== "[object Date]" ||
      Number.isNaN(date.getTime())
    ) {
      throw new TypeError("Expected a valid Date instance.");
    }

    const year = String(date.getFullYear()).padStart(4, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function isLocalDayKey(value) {
    if (typeof value !== "string") {
      return false;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      return false;
    }

    const [, year, month, day] = match.map(Number);
    const candidate = new Date(0);
    candidate.setHours(0, 0, 0, 0);
    candidate.setFullYear(year, month - 1, day);

    return (
      candidate.getFullYear() === year &&
      candidate.getMonth() === month - 1 &&
      candidate.getDate() === day
    );
  }

  function prepareHabitsForToday(habits, savedDayKey, now = new Date()) {
    const todayKey = getLocalDayKey(now);
    const needsReset = !isLocalDayKey(savedDayKey) || savedDayKey !== todayKey;

    return {
      habits: needsReset
        ? habits.map((habit) => ({ ...habit, completed: false }))
        : habits,
      todayKey,
      needsReset,
    };
  }

  const api = { getLocalDayKey, isLocalDayKey, prepareHabitsForToday };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.habitDateUtils = api;
})(globalThis);
