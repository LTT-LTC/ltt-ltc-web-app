import defaultTheme from "@/src/themes/default";
import { App, ConfigProvider } from "antd";
import "antd/dist/reset.css";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider theme={defaultTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
};

export default ThemeProvider;