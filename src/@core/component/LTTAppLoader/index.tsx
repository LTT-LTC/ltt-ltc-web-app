import Image from "next/image";

const LTTAppLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <Image
        src="/images/main/LTTAppLoading.gif"
        alt="Loading..."
        width={100}
        height={100}
        priority
      />
    </div>
  );
};

export default LTTAppLoader;