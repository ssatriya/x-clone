import { Icons } from "@/components/icons";
import { Slider, SliderThumb, SliderTrack } from "react-aria-components";
import Cropper from "react-easy-crop";

type BackgroundEditorProps = {
  backgroundUrl: string;
  cropBackground: { x: number; y: number };
  zoomBackground: number;
  setZoomBackground: (zoom: number) => void;
  setCroppedBackgroundPixels: (value: any) => void;
  setCropBackground: (value: any) => void;
};

export default function BackgroundEditor({
  backgroundUrl,
  cropBackground,
  zoomBackground,
  setZoomBackground,
  setCroppedBackgroundPixels,
  setCropBackground,
}: BackgroundEditorProps) {
  const onZoomBackgroundChange = (zoom: number) => {
    setZoomBackground(zoom);
  };

  const onCropBackgroundComplete = (
    croppedArea: { width: number; height: number; x: number; y: number },
    croppedAreaPixels: { width: number; height: number; x: number; y: number }
  ) => {
    setCroppedBackgroundPixels(croppedAreaPixels);
  };

  const onCropBackgroundChange = (crop: any) => {
    setCropBackground(crop);
  };

  return (
    <div className="h-full flex-col justify-between relative">
      <Cropper
        image={backgroundUrl}
        crop={cropBackground}
        zoom={zoomBackground}
        onZoomChange={onZoomBackgroundChange}
        onCropComplete={onCropBackgroundComplete}
        onCropChange={onCropBackgroundChange}
        aspect={3 / 1}
        showGrid={false}
        cropShape="rect"
      />
      <div className="absolute bottom-0 left-[50%] w-[50%] translate-x-[-50%] h-14 flex items-center justify-center">
        <div className="flex gap-3 items-center justify-center h-full">
          <Icons.zoomOut className="h-[19px] w-[19px] fill-text" />
          <Slider
            minValue={1}
            maxValue={2}
            step={0.01}
            value={zoomBackground}
            onChange={(zoom: number) => onZoomBackgroundChange(zoom)}
            className="w-[300px]"
            aria-label="zoom"
          >
            <SliderTrack className="relative w-full h-7">
              {({ state }) => (
                <>
                  {/* track */}
                  <div className="absolute h-[4px] top-[50%] translate-y-[-50%] w-full rounded-full bg-[#8ECDF8]" />
                  {/* fill */}
                  <div
                    className="absolute h-[4px] top-[50%] translate-y-[-50%] rounded-full bg-blue"
                    style={{
                      width: state.getThumbPercent(0) * 100 + "%",
                    }}
                  />
                  <SliderThumb className="h-4 w-4 top-[50%] rounded-full border-none bg-blue transition dragging:bg-purple-100 outline-none focus-visible:ring-2 ring-none cursor-pointer" />
                </>
              )}
            </SliderTrack>
          </Slider>
          <Icons.zoomIn className="h-[19px] w-[19px] fill-text" />
        </div>
      </div>
    </div>
  );
}
