<template>
	<view class="detail-box">
		<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getActListFn">
			<view class="mb-2 z-1000" v-if="orderStatusData">
				<scroll-view scroll-x="true" class="scroll-Y box-border px-[24rpx] bg-white">
					<view class="flex whitespace-nowrap justify-around">
						<view :class="['text-sm leading-[90rpx]',{'class-select': orderState === index}]"
							@click="orderStateFn(index)" v-for="(item,index) in orderStatusData">{{item}}</view>
					</view>
				</scroll-view>
			</view>
			<view class="tk-card text-[#ff0004]">
				<view class="text-xs">1、评价类订单请在次日11点前完成评价</view>
				<view class="text-xs mt-1">2、订单完成后才会显示预计佣金/积分</view>
			</view>
			<view class="tk-card" v-for="(item,index) in list">
				<view class="flex justify-between mb-2">
					<view class="text-xs">订单号:{{item.orderSn}}</view>
					<block v-for="(item1,index1) in orderStatusData" :key="index1">
						<view class="text-xs" v-if="index1==item.state">{{item1}}</view>
					</block>

				</view>
				<view class="flex">
					<image style="width: 180rpx; height: 140rpx; background-color: #eeeeee;border-radius: 8px;"
						:src="item.logo" mode="aspectFill"></image>
					<view class="flex flex-col ml-2 w-[100%] justify-between" style="">
						<view class="font-bold tk-sltext text-xs">{{item.name}}</view>
						<view class="flex justify-between">
							<view class="flex items-center">
								<image
									style="width: 32rpx; height: 32rpx; background-color: #eeeeee;border-radius: 8px;"
									:src="item.platformLogo" mode="aspectFill"></image>
								<view class="text-xs mt-[4rpx] ml-2">{{item.platformName}}</view>
							</view>

						</view>
						<view class="flex justify-between">
							<view class="text-xs">{{item.create_time}}</view>
							<view v-if="item.fanxian>0" class="text-xs text-[#ff0202]">
								预计:{{item.fanxian>0?item.fanxian:''}}
							</view>
						</view>

					</view>

				</view>

				<view class="line-box w-[100%] mt-3"></view>

				<view v-if="item.state!=1" class="flex justify-end">
					<!-- <u-button color="#828282" shape="circle" size="small" :plain="true"
						:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#000000',width:'140rpx',marginTop:'12rpx',marginRight:'12rpx'}"
						@click="openShop(item)">查看店铺</u-button> -->
					<u-button v-if="item.state!=1||item.state!=2" color="#828282" shape="circle" size="small"
						:plain="true"
						:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#000000',width:'140rpx',marginTop:'12rpx',marginRight:'12rpx'}"
						@click="redirect({url:'/addon/tk_cps/pages/bwc/orderdetail?id='+item.id})">查看订单</u-button>
					<u-button v-if="item.state==3" color="#828282" shape="circle" size="small" :plain="true"
						:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#000000',width:'140rpx',marginTop:'12rpx',marginRight:'12rpx'}"
						@click="cancelOrder(item)">取消报名</u-button>
					<u-button v-if="item.state==3" color="#FE6D3A" shape="circle" size="small"
						:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#ffffff',width:'140rpx',marginTop:'12rpx',marginRight:'12rpx'}"
						@click="goOrder(item)">前往下单</u-button>

				</view>
			</view>

			<mescroll-empty :option="{'icon': img('static/resource/images/empty.png')}"
				v-if="!list.length && loading"></mescroll-empty>
		</mescroll-body>
	</view>
	<tabbar addon="tk_cps" />
	<!-- #ifdef MP-WEIXIN -->
	<!-- 小程序隐私协议 -->
	<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
	<!-- #endif -->
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import MescrollUni from '@/components/mescroll/mescroll-uni/mescroll-uni.vue';
	import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
	import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
	import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
	import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useDiyStore from '@/app/stores/diy'
	const { mescrollInit, downCallback, getMescroll } = useMescroll()
	import { img, redirect } from '@/utils/common'
	import { useShare } from '@/hooks/useShare'
	import { orderList, orderStatus, cancelEvent } from '@/addon/tk_cps/api/bwc'
	import { timeChange, timeChangeDay } from '@/addon/tk_cps/utils/ts/common'
	const { setShare, onShareAppMessage, onShareTimeline } = useShare()
	let list = ref<Array<Object>>([]);
	let loading = ref<boolean>(false);
	const upCallback = (mescroll) => {
		getActListFn(mescroll).then(res => {
		}).catch(() => {
			mescroll.endErr()
		})
	}
	const locationData = ref(uni.getStorageSync('localtion'))
	const cancelOrder = async (e) => {
		const data = await cancelEvent({
			orderSn: e.orderSn,
			telephone: e.orderTelephone
		})
		getMescroll().resetUpScroll();
	}

	const goOrder = (e) => {
		let actionUrl = JSON.parse(e.actionUrl)
		if (e.platform == 1) {

			// #ifdef H5
			window.location.href = actionUrl.h5.mt

			// #endif
			// #ifdef MP-WEIXIN
			uni.openEmbeddedMiniProgram({
				appId: actionUrl.wxMini.mt.appid,
				path: actionUrl.wxMini.mt.path,
				extraData: {},
				success(res) {
					console.log('半屏小程序打开');
				},
				fail(err) {
					console.error('打开半屏小程序失败', err);
				}
			});
			// #endif
		}
		if (e.platform == 2) {

			// #ifdef H5
			window.location.href = actionUrl.h5.elm
			// #endif
			// #ifdef MP-WEIXIN
			uni.openEmbeddedMiniProgram({
				appId: actionUrl.wxMini.elm.appid,
				path: actionUrl.wxMini.elm.path,
				extraData: {},
				success(res) {
					console.log('半屏小程序打开');
				},
				fail(err) {
					console.error('打开半屏小程序失败', err);
				}
			});
			// #endif
		}
	}
	setShare();
	onShareAppMessage()
	onShareTimeline()
	const orderState = ref('0')
	const orderStateFn = (e) => {
		orderState.value = e
		getMescroll().resetUpScroll();
	}
	const goDetail = (item) => {
		if (item.planList.length > 1) {
			uni.$u.toast('至少选择一个活动')
		}
		if (item.planList.length == 1) {
			uni.navigateTo({ url: `/addon/tk_cps/pages/bwc/detail?planId=${item.planList[0].planId}` })
		}

	}

	const listData = ref([])
	const orderStatusData = ref({
		0: '全部',
		3: '已报名',
		4: '已下单',
		1: '已取消',
		2: '已过期',
		8: '已返现'
	})
	// const getOrderStatus = async () => {
	// 	const data = await orderStatus()
	// 	orderStatusData.value = data.data
	// 	console.log(orderStatusData.value)
	// }
	const getActListFn = (mescroll) => {
		getLocaltion()
		loading.value = false;
		let data : object = {
			page: mescroll.num,
			limit: mescroll.size,
			state: orderState.value
		};

		orderList(data).then((res) => {
			let newArr = (res.data.data as Array<Object>);
			//设置列表数据
			if (mescroll.num == 1) {
				list.value = []; //如果是第一页需手动制空列表
			}

			if (newArr == []) {
				uni.$u.toast('已经全部加载了')
				mescroll.endSuccess(newArr.length);
				loading.value = true;
			}
			list.value = list.value.concat(newArr);
			mescroll.endSuccess(newArr.length);
			loading.value = true;
		}).catch(() => {
			loading.value = true;
			mescroll.endErr(); // 请求失败, 结束加载
		})
	}
	const getLocaltion = () => {
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
	onLoad(() => {
		getLocaltion()
	})
</script>


<style lang="scss" scoped>
	@import '@/addon/tk_cps/utils/styles/common.scss';

	.line-box {
		background-color: #EEEEEE;
		height: 2rpx;
		width: 100%;
	}

	.class-select {
		position: relative;
		font-weight: bold;

		&::after {
			content: "";
			position: absolute;
			bottom: 0;
			height: 6rpx;
			background-color: #FE6D3A;
			width: 90%;
			left: 50%;
			transform: translateX(-50%);
		}
	}
</style>