<template>
    <view class="discount bg-[#f6f6f6] min-h-[100vh]" :style="themeColor()">
	    <!-- #ifdef MP-WEIXIN -->
	    <top-tabbar :data="param" titleColor="#fff" class="top-header"/>
	    <!-- #endif -->
        <view class="fixed top-0 left-0 w-full z-10 text-[0]">
            <swiper v-if="bannerList.length" class="swiper ns-indicator-dots h-[490rpx]" autoplay="true" circular="true" :interval="5000" indicator-dots>
                <swiper-item class="swiper-item" v-for="(item,index) in bannerList" :key="index">
                    <view @click="toRedirect(item.toLink)">
                        <view class="item h-[490rpx]">
                            <image v-if="item.imageUrl" :src="img(item.imageUrl)" mode="scaleToFill" class="w-full h-full" :show-menu-by-longpress="true"/>
                        </view>
                    </view>
                </swiper-item>
            </swiper>
			<image v-if="!bannerListLoading&&!bannerList.length" :src="img('addon/shop/discount/discount_banner.png')" mode="scaleToFill" class="w-full h-[490rpx]" :show-menu-by-longpress="true"/>
			<!-- #ifdef H5 -->
            <view class="relative w-full h-[110rpx] mt-[-40rpx] z-5" v-if="discountList.length">
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
			<view class="relative w-full h-[110rpx] mt-[-24rpx] z-5" v-if="discountList.length">
			<!-- #endif -->
                <view class="bg-[#f24f3d] w-[750rpx] rounded-tl-[24rpx] rounded-tr-[24rpx] h-[96rpx] absolute left-0 bottom-0"></view>
                <scroll-view :scroll-x="true" class="h-[110rpx] absolute left-0 bottom-0 z-5">
                    <view class="flex items-end h-[100%]" :style="{'width':187.5*discountList.length+'rpx'}" >
                        <view class="w-[187.5rpx] h-[96rpx] relative flex-shrink-0" v-for="(item,index) in discountList" @click="navClick(item)">
                            <view class="w-full absolute left-0 top-0 z-10 text-[#fff] text-center pt-[10rpx]">
                                <view class="text-[28rpx] leading-[39rpx] font-500 px-[10rpx] h-[39rpx] overflow-hidden" :class="{'!text-[#333]':active==item.active_id}">{{item.active_desc}}</view>
                                <view class="flex justify-center w-full">
                                    <text class="text-[22rpx] leading-[34rpx] font-400 mt-[5rpx]" :class="{'active flex items-center justify-center':active==item.active_id}">{{item.active_status=='not_active'?'预告':item.active_status_name}}</text>
                                </view>
                            </view>
                            <template v-if="active==item.active_id">
                                <image v-if="discountList.length<4" class="absolute bottom-0 z-5 h-[110rpx] z-5" :class="{'left-0 w-[230rpx]':index==0,'left-[-41.25rpx] w-[270rpx]':index!=0}" :src="img(index==0?'addon/shop/discount/nav-left.png':'addon/shop/discount/nav-center.png')" />
                                <image v-if="discountList.length>=4" class="absolute bottom-0 z-5 h-[110rpx] z-5" :class="{'left-0 w-[230rpx]':index==0,'left-[-41.25rpx] w-[270rpx]':index!=0&&index!=discountList.length-1 ,'right-0 w-[230rpx]':index==discountList.length-1}" :src="img(index==0?'addon/shop/discount/nav-left.png':index==discountList.length-1?'addon/shop/discount/nav-right.png':'addon/shop/discount/nav-center.png')" />
                            </template>
                        </view>
                    </view>
                </scroll-view>
            </view>

        </view>

	    <mescroll-body v-if="discountList.length" ref="mescrollRef" :top="mescrollTop" @init="mescrollInit" :down="{ use: false }" @up="getActiveDiscountGoodsListFn">
            <view class="px-[30rpx] bg-[#F4F6F8]">
				<block v-for="(item,index) in list" :key="index">
					<view class="bg-[#fff] p-[20rpx] flex rounded-[16rpx]" :class="{'mb-[20rpx]':index<list.length-1,'mb-[30rpx]':index==list.length-1}" @click="toLink(item.goodsSku.sku_id)">
						<view class="w-[190rpx] h-[190rpx] rounded-[16rpx]">
							<u--image  v-if="item.activeGoods.active_goods_status!='active'" width="190rpx" height="190rpx" :src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')" model="aspectFill" @click="toast(item)">
								<template #error>
									<u-icon name="photo" color="#999" size="50"></u-icon>
								</template>
							</u--image>
							<u--image  v-else width="190rpx" height="190rpx" :src="img(item.goods_cover_thumb_mid ? item.goods_cover_thumb_mid : '')" model="aspectFill">
								<template #error>
									<u-icon name="photo" color="#999" size="50"></u-icon>
								</template>
							</u--image>
						</view>

						<view class="ml-[20rpx] flex-1 flex flex-col justify-between">
							<view>
								<view class="w-[390rpx] max-h-[78rpx] text-[28rpx] leading-[39rpx] multi-hidden">
									{{ item.goods_name }}
								</view>
								<view v-if="item.goods_label_name&&item.goods_label_name.length" class="w-[390rpx] mt-[10rpx] text-[#999999] text-[24rpx] font-400 max-h-[68rpx] multi-hidden">
									{{item.goods_label_name.map(el=>el.label_name).join(' | ')}}
								</view>
							</view>

							<view class="w-full h-[78rpx] bg-[#FFECEC] flex justify-between rounded-[40rpx]">
								<view class="mr-[20rpx] pl-[29rpx] flex-1 flex flex-col justify-center">
									<view class="text-[#EF000C] flex items-center">
										<view>
											<text class="text-[20rpx] font-500">￥</text>
											<text class="text-[36rpx] font-bold">{{parseFloat(item.goodsSku.active_discount_price).toFixed(2).split('.')[0]}}.</text>
											<text class="text-[26rpx] font-bold">{{parseFloat(item.goodsSku.active_discount_price).toFixed(2).split('.')[1]}}</text>
										</view>
										<view v-if="item.goodsSku.active_discount_rate<10" class="px-[4rpx] border-[1rpx] border-[#EF000C] border-solid h-[20rpx] text-[18rpx] ml-[6rpx] rounded-[4rpx] leading-[20rpx] flex items-center">{{item.goodsSku.active_discount_rate}}折</view>
									</view>
									<view class="flex items-center mt-[-5rpx]">
										<view class="w-[20rpx] h-[20rpx] mr-[2rpx] rounded-[10rpx] text-center text-[#fff] bg-[#EF000C] flex items-center justify-center" :class="{'!bg-[#FF8540]':item.activeGoods.active_goods_status!='active'}">
											<text class="text-[12rpx] iconzhekou iconfont"></text>
										</view>
										<view class="text-[18rpx] font-400 text-[#EF000C]" :class="{'!text-[#FF8540]':item.activeGoods.active_goods_status!='active'}">已省{{item.goodsSku.active_reduce_money}}元</view>
									</view>
								</view>
								<view class="active-button w-[106rpx] h-[78rpx] box-border pl-[25rpx] leading-[78rpx] text-[#fff]" :class="{'!w-[116rpx]':item.activeGoods.active_goods_status!='active'}" :style="{'background-image':'url(' + img(item.activeGoods.active_goods_status!='active'?'addon/shop/discount/no-active.png':'addon/shop/discount/active.png') + ')'}">
									<text v-if="item.activeGoods.active_goods_status!='active'" class="text-[26rpx] font-500" @click="toast(item)">{{item.activeGoods.active_goods_status_name}}</text>
									<view v-else class="h-full flex items-center justify-between"  @click="toLink(item.goodsSku.sku_id)">
										<text class="text-[40rpx]">抢</text>
										<text class="text-[20rpx] iconxiayibu iconfont mr-[16rpx]"></text>
									</view>
								</view>
							</view>
						</view>
					</view>
                </block>
				<view class="flex justify-center w-[100%] items-center justify-center bg-[#fff] rounded-[16rpx]"  :class="{'h-[calc(100vh-620rpx)]':discountList.length,'h-[calc(100vh-550rpx)]':!discountList.length}" v-if="!list.length && !loading">
                    <mescroll-empty :option="{tip : '暂无商品，请看看其他商品吧！'}"></mescroll-empty>
                </view>
            </view>
        </mescroll-body>
		<view class="flex justify-center items-center justify-center bg-[#fff] rounded-[16rpx] h-[calc(100vh-550rpx)] fixed left-[30rpx] right-[30rpx]" :style="{'top':mescrollTop}" v-if="!discountList.length && !loading">
		    <mescroll-empty :option="{tip : '暂无活动，请看看其他商品吧！'}"></mescroll-empty>
		</view>
        <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#303133"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLogin } from '@/hooks/useLogin'
import { img, redirect, getToken, currRoute, diyRedirect } from '@/utils/common';
import { getActiveDiscountConfig,getActiveDiscountList,getActiveDiscountGoodsList } from '@/addon/shop/api/discount'
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue'
import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue'
import useMescroll from '@/components/mescroll/hooks/useMescroll.js'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'

let menuButtonInfo = {};
// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
menuButtonInfo = uni.getMenuButtonBoundingClientRect();
// #endif

const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom)
const bannerList = ref<Array<Object>>([])
const discountList = ref<Array<Object>>([])
const active = ref<number>(0)
const active_name = ref<String>('')
const list = ref<Array<Object>>([]);
const loading = ref<boolean>(true);
const bannerListLoading = ref<boolean>(true);

let param = ref({
    title:'',
    topStatusBar: {
        style: 'style-1',
        bgColor: 'transparent',
        textColor: '#fff'
    }
})

const getActiveDiscountConfigFn = ()=>{
	bannerListLoading.value = true
    getActiveDiscountConfig().then((res:any)=>{
        bannerList.value = res.data
		bannerListLoading.value = false
    }).catch(()=>{
		bannerListLoading.value = false
	})
}

getActiveDiscountConfigFn()
const getActiveDiscountListFn = ()=>{
    getActiveDiscountList({limit:4}).then((res:any)=>{
        discountList.value = res.data
		calculateHeight();
		if(discountList.value&&discountList.value.length){
			navClick(res.data[0]);
		}else{
			loading.value = false
		}
        
    })
}
getActiveDiscountListFn()
const navClick = (item:any)=>{
    active.value = item.active_id
    active_name.value = item.active_status_name
    getMescroll().resetUpScroll();
	uni.pageScrollTo({
	    scrollTop: 0, //距离页面顶部的距离
	    duration: 1
	});
}
const getActiveDiscountGoodsListFn = (mescroll) => {
	if(discountList.value.length == 0) return;
	
	loading.value = true;
	let data: object = {
		page: mescroll.num,
		limit: mescroll.size,
        active_id:active.value
	};

	getActiveDiscountGoodsList(data).then((res) => {
		let newArr = (res.data.data as Array<Object>).map((el: any) => {return el})
		//设置列表数据
		if (mescroll.num == 1) {
			list.value = []; //如果是第一页需手动制空列表
		}
		list.value = list.value.concat(newArr);
		mescroll.endSuccess(newArr.length);
		loading.value = false;
	}).catch(() => {
		loading.value = false;
		mescroll.endErr(); // 请求失败, 结束加载
	})
}
const toRedirect =(data:any)=>{
	if (Object.keys(data).length) {
		if (!data.name) return;
		if (currRoute() == 'app/pages/member/index' && !getToken()) {
			useLogin().setLoginBack({ url: data.url })
			return;
		}
		diyRedirect(data);
	}
}

const toLink = (sku_id : string) => {
	redirect({ url: '/addon/shop/pages/goods/detail', param: { sku_id } })
}
const toast = (item:any)=>{
	uni.showToast({ title: `活动${item.activeGoods.active_goods_status_name}`, icon: 'none' })
}

let mescrollTop = ref('')
const calculateHeight = ()=>{
	mescrollTop.value = discountList.value.length ? '590' : '520';
	// #ifdef MP-WEIXIN
	mescrollTop.value = mescrollTop.value - (menuButtonInfo.height + menuButtonInfo.top) * 2;
	// #endif
	mescrollTop.value = mescrollTop.value + 'rpx'
}
</script>

<style lang="scss" scoped>
.swiper.ns-indicator-dots :deep(.uni-swiper-dots-horizontal) {
	bottom:40rpx
}
.swiper.ns-indicator-dots :deep(.uni-swiper-dot) {
	width: 10 rpx;
	height: 6 rpx;
	border-radius: 4 rpx;
	background-color: #fff;
	opacity: 0.5;
}
.swiper.ns-indicator-dots :deep(.uni-swiper-dot-active) {
	width: 20rpx;
    background-color: #fff;
    opacity: 1;
}
.active{
    padding: 0 17rpx;
    line-height: 34rpx;
    border-radius: 29rpx;
    background: linear-gradient( 94deg, #FB7939 0%, #FE120E 99%), #EF000C;
}
.active-button{
    background-size: cover;
    background-repeat: no-repeat;
}
</style>