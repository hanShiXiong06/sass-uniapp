<template>
	<view :style="themeColor()">

		<u-loading-page :loading="diy.getLoading()" loadingText="" bg-color="#f7f7f7" />

		<view v-show="!diy.getLoading()">

			<!-- 自定义模板渲染 -->
			<view class="diy-template-wrap bg-index" v-if="diy.data.pageMode != 'fixed'" :style="diy.pageStyle()">

				<diy-group ref="diyGroupRef" :data="diy.data" :pullDownRefreshCount="diy.pullDownRefreshCount" />

			</view>

			<!-- 固定模板渲染 -->
			<view class="fixed-template-wrap" v-if="diy.data.pageMode == 'fixed'">

				<fixed-group :data="diy.data" :pullDownRefreshCount="diy.pullDownRefreshCount" />

			</view>

		</view>

		<!-- #ifdef MP-WEIXIN -->
		<!-- 小程序隐私协议 -->
		<wx-privacy-popup ref="wxPrivacyPopupRef"></wx-privacy-popup>
		<!-- #endif -->

	</view>
</template>

<script setup lang="ts">
	import { ref, computed } from 'vue';
	import { useDiy } from '@/hooks/useDiy'
	import { redirect } from '@/utils/common';
	import diyGroup from '@/addon/components/diy/group/index.vue'
	import fixedGroup from '@/addon/components/fixed/group/index.vue'
	import useMemberStore from '@/stores/member'
	import { timeChange, authLogin, getLocationData } from "@/addon/tk_cps/utils/ts/common";
	authLogin()
	// 会员信息
	const memberStore = useMemberStore()
	const userInfo = computed(() => memberStore.info)

	const diy = useDiy({
		name: 'DIY_TK_CPS_MEMBER_INDEX'
	})

	const diyGroupRef = ref(null)

	// 监听页面加载
	diy.onLoad();

	// 监听页面显示
	diy.onShow((data : any) => {
		if (data.value) {
			// uni.setNavigationBarTitle({
			// 	title: diyData.title
			// })
		} else if (data.page) {
			// 跳转到设置的启动页
			redirect({ url: data.page, mode: 'reLaunch' })
		}
		diyGroupRef.value?.refresh();
		if (userInfo.value) {
			useMemberStore().getMemberInfo()
		}
	});

	// 监听页面卸载
	diy.onUnload();

	// 监听下拉刷新事件
	diy.onPullDownRefresh()

	// 监听滚动事件
	diy.onPageScroll()
</script>
<style lang="scss" scoped>
	@import '@/styles/diy.scss';
</style>
<style lang="scss">
	.diy-template-wrap {

		/* #ifdef MP */
		.child-diy-template-wrap {
			::v-deep .diy-group {
				>.draggable-element.top-fixed-diy {
					display: block !important;
				}
			}
		}

		/* #endif */
	}
</style>