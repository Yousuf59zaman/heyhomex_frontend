const useAppKey = () => {
    const getAppKey = useCookie('app_key')
    const setAppKey = (payload: any) => {
        getAppKey.value = payload
    }
    return {
        getAppKey, setAppKey
    }
}

export default useAppKey