import { describe, expect, it } from 'vitest';import reducer, { signedOut } from './authSlice.js';
describe('auth reducer',()=>{it('clears user on sign out',()=>{const state=reducer({user:{email:'a@b.com'},accessToken:'a',refreshToken:'r',status:'authenticated'},signedOut());expect(state.user).toBeNull();expect(state.accessToken).toBeNull();});});
