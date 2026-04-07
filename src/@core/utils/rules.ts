const required = { required: true, message: "Thông tin không được để trống" };
const email = { type: "email" as const, message: "Email không hợp lệ" };
const password = { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" };

export const rules = {
    required,
    email,
    password,
};