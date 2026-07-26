import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Code,
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
import CurvedMarquee from "./components/originkit/CurvedMarquee";
import HoverImageReveal from "./components/originkit/HoverImageReveal";
import MeshTextHover from "./components/originkit/MeshTextHover";
import ShinyPill from "./components/originkit/ShinyPill";
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

const skillGroups = [
  { title: "Web", items: "React, TypeScript, JavaScript, Tailwind CSS, Node.js, Express, MongoDB" },
  { title: "AI / ML", items: "Python, OpenCV, NumPy, ResNet, SIFT, OCR, image processing" },
  { title: "Product", items: "Flutter, REST APIs, offline storage, camera integration, Cloudinary, Vercel" },
];

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

        <section className="about section" id="about">
          <Reveal className="about-lead">
            <span className="large-mark">A</span>
            <div>
              <h2>Engineering that starts with the person using it.</h2>
              <p>
                <ShinyPill>I work across web development and applied AI/ML, from responsive React experiences and full-stack systems to computer vision pipelines built with OpenCV and deep learning.</ShinyPill>
              </p>
            </div>
          </Reveal>
          <div className="principles">
            <Reveal>
              <Code />
              <h3><SweepText>Own the full path</SweepText></h3>
              <p><ShinyPill>Architecture, interface, data, deployment. I stay close to the whole product so every layer supports the same outcome.</ShinyPill></p>
            </Reveal>
            <Reveal delay={0.08}>
              <Brain />
              <h3><SweepText>Make intelligence useful</SweepText></h3>
              <p><ShinyPill>AI earns its place when it solves a real task clearly, reliably, and without making the product harder to understand.</ShinyPill></p>
            </Reveal>
          </div>
        </section>

        <section className="skills section" id="skills">
          <Reveal>
            <h2><MeshTextHover>Range, without the noise.</MeshTextHover></h2>
          </Reveal>
          <div className="skill-list">
            {skillGroups.map((group, index) => (
              <Reveal className="skill-row" key={group.title} delay={index * 0.06}>
                <span><SweepText>{group.title}</SweepText></span>
                <p>{group.items}</p>
              </Reveal>
            ))}
          </div>
          <CurvedMarquee
            text="REACT · TYPESCRIPT · PYTHON · OPENCV · FLUTTER · NODE.JS · MONGODB · COMPUTER VISION ·"
            color="#a6824a"
          />
        </section>

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
