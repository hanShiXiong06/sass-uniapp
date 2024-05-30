<template>
	<view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()" v-if="Object.values(repeatFlag).every((el) => el)">
		<block v-if="config.is_fenxiao == '0'">
			<view class="flex flex-col items-center pt-[100rpx]">
				<view class="w-[300rpx] h-[200rpx]">
					<image class="w-[300rpx] h-[200rpx]" mode="aspectFit" :src="img('addon/shop_fenxiao/unopened-fenxiao.png')"></image>
				</view>
				<view class="mt-[40rpx] text-[24rpx]">{{t('fenxiaoNotOpen')}}</view>
			</view>
		</block>
		<block v-else-if="config.apply_type == 3">
			<view class="flex flex-col items-center pt-[100rpx]">
				<view class="w-[300rpx] h-[200rpx]">
					<image class="w-[300rpx] h-[200rpx]" mode="aspectFit" :src="img('addon/shop_fenxiao/unopened-fenxiao.png')"></image>
				</view>
				<view class="mt-[40rpx] text-[24rpx]">请联系客服成为分销商</view>
			</view>
		</block>
		<block v-else>
			<block v-if="info.status === 0 && Object.keys(config).length && config.apply_type != '3'">
				<u--image width="100%" height="337rpx" :src="img(config.apply_head || '')" model="aspectFit"></u--image>
				<view class="bg-[#fff] w-[694rpx] relative z-10 mx-auto py-[40rpx] px-[30rpx] box-border mt-[-28rpx] rounded-[10rpx]">
					<view class="flex justify-between border-[#E2E2E2] border-0 border-b-[1rpx] border-solid pb-[20rpx]">
						<text class="text-[26rpx]">{{t('referrer')}}</text>
						<text class="text-[26rpx]">{{ info.bindFenxiaoMember ? info.bindFenxiaoMember.nickname : t('notHave') }}</text>
					</view>
					<view class="flex justify-center items-start mt-[30rpx]" v-if="config.is_show_apply === '1'">
						<u-checkbox-group>
							<u-checkbox activeColor="var(--primary-color)" :checked="isAgree" shape="shape" size="14" @change="agreeChange" :customStyle="{ 'marginTop': '4rpx' }" />
						</u-checkbox-group>
						<view class="text-xs text-gray-400 flex flex-wrap">
							我已阅读并了解
							<view @click="redirect({ url: '/app/pages/auth/agreement?key=fenxiao_service' })">
								<text class="text-primary">《分销申请协议》</text>
							</view>
						</view>
					</view>
					<button
						class="w-full h-[70rpx] mt-[28rpx] text-[30rpx] leading-[70rpx] text-[#fff] m-0 rounded-[8rpx] bg-color remove-border"
						shape="circle" :disabled="!Number(config.is_allow_apply)" @click="save"
						hover-class="none">{{ Number(config.is_allow_apply) ? '申请成为分销商' : '您尚未达到申请分销商条件' }}</button>
				</view>
				<view class="w-[694rpx] mx-auto px-[28rpx] box-border mt-[24rpx]">
					<block v-if="config.fenxiao_condition === '1'">
						<view class="text-[26rpx] box-border pl-[20rpx] relative apply-message-title">成为分销商条件</view>
						<view class="py-[20rpx] text-[22rpx] text-[#909399] leading-[1.2]">
							申请成为分销商,需要您的消费次数达到{{ config.consume_count }}次，{{ !Number(config.is_allow_apply) ? `您已消费${config.order_count}次` : '您已满足申请成为分销商条件' }}
						</view>
					</block>
					<block v-if="config.fenxiao_condition === '2'">
						<view class="text-[26rpx] box-border pl-[20rpx] relative apply-message-title">成为分销商条件</view>
						<view class="py-[20rpx] text-[22rpx] text-[#909399] leading-[1.2]">
							申请成为分销商,需要您的消费金额达到{{ config.consume_money }}元，{{ !Number(config.is_allow_apply) ? `您已消费${moneyFormat(config.order_sum)}元` : '您已满足申请成为分销商条件' }}
						</view>
					</block>
				</view>
				<view v-if="config.fenxiao_condition === '3'"
					class="bg-[#fff] w-[694rpx] relative z-10 mx-auto p-[28rpx] box-border mt-[24rpx] rounded-[10rpx]">
					<view class="text-[26rpx] box-border pl-[20rpx] relative apply-message-title">成为分销商条件</view>
					<view class="p-[20rpx] bg-[#f9f9f9] text-[22rpx] my-[20rpx] leading-[1.2]">
						申请成为分销商,需要购买以下指定商品(任选其一)<text v-if="Number(config.is_allow_apply)">,您已满足申请成为分销商条件</text>
					</view>
					<view>
						<view class="flex py-[20rpx] border-[#E2E2E2] border-0 border-b-[1rpx] border-solid" v-for="(item, index) in config.goods_list" :key="index">
							<view class="w-[168rpx] h-[168rpx] overflow-hidden mr-[8rpx] rounded-md">
								<u--image width="168rpx" height="168rpx" :src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')" model="aspectFill">
									<template #error>
										<u-icon name="photo" color="#999" size="50"></u-icon>
									</template>
								</u--image>
							</view>
							<view class="flex flex-1 flex-col justify-between">
								<view><text class="text-[26rpx]">{{ item.goods_name }}</text></view>
								<view class="flex items-end justify-between">
									<view class="text-[var(--price-text-color)] price-font">
										<text class="text-[20rpx]">￥</text>
										<text class="text-[28rpx] mr-[10rpx]">{{ moneyFormat(item.goods_sku.price) }}</text>
									</view>
									<view class="h-[44rpx] relative">
										<text class="text-[#fff] bg-color h-[44rpx] text-[28rpx] px-[10px] leading-[44rpx] rounded-[22rpx]" @click.stop="toLink(item.goods_id)">
											购买
										</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
			<block v-if="info.status === 1">
				<view class="flex flex-col items-center">
					<view class="w-[500rpx] h-[500rpx]">
						<u--image width="500rpx" height="500rpx" :src="img('addon/shop_fenxiao/fenxiao.png')" model="aspectFill" />
					</view>
					<view class="text-[24rpx]">您已提交分销商申请，等待平台审核</view>
				</view>
			</block>
			<block v-if="info.status === 3">
				<view class="flex flex-col items-center">
					<view class="w-[500rpx] h-[500rpx]">
						<u--image width="500rpx" height="500rpx" :src="img('addon/shop_fenxiao/no-fenxiao.png')" model="aspectFill" />
					</view>
					<view class="mt-[40rpx] text-[24rpx] mb-[24rpx] text-[#999]">您提交的分销商申请已被拒绝</view>
					<view class=" text-[24rpx] mb-[24rpx] text-[#666]">拒绝原因：{{ info.refuse_reason }}</view>
					<button
						class="w-[160rpx] h-[60rpx] text-[24rpx] leading-[60rpx] !p-0 text-[#fff] m-0 rounded-[8rpx] bg-color remove-border"
						shape="circle" @click="info.status = 0">重新申请</button>
				</view>
			</block>
		</block>
		<!-- <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" fontSize="16" color="#303133"></u-loading-page> -->
	</view>
</template>
<script lang="ts" setup>
	import { ref } from 'vue'
	import { img, redirect, moneyFormat } from '@/utils/common';
	import { t } from '@/locale'
	import { onShow } from '@dcloudio/uni-app'
	import { getMemberInfo, getConfig, applyInfo, getCheck, apply } from '@/addon/shop_fenxiao/api/fenxiao'

	const config : Record<string, any> = ref({})
	const info : Record<string, any> = ref({})
	// const loading = ref<boolean>(true)
	const isAgree = ref<boolean>(false)
	const repeatFlag : Record<string, any> = ref({
		memberInfo: false,
		applyInfo: false,
		config: false,
		check: false
	})

	const getMemberInfoFn = () => {
		getMemberInfo().then((res : any) => {
			info.value = Object.assign(info.value, res.data)
			if (info.value.is_fenxiao) {
				redirect({ url: '/addon/shop_fenxiao/pages/index', mode: 'redirectTo', param: {} })
			}
			repeatFlag.value.memberInfo = true
		}).catch(() => {
			repeatFlag.value.memberInfo = true
		})
	}

	const applyInfoFn = () => {
		applyInfo().then((res : any) => {
			info.value.status = res.data.status || 0
			if (info.value.status === 3) info.value.refuse_reason = res.data.refuse_reason || ''
			repeatFlag.value.applyInfo = true
		}).catch(() => {
			repeatFlag.value.applyInfo = true
		})
	}
	const getConfigFn = () => {
		getConfig().then((res : any) => {
			config.value = Object.assign(config.value, res.data.fenxiao_config)
			if (config.value.is_show_apply != '1') isAgree.value = true
			repeatFlag.value.config = true
		}).catch(() => {
			repeatFlag.value.config = true
		})
	}
	const getCheckFn = () => {
		getCheck().then((res : any) => {
			config.value = Object.assign(config.value, res.data.condition_data)
			config.value.is_allow_apply = res.data.is_allow_apply
			repeatFlag.value.check = true
		}).catch(() => {
			repeatFlag.value.check = true
		})
	}
	onShow(() => {
		repeatFlag.value = {
			memberInfo: false,
			applyInfo: false,
			config: false,
			check: false
		}
		config.value = {}
		info.value = {}
		getMemberInfoFn()
		applyInfoFn()
		getConfigFn()
		getCheckFn()
	})
	const agreeChange = () => {
		isAgree.value = !isAgree.value
	}
	const lock = ref<boolean>(false)
	const save = () => {
		if (!isAgree.value) {
			uni.showToast({ title: '请阅读并同意《分销申请协议》', icon: 'none' })
			return false
		}
		if (lock.value) return false
		lock.value = true
		apply().then((res) => {
			lock.value = false
			repeatFlag.value = {
				memberInfo: false,
				applyInfo: false,
				config: false,
				check: false
			}
			config.value = {}
			info.value = {}
			getMemberInfoFn()
			applyInfoFn()
			getConfigFn()
			getCheckFn()
		}).catch(() => {
			lock.value = false
		})
	}
	const toLink = (goods_id : string) => {
		redirect({ url: '/addon/shop/pages/goods/detail', param: { goods_id } })
	}
</script>
<style lang="scss" scoped>
	.remove-border{
		&::after{
			border: none;
		}
	}
	.bg-color {
		background-color: var(--primary-color);
	}

	.apply-message-title::before {
		content: "";
		display: block;
		position: absolute;
		width: 3px;
		height: 100%;
		left: 0;
		top: 0;
		border-radius: 6rpx;
		z-index: 10;
		background-color: var(--primary-color);
	}
</style>