import type { PageServerLoad } from './$types';
const URL = import.meta.env.VITE_API_BASE_URL;

export const load: PageServerLoad = async ({ fetch }) => {
    const res = await fetch(`${URL}/room`);

    if (!res.ok) {
        throw new Error(`방 정보를 불러올 수 없습니다 (${res.status})`);
    }

    const rooms = await res.json();

    return {
        rooms
    };
};