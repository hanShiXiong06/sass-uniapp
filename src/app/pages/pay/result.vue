<template>
    <view :style="themeColor()">
        <view class="w-screen h-screen flex flex-col items-center" v-if="payInfo">
            <view class="flex-1 flex flex-col items-center w-full pt-[100rpx]">
                <text class="iconfont text-2xl" :class="payInfo.status==2  ? 'text-primary iconduigou' :  payInfo.status == 3 ? 'iconduigou text-green' : 'iconzhifushibai text-red'"></text>
                <view class=" text-sm" >{{ payInfo.status == 2 ?  t('pay.paySuccess') :   payInfo.status == 3 ? '待审核' :  t('pay.payFail') }} </view>
                <view class=" text-sm" v-if="payInfo.status == 3">请在15分钟内 扫描二维码 联系客服并付款</view>
              <view class="text-center flex justify-center" >
                <up-image :show-loading="true" :src="kefu_url" width="64px" height="64px" ></up-image>
              </view>
                <view class="text-xl font-bold pt-[30rpx]">
                    <text class="text-base">{{ t('currency') }}</text>
                    <text>{{ moneyFormat(payInfo.money) }}</text>
                </view>
            </view>
            <view class="pb-[200rpx] w-[240rpx]">
                <u-button type="primary" :text="payInfo.status == 2 ? t('complete') : t('close')" :plain="true" @click="complete"></u-button>
            </view>
        </view>
        <u-modal :show="loading" :showCancelButton="true" :confirmText="t('pay.completePay')" :cancelText="t('pay.incompletePay')" @cancel="complete">
            <view class="py-[20rpx]">
                <u-loading-icon :text="t('pay.getting')" textSize="16" mode="circle" :vertical="true"></u-loading-icon>
            </view>
        </u-modal>
    </view>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import { getPayInfo as getPayInfoApi } from '@/app/api/pay'
    import { t } from '@/locale'
    import { redirect, moneyFormat } from '@/utils/common'
    import { getFirstPage } from '@/utils/pages'

    const payInfo = ref<AnyObject | null>(null)
    const loading = ref(false)
    let tradeType = ''
    let tradeId = 0
    let requestNum = 0

    onLoad((data : any) => {
        tradeType = data.trade_type
        tradeId = data.trade_id
        getPayInfo()
    })
    // 获取客服 的 二维码地址 从 payInfo中
    const kefu_url = ref('')

    /**
     * 获取支付信息
     */
    const getPayInfo = () => {
        getPayInfoApi(tradeType, tradeId).then((res: responseResult) => {
            if (!uni.$u.test.isEmpty(res.data)) {
                if (res.data.status == 1 && requestNum < 5) {
                    loading.value = true
                    requestNum++
                    setTimeout(() => {
                        getPayInfo()
                    }, 1000)
                    return
                }
                payInfo.value = res.data
                loading.value = false
                uni.setNavigationBarTitle({
                    title: payInfo.value.status == 2 ? t('pay.paySuccess') : t('pay.payFail')
                })
              res.data.pay_type_list.some((item) => {
                if (item.name === '线下支付') {
                  kefu_url.value = item.config.collection_desc
                  return true
                }
                return false
              })

            }
        }).catch(() => {

        })
    }

    const complete = () => {
        const payReturn = decodeURIComponent(uni.getStorageSync('payReturn'))
        if (payReturn) redirect({ url: payReturn, mode: 'reLaunch' })
        else redirect({ url: getFirstPage(), param: { code: payInfo.value?.out_trade_no }, mode: 'reLaunch' })
    }

</script>

<style lang="scss" scoped></style>
