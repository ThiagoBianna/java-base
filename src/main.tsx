import { ARTICLES, SERIES, CATEGORY_COLORS, SNIPPETS_DATA } from "./data/articles";
import { state, saveStateToStorage, loadStateFromStorage } from "./state";
import { formatDate, escapeHtml, debounce, sortByPopularity, getSearchSnippet } from "./utils";
import { Article, Series, State } from "./types";

export function normalizarTexto(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Expose functions globally for HTML inline onclick event handlers
declare global {
  interface Window {
    state: State;
    selectCategory: (cat: string) => void;
    clearSearch: () => void;
    openArticle: (id: string) => void;
    closeArticle: () => void;
    goHome: () => void;
    toggleTheme: () => void;
    toggleShortcutsModal: () => void;
    clearRecentHistory: () => void;
    openCheatsheet: (category: string) => void;
    openDrawer: () => void;
    closeDrawer: () => void;
    openSnippets: () => void;
    renderHomeSeries: () => void;
    updateWelcomeStats: () => void;
  }
}

window.state = state;

/* --- ACTIVE VIEW ROUTING --- */
function renderActiveView() {
  if (state.activeView === 'cheatsheet') {
    window.openCheatsheet(state.activeCategory || 'Todos');
  } else if (state.activeView === 'snippets') {
    window.openSnippets();
  } else {
    renderArticles();
  }
}

/* --- CENTRALIZED SEARCH HANDLER --- */
function setupSearch() {
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const searchClearBtn = document.getElementById('search-clear-btn');
  
  const handleSearchInput = (value: string) => {
    state.searchQuery = value;
    
    if (searchInput && searchInput.value !== value) {
      searchInput.value = value;
    }
    
    // Toggle search clear button
    if (state.searchQuery.trim() !== '') {
      if (searchClearBtn) searchClearBtn.classList.remove('hidden');
      // If reading an article and start searching, close the article to show results
      if (state.selectedArticleId !== null) {
        window.closeArticle();
      }
    } else {
      if (searchClearBtn) searchClearBtn.classList.add('hidden');
    }
    
    renderActiveView();
  };
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      handleSearchInput(target.value);
    });
  }
}

/* --- CATEGORY SELECTION --- */
window.selectCategory = function(cat: string) {
  state.activeCategory = cat;
  state.selectedArticleId = null;
  state.searchQuery = '';
  
  // Clear search field
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const searchClearBtn = document.getElementById('search-clear-btn');
  if (searchInput) {
    searchInput.value = '';
  }
  if (searchClearBtn) {
    searchClearBtn.classList.add('hidden');
  }
  
  // Reset screen view back to home list
  const articleView = document.getElementById('article-view');
  const homeView = document.getElementById('home-view');
  const mobileCategories = document.getElementById('mobile-categories');
  const cheatsheetView = document.getElementById('cheatsheet-view');
  const snippetsView = document.getElementById('snippets-view');
  
  if (articleView) articleView.classList.add('hidden');
  if (cheatsheetView) cheatsheetView.classList.add('hidden');
  if (snippetsView) snippetsView.classList.add('hidden');
  if (homeView) homeView.classList.remove('hidden');
  if (mobileCategories) mobileCategories.classList.remove('hidden');
  
  // Update state styling of cheatsheet button
  const cheatsheetsBtn = document.getElementById('nav-btn-cheatsheets');
  if (cheatsheetsBtn) {
    cheatsheetsBtn.classList.remove('active');
  }
  
  renderSidebar();
  renderMobileCategories();
  renderArticles();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* --- CLEAR SEARCH BAR --- */
window.clearSearch = function() {
  state.searchQuery = '';
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const searchClearBtn = document.getElementById('search-clear-btn');
  
  if (searchInput) {
    searchInput.value = '';
  }
  if (searchClearBtn) {
    searchClearBtn.classList.add('hidden');
  }
  renderActiveView();
};

/* --- RENDER SIDEBAR CATEGORIES (DESKTOP) --- */
let coreExpanded = false;
let advExpanded = false;
let frameworksExpanded = false;
let seExpanded = false;

function renderSidebar() {
  const list = document.getElementById('sidebar-categories');
  if (!list) return;
  
  list.innerHTML = '';
  
  // Helper to construct category items
  const createCatItem = (cat: string) => {
    const li = document.createElement('li');
    li.className = `category-item ${state.activeCategory === cat ? 'active' : ''}`;
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.position = 'relative';
    
    li.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${cat}</span>
      </div>
      <button class="cheatsheet-link" title="Ver Dicas" style="background: none; border: none; padding: 2px 6px; font-size: 11px; font-weight: 600; color: var(--accent); cursor: pointer; opacity: 0; transition: opacity 0.2s; white-space: nowrap;" onclick="event.stopPropagation(); window.openCheatsheet('${cat}')">
        Dicas ⚡
      </button>
    `;
    
    li.addEventListener('mouseenter', () => {
      const btn = li.querySelector('.cheatsheet-link') as HTMLElement | null;
      if (btn) btn.style.opacity = '1';
    });
    li.addEventListener('mouseleave', () => {
      const btn = li.querySelector('.cheatsheet-link') as HTMLElement | null;
      if (btn) btn.style.opacity = '0';
    });
    
    li.onclick = () => window.selectCategory(cat);
    return li;
  };

  // Group 1: Core Concepts
  const coreHeaderWrapper = document.createElement('div');
  coreHeaderWrapper.style.display = 'flex';
  coreHeaderWrapper.style.justifyContent = 'space-between';
  coreHeaderWrapper.style.alignItems = 'center';
  coreHeaderWrapper.style.marginTop = '24px';
  coreHeaderWrapper.style.marginBottom = '8px';
  coreHeaderWrapper.style.cursor = 'pointer';
  coreHeaderWrapper.style.userSelect = 'none';
  
  const coreHeader = document.createElement('p');
  coreHeader.className = 'menu-section-title';
  coreHeader.style.margin = '0';
  coreHeader.style.marginTop = '0';
  coreHeader.style.transition = 'color 0.2s ease';
  coreHeader.textContent = 'Core Concepts';
  coreHeaderWrapper.appendChild(coreHeader);
  
  const coreToggleBtn = document.createElement('button');
  coreToggleBtn.className = 'expand-toggle-btn';
  coreToggleBtn.style.background = 'none';
  coreToggleBtn.style.border = 'none';
  coreToggleBtn.style.cursor = 'pointer';
  coreToggleBtn.style.color = 'var(--text-tertiary)';
  coreToggleBtn.style.display = 'flex';
  coreToggleBtn.style.alignItems = 'center';
  coreToggleBtn.style.justifyContent = 'center';
  coreToggleBtn.style.padding = '4px';
  coreToggleBtn.style.borderRadius = '4px';
  coreToggleBtn.style.transition = 'color 0.2s, background-color 0.2s';
  coreToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${coreExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  
  coreToggleBtn.onclick = (e) => {
    e.stopPropagation();
    coreExpanded = !coreExpanded;
    renderSidebar();
  };
  coreHeaderWrapper.onclick = () => {
    coreExpanded = !coreExpanded;
    renderSidebar();
  };
  coreHeaderWrapper.addEventListener('mouseenter', () => {
    coreHeader.style.color = 'var(--accent)';
    coreToggleBtn.style.color = 'var(--accent)';
  });
  coreHeaderWrapper.addEventListener('mouseleave', () => {
    coreHeader.style.color = 'var(--text-tertiary)';
    coreToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  coreHeaderWrapper.appendChild(coreToggleBtn);
  list.appendChild(coreHeaderWrapper);

  const coreWrapper = document.createElement('div');
  coreWrapper.className = 'category-group-wrapper';
  coreWrapper.style.overflow = 'hidden';
  coreWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const coreCats = ['Generics', 'Collections', 'OOP'];
  coreCats.forEach(cat => {
    coreWrapper.appendChild(createCatItem(cat));
  });

  if (coreExpanded) {
    coreWrapper.style.maxHeight = '200px';
    coreWrapper.style.opacity = '1';
    coreWrapper.style.marginBottom = '12px';
  } else {
    coreWrapper.style.maxHeight = '0px';
    coreWrapper.style.opacity = '0';
    coreWrapper.style.marginBottom = '0px';
  }
  list.appendChild(coreWrapper);

  // Group 2: Advanced Java
  const advHeaderWrapper = document.createElement('div');
  advHeaderWrapper.style.display = 'flex';
  advHeaderWrapper.style.justifyContent = 'space-between';
  advHeaderWrapper.style.alignItems = 'center';
  advHeaderWrapper.style.marginTop = '12px';
  advHeaderWrapper.style.marginBottom = '8px';
  advHeaderWrapper.style.cursor = 'pointer';
  advHeaderWrapper.style.userSelect = 'none';
  
  const advHeader = document.createElement('p');
  advHeader.className = 'menu-section-title';
  advHeader.style.margin = '0';
  advHeader.style.marginTop = '0';
  advHeader.style.transition = 'color 0.2s ease';
  advHeader.textContent = 'Advanced Java';
  advHeaderWrapper.appendChild(advHeader);
  
  const advToggleBtn = document.createElement('button');
  advToggleBtn.className = 'expand-toggle-btn';
  advToggleBtn.style.background = 'none';
  advToggleBtn.style.border = 'none';
  advToggleBtn.style.cursor = 'pointer';
  advToggleBtn.style.color = 'var(--text-tertiary)';
  advToggleBtn.style.display = 'flex';
  advToggleBtn.style.alignItems = 'center';
  advToggleBtn.style.justifyContent = 'center';
  advToggleBtn.style.padding = '4px';
  advToggleBtn.style.borderRadius = '4px';
  advToggleBtn.style.transition = 'color 0.2s, background-color 0.2s';
  advToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${advExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  
  advToggleBtn.onclick = (e) => {
    e.stopPropagation();
    advExpanded = !advExpanded;
    renderSidebar();
  };
  advHeaderWrapper.onclick = () => {
    advExpanded = !advExpanded;
    renderSidebar();
  };
  advHeaderWrapper.addEventListener('mouseenter', () => {
    advHeader.style.color = 'var(--accent)';
    advToggleBtn.style.color = 'var(--accent)';
  });
  advHeaderWrapper.addEventListener('mouseleave', () => {
    advHeader.style.color = 'var(--text-tertiary)';
    advToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  advHeaderWrapper.appendChild(advToggleBtn);
  list.appendChild(advHeaderWrapper);

  const advWrapper = document.createElement('div');
  advWrapper.className = 'category-group-wrapper';
  advWrapper.style.overflow = 'hidden';
  advWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const advCats = ['Streams', 'Concurrency', 'JVM'];
  advCats.forEach(cat => {
    advWrapper.appendChild(createCatItem(cat));
  });

  if (advExpanded) {
    advWrapper.style.maxHeight = '200px';
    advWrapper.style.opacity = '1';
    advWrapper.style.marginBottom = '12px';
  } else {
    advWrapper.style.maxHeight = '0px';
    advWrapper.style.opacity = '0';
    advWrapper.style.marginBottom = '0px';
  }
  list.appendChild(advWrapper);

  // Group 3: Frameworks & Libs
  const fwHeaderWrapper = document.createElement('div');
  fwHeaderWrapper.style.display = 'flex';
  fwHeaderWrapper.style.justifyContent = 'space-between';
  fwHeaderWrapper.style.alignItems = 'center';
  fwHeaderWrapper.style.marginTop = '12px';
  fwHeaderWrapper.style.marginBottom = '8px';
  fwHeaderWrapper.style.cursor = 'pointer';
  fwHeaderWrapper.style.userSelect = 'none';
  
  const fwHeader = document.createElement('p');
  fwHeader.className = 'menu-section-title';
  fwHeader.style.margin = '0';
  fwHeader.style.marginTop = '0';
  fwHeader.style.transition = 'color 0.2s ease';
  fwHeader.textContent = 'Frameworks & Libs';
  fwHeaderWrapper.appendChild(fwHeader);
  
  const fwToggleBtn = document.createElement('button');
  fwToggleBtn.className = 'expand-toggle-btn';
  fwToggleBtn.style.background = 'none';
  fwToggleBtn.style.border = 'none';
  fwToggleBtn.style.cursor = 'pointer';
  fwToggleBtn.style.color = 'var(--text-tertiary)';
  fwToggleBtn.style.display = 'flex';
  fwToggleBtn.style.alignItems = 'center';
  fwToggleBtn.style.justifyContent = 'center';
  fwToggleBtn.style.padding = '4px';
  fwToggleBtn.style.borderRadius = '4px';
  fwToggleBtn.style.transition = 'color 0.2s, background-color 0.2s';
  fwToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${frameworksExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  
  fwToggleBtn.onclick = (e) => {
    e.stopPropagation();
    frameworksExpanded = !frameworksExpanded;
    renderSidebar();
  };
  fwHeaderWrapper.onclick = () => {
    frameworksExpanded = !frameworksExpanded;
    renderSidebar();
  };
  fwHeaderWrapper.addEventListener('mouseenter', () => {
    fwHeader.style.color = 'var(--accent)';
    fwToggleBtn.style.color = 'var(--accent)';
  });
  fwHeaderWrapper.addEventListener('mouseleave', () => {
    fwHeader.style.color = 'var(--text-tertiary)';
    fwToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  fwHeaderWrapper.appendChild(fwToggleBtn);
  list.appendChild(fwHeaderWrapper);

  const fwWrapper = document.createElement('div');
  fwWrapper.className = 'category-group-wrapper';
  fwWrapper.style.overflow = 'hidden';
  fwWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const fwCats = ['Spring', 'Security'];
  fwCats.forEach(cat => {
    fwWrapper.appendChild(createCatItem(cat));
  });

  if (frameworksExpanded) {
    fwWrapper.style.maxHeight = '150px';
    fwWrapper.style.opacity = '1';
    fwWrapper.style.marginBottom = '12px';
  } else {
    fwWrapper.style.maxHeight = '0px';
    fwWrapper.style.opacity = '0';
    fwWrapper.style.marginBottom = '0px';
  }
  list.appendChild(fwWrapper);

  // Group 4: Software Engineering
  const seHeaderWrapper = document.createElement('div');
  seHeaderWrapper.style.display = 'flex';
  seHeaderWrapper.style.justifyContent = 'space-between';
  seHeaderWrapper.style.alignItems = 'center';
  seHeaderWrapper.style.marginTop = '12px';
  seHeaderWrapper.style.marginBottom = '8px';
  seHeaderWrapper.style.cursor = 'pointer';
  seHeaderWrapper.style.userSelect = 'none';
  
  const seHeader = document.createElement('p');
  seHeader.className = 'menu-section-title';
  seHeader.style.margin = '0';
  seHeader.style.marginTop = '0';
  seHeader.style.transition = 'color 0.2s ease';
  seHeader.textContent = 'Engineering & Quality';
  seHeaderWrapper.appendChild(seHeader);
  
  const seToggleBtn = document.createElement('button');
  seToggleBtn.className = 'expand-toggle-btn';
  seToggleBtn.style.background = 'none';
  seToggleBtn.style.border = 'none';
  seToggleBtn.style.cursor = 'pointer';
  seToggleBtn.style.color = 'var(--text-tertiary)';
  seToggleBtn.style.display = 'flex';
  seToggleBtn.style.alignItems = 'center';
  seToggleBtn.style.justifyContent = 'center';
  seToggleBtn.style.padding = '4px';
  seToggleBtn.style.borderRadius = '4px';
  seToggleBtn.style.transition = 'color 0.2s, background-color 0.2s';
  seToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${seExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  
  seToggleBtn.onclick = (e) => {
    e.stopPropagation();
    seExpanded = !seExpanded;
    renderSidebar();
  };
  seHeaderWrapper.onclick = () => {
    seExpanded = !seExpanded;
    renderSidebar();
  };
  seHeaderWrapper.addEventListener('mouseenter', () => {
    seHeader.style.color = 'var(--accent)';
    seToggleBtn.style.color = 'var(--accent)';
  });
  seHeaderWrapper.addEventListener('mouseleave', () => {
    seHeader.style.color = 'var(--text-tertiary)';
    seToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  seHeaderWrapper.appendChild(seToggleBtn);
  list.appendChild(seHeaderWrapper);

  const seWrapper = document.createElement('div');
  seWrapper.className = 'category-group-wrapper';
  seWrapper.style.overflow = 'hidden';
  seWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const seCats = ['Testing', 'Design Patterns', 'Misc'];
  seCats.forEach(cat => {
    seWrapper.appendChild(createCatItem(cat));
  });

  if (seExpanded) {
    seWrapper.style.maxHeight = '200px';
    seWrapper.style.opacity = '1';
    seWrapper.style.marginBottom = '12px';
  } else {
    seWrapper.style.maxHeight = '0px';
    seWrapper.style.opacity = '0';
    seWrapper.style.marginBottom = '0px';
  }
  list.appendChild(seWrapper);
}

/* --- RENDER MOBILE CATEGORY SCROLLER --- */
function renderMobileCategories() {
  const scroller = document.getElementById('mobile-categories');
  if (!scroller) return;
  
  scroller.innerHTML = '';
  
  // "Todos" button
  const allBtn = document.createElement('button');
  allBtn.className = `mobile-cat-btn ${state.activeCategory === 'Todos' ? 'active' : ''}`;
  allBtn.textContent = `Todos (${ARTICLES.length})`;
  allBtn.onclick = () => window.selectCategory('Todos');
  scroller.appendChild(allBtn);
  
  const cats = ["Collections", "Streams", "Concurrency", "Spring", "OOP", "Generics", "JVM", "Testing", "Design Patterns", "Security", "Misc"];
  cats.forEach(cat => {
    const count = ARTICLES.filter(art => art.category === cat).length;
    const btn = document.createElement('button');
    btn.className = `mobile-cat-btn ${state.activeCategory === cat ? 'active' : ''}`;
    btn.textContent = `${cat} (${count})`;
    btn.onclick = () => window.selectCategory(cat);
    scroller.appendChild(btn);
  });
}

/* --- RENDER ARTICLES LISTING --- */
function renderArticles() {
  const grid = document.getElementById('articles-grid');
  const emptyState = document.getElementById('empty-state');
  const statusBar = document.getElementById('filter-status-bar');
  
  if (!grid || !emptyState || !statusBar) return;
  
  // Sort articles by dynamic popularity counts
  let filtered = sortByPopularity(ARTICLES, state.accessCount.articles);
  
  // Filter by category
  if (state.activeCategory !== 'Todos') {
    filtered = filtered.filter(art => art.category === state.activeCategory);
  }
  
  const query = state.searchQuery.trim().toLowerCase();
  const isSearching = query !== '';
  
  // Toggle hero header elements when on default view
  const banner = document.querySelector('.home-hero-banner') as HTMLElement | null;
  const introCard = document.getElementById('home-intro-card');
  const recentSection = document.getElementById('recent-articles-section');
  const seriesSection = document.getElementById('home-series-section');

  if (state.activeCategory === 'Todos' && !isSearching) {
    if (banner) banner.style.display = 'block';
    if (introCard) introCard.style.display = 'block';
    if (seriesSection) seriesSection.style.display = 'block';
  } else {
    if (banner) banner.style.display = 'none';
    if (introCard) introCard.style.display = 'none';
    if (seriesSection) seriesSection.style.display = 'none';
  }

  if (isSearching) {
    if (recentSection) recentSection.style.display = 'none';
  } else {
    if (recentSection) recentSection.style.display = '';
  }
  
  if (isSearching) {
    filtered = filtered.filter(art => {
      const inTitle = normalizarTexto(art.title).includes(normalizarTexto(query));
      const inSummary = normalizarTexto(art.summary).includes(normalizarTexto(query));
      const inContent = normalizarTexto(art.content).includes(normalizarTexto(query));
      const inTags = art.tags.some(t => normalizarTexto(t).includes(normalizarTexto(query)));
      return inTitle || inSummary || inContent || inTags;
    });
    
    statusBar.innerHTML = `
      <span>Encontrado(s) <strong style="color:var(--text-primary);">${filtered.length}</strong> artigo(s) ${state.activeCategory !== 'Todos' ? `na categoria <strong style="color:var(--text-primary);">${state.activeCategory}</strong>` : ''} para a busca: <strong style="color:var(--accent);">${state.searchQuery}</strong></span>
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        ${state.activeCategory !== 'Todos' ? `<span class="clear-filter-link" onclick="window.openCheatsheet('${state.activeCategory}')" style="color: var(--accent); font-weight: 600;">⚡ Ver Cheatsheet</span>` : ''}
        <span class="clear-filter-link" onclick="window.clearSearch()">Limpar Busca</span>
      </div>
    `;
    
    grid.style.display = 'flex';
    grid.style.flexDirection = 'column';
    grid.style.gap = '16px';
  } else {
    grid.style.display = '';
    grid.style.flexDirection = '';
    grid.style.gap = '';
    
    if (state.activeCategory !== 'Todos') {
      statusBar.innerHTML = `
        <span>Categoria ativa: <strong style="color:var(--text-primary);">${state.activeCategory}</strong> (<strong style="color:var(--accent);">${filtered.length}</strong> artigos)</span>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <span class="clear-filter-link" onclick="window.openCheatsheet('${state.activeCategory}')" style="color: var(--accent); font-weight: 600;">⚡ Ver Dicas</span>
          <span class="clear-filter-link" onclick="window.selectCategory('Todos')">Ver todos</span>
        </div>
      `;
    } else {
      statusBar.innerHTML = `<span>Exibindo todos os <strong style="color:var(--accent);">${ARTICLES.length}</strong> artigos disponíveis</span>`;
    }
  }
  
  grid.innerHTML = '';
  
  if (filtered.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    const termEl = document.getElementById('empty-search-term');
    if (termEl) termEl.textContent = state.searchQuery;
  } else {
    emptyState.classList.add('hidden');
    grid.classList.remove('hidden');
    
    filtered.forEach(art => {
      if (isSearching) {
        // List style for search results
        const listItem = document.createElement('div');
        listItem.className = 'search-result-item';
        listItem.style.backgroundColor = 'var(--bg-card)';
        listItem.style.border = '1px solid var(--border-color)';
        listItem.style.borderRadius = '14px';
        listItem.style.padding = '20px';
        listItem.style.cursor = 'pointer';
        listItem.style.transition = 'transform 0.15s, border-color 0.15s';
        
        listItem.onmouseenter = () => {
          listItem.style.transform = 'translateY(-2px)';
          listItem.style.borderColor = 'var(--accent)';
        };
        listItem.onmouseleave = () => {
          listItem.style.transform = 'none';
          listItem.style.borderColor = 'var(--border-color)';
        };
        
        const snippetHTML = getSearchSnippet(art.content, query) || `
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">${escapeHtml(art.summary)}</p>
        `;
        
        const colorScheme = CATEGORY_COLORS[art.category] || CATEGORY_COLORS["Misc"];
        const formattedDate = formatDate(art.date);
        const tagsHTML = art.tags.map(t => `<span class="tag">#${t}</span>`).join(' ');

        listItem.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge" style="background-color: ${colorScheme.bg}; color: ${colorScheme.text}; border: 1px solid ${colorScheme.border}; margin:0;">
                ${art.category}
              </span>
              <span style="font-size:11px; color:var(--text-tertiary); font-weight:500;">${formattedDate}</span>
            </div>
            <div class="tags-container" style="margin:0;">${tagsHTML}</div>
          </div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin:0; line-height:1.4;">${art.title}</h3>
          <div style="margin-top:10px;">
            ${snippetHTML}
          </div>
        `;
        
        listItem.onclick = () => window.openArticle(art.id);
        grid.appendChild(listItem);
      } else {
        // Grid cards layout for default lists
        const card = document.createElement('div');
        card.className = 'card';
        card.style.position = 'relative';
        
        const colorScheme = CATEGORY_COLORS[art.category] || CATEGORY_COLORS["Misc"];
        const formattedDate = formatDate(art.date);
        const tagsHTML = art.tags.map(t => `<span class="tag">#${t}</span>`).join('');
        
        const imageHTML = art.imageUrl ? `
          <div class="card-image-wrapper">
            <img src="${art.imageUrl}" alt="${art.title}" class="card-image" loading="lazy" referrerPolicy="no-referrer" />
          </div>
        ` : '';

        card.innerHTML = `
          ${imageHTML}
          <div style="display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
            <div>
              <div class="card-header">
                <span class="badge" style="background-color: ${colorScheme.bg}; color: ${colorScheme.text}; border: 1px solid ${colorScheme.border};">
                  ${art.category}
                </span>
                <span class="card-date">${formattedDate}</span>
              </div>
              <h2 class="card-title">${art.title}</h2>
              <p class="card-summary">${art.summary}</p>
            </div>
            <div class="card-footer" style="margin-top: 16px;">
              <div class="tags-container">${tagsHTML}</div>
              <span class="read-link">
                Ler artigo completo 
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.751.751 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/>
                </svg>
              </span>
            </div>
          </div>
        `;
        
        card.onclick = () => window.openArticle(art.id);
        grid.appendChild(card);
      }
    });
  }
}

/* --- LEITOR DE ARTIGO --- */
window.openArticle = function(id: string) {
  state.selectedArticleId = id;
  const art = ARTICLES.find(a => a.id === id);
  if (!art) return;
  
  // Increment read counter telemetry
  try {
    state.accessCount.articles[id] = (state.accessCount.articles[id] || 0) + 1;
    saveStateToStorage();
  } catch (e) {
    console.error("Erro ao registrar estatística do artigo:", e);
  }
  
  // Swap active containers
  const homeView = document.getElementById('home-view');
  const mobileCategories = document.getElementById('mobile-categories');
  const articleView = document.getElementById('article-view');
  const cheatsheetView = document.getElementById('cheatsheet-view');
  const snippetsView = document.getElementById('snippets-view');
  
  if (homeView) homeView.classList.add('hidden');
  if (mobileCategories) mobileCategories.classList.add('hidden');
  if (cheatsheetView) cheatsheetView.classList.add('hidden');
  if (snippetsView) snippetsView.classList.add('hidden');
  if (articleView) articleView.classList.remove('hidden');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Fill values in UI elements
  const colorScheme = CATEGORY_COLORS[art.category] || CATEGORY_COLORS["Misc"];
  const formattedDate = formatDate(art.date);
  const tagsHTML = art.tags.map(t => `<span class="tag">#${t}</span>`).join('');
  
  // Estimate reading time (160 words per minute average)
  const plainText = art.content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 160));
  
  const artTitle = document.getElementById('art-title');
  const artDate = document.getElementById('art-date');
  const artReadingTime = document.getElementById('art-reading-time');
  const artTags = document.getElementById('art-tags');
  const artCategory = document.getElementById('art-category');
  
  if (artTitle) artTitle.textContent = art.title;
  if (artDate) artDate.textContent = formattedDate;
  if (artReadingTime) artReadingTime.textContent = `⏱️ ${readingTime} min de leitura`;
  if (artTags) artTags.innerHTML = tagsHTML;
  
  if (artCategory) {
    artCategory.textContent = art.category;
    artCategory.style.backgroundColor = colorScheme.bg;
    artCategory.style.color = colorScheme.text;
    artCategory.style.border = `1px solid ${colorScheme.border}`;
  }
  
  // Inline banner or iframe video player
  let mediaHTML = '';
  if (art.youtubeId) {
    mediaHTML += `
      <div class="video-wrapper">
        <iframe 
          src="https://www.youtube.com/embed/${art.youtubeId}" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  } else if (art.imageUrl) {
    mediaHTML += `
      <div class="article-banner-wrapper" style="width:100%; height:320px; overflow:hidden; border-radius:18px; margin:24px 0; background-color:var(--bg-tertiary); border: 1px solid var(--border-color);">
        <img src="${art.imageUrl}" alt="${art.title}" style="width:100%; height:100%; object-fit:cover;" referrerPolicy="no-referrer" />
      </div>
    `;
  }
  
  const artContent = document.getElementById('article-content');
  if (artContent) {
    artContent.innerHTML = mediaHTML + art.content;
  }
  
  // Initialize dynamic copy buttons on newly injected pre/code blocks
  setupCodeCopyButtons();
  
  renderArticleNavigation(id);
  addToRecentHistory(id);
  setupAnchors();
  renderTOC();
  renderRelatedArticles(art);
  renderChangelog(art);
  
  // Reset scroll progress bar
  const prg = document.getElementById('reading-progress');
  if (prg) {
    prg.classList.remove('hidden');
    prg.style.width = '0%';
  }
};

/* --- CODE COPYING MECHANICS --- */
function setupCodeCopyButtons() {
  const containers = document.querySelectorAll('.code-container');
  containers.forEach(container => {
    // Avoid appending multiple copy buttons if opened repeatedly
    if (container.querySelector('.copy-btn')) return;
    
    const header = container.querySelector('.code-header');
    const pre = container.querySelector('pre');
    if (!header || !pre) return;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.title = 'Copiar código para a área de transferência';
    copyBtn.innerHTML = `
      <svg class="copy-svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
      </svg>
      <span>Copiar</span>
    `;
    
    copyBtn.onclick = () => {
      const codeEl = pre.querySelector('code');
      if (codeEl) {
        const textToCopy = codeEl.textContent || '';
        navigator.clipboard.writeText(textToCopy).then(() => {
          const dicaId = container.getAttribute('data-dica-id');
          if (dicaId && state.activeView === 'cheatsheet') {
            try {
              state.accessCount.dicas[dicaId] = (state.accessCount.dicas[dicaId] || 0) + 1;
              saveStateToStorage();
            } catch (e) {
              console.error("Erro ao registrar estatística de cópia de dica:", e);
            }
          }

          copyBtn.innerHTML = `
            <svg viewBox="0 0 16 16" width="12" height="12" fill="#56d364">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 .042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
            </svg>
            <span style="color:#56d364;">Copiado ✓</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg class="copy-svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
              </svg>
              <span>Copiar</span>
            `;
          }, 2000);
        }).catch(err => {
          console.error("Falha ao copiar trecho de código: ", err);
        });
      }
    };
    
    header.appendChild(copyBtn);
  });
}

/* --- LOWER PREV / NEXT NAVIGATION --- */
function renderArticleNavigation(currentId: string) {
  const index = ARTICLES.findIndex(art => art.id === currentId);
  const prevBox = document.getElementById('nav-prev');
  const nextBox = document.getElementById('nav-next');
  
  if (!prevBox || !nextBox) return;
  
  // Previous
  if (index > 0) {
    const prevArt = ARTICLES[index - 1];
    prevBox.classList.remove('disabled');
    prevBox.innerHTML = `← anterior`;
    prevBox.onclick = () => window.openArticle(prevArt.id);
  } else {
    prevBox.classList.add('disabled');
    prevBox.innerHTML = `← anterior`;
    prevBox.onclick = null;
  }
  
  // Next
  if (index < ARTICLES.length - 1) {
    const nextArt = ARTICLES[index + 1];
    nextBox.classList.remove('disabled');
    nextBox.innerHTML = `próximo →`;
    nextBox.onclick = () => window.openArticle(nextArt.id);
  } else {
    nextBox.classList.add('disabled');
    nextBox.innerHTML = `próximo →`;
    nextBox.onclick = null;
  }
}

/* --- RETURN TO MAIN DIRECTORY MANTENING QUERY --- */
window.closeArticle = function() {
  state.selectedArticleId = null;
  
  const articleView = document.getElementById('article-view');
  const cheatsheetView = document.getElementById('cheatsheet-view');
  const homeView = document.getElementById('home-view');
  const mobileCategories = document.getElementById('mobile-categories');
  
  if (articleView) articleView.classList.add('hidden');
  if (cheatsheetView) cheatsheetView.classList.add('hidden');
  if (homeView) homeView.classList.remove('hidden');
  if (mobileCategories) mobileCategories.classList.remove('hidden');
  
  // Hide scroll progress bar
  const prg = document.getElementById('reading-progress');
  if (prg) prg.classList.add('hidden');

  renderArticles();
};

/* --- GLOBAL HARD REBOOT BACK HOME --- */
window.goHome = function() {
  state.activeCategory = 'Todos';
  state.searchQuery = '';
  state.selectedArticleId = null;
  state.activeView = 'articles';
  
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.value = '';
  }
  const searchClearBtn = document.getElementById('search-clear-btn');
  if (searchClearBtn) {
    searchClearBtn.classList.add('hidden');
  }
  
  const articleView = document.getElementById('article-view');
  const cheatsheetView = document.getElementById('cheatsheet-view');
  const snippetsView = document.getElementById('snippets-view');
  const homeView = document.getElementById('home-view');
  const mobileCategories = document.getElementById('mobile-categories');
  
  if (articleView) articleView.classList.add('hidden');
  if (cheatsheetView) cheatsheetView.classList.add('hidden');
  if (snippetsView) snippetsView.classList.add('hidden');
  if (homeView) homeView.classList.remove('hidden');
  if (mobileCategories) mobileCategories.classList.remove('hidden');
  
  const prg = document.getElementById('reading-progress');
  if (prg) prg.classList.add('hidden');

  const cheatsheetsBtn = document.getElementById('nav-btn-cheatsheets');
  if (cheatsheetsBtn) {
    cheatsheetsBtn.classList.remove('active');
  }

  renderSidebar();
  renderMobileCategories();
  renderArticles();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* --- THEME TOGGLE LIGHT VS DARK --- */
window.toggleTheme = function() {
  const body = document.body;
  const sunIcons = document.querySelectorAll('.sun-icon');
  const moonIcons = document.querySelectorAll('.moon-icon');
  
  body.classList.toggle('dark-theme');
  document.documentElement.classList.toggle('dark');
  const isDark = body.classList.contains('dark-theme');
  
  localStorage.setItem('java-kb-theme', isDark ? 'dark' : 'light');
  
  sunIcons.forEach(sunIcon => {
    if (isDark) {
      sunIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.add('hidden');
    }
  });
  
  moonIcons.forEach(moonIcon => {
    if (isDark) {
      moonIcon.classList.add('hidden');
    } else {
      moonIcon.classList.remove('hidden');
    }
  });
};

/* --- KEYBOARD COMMAND SHORTCUTS --- */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement).blur();
        window.clearSearch();
      }
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    } else if (e.key === 'Escape') {
      if (state.drawerOpen) {
        window.closeDrawer();
        return;
      }
      window.clearSearch();
      if (state.selectedArticleId) {
        window.closeArticle();
      }
    } else if (e.key === 'ArrowLeft') {
      if (state.selectedArticleId) {
        const index = ARTICLES.findIndex(art => art.id === state.selectedArticleId);
        if (index > 0) {
          window.openArticle(ARTICLES[index - 1].id);
        }
      }
    } else if (e.key === 'ArrowRight') {
      if (state.selectedArticleId) {
        const index = ARTICLES.findIndex(art => art.id === state.selectedArticleId);
        if (index < ARTICLES.length - 1) {
          window.openArticle(ARTICLES[index + 1].id);
        }
      }
    } else if (e.key.toLowerCase() === 'p') {
      if (state.selectedArticleId) {
        window.print();
      }
    } else if (e.key === '?') {
      window.toggleShortcutsModal();
    }
  });
}

window.toggleShortcutsModal = function() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) {
    modal.classList.toggle('hidden');
  }
};

/* --- READING POSITION SCROLL PROGRESS BAR --- */
function setupReadingProgressBar() {
  window.addEventListener('scroll', () => {
    const bar = document.getElementById('reading-progress');
    if (!bar || bar.classList.contains('hidden')) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) {
      bar.style.width = '0%';
      return;
    }
    const pct = (scrollTop / docHeight) * 100;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  });
}

/* --- RECENT HISTORY LIST --- */
function loadRecentHistory() {
  loadStateFromStorage();
  renderRecentHistory();
}

function renderRecentHistory() {
  const container = document.getElementById('recent-articles-list');
  const emptyMsg = document.getElementById('recent-empty');
  if (!container || !emptyMsg) return;

  container.innerHTML = '';
  if (state.recentArticles.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }

  emptyMsg.classList.add('hidden');
  state.recentArticles.forEach(id => {
    const art = ARTICLES.find(a => a.id === id);
    if (!art) return;

    const item = document.createElement('div');
    item.className = 'recent-item';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '8px 12px';
    item.style.borderRadius = '8px';
    item.style.backgroundColor = 'var(--bg-secondary)';
    item.style.cursor = 'pointer';
    item.style.transition = 'transform 0.15s, background-color 0.15s';
    
    item.innerHTML = `
      <span style="font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">${art.title}</span>
      <span style="font-size: 11px; color: var(--accent); font-weight: 600;">Ler ↗</span>
    `;
    item.onclick = () => window.openArticle(art.id);
    
    container.appendChild(item);
  });
}

function addToRecentHistory(id: string) {
  state.recentArticles = state.recentArticles.filter(x => x !== id);
  state.recentArticles.unshift(id);
  if (state.recentArticles.length > 4) {
    state.recentArticles.pop();
  }
  localStorage.setItem('java-kb-recent', JSON.stringify(state.recentArticles));
  renderRecentHistory();
}

window.clearRecentHistory = function() {
  state.recentArticles = [];
  localStorage.removeItem('java-kb-recent');
  renderRecentHistory();
};

/* --- AUTOMATIC CORINGA HEADINGS ANCHOR LINKS --- */
function setupAnchors() {
  const contentDiv = document.getElementById('article-content');
  if (!contentDiv) return;

  const headings = Array.from(contentDiv.querySelectorAll('h2, h3')) as HTMLElement[];
  headings.forEach(heading => {
    const textNode = heading.textContent || '';
    const slug = textNode.trim().toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    heading.id = slug;
    heading.style.position = 'relative';
    heading.classList.add('group');

    const anchor = document.createElement('a');
    anchor.href = `#${slug}`;
    anchor.className = 'anchor-link';
    anchor.style.position = 'absolute';
    anchor.style.left = '-24px';
    anchor.style.paddingRight = '8px';
    anchor.style.opacity = '0';
    anchor.style.color = 'var(--accent)';
    anchor.style.textDecoration = 'none';
    anchor.style.transition = 'opacity 0.2s';
    anchor.innerHTML = '🔗';
    
    anchor.onclick = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#' + slug).then(() => {
        const original = anchor.innerHTML;
        anchor.innerHTML = '✓';
        setTimeout(() => { anchor.innerHTML = original; }, 1500);
      });
      heading.scrollIntoView({ behavior: 'smooth' });
    };

    heading.insertBefore(anchor, heading.firstChild);

    heading.addEventListener('mouseenter', () => { anchor.style.opacity = '1'; });
    heading.addEventListener('mouseleave', () => { anchor.style.opacity = '0'; });
  });
}

/* --- TABLE OF CONTENTS SIDE PANEL --- */
function renderTOC() {
  const tocList = document.getElementById('toc-list');
  const contentDiv = document.getElementById('article-content');
  if (!tocList || !contentDiv) return;

  tocList.innerHTML = '';
  const headings = Array.from(contentDiv.querySelectorAll('h2, h3')) as HTMLElement[];
  
  if (headings.length === 0) {
    tocList.innerHTML = '<li style="color:var(--text-secondary); font-size:12px;">Nenhuma seção encontrada</li>';
    return;
  }

  headings.forEach(heading => {
    const li = document.createElement('li');
    const isH3 = heading.tagName.toLowerCase() === 'h3';
    
    li.style.paddingLeft = isH3 ? '12px' : '0';
    li.style.marginBottom = '6px';
    
    const a = document.createElement('a');
    a.href = `#${heading.id}`;
    const cleanText = (heading.textContent || '').replace('🔗', '').trim();
    a.textContent = cleanText;
    a.style.color = 'var(--text-secondary)';
    a.style.fontSize = '12px';
    a.style.textDecoration = 'none';
    a.style.transition = 'color 0.2s';
    
    a.onclick = (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth' });
    };

    li.appendChild(a);
    tocList.appendChild(li);
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60% 0px',
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocList.querySelectorAll('a').forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.style.color = 'var(--accent)';
            link.style.fontWeight = '600';
          } else {
            link.style.color = 'var(--text-secondary)';
            link.style.fontWeight = 'normal';
          }
        });
      }
    });
  }, observerOptions);

  headings.forEach(h => spyObserver.observe(h));
}

/* --- RENDER RELATED SUGGESTIONS --- */
function renderRelatedArticles(currentArt: Article) {
  const container = document.getElementById('related-articles-list');
  if (!container) return;

  container.innerHTML = '';
  
  const related = ARTICLES.filter(art => art.id !== currentArt.id && art.tags.some(t => currentArt.tags.includes(t)));
  
  if (related.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary); font-size:13px;">Nenhum artigo relacionado encontrado.</p>';
    return;
  }

  related.slice(0, 3).forEach(art => {
    const item = document.createElement('div');
    item.style.backgroundColor = 'var(--bg-secondary)';
    item.style.border = '1px solid var(--border-color)';
    item.style.borderRadius = '12px';
    item.style.padding = '14px';
    item.style.cursor = 'pointer';
    item.style.transition = 'transform 0.15s, border-color 0.15s';
    
    item.innerHTML = `
      <span style="font-size:11px; font-weight:600; text-transform:uppercase; color:var(--accent); letter-spacing:0.5px;">${art.category}</span>
      <h4 style="font-size:13px; font-weight:600; margin:4px 0 8px 0; line-height:1.3;">${art.title}</h4>
      <p style="font-size:11px; color:var(--text-secondary); line-height:1.4; display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${art.summary}</p>
    `;
    
    item.onmouseenter = () => { item.style.transform = 'translateY(-2px)'; item.style.borderColor = 'var(--accent)'; };
    item.onmouseleave = () => { item.style.transform = 'none'; item.style.borderColor = 'var(--border-color)'; };
    item.onclick = () => window.openArticle(art.id);
    
    container.appendChild(item);
  });
}

/* --- RENDER HISTORIC CHANGELOG --- */
function renderChangelog(art: Article) {
  const container = document.getElementById('changelog-container');
  if (!container) return;

  if (!art.changelog || art.changelog.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary); font-size:12px;">Nenhum histórico disponível para este artigo.</p>';
    return;
  }

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px; border-left:2px solid var(--border-color); padding-left:14px; margin-left:6px;">
      ${art.changelog.map(item => `
        <div style="position:relative;">
          <span style="position:absolute; left:-21px; top:4px; width:10px; height:10px; border-radius:50%; background-color:var(--accent); border: 2px solid var(--bg-card);"></span>
          <div style="font-size:11px; font-weight:600; color:var(--text-secondary);">${formatDate(item.date)} — <span style="color:var(--accent);">v${item.version}</span></div>
          <div style="font-size:13px; font-weight:600; margin:2px 0;">${item.author}</div>
          <p style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin:0;">${item.changes}</p>
        </div>
      `).join('')}
    </div>
  `;
}

/* --- RENDER SERIES (HOME VIEW) --- */
window.renderHomeSeries = function() {
  const container = document.getElementById('home-series-list');
  if (!container) return;

  container.innerHTML = '';
  
  SERIES.forEach(series => {
    const seriesArticles = ARTICLES.filter(a => a.seriesId === series.id);
    if (seriesArticles.length === 0) return;

    const card = document.createElement('div');
    card.style.backgroundColor = 'var(--bg-card)';
    card.style.border = '1px solid transparent';
    card.style.borderRadius = '18px';
    card.style.padding = '20px';
    card.style.cursor = 'pointer';
    card.style.transition = 'transform 0.15s, border-color 0.15s';
    
    card.innerHTML = `
      <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--accent); letter-spacing:1px; background-color:var(--bg-secondary); padding:4px 8px; border-radius:6px; border:1px solid transparent;">SÉRIE ESPECIAL</span>
      <h3 style="font-size:16px; font-weight:700; margin:10px 0 6px 0; line-height:1.3;">${series.name}</h3>
      <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin-bottom:14px;">${series.description}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--accent); font-weight:600;">
        <span>⚡ ${seriesArticles.length} Artigos na trilha</span>
        <span>Iniciar trilha →</span>
      </div>
    `;

    card.onmouseenter = () => { card.style.transform = 'translateY(-2px)'; card.style.borderColor = 'var(--accent)'; };
    card.onmouseleave = () => { card.style.transform = 'none'; card.style.borderColor = 'transparent'; };
    card.onclick = () => window.openArticle(seriesArticles[0].id);

    container.appendChild(card);
  });
};

/* --- RENDER CHEATSHEET / CODES LIST VIEW --- */
window.openCheatsheet = function(category: string) {
  state.activeView = 'cheatsheet';
  state.activeCheatsheetCategory = category;
  
  const homeView = document.getElementById('home-view');
  const articleView = document.getElementById('article-view');
  const snippetsView = document.getElementById('snippets-view');
  const mobileCategories = document.getElementById('mobile-categories');
  const readingPrg = document.getElementById('reading-progress');
  const cheatsheetView = document.getElementById('cheatsheet-view');
  
  if (homeView) homeView.classList.add('hidden');
  if (articleView) articleView.classList.add('hidden');
  if (snippetsView) snippetsView.classList.add('hidden');
  if (mobileCategories) mobileCategories.classList.add('hidden');
  if (readingPrg) readingPrg.classList.add('hidden');
  if (cheatsheetView) cheatsheetView.classList.remove('hidden');

  // Activate cheatsheets nav button styling
  const cheatsheetsBtn = document.getElementById('nav-btn-cheatsheets');
  if (cheatsheetsBtn) {
    cheatsheetsBtn.classList.add('active');
  }

  const titleEl = document.getElementById('cheatsheet-title');
  const descEl = document.getElementById('cheatsheet-subtitle');
  const gridEl = document.getElementById('cheatsheet-grid');
  
  if (!titleEl || !gridEl) return;

  titleEl.textContent = `Dicas de ${category}`;
  if (descEl) {
    descEl.textContent = `Acesso rápido a estruturas, sintaxes, boas práticas e truques extraídos dos artigos de ${category}.`;
  }
  
  gridEl.innerHTML = '';
  
  let foundAny = false;
  const query = state.searchQuery.trim().toLowerCase();
  
  // Collect cheatsheets/snippets from the active articles
  interface CheatsheetItem {
    id: string;
    artId: string;
    article: Article;
    category: string;
    description: string;
    innerHTML: string;
    textContent: string;
    date: string;
  }
  const allDicas: CheatsheetItem[] = [];
  ARTICLES.forEach(art => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = art.content;
    
    const codeContainers = tempDiv.querySelectorAll('.code-container');
    codeContainers.forEach((container, index) => {
      let prev = container.previousElementSibling;
      let description = '';
      while (prev) {
        if (['h3', 'h4', 'h5', 'p'].includes(prev.tagName.toLowerCase())) {
          description = prev.textContent || '';
          description = description.replace('🔗', '').trim();
          break;
        }
        prev = prev.previousElementSibling;
      }
      
      if (!description) {
        description = "Exemplo Prático";
      }

      allDicas.push({
        id: `${art.id}-dica-${index}`,
        artId: art.id,
        article: art,
        category: art.category,
        description: description,
        innerHTML: container.innerHTML,
        textContent: container.textContent || '',
        date: art.date
      });
    });
  });

  // Sort cheatsheets by click/access popularity
  const sortedDicas = sortByPopularity(allDicas, state.accessCount.dicas);

  // Filter cheatsheets by active category and search filter
  const filteredDicas = sortedDicas.filter(dica => {
    if (category && category !== 'Todos' && dica.category !== category) {
      return false;
    }
    if (query) {
      const inCode = normalizarTexto(dica.textContent).includes(normalizarTexto(query));
      const inDesc = normalizarTexto(dica.description).includes(normalizarTexto(query));
      const inTitle = normalizarTexto(dica.article.title).includes(normalizarTexto(query));
      if (!inCode && !inDesc && !inTitle) {
        return false;
      }
    }
    return true;
  });

  // Render
  filteredDicas.forEach(dica => {
    foundAny = true;
    
    const block = document.createElement('div');
    block.style.backgroundColor = 'var(--bg-card)';
    block.style.border = '1px solid transparent';
    block.style.borderRadius = '18px';
    block.style.padding = '20px';
    block.style.display = 'flex';
    block.style.flexDirection = 'column';
    block.style.gap = '12px';
    block.style.cursor = 'pointer';
    block.style.transition = 'transform 0.15s, border-color 0.15s';
    block.style.height = '340px';
    block.style.overflow = 'hidden';
    
    block.onmouseenter = () => {
      block.style.transform = 'translateY(-2px)';
      block.style.borderColor = 'var(--accent)';
    };
    block.onmouseleave = () => {
      block.style.transform = 'none';
      block.style.borderColor = 'transparent';
    };

    block.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent); letter-spacing:0.5px;">${dica.category}</span>
        <span style="font-size:11px; color:var(--text-secondary); font-weight: 500;">Origem: <strong>${dica.article.title}</strong></span>
      </div>
      <div style="flex-shrink: 0;">
        <h3 style="font-size:14px; font-weight:700; margin:0; display:flex; align-items:center; gap:6px; color: var(--text-primary);">⚡ ${dica.description}</h3>
      </div>
      <div class="code-container" data-dica-id="${dica.id}" style="margin:0; border: 1px solid transparent; background-color: var(--bg-secondary); flex-grow: 1; overflow-y: auto;">
        ${dica.innerHTML}
      </div>
    `;
    
    block.onclick = () => {
      window.openArticle(dica.artId);
    };
    
    gridEl.appendChild(block);
  });
  
  if (!foundAny) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <p>Nenhum bloco de código encontrado para os critérios de filtragem em "${category}".</p>
      </div>
    `;
  }

  setupCodeCopyButtons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* --- MOBILE DRAWER SLIDER ACTIONS --- */
window.openDrawer = function() {
  state.drawerOpen = true;
  document.body.classList.add('drawer-open');
  document.documentElement.classList.add('drawer-open');
  renderDrawerCategories();
};

window.closeDrawer = function() {
  state.drawerOpen = false;
  document.body.classList.remove('drawer-open');
  document.documentElement.classList.remove('drawer-open');
};

window.openSnippets = function() {
  state.activeView = 'snippets';
  
  const homeView = document.getElementById('home-view');
  const articleView = document.getElementById('article-view');
  const cheatsheetView = document.getElementById('cheatsheet-view');
  const snippetsView = document.getElementById('snippets-view');
  const mobileCategories = document.getElementById('mobile-categories');
  const readingPrg = document.getElementById('reading-progress');
  
  if (homeView) homeView.classList.add('hidden');
  if (articleView) articleView.classList.add('hidden');
  if (cheatsheetView) cheatsheetView.classList.add('hidden');
  if (mobileCategories) mobileCategories.classList.add('hidden');
  if (readingPrg) readingPrg.classList.add('hidden');
  if (snippetsView) snippetsView.classList.remove('hidden');
  
  const cheatsheetsBtn = document.getElementById('nav-btn-cheatsheets');
  if (cheatsheetsBtn) {
    cheatsheetsBtn.classList.remove('active');
  }

  const gridEl = document.getElementById('snippets-grid');
  if (!gridEl) return;
  
  gridEl.innerHTML = SNIPPETS_DATA.map(snip => `
    <div class="category-card" style="padding: 20px; border-radius: 12px; border: 1px solid var(--border); background-color: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">${snip.title}</h3>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">${snip.description}</p>
        <div class="code-container" style="position: relative;">
          <pre style="margin: 0; padding: 12px; border-radius: 8px; background-color: var(--code-bg); overflow-x: auto;"><code class="language-java" style="font-family: var(--font-mono); font-size: 11px; color: #fff;">${escapeHtml(snip.code)}</code></pre>
        </div>
      </div>
    </div>
  `).join('');
  
  setupCodeCopyButtons();
  window.closeDrawer();
};

function renderDrawerCategories() {
  const list = document.getElementById('drawer-categories');
  if (!list) return;
  
  list.innerHTML = '';
  
  const createDrawerCatItem = (cat: string) => {
    const li = document.createElement('li');
    li.className = `category-item ${state.activeCategory === cat ? 'active' : ''}`;
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.padding = '8px 12px';
    li.style.borderRadius = '8px';
    li.style.cursor = 'pointer';
    li.style.gap = '8px';
    
    const count = ARTICLES.filter(art => art.category === cat).length;
    
    li.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; flex: 1;" onclick="window.selectCategory('${cat}'); window.closeDrawer();">
        <span style="font-size: 14px; font-weight: 500;">${cat}</span>
        <span class="category-count" style="font-size: 11px; color: var(--text-tertiary); opacity: 0.8;">(${count})</span>
      </div>
    `;
    
    return li;
  };
  
  // Group 1: Core Concepts
  const coreHeaderWrapper = document.createElement('div');
  coreHeaderWrapper.style.display = 'flex';
  coreHeaderWrapper.style.justifyContent = 'space-between';
  coreHeaderWrapper.style.alignItems = 'center';
  coreHeaderWrapper.style.marginTop = '16px';
  coreHeaderWrapper.style.marginBottom = '8px';
  coreHeaderWrapper.style.padding = '0 12px';
  coreHeaderWrapper.style.cursor = 'pointer';
  coreHeaderWrapper.style.userSelect = 'none';
  
  const coreHeader = document.createElement('p');
  coreHeader.className = 'drawer-section-title';
  coreHeader.style.margin = '0';
  coreHeader.style.transition = 'color 0.2s ease';
  coreHeader.textContent = 'Core Concepts';
  coreHeaderWrapper.appendChild(coreHeader);
  
  const coreToggleBtn = document.createElement('button');
  coreToggleBtn.style.background = 'none';
  coreToggleBtn.style.border = 'none';
  coreToggleBtn.style.cursor = 'pointer';
  coreToggleBtn.style.color = 'var(--text-tertiary)';
  coreToggleBtn.style.display = 'flex';
  coreToggleBtn.style.alignItems = 'center';
  coreToggleBtn.style.justifyContent = 'center';
  coreToggleBtn.style.padding = '4px';
  coreToggleBtn.style.borderRadius = '4px';
  coreToggleBtn.style.transition = 'color 0.2s';
  coreToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${coreExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  coreToggleBtn.onclick = (e) => {
    e.stopPropagation();
    coreExpanded = !coreExpanded;
    renderDrawerCategories();
  };
  coreHeaderWrapper.onclick = () => {
    coreExpanded = !coreExpanded;
    renderDrawerCategories();
  };
  coreHeaderWrapper.addEventListener('mouseenter', () => {
    coreHeader.style.color = 'var(--accent)';
    coreToggleBtn.style.color = 'var(--accent)';
  });
  coreHeaderWrapper.addEventListener('mouseleave', () => {
    coreHeader.style.color = 'var(--text-tertiary)';
    coreToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  coreHeaderWrapper.appendChild(coreToggleBtn);
  list.appendChild(coreHeaderWrapper);
  
  const coreWrapper = document.createElement('div');
  coreWrapper.style.overflow = 'hidden';
  coreWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const coreCats = ['Generics', 'Collections', 'OOP'];
  coreCats.forEach(cat => {
    coreWrapper.appendChild(createDrawerCatItem(cat));
  });

  if (coreExpanded) {
    coreWrapper.style.maxHeight = '200px';
    coreWrapper.style.opacity = '1';
    coreWrapper.style.marginBottom = '12px';
  } else {
    coreWrapper.style.maxHeight = '0px';
    coreWrapper.style.opacity = '0';
    coreWrapper.style.marginBottom = '0px';
  }
  list.appendChild(coreWrapper);
  
  // Group 2: Advanced Java
  const advHeaderWrapper = document.createElement('div');
  advHeaderWrapper.style.display = 'flex';
  advHeaderWrapper.style.justifyContent = 'space-between';
  advHeaderWrapper.style.alignItems = 'center';
  advHeaderWrapper.style.marginTop = '8px';
  advHeaderWrapper.style.marginBottom = '8px';
  advHeaderWrapper.style.padding = '0 12px';
  advHeaderWrapper.style.cursor = 'pointer';
  advHeaderWrapper.style.userSelect = 'none';
  
  const advHeader = document.createElement('p');
  advHeader.className = 'drawer-section-title';
  advHeader.style.margin = '0';
  advHeader.style.transition = 'color 0.2s ease';
  advHeader.textContent = 'Advanced Java';
  advHeaderWrapper.appendChild(advHeader);
  
  const advToggleBtn = document.createElement('button');
  advToggleBtn.style.background = 'none';
  advToggleBtn.style.border = 'none';
  advToggleBtn.style.cursor = 'pointer';
  advToggleBtn.style.color = 'var(--text-tertiary)';
  advToggleBtn.style.display = 'flex';
  advToggleBtn.style.alignItems = 'center';
  advToggleBtn.style.justifyContent = 'center';
  advToggleBtn.style.padding = '4px';
  advToggleBtn.style.borderRadius = '4px';
  advToggleBtn.style.transition = 'color 0.2s';
  advToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${advExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  advToggleBtn.onclick = (e) => {
    e.stopPropagation();
    advExpanded = !advExpanded;
    renderDrawerCategories();
  };
  advHeaderWrapper.onclick = () => {
    advExpanded = !advExpanded;
    renderDrawerCategories();
  };
  advHeaderWrapper.addEventListener('mouseenter', () => {
    advHeader.style.color = 'var(--accent)';
    advToggleBtn.style.color = 'var(--accent)';
  });
  advHeaderWrapper.addEventListener('mouseleave', () => {
    advHeader.style.color = 'var(--text-tertiary)';
    advToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  advHeaderWrapper.appendChild(advToggleBtn);
  list.appendChild(advHeaderWrapper);
  
  const advWrapper = document.createElement('div');
  advWrapper.style.overflow = 'hidden';
  advWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const advCats = ['Streams', 'Concurrency', 'JVM'];
  advCats.forEach(cat => {
    advWrapper.appendChild(createDrawerCatItem(cat));
  });

  if (advExpanded) {
    advWrapper.style.maxHeight = '200px';
    advWrapper.style.opacity = '1';
    advWrapper.style.marginBottom = '12px';
  } else {
    advWrapper.style.maxHeight = '0px';
    advWrapper.style.opacity = '0';
    advWrapper.style.marginBottom = '0px';
  }
  list.appendChild(advWrapper);

  // Group 3: Frameworks & Libs
  const fwHeaderWrapper = document.createElement('div');
  fwHeaderWrapper.style.display = 'flex';
  fwHeaderWrapper.style.justifyContent = 'space-between';
  fwHeaderWrapper.style.alignItems = 'center';
  fwHeaderWrapper.style.marginTop = '8px';
  fwHeaderWrapper.style.marginBottom = '8px';
  fwHeaderWrapper.style.padding = '0 12px';
  fwHeaderWrapper.style.cursor = 'pointer';
  fwHeaderWrapper.style.userSelect = 'none';
  
  const fwHeader = document.createElement('p');
  fwHeader.className = 'drawer-section-title';
  fwHeader.style.margin = '0';
  fwHeader.style.transition = 'color 0.2s ease';
  fwHeader.textContent = 'Frameworks & Libs';
  fwHeaderWrapper.appendChild(fwHeader);
  
  const fwToggleBtn = document.createElement('button');
  fwToggleBtn.style.background = 'none';
  fwToggleBtn.style.border = 'none';
  fwToggleBtn.style.cursor = 'pointer';
  fwToggleBtn.style.color = 'var(--text-tertiary)';
  fwToggleBtn.style.display = 'flex';
  fwToggleBtn.style.alignItems = 'center';
  fwToggleBtn.style.justifyContent = 'center';
  fwToggleBtn.style.padding = '4px';
  fwToggleBtn.style.borderRadius = '4px';
  fwToggleBtn.style.transition = 'color 0.2s';
  fwToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${frameworksExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  fwToggleBtn.onclick = (e) => {
    e.stopPropagation();
    frameworksExpanded = !frameworksExpanded;
    renderDrawerCategories();
  };
  fwHeaderWrapper.onclick = () => {
    frameworksExpanded = !frameworksExpanded;
    renderDrawerCategories();
  };
  fwHeaderWrapper.addEventListener('mouseenter', () => {
    fwHeader.style.color = 'var(--accent)';
    fwToggleBtn.style.color = 'var(--accent)';
  });
  fwHeaderWrapper.addEventListener('mouseleave', () => {
    fwHeader.style.color = 'var(--text-tertiary)';
    fwToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  fwHeaderWrapper.appendChild(fwToggleBtn);
  list.appendChild(fwHeaderWrapper);
  
  const fwWrapper = document.createElement('div');
  fwWrapper.style.overflow = 'hidden';
  fwWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const fwCats = ['Spring', 'Security'];
  fwCats.forEach(cat => {
    fwWrapper.appendChild(createDrawerCatItem(cat));
  });

  if (frameworksExpanded) {
    fwWrapper.style.maxHeight = '150px';
    fwWrapper.style.opacity = '1';
    fwWrapper.style.marginBottom = '12px';
  } else {
    fwWrapper.style.maxHeight = '0px';
    fwWrapper.style.opacity = '0';
    fwWrapper.style.marginBottom = '0px';
  }
  list.appendChild(fwWrapper);

  // Group 4: Software Engineering
  const seHeaderWrapper = document.createElement('div');
  seHeaderWrapper.style.display = 'flex';
  seHeaderWrapper.style.justifyContent = 'space-between';
  seHeaderWrapper.style.alignItems = 'center';
  seHeaderWrapper.style.marginTop = '8px';
  seHeaderWrapper.style.marginBottom = '8px';
  seHeaderWrapper.style.padding = '0 12px';
  seHeaderWrapper.style.cursor = 'pointer';
  seHeaderWrapper.style.userSelect = 'none';
  
  const seHeader = document.createElement('p');
  seHeader.className = 'drawer-section-title';
  seHeader.style.margin = '0';
  seHeader.style.transition = 'color 0.2s ease';
  seHeader.textContent = 'Engineering & Quality';
  seHeaderWrapper.appendChild(seHeader);
  
  const seToggleBtn = document.createElement('button');
  seToggleBtn.style.background = 'none';
  seToggleBtn.style.border = 'none';
  seToggleBtn.style.cursor = 'pointer';
  seToggleBtn.style.color = 'var(--text-tertiary)';
  seToggleBtn.style.display = 'flex';
  seToggleBtn.style.alignItems = 'center';
  seToggleBtn.style.justifyContent = 'center';
  seToggleBtn.style.padding = '4px';
  seToggleBtn.style.borderRadius = '4px';
  seToggleBtn.style.transition = 'color 0.2s';
  seToggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: ${seExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
  seToggleBtn.onclick = (e) => {
    e.stopPropagation();
    seExpanded = !seExpanded;
    renderDrawerCategories();
  };
  seHeaderWrapper.onclick = () => {
    seExpanded = !seExpanded;
    renderDrawerCategories();
  };
  seHeaderWrapper.addEventListener('mouseenter', () => {
    seHeader.style.color = 'var(--accent)';
    seToggleBtn.style.color = 'var(--accent)';
  });
  seHeaderWrapper.addEventListener('mouseleave', () => {
    seHeader.style.color = 'var(--text-tertiary)';
    seToggleBtn.style.color = 'var(--text-tertiary)';
  });
  
  seHeaderWrapper.appendChild(seToggleBtn);
  list.appendChild(seHeaderWrapper);
  
  const seWrapper = document.createElement('div');
  seWrapper.style.overflow = 'hidden';
  seWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-bottom 0.35s ease';
  
  const seCats = ['Testing', 'Design Patterns', 'Misc'];
  seCats.forEach(cat => {
    seWrapper.appendChild(createDrawerCatItem(cat));
  });

  if (seExpanded) {
    seWrapper.style.maxHeight = '200px';
    seWrapper.style.opacity = '1';
    seWrapper.style.marginBottom = '12px';
  } else {
    seWrapper.style.maxHeight = '0px';
    seWrapper.style.opacity = '0';
    seWrapper.style.marginBottom = '0px';
  }
  list.appendChild(seWrapper);
}

// Dismiss drawer on desktop screens
window.addEventListener('resize', debounce(() => {
  if (window.innerWidth >= 1024 && state.drawerOpen) {
    window.closeDrawer();
  }
}, 100));

function initBannerRotation() {
  const trackEl = document.getElementById('home-banner-track') as HTMLElement | null;
  if (!trackEl) return;

  const totalImages = 6;
  let currentIndex = 0;
  
  setInterval(() => {
    currentIndex++;
    trackEl.style.transition = 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
    trackEl.style.transform = `translateX(-${currentIndex * 16.666}%)`;
    
    if (currentIndex === totalImages - 1) {
      setTimeout(() => {
        trackEl.style.transition = 'none';
        trackEl.style.transform = 'translateX(0%)';
        currentIndex = 0;
      }, 900);
    }
  }, 7000);
}

window.updateWelcomeStats = function() {
  const countSpan = document.getElementById('stats-articles-count');
  if (countSpan) {
    countSpan.textContent = ARTICLES.length.toString();
  }
  const categoryCountSpan = document.getElementById('stats-categories-count');
  if (categoryCountSpan) {
    const uniqueCategories = new Set(ARTICLES.map(art => art.category));
    categoryCountSpan.textContent = uniqueCategories.size.toString();
  }
};

/* --- DOM DOMContentLoaded INITIALIZER --- */
document.addEventListener('DOMContentLoaded', () => {
  // Theme check
  const savedTheme = localStorage.getItem('java-kb-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.documentElement.classList.add('dark');
    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');
    sunIcons.forEach(sunIcon => sunIcon.classList.remove('hidden'));
    moonIcons.forEach(moonIcon => moonIcon.classList.add('hidden'));
  }

  // Load telemetry metrics
  loadRecentHistory();

  // Populate welcome statistics
  window.updateWelcomeStats();



  // Initial render procedures
  setupSearch();
  renderSidebar();
  renderMobileCategories();
  renderArticles();
  setupKeyboardShortcuts();
  setupReadingProgressBar();
  window.renderHomeSeries();
  initBannerRotation();
});
export {};
