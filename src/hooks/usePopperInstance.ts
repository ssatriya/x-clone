import { createPopper, type Instance as PopperInstance } from "@popperjs/core";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";

const usePopperInstance = (
  referenceRef: RefObject<HTMLDivElement>,
  tooltipRef: RefObject<HTMLDivElement>,
  tooltipVisible: boolean
) => {
  const [popperInstance, setPopperInstance] = useState<PopperInstance | null>(
    null
  );

  useEffect(() => {
    if (referenceRef.current && tooltipRef.current) {
      const instance = createPopper(referenceRef.current, tooltipRef.current, {
        placement: "bottom",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 0],
            },
          },
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport",
              padding: 8,
            },
          },
          {
            name: "flip",
            options: {
              fallbackPlacements: ["top", "bottom-start", "bottom-end"],
            },
          },
        ],
      });
      setPopperInstance(instance);
    }

    return () => {
      if (popperInstance) {
        popperInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (popperInstance) {
      popperInstance.update();
    }
  }, [tooltipVisible, popperInstance]);
};

export default usePopperInstance;
