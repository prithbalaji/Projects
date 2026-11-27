# CV Receipt Scanner

A small browser-based receipt capture prototype. It lets you select an image, preview it, adjust grayscale/contrast for readability, enter merchant/date/total, and save receipt records in browser storage.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/cv-receipt-scanner/>.

## How it works

- Receipt photos are previewed locally in the browser.
- The current prototype does **not** run OCR or computer-vision extraction; fill in the merchant, date, and total fields yourself.
- Saved records are stored in `localStorage` under `cv-receipts` in this browser profile.
- The image filters are visual preview controls and do not alter the original image file.

## Privacy and limitations

This is a front-end demo, not accounting software. Browser storage is not encrypted, synced, or backed up. Avoid using it for sensitive receipts on a shared device. Clearing site data removes saved entries. Add OCR only with a deliberate privacy review and user consent before sending receipt images to any service.
