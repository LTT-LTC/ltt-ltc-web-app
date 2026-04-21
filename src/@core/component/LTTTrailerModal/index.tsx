"use client";

import LTTModal from "@/src/@core/component/AntD/LTTModal";

type LTTTrailerModalProps = {
    open: boolean;
    onClose: () => void;
    trailerYoutubeId: string;
    title: string;
};

export default function LTTTrailerModal({
    open,
    onClose,
    trailerYoutubeId,
    title,
}: LTTTrailerModalProps) {
    return (
        <LTTModal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            destroyOnHidden
            centered
            title={title}
            className="trailer-modal"
            styles={{
                body: { padding: 0 },
                mask: { backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.75)" },
            }}
        >
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${trailerYoutubeId}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        </LTTModal>
    );
}
