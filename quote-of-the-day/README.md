# Quote of the Day

A small, responsive quote display built with plain HTML, CSS, and JavaScript. Open a quote, discover another, and use the app's built-in sharing/copy controls where supported by your browser.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/quote-of-the-day/>.

## Notes

The app is static and needs no package installation or build step. If a browser feature such as clipboard access is unavailable in an insecure context, open it through `localhost` as shown above. Quote content and any external-source behavior are defined in `app.js`; network-dependent features require an internet connection.
