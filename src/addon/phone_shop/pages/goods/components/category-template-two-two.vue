<template>
	<view class="min-h-screen">
		<view class="mescroll-box bg-[#F4F6F8]"
			:class="{ 'cart': config.cart.control && config.cart.event === 'cart', 'detail': !(config.cart.control && config.cart.event === 'cart') }"
			v-if="tabsData.length">
			<mescroll-body ref="mescrollRef" :down="{ use: false }" @init="mescrollInit" @up="getListFn">
				<view v-if="config.search.control"
					class="search-box z-10 bg-[#fff] fixed top-0 left-0 right-0 h-[106rpx] box-border">
					<input class="search-ipt pl-[32rpx] text-[24rpx]"
						:class="{ 'pr-[106rpx]': searchName, 'pr-[32rpx]': !searchName }" type="text"
						v-model="searchName" :placeholder="config.search.title" @confirm="searchNameFn">
					<view class="flex items-center h-[70rpx] absolute right-[56rpx] top-[18rpx]  z-2">
						<u-icon v-if="searchName" name="close-circle-fill" color="#A5A6A6" size="28rpx"
							@click="searchName = ''"></u-icon>
						<view class="h-[70rpx] w-[40rpx] text-center leading-[70rpx]" @click.stop="searchNameFn"><text
								class="nc-iconfont nc-icon-sousuo-duanV6xx1 text-[32rpx]"></text></view>
					</view>
				</view>

				<!--  #ifdef  H5 -->
				<view class="tabs-box z-2 fixed left-0 bg-[#fff] bottom-[50px] top-0"
					:class="{ '!top-[106rpx]': config.search.control, 'pb-[98rpx]': config.cart.control && config.cart.event === 'cart' }">
					<scroll-view :scroll-y="true" class="scroll-height">
						<view class="bg-[#F4F6F8]">
							<view class="tab-item truncate"
								:class="{ 'tab-item-active ': index == tabActive, 'rounded-br-[12rpx]': tabActive - 1 === index && (!tabsData[tabActive].child_list || !tabsData[tabActive].child_list.length), 'rounded-tr-[12rpx]': tabActive + 1 === index && (!tabsData[tabActive].child_list || !tabsData[tabActive].child_list.length) }"
								v-for="(item, index) in tabsData" :key="index" @click="firstLevelClick(index, item)">
								<view class="text-box truncate px-[24rpx]">{{ item.category_name }}</view>
							</view>
						</view>
					</scroll-view>
				</view>
				<!--  #endif -->

				<!--  #ifndef  H5 -->
				<view class="tabs-box z-2 fixed left-0 bg-[#fff] pb-ios bottom-[100rpx] top-0"
					:class="{ 'top-[106rpx]': config.search.control, '!bottom-[198rpx]': config.cart.control && config.cart.event === 'cart' }">
					<scroll-view :scroll-y="true" class="scroll-height">
						<view class="bg-[#F4F6F8]">
							<view class="tab-item truncate"
								:class="{ 'tab-item-active': index == tabActive, 'rounded-br-[12rpx]': tabActive - 1 === index && (!tabsData[tabActive].child_list || !tabsData[tabActive].child_list.length), 'rounded-tr-[12rpx]': tabActive + 1 === index && (!tabsData[tabActive].child_list || !tabsData[tabActive].child_list.length) }"
								v-for="(item, index) in tabsData" :key="index" @click="firstLevelClick(index, item)">
								<view class="text-box px-[16rpx] truncate">
									{{ item.category_name }}
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
				<!--  #endif -->
				<view
					class="flex justify-center items-center h-[92rpx] px-[24rpx] py-[20rpx] z-10 bg-white fixed left-[182rpx] right-0 box-border top-0"
					:class="{ '!top-[106rpx]': config.search.control }"
					v-if="tabsData[tabActive]?.child_list && tabsData[tabActive]?.child_list.length">
					<template v-if="!labelPopup">
						<scroll-view :scroll-x="true" scroll-with-animation
							:scroll-into-view="'id' + (subActive ? subActive - 1 : 0)"
							class="flex-1 h-[49rpx] scroll-Y box-border pr-[24rpx] bg-white">
							<view class="flex items-center h-[48rpx]  box-border">
								<text
									class="flex-shrink-0 ml-[24rpx] px-[24rpx] h-[48rpx] text-[22rpx] leading-[44rpx] border-[2rpx] border-solid rounded-[24rpx] box-border"
									:class="{ 'sub-tab-active text-color border-color': index === subActive, 'border-[#E2E2E2]': index != subActive }"
									v-for="(item, index) in tabsData[tabActive]?.child_list"
									:key="tabsData[tabActive].category_id" :id="'id' + index"
									@click="subMenuClick(index, item)">{{ item.category_name }}</text>
							</view>
						</scroll-view>
						<view
							class="nc-iconfont nc-icon-xiaV6xx text-[30rpx] w-[30rpx] h-[30rpx] text-center transform "
							@click="labelPopup = true"></view>
					</template>
					<template v-else>
						<view class="flex-1 h-[48rpx] text-[22rpx] text-[#A5A6A6] pr-[24rpx] leading-[48rpx]">全部分类
						</view>
						<text class="nc-iconfont nc-icon-shangV6xx-1 text-[30rpx]" @click="labelPopup = false"></text>
					</template>

				</view>
				<view class="labelPopup" :class="{ 'active': config.search.control }">
					<u-popup :show="labelPopup" mode="top" @close="labelPopup = false">
						<view class="flex flex-wrap py-[24rpx]" @touchmove.prevent.stop>
							<!-- <text
								class="flex-shrink-0 w-[160rpx] ml-[22rpx] mb-[24rpx] text-center h-[48rpx] text-[22rpx] leading-[48rpx] border-[2rpx] border-solid rounded-[24rpx] box-border"
								:class="{ 'sub-tab-active text-color border-color': initAll.allActive === subActive, 'border-[#E2E2E2]': initAll.allActive != subActive }"
								 @click="subMenuClick(initAll.allActive,initAll.data)">全部</text> -->
							<text
								class="flex-shrink-0 w-auto pl-2 pr-2 ml-[22rpx] mb-[24rpx] text-center h-[48rpx] text-[22rpx] leading-[48rpx] border-[2rpx] border-solid rounded-[24rpx] box-border"
								:class="{ 'sub-tab-active text-color border-color': index === subActive, 'border-[#E2E2E2]': index != subActive }"
								v-for="(item, index) in tabsData[tabActive]?.child_list"
								:key="tabsData[tabActive].category_id" @click="subMenuClick(index, item)">{{
									item.category_name }}
							</text>
						</view>
					</u-popup>
				</view>
				<view class="flex justify-center flex-wrap pl-[182rpx] pt-[20rpx] pb-[20rpx]"
					:class="{ '!pt-[218rpx]': config.search.control && tabsData[tabActive]?.child_list && tabsData[tabActive]?.child_list.length, 'pt-[126rpx]': config.search.control && (!tabsData[tabActive].child_list || !tabsData[tabActive].child_list.length), 'pt-[112rpx]': tabsData[tabActive]?.child_list && tabsData[tabActive]?.child_list.length && !config.search.control }">
					<template v-for="(item, index) in list" :key="item.goods_id">
						<view
							class="w-[536rpx] box-border bg-white w-full flex mx-[16rpx] px-[24rpx] py-[20rpx] rounded-[12rpx]"
							:class="{ 'mt-[16rpx]': index }" @click.stop="toLink(item.goods_id)">
							<view
								class="w-[168rpx] h-[168rpx] flex items-center justify-center mr-[20rpx] rounded-[var(--goods-rounded-small)] overflow-hidden">
								<u--image width="168rpx" height="168rpx" :radius="'var(--goods-rounded-small)'"
									:src="img(item.goods_cover_thumb_mid || '')" model="aspectFill">
									<template #error>
										<image class="w-[168rpx] h-[168rpx]"
											:src="img('static/resource/images/diy/shop_default.jpg')" mode="aspectFill">
										</image>
									</template>
								</u--image>
							</view>
							<view class="flex flex-1 flex-wrap">
								<view class="w-[316rpx] max-h-[40rpx] text-[28rpx] leading-[40rpx] multi-hidden">
									{{ item.goods_name }}
								</view>
								<view class="w-[316rpx] max-h-[40rpx] text-[20rpx] leading-[40rpx]  truncate"
									v-if="item.sub_title">
									{{ item.sub_title }}
								</view>
								<view class="w-[316rpx] max-h-[80rpx] text-[20rpx] leading-[40rpx]  truncate"
									v-if="item.goodsSku.sku_no"> sn: {{
										item.goodsSku.sku_no }}
								</view>
								<view class="w-[316rpx] flex self-end items-end justify-between">
									<view class="text-[var(--price-text-color)] price-font">
										<text class="text-[26rpx] font-500">￥</text>
										<text class="text-[36rpx] font-500">{{
											parseFloat(goodsPrice(item)).toFixed(2).split('.')[0] }}</text>
										<text class="text-[24rpx] font-500">.{{
											parseFloat(goodsPrice(item)).toFixed(2).split('.')[1] }}</text>
										<image class="h-[24rpx] ml-[6rpx]" v-if="priceType(item) == 'member_price'"
											:src="img('addon/phone_shop/VIP.png')" mode="heightFix" />
										<image class="h-[24rpx] ml-[6rpx]" v-if="priceType(item) == 'discount_price'"
											:src="img('addon/phone_shop/discount.png')" mode="heightFix" />
									</view>
									<view
										v-if="(item.goods_type == 'real' || (item.goods_type == 'virtual' && item.virtual_receive_type != 'verify')) &&
											item.goodsSku.sku_spec_format === '' && cartList['goods_' + item.goods_id] && cartList['goods_' + item.goods_id]['sku_' + item.goodsSku.sku_id] && config.cart.control && config.cart.event === 'cart'"
										class="flex items-center">
										<text class="text-[44rpx] text-color nc-iconfont nc-icon-jianshaoV6xx"
											@click.stop="reduceCart(cartList['goods_' + item.goods_id]['sku_' + item.goodsSku.sku_id])"></text>
										<text class="text-[#333] text-[24rpx] mx-[16rpx]">{{ cartList['goods_' +
											item.goods_id]['sku_' +
											item.goodsSku.sku_id].num }}</text>
										<text class="text-[44rpx] text-color iconfont iconjiahao2fill"
											:id="'itemCart' + index"
											@click.stop="addCartBtn(item, cartList['goods_' + item.goods_id]['sku_' + item.goodsSku.sku_id], 'itemCart' + index)"></text>
									</view>
									<template
										v-else-if="(item.goods_type == 'virtual' && config.cart.event !== 'cart') || item.goods_type == 'real'">
										<view v-if="config.cart.control && config.cart.style === 'style-1'"
											class="h-[44rpx] relative  pl-[20rpx]">
											<view :id="'itemCart' + index"
												class="text-[#fff] bg-color h-[44rpx] text-[24rpx] px-[10px] leading-[44rpx] rounded-[22rpx]"
												@click.stop="itemCart(item, 'itemCart' + index)">
												{{ config.cart.text }}
											</view>
											<view
												v-if="cartList['goods_' + item.goods_id] && cartList['goods_' + item.goods_id].totalNum"
												:class="['absolute right-[-16rpx] top-[-16rpx] rounded-[30rpx] h-[30rpx] min-w-[30rpx] text-center leading-[30rpx] bg-[#FF4646] text-[#fff] text-[20rpx] font-500 box-border box-border border-[2rpx] border-solid border-[#fff]', cartList['goods_' + item.goods_id].totalNum > 9 ? 'px-[10rpx]' : '']">
												{{ cartList['goods_' + item.goods_id].totalNum }}
											</view>
										</view>
										<view v-if="config.cart.control && config.cart.style === 'style-2'"
											class="w-[44rpx] h-[44rpx] relative">
											<text :id="'itemCart' + index"
												class="text-color nc-iconfont nc-icon-tianjiaV6xx text-[44rpx]"
												@click.stop="itemCart(item, 'itemCart' + index)"></text>
											<view
												v-if="cartList['goods_' + item.goods_id] && cartList['goods_' + item.goods_id].totalNum"
												:class="['absolute right-[-16rpx] top-[-16rpx] rounded-[30rpx] h-[30rpx] min-w-[30rpx] text-center leading-[30rpx] bg-[#FF4646] text-[#fff] text-[20rpx] font-500 box-border box-border border-[2rpx] border-solid border-[#fff]', cartList['goods_' + item.goods_id].totalNum > 9 ? 'px-[10rpx]' : '']">
												{{ cartList['goods_' + item.goods_id].totalNum }}
											</view>
										</view>
										<view v-if="config.cart.control && config.cart.style === 'style-3'"
											class="w-[44rpx] h-[44rpx] relative">
											<text :id="'itemCart' + index"
												class="text-color nc-iconfont nc-icon-gouwucheV6xx-2 !text-[44rpx]"
												@click.stop="itemCart(item, 'itemCart' + index)"></text>
											<view
												v-if="cartList['goods_' + item.goods_id] && cartList['goods_' + item.goods_id].totalNum"
												:class="['absolute right-[-16rpx] top-[-16rpx] rounded-[30rpx] h-[30rpx] min-w-[30rpx] text-center leading-[30rpx] bg-[#FF4646] text-[#fff] text-[20rpx] font-500 box-border box-border border-[2rpx] border-solid border-[#fff]', cartList['goods_' + item.goods_id].totalNum > 9 ? 'px-[10rpx]' : '']">
												{{ cartList['goods_' + item.goods_id].totalNum }}
											</view>
										</view>
										<view v-if="config.cart.control && config.cart.style === 'style-4'"
											class="w-[44rpx] h-[44rpx] relative">
											<view :id="'itemCart' + index"
												class=" flex items-center justify-center text-[#fff] bg-color h-[44rpx] w-[44rpx] rounded-[22rpx] text-center"
												@click.stop="itemCart(item, 'itemCart' + index)">
												<text class="nc-iconfont nc-icon-gouwucheV6xx-2 !text-[26rpx]"></text>
											</view>
											<view
												v-if="cartList['goods_' + item.goods_id] && cartList['goods_' + item.goods_id].totalNum"
												:class="['absolute right-[-16rpx] top-[-16rpx] rounded-[30rpx] h-[30rpx] min-w-[30rpx] text-center leading-[30rpx] bg-[#FF4646] text-[#fff] text-[20rpx] font-500 box-border border-[2rpx] border-solid border-[#fff]', cartList['goods_' + item.goods_id].totalNum > 9 ? 'px-[10rpx]' : '']">
												{{ cartList['goods_' + item.goods_id].totalNum }}
											</view>
										</view>
									</template>
								</view>
							</view>
						</view>

					</template>
					<view class="w-[536rpx] mx-[16rpx] rounded-[12rpx] flex items-center justify-center"
						:class="{ 'noData1': config.search.control, 'noData2': !(config.search.control), 'child': tabsData[tabActive]?.child_list && tabsData[tabActive]?.child_list.length, 'noChild': !tabsData[tabActive]?.child_list || !tabsData[tabActive]?.child_list.length }"
						v-if="!list.length && !loading && listLoading">
						<mescroll-empty :option="{ tip: '暂无商品' }"></mescroll-empty>
					</view>
				</view>
				<add-cart-popup ref="cartRef" />
			</mescroll-body>
			<!--  #ifdef  H5 -->
			<view v-if="config.cart.control && config.cart.event === 'cart'"
				class="bg-[#fff] z-10 flex justify-between items-center fixed left-0 right-0 bottom-[50px] box-solid px-[24rpx] py-[17rpx] mb-ios">
				<view class="flex items-center">
					<view class="w-[66rpx] h-[66rpx] mr-[27rpx] relative">
						<view id="animation-end"
							class="w-[66rpx] h-[66rpx] rounded-[35rpx] bg-[var(--primary-color)] text-center leading-[70rpx]"
							@click.stop="toCart">
							<text class="nc-iconfont nc-icon-gouwucheV6mm1 text-[#fff] text-[32rpx]"></text>
						</view>
						<view v-if="totalNum"
							:class="['absolute left-[50rpx] top-[-10rpx] rounded-[28rpx] h-[28rpx] min-w-[28rpx] text-center leading-[30rpx] bg-[#FF4646] text-[#fff] text-[20rpx] font-500 box-border', totalNum > 9 ? 'px-[10rpx]' : '']">
							{{ totalNum > 99 ? "99+" : totalNum }}
						</view>
					</view>
					<text class="text-[32rpx] font-500 text-[#333]">总计：</text>
					<text class="text-[var(--price-text-color)] price-font">
						<text class="text-[26rpx] font-500">￥</text>
						<text class="text-[36rpx] font-500">{{ parseFloat(totalMoney).toFixed(2).split('.')[0] }}</text>
						<text class="text-[24rpx] font-500">.{{ parseFloat(totalMoney).toFixed(2).split('.')[1]
							}}</text>
					</text>
				</view>
				<button
					class="w-[180rpx] h-[66rpx] text-[28rpx] leading-[66rpx] !text-[#fff] m-0 rounded-full primary-btn-bg remove-border"
					shape="circle" @click="settlement">去结算</button>
			</view>
			<!--  #endif -->
			<!--  #ifndef  H5 -->
			<view v-if="config.cart.control && config.cart.event === 'cart'"
				class="bg-[#fff] z-10 flex justify-between items-center fixed left-0 right-0 bottom-[100rpx] box-solid px-[24rpx] py-[17rpx] mb-ios">
				<view class="flex items-center">
					<view class="w-[66rpx] h-[66rpx] mr-[27rpx] relative">
						<view id="animation-end"
							class="w-[66rpx] h-[66rpx] rounded-[35rpx] bg-[var(--primary-color)] text-center leading-[66rpx]"
							@click.stop="toCart">
							<text class="nc-iconfont nc-icon-gouwucheV6mm1 text-[#fff] text-[32rpx]"></text>
						</view>
						<view v-if="totalNum"
							:class="['absolute left-[50rpx] top-[-10rpx] rounded-[28rpx] h-[28rpx] min-w-[28rpx] text-center leading-[30rpx] bg-[#FF4646] text-[#fff] text-[20rpx] font-500 box-border', totalNum > 9 ? 'px-[10rpx]' : '']">
							{{ totalNum > 99 ? "99+" : totalNum }}
						</view>
					</view>
					<text class="text-[32rpx] font-500 text-[#333]">总计：</text>
					<text class="text-[var(--price-text-color)] price-font">
						<text class="text-[26rpx] font-500">￥</text>
						<text class="text-[36rpx] font-500">{{ parseFloat(totalMoney).toFixed(2).split('.')[0] }}</text>
						<text class="text-[24rpx] font-500">.{{ parseFloat(totalMoney).toFixed(2).split('.')[1]
							}}</text>
					</text>
				</view>
				<button
					class="w-[180rpx] h-[66rpx] text-[28rpx] leading-[66rpx] !text-[#fff] m-0 rounded-full primary-btn-bg remove-border"
					@click="settlement">去结算</button>
			</view>
			<!--  #endif -->
		</view>

		<view v-show="animationElStatus" :style="animationElStatus"
			class="fixed z-999 flex items-center justify-center text-[#fff] bg-color h-[44rpx] w-[44rpx] rounded-[22rpx] text-center">
			<text class=" nc-iconfont nc-icon-gouwucheV6xx-2 !text-[30rpx]"></text>
		</view>
		<view class="flex justify-center items-center w-[100%]" v-if="!tabsData.length && !loading">
			<mescroll-empty :option="{ tip: '暂无商品分类' }"></mescroll-empty>
		</view>
		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16"
			color="#303133"></u-loading-page>
		<tabbar />
		<!-- 强制绑定手机号 -->
		<bind-mobile ref="bindMobileRef" />
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { t } from '@/locale';
import { img, redirect, getToken } from '@/utils/common';
import { getGoodsCategoryTree, getGoodsPages } from '@/addon/phone_shop/api/goods';
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import addCartPopup from './add-cart-popup.vue'
import bindMobile from '@/components/bind-mobile/bind-mobile.vue';
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
import { useLogin } from '@/hooks/useLogin'
import useMemberStore from '@/stores/member'
import useConfigStore from '@/stores/config'
import useCartStore from '@/addon/phone_shop/stores/cart'
import { cloneDeep } from 'lodash-es'

const instance = getCurrentInstance(); // 获取组件实例
const cartStore = useCartStore();
// 查询购物车列表
cartStore.getList();

const cartList = computed(() => cartStore.cartList)
const totalNum = computed(() => cartStore.totalNum)
const totalMoney = computed(() => cartStore.totalMoney)
const memberStore = useMemberStore()
const userInfo = computed(() => memberStore.info)
const { mescrollInit, getMescroll } = useMescroll(onPageScroll, onReachBottom);
const prop = defineProps({
	config: {
		type: Object,
		default: (() => { return {} })
	},
	categoryId: {
		type: [String, Number],
		default: 0
	}
})
let config = prop.config
let categoryId = prop.categoryId;
const list = ref<Array<Object>>([]);
const searchName = ref("");
const loading = ref<boolean>(true);//页面加载动画
const listLoading = ref<boolean>(false);//列表加载动画
const labelPopup = ref<boolean>(false)
const cartData = ref<Array<any>>([])
cartData.value = uni.getStorageSync('shopCart') || []
interface acceptingDataStructure {
	data: acceptingDataItemStructure,
	msg: string,
	code: number
}
interface acceptingDataItemStructure {
	data: object,
	[propName: string]: number | string | object
}
interface mescrollStructure {
	num: number,
	size: number,
	endSuccess: Function,
	[propName: string]: any
}
const getListFn = (mescroll: mescrollStructure) => {
	listLoading.value = false
	getGoodsPages({
		page: mescroll.num,
		limit: mescroll.size,
		keyword: '', // 搜索关键词
		goods_category: categoryId, // 商品分类id
		brand_id: '', // 品牌id
		label_ids: '', // 标签id
		start_price: '', // 价格开始区间
		end_price: '', // 价格结束区间
		order: 'price', // 排序方式（综合：空，销量：sale_num，价格：price）
		sort: 'desc' // 升序：asc，降序：desc
	}).then((res: acceptingDataStructure) => {
		let newArr = res.data.data
		// 获取 newArr中的数据 将里面的create_item 和当前日期进行比对 一单是一天则 在newArr 添加一个flag 字段 为true 否为false
		// 获取当前日期
		const currentDate = new Date();

		// 遍历 newArr，添加 flag 字段
		newArr = newArr.map(item => {
			const createDate = new Date(item.create_time);
			// 判断 create_item 和当前日期是否是同一天
			const isSameDay = (+currentDate) - (+createDate) < 1000 * 60 * 60 * 48
			return {
				...item,
				flag: isSameDay
			};
		});
		//设置列表数据
		if (mescroll.num == 1) {
			list.value = []; //如果是第一页需手动制空列表
		}
		list.value = list.value.concat(newArr);
		loading.value = false;

		mescroll.endSuccess(newArr.length);
		if (!list.value.length) listLoading.value = true
	}).catch(() => {
		loading.value = false;
		listLoading.value = true
		mescroll.endErr(); // 请求失败, 结束加载
	})
}


const toLink = (goods_id: string) => {
	redirect({ url: '/addon/phone_shop/pages/goods/detail', param: { goods_id } })
}

onMounted(() => {
	getCategoryData()
})

//设置购物车动画
const animationElStatus = ref('')
const animationAddRepeatFlag = ref<Boolean>(false)
const cartRepeatFlag = ref<Boolean>(false)
const animationAddCart = (row: any, id: any) => {
	if (animationAddRepeatFlag.value || cartRepeatFlag.value) return false
	animationAddRepeatFlag.value = true
	cartRepeatFlag.value = true

	let obj: any = {
		goods_id: row.goodsSku.goods_id,
		sku_id: row.goodsSku.sku_id,
		sale_price: goodsPrice(row),
		stock: row.goodsSku.stock
	};
	if (row.id) {
		obj.num = row.num;
		obj.id = row.id;
	}
	cartStore.increase(obj, 1, () => {
		cartRepeatFlag.value = false
	});
	// #ifdef  MP-WEIXIN
	setTimeout(() => {
		uni.createSelectorQuery().in(instance).select('#animation-end').boundingClientRect((res: any) => {
			uni.createSelectorQuery().in(instance).select('#' + id).boundingClientRect((position: any) => {
				animationElStatus.value = `top: ${position.top}px; left: ${position.left}px;`
				setTimeout(() => {
					animationElStatus.value = `top: ${res.top + res.height / 2 - position.height / 2}px; left: ${res.left + res.width / 2 - position.width / 2}px; transition: all 0.8s; transform: rotate(-720deg);`
				}, 20);

				setTimeout(() => {
					animationElStatus.value = ''
					animationAddRepeatFlag.value = false
				}, 1020);

			}).exec()

		}).exec()
	}, 100)
	// #endif
	// #ifdef  H5
	setTimeout(() => {
		const animationEnd: any = window.document.getElementById('animation-end');
		const animationEndLeft = animationEnd.getBoundingClientRect().left;
		const animationEndTop = animationEnd.getBoundingClientRect().top;

		const itemCart: any = window.document.getElementById(id);
		const itemCartLift = itemCart.getBoundingClientRect().left;
		const itemCartTop = itemCart.getBoundingClientRect().top;
		animationElStatus.value = `top: ${itemCartTop}px; left: ${itemCartLift}px;`

		setTimeout(() => {
			animationElStatus.value = `top: ${animationEndTop + animationEnd.offsetHeight / 2 - itemCart.offsetHeight / 2}px; left: ${animationEndLeft + animationEnd.offsetWidth / 2 - itemCart.offsetHeight / 2}px; transition: all 0.8s; transform: rotate(-720deg);`
		}, 20);
		setTimeout(() => {
			animationElStatus.value = ''
			animationAddRepeatFlag.value = false
		}, 1020);

	}, 100);
	// #endif
}

//获取购物车数据
/**
 * @description 获取分类数据
 * */
const initAll = ref({
	allActive: -1,
	data: { category_name: "全部", category_id: '' }
})
const tabsData: any = ref<Array<Object>>([])
const getCategoryData = () => {
	loading.value = true;
	getGoodsCategoryTree().then((res: any) => {
		tabsData.value = res.data;
		for (let i = 0; i < tabsData.value.length; i++) {
			if (tabsData.value[i].child_list) {
				let obj = {
					category_name: "全部",
					category_id: tabsData.value[i].category_id
				};
				tabsData.value[i].child_list.unshift(obj)
			}
		}
		if (categoryId) {
			for (let i = 0; i < tabsData.value.length; i++) {
				if (tabsData.value[i].category_id == categoryId) {
					tabActive.value = i;
					break;
				}
				if (tabsData.value[i].child_list) {
					for (let k = 0; k < tabsData.value[i].child_list.length; k++) {
						if (tabsData.value[i].child_list[k].category_id == categoryId) {
							tabActive.value = i;
							subActive.value = k;
							break;
						}
					}
				}
			}
		} else {
			categoryId = res.data[0].category_id;
		}
		loading.value = false;
	}).catch(() => {
		loading.value = false;
	});
}

// 一级菜单样式控制
const tabActive = ref<number>(0)
// 二级菜单样式控制
const subActive = ref<number>(0)

// 一级菜单点击事件
const firstLevelClick = (index: number, data: any) => {
	tabActive.value = index;
	if (data.child_list && data.child_list.length) {
		subMenuClick(0, data.child_list[0]);
	} else {
		categoryId = data.category_id;
		list.value = [];
		getMescroll().resetUpScroll();
	}
}

/**
 * @description 二级菜单点击事件
 * @param {number} index
 * @param {Object} data
 * */
const subMenuClick = (index: number, data: any) => {
	subActive.value = index;
	categoryId = data.category_id;
	labelPopup.value = false
	list.value = [];
	getMescroll().resetUpScroll();
}

// 搜索名字
const searchNameFn = () => {
	// getMescroll().resetUpScroll();
	if (searchName.value) redirect({ url: '/addon/phone_shop/pages/goods/list', param: { goods_name: searchName.value } })
}

//强制绑定手机号
const configStore = useConfigStore()
const bindMobileRef = ref(null)

//点击商品购物车按钮
const cartRef = ref()
const itemCart = (row: any, id: any) => {
	// 虚拟商品，并且需要核销，禁止加入购物车
	if (row.goods_type == 'virtual' && row.virtual_receive_type == 'verify') {
		return toLink(row.goodsSku.goods_id)
	}

	if (config.cart.event !== 'cart') {
		return toLink(row.goods_id)
	}

	// if (!userInfo.value) {
	// 	useLogin().setLoginBack({ url: '/addon/phone_shop/pages/goods/category' })
	// 	return false
	// }
	// 绑定手机号
	if (uni.getStorageSync('isbindmobile')) {
		bindMobileRef.value.open()
		return false
	}
	if (row.goodsSku.sku_spec_format) {
		cartRef.value.open(row.goodsSku.sku_id)
	} else {
		//单规格添加购物车
		if (parseInt(row.goodsSku.num || 0) >= parseInt(row.goodsSku.stock)) {
			uni.showToast({ title: '商品库存不足', icon: 'none' })
			return;
		}
		animationAddCart(row, id)
	}
}

//点击购物车加号 添加数量
const addCartBtn = (item: any, row: any, id: string) => {
	if (parseInt(row.num) >= parseInt(row.stock)) {
		uni.showToast({ title: '商品库存不足', icon: 'none' })
		return;
	}

	let obj = cloneDeep(item)
	obj.num = row.num;
	obj.id = row.id;
	animationAddCart(obj, id)
}

//点击购物车减号
const reduceCart = (row: any) => {
	if (cartRepeatFlag.value) return false
	cartRepeatFlag.value = true
	cartStore.reduce({
		id: row.id,
		goods_id: row.goods_id,
		sku_id: row.sku_id,
		stock: row.stock,
		sale_price: row.sale_price,
		num: row.num
	}, 1, () => {
		cartRepeatFlag.value = false
	})

}

//进入购物车
const toCart = () => {
	redirect({ url: '/addon/phone_shop/pages/goods/cart' })
}
/**
 * 结算
 */
const settlement = () => {
	// 绑定手机号
	if (uni.getStorageSync('isbindmobile')) {
		bindMobileRef.value.open()
		return false
	}
	if (!totalNum.value) {
		uni.showToast({ title: '还没有选择商品', icon: 'none' })
		return
	}
	const ids: any = []
	Object.values(cartList.value).forEach(item => {
		Object.keys(item).forEach(v => {
			if (v != 'totalNum' && v != 'totalMoney') ids.push(item[v].id)
		})
	})
	uni.setStorage({
		key: 'orderCreateData',
		data: {
			cart_ids: ids
		},
		success() {
			redirect({ url: '/addon/phone_shop/pages/order/payment' })
		}
	})
}

// 价格相关方法
const priceType = (data: any) => {
	if (data.is_discount && data.goodsSku.sale_price != data.goodsSku.price) {
		return 'discount_price'
	} else if (data.member_discount && getToken() && data.goodsSku.member_price != data.goodsSku.price) {
		return 'member_price'
	} if (getToken() && data.goodsSku.member_price != data.goodsSku.price) {
		return 'member_price'
	}
	return ""
}

const goodsPrice = (data: any) => {
	let price = "0.00"
	console.log(data)
	if (data.is_discount && data.goodsSku.sale_price != data.goodsSku.price) {
		console.log(1)
		price = data.goodsSku.sale_price || data.goodsSku.price
	} else if (data.member_discount && getToken() && data.goodsSku.member_price != data.goodsSku.price) {

		price = data.goodsSku.member_price || data.goodsSku.price
	} else if (getToken() && data.goodsSku.member_price != data.goodsSku.price) {

		price = data.goodsSku.member_price || data.goodsSku.price
	} else {
		console.log(3)
		price = data.goodsSku.price
	}
	return parseFloat(price)
}
</script>

<style lang="scss" scoped>
.remove-border {
	&::after {
		border: none;
	}
}

.border-color {
	border-color: var(--primary-color) !important;
}

.text-color {
	color: var(--primary-color) !important;
}

.bg-color {
	background-color: var(--primary-color) !important;
}

.class-select {
	position: relative;
	font-weight: bold;

	&::before {
		content: "";
		position: absolute;
		bottom: 0;
		height: 6rpx;
		background-color: $u-primary;
		width: 90%;
		left: 50%;
		transform: translateX(-50%);
	}
}

.list-select {
	position: relative;
	margin-right: 28rpx;

	&::before {
		content: "";
		position: absolute;
		background-color: #999;
		width: 2rpx;
		height: 70%;
		top: 50%;
		right: -14rpx;
		transform: translatey(-50%);
	}
}

.transform-rotate {
	transform: rotate(180deg);
}

.text-color {
	color: $u-primary;
}

.border-color {
	border-color: $u-primary;
}

.bg-color {
	background-color: $u-primary;
}

// search input
.search-box {
	// position: relative;
	padding: 20rpx 24rpx;
}

.search-box .search-ipt {
	height: 64rpx;
	background-color: #F6F8F8;
	border-radius: 33rpx;
}

.search-box .search-ipt .input-placeholder {
	color: #A5A6A6;
}

.tabs-box {
	width: 182rpx;
	font-size: 28rpx;
}

.tabs-box .tab-item {
	height: 92rpx;
	text-align: center;
	line-height: 92rpx;
	background-color: #fff;
}

.tabs-box .tab-item-active {
	position: relative;
	color: var(--primary-color);
	background-color: #F4F6F8;

	&::before {
		display: inline-block;
		position: absolute;
		left: 0rpx;
		top: 50%;
		transform: translateY(-50%);
		content: '';
		width: 6rpx;
		height: 48rpx;
		background-color: var(--primary-color);
	}

	&::after {
		display: inline-block;
		position: absolute;
		left: 0rpx;
		top: 50%;
		transform: translateY(-50%);
		content: '';
		width: 6rpx;
		height: 48rpx;
		background-color: var(--primary-color);
	}
}

/*  #ifdef  H5  */

.category .labelPopup :deep(.u-transition) {
	top: 92rpx !important;
	left: 182rpx !important;
	z-index: 8 !important;
}

.category .labelPopup.active :deep(.u-transition) {
	top: 198rpx !important;
}

/*  #endif  */
.scroll-height {
	height: 100%;
}

/*  #ifdef  H5  */
.cart {
	.child.noData1 {
		height: calc(100vh - 146rpx - 92rpx - 100rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 92rpx - 100rpx - 50px - env(safe-area-inset-bottom));
	}

	.child.noData2 {
		height: calc(100vh - 40rpx - 92rpx - 100rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 92rpx - 100rpx - 50px - env(safe-area-inset-bottom));
	}

	.noChild.noData1 {
		height: calc(100vh - 146rpx - 100rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 100rpx - 50px - env(safe-area-inset-bottom));
	}

	.noChild.noData2 {
		height: calc(100vh - 40rpx - 100rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 100rpx - 50px - env(safe-area-inset-bottom));
	}
}

.detail {
	.child.noData1 {
		height: calc(100vh - 146rpx - 92rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 92rpx - 50px - env(safe-area-inset-bottom));
	}

	.child.noData2 {
		height: calc(100vh - 40rpx - 92rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 92rpx - 50px - env(safe-area-inset-bottom));
	}

	.noChild.noData1 {
		height: calc(100vh - 146rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 50px - env(safe-area-inset-bottom));
	}

	.noChild.noData2 {
		height: calc(100vh - 40rpx - 50px - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 50px - env(safe-area-inset-bottom));
	}
}

/*  #endif  */
/*  #ifndef  H5  */
.cart {
	.child.noData1 {
		height: calc(100vh - 146rpx - 92rpx - 100rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 92rpx - 100rpx - 100rpx - env(safe-area-inset-bottom));
	}

	.child.noData2 {
		height: calc(100vh - 40rpx - 92rpx - 100rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 92rpx - 100rpx - 100rpx - env(safe-area-inset-bottom));
	}

	.noChild.noData1 {
		height: calc(100vh - 146rpx - 100rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 100rpx - 100rpx - env(safe-area-inset-bottom));
	}

	.noChild.noData2 {
		height: calc(100vh - 40rpx - 100rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 100rpx - 100rpx - env(safe-area-inset-bottom));
	}
}

.detail {
	.child.noData1 {
		height: calc(100vh - 146rpx - 92rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 92rpx - 100rpx - env(safe-area-inset-bottom));
	}

	.child.noData2 {
		height: calc(100vh - 40rpx - 92rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 92rpx - 100rpx - env(safe-area-inset-bottom));
	}

	.noChild.noData1 {
		height: calc(100vh - 146rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 146rpx - 100rpx - env(safe-area-inset-bottom));
	}

	.noChild.noData2 {
		height: calc(100vh - 40rpx - 100rpx - constant(safe-area-inset-bottom));
		height: calc(100vh - 40rpx - 100rpx - env(safe-area-inset-bottom));
	}
}

/*  #endif  */

.position-r {
	position: relative;
}

.position-a {
	position: absolute;
	left: 0px;
	top: 0;
	z-index: 2;
}

.position-b {
	position: relative;
	left: 0px;
	top: 0;
	z-index: 1;
}
</style>
