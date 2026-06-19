// ─────────────────────────────────────────────────────────────────────────────
//  AIryan FC — single source of truth.
//  Edit THIS file to update the site, the card OVR, and the attribute ratings.
//  Every component reads from the exported `site` object below.
// ─────────────────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface CardStat {
  /** Three-letter attribute code shown on the card, e.g. "SYS". */
  key: string;
  /** Rating 0–99. */
  value: number;
  /** What the code means (used for screen-reader text + tooltips). */
  meaning: string;
}

export interface CareerStat {
  value: string;
  label: string;
}

export interface ImpactStat {
  value: string;
  label: string;
  /** Short qualifier shown under the label, e.g. "in production". */
  sub?: string;
}

export interface ExperienceRole {
  title: string;
  period: string;
  bullets: string[];
  /** Optional standout highlight rendered as a "Star Performer" badge line. */
  badge?: string;
}

export interface Experience {
  /** Company = club. */
  club: string;
  location: string;
  period: string;
  roles: ExperienceRole[];
}

export interface AcademyEntry {
  school: string;
  location: string;
  detail: string;
  period: string;
}

export interface Project {
  title: string;
  stack: string[];
  bullets: string[];
  repo: string;
  /** Football "result" badge shown on the match card, e.g. "MOTM". */
  result?: string;
  /** True for the on-theme football project (gets a subtle highlight). */
  onTheme?: boolean;
}

export interface LineupPlayer {
  /** The skill, shown as the player's name. */
  name: string;
  /** FUT-style rating 0–99. */
  rating: number;
  captain?: boolean;
}

export interface LineupFormation {
  /** Shape, e.g. "4-3-3" (D-M-F summing to 10 outfielders). */
  name: string;
  /** Short style label shown beside the shape, e.g. "AI-first". */
  label: string;
  /** Its own 11-skill XI, ordered GK → defence → midfield → attack. */
  squad: LineupPlayer[];
}

export interface Lineup {
  /** Each formation fields its own distinct XI; the first is the default. */
  formations: LineupFormation[];
}

export interface Honour {
  icon: string;
  title: string;
  org: string;
  href?: string;
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface Social {
  label: string;
  href: string;
}

export interface Site {
  identity: {
    name: string;
    role: string;
    subtitle: string;
    location: string;
    email: string;
    phone: string;
    showPhone: boolean;
    github: string;
    linkedin: string;
    leetcode: string;
    resume: string;
    /** Public link to academic certifications (e.g. a Google Drive folder). */
    certifications: string;
    /** Personal brand tagline / motto. */
    tagline: string;
  };
  nav: NavLink[];
  hero: {
    eyebrow: string;
    name: string;
    positionLine: string;
    oneLiner: string;
    /** Optional availability chip, e.g. "Open to AI/ML roles". */
    status?: string;
  };
  card: {
    ovr: number;
    position: string;
    /** Full role shown as a reveal beat in the walkout, e.g. "AI ENGINEER". */
    roleBeat: string;
    club: string;
    nation: string;
    nationFlagEmoji: string;
    stats: CardStat[];
    /**
     * OPTIONAL — a rigged 3D human model for the walkout. Leave undefined to use
     * the built-in stylized figure. To get a realistic walking human:
     *   1. Make a free rigged avatar (e.g. readyplayer.me) or grab a CC0 / Mixamo
     *      character with a "walk" animation and export it as .glb.
     *   2. Drop the file in `public/` (e.g. public/player.glb).
     *   3. Set `model` below to point at it.
     * If the file is missing or fails to load, the scene falls back to the figure.
     */
    model?: {
      url: string; // e.g. "/player.glb"
      walkClip?: string; // animation clip name to play (defaults to the first clip)
      scale?: number; // default 1
      yOffset?: number; // default 0
    };
  };
  careerStats: CareerStat[];
  impactStats: ImpactStat[];
  /** Scout's verdict — a one-line summary plus crisp strength bullets. */
  profile: { verdict: string; points: string[] };
  experience: Experience[];
  academy: AcademyEntry[];
  projects: Project[];
  honours: Honour[];
  lineup: Lineup;
  skills: SkillGroup[];
  contact: {
    heading: string;
    body: string;
    primaryLabel: string;
    socials: Social[];
  };
}

export const site: Site = {
  identity: {
    name: "Aryan Bhavsar",
    role: "Machine Learning Systems Engineer",
    subtitle: "Forward-Deployed AI & Full-Stack",
    location: "Ahmedabad, India",
    email: "aryanbhavsar.ab23@gmail.com",
    phone: "+91 7016814697",
    showPhone: false, // privacy default — flip to true to expose the phone number
    github: "https://github.com/driizzyybreezzyy",
    linkedin: "https://linkedin.com/in/-aryan-bhavsar",
    leetcode: "https://leetcode.com/u/driizzyybreezzyy/",
    resume: "/resume.pdf",
    certifications:
      "https://drive.google.com/drive/folders/1_eo96b3lBmMMXa2kCTDJArWBdAsqbyHU",
    tagline:
      "AImaginist | Struggling with AI, Learning to Building Agents, Having Fun",
  },

  nav: [
    { label: "Profile", href: "#profile" },
    { label: "Career", href: "#career" },
    { label: "Highlights", href: "#highlights" },
    { label: "Honours", href: "#honours" },
    { label: "Attributes", href: "#attributes" },
    { label: "Sign me", href: "#contact" },
  ],

  hero: {
    eyebrow: "AIRYAN FC · 2026 SPECIAL",
    name: "ARYAN BHAVSAR",
    positionLine: "AI ENG · MACHINE LEARNING SYSTEMS ENGINEER",
    oneLiner:
      "I build production AI end to end — from fine-tuning the model to shipping the product.",
    status: "Open to AI/ML roles",
  },

  card: {
    ovr: 99,
    position: "AI ENG",
    roleBeat: "AI ENGINEER",
    club: "AIryan FC",
    nation: "India",
    nationFlagEmoji: "🇮🇳",
    stats: [
      { key: "GEN AI", value: 99, meaning: "Generative AI" },
      { key: "FASTAPI", value: 95, meaning: "FastAPI / backend services" },
      { key: "LLMs", value: 98, meaning: "LLMs & VLMs" },
      { key: "BACKEND", value: 93, meaning: "Backend & systems" },
      { key: "PRODUCT", value: 90, meaning: "Product & shipping" },
      { key: "RESEARCH", value: 88, meaning: "Research" },
    ],
    // Realistic rigged character for the walkout (.fbx or .glb). FBX is auto-fit
    // to height; the first animation clip plays. Swap the file in public/ to change.
    model: { url: "/player.fbx", yOffset: 0 },
  },

  // Personal "career stats" shown under the hero. These glorify the player, not a
  // single project. ▸ EDIT the values below to keep them accurate — especially the
  // ones marked PLACEHOLDER (your live LeetCode count and exact years of experience).
  careerStats: [
    { value: "1.5+", label: "Years pro" }, // PLACEHOLDER — set to your real tenure
    { value: "100+", label: "LeetCode solved" }, // PLACEHOLDER — set to your real count
    { value: "8.65", label: "CGPA" },
    { value: "2", label: "Papers published" },
  ],

  // Headline production impact — the numbers HR scans for. Surfaced as a "match
  // stats" band so they aren't buried in the experience bullets.
  impactStats: [
    { value: "50K+", label: "Docs / day", sub: "served in production" },
    { value: "90%+", label: "Extraction accuracy", sub: "at $0 inference cost" },
    { value: "15×", label: "Faster per doc", sub: "15s → 1s pipeline" },
    { value: "−33%", label: "Operating cost", sub: "+10% profit / quarter" },
  ],

  profile: {
    verdict:
      "A versatile, production-minded AI engineer who covers the whole pitch — from model internals to the shipped product.",
    points: [
      "Ships production GenAI end to end — fine-tuned LLMs/VLMs served on in-house GPUs at scale.",
      "Built a multi-agent system with FastAPI integrated with LLMs for intelligent workflow automation.",
      "Automated real-time document processing pipelines, cutting manual review headcount by 80% and reducing operational costs by a third.",
      "Applied research ML and DL field with two published papers (ScienceDirect, IEEE).",
      "Built deep-learning models for satellite imagery at ISRO.",
      "End-to-end delivery on products mini live project in VIT, on a solid CS foundation (8.65 CGPA).",
      "Represented Gujarat at U-17 — national-level football & athletics.",
    ],
  },

  experience: [
    {
      club: "Hitech Digital Solutions",
      location: "Ahmedabad, India",
      period: "Sept 2025 – Present",
      roles: [
        {
          title:
            "Machine Learning Systems Engineer (Forward-Deployed AI & Full-Stack)",
          period: "Mar 2026 – Present",
          bullets: [
            "Architected and built an in-house real-estate document extraction & classification platform end to end (React/Vite frontend, FastAPI backend, SQLite job queue) as primary ML/full-stack engineer on a 4-person team.",
            "Replaced a paid Azure OCR service and a legacy BERT classifier with fine-tuned open-source OCR (DocTR, Donut, Monkey OCR) and LLMs/VLMs (Qwen 2/2.5/3, Mistral, InternVL) using LoRA fine-tuning via Unsloth — 90%+ extraction accuracy at zero inference cost on in-house GPUs.",
            "Engineered a vLLM inference layer with sidecar health monitoring and zero-downtime model hot-swapping; cut per-document time (deed 15s→1s, mortgage 25s→6s, classification 5s→0.5s) while scaling to 50,000+ documents/day in production.",
            "Built a confidence-scoring system routing low-confidence predictions to manual review, cutting verification headcount from 500 to under 100 and contributing to a 33% operational cost reduction and 10% profit increase last quarter; deployed via RunPod & Docker.",
          ],
          badge:
            "Star Performer of the Month & Quarter for leading the document-intelligence platform.",
        },
        {
          title: "Graduate Engineer Trainee (Jr. Data Scientist)",
          period: "Sept 2025 – Feb 2026",
          bullets: [
            "Built an Intelligent Pricing & Changelog Management System, benchmarking open-source models.",
            "Applied GPT-4o Vision with chain-of-thought prompting on complex menu structures and hybrid reconciliation via Sentence-Transformers to track price elasticity and automate data entry with Pydantic schemas.",
          ],
        },
      ],
    },
    {
      club: "Hyperface Technologies Pvt. Ltd.",
      location: "Bengaluru, India",
      period: "Feb 2025 – Aug 2025",
      roles: [
        {
          title: "AI Researcher (Generative AI Team)",
          period: "Feb 2025 – Aug 2025",
          bullets: [
            "Architected a multi-agent system with FastAPI integrated with LLMs (GPT-4, Gemini) for intelligent workflow automation.",
            "Engineered agent-level prompt strategies and pipeline logic, improving response accuracy and reducing latency.",
            "Built an evaluation framework using Hugging Face open-source models to benchmark LLMs.",
          ],
        },
      ],
    },
    {
      club: "Indian Space Research Organisation (ISRO)",
      location: "Ahmedabad, India",
      period: "Oct 2024 – Jan 2025",
      roles: [
        {
          title: "Machine Learning Intern",
          period: "Oct 2024 – Jan 2025",
          bullets: [
            "Designed a deep-learning classifier to distinguish snow vs. cloud cover in satellite imagery using custom CNN architectures.",
            "Improved crop-yield prediction by aggregating multi-spectral imagery and analyzing temporal patterns.",
          ],
        },
      ],
    },
  ],

  academy: [
    {
      school: "Vellore Institute of Technology",
      location: "Chennai",
      detail: "B.Tech, Computer Science & Engineering — CGPA 8.65 / 10",
      period: "2021 – 2025",
    },
    {
      school: "Zydus School for Excellence",
      location: "Ahmedabad",
      detail: "Higher Secondary (Class XII) — 84%",
      period: "2021",
    },
    {
      school: "Zydus School for Excellence",
      location: "Ahmedabad",
      detail: "Secondary (Class X) — 89%",
      period: "2019",
    },
  ],

  projects: [
    {
      title: "Multi-Agent Real Estate Copilot",
      stack: ["Python", "FastAPI", "Gemini", "Docker"],
      bullets: [
        "Multi-agent backend routing queries between a vision-capable Property Agent and a text-based Tenancy Agent.",
        "Gemini Pro Vision for real-time property-image analysis in a Next.js chat UI.",
      ],
      repo: "https://github.com/driizzyybreezzyy/Multi-Agentic-Real-Estate-Chatbot",
      result: "MOTM",
    },
    {
      title: "Virtual Football Analysis",
      stack: ["YOLOv8", "OpenCV", "Flask", "CNN"],
      bullets: [
        "Real-time player and ball tracking with YOLOv8 served via a Flask web app.",
        "Automated event-based highlight generation using time-indexed detection.",
      ],
      repo: "https://github.com/driizzyybreezzyy/Football-Analysis",
      result: "Hat-trick",
      onTheme: true,
    },
    {
      title: "Voice Authenticator",
      stack: ["Flask", "SpeechBrain", "Hugging Face", "Docker"],
      bullets: [
        "Voice-biometric login — enrols a speaker, then verifies identity from a fresh clip using ECAPA-TDNN embeddings and cosine similarity.",
        "In-browser real-time audio capture, SQLite-backed voice profiles, containerised with Docker.",
      ],
      repo: "https://github.com/driizzyybreezzyy/Voice-Authenticator",
      result: "Clean sheet",
    },
    {
      title: "AI Fitness Coach",
      stack: ["MediaPipe", "OpenCV", "Streamlit", "WebRTC"],
      bullets: [
        "Real-time squat coach — MediaPipe pose estimation tracks hip/knee/ankle angles to count reps and flag bad form.",
        "Live webcam analysis in the browser via Streamlit + streamlit-webrtc, with on-screen corrective feedback.",
      ],
      repo: "https://github.com/driizzyybreezzyy/Ai-Fitness",
      result: "Assist",
    },
    {
      title: "Poker Hand Predictor",
      stack: ["scikit-learn", "MLP", "Pandas", "NumPy"],
      bullets: [
        "Multi-class poker-hand classifier — upsampling fixed class imbalance for a ~20% performance lift.",
        "Trained and evaluated an MLP with accuracy + ROC analysis, reaching ~92% accuracy.",
      ],
      repo: "https://github.com/driizzyybreezzyy/Poker-Hand-Predictor",
      result: "Screamer",
    },
  ],

  // Clickable, externally-verifiable honours lead (certifications + papers),
  // then the awards. Entries with `href` render as clickable cards.
  honours: [
    {
      icon: "🎓",
      title: "Certified across AI, ML & Full-Stack",
      org: "View verified credentials",
      href:
        "https://drive.google.com/drive/folders/1_eo96b3lBmMMXa2kCTDJArWBdAsqbyHU",
    },
    {
      icon: "📄",
      title: "Deep Learning for Tea Leaf Disease Synthesis & Detection",
      org: "Published · ScienceDirect",
      href: "https://www.sciencedirect.com/science/article/pii/S2590123024020279",
    },
    {
      icon: "📄",
      title: "Markerless Data-based Cyclist Posture Detection using Deep Learning",
      org: "Published · IEEE Xplore",
      href: "https://ieeexplore.ieee.org/abstract/document/11135949",
    },
    {
      icon: "🏆",
      title: "Star Performer of the Month & Quarter",
      org: "Hitech Digital Solutions (internal award)",
    },
    {
      icon: "🏅",
      title: "Represented Gujarat at U-17",
      org: "National-level football & athletics",
    },
  ],

  // "Starting XI" — each formation fields a DIFFERENT XI emphasising a facet of
  // the stack. Squad order = GK → defence → midfield → attack, matching D-M-F.
  // ▸ Edit names/ratings or add a formation (any D-M-F summing to 10) to taste.
  lineup: {
    formations: [
      {
        name: "4-3-3",
        label: "AI-first",
        squad: [
          { name: "Python", rating: 96 }, // GK
          { name: "FastAPI", rating: 95 }, // DEF
          { name: "vLLM", rating: 92 },
          { name: "Docker", rating: 90 },
          { name: "PostgreSQL", rating: 88 },
          { name: "RAG / CAG", rating: 94 }, // MID
          { name: "Multi-agent", rating: 93 },
          { name: "LangChain", rating: 90 },
          { name: "LLMs & VLMs", rating: 98 }, // ATT
          { name: "Generative AI", rating: 99, captain: true },
          { name: "Fine-tuning", rating: 96 },
        ],
      },
      {
        name: "4-4-2",
        label: "Full-stack",
        squad: [
          { name: "Git", rating: 89 }, // GK
          { name: "Docker", rating: 90 }, // DEF
          { name: "GCP", rating: 86 },
          { name: "RunPod", rating: 85 },
          { name: "CI/CD", rating: 84 },
          { name: "FastAPI", rating: 95, captain: true }, // MID
          { name: "React", rating: 88 },
          { name: "Node.js", rating: 83 },
          { name: "Django", rating: 84 },
          { name: "Next.js", rating: 86 }, // ATT
          { name: "TypeScript", rating: 85 },
        ],
      },
      {
        name: "3-5-2",
        label: "Research / ML",
        squad: [
          { name: "Python", rating: 96 }, // GK
          { name: "NumPy", rating: 90 }, // DEF
          { name: "Pandas", rating: 91 },
          { name: "Scikit-learn", rating: 88 },
          { name: "PyTorch", rating: 94, captain: true }, // MID
          { name: "TensorFlow", rating: 86 },
          { name: "OpenCV", rating: 86 },
          { name: "Sentence-Transformers", rating: 87 },
          { name: "spaCy", rating: 82 },
          { name: "CNNs", rating: 90 }, // ATT
          { name: "YOLOv8", rating: 89 },
        ],
      },
    ],
  },

  skills: [
    {
      group: "Languages",
      items: [
        "Python",
        "Java",
        "C++",
        "SQL",
        "JavaScript",
        "TypeScript",
        "R",
        "Bash",
        "HTML",
        "CSS",
      ],
    },
    {
      group: "ML / Deep Learning",
      items: [
        "PyTorch",
        "TensorFlow",
        "Keras",
        "Scikit-learn",
        "Hugging Face Transformers",
        "OpenCV",
        "CNNs",
        "YOLOv8",
      ],
    },
    {
      group: "GenAI & NLP",
      items: [
        "GPT-4o",
        "Gemini",
        "Qwen",
        "Mistral",
        "InternVL",
        "LangChain",
        "LlamaIndex",
        "RAG",
        "CAG",
        "LoRA / Unsloth fine-tuning",
        "vLLM",
        "Ollama",
        "Prompt engineering",
        "Embeddings",
        "OCR (DocTR, Donut, Monkey OCR)",
        "Sentence-Transformers",
        "spaCy",
        "Multi-agent systems",
      ],
    },
    {
      group: "Backend & Web",
      items: [
        "FastAPI",
        "Django",
        "Flask",
        "REST APIs",
        "WebSockets",
        "React",
        "Next.js",
        "Vite",
        "Node.js",
        "Tailwind CSS",
      ],
    },
    {
      group: "Cloud & DevOps",
      items: [
        "GCP",
        "Docker",
        "RunPod",
        "Linux",
        "Nginx",
        "CI/CD",
        "Git",
        "GitHub & GitLab Actions",
      ],
    },
    {
      group: "Databases",
      items: ["PostgreSQL", "MySQL", "SQLite", "Redis", "ChromaDB / FAISS"],
    },
    {
      group: "Libraries & Tools",
      items: [
        "Pandas",
        "NumPy",
        "Matplotlib",
        "BeautifulSoup",
        "Selenium",
        "Playwright",
        "Streamlit",
        "Fuzzywuzzy",
        "Pydantic",
      ],
    },
  ],

  contact: {
    heading: "Open to transfers",
    body: "Open to ML/AI engineering roles and interesting problems. Make an offer — my inbox is open.",
    primaryLabel: "Open transfer talks",
    socials: [
      { label: "GitHub", href: "https://github.com/driizzyybreezzyy" },
      { label: "LinkedIn", href: "https://linkedin.com/in/-aryan-bhavsar" },
      { label: "LeetCode", href: "https://leetcode.com/u/driizzyybreezzyy/" },
    ],
  },
};
