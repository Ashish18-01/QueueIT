export const emailRules={required:'Email is required',pattern:{value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:'Enter a valid email'}};
export const passwordRules={required:'Password is required',minLength:{value:12,message:'Use at least 12 characters'},pattern:{value:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,message:'Use uppercase, lowercase, number, and symbol'}};
