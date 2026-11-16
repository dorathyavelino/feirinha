// Textos que vão para o WhatsApp.
import { formatBRL } from './money.js';
import { itemsTotal, paymentLabel } from './orders.js';
import { weekdayLabel } from './dates.js';

const withName = (title, customer) => {
  const name = String(customer ?? '').trim();
  return name ? `${title} – ${name}` : title;
};

const itemLines = (items) =>
  items.map((it) => `${it.qty}x ${it.name} (${formatBRL(it.priceCents)}) = ${formatBRL(it.priceCents * it.qty)}`);

export function orderMessage({ number, customer, payment, items }) {
  return [
    withName(`Pedido #${number}`, customer),
    ...itemLines(items),
    `Pagamento: ${paymentLabel(payment)}`,
    `TOTAL: ${formatBRL(itemsTotal(items))}`,
  ].join('\n');
}

export function alteredMessage(order, previousTotalCents) {
  return [
    withName(`⚠️ PEDIDO #${order.number} ALTERADO`, order.customer),
    ...itemLines(order.items),
    `Pagamento: ${paymentLabel(order.payment)}`,
    `NOVO TOTAL: ${formatBRL(itemsTotal(order.items))}`,
    `(antes: ${formatBRL(previousTotalCents)})`,
  ].join('\n');
}

export function canceledMessage(order) {
  return [
    withName(`❌ PEDIDO #${order.number} CANCELADO`, order.customer),
    `Total que era: ${formatBRL(itemsTotal(order.items))}`,
  ].join('\n');
}

export function summaryMessage(summary, key) {
  return [
    `Resumo – ${weekdayLabel(key)}`,
    `Pedidos: ${summary.orderCount}`,
    `TOTAL: ${formatBRL(summary.totalCents)}`,
    '',
    'Por pagamento:',
    ...summary.byPayment.map((p) => `${p.label}: ${p.count} · ${formatBRL(p.totalCents)}`),
    '',
    'Por produto:',
    ...summary.byProduct.map((p) => `${p.name}: ${p.qty} un.`),
  ].join('\n');
}
