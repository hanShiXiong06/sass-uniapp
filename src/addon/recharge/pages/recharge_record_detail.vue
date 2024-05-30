<template>
	<view class="member-record-detail" :style="themeColor()" v-show="loading">
		<view class="money-wrap">
			<text>￥{{ rechargeInfo.order_money }}</text>
			<text v-if="rechargeInfo.order_status_info">{{rechargeInfo.order_status_info.name}}</text>
		</view>
		<view class="item">
			<view class="line-wrap" v-if="rechargeInfo.item">
				<text class="label">{{ rechargeInfo.item[0].item_name }}</text>
				<text class="value">￥{{ rechargeInfo.order_money }}</text>
			</view>
			<view class="line-wrap">
				<text class="label">{{t('orderNo')}}</text>
				<text class="value">{{ rechargeInfo.order_no }}</text>
			</view>
			<view class="line-wrap">
				<text class="label">{{t('createTime')}}</text>
				<text class="value">{{ rechargeInfo.create_time }}</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
    import {reactive, ref} from 'vue'
    import {onLoad} from '@dcloudio/uni-app'
    import {t} from '@/locale'
    import {getRechargeDetail} from '@/addon/recharge/api/recharge'

    let rechargeInfo = ref({});
    let loading = ref<boolean>(false);
    onLoad((option) => {
        let id = option.id || "";
        getRechargeDetailFn(id)
    })

    const getRechargeDetailFn = (id:any) => {
        loading.value = false;

        getRechargeDetail(id).then((res:any) => {
            rechargeInfo.value = res.data;
            loading.value = true;
        }).catch(() => {
            loading.value = true;
        })
    }
</script>

<style lang="scss">
page{
    background-color: #f5f6fa;
    @apply pt-4;
}
.member-record-detail{
    @apply m-4 mt-0 bg-white rounded-md px-4 py-6;
    .money-wrap{
        @apply flex items-center flex-col mb-6;
        text:first-of-type{
            @apply text-3xl font-bold mt-1;
        }
        text:last-of-type{
            @apply text-sm mt-3;
        }
    }
    .line-wrap{
        @apply flex justify-between text-sm mt-3;
        .label{
            @apply text-[#878787];
        }
        .value{
            @apply text-[#222];
        }
    }
}
</style>
