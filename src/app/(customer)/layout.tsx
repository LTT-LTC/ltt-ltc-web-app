import CustomerLayout from "@/src/layouts/CustomerLayout";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <CustomerLayout>
            {children}
        </CustomerLayout>
    );
}

// Testing CI/ID pipeline