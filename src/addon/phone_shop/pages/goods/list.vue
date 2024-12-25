<template>
	<view class="bg-gray-100 min-h-[100vh]" :style="themeColor()">
		<view class="fixed left-0 right-0 top-0 product-warp bg-[#fff] px-[30rpx]">
			<view class="py-[14rpx] flex items-center justify-between">
				<view class="flex-1 flex items-center h-[64rpx] bg-[#F6F8F8] rounded-[33rpx] px-[32rpx] mr-[30rpx]">
					<u-input class="flex-1" maxlength="50" v-model="goods_name" @confirm="searchTypeFn('all')"
						placeholder="请搜索您想要的商品(串号搜索前加#)" placeholderClass="text-[#a5a6a6] text-[26rpx]" fontSize="26rpx"
						clearable border="none"></u-input>
					<text class="nc-iconfont nc-icon-sousuo-duanV6xx1 text-[32rpx] ml-[18rpx] !text-[#999]"
						@click="searchTypeFn('all')"></text>
				</view>
				<view
					:class="['nc-iconfont text-[34rpx] text-[#666]', listType ? 'nc-icon-erweimaV6xx' : 'nc-icon-yingyongliebiaoV6xx']"
					@click="listIconBtn"></view>
			</view>
			<view class="flex justify-between tems-center py-[22rpx] px-[20rpx]">
				<view class=" flex items-center justify-between text-[24rpx] text-[#666] flex-1">
					<!-- <text :class="{ 'text-[#303133] ': searchType == 'all' }" @click="searchTypeFn('day')">今日上新</text> -->
					<view class="flex items-center"
						:class="{ 'text-[#303133]': searchType == 'sale_num', 'active': create_time }"
						@click="searchTypeFn('day')">
						<text class="mr-[4rpx]">今日上新</text>
						<text v-if="create_time"
							class="text-[18rpx]  nc-iconfont nc-icon-shanchu-yuangaizhiV6xx"></text>
						<!-- <text v-else class="text-[18rpx] text-[#666] nc-iconfont nc-icon-a-xiangxiaV6xx1"></text> -->
					</view>
					<view class="flex items-center" :class="{ 'text-[#303133]': searchType == 'price' }"
						@click="searchTypeFn('price')">
						<text class=" mr-[4rpx]">价格</text>

					</view>
					<view class="flex items-center" :class="{ 'text-[#303133]': searchType == 'label' }"
						@click="searchTypeFn('label')">
						<text class="mr-[2rpx]">筛选</text>
						<text class="nc-iconfont color-[#666] nc-icon-shaixuanV6xx text-[28rpx]"></text>
					</view>
				</view>
			</view>
		</view>
		<u-popup :show="pricePopup" mode="top" @close="pricePopup = false">
			<view @touchmove.prevent.stop>

				<!--        价格区间筛选 -->
				<view class="flex justify-center flex-wrap  pb-[20rpx]">

					<view class="flex flex-wrap pl-[30rpx] pt-[30rpx] mr-3">

						<u-input placeholder="最低价格" border="surround" class="mr-3"
							prefixIconStyle="font-size: 22px;color: #909399" v-model="price_between.start_price">
						</u-input>
						-
						<u-input placeholder="最高价格" border="surround" class="ml-3" v-model="price_between.end_price" />
						<!-- <view @click='price_order_change'>
							<text v-if="price == 'asc'"
								class="text-[18rpx] text-[#666] nc-iconfont nc-icon-a-xiangshangV6xx1"></text>
							<text v-else class="text-[18rpx] text-[#666] nc-iconfont nc-icon-a-xiangxiaV6xx1"></text>
						</view> -->
					</view>

					<view class="flex flex-wrap justify-end pl-[30rpx] p-[30rpx] ">
						<div class="flex ">
							<u-button type="success" :plain="true" class="mr-3 " text="重置"
								@click="resetQuery"></u-button>
							<u-button type="primary" @click="searchTypeFn" text="搜索"></u-button>
						</div>


					</view>
				</view>
			</view>
		</u-popup>
		<u-popup :show="labelPopup" mode="top" @close="labelPopup = false">
			<view @touchmove.prevent.stop>
				<!-- <view class="text-sm font-bold px-[30rpx] mt-3">全部分类</view> -->
				<view class="  tabs-box z-2 fixed left-0 bg-[#fff] bottom-[50px] top-20 pl-[10rpx] pt-[30rpx]">
					<scroll-view :scroll-y="true" class="scroll-height bg-[#ddd] ">
						<view class="bg-[#F4F6F8]">
							<view class="tab-item truncate"
								:class="{ 'tab-item-active': currGoodsCategory == index, 'rounded-br-[12rpx]': currGoodsCategory - 1 === index, 'rounded-tr-[12rpx]': currGoodsCategory + 1 === index }"
								v-for="(item, index) in categoryList" :key="item.category_id"
								@click="loadCategory(item.category_id)">
								<view class="text-box px-[16rpx] truncate">
									{{ item.category_name }}
								</view>
							</view>
						</view>
					</scroll-view>
				</view>

				<!--        价格区间筛选 -->
				<view class="flex justify-center flex-wrap pl-[200rpx] pb-[20rpx]">
					<scroll-view class="h-[70vh]" :scroll-y="true">
						<view
							class="bg-[#fff] grid grid-cols-3 gap-x-[50rpx] gap-y-[32rpx] py-[33rpx] px-[23rpx]  rounded-[16rpx]">
							<template v-for="(item, index) in categoryList[currGoodsCategory]?.child_list"
								:key="item.category_id">

								<view class="text-center flex flex-col items-center pt-[8rpx] rounded "
									:class="{ 'bg-[#f4f6f8]': goods_category == item.category_id }"
									@click="loadTreeCategory(item.category_id)">
									<u--image radius="12rpx" width="60rpx" height="60rpx"
										:src="img(item.image ? item.image : '')" model="aspectFill">
										<template #error>
											<image class="rounded-[12rpx] overflow-hidden w-[60rpx] h-[60rpx]"
												:src="img('static/resource/images/diy/shop_default.jpg')"
												mode="aspectFill">
											</image>
										</template>
									</u--image>
									<view class="text-[24rpx] text-center mt-[12rpx] leading-[34rpx]">{{
										item.category_name
									}}
									</view>
								</view>
							</template>
						</view>
					</scroll-view>

					<view class="flex flex-wrap justify-end pl-[30rpx] p-[30rpx] ">
						<div class="flex ">
							<u-button type="success" :plain="true" class="mr-3 " text="重置"
								@click="resetQuery"></u-button>
							<u-button type="primary" @click="searchTypeFn" text="搜索"></u-button>
						</div>


					</view>
				</view>
			</view>
		</u-popup>


		<mescroll-body ref="mescrollRef" top="160rpx" bottom="50px" @init="mescrollInit" :down="{ use: false }"
			@up="getAllAppListFn">

			<view v-if="articleList.length"
				:class="['sidebar-marign', !listType ? 'flex justify-between flex-wrap' : '']">
				<template v-for="(item, index) in articleList">
					<template v-if="listType" :key="item.app_id">
						<view class="bg-white flex p-[20rpx] rounded-[16rpx] overflow-hidden mt-[20rpx]"
							:class="{ 'mb-[20rpx]': (index + 1) == articleList.length }"
							@click="toDetail(item.goods_id)">
							<u--image class="rounded-[10rpx] overflow-hidden" width="190rpx" height="190rpx"
								:src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')"
								model="aspectFill">
								<template #error>
									<image class="w-[190rpx] h-[190rpx] rounded-[10rpx] overflow-hidden"
										:src="img('static/resource/images/diy/shop_default.jpg')" mode="aspectFill">
									</image>
								</template>
							</u--image>
							<view class="flex-1 flex flex-col ml-[20rpx] py-[6rpx]">
								<view class="text-[28rpx] text-[#303133] leading-[40rpx]  multi-hidden mb-[10rpx]">
									{{
										item.goods_name }}</view>
								<view class="text-[16rpx] text-[#303133] leading-[40rpx]  multi-hidden mb-[10rpx]"
									v-if="item.sub_title">
									{{ item.sub_title }}
								</view>
								<view class="text-[16rpx] text-[#303133] leading-[40rpx]  multi-hidden mb-[10rpx]"
									v-if="item.goodsSku.sku_no"> sn:
									{{
										item.goodsSku.sku_no }}
								</view>
								<view class="mt-auto flex justify-between items-baseline">
									<view class="text-[var(--price-text-color)] price-font flex items-baseline">
										<text class="text-[26rpx] font-500">￥</text>
										<text class="text-[36rpx] font-500">{{
											goodsPrice(item).toFixed(2).split('.')[0]
										}}</text>
										<text class="text-[24rpx] font-500">.{{
											goodsPrice(item).toFixed(2).split('.')[1] }}</text>
										<image class="h-[24rpx] w-[72rpx] ml-[6rpx]"
											v-if="priceType(item) == 'member_price'"
											:src="img('addon/phone_shop/VIP.png')" mode="heightFix" />
										<image class="h-[24rpx] w-[72rpx] ml-[6rpx]"
											v-if="priceType(item) == 'discount_price'"
											:src="img('addon/phone_shop/discount.png')" mode="heightFix" />
									</view>
									<text class="text-[22rpx] text-[#999]">库存:{{ item.goodsSku.stock }}{{ item.unit
										}} |
										已售:{{
											item.sale_num }}{{ item.unit
										}}</text>

									<text @click.stop="onGoodsShare(item.goods_id)"
										class="nc-iconfont nc-icon-fenxiangV6xx"></text>
									<!-- #ifdef MP || APP-PLUS  -->
									<!-- #endif -->
								</view>
							</view>
						</view>
					</template>
					<template v-else>
						<view
							class="goods-item-style-two flex flex-col bg-[#fff] box-border rounded-[12rpx] overflow-hidden mt-[20rpx]"
							@click="toDetail(item.goods_id)">
							<u--image width="100%" height="350rpx"
								:src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')"
								model="aspectFill">
								<template #error>
									<image class="w-[100%] h-[350rpx]"
										:src="img('static/resource/images/diy/shop_default.jpg')" mode="aspectFill">
									</image>
								</template>
							</u--image>
							<view class="px-[16rpx] flex-1 pt-[16rpx] pb-[20rpx] flex flex-col justify-between">
								<view class="text-[#303133] leading-[40rpx] text-[28rpx] multi-hidden">
									{{ item.goods_name }}
								</view>
								<view class="text-[#303133] leading-[40rpx] text-[20rpx] multi-hidden">
									{{ item.sub_title }}
								</view>
								<view class="flex justify-between flex-wrap items-baseline mt-[16rpx]">
									<view class="text-[var(--price-text-color)] price-font flex items-baseline">
										<!--										<text class="text-[20rpx]  mr-[4rpx]">￥</text>-->
										<!--										<text class="text-[36rpx] font-500">{{ item.goodsSku.price }}</text>-->

										<text class="text-[26rpx] font-500">￥</text>
										<text class="text-[36rpx] font-500">{{
											goodsPrice(item).toFixed(2).split('.')[0]
										}}</text>
										<text class="text-[24rpx] font-500">.{{
											goodsPrice(item).toFixed(2).split('.')[1] }}</text>
										<image class="h-[24rpx] ml-[6rpx]" v-if="priceType(item) == 'member_price'"
											:src="img('addon/phone_shop/VIP.png')" mode="heightFix" />
										<image class="h-[24rpx] ml-[6rpx]" v-if="priceType(item) == 'discount_price'"
											:src="img('addon/phone_shop/discount.png')" mode="heightFix" />
									</view>
									<text class="text-[22rpx] text-[#999]"> 库存{{ item.goodsSku.stock }}{{ item.unit
										}} </text>
								</view>
							</view>
						</view>
					</template>
				</template>
			</view>
			<view class="mx-[30rpx] mt-[20rpx] bg-[#fff] rounded-[16rpx] noData flex items-center justify-center"
				v-if="!articleList.length && loading">
				<mescroll-empty :option="{ tip: '暂无商品' }"></mescroll-empty>
			</view>
		</mescroll-body>
		<!-- 小程序隐私协议 -->
		<wx-privacy-popup ref="wxPrivacyPopupRef"></wx-privacy-popup>

		<tabbar />
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { t } from '@/locale'
import { redirect, img, getToken, deepClone } from '@/utils/common';
import { getGoodsDetail, getGoodsCategoryTree, getGoodsPages } from '@/addon/phone_shop/api/goods';
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';

const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

const categoryList = ref<Array<Object>>([]);
const articleList = ref<Array<any>>([]);
const coupon_id = ref<number | string>('');
const currGoodsCategory = ref<number | string>('');
const mescrollRef = ref(null);
const loading = ref<boolean>(false);
// 标签
const labelPopup = ref(false);
const pricePopup = ref(false);
const goods_name = ref("");
const price = ref("");
const sale_num = ref("");
const create_time = ref("");
const searchType = ref('all');
const isShow = ref(false)//输入框清除文字按钮
let price_between = ref({
	start_price: '',
	end_price: '',
});

//列表类型
const listType = ref(true)
onLoad(async (option) => {
	goods_category.value = option.curr_goods_category || ''
	goods_name.value = option.goods_name || ''
	coupon_id.value = option.coupon_id || ''
	if (option.create_time) {
		create_time.value = new Date().getTime()
	}


})

interface mescrollStructure {
	num: number,
	size: number,
	endSuccess: Function,
	[propName: string]: any
}
const goodsDetail = ref({})
const onGoodsShare = (id: number) => {

	getGoodsDetail({
		goods_id: id,
	}).then(res => {
		if (!res.data.goods || JSON.stringify(res.data) === '[]') {
			uni.showToast({ title: '找不到该商品', icon: 'none' })
			setTimeout(() => {
				redirect({ url: '/addon/phone_shop/pages/index', mode: 'reLaunch' })
			}, 600)
			return false
		}

		goodsDetail.value = deepClone(res.data);
		// 如果  goodsDetail.value.goods.goods_image 中有 , 则转为数组 如果没有则是单张图片

		if (goodsDetail.value.goods.goods_image.indexOf(',') > -1) {
			goodsDetail.value.goods.goods_image = goodsDetail.value.goods.goods_image.split(',')
		} else {
			goodsDetail.value.goods.goods_image = [goodsDetail.value.goods.goods_image]
		}

		// console.log(goodsDetail.value.goods.goods_image);
		downloadMultipleImages(goodsDetail.value.goods.goods_image).then(res => {

			if (res) {

				let sku_no = goodsDetail.value.sku_no ? '#' + goodsDetail.value.sku_no + ' ' : ''
				uni.setClipboardData({
					data: goodsDetail.value.goods.goods_name + ' ' + goodsDetail.value.goods.sub_title + ' ' + sku_no + goodsDetail.value.goods.price,
					success() {
						uni.showToast({
							title: '图片下载及复制文案成功',
							icon: 'none'
						})
					}
				})
			} else {
				uni.showToast({
					title: '下载失败',
					icon: 'none'
				});
			}
		})
		//iPhone15 Pro 128G 111 #990899

	})

}


/************** 一键复制-start **********/
// const toCopy = () => {
// 	// 复制商品名称 及价格
// 	let sku_no = goodsDetail.value.sku_no ? goodsDetail.value.sku_no + '|' : ''
// 	uni.setClipboardData({
// 		data: goodsDetail.value.goods.goods_name + '|' + goodsDetail.value.goods.sub_title + '|' + sku_no + goodsDetail.value.sale_price + "元",
// 		success() {
// 			uni.showToast({
// 				title: '复制成功',
// 				icon: 'none'
// 			})
// 		}
// 	})
// }
/************** 一键复制-end **********/
/*
* downloadBanner
* 一键下载所有的banner图片
* */



// #ifdef MP || APP-PLUS
// Main function to download all images
// const downloadBanner = () => {
// 	const images = goodsDetail.value.goods.goods_image;
// 	downloadMultipleImages(images)
// }

// 下载单个图片的函数
function downloadImage(imageUrl: string) {
	return new Promise((resolve, reject) => {
		uni.downloadFile({
			url: imageUrl,
			success: (res) => {
				if (res.errMsg == "downloadFile:ok") {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.showToast({
								title: '保存成功',
								icon: 'none'
							});
							resolve(res.tempFilePath);  // 成功时解析文件路径
						},
						fail: () => {
							uni.showToast({
								title: '保存失败，请稍后重试',
								icon: 'none'
							});
							reject('保存图片失败');  // 失败时拒绝
						}
					});
				} else {
					reject('下载文件失败');  // 下载文件失败时拒绝
				}
			},
			fail: () => {
				uni.showToast({
					title: '保存失败，请稍后重试',
					icon: 'none'
				});
				reject('下载过程中出错');  // 请求失败时拒绝
			}
		});
	});
}

// 下载多个图片的函数
function downloadMultipleImages(images: Object) {
	// 创建多个下载任务
	let downloadTasks = images.map((imageUrl: string) => downloadImage(imageUrl));
	loading.value = true;
	// 使用 Promise.all 等待所有图片下载完成
	return Promise.all(downloadTasks)
		.then((results) => {
			loading.value = false;
			return true

		})
		.catch((error) => {
			loading.value = false;
			return false

		});
}


// #endif

const getAllAppListFn = (mescroll: mescrollStructure) => {
	loading.value = false;
	let data: object = {
		goods_category: goods_category.value,
		page: mescroll.num || 15,
		limit: mescroll.size,
		keyword: goods_name.value,
		coupon_id: coupon_id.value,
		order: searchType.value === 'all' ? '' : searchType.value,
		sort: searchType.value == 'price' ? price.value : sale_num.value,
		start_price: price_between.value.start_price,
		end_price: price_between.value.end_price,
		create_time: create_time.value
	};
	getGoodsPages(data).then((res: any) => {
		let newArr = (res.data.data as Array<Object>);
		//设置列表数据
		// if (Number(mescroll.num) === 1) {
		// 	articleList.value = []; //如果是第一页需手动制空列表
		// }


		articleList.value = articleList.value.concat(newArr);
		mescroll.endSuccess(newArr.length);
		loading.value = true;
	}).catch(() => {
		loading.value = true;
		mescroll.endErr(); // 请求失败, 结束加载
	})
}


const loadCategory = (id: string) => {
	goods_category.value = id;
	articleList.value = [];
	// getMescroll().resetUpScroll();
	// labelPopup.value = false;
	// 返回id在数组中的下标
	const index = categoryList.value.findIndex((item: any) => item.category_id == id);
	// 赋值给currGoodsCategory
	currGoodsCategory.value = index

}
const loadTreeCategory = (id: string) => {


	if (goods_category.value == id) {
		goods_category.value = categoryList.value[currGoodsCategory.value - 1].category_id || ''
	} else {
		goods_category.value = id;
	}

	articleList.value = [];
}


const goods_category = ref('');
// 搜索

const searchTypeFn = async (type) => {
	console.log(type);

	if (categoryList.value.length == 0) {
		await getGoodsCategoryTree().then((res: any) => {
			const initData = { category_name: "全部", category_id: '' };
			categoryList.value.push(initData);
			categoryList.value = categoryList.value.concat(res.data);
			// loadCategory(categoryList.value[0].category_id)
		});
	}
	searchType.value = type;
	if (type == 'all') {
		sale_num.value = '';
		price.value = '';

	}
	if (type == 'day') {
		// 今日上新 当前的日期 通过 原生的js 完成 yyyy-hh-mm
		goods_category.value = ''
		create_time.value = create_time.value ? "" : new Date().toLocaleDateString().split('/').join('-');
	}
	if (type == 'sale_num') {
		price.value = '';
		if (sale_num.value) {
			sale_num.value = sale_num.value == 'asc' ? 'desc' : 'asc';
		} else {
			sale_num.value = 'asc';
		}
	}
	if (type == 'price') {
		console.log(price_between.value);
		pricePopup.value = !pricePopup.value

	}
	if (type == 'label') {
		sale_num.value = 'asc';
		price.value = 'asc';

		labelPopup.value = !labelPopup.value;
	} else {
		labelPopup.value = false;
		articleList.value = [];

		getMescroll().resetUpScroll();
	}
}
// const price_order_change = () => {

// 	if (price.value) {
// 		price.value = price.value == 'asc' ? 'desc' : 'asc';
// 	} else {
// 		price.value = 'asc';
// 	}
// }

//列表样式切换
const listIconBtn = () => {
	listType.value = !listType.value
}
const toDetail = (id: string | number) => {
	redirect({ url: '/addon/phone_shop/pages/goods/detail', param: { goods_id: id }, mode: 'navigateTo' })
}
// resetQuery 重置搜索
const resetQuery = () => {
	goods_name.value = '';
	currGoodsCategory.value = ''
	goods_category.value = ''
	coupon_id.value = '';
	price.value = '';
	sale_num.value = '';
	price_between.value.start_price = '';
	price_between.value.end_price = '';
	labelPopup.value = false;
	pricePopup.value = false;
	searchType.value = 'all';
	listType.value = true;
	articleList.value = [];
	create_time.value = ''
	getMescroll().resetUpScroll();
}
onMounted(() => {
	setTimeout(() => {
		getMescroll().optUp.textNoMore = t("end");
	}, 500)
});

// 是否展示会员价
const isMemberPriceShow = (data: any) => {
	let bool = false;
	if (data.member_discount && getToken()) {
		bool = true;
	} else {
		bool = false
	}
	return bool;
}
// 价格类型
const priceType = (data: any) => {
	let type = "";
	if (data.is_discount && data.goodsSku.sale_price != data.goodsSku.price) {
		type = 'discount_price'// 折扣
	} else if (data.member_discount && getToken() && data.goodsSku.member_price != data.goodsSku.price) {
		type = 'member_price' // 会员价
	} else {
		type = ""
	}
	return type;
}
// 商品价格
const goodsPrice = (data: any) => {
	let price = "0.00";
	if (data.is_discount && data.goodsSku.sale_price != data.goodsSku.price) {
		price = data.goodsSku.sale_price ? data.goodsSku.sale_price : data.goodsSku.price // 折扣价
	} else if (data.member_discount && getToken() && data.goodsSku.member_price != data.goodsSku.price) {
		price = data.goodsSku.member_price ? data.goodsSku.member_price : data.goodsSku.price // 会员价
	} else {
		price = data.goodsSku.price
	}
	return parseFloat(price);
}
</script>

<style lang="scss" scoped>
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

:deep(.u-input__content__clear) {
	width: 28rpx;
	height: 28rpx;
	font-size: 28rpx;
	background-color: #999;
}

.noData {
	height: calc(100vh - 200rpx - 50px - constant(safe-area-inset-bottom));
	height: calc(100vh - 200rpx - 50px - env(safe-area-inset-bottom));
}

.goods-item-style-two {
	width: calc(50% - 10rpx);
}


.tabs-box {
	width: 182rpx;
	font-size: 28rpx;
}

.tabs-box .tab-item {
	height: 92rpx;
	text-align: center;
	line-height: 92rpx;
	background-color: #e7e2e23f;
}

.tabs-box .tab-item-active {
	position: relative;
	color: var(--primary-color);
	background-color: #ffffff;

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

.scroll-height {
	height: 100%;
}

.active {
	color: #f00
}
</style>