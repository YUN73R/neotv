import axios, { AxiosRequestConfig } from 'axios'
import { API_CONFIG, API_SITES, AGGREGATED_SEARCH_CONFIG, M3U8_PATTERN } from '../config/config'

export interface MovieSource {
    name: string
    title: string
    movie: any | null
    data: any[]
    success: boolean
    error?: string
}

export interface MovieDetailResult {
    sources: MovieSource[]
    found: boolean
    totalSources: number
    successSources: number
}

const createAxiosInstance = () => {
    const config: AxiosRequestConfig = {
        timeout: AGGREGATED_SEARCH_CONFIG.timeout,
        headers: API_CONFIG.search.headers,
    }
    return axios.create(config)
}

const getBaseURL = (): string => {
    return window.location?.hostname
        ? 'https://videores.netlify.app/proxy/'
        : ''
}

const searchMovieByDoubanId = async (
    httpClient: ReturnType<typeof createAxiosInstance>,
    siteKey: string,
    site: typeof API_SITES[string],
    doubanId: string,
    word: string
): Promise<{ found: boolean; movie?: any; error?: string }> => {
    const baseURL = getBaseURL()
    const searchUrl = `${baseURL}${baseURL ? encodeURIComponent(site.api + API_CONFIG.search.path + word) : `${site.api}${API_CONFIG.search.path}${encodeURIComponent(word)}`}`
    try {
        const response = await httpClient.get(searchUrl)
        const data = response.data

        if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
            return { found: false, error: '无搜索结果' }
        }

        const list = data.list
        const matchedMovie = list?.find((item: any) => item.vod_douban_id == doubanId)

        if (matchedMovie) {
            return { found: true, movie: matchedMovie }
        }

        return { found: false, error: '未找到匹配的电影' }
    } catch (error) {
        return { found: false, error: (error as Error).message }
    }
}

const fetchMovieDetail = async (
    httpClient: ReturnType<typeof createAxiosInstance>,
    siteKey: string,
    site: typeof API_SITES[string],
    vodId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
    const baseURL = getBaseURL()
    const detailApi = site.detail ?? site.api
    const detailUrl = `${baseURL}${detailApi}${API_CONFIG.detail.path}${vodId}`

    try {
        const response = await httpClient.get(detailUrl)
        const data = response.data

        if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
            return { success: false, error: '详情数据无效' }
        }

        return { success: true, data: data.list[0] }
    } catch (error) {
        console.warn(`[${siteKey}] 获取详情失败:`, error)
        return { success: false, error: (error as Error).message }
    }
}

export const getMovieDetail = async (doubanId: string, word: string): Promise<MovieDetailResult> => {
    console.log(`开始搜索电影: doubanId=${doubanId}, keyword=${word}`)

    const httpClient = createAxiosInstance()
    const sources: MovieSource[] = []
    const siteKeys = Object.keys(API_SITES)

    for (const siteKey of siteKeys) {
        sources.push({
            name: siteKey,
            title: API_SITES[siteKey].name,
            movie: null,
            data: [],
            success: false,
        })
    }

    try {
        const searchPromises = siteKeys.map((siteKey, index) =>
            searchMovieByDoubanId(httpClient, siteKey, API_SITES[siteKey], doubanId, word).then((result) => ({ index, result }))
        )

        const searchResults = await Promise.all(searchPromises)

        for (const { index, result } of searchResults) {
            if (result.found && result.movie) {
                sources[index].movie = result.movie
                sources[index].success = true
            } else {
                sources[index].error = result.error
            }
        }

        const foundSources = sources.filter(s => s.movie && s.success)
        console.log(`搜索完成，找到 ${foundSources.length} 个可用源`)


        for(let i in foundSources) {
            const result = foundSources[i].movie
            let episodes = []
            if (result.vod_play_url) {
                // 分割不同播放源
                const playSources = result.vod_play_url.split('$$$')

                // 提取第一个播放源的集数（通常为主要源）
                if (playSources.length > 0) {
                    const items: any[] = []
                    for(let source of playSources) {
                        const episodeList = source.split('#')
                        episodeList.forEach((ep: any, index: number) => {
                            const parts = ep.split('$')
                            const name = parts.length > 0 ? parts[0].replace(/^\s+|\s+$/g, '') : `第${index + 1}集`
                            const url = parts.length > 1 ? parts[1].replace(/^\s+|\s+$/g, '') : ''
                            items.push({ name, url })
                        })
                        
                        
                        // episodes = episodeList.map((ep: any, index: number) => {
                        //     const parts = ep.split('$')
                        //     const name = parts.length > 0 ? parts[0].replace(/^\s+|\s+$/g, '') : `第${index + 1}集`
                        //     const url = parts.length > 1 ? parts[1].replace(/^\s+|\s+$/g, '') : ''
                        //     return { name, url }
                        // }).filter((item: any) => item.url && ((item.url.startsWith('http://') && item.url.indexOf('m3u8') === -1) || (item.url.startsWith('https://') && item.url.indexOf('m3u8') === -1)))
                    }
                    episodes = items.filter((item: any) => item.url && ((item.url.startsWith('http://') && item.url.endsWith('m3u8')) || (item.url.startsWith('https://') && item.url.endsWith('m3u8'))))
                }
            }

            // 如果没有找到播放地址，尝试使用正则表达式查找m3u8链接
            // if (episodes.length === 0 && result.vod_play_url) {
            //     const matches = result.vod_play_url.match(M3U8_PATTERN) || []
            //     episodes = matches.map((link: string) => link.replace(/^\$/, ''))
            // }
            sources[i].data = episodes
            sources[i].success = true
        }

        const successCount = sources.filter(s => s.success).length
        console.log(`详情获取完成，成功 ${successCount}/${foundSources.length}`)

        return {
            sources,
            found: successCount > 0,
            totalSources: siteKeys.length,
            successSources: successCount,
        }

    } catch (error) {
        console.log('movieService 执行失败:', error)
        return {
            sources,
            found: false,
            totalSources: siteKeys.length,
            successSources: 0,
        }
    }
}