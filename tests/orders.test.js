import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAYMENTS, paymentLabel, itemsTotal, validateDraft, ensureCommitted, alterOrder, cancelOrder, clearSales } from '../js/orders.js';

const item = { productId: 'a', name: 'Brigadeiro', priceCents: 300, qty: 2 };
const bolo = { productId: 'b', name: 'Bolo de pote', priceCents: 1000, qty: 1 };
const cookie = { productId: 'c', name: 'Cookie', priceCents: 600, qty: 1 };
const base = { version: 1, products: [{ id: 'a', name: 'Brigadeiro', priceCents: 300 }], orders: [], nextNumber: 1, checkout: null, editing: null };
const okDraft = { customer: 'Maria', payment: 'credito', items: [item, bolo] };
const id = 'o7';
const withOrder16 = { ...base, nextNumber: 8, orders: [
  { id, number: 7, customer: 'Maria', payment: 'credito', items: [item, bolo], createdAt: 5, status: 'ativo', previousTotalCents: null } ] };
const draft22 = { customer: 'Maria', payment: 'credito', items: [item, bolo, cookie] };

test('PAYMENTS na ordem certa e paymentLabel', () => {
  assert.deepEqual(PAYMENTS.map((p) => p.key), ['credito', 'debito', 'pix', 'dinheiro']);
  assert.deepEqual(PAYMENTS.map((p) => p.label), ['Crédito', 'Débito', 'Pix', 'Dinheiro']);
  assert.equal(paymentLabel('pix'), 'Pix');
});

test('itemsTotal', () => {
  assert.equal(itemsTotal([item, bolo]), 1600);
  assert.equal(itemsTotal([]), 0);
});

test('validateDraft', () => {
  assert.equal(validateDraft({ customer: 'A', payment: 'pix', items: [] }), 'Adicione pelo menos um produto.');
  assert.equal(validateDraft({ customer: 'A', payment: 'pix', items: [{ ...item, qty: 0 }] }), 'Adicione pelo menos um produto.');
  assert.equal(validateDraft({ customer: 'A', payment: null, items: [item] }), 'Escolha a forma de pagamento.');
  assert.equal(validateDraft({ customer: '', payment: 'pix', items: [item] }), null);
});

test('ensureCommitted registra uma vez só mesmo com dois toques', () => {
  const s0 = { ...base, nextNumber: 7, checkout: { draft: okDraft, orderId: null } };
  const r1 = ensureCommitted(s0, 1000);
  const r2 = ensureCommitted(r1.state, 2000);
  assert.equal(r2.state.orders.length, 1);
  assert.equal(r2.order.number, 7);
  assert.equal(r2.state.nextNumber, 8);
  assert.equal(r2.order.id, r1.order.id);
  assert.equal(r1.order.createdAt, 1000);
  assert.equal(r1.order.status, 'ativo');
  assert.equal(r1.state.checkout.orderId, r1.order.id);
  assert.equal(s0.orders.length, 0); // não muta
});

test('ensureCommitted guarda só itens com quantidade', () => {
  const s0 = { ...base, checkout: { draft: { ...okDraft, items: [item, { ...cookie, qty: 0 }] }, orderId: null } };
  assert.deepEqual(ensureCommitted(s0, 1).order.items, [item]);
});

test('ensureCommitted recusa pedido inválido sem salvar nada', () => {
  const s0 = { ...base, checkout: { draft: { ...okDraft, items: [] }, orderId: null } };
  assert.throws(() => ensureCommitted(s0, 1), /Adicione/);
});

test('alterOrder guarda o total anterior e marca alterado', () => {
  const r = alterOrder(withOrder16, id, draft22);
  assert.equal(r.previousTotalCents, 1600);
  assert.equal(r.order.status, 'alterado');
  assert.equal(r.order.number, 7);
  assert.equal(r.order.createdAt, 5);
  assert.equal(itemsTotal(r.order.items), 2200);
  assert.equal(r.state.orders[0].previousTotalCents, 1600);
  assert.equal(withOrder16.orders[0].status, 'ativo'); // não muta
});

test('alterOrder recusa ficar sem itens e recusa pedido cancelado', () => {
  assert.throws(() => alterOrder(withOrder16, id, { ...draft22, items: [] }), /Adicione/);
  const c = cancelOrder(withOrder16, id).state;
  assert.equal(c.orders[0].status, 'cancelado');
  assert.throws(() => alterOrder(c, id, draft22), /cancelado/);
  assert.throws(() => cancelOrder(c, id), /cancelado/);
});

test('clearSales mantém produtos e reinicia a numeração', () => {
  const s = clearSales({ ...withOrder16, checkout: { draft: okDraft, orderId: null } });
  assert.deepEqual([s.orders.length, s.nextNumber, s.products.length, s.checkout, s.editing], [0, 1, 1, null, null]);
});

// --- correções da revisão final ---
import { orderMessage, alteredMessage, canceledMessage } from '../js/messages.js';
import { refreshDraftPrices } from '../js/orders.js';

test('pedidos guardam a última mensagem para reenviar', () => {
  const s0 = { ...base, nextNumber: 7, checkout: { draft: okDraft, orderId: null } };
  const r1 = ensureCommitted(s0, 1000);
  assert.equal(r1.order.lastMessage, orderMessage(r1.order));
  const r2 = alterOrder(r1.state, r1.order.id, draft22);
  assert.equal(r2.order.lastMessage, alteredMessage(r2.order, 1600));
  const r3 = cancelOrder(r2.state, r1.order.id);
  assert.equal(r3.order.lastMessage, canceledMessage(r3.order));
  assert.equal(r3.state.orders[0].lastMessage, r3.order.lastMessage);
});

test('refreshDraftPrices usa nome e preço atuais do cadastro', () => {
  const products = [{ id: 'a', name: 'Brigadeiro', priceCents: 300 }];
  const draft = { customer: '', payment: null, items: [
    { productId: 'a', name: 'Brigadero', priceCents: 3000, qty: 2 },
    { productId: 'zz', name: 'Removido', priceCents: 500, qty: 1 } ] };
  const d = refreshDraftPrices(draft, products);
  assert.deepEqual(d.items[0], { productId: 'a', name: 'Brigadeiro', priceCents: 300, qty: 2 });
  assert.deepEqual(d.items[1], draft.items[1]); // fora do cadastro: mantém
  assert.equal(refreshDraftPrices(d, products), d); // sem mudança: mesmo objeto
});
