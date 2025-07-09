import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

const initialSize = 200;

const RoundedQRCodeDynamic = () => {
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const [size, setSize] = useState(initialSize);

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
      <input
        type="range"
        min="100"
        max="400"
        value={size}
        onChange={(e) => setSize(Number(e.target.value))}
      />
      <p>Size: {size}px</p>
    </div>
  );
};

export default RoundedQRCodeDynamic;
