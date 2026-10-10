# Columbia Sports Cards brand research

Checked 2026-10-09 against the live Shopify storefront at [columbiasportscard.com](https://columbiasportscard.com/). The downloaded files in `public/brand/` are byte-for-byte downloads of publicly served assets; they were not redrawn, cropped, recolored, upscaled, or converted.

## Original logo assets

| Local file | Exact source URL | Observed source | Recommendation / limitation |
|---|---|---|---|
| [`public/brand/columbia-hobby-badge.png`](./public/brand/columbia-hobby-badge.png) | [`https://columbiasportscard.com/cdn/shop/files/logo_3f796513-130f-4f89-8379-5e7549ff32f1.png?v=1746714839`](https://columbiasportscard.com/cdn/shop/files/logo_3f796513-130f-4f89-8379-5e7549ff32f1.png?v=1746714839) | 250 × 132 indexed PNG with a PNG `tRNS` transparency chunk. The badge reads “COLUMBIA HOBBY” and is the best directly served transparent badge for the black/olive/white treatment. SHA-256: `f2933ba37fb92b0f707926b808da11495af6f8379532f7fc1eda6e0760f88588`. | Use for a compact badge/mark over dark backgrounds. It is a flat raster; it does not expose separate olive, black, white, or lettering layers. Avoid recoloring or separating it in the renderer. |
| [`public/brand/columbia-sports-cards-wordmark.png`](./public/brand/columbia-sports-cards-wordmark.png) | [`https://columbiasportscard.com/cdn/shop/files/ChatGPT_Image_Jul_4_2026_09_19_38_AM.png?v=1783181995`](https://columbiasportscard.com/cdn/shop/files/ChatGPT_Image_Jul_4_2026_09_19_38_AM.png?v=1783181995) | Current header `<img alt="Columbia Sports Cards">` source. 1727 × 910 RGB PNG with no transparency chunk; it includes a white field around the black/olive “COLUMBIA” wordmark. SHA-256: `61c80b648c234d271d3b9d35da930a337f7881aa5dc0fc0d1d6ece04c96117ff`. | Highest-resolution served wordmark, but it is not transparent. Treat it as a flat image with its white background intact; do not remove the background or infer separate logo layers. |

No publicly served SVG logo was found in the homepage source. The homepage also contains a separate inline SVG seal (`.csc-seal`) for “COLUMBIA SPORTS CARDS / TRUSTED BY COLLECTORS / EST. 1998”; it is page markup rather than a downloadable logo file. It can be used as a visual motif reference, but it should not be copied into the app without resolving brand permission/provenance.

The source site does not expose a license for either raster asset. Keep these assets for the requested branded local prototype and confirm Columbia Sports Cards' permission before distributing a public or commercial build.

## Colors found in the live CSS/markup

The most repeated brand treatment is olive, near-black, and white. These values are copied exactly from the site's inline sections and SVG seal rather than sampled from pixels:

| Role | Hex | Source usage |
|---|---|---|
| Primary olive | `#9EB94A` | `.csc-h` accent variable, buttons, hover borders, and the inline seal fill/stroke |
| Olive hover / lighter accent | `#B0C95C` | Button hover backgrounds |
| Dark ink / panel | `#121212` | Main dark panels, text, category tile, and seal inner circle |
| Dark shipping strip | `#111111` | Hero section / shipping-strip background usage |
| White | `#FFFFFF` / `#FFF` | Wordmark and dark-section text |
| Muted olive text | `#7F9A33` | Small uppercase section eyebrows |
| Pale olive surface | `#F1F4E6` | Product metadata chips |
| Deep olive text | `#3D4A17` | Text on pale olive chips |
| Pale olive border | `#DFE7C4` | Chip border |

`#108474` also appears in Judge.me review-widget configuration injected by a third-party app. It is not the site's Columbia brand accent and should not be used as the brand color. The site uses additional Shopify neutrals such as `#E4E5E7`, `#F9FAFB`, and `#CFD2D6` for borders and surfaces.

## Typography and motifs

The storefront declares **DM Sans** from Shopify's `/cdn/fonts/dm_sans/` files and assigns it to both `--font-body-family` and `--font-heading-family`, with normal weights 400, 500, and 700 (plus italic 400/700). The custom homepage sections use heavier 700/800-looking headings, uppercase labels, tight tracking, pill buttons, and rounded card surfaces.

Visible motifs include the olive/black/white badge, four-point star/sparkle marks inside the badge, a circular established-1998 seal, pill-shaped CTAs, and small circular sport/category icons. These are useful layout references; keep the uploaded card photo dominant and apply motifs as background or framing layers rather than over the card art.

## Flat asset limits

Both downloaded assets are flattened raster images. The transparent badge has no independent layer for the olive field, black frame, stars, or lettering; the header wordmark additionally contains an opaque white field. The renderer can scale and place them, but cannot safely produce a clean recolor, recomposition, or separated foil treatment from these files. A true layered/vector brand kit would need to come from Columbia Sports Cards directly.

## Lorcana silhouette reference

Inspected https://lorcanacardmaker.com/ live on October 9, 2026, including the full inspector after its welcome screen. The visible card has gently rounded corners; no corner-radius control was found in that inspector. Our TCG default is a visual approximation at 2.8% of card height, adjustable via Custom corners, not a measured or official specification for Lorcana, Pokémon, or One Piece. No upstream code or artwork copied.
