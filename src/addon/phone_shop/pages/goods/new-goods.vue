<template>
    <view class="bg-gray-100 min-h-[100vh]" :style="themeColor()">
        <!-- 顶部导航栏 -->
        <view class="fixed left-0 right-0 top-0 bg-[#fff] px-[30rpx] z-50">
            <view class="flex items-center justify-between py-[20rpx]">
                <view class="flex-1">
                    <view class="flex items-center space-x-[30rpx]">
                        <view class="text-[28rpx] relative"
                            :class="{ 'text-[#303133] font-bold': activeTab === 'today', 'text-[#666]': activeTab !== 'today' }"
                            @click="switchTab('today')">
                            今日上新
                            <view v-if="activeTab === 'today'"
                                class="absolute bottom-[-4rpx] left-0 w-full h-[4rpx] bg-primary rounded"></view>
                        </view>
                        <view class="text-[28rpx] relative"
                            :class="{ 'text-[#303133] font-bold': activeTab === 'yesterday', 'text-[#666]': activeTab !== 'yesterday' }"
                            @click="switchTab('yesterday')">
                            昨日上新
                            <view v-if="activeTab === 'yesterday'"
                                class="absolute bottom-[-4rpx] left-0 w-full h-[4rpx] bg-primary rounded"></view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 商品列表 -->
        <mescroll-body ref="mescrollRef" :down="downOption" :up="upOption" top="100rpx" @init="mescrollInit" @down="downCallback" @up="loadNewGoods">
            <view v-if="goodsList.length" class="px-[30rpx]">
                <template v-for="(item, index) in goodsList" :key="item.goods_id">
                    <view class="bg-white flex p-[20rpx] rounded-[16rpx] overflow-hidden mt-[20rpx]"
                        @click="toDetail(item.goods_id)">
                        <u--image class="rounded-[10rpx] overflow-hidden" width="190rpx" height="190rpx"
                            :src="img(item.goods_cover_thumb_mid)" model="aspectFill">
                            <template #error>
                                <image class="w-[190rpx] h-[190rpx] rounded-[10rpx] overflow-hidden"
                                    :src="img('static/resource/images/diy/shop_default.jpg')" mode="aspectFill">
                                </image>
                            </template>
                        </u--image>
                        <view class="flex-1 flex flex-col ml-[20rpx] py-[6rpx]">
                            <view class="text-[28rpx] text-[#303133] leading-[40rpx] multi-hidden mb-[10rpx]">
                                {{ item.goods_name }}
                            </view>
                            <view v-if="item.sub_title" class="text-[24rpx] text-[#666] multi-hidden mb-[10rpx]">
                                {{ item.sub_title }}
                            </view>
                            <view v-if="item.goodsSku.sku_no" class="text-[24rpx] text-[#666] mb-[10rpx]">
                                sn: {{ item.goodsSku.sku_no }}
                            </view>
                            <view class="mt-auto flex justify-between items-baseline">
                                <view class="text-[var(--price-text-color)] price-font flex items-baseline">
                                    <text class="text-[26rpx] font-500">￥</text>
                                    <text class="text-[36rpx] font-500">{{ goodsPrice(item).toFixed(2).split('.')[0]
                                        }}</text>
                                    <text class="text-[24rpx] font-500">.{{ goodsPrice(item).toFixed(2).split('.')[1]
                                        }}</text>
                                </view>
                                <text class="text-[22rpx] text-[#999]">
                                    库存:{{ item.goodsSku.stock }}{{ item.unit }} | 已售:{{ item.sale_num }}{{ item.unit }}
                                </text>
                                <text @click.stop="onGoodsShare(item.goods_id)"
                                    class="nc-iconfont nc-icon-fenxiangV6xx"></text>
                            </view>
                        </view>
                    </view>
                </template>
            </view>
            <view v-else-if="!loading" class="flex items-center justify-center py-[200rpx]">
                <text class="text-[28rpx] text-[#999]">暂无商品</text>
            </view>
        </mescroll-body>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { getGoodsPages, getGoodsDetail } from '@/addon/phone_shop/api/goods'
import { redirect, img, deepClone } from '@/utils/common'
import useMescroll from '@/components/mescroll/hooks/useMescroll.js'
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app'
import MescrollBody from "@/components/mescroll/mescroll-body/mescroll-body.vue"
import MescrollEmpty from "@/components/mescroll/mescroll-empty/mescroll-empty.vue"

const mescrollRef = ref(null)
const goodsList = ref([])
const loading = ref(false)
const activeTab = ref('today')
const goodsDetail = ref({})

// mescroll 配置
const downOption = {
    use: true,
    auto: false,
    native: false,
    textInOffset: '下拉刷新',
    textOutOffset: '释放更新',
    textLoading: '加载中...',
    offset: 80,
    fps: 40
}

const upOption = {
    use: true,
    auto: true,
    page: {
        num: 0,
        size: 10,
        time: null
    },
    textLoading: '加载中...',
    textNoMore: '-- 没有更多数据了 --',
    offset: 80,
    empty: {
        use: true,
        icon: null,
        tip: '暂无商品'
    },
    noMoreSize: 5
}

// mescroll 实例
const mescroll = ref(null)

// mescroll 初始化
const mescrollInit = (m: any) => {
    mescroll.value = m
}

// 下拉刷新回调
const downCallback = async (m: any) => {
    try {
        goodsList.value = []
        m.resetUpScroll()
        m.endSuccess()
    } catch (err) {
        console.error('下拉刷新失败:', err)
        m.endErr()
    }
}

// 切换标签
const switchTab = (tab: string) => {
    if (activeTab.value === tab) return
    activeTab.value = tab
    goodsList.value = []
    // 使用保存的 mescroll 实例
    if (mescroll.value) {
        mescroll.value.resetUpScroll()
    }
}

// 获取今天的开始时间戳
const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timestamp = Math.floor(today.getTime() / 1000);
    console.log('今天开始时间:', new Date(timestamp * 1000).toLocaleString());
    return timestamp;
}

// 获取昨天的开始时间戳
const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const timestamp = Math.floor(yesterday.getTime() / 1000);
    console.log('昨天开始时间:', new Date(timestamp * 1000).toLocaleString());
    return timestamp;
}

// 获取结束时间戳
const getEndDate = (date: Date) => {
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const timestamp = Math.floor(endDate.getTime() / 1000);
    console.log('结束时间:', new Date(timestamp * 1000).toLocaleString());
    return timestamp;
}

// 加载商品
const loadNewGoods = async (mescroll: any) => {
    loading.value = true;
    try {
        let startTime, endTime;
        const now = new Date();
        
        if (activeTab.value === 'today') {
            startTime = getTodayDate();
            endTime = getEndDate(now);
        } else {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            startTime = getYesterdayDate();
            endTime = getEndDate(yesterday);
        }

        const params = {
            page: mescroll.num,
            limit: mescroll.size,
            create_time: [startTime, endTime],
            order: 'create_time',
            sort: 'desc'
        }

        console.log('请求参数:', JSON.stringify(params, null, 2));
        console.log('时间范围:', {
            start: {
                timestamp: startTime,
                date: new Date(startTime * 1000).toLocaleString(),
            },
            end: {
                timestamp: endTime,
                date: new Date(endTime * 1000).toLocaleString(),
            }
        });

        const res = await getGoodsPages(params);
        console.log('API响应:', JSON.stringify(res, null, 2));
        const newArr = res.data.data;

        if (mescroll.num === 1) {
            goodsList.value = newArr;
        } else {
            goodsList.value = goodsList.value.concat(newArr);
        }

        mescroll.endSuccess(newArr.length);
    } catch (err) {
        console.error('加载商品失败:', err);
        mescroll.endErr();
    } finally {
        loading.value = false;
    }
}

// 分享商品（包含下载功能）
const onGoodsShare = (id: number) => {
    getGoodsDetail({
        goods_id: id,
    }).then(res => {
        if (!res.data.goods || JSON.stringify(res.data) === '[]') {
            uni.showToast({ title: '找不到该商品', icon: 'none' })
            setTimeout(() => {
                redirect({ url: '/addon/phone_shop/pages/index', mode: 'reLaunch' })
            }, 600)
            return false
        }

        goodsDetail.value = deepClone(res.data);
        // 处理商品图片
        if (goodsDetail.value.goods.goods_image.indexOf(',') > -1) {
            goodsDetail.value.goods.goods_image = goodsDetail.value.goods.goods_image.split(',')
        } else {
            goodsDetail.value.goods.goods_image = [goodsDetail.value.goods.goods_image]
        }

        downloadMultipleImages(goodsDetail.value.goods.goods_image).then(res => {
            if (res) {
                let sku_no = goodsDetail.value.sku_no ? '#' + goodsDetail.value.sku_no + ' ' : ''
                uni.setClipboardData({
                    data: goodsDetail.value.goods.goods_name + ' ' + goodsDetail.value.goods.sub_title + ' ' + sku_no + goodsDetail.value.goods.price,
                    success() {
                        uni.showToast({
                            title: '图片下载及复制文案成功',
                            icon: 'none'
                        })
                    }
                })
            } else {
                uni.showToast({
                    title: '下载失败',
                    icon: 'none'
                });
            }
        })
    })
}

// 下载单个图片
function downloadImage(imageUrl: string) {
    return new Promise((resolve, reject) => {
        uni.downloadFile({
            url: imageUrl,
            success: (res) => {
                if (res.errMsg == "downloadFile:ok") {
                    uni.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => {
                            uni.showToast({
                                title: '保存成功',
                                icon: 'none'
                            });
                            resolve(res.tempFilePath);
                        },
                        fail: () => {
                            uni.showToast({
                                title: '保存失败，请稍后重试',
                                icon: 'none'
                            });
                            reject('保存图片失败');
                        }
                    });
                } else {
                    reject('下载文件失败');
                }
            },
            fail: () => {
                uni.showToast({
                    title: '保存失败，请稍后重试',
                    icon: 'none'
                });
                reject('下载过���中出错');
            }
        });
    });
}

// 下载多个图片
function downloadMultipleImages(images: any[]) {
    let downloadTasks = images.map((imageUrl: string) => downloadImage(imageUrl));
    loading.value = true;
    return Promise.all(downloadTasks)
        .then((results) => {
            loading.value = false;
            return true;
        })
        .catch((error) => {
            loading.value = false;
            return false;
        });
}

// 初始化加载
onMounted(() => {
    nextTick(() => {
        if (mescroll.value) {
            mescroll.value.resetUpScroll()
        }
    })
})

// 跳转到商品详情
const toDetail = (id: string | number) => {
    redirect({
        url: '/addon/phone_shop/pages/goods/detail',
        param: { goods_id: id },
        mode: 'navigateTo'
    })
}

// 商品价格计算
const goodsPrice = (item: any) => {
    let price = "0.00"
    if (item.is_discount && item.goodsSku.sale_price != item.goodsSku.price) {
        price = item.goodsSku.sale_price || item.goodsSku.price
    } else if (item.member_discount && item.goodsSku.member_price != item.goodsSku.price) {
        price = item.goodsSku.member_price || item.goodsSku.price
    } else {
        price = item.goodsSku.price
    }
    return parseFloat(price)
}
</script>

<style lang="scss" scoped>
.multi-hidden {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.bg-primary {
    background-color: var(--primary-color);
}

:deep(.mescroll-downwarp) {
    min-height: 60rpx;
}

:deep(.mescroll-upwarp) {
    min-height: 60rpx;
}

:deep(.mescroll-empty) {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>