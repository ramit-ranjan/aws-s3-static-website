// ============================================================
//  Taskly — app.js
//  Features: add, complete, delete, filter, persist to localStorage
// ============================================================

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────
  const STORAGE_KEY = 'taskly_tasks';
  let tasks = loadTasks();
  let currentFilter = 'all';

  // ── DOM refs ─────────────────────────────────────────────
  const taskInput        = document.getElementById('taskInput');
  const categorySelect   = document.getElementById('categorySelect');
  const addBtn           = document.getElementById('addBtn');
  const taskList         = document.getElementById('taskList');
  const emptyState       = document.getElementById('emptyState');
  const statsText        = document.getElementById('statsText');
  const progressCircle   = document.getElementById('progressCircle');
  const progressLabel    = document.getElementById('progressLabel');
  const clearCompleted   = document.getElementById('clearCompletedBtn');
  const filterBtns       = document.querySelectorAll('.filter-btn');

  // ── Initialise ───────────────────────────────────────────
  render();
  bindEvents();

  // ── Events ───────────────────────────────────────────────
  function bindEvents() {
    addBtn.addEventListener('click', handleAdd);
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

    clearCompleted.addEventListener('click', () => {
      tasks = tasks.filter((t) => !t.done);
      saveTasks();
      render();
    });

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }

  // ── Add Task ─────────────────────────────────────────────
  function handleAdd() {
    const text = taskInput.value.trim();
    if (!text) {
      taskInput.focus();
      taskInput.classList.add('shake');
      setTimeout(() => taskInput.classList.remove('shake'), 400);
      return;
    }

    const task = {
      id:       Date.now(),
      text:     text,
      category: categorySelect.value,
      done:     false,
      created:  new Date().toISOString(),
    };

    tasks.unshift(task);
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
    render();
  }

  // ── Toggle Done ──────────────────────────────────────────
  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.done = !task.done;
      saveTasks();
      render();
    }
  }

  // ── Delete Task ──────────────────────────────────────────
  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  // ── Render ───────────────────────────────────────────────
  function render() {
    const filtered = getFiltered();

    taskList.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      filtered.forEach((task) => {
        taskList.appendChild(createTaskElement(task));
      });
    }

    updateStats();
    updateProgress();
  }

  function getFiltered() {
    switch (currentFilter) {
      case 'active':    return tasks.filter((t) => !t.done);
      case 'completed': return tasks.filter((t) => t.done);
      default:          return tasks;
    }
  }

  // ── Create Task Element ──────────────────────────────────
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'active' : 'done'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Content
    const content = document.createElement('div');
    content.className = 'task-content';

    const textEl = document.createElement('span');
    textEl.className = 'task-text';
    textEl.textContent = task.text;

    const catEl = document.createElement('span');
    catEl.className = `task-cat cat-${task.category}`;
    catEl.textContent = task.category;

    content.appendChild(textEl);
    content.appendChild(document.createElement('br'));
    content.appendChild(catEl);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.setAttribute('aria-label', `Delete "${task.text}"`);
    delBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`;
    delBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(delBtn);

    return li;
  }

  // ── Stats ────────────────────────────────────────────────
  function updateStats() {
    const total     = tasks.length;
    const done      = tasks.filter((t) => t.done).length;
    const remaining = total - done;

    if (total === 0) {
      statsText.textContent = 'No tasks yet — add one above!';
    } else {
      statsText.textContent =
        `${remaining} remaining · ${done} completed · ${total} total`;
    }
  }

  // ── Progress Ring ────────────────────────────────────────
  function updateProgress() {
    const total = tasks.length;
    const done  = tasks.filter((t) => t.done).length;
    const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
    const circ  = 2 * Math.PI * 32; // r=32 → ~201

    progressCircle.style.strokeDashoffset = circ - (circ * pct) / 100;
    progressLabel.textContent = `${pct}%`;
  }

  // ── Persist ──────────────────────────────────────────────
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('localStorage unavailable — tasks won\'t persist:', e);
    }
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

})();
