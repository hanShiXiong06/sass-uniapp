<template>
    <view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()">
        <mescroll-body ref="mescrollRef" top="402rpx" :down="{ use: false }" @init="mescrollInit" @up="getTaskListFn">
            <view class="fixed top-0 left-0 right-0 z-10" v-if="!loading">
                <view class="w-[100%] h-[340rpx] background-size" :style="{ backgroundImage: 'url(' + img('addon/shop_fenxiao/task-header.png') + ')' }"></view>
                <view class="bg-[#fff] text-[#999] rounded-tl-[28rpx] rounded-tr-[28rpx] overflow-hidden relative z-10 mt-[-28rpx]">
                    <view class="flex whitespace-nowrap justify-around">
                        <view
                            :class="['text-[28rpx] leading-[90rpx] font-bold', { 'class-select': taskData.searchParam.status === item.value }]"
                            @click="statusSearchFn(item.value)" v-for="(item, index) in statusList">{{ item.label }}</view>
                    </view>
                </view>
            </view>
            <view class="p-[24rpx] box-border relative z-2" v-if="taskData.data.length">
                <template v-for="(item, index) in taskData.data" :key="index">
                    <view class="bg-[#fff] rounded-[10rpx] overflow-hidden"
                        :class="{ 'mb-[24rpx]': index < taskData.data.length }" @click="toDetail(item)">
                        <view
                            class="h-[80rpx] flex items-center justify-between pl-[28rpx] border-[#E2E2E2] border-0 border-b-[1rpx] border-solid box-border">
                            <view class="text-[24rpx] flex-1">奖励<text class="text-[var(--primary-color)] mx-[10rpx]">{{ moneyFormat((item as any).rules[0].reward?.commission) }}</text>佣金</view>
                            <view v-if="(item as any).status === 1"
                                class="pr-[15rpx] pl-[20rpx] rounded-l-[17.5rpx] !text-[24rpx] bg-[#fdf6ec] text-[#eebe77] h-[35rpx] flex items-center">
                                <count-down :time="(item as any).time" /><text>后开始</text>
                            </view>
                            <view v-if="(item as any).status === 2"
                                class="pr-[15rpx] pl-[20rpx] rounded-l-[17.5rpx] !text-[24rpx] bg-[#fdf6ec] text-[#eebe77] h-[35rpx] flex items-center">
                                <count-down v-if="(item as any).time_type != '2'" :time="(item as any).time" /><text
                                    v-if="(item as any).time_type != '2'">后结束</text>
                                <text v-if="(item as any).time_type === '2'">长期有效</text>
                            </view>
                            <view v-if="(item as any).status === 3"
                                class="pr-[15rpx] pl-[20rpx] rounded-l-[17.5rpx] !text-[24rpx] bg-[#ddd] text-[#fff] h-[35rpx] flex items-center">
                                <text>已结束</text>
                            </view>
                        </view>
                        <view class="flex py-[30rpx] px-[28rpx] box-border">
							<image class="w-[180rpx] h-[180rpx] flex-shrink-0" mode="aspectFill" v-if="item.cover_thumb_mid" :src="img(item.cover_thumb_mid)" @error="item.cover_thumb_mid='addon/shop_fenxiao/task.png'"></image>
							<image class="w-[180rpx] h-[180rpx] flex-shrink-0" mode="aspectFit" v-else :src="img('addon/shop_fenxiao/task.png')"></image>
                            <view class="flex-1 flex flex-col justify-between ml-[20rpx]">
                                <view class="text-[28rpx] font-600 multi-hidden leading-[40rpx] min-h-[80rpx]">{{ (item as any).name }}</view>
                                <view>
                                    <u-line-progress
                                        :percentage="(item as any).task_member ? (item as any).task_member.task_data.show_progress.rate||2 : 2"
                                        :showText="false" active-color="var(--primary-color)"
                                        height="17rpx"></u-line-progress>
                                    <view class="text-right text-[24rpx] text-[var(--primary-color)] mt-[16rpx]">
                                        <text v-if="(item as any).task_member">
                                        {{ `${(item as any).task_member.task_data.util=='元'?moneyFormat((item as any).task_member.task_data.now_data):(item as any).task_member.task_data.now_data}/${(item as any).task_member.task_data.util=='元'?moneyFormat((item as any).task_member.task_data.end_data):(item as any).task_member.task_data.end_data}${(item as any).task_member.task_data.util}`}}
                                        </text>
                                        <text v-else>
                                            0/{{ (item as any).task_data.util=='元'?moneyFormat((item as any).task_data.end_data):(item as any).task_data.end_data }}{{ (item as any).task_data.util }}
                                        </text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
            </view>
            <mescroll-empty :option="{ 'icon': img('static/resource/images/empty.png') }" v-if="!taskData.data.length && !loading&&!lastLoading"></mescroll-empty>
        </mescroll-body>
    </view>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { img, redirect,moneyFormat } from '@/utils/common';
import { getTaskList } from '@/addon/shop_fenxiao/api/task'
import countDown from '@/addon/shop_fenxiao/components/count-down/count-down'
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';

const { mescrollInit, getMescroll } = useMescroll(onPageScroll, onReachBottom);

let loading = ref<boolean>(true);//页面加载动画
let lastLoading = ref<boolean>(true);//页面加载动画
const statusList = ref<Array<any>>([
    { label: '未开始', value: 1 },
    { label: '进行中', value: 2 },
    { label: '已结束', value: 3 },
])
const taskData = reactive({
    data: [],
    searchParam: {
        status: 2,
    }
})

const statusSearchFn = (status: number) => {
    taskData.searchParam.status = status
    taskData.data = [];
    getMescroll().resetUpScroll();
}
const getTaskListFn = (mescroll: any) => {
    lastLoading.value = true;
    getTaskList({
        page: mescroll.num,
        limit: mescroll.size,
        ...taskData.searchParam
    }).then((res: any) => {
        let newArr = res.data.data.map((el: any) => {
            if (el.status === 1) {
                el.time = new Date(el.start_time).getTime() - new Date().getTime()
                el.time = el.time < 0 ? '' : el.time
            } else if (el.status === 2) {
                if (el.time_type != 2) {
                    el.time = new Date(el.end_time).getTime() - new Date().getTime()
                    el.time = el.time < 0 ? '' : el.time
                } else {
                    el.time = ''
                }
            }
            return el
        })
        //设置列表数据
        if (mescroll.num == 1) {
            taskData.data = []; //如果是第一页需手动制空列表
        }
        taskData.data = taskData.data.concat(newArr);
        loading.value = false;
        lastLoading.value = false
        mescroll.endSuccess(newArr.length);
    }).catch(() => {
        loading.value = false;
        lastLoading.value = false
        mescroll.endErr(); // 请求失败, 结束加载
    })
}

const toDetail = (item: any) => {
    redirect({ url: '/addon/shop_fenxiao/pages/task_detail', param: { id: item.id } })
}
</script>
<style lang="scss" scoped>
.background-size {
    background-size: 100% 100%;
}

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