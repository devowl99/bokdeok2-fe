import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/pages/Home.vue')
    },
    {
        path: '/map',
        name: 'Map',
        component: () => import('@/pages/estate/Map.vue')
    },
    {
        path: '/estate/:id',
        name: 'EstateDetail',
        component: () => import('@/pages/estate/EstateDetail.vue')
    },
    {
        path: '/scrap',
        name: 'Scrap',
        component: () => import('@/pages/scrap/Scrap.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/auth/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/pages/auth/Register.vue')
    },
    {
        path: '/mypage',
        name: 'MyPage',
        component: () => import('@/pages/mypage/MyPage.vue')
    },
    {
        path: '/mypage/edit',
        name: 'ProfileEdit',
        component: () => import('@/pages/mypage/ProfileEdit.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
