<template>

  <div id="detail" >

    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
          <!-- <div v-for="item of this.$store.state.cartList">{{item}}</div> -->
    <scroll class="content" ref="scroll" :probe-type="3" @scroll="contentScroll">
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @detailItemImageLoad="imageLoad"/>
      <detail-param-info ref="params" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :comment-info="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>
    <back-top @click.native="backTop" v-show="isShowBackTop"/>
    <detail-bottom-bar @addCart="addToCart" />
    <!-- <toast :message="message" :show="show"/> -->
  </div>
</template>

<script>
  import DetailNavBar from './childComps/DetailNavBar'
  import DetailSwiper from './childComps/DetailSwiper'
  import DetailBaseInfo from './childComps/DetailBaseInfo'
  import DetailShopInfo from './childComps/DetailShopInfo'
  import DetailGoodsInfo from './childComps/DetailGoodsInfo'
  import DetailParamInfo from './childComps/DetailParamInfo'
  import DetailCommentInfo from './childComps/DetailCommentInfo'
  import DetailBottomBar from './childComps/DetailBottomBar'

  import Scroll from 'components/common/scroll/Srcoll'
  import GoodsList from 'components/content/goods/GoodsList'
  // import Toast from 'components/common/toast/Toast'

  import {getDetail, Goods, Shop, GoodsParam, getRecommend} from 'network/detail'
  import {debounce} from "common/utils"
  import {itemListenerMixin, backTopMixin} from 'common/mixin'

  import {mapActions} from 'vuex'
  
  export default {
    name: "Detail",
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      DetailBottomBar,
      Scroll,
      GoodsList,
    },
    mixins: [itemListenerMixin,backTopMixin],
    data() {
      return {
        iid: null,
        topImages: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommends: [],
        themeTopYs: [],
        getThemeTopY: null,
        itemImgListener: null,
        refresh: null,
        currentIndex: 0
      }
    },
    created() {
      this.iid = this.$route.params.iid

      // 2.请求详情数据
      getDetail(this.iid).then(res =>{
        //console.log(res)
        const data = res.result
        //1.获取顶部的图片轮播数据
        this.topImages = data.itemInfo.topImages
        // 2.获取商品信息
        this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)
        // 3.创建店铺信息的对象
        this.shop = new Shop(data.shopInfo)
        // 4.保存商品的详情数据
        this.detailInfo = data.detailInfo;
        // 5.获取参数信息
        this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)
        //6.取出评论的信息
        if (data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0]
        }

      })
      // 3.推荐数据
      getRecommend().then(res => {
        //console.log(res);
        this.recommends = res.data.list
      })

      this.getThemeTopY = debounce(() => {
        this.themeTopYs = [];
        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
        this.themeTopYs.push(Number.MAX_VALUE);
        console.log(this.themeTopYs)
      }, 200)
    },
    mounted() {  
      this.refresh = debounce(this.$refs.scroll.refresh, 100)
      this.itemImgListener = () => { 
        this.refresh();
      }
      this.$bus.$on('detailItemImageLoad', this.itemImgListener)

    },
    updated() {      
        
    },
    destroyed() {
      this.$bus.$off('detailItemImageLoad', this.itemImgListener)
    },
    methods: {
      ...mapActions(['addCart']),
      imageLoad () {
        this.refresh()
        // this.getThemeTopY()
        // console.log('eeeeeeeeee')
        this.getThemeTopY();
      },
      titleClick (index) {
        this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 100)
      },
      contentScroll (position) {
        const positionY = -position.y
        let len = this.themeTopYs.length
        for (let i = 0; i < len -1; ++i ) {
          if(this.currentIndex !== i && ( positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1] ) ) {
             this.currentIndex = i;
             this.$refs.nav.currentIndex = this.currentIndex
          }
        }
        this.isShowBackTop = (-position.y) > 1000
      },
      addToCart() {
        // 1.获取购物车需要展示的信息
        const product = {};
        product.image = this.topImages[0];
        product.title = this.goods.title;
        product.desc = this.goods.desc;
        product.newPrice = this.goods.realPrice;
        product.iid = this.iid
        // 2.将商品加入购物车
        // this.$store.commit('addCart', product)
        // this.$store.dispatch('addCart', product).then(res => {
        //   console.log(res)
        // })
        this.addCart(product).then(res => {
          // this.show = true;
          // this.message = res;

          // setTimeout(() => {
          //   this.show = false;
          //   this.message = ''
          // }, 1500)
          this.$toast.show(res, 1500)
        })
      }
    }
  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }
  .content {
    height: calc(100% - 44px - 49px);
  }
</style>