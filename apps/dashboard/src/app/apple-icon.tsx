import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0D",
          borderRadius: "36px",
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            fill="white"
            d="M14 4.29C19.36 4.29 23.71 8.64 23.71 14V23.71H14C8.64 23.71 4.29 19.36 4.29 14C4.29 8.64 8.64 4.29 14 4.29ZM14 21.35C18.05 21.35 21.35 18.05 21.35 14C21.35 9.95 18.05 6.65 14 6.65C9.95 6.65 6.65 9.95 6.65 14C6.65 18.05 9.95 21.35 14 21.35Z"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
