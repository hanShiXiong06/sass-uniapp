<template>

	<view class="detail-box" v-if="detailData">
		<view class=" tk-card">
			<view class="flex">
				<image style="width: 120rpx; height: 100rpx; background-color: #eeeeee;border-radius: 8px;"
					:src="detailData.logo" mode="aspectFill"></image>
				<view class="flex flex-col ml-2 w-[100%] text-xs justify-between" style="">
					<view class="font-bold tk-sltext">{{detailData.name}}</view>
					<view class="flex justify-between">

						<view class="flex items-center">
							<image style="width: 32rpx; height: 32rpx; background-color: #eeeeee;border-radius: 8px;"
								:src="detailData.platformLogo" mode="aspectFill"></image>
							<view class="text-xs mt-[4rpx] ml-2">{{detailData.platformName}}</view>
						</view>
						<view>{{detailData.distance}}</view>
					</view>

				</view>
			</view>
			<view class="flex mt-3 items-center">
				<view class="">
					<u-tag class="" :text="`按实付`+detailData.plan.ratio+`%返`" bgColor="#FA6400" borderColor="#FE5A49"
						size="mini"></u-tag>
				</view>

				<view class="ml-2 mr-2">
					<u-tag :text="`最高可返`+detailData.plan.commission" type="error" plain plainFill size="mini"></u-tag>

				</view>

				<view class="">
					<u-tag text="需要用餐评价" v-if="detailData.plan.planType == 1" type="success" plain plainFill
						size="mini"></u-tag>
					<u-tag text="无需评价" v-else type="error" plain plainFill size="mini" color="#FA6400"></u-tag>
				</view>
			</view>
			<view class="line-box w-[100%] mt-3 mb-3"></view>
			<view class="flex mt-2 justify-between items-center">
				<view class="flex text-xs">
					<text>{{timeChange(detailData.plan.startTime)=='0:0'?'00:00':timeChange(item1.startTime)}}-</text>
					<text>{{timeChange(detailData.plan.endTime)}}</text>

				</view>
				<view class="flex items-center">
					<view class="">
						<text class="text-xs mb-1">还剩{{detailData.plan.restStock}}份</text>
						<u-line-progress :percentage="detailData.plan.restStock/detailData.plan.totalStock*100"
							activeColor="#FFBA00" height="5" :showText="false"></u-line-progress>
					</view>

				</view>
			</view>
			<view class="flex mt-1">
				<u-tag @click="goShop(detailData)" text="查看店铺" type="error" plain plainFill size="mini"
					color="#FA6400"></u-tag>
			</view>

		</view>
		<view class="tk-card">
			<view class="flex">
				<view class="font-bold">活动要求</view>
				<view class="ml-2"> 先抢名额再下单</view>
			</view>

			<view class="flex mt-3 justify-between text-xs mb-2">
				<view class="font-bold">平台</view>
				<view class="flex">
					<image style="width: 32rpx; height: 32rpx; background-color: #eeeeee;border-radius: 8px;"
						:src="detailData.platformLogo" mode="aspectFill"></image>
					<view class="ml-1">{{detailData.platformName}}</view>
					<view class="ml-4">剩余名额{{detailData.plan.restStock}}份</view>
				</view>

			</view>
			<view class="line-box w-[100%] mb-3"></view>
			<view class="flex justify-between text-xs mb-2">
				<view class="font-bold">报名手机号</view>
				<view class="flex items-center">
					<view class="ml-2 mr-2">{{mobileHide(phone)}}</view>
					<u-tag v-if="phone" @click="editPhone()" class="ml-2" :text="`修改`" type="error" plain plainFill
						size="mini"></u-tag>
					<u-tag v-if="!phone" @click="editPhone()" class="ml-2" :text="`填写手机号`" type="error" plain plainFill
						size="mini"></u-tag>
				</view>
			</view>
			<view class="line-box w-[100%] mb-3"></view>
			<view class="flex text-xs mb-2 justify-between">
				<view class="font-bold">要求</view>
				<view class="flex">
					<view class="ml-2">{{detailData.plan.planTypeCh}}</view>
					<view class="ml-2 text-[#FA6400]">{{detailData.plan.planTypeDescCh}}</view>
				</view>
			</view>
			<view class="line-box mb-3 bg-[#ffc300]" style="background-color: #ffc300;"></view>
			<view class="flex justify-between text-xs">
				<view class="font-bold">限购</view>
				<view class="ml-2">{{detailData.limitBuyCh}}</view>
			</view>
		</view>
		<view class="tk-card">
			<view class="font-bold">报名须知</view>
			<u-parse :content="detailData.rule"></u-parse>
		</view>
		<view class="mt-[380rpx] mb-[260rpx] flex items-center"></view>

		<view class="b-tabbar safe-area-inset-bottom">
			<view class="b-tabbar-back fb items-center p-2">
				<view class="flex flex-col items-center" @click="redirect({url:'/addon/tk_cps/pages/bwc/act'})">
					<u-icon name="clock" color="#000000" size="22"></u-icon>
					<view class="text-xs font-bold">活动</view>
				</view>

				<view class="flex flex-col items-center" @click="redirect({url:'/addon/tk_cps/pages/bwc/order'})">
					<u-icon name="order" color="#000000" size="22"></u-icon>
					<view class="text-xs font-bold">订单</view>
				</view>
				<u-button :loading="loading" loadingText="正在报名" color="#FA6400" shape="circle"
					:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#fff',width:'278rpx'}" type="primary"
					size="12" @click="submitOrder()">立即报名</u-button>
			</view>
			<!-- 		<u-safe-bottom></u-safe-bottom> -->
		</view>
	</view>
	<u-popup :show="showEditPhone" mode="center" :round="10" :border-radius="20" :safe-area-inset-bottom="true">
		<view class="p-4 items-center">
			<view class="">请填写正确手机号</view>
			<view class="ml-2 mb-4 text-[#fc7777] text-xs">*{{detailData.plan.planTypeDescCh}}</view>
			<u-input v-model="phone" placeholder="请输入手机号" type="number"></u-input>
			<view class="flex justify-between mt-2 mb-2">
				<u-button color="#828282" shape="circle" size="small"
					:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#fff',width:'200rpx',marginTop:'12rpx',marginRight:'12rpx'}"
					@click="showEditPhone=false">关闭</u-button>
				<u-button :loading="loading" loadingText="正在报名" color="#FA6400" shape="circle" size="small"
					:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#fff',width:'200rpx',marginTop:'12rpx'}"
					@click="submitOrder()">立即报名</u-button>
			</view>
		</view>
	</u-popup>
	<!-- <u-popup :show="showSubmitOrder" mode="center" :round="10" :border-radius="20" :safe-area-inset-bottom="true">
		<view class="p-4">
			<view class="">提示</view>
			<view class="">订单创建成功，请及时填写订单号</view>
			<view class="flex justify-end mt-2 mb-2">
				<u-button color="#828282" shape="circle" size="small"
					:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#fff',width:'120rpx',marginTop:'12rpx',marginRight:'12rpx'}"
					@click="goOrder()">去下单</u-button>
				<u-button color="#FA6400" shape="circle" size="small"
					:customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#fff',width:'240rpx',marginTop:'12rpx'}"
					@click="showEditPhone=false">领大额优惠券</u-button>
			</view>
		</view>
	</u-popup> -->
	<button @click="shareEvent()" class="fixed bottom-48 right-4 z-50 rounded-full p-2 text-white hover:bg-blue-700">

		<u-icon name="share" color="#000000" size="24"></u-icon>
	</button>
	<share-poster ref="sharePosterRef" posterType="tk_cps_bwc" :posterId="poster_id" :posterParam="posterParam"
		:copyUrlParam="copyUrlParam" />

	<!-- #ifdef MP-WEIXIN -->
	<!-- 小程序隐私协议 -->
	<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
	<!-- #endif -->
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue'
	import { useShare } from '@/hooks/useShare'
	import { getActInfo, signUp, checkFenxiao } from '@/addon/tk_cps/api/bwc'
	import { timeChange } from '@/addon/tk_cps/utils/ts/common'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { useLogin } from '@/hooks/useLogin';
	import { mobileHide, img, redirect, getToken, copy, handleOnloadParams } from '@/utils/common';
	const phone = ref(uni.getStorageSync('orderphone'))
	const { setShare, onShareAppMessage, onShareTimeline } = useShare()
	setShare();
	onShareAppMessage()
	onShareTimeline()
	const loading = ref(false)
	import useMemberStore from '@/stores/member'
	const memberStore = useMemberStore()
	const userInfo = computed(() => memberStore.info)


	/************* 分享海报-start **************/
	let sharePosterRef = ref(null);
	let copyUrlParam = ref('');
	let posterParam = {};
	const poster_id = ref(0)
	// 分享海报链接
	const copyUrlFn = () => {

		if (userInfo.value && userInfo.value.member_id) copyUrlParam.value += '?mid=' + userInfo.value.member_id;
	}
	const shareEvent = () => {

		// 检测是否登录
		if (!userInfo.value) {
			let pid = uni.getStorageSync('pid');
			if (pid && pid > 0) {
				useLogin().setLoginBack({ url: '/addon/tk_cps/pages/bwc/act?mid=' + pid })
				return false
			} else {
				useLogin().setLoginBack({ url: '/addon/tk_cps/pages/bwc/act' })
				return false
			}
		}
		if (userInfo.value && userInfo.value.member_id)
			posterParam.member_id = userInfo.value.member_id;
		sharePosterRef.value.openShare()
	}
	/************* 分享海报-end **************/

	const goShop = (e) => {
		let actionUrl = e.actionUrl
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
	const showEditPhone = ref(false)
	const showSubmitOrder = ref(false)
	const editPhone = () => {
		showEditPhone.value = true
	}
	const goOrder = (e) => {
		redirect({ url: '/addon/tk_cps/pages/bwc/orderdetail?id=' + e })
	}

	const submitOrder = async () => {
		uni.setStorageSync('orderphone', phone.value)
		// 检查电话号码是否为空
		if (!phone.value) {
			showEditPhone.value = true
			uni.$u.toast('请填写电话号码')
			return
		}
		if (!getToken()) {
			useLogin().setLoginBack({ url: '/addon/tk_cps/pages/bwc/detail', param: { planId: detailData.value.plan.planId } })
			return false;
		}

		loading.value = true
		try {
			const data = await signUp({
				planId: detailData.value.plan.planId,
				telephone: phone.value,
				mapLat: locationData.value.latitude || '39.908823',//纬度
				mapLon: locationData.value.longitude || '116.39747',//经度
				data: detailData.value
			})
			showEditPhone.value = false
			loading.value = false
			goOrder(data.data)
		} catch (error) {
			showEditPhone.value = false
			loading.value = false
		}

	}
	const locationData = ref(uni.getStorageSync('localtion'))
	const detailData = ref()
	const getActInfoEvent = async (planId) => {
		getLocaltion()
		const data = await getActInfo({
			planId: planId,
			mapLat: locationData.value.latitude || '39.908823',//纬度
			mapLon: locationData.value.longitude || '116.39747',//经度
			telephone: phone.value || '13545454545'

		})
		detailData.value = data.data.data
		uni.setNavigationBarTitle({
			title: detailData.value.name
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
	onShow(() => {
		copyUrlFn()
	})
	onLoad((option) => {
		// #ifdef MP-WEIXIN
		// 处理小程序场景值参数
		option = handleOnloadParams(option);
		// #endif
		if (option.mid) {
			uni.setStorageSync('pid', option.mid)
			//分销预埋钩子绑定
			checkFenxiao({ pid: option.mid })
		} else {
			let pid = uni.getStorageSync('pid');
			if (pid && pid > 0) {
				checkFenxiao({ pid: pid })
			}
		}
		if (option.planId) {
			getActInfoEvent(option.planId)
		}
	})
</script>

<style lang="scss" scoped>
	@import '@/addon/tk_cps/utils/styles/common.scss';

	.line-box {
		background-color: #EEEEEE;
		height: 3rpx;
		width: 100%;
	}

	.b-tabbar {
		position: fixed;
		bottom: 12rpx;
		left: 0;
		right: 0;
		margin: 0rpx 24rpx;
		border-radius: 12rpx;
		padding: 12rpx;
	}

	.b-tabbar-back {
		background: rgba(245, 250, 245, 0.9);
		ox-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.5);
		border-radius: 12rpx;
	}
</style>