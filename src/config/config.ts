export interface TabConfig {
    category: string
    limit: number
    type: string
    title: string
    url: string
}

export const PLACEHOLDER_IMAGE = 'https://s41.ax1x.com/2026/06/05/pmZs8OO.md.png'
export const PLACEHOLDER_IMAGE_TV = 'https://s41.ax1x.com/2026/06/05/pmZ2gWd.md.png'

export const tabs: TabConfig[] = [
    { category: '最新', limit: 20, type: '全部', title: '推荐', url: 'movie' },
    { category: '热门', limit: 20, type: '全部', title: '电影', url: 'movie' },
    { category: 'tv', limit: 20, type: 'tv_domesti', title: '国产剧', url: 'tv' },
    { category: 'tv', limit: 20, type: 'tv_american', title: '欧美剧', url: 'tv' },
    { category: 'show', limit: 20, type: 'show', title: '综艺', url: 'tv' },
    { category: 'tv', limit: 20, type: 'tv_japanese', title: '日剧', url: 'tv' },
    { category: 'tv', limit: 20, type: 'tv_korean', title: '韩剧', url: 'tv' },
    { category: 'tv', limit: 20, type: 'tv_animation', title: '动画', url: 'tv' },
    { category: 'tv', limit: 20, type: 'tv_documentary', title: '纪录片', url: 'tv' },
]
export interface SiteConfig {
    api: string
    name: string
    detail?: string
}
export const API_SITES: Record<string, SiteConfig> = {
    ruyi: {
        api: 'https://cj.rycjapi.com',
        name: '如意',
    },
    dyttzy: {
        api: 'http://caiji.dyttzyapi.com',
        name: '电影天堂',
        detail: 'http://caiji.dyttzyapi.com',
    },
    bfzy: {
        api: 'https://bfzyapi.com',
        name: '暴风',
    },
    tyyszy: {
        api: 'https://tyyszy.com',
        name: '天涯',
    },
    xiaomaomi: {
        api: 'https://zy.xiaomaomi.cc',
        name: '小猫咪',
    },
    ffzy: {
        api: 'http://ffzy5.tv',
        name: '非凡影视',
        detail: 'http://ffzy5.tv',
    },
    heimuer: {
        api: 'https://json.heimuer.xyz',
        name: '黑木耳',
        detail: 'https://heimuer.tv',
    },
    zy360: {
        api: 'https://360zy.com',
        name: '360',
    },
    wolong: {
        api: 'https://wolongzyw.com',
        name: '卧龙',
    },
    hwba: {
        api: 'https://cjhwba.com',
        name: '华为吧',
    },
    jisu: {
        api: 'https://jszyapi.com',
        name: '极速',
        detail: 'https://jszyapi.com'
    },
    dbzy: {
        api: 'https://dbzy.com',
        name: '豆瓣',
    },
    mozhua: {
        api: 'https://mozhuazy.com',
        name: '魔爪',
    },
    mdzy: {
        api: 'https://www.mdzyapi.com',
        name: '魔都',
    },
    zuid: {
        api: 'https://api.zuidapi.com',
        name: '最大'
    },
    yinghua: {
        api: 'https://m3u8.apiyhzy.com',
        name: '樱花'
    },
    baidu: {
        api: 'https://api.apibdzy.com',
        name: '百度云'
    },
    wujin: {
        api: 'https://api.wujinapi.me',
        name: '无尽'
    },
    wwzy: {
        api: 'https://wwzy.tv',
        name: '旺旺短剧'
    },
    ikun: {
        api: 'https://ikunzyapi.com',
        name: 'iKun'
    },
    uuzy: {
        api: 'https://uuzy.me',
        name: 'UU资源'
    }
}

// 添加聚合搜索的配置选项 
export const AGGREGATED_SEARCH_CONFIG = {
    enabled: true,             // 是否启用聚合搜索 
    timeout: 8000,            // 单个源超时时间（毫秒） 
    maxResults: 10000,          // 最大结果数量 
    parallelRequests: true,   // 是否并行请求所有源 
    showSourceBadges: true    // 是否显示来源徽章 
}

// 抽象API请求配置 
export const API_CONFIG = {
    search: {
        // 修改搜索接口支持分页参数 
        path: '/api.php/provide/vod/?ac=videolist&wd=',
        pagePath: '/api.php/provide/vod/?ac=videolist&wd={query}&pg={page}',
        maxPages: 50, // 最大获取页数 
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
    },
    detail: {
        // 修改详情接口也使用videolist接口，但是通过ID查询，减少请求次数 
        path: '/api.php/provide/vod/?ac=videolist&ids=',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
    }
}
export const M3U8_DATA_PATH = '../assets/data/iptv.m3u'
export const M3U8_PATTERN = /\$https?:\/\/[^"'\s]+?\.m3u8/g
