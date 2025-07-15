<script lang="ts">
    import { goto } from '$app/navigation';
    import { username, token } from '$lib/stores/user';

    export let data: { rooms: string[] }

    const URL = import.meta.env.VITE_API_BASE_URL;

    let rooms: string[] = data.rooms
    let showCreate = false;

    // 방 만들기 관련
    let newRoomName = '';

    function enterRoom(roomName: string) {
        goto('/room/' + roomName);
    }

    async function createRoom() {
        if (!$username){
            alert("로그인 해주세요");
            return;
        }

        if (!newRoomName) {
            alert("방 이름을 입력해주세요");
            return;
        }

        const res = await fetch(`${URL}/room`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${$token}`
            },
            body: JSON.stringify({ room_name: newRoomName }),
        });

        if (res.ok) {
            goto('/room/' + newRoomName);
        } else {
            let message = "방 생성에 실패했습니다.";
            try {
                const data = await res.json();
                message = data.detail?.message || data.detail || message;
            } catch (e) {
                // JSON 파싱 에러 무시하고 기본 메시지 사용
            }
            alert(message);            
        }
    }
</script>


<div class="room_list">
    {#each rooms as room}
        <button type="button" class="room_card" on:click={() => enterRoom(room)}>
            <div class="thumbnail"></div>
            <div class="title">{room}</div>
        </button>
    {/each}
</div>

<!-- 플로팅 방 만들기 버튼 -->
<button class="create_button" on:click={() => (showCreate = true)}>+</button>

<!-- 방 만들기 버블 -->
{#if showCreate}
    <div class="create_bubble">
        <h3>방 만들기</h3>
        <input
            placeholder="방 이름"
            bind:value={newRoomName}
            class="create_bubble_input"
        />
        <div class="create_bubble_buttons">
            <button on:click={createRoom}>만들기</button>
            <button on:click={() => (showCreate = false)}>취소</button>
        </div>
    </div>
{/if}

<style lang="scss">
    .room_list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 24px;
        padding: 32px;
        max-width: 1000px;
        margin: 0 auto;
    }

    .room_card {
        all: unset;
        display: block;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
            transform: translateY(-6px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .thumbnail {
            width: 100%;
            height: 120px;
            background-color: #ccc;
            background-image: url('https://placehold.co/320x180?text=Live');
            background-size: cover;
            background-position: center;
        }

        .title {
            padding: 12px;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
        }
    }

    .create_button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #007bff;
        color: white;
        font-size: 40px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: #0056b3;
        }
    }

    .create_bubble {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 300px;
        padding: 20px 24px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        gap: 14px;
        z-index: 1000;
        animation: fadeSlideUp 0.3s ease;

        h3 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 4px;
            color: #212529;
            text-align: center;
        }


        button {
            flex: 1;
            padding: 10px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:first-child {
                margin-right: 8px;
                background-color: #007bff;
                color: white;

                &:hover {
                    background-color: #0056b3;
                }
            }

            &:last-child {
                background-color: #f1f3f5;
                color: #212529;

                &:hover {
                    background-color: #e2e6ea;
                }
            }
        }
    }

    .create_bubble_input {
        width: 100%;
        height: 44px;
        padding: 10px 14px;
        border: 2px solid #dee2e6;
        border-radius: 10px;
        background-color: #fff;
        box-sizing: border-box;
        font-size: 15px;
        color: #212529;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &::placeholder {
            color: #adb5bd;
            font-weight: 400;
        }

        &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
            outline: none;
        }
    }
</style>
