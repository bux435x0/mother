# Nostromo Mother Chat Interface

This project is a browser-based chat client that emulates the Nostromo's "Mother" terminal from the Alien films. It prompts the user for a Google Gemini API key, then uses the Gemini 1.5 Flash model to power a conversational assistant.

## Features
- Terminal-inspired interface with scanline and flicker effects to evoke the Nostromo computer aesthetic.
- Secure runtime prompt for a Google Gemini API key (kept client-side and stored in `localStorage` for convenience).
- Conversation thread persisted locally so that Gemini responses include the entire prior dialogue.
- Message log rendered in a terminal window, including timestamped system prompts.

## Usage
1. Open `index.html` in a modern browser.
2. Enter your Google Gemini API key when prompted. The key is stored only in your browser.
3. Start chatting! Each request is sent to the `gemini-1.5-flash-latest` model via the Google Generative Language API.
4. Use the control panel to reset the API key or clear the current conversation thread.

## Development
The app is static and uses vanilla HTML, CSS, and JavaScript. No build step is required.

## Disclaimer
The Gemini API key is never transmitted to any server other than Google's Generative Language API endpoint. Nevertheless, use caution and rotate your key regularly.
