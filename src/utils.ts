export function normalizarTexto(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

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
  
  const normQuery = normalizarTexto(query);
  if (!normQuery) return '';

  // Search in code blocks first
  const codeContainers = Array.from(tempDiv.querySelectorAll('.code-container pre code, pre code, code'));
  for (const codeEl of codeContainers) {
    const text = codeEl.textContent || '';
    const normText = normalizarTexto(text);
    const idx = normText.indexOf(normQuery);
    if (idx !== -1) {
      const lines = text.split('\n');
      const matchingLine = lines.find(line => normalizarTexto(line).includes(normQuery));
      if (matchingLine) {
        let matchStart = matchingLine.toLowerCase().indexOf(query.toLowerCase());
        let matchLength = query.length;
        if (matchStart === -1) {
          for (let i = 0; i <= matchingLine.length - query.length + 5; i++) {
            for (let len = Math.max(1, query.length - 2); len <= query.length + 2; len++) {
              if (i + len <= matchingLine.length) {
                const sub = matchingLine.substring(i, i + len);
                if (normalizarTexto(sub).includes(normQuery)) {
                  matchStart = i;
                  matchLength = len;
                  break;
                }
              }
            }
            if (matchStart !== -1) break;
          }
        }
        if (matchStart === -1) {
          matchStart = 0;
          matchLength = query.length;
        }

        const before = matchingLine.substring(0, matchStart);
        const match = matchingLine.substring(matchStart, matchStart + matchLength);
        const after = matchingLine.substring(matchStart + matchLength);
        
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
    const normText = normalizarTexto(text);
    const idx = normText.indexOf(normQuery);
    if (idx !== -1) {
      let matchStart = text.toLowerCase().indexOf(query.toLowerCase());
      let matchLength = query.length;
      if (matchStart === -1) {
        for (let i = 0; i <= text.length - query.length + 5; i++) {
          for (let len = Math.max(1, query.length - 2); len <= query.length + 2; len++) {
            if (i + len <= text.length) {
              const sub = text.substring(i, i + len);
              if (normalizarTexto(sub).includes(normQuery)) {
                matchStart = i;
                matchLength = len;
                break;
              }
            }
          }
          if (matchStart !== -1) break;
        }
      }
      if (matchStart === -1) {
        matchStart = idx;
        matchLength = query.length;
      }

      const start = Math.max(0, matchStart - 60);
      const end = Math.min(text.length, matchStart + matchLength + 80);
      let snippet = text.substring(start, end).replace(/\s+/g, ' ');
      
      let snipMatchStart = snippet.toLowerCase().indexOf(query.toLowerCase());
      let snipMatchLength = query.length;
      if (snipMatchStart === -1) {
        for (let i = 0; i <= snippet.length - query.length + 5; i++) {
          for (let len = Math.max(1, query.length - 2); len <= query.length + 2; len++) {
            if (i + len <= snippet.length) {
              const sub = snippet.substring(i, i + len);
              if (normalizarTexto(sub).includes(normQuery)) {
                snipMatchStart = i;
                snipMatchLength = len;
                break;
              }
            }
          }
          if (snipMatchStart !== -1) break;
        }
      }
      if (snipMatchStart === -1) {
        snipMatchStart = 0;
        snipMatchLength = query.length;
      }

      let before = snippet.substring(0, snipMatchStart);
      const match = snippet.substring(snipMatchStart, snipMatchStart + snipMatchLength);
      let after = snippet.substring(snipMatchStart + snipMatchLength);
      
      if (start > 0) before = '...' + before;
      if (end < text.length) after = after + '...';
      
      return `
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">
          ${escapeHtml(before)}<mark style="background-color: #ffd166; color: #000; border-radius: 2px; padding: 0 2px; font-weight:600;">${escapeHtml(match)}</mark>${escapeHtml(after)}
        </p>
      `;
    }
  }
  
  return '';
}
