<template>
	<view :style="warpCss">
		<view :style="maskLayer"></view>
		<view v-if="diyComponent.showtitle==1" class="flex items-center mb-[16rpx] mt-[32rpx]">
			<view class="ml-4 font-bold text-[30rpx]"
				:style="{color:diyComponent.titlecolor, fontSize:diyComponent.titlesize+'rpx', }">全城霸王餐
			</view>
			<view @click="changeAddress()" class="ml-4 text-[#ffab45] text-xs"
				:style="{color:diyComponent.localcolor,fontSize:diyComponent.localsize+'rpx'}">
				位置已缓存，点击切换位置
			</view>
			<!-- <view @click="changeAddress()" class="ml-4 flex text-[#ffab45] text-xs"
				:style="{color:diyComponent.localcolor,fontSize:diyComponent.localsize+'rpx'}">
				<view v-if="locationData" class="tk-sltext">{{locationData.name?locationData.name:'点击切换位置'}}

				</view>
				<view v-if="!locationData">点击选择位置</view>
				<view class="font-bold">></view>

			</view> -->
		</view>
		<!-- <view class="">
				<scroll-view scroll-x="true" class="scroll-Y box-border bg-white">
					<view class="flex whitespace-nowrap justify-around">
						<view :class="['text-sm leading-[90rpx]',{'class-select': planSource === item.value}]"
							@click="actStateFn(item.value)" v-for="(item,index) in actType">{{item.name}}</view>
					</view>
				</scroll-view>
			</view> -->
		<view class="tk-card" v-for="(item,index) in list">
			<view class="flex">
				<image style="width: 180rpx; height: 140rpx; background-color: #eeeeee;border-radius: 8px;"
					:src="item.logo" mode="aspectFill"></image>
				<view class="flex flex-col ml-2 w-[100%] justify-between" style="">
					<view class="font-bold tk-sltext">{{item.name}}</view>
					<view class="flex justify-between">
						<view class="flex items-center">
							<image style="width: 32rpx; height: 32rpx; background-color: #eeeeee;border-radius: 8px;"
								:src="item.platformLogo" mode="aspectFill"></image>
							<view class="text-xs mt-[4rpx] ml-2">{{item.platformName}}</view>
						</view>
						<view class="text-xs">{{item.distance}}</view>
					</view>
					<view class="flex justify-between">
						<text class="text-xs">共{{item.planList.length}}个活动</text>
					</view>
				</view>

			</view>
			<view class="" v-for="(item1,index1) in item.planList" :key="index1">
				<view class="flex items-center mt-2 mb-2">
					<view class="bg-slate-100 pl-2 pr-2 pt-1 pb-1 text-xs text-blue-100 rounded-lg">
						活动{{index1+1}}
					</view>
					<view class="text-xs">
						<text>{{timeChange(item1.startTime)=='0:0'?'00:00':timeChange(item1.startTime)}}-</text>
						<text>{{timeChange(item1.endTime)}}</text>
					</view>
					<view class="line-box"></view>
				</view>
				<view class="flex justify-between items-center">
					<view class="flex">

						<view class="">
							<u-tag :text="`最高返`+item1.commission" :bgColor="diyComponent.maincolor"
								:borderColor="diyComponent.maincolor" size="mini"></u-tag>
						</view>
						<view class="ml-2">
							<u-tag text="需要用餐评价" v-if="item1.planType == 1" type="success" plain plainFill size="mini"
								:borderColor="diyComponent.maincolor" :color="diyComponent.maincolor"></u-tag>
							<u-tag text="无需评价" v-else type="error" plain plainFill size="mini"
								:bgColor="diyComponent.yqbgcolor" :borderColor="diyComponent.yqbordercolor"
								:color="diyComponent.yqfontcolor"></u-tag>
						</view>
					</view>
					<view class="flex items-center">
						<view class="kucun ml-2">
							<text class="text-xs">还剩{{item1.restStock}}份</text>
							<u-line-progress :percentage="item1.restStock/item1.totalStock*100"
								:activeColor="diyComponent.jdcolor" height="5" :showText="false"></u-line-progress>
						</view>

						<u-icon name="arrow-right" color="#cccccc" size="10"></u-icon>
						<view class="ml-2">
							<u-tag v-if="item1.restStock>0" @click="goDetail(item1)" :text="`去报名`"
								:bgColor="diyComponent.maincolor" :borderColor="diyComponent.maincolor"></u-tag>
							<u-tag v-if="item1.restStock==0" :text="`已抢光`" bgColor="#6e6f6e"
								borderColor="#ffffff"></u-tag>
						</view>

					</view>

				</view>
			</view>

		</view>
		<up-loading-icon class="mt-4 mb-4" :show="loading" mode="circle" timing-function="linear"></up-loading-icon>

		<mescroll-empty :option="{'icon': img('static/resource/images/empty.png')}"
			v-if="!list.length && loading==false"></mescroll-empty>


		<!-- #ifdef MP-WEIXIN -->
		<!-- 小程序隐私协议 -->
		<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
	import { ref, computed, watch, onMounted, nextTick, getCurrentInstance, watchEffect } from 'vue';
	import { img, getLocation, locationStorage } from '@/utils/common';
	import MescrollUni from '@/components/mescroll/mescroll-uni/mescroll-uni.vue';
	import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
	import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
	import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
	import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useDiyStore from '@/app/stores/diy'
	const { mescrollInit, downCallback, getMescroll } = useMescroll()
	import useSystemStore from '@/stores/system';
	import { getActList, getActInfo } from '@/addon/tk_cps/api/bwc'
	import { timeChange } from '@/addon/tk_cps/utils/ts/common'
	const systemStore = useSystemStore();
	let list = ref<Array<Object>>([]);
	let loading = ref<boolean>(false);
	const planSource = ref(4)
	const actType = ref([
		{ name: '所有活动', value: 4 },
		{ name: '美团', value: 2 },
		{ name: '饿了么', value: 3 },
	])

	const actStateFn = (e) => {
		planSource.value = e
		getMescroll().resetUpScroll();
	}
	const upCallback = (mescroll) => {
		getActListFn(mescroll).then(res => {
		}).catch(() => {
			mescroll.endErr()
		})
	}
	const locationData = ref(uni.getStorageSync('location'))

	const goDetail = (item1) => {
		uni.navigateTo({ url: `/addon/tk_cps/pages/bwc/detail?planId=${item1.planId}` })
	}

	const listData = ref([])
	const page = ref(1)
	const getActListFn = () => {
		getLocationEvent()
		loading.value = true;
		let data : object = {
			page: page.value,
			mapLat: locationData.value.latitude || '39.908823',//纬度
			mapLon: locationData.value.longitude || '116.39747',//经度
			planSource: planSource.value
		};

		getActList(data).then((res) => {
			let newArr = (res.data.data.merchantList as Array<Object>);
			if (page.value == 1) {
				list.value = newArr
			} else {
				list.value = list.value.concat(newArr)
			}

			if (newArr.length == 0) {
				loading.value = false;
				uni.showToast({
					title: '已经没有更多数据',
					icon: 'none'
				})
			}
		}).catch(() => {
			loading.value = false;
		})
	}

	const changeAddress = () => {
		uni.chooseLocation({
			success: (res) => {
				locationData.value = res
				uni.setStorageSync('localtion', locationData.value);
				list.value = []
				getActListFn()
			},
			fail: (res) => {
				// 在隐私协议中没有声明chooseLocation:fail api作用域
				if (res.errMsg && res.errno) {
					if (res.errno == 104) {
						let msg = '用户未授权隐私权限，选择位置失败';
						uni.showToast({ title: msg, icon: 'none' })
					} else if (res.errno == 112) {
						let msg = '隐私协议中未声明，打开地图选择位置失败';
						uni.showToast({ title: msg, icon: 'none' })
					} else {
						uni.showToast({ title: res.errMsg, icon: 'none' })
					}
				}
			}
		});
	}
	const getLocationEvent = () => {
		if (!uni.getStorageSync('localtion')) {
			uni.getLocation({
				type: 'wgs84',
				success: function (res) {
					locationData.value = res
					uni.setStorageSync('localtion', locationData.value);
				}
			})
		}
	}
	onReachBottom(() => {
		page.value++
		getActListFn()
	})
	// getActListFn()
	// onLoad(() => {
	// 	getActListFn()
	// })
	const props = defineProps(['component', 'index', 'pullDownRefreshCount']);

	const diyStore = useDiyStore();

	const diyComponent = computed(() => {
		if (diyStore.mode == 'decorate') {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	})

	const warpCss = computed(() => {
		var style = '';
		style += 'position:relative;';
		if (diyComponent.value.componentStartBgColor) {
			if (diyComponent.value.componentStartBgColor && diyComponent.value.componentEndBgColor) style += `background:linear-gradient(${diyComponent.value.componentGradientAngle},${diyComponent.value.componentStartBgColor},${diyComponent.value.componentEndBgColor});`;
			else style += 'background-color:' + diyComponent.value.componentStartBgColor + ';';
		}

		if (diyComponent.value.componentBgUrl) {
			style += `background-image:url('${img(diyComponent.value.componentBgUrl)}');`;
			style += 'background-size: cover;background-repeat: no-repeat;';
		}

		if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		return style;
	})

	// 背景图加遮罩层
	const maskLayer = computed(() => {
		var style = '';
		if (diyComponent.value.componentBgUrl) {
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

	watch(
		() => props.pullDownRefreshCount,
		(newValue, oldValue) => {
			// 处理下拉刷新业务
		}
	)

	onMounted(() => {
		getActListFn()
		refresh();
		// 装修模式下刷新
		if (diyStore.mode == 'decorate') {
			watch(
				() => diyComponent.value,
				(newValue, oldValue) => {
					if (newValue && newValue.componentName == 'RichText') {
						refresh();
					}
				}
			)
		}
	});

	const instance = getCurrentInstance();
	const height = ref(0)

	const refresh = () => {
		nextTick(() => {
			const query = uni.createSelectorQuery().in(instance);
			query.select('.diy-rich-text').boundingClientRect((data : any) => {
				height.value = data.height;
			}).exec();
		})
	}
</script>

<style lang="scss" scoped>
	@import '@/addon/tk_cps/utils/styles/common.scss';

	.tk-sltext {
		max-width: 200px; //也可以设置最大宽度
		overflow: hidden; // 溢出隐藏
		display: -webkit-box; //  自适应布局 弹性伸缩盒子
		-webkit-box-orient: vertical; //垂直排列子元素 伸缩盒子的子元素排列
		-webkit-line-clamp: 1; //最多显示几行 多出部分。。。显示
		text-overflow: ellipsis; // 显示省略号
	}

	.line-box {
		background-color: #EEEEEE;
		height: 2rpx;
		width: 50%;
	}

	.class-select {
		position: relative;
		font-weight: bold;
		font-size: 28rpx;

		&::after {
			content: "";
			position: absolute;
			bottom: 0;
			height: 8rpx;
			background-color: #FE6D3A;
			border-radius: 4rpx;
			width: 90%;
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>