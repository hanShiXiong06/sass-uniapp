import {defineStore} from 'pinia'
import {getSiteInfo, getMap} from '@/app/api/system'
import {redirect} from '@/utils/common'

interface System {
    site: AnyObject | null,
    siteApps: string[],
    siteAddons: string[],
    currRoute: string,
    location: Object | null, // 定位信息
    mapConfig: Object,
    installAddonList: string[]
}

const useSystemStore = defineStore('system', {
    state: (): System => {
        return {
            site: null,
            siteApps: [],
            siteAddons: [],
            currRoute: '',
            location: null,
            mapConfig: {
                is_open: 1,
                valid_time: 0
            },
            installAddonList: []
        }
    },
    actions: {
        async getSiteInfoFn() {
            await getSiteInfo().then((res: any) => {
                this.site = res.data
                this.siteApps = res.data.app
                this.siteAddons = res.data.site_addons.map((item: AnyObject) => {
                    return item.key
                })
                if (!this.site || this.site.status == 3) redirect({url: '/app/pages/index/close', mode: 'reLaunch'})
            }).catch((err) => {
                redirect({url: '/app/pages/index/nosite', mode: 'reLaunch'})
            })
        },
        async getMapFn() {
            // 获取地图配置
            await getMap().then((res: any) => {
                this.mapConfig.is_open = res.data.is_open;
                this.mapConfig.valid_time = res.data.valid_time;
                uni.setStorageSync('mapConfig', this.mapConfig);
            })
        },
        setLocation(value: Object) {
            var date = new Date();
            date.setSeconds(60 * this.mapConfig.valid_time);
            value.valid_time = date.getTime() / 1000; // 定位信息 5分钟内有效，过期后将重新获取定位信息
            this.location = value;
            uni.setStorageSync('location', value); // 初始化数据调用
        }
    }
})

export default useSystemStore
