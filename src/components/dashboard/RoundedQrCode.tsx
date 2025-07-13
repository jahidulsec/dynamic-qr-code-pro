import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const RoundedQRCodeDynamic = ({
  size = 320,
  data,
}: {
  size?: number;
  data: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // Initialize QR code only once
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: size,
      height: size,
      data: "https://example.com",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
      dotsOptions: {
        type: "dots",
      },
      cornersSquareOptions: {
        type: "extra-rounded",
      },
      cornersDotOptions: {
        type: "dot",
      },
      backgroundOptions: {
        color: "#fff",
      },
    });

    if (ref.current && qrCodeRef.current) {
      qrCodeRef.current.append(ref.current);
    }
  }, []);

  // Update QR code size when `size` state changes
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        width: size,
        height: size,
      });
    }
  }, [size]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={ref} />
    </div>
  );
};

export default RoundedQRCodeDynamic;
