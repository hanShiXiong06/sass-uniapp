<template>
    <view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()">
        <template v-if="!loading">
            <view class="w-[100%] h-[960rpx] relative background-size box-border" :style="{ backgroundImage: 'url(' + img('addon/shop_fenxiao/sale-detail-header.png') + ')' }">
                <view class="absolute top-[105rpx] left-0 right-0 flex justify-center">
                    <u--image width="341rpx" height="63rpx" :src="img('addon/shop_fenxiao/sale-detail-title.png')" model="aspectFill" />
                </view>
                <view class="absolute top-[24rpx] right-[24rpx] text-[24rpx] text-[#fdf6ec] leading-[35rpx] h-[35rpx] bg-[rgba(0,0,0,0.2)] px-[17.5rpx] rounded-[17.5rpx]" @click="toRanking">排行榜</view>
            </view>
            <view class="p-[24rpx] relative mt-[-560rpx] box-border">
                <view class="w-full box-border bg-[#fff] rounded-[10rpx] overflow-hidden">
                    <view class="flex items-center justify-between bg-[#fdf6ec] px-[24rpx]">
                        <view class="text-[30rpx] font-600 text-[#b88230] leading-[80rpx]  flex-shrink-0">当前业绩</view>
                        <view class="flex items-center">
                            <view class="text-[22rpx] text-[#b88230]">本次奖励周期：</view>
                            <view class="flex flex-col">
                                <view class="text-[22rpx] text-[#b88230] leading-[30rpx]">{{ detail.sale_start_time }}</view>
                                <view class="text-[22rpx] text-[#b88230] leading-[30rpx]">{{ detail.sale_end_time }} </view>
                            </view>
                        </view>
                    </view>
                    <view class="w-full p-[35rpx] pt-[50rpx] flex justify-between box-border">
                        <view class="max-w-[50%] flex-shrink-0 box-border px-[24rpx]">
                            <view class="text-[24rpx] text-[#999] text-center">个人奖金（元）</view>
                            <view class="text-[50rpx] font-600 text-center mt-[10rpx]">{{moneyFormat(detail.reward_money)}}</view>
                        </view>
                        <view class="max-w-[50%] flex-shrink-0 box-border px-[24rpx]">
                            <view class="text-[24rpx] text-[#999] text-center">团队销售（元）</view>
                            <view class="text-[50rpx] font-600 text-center mt-[10rpx]">{{moneyFormat(detail.order_money)}}</view>
                        </view>
                    </view>
                    <view v-if="!detail.is_settlement&& detail.diff_data.diff_order_money" class="w-full mt-[24rpx] flex justify-center">
                        <view class="bg-[#fdf6ec] text-[24rpx] text-[#eebe77] h-[50rpx] leading-[50rpx] px-[25rpx] rounded-[25rpx]">
                            再卖{{detail.diff_data.diff_order_money}}元可获得{{moneyFormat(detail.diff_data.prev_reward)}}元
                        </view>
                    </view>
                    <view class="w-full pt-[24rpx] pb-[45rpx] flex justify-center">
                        <button class="w-[538rpx] h-[80rpx] text-[32rpx] leading-[80rpx] rounded-[40rpx] !text-[#fff] m-0 wechat remove-border"
                            shape="circle" @click="toShop">去推广商品</button>
                    </view>
                </view>
                <view class="w-full px-[24rpx] box-border bg-[#fff] rounded-[10rpx] overflow-hidden mt-[24rpx]">
                    <view class="text-[30rpx] font-600 py-[24rpx]">
                        <text>排名奖励规则</text>
                        <text class="text-[22rpx] text-[#999]">（参与门槛：团队销售额{{moneyFormat(detail.condition_order_money)}}元）</text></view>
                    <template v-for="(item,index) in config">
                        <view class="text-[26rpx] py-[24rpx] border-0  border-solid border-[#ddd]" :class="{'border-b-[1rpx]':index!=config.length-1}">团队销售{{item.title}} 名，奖金 {{ moneyFormat(item.reward.commission) }} 元</view>
                    </template>
                </view>
            </view>
        </template>
        <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
    </view>
</template>
<script lang="ts" setup>
import { ref} from 'vue'
import { img, redirect,moneyFormat } from '@/utils/common';
import { onLoad } from '@dcloudio/uni-app'
import { getSaleMemberInfo } from '@/addon/shop_fenxiao/api/sale'
import { getConfig } from '@/addon/shop_fenxiao/api/fenxiao'

const detail: Record<string, any> = ref({})
const config = ref<Array<any>>([])
onLoad((option: any) => {
	if(option.id){
		getSaleMemberInfoFn(Number(option.id))
	}else{
		uni.showToast({
			title: '缺少销售奖励id',
			icon: 'none'
		});
		setTimeout(()=>{
			redirect({ url: '/addon/shop_fenxiao/pages/sale', mode: 'redirectTo'})
		},1000)
	}
})
let loading = ref<boolean>(true);//页面加载动画
const getSaleMemberInfoFn = (id: number) => {
    getSaleMemberInfo(id).then((res: any) => {
        detail.value.id = id
        detail.value.is_settlement = res.data.is_settlement
        detail.value.order_money = res.data.order_money
        detail.value.reward_money = detail.value.is_settlement?res.data.reward_money:res.data.diff_data.now_reward
        detail.value.sale_start_time = res.data.sale_start_time
        detail.value.sale_end_time = res.data.sale_end_time
        if(!detail.value.is_settlement) detail.value.diff_data = res.data.diff_data
        getConfigFn()
    }).catch(() => {
        loading.value = false
    })
}
const getConfigFn = () => {
    getConfig().then((res: any) => {
        detail.value.condition_order_money = res.data.sale_config.condition.order_money
        config.value = res.data.sale_config.reward.map((el:any,index:number)=>{
            if(index){
                el.title = Number(res.data.sale_config.reward[index-1].end)+1!=Number(el.end)?'第 '+(Number(res.data.sale_config.reward[index-1].end)+1)+'-'+el.end:'第 '+el.end
            }else{
                el.title = el.end>1?'前 '+el.end:'第 '+el.end
            }
            return el
        })
        loading.value = false
    }).catch(res => {
        loading.value = false
    })
}
const toRanking = ()=>{
    redirect({ url: '/addon/shop_fenxiao/pages/sale_ranking', param: {id:detail.value.id} })
}
const toShop = ()=>{
    redirect({ url: '/addon/shop/pages/index', mode: 'reLaunch'})
}
</script>
<style lang="scss">
.remove-border{
    &::after{
        border: none;
    }
}
.background-size {
    background-size: 100% 100%;
}

.wechat {
    background: linear-gradient(to right, var(--primary-color-dark) 40%, var(--primary-color) 90%);
}
</style>
