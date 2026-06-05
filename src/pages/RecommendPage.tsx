import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, BackHandler } from 'react-native'
import { doubanApi } from '../utils/api'
import { MaterialIcons, Fontisto } from '@expo/vector-icons'
import { useTheme, SECONDARY_COLOR, BOX_SHADOW } from '../context/ThemeContext'
import FocusableView from '../layouts/FocusableView'
import { formatRecommendTags } from '../services/recommendService'
import { PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE_TV } from '../config/config'

interface RecommendPageProps {
    onBack: () => void,
    onNavigate: (route: string, params?: any) => void,
}
interface Params {
    start?: number,
    category?: string,
    selected_categories?: string,
    sort?: string | undefined | null,
    tags?: string,
    isAllType?: boolean,
}
const RecommendPage: React.FC<RecommendPageProps> = ({ onBack, onNavigate }) => {
    const isTV = Platform.isTV || Platform.OS === 'ios' || Platform.OS === 'android'
    const { theme, themeMode } = useTheme()
    const scrollViewRef = useRef<ScrollView>(null)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const [recommendLoading, setRecommendLoading] = useState<boolean>(true)
    const [years, setYears] = useState<Array<any>>([])
    const [tags, setTags] = useState<Array<any>>([])
    const [sorts, setSorts] = useState<Array<any>>([])
    const [currentTag, setCurrentTag] = useState<any>({})
    const [currentType, setCurrentType] = useState<number>(0)
    const [currentArea, setCurrentArea] = useState<number>(0)
    const [currentYear, setCurrentYear] = useState<number>(0)
    const [currentSort, setCurrentSort] = useState<number>(0)
    const [params, setParams] = useState<Params>({})
    const [recommends, setRecommends] = useState<Array<any>>([])
    const [start, setStart] = useState<number>(0)
    const scrollY = useRef<number>(0)
    const hasScrolledPast = useRef<boolean>(false)

    const isFirstRender = useRef(true)

    const getRecommendList = useCallback(async (params: Params, loading = false, isLoadMore = false) => {
        if (isLoadMore && (!hasMore || loadingMore)) {
            return
        }
        
        if (loading) {
            setRecommendLoading(true)
        }
        
        try {
            const requestParams = {
                ...params,
                start: isLoadMore ? start : 0,
            }
            
            const res = await (requestParams.isAllType 
                ? doubanApi.getHotMovies({ start: requestParams.start, category: requestParams.category || 'movie' }) 
                : doubanApi.getMovieRecommends(requestParams as any))
            
            const recs = res.data?.items?.filter((item: any) => item.id != null) ?? []
            
            if (isLoadMore) {
                setRecommends(prev => [...prev, ...recs])
                if (recs.length < 20) {
                    setHasMore(false)
                }
            } else {
                setRecommends(recs)
                setStart(recs.length)
                setHasMore(recs.length >= 20)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingMore(false)
            setRecommendLoading(false)
        }
    }, [start, hasMore, loadingMore])

    useEffect(() => {
        getMovieTags()
    }, [])

    const getMovieTags = async () => {
        try {
            const { years, tags, sorts } = await formatRecommendTags()
            setYears(years)
            setTags(tags)
            setSorts(sorts)
            const defaultTag = tags.find(item => item.default)
            if (defaultTag) {
                setCurrentTag(defaultTag)
                setTimeout(() => {
                    const par = {
                        isAllType: true,
                        category: defaultTag.id,
                        tags: '',
                        selected_categories: '{}',
                        sort: sorts[0]?.name,
                    }
                    getRecommendList(par, true, false)
                }, 0)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const onCategoryChange = (item: any, type?: string | null, index?: number | undefined) => {
        setCurrentTag(item)
        setCurrentType(0)
        setCurrentArea(0)
        setCurrentYear(0)
        setCurrentSort(0)
        setStart(0)
        setRecommends([])
        setHasMore(true)
    }
    const onTagsChange = (type: string, index: number) => {
        if (type === 'type') setCurrentType(index)
        if (type === 'area') setCurrentArea(index)
        if (type === 'year') setCurrentYear(index)
        if (type === 'sort') setCurrentSort(index)
        setStart(0)
        setRecommends([])
        setHasMore(true)
    }

    function getCurrentParams() {
        const category = currentTag
        const year = years[currentYear]
        const sort = sorts[currentSort]
        const type = currentTag.categories?.find((item: any) => item.id == 'type')?.tags[currentType]
        const area = currentTag.categories?.find((item: any) => item.id == 'area')?.tags[currentArea]
        let cate_str = ''
        if(category.id == 'tv' && type == '全部') cate_str += `"类型":""`
        else if (type != '全部') cate_str += `"类型":"${type}"`
        if (area?.text != '全部') cate_str += `${cate_str ? ',' : ''}"地区":"${area?.text}"`
        if (category.id != 'movie') cate_str += `${cate_str ? ',' : ''}"形式":"${category.name}"`
        let tag_str = ''
        if (type != '全部') tag_str += type
        if (area?.text != '全部') tag_str += `${tag_str ? ',' : ''}${area?.text}`
        if (year != '全部') tag_str += `${tag_str ? ',' : ''}${year}`
        const par = {
            isAllType: type == '全部' && area?.text == '全部' && year == '全部',
            category: category.id,
            tags: tag_str,
            selected_categories: cate_str ? `{${cate_str}}` : '{}',
            sort: sort?.name,
        }
        return par
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        const par = getCurrentParams()
        setParams(par)
        setStart(0)
        setRecommends([])
        setHasMore(true)
        getRecommendList(par, true, false)
    }, [currentTag, currentType, currentArea, currentYear, currentSort])

    const handleScroll = useCallback((e: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
        const paddingToBottom = 400
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
        
        if (isCloseToBottom && !loadingMore && hasMore) {
            setLoadingMore(true)
            setStart(prev => prev + 20)
            const par = getCurrentParams()
            getRecommendList(par, false, true)
        }
    }, [loadingMore, hasMore, getRecommendList])

    // 监听滚动位置
    const handleScrollPosition = useCallback((e: any) => {
        const offsetY = e.nativeEvent.contentOffset.y
        scrollY.current = offsetY
    }, [])

    // 返回按钮逻辑：滚动超过220则滚动到顶部，否则直接退出
    const onBackPress = useCallback(() => {
        if (scrollY.current > 220) {
            hasScrolledPast.current = true
            scrollViewRef.current?.scrollTo({ y: 0, animated: true })
            return true
        } else {
            onBack()
            return true
        }
    }, [onBack])

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => backHandler.remove()
    }, [onBackPress])

    const node = (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {!isTV && <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <FocusableView
                    style={[styles.backButton, { backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                    onPress={onBackPress}
                >
                    <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                </FocusableView>
                <Text style={[styles.title, { color: theme.text }]}>更多推荐</Text>
                <View style={styles.headerRight} />
            </View>}
            <ScrollView 
                style={[styles.content, { backgroundColor: theme.background }]}
                ref={scrollViewRef}
                scrollEventThrottle={100}
                onScroll={(e) => {
                    handleScroll(e)
                    handleScrollPosition(e)
                }}
            >
                <View style={styles.tagContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.category} data-type="category">
                            {
                                tags.map((item, index) => {
                                    return (
                                        <FocusableView
                                            onPress={() => onCategoryChange(item)}
                                            style={[styles.tag, { backgroundColor: currentTag.id == item.id ? theme.accent : 'transparent' }]}
                                            key={item.id}
                                            focusBorderColor={SECONDARY_COLOR} >
                                            <Text style={[styles.tagText, { color: currentTag.id == item.id ? 'white' : theme.text }]}>{item.name}</Text>
                                        </FocusableView>
                                    )
                                })
                            }
                        </View>
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.category} data-type="type">
                            {
                                currentTag.categories?.find((cate: any) => cate.id == 'type')?.tags?.map((item: any, index: number) => {
                                    return (
                                        <FocusableView
                                            onPress={() => onTagsChange('type', index)}
                                            style={[styles.tag, { backgroundColor: index == currentType ? theme.accent : 'transparent' }]}
                                            key={item + index}
                                            focusBorderColor={SECONDARY_COLOR} >
                                            <Text style={[styles.tagText, { color: index == currentType ? 'white' : theme.text }]}>{item}</Text>
                                        </FocusableView>
                                    )
                                })
                            }
                        </View>
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.category} data-type="area">
                            {
                                currentTag.categories?.find((cate: any) => cate.id == 'area')?.tags?.map((item: any, index: number) => {
                                    return (
                                        <FocusableView
                                            onPress={() => onTagsChange('area', index)}
                                            style={[styles.tag, { backgroundColor: index == currentArea ? theme.accent : 'transparent' }]}
                                            key={item.text}
                                            focusBorderColor={SECONDARY_COLOR} >
                                            <Text style={[styles.tagText, { color: index == currentArea ? 'white' : theme.text }]}>{item.text}</Text>
                                        </FocusableView>
                                    )
                                })
                            }
                        </View>
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.category} data-type="year">
                            {
                                years.map((item: any, index: number) => {
                                    return (
                                        <FocusableView
                                            onPress={() => onTagsChange('year', index)}
                                            style={[styles.tag, { backgroundColor: index == currentYear ? theme.accent : 'transparent' }]}
                                            key={item}
                                            focusBorderColor={SECONDARY_COLOR} >
                                            <Text style={[styles.tagText, { color: index == currentYear ? 'white' : theme.text }]}>{item}</Text>
                                        </FocusableView>
                                    )
                                })
                            }
                        </View>
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.category} data-type="sort">
                            {
                                sorts.map((item: any, index: number) => {
                                    return (
                                        <FocusableView
                                            onPress={() => onTagsChange('sort', index)}
                                            style={[styles.tag, { backgroundColor: index == currentSort ? theme.accent : 'transparent' }]}
                                            key={item.name}
                                            focusBorderColor={SECONDARY_COLOR} >
                                            <Text style={[styles.tagText, { color: index == currentSort ? 'white' : theme.text }]}>{item.text}</Text>
                                        </FocusableView>
                                    )
                                })
                            }
                        </View>
                    </ScrollView>
                </View>
                <View style={styles.recommendContainer}>
                    {
                        recommendLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator
                                    size="large"
                                    color={theme.accent}
                                />
                                <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
                                    正在加载内容...
                                </Text>
                            </View>
                        ) : recommends.length == 0 ? (
                            <View style={styles.loadingContainer}>
                                <Fontisto name="smiley" size={24} color={theme.textSecondary} />
                                <Text style={{ color: theme.textSecondary, marginTop: 12, fontSize: 16 }}>
                                    没有符合条件的内容😂
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.recommendList}>
                                {
                                    recommends.map((item: any, index: number) => {
                                        const title = typeof item.title === 'string' ? item.title : ''
                                        const cover = item.pic?.normal
                                        const rating = item.rating && typeof item.rating === 'object' ? item.rating?.value : item?.rating ?? null
                                        const subtitle = item.card_subtitle?.split(' / ') || []
                                        const actors = subtitle.length ? `${subtitle?.[1] || '地区未知'} - ${subtitle?.[3] || '导演未知'}` : ''
                                        return (
                                            <FocusableView
                                                key={index}
                                                style={[styles.recommendItem, { flexBasis: isTV ? 100 : 140 }]}
                                                onPress={() => onNavigate('Detail', { movie: item })}
                                            >
                                                <View style={styles.imageContainer}>
                                                    <Image
                                                        defaultSource={{
                                                            uri: PLACEHOLDER_IMAGE,
                                                        }}
                                                        source={{ 
                                                            uri: cover,
                                                            headers: {
                                                                referrer: 'https://m.douban.com/',
                                                            }
                                                         }}
                                                        crossOrigin="anonymous"
                                                        style={styles.recommendImage}
                                                        resizeMode="cover"
                                                    />
                                                    {rating != null && (
                                                        <View style={[styles.ratingBadge, { backgroundColor: theme.secondary }]}>
                                                            <MaterialIcons name="star" size={10} color="white" />
                                                            <Text style={styles.ratingBadgeText}>{rating?.toFixed?.(1)}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.titleContainer}>
                                                    <Text style={[styles.contentTitle, { color: theme.text }]} numberOfLines={1}>
                                                        {title}
                                                    </Text>
                                                    <Text style={[styles.actorsText, { color: theme.textSecondary }]} numberOfLines={1}>
                                                        {actors}
                                                    </Text>
                                                </View>
                                            </FocusableView>
                                        )
                                    })
                                }
                                {Array.from({ length: 10 }).map((_, index) => <View key={index} style={{ flex: 1, height: 0, flexBasis: isTV ? 100 : 140 }} />)}
                                {loadingMore && (
                                    <View style={styles.loadingMoreContainer}>
                                        <ActivityIndicator size="small" color={theme.accent} />
                                        <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>加载更多...</Text>
                                    </View>
                                )}
                            </View>
                        )}
                </View>
            </ScrollView>
        </View>
    )
    
    return node
}
const styles = StyleSheet.create({
    container: {
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        width: 26,
        height: 26,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    headerRight: {
        width: 26,
    },
    content: {
        margin: 15,
    },
    tagContainer: {
        flexDirection: 'column',
        gap: 10,
        marginBottom: 20,
        minHeight: 185
    },
    category: {
        flexDirection: 'row',
        gap: 10,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.8)',
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    recommendContainer: {
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    loadingContainer: {
        paddingVertical: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingMoreContainer: {
        width: '100%',
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recommendList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    recommendItem: {
        flex: 1,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        flexDirection: 'column',
        boxShadow: BOX_SHADOW,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 12 / 16,
    },
    recommendImage: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderBottomLeftRadius: 6,
        gap: 2,
    },
    ratingBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 8,
        flexDirection: 'column',
        gap: 5
    },
    contentTitle: {
        fontSize: 12,
    },
    actorsText: {
        fontSize: 10,
    },
})

export default RecommendPage