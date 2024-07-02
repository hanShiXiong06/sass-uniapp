<template>
	<view v-if="orderInfo" class="bg-[#f8f8f8] min-h-screen overflow-hidden">
		<view class="tk-card">
			<view class="flex">
				<image style="width: 180rpx; height: 140rpx; background-color: #eeeeee;border-radius: 8px;"
					:src="orderInfo.logo" mode="aspectFill"></image>
				<view class="flex flex-col ml-2 w-[100%]" style="">
					<view class="font-bold tk-sltext">{{orderInfo.name}}</view>
					<view class="flex justify-between">
						<view class="flex items-center">
							<image style="width: 32rpx; height: 32rpx; background-color: #eeeeee;border-radius: 8px;"
								:src="orderInfo.platformLogo" mode="aspectFill"></image>
							<view class="text-xs mt-[4rpx] ml-2">{{orderInfo.platformName}}</view>
						</view>

					</view>
					<view class="flex mt-2 items-center flex-wrap">
						<view class="mt-1">
							<u-tag :text="`按实付`+orderInfo.commissionRatio+`%返`" bgColor="#FE6D3A" borderColor="#FE6D3A"
								size="mini"></u-tag>
						</view>
						<view class="ml-2 mr-2 mt-1">
							<u-tag :text="`最高可返`+orderInfo.maxAmount" type="error" plain plainFill size="mini"></u-tag>
						</view>
						<view class="mt-1">
							<u-tag text="需要用餐评价" v-if="orderInfo.planType == 1" type="success" plain plainFill
								size="mini"></u-tag>
							<u-tag text="无需评价" v-else type="error" plain plainFill size="mini"></u-tag>
						</view>
					</view>

				</view>

			</view>
		</view>
		<view class="card">
			<view class="p-2 text-xs tracking-widest text-[#a56d30]">领券下单更优惠---完成下单返现到账</view>

			<view class="card1 p-2">
				<view class="mt-4">
					<view class="flex">
						<view class="font-bold mr-2">1.领券下单，锁定名额</view>
						<!-- <u-count-down :time="orderInfo.cut_time" format="HH:mm:ss"></u-count-down> -->
					</view>

					<view class="text-xs mt-2 mb-4 text-[#a56d30]">*请在{{orderInfo.over_time}}前下单，超时将失去奖励资格</view>
					<u-button color="#FE6D3A" shape="circle" size="small"
						:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#ffffff',width:'480rpx',marginTop:'12rpx',marginRight:'12rpx'}"
						@click="hongbao(orderInfo)">第一步：领取最高66元红包</u-button>
				</view>
				<view class="mt-4">
					<view class="font-bold">2.进店下单</view>
					<view class="text-xs mt-2 mb-4 text-[#a56d30]">*必须在此处下单，否则会出现奖励获取失败</view>
					<u-button color="#FE6D3A" shape="circle" size="small"
						:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#ffffff',width:'480rpx',marginTop:'12rpx',marginRight:'12rpx'}"
						@click="goOrder(orderInfo)">第二步：快捷进店下单</u-button>
				</view>
				<view class="mt-4 mb-4">
					<view class="font-bold">3.完成下单，返现到账</view>
					<view v-if="orderInfo.planType==1" class="text-[#FE6D3A]">
						本单{{orderInfo.planTypeCh}}，{{orderInfo.planTypeDescCh}}
					</view>
					<view v-else class="">本单本单{{orderInfo.planTypeCh}}，{{orderInfo.planTypeDescCh}}</view>

				</view>
			</view>
		</view>

	</view>
	<tabbar addon="tk_cps" />
	<!-- #ifdef MP-WEIXIN -->
	<!-- 小程序隐私协议 -->
	<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
	<!-- #endif -->
</template>

<script setup lang="ts">
	import { ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app';
	import useDiyStore from '@/app/stores/diy'
	import { img, redirect } from '@/utils/common'
	import { getOrderInfo } from '@/addon/tk_cps/api/bwc'
	import { timeChange, timeChangeDay } from '@/addon/tk_cps/utils/ts/common'
	import { useShare } from '@/hooks/useShare'
	const { setShare, onShareAppMessage, onShareTimeline } = useShare()

	setShare();
	onShareAppMessage()
	onShareTimeline()
	const orderInfo = ref()
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
	const hongbao = (e) => {

		if (e.platform == 1) {
			redirect({ url: '/addon/tk_cps/pages/index?type=1&act_id=150&style=embedded' })
		}
		if (e.platform == 2) {
			redirect({ url: '/addon/tk_cps/pages/index?type=1&act_id=89&style=embedded' })
		}
	}
	const getOrderInfoEvent = async (id) => {
		const res = await getOrderInfo(id)
		orderInfo.value = res.data
	}
	onLoad((options) => {
		if (options.id) {
			getOrderInfoEvent(options.id)
		} else {
			uni.navigateBack()
		}
	})
</script>


<style lang="scss" scoped>
	@import '@/addon/tk_cps/utils/styles/common.scss';

	.line-box {
		background-color: #EEEEEE;
		height: 2rpx;
		width: 100%;
	}

	.card {
		background: linear-gradient(-180deg, #faead1 0%, #faead1 100%);
		margin: 24rpx;
		border-radius: 12rpx;

		bbbox-shadow: 0 1px 1px 0 rgba(234, 234, 234, 0.2), 0 2px 2px 0 rgba(231, 231, 231, 0.2);
	}

	.card1 {
		background: linear-gradient(-180deg, #fafafa 0%, #ffffff 100%);

		border-radius: 12rpx;

		bbbox-shadow: 0 1px 1px 0 rgba(234, 234, 234, 0.2), 0 2px 2px 0 rgba(231, 231, 231, 0.2);
	}
</style>