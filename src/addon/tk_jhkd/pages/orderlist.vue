<template>
	<view class="bg-gray-50 min-h-screen">
		<view class="fixed left-0 top-0 right-0 z-10 backdrop-blur-sm bg-white/80" v-if="statusLoading">
			<scroll-view scroll-x="true" class="scroll-Y">
				<view class="flex whitespace-nowrap px-3 py-3">
					<view v-for="(item, index) in orderStateList" :class="[
						'px-4 py-2 mx-1.5 rounded-full transition-all duration-300 text-sm font-medium',
						orderState === item.status.toString()
							? 'bg-primary text-white shadow-sm shadow-primary/30'
							: 'text-gray-600 hover:bg-gray-50'
					]" @click="orderStateFn(item.status)">
						{{ item.name }}
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="h-[60rpx]"></view>
		<mescroll-body ref="mescrollRef" top="50rpx" @init="mescrollInit" @down="downCallback" @up="getOrderListFn">
			<view v-if="list.length > 0" class="space-y-3 p-2">
				<view v-for="(item, index) in list" :key="index"
					class="bg-white rounded-xl shadow-sm p-3 transition-all duration-300 hover:shadow-md">
					<!-- 订单头部 -->
					<view class="flex justify-between items-center mb-4">
						<view class="space-y-2">
							<view class="flex items-center space-x-2 text-xs">
								<text class="text-gray-600">订单号:</text>
								<text class="font-medium">{{ item.order_id }}</text>
							</view>
							<view v-if="item.orderInfo.delivery_id" class="flex items-center cursor-pointer group"
								@click="copy(item.orderInfo.delivery_id)">
								<text class="text-primary mr-2 truncate w-[200px]">运单号: {{ item.orderInfo.delivery_id
									}}</text>
								<up-icon class="border rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
									name="cut" color="#4541c7" size="14">
								</up-icon>
							</view>
						</view>
						<view :class="[
							'text-sm font-medium px-4 py-1.5 rounded-full transition-colors',
							item.order_status_data.name === '已关闭'
								? 'bg-red-50 text-red-600'
								: 'bg-blue-50 text-blue-600'
						]">
							{{ item.order_status_data.name }}
						</view>
					</view>

					<!-- 寄收地址区域 -->
					<view class="bg-gray-50/70 rounded-xl p-2 space-y-2">
						<view class="flex items-center justify-between">
							<view class="flex items-center flex-1 space-x-3">
								<text
									class="bg-blue-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium">寄</text>
								<view class="space-y-1">
									<text class="font-bold text-gray-900">
										{{ JSON.parse(item.orderInfo.start_address).address.split('-')[0] }}
									</text>
									<text class="text-gray-500 text-xs block">
										{{ JSON.parse(item.orderInfo.start_address).name }}
									</text>
								</view>
							</view>

							<view class="flex items-center px-4 text-gray-400">

								<up-icon name="more-dot-fill" color="#e3ecfa" size="28"></up-icon>

								<up-icon name="arrow-right" color="#e3ecfa" size="20"></up-icon>
							</view>

							<view class="flex items-center flex-1 space-x-3">
								<text
									class="bg-green-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium">收</text>
								<view class="space-y-1">
									<text class="font-bold text-gray-800">
										{{ JSON.parse(item.orderInfo.end_address).address.split('-')[0] }}
									</text>
									<text class="text-gray-500 text-xs block">
										{{ JSON.parse(item.orderInfo.end_address).name }}
									</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 订单信息 -->
					<view class="mt-4 flex justify-between items-center">
						<text class="text-gray-500 text-sm">{{ item.create_time }}</text>
						<text class="text-red-600 font-bold text-[36rpx]">￥{{ item.order_money }}</text>
					</view>

					<text class="text-xs text-gray-400 mt-2 block">注意：下单1分钟后才能取消订单哦</text>

					<!-- 超重信息 -->
					<view
						v-if="item.addorderInfo && item.deliveryRealInfo.fee_weight > 0 && item.addorderInfo.order_status == 0"
						class="mt-4 bg-blue-50 rounded-xl p-2 space-y-2">
						<view class="space-y-2">
							<view v-if="item.deliveryRealInfo.fee_weight > item.orderInfo.weight"
								class="text-sm text-blue-700">
								超重: {{ Math.ceil(item.deliveryRealInfo.fee_weight - item.orderInfo.weight) }}kg;
								￥{{ Math.ceil(item.deliveryRealInfo.fee_weight - item.orderInfo.weight) *
									(item.orderInfo.price_rule.add ?? 3) }}
							</view>
							<template v-if="item.deliveryRealInfo.fee_blockList">
								<view v-for="(item1, index1) in item.deliveryRealInfo.fee_blockList" :key="index1"
									class="text-sm text-blue-700">
									{{ item1.name }}: ￥{{ item1.fee }}
								</view>
							</template>
						</view>
						<view class="text-right">
							<text class="text-red-600 font-bold text-lg">需补差价: ￥{{ item.addorderInfo.order_money
								}}</text>
						</view>
					</view>

					<view v-else-if="item.addorderInfo && item.addorderInfo.order_status == 1"
						class="mt-4 bg-green-50 rounded-xl p-4">
						<text class="text-green-700 font-medium">已补差价：￥{{ item.addorderInfo.order_money }}</text>
					</view>

					<!-- 操作按钮 -->
					<view class="flex justify-between items-center pt-2 border-t border-gray-100">
						<view class="flex space-x-2">
							<button v-for="(item1, index1) in item.order_status_arr?.member_action" :key="index1"
								class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
								@click="clickbut(item1.class, item)">
								{{ item1.name }}
							</button>
						</view>
						<view class="flex space-x-2">
							<button
								class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
								@click="goto('/addon/tk_jhkd/pages/orderdetail?id=' + item.id)">
								查看详情
							</button>
							<button v-if="item.addorderInfo && item.addorderInfo.order_status == 0"
								class="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
								@click="payAdd(item.addorderInfo.id)">
								补差价
							</button>
						</view>
					</view>
				</view>
			</view>

			<mescroll-empty :option="{ icon: img('static/resource/images/empty.png') }" v-if="!list.length && loading">
			</mescroll-empty>
		</mescroll-body>
		<u-back-top :scroll-top="scrollTop" top="875" bottom="100" right="20"></u-back-top>
	</view>

	<up-modal :show="orders.show" @confirm="confirm(item1.class, item)" ref="uModal" @cancel="orders.show = false"
		:showCancelButton="true" :content="orders.msg" :asyncClose="true">
	</up-modal>

	<tabbar addon="tk_jhkd" />
	<pay ref="payRef" @close="payLoading = false"></pay>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { t } from "@/locale";
import { img, redirect, copy } from "@/utils/common";
import {
	getOrderList,
	getOrderStatus,
	applyRefund,
	deleteOrder,
	closeOrder,
} from "@/addon/tk_jhkd/api/order";
import MescrollBody from "@/components/mescroll/mescroll-body/mescroll-body.vue";
import MescrollEmpty from "@/components/mescroll/mescroll-empty/mescroll-empty.vue";
import useMescroll from "@/components/mescroll/hooks/useMescroll";
import { onLoad, onPageScroll, onReachBottom } from "@dcloudio/uni-app";
import { goto } from "@/addon/tk_jhkd/utils/ts/goto";
import { confirm } from "@/addon/tk_jhkd/utils/ts/alert";
// import { checkAddPayEvent } from "@/addon/tk_jhkd/utils/ts/common"
// checkAddPayEvent()
const payAdd = (e) => {
	payLoading.value = true;
	payRef.value?.open(
		"jhkdOrderAddPay",
		e,
		"/addon/tk_jhkd/pages/orderlist"
	);
};
interface Order {
	id: string;
	order_id: string;
	orderInfo: {
		delivery_id: string;
		start_address: string;
		end_address: string;
		goods: string;
		weight: number;
		long: number;
		width: number;
		height: number;
	};
	order_status_data: {
		name: string;
	};
	order_status_arr: {
		member_action: Array<{ class: string; name: string }>[];
	};
}

const payRef = ref(null);
const payLoading = ref(false);
const orders = ref<{ show: boolean; msg: string }>({
	show: false,
	msg: "",
});
const { mescrollInit, downCallback, getMescroll } = useMescroll(
	onPageScroll,
	onReachBottom
);
const list = ref<Order[]>([]);
const loading = ref<boolean>(false);
const statusLoading = ref<boolean>(false);
const orderState = ref<string>("");
const orderStateList = ref<Array<{ name: string; status: string }>>([]);
const scrollTop = ref(0)

onLoad((option: { status: string }) => {
	orderState.value = option.status || "";
	getOrderStatusFn();
});

const clickbut = (action: string, item: Order) => {
	if (action === "gopay") {
		gopay(item);
	} else if (action === "del") {
		confirm("确定要删除订单吗？", del, item);
	} else if (action === "refund") {
		confirm("确定要申请退款吗？", refund, item);
	} else if (action === "close") {
		confirm("确定要关闭订单吗？", close, item);
	}
};
//支付
const gopay = (item: any) => {
	payLoading.value = true;
	payRef.value?.open(
		item.payInfo.trade_type,
		item.payInfo.trade_id,
		"/addon/tk_jhkd/pages/orderlist?status=" + orderState.value
	);
};
const del = async (item: Order) => {
	await deleteOrder(item.id);
	getMescroll().resetUpScroll();
};
const close = async (item: Order) => {
	await closeOrder(item.id);
	getMescroll().resetUpScroll();
};
const refund = async (item: Order) => {
	const params = {
		id: item.id,
		close_reason: "用户主动退款",
	};
	await applyRefund(params);
	getMescroll().resetUpScroll();
};

const getOrderListFn = (mescroll: any) => {
	loading.value = false;
	const data = {
		page: mescroll.num,
		limit: mescroll.size,
		order_status: orderState.value,
	};
	getOrderList(data)
		.then((res) => {
			const newArr = res.data.data as Order[];
			if (mescroll.num === 1) {
				list.value = [];
			}
			list.value = list.value.concat(newArr);
			mescroll.endSuccess(newArr.length);
			loading.value = true;
		})
		.catch(() => {
			loading.value = true;
			mescroll.endErr();
		});
};

const getOrderStatusFn = () => {
	statusLoading.value = false;
	orderStateList.value = [];
	const obj = { name: "全部", status: "" };
	orderStateList.value.push(obj);
	getOrderStatus()
		.then((res) => {
			Object.values(res.data).forEach((item) => {
				orderStateList.value.push(item);
			});
			statusLoading.value = true;
		})
		.catch(() => {
			statusLoading.value = true;
		});
};

const orderStateFn = (status: string) => {
	orderState.value = status.toString();
	list.value = [];
	getMescroll().resetUpScroll();
};

onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})
</script>

<style lang="scss" scoped>
//@import "@/addon/tk_jhkd/utils/styles/common.scss";
.line-box1 {
	background-color: #e3e3e3;
	height: 2rpx;
	width: 100%;
	margin-top: 12rpx;
	margin-bottom: 12rpx;
}

page {
	--primary-color: #4541c7;
	--primary-color-dark: #f26f3e;
	--primary-color-disabled: #ffb397;
	--primary-color-light: #ffeae2;
	--page-bg-color: #f7f7f7;
	--price-text-color: #e1251b;
}

.qu-tag {
	background: #fba92d;
	color: #ffffff;
	height: 28rpx;
	line-height: 28rpx;
	text-align: center;
	width: 32rpx;
	display: inline-block;
}

.song-tag {
	background: #4541c7;
	color: #ffffff;
	height: 28rpx;
	line-height: 28rpx;
	text-align: center;
	width: 32rpx;
	display: inline-block;
}

.tk-card {
	padding: 20rpx;
	margin-top: 24rpx;
	background: #fff;
	box-shadow: 0rpx 1rpx 4rpx rgba(0, 0, 0, 0.1);
	margin-bottom: 10rpx;
}

.tk-tag1 {
	background: #4541c7;
	color: #ffffff;
	border: 1rpx solid #4541c7;
	font-size: 22rpx;
	padding: 5rpx 20rpx;
	border-radius: 10rpx;
}

.tk-tag {
	color: #4541c7;
	border: 1rpx solid #4541c7;
	font-size: 22rpx;
	padding: 5rpx 20rpx;
	border-radius: 10rpx;
}
</style>