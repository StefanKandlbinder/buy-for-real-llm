# Object Detection Feature

## Overview

The PreviewDialog component now includes an integrated object detection feature that uses the Qwen vision model to detect objects in images and videos.

## Features

### 1. **Scan Button**

- Located in the dialog actions bar
- Captures the current video frame or uses the image directly
- Shows loading state while processing
- Disabled during scanning or if media fails to load

### 2. **Object Detection**

- Sends media to `http://localhost:1234/v1/chat/completions` (Qwen vision endpoint)
- Returns detected objects with:
  - **Label**: Object name
  - **Confidence**: Detection confidence (0-1)
  - **Bounding Box**: [x1, y1, x2, y2] coordinates
- Uses **TanStack Query (React Query)** for mutation handling with:
  - Automatic retry logic (1 retry on failure)
  - Request batching support
  - Integrated error handling
  - Performance monitoring with DevTools

### 3. **Visual Overlay with Toggle Control**

- Displays transparent rounded boxes over detected objects
- 2px solid colored borders for each detection
- Label badge positioned above each box showing object name and confidence
- **Interactive ToggleGroup** to show/hide individual detections
  - Toggle buttons for each detected object
  - Multiple selection support (toggle on/off any object)
  - Compact layout with truncated labels
  - Positioned at top-right with white background and shadow

### 4. **Detection Summary**

- Lists all detected objects below the media
- Shows confidence percentage for each object
- Badge-style presentation for easy readability

## Implementation Details

### New Files

- **ObjectDetectionOverlay.tsx**: SVG-based overlay renderer with colored bounding boxes
- **useDetectObjects.ts**: React Query mutation hook for object detection
- **image-utils.ts** (updated): Added utility functions for frame capture and base64 conversion

### Updated Files

- **PreviewDialog.tsx**: Uses useDetectObjects hook for mutation handling

### Key Hooks

#### `useDetectObjects()`

Custom React Query mutation hook that:

- Manages loading/error/success states via `useMutation`
- Handles retry logic automatically
- Provides `mutate` function to trigger detection
- Returns `isPending` state for UI loading indicators
- Supports `onSuccess` and `onError` callbacks

Usage:

```typescript
const detectMutation = useDetectObjects();

detectMutation.mutate(imageBase64, {
  onSuccess: (objects) => {
    // Handle successful detection
  },
  onError: (error) => {
    // Handle detection error
  },
});
```

### Key Functions

#### `captureVideoFrame(videoElement: HTMLVideoElement): string | null`

Captures the current frame from a video element as base64 JPEG.

#### `imageUrlToBase64(url: string): Promise<string>`

Converts an image URL to base64 format for API transmission.

## Usage

1. Open the PreviewDialog for any image or video
2. Click the **Scan** button
3. Wait for object detection to complete (see loading state)
4. View the colored bounding boxes overlaid on the media
5. See the detected objects listed below with confidence scores
6. Click the **X** button on the overlay to dismiss it

## Configuration

The detection endpoint is configured to:

- Model: `qwen-vl` (Qwen Vision Language model)
- Temperature: 0.7
- Max Tokens: 1000
- Endpoint: `http://localhost:1234/v1/chat/completions`

### React Query Configuration

Mutations are configured with:

- **Retry**: 1 automatic retry on network failure
- **Network Mode**: Always attempt requests
- **State Management**: Full integration with React Query DevTools

## Error Handling

- Network errors are caught and displayed as toast notifications
- If media elements aren't available, appropriate errors are shown
- No objects detected returns an info message instead of an error
- Failed detection responses show a user-friendly error message
- CORS errors provide actionable guidance

## Performance Considerations

- Frame capture is instant (client-side canvas operation)
- Image URL to base64 conversion uses native Fetch API
- Detection happens asynchronously without blocking the UI
- Overlay rendering uses SVG for crisp, scalable graphics
- React Query integration enables request batching and caching
- Automatic retry prevents temporary network failures from causing errors

## Type Safety

All detection data is properly typed with the `DetectedObject` interface:

```typescript
type DetectedObject = {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
};
```

## DevTools Integration

Object detection mutations appear in React Query DevTools for:

- Real-time performance monitoring
- Mutation state tracking
- Network request inspection
- Error debugging
