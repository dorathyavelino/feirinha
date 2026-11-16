// Datas sempre na hora local do aparelho, nunca UTC.

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const pad = (n) => String(n).padStart(2, '0');

export function dateKey(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parts(key) {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
}

export function formatDateBR(key) {
  const { y, m, d } = parts(key);
  return `${pad(d)}/${pad(m)}/${y}`;
}

export function weekdayLabel(key) {
  const { y, m, d } = parts(key);
  const dia = DIAS[new Date(y, m - 1, d).getDay()];
  return `${dia}, ${pad(d)}/${pad(m)}`;
}
