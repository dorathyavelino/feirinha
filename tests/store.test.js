import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, defaultState } from '../js/store.js';

function fakeStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    keys: () => m.keys(),
  };
}

test('defaultState', () => {
  assert.deepEqual(defaultState(), { version: 1, products: [], orders: [], nextNumber: 1, checkout: null, editing: null });
});

test('store devolve estado padrão quando vazio e salva/carrega', () => {
  const mem = fakeStorage();
  const store = createStore(mem);
  assert.deepEqual(store.load(), defaultState());
  const s = { ...defaultState(), nextNumber: 5, products: [{ id: 'a', name: 'X', priceCents: 100 }] };
  store.save(s);
  assert.deepEqual(createStore(mem).load(), s);
});

test('store guarda cópia do JSON corrompido e não quebra', () => {
  const mem = fakeStorage({ 'feirinha:v1': '{quebrado' });
  assert.deepEqual(createStore(mem).load(), defaultState());
  assert.ok([...mem.keys()].some((k) => k.startsWith('feirinha:v1:corrompido:')));
  assert.equal(mem.getItem('feirinha:v1'), '{quebrado'); // original intacto até o próximo save
});

test('store deixa o erro de salvamento subir', () => {
  const mem = fakeStorage();
  mem.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => createStore(mem).save(defaultState()), /Quota/);
});
