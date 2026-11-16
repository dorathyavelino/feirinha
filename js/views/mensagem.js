// Tela Mensagem pronta.
// Sem params.text: mensagem do pedido em andamento (state.checkout).
// Com params.text: texto pronto (alteração/cancelamento), sem registrar nada.
import { esc } from '../html.js';
import { ensureCommitted, validateDraft } from '../orders.js';
import { orderMessage } from '../messages.js';
import { openWhatsApp, copyText } from '../share.js';

async function copy(ctx, text) {
  const ok = await copyText(text);
  ctx.toast(ok ? 'Mensagem copiada!' : 'Não deu para copiar. Selecione o texto e copie.');
}

export function render(root, ctx, params) {
  if (params.text != null) return renderFixed(root, ctx, params);

  const co = ctx.state.checkout;
  if (!co || validateDraft(co.draft)) return ctx.go('vender');

  const committed = co.orderId ? ctx.state.orders.find((o) => o.id === co.orderId) : null;
  const text = committed
    ? orderMessage(committed)
    : orderMessage({ ...co.draft, number: ctx.state.nextNumber, items: co.draft.items.filter((it) => it.qty >= 1) });

  root.innerHTML = `
    <h1>Mensagem pronta</h1>
    <div class="msg" id="msg">${esc(text)}</div>
    <button type="button" class="btn wa" id="wa">Enviar no WhatsApp</button>
    <button type="button" class="btn gray" id="copy">Copiar mensagem</button>
    ${committed ? '' : '<button type="button" class="btn light" id="back">Voltar e corrigir</button>'}
    <button type="button" class="btn light" id="new">Novo pedido</button>
    ${committed ? '<p class="muted">Pedido registrado. Para mudar algo, use a aba Pedidos.</p>' : ''}
  `;

  // Registra o pedido (uma vez só) e devolve o texto final.
  const commit = () => {
    try {
      let result;
      ctx.update((s) => {
        result = ensureCommitted(s, Date.now());
        return result.state;
      });
      return orderMessage(result.order);
    } catch (e) {
      ctx.toast(e.message);
      return null;
    }
  };

  root.querySelector('#wa').onclick = () => {
    const t = commit();
    if (t) openWhatsApp(t);
  };
  root.querySelector('#copy').onclick = () => {
    const t = commit();
    if (t) copy(ctx, t);
  };
  root.querySelector('#back')?.addEventListener('click', () => ctx.go('vender'));
  root.querySelector('#new').onclick = () => {
    if (!committed && !confirm('Este pedido ainda não foi enviado. Descartar?')) return;
    ctx.update((s) => ({ ...s, checkout: null }), { silent: true });
    ctx.go('vender');
  };
}

function renderFixed(root, ctx, params) {
  root.innerHTML = `
    <h1>${esc(params.title ?? 'Mensagem pronta')}</h1>
    <div class="msg">${esc(params.text)}</div>
    <button type="button" class="btn wa" id="wa">Enviar no WhatsApp</button>
    <button type="button" class="btn gray" id="copy">Copiar mensagem</button>
    <button type="button" class="btn light" id="back">Voltar para pedidos</button>
  `;
  root.querySelector('#wa').onclick = () => openWhatsApp(params.text);
  root.querySelector('#copy').onclick = () => copy(ctx, params.text);
  root.querySelector('#back').onclick = () => ctx.go('pedidos');
}
