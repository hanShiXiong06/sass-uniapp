<template>
  <view class="signin" :style="themeColor()">
    <u-loading-page :loading="loading" loadingText="" bg-color="#f7f7f7"></u-loading-page>
    <view v-show="!loading">
    <block v-if="signInData.signState">
      <view class="sigin-box">
        <view class="sigin-bg"></view>
        <view class="signin-wrap">
          <view class="member-info">
            <view class="headimg">
              <view class="headimg-img" v-if="signInData.headimg">
                <u-avatar :src="img(signInData.headimg)" :size="'100rpx'" leftIcon="none"></u-avatar>
              </view>
              <view v-else class="headimg-img">
                <u-avatar src="" :size="'100rpx'"></u-avatar>
              </view>
              <view class="signin-info">
                <view>
                  已连续签到
                  <text>{{ signInData.signDaysSeries }}</text>
                  天
                </view>
                <view
                  >{{ signInData.hasSign ? "明日" : "今日" }}签到可获得{{
                    pointTomorrow
                  }}积分</view
                >
              </view>
            </view>
            <view class="point-box" @click="signIn()">
              <image
                :src="
                  img(
                    signInData.hasSign == 1
                      ? '/addon/dailySignIn/signin/sign-btn-res.png'
                      : '/addon/dailySignIn/signin/sign-btn.png'
                  )
                "
                mode="widthFix"
              />
            </view>
          </view>
          <view class="signin-days-wrap">
            <view class="signin-desc">连续签到领好礼</view>
            <view class="signin-day-list">
              <view class="signin-day-con">
                <view class="signin-day-scroll">
                  <block v-for="(item, index) in signInData.showSignDays">
                    <view
                      v-if="!item.is_last"
                      :id="'id_' + item.day"
                      class="signin-day-item"
                      :class="{
                        signed:
                          item.day < signInData.signDaysSeries ||
                          (item.day == signInData.signDaysSeries &&
                            signInData.hasSign == 0) ||
                          (item.day == signInData.signDaysSeries &&
                            signInData.hasSign == 1),
                      }"
                    >
                      <view class="day">第{{ item.day }}天</view>
                      <image
                        :src="img('/addon/dailySignIn/signin/sign-icon.png')"
                      ></image>
                      <view class="point">{{ item.point }}积分</view>
                    </view>
                    <view
                      v-else
                      :id="'id_' + item.day"
                      class="signin-day-item last"
                      :class="{
                        signed:
                          item.day < signInData.signDaysSeries ||
                          (item.day == signInData.signDaysSeries &&
                            signInData.hasSign == 0) ||
                          (item.day == signInData.signDaysSeries &&
                            signInData.hasSign == 1),
                      }"
                    >
                      <view>
                        <view class="day">第{{ item.day }}天</view>
                        <view class="point">{{ item.point }}积分</view>
                      </view>
                      <image
                        :src="img('/addon/dailySignIn/signin/sign-box.png')"
                        mode="widthFix"
                      />
                    </view>
                  </block>
                </view>
              </view>
            </view>
          </view>
          <view class="my-signin">
            <view class="my-signin-title">我的签到</view>
            <view class="my-signin-con">
              <view class="my-signin-item">
                <image
                  :src="img('/addon/dailySignIn/signin/sign-bg-yellow.png')"
                ></image>
                <view class="my-signin-item-num"
                  >积分：{{ signInData.signPoint }}</view
                >
                <view>累计获得积分</view>
              </view>
              <view class="my-signin-item">
                <image
                  :src="img('/addon/dailySignIn/signin/sign-bg-pink.png')"
                ></image>
                <view class="my-signin-item-num"
                  >成长值：{{ signInData.signGrowth }}</view
                >
                <view>累计获得成长值</view>
              </view>
            </view>
          </view>
          <view class="signin-rule">
            <view class="signin-rule-title">签到规则</view>
            <view class="signin-rule-con">
              <view
                class="rule-item"
                v-for="(item, index) in signInData.rule"
                :key="index"
              >
                <block v-if="index == 0">1. 每日签到奖励：</block>
                <block v-else>{{
                  index + 1 + ". 连续签到" + item.day + "天额外奖励："
                }}</block>
                <text v-if="item.point">{{ item.point + "积分 " }}</text>
                <text v-if="item.growth">{{ item.growth + "成长值" }}</text>
              </view>

              <view class="rule-item">
                {{ signInData.rule.length + 1 }}.连续签到{{
                  signInData.cycle
                }}天为一个周期，连续签到天数签满一个周期或者签到中断，将清空连签天数重新计算签到天数
              </view>
              <view class="rule-item">
                {{ signInData.rule.length + 2 }}.
                用户可在签到页每日签到一次，签到后可获得每日签到奖励；连续签到天数达到连签奖励的当天，可额外获得连签奖励
              </view>
            </view>
          </view>
        </view>
      </view>
      <view @touchmove.prevent.stop>
        <up-popup
          :show="show"
          @close="close"
          @open="open"
          mode="center"
          :round="20"
          bgColor="transparent"
        >
          <view class="popup-box" @click="close()">
            <text class="iconfont icon-close" @click="close()"></text>
            <image
              class="pic"
              :src="img('/addon/dailySignIn/signin/bg1.png')"
            ></image>
            <view class="popup-content">
              <view class="popup-content-wrap">
                <view
                  class="title"
                  v-if="
                    signInData.successTip.point || signInData.successTip.growth
                  "
                >
                  <text>恭喜您获得</text>
                  <text v-if="signInData.successTip.point">
                    <text class="num u-success-dark">{{
                      signInData.successTip.point
                    }}</text>
                    积分
                  </text>
                  <text v-if="signInData.successTip.growth">
                    <text class="num u-success-dark">{{
                      signInData.successTip.growth
                    }}</text>
                    成长值
                  </text>
                </view>
                <view class="desc">连续签到可获得更多奖励！</view>
              </view>
              <view class="other-info u-success-dark-bg" @click="close()"
                >知道了</view
              >
            </view>
          </view>
        </up-popup>
      </view>
    </block>
    <block v-else>
      <up-empty text="暂未开启签到奖励" class="up-empty"></up-empty>
    </block>
    </view>
  </view>
</template>
<script setup lang="ts">
import {img, isWeixinBrowser, redirect} from "@/utils/common";
import useMemberStore from "@/stores/member";
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { inArray } from "@/addon/dailySignIn/utils/utils";
import {
  checkSignInStatusApi,
  getAccumulationSum,
  getSignInAwardRules,
  getSignState,
  signinApi,
} from "@/addon/dailySignIn/api/signin";
const signInData = ref({
  showSignDays: [{}], // 一共展示的天数
  rule: [{}],
  hasSign: 0, //今天是否签到
  signDaysSeries: 0, //连续签到次数
  MonthData: [], //本月日期信息
  signList: [],
  back: "", //返回页
  redirect: "", //返回方式
  successTip: {},
  startDate: null,
  endDate: null,
  isActive: "", //判断点击
  signState: 1,
  headimg: "",
  point: 0,
  growth: 0,
  signPoint: 0,
  signGrowth: 0,
  rewardRuleDay: [],
  cycle: 0,
  reward: {},
});
//弹出层组件 ref
const show = ref(false);

const loading = ref(false);

// 会员信息
const memberInfo = computed(() => useMemberStore().info);

const onLoadSignIn = () => {
  signInData.value.headimg = signInData.value.headimg !="" ?memberInfo.value.headimg:""
  setTimeout(() => {
    if (!memberInfo.value) {
      setTimeout(() => {
        redirect({ url: "/app/pages/member/index" });
      }, 1000)
    }
  }, 1000)
}
const onShowSignIn = () => {
  getSignStateData()
  getRule();
  getSignPointData();
  getSignGrowthData();
  checkSignInStatus();
};

// 获取签到累积积分
const getSignPointData = () => {
  getAccumulationSum({
    accountType: "point",
    fromType: "dailySignIn",
  }).then((res) => {
    if (res.code == 1) {
      signInData.value.signPoint = res.data;
    }
  });
};
// 获取签到累积成长值
const getSignGrowthData = () => {
  getAccumulationSum({
    accountType: "growth",
    fromType: "dailySignIn",
  }).then((res) => {
    if (res.code == 1) {
      signInData.value.signGrowth = res.data;
    }
  });
};
//判断当前是否签到
const checkSignInStatus = () => {
  checkSignInStatusApi().then((res) => {
    if (res.code == 1) {
      signInData.value.hasSign = res.data.isSign;
      signInData.value.signDaysSeries = res.data.consecutiveDays;
    }
  });
};
// 签到是否开启
const getSignStateData = () => {
  getSignState().then((res) => {
    signInData.value.signState = res.data.status
    getRule();
    getSignPointData();
    getSignGrowthData();
  });
};
//获取rule
const getRule = () => {
  loading.value = true;
  getSignInAwardRules().then((res) => {
    if (res.code == 1) {
      let default_point = 0;
      signInData.value.cycle = res.data.cycle || 0;
      signInData.value.rule = res.data.data || [];
      if (signInData.value.rule.length > 0) {
        signInData.value.rule.forEach((item, index) => {
          if (item.day == 1) {
            default_point = item.point;
          } else {
            signInData.value.rewardRuleDay.push(parseInt(item.day));
            signInData.value.reward[item.day] = item.point;
          }
        });
      }
      //展示7天
      var showSignDays = [];
      var start_day = 1;
      var end_day = 7;
      var total_day = res.data.cycle;
      if (signInData.value.signDaysSeries > 5) {
        start_day = signInData.value.signDaysSeries - 5;
      }
      if (total_day >= signInData.value.signDaysSeries + 1) {
        end_day = signInData.value.signDaysSeries + 1;
      }
      if (signInData.value.signDaysSeries <= 5) {
        end_day = 8 - start_day;
      }
      if (end_day - start_day < 7 && total_day >= start_day + 6) {
        end_day = start_day + 6;
      }
      if (total_day == signInData.value.signDaysSeries) {
        start_day = signInData.value.signDaysSeries - 6;
        end_day = signInData.value.signDaysSeries;
      }
      for (let i = 1; i <= res.data.cycle; i++) {
        if (i >= start_day && i <= end_day) {
          showSignDays.push({
            day: i,
            is_last: 0,
            point: default_point,
          });
        }
      }
      if (showSignDays && showSignDays.length) {
        showSignDays[showSignDays.length - 1]["is_last"] = 1;
      }
      for (let i in showSignDays) {
        let item = showSignDays[i];
        if (inArray(item.day, signInData.value.rewardRuleDay) != -1) {
          showSignDays[i]["point"] =
            parseInt(signInData.value.reward[item.day]) +
            parseInt(default_point);
        }
      }
      signInData.value.showSignDays = showSignDays;
      loading.value = false;
    }
  });
};
//签到
const signIn = () => {
  if (signInData.value.signState == 0) {
    uni.showToast({
      title: "签到未开启",
    });
    return false
  }
  if (!signInData.value.hasSign && signInData.value.signState == 1) {
    signinApi().then((res) => {
      if (res.code == 1) {
        signInData.value.successTip = res.data[0];
        // 打开弹出层
        show.value = true;
        getRule();
        getSignPointData();
        getSignGrowthData();
        signInData.value.hasSign = 1;
        signInData.value.signDaysSeries = signInData.value.signDaysSeries + 1;
      } else {
        uni.showToast({
          title: res.message,
        });
      }
    });
  }
};
const pointTomorrow = computed(() => {
  var signDaysSeries = signInData.value.signDaysSeries + 1;
  var point = signInData.value.rule[0].point
    ? parseInt(signInData.value.rule[0].point)
    : 0;
  for (let i = 1; i < signInData.value.rule.length; i++) {
    let reward = signInData.value.rule[i];
    if (reward.day == signDaysSeries && reward.point)
      point += parseInt(reward.point);
  }
  return point;
});
const open = () => {
  show.value = true;
};
const close = () => {
  show.value = false;
};
// const infoFill = ref(false)
// const clickAvatar = () => {
//   // #ifdef MP-WEIXIN
//   infoFill.value.show = true
//   // #endif
//
//   // #ifdef H5
//   if (isWeixinBrowser()) {
//     useLogin().getAuthCode('snsapi_userinfo')
//   } else {
//     redirect({ url: '/app/pages/member/personal' })
//   }
//   // #endif
// }
const onShareAppMessage = ()=>{
  var path = '/addon/dailySignIn/pages/signIn/index';
  return {
    title: '签到有礼，天天签到，积分好礼送不停',
    imageUrl: '',
    path: path,
    success: res => {},
    fail: res => {},
    complete: res => {}
  };
}
onLoad(() => {
  onLoadSignIn()
  onShowSignIn()
});
</script>
<style lang="scss" scoped>
uni-page-body,
uni-page-refresh {
  height: 100%;
}

.signin {
  position: relative;
  height: 100%;

  .head-nav {
    width: 100%;
    height: var(--status-bar-height);
  }

  .head-nav.active {
    padding-top: 40rpx;
  }

  .sigin-box {
    position: relative;
  }

  .sigin-bg {
    width: 100%;
    position: absolute;
    top: 0;
    z-index: 1;
    background: linear-gradient(136deg, #fe7849 0%, #ff1959 100%);
    height: 500rpx;
    border-radius: 0 0 100% 100%/0 0 20% 20%;

    image {
      width: 100%;
    }
  }

  .signin-wrap {
    padding: 0 30rpx;
  }

  .member-info {
    position: relative;
    z-index: 9;
    padding: 74rpx 0 55rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .headimg {
      display: flex;
      align-items: center;

      .headimg-img {
        width: 100rpx;
        height: 100rpx;
        background: #fff;
        border: 0px solid #fff;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 20rpx;

        image {
          width: 100%;
          height: 100%;
        }
      }

      .signin-info {
        view {
          color: #ffffff;
          font-size: 24rpx;
          line-height: 1;

          &:first-child {
            margin-bottom: 18rpx;
            font-size: 32rpx;
            font-weight: bold;

            text {
              margin: 0 9rpx;
            }
          }
        }
      }
    }

    .point-box {
      display: flex;
      align-items: center;
      height: 68rpx;
      padding: 13rpx 0 13rpx 0;
      box-sizing: border-box;

      image {
        width: 160rpx;
        height: 68rpx;
        max-height: 80rpx;
        margin-bottom: -6rpx;
      }

      .point {
        margin-left: 14rpx;
        font-size: 32rpx;
        color: #ffffff;
      }
    }
  }

  .signin-days-wrap {
    position: relative;
    z-index: 9;
    background-color: #ffffff;
    border-radius: 18rpx;
    padding: 30rpx 0 30rpx;
    height: 468rpx;

    .signin-desc {
      font-size: 32rpx;
      font-weight: bold;
      line-height: 1;
      padding: 0 30rpx;
    }

    .signin-day-list {
      margin-top: 30rpx;
      display: flex;
      justify-content: space-between;
      padding: 0 30rpx;

      .signin-day-con {
        width: 100%;
      }

      .signin-day-scroll {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        flex-direction: row;
        white-space: nowrap;
        line-height: 1;

        .signin-day-item {
          flex-shrink: 0;
          background: #f5f6fa;
          margin-right: 30rpx;
          width: calc((100% - 90rpx) / 4);
          height: 155rpx;
          border-radius: 18rpx;
          margin-bottom: 24rpx;

          &:last-child {
            margin-right: 0;
            width: calc((100% - 30rpx) / 2);
          }

          &:nth-child(4n) {
            margin-right: 0;
          }

          image {
            width: 60rpx;
            height: 60rpx;
            margin-top: 10rpx;
          }

          &.signed {
            background: linear-gradient(136deg, #fe7849 0%, #ff1959 100%);

            view {
              color: #ffffff;
            }
          }

          &.last {
            display: flex;
            flex-direction: row;

            > view {
              width: 50%;

              .point {
                margin: 15rpx;
              }
            }

            image {
              width: 40%;
              margin-top: 20rpx;
              max-width: 130rpx;
            }
          }
        }

        .reward {
          image {
            width: 100%;
            height: 100%;
            margin-top: 0;
          }
        }
      }

      .signin-day-item {
        display: inline-block;
        width: 85rpx;
        height: 103rpx;
        border-radius: 4rpx;
        text-align: center;
        background-color: #f6f6fb;
        flex-shrink: 0;

        .day {
          font-size: 24rpx;
          line-height: 1;
          margin-top: 18rpx;
          font-weight: bold;
        }

        .point {
          font-size: 20rpx;
          line-height: 1;
          margin-top: -4rpx;
          color: #abb0c1;
        }

        image {
          width: 100%;
          height: 100%;
        }
      }
    }

    .signin-btn {
      position: absolute;
      width: 100%;
      height: 80rpx;
      bottom: 40rpx;
      text-align: center;

      button {
        display: inline-block;
        width: 442rpx;
        height: 100%;
        color: #ffffff;
        background-color: #ff4544;
      }

      .btn-active {
        color: #303133;
        background-color: #e1e1e1;
      }
    }
  }

  .my-signin {
    padding: 30rpx;
    margin-top: 30rpx;
    background-color: #ffffff;
    border-radius: 18rpx;

    .my-signin-title {
      font-size: 32rpx;
      line-height: 1;
      font-weight: bold;
    }

    .my-signin-con {
      display: flex;
      justify-content: space-between;
      margin-top: 30rpx;
    }

    .my-signin-item {
      width: 300rpx;
      height: 155rpx;
      position: relative;

      image {
        width: 300rpx;
        height: 155rpx;
        position: absolute;
        top: 0;
        left: 0;
      }

      .my-signin-item-num {
        position: relative;
        z-index: 9;
        padding: 44rpx 28rpx 0;
        line-height: 32rpx;
        font-weight: bold;
      }

      view:last-child {
        position: relative;
        z-index: 9;
        color: #abb0c1;
        padding-left: 28rpx;
        font-size: 20rpx;
        line-height: 1;
        margin-top: 16rpx;
      }
    }
  }

  .signin-rule {
    margin-top: 30rpx;
    background-color: #ffffff;
    border-radius: 18rpx;
    padding: 30rpx;

    .signin-rule-title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      line-height: 32rpx;
      font-size: 32rpx;
      font-weight: bold;
      text-align: left;
    }

    .signin-rule-con {
      margin-top: 30rpx;
      padding: 0 0;

      .rule-item {
        font-size: 26rpx;
        color: #606266;
      }
    }
  }
}

.popup-box {
  position: relative;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .icon-close::before {
    content: "\e609";
    width: 42rpx;
    height: 42rpx;
    border: 1px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: $u-content-color;
    position: absolute;
    top: 70rpx;
    right: 0;
  }

  .pic {
    width: 274rpx;
    height: 200rpx;
    position: relative;
    margin-bottom: -30rpx;
  }

  .popup-content {
    background: #fff;
    width: 70vw;
    margin-top: -100rpx;
    border-radius: 20rpx;
    padding: 0 60rpx;
    padding-bottom: 40rpx;
    box-sizing: border-box;
    background-size: 100% 100rpx;
  }

  .popup-content-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      font-size: 28rpx;
      margin-top: 160rpx;
      color: #999;

      .num {
        font-size: 32rpx;
      }
    }

    .desc {
      color: #999;
      font-size: 24rpx;
    }
  }

  .other-info {
    width: 300rpx;
    height: 70rpx;
    border-radius: 10rpx;
    margin: 0 auto;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
  }
}
.up-empty{
  box-sizing: border-box;
  width: 100%;
  padding: 100rpx 50rpx;
  text-align: center;
}
</style>
