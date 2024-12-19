<template>
    <mescroll-body ref="mescrollRef" :down="{ use: false }" @init="mescrollInit" @up="_getModelList">
        <up-tabs :list="list1"
            class=" shadow search-box z-10 bg-[#fff] fixed top-0 left-0 right-0 h-[86rpx] box-border "
            @click="handleChange"></up-tabs>
        <!-- <view class="text-sm font-bold px-[30rpx] mt-3">全部分类</view> -->
        <view v-if="list1.length != 0" class=" tabs-box z-2 fixed left-0 bg-[#fff] bottom-[0px] top-10  pt-[10rpx]">
            <scroll-view :scroll-y="true" class="scroll-height">
                <view>
                    <view class="tab-item truncate"
                        :class="{ 'tab-item-active': currentSubIndex == index, 'rounded-br-[12rpx]': currentSubIndex - 1 === index, 'rounded-tr-[12rpx]': currentSubIndex + 1 === index }"
                        v-for="(item, index) in list1[currentIndex].child_list" :key="item.id"
                        @click="changeSubIndex(index)">
                        <view class="text-box px-[16rpx] truncate">
                            {{ item.name }}
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
        <view class="flex justify-center flex-wrap pl-[200rpx] pb-[20rpx]">
            <scroll-view class="pt-10" :scroll-y="true">


                <view
                    class="bg-[#fff] grid grid-cols-2 gap-x-[50rpx] gap-y-[32rpx] py-[33rpx] px-[23rpx]  rounded-[16rpx]">
                    <template v-for="(item, index) in list" :key="item.id">

                        <view class="text-center flex flex-col items-center pt-[8rpx] rounded "
                            @click="toLink(item.modelId)">
                            <u--image radius="12rpx" width="100rpx" height="100rpx"
                                :src="img(item.modelImg ? 'https://erp.suhuanji.com/prod/api/goods/' + item.modelImg : '')"
                                model="aspectFill">
                                <template #error>
                                    <image class="rounded-[12rpx] overflow-hidden w-[60rpx] h-[60rpx]"
                                        :src="img('static/resource/images/diy/shop_default.jpg')" mode="aspectFill">
                                    </image>
                                </template>
                            </u--image>
                            <view class="text-[24rpx] text-center mt-[12rpx] leading-[34rpx]">
                                {{ item.modelName }}
                            </view>
                        </view>
                    </template>
                </view>
            </scroll-view>
        </view>
    </mescroll-body>
</template>

<script lang="ts" setup>

import { getTree, getModelList } from "@/addon/phone_shop_price/api/recycle"
import { ref } from 'vue';

import useMemberStore from '@/stores/member'
import { img, redirect, getToken } from '@/utils/common';
import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
import { onPageScroll, onReachBottom } from '@dcloudio/uni-app';
import Log from "@/addon/o2o/pages/refund/log.vue";

const { mescrollInit, getMescroll } = useMescroll(onPageScroll, onReachBottom);

interface mescrollStructure {
    num: number,
    size: number,
    endSuccess: Function,
    [propName: string]: any
}
// 创建响应式数据  
const list1 = ref([]);
const currentIndex = ref(0)
const currentSubIndex = ref(0)
const list = ref([])
const listLoading = ref(false)
const loading = ref(false)
const _getTree = () => {
    getTree().then(res => {
        list1.value = res.data
    })
}
// 获取型号
const handleChange = (data) => {
    currentIndex.value = data.index
    currentSubIndex.value = 0
    list.value = []
    const model = list1.value[currentIndex.value].child_list.find((v, k) => k == data.index)
    const mescroll = getMescroll(); // 获取当前的 mescroll 实例
    getMescroll().resetUpScroll();
}
// 二级 切换
const changeSubIndex = (index) => {

    currentSubIndex.value = index

    const model = list1.value[currentIndex.value].child_list.find((v, k) => k == index)
    const mescroll = getMescroll(); // 获取当前的 mescroll 实例

    getMescroll().resetUpScroll();
    _getModelList(mescroll);
    list.value = []
}
// 跳转到机框采集页 question.vue 通过redirect
const toLink = (id: number | string) => {
    console.log(id);

    redirect({ url: '/addon/phone_shop_price/pages/question', param: { id }, mode: 'navigateTo' })
}
const _getModelList = (mescroll: mescrollStructure) => {


    console.log(mescroll);
    listLoading.value = false;

    // 查找 id和 typeId 中的 id
    const type = list1.value.find((v, k) => k == currentIndex.value)
    const model = list1.value[currentIndex.value].child_list.find((v, k) => k == currentSubIndex.value)
    // 合并分页参数到请求数据中
    const requestData = {
        page: mescroll.num || 1,
        limit: 20,
        id: model.id,
        typeId: type.id
    };


    getModelList(requestData).then((res: any) => {


        let newArr = res.data.list;

        // 如果是第一页，清空列表数据
        if (mescroll.num === 1) {
            list.value = [];
        }

        // 将新数据拼接到现有列表中
        list.value = list.value.concat(newArr);

        loading.value = false;
        mescroll.endSuccess(newArr.length);
        // 如果成功加载并有数据，手动增加页码
        if (newArr.length > 0) {
            mescroll.num++; // 递增页码
        }
        if (!list.value.length) listLoading.value = true;
    }).catch((error) => {
        loading.value = false;
        listLoading.value = true;
        mescroll.endErr(); // 请求失败，结束加载
    });
};



_getTree()
</script>

<style lang="scss" scoped>
.scroll-view-wrap {
    word-break: keep-all;
}

.text-color {
    color: var(--primary-color);
}

.label-select {
    color: var(--primary-color);
    border-color: var(--primary-color);
    background-color: var(--primary-color-light);
}

:deep(.u-popup .u-transition) {
    top: 156rpx !important;
}

.product-warp {
    z-index: 99999;
}

:deep(.tab-bar-placeholder) {
    display: none !important;
}

:deep(.u-tabbar__placeholder) {
    display: none !important;
}

:deep(.u-input__content__clear) {
    width: 28rpx;
    height: 28rpx;
    font-size: 28rpx;
    background-color: #999;
}

.noData {
    height: calc(100vh - 200rpx - 50px - constant(safe-area-inset-bottom));
    height: calc(100vh - 200rpx - 50px - env(safe-area-inset-bottom));
}

.goods-item-style-two {
    width: calc(50% - 10rpx);
}


.tabs-box {
    width: 182rpx;
    font-size: 28rpx;
}

.tabs-box .tab-item {
    height: 92rpx;
    text-align: center;
    line-height: 92rpx;
    background-color: #e7e2e23f;
}

.tabs-box .tab-item-active {
    position: relative;
    color: var(--primary-color);
    background-color: #ffffff;

    &::before {
        display: inline-block;
        position: absolute;
        left: 0rpx;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        width: 6rpx;
        height: 48rpx;
        background-color: var(--primary-color);
    }

    &::after {
        display: inline-block;
        position: absolute;
        left: 0rpx;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        width: 6rpx;
        height: 48rpx;
        background-color: var(--primary-color);
    }
}

.scroll-height {
    height: 100%;
}

.active {
    color: #f00
}
</style>