<template>
    <view class="bg-[#f8f8f8] min-h-screen overflow-hidden" :style="themeColor()">
        <mescroll-body ref="mescrollRef" top="20rpx" @init="mescrollInit" @down="downCallback" @up="geVerifyRecordFn">
        	<view class="goods-wrap">
        		<block v-for="(item,index) in list"	:key="item.id">
        			<view class="goods-item" @click="toLink(item)">
        				<view class="flex items-center justify-between border-0 border-b-[2rpx] border-[#ccc] border-solid pb-[20rpx]">
        					<text class="truncate w-[460rpx] text-[#999]">核销码：{{ item.code }}</text>
							<text class="text-[#999]">核销员：{{ item.member ? item.member.nickname : '--' }}</text>
        				</view>
        				<view class="py-[20rpx]">
							<view class="py-[10rpx] flex" v-for="(dataItem,dataIndex) in item.value.list" :key="dataIndex">
								<image class="w-[80rpx] h-[80rpx]" mode="aspectFit" v-if="dataItem.cover" :src="img(dataItem.cover)"></image>
								<image class="w-[80rpx] h-[80rpx]" mode="aspectFit" v-else :src="img('addon/tourism/tourism/member/hotel.png')"></image>
								<view class="flex flex-col flex-1 ml-[10rpx]">
									<view class="multi-hidden leading-[1.2]">{{dataItem.name}}</view>
									<view class="ml-auto text-[#999]">x{{dataItem.num}}</view>
								</view>
							</view>
						</view>
						<view class="flex items-center justify-between border-0 border-t-[2rpx] border-[#ccc] border-solid pt-[20rpx]">
							<text class="text-[#999]">核销时间：{{ item.create_time }}</text>
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
    .font-scale{
    	transform: scale(0.75);
    }
    .text-color{
    	color: $u-primary;
    }
    .bg-color{
    	background-color: $u-primary;
    }

    .goods-wrap{
    	margin: 20rpx 20rpx 0;
    	.goods-item{
    		@apply w-full flex flex-col mb-3 bg-[#fff] py-3 px-4 box-border;
    		border-radius: 18rpx;
    		overflow: hidden;
    		.goods-head{
    			@apply flex justify-between pb-3 border-0 border-b-1 border-solid border-[#F0F0F0] mb-4;
    			font-size: 26rpx;
    			color: #666;
    		}
    		.goods-content{
    			@apply flex;
    			& > image{
    				width: 40rpx;
    				height: 40rpx;
    				margin-right: 30rpx;
    			}
    			& > view{
    				flex: 1;
    			}
    			.name-wrap{
    				display: flex;
    				justify-content: space-between;
    				margin-bottom: 20rpx;
    				&> view{
    					&:first-of-type{
    						font-weight: bold;
    						font-size: 30rpx;
    					}
    				}
    			}
    			.desc{
    				color: #686868;
    				font-size: 26rpx;
    				margin-bottom: 14rpx;
    			}
    			.time-wrap{
    				display: flex;
    				align-items: center;
    				background-color: #F6F7FB;
    				border-radius: 8rpx;
    				height: 62rpx;
    				font-size: 26rpx;
    				padding: 0 16rpx;
    				text{
    					&:nth-child(1){
    						color: #444;
    						margin-right: 14rpx;
    					}
    					&:nth-child(2){
    						color: #686868;
    					}
    					&:nth-child(3){
    						color: #333;
    						font-weight: bold;
    					}
    				}
    			}
    			.btn-wrap{
    				justify-content: flex-end;
    				@apply flex margin-0 mt-2 flex-wrap;
    				button{
    					width: 172rpx;
    					height: 64rpx;
    					font-size: 26rpx;
    					@apply rounded-3xl;
    					line-height: 64rpx;
    					background-color: transparent;
    					margin: 0;
    					margin-left: 20rpx;
    					@apply mt-2;
    					border: 2rpx solid #E2E2E2;
    					&[type="primary"]{
    						background-color: $u-primary;
    					}
    					&::after{
    						border: none;
    					}
    				}
    			}
    		}
    	}
    }
</style>
