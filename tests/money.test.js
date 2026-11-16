import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBRL, parsePriceBRL } from '../js/money.js';

test('formatBRL', () => {
  assert.equal(formatBRL(0), 'R$ 0,00');
  assert.equal(formatBRL(350), 'R$ 3,50');
  assert.equal(formatBRL(124000), 'R$ 1.240,00');
  assert.equal(formatBRL(123456789), 'R$ 1.234.567,89');
});

test('parsePriceBRL aceita formatos brasileiros', () => {
  assert.equal(parsePriceBRL('3,50'), 350);
  assert.equal(parsePriceBRL('R$ 3,50'), 350);
  assert.equal(parsePriceBRL(' 3.50 '), 350);
  assert.equal(parsePriceBRL('3'), 300);
  assert.equal(parsePriceBRL('1.240,00'), 124000);
  assert.equal(parsePriceBRL('10,5'), 1050);
});

test('parsePriceBRL recusa valores inválidos', () => {
  for (const t of ['', '0', '0,00', '-2', 'abc', '3,555']) {
    assert.equal(parsePriceBRL(t), null, `deveria recusar "${t}"`);
  }
});
