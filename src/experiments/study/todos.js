const STORAGE_KEY = 'vishwa-study-todos';

export function readTasks(storage) {
  const saved = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
  if (!Array.isArray(saved)) throw new Error('Invalid task list');
  return saved.filter(task => task && typeof task.text === 'string' && task.text.trim())
    .map(task => ({ text: task.text.trim().slice(0, 300), done: task.done === true }));
}

export function saveTasks(storage, tasks) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function initTodos(root) {
  const form = root.querySelector('form');
  const input = root.querySelector('#todo-input');
  const list = root.querySelector('.todo-list');
  const status = root.querySelector('.todo-status');
  const count = root.querySelector('.todo-count');
  const clear = root.querySelector('.todo-clear');
  let tasks = [];
  try { tasks = readTasks(localStorage); }
  catch { status.textContent = 'Saved tasks could not be loaded. You can still make a list for this visit.'; }

  function persist() {
    try {
      saveTasks(localStorage, tasks);
      status.textContent = 'Saved in this browser on this device.';
    } catch {
      status.textContent = 'Tasks work for this visit, but this browser could not save them.';
    }
  }

  function render() {
    list.replaceChildren();
    const completed = tasks.filter(task => task.done).length;
    count.textContent = `${completed} of ${tasks.length} complete`;
    clear.disabled = completed === 0;
    root.querySelector('.todo-empty').hidden = tasks.length > 0;
    tasks.forEach((task, index) => {
      const row = document.createElement('li');
      row.className = 'todo-item';
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      const text = document.createElement('span');
      text.textContent = task.text;
      label.append(checkbox, text);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Delete task: ${task.text}`);
      checkbox.addEventListener('change', () => {
        task.done = checkbox.checked;
        persist();
        count.textContent = `${tasks.filter(item => item.done).length} of ${tasks.length} complete`;
        clear.disabled = !tasks.some(item => item.done);
      });
      remove.addEventListener('click', () => {
        tasks.splice(index, 1);
        persist();
        render();
        const next = list.children[Math.min(index, tasks.length - 1)];
        (next?.querySelector('button') || input).focus();
      });
      row.append(label, remove);
      list.append(row);
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    tasks.push({ text: text.slice(0, 300), done: false });
    input.value = '';
    persist();
    render();
    input.focus();
  });
  clear.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.done);
    persist();
    render();
    input.focus();
  });
  render();
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('#study-todos');
  if (root) initTodos(root);
}
