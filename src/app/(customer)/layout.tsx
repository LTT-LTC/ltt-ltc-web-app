import CustomerLayout from "@/src/layouts/CustomerLayout";
import LTTGlobalLoader from "@/src/@core/component/LTTGlobalLoader";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LTTGlobalLoader>
            <CustomerLayout>
                {children}
            </CustomerLayout>
        </LTTGlobalLoader>
    );
}

// Testing CI/ID pipeline