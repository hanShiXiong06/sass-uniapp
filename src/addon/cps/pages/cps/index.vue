<template>
	<view class="bg-white"> 
		<u-loading-page bg-color="rgb(248,248,248)" :loading="loading" fontSize="16" color="#333"
			loadingText="加载中"></u-loading-page>
		<web-view v-if="webview" :src="webview"></web-view> 
	</view>
</template>

<script setup lang="ts">
	import { reactive, ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { t } from '@/locale'
	import { getCpsLink } from '@/addon/cps/api/cps';
	import { useShare } from '@/hooks/useShare'

	const { setShare, onShareAppMessage, onShareTimeline } = useShare()
	onShareAppMessage()
	onShareTimeline()

	let articleDetail = ref<Array<any>>([]);
	let loading = ref<boolean>(true);
	let style = {
		h2: 'margin-bottom: 15px;',
		p: 'margin-bottom: 10px;line-height: 1.5;',
		img: 'margin: 10px 0;',
	};
	let webview = '';
	onLoad((option) => {
		loading.value = true;
		let channel = '';
		// #ifdef H5
		    channel = 'h5';
		// #endif
		// #ifdef MP-WEIXIN
		    channel = 'mp-weixin';
		// #endif
		    getCpsLink({
				type: option.type,
				channel: channel
			}).then((res) => {
 		    	loading.value = false;
 		    	// #ifdef H5 
 			    if(res.data.title){
 			        uni.setNavigationBarTitle({
    				    title: res.data.title
    				})
 			    }
			    if (res.data.web_url) {
					webview = res.data.web_url
			    }
    			// #endif 
    		    // #ifdef MP-WEIXIN
		    	if (res.data.we_app_info) { 
						uni.navigateToMiniProgram({
							appId: res.data.we_app_info.app_id,
							path: res.data.we_app_info.page_path,
							success(item) {
								// 打开成功
							}
						})
				} else if (res.data.url) {
				 	uni.redirectTo({
    					url:res.data.url
    				});
				}else if (res.data.web_url) {
					webview = res.data.web_url
				}else if(res.data.path_url){
				    uni.openEmbeddedMiniProgram({
                    	appId: res.data.appId,
                    	path:  res.data.path_url, 
                    	success(res) {
                        // 打开成功
                    	}
                    })
				}
		  	// #endif
// 			if(res.data.type=='h5'){
//     				uni.setNavigationBarTitle({
//     				    title: res.data.url.act_name
//     				})
// 				// #ifdef H5
// 					if (res.data.url.h5) {
// 						webview = res.data.url.h5
// 					}
// 				// #endif 
				
// 				// #ifdef MP-WEIXIN
// 					if (res.data.url.we_app_info) { 
// 						uni.navigateToMiniProgram({
// 							appId: res.data.url.we_app_info.app_id,
// 							path: res.data.url.we_app_info.page_path,
// 							success(item) {
// 								// 打开成功
// 							}
// 						})
// 					} else if (res.data.url.h5) {
// 						webview = res.data.url.h5
// 					}
// 				// #endif
				
// 			}else{
// 				uni.redirectTo({
// 					url:res.data.url
// 				});
// 			} 
		});
	})
</script>
<style lang="scss" scoped></style>