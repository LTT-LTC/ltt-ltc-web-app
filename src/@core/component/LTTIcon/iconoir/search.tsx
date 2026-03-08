import React from "react";

export default function SearchIcon({ size, color, ...props }: any) {
    return (
        <svg
            width={size ?? "20px"} // Giảm xuống 20px thường đẹp hơn cho ô Search
            height={size ?? "20px"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color={color ?? "currentColor"}
            {...props}
        >
            <path
                d="M17 17L21 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}