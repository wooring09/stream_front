<script>
    import { goto } from '$app/navigation';

    function goHome() {
        goto('/');
    }
</script>

<style lang="scss">
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        background-color: #f8f9fa;
        padding: 32px;
    }

    h1 {
        font-size: 96px;
        font-weight: 700;
        color: #343a40;
        margin: 0;
    }

    p {
        font-size: 20px;
        color: #6c757d;
        margin: 8px 0 24px;
    }

    button {
        padding: 12px 20px;
        font-size: 16px;
        font-weight: 500;
        color: white;
        background-color: #007bff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: #0056b3;
        }
    }
</style>

<div class="error-container">
    <h1>404</h1>
    <p>페이지를 찾을 수 없습니다.</p>
    <button on:click={goHome}>홈으로 가기</button>
</div>