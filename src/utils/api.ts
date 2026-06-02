import axios from 'axios';

const BASE_URL_WEB = 'https://videores.netlify.app/proxy/';
const BASE_URL = 'https://m.douban.com/rexxar/api/v2/';

//判断web环境还是app环境
const isWeb = window?.location?.hostname === 'localhost';
//根据环境选择baseURL
const baseURL = isWeb ? BASE_URL_WEB + BASE_URL : BASE_URL;

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Referer': 'https://m.douban.com/',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const doubanApi = {
  getWeeklyMovies: (count = 10) => {
    return api.get(`subject_collection/movie_weekly_best/items?start=0&count=${count}&updated_at=&items_only=1&type_tag=&for_mobile=1`);
  },
  getTabContent: (tab: { url: string; limit: number; category: string; type: string }, start = 0) => {
    const { url, limit, category, type } = tab;
    return api.get(`subject/recent_hot/${url}?start=${start}&limit=${limit}&category=${category}&type=${type}`);
  },
  getMovieDetail: (id: string) => {
    return api.get(`movie/${id}?ck=&for_mobile=1`);
  },
};

export default api;
