// Tela Pedidos: lista do dia, com acesso a alterar e cancelar.
import { esc } from '../html.js';
import { formatBRL } from '../money.js';
import { dateKey, weekdayLabel } from '../dates.js';
import { itemsTotal, paymentLabel } from '../orders.js';
import { canceledMessage } from '../messages.js';
import { daysWithOrders } from '../summary.js';

const hhmm = (ms) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function render(root, ctx, params) {
  const today = dateKey(Date.now());
  const days = [...new Set([today, ...daysWithOrders(ctx.state.orders)])].sort().reverse();
  const day = params.day && days.includes(params.day) ? params.day : today;
  const list = ctx.state.orders
    .filter((o) => dateKey(o.createdAt) === day)
    .sort((a, b) => b.createdAt - a.createdAt);

  root.innerHTML = `
    <h1>Pedidos</h1>
    ${days.length > 1 ? `
      <select id="day" aria-label="Dia">
        ${days.map((d) => `<option value="${d}" ${d === day ? 'selected' : ''}>${weekdayLabel(d)}${d === today ? ' (hoje)' : ''}</option>`).join('')}
      </select>` : ''}
    <div style="margin-top:12px">
      ${list.length === 0 ? '<p class="empty">Nenhum pedido neste dia.</p>' : list.map((o) => `
        <button type="button" class="order ${o.status}" data-id="${o.id}">
          <div class="top"><span>#${o.number}${o.customer ? ' ' + esc(o.customer) : ''}</span><span>${formatBRL(itemsTotal(o.items))}</span></div>
          <div class="sub">${paymentLabel(o.payment)} · ${hhmm(o.createdAt)}
            ${o.status === 'alterado' ? '<span class="tag alterado">alterado</span>' : ''}
            ${o.status === 'cancelado' ? '<span class="tag cancelado">cancelado</span>' : ''}
          </div>
        </button>`).join('')}
    </div>
  `;

  root.querySelector('#day')?.addEventListener('change', (e) => ctx.go('pedidos', { day: e.target.value }));

  for (const b of root.querySelectorAll('.order')) {
    b.onclick = () => {
      const o = ctx.state.orders.find((x) => x.id === b.dataset.id);
      if (o.status === 'cancelado') {
        ctx.go('mensagem', { tab: 'pedidos', title: `Pedido #${o.number} (cancelado)`, text: o.lastMessage ?? canceledMessage(o) });
        return;
      }
      const draft = { customer: o.customer, payment: o.payment, items: o.items.map((it) => ({ ...it })) };
      ctx.update((s) => ({ ...s, editing: { orderId: o.id, draft } }), { silent: true });
      ctx.go('vender', { editOrderId: o.id });
    };
  }
}
