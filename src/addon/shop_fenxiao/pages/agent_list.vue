<template>
	<view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()">
		<block v-if="!loading">
			<view class="flex items-center wrap-bg p-[50rpx]">
				<image class="w-[90rpx] h-[90rpx] rounded-full mr-[20rpx]" v-if="detail.member && detail.member.headimg" :src="img(detail.member.headimg)" mode="aspectFill"></image>
				<image class="w-[90rpx] h-[90rpx] rounded-full mr-[20rpx]" v-else :src="img('addon/shop_fenxiao/index/head.png')" mode="aspectFill"></image>
				<view class="flex flex-col">
					<view class="flex items-center">
						<text class="truncate text-[#fff] max-w-[380rpx] mr-[10rpx] text-[28rpx]">{{detail.member.nickname || detail.member.username}}</text>
						<text class="text-[#fff] text-[24rpx] border-[2rpx] border-solid border-[#fff] px-[6rpx] py-[8rpx] whitespace-nowrap" v-if="detail.agent_level">{{detail.agent_level.name}}</text>
					</view>
					<text class="text-[#fff] text-[24rpx] mt-[14rpx]" v-if="detail.agent_level">享{{Number(detail.agent_level.discount)}}折优惠</text>
					<text class="text-[#fff] text-[24rpx] mt-[14rpx]" v-else>您还不是渠道代理商</text>
				</view>
			</view>
			<view class="bg-[#fff] sticky top-[0] z-10">
				<view class="flex whitespace-nowrap justify-around">
					<view :class="['text-center justify-center flex flex-1 h-[90rpx] mx-[60rpx] items-center border-0 border-b-[2rpx] border-solid border-[transparent]', {'!border-[var(--primary-color)] text-[var(--primary-color)]': isSettlement == 1}]" @click="tabChange(1)">
						<text class="text-[28rpx]">已结算</text>
						<text class="text-[28rpx]">({{moneyFormat(agentStat.agent_commission)}})</text>
					</view>
					<view :class="['text-sm text-center justify-center flex flex-1 h-[90rpx] mx-[60rpx] items-center border-0 border-b-[2rpx] border-solid border-[transparent]', {'!border-[var(--primary-color)] text-[var(--primary-color)]': isSettlement == 0}]" @click="tabChange(0)">
						<text class="text-[28rpx]">待结算</text>
						<text class="text-[28rpx]">({{moneyFormat(agentStat.unsettlement)}})</text>
					</view>
				</view>
			</view>
			
			<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="getData">
				<view class="ranking-list bg-[#fff] rounded-[16rpx] mx-[24rpx] mt-[24rpx]" v-for='(item,index) in list' :key="index">
					<view class="bg-[#fff] rounded-[10rpx] p-[30rpx] mb-[18rpx]">
						<view class="flex items-center justify-between text-[28rpx]">
							<text>订单号：{{item.order_no}}</text>
							<text class="text-[var(--primary-color)]">{{item.is_settlement?'已结算':'未结算'}}</text>
						</view>
						<view class="flex pt-[40rpx]">
							<image v-if="item.order_goods && item.order_goods.goods_image_thumb_mid" class="w-[160rpx] h-[160rpx] rounded-[10rpx]" :src="img(item.order_goods.goods_image_thumb_mid)" mode="aspectFill"/>
							<image v-else class="w-[160rpx] h-[160rpx] rounded-[10rpx]" :src="img('addon/shop_fenxiao/index/commission_rank.png')" mode="aspectFill"/>
							<view class="flex flex-1 flex-col ml-[20rpx]">
								<view class="text-[28rpx] leading-[1.5]">
									<text>{{item.order_goods.goods_name.length>21?item.order_goods.goods_name.substr(0,21)+'...':item.order_goods.goods_name}}</text>
									<view class="text-[#999] ml-[10rpx] inline-block whitespace-nowrap">
										<view class="flex items-center">
											<text>(购买人：</text>
											<view class="max-w-[120rpx] truncate">{{ item.shop_order.member.nickname||'-' }}</view>
											<text>)</text>
										</view>
									</view>
								</view>
								<view class="text-[var(--primary-color)] font-bold mt-[20rpx] text-[28rpx]">
									￥{{moneyFormat(item.order_goods.goods_money)}}
								</view>
								<view class="mt-[20rpx] text-[24rpx] text-[#999]" v-if="item.order_goods && item.order_goods.status != 1 && item.order_goods.status_name">
									{{t('refundStatus')}}{{item.order_goods.status_name}}
								</view>
							</view>
						</view>
						<view class="flex items-center justify-between mt-[40rpx] flex-wrap">
							<view class="flex items-center text-[24rpx]">
								<text>折扣：</text>
								<view class="text-[var(--primary-color)]">
									{{parseFloat(item.agent_discount)}}折
								</view>
							</view>
							<view class="text-[24rpx] flex items-center">
								<text>计算价：</text>
								<text class="text-[var(--primary-color)]">{{moneyFormat(item.order_original_goods_money)||'0.00'}}</text>
							</view>
							<view class="text-[24rpx] flex items-center">
								<text>佣金：</text>
								<text class="text-[var(--primary-color)]">{{moneyFormat(item.commission)||'0.00'}}</text>
							</view>
						</view>
					</view>
				</view>
				<mescroll-empty :option="{'icon': img('static/resource/images/empty.png')}" v-if="!list.length && !tableLoading"></mescroll-empty>
			</mescroll-body>
		</block>
		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
	</view>
</template>

<script setup lang="ts">
	import { redirect, img, moneyFormat } from '@/utils/common';
	import { onLoad, onShow, onPageScroll, onReachBottom } from '@dcloudio/uni-app'
	import {ref, reactive} from 'vue'
	import { t } from '@/locale'
	import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue'
	import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue'
	import useMescroll from '@/components/mescroll/hooks/useMescroll.js'
	import { getAgentOrder, getAgentStat } from '@/addon/shop_fenxiao/api/agent';
	import { getFenxiaoDetail } from '@/addon/shop_fenxiao/api/fenxiao';

    const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);
	
	let list = ref([]);
	let detail = ref({member:{}});
	let agentStat = ref({});
	let loading = ref<boolean>(true);
	let tableLoading = ref<boolean>(true);

	const getFenxiaoDetailFn = ()=>{
		loading.value = true;
		getFenxiaoDetail().then((res : any) => {
			detail.value = res.data;
			loading.value = false;
		}).catch(() => {
			loading.value = false;
		});
	}
	getFenxiaoDetailFn();
	
	const getData = (mescroll) => {
		let data: object = {
			is_settlement: isSettlement.value,
			page: mescroll.num,
			limit: mescroll.size,
		};
		tableLoading.value = true;
		getAgentOrder(data).then((res) => {
			let newArr = (res.data.data as Array<Object>);
			//设置列表数据
			if (mescroll.num == 1) {
				list.value = []; //如果是第一页需手动制空列表
			}
			list.value = list.value.concat(newArr);
			tableLoading.value = false;
			mescroll.endSuccess(newArr.length);
		}).catch(() => {
			tableLoading.value = false;
			mescroll.endErr(); // 请求失败, 结束加载
		})
	}
	
	// 统计
	const getAgentStatFn = () => {
		getAgentStat().then((res) => {
			agentStat.value = res.data;
		})
	}
	getAgentStatFn();
	
	let isSettlement = ref(1)
	const tabChange = (data)=>{
		isSettlement.value = data;
		list.value = [];
		getMescroll().resetUpScroll();
		getAgentStatFn();
	}
</script>

<style lang="scss" scoped>
	.class-select{
		background-color: var(--primary-color);
		color: #fff;
	}
	.wrap-bg{
		background: linear-gradient(to right, var(--primary-color) 40%, var(--primary-color-dark) 90%);
	}
	.mescroll-body{
		min-height: calc(100vh - 350rpx) !important;
	}
</style>