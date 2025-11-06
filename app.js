const cases = [
  {
    id: 1,
    name: 'مها العتيبي',
    diagnosis: 'سكري حمل مع ضغط مرتفع',
    age: '32 (10y marriage)',
    parityLine: 'P2 L2 CS',
    lmp: '12/07/2023',
    edd: '18/04/2024',
    diagnosisInfo: 'سكر تراكمي 6.8%، متابعة كل أسبوعين',
    important: 'مراقبة الضغط يوميًا + متابعة تغذية',
    labs: 'HbA1c 6.8 (12/2023) — FBS 102 (01/2024)',
    todo: 'جدولة زيارة تغذية، تنسيق مع طبيبة عيون'
  },
  {
    id: 2,
    name: 'سارة الشهري',
    diagnosis: 'اشتباه أنيميا نقص الحديد',
    age: '24 (virgin)',
    parityLine: 'P0 L0 —',
    lmp: '—',
    edd: '—',
    diagnosisInfo: 'هيموجلوبين 9.8، شكوى دوار متكرر',
    important: '',
    labs: 'CBC 9.8 (01/2024)',
    todo: 'إعادة تحليل بعد 4 أسابيع'
  },
  {
    id: 3,
    name: 'عائشة الغامدي',
    diagnosis: 'متابعة ما بعد ولادة طبيعية',
    age: '29 (6y marriage)',
    parityLine: 'P1 L1 NVD',
    lmp: '01/06/2023',
    edd: '08/03/2024',
    diagnosisInfo: 'جرح عجان ملتئم، رضاعة طبيعية كاملة',
    important: 'تشجيع الاستمرار في الرضاعة، راحة كافية',
    labs: 'CBC 11.5 (03/2024)',
    todo: 'حجز زيارة متابعة بعد أسبوعين'
  }
];

let editingCaseId = null;

const casesList = document.getElementById('cases-list');
const emptyState = document.getElementById('empty-state');
const toast = document.querySelector('.toast');
const slideOver = document.getElementById('case-form');
const slideForm = document.getElementById('case-form-element');
const modal = document.getElementById('case-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = modal.querySelector('.modal-content');
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.querySelector('.search-results');
const chatPanel = document.getElementById('chat-panel');
const printGrid = document.getElementById('print-grid');
const statusBadge = document.querySelector('.status-badge');

const micWrapper = document.querySelector('.textarea-wrapper');
const micButton = document.querySelector('[data-mic]');
const voiceStatus = document.querySelector('.voice-status');
const dictationComplete = document.getElementById('dictation-complete');
const clearDetails = document.getElementById('clear-details');
const manualEdit = document.getElementById('manual-edit');

const emptyPrintSlot = () => ({
  name: '—',
  age: '—',
  parityLine: '—',
  lmp: '—',
  edd: '—',
  diagnosis: '—',
  diagnosisInfo: '',
  important: '',
  labs: '',
  todo: ''
});

function renderCases() {
  casesList.innerHTML = '';
  if (!cases.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  const orderedCases = [...cases].reverse();
  orderedCases.forEach((caseItem) => {
    const card = document.createElement('article');
    card.className = 'case-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div>
        <h3>${caseItem.name}</h3>
        <div class="case-diagnosis">${caseItem.diagnosis}</div>
      </div>
      <div class="card-actions" aria-label="إجراءات الحالة">
        <button class="icon-btn" data-edit="${caseItem.id}" aria-label="تعديل">
          <span class="material-symbols-rounded">edit</span>
        </button>
        <button class="icon-btn" data-delete="${caseItem.id}" aria-label="حذف">
          <span class="material-symbols-rounded">delete</span>
        </button>
      </div>
    `;
    card.addEventListener('click', (event) => {
      const target = event.target.closest('button');
      if (target) return;
      openCaseModal(caseItem);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        openCaseModal(caseItem);
      }
    });
    casesList.appendChild(card);
  });
  updatePrintGrid();
}

function updatePrintGrid() {
  printGrid.innerHTML = '';
  const slots = [...cases];
  const totalSlots = 9;
  if (!slots.length) {
    for (let i = 0; i < totalSlots; i += 1) {
      slots.push(emptyPrintSlot());
    }
  }
  const remainder = slots.length % totalSlots;
  const fillers = remainder === 0 ? 0 : totalSlots - remainder;
  for (let i = 0; i < fillers; i += 1) {
    slots.push(emptyPrintSlot());
  }
  slots.forEach((caseItem) => {
    const card = document.createElement('div');
    card.className = 'print-card';
    card.innerHTML = `
      <strong>${caseItem.name}</strong>
      <div>${caseItem.age}</div>
      <div>${caseItem.parityLine}</div>
      <div>LMP: ${caseItem.lmp}</div>
      <div>EDD: ${caseItem.edd}</div>
      <div>${caseItem.diagnosis}</div>
      <div>${caseItem.diagnosisInfo || '&nbsp;'}</div>
      <div>${caseItem.important || '&nbsp;'}</div>
      <div>${caseItem.labs || '&nbsp;'}</div>
      <div>${caseItem.todo || '&nbsp;'}</div>
    `;
    printGrid.appendChild(card);
  });
}

function openCaseModal(caseItem) {
  modal.dataset.caseId = caseItem.id;
  const ensureLine = (value) => (value ? value : '\u00A0');
  modal.querySelector('.case-name').textContent = caseItem.name || '—';
  modal.querySelector('.case-age').textContent = caseItem.age || '—';
  modal.querySelector('.case-line').textContent = caseItem.parityLine || '—';
  modal.querySelectorAll('.case-date')[0].textContent = `LMP: ${caseItem.lmp || '—'}`;
  modal.querySelectorAll('.case-date')[1].textContent = `EDD: ${caseItem.edd || '—'}`;
  modal.querySelector('.case-diagnosis').textContent = caseItem.diagnosis || '—';
  modal.querySelector('.case-diagnosis-info').textContent = ensureLine(caseItem.diagnosisInfo);
  modal.querySelector('.case-important').textContent = ensureLine(caseItem.important);
  modal.querySelector('.case-labs').textContent = ensureLine(caseItem.labs);
  modal.querySelector('.case-todo').textContent = ensureLine(caseItem.todo);
  const incomplete = [caseItem.diagnosisInfo, caseItem.important, caseItem.labs, caseItem.todo].some((field) => !field);
  modal.querySelector('.incomplete-alert').style.visibility = incomplete ? 'visible' : 'hidden';
  modal.hidden = false;
  modalOverlay.hidden = false;
  modalContent.focus();
}

function closeCaseModal() {
  modal.hidden = true;
  modalOverlay.hidden = true;
  modalContent.scrollTop = 0;
}

function toggleSlideOver(open, options = {}) {
  const { title = 'إضافة حالة جديدة', reset = true } = options;
  slideOver.setAttribute('aria-hidden', String(!open));
  slideOver.classList.toggle('open', open);
  slideOver.querySelector('#case-form-title').textContent = title;
  if (open && reset) {
    slideForm.name.value = '';
    slideForm.details.value = '';
    editingCaseId = null;
    micWrapper.dataset.state = 'idle';
    voiceStatus.textContent = 'ابدأ التسجيل عند الضغط على الميكروفون';
    dictationComplete.hidden = true;
    setTimeout(() => {
      slideForm.name.focus();
    }, 50);
  }
  if (!open) {
    editingCaseId = null;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function handleSearch(query) {
  const results = cases.filter((caseItem) => Object.values(caseItem).join(' ').toLowerCase().includes(query.toLowerCase()));
  searchResults.innerHTML = '';
  if (!results.length) {
    const empty = document.createElement('div');
    empty.className = 'search-result';
    empty.textContent = 'لا توجد نتائج مطابقة.';
    searchResults.appendChild(empty);
    return;
  }
  results.forEach((caseItem) => {
    const res = document.createElement('div');
    res.className = 'search-result';
    res.innerHTML = `<strong>${caseItem.name}</strong><div>${caseItem.diagnosis}</div>`;
    res.addEventListener('click', () => {
      openCaseModal(caseItem);
      closeSearch();
    });
    searchResults.appendChild(res);
  });
}

function openSearch() {
  searchOverlay.hidden = false;
  searchOverlay.setAttribute('aria-hidden', 'false');
  searchInput.focus();
  handleSearch('');
}

function closeSearch() {
  searchOverlay.hidden = true;
  searchOverlay.setAttribute('aria-hidden', 'true');
  searchInput.value = '';
  searchResults.innerHTML = '';
}

function toggleChat(open) {
  chatPanel.classList.toggle('open', open);
  chatPanel.setAttribute('aria-hidden', String(!open));
}

function simulateDictation() {
  const states = ['جارٍ الاستماع…', 'تم التفريغ. راجع النص ثم اضغط إرسال'];
  let step = 0;
  micWrapper.dataset.state = 'listening';
  voiceStatus.textContent = states[step];
  micButton.disabled = true;
  micButton.querySelector('.material-symbols-rounded').textContent = 'mic_off';
  micButton.setAttribute('aria-label', 'إيقاف التسجيل');
  const interval = setInterval(() => {
    step += 1;
    if (step === 1) {
      micWrapper.dataset.state = 'completed';
      voiceStatus.textContent = states[step];
      slideForm.details.value = 'تفاصيل الحالة كما تم تحويلها من الصوت بشكل آلي مع إمكانية التحرير.';
      dictationComplete.hidden = false;
      micButton.disabled = false;
      micButton.querySelector('.material-symbols-rounded').textContent = 'mic';
      micButton.setAttribute('aria-label', 'ابدأ التسجيل');
      clearInterval(interval);
    }
  }, 1500);
}

function resetDictation() {
  micWrapper.dataset.state = 'idle';
  voiceStatus.textContent = 'ابدأ التسجيل عند الضغط على الميكروفون';
  dictationComplete.hidden = true;
  micButton.querySelector('.material-symbols-rounded').textContent = 'mic';
  micButton.setAttribute('aria-label', 'ابدأ التسجيل');
}

function deleteCase(id) {
  const confirmed = confirm('حذف الحالة نهائياً؟');
  if (!confirmed) return;
  const index = cases.findIndex((c) => c.id === id);
  if (index !== -1) {
    cases.splice(index, 1);
    renderCases();
    closeCaseModal();
    showToast('تم حذف الحالة');
  }
}

function editCase(id) {
  const caseItem = cases.find((c) => c.id === id);
  if (!caseItem) return;
  editingCaseId = id;
  toggleSlideOver(true, { title: 'تعديل الحالة', reset: false });
  slideForm.name.value = caseItem.name;
  slideForm.details.value = caseItem.diagnosisInfo || '';
  dictationComplete.hidden = true;
  setTimeout(() => {
    slideForm.name.focus();
  }, 50);
}

function saveCase(data, options = {}) {
  const { isNew = false } = options;
  if (!isNew && editingCaseId) {
    const index = cases.findIndex((c) => c.id === editingCaseId);
    if (index !== -1) {
      cases[index] = { ...cases[index], ...data };
      showToast('تم حفظ التعديلات');
    }
  } else {
    cases.push({ id: Date.now(), ...data });
    showToast('تم حفظ الحالة');
  }
  renderCases();
}

renderCases();

// Event bindings
document.getElementById('new-case-btn').addEventListener('click', () => toggleSlideOver(true));
document.getElementById('empty-new-case').addEventListener('click', () => toggleSlideOver(true));

Array.from(document.querySelectorAll('[data-close-slide]')).forEach((btn) =>
  btn.addEventListener('click', () => toggleSlideOver(false))
);

slideForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(slideForm);
  const name = formData.get('name').trim();
  if (!name) {
    showToast('الاسم مطلوب');
    return;
  }
  const details = formData.get('details').trim();
  if (editingCaseId) {
    const existing = cases.find((c) => c.id === editingCaseId) || {};
    saveCase(
      {
        name,
        diagnosisInfo: details,
        diagnosis: details || existing.diagnosis || '—'
      },
      { isNew: false }
    );
  } else {
    saveCase(
      {
        name,
        diagnosis: details || '—',
        age: '—',
        parityLine: '—',
        lmp: '—',
        edd: '—',
        diagnosisInfo: details,
        important: '',
        labs: '',
        todo: ''
      },
      { isNew: true }
    );
  }
  toggleSlideOver(false);
});

casesList.addEventListener('click', (event) => {
  const editBtn = event.target.closest('[data-edit]');
  const deleteBtn = event.target.closest('[data-delete]');
  if (editBtn) {
    editCase(Number(editBtn.dataset.edit));
    event.stopPropagation();
  }
  if (deleteBtn) {
    deleteCase(Number(deleteBtn.dataset.delete));
    event.stopPropagation();
  }
});

micButton.addEventListener('click', () => {
  if (micWrapper.dataset.state === 'listening') {
    return;
  }
  simulateDictation();
});

clearDetails.addEventListener('click', () => {
  slideForm.details.value = '';
  resetDictation();
});

manualEdit.addEventListener('click', () => {
  slideForm.details.focus();
});

dictationComplete.addEventListener('click', () => {
  showToast('تم التفريغ. يمكنك الحفظ الآن.');
});

modalOverlay.addEventListener('click', closeCaseModal);
document.getElementById('close-modal').addEventListener('click', closeCaseModal);
document.getElementById('dismiss-modal').addEventListener('click', closeCaseModal);

document.getElementById('delete-case').addEventListener('click', () => {
  const id = Number(modal.dataset.caseId);
  deleteCase(id);
});

document.getElementById('edit-case').addEventListener('click', () => {
  const id = Number(modal.dataset.caseId);
  closeCaseModal();
  editCase(id);
});

document.getElementById('save-case').addEventListener('click', () => {
  showToast('تم حفظ الحالة');
  closeCaseModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.metaKey || event.ctrlKey) return;
  switch (event.key) {
    case 'Escape':
      if (!modal.hidden) closeCaseModal();
      if (slideOver.classList.contains('open')) toggleSlideOver(false);
      if (!searchOverlay.hidden) closeSearch();
      if (chatPanel.classList.contains('open')) toggleChat(false);
      break;
    case 'n':
    case 'N':
      toggleSlideOver(true);
      break;
    case '/':
      openSearch();
      event.preventDefault();
      break;
    case 'p':
    case 'P':
      window.print();
      break;
    default:
      break;
  }
});

// FABs
document.getElementById('search-fab').addEventListener('click', openSearch);
document.getElementById('close-search').addEventListener('click', closeSearch);

searchInput.addEventListener('input', (event) => handleSearch(event.target.value));

document.getElementById('chat-fab').addEventListener('click', () => toggleChat(true));
document.querySelector('[data-close-chat]').addEventListener('click', () => toggleChat(false));

document.getElementById('print-fab').addEventListener('click', () => window.print());

// Chat placeholder
const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = chatForm.querySelector('input');
  if (!input.value.trim()) return;
  const userMessage = document.createElement('div');
  userMessage.className = 'bot-message user';
  userMessage.textContent = input.value;
  chatPanel.querySelector('.chat-body').appendChild(userMessage);
  const response = document.createElement('div');
  response.className = 'bot-message';
  response.textContent = 'سيتم البحث في جميع الحالات قريبًا.';
  chatPanel.querySelector('.chat-body').appendChild(response);
  input.value = '';
  chatPanel.querySelector('.chat-body').scrollTop = chatPanel.querySelector('.chat-body').scrollHeight;
});

// Accessibility focus outlines
document.body.addEventListener('keyup', (event) => {
  if (event.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
  }
});

document.body.addEventListener('mousedown', () => {
  document.body.classList.remove('user-is-tabbing');
});

const offlineBadge = document.querySelector('.offline-badge');
const appShell = document.querySelector('.app');

function updateConnectivityState(online) {
  offlineBadge.hidden = online;
  appShell.dataset.offline = String(!online);
  statusBadge.textContent = online ? 'جاهز للعمل' : 'غير متصل';
}

updateConnectivityState(navigator.onLine);

window.addEventListener('online', () => updateConnectivityState(true));
window.addEventListener('offline', () => updateConnectivityState(false));
