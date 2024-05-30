<template>
    <view class="min-h-[100vh]" :style="themeColor()">
        <template v-if="!loading">
            <view class="w-[100%] h-[500rpx] relative background-size box-border" :style="{ backgroundImage: 'url(' + img('addon/shop_fenxiao/sale-ranking.png') + ')' }"></view>
            <view class="bg-[#f8f8f8] relative z-2 rounded-tl-[20rpx] rounded-tr-[20rpx] mt-[-24rpx] py-[20rpx] px-[24rpx] h-[calc(100vh-476rpx)] flex flex-col box-border">
                <view class="bg-[#fff] rounded-[10rpx] py-[30rpx] px-[24rpx] flex">
                    <view class="w-[88rpx] h-[88rpx] flex-shrink-0 ">
                        <u--image width="88rpx" height="88rpx" :src="img(info.headimg || '')" model="aspectFill" shape="circle" class="w-[88rpx] h-[88rpx] mr-[20rpx] rounded-[50%] overflow-hidden">
                            <template #error>
                                <image class="w-[88rpx] h-[88rpx] rounded-[50%] overflow-hidden" :src="img('addon/shop_fenxiao/index/head.png')" mode="aspectFill"/>
                            </template>
                        </u--image>
                    </view>
                    <view class="flex flex-1 flex-col justify-between ml-[30px]">
                        <view class="text-[32rpx] font-600">{{ info.nickname || info.username }}</view>
                        <view class="text-[26rpx]">
                            <text class="text-[#999]">排名：</text>
                            <text class="font-600 text-[30rpx]">{{ currentRanking || '-' }}</text>
                            <text class="text-[#999] ml-[10rpx]">团队销售额: </text>
                            <text class="font-600 text-[30rpx]">￥{{ moneyFormat(info.order_money) }}</text>
                        </view>
                    </view>
                </view>
                <scroll-view class="h-[calc(100%-170rpx)] mt-[20rpx]" :scroll-y="true">
                    <view class="rounded-[10rpx] bg-[#fff]">
                        <template v-for="(item, index) in list" :key="index">
                            <view class="flex items-center p-[24rpx] pt-[54rpx]">
                                <view class="w-[35rpx] flex-shrink-0">
                                    <view class="text-center text-[40rpx] font-600" :class="{ 'text-[#F0D232]': index === 0, 'text-[#B9D1E9]': index === 1, 'text-[#EECCB5]': index === 2 }">{{ index + 1 }}</view>
                                    <view class="h-[4rpx] rounded-[2rpx] bg-[#e9e9eb] mt-[10rpx]"></view>
                                </view>
                                <view class="w-[88rpx] h-[88rpx] relative ml-[84rpx] flex-shrink-0" v-if="index < 3">
                                    <u--image width="88rpx" height="88rpx" :src="img(item.member.headimg || '')" model="aspectFill" shape="circle" class="w-[88rpx] h-[88rpx] rounded-[50%] absolute z-10 right-[4rpx] bottom-[4rpx]">
                                        <template #error>
                                            <image class="w-[88rpx] h-[88rpx] rounded-[50%]" :src="img('addon/shop_fenxiao/index/head.png')" mode="aspectFill"></image>
                                        </template>
                                    </u--image>
                                    <image class="w-[120rpx] h-[120rpx] absolute z-5 right-0 bottom-0" :src="img(`addon/shop_fenxiao/ranking${index + 1}.png`)" mode="widthFix"/>
                                </view>
                                <view class="w-[88rpx] h-[88rpx] ml-[84rpx]" v-else>
                                    <image class="w-[88rpx] h-[88rpx] rounded-[50%]" :src="img(item.member.headimg || '')" mode="aspectFill"/>
                                </view>
                                <view class="text-[26rpx] font-600 ml-[24rpx] flex-1">{{ item.member.nickname || item.member.username }}</view>
                                <view class="text-[30rpx] font-600 ml-[24rpx]">￥{{ moneyFormat(item.order_money) }}</view>
                            </view>
                        </template>
                    </view>
                </scroll-view>
            </view>
        </template>
        <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
    </view>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { img ,moneyFormat } from '@/utils/common';
import { onLoad } from '@dcloudio/uni-app'
import { getSaleMemberInfo, getSaleRanking } from '@/addon/shop_fenxiao/api/sale'

const info: Record<string, any> = ref({})
const list = ref<Array<any>>([])
onLoad((option: any) => {
    getSaleMemberInfoFn(Number(option.id))
    getSaleRankingFn(Number(option.id))
})
let loading = ref<boolean>(true);//页面加载动画
const getSaleMemberInfoFn = (id: number) => {
    getSaleMemberInfo(id).then((res: any) => {
        info.value = res.data.member
        info.value.order_money = res.data.order_money
        info.value.currentRanking = 0
    }).catch(() => {
        loading.value = false
    })
}
const getSaleRankingFn = (id: number) => {
    getSaleRanking(id).then((res: any) => {
        list.value = res.data
        loading.value = false
    }).catch(() => {
        loading.value = false
    })
}
const currentRanking = computed(() => {
    let data = null
    list.value.forEach((el: any, index: number) => {
        if (el.member.member_id === info.value.member_id) data = index + 1
    })
    return data
})
</script>
<style lang="scss" scoped>
.background-size {
    background-size: 100% 100%;
}</style>