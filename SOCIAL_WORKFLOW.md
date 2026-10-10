# Columbia: Affinity → Posts → social export

## Try a starter
1. Open the app (`npm run dev`, http://127.0.0.1:5199). Choose **Posts**.
2. Choose **New arrivals** (dark) or **Featured card** (light).
3. Import a clean card or full slab photo. Edit headline, details, optional price, badge, and call to action. The Ty Cobb default is a clearly labeled archival demo, not shop stock.
4. Choose **4:5**, **1:1**, or **9:16**, check the preview, and download the PNG.
5. **Save** retains copy and embedded photos in this browser. **Project → Download project** downloads a project with its imported photos/background so it can be opened on another computer using **Project → Import project**. Local save is manual. Download your project before clearing browser storage.

## Develop a design in Affinity
Choose **Project → Download Affinity master**, or use the `.af` files in `public/templates/`. SVG alternatives are included. The native `.af` files have editable text and vector shapes, plus embedded photographic images. The Columbia logo is the original raster, not reconstructed vector artwork.

Named groups:
- `BACKGROUND-export-this-group`: editable circles, rules, and base colors.
- `COPY-edit-these-text-layers`: editable text and badge/CTA shapes.
- `PHOTO-replace-with-your-card`: image layer and display area.
- `BRAND-logo-raster`: embedded website logo.

For a new background, work on a copy, hide Copy, Photo, and Brand groups, and export the complete canvas as a PNG. In Posts, use **Custom PNG**. Use a matching aspect ratio; backgrounds fill the canvas. The starter masters are 1080×1350 at 72 dpi. Exports from Affinity were verified at 1080×1350.

Changing the Affinity artwork does not automatically change the app's content positions. A new layout needs an explicit template definition in the app. This first version supports two families and custom backgrounds, not arbitrary `.af` template parsing. You can also finish a post completely in Affinity and export it there.

## Bring a 3D card into Posts
1. Choose **3D cards**. Import front/back photographs and select the matching card profile.
2. In **Export**, choose Portrait feed (1080×1350), Square feed (1080×1080), or Reels / Stories (1080×1920). Film preview uses the same ratio.
3. Scrub the film timeline to a visible frame. **Download frame PNG** includes the whole composition. **Download transparent card** removes the studio background, shadow, logo and captions and crops to the card's visible bounds.
4. **Use card still in Posts** transfers that transparent card into the selected post; then review/edit its copy. The original photo's own background/glare remains. This is not automatic photo background removal.
5. **Export film** makes a silent H.264 MP4 in the selected dimensions. The current Posts editor accepts stills; use the MP4 directly for video posts or in a separate video editor. MP4 placement/animated text in Posts is a future step.

Everything runs locally. Nothing is posted to social platforms automatically. No logins or cloud storage are required.
