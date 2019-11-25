<template>
  <div id = "home">
    <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
    <tab-control :titles="['流行', '新款', '精选']" 
                 @tabClick = "tabClick"
                 ref="tabControl1" 
                 class="tab-control" 
                 v-show="isTabFixed"></tab-control>
    <scroll class="content" 
            ref="scroll" 
            :probe-type="3" @scroll="contentScroll" 
            :pull-up-load= "true" @pullingUp="loadMore">
      <home-swiper :banners = "banners" @swiperImageLoad="swiperImageLoad"/>
      <recommend-view :recommends= "recommends"></recommend-view>
      <feature-view></feature-view>
      <tab-control :titles="['流行', '新款', '精选']" @tabClick = "tabClick"
                    ref="tabControl2" ></tab-control>
      <goods-list :goods="showGoods"/>
    </scroll>
    <back-top @click.native="backTop" v-show="isShowBackTop"/>
  </div>
</template>

<script>
  
  import {getHomeMultidata, getHomeGoods} from 'network/home'
  import {debounce} from "common/utils"
  import {itemListenerMixin, backTopMixin} from 'common/mixin'

  import HomeSwiper from './childComps/HomeSwiper'
  import RecommendView from './childComps/RecommendView'
  import FeatureView from './childComps/FeatureView'

  import NavBar from 'components/common/navbar/NavBar'
  import TabControl from 'components/content/tabControl/TabControl'
  import GoodsList from 'components/content/goods/GoodsList'
  import Scroll from 'components/common/scroll/Srcoll'


  export default {
    name: "Home",
    components: {
      NavBar,
      HomeSwiper,
      RecommendView,
      FeatureView,
      TabControl,
      GoodsList,
      Scroll,
    },
    mixins: [backTopMixin],
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          'pop':{page: 0, list: []},
          'new':{page: 0, list: []},
          'sell':{page: 0, list: []},
        },
        currentType: 'pop',
        tabOffsetTop: 0,
        isTabFixed: false,
        saveY: 0,
        itemImgListener: null,
        refresh: null
      }
    },
    computed: {
      showGoods() {
        return this.goods[this.currentType].list
      }
    },
    activated() {
      this.$refs.scroll.refresh()
      this.$refs.scroll.scrollTo(0, this.saveY, 0);
    },
    deactivated() {
      this.saveY = this.$refs.scroll.scroll.y
      // 取消全局事件的监听
      this.$bus.$off('itemImgageLoad', this.itemImgListener)
    },
    created() {
      //1. 请求多个数据
      this.getHomeMultidata();

      // 2. 请求商品数据
      this.getHomeGoods('pop');
      this.getHomeGoods('new');
      this.getHomeGoods('sell');


    },
    mounted() {
      this.refresh = debounce(this.$refs.scroll.refresh, 100)
      this.itemImgListener = () => { 
        this.refresh();
      }
      this.$bus.$on('itemImageLoad', this.itemImgListener)
      console.log('我是混入')
    },
    methods: {
      //时间监听
      tabClick(index) {

        switch (index) {
          case 0:
            this.currentType = 'pop';
            break;
          case 1:
            this.currentType = 'new';
            break;
          case 2:
            this.currentType = 'sell';
            break;
        }
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
      },
            
      // backClick() {
      //   this.$refs.scroll.scrollTo(0, 0, 500)
      // },

      contentScroll(position) {
        // 2.决定tabControl是否吸顶（position：fixed）
        this.isTabFixed = (-position.y) > this.tabOffsetTop
        
        // 1.判断BackTop 是否显示
        this.isShowBackTop = (-position.y) > 1000

      },

      loadMore() {
        this.getHomeGoods(this.currentType)
      },
      swiperImageLoad() {
        //获取tabcontrol的offsetTop
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop
      },

      //网络请求相关
      getHomeMultidata() {
        getHomeMultidata()
          .then(res => {
            this.banners = res.data.banner.list
            this.recommends = res.data.recommend.list
          })        
      },
      getHomeGoods(type) {
        const page = this.goods[type].page + 1; 
        getHomeGoods(type, page)
          .then(res => {
            //console.log(res);
            this.goods[type].list.push(...res.data.list)
            this.goods[type].page += 1
            
            this.$refs.scroll.finishPullUp()
          })
      },

    }
  }
</script>

<style scoped>

  #home {
    /* padding-top: 44px; */
    height: 100vh;
    position: relative;
  }
  .home-nav {
    background-color: var(--color-tint);
    color: #fff;
    /* position: fixed;
    left: 0;
    right: 0;
    top: 0; 
    z-index: 9; */
  }
  .content {
    /* height: 300px; */
    overflow: hidden;  

    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
  }
  .tab-control {
    position: relative;
    z-index: 9;
  }
</style>