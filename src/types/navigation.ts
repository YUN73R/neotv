export interface MovieItem {
  id: string;
  title: string;
  pic?: {
    normal?: string;
    large?: string;
    small?: string;
  };
  cover_url?: string;
  rating?: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  cover_url: string;
  rating?: number;
  timestamp: number;
  movie?: MovieItem;
}

export interface FavoriteItem {
  id: string;
  title: string;
  cover_url: string;
  rating?: number;
  favoriteTime: number;
  movie?: MovieItem;
}

export type RootStackParamList = {
  Home: undefined;
  Detail: { movie: MovieItem };
  Live: undefined;
  Settings: undefined;
  History: undefined;
  Favorites: undefined;
  Search: undefined;
  Recommend: undefined;
};
