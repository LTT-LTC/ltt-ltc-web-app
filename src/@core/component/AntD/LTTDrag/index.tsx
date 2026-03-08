"use client";
import { useState, useEffect } from "react";
import { Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { InboxOutlined, LoadingOutlined } from "@ant-design/icons";
import LTTRenderIf from "../../LTTRenderIf";
import {
    showNotificationSuccess,
    showNotificationError,
} from "@/src/@core/utils/message";

const { Dragger } = Upload;

export type LTTDragProps = UploadProps & {
    limitFile?: number;
    label?: string;
    description?: string;
    height?: number | string;
};

const LTTDrag = ({
    limitFile = 5,
    multiple = true,
    label = "Nhấn vào đây hoặc kéo - thả để chọn file",
    description = "Chấp nhận các định dạng file .csv, .xlsx, .xls với dung lượng tối đa 5MB",
    className,
    height = 200,
    ...props
}: LTTDragProps) => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>(props.fileList || []);

    useEffect(() => {
        if (props.fileList) setFileList(props.fileList);
    }, [props.fileList]);

    const handleChange: UploadProps["onChange"] = (info) => {
        let newFileList = [...info.fileList];
        newFileList = newFileList.slice(-limitFile);
        newFileList = newFileList.map((file) => {
            if (file.response && file.response.url) {
                file.url = file.response.url;
            }
            return file;
        });

        setFileList(newFileList);
        setLoading(newFileList.some(f => f.status === "uploading"));
        const { status, name } = info.file;
        if (status === "done") {
            showNotificationSuccess(`Tệp ${name} đã được tải lên thành công.`, {
                title: "Tải lên thành công"
            });
        } else if (status === "error") {
            showNotificationError(`Không thể tải tệp ${name} lên máy chủ.`, {
                title: "Tải lên thất bại"
            });
        }
        if (props.onChange) props.onChange(info);
    };

    const handleDrop: UploadProps["onDrop"] = (e) => {
        console.log("Dropped files", e.dataTransfer.files);
        if (props.onDrop) props.onDrop(e);
    };

    return (
        <div className={className} style={{ width: '100%' }}>
            <Dragger
                {...props}
                multiple={multiple}
                fileList={fileList}
                onChange={handleChange}
                onDrop={handleDrop}
                maxCount={limitFile}
                style={{ height }}>
                <p className="ant-upload-drag-icon">
                    {loading ? <LoadingOutlined /> : <InboxOutlined style={{ color: '#1890ff' }} />}
                </p>
                <p className="ant-upload-text text-base font-semibold">
                    {loading ? "Đang xử lý dữ liệu..." : label}
                </p>
                <LTTRenderIf condition={!!description}>
                    <p className="ant-upload-hint px-4 text-gray-500">
                        {description}
                    </p>
                </LTTRenderIf>
            </Dragger>
        </div>
    );
};

export default LTTDrag;