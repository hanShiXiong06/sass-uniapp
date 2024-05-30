<template>
	<x-skeleton :type="skeleton.type" :loading="skeleton.loading" :config="skeleton.config">
		<view :style="warpCss">
			<view :style="maskLayer"></view>
			<div class="diy-shop-goods-list relative flex flex-wrap justify-between">
				<block v-if="diyComponent.style == 'style-1'">
					<view class="bg-white w-full flex p-[20rpx] mx-[20rpx] rounded-[8rpx] overflow-hidden" :class="{ 'mt-[20rpx]': index > -10,'mb-[20rpx]': (index+1) == goodsList.length }" :style="itemCss" v-for="(item,index) in goodsList" :key="item.goods_id" @click="toLink(item)">
						<u--image class="rounded-[10rpx] overflow-hidden" width="190rpx" height="190rpx" :src="img(item.goods_cover_thumb_mid || '')" model="aspectFill">
							<template #error>
								<u-icon name="photo" color="#999" size="50"></u-icon>
							</template>
						</u--image>
						<view class="flex-1 flex flex-col ml-[20rpx] py-[6rpx]">
							<view class="text-[28rpx] leading-[40rpx] text-[#303133] multi-hidden mb-[10rpx]" :style="{ color : diyComponent.goodsNameStyle.color, fontWeight : diyComponent.goodsNameStyle.fontWeight }">{{item.goods_name}}</view>
							<view class="mt-auto flex items-center items-baseline">
								<view class="font-bold price-font flex items-baseline mr-[12rpx]" :style="{ color : diyComponent.priceStyle.mainColor }">
									<text class="text-[26rpx] font-500">￥</text>
									<text class="text-[36rpx] font-500">{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[0] }}</text>
									<text class="text-[24rpx] font-500">.{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[1] }}</text>
								</view>
								<view class="text-[var(--price-text-color)] price-font flex items-baseline" v-if="parseFloat(item.commission) && item.fenxiao" :style="{ color : diyComponent.commissionStyle.color }">
									<text class="text-[24rpx]">推广佣金</text>
									<text class="text-[26rpx] mx-[4rpx]">￥</text>
									<text class="text-[26rpx]">{{ parseFloat(item.commission).toFixed(2) }}</text>
								</view>
								<text v-if="item.fenxiao" @click.stop="openShareFn(item)" class="iconfont iconfenxiang1 leading-0 flex items-center justify-center rounded-full ml-auto w-[48rpx] h-[48rpx] bg-[var(--price-text-color)] text-[#fff]" :style="{ 'background-color' : diyComponent.commissionStyle.color }"></text>
								<text v-if="!item.fenxiao && diyComponent.is_become_fenxiao == 1" @click.stop="toFenxiaoLink()" class="leading-0 flex items-center justify-center rounded-[50rpx] ml-auto w-[150rpx] h-[56rpx] bg-[#fe4c19] text-[24rpx] text-[#fff]" :style="{ 'background-color' : diyComponent.commissionStyle.color }">
									成为分销商
								</text>
							</view>
						</view>
					</view>
				</block>
				<block v-if="diyComponent.style == 'style-2'">
					<view class="flex flex-col bg-[#fff] box-border rounded-[12rpx] overflow-hidden" :class="{'mt-[24rpx]': index > 1}" :style="itemCss" v-for="(item,index) in goodsList" :key="item.goods_id" @click="toLink(item)">
						<u--image :width="style2Width" :height="style2Width" :src="img(item.goods_cover_thumb_mid || '')" model="aspectFill">
							<template #error>
								<u-icon name="photo" color="#999" size="50"></u-icon>
							</template>
						</u--image>
						<view class="px-[16rpx] flex-1 pt-[16rpx] pb-[20rpx] flex flex-col justify-between">
							<view class="text-[#303133] leading-[40rpx] text-[28rpx] multi-hidden" :style="{ color : diyComponent.goodsNameStyle.color, fontWeight : diyComponent.goodsNameStyle.fontWeight }">{{item.goods_name}}</view>
							<view class="text-[24rpx] price-font flex items-baseline mt-[16rpx]" v-if="parseFloat(item.commission) && item.fenxiao" :style="{ color : diyComponent.commissionStyle.color }">
								<text class="text-[24rpx]">推广佣金</text>
								<text class="text-[26rpx] mx-[4rpx]">￥</text>
								<text class="text-[26rpx]">{{ parseFloat(item.commission).toFixed(2) }}</text>
							</view>
							<view class="flex justify-between items-center mt-[10rpx]" >
								<view class="text-[var(--price-text-color)] price-font flex items-baseline" :style="{ color : diyComponent.priceStyle.mainColor }">
									<text class="text-[26rpx] font-500">￥</text>
									<text class="text-[36rpx] font-500">{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[0] }}</text>
									<text class="text-[24rpx] font-500">.{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[1] }}</text>
								</view>
								<text v-if="item.fenxiao" @click.stop="openShareFn(item)" class="iconfont iconfenxiang1 leading-0 flex items-center justify-center rounded-full ml-auto w-[48rpx] h-[48rpx] bg-[var(--price-text-color)] text-[#fff]" :style="{ 'background-color' : diyComponent.commissionStyle.color }"></text>
								<text v-if="!item.fenxiao && diyComponent.is_become_fenxiao == 1" @click.stop="toFenxiaoLink()" class="leading-0 flex items-center justify-center rounded-[50rpx] ml-auto w-[150rpx] h-[56rpx] bg-[#fe4c19] text-[24rpx] text-[#fff]" :style="{ 'background-color' : diyComponent.commissionStyle.color }">
									成为分销商
								</text>
							</view>
						</view>
					</view>
				</block>
				<block v-if="diyComponent.style == 'style-3'">
					<scroll-view class="whitespace-nowrap" :scroll-x="true" :style="style3Css">
						<view class="w-[200rpx] rounded-[10rpx] inline-block bg-[#fff] box-border overflow-hidden" :class="{'mr-[14rpx]' : index != goodsList.length-1}" :style="itemCss" v-for="(item,index) in goodsList" :key="item.goods_id" @click="toLink(item)">
							<u--image width="200rpx" height="160rpx" :src="img(item.goods_cover_thumb_mid || '')" model="aspectFill">
								<template #error>
									<u-icon name="photo" color="#999" size="50"></u-icon>
								</template>
							</u--image>
							<view class="px-[10rpx] pt-[16rpx] pb-[10rpx]">
								<view class="text-[26rpx] text-[#303133] truncate" :style="{ color : diyComponent.goodsNameStyle.color, fontWeight : diyComponent.goodsNameStyle.fontWeight }">{{item.goods_name}}</view>
								<view class="text-[var(--price-text-color)] mt-[10rpx] font-bold price-font flex items-baseline" :style="{ color : diyComponent.priceStyle.mainColor }">
									<text class="text-[26rpx] font-500">￥</text>
									<text class="text-[36rpx] font-500">{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[0] }}</text>
									<text class="text-[24rpx] font-500">.{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[1] }}</text>
								</view>
							</view>
						</view>
					</scroll-view>
				</block>
			</div>
		</view>
		<share-poster ref="sharePosterRef" posterType="fenxiao_goods" :posterParam="posterParam" :copyUrlParam="copyUrlParam" :copyUrl="copyUrl" />
	</x-skeleton>
</template>

<script setup lang="ts">
	// 分销商品列表
    import { ref,reactive,computed, watch, onMounted, nextTick,getCurrentInstance } from 'vue';
	import { redirect, img } from '@/utils/common';
	import useDiyStore from '@/app/stores/diy';
	import { getFenxiaoComponents } from '@/addon/shop_fenxiao/api/fenxiao';
	import useMemberStore from '@/stores/member'
    import sharePoster from '@/components/share-poster/share-poster.vue'

	const props = defineProps(['component', 'index', 'pullDownRefreshCount','value']);
	const diyStore = useDiyStore();
	
	// 会员信息
	const memberStore = useMemberStore()
	const userInfo = computed(() => memberStore.info)

    const skeleton = reactive({
        type: '',
        loading: diyStore.mode == 'decorate' ? false : true,
        config: {}
    })

	const goodsList = ref<Array<any>>([]);

	const diyComponent = computed(() => {
        if(props.value) {
            return props.value;
        }else if (diyStore.mode == 'decorate') {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	})

	const warpCss = computed(() => {
		var style = '';
        style += 'position:relative;';
        if(diyComponent.value.componentStartBgColor) {
            if (diyComponent.value.componentStartBgColor && diyComponent.value.componentEndBgColor) style += `background:linear-gradient(${diyComponent.value.componentGradientAngle},${diyComponent.value.componentStartBgColor},${diyComponent.value.componentEndBgColor});`;
            else style += 'background-color:' + diyComponent.value.componentStartBgColor + ';';
        }

        if(diyComponent.value.componentBgUrl) {
            style += `background-image:url('${ img(diyComponent.value.componentBgUrl) }');`;
            style += 'background-size: cover;background-repeat: no-repeat;';
        }

		if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		return style;
	})

    // 背景图加遮罩层
    const maskLayer = computed(()=>{
        var style = '';
        if(diyComponent.value.componentBgUrl) {
            style += 'position:absolute;top:0;width:100%;';
            style += `background: rgba(0,0,0,${diyComponent.value.componentBgAlpha / 10});`;
            style += `height:${height.value}px;`;

            if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
            if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
            if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
            if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
        }

        return style;
    });

    const itemCss = computed(() => {
        var style = '';
        if (diyComponent.value.elementBgColor) style += 'background-color:' + diyComponent.value.elementBgColor + ';';
        if (diyComponent.value.topElementRounded) style += 'border-top-left-radius:' + diyComponent.value.topElementRounded * 2 + 'rpx;';
        if (diyComponent.value.topElementRounded) style += 'border-top-right-radius:' + diyComponent.value.topElementRounded * 2 + 'rpx;';
        if (diyComponent.value.bottomElementRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomElementRounded * 2 + 'rpx;';
        if (diyComponent.value.bottomElementRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomElementRounded * 2 + 'rpx;';
		if(diyComponent.value.style == 'style-2'){
			if(diyComponent.value.margin && diyComponent.value.margin.both) style += 'width: calc((100vw - ' + (diyComponent.value.margin.both*4) + 'rpx - 20rpx) / 2)'
			else style += 'width: calc((100vw - 20rpx) / 2 )'
		}
        return style;
    })
	
	const style2Width = computed(() => {
		var style = '';
		if(diyComponent.value.margin && diyComponent.value.margin.both) style += 'calc((100vw - ' + (diyComponent.value.margin.both*4) + 'rpx - 20rpx) / 2)'
		else style += 'calc((100vw - 20rpx) / 2 )'
		return style;
	})
	
	const style3Css = computed(() => {
        var style = '';
        style += 'padding:0 20rpx;';
        if (diyComponent.value.margin && diyComponent.value.margin.both) style += 'width: calc( 100vw - ' + ((diyComponent.value.margin.both * 4) + 40) + 'rpx)'
        return style;
    })

	watch(
		() => props.pullDownRefreshCount,
		(newValue, oldValue) => {
			// 处理下拉刷新业务
		}
	)

	const getGoodsListFn = () => {
		let data = {
			num: (diyComponent.value.source == 'all' || diyComponent.value.source == 'category') ? diyComponent.value.num : '',
			goods_category: diyComponent.value.source == 'category' ? diyComponent.value.goods_category : '',
            order: diyComponent.value.sortWay
		}
		getFenxiaoComponents(data).then((res) => {
			goodsList.value = res.data;
            skeleton.loading = false;
		});
	}

	const initSkeleton = ()=> {
        if (diyComponent.value.style == 'style-1') {

            // 单列 风格
            skeleton.type = 'list'
            skeleton.type = 'list'
            skeleton.config = {
                textRows: 2
            };
        } else if (diyComponent.value.style == 'style-2') {

            // 两列 风格
            skeleton.type = 'waterfall'
            skeleton.config = {
                headHeight: '320rpx',
                gridRows: 1,
                textRows: 2,
                textWidth: ['100%', '80%']
            };
        } else if (diyComponent.value.style == 'style-3') {

            // 横向滑动 风格
            skeleton.type = 'waterfall'
            skeleton.config = {
                gridRows: 1,
                gridColumns: 3,
                headHeight: '200rpx',
                textRows: 2,
                textWidth: ['100%', '80%']
            };
        }
    }

    const instance = getCurrentInstance();
    const height = ref(0)

	onMounted(() => {
		refresh();
        // 装修模式下刷新
        if (diyStore.mode == 'decorate') {
            watch(
                () => diyComponent.value,
                (newValue, oldValue) => {
                    if (newValue && newValue.componentName == 'GoodsList') {
                        nextTick(() => {
                            const query = uni.createSelectorQuery().in(instance);
                            query.select('.diy-shop-goods-list').boundingClientRect((data: any) => {
                                height.value = data.height;
                            }).exec();
                        })
                    }
                }
            )
        }else{
            watch(
                () => diyComponent.value,
                (newValue, oldValue) => {
                    refresh();
                },
                {deep: true}
            )
        }
	});

	const refresh = () => {
		// 装修模式下设置默认图
		if (diyStore.mode == 'decorate') {
			let obj = {
				goods_cover_thumb_mid: "",
				goods_name: "商品名称",
				sale_num: "100",
				commission: "10",
				unit: "件",
				fenxiaoGoods: {},
				goodsSku:{price:100}
			};
			goodsList.value.push(obj);
			goodsList.value.push(obj);
		}else{
            initSkeleton();
			getGoodsListFn();
		}
	}

	const toLink = (data) => {
		redirect({ url: '/addon/shop/pages/goods/detail', param: { goods_id: data.goods_id } })
	}
	
	const toFenxiaoLink = () => {
	    redirect({ url: '/addon/shop_fenxiao/pages/index'})
	}

	// rpx转px
	const rpxUpPx = (res) => {
		const screenWidth = uni.getSystemInfoSync().windowWidth;
		var data = (screenWidth * parseInt(res)) / 750;
		return Math.floor(data);
	}
	
	
	/************* 分享海报-start **************/
	let sharePosterRef = ref(null);
	let copyUrlParam = ref('');
	let copyUrl = ref('');
	let posterParam = {};
	// 分享海报链接
	const copyUrlFn = (data)=>{
		copyUrl.value = '/wap/addon/shop/pages/goods/detail';
		copyUrlParam.value = '?goods_id=' + data.goods_id;
		if (userInfo.value && userInfo.value.member_id) copyUrlParam.value += '&mid=' + userInfo.value.member_id;
	}
	const openShareFn = (data)=>{
		posterParam.sku_id = data.goodsSku.sku_id;
		if (userInfo.value && userInfo.value.member_id)
			posterParam.member_id = userInfo.value.member_id;
		copyUrlFn(data);
		sharePosterRef.value.openShare()
	}
	/************* 分享海报-end **************/
</script>

<style lang="scss" scoped>
</style>