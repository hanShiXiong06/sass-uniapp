<template>
	<view class="bg-[#f6f6f6] min-h-[100vh]" :style="themeColor()" v-if="Object.values(repeatFlag).every((el) => el)">
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
				<image class="w-[100vw] min-h-[100%] h-[100%]" mode="widthFix" :src="img(config.apply_head || '')"></image>
				<view class="bg-[#fff] relative mx-[30rpx] mt-[-68rpx] rounded-[16rpx] h-[100rpx] flex justify-between items-center px-[30rpx]">
					<text class="text-[30rpx]">{{t('referrer')}}</text>
					<text class="text-[26rpx] text-[#666]">{{ info.bindFenxiaoMember ? info.bindFenxiaoMember.nickname : t('notHave') }}</text>
				</view>
				
				<view class="bg-[#FFFFFF] z-10 rounded-[16rpx] mt-[20rpx] p-[30rpx] box-border mx-[30rpx]" v-if="['1','2','3'].indexOf(config.fenxiao_condition) > -1">
					<block v-if="config.fenxiao_condition === '1'">
						<view class="flex items-center">
							<image class="w-[32rpx] h-[32rpx]" :src="img('addon/shop/apply/tiaojian.png')"></image>
							<view class="text-[30rpx] text-[#333333] box-border relative ml-[10rpx] leading-[42rpx] font-medium	">申请条件</view>
						</view>
						<view class="text-[26rpx] text-[#666] pt-[20rpx] font-light">
							累计消费<text class="price-font mx-[5rpx]">{{ config.consume_count }}</text>次
						</view>
						<view class="flex items-center mt-[40rpx]">
							<image class="w-[32rpx] h-[32rpx]" :src="img('addon/shop/apply/vector.png')"></image>
							<view class="text-[30rpx] box-border relative ml-[10rpx] pt-[4rpx]">已完成</view>
						</view>
						<view class="text-[26rpx] text-[#666] pt-[20rpx] font-light pb-[30rpx]">
							累计消费<text class="text-[32rpx] text-[var(--price-text-color)] price-font mx-[5rpx]">{{ config.order_count }}</text>次
						</view>
					</block>
					<block v-if="config.fenxiao_condition === '2'">
						<view class="flex items-center">
							<image class="w-[32rpx] h-[32rpx]" :src="img('addon/shop/apply/tiaojian.png')"></image>
							<view class="text-[30rpx] text-[#333333] box-border relative ml-[10rpx] leading-[42rpx]">申请条件</view>
						</view>
						<view class="text-[26rpx] text-[#666] pt-[20rpx]">
							累计消费<text class="price-font mx-[5rpx]">{{ config.consume_money }}</text>元
						</view>
						<view class="flex mt-[40rpx] items-center">
							<image class="w-[32rpx] h-[32rpx]" :src="img('addon/shop/apply/vector.png')"></image>
							<view class="text-[30rpx] box-border relative ml-[10rpx] pt-[4rpx]">已完成</view>
						</view>
						<view class="text-[26rpx] text-[#666] pt-[20rpx]">
							累计消费<text class="text-[32rpx] text-[var(--price-text-color)] price-font mx-[5rpx]">{{config.order_sum}}</text>元
						</view>
					</block>
					<block v-if="config.fenxiao_condition === '3'">
						<view class="flex items-center justify-between">
							<view class="flex items-center">
								<image class="w-[32rpx] h-[32rpx]" :src="img('addon/shop/apply/tiaojian.png')"></image>
								<view class="text-[30rpx] text-[#333333] box-border relative ml-[10rpx] pt-[6rpx]">申请条件</view>
							</view>
							<view class="text-[24rpx] text-[#999]">
								已购买<text class="text-[30rpx] text-[var(--price-text-color)] price-font mx-[5rpx]">{{config.goods_sum?config.goods_sum:0}}</text>个商品
							</view>
						</view>
						<view class="mt-[24rpx] text-[24rpx] text-[#666] pb-[30rpx]">
							商品任选其一购买即可成为分销商
						</view>
						<view class="flex" :class="{'mb-[30rpx]': (Object.keys(config.goods_list).length-1) != index}" v-for="(item, key, index) in config.goods_list" :key="index"  @click.stop="toLink(item.goods_id)">
							<view class="w-[180rpx] h-[180rpx] overflow-hidden rounded-md">
								<u--image width="180rpx" height="180rpx" :src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')" model="aspectFill">
									<template #error>
										<u-icon name="photo" color="#999" size="50"></u-icon>
									</template>
								</u--image>
							</view>
							<view class="flex flex-1 flex-col justify-between py-[6rpx] ml-[20rpx]">
								<view class="multi-hidden text-[26rpx] leading-[1.3]">{{ item.goods_name }}</view>
								<view class="flex items-end justify-between">
									<view class="text-[var(--price-text-color)] price-font">
										<text class="text-[24rpx] ml-[20rpx]">￥</text>
										<text class="text-[38rpx]">{{parseFloat(moneyFormat(item.goods_sku.price)).toFixed(2).toString().split('.')[0]}}</text>
										<text class="text-[26rpx] mr-[10rpx]">.{{parseFloat(moneyFormat(item.goods_sku.price)).toFixed(2).toString().split('.')[1]}}</text>
									</view>
									<text class=" nc-iconfont nc-icon-gouwucheV6xx-2 text-[#fff] text-[28rpx] bg-[#FE4C19] h-[48rpx] w-[48rpx] text-center leading-[48rpx] rounded-[50rpx]"></text>
								</view>
							</view>
						</view>
					</block>
				</view>
				<view class="fixed btn-wrap flex justify-center flex-col bottom-[0] left-[0] right-[0] items-center bg-[#fff] py-[30rpx]">
					<view class="w-[670rpx] h-[80rpx] text-[28rpx] rounded-[44rpx] text-center"
						:class="{'bg-[#eee] border-[#DDD] border-solid border-[1rpx] leading-[78rpx]': !Number(config.is_allow_apply), 'bg-color text-[#fff] leading-[80rpx]': Number(config.is_allow_apply)}"
						:disabled="!Number(config.is_allow_apply)" @click="save">{{ Number(config.is_allow_apply) ? '申请成为分销商' : '尚未达到申请条件' }}
					</view>
					<view class="flex justify-center items-baseline mt-[20rpx]" v-if="config.is_show_apply === '1'">
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
				</view>
				<view class="pt-[170rpx]" :class="{'h-[50rpx]': config.is_show_apply === '1'}"></view>
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
						class="w-[500rpx] h-[70rpx] text-[28rpx] leading-[68rpx] rounded-[44rpx] !p-0 text-[#fff] m-0 bg-color remove-border"
						shape="circle" hover-class="none" @click="info.status = 0">重新申请</button>
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
			// 统计已购买商品数量
			if(config.value.fenxiao_condition === '3'){
				let goodsCount = 0;
				Object.values(config.value.goods_list).forEach((item,index)=>{
					if(item.is_buy){
						goodsCount = goodsCount + 1;
					}
				})
				config.value.goods_sum = goodsCount;
			}
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
	.btn-wrap{
		box-shadow: 0 -2rpx 2rpx 0 rgba(191,208,217,0.26);
	}
</style>