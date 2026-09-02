(() => {
  const calendar = document.querySelector('[data-aa-calendar]');
  if(!calendar) return;

  // Calendar seed for the current September/October 2026 SWGOH cadence.
  // Dates are intentionally centralized here so the alliance can update them easily if CG shifts an event.
  // end dates are exclusive.
  const events = [
    {type:'conquest', title:'Conquest', start:'2026-08-31', end:'2026-09-14'},
    {type:'conquest', title:'Conquest', start:'2026-09-28', end:'2026-10-12'},
    {type:'conquest', title:'Conquest', start:'2026-10-26', end:'2026-11-09'},

    {type:'tb', title:'Territory Battle', start:'2026-08-31', end:'2026-09-07'},
    {type:'tb', title:'Territory Battle', start:'2026-09-14', end:'2026-09-21'},
    {type:'tb', title:'Territory Battle', start:'2026-09-28', end:'2026-10-05'},
    {type:'tb', title:'Territory Battle', start:'2026-10-12', end:'2026-10-19'},
    {type:'tb', title:'Territory Battle', start:'2026-10-26', end:'2026-11-02'},

    {type:'tw', title:'Territory War', start:'2026-09-07', end:'2026-09-10'},
    {type:'tw', title:'Territory War', start:'2026-09-11', end:'2026-09-14'},
    {type:'tw', title:'Territory War', start:'2026-09-21', end:'2026-09-24'},
    {type:'tw', title:'Territory War', start:'2026-09-25', end:'2026-09-28'},
    {type:'tw', title:'Territory War', start:'2026-10-05', end:'2026-10-08'},
    {type:'tw', title:'Territory War', start:'2026-10-09', end:'2026-10-12'},
    {type:'tw', title:'Territory War', start:'2026-10-19', end:'2026-10-22'},
    {type:'tw', title:'Territory War', start:'2026-10-23', end:'2026-10-26'}
  ];

  let view = new Date(2026, 8, 1);
  const title = calendar.querySelector('[data-calendar-title]');
  const days = calendar.querySelector('[data-calendar-days]');
  const upcoming = document.querySelector('[data-calendar-upcoming]');

  calendar.querySelector('[data-cal-prev]').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()-1, 1); render(); });
  calendar.querySelector('[data-cal-next]').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()+1, 1); render(); });
  const reset = calendar.querySelector('[data-cal-current]');
  if(reset) reset.addEventListener('click', () => { view = new Date(2026, 8, 1); render(); });

  function localDate(iso){ const [y,m,d] = iso.split('-').map(Number); return new Date(y,m-1,d); }
  function isoDate(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function inEvent(d,e){ return d >= localDate(e.start) && d < localDate(e.end); }
  function formatRange(e){
    const s=localDate(e.start), end=localDate(e.end); end.setDate(end.getDate()-1);
    const opts={month:'short',day:'numeric'};
    return `${s.toLocaleDateString('en-US',opts)}–${end.toLocaleDateString('en-US',opts)}`;
  }

  function render(){
    const y=view.getFullYear(), m=view.getMonth();
    title.textContent = view.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    const first = new Date(y,m,1);
    const start = new Date(y,m,1-first.getDay());
    const todayIso = '2026-09-02';
    const cells=[];
    for(let i=0;i<42;i++){
      const d=new Date(start); d.setDate(start.getDate()+i);
      const iso=isoDate(d);
      const hits=events.filter(e=>inEvent(d,e));
      const classes=['aa-day'];
      if(d.getMonth()!==m) classes.push('outside');
      if(iso===todayIso) classes.push('today');
      cells.push(`<div class="${classes.join(' ')}" aria-label="${d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}"><div class="aa-day-num">${d.getDate()}</div>${hits.map(e=>`<span class="aa-event ${e.type}" title="${e.title} • ${formatRange(e)}">${e.type==='tb'?'TB':e.type==='tw'?'TW':'Conquest'}</span>`).join('')}</div>`);
    }
    days.innerHTML=cells.join('');

    if(upcoming){
      const monthStart=new Date(y,m,1), monthEnd=new Date(y,m+1,1);
      const monthEvents=events.filter(e=>localDate(e.end)>monthStart && localDate(e.start)<monthEnd)
        .sort((a,b)=>localDate(a.start)-localDate(b.start));
      upcoming.innerHTML=monthEvents.map(e=>`<div class="aa-upcoming-item"><strong>${e.title}</strong><span>${formatRange(e)}</span></div>`).join('') || '<div class="aa-upcoming-item"><strong>No events entered</strong><span>Add dates in assets/animated-academy.js.</span></div>';
    }
  }
  render();
})();
