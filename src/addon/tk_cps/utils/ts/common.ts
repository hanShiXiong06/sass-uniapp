import { img, getToken } from '@/utils/common'

import { getAddressByLatlng } from "@/app/api/system";
import useSystemStore from "@/addon/tk_cps/stores/system";
const systemStore = useSystemStore();
import { useLogin } from "@/hooks/useLogin";
/**
 * 获取定位信息
 */
const getLocation = (param : any = {}) => {
	uni.getLocation({
		type: param.type || 'gcj02',
		success: res => {
			const systemStore = useSystemStore()
			systemStore.setAddressInfo(res);
			typeof param.success == 'function' && param.success(res);
		},
		fail: res => {
			typeof param.fail == 'function' && param.fail(res);
		},
		complete: res => {
			typeof param.complete == 'function' && param.complete(res);
		}
	});
}

export function authLogin() {
	if (!getToken()) {
		const login = useLogin();
		// 第三方平台自动登录
		// #ifdef MP
		login.getAuthCode();
		// #endif
		// #ifdef H5
		useLogin().setLoginBack({ url: '/addon/tk_cps/pages/diy' })
		// #endif
	}
	return true //自动进行登录
}
export function dateChange(date) {
	return new Date(date).getTime() // 将日期值转换为时间戳
}
export function timeChange(timestamp) {
	const date = new Date(timestamp * 1000);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return `${hours}:${minutes}`;
}
export function timeChangeDay(timestamp) {
	const date = new Date(timestamp * 1000);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return `${day} ${hours}:${minutes}`;
}

export function getLocationData() {
	const data = uni.getStorageSync('location_address')

	if (data) {
		return data
	}
	else {
		getLocation()
		let e = uni.getStorageSync('location_address')
		let data = {
			latlng: ''
		};
		if (e.latitude && e.longitude) {
			data.latlng = e.latitude + ',' + e.longitude
			getAddressByLatlng(data).then((res : any) => {
				if (res.data && Object.keys(res.data).length) {
					uni.setStorageSync('addressByLatlng', res.data);
					return e
				}
			})

		}
	}
}
export function openMap(lat, lng) {
	uni.openLocation({
		latitude: parseFloat(lat),
		longitude: parseFloat(lng),
		success: function () {
			console.log('success');
		}
	});
}

export function imgListPreview(item, index) {
	if (Array.isArray(item)) {
		// 检查数组是否为空
		if (!item.length) return false;

		// 使用map方法代替forEach，这样可以返回一个新的数组
		const urlList = item.map(img);

		// 使用uni-app的previewImage方法预览图片
		uni.previewImage({
			indicator: "number",
			current: index, // 确保index在item数组的范围内
			loop: true,
			urls: urlList
		});
	} else {
		// 检查item是否为空字符串
		if (item === '') return false;

		// 创建包含单个图片URL的数组
		const urlList = [img(item)];

		// 使用uni-app的previewImage方法预览单个图片
		uni.previewImage({
			indicator: "number",
			loop: true,
			urls: urlList
		});
	}
}