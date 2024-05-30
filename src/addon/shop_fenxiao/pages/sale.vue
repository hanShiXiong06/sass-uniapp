<template>
    <view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()">
        <mescroll-body ref="mescrollRef" :down="{ use: false }" @init="mescrollInit" @up="getSaleMemberFn">
            <block v-if="!loading">
            <view class="wechat w-full h-[180rpx]"></view>
            <view class="wechat w-full h-[20rpx]  rounded-b-[50%]"></view>
            <view class="p-[24rpx] relative mt-[-120rpx] box-border">
                <view class="w-full box-border bg-[#fff] px-[24rpx] py-[30rpx] rounded-[10rpx] overflow-hidden">
                    <view class="text-[26rpx] text-center text-[#999]">销售奖励（元）</view>
                    <view class="text-[50rpx] font-600 text-center mt-[24rpx]">{{moneyFormat(saleCommission.sale_commission)||0.00}}</view>
                    <view class="mt-[24rpx] flex justify-center">
                        <view class="px-[10rpx] leading-[35rpx] h-[35rpx] text-[#999] rounded-[2rpx]">
                            待发放:{{moneyFormat(saleCommission.wait_sale_commission)||0.00}}（元）
                        </view>
                    </view>
                </view>
                <view class="mt-[24rpx] bg-[#fff] px-[24rpx] box-border rounded-[10rpx] overflow-hidden">
                    <template v-for="(item,index) in info">
                        <view class="flex py-[30rpx] box-border border-0 border-solid border-[#ddd]" :class="{'border-b-[1rpx]':index!=info.length-1}" @click="toDetail(item.period_id)">
                            <view class="flex-1 flex flex-col justify-between">
                                <view class="text-[26rpx] font-600">{{item.is_send?'已发放':'待发放'}}</view>
                                <view v-if="item.is_settlement" class="text-[24rpx] text-[#999]">已于 {{item.sale_end_time}} 结算该奖励</view>
                                <view v-else class="text-[24rpx] text-[#999]">预计于 {{item.sale_end_time}} 结算该奖励</view>
                            </view>
                            <view class="text-[35rpx] font-600 text-[var(--price-text-color)] h-[100rpx] leading-[100rpx]">
                                +{{moneyFormat(item.reward_money)}}
                            </view>
                        </view>
                    </template>    
                </view>
                <mescroll-empty :option="{ 'icon': img('static/resource/images/empty.png') }" v-if="!info.length && !loading"></mescroll-empty>
            </view>
        </block>
        </mescroll-body>
    </view>
</template>
<script lang="ts" setup>
import { ref} from 'vue'
import { img, redirect, moneyFormat } from '@/utils/common';
import { getSaleMemberList,getSaleMemberNowList,getSaleMemberCommission } from '@/addon/shop_fenxiao/api/sale'
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);

let loading = ref<boolean>(true);//页面加载动画
const info: Record<string, any> = ref([])
const getSaleMemberFn = (mescroll: any) => {
    getSaleMemberList({
        page: mescroll.num,
        limit: mescroll.size,
    }).then((res: any) => {
        let newArr = res.data.data
        //设置列表数据
        if (mescroll.num == 1) {
            info.value = []; //如果是第一页需手动制空列表
			getSaleMemberNowListFn(newArr); // 加载第一次时调用函数
        }
        info.value = info.value.concat(newArr);
        mescroll.endSuccess(newArr.length);
    }).catch(() => {
        loading.value = false;
        mescroll.endErr(); // 请求失败, 结束加载
    })
}
const getSaleMemberNowListFn= async(newArr:any)=>{
    const res :any = await getSaleMemberNowList()
	let idArr = newArr.map(el=>el.period_id);
	if(Object.keys(res.data).length &&(idArr.length && idArr.indexOf(res.data.id) == -1 || !idArr.length)){
		let obj = JSON.parse(JSON.stringify(res.data))
		obj.reward_money = obj.total_reward_money;
		obj.period_id = obj.id;
		info.value.unshift(obj);
	}
	loading.value = false;
}
let saleCommission = ref({})
const getSaleMemberCommissionFn=()=>{
    getSaleMemberCommission().then((res:any)=>{
        saleCommission.value = res.data;
    })
}
getSaleMemberCommissionFn()

const toDetail = (id: any) => {
    redirect({ url: '/addon/shop_fenxiao/pages/sale_detail', param: {id:id} })
}
</script>
<style lang="scss" scoped>
.wechat {
    background: linear-gradient(to right, var(--primary-color-dark) 40%, var(--primary-color) 90%);
}</style>