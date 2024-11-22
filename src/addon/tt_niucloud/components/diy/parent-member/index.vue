<template>
	<view :style="warpCss" class="overflow-hidden" v-if="info.wx_id">
		<view v-if="diyComponent.style == 'style-1'" class="flex items-center justify-between style-bg-1 py-[20rpx] px-[30rpx]">
			<view class="flex items-end">
				<view class="flex items-center relative">
					<u-avatar :src="img(info.headimg)" size="55" leftIcon="none"></u-avatar>
					<view class="ml-[22rpx]">
						<view class="text-[#222222] pr-[50rpx] items-center">
							<view class="text-[28rpx] text-[#FFDAA8] font-bold max-w-[440rpx] truncate">{{ info.nickname }}</view>
						</view>
						<view class="mt-[25rpx] text-[#fff] text-[24rpx] mt-[10rpx] leading-[32rpx]">{{ diyComponent.tip }}</view>
					</view>
				</view>
				
			</view>
			<view class="flex items-center justify-center rounded-[30rpx] box-border style-btn w-[150rpx] h-[50rpx]" @click="addFriend(info)">
				<text class="text-[24rpx] text-[#333]">复制微信</text>
			</view>
		</view>
		
		<u-modal :show="wxQrcodeShow" :closeOnClickOverlay="true" title="微信号已复制或长按二维码添加好友" :showConfirmButton="false" @close="wxQrcodeShow = false">
			<view class="slot-content">
				<u-image :src="img(info.wx_qrcode)" width="200px" height="200px"></u-image>
			</view>
		</u-modal>
	</view>
</template>

<script lang="ts" setup>
	import { computed, ref, watch, onMounted } from 'vue'
	import { img, redirect, copy } from '@/utils/common'
	import useMemberStore from '@/stores/member'
	import { t } from '@/locale'
	import { getParentMember } from '@/addon/tt_niucloud/api/member';
	import useDiyStore from '@/app/stores/diy'

	const props = defineProps(['component', 'index', 'pullDownRefreshCount']);
	const diyStore = useDiyStore();
	const memberStore = useMemberStore()
	const memberInfo = computed(() => {
	    return memberStore.info
	})
	const wxQrcodeShow = ref(false)
	const diyComponent = computed(() => {
		if (diyStore.mode == 'decorate') {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	})

	const warpCss = computed(() => {
		var style = '';
		if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		return style;
	})

	watch(
		() => props.pullDownRefreshCount,
		(newValue, oldValue) => {
			// 处理下拉刷新业务
		}
	)

    const info:any = ref([])
	onMounted(() => {
	    if (diyStore.mode == 'decorate') {
	    	info.value = {
	    		headimg: '',
	    		nickname: '昵称',
				wx_id: '微信号',
				wx_qrcode: '二维码',
	    	}
	    } else {
	    	if (memberInfo.value) {
				getParentMember().then((res) => {
					info.value = res.data
				});
			}
	    }
	});

	// 跳转链接
	const toLink = (link: string)=>{
		if (diyStore.mode == 'decorate') return false;
		redirect({ url: link })
	}
	const addFriend = () => {
		wxQrcodeShow.value = true
		copy(info.value.wx_id)
		
	}
</script>

<style lang="scss" scoped>
	.style-bg-1{
		background: linear-gradient(to right, #1F1313, #4D4646);
	}
	.style-btn{
		background: linear-gradient(to right, #FFEACB, #FFD195);
	}
	.style-bg-2{
		background: linear-gradient(to right, #484846, #222222);
		border-bottom-left-radius: 320rpx 16rpx;
		border-bottom-right-radius: 320rpx 16rpx;
	}
	.style-bg-3{
		background: linear-gradient(to right, #FFE6C2, #E39F42);
	}
	.style-border-3{
		position: relative;
		&:after{
			content: "";
			position: absolute;
			background: linear-gradient(to right, #F0D2A9, #DBA051);
			height: 2rpx;
			bottom: 0;
			left: 0;
			right: 0;
		}
	}
</style>
