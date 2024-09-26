"use client";

import React, { forwardRef, Ref, useImperativeHandle, useRef } from "react";

interface SliderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onClick" | "onDrag" | "onMouseUp" | "onMouseMove"
  > {
  $total: number;
  $fillColor?: string;
  onClick?: (currentPercentage: number) => void;
  onDrag?: (completedPercentage: number) => void;
  onMouseUp?: () => void;
  onMouseMove?: (pointerPercentage: number) => void;
  orientation?: "vertical" | "horizontal";
}

export interface SliderRefProps {
  updateSliderFill: (completedPercentage: number) => void;
}

const SeekSlider = (props: SliderProps, ref: Ref<SliderRefProps>) => {
  const {
    $total,
    onClick,
    onDrag,
    onMouseUp,
    onMouseMove,
    $fillColor = "#ffffff",
    orientation = "horizontal",
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);

  const updateSliderFillByEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = rootRef.current;
    if (elem) {
      const rect = elem.getBoundingClientRect();
      const fillWidth = ((e.pageX - rect.left) / rect.width) * 100;
      if (fillWidth < 0 || fillWidth > 100) {
        return;
      }
      elem.style.setProperty("--slider-fill", `${fillWidth}%`);
      onClick?.(fillWidth);
    }
  };

  const handleThumbMouseDown = () => {
    if (rootRef.current) {
      rootRef.current.setAttribute("data-dragging", "true");
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rootRef.current?.getAttribute("data-dragging")) {
      updateSliderFillByEvent(e);
      const sliderFillWidth = parseFloat(
        rootRef.current.style.getPropertyValue("--slider-fill")
      );
      onDrag?.(sliderFillWidth);
    }
  };

  const handleContainerMouseUp = () => {
    if (rootRef.current) {
      rootRef.current.removeAttribute("data-dragging");
    }
    onMouseUp?.();
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        updateSliderFill(percentageCompleted: number) {
          rootRef.current?.style.setProperty(
            "--slider-fill",
            `${percentageCompleted}%`
          );
        },
      };
    },
    []
  );

  return (
    <div
      className="cursor-pointer relative h-full w-full py-2 group/slider"
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onClick={updateSliderFillByEvent}
    >
      <div
        ref={rootRef}
        className="relative h-1 w-full flex items-center rounded-full"
        style={
          {
            "--slider-fill": "0%",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
          } as React.CSSProperties
        }
      >
        <div
          className="absolute h-1 w-full bg-gray-300"
          onClick={updateSliderFillByEvent}
        />
        <div
          className="absolute h-1 bg-blue-500"
          style={{
            width: "var(--slider-fill, 0%)",
            backgroundColor: $fillColor,
          }}
        />
        <div
          className="absolute opacity-0 group-hover/slider:opacity-100 h-4 w-4 rounded-full bg-blue-500 transition-opacity duration-200"
          style={{
            left: "var(--slider-fill, 0%)",
            backgroundColor: $fillColor,
          }}
          onMouseDown={handleThumbMouseDown}
        />
      </div>
    </div>
  );
};

export default forwardRef(SeekSlider);
