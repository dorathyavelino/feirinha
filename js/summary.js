// Resumo de vendas de um dia (data local).
import { dateKey } from './dates.js';
import { PAYMENTS, itemsTotal } from './orders.js';

export function summarize(orders, key) {
  const day = orders
    .filter((o) => o.status !== 'cancelado' && dateKey(o.createdAt) === key)
    .sort((a, b) => a.createdAt - b.createdAt);

  const byPayment = PAYMENTS.map(({ key: k, label }) => {
    const list = day.filter((o) => o.payment === k);
    return { key: k, label, count: list.length, totalCents: list.reduce((s, o) => s + itemsTotal(o.items), 0) };
  });

  const products = new Map();
  for (const o of day) {
    for (const it of o.items) {
      const cur = products.get(it.productId) ?? { productId: it.productId, name: it.name, qty: 0 };
      products.set(it.productId, { ...cur, name: it.name, qty: cur.qty + it.qty });
    }
  }
  const byProduct = [...products.values()].sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name, 'pt-BR'));

  return {
    orderCount: day.length,
    totalCents: day.reduce((s, o) => s + itemsTotal(o.items), 0),
    byPayment,
    byProduct,
  };
}

export function daysWithOrders(orders) {
  return [...new Set(orders.map((o) => dateKey(o.createdAt)))].sort().reverse();
}
