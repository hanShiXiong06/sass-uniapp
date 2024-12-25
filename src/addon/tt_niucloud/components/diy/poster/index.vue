<template>
	<view :style="warpCss" v-if="isShowPoster">
		<view :style="maskLayer"></view>
		<view class="diy-active relative">
			<view class="mx-[30rpx] py-[30rpx] rounded-[16rpx] px-[40rpx] box-border w-[calc(100% - 60rpx)]">
				<view class="flex flex-col w-full text-[#333]">
					<view class="text-[24rpx] leading-[34rpx] font-400" :style="{ color: diyComponent.tipColor }">{{ diyComponent.tip }}</view>
					<view class="flex items-baseline">
						<text class="text-[32rpx] leading-[62rpx] font-bold" :style="{ color: diyComponent.textColor }">{{ diyComponent.text }}</text>
					</view>
				</view>
				<view :class="diyComponent.text || diyComponent.tip ? 'mt-[50rpx]' : ''" class="flex justify-between">
					<button class="w-[280rpx] h-[66rpx] rounded-[40rpx] text-[30rpx] !bg-[#fff] !text-[var(--primary-color)] leading-[64rpx] !m-0 border-[2rpx] border-[var(--primary-color)] border-solid box-border" shape="circle" @click="getPosterFn">生成推广海报</button>
					<view class="text-center w-[280rpx] h-[66rpx] rounded-[40rpx] text-[30rpx] !text-[#fff] leading-[66rpx] !m-0"
					style="background: linear-gradient( 94deg, #FB7939 0%, #FE120E 99%), #EF000C;" shape="circle" @click="redirect({ url: '/addon/tt_niucloud/pages/team/index', param: {} })">查看团队成员</view>
				</view>
			</view>
		</view>
	</view>
	<up-popup :show="posterModalShow" mode="center" :closeable="true" @close="posterModalShow = false">
		<image :src="img(poster.img)" mode="widthFix"></image>
	</up-popup>
</template>

<script setup lang="ts">
	// 文章
    import { ref,computed, watch, onMounted, nextTick,getCurrentInstance } from 'vue';
	import { redirect, img } from '@/utils/common';
	import useDiyStore from '@/app/stores/diy';
	import useMemberStore from '@/stores/member'
	import { getMemberPoster } from '@/addon/tt_niucloud/api/member';

	const props = defineProps(['component', 'index', 'pullDownRefreshCount']);
	const diyStore = useDiyStore();
	const memberStore = useMemberStore()
	const memberInfo = computed(() => {
	    return memberStore.info
	})
	
	const diyComponent = computed(() => {
		if (diyStore.mode == 'decorate') {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	})

	const warpCss = computed(() => {
		var style = '';
        style += 'position:relative;';
        if(diyComponent.value.componentStartBgColor) {
            if (diyComponent.value.componentStartBgColor && diyComponent.value.componentEndBgColor) style += `background:linear-gradient(${diyComponent.value.componentGradientAngle},${diyComponent.value.componentStartBgColor},${diyComponent.value.componentEndBgColor});`;
            else style += 'background-color:' + diyComponent.value.componentStartBgColor + ';';
        }

        if(diyComponent.value.componentBgUrl) {
            style += `background-image:url('${ img(diyComponent.value.componentBgUrl) }');`;
            style += 'background-size: cover;background-repeat: no-repeat;';
        }

		if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		return style;
	})

    // 背景图加遮罩层
    const maskLayer = computed(()=>{
        var style = '';
        if(diyComponent.value.componentBgUrl) {
            style += 'position:absolute;top:0;width:100%;';
            style += `background: rgba(0,0,0,${diyComponent.value.componentBgAlpha / 10});`;
            style += `height:${height.value}px;`;

            if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
            if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
            if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
            if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
        }

        return style;
    });

	watch(
		() => props.pullDownRefreshCount,
		(newValue, oldValue) => {
			// 处理下拉刷新业务
		}
	)

	const isShowPoster = ref(false)
    onMounted(() => {
        refresh();
        // 装修模式下刷新
        if (diyStore.mode == 'decorate') {
			isShowPoster.value = true
        } else {
			if (memberInfo.value && diyComponent.value.posterId) {
				isShowPoster.value = true
			} else {
				isShowPoster.value = false
			}
        }
    });

    const instance = getCurrentInstance();
    const height = ref(0)

	const refresh = () => {
        nextTick(() => {
            const query = uni.createSelectorQuery().in(instance);
            query.select('.diy-active').boundingClientRect((data: any) => {
                height.value = data ? data.height : 0;
            }).exec();
        })
	}
	
	const poster = ref([])
	const posterModalShow = ref(false)
	const getPosterFn = () => {
		getMemberPoster({
			id: diyComponent.value.posterId,
			type: diyComponent.value.type,
			param: {
				page: diyComponent.value.page
			}
		}).then((res) => {
			poster.value = res.data
			posterModalShow.value = true
		});
	}
	
</script>

<style lang="scss" scoped>
</style>