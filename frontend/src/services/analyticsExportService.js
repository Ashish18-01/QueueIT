const escapeCsvValue = (value) => {
  if (value == null) return '';
  const normalized = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n]/.test(normalized) ? `"${normalized.replaceAll('"', '""')}"` : normalized;
};

const exporters = {
  csv: ({ rows = [], columns = [] }) => {
    const headers = columns.map((column) => column.header || column.key);
    const body = rows.map((row) => columns.map((column) => escapeCsvValue(column.value ? column.value(row) : row[column.key])).join(','));
    return [headers.map(escapeCsvValue).join(','), ...body].join('\n');
  },
};

export const analyticsExportService = {
  export({ format = 'csv', filename = 'analytics-report', rows = [], columns = [] }) {
    const exporter = exporters[format];
    if (!exporter) throw new Error(`Unsupported export format: ${format}`);
    const content = exporter({ rows, columns });
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.URL?.createObjectURL) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${filename}.${format}`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    }
    return content;
  },
  register(format, exporter) { exporters[format] = exporter; },
};
