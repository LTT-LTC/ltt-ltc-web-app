import * as React from "react";
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Img,
    Preview,
    Heading,
} from "@react-email/components";

interface PasswordResetSuccessEmailProps {
    username: string;
    studentId: string;
    time: string;
    date: string; 
    baseUrl?: string;
}

export const PasswordResetSuccessEmail = ({
    username = "John Doe",
    studentId = "20110345",
    time = "10:30:00",
    date = "15:05:2024",
    baseUrl = "http://localhost:4200",
}: PasswordResetSuccessEmailProps) => {
    const logoUrl = `${baseUrl}/images/main/aoo-logo.png`;

    return (
        <Html>
            <Head />
            <Preview>Thông báo mật khẩu đã được khôi phục thành công</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Logo Section */}
                    <Section style={logoContainer}>
                        <Img
                            src={logoUrl}
                            width="100"
                            height="100"
                            alt="IT-Zone Logo"
                            style={logoStyle}
                        />
                    </Section>

                    {/* White Card Section */}
                    <Section style={card}>
                        {/* Greeting */}
                        <Heading style={greeting}>Hi {username},</Heading>

                        {/* Notification Content */}
                        <Text style={text}>
                            Tài khoản hệ thống của <strong>{studentId}</strong> đã được khôi phục thành công vào lúc <strong>{time}</strong> ngày <strong>{date}</strong>.
                        </Text>

                        {/* Warning */}
                        <Text style={text}>
                            Nếu việc khôi phục mật khẩu của tài khoản này không phải do bạn thì hãy liên hệ với System Admin hoặc trưởng ban Hành chính Nhân sự ngay lập tức để được hỗ trợ.
                        </Text>

                        {/* Sign-off */}
                        <Text style={signOff}>
                            Trân trọng,
                            <br />
                            <strong>LTT Cinema.</strong>
                        </Text>

                        {/* Footer Note */}
                        <Text style={footerNote}>
                            <strong>Lưu ý:</strong> Đây là email tự động, vui lòng không trả lời email này.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default PasswordResetSuccessEmail;

const main = {
    backgroundColor: "#eff2f7",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    margin: "0 auto",
    padding: "20px 10px",
};

const container = {
    margin: "0 auto",
    maxWidth: "600px",
    width: "100%",
};

const logoContainer = {
    textAlign: "center" as const,
    marginBottom: "30px",
    marginTop: "20px",
};

const logoStyle = {
    margin: "0 auto",
    borderRadius: "12px",
    display: "block",
};

const card = {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    boxSizing: "border-box" as const,
};

const greeting = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    marginTop: "0",
    marginBottom: "20px",
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333",
    marginBottom: "20px",
};

const signOff = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333",
    marginTop: "30px",
    marginBottom: "30px",
};

const footerNote = {
    fontSize: "13px",
    color: "#666",
    marginTop: "20px",
    borderTop: "1px solid #eaeaea",
    paddingTop: "20px",
    lineHeight: "20px",
};