<template>
	<!-- #ifdef H5 -->
	<view v-if="valueData&&valueData.h5==''" class="mt-[200px]">
		<u-empty mode="data" text="该活动不支持此渠道~~~">
		</u-empty>
	</view>
	<!-- #endif -->
	<!-- #ifdef MP-WEIXIN -->
	<view v-if="valueData&&valueData.weapp.appid==''" class="mt-[200px] flex items-center flex-col">
		<view class="">请访问链接获取优惠信息</view>
		<view class="w-[340rpx] mt-[60rpx]">
			<u-button text="复制链接" @click="copy(valueData.wap_url)"
				color="linear-gradient(to right, rgb(66, 83, 216), rgb(104, 104, 213))"></u-button>
		</view>
		<view class="mt-[60rpx]">
			<u-steps current="2" dot activeColor="rgb(66, 83, 216)">
				<u-steps-item title="复制链接" desc="点击复制链接"></u-steps-item>
				<u-steps-item title="粘贴链接" desc="在微信对话框或者浏览器粘贴链接"></u-steps-item>
				<u-steps-item title="打开链接" desc="访问复制的链接"></u-steps-item>
			</u-steps>
		</view>
	</view>
	<!-- #endif -->

</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { getCpsInfo } from '@/cpsmytg/api/cps'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { useShare } from '@/hooks/useShare'
	import { copy } from '@/utils/common'
	const { setShare, onShareAppMessage, onShareTimeline } = useShare()
	setShare()
	onShareAppMessage()
	onShareTimeline()
	const valueData = ref()
	const goto = () => {
		// #ifdef MP-WEIXIN
		uni.openEmbeddedMiniProgram({
			appId: valueData.value.weapp.appid,
			path: valueData.value.weapp.pagepath,
			extraData: {},
			success(res) {
				console.log('半屏小程序打开');
			}
		})
		// #endif
	}
	onShow(() => {
		// #ifdef MP-WEIXIN

		// #endif
	})
	onLoad((options) => {
		getCpsInfo({
			type: options.type,
			act_id: options.act_id
		}).then((res) => {
			valueData.value = res.data
			uni.setNavigationBarTitle({
				title: res.data.act_name
			})
			// #ifdef H5
			if (valueData.value.h5 != '') {
				window.open(valueData.value.h5, '_blank');
			} else {
				uni.$u.toast('当前渠道不支持此活动');
			}
			// #endif
			// #ifdef MP-WEIXIN
			if (options.type == 11) {

				uni.navigateTo({
					url: valueData.value.path
				})
				uni.navigateBack()
			} else {
				goto()
			}
			// #endif
		})
	})
</script>
<style lang="scss" scoped>

</style>