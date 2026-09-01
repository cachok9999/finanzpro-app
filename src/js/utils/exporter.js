// Exporter for CSV, JSON and Backup management
export function exportToCSV(transactions, categories, accounts) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  const headers = ['ID', 'Fecha', 'Tipo', 'Monto', 'Categoría', 'Cuenta', 'Comercio / Beneficiario', 'Notas', 'Etiquetas', 'Recurrente'];
  
  const rows = transactions.map(t => {
    return [
      `"${t.id}"`,
      `"${t.date ? t.date.split('T')[0] : ''}"`,
      `"${t.type === 'income' ? 'Ingreso' : (t.type === 'expense' ? 'Gasto' : 'Transferencia')}"`,
      t.amount,
      `"${(categoryMap.get(t.categoryId) || 'Sin categoría').replace(/"/g, '""')}"`,
      `"${(accountMap.get(t.accountId) || 'General').replace(/"/g, '""')}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      `"${(t.tags || []).join('; ')}"`,
      `"${t.isRecurring ? 'Sí' : 'No'}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `FinanzPro_Transacciones_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportFullBackupJSON(stateData) {
  const jsonContent = JSON.stringify(stateData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `FinanzPro_Backup_${new Date().toISOString().slice(0, 10)}.json`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
