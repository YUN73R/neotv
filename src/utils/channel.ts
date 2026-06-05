
export interface Channel {
    id: string
    name: string
    url: string
    category: string
}

export interface Category {
    id: string
    name: string
    channels: Channel[]
}

export const parseM3U = (content: string): Category[] => {
    const lines = content.split('\n')
    const channelMap = new Map<string, Channel[]>()
    let currentName = ''

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (line.startsWith('#EXTINF:')) {
            const nameMatch = line.match(/,(.*)$/)
            if (nameMatch) {
                currentName = nameMatch[1].trim()
            }
        } else if (line && !line.startsWith('#') && (line.startsWith('http://') || line.startsWith('https://'))) {
            if (currentName) {
                const category = categorizeChannel(currentName)

                const channel: Channel = {
                    id: `${currentName}_${line}`,
                    name: currentName,
                    url: line,
                    category
                }

                if (!channelMap.has(category)) {
                    channelMap.set(category, [])
                }
                channelMap.get(category)!.push(channel)
            }
        }
    }

    const categories: Category[] = []
    for (const [name, channels] of channelMap.entries()) {
        categories.push({ id: name, name: name, channels })
    }

    categories.sort((a, b) => {
        const order = ['央视', '卫视', '地方', '其他']
        const indexA = order.indexOf(a.name)
        const indexB = order.indexOf(b.name)
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
        }
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return a.name.localeCompare(b.name, 'zh-CN')
    })

    return categories
}

const categorizeChannel = (name: string): string => {
    if (/CCTV|央视/.test(name)) {
        return '央视'
    }
    if (/卫视/.test(name)) {
        return '卫视'
    }
    if (/地方|省|市|县|区|台|综合|新闻|生活|公共|影视|娱乐|教育|农村|都市|财经|体育|科技|法治|旅游|农业|少儿/.test(name)) {
        return '地方'
    }
    return '其他'
}
