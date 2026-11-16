// Enviar para o WhatsApp e copiar texto.

// whatsapp:// abre o app direto, sem carregar página na internet;
// o WhatsApp guarda a mensagem e envia quando o sinal voltar.
export function whatsAppUrl(text) {
  return 'whatsapp://send?text=' + encodeURIComponent(text);
}

export function openWhatsApp(text) {
  window.location.href = whatsAppUrl(text);
}

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* tenta o jeito antigo abaixo */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
