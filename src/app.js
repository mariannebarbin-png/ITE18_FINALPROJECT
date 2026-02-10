import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, raycaster, mouse;
let heartModel, heartMesh;
let currentSection = 0;
let currentMode = 'explore'; 
let isGuidedMode = false;
let isLearnMode = false;
let animationFrameId;

const canvas = document.getElementById("anatomyCanvas");

// Heart sections
const heartSections = [
  {
    title: "The Human Heart",
    description: "The heart is a muscular organ about the size of a fist, located slightly left of center in your chest. It pumps blood throughout your body through a network of blood vessels called the circulatory system.",
    facts: "Your heart beats about 100,000 times per day, pumping roughly 2,000 gallons (7,500 liters) of blood!",
    learnMore: "The heart has four chambers: two upper chambers (atria) and two lower chambers (ventricles)."
  },
  {
    title: "Left Ventricle - The Powerhouse",
    description: "The left ventricle is the heart's main pumping chamber. It receives oxygen-rich blood from the left atrium and pumps it through the aortic valve into the aorta, which distributes blood to the entire body.",
    facts: "The left ventricle has the thickest muscular walls (8-12mm thick) of all heart chambers because it must generate enough pressure to pump blood throughout your entire body!",
    learnMore: "At rest, the left ventricle pumps about 5 liters of blood per minute. During intense exercise, this can increase to 25+ liters per minute!"
  },
  {
    title: "Right Ventricle - Lung Connection",
    description: "The right ventricle receives oxygen-depleted blood from the right atrium and pumps it through the pulmonary artery to the lungs, where it picks up oxygen and releases carbon dioxide.",
    facts: "The right ventricle wall is only 3-5mm thick - about 1/3 the thickness of the left ventricle - because it only needs to pump blood to the nearby lungs at lower pressure.",
    learnMore: "Despite being 'weaker,' the right ventricle pumps the same volume of blood as the left ventricle - just to a closer destination!"
  },
  {
    title: "Left Atrium - Oxygen Receiver",
    description: "The left atrium receives oxygen-rich blood returning from the lungs through four pulmonary veins (two from each lung). It then passes this blood down to the left ventricle through the mitral valve.",
    facts: "The left atrium has relatively thin walls because it only needs to push blood a short distance down to the left ventricle.",
    learnMore: "When the left atrium contracts, it completes the final 20-30% of ventricular filling, giving the ventricle a final 'boost' before it pumps."
  },
  {
    title: "Right Atrium - Natural Pacemaker",
    description: "The right atrium receives oxygen-poor blood from the body through two large veins: the superior vena cava (from upper body) and inferior vena cava (from lower body). It contains the sinoatrial (SA) node - the heart's natural pacemaker.",
    facts: "The SA node generates electrical impulses 60-100 times per minute at rest, controlling your heart rhythm. This is why the right atrium is sometimes called the 'conductor' of the heart!",
    learnMore: "The right atrium also contains the coronary sinus, which returns blood from the heart muscle itself back into circulation."
  },
  {
    title: "The Aorta - Life's Highway",
    description: "The aorta is the largest artery in the body, about 2.5cm (1 inch) in diameter. It carries oxygen-rich blood from the left ventricle to all parts of your body. It curves over the heart like a candy cane before descending through the chest and abdomen.",
    facts: "The aorta can handle pressures up to 120 mmHg (millimeters of mercury). It's about 30cm long and branches into smaller arteries that supply every organ and tissue.",
    learnMore: "The first branches of the aorta are the coronary arteries, which supply blood to the heart muscle itself!"
  },
  {
    title: "Pulmonary Artery - The Exception",
    description: "The pulmonary artery carries oxygen-poor blood from the right ventricle to the lungs. It's unique because it's the only artery in the body that carries deoxygenated blood!",
    facts: "The pulmonary artery quickly splits into left and right branches, one for each lung, where the blood picks up oxygen and releases carbon dioxide.",
    learnMore: "Remember: Arteries carry blood AWAY from the heart (not necessarily oxygenated), while veins carry blood TO the heart."
  },
  {
    title: "Heart Valves - One-Way Doors",
    description: "The heart has four valves that ensure blood flows in only one direction: Tricuspid (right atrium→ventricle), Pulmonary (right ventricle→pulmonary artery), Mitral/Bicuspid (left atrium→ventricle), and Aortic (left ventricle→aorta).",
    facts: "Your heart valves open and close over 100,000 times every single day! The 'lub-dub' sound of your heartbeat is actually the sound of these valves snapping shut.",
    learnMore: "Valve problems (stenosis or regurgitation) are common heart conditions that can require surgical repair or replacement."
  },
  {
    title: "The Septum - The Great Divider",
    description: "The septum is a thick muscular wall (10-12mm) that completely separates the left and right sides of the heart, preventing oxygen-rich and oxygen-poor blood from mixing.",
    facts: "Holes in the septum (septal defects) are among the most common congenital heart defects, affecting about 1 in 1,000 births. Most small defects close on their own, but larger ones may require surgery.",
    learnMore: "The septum is crucial for efficient circulation - without it, mixed blood would reduce oxygen delivery to your body."
  },
  {
    title: "The Myocardium - Heart Muscle",
    description: "The myocardium is the thick middle layer of heart muscle responsible for contracting and pumping blood. It's made of specialized cardiac muscle cells that can contract rhythmically throughout your entire life without tiring.",
    facts: "Your heart muscle contains about 2-3 billion cardiac muscle cells. Unlike skeletal muscle, cardiac muscle cells are branched and interconnected, allowing electrical signals to spread rapidly.",
    learnMore: "The myocardium has the highest oxygen demand of any tissue in the body relative to its weight - it never rests!"
  }
];

const allQuizQuestions = [
  {
    question: "Which chamber of the heart has the thickest muscular walls?",
    options: ["Left Ventricle", "Right Ventricle", "Left Atrium", "Right Atrium"],
    correct: 0,
    explanation: "The left ventricle has walls 8-12mm thick because it must generate enough pressure to pump blood throughout the entire body, unlike the right ventricle which only pumps to the nearby lungs at lower pressure.",
    difficulty: "easy"
  },
  {
    question: "Where is the heart's natural pacemaker located?",
    options: ["Left Ventricle", "Right Atrium", "Left Atrium", "Septum"],
    correct: 1,
    explanation: "The sinoatrial (SA) node in the right atrium generates electrical impulses 60-100 times per minute at rest, controlling the heart's rhythm.",
    difficulty: "easy"
  },
  {
    question: "What makes the Pulmonary Artery unique?",
    options: ["Largest artery", "Carries deoxygenated blood", "Highest pressure", "Connects to brain"],
    correct: 1,
    explanation: "The pulmonary artery is the only artery in the body that carries deoxygenated blood - it transports blood from the right ventricle to the lungs for oxygenation.",
    difficulty: "easy"
  },
  {
    question: "How many times does your heart beat per day?",
    options: ["10,000 times", "50,000 times", "100,000 times", "500,000 times"],
    correct: 2,
    explanation: "Your heart beats approximately 100,000 times per day, which equals about 35 million times per year and over 2.5 billion times in an average lifetime!",
    difficulty: "easy"
  },
  {
    question: "What is the function of the septum?",
    options: ["Pumps blood", "Separates left/right sides", "Generates electrical signals", "Filters blood"],
    correct: 1,
    explanation: "The septum is a 10-12mm thick muscular wall that completely separates the left and right sides of the heart, preventing oxygen-rich and oxygen-poor blood from mixing.",
    difficulty: "medium"
  },
  {
    question: "Which valve prevents blood from flowing back into the left ventricle?",
    options: ["Tricuspid valve", "Pulmonary valve", "Aortic valve", "Mitral valve"],
    correct: 2,
    explanation: "The aortic valve prevents blood from flowing backward into the left ventricle after it contracts. It's located between the left ventricle and the aorta.",
    difficulty: "medium"
  },
  {
    question: "What is the primary function of the right atrium?",
    options: ["Pump blood to lungs", "Receive deoxygenated blood from body", "Pump blood to entire body", "Generate heart rhythm"],
    correct: 1,
    explanation: "The right atrium receives deoxygenated blood from the body through the superior and inferior vena cava, and it contains the SA node which acts as the heart's pacemaker.",
    difficulty: "medium"
  },
  {
    question: "Which arteries supply blood to the heart muscle itself?",
    options: ["Pulmonary arteries", "Coronary arteries", "Carotid arteries", "Femoral arteries"],
    correct: 1,
    explanation: "The coronary arteries are the first branches of the aorta and supply oxygen-rich blood to the heart muscle (myocardium) itself.",
    difficulty: "medium"
  },
  {
    question: "How much blood does the heart pump per day at rest?",
    options: ["200 liters", "750 liters", "2,000 gallons (~7,500 liters)", "10,000 liters"],
    correct: 2,
    explanation: "At rest, the heart pumps about 5 liters per minute, which equals approximately 7,500 liters (2,000 gallons) per day. During exercise, this can triple!",
    difficulty: "hard"
  },
  {
    question: "What percentage of ventricular filling is completed by atrial contraction?",
    options: ["10-15%", "20-30%", "40-50%", "60-70%"],
    correct: 1,
    explanation: "Atrial contraction completes the final 20-30% of ventricular filling, providing a final 'boost' that helps optimize cardiac output.",
    difficulty: "hard"
  },
  {
    question: "Which valve defect would cause blood to flow backward into the left atrium during ventricular systole?",
    options: ["Aortic stenosis", "Mitral regurgitation", "Tricuspid stenosis", "Pulmonary regurgitation"],
    correct: 1,
    explanation: "Mitral regurgitation (or insufficiency) occurs when the mitral valve doesn't close completely, allowing blood to flow backward into the left atrium during ventricular contraction.",
    difficulty: "hard"
  },
  {
    question: "What is the normal pressure range in the aorta (in mmHg)?",
    options: ["60-80 mmHg", "80-100 mmHg", "100-120 mmHg", "120-140 mmHg"],
    correct: 2,
    explanation: "The aorta handles pressures typically in the 100-120 mmHg range. A systolic pressure of 120 mmHg is the upper limit of normal blood pressure.",
    difficulty: "hard"
  }
];

// Filter questions by difficulty
function getQuestionsByDifficulty(difficulty) {
  return allQuizQuestions.filter(q => q.difficulty === difficulty);
}

let quizQuestions = getQuestionsByDifficulty("medium");

let currentQuizIndex = 0;
let quizScore = 0;
let answeredQuestions = 0;

init();
animate();
initQuiz();
initUIControls();
initRandomFacts();
initModeControls();

function initUIControls() {
  // Open quiz modal
  document.getElementById("quiz-nav-btn").addEventListener("click", () => {
    document.getElementById("quiz-modal").classList.remove("hidden");
  });

  // Close quiz modal
  document.getElementById("close-quiz-modal").addEventListener("click", () => {
    document.getElementById("quiz-modal").classList.add("hidden");
  });

  // Close quiz modal when clicking outside
  document.getElementById("quiz-modal").addEventListener("click", (e) => {
    if (e.target.id === "quiz-modal") {
      document.getElementById("quiz-modal").classList.add("hidden");
    }
  });

  // Close sidebar
  document.getElementById("close-sidebar").addEventListener("click", () => {
    const sidebar = document.getElementById("learn-sidebar");
    sidebar.classList.remove("show");
  });
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e27);

  camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Enhanced lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight2.position.set(-5, 3, -5);
  scene.add(dirLight2);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  loadHeartModel();

  window.addEventListener("resize", onResize);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousemove", onHover);
}

function loadHeartModel() {
  const loader = new GLTFLoader();
  
  loader.load(
    "./public/heart.glb",
    (gltf) => {
      heartModel = gltf.scene;
      
      // Find the mesh
      heartModel.traverse((child) => {
        if (child.isMesh) {
          heartMesh = child;
          heartMesh.material = heartMesh.material.clone();
          heartMesh.material.emissive = new THREE.Color(0x000000);
        }
      });
      
      scene.add(heartModel);
      
      // Center model
      const box = new THREE.Box3().setFromObject(heartModel);
      const center = box.getCenter(new THREE.Vector3());
      heartModel.position.sub(center);
      
      // Calculate size and scale to fit in view
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
      
      camera.position.z = cameraZ;
      camera.lookAt(heartModel.position);
      
      console.log("Heart model loaded!");
    },
    undefined,
    (error) => console.error("Error loading model:", error)
  );
}

function onHover(event) {
  if (!heartMesh) return;
  
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(heartMesh, false);

  if (intersects.length > 0 && isLearnMode) {
    heartMesh.material.emissive.setHex(0x3a4a8a);
    canvas.style.cursor = "pointer";
  } else {
    heartMesh.material.emissive.setHex(0x000000);
    canvas.style.cursor = "grab";
  }
}

function onClick(event) {
  // Only allow clicks in learn mode
  if (!isLearnMode || !heartMesh) return;
  
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(heartMesh, false);

  if (intersects.length > 0) {
    // Flash effect
    heartMesh.material.emissive.setHex(0xff6600);
    setTimeout(() => {
      heartMesh.material.emissive.setHex(0x000000);
    }, 200);
    
    // Show blood flow animation
    showBloodFlowAnimation();
    
    // Cycle through sections
    currentSection = (currentSection + 1) % heartSections.length;
    showSideBar(currentSection);
  }
}
function showSideBar(index) {
  const section = heartSections[index];
  const sidebar = document.getElementById("learn-sidebar");
  const sidebarContent = document.getElementById("sidebar-content");
  
  if (!sidebar || !sidebarContent) return;

  sidebarContent.innerHTML = `
    <h2>${section.title}</h2>
    <p>${section.description}</p>
    <p><strong>Fact:</strong> ${section.facts}</p>
    <p><strong>Learn More:</strong> ${section.learnMore}</p>
  `;
  
  sidebar.classList.add("show");
}

function showSection(index) {
  const section = heartSections[index];
  // This function is kept for backward compatibility but no longer used
}

function onResize() {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Quiz System
function initQuiz() {
  loadQuizQuestion(0);
  
  // Difficulty change handler
  document.getElementById("difficulty-select")?.addEventListener("change", (e) => {
    const selectedDifficulty = e.target.value;
    quizQuestions = getQuestionsByDifficulty(selectedDifficulty);
    currentQuizIndex = 0;
    quizScore = 0;
    answeredQuestions = 0;
    quizQuestions.forEach(q => {
      q.answered = false;
      q.userAnswer = null;
    });
    loadQuizQuestion(0);
  });
}

function loadQuizQuestion(index) {
  const question = quizQuestions[index];
  const container = document.getElementById("quiz");
  
  container.innerHTML = `
    <h3> Knowledge Check</h3>
    <div id="quiz-score">Score: <span id="score">${quizScore}</span>/<span id="total">${answeredQuestions}</span></div>
    <div id="flashcard">
      <div id="flashcard-question">${question.question}</div>
      <div id="flashcard-options">
        ${question.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}" ${question.answered ? 'disabled' : ''} 
                  ${question.answered && i === question.correct ? 'style="background: #10b981; color: white; border-color: #10b981;"' : ''}
                  ${question.answered && i === question.userAnswer && i !== question.correct ? 'style="background: #ef4444; color: white; border-color: #ef4444;"' : ''}>
            ${opt}
          </button>
        `).join('')}
      </div>
      <div id="flashcard-feedback">${question.answered ? `
        <div class="${question.userAnswer === question.correct ? 'feedback correct' : 'feedback incorrect'}">
          <strong>${question.userAnswer === question.correct ? '✓ Correct!' : '✗ Incorrect'}</strong>
          <p>${question.explanation}</p>
        </div>
      ` : ''}</div>
      <div id="flashcard-navigation">
        <button id="prev-card" ${index === 0 ? 'disabled' : ''}>← Previous</button>
        <span id="card-number">Question ${index + 1} of ${quizQuestions.length}</span>
        <button id="next-card">${index === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next →'}</button>
      </div>
    </div>
  `;
  
  // Add click handlers
  document.querySelectorAll(".quiz-option").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const selectedIndex = parseInt(e.target.dataset.index);
      handleQuizAnswer(index, selectedIndex);
    });
  });
  
  // Re-add navigation handlers
  document.getElementById("prev-card").addEventListener("click", () => {
    if (currentQuizIndex > 0) {
      currentQuizIndex--;
      loadQuizQuestion(currentQuizIndex);
    }
  });

  document.getElementById("next-card").addEventListener("click", () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      currentQuizIndex++;
      loadQuizQuestion(currentQuizIndex);
    } else {
      showQuizResults();
    }
  });
}

function handleQuizAnswer(questionIndex, selectedIndex) {
  const question = quizQuestions[questionIndex];
  if (question.answered) return;
  
  question.answered = true;
  question.userAnswer = selectedIndex;
  answeredQuestions++;
  
  if (selectedIndex === question.correct) {
    quizScore++;
  }
  
  loadQuizQuestion(questionIndex);
}

function showQuizResults() {
  const percentage = Math.round((quizScore / quizQuestions.length) * 100);
  let message, emoji;
  
  if (percentage === 100) {
    message = "Perfect! You're a heart anatomy expert!";
    emoji = "🏆";
  } else if (percentage >= 80) {
    message = "Excellent! You have strong knowledge!";
    emoji = "🌟";
  } else if (percentage >= 60) {
    message = "Good effort! Keep learning!";
    emoji = "📚";
  } else {
    message = "Keep studying! You'll get there!";
    emoji = "💙";
  }
  
  const container = document.getElementById("quiz");
  container.innerHTML = `
    <h3>Quiz Complete!</h3>
    <div id="quiz-results">
      <div class="result-score">
        <div class="emoji">${emoji}</div>
        <h2>${quizScore} / ${quizQuestions.length}</h2>
        <p>${percentage}%</p>
      </div>
      <p class="result-message">${message}</p>
      <button id="restart-quiz" class="quiz-option">Restart Quiz</button>
    </div>
  `;
  
  document.getElementById("restart-quiz").addEventListener("click", () => {
    currentQuizIndex = 0;
    quizScore = 0;
    answeredQuestions = 0;
    quizQuestions.forEach(q => {
      q.answered = false;
      q.userAnswer = null;
    });
    initQuiz();
  });
}

// LEARN MODE CONTROLS
function initModeControls() {
  const learnModeBtn = document.getElementById("learn-mode-btn");
  
  if (learnModeBtn) {
    learnModeBtn.addEventListener("click", () => {
      isLearnMode = !isLearnMode;
      
      if (isLearnMode) {
        learnModeBtn.classList.add("active");
        currentSection = 0;
        // Reset sidebar when entering learn mode
        document.getElementById("learn-sidebar").classList.remove("show");
      } else {
        learnModeBtn.classList.remove("active");
        document.getElementById("learn-sidebar").classList.remove("show");
      }
    });
  }
}

// RANDOM FACTS DISPLAY
function initRandomFacts() {
  const facts = heartSections.map(s => s.facts);
  const popup = document.getElementById('heart-facts-popup');
  
  setInterval(() => {
    if (popup && Math.random() > 0.7) {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      document.getElementById('random-fact').textContent = randomFact;
      popup.style.display = 'block';
      
      setTimeout(() => {
        popup.style.display = 'none';
      }, 5000);
    }
  }, 15000);
}

// Update progress bar
function updateProgressBar() {
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  
  if (progressFill) {
    const percentage = ((currentSection + 1) / heartSections.length) * 100;
    progressFill.style.width = percentage + '%';
  }
  
  if (progressText) {
    progressText.textContent = `Section ${currentSection + 1} of ${heartSections.length}`;
  }
}

// BLOOD FLOW VISUALIZATION
function showBloodFlowAnimation() {
  const overlay = document.getElementById('blood-flow-overlay');
  if (!overlay) return;
  
  overlay.style.display = 'block';
  overlay.innerHTML = '';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 800 600');
  svg.style.cssText = 'position: absolute; top: 0; left: 0;';
  
  const pathDef = `
    <defs>
      <style>
        @keyframes flow {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        .blood-flow {
          stroke: #ff6b6b;
          stroke-width: 3;
          fill: none;
          opacity: 0.6;
          stroke-dasharray: 20, 30;
          animation: flow 1.5s linear infinite;
        }
      </style>
    </defs>
  `;
  
  svg.innerHTML = pathDef + `
    <path class="blood-flow" d="M 400,300 L 500,250" />
    <path class="blood-flow" d="M 400,300 L 300,250" />
    <circle cx="400" cy="300" r="20" fill="rgba(255,107,107,0.3)" />
  `;
  
  overlay.appendChild(svg);
  
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 3000);
}

// Add progress indicator
setTimeout(() => {
  const progress = document.createElement("div");
  progress.id = "learning-progress";
  progress.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(124, 58, 237, 0.9);
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 1000;
  `;
}, 1000);