<template>
	<view class="diy-cps" :style="warpCss">

		<view v-if="diyComponent.style == 'style-1'" class="p-[20rpx]">
			<!-- #ifdef MP-WEIXIN -->
			<meituan-list data="{{Detail}}"></meituan-list>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<image src="" style="width:100%" mode="aspectFit"></image>
			<!-- #endif -->
		</view>
		<view v-if="diyComponent.style == 'style-2'" class="p-[20rpx] flex items-center">
			<!-- #ifdef MP-WEIXIN -->
			<meituan-seckill data="{{Detail}}"></meituan-seckill>
			<!-- #endif -->
			<!-- #ifdef H5 -->
            美团秒杀
			<!-- #endif -->
		</view> 

	</view>
</template>

<script setup lang="ts">
	// 标题
	import { ref, computed, watch } from 'vue';
	import useDiyStore from '@/app/stores/diy';
	import { onLoad } from '@dcloudio/uni-app'
	import { getCpsLink } from '@/addon/cps/api/cps';

	const props = defineProps(['component', 'index', 'pullDownRefresh']);
	const diyStore = useDiyStore();
	let Detail = ref<Array<any>>([]);

	const diyComponent = computed(() => {
		if (diyStore.mode == 'decorate') {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	})

	onLoad(() => {
		getCpsLink('config').then((res) => {
			if (res.data) {
				Detail.value = {
					pub_id: res.data.jutuike_pub_id
				}
			}
		});
	});
	const warpCss = computed(() => {
		var style = '';
		if (diyComponent.value.componentBgColor) style += 'background-color:' + diyComponent.value.componentBgColor + ';';
		if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		return style;
	})

	watch(
		() => props.pullDownRefresh,
		(newValue, oldValue) => {
			// 处理下拉刷新业务
		}
	)
</script>

<style lang="scss" scoped>
	/* 单行超出隐藏 */
	.using-hidden {
		word-break: break-all;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		white-space: break-spaces;
	}

	/* 多行超出隐藏 */
	.multi-hidden {
		word-break: break-all;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
</style>