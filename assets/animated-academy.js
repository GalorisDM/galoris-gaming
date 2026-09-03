(() => {
  const calendar = document.querySelector('[data-aa-calendar]');
  if(!calendar) return;

  // Alliance planning calendar.
  // Conquest follows the long-running 14-days-on / 14-days-off cadence.
  // TB/TW dates after the currently observed 2026 cadence are planning projections, not guarantees.
  // Always confirm last-minute schedule changes in-game or in Discord.
  const events = [];
  const addDays = (iso, n) => { const [y,m,d]=iso.split('-').map(Number); const x=new Date(y,m-1,d); x.setDate(x.getDate()+n); return isoDate(x); };

  // Conquest anchor: Mar 16, 2026; repeat every 28 days, active for 14 days.
  let conquestStart = new Date(2026, 0, 19);
  const calendarEnd = new Date(2027, 6, 1);
  while(conquestStart < calendarEnd){
    events.push({type:'conquest', title:'Conquest', start:isoDate(conquestStart), end:isoDate(new Date(conquestStart.getFullYear(), conquestStart.getMonth(), conquestStart.getDate()+14)), projected: conquestStart >= new Date(2026,8,28)});
    conquestStart = new Date(conquestStart.getFullYear(), conquestStart.getMonth(), conquestStart.getDate()+28);
  }

  // TB anchor: Jan 5, 2026; one week every 14 days. Two TW windows fill the off-week cadence.
  let tbStart = new Date(2026, 0, 5);
  while(tbStart < calendarEnd){
    const tbEnd = new Date(tbStart.getFullYear(), tbStart.getMonth(), tbStart.getDate()+7);
    const tw1End = new Date(tbEnd.getFullYear(), tbEnd.getMonth(), tbEnd.getDate()+3);
    const tw2Start = new Date(tbEnd.getFullYear(), tbEnd.getMonth(), tbEnd.getDate()+4);
    const nextTb = new Date(tbStart.getFullYear(), tbStart.getMonth(), tbStart.getDate()+14);
    const projected = tbStart >= new Date(2026,10,2);
    events.push({type:'tb', title:'Territory Battle', start:isoDate(tbStart), end:isoDate(tbEnd), projected});
    events.push({type:'tw', title:'Territory War', start:isoDate(tbEnd), end:isoDate(tw1End), projected});
    events.push({type:'tw', title:'Territory War', start:isoDate(tw2Start), end:isoDate(nextTb), projected});
    tbStart = nextTb;
  }

  const now = new Date();
  let view = new Date(now.getFullYear(), now.getMonth(), 1);
  if(view < new Date(2026,0,1) || view > new Date(2027,5,1)) view = new Date(2026,8,1);
  const title = calendar.querySelector('[data-calendar-title]');
  const days = calendar.querySelector('[data-calendar-days]');
  const upcoming = document.querySelector('[data-calendar-upcoming]');

  calendar.querySelector('[data-cal-prev]').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()-1, 1); render(); });
  calendar.querySelector('[data-cal-next]').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()+1, 1); render(); });
  const reset = calendar.querySelector('[data-cal-current]');
  if(reset){
    reset.textContent = 'Today';
    reset.addEventListener('click', () => { view = new Date(now.getFullYear(), now.getMonth(), 1); render(); });
  }

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
    const todayIso = isoDate(now);
    const cells=[];
    for(let i=0;i<42;i++){
      const d=new Date(start); d.setDate(start.getDate()+i);
      const iso=isoDate(d);
      const hits=events.filter(e=>inEvent(d,e));
      const classes=['aa-day'];
      if(d.getMonth()!==m) classes.push('outside');
      if(iso===todayIso) classes.push('today');
      cells.push(`<div class="${classes.join(' ')}" aria-label="${d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}"><div class="aa-day-num">${d.getDate()}</div>${hits.map(e=>`<span class="aa-event ${e.type}${e.projected?' projected':''}" title="${e.title} • ${formatRange(e)}${e.projected?' • projected':''}">${e.type==='tb'?'TB':e.type==='tw'?'TW':'Conquest'}${e.projected?'*':''}</span>`).join('')}</div>`);
    }
    days.innerHTML=cells.join('');

    if(upcoming){
      const monthStart=new Date(y,m,1), monthEnd=new Date(y,m+1,1);
      const monthEvents=events.filter(e=>localDate(e.end)>monthStart && localDate(e.start)<monthEnd)
        .sort((a,b)=>localDate(a.start)-localDate(b.start));
      upcoming.innerHTML=monthEvents.map(e=>`<div class="aa-upcoming-item"><strong>${e.title}${e.projected?' *':''}</strong><span>${formatRange(e)}${e.projected?' • projected':''}</span></div>`).join('') || '<div class="aa-upcoming-item"><strong>No events entered</strong><span>No event dates are loaded for this month.</span></div>';
    }
  }
  render();
})();
