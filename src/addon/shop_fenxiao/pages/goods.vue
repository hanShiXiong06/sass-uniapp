<template>
	<view class="bg-[#f8f8f8] min-h-[100vh]" :style="themeColor()">
		<mescroll-body ref="mescrollRef" top="350rpx" @init="mescrollInit" @up="getData" :down="{ use: false }">
			<view class="fixed top-0 left-0 right-0 z-10">
			    <view class="w-[100%] h-[340rpx]" :style="{ backgroundImage: 'url(' + img('addon/shop_fenxiao/fenxiao_goods_bg.png') + ')','background-size': 'cover' }"></view>
			</view>
			<view class="bg-white flex p-[20rpx] mx-[30rpx] rounded-[16rpx] overflow-hidden mt-[20rpx]"  v-for='(item,index) in list' :key="index" :class="{ 'mb-[20rpx]': (index+1) == list.length}" @click="toLink(item)">
				<u--image class="rounded-[10rpx] overflow-hidden" width="190rpx" height="190rpx" :src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')" model="aspectFill">
					<template #error>
						<u-icon name="photo" color="#999" size="50"></u-icon>
					</template>
				</u--image>
				<view class="flex-1 flex flex-col ml-[20rpx] py-[6rpx]">
					<view class="text-[28rpx] text-[#303133] leading-[40rpx]  multi-hidden mb-[10rpx]">{{ item.goods_name }}</view>
					<view class="mt-auto flex justify-between items-baseline">
						<view class="text-[var(--price-text-color)] price-font flex items-baseline">
							<text class="text-[26rpx] font-500">￥</text>
							<text class="text-[36rpx] font-500">{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[0] }}</text>
							<text class="text-[24rpx] font-500">.{{ parseFloat(item.goodsSku.price).toFixed(2).split('.')[1] }}</text>
						</view>
						<view @click.stop="openShareFn(item)" class="text-[22rpx] flex items-center border-[2rpx] border-solid border-[var(--price-text-color)] px-[12rpx] py-[8rpx] rounded-[50rpx] text-[var(--price-text-color)]">
							<text class="iconfont iconfenxiang1 mr-[4rpx] !text-[28rpx]"></text>
							<text>赚{{ item.commission }}元</text>
						</view>
					</view>
				</view>
			</view>
			<mescroll-empty :option="{'icon': img('static/resource/images/empty.png')}" v-if="!list.length && !tableLoading"></mescroll-empty>
		</mescroll-body>
		<share-poster ref="sharePosterRef" posterType="fenxiao_goods" :posterParam="posterParam" :copyUrlParam="copyUrlParam" :copyUrl="copyUrl" />

		<!-- #ifdef MP-WEIXIN -->
		<!-- 小程序隐私协议 -->
		<wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
	import { redirect, img } from '@/utils/common';
	import { onLoad, onShow, onPageScroll, onReachBottom } from '@dcloudio/uni-app'
	import {ref, computed, reactive} from 'vue'
	import { t } from '@/locale'
	import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue'
	import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue'
	import useMescroll from '@/components/mescroll/hooks/useMescroll.js'
	import { getFenxiaoGoodsList } from '@/addon/shop_fenxiao/api/fenxiao';
	import useMemberStore from '@/stores/member'
    import sharePoster from '@/components/share-poster/share-poster.vue'

    const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);
	
	// 会员信息
	const memberStore = useMemberStore()
	const userInfo = computed(() => memberStore.info)
	
	let list = ref([]);
	let tableLoading = ref<boolean>(true);

	const getData = (mescroll) => {
		let data: object = {
			page: mescroll.num,
			limit: mescroll.size
		};
		tableLoading.value = true;
		getFenxiaoGoodsList(data).then((res) => {
			let newArr = (res.data.data as Array<Object>);
			//设置列表数据
			if (mescroll.num == 1) {
				list.value = []; //如果是第一页需手动制空列表
			}
			list.value = list.value.concat(newArr);
			tableLoading.value = false;
			mescroll.endSuccess(newArr.length);
		}).catch(() => {
			tableLoading.value = false;
			mescroll.endErr(); // 请求失败, 结束加载
		})
	}

    const toLink = (data) => {
        redirect({ url: '/addon/shop/pages/goods/detail', param: { goods_id: data.goods_id } })
    }
	
	/************* 分享海报-start **************/
	let sharePosterRef = ref(null);
	let copyUrlParam = ref('');
	let copyUrl = ref('');
	let posterParam = {};
	// 分享海报链接
	const copyUrlFn = (data)=>{
		copyUrl.value = '/wap/addon/shop/pages/goods/detail';
		copyUrlParam.value = '?goods_id=' + data.goods_id;
		if (userInfo.value && userInfo.value.member_id) copyUrlParam.value += '&mid=' + userInfo.value.member_id;
	}
	const openShareFn = (data)=>{
		posterParam.sku_id = data.goodsSku.sku_id;
		if (userInfo.value && userInfo.value.member_id)
			posterParam.member_id = userInfo.value.member_id;
		copyUrlFn(data);
		sharePosterRef.value.openShare()
	}
	/************* 分享海报-end **************/
</script>

<style lang="scss" scoped>
	.mescroll-body{
		min-height: calc(100vh - 350rpx) !important;
	}
</style>