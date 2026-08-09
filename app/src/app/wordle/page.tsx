"use client";

import { useState } from "react";

type KeyState = "correct" | "present" | "absent" | "unknown";

type GuessResult = {
  tokens: string[];
  result: Array<"correct" | "present" | "absent">;
};

const DEFAULT_TARGET = "ʃ ɪ p";
const DEFAULT_ENGLISH = "ship";
const DEFAULT_CLUE = "A vessel that travels on water.";

const DIFFICULTY_OPTIONS = [
  { label: "Easy", guesses: 8 },
  { label: "Normal", guesses: 6 },
  { label: "Hard", guesses: 4 },
] as const;

// Priority for upgrading key state: correct > present > absent > unknown
const KEY_PRIORITY: Record<KeyState, number> = { correct: 3, present: 2, absent: 1, unknown: 0 };

// HCE (Australian English) strict phoneme corpus
const PHONEME_HINTS: Record<string, string> = {
  "iː": "long EE (as in see)",
  "ɪ": "short I (as in sit)",
  "e": "short E (as in bed)",
  "eː": "long E (as in face — HCE)",
  "æ": "short A (as in cat)",
  "ɐ": "schwa-A (as in about)",
  "ɐː": "long A (as in start)",
  "ɜː": "ER (as in bird)",
  "ʉː": "long OO (as in food)",
  "ɔ": "short AW (as in dog)",
  "oː": "long O (as in thought)",
  "ʊ": "short OO (as in book)",
  "ə": "schwa (unstressed vowel)",
  "æɪ": "AY (as in face — HCE)",
  "ɑe": "EYE (as in price — HCE)",
  "oɪ": "OY (as in choice)",
  "əʉ": "OH (as in goat — HCE)",
  "æɔ": "OW (as in mouth — HCE)",
  "ɪə": "EAR (as in near)",
  "p": "P (as in pat)",
  "t": "T (as in tap)",
  "k": "K (as in cat)",
  "b": "B (as in bat)",
  "d": "D (as in dog)",
  "g": "G (as in go)",
  "n": "N (as in net)",
  "m": "M (as in map)",
  "ŋ": "NG (as in sing)",
  "f": "F (as in fish)",
  "s": "S (as in sun)",
  "θ": "TH (as in thin)",
  "ʃ": "SH (as in ship)",
  "v": "V (as in van)",
  "z": "Z (as in zoo)",
  "ð": "TH (as in this)",
  "ʒ": "ZH (as in vision)",
  "l": "L (as in lamp)",
  "ɹ": "R (as in run)",
  "w": "W (as in wet)",
  "j": "Y (as in yes)",
  "h": "H (as in hat)",
  "tʃ": "CH (as in chin)",
  "dʒ": "J (as in jam)",
};

const PHONEME_KEYBOARD: Array<{ label: string; keys: string[] }> = [
  { label: "Vowels", keys: ["iː", "ɪ", "e", "eː", "æ", "ɐ", "ɐː", "ɜː", "ʉː", "ɔ", "oː", "ʊ", "ə"] },
  { label: "Diphthongs", keys: ["æɪ", "ɑe", "oɪ", "əʉ", "æɔ", "ɪə"] },
  { label: "Consonants", keys: ["p", "t", "k", "b", "d", "g", "n", "m", "ŋ", "f", "s", "θ", "ʃ", "v", "z", "ð", "ʒ", "l", "ɹ", "w", "j", "h", "tʃ", "dʒ"] },
];

function getPhonemeHint(token: string): string {
  return PHONEME_HINTS[token] ?? `Phoneme: ${token}`;
}

function parseTargetTokens(value: string): string[] {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 ? tokens : DEFAULT_TARGET.split(" ");
}

function evaluateGuess(
  guessTokens: string[],
  targetTokens: string[]
): Array<"correct" | "present" | "absent"> {
  const result: Array<"correct" | "present" | "absent"> = Array(guessTokens.length).fill("absent");
  const used = Array(targetTokens.length).fill(false);

  guessTokens.forEach((token, i) => {
    if (token === targetTokens[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  });

  guessTokens.forEach((token, i) => {
    if (result[i] === "correct") return;
    const j = targetTokens.findIndex((t, ti) => t === token && !used[ti]);
    if (j >= 0) {
      result[i] = "present";
      used[j] = true;
    }
  });

  return result;
}

function buildExportHtml(target: string, english: string, clue: string, maxGuesses: number) {
  const targetTokens = parseTargetTokens(target);
  const hintsJson = JSON.stringify(PHONEME_HINTS);
  const targetTokensJson = JSON.stringify(targetTokens);

  const kbdSections = PHONEME_KEYBOARD.map((section) => {
    const keys = section.keys.map((sym) => {
      const hint = getPhonemeHint(sym).replace(/"/g, "&quot;");
      return `<button class="phoneme-key" type="button" data-sym="${sym}" title="${hint}" aria-label="${sym} â€” ${hint}">${sym}</button>`;
    }).join("");
    return `<div class="phoneme-section"><span class="section-label">${section.label}</span><div class="phoneme-row">${keys}</div></div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PhonoTrail Studio â€” Wordle</title>
    <style>
      :root { --bg: #f8fafc; --surface: #fff; --border: #e2e8f0; --text: #0f172a; --muted: #64748b; --accent: #eab308; --accent-str: #ca8a04; --success: #15803d; --neutral: #94a3b8; --navy: #0f172a; }
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; background: var(--bg); color: var(--text); padding: 20px; }
      .sheet { max-width: 620px; margin: 0 auto; background: var(--surface); border-radius: 20px; padding: 24px; border: 1px solid var(--border); box-shadow: 0 12px 32px rgba(15,23,42,.1); }
      .hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
      .badge { padding: 4px 10px; border-radius: 999px; background: var(--navy); color: #fff; font-size: .75rem; font-weight: 700; }
      h1 { margin: 0; color: var(--navy); font-size: 1.35rem; }
      p { margin: 0 0 10px; line-height: 1.5; color: var(--muted); }
      .clue-panel { border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; background: var(--bg); margin-bottom: 14px; }
      .clue-panel strong { display: block; font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin-bottom: 4px; }
      .clue-panel p { margin: 0; color: var(--text); }
      .board { display: flex; flex-direction: column; gap: 6px; align-items: center; margin-bottom: 12px; }
      .board-row { display: flex; gap: 6px; }
      .tile { display: flex; align-items: center; justify-content: center; min-width: 52px; height: 52px; padding: 0 6px; border-radius: 10px; border: 2px solid var(--border); background: var(--surface); font-weight: 800; font-size: 1rem; transition: background 180ms, border-color 180ms; }
      .tile.current { border-color: var(--navy); }
      .tile.correct { background: var(--success); border-color: var(--success); color: #fff; }
      .tile.present { background: var(--accent-str); border-color: var(--accent-str); color: #fff; }
      .tile.absent  { background: var(--neutral); border-color: var(--neutral); color: #fff; }
      #status { text-align: center; padding: 8px 14px; border-radius: 10px; background: var(--bg); border: 1px solid var(--border); font-weight: 600; margin-bottom: 12px; color: var(--text); }
      .answer-panel { border: 2px solid var(--success); border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; background: rgba(21,128,61,.07); display: none; }
      .answer-panel strong { color: var(--success); display: block; margin-bottom: 4px; }
      .answer-panel p { margin: 0; }
      .kbd { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
      .phoneme-section { display: flex; flex-direction: column; gap: 4px; }
      .section-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 700; }
      .phoneme-row { display: flex; flex-wrap: wrap; gap: 4px; }
      .phoneme-key { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; padding: 7px 8px; border: 1px solid var(--border); border-radius: 7px; background: #e2e8f0; color: var(--text); font-weight: 700; font-size: .9rem; cursor: pointer; transition: background 80ms; }
      .phoneme-key:hover { background: #cbd5e1; }
      .phoneme-key.correct { background: var(--success); border-color: var(--success); color: #fff; }
      .phoneme-key.present { background: var(--accent-str); border-color: var(--accent-str); color: #fff; }
      .phoneme-key.absent  { background: var(--neutral); border-color: var(--neutral); color: #fff; }
      .actions { display: flex; gap: 8px; }
      .btn-enter { background: var(--navy); color: #fff; border: 0; border-radius: 999px; padding: 8px 18px; font: inherit; font-weight: 700; cursor: pointer; }
      .btn-enter:hover { background: #1e293b; }
      .btn-back { background: #e2e8f0; color: var(--text); border: 1px solid var(--border); border-radius: 999px; padding: 8px 14px; font: inherit; font-weight: 700; cursor: pointer; }
      .tooltip { position: fixed; z-index: 20; max-width: 200px; padding: 6px 10px; border-radius: 8px; background: var(--navy); color: #fff; font-size: .82rem; pointer-events: none; opacity: 0; transition: opacity 120ms; }
      .tooltip.visible { opacity: 1; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hdr"><span class="badge">PhonoTrail Studio</span><h1>Phoneme Wordle</h1></div>
      <div class="clue-panel"><strong>Clue</strong><p>${clue.replace(/</g, "&lt;").replace(/&/g, "&amp;")}</p></div>
      <div class="board" id="board"></div>
      <p id="status" aria-live="polite">Click phoneme keys to begin.</p>
      <div class="answer-panel" id="answerPanel"><strong>Answer</strong><p>${targetTokens.join(" ")} &mdash; ${english}</p></div>
      <div class="kbd">${kbdSections}</div>
      <div class="actions">
        <button class="btn-enter" id="enterBtn" type="button">Enter</button>
        <button class="btn-back" id="backBtn" type="button">⌫</button>
      </div>
    </div>
    <div class="tooltip" id="tooltip" aria-hidden="true"></div>
    <script>
      var TARGET = ${targetTokensJson};
      var ENGLISH = ${JSON.stringify(english)};
      var MAX = ${maxGuesses};
      var HINTS = ${hintsJson};
      var PRIO = { correct: 3, present: 2, absent: 1, unknown: 0 };

      var guesses = [], current = [], keyStates = {}, over = false;

      var boardEl = document.getElementById('board');
      for (var r = 0; r < MAX; r++) {
        var row = document.createElement('div');
        row.className = 'board-row';
        for (var c = 0; c < TARGET.length; c++) {
          var tile = document.createElement('div');
          tile.className = 'tile';
          tile.id = 't' + r + '_' + c;
          row.appendChild(tile);
        }
        boardEl.appendChild(row);
      }

      function hint(tok) { return HINTS[tok] || 'Phoneme: ' + tok; }

      function renderCurrent() {
        var ri = guesses.length;
        if (ri >= MAX) return;
        for (var c = 0; c < TARGET.length; c++) {
          var tile = document.getElementById('t' + ri + '_' + c);
          var tok = current[c];
          tile.textContent = tok || '';
          tile.className = tok ? 'tile current' : 'tile';
          if (tok) tile.dataset.hint = hint(tok); else delete tile.dataset.hint;
        }
      }

      function evalGuess(g, t) {
        var res = g.map(function() { return 'absent'; }), used = t.map(function() { return false; });
        g.forEach(function(x, i) { if (x === t[i]) { res[i] = 'correct'; used[i] = true; } });
        g.forEach(function(x, i) {
          if (res[i] === 'correct') return;
          var j = t.findIndex(function(y, ti) { return y === x && !used[ti]; });
          if (j >= 0) { res[i] = 'present'; used[j] = true; }
        });
        return res;
      }

      function updateKeys(g, res) {
        g.forEach(function(tok, i) {
          var ns = res[i], ex = keyStates[tok] || 'unknown';
          if ((PRIO[ns] || 0) > (PRIO[ex] || 0)) keyStates[tok] = ns;
        });
        document.querySelectorAll('.phoneme-key[data-sym]').forEach(function(btn) {
          var s = keyStates[btn.dataset.sym];
          btn.className = 'phoneme-key' + (s && s !== 'unknown' ? ' ' + s : '');
        });
      }

      function submit() {
        if (over || current.length !== TARGET.length) return;
        var ri = guesses.length, res = evalGuess(current, TARGET);
        res.forEach(function(s, c) {
          var tile = document.getElementById('t' + ri + '_' + c);
          tile.className = 'tile ' + s;
          tile.dataset.hint = hint(current[c]);
        });
        updateKeys(current, res);
        guesses.push(current.slice());
        current = [];
        var st = document.getElementById('status');
        if (res.every(function(s) { return s === 'correct'; })) {
          over = true;
          st.textContent = 'Correct! ' + TARGET.join(' ') + ' \u2014 ' + ENGLISH + '.';
          document.getElementById('answerPanel').style.display = 'block';
          return;
        }
        if (guesses.length >= MAX) {
          over = true;
          st.textContent = 'The answer was ' + TARGET.join(' ') + ' (' + ENGLISH + ').';
          document.getElementById('answerPanel').style.display = 'block';
          return;
        }
        var left = MAX - guesses.length;
        st.textContent = left + ' guess' + (left === 1 ? '' : 'es') + ' remaining.';
        renderCurrent();
      }

      document.querySelector('.kbd').addEventListener('click', function(e) {
        if (over) return;
        var btn = e.target.closest('.phoneme-key[data-sym]');
        if (!btn || current.length >= TARGET.length) return;
        current.push(btn.dataset.sym);
        renderCurrent();
        var left = TARGET.length - current.length;
        document.getElementById('status').textContent = left > 0
          ? left + ' more phoneme' + (left === 1 ? '' : 's') + ' needed.'
          : 'Press Enter to submit.';
      });

      document.getElementById('enterBtn').addEventListener('click', submit);
      document.getElementById('backBtn').addEventListener('click', function() {
        if (over) return;
        current.pop();
        renderCurrent();
        var left = TARGET.length - current.length;
        document.getElementById('status').textContent = left < TARGET.length
          ? left + ' more phoneme' + (left === 1 ? '' : 's') + ' needed.'
          : 'Click phoneme keys to begin.';
      });

      var tt = document.getElementById('tooltip');
      document.addEventListener('mousemove', function(e) {
        var el = e.target.closest('[data-hint]') || e.target.closest('[title]');
        if (!el) { tt.classList.remove('visible'); return; }
        var text = el.dataset.hint || el.getAttribute('title') || '';
        if (!text) { tt.classList.remove('visible'); return; }
        tt.textContent = text;
        tt.classList.add('visible');
        tt.style.left = (e.clientX + 14) + 'px';
        tt.style.top = Math.max(0, e.clientY - 40) + 'px';
      });

      renderCurrent();
    </script>
  </body>
</html>`;
}

export default function WordlePage() {
  const [targetWord, setTargetWord] = useState(DEFAULT_TARGET);
  const [englishWord, setEnglishWord] = useState(DEFAULT_ENGLISH);
  const [clue, setClue] = useState(DEFAULT_CLUE);
  const [difficulty, setDifficulty] = useState(1);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});
  const [feedback, setFeedback] = useState("Click phoneme keys to begin your first guess.");
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [showAnswer, setShowAnswer] = useState(false);

  const targetTokens = parseTargetTokens(targetWord);
  const targetLength = targetTokens.length;
  const maxGuesses = DIFFICULTY_OPTIONS[difficulty].guesses;
  const isActive = gameState === "playing";

  const resetGameState = () => {
    setGuesses([]);
    setCurrentInput([]);
    setKeyStates({});
    setGameState("playing");
    setShowAnswer(false);
    setFeedback("Click phoneme keys to begin your first guess.");
  };

  const handleTargetWordChange = (value: string) => {
    setTargetWord(value);
    resetGameState();
  };

  const handleDifficultyChange = (index: number) => {
    setDifficulty(index);
    resetGameState();
  };

  const appendTokenToTarget = (sym: string) => {
    const newValue = targetWord.trimEnd() + (targetWord.trim() ? " " : "") + sym;
    handleTargetWordChange(newValue);
  };

  const deleteTokenFromTarget = () => {
    const tokens = parseTargetTokens(targetWord);
    handleTargetWordChange(tokens.slice(0, -1).join(" "));
  };

  const appendToken = (sym: string) => {
    if (!isActive) return;
    setCurrentInput((prev) => {
      if (prev.length >= targetLength) return prev;
      const next = [...prev, sym];
      const remaining = targetLength - next.length;
      setFeedback(remaining > 0 ? `${remaining} more phoneme${remaining !== 1 ? "s" : ""} needed.` : "Press Enter to submit.");
      return next;
    });
  };

  const deleteToken = () => {
    if (!isActive) return;
    setCurrentInput((prev) => {
      const next = prev.slice(0, -1);
      setFeedback(next.length === 0 ? "Click phoneme keys to begin your first guess." : "Click phoneme keys to build your guess.");
      return next;
    });
  };

  const submitGuess = () => {
    if (!isActive || currentInput.length !== targetLength) return;

    const result = evaluateGuess(currentInput, targetTokens);
    const nextGuesses = [...guesses, { tokens: [...currentInput], result }];
    setGuesses(nextGuesses);
    setCurrentInput([]);

    setKeyStates((prev) => {
      const next = { ...prev };
      currentInput.forEach((tok, i) => {
        const newState = result[i] as KeyState;
        const existing = prev[tok] ?? "unknown";
        if ((KEY_PRIORITY[newState] ?? 0) > (KEY_PRIORITY[existing] ?? 0)) {
          next[tok] = newState;
        }
      });
      return next;
    });

    if (result.every((s) => s === "correct")) {
      setGameState("won");
      setFeedback(`Correct! ${targetTokens.join(" ")} â€” ${englishWord}.`);
      return;
    }

    if (nextGuesses.length >= maxGuesses) {
      setGameState("lost");
      setFeedback(`No more guesses. The answer was ${targetTokens.join(" ")} (${englishWord}).`);
      return;
    }

    const left = maxGuesses - nextGuesses.length;
    setFeedback(`${left} guess${left !== 1 ? "es" : ""} remaining.`);
  };

  const exportHtml = () => {
    const html = buildExportHtml(targetWord, englishWord, clue, maxGuesses);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    const link = document.createElement("a");
    link.href = url;
    link.download = "phonotrail-wordle.html";
    link.click();
    URL.revokeObjectURL(url);
    setFeedback("Exported a standalone playable HTML Wordle.");
  };

  return (
    <section className="wordle-page" aria-labelledby="wordle-heading">
      <article className="panel" aria-labelledby="wordle-heading">
        <p className="eyebrow">Wordle Builder</p>
        <h2 id="wordle-heading">Build a phoneme Wordle activity</h2>
        <p>
          Enter the target word as space-separated HCE phoneme tokens - e.g.{" "}
          <strong>ʃ ɪ p</strong> for &ldquo;ship&rdquo;. Use the keyboard below to compose it.
        </p>

        <div className="wordle-layout">
          <div className="wordle-stack">
            <div className="field-stack">
              <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Phoneme word (space-separated tokens)</span>
              <div className="phoneme-word-display" aria-live="polite">
                {parseTargetTokens(targetWord).length > 0
                  ? parseTargetTokens(targetWord).map((tok, i) => (
                      <span key={i} className="phoneme-token-chip" title={getPhonemeHint(tok)} aria-label={`${tok} â€” ${getPhonemeHint(tok)}`}>{tok}</span>
                    ))
                  : <span className="phoneme-token-placeholder">Click keys below to add phonemes</span>
                }
              </div>
              <div className="phoneme-kbd" aria-label="Phoneme keyboard for target word">
                {PHONEME_KEYBOARD.map((section) => (
                  <div key={section.label}>
                    <p className="phoneme-section-label">{section.label}</p>
                    <div className="phoneme-row">
                      {section.keys.map((sym) => (
                        <button key={sym} type="button" className="phoneme-key" title={getPhonemeHint(sym)} aria-label={`${sym} â€” ${getPhonemeHint(sym)}`} onClick={() => appendTokenToTarget(sym)}>{sym}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="phoneme-row" style={{ marginTop: "0.4rem" }}>
                  <button type="button" className="phoneme-key phoneme-key--back" onClick={deleteTokenFromTarget} aria-label="Delete last phoneme token">⌫</button>
                </div>
              </div>
            </div>

            <label className="field-stack">
              <span>English equivalent</span>
              <input type="text" value={englishWord} onChange={(e) => setEnglishWord(e.target.value)} placeholder="e.g. ship" />
            </label>

            <label className="field-stack">
              <span>Teacher clue</span>
              <textarea rows={3} value={clue} onChange={(e) => setClue(e.target.value)} />
            </label>

            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem" }}>Difficulty</legend>
              <div className="button-row">
                {DIFFICULTY_OPTIONS.map((opt, index) => (
                  <button key={opt.label} type="button" className={difficulty === index ? "generate-button" : "secondary-button"} onClick={() => handleDifficultyChange(index)}>
                    {opt.label} ({opt.guesses})
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="button-row top-gap">
            <button type="button" className="secondary-button" onClick={resetGameState}>Reset Game</button>
            <button type="button" className="secondary-button" onClick={exportHtml}>Export HTML</button>
          </div>
        </div>
      </article>

      <article className="panel">
        <h3>Live Preview</h3>
        <p className="panel-copy">
          Click phoneme keys to fill the active row, then press <strong>Enter</strong> to submit. Hover tiles for pronunciation hints.
        </p>

        <div className="preview-layout">
          <div>
            <div className="wordle-stack top-gap">
              {Array.from({ length: maxGuesses }, (_, rowIndex) => {
                const committed = guesses[rowIndex];
                const isActiveRow = rowIndex === guesses.length && isActive;
                return (
                  <div key={`row-${rowIndex}`} className="wordle-row" style={{ gridTemplateColumns: `repeat(${targetLength}, minmax(0, 1fr))` }}>
                    {Array.from({ length: targetLength }, (_, colIndex) => {
                      let token = "";
                      let state = "empty";
                      let hint = "";
                      if (committed) {
                        token = committed.tokens[colIndex] ?? "";
                        state = committed.result[colIndex] ?? "absent";
                        hint = token ? getPhonemeHint(token) : "";
                      } else if (isActiveRow) {
                        token = currentInput[colIndex] ?? "";
                        state = token ? "current" : "empty";
                        hint = token ? getPhonemeHint(token) : "";
                      }
                      return (
                        <div key={`${rowIndex}-${colIndex}`} className={`wordle-tile ${state}`} title={hint || undefined} aria-label={hint ? `${token} â€” ${hint}` : undefined}>
                          {token}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <p className="wordle-status" aria-live="polite">{feedback}</p>
          </div>

          <div className="wordle-stack">
            <div className="wordle-preview">
              <strong>Teacher support</strong>
              <p>{clue}</p>
              <p className="top-gap" style={{ fontSize: "0.85rem" }}>
                {targetLength} phoneme{targetLength !== 1 ? "s" : ""} Â· {maxGuesses} guesses Â· {DIFFICULTY_OPTIONS[difficulty].label}
              </p>
            </div>
            <div className="wordle-preview">
              <strong>Answer view</strong>
              {showAnswer ? (
                <>
                  <p>Phonemes: <strong>{targetWord}</strong></p>
                  <p>English: <strong>{englishWord}</strong></p>
                </>
              ) : (
                <p>Toggle to reveal the solution and English equivalent.</p>
              )}
            </div>
            {gameState === "won" && (
              <div className="wordle-preview" style={{ borderColor: "var(--success-color)" }}>
                <strong style={{ color: "var(--success-color)" }}>Solved</strong>
                <p>{targetWord} â€” <strong>{englishWord}</strong></p>
              </div>
            )}
            <div className="button-row">
              <button type="button" className="secondary-button" onClick={() => setShowAnswer((v) => !v)}>
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </button>
            </div>
          </div>
        </div>

        <div className="phoneme-kbd top-gap" aria-label="Phoneme game keyboard">
          {PHONEME_KEYBOARD.map((section) => (
            <div key={section.label}>
              <p className="phoneme-section-label">{section.label}</p>
              <div className="phoneme-row">
                {section.keys.map((sym) => {
                  const ks = keyStates[sym] ?? "unknown";
                  return (
                    <button
                      key={sym}
                      type="button"
                      className={`phoneme-key phoneme-key--game${ks !== "unknown" ? ` phoneme-key--${ks}` : ""}`}
                      title={getPhonemeHint(sym)}
                      aria-label={`${sym} â€” ${getPhonemeHint(sym)}`}
                      onClick={() => appendToken(sym)}
                      disabled={!isActive}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="phoneme-row" style={{ marginTop: "0.5rem" }}>
            <button type="button" className="generate-button" onClick={submitGuess} disabled={!isActive || currentInput.length !== targetLength} aria-label="Submit guess">
              Enter
            </button>
            <button type="button" className="secondary-button" onClick={deleteToken} disabled={!isActive} aria-label="Delete last phoneme">
              ⌫
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
