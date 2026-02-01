"use client";

import { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

export default function Home() {
  const canvasRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Upload Image */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackgroundImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* Canvas Actions */
  const handleClear = () => canvasRef.current?.clearCanvas();
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();

  const handleDownload = async () => {
    if (!canvasRef.current || !canvasContainerRef.current) return;

    try {
      // Get actual dimensions from the visible canvas container
      const displayWidth = canvasContainerRef.current.offsetWidth;
      const displayHeight = canvasContainerRef.current.offsetHeight;

      console.log(`Canvas dimensions: ${displayWidth}x${displayHeight}`);

      // Get the sketch drawing as data URL
      const sketchDataUrl = await canvasRef.current.exportImage("png");

      // Create final canvas with SAME dimensions as displayed canvas
      const finalCanvas = document.createElement("canvas");
      const finalCtx = finalCanvas.getContext("2d");

      if (!finalCtx) {
        console.error("Failed to get canvas context");
        return;
      }

      // Match the display dimensions exactly
      finalCanvas.width = displayWidth;
      finalCanvas.height = displayHeight;

      // Fill with white background
      finalCtx.fillStyle = "#ffffff";
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Draw background image if exists - SAME positioning as display
      if (backgroundImage) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";

        await new Promise<void>((resolve) => {
          bgImg.onload = () => {
            // Use contain sizing (same as CSS backgroundSize: contain)
            const imgAspectRatio = bgImg.naturalWidth / bgImg.naturalHeight;
            const containerAspectRatio = displayWidth / displayHeight;

            let scaledWidth: number;
            let scaledHeight: number;

            if (imgAspectRatio > containerAspectRatio) {
              // Image is wider - fit to width
              scaledWidth = displayWidth;
              scaledHeight = displayWidth / imgAspectRatio;
            } else {
              // Image is taller - fit to height
              scaledHeight = displayHeight;
              scaledWidth = displayHeight * imgAspectRatio;
            }

            // Center the image (same as backgroundPosition: center)
            const offsetX = (displayWidth - scaledWidth) / 2;
            const offsetY = (displayHeight - scaledHeight) / 2;

            finalCtx.drawImage(bgImg, offsetX, offsetY, scaledWidth, scaledHeight);
            console.log(
              `Background image drawn at (${offsetX}, ${offsetY}) with size ${scaledWidth}x${scaledHeight}`
            );
            resolve();
          };

          bgImg.onerror = () => {
            console.warn("Failed to load background image");
            resolve();
          };

          bgImg.src = backgroundImage;
        });
      }

      // Draw the sketch on top - stretch to fill entire canvas (same as display)
      const sketchImg = new Image();
      sketchImg.crossOrigin = "anonymous";

      await new Promise<void>((resolve) => {
        sketchImg.onload = () => {
          // Draw sketch to fill the entire final canvas (no scaling issues)
          finalCtx.drawImage(sketchImg, 0, 0, finalCanvas.width, finalCanvas.height);
          console.log(`Sketch drawn to entire canvas ${finalCanvas.width}x${finalCanvas.height}`);
          resolve();
        };

        sketchImg.onerror = () => {
          console.error("Failed to load sketch image");
          resolve();
        };

        sketchImg.src = sketchDataUrl;
      });

      // Convert to blob and download
      finalCanvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create blob");
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `sketch-padavinodam-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log("Download completed successfully");
        },
        "image/png",
        1
      );
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 py-6 md:px-8 lg:px-12">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          పద వినోదం
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Draw, annotate, and export your images easily
        </p>
      </header>

      {/* Controls */}
      <section className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-2 md:p-2 mb-2">
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 items-start lg:items-center justify-between">
          {/* Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-zinc-50 hover:bg-gray-300 active:scale-[0.98] transition font-medium"
            >
              Upload Image
            </button>
          </div>

          {/* Brush Settings */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Color */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">
                Color
              </label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-7 h-7 rounded-md border border-gray-300 cursor-pointer shadow-sm"
              />
            </div>

            {/* Size */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">
                Size
              </label>
              <input
                type="range"
                min={1}
                max={40}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-28 accent-gray-800"
              />
              <span className="text-sm text-gray-500 w-10 text-right">
                {brushSize}px
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleUndo}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-yellow-200 text-sm font-medium hover:bg-gray-50 transition"
            >
              Undo
            </button>

            <button
              onClick={handleRedo}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-yellow-300 text-sm font-medium hover:bg-gray-50 transition"
            >
              Redo
            </button>

            <button
              onClick={handleClear}
              className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
            >
              Clear
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              Download
            </button>
          </div>
        </div>
      </section>

      {/* Canvas */}
      <section className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        <div
          ref={canvasContainerRef}
          className="relative w-full bg-gray-50"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "none",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
            height: "70vh",
            minHeight: "400px",
          }}
        >
          <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height="100%"
            strokeColor={brushColor}
            strokeWidth={brushSize}
            canvasColor="transparent"
          />
        </div>
      </section>

      {/* Help */}
      <section className="max-w-7xl mx-auto mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5">
        <h3 className="font-semibold mb-2 text-sm md:text-base text-gray-700">
          How to use
        </h3>

        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Upload an image.</li>
          <li>Select brush color and size.</li>
          <li>Draw with mouse or touch.</li>
          <li>Undo/Redo strokes anytime.</li>
          <li>Download your final artwork.</li>
        </ul>
      </section>
    </div>
  );
}
