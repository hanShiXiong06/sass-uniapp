<template>
	<view class="container" :style="themeColor()">
		<block v-if="!loading">
			<view class="poster-wrap">
				<image v-if="poster" :src="poster" mode="widthFix" :show-menu-by-longpress="true"/>
			</view>
			 
			<!-- #ifdef H5 -->
			<view class="tips">长按识别图中二维码</view>
			<!--  #endif -->

			<!-- #ifdef MP -->
			<view class="btn-poster-save bg-[var(--primary-color)] border-[var(--primary-color)]" @click="save">保存海报</view>
			<!--  #endif -->

			<u-popup :show="show" @close="show = false" mode="center" :round="10" :closeable="true" :safe-area-inset-bottom="false">
				<view class="dialog-popup">
					<view class="title">提示</view>
					<view class="message">您拒绝了保存图片到相册的授权请求，无法保存图片到相册，如需正常使用，请授权之后再进行操作。</view>
					<view class="action-wrap">
						<view @click="closeDialog">取消</view>
						<view>
							<button type="default" class="authorization-btn" open-type="openSetting" @opensetting="closeDialog" hover-class="none">立即授权</button>
						</view>
					</view>
				</view>
			</u-popup>
		</block>

		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>

		<!-- #ifdef MP-WEIXIN -->
		<!-- 小程序隐私协议 -->
		<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
	import { img, getToken } from '@/utils/common';
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { getPoster } from '@/app/api/system'
	import { useShare } from '@/hooks/useShare'
    import { useLogin } from '@/hooks/useLogin'

	let show = ref(false);
	let loading = ref(true);
	
	const closeDialog = ()=> {
		show.value = false;
	}
	
	const { setShare, onShareAppMessage, onShareTimeline } = useShare()
	onShareAppMessage()
	onShareTimeline()

	onLoad((option) => {

		if(!getToken()){
            useLogin().setLoginBack({ url: '/addon/shop_fenxiao/pages/promote_code', param: { id: option.id, mid: option.mid } });
		    return;
		}

		getPosterFn(option.id);

		let share = {
			title: "分销推广",
			desc: "分销推广"
		}

		setShare({
			wechat:{
				...share
			},
			weapp:{
				...share
			}
		});
	})
	
	// 获取分享海报
	let poster = ref('');
	const getPosterFn = (id) => {
		loading.value = true;
		let obj = {
			type: 'fenxiao',
			param: {'member_id': id}
		}
		getPoster(obj).then((res:any) => {
			poster.value = res.data && img(res.data) || '';
			loading.value = false;
		})
	}

	// 保存海报
	const save = ()=> {
		// #ifdef MP
		uni.downloadFile({
			url: poster.value,
			success: res => {
				if (res.statusCode === 200) {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.showToast({
								title: '保存成功',
								icon: 'none'
							});
						},
						fail: err => {
							if(err.errno == 104){
							    let msg = '用户未授权隐私权限，将图像保存到相册失败';
							    uni.showToast({title: msg, icon: 'none'})
							}else if (err.errMsg == "saveImageToPhotosAlbum:fail auth deny" ||
									err.errMsg == "saveImageToPhotosAlbum:fail:auth denied") {
									show.value = true; 
							}else if(err.errMsg == "saveImageToPhotosAlbum:fail cancel"){
								let msg = '用户取消将图片保存到相册';
								uni.showToast({title: msg, icon: 'none'})
							}else{
								uni.showToast({title: err.errMsg, icon: 'none'})
							}
						}
					});
				} else {
					uni.showToast({
						title: '下载失败',
						icon: 'none'
					});
				}
			},
			fail: res => {
				uni.showToast({
					title: res.errMsg,
					icon: 'none'
				});
			}
		});
		// #endif
	}
</script>

<style lang="scss">
	.container {
		width: 100vw;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.poster-wrap {
		padding: 40rpx 0;
		width: calc(100vw - 80rpx);
		margin: 0 40rpx;
		line-height: 1;

		image {
			border-radius: 20rpx;
			overflow: hidden;
			width: 100%;
		}
	}

	.swiper {
		height: 1240rpx;
	}

	.btn-poster-save {
		margin: 0 40rpx;
		margin-top: 30rpx;
		height: 80rpx;
		line-height: 80rpx;
		color: #fff;
		text-align: center;
		border-radius: 10rpx;
		font-size:28rpx;
	}

	.tips {
		text-align: center;
		color: #999;
		font-weight: 600;
		margin-top: 20rpx;
	}

	.dialog-popup {
		width: 580rpx;
		background: #fff;
		box-sizing: border-box;
		border-radius: 10rpx;
		overflow: hidden;
		height: initial;

		.title {
			padding: 30rpx 30rpx 0 30rpx;
			text-align: center;
			font-size: 32rpx;
			font-weight: bold;
		}

		.message {
			padding: 0 30rpx;
			color: #666;
			text-align: center;
			line-height: 1.3;
			margin-top: 30rpx;
		}

		.action-wrap {
			margin-top: 50rpx;
			height: 80rpx;
			display: flex;
			border-top: 2rpx solid #eee;

			&>view {
				flex: 1;
				text-align: center;
				line-height: 80rpx;

				&:first-child {
					border-right: 2rpx solid #eee;
					color: #999;
				}

				button {
					border: none;
					line-height: 80rpx;
					padding: 0;
					margin: 0;
					width: 100%;
					height: 100%;
				}
			}
		}
		.authorization-btn{
			background-color: #07c160;
			color: #fff;
			font-size: 28rpx;
			border-radius: 0;
		}
	}
</style>