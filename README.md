# Image Sketch Board

Simple Next.js app to upload an image and draw/sketch on top of it, then export the merged result.

Key features
- Upload an image as background
- Draw with variable brush color and size
- Undo / Redo / Clear drawing
- Download the merged image (background + drawing)

Quick start
1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open the app in your browser:

http://localhost:3000

Usage
- Use the **Upload Image** button to load an image.
- Draw on the canvas with your mouse or touch device.
- Use **Undo/Redo/Clear** as needed.
- Click **Download** to save the final merged PNG.

Files
- Main page: `app/page.tsx`

Tech
- Next.js
- Tailwind CSS
- react-sketch-canvas (drawing)

If you'd like a longer README (screenshots, deployment steps, or license), tell me what to include and I'll expand it.
