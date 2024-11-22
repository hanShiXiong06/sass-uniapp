<template>
    <view class="w-screen h-screen flex flex-col" :style="themeColor()">
        <view class="flex-1">
            <!-- #ifdef H5 -->
            <view class="h-[100rpx]"></view>
            <!-- #endif -->
            <view class="px-[60rpx] pt-[100rpx] mb-[100rpx]">
                <view class="font-bold text-lg">绑定微信</view>
            </view>
            <view class="px-[60rpx]">
                <u-form labelPosition="left" :model="formData" errorType='toast' :rules="rules" ref="formRef">
                    <u-form-item labelWidth="100" label="微信号" prop="wx_id" :border-bottom="true" required="true">
                        <u-input v-model="formData.wx_id" border="none" clearable placeholder="请输入微信号" class="!bg-transparent" :disabled="real_name_input"/>
                    </u-form-item>
					<!-- <u-form-item label="" prop="wx_qrcode" :border-bottom="true">
						<u-upload @afterRead="afterRead" :maxCount="1">
							<u-avatar :src="img(formData.wx_qrcode)" size="60" leftIcon="none"></u-avatar>
							<view class="text-primary text-sm mt-[10rpx]">{{ t('updateHeadimg') }}</view>
						</u-upload>
					</u-form-item> -->
					
					<u-form-item
						label="二维码"
						prop="wx_qrcode"
						labelWidth="100"
						required="true"
					>
						<u-upload uploadIcon="photo-fill" accept="image" :fileList="fileList" @afterRead="afterRead" :maxCount="1" @delete="deletePic" :previewFullImage="true">
						</u-upload>
					</u-form-item>
                    
					<u-form-item labelWidth="100" label="是否显示" prop="status" :border-bottom="true">
					    <up-switch :activeValue="1" :inactiveValue="0" v-model="formData.status" @change="statusChange"></up-switch>
					</u-form-item>
					<text class="text-[12px] text-gray-subtitle">开启后，你的下级可以通过以上信息添加您的微信</text>
					
                    
                    <view class="mt-[60rpx]">
                        <u-button type="primary" text="绑定" :loading="loading" loadingText="绑定中" @click="handleBind"></u-button>
                    </view>
                </u-form>
            </view>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <!-- 小程序隐私协议 -->
        <wx-privacy-popup ref="wxPrivacyPopup"></wx-privacy-popup>
        <!-- #endif -->
    </view>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, onMounted } from 'vue'
    import { t } from '@/locale'
    import { redirect, img } from '@/utils/common'
	import { uploadImage } from '@/app/api/system'
	import { getMemberWxInfo, modifyMemberWxInfo } from '@/addon/tt_niucloud/api/member';

    const loading = ref(false)
	const fileList = ref([]);
    // const isAgree = ref(false)

    const formData = ref({
        wx_id: '',
        wx_qrcode: '',
		status: 1,
    })

	let real_name_input = ref(true);
	onMounted(() => {
		// 防止浏览器自动填充
		setTimeout(()=>{
			real_name_input.value = false;
		},800)
		
		getMemberWxInfoFn()
	});
	
    const rules = {
        'wx_id': [
            {
                type: 'string',
                required: true,
                message: '请输入微信号',
                trigger: ['blur', 'change'],
            }
        ],
        'wx_qrcode': {
            type: 'string',
            required: true,
            message: '请上传微信二维码',
            trigger: ['change']
        }
    }
	
	const statusChange = (e) => {
		formData.value.status = e
	}
	
	const deletePic = (event) => {
	  fileList.value.splice(event.index, 1);
	};
	
	const afterRead = async (event) => {
		let lists = [].concat(event.file);
		let fileListLen = fileList.value.length;
		lists.map((item) => {
			fileList.value.push({
			  ...item,
			  status: 'uploading',
			  message: '上传中',
			});
		});
		for (let i = 0; i < lists.length; i++) {
		    const result = await uploadFilePromise(lists[i].url);
			if (result.code == 1) {
				formData.value.wx_qrcode = result.data.url
			}
			
		    let item = fileList.value[fileListLen];
		    fileList.value.splice(fileListLen, 1, {
		      ...item,
		      status: result.code == 1 ? 'success' : 'failed',
		      message: result.code == 1 ? '' : result.msg,
		      url: result.data.url,
		    });
		    fileListLen++;
		}
		
		
		/* fileList.value[] = [];
	    uploadImage({
	        filePath: event.file.url,
	        name: 'file'
	    }).then(res => {
			formData.wx_qrcode = res.data.url
	    }).catch(() => {
	    }) */
	}
	
	const uploadFilePromise = async (url) => {
		let result: Array | boolean = false
		await uploadImage({
			filePath: url,
			name: 'file',
		}).then(res => {
			result = res
		}).catch((res) => {
			result = res
		})
		return result
	};

    const formRef = ref(null)
	const getMemberWxInfoFn = () => {
		getMemberWxInfo().then((res) => {
			if (res.data.id) {
				formData.value = res.data
				fileList.value[0] = {
					url: img(res.data.wx_qrcode)
				};
			}
		})
	}
	
    const handleBind = () => {
        formRef.value.validate().then(() => {
            if (loading.value) return
            loading.value = true
			
			modifyMemberWxInfo(formData.value).then((res) => {
			    loading.value = false
				redirect({ url: '/app/pages/member/index', mode: 'redirectTo' })
			}).catch(() => {
				loading.value = false
			})
        })
    }
</script>

<style lang="scss">
	.u-input{
		background-color: transparent !important;
	}
</style>

