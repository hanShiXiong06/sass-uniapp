<template>
	<view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()">
		<view class="flex items-center bg-[#fff] fixed top-[0] left-[0] right-[0] px-[30rpx] z-10">
			<text :class="['flex-1 flex items-center justify-center h-[90rpx]', {'class-select': tabIndex == 'direct'}]" @click="tabChange('direct')">直推</text>
			<text :class="['flex-1 flex items-center justify-center h-[90rpx]', {'class-select': tabIndex == 'indirect'}]" @click="tabChange('indirect')">间推</text>
		</view>
		<view class="pt-[100rpx]"></view>
		<scroll-view scroll-y="true" v-if="!loading">
			<view class="flex items-center bg-[#fff] mx-[30rpx] my-[20rpx] rounded-[10rpx] p-[30rpx]" v-for="(item,index) in list[tabIndex]" :key="index">
				<image class="w-[90rpx] h-[90rpx] mr-[20rpx]" v-if="item.headimg" :src="img(item.headimg)" mode="widthFix"></image>
				<image class="w-[90rpx] h-[90rpx] mr-[20rpx]" v-else :src="img('addon/shop_fenxiao/index/head.png')" mode="widthFix"></image>
				<view class="flex flex-col">
					<view class="flex items-center">
						<view class="text-[28rpx] mr-[10rpx] flex items-center">
							<text>{{item.nickname || item.username}}</text>
							<text class="text-[24rpx] border-[2rpx] px-[12rpx] py-[6rpx] border-solid border-[var(--primary-color)] text-[var(--primary-color)] rounded-[4rpx] ml-[10rpx]">{{item.is_fenxiao ? '分销商' : '会员' }}</text>
						</view>
						<text class="text-[24rpx] border-[2rpx] px-[12rpx] py-[6rpx] border-solid border-[var(--primary-color)] text-[var(--primary-color)] rounded-[4rpx]" v-if="item.is_fenxiao">{{item.fenxiao.fenxiao_level.level_name}}</text>
					</view>
					<text class="text-[#999] text-[24rpx] mt-[16rpx]" v-if="tabIndex == 'indirect' && !item.is_fenxiao && item.fenxiao && item.fenxiao.member">上级分销商: {{ item.fenxiao.member.nickname }}</text>
					<text class="text-[#999] text-[24rpx] mt-[16rpx]">加入时间: {{item.create_time}}</text>
				</view>
			</view>
			<u-empty mode="data" :icon="img('static/resource/images/empty.png')" v-if="!list[tabIndex] || !list[tabIndex].length" />
		</scroll-view>
		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
	</view>
</template>

<script setup lang="ts">
	import { redirect, img } from '@/utils/common';
	import { ref } from 'vue'
	import { getFenxiaoTeam } from '@/addon/shop_fenxiao/api/fenxiao';
	
	let tabIndex = ref('direct')
	const tabChange = (data)=>{
		tabIndex.value = data;
	}
	
	let list = ref({});
	let loading = ref(true);
	const getData = () => {
		loading.value = true;
		getFenxiaoTeam().then((res) => {
			list.value = res.data;
			loading.value = false;
		}).catch(() => {
			loading.value = true;
			redirect({ url: '/app/pages/member/index', mode: 'switchTab' })
		})
	}
	getData();
</script>

<style lang="scss" scoped>
	.class-select{
		position: relative;
		color: var(--primary-color);
		&::after{
			position: absolute;
			content: "";
			left: 0;
			right: 0;
			bottom: 0;
			height: 4rpx;
			background-color: var(--primary-color);
		}
	}
</style>