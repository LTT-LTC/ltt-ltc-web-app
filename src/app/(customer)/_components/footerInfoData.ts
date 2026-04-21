export type InfoSection = {
    heading: string;
    content: string;
};

export type InfoPageContent = {
    title: string;
    description: string;
    sections: InfoSection[];
};

export type InfoNavItem = {
    href: string;
    label: string;
};

export const LTCINEMA_NAV_ITEMS: InfoNavItem[] = [
    { href: "/ltcinema/about-us", label: "About Us" },
    { href: "/ltcinema/use-giftcard", label: "Use Giftcode Card" },
    { href: "/ltcinema/career", label: "Career Opportunities" },
    { href: "/ltcinema/contact", label: "Contact LTT" },
    { href: "/ltcinema/for-partners", label: "For Business Partners" },
];

export const POLICY_LEGAL_NAV_ITEMS: InfoNavItem[] = [
    { href: "/policy-legal/website-conditions", label: "Conditions of Website Use" },
    { href: "/policy-legal/terms-of-use", label: "Terms of Use" },
    { href: "/policy-legal/payment-policy", label: "Payment Policy" },
    { href: "/policy-legal/privacy-policy", label: "Privacy Policy" },
    { href: "/policy-legal/cinema-rules", label: "Cinema Rules" },
    { href: "/policy-legal/faq", label: "FAQ" },
];

export const LTCINEMA_PAGES: Record<string, InfoPageContent> = {
    "about-us": {
        title: "About Us",
        description: "Learn about LTCinema and our mission to deliver memorable movie experiences.",
        sections: [
            {
                heading: "Who We Are",
                content:
                    "LTCinema is a modern cinema brand focused on high-quality projection, premium sound systems, and customer-first service standards.",
            },
            {
                heading: "Our Mission",
                content:
                    "We aim to connect people through stories by making cinema experiences convenient, accessible, and enjoyable for every audience segment.",
            },
            {
                heading: "Our Promise",
                content:
                    "From online booking to in-theater support, we continuously improve every touchpoint to ensure a smooth and enjoyable journey.",
            },
        ],
    },
    "use-giftcard": {
        title: "Use Giftcode Card",
        description: "How to redeem and apply giftcards during ticket or combo purchases.",
        sections: [
            {
                heading: "Where To Redeem",
                content:
                    "Giftcodes can be redeemed on eligible checkout screens in the LTCinema website before final payment confirmation.",
            },
            {
                heading: "Validation Rules",
                content:
                    "Each giftcode is subject to its validity period, campaign scope, and one-time or limited-use redemption conditions.",
            },
            {
                heading: "Common Issues",
                content:
                    "If a code is invalid, already used, or expired, the system will notify you. Please verify details or contact support for assistance.",
            },
        ],
    },
    career: {
        title: "Career Opportunities",
        description: "Discover open positions and growth opportunities at LTCinema.",
        sections: [
            {
                heading: "Working Environment",
                content:
                    "LTCinema fosters a collaborative and customer-focused culture where team members are encouraged to innovate and improve operations.",
            },
            {
                heading: "Open Roles",
                content:
                    "Roles may include cinema operations, customer support, marketing, technical support, and management positions.",
            },
            {
                heading: "How To Apply",
                content:
                    "Submit your profile through official recruitment channels. Qualified candidates will be contacted for interviews and assessment.",
            },
        ],
    },
    contact: {
        title: "Contact LTT",
        description: "Ways to reach LTCinema for support, feedback, or business requests.",
        sections: [
            {
                heading: "Customer Support",
                content:
                    "For booking assistance and account issues, contact the support team during service hours via hotline or email.",
            },
            {
                heading: "Business Inquiries",
                content:
                    "Partnership or event collaboration requests can be sent to our business contact channels for dedicated support.",
            },
            {
                heading: "Feedback",
                content:
                    "We value customer feedback and use it to improve service quality, operations, and digital product experiences.",
            },
        ],
    },
    "for-partners": {
        title: "For Business Partners",
        description: "Partnership opportunities with LTCinema for brands and organizations.",
        sections: [
            {
                heading: "Partnership Models",
                content:
                    "LTCinema supports co-branded campaigns, promotional bundles, event sponsorships, and strategic tenant collaborations.",
            },
            {
                heading: "Campaign Integration",
                content:
                    "Partner promotions can be integrated into booking flows, loyalty experiences, and in-cinema communication channels.",
            },
            {
                heading: "Get Started",
                content:
                    "Share your business goals and target audience with us so we can propose a suitable partnership framework.",
            },
        ],
    },
};

export const POLICY_LEGAL_PAGES: Record<string, InfoPageContent> = {
    "website-conditions": {
        title: "Conditions of Website Use",
        description: "Rules and conditions for accessing and using LTCinema digital services.",
        sections: [
            {
                heading: "Acceptance Of Terms",
                content:
                    "By using this website, users acknowledge and agree to comply with all applicable policies, terms, and legal obligations.",
            },
            {
                heading: "Permitted Use",
                content:
                    "Users must use the platform for lawful purposes only and avoid activities that compromise system security or service quality.",
            },
            {
                heading: "Service Availability",
                content:
                    "LTCinema may update, suspend, or adjust website features as needed to maintain reliability, security, and compliance.",
            },
        ],
    },
    "terms-of-use": {
        title: "Terms of Use",
        description: "General terms governing account use, bookings, and digital interactions.",
        sections: [
            {
                heading: "Account Responsibility",
                content:
                    "Users are responsible for maintaining account confidentiality and ensuring that account information is accurate and current.",
            },
            {
                heading: "Ticketing Obligations",
                content:
                    "Booking details, showtime selection, and transaction confirmations must be reviewed carefully before payment is completed.",
            },
            {
                heading: "Policy Updates",
                content:
                    "Terms may be updated periodically. Continued use of the service indicates acceptance of the latest published version.",
            },
        ],
    },
    "payment-policy": {
        title: "Payment Policy",
        description: "Payment methods, transaction handling, and refund considerations.",
        sections: [
            {
                heading: "Accepted Methods",
                content:
                    "Payments may be processed through supported cards, e-wallets, and other approved methods shown at checkout.",
            },
            {
                heading: "Transaction Confirmation",
                content:
                    "Orders are confirmed only after successful payment processing and generation of a booking reference in the system.",
            },
            {
                heading: "Refund Scope",
                content:
                    "Refund eligibility depends on showtime policies, campaign conditions, and verified transaction status.",
            },
        ],
    },
    "privacy-policy": {
        title: "Privacy Policy",
        description: "How LTCinema collects, stores, and uses personal information.",
        sections: [
            {
                heading: "Data Collection",
                content:
                    "We collect essential information required for account management, booking operations, and service improvement.",
            },
            {
                heading: "Data Usage",
                content:
                    "Personal data is processed to deliver services, improve customer experience, and fulfill legal or operational requirements.",
            },
            {
                heading: "Data Protection",
                content:
                    "LTCinema applies technical and organizational safeguards to protect user information against unauthorized access.",
            },
        ],
    },
    "cinema-rules": {
        title: "Cinema Rules",
        description: "Guidelines to maintain a safe and comfortable cinema environment for everyone.",
        sections: [
            {
                heading: "Behavior Standards",
                content:
                    "Please keep noise levels low, respect seating assignments, and follow staff instructions during your cinema visit.",
            },
            {
                heading: "Restricted Items",
                content:
                    "Certain items may be restricted for safety or hygiene reasons, depending on cinema regulations and local requirements.",
            },
            {
                heading: "Safety Compliance",
                content:
                    "In emergency situations, customers must follow evacuation directions and official safety announcements immediately.",
            },
        ],
    },
    faq: {
        title: "Frequently Asked Questions",
        description: "Quick answers to common booking, payment, and account questions.",
        sections: [
            {
                heading: "Booking Questions",
                content:
                    "You can check booking details in your account history and use confirmation references for support requests.",
            },
            {
                heading: "Payment Questions",
                content:
                    "If payment fails or appears pending, verify transaction status and contact support with your payment reference.",
            },
            {
                heading: "Account Questions",
                content:
                    "For password resets or profile updates, use account settings and security tools available on the customer portal.",
            },
        ],
    },
};
