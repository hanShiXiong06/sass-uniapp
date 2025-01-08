<template>
	<view class="bg-gray-100 min-h-screen">
		<!-- 订单信息卡片 -->
		<view class="bg-white rounded-lg shadow-sm mx-3 mt-3 p-4">
			<view class="border-b border-gray-100 pb-3">
				<view class="flex justify-between items-center">
					<text class="text-gray-600 text-sm">订单号: {{ form.order_id }}</text>
					<view class="bg-primary-50 text-primary px-2 py-1 rounded text-xs" v-if="form.order_status_arr">
						{{ form.order_status_arr.name }}
					</view>
				</view>
				<text class="text-gray-400 text-xs mt-1 block">{{ form.create_time }}</text>
			</view>

			<!-- 取件地址 -->
			<view class="mt-1">
				<view class="flex items-start">
					<view class="bg-blue-50 text-blue-500 rounded px-2 py-1 text-xs mr-3">取</view>
					<view class="flex-1" v-if="form.orderInfo">
						<view class="font-medium text-gray-800 text-sm">
							{{ JSON.parse(form.orderInfo.start_address).address }}
						</view>
						<view class="text-gray-500 text-xs mt-1">
							{{ JSON.parse(form.orderInfo.start_address).full_address }}
						</view>
						<view class="text-gray-500 text-xs mt-1">
							{{ JSON.parse(form.orderInfo.start_address).mobile }}
						</view>
					</view>
				</view>
			</view>

			<!-- 收件地址 -->
			<view class="mt-4">
				<view class="flex items-start">
					<view class="bg-green-50 text-green-500 rounded px-2 py-1 text-xs mr-3">收</view>
					<view class="flex-1" v-if="form.orderInfo">
						<view class="font-medium text-gray-800 text-sm">
							{{ JSON.parse(form.orderInfo.end_address).address }}
						</view>
						<view class="text-gray-500 text-xs mt-1">
							{{ JSON.parse(form.orderInfo.end_address).full_address }}
						</view>
						<view class="text-gray-500 text-xs mt-1">
							{{ JSON.parse(form.orderInfo.end_address).mobile }}
						</view>
					</view>
				</view>
			</view>

			<view class=" !text-[24rpx] font-weight  rounded-[8rpx] mt-3" v-if="form.orderInfo">
				物品:{{ form.orderInfo.goods }}下单重量:{{ form.orderInfo.weight }}kg {{ form.orderInfo.goods }}
				{{ form.orderInfo.long }}x{{ form.orderInfo.width }}x{{ form.orderInfo.height }}cm
			</view>

			<view class="mt-2 font-weight text-[#313131] !text-[24rpx] mt-1 rounded-[8rpx]">
				备注:{{ form.remark }}
			</view>

			<!-- 操作按钮 -->

			<view class="flex justify-end mt-2">

				<block v-if="form.order_status_arr" v-for="(item, index) in form.order_status_arr.member_action">
					<view class="tk-tag mr-4" @click="clickbut(item.class)">{{ item.name }}</view>
				</block>
			</view>
		</view>

		<!-- 计费信息 -->
		<view class="bg-white rounded-lg shadow-sm mx-3 mt-3">
			<up-collapse @change="change001" @close="close001" @open="open001">
				<up-collapse-item title="计费信息" name="Docs guide">
					<view class="p-4 space-y-2">
						<view v-if="form.orderInfo" class="flex flex-wrap gap-4">
							<view class="text-gray-600 text-sm">
								首重：{{ form.orderInfo.price_rule.first }}元/{{ form.orderInfo.price_rule.start }}kg
							</view>
							<view class="text-gray-600 text-sm">
								续重：{{ form.orderInfo.price_rule.add }}元/kg
							</view>
						</view>

						<view v-if="form.deliveryRealInfo" class="space-y-2">
							<view class="flex flex-wrap gap-4">
								<view v-if="form.deliveryRealInfo.fee_weight > 0" class="text-gray-600 text-sm">
									计费重量：{{ form.deliveryRealInfo.fee_weight }}kg
								</view>
								<view v-if="form.deliveryRealInfo.volume > 0" class="text-gray-600 text-sm">
									体积：{{ form.deliveryRealInfo.volume }}cm³
								</view>
							</view>

							<view v-if="form.deliveryRealInfo && form.deliveryRealInfo.fee_blockList.length > 0"
								class="space-y-1">
								<view v-for="(item, index) in form.deliveryRealInfo.fee_blockList"
									class="flex justify-between text-gray-600 text-sm">
									<text>{{ item.name }}</text>
									<text>{{ item.fee }}元</text>
								</view>
							</view>
						</view>
					</view>
				</up-collapse-item>
			</up-collapse>
		</view>

		<!-- 快递信息 -->
		<view class="bg-white rounded-lg shadow-sm mx-3 mt-3 p-4">
			<!-- 揽件员信息 -->
			<view v-if="form.orderInfo && pickInfo && form.orderInfo.order_status == 1"
				class="border-b border-gray-100 pb-3 mb-3">
				<view class="flex items-center flex-wrap gap-2">
					<text v-if="pickInfo.courierName" class="text-gray-600 text-sm">
						揽件员：{{ pickInfo.courierName }}
					</text>
					<view class="flex items-center" v-if="pickInfo.courierPhone">
						<text class="text-gray-600 text-sm" @click="telPicker(pickInfo.courierPhone)">
							联系电话：{{ pickInfo.courierPhone }}
						</text>
						<u-icon name="phone" color="#4B5563" size="18" @click="telPicker(pickInfo.courierPhone)"
							class="ml-1" />
					</view>
				</view>
				<view v-if="pickInfo && pickInfo.pickUpCode" class="mt-2">
					<text class="text-gray-800 font-medium">取件码：{{ pickInfo.pickUpCode }}</text>
				</view>
			</view>

			<!-- 快递公司信息 -->
			<view class="flex items-center" v-show="form.orderInfo && form.orderInfo.delivery_arry">
				<image :src="img(form.orderInfo?.delivery_arry?.logo)" mode="aspectFill"
					class="w-10 h-10 rounded-full" />
				<view class="ml-3">
					<view class="text-gray-800">
						{{ form.orderInfo?.delivery_arry?.name }}
					</view>
					<view class="flex items-center">
						<view class="text-gray-500 text-xs mt-1" @click="copy(form.orderInfo?.delivery_id)">
							{{ form.orderInfo?.delivery_id || '暂无单号' }}
						</view>
						<view class="ml-2" v-if="form.orderInfo?.delivery_id">
							<view class="text-primary text-xs mt-1" @click="copy(form.orderInfo?.delivery_id)">复制</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 物流轨迹 -->
		<view v-if="form.orderInfo?.delivery_id" class="bg-white rounded-lg shadow-sm mx-3 mt-3 p-4 mb-20">
			<view class="p-2" v-if="deliveryInfo && deliveryInfo.length > 0">
				<u-steps dot="true" direction="column">
					<u-steps-item v-for="(item, index) in deliveryInfo" :key="index" :title="item.desc"
						:desc="item.time" />
				</u-steps>
			</view>
			<view v-else class="text-center flex flex-col items-center">
				<view class="text-gray-500 text-sm text-center py-2">暂无物流信息</view>
				<view class="text-gray-400 text-xs text-center flex flex-wrap w-[300rpx]">若长期未更新，请前往对应平台官网查询或联系客服查询
				</view>
			</view>
		</view>
	</view>
	<tabbar addon="tk_jhkd" />
	<pay ref="payRef" @close="payLoading = false"></pay>
</template>

<script setup lang="ts">
import {
	ref,
	reactive
} from 'vue'
import {
	onLoad
} from '@dcloudio/uni-app'
import {
	getOrderDetail, applyRefund, deleteOrder, getDeliveryInfo, closeOrder
} from '@/addon/tk_jhkd/api/order'
import {
	goback, goto
} from '@/addon/tk_jhkd/utils/ts/goto';
import {
	timeChange
} from '@/addon/tk_jhkd/utils/ts/common';
import { img, copy } from '@/utils/common'
const payRef = ref(null)
const payLoading = ref(false)
const form = reactive({})
const deliveryInfo = ref()
const pickInfo = ref()
const clickbut = (action) => {
	if (action == 'gopay') {
		gopay()
	}
	if (action == 'del') {
		del()
	}
	if (action == 'refund') {
		refund()
	}
	if (action == 'close') {
		close()
	}
}
//联系快递
const telPicker = (phone) => {
	uni.makePhoneCall({
		phoneNumber: phone
	});
}
//关闭
const close = async () => {
	await closeOrder(form.id)
	goto('/addon/tk_jhkd/pages/orderlist')
}
//删除
const del = async () => {
	await deleteOrder(form.id)
	goto('/addon/tk_jhkd/pages/orderlist')
}
//退款
const refund = async () => {
	let params: object = {
		id: form.id,
		close_reason: '用户主动退款'
	};
	await applyRefund(params)
	goto('/addon/tk_jhkd/pages/orderlist')
}
//评价
const evaluate = () => {
	console.log('evaluate')
}
//再来一单
const again = () => {
	console.log('again')
}
const gopay = () => {
	payLoading.value = true
	payRef.value?.open(form.payInfo.trade_type, form.payInfo.trade_id, '/tk_jhkd/pages/orderdetail?id=' + form.id)
}
const getTrance = async (deliveryid) => {
	const data = await getDeliveryInfo(deliveryid)
	deliveryInfo.value = data.data
}
const getData = async (id: number) => {
	const data = await getOrderDetail(id)
	if (data.data.order_status_arr == null) {
		uni.$u.toast('订单不存在或删除')
		setTimeout(function () {
			goto('/addon/tk_jhkd/pages/orderlist');
		}, 1000);
	}
	Object.assign(form, data.data)
	if (form.orderInfo.delivery_id) {
		getTrance(form.orderInfo.delivery_id)
	}
	if (form.orderInfo.courier_context) {
		pickInfo.value = JSON.parse(form.orderInfo.courier_context)
	}
}
onLoad((options: any) => {
	if (options.id) {
		getData(options.id)
	}
})
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

.order-num-card {
	background-color: rgba(0, 85, 255, 0);
	padding: 12rpx;
	border-radius: 8rpx;
}
</style>