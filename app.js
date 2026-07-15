const storageKey = "habit-tracker.habits";

const form = document.querySelector("#habit-form");
const nameInput = document.querySelector("#habit-name");
const formError = document.querySelector("#form-error");
const list = document.querySelector("#habit-list");
const emptyState = document.querySelector("#empty-state");
const template = document.querySelector("#habit-template");
const progressLabel = document.querySelector("#progress-label");
const progressValue = document.querySelector("#progress-value");
const todayLabel = document.querySelector("#today-label");
const resetDayButton = document.querySelector("#reset-day");

let habits = loadHabits();

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
}

function toggleHabit(id) {
  habits = habits.map((habit) =>
    habit.id === id ? { ...habit, completed: !habit.completed } : habit,
  );

  saveHabits();
  render();
}

function resetDay() {
  habits = habits.map((habit) => ({ ...habit, completed: false }));

  saveHabits();
  render();
}

resetDayButton.addEventListener("click", resetDay);

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
  progressLabel.textContent = `${completedCount} z ${habits.length}`;
  progressValue.style.width = `${progress}%`;
  resetDayButton.disabled = completedCount === 0;
}

render();
