export interface ChangelogItem {
  date: string;
  version: string;
  author: string;
  changes: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  imageUrl?: string;
  youtubeId?: string;
  summary: string;
  content: string;
  seriesId?: string | null;
  changelog?: ChangelogItem[];
}

export interface Series {
  id: string;
  title?: string;
  name: string;
  description: string;
  articles: string[];
}

export interface CategoryColor {
  bg: string;
  text: string;
  border: string;
}

export interface Dica {
  id: string;
  category: string;
  description: string;
  code: string;
  innerHTML: string;
  article: Article;
}

export interface State {
  activeCategory: string;
  searchQuery: string;
  selectedArticleId: string | null;
  searchMode: 'articles' | 'code';
  activeView: 'articles' | 'cheatsheet' | 'snippets';
  activeCheatsheetCategory?: string;
  recentArticles: string[]; // store IDs
  drawerOpen: boolean;
  accessCount: {
    articles: Record<string, number>;
    dicas: Record<string, number>;
  };
}

