<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { goto } from "$app/navigation";

    const URL = import.meta.env.VITE_API_BASE_URL;

    let username = "";
    let password = "";
    let error = "";

    async function signin() {
        error = "";

        // OAuth2PasswordRequestForm은 form-urlencoded 형식만 받음
        const params = new URLSearchParams();
        params.append("username", username); // 키 이름은 꼭 "username"이어야 함
        params.append("password", password); // 키 이름은 꼭 "password"이어야 함

        const res = await fetch(`${URL}/user/signin`, {
            method: "POST",
            headers: {
                // 헤더 명시: form-urlencoded 형식
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString() // form 데이터를 문자열로 변환해서 전송
        });

        if (res.ok) {
            const data = await res.json();

            // JWT 토큰을 쿠키로 저장
            document.cookie = `token=${data.access_token}; path=/; SameSite=Lax`;

            // 로그인 성공 시 홈으로 이동
            window.location.href = '/'
        } else {
            const err = await res.json();

            console.log(err)
            // 에러 메시지가 있을 경우 출력, 없으면 기본 메시지
            error = err.detail?.message || "로그인 실패";
        }
    }
</script>

<div class="form-container">
    <h2>로그인</h2>
    {#if error}
        <div class="error">{error}</div>
    {/if}
    <input class="create_bubble_input" type="text" placeholder="아이디" bind:value={username}>
    <input class="create_bubble_input" type="password" placeholder="비밀번호" bind:value={password}>
    <button on:click={signin}>로그인</button>
</div>

<style lang="scss">
    .form-container {
        width: 400px;
        margin: 100px auto;
        padding: 32px 28px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    h2 {
        font-size: 20px;
        font-weight: 700;
        text-align: center;
        margin-bottom: 12px;
        color: #212529;
    }

    input {
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

    button {
        flex: 1;
        padding: 10px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        background-color: #007bff;
        color: white;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: #0056b3;
        }
    }

    .error {
        color: #d9534f;
        background: #f8d7da;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        text-align: center;
    }
</style>