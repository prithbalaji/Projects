# Receipt Scanner

A browser-only receipt organizer prototype. Select a receipt image for a preview, review or edit the suggested merchant/date/amount fields, choose a category, and save the record to the list.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/receipt-scanner/>.

## How it works

- The selected image is previewed locally.
- The current prototype does not perform OCR; it uses the image filename as a basic merchant suggestion and fills a default date. Check and edit all fields before saving.
- Receipt records are kept in browser `localStorage` under `receipts`.

## Privacy and limitations

This is not a bookkeeping system and does not upload or back up your records. Browser storage is not encrypted, and clearing site data removes saved receipts. Do not use it as the only record of a purchase or on a shared device for sensitive receipts.
