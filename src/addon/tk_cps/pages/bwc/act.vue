<template>
	<view class="detail-box">
		<view class="flex items-center mb-[16rpx] mt-[32rpx] flex-right justify-between mr-2">
			<view class="ml-4 font-bold text-[36rpx]">全城霸王餐</view>
			<view class="flex items-center" @click="locationVal.reposition()">
				<view>
					<u-icon name="map" color="#ffab45" size="18"></u-icon>
				</view>
				<view class="text-[#ffab45] text-xs tk-sltext">
					{{ !systemStore.diyAddressInfo ? "选择位置" : systemStore.diyAddressInfo.community }}
				</view>
				<view>
					<u-icon name="arrow-right" color="#ffab45" size="18"></u-icon>
				</view>
			</view>
		</view>
		<view class="">
			<scroll-view scroll-x="true" class="scroll-Y box-border bg-white">
				<view class="flex whitespace-nowrap justify-around">
					<view :class="[
            'text-sm leading-[90rpx]',
            { 'class-select': planSource === item.value },
          ]" @click="actStateFn(item.value)" v-for="(item, index) in actType">{{ item.name }}</view>
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
							<view class="text-xs mt-[4rpx] ml-2">{{ item.platformName }}</view>
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
					<view class="bg-slate-100 pl-2 pr-2 pt-1 pb-1 text-xs text-blue-100 rounded-lg">活动{{ index1 + 1 }}
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
				<view @click="goDetail(item1)" class="flex justify-between items-center">
					<view class="flex">
						<view class="">
							<u-tag :text="`最高返` + item1.commission" bgColor="#FA6400" borderColor="#FE5A49"
								size="mini"></u-tag>
						</view>
						<view class="ml-2">
							<u-tag text="需要用餐评价" v-if="item1.planType == 1" type="success" plain plainFill
								size="mini"></u-tag>
							<u-tag text="无需评价" v-else type="error" plain plainFill size="mini" color="#FA6400"></u-tag>
						</view>
					</view>
					<view class="flex items-center">
						<view class="kucun">
							<text class="text-xs">还剩{{ item1.restStock }}份</text>
							<u-line-progress :percentage="(item1.restStock / item1.totalStock) * 100"
								activeColor="#FFBA00" height="5" :showText="false"></u-line-progress>
						</view>

						<u-icon name="arrow-right" color="#cccccc" size="10"></u-icon>
						<view class="ml-2">
							<u-tag v-if="item1.restStock > 0" @click="goDetail(item1)" :text="`去报名`" bgColor="#FA6400"
								borderColor="#FE5A49"></u-tag>
							<u-tag v-if="item1.restStock == 0" :text="`已抢光`" bgColor="#6e6f6e"
								borderColor="#ffffff"></u-tag>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
	<up-loading-icon class="mt-4 mb-4" :show="loading" mode="circle" inactive-color="#FE5A49"
		timing-function="linear"></up-loading-icon>
	<mescroll-empty :option="{ icon: img('static/resource/images/empty.png') }"
		v-if="!list.length && loading == false"></mescroll-empty>
	<button @click="shareEvent()" class="fixed bottom-48 right-4 z-50 rounded-full p-2 text-white hover:bg-blue-700">
		<u-icon name="share" color="#000000" size="24"></u-icon>
	</button>

	<tabbar addon="tk_cps" />
	<share-poster ref="sharePosterRef" posterType="tk_cps_bwc" :posterId="poster_id" :posterParam="posterParam"
		:copyUrlParam="copyUrlParam" />
	<!-- #ifdef MP-WEIXIN -->
	<!-- 小程序隐私协议 -->
	<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
	<!-- #endif -->
</template>

<script setup lang="ts">
	import { ref, computed, watch } from "vue";
	import MescrollUni from "@/components/mescroll/mescroll-uni/mescroll-uni.vue";
	import MescrollBody from "@/components/mescroll/mescroll-body/mescroll-body.vue";
	import useMescroll from "@/components/mescroll/hooks/useMescroll.js";
	import MescrollEmpty from "@/components/mescroll/mescroll-empty/mescroll-empty.vue";
	import { onLoad, onShow, onPageScroll, onReachBottom } from "@dcloudio/uni-app";
	import useDiyStore from "@/app/stores/diy";
	import {
		img,
		handleOnloadParams
	} from "@/utils/common";
	const { mescrollInit, downCallback, getMescroll } = useMescroll();
	import { useShare } from "@/hooks/useShare";
	import { getNewActList, getActInfo, checkFenxiao } from "@/addon/tk_cps/api/bwc";
	import { timeChange, authLogin, getLocationData } from "@/addon/tk_cps/utils/ts/common";
	const { setShare, onShareAppMessage, onShareTimeline } = useShare();
	import { useLogin } from "@/hooks/useLogin";
	import useMemberStore from "@/stores/member";
	import useSystemStore from "@/addon/tk_cps/stores/system";
	const memberStore = useMemberStore();
	const userInfo = computed(() => memberStore.info);
	const systemStore = useSystemStore();
	import { getAddressByLatlng } from "@/app/api/system";
	import { useLocation } from '@/addon/tk_cps/hooks/useLocation'
	authLogin()
	const locationVal = useLocation(true);
	locationVal.onLoad();
	locationVal.onLoad();
	locationVal.init();
	const currentPosition = ref('定位中');
	/************* 分享海报-start **************/
	let sharePosterRef = ref(null);
	let copyUrlParam = ref("");
	let posterParam = {};
	const poster_id = ref(0);
	// 分享海报链接
	const copyUrlFn = () => {
		if (userInfo.value && userInfo.value.member_id)
			copyUrlParam.value += "?mid=" + userInfo.value.member_id;
	};
	const shareEvent = () => {
		// 检测是否登录
		if (!userInfo.value) {
			useLogin().setLoginBack({
				url: "/addon/tk_cps/pages/bwc/act?mid=" + pid,
			});
			return false;
		}
		if (userInfo.value && userInfo.value.member_id)
			posterParam.member_id = userInfo.value.member_id;
		sharePosterRef.value.openShare();
	};
	/************* 分享海报-end **************/

	let list = ref<Array<Object>>([]);
	let loading = ref<boolean>(false);
	const planSource = ref(4);
	const actType = ref([
		{ name: "所有活动", value: 4 },
		{ name: "美团", value: 2 },
		{ name: "饿了么", value: 3 },
	]);

	const upCallback = (mescroll) => {
		getActListFn(mescroll)
			.then((res) => { })
			.catch(() => {
				mescroll.endErr();
			});
	};
	const locationData = ref(uni.getStorageSync("localtkcps"));
	setShare();
	onShareAppMessage();
	onShareTimeline();
	const goDetail = (item1) => {
		uni.navigateTo({
			url: `/addon/tk_cps/pages/bwc/detail?planId=${item1.planId}`,
		});
	};
	const page = ref('');
	const listData = ref([]);
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
					page.value = '没有更多'
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
	onShow(() => {
		copyUrlFn();
	});
	onLoad((option) => {
		if (uni.getStorageSync('addressByLatlng')) {
			currentPosition.value = uni.getStorageSync('addressByLatlng').formatted_addresses.recommend;
		}
		// #ifdef MP-WEIXIN
		// 处理小程序场景值参数
		option = handleOnloadParams(option);
		// #endif
		if (option.mid) {
			uni.setStorageSync("pid", option.mid);
			//分销预埋钩子绑定
			checkFenxiao({ pid: option.mid });
		} else {
			let pid = uni.getStorageSync("pid");
			if (pid && pid > 0) {
				checkFenxiao({ pid: pid });
			}
		}
		getActListFn();
	});
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
		position: relative;
		font-weight: bold;
		font-size: 28rpx;

		&::after {
			content: "";
			position: absolute;
			bottom: 0;
			height: 8rpx;
			background-color: #fe6d3a;
			border-radius: 4rpx;
			width: 90%;
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>