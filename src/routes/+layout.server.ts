import type { LayoutServerLoad } from './$types';

const URL = import.meta.env.VITE_API_BASE_URL;

export const load: LayoutServerLoad = async ({ depends, cookies, fetch }) => {
    depends('auth:session');

    const token = cookies.get('token');
    // 로그인 상태가 아니면 유저 정보 없음
    if (!token) {
        return { user: null, token: null};
    }

    try {
        const res = await fetch(`${URL}/user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!res.ok) {
            return { user: null, token: token };
        }

        const user = await res.json();
        return { user, token: token };  // username 포함된 객체
    } catch (e) {
        console.error('유저 정보 fetch 실패:', e);
        return { user: null, token: token};
    }
};