<script lang="ts">
    import { token, username } from '$lib/stores/user.js';
    import { onMount, onDestroy } from 'svelte';
    import Error404 from '$lib/components/error404.svelte';
    import { browser } from '$app/environment';

    let initialized = false;

    export let data
    const roomname = data.roomname
    const roomData = data.roomData

    const hostUsername = roomData?.host_user_name
    const activated = roomData?.activated

    let connectedUsers: string[] = [];
    let isConnected = false;

    const wsURL = import.meta.env.VITE_API_WS_URL;

    let ws: WebSocket | null = null;
    let videoRef: HTMLImageElement;

    let localStream: MediaStream | null = null;

    $: if (browser && !isConnected && videoRef){
        videoRef.src = "/disconnected.png"
    }


    function cleanup() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
        ws = null;
    }

    async function startStream(): Promise<void> {
        cleanup();
        ws = new WebSocket(`${wsURL}/room/${roomname}?user_name=${$username}`);
        ws.binaryType = "arraybuffer";

        ws.onmessage = handleWebSocketMessage;
        
        ws.onopen = () => {
            console.log("WebSocket 연결 성공");
        };

        ws.onerror = (err) => {
            console.error("WebSocket 에러:", err);
        };

        ws.onclose = (event) => {
            console.warn("WebSocket 연결 종료:", event.reason || event.code);
        };

        localStream = await navigator.mediaDevices.getUserMedia({ video: true });

        const video = document.createElement('video');
        video.srcObject = localStream;
        await video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error("Canvas context 생성 실패");
            return;
        }

        let previousUrl: string | null = null;

        const interval = setInterval(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) return;

                if (ws?.readyState === WebSocket.OPEN) {
                    blob.arrayBuffer().then((buffer) => {
                        ws?.send(buffer);
                    });
                }

                const url = URL.createObjectURL(blob);
                if (previousUrl) URL.revokeObjectURL(previousUrl);
                previousUrl = url;
                if (videoRef) {
                    videoRef.src = url;
                }
            }, 'image/jpeg');
        }, 100); 

        window.addEventListener("beforeunload", () => {
            cleanup();
            clearInterval(interval);
            if (previousUrl) URL.revokeObjectURL(previousUrl);
        });
    }

    function receiveStream(): void {
        cleanup();
        if ($username) {
            ws = new WebSocket(`${wsURL}/room/${roomname}?user_name=${$username}`);
        } else {
            ws = new WebSocket(`${wsURL}/room/${roomname}`);
        }
        ws.binaryType = "arraybuffer";

        ws.onmessage = handleWebSocketMessage;

        let previousUrl: string | null = null;

        window.addEventListener("beforeunload", () => {
            cleanup();
            if (previousUrl) URL.revokeObjectURL(previousUrl);
        });
    }

    function handleWebSocketMessage(event: MessageEvent) {
        if (event.data instanceof ArrayBuffer) {
            const blob = new Blob([event.data], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            if (videoRef) videoRef.src = url;
            return;
        }

        try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'stream_status') {
                isConnected = msg.is_streaming;
                console.log(isConnected)
            }            
            if (msg.type === 'user_list') {
                connectedUsers = msg.users;
            }

        } catch (e) {
            console.warn("Invalid WebSocket message:", event.data);
        }
    }

    onMount(() => {
        const interval = setInterval(() => {
            if (!initialized && browser && hostUsername && $username !== null) {
                if (hostUsername === $username) {
                    startStream();
                } else {
                    receiveStream();
                }
                initialized = true;
                clearInterval(interval);
            }
        }, 100);
    });

    onDestroy(() => {
        cleanup();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
    });
</script>

{#if !roomData}
    <Error404/>
{:else}
    <div class="stream_wrapper">
        <div class="stream_header">
            <div class="stream_header_info">
                <div class="room_title">{roomname}</div>
                <div class="host_name">호스트: {hostUsername}</div>
            </div>
            <div>
                {#if isConnected}
                    🟢
                {:else}
                    ⚫
                {/if}
            </div>

        </div>

        <div class="stream_content">
            <div class="stream_wrapper_video_feed">
                <img bind:this={videoRef} src="/disconnected.png" alt="Streaming" />
            </div>
            <aside class="visitor_sidebar">
                <h3>접속 중인 사용자</h3>
                <ul>
                    {#each connectedUsers as connectedUser}
                        {#if connectedUser == null}
                            <li>익명</li>
                        {:else}
                            <li>{connectedUser}</li>
                        {/if}
                    {/each}
                </ul>
            </aside>
        </div>
    </div>
{/if}

<style lang="scss">
    .stream_wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: hsl(210, 17%, 98%);
        border-radius: 12px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        padding: 10px;
    }

    .stream_header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        margin-bottom: 12px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }

    .stream_header_info {
        display: flex;
        flex-direction: column;

        .room_title {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
        }

        .host_name {
            font-size: 14px;
            color: #666;
        }
    }

    .status_indicator {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 1px solid #ccc;
    }

    .status_indicator.active {
        background-color: #28a745;
    }

    .status_indicator.inactive {
        background-color: #adb5bd;
    }

    .stream_content {
        display: flex;
        width: 100%;
        max-width: 1024px;
        gap: 16px;
    }

    .stream_wrapper_video_feed {
        flex: 1;
        border-radius: 12px;
        background-color: #000;
        object-fit: cover;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        aspect-ratio: 16/9;
        width: 900px;

        img {
            width: 100%;
        }
    }

    .visitor_sidebar {
        width: 200px;
        padding: 16px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

        h3 {
            margin-top: 0;
            font-size: 16px;
            margin-bottom: 12px;
        }

        ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
                margin-bottom: 8px;
                font-size: 14px;
                padding-left: 8px;
                position: relative;
            }

            li::before {
                content: "•";
                color: #007bff;
                position: absolute;
                left: 0;
            }
        }
    }
</style>