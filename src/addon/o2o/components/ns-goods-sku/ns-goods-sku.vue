<template>
	<view @touchmove.prevent.stop>
		<u-popup :show="goodsSkuPop" @close="closeFn" mode="bottom">
			<view class="rounded-t-[20rpx] overflow-hidden bg-[#fff] p-[32rpx] relative">
				<view class="absolute right-[37rpx]  nc-iconfont nc-icon-guanbiV6xx text-[40rpx]" @click="closeFn"></view>
				<view class="flex mb-[58rpx]">

					<view class="rounded-[8rpx] overflow-hidden">
						<u--image width="204rpx" height="204rpx" :src="img(goodsDetail.detail.sku_image)" model="aspectFill">
							<template #error>
                                <image class="w-[204rpx] h-[204rpx]" :src="img('static/resource/images/diy/shop_default.jpg')" mode="aspectFill"></image>
							</template>
						</u--image>
					</view>
					<view class="flex flex-1 flex-col justify-between ml-[20rpx]">
						<view class="w-[100%]">
							<view class=" text-[var(--price-text-color)]">
								<text class="text-[28rpx] font-bold">￥</text>
								<text class="text-[28rpx] mr-[10rpx]  font-bold">{{goodsPrice}}</text>
							</view>
						</view>
						<view class="w-[100%]"  style="max-height: calc(204rpx - 92rpx);" >
							<text class="text-[24rpx] leading-[38rpx] text-[var(--text-color-light6)] multi-hidden ">已选规格：{{goodsDetail.detail.sku_name}}</text>
						</view>
					</view>
				</view>
				<scroll-view class="h-[500rpx]" scroll-y="true">
					<view class="mb-[20rpx]">
						<view class="flex flex-wrap">
							<block v-for="(item,index) in goodsDetail.skuList" :key="index">
								<view
								class="box-border max-w-[680px] truncate  text-[24rpx] px-[15rpx] text-center  leading-[42rpx] mr-[20rpx] mb-[20rpx] border-1 border-solid rounded-[8rpx] border-[#888]"
								:class="{'!border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--primary-color-light)]': item.selected}" @click="change(item, index)">
									{{item.sku_name}}
								</view>
							</block>
						</view>
					</view>
					<view class="flex justify-between">
						<view class="text-[26rpx] leading-[36rpx] mb-[30rpx]">购买数量</view>
						<u-number-box :min="goodsDetail.min_buy"  integer :step="1" input-width="98rpx" v-model="buyNum" input-height="54rpx">
							<template #minus>
								<text class="text-[44rpx] nc-iconfont nc-icon-jianshaoV6xx text-[var(--primary-color)]" :class="{ '!text-[#c8c9cc]': buyNum === goodsDetail.min_buy }"></text>
							</template>
							<template #input>
								<text class="text-[#333] fext-[23rpx] font-500 mx-[16rpx]">{{ buyNum }}</text>
							</template>
							<template #plus>
								<text class="text-[44rpx] nc-iconfont nc-icon-tianjiaV6mm text-[var(--primary-color)]"></text>
							</template>
						</u-number-box>
					</view>
				</scroll-view>
				<u-button :text="goodsDetail.goods.status ? '确定':'已下架'" class="!h-[80rpx] !text-[30rpx] !m-0 !mt-[30rpx]"  shape="circle" :color="goodsDetail.goods.status ? 'var( --primary-color)' :'#999'" @click="confirm"></u-button>
			</view>
		</u-popup>
	</view>
</template>

<script setup lang="ts">
import { ref,  computed } from 'vue';
import { img, redirect, getToken } from '@/utils/common'
import { useLogin } from '@/hooks/useLogin'
import useMemberStore from '@/stores/member'
import { cloneDeep } from 'lodash-es'

const props = defineProps(['goodsDetail']);

const goodsSkuPop = ref(false);
const callback:any = ref(null);
const currSpec = ref({
	sku_id: '',
	name: ''
})
const buyNum = ref(1)
// 会员信息
const memberStore = useMemberStore()
const userInfo = computed(() => memberStore.info)
const open = (fn = "")=>{
	buyNum.value = props.goodsDetail.min_buy
	goodsSkuPop.value = true;
	callback.value = fn;
}
const closeFn = ()=>{
	goodsSkuPop.value = false
}

const goodsDetail = computed(() => {
	let data = cloneDeep(props.goodsDetail);

	// 重组数据结构
	if(Object.keys(data).length){
		currSpec.value.sku_id = data.sku_id
		data.skuList.map((item,index)=>{
			item.selected = false
			if(item.sku_id == currSpec.value.sku_id ){
				item.selected = true
			}
			return item
		})

		getSkuId()
		// 当前详情内容
		if(data.skuList && Object.keys(data.skuList).length){
			data.skuList.forEach((idItem, idIndex)=>{
				if(idItem.sku_id == currSpec.value.sku_id){
					data.detail = idItem
				}
			})
		}

	}
	return data;
})

// 改变选中规格
const change = (data, index)=>{
	currSpec.value.sku_id = data.sku_id
	currSpec.value.name = data.sku_name
	buyNum.value = data.min_buy
	getSkuId()
}

const emits = defineEmits(['change'])
const getSkuId = ()=>{
	props.goodsDetail.skuList.forEach((skuItem, skuIndex)=>{
		if(skuItem.sku_id == currSpec.value.sku_id){
			emits('change',skuItem.sku_id)
		}
	})
}
//提交
const confirm = ()=> {
	// 检测是否登录
	if (!userInfo.value) {
		useLogin().setLoginBack({ url: '/addon/o2o/pages/goods/detail', param: { sku_id: goodsDetail.value.sku_id } })
		return false
	}
	if (!goodsDetail.value.goods.status) {
		return false
	}
	var data = {
		sku_id: goodsDetail.value.sku_id,
		num: buyNum.value
	};

	uni.setStorage({
		key: 'o2oCreateData',
		data: {
			sku: data
		},
		success: () => {
			redirect({ url: '/addon/o2o/pages/order/payment', param: { id: goodsDetail.value.goods_id } })
		}
	});
	closeFn();
}

// 商品价格
const goodsPrice = computed(() =>{
	let price = "0.00";
	if(Object.keys(goodsDetail.value).length && Object.keys(goodsDetail.value.goods).length && goodsDetail.value.goods.member_discount && getToken()){
		price = goodsDetail.value.member_price // 会员价
	}else{
		price = goodsDetail.value.price
	}
	return parseFloat(price).toFixed(2);
})

defineExpose({
	open
})
</script>
