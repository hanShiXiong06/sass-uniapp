<template>
	<view :style="themeColor()">
		<category-template-one-one class="category" v-if="config.level === 1 && config.template === 'style-1'"
			:categoryId="categoryId" :config="config" />
		<category-template-two-one v-if="config.level === 2 && config.template === 'style-1'" :categoryId="categoryId"
			:config="config" />
		<category-template-two-two class="category" v-if="config.level === 2 && config.template === 'style-2'"
			:categoryId="categoryId" :config="config" />
	</view>
</template>
<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue';
import categoryTemplateTwoOne from '@/addon/phone_shop/pages/goods/components/category-template-two-one.vue';
import categoryTemplateOneOne from '@/addon/phone_shop/pages/goods/components/category-template-one-one.vue';
import categoryTemplateTwoTwo from '@/addon/phone_shop/pages/goods/components/category-template-two-two.vue';
import { getGoodsCategoryConfig } from '@/addon/phone_shop/api/goods';
import useCartStore from '@/addon/phone_shop/stores/cart'
import useMemberStore from "@/stores/member";
import { useLogin } from "@/hooks/useLogin";

const memberStore = useMemberStore();
const userInfo = computed(() => memberStore.info);

const cartStore = useCartStore();
const config = ref({})
const categoryId = ref(0)

const getGoodsCategoryConfigFn = () => {
	getGoodsCategoryConfig().then(res => {
		config.value = res.data
		uni.setNavigationBarTitle({
			title: config.value.page_title
		});
	})
}


onLoad((options: any) => {
	if (!userInfo.value) {
		let pid = uni.getStorageSync("pid");
		if (pid && pid > 0) {
			useLogin().setLoginBack({
				url: "/addon/phone_shop/pages/goods/category?mid=" + pid,
			});

		} else {
			useLogin().setLoginBack({ url: "/addon/phone_shop/pages/goods/category" });

		}
	}
	categoryId.value = options.category_id || 0;
	getGoodsCategoryConfigFn()
});

onShow(() => {
	// 查询购物车列表
	cartStore.getList();
})

</script>
<style>
/*  #ifdef  H5  */
:deep(.category .detail .mescroll-body) {
	padding-bottom: calc(50px + constant(safe-area-inset-bottom)) !important;
	padding-bottom: calc(50px + env(safe-area-inset-bottom)) !important;
}

:deep(.category .cart .mescroll-body) {
	padding-bottom: calc(100rpx + 50px + constant(safe-area-inset-bottom)) !important;
	padding-bottom: calc(100rpx + 50px + env(safe-area-inset-bottom)) !important;
}

/*  #endif  */
/*  #ifndef  H5  */
.category .detail .mescroll-body {
	padding-bottom: calc(100rpx + constant(safe-area-inset-bottom)) !important;
	padding-bottom: calc(100rpx + env(safe-area-inset-bottom)) !important;
}

.category .cart .mescroll-body {
	padding-bottom: calc(200rpx + constant(safe-area-inset-bottom)) !important;
	padding-bottom: calc(200rpx + env(safe-area-inset-bottom)) !important;
}

/*  #endif  */
.category .labelPopup :deep(.u-transition) {
	top: 92rpx !important;
	left: 182rpx !important;
	z-index: 8 !important;
}

.category .labelPopup.active :deep(.u-transition) {
	top: 198rpx !important;
}
</style>
<style lang="scss" scoped>
:deep(.mescroll-upwarp) {
	box-sizing: border-box;
	padding-left: 182rpx;
}

:deep(.tab-bar-placeholder) {
	display: none !important;
}

:deep(.u-tabbar__placeholder) {
	display: none !important;
}

button::after {
	border: 0 !important;
}
</style>
