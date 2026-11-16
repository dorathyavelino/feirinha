# App da Feirinha — Documento de design

Data: 2026-11-16

## Para que serve e por quê

Duas pessoas vão vender numa feirinha no fim de semana. Uma pessoa atende o cliente e monta o pedido no celular. A outra recebe o pagamento. Hoje não existe nada, e o app precisa estar pronto para este fim de semana.

O app tem dois trabalhos:

1. **Montar o pedido e avisar quem cobra.** A pessoa que atende monta o pedido e gera uma mensagem pronta, que é enviada por WhatsApp para a pessoa da cobrança. A mensagem traz o nome do cliente, os itens com preço e subtotal, a forma de pagamento e o total.
2. **Registrar as vendas.** No fim do dia, o app mostra quanto vendeu de cada produto, quantos pedidos houve por forma de pagamento e o total vendido.

O que conta como sucesso: montar um pedido e mandar a mensagem leva poucos segundos com o cliente na frente, e no fim do dia os números batem.

## Quem usa

- **Quem atende:** é a única pessoa que usa o app, num celular, com a internet do próprio aparelho.
- **Quem cobra:** só recebe as mensagens no WhatsApp e não usa o app.

## Objetivos

- Cadastrar cerca de 15 produtos, cada um com nome e preço fixo. Não há tamanhos nem variações.
- Montar um pedido com nome do cliente, quantidade de cada produto e forma de pagamento.
- Gerar a mensagem do pedido e enviar pelo WhatsApp ou copiar.
- Ver a lista de pedidos do dia, alterar um pedido (adicionar, tirar ou trocar itens, trocar a forma de pagamento) ou cancelar.
- Ao alterar ou cancelar, gerar uma mensagem de aviso para quem cobra.
- Ver o resumo do dia.
- Funcionar sem internet. A internet só é necessária para enviar a mensagem no WhatsApp.

## Fora do escopo

- Login, contas ou várias pessoas usando o app ao mesmo tempo.
- Sincronizar dados entre celulares ou com um servidor.
- Receber pagamento dentro do app ou integrar com maquininha ou Pix.
- Controle de estoque.
- Produtos com variação de tamanho ou sabor.

## O que faria isso ser um fracasso, mesmo funcionando

- Perder as vendas do dia porque o app fechou, o celular bloqueou ou o sinal caiu.
- Um fluxo de pedido lento ou cheio de passos com o cliente esperando.
- Uma mensagem confusa, que faça quem cobra cobrar o valor errado, principalmente depois de uma alteração.
- Cancelar um pedido sem querer.

## Telas (confirmadas pelos rascunhos)

Há quatro abas fixas na parte de baixo ou de cima da tela: **Vender · Pedidos · Produtos · Resumo**. O nome "Vender" foi escolhido para não se confundir com "Pedidos".

### Vender
- Campo para o nome do cliente.
- Lista com todos os produtos, cada um com nome, preço e botões − e + com a quantidade no meio.
- Escolha da forma de pagamento: **Crédito, Débito, Pix, Dinheiro**.
- O total aparece na tela e se atualiza a cada toque.
- Botão **Gerar mensagem**, que leva à tela da mensagem pronta.

### Mensagem pronta
- Mostra o texto da mensagem.
- Botão **Enviar no WhatsApp**, que abre o WhatsApp com o texto já preenchido.
- Botão **Copiar mensagem**.
- Botão **Voltar e corrigir**, que volta para a tela Vender com tudo preenchido. Ali dá para corrigir à vontade, sem gerar mensagem de "ALTERADO".
- Botão **Novo pedido**, que limpa a tela Vender.

**Quando o pedido passa a valer** *(minha decisão)*: na primeira vez que se toca em **Enviar no WhatsApp** ou **Copiar mensagem**. Nesse momento o pedido é salvo, recebe o número e passa a contar no resumo. Se o cliente desistir antes disso, nada fica registrado. Depois que o pedido vale, qualquer mudança é feita pela aba Pedidos e gera a mensagem de "ALTERADO".

Formato da mensagem do pedido:

```
Pedido #7 – Maria
2x Brigadeiro (R$ 3,00) = R$ 6,00
1x Bolo de pote (R$ 10,00) = R$ 10,00
Pagamento: Crédito
TOTAL: R$ 16,00
```

"Subtotal" é a quantidade multiplicada pelo preço de cada item. Os valores seguem o padrão brasileiro (R$ 1.240,00).

### Pedidos
- Lista dos pedidos do dia, do mais recente para o mais antigo. Cada pedido mostra número, nome, total, forma de pagamento e horário.
- O pedido alterado ganha a etiqueta "alterado". O pedido cancelado aparece riscado, com a etiqueta "cancelado".
- Ao tocar num pedido, ele abre na mesma tela de montar pedido, já preenchido. Ali há dois botões: **Salvar e gerar mensagem** e **Cancelar pedido**. O cancelamento pede confirmação ("Tem certeza?").

Mensagem de pedido alterado:

```
⚠️ PEDIDO #7 ALTERADO – Maria
2x Brigadeiro (R$ 3,00) = R$ 6,00
1x Bolo de pote (R$ 10,00) = R$ 10,00
1x Cookie (R$ 6,00) = R$ 6,00
Pagamento: Crédito
NOVO TOTAL: R$ 22,00
(antes: R$ 16,00)
```

Mensagem de pedido cancelado:

```
❌ PEDIDO #6 CANCELADO – Pedro
Total que era: R$ 9,00
```

Essas duas mensagens também podem ser enviadas no WhatsApp ou copiadas.

### Produtos
- Cadastrar, editar e remover produtos, cada um com nome e preço.
- Os produtos são cadastrados antes da feira.
- Mudar o preço de um produto não altera os pedidos já feitos, que guardam o preço da hora da venda. *(Minha decisão.)*
- Remover um produto não apaga esse produto dos pedidos antigos nem do resumo. *(Minha decisão.)*

### Resumo
- Separado por data, mostrando o dia escolhido (por exemplo, sábado ou domingo). Isso permite reaproveitar o app em feiras futuras. *(Minha decisão.)*
- Botão **Enviar resumo no WhatsApp**, que serve de cópia de segurança, já que os dados ficam só no celular. *(Minha decisão.)*
- Botão **Apagar vendas** para começar uma feira nova do zero, com confirmação dupla. Os produtos continuam cadastrados. *(Minha decisão.)*
- Mostra o total vendido e o número de pedidos.
- Por forma de pagamento: quantidade de pedidos e valor (ex.: "Crédito — 13 · R$ 380,00").
- Por produto: unidades vendidas.
- Pedidos cancelados não entram no resumo. Pedidos alterados entram com os valores mais recentes.

## Decisões de como é feito

- **Tipo de app:** uma página web que abre no navegador do celular e pode ser adicionada à tela inicial. Funciona sem internet depois do primeiro acesso. *(Minha escolha; foi pedido que funcionasse sem sinal.)*
- **Onde ficam os dados:** no próprio celular. Nada vai para um servidor. *(Minha escolha.)*
- **Celular:** é um iPhone, usado com o navegador Chrome. No iPhone, todo navegador funciona por baixo como o Safari, então valem as regras do Safari:
  - Um app adicionado à tela inicial guarda os dados separados dos dados do navegador. Por isso o app deve ser usado **sempre pelo ícone da tela inicial**, inclusive na hora de cadastrar os produtos. O app deve dizer isso numa tela de boas-vindas quando for aberto pelo navegador, e não pelo ícone.
  - O iPhone pode apagar os dados de sites que ficam muito tempo sem uso. Apps abertos pelo ícone da tela inicial não sofrem com isso. Por esse motivo, o envio do resumo pelo WhatsApp funciona como cópia de segurança.
  - Tudo precisa ser testado num iPhone de verdade antes da feira: funcionar sem sinal, abrir o WhatsApp com o texto pronto e copiar a mensagem.
- **Instalação:** abrir o link no Chrome, tocar em Compartilhar e depois em "Adicionar à Tela de Início", abrir pelo ícone e só então cadastrar os produtos. Quem constrói escreve esse passo a passo em português, com poucos passos.
- **Hospedagem:** GitHub Pages, na conta de GitHub que já existe. *(Proposta minha, aceita.)* Quem publica sou eu, com a autorização que você deu. O repositório fica público, porque é o que o GitHub Pages gratuito exige. Ele só contém o código do app: produtos e vendas ficam no celular e nunca vão para o GitHub.
- **Envio no WhatsApp:** o app abre o WhatsApp com o texto pronto e a pessoa escolhe o contato. *(Minha escolha.)*
- **Numeração dos pedidos:** cada pedido recebe um número para diferenciar clientes com o mesmo nome. *(Suposição minha, confirmada.)* A numeração continua de sábado para domingo, para que nenhum número se repita no fim de semana, e só volta a 1 quando se usa **Apagar vendas**. *(Minha decisão.)*
- **Pedidos de outro dia:** a aba Pedidos mostra o dia de hoje por padrão, mas permite ver e alterar os pedidos de outros dias. *(Minha decisão.)*

## O que fica a cargo de quem constrói

- Tecnologia, estrutura de arquivos e a forma de guardar os dados no celular, desde que nada se perca ao fechar o navegador ou bloquear a tela.
- O visual, que deve ser simples, com botões grandes para tocar com o dedo e boa leitura no sol.
- Se as abas ficam em cima ou embaixo da tela.
- Pequenos detalhes de texto e de comportamento que não mudem o fluxo descrito acima.
