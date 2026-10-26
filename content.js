/* =============================================================================
   PORTFOLIO CONTENT
   Every word, number and case study on the site comes from this file.
   Edit, save, refresh. No build step.

   Inline formatting you can use inside any text value:
     **bold**     *italic*     ==highlighted evidence==     [link text](https://example.com)

   Password-protected case studies are NOT in this file. Only their public
   title, teaser and tags live here. Their full text is in
   ../private/protected-content.js and ships encrypted in content.locked.js.
   See README.md, section "Protected case studies".
   ============================================================================= */

window.PORTFOLIO = {

  /* ------------------------------------------------------------------ Basics */
  meta: {
    name: "Jaswanth Adusumilli",
    firstName: "Jaswanth",
    role: "AI Product Designer",
    location: "Boston, MA",
    email: "jaswanth.a@myworkprofiles.com",
    linkedin: "https://www.linkedin.com/in/jaswanthad",
    // Put your résumé PDF in site/assets/ and set the path, e.g. "assets/Jaswanth_Adusumilli_Resume.pdf".
    // A Résumé link appears in the header and contact section once this is set.
    resumeUrl: "assets/Jaswanth_Adusumilli_Resume.pdf",
    // Optional line under the hero, e.g. "Open to senior and lead product design roles."
    availability: "",
    lastUpdated: "October 2026"
  },

  /* -------------------------------------------------------------------- Hero */
  hero: {
    intro: "AI Product Designer at UnitedHealth Group, based in Boston",
    visual: [{ src: "assets/work/finlatics-dashboard-3m.webp", width: 1440, height: 1263, role: "main" }, { src: "assets/work/finlatics-onboarding-2-account-setup.webp", width: 390, height: 844, role: "phone" }],
    headline: "I design AI products that finish real tasks, show their reasoning, and work for everyone.",
    summary: "5+ years designing for healthcare technology, fintech education and B2B SaaS.",
    evidenceTitle: "What the work shows",
    evidenceHint: "Open a claim to see the case studies behind it.",
    // Each claim lists case studies by slug (see caseStudies below).
    evidence: [
      {
        claim: "AI that finishes real tasks",
        items: [
          { slug: "member-assistant", text: "Conversation flows for finding care, booking visits and seeing lab results" },
          { slug: "prior-authorization", text: "Prior-authorization submissions designed to pass on the first try" }
        ]
      },
      {
        claim: "Complex data people can read and trust",
        items: [
          { slug: "explainable-clinical-ai", text: "Explainable patterns that show clinicians why a disease risk was flagged" },
          { slug: "portfolio-simulation-dashboards", text: "Interaction specs that keep live market charts readable for learners" }
        ]
      },
      {
        claim: "Accessibility built into the system",
        items: [
          { slug: "ai-ui-standards", text: "WCAG 2.1 AA standards that AI-generated components must meet" },
          { slug: "finlatics-design-system", text: "A 60+ component library that cut designer ramp-up by ==40%==" }
        ]
      },
      {
        claim: "Research that changes the roadmap",
        items: [
          { slug: "finlatics-learner-journey", text: "==25+ moderated sessions== that led to ==3 major product pivots==" },
          { slug: "ai-augmented-practice", text: "AI-assisted research synthesis for several product squads" }
        , { slug: "advisor-ai", text: "==5 interviews and 3 rounds of evaluation== that reshaped an AI career platform" }]
      },
      {
        claim: "Outcomes measured after launch",
        items: [
          { slug: "finlatics-learner-journey", text: "==34% less drop-off== at account setup and ==28% longer sessions==" },
          { slug: "b2b-saas-navigation", text: "Core workflows cut from 4 clicks to 2, with task completion ==up 31%==" }
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- Work index
     Groups appear in this order. Each case study below names its group by id.
     A group with protected: true is shown as a password-protected list.
     {count} in the intro is replaced with the number of case studies. */
  work: {
    title: "Selected work",
    // The four cards on the home page, in order. Use a case study’s slug, or "uhg" for the protected UnitedHealth Group card.
    featured: ["uhg", "advisor-ai", "finlatics-learner-journey", "portfolio-simulation-dashboards"],
    allTitle: "All work",
    intro: "{count} case studies across healthcare, fintech education, career tools and SaaS. My current work at UnitedHealth Group is shared privately to respect confidentiality.",
    groups: [
      {
        id: "uhg",
        company: "UnitedHealth Group",
        role: "AI Product Designer",
        period: "Aug 2025 – present",
        protected: true,
        title: "AI for members, providers and clinicians",
        teaser: "Five case studies on a conversational assistant, prior authorization, explainable clinical AI and accessibility standards for AI-generated UI.",
        cover: "chat",
        description: "AI-native experiences for members, providers and clinicians, built inside an enterprise design system."
      },
      {"id": "independent", "company": "Independent projects", "role": "UX research and design", "description": "Academic projects outside my jobs: one solo, one in a team of five."},
      {
        id: "vivma",
        company: "Vivma Software",
        role: "Senior Product Designer",
        period: "Sep 2021 – Aug 2023",
        description: "End-to-end design for Finlatics, a simulated portfolio management platform for 500+ learners in finance programs."
      },
      {
        id: "adons",
        company: "Adons Softech",
        role: "UI/UX Designer",
        period: "May 2019 – Aug 2021",
        description: "Product and brand design for six early-stage startups in e-commerce and SaaS."
      }
    ]
  },

  /* ------------------------------------------------------------------ About */
  // The short bio on the home page. Experience and education under it come from `experience` below.
  about: {
    title: "About",
    paragraphs: [
      "I design digital products that make complex workflows understandable and actionable. Across healthcare technology, fintech education and B2B SaaS, I’ve worked on conversational AI, data-heavy interfaces, information architecture, research-led product changes and design systems.",
      "I work closely with engineers, product partners and data scientists, and I don’t treat a design as finished when it’s handed off. It’s finished when it changes something for the people using it."
    ]
  },

  /* ------------------------------------------------------------- How I work */
  // Not shown on the simplified home page (nor are capabilities or hero.evidence). Kept so you can bring them back.
  approach: {
    title: "How I work",
    intro: "Five habits that show up in every project, whatever the industry.",
    principles: [
      {
        title: "Start from the job, not the model",
        body: "AI earns its place by finishing real work, like finding a provider, booking a visit or submitting an authorization, not by answering questions well. I map the task first and design the conversation or interface around it."
      },
      {
        title: "Make the reasoning visible",
        body: "People act on a model’s output when they can see why it said what it said. Explainability is as much an interface problem as a modeling one, so I work it out with data science from the start."
      },
      {
        title: "Put accessibility in the system",
        body: "Standards belong in tokens, components and review checklists, so every surface meets WCAG 2.1 AA by default, including components generated with AI."
      },
      {
        title: "Use AI for speed, keep people accountable",
        body: "I use AI tools to explore layouts, generate assets and synthesize research faster. Decisions, standards and the final call stay with the team."
      },
      {
        title: "Judge the design after launch",
        body: "Drop-off, session time, task completion and first-pass success tell me whether a design worked. I review them after releases and carry what I learn into the next one."
      }
    ]
  },

  /* ------------------------------------------------------------- Experience */
  experience: {
    title: "Experience",
    roles: [
      {
        company: "UnitedHealth Group",
        role: "AI Product Designer",
        period: "Aug 2025 – present",
        summary: "Design AI-native interfaces for members, providers and clinicians: a conversational member assistant, AI-powered prior-authorization flows, explainable clinical risk patterns, and accessibility standards for AI-generated UI in the enterprise design system.",
        points: [
          "Partner with data science and engineering on how model outputs reach clinicians",
          "Set interaction and accessibility standards for AI-generated components",
          "Use Figma AI, Galileo AI, Midjourney, ChatGPT and Claude to speed up prototyping and research synthesis"
        ]
      },
      {
        company: "Vivma Software, building Finlatics",
        role: "Senior Product Designer",
        period: "Sep 2021 – Aug 2023",
        summary: "Owned end-to-end product design for Finlatics’ simulated portfolio management platform, supporting 500+ active learners across equity research, investment banking and financial markets programs.",
        points: [
          "Redesigned onboarding with Maze testing, cutting drop-off at account setup by 34%",
          "Built a 60+ component Figma library that cut designer ramp-up time by 40%",
          "Ran 25+ moderated research sessions that led to 3 major product pivots",
          "Led a mobile-first content redesign: sessions 28% longer, bounce rate 21% lower"
        ]
      },
      {
        company: "Adons Softech",
        role: "UI/UX Designer",
        period: "May 2019 – Aug 2021",
        summary: "Designed responsive web products for 6 early-stage startups across e-commerce and SaaS, delivering wireframes, high-fidelity prototypes and dev-ready assets in Sketch and InVision.",
        points: [
          "Restructured a B2B SaaS product’s information architecture: core workflows from 4 clicks to 2, task completion up 31%",
          "Created brand identities, icon sets and full style guides for 3 clients"
        ]
      }
    ],
    education: [
      { degree: "M.S., Information Systems", school: "Northeastern University", place: "Boston, MA" },
      { degree: "B.Tech, Computer Science", school: "Jawaharlal Nehru Technological University", place: "Hyderabad, India" }
    ]
  },

  capabilities: {
    title: "Capabilities and tools",
    groups: [
      { name: "Product design", items: ["User research", "Information architecture", "Interaction design", "Usability testing", "Wireframing and prototyping", "Design systems", "WCAG 2.1 accessibility"] },
      { name: "AI and automation", items: ["Prompt engineering with ChatGPT, Claude and Gemini", "Figma AI", "Galileo AI", "Midjourney", "DALL·E", "Uizard", "Zapier AI"] },
      { name: "Research methods", items: ["Moderated usability testing", "A/B testing", "Heuristic evaluation", "Card sorting", "Jobs-to-be-Done", "Affinity mapping"] },
      { name: "Design tools", items: ["Figma", "Adobe XD", "Sketch", "InVision", "Zeplin", "Maze", "Dovetail", "Miro", "Principle"] },
      { name: "Collaboration and handoff", items: ["Jira", "Confluence", "Notion", "GitHub design branches", "Agile and Scrum", "Design sprints"] },
      { name: "Data and analytics", items: ["Amplitude", "Google Analytics", "Hotjar", "Mixpanel", "AI-assisted insight synthesis"] }
    ]
  },

  /* ---------------------------------------------------------------- Contact */
  contact: {
    title: "Let’s talk",
    body: "I’m glad to talk about conversational AI, explainable interfaces, design systems and accessibility at scale. Email is the fastest way to reach me.",
    accessNote: "Need the password for the UnitedHealth Group case studies?"
  },

  colophon: "Set in Atkinson Hyperlegible Next, a typeface the Braille Institute designed to stay legible for readers with low vision. Hand-built as a static site, designed to meet WCAG 2.1 AA, with no analytics.",

  /* --------------------------------------------------- Independent projects
     Shown as an “Independent work” section once this list has entries.
     Copy this shape for each project:
     {
       title: "Project name",
       year: "2024",
       description: "One or two sentences: the problem, and what you made.",
       tags: ["Mobile app", "Concept"],
       cover: "journey",                       // optional, any cover name listed in README
       image: "assets/projects/my-shot.png",   // optional screenshot instead of a cover
       imageAlt: "What the screenshot shows",
       links: [ { label: "View project", url: "https://…" } ]
     }
  */
  projectsTitle: "Independent work",
  projectsIntro: "Personal and self-initiated projects.",
  personalProjects: [],

  /* ------------------------------------------------ Finlatics design system
     Tokens for the component sheets in the design system case study.
     Colors were sampled from your Finlatics screens; change them here and the
     sheets, including their contrast checks, update. */
  designSystem: {
    "name": "Finlatics",
    "font": "Inter",
    "colors": [
      {
        "token": "color.brand.primary",
        "role": "primary",
        "hex": "#0F7A52",
        "use": "Primary actions, selection, progress"
      },
      {
        "token": "color.brand.subtle",
        "role": "tint",
        "hex": "#E3F3EA",
        "use": "Selected backgrounds, success notes"
      },
      {
        "token": "color.text.primary",
        "role": "text",
        "hex": "#14181A",
        "use": "Headings and body text"
      },
      {
        "token": "color.text.secondary",
        "role": "muted",
        "hex": "#5B6B63",
        "use": "Supporting text, labels, metadata"
      },
      {
        "token": "color.surface.default",
        "role": "surface",
        "hex": "#FFFFFF",
        "use": "Cards, inputs, sheets"
      },
      {
        "token": "color.surface.canvas",
        "role": "canvas",
        "hex": "#F3F4F3",
        "use": "Page background"
      },
      {
        "token": "color.border.subtle",
        "role": "border",
        "hex": "#E3E6E2",
        "use": "Card edges and dividers"
      },
      {
        "token": "color.border.strong",
        "role": "borderStrong",
        "hex": "#8C8C8C",
        "use": "Input and control borders"
      },
      {
        "token": "color.neutral.track",
        "role": "track",
        "hex": "#E3E6E2",
        "use": "Progress tracks, skeletons, disabled fills"
      },
      {
        "token": "color.feedback.error",
        "role": "error",
        "hex": "#9C2B23",
        "use": "Errors and destructive actions"
      },
      {
        "token": "color.feedback.positive",
        "role": "positive",
        "hex": "#0F7A52",
        "use": "Gains and positive change"
      }
    ],
    "type": [
      {
        "token": "heading.xl",
        "size": 24,
        "line": 30,
        "weight": 600,
        "weightName": "Semibold",
        "sample": "Equity Research Fundamentals"
      },
      {
        "token": "metric.lg",
        "size": 22,
        "line": 28,
        "weight": 600,
        "weightName": "Semibold",
        "sample": "₹11,23,780"
      },
      {
        "token": "heading.lg",
        "size": 20,
        "line": 26,
        "weight": 600,
        "weightName": "Semibold",
        "sample": "Pick a learning track"
      },
      {
        "token": "body.md",
        "size": 15,
        "line": 22,
        "weight": 400,
        "weightName": "Regular",
        "sample": "Simulated stock picking and valuation"
      },
      {
        "token": "label.md",
        "size": 14,
        "line": 20,
        "weight": 600,
        "weightName": "Semibold",
        "sample": "College email"
      },
      {
        "token": "caption.sm",
        "size": 12,
        "line": 16,
        "weight": 400,
        "weightName": "Regular",
        "sample": "12 min · Completed"
      }
    ],
    "space": [4, 8, 12, 16, 20, 24, 32, 48],
    "radius": [
      {
        "token": "radius.sm",
        "px": 8
      },
      {
        "token": "radius.md",
        "px": 12
      },
      {
        "token": "radius.lg",
        "px": 16
      },
      {
        "token": "radius.full",
        "px": 999
      }
    ]
  },

  /* ----------------------------------------------------------- Case studies
     Order here is the order on the site.
     Public case study:    full content below.
     Protected case study: protected: true, plus title, teaser, tags and cover only.
                           Keep these public fields free of confidential names and numbers.
     Block types:   text, callout, steps, principles, decisions, table, metrics, visual
     Visual kinds:  flow, compare, chat, form, explain, chart, tree, anatomy, registry, slots, image, gallery (your own screens), system (design-system sheets), see README
     Cover names:   chat, form, explain, grid, layers, journey, chart, system, tree
     coverImage:    optional screenshot for a home page card, e.g. "assets/work/covers/your-file.webp"
  */
  caseStudies: [

    /* ---------- UnitedHealth Group (protected) ---------- */
    {
      slug: "member-assistant",
      group: "uhg",
      protected: true,
      title: "A conversational assistant that finishes the job",
      teaser: "Conversation flows that let health plan members find care, book visits and see lab results without a phone call.",
      tags: ["Conversational AI", "Healthcare", "Self-service"],
      cover: "chat"
    },
    {
      slug: "prior-authorization",
      group: "uhg",
      protected: true,
      title: "Prior authorization, right the first time",
      teaser: "Reducing ambiguity and rework in AI-powered prior-authorization submissions for providers.",
      tags: ["Workflow design", "Forms and data capture", "Providers"],
      cover: "form"
    },
    {
      slug: "explainable-clinical-ai",
      group: "uhg",
      protected: true,
      title: "Making clinical risk models legible",
      teaser: "Turning machine learning risk flags into explanations clinicians can check, trust and act on.",
      tags: ["Explainable AI", "Clinicians", "Data science partnership"],
      cover: "explain"
    },
    {
      slug: "ai-ui-standards",
      group: "uhg",
      protected: true,
      title: "Accessibility standards for AI-generated UI",
      teaser: "The rules generated components must meet inside an enterprise design system, so every surface is WCAG 2.1 AA by default.",
      tags: ["Design systems", "Accessibility", "Governance"],
      cover: "grid"
    },
    {
      slug: "ai-augmented-practice",
      group: "uhg",
      protected: true,
      title: "An AI-augmented design practice",
      teaser: "Using AI in prototyping, layout exploration and research synthesis to ship faster across product squads, without lowering the bar.",
      tags: ["Design operations", "Prototyping", "Research synthesis"],
      cover: "layers"
    },

    /* ---------- Vivma Software / Finlatics ---------- */
    {
      "slug": "advisor-ai",
      "group": "independent",
      "title": "Advisor.AI: an AI career platform that shows its reasoning",
      "teaser": "Research, design and three rounds of evaluation for a job-search platform that puts visa sponsorship first. Five students completed every task and rated it ==87== on the SUS.",
      "tags": [
        "AI product design",
        "UX research",
        "Usability testing"
      ],
      "cover": "flow",
      "coverImage": "assets/work/covers/advisor-ai.webp",
      "summary": "Graduate students juggled four to six tools and couldn’t tell which jobs sponsor visas or whether AI advice was any good. In 12 weeks I researched, designed and tested Advisor.AI, which brings five job-search tasks together with visa sponsorship up front and AI that explains itself.",
      "meta": [
        {
          "label": "Role",
          "value": "Solo UX researcher and designer"
        },
        {
          "label": "Duration",
          "value": "12 weeks"
        },
        {
          "label": "Context",
          "value": "Graduate project, Northeastern University"
        },
        {
          "label": "Methods",
          "value": "Interviews, affinity mapping, competitive analysis, walkthroughs, heuristic evaluation, usability testing"
        },
        {
          "label": "Tools",
          "value": "Figma, Miro, Dovetail, Julius, Claude, Excel"
        }
      ],
      "outcomes": [
        {
          "value": "87",
          "label": "SUS score in moderated testing"
        },
        {
          "value": "25 / 25",
          "label": "tasks completed by five participants"
        },
        {
          "value": "6.7%",
          "label": "error rate across tasks"
        }
      ],
      "sections": [
        {
          "id": "context",
          "label": "Context",
          "title": "Five tasks, four to six tools, one visa question",
          "blocks": [
            {
              "type": "text",
              "body": "Information Systems grad students prepare for the U.S. job market on top of coursework, using a resume tool, LinkedIn, an interview-practice site and a spreadsheet. For the four in five who needed sponsorship, the most important fact about a job was the hardest to find."
            },
            {
              "type": "text",
              "body": "**My role.** A solo 12-week project at Northeastern University: research, design, and evaluation before and after iterating."
            }
          ]
        },
        {
          "id": "problem",
          "label": "Problem",
          "title": "Students didn’t lack tools. They lacked one they could trust.",
          "blocks": [
            {
              "type": "callout",
              "title": "The question",
              "body": "How might we bring a graduate student’s job search into one place, put visa sponsorship first, and make AI suggestions people can judge for themselves?"
            },
            {
              "type": "text",
              "body": "Students lost hours on roles that would never sponsor them, and ignored AI suggestions they couldn’t tell apart from generic ones."
            }
          ]
        },
        {
          "id": "research",
          "label": "Research",
          "title": "Five interviews, five competitors, six needs",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "Interviews",
                  "body": "Five semi-structured sessions, 45–60 minutes each: how students prepare, where they get stuck, how they use AI."
                },
                {
                  "title": "Affinity mapping",
                  "body": "Tagged and clustered interview highlights in Dovetail."
                },
                {
                  "title": "Competitive analysis",
                  "body": "LinkedIn, VMock, TealHQ, Kickresume and Rezi: strengths and gaps."
                },
                {
                  "title": "Task analysis and journey mapping",
                  "body": "Five core activities, mapped where students lost time, confidence and context."
                }
              ]
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": false,
              "caption": "Interview highlights tagged in Dovetail, then counted by theme to see which problems came up most.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/advisor-ai-research-tags.webp",
                    "alt": "Dovetail tag board with columns for tasks, cognitive load, trust and missed opportunities, each holding the tags applied to interview highlights.",
                    "label": "Tagging highlights",
                    "width": 1028,
                    "height": 439
                  },
                  {
                    "src": "assets/work/advisor-ai-research-themes.webp",
                    "alt": "Dovetail bar chart counting highlights per tag. Job searching has the most, followed by skill development and application tracking.",
                    "label": "Highlights by theme",
                    "width": 1028,
                    "height": 437
                  }
                ]
              }
            },
            {
              "type": "table",
              "caption": "What students told me, and what it meant for the design",
              "columns": [
                "Finding",
                "What I heard",
                "What it meant"
              ],
              "rows": [
                [
                  "Visa sponsorship is invisible",
                  "“I waste hours applying to jobs that don’t sponsor visas—there’s no way to know upfront.”",
                  "Sponsorship as a primary filter, and visible on every job"
                ],
                [
                  "Tools are fragmented",
                  "“I use Resume.co for resumes, LinkedIn for jobs, Pramp for interviews, and Excel for tracking—it’s exhausting.”",
                  "One platform that keeps context across tasks"
                ],
                [
                  "AI isn’t trusted",
                  "“ChatGPT gives me suggestions, but I don’t know if they’re actually good or just generic.”",
                  "Every suggestion shows its reasoning and can be edited or dismissed"
                ],
                [
                  "Paywalls break trust",
                  "“I spent 30 minutes building a resume in Resume.co, then hit a $95 paywall to download it.”",
                  "Clear pricing, no surprise costs"
                ],
                [
                  "Interview prep is generic",
                  "“I practice with generic questions, but I need company-specific scenarios for my target roles.”",
                  "Practice tailored to the company and the role"
                ],
                [
                  "Tracking is manual",
                  "“I lose track of where I applied and what stage I’m in—I need a visual system.”",
                  "A visual pipeline that updates as students work"
                ]
              ]
            },
            {
              "type": "table",
              "caption": "Where existing tools fell short",
              "columns": [
                "Platform",
                "Strength",
                "Gap"
              ],
              "rows": [
                [
                  "VMock",
                  "Strong ATS scoring and resume feedback",
                  "Expensive, and resume-only"
                ],
                [
                  "TealHQ",
                  "Good job tracking and a Chrome extension",
                  "Separate tools for resumes and jobs, limited AI"
                ],
                [
                  "Kickresume",
                  "Templates and AI writing",
                  "Paywall frustration, no job search"
                ],
                [
                  "LinkedIn",
                  "A huge job database and networking",
                  "No visa filters, a lot of noise"
                ],
                [
                  "Rezi",
                  "ATS optimization",
                  "Generic suggestions, no interview prep"
                ]
              ]
            },
            {
              "type": "text",
              "body": "No tool covered all five tasks or explained its AI. That gap became the product: integration, transparent reasoning and context that carries across tasks."
            }
          ]
        },
        {
          "id": "people",
          "label": "People",
          "title": "Two personas, one shared constraint",
          "blocks": [
            {
              "type": "principles",
              "items": [
                {
                  "title": "Leo, the efficiency seeker",
                  "body": "International data science student balancing thesis research and applications. Comfortable with AI, short on time, unsure his style lands in U.S. interviews."
                },
                {
                  "title": "Riya, the career switcher",
                  "body": "International student moving into business analytics from a non-technical background. Cautious about AI; wants to know *why* a change helps."
                }
              ],
              "style": "personas"
            },
            {
              "type": "text",
              "body": "Both need sponsorship and organized tracking. Their difference in confidence and AI comfort set how much the product explains and how much control it hands back."
            }
          ]
        },
        {
          "id": "goals",
          "label": "Goals",
          "title": "Five goals the design had to meet",
          "blocks": [
            {
              "type": "principles",
              "items": [
                {
                  "title": "One connected experience",
                  "body": "All five tasks linked, so there’s no cost to switching."
                },
                {
                  "title": "Transparent AI",
                  "body": "Every recommendation shows its reasoning."
                },
                {
                  "title": "Visa sponsorship first",
                  "body": "A primary filter, never an afterthought."
                },
                {
                  "title": "Context that carries",
                  "body": "Resume data shapes job matching and interview prep."
                },
                {
                  "title": "Accessible and inclusive",
                  "body": "For every skill level and background, to WCAG AA."
                }
              ]
            }
          ]
        },
        {
          "id": "structure",
          "label": "Structure",
          "title": "A hub and five tasks that hand off to each other",
          "blocks": [
            {
              "type": "text",
              "body": "Students moved back and forth between tasks, so the platform is organized by task, not sequence: a dashboard hub, plus shortcuts like saving a job to the tracker or tailoring a resume to a posting."
            },
            {
              "type": "table",
              "caption": "How the platform is organized",
              "columns": [
                "Area",
                "What it holds"
              ],
              "rows": [
                [
                  "Dashboard",
                  "Entry points to every task, with quick stats"
                ],
                [
                  "Resume builder",
                  "AI-powered editor, ATS score analysis, templates"
                ],
                [
                  "Job search",
                  "Visa, location and role filters, AI job matching, saved searches"
                ],
                [
                  "Interview prep",
                  "Company-specific questions, an AI mock interviewer, feedback analysis"
                ],
                [
                  "Skill development",
                  "Skills gap analysis, learning paths, a resource library"
                ],
                [
                  "Application tracker",
                  "A visual pipeline, deadline reminders, status updates"
                ]
              ]
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": false,
              "caption": "Early wireframes for the resume list, resume editor, job search and application tracker, used in the first walkthroughs.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/advisor-ai-wire-resumes.webp",
                    "alt": "Wireframe of My Resumes: a large tile for creating a new resume next to two saved resumes, each with a match score.",
                    "label": "My resumes",
                    "width": 646,
                    "height": 400
                  },
                  {
                    "src": "assets/work/advisor-ai-wire-editor.webp",
                    "alt": "Wireframe of the resume editor: a section list on the left, experience, education and skills fields in the middle, and an ATS score of 65% with suggestions on the right.",
                    "label": "Resume editor",
                    "width": 646,
                    "height": 400
                  },
                  {
                    "src": "assets/work/advisor-ai-wire-jobs.webp",
                    "alt": "Wireframe of job search: a filter sidebar with a visa sponsorship toggle, location, work location and salary range, beside a grid of job cards.",
                    "label": "Job search",
                    "width": 646,
                    "height": 400
                  },
                  {
                    "src": "assets/work/advisor-ai-wire-tracker.webp",
                    "alt": "Wireframe of the application tracker: summary numbers above a Kanban board with Applied, Screening, Interview, Offer and Rejected columns.",
                    "label": "Application tracker",
                    "width": 646,
                    "height": 400
                  }
                ]
              }
            }
          ]
        },
        {
          "id": "evaluation",
          "label": "Evaluation",
          "title": "Three rounds of evaluation before I trusted the design",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "Cognitive walkthroughs",
                  "body": "2 students, domestic and international, did 5 tasks in 40–50 minute think-alouds, plus an AI-assisted pass: ==16 issues==, 7 high priority."
                },
                {
                  "title": "Heuristic evaluation",
                  "body": "I applied Nielsen’s 10 heuristics alongside an AI-assisted review. I caught gaps between features; the AI caught inconsistencies. ==20 issues==, 3 critical."
                },
                {
                  "title": "Moderated usability testing",
                  "body": "5 grad students, 3 international and 2 domestic, did 5 tasks over Zoom in 25–30 minutes. I measured completion, time, errors, usefulness and SUS."
                }
              ]
            },
            {
              "type": "text",
              "body": "Most-broken heuristics: visibility of system status, help and documentation, and aesthetic and minimalist design."
            }
          ]
        },
        {
          "id": "iteration",
          "label": "Iteration",
          "title": "What changed, and what each change did",
          "blocks": [
            {
              "type": "text",
              "body": "Fixes were prioritized by severity, frequency and task impact, each tied to a finding."
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": false,
              "caption": "Sponsorship moved from a sidebar toggle and description text to a highlighted filter and a status on every job, visible at a glance.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/advisor-ai-visa-before.webp",
                    "alt": "Wireframe of job search with a visa sponsorship toggle in the filter sidebar and a grid of job cards.",
                    "label": "Before",
                    "width": 610,
                    "height": 378
                  },
                  {
                    "src": "assets/work/advisor-ai-visa-after.webp",
                    "alt": "Redesigned job search with a highlighted visa sponsorship filter above the results list.",
                    "label": "After",
                    "width": 610,
                    "height": 378
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": false,
              "caption": "Logging an application took five steps. A quick-add button now opens a short form with just the essentials.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/advisor-ai-tracker-before.webp",
                    "alt": "Wireframe of the application tracker as a Kanban board from Applied to Offer.",
                    "label": "Before",
                    "width": 706,
                    "height": 437
                  },
                  {
                    "src": "assets/work/advisor-ai-tracker-after.webp",
                    "alt": "Redesigned tracker with application statistics at the top and a prominent Quick add button.",
                    "label": "After",
                    "width": 653,
                    "height": 406
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": false,
              "caption": "Keyword colors were unclear and AI suggestions went unnoticed. A legend, frequency tooltips and a clearer suggestions panel fixed both.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/advisor-ai-keywords-before.webp",
                    "alt": "Wireframe of the resume editor with an ATS score of 65% and suggestions in a side panel.",
                    "label": "Before",
                    "width": 706,
                    "height": 437
                  },
                  {
                    "src": "assets/work/advisor-ai-keywords-after.webp",
                    "alt": "Redesigned resume analysis with extracted keywords color-coded by priority, a legend, highlighted suggestions in the resume, and an ATS score of 87%.",
                    "label": "After",
                    "width": 703,
                    "height": 435
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": false,
              "caption": "Both walkthrough participants struggled with a ten-skill radar and no legend. It now shows the top five, with a persistent legend marking the biggest gap, and expands on request.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/advisor-ai-skills-before.webp",
                    "alt": "Radar chart of ten skills with current and target outlines and no legend.",
                    "label": "Before",
                    "width": 587,
                    "height": 500
                  },
                  {
                    "src": "assets/work/advisor-ai-skills-after.webp",
                    "alt": "Redesigned skills overview for a Data Analyst target role: a radar chart of five skills with a legend for your level, the target level and the priority gap, and a link to show all skills.",
                    "label": "After",
                    "width": 598,
                    "height": 753
                  }
                ]
              }
            },
            {
              "type": "text",
              "body": "Behavioral answers moved from an open text field to a guided Situation, Task, Action, Result template, with the AI visibly detecting each part."
            }
          ]
        },
        {
          "id": "results",
          "label": "Results",
          "title": "Tested with five students",
          "blocks": [
            {
              "type": "metrics",
              "items": [
                {
                  "value": "3.2",
                  "label": "minutes per task, on average"
                },
                {
                  "value": "4.0–4.5",
                  "label": "usefulness rating out of 5, by task"
                }
              ]
            },
            {
              "type": "principles",
              "title": "What participants said",
              "items": [
                {
                  "title": "International student, data science",
                  "body": "“The visa badge is genius—I wish LinkedIn had this.”"
                },
                {
                  "title": "International student, business analytics",
                  "body": "“The AI explanations built my confidence—I knew *why* I was making changes.”"
                },
                {
                  "title": "Career switcher, product management",
                  "body": "“End-to-end flow felt coherent—resume to job search to interview prep just flows.”"
                }
              ]
            },
            {
              "type": "text",
              "body": "Five participants is a small sample: a strong signal, not proof."
            },
            {
              "type": "text",
              "body": "**What still needed work.** Editing several applications at once, a clearer active resume version, and interview feedback beyond STAR."
            }
          ]
        },
        {
          "id": "reflection",
          "label": "Reflection",
          "title": "What I’d do next, and what I learned",
          "blocks": [
            {
              "type": "text",
              "body": "**Next.** Test with 10–15 students, build an MVP, and pilot it with Northeastern’s career services."
            },
            {
              "type": "text",
              "body": "**AI-assisted evaluation complements judgment.** The AI pass caught inconsistencies; people showed where the workflow broke."
            },
            {
              "type": "text",
              "body": "**International students’ needs aren’t an edge case.** I first treated sponsorship as an advanced filter. Research showed it came first."
            },
            {
              "type": "text",
              "body": "[Open the Figma prototype](https://www.figma.com/proto/Hs268H4pvbqCgwYktyLFfc/UX-Project-Advisor.Ai?node-id=240-3644&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=240%3A3644)"
            }
          ]
        }
      ],
      "glance": [
        {
          "body": "Job search spread across 4–6 tools, with visa sponsorship hard to find and AI advice hard to trust."
        },
        {
          "body": "Research, a five-task platform with visa-first search and explained AI, and three evaluation rounds."
        },
        {
          "body": "SUS 87 and 25 of 25 tasks completed in moderated testing."
        }
      ]
    },
    {
      "slug": "nike-nft-concept",
      "group": "independent",
      "title": "Nike app × NFTs: the competitive research behind a concept",
      "teaser": "My part of a five-person academic concept: a competitive analysis of Adidas and Gucci that shaped how the team introduced NFTs to people who had never bought one.",
      "tags": [
        "Competitive analysis",
        "Market research",
        "Concept design"
      ],
      "cover": "flow",
      "coverImage": "assets/work/covers/nike-nft.webp",
      "summary": "Five of us imagined NFTs in the Nike app: exclusive digital sneakers, proof of ownership, and physical and digital collections together, in more languages. I led competitive analysis and market research, and the gaps I found set two priorities: explain NFTs to first-time buyers, and keep shopping familiar.",
      "meta": [
        {
          "label": "Role",
          "value": "Competitive analysis and market research"
        },
        {
          "label": "Team",
          "value": "Five designers and researchers"
        },
        {
          "label": "Duration",
          "value": "7 weeks"
        },
        {
          "label": "Context",
          "value": "Academic concept, not affiliated with Nike"
        },
        {
          "label": "Tools",
          "value": "Figma, Moqups"
        }
      ],
      "outcomes": [],
      "sections": [
        {
          "id": "context",
          "label": "Context",
          "title": "A concept for bringing NFTs into the Nike app",
          "blocks": [
            {
              "type": "text",
              "body": "A seven-week academic concept redesigning the Nike app around NFTs, for tech-savvy shoppers aged 18–40, collectors who follow Nike’s designs, and a global audience poorly served outside English."
            },
            {
              "type": "principles",
              "title": "Team",
              "style": "personas",
              "items": [
                {
                  "title": "Jaswanth Adusumilli (me)",
                  "body": "Competitive analysis and market research"
                },
                {
                  "title": "Santosh Krishnan",
                  "body": "Wireframing and prioritization"
                },
                {
                  "title": "Dipti Shevalekar",
                  "body": "Information architecture and layout"
                },
                {
                  "title": "Ajay Devmane",
                  "body": "Style guide and visual design"
                },
                {
                  "title": "Rethu Fernando",
                  "body": "SWOT analysis and personas"
                }
              ]
            }
          ]
        },
        {
          "id": "problem",
          "label": "Problem",
          "title": "A store, but no reason to come back",
          "blocks": [
            {
              "type": "text",
              "body": "The app offered shopping and little else: nothing for digital collectibles, and little for people who don’t read English well. Our audience was curious about NFTs but unfamiliar with them, and wary of security and ownership."
            },
            {
              "type": "callout",
              "title": "The question",
              "body": "How might Nike offer exclusive digital sneakers without making the app harder for everyone who just wants to buy shoes?"
            }
          ]
        },
        {
          "id": "research",
          "label": "My research",
          "title": "What Adidas and Gucci got right, and wrong",
          "blocks": [
            {
              "type": "text",
              "body": "I compared Nike’s app with Adidas and Gucci, both already selling NFTs, on features, visual design, engagement and how they introduced NFTs."
            },
            {
              "type": "table",
              "caption": "Competitive analysis",
              "columns": [
                "Brand",
                "Strengths",
                "Weaknesses",
                "What we took from it"
              ],
              "rows": [
                [
                  "Nike (baseline)",
                  "Strong brand recognition and a loyal customer base",
                  "No NFT functionality, and a dated digital experience",
                  "Room to be first with a complete NFT experience"
                ],
                [
                  "Adidas",
                  "Futuristic visuals, strong community engagement, smooth wallet integration",
                  "Overwhelming for casual users, with a thin traditional shopping experience",
                  "Balance NFT and everyday shopping, with optional tutorials"
                ],
                [
                  "Gucci",
                  "Luxury aesthetics, easy NFT integration, personalized recommendations",
                  "Complex navigation that assumes NFT knowledge",
                  "Keep navigation simple and explain NFTs in plain language"
                ]
              ]
            },
            {
              "type": "text",
              "body": "**How it shaped the design.** Both competitors assumed customers understood NFTs. So the team focused on the riskiest moment, a first NFT purchase, and one rule: NFTs one tap away, never in the way of buying shoes."
            },
            {
              "type": "principles",
              "title": "Who we designed for (personas by Rethu Fernando)",
              "items": [
                {
                  "title": "Nick, the reseller",
                  "body": "Digital marketing specialist reselling digital sneakers on the side. Wants verified ownership plus value and history tracking."
                },
                {
                  "title": "Andrew, the collector",
                  "body": "UI/UX designer collecting rare digital and physical designs. Frustrated by glitchy drops; wants fast checkout."
                }
              ],
              "style": "personas"
            }
          ]
        },
        {
          "id": "design",
          "label": "Design",
          "title": "Shopping first, NFTs one tap away",
          "blocks": [
            {
              "type": "text",
              "body": "Shopping stays in the bottom navigation, with an NFT toggle in Shop and a QR scanner to check authenticity. Store location, notifications and the cart move to the top bar, so everyday paths stay familiar."
            },
            {
              "type": "visual",
              "kind": "image",
              "illustrative": false,
              "caption": "The information architecture, by Dipti Shevalekar.",
              "data": {
                "src": "assets/work/nike-nft-ia.webp",
                "alt": "Information architecture diagram showing how the homepage branches into the shopping, NFT, profile and checkout flows.",
                "width": 1231,
                "height": 706
              }
            },
            {
              "type": "table",
              "caption": "How the team prioritized, using MoSCoW",
              "columns": [
                "Priority",
                "Feature",
                "Why"
              ],
              "rows": [
                [
                  "Must have",
                  "NFT onboarding that guides first-time buyers",
                  "Without it, people unfamiliar with NFTs give up"
                ],
                [
                  "Must have",
                  "Browsing and buying exclusive Nike NFTs in the app",
                  "The core difference from a standard store"
                ],
                [
                  "Should have",
                  "Personalized content and recommendations",
                  "Adds engagement, but the app works without it"
                ],
                [
                  "Should have",
                  "Multi-language support",
                  "Important for global reach; English is enough for a first version"
                ],
                [
                  "Could have",
                  "Sharing a collection on social media",
                  "Helps reach, but isn’t essential"
                ],
                [
                  "Won’t have",
                  "AR virtual try-on",
                  "Too resource-intensive for this scope"
                ]
              ]
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": false,
              "caption": "Early wireframes, by Santosh Krishnan.",
              "data": {
                "columns": 4,
                "columnsSmall": 2,
                "items": [
                  {
                    "src": "assets/work/nike-nft-wire-profile.webp",
                    "alt": "Low-fidelity wireframe of a profile screen.",
                    "label": "Profile",
                    "width": 298,
                    "height": 556
                  },
                  {
                    "src": "assets/work/nike-nft-wire-profile-2.webp",
                    "alt": "Low-fidelity wireframe of a second profile layout with a list of rows, each with an icon placeholder.",
                    "label": "Profile, version 2",
                    "width": 279,
                    "height": 553
                  },
                  {
                    "src": "assets/work/nike-nft-wire-login.webp",
                    "alt": "Low-fidelity wireframe of the login screen.",
                    "label": "Login",
                    "width": 292,
                    "height": 595
                  },
                  {
                    "src": "assets/work/nike-nft-wire-landing.webp",
                    "alt": "Low-fidelity wireframe of the landing screen with a large image placeholder.",
                    "label": "Landing",
                    "width": 343,
                    "height": 664
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "image",
              "illustrative": false,
              "caption": "The layout spec the team built against: 22 px side margins, 25 px between components, and 320 × 46 px buttons.",
              "data": {
                "src": "assets/work/nike-nft-layout-spec.webp",
                "alt": "Annotated layout spec for an iPhone 13 Pro Max screen showing the side margins, spacing between components, spacing between cards and icon sizes.",
                "width": 717,
                "height": 692,
                "maxWidth": 560
              }
            },
            {
              "type": "table",
              "caption": "The style guide, by Ajay Devmane",
              "columns": [
                "Token",
                "Value",
                "Used for"
              ],
              "rows": [
                [
                  "Nike Black",
                  "#000000",
                  "The main background"
                ],
                [
                  "White",
                  "#FFFFFF",
                  "Text on dark, cards and input fields"
                ],
                [
                  "Blue",
                  "#295BA4",
                  "Navigation links"
                ],
                [
                  "Emerald",
                  "#4B7A35",
                  "Order tracking and success states"
                ],
                [
                  "Gold",
                  "#E1A569",
                  "Sale badges and NFT indicators"
                ],
                [
                  "Nike Red",
                  "#B70F0B",
                  "Critical actions and errors"
                ],
                [
                  "Type scale",
                  "48, 36, 24, 16, 14",
                  "H1, H2, H3, body and caption sizes, in pixels"
                ]
              ]
            }
          ]
        },
        {
          "id": "reflection",
          "label": "Reflection",
          "title": "What I’d do differently",
          "blocks": [
            {
              "type": "text",
              "body": "**Research earns its place when it changes the plan.** The analysis pointed the team at its biggest risk: first-time NFT buyers."
            },
            {
              "type": "text",
              "body": "**Check contrast against the real background.** On black, the link blue and error red reach only about 3.1:1, below the 4.5:1 text needs. I’d lighten both first."
            },
            {
              "type": "text",
              "body": "**Be honest about what a concept can show.** It stayed a concept, so there are no launch numbers. What carries over: introducing new technology without getting in people’s way."
            }
          ]
        }
      ],
      "glance": [
        {
          "body": "The app was only a store, with nothing for digital collectibles and little for non-English readers."
        },
        {
          "body": "Competitive analysis of Adidas and Gucci, plus market research, in a team of five."
        },
        {
          "body": "Two team priorities: explain NFTs to first-time buyers, keep shopping familiar."
        }
      ]
    },
    {
      "slug": "finlatics-learner-journey",
      "group": "vivma",
      "title": "From sign-up to the simulator: the Finlatics learner journey",
      "teaser": "Cutting account-setup drop-off by 34%, reshaping the roadmap with 25+ research sessions, and rebuilding program content for phones first.",
      "tags": [
        "Onboarding",
        "User research",
        "Mobile-first"
      ],
      "cover": "journey",
      "coverImage": "assets/work/covers/finlatics-learner-journey.webp",
      "summary": "Too many Finlatics learners left during account setup, before reaching the portfolio simulator. I redesigned onboarding with usability testing in Maze, ran research that changed the product’s direction, and led a mobile-first redesign of program content.",
      "meta": [
        {
          "label": "Role",
          "value": "Senior Product Designer, end-to-end owner"
        },
        {
          "label": "Team",
          "value": "About 1 product owner, 2–3 frontend and 1–2 backend engineers"
        },
        {
          "label": "When",
          "value": "Sep 2021 – Aug 2023"
        },
        {
          "label": "Users",
          "value": "500+ active learners and their college partners"
        },
        {
          "label": "Platform",
          "value": "Web, mobile-responsive"
        },
        {
          "label": "Tools",
          "value": "Figma, Maze, Dovetail, Adobe XD"
        }
      ],
      "outcomes": [
        {
          "value": "−34%",
          "label": "drop-off at account setup"
        },
        {
          "value": "+28%",
          "label": "session duration on program content"
        },
        {
          "value": "−21%",
          "label": "bounce rate within 90 days of launch"
        },
        {
          "value": "25+",
          "label": "moderated research sessions"
        }
      ],
      "sections": [
        {
          "id": "context",
          "label": "Context",
          "title": "A practice platform for future analysts",
          "blocks": [
            {
              "type": "text",
              "body": "Finlatics learners in equity research, investment banking and financial markets programs build a simulated portfolio, follow live markets and apply their coursework. Many arrive through college partners, so the first hour matters to learner and partner alike."
            },
            {
              "type": "text",
              "body": "**My role.** End-to-end product design: research, flows, the component library, dashboards and post-release reviews."
            }
          ]
        },
        {
          "id": "problem",
          "label": "Problem",
          "title": "Losing learners before they reached the product",
          "blocks": [
            {
              "type": "text",
              "body": "Learners who quit during setup never reach the product, which made onboarding the highest-leverage fix. Content pages, where learners spent most of their time, often on phones, weren’t designed for small screens."
            },
            {
              "type": "callout",
              "title": "The question we worked from",
              "body": "How might we get a learner from sign-up into the simulator with as little friction as possible, and keep them engaged on any device?"
            },
            {
              "type": "principles",
              "title": "Constraints the design had to respect",
              "items": [
                {
                  "title": "Less friction, same information",
                  "body": "Easier setup without losing information the platform needs."
                },
                {
                  "title": "Partners were watching",
                  "body": "Many learners came through college partners, so a poor first hour hurt the partnership too."
                },
                {
                  "title": "Most reading happened on phones",
                  "body": "Content pages weren’t built for the small screens most learners read on."
                }
              ]
            }
          ]
        },
        {
          "id": "research",
          "label": "Research",
          "title": "25+ sessions, turned into decisions",
          "blocks": [
            {
              "type": "text",
              "body": "==25+ moderated sessions== with students and college partners, synthesized in Dovetail, led to ==three major product pivots== that expanded institutional B2B partnerships."
            },
            {
              "type": "visual",
              "kind": "flow",
              "caption": "How research moved from sessions to roadmap decisions.",
              "data": {
                "steps": [
                  {
                    "title": "Moderated sessions",
                    "note": "25+ with students and college partners"
                  },
                  {
                    "title": "Tag and code",
                    "note": "Highlights and tags in Dovetail"
                  },
                  {
                    "title": "Cluster",
                    "note": "Affinity mapping into themes"
                  },
                  {
                    "title": "Frame insights",
                    "note": "Each backed by quotes and observed behavior"
                  },
                  {
                    "title": "Decide",
                    "note": "3 major product pivots",
                    "highlight": true
                  }
                ]
              }
            }
          ]
        },
        {
          "id": "decisions",
          "label": "Decisions",
          "title": "Decisions that shaped the journey",
          "blocks": [
            {
              "type": "decisions",
              "items": [
                {
                  "decision": "Treat onboarding as the start of learning",
                  "why": "Setup should move people toward the simulator, not just collect their details."
                },
                {
                  "decision": "Let testing decide what changed",
                  "why": "Maze showed where people hesitated or failed. Evidence, not visual judgment, drove each iteration."
                },
                {
                  "decision": "Design content for phones first",
                  "why": "Hierarchy and reading flow designed for small screens first, then scaled up to desktop."
                }
              ]
            }
          ]
        },
        {
          "id": "onboarding",
          "label": "Onboarding",
          "title": "Redesigning account setup with evidence",
          "blocks": [
            {
              "type": "text",
              "body": "Redesigned in Figma and tested in Maze. Each round targeted the steps where people hesitated or failed."
            },
            {
              "type": "visual",
              "kind": "flow",
              "caption": "The learner journey. Account setup was where learners left.",
              "data": {
                "steps": [
                  {
                    "title": "Discover",
                    "note": "From a program or college link"
                  },
                  {
                    "title": "Sign up",
                    "note": "Create an account"
                  },
                  {
                    "title": "Account setup",
                    "note": "Where learners dropped off",
                    "highlight": true
                  },
                  {
                    "title": "Enter the simulator",
                    "note": "Build a first portfolio"
                  },
                  {
                    "title": "Learn and practice",
                    "note": "Lessons alongside the portfolio"
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": true,
              "caption": "The onboarding, recreated for this portfolio: pick a track, create the account, then review and confirm, with errors explained next to each field.",
              "data": {
                "columns": 4,
                "columnsSmall": 2,
                "items": [
                  {
                    "src": "assets/work/finlatics-onboarding-1-choose-program.webp",
                    "alt": "Step 1 of 3. Pick a learning track: Equity Research (selected), Investment Banking or Financial Markets, with a Continue button.",
                    "label": "Choose a program",
                    "width": 390,
                    "height": 844
                  },
                  {
                    "src": "assets/work/finlatics-onboarding-2-account-setup.webp",
                    "alt": "Step 2 of 3. Account form with full name, college email and password, and a note that the Equity Research program starts with ₹10,00,000 in virtual capital.",
                    "label": "Create the account",
                    "width": 390,
                    "height": 844
                  },
                  {
                    "src": "assets/work/finlatics-onboarding-3-validation-errors.webp",
                    "alt": "The same form with an error under each field: enter your full name, enter a valid college email address, and choose a password with at least 8 characters.",
                    "label": "Errors in place",
                    "width": 390,
                    "height": 844
                  },
                  {
                    "src": "assets/work/finlatics-onboarding-4-review.webp",
                    "alt": "Step 3 of 3. A review of name, email, program and starting capital, with Create account and Back buttons.",
                    "label": "Review and confirm",
                    "width": 390,
                    "height": 844
                  }
                ]
              }
            }
          ]
        },
        {
          "id": "mobile",
          "label": "Mobile-first content",
          "title": "Program content, designed for phones first",
          "blocks": [
            {
              "type": "text",
              "body": "A mobile-first redesign of program content in Adobe XD: small screens first, then desktop."
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": true,
              "caption": "Program content, designed for phones first: progress at the top, the next lesson one tap away, and a clear finish line.",
              "data": {
                "columns": 4,
                "columnsSmall": 2,
                "items": [
                  {
                    "src": "assets/work/finlatics-course-1-overview.webp",
                    "alt": "Course overview for Equity Research Fundamentals, module 2 of 6, one of three lessons complete, with a Continue lesson card and the module’s lesson list.",
                    "label": "Module overview",
                    "width": 390,
                    "height": 844
                  },
                  {
                    "src": "assets/work/finlatics-course-2-lesson.webp",
                    "alt": "Lesson 2.2, Balance sheet ratios: a short summary of the current, quick and debt-to-equity ratios, with Mark complete and Return to course buttons.",
                    "label": "Lesson",
                    "width": 390,
                    "height": 844
                  },
                  {
                    "src": "assets/work/finlatics-course-3-progress.webp",
                    "alt": "The course overview after the lesson, now two of three lessons complete, with the next lesson queued.",
                    "label": "Progress updates",
                    "width": 390,
                    "height": 844
                  },
                  {
                    "src": "assets/work/finlatics-course-4-complete.webp",
                    "alt": "A module-complete message with all three lessons checked and a Review this module button.",
                    "label": "Module complete",
                    "width": 390,
                    "height": 844
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "compare",
              "caption": "Engagement within 90 days of launch, indexed to the previous pages.",
              "data": {
                "beforeLabel": "Previous pages",
                "afterLabel": "Mobile-first redesign",
                "items": [
                  {
                    "label": "Session duration",
                    "before": 100,
                    "after": 128,
                    "unit": "index",
                    "display": "+28%"
                  },
                  {
                    "label": "Bounce rate",
                    "before": 100,
                    "after": 79,
                    "unit": "index",
                    "display": "−21%"
                  }
                ]
              }
            }
          ]
        },
        {
          "id": "impact",
          "label": "Validation",
          "title": "What changed",
          "blocks": [
            {
              "type": "text",
              "body": "Drop-off at account setup fell ==34%==. On program content, sessions grew ==28%== longer and bounce fell ==21%== within 90 days of launch. The research program’s three pivots expanded the platform’s institutional B2B partnerships."
            },
            {
              "type": "text",
              "body": "**What I took forward.** Research only matters when it changes decisions, so I plan every study around the decision it should inform."
            }
          ]
        },
        {
          "id": "behind",
          "label": "Behind the work",
          "title": "Scope, process and the questions interviewers ask",
          "blocks": [
            {
              "type": "facts",
              "items": [
                {
                  "label": "What I owned",
                  "body": "End-to-end design of the Finlatics learner journey: onboarding and account setup, the research program, and the mobile-first redesign of program content."
                },
                {
                  "label": "Who I worked with",
                  "body": "About one product owner, two to three frontend and one to two backend engineers, and analytics support, plus students and college partners in research."
                },
                {
                  "label": "When",
                  "body": "As Senior Product Designer at Vivma Software, September 2021 to August 2023."
                }
              ]
            },
            {
              "type": "steps",
              "title": "How I approached it",
              "items": [
                {
                  "title": "Find where learners leave",
                  "body": "Account setup, before the simulator."
                },
                {
                  "title": "Research with learners and partners",
                  "body": "25+ sessions, Dovetail."
                },
                {
                  "title": "Redesign in Figma",
                  "body": "Setup as the start of learning."
                },
                {
                  "title": "Test in Maze",
                  "body": "Two rounds, about 16 learners each."
                },
                {
                  "title": "Check after launch",
                  "body": "Drop-off, sessions and bounce."
                }
              ]
            },
            {
              "type": "lists",
              "columns": [
                {
                  "title": "Edge cases and states",
                  "items": [
                    [
                      "The chosen track stays visible through account setup",
                      "Create account"
                    ],
                    [
                      "Starting virtual capital shown before the account is created",
                      "Create account"
                    ],
                    [
                      "Errors appear next to each field, saying what to fix",
                      "Errors"
                    ],
                    [
                      "A review step before the account is created",
                      "Review"
                    ],
                    [
                      "Progress visible across modules and lessons",
                      "Course"
                    ],
                    [
                      "A clear finish, with a way to review",
                      "Module complete"
                    ]
                  ]
                },
                {
                  "title": "Accessibility notes",
                  "items": [
                    [
                      "Errors in text next to each field, not color alone",
                      "3.3.1"
                    ],
                    [
                      "Labels stay visible above fields",
                      "3.3.2"
                    ],
                    [
                      "The chosen track marked with a check and text",
                      "1.4.1"
                    ],
                    [
                      "Brand green at 5.35:1, body text at 17.87:1",
                      "1.4.3"
                    ],
                    [
                      "Content reflows on small screens",
                      "1.4.10"
                    ]
                  ]
                }
              ]
            },
            {
              "type": "measure",
              "items": [
                {
                  "label": "Reported",
                  "body": "−34% drop-off at account setup; +28% session duration and −21% bounce on program content within 90 days of launch; 25+ moderated sessions; three pivots that expanded B2B partnerships."
                },
                {
                  "label": "What it doesn’t show",
                  "body": "Learning outcomes. Session length and bounce are engagement signals, not proof that learners learned more."
                },
                {
                  "label": "How it was measured",
                  "body": "Drop-off compares learners who started account setup with those who completed it, old flow against new, as a relative reduction. Session duration and bounce compare matched periods before and after launch. Exact rates are confidential."
                }
              ]
            },
            {
              "type": "faq",
              "title": "Questions interviewers ask",
              "items": [
                {
                  "q": "What exactly did you own?",
                  "a": "End-to-end design: the research, the onboarding flows, the mobile-first content pages, the component library and the dashboards, plus reviewing results after release."
                },
                {
                  "q": "How did you know onboarding was the problem?",
                  "a": "Learners who quit during setup never reached the simulator, which made it the highest-leverage fix. Research and testing showed where people hesitated."
                },
                {
                  "q": "How many Maze rounds did you run?",
                  "a": "Two rounds with roughly 16 learners each: the first on the existing onboarding, the second on the revised prototype."
                },
                {
                  "q": "What did testing change?",
                  "a": "Maze showed where people hesitated or failed, and each round targeted those steps. Evidence, not visual judgment, decided what changed."
                },
                {
                  "q": "What were the three pivots?",
                  "a": "Onboarding-first activation, getting learners from setup into the simulator; mobile-first learning content; and interactive portfolio comprehension through the BSE 500 dashboards."
                },
                {
                  "q": "Why mobile first?",
                  "a": "Learners spent most of their time on program content, often on phones, and those pages weren’t built for small screens."
                },
                {
                  "q": "Does a longer session mean better learning?",
                  "a": "Not on its own. I read it alongside lesson completion and whether learners move on into the simulator."
                },
                {
                  "q": "What did you learn?",
                  "a": "Research only matters when it changes decisions, so I plan every study around the decision it should inform."
                }
              ]
            },
            {
              "type": "text",
              "body": "Recreated screens use fictional data. Team and study sizes are approximate; exact figures are confidential."
            }
          ]
        }
      ],
      "glance": [
        {
          "body": "Learners dropped off in account setup, and content pages weren’t built for the phones they read on."
        },
        {
          "body": "Onboarding redesigned and tested in Maze, 25+ research sessions, mobile-first content."
        },
        {
          "body": "−34% setup drop-off, +28% session duration, −21% bounce."
        }
      ],
      "hero": {
        "kind": "gallery",
        "data": {
          "columns": 3,
          "columnsSmall": 3,
          "items": [
            {
              "src": "assets/work/finlatics-onboarding-1-choose-program.webp",
              "alt": "Step 1 of 3. Pick a learning track: Equity Research (selected), Investment Banking or Financial Markets, with a Continue button.",
              "width": 390,
              "height": 844
            },
            {
              "src": "assets/work/finlatics-onboarding-2-account-setup.webp",
              "alt": "Step 2 of 3. Account form with full name, college email and password, and a note that the Equity Research program starts with ₹10,00,000 in virtual capital.",
              "width": 390,
              "height": 844
            },
            {
              "src": "assets/work/finlatics-onboarding-4-review.webp",
              "alt": "Step 3 of 3. A review of name, email, program and starting capital, with Create account and Back buttons.",
              "width": 390,
              "height": 844
            }
          ]
        },
        "caption": "Onboarding, recreated for this portfolio: choose a track, create the account, review and confirm."
      }
    },

    {
      "slug": "portfolio-simulation-dashboards",
      "group": "vivma",
      "title": "Real-time portfolio simulation that learners can read",
      "teaser": "Interactive dashboards for a live BSE 500 simulation, with chart interactions and tooltip behavior specified state by state for engineering.",
      "tags": [
        "Data visualization",
        "Interaction design",
        "Dev handoff"
      ],
      "cover": "chart",
      "coverImage": "assets/work/covers/finlatics-dashboards.webp",
      "summary": "Finlatics learners manage simulated portfolios against live BSE 500 movement. I designed the dashboards with engineering, specifying chart interactions and tooltip behavior as Zeplin specs so live data stayed readable.",
      "meta": [
        {
          "label": "Role",
          "value": "Senior Product Designer"
        },
        {
          "label": "Team",
          "value": "2–3 frontend and 1–2 backend engineers"
        },
        {
          "label": "When",
          "value": "Sep 2021 – Aug 2023"
        },
        {
          "label": "Data",
          "value": "Real-time BSE 500 portfolio simulation"
        },
        {
          "label": "Partners",
          "value": "Engineering"
        },
        {
          "label": "Tools",
          "value": "Figma, Zeplin"
        }
      ],
      "outcomes": [],
      "sections": [
        {
          "id": "context",
          "label": "Context",
          "title": "Learning markets by managing a portfolio",
          "blocks": [
            {
              "type": "text",
              "body": "The BSE 500 spans a broad slice of the Bombay Stock Exchange. Learners build portfolios from it and watch them move in real time, turning coursework into decisions with visible consequences."
            }
          ]
        },
        {
          "id": "problem",
          "label": "Problem",
          "title": "Charts that move while you read them",
          "blocks": [
            {
              "type": "text",
              "body": "A tooltip that jumps with a new price, a crosshair that lags or an axis that rescales mid-glance breaks a learner’s read. Learners still building market intuition needed dashboards calmer than the market."
            }
          ]
        },
        {
          "id": "approach",
          "label": "Approach",
          "title": "Interaction first, visuals second",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "Define the questions",
                  "body": "How am I doing, against what, and since when?"
                },
                {
                  "title": "Specify the interaction model",
                  "body": "Hover, focus, touch and keyboard behavior for every chart, before visual polish."
                },
                {
                  "title": "Design every state",
                  "body": "Loading, live updates and empty portfolios, not just the happy path."
                },
                {
                  "title": "Work through live updates with engineering",
                  "body": "How charts and tooltips behave as data arrives, agreed before build."
                },
                {
                  "title": "Hand off as specs",
                  "body": "Annotated Zeplin specs for interaction patterns and tooltips."
                }
              ]
            }
          ]
        },
        {
          "id": "spec",
          "label": "Interaction spec",
          "title": "The chart, specified",
          "blocks": [
            {
              "type": "visual",
              "kind": "image",
              "illustrative": true,
              "caption": "The dashboard at its default 3-month range: summary metrics, the portfolio against its benchmark, and holdings.",
              "data": {
                "src": "assets/work/finlatics-dashboard-3m.webp",
                "alt": "Desktop portfolio dashboard with four summary cards (portfolio value ₹11,23,780, return versus benchmark +3.2%, 6 open positions and ₹1,82,000 in cash), a performance chart comparing the portfolio with its benchmark over 3 months with a tooltip on the latest point, and a holdings list.",
                "width": 1440,
                "height": 1263,
                "frame": "plain"
              }
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": true,
              "caption": "Changing the range or the sort order updates the view without moving anything else.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/finlatics-dashboard-1y.webp",
                    "alt": "The same dashboard with the 1-year range selected and the tooltip on the latest point.",
                    "label": "1-year range",
                    "width": 1440,
                    "height": 1263
                  },
                  {
                    "src": "assets/work/finlatics-dashboard-sorted.webp",
                    "alt": "Holdings sorted by performance, with the strongest position first.",
                    "label": "Sorted by performance",
                    "width": 1440,
                    "height": 1263
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "image",
              "illustrative": true,
              "caption": "Selecting a holding opens its details beside the dashboard, so the chart and the rest of the list stay in view.",
              "data": {
                "src": "assets/work/finlatics-dashboard-holding-detail.webp",
                "alt": "Dashboard with HDFC Bank selected. A side panel lists 120 shares held, an average cost of ₹1,505, a current price of ₹1,652, a market value of ₹1,98,240 and a total gain of ₹17,640 (+9.8%), with Buy more and Sell buttons.",
                "width": 1440,
                "height": 1263
              }
            },
            {
              "type": "table",
              "caption": "The kinds of behavior the spec defined, recreated for this portfolio",
              "columns": [
                "Interaction",
                "Behavior"
              ],
              "rows": [
                [
                  "Pointer",
                  "The crosshair follows the pointer and snaps to the nearest point. The tooltip sits beside it, never under the cursor."
                ],
                [
                  "Keyboard",
                  "Arrow keys step through points. Home and End jump to the first and last."
                ],
                [
                  "Touch",
                  "Press and hold to scrub. Lifting keeps the last value pinned until the next tap."
                ],
                [
                  "Live update",
                  "New points append on the right. An open tooltip stays on its point instead of jumping."
                ],
                [
                  "Stale data",
                  "If updates pause, the chart labels the latest time so learners know what they’re looking at."
                ]
              ]
            }
          ]
        },
        {
          "id": "states",
          "label": "States",
          "title": "Every state, not just the happy path",
          "blocks": [
            {
              "type": "text",
              "body": "Live data means real loading time, and every new learner starts with an empty portfolio, so both states were designed alongside the default. On phones, holding details open full-screen instead of in a side panel."
            },
            {
              "type": "visual",
              "kind": "gallery",
              "illustrative": true,
              "caption": "Loading and an empty portfolio, designed alongside the default.",
              "data": {
                "columns": 2,
                "columnsSmall": 1,
                "items": [
                  {
                    "src": "assets/work/finlatics-dashboard-loading.webp",
                    "alt": "Loading state with skeleton placeholders for the summary cards, chart and holdings.",
                    "label": "Loading",
                    "width": 1440,
                    "height": 955
                  },
                  {
                    "src": "assets/work/finlatics-dashboard-empty.webp",
                    "alt": "Empty state for a new account: ₹10,00,000 in cash, no positions yet, and a prompt to place a first demo trade.",
                    "label": "Empty portfolio",
                    "width": 1440,
                    "height": 529
                  }
                ]
              }
            },
            {
              "type": "visual",
              "kind": "image",
              "illustrative": true,
              "caption": "On phones, the summary cards, chart and holdings stack into one column.",
              "data": {
                "src": "assets/work/finlatics-dashboard-mobile.webp",
                "alt": "Mobile layout with the four summary cards stacked above the performance chart and the first three holdings.",
                "width": 390,
                "height": 1136,
                "frame": "phone",
                "maxWidth": 390
              }
            }
          ]
        },
        {
          "id": "impact",
          "label": "Impact",
          "title": "What changed",
          "blocks": [
            {
              "type": "text",
              "body": "Engineering built against a shared interaction spec instead of interpreting static mockups, and the dashboards stayed readable as data moved."
            },
            {
              "type": "text",
              "body": "**What I took forward.** For data products, the interaction model is the design. I specify behavior and states before I polish a chart."
            }
          ]
        },
        {
          "id": "behind",
          "label": "Behind the work",
          "title": "Scope, process and the questions interviewers ask",
          "blocks": [
            {
              "type": "facts",
              "items": [
                {
                  "label": "What I owned",
                  "body": "Interactive dashboards for the real-time BSE 500 portfolio simulation, with chart interaction patterns and tooltip behavior specified for engineering."
                },
                {
                  "label": "Who I worked with",
                  "body": "Two to three frontend and one to two backend engineers on the charts, data and simulation, with specs delivered through Zeplin."
                },
                {
                  "label": "When",
                  "body": "As Senior Product Designer at Vivma Software, September 2021 to August 2023."
                }
              ]
            },
            {
              "type": "steps",
              "title": "How I worked with engineering",
              "items": [
                {
                  "title": "List what a mockup can’t show",
                  "body": "Behavior, time context, states."
                },
                {
                  "title": "Agree how data arrives",
                  "body": "And what happens when it stops."
                },
                {
                  "title": "Specify inspection for every input",
                  "body": "Pointer, keyboard, touch."
                },
                {
                  "title": "Specify every state",
                  "body": "Loading, empty, paused, mobile."
                },
                {
                  "title": "Deliver it in Zeplin",
                  "body": "Annotated specs."
                }
              ]
            },
            {
              "type": "lists",
              "columns": [
                {
                  "title": "Edge cases and states",
                  "items": [
                    [
                      "A tooltip open while data refreshes stays on its point",
                      "Live update"
                    ],
                    [
                      "Paused updates show the time of the last value",
                      "Stale data"
                    ],
                    [
                      "Loading keeps the layout while data arrives",
                      "Loading"
                    ],
                    [
                      "A new learner’s empty portfolio shows cash and a first step",
                      "Empty"
                    ],
                    [
                      "On phones, inspection uses press and hold, not hover",
                      "Touch"
                    ]
                  ]
                },
                {
                  "title": "Accessibility notes",
                  "items": [
                    [
                      "Every chart point reachable by keyboard: arrows, Home, End",
                      "2.1.1"
                    ],
                    [
                      "Tooltips stay while pointed at and can be dismissed",
                      "1.4.13"
                    ],
                    [
                      "Gains and losses shown with signs and words",
                      "1.4.1"
                    ],
                    [
                      "The range control is a labeled group with a selected state",
                      "4.1.2"
                    ]
                  ]
                }
              ]
            },
            {
              "type": "measure",
              "items": [
                {
                  "label": "Reported",
                  "body": "Engineering built from a shared interaction spec instead of interpreting static mockups, and the dashboards stayed readable as data moved."
                },
                {
                  "label": "What it doesn’t show",
                  "body": "Learning or investing skill. Using a chart more doesn’t mean understanding the market better."
                },
                {
                  "label": "What I’d track",
                  "body": "Chart points inspected, range changes and holdings opened, and whether learners can say how they’re doing against the benchmark."
                }
              ]
            },
            {
              "type": "faq",
              "title": "Questions interviewers ask",
              "items": [
                {
                  "q": "What was hard about real-time charts?",
                  "a": "Keeping them readable while values change. A tooltip that jumps, a crosshair that lags or an axis that rescales breaks a learner’s read."
                },
                {
                  "q": "How did you work with engineering?",
                  "a": "On what the static design couldn’t show: chart behavior, time context, responsive states and tooltip behavior, delivered as annotated Zeplin specs."
                },
                {
                  "q": "How does it work without a mouse?",
                  "a": "On a keyboard, arrows step through points and Home and End jump to the ends. On touch, press and hold to scrub, and lifting keeps the value pinned."
                },
                {
                  "q": "What happens when data stops updating?",
                  "a": "The chart says so and shows the time of the last update, so learners never mistake old values for live ones."
                },
                {
                  "q": "Why specify behavior before visuals?",
                  "a": "For data products, the interaction model is the design. If behavior isn’t specified, engineering has to guess it."
                },
                {
                  "q": "What did you learn?",
                  "a": "I specify behavior and states before I polish a chart."
                }
              ]
            },
            {
              "type": "text",
              "body": "Recreated with fictional holdings and prices. Team sizes are approximate; engineering details such as the charting library aren’t shown here."
            }
          ]
        }
      ],
      "glance": [
        {
          "body": "Live charts that jump and rescale are hard to read while you’re learning."
        },
        {
          "body": "Specified interaction, tooltip and state behavior with engineering, before visuals."
        },
        {
          "body": "Engineering built from a shared interaction spec, not static mockups."
        }
      ],
      "hero": {
        "kind": "image",
        "data": {
          "src": "assets/work/finlatics-dashboard-3m.webp",
          "alt": "Desktop portfolio dashboard with four summary cards (portfolio value ₹11,23,780, return versus benchmark +3.2%, 6 open positions and ₹1,82,000 in cash), a performance chart comparing the portfolio with its benchmark over 3 months with a tooltip on the latest point, and a holdings list.",
          "width": 1440,
          "height": 1263
        },
        "caption": "The default dashboard, recreated with fictional BSE 500 holdings."
      }
    },

    {
      "slug": "finlatics-design-system",
      "group": "vivma",
      "title": "A 60-component design system for a team moving fast",
      "teaser": "A Figma component library for web and mobile-responsive views that cut new designers’ ramp-up time by 40%.",
      "tags": [
        "Design systems",
        "Figma",
        "Team enablement"
      ],
      "cover": "system",
      "summary": "Without shared components, new designers rebuilt patterns and the product drifted. I built and maintained a Figma library of 60+ components for web and mobile-responsive views, cutting designer ramp-up time by 40%.",
      "meta": [
        {
          "label": "Role",
          "value": "Senior Product Designer, system owner"
        },
        {
          "label": "Period",
          "value": "Sep 2021 – Aug 2023"
        },
        {
          "label": "Scope",
          "value": "60+ components for web and mobile-responsive views"
        },
        {
          "label": "Tools",
          "value": "Figma, Zeplin"
        }
      ],
      "outcomes": [
        {
          "value": "60+",
          "label": "components, built and maintained"
        },
        {
          "value": "−40%",
          "label": "ramp-up time for new designers"
        }
      ],
      "sections": [
        {
          "id": "problem",
          "label": "Problem",
          "title": "Every new designer started from zero",
          "blocks": [
            {
              "type": "text",
              "body": "Each designer rebuilt buttons, inputs, cards and chart containers their own way. Small differences made the product inconsistent, and newcomers learned patterns from old files."
            }
          ]
        },
        {
          "id": "approach",
          "label": "Approach",
          "title": "Building the system in layers",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "Audit",
                  "body": "Inventory existing patterns and the variations that had crept in."
                },
                {
                  "title": "Foundations",
                  "body": "Color, type, spacing and elevation as named tokens."
                },
                {
                  "title": "Core components",
                  "body": "Buttons, inputs, selects, navigation and feedback, with every state designed."
                },
                {
                  "title": "Product patterns",
                  "body": "Data cards, chart containers and learning layouts built from the core."
                },
                {
                  "title": "Document and maintain",
                  "body": "Usage rules per component, updated as the product changed."
                }
              ]
            }
          ]
        },
        {
          "id": "foundations",
          "label": "Foundations",
          "title": "Foundations everything is built from",
          "blocks": [
            {
              "type": "text",
              "body": "Color, type, spacing and radius are named tokens, and each color’s contrast is measured before it enters a component."
            },
            {
              "type": "text",
              "body": "The sheets below are a recreation from the Finlatics screens, not the original library."
            },
            {
              "type": "visual",
              "kind": "system",
              "illustrative": true,
              "caption": "Foundations, with each color’s contrast measured against WCAG 2.1 AA. Colors are taken from the Finlatics screens.",
              "data": {
                "section": "foundations"
              }
            }
          ]
        },
        {
          "id": "components",
          "label": "Components",
          "title": "Core components, with every state",
          "blocks": [
            {
              "type": "text",
              "body": "Each component ships with its states, responsive behavior and tokens, so designers can trust it."
            },
            {
              "type": "visual",
              "kind": "system",
              "illustrative": true,
              "caption": "Core components in every state, with the accessibility checks they pass.",
              "data": {
                "section": "components"
              }
            }
          ]
        },
        {
          "id": "patterns",
          "label": "Patterns",
          "title": "Product patterns built from the core",
          "blocks": [
            {
              "type": "text",
              "body": "Simulator and course patterns are built from the core components, keeping the dashboard and learning pages consistent."
            },
            {
              "type": "visual",
              "kind": "system",
              "illustrative": true,
              "caption": "Product patterns assembled from the core: metric cards, chart controls, holdings, lessons, and loading and empty states.",
              "data": {
                "section": "patterns"
              }
            }
          ]
        },
        {
          "id": "impact",
          "label": "Impact",
          "title": "What changed",
          "blocks": [
            {
              "type": "text",
              "body": "New designers ramped up ==40% faster==, working from 60+ maintained components instead of old files. The same library carried the onboarding redesign and the dashboards."
            },
            {
              "type": "text",
              "body": "**What I took forward.** A design system is an onboarding tool as much as a consistency tool. It shapes my enterprise standards work today."
            }
          ]
        },
        {
          "id": "behind",
          "label": "Behind the work",
          "title": "Scope, process and the questions interviewers ask",
          "blocks": [
            {
              "type": "facts",
              "items": [
                {
                  "label": "What I owned",
                  "body": "Built and maintained the Finlatics component library in Figma: 60+ components for web and mobile-responsive views, with tokens, states and usage rules."
                },
                {
                  "label": "Who I worked with",
                  "body": "The designers who used it and the engineers who built from it, with specs delivered through Zeplin."
                },
                {
                  "label": "When",
                  "body": "As Senior Product Designer at Vivma Software, September 2021 to August 2023."
                }
              ]
            },
            {
              "type": "steps",
              "title": "How a component gets into the library",
              "items": [
                {
                  "title": "Check before adding",
                  "body": "An existing variant may cover it."
                },
                {
                  "title": "Build from tokens",
                  "body": "Color, type, spacing, radius."
                },
                {
                  "title": "Design every state",
                  "body": "Default, hover, focus, error, disabled."
                },
                {
                  "title": "Document usage",
                  "body": "When to use it, and when not."
                },
                {
                  "title": "Maintain it",
                  "body": "Updated as the product changed."
                }
              ]
            },
            {
              "type": "lists",
              "columns": [
                {
                  "title": "States the library covers",
                  "items": [
                    [
                      "Buttons in default, hover, focus and disabled",
                      "Button"
                    ],
                    [
                      "Inputs in default, focus, filled and error",
                      "Text input"
                    ],
                    [
                      "The selected card marked with a check, not color alone",
                      "Selection card"
                    ],
                    [
                      "Loading skeletons and empty states included",
                      "Patterns"
                    ],
                    [
                      "Responsive variants for web and mobile",
                      "All"
                    ]
                  ]
                },
                {
                  "title": "Accessibility notes",
                  "items": [
                    [
                      "Brand green 5.35:1, body 17.87:1, secondary 5.63:1 on white",
                      "1.4.3"
                    ],
                    [
                      "One focus ring style for every interactive component",
                      "2.4.7"
                    ],
                    [
                      "Inputs keep visible labels; errors in text",
                      "3.3.2"
                    ],
                    [
                      "Status marks pair an icon and words with color",
                      "1.4.1"
                    ]
                  ]
                }
              ]
            },
            {
              "type": "measure",
              "items": [
                {
                  "label": "Reported",
                  "body": "New designers ramped up 40% faster, working from 60+ maintained components. The same library carried the onboarding redesign and the dashboards."
                },
                {
                  "label": "What it doesn’t show",
                  "body": "Component count isn’t success on its own. What matters is how much faster designers ship with it, and how consistent the product stays."
                },
                {
                  "label": "How it was measured",
                  "body": "By comparing how long new designers took to reach the same productivity milestone, before and after the shared library. Exact figures are confidential."
                }
              ]
            },
            {
              "type": "faq",
              "title": "Questions interviewers ask",
              "items": [
                {
                  "q": "Why build a design system at a small company?",
                  "a": "Every designer was rebuilding the same patterns and the product drifted. Shared components fixed both, and made new designers productive faster."
                },
                {
                  "q": "How did you decide what goes in?",
                  "a": "Check what exists first, build from tokens, and add a component only when a pattern repeats. One-offs stay local to the screen."
                },
                {
                  "q": "How do you keep it from going stale?",
                  "a": "Usage rules for every component, updated as the product changed."
                },
                {
                  "q": "What changed for new designers?",
                  "a": "They worked from 60+ maintained components instead of learning patterns from old files, and ramped up 40% faster."
                },
                {
                  "q": "How was the 40% measured?",
                  "a": "By comparing how long new designers took to reach the same productivity milestone, before and after the shared library. Exact figures are confidential."
                },
                {
                  "q": "What did you learn?",
                  "a": "A design system is an onboarding tool as much as a consistency tool. It shapes my enterprise standards work today."
                }
              ]
            },
            {
              "type": "text",
              "body": "This file recreates a representative slice of the original library. Exact figures are confidential."
            }
          ]
        }
      ],
      "glance": [
        {
          "body": "Every designer rebuilt patterns their own way, and the product drifted."
        },
        {
          "body": "A 60+ component Figma library: tokens, every state, product patterns."
        },
        {
          "body": "New designers ramped up 40% faster."
        }
      ],
      "hero": {
        "kind": "system",
        "data": {
          "section": "components"
        },
        "caption": "Core components, drawn live from the library’s tokens."
      }
    },

    /* ---------- Adons Softech ---------- */
    {
      "slug": "b2b-saas-navigation",
      "group": "adons",
      "title": "Halving navigation depth in a B2B SaaS product",
      "teaser": "Journey maps and a restructured sitemap that brought core workflows from 4 clicks to 2 and lifted task completion by 31%.",
      "tags": [
        "Information architecture",
        "Journey mapping",
        "Usability testing"
      ],
      "cover": "tree",
      "summary": "A B2B SaaS client’s core workflows were buried four levels deep. Journey maps and IA sitemaps restructured the product around its key tasks: 4 clicks down to 2, and task completion up 31% in usability testing.",
      "meta": [
        {
          "label": "Role",
          "value": "UI/UX Designer"
        },
        {
          "label": "Period",
          "value": "May 2019 – Aug 2021"
        },
        {
          "label": "Client",
          "value": "Early-stage B2B SaaS company"
        },
        {
          "label": "Methods",
          "value": "Journey mapping, IA sitemaps, usability testing"
        },
        {
          "label": "Tools",
          "value": "Sketch, InVision"
        }
      ],
      "outcomes": [
        {
          "value": "4 → 2",
          "label": "clicks to reach core workflows"
        },
        {
          "value": "+31%",
          "label": "task completion in usability testing"
        }
      ],
      "sections": [
        {
          "id": "context",
          "label": "Context",
          "title": "Studio work for early-stage startups",
          "blocks": [
            {
              "type": "text",
              "body": "At Adons Softech I designed responsive products for six early-stage e-commerce and SaaS startups, from wireframes and prototypes to dev-ready assets. This client’s features had outgrown its navigation."
            }
          ]
        },
        {
          "id": "problem",
          "label": "Problem",
          "title": "The most important things were the hardest to reach",
          "blocks": [
            {
              "type": "text",
              "body": "Users had to remember where things lived several levels down, and every extra level was another chance to take a wrong turn."
            }
          ]
        },
        {
          "id": "approach",
          "label": "Approach",
          "title": "Map the journeys, then the structure",
          "blocks": [
            {
              "type": "steps",
              "items": [
                {
                  "title": "Map core journeys",
                  "body": "How users actually moved to finish their key tasks."
                },
                {
                  "title": "Sitemap the current IA",
                  "body": "Every level laid out, to find where core tasks were buried."
                },
                {
                  "title": "Restructure around tasks",
                  "body": "Core workflows in the top two levels; the rest grouped by goal."
                },
                {
                  "title": "Prototype",
                  "body": "The new navigation, built in Sketch and InVision."
                },
                {
                  "title": "Test",
                  "body": "Usability tests on core tasks with the new structure."
                }
              ]
            },
            {
              "type": "visual",
              "kind": "tree",
              "caption": "The same core task before and after the restructure. Labels are illustrative.",
              "data": {
                "before": {
                  "title": "Before",
                  "path": [
                    "Dashboard",
                    "Workspace",
                    "Settings",
                    "Data",
                    "Export report"
                  ]
                },
                "after": {
                  "title": "After",
                  "path": [
                    "Dashboard",
                    "Reports",
                    "Export report"
                  ]
                }
              }
            }
          ]
        },
        {
          "id": "impact",
          "label": "Impact",
          "title": "What changed",
          "blocks": [
            {
              "type": "text",
              "body": "Core workflows went from ==4 clicks to 2==, and task completion improved by ==31%== in usability testing."
            },
            {
              "type": "text",
              "body": "**Alongside this work.** Brand identities and icon sets for three clients, each with a full style guide: typography, color systems, spacing tokens and component rules."
            },
            {
              "type": "text",
              "body": "**What I took forward.** The best navigation is the kind users don’t have to think about. I start IA work with journeys, not menus."
            }
          ]
        }
      ],
      "glance": [
        {
          "body": "Core workflows were buried four levels deep."
        },
        {
          "body": "Mapped journeys and sitemaps, restructured around tasks, then prototyped and tested."
        },
        {
          "body": "4 clicks to 2, and task completion up 31% in usability testing."
        }
      ]
    }
  ]
};
