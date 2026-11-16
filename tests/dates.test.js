process.env.TZ = 'America/Sao_Paulo';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateKey, formatDateBR, weekdayLabel } from '../js/dates.js';

test('dateKey usa a data local, não UTC', () => {
  // 22/11 01:30 UTC = 21/11 22:30 em Brasília
  assert.equal(dateKey(Date.UTC(2026, 10, 22, 1, 30)), '2026-11-21');
});

test('formatDateBR e weekdayLabel', () => {
  assert.equal(formatDateBR('2026-11-21'), '21/11/2026');
  assert.equal(weekdayLabel('2026-11-21'), 'sábado, 21/11');
  assert.equal(weekdayLabel('2026-11-22'), 'domingo, 22/11');
});
