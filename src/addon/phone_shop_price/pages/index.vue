<template>
    <view class="page">
        <!-- Banner区域 -->

        <view class="banner-section" v-if="bannerList.length > 0">
            <swiper class="banner-swiper" circular autoplay interval="3000" duration="500" @change="onSwiperChange">
                <swiper-item v-for="(item, index) in bannerList" :key="index">
                    <image :src="img(item.image)" mode="aspectFill" class="banner-image" />
                </swiper-item>
            </swiper>
            <view class="banner-indicator">
                <view v-for="(item, index) in bannerList" :key="index"
                    :class="['indicator-dot', currentBannerIndex === index ? 'active' : '']">
                </view>
            </view>
        </view>

        <!-- 头部搜索区 -->
        <!-- <view class="search-section">
            <view class="search-box">
                <up-icon name="search" size="20" color="#666"></up-icon>
                <input type="text" placeholder="搜索品牌型号" class="search-input" disabled
                    @focus="() => redirect({ url: '/addon/phone_shop_price/pages/category' })" />
            </view>
        </view> -->

        <!-- VIP提示区 -->
        <view class="vip-section" v-if="hasNeedVip">
            <view class="vip-content" v-if="!userInfo?.member_level">
                <view class="vip-text">
                    <up-icon name="vip" size="20" color="#FFD700"></up-icon>
                    <text class="ml-2">开通VIP享受更多专业报价</text>
                </view>
                <button class="vip-btn" @click="linkVip()">立即开通</button>
            </view>
            <view class="vip-content" v-else>
                <view class="vip-text">
                    <up-icon :name="isVipExpired ? 'warning' : 'level'" size="20"
                        :color="isVipExpired ? '#ff4d4f' : '#FFD700'"></up-icon>
                    <text class="ml-2" :class="{ 'text-expired': isVipExpired }">
                        {{ isVipExpired ? '会员已过期，请续费' : `尊敬的 ${vip_name} 会员` }}
                    </text>
                </view>
                <button class="vip-btn" v-if="isVipExpired" @click="linkVip()">立即续费</button>
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
            <swiper class="swiper-box" :current="currentCategoryIndex" @change="handleSwiperChange" :style="{ height: swiperHeight + 'px' }">
                <swiper-item v-for="(category, index) in categoryList" :key="index">
                    <scroll-view scroll-y class="swiper-item-scroll" @scroll="onScroll">
                        <view class="swiper-item-content" :id="'swiper-content-' + index">
                            <view class="category-content" v-if="category.child_list && category.child_list.length">
                                <up-grid :border="false" col="4">
                                    <up-grid-item v-for="(listItem, listIndex) in getFilteredChildList(category)"
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
import { getCategoryTree, getMemberLevel, getBannerList, getLevelInfo } from '@/addon/phone_shop_price/api/recycle';

import { img, redirect } from '@/utils/common';
import useMemberStore from "@/stores/member";
import { useLogin } from "@/hooks/useLogin";

const memberStore = useMemberStore();
const userInfo = computed(() => memberStore.info);

// Banner数据
const bannerList = ref([]);

// 轮播当前索引
const currentBannerIndex = ref(0);

// 轮播切换事件处理
const onSwiperChange = (e) => {
    currentBannerIndex.value = e.detail.current;
};

// 获取Banner列表
const _getBannerList = async () => {
    const res = await getBannerList();
    if (res.code === 1) {
        bannerList.value = res.data;
    }
};

// VIP会员信息
const vipInfo = ref(null);
const isVipExpired = computed(() => {
    if (!vipInfo.value) return true;
    const overTime = new Date(vipInfo.value.over_time).getTime();
    return overTime < Date.now();
});

// 是否是有效VIP
const isVip = computed(() => userInfo.value?.member_level && !isVipExpired.value);
const vip_name = computed(() => {
    if (isVipExpired.value) return '已过期';
    return userInfo.value?.member_level_name;
});

// 获取会员等级信息
const getVipInfo = async () => {
    try {
        const res = await getLevelInfo();
        if (res.code === 1) {
            vipInfo.value = res.data;
        }
    } catch (error) {
        console.error('获取会员信息失败:', error);
    }
};

// VIP到期提示
const showVipExpiredTip = () => {
    if (isVipExpired.value) {
        uni.showModal({
            title: '会员已到期',
            content: '您的会员已过期，请续费以继续使用VIP功能',
            confirmText: '立即续费',
            cancelText: '稍后处理',
            success: (res) => {
                if (res.confirm) {
                    linkVip();
                }
            }
        });
        return true;
    }
    return false;
};

// 点击需要VIP权限的内容时的处理
const handleVipContent = (callback: Function) => {
    if (!userInfo.value?.member_level) {
        is_vip_dialog.value = true;
        return;
    }

    if (isVipExpired.value) {
        showVipExpiredTip();
        return;
    }

    callback && callback();
};

// 修改handleClick方法
const handleClick = (id: number) => {
    const category = flattenCategoryList.value.find(item => item.category_id === id);
    if (!category) return;
    console.log(category);

    if (category.need_vip) {
        handleVipContent(() => {
            previewImages(category.images);
        });
    } else {
        // 不需要 VIP 的选项，直接预览图片
        if (category.images) {
            previewImages(category.images);
        }
    }
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
const currentCategoryIndex = ref(0)
const swiperHeight = ref(100); // 默认高度 100px
const contentHeights = ref<number[]>([]); // 存储每个分类的内容高度

// 计算内容高度
const calculateContentHeight = () => {
    nextTick(() => {
        const query = uni.createSelectorQuery();
        categoryList.value.forEach((_, index) => {
            query.select(`#swiper-content-${index}`).boundingClientRect(rect => {
                if (rect) {
                    contentHeights.value[index] = rect.height;
                    // 如果是当前显示的分类，更新 swiper 高度
                    if (index === currentCategoryIndex.value) {
                        updateSwiperHeight(rect.height);
                    }
                }
            }).exec();
        });
    });
};

// 更新 swiper 高度
const updateSwiperHeight = (height: number) => {
    // 设置最小高度为 100px
    swiperHeight.value = Math.max(100, height);
};

// 切换分类
const switchCategory = (index: number) => {
    currentCategoryIndex.value = index;
    // 更新高度为当前分类的内容高度
    if (contentHeights.value[index]) {
        updateSwiperHeight(contentHeights.value[index]);
    }
};

// swiper 切换事件
const handleSwiperChange = (e: any) => {
    const current = e.detail.current;
    currentCategoryIndex.value = current;
    // 更新高度为当前分类的内容高度
    if (contentHeights.value[current]) {
        updateSwiperHeight(contentHeights.value[current]);
    }
};

// 监听数据变化，更新高度
watch(() => categoryList.value, () => {
    nextTick(() => {
        calculateContentHeight();
    });
}, { deep: true });

// 页面加载完成后计算高度
onMounted(() => {
    calculateContentHeight();
});

onMounted(async () => {
    await getVipInfo();
    if (!userInfo.value) {
        useLogin().setLoginBack({ url: "/addon/phone_shop_price/pages/index" });
    }

    // 使用 Promise.all 同时获取分类和会员数据
    Promise.all([
        getCategoryTree(),
        getMemberLevel(),
        _getBannerList()
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
// 全局变量
$primary-color: #007AFF;
$vip-gold: #FFD700;
$text-primary: #333;
$text-secondary: #666;
$text-light: #999;
$border-color: rgba(60, 60, 67, 0.1);
$card-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

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
    padding: 0 20rpx;
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
            color: $text-primary;

            &::placeholder {
                color: $text-light;
            }
        }
    }
}

// VIP区域样式
.vip-section {
    margin: 20rpx;
    background: linear-gradient(135deg, #1E1E1E 0%, #2D2D2D 100%);
    border-radius: 16rpx;
    padding: 15rpx;
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
        justify-content: space-around;
        align-items: center;
        z-index: 1;

        .vip-text {
            display: flex;
            align-items: center;
            gap: 12rpx;

            .up-icon {
                filter: drop-shadow(0 0 4rpx rgba($vip-gold, 0.5));
            }

            .ml-2 {
                font-size: 28rpx;
                font-weight: 500;
                color: $vip-gold;
                text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
            }
        }

        .vip-btn {
            background: linear-gradient(135deg, $vip-gold 0%, #FDB931 100%);
            color: #1a1a1a;
            padding: 16rpx 36rpx;
            border-radius: 30rpx;
            font-size: 28rpx;
            font-weight: 600;
            box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            margin-right: inherit;

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
    border-radius: 16rpx;
    padding: 10rpx;
    box-shadow: $card-shadow;
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
            background: rgba($primary-color, 0.1);
            padding: 16rpx;
            border-radius: 12rpx;
        }

        text {
            font-size: 24rpx;
            color: $text-primary;
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
    box-shadow: $card-shadow;
    margin-bottom: 120rpx;

    .category-nav {
        background: rgba($primary-color, 0.03);
        border-bottom: 0.5rpx solid $border-color;
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
            color: $text-secondary;
            font-size: 28rpx;
            position: relative;
            transition: all 0.3s ease;

            &.active {
                color: $primary-color;
                font-weight: 500;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: -8rpx;
                    left: 24rpx;
                    right: 24rpx;
                    height: 2rpx;
                    background: $primary-color;
                    transition: all 0.3s ease;
                }
            }
        }
    }

    .swiper-box {
        transition: height 0.3s ease;
    }

    .swiper-item-scroll {
        height: 100%;
    }

    .swiper-item-content {
        min-height: 100px;
    }

    .category-item {
        background: #fff;
        border-radius: 16rpx;
        margin-bottom: 20rpx;
        overflow: hidden;
        box-shadow: $card-shadow;

        .category-header {
            padding: 24rpx;
            border-bottom: 1px solid #f5f5f5;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .category-title {
                font-size: 32rpx;
                font-weight: 600;
                color: $text-primary;
            }

            .category-count {
                font-size: 24rpx;
                color: $text-light;
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

// 网格项样式
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
}

// VIP标记样式
.vip-badge {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 20rpx;
    padding: 4rpx 8rpx;
    z-index: 2;

    .up-icon {
        filter: drop-shadow(0 0 4rpx rgba($vip-gold, 0.5));
    }
}

// 品牌图标样式
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

    &.vip-locked {
        opacity: 0.7;
    }

    .lock-mask {
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

        .up-icon {
            filter: drop-shadow(0 0 4rpx rgba($vip-gold, 0.5));
        }
    }
}

// 品牌名称样式
.brand-name {
    font-size: 23rpx;
    color: $text-primary;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    padding: 0 10rpx;
    box-sizing: border-box;
    font-weight: normal;
}

// VIP提示样式
.vip-tip {
    font-size: 20rpx;
    color: $vip-gold;
    background: rgba(0, 0, 0, 0.6);
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    margin-top: -6rpx;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

// 悬浮按钮样式
.floating-btn {
    position: fixed;
    bottom: 40rpx;
    left: 40rpx;
    right: 40rpx;
    background: linear-gradient(135deg, $primary-color, #0056b3);
    padding: 24rpx;
    border-radius: 100rpx;
    box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
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

// 动画
@keyframes breathing {
    0% {
        transform: scale(1);
        box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
    }

    50% {
        transform: scale(1.02);
        box-shadow: 0 8rpx 30rpx rgba($primary-color, 0.5);
    }

    100% {
        transform: scale(1);
        box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
    }
}

@keyframes shine {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>