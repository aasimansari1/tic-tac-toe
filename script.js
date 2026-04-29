/* ============================================================
   Tic Tac Toe — AI Edition
   Features: PvP, PvAI (Easy / Medium / Hard Minimax),
   score tracking, match history, animated win line, sound FX,
   dark mode, responsive layout.
   ============================================================ */

(() => {
    'use strict';

    /* ---------- Constants ---------- */
    const HUMAN = 'X';
    const AI = 'O';
    const WIN_PATTERNS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],   // cols
        [0, 4, 8], [2, 4, 6]               // diagonals
    ];

    /* ---------- State ---------- */
    const state = {
        mode: 'pvai',         // 'pvai' | 'pvp'
        difficulty: 'hard',   // 'easy' | 'medium' | 'hard'
        board: Array(9).fill(''),
        currentPlayer: HUMAN,
        gameOver: false,
        scores: { X: 0, O: 0, D: 0 },
        names: { X: 'Player 1', O: 'Computer' },
        history: [],
        soundOn: true
    };

    /* ---------- DOM Refs ---------- */
    const $ = (id) => document.getElementById(id);

    const els = {
        setupScreen:    $('setupScreen'),
        gameScreen:     $('gameScreen'),
        difficultyGroup:$('difficultyGroup'),
        player1Input:   $('player1Name'),
        player2Input:   $('player2Name'),
        player2Label:   $('player2Label'),
        startBtn:       $('startBtn'),
        board:          $('board'),
        cells:          [...document.querySelectorAll('.cell')],
        winLine:        $('winLine'),
        winLineSeg:     document.querySelector('#winLine line'),
        status:         $('status'),
        statusText:     $('statusText'),
        nameX:          $('nameX'),
        nameO:          $('nameO'),
        scoreX:         $('scoreX'),
        scoreO:         $('scoreO'),
        scoreD:         $('scoreD'),
        scoreCardX:     $('scoreCardX'),
        scoreCardO:     $('scoreCardO'),
        restartBtn:     $('restartBtn'),
        resetScoreBtn:  $('resetScoreBtn'),
        newGameBtn:     $('newGameBtn'),
        clearHistoryBtn:$('clearHistoryBtn'),
        historyList:    $('historyList'),
        themeToggle:    $('themeToggle'),
        modal:          $('resultModal'),
        modalEmoji:     $('resultEmoji'),
        modalTitle:     $('resultTitle'),
        modalSub:       $('resultSub'),
        modalPlayAgain: $('modalPlayAgain'),
        modalClose:     $('modalClose')
    };

    /* ============================================================
       Sound Effects (Web Audio API — no external assets required)
       ============================================================ */
    let audioCtx = null;
    const getAudio = () => {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) audioCtx = new Ctx();
        }
        return audioCtx;
    };

    function playTone(freq, duration = 0.12, type = 'sine', volume = 0.15) {
        if (!state.soundOn) return;
        const ctx = getAudio();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    const sfx = {
        click: () => playTone(520, 0.08, 'triangle', 0.12),
        place: () => playTone(680, 0.1,  'sine',     0.15),
        win:   () => {
            [523, 659, 784, 1047].forEach((f, i) =>
                setTimeout(() => playTone(f, 0.18, 'triangle', 0.18), i * 90));
        },
        lose:  () => {
            [400, 320, 240].forEach((f, i) =>
                setTimeout(() => playTone(f, 0.22, 'sawtooth', 0.12), i * 110));
        },
        draw:  () => {
            [440, 440].forEach((f, i) =>
                setTimeout(() => playTone(f, 0.16, 'square', 0.12), i * 140));
        }
    };

    /* ============================================================
       Theme
       ============================================================ */
    function initTheme() {
        const saved = localStorage.getItem('ttt-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ttt-theme', next);
        sfx.click();
    }

    /* ============================================================
       Game Logic
       ============================================================ */

    /** Returns { winner: 'X'|'O', line: [i,j,k] } or null */
    function checkWinner(board) {
        for (const pattern of WIN_PATTERNS) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], line: pattern };
            }
        }
        return null;
    }

    function isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    function getEmptyCells(board) {
        const empty = [];
        for (let i = 0; i < 9; i++) if (!board[i]) empty.push(i);
        return empty;
    }

    /* ============================================================
       AI — Minimax (with alpha-beta pruning)
       ============================================================ */

    /**
     * Minimax with alpha-beta pruning.
     * Returns score from AI's perspective:
     *   +10 - depth  → AI wins (faster wins ranked higher)
     *   -10 + depth  → Human wins (slower losses ranked higher)
     *    0            → Draw
     */
    function minimax(board, depth, isMaximizing, alpha, beta) {
        const result = checkWinner(board);
        if (result) {
            return result.winner === AI ? 10 - depth : depth - 10;
        }
        if (isBoardFull(board)) return 0;

        if (isMaximizing) {
            let best = -Infinity;
            for (const i of getEmptyCells(board)) {
                board[i] = AI;
                const score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = '';
                best = Math.max(best, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return best;
        } else {
            let best = Infinity;
            for (const i of getEmptyCells(board)) {
                board[i] = HUMAN;
                const score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = '';
                best = Math.min(best, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return best;
        }
    }

    /** Optimal move via Minimax */
    function bestMove(board) {
        let best = -Infinity;
        let move = -1;
        for (const i of getEmptyCells(board)) {
            board[i] = AI;
            const score = minimax(board, 0, false, -Infinity, Infinity);
            board[i] = '';
            if (score > best) {
                best = score;
                move = i;
            }
        }
        return move;
    }

    /** Pick a random empty cell */
    function randomMove(board) {
        const empty = getEmptyCells(board);
        return empty[Math.floor(Math.random() * empty.length)];
    }

    /** Pick a smart move: win if possible, block if needed, else random */
    function smartMove(board) {
        // Try to win
        for (const i of getEmptyCells(board)) {
            board[i] = AI;
            if (checkWinner(board)?.winner === AI) { board[i] = ''; return i; }
            board[i] = '';
        }
        // Block the opponent
        for (const i of getEmptyCells(board)) {
            board[i] = HUMAN;
            if (checkWinner(board)?.winner === HUMAN) { board[i] = ''; return i; }
            board[i] = '';
        }
        // Prefer center, then corners
        if (!board[4]) return 4;
        const corners = [0, 2, 6, 8].filter(i => !board[i]);
        if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
        return randomMove(board);
    }

    /** Choose AI move based on difficulty */
    function getAIMove(board) {
        switch (state.difficulty) {
            case 'easy':   return randomMove(board);
            case 'medium': return Math.random() < 0.6 ? smartMove(board) : randomMove(board);
            case 'hard':
            default:       return bestMove(board);
        }
    }

    /* ============================================================
       UI Rendering
       ============================================================ */

    function renderBoard() {
        els.cells.forEach((cell, i) => {
            const v = state.board[i];
            cell.textContent = v;
            cell.classList.toggle('taken', !!v);
            cell.classList.toggle('x', v === 'X');
            cell.classList.toggle('o', v === 'O');
        });
    }

    function updateStatus() {
        const cls = state.currentPlayer === 'X' ? 'x-turn' : 'o-turn';
        els.status.classList.remove('x-turn', 'o-turn');
        els.status.classList.add(cls);

        const name = state.names[state.currentPlayer];
        els.statusText.textContent = state.gameOver
            ? '—'
            : `${name}'s turn (${state.currentPlayer})`;

        els.scoreCardX.classList.toggle('active', !state.gameOver && state.currentPlayer === 'X');
        els.scoreCardO.classList.toggle('active', !state.gameOver && state.currentPlayer === 'O');
    }

    function updateScoreboard() {
        els.nameX.textContent = state.names.X;
        els.nameO.textContent = state.names.O;
        els.scoreX.textContent = state.scores.X;
        els.scoreO.textContent = state.scores.O;
        els.scoreD.textContent = state.scores.D;
    }

    /** Animated SVG win line — cell index → coords inside the 100x100 viewBox */
    function drawWinLine(line) {
        // Cells are arranged as 3x3, with 10px padding + 10px gap.
        // Translate to viewBox-relative percentages: each cell center sits at
        // (col * 33.33% + 16.66%, row * 33.33% + 16.66%) approximately.
        const pos = (idx) => {
            const r = Math.floor(idx / 3);
            const c = idx % 3;
            return { x: c * (100 / 3) + (100 / 6), y: r * (100 / 3) + (100 / 6) };
        };
        const a = pos(line[0]);
        const b = pos(line[2]);

        els.winLineSeg.setAttribute('x1', a.x);
        els.winLineSeg.setAttribute('y1', a.y);
        els.winLineSeg.setAttribute('x2', b.x);
        els.winLineSeg.setAttribute('y2', b.y);

        // restart animation
        els.winLine.classList.remove('show');
        void els.winLine.getBoundingClientRect();
        els.winLine.classList.add('show');
    }

    function clearWinLine() {
        els.winLine.classList.remove('show');
        els.cells.forEach(c => c.classList.remove('win'));
    }

    /* ============================================================
       Match Flow
       ============================================================ */

    function placeMark(index, mark) {
        state.board[index] = mark;
        const cell = els.cells[index];
        cell.textContent = mark;
        cell.classList.add('placed', mark.toLowerCase(), 'taken');
        cell.addEventListener('animationend', () => cell.classList.remove('placed'), { once: true });
        sfx.place();
    }

    function handleCellClick(e) {
        const cell = e.currentTarget;
        const index = Number(cell.dataset.i);

        if (state.gameOver || state.board[index] !== '') return;

        // In PvAI, lock human input while it's AI's turn
        if (state.mode === 'pvai' && state.currentPlayer !== HUMAN) return;

        playMove(index);
    }

    function playMove(index) {
        placeMark(index, state.currentPlayer);

        const result = checkWinner(state.board);
        if (result) return endRound(result.winner, result.line);
        if (isBoardFull(state.board)) return endRound(null, null);

        state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();

        if (state.mode === 'pvai' && state.currentPlayer === AI && !state.gameOver) {
            scheduleAIMove();
        }
    }

    function scheduleAIMove() {
        // Small delay so the move feels deliberate
        setTimeout(() => {
            if (state.gameOver) return;
            const move = getAIMove([...state.board]);
            if (move !== -1 && move !== undefined) playMove(move);
        }, 380);
    }

    function endRound(winner, line) {
        state.gameOver = true;

        if (winner) {
            state.scores[winner]++;
            if (line) {
                line.forEach(i => els.cells[i].classList.add('win'));
                drawWinLine(line);
            }

            const isAIWin = state.mode === 'pvai' && winner === AI;
            const isHumanWin = state.mode === 'pvai' && winner === HUMAN;

            if (isAIWin) sfx.lose();
            else sfx.win();

            const winnerName = state.names[winner];
            addHistory({
                result: 'win',
                winner,
                text: `${winnerName} won as ${winner}`
            });

            showModal({
                emoji: isAIWin ? '🤖' : '🎉',
                title: isAIWin ? 'AI Wins!'
                                : isHumanWin ? 'You Win!'
                                : `${winnerName} Wins!`,
                sub: isAIWin ? 'The machine outsmarted you this round.'
                              : `Played as ${winner}. Nicely done.`
            });
        } else {
            state.scores.D++;
            sfx.draw();
            addHistory({ result: 'draw', winner: null, text: "It's a draw" });
            showModal({
                emoji: '🤝',
                title: "It's a Draw!",
                sub: 'Evenly matched — try again.'
            });
        }

        updateScoreboard();
        updateStatus();
        persist();
    }

    function newRound() {
        state.board = Array(9).fill('');
        state.currentPlayer = HUMAN;
        state.gameOver = false;
        clearWinLine();
        renderBoard();
        updateStatus();
        hideModal();
    }

    function resetScores() {
        state.scores = { X: 0, O: 0, D: 0 };
        state.history = [];
        renderHistory();
        updateScoreboard();
        persist();
    }

    /* ============================================================
       Match History
       ============================================================ */

    function addHistory(entry) {
        const time = new Date();
        const stamp = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        state.history.unshift({ ...entry, time: stamp });
        if (state.history.length > 30) state.history.length = 30;
        renderHistory();
    }

    function renderHistory() {
        if (!state.history.length) {
            els.historyList.innerHTML =
                '<li class="history-empty">No matches yet — make your move.</li>';
            return;
        }
        els.historyList.innerHTML = state.history.map(h => {
            const cls = h.result === 'draw' ? 'draw' : (h.winner === 'X' ? 'win-x' : 'win-o');
            return `<li class="history-item ${cls}">
                        <span class="h-result">${h.text}</span>
                        <span class="h-time">${h.time}</span>
                    </li>`;
        }).join('');
    }

    function clearHistory() {
        state.history = [];
        renderHistory();
        persist();
    }

    /* ============================================================
       Modal
       ============================================================ */

    function showModal({ emoji, title, sub }) {
        els.modalEmoji.textContent = emoji;
        els.modalTitle.textContent = title;
        els.modalSub.textContent = sub;
        els.modal.classList.remove('hidden');
    }

    function hideModal() {
        els.modal.classList.add('hidden');
    }

    /* ============================================================
       Persistence (localStorage)
       ============================================================ */

    function persist() {
        try {
            localStorage.setItem('ttt-state', JSON.stringify({
                scores: state.scores,
                names: state.names,
                mode: state.mode,
                difficulty: state.difficulty,
                history: state.history
            }));
        } catch { /* ignore quota */ }
    }

    function restore() {
        try {
            const saved = JSON.parse(localStorage.getItem('ttt-state') || 'null');
            if (!saved) return;
            if (saved.scores) state.scores = saved.scores;
            if (saved.names) state.names = saved.names;
            if (saved.mode) state.mode = saved.mode;
            if (saved.difficulty) state.difficulty = saved.difficulty;
            if (saved.history) state.history = saved.history;
        } catch { /* ignore parse errors */ }
    }

    /* ============================================================
       Setup Screen
       ============================================================ */

    function applyModeUI() {
        const isPvP = state.mode === 'pvp';
        els.difficultyGroup.style.display = isPvP ? 'none' : '';
        els.player2Label.textContent = isPvP ? 'Player 2 (O)' : 'Computer (O)';
        if (isPvP && els.player2Input.value === 'Computer') {
            els.player2Input.value = 'Player 2';
        } else if (!isPvP && els.player2Input.value === 'Player 2') {
            els.player2Input.value = 'Computer';
        }
    }

    function startGame() {
        state.names.X = (els.player1Input.value || 'Player 1').trim().slice(0, 14);
        state.names.O = (els.player2Input.value ||
            (state.mode === 'pvp' ? 'Player 2' : 'Computer')).trim().slice(0, 14);

        // New session — fresh scores per session start
        state.board = Array(9).fill('');
        state.currentPlayer = HUMAN;
        state.gameOver = false;

        els.setupScreen.classList.add('hidden');
        els.gameScreen.classList.remove('hidden');

        clearWinLine();
        renderBoard();
        updateScoreboard();
        updateStatus();
        renderHistory();
        persist();
    }

    function backToSetup() {
        els.gameScreen.classList.add('hidden');
        els.setupScreen.classList.remove('hidden');
        hideModal();
    }

    /* ============================================================
       Wire Up Events
       ============================================================ */

    function bindSetupControls() {
        // Mode segment
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-mode]').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                state.mode = btn.dataset.mode;
                applyModeUI();
                sfx.click();
            });
        });

        // Difficulty segment
        document.querySelectorAll('[data-diff]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-diff]').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                state.difficulty = btn.dataset.diff;
                sfx.click();
            });
        });

        els.startBtn.addEventListener('click', () => { sfx.click(); startGame(); });
    }

    function bindGameControls() {
        els.cells.forEach(cell => cell.addEventListener('click', handleCellClick));

        els.restartBtn.addEventListener('click', () => { sfx.click(); newRound(); });
        els.resetScoreBtn.addEventListener('click', () => {
            sfx.click();
            resetScores();
            newRound();
        });
        els.newGameBtn.addEventListener('click', () => { sfx.click(); backToSetup(); });
        els.clearHistoryBtn.addEventListener('click', () => { sfx.click(); clearHistory(); });

        els.modalPlayAgain.addEventListener('click', () => { sfx.click(); newRound(); });
        els.modalClose.addEventListener('click', () => { sfx.click(); hideModal(); });

        // Click outside modal-card to dismiss
        els.modal.addEventListener('click', (e) => {
            if (e.target === els.modal) hideModal();
        });

        // Keyboard support: 1-9 to play, R to restart, Esc to close modal
        document.addEventListener('keydown', (e) => {
            if (els.gameScreen.classList.contains('hidden')) return;
            if (e.key === 'Escape') { hideModal(); return; }
            if (e.key.toLowerCase() === 'r') { newRound(); return; }
            const n = Number(e.key);
            if (n >= 1 && n <= 9) {
                els.cells[n - 1].click();
            }
        });
    }

    function bindThemeToggle() {
        els.themeToggle.addEventListener('click', toggleTheme);
    }

    /* ============================================================
       Init
       ============================================================ */

    function init() {
        initTheme();
        restore();

        // Reflect restored selections in the UI
        document.querySelectorAll('[data-mode]').forEach(b => {
            const isActive = b.dataset.mode === state.mode;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        document.querySelectorAll('[data-diff]').forEach(b => {
            const isActive = b.dataset.diff === state.difficulty;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        els.player1Input.value = state.names.X || 'Player 1';
        els.player2Input.value = state.mode === 'pvp'
            ? (state.names.O || 'Player 2')
            : (state.names.O || 'Computer');
        applyModeUI();

        bindSetupControls();
        bindGameControls();
        bindThemeToggle();

        // Pre-render hidden game state for first show
        renderBoard();
        updateScoreboard();
        renderHistory();
        updateStatus();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
