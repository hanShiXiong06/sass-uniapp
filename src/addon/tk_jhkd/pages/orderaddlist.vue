<template>
	<view class="bg-[#f8f8f8] min-h-screen overflow-hidden">
		<view class="fixed left-0 top-0 right-0 z-10" v-if="statusLoading">
			<scroll-view scroll-x="true" class="scroll-Y box-border px-[24rpx] bg-white">
				<view class="flex whitespace-nowrap justify-around">
					<view :class="['text-sm leading-[90rpx]',{'class-select': orderState === item.status.toString()}]"
						@click="orderStateFn(item.status)" v-for="(item,index) in orderStateList">{{item.name}}</view>
				</view>
			</scroll-view>
		</view>

		<mescroll-body ref="mescrollRef" top="44rpx" @init="mescrollInit" @down="downCallback" @up="getOrderListFn">
			<view v-if="list.length > 0" class="tk-card" v-for="(item, index) in list" key=index>
				<view class="text-xs font-weight"
					@click="goto('/addon/tk_jhkd/pages/orderdetail?id=' + item.orderInfo.id)">订单号:{{item.order_id}}
				</view>

				<view class="fb items-center">
					<view class="text-xs">{{item.create_time}}</view>
					<view v-if="item.order_status==0" class="tk-tag" @click="gopay(item)">立即支付</view>
					<view v-if="item.order_status==1" class="tk-tag" @click="del(item.id)">删除订单</view>
				</view>
			</view>
			<mescroll-empty :option="{'icon': img('static/resource/images/empty.png')}"
				v-if="!list.length && loading"></mescroll-empty>
		</mescroll-body>
	</view>
	<tabbar addon="tk_jhkd" />
	<pay ref="payRef" @close="payLoading = false"></pay>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { t } from '@/locale'
	import { img, redirect } from '@/utils/common';
	import { getOrderList, getOrderStatus, deleteOrder } from '@/addon/tk_jhkd/api/orderadd';
	import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
	import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
	import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
	import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import { goto } from '@/addon/tk_jhkd/utils/ts/goto';
	const payRef = ref(null)
	const payLoading = ref(false)
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);
	let list = ref<Array<Object>>([]);
	let loading = ref<boolean>(false);
	let statusLoading = ref<boolean>(false);
	let orderState = ref('')
	let orderStateList = ref([]);
	const listData = ref([])
	onLoad((option) => {
		orderState.value = option.status || "0";
		getOrderStatusFn()
	});

	//支付
	const gopay = (item) => {
		payLoading.value = true;
		payRef.value?.open('jhkdOrderAddPay', item.id, '/addon/tk_jhkd/pages/orderaddlist');
	}
	//删除
	const del = async (id) => {
		await deleteOrder(id)
		getMescroll().resetUpScroll();
	}

	const getOrderListFn = (mescroll) => {
		loading.value = false;
		let data : object = {
			page: mescroll.num,
			limit: mescroll.size,
			order_status: orderState.value
		};
		console.log(orderState.value)
		getOrderList(data).then((res) => {
			let newArr = (res.data.data as Array<Object>);
			//设置列表数据
			if (mescroll.num == 1) {
				list.value = []; //如果是第一页需手动制空列表
			}
			list.value = list.value.concat(newArr);
			mescroll.endSuccess(newArr.length);
			loading.value = true;
		}).catch(() => {
			loading.value = true;
			mescroll.endErr(); // 请求失败, 结束加载
		})
	}
	const getOrderStatusFn = () => {
		statusLoading.value = false;
		orderStateList.value = [];
		getOrderStatus().then((res) => {
			Object.values(res.data).forEach((item, index) => {
				orderStateList.value.push(item);
			});
			statusLoading.value = true;
		}).catch(() => {
			statusLoading.value = true;
		})
	}
	const orderStateFn = (status) => {
		orderState.value = status.toString();
		list.value = [];
		getMescroll().resetUpScroll();
	};
</script>
<style lang="scss" scoped>
	@import '@/addon/tk_jhkd/utils/styles/common.scss';

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

	.detail-tag {
		background-color: aliceblue;
		padding: 4rpx 16rpx;
		font-size: 16rpx;
	}

	.qu-tag {
		background-color: #b9b9b9;
		color: #ffffff;
		padding: 4rpx 8rpx;
		border-radius: 16rpx;
	}

	.song-tag {
		background-color: #4451c2;
		color: #ffffff;
		padding: 4rpx 8rpx;
		border-radius: 16rpx;
	}
</style>