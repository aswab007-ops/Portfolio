import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownRight,
  ArrowUpRight,
  GithubLogo,
  LinkedinLogo,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import "@fontsource/dm-sans/300.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/playfair-display/500-italic.css";
import HoverImageReveal from "./components/originkit/HoverImageReveal";
import MeshTextHover from "./components/originkit/MeshTextHover";
import ShinyPill from "./components/originkit/ShinyPill";
import DustTextReveal from "./components/originkit/DustTextReveal";
import WaterButton from "./components/originkit/WaterButton";
import CursorGrid from "./components/reactbits/CursorGrid/CursorGrid";
import SplashCursor from "./components/reactbits/SplashCursor";
import SweepText from "./components/SweepText";
import "./styles.css";

const cursorGridColors = ["#1d5b43", "#a6824a", "#5d1e21", "#e6e2da"];

const projects = [
  {
    title: "RozGo",
    type: "Full-stack product",
    copy: "An income record and verification platform that helps independent workers submit, review, organize, and export their earnings.",
    tags: ["React", "Express", "MongoDB", "Motion"],
    live: "https://frontend-eight-drab-56.vercel.app",
    repo: "https://github.com/aswab007-ops/RozGo",
  },
  {
    title: "Carmandi Inspection",
    displayType: "Flutter mobile frontend · REST API backend",
    type: "Flutter mobile frontend · REST API backend",
    copy: "A production-ready Flutter app for structured vehicle inspections, camera-led damage capture, and reliable offline-first field work.",
    tags: ["Flutter", "Dart", "Camera", "Offline sync"],
    repo: null,
  },
  {
    title: "Carmandi Website",
    type: "Contributor",
    copy: "A responsive automotive marketplace experience with auctions, search, account flows, dashboards, and reusable product components.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    live: "https://www.carmandi.pk",
    repo: null,
  },
];

const aiProjects = [
  {
    title: "Custom Canny Edge Detector",
    type: "Computer vision",
    copy: "A from-scratch Canny implementation covering convolution, gradient analysis, non-maximum suppression, and hysteresis linking.",
    tags: ["Python", "NumPy", "ImageIO", "Computer vision"],
    live: "/vision.html",
    liveLabel: "Try now",
    repo: "https://github.com/aswab007-ops/canny-edge-detector",
  },
  {
    title: "Scene Recognition",
    displayType: "BoVW + ResNet",
    type: "BoVW + ResNet",
    copy: "Fifteen-class scene recognition comparing SIFT-based visual vocabularies with ResNet feature extraction.",
    tags: ["Python", "SIFT", "K-means", "SVM", "ResNet"],
    repo: "https://github.com/aswab007-ops/scene-recognition-using-bow-and-resnet",
  },
  {
    title: "Lane Detection",
    type: "Computer vision",
    copy: "A lane-departure pipeline built from HSV filtering through custom Canny, ROI selection, Hough transforms, and regression.",
    tags: ["Python", "NumPy", "Hough transform", "Regression"],
    live: "/lane.html",
    liveLabel: "Try now",
    repo: "https://github.com/aswab007-ops/lane-detection",
  },
];

const systems = [
  {
    id: "person-removal",
    label: "Person Removal",
    defaultNode: "change",
    links: [
      { label: "Source", href: "https://github.com/aswab007-ops/person-removal-through-change-detection" },
    ],
    nodes: [
      {
        id: "sequence",
        eyebrow: "Input",
        label: "Frame sequence",
        title: "A scene observed over time",
        description: "Ordered image frames provide stable background evidence and the later foreground sequence containing the moving subject.",
        owned: ["Frame loading", "Dataset presets", "Sequence handling"],
      },
      {
        id: "background",
        eyebrow: "Model",
        label: "Background",
        title: "The empty scene becomes measurable",
        description: "Stable frames build a per-pixel statistical background model that captures expected color and natural variation.",
        owned: ["Background sampling", "Pixel statistics", "Model construction"],
      },
      {
        id: "change",
        eyebrow: "Detection",
        label: "Mahalanobis",
        title: "Motion separates from the scene",
        description: "Each incoming pixel is compared with the learned model, turning statistically meaningful change into a foreground mask.",
        owned: ["Distance scoring", "Threshold tuning", "Binary masks"],
      },
      {
        id: "cleanup",
        eyebrow: "Refinement",
        label: "Mask cleanup",
        title: "Noise gives way to a clear subject",
        description: "Morphological filtering and connected-component checks remove scattered detections while preserving meaningful moving regions.",
        owned: ["Morphology", "Blob filtering", "Area controls"],
      },
      {
        id: "reconstruction",
        eyebrow: "Output",
        label: "Person removed",
        title: "The background replaces the subject",
        description: "Clean masks guide alpha blending, reconstructing the hidden scene and exporting processed frames and a final video.",
        owned: ["Alpha blending", "Frame export", "Video assembly"],
      },
    ],
  },
  {
    id: "scene-recognition",
    label: "Scene Recognition",
    defaultNode: "features",
    links: [
      { label: "Source", href: "https://github.com/aswab007-ops/scene-recognition-using-bow-and-resnet" },
    ],
    nodes: [
      {
        id: "dataset",
        eyebrow: "Input",
        label: "15 scene classes",
        title: "Images enter a shared benchmark",
        description: "Training and test folders organize fifteen indoor and outdoor scene categories for repeatable comparison.",
        owned: ["Dataset loading", "Train-test split", "Label handling"],
      },
      {
        id: "features",
        eyebrow: "Features",
        label: "SIFT · ResNet",
        title: "Two ways to describe a scene",
        description: "Local SIFT descriptors and deep ResNet embeddings create parallel feature representations for the same recognition task.",
        owned: ["SIFT extraction", "ResNet backbone", "Feature caching"],
      },
      {
        id: "representation",
        eyebrow: "Encoding",
        label: "K-Means · BoVW",
        title: "Local features become visual words",
        description: "K-Means builds a visual vocabulary, then SIFT descriptors are counted into fixed-length Bag of Visual Words histograms.",
        owned: ["Vocabulary creation", "Histogram encoding", "Parameter sweeps"],
      },
      {
        id: "classification",
        eyebrow: "Models",
        label: "KNN · SVM",
        title: "Representations become predictions",
        description: "KNN and SVM classifiers learn from both feature families, exposing how classical and deep representations compare.",
        owned: ["KNN pipeline", "SVM training", "Model variants"],
      },
      {
        id: "evaluation",
        eyebrow: "Output",
        label: "Metrics & reports",
        title: "Every model is tested consistently",
        description: "Automated evaluation compares accuracy, F1 score, runtime, confusion matrices, and saved result summaries across configurations.",
        owned: ["Batch evaluation", "Metric parsing", "Result reporting"],
      },
    ],
  },
  {
    id: "carmandi",
    label: "Carmandi Inspection",
    defaultNode: "capture",
    privateNote: "Company's internal vehicle inspection app",
    nodes: [
      {
        id: "interface",
        eyebrow: "Interface",
        label: "Flutter",
        title: "A focused field workflow",
        description: "The mobile interface guides inspectors through structured vehicle checks without burying the next action.",
        owned: ["Flutter frontend", "Inspection forms", "Responsive states"],
      },
      {
        id: "capture",
        eyebrow: "Capture",
        label: "Camera",
        title: "Evidence gathered in context",
        description: "Camera-led steps keep damage photos attached to the correct vehicle area and inspection record.",
        owned: ["Camera integration", "Damage capture", "Media states"],
      },
      {
        id: "offline",
        eyebrow: "Local data",
        label: "Offline-first",
        title: "Field work survives weak signal",
        description: "Inspection progress and media remain available locally, so an unstable connection does not stop the workflow.",
        owned: ["Local persistence", "Draft recovery", "Offline UX"],
      },
      {
        id: "sync",
        eyebrow: "Sync",
        label: "REST API",
        title: "Mobile data reaches the backend",
        description: "Structured inspection records and media metadata move through a REST API with reliable state handling.",
        owned: ["REST backend", "Payload design", "Sync states"],
      },
      {
        id: "review",
        eyebrow: "Outcome",
        label: "Inspection record",
        title: "A complete vehicle history",
        description: "Captured details, checks, and damage evidence resolve into one reviewable inspection record.",
        owned: ["Review flow", "Record structure", "End-to-end delivery"],
      },
    ],
  },
];

systems.splice(1, 2, systems[2], systems[1]);

console.assert(
  systems.every((system) => system.nodes.some((node) => node.id === system.defaultNode)),
  "Every system must declare a valid default node.",
);

function Reveal({ children, className = "", delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 1, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function MagneticLink({ href, className = "", children, ...props }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18 });
  const springY = useSpring(y, { stiffness: 180, damping: 18 });
  const reduce = useReducedMotion();

  const move = (event) => {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.16);
  };

  return (
    <motion.a
      href={href}
      className={className}
      {...props}
      style={{ x: springX, y: springY }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.a>
  );
}

function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    mass: 0.25,
    skipInitialAnimation: true,
  });

  return <motion.div className="scroll-progress" style={{ scaleX: reduce ? 0 : scaleX }} aria-hidden="true" />;
}

function ContactForm() {
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Portfolio inquiry from ${data.get("name")}`);
    const body = encodeURIComponent(`${data.get("message")}\n\nReply to: ${data.get("email")}`);
    window.location.href = `mailto:aswabkhalil@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        Name
        <input name="name" autoComplete="name" required placeholder="Your name" />
      </label>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <label>
        What are you building?
        <textarea name="message" required rows="4" placeholder="A short project outline" />
      </label>
      <WaterButton type="submit">
        Email me <PaperPlaneTilt />
      </WaterButton>
    </form>
  );
}

function SystemAnatomy() {
  const [activeSystemId, setActiveSystemId] = useState(systems[0].id);
  const [activeNodeId, setActiveNodeId] = useState(systems[0].defaultNode);
  const tabRefs = useRef([]);
  const activeSystem = systems.find((system) => system.id === activeSystemId);
  const activeNode = activeSystem.nodes.find((node) => node.id === activeNodeId);

  const selectSystem = (system) => {
    setActiveSystemId(system.id);
    setActiveNodeId(system.defaultNode);
  };

  const handleTabKeyDown = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const last = systems.length - 1;
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : event.key === "ArrowRight"
          ? (index + 1) % systems.length
          : (index - 1 + systems.length) % systems.length;
    selectSystem(systems[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="system-anatomy section" id="under-the-hood">
      <Reveal className="system-anatomy-heading">
        <p className="section-kicker"><SweepText>System anatomy</SweepText></p>
        <h2><MeshTextHover>Under the hood.</MeshTextHover></h2>
        <p><ShinyPill>Follow each project from first input to finished outcome.</ShinyPill></p>
      </Reveal>

      <Reveal className="system-anatomy-shell">
        <div className="system-tabs" role="tablist" aria-label="Choose a project">
          {systems.map((system, index) => (
            <button
              className={system.id === activeSystemId ? "is-active" : ""}
              id={`system-tab-${system.id}`}
              key={system.id}
              onClick={() => selectSystem(system)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              ref={(element) => { tabRefs.current[index] = element; }}
              role="tab"
              tabIndex={system.id === activeSystemId ? 0 : -1}
              aria-controls="system-anatomy-panel"
              aria-selected={system.id === activeSystemId}
            >
              {system.label}
            </button>
          ))}
        </div>

        <div
          className="system-anatomy-content"
          id="system-anatomy-panel"
          role="tabpanel"
          aria-labelledby={`system-tab-${activeSystem.id}`}
        >
          <div className="system-flow" aria-label={`${activeSystem.label} project flow`}>
            {activeSystem.nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <button
                  className={`system-node${node.id === activeNode.id ? " is-active" : ""}`}
                  onClick={() => setActiveNodeId(node.id)}
                  aria-pressed={node.id === activeNode.id}
                  aria-label={`Show ${node.eyebrow}: ${node.label}`}
                >
                  <span>{node.eyebrow}</span>
                  <strong>{node.label}</strong>
                </button>
                {index < activeSystem.nodes.length - 1 && (
                  <span className="system-connector" style={{ "--connector-index": index }} aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>

          <aside className="system-detail" key={`${activeSystem.id}-${activeNode.id}`} aria-live="polite">
            <DustTextReveal as="p">{activeNode.eyebrow}</DustTextReveal>
            <DustTextReveal as="h3" delay={0.04}>{activeNode.title}</DustTextReveal>
            <DustTextReveal as="p" delay={0.08}>{activeNode.description}</DustTextReveal>
            <div className="system-owned">
              <DustTextReveal>What I owned</DustTextReveal>
              <ul>
                {activeNode.owned.map((item, index) => (
                  <li key={item}><DustTextReveal delay={0.1 + index * 0.035}>{item}</DustTextReveal></li>
                ))}
              </ul>
            </div>
            <div className="system-proof">
              {activeSystem.links?.map((link) => link.label === "Source" ? (
                <a
                  className="github-button"
                  href={link.href}
                  key={link.label}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${activeSystem.label} source on GitHub`}
                >
                  <span className="github-icon-shell"><GithubLogo weight="fill" /></span>
                  <span className="github-button-bg" aria-hidden="true" />
                </a>
              ) : (
                <a href={link.href} key={link.label} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>
                  <DustTextReveal>{link.label}</DustTextReveal> <ArrowUpRight />
                </a>
              ))}
              {activeSystem.privateNote && (
                <DustTextReveal className="system-private-note">{activeSystem.privateNote}</DustTextReveal>
              )}
            </div>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}

function App() {
  const reduce = useReducedMotion();
  const heroRef = useRef(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const imageX = useTransform(pointerX, [-0.5, 0.5], [-10, 10]);
  const imageY = useTransform(pointerY, [-0.5, 0.5], [-8, 8]);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, 80]);
  const heroMediaY = useTransform(heroProgress, [0, 1], [0, -48]);
  const combinedHeroY = useTransform(() => imageY.get() + heroMediaY.get());
  const heroMediaScale = useTransform(heroProgress, [0, 1], [1, 0.94]);
  const heroMediaRotate = useTransform(heroProgress, [0, 1], [0, -1.5]);

  return (
    <>
      <CursorGrid
        className="cursor-grid-bg"
        cellSize={30}
        colors={cursorGridColors}
        radius={150}
        lineWidth={1}
        maxOpacity={0.94}
        fillOpacity={0.055}
        gridOpacity={0.06}
        cellRadius={3}
        holdTime={220}
        fadeDuration={760}
        clickPulse={false}
      />
      <SplashCursor
        RAINBOW_MODE={false}
        COLORS={["#a6824a", "#1d5b43", "#5d1e21", "#e6e2da"]}
        SIM_RESOLUTION={96}
        DYE_RESOLUTION={768}
        CAPTURE_RESOLUTION={384}
        COLOR_UPDATE_SPEED={4}
        CURL={4}
        SPLAT_RADIUS={0.18}
        SPLAT_FORCE={4600}
      />
      <ScrollProgress />
      <main id="top">
        <section
          className="hero"
          ref={heroRef}
          onPointerMove={(event) => {
            if (reduce || !heroRef.current) return;
            const rect = heroRef.current.getBoundingClientRect();
            pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
            pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
          }}
        >
          <motion.div
            className="hero-orb hero-orb-one"
            animate={reduce ? undefined : { x: [0, 42, -18, 0], y: [0, -30, 24, 0], scale: [1, 1.12, 0.96, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          <motion.div
            className="hero-orb hero-orb-two"
            animate={reduce ? undefined : { x: [0, -34, 22, 0], y: [0, 24, -26, 0], scale: [1, 0.92, 1.08, 1] }}
            transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          <motion.div
            className="hero-copy"
            style={reduce ? undefined : { y: heroCopyY }}
            initial={reduce ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.p className="intro name-reveal" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}>
              <SweepText>Muhammad Aswab Khalil</SweepText>
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 1, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              <MeshTextHover>Web developer.</MeshTextHover><br />
              <em><MeshTextHover>AI/ML engineer.</MeshTextHover></em>
            </motion.h1>
            <motion.p className="hero-lede" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}>
              <ShinyPill>I build thoughtful interfaces and intelligent systems that turn complex ideas into useful products.</ShinyPill>
            </motion.p>
            <motion.div className="hero-actions" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}>
              <MagneticLink href="#work" className="button button-primary">
                View work <ArrowDownRight />
              </MagneticLink>
              <MagneticLink
                href="https://mail.google.com/mail/?view=cm&fs=1&to=aswabkhalil@gmail.com&su=Portfolio%20inquiry"
                className="text-link"
                target="_blank"
                rel="noreferrer"
              >
                Email me <ArrowUpRight />
              </MagneticLink>
            </motion.div>
          </motion.div>
          <motion.div
            className="hero-visual"
            style={reduce ? undefined : {
              x: imageX,
              y: combinedHeroY,
              scale: heroMediaScale,
              rotate: heroMediaRotate,
            }}
            initial={reduce ? false : { opacity: 1, clipPath: "inset(0 100% 0 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src="/assets/hero-workstation.png" alt="Laptop and phone in a dark studio workspace" />
            <div className="visual-caption">
              <span>Designing for the web</span>
              <span>Building with intelligence</span>
            </div>
          </motion.div>
        </section>

        <section className="work section" id="work">
          <Reveal className="section-heading">
            <p className="section-kicker"><SweepText>Works</SweepText></p>
            <h2><MeshTextHover>Products with purpose.</MeshTextHover></h2>
            <p><ShinyPill>Full-stack platforms, product experiences, and practical AI built from the interface down.</ShinyPill></p>
          </Reveal>
          <HoverImageReveal items={projects} />
          <Reveal className="archive-link">
            <a className="underline-link" href="https://github.com/aswab007-ops?tab=repositories" target="_blank" rel="noreferrer">
              Explore the full GitHub archive <ArrowUpRight />
            </a>
          </Reveal>
        </section>

        <section className="work section ai-work" id="ai-work">
          <Reveal className="section-heading">
            <p className="section-kicker"><SweepText>AI/ML &amp; Computer Vision</SweepText></p>
            <h2><MeshTextHover>Intelligence you can try.</MeshTextHover></h2>
            <p><ShinyPill>Computer-vision systems built from first principles, classical feature pipelines, and deep learning.</ShinyPill></p>
          </Reveal>
          <HoverImageReveal items={aiProjects} />
        </section>

        <SystemAnatomy />

        <section className="experience section">
          <Reveal className="experience-heading">
            <h2><MeshTextHover>Building across disciplines.</MeshTextHover></h2>
            <p><ShinyPill>My work connects product craft with technical depth.</ShinyPill></p>
          </Reveal>
          <div className="experience-track">
            <Reveal className="experience-item">
              <span><SweepText>Contributor</SweepText></span>
              <h3>Carmandi</h3>
              <p><ShinyPill>Vehicle inspection workflows and a full automotive marketplace across mobile and web.</ShinyPill></p>
            </Reveal>
            <Reveal className="experience-item" delay={0.08}>
              <span><SweepText>Independent builder</SweepText></span>
              <h3>RozGo</h3>
              <p><ShinyPill>Full-stack product ownership across authentication, media, analytics, review flows, and deployment.</ShinyPill></p>
            </Reveal>
            <Reveal className="experience-item" delay={0.16}>
              <span><SweepText>AI/ML</SweepText></span>
              <h3>Computer vision</h3>
              <p><ShinyPill>Scene recognition, camera geometry, 3D reconstruction, edge detection, OCR, and image processing.</ShinyPill></p>
            </Reveal>
          </div>
        </section>

        <section className="contact section" id="contact">
          <Reveal className="contact-inner">
            <div className="contact-copy">
              <p className="section-kicker"><SweepText>Start a conversation</SweepText></p>
              <h2><MeshTextHover>Have an idea worth building?</MeshTextHover></h2>
              <p><ShinyPill>I’m open to web, product, and applied AI/ML opportunities.</ShinyPill></p>
            </div>
            <ContactForm />
          </Reveal>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} Muhammad Aswab Khalil</span>
        <div>
          <a
            className="github-button"
            href="https://github.com/aswab007-ops"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit Muhammad Aswab Khalil on GitHub"
          >
            <span className="github-icon-shell"><GithubLogo weight="fill" /></span>
            <span className="github-button-bg" aria-hidden="true" />
          </a>
          <a href="https://www.linkedin.com/in/muhammad-aswab-khalil-b578a235a/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinLogo /></a>
          <a className="underline-link" href="#top">Back to top <ArrowUpRight /></a>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
