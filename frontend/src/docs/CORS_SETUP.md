# CORS Setup for Object Detection

## Problem

When scanning videos or images for object detection, you might see this error:

```
SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement':
Tainted canvases may not be exported.
```

This happens because the canvas becomes "tainted" when drawing cross-origin content, preventing us from exporting it as an image.

## Solution

### Option 1: Use CORS-Enabled Storage (Recommended)

The Pinata IPFS gateway already supports CORS, so if you're uploading files through Pinata, they should work out of the box.

**Requirements:**

- Media must be served with proper CORS headers
- `Access-Control-Allow-Origin: *` (or specific origins)
- Media served over HTTPS (same as your app)

### Option 2: Configure Your Image Server

If hosting your own images, ensure CORS headers are set:

#### Nginx

```nginx
location /images/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

#### Express.js

```javascript
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
```

#### Next.js API Routes

```typescript
// pages/api/image.ts
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  // Your image serving logic
}
```

### Option 3: Local Upload Workaround

If CORS cannot be fixed on the source server:

1. Download the media file
2. Re-upload it through the app's upload dialog
3. Use the new local copy for scanning

This ensures the media is properly served with CORS headers.

## Troubleshooting

### Still Getting CORS Error?

1. **Check Network Tab**: Open DevTools → Network tab, click the media file request

   - Look for `Access-Control-Allow-Origin` header
   - Verify the response status is 200

2. **Verify SSL/TLS**:

   - Both app and media server must use HTTPS
   - Mixed HTTP/HTTPS won't work

3. **Test with curl**:
   ```bash
   curl -i -X OPTIONS https://your-media-url.com/image.jpg \
     -H "Origin: https://your-app.com" \
     -H "Access-Control-Request-Method: GET"
   ```

### Pinata Specific

If using Pinata gateway (`gray-abstract-hyena-886.mypinata.cloud`):

1. Verify the file is pinned correctly
2. Test the gateway URL directly in browser
3. Ensure `next.config.ts` has the correct Pinata hostname:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "gray-abstract-hyena-886.mypinata.cloud",
      pathname: "/**",
    },
  ],
}
```

## Implementation Details

The app handles CORS by:

1. **Adding `crossOrigin="anonymous"` attribute** to all media elements
2. **Using `mode: "cors"` in fetch** for API requests
3. **Catching SecurityError exceptions** and providing helpful messages
4. **Suggesting re-upload as fallback** when CORS fails

## Error Messages

| Error                               | Cause                             | Solution                             |
| ----------------------------------- | --------------------------------- | ------------------------------------ |
| `SecurityError: Tainted canvas`     | Cross-origin content without CORS | Ensure media server has CORS headers |
| `Failed to fetch image`             | Network error or CORS rejection   | Check URL and server CORS config     |
| `Cannot access image: CORS enabled` | Explicit CORS failure             | Verify CORS headers with curl        |

## Pinata Notes

- **Pinata Gateway**: Supports CORS by default ✅
- **Upload**: Files auto-pinned with CORS support ✅
- **CDN**: Ensures fast global access with CORS ✅

Most issues resolve by simply re-uploading the media through the app's UI, which ensures it's properly stored on Pinata with CORS headers.
