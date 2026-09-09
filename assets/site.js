
(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if(navToggle && nav){
    nav.id = 'primary-nav';
    navToggle.setAttribute('aria-controls', nav.id);
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape'){ nav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); } });
  }

  const page = document.body.dataset.page;
  document.querySelectorAll('.site-nav a[data-page]').forEach(a => {
    if(a.dataset.page === page) { a.classList.add('active'); a.setAttribute('aria-current','page'); }
  });

  document.querySelectorAll('[data-filter-input]').forEach(input => {
    const selector = input.dataset.filterInput;
    const items = [...document.querySelectorAll(selector)];
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      items.forEach(el => {
        const hay = (el.dataset.search || el.innerText).toLowerCase();
        el.classList.toggle('hidden-by-search', q && !hay.includes(q));
      });
    });
  });

  document.querySelectorAll('[data-checklist]').forEach(list => {
    const key = 'galoris-'+list.dataset.checklist;
    const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e){}
    boxes.forEach((box, idx) => {
      box.checked = !!saved[idx];
      box.addEventListener('change', () => {
        saved[idx] = box.checked;
        localStorage.setItem(key, JSON.stringify(saved));
      });
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      if(nav) nav.classList.remove('open');
      if(navToggle) navToggle.setAttribute('aria-expanded','false');
    });
  });
})();
