<template>
  <view class="bg-gray-100 min-h-[100vh]" :style="themeColor()">
    <view class="fixed left-0 right-0 top-0 product-warp bg-[#fff] px-[30rpx]">
      <view class="h-[88rpx] box-border py-[14rpx] flex items-center justify-between">
        <view class="flex-1 flex items-center h-[60rpx] bg-[#F6F8F8] rounded-[33rpx] pl-[32rpx] pr-[20rpx] mr-[30rpx]">
          <u-input class="flex-1" maxlength="50" v-model="goods_name" @confirm="searchTypeFn('all')"  placeholder="请搜索您想要的商品" placeholderClass="text-[#a5a6a6] text-[26rpx]" fontSize="26rpx"  clearable border="none"></u-input>
          <text class="iconfont iconxiazai17 text-[30rpx] ml-[18rpx] font-bold !text-[#999]" @click="searchTypeFn('all')"></text>
        </view>
        <view :class="['iconfont text-[44rpx]', listType ? 'iconshangpinliebiao' : 'iconliebiaoxingshi']" @click="listIconBtn"></view>
      </view>
      <view class="flex justify-between tems-center py-[22rpx] px-[20rpx]">
        <view class=" flex items-center justify-between text-[24rpx] text-[#666] flex-1">
          <text  :class="{ 'text-[#303133] ' : searchType == 'all' }" @click="searchTypeFn('all')">综合排序</text>
          <view class="flex items-center" :class="{ 'text-[#303133]' : searchType == 'sale_num' }" @click="searchTypeFn('sale_num')">
            <text class="mr-[4rpx]">销量</text>
            <text v-if="(sale_num != 'asc') && ( sale_num != 'desc')" class="text-[16rpx] iconfont iconshangxiajiantouheise"></text>
            <text v-else-if="sale_num == 'asc'" class="text-[16rpx] iconfont iconjiantoushang font-bold"></text>
            <text  v-else-if="sale_num == 'desc'" class="text-[16rpx] iconfont iconxialajiantouxiao"></text>
          </view>
          <view class="flex items-center" :class="{'text-[#303133]' : searchType == 'price' }" @click="searchTypeFn('price')">
            <text class=" mr-[4rpx]">价格</text>
            <text v-if="(price != 'asc') && ( price != 'desc')" class="text-[16rpx] iconfont iconshangxiajiantouheise"></text>
            <text v-else-if="price == 'asc'" class="text-[16rpx] iconfont iconjiantoushang font-bold"></text>
            <text v-else-if="price == 'desc'" class="text-[16rpx] iconfont iconxialajiantouxiao"></text>
          </view>
          <view class="flex items-center" :class="{'text-[#303133]' : searchType == 'label' }" @click="searchTypeFn('label')">
            <text class="mr-[2rpx]">筛选</text>
            <text class="iconfont iconshaixuan text-[16rpx]"></text>
          </view>
        </view>
      </view>
    </view>
    <u-popup :show="labelPopup" mode="top" @close="labelPopup = false">
      <view @touchmove.prevent.stop>
        <view class="text-sm font-bold px-[30rpx] mt-3">全部分类</view>
        <view class="flex flex-wrap pl-[30rpx] pt-[30rpx]">
          <text @click="loadCategory(item.category_id)" v-for="(item, index) in categoryList" :key="item.category_id"
                :class="['px-[26rpx] border-[2rpx] border-solid border-transparent h-[60rpx] mr-[30rpx] mb-[30rpx] flex items-center justify-center bg-[#F4F4F4] rounded-[8rpx] text-xs', { 'label-select': currGoodsCategory == item.category_id }]">
            {{ item.category_name }}
          </text>
        </view>
        <!--        价格区间筛选 -->
        <view class="text-sm font-bold px-[30rpx] mt-3 ">价格区间</view>
        <view class="flex flex-wrap pl-[30rpx] pt-[30rpx] mr-3">

          <u-input
              placeholder="请输入查找最低价格"
              border="surround"
              class="mr-3"
              prefixIconStyle="font-size: 22px;color: #909399"
              v-model="price_bteween.start_price"
          > </u-input>
          -
          <u-input
              placeholder="请输入最高价格"
              border="surround"
              class="ml-3"
              v-model="price_bteween.end_price"
          />
        </view>

        <view class="text-sm font-bold px-[30rpx] mt-3">操作</view>
        <view class="flex flex-wrap justify-end pl-[30rpx] p-[30rpx] ">
          <div   class="flex " >
            <u-button type="primary" class="mr-3" text="重置" @click="resetQuery"></u-button>
            <u-button type="success" :plain="true" @click="searchTypeFn" text="搜索"></u-button>
          </div>


        </view>
      </view>
    </u-popup>

    <mescroll-body ref="mescrollRef" top="160rpx" bottom="50px" @init="mescrollInit" @down="downCallback" @up="getAllAppListFn">
      <view v-if="articleList.length" :class="['px-[30rpx]', !listType ? 'flex justify-between flex-wrap' : '']">
        <template v-for="(item, index) in articleList">
          <template v-if="listType" :key="item.app_id">
            <view class="bg-white flex p-[20rpx] rounded-[16rpx] overflow-hidden mt-[20rpx]" :class="{ 'mb-[20rpx]': (index+1) == articleList.length}"
                  @click="toDetail(item.goods_id)">
              <u--image class="rounded-[10rpx] overflow-hidden" width="190rpx" height="190rpx" :src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')" model="aspectFill">
                <template #error>
                  <u-icon name="photo" color="#999" size="50"></u-icon>
                </template>
              </u--image>
              <view class="flex-1 flex flex-col ml-[20rpx] py-[6rpx]">
                <view class="text-[28rpx] text-[#303133] leading-[40rpx]  multi-hidden mb-[10rpx]">{{ item.goods_name }}</view>
                <view  class="w-[450rpx] max-h-[80rpx] text-[20rpx] leading-[40rpx]  truncate">{{ item.sub_title }}</view>
                <view class="mt-auto flex justify-between items-baseline">
                  <view class="text-[var(--price-text-color)] price-font flex items-baseline">
                    <text class="text-[26rpx] font-500">￥</text>
                    <text class="text-[36rpx] font-500">{{   parseFloat(goodsPrice(item)).toFixed(2).split('.')[0] }}</text>
<!--                    <text class="text-[36rpx] font-500">{{ goodsPrice(item) }}</text>-->

                    <text class="text-[24rpx] font-500">.{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[1] }}</text>
                  </view>
                  <text class="text-[24rpx] text-[#999]">已售:{{ item.sale_num }}{{ item.unit }}</text>|<text class="text-[24rpx] text-[#999]">库存:{{ item.goodsSku.stock }}{{ item.unit }}</text>
                </view>
              </view>
            </view>
          </template>
          <template v-else>
            <view class="w-[334rpx] flex flex-col bg-[#fff] box-border rounded-[12rpx] overflow-hidden mt-[20rpx]" @click="toDetail(item.goods_id)">
              <u--image width="334rpx" height="334rpx" :src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')" model="aspectFill">
                <template #error>
                  <u-icon name="photo" color="#999" size="50"></u-icon>
                </template>
              </u--image>
              <view class="px-[16rpx] flex-1 pt-[16rpx] pb-[20rpx] flex flex-col justify-between">
                <view class="text-[#303133] leading-[40rpx] text-[28rpx] multi-hidden">
                  {{ item.goods_name }}
                </view>
                <view  class="w-[300rpx] max-h-[80rpx] text-[20rpx] leading-[40rpx]  truncate">{{ item.sub_title }}</view>

                <view class="flex justify-between items-baseline mt-[16rpx]">
                  <view class="text-[var(--price-text-color)] price-font flex items-baseline">
                    <!--										<text class="text-[20rpx]  mr-[4rpx]">￥</text>-->
                    <!--										<text class="text-[36rpx] font-500">{{ item.goodsSku.price }}</text>-->

                    <text class="text-[26rpx] font-500">￥</text>
                    <text class="text-[36rpx] font-500">{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[0] }}</text>
                    <text class="text-[24rpx] font-500">.{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[1] }}</text>

                  </view>
                  <text class="text-[24rpx] text-[#999]">已售{{ item.sale_num }}{{ item.unit}}</text>
                </view>
              </view>
            </view>
          </template>
        </template>
      </view>
      <view class="mx-[30rpx] mt-[20rpx] bg-[#fff] rounded-[16rpx] noData flex items-center justify-center" v-if="!articleList.length && loading">
        <mescroll-empty :option="{tip : '暂无商品'}"></mescroll-empty>
      </view>
    </mescroll-body>

    <tabbar addon="shop"/>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { t } from '@/locale'
import { redirect, img , getToken } from '@/utils/common';
import { getGoodsCategoryTree, getGoodsPages } from '@/addon/shop/api/goods';
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';

import { useShare } from '@/hooks/useShare'

const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

const { setShare, onShareAppMessage, onShareTimeline } = useShare()
setShare()
onShareAppMessage()
onShareTimeline()

let categoryList = ref<Array<Object>>([]);
let articleList = ref<Array<any>>([]);
let coupon_id = ref<number | string>('');
let currGoodsCategory = ref<number | string>('');
let mescrollRef = ref(null);
let loading = ref<boolean>(false);
// 标签
let labelPopup = ref(false);
let goods_name = ref("");
let price = ref("");
let sale_num = ref("");
let searchType = ref('all');
let isShow = ref(false)//输入框清除文字按钮
let price_bteween = ref({
  start_price: '',
  end_price: '',
});
//列表类型
let listType = ref(true)
onLoad(async (option) => {
  currGoodsCategory.value = option.curr_goods_category || ''
  goods_name.value = option.goods_name || ''
  coupon_id.value = option.coupon_id || ''
  await getGoodsCategoryTree().then((res: any) => {
    const initData = { category_name: "全部", category_id: '' };
    categoryList.value.push(initData);
    categoryList.value = categoryList.value.concat(res.data);
  });
})

interface mescrollStructure {
  num: number,
  size: number,
  endSuccess: Function,
  [propName: string]: any
}

const getAllAppListFn = (mescroll: mescrollStructure) => {
  loading.value = false;
  let data: object = {
    goods_category: currGoodsCategory.value,
    page: mescroll.num,
    limit: mescroll.size,
    keyword: goods_name.value,
    coupon_id: coupon_id.value,
    order: searchType.value === 'all' ? '' : searchType.value,
    sort: searchType.value == 'price' ? price.value : sale_num.value,
    start_price:price_bteween.value.start_price,
    end_price:price_bteween.value.end_price
  };
  getGoodsPages(data).then((res: any) => {
    let newArr = (res.data.data as Array<Object>);
    //设置列表数据
    if (Number(mescroll.num) === 1) {
      articleList.value = []; //如果是第一页需手动制空列表
    }
    articleList.value = articleList.value.concat(newArr);
    mescroll.endSuccess(newArr.length);
    loading.value = true;
  }).catch(() => {
    loading.value = true;
    mescroll.endErr(); // 请求失败, 结束加载
  })
}

const loadCategory = (id: string) => {
  currGoodsCategory.value = id;
  articleList.value = [];
  getMescroll().resetUpScroll();
  // labelPopup.value = false;
}
// 搜索
const searchTypeFn = (type) => {
  searchType.value = type;
  if (type == searchType.value && type == 'price') {
    sale_num.value = '';
    if(price.value){
      price.value = price.value == 'asc' ? 'desc' : 'asc';
    }else{
      price.value = 'asc';
    }
  }
  if (type == searchType.value && type == 'sale_num') {
    price.value = '';
    if(sale_num.value){
      sale_num.value = sale_num.value == 'asc' ? 'desc' : 'asc';
    }else{
      sale_num.value = 'asc';
    }
  }
  if (type == 'label') {
    sale_num.value = 'asc';
    price.value = 'asc';
    labelPopup.value = true;
  } else {
    labelPopup.value = false;
    articleList.value = [];

    getMescroll().resetUpScroll();
  }
}
//列表样式切换
const listIconBtn = () => {
  listType.value = !listType.value
}
const toDetail = (id: string | number) => {
  redirect({ url: '/addon/shop/pages/goods/detail', param: { goods_id: id }, mode: 'navigateTo' })
}
// resetQuery 重置搜索
const resetQuery = () => {
  goods_name.value = '';
  currGoodsCategory.value = ''
  coupon_id.value = '';
  price.value = '';
  sale_num.value = '';
  price_bteween.value.start_price = '';
  price_bteween.value.end_price = '';
  labelPopup.value = false;
  searchType.value = 'all';
  listType.value = true;
  articleList.value = [];
  getMescroll().resetUpScroll();
}

onMounted(() => {
  setTimeout(() => {
    getMescroll().optUp.textNoMore = t("end");
  }, 500)
});

// 商品价格
let goodsPrice = (data:any) => {
  console.log( data )
  let price = "0.00";
  if (data.is_discount) {
    price = data.goodsSku.sale_price ? data.goodsSku.sale_price : data.goodsSku.price // 折扣价
  } else if (data.member_discount && getToken()) {
    price = data.goodsSku.member_price ? data.goodsSku.member_price : data.goodsSku.price // 会员价
  } else {
    price = data.goodsSku.price
  }
  return price;
}

</script>

<style lang="scss" scoped>
.bg-color{
  background: linear-gradient( 180deg, #EF000C 16%, rgba(239,0,12,0) 92%);
}
.nav-item.active {
  color: $u-primary;
}

.scroll-view-wrap {
  word-break: keep-all;
}

.text-color {
  color: var(--primary-color);
}

.label-select {
  color: var(--primary-color);
  border-color: var(--primary-color);
  background-color: var(--primary-color-light);
}

:deep(.u-popup .u-transition) {
  top: 156rpx !important;
}

.product-warp {
  z-index: 99999;
}

:deep(.tab-bar-placeholder) {
  display: none !important;
}

:deep(.u-tabbar__placeholder) {
  display: none !important;
}
:deep(.u-input__content__clear){
  width: 28rpx;
  height: 28rpx;
  font-size: 28rpx;
  background-color: #999;
}
.noData{
  height: calc(100vh - 200rpx - 50px - constant(safe-area-inset-bottom));
  height: calc(100vh - 200rpx - 50px - env(safe-area-inset-bottom));
}
</style>