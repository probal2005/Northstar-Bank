const STORAGE_KEY = 'northstar-bank-state';
const defaultState = {
  balance: 12450.5,
  customerName: 'Ava Chen',
  transactions: [
    { type: 'Deposit', amount: 1200, note: 'Paycheck' },
    { type: 'Transfer', amount: -250, note: 'Rent' },
    { type: 'Deposit', amount: 320, note: 'Refund' }
  ]
};

let state = loadState();

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const heroAccountLabel = document.getElementById('heroAccountLabel');
const cardLimit = document.getElementById('cardLimit');
const rewardsValue = document.getElementById('rewardsValue');
const heroPill = document.getElementById('heroPill');
const loginForm = document.getElementById('loginForm');
const transferForm = document.getElementById('transferForm');
const depositForm = document.getElementById('depositForm');
const logoutBtn = document.getElementById('logoutBtn');
const loanCalcBtn = document.getElementById('loanCalcBtn');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const toast = document.getElementById('toast');

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function updateHeroPreview(button) {
  if (!button) return;
  const balance = button.dataset.balance;
  const label = button.dataset.label;
  const limit = button.dataset.limit;
  const rewards = button.dataset.rewards;
  const pill = button.dataset.pill;

  document.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('active', chip === button));
  if (heroBalance) heroBalance.textContent = formatCurrency(Number(balance));
  if (heroAccountLabel) heroAccountLabel.textContent = label;
  if (cardLimit) cardLimit.textContent = limit;
  if (rewardsValue) rewardsValue.textContent = rewards;
  if (heroPill) heroPill.textContent = pill;
}

function render() {
  const heroBalance = document.getElementById('heroBalance');
  if (heroBalance) heroBalance.textContent = formatCurrency(state.balance);
  const balanceValue = document.getElementById('balanceValue');
  if (balanceValue) balanceValue.textContent = formatCurrency(state.balance);
  const customerName = document.getElementById('customerName');
  if (customerName) customerName.textContent = state.customerName;
  const goalFill = document.getElementById('goalFill');
  if (goalFill) goalFill.style.width = `${Math.min(100, Math.round((state.balance / 20000) * 100))}%`;

  const list = document.getElementById('transactionList');
  if (list) {
    list.innerHTML = '';
    if (!state.transactions.length) {
      list.innerHTML = '<li>No recent activity yet.</li>';
      return;
    }

    state.transactions.slice(0, 5).forEach((item) => {
      const li = document.createElement('li');
      const sign = item.amount >= 0 ? '+' : '-';
      li.innerHTML = `<span>${item.note}</span><strong>${sign}${formatCurrency(Math.abs(item.amount))}</strong>`;
      list.appendChild(li);
    });
  }
}

function openDashboard() {
  if (loginSection) loginSection.classList.add('hidden');
  if (dashboardSection) dashboardSection.classList.remove('hidden');
}

function closeDashboard() {
  if (loginSection) loginSection.classList.remove('hidden');
  if (dashboardSection) dashboardSection.classList.add('hidden');
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
      showToast('Please enter your login details.');
      return;
    }

    state.customerName = username || state.customerName;
    saveState();
    openDashboard();
    render();
    showToast(`Welcome back, ${state.customerName}!`);
    loginForm.reset();
  });
}

if (transferForm) {
  transferForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = Number(document.getElementById('transferAmount').value);
    const recipient = document.getElementById('transferTo').value.trim();

    if (!recipient) {
      showToast('Please enter a recipient.');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('Transfer amount must be greater than zero.');
      return;
    }
    if (state.balance < amount) {
      showToast('Insufficient funds for this transfer.');
      return;
    }

    state.balance -= amount;
    state.transactions.unshift({ type: 'Transfer', amount: -amount, note: `To ${recipient}` });
    saveState();
    render();
    transferForm.reset();
    showToast(`Transfer of ${formatCurrency(amount)} was sent.`);
  });
}

if (depositForm) {
  depositForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = Number(document.getElementById('depositAmount').value);

    if (!amount || amount <= 0) {
      showToast('Deposit amount must be greater than zero.');
      return;
    }

    state.balance += amount;
    state.transactions.unshift({ type: 'Deposit', amount, note: 'Mobile deposit' });
    saveState();
    render();
    depositForm.reset();
    showToast(`Deposit of ${formatCurrency(amount)} was added.`);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    closeDashboard();
    showToast('You have been logged out.');
  });
}

if (loanCalcBtn) {
  loanCalcBtn.addEventListener('click', () => {
    const principal = Number(document.getElementById('loanAmount').value);
    const years = Number(document.getElementById('loanYears').value);
    const annualRate = 0.068;
    const months = years * 12;

    if (!principal || principal <= 0 || !months || months <= 0) {
      document.getElementById('loanResult').textContent = 'Enter a valid loan amount and term.';
      return;
    }

    const monthlyRate = annualRate / 12;
    const payment = monthlyRate === 0
      ? principal / months
      : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));

    document.getElementById('loanResult').textContent = `Estimated monthly payment: ${formatCurrency(payment)}`;
  });
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('northstar-theme', isDark ? 'dark' : 'light');
  });
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const heroCta = document.getElementById('heroCta');
if (heroCta) {
  heroCta.addEventListener('click', () => {
    openDashboard();
    render();
    showToast('Opening your dashboard.');
  });
}

if (localStorage.getItem('northstar-theme') === 'dark') {
  document.body.classList.add('dark');
  if (themeToggle) themeToggle.textContent = '🌙';
}

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => updateHeroPreview(chip));
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const counters = document.querySelectorAll('[data-counter]');
counters.forEach((counter) => {
  const target = Number(counter.dataset.counter);
  const suffix = target % 1 === 0 ? '' : '';
  const duration = 1200;
  let start = 0;
  const increment = target / (duration / 16);
  const step = () => {
    start += increment;
    if (start < target) {
      counter.textContent = `${Math.min(target, start).toFixed(target % 1 === 0 ? 0 : 1)}${suffix}`;
      requestAnimationFrame(step);
    } else {
      counter.textContent = `${target}${suffix}`;
    }
  };
  requestAnimationFrame(step);
});

render();
