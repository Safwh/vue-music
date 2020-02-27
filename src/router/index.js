import Vue from 'vue'
import Router from 'vue-router'

const Recommend = () => import(/* webpackChunkName: "recommend" */ 'components/recommend/recommend')
const Singer = () => import(/* webpackChunkName:'singer' */ 'components/singer/singer')
const Rank = () => import(/* webpackChunkName:'rank' */ 'components/rank/rank')
const Search = () => import(/* webpackChunkName:'search' */ 'components/search/search')
const SingerDetail = () => import(/* webpackChunkName:'singer' */ 'components/singer-detail/singer-detail')
const Disc = () => import(/* webpackChunkName:'disc' */ 'components/disc/disc')
const TopList = () => import(/* webpackChunkName:'toplist' */ 'components/top-list/top-list')
const UserCenter = () => import(/* webpackChunkName:'user' */ 'components/user-center/user-center')

Vue.use(Router)

export default new Router({
  mode: 'history', // 默认是hash，改成history，这样可以去掉#
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})
