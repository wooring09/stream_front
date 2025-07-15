<script lang="ts">
    export let data: { roomName: string }
    let roomName = data.roomName
    
    const wsURL = import.meta.env.VITE_API_WS_URL;

    let ws: WebSocket | null = null;
    let videoRef: HTMLImageElement;

    // 연결 종료 및 정리 함수
    function cleanup() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
        ws = null;
    }

    async function startStream(): Promise<void> {
        cleanup(); // 기존 연결 제거
        ws = new WebSocket(`${wsURL}/room/${roomName}`);
        ws.binaryType = "arraybuffer";

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
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

                // 1. WebSocket으로 전송
                if (ws?.readyState === WebSocket.OPEN) {
                    blob.arrayBuffer().then((buffer) => {
                        ws?.send(buffer);
                    });
                }

                // 2. 본인 화면 표시
                const url = URL.createObjectURL(blob);
                if (previousUrl) URL.revokeObjectURL(previousUrl);
                previousUrl = url;
                videoRef.src = url;
            }, 'image/jpeg');
        }, 100);

        window.addEventListener("beforeunload", () => {
            cleanup();
            clearInterval(interval);
            if (previousUrl) URL.revokeObjectURL(previousUrl);
        });
    }


    function receiveStream(): void {
        cleanup(); // 기존 연결 제거
        ws = new WebSocket(`${wsURL}/room/${roomName}`);
        ws.binaryType = "arraybuffer";

        let previousUrl: string | null = null;

        ws.onmessage = (event: MessageEvent<ArrayBuffer>) => {
            const blob = new Blob([event.data], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            previousUrl = url;
            videoRef.src = url;
        };

        window.addEventListener("beforeunload", () => {
            cleanup();
            if (previousUrl) URL.revokeObjectURL(previousUrl);
        });
    }
    
</script>

<div class="stream_wrapper">
    <div class="stream_wrapper_button_group">
        <button on:click={startStream}>📤 카메라 스트리밍 시작</button>
        <button on:click={receiveStream}>📥 수신 스트리밍 시작</button>
    </div>

    <img bind:this={videoRef} class="stream_wrapper_video_feed" alt="Streaming" />
</div>

<style lang="scss">
    .stream_wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 32px;

        background-color: #f8f9fa;
        border-radius: 12px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        max-width: 1250px;
        margin: 40px auto;
    }

    .stream_wrapper_button_group {
        display: flex;
        gap: 12px;

        button {
            padding: 10px 16px;
            font-size: 16px;
            font-weight: 500;
            color: #fff;
            background-color: #007bff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
                background-color: #0056b3;
            }

            &:active {
                transform: scale(0.98);
            }
        }
    }

    .stream_wrapper_video_feed {
        width: 1024px;
        height: 512px;
        border-radius: 12px;
        border: 3px solid #dee2e6;
        background-color: #000;
        object-fit: cover;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
</style>
