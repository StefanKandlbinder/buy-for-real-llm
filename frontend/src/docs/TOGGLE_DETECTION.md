# Toggle Detection Objects

## Overview

The object detection display now includes **interactive clickable badges** using the **shadcn ToggleGroup** component with check icons that allow users to show or hide individual detected objects in real-time. The toggle control is **integrated directly into the Detected Objects section** as clickable badges.

## Features

### Interactive Toggle Badges

- **Location**: Directly under "Detected Objects" heading in metadata
- **Component**: shadcn ToggleGroup with `type="multiple"`
- **Style**: Check icon indicator and badge styling
- **Type**: Multiple selection toggle group
- **Visual Feedback**:
  - **Visible**: Check icon (✓) and highlighted state
  - **Hidden**: Bullet point (•) and default state
- **Behavior**: Click any badge to toggle that object's visibility on the media

## Visual Design

### Badge States

**Visible (ON)**

```
[✓ Sunglasses 95%]
```

- Blue background (`bg-blue-100`)
- Blue text (`text-blue-800`)
- Green check icon (`text-blue-600`)
- Hover: Darker blue (`hover:bg-blue-200`)

**Hidden (OFF)**

```
[• Face 88%]
```

- Gray background (`bg-gray-100`)
- Gray text (`text-gray-600`)
- Gray bullet point (`•`)
- Hover: Darker gray (`hover:bg-gray-200`)

## Implementation Details

### Component Structure

```typescript
Detected Objects (3)
├── [✓ Sunglasses 95%]  (clickable button)
├── [✓ Face 88%]        (clickable button)
└── [✓ Eye 92%]         (clickable button)
```

### State Management

```typescript
const [visibleObjects, setVisibleObjects] = useState<string[]>([
  "0",
  "1",
  "2", // All objects visible by default
]);

// ToggleGroup handles the state updates
<ToggleGroup
  type="multiple"
  value={visibleObjects}
  onValueChange={setVisibleObjects}
  className="flex flex-wrap gap-2 mt-2"
>
  {detectedObjects.map((obj, idx) => (
    <ToggleGroupItem
      key={idx}
      value={idx.toString()}
      aria-label={`Toggle object ${obj.label}`}
    >
      {isVisible ? (
        <Check className="h-3.5 w-3.5 text-blue-600 mr-1" />
      ) : (
        <span className="h-3.5 w-3.5 text-gray-400 mr-1">•</span>
      )}
      {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
    </ToggleGroupItem>
  ))}
</ToggleGroup>;
```

## User Experience

### Default Behavior

- ✅ All detected objects are **visible by default**
- ✅ Check icons displayed on all badges initially
- ✅ Full confidence percentage shown

### Interaction Flow

1. Scan image/video → Objects detected
2. All badges shown with check icons and blue background
3. Click any badge to **hide that object** (becomes gray with bullet)
4. Click again to **show that object** (becomes blue with check)
5. Continue toggling as needed

### Visual Feedback

- **Immediate response**: Badge colors change instantly
- **Clear state**: Blue = visible, Gray = hidden
- **Icon change**: Check (✓) vs Bullet (•)
- **Hover effect**: Darker shade on hover for better UX
- **Cursor**: Pointer cursor indicates clickability

## Styling Details

### Badge Container

- **Display**: Flex with wrap layout
- **Gap**: 2 units between badges
- **Responsive**: Wraps on smaller screens
- **Font Size**: Extra small (`text-xs`)
- **Padding**: Compact (`px-2.5 py-0.5`)
- **Rounding**: Full radius (`rounded-full`)

### Icon Sizing

- **Check Icon**: 3.5 × 3.5 units (`h-3.5 w-3.5`)
- **Gap**: Small gap between icon and text (`gap-1.5`)
- **Color**: Blue check for visible (`text-blue-600`)
- **Color**: Bullet for hidden

### Transitions

- **Color Transition**: Smooth (`transition-colors`)
- **Hover States**: Subtle darker shade
- **No Animation**: Instant toggle response

## Integration with Detection

### Before Detection

- No badges visible (no objects detected)

### During Detection

- Scan button shows loading state
- Overlay not visible until detection completes

### After Detection

- ✅ All badges shown with check icons (all visible by default)
- ✅ Users can immediately click to toggle visibility
- ✅ Bounding boxes appear/disappear on media when toggled

## Accessibility

- Each badge is a button with semantic `<button>` element
- Click or space/enter to toggle
- Visual state clear: blue = on, gray = off
- Icon + text provides redundant information
- Hover state indicates interactivity

## Performance

- No component mounting/unmounting
- Simple state toggle on click
- Conditional rendering affects only overlay bounding boxes
- No impact on detection accuracy or speed
- Smooth transitions without animation performance cost

## Advantages of This Approach

| Aspect                 | Benefit                                         |
| ---------------------- | ----------------------------------------------- |
| **shadcn Component**   | Uses built-in component library for consistency |
| **Multiple Selection** | Can toggle any/all objects on or off            |
| **Integrated Design**  | No separate section; integrated with badges     |
| **Check Icons**        | Clear visual indicator of visibility state      |
| **Accessible**         | Semantic ToggleGroup with proper ARIA labels    |
| **Type Safe**          | Full TypeScript support                         |
| **Styling**            | Consistent with app design system               |
| **State Management**   | Simple array-based state                        |

## Future Enhancements

- [ ] Select all / Deselect all button in header
- [ ] Filter by confidence threshold
- [ ] Keyboard shortcuts (Ctrl+click to isolate)
- [ ] Animation when toggling visibility
- [ ] Drag to reorder badges
- [ ] Save toggle preferences locally

## Component Files

- **ObjectDetectionOverlay.tsx** - Overlay with visibility prop
- **PreviewDialog.tsx** - Dialog containing ToggleGroup and state management
- **toggle-group.tsx** - shadcn ToggleGroup component
- **toggle.tsx** - shadcn Toggle primitive component

## Dependencies

- `@radix-ui/react-toggle-group` - ToggleGroup primitive
- `@radix-ui/react-toggle` - Toggle primitive
- `lucide-react` - Check icon for visibility indicator
- `class-variance-authority` - Style variants
- `clsx` / `tailwind-merge` - Class utilities
