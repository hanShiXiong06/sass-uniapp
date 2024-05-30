<template>
	<view class="bg-[#f7f7f7] min-h-screen overflow-hidden" :style="themeColor()">
		<view v-if="!loading">
			<u-swiper :list="carousel" height="380rpx" radius="0"></u-swiper>
			<view class="chunk-wrap pt-4 pb-3 rounded-t-2xl relative -mt-[30rpx]">
				<view class="flex justify-between items-center">
					<view class="flex-1">
						<view class="flex items-baseline text-[24rpx] text-[#888]">
							<text class="text-[#FA6400] text-[26rpx] price-font">￥</text>
							<text class="text-[#FA6400] text-[38rpx] price-font">{{detail.price}}</text>
							<text class="ml-1">/人起</text>
							<!-- <text class="ml-3">年销量268</text> -->
						</view>
						<!-- <view class="flex justify-between text-[#543E3E] items-baseline member-price mt-3 pl-2 pb-1 rounded-l-md">
							<text class="text-xs">会员价: 188/人</text>
							<view class="text-xs">立即开通<text class="iconfont iconxiangyoujiantou text-base"></text></view>
						</view> -->
					</view>

					<view class="flex flex-col items-center text-[#6D7278] ml-[40rpx] pl-[50rpx] pr-[30rpx] border-0 border-l border-solid border-[#F0F0F0]" @click="sharePopupShow = true">
						<text class="iconfont iconfenxiang font-bold text-lg"></text>
						<text class="mt-1 text-xs">分享</text>
					</view>
				</view>
				<view class="mt-2 font-bold multi-hidden">{{detail.way_name}}</view>
				<view class="flex flex-wrap mt-3 text-xs">
					<text class="text-[#696969] border-1 border-solid border-[#E4E4E4] rounded-md px-3 py-1" v-if="detail.group_buy_type_name">{{detail.group_buy_type_name}}</text>
					<text class="text-[#696969] border-1 border-solid border-[#E4E4E4] rounded-md px-3 py-1 ml-2" v-if="detail.travel_type_name">{{detail.travel_type_name}}</text>
					<text class="text-[#696969] border-1 border-solid border-[#E4E4E4] rounded-md px-3 py-1 ml-2" v-if="detail.way_theme_name">{{detail.way_theme_name}}</text>
					<text class="text-[#696969] border-1 border-solid border-[#E4E4E4] rounded-md px-3 py-1 ml-2" v-if="detail.way_traffic_name">{{detail.way_traffic_name}}</text>
				</view>
				<view class="flex justify-between mt-3 text-xs text-[#696969]">
					<view class="flex flex-wrap flex-1">
						<text>出发城市：{{detail.start_city}}</text>
						<text class="iconfont iconshuangxiang mx-3"></text>
						<text>目的地：{{detail.end_city}}</text>
					</view>
					<!-- <text>库存：{{detail?.goods?.stock||0}}</text> -->
				</view>
			</view>

			<u-popup :show="sharePopupShow" @close="sharePopupShow = false" :closeable="true">
			    <view class="text-center py-[30rpx] font-bold leading-none">
			        <text>分享</text>
			    </view>
			    <view class="flex justify-center pt-3 pb-5">
					<view class="flex flex-col items-center" @click="copyFn()">
						<text class="iconfont iconlianjie-tianchong text-3xl text-[#07c160] "></text>
						<text class="text-sm mt-1">复制</text>
					</view>
				</view>
			</u-popup>

			<view class="chunk-wrap">
				<view class="chunk-head">
					<text>出发日期</text>
					<text @click="wayShow=true">查看<text class="iconfont iconxiangyoujiantou text-base"></text></text>
				</view>
				<view class="flex pt-[28rpx] pb-[24rpx]">
					<view :class="['relative flex flex-col items-center justify-center w-[130rpx] h-[142rpx] border-1 border-solid border-[#F0F0F0] mr-[14rpx] text-sm rounded',{'bg-[#F8F8F8]': !priceCalendar[item.initInfo], 'border-color': index == departureDateSelect,'border-[#F0F0F0]': index != departureDateSelect}]" v-for="(item,index) in departureDate" @click="departureDateFn(item,index)">
						<image class="w-[26rpx] h-[26rpx] absolute bottom-0 right-0" :src="img('addon/tourism/tourism/way/check.png')" mode="aspectFill" v-if="index == departureDateSelect"></image>
						<text class="text-[#9B9B9B] text-xs">{{item.topInfo}}</text>
						<text class="mt-[4rpx]">{{item.centerInfo}}</text>
						<text class="text-[#FA6400] text-xs" v-if="item.bottomInfo">{{item.bottomInfo}}</text>
					</view>
					<view class="relative flex flex-col items-center justify-center w-[130rpx] h-[142rpx] border-1 border-solid border-[#F8F8F8] text-sm rounded bg-[#F8F8F8]" @click="wayShow=true">
						<text class="iconfont iconrili text-[44rpx] text-[#707070]"></text>
						<text class="text-xs text-[#9B9B9B] mt-[4rpx]">更多</text>
					</view>
				</view>
			</view>

			<view class="chunk-wrap pt-[34rpx] scheduling">
				<view class="text-center text-[34rpx] font-bold">-- 费用说明 --</view>
				<view class="scheduling-content">
					<u-parse :content="detail.fee_desc" :tagStyle="{img: 'vertical-align: top;'}" v-if="detail?.fee_desc"></u-parse>
					<text v-else class="pb-5 block">暂无费用说明</text>
				</view>
			</view>
			<view class="chunk-wrap pt-[34rpx] scheduling">
				<view class="text-center text-[34rpx] font-bold">-- 线路特点 --</view>
				<view class="scheduling-content">
					<u-parse :content="detail.way_character" :tagStyle="{img: 'vertical-align: top;'}" v-if="detail?.way_character"></u-parse>
					<text v-else class="pb-5 block">暂无线路特点</text>
				</view>
			</view>
			<view class="h-[148rpx] w-screen"></view>
			<view class="flex justify-between bg-white p-3 fixed bottom-0 left-0 right-0">
				<view class="flex flex-col items-center" @click="toIndex">
					<image class="w-[38rpx] h-[38rpx]" :src="img('addon/tourism/tourism/way/index.png')" mode="aspectFill"></image>
					<text class="text-xs text-[#363636] mt-1">返回首页</text>
				</view>
				<!-- <u-button class="!w-[276rpx] !rounded-3xl !mr-[24rpx]" type="primary" :plain="true" size="16">在线咨询</u-button> -->
				<u-button  color="var(--primary-color)" shape="circle" :customStyle="{lineHeight:'76rpx', margin:'0rpx', color:'#fff',width:'276rpx'}"  size="16" @click="toOrder(detail)">立即报名</u-button>
			</view>
		</view>
		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" fontSize="16" color="#333"></u-loading-page>
		<!-- 出发日期 -->
		<block v-if="isWayShow">
			<u-calendar :show="wayShow"
				:defaultDate="orderData.reserve_time"
				@confirm="confirm"
				@close="wayShow=false"
				:formatter="formatter"
				confirmDisabledText="请选择离店日期"
				ref="calendar"
				monthNum="2"
			></u-calendar>
		</block>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { img, timeStampTurnTime, redirect, getToken, copy } from '@/utils/common';
	import { getWayInfo, getWayGoodsDay } from '@/addon/tourism/api/tourism';
	import { useLogin } from '@/hooks/useLogin';

	let carousel = ref([])
	let detail = ref<Array<any>>([]);
	let loading = ref<boolean>(true);
	let wayShow = ref<boolean>(false);
	let isWayShow = ref<boolean>(false);
	let way_id = ref("");
	let sharePopupShow = ref<boolean>(false);

	// 向待创建订单提交
	let orderData = ref(
		{
			way_id: '',
			reserve_time: '',
			num: 1
		});
	// 出发日期展示
	let departureDate = ref([]);
	let departureDateSelect = ref(0);

	onLoad((option) => {
		way_id.value = option.way_id;
		loading.value = true;
		getWayGoodsDayFn(option.way_id);
		getWayInfo(option.way_id).then((res) => {
			detail.value = res.data;
			// 设置头部
			uni.setNavigationBarTitle({
				title: detail.value.way_name
			});

			// 线路图片
			carousel.value = [];
			if(detail.value.goods.image_thumb_big && detail.value.goods.image_thumb_big.length && detail.value.goods.image_thumb_big.toString() != ''){
				// detail.value.goods.goods_image = detail.value.goods.goods_image.split(",").filter((item)=>{
				// 	return item && item.trim();
				// })
				detail.value.goods.image_thumb_big.forEach((item,index)=>{
					carousel.value.push(img(item))
				})
			}else{
				carousel.value.push(img(detail.value.goods.cover_thumb_big))
			}

			loading.value = false;
		}).catch(() => {
			loading.value = false;
		});
	})

	// 价格日历
	let priceCalendar = {}
	const confirm = (e)=>{
		let time = new Date(e[0]).getTime()
		initFn(time);
		departureDateSelect.value = 0;
		wayShow.value = false;
        orderData.value.reserve_time = e[0];

		// 变更价格
		detail.value.goods.price = priceCalendar[e[0]];
	}
	const formatter = (day) => {
		const time = timeStampTurnTime(Date.parse(day.date)/1000,"year_month_day");
		if(priceCalendar[time])
		{
			day.bottomInfo = priceCalendar[time]
		}
		return day
	}
	const getWayGoodsDayFn = (id)=>{
		getWayGoodsDay(id).then((res) => {
			let data = res.data;
			if(data){
				priceCalendar = data;
			}
			isWayShow.value = true;
			initFn();
		}).catch(() => {
			loading.value = false;
		})
	}

	// 格式转换
	const formatConverter = (time)=>{
		var arr = [];
		if(time.indexOf("-") != -1)
			arr = time.split('-');
		else if(time.indexOf("/") != -1)
			arr = time.split('/');
		return arr[1]+'-'+arr[2];
	}

	// 获取某天的日期
	const getSpecificDate = (day,dateVal="")=>{
		//计算出要加/ 减的毫秒数
		var num = 1000*60*60*24*day;
		var newDate;
		if(dateVal) newDate = new Date(dateVal+num) ;
		else newDate = new Date(Date.now()+num) ;
		return newDate
	}
	const config  = (time)=>{
		// let d = new Date()
		let year = time.getFullYear()
		let month = time.getMonth() + 1
		let day = time.getDate()
		let date = `${year+'-'+ (month < 10 ? '0'+month : month) +'-'+ (day<10 ? '0'+day : day)}`
		return date
	}
	const initFn = (dateVal='')=>{
		let day;
		let week = ['周日','周一','周二','周三','周四','周五','周六'];
		departureDate.value = [];
		for(let i = 0; i < 4; i++){
			day = {};
			let time = config(getSpecificDate(i,dateVal));
			day.centerInfo = formatConverter(time);
			let time1 = time.split("/").map((item)=>{
				let data = "";
				if(item < 10) data = "0"+item;
				else data = item;
				return data
			}).join('-');
			day.bottomInfo = priceCalendar[time1] || '';
			day.topInfo = week[new Date(time1).getDay()];
			day.initInfo = time1;
			departureDate.value.push(day);
		}

		// 初始化time
		orderData.value.reserve_time = config(getSpecificDate(0))
	}

	// 出发日期
	const departureDateFn = (item,index)=>{
        if (!priceCalendar[item.initInfo]) return
		departureDateSelect.value = index;
		orderData.value.reserve_time = item.initInfo;

		// 变更价格
		detail.value.price = priceCalendar[item.initInfo];
	}

	// 跳转到首页
	const toIndex = ()=>{
		redirect({ url: '/addon/tourism/pages/index', mode: 'reLaunch'});
	}

	// 跳转到详情
	const toOrder = (data)=>{
		orderData.value.way_id = data.goods.goods_id;
		if(!getToken()){
			useLogin().setLoginBack({ url: '/addon/tourism/pages/way/detail',param:{way_id: way_id.value}})
			return false;
		}
		uni.setStorageSync('wayCreateData', orderData.value);
		redirect({ url: '/addon/tourism/pages/way/order'});
	}

	// 复制
	const copyFn = ()=>{
		let data = ''
		// #ifdef  H5
		data = location.origin +  location.pathname + '?way_id='+way_id.value;
		// #endif
		// #ifdef  MP-WEIXIN
		let baseUrl = import.meta.env.VITE_APP_BASE_URL 
		let currentRoutes = getCurrentPages()// 获取当前打开过的页面路由数组
		let currentRoute = currentRoutes[currentRoutes.length - 1].route; //获取当前页面路由
		data = baseUrl + currentRoute + '?way_id='+way_id.value;
		// #endif
		copy(data);
	}

</script>

<style lang="scss" scoped>
	.chunk-wrap{
		@apply bg-white px-4 mb-2;
		.chunk-head{
			height: 84rpx;
			@apply flex justify-between items-center border-0 border-b border-solid border-[#F2F2F2] box-border;
			text{
				&:first-of-type{
					@apply font-bold;
				}
				&:last-of-type{
					@apply text-xs text-[#999];
				}
				.iconfont{
					@apply inline-block;
					margin-left: 2rpx;
				}
			}
		}
	}
	.member-price{
		background: linear-gradient(90deg, #FEF3E7 0%, #FFFFFF 100%);
	}
	.scheduling{
		overflow: hidden;
		.scheduling-content{
			@apply mt-4;
			& > view{
				@apply flex mb-7;
				image{
					width: 54rpx;
					height: 54rpx;
					@apply mr-3;
					&+view{
						margin-top: 6rpx;
					}
				}
				.title{
					@apply font-bold mb-3;
				}
				.desc{
					width: 580rpx;
					background-color: #F7F8F9;
					color: #8F9192;
					@apply p-3 text-sm box-border;
				}
			}
		}
	}
	:deep(.scheduling-content img){
		vertical-align: middle;
	}
	.border-color{
		border-color: var(--primary-color);
	}
</style>