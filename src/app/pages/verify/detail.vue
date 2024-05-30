<template>
    <view :style="themeColor()" class="bg-[#f8f8f8] min-h-[100vh] overflow-hidden">
        <block v-if="!loading">
			<view class="bg-[#fff] rounded-[16rpx] mt-[20rpx] mx-[20rpx] px-[20rpx] py-[30rpx]">
				<view class="py-[10rpx] flex" v-for="(item,index) in verifyInfo.value.list" :key="index">
					<image class="w-[80rpx] h-[80rpx]" mode="aspectFit" v-if="item.cover" :src="img(item.cover)"></image>
					<image class="w-[80rpx] h-[80rpx]" mode="aspectFit" v-else :src="img('addon/tourism/tourism/member/hotel.png')"></image>
					<view class="flex flex-col flex-1 ml-[10rpx]">
						<view class="multi-hidden leading-[1.2]">{{item.name}}</view>
						<view class="ml-auto text-[#999]">x{{item.num}}</view>
					</view>
				</view>
			</view>
			
			<view class="bg-[#fff] rounded-[16rpx] mt-[20rpx] mx-[20rpx] px-[20rpx] py-[30rpx]">
				<view class="border-0 border-b-[2rpx] leading-[1] pb-[20rpx] border-[#ccc] border-solid">核销信息</view>
				<view>
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between">
						<text>核销类型</text>
						<view>{{verifyInfo.type_name}}</view>
					</view>
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between">
						<text>核销状态</text>
						<view>已核销</view>
					</view>
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between">
						<text>核销人员</text>
						<view>{{verifyInfo.member ? verifyInfo.member.nickname : '--'}}</view>
					</view>
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between">
						<text>核销时间</text>
						<view>{{verifyInfo.create_time}}</view>
					</view>
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between" v-for="(item,index) in verifyInfo.value.content.fixed">
						<text>{{item.title}}</text>
						<view>{{item.value}}</view>
					</view>
				</view>
			</view>
			
			<view v-for="(item,index) in verifyInfo.value.content.diy" :key="index" class="bg-[#fff] rounded-[16rpx] mt-[20rpx] mx-[20rpx] px-[20rpx] py-[30rpx]">
				<view class="border-0 border-b-[2rpx] leading-[1] pb-[20rpx] border-[#ccc] border-solid">{{item.title}}</view>
				<view>
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between" v-for="(subItem,subIndex) in item.list" :key="subIndex">
						<text>{{subItem.title}}</text>
						<view>{{subItem.value}}</view>
					</view>
				</view>
			</view>
        </block>
        <u-loading-page :loading="loading" loading-text="" loadingColor="var(--primary-color)" iconSize="35"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { onLoad } from '@dcloudio/uni-app'
	import { img,redirect, getToken } from '@/utils/common';
    import { getVerifyDetail } from '@/app/api/verify'
    import { t } from '@/locale'
	import {onShow} from '@dcloudio/uni-app'

    const loading = ref(true)
    const verifyDetail = ref<AnyObject | null>(null)
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
			console.log("verifyInfo.value",verifyInfo.value)
		})
	}
</script>
