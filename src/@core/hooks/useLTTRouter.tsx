import { useRouter } from "next/navigation";

const useLTTRouter = () => {
    const router = useRouter();

    return { ...router };
};

export default useLTTRouter;