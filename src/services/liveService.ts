import axios, { AxiosRequestConfig } from 'axios'
import { API_CONFIG, M3U8_DATA_PATH, AGGREGATED_SEARCH_CONFIG, M3U8_PATTERN } from '../config/config'

export const getLiveStreamList = async () => {
    const response = await axios.get(M3U8_DATA_PATH)
    console.log(response)
    return response.data
}