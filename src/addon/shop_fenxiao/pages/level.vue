<template>
    <view :style="themeColor()">
        <view class="bg-[#f8f8f8] min-h-[100vh]" v-if="!loading">
            <view class="w-[100%] h-[40rpx] relative">
                <image class="w-[100%] h-[300rpx] absolute" :src="img('addon/shop_fenxiao/level/level-top-bg.png')"></image>
            </view>
            <view class="flex items-center relative z-[20] mx-[60rpx] mb-[30rpx]">
                <image class="w-[90rpx] h-[90rpx] rounded-[50%]" v-if="detail.member.headimg" :src="img(detail.member.headimg)" mode="aspectFill"/>
                <image class="w-[90rpx] h-[90rpx] rounded-[50%]" v-else :src="img('addon/shop_fenxiao/index/head.png')" mode="aspectFill"/>
                <view class="ml-[20rpx] flex items-center">
                    <text class="text-[32rpx] text-[#fff] font-bold">{{detail.member.nickname}}</text>
                    <text class="rounded-sm ml-[10rpx] text-[#fff] text-[20rpx] border-solid border-[2rpx] border-[#fff] p-[6rpx]">{{currLevel.level_name}}</text>
                </view>
            </view>
            
            <view class="h-[300rpx] relative flex level-card-one items-center justify-center mx-[50rpx] rounded-[16rpx]">
                <view class="level-wrap w-[100%] h-[100%]" 
                :style="{'background-image':'url(' + img('addon/shop_fenxiao/level/style_4_bg.png') + ')','background-size':'cover'}">
                    <view class="text-[28rpx] text-[#fff] flex items-center" v-if="levelList[currIndex+1]">
                        <view class="flex items-center">
                            <text class="rounded-sm border-[2rpx] text-[24rpx] border-solid border-[#fff] px-[6rpx] py-[6rpx] mr-[6rpx]">{{levelList[currIndex+1].level_name}}</text>
                            <text>{{t('notYetUnlocked')}}</text>
                        </view>
                        <text class="shop-fenxiao-icon icon-dasuozi ml-[6rpx] !text-[28rpx]"></text>
                    </view>
                    <view v-if="levelList[currIndex+1]" class="text-[#fff] mt-[16rpx] text-[24rpx]">
                        {{levelList[currIndex+1].upgrade_type == 1 ? t('arbitraryCondition') : t('allConditions') }}{{t('upgradable')}}
                    </view>
                    <view class="flex mt-[40rpx]">
                        <view class="flex-1 text-left" v-if="config.fenxiao_config && config.fenxiao_config.level >= 1">
                            <view class="text-[#fff] text-[24rpx]">一级分佣比率</view>
                            <view class="mt-[14rpx] text-[#fff] text-[38rpx] leading-[1]">{{currLevel.one_rate}}<text class="text-[24rpx] ml-[4rpx]">%</text></view>
                        </view>
                        <view class="flex-1 text-left" v-if="config.fenxiao_config && config.fenxiao_config.level >= 2">
                            <view class="text-[#fff] text-[24rpx]">二级分佣比率</view>
                            <view class="mt-[14rpx] text-[#fff] text-[38rpx] leading-[1]">{{currLevel.two_rate}}<text class="text-[24rpx] ml-[4rpx]">%</text></view>
                        </view>
                        <view class="flex-1 text-left" v-if="config.team_config && config.team_config.is_open == 1">
                            <view class="text-[#fff] text-[24rpx]">团队分佣比率</view>
                            <view class="mt-[14rpx] text-[#fff] text-[38rpx] leading-[1]">{{currLevel.team_rate}}<text class="text-[24rpx] ml-[4rpx]">%</text></view>
                        </view>
                    </view>
                </view>
            </view>
            
            <view class="bg-[#fff] my-[30rpx] mx-[30rpx] p-[30rpx] rounded-[10rpx]" v-if="levelInfo && levelInfo.task.length">
                <view class="flex items-center justify-between">
                    <text class="font-bold">快速升级技巧</text>
                    <view class="flex items-center text-[26rpx]">
                        <text class="text-[#e7b667]">{{ levelInfo.complete > levelInfo.task_num ? levelInfo.task_num : levelInfo.complete }}</text>
                        <text class="text-[#bbb]">/{{ levelInfo.task_num }}</text>
                    </view>
                </view>
                <scroll-view scroll-y="true" class="flex flex-col upgrade-content">
                    <view class="flex flex-col bg-[#f7f7f7] rounded-[10rpx] mt-[30rpx] py-[20rpx] px-[30rpx]" v-for="(item, index) in levelInfo.task" :key="index">
                        <view class="flex items-center justify-between">
                            <text class="mr-[10rpx] text-[28rpx]">{{item.title}}</text>
                            <text class="text-[#999] text-[28rpx]">{{ item.progress == 100 ? '已完成' : '未完成' }}</text>
                        </view>
                        <view class="my-[20rpx]">
                            <progress :percent="item.progress" activeColor="var(--primary-color)" stroke-width="4" />
                        </view>
                        <view class="flex items-center justify-between">
                            <text class="text-[24rpx] text-[#999]">{{item.desc}}</text>
                            <view class="flex items-center text-[26rpx]">
                                <text class="text-[#e7b667]">{{ item.value }}</text>
                                <text class="text-[#bbb]">/{{ item.condition }}</text>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>
        <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#333"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
	import { img, moneyFormat } from '@/utils/common';
	import { ref, computed } from 'vue'
	import { t } from '@/locale'
	import { getLevelList } from '@/addon/shop_fenxiao/api/level';
	import { getFenxiaoDetail, getConfig } from '@/addon/shop_fenxiao/api/fenxiao';
	import {onShow } from '@dcloudio/uni-app'
	
	onShow(() => {
		getFenxiaoDetailFn();
		getConfigFn();
	});
	
	let loading = ref<boolean>(true);
	let levelList = ref([]);
	let currLevel = ref({});
	// 等级列表
	const getLevelListFn = ()=>{
		getLevelList().then((res : any) => {
			levelList.value = res.data;
			levelList.value.forEach((item, index) => {
				if (item.level_id == detail.value.level_id){
					currIndex.value = index;
					currLevel.value = item;
				}
			})
			loading.value = false;
		});
	}
	
	// 分销系统设置
	let config = ref({});
	const getConfigFn = ()=>{
		getConfig().then((res : any) => {
			config.value = res.data;
		});
	}
	
	let detail = ref({});
	let currIndex = ref(0);
	
	// 分销详情
	const getFenxiaoDetailFn = ()=>{
		getFenxiaoDetail().then((res : any) => {
			detail.value = res.data;
			getLevelListFn();
		});
	}
	
	const levelInfo = computed(() => {
	    if (levelList.value.length && levelList.value[currIndex.value+1]) {
	    	let level = levelList.value[currIndex.value+1];
	    	level.task = [];
	    	level.complete = 0;
			
	    	if (level.fenxiao_order_num > 0) {
	    		let task = {
	    			title: '订单总数',
	    			desc: '一级分销订单总数满' + level.fenxiao_order_num + '个',
	    			condition: level.fenxiao_order_num,
	    			value: detail.value.fenxiao_order_num,
	    			progress: parseFloat(detail.value.fenxiao_order_num) > parseFloat(level.fenxiao_order_num) ? 100 : (parseFloat(detail.value.fenxiao_order_num) / parseFloat(level.fenxiao_order_num) * 100).toFixed(2)
	    		}
	    		if (task.progress == 100) level.complete += 1;
	    		level.task.push(task);
	    	}
	    	if (level.fenxiao_commission > 0) {
	    		let task = {
	    			title: '佣金总额',
	    			desc: '一级分销订单佣金总额满' + moneyFormat(level.fenxiao_commission) + '元',
	    			condition: moneyFormat(level.fenxiao_commission),
	    			value: moneyFormat(detail.value.fenxiao_commission),
	    			progress: parseFloat(detail.value.fenxiao_commission) > parseFloat(level.fenxiao_commission) ? 100 : (parseFloat(detail.value.fenxiao_commission) / parseFloat(level.fenxiao_commission) * 100).toFixed(2)
	    		}
	    		if (task.progress == 100) level.complete += 1;
	    		level.task.push(task);
	    	}
	    	if (level.fenxiao_order_money > 0) {
	    		let task = {
	    			title: '订单总额',
	    			desc: '一级分销订单总额满' + moneyFormat(level.fenxiao_order_money) + '元',
	    			condition: moneyFormat(level.fenxiao_order_money),
	    			value: moneyFormat(detail.value.fenxiao_total_order),
	    			progress: parseFloat(detail.value.fenxiao_total_order) > parseFloat(level.fenxiao_order_money) ? 100 : (parseFloat(detail.value.fenxiao_total_order) / parseFloat(level.fenxiao_order_money) * 100).toFixed(2)
	    		}
	    		if (task.progress == 100) level.complete += 1;
	    		level.task.push(task);
	    	}
	    	if (level.order_num > 0) {
	    		let task = {
	    			title: '自购订单总数',
	    			desc: '自购订单总数满' + level.order_num + '个',
	    			condition: level.order_num,
	    			value: detail.value.add_up_data.order_num,
	    			progress: parseFloat(detail.value.add_up_data.order_num) > parseFloat(level.order_num) ? 100 : (parseFloat(detail.value.add_up_data.order_num) / parseFloat(level.order_num) * 100).toFixed(2)
	    		}
	    		if (task.progress == 100) level.complete += 1;
	    		level.task.push(task);
	    	}
	    	if (level.order_money > 0) {
	    		let task = {
	    			title: '自购订单总额',
	    			desc: '自购订单总额满' + moneyFormat(level.order_money) + '元',
	    			condition: moneyFormat(level.order_money),
	    			value: moneyFormat(detail.value.add_up_data.order_sum),
	    			progress: parseFloat(detail.value.add_up_data.order_sum) > parseFloat(level.order_money) ? 100 : (parseFloat(detail.value.add_up_data.order_sum) / parseFloat(level.order_money) * 100).toFixed(2)
	    		}
	    		if (task.progress == 100) level.complete += 1;
	    		level.task.push(task);
	    	}
	    	if (level.child_num > 0) {
	    		let task = {
	    			title: '下线人数',
	    			desc: '一级下线人数达到' + level.child_num + '人',
	    			condition: level.child_num,
	    			value: detail.value.add_up_data.child_count,
	    			progress: parseFloat(detail.value.add_up_data.child_count) > parseFloat(level.child_num) ? 100 : (parseFloat(detail.value.add_up_data.child_count) / parseFloat(level.child_num) * 100).toFixed(2)
	    		}
	    		if (task.progress == 100) level.complete += 1;
	    		level.task.push(task);
	    	}
	    	if (level.child_fenxiao_num > 0) {
	    		let task = {
	    			title: '下线分销商',
	    			desc: '一级下线分销商人数达到' + level.child_fenxiao_num + '人',
	    			condition: level.child_fenxiao_num,
	    			value: detail.value.add_up_data.child_fenxiao_count,
	    			progress: parseFloat(detail.value.add_up_data.child_fenxiao_count) > parseFloat(level.child_fenxiao_num) ? 100 : (parseFloat(detail.value.add_up_data.child_fenxiao_count) / parseFloat(level.child_fenxiao_num) * 100).toFixed(2)
	    		}
	    		if (task.progress == 100) level.complete += 1;
	    		level.task.push(task);
	    	}
	    	level.task_num = level.upgrade_type == 1 ? 1 : level.task.length;
	    	return level;
	    }
	})
</script>

<style lang="scss" scoped>
@import '@/addon/shop_fenxiao/styles/iconfont.css';
	.level-item-width{
		width: calc(100% - 30px);
		margin: 0 13px;
	}
	.level-wrap{
		transition: all .5s;
		display: flex;
		flex-direction: column;
		padding: 30rpx 40rpx;
		box-sizing: border-box;
		position: relative;
	}
	.level-card-one{
		background: linear-gradient(90deg, #FFB266, #FFD399);
	} 
	.upgrade-content{
		max-height: calc(100vh - 320px);
	}
</style>