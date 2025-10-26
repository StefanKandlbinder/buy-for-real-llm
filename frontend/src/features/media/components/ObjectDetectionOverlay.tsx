"use client";

import React from "react";
import { DetectedObject } from "@/lib/image-utils";
import { getDetectionColor } from "@/lib/detection-colors";

type ObjectDetectionOverlayProps = {
  objects: DetectedObject[];
  visibleObjects: string[];
};

function ObjectDetectionOverlayComponent({
  objects,
  visibleObjects,
}: ObjectDetectionOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Detected objects overlay */}
      {objects.map((obj, idx) => {
        const [x1, y1, x2, y2] = obj.bbox;
        const boxWidth = x2 - x1;
        const boxHeight = y2 - y1;
        const borderColor = getDetectionColor(idx);
        const isVisible = visibleObjects.includes(idx.toString());

        return isVisible ? (
          <div key={idx} className="absolute inset-0">
            {/* Bounding box */}
            <div
              className="rounded-lg bg-transparent border-2"
              style={{
                position: "absolute",
                left: `${x1 * 100}%`,
                top: `${y1 * 100}%`,
                width: `${boxWidth * 100}%`,
                height: `${boxHeight * 100}%`,
                borderColor: borderColor,
              }}
            >
              {/* Label badge */}
              <div
                className="absolute top-0 left-0 transform -translate-y-full px-2 py-1 rounded-md text-xs font-semibold text-white whitespace-nowrap"
                style={{
                  backgroundColor: borderColor,
                  marginBottom: "4px",
                }}
              >
                {obj.label} {(obj.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
}

/**
 * Memoized version to prevent unnecessary re-renders
 * This is important since the objects array is re-created on each parent render
 */
export const ObjectDetectionOverlay = React.memo(
  ObjectDetectionOverlayComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (don't re-render)
    // Return false if props changed (do re-render)
    return (
      JSON.stringify(prevProps.objects) ===
        JSON.stringify(nextProps.objects) &&
      JSON.stringify(prevProps.visibleObjects) ===
        JSON.stringify(nextProps.visibleObjects)
    );
  }
);

ObjectDetectionOverlay.displayName = "ObjectDetectionOverlay";
