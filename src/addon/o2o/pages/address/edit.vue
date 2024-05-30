<template>
	<view :style="themeColor()">
        <scroll-view scroll-y="true" class="bg-page h-screen">
            <view class="h-[30rpx]"></view>
            <view class="m-[30rpx] mt-0 p-[30rpx] pt-[10rpx] rounded-md bg-white">
                <u-form labelPosition="left" :model="formData" labelWidth="200rpx" errorType='toast' :rules="rules" ref="formRef">
                    <view class="mt-[10rpx]">
                        <u-form-item :label="t('name')" prop="name" :border-bottom="true">
                            <u-input v-model="formData.name" border="none" clearable maxlength="25" :placeholder="t('namePlaceholder')"/>
                        </u-form-item>
                    </view>
                    <view class="mt-[10rpx]">
                        <u-form-item :label="t('mobile')" prop="mobile" :border-bottom="true">
                            <u-input v-model="formData.mobile" border="none" clearable :placeholder="t('mobilePlaceholder')"/>
                        </u-form-item>
                    </view>
                    <view class="mt-[10rpx]">
                        <u-form-item :label="t('homeAddress')" prop="address_name" :border-bottom="true">
                            <view class="flex justify-between flex-1" @click="chooseLocation">
                                <view class="text-[#c3c4d5] text-[15px]">{{formData.area ? formData.address_name : t('selectAddressPlaceholder')}}</view>
                                <u-icon name="arrow-right" color="#c3c4d5"></u-icon>
                            </view>
                        </u-form-item>
                    </view>
                    <view class="mt-[10rpx]">
                        <u-form-item :label="t('address')" prop="address" :border-bottom="true">
                            <u-input v-model="formData.address" border="none" clearable maxlength="120" :placeholder="t('addressPlaceholder')"/>
                        </u-form-item>
                    </view>
                    <view class="mt-[10rpx]">
                        <u-form-item :label="t('defaultAddress')" prop="name" :border-bottom="true" >
                            <u-switch v-model="formData.is_default" size="20" :activeValue="1" :inactiveValue="0" activeColor="var(--primary-color)"></u-switch>
                        </u-form-item>
                    </view>
                    <view class="mt-[40rpx]">
                        <u-button class="text-[var-(--primary-color)]" type="primary" shape="circle" :text="t('save')" @click="save" :loading="operateLoading"></u-button>
                    </view>
                </u-form>
            </view>
        </scroll-view>
    </view>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import { redirect } from '@/utils/common'
    import { t } from '@/locale'
    import { addAddress, editAddress, getAddressInfo } from '@/app/api/member'
    
    const type = ref('')
    const formData = ref({
        id: 0,
        name: '',
        mobile: '',
        lat: '',
        lng: '',
        address: '',
        address_name: '',
        full_address: '',
        is_default: 0,
        area: '',
        type: 'location_address'
    })
    
    onLoad((data) => {
        if (data.id) {
            getAddressInfo(data.id).then(({ data }) => {
                if (data) {
                    Object.assign(formData.value, data)
                     formData.value.area = formData.value.full_address.replace(formData.value.address, '').replace(formData.value.address_name, '')
                }
            }).catch()
        }
    })
    
    const formRef = ref(null)
    
    const rules = computed(() => {
        return {
            'address': {
                type: 'string',
                required: true,
                message: '请填写门牌号',
                trigger: ['blur', 'change'],
            },
            'name': {
                type: 'string',
                required: true,
                message: '请输入联系人姓名',
                trigger: ['blur', 'change'],
            },
            'mobile': [
                {
                    type: 'string',
                    required: true,
                    message: '请输入手机号码',
                    trigger: ['blur', 'change'],
                },
                {
                    validator() {
                        return uni.$u.test.mobile(formData.value.mobile)
                    },
                    message: '请输入正确的手机号'
                }
            ]
        }
    })
    
    const operateLoading = ref(false)
    const save = ()=> {
        if (uni.$u.test.isEmpty(formData.value.area)) {
            uni.showToast({ title: '请选择地址', icon: 'none' })
            return 
        }
        
        const save = formData.value.id ? editAddress : addAddress
        
        formRef.value.validate().then(() => {
            if (operateLoading.value) return
            operateLoading.value = true
            
            formData.value.full_address = `${formData.value.area}${formData.value.address_name}${formData.value.address}`
        
            save(formData.value).then((res) => {
                operateLoading.value = false
                setTimeout(()=> {
                    redirect({ url: '/addon/o2o/pages/address/index' })
                }, 1000)
            }).catch(() => {
                operateLoading.value = false
            })
        })
    }
    
    const chooseLocation = ()=> {
        uni.chooseLocation({
        	success: (res) => {
                res.latitude && (formData.value.lat = res.latitude)
                res.longitude && (formData.value.lng = res.longitude)
                res.address && (formData.value.area = res.address)
                res.name && (formData.value.address_name = res.name)
        	}
        });
    }
</script>