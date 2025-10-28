const { API_BASE_URL, CMS_EMAIL, CMS_PASSWORD } = useRuntimeConfig().public
const form = {
    email: CMS_EMAIL,
    password: CMS_PASSWORD,
};

const loginHandler = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}cms/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            return { error: 'Invalid response from server', raw: text };
        }

        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
};

export default defineEventHandler(async (event) => {
    const login = await loginHandler();
    return { login };
});