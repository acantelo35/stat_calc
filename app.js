(function(){
  const schools = RANKINGS_DATA.schools;
  const overall = RANKINGS_DATA.overall;

  const bySchool = {};
  schools.forEach(s => bySchool[s.school] = s);

  // ---------- Searchable combo dropdown ----------
  function setupCombo(inputEl, listEl, onSelect){
    let filtered = schools;
    let activeIndex = -1;

    function render(items){
      filtered = items;
      activeIndex = -1;
      if(items.length === 0){
        listEl.innerHTML = '<div class="combo-empty">No matches</div>';
      } else {
        listEl.innerHTML = items.slice(0, 60).map((s,i) =>
          `<div class="combo-item" data-idx="${i}">
             <span>${s.school}</span>
             <span class="ci-conf">${s.conference}</span>
           </div>`
        ).join('');
      }
      listEl.classList.add('open');
    }

    function open(){
      const q = inputEl.value.trim().toLowerCase();
      const items = q === '' ? schools : schools.filter(s => s.school.toLowerCase().includes(q));
      render(items);
    }

    inputEl.addEventListener('focus', open);
    inputEl.addEventListener('input', open);

    inputEl.addEventListener('keydown', (e) => {
      const items = listEl.querySelectorAll('.combo-item');
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        items.forEach(it => it.classList.remove('active'));
        if(items[activeIndex]) items[activeIndex].classList.add('active');
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        items.forEach(it => it.classList.remove('active'));
        if(items[activeIndex]) items[activeIndex].classList.add('active');
      } else if(e.key === 'Enter'){
        e.preventDefault();
        if(activeIndex >= 0 && filtered[activeIndex]){
          select(filtered[activeIndex]);
        } else if(filtered.length === 1){
          select(filtered[0]);
        }
      } else if(e.key === 'Escape'){
        listEl.classList.remove('open');
      }
    });

    listEl.addEventListener('click', (e) => {
      const item = e.target.closest('.combo-item');
      if(!item) return;
      const idx = parseInt(item.dataset.idx, 10);
      select(filtered[idx]);
    });

    document.addEventListener('click', (e) => {
      if(!inputEl.contains(e.target) && !listEl.contains(e.target)){
        listEl.classList.remove('open');
      }
    });

    function select(school){
      inputEl.value = school.school;
      listEl.classList.remove('open');
      onSelect(school);
    }
  }

  let originSchool = null;
  let destSchool = null;

  setupCombo(
    document.getElementById('origin-input'),
    document.getElementById('origin-list'),
    (s) => { originSchool = s; updateReadout('origin', s); }
  );
  setupCombo(
    document.getElementById('dest-input'),
    document.getElementById('dest-list'),
    (s) => { destSchool = s; updateReadout('dest', s); }
  );

  function updateReadout(prefix, s){
    document.getElementById(prefix + '-conf').textContent = s.conference;
    document.getElementById(prefix + '-ucr').textContent = s.ucr.toFixed(4);
    document.getElementById(prefix + '-pf').textContent = s.pf.toFixed(2);
  }

  // ---------- Stat type toggle ----------
  let statType = 'rate';
  const btnRate = document.getElementById('btn-rate');
  const btnCounting = document.getElementById('btn-counting');
  const statNameLabel = document.getElementById('stat-name-label');
  const outExpectedLabel = document.getElementById('out-expected-label');
  const outExpectedFormula = document.getElementById('out-expected-formula');

  btnRate.addEventListener('click', () => setStatType('rate'));
  btnCounting.addEventListener('click', () => setStatType('counting'));

  function setStatType(type){
    statType = type;
    btnRate.classList.toggle('active', type === 'rate');
    btnCounting.classList.toggle('active', type === 'counting');
    if(type === 'rate'){
      statNameLabel.textContent = 'Current ERA';
      outExpectedLabel.textContent = 'Expected ERA';
      outExpectedFormula.textContent = 'current ERA × (UCR_new / UCR_old) × (PF_new / PF_old)';
      document.getElementById('stat-value').placeholder = 'e.g. 3.85';
    } else {
      statNameLabel.textContent = 'Current counting stat (HR, K, IP…)';
      outExpectedLabel.textContent = 'Expected stat';
      outExpectedFormula.textContent = 'current stat × (UCR_old / UCR_new) × (PF_new / PF_old)';
      document.getElementById('stat-value').placeholder = 'e.g. 12';
    }
  }

  // ---------- Calculate ----------
  document.getElementById('calc-btn').addEventListener('click', () => {
    const outCtr = document.getElementById('out-ctr');
    const outPr = document.getElementById('out-pr');
    const outExpected = document.getElementById('out-expected');

    if(!originSchool || !destSchool){
      alert('Pick both an origin and a destination school first.');
      return;
    }
    const valRaw = document.getElementById('stat-value').value;
    const val = parseFloat(valRaw);
    if(valRaw === '' || isNaN(val)){
      alert('Enter a current stat value.');
      return;
    }

    const ucrOld = originSchool.ucr;
    const ucrNew = destSchool.ucr;
    const pfOld = originSchool.pf;
    const pfNew = destSchool.pf;

    const ctr = ucrOld / ucrNew;
    const pr = pfNew / pfOld;

    let expected;
    if(statType === 'rate'){
      expected = val * (ucrNew / ucrOld) * (pfNew / pfOld);
    } else {
      expected = val * (ucrOld / ucrNew) * (pfNew / pfOld);
    }

    outCtr.textContent = ctr.toFixed(4);
    outPr.textContent = pr.toFixed(4);
    outExpected.textContent = expected.toFixed(3);
  });

  // ---------- Rankings table ----------
  const rankingsTbody = document.getElementById('rankings-tbody');
  let rankingsSort = { key: 'rank', dir: 1 };

  function renderRankings(){
    const rows = [...overall].sort((a,b) => {
      const v = a[rankingsSort.key], w = b[rankingsSort.key];
      if(typeof v === 'string') return v.localeCompare(w) * rankingsSort.dir;
      return (v - w) * rankingsSort.dir;
    });
    rankingsTbody.innerHTML = rows.map(r => `
      <tr>
        <td class="rank-cell">${r.rank}</td>
        <td>${r.conference}</td>
        <td>${(r.win_pct*100).toFixed(1)}%</td>
        <td>${r.sos_rank}</td>
        <td>${r.norm_sos.toFixed(3)}</td>
        <td>${r.ucr.toFixed(4)}</td>
      </tr>
    `).join('');
  }
  document.querySelectorAll('#rankings-table thead th').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      rankingsSort.dir = (rankingsSort.key === key) ? -rankingsSort.dir : 1;
      rankingsSort.key = key;
      renderRankings();
    });
  });
  renderRankings();

  // ---------- Parks table ----------
  const parksTbody = document.getElementById('parks-tbody');
  const parkSearch = document.getElementById('park-search');
  let parksSort = { key: 'school', dir: 1 };

  function renderParks(){
    const q = parkSearch.value.trim().toLowerCase();
    let rows = schools;
    if(q){
      rows = rows.filter(s =>
        s.school.toLowerCase().includes(q) ||
        s.conference.toLowerCase().includes(q) ||
        (s.citystate || '').toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a,b) => {
      const v = a[parksSort.key], w = b[parksSort.key];
      if(typeof v === 'string') return v.localeCompare(w) * parksSort.dir;
      return (v - w) * parksSort.dir;
    });
    parksTbody.innerHTML = rows.map(s => `
      <tr>
        <td>${s.school}</td>
        <td>${s.conference}</td>
        <td>${s.citystate || ''}</td>
        <td>${s.pf.toFixed(2)}</td>
        <td>${s.pf3.toFixed(2)}</td>
        <td>${s.pf6.toFixed(2)}</td>
      </tr>
    `).join('');
  }
  document.querySelectorAll('#parks-table thead th').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      parksSort.dir = (parksSort.key === key) ? -parksSort.dir : 1;
      parksSort.key = key;
      renderParks();
    });
  });
  parkSearch.addEventListener('input', renderParks);
  renderParks();

})();
