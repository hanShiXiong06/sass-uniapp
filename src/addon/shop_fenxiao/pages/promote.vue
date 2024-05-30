<template>
	<view class="min-h-[100vh]" :style="themeColor()">
		<view class="min-h-[100vh] p-[30rpx] box-border" :style="{ 'background': 'url(' + img('addon/shop_fenxiao/index/promote_bg.png') + ') left top / 100% 100% no-repeat' }" v-if="!loading" >
			<view class="mt-[230rpx] bg-[#fff] rounded-[30rpx]">
				<view class="bg-[#fff7f5] flex flex-col justify-center rounded-[30rpx]">
					<image class="w-[384rpx] h-[74rpx] m-auto -mt-[20rpx]" :src="img('addon/shop_fenxiao/index/my_earnings.png')" mode=""></image>
					<view class="flex items-center justify-center text-[24rpx] py-[20rpx]">
						<image class="w-[80rpx] h-[80rpx] mr-[10rpx]" :src="img('addon/shop_fenxiao/index/money.png')" mode=""></image>
						<view class="flex items-baseline">
							<text>累计收益</text>
							<text class="text-[40rpx]" v-if="fenxiaoInfo.member" >{{moneyFormat(fenxiaoInfo.member.commission_get || 0)}}</text>
							<text>元</text>
						</view>
					</view>
				</view>
				<view class="flex justify-around pt-[50rpx] pb-[60rpx]">
					<view class="flex items-center flex-col" @click="redirect({url:'/addon/shop_fenxiao/pages/team'})">
						<text class="text-[28rpx] text-[#666]">我的团队人数</text>
						<text class="text-[#303133] text-[36rpx] font-bold mt-[20rpx]">{{fenxiaoTeamNum}}</text>
					</view>
					<view class="flex items-center flex-col" @click="redirect({url:'/addon/shop_fenxiao/pages/child_fenxiao'})">
						<text class="text-[28rpx] text-[#666]">分销商人数</text>
						<text class="text-[#303133] text-[36rpx] font-bold mt-[20rpx]">{{childFenxiaoNum}}</text>
					</view>
				</view>
			</view>
			<view class="mt-[100rpx] bg-[#fff] rounded-[30rpx] flex flex-col px-[30rpx] pb-[50rpx]">
				<image class="w-[384rpx] h-[74rpx] m-auto -mt-[20rpx] mb-[30rpx]" :src="img('addon/shop_fenxiao/index/activity_rules.png')" mode=""/>
				<view class="content" v-if="promoteContent">
					<rich-text :nodes="promoteContent"></rich-text>
				</view>
				<view class="rules-empty" v-else>暂无活动规则</view>
			</view>
			<view class="fixed left-[30rpx] bottom-[0] h-[160rpx] right-[30rpx] flex items-center z-10">
				<button class="w-[100%] h-[80rpx] leading-[80rpx] level-wrap text-[#985400] rounded-[90rpx] text-[32rpx]" @click="toLink">邀请好友</button>
			</view>
		</view>
		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
	</view>
</template>

<script setup lang="ts">
	import { redirect, img, moneyFormat } from '@/utils/common';
	import { ref } from 'vue'
	import { getChildFenxiao, getFenxiaoTeam, getFenxiaoInfo } from '@/addon/shop_fenxiao/api/fenxiao';
	import { getAgreementInfo } from '@/app/api/system'
	
	let loading = ref(true);
	let promoteContent = ref({})
	
	// 分销商数
	let childFenxiaoNum = ref(0);
	const getChildFenxiaoFn = () => {
		getChildFenxiao().then((res:any) => {
			childFenxiaoNum.value = res.data.length || 0;
		}).catch(() => {
			childFenxiaoNum.value = 0;
		})
	}
	getChildFenxiaoFn();
	
	// 我的团队数
	let fenxiaoTeamNum = ref(0);
	const getFenxiaoTeamFn = () => {
		getFenxiaoTeam().then((res:any) => {
			fenxiaoTeamNum.value = (res.data.direct.length+res.data.indirect.length) || 0;
		}).catch(() => {
			fenxiaoTeamNum.value = 0;
		})
	}
	getFenxiaoTeamFn();
	
	// 分销商信息
	let fenxiaoInfo = ref({});
	const getFenxiaoInfoFn = () => {
		loading.value = true;
		getFenxiaoInfo().then((res:any) => {
			fenxiaoInfo.value = res.data;
			loading.value = false;
		})
	}
	getFenxiaoInfoFn();
	
	// 规则内容
	const getAgreementInfoFn = () => {
		getAgreementInfo('fenxiao_poster').then((res: AnyObject) => {
			promoteContent.value = res.data.content
		})
	}
	getAgreementInfoFn();
	
	const toLink = ()=>{
		redirect({ url: '/addon/shop_fenxiao/pages/promote_code', param: {id: fenxiaoInfo.value.member_id} })
	}
	
</script>

<style lang="scss" scoped>
.wechat {
    background: #fff;
    // background: linear-gradient(to bottom, #FCEFDE , #FFAD41 90%);
}
.wechat.button-hover{
	color: #EF2233 !important;
}

.level-wrap {
	background: linear-gradient(90deg, #FDE4C0, #FDC274);
}
</style>