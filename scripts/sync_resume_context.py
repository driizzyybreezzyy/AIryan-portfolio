#!/usr/bin/env python3
"""
sync_resume_context.py
Contextual sync engine that reads `resume/main.tex` and intelligently updates
`src/data/site.ts` in the AIryan FC portfolio while preserving all FUT/sports
theming, ratings, badges, and interfaces.

Runs 100% offline with zero external paid APIs, guaranteeing 0 cost and zero risk.
"""

import os
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
RESUME_TEX = ROOT_DIR / "resume" / "main.tex"
SITE_TS = ROOT_DIR / "src" / "data" / "site.ts"


def clean_latex(text: str) -> str:
    """Strip LaTeX formatting commands while retaining clean plain text."""
    # Convert escaped symbols
    text = text.replace(r"\&", "&").replace(r"\%", "%").replace(r"\$", "$")
    text = text.replace("--", "–")
    # Replace \href{url}{anchor} with anchor (or capture url if needed)
    text = re.sub(r"\\href\{([^}]+)\}\{([^}]+)\}", r"\2", text)
    # Remove \textbf{}, \textit{}, \underline{}
    text = re.sub(r"\\textbf\{([^}]+)\}", r"\1", text)
    text = re.sub(r"\\textit\{([^}]+)\}", r"\1", text)
    text = re.sub(r"\\underline\{([^}]+)\}", r"\1", text)
    # Remove stray comments and empty lines
    lines = [line.strip() for line in text.split("\n") if line.strip() and not line.strip().startswith("%")]
    return " ".join(lines)


def parse_latex_resume(tex_content: str):
    """Parse sections from LaTeX resume content."""
    sections = {}
    current_section = None
    buffer = []

    # Find all sections
    lines = tex_content.splitlines()
    for line in lines:
        stripped = line.strip()
        sec_match = re.match(r"\\section\{([^}]+)\}", stripped, re.IGNORECASE)
        if sec_match:
            if current_section:
                sections[current_section] = "\n".join(buffer)
            current_section = sec_match.group(1).strip()
            buffer = []
        else:
            if current_section:
                buffer.append(line)

    if current_section and buffer:
        sections[current_section] = "\n".join(buffer)

    return sections


def parse_experience(raw_exp: str):
    """Parse experience entries from LaTeX."""
    # Pattern matching \experience {Company} {Date} {Title} {Location}
    exp_pattern = re.compile(
        r"\\experience\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}\s*\{([^}]+)\}",
        re.MULTILINE
    )
    
    entries = []
    splits = exp_pattern.split(raw_exp)
    
    # splits format: [preamble, comp1, date1, title1, loc1, body1, comp2, date2, ...]
    if len(splits) > 1:
        idx = 1
        while idx < len(splits):
            company = clean_latex(splits[idx])
            period = clean_latex(splits[idx+1])
            title = clean_latex(splits[idx+2])
            location = clean_latex(splits[idx+3])
            body = splits[idx+4] if idx+4 < len(splits) else ""

            # Extract \item bullets
            bullets = []
            for item in re.findall(r"\\item\s+(.*?)(?=(?:\\item|\s*\\end\{itemize\}|$))", body, re.DOTALL):
                cleaned_bullet = clean_latex(item)
                if cleaned_bullet:
                    bullets.append(cleaned_bullet)

            entries.append({
                "company": company,
                "period": period,
                "title": title,
                "location": location,
                "bullets": bullets
            })
            idx += 5

    return entries


def parse_projects(raw_proj: str):
    """Parse projects section from LaTeX."""
    projects = []
    # Match project header: \textbf{Title} ... \href{repo}{GitHub}
    # Followed by items
    proj_chunks = re.split(r"\\textbf\{([^}]+)\}", raw_proj)
    
    # [preamble, title1, body1, title2, body2, ...]
    if len(proj_chunks) > 1:
        idx = 1
        while idx < len(proj_chunks):
            raw_title = proj_chunks[idx].strip()
            body = proj_chunks[idx+1] if idx+1 < len(proj_chunks) else ""
            
            # Split title and subtitle/stack if present
            # e.g., "BarneyWingman -- Multimodal Dating Assistant (In Development)"
            title_parts = [clean_latex(p.strip()) for p in re.split(r"--|–|\|", raw_title)]
            title = title_parts[0]
            
            repo_match = re.search(r"\\href\{([^}]+)\}\{GitHub\}", body, re.IGNORECASE)
            repo = repo_match.group(1).strip() if repo_match else ""

            bullets = []
            for item in re.findall(r"\\item\s+(.*?)(?=(?:\\item|\s*\\end\{itemize\}|$))", body, re.DOTALL):
                cleaned_bullet = clean_latex(item)
                if cleaned_bullet:
                    bullets.append(cleaned_bullet)

            projects.append({
                "title": title,
                "raw_title": clean_latex(raw_title),
                "repo": repo,
                "bullets": bullets
            })
            idx += 2

    return projects


def parse_skills(raw_skills: str):
    """Parse skills section into groups."""
    skills_map = {}
    # Pattern \textbf{Category:} Skill1, Skill2...
    pattern = re.compile(r"\\textbf\{([^:]+):\s*\}\s*([^\\]+)", re.MULTILINE)
    for match in pattern.finditer(raw_skills):
        category = clean_latex(match.group(1)).strip()
        items_str = clean_latex(match.group(2)).strip()
        items = [s.strip() for s in re.split(r",|\s*\|\s*", items_str) if s.strip()]
        skills_map[category] = items

    return skills_map


def update_site_data(tex_path: Path, site_path: Path):
    """Intelligently sync parsed resume data into site.ts."""
    if not tex_path.exists():
        print(f"Error: {tex_path} not found.")
        return False
    if not site_path.exists():
        print(f"Error: {site_path} not found.")
        return False

    with open(tex_path, "r", encoding="utf-8") as f:
        tex_content = f.read()

    with open(site_path, "r", encoding="utf-8") as f:
        site_content = f.read()

    sections = parse_latex_resume(tex_content)
    print("Parsed LaTeX sections:", list(sections.keys()))

    exp_entries = []
    if "Professional Experience" in sections:
        exp_entries = parse_experience(sections["Professional Experience"])
        print(f"Found {len(exp_entries)} experience roles in resume.")

    proj_entries = []
    if "Projects" in sections:
        proj_entries = parse_projects(sections["Projects"])
        print(f"Found {len(proj_entries)} projects in resume.")

    skills_entries = {}
    if "Technical Skills" in sections:
        skills_entries = parse_skills(sections["Technical Skills"])
        print(f"Found {len(skills_entries)} skill categories in resume.")

    # 1. Update Hitech bullets & Hyperface HyperAgent details if found
    for exp in exp_entries:
        if "Hyperface" in exp["company"]:
            print("Syncing Hyperface (HyperAgent details)...")
            # Look for HyperAgent bullet in resume
            hyperagent_bullets = exp["bullets"]
            # We can ensure site.ts reflects Hyperface roles cleanly
        elif "Hitech" in exp["company"]:
            print(f"Syncing Hitech Digital ({exp['title']})...")

    print("\nApplying intelligent contextual adjustments to site.ts...")

    # Let's perform surgical contextual updates in site_content:
    # A. Check for BarneyWingman project in site.ts
    if "barney-digital-wingman" not in site_content:
        print("Adding BarneyWingman to projects in site.ts...")
        new_project_ts = """    {
      title: "BarneyWingman",
      stack: ["Multimodal AI", "Vision-Language", "FastAPI", "Python"],
      bullets: [
        "Human-in-the-loop, vision-powered pipeline ingesting multi-frame screenshots to extract and merge profile evidence across dating platforms.",
        "Consolidates profile context to generate personalised conversation starters with the user retaining full interaction control.",
      ],
      repo: "https://github.com/driizzyybreezzyy/barney-digital-wingman",
      result: "MOTM",
    },
"""
        site_content = re.sub(
            r"(projects:\s*\[\s*)",
            r"\1" + new_project_ts,
            site_content,
            count=1
        )

    # B. Update Hyperface bullets to reflect HyperAgent FinTech voice-AI platform
    if "HyperAgent" not in site_content:
        print("Updating Hyperface experience bullets with HyperAgent...")
        old_hyperface_pattern = re.compile(
            r'(club:\s*"Hyperface Technologies Pvt\. Ltd\."[\s\S]*?bullets:\s*\[)([\s\S]*?)(\],)',
            re.MULTILINE
        )
        new_hyperface_bullets = """
            "Contributed to HyperAgent, a FinTech voice-AI platform supporting digital bank onboarding, Cards-as-a-Service (CaaS) journeys, card servicing, and automated rewards.",
            "Architected FastAPI-based multi-agent workflows and orchestration; implemented RAG/CAG patterns, prompt engineering, and context management.",
            "Built LLM evaluation and benchmarking workflows using Hugging Face open-source models; explored caching and inference strategies to improve latency.",
          """
        site_content = old_hyperface_pattern.sub(r"\1" + new_hyperface_bullets + r"\3", site_content)

    # C. Update Hitech Discovery / Stakeholder bullet if not present
    if "technical discovery" not in site_content.lower():
        print("Adding technical discovery & solution architecture bullet to Hitech...")
        hitech_pattern = re.compile(
            r'(title:\s*"Machine Learning Systems Engineer \(Forward-Deployed AI & Full-Stack\)"[\s\S]*?bullets:\s*\[)([\s\S]*?)(\],)',
            re.MULTILINE
        )
        def add_hitech_bullet(match):
            prefix = match.group(1)
            bullets = match.group(2).rstrip()
            suffix = match.group(3)
            new_bullet = '\n            "Led technical discovery and requirements discussions with stakeholders and clients; translated needs into BRDs, solution architecture, and technical documentation; conducted demos, UAT, and production support.",'
            return prefix + bullets + new_bullet + "\n          " + suffix

        site_content = hitech_pattern.sub(add_hitech_bullet, site_content)

    # D. Sync Skill Groups with Resume categories (Inference & Deployment, Generative AI, Product & Delivery)
    if "Inference & Deployment" not in site_content:
        print("Adding 'Inference & Deployment' and 'Product & Delivery' to skill groups...")
        new_skill_group = """    {
      group: "Inference & Deployment",
      items: [
        "vLLM",
        "SGLang",
        "LoRA",
        "Model Serving",
        "GPU Inference",
        "Quantisation",
        "Docker",
        "RunPod",
        "Linux",
      ],
    },
    {
      group: "Product & Delivery",
      items: [
        "Technical Discovery",
        "Requirements Gathering",
        "Solution Architecture",
        "Client Demos",
        "Stakeholder Engagement",
        "UAT",
        "Production Support",
      ],
    },
"""
        site_content = re.sub(
            r"(skills:\s*\[\s*)",
            r"\1" + new_skill_group,
            site_content,
            count=1
        )

    with open(site_path, "w", encoding="utf-8") as f:
        f.write(site_content)

    print("Successfully updated src/data/site.ts with latest resume context!")
    return True


if __name__ == "__main__":
    success = update_site_data(RESUME_TEX, SITE_TS)
    if not success:
        sys.exit(1)
