const storageKey = "habit-tracker.habits";
const lastActivityDayKey = "habit-tracker.last-activity-day";

const form = document.querySelector("#habit-form");
const nameInput = document.querySelector("#habit-name");
const formError = document.querySelector("#form-error");
const list = document.querySelector("#habit-list");
const emptyState = document.querySelector("#empty-state");
const template = document.querySelector("#habit-template");
const progressLabel = document.querySelector("#progress-label");
const progressValue = document.querySelector("#progress-value");
const todayLabel = document.querySelector("#today-label");
const resetButton = document.querySelector("#reset-button");

let habits = loadHabits();
const dailyHabits = habitDateUtils.prepareHabitsForToday(
  habits,
  loadLastActivityDay(),
);

habits = dailyHabits.habits;

if (dailyHabits.needsReset) {
  saveHabits();
}

todayLabel.textContent = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = nameInput.value.trim();

  if (!title) {
    formError.textContent = "Wpisz nazwę nawyku.";
    nameInput.focus();
    return;
  }

  habits.push({
    id: crypto.randomUUID(),
    title,
    completed: false,
  });

  saveHabits();
  render();
  form.reset();
  formError.textContent = "";
  nameInput.focus();
});

resetButton.addEventListener("click", resetCompletedHabits);

function loadHabits() {
  try {
    const savedHabits = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(savedHabits) ? savedHabits : [];
  } catch {
    return [];
  }
}

function saveHabits() {
  localStorage.setItem(storageKey, JSON.stringify(habits));
  localStorage.setItem(lastActivityDayKey, habitDateUtils.getLocalDayKey());
}

function loadLastActivityDay() {
  try {
    return localStorage.getItem(lastActivityDayKey);
  } catch {
    return null;
  }
}

function toggleHabit(id) {
  habits = habits.map((habit) =>
    habit.id === id ? { ...habit, completed: !habit.completed } : habit,
  );

  saveHabits();
  render();
}

function resetCompletedHabits() {
  habits = habits.map((habit) => ({ ...habit, completed: false }));

  saveHabits();
  render();
}

function render() {
  list.replaceChildren();

  habits.forEach((habit) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");

    item.querySelector(".habit-title").textContent = habit.title;
    checkbox.checked = habit.completed;
    checkbox.setAttribute("aria-label", `Oznacz nawyk „${habit.title}” jako wykonany`);
    checkbox.addEventListener("change", () => toggleHabit(habit.id));
    list.append(item);
  });

  const completedCount = habits.filter((habit) => habit.completed).length;
  const progress = habits.length === 0 ? 0 : (completedCount / habits.length) * 100;

  emptyState.hidden = habits.length > 0;
  resetButton.disabled = completedCount === 0;
  progressLabel.textContent = `${completedCount} z ${habits.length}`;
  progressValue.style.width = `${progress}%`;
}

render();
