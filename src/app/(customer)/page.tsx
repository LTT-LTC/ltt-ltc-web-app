import { redirect } from "next/navigation";

export default function CustomerRootPage() {
    // Root app/page.tsx handles the / route; this is a fallback
    redirect("/homepage");
}

// Testing CI/ID pipeline