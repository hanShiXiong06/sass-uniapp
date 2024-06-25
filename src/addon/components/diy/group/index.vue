<template>
    <view class="diy-group" id="componentList">
        <top-tabbar :scrollTop="scrollTop" v-if="data.global && Object.keys(data.global).length && data.global.topStatusBar && data.global.topStatusBar.isShow" ref="topTabbarRef" :data="data.global" />
        <view v-for="(component, index) in data.value" :key="component.id"
        @click="diyStore.changeCurrentIndex(index, component)"
        :class="getComponentClass(index,component)" :style="component.pageStyle">
            <view class="relative" :style="{ marginTop : component.margin.top < 0 ? (component.margin.top * 2) + 'rpx' : '0' }">
                <!-- 装修模式下，设置负上边距后超出的内容，禁止选中设置 -->
                <view v-if="isShowPlaceHolder(index,component)" class="absolute w-full z-1" :style="{ height : (component.margin.top * 2 * -1) + 'rpx' }" @click.stop="placeholderEvent"></view>
            <template v-if="component.componentName == 'ActiveCube'">
                <diy-active-cube :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'CarouselSearch'">
                <diy-carousel-search :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'FloatBtn'">
                <diy-float-btn :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'GraphicNav'">
                <diy-graphic-nav :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'HorzBlank'">
                <diy-horz-blank :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'HorzLine'">
                <diy-horz-line :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'HotArea'">
                <diy-hot-area :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'ImageAds'">
                <diy-image-ads :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'MemberInfo'">
                <diy-member-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'MemberLevel'">
                <diy-member-level :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'Notice'">
                <diy-notice :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'RichText'">
                <diy-rich-text :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'RubikCube'">
                <diy-rubik-cube :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'Text'">
                <diy-text :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'GoodsCoupon'">
                <diy-goods-coupon :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'GoodsList'">
                <diy-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'ManyGoodsList'">
                <diy-many-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'ShopExchangeGoods'">
                <diy-shop-exchange-goods :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'ShopExchangeInfo'">
                <diy-shop-exchange-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'ShopMemberInfo'">
                <diy-shop-member-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'ShopOrderInfo'">
                <diy-shop-order-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'ShopSearch'">
                <diy-shop-search :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'Article'">
                <diy-article :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'O2oGoodsList'">
                <diy-o2o-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'O2oMemberInfo'">
                <diy-o2o-member-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'O2oSearch'">
                <diy-o2o-search :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'O2oTechnician'">
                <diy-o2o-technician :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'FenxiaoGoodsList'">
                <diy-fenxiao-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'Brand'">
                <diy-brand :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'Jhkd'">
                <diy-jhkd :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'Bwc'">
                <diy-bwc :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'Meituan'">
                <diy-meituan :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'TourismHotel'">
                <diy-tourism-hotel :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'TourismTickets'">
                <diy-tourism-tickets :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            <template v-if="component.componentName == 'TourismTravel'">
                <diy-tourism-travel :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" />
            </template>
            </view>
        </view>
        <template v-if="diyStore.mode == '' && data.global.bottomTabBarSwitch">
            <view class="pt-[20rpx]"></view>
            <tabbar :addon="tabbarAddonName" />
        </template>
    </view>
</template>
<script lang="ts" setup>
   import diyGoodsCoupon from '@/addon/shop/components/diy/goods-coupon/index.vue';
   import diyGoodsList from '@/addon/shop/components/diy/goods-list/index.vue';
   import diyManyGoodsList from '@/addon/shop/components/diy/many-goods-list/index.vue';
   import diyShopExchangeGoods from '@/addon/shop/components/diy/shop-exchange-goods/index.vue';
   import diyShopExchangeInfo from '@/addon/shop/components/diy/shop-exchange-info/index.vue';
   import diyShopMemberInfo from '@/addon/shop/components/diy/shop-member-info/index.vue';
   import diyShopOrderInfo from '@/addon/shop/components/diy/shop-order-info/index.vue';
   import diyShopSearch from '@/addon/shop/components/diy/shop-search/index.vue';
   import diyArticle from '@/addon/cms/components/diy/article/index.vue';
   import diyO2oGoodsList from '@/addon/o2o/components/diy/o2o-goods-list/index.vue';
   import diyO2oMemberInfo from '@/addon/o2o/components/diy/o2o-member-info/index.vue';
   import diyO2oSearch from '@/addon/o2o/components/diy/o2o-search/index.vue';
   import diyO2oTechnician from '@/addon/o2o/components/diy/o2o-technician/index.vue';
   import diyFenxiaoGoodsList from '@/addon/shop_fenxiao/components/diy/fenxiao-goods-list/index.vue';
   import diyBrand from '@/addon/tk_jhkd/components/diy/brand/index.vue';
   import diyJhkd from '@/addon/tk_jhkd/components/diy/jhkd/index.vue';
   import diyBwc from '@/addon/tk_cps/components/diy/bwc/index.vue';
   import diyMeituan from '@/addon/tk_cps/components/diy/meituan/index.vue';
   import diyTourismHotel from '@/addon/tourism/components/diy/tourism-hotel/index.vue';
   import diyTourismTickets from '@/addon/tourism/components/diy/tourism-tickets/index.vue';
   import diyTourismTravel from '@/addon/tourism/components/diy/tourism-travel/index.vue';
   import topTabbar from '@/components/top-tabbar/top-tabbar.vue'
   import useDiyStore from '@/app/stores/diy';
   import { ref, onMounted, nextTick, computed, watch } from 'vue';
   import { useRouter } from 'vue-router';
   import { getLocation } from '@/utils/common';
   import Sortable from 'sortablejs';
   import { range } from 'lodash-es';
   import { onPageScroll } from '@dcloudio/uni-app'
   import useConfigStore from '@/stores/config'

   const props = defineProps(['data','pullDownRefreshCount']);
   const diyStore = useDiyStore();
   const router = useRouter();

   // 兼容轮播搜索组件-切换分类时，导致个人中心白屏 - start
   // #ifdef H5
   watch(() => router.currentRoute.value, (newRoute) => {
       if(newRoute.path != "/addon/shop/pages/index"){
           diyStore.topFixedStatus = 'home'
       }
   });

   // #endif

   // #ifdef MP
   wx.onAppRoute(function(res) {
       if(res.path != "addon/shop/pages/index"){
           diyStore.topFixedStatus = 'home'
       }
   });
   // #endif
   // 兼容轮播搜索组件-切换分类时，导致个人中心白屏 - end

   const data = computed(() => {
       if (diyStore.mode == 'decorate') {
           return diyStore;
       } else {
           return props.data;
       }
   })

   const tabbarAddonName = computed(() => {
       return useConfigStore().addon;
   })

   const positionFixed = ref(['fixed', 'top_fixed','right_fixed','bottom_fixed','left_fixed']);

   const getComponentClass = (index:any,component:any) => {

      let obj: any = {

         relative: true,

         selected: diyStore.currentIndex == index,

         decorate: diyStore.mode == 'decorate'

      }

      obj['top-fixed-' + diyStore.topFixedStatus] = true;

      if (component.position && positionFixed.value.indexOf(component.position) != -1) {

        //  找出置顶组件，设置禁止拖动

        obj['ignore-draggable-element'] = true;

      } else {

        obj['draggable-element'] = true;

      }

      return obj;

   }

   onMounted(() => {
       // #ifdef H5
       if (diyStore.mode == 'decorate') {
           var el = document.getElementById('componentList');
           const sortable = Sortable.create(el, {
               draggable: '.draggable-element',
               animation: 200,
               // 结束拖拽
               onEnd: event => {
                   let temp = diyStore.value[event.oldIndex!];
                   diyStore.value.splice(event.oldIndex!, 1);
                   diyStore.value.splice(event.newIndex!, 0, temp);

                   nextTick(() => {
                       sortable.sort(range(diyStore.value.length).map(value => {
                           return value.toString();
                       }));

                       diyStore.postMessage(event.newIndex, diyStore.value[event.newIndex]);
                   });
               }
           });
       }
       // #endif

       nextTick(() => {
           setTimeout(() => {
               if (data.value.global && data.value.global.topStatusBar && data.value.global.topStatusBar.style == 'style-4') {
                   // 第一次获取经纬度
                   getLocation()
               }
           }, 500)
       });

   });

   // 是否显示占位区域，用于禁止选中负上边距的内容
   const isShowPlaceHolder = (index: any, component: any) => {
       // #ifdef H5
       if (diyStore.mode == 'decorate') {
           let el: any = document.getElementById('componentList');
           if (el && el.children.length && el.children[index]) {
               let height = el.children[index].offsetHeight;
               let top = 0;
               if (component.margin.top < 0) {
                   top = component.margin.top * 2 * -1;
                   // 若负上边距大于组件的高度，则允许选中进行装修
                   if (top > height) {
                       return false;
                   }
               }
           }
           return true;
       }
       // #endif
       return false;
   }
   // 空函数，禁止选中
   const placeholderEvent = ()=>{}

   let topTabbarRef = ref(null);

   // 页面onShow调用时，也会触发改方法
   const refresh = ()=>{
       nextTick(()=>{
           topTabbarRef.value?.refresh();
       });
   }

   let scrollTop = ref(0)
   onPageScroll((e)=>{
       scrollTop.value = e.scrollTop;
   })

   defineExpose({
       refresh
   })
</script>
<style lang="scss" scoped>
   @import './index.scss';
</style>
