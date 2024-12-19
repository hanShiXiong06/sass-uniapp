<template>
	<view :style="warpCss">
		<view :style="maskLayer"></view>
		<view v-if="diyComponent.showtitle == 1" class="flex items-center mb-[16rpx] mt-[32rpx] justify-between mr-2">
			<view class="ml-4 font-bold text-[30rpx]" :style="{
          color: diyComponent.titlecolor,
          fontSize: diyComponent.titlesize + 'rpx',
        }">
				全城霸王餐
			</view>
			<view class="flex items-center" @click="locationVal.reposition()">
				<view>
					<u-icon name="map" :color="diyComponent.localcolor" :size="diyComponent.localsize / 2"></u-icon>
				</view>
				<view class="text-[#ffab45] text-xs tk-sltext" :style="{
            color: diyComponent.localcolor,
            fontSize: diyComponent.localsize + 'rpx',
          }">
					{{ !systemStore.diyAddressInfo? "选择位置" : systemStore.diyAddressInfo.community }}
				</view>
				<view>
					<u-icon name="arrow-right" :color="diyComponent.localcolor"
						:size="diyComponent.localsize / 2"></u-icon>
				</view>
			</view>

		</view>
		<view v-if="diyComponent.showsearch == 1" class="fl items-center ml-4 mr-4 mb-2 bg-[#fcfcfc] rounded-[16rpx]"
			:style="{
		  background: diyComponent.searchcolor,
		}">
			<u-input clearable v-model="keyword" placeholder="输入商家名称快速检索" @change="reload" @blur="reload"
				suffixIcon="search" suffixIconStyle="color: #909399"></u-input>
		</view>
		<view v-if="diyComponent.cateshow == 1" class="">
			<scroll-view scroll-x="true" class="scroll-X box-border px-[24rpx]">
				<view class="flex flex-row" style="width: max-content" :style="{ color: diyComponent.catefontcolor }">
					<view class="x-tabs-box" :class="[
              'text-sm leading-[60rpx] mr-4',
              { 'class-select': planSource === item.value },
            ]" :style="{
              color:
                planSource === item.value
                  ? diyComponent.cateselectfontcolor
                  : diyComponent.catefontcolor,
              background:
                planSource === item.value
                  ? diyComponent.catebackground
                  : 'transparent',
            }" @click="actStateFn(item.value)" v-for="(item, index) in actType" style="display: inline-block">
						{{ item.name }}
					</view>
				</view>
			</scroll-view>
		</view>
		<view v-if="list&&list.length>0" class="tk-card" v-for="(item, index) in list">
			<view class="flex">
				<image style="
            width: 180rpx;
            height: 140rpx;
            background-color: #eeeeee;
            border-radius: 8px;
          " :src="item.logo" mode="aspectFill"></image>
				<view class="flex flex-col ml-2 w-[100%] justify-between" style="">
					<view class="font-bold tk-sltext">{{ item.name }}</view>
					<view class="flex justify-between">
						<view class="flex items-center">
							<image style="
                  width: 32rpx;
                  height: 32rpx;
                  background-color: #eeeeee;
                  border-radius: 8px;
                " :src="item.platformLogo" mode="aspectFill"></image>
							<view class="text-xs mt-[4rpx] ml-2">{{
                item.platformName
              }}</view>
						</view>
						<view class="text-xs">{{ item.distance }}</view>
					</view>
					<view class="flex justify-between">
						<text class="text-xs">共{{ item.planList.length }}个活动</text>
					</view>
				</view>
			</view>
			<view class="" v-for="(item1, index1) in item.planList" :key="index1">
				<view class="flex items-center mt-2 mb-2">
					<view class="bg-slate-100 pl-2 pr-2 pt-1 pb-1 text-xs text-blue-100 rounded-lg">
						活动{{ index1 + 1 }}
					</view>
					<view class="text-xs">
						<text>{{
                timeChange(item1.startTime) == "0:0"
                  ? "00:00"
                  : timeChange(item1.startTime)
              }}-</text>
						<text>{{ timeChange(item1.endTime) }}</text>
					</view>
					<view class="line-box"></view>
				</view>
				<view class="flex justify-between items-center">
					<view class="flex">
						<view class="">
							<u-tag :text="`最高返` + item1.commission" :bgColor="diyComponent.maincolor"
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
							<text class="text-xs">还剩{{ item1.restStock }}份</text>
							<u-line-progress :percentage="(item1.restStock / item1.totalStock) * 100"
								:activeColor="diyComponent.jdcolor" height="5" :showText="false"></u-line-progress>
						</view>

						<u-icon name="arrow-right" color="#cccccc" size="10"></u-icon>
						<view class="ml-2">
							<u-tag v-if="item1.restStock > 0" @click="goDetail(item1)" :text="`去报名`"
								:bgColor="diyComponent.maincolor" :borderColor="diyComponent.maincolor"></u-tag>
							<u-tag v-if="item1.restStock == 0" :text="`已抢光`" bgColor="#6e6f6e"
								borderColor="#ffffff"></u-tag>
						</view>
					</view>
				</view>
			</view>
		</view>
		<up-loading-icon class="mt-4 mb-4" :show="loading" mode="circle" timing-function="linear"></up-loading-icon>

		<mescroll-empty :option="{ icon: img('static/resource/images/empty.png') }"
			v-if="!list.length && loading == false"></mescroll-empty>

		<!-- #ifdef MP-WEIXIN -->
		<!-- 小程序隐私协议 -->
		<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
	import {
		ref,
		computed,
		watch,
		onMounted,
		nextTick,
		getCurrentInstance,
		watchEffect
	} from "vue";
	import { img } from "@/utils/common";
	import MescrollUni from "@/components/mescroll/mescroll-uni/mescroll-uni.vue";
	import MescrollBody from "@/components/mescroll/mescroll-body/mescroll-body.vue";
	import useMescroll from "@/components/mescroll/hooks/useMescroll.js";
	import MescrollEmpty from "@/components/mescroll/mescroll-empty/mescroll-empty.vue";
	import { onLoad, onPageScroll, onReachBottom } from "@dcloudio/uni-app";
	import useDiyStore from "@/app/stores/diy";
	import useSystemStore from "@/addon/tk_cps/stores/system";
	import { getActList, getActInfo, getNewActList } from "@/addon/tk_cps/api/bwc";
	import { timeChange, authLogin, getLocationData } from "@/addon/tk_cps/utils/ts/common";
	import { getAddressByLatlng } from "@/app/api/system";
	import { useLocation } from '@/addon/tk_cps/hooks/useLocation'
	const locationVal = useLocation(true);
	locationVal.onLoad();
	locationVal.init();
	locationVal.refresh();
	const systemStore = useSystemStore();
	const currentPosition = ref();
	let list = ref<Array<Object>>([]);
	let loading = ref<boolean>(false);
	authLogin()
	const planSource = ref(4);
	const actType = ref([
		{ name: "所有活动", value: 4 },
		{ name: "美团", value: 2 },
		{ name: "饿了么", value: 3 },
	]);
	const goDetail = (item1) => {
		uni.navigateTo({
			url: `/addon/tk_cps/pages/bwc/detail?planId=${item1.planId}`,
		});
	};
	const keyword = ref()
	const reload = (e) => {
		loading.value = true;
		keyword.value = e
		listData.value = []
		page.value = ''
		getActListFn()
	}
	const listData = ref([]);
	const page = ref('');
	const getActListFn = () => {
		let location = getLocationData()
		if (!location) {
			location = uni.getStorageSync('location_address')
		}
		loading.value = true;
		let data : object = {
			pageId: page.value,
			mapLat: location.latitude, //纬度
			mapLon: location.longitude, //经度
			planSource: planSource.value,
			keyword: keyword.value
		};

		getNewActList(data)
			.then((res) => {
				let newArr = res.data.data.merchantList as Array<Object>;
				if (newArr.length == 0) {
					loading.value = false;
					uni.showToast({
						title: "已经没有更多数据",
						icon: "none",
					});
					return
				}
				if (page.value == '') {
					page.value = res.data.data.pageId
					list.value = newArr;
				} else {
					page.value = res.data.data.pageId
					list.value = list.value.concat(newArr);
				}

			})
			.catch(() => {
				loading.value = false;
			});
	};
	watch(() => systemStore.diyAddressInfo, (nval, oval) => {
		if (nval.latitude && nval.longitude) {
			loading.value = true;
			listData.value = []
			page.value = ''
			getActListFn()
		} else {
			currentPosition.value = "定位中..."
		}
	}, { deep: true })

	const actStateFn = (e) => {
		page.value = '';
		planSource.value = e;
		list.value = [];
		getActListFn();
	};
	onReachBottom(() => {
		getActListFn();
	});

	const props = defineProps(["component", "index", "pullDownRefreshCount"]);

	const diyStore = useDiyStore();

	const diyComponent = computed(() => {
		if (diyStore.mode == "decorate") {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	});

	const warpCss = computed(() => {
		var style = "";
		style += "position:relative;";
		if (diyComponent.value.componentStartBgColor) {
			if (
				diyComponent.value.componentStartBgColor &&
				diyComponent.value.componentEndBgColor
			)
				style += `background:linear-gradient(${diyComponent.value.componentGradientAngle},${diyComponent.value.componentStartBgColor},${diyComponent.value.componentEndBgColor});`;
			else
				style +=
					"background-color:" + diyComponent.value.componentStartBgColor + ";";
		}

		if (diyComponent.value.componentBgUrl) {
			style += `background-image:url('${img(
				diyComponent.value.componentBgUrl
			)}');`;
			style += "background-size: cover;background-repeat: no-repeat;";
		}

		if (diyComponent.value.topRounded)
			style +=
				"border-top-left-radius:" + diyComponent.value.topRounded * 2 + "rpx;";
		if (diyComponent.value.topRounded)
			style +=
				"border-top-right-radius:" + diyComponent.value.topRounded * 2 + "rpx;";
		if (diyComponent.value.bottomRounded)
			style +=
				"border-bottom-left-radius:" +
				diyComponent.value.bottomRounded * 2 +
				"rpx;";
		if (diyComponent.value.bottomRounded)
			style +=
				"border-bottom-right-radius:" +
				diyComponent.value.bottomRounded * 2 +
				"rpx;";
		return style;
	});

	// 背景图加遮罩层
	const maskLayer = computed(() => {
		var style = "";
		if (diyComponent.value.componentBgUrl) {
			style += "position:absolute;top:0;width:100%;";
			style += `background: rgba(0,0,0,${diyComponent.value.componentBgAlpha / 10
				});`;
			style += `height:${height.value}px;`;

			if (diyComponent.value.topRounded)
				style +=
					"border-top-left-radius:" + diyComponent.value.topRounded * 2 + "rpx;";
			if (diyComponent.value.topRounded)
				style +=
					"border-top-right-radius:" + diyComponent.value.topRounded * 2 + "rpx;";
			if (diyComponent.value.bottomRounded)
				style +=
					"border-bottom-left-radius:" +
					diyComponent.value.bottomRounded * 2 +
					"rpx;";
			if (diyComponent.value.bottomRounded)
				style +=
					"border-bottom-right-radius:" +
					diyComponent.value.bottomRounded * 2 +
					"rpx;";
		}

		return style;
	});

	watch(
		() => props.pullDownRefreshCount,
		(newValue, oldValue) => {
			// 处理下拉刷新业务
		}
	);

	onMounted(() => {
		refresh();
		getActListFn()
		// 装修模式下刷新
		if (diyStore.mode == "decorate") {
			watch(
				() => diyComponent.value,
				(newValue, oldValue) => {
					if (newValue && newValue.componentName == "RichText") {
						refresh();
					}
				}
			);
		}
	});

	const instance = getCurrentInstance();
	const height = ref(0);

	const refresh = () => {
		nextTick(() => {
			const query = uni.createSelectorQuery().in(instance);
			query
				.select(".diy-rich-text")
				.boundingClientRect((data : any) => {
					height.value = data.height;
				})
				.exec();
		});
	};
</script>

<style lang="scss" scoped>
	@import "@/addon/tk_cps/utils/styles/common.scss";

	.tk-sltext {
		max-width: 200px; //也可以设置最大宽度
		overflow: hidden; // 溢出隐藏
		display: -webkit-box; //  自适应布局 弹性伸缩盒子
		-webkit-box-orient: vertical; //垂直排列子元素 伸缩盒子的子元素排列
		-webkit-line-clamp: 1; //最多显示几行 多出部分。。。显示
		text-overflow: ellipsis; // 显示省略号
	}

	.line-box {
		background-color: #eeeeee;
		height: 2rpx;
		width: 50%;
	}

	.class-select {
		padding: 0rpx 20rpx;
		color: #ffaa00;
		background: #f7ffab;
		border-color: #f7e2a1;
		border-radius: 50rpx;
	}
</style>