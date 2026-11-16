// Tela Resumo: vendas do dia, envio do resumo e apagar vendas.
import { esc } from '../html.js';
import { formatBRL } from '../money.js';
import { dateKey, weekdayLabel } from '../dates.js';
import { clearSales } from '../orders.js';
import { summarize, daysWithOrders } from '../summary.js';
import { summaryMessage } from '../messages.js';
import { openWhatsApp } from '../share.js';

export function render(root, ctx, params) {
  const today = dateKey(Date.now());
  const days = [...new Set([today, ...daysWithOrders(ctx.state.orders)])].sort().reverse();
  const day = params.day && days.includes(params.day) ? params.day : today;
  const s = summarize(ctx.state.orders, day);

  root.innerHTML = `
    <h1>Resumo</h1>
    ${days.length > 1 ? `
      <select id="day" aria-label="Dia">
        ${days.map((d) => `<option value="${d}" ${d === day ? 'selected' : ''}>${weekdayLabel(d)}${d === today ? ' (hoje)' : ''}</option>`).join('')}
      </select>` : `<p class="muted">${weekdayLabel(day)} (hoje)</p>`}

    ${s.orderCount === 0 ? '<p class="empty">Nenhuma venda neste dia.</p>' : `
      <h2>Total vendido</h2>
      <div class="big">${formatBRL(s.totalCents)}</div>
      <div class="stat"><span>Pedidos</span><b>${s.orderCount}</b></div>

      <h2>Por pagamento</h2>
      ${s.byPayment.map((p) => `<div class="stat"><span>${p.label}</span><b>${p.count} · ${formatBRL(p.totalCents)}</b></div>`).join('')}

      <h2>Por produto</h2>
      ${s.byProduct.map((p) => `<div class="stat"><span>${esc(p.name)}</span><b>${p.qty} un.</b></div>`).join('')}

      <button type="button" class="btn wa" id="send">Enviar resumo no WhatsApp</button>
    `}

    <h2 style="margin-top:40px">Começar do zero</h2>
    <p class="muted">Apaga todas as vendas de todos os dias. Os produtos continuam cadastrados. Envie o resumo antes.</p>
    <button type="button" class="btn danger" id="clear">Apagar vendas</button>
  `;

  root.querySelector('#day')?.addEventListener('change', (e) => ctx.go('resumo', { day: e.target.value }));
  root.querySelector('#send')?.addEventListener('click', () => openWhatsApp(summaryMessage(s, day)));
  root.querySelector('#clear').onclick = () => {
    if (!confirm('Apagar TODAS as vendas? Os produtos continuam cadastrados.')) return;
    const typed = prompt('Para confirmar, digite APAGAR');
    if (typed !== 'APAGAR') {
      ctx.toast('Nada foi apagado.');
      return;
    }
    ctx.update(clearSales, { silent: true });
    ctx.toast('Vendas apagadas.');
    ctx.go('resumo');
  };
}
