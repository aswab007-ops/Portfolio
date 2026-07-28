import React from "react";
import { GithubLogo } from "@phosphor-icons/react";

export default function GithubButton({ href, label }) {
  return (
    <a className="github-button" href={href} target="_blank" rel="noreferrer" aria-label={label}>
      <span className="github-icon-shell"><GithubLogo weight="fill" /></span>
      <span className="github-button-bg" aria-hidden="true" />
    </a>
  );
}
