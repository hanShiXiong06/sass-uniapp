<template>
	<view class="min-h-[100vh] w-full !bg-[#F6F6F6]" v-if="!loading">
		<up-cell :title="'我的团队(' + list.total + ')'"></up-cell>
		<view class="px-[30rpx] pt-[20rpx] body-bottom" v-if="list.total > 0">
			<view v-for="(item, index) in list.data" :key="index"
				class="w-full h-[120rpx] flex justify-between items-center bg-[#fff] box-border p-[20rpx] rounded-[16rpx]"
				:class="{ 'mt-[20rpx]': index }">
				<view class="flex items-center">
					<u-avatar :src="img(item.headimg)" size="55" leftIcon="none"></u-avatar>
					<view class="flex flex-col ml-[20rpx]">
						<view class="text-[#000] text-[26rpx] leading-[36rpx]">{{ item.nickname }}</view>
						<view class="text-[#999] text-[24rpx] leading-[34rpx] mt-[4rpx] font-400">{{ item.create_time }}
						</view>
					</view>
				</view>
				<view class="text-right">
					<view class="text-[36rpx] leading-[50rpx]"></view>
					<view class="text-[#999] text-[24rpx] leading-[34rpx] mt-[4rpx] font-400">
						<text class="mr-[15rpx]"></text>
						<text></text>
					</view>
				</view>
			</view>
		</view>
		<u-loadmore :status="status" />
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { img } from '@/utils/common';
import { getTeamMember } from '@/addon/tt_niucloud/api/member';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';

const loading = ref(true);
const list = ref({
	total: 0,
	data: [],
	current_page: 0,
	last_page: 0,
});
const status = ref('nomore');

// 加载第一页数据
const loadInitialData = async () => {
	try {
		const res = await getTeamMember();
		list.value = res.data;
		loading.value = false;
		status.value = res.data.current_page < res.data.last_page ? 'more' : 'nomore';
	} catch (error) {
		console.error('加载数据失败:', error);
		loading.value = false;
		status.value = 'error';
	}
};

// 加载下一页数据
const loadMoreData = async () => {
	if (status.value !== 'more') return;
	status.value = 'loading';

	try {
		const res = await getTeamMember({ page: list.value.current_page + 1 });
		list.value.data = list.value.data.concat(res.data.data);
		list.value.current_page = res.data.current_page;

		status.value = res.data.current_page < res.data.last_page ? 'more' : 'nomore';
	} catch (error) {
		console.error('加载更多数据失败:', error);
		status.value = 'error';
	}
};

onLoad(loadInitialData);
onReachBottom(loadMoreData);
</script>

<style lang="scss"></style>
