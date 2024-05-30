<template>
    <view :style="themeColor()">
		<view class="container" v-if="!loading">
			<view class="action-wrap">
				<view class="record-wrap text-[var(--primary-color)]" @click="redirect({url:'/app/pages/verify/record'})">
					<text class="iconfont iconjilu color-base-text"></text>
					<text class="text-[28rpx]">核销记录</text>
				</view>
		  
				<view class="sweep-code ns-gradient-otherpages-member-balance-balance-rechange" @click="scanCode" v-show="operationType == 'sweepCode'">
					<text class="iconfont iconsaoma"></text>
				</view>
				<view class="manual-input" v-show="operationType == 'manualInput'">
					<view class="process-wrap">
						<view class="wrap">
							<view class="_icon"><text class="iconfont iconshurutianxiebi color-base-text"></text></view>
							<view class="_text">输入核销码</view>
						</view>
						<view>
							<view><text class="iconfont iconjiang-copy color-tip"></text></view>
						</view>
						<view class="wrap">
							<view class="_icon"><text class="iconfont iconhexiao color-base-text"></text></view>
							<view class="_text">核销</view>
						</view>
					</view>
					<input type="text" placeholder="请输入核销码" class="_input" placeholder-class="_placeholder" v-model="verify_code" :focus="isFocus" ref="input" />
					<view class="_btn" @click="confirm"><button class="h-[80rpx] flex items-center justify-center !text-[28rpx]" type="primary">确认</button></view>
				</view>
			</view>
			<view class="arc-edge"></view>
		
			<view class="action-type-wrap">
				<view class="action" @click="changeOperationType('sweepCode')">
					<view class="_icon"><text class="iconfont iconsaoma"></text></view>
					<view class="_text">扫码核销</view>
				</view>
				<view class="iconfont icontiaoxingmasaomiao ns-gradient-otherpages-member-balance-balance-rechange"></view>
				<view class="action" @click="changeOperationType('manualInput')">
					<view class="_icon"><text class="iconfont iconshuru"></text></view>
					<view class="_text" @click="focus">手动输入</view>
				</view>
			</view>
		
			<!-- #ifdef MP-WEIXIN -->
			<!-- 小程序隐私协议 -->
			<privacy-popup ref="privacyPopup"></privacy-popup>
			<!-- #endif -->
		</view>
        <u-loading-page :loading="loading" loading-text="" loadingColor="var(--primary-color)" iconSize="35"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
	import { img,redirect, isWeixinBrowser, getToken } from '@/utils/common';
    import {onShow} from '@dcloudio/uni-app'
    import { getVerifierInfo, getCheckVerifier } from '@/app/api/verify'
    import { t } from '@/locale'
	import wechat from '@/utils/wechat'
	
	let operationType = ref('manualInput'); //类型
	// #ifdef H5
	operationType.value = 'manualInput';
	// #endif
	// #ifndef H5
	operationType.value = 'sweepCode';
	// #endif
	
	let isFocus = ref(false)
	let verify_code = ref('');
	let loading = ref(true)
	onShow(() => {
		if(getToken())
			checkIsVerifier();
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
	
	
	const scanCode = () => {
		// #ifdef MP
		uni.scanCode({
			onlyFromCamera: true,
			success: res => {
				if (res.errMsg == 'scanCode:ok') {
					let code = res.result;
					redirect({ url: '/app/pages/verify/verify', param: { code} })
				} else {
					uni.showToast({
						title: res.errorMsg,
						icon: 'none'
					});
				}
			}
		});
		// #endif
			
		// #ifdef H5
		if (isWeixinBrowser()) {
			wechat.init();
			wechat.scanQRCode(res => {
				if (res.resultStr) {
					let code = res.resultStr;
					redirect({ url: '/app/pages/verify/verify', param: { code} })
				}
			});
		}
		// #endif
	}
	
	let isLoading = false;
	const confirm = () => {
		if(isLoading) return false;
		isLoading = true;
		var reg = /[\S]+/;
		if (!reg.test(verify_code.value)) {
			uni.showToast({
				title: '请输入核销码',
				icon: 'none'
			});
			return false;
		}
		
		getVerifierInfo(verify_code.value).then((res:any) =>{
			isLoading = false;
			redirect({ url: '/app/pages/verify/verify', param: { code: verify_code.value} })
		})
	}
	
	const focus = () => {
		isFocus.value = !isFocus.value;
	}
	
	const changeOperationType = (type: string) => {
		// #ifdef H5
		if (type == 'sweepCode' && !isWeixinBrowser()) {
			uni.showToast({
				title: 'H5端不支持扫码核销',
				icon: 'none'
			});
			return;
		}
		// #endif
		operationType.value = type;
	}
</script>
<style lang="scss">
	.container {
		width: 100vw;
		height: 100vh;
		background: #f8f8f8;
	
		.action-wrap {
			padding: 100rpx 0;
			background: #fff;
			position: relative;
	
			.record-wrap {
				position: absolute;
				top: 30rpx;
				right: 30rpx;
	
				.iconfont {
					font-size: 28rpx;
					margin-right: 10rpx;
				}
			}
	
			.sweep-code {
				width: 400rpx;
				height: 400rpx;
				box-shadow: 0 8px 8px 0 rgba(0, 0, 0, 0.03), 0 6px 3px 0 rgba(0, 0, 0, 0.02);
				border-radius: 50%;
				margin: 0 auto;
				text-align: center;
				line-height: 400rpx;
				background: var(--primary-color);
	
				.iconfont {
					color: #fff;
					font-size: 150rpx;
				}
			}
	
			.manual-input {
				width: 70%;
				margin: auto;
	
				.process-wrap {
					height: 140rpx;
					display: flex;
					padding-top: 60rpx;
	
					.wrap {
						flex: 1;
						text-align: center;
	
						._icon {
							width: 60rpx;
							height: 60rpx;
							background: #eee;
							border-radius: 50%;
							margin: 0 auto;
							color: var(--primary-color);
	
							.iconfont {
								font-size: 36rpx;
							}
						}
	
						._text {
							font-size: 24rpx;
							margin-top: 10rpx;
							color: #999;
						}
					}
				}
	
				._input {
					height: 80rpx;
					border: 1px solid #eee;
					border-radius: 8rpx;
					box-sizing: border-box;
					padding: 20rpx;
					font-size: 28rpx;
					text-align: center;
				}
	
				._placeholder {
					font-size: 28rpx;
					text-align: center;
				}
	
				._btn {
					margin-top: 40rpx;
					height: 80rpx;
					line-height: 80rpx;
				}
			}
		}
	
		.arc-edge {
			width: 100%;
			height: 80rpx;
			background: #fff;
			border-radius: 400rpx/40rpx; /*上下有弧度的边*/
			transform: translateY(-50%);
		}
	
		.action-type-wrap {
			width: 70%;
			height: 90rpx;
			background: #fff;
			border-radius: 90rpx;
			display: flex;
			position: relative;
			box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.03), 0 4px 2px 0 rgba(0, 0, 0, 0.04);
			margin: 100rpx auto;
	
			.action {
				flex: 1;
				text-align: center;
				color: #333;
	
				._icon {
					line-height: 25px;
					height: 25px;
				}
	
				._text {
					font-size: 24rpx;
					line-height: 1;
				}
			}
	
			.icontiaoxingmasaomiao {
				width: 110rpx;
				height: 110rpx;
				border-radius: 50%;
				transform: translateY(-10rpx);
				box-shadow: 0 8px 8px 0 rgba(0, 0, 0, 0.03), 0 6px 3px 0 rgba(0, 0, 0, 0.02);
				text-align: center;
				line-height: 110rpx;
				background: var(--primary-color);
				color: #fff;
				font-size: 32rpx;
			}
		}
	}
</style>
