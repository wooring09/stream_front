import { writable } from 'svelte/store';

export const username = writable<string | null>(null);
export const token = writable<string | null>(null);
