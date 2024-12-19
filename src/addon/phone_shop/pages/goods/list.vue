<template>
	<view class="bg-gray-100 min-h-[100vh]" :style="themeColor()">
		<view class="fixed left-0 right-0 top-0 product-warp bg-[#fff] px-[30rpx]">
			<!-- 搜索框 -->
			<view class="py-[14rpx] flex items-center justify-between">
				<view class="flex-1 flex items-center h-[64rpx] bg-[#F6F8F8] rounded-[33rpx] px-[32rpx] mr-[30rpx]">
					<u-input class="flex-1" maxlength="50" v-model="goods_name" @confirm="searchGoods"
						placeholder="请搜索您想要的商品(串号搜索前加#)" placeholderClass="text-[#a5a6a6] text-[26rpx]" fontSize="26rpx"
						clearable border="none"></u-input>
					<text class="nc-iconfont nc-icon-sousuo-duanV6xx1 text-[32rpx] ml-[18rpx] !text-[#999]"
						@click="searchGoods"></text>
				</view>
				<view
					:class="['nc-iconfont text-[34rpx] text-[#666]', listType ? 'nc-icon-erweimaV6xx' : 'nc-icon-yingyongliebiaoV6xx']"
					@click="listIconBtn"></view>
			</view>

			<!-- 筛选条件 -->
			<view class="flex justify-between items-center py-[22rpx] px-[20rpx]">
				<view class="flex items-center justify-between text-[24rpx] text-[#666] flex-1">

					<view class="flex items-center" :class="{ 'text-[#303133]': activeFilter === 'price' }"
						@click="showFilter('price')">
						<text class="mr-[4rpx]">价格</text>
						<text v-if="hasPriceFilter" class="text-[18rpx] text-primary">●</text>
					</view>
					<view class="flex items-center" :class="{ 'text-[#303133]': activeFilter === 'category' }"
						@click="showFilter('category')">
						<text class="mr-[4rpx]">分类</text>
						<text v-if="selectedCategory" class="text-[18rpx] text-primary">●</text>
					</view>
					<view class="flex items-center" :class="{ 'text-[#303133]': activeFilter === 'brand' }"
						@click="showFilter('brand')">
						<text class="mr-[4rpx]">品牌</text>
						<text v-if="selectedBrand" class="text-[18rpx] text-primary">●</text>
					</view>
					<view class="flex items-center" :class="{ 'text-[#303133]': activeFilter === 'label' }"
						@click="showFilter('label')">
						<text class="mr-[2rpx]">标签</text>
						<text v-if="selectedLabels.length" class="text-[18rpx] text-primary">●</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 价格筛选弹窗 -->
		<u-popup :show="pricePopup" mode="top" @close="closeFilter">
			<view class="filter-content">
				<view class="price-range flex items-center justify-center py-[30rpx]">
					<u-input v-model="price_between.start_price" placeholder="最低价" class="w-[200rpx]" />
					<text class="mx-[20rpx]">-</text>
					<u-input v-model="price_between.end_price" placeholder="最高价" class="w-[200rpx]" />
				</view>
				<view class="price-sort flex justify-center py-[20rpx]">
					<view class="sort-btn" :class="{ 'active': priceSort === 'asc' }" @click="setPriceSort('asc')">从低到高
					</view>
					<view class="sort-btn ml-[20rpx]" :class="{ 'active': priceSort === 'desc' }"
						@click="setPriceSort('desc')">从高到低</view>
				</view>
				<view class="filter-footer flex justify-end py-[20rpx] px-[30rpx]">
					<u-button type="success" :plain="true" class="mr-[20rpx]" text="重置" @click="resetPriceFilter" />
					<u-button type="primary" text="确定" @click="confirmPriceFilter" />
				</view>
			</view>
		</u-popup>

		<!-- 分类筛选弹窗 -->
		<u-popup :show="labelPopup && activeFilter === 'category'" mode="top" @close="closeFilter">
			<view @touchmove.prevent.stop>
				<view class="tabs-box z-2 fixed left-0 bg-[#fff] bottom-[50px] top-20 pl-[10rpx] pt-[30rpx]">
					<scroll-view :scroll-y="true" class="scroll-height bg-[#ddd]">
						<view class="bg-[#F4F6F8]">
							<view class="tab-item truncate"
								:class="{ 'tab-item-active': (currGoodsCategory !== '' && currGoodsCategory == index) || selectedCategory === item.category_id }"
								v-for="(item, index) in categoryList" :key="item.category_id"
								@click="loadCategory(item.category_id)">
								<view class="text-box px-[16rpx] truncate">
									{{ item.category_name }}
								</view>
							</view>
						</view>
					</scroll-view>
				</view>

				<!-- 子分类列表 -->
				<view class="flex justify-center flex-wrap pl-[200rpx] pb-[20rpx]">
					<scroll-view class="h-[70vh]" :scroll-y="true">
						<view
							class="bg-[#fff] grid grid-cols-3 gap-x-[50rpx] gap-y-[32rpx] py-[33rpx] px-[23rpx] rounded-[16rpx]">
							<template v-for="(item, index) in categoryList[currGoodsCategory]?.child_list"
								:key="item.category_id">
								<view class="text-center flex flex-col items-center pt-[8rpx] rounded"
									:class="{ 'bg-[#f4f6f8]': goods_category === item.category_id }"
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
									<view class="text-[24rpx] text-center mt-[12rpx] leading-[34rpx]">
										{{ item.category_name }}
									</view>
								</view>
							</template>
						</view>
					</scroll-view>
				</view>

				<!-- 确认和重置按钮 -->
				<view class="flex flex-wrap justify-end pl-[30rpx] p-[30rpx]">
					<div class="flex">
						<u-button type="success" :plain="true" class="mr-3" text="重置" @click="resetCategory"></u-button>
						<u-button type="primary" @click="confirmCategory" text="确定"></u-button>
					</div>
				</view>
			</view>
		</u-popup>

		<!-- 品牌筛选弹窗 -->
		<u-popup :show="brandPopup" mode="top" @close="closeFilter">
			<view class="filter-content">
				<scroll-view scroll-y class="brand-list" style="max-height: 60vh;">
					<view class="grid grid-cols-3 gap-4 p-[30rpx]">
						<view v-for="item in brandList" :key="item.brand_id"
							class="brand-item text-center py-[20rpx] px-[30rpx] rounded"
							:class="{ 'active': selectedBrand === item.brand_id }" @click="selectBrand(item)">
							{{ item.brand_name }}
						</view>
					</view>
				</scroll-view>
				<view class="filter-footer flex justify-end py-[20rpx] px-[30rpx]">
					<u-button type="success" :plain="true" class="mr-[20rpx]" text="重置" @click="resetBrandFilter" />
					<u-button type="primary" text="确定" @click="confirmBrandFilter" />
				</view>
			</view>
		</u-popup>

		<!-- 标签筛选弹窗 -->
		<u-popup :show="labelPopup && activeFilter === 'label'" mode="top" @close="closeFilter">
			<view class="filter-content">
				<scroll-view scroll-y class="label-list" style="max-height: 60vh;">
					<view class="grid grid-cols-3 gap-4 p-[30rpx]">
						<view v-for="item in labelList" :key="item.label_id"
							class="label-item text-center py-[20rpx] px-[30rpx] rounded"
							:class="{ 'active': selectedLabels.includes(item.label_id) }" @click="toggleLabel(item)">
							{{ item.label_name }}
						</view>
					</view>
				</scroll-view>
				<view class="filter-footer flex justify-end py-[20rpx] px-[30rpx]">
					<u-button type="success" :plain="true" class="mr-[20rpx]" text="重置" @click="resetLabelFilter" />
					<u-button type="primary" text="确定" @click="confirmLabelFilter" />
				</view>
			</view>
		</u-popup>

		<!-- 商品列表 -->
		<mescroll-body ref="mescrollRef" top="160rpx" bottom="50px" @init="mescrollInit" @up="getAllAppListFn">
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
								<view class="text-[28rpx] text-[#303133] leading-[40rpx] multi-hidden mb-[10rpx]">
									{{ item.goods_name }}
								</view>
								<view class="text-[16rpx] text-[#303133] leading-[40rpx] multi-hidden mb-[10rpx]"
									v-if="item.sub_title">
									{{ item.sub_title }}
								</view>
								<view class="text-[16rpx] text-[#303133] leading-[40rpx] multi-hidden mb-[10rpx]"
									v-if="item.goodsSku.sku_no">
									sn: {{ item.goodsSku.sku_no }}
								</view>
								<view class="mt-auto flex justify-between items-baseline">
									<view class="text-[var(--price-text-color)] price-font flex items-baseline">
										<text class="text-[26rpx] font-500">￥</text>
										<text class="text-[36rpx] font-500">{{ goodsPrice(item).toFixed(2).split('.')[0]
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
									<text class="text-[22rpx] text-[#999]">
										库存:{{ item.goodsSku.stock }}{{ item.unit }} | 已售:{{ item.sale_num }}{{ item.unit
										}}
									</text>
									<text @click.stop="onGoodsShare(item.goods_id)"
										class="nc-iconfont nc-icon-fenxiangV6xx"></text>
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
										<text class="text-[26rpx] font-500">￥</text>
										<text class="text-[36rpx] font-500">{{ goodsPrice(item).toFixed(2).split('.')[0]
											}}</text>
										<text class="text-[24rpx] font-500">.{{
											goodsPrice(item).toFixed(2).split('.')[1] }}</text>
										<image class="h-[24rpx] ml-[6rpx]" v-if="priceType(item) == 'member_price'"
											:src="img('addon/phone_shop/VIP.png')" mode="heightFix" />
										<image class="h-[24rpx] ml-[6rpx]" v-if="priceType(item) == 'discount_price'"
											:src="img('addon/phone_shop/discount.png')" mode="heightFix" />
									</view>
									<text class="text-[22rpx] text-[#999]">
										库存{{ item.goodsSku.stock }}{{ item.unit }}
									</text>
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
import { reactive, ref, onMounted, computed } from 'vue'
import { t } from '@/locale'
import { redirect, img, getToken, deepClone } from '@/utils/common';
import { getGoodsDetail, getGoodsCategoryTree, getGoodsPages, getBrandList, getLabelList } from '@/addon/phone_shop/api/goods';
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
const brandList = ref<Array<any>>([]);
const labelList = ref<Array<any>>([]);
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
	// 获取分类列表
	const [categoryRes, brandRes, labelRes] = await Promise.all([
		getGoodsCategoryTree(),
		getBrandList(),
		getLabelList()
	])

	// 设置分类、品牌、标签数据
	categoryList.value = categoryRes.data;
	brandList.value = brandRes.data;
	labelList.value = labelRes.data;

	// 设置基本参数
	goods_name.value = option?.goods_name || '';
	coupon_id.value = option?.coupon_id || '';
	if (option?.create_time) {
		create_time.value = new Date().getTime();
	}

	// 处理分类选择
	if (option?.goods_category) {
		// 如果URL中有分类参数，查找对应的分类
		const parentCategory = categoryList.value.find((item: any) => {
			// 检查是否是父分类
			if (item.category_id == option.goods_category) {
				return true;
			}
			// 检查是否是子分类
			return item.child_list?.some((child: any) => child.category_id == option.goods_category);
		});

		if (parentCategory) {
			// 找到父分类的索引
			const index = categoryList.value.findIndex((item: any) => item.category_id === parentCategory.category_id);
			currGoodsCategory.value = index;

			// 如果选中的是子分类
			if (parentCategory.category_id != option.goods_category) {
				goods_category.value = option.goods_category;
				selectedCategory.value = option.goods_category;
			} else {
				// 如果选中的是父分类，直接使用父分类ID
				goods_category.value = parentCategory.category_id;
				selectedCategory.value = parentCategory.category_id;
			}
		}
	} else if (categoryList.value.length > 0) {
		// 默认选中第一个分类
		const firstCategory = categoryList.value[0];
		currGoodsCategory.value = 0;
		goods_category.value = firstCategory.category_id;
		selectedCategory.value = firstCategory.category_id;
	}

	// 加载商品列表
	reloadList();
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
							title: '图片下载及复制文案成',
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

// 下载单个片的函数
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

const getAllAppListFn = async (mescroll: mescrollStructure) => {
	loading.value = false;
	const data = {
		goods_category: goods_category.value,
		page: mescroll.num || 15,
		limit: mescroll.size,
		keyword: goods_name.value,
		coupon_id: coupon_id.value,
		order: priceSort.value ? 'price' : '',
		sort: priceSort.value,
		start_price: price_between.value.start_price,
		end_price: price_between.value.end_price,
		brand_id: selectedBrand.value,
		label_ids: selectedLabels.value.join(',')
	};

	try {
		const res = await getGoodsPages(data);
		const newArr = res.data.data;
		articleList.value = articleList.value.concat(newArr);
		mescroll.endSuccess(newArr.length);
		loading.value = true;
	} catch (err) {
		loading.value = true;
		mescroll.endErr();
	}
}


const loadCategory = (id: string) => {
	const category = categoryList.value.find((item: any) => item.category_id === id);
	if (category) {
		const index = categoryList.value.findIndex((item: any) => item.category_id === id);
		currGoodsCategory.value = index;
		// 直接使用一级分类ID
		goods_category.value = id;
		selectedCategory.value = id;
		// 重新加载商品列表
		reloadList();
	}
}

const loadTreeCategory = (id: string) => {
	goods_category.value = id;
	selectedCategory.value = id;
	// 重新加载商品列表
	reloadList();
}


const goods_category = ref('');
// 搜索

const searchTypeFn = async (type) => {
	if (categoryList.value.length == 0) {
		await getGoodsCategoryTree().then((res: any) => {
			categoryList.value = res.data;
			if (categoryList.value.length > 0) {
				currGoodsCategory.value = 0;
				goods_category.value = categoryList.value[0].category_id;
				selectedCategory.value = categoryList.value[0].category_id;
			}
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

// 筛选相关状态
const activeFilter = ref('')
const categoryPopup = ref(false)
const brandPopup = ref(false)

const selectedCategory = ref('')
const selectedBrand = ref('')
const selectedLabels = ref([])
const priceSort = ref('')

// 计算属性
const hasPriceFilter = computed(() => {
	return price_between.start_price || price_between.end_price || priceSort.value
})

// 显示筛选面板
const showFilter = (type: string) => {
	// 先关闭所有弹窗
	pricePopup.value = false;
	labelPopup.value = false;
	brandPopup.value = false;

	// 设置当前激活的筛选类型
	activeFilter.value = type;

	// 根据类型打开对应弹窗
	switch (type) {
		case 'price':
			pricePopup.value = true;
			break;
		case 'category':
			labelPopup.value = true;
			break;
		case 'brand':
			brandPopup.value = true;
			break;
		case 'label':
			labelPopup.value = true;
			break;
	}
}

// 关闭筛选面板
const closeFilter = () => {
	// 关闭所有弹窗
	pricePopup.value = false;
	labelPopup.value = false;
	brandPopup.value = false;
	// 清除激活状态
	activeFilter.value = '';
}

// 设置价格排序
const setPriceSort = (sort: string) => {
	priceSort.value = sort
}

// 选择分类
const selectCategory = (category: any) => {
	selectedCategory.value = category.category_id
}

// 重置价格筛选
const resetPriceFilter = () => {
	price_between.start_price = ''
	price_between.end_price = ''
	priceSort.value = ''
}

// 重置分类筛选
const resetCategoryFilter = () => {
	selectedCategory.value = ''
}

// 确认价格筛选
const confirmPriceFilter = () => {
	closeFilter()
	reloadList()
}

// 确认分类筛选
const confirmCategoryFilter = () => {
	closeFilter()
	reloadList()
}

// 搜索商品
const searchGoods = () => {
	reloadList()
}


// 重新加载列表
const reloadList = () => {
	articleList.value = []
	getMescroll().resetUpScroll()
}

// 重置分类
const resetCategory = () => {
	// 清除所有分类相关数据
	currGoodsCategory.value = '';
	goods_category.value = '';
	selectedCategory.value = '';
	// 重新加载列表
	reloadList();
	// 关闭弹窗
	labelPopup.value = false;
}

// 确认分类选择
const confirmCategory = () => {
	labelPopup.value = false;
	reloadList();
}

// 选择品牌
const selectBrand = (brand: any) => {
	selectedBrand.value = brand.brand_id
}

// 重置品牌筛选
const resetBrandFilter = () => {
	selectedBrand.value = ''
}

// 确认品牌筛选
const confirmBrandFilter = () => {
	brandPopup.value = false;
	reloadList();
}

// 切换标签
const toggleLabel = (label: any) => {
	if (selectedLabels.value.includes(label.label_id)) {
		selectedLabels.value = selectedLabels.value.filter(item => item !== label.label_id)
	} else {
		selectedLabels.value.push(label.label_id)
	}
}

// 重置标签筛选
const resetLabelFilter = () => {
	selectedLabels.value = []
}

// 确认标签筛选
const confirmLabelFilter = () => {
	labelPopup.value = false;
	reloadList();
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

.filter-content {
	background: #fff;
	padding: 20rpx;
}

.sort-btn {
	padding: 10rpx 30rpx;
	border: 1px solid #ddd;
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #666;

	&.active {
		color: var(--primary-color);
		border-color: var(--primary-color);
		background: var(--primary-color-light);
	}
}

.category-item {
	font-size: 28rpx;
	color: #333;

	&.active {
		color: var(--primary-color);
		background: var(--primary-color-light);
	}
}

.filter-footer {
	border-top: 1px solid #eee;
}

.text-primary {
	color: var(--primary-color);
}
</style>