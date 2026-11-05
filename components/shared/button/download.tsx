"use client";

import React from "react";
import { ActionButton } from "./button";
import { IconDownload } from "@tabler/icons-react";
import { ButtonProps } from "@/components/ui/button";

const DownloadButton = ({
  filePath,
  fileName,
  variant = "outline",
  className,
}: {
  fileName?: string;
  filePath: string;
  variant?: ButtonProps["variant"];
  className?: string;
}) => {
  const [pending, startTransition] = React.useTransition();

  const handleDownload = async () => {
    const linkBtn = document.createElement("a");
    const url = "/api/download/?file_path=" + filePath;
    linkBtn.href = url;
    linkBtn.download = filePath.split("/").pop() ?? "";
    document.body.appendChild(linkBtn);
    linkBtn.click();

    document.body.removeChild(linkBtn);
    URL.revokeObjectURL(url);
  };

  return (
    <ActionButton
      type="button"
      className={className}
      variant={variant}
      isPending={pending}
      onClick={() => {
        startTransition(async () => {
          await handleDownload();
        });
      }}
    >
      <IconDownload /> Template
    </ActionButton>
  );
};

export { DownloadButton };
