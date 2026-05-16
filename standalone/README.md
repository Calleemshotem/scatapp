# SCAT — Portable Offline Player

How to use

- Open `standalone/index.html` in your browser (double-click or use `File → Open`).
- Select one or more MP3 files using the "Select MP3 files" control, or drag-and-drop files onto the page.
- Use the player controls at the bottom to play, pause, skip, or toggle repeat.

Notes & limitations

- This is a minimal, standalone static player implemented in plain HTML/JS/CSS — it does not require the project's server.
- Files selected are played via in-memory object URLs; they are available for the current session in the browser tab. Reloading the page clears object URLs and you must re-select files.
- This deliberately does not touch your existing app source — it lives in `standalone/` and is safe to remove.

If you want persistent offline storage of the actual audio files across reloads, we can add an optional local static server or a small desktop wrapper. Tell me if you want that next.
