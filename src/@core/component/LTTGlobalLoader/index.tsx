"use client";
import React, { useState, useEffect } from "react";
import LTTAppLoader from "../LTTAppLoader";

const LTTGlobalLoader = ({ children }: { children: React.ReactNode }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <>
            {!isMounted && <LTTAppLoader />}
            {children}
        </>
    );
};

export default LTTGlobalLoader;
