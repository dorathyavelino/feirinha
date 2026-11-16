// Tela Produtos: cadastrar, editar e remover.
import { esc } from '../html.js';
import { formatBRL, parsePriceBRL } from '../money.js';
import { addProduct, updateProduct, removeProduct } from '../products.js';

// Valor em centavos -> texto para o campo de preço ("3,50").
const priceInput = (cents) => (cents / 100).toFixed(2).replace('.', ',');

export function render(root, ctx, params) {
  const { products } = ctx.state;
  const editing = params.editId ? products.find((p) => p.id === params.editId) : null;

  root.innerHTML = `
    <h1>Produtos</h1>
    <form id="form" autocomplete="off">
      <h2>${editing ? 'Editar produto' : 'Novo produto'}</h2>
      <label for="pname">Nome</label>
      <input id="pname" type="text" autocapitalize="sentences" value="${esc(editing?.name ?? '')}" placeholder="Ex.: Brigadeiro">
      <label for="pprice">Preço</label>
      <input id="pprice" type="text" inputmode="decimal" value="${editing ? priceInput(editing.priceCents) : ''}" placeholder="Ex.: 3,50">
      <p class="error" id="err"></p>
      ${editing ? `
        <div class="row2">
          <button type="submit" class="btn">Salvar</button>
          <button type="button" class="btn danger" id="remove">Remover</button>
        </div>
        <button type="button" class="btn link" id="cancelEdit">Cancelar edição</button>`
      : '<button type="submit" class="btn">Adicionar produto</button>'}
    </form>

    <h2>Cadastrados (${products.length})</h2>
    <div class="plist">
      ${products.length === 0 ? '<p class="empty">Nenhum produto ainda.</p>' : products.map((p) => `
        <button type="button" class="prod" data-id="${p.id}">
          <span class="name">${esc(p.name)}</span><span class="price">${formatBRL(p.priceCents)}</span>
        </button>`).join('')}
    </div>
    <p class="muted">Toque num produto para editar. A ordem aqui é a mesma da tela Vender.</p>
  `;

  const err = root.querySelector('#err');

  root.querySelector('#form').onsubmit = (e) => {
    e.preventDefault();
    const name = root.querySelector('#pname').value;
    const priceCents = parsePriceBRL(root.querySelector('#pprice').value);
    if (priceCents == null) {
      err.textContent = 'Informe um preço válido, ex.: 3,50';
      return;
    }
    try {
      ctx.update((s) => (editing ? updateProduct(s, editing.id, { name, priceCents }) : addProduct(s, { name, priceCents })), { silent: true });
      ctx.toast(editing ? 'Produto salvo!' : 'Produto adicionado!');
      ctx.go('produtos');
      if (!editing) root.querySelector('#pname').focus();
    } catch (ex) {
      err.textContent = ex.message;
    }
  };

  root.querySelector('#remove')?.addEventListener('click', () => {
    if (!confirm(`Remover ${editing.name}? Os pedidos já feitos não mudam.`)) return;
    ctx.update((s) => removeProduct(s, editing.id), { silent: true });
    ctx.go('produtos');
  });
  root.querySelector('#cancelEdit')?.addEventListener('click', () => ctx.go('produtos'));

  for (const b of root.querySelectorAll('.plist [data-id]')) {
    b.onclick = () => ctx.go('produtos', { editId: b.dataset.id });
  }
}
