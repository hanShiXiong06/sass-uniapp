<template>
	<view :style="themeColor()">
		<u-loading-page :loading="loading && memberInfo" loadingText="" bg-color="#f7f7f7"></u-loading-page>
		<view v-if="!loading && memberInfo && list && list.length" class="bg-[#2f3a58] min-h-[100vh] overflow-hidden flex flex-col">
			<!-- #ifdef MP -->
			<top-tabbar :data="topTabbarData" titleColor="#fff"/>
			<!-- #endif -->
			<view class="pb-[36rpx]">
				<view class="pt-[40rpx] pb-[70rpx]">
					<!-- 轮播图 -->
					<view class="relative mx-[20rpx]">
						<swiper class="swiper ns-indicator-dots" :style="{ height: '340rpx' }" @change="swiperChange"
							indicator-color="rgb(139,139,139)" indicator-active-color="#fff"
							:current = "swiperIndex" :indicator-dots="isIndicatorDots"
							previous-margin="40rpx" next-margin="40rpx">
							<swiper-item class="swiper-item" v-for="(item,index) in list" :key="item.id">
								<view class="h-[340rpx] relative">
									<view v-if="memberInfo.member_level == item.level_id && swiperIndex == index" class="text-[24rpx] absolute top-[42rpx] left-0 z-10 h-[38rpx] !bg-contain w-[144rpx] text-[#fff] flex items-center justify-center" :style="{ background: 'url(' + img('addon/shop/level/carousel_bg_02.png') + ') no-repeat'}">
										当前等级
									</view>
									<view class="absolute left-0 right-0 z-10 px-[40rpx]" :class="{'pt-[108rpx]': memberInfo.member_level == item.level_id, 'pt-[90rpx]': memberInfo.member_level != item.level_id}">
										<view class="flex items-end">
											<view class="flex items-center mb-[-4rpx] mr-[6rpx]">
												<text class="text-[60rpx] skewed-text-10">V</text>
												<text class="text-[60rpx] skewed-text-10">{{index+1}}</text>
											</view>
											<text class="text-[32rpx] text-[#3C2913]">{{item.level_name}}</text>
										</view>
										<view class="text-[#977B48] text-[26rpx] mt-[20rpx]">成长值已达到 {{memberInfo.growth}}</view>
										<view class="flex justify-between items-center mt-[50rpx]">
											<view class="flex flex-col flex-1">
												<view>
													<progress :percent="progress(index)" :border-radius="100" activeColor="#DB9400" backgroundColor="#D9D9D9" stroke-width="6" />
												</view>
												<view class="text-[#977B48] mt-[10rpx] text-[24rpx]" v-if="upgradeGrowth(index) > 0">还需要{{upgradeGrowth(index)}}点成长值升级</view>
												<view class="text-[#977B48] mt-[10rpx] text-[24rpx]" v-if="upgradeGrowth(list.length-1) <= 0 && list.length-1 == index">恭喜您升级到最高等级</view>
											</view>
											<text v-if="upgradeGrowth(index) > 0" class="flex justify-center items-center ml-[90rpx] text-[30rpx] rounded-[50rpx] w-[180rpx] h-[60rpx] text-[#fff] bg-[#3A3842]">加速升级</text>
										</view>
									</view>
									<view class="relatvie h-full w-full">
										<image class="h-full w-full" :src="img(item.level_bg)" mode="aspectFit" :class="{'swiper-animation': swiperIndex != index}" :show-menu-by-longpress="true"/>
									</view>
								</view>
							</swiper-item>
						</swiper>
						<!-- #ifdef MP-WEIXIN -->
						<view v-if="list.length > 1" :class="['swiper-dot-box straightLine']">
							<view v-for="(numItem, numIndex) in list" :key="numIndex" :class="['swiper-dot', { active: numIndex == swiperIndex }]"></view>
						</view>
						<!-- #endif -->
					</view>
				</view>
				<view class="flex px-[58rpx] items-center flex-col" v-if="currLevelInfo.benefits_arr && currLevelInfo.benefits_arr.length">
					<view class="flex items-center justify-center">
						<image class="h-[24rpx]" :src="img('addon/shop/level/arrows_left_01.png')" mode="heightFix" />
						<text class="mx-[30rpx] text-[#FACC80] text-[32rpx] font-bold">会员权益</text>
						<image class="h-[24rpx]" :src="img('addon/shop/level/arrows_right_01.png')" mode="heightFix" />
					</view>
					<view class="flex flex-wrap w-full mt-[46rpx]">
						<view class="flex flex-col w-[25%] items-center" v-for="(item,index) in currLevelInfo.benefits_arr" :key="index">
							<image class="h-[100rpx] w-[100rpx]" :src="img(item.icon)" mode="heightFix" />
							<text class="bg-[#2f3a58] -mt-[18rpx] text-[#FACC80] text-[20rpx] flex items-center h-[36rpx] px-[16rpx] rounded-full border-[2rpx] border-solid border-[#FACC80]">{{item.desc}}</text>
							<text class="text-[rgba(255,255,255,0.9)] mt-[10rpx] text-[24rpx]">{{item.title}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="bg-[#fff] flex-1 rounded-t-[16rpx] px-[30rpx] pt-[30rpx]  tab-bar">
				<!-- 升级礼包 -->
				<view v-if="currLevelInfo.gifts_arr && currLevelInfo.gifts_arr.length">
					<view class="pt-[10rpx] pb-[40rpx] flex items-center justify-center">
						<image class="h-[24rpx]" :src="img('addon/shop/level/arrows_left_02.png')" mode="heightFix" />
						<text class="mx-[30rpx] text-[32rpx] text-[#3A3945] font-bold">升级礼包</text>
						<image class="h-[24rpx]" :src="img('addon/shop/level/arrows_right_02.png')" mode="heightFix" />
					</view>
					<view class="flex flex-wrap">
						<view v-for="(item,index) in currLevelInfo.gifts_arr" :key="idnex" class="relative box-border mb-[40rpx] leading-1 bg-[#FFEAD3] w-[216rpx] h-[220rpx] px-[30rpx] pb-[20rpx] pt-[46rpx] relative rounded-[16rpx] !bg-contain"
							:class="{'mr-[20rpx]': (index+1)%3!=0}"
							:style="{ background: 'url(' + img(item.background) + ') no-repeat'}"
						>
							<text class="absolute left-0 right-0 text-[rgba(58,57,69,0.8)] bottom-[34rpx] text-center text-[24rpx] font-bold z-10">{{item.text}}</text>
						</view>
					</view>
				</view>
				
				<!-- 升级技巧 -->
				<view v-if="upgradeSkills && upgradeSkills.length">
					<view class="pt-[10rpx] pb-[40rpx] flex items-center justify-center">
						<image class="h-[24rpx]" :src="img('addon/shop/level/arrows_left_02.png')" mode="heightFix" />
						<text class="mx-[30rpx] text-[32rpx] text-[#3A3945] font-bold">升级技巧</text>
						<image class="h-[24rpx]" :src="img('addon/shop/level/arrows_right_02.png')" mode="heightFix" />
					</view>
					<view>
						<view class="flex items-center mb-[30rpx]" v-for="(item,index) in upgradeSkills" :key="index">
							<image class="h-[100rpx] w-[100rpx] mr-[20rpx]" :src="img(item.icon)" mode="heightFix" />
							<view class="flex flex-col">
								<view class="text-[#3A3945] text-[28rpx] font-bold mb-[12rpx]">{{item.title}}</view>
								<view class="text-[24rpx] text-[#3A3945]">{{item.desc}}</view>
							</view>
							<text class="skill-btn" @click="redirect({ url: item.button.wap_redirect, param: {} , mode: 'redirectTo'})">{{item.button.text}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<u-empty v-if="!loading && (!list || !list.length)" :icon="img('static/resource/images/empty.png')" text="暂无会员等级" />
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, computed } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { getMemberLevel, getTaskGrowth } from '@/app/api/member';
	import { img,redirect, deepClone, getToken } from '@/utils/common';
    import useMemberStore from '@/stores/member'

	const memberStore = useMemberStore()
	
	let loading = ref(false)
	let list = ref([]) // 会员等级
	let upgradeSkills = ref([]) // 升级技巧
	const swiperIndex = ref(0); //当前滑块的索引
	
	let isIndicatorDots = ref(true) // 是否展示显示面板指示点
	// #ifdef MP
	isIndicatorDots.value = false
	// #endif
	
	// 自定义头部
	let topTabbarData = ref({
		title: '会员等级',
		topStatusBar: {
			style: 'style-1',
			bgColor: 'transparent',
		    textColor: '#fff'
		}
	})
	
	onShow(() => {
		// 判断是否已登录
		if (getToken()) {
			getTaskGrowthFn();
			getMemberLevelFn();
		}
	})
	
	// 会员信息
	const memberInfo = computed(() => {
	    return memberStore.info
	})
	
	// 进度条值
	let progress = (index:any) => {
		let indent = index;
		let num = 100
		if(list.value[indent] && list.value[indent].growth) {
            num = memberInfo.value.growth / list.value[indent].growth * 100
        }
	    return num
	}

	// 所需的成长值
	let upgradeGrowth = (index:any) => {
		let indent = index;
		let num = 0;
		if(list.value[indent] && list.value[indent].growth) {
            num = list.value[indent].growth - memberInfo.value.growth;
        }
	    return num
	}
	
	const getMemberLevelFn = ()=>{
		loading.value = true;
		getMemberLevel().then((res) => {
			list.value = res.data || [];
			
			// 初始化会员等级数据
			let bool = true;
			if(memberInfo.value && list.value && list.value.length){
				list.value.forEach((item,index)=>{
					if(item.level_id == memberInfo.value.member_level){
						bool = false;
						swiperIndex.value = index;
						infoStructureFn(index);
					}
				})
			}
			if(bool) infoStructureFn(0);
			
			loading.value = false;
		}).catch(()=>{
			loading.value = false;
		})
	}
	
	const getTaskGrowthFn = ()=>{
		getTaskGrowth().then((res) => {
			upgradeSkills.value = res.data
		})
	}
	
	const swiperChange = e => {
	    swiperIndex.value = e.detail.current;
		infoStructureFn(e.detail.current);
	};
	
	// 当前的会员等级信息
	let currLevelInfo = ref({});
	let infoStructureFn = (index:number)=>{
		let data = {}
		data = deepClone(list.value[index]);
		// 会员权益
		if(data && data.level_benefits){
			data.benefits_arr = [];
			Object.values(data.level_benefits).forEach((item,index,Array)=>{
				if(item.content){
					data.benefits_arr.push(item.content)
				}
			})
		}
		
		// 升级礼包
		if(data && data.level_gifts){
			data.gifts_arr = [];
			for(let key in data.level_gifts){
				if(data.level_gifts[key].content){
					// 增加类型
					data.level_gifts[key].content.forEach((item,index,Array)=>{
						Array[index].type = key
					})
					data.gifts_arr = data.gifts_arr.concat(data.level_gifts[key].content);
				}
			}
		}
		currLevelInfo.value = data;
	}
</script>

<style lang="scss" scoped>
	.skill-btn{
		padding: 0 20rpx;
		height: 54rpx;
		line-height: 56rpx;
		color: rgba(255,255,255,0.9);
		background: linear-gradient( 180deg, #F1C28C 0%, #DB9E32 85%);
		border-radius: 50rpx;
		margin-left: auto;
		font-size: 24rpx;
	}
	.swiper-animation{
		transform: scale(0.94, 0.94);
		transition-duration: 0.3s;
		transition-timing-function: ease;
	}
	
	// 轮播指示器
	/* #ifdef H5 */ 
	.swiper :deep(.uni-swiper-wrapper){
		overflow: initial;
	}
	/* #endif */
	.swiper :deep(.uni-swiper-dots-horizontal) {
		bottom: -30rpx;
	}
	.swiper.ns-indicator-dots :deep(.uni-swiper-dot) {
		width: 18rpx;
		height: 6rpx;
		border-radius: 4rpx;
	}
	.swiper.ns-indicator-dots :deep(.uni-swiper-dot-active) {
		width: 36rpx;
	}
	.swiper-dot-box {
		position: absolute;
		bottom: -50rpx;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 80rpx 8rpx;
		box-sizing: border-box;
	
		.swiper-dot {
			background-color: #b2b2b2;
			width: 15rpx;
			border-radius: 50%;
			height: 15rpx;
			margin: 8rpx;
		}
	
		&.straightLine {
			.swiper-dot {
				width: 18rpx;
				height: 6rpx;
				border-radius: 4rpx;
	
				&.active {
					width: 36rpx;
					background-color: #fff;
				}
			}
		}
	}
	:deep(.uni-progress) .uni-progress-bar, :deep(.uni-progress) .uni-progress-inner-bar{
		border-radius: 10rpx;
	}
	.tab-bar {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	.skewed-text-5 {
	  transform: skew(-5deg);
	  font-weight: 900;
	}
	.skewed-text-10 {
	  transform: skew(-10deg);
	  font-weight: 900;
	}
</style>
