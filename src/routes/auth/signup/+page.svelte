<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { goto } from "$app/navigation";

    const URL = import.meta.env.VITE_API_BASE_URL;

    let username = "";
    let password = "";
    let confirmPassword = "";
    let error = "";

    async function signup() {
        error = "";

        if (password !== confirmPassword) {
            error = "비밀번호가 일치하지 않습니다";
            return;
        }

        const body = {
            user_name: username,
            password: password
        };

        const res = await fetch(`${URL}/user/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            const data = await res.json();
            document.cookie = `token=${data.access_token}; path=/`;
            window.location.href = '/'
        } else {
            const err = await res.json();
            error = err.detail?.message || "회원가입 실패";
        }
    }
</script>

<style lang="scss">
    .form-container {
        max-width: 400px;
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

<div class="form-container">
    <h2>회원가입</h2>
    {#if error}<div class="error">{error}</div>{/if}
    <input class="create_bubble_input" type="text" placeholder="아이디" bind:value={username}>
    <input class="create_bubble_input" type="password" placeholder="비밀번호" bind:value={password}>
    <input class="create_bubble_input" type="password" placeholder="비밀번호 확인" bind:value={confirmPassword}>
    <button on:click={signup}>회원가입</button>
</div>