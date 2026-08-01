const KEY='queueit-auth';
export const getStoredAuth=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}};
export const setStoredAuth=(data)=>localStorage.setItem(KEY,JSON.stringify(data||{}));
export const clearStoredAuth=()=>localStorage.removeItem(KEY);
