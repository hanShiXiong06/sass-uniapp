<template>
    <view :style="themeColor()" class="bg-[#f8f8f8] min-h-[100vh] overflow-hidden">
        <block v-if="!loading && verifyInfo && verifyInfo.value">
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
				<view class="text-[28rpx]">
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between">
						<text>核销类型</text>
						<view>{{verifyInfo.type_name}}</view>
					</view>
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between" v-for="(item,index) in verifyInfo.value.content.fixed">
						<text>{{item.title}}</text>
						<view>{{item.value}}</view>
					</view>
				</view>
			</view>
			
			<view v-for="(item,index) in verifyInfo.value.content.diy" :key="index" class="bg-[#fff] rounded-[16rpx] mt-[20rpx] mx-[20rpx] px-[20rpx] py-[30rpx]">
				<view class="border-0 border-b-[2rpx] leading-[1] pb-[20rpx] border-[#ccc] border-solid">{{item.title}}</view>
				<view class="text-[28rpx]">
					<view class="flex items-center leading-[1] mt-[30rpx] justify-between" v-for="(subItem,subIndex) in item.list" :key="subIndex">
						<text>{{subItem.title}}</text>
						<view>{{subItem.value}}</view>
					</view>
				</view>
			</view>
			
			<text class="bg-[var(--primary-color)] text-[#fff] mx-[20rpx] mt-[60rpx] h-[80rpx] flex items-center justify-center !text-[28rpx] rounded-[10rpx]" @click="verifyFn">核销</text>
        </block>
        <u-loading-page :loading="loading" loading-text="" loadingColor="var(--primary-color)" iconSize="35"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { onLoad } from '@dcloudio/uni-app'
	import { img,redirect, isWeixinBrowser, getToken } from '@/utils/common';
    import { getVerifierInfo, getCheckVerifier, verify } from '@/app/api/verify'
    import { t } from '@/locale'
	import {onShow} from '@dcloudio/uni-app'

    const loading = ref(true)
    const verifyDetail = ref<AnyObject | null>(null)
	let code = ref('');
    onLoad((option)=> {
		if (option.code) code.value = option.code;
		// 小程序扫码进入
		if (option.scene) {
			let sceneParams = decodeURIComponent(option.scene);
			sceneParams = sceneParams.split('&');
			if (sceneParams.length) {
				sceneParams.forEach(item => {
					if (item.indexOf('code') != -1) code.value = item.split('-')[1];
				});
			}
		}
    })
	
	onShow(() => {
		if(getToken()){
			checkIsVerifier();
			getVerifierInfoFn();
		}
	})
	
	// 检测是否是核销员
	const checkIsVerifier = () => {
		getCheckVerifier().then((res:any) =>{
			if(!res.data){
				uni.showToast({
					title: '非核销员无此权限',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			}else{
				loading.value = false;
			}
		})
	}
	
	let verifyInfo = ref({})
	const getVerifierInfoFn = ()=>{
		loading.value = true;
		getVerifierInfo(code.value).then((res:any) =>{
			verifyInfo.value = res.data;
			loading.value = false;
			console.log("verifyInfo.value",verifyInfo.value)
		})
	}
	let isLoading = false;
	const verifyFn = ()=>{
		if(isLoading) return false;
		isLoading = true;
		
		verify(code.value).then((res:any) =>{
			isLoading = false;
			setTimeout(() => {
				redirect({ url: '/app/pages/verify/index', param: {}, mode: 'redirectTo' })
			}, 1000);
		})
	}
</script>
