export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const day = parts[2];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  return `${day} de ${months[monthIndex]}, ${year}`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function sortByPopularity<T extends { id: string; date?: string; lastUpdated?: string }>(
  items: T[],
  countMap: Record<string, number>
): T[] {
  return [...items].sort((a, b) => {
    const countA = countMap[a.id] || 0;
    const countB = countMap[b.id] || 0;
    if (countB !== countA) return countB - countA;
    
    const timeA = new Date(a.date || a.lastUpdated || 0).getTime();
    const timeB = new Date(b.date || b.lastUpdated || 0).getTime();
    return timeB - timeA;
  });
}

export function getSearchSnippet(contentHtml: string, query: string): string {
  if (!query) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentHtml;
  
  // Search in code blocks first
  const codeContainers = Array.from(tempDiv.querySelectorAll('.code-container pre code, pre code, code'));
  for (const codeEl of codeContainers) {
    const text = codeEl.textContent || '';
    const idx = text.toLowerCase().indexOf(query);
    if (idx !== -1) {
      const lines = text.split('\n');
      const matchingLine = lines.find(line => line.toLowerCase().includes(query));
      if (matchingLine) {
        const lineIdx = matchingLine.toLowerCase().indexOf(query);
        const before = matchingLine.substring(0, lineIdx);
        const match = matchingLine.substring(lineIdx, lineIdx + query.length);
        const after = matchingLine.substring(lineIdx + query.length);
        
        return `
          <div class="code-container" style="margin-top: 8px; border: 1px solid var(--accent); background-color: var(--bg-secondary);">
            <div class="code-header" style="padding: 2px 8px; font-size:10px;"><span>Trecho de código correspondente</span></div>
            <pre style="margin:0; padding:8px 12px;"><code style="font-size: 11px; white-space: pre-wrap;">${escapeHtml(before)}<mark style="background-color: #ffd166; color: #000; border-radius: 2px; padding: 0 2px; font-weight:600;">${escapeHtml(match)}</mark>${escapeHtml(after)}</code></pre>
          </div>
        `;
      }
    }
  }
  
  // Search in body texts (paragraphs, headers, lists)
  const elements = Array.from(tempDiv.querySelectorAll('p, h3, h4, li'));
  for (const el of elements) {
    const text = el.textContent || '';
    const idx = text.toLowerCase().indexOf(query);
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(text.length, idx + query.length + 80);
      let snippet = text.substring(start, end).replace(/\s+/g, ' ');
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      const snipIdx = snippet.toLowerCase().indexOf(query);
      if (snipIdx !== -1) {
        const before = snippet.substring(0, snipIdx);
        const match = snippet.substring(snipIdx, snipIdx + query.length);
        const after = snippet.substring(snipIdx + query.length);
        
        return `
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">
            ${escapeHtml(before)}<mark style="background-color: #ffd166; color: #000; border-radius: 2px; padding: 0 2px; font-weight:600;">${escapeHtml(match)}</mark>${escapeHtml(after)}
          </p>
        `;
      }
    }
  }
  
  return '';
}
