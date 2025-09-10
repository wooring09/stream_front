<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { username, token as tokenStore } from '$lib/stores/user';
    export let data;

    const user = data.user;
    const token = data.token

    onMount(() => {
        username.set(user?.user_name);
        tokenStore.set(token ?? null);
    });

    async function signout(){
        username.set(null);
        document.cookie = "token=;";
        invalidate('auth:session');
    }

</script>

<style lang="scss">
    :global(body){
        margin: 0;
        padding: 0;
    }

    :global(*) {
        box-sizing: border-box;
    }

    header {
        width: 100%;
        background-color: white;
        padding: 10px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .logo{
        display: flex;
        justify-content: center;
        align-items: center;

        p {
            font-size: 1.5rem;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 0;
            margin-left: -5px;
        }

        img{
            width: 35px;
            height: 35px;
        }
    }

    nav {
        display: flex;
        gap: 16px;
    }

    nav a, div{
        color: black;
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s ease;
    }

    nav a:hover, div:hover {
        opacity: 0.75;
    }

    main {
        padding: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

<header>
    <div class="logo" onclick={()=>goto("/")}>
        <img src="/stream_icon.png" alt="icon">
        <p>TREAM</p>
    </div>

    <nav>
        <a href="/">홈</a>
        <a href="/room">방 목록</a>
        {#if $username}
            <a href="/user/{$username}">{$username}</a>
            <div onclick={()=>signout()}>로그아웃</div>
        {:else}
            <a href="/auth/signin">로그인</a>
            <a href="/auth/signup">회원가입</a>
        {/if}
    </nav>
</header>

<main>
    <slot />
</main>