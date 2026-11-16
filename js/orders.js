// Pedidos. Funções puras: recebem o estado e devolvem um novo.
// Cada pedido guarda em lastMessage o último texto gerado, para poder reenviar.
import { orderMessage, alteredMessage, canceledMessage } from './messages.js';

export const PAYMENTS = [
  { key: 'credito', label: 'Crédito' },
  { key: 'debito', label: 'Débito' },
  { key: 'pix', label: 'Pix' },
  { key: 'dinheiro', label: 'Dinheiro' },
];

export function paymentLabel(key) {
  return PAYMENTS.find((p) => p.key === key)?.label ?? '';
}

export function itemsTotal(items) {
  return items.reduce((sum, it) => sum + it.priceCents * it.qty, 0);
}

const filled = (items) => items.filter((it) => it.qty >= 1).map((it) => ({ ...it }));

export function validateDraft(draft) {
  if (filled(draft.items).length === 0) return 'Adicione pelo menos um produto.';
  if (!draft.payment) return 'Escolha a forma de pagamento.';
  return null;
}

function assertValid(draft) {
  const err = validateDraft(draft);
  if (err) throw new Error(err);
}

function findOrder(state, orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) throw new Error('Pedido não encontrado.');
  return order;
}

const replaceOrder = (state, order) => ({
  ...state,
  orders: state.orders.map((o) => (o.id === order.id ? order : o)),
});

// Registra o pedido em andamento (state.checkout) uma única vez.
export function ensureCommitted(state, now) {
  const { checkout } = state;
  if (checkout.orderId) {
    return { state, order: findOrder(state, checkout.orderId) };
  }
  const { draft } = checkout;
  assertValid(draft);
  const order = {
    id: crypto.randomUUID(),
    number: state.nextNumber,
    customer: draft.customer.trim(),
    payment: draft.payment,
    items: filled(draft.items),
    createdAt: now,
    status: 'ativo',
    previousTotalCents: null,
  };
  order.lastMessage = orderMessage(order);
  return {
    order,
    state: {
      ...state,
      orders: [...state.orders, order],
      nextNumber: state.nextNumber + 1,
      checkout: { ...checkout, orderId: order.id },
    },
  };
}

export function alterOrder(state, orderId, draft) {
  const old = findOrder(state, orderId);
  if (old.status === 'cancelado') throw new Error('Pedido cancelado não pode ser alterado.');
  assertValid(draft);
  const previousTotalCents = itemsTotal(old.items);
  const order = {
    ...old,
    customer: draft.customer.trim(),
    payment: draft.payment,
    items: filled(draft.items),
    status: 'alterado',
    previousTotalCents,
  };
  order.lastMessage = alteredMessage(order, previousTotalCents);
  return { state: replaceOrder(state, order), order, previousTotalCents };
}

export function cancelOrder(state, orderId) {
  const old = findOrder(state, orderId);
  if (old.status === 'cancelado') throw new Error('Este pedido já foi cancelado.');
  const order = { ...old, status: 'cancelado' };
  order.lastMessage = canceledMessage(order);
  return { state: replaceOrder(state, order), order };
}

export function clearSales(state) {
  return { ...state, orders: [], nextNumber: 1, checkout: null, editing: null };
}

// Num pedido novo, nome e preço vêm sempre do cadastro atual
// (itens que saíram do cadastro ficam como estão).
export function refreshDraftPrices(draft, products) {
  let changed = false;
  const items = draft.items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p || (p.name === it.name && p.priceCents === it.priceCents)) return it;
    changed = true;
    return { ...it, name: p.name, priceCents: p.priceCents };
  });
  return changed ? { ...draft, items } : draft;
}
