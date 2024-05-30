<template>
	<view :style="themeColor()">
        <scroll-view scroll-y="true" v-if="!loading">
            <u-swipe-action>
                <view class="p-[30rpx]">
                    <u-swipe-action-item :options="addressOptions" @click="swipeClick"  v-for="item in addressList">
                        <view class="border-0 !border-b !border-[#f5f5f5] border-solid py-[20rpx] flex items-center">
                            <view class="flex-1 line-feed" @click="selectAddress(item)">
                                <view class="font-bold my-[10rpx] text-sm line-feed w-full">{{ item.full_address }}</view>
                                <view class="text-sm flex items-center">
                                    <view> {{ item.name }}</view> 
                                    <text class="text-[26rpx] text-gray-subtitle">{{ mobileHide(item.mobile) }}</text>
                                    <view class="bg-primary text-white text-xs px-[10rpx] leading-none flex items-center h-[32rpx] ml-[10rpx] rounded min-w-[100rpx]" v-if="item.is_default == 1">{{ t('default') }}</view>
                                </view>
                            </view>
                            <text class="iconfont iconbianji mr-[24rpx] shrink-0" @click="editAddress(item.id)"></text>
                        </view>
                    </u-swipe-action-item>
                    <view v-if="!addressList.length" class="pt-[15vh]">
                        <u-empty :text="t('noHomeAddress')" :icon="img('static/resource/images/empty.png')"/>
                    </view>
                </view>
            </u-swipe-action>
            <u-tabbar :fixed="true" :safeAreaInsetBottom="true" :border="false">
                <view class="p-[24rpx] pt-0 w-full">
                    <u-button type="primary" shape="circle" :text="t('addHomeAddress')" @click="addAddress"></u-button>
                </view>
            </u-tabbar>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, watch } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import { redirect, img, mobileHide } from '@/utils/common'
    import { getAddressList, deleteAddress } from '@/app/api/member'
    import { t } from '@/locale'

    const loading = ref(true)
    const addressList = ref<object[]>([])
    const getAddressListFn = ()=>{
        getAddressList({}).then(({ data }) => {
            const address = []
            data.forEach(item => { 
                item.type == 'address' ? address.push(item) : ''
            })
            addressList.value = address
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
    
    const swipeClick = (event: any) => {
        const data = addressList.value[event.index]
        deleteAddress(data.id)
            .then(()=>{
                addressList.value.splice(event.index, 1)
            }).catch()
    }
</script>

<style lang="scss" scoped>
    :deep(.u-tabs__wrapper__nav__line) {
        bottom: 0;
    }
    :deep(.u-swipe-action-item__right){
        height: 124rpx;
        top: 2px;
        bottom: 2px;
        right: 2px;
    }
    .line-feed{
        word-wrap:break-word;
        word-break: break-all;
    }
</style>