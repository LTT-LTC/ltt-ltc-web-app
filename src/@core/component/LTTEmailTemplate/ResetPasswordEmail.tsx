import * as React from "react";
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Img,
    Preview,
    Heading,
} from "@react-email/components";

interface ResetPasswordEmailProps {
    username: string;
    resetLink: string;
    expireHours: number;
    baseUrl?: string;
}
export const ResetPasswordEmail = ({
    username = "John Doe",
    resetLink = "http://localhost:4200/reset-password",
    expireHours = 2,
    baseUrl = "http://localhost:4200",
}: ResetPasswordEmailProps) => {
    const logoUrl = `${baseUrl}/images/main/app-logo.png`;
    return (
        <Html>
            <Head />
            <Preview>Yêu cầu khôi phục mật khẩu LTT Cinema</Preview>
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

                        {/* Main Instruction */}
                        <Text style={text}>
                            Nhấn vào nút dưới đây để di chuyển tới trang Khôi phục mật khẩu.
                            Hãy nhớ rằng đường dẫn này sẽ bị hủy sau <strong>{expireHours}</strong> giờ.
                        </Text>

                        {/* CTA Button */}
                        <Section style={buttonContainer}>
                            <Button style={button} href={resetLink}>
                                <span style={{ display: 'block', width: '100%' }}>
                                    Di chuyển tới trang Khôi phục mật khẩu
                                </span>
                            </Button>
                        </Section>

                        {/* Disclaimer */}
                        <Text style={text}>
                            Nếu không có ý định đổi mật khẩu thì hãy bỏ qua Email này.
                        </Text>

                        {/* Sign-off */}
                        <Text style={signOff}>
                            Trân trọng,
                            <br />
                            <strong>IT-Zone.</strong>
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

export default ResetPasswordEmail;

const main = {
    backgroundColor: "#eff2f7",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    margin: "0 auto",
    padding: "20px 10px",
};

const container = {
    margin: "0 auto",
    maxWidth: "700px",
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

const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#295DFA",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "14px 24px",
    borderRadius: "8px",
    color: "#ffffff",
    boxShadow: "0 4px 6px rgba(41, 93, 250, 0.2)",
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