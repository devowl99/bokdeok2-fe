import axios from 'axios'
import { MOCK_ESTATES, MOCK_USER } from './mockData'

const api = axios.create({
    baseURL: '/api/v1',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Mock Adapter Logic (Simple Interceptor)
// 실제 백엔드 없이 개발하기 위한 간단한 mock 처리입니다.
api.interceptors.request.use(async (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.params || config.data)

    // Mock Latency
    await new Promise(resolve => setTimeout(resolve, 500))

    // 1. Estate List
    if (config.url === '/estate' && config.method === 'get') {
        return Promise.reject({
            response: {
                data: { success: true, data: MOCK_ESTATES },
                status: 200,
                headers: {},
                config: config
            },
            isMock: true // Custom flag to identify mock response
        })
    }

    // 2. Auth Login (Dummy)
    if (config.url === '/auth/login' && config.method === 'post') {
        return Promise.reject({
            response: {
                data: { success: true, data: { token: 'mock-jwt-token', user: MOCK_USER } },
                status: 200,
                headers: {},
                config: config
            },
            isMock: true
        })
    }

    return config
}, error => {
    return Promise.reject(error)
})

// Response Interceptor to unwrap Mock responses
api.interceptors.response.use(
    response => response,
    error => {
        // If it's our custom Mock response, treat it as success
        if (error.isMock && error.response) {
            console.log(`[API Mock Response]`, error.response.data)
            return Promise.resolve(error.response)
        }
        return Promise.reject(error)
    }
)

export default api
