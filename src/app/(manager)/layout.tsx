import ManagerLayout from "@/src/layouts/ManagerLayout";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ManagerLayout>
            {children}
        </ManagerLayout>
    );
}
