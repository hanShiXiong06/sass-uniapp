<template>
	<view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()">
		<scroll-view scroll-y="true" v-if="!loading">
			<view class="flex items-center bg-[#fff] mx-[30rpx] my-[20rpx] rounded-[10rpx] p-[30rpx]" v-for="(item,index) in list" :key="index">
				<image v-if="item.member.headimg" class="w-[90rpx] h-[90rpx] mr-[20rpx]" :src="img(item.member.headimg)" mode="widthFix"></image>
				<image v-else class="w-[90rpx] h-[90rpx] mr-[20rpx]" :src="img('addon/shop_fenxiao/index/head.png')" mode="widthFix"></image>
				<view class="flex flex-col">
					<view class="flex items-center">
						<text class="text-[28rpx] mr-[10rpx]" v-if="item.member">{{item.member.nickname || item.member.username}}</text>
						<text class="text-[24rpx] border-[2rpx] px-[12rpx] py-[2rpx] border-solid border-[var(--primary-color)] text-[var(--primary-color)] rounded-[4rpx]" v-if="item.fenxiao_level&&item.fenxiao_level.level_name">{{item.fenxiao_level.level_name}}</text>
					</view>
					<text class="text-[#999] text-[24rpx] mt-[16rpx]">加入时间:{{item.create_time}}</text>
				</view>
				<view class="flex flex-col ml-auto items-end text-[24rpx]">
					<text class="leading-normal">{{item.child_fenxiao_num}} 人</text>
					<text class="leading-normal">{{item.fenxiao_order_num}} 单</text>
					<text class="leading-normal">{{item.fenxiao_commission}} 元</text>
				</view>
			</view>
			<u-empty v-if="!list.length && !loading" mode="data" :icon="img('static/resource/images/empty.png')"/>
		</scroll-view>
		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
	</view>
</template>

<script setup lang="ts">
	import { redirect, img } from '@/utils/common';
	import {ref} from 'vue'
	import { getChildFenxiao } from '@/addon/shop_fenxiao/api/fenxiao';

	let list = ref([]);
	let loading = ref(true);
	const getData = () => {
		loading.value = true;
		getChildFenxiao().then((res:any) => {
			list.value = [];
			list.value = res.data;
			loading.value = false;
		}).catch(() => {
			loading.value = true;
			redirect({ url: '/app/pages/member/index', mode: 'switchTab' })
		})
	}
	getData();
</script>