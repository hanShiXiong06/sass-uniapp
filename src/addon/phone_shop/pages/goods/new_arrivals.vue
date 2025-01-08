<template>
    <view class="page-container">
        <!-- 顶部导航栏 -->
        <view class="nav-bar">
            <view class="nav-content">
                <view class="title">今日上新</view>
                <view class="date">{{ formatDate() }}</view>
            </view>
        </view>

        <!-- 商品列表 -->
        <mescroll-body ref="mescrollRef" @init="mescrollInit" @up="upCallback" :down="{ use: false }">
            <view class="goods-list" v-if="goodsList.length">
                <view class="goods-item" v-for="item in goodsList" :key="item.goods_id">
                    <view class="goods-content" @click="toDetail(item.goods_id)">
                        <!-- 左侧图片 -->
                        <view class="goods-image">
                            <u--image :src="img(item.goods_cover_thumb_mid)" width="140rpx" height="140rpx"
                                radius="8"></u--image>
                            <template #error>
                                <image class="goods-image" :src="img('static/resource/images/diy/shop_default.jpg')">
                                </image>
                            </template>
                        </view>
                        <!-- 右侧信息 -->
                        <view class="goods-info">
                            <view class="goods-header">
                                <text class="goods-name">{{ item.goods_name }}</text>
                                <!-- <text class="time">{{ formatTime(item.create_time) }}</text> -->
                            </view>
                            <view class="goods-subtitle" v-if="item.sub_title">{{ item.sub_title }}</view>
                            <view class="goods-detail">
                                <view class="sku-brand">
                                    <text class="sku" v-if="item.goodsSku.sku_no">#{{ item.goodsSku.sku_no }}</text>
                                    <text class="brand" v-if="item.brand">{{ item.brand }}</text>
                                </view>
                                <view class="price-action">
                                    <view class="price-info">
                                        <text class="symbol">￥</text>
                                        <text class="price">{{ goodsPrice(item).toFixed(2) }}</text>
                                        <image class="price-tag" v-if="priceType(item) === 'member_price'"
                                            :src="img('addon/phone_shop/VIP.png')" mode="heightFix" />
                                        <image class="price-tag" v-if="priceType(item) === 'discount_price'"
                                            :src="img('addon/phone_shop/discount.png')" mode="heightFix" />
                                    </view>
                                    <view class="action-btn" @click.stop="downloadGoods(item)">
                                        <text class="nc-iconfont nc-icon-fenxiangV6xx"></text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <u-empty mode="data" text="暂无新品上架" v-else></u-empty>
        </mescroll-body>

        <!-- 底部操作栏 -->
        <view class="bottom-bar" v-if="goodsList.length">
            <view class="total">今日新品: {{ total }} 件</view>
            <!-- <view class="download-all" @click="downloadAll">
                <text class="nc-iconfont nc-icon-xiazaiV6xx"></text>
                <text>一键下载</text>
            </view> -->
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { redirect, img } from '@/utils/common'
import { getGoodsPages } from '@/addon/phone_shop/api/goods'
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue'
import useMescroll from '@/components/mescroll/hooks/useMescroll.js'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'

const { mescrollInit, getMescroll } = useMescroll(onPageScroll, onReachBottom)
const mescrollRef = ref(null)
const goodsList = ref<any[]>([])
const total = ref(0)

// 获取今日日期
const formatDate = () => {
    const date = new Date()
    return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化时间
// const formatTime = (timestamp: number) => {
//     const date = new Date(timestamp * 1000)
//     const hours = date.getHours().toString().padStart(2, '0')
//     const minutes = date.getMinutes().toString().padStart(2, '0')
//     return `${hours}:${minutes}`
// }
const startTime = Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60
const endTime = Math.floor(new Date().getTime() / 1000)

// 上拉加载
const upCallback = async (mescroll: any) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const params = {
            page: mescroll.num,
            limit: mescroll.size,
             create_time: [startTime, endTime],
            order: 'create_time',
            sort: 'desc'
        }

        const res = await getGoodsPages(params)
        const { data, total: totalCount } = res.data

        if (mescroll.num === 1) goodsList.value = []
        goodsList.value = goodsList.value.concat(data)
        total.value = totalCount

        mescroll.endSuccess(data.length)
    } catch (error) {
        console.error(error)
        mescroll.endErr()
    }
}

// 下载单个商品
const downloadGoods = (goods: any) => {
    // 实现下载逻辑
    uni.showToast({
        title: '开始下载...',
        icon: 'none'
    })
}

// 下载所有商品
const downloadAll = () => {
    // 实现批量下载逻辑
    uni.showToast({
        title: '开始批量下��...',
        icon: 'none'
    })
}

// 跳转商品详情
const toDetail = (goodsId: number) => {
    redirect({
        url: '/addon/phone_shop/pages/goods/detail',
        param: { goods_id: goodsId },
        mode: 'navigateTo'
    })
}

// 价格相关方法
const priceType = (data: any) => {
    if (data.is_discount && data.goodsSku.sale_price != data.goodsSku.price) {
        return 'discount_price'
    } else if (data.member_discount && data.goodsSku.member_price != data.goodsSku.price) {
        return 'member_price'
    }
    return ''
}

const goodsPrice = (data: any) => {
    if (data.is_discount && data.goodsSku.sale_price != data.goodsSku.price) {
        return parseFloat(data.goodsSku.sale_price || data.goodsSku.price)
    } else if (data.member_discount && data.goodsSku.member_price != data.goodsSku.price) {
        return parseFloat(data.goodsSku.member_price || data.goodsSku.price)
    }
    return parseFloat(data.goodsSku.price)
}
</script>

<style lang="scss" scoped>
.page-container {
    min-height: 100vh;
    background: #f7f7f7;
    padding-bottom: 100rpx;
    padding-top: 100rpx;
}

.nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: #fff;
    padding: var(--status-bar-height) 0 16rpx;
    box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.05);

    .nav-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30rpx;

        .title {
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
        }

        .date {
            font-size: 26rpx;
            color: #666;
        }
    }
}

.goods-list {
    padding: calc(var(--status-bar-height) + 80rpx) 20rpx 0;
}

.goods-item {
    margin-bottom: 20rpx;
    padding: 10rpx;
    background: #fff;
    border-radius: 12rpx;

    .goods-content {
        display: flex;
        align-items: flex-start;
    }

    .goods-image {
        width: 140rpx;
        height: 140rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
        overflow: hidden;
    }

    .goods-info {
        flex: 1;
        min-width: 0;

        .goods-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 8rpx;

            .goods-name {
                flex: 1;
                font-size: 28rpx;
                color: #333;
                line-height: 1.4;
                margin-right: 16rpx;
            }

            .time {
                font-size: 22rpx;
                color: #999;
                flex-shrink: 0;
            }
        }

        .goods-subtitle {
            font-size: 24rpx;
            color: #666;

            line-height: 1.4;
        }

        .goods-detail {
            margin-top: 5rpx;

            .sku-brand {
                display: flex;
                align-items: center;
                margin-bottom: 12rpx;
                font-size: 22rpx;

                .sku {
                    color: #666;
                    margin-right: 12rpx;
                }

                .brand {
                    color: #666;
                    background: #f6f8f8;
                    padding: 2rpx 12rpx;
                    border-radius: 12rpx;
                }
            }

            .price-action {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .price-info {
                    display: flex;
                    align-items: baseline;

                    .symbol {
                        font-size: 22rpx;
                        color: var(--price-text-color);
                    }

                    .price {
                        font-size: 30rpx;
                        font-weight: bold;
                        color: var(--price-text-color);
                        font-family: 'DIN';
                    }

                    .price-tag {
                        height: 24rpx;
                        margin-left: 6rpx;
                    }
                }

                .action-btn {
                    width: 48rpx;
                    height: 48rpx;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--primary-color);
                    border-radius: 24rpx;
                    color: #fff;

                    .nc-iconfont {
                        font-size: 24rpx;
                    }
                }
            }
        }
    }
}

.bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx;
    background: #fff;
    box-shadow: 0 -1rpx 6rpx rgba(0, 0, 0, 0.05);

    .total {
        font-size: 26rpx;
        color: #666;
    }

    .download-all {
        display: flex;
        align-items: center;
        padding: 12rpx 24rpx;
        background: var(--primary-color);
        border-radius: 28rpx;
        color: #fff;
        font-size: 26rpx;

        .nc-iconfont {
            font-size: 28rpx;
            margin-right: 6rpx;
        }
    }
}
</style>