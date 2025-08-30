"use strict";



/******************************************************************************
 *                                                                            *
 *                          PAGE ORDER & GLOBALS                              *
 *                                                                            *
 ******************************************************************************/

const pages = [
  "page-welcome","page-volume","page-language","page-eligibility",
  "page-parent-consent","page-youth-assent","page-adult-consent",
  "page-conditions","page-ineligible","page-gender",
  "page-adhd-instr","page-adhd-1","page-adhd-2","page-adhd-3","page-adhd-4","page-adhd-5","page-adhd-6",
  "page-tasks-intro",
  "page-attn-instr","page-attn-practice","page-attn-getready","page-attn-actual",
  "page-memory-intro",
  "page-grid-instr","page-grid-display","page-grid-getready","page-grid-recall",
  "page-word-instr","page-word-display","page-word-getready", 
  "page-word-recall-0","page-word-recall-1","page-word-recall-2","page-word-recall-3","page-word-recall-4","page-word-recall-5","page-word-recall-6","page-word-recall-7","page-word-recall-8","page-word-recall-9",
  "page-icar-intro","page-icar-0","page-icar-1","page-icar-2","page-icar-3",
  "page-brain-intro",
  "page-odd-intro","page-odd-0","page-odd-1","page-odd-2","page-odd-3","page-odd-4","page-odd-5","page-odd-6","page-odd-7","page-odd-8","page-odd-9", "page-odd-10", "page-odd-11", "page-odd-12", "page-odd-13",  
  "page-symbol-instr","page-symbol-0","page-symbol-1","page-symbol-2","page-symbol-3","page-symbol-4","page-symbol-5",
  "page-magnitude-instr","page-magnitude-0","page-magnitude-1","page-magnitude-2","page-magnitude-3","page-magnitude-4","page-magnitude-5","page-magnitude-6","page-magnitude-7","page-magnitude-8","page-magnitude-9","page-magnitude-10","page-magnitude-11","page-magnitude-12",
  "page-post-survey","page-final-thankyou"
];

// Toggle logging for development vs production
window.DEBUG = false; // Set to false

// Lightweight logging helpers
function dlog(...args)  { if (window.DEBUG) console.log(...args); }
function dwarn(...args) { if (window.DEBUG) console.warn(...args); }
function derr(...args)  { if (window.DEBUG) console.error(...args); }


let currentPageIndex = 0;


let formData = {
  // --- Participant Info ---
  participantID: null,
  sessionToken: null,
  condition: null,
  conditionOrder: [],
  nativeLanguage: null,
  englishSkill: null,

  // --- Demographics & Consent ---
  ageRange: null,
  parentConsentGiven: false,
  parentConsentDate: null,
  youthAssentGiven: false,
  adultConsentGiven: false,
  gender: null,
  hearingDifficulty: false,
  musicTraining: false,
  asdDiagnosis: false,
  ptsdDiagnosis: false,
  dyslexiaDiagnosis: false,
  hyperlexiaDiagnosis: false,
  noneOfAbove: false,
  ineligibleReasons: [],

  // --- ADHD Survey ---
  adhdStart: null,
  adhdEnd: null,
  adhdDuration: null,
  a1: null,
  a2: null,
  a3: null,
  a4: null,
  a5: null,
  a6: null,

  // --- Attention Task (Go/No-Go) ---
  attention: {
    attentionTrials: [],
    attentionResults: []
  },

  // --- Memory Block ---
  memoryBlock: {
    // Grid Memory Task
    grid: {
      trials: [],
      },

    // Word Recall Task
    word: {
      recallStart: null,
      recallEnd: null,
      recallDuration: null,
      recallAnswers: {},
      accuracy: 0,
      timedOut: {},
      recalls: []
    }
  },

  // --- ICAR Test ---
  icar: {
    answers: [],
    rts: [],
    timedOut: []
  },

  // --- Odd-One-Out Task ---
  oddMeta: {
    start: null,
    end: null,
    duration: null
  },
  oddResults: [],

  // --- Symbol Search ---
  symbolMeta: {
    start: null,
    end: null,
    duration: null
  },
  symbolResults: {
    answers: [],
    accuracy: 0
  },
  symbolLogs: [],

  // --- Magnitude Comparison ---
  magnitudeMeta: {
    start: null,
    end: null,
    duration: null
  },
  magnitudeResults: {
    chosenIndices: [],
    accuracy: 0
  },
  magnitudeLogs: [],

  // --- Post-Task Survey ---
  postSurvey: {
    start: null,
    end: null,
    duration: null,
    ps1: null,
    ps2: null,
    ps3: null
  }
};




// Utility functions

function showPage(pageId) {
  pages.forEach(pid => {
    const el = document.getElementById(pid);
    if (!el) return;
    el.classList.toggle("active", pid === pageId);
  });
}

function goToPage(idOrIdx) {
  const idx = typeof idOrIdx === "number" ? idOrIdx : pages.indexOf(idOrIdx);
  if (idx >= 0 && idx < pages.length) {
    currentPageIndex = idx;
    showPage(pages[idx]);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function clearAllTimeouts() {
  var id = window.setTimeout(function () {}, 0);
  while (id--) {
    window.clearTimeout(id);
  }
}

function clearAllIntervals() {
  var id = window.setInterval(function () {}, 0);
  while (id--) {
    window.clearInterval(id);
  }
}


// ===== Collect eligibility data and assign condition from your backend =====
async function assignConditionFromBackend() {
  const eligibilityPayload = {
    hearingDifficulty: formData.hearingDifficulty,
    musicTraining:     formData.musicTraining,
    asdDiagnosis:      formData.asdDiagnosis,
    ptsdDiagnosis:     formData.ptsdDiagnosis,
    dyslexiaDiagnosis: formData.dyslexiaDiagnosis,
    hyperlexiaDiagnosis: formData.hyperlexiaDiagnosis,
    noneOfAbove:       formData.noneOfAbove
  };

  try {
    dlog && dlog("⏳ Sending eligibility payload:", eligibilityPayload);

    const resp = await fetch("http://127.0.0.1:8000/assign_condition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eligibilityPayload)
    });

    // parse JSON if present
    let result = {};
    try { result = await resp.json(); } catch (e) { /* ignore parse errors */ }

    dlog && dlog("🔍 assign_condition result:", result, "status:", resp.status);

    // Backend stored the participant (even if ineligible) and returns participant_id
    formData.participantID = result.participant_id || formData.participantID || null;
    formData.sessionToken  = result.session_token  || formData.sessionToken  || null;
    formData.condition     = result.condition      || formData.condition      || null;

    // If backend marked them ineligible, it should return ineligible:true and reason(s)
    if (result.ineligible) {
      dwarn && dwarn("🚫 Participant marked ineligible by backend:", result.reason || result.details || result);
      // keep the reason(s) for your records and show ineligible page
      formData.ineligibleReasons = result.reason || result.details || formData.ineligibleReasons || ["ineligible"];
      return { success: true, eligible: false }; // indicates backend call OK but participant ineligible
    }

    // Otherwise backend should return a condition_order (preferred)
    if (Array.isArray(result.condition_order) && result.condition_order.length) {
      formData.conditionOrder = [...result.condition_order];
    } else {
      // fallback mapping if backend returned only condition string (e.g., "Cond1")
      const latinSquare = {
        Cond1: ["silence", "white", "music"],
        Cond2: ["white",   "music", "silence"],
        Cond3: ["music",   "silence","white"]
      };
      const raw = String(result.condition || "").trim();
      if (latinSquare[raw]) formData.conditionOrder = [...latinSquare[raw]];
      else formData.conditionOrder = Array.isArray(formData.conditionOrder) ? formData.conditionOrder : [];
    }

    dlog && dlog("✅ Assigned participant:", formData.participantID, "condition:", formData.condition, "order:", formData.conditionOrder);
    return { success: true, eligible: true };
  } catch (error) {
    derr && derr("❌ Error assigning condition (frontend):", error);
    return { success: false, eligible: false, error: String(error) };
  }
}


// ===== Playback helpers =====

function playBackground(blockIndex) {
    dlog("🎬 playBackground called with blockIndex:", blockIndex);

  // Show the entire condition order
    dlog("📀 Current formData.conditionOrder:", formData.conditionOrder);

  // Get the specific condition for the given block
  const cond = formData.conditionOrder?.[blockIndex];
    dlog("🎵 Condition selected for this block:", cond);

  // Defensive check
  if (!cond) {
    dwarn("⚠️ No condition found at this block index.");
    return;
  }

  // Final audio path
  const audioPath = `${cond}.mp3`;
    dlog("🔊 Attempting to play audio file:", audioPath);

  // Create and play audio
  const audio = new Audio(audioPath);
  audio.loop = true;
  audio.volume = 0.5;

  audio.play()
    .then(() =>   dlog("✅ Audio started successfully"))
    .catch(err => dwarn("❌ Audio failed to play:", err));

  window._bgAudio = audio;
}


function stopBackground() {
    dlog("⏹ stopBackground");
  if (window._bgAudio) {
    window._bgAudio.pause();
    window._bgAudio.currentTime = 0;
    window._bgAudio = null;
  }
}



/******************************************************************************
 *                                                                            *
 *                               MAIN SETUP                                   *
 *                                                                            *
 ******************************************************************************/

document.addEventListener("DOMContentLoaded", async () => {
  showPage(pages[currentPageIndex]);

  // ===== Welcome → Volume =====
document.getElementById("welcome-next").onclick = function() {
  this.disabled = true;
  goToPage("page-volume");
  };

// ===== Volume → Language =====
document.getElementById("volume-next").onclick = function() {
  this.disabled = true;
  goToPage("page-language");
};

// ===== Language → Eligibility =====
document.getElementById("language-next").onclick = function() {
  const nativeLang = document.getElementById("native-language").value;
  const englishSkill = document.getElementById("english-skill").value;

  if (!nativeLang) {
    alert("Please select your native language.");
    return;
  }

  formData.nativeLanguage = nativeLang;
  formData.englishSkill = parseInt(englishSkill);
   
  this.disabled = true;
  goToPage("page-eligibility");
};


  // ===== Eligibility =====
  document.getElementById("eligibility-next").onclick = function() {
    const sel = document.querySelector("input[name='age-range']:checked");
    if (!sel) { alert("Please select your age range."); return; }
    formData.ageRange = sel.value;
     
    this.disabled = true;
    if (sel.value === "14-17") goToPage("page-parent-consent");
    else goToPage("page-adult-consent");
  };

  // ===== Parent Consent =====
  document.getElementById("parent-consent-next").onclick = function() {
    const chk = document.getElementById("parent-consent-checkbox"),
          dt  = document.getElementById("parent-consent-date");
    if (!chk.checked) { alert("Please confirm parental consent."); return; }
    if (!dt.value)  { alert("Please select the date."); return; }
    formData.parentConsentGiven = true;
    formData.parentConsentDate  = dt.value;
     
    this.disabled = true;
    goToPage("page-youth-assent");
  };

  // ===== Youth Assent =====
  document.getElementById("youth-assent-next").onclick = function() {
    const chk = document.getElementById("youth-assent-checkbox");
    if (!chk.checked) { alert("Please confirm youth assent."); return; }
    formData.youthAssentGiven = true;
     
    this.disabled = true;
    goToPage("page-conditions");
  };

  // ===== Adult Consent =====
  document.getElementById("adult-consent-next").onclick = function() {
    const chk = document.getElementById("adult-consent-checkbox");
    if (!chk.checked) { alert("Please confirm adult consent."); return; }
    formData.adultConsentGiven = true;
     
    this.disabled = true;
    goToPage("page-conditions");
  };


// ===== Conditions =====
document.getElementById("conditions-next").onclick = async function() {
  const cbH = document.getElementById("cond-hearing"),
        cbM = document.getElementById("cond-music"),
        cbA = document.getElementById("cond-asd"),
        cbP = document.getElementById("cond-ptsd"),
        cbD = document.getElementById("cond-dyslexia"),
        cbH2= document.getElementById("cond-hyperlexia"),
        cbN = document.getElementById("cond-none");

  if (!(cbH.checked||cbM.checked||cbA.checked||cbP.checked||cbD.checked||cbH2.checked||cbN.checked)) {
    alert("Select at least one."); 
    return;
  }

  // Exclusive behavior
  function excl(c) {
    if (c.id==="cond-none" && c.checked) {
      [cbH,cbM,cbA,cbP,cbD,cbH2].forEach(x=>x.checked=false);
    } else if (c.checked) {
      cbN.checked = false;
    }
  }
  [cbH,cbM,cbA,cbP,cbD,cbH2,cbN].forEach(c=>c.onchange=()=>excl(c));

  // Save to formData
  formData.hearingDifficulty   = cbH.checked;
  formData.musicTraining       = cbM.checked;
  formData.asdDiagnosis        = cbA.checked;
  formData.ptsdDiagnosis       = cbP.checked;
  formData.dyslexiaDiagnosis   = cbD.checked;
  formData.hyperlexiaDiagnosis = cbH2.checked;
  formData.noneOfAbove         = cbN.checked;

  // Collect reasons for disqualification
  formData.ineligibleReasons = [];
  if (cbH.checked) formData.ineligibleReasons.push("hearingDifficulty");
  if (cbM.checked) formData.ineligibleReasons.push("musicTraining");
  if (cbA.checked) formData.ineligibleReasons.push("asdDiagnosis");
  if (cbP.checked) formData.ineligibleReasons.push("ptsdDiagnosis");
  if (cbD.checked) formData.ineligibleReasons.push("dyslexiaDiagnosis");
  if (cbH2.checked) formData.ineligibleReasons.push("hyperlexiaDiagnosis");

  // prevent multiple clicks
  this.disabled = true;

  // Always call backend so participant is recorded (either pending or disqualified)
  const result = await assignConditionFromBackend();

  if (!result || result.success === false) {
    // Backend error: allow retry
    alert("There was a problem contacting the server. Please try again.");
    this.disabled = false;
    return;
  }

  if (!result.eligible || (formData.ineligibleReasons && formData.ineligibleReasons.length)) {
    // Participant has been recorded as disqualified on the server
    localStorage.setItem("participantStatus", "ineligible");
    goToPage("page-ineligible");
    return;
  }

  // Eligible and assigned — proceed
  goToPage("page-gender");
};

  // ===== Gender =====
  document.getElementById("gender-next").onclick = function() {
    const sel = document.querySelector("input[name='gender']:checked");
    if (!sel) { alert("Please select your gender."); return; }
    formData.gender = sel.value;
     
    this.disabled = true;
    goToPage("page-adhd-instr");
  };


  // ===== ADHD Section =====
  document.getElementById("adhd-instr-next").onclick = function() {
    formData.adhdStart = Date.now();
     
    this.disabled = true;
    goToPage("page-adhd-1");
  };

  document.getElementById("adhd1-next").onclick = function() {
    const sel = document.querySelector("input[name='a1']:checked");
    if (!sel) { alert("Select an answer."); return; }
    formData.a1 = +sel.value;
     
    this.disabled = true;
    goToPage("page-adhd-2");
  };

  document.getElementById("adhd2-next").onclick = function() {
    const sel = document.querySelector("input[name='a2']:checked");
    if (!sel) { alert("Select an answer."); return; }
    formData.a2 = +sel.value;
     
    this.disabled = true;
    goToPage("page-adhd-3");
  };

  document.getElementById("adhd3-next").onclick = function() {
    const sel = document.querySelector("input[name='a3']:checked");
    if (!sel) { alert("Select an answer."); return; }
    formData.a3 = +sel.value;
     
    this.disabled = true;
    goToPage("page-adhd-4");
  };

  document.getElementById("adhd4-next").onclick = function() {
    const sel = document.querySelector("input[name='a4']:checked");
    if (!sel) { alert("Select an answer."); return; }
    formData.a4 = +sel.value;
     
    this.disabled = true;
    goToPage("page-adhd-5");
  };

  document.getElementById("adhd5-next").onclick = function() {
    const sel = document.querySelector("input[name='a5']:checked");
    if (!sel) { alert("Select an answer."); return; }
    formData.a5 = +sel.value;
     
    this.disabled = true;
    goToPage("page-adhd-6");
  };

  document.getElementById("adhd6-submit").onclick = function() {
    const sel = document.querySelector("input[name='a6']:checked");
    if (!sel) { alert("Select an answer."); return; }
    formData.a6 = +sel.value;
    formData.adhdEnd = Date.now();
    formData.adhdDuration = formData.adhdEnd - formData.adhdStart;
     
    this.disabled = true;
    goToPage("page-tasks-intro");
  };


  // Tasks Intro to Attention
  document.getElementById("tasks-start").onclick = function() {
    this.disabled = true;
    goToPage("page-attn-instr");
  };
  document.getElementById("attn-instr-next").onclick = function() {
    this.disabled = true;
    goToPage("page-attn-practice");
    startPracticeTrials();
  };



/******************************************************************************
 *                                                                            *
 *                       ATTENTION BLOCK (Go/No-Go)                           *
 *                                                                            *
 ******************************************************************************/

// ====== Trial state ======
let practiceStimuli = [], practiceIndex = 0, practiceTimeouts = [];
let actualStimuli = [], actualFixs = [], actualITIs = [], actualIndex = 0, actualTimeouts = [];
let rtSum = 0, rtCount = 0;

// ====== START PRACTICE ======
function startPracticeTrials() {
  clearAllTimeouts(practiceTimeouts);
  practiceStimuli = generateStimuli(6, 4); // ✅ 10 practice trials: 6 go, 4 nogo
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
        stimDiv = document.getElementById("attn-practice-stim"),
        goBtn = document.getElementById("attn-practice-go-button"),
        fb = document.getElementById("attn-practice-feedback");

  goBtn.disabled = true;
  fb.innerText = "";
  stimDiv.className = "fixation";
  stimDiv.innerText = "+";

  const fixDur = jitteredFixation(); // 500 ±100ms
  const t1 = setTimeout(() => {
    stimDiv.className = `stimulus-symbol`;
    stimDiv.innerText = ""; 
    stimDiv.className = "stimulus-square " + (stimType === "go" ? "stimulus-go" : "stimulus-nogo");
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
        fb.innerText = stimType === "go"
          ? (responded ? "Amazing!" : "Too slow!")
          : (responded ? "Wrong!" : "Amazing!");

        const t4 = setTimeout(() => {
          practiceIndex++;
          runPracticeTrial();
        }, 1000);
        practiceTimeouts.push(t4);
      }, 800); // response window
      practiceTimeouts.push(t3);
    }, 300); // stimulus display
    practiceTimeouts.push(t2);
  }, fixDur);
  practiceTimeouts.push(t1);
}

// ====== START ACTUAL TRIALS ======
function startActualTrials() {
  clearAllTimeouts(actualTimeouts);
  playBackground(0); // Only during actual trials

  // ✅ 80 total trials: 56 go, 24 nogo
  actualStimuli = generateStimuli(2, 1);   /// 56 , 24
  shuffleArray(actualStimuli);

  // ✅ Fixation durations: 27x400, 27x500, 26x600
  actualFixs = [...Array(1).fill(400), ...Array(1).fill(500), ...Array(1).fill(600)]; /// 27 27 26
  shuffleArray(actualFixs);

  // ✅ ITI durations: 27x900, 27x1000, 26x1100
  actualITIs = [...Array(1).fill(900), ...Array(1).fill(1000), ...Array(1).fill(1100)];/// 27 27 26
  shuffleArray(actualITIs);

  actualIndex = 0;
  rtSum = 0; rtCount = 0;
  runActualTrial();
}

function runActualTrial() {
  if (actualIndex >= actualStimuli.length) {
    const meanRT = rtCount > 0 ? rtSum / rtCount : 0;
    formData.attention.attentionResults = {
      hits: formData.attention.attentionResults.filter(t => t.type === "go" && t.correct).length,
      misses: formData.attention.attentionResults.filter(t => t.type === "go" && !t.correct).length,
      commissionErrors: formData.attention.attentionResults.filter(t => t.type === "nogo" && !t.correct).length,
      correctRejections: formData.attention.attentionResults.filter(t => t.type === "nogo" && t.correct).length,
      meanRT
    };

    if (window._bgAudio) {
      window._bgAudio.pause();
      window._bgAudio = null;
    }

    goToPage("page-memory-intro");
    return;
  }

  const stimType = actualStimuli[actualIndex],
        fixDur = actualFixs[actualIndex],
        itiDur = actualITIs[actualIndex],
        stimDiv = document.getElementById("attn-actual-stim"),
        goBtn = document.getElementById("attn-actual-go-button");

  stimDiv.className = "fixation";
  stimDiv.innerText = "+";
  goBtn.disabled = true;

  const t1 = setTimeout(() => {
    stimDiv.className = "stimulus-symbol";
    stimDiv.innerText = ""; 
    stimDiv.className = "stimulus-square " + (stimType === "go" ? "stimulus-go" : "stimulus-nogo");
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
        const correct = (stimType === "go" && responded) || (stimType === "nogo" && !responded);

        if (stimType === "go" && responded) {
          rtSum += responseTime;
          rtCount++;
        }

        formData.attention.attentionTrials.push({
          trial: actualIndex,
          type: stimType,
          rt: responded ? responseTime : null,
          correct,
          timedOut: !responded
        });

        const t4 = setTimeout(() => {
          actualIndex++;
          runActualTrial();
        }, itiDur);

        actualTimeouts.push(t4);
      }, 800); // response window
      actualTimeouts.push(t3);
    }, 300); // stimulus display
    actualTimeouts.push(t2);
  }, fixDur);
  actualTimeouts.push(t1);
}

// ====== Utility Functions ======

function clearAllTimeouts(tArr) {
  tArr.forEach(t => clearTimeout(t));
  tArr.length = 0;
}

function jitteredFixation() {
  return 500 + (Math.floor(Math.random() * 3) - 1) * 100; // 400/500/600
}

function generateStimuli(goCount, nogoCount) {
  return Array(goCount).fill("go").concat(Array(nogoCount).fill("nogo"));
}



/******************************************************************************
 *                                                                            *
 *                               MEMORY BLOCK                                 *
 *                                                                            *
 ******************************************************************************/

// 1) Wire up the “Next” on Memory Intro
document.getElementById("memory-intro-next").onclick = function() {
  this.disabled = true;
  goToPage("page-grid-instr");
};



// Start button from instruction page
document.getElementById("grid-instr-next").onclick = () => {
  currentTrial = 0;
  runTrial();
};

// 4) Wire up Word-Instr → runWordSequence
document.getElementById("word-instr-next").onclick = function() {
  this.disabled = true;
  runWordSequence();
};




//___________________________________________________
// grid
//___________________________________________________

const trials = 1; // Set to actual number of grid trials
const gridSize = 9; // 3x3
const numbersPerGrid = 6;
const displayTime = 1000; ////// 10s
const getReadyTime = 5000;
const recallTime = 18000;

let currentTrial = 0;
let gridTargetMap = {};
let displayInterval, getReadyInterval, recallInterval;


function runTrial() {
  if (currentTrial >= trials) {     
    goToPage("page-word-instr");
    return;
  }

  const trial = {
    //index: currentTrial + 1,
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





// ─────────────────────────────
// 6.3 Word Pair Reconstruction
// ─────────────────────────────

const wordPairs = [
  ["book", "laptop"],       // 0
  ["lamp", "sky"],          // 1
  ["bread", "circle"],      // 2
  ["window", "fire"],       // 3
  ["pencil", "spoon"],      // 4
  ["table", "door"],        // 5
  ["chair", "rain"],        // 6
  ["apple", "shoe"],        // 7
  ["wall", "moon"],         // 8
  ["toothbrush", "cloud"]   // 9
];

// Fixed options for each recall question (must match wordPairs order)
const recallOptions = [
  ["spoon", "circle", "knife", "cherry"],       // bread (index 2)
  ["blue", "sky", "tree", "cloud"],            // lamp (index 1)
  ["door", "lamp", "pencil", "window"],        // table (index 5)
  ["door", "heat", "phone", "laptop"],            // book (index 0)
  ["lamp", "circle", "table", "fire"],          // window (index 3)
  ["spoon", "door", "fire", "sky"],            // pencil (index 4)
  ["wind", "rain", "book", "water"],           // chair (index 6)
  ["book", "train", "laptop", "shoe"],          // apple (index 7)
  ["bread", "planet", "sky", "moon"],           // wall (index 8)
  ["toothpaste", "white", "apple", "cloud"] // toothbrush (index 9)
];

const wordDisplayMs  = 100;  // each pair for 5s ///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
const wordGetReadyMs = 10000; // 10s before recall 
const wordRecallTime = 10000; // 10s per recall

let wordDisplayInterval, wordGetReadyInterval, wordRecallInterval;
let wordRecallIndex = 0;

function runWordSequence() {
  formData.memoryBlock.word = {
    recallStart:  null,
    recallEnd:    null,
    recallDuration: null,
    recallAnswers:{},
    accuracy:     0,
    timedOut:     {},
    recalls:      []
  };

  // 1) Show each pair in turn
  playBackground(1);
  goToPage("page-word-display");
  const bar1 = document.getElementById("word-display-progress");
  bar1.style.width = "100%";
  const total = wordPairs.length * wordDisplayMs;
  const start1 = Date.now();

  // Progress bar
  wordDisplayInterval = setInterval(() => {
    const elapsed = Date.now() - start1;
    bar1.style.width = Math.max(0, 100 - (elapsed / total)*100) + "%";
    if (elapsed >= total) {
      clearInterval(wordDisplayInterval);
      runWordGetReady();
    }
  }, 100);

  // Cycle through pairs visually
  let idx = 0;
  const container = document.getElementById("word-pair-container");
  container.innerText = "";
  function showOnePair() {
    if (idx >= wordPairs.length) return;
    container.innerText = wordPairs[idx].join(" – ");
    idx++;
    setTimeout(showOnePair, wordDisplayMs);
  }
  showOnePair();
}

function runWordGetReady() {
  stopBackground();
  goToPage("page-word-getready");
  const bar2 = document.getElementById("word-getready-progress");
  bar2.style.width = "100%";
  const start2 = Date.now();

  wordGetReadyInterval = setInterval(() => {
    const elapsed = Date.now() - start2;
    bar2.style.width = Math.max(0, 100 - (elapsed / wordGetReadyMs)*100) + "%";
    if (elapsed >= wordGetReadyMs) {
      clearInterval(wordGetReadyInterval);
      wordRecallIndex = 0;
      showWordRecallPage();
    }
  }, 100);
}

function showWordRecallPage() {
  if (wordRecallIndex >= wordPairs.length) {
    formData.memoryBlock.word.recallEnd = Date.now();
    formData.memoryBlock.word.recallDuration = formData.memoryBlock.word.recallEnd - formData.memoryBlock.word.recallStart;
     
    stopBackground();
    goToPage("page-icar-intro");   ///////////////////////////////////////////////////////////////////////////////////
    return;
  }
  if (wordRecallIndex === 0) {
    playBackground(1);
  }
  formData.memoryBlock.word.recallStart = Date.now();

  const [cue, correctWord] = wordPairs[wordRecallIndex];
  const section = document.getElementById(`page-word-recall-${wordRecallIndex}`);
  section.innerHTML = `
    <p>Select the partner for <strong>${cue}</strong>:</p>
    <div class="word-options-grid"></div>
    <div class="progress-bar-container">
      <div id="word-recall-bar-${wordRecallIndex}" class="progress-bar-fill"></div>
    </div>
  `;

  // Use fixed options for this recall question
  const opts = recallOptions[wordRecallIndex].slice(); // clone to avoid mutation
  shuffleArray(opts); // shuffle so correct answer position varies

  // Render radio options
  const grid = section.querySelector(".word-options-grid");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(2,1fr)";
  grid.style.gap = "12px";
  grid.style.margin = "12px 0";

  opts.forEach(opt => {
    const lbl = document.createElement("label");
    lbl.innerHTML = `<input type="radio" name="word-${wordRecallIndex}" value="${opt}" /> ${opt}`;
    lbl.addEventListener("change", () => {
      collectWordRecallResponse(false, wordRecallIndex, correctWord);
    });
    grid.appendChild(lbl);
  });

  // start progress bar for recall time
  goToPage(`page-word-recall-${wordRecallIndex}`);
  const bar3 = document.getElementById(`word-recall-bar-${wordRecallIndex}`);
  bar3.style.width = "100%";
  const start3 = Date.now();

  wordRecallInterval = setInterval(() => {
    const elapsed = Date.now() - start3;
    bar3.style.width = Math.max(0, 100 - (elapsed / wordRecallTime)*100) + "%";
    if (elapsed >= wordRecallTime) {
      clearInterval(wordRecallInterval);
      collectWordRecallResponse(true, wordRecallIndex, correctWord);
    }
  }, 100);
}

function collectWordRecallResponse(timedOut, idx, correctWord) {
  clearInterval(wordRecallInterval);

  const sel = document.querySelector(`input[name="word-${idx}"]:checked`);
  const answer = sel ? sel.value : null;
  const rt = timedOut ? null : (Date.now() - formData.memoryBlock.word.recallStart);

  formData.memoryBlock.word.recallAnswers[wordPairs[idx][0]] = answer;

  formData.memoryBlock.word.recalls.push({
    cue: wordPairs[idx][0],
    answer,
    correct: answer === correctWord,
    rt,
    timedOut
  });
  if (answer === correctWord) formData.memoryBlock.word.accuracy++;

  wordRecallIndex++;
  showWordRecallPage();
}




/****************************************************************************** 
 *                                                                            *
 *         ICAR INTELLIGENCE TEST (4 items, shared 5-minute timer)           *
 *                                                                            *
 ******************************************************************************/

let icarStart = null;
let icarTimer = null;
let icarQuestionStart = null; // per-question start time
const icarDuration = 5 * 60 * 1000; // 5 minutes total

// 1) Utility: show/hide the shared ICAR timer bar
function setIcarTimerVisible(visible) {
  const timerContainer = document.getElementById("icar-shared-timer");
  if (timerContainer) timerContainer.style.display = visible ? "block" : "none";
}

// 2) Tick handler: update minutes/seconds + progress bar
function updateIcarTimer() {
  const elapsed = Date.now() - icarStart;
  const remaining = Math.max(0, icarDuration - elapsed);
  const mins = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const secs = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  document.getElementById("icar-timer").innerText = `${mins}:${secs}`;
  document.getElementById("icar-progress-bar").style.width =
    Math.max(0, 100 - (elapsed / icarDuration) * 100) + "%";

  if (remaining <= 0) {
    clearInterval(icarTimer);
    finishIcar(); // No need to pass anything
  }
}

// 3) On DOM ready, hide the timer until we start
document.addEventListener("DOMContentLoaded", () => {
  setIcarTimerVisible(false);
});

// 4) ICAR intro “Next” → Q1
document.getElementById("icar-intro-next").onclick = function () {
  this.disabled = true;

  // Start global timer
  icarStart = Date.now();
  setIcarTimerVisible(true);
  updateIcarTimer();
  icarTimer = setInterval(updateIcarTimer, 1000);

  // Initialize data store
  formData.icar = { answers: [], rts: [], timedOut: [] };

  // Show question 1
  goToPage("page-icar-0");
  icarQuestionStart = Date.now(); // Start timing Q1
};

// 5) Helper to record one answer + RT, then navigate
function recordIcarAndNext(idx, nextPageId) {
  const sel = document.querySelector(`input[name="icar-${idx}"]:checked`);
  formData.icar.answers[idx]  = sel ? sel.value : null;
  formData.icar.rts[idx]      = sel ? (Date.now() - icarQuestionStart) : null;
  formData.icar.timedOut[idx] = !sel;

  goToPage(nextPageId);
  icarQuestionStart = Date.now(); // Start timing next question
}

// Q1 → Q2
document.getElementById("icar-next-0").onclick = () =>
  recordIcarAndNext(0, "page-icar-1");

// Q2 → Q3
document.getElementById("icar-next-1").onclick = () =>
  recordIcarAndNext(1, "page-icar-2");

// Q3 → Q4
document.getElementById("icar-next-2").onclick = () =>
  recordIcarAndNext(2, "page-icar-3");

// 6) On final question “Finish”
document.getElementById("icar-submit").onclick = function () {
  if (this.dataset.submitted) return; // Prevent double-click
  this.dataset.submitted = true;

  const sel = document.querySelector(`input[name="icar-3"]:checked`);
  formData.icar.answers[3]  = sel ? sel.value : null;
  formData.icar.rts[3]      = sel ? (Date.now() - icarQuestionStart) : null;
  formData.icar.timedOut[3] = !sel;

  // Mark unanswered questions as timed out
  for (let i = 0; i < 4; i++) {
    if (formData.icar.answers[i] == null) {
      formData.icar.rts[i]      = null;
      formData.icar.timedOut[i] = true;
    }
  }

  clearInterval(icarTimer);
  setIcarTimerVisible(false);
   
  this.disabled = true;
  goToPage("page-brain-intro");/////////////////
};

// 7) Auto-finish if timer runs out
function finishIcar() {
  for (let i = 0; i < 4; i++) {
    if (formData.icar.answers[i] == null) {
      formData.icar.rts[i]      = null;
      formData.icar.timedOut[i] = true;
    }
  }

  setIcarTimerVisible(false);
   
  goToPage("page-brain-intro");////////////////////
}

/****************************************************************************** 
 *                                                                            *
 *                             ODD-ONE-OUT TASK                               *
 *                                                                            *
 ******************************************************************************/

const oddTrials = [
  // Visual 1 (from doc) — odd: 3rd block (index 2). Time: 25s
  {
    grid: [
      ["▢","▢","▢","▢","↘","▢","▢","▢","▢","↘","▢","▢","▢","▢","↘","▢"],
      ["▢","▢","▢","▢","▢","↘","▢","▢","▢","▢","↘","▢","▢","▢","▢","↘"],
      ["▢","▢","▢","▢","▢","▢","↘","▢","▢","▢","▢","↘","↘","▢","▢","▢"],
      ["▢","↘","▢","▢","▢","▢","↘","▢","▢","▢","▢","↘","▢","▢","▢","▢"]
    ],
    oddIndex: 2,
    duration: 25000
  },

  // Verbal 1 — Apple / Banana / Car / Orange — odd: "Car" (index 2). Time: 10s
  {
    grid: [
      ["Apple"],
      ["Banana"],
      ["Car"],
      ["Orange"]
    ],
    oddIndex: 2,
    duration: 10000
  },

  // Visual 4 — rotation arrows — odd: 2nd row (index 1). Time: 15s
  {
    grid: [
      ["↺","↺","↺","↺","↺"],
      ["↺","↺","↺","↻","↺"],
      ["↺","↺","↺","↺","↺"],
      ["↺","↺","↺","↺","↺"]
    ],
    oddIndex: 1,
    duration: 15000
  },

  // Verbal 2 — paired arrows (BOY→GIRL etc.) — odd: last row (index 3). Time: 15s
  {
    grid: [
      ["BOY","→","GIRL"],
      ["LEFT","→","RIGHT"],
      ["UP","→","DOWN"],
      ["BLUE","→","SKY"]
    ],
    oddIndex: 3,
    duration: 15000
  },

  // Visual 9 — moon phases — odd: 3rd row (index 2). Time: 20s
  {
    grid: [
      ["🌒","🌓","🌔","🌕"],
      ["🌖","🌕","🌔","🌓"],
      ["🌘","🌑","🌒","🌓"],
      ["🌑","🌒","🌓","🌔"]
    ],
    oddIndex: 2,
    duration: 20000
  },

  // Verbal 5 — FISH→WATER / PLANE→SKY / TRAIN→TRACK / BOOK→TITLE — odd: last (index 3). Time: 20s
  {
    grid: [
      ["FISH","→","WATER"],
      ["PLANE","→","SKY"],
      ["TRAIN","→","TRACK"],
      ["BOOK","→","TITLE"]
    ],
    oddIndex: 3,
    duration: 20000
  },

  // Visual 5 — double-arrow marks, odd: last row (index 3). Time: 15s
  {
    grid: [
      ["⇻","⇻","⇻","⇻","⇻"],
      ["⇻","⇻","⇻","⇻","⇻"],
      ["⇻","⇻","⇻","⇻","⇻"],
      ["⇻","⇻","⇸","⇻","⇻"]
    ],
    oddIndex: 3,
    duration: 15000
  },

  // Verbal — Dog / Cat / Chair / Cow — odd: "Chair" (index 2). Time: 10s
  {
    grid: [
      ["Dog"],
      ["Cat"],
      ["Chair"],
      ["Cow"]
    ],
    oddIndex: 2,
    duration: 10000
  },

  // Visual 3 — star shapes (6 cols) — odd: 3rd row (index 2). Time: 15s
  {
    grid: [
      ["❇","❇","❇","❇","❇","❇"],
      ["❇","❇","❇","❇","❇","❇"],
      ["❇","❇","❇","❈","❇","❇"],
      ["❇","❇","❇","❇","❇","❇"]
    ],
    oddIndex: 2,
    duration: 15000
  },

  // Verbal 9 — One / Three / Five / Ten — odd: "Ten" (index 3). Time: 15s
  {
    grid: [
      ["One"],
      ["Three"],
      ["Five"],
      ["Ten"]
    ],
    oddIndex: 3,
    duration: 15000
  },

  // Visual 2 — triangles 3x4 — odd: last row (index 3). Time: 15s
  {
    grid: [
      ["🔺","🔺","🔺"],
      ["🔻","🔻","🔻"],
      ["🔺","🔺","🔺"],
      ["🔻","🔻","🔺"]
    ],
    oddIndex: 3,
    duration: 15000
  },

  // Verbal 11 — Ball / Egg / Cube / Circle — odd: "Cube" (index 2). Time: 15s
  {
    grid: [
      ["Ball"],
      ["Egg"],
      ["Cube"],
      ["Circle"]
    ],
    oddIndex: 2,
    duration: 15000
  },

  // Visual 8 — four 3x3 checker blocks (each block concatenated into a 9-cell row) — odd: 4th block (index 3). Time: 15s
  {
    grid: [
      ["⬜","⬛","⬜","⬛","⬜","⬛","⬜","⬛","⬜"],
      ["⬛","⬜","⬛","⬜","⬛","⬜","⬛","⬜","⬛"],
      ["⬜","⬛","⬜","⬛","⬜","⬛","⬜","⬛","⬜"],
      ["⬜","⬛","⬛","⬛","⬜","⬛","⬜","⬛","⬜"]
    ],
    oddIndex: 3,
    duration: 15000
  },

  // Verbal 13 — Drum / Bell / Cloud / Clap — odd: "Cloud" (index 2). Time: 20s
  {
    grid: [
      ["Drum"],
      ["Bell"],
      ["Cloud"],
      ["Clap"]
    ],
    oddIndex: 2,
    duration: 20000
  }
];


let oddIndex = 0,
    oddInterval = null,
    oddTimeout  = null,
    trialStartTime = null;


// 1) Kick off from Brain Games Intro
document.getElementById("brain-intro-next").onclick = function() {
  this.disabled = true;
  goToPage("page-odd-intro");
};

// 2) From Odd-Intro → first trial
document.getElementById("odd-intro-next").onclick = function() {
  this.disabled = true;
  oddIndex = 0;
  formData.oddMeta    = { start: Date.now(), end: null, duration: null };
  formData.oddResults = [];
  playBackground(2);
  showOddTrial();
};


function showOddTrial() {
  // If all done:
  if (oddIndex >= oddTrials.length) {
    clearInterval(oddInterval);
    clearTimeout(oddTimeout);
    formData.oddMeta.end      = Date.now();
    formData.oddMeta.duration = formData.oddMeta.end - formData.oddMeta.start;
    stopBackground();
    goToPage("page-symbol-instr");
    return;
  }

  // clear prior timers
  clearInterval(oddInterval);
  clearTimeout(oddTimeout);

  const trial   = oddTrials[oddIndex];
  const section = document.getElementById(`page-odd-${oddIndex}`);

  // Build cards container with progress bar container
  section.innerHTML = `
    <h2>Find the Odd One</h2>
    <div class="progress-bar-container">
      <div id="odd-bar-${oddIndex}" class="progress-bar-fill"></div>
    </div>
    <div class="odd-grid" id="odd-grid-${oddIndex}"></div>
  `;

  const gridDiv = document.getElementById(`odd-grid-${oddIndex}`);
  gridDiv.style.display = "flex";
  gridDiv.style.flexDirection = "column";
  gridDiv.style.gap = "12px";
  gridDiv.style.alignItems = "stretch";
  gridDiv.style.width = "100%";
  gridDiv.style.boxSizing = "border-box";
  gridDiv.style.margin = "0 auto";

  // SPECIAL CASE: 4x4 or 3x3 trial
if (trial.grid.length === 4 && (trial.grid[0].length === 16 || trial.grid[0].length === 9)) {
    // Make container a 2x2 grid
    gridDiv.style.display = "grid";
    gridDiv.style.gridTemplateColumns = "1fr 1fr";
    gridDiv.style.gap = "12px";

    trial.grid.forEach((pattern, idx) => {
        const btn = document.createElement("button");
        btn.className = "odd-card";
        btn.style.width = "100%";
        btn.style.padding = "12px";
        btn.style.borderRadius = "8px";
        btn.style.border = "2px solid rgba(11,61,145,0.08)";
        btn.style.background = "#fff";
        btn.style.cursor = "pointer";

        // Inner mini-grid
        const n = Math.sqrt(pattern.length);
        const cells = pattern.map(ch => `<div style="
            display:flex;
            justify-content:center;
            align-items:center;
            background:#f6f9ff;
            border:1px solid #E6EDF5;
            border-radius:4px;
            padding:6px;
            font-size:14px;
            min-width:20px;
            min-height:20px;
        ">${ch}</div>`).join("");
        btn.innerHTML = `<div style="display:grid; grid-template-columns: repeat(${n},1fr); gap:6px;">${cells}</div>`;

        btn.onclick = () => recordOddChoice(idx, false);
        gridDiv.appendChild(btn);
    });
}
  else {
    // NORMAL CASE: one button per row
    trial.grid.forEach((pattern, idx) => {
      const btn = document.createElement("button");
      btn.className = "odd-card";

      if (Array.isArray(pattern)) {
        // single-element array -> plain text
        if (pattern.length === 1) btn.textContent = pattern[0];
        else btn.textContent = pattern.join(" ");
      } else {
        btn.textContent = pattern;
      }

      btn.onclick = () => recordOddChoice(idx, false);
      gridDiv.appendChild(btn);
    });
  }

  // Show trial page
  goToPage(`page-odd-${oddIndex}`);

  // Start progress bar countdown
  const bar = document.getElementById(`odd-bar-${oddIndex}`);
  if (bar) bar.style.width = "100%";
  trialStartTime = Date.now();

  oddInterval = setInterval(() => {
    const elapsed = Date.now() - trialStartTime;
    const pct = Math.max(0, 100 - (elapsed / trial.duration) * 100);
    if (bar) bar.style.width = pct + "%";
  }, 50);

  // Auto timeout if no click
  oddTimeout = setTimeout(() => recordOddChoice(null, true), trial.duration);
}


function recordOddChoice(chosenIdx, timedOut) {
  clearInterval(oddInterval);
  clearTimeout(oddTimeout);

  const trial = oddTrials[oddIndex];
  const correct = chosenIdx === trial.oddIndex;
  const now = Date.now();
  const rt = timedOut ? null : now - trialStartTime;

  formData.oddResults.push({
    trial: oddIndex,
    chosen: chosenIdx,
    correct,
    timedOut,
    rt
  });

  oddIndex++;
  showOddTrial();
}



/****************************************************************************** 
 *                                                                            *
 *                    SYMBOL DECODING TASK (6 trials)                         *
 *                                                                            *
 ******************************************************************************/ 

const symbolTrials = [
  {
    // Trial 1
    code: "△⥉⬤☆△★",
    mapping: [
      "△ = A","▲ = R","□ = S","■ = K",
      "❃ = O","〇 = C","⥉ = M","⬤ = I",
      "★ = L","☆ = N"
    ],
    correct: "AMINAL",
    options: ["ANIMAL","ANIMLA","ANILAM"],
    duration: 20000 
  },
  {
    // Trial 2
    code: "△⥉★■☆▲",
    mapping: [
      "△ = N","▲ = L","□ = I","■ = M",
      "❃ = C","〇 = K","⥉ = O","⬤ = S",
      "★ = R","☆ = A"
    ],
    correct: "NORMAL",
    options: ["NARMOL","ORLMAN","MORLAN"],
    duration: 20000
  },
  {
    // Trial 3
    code: "□△⟴☆❆⥉",
    mapping: [
      "△ = 5","▲ = 1","□ = G","■ = 7",
      "❃ = 3","〇 = 9","⥉ = 2","⬤ = L",
      "★ = O","☆ = 8","⟴ = 4","❆ = R","⊞ = 6"
    ],
    correct: "G548R2",
    options: ["G948R1","G538R2","G847R1"],
    duration: 30000   
  },
{
  // Trial 4
  code: "△〇▲⥉❃❃",
  mapping: [
    "△=T", "▲=E", "□=A", "■=P",
    "❃=S", "〇=H", "⥉=I", "⬤=R",
    "★=C", "☆=N"
  ],
  correct: "THEISS",
  options: ["THSEIS", "THESIS", "THIEAS"],
  duration: 25000
},
{
  // Trial 5
  code: "■❃⟴〇⬤△",
  mapping: [
    "△=4", "▲=7", "□=X", "■=1",
    "❃=6", "〇=3", "⥉=9", "⬤=B",
    "★=Z", "☆=2", "⟴=5", "❆=V", "⊞=8"
  ],
  correct: "1653B4",
  options: ["1653B8", "1633B4", "1683B4"],
  duration: 30000
},
{
  // Trial 6
  code: "〇□▲❆★❃",
  mapping: [
    "△=D", "▲=0", "□=F", "■=3",
    "❃=S", "〇=1", "⥉=7", "⬤=9",
    "★=U", "☆=M", "⟴=5", "❆=W", "⊞=2"
  ],
  correct: "1F0WUS",
  options: ["1F7WUS", "1F0WLS", "1F0WMS"],
  duration: 30000
}



];

let symbolIndex    = 0,
    symbolStart    = null,
    symbolInterval = null;

// 1) Intro “Next” → first trial
document.getElementById("symbol-instr-next").onclick = function() {
  playBackground(2);
  this.disabled = true;
  formData.symbolMeta.start = Date.now();
  symbolIndex = 0;
  formData.symbolResults = { answers: [], accuracy: 0 };
  formData.symbolLogs    = [];
  showNextSymbolTrial();
};

function showNextSymbolTrial() {
  // if all done, stop audio and proceed
  if (symbolIndex >= symbolTrials.length) {
    clearInterval(symbolInterval);
    stopBackground();
    formData.symbolMeta.end      = Date.now();
    formData.symbolMeta.duration = formData.symbolMeta.end - formData.symbolMeta.start;
     
    goToPage("page-magnitude-instr");
    return;
  }

  const trial   = symbolTrials[symbolIndex];
  const section = document.getElementById(`page-symbol-${symbolIndex}`);
  section.innerHTML = ""; 


  // 2) Build the key
  const keyDiv = document.createElement("div");
  keyDiv.className = "symbol-key";
  keyDiv.innerHTML = trial.mapping.join("<br>");
  section.appendChild(keyDiv);

  // 3) Build the prompt
  const codeDiv = document.createElement("div");
  codeDiv.className = "symbol-question";
  codeDiv.innerHTML = `<strong>Decode: ${trial.code}</strong>`;
  section.appendChild(codeDiv);

  // 4) Build shuffled options
  const opts = trial.options.slice();
  opts.push(trial.correct);
  shuffleArray(opts);

  const formEl = document.createElement("form");
  formEl.className = "symbol-options";
  opts.forEach(opt => {
    const lbl = document.createElement("label");
    lbl.className = "option-label";
    lbl.innerHTML = `<input type="radio" name="symbol-${symbolIndex}" value="${opt}" /> ${opt}`;
    formEl.appendChild(lbl);
  });
  section.appendChild(formEl);

  // 5) Auto-advance on choice
  formEl
    .querySelectorAll(`input[name="symbol-${symbolIndex}"]`)
    .forEach(radio => {
      radio.addEventListener("change", () => {
        clearInterval(symbolInterval);
        collectSymbolResponse(false);
      });
    });

  // 6) Progress bar
  const barC = document.createElement("div");
  barC.className = "progress-bar-container";
  const barF = document.createElement("div");
  barF.id        = `symbol-bar-${symbolIndex}`;
  barF.className = "progress-bar-fill";
  barC.appendChild(barF);
  section.appendChild(barC);

  // 7) Show the trial
  goToPage(`page-symbol-${symbolIndex}`);

  // 8) Start timer
  symbolStart = Date.now();
  barF.style.width = "100%";
  clearInterval(symbolInterval);
  symbolInterval = setInterval(() => {
    const elapsed = Date.now() - symbolStart;
    const pct     = Math.max(0, 100 - (elapsed / trial.duration) * 100);
    barF.style.width = pct + "%";
    if (elapsed >= trial.duration) {
      clearInterval(symbolInterval);
      collectSymbolResponse(true);
    }
  }, 100);
}

function collectSymbolResponse(timedOut) {
  const now    = Date.now();
  const radios = Array.from(
    document.querySelectorAll(`input[name="symbol-${symbolIndex}"]`)
  );
  const sel    = radios.find(r => r.checked);
  const answer = sel ? sel.value : null;
  const trial  = symbolTrials[symbolIndex];


  // log full details
  formData.symbolLogs.push({
    trial:     symbolIndex,
    answer,
    correct:   answer === trial.correct,
    timedOut:  !!timedOut,
    rt:        timedOut ? null : (now - symbolStart)
  });

  // update summary
  formData.symbolResults.answers[symbolIndex] = answer;
  if (answer === trial.correct) formData.symbolResults.accuracy++;

  symbolIndex++;
  showNextSymbolTrial();
}



/****************************************************************************** 
 *                                                                            *
 *               MAGNITUDE COMPARISON TASK (5 trials × 7s)                    *
 *                                                                            *
 ******************************************************************************/ 

const magnitudeChoices = [
  { left:"8+9",  right:"5×3",  correct:"left"  },
  { left:"14−6", right:"3×3",  correct:"right" },
  { left:"7×3",  right:"25−3", correct:"right" },
  { left:"12+5", right:"3×5",  correct:"left"  },
  { left:"15−7", right:"3×3",  correct:"right" },
  { left:"9+4",  right:"6×2",  correct:"left"  },
  { left:"18−5", right:"4×3",  correct:"left"  },
  { left:"5×4",  right:"22−3", correct:"left"  },
  { left:"20−8", right:"3×5",  correct:"right" },
  { left:"7×2",  right:"10+3", correct:"left"  },
  { left:"12−7", right:"2×3",  correct:"right" },
  { left:"4×5", right:"11+6",  correct:"left" },
  { left:"19−8", right:"2×6",  correct:"right" },
];
const magnitudeDuration = 7000;

let magnitudeStart, magnitudeTimeout, magnitudeInterval;
let magnitudeIndex = 0;

// 1) “Next” on instructions → first magnitude trial
document.getElementById("magnitude-instr-next").onclick = () => {
  formData.magnitudeMeta.start    = Date.now();
  magnitudeIndex = 0;
  formData.magnitudeResults       = { chosenIndices:[], accuracy:0 };
  formData.magnitudeLogs          = [];
  playBackground(2);
  showMagnitudeTrial();
};

function showMagnitudeTrial() {
  // if done, stop audio & finish
  if (magnitudeIndex >= magnitudeChoices.length) {
    stopBackground();
    formData.magnitudeMeta.end      = Date.now();
    formData.magnitudeMeta.duration = formData.magnitudeMeta.end - formData.magnitudeMeta.start;
    clearTimeout(magnitudeTimeout);
    clearInterval(magnitudeInterval);
     
    return goToPage("page-post-survey");
  }


  // show trial
  goToPage(`page-magnitude-${magnitudeIndex}`);
  magnitudeStart = Date.now();

  // wire up response buttons
  ["left","right"].forEach(side => {
    const btn = document.getElementById(`mag-${side}-${magnitudeIndex}`);
    btn.onclick = () => recordMagnitudeChoice(side, false);
  });

  // reset + animate progress bar
  const bar = document.getElementById(`magnitude-bar-${magnitudeIndex}`);
  bar.style.width = "100%";
  clearTimeout(magnitudeTimeout);
  clearInterval(magnitudeInterval);

  magnitudeInterval = setInterval(() => {
    const elapsed = Date.now() - magnitudeStart;
    const pct     = Math.max(0, 100 - (elapsed / magnitudeDuration) * 100);
    bar.style.width = pct + "%";
    if (elapsed >= magnitudeDuration) {
      clearInterval(magnitudeInterval);
    }
  }, 100);

  // enforce timeout
  magnitudeTimeout = setTimeout(() => {
    recordMagnitudeChoice(null, true);
  }, magnitudeDuration);
}

function recordMagnitudeChoice(chosen, timedOut) {
  // stop audio & timers immediately
  clearTimeout(magnitudeTimeout);
  clearInterval(magnitudeInterval);

  const now     = Date.now();
  const trial   = magnitudeChoices[magnitudeIndex];
  const correct = (chosen === trial.correct);

  // log full trial
  formData.magnitudeLogs.push({
    trial:   magnitudeIndex,
    chosen,
    correct,
    timedOut: !!timedOut,
    rt:       timedOut ? null : (now - magnitudeStart)
  });

  // update summary
  formData.magnitudeResults.chosenIndices.push(chosen);
  if (correct) formData.magnitudeResults.accuracy++;

  // next
  magnitudeIndex++;
  showMagnitudeTrial();
}





/******************************************************************************  
 *                            POST-TASK SURVEY                                *  
 ******************************************************************************/  

document.getElementById("post-survey-submit").addEventListener("click", async (evt) => {
  evt.preventDefault();
  const submitBtn = document.getElementById("post-survey-submit");
  if (submitBtn.disabled) return;
  submitBtn.disabled = true;

  const ps1 = document.querySelector("input[name='ps1']:checked"),
        ps2 = document.querySelector("input[name='ps2']:checked"),
        ps3 = document.querySelector("input[name='ps3']:checked");

  if (!ps1 || !ps2 || !ps3) {
    alert("Please answer all post-survey questions before submitting.");
    submitBtn.disabled = false;
    return;
  }

  // Ensure start exists (set earlier when navigating to post-survey)
  const psStart = formData.postSurvey && formData.postSurvey.start ? formData.postSurvey.start : Date.now();

  formData.postSurvey = {
    ps1: +ps1.value,
    ps2: +ps2.value,
    ps3: +ps3.value,
    end: Date.now(),
    duration: Date.now() - psStart
  };

  const payload = {
    participant_id: formData.participantID,
    session_token:  formData.sessionToken,
    answers:        formData
  };

  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch("http://127.0.0.1:8000/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (resp.status === 401) {
      alert("Session token invalid. Please restart the study.");
      submitBtn.disabled = false;
      return;
    }
    if (resp.status === 409) {
      alert("This participant already submitted. If this is incorrect, contact the researcher.");
      submitBtn.disabled = false;
      return;
    }

    // parse body (will throw if not JSON)
    const result = await resp.json();

    if (result && result.success) {
      if (window.DEBUG) console.info("✅ Data sent successfully");
      localStorage.setItem("participantStatus", "completed");
      goToPage("page-final-thankyou");
    } else {
      const detail = result && result.detail ? result.detail : "Submission failed";
      throw new Error(detail);
    }
  } catch (err) {
    if (err.name === "AbortError") {
      alert("Request timed out. Check your network and try again.");
    } else {
      derr("❌ Failed to submit data:", err);
      alert("There was a problem sending your data. Please try again or contact the researcher.");
    }
    submitBtn.disabled = false;
  }
});
});







window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  e.returnValue = '';
})
