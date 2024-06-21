<template>
	<view :style="warpCss">
		<view class="" :style="{ padding:diyComponent.padding* 2 + 'rpx', }">
			<view class="">2222</view>
			<meituan-list data="options"></meituan-list>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, computed } from 'vue';
	import useDiyStore from '@/app/stores/diy';
	const props = defineProps(['component', 'index']);
	const options = reactive({
		pub_id: 26,
		sid: 123456
	})
	const diyStore = useDiyStore();

	const diyComponent = computed(() => {
		if (diyStore.mode == 'decorate') {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	})

	const warpCss = computed(() => {
		var style = '';
		style += 'background:' + diyComponent.value.componentBgColor + ';';
		style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		return style;
	})
</script>

<style lang="scss" scoped>
	.tag {
		background: #dddddd;
		padding: 6rpx 12rpx;
		text-align: center;
		border-radius: 8rpx;
		font-weight: bold;
	}

	.bt {
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		// border: #effeed solid 2rpx;
	}
</style>