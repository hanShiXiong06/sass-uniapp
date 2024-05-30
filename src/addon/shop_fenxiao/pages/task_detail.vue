<template>
    <view class="bg-[#f8f8f8] min-h-[100vh] p-[24rpx] box-border" :style="themeColor()">
        <template v-if="Object.keys(detail).length">
            <view class="bg-[#fff] rounded-[10rpx]overflow-hidden">
                <view class="w-[100%] h-[270rpx] relative  background-size box-border p-[24rpx]" :style="{ backgroundImage: 'url(' + img('addon/shop_fenxiao/task-detail-header.png') + ')' }">
                    <view class="text-[40rpx] mt-[30rpx] text-[#fff] font-600">
                        <text>{{ detail.name }}</text>
                    </view>
                    <view class="mt-[30rpx] text-[22rpx] text-[#fff]">
                        {{ detail.start_time ? detail.start_time.substring(0, 10) : '--' }} 至 {{ detail.time_type == 1 ? detail.end_time.substring(0, 10) : "长期有效" }}（{{ detail.status === 1?'未开始':detail.status === 2?'已开始':'已结束' }}）
                    </view>
                    <!-- 跳转个任务奖励明细 -->
                    <view class="absolute top-[24rpx] right-[24rpx] text-[24rpx] text-[#fdf6ec] leading-[35rpx] h-[35rpx] bg-[rgba(0,0,0,0.2)] px-[17.5rpx] rounded-[17.5rpx]" @click="toDetail">奖励明细</view>
                    <!-- 进度条 -->
                    <view class="mx-auto mt-[70rpx] text-[#fff] relative mx-[15rpx]">
                        <view class="w-full h-[15rpx] rounded-[7.5rpx] bg-[#ececec] flex">
                            <view class="h-[15rpx] rounded-[7.5rpx] bg-[#eebe77]" :style="{ 'width': detail.task_member ? detail.task_member.task_data.show_progress.rate + '%' : 0 }"></view>
                        </view>
                        <!-- 当前进度 -->
                        <view
                            class="w-[30rpx] h-[30rpx] rounded-[15rpx] bg-[#eebe77] absolute z-10 top-[-7.5rpx] ml-[-15rpx] ltft-0"
                            :style="{ 'left': detail.task_member ? detail.task_member.task_data.show_progress.rate + '%' : 0 }">
                            <view class="w-[15rpx] h-[15rpx] rounded-[7.5rpx] bg-[#fff] absolute top-[7.5rpx] left-[7.5rpx]"></view>
                        </view>
                        <!-- 当前完成进度文字 -->
                        <view ref="mytext" v-if="detail.task_member && detail.task_member.task_data.show_progress.rate != 100"
                            class="absolute text-[24rpx] bottom-[30rpx] transform -translate-x-1/2"
                            :style="{ 'left': detail.task_member ? detail.task_member.task_data.show_progress.rate + '%' : 0 }">{{ detail.task_member.task_data.now_data + detail.task_member.task_data.util }}</view>
                        <view
                            class="w-[30rpx] h-[30rpx] rounded-[15rpx] absolute z-9 top-[-7.5rpx] mr-[-15rpx] right-0 bg-[#ececec]"
                            :class="{ '!bg-[#eebe77]': detail.task_member && detail.task_member.task_data.show_progress.rate == 100 }">
                            <view class="w-[15rpx] h-[15rpx] rounded-[7.5rpx] bg-[#fff] absolute top-[7.5rpx] left-[7.5rpx]"></view>
                        </view>
                        <!-- 需完成的总进度完成 -->
                        <view ref="overallText" class="absolute text-[24rpx] bottom-[30rpx] right-0">{{
                            detail.task_member ? (detail.task_member.task_data.util=='元'?moneyFormat(detail.task_member.task_data.end_data):detail.task_member.task_data.end_data) + detail.task_member.task_data.util : (detail.task_data.util=='元'?moneyFormat(detail.task_data.end_data):detail.task_data.end_data) + detail.task_data.util
                        }}</view>
                    </view>
                </view>
                <view class="p-[24rpx]">
                    <view v-if="!detail.task_member" class="text-[26rpx] font-600">
                      {{detail.task_data.title}}达<text class="text-[#eebe77] mx-[10rpx]">{{detail.task_data.util=='元'?moneyFormat(detail.task_data.end_data):detail.task_data.end_data }}{{detail.task_data.util}}</text>即可获得以下奖励：
                    </view>
                    <view v-else class="text-[26rpx] font-600">
                      {{detail.task_member.task_data.title}}达<text class="text-[#eebe77] mx-[10rpx]">{{detail.task_member.task_data.util=='元'?moneyFormat(detail.task_member.task_data.end_data):detail.task_member.task_data.end_data }}{{detail.task_member.task_data.util}}</text>即可获得以下奖励：
                    </view>
                    <view class="w-full mt-[24rpx] flex">
                        <view class="flex flex-col items-center">
                            <image class="w-[56rpx] h-[56rpx] rounded-[50%]" :src="img('addon/shop_fenxiao/tark-money.png')" mode="aspectFill"></image>
                            <view class="mt-[14rpx] text-[22rpx]">{{ moneyFormat(detail.rules[0].reward?.commission)}}元</view>
                        </view>
                    </view>
                </view>
                <view class="px-[24rpx] pt-[30rpx] border-0 border-t-[1rpx] border-solid border-[#ddd]" v-if="detail.status === 1">
                    <view class="text-center text-[28rpx] font-600">
                        距离开始还剩
                    </view>
                    <view class="flex justify-center mt-[26rpx]">
                        <u-count-down :time="detail.time" format="DD:HH:mm:ss" autoStart millisecond @change="onChange">
                            <view class="time text-[26rpx] font-600 flex items-center">
                                <text class="time__days mr-[24rpx]">{{ timeData.days }}天</text>
                                <text class="time__hours">{{ timeData.hours > 10 ? timeData.hours : '0' + timeData.hours}}</text>
                                <text class="mx-[7rpx] text-[var(--primary-color)]">:</text>
                                <text class="time__minutes">{{ timeData.minutes > 10 ? timeData.minutes : '0' + timeData.minutes}}</text>
                                <text class="mx-[7rpx] text-[var(--primary-color)]">:</text>
                                <text class="time__seconds">{{ timeData.seconds > 10 ? timeData.seconds : '0' + timeData.seconds}}</text>
                            </view>
                        </u-count-down>
                    </view>
                    <view class="text-center text-[24rpx] pb-[40rpx] text-[35rpx] text-[#ddd] mt-[50rpx]">即将开始</view>
                </view>
            </view>
            <view class="bg-[#fff] rounded-[10rpx] overflow-hidden mt-[30rpx] p-[24rpx]">
                <view class="text-[30rpx] font-600 mt-[24rpx]">{{t('rewardRules')}}</view>
                <!-- <view class="flex items-center mt-[24rpx]">
                    <view class="flex h-[26rpx] items-center flex-shrink-0">
                        <view class="h-[15rpx] w-[15rpx] rounded-[50%] bg-[#f8e3c5] mr-[24rpx] flex-shrink-0"></view>
                    </view>
                    <view class="text-[26rpx] flex-1 text-[#999] w-[615rpx] break-all">
                        <text>任务类型：</text>
                        <text>{{ detail.type_name }}</text>
                    </view>
                </view> -->
                <view class="flex items-center mt-[24rpx]" v-if="detail.type===1">
                    <view class="flex h-[26rpx] items-center flex-shrink-0">
                        <view class="h-[15rpx] w-[15rpx] rounded-[50%] bg-[#f8e3c5] mr-[24rpx] flex-shrink-0"></view>
                    </view>
                    <view class="text-[26rpx] flex-1 text-[#999] w-[615rpx] break-all">
                        <text>参与次数：</text>
                        <text>{{ detail.times?detail.times+'次':'不限次' }}</text>
                    </view>
                </view>
                <view class="flex mt-[24rpx]">
                    <view class="flex h-[26rpx] items-center flex-shrink-0">
                        <view class="h-[15rpx] w-[15rpx] rounded-[50%] bg-[#f8e3c5] mr-[24rpx] flex-shrink-0"></view>
                    </view>
                    <view class="text-[26rpx] flex-1 text-[#999] w-[615rpx] break-all">
                        <text>参与等级：</text>
                        <text>
                            {{ detail.level_type == 1 && '全部等级' || detail.level_type == 2 && Object.values(detail.level_data).toString() }}
                        </text>
                    </view>
                </view>
                <view class="flex items-center mt-[24rpx]">
                    <view class="flex h-[26rpx] items-center flex-shrink-0">
                        <view class="h-[15rpx] w-[15rpx] rounded-[50%] bg-[#f8e3c5] mr-[24rpx] flex-shrink-0"></view>
                    </view>
                    <view class="text-[26rpx] flex-1 text-[#999] w-[615rpx] break-all">
                        <text>参与指标：</text>
                        <text>{{ detail.task_member ? detail.task_member.task_data.title : detail.task_data.title }}</text>
                    </view>
                </view>
                <view class="flex items-center mt-[24rpx]">
                    <view class="flex h-[26rpx] items-center flex-shrink-0">
                        <view class="h-[15rpx] w-[15rpx] rounded-[50%] bg-[#f8e3c5] mr-[24rpx] flex-shrink-0"></view>
                    </view>
                    <view v-if="!detail.task_member" class="text-[26rpx] flex-1 text-[#999] w-[615rpx] break-all">
                        <text>奖励说明：</text>
                        <text>
                            {{detail.task_data.title}}达{{detail.task_data.util=='元'?moneyFormat(detail.task_data.end_data):detail.task_data.end_data }}{{detail.task_data.util}}即可获得{{moneyFormat(detail.rules[0].reward?.commission)}}元佣金</text>
                    </view>
                    <view v-else class="text-[26rpx] flex-1 text-[#999] w-[615rpx] break-all">
                        <text>奖励说明：</text>
                        <text>
                            {{detail.task_member.task_data.title}}达{{detail.task_member.task_data.util=='元'?moneyFormat(detail.task_member.task_data.end_data):detail.task_member.task_data.end_data }}{{detail.task_member.task_data.util}}即可获得{{moneyFormat(detail.rules[0].reward?.commission)}}元佣金
                        </text>
                    </view>
                </view>
            </view>
        </template>
        <view v-if="detail.remark" class="bg-[#fff] rounded-[10rpx] overflow-hidden mt-[30rpx] p-[24rpx]">
            <view class="text-[30rpx] font-600 mt-[24rpx]">{{t('taskSpecification')}}</view>
            <view class="text-[#999] text-[26rpx] mt-[24rpx]">{{ detail.remark }}</view>
        </view>
        <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
    </view>
</template>

<script lang="ts" setup>
import { t } from '@/locale';
import { ref } from 'vue'
import { img, redirect,moneyFormat } from '@/utils/common';
import { onLoad } from '@dcloudio/uni-app'
import { getTaskInfo } from '@/addon/shop_fenxiao/api/task'

const detail: Record<string, any> = ref({})
onLoad((option: any) => {
    getTaskInfoFn(Number(option.id))
})
let loading = ref<boolean>(true);//页面加载动画
const getTaskInfoFn = (id: number) => {
    getTaskInfo(id).then((res: any) => {
        detail.value = res.data
        if (detail.value.status === 1) {
            detail.value.time = new Date(detail.value.start_time).getTime() - new Date().getTime()
            detail.value.time = detail.value.time < 0 ? '' : detail.value.time
        } else if (detail.value.status === 2) {
            if (detail.value.time_type != 2) {
                detail.value.time = new Date(detail.value.end_time).getTime() - new Date().getTime()
                detail.value.time = detail.value.time < 0 ? '' : detail.value.time
            } else {
                detail.value.time = ''
            }
        }
        loading.value = false
    }).catch(() => {
        loading.value = false
    })

}
const timeData: Record<string, any> = ref({})
//计算进度条上方文字极限展示位置
// const Progresslock: Record<string, any> = ref({
//     leftTranslateLock:false
// })
// const mytext = ref<HTMLElement>()//

// const Progress =()=>{
//     if(detail.task_member) {
//         detail.task_member.task_data.show_progress.rate
//     }
// }
const onChange = (e: any) => {
    timeData.value = e
}
const toDetail = ()=>{
    redirect({ url: '/addon/shop_fenxiao/pages/task_rewards_detail', param: {id:detail.value.id} })
}
</script>
<style lang="scss">
.time__hours,
.time__minutes,
.time__seconds {
    color: #fff;
    display: inline-block;
    background: var(--primary-color);
    width: 45rpx;
    height: 45rpx;
    text-align: center;
    line-height: 45rpx;
    border-radius: 3rpx;
}

.background-size {
    background-size: 100% 100%;
}
</style>