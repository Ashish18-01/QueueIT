import { io } from 'socket.io-client';
import { getStoredAuth } from '../services/tokenStorage.js';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket;
export function getSocket(){ if(!socket){ socket = io(SOCKET_URL, { autoConnect:false, transports:['websocket'], auth:()=>({ token:getStoredAuth().accessToken }) }); } return socket; }
export const connectSocket=()=>getSocket().connect();
export const disconnectSocket=()=>socket?.disconnect();
