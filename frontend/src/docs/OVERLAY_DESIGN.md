# Overlay Design - Object Detection Visualization

## Visual Preview

```
┌─────────────────────────────────────────────────────┐
│  Image/Video Preview Area                           │
│                                                      │
│    ┌──────────────────────────────────────┐         │
│    │                                      │         │
│    │    ┌──────────────────────────────┐  │         │
│    │    │ Sunglasses 95%               │  │         │
│    │    ├──────────────────────────────┤  │         │
│    │    │ ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │         │
│    │    │ ░░░░░░ (detected object) ░░ │  │         │
│    │    │ ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │         │
│    │    └──────────────────────────────┘  │         │
│    │                                      │         │
│    │         ┌──────────────────┐         │   ┌─────┐
│    │         │ Face 88%         │         │   │[☐][☑]
│    │         ├──────────────────┤         │   │Sung..
│    │         │ ░░░░░░░░░░░░░░░ │         │   │Face
│    │         │ ░░ (object 2) ░ │         │   │[☑][☑]
│    │         │ ░░░░░░░░░░░░░░░ │         │   └─────┘
│    │         └──────────────────┘         │
│    │                                      │
│    └──────────────────────────────────────┘
│                                                      │
└─────────────────────────────────────────────────────┘

Legend:
├─┤      = 2px solid colored border
│░│      = transparent colored background (70% opacity)
┌─┐      = ToggleGroup control panel
[☐]/[☑] = Toggle buttons (off/on state)
```

## Design Specifications

### Overlay Elements

Each detected object is displayed with:

1. **Bounding Box**

   - Transparent colored background (70% opacity)
   - 2px solid colored border (matching background color)
   - Rounded corners (lg radius - 8px)
   - Positioned based on received bbox coordinates

2. **Label Badge**

   - Positioned above the bounding box
   - Solid background color (matches border)
   - White text with object name and confidence percentage
   - Formatted: `"Object Name 95%"`
   - Small text size for minimal visual clutter

3. **Toggle Control Panel**
   - Located at top-right corner of overlay
   - White background with rounded corners and shadow
   - Contains toggle buttons for each detected object
   - Shows abbreviated object labels (max 8 chars + "...")
   - Multiple selection: users can toggle any/all objects on or off
   - Compact layout with outline variant styling

### Color Palette

8 distinct colors for object differentiation:

```
1. Red         - rgba(255, 107, 107, 0.7)  border: rgb(255, 107, 107)
2. Teal        - rgba(78, 205, 196, 0.7)   border: rgb(78, 205, 196)
3. Blue        - rgba(69, 183, 209, 0.7)   border: rgb(69, 183, 209)
4. Orange      - rgba(255, 160, 122, 0.7)  border: rgb(255, 160, 122)
5. Mint        - rgba(152, 216, 200, 0.7)  border: rgb(152, 216, 200)
6. Yellow      - rgba(247, 220, 111, 0.7)  border: rgb(247, 220, 111)
7. Purple      - rgba(187, 143, 206, 0.7)  border: rgb(187, 143, 206)
8. Light Blue  - rgba(133, 193, 226, 0.7)  border: rgb(133, 193, 226)
```

Colors cycle for multiple detections (index % 8).

### Layout & Positioning

- **Container**: Absolute positioned overlay covering entire media area
- **Pointer Events**: Disabled on overlay divs, enabled only on close button
- **Positioning**: Percentage-based (responsive to media dimensions)
- **Z-index**: Close button has z-10 for always being clickable

### Technical Implementation

#### CSS Classes

- `rounded-lg` - 8px border radius
- `pointer-events-none` - Disable pointer events for overlay container
- `pointer-events-auto` - Enable pointer events for close button
- `transform -translate-y-full` - Position label above box
- `whitespace-nowrap` - Prevent label text wrapping
- `transition-colors` - Smooth hover effect on close button

#### Inline Styles

- **Positioning**: `left`, `top`, `width`, `height` in percentage
- **Colors**: Dynamic rgba/rgb values from color arrays
- **Border**: 2px solid with dynamic color
- **Background**: Transparent semi-opaque fill

### Responsive Behavior

The overlay scales with media dimensions:

- Bounding box coordinates are converted to percentages
- Works with any media size (small thumbnails to full-screen)
- Maintains visual clarity across different resolutions

## Previous Implementation

### SVG-based Overlay (Replaced)

- Used SVG element with viewBox
- Drew rectangles for boxes
- Drew text elements for labels
- Less flexible for styling and interactions

### Why HTML/CSS is Better

✅ **Better Styling**: Full access to CSS classes and hover effects
✅ **Responsive**: Percentage-based positioning scales naturally
✅ **Accessible**: HTML text is accessible to screen readers
✅ **Interactive**: Easier to add hover states and animations
✅ **Performance**: Faster rendering than SVG manipulation
✅ **Maintainable**: Easier to understand and modify

## Future Enhancements

Possible improvements:

- Click on label to focus object details
- Hover effects to highlight specific detections
- Drag to reposition boxes
- Copy bounding box coordinates
- Filter by confidence threshold
- Animation on detection completion
