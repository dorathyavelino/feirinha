import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderMessage, alteredMessage, canceledMessage } from '../js/messages.js';

const maria = { number: 7, customer: 'Maria', payment: 'credito', items: [
  { productId: 'a', name: 'Brigadeiro', priceCents: 300, qty: 2 },
  { productId: 'b', name: 'Bolo de pote', priceCents: 1000, qty: 1 } ] };

test('orderMessage', () => {
  assert.equal(orderMessage(maria),
`Pedido #7 – Maria
2x Brigadeiro (R$ 3,00) = R$ 6,00
1x Bolo de pote (R$ 10,00) = R$ 10,00
Pagamento: Crédito
TOTAL: R$ 16,00`);
});

test('orderMessage sem nome de cliente', () => {
  assert.match(orderMessage({ ...maria, customer: '  ' }), /^Pedido #7\n/);
});

test('alteredMessage', () => {
  const alt = { ...maria, items: [...maria.items, { productId: 'c', name: 'Cookie', priceCents: 600, qty: 1 }] };
  assert.equal(alteredMessage(alt, 1600),
`⚠️ PEDIDO #7 ALTERADO – Maria
2x Brigadeiro (R$ 3,00) = R$ 6,00
1x Bolo de pote (R$ 10,00) = R$ 10,00
1x Cookie (R$ 6,00) = R$ 6,00
Pagamento: Crédito
NOVO TOTAL: R$ 22,00
(antes: R$ 16,00)`);
});

test('canceledMessage', () => {
  assert.equal(canceledMessage({ number: 6, customer: 'Pedro', items: [{ productId: 'x', name: 'X', priceCents: 900, qty: 1 }] }),
`❌ PEDIDO #6 CANCELADO – Pedro
Total que era: R$ 9,00`);
});

test('mensagens de alterado e cancelado sem nome', () => {
  assert.match(alteredMessage({ ...maria, customer: '' }, 100), /^⚠️ PEDIDO #7 ALTERADO\n/);
  assert.match(canceledMessage({ ...maria, customer: '' }), /^❌ PEDIDO #7 CANCELADO\n/);
});
