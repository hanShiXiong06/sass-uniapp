<template>
    <view class="bg-[#f8f8f8] min-h-screen overflow-hidden" :style="themeColor()">
        <mescroll-body ref="mescrollRef" top="30rpx" @init="mescrollInit" @down="downCallback" @up="geVerifyRecordFn">
        	<view class="ml-[30rpx] mr-[30rpx]">
        		<block v-for="(item,index) in list"	:key="item.id">
        			<view class="w-full flex flex-col mb-3 bg-[#fff] py-3 px-4 box-border rounded-[18rpx] " @click="toLink(item)">
        				<view class="flex items-center justify-between border-0 border-b-[4rpx] border-[#eee] border-solid pb-[20rpx]">
        					<text class="truncate w-[460rpx] text-[#999] text-xs">核销码：{{ item.code }}</text>
							<text class="text-[#999] text-xs ">核销员：{{ item.member ? item.member.nickname : '--' }}</text>
        				</view>
							<view class="py-[30rpx] flex" v-for="(dataItem,dataIndex) in item.value.list" :key="dataIndex">
								<image class="w-[120rpx] h-[120rpx]" mode="aspectFit" v-if="dataItem.cover" :src="img(dataItem.cover)"></image>
								<image class="w-[80rpx] h-[80rpx]" mode="aspectFit" v-else :src="img('addon/tourism/tourism/member/hotel.png')"></image>

								<view class="flex flex-col justify-between ml-[20rpx]" >
									<view class="multi-hidden leading-[1.2] text-xs">{{dataItem.name}}</view>
									<text class="text-[#999] text-xs mt-[20rpx]">核销时间：{{ item.create_time }}</text>
									<view class="text-[#999] mt-[6rpx]">x1</view>
								</view>
						</view>
        			</view>
        		</block>
        	</view>
            <mescroll-empty :option="{'icon': img('static/resource/images/empty.png')}" v-if="!list.length && loading"></mescroll-empty>
        </mescroll-body>
    </view>
</template>

<script setup lang="ts">
    import { ref, reactive, computed } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue'
    import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue'
    import useMescroll from '@/components/mescroll/hooks/useMescroll.js'
    import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'
    import { getVerifyRecords } from '@/app/api/verify'
    import { img, redirect } from '@/utils/common'

    let list = ref<Array<Object>>([])
    let loading = ref<boolean>(false)
    const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom)

    const geVerifyRecordFn = (mescroll) => {
    	loading.value = false;
    	let data : object = {
    		page: mescroll.num,
    		limit: mescroll.size,
    	};

    	getVerifyRecords(data).then((res) => {
    		let newArr = (res.data.data as Array<Object>);
    		//设置列表数据
    		if (mescroll.num == 1) {
    			list.value = []; //如果是第一页需手动制空列表
    		}
    		list.value = list.value.concat(newArr);
    		mescroll.endSuccess(newArr.length);
    		loading.value = true;
    	}).catch(() => {
    		loading.value = true;
    		mescroll.endErr(); // 请求失败, 结束加载
    	})
    }

    const toLink = (data: AnyObject)=> {
        redirect({ url: '/app/pages/verify/detail', param: { code: data.code } })
    }
</script>

<style lang="scss" scoped>
</style>
