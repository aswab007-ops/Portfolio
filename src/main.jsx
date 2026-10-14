import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownRight,
  ArrowUpRight,
  LinkedinLogo,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
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
import "@fontsource/playfair-display/600.css";
import HoverImageReveal from "./components/originkit/HoverImageReveal";
import MeshTextHover from "./components/originkit/MeshTextHover";
import ShinyPill from "./components/originkit/ShinyPill";
import WaterButton from "./components/originkit/WaterButton";
import GithubButton from "./components/GithubButton";
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
    displayTypeLines: ["Flutter mobile frontend", "REST API backend"],
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
  const [showSplash, setShowSplash] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, 80]);

  useEffect(() => {
    document.body.classList.toggle("splash-active", showSplash);
    return () => document.body.classList.remove("splash-active");
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) return undefined;
    const timeout = window.setTimeout(() => setShowSplash(false), reduce ? 650 : 2600);
    return () => window.clearTimeout(timeout);
  }, [reduce, showSplash]);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="portfolio-splash"
            initial={{ opacity: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    y: "-3%",
                    filter: "blur(8px)",
                    transition: { duration: 0.68, ease: [0.76, 0, 0.24, 1] },
                  }
            }
            role="status"
            aria-label="Opening Muhammad Aswab Khalil’s portfolio"
          >
            <div className="splash-lockup">
              <motion.h1
                className="splash-wordmark"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="splash-initial">A</span>swab
              </motion.h1>
              <div className="splash-progress" aria-hidden="true">
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reduce ? 0 : 2.05, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        SPLAT_RADIUS={0.17}
        SPLAT_FORCE={4300}
      />
      <ScrollProgress />
      <main id="top">
        <section
          className="hero"
          ref={heroRef}
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
            animate={showSplash ? "hidden" : "visible"}
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
              <MeshTextHover>Web Developer.</MeshTextHover><br />
              <em><MeshTextHover>AI/ML Engineer.</MeshTextHover></em>
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
        </section>

        <section className="work section" id="work">
          <Reveal className="section-heading">
            <p className="section-kicker"><SweepText>Web &amp; product</SweepText></p>
            <h2><MeshTextHover>From interface to deployment.</MeshTextHover></h2>
            <p><ShinyPill>Production work across income verification, vehicle inspection, and automotive commerce.</ShinyPill></p>
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
            <p className="section-kicker"><SweepText>Applied AI/ML · Computer Vision</SweepText></p>
            <h2><MeshTextHover>From pixels to structure.</MeshTextHover></h2>
            <p><ShinyPill>Scene recognition, edge detection, and lane geometry implemented from first principles.</ShinyPill></p>
          </Reveal>
          <HoverImageReveal items={aiProjects} />
        </section>

        <section className="proof-bridge" aria-label="Portfolio highlights">
          <Reveal className="proof-bridge-inner">
            <ul className="proof-facts">
              <li>3 web products</li>
              <li>3 computer-vision systems</li>
              <li>Interface to deployment</li>
            </ul>
            <div className="proof-actions">
              <a className="underline-link" href="/Muhammad-Aswab-Khalil-Resume.pdf" target="_blank" rel="noreferrer">
                View Resume <ArrowUpRight />
              </a>
              <a className="underline-link" href="https://github.com/aswab007-ops?tab=repositories" target="_blank" rel="noreferrer">
                GitHub archive <ArrowUpRight />
              </a>
            </div>
          </Reveal>
        </section>

        <section className="contact section" id="contact">
          <Reveal className="contact-inner">
            <div className="contact-copy">
              <p className="section-kicker"><SweepText>Available for select work</SweepText></p>
              <h2><MeshTextHover>Need product thinking and technical depth?</MeshTextHover></h2>
              <p><ShinyPill>I’m open to web, product, and applied AI/ML opportunities.</ShinyPill></p>
            </div>
            <ContactForm />
          </Reveal>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} Muhammad Aswab Khalil</span>
        <div>
          <GithubButton
            href="https://github.com/aswab007-ops"
            label="Visit Muhammad Aswab Khalil on GitHub"
          />
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
