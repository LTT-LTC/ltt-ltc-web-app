import { useState } from "react";
import LTTAvatar, { type LTTAvatarProps } from "../LTTAvatar";
import LTTUpload from "../LTTUpload";
import { RcFile } from "antd/es/upload";

const LTTUploadAvatar = ({ ...props }: LTTAvatarProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string>(props.src || "");

  return (
    <LTTUpload
      uploadType="avatar"
      limitFile={1}
      onChange={(info) => {
        const { fileList } = info;
        if (fileList.length > 0) {
          const file = fileList[0];
          const originalFile = file.originFileObj as RcFile;
          const url = URL.createObjectURL(originalFile);
          setAvatarUrl(url);
        }
      }}
    >
      <LTTAvatar src={avatarUrl} {...props} />
    </LTTUpload>
  );
};

export default LTTUploadAvatar;
