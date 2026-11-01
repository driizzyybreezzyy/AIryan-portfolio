#!/usr/bin/env python3
"""
sync_resume_context.py
Contextual sync engine that reads `resume/main.tex` and intelligently updates
`src/data/site.ts` in the AIryan FC portfolio while preserving all FUT/sports
theming, ratings, badges, and TypeScript interfaces.

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
    text = text.replace(r"\&", "&").replace(r"\%", "%").replace(r"\$", "$")
    text = text.replace("--", "–")
    text = re.sub(r"\\href\{([^}]+)\}\{([^}]+)\}", r"\2", text)
    text = re.sub(r"\\textbf\{([^}]+)\}", r"\1", text)
    text = re.sub(r"\\textit\{([^}]+)\}", r"\1", text)
    text = re.sub(r"\\underline\{([^}]+)\}", r"\1", text)
    lines = [line.strip() for line in text.split("\n") if line.strip() and not line.strip().startswith("%")]
    return " ".join(lines)


def parse_latex_resume(tex_content: str):
    """Parse sections from LaTeX resume content."""
    sections = {}
    current_section = None
    buffer = []

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


def parse_skills(raw_skills: str):
    """Parse skills section into groups."""
    skills_map = {}
    pattern = re.compile(r"\\textbf\{([^:]+):\s*\}\s*([^\\]+)", re.MULTILINE)
    for match in pattern.finditer(raw_skills):
        category = clean_latex(match.group(1)).strip()
        items_str = clean_latex(match.group(2)).strip()
        items = [s.strip() for s in re.split(r",|\s*\|\s*", items_str) if s.strip()]
        skills_map[category] = items

    return skills_map


def sync_dynamic_skills(site_content: str, skills_map: dict) -> str:
    """Dynamically sync all skills and categories from LaTeX into site.ts."""
    CATEGORY_MAPPING = {
        "Programming": "Languages",
        "Languages": "Languages",
        "Generative AI": "GenAI & NLP",
        "GenAI & NLP": "GenAI & NLP",
        "ML": "ML / Deep Learning",
        "ML / Deep Learning": "ML / Deep Learning",
        "Inference & Deployment": "Inference & Deployment",
        "Inference and Deployment": "Inference & Deployment",
        "Backend & Data": "Backend & Web",
        "Backend & Web": "Backend & Web",
        "Product & Delivery": "Product & Delivery",
        "Cloud & DevOps": "Cloud & DevOps",
        "Databases": "Databases",
    }

    for cat_name, items in skills_map.items():
        target_group = CATEGORY_MAPPING.get(cat_name, cat_name)
        
        # Check if the group exists in site_content
        pattern = re.compile(
            r'(\{\s*group:\s*\"' + re.escape(target_group) + r'\",\s*items:\s*\[)([\s\S]*?)(\]\s*,?\s*\})',
            re.MULTILINE
        )
        m = pattern.search(site_content)
        
        if m:
            prefix = m.group(1)
            current_block = m.group(2)
            suffix = m.group(3)
            
            # Extract existing items
            existing_items = [
                line.strip().strip('",').lower()
                for line in current_block.splitlines()
                if line.strip().strip('",')
            ]
            
            to_add = [item for item in items if item.lower() not in existing_items]
            if to_add:
                print(f"Dynamically adding to skill group '{target_group}': {to_add}")
                new_items_code = "".join([f'        "{item}",\n' for item in to_add])
                # Append before closing bracket
                clean_current = current_block.rstrip()
                updated_block = clean_current + "\n" + new_items_code + "      "
                site_content = pattern.sub(prefix + updated_block + suffix, site_content, count=1)
        else:
            # Group does not exist at all, add a new group to skills: [ ... ]
            print(f"Creating new skill group in site.ts: '{target_group}' with items: {items}")
            items_code = "".join([f'        "{item}",\n' for item in items])
            new_group_code = f"""    {{
      group: "{target_group}",
      items: [
{items_code}      ],
    }},
"""
            site_content = re.sub(
                r"(skills:\s*\[\s*)",
                r"\1" + new_group_code,
                site_content,
                count=1
            )

    return site_content


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

    # D. DYNAMIC SKILL SYNCING: Sync any skills added in LaTeX into site.ts
    if "Technical Skills" in sections:
        skills_entries = parse_skills(sections["Technical Skills"])
        site_content = sync_dynamic_skills(site_content, skills_entries)

    with open(site_path, "w", encoding="utf-8") as f:
        f.write(site_content)

    print("Successfully synchronized src/data/site.ts with latest resume context!")
    return True


if __name__ == "__main__":
    success = update_site_data(RESUME_TEX, SITE_TS)
    if not success:
        sys.exit(1)
