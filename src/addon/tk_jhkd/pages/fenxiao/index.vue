<template>
	<view class="min-h-[100vh] w-full" :style="themeColor()" v-if="memberStore.info">
		<view class="bgcontent p-2 pt-[44rpx]">
			<view class="flex justify-between mb-[-26rpx]">
				<view class="flex">
					<view class="ml-2 rounded-full border-2 border-gray-300">
						<u-avatar :src="img(info.headimg)" size="55" leftIcon="none"
							:default-url="img('static/resource/images/default_headimg.png')" />
					</view>

					<view class="ml-2">
						<view class="flex items-center">
							<view class="text-[#EAEDDC] truncate max-w-[320rpx] ">
								{{ info.nickname }}
							</view>
							<view
								class="flex bg-[#333333] items-center pl-2 pr-2 pt-1 ml-2 pb-1 h-[32rpx] rounded-[var(--goods-rounded-mid)]"
								@click="shareEvent()">
								<view>
									<u-icon name="integral" size="18" color="#fdfdfd"></u-icon>
								</view>
								<view class="text-[#CECECE] text-xs ml-1">{{info.member_level_name}}</view>
							</view>
						</view>

					</view>
				</view>

				<view
					class="flex bg-[#454337] items-center pl-2 pr-2 pt-1 pb-1 h-[32rpx] rounded-[var(--goods-rounded-mid)]"
					@click="shareEvent()">
					<view>
						<u-icon :name="img('addon/tk_jhkd/fenxiao/tgm.png')"></u-icon>
					</view>
					<view class="text-[#D5C6A9] ml-1">推广码</view>
				</view>

			</view>
			<view class="bg-[#2F302B] pl-3 pr-3 pt-6 pb-3 rounded-[12rpx]"
				:style="{ ...headerStyle, backgroundImage: 'url(' + img('addon/tk_jhkd/fenxiao/bjtt.png') + ')' }">
				<view class="flex items-center justify-between">
					<view @click="applyCashOut()">
						<view class="flex items-center">
							<view class="text-[#B3B4A2]">
								<view>可提现金额(元)</view>
							</view>

						</view>
						<view class="flex items-center mt-1">
							<view class="text-[#F7EED1] font-bold text-[36rpx]">
								{{ memberStore.info ? moneyFormat(memberStore.info.commission) : 0.00 }}
							</view>
							<view>
								<u-icon color="#B9BAB6" name="arrow-right"></u-icon>
							</view>
						</view>
					</view>
					<view class="gotx pl-2 pr-2 text-center rounded-[12rpx] leading-[64rpx] text-[#2F302B]"
						@click="applyCashOut()">去提现</view>
				</view>
				<view class="text-[#B3B4A2]  mt-4"
					@click="redirect({ url:'/app/pages/member/detailed_account?type=commission'})">
					<view>佣金明细</view>
				</view>
				<view class="flex justify-between items-center mt-2" v-if="fenxiaoinfo">
					<view>
						<view class="text-[#989795] text-xs">累计佣金(元)</view>
						<view class="text-[32rpx] text-[#F0F0E3] mt-2 font-bold">
							{{ moneyFormat(memberStore.info?.commission_get)|| '0.00' }}
						</view>
					</view>

					<view>
						<view class="text-[#989795] text-xs">提现中(元)</view>
						<view class="text-[32rpx] text-[#F0F0E3] mt-2 font-bold">
							{{ moneyFormat(memberStore.info?.commission_cash_outing)|| '0.00' }}
						</view>
					</view>
					<view>
						<view class="text-[#989795] text-xs">累计订单(个)</view>
						<view class="text-[32rpx] text-[#F0F0E3] mt-2 font-bold">
							{{fenxiaoinfo.first_order_num+fenxiaoinfo.second_order_num}}
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="tk-card" v-if="fenxiaoinfo">
			<view class="flex items-center justify-between bg-[#FBFBFB] mb-4">
				<view class="flex items-center">
					<view class="w-1 h-3 !bg-[#E9D88B]"></view>
					<view class="font-bold ml-2 text-[28rpx]">推广人数</view>
				</view>
				<view class="flex items-center" @click="redirect({url:'/addon/tk_jhkd/pages/fenxiao/member'})">
					<view class=" ml-2 text-[24rpx]">查看成员</view>
					<view>
						<u-icon name="arrow-right"></u-icon>
					</view>
				</view>

			</view>
			<view class="flex justify-center">
				<view class="w-[50%] text-center">
					<view class="font-bold">
						{{fenxiaoinfo.first_num}}
					</view>
					<view class="text-slate-500 text-xs">一级人数</view>
				</view>
				<view class="w-[50%] text-center">
					<view class="font-bold">
						{{fenxiaoinfo.second_num}}
					</view>
					<view class="text-slate-500 text-xs">二级人数</view>
				</view>
			</view>
		</view>
		<view class="tk-card" v-if="fenxiaoinfo">
			<view class="flex justify-between bg-[#FBFBFB] mb-4">
				<view class="flex items-center">
					<view class="w-1 h-3 !bg-[#E9D88B]"></view>
					<view class="font-bold ml-2 text-[28rpx]">完成订单</view>
				</view>
				<view class="flex items-center">
					<view class=" ml-2 text-[24rpx]" @click="redirect({url:'/addon/tk_jhkd/pages/fenxiao/order'})">查看订单
					</view>
					<view>
						<u-icon name="arrow-right"></u-icon>
					</view>
				</view>
			</view>
			<view class="flex justify-center">
				<view class="w-[50%] text-center">
					<view class="font-bold">
						{{fenxiaoinfo.first_order_num}}
					</view>
					<view class="text-slate-500 text-xs">一级订单</view>
				</view>
				<view class="w-[50%] text-center">
					<view class="font-bold">
						{{fenxiaoinfo.second_order_num}}
					</view>
					<view class="text-slate-500 text-xs">二级订单</view>
				</view>
			</view>

		</view>
	</view>
	<share-poster ref="sharePosterRef" posterType="tk_jhkd_poster" :posterId="poster_id" :posterParam="posterParam"
		:copyUrlParam="copyUrlParam" :copyUrl="'/addon/tk_jhkd/pages/index'" />
	<tabbar addon="tk_jhkd" />
	<pay ref="payRef" @close="payLoading = false"></pay>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { moneyFormat, img, redirect, getToken, isWeixinBrowser, getSiteId, handleOnloadParams } from '@/utils/common';
	import { getMemberCommission } from '@/app/api/member';
	import useMemberStore from '@/stores/member'
	import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import {
		checkFenxiao, getFenxiaoInfo
	} from '@/addon/tk_jhkd/api/fenxiao'
	import { useLogin } from '@/hooks/useLogin'
	import { timeChange } from "@/addon/tk_jhkd/utils/ts/common";
	// 提现
	const applyCashOut = () => {
		uni.setStorageSync('cashOutAccountType', 'commission')
		redirect({ url: '/app/pages/member/apply_cash_out' })
	}
	const userInfo = computed(() => memberStore.info)
	/************* 分享海报-start **************/
	let sharePosterRef = ref(null);
	let copyUrlParam = ref('');
	let posterParam = {};
	const poster_id = ref(0)
	const fenxiaoinfo = ref()
	const getFenxiaoInfoEvent = async () => {
		const res = await getFenxiaoInfo()
		fenxiaoinfo.value = res.data
	}
	getFenxiaoInfoEvent()
	// 分享海报链接
	const copyUrlFn = () => {

		if (userInfo.value && userInfo.value.member_id) copyUrlParam.value += '?mid=' + userInfo.value.member_id;
	}
	const shareEvent = () => {

		// 检测是否登录
		if (!userInfo.value) {

			useLogin().setLoginBack({ url: '/addon/tk_jhkd/pages/index' })
			return false

		}

		if (userInfo.value && userInfo.value.member_id)
			posterParam.member_id = userInfo.value.member_id;
		copyUrlFn()
		sharePosterRef.value.openShare()
	}
	/************* 分享海报-end **************/

	const memberStore = useMemberStore();
	const info = computed(() => memberStore.info)
	// 获取系统状态栏的高度
	let menuButtonInfo : any = {};
	// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
	// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
	menuButtonInfo = uni.getMenuButtonBoundingClientRect();
	// #endif
	const headerStyle = computed(() => {
		return {
			backgroundImage: 'url(' + img('static/resource/images/member/commission/commission_bg.png') + ') ',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
		}
	})
	//  16为自定头部的padding-bottom
	const mescrollTop = computed(() => {
		return Object.keys(menuButtonInfo).length ? (Number(menuButtonInfo.height) * 2 + menuButtonInfo.top * 2 + 530 + 16) + 'rpx' : '530rpx'
	})
	onLoad((option) => {
		// #ifdef MP-WEIXIN
		// 处理小程序场景值参数
		option = handleOnloadParams(option);
		// #endif
		let pid = uni.getStorageSync('pid');
		if (pid && pid > 0) {
			checkFenxiao({ pid: pid })
		}

	})
</script>
<style lang="scss" scoped>
	@import '@/addon/tk_jhkd/utils/styles/common.scss';

	.bgcontent {
		background: linear-gradient(0deg, rgba(246, 246, 246, 0.2) 0%, rgba(27, 27, 27, 1) 40%);
	}

	.gotx {
		background: linear-gradient(90deg, rgba(252, 242, 189, 1) 20%, rgba(255, 236, 171, 1.0) 40%);
	}

	.class-select {
		position: relative;
		font-weight: bold;

		&::after {
			content: "";
			position: absolute;
			bottom: 0;
			height: 6rpx;
			background-color: var(--primary-color);
			width: 90%;
			left: 50%;
			transform: translateX(-50%);
		}
	}

	page {
		background-color: #F5F5F5;
	}

	.fx {
		font-size: 15px;
		display: flex;
		width: 18%;
		text-align: center;
		background: #000000;
		padding: 10px;
		border-radius: 0px 10px 10px 0px;
	}

	.fx .icon1 {
		width: 15px;
		height: 15px;
		margin-right: 5px;
	}

	.fxwz {
		font-size: 12px !important;
		color: #cecdcd;
	}

	.reseller {

		min-height: 100vh;
		font-size: 14px;

		.top {
			color: #FFFFFF;
			//display: flex;
			justify-content: space-between;
			position: relative;
			width: 100%;
			height: 250px;

			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;

			//background-color: #2196F3;
			//background: linear-gradient(top, #2196F3, #03A9F4);
			.top1 {
				display: flex;
			}

			.title {
				background-color: #FFFFFF
			}

			.num {
				font-size: 15px;
				line-height: 25px;
				text-align: center;
				width: 33%;
				padding-top: 8%;
			}

			.num1 {
				text-align: center;
				width: 100%;
				padding-top: 10%;
			}

		}

		.jilu {
			font-size: 15px;
			position: absolute;
			left: 78%;
			top: 20%;
		}

		.jl {
			font-size: 12px !important;
			background: #ffffff05;
			padding: 10px;
			border-radius: 10px 0px 0px 10px;
		}

		.fx {
			font-size: 15px;
			position: absolute;
			display: flex;
			left: 0;
			top: 20%;
			width: 18%;
			text-align: center;
			background: #ffffff21;
			padding: 10px;
			border-radius: 0px 10px 10px 0px;
		}

		.fx .icon1 {
			width: 15px;
			height: 15px;
			margin-right: 5px;
		}

		.fxwz {
			font-size: 12px !important;
			color: #cecdcd;
		}

		.tixian {
			display: flex;
			justify-content: center;
			background-color: #F5F5F5;
			width: 55%;
			height: 60px;
			border-radius: 60px;
			position: absolute;
			bottom: -30px;
			left: 23%;

			.btn {
				margin-top: 7%;
				text-align: center;
				width: 85%;
				background-color: #e5349b;
				height: 40px;
				border: none;
				border-radius: 50px;
				line-height: 40px;
				color: #FFFFFF;
			}


		}

		.icon {
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;

			margin-left: 3%;
			margin-right: 3%;
			margin-top: 10%;

			.ico {
				border-radius: 10px;
				border: 1px solid #C0C0C0;
				width: 49%;
				height: auto;
				margin-top: 8px;
				padding-bottom: 10px;
				border: none;
				font-size: 15px;
				flex-direction: column;
				background-color: #FFFFFF;

				.img {
					width: 40px;
					height: 40px;
				}

				.tubiao {
					margin-top: 20px;
					margin-left: 10px;
					text-align: center;
					width: 35%;
					float: left;
				}

				.tt {
					float: left;
					margin-top: 17px;
				}

				.text {
					color: #8F8F94;
					text-align: center;
					font-size: 14px;

				}

				.text_r {
					font-size: 18px;
					font-weight: bold;
				}
			}
		}

		.kong {
			height: 100px;
		}
	}
</style>