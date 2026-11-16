// Cadastro de produtos. Funções puras: recebem o estado e devolvem um novo.

function clean({ name, priceCents }) {
  const n = String(name ?? '').trim();
  if (!n) throw new Error('Informe o nome do produto.');
  if (!Number.isInteger(priceCents) || priceCents <= 0) throw new Error('Informe um preço válido.');
  return { name: n, priceCents };
}

export function addProduct(state, data) {
  const p = { id: crypto.randomUUID(), ...clean(data) };
  return { ...state, products: [...state.products, p] };
}

export function updateProduct(state, id, data) {
  const c = clean(data);
  return { ...state, products: state.products.map((p) => (p.id === id ? { ...p, ...c } : p)) };
}

export function removeProduct(state, id) {
  return { ...state, products: state.products.filter((p) => p.id !== id) };
}
