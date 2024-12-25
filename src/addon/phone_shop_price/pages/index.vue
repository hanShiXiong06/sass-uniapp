<template>
    <view class="page">
        <!-- Banner区域 -->
        <view class="banner-section">
            <swiper class="banner-swiper" circular autoplay interval="3000" duration="500" @change="onSwiperChange">
                <swiper-item v-for="(item, index) in bannerList" :key="index">
                    <image :src="item.image" mode="aspectFill" class="banner-image" />
                </swiper-item>
            </swiper>
            <view class="banner-indicator">
                <view v-for="(item, index) in bannerList" :key="index"
                    :class="['indicator-dot', currentBannerIndex === index ? 'active' : '']">
                </view>
            </view>
        </view>

        <!-- 头部搜索区 -->
        <view class="search-section">
            <view class="search-box">
                <up-icon name="search" size="20" color="#666"></up-icon>
                <input type="text" placeholder="搜索品牌型号" class="search-input" disabled
                    @focus="() => redirect({ url: '/addon/phone_shop_price/pages/category' })" />
            </view>
        </view>

        <!-- VIP提示区 -->
        <view class="vip-section" v-if="hasNeedVip">
            <view class="vip-content" v-if="!isVip">
                <view class="vip-text">
                    <up-icon name="vip" size="20" color="#FFD700"></up-icon>
                    <text class="ml-2">开通VIP享受更多专业报价</text>
                </view>
                <button class="vip-btn" @click="linkVip()">立即开通</button>
            </view>
            <view class="vip-content" v-else>
                <view class="vip-text">
                    <up-icon name="level" size="20" color="#FFD700"></up-icon>
                    <text class="ml-2">尊敬的 {{ vip_name }} 会员</text>
                </view>
            </view>
        </view>

        <!-- 快捷操作区 -->

        <view class="quick-actions">
            <view class="action-item floating-btn" @click="toAddOrder">
                <up-icon name="file-text" size="24" color="#ffffff"></up-icon>
                <text>立即下单</text>
            </view>
            <view class="action-item" @click="redirect({ url: '/addon/phone_shop_price/pages/order/list' })">
                <up-icon name="order" size="24" color="#007AFF"></up-icon>
                <text>我的订单</text>
            </view>
            <view class="action-item" @click="redirect({ url: '/addon/phone_shop_price/pages/payment/index' })">
                <up-icon name="rmb-circle" size="24" color="#007AFF"></up-icon>
                <text>收款方式</text>
            </view>
        </view>

        <!-- 分类列表区 -->
        <view class="category-section">
            <!-- 分类导航 -->
            <scroll-view class="category-nav" scroll-x :scroll-into-view="`nav-${currentCategoryIndex}`"
                scroll-with-animation>
                <view class="nav-items">
                    <view v-for="(item, index) in categoryList" :key="index" :id="`nav-${index}`" class="nav-item"
                        :class="{ active: currentCategoryIndex === index }" @click="switchCategory(index)"
                        v-show="item.is_show">
                        {{ item.category_name }}
                    </view>
                </view>
            </scroll-view>

            <!-- 分类内容 -->
            <swiper class="category-swiper" :current="currentCategoryIndex" @change="onCategoryChange"
                :style="{ height: swiperHeight + 'px' }" duration="300" circular>
                <swiper-item v-for="(item, index) in categoryList" :key="index" v-show="item.is_show">
                    <scroll-view scroll-y class="category-scroll" :id="`category-content-${index}`"
                        @scrolltolower="onLoadMore">
                        <view class="category-content" v-if="item.child_list && item.child_list.length">
                            <up-grid :border="false" col="4">
                                <up-grid-item v-for="(listItem, listIndex) in getFilteredChildList(item)"
                                    :key="listIndex" @click="handleClick(listItem.category_id)" class="grid-item">
                                    <view class="grid-item-content">
                                        <view class="vip-badge" v-if="listItem.need_vip">
                                            <up-icon name="level" size="16" color="#FFD700"></up-icon>
                                        </view>

                                        <view class="brand-icon" :class="{ 'vip-locked': listItem.need_vip && !isVip }">
                                            <up-icon :customStyle="{ padding: '10rpx' }" :name="img(listItem.image)"
                                                :size="40" />
                                            <view class="lock-mask" v-if="listItem.need_vip && !isVip">
                                                <up-icon name="lock" size="20" color="#FFD700"></up-icon>
                                            </view>
                                        </view>

                                        <text class="brand-name">{{ listItem.category_name }}</text>
                                        <!-- <text class="vip-tip" v-if="listItem.need_vip && !isVip">VIP专享</text> -->
                                    </view>
                                </up-grid-item>
                            </up-grid>
                        </view>
                        <view class="empty-category" v-else>
                            <up-icon name="info" size="24" color="#999"></up-icon>
                            <text>无报价信息</text>
                        </view>
                    </scroll-view>
                </swiper-item>
            </swiper>
        </view>

        <!-- VIP弹窗 -->
        <up-modal :show="is_vip_dialog" :title="title" :content="content" showCancelButton
            @cancel="is_vip_dialog = false" @confirm="linkVip()" cancelText="暂不开通" confirmText="立即开通">
            <view class="vip-modal-content">
                <view class="vip-benefits">
                    <view class="benefit-item" v-for="(benefit, index) in levelBenefits" :key="index">
                        <up-icon name="checkmark-circle" color="#FFD700" size="20"></up-icon>
                        <text>{{ benefit.title }}</text>
                    </view>
                </view>
                <view class="vip-price">
                    <text class="price-label">开通价格</text>
                    <view class="price-options">
                        <view v-for="(fee, index) in feeList" :key="index" class="price-option"
                            :class="{ active: selectedFeeIndex === index }" @click="selectedFeeIndex = index">
                            <text class="option-name">{{ fee.name }}</text>
                            <view class="option-price">
                                <text class="currency">¥</text>
                                <text class="amount">{{ fee.price }}</text>
                            </view>
                            <text class="option-market-price" v-if="fee.market_price">原价 ¥{{ fee.market_price }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </up-modal>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { getCategoryTree } from '@/addon/phone_shop_price/api/recycle';
import { getMemberLevel } from '@/addon/tk_vip/api/member';

import { img, redirect } from '@/utils/common';
import useMemberStore from "@/stores/member";
import { useLogin } from "@/hooks/useLogin";

const memberStore = useMemberStore();
const userInfo = computed(() => memberStore.info);

// Banner数据
const bannerList = ref([
    {
        image: 'https://vip.123pan.cn/1832133965/tiantai/172700160816188b1d81b95069f643e50166ae526e_ott.png'
    },
    {
        image: 'https://vip.123pan.cn/1832133965/tiantai/172700160816188b1d81b95069f643e50166ae526e_ott.png'
    }
]);
const currentBannerIndex = ref(0);

// 轮播切换事件处理
const onSwiperChange = (e) => {
    currentBannerIndex.value = e.detail.current;
};

// VIP等级数据
const memberLevels = ref([]);
const currentLevel = computed(() => memberLevels.value[0] || null);
const selectedFeeIndex = ref(0);

// 获取会员权益列表
const levelBenefits = computed(() => {
    if (!currentLevel.value?.level_benefits) return [];
    return Object.values(currentLevel.value.level_benefits)
        .filter(benefit => benefit.is_use === 1)
        .map(benefit => benefit.content);
});

// 获取收费方案列表
const feeList = computed(() => {
    if (!currentLevel.value?.level_benefits?.tk_vip_fee?.fee_info) return [];
    return currentLevel.value.level_benefits.tk_vip_fee.fee_info.filter(fee => fee.is_use === "1");
});

// 修改VIP相关文案
const title = computed(() => currentLevel.value ? `开通${currentLevel.value.level_name}` : '开通VIP会员');
const content = computed(() => currentLevel.value ? currentLevel.value.remark : '开通VIP会员即可享受以下特权：');

let categoryList = ref([]);
let flattenCategoryList = ref([]);
const is_vip_dialog = ref(false);
const isVip = computed(() => userInfo.value?.member_level);
const vip_name = computed(() => userInfo.value?.member_level_name);

const currentCategoryIndex = ref(0);
const swiperHeight = ref(300); // 默认高度
const contentHeights = ref<number[]>([]); // 存储每个分类的内容高度

// 计算容高度
const updateSwiperHeight = () => {
    // 获取当前分类的内容高度
    const query = uni.createSelectorQuery();
    categoryList.value.forEach((_, index) => {
        query.select(`#category-content-${index}`).boundingClientRect(rect => {
            if (rect) {
                contentHeights.value[index] = rect.height;
                // 如果是当前显示的分类，更新swiper高度
                if (index === currentCategoryIndex.value) {
                    swiperHeight.value = rect.height;
                }
            }
        }).exec();
    });
};

// 切换分类
const switchCategory = (index: number) => {
    currentCategoryIndex.value = index;
    // 更新高度
    if (contentHeights.value[index]) {
        swiperHeight.value = contentHeights.value[index];
    }
};

// swiper 切换事件
const onCategoryChange = (e: any) => {
    const index = e.detail.current;
    currentCategoryIndex.value = index;
    // 更新高度
    if (contentHeights.value[index]) {
        swiperHeight.value = contentHeights.value[index];
    }
};

// 监听数据变化，更新高度
watch(() => categoryList.value, () => {
    nextTick(() => {
        updateSwiperHeight();
    });
}, { deep: true });

// 页面加载完成后计算高度
onMounted(() => {
    nextTick(() => {
        updateSwiperHeight();
    });
});

onMounted(() => {
    if (!userInfo.value) {
        useLogin().setLoginBack({ url: "/addon/phone_shop_price/pages/index" });
    }

    // 使用 Promise.all 同时获取分类和会员数据
    Promise.all([
        getCategoryTree(),
        getMemberLevel()
    ]).then(([categoryRes, memberRes]) => {
        if (categoryRes.code === 1 && categoryRes.data) {
            categoryList.value = categoryRes.data;
            flattenCategoryList.value = flattenArray(categoryRes.data);
        }

        if (memberRes.code === 1 && memberRes.data) {
            memberLevels.value = memberRes.data;
        }
    }).catch(error => {
        console.error('数据获取失败:', error);
    });
});

const getFilteredChildList = (item) => item.child_list.filter(listItem => listItem.is_show);

const handleClick = (id) => {
    const itemIndex = flattenCategoryList.value.findIndex(v => v.category_id === id);

    if (itemIndex === -1 || !flattenCategoryList.value[itemIndex].images) {
        is_vip_dialog.value = true;
    } else {
        previewImages(flattenCategoryList.value[itemIndex].images);
    }
};

const previewImages = (images) => {
    if (!images.startsWith('http')) {
        images = getImgUrl() + images;
    }
    uni.previewImage({
        indicator: "number",
        loop: true,
        urls: Array.isArray(images) ? images : [images]
    });
};

const getImgUrl = () => {
    return import.meta.env.VITE_IMG_DOMAIN || '';
}

const linkVip = () => {
    const fee = feeList.value[selectedFeeIndex.value];
    uni.navigateTo({
        url: `/addon/tk_vip/pages/index?level_id=${currentLevel.value?.level_id}&fee_id=${fee?.id}`
    });
};

const toAddOrder = () => {
    uni.navigateTo({ url: '/addon/phone_shop_price/pages/order/order' });
};

function flattenArray(data) {
    return data.reduce((acc, item) => {
        if (item.images) acc.push(item);
        if (item.child_list && item.child_list.length) {
            acc = acc.concat(flattenArray(item.child_list));
        }
        return acc;
    }, []);
}

const hasNeedVip = computed(() => {
    return categoryList.value.some(item =>
        item.child_list && item.child_list.some(child => child.need_vip === 1)
    );
});

// 添加CSS变量设置
const updateLevelColors = () => {
    if (currentLevel.value?.level_style) {
        document.documentElement.style.setProperty('--level-color', currentLevel.value.level_style.level_color || '#FFD700');
        document.documentElement.style.setProperty('--level-bg-color', `rgba(${currentLevel.value.level_style.level_color || '#FFD700'}, 0.1)`);
    }
};

// 监听currentLevel的变化
watch(() => currentLevel.value, (newVal) => {
    if (newVal) {
        updateLevelColors();
    }
}, { immediate: true });

</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 100rpx;
}

// Banner样式
.banner-section {
    position: relative;
    height: 300rpx;

    .banner-swiper {
        width: 100%;
        height: 100%;
    }

    .banner-image {
        width: 100%;
        height: 100%;
    }

    .banner-indicator {
        position: absolute;
        bottom: 20rpx;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10rpx;
        z-index: 1;

        .indicator-dot {
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transition: all 0.3s ease;

            &.active {
                background: #fff;
                width: 24rpx;
                border-radius: 6rpx;
            }
        }
    }
}

// 搜索区域样式
.search-section {
    padding-left: 20rpx;
    padding-right: 20rpx;
    background: transparent;
    margin-bottom: 10rpx;

    .search-box {
        display: flex;
        align-items: center;
        background: rgba(142, 142, 147, 0.12);
        padding: 12rpx 20rpx;
        border-radius: 10rpx;

        .search-input {
            flex: 1;
            margin-left: 20rpx;
            font-size: 28rpx;
            color: #000;

            &::placeholder {
                color: #8E8E93;
            }
        }
    }
}

// VIP区域样式优化
.vip-section {
    margin: 20rpx;
    background: linear-gradient(135deg, #1E1E1E 0%, #2D2D2D 100%);
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 60%);
        animation: shine 3s infinite;
    }

    .vip-content {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 1;

        .vip-text {
            display: flex;
            align-items: center;
            gap: 12rpx;

            .up-icon {
                filter: drop-shadow(0 0 4rpx rgba(255, 215, 0, 0.5));
            }

            .ml-2 {
                font-size: 28rpx;
                font-weight: 500;
                color: #FFD700;
                text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
            }
        }

        .vip-btn {
            background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%);
            color: #1a1a1a;
            padding: 16rpx 36rpx;
            border-radius: 30rpx;
            font-size: 28rpx;
            font-weight: 600;
            box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;

            &:active {
                transform: scale(0.95);
                box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
            }
        }
    }
}

// 快捷操作区样式
.quick-actions {
    margin: 20rpx;
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);

    .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12rpx;
        padding: 16rpx;
        border-radius: 12rpx;
        transition: all 0.3s;

        &:active {
            transform: scale(0.96);
            background: rgba(0, 0, 0, 0.02);
        }

        .up-icon {
            background: transparent;
        }

        text {
            font-size: 26rpx;
            color: #007AFF;
            font-weight: normal;
        }
    }
}

// 分类列表样式
.category-section {
    margin: 20rpx;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);

    .category-nav {
        background: rgba(0, 122, 255, 0.03);
        border-bottom: 0.5rpx solid rgba(60, 60, 67, 0.1);
        padding: 0 12rpx;
        position: sticky;
        top: 0;
        z-index: 100;
        box-sizing: border-box;

        .nav-items {
            display: flex;
            white-space: nowrap;
            padding: 8rpx 0;
        }

        .nav-item {
            padding: 20rpx 24rpx;
            color: #666;
            font-size: 28rpx;
            position: relative;
            transition: all 0.3s ease;

            &.active {
                color: #007AFF;
                font-weight: 500;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: -8rpx;
                    left: 24rpx;
                    right: 24rpx;
                    height: 2rpx;
                    background: #007AFF;
                    transition: all 0.3s ease;
                }
            }
        }
    }

    .category-swiper {
        transition: height 0.3s ease;
    }

    .category-scroll {
        height: 100%;
    }
}

.grid-item-content {
    position: relative;
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    transition: all 0.3s;
}

.vip-badge {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 20rpx;
    padding: 4rpx 8rpx;
    z-index: 2;
}

.vip-badge .up-icon {
    filter: drop-shadow(0 0 4rpx rgba(255, 215, 0, 0.5));
}

.brand-icon {
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 16rpx;
    transition: all 0.3s;
    position: relative;
}

.brand-icon.vip-locked {
    opacity: 0.7;
}

.brand-icon .lock-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.grid-item-content .brand-icon .lock-mask .up-icon {
    filter: drop-shadow(0 0 4rpx rgba(255, 215, 0, 0.5));
}

.brand-name {
    font-size: 23rpx;
    color: #000;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    padding: 0 10rpx;
    box-sizing: border-box;
    font-weight: normal;
}

.grid-item .grid-item-content .vip-tip {
    font-size: 20rpx;
    color: #FFD700;
    background: rgba(0, 0, 0, 0.6);
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    margin-top: -6rpx;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

.grid-item .grid-item-content:active {
    transform: scale(0.96);
}


// VIP弹窗样式优化
.vip-modal-content {
    padding: 30rpx 20rpx;
    background: linear-gradient(135deg, #1E1E1E 0%, #2D2D2D 100%);

    .vip-benefits {
        margin: 30rpx 0;

        .benefit-item {
            display: flex;
            align-items: center;
            gap: 15rpx;
            margin-bottom: 20rpx;
            padding: 24rpx;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12rpx;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.08);
            }

            .up-icon {
                filter: drop-shadow(0 0 4rpx rgba(255, 215, 0, 0.5));
            }

            text {
                font-size: 28rpx;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
            }
        }
    }

    .vip-price {
        background: rgba(255, 255, 255, 0.05);
        padding: 40rpx 30rpx;
        border-radius: 16rpx;
        text-align: center;
        border: 1rpx solid rgba(255, 215, 0, 0.3);
        backdrop-filter: blur(10px);

        .price-label {
            font-size: 28rpx;
            color: #FFD700;
            margin-bottom: 24rpx;
            display: block;
            letter-spacing: 2rpx;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
        }

        .price-options {
            display: flex;
            flex-wrap: wrap;
            gap: 20rpx;

            .price-option {
                flex: 1;
                min-width: 200rpx;
                background: rgba(255, 255, 255, 0.05);
                padding: 24rpx;
                border-radius: 12rpx;
                text-align: center;
                border: 1rpx solid rgba(255, 215, 0, 0.1);
                transition: all 0.3s;

                &.active {
                    border-color: #FFD700;
                    background: rgba(255, 215, 0, 0.1);
                    box-shadow: 0 0 20rpx rgba(255, 215, 0, 0.2);
                }

                .option-name {
                    font-size: 26rpx;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 12rpx;
                    display: block;
                }

                .option-price {
                    margin: 12rpx 0;

                    .currency {
                        font-size: 24rpx;
                        color: #FFD700;
                    }

                    .amount {
                        font-size: 40rpx;
                        font-weight: bold;
                        color: #FFD700;
                        margin: 0 4rpx;
                        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
                    }
                }

                .option-market-price {
                    font-size: 24rpx;
                    color: rgba(255, 255, 255, 0.4);
                    text-decoration: line-through;
                }
            }
        }
    }
}

// 添加动画
@keyframes shine {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.page {
    min-height: 100vh;
    background: #f6f6f6;
    padding-bottom: env(safe-area-inset-bottom);

    // Banner区域
    .banner-section {
        position: relative;
        margin: 20rpx;
        border-radius: 20rpx;
        overflow: hidden;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

        .banner-swiper {
            height: 320rpx;

            .banner-image {
                width: 100%;
                height: 100%;
                transition: transform 0.3s;
            }
        }

        .banner-indicator {
            position: absolute;
            bottom: 20rpx;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8rpx;
            padding: 8rpx 16rpx;
            border-radius: 20rpx;
            background: rgba(0, 0, 0, 0.2);

            .indicator-dot {
                width: 12rpx;
                height: 12rpx;
                border-radius: 6rpx;
                background: rgba(255, 255, 255, 0.4);
                transition: all 0.3s;

                &.active {
                    width: 24rpx;
                    background: #fff;
                }
            }
        }
    }

    // 搜索区域
    .search-section {

        .search-box {
            display: flex;
            align-items: center;
            gap: 12rpx;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 16rpx 24rpx;
            border-radius: 16rpx;
            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

            .search-input {
                flex: 1;
                font-size: 28rpx;
                color: #333;

                &::placeholder {
                    color: #999;
                }
            }
        }
    }

    // VIP区域
    .vip-section {
        margin: 20rpx;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 16rpx;
        padding: 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

        .vip-content {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .vip-text {
                display: flex;
                align-items: center;
                gap: 12rpx;
                color: #FFD700;

                .ml-2 {
                    font-size: 28rpx;
                    font-weight: 500;
                }
            }

            .vip-btn {
                background: #FFD700;
                color: #1a1a1a;
                padding: 12rpx 32rpx;
                border-radius: 30rpx;
                font-size: 24rpx;
                font-weight: 500;
                transition: all 0.3s;

                &:active {
                    transform: scale(0.96);
                    opacity: 0.9;
                }
            }
        }
    }

    // 快捷操作区
    .quick-actions {
        margin: 20rpx;
        background: #fff;
        border-radius: 16rpx;
        padding: 24rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
        display: flex;
        justify-content: space-around;

        .action-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12rpx;
            padding: 16rpx;
            border-radius: 12rpx;
            transition: all 0.3s;

            &:active {
                transform: scale(0.96);
                background: rgba(0, 0, 0, 0.02);
            }

            .up-icon {
                background: rgba(0, 122, 255, 0.1);
                padding: 16rpx;
                border-radius: 12rpx;
            }

            text {
                font-size: 24rpx;
                color: #333;
                font-weight: 500;
            }
        }
    }

    // 分类列表区
    .category-section {
        padding: 20rpx;

        .category-item {
            background: #fff;
            border-radius: 16rpx;
            margin-bottom: 20rpx;
            overflow: hidden;
            box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

            .category-header {
                padding: 24rpx;
                border-bottom: 1px solid #f5f5f5;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .category-title {
                    font-size: 32rpx;
                    font-weight: 600;
                    color: #333;
                }

                .category-count {
                    font-size: 24rpx;
                    color: #999;
                    background: rgba(0, 0, 0, 0.05);
                    padding: 4rpx 12rpx;
                    border-radius: 20rpx;
                }
            }

            .category-content {
                padding: 24rpx;
            }
        }
    }

    // 品牌网格
    .grid-item {
        .grid-item-content {
            position: relative;
            padding: 20rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12rpx;
            transition: all 0.3s;

            &:active {
                transform: scale(0.96);
            }

            .brand-icon {
                width: 88rpx;
                height: 88rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 16rpx;
                transition: all 0.3s;
            }

            .brand-name {
                font-size: 24rpx;
                color: #333;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
                padding: 0 10rpx;
                box-sizing: border-box;
                font-weight: 500;
            }
        }
    }
}

// 悬浮按钮样式
.floating-btn {
    position: fixed;
    bottom: 40rpx;
    left: 40rpx;
    right: 40rpx;
    background: linear-gradient(135deg, #007AFF, #0056b3);
    padding: 24rpx;
    border-radius: 100rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.3);
    z-index: 999;
    animation: breathing 2s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;

    .up-icon {
        margin: 0;
    }

    text {
        color: #ffffff !important;
        font-size: 32rpx;
        font-weight: 600;
    }
}

// 呼吸动画
@keyframes breathing {
    0% {
        transform: scale(1);
        box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.3);
    }

    50% {
        transform: scale(1.02);
        box-shadow: 0 8rpx 30rpx rgba(0, 122, 255, 0.5);
    }

    100% {
        transform: scale(1);
        box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.3);
    }
}

// 为底部添加空间
.category-section {
    margin-bottom: 120rpx;
}
</style>