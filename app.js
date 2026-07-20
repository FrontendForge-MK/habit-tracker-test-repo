const storageKey = "habit-tracker.habits";
const lastActivityDayKey = "habit-tracker.last-activity-day";
const themeStorageKey = "habit-tracker.theme";

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
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll("[data-filter]");
const emptyStateTitle = document.querySelector("#empty-state-title");
const emptyStateCopy = document.querySelector("#empty-state-copy");

let activeFilter = "all";

const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem(themeStorageKey);
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
  } catch {
    return null;
  }
}

function getActiveTheme() {
  return document.documentElement.dataset.theme ??
    (prefersDarkTheme.matches ? "dark" : "light");
}

function updateThemeToggle() {
  const activeTheme = getActiveTheme();
  const nextTheme = activeTheme === "dark" ? "light" : "dark";
  const nextThemeName = nextTheme === "dark" ? "ciemny" : "jasny";

  themeToggle.textContent = `${nextThemeName[0].toUpperCase()}${nextThemeName.slice(1)} motyw`;
  themeToggle.setAttribute("aria-label", `Włącz ${nextThemeName} motyw`);
  themeToggle.setAttribute("aria-pressed", String(activeTheme === "dark"));
}

function saveTheme(theme) {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // The selected theme remains active for this session.
  }

  updateThemeToggle();
}

themeToggle.addEventListener("click", () => {
  saveTheme(getActiveTheme() === "dark" ? "light" : "dark");
});

prefersDarkTheme.addEventListener("change", () => {
  if (!getSavedTheme()) {
    updateThemeToggle();
  }
});

updateThemeToggle();

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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

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

function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);

  saveHabits();
  render();
}

function resetCompletedHabits() {
  habits = habits.map((habit) => ({ ...habit, completed: false }));

  saveHabits();
  render();
}

function getFilteredHabits() {
  if (activeFilter === "active") {
    return habits.filter((habit) => !habit.completed);
  }

  if (activeFilter === "completed") {
    return habits.filter((habit) => habit.completed);
  }

  return habits;
}

function render() {
  list.replaceChildren();

  const filteredHabits = getFilteredHabits();

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
  });

  filteredHabits.forEach((habit) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input");

    item.querySelector(".habit-title").textContent = habit.title;
    checkbox.checked = habit.completed;
    checkbox.setAttribute("aria-label", `Oznacz nawyk „${habit.title}” jako wykonany`);
    checkbox.addEventListener("change", () => toggleHabit(habit.id));
    const deleteButton = item.querySelector(".delete-button");
    deleteButton.setAttribute("aria-label", `Usuń nawyk ${habit.title}`);
    deleteButton.addEventListener("click", () => deleteHabit(habit.id));
    list.append(item);
  });

  const completedCount = habits.filter((habit) => habit.completed).length;
  const progress = habits.length === 0 ? 0 : (completedCount / habits.length) * 100;

  emptyState.hidden = filteredHabits.length > 0;
  emptyStateTitle.textContent = habits.length === 0
    ? "Nie masz jeszcze żadnych nawyków."
    : "Brak nawyków w tym widoku.";
  emptyStateCopy.textContent = habits.length === 0
    ? "Dodaj pierwszy powyżej."
    : "Wybierz inny filtr lub oznacz nawyk jako wykonany.";
  resetButton.disabled = completedCount === 0;
  progressLabel.textContent = `${completedCount} z ${habits.length}`;
  progressValue.style.width = `${progress}%`;
}

render();
