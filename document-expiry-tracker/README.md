# Document Expiry Tracker

A dependency-free browser app for keeping a list of documents and checking how soon each one expires. Add an item, choose its expiry date and warning window, then filter the list by status.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/document-expiry-tracker/>.

## Features

- Add a document name, category, expiration date, and advance warning period.
- See remaining days and status such as upcoming, urgent, or expired.
- Filter the displayed documents by status.
- Example entries are provided when there is no saved list.
- Data is saved in browser `localStorage` under `expiry-docs`.

## Notes

The app runs entirely in your browser and does not send reminders or sync across devices. Treat the local browser data as a convenience, not the only copy of important renewal dates. The browser's local storage is not encrypted; avoid shared devices for sensitive details.
