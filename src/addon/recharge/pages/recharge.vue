<template>
    <view :style="themeColor()">
        <view class="overflow-hidden bg-[#F5F6FA] min-h-[100vh] px-[30rpx]" v-show="!loading">
			<view class="h-[200rpx] box-border pt-[46rpx] pl-[40rpx] mt-[20rpx] rounded-[16rpx]  bg-gradient-to-r from-[#FB7939] to-[#FE120E]" :style="{backgroundImage: 'url(' + img('static/resource/images/member/point/mask_group.png') + ') ',backgroundSize: '100% 100%',backgroundRepeat: 'no-repeat'}">
				<view class="leading-[36rpx] text-[#ffffff] text-[26rpx]">当前余额(元)</view>
				<view class="leading-[68rpx] text-[#ffffff] text-[56rpx] mt-[8rpx]"  v-if="info">{{info ? moneyFormat(info.balance) : 0.00}}</view>
			</view>
			
            <view class="mt-[30rpx] px-[20rpx] py-[30rpx] box-border bg-[#fff] rounded-lg">
				<view class="flex items-center pb-[8rpx] border-0 border-b-[2rpx] border-solid border-[#BBBBBB]">
					<view class="text-[30rpx] text-[#333]  leading-[1] iconfont iconrenminbiV6xx"></view>
                    <input type="digit" class="h-[76rpx] leading-[76rpx] font-bold pl-[10rpx] flex-1  text-[48rpx] bg-[#fff]" v-model="rechargeAmount" maxlength="7" :placeholder="rechargeAmount?'':t('customRechargeAmount')" placeholder-class="apply-price"  :adjust-position="false"/>
				</view>
                <view class="top-up-wrap flex flex-wrap justify-around">
                    <view v-for="(item,index) in rechargePackage" :key="index"
                        :class="['flex justify-center items-center w-[180rpx] h-[88rpx] box-border border-1 text-center rounded-[16rpx] mt-[30rpx] border-[#BBBBBB] border-solid',{'border-none text-white':rechargeAmount == item}]"
						:style="{'background': rechargeAmount == item?'linear-gradient( 283deg, #FD3923 11%, #FF7630 100%), #FFFFFF':''}"
                        @click="rechargeAmount = item">
							<view class="flex items-baseline">
								<text class="text-[34rpx] font-bold leading-[42rpx]">{{item}}</text>
								<text class="text-[20rpx] ml-[6rpx] font-normal leading-[28rpx]">{{t('yuan')}}</text>
							</view>
                    </view>
                </view>
            </view>
			
			<view class="fixed bottom-[60rpx] left-0 right-0 px-[30rpx]">
				<u-button :text="t('confirm')" :customStyle="{background: 'linear-gradient( 94deg, #FB7939 0%, #FE120E 99%), #EF000C', height:'88rpx',lineHeight:'88rpx',color:'#fff',fontSize:'32rpx',border:'none'}"  shape="circle" :loading="rechargeLoading" @click="recharge" ></u-button>
				<view class="mt-[20rpx] text-center text-[26rpx]  text-[#EF000C]" @click="redirect({ url: '/addon/recharge/pages/recharge_record' })">
				    {{t('rechargeRecord')}}
				</view>
			</view>
            <pay ref="payRef" @close="rechargeLoading = false"></pay>
        </view>
        <u-loading-page :loading="loading"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
    import { ref, computed} from 'vue'
    import { t } from '@/locale'
    import { redirect, img, debounce, moneyFormat } from '@/utils/common'
    import { createRecharge } from '@/addon/recharge/api/recharge'
    import { useSubscribeMessage } from '@/hooks/useSubscribeMessage'
	import useMemberStore from '@/stores/member'

    const rechargePackage = ref([20, 30, 50, 100, 200, 300])
    const rechargeAmount = ref<string | number>("");
    const rechargeLoading = ref(false)
    const payRef = ref(null)
    const loading = ref(false);
	
	// 账户金额
	const memberStore = useMemberStore();
	const info = computed(() => memberStore.info)
	
    /**
     * 发起充值
     */
    const recharge = debounce(() => {
        if (uni.$u.test.isEmpty(rechargeAmount.value)) {
            uni.showToast({title: t('customRechargeAmount'), icon: 'none'})
            return
        }
        if (!uni.$u.test.amount(rechargeAmount.value) || rechargeAmount.value <= 0) {
            uni.showToast({title: t('rechargeAmountError'), icon: 'none'})
            return
        }
        if (rechargeLoading.value) return
        rechargeLoading.value = true

        createRecharge({recharge_money: rechargeAmount.value}).then((res:any) => {
            useSubscribeMessage().request('recharge_success')
            payRef.value?.open(res.data.trade_type, res.data.trade_id,'/app/pages/member/index')
            loading.value = false
            rechargeLoading.value = false
        }).catch(() => {
            rechargeLoading.value = false
            loading.value = false
        })
    })
</script>

<style lang="scss" scoped>

:deep(.apply-price){
    color:#999;
    font-size: 30rpx;
    font-weight: normal;
    line-height: 76rpx;
}
</style>
