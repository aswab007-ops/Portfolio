import React from "react";
import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import SweepText from "../SweepText";

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
            <SweepText>{project.displayType ?? project.type}</SweepText>
          </div>

          <div className="project-reveal-main">
            <h3>
              <span>{project.title}</span>
              <span aria-hidden="true">{project.title}</span>
            </h3>
            <p>{project.copy}</p>
          </div>

          <div className="project-reveal-side">
            <span>{project.tags.join(" · ")}</span>
            <div className="project-links">
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer">
                  Visit <ArrowUpRight />
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noreferrer">
                  Source <GithubLogo />
                </a>
              )}
              {!project.repo && !project.live && (
                <span className="private-note">Private Project (Company Internal App)</span>
              )}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
