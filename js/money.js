// Dinheiro é sempre inteiro em centavos.

export function formatBRL(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  const reais = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const centavos = String(abs % 100).padStart(2, '0');
  return `${sign}R$ ${reais},${centavos}`;
}

// Aceita "3,50", "R$ 3,50", "3.50", "3", "1.240,00". Devolve centavos ou null.
export function parsePriceBRL(text) {
  let t = String(text ?? '').replace(/R\$/gi, '').replace(/\s+/g, '');
  if (!t) return null;
  if (t.includes(',')) {
    t = t.replace(/\./g, '').replace(',', '.');
  }
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const [inteiro, dec = ''] = t.split('.');
  const cents = Number(inteiro) * 100 + Number(dec.padEnd(2, '0'));
  return cents > 0 ? cents : null;
}
