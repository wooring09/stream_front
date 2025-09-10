import type { PageServerLoad } from './$types';
const URL = import.meta.env.VITE_API_BASE_URL;


export const load: PageServerLoad = async ({ params, fetch }) => {
    const roomname = params.roomname;
    const res = await fetch(`${URL}/room/${roomname}`);

    if (!res.ok){
        return {
            roomname: roomname,
            roomData: null
        }
    }

    const roomData = await res.json()
    
    return {
        roomname: roomname,
        roomData: roomData
    };
};