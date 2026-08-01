import { createSlice } from '@reduxjs/toolkit';
const slice=createSlice({name:'theme',initialState:{mode:'light'},reducers:{toggleTheme:(s)=>{s.mode=s.mode==='dark'?'light':'dark'},hydrateTheme:(s)=>{s.mode=localStorage.getItem('queueit-theme')||'light'}}});
export const { toggleTheme, hydrateTheme }=slice.actions; export default slice.reducer;
