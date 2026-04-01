"use client";
import React, { useState, useEffect } from "react";
import { Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import LTTButton from "../LTTButton";
import ImgCrop from "antd-img-crop";
import { LoadingOutlined } from "@ant-design/icons";
import UploadIcon from "../../LTTIcon/iconoir/upload";
import LTTRenderIf from "../../LTTRenderIf";
import {
  showNotificationSuccess,
  showNotificationError,
} from "@/src/@core/utils/message";

export type LTTUploadProps = UploadProps & {
  uploadType?: "avatar" | "image";
  limitFile: number;
  variantbutton?: "primary" | "outline";
  isShowlistFile?: boolean;
  label?: string;
  crop?: boolean;
  aspect?: number;
  icon?: React.ReactNode;
  className?: string;
};

const LTTUpload = ({
  limitFile = 3,
  uploadType = "image",
  multiple = uploadType !== "avatar" && true,
  icon = <UploadIcon />,
  label = `${uploadType === "avatar" ? "" : "ảnh lên"}`,
  className,
  listType = "picture",
  crop = false,
  aspect = 1 / 1,
  ...props
}: LTTUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([
    ...(props.fileList || []),
  ]);
  useEffect(() => {
    if (props.fileList) {
      setFileList(props.fileList);
    }
  }, [props.fileList]);
  const FILE_ACCEPT_MAP = {
    image: "image/png, image/jpeg, image/webp",
    avatar: "image/png, image/jpeg",
    // file: ".csv, .xlsx, .xls"
  };

  const accept = FILE_ACCEPT_MAP[uploadType] || FILE_ACCEPT_MAP.image;

  const handleChange: UploadProps["onChange"] = (info) => {
    const { status, name } = info.file;
    let newFileList = [...info.fileList];

    newFileList = newFileList.slice(-limitFile);

    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    setFileList(newFileList);
    setLoading(status === "uploading");
    if (status === "done") {
      showNotificationSuccess(`Ảnh ${name} đã được tải lên thành công.`, {
        title: "Tải lên thành công",
      });
    } else if (status === "error") {
      showNotificationError(`Không thể tải file ${name} lên máy chủ.`, {
        title: "Tải lên thất bại",
      });
    }
  };

  const uploadButton = (
    <LTTButton
      variant={props.variantbutton || "primary"}
      startIcon={loading ? <LoadingOutlined /> : icon}
      disabled={props.disabled}
    >
      {label}
    </LTTButton>
  );

  const renderUpload = (
    <Upload
      {...props}
      accept={accept}
      maxCount={props.maxCount || limitFile}
      listType={listType}
      fileList={fileList}
      multiple={multiple}
      onChange={handleChange}
      className={`${className}`}
      showUploadList={props.showUploadList ?? uploadType !== "avatar"}
    >
      {props.children ? (
        loading ? (
          <LoadingOutlined />
        ) : (
          props.children
        )
      ) : (
        uploadButton
      )}
    </Upload>
  );

  return (
    <div className={className}>
      <LTTRenderIf condition={!!label && listType === "picture"}>
        <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
      </LTTRenderIf>
      {crop && uploadType === "avatar" ? (
        <ImgCrop
          rotationSlider
          aspect={aspect}
          showGrid
          modalTitle="Edit Image"
        >
          {renderUpload}
        </ImgCrop>
      ) : (
        renderUpload
      )}
    </div>
  );
};

export default LTTUpload;

