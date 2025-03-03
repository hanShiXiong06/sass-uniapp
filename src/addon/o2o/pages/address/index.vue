<template>
	<view :style="themeColor()">
        <scroll-view scroll-y="true" v-if="!loading">
            <u-swipe-action>
                <view class="p-[30rpx] pt-[0]">
                    <u-swipe-action-item :options="addressOptions" @click="swipeClick(key)" v-for="(item, key) in addressList">
                        <view class="border-0 !border-b !border-[#f5f5f5] border-solid py-[20rpx] flex items-center">
                            <view class="flex-1 line-feed" @click="selectAddress(item)">
                                <view class="font-bold my-[10rpx] text-sm line-feed w-full">{{ item.full_address }}</view>
                                <view class="text-sm flex items-center">
                                    <view> {{ item.name }}</view> 
                                    <text class="text-[26rpx] text-gray-subtitle">{{ mobileHide(item.mobile) }}</text>
                                    <view class="bg-primary text-white text-xs px-[10rpx] leading-none flex items-center h-[32rpx] ml-[10rpx] rounded min-w-[100rpx]" v-if="item.is_default == 1">{{ t('default') }}</view>
                                </view>
                            </view>
                            <text class="nc-iconfont nc-icon-xiugaiV6xx mr-[24rpx] shrink-0" @click="editAddress(item.id)"></text>
                        </view>
                    </u-swipe-action-item>
                    <view v-if="!addressList.length" class="pt-[15vh]">
                        <u-empty :text="t('noHomeAddress')" :icon="img('static/resource/images/empty.png')"/>
                    </view>
                </view>
            </u-swipe-action>
            <u-tabbar :fixed="true" :safeAreaInsetBottom="true" :border="false">
                <view class="p-[24rpx] pt-0 w-full">
                    <button class="bg-[var(--primary-color)] text-[#fff] h-[80rpx] leading-[80rpx] rounded-[100rpx] text-[28rpx]" @click="addAddress">{{t('addHomeAddress')}}</button>
                </view>
            </u-tabbar>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, watch } from 'vue'
    import { redirect, img, mobileHide } from '@/utils/common'
    import { getAddressList, deleteAddress } from '@/app/api/member'
    import { t } from '@/locale'

    const loading = ref(true)
    const addressList = ref<object[]>([])
    const getAddressListFn = ()=>{
        getAddressList({}).then(({ data }) => {
            addressList.value = data
            loading.value = false
        })
        .catch(() => {
            loading.value = false
        })
    
    }
    getAddressListFn()
    
    const addAddress = ()=> {
        redirect({ url: '/addon/o2o/pages/address/address_edit' })
    }
    
    const editAddress = (id: number)=> {
        redirect({ url: '/addon/o2o/pages/address/address_edit', param: { id } })
    }
    
    const addressOptions = ref([
        {
            text: t('delete'),
            style: {
                backgroundColor: '#F56C6C'
            }
        }
    ])
    
    const selectAddress = (data: object) => {
        const selectAddress = uni.getStorageSync('selectAddressCallback')
        if (selectAddress) {
            selectAddress.address_id = data.id
            
            uni.setStorage({
                key: 'selectAddressCallback',
                data: selectAddress,
                success() {
                    redirect({url: selectAddress.back })
                }
            })
        }
    }
    
    const swipeClick = (index: any) => {
        const data = addressList.value[index]
        deleteAddress(data.id)
            .then(()=>{
                addressList.value.splice(index, 1)
            }).catch()
    }
</script>

<style lang="scss" scoped>
    :deep(.u-tabs__wrapper__nav__line) {
        bottom: 0;
        background: var(--primary-color) !important;
    }
     
    .line-feed{
        word-wrap:break-word;
        word-break: break-all;
    }
	
</style>