import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsAppUrl } from '../js/share.js';

test('whatsAppUrl abre o app do WhatsApp direto (funciona sem sinal)', () => {
  assert.equal(whatsAppUrl('Pedido #7 – Maria\nTOTAL: R$ 16,00'),
    'whatsapp://send?text=' + encodeURIComponent('Pedido #7 – Maria\nTOTAL: R$ 16,00'));
});
