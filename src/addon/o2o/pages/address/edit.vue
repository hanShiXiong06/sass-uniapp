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
                            <u-switch v-model="formData.is_default" size="20" :activeValue="1" :inactiveValue="0" activeColor="var(--primary-color)"/>
                        </u-form-item>
                    </view>
                    <view class="mt-[40rpx]">
                        <u-button class="text-[var-(--primary-color)]" type="primary" shape="circle" :text="t('save')" @click="save" :disabled="btnDisabled" :loading="operateLoading"></u-button>
                    </view>
                </u-form>
            </view>
        </scroll-view>

        <!-- #ifdef MP-WEIXIN -->
        <!-- 小程序隐私协议 -->
        <wx-privacy-popup ref="wxPrivacyPopupRef"></wx-privacy-popup>
        <!-- #endif -->
    </view>
</template>

<script setup lang="ts">
    import { ref, computed,nextTick } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import { redirect } from '@/utils/common'
    import { t } from '@/locale'
    import { addAddress, editAddress, getAddressInfo } from '@/app/api/member'
    import manifestJson from '@/manifest.json'
    import { getAddressByLatlng } from '@/app/api/system'
    
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
    const btnDisabled = ref(false)

    const wxPrivacyPopupRef:any = ref(null)
    
    onLoad((data) => {
        if (data.id) {
            getAddressInfo(data.id).then(({ data }) => {
                if (data) {
                    Object.assign(formData.value, data)
                     formData.value.area = formData.value.full_address.replace(formData.value.address, '').replace(formData.value.address_name, '')
                }
            }).catch()
        }else if (option.name) {
            if (uni.getStorageSync('addressInfo')) {
                Object.assign(formData.value, uni.getStorageSync('addressInfo'))
            }
            formData.value.address = option.name;
            getAddress(option.latng);
            var tempArr = getQueryVariable('latng').split(',');
            formData.value.lat = tempArr[0];
            formData.value.lng = tempArr[1];
        }
        // #ifdef MP
        nextTick(()=>{
            if(wxPrivacyPopupRef.value) wxPrivacyPopupRef.value.proactive();
        })
        // #endif
    })
    
    const formRef: any = ref(null)
    
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
    const getQueryVariable = (variable:any)=> {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return false;
    }

    //获取详细地址
    const getAddress = (latlng:any)=> {
        getAddressByLatlng({latlng}).then((res: any) => {
            if (res.data && res.data.length) {
                formData.value.full_address = '';
                formData.value.full_address += res.data.province != undefined ? res.data.province : '';
                formData.value.full_address += res.data.city != undefined ? '' + res.data.city : '';
                formData.value.full_address += res.data.district != undefined ? '' + res.data.district : '';

                formData.value.address_name = formData.value.full_address.replace(/-/g,'');
                formData.value.area = res.data.full_address;

                formData.value.province_id = res.data.province_id != undefined ? res.data.province_id : 0;
                formData.value.city_id = res.data.city_id != undefined ? res.data.city_id : 0;
                formData.value.district_id = res.data.district_id != undefined ? res.data.district_id : 0;

            } else {
                uni.showToast({title: res.msg, icon: 'none'})
            }
        })

    }
    
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

            btnDisabled.value = true
            
            formData.value.full_address = `${formData.value.area}${formData.value.address_name}${formData.value.address}`
        
            save(formData.value).then((res) => {
                operateLoading.value = false
                uni.removeStorageSync('addressInfo');
                setTimeout(()=> {
                    btnDisabled.value = false
                    redirect({ url: '/addon/o2o/pages/address/index' })
                }, 1000)
            }).catch(() => {
                operateLoading.value = false
                btnDisabled.value = false
            })
        })
    }
    
    const chooseLocation = ()=> {
        // #ifdef MP
        uni.chooseLocation({
            success: (res) => {
                res.latitude && (formData.value.lat = res.latitude)
                res.longitude && (formData.value.lng = res.longitude)
                res.address && (formData.value.area = res.address)
                res.name && (formData.value.address_name = res.name)
            },
            fail: (res)=>{
                // 在隐私协议中没有声明chooseLocation:fail api作用域
                if(res.errMsg && res.errno) {
                    if(res.errno == 104){
                        let msg = '用户未授权隐私权限，选择位置失败';
                        uni.showToast({title: msg, icon: 'none'})
                    }else if(res.errno == 112){
                        let msg = '隐私协议中未声明，打开地图选择位置失败';
                        uni.showToast({title: msg, icon: 'none'})
                    }else {
                        uni.showToast({title: res.errMsg, icon: 'none'})
                    }
                }
            }
        });
        // #endif

        // #ifdef H5
        var urlencode = formData.value;
        uni.setStorageSync('addressInfo', urlencode);
        let backurl = location.href;
        window.location.href = 'https://apis.map.qq.com/tools/locpicker?search=1&type=0&backurl=' + encodeURIComponent(backurl) + '&key=' + manifestJson.h5.sdkConfigs.maps.qqmap.key + '&referer=myapp';
        // #endif
    }
</script>