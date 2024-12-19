<template>
    <view class="diy-group" id="componentList">
        <top-tabbar :scrollBool="diyGroup.componentsScrollBool.TopTabbar" v-if="data.global && Object.keys(data.global).length && data.global.topStatusBar && data.global.topStatusBar.isShow" ref="topTabbarRef" :data="data.global" />
        <view v-for="(component, index) in data.value" :key="component.id"
        @click="diyStore.changeCurrentIndex(index, component)"
        :class="diyGroup.getComponentClass(index,component)" :style="component.pageStyle">
            <view class="relative" :style="{ marginTop : component.margin.top < 0 ? (component.margin.top * 2) + 'rpx' : '0' }">
                <!-- 装修模式下，设置负上边距后超出的内容，禁止选中设置 -->
                <view v-if="diyGroup.isShowPlaceHolder(index,component)" class="absolute w-full z-1" :style="{ height : (component.margin.top * 2 * -1) + 'rpx' }" @click.stop="diyGroup.placeholderEvent"></view>
            <template v-if="component.componentName == 'ActiveCube'">
                <diy-active-cube :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ActiveCube" />
            </template>
            <template v-if="component.componentName == 'CarouselSearch'">
                <diy-carousel-search :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.CarouselSearch" />
            </template>
            <template v-if="component.componentName == 'FloatBtn'">
                <diy-float-btn :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.FloatBtn" />
            </template>
            <template v-if="component.componentName == 'GraphicNav'">
                <diy-graphic-nav :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.GraphicNav" />
            </template>
            <template v-if="component.componentName == 'HorzBlank'">
                <diy-horz-blank :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.HorzBlank" />
            </template>
            <template v-if="component.componentName == 'HorzLine'">
                <diy-horz-line :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.HorzLine" />
            </template>
            <template v-if="component.componentName == 'HotArea'">
                <diy-hot-area :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.HotArea" />
            </template>
            <template v-if="component.componentName == 'ImageAds'">
                <diy-image-ads :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ImageAds" />
            </template>
            <template v-if="component.componentName == 'MemberInfo'">
                <diy-member-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.MemberInfo" />
            </template>
            <template v-if="component.componentName == 'MemberLevel'">
                <diy-member-level :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.MemberLevel" />
            </template>
            <template v-if="component.componentName == 'Notice'">
                <diy-notice :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Notice" />
            </template>
            <template v-if="component.componentName == 'PictureShow'">
                <diy-picture-show :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PictureShow" />
            </template>
            <template v-if="component.componentName == 'RichText'">
                <diy-rich-text :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.RichText" />
            </template>
            <template v-if="component.componentName == 'RubikCube'">
                <diy-rubik-cube :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.RubikCube" />
            </template>
            <template v-if="component.componentName == 'Text'">
                <diy-text :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Text" />
            </template>
            <template v-if="component.componentName == 'Article'">
                <diy-article :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Article" />
            </template>
            <template v-if="component.componentName == 'O2oGoodsList'">
                <diy-o2o-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.O2oGoodsList" />
            </template>
            <template v-if="component.componentName == 'O2oMemberInfo'">
                <diy-o2o-member-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.O2oMemberInfo" />
            </template>
            <template v-if="component.componentName == 'O2oSearch'">
                <diy-o2o-search :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.O2oSearch" />
            </template>
            <template v-if="component.componentName == 'O2oTechnician'">
                <diy-o2o-technician :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.O2oTechnician" />
            </template>
            <template v-if="component.componentName == 'Bwc'">
                <diy-bwc :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Bwc" />
            </template>
            <template v-if="component.componentName == 'Meituan'">
                <diy-meituan :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Meituan" />
            </template>
            <template v-if="component.componentName == 'ParentMember'">
                <diy-parent-member :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ParentMember" />
            </template>
            <template v-if="component.componentName == 'Poster'">
                <diy-poster :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Poster" />
            </template>
            <template v-if="component.componentName == 'TtnGraphicNav'">
                <diy-ttn-graphic-nav :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.TtnGraphicNav" />
            </template>
            <template v-if="component.componentName == 'TkVipLevel'">
                <diy-tk-vip-level :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.TkVipLevel" />
            </template>
            <template v-if="component.componentName == 'TkVipManage'">
                <diy-tk-vip-manage :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.TkVipManage" />
            </template>
            <template v-if="component.componentName == 'TkVipReal'">
                <diy-tk-vip-real :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.TkVipReal" />
            </template>
            <template v-if="component.componentName == 'GiftcardList'">
                <diy-giftcard-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.GiftcardList" />
            </template>
            <template v-if="component.componentName == 'VipcardCard'">
                <diy-vipcard-card :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.VipcardCard" />
            </template>
            <template v-if="component.componentName == 'VipcardReserve'">
                <diy-vipcard-reserve :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.VipcardReserve" />
            </template>
            <template v-if="component.componentName == 'VipcardStore'">
                <diy-vipcard-store :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.VipcardStore" />
            </template>
            <template v-if="component.componentName == 'GoodsCoupon'">
                <diy-goods-coupon :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.GoodsCoupon" />
            </template>
            <template v-if="component.componentName == 'GoodsList'">
                <diy-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.GoodsList" />
            </template>
            <template v-if="component.componentName == 'ManyGoodsList'">
                <diy-many-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ManyGoodsList" />
            </template>
            <template v-if="component.componentName == 'ShopExchangeGoods'">
                <diy-shop-exchange-goods :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopExchangeGoods" />
            </template>
            <template v-if="component.componentName == 'ShopExchangeInfo'">
                <diy-shop-exchange-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopExchangeInfo" />
            </template>
            <template v-if="component.componentName == 'ShopGoodsRanking'">
                <diy-shop-goods-ranking :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopGoodsRanking" />
            </template>
            <template v-if="component.componentName == 'ShopGoodsRecommend'">
                <diy-shop-goods-recommend :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopGoodsRecommend" />
            </template>
            <template v-if="component.componentName == 'ShopMemberInfo'">
                <diy-shop-member-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopMemberInfo" />
            </template>
            <template v-if="component.componentName == 'ShopNewcomer'">
                <diy-shop-newcomer :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopNewcomer" />
            </template>
            <template v-if="component.componentName == 'ShopOrderInfo'">
                <diy-shop-order-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopOrderInfo" />
            </template>
            <template v-if="component.componentName == 'ShopSearch'">
                <diy-shop-search :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.ShopSearch" />
            </template>
            <template v-if="component.componentName == 'SingleRecommend'">
                <diy-single-recommend :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.SingleRecommend" />
            </template>
            <template v-if="component.componentName == 'Brand'">
                <diy-brand :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Brand" />
            </template>
            <template v-if="component.componentName == 'Jhkd'">
                <diy-jhkd :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.Jhkd" />
            </template>
            <template v-if="component.componentName == 'FenxiaoGoodsList'">
                <diy-fenxiao-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.FenxiaoGoodsList" />
            </template>
            <template v-if="component.componentName == 'PhoneGoodsCoupon'">
                <diy-phone-goods-coupon :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneGoodsCoupon" />
            </template>
            <template v-if="component.componentName == 'PhoneGoodsList'">
                <diy-phone-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneGoodsList" />
            </template>
            <template v-if="component.componentName == 'PhoneManyGoodsList'">
                <diy-phone-many-goods-list :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneManyGoodsList" />
            </template>
            <template v-if="component.componentName == 'PhoneShopExchangeGoods'">
                <diy-phone-shop-exchange-goods :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneShopExchangeGoods" />
            </template>
            <template v-if="component.componentName == 'PhoneShopExchangeInfo'">
                <diy-phone-shop-exchange-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneShopExchangeInfo" />
            </template>
            <template v-if="component.componentName == 'PhoneShopMemberInfo'">
                <diy-phone-shop-member-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneShopMemberInfo" />
            </template>
            <template v-if="component.componentName == 'PhoneShopOrderInfo'">
                <diy-phone-shop-order-info :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneShopOrderInfo" />
            </template>
            <template v-if="component.componentName == 'PhoneShopSearch'">
                <diy-phone-shop-search :component="component" :global="data.global" :index="index" :pullDownRefreshCount="props.pullDownRefreshCount" :scrollBool="diyGroup.componentsScrollBool.PhoneShopSearch" />
            </template>
            </view>
        </view>
        <template v-if="diyStore.mode == '' && data.global.bottomTabBarSwitch">
            <view class="pt-[20rpx]"></view>
            <tabbar />
        </template>
    </view>
</template>
<script lang="ts" setup>
   import diyArticle from '@/addon/cms/components/diy/article/index.vue';
   import diyO2oGoodsList from '@/addon/o2o/components/diy/o2o-goods-list/index.vue';
   import diyO2oMemberInfo from '@/addon/o2o/components/diy/o2o-member-info/index.vue';
   import diyO2oSearch from '@/addon/o2o/components/diy/o2o-search/index.vue';
   import diyO2oTechnician from '@/addon/o2o/components/diy/o2o-technician/index.vue';
   import diyBwc from '@/addon/tk_cps/components/diy/bwc/index.vue';
   import diyMeituan from '@/addon/tk_cps/components/diy/meituan/index.vue';
   import diyParentMember from '@/addon/tt_niucloud/components/diy/parent-member/index.vue';
   import diyPoster from '@/addon/tt_niucloud/components/diy/poster/index.vue';
   import diyTtnGraphicNav from '@/addon/tt_niucloud/components/diy/ttn-graphic-nav/index.vue';
   import diyTkVipLevel from '@/addon/tk_vip/components/diy/tk-vip-level/index.vue';
   import diyTkVipManage from '@/addon/tk_vip/components/diy/tk-vip-manage/index.vue';
   import diyTkVipReal from '@/addon/tk_vip/components/diy/tk-vip-real/index.vue';
   import diyGiftcardList from '@/addon/shop_giftcard/components/diy/giftcard-list/index.vue';
   import diyVipcardCard from '@/addon/vipcard/components/diy/vipcard-card/index.vue';
   import diyVipcardReserve from '@/addon/vipcard/components/diy/vipcard-reserve/index.vue';
   import diyVipcardStore from '@/addon/vipcard/components/diy/vipcard-store/index.vue';
   import diyGoodsCoupon from '@/addon/shop/components/diy/goods-coupon/index.vue';
   import diyGoodsList from '@/addon/shop/components/diy/goods-list/index.vue';
   import diyManyGoodsList from '@/addon/shop/components/diy/many-goods-list/index.vue';
   import diyShopExchangeGoods from '@/addon/shop/components/diy/shop-exchange-goods/index.vue';
   import diyShopExchangeInfo from '@/addon/shop/components/diy/shop-exchange-info/index.vue';
   import diyShopGoodsRanking from '@/addon/shop/components/diy/shop-goods-ranking/index.vue';
   import diyShopGoodsRecommend from '@/addon/shop/components/diy/shop-goods-recommend/index.vue';
   import diyShopMemberInfo from '@/addon/shop/components/diy/shop-member-info/index.vue';
   import diyShopNewcomer from '@/addon/shop/components/diy/shop-newcomer/index.vue';
   import diyShopOrderInfo from '@/addon/shop/components/diy/shop-order-info/index.vue';
   import diyShopSearch from '@/addon/shop/components/diy/shop-search/index.vue';
   import diySingleRecommend from '@/addon/shop/components/diy/single-recommend/index.vue';
   import diyBrand from '@/addon/tk_jhkd/components/diy/brand/index.vue';
   import diyJhkd from '@/addon/tk_jhkd/components/diy/jhkd/index.vue';
   import diyFenxiaoGoodsList from '@/addon/shop_fenxiao/components/diy/fenxiao-goods-list/index.vue';
   import diyPhoneGoodsCoupon from '@/addon/phone_shop/components/diy/phone-goods-coupon/index.vue';
   import diyPhoneGoodsList from '@/addon/phone_shop/components/diy/phone-goods-list/index.vue';
   import diyPhoneManyGoodsList from '@/addon/phone_shop/components/diy/phone-many-goods-list/index.vue';
   import diyPhoneShopExchangeGoods from '@/addon/phone_shop/components/diy/phone-shop-exchange-goods/index.vue';
   import diyPhoneShopExchangeInfo from '@/addon/phone_shop/components/diy/phone-shop-exchange-info/index.vue';
   import diyPhoneShopMemberInfo from '@/addon/phone_shop/components/diy/phone-shop-member-info/index.vue';
   import diyPhoneShopOrderInfo from '@/addon/phone_shop/components/diy/phone-shop-order-info/index.vue';
   import diyPhoneShopSearch from '@/addon/phone_shop/components/diy/phone-shop-search/index.vue';
   import topTabbar from '@/components/top-tabbar/top-tabbar.vue'
   import useDiyStore from '@/app/stores/diy';
   import { useDiyGroup } from './useDiyGroup';
   import { ref } from 'vue';

   const props = defineProps(['data','pullDownRefreshCount']);
   const topTabbarRef = ref(null);
   const diyStore = useDiyStore();
   const diyGroup = useDiyGroup({
       ...props,
       getFormRef() {
           return {
               topTabbarRef: topTabbarRef.value
           }
       }
   });
   const data = ref(diyGroup.data);

   // 监听页面加载完成
   diyGroup.onMounted();

   // 监听滚动事件
   diyGroup.onPageScroll();
   defineExpose({
       refresh: diyGroup.refresh
   })
</script>
<style lang="scss" scoped>
   @import './index.scss';
</style>
