# Tic Tac Toe — AI Edition

A modern, responsive Tic Tac Toe web app with an unbeatable Minimax AI, glassmorphism UI, dark mode, score tracking, match history, and sound effects. Built with pure **HTML, CSS, and JavaScript** — no frameworks, no build step.

![Made with HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Made with CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![Made with JS](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## Live Demo

**Play here:** https://aasimansari1.github.io/tic-tac-toe/

Open the link in any modern browser — desktop or mobile. No installation required.

---

## How to Play

### Option 1 — Play Online (recommended)

Just open the **Live Demo** link above. The game runs entirely in your browser — no installation needed. Works on desktop and mobile.

### Option 2 — Run Locally

1. **Download the code:**
   - Click the green **`Code`** button at the top of the repo → **Download ZIP** → extract it.
   - *Or* clone with git:
     ```bash
     git clone https://github.com/aasimansari1/tic-tac-toe.git
     cd tic-tac-toe
     ```

2. **Open the game:**
   - Double-click `index.html`. It will open in your default browser. Done.

No server, no `npm install`, no build tools required.

---

## Controls

| Action               | Mouse / Touch        | Keyboard       |
| -------------------- | -------------------- | -------------- |
| Place a mark         | Click / tap a cell   | `1` – `9`      |
| Restart current round| Click **Restart**    | `R`            |
| Close result popup   | Click **Close**      | `Esc`          |
| Toggle dark mode     | Top-right ☀ / ☾ icon | —              |

Cell number layout (matches numpad style):

```
 1 | 2 | 3
-----------
 4 | 5 | 6
-----------
 7 | 8 | 9
```

---

## Features

- **Two modes** — Player vs Player or Player vs AI
- **Three difficulty levels:**
  - *Easy* — random moves
  - *Medium* — mixes smart play with randomness
  - *Hard* — full Minimax with alpha-beta pruning (unbeatable; best you can do is a draw)
- **Score tracking** with player names
- **Match history** (last 30 games, with timestamps)
- **Animated win line** and pulsing winning cells
- **Sound effects** for click, place, win, lose, and draw (Web Audio API — no audio files needed)
- **Dark / light mode** with system-preference detection
- **Glassmorphism UI** with animated gradient blobs
- **Fully responsive** — works on phones, tablets, desktops
- **Persistent state** — scores, names, history saved in `localStorage`
- **Keyboard accessible**

---

## Deploy to GitHub Pages (for repo owners)

To host your own live version:

1. Push these files to a public GitHub repo.
2. Go to your repo → **Settings** → **Pages**.
3. Under **Source**, choose:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Click **Save**.
5. Wait ~1 minute. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

That's the URL to put in the **Live Demo** section above.

---

## Project Structure

```
tic-tac-toe/
├── index.html      # Markup, board, setup/game screens
├── style.css       # Glassmorphism theme, animations, responsive layout
├── script.js       # Game logic, Minimax AI, scoring, history
└── README.md
```

---

## Tech Notes

- **AI:** Minimax with alpha-beta pruning. Depth-weighted scoring (faster wins and slower losses are preferred), so the Hard AI plays optimally.
- **No dependencies:** Vanilla HTML/CSS/JS. Runs in any modern browser (Chrome, Firefox, Safari, Edge).
- **No build:** Open the file and play.

---

## License

MIT — free to use, modify, and share.
