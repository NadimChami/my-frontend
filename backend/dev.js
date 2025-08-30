function goToPage(idOrIdx) {
  const idx = typeof idOrIdx === 'number' ? idOrIdx : pages.indexOf(idOrIdx);

  if (idx >= 0 && idx < pages.length) {
    currentPageIndex = idx;
    const currentPageId = pages[idx];

    // Show the page
    showPage(currentPageId);

    // Determine current task name based on page ID
    let taskName = '';

    if (currentPageId.startsWith('page-welcome')) {
      taskName = 'welcome';
    } else if (currentPageId.startsWith('page-volume')) {
      taskName = 'volume-check';
    } else if (currentPageId.startsWith('page-language')) {
      taskName = 'language-selection';
    } else if (currentPageId.startsWith('page-eligibility')) {
      taskName = 'age';
    } else if (currentPageId.startsWith('page-parent-consent')) {
      taskName = 'parent-consent';
    } else if (currentPageId.startsWith('page-youth-assent')) {
      taskName = 'youth-assent';
    } else if (currentPageId.startsWith('page-adult-consent')) {
      taskName = 'adult-consent';
    } else if (currentPageId.startsWith('page-conditions')) {
      taskName = 'conditions-check';
    } else if (currentPageId.startsWith('page-ineligible')) {
      taskName = 'ineligible-screen';
    } else if (currentPageId.startsWith('page-gender')) {
      taskName = 'demographics-gender';
    }
    else if (currentPageId.startsWith('page-adhd-') || currentPageId === 'page-adhd-instr') {
      taskName = 'adhd-survey';
    }

    else if (currentPageId.startsWith('page-attn-')) {
      taskName = 'attention';
    }

    else if (currentPageId.startsWith('page-grid-')) {
      taskName = 'grid-memory';
    }

    else if (currentPageId.startsWith('page-word-')) {
      taskName = 'word-recall';
    }

    else if (currentPageId.startsWith('page-icar-') || currentPageId === 'page-icar-intro') {
      taskName = 'icar';
    }

    else if (currentPageId.startsWith('page-odd-') || currentPageId === 'page-odd-intro') {
      taskName = 'odd-one-out';
    }

    else if (currentPageId.startsWith('page-symbol-') || currentPageId === 'page-symbol-instr') {
      taskName = 'symbol-search';
    }

    else if (currentPageId.startsWith('page-magnitude-') || currentPageId === 'page-magnitude-instr') {
      taskName = 'magnitude-comparison';
    }

    else if (currentPageId === 'page-tasks-intro' || 
             currentPageId === 'page-memory-intro' || 
             currentPageId === 'page-brain-intro') {
      taskName = 'task-intro';
    }

    else if (currentPageId === 'page-post-survey') {
      taskName = 'post-survey';
    }

    else if (currentPageId === 'page-final-thankyou') {
      taskName = 'final';
    }

    // Store the current page and task in localStorage
    localStorage.setItem('lastPageId', currentPageId);
    localStorage.setItem('lastTaskName', taskName);
  }
}


function getFirstPageOfTask(taskName) {
  switch (taskName) {
    case 'intro':
      return 'page-welcome';

    case 'adhd-survey':
      return 'page-adhd-instr';

    case 'attention':
      return 'page-attn-instr';

    case 'grid-memory':
      return 'page-grid-instr';

    case 'word-recall':
      return 'page-word-instr';

    case 'icar':
      return 'page-icar-intro';

    case 'odd-one-out':
      return 'page-odd-intro';

    case 'symbol-search':
      return 'page-symbol-instr';

    case 'magnitude-comparison':
      return 'page-magnitude-instr';

    case 'task-intro':
      return 'page-tasks-intro';

    case 'post-survey':
      return 'page-post-survey';

    case 'final':
      return 'page-final-thankyou';

    default:
      return 'page-welcome'; // fallback
  }
}





































function goToPage(idOrIdx) {
  const idx = typeof idOrIdx === 'number' ? idOrIdx : pages.indexOf(idOrIdx);
  
  if (idx >= 0 && idx < pages.length) {
    currentPageIndex = idx;
    const currentPageId = pages[idx];

    // Show the page
    showPage(currentPageId);

    // Determine current task name based on page ID
    let taskName = '';

    if (currentPageId.startsWith('page-welcome') || 
        currentPageId.startsWith('page-volume') ||
        currentPageId.startsWith('page-language') ||
        currentPageId.startsWith('page-eligibility') ||
        currentPageId.startsWith('page-parent-consent') ||
        currentPageId.startsWith('page-youth-assent') ||
        currentPageId.startsWith('page-adult-consent') ||
        currentPageId.startsWith('page-conditions') ||
        currentPageId.startsWith('page-ineligible') ||
        currentPageId.startsWith('page-gender')) {
      taskName = 'intro';
    }

    else if (currentPageId.startsWith('page-adhd-') || currentPageId === 'page-adhd-instr') {
      taskName = 'adhd-survey';
    }

    else if (currentPageId.startsWith('page-attn-')) {
      taskName = 'attention';
    }

    else if (currentPageId.startsWith('page-grid-')) {
      taskName = 'grid-memory';
    }

    else if (currentPageId.startsWith('page-word-')) {
      taskName = 'word-recall';
    }

    else if (currentPageId.startsWith('page-icar-') || currentPageId === 'page-icar-intro') {
      taskName = 'icar';
    }

    else if (currentPageId.startsWith('page-odd-') || currentPageId === 'page-odd-intro') {
      taskName = 'odd-one-out';
    }

    else if (currentPageId.startsWith('page-symbol-') || currentPageId === 'page-symbol-instr') {
      taskName = 'symbol-search';
    }

    else if (currentPageId.startsWith('page-magnitude-') || currentPageId === 'page-magnitude-instr') {
      taskName = 'magnitude-comparison';
    }

    else if (currentPageId === 'page-tasks-intro' || 
             currentPageId === 'page-memory-intro' || 
             currentPageId === 'page-brain-intro') {
      taskName = 'task-intro';
    }

    else if (currentPageId === 'page-post-survey') {
      taskName = 'post-survey';
    }

  //  else if (currentPageId === 'page-final-thankyou') {
  //    taskName = 'final';
  //  }

    // Store the current page and task in localStorage
    localStorage.setItem('lastPageId', currentPageId);
    localStorage.setItem('lastTaskName', taskName);
  }
}


function getFirstPageOfTask(taskName) {
  switch (taskName) {
    case 'intro':
      return 'page-welcome';

    case 'adhd-survey':
      return 'page-adhd-instr';

    case 'attention':
      return 'page-attn-instr';

    case 'grid-memory':
      return 'page-grid-instr';

    case 'word-recall':
      return 'page-word-instr';

    case 'icar':
      return 'page-icar-intro';

    case 'odd-one-out':
      return 'page-odd-intro';

    case 'symbol-search':
      return 'page-symbol-instr';

    case 'magnitude-comparison':
      return 'page-magnitude-instr';

    case 'task-intro':
      return 'page-tasks-intro';

    case 'post-survey':
      return 'page-post-survey';

    case 'final':
      return 'page-final-thankyou';

    default:
      return 'page-welcome'; // fallback
  }
}
window.addEventListener('load', function () {
  const savedFormData = localStorage.getItem('formData');
  if (savedFormData) {
    try {
      formData = JSON.parse(savedFormData);
    } catch (e) {
      derr("Failed to parse saved formData:", e);
    }
  }

  const savedTask = localStorage.getItem('lastTaskName');
  if (savedTask) {
    const firstPage = getFirstPageOfTask(savedTask);
    goToPage(firstPage);
  } else {
    goToPage(0); // Start from the beginning
  }
});





















































//___________________________________________________
// grid
//___________________________________________________


const trials = 2;      //here it should be 11   /////////////////////////////////////////////////////////////////
const gridSize = 9; // 3x3
const numbersPerGrid = 6;
const displayTime = 10000;
const getReadyTime = 5000;
const recallTime = 18000;

let currentTrial = 0;
let gridTargetMap = {};
let displayInterval, getReadyInterval, recallInterval;




function runTrial() {
  if (currentTrial >= trials) {
    saveFormData();
    
    goToPage("page-word-instr");
    return;
  }

  const trial = {
    index: currentTrial + 1,
    targetPositions: {},
    recallPositions: {},
    accuracy: 0,
    timedOut: false,
    recallStart: null,
    recallEnd: null,
    recallDuration: null,
    logs: []
  };

  // Prepare randomized grid
  const positions = Array.from({ length: gridSize }, (_, i) => i);
  shuffleArray(positions);
  const selected = positions.slice(0, numbersPerGrid);
  gridTargetMap = {};
  selected.forEach((pos, idx) => (gridTargetMap[pos] = idx + 1));
  trial.targetPositions = { ...gridTargetMap };

  formData.memoryBlock.grid.trials.push(trial);
  saveFormData();
  showDisplayGrid();
}

function showDisplayGrid() {
  const trial = formData.memoryBlock.grid.trials[currentTrial];
  goToPage("page-grid-display");

  const board = document.getElementById("grid-display-board");
  board.innerHTML = "";
  for (let i = 0; i < gridSize; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.textContent = gridTargetMap[i] || "";
    board.appendChild(cell);
  }

  playBackground(1); // Start music

  const bar = document.getElementById("grid-display-progress");
  bar.style.width = "100%";
  const start = Date.now();

  displayInterval = setInterval(() => {
    const elapsed = Date.now() - start;
    bar.style.width = Math.max(0, 100 - (elapsed / displayTime) * 100) + "%";
    if (elapsed >= displayTime) {
      clearInterval(displayInterval);
      stopBackground(); // Stop music
      showGetReady();
    }
  }, 100);
}

function showGetReady() {
  goToPage("page-grid-getready");

  const bar = document.getElementById("grid-getready-progress");
  bar.style.width = "100%";
  const start = Date.now();

  getReadyInterval = setInterval(() => {
    const elapsed = Date.now() - start;
    bar.style.width = Math.max(0, 100 - (elapsed / getReadyTime) * 100) + "%";
    if (elapsed >= getReadyTime) {
      clearInterval(getReadyInterval);
      showRecallGrid();
    }
  }, 100);
}

function showRecallGrid() {
  const trial = formData.memoryBlock.grid.trials[currentTrial];
  trial.recallStart = Date.now();

  playBackground(1); // Music starts again

  goToPage("page-grid-recall");
  const board = document.getElementById("grid-recall-board");
  board.innerHTML = "";
  for (let i = 0; i < gridSize; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = i;
    cell.addEventListener("dragover", e => e.preventDefault());
    cell.addEventListener("drop", e => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const card = document.getElementById(id);
      cell.textContent = card.textContent;
      trial.logs.push({
        pos: parseInt(cell.dataset.index),
        value: parseInt(card.textContent),
        timestamp: Date.now()
      });
    });
    board.appendChild(cell);
  }

  const palette = document.getElementById("grid-card-palette");
  palette.innerHTML = "";
  const nums = Array.from({ length: numbersPerGrid }, (_, i) => i + 1);
  shuffleArray(nums);
  nums.forEach(num => {
    const card = document.createElement("div");
    card.id = `card-${num}`;
    card.className = "draggable-card";
    card.draggable = true;
    card.textContent = num;
    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", card.id);
    });
    palette.appendChild(card);
  });

  const bar = document.getElementById("grid-recall-progress");
  bar.style.width = "100%";
  const start = Date.now();

  recallInterval = setInterval(() => {
    const elapsed = Date.now() - start;
    bar.style.width = Math.max(0, 100 - (elapsed / recallTime) * 100) + "%";
    if (elapsed >= recallTime) {
      clearInterval(recallInterval);
      collectRecall(true);
    }
  }, 100);

  document.getElementById("grid-submit").onclick = () => {
    clearInterval(recallInterval);
    collectRecall(false);
  };
}

function collectRecall(timedOut) {
  stopBackground(); // Stop music

  const trial = formData.memoryBlock.grid.trials[currentTrial];
  trial.recallEnd = Date.now();
  trial.recallDuration = trial.recallEnd - trial.recallStart;
  trial.timedOut = timedOut;
  saveFormData();

  const recallMap = {};
  document.querySelectorAll("#grid-recall-board .grid-cell").forEach(cell => {
    const val = parseInt(cell.textContent, 10);
    if (!isNaN(val)) recallMap[cell.dataset.index] = val;
  });
  trial.recallPositions = recallMap;

  let correct = 0;
  for (const pos in trial.targetPositions) {
    if (recallMap[pos] === trial.targetPositions[pos]) correct++;
  }
  trial.accuracy = correct;

  currentTrial++;
  runTrial();
}



  (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}





























































































































/******************************************************************************
 *                                                                            *
 *                       ATTENTION BLOCK (Go/No-Go)                           *
 *                                                                            *
 ******************************************************************************/

  let practiceStimuli = [], practiceIndex = 0, practiceTimeouts = [];
  let actualStimuli   = [], actualIndex   = 0, actualFixs = [], actualITIs = [], actualTimeouts = [];
  let rtSum = 0, rtCount = 0;

  function startPracticeTrials() {
    clearAllTimeouts(practiceTimeouts);
    practiceStimuli = ["go","nogo"];
    shuffleArray(practiceStimuli);
    practiceIndex = 0;
    runPracticeTrial();
  }

  function runPracticeTrial() {
    if (practiceIndex >= practiceStimuli.length) {
      const t = setTimeout(() => {
        goToPage("page-attn-getready");
        const t2 = setTimeout(() => {
          goToPage("page-attn-actual");
          startActualTrials();
        }, 4000);
        practiceTimeouts.push(t2);
      }, 500);
      practiceTimeouts.push(t);
      return;
    }
    const stimType = practiceStimuli[practiceIndex],
          stimDiv  = document.getElementById("attn-practice-stim"),
          goBtn    = document.getElementById("attn-practice-go-button"),
          fb       = document.getElementById("attn-practice-feedback");

    goBtn.disabled = true;
    fb.innerText   = "";
    stimDiv.className = "fixation";
    stimDiv.innerText = "+";

    const fixDur = 500 + Math.floor(Math.random()*200);
    const t1 = setTimeout(() => {
      stimDiv.className = `stimulus-square stimulus-${stimType}`;
      stimDiv.innerText = "";
      goBtn.disabled = false;
      let responded = false, responseTime = 0;
      const onset = performance.now();
      goBtn.onclick = () => {
        if (!responded) {
          responded = true;
          responseTime = performance.now() - onset;
          goBtn.disabled = true;
        }
      };
      const t2 = setTimeout(() => {
        stimDiv.className = "";
        stimDiv.innerText = "";
        const t3 = setTimeout(() => {
          goBtn.disabled = true;
          fb.innerText = stimType==="go"
            ? (responded ? "Amazing!" : "Too slow!")
            : (responded ? "Wrong!" : "Amazing!");
          const t4 = setTimeout(() => {
            practiceIndex++;
            runPracticeTrial();
          }, 1000);
          practiceTimeouts.push(t4);
        }, 800);
        practiceTimeouts.push(t3);
      }, 300);
      practiceTimeouts.push(t2);
    }, fixDur);
    practiceTimeouts.push(t1);
  }

  function startActualTrials() {
    clearAllTimeouts(actualTimeouts);
    playBackground(0); // condition
    actualStimuli = ["go","nogo"];
    shuffleArray(actualStimuli);
    actualFixs    = [500,600]; shuffleArray(actualFixs);
    actualITIs    = [900,1100]; shuffleArray(actualITIs);
    actualIndex   = 0;
    rtSum = 0; rtCount = 0;
    formData.attentionTrials = [];
    saveFormData();
    runActualTrial();
  }

  function runActualTrial() {
    if (actualIndex >= actualStimuli.length) {
      const meanRT = rtCount > 0 ? rtSum / rtCount : 0;
      formData.attentionResults = {
        hits: formData.attentionTrials.filter(t=>t.type==="go" && t.correct).length,
        misses: formData.attentionTrials.filter(t=>t.type==="go" && !t.correct).length,
        commissionErrors: formData.attentionTrials.filter(t=>t.type==="nogo" && !t.correct).length,
        correctRejections: formData.attentionTrials.filter(t=>t.type==="nogo" && t.correct).length,
        meanRT
      };
      saveFormData();
    if (window._bgAudio) {
      window._bgAudio.pause();
      window._bgAudio = null;
    }
      goToPage("page-memory-intro");
      return;
    }
    const stimType = actualStimuli[actualIndex],
          fixDur   = actualFixs[actualIndex],
          itiDur   = actualITIs[actualIndex],
          stimDiv  = document.getElementById("attn-actual-stim"),
          goBtn    = document.getElementById("attn-actual-go-button");

    stimDiv.className = "fixation";
    stimDiv.innerText = "+";
    goBtn.disabled    = true;

    const t1 = setTimeout(() => {
      stimDiv.className = `stimulus-square stimulus-${stimType}`;
      stimDiv.innerText = "";
      goBtn.disabled    = false;
      let responded = false, responseTime = 0;
      const onset = performance.now();
      goBtn.onclick = () => {
        if (!responded) {
          responded = true;
          responseTime = performance.now() - onset;
          goBtn.disabled = true;
        }
      };
      const t2 = setTimeout(() => {
        stimDiv.className = "";
        stimDiv.innerText = "";
        const t3 = setTimeout(() => {
          goBtn.disabled = true;
          const correct = (stimType==="go" && responded) || (stimType==="nogo" && !responded);
          if (stimType==="go" && responded) {
            rtSum += responseTime;
            rtCount++;
          }
          formData.attentionTrials.push({
            trial: actualIndex,
            type: stimType,
            rt: responded ? responseTime : null,
            correct,
            timedOut: !responded
          });
          saveFormData();
          const t4 = setTimeout(() => {
            actualIndex++;
            runActualTrial();
          }, itiDur);
          actualTimeouts.push(t4);
        }, 800);
        actualTimeouts.push(t3);
      }, 300);
      actualTimeouts.push(t2);
    }, fixDur);
    actualTimeouts.push(t1);
  }















































































































  
function goToPage(idOrIdx) {
  const idx = typeof idOrIdx === 'number' ? idOrIdx : pages.indexOf(idOrIdx);

  if (idx >= 0 && idx < pages.length) {
    currentPageIndex = idx;
    const currentPageId = pages[idx];

    showPage(currentPageId); // Show the actual page

    const taskMap = [
      { match: ['page-welcome'], task: 'welcome', savePage: true },
      { match: ['page-volume'], task: 'volume-check', savePage: true },
      { match: ['page-language'], task: 'language-selection', savePage: true },
      { match: ['page-eligibility'], task: 'age', savePage: true },
      { match: ['page-parent-consent'], task: 'parent-consent', savePage: true },
      { match: ['page-youth-assent'], task: 'youth-assent', savePage: true },
      { match: ['page-adult-consent'], task: 'adult-consent', savePage: true },
      { match: ['page-conditions'], task: 'conditions-check', savePage: true },
      { match: ['page-ineligible'], task: 'ineligible-screen', savePage: true },
      { match: ['page-gender'], task: 'demographics-gender', savePage: true },
      { match: ['page-adhd-instr', 'page-adhd-'], task: 'adhd-survey', savePage: true },
      { match: ['page-tasks-intro', 'page-brain-intro'], task: 'task-intro', savePage: true },
      { match: ['page-word-instr', 'page-word-display', 'page-word-getready', 'page-word-recall-'], task: 'word-recall', savePage: true },
      { match: ['page-odd-intro', 'page-odd-'], task: 'odd-one-out', savePage: true },
      { match: ['page-symbol-instr', 'page-symbol-'], task: 'symbol-search', savePage: true },
      { match: ['page-magnitude-instr', 'page-magnitude-'], task: 'magnitude-comparison', savePage: true },
      { match: ['page-post-survey'], task: 'post-survey', savePage: true },
      { match: ['page-final-thankyou'], task: 'final', savePage: true },
      { match: ['page-attn-'], task: 'attention', savePage: true },
      { match: ['page-grid-'], task: 'grid-memory', savePage: true },

      // ❌ Others return to first page of task
      //{ match: ['page-attn-'], task: 'attention', firstPage: 'page-attn-instr' },
      //{ match: ['page-grid-'], task: 'grid-memory', firstPage: 'page-grid-instr' },
      { match: ['page-icar-intro', 'page-icar-'], task: 'icar', firstPage: 'page-icar-intro' },

    ];

    let taskName = '';
    let pageToStore = currentPageId; // Default to current page

    for (const { match, task, firstPage, savePage } of taskMap) {
      if (match.some(m => currentPageId.startsWith(m) || currentPageId === m)) {
        taskName = task;
        if (!savePage && firstPage) {
          pageToStore = firstPage;
        }
        break;
      }
    }

    localStorage.setItem('lastPageId', pageToStore);
    localStorage.setItem('lastTaskName', taskName);
  }
}



function getFirstPageOfTask(taskName) {
  const taskFirstPages = {
    'welcome': 'page-welcome',
    'volume-check': 'page-volume',
    'language-selection': 'page-language',
    'age': 'page-eligibility',
    'parent-consent': 'page-parent-consent',
    'youth-assent': 'page-youth-assent',
    'adult-consent': 'page-adult-consent',
    'conditions-check': 'page-conditions',
    'ineligible-screen': 'page-ineligible',
    'demographics-gender': 'page-gender',

    // Resumable tasks
    'adhd-survey': 'page-adhd-instr',
    'word-recall': 'page-word-instr',
    'odd-one-out': 'page-odd-intro',
    'symbol-search': 'page-symbol-instr',
    'magnitude-comparison': 'page-magnitude-instr',

    // Others
    'attention': 'page-attn-instr',
    'grid-memory': 'page-grid-instr',
    'icar': 'page-icar-intro',
    'task-intro': 'page-tasks-intro',
    'post-survey': 'page-post-survey',
    'final': 'page-final-thankyou'
  };

  return taskFirstPages[taskName] || 'page-welcome';
}



function resumeAttentionTask() {
  if (!formData.attentionTrials || !formData.attentionStimuli) {
    return startPracticeTrials(); // No data to resume from
  }

  actualStimuli = formData.attentionStimuli;
  actualFixs = formData.attentionFixs;
  actualITIs = formData.attentionITIs;
  actualIndex = formData.attentionIndex || 0;

  goToPage("page-attn-actual");
  runActualTrial();
}

// Resume current trial index if stored
function resumeGridTask() {
  const savedTrial = parseInt(localStorage.getItem('gridCurrentTrial'), 10);
  if (!formData.memoryBlock?.grid?.trials) {
    formData.memoryBlock.grid = { trials: [] };
  }

  currentTrial = isNaN(savedTrial) ? 0 : savedTrial;

  runTrial();
}



























