// Tela Vender: monta o pedido (e, com editOrderId, altera um pedido existente).
import { esc } from '../html.js';
import { formatBRL } from '../money.js';
import { PAYMENTS, itemsTotal, validateDraft, alterOrder, cancelOrder, refreshDraftPrices } from '../orders.js';
import { orderMessage } from '../messages.js';

const emptyDraft = () => ({ customer: '', payment: null, items: [] });

// Linhas da tela: produtos do cadastro, mais itens do pedido que saíram do cadastro.
function rows(products, draft) {
  const inDraft = new Map(draft.items.map((it) => [it.productId, it]));
  const list = products.map((p) => {
    const it = inDraft.get(p.id);
    return { productId: p.id, name: it?.name ?? p.name, priceCents: it?.priceCents ?? p.priceCents, qty: it?.qty ?? 0 };
  });
  const known = new Set(products.map((p) => p.id));
  for (const it of draft.items) if (!known.has(it.productId)) list.push({ ...it });
  return list;
}

function setQty(draft, row, qty) {
  const same = (it) => it.productId === row.productId;
  if (qty <= 0) return { ...draft, items: draft.items.filter((it) => !same(it)) };
  if (draft.items.some(same)) {
    return { ...draft, items: draft.items.map((it) => (same(it) ? { ...it, qty } : it)) };
  }
  const item = { productId: row.productId, name: row.name, priceCents: row.priceCents, qty };
  return { ...draft, items: [...draft.items, item] };
}

export function render(root, ctx, params) {
  const editId = params.editOrderId ?? null;
  const editing = editId && ctx.state.editing?.orderId === editId ? ctx.state.editing : null;
  if (editId && !editing) return ctx.go('pedidos');

  if (!editing) {
    const co = ctx.state.checkout;
    if (!co || co.orderId) {
      ctx.update((s) => ({ ...s, checkout: { draft: emptyDraft(), orderId: null } }), { silent: true });
    } else {
      const fresh = refreshDraftPrices(co.draft, ctx.state.products);
      if (fresh !== co.draft) ctx.update((s) => ({ ...s, checkout: { ...s.checkout, draft: fresh } }), { silent: true });
    }
  }

  const getDraft = () => (editing ? ctx.state.editing.draft : ctx.state.checkout.draft);
  const setDraft = (fn, opts) =>
    ctx.update(
      (s) => (editing
        ? { ...s, editing: { ...s.editing, draft: fn(s.editing.draft) } }
        : { ...s, checkout: { ...s.checkout, draft: fn(s.checkout.draft) } }),
      opts,
    );

  const draft = getDraft();
  const list = rows(ctx.state.products, draft);
  const editedOrder = editing ? ctx.state.orders.find((o) => o.id === editId) : null;

  if (list.length === 0) {
    root.innerHTML = `
      <h1>Vender</h1>
      <p class="empty">Cadastre seus produtos na aba Produtos.</p>
      <button type="button" class="btn" data-act="go-produtos">Ir para Produtos</button>`;
    root.querySelector('[data-act=go-produtos]').onclick = () => ctx.go('produtos');
    return;
  }

  const title = editing
    ? `Alterando #${editedOrder.number}${editedOrder.customer ? ' – ' + esc(editedOrder.customer) : ''}`
    : 'Novo pedido';

  root.innerHTML = `
    <h1>${title}</h1>
    <label for="customer">Nome do cliente</label>
    <input id="customer" type="text" autocomplete="off" autocapitalize="words" value="${esc(draft.customer)}" placeholder="Ex.: Maria">

    <h2>Produtos</h2>
    <div class="list">
      ${list.map((r, i) => `
        <div class="prod ${r.qty ? 'has' : ''}">
          <div><div class="name">${esc(r.name)}</div><div class="price">${formatBRL(r.priceCents)}</div></div>
          <div class="qty">
            <button type="button" data-i="${i}" data-d="-1" aria-label="Menos ${esc(r.name)}">−</button>
            <output>${r.qty}</output>
            <button type="button" class="plus" data-i="${i}" data-d="1" aria-label="Mais ${esc(r.name)}">+</button>
          </div>
        </div>`).join('')}
    </div>

    <h2>Pagamento</h2>
    <div class="pay">
      ${PAYMENTS.map((p) => `<button type="button" data-pay="${p.key}" class="${draft.payment === p.key ? 'on' : ''}">${p.label}</button>`).join('')}
    </div>

    <div class="total"><span>Total</span><span class="val">${formatBRL(itemsTotal(draft.items))}</span></div>
    <p class="error" id="err"></p>
    <button type="button" class="btn" id="go">${editing ? 'Salvar e gerar mensagem' : 'Gerar mensagem'}</button>
    ${editing ? '<button type="button" class="btn danger" id="cancel">Cancelar pedido</button>' : ''}
    ${editing ? '<button type="button" class="btn gray" id="resend">Reenviar última mensagem</button>' : ''}
    ${editing ? '<button type="button" class="btn link" id="back">Voltar sem salvar</button>' : ''}
  `;

  root.querySelector('#customer').addEventListener('input', (e) => {
    const v = e.target.value;
    setDraft((d) => ({ ...d, customer: v }), { silent: true });
  });

  for (const b of root.querySelectorAll('.qty button')) {
    b.onclick = () => {
      const r = list[Number(b.dataset.i)];
      setDraft((d) => setQty(d, r, Math.max(0, r.qty + Number(b.dataset.d))));
    };
  }

  for (const b of root.querySelectorAll('[data-pay]')) {
    b.onclick = () => setDraft((d) => ({ ...d, payment: b.dataset.pay }));
  }

  root.querySelector('#go').onclick = () => {
    const err = validateDraft(getDraft());
    if (err) {
      root.querySelector('#err').textContent = err;
      return;
    }
    if (editing) return onSaveEdit(ctx, editId);
    ctx.go('mensagem');
  };

  if (editing) {
    root.querySelector('#cancel').onclick = () => onCancelOrder(ctx, editId);
    root.querySelector('#resend').onclick = () => {
      ctx.update((s) => ({ ...s, editing: null }), { silent: true });
      ctx.go('mensagem', { tab: 'pedidos', title: `Pedido #${editedOrder.number}`, text: editedOrder.lastMessage ?? orderMessage(editedOrder) });
    };
    root.querySelector('#back').onclick = () => {
      ctx.update((s) => ({ ...s, editing: null }), { silent: true });
      ctx.go('pedidos');
    };
  }
}

function onSaveEdit(ctx, orderId) {
  try {
    let result;
    ctx.update((s) => {
      result = alterOrder(s, orderId, s.editing.draft);
      return { ...result.state, editing: null };
    }, { silent: true });
    ctx.go('mensagem', {
      tab: 'pedidos',
      title: 'Pedido alterado',
      text: result.order.lastMessage,
    });
  } catch (e) {
    ctx.toast(e.message);
  }
}

function onCancelOrder(ctx, orderId) {
  const o = ctx.state.orders.find((x) => x.id === orderId);
  const who = o.customer ? ` de ${o.customer}` : '';
  if (!confirm(`Cancelar o pedido #${o.number}${who}? Isso não pode ser desfeito.`)) return;
  try {
    let result;
    ctx.update((s) => {
      result = cancelOrder(s, orderId);
      return { ...result.state, editing: null };
    }, { silent: true });
    ctx.go('mensagem', { tab: 'pedidos', title: 'Pedido cancelado', text: result.order.lastMessage });
  } catch (e) {
    ctx.toast(e.message);
  }
}
