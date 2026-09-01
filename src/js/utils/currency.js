// Currency formatting and math utilities
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'Dólar Estadounidense (USD)', locale: 'en-US', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'es-ES', decimals: 2 },
  MXN: { code: 'MXN', symbol: '$', name: 'Peso Mexicano (MXN)', locale: 'es-MX', decimals: 2 },
  ARS: { code: 'ARS', symbol: '$', name: 'Peso Argentino (ARS)', locale: 'es-AR', decimals: 2 },
  COP: { code: 'COP', symbol: '$', name: 'Peso Colombiano (COP)', locale: 'es-CO', decimals: 0 },
  CLP: { code: 'CLP', symbol: '$', name: 'Peso Chileno (CLP)', locale: 'es-CL', decimals: 0 },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (PEN)', locale: 'es-PE', decimals: 2 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Real Brasileño (BRL)', locale: 'pt-BR', decimals: 2 }
};

export function formatMoney(amount, currencyCode = 'USD', showDecimals = true) {
  const cur = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  const fractionDigits = (showDecimals && cur.decimals > 0) ? cur.decimals : 0;
  
  try {
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: cur.code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(num);
  } catch (e) {
    return `${cur.symbol} ${num.toFixed(fractionDigits)}`;
  }
}

export function formatCompactNumber(amount, currencyCode = 'USD') {
  const cur = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  if (Math.abs(num) >= 1_000_000) {
    return `${cur.symbol}${(num / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${cur.symbol}${(num / 1_000).toFixed(1)}k`;
  }
  return formatMoney(num, currencyCode, false);
}

export function formatDate(dateString, formatType = 'medium') {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (formatType === 'short') {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
  if (formatType === 'time') {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  if (formatType === 'relative') {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Hoy';
    if (isYesterday) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
