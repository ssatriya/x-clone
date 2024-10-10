"use client";

const LoadingSpinner = () => {
  return (
    <div className="animate-spin stroke-primary h-[26px] w-[26px]">
      <svg height="100%" viewBox="0 0 32 32" width="100%">
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          stroke-width="4"
          style={{ stroke: "rgb(29, 155, 240)", opacity: 0.2 }}
        ></circle>
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          stroke-width="4"
          style={{
            stroke: "rgb(29, 155, 240)",
            strokeDasharray: 80,
            strokeDashoffset: 60,
          }}
        ></circle>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
