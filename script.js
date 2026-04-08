
const fs = require('fs');
const path = require('path');
const base_dir = 'd:/LTT/ltc/FE/ltt-tlc-web-app/src/app';

function create_dir(p) {
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
    }
}

create_dir(path.join(base_dir, '(customer)', 'login', 'components'));
create_dir(path.join(base_dir, '(customer)', 'register', 'components'));
create_dir(path.join(base_dir, '(customer)', 'reset-password', 'components'));

create_dir(path.join(base_dir, '(administration)', 'login', 'components'));
create_dir(path.join(base_dir, '(administration)', 'register', 'components'));
create_dir(path.join(base_dir, '(administration)', 'reset-password', 'components'));

const signUpPath = path.join(base_dir, '(customer)', 'login', 'components', 'SignUpForm.tsx');
const newSignUpPath = path.join(base_dir, '(customer)', 'register', 'components', 'SignUpForm.tsx');
if (fs.existsSync(signUpPath)) {
    fs.renameSync(signUpPath, newSignUpPath);
}

const auth_page_template = \\
use
client\;
import dynamic from \next/dynamic\;
import { Divider } from \antd\;
import LTTAppLoader from \@/src/@core/component/LTTAppLoader\;

const FormComponent = dynamic(() => import(\./index\), { loading: () => <LTTAppLoader />, ssr: false });

export default function AuthPage() {
    return (
        <div className=\relative
flex
lg:flex-row
w-full
min-h-screen
justify-center
flex-col
sm:p-0
dark:bg-gray-900\>
            <FormComponent />
            <div className=\hidden
lg:flex
w-full
lg:w-1/2
justify-center
items-center
bg-gray-50
dark:bg-gray-800\>
                <div className=\text-center
p-8\>
                    <h2 className=\text-3xl
font-bold
text-gray-800
dark:text-gray-200
mb-4\>{TITLE}</h2>
                    <p className=\text-gray-600
dark:text-gray-400\>{DESC}</p>
                </div>
            </div>
            <div className=\hidden
lg:flex
absolute
left-1/2
top-0
bottom-0
justify-center
h-full
items-center
-translate-x-1/2\>
                <Divider vertical className=\h-4/5
mx-0\ />
            </div>
        </div>
    );
}\;

const index_template = \\use
client\;
import NavArrowLeftIcon from \@/src/@core/component/LTTIcon/iconoir/nav-arrow-left\;
import Link from \next/link\;
import FormDetail from \./components/
COMP_NAME
\;
import useLTTTitle from \@/src/@core/hooks/useLTTTitle\;

export default function AuthIndex() {
    useLTTTitle(\
HEAD_TITLE
\);

    return (
        <div className=\flex
flex-col
flex-1
lg:w-1/2
w-full
justify-center
py-5
sm:py-10
bg-white
dark:bg-transparent\>
            <div className=\w-full
max-w-md
mx-auto
mb-5
px-4
sm:px-0\>
                <Link
                    href=\/\
                    className=\inline-flex
items-center
text-sm
text-gray-500
transition-colors
hover:text-gray-700
dark:text-gray-400
dark:hover:text-gray-300\
                >
                    <NavArrowLeftIcon />
                    Trở lại trang chủ
                </Link>
            </div>
            <div className=\flex
flex-col
justify-center
flex-1
w-full
max-w-md
mx-auto
px-4
sm:px-0\>
                <div className=\mb-10\>
                    <div className=\mb-6
sm:mb-8\>
                        <h1 className=\mb-2
font-bold
text-gray-800
text-3xl
dark:text-white/90\>
                            {HEADING}
                        </h1>
                        <p className=\text-gray-500
dark:text-gray-400\>
                            {SUBHEADING}
                        </p>
                    </div>
                    <FormDetail />
                </div>
            </div>
        </div>
    );
}
\;

fs.writeFileSync(path.join(base_dir, '(customer)', 'login', 'page.tsx'), auth_page_template.replace('{TITLE}', 'Chào mừng đến với hệ thống').replace('{DESC}', 'Tham gia để trải nghiệm dịch vụ tốt nhất'));
fs.writeFileSync(path.join(base_dir, '(customer)', 'login', 'index.tsx'), index_template.replace('{COMP_NAME}', 'SignInForm').replace('{HEAD_TITLE}', 'Đăng nhập').replace('{HEADING}', 'Chào mừng trở lại').replace('{SUBHEADING}', 'Vui lòng đăng nhập để tiếp tục.'));

fs.writeFileSync(path.join(base_dir, '(customer)', 'register', 'page.tsx'), auth_page_template.replace('{TITLE}', 'Đăng ký Tài Khoản').replace('{DESC}', 'Tạo tài khoản mới cùng LTT LTC'));
fs.writeFileSync(path.join(base_dir, '(customer)', 'register', 'index.tsx'), index_template.replace('{COMP_NAME}', 'SignUpForm').replace('{HEAD_TITLE}', 'Đăng ký').replace('{HEADING}', 'Tạo tài khoản mới').replace('{SUBHEADING}', 'Tham gia với chúng tôi để nhận nhiều ưu đãi.'));

fs.writeFileSync(path.join(base_dir, '(customer)', 'reset-password', 'page.tsx'), auth_page_template.replace('{TITLE}', 'Khôi phục mật khẩu').replace('{DESC}', 'Lấy lại quyền truy cập tài khoản'));
fs.writeFileSync(path.join(base_dir, '(customer)', 'reset-password', 'index.tsx'), index_template.replace('{COMP_NAME}', 'ResetPasswordForm').replace('{HEAD_TITLE}', 'Khôi phục mật khẩu').replace('{HEADING}', 'Khôi phục mật khẩu').replace('{SUBHEADING}', 'Nhập thông tin để khôi phục quyền truy cập.'));

fs.writeFileSync(path.join(base_dir, '(administration)', 'login', 'page.tsx'), auth_page_template.replace('{TITLE}', 'Hệ thống Quản Trị LTC').replace('{DESC}', 'Quản lý toàn diện ứng dụng'));
fs.writeFileSync(path.join(base_dir, '(administration)', 'login', 'index.tsx'), index_template.replace('{COMP_NAME}', 'SignInForm').replace('{HEAD_TITLE}', 'Đăng nhập Quản Trị').replace('{HEADING}', 'Chào mừng Quản trị viên').replace('{SUBHEADING}', 'Vui lòng đăng nhập hệ thống nội bộ.'));

fs.writeFileSync(path.join(base_dir, '(administration)', 'register', 'page.tsx'), auth_page_template.replace('{TITLE}', 'Hệ thống Quản Trị LTC').replace('{DESC}', 'Đăng ký thành viên nội bộ'));
fs.writeFileSync(path.join(base_dir, '(administration)', 'register', 'index.tsx'), index_template.replace('{COMP_NAME}', 'RegisterForm').replace('{HEAD_TITLE}', 'Đăng ký Quản Trị').replace('{HEADING}', 'Đăng ký tài khoản').replace('{SUBHEADING}', 'Tạo tài khoản dành cho nhân viên quản trị.'));

fs.writeFileSync(path.join(base_dir, '(administration)', 'reset-password', 'page.tsx'), auth_page_template.replace('{TITLE}', 'Hệ thống Quản Trị LTC').replace('{DESC}', 'Lấy lại quyền truy cập quản trị'));
fs.writeFileSync(path.join(base_dir, '(administration)', 'reset-password', 'index.tsx'), index_template.replace('{COMP_NAME}', 'ResetPasswordForm').replace('{HEAD_TITLE}', 'Khôi phục mật khẩu Quản Trị').replace('{HEADING}', 'Khôi phục mật khẩu').replace('{SUBHEADING}', 'Lấy lại quyền truy cập tài khoản quản trị viên.'));


