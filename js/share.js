// Enviar para o WhatsApp e copiar texto.

export function openWhatsApp(text) {
  const url = 'https://wa.me/?text=' + encodeURIComponent(text);
  const win = window.open(url, '_blank');
  if (!win) window.location.href = url;
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
