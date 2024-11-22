<template>
	<view class="bg-[#f8f8f8] min-h-screen overflow-hidden">

		<view class="tk-card fl items-center">
			<u-input clearable v-model="act_name" placeholder="如美团|饿了么|点餐|滴滴等" @change="reload()"></u-input>
		</view>
		<mescroll-body ref="mescrollRef" top="0" @init="mescrollInit" @down="downCallback" @up="getActListFn">
			<view class="tk-card" v-for="(item,index) in list" @click="tolink(item)">

				<image style="width: 100%; height: 120px; background-color: #eeeeee;border-radius: 8px;"
					:mode="item.mode" :src="item.img" mode="aspectFill" @error="imageError"></image>
				<view class="font-bold">{{item.act_name}}</view>

			</view>

			<mescroll-empty :option="{'icon': img('static/resource/images/empty.png')}"
				v-if="!list.length && loading"></mescroll-empty>
		</mescroll-body>
	</view>
	<tabbar addon="tk_cps" />
	<pay ref="payRef" @close="payLoading = false"></pay>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { img, redirect } from '@/utils/common';
	import { getActList, getCpsInfo } from '@/addon/tk_cps/api/cps';
	import MescrollBody from '@/components/mescroll/mescroll-body/mescroll-body.vue';
	import MescrollEmpty from '@/components/mescroll/mescroll-empty/mescroll-empty.vue';
	import useMescroll from '@/components/mescroll/hooks/useMescroll.js';
	import { onLoad, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
	import useDiyStore from '@/app/stores/diy'
	const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom);
	import { useShare } from '@/hooks/useShare'
	const { setShare, onShareAppMessage, onShareTimeline } = useShare()
	let list = ref<Array<Object>>([]);
	let loading = ref<boolean>(false);
	setShare();
	onShareAppMessage()
	onShareTimeline()
	import { timeChange, authLogin, getLocationData } from "@/addon/tk_cps/utils/ts/common";
	authLogin()
	const listData = ref([])
	const act_name = ref('')
	const tolink = (e) => {
		const url = '/addon/tk_cps/pages/index?type=' + e.type + '&act_id=' + e.act_id + '&style=embedded';
		todiyRedirect({ url: url });

	}
	const todiyRedirect = (link : any) => {
		//适配半屏小程序
		if (link.url.indexOf('style=embedded') !== -1) {

			function parseQueryString(queryString) {
				const params = {};
				const keyValuePairs = queryString.split('&');
				for (const pair of keyValuePairs) {
					const [key, value] = pair.split('=');
					params[key] = decodeURIComponent(value);
				}
				return params;
			}
			const queryString = link.url.split('?')[1];
			if (queryString) {
				const queryParams = parseQueryString(queryString);
				const type = queryParams['type'];
				const act_id = queryParams['act_id'];
				getCpsInfo({
					type: type,
					act_id: act_id
				}).then((res) => {
					// #ifdef H5
					if (res.data.h5 != '') {
						window.location.href = res.data.h5;
					}
					if (res.data.wap_url != '') {
						window.location.href = res.data.wap_url;
					}

					// #endif
					// #ifdef MP-WEIXIN
					if (res.data.weapp.appid == '') {
						uni.redirectTo({
							url: link.url
						})
					} else {
						uni.openEmbeddedMiniProgram({
							appId: res.data.weapp.appid,
							path: res.data.weapp.pagepath,
							extraData: {},
							success(res) {
								console.log('半屏小程序打开');
							},
							fail(err) {
								console.error('打开半屏小程序失败', err);
							}
						});
					}

					// #endif
				}).catch((error) => {
					console.error('获取CPS信息失败', error);
				});
			} else {
				console.error('链接中没有查询参数');
			}
			return
		}
		// 外部链接
		if (link.url.indexOf('http') != -1 || link.url.indexOf('http') != -1) {

			// #ifdef H5
			window.location.href = link.url;
			// #endif

			// #ifdef MP
			redirect({
				url: '/app/pages/webview/index',
				param: { src: encodeURIComponent(link.url) }
			});
			// #endif
		} else {
			redirect({ url: link.url });
		}
	}
	const reload = () => {
		getMescroll().resetUpScroll();
	}
	const getActListFn = (mescroll) => {
		loading.value = false;
		let data : object = {
			page: mescroll.num,
			limit: mescroll.size,
			act_name: act_name.value
		};
		getActList(data).then((res) => {
			let newArr = (res.data.data as Array<Object>);
			//设置列表数据
			if (mescroll.num == 1) {
				list.value = []; //如果是第一页需手动制空列表
			}
			list.value = list.value.concat(newArr);
			mescroll.endSuccess(newArr.length);
			loading.value = true;
		}).catch(() => {
			loading.value = true;
			mescroll.endErr(); // 请求失败, 结束加载
		})
	}
</script>
<style lang="scss" scoped>
	@import '@/addon/tk_cps/utils/styles/common.scss';
</style>