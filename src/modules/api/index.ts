import axios from 'axios';

async function postAPI({ url, body, params, headers }: { url: string; body: any; params?: any; headers?: any }) {
    try {
        const response = await axios.post(url, body, { params, headers });
        return response.data;
    } catch (error) {
        console.error(`postAPI`, error);
        return undefined;
    }
}

export { postAPI };
