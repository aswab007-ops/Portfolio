import React from "react";
import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import SweepText from "../SweepText";
import ShinyPill from "./ShinyPill";

// Adapted from OriginKit's Hover Image Reveal component.
export default function HoverImageReveal({ items }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="project-reveal">
      {items.map((project, index) => (
        <motion.article
          key={project.title}
          className="project-reveal-row"
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="project-reveal-index">
            <span>0{index + 1}</span>
            {project.displayTypeLines ? (
              <span className="project-type-lines">
                {project.displayTypeLines.map((line) => <SweepText key={line}>{line}</SweepText>)}
              </span>
            ) : (
              <SweepText>{project.displayType ?? project.type}</SweepText>
            )}
          </div>

          <div className="project-reveal-main">
            <h3 className={project.title.length > 20 ? "is-long" : ""}>
              <span>{project.title}</span>
              <span aria-hidden="true">{project.title}</span>
            </h3>
            <p><ShinyPill>{project.copy}</ShinyPill></p>
          </div>

          <div className="project-reveal-side">
            <ul className="project-tech" aria-label={`${project.title} technologies`}>
              {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
            <div className="project-links">
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer">
                  {project.liveLabel ?? "Visit"} <ArrowUpRight />
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noreferrer">
                  Source <GithubLogo />
                </a>
              )}
              {!project.repo && !project.live && (
                <span className="private-note">Company&apos;s internal vehicle inspection app</span>
              )}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
