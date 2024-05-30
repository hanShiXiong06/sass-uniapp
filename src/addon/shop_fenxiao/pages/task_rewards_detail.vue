<template>
    <view class="bg-[#fff] min-h-[100vh]" :style="themeColor()">
        <mescroll-body ref="mescrollRef" top="110rpx" :down="{ use: false }" @init="mescrollInit" @up="getTaskRecordFn">
            <view class="flex fixed top-0 left-0 right-0 z-10 whitespace-nowrap justify-around mb-[20rpx]" v-if="!lastLoading">
                <view :class="['text-[28rpx] leading-[90rpx] font-bold', { 'class-select': status === item.value }]" @click="statusSearchFn(item.value)" v-for="(item, index) in statusList">{{ item.label }}</view>
            </view>
            <template v-for="(item, index) in data">
                <view class="flex py-[30rpx] box-border border-0 border-solid border-[#ddd] mx-[24rpx] border-b-[1rpx]">
                    <view class="flex-1 flex flex-col justify-between">
                        <view class="text-[26rpx] font-600">{{ item.is_send ? '已发放' : '待发放' }}</view>
                        <view v-if="item.is_send" class="text-[24rpx] text-[#999]">已于 {{ item.send_time }} 发放该奖励
                        </view>
                        <view v-else class="text-[24rpx] text-[#999]">预计于 {{ timeStampTurnTime(item.send_timer) }} 发放该奖励</view>
                    </view>
                    <view class="text-[35rpx] font-600 text-[var(--price-text-color)] h-[100rpx] leading-[100rpx]">
                        +{{ moneyFormat(item.reward_money) }}
                    </view>
                </view>
            </template>
            <mescroll-empty :option="{ 'icon': img('static/resource/images/empty.png') }" v-if="!data.length && !loading"></mescroll-empty>
        </mescroll-body>
    </view>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { img, timeStampTurnTime, moneyFormat } from '@/utils/common';
import { getTaskRecord } from '@/addon/shop_fenxiao/api/task'
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import { onLoad,onPageScroll, onReachBottom } from '@dcloudio/uni-app';

const { mescrollInit, getMescroll } = useMescroll(onPageScroll, onReachBottom);
const id = ref<Number>(0)
onLoad((option: any) => {
    id.value = Number(option.id)
})
let loading = ref<boolean>(true);//页面加载动画
let lastLoading = ref<boolean>(true);//页面加载动画
const data = ref<Array<any>>([])
const status = ref<number>(2)
const statusList = ref<Array<any>>([
    { label: '全部', value: 2 },
    { label: '待发放', value: 0 },
    { label: '已发放', value: 1 },
    
])
const statusSearchFn = (value: number) => {
    status.value = value
    getMescroll().resetUpScroll();
}
const getTaskRecordFn = (mescroll:any) => {
    loading.value = true
    getTaskRecord(Number(id.value)).then((res: any) => {
        loading.value = false
        lastLoading.value = false
        data.value = res.data.filter((el: any) => {
            return status.value === 2 || el.is_send === status.value
        })
        mescroll.endSuccess(0);
    })
}
</script>
<style lang="scss" scoped>
.class-select {
    position: relative;
    font-weight: bold;
    color: var(--primary-color);

    &::before {
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
</style>