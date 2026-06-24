import { State } from "./types";

export const state: State = {
  activeCategory: 'Todos',
  searchQuery: '',
  selectedArticleId: null,
  searchMode: 'articles',
  activeView: 'articles',
  recentArticles: [],
  drawerOpen: false,
  accessCount: {
    articles: {},
    dicas: {}
  }
};

export function saveStateToStorage(): void {
  try {
    sessionStorage.setItem('kb_access_articles', JSON.stringify(state.accessCount.articles));
    sessionStorage.setItem('kb_access_dicas', JSON.stringify(state.accessCount.dicas));
  } catch (e) {
    console.error("Erro ao salvar contagens de popularidade no sessionStorage:", e);
  }
}

export function loadStateFromStorage(): void {
  // Load access counts
  try {
    const storedArticles = sessionStorage.getItem('kb_access_articles');
    if (storedArticles) {
      state.accessCount.articles = JSON.parse(storedArticles);
    }
    const storedDicas = sessionStorage.getItem('kb_access_dicas');
    if (storedDicas) {
      state.accessCount.dicas = JSON.parse(storedDicas);
    }
  } catch (e) {
    console.error("Erro ao carregar contagens de popularidade do sessionStorage:", e);
  }

  // Load recent articles read
  try {
    const storedRecent = localStorage.getItem('java-kb-recent');
    if (storedRecent) {
      state.recentArticles = JSON.parse(storedRecent);
    }
  } catch (e) {
    console.error("Erro ao carregar histórico recente do localStorage:", e);
  }
}
