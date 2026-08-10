(function () {
  "use strict";

  const MAX_MISTAKES = 4;

  /* ============== GATE (photo verification) ============== */

  const gateScreen = document.getElementById("gate-screen");
  const gameScreen = document.getElementById("game-screen");
  const photoGrid = document.getElementById("photo-grid");
  const gateFeedbackMain = document.getElementById("gate-feedback-main");
  const gateFeedbackSub = document.getElementById("gate-feedback-sub");
  document.getElementById("gate-prompt").textContent = CONFIG.gate.prompt;
  document.getElementById("gate-subprompt").textContent = CONFIG.gate.subPrompt || "";

  let gateLocked = false; // true once verified, to ignore further clicks

  renderPhotoGrid();

  function renderPhotoGrid() {
    photoGrid.innerHTML = "";
    // shuffle a copy so the correct photo isn't always in the same spot
    const shuffled = [...CONFIG.gate.photos];
    shuffleArray(shuffled);
    shuffled.forEach((photo) => {
      const btn = document.createElement("button");
      btn.className = "photo-tile";
      btn.type = "button";
      const img = document.createElement("img");
      img.src = photo.file;
      img.alt = photo.alt || "";
      btn.appendChild(img);
      btn.addEventListener("click", () => onPhotoClick(photo.file, btn));
      photoGrid.appendChild(btn);
    });
  }

  function onPhotoClick(file, tile) {
    if (gateLocked) return;

    if (file === CONFIG.gate.correctPhoto) {
      gateLocked = true;
      [...photoGrid.querySelectorAll(".photo-tile")].forEach((t) => {
        if (t !== tile) t.disabled = true;
      });
      tile.classList.add("correct");
      gateFeedbackMain.textContent = CONFIG.gate.correctHeading || "";
      gateFeedbackMain.classList.add("success");
      gateFeedbackSub.textContent = CONFIG.gate.correctSubtext || "";
      setTimeout(() => {
        gateScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        initGame();
      }, 2000);
    } else {
      tile.classList.remove("wrong");
      void tile.getBoundingClientRect();
      tile.classList.add("wrong");
      gateFeedbackMain.textContent = CONFIG.gate.wrongMessage;
      gateFeedbackSub.textContent = "";
    }
  }

  /* ============== GAME ============== */

  let words = []; // { word, difficulty, catIndex }
  let selected = []; // array of word strings
  let solvedDifficulties = new Set();
  let mistakesLeft = MAX_MISTAKES;
  let guessedCombos = new Set();

  const tileGrid = document.getElementById("tile-grid");
  const solvedGroupsEl = document.getElementById("solved-groups");
  const mistakeDotsEl = document.getElementById("mistake-dots");
  const submitBtn = document.getElementById("submit-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const deselectBtn = document.getElementById("deselect-btn");
  const toastEl = document.getElementById("toast");

  function initGame() {
    document.getElementById("game-title").textContent = CONFIG.title;
    document.getElementById("game-subtitle").textContent = CONFIG.subtitle;

    words = [];
    let nextId = 0;
    CONFIG.categories.forEach((cat, catIndex) => {
      cat.words.forEach((w) => {
        words.push({ id: nextId++, word: w, difficulty: cat.difficulty, catIndex });
      });
    });

    shuffleArray(words);
    renderMistakeDots();
    renderTiles();

    shuffleBtn.addEventListener("click", () => {
      shuffleArray(words);
      renderTiles();
    });
    deselectBtn.addEventListener("click", () => {
      selected = [];
      renderTiles();
    });
    submitBtn.addEventListener("click", onSubmit);
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function renderTiles() {
    tileGrid.innerHTML = "";
    words
      .filter((item) => !solvedDifficulties.has(item.difficulty))
      .forEach((item) => {
        const btn = document.createElement("button");
        btn.className = "tile";
        btn.type = "button";
        btn.textContent = item.word;
        if (selected.includes(item.id)) {
          btn.classList.add("selected");
        }
        btn.addEventListener("click", () => onTileClick(item.id));
        tileGrid.appendChild(btn);
      });
    submitBtn.disabled = selected.length !== 4;
  }

  function onTileClick(id) {
    if (selected.includes(id)) {
      selected = selected.filter((x) => x !== id);
    } else {
      if (selected.length >= 4) return;
      selected.push(id);
    }
    renderTiles();
  }

  function renderMistakeDots() {
    mistakeDotsEl.innerHTML = "";
    for (let i = 0; i < MAX_MISTAKES; i++) {
      const dot = document.createElement("span");
      dot.className = "dot" + (i < MAX_MISTAKES - mistakesLeft ? " used" : "");
      mistakeDotsEl.appendChild(dot);
    }
  }

  function showToast(msg, ms) {
    toastEl.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.textContent = "";
    }, ms || 1600);
  }

  function onSubmit() {
    if (selected.length !== 4) return;

    const comboKey = [...selected].sort((a, b) => a - b).join("|");
    if (guessedCombos.has(comboKey)) {
      showToast("Already guessed!");
      return;
    }
    guessedCombos.add(comboKey);

    const items = selected.map((id) => words.find((x) => x.id === id));
    const catIndexes = new Set(items.map((i) => i.catIndex));

    if (catIndexes.size === 1) {
      // Correct!
      const catIndex = [...catIndexes][0];
      const cat = CONFIG.categories[catIndex];
      solvedDifficulties.add(cat.difficulty);
      selected = [];
      renderSolvedGroups();
      renderTiles();
      checkWin();
    } else {
      mistakesLeft = Math.max(0, mistakesLeft - 1);
      renderMistakeDots();

      const counts = {};
      catIndexes.forEach((ci) => {
        counts[ci] = items.filter((i) => i.catIndex === ci).length;
      });
      const oneAway = Object.values(counts).some((c) => c === 3);

      shakeSelectedTiles();
      showToast(oneAway ? "One away..." : "Not quite!");
    }
  }

  function shakeSelectedTiles() {
    const tiles = [...tileGrid.querySelectorAll(".tile.selected")];
    tiles.forEach((t) => t.classList.add("shake"));
    setTimeout(() => tiles.forEach((t) => t.classList.remove("shake")), 400);
  }

  function renderSolvedGroups() {
    // solvedDifficulties is a Set, which iterates in insertion order —
    // so groups appear in the order they were actually solved, not a fixed order.
    solvedGroupsEl.innerHTML = "";
    [...solvedDifficulties].forEach((d) => {
      const cat = CONFIG.categories.find((c) => c.difficulty === d);
      const div = document.createElement("div");
      div.className = "solved-group " + d;
      div.innerHTML =
        '<div class="cat-name">' + escapeHtml(cat.name) + "</div>" +
        '<div class="cat-words">' + cat.words.map(escapeHtml).join(", ") + "</div>";
      solvedGroupsEl.appendChild(div);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function checkWin() {
    if (solvedDifficulties.size === CONFIG.categories.length) {
      setTimeout(showWinPanel, 500);
    }
  }

  function showWinPanel() {
    document.getElementById("win-heading").textContent = CONFIG.winMessage.heading;
    document.getElementById("win-body").textContent = CONFIG.winMessage.body;
    document.getElementById("win-stats").textContent =
      "Solved with " + (MAX_MISTAKES - mistakesLeft) + " mistake" +
      (MAX_MISTAKES - mistakesLeft === 1 ? "" : "s") + ".";

    // Replace the mistake row + controls with the win panel, so all
    // solved categories stay visible above it (good for a screenshot).
    document.querySelector(".mistake-row").classList.add("hidden");
    document.querySelector(".controls").classList.add("hidden");
    document.getElementById("win-panel").classList.remove("hidden");
  }
})();
