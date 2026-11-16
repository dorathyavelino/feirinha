process.env.TZ = 'America/Sao_Paulo';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, daysWithOrders } from '../js/summary.js';
import { summaryMessage } from '../js/messages.js';

const brig = (qty) => ({ productId: 'a', name: 'Brigadeiro', priceCents: 300, qty });
const bolo = { productId: 'b', name: 'Bolo de pote', priceCents: 1000, qty: 1 };
const cookie = { productId: 'c', name: 'Cookie', priceCents: 600, qty: 1 };
const o = (id, payment, items, createdAt, status = 'ativo') =>
  ({ id, number: 0, customer: '', payment, items, createdAt, status, previousTotalCents: null });

const orders = [
  o('o1', 'credito', [brig(2), bolo], Date.UTC(2026, 10, 21, 13, 0)),            // 21/11 10:00
  o('o2', 'pix', [brig(3)], Date.UTC(2026, 10, 22, 1, 30), 'alterado'),          // 21/11 22:30 local
  o('o3', 'pix', [cookie], Date.UTC(2026, 10, 21, 14, 0), 'cancelado'),
  o('o4', 'dinheiro', [brig(1)], Date.UTC(2026, 10, 22, 15, 0)),                 // 22/11
];

test('summarize ignora cancelados e outros dias, conta alterados pelo valor novo', () => {
  const s = summarize(orders, '2026-11-21');
  assert.equal(s.orderCount, 2);
  assert.equal(s.totalCents, 2500);
  assert.deepEqual(s.byPayment.map((p) => p.key), ['credito', 'debito', 'pix', 'dinheiro']);
  assert.deepEqual(s.byPayment.map((p) => p.count), [1, 0, 1, 0]);
  assert.deepEqual(s.byPayment.map((p) => p.totalCents), [1600, 0, 900, 0]);
  assert.deepEqual(s.byProduct, [
    { productId: 'a', name: 'Brigadeiro', qty: 5 },
    { productId: 'b', name: 'Bolo de pote', qty: 1 },
  ]);
});

test('summarize conta pedido das 22h30 no dia local', () => {
  const s = summarize(orders, '2026-11-22');
  assert.equal(s.orderCount, 1);
  assert.equal(s.totalCents, 300);
});

test('summarize de dia sem vendas', () => {
  const s = summarize(orders, '2026-11-23');
  assert.equal(s.orderCount, 0);
  assert.equal(s.byPayment.length, 4);
  assert.deepEqual(s.byProduct, []);
});

test('daysWithOrders ordena do mais recente', () => {
  assert.deepEqual(daysWithOrders(orders), ['2026-11-22', '2026-11-21']);
});

test('summaryMessage', () => {
  assert.equal(summaryMessage(summarize(orders, '2026-11-21'), '2026-11-21'),
`Resumo – sábado, 21/11
Pedidos: 2
TOTAL: R$ 25,00

Por pagamento:
Crédito: 1 · R$ 16,00
Débito: 0 · R$ 0,00
Pix: 1 · R$ 9,00
Dinheiro: 0 · R$ 0,00

Por produto:
Brigadeiro: 5 un.
Bolo de pote: 1 un.`);
});
