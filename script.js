const STORAGE_KEY = "todo-tasks";
const THEME_KEY = "todo-theme";

const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#list");
const empty = document.querySelector("#empty");
const count = document.querySelector("#count");
const themeToggle = document.querySelector("#theme-toggle");

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeToggle.textContent = dark ? "Light" : "Dark";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute(
    "aria-label",
    dark ? "Switch to light mode" : "Switch to dark mode"
  );
}

applyTheme(document.documentElement.dataset.theme || systemTheme());

themeToggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.done === "boolean"
    );
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function remainingCount() {
  return tasks.filter((task) => !task.done).length;
}

function render() {
  list.replaceChildren();

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = task.done ? "item done" : "item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" complete`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete "${task.text}"`);
    remove.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, text, remove);
    list.append(item);
  }

  const left = remainingCount();
  count.textContent = left === 1 ? "1 left" : `${left} left`;
  empty.hidden = tasks.length > 0;
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  tasks.push({
    id: crypto.randomUUID(),
    text: trimmed,
    done: false,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((item) => item.id !== id);
  saveTasks();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(input.value);
  form.reset();
  input.focus();
});

render();
