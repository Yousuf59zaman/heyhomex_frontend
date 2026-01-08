export default defineNuxtPlugin(() => {
    return {
        provide: {
            optionsList: () => {
                const list = [
                    { name: 'All', value: '', key: '' },
                    { name: 'Active', value: '1', key: 'status' },
                    { name: 'Inactive', value: '0', key: 'status' },
                    { name: 'Trashed', value: 'only', key: 'trashed' },
                ]
                return list
            },
            optionsAcTr: () => {
                const list = [
                    { name: 'Active', value: '', key: '' },
                    { name: 'Trashed', value: 'only', key: 'trashed' },
                ]
                return list
            },
            optionsListAcIn: () => {
                const list = [
                    { name: 'Active', value: '', key: '' },
                    { name: 'Inactive', value: '0', key: 'status' },
                ]
                return list
            },
            typetList: () => {
                const list = [
                    { id: null, name: 'Select Type' },
                    { id: '1',name: 'Content' },
                    { id: '2',name: 'Image' },
                    { id: '3',name: 'PDF' },
                    { id: '4',name: 'Video' },
                ]
                return list
            },
            typetIconList: () => {
                const list = [
                    { id: null, name: 'Select Type' },
                    { id: 1 ,name: 'Icon' },
                    { id: 2 ,name: 'Text' },
                    { id: 3 ,name: 'Icon & Text' },
                ]
                return list
            },
            typePackageList: () => {
                const list = [
                    { key: 'yearly', name: 'Yearly' },
                    { key: 'monthly', name: 'Monthly' },
                ]
                return list
            },
            truncateText: (text: string, length: number) => {
                if (text.length > length) {
                    return text.substring(0, length) + '...';
                } else {
                    return text;
                }
            },
            viewFormatDate: (dateString: string) => {
                const options = { day: "2-digit", month: "long", year: "numeric" } as const;
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', options);
            },
            viewFormatDateTime: (dateString: string) => {
                const options = { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" } as const;
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', options);
            },
            submitDateTimeFormat: (isoString: string) => {
                const date = new Date(isoString)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const minutes = String(date.getMinutes()).padStart(2, '0')
                const seconds = String(date.getSeconds()).padStart(2, '0')
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            },
            submitDateTimeAmPmFormat: (isoString: string) => {
                const date = new Date(isoString)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = date.getHours()
                const minutes = String(date.getMinutes()).padStart(2, '0')
                const ampm = hours >= 12 ? 'PM' : 'AM'
                const hours12 = hours % 12 || 12
                return `${year}-${month}-${day} ${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`
            },
            minutesToMilliseconds: (minutes: any) => {
                return minutes * 60 * 1000
            },
            getBaseUrl: (): string => {
                if (typeof window !== 'undefined') {
                    return window.location.origin;
                }
                return '';
            },
            formatBudgetRange: (leadInfo: any) => {
                const min = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(leadInfo.budget_min)
                const max = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(leadInfo.budget_max)
                return `${min} - ${max}`
            },
            formatRelativeTime : (isoDate: any) => {
                const date = new Date(isoDate).getTime()
                const now = new Date().getTime()
                const diffMs = now - date
                const diffMins = Math.floor(diffMs / 60000)
                const diffHours = Math.floor(diffMs / 3600000)
                const diffDays = Math.floor(diffMs / 86400000)

                if (diffMins < 60) return `${diffMins} minutes ago`
                if (diffHours < 24) return `${diffHours} hours ago`
                if (diffDays === 1) return `${diffDays} day ago`
                if (diffDays < 7) return `${diffDays} days ago`

                return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
            },
            formatDate: (isoDate: any) => {
                const date = new Date(isoDate)
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            },
           
        }
    };
});