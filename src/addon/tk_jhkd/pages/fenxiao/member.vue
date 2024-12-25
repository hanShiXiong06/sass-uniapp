<template>
	<view class="min-h-[100vh] w-full" :style="themeColor()" v-if="memberStore.info">

		<view class="tk-card" v-if="fenxiaoinfo">
			<view class="flex justify-between">
				<view class="flex">
					<view class="ml-2 rounded-full border-2 border-gray-300">
						<u-avatar :src="img(info.headimg)" size="55" leftIcon="none"
							:default-url="img('static/resource/images/default_headimg.png')" />
					</view>

					<view class="ml-2">
						<view class="">
							<view class="text-[#4c4d47] truncate max-w-[320rpx] ">
								{{ info.nickname }}
							</view>
							<view
								class="flex bg-[#333333] items-center pl-2 pr-2 pt-1  pb-1 h-[32rpx] rounded-[var(--goods-rounded-mid)]"
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
						<u-icon :name="img('addon/tk_cps/fenxiao/tgm.png')"></u-icon>
					</view>
					<view class="text-[#D5C6A9] ml-1">推广码</view>
				</view>

			</view>
			<view class="flex items-center bg-[#FBFBFB] mb-2 mt-4">
				<view class="w-1 h-3 !bg-[#E9D88B]"></view>
				<view class="font-bold ml-2 text-[28rpx]">推广人数</view>
			</view>
			<view class="flex mt-2">
				<view
					class="w-[50%] bg-gradient-to-r  from-[#ffffff] to-[#fbfdf8] rounded-[12rpx] p-2 text-center m-2 backdrop-blur-sm">
					<view class="font-bold">
						{{fenxiaoinfo.first_num}}
					</view>
					<view class="text-slate-500 text-xs">一级人数</view>
				</view>
				<view
					class="w-[50%] bg-gradient-to-r from-[#ffffff] to-[#fbfdf8] rounded-[12rpx] p-2 text-center m-2 backdrop-blur-sm">
					<view class="font-bold">
						{{fenxiaoinfo.second_num}}
					</view>
					<view class="text-slate-500 text-xs">二级人数</view>
				</view>
			</view>
		</view>
		<view class="tk-card">
			<scroll-view scroll-x="true" class="scroll-Y box-border px-[22rpx]  pb-2 rounded-[12rpx]">
				<view class="flex items-center justify-between" style="width: 100%;">
					<view class=" bg-[#ececec]  p-1 pl-11 pr-11 rounded-[12rpx] "
						:class="['',{'!bg-[#454337] p-1 pl-2 pr-2 font-bold rounded-[12rpx] text-[#D5C6A9]': type == item.type}]"
						@click="typeChange(item.type)" v-for="(item,index) in typeList">{{item.name}}</view>
				</view>
			</scroll-view>
		</view>
		<block v-if="list" v-for="(item,index) in list" :key="index">
			<view class="tk-card flex items-center">
				<view class="flex items-center">
					<view v-if="item.memberInfo">
						<u-avatar :src="img(item.memberInfo.headimg)" size="55" leftIcon="none"
							:default-url="img('static/resource/images/default_headimg.png')" />
					</view>
					<view class="ml-2">
						<view class="font-bold">{{item.memberInfo.nickname}}</view>
						<view class="text-xs text-[#454337]">{{item.order_num}}单</view>
					</view>
				</view>

			</view>
		</block>
		<up-empty v-if="list.length==0" mode="list" text="暂无数据">
		</up-empty>
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
		checkFenxiao, getFenxiaoInfo, getFenxiaoMember
	} from '@/addon/tk_jhkd/api/fenxiao'
	import { useLogin } from '@/hooks/useLogin'
	import { timeChange } from "@/addon/tk_jhkd/utils/ts/common";
	const list = ref([])
	const page = ref(1)
	const loading = ref(false)
	const typeList = ref([
		{
			name: '一级会员',
			type: 'first'
		},
		{
			name: '二级会员',
			type: 'two'
		}
	])
	const type = ref('first')
	const typeChange = (e) => {
		type.value = e
		page.value = 1
		list.value = []
		getMemberListFn()
	}
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
	const getMemberListFn = () => {
		loading.value = true;
		let data : object = {
			page: page.value,
			limit: 15,
			type: type.value
		};
		getFenxiaoMember(data)
			.then((res) => {
				let newArr = res.data.data as Array<Object>;
				if (newArr.length == 0) {
					loading.value = false;
					uni.showToast({
						title: "已经没有更多数据",
						icon: "none",
					});
					return
				}
				if (list.value.length == 0) {
					page.value++
					list.value = newArr;
				} else {
					page.value++
					list.value = list.value.concat(newArr);
				}
			})
			.catch(() => {
				loading.value = false;
			});
	};
	onReachBottom(() => {
		page.value++
		getMemberListFn()
	})
	onPageScroll(() => {
		loading.value = false;
		getMemberListFn()
	});
	onLoad((option) => {
		// #ifdef MP-WEIXIN
		// 处理小程序场景值参数
		option = handleOnloadParams(option);
		// #endif
		let pid = uni.getStorageSync('pid');
		if (pid && pid > 0) {
			checkFenxiao({ pid: pid })
		}
		getMemberListFn()

	})
</script>
<style lang="scss" scoped>
	@import '@/addon/tk_jhkd/utils/styles/common.scss';

	.bgcontent {
		background: linear-gradient(0deg, rgba(255, 255, 255, 0.2) 0%, rgba(252, 252, 242, 1.0) 40%);
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