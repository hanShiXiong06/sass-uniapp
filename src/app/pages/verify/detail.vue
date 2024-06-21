<template>
    <view :style="themeColor()" class="bg-[#f8f8f8] min-h-[100vh] overflow-hidden">
        <block v-if="!loading">
			<view class="bg-[#fff] rounded-[16rpx] mt-[30rpx] mx-[30rpx]">
				<view class="py-[10rpx] flex flex-col" v-for="(item,index) in verifyInfo.value.list" :key="index">
					<view class="mb-[20rpx]">
						<text class="px-[10rpx] text-sm flex items-center mt-[10rpx] ml-[16rpx]">订单明细</text>
					</view>
					<span class="xian border-[#e7e7e7] border-solid border-0 border-b-[4rpx] w-[690rpx]"></span>
					<view class="flex mt-[40rpx] px-[20rpx]">
						<image class="w-[120rpx] h-[120rpx]" mode="aspectFit" v-if="item.cover" :src="img(item.cover)"></image>
						<image class="w-[120rpx] h-[120rpx]" mode="aspectFit" v-else :src="img('addon/tourism/tourism/member/hotel.png')"></image>
						<view class="flex flex-col flex-1 ml-[10rpx]">
							<view class="multi-hidden leading-[1.2]">{{item.name}}</view>
							<view class="multi-hidden leading-[1.2] mt-[50rpx] text-xs flex">
								<view class="ml-auto text-[#909399] mr-[30rpx] font-normal" >×1</view>
							</view>
						</view>
					</view>
				</view>
				<view class="border-0 border-b-[4rpx] leading-[1]  border-[#e7e7e7] border-solid mx-[20rpx] mt-[20rpx] "></view>
				<view v-for="(item,index) in verifyInfo.value.content.diy" :key="index" class="ml-[40rpx] mr-[30rpx] text-[#838383] text-sm ">
					<view class="flex items-center leading-[1] mt-[40rpx] justify-between" v-for="(subItem,subIndex) in item.list" :key="subIndex">
						<text>{{subItem.title}}</text>
						<view class="ml-[60rpx]">{{subItem.value}}</view>
					</view>
					<view class="flex items-center leading-[1] mt-[40rpx] justify-between pb-[30rpx]">
						<text>创建时间</text>
						<view class="ml-[60rpx]">2024-05-28 10:11:03</view>
					</view>
				</view>
			</view>
			<view class="bg-[#fff] rounded-[16rpx] mt-[20rpx] mx-[30rpx]">
				<view class="py-[10rpx] flex flex-col" v-for="(item,index) in verifyInfo.value.list" :key="index">
					<view class="mb-[20rpx]">
						<text class="px-[10rpx] text-sm flex items-center mt-[10rpx] ml-[17rpx]">核销信息</text>
					</view>
					<span class="xian border-[#e7e7e7] border-solid border-0 border-b-[4rpx] w-[690rpx]"></span>
					<view class="ml-[10rpx] mr-[30rpx] text-[#838383] text-sm pb-[30rpx]">
						<view class="flex items-center leading-[1] mt-[50rpx] justify-between">
							<text class="ml-[30rpx]">核销类型</text>
							<view>{{verifyInfo.type_name}}</view>
						</view>
						<view class="flex items-center leading-[1] mt-[50rpx] justify-between">
							<text class="ml-[30rpx]">核销状态</text>
							<view>已核销</view>
						</view>
						<view class="flex items-center leading-[1] mt-[50rpx] justify-between">
							<text class="ml-[30rpx]">核销人员</text>
							<view>{{verifyInfo.member ? verifyInfo.member.nickname : '--'}}</view>
						</view>
						<view class="flex items-center leading-[1] mt-[50rpx] justify-between">
							<text class="ml-[30rpx]">核销时间</text>
							<view>{{verifyInfo.create_time}}</view>
						</view>
						<view class="flex items-center leading-[1] mt-[50rpx]" v-for="(item,index) in verifyInfo.value.content.fixed">
							<text>{{item.title}}</text>
							<view>{{item.value}}</view>
						</view>
					</view>
				</view>
			</view>
        </block>
        <u-loading-page :loading="loading" loading-text="" loadingColor="var(--primary-color)" iconSize="35"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { onLoad,onShow } from '@dcloudio/uni-app'
	import { img,redirect, getToken } from '@/utils/common';
    import { getVerifyDetail } from '@/app/api/verify'
    import { t } from '@/locale'

    const loading = ref(true)
	let code = ref('');
    onLoad((option)=> {
		if (option.code) code.value = option.code;
    })
	
	onShow(() => {
		if(getToken()){
			getVerifyDetailFn();
		}
	})
	
	let verifyInfo = ref({})
	const getVerifyDetailFn = ()=>{
		loading.value = true;
		getVerifyDetail(code.value).then((res:any) =>{
			verifyInfo.value = res.data;
			loading.value = false;
		})
	}
</script>
