(() => {
  const search = document.querySelector('#app-search');
  const rows = [...document.querySelectorAll('.app-row')];
  const chips = [...document.querySelectorAll('.chip')];
  let category = 'all';
  const filter = () => {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    rows.forEach((row) => {
      const matchesText = !query || row.dataset.name.includes(query) || row.dataset.category.includes(query);
      const matchesCategory = category === 'all' || row.dataset.category === category;
      row.hidden = !(matchesText && matchesCategory);
      if (!row.hidden) visible++;
    });
    const empty = document.querySelector('#empty-state');
    if (empty) empty.style.display = visible ? 'none' : 'block';
  };
  search?.addEventListener('input', filter);
  chips.forEach((chip) => chip.addEventListener('click', () => {
    category = chip.dataset.category;
    chips.forEach((item) => item.classList.toggle('active', item === chip));
    filter();
  }));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && search) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; search.blur(); filter(); }
  });
  const params = new URLSearchParams(location.search);
  if (search && params.get('q')) { search.value = params.get('q'); filter(); }

  const odometer = document.querySelector('.odometer');
  if (odometer && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const target = Number(odometer.dataset.value || 0);
    const started = performance.now();
    const roll = (now) => {
      const progress = Math.min(1, (now - started) / 1100);
      const eased = 1 - Math.pow(1 - progress, 4);
      odometer.textContent = Math.floor(target * eased).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(roll);
    };
    requestAnimationFrame(roll);
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.08 }) : null;
  document.querySelectorAll('.reveal').forEach((el) => observer ? observer.observe(el) : el.classList.add('visible'));

  const waitlist = document.querySelector('#waitlist-form');
  waitlist?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = waitlist.querySelector('button');
    const note = document.querySelector('#waitlist-note');
    button.disabled = true; button.textContent = 'TRANSMITTING...';
    try {
      const response = await fetch('/api/waitlist', { method: 'POST', body: new FormData(waitlist) });
      const data = await response.json();
      note.textContent = data.message || data.error;
      if (response.ok) waitlist.reset();
    } catch { note.textContent = 'SIGNAL LOST. TRY AGAIN.'; }
    finally { button.disabled = false; button.textContent = 'JOIN QUEUE ↗'; }
  });

  const agentPrefixes = {
    claude: 'Use Claude Code in the current repository. Inspect the workspace first, choose sensible defaults without asking unnecessary questions, implement the complete app, run it, test the critical flows, and fix any failures.\n\n',
    codex: 'Work autonomously in the current workspace. Build the complete product described below, preserve existing work, use server-rendered defaults where practical, run checks and tests, and continue until the core flows work.\n\n',
    cursor: 'In Cursor Agent mode, inspect the repository and implement this request end to end. Create and edit the necessary files, run the app and its checks, resolve errors, and deliver a polished working result.\n\n',
  };
  document.querySelectorAll('.copy-button').forEach((button) => button.addEventListener('click', async () => {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(agentPrefixes[button.dataset.agent] + button.dataset.prompt);
      button.textContent = '✓ COPIED TO CLIPBOARD'; button.classList.add('copied');
    } catch { button.textContent = 'COPY FAILED. SELECT PROMPT'; }
    setTimeout(() => { button.textContent = original; button.classList.remove('copied'); }, 1800);
  }));

  const voteButton = document.querySelector('[data-vote]');
  voteButton?.addEventListener('click', async () => {
    voteButton.disabled = true;
    const note = document.querySelector('[data-vote-note]');
    try {
      const response = await fetch(`/api/vote/${voteButton.dataset.vote}`, { method: 'POST' });
      const data = await response.json();
      voteButton.querySelector('span').textContent = data.count;
      note.textContent = data.message;
      voteButton.classList.toggle('voted', data.added);
    } catch { note.textContent = 'The vote could not be saved. Please try again.'; }
    finally { voteButton.disabled = false; }
  });

  document.querySelector('[data-share]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const share = `https://x.com/intent/post?text=${encodeURIComponent(button.dataset.text)}&url=${encodeURIComponent(button.dataset.url)}`;
    window.open(share, '_blank', 'noopener,noreferrer,width=700,height=520');
  });
})();
