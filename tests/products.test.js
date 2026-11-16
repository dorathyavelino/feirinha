import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addProduct, updateProduct, removeProduct } from '../js/products.js';

const base = { version: 1, products: [], orders: [], nextNumber: 1, checkout: null, editing: null };
const withOrder = {
  ...base,
  products: [{ id: 'p1', name: 'Brigadeiro', priceCents: 300 }],
  orders: [{ id: 'o1', number: 1, customer: 'Ana', payment: 'pix', createdAt: 0, status: 'ativo', previousTotalCents: null,
    items: [{ productId: 'p1', name: 'Brigadeiro', priceCents: 300, qty: 2 }] }],
};

test('addProduct adiciona com nome sem espaços nas pontas', () => {
  const s = addProduct(base, { name: '  Brigadeiro ', priceCents: 300 });
  assert.equal(s.products.length, 1);
  assert.equal(s.products[0].name, 'Brigadeiro');
  assert.equal(s.products[0].priceCents, 300);
  assert.equal(typeof s.products[0].id, 'string');
  assert.equal(base.products.length, 0); // não muta
});

test('addProduct recusa nome vazio e preço inválido', () => {
  assert.throws(() => addProduct(base, { name: ' ', priceCents: 300 }), /nome/);
  assert.throws(() => addProduct(base, { name: 'X', priceCents: 0 }), /preço/);
  assert.throws(() => addProduct(base, { name: 'X', priceCents: 2.5 }), /preço/);
  assert.throws(() => addProduct(base, { name: 'X', priceCents: null }), /preço/);
});

test('updateProduct muda preço sem mexer nos pedidos antigos', () => {
  const s = updateProduct(withOrder, 'p1', { name: 'Brigadeiro', priceCents: 400 });
  assert.equal(s.products[0].priceCents, 400);
  assert.equal(s.orders[0].items[0].priceCents, 300);
  assert.equal(withOrder.products[0].priceCents, 300); // não muta
});

test('updateProduct valida nome e preço', () => {
  assert.throws(() => updateProduct(withOrder, 'p1', { name: '', priceCents: 400 }), /nome/);
  assert.throws(() => updateProduct(withOrder, 'p1', { name: 'B', priceCents: -1 }), /preço/);
});

test('removeProduct tira do cadastro e mantém nos pedidos', () => {
  const s = removeProduct(withOrder, 'p1');
  assert.equal(s.products.length, 0);
  assert.equal(s.orders[0].items[0].name, 'Brigadeiro');
});
