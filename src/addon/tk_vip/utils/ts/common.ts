import { img } from '@/utils/common'
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
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
export function getLocation() {
	uni.getLocation({
		type: 'wgs84',
		success: function (res) {
			return res;
		}
	});
}
export function telPhone(phone) {
	uni.makePhoneCall({
		phoneNumber: phone
	})
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