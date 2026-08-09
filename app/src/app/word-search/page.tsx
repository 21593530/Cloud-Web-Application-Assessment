"use client";

import { useMemo, useState } from "react";

type PuzzleWord = {
  id: string;
  tokens: string[];
  display: string;
  found: boolean;
  solution: Array<{ row: number; col: number }>;
};

type PuzzleResult = {
  board: string[][];
  words: PuzzleWord[];
};

const defaultWordInput = `tʃ ɪ n
b æɪ t
dʒ æ m
b æ d
b ʉː t`;

const directions = [
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: -1, dc: -1 },
];

const defaultPool = ["tʃ", "ɪ", "n", "b", "æ", "ɪ", "t", "dʒ", "m", "d", "ʉː", "ɹ", "ɔ", "l", "ʃ", "f", "v", "s", "ɐ", "ŋ"];

const PHONEME_HINTS: Record<string, string> = {
  "tʃ": "CH (as in chin)",
  "dʒ": "J (as in jam)",
  "ʃ": "SH (as in ship)",
  "θ": "TH (as in thin)",
  "ð": "TH (as in this)",
  "ʒ": "ZH (as in vision)",
  "ŋ": "NG (as in sing)",
  "ɪ": "short I (as in sit)",
  "iː": "long EE (as in see)",
  "æ": "short A (as in cat)",
  "ɛ": "short E (as in bed)",
  e: "short E (as in bed)",
  "ʌ": "short U (as in cup)",
  "ɒ": "short O (as in hot)",
  "ɔ": "aw (as in dog)",
  "ʊ": "short OO (as in book)",
  "ʉː": "long OO (as in food)",
  "uː": "long OO (as in food)",
  "ɐ": "schwa (as in about)",
  "ə": "schwa (as in about)",
  "ɹ": "R (as in run)",
  n: "N (as in net)",
  m: "M (as in map)",
  b: "B (as in bat)",
  d: "D (as in dog)",
  t: "T (as in tap)",
  l: "L (as in lamp)",
  f: "F (as in fish)",
  v: "V (as in van)",
  s: "S (as in sun)",
  z: "Z (as in zoo)",
  p: "P (as in pat)",
  k: "K (as in cat)",
  g: "G (as in go)",
  h: "H (as in hat)",
  w: "W (as in wet)",
  j: "Y (as in yes)",
};

function getPhonemeHint(token: string) {
  return PHONEME_HINTS[token] ?? `Pronunciation hint for ${token}`;
}

function parseWords(input: string): PuzzleWord[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const tokens = line.split(/\s+/).filter(Boolean);
      return {
        id: `word-${index + 1}`,
        tokens,
        display: tokens.join(" "),
        found: false,
        solution: [],
      };
    });
}

function canPlace(board: string[][], word: string[], row: number, col: number, dr: number, dc: number) {
  const rows = board.length;
  const cols = board[0].length;
  const len = word.length;
  const endRow = row + dr * (len - 1);
  const endCol = col + dc * (len - 1);

  if (endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) {
    return false;
  }

  for (let i = 0; i < len; i += 1) {
    const currentRow = row + dr * i;
    const currentCol = col + dc * i;
    const existing = board[currentRow][currentCol];
    if (existing && existing !== word[i]) {
      return false;
    }
  }

  return true;
}

function buildPuzzle(words: PuzzleWord[], rows: number, cols: number): PuzzleResult {
  const board = Array.from({ length: rows }, () => Array(cols).fill(""));
  const pool = [...new Set([...defaultPool, ...words.flatMap((word) => word.tokens)])];
  const placedWords: PuzzleWord[] = [];

  words.forEach((word) => {
    let added = false;
    for (let attempt = 0; attempt < 220 && !added; attempt += 1) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * rows);
      const startCol = Math.floor(Math.random() * cols);

      if (!canPlace(board, word.tokens, startRow, startCol, direction.dr, direction.dc)) {
        continue;
      }

      const solution: Array<{ row: number; col: number }> = [];
      word.tokens.forEach((token, index) => {
        const currentRow = startRow + direction.dr * index;
        const currentCol = startCol + direction.dc * index;
        board[currentRow][currentCol] = token;
        solution.push({ row: currentRow, col: currentCol });
      });

      placedWords.push({ ...word, solution });
      added = true;
    }

    if (!added) {
      placedWords.push({ ...word, solution: [] });
    }
  });

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!board[row][col]) {
        board[row][col] = pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  return { board, words: placedWords };
}

function buildExportHtml(board: string[][], words: PuzzleWord[]) {
  const cols = board[0].length;
  const boardMarkup = board
    .flatMap((row, rowIndex) =>
      row.map((cell, colIndex) =>
        `<button class="cell" type="button" data-row="${rowIndex}" data-col="${colIndex}" data-hint="${getPhonemeHint(cell)}" title="${getPhonemeHint(cell)}" aria-label="${cell} — ${getPhonemeHint(cell)}">${cell}</button>`
      )
    )
    .join("");
  const wordMarkup = words
    .map(
      (word) =>
        `<li class="word-item" data-id="${word.id}"><span class="word-label">${word.display}</span><span class="token-list">${word.tokens
          .map((token) => `<span class="token-pill" data-hint="${getPhonemeHint(token)}" title="${getPhonemeHint(token)}">${token}</span>`)
          .join("")}</span></li>`
    )
    .join("");

  const puzzleData = JSON.stringify({
    cols,
    board: board.map((row) => row.map((cell) => ({ symbol: cell, hint: getPhonemeHint(cell) }))),
    words: words.map((word) => ({
      id: word.id,
      display: word.display,
      tokens: word.tokens,
      found: word.found,
      solution: word.solution,
    })),
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PhonoTrail Studio Word Search</title>
    <style>
      :root {
        color-scheme: light;
        --bg-color: #f8fafc;
        --surface-color: #ffffff;
        --surface-alt: #f1f5f9;
        --border-color: #e2e8f0;
        --text-primary: #0f172a;
        --text-muted: #475569;
        --accent-color: #eab308;
        --accent-strong: #ca8a04;
      }
      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        background: linear-gradient(135deg, var(--bg-color) 0%, var(--surface-alt) 100%);
        color: var(--text-primary);
        padding: 24px;
      }
      .sheet {
        max-width: 1000px;
        margin: 0 auto;
        background: var(--surface-color);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 18px 44px rgb(15 23 42 / 0.16);
      }
      h1, h2 { margin: 0 0 8px; color: var(--accent-strong); }
      p { line-height: 1.6; color: var(--text-muted); }
      .hero { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 20px; }
      .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: var(--surface-alt); color: var(--accent-strong); font-size: 0.85rem; font-weight: 700; }
      .content { display: grid; gap: 20px; grid-template-columns: 1.15fr 0.85fr; }
      .panel { border: 1px solid var(--border-color); border-radius: 18px; padding: 18px; background: var(--surface-alt); }
      .board { display: grid; gap: 8px; grid-template-columns: repeat(${cols}, minmax(0, 1fr)); grid-template-rows: repeat(${board.length}, minmax(0, 1fr)); }
      .cell { display: flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: 1 / 1; border-radius: 12px; background: var(--surface-color); border: 1px solid var(--border-color); font-weight: 700; color: var(--text-primary); cursor: pointer; transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease; }
      .cell:hover, .cell:focus-visible { transform: translateY(-1px); box-shadow: 0 10px 18px rgb(15 23 42 / 0.16); outline: none; }
      .cell.selected { background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-strong) 100%); border-color: var(--accent-strong); box-shadow: inset 0 0 0 2px var(--accent-strong); }
      .cell.found { background: color-mix(in oklab, var(--accent-strong) 24%, var(--surface-color) 76%); border-color: var(--accent-strong); color: var(--text-primary); }
      .status { margin-top: 12px; padding: 10px 12px; border-radius: 12px; background: var(--surface-alt); color: var(--accent-strong); font-weight: 600; }
      .controls { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
      button.action { border: 0; border-radius: 999px; padding: 0.6rem 1rem; font-weight: 700; cursor: pointer; background: var(--accent-strong); color: var(--surface-color); }
      button.secondary { border: 1px solid var(--border-color); border-radius: 999px; padding: 0.6rem 1rem; font-weight: 700; cursor: pointer; background: var(--surface-color); color: var(--text-primary); }
      .word-list { display: grid; gap: 10px; padding: 0; margin: 0; list-style: none; }
      .word-item { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 999px; background: var(--surface-color); border: 1px solid var(--border-color); }
      .word-item.found { background: color-mix(in oklab, var(--accent-strong) 18%, var(--surface-color) 82%); border-color: var(--accent-strong); }
      .word-label { font-weight: 700; color: var(--text-primary); }
      .token-list { display: flex; flex-wrap: wrap; gap: 6px; }
      .token-pill { display: inline-block; padding: 4px 8px; border-radius: 999px; background: var(--surface-alt); border: 1px solid var(--border-color); color: var(--accent-strong); }
      .tooltip {
        position: fixed;
        z-index: 20;
        max-width: 220px;
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--brand-navy);
        color: var(--brand-fg);
        font-size: 0.92rem;
        pointer-events: none;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 120ms ease, transform 120ms ease;
      }
      .tooltip.visible { opacity: 1; transform: translateY(0); }
      @media (max-width: 760px) { .content { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hero">
        <div>
          <span class="badge">PhonoTrail Studio</span>
          <h1>Playable Word Search</h1>
          <p>Select letters in order to find each target word, then check your path. Hover over any phoneme symbol for a pronunciation hint.</p>
        </div>
        <div class="badge">Student Activity</div>
      </div>
      <div class="content">
        <div class="panel">
          <h2>Puzzle Board</h2>
          <div class="board">${boardMarkup}</div>
          <div class="controls">
            <button class="action" type="button" id="checkButton">Check Selection</button>
            <button class="secondary" type="button" id="clearButton">Clear Selection</button>
          </div>
          <div class="status" id="status">Select a path to begin.</div>
        </div>
        <div class="panel">
          <h2>Find These Words</h2>
          <ul class="word-list" id="wordList">${wordMarkup}</ul>
        </div>
      </div>
    </div>
    <div class="tooltip" id="tooltip" aria-hidden="true"></div>
    <script>
      const puzzleData = ${puzzleData};
      const state = { selected: [], foundWords: new Set(puzzleData.words.filter((word) => word.found).map((word) => word.id)), foundCells: new Set() };
      const boardEl = document.querySelector('.board');
      const wordListEl = document.getElementById('wordList');
      const statusEl = document.getElementById('status');
      const tooltipEl = document.getElementById('tooltip');
      const checkButton = document.getElementById('checkButton');
      const clearButton = document.getElementById('clearButton');

      function getHint(token) {
        return token && token.hint ? token.hint : 'Phoneme hint available';
      }

      function isStraightPath(cells) {
        if (cells.length < 2) return true;
        const first = cells[0];
        const second = cells[1];
        const deltaRow = second.row - first.row;
        const deltaCol = second.col - first.col;
        return cells.every((cell, index) => {
          if (index < 2) return true;
          const prev = cells[index - 1];
          return cell.row - prev.row === deltaRow && cell.col - prev.col === deltaCol;
        });
      }

      function getSelectionLetters() {
        return state.selected.map((cell) => puzzleData.board[cell.row][cell.col].symbol).join('');
      }

      function getSelectionReverse() {
        return getSelectionLetters().split('').reverse().join('');
      }

      function render() {
        Array.from(boardEl.querySelectorAll('.cell')).forEach((button) => {
          const row = Number(button.dataset.row);
          const col = Number(button.dataset.col);
          const key = row + '-' + col;
          button.classList.toggle('selected', state.selected.some((cell) => cell.row === row && cell.col === col));
          button.classList.toggle('found', state.foundCells.has(key));
        });

        Array.from(wordListEl.children).forEach((item) => {
          const id = item.dataset.id;
          item.classList.toggle('found', state.foundWords.has(id));
        });
      }

      function highlightPath(cells) {
        cells.forEach((cell) => state.foundCells.add(cell.row + '-' + cell.col));
      }

      function checkSelection() {
        if (state.selected.length < 2) {
          statusEl.textContent = 'Select at least two cells to test a path.';
          return;
        }

        if (!isStraightPath(state.selected)) {
          statusEl.textContent = 'Select cells in a straight line to form a word.';
          state.selected = [];
          render();
          return;
        }

        const letters = getSelectionLetters();
        const reverseLetters = getSelectionReverse();
        const match = puzzleData.words.find((word) => !state.foundWords.has(word.id) && (word.tokens.join('') === letters || word.tokens.join('') === reverseLetters));

        if (match) {
          const path = match.solution && match.solution.length ? match.solution : state.selected;
          highlightPath(path);
          state.foundWords.add(match.id);
          statusEl.textContent = 'Great work — you found ' + match.display + '.';
        } else {
          statusEl.textContent = 'That path did not match a listed word.';
        }

        state.selected = [];
        render();
      }

      boardEl.addEventListener('click', (event) => {
        const button = event.target.closest('.cell');
        if (!button) return;
        const row = Number(button.dataset.row);
        const col = Number(button.dataset.col);
        const key = row + '-' + col;
        if (state.selected.some((cell) => cell.row === row && cell.col === col)) {
          state.selected = state.selected.filter((cell) => !(cell.row === row && cell.col === col));
        } else {
          state.selected = state.selected.concat([{ row, col }]);
        }
        render();
        statusEl.textContent = state.selected.length ? 'Selection updated. Check your path when ready.' : 'Select a path to begin.';
      });

      document.addEventListener('mousemove', (event) => {
        const target = event.target.closest('[data-hint]');
        if (!target) {
          tooltipEl.classList.remove('visible');
          return;
        }
        tooltipEl.textContent = target.dataset.hint || '';
        tooltipEl.classList.add('visible');
        tooltipEl.style.left = event.clientX + 12 + 'px';
        tooltipEl.style.top = event.clientY + 12 + 'px';
      });

      document.addEventListener('mouseleave', () => {
        tooltipEl.classList.remove('visible');
      }, true);

      checkButton.addEventListener('click', checkSelection);
      clearButton.addEventListener('click', () => {
        state.selected = [];
        render();
        statusEl.textContent = 'Selection cleared.';
      });

      render();
    </script>
  </body>
</html>`;
}

export default function WordSearchPage() {
  const [wordInput, setWordInput] = useState(defaultWordInput);
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [board, setBoard] = useState<string[][]>([]);
  const [words, setWords] = useState<PuzzleWord[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("Generate a puzzle to start.");
  const [showAnswers, setShowAnswers] = useState(false);

  const initialPuzzle = useMemo(() => {
    const parsed = parseWords(defaultWordInput);
    return buildPuzzle(parsed, 8, 8);
  }, []);

  const activeBoard = board.length ? board : initialPuzzle.board;
  const activeWords = words.length ? words : initialPuzzle.words;

  const handleGenerate = () => {
    const parsed = parseWords(wordInput);
    if (parsed.length === 0) {
      setFeedback("Please add at least one phoneme word.");
      return;
    }

    const result = buildPuzzle(parsed, rows, cols);
    setBoard(result.board);
    setWords(result.words);
    setSelectedCells([]);
    setFeedback("Puzzle ready. Click cells to trace a word.");
  };

  const handleCellClick = (row: number, col: number) => {
    const key = `${row}-${col}`;
    setSelectedCells((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      return [...current, key];
    });
  };

  const checkSelection = () => {
    if (selectedCells.length < 2) {
      setFeedback("Select at least two cells to test a path.");
      return;
    }

    const selectedLetters = selectedCells
      .map((key) => {
        const [row, col] = key.split("-").map(Number);
        return activeBoard[row][col];
      })
      .join("");

    const match = activeWords.find(
      (word) =>
        !word.found &&
        (word.tokens.join("") === selectedLetters || word.tokens.join("") === selectedLetters.split("").reverse().join(""))
    );

    if (match) {
      setWords((current) => current.map((word) => (word.id === match.id ? { ...word, found: true } : word)));
      setFeedback(`Great work — you found ${match.display}.`);
    } else {
      setFeedback("That path did not match a listed word.");
    }

    setSelectedCells([]);
  };

  const exportHtml = () => {
    const html = buildExportHtml(activeBoard, activeWords);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    const link = document.createElement("a");
    link.href = url;
    link.download = "phonotrail-word-search.html";
    link.click();
    URL.revokeObjectURL(url);
    setFeedback("Styled worksheet exported and opened for review.");
  };

  return (
    <section className="word-search-page" aria-labelledby="word-search-heading">
      <article className="panel" aria-labelledby="word-search-heading">
        <p className="eyebrow">Word Search Builder</p>
        <h2 id="word-search-heading">Build a polished phoneme word search</h2>
        <p>
          Enter a short list of phoneme-based words, choose the grid size, and
          generate a preview that teachers can use as a classroom-ready worksheet.
        </p>

        <div className="word-search-controls">
          <label className="field-stack">
            <span>Words (one per line, phonemes separated by spaces)</span>
            <textarea value={wordInput} onChange={(event) => setWordInput(event.target.value)} rows={6} />
          </label>

          <div className="control-row">
            <label className="field-stack small">
              <span>Rows</span>
              <input type="number" min={6} max={12} value={rows} onChange={(event) => setRows(Number(event.target.value))} />
            </label>
            <label className="field-stack small">
              <span>Columns</span>
              <input type="number" min={6} max={12} value={cols} onChange={(event) => setCols(Number(event.target.value))} />
            </label>
          </div>

          <div className="button-row">
            <button type="button" className="generate-button" onClick={handleGenerate}>
              Generate Puzzle
            </button>
            <button type="button" className="secondary-button" onClick={exportHtml}>
              Export HTML
            </button>
            <button type="button" className="secondary-button" onClick={() => setSelectedCells([])}>
              Clear Selection
            </button>
          </div>

          <p className="status-pill">{feedback}</p>
        </div>
      </article>

      <article className="panel">
        <div className="preview-layout">
          <div>
            <h3>Live Preview</h3>
            <p className="panel-copy">Select cells in order to test a found word, then check your path. Hover any cell for a phoneme hint.</p>
            <div className="toggle-row">
              <input
                type="checkbox"
                id="show-answers"
                checked={showAnswers}
                onChange={(event) => setShowAnswers(event.target.checked)}
              />
              <label htmlFor="show-answers">Show Answers (teacher preview only)</label>
            </div>
            <div className="word-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
              {activeBoard.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  const isSelected = selectedCells.includes(key);
                  const isFound = activeWords.some(
                    (word) => word.found && word.solution.some((item) => item.row === rowIndex && item.col === colIndex)
                  );
                  const isAnswerCell = activeWords.some((word) => word.solution.some((item) => item.row === rowIndex && item.col === colIndex));
                  const isRevealed = showAnswers && isAnswerCell && !isFound;
                  return (
                    <button
                      key={key}
                      type="button"
                      title={getPhonemeHint(cell)}
                      className={`word-cell ${isSelected ? "selected" : ""} ${isFound ? "found" : ""} ${isRevealed ? "revealed" : ""}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3>Word List</h3>
            <div className="word-list">
              {activeWords.map((word) => (
                <span key={word.id} className={`word-token-group ${word.found ? "found" : ""}`}>
                  {word.tokens.map((token, tokenIndex) => (
                    <span key={`${word.id}-${tokenIndex}`} className="token-chip" title={getPhonemeHint(token)}>
                      {token}
                    </span>
                  ))}
                </span>
              ))}
            </div>
            <div className="button-row top-gap">
              <button type="button" className="generate-button" onClick={checkSelection}>
                Check Selection
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
