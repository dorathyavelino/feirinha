// Casca do app: estado em memória, salvamento, abas e troca de telas.
import { createStore } from './store.js';
import * as vender from './views/vender.js';
import * as mensagem from './views/mensagem.js';
import * as pedidos from './views/pedidos.js';
import * as produtos from './views/produtos.js';
import * as resumo from './views/resumo.js';

const views = { vender, mensagem, pedidos, produtos, resumo };
// A tela Mensagem pertence à aba de onde veio.
// Alterar um pedido (Vender com editOrderId) pertence à aba Pedidos.
const tabOf = (view, params) => {
  if (view === 'mensagem') return params.tab ?? 'vender';
  if (view === 'vender' && params.editOrderId) return 'pedidos';
  return view;
};

const store = createStore(localStorage);
let state = store.load();
let current = { view: 'vender', params: {} };

const root = document.getElementById('view');
const tabs = document.getElementById('tabs');
const toastEl = document.getElementById('toast');
let toastTimer;

const ctx = {
  get state() { return state; },
  // Aplica a mudança, salva e redesenha. { silent: true } salva sem redesenhar
  // (usado enquanto se digita, para não perder o foco do campo).
  update(fn, { silent = false } = {}) {
    state = fn(state);
    try {
      store.save(state);
    } catch {
      alert('Não foi possível salvar. Tire um print e avise.');
    }
    if (!silent) render();
  },
  go(view, params = {}) {
    current = { view, params };
    render();
    window.scrollTo(0, 0);
  },
  toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
  },
};

function render() {
  const tab = tabOf(current.view, current.params);
  for (const b of tabs.querySelectorAll('button')) b.classList.toggle('on', b.dataset.tab === tab);
  views[current.view].render(root, ctx, current.params);
}

tabs.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (b) ctx.go(b.dataset.tab);
});

// Fora da tela inicial, pede para instalar (os dados ficam separados no iPhone).
function showWelcomeIfNeeded() {
  const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  let skipped = false;
  try { skipped = sessionStorage.getItem('feirinha:welcome-skip') === '1'; } catch { /* sem sessionStorage */ }
  if (standalone || skipped) return;
  const w = document.getElementById('welcome');
  w.hidden = false;
  document.getElementById('welcome-skip').onclick = () => {
    try { sessionStorage.setItem('feirinha:welcome-skip', '1'); } catch { /* ignora */ }
    w.hidden = true;
  };
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
navigator.storage?.persist?.().catch(() => {});
showWelcomeIfNeeded();
render();
