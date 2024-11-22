<template>
	<view class="min-h-[100vh]" :style="themeColor()">
		<top-tabbar :data="param" :isFill="false" class="top-header"/>
		<!-- 顶部图片 -->
		<view class="rank-head">	
			<image class="w-[100%] h-[426rpx]" :src="img(rankConfig.rank_images)" mode="aspectFill"></image>
			<view class="content">
				<text class="text-[26rpx]">{{rankConfig.rank_name}}</text>
			</view>
			<view class="side-tab" :style="{ top: topStyle }" @click="rankPopup = true" v-if="rankConfig.rank_remark">
			  <text class="iconfont icona-paihangbangpc30 icon"></text>
			  <text class="desc">{{t('rankingRules')}}</text>
			</view>

		</view>
		<view class="rank-list p-[20rpx] relative -mt-[50rpx]">
			<!-- 榜单分类按钮 -->
			<scroll-view scroll-x="true" class="category-slider"  @scroll="handleScroll" >
				<view :class="['category-btn', { active: activeIndex === index }]" v-for="(item, index) in rankList" :key="index"  @click="selectCategory(item.rank_id, index)">
					<view>{{ item.name }}</view>
				</view>
			</scroll-view>
			<!-- 列表 -->
			<mescroll-body ref="mescrollRef" bottom="60px" @init="mescrollInit" :down="{ use: false }" @up="getRankGoodsListFn">
				<view class="bg-[#fff] flex rounded-[var(--rounded-mid)] p-[20rpx]" v-for="(item,index) in rankGoodsList" :key="item.goods_id" :class="{'mb-[20rpx]': (rankGoodsList.length-1) != index}" v-if="rankGoodsList.length">
					<view class="w-[240rpx] h-[240rpx] flex items-center justify-center relative">
						  <!-- 榜单排名图片 -->
						<image v-if="index < 10"  class="absolute top-[-5rpx] left-[0rpx] w-[50rpx] h-[58rpx]" :style="{ zIndex:9 }"  :src="getRankBadge(item.rank_num)" mode="aspectFill"></image>
						<view class="absolute top-[3rpx] left-[0rpx] flex items-center justify-center w-[50rpx] h-[50rpx]" v-if="index < 10" :style="{ zIndex: 10 }">
						  <text class="text-[24rpx] font-bold text-[#fff]">{{ index + 1 }}</text>
						</view>

						<image v-if="item.goods_cover_thumb_mid" class="w-[250rpx] h-[250rpx] rounded-[var(--rounded-mid)]" :src="img(item.goods_cover_thumb_mid)" :mode="'aspectFill'" @error="item.goods_cover_thumb_mid='static/resource/images/diy/shop_default.jpg'"></image>
						<image class="w-[240rpx] h-[240rpx] rounded-[var(--rounded-mid)]" v-else :src="img('static/resource/images/diy/shop_default.jpg')" :mode="'aspectFill'"></image>
					
						
					</view>
					<view class="flex flex-col flex-1 justify-between ml-[20rpx] pt-[4rpx]">
						<view class="text-[28rpx] text-[#333] leading-[40rpx] multi-hidden mb-[10rpx]">
							<view class="brand-tag" v-if="item.goods_brand">
								{{item.goods_brand.brand_name}}
							</view>
							{{ item.goods_name }}
						</view>
						<view v-if="item.goods_label_name && item.goods_label_name.length" class="flex flex-wrap">
							<template v-for="(tagItem, tagIndex) in item.goods_label_name">
								<image class="img-tag" v-if="tagItem.style_type == 'icon' && tagItem.icon" :src="img(tagItem.icon)" mode="heightFix" @error="diyGoods.error(tagItem,'icon')"></image>
								<view class="base-tag" v-else-if="tagItem.style_type == 'diy' || !tagItem.icon" :style="diyGoods.baseTagStyle(tagItem)">
									{{tagItem.label_name}}
								</view>
							</template>
						</view>
						<view class="flex items-center justify-between">
							<view class="text-[var(--price-text-color)]  flex items-baseline">
								<text class="text-[24rpx] font-500 mr-[4rpx]">￥</text>
								<text class="text-[40rpx] font-500">{{ diyGoods.goodsPrice(item).toFixed(2).split('.')[0] }}</text>
								<text class="text-[24rpx] font-500">.{{ diyGoods.goodsPrice(item).toFixed(2).split('.')[1] }}</text>
							</view>
							<view class="bank-buying primary-btn-bg" @click="toLink(item.goods_id)">
								去购买
							</view>
						</view>
					</view>
				</view>
				<mescroll-empty v-if="!rankGoodsList.length && loading" :option="{tip : '暂无商品', btnText:'去逛逛'}" @emptyclick="redirect({ url: '/addon/shop/goods/list', mode: 'navigateTo' })"></mescroll-empty>
			</mescroll-body>

			<view @touchmove.prevent.stop>
				<u-popup :show="rankPopup" @close="closeFn" mode="center" round="var(--rounded-big)">
					<view class="w-[570rpx] px-[32rpx] popup-common center">
						<view class="title">{{t('rankingRules')}}</view>
						<scroll-view :scroll-y="true" class="px-[30rpx] box-border max-h-[260rpx]">
						        <view class="text-[28rpx] leading-[40rpx] mb-[20rpx]">{{rankConfig.rank_remark}}</view>
						</scroll-view>
						<view class="btn-wrap !pt-[40rpx]">
						    <button class="primary-btn-bg w-[480rpx] h-[70rpx] text-[26rpx] leading-[70rpx] rounded-[35rpx] !text-[#fff] font-500"  @click="rankPopup = false">我知道了</button>
						</view>
					</view>
				</u-popup>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { t } from '@/locale'
import { redirect, img, getToken, pxToRpx } from '@/utils/common';
import { getRankList ,getRankGoodsList,getRankConfig} from '@/addon/shop/api/rank';
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue'
import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
import useDiyStore from '@/app/stores/diy';
import { topTabar } from '@/utils/topTabbar'
import { useLogin } from '@/hooks/useLogin'
import { useGoods } from '@/addon/shop/hooks/useGoods'

const diyGoods = useGoods();
const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);
const mescrollRef = ref(null);
const loading = ref<boolean>(false);
const diyStore = useDiyStore();
// 获取系统状态栏的高度
let menuButtonInfo : any = {};
// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
menuButtonInfo = uni.getMenuButtonBoundingClientRect();
// #endif
/********* 自定义头部 - start ***********/
const topTabarObj = topTabar()
let param = topTabarObj.setTopTabbarParam({ title: '排行榜' })
const topStyle = computed(() => {
	let style = pxToRpx(Number(menuButtonInfo.height) + menuButtonInfo.top + 8)+ 30 + 'rpx;'
	return style
})
/********* 自定义头部 - end ***********/
		
/**************** 榜单规则 ********************/
const rankPopup = ref(false)
const closeFn = () =>{
	rankPopup.value = false
}
const rankList = ref<Array<any>>([]);
const rankGoodsList = ref<Array<any>>([]);

/**************** 榜单分类 右滑分页 ********************/
const currentCategoryPage = ref(1); // 当前分类的页码
const categoryPageSize = ref(10); // 每页加载的分类数量
const loadingCategories = ref(false); // 防止重复加载

// 加载分类数据
const getRankListFn = (isFirstLoad = false) => {
  if (loadingCategories.value) return; // 防止重复加载
  loadingCategories.value = true;

  getRankList({
    page: currentCategoryPage.value,
    limit: categoryPageSize.value,
  }).then((res) => {
      const newCategories = res.data.data;
      rankList.value = [...rankList.value, ...newCategories]; // 追加数据

      // 仅在首次加载时选择第一个分类
      if (isFirstLoad && rankList.value && rankList.value.length) {
        selectCategory(rankList.value[0].rank_id, 0);
      } else if (!rankList.value.length) {
        loading.value = false;
      }

      if (newCategories.length > 0) {
        currentCategoryPage.value++; // 更新页码
      }
    }).catch((error) => {
      console.error("加载分类数据失败", error);
    }).finally(() => {
      loadingCategories.value = false; // 重置加载状态
    });
};

// 记录上一次的 scrollLeft 值
let lastScrollLeft = 0;
const handleScroll = (e) => {
    const scrollLeft = e.detail.scrollLeft;
    const scrollWidth = e.detail.scrollWidth;
    const clientWidth = uni.upx2px(750); // scroll-view 宽度为 750rpx
    const bufferDistance = 100; // 触发加载的缓冲距离

    // 判断是否向右滚动，并且接近右边缘
    if (scrollLeft > lastScrollLeft && scrollLeft + clientWidth >= scrollWidth - bufferDistance && !loadingCategories.value) {
        getRankListFn(); // 加载更多
   }
    // 更新 lastScrollLeft 以便下次对比
    lastScrollLeft = scrollLeft;
};

const rankConfig = reactive({});

// 榜单设置
const getRankConfigFn = () => {
  getRankConfig().then((res: any) => {
    console.log(res.data);
    Object.assign(rankConfig, res.data); // 合并新数据

  });
};

	
// 当前选中的分类的索引
const activeIndex = ref(0)
// 当前选中的分类的rank_id
const rankId = ref(0)
// 点击分类按钮时，更新选中的分类
function selectCategory(rank:any, index:any) {
	loading.value = false;
	// 清空之前选中的商品列表
	rankGoodsList.value = [];
	activeIndex.value = index
	rankId.value = rank
	getMescroll()?.resetUpScroll();
}

//获取榜单商品
const getRankGoodsListFn = (mescroll: any) => {
	if(rankList.value.length == 0) return;
	loading.value = false;
	let data: object = {
		page: mescroll.num,
		limit: mescroll.size,
        rank_id:rankId.value
	};

	getRankGoodsList(data).then((res: any) => {
		let newArr = (res.data.data as Array<Object>).map((el: any) => {return el})
		//设置列表数据
		if (mescroll.num == 1) {
			rankGoodsList.value = []; //如果是第一页需手动制空列表
		}
		rankGoodsList.value = rankGoodsList.value.concat(newArr);
		mescroll.endSuccess(newArr.length);
		loading.value = true;
	}).catch(() => {
		loading.value = true;
		mescroll.endErr(); // 请求失败, 结束加载
	})
}

// 跳转商品详情
const toLink = (goods_id: any) => {
	redirect({url:'/addon/shop/pages/goods/detail',param:{ goods_id }})
}

// 获取排行榜名次图片的函数
function getRankBadge(sort:any) {
  switch (sort) {
    case 1:
      return img('addon/shop/rank/rank_first.png');
    case 2:
      return img('addon/shop/rank/rank_second.png');
    case 3:
      return img('addon/shop/rank/rank_third.png');
    default:
      return img('addon/shop/rank/rank.png');
  }
}


onLoad(async (option : any) => {
	getRankListFn(true)
	getRankConfigFn()
})

</script>

<style lang="scss" scoped>
@import '@/addon/shop/styles/common.scss';

.rank-head {
	position: relative;
	.content {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 30rpx;
		left: 141rpx;
		top: 323rpx;
		width: 520rpx;
		height: 44rpx;
		font-size: 26rpx;
		color: var(--primary-color);
		background: linear-gradient(to right, #FFEBD7, #FFFFFF, #FFEBD7);
	}
}

.rank-list {
	background: #F8F8F8;
	border-radius: 34rpx 34rpx 0 0;

	.category-slider {
		margin-top: -10rpx;
		width: 100%;
		height: 100rpx;
		line-height: 100rpx;
    	white-space: nowrap;
		flex-direction: row;

		.category-btn {
			display: inline-block;
			width: 150rpx;
	    	height: 55rpx;
			text-align: center;
			line-height: 55rpx;
			justify-content: center;
			align-items: center;
			background-color: #EEEEEE;
			color: #000;
			border-radius: 40rpx;
			font-size: 24rpx;
			margin-right: 30rpx;
		}

		.category-btn.active {
			background-color:var(--primary-color);
			color: #fff;
		}
	}


	.bank-buying {
		width: 100rpx;
		height: 44rpx;
		border-radius: 10rpx;
		font-family: PingFang SC, PingFang SC;
		font-weight: 500;
		font-size: 24rpx;
		color: #FFFFFF;
		line-height: 44rpx;
		text-align: center;
	}
}
</style>