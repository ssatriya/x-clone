import { motion } from "framer-motion";

import { MAX_POST_LENGTH } from "@/constants";

type Props = {
  inputCount: number;
};

const ProgressCircle = ({ inputCount }: Props) => {
  return (
    <div className="relative flex items-center justify-center h-[30px] w-[30px]">
      <motion.div
        animate={{
          height: inputCount >= 260 ? 30 : 20,
          width: inputCount >= 260 ? 30 : 20,
        }}
        initial={{ height: 20, width: 20 }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={MAX_POST_LENGTH}
        aria-valuenow={inputCount}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
      >
        <svg
          height="100%"
          // viewBox={`0 0 ${postCharCount >= 10 ? 30 : 20} ${
          //   postCharCount >= 10 ? 30 : 20
          // }`}
          viewBox="0 0 20 20"
          width="100%"
          style={{ overflow: "visible" }}
        >
          <defs>
            <clipPath id="0.03710110452626125">
              <rect height="100%" width="0" x="0"></rect>
            </clipPath>
          </defs>
          <circle
            cx="50%"
            cy="50%"
            fill="none"
            // r={postCharCount >= 10 ? 15 : 10}
            r={10}
            stroke="#2F3336"
            strokeWidth="2"
          ></circle>
          <circle
            cx="50%"
            cy="50%"
            fill="none"
            // r={postCharCount >= 10 ? 15 : 10}
            r={10}
            stroke="#1D9BF0"
            strokeDasharray="62.83185307179586"
            strokeDashoffset="62.60745359653945"
            strokeLinecap="round"
            strokeWidth="2"
            id="progressCircle"
          ></circle>
          <circle
            cx="50%"
            cy="50%"
            clipPath="url(#0.03710110452626125)"
            fill="#1D9BF0"
            r="0"
          ></circle>
        </svg>
      </motion.div>
    </div>
  );
};

export default ProgressCircle;
