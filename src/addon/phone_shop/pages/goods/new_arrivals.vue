<template>
    <view class="page-container">
        <!-- 顶部导航栏 -->
        <u-navbar :title="'今日上新'" :titleStyle="{ color: '#333', fontSize: '32rpx',  fontWeight: 'bold' }">
            <!-- template right -->
            <template #right>
                <view class="text-[#333] text-[24rpx] ">{{ formatDate() }}</view>
            </template>
        </u-navbar>

        <!-- 商品列表 -->


        <mescroll-body ref="mescrollRef" @init="mescrollInit" @up="upCallback" :down="{ use: false }" :up="{ 
                textLoading: '加载中...',
                textNoMore: '没有更多了',
                bgColor: 'transparent',
                textColor: '#999',
                toTop: {
                    src: '/static/mescroll-uni/mescroll-totop.png',
                    offset: 1000,
                    duration: 300
                }
            }">
            <view class="goods-list" v-if="goodsList.length">
                <view class="goods-item" v-for="(item, index) in goodsList" :key="item.goods_id">
                    <!-- 序号标签 -->
                    <view class="item-index">{{ (index + 1).toString().padStart(2, '0') }}</view>
                    <view class="item-index brand_name" v-if="item.brand_name" size="mini">
                        {{ item.brand_name}}
                    </view>

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
                                <text class="goods-name">
                                    {{ item.goods_name }}</text>
                                <!-- <text class="time">{{ formatTime(item.create_time) }}</text> -->
                            </view>
                            <view class="goods-subtitle " v-if="item.sub_title">
                                <text class='truncate'> {{ item.sub_title }} </text>

                                <text class="sku text-[#b3d4ff]" v-if="item.goodsSku.sku_no">#{{ item.goodsSku.sku_no
                                    }}</text>

                            </view>
                            <view class="goods-detail">

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


        <up-loading-icon v-if='isLoading' :loading="isLoading" loadingText="加载中..." color="#3376cd" iconSize="24"
            loadingMode="circle"></up-loading-icon>

        <up-text align='center' type="info" v-else text="-- 到头了 --"></up-text>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { redirect, img } from '@/utils/common'
import { getGoodsPages, getGoodsDetail } from '@/addon/phone_shop/api/goods'
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue'
import useMescroll from '@/components/mescroll/hooks/useMescroll.js'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'

const { mescrollInit, getMescroll } = useMescroll(onPageScroll, onReachBottom)
const mescrollRef = ref(null)
const goodsList = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const isLoading = ref(false)

// 获取今日日期
const formatDate = () => {
    const date = new Date()
    return `${date.getMonth() + 1}月${date.getDate()}日  今日上新${total.value}件`
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
    if (mescroll.num === 1) {
        loading.value = true
    }
    isLoading.value = true

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
        loading.value = false
        isLoading.value = false

        // 判断是否还有更多数据


        if (goodsList.value.length >= totalCount) {
            // 停止 加载的动画
            loading.value = false
            isLoading.value = false
            mescroll.endSuccess(data.length, false)

        } else {
            mescroll.endSuccess(data.length, true)
        }
    } catch (error) {
        console.error(error)
        loading.value = false
        isLoading.value = false
        mescroll.endErr()
    }
}

// 下载单个商品


// 下载单个商品
const downloadGoods = async (item: any) => {
    const res = await getGoodsDetail({ goods_id: item.goods_id })
    if (!res.data.goods) {
        uni.showToast({ title: '商品信息获取失败', icon: 'none' })
        return
    }
    const images = res.data.goods.goods_image.split(',')
    downloadImages(images, item)
}

// 下载图片并复制文案
const downloadImages = (images: string[], item: any, showToast: boolean = true) => {
    return new Promise((resolve) => {
        const tasks = images.map((url: string) => {
            return new Promise((resolve, reject) => {
                uni.downloadFile({
                    url,
                    success: (res) => {
                        if (res.statusCode === 200) {
                            uni.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: resolve,
                                fail: reject
                            })
                        } else {
                            reject()
                        }
                    },
                    fail: reject
                })
            })
        })

        Promise.all(tasks).then(() => {
            const sku_no = item.goodsSku.sku_no ? '#' + item.goodsSku.sku_no + ' ' : ''
            const text = `${item.goods_name} ${item.sub_title} ${sku_no}${goodsPrice(item)}`
            uni.setClipboardData({
                data: text,
                success: () => {
                    if (showToast) {
                        uni.showToast({ title: '图片下载及文案复制成功', icon: 'none' })
                    }
                    resolve(true)
                }
            })
        }).catch(() => {
            if (showToast) {
                uni.showToast({ title: '下载失败', icon: 'none' })
            }
            resolve(false)
        })
    })
}

// 下载所有商品
const downloadAll = () => {
    // 实现批量下载逻辑
    uni.showToast({
        title: '开始批量下载...',
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

.goods-list {
    padding: calc(var(--status-bar-height) + 20rpx) 20rpx 0;
    display: grid;
    gap: 20rpx;
    grid-template-columns: repeat(auto-fill, minmax(600rpx, 1fr));

    /* iPad 响应式布局 */
    @media screen and (min-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        max-width: 1600rpx;
        margin: 0 auto;
    }

    @media screen and (min-width: 1280px) {
        grid-template-columns: repeat(3, 1fr);
    }


}

.goods-item {
    margin-bottom: 0;
    padding: 10rpx;
    background: #fff;
    border-radius: 12rpx;
    box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    /* 在grid布局中保持宽度自适应 */
    width: 100%;
    box-sizing: border-box;

    &:active {
        transform: scale(0.98);
    }

    .item-index {
        position: absolute;
        top: 0;
        left: 0;
        background: #f5f7fa;
        color: #4e82c7;
        font-size: 20rpx;
        font-weight: 500;
        padding: 4rpx 8rpx;
        border-radius: 12rpx 0 12rpx 0;
        font-family: 'DIN';
        z-index: 1;
    }

    .brand_name {
        left: auto;
        right: 0;
        background: #f0f5ff;
        color: #3376cd;
        border-radius: 0 12rpx 0 12rpx;
    }

    .goods-content {
        padding-top: 8rpx;
        display: flex;
        align-items: flex-start;
        gap: 16rpx;
    }

    .goods-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .goods-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 0;

            .goods-name {
                flex: 1;
                font-size: 26rpx;
                font-weight: 500;
                color: #2c3e50;
                line-height: 1.3;
                margin-right: 12rpx;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .goods-subtitle {
            font-size: 24rpx;
            color: #7f8c8d;
            line-height: 1.3;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            justify-content: space-between;

            .sku {
                color: #3376cd;
                opacity: 0.8;
            }
        }

        .goods-detail {
            margin-top: 4rpx;

            .price-action {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .price-info {
                    display: flex;
                    align-items: baseline;
                    gap: 2rpx;

                    .symbol {
                        font-size: 22rpx;
                        color: #e74c3c;
                        font-weight: bold;
                    }

                    .price {
                        font-size: 30rpx;
                        font-weight: bold;
                        color: #e74c3c;
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