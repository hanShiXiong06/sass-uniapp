<template>
    <view  :style="themeColor()">
        <view class="bg-[#F6F6F6] min-h-screen overflow-hidden" v-if="Object.values(info).length">
            <view v-if="info.is_use">
                <view class="sigin-header">
                <!-- #ifdef MP-WEIXIN -->
                    <view class="flex items-center absolute right-0 px-[14rpx] bg-color rounded-l-[35rpx]  text-[#fff] text-[24rpx] h-[50rpx] z-10" :style="{top: topStyle}"  @click="signPopup = true">
                         <text class="nc-iconfont nc-icon-meiriqiandaoV6xx text-[28rpx] text-[#fff] mr-[4rpx]"></text>
                        <text class="text-[24rpx]">签到规则</text>
					</view>
                    <view  :style="{height: headStyle, backgroundImage: 'url(' + img('static/resource/images/app/sigin_uniapp.png') + ')',backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat'}">
                        <top-tabbar :data="topTabbarData" titleColor="#fff" class="top-header" />
                    </view>
                    <!-- #endif -->
                    <!-- #ifdef H5 -->
                    <view v-if="info.rule_explain" class="flex items-center absolute top-[38rpx] right-0 px-[14rpx] bg-color rounded-l-[35rpx]  text-[#fff] text-[24rpx] h-[50rpx] z-10" @click="signPopup = true">
                        <text class="nc-iconfont nc-icon-meiriqiandaoV6xx text-[28rpx] text-[#fff] mr-[4rpx]"></text>
                        <text class="text-[24rpx]">签到规则</text>
					</view>
                    <view  class="h-[382rpx]" :style="{ backgroundImage: 'url(' + img('static/resource/images/app/sigin_h5.png') + ')',backgroundSize: '100%', backgroundRepeat: 'no-repeat'}">
                        <top-tabbar :data="topTabbarData" class="top-header" />
                    </view>
                    <!-- #endif -->
                </view>
                <view>
                    <view class="mx-[30rpx] bg-[#fff] rounded-[16rpx] -mt-[85rpx]">
                        <view class="px-[30rpx]">
                            <view class="pt-[32rpx] mb-[40rpx] flex justify-between items-center" v-if="flag" >
                                <view class="flex items-center">
                                    <text class="iconfont iconshangyibu text-[#999] text-[24rpx]"  @click="changeMonth('prev')"></text>
                                    <view class="mx-[30rpx] font-bold text-[32rpx] text-[#333] leading-[38rpx]">{{ state.curYear }}年{{ state.curMonth+1 }}月</view>
                                    <text class="iconfont iconxiayibu1 text-[#999] text-[24rpx]"  @click="changeMonth('next')"></text>
                                </view>
                                <view class="flex items-center">
                                    <text class="nc-iconfont nc-icon-shangV6xx-1 text-[#666] text-[30rpx] transform scale-80" @click="handleChange"></text>
                                </view>
                            </view>
                            <view class="pt-[32rpx] mb-[40rpx] flex justify-between items-center" v-else>
                                <view class="flex items-center">
                                    <view class="font-bold text-[32rpx] text-[#333] leading-[38rpx]">已连续签到<text class="text-[#EF000C] mx-[4rpx]">{{ info.days }}</text>天</view>
                                </view>
                                <text class="nc-iconfont nc-icon-xiaV6xx text-[#666] text-[30rpx] transform scale-80" v-if="!flag" @click="flag = !flag"></text>
                            </view>
                            <view class="relative z-9 pb-[30rpx] bg-[#fff] rounded-[18rpx]">
                                <view>
                                    <view class="flex items-center justify-between text-[#666] text-[26rpx] mb-[14rpx]">
                                        <text class="w-[14.2%] leading-[30rpx] text-center">周一</text>
                                        <text class="w-[14.2%] leading-[30rpx] text-center">周二</text>
                                        <text class="w-[14.2%] leading-[30rpx] text-center">周三</text>
                                        <text class="w-[14.2%] leading-[30rpx] text-center">周四</text>
                                        <text class="w-[14.2%] leading-[30rpx] text-center">周五</text>
                                        <text class="w-[14.2%] leading-[30rpx] text-center">周六</text>
                                        <text class="w-[14.2%] leading-[30rpx] text-center">周日</text>
                                    </view>
                                    <view class="flex flex-wrap items-center justify-start" v-if="!flag">
                                        <block v-for="(item,index) in state.weekCount" :key="index">
                                            <view  class="w-[14.2%] flex flex-col justify-center items-center">
                                                <view v-if="filteredDate(item)" class="w-[74rpx] h-[92rpx] bg-[#F2F2F2] text-[#666] border-box py-[10rpx] rounded-[8rpx] flex flex-col  items-center" :class="{'sigin-bg !text-[#fff]': isVerDate(item),'bg-[#FDFDFD] border-[1rpx] border-[#E0E0E0] border-solid !text-[#999]': !isVerDate(item) && item < state.curDate && (state.curMonth + 1) == (new Date().getMonth() + 1) ,'mb-[10rpx]':isCurrentDate(item),'mb-[20rpx]':!isCurrentDate(item)   }" @click="getDayPackFn(item)">
                                                    <text class="text-[24rpx] leading-[34rpx] mb-[6rpx]">{{ filteredDate(item) }}</text>
                                                    <view v-if="filteredDate(item)">
                                                        <image  v-if="isPackDate(item)" :src="img('static/resource/images/app/package.png')" class="w-[40rpx] h-[40rpx]"></image>
                                                        <image v-else-if="isVerDate(item)" :src="img('static/resource/images/app/hassigin.png')" class="w-[34rpx] h-[34rpx]"></image>
                                                        <image  v-else :src="img('static/resource/images/app/nosigin.png')" class="w-[34rpx] h-[34rpx]"></image>
                                                    </view>
                                                </view>
                                                <view class="w-[10rpx] h-[10rpx] rounded-[50%] bg-[#FF5527]" v-if="isCurrentDate(item)"></view>
                                            </view>   
                                        </block>
                                    </view>
                                    <view class="flex flex-wrap items-center justify-start" v-else>
                                        <block v-for="(item,index) in state.dataCount" >
                                            <view  class="w-[14.2%] flex flex-col justify-center items-center mb-[10rpx]">
                                                <view v-if="filteredDate(item)" class="w-[74rpx] h-[92rpx] bg-[#F2F2F2] text-[#666] border-box py-[10rpx] rounded-[8rpx] flex flex-col  items-center" :class="{'sigin-bg !text-[#fff]': isVerDate(item) && active ,'bg-[#FDFDFD] border-[1rpx] border-[#E0E0E0] border-solid !text-[#999]': !isVerDate(item) && item < state.curDate && (state.curMonth + 1) == (new Date().getMonth() + 1) && state.curYear == new Date().getFullYear() ,'mb-[10rpx]':isCurrentDate(item),'mb-[20rpx]':!isCurrentDate(item)}" @click="getDayPackFn(item)">
                                                    <text class="text-[24rpx] leading-[34rpx] mb-[6rpx]">{{ filteredDate(item) }}</text>
                                                    <view v-if="filteredDate(item)">
                                                        <image  v-if="isPackDate(item)" :src="img('static/resource/images/app/package.png')" class="w-[40rpx] h-[40rpx]"></image>
                                                        <image v-else-if="isVerDate(item) && active " :src="img('static/resource/images/app/hassigin.png')" class="w-[34rpx] h-[34rpx]"></image>
                                                        <image  v-else :src="img('static/resource/images/app/nosigin.png')" class="w-[34rpx] h-[34rpx]"></image>
                                                    </view>
                                                </view>
                                                <view class="w-[10rpx] h-[10rpx] rounded-[50%] bg-[#FF5527]" v-if="isCurrentDate(item)"></view>
                                            </view>   
                                        </block>
                                    </view>
                                    <view class="mt-[50rpx] mx-[20rpx] flex justify-center"  v-if="state.curMonth + 1 == (new Date().getMonth() + 1) && state.curYear == new Date().getFullYear() ">
                                        <button v-if="!info.is_sign" class="rounded-[40rpx] !bg-transparent" :style="{width:'470rpx',height:'80rpx',border:'none', color:'#fff', fontSize:'28rpx',lineHeight:'76rpx',backgroundImage: `url(${img('static/resource/images/app/button_bg2.png')})`,backgroundSize: '100%', backgroundRepeat: 'no-repeat'}" shape="circle" @click="setSignFn">
											<text class="nc-iconfont nc-icon-meiriqiandaoV6xx text-[30rpx] text-[#fff] mr-[8rpx]"></text>
											<text>立即签到</text>
										</button>
										<button v-else class="rounded-[40rpx] !bg-transparent" :style="{width:'470rpx',height:'80rpx',border:'none',color:'#fff', fontSize:'28rpx',lineHeight:'76rpx',backgroundImage: `url(${img('static/resource/images/app/button_bg1.png')})`,backgroundSize: '100%', backgroundRepeat: 'no-repeat'}" shape="circle">
											<text class="nc-iconfont nc-icon-meiriqiandaoV6xx text-[30rpx] text-[#fff] mr-[8rpx]"></text>
											<text>已签到</text>
										</button>
                                    </view>
                                    <!-- <view class="mx-[20rpx] flex items-baseline justify-between mt-[16rpx]">
                                        <text class="text-[26rpx] text-[#FF9000] leading-[30rpx]">查看签到记录</text>
                                    </view> -->
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="mt-[20rpx] mb-[30rpx]  mx-[30rpx] p-[30rpx] bg-[#fff] rounded-[16rpx]">
                        <view class="mb-[30rpx] flex items-center">
                            <view class="font-bold text-[32rpx] text-[#333] leading-[38rpx]">签到奖励</view>
                            <!-- <view class="text-[#666] text-[26rpx] leading-[30rpx]">
                                <text>签到记录</text>
                                <image :src="img('static/resource/images/app/more.png')" class="w-[12rpx] h-[18rpx] ml-[8rpx]"></image>
                            </view> -->
                        </view>
                        <view>
                            <view v-for="(item,index) in info.continue_award" :key="index" class="flex items-center  mt-[40rpx] border-box">
                                <view class="w-[90rpx] h-[90rpx] rounded-[50%] bg-[#E7F6FF] flex items-center justify-center  flex-shrink-0" v-if="(index + 1) % 4 == 1">
                                    <image :src="img('static/resource/images/app/icon_02.png')" class="w-[40rpx] h-[40rpx]"></image>
                                </view>
                                <view class="w-[90rpx] h-[90rpx] rounded-[50%] bg-[#ffefef] flex items-center justify-center flex-shrink-0" v-else-if="(index + 1) % 4 == 2">
                                    <image :src="img('static/resource/images/app/icon_03.png')" class="w-[40rpx] h-[40rpx]"></image>
                                </view>
                                <view class="w-[90rpx] h-[90rpx] rounded-[50%] bg-[#d3feeb] flex items-center justify-center flex-shrink-0" v-else-if="(index + 1) % 4 == 3">
                                    <image :src="img('static/resource/images/app/icon_04.png')" class="w-[40rpx] h-[40rpx]"></image>
                                </view>
                                <view class="w-[90rpx] h-[90rpx] rounded-[50%] bg-[#ffeddd] flex items-center justify-center flex-shrink-0" v-else-if="(index + 1) % 4 == 0">
                                    <image :src="img('static/resource/images/app/icon_05.png')" class="w-[40rpx] h-[40rpx]"></image>
                                </view>
                                <view class="flex-1 mx-[20rpx]">
                                    <view class="font-500 text-[28rpx] text-[#333] leading-[33rpx] mb-[10rpx]">连续签到{{item.continue_sign}}天</view>
                                    <view class="flex flex-wrap" v-if="item.gift">
                                        <view  class="flex  mb-[10rpx] ">
                                            <image :src="img(item.gift.total.icon)" class="w-[30rpx] h-[30rpx] flex-shrink-0"></image>
                                            <view class="text-[24rpx] ml-[6rpx] text-[#FF9000] leading-[30rpx] max-w-[330rpx]">{{item.gift.total.text}}</view>
                                         </view>
                                    </view>
                                </view>
                                <view class="flex-shrink-0">
                                    <view v-if="Number(info.days) < Number(item.continue_sign) " class="px-[28rpx] py-[8rpx] bg-[#FFECE9] rounded-[40rpx] font-500 text-[24rpx] text-[rgba(239,0,12,.8)] leading-[34rpx]">待完成</view>
                                    <view v-else class="px-[28rpx] py-[8rpx]  rounded-[40rpx] font-500 text-[24rpx] text-[#fff] leading-[34rpx]" style="background:linear-gradient( 90deg, #FB7939 0%, #FE120E 100%) ;">已完成</view>
                                </view>
                            </view>
                        </view>
                    </view>   
                </view>
            </view>
            <view class="min-h-screen flex flex-col justify-center bg-[#fff]" v-else>
                <image class="rounded-[8rpx] overflow-hidden mx-auto w-[320rpx] h-[184rpx]" :src="img('static/resource/images/system/empty.png')" model="aspectFill" />
                <view class="text-[#999] text-[26rpx] font-400 mt-[26rpx] text-center leading-[30rpx]">签到未开启</view>
            </view>
            <!-- 签到规则-->
            <u-popup :show="signPopup" :round="16" mode="bottom" :closeable="true" @close="signPopup = false">
                <view class="pt-[30rpx] px-[32rpx] pb-[20rpx]">
                    <view class="text-center text-[32rpx] font-700 text-[#323233]">签到规则</view>
                    <view class="mt-[60rpx] mx-[20rpx] mb-[120rpx] h-[260rpx] overflow-auto">
                        <block v-for="(item) in info.rule_explain.split('\n')">
                            <view class="leading-[40rpx] mb-[20rpx]">{{ item }}</view>
                        </block>
                    </view>
                    <view>
                        <u-button text="知道了" :customStyle="{height:'66rpx',color:'#fff', fontSize:'28rpx',lineHeight:'66rpx',background: 'linear-gradient( 90deg, #fc7035 0%, #EF000C 100%)',border:'none'}" shape="circle" @click="signPopup = false"></u-button>
                    </view>
                </view> 
            </u-popup>
            <!-- 签到奖励 -->
            <u-popup :show="awardShow" class="award-popup" :customStyle="{backgroundColor:'transparent'}" @close="awardShow = false"  mode="center" :round="5" :safeAreaInsetBottom="false" >
                <view  class="w-[550rpx]"  v-if="Object.values(signAward).length">
                    <view class="flex justify-center">
                        <image :src="img('static/resource/images/app/award.png')" class="w-[484rpx] h-[480rpx]"></image>
                    </view>
                    <view class="-mt-[265rpx] bg-award rounded-[30rpx] pt-[100rpx] pb-[48rpx] mb-[50rpx] raleative z-10">
                        <view class="px-[32rpx]">
                            <view class="text-[48rpx] text-[#EF000C] font-bold leading-[56rpx] mb-[4rpx] text-center">{{ signAward.title }}</view>
                            <view class="text-[24rpx] text-[#F05F66] leading-[28rpx] text-center mb-[60rpx]">{{ signAward.info }}</view>
                            <view class="px-[68rpx] mb-[54rpx]">
                                <block v-for="(item,index) in signAward.awards">
                                    <template v-if="item.content" v-for="(subItem,subIndex) in item.content">
                                        <view class="flex items-center mb-[30rpx]" > 
                                            <image :src="img(subItem.icon)" class="w-[42rpx] h-[42rpx]"></image>
                                            <view class="ml-[20rpx] text-[28rpx] text-[#333] leading-[32rpx]">{{subItem.text }}</view>
                                        </view>
                                    </template>
                                </block>
                            </view>
                            <view class="flex justify-center">
								<view class="w-[380rpx] h-[80rpx] bg-gradient-to-r from-[#FB7939] to-[#FE120E] rounded-[50rpx] text-[#ffffff] text-center leading-[80rpx] text-[30rpx]"  @click="awardShow = false">我知道了</view>
                            </view>
                        </view>
                    </view> 
                    <view class="flex justify-center">
                        <text class="nc-iconfont nc-icon-cuohaoV6xx text-[#fff] text-[60rpx]" @click="awardShow = false"></text>
                    </view>
                </view>
            </u-popup>
            <!-- 查看当日或连续签到奖励 -->
            <u-popup :show="packShow" class="award-popup" :customStyle="{backgroundColor:'transparent'}" @close="packShow = false"  mode="center" :round="5" :safeAreaInsetBottom="false">
                <view class="w-[550rpx]" v-if="Object.values(packInfo).length">
                    <view class="flex justify-center">
                        <image :src="img('static/resource/images/app/award.png')" class="w-[484rpx] h-[480rpx]"></image>
                    </view>
                    <view class="-mt-[265rpx] bg-award rounded-[30rpx] pt-[100rpx] pb-[48rpx] mb-[50rpx] raleative z-10">
                        <view class="px-[32rpx]">
                            <view class="text-[48rpx] text-[#EF000C] font-bold leading-[56rpx] mb-[4rpx] text-center opacity-60">签到奖励</view>
                            <view class="text-[24rpx] text-[#F05F66] opacity-60 leading-[28rpx] text-center mb-[60rpx]">您将获得以下奖励</view>
                            <view class="px-[68rpx] mb-[54rpx]">
                                <block v-for="(item,index) in packInfo">
                                    <template v-if="item.content">
                                        <view class="flex items-center mb-[32rpx]" v-for="(subItem,subIndex)  in item.content" :key="subIndex"> 
                                            <image :src="img(subItem.icon)" class="w-[42rpx] h-[42rpx]"></image>
                                            <view class="ml-[20rpx] text-[28rpx] text-[#333] leading-[32rpx]">{{ subItem.text  }}</view>
                                        </view>
                                    </template>
                                </block>
                            </view>
                            <view class="flex justify-center">
								<view class="w-[380rpx] h-[80rpx] bg-gradient-to-r from-[#FB7939] to-[#FE120E] rounded-[50rpx] text-[#ffffff] text-center leading-[80rpx] text-[30rpx]"  @click="packShow = false">我知道了</view>
                            </view>
                        </view>
                    </view>
                    <view class="flex justify-center">
                        <text class="nc-iconfont nc-icon-cuohaoV6xx text-[#fff] text-[60rpx]" @click="packShow = false"></text>
                    </view>
                </view>
            </u-popup>
        </view>
        <u-loading-page bg-color="rgb(248,248,248)" :loading="loading" loadingText="" fontSize="16" color="#303133"></u-loading-page>
    </view>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs, toRaw, computed } from 'vue'
import { redirect, img } from '@/utils/common'
import { onLoad } from '@dcloudio/uni-app'
import { getSignInfo,getSignConfig, setSign,getDayPack } from '@/app/api/member'
import useMemberStore from '@/stores/member'

let state = reactive({
    dataCount:[], //当月所有天数
    weekCount:[], //如果签到周期是7天
    curYear:0, // 当前年
    curMonth:0, //当前月
    curDate:0, //当前日
    curWeek:0, //当前星期
    signInList:[], // 签到列表
    packList:[] //每个小周期内的礼包
})
let week = reactive({
    weekDay:0, //当前天
    week:0 //当前星期
})
const loading = ref(false)
let flag = ref(false)
let info = ref({}) //签到配置
let signPopup = ref(false)//签到规则弹框
let signAward = ref({}) //当日签到奖励
let awardShow = ref(false) // 每日签到弹框
let packShow =  ref(false) //查看每天礼包
let packInfo = ref({}) //礼包奖励
let active = ref(false)
let currentYear=null
let currentMonth=null
onLoad(() =>{
    let date=new Date()
    state.curYear=date.getFullYear()
    state.curMonth=date.getMonth()
    state.curDate=date.getDate()
    state.curWeek=date.getDay()
    if(state.curWeek==0) state.curWeek = 7

    currentYear=toRaw(state.curYear)
    currentMonth=toRaw(state.curMonth)

    //初始化执行
    getDayCounts()
    getWeekCounts()
    getSignInfoFn({year:state.curYear,month:state.curMonth+1})
    getSignConfigFn()
})

// 获取签到配置
const getSignConfigFn = () =>{
    loading.value = true
    getSignConfig().then((res:any) =>{
        info.value = res.data
        loading.value = false
    })
}

// 每个周期签到日期
const getSignInfoFn =  (data:any) =>{
    getSignInfo(data).then((res:any) =>{
        state.signInList = []
        state.packList = []
        state.packList = res.data.period
        state.signInList = res.data.days.map((el:any) =>{
            return Number(el)
        })
        active.value = true
    })
}

//获取当月总天数
const getDayCounts= () => {
    let counts = new Date(state.curYear,state.curMonth+1,0).getDate()
    //获取当前第一天是星期几
    let firstWeekDay = new Date(state.curYear,state.curMonth,1).getDay()
    state.dataCount = []
    for(let i=1;i<counts+firstWeekDay;i++){
        let val=i-firstWeekDay+ 1
        state.dataCount.push(val)
    }
}
// 获取7天的日期签到
const getWeekCounts = () =>{
    let now = `${state.curYear}-${state.curMonth+1 > 10 ? state.curMonth+1 : '0'+(state.curMonth+1)}-${state.curDate > 10 ? state.curDate : '0'+state.curDate }`
    for (let i = state.curWeek - 1; i >= 0; i --) {
        const day = new Date(now).getDate() - i
        state.weekCount.push(day)
    }
    for (let i = 1; i <= 7 - state.curWeek; i++) {
        const day = new Date(now).getDate() + i
        state.weekCount.push(day)
    }
}

//控制状态
const handleChange = () =>{
    let nowDate = new Date().getMonth()

    if(state.curMonth == nowDate){
        flag.value = !flag.value
    }else{
        state.curMonth = new Date().getMonth()
        state.curYear =  new Date().getFullYear()
        getSignInfoFn({year:state.curYear,month:state.curMonth+1})
        flag.value = !flag.value
    }
}

//更改月份
const changeMonth=(type: string)=>{
 state.dataCount=[]
 if(type == 'prev'){
    state.curMonth--
    if(state.curMonth < 0){
        state.curMonth = 11
        state.curYear--
    }
    week.weekDay = 1
    active.value = false
 }else{
    state.curMonth++
    if(state.curMonth > 11){
        state.curMonth = 0
        state.curYear++
    }
    week.weekDay = 1
    active.value = false
 }
 let data = {year:state.curYear,month:state.curMonth + 1}
 getSignInfoFn(data)
 getDayCounts()
}

const memberStore = useMemberStore()

// 点击签到
const setSignFn = () =>{
    setSign().then(res =>{
        if(Object.values(res.data).length){
            signAward.value = res.data
            getSignInfoFn({year:state.curYear,month:state.curMonth+1})
            getSignConfigFn()
            memberStore.getMemberInfo()
            awardShow.value = true
        }
    })
}

// 查看每日礼包
let curPickDay = ref(null)
const getDayPackFn = (date:number) =>{
    let {curYear,curMonth}=toRefs(state)
    let itemDate=`${curYear.value}-${(curMonth.value+1) < 10 ? '0' + (curMonth.value+1) : (curMonth.value+1)}-${date < 10 ? '0'+date : date}`
    let flag = state.packList.some(el =>{
        return el.day == itemDate
    })
    if(!flag) return
    curPickDay.value = date
    let obj = {
        year: state.curYear,
        month:state.curMonth + 1,
        day: date
    }
    getDayPack(obj).then((res:any) => {
        if(JSON.stringify(res.data) != '[]'){
            packInfo.value = res.data
            packShow.value = true
        }
    })
}

// 判断是否签到
const isVerDate = (val:any) => {
    return state.signInList.includes(val)
}

//判断是否是当前日期
const isCurrentDate=(date)=>{
    if(date> 0 && date <= state.dataCount.length){
        if(date == state.curDate && currentYear == state.curYear && currentMonth == state.curMonth){
            return true
        }
    }else{
        return false
    }
}

const isPackDate = (date:any) =>{
    let {curYear,curMonth}=toRefs(state)
    let itemDate=`${curYear.value}-${(curMonth.value+1) < 10 ? '0' + (curMonth.value+1) : (curMonth.value+1)}-${date < 10 ? '0'+date : date}`
    let flag = state.packList.some((el:any) =>{
        return el.day == itemDate && el.award
    })
    return flag
}

// 过滤日期
const filteredDate=(date :any)=>{
    return date > 0 ? date : ''
}

// 获取系统状态栏的高度
let menuButtonInfo = {};
// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
menuButtonInfo = uni.getMenuButtonBoundingClientRect();
// #endif
let topTabbarData = ref({
	title:'我的签到',
	topStatusBar: {
		style: 'style-1',
		bgColor: 'transparent',
		textColor: '#fff'
	}
})

const headStyle = computed(() => {
	let style = ''
	style = (Number(menuButtonInfo.height) * 2 + menuButtonInfo.top * 2 +  382) + 'rpx;'
	return style
})
const topStyle = computed(() => {
	let style = ''
	style = (Number(menuButtonInfo.height) * 2 + menuButtonInfo.top * 2 +  38) + 'rpx;'
	return style
})

</script>

<style lang="scss" scoped>
.bg-color{
    background-color: rgba(102,102,102,0.4);
}
.sigin-bg{
    background: linear-gradient( 90deg, #FFA359 0%, #FF5426 100%), #F2F2F2;
}
:deep(.award-popup .u-popup__content){
    background-color: transparent;
}
.bg-award{
    background: linear-gradient( 51deg, #FFFBFC 0%, #FFFCF9 59%, #FFE7E7 100%);
}

.bg-button{
    background: linear-gradient( 180deg, #FFEAE1 0%, #FFCDD0 34%, #E0052C 100%);
    border-radius: 40rpx;
}
</style>