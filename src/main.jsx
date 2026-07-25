import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Code,
  GithubLogo,
  LinkedinLogo,
  List,
  PaperPlaneTilt,
  X,
} from "@phosphor-icons/react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import "@fontsource/dm-sans/300.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/playfair-display/500-italic.css";
import "./styles.css";

const projects = [
  {
    title: "RozGo",
    type: "Full-stack product",
    copy: "An income record and verification platform that helps independent workers submit, review, organize, and export their earnings.",
    tags: ["React", "Express", "MongoDB", "Motion"],
    image: "/assets/rozgo.svg",
    live: "https://frontend-eight-drab-56.vercel.app",
    repo: "https://github.com/aswab007-ops/RozGo",
    className: "project-featured",
  },
  {
    title: "Carmandi Inspection",
    type: "Contributor",
    copy: "A production-ready Flutter app for structured vehicle inspections, camera-led damage capture, and reliable offline-first field work.",
    tags: ["Flutter", "Dart", "Camera", "Offline sync"],
    image: "/assets/inspection-app.png",
    repo: null,
    className: "project-tall",
  },
  {
    title: "Carmandi Website",
    type: "Contributor",
    copy: "A responsive automotive marketplace experience with auctions, search, account flows, dashboards, and reusable product components.",
    tags: ["Next.js", "TypeScript", "Tailwind", "UX"],
    image: "/assets/carmandi-website.webp",
    repo: "https://github.com/muteekhan06/carmandi-website",
    className: "project-wide",
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

function MagneticLink({ href, className = "", children }) {
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

function ProjectCard({ project, index }) {
  const reduce = useReducedMotion();
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const rotateX = useTransform(cardY, [-0.5, 0.5], [2.5, -2.5]);
  const rotateY = useTransform(cardX, [-0.5, 0.5], [-2.5, 2.5]);

  return (
    <motion.article
      className={`project ${project.className}`}
      initial={reduce ? false : { opacity: 1, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        cardX.set((event.clientX - rect.left) / rect.width - 0.5);
        cardY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        cardX.set(0);
        cardY.set(0);
      }}
    >
      <div className="project-media">
        <img src={project.image} alt={`${project.title} project preview`} loading={index ? "lazy" : "eager"} />
      </div>
      <div className="project-body">
        <div className="project-meta">
          <span>{project.type}</span>
          <span>{project.tags.join(" / ")}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.copy}</p>
        <div className="project-links">
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer">
              Visit project <ArrowUpRight />
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noreferrer">
              Source <GithubLogo />
            </a>
          )}
          {!project.repo && <span className="private-note">Private project</span>}
        </div>
      </div>
    </motion.article>
  );
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
      <button className="button button-cream" type="submit">
        Email me <PaperPlaneTilt />
      </button>
    </form>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("work");
  const reduce = useReducedMotion();
  const heroRef = useRef(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const imageX = useTransform(pointerX, [-0.5, 0.5], [-10, 10]);
  const imageY = useTransform(pointerY, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-35% 0px -55%" }
    );
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="nav">
        <a className="monogram" href="#top" aria-label="Back to top">AK</a>
        <nav aria-label="Primary navigation" className={menuOpen ? "nav-links open" : "nav-links"}>
          {["work", "about", "skills"].map((item) => (
            <a key={item} className={active === item ? "active" : ""} href={`#${item}`} onClick={closeMenu}>
              {item[0].toUpperCase() + item.slice(1)}
            </a>
          ))}
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          {menuOpen ? <X /> : <List />}
        </button>
      </header>

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
            className="hero-copy"
            initial={reduce ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.p className="intro" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}>
              Muhammad Aswab Khalil
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 1, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              Web developer.<br />
              <em>AI/ML engineer.</em>
            </motion.h1>
            <motion.p className="hero-lede" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}>
              I build thoughtful interfaces and intelligent systems that turn complex ideas into useful products.
            </motion.p>
            <motion.div className="hero-actions" variants={{ hidden: { opacity: 1 }, visible: { opacity: 1 } }}>
              <MagneticLink href="#work" className="button button-primary">
                View work <ArrowDownRight />
              </MagneticLink>
              <MagneticLink href="mailto:aswabkhalil@gmail.com" className="text-link">
                Email me <ArrowUpRight />
              </MagneticLink>
            </motion.div>
          </motion.div>
          <motion.div
            className="hero-visual"
            style={reduce ? undefined : { x: imageX, y: imageY }}
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
            <p className="section-kicker">Selected work</p>
            <h2>Products with purpose.</h2>
            <p>Full-stack platforms, product experiences, and practical AI built from the interface down.</p>
          </Reveal>
          <div className="project-grid">
            {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}
          </div>
          <Reveal className="archive-link">
            <a href="https://github.com/aswab007-ops?tab=repositories" target="_blank" rel="noreferrer">
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
                I work across web development and applied AI/ML, from responsive React experiences and full-stack systems to computer vision pipelines built with OpenCV and deep learning.
              </p>
            </div>
          </Reveal>
          <div className="principles">
            <Reveal>
              <Code />
              <h3>Own the full path</h3>
              <p>Architecture, interface, data, deployment. I stay close to the whole product so every layer supports the same outcome.</p>
            </Reveal>
            <Reveal delay={0.08}>
              <Brain />
              <h3>Make intelligence useful</h3>
              <p>AI earns its place when it solves a real task clearly, reliably, and without making the product harder to understand.</p>
            </Reveal>
          </div>
        </section>

        <section className="skills section" id="skills">
          <Reveal>
            <h2>Range, without the noise.</h2>
          </Reveal>
          <div className="skill-list">
            {skillGroups.map((group, index) => (
              <Reveal className="skill-row" key={group.title} delay={index * 0.06}>
                <span>{group.title}</span>
                <p>{group.items}</p>
              </Reveal>
            ))}
          </div>
          <div className="marquee" aria-hidden="true">
            <div>
              REACT · TYPESCRIPT · PYTHON · OPENCV · FLUTTER · NODE.JS · MONGODB · COMPUTER VISION ·
              REACT · TYPESCRIPT · PYTHON · OPENCV · FLUTTER · NODE.JS · MONGODB · COMPUTER VISION ·
            </div>
          </div>
        </section>

        <section className="experience section">
          <Reveal className="experience-heading">
            <h2>Building across disciplines.</h2>
            <p>My work connects product craft with technical depth.</p>
          </Reveal>
          <div className="experience-track">
            <Reveal className="experience-item">
              <span>Contributor</span>
              <h3>Carmandi</h3>
              <p>Vehicle inspection workflows and a full automotive marketplace across mobile and web.</p>
            </Reveal>
            <Reveal className="experience-item" delay={0.08}>
              <span>Independent builder</span>
              <h3>RozGo</h3>
              <p>Full-stack product ownership across authentication, media, analytics, review flows, and deployment.</p>
            </Reveal>
            <Reveal className="experience-item" delay={0.16}>
              <span>AI/ML practice</span>
              <h3>Computer vision</h3>
              <p>Scene recognition, camera geometry, 3D reconstruction, edge detection, OCR, and image processing.</p>
            </Reveal>
          </div>
        </section>

        <section className="contact section" id="contact">
          <Reveal className="contact-inner">
            <div className="contact-copy">
              <p className="section-kicker">Start a conversation</p>
              <h2>Have an idea worth building?</h2>
              <p>I’m open to web, product, and applied AI/ML opportunities.</p>
            </div>
            <ContactForm />
          </Reveal>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} Muhammad Aswab Khalil</span>
        <div>
          <a href="https://github.com/aswab007-ops" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubLogo /></a>
          <a href="https://www.linkedin.com/in/muhammad-aswab-khalil-b578a235a/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinLogo /></a>
          <a href="#top">Back to top <ArrowUpRight /></a>
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
