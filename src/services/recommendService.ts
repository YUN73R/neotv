import { doubanApi } from '../utils/api'


export const formatRecommendTags = async () => {
    const years = await doubanApi.getMovieTags()
    const tvTags = await doubanApi.getMovieRecommends({ category: 'tv' })
    const movieTags = await doubanApi.getMovieRecommends({ category: 'movie' })
    const yearTags = years.data.tags.find((tag: Record<string, any>) => tag.type == '年代')?.tags ?? []
    const sorts = tvTags.data.sorts ?? []

    const alltags = [
        {
            id: 'movie',
            name: '电影',
            default: true,
            categories: [
                {
                    id: 'type',
                    name: '类型',
                    tags: movieTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '类型')?.data?.map((da: any) => da.text) ?? []
                },
                {
                    id: 'area',
                    name: '地区',
                    tags: movieTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '地区')?.data ?? []
                },
            ]
        }, {
            id: 'tv',
            name: '电视剧',
            default: false,
            categories: [
                {
                    id: 'type',
                    name: '类型',
                    tag_groups: tvTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '类型')?.tag_groups ?? null,
                    tags: ['全部', ...tvTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '类型')?.data.find((d: Record<string, any>) => d.text == '电视剧')?.tags ?? []]
                },
                {
                    id: 'area',
                    name: '地区',
                    tags: tvTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '地区')?.data ?? []
                },
            ]
        },
        {
            id: 'program',
            name: '综艺',
            default: false,
            categories: [
                {
                    id: 'type',
                    name: '类型',
                    tag_groups: tvTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '类型')?.tag_groups ?? null,
                    tags: tvTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '类型')?.data.find((d: Record<string, any>) => d.text == '综艺')?.tags ?? []
                },
                {
                    id: 'area',
                    name: '地区',
                    tags: tvTags.data.recommend_categories?.find((ca: Record<string, any>) => ca.type == '地区')?.data ?? []
                },
            ]
        }
    ]
    return {
        years: sortedYears(yearTags),
        tags: alltags,
        sorts,
    }
}

// 提取数字的辅助函数
const getYearNumber = (item: string): number => {
    if (item === "全部") return Infinity // 最大，永远在最前面
    if (item === "更早") return -Infinity // 最小，永远在最后面

    // 提取数字
    const match = item.match(/\d+/)
    if (!match) return 0

    let year = parseInt(match[0])

    // 处理 "90年代" 这种两位的
    if (year < 100) {
        year = 1900 + year
    }

    // 处理 "2020年代" 这种
    return year
}

// 判断是否是纯数字年份
const isPureYear = (item: string): boolean => {
    return /^\d{4}$/.test(item)
}

// 排序
export const sortedYears = (years: string[]) => {
    return [...years].sort((a, b) => {
        // 1. "全部" 永远在最前面
        if (a === "全部") return -1
        if (b === "全部") return 1

        // 2. "更早" 永远在最后面
        if (a === "更早") return 1
        if (b === "更早") return -1

        const numA = getYearNumber(a)
        const numB = getYearNumber(b)

        const isPureA = isPureYear(a)
        const isPureB = isPureYear(b)

        // 3. 纯数字年份 排在 带"年代"的前面
        if (isPureA && !isPureB) return -1
        if (!isPureA && isPureB) return 1

        // 4. 同类的按数字降序
        return numB - numA
    })
}