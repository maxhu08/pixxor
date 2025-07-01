"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface ProcessedImage {
  name: string;
  url: string;
  size: string;
}

export default function Processor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid image file");
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setProcessedImages([]);

    try {
      const processedImages: ProcessedImage[] = [];

      // Create different processed versions
      const formats = [
        { name: "JPEG (Quality 80)", format: "jpeg", quality: 0.8 },
        { name: "JPEG (Quality 60)", format: "jpeg", quality: 0.6 },
        { name: "PNG", format: "png", quality: 1 },
        { name: "WebP (Quality 80)", format: "webp", quality: 0.8 },
      ];

      const sizes = [
        { name: "Original", width: null, height: null },
        { name: "1200px", width: 1200, height: null },
        { name: "800px", width: 800, height: null },
        { name: "400px", width: 400, height: null },
      ];

      // Process the image for each combination
      for (const format of formats) {
        for (const size of sizes) {
          const processed = await processImageVariant(
            selectedFile,
            format,
            size,
          );
          if (processed) {
            processedImages.push(processed);
          }
        }
      }

      setProcessedImages(processedImages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the image",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageVariant = async (
    file: File,
    format: { name: string; format: string; quality: number },
    size: { name: string; width: number | null; height: number | null },
  ): Promise<ProcessedImage | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        // Calculate dimensions
        let { width, height } = img;
        if (size.width && size.width < width) {
          height = (height * size.width) / width;
          width = size.width;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const sizeInKB = (blob.size / 1024).toFixed(1);
              const fileName = `${file.name.split(".")[0]}_${size.name}_${format.name.replace(/[^a-zA-Z0-9]/g, "_")}.${format.format === "jpeg" ? "jpg" : format.format}`;

              resolve({
                name: fileName,
                url: url,
                size: `${sizeInKB} KB`,
              });
            } else {
              resolve(null);
            }
          },
          format.format === "jpeg"
            ? "image/jpeg"
            : format.format === "png"
              ? "image/png"
              : "image/webp",
          format.quality,
        );
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Image Processor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        <Button
          onClick={processImage}
          disabled={!selectedFile || isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Process Image"}
        </Button>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {processedImages.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Processed Images:</h3>
            {processedImages.map((image, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
              >
                <div>
                  <p className="font-medium">{image.name}</p>
                  <p className="text-sm text-gray-600">{image.size}</p>
                </div>
                <Button
                  onClick={() => downloadImage(image.url, image.name)}
                  variant="outline"
                  size="sm"
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
