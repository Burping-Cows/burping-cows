import { useEffect, useState } from "react";
import Icon from "./components/Icon";
import {
  AssessmentLink,
  Brand,
  Info,
  ReadinessRing,
  SectionHeading,
} from "./components/ui";
import {
  ACCU_SCHEME_URL,
  COP31_SOURCE_URL,
  REPOSITORY_URL,
  SETUP_GUIDE_URL,
  SOURCE_DOWNLOAD_URL,
  DEMO,
  formatNumber,
  formatMoney,
} from "./config";

const navigation = [
  ["How it works", "#how-it-works"],
  ["Why ACCUs?", "#accus"],
  ["The opportunity", "#opportunity"],
  ["About", "#about"],
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Brand />
        <nav
          className={open ? "navigation open" : "navigation"}
          id="navigation"
          aria-label="Main navigation"
        >
          {navigation.map(([label, href]) => (
            <a href={href} key={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <AssessmentLink className="nav-cta">Get the app</AssessmentLink>
        <button
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="audience-line">
          <Icon name="sprout" /> For Australian dairy &amp; piggery farmers
        </p>
        <h1 id="hero-title">
          The less
          <br />
          your cow burps,
          <br />
          <span>the better your income.</span>
        </h1>
        <p className="hero-intro">
          Could your farm’s methane become a new opportunity?
        </p>
        <p>
          Australian dairy and piggery farmers may be able to turn methane
          reductions into carbon credits. Understanding whether a project is
          suitable, worthwhile and ready can be complicated.
        </p>
        <p className="hero-last">
          Burping Cows makes that first decision easier.
        </p>
        <div className="hero-actions">
          <AssessmentLink>Try Burping Cows</AssessmentLink>
          <a className="button button-secondary" href="#accus">
            How ACCUs work
          </a>
        </div>
        <p className="micro trust-line">
          <Icon name="shield" /> Indicative pre-feasibility only — not an
          official ACCU assessment.
        </p>
      </div>
      <div className="hero-visual">
        <div className="farm-frame">
          <div className="farm-caption">
            <span className="landscape-caption">
              A little less methane.
              <br />A clearer way forward.
            </span>
          </div>
          <img
            src="/farm.svg"
            className="farm-art"
            alt="The app’s illustration of rolling green hills, a dairy barn and farm infrastructure"
            width="600"
            height="280"
          />
          <div className="farm-path">
            <span>
              <Icon name="farm" />
              Your farm
            </span>
            <Icon name="chevron" />
            <span>
              <Icon name="leaf" />
              Less methane
            </span>
            <Icon name="chevron" />
            <span>
              <Icon name="coin" />
              Potential value
            </span>
          </div>
        </div>
        <div className="hero-result">
          <div className="result-top">
            <span className="icon-box">
              <Icon name="chart" />
            </span>
            <div>
              <strong>Your next opportunity</strong>
              <span>Demo · Green Valley Dairy</span>
            </div>
            <span className="demo-tag">DEMO</span>
          </div>
          <div className="hero-result-grid">
            <div>
              <span>Net abatement</span>
              <strong>
                {formatNumber(DEMO.abatement, 2)} <small>tCO₂-e / yr</small>
              </strong>
            </div>
            <div>
              <span>Potential gross value</span>
              <strong>
                ~A$38.4k <small>/ yr</small>
              </strong>
            </div>
          </div>
          <div className="result-bottom">
            <span>
              <Icon name="check" /> Potentially worth investigating
            </span>
            <a href="#demo">Explore example</a>
          </div>
        </div>
        <span className="visual-footnote">
          Illustrative values. A starting point, not a promise.
        </span>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="problem section" aria-label="The problem">
      <div className="container">
        <div className="problem-heading">
          <SectionHeading title="The opportunity exists. The pathway is the hard part." />
          <p>
            Methane-reduction technologies already exist. Eligible projects can
            earn Australian carbon credits. But before investing in equipment,
            audits and advice, you need to know if it’s worth a closer look.
          </p>
        </div>
        <div className="problem-grid">
          {[
            {
              icon: "rules" as const,
              title: "Complex rules",
              text: "Eligibility and methodology requirements can be difficult to navigate.",
            },
            {
              icon: "clock" as const,
              title: "Upfront commitment",
              text: "Equipment, monitoring, compliance and professional advice take time and money.",
            },
            {
              icon: "coin" as const,
              title: "Uncertain opportunity",
              text: "The potential carbon value is often unclear before resources are committed.",
            },
          ].map((item) => (
            <article className="problem-card" key={item.title}>
              <span className="icon-box">
                <Icon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <p className="problem-close">
          <Icon name="sprout" /> Burping Cows helps close that information gap.
        </p>
      </div>
    </section>
  );
}

function AccuExplainer() {
  return (
    <section
      className="section accu-section"
      id="accus"
      aria-label="What is an ACCU?"
    >
      <div className="container">
        <div className="two-column accu-intro">
          <SectionHeading title="What is an ACCU?">
            An Australian Carbon Credit Unit. Eligible projects can earn them,
            and they can have financial value in Australia’s carbon market.
          </SectionHeading>
          <div className="accu-equation">
            <div>
              <span className="equation-number">1</span>
              <span>ACCU</span>
            </div>
            <span className="equation-equals">=</span>
            <div>
              <span className="equation-number">1</span>
              <span>
                tonne of eligible CO₂-e
                <br />
                avoided or removed
              </span>
            </div>
            <span className="equation-caption">
              A unit of climate impact. A potential source of value.
            </span>
          </div>
        </div>
        <ol className="abatement-flow">
          {[
            ["leaf", "Reduce methane", "Capture and treat manure methane."],
            [
              "chart",
              "Calculate eligible CO₂-e",
              "Express the reduction in comparable units.",
            ],
            [
              "shield",
              "Potential ACCUs",
              "Subject to method and scheme requirements.",
            ],
            [
              "coin",
              "Potential carbon value",
              "Credits may be sold in the carbon market.",
            ],
          ].map(([icon, title, text], i) => (
            <li key={title}>
              <span className="flow-icon">
                <Icon name={icon as "leaf" | "chart" | "shield" | "coin"} />
              </span>
              <span className="flow-step">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="guidance-note">
          <Icon name="shield" />
          <p>
            Actual ACCUs are only issued to registered projects that satisfy
            applicable Clean Energy Regulator requirements. An estimate from
            Burping Cows does not automatically become a credit.{" "}
            <a href={ACCU_SCHEME_URL} target="_blank" rel="noreferrer">
              Read the official ACCU Scheme guidance
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function MarketExamples() {
  return (
    <section
      className="section market-section"
      id="market"
      aria-labelledby="market-title"
    >
      <div className="container">
        <div className="market-heading">
          <h2 id="market-title">Carbon credits already have buyers.</h2>
          <p>
            Public examples show that eligible projects can reach real buyers.
            The first question is what could work on your farm.
          </p>
        </div>
        <div className="market-examples">
          <article className="market-example">
            <div>
              <h3>Piggery methane, turned into credits</h3>
              <p className="market-method">
                Rivalea Corowa Module 5 · Animal effluent
              </p>
            </div>
            <div>
              <p>
                This registered project captures and combusts methane from
                piggery manure. The regulator records 97,000 tonnes of abatement
                sold to the Commonwealth under a completed contract.
              </p>
              <a
                href="https://cer.gov.au/schemes/australian-carbon-credit-unit-scheme/accu-project-and-contract-register/project/EOP100553"
                target="_blank"
                rel="noreferrer"
              >
                View the CER project record <Icon name="arrow" />
              </a>
            </div>
            <p className="market-meaning">
              A real manure-methane project with recorded carbon sales. This is
              a contract total, not an annual farm estimate.
            </p>
          </article>
          <article className="market-example">
            <div>
              <h3>A corporate buyer planning ahead</h3>
              <p className="market-method">
                Meldora → Rio Tinto · Environmental plantings
              </p>
            </div>
            <div>
              <p>
                Rio Tinto announced a long-term agreement to buy part of the
                ACCUs expected from Meldora’s environmental planting projects.
                The announcement does not disclose a unit price or purchase
                volume.
              </p>
              <a
                href="https://www.riotinto.com/en/news/trending-topics/investment-in-high-integrity-accus"
                target="_blank"
                rel="noreferrer"
              >
                Read Rio Tinto’s announcement <Icon name="arrow" />
              </a>
            </div>
            <p className="market-meaning">
              Long-term purchase agreements are one route to market. This
              example uses a different method from manure methane.
            </p>
          </article>
          <article className="market-example">
            <div>
              <h3>A purchase with benefits beyond carbon</h3>
              <p className="market-method">
                Tiwi Island → NSW NRC · Savanna burning
              </p>
            </div>
            <div>
              <p>
                The NSW Natural Resources Commission reported purchasing 98
                Aboriginal-generated ACCUs from the Tiwi Island Savanna Burning
                project, with environmental, social and cultural co-benefits.
              </p>
              <a
                href="https://www.nsw.gov.au/departments-and-agencies/natural-resources-commission/aboriginal-nrm/carbon-credit-units"
                target="_blank"
                rel="noreferrer"
              >
                Read the NSW purchase record <Icon name="arrow" />
              </a>
            </div>
            <p className="market-meaning">
              Buyers can value a project’s wider benefits. Its method and
              economics differ from a dairy or piggery project.
            </p>
          </article>
        </div>
        <div className="market-close">
          <div>
            <h3>Real demand. A decision that starts with your farm.</h3>
            <p>
              Burping Cows helps you explore your methane opportunity, costs and
              preparation before approaching a project developer or buyer.
            </p>
          </div>
          <AssessmentLink>Try it for my farm</AssessmentLink>
        </div>
        <p className="market-note">
          Independent market examples, not Burping Cows customers or
          endorsements. They do not establish your farm’s eligibility, sale
          price or returns. Burping Cows does not arrange credit sales. Sources
          checked 3 October 2026.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    [
      "Tell us about your farm",
      "Dairy or piggery, animal numbers, state and your current manure system.",
      "farm",
    ],
    [
      "Describe your project",
      "Describe your capture-and-flare project and its technical inputs. Other routes need specialist assessment.",
      "leaf",
    ],
    [
      "We assess the opportunity",
      "Route screening, net abatement, an indicative ACCU equivalent, preparation progress and a financial scenario.",
      "chart",
    ],
    [
      "Know what to do next",
      "See what looks promising, what you already have, what’s missing and your next steps.",
      "clipboard",
    ],
  ];
  return (
    <section
      className="section how-section"
      id="how-it-works"
      aria-label="How Burping Cows works"
    >
      <div className="container">
        <SectionHeading
          center
          title="From farm information to a clearer decision"
        >
          You know your farm. We help you make sense of the opportunity.
        </SectionHeading>
        <ol className="how-grid">
          {steps.map(([title, text, icon], i) => (
            <li key={title}>
              <div className="step-top">
                <span className="step-number">0{i + 1}</span>
                <Icon name={icon as "farm" | "leaf" | "chart" | "clipboard"} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExampleAssessment() {
  return (
    <section
      className="section demo-section"
      id="demo"
      aria-label="Example assessment"
    >
      <div className="container two-column demo-layout">
        <div className="demo-copy">
          <SectionHeading title="See the opportunity before committing to it.">
            Is a methane-reduction project on your farm worth investigating?
            Start with a useful first picture of the potential.
          </SectionHeading>
          <ul className="benefit-list">
            <li>
              <Icon name="check" />
              Understand the indicative carbon opportunity
            </li>
            <li>
              <Icon name="check" />
              Find the gaps in your project preparation
            </li>
            <li>
              <Icon name="check" />
              Take a more informed next step
            </li>
          </ul>
          <div className="demo-context">
            <span className="pill">Illustrative demo</span>
            <p>
              This is an example, not your farm’s assessment. All figures shown
              are demonstration values.
            </p>
          </div>
        </div>
        <article className="assessment-card">
          <div className="assessment-header">
            <div className="assessment-brand">
              <img src="/app-logo.png" alt="" width="33" height="33" />
              <span>
                Burping Cows<span>YOUR FARM OPPORTUNITY</span>
              </span>
            </div>
            <span className="demo-tag">DEMO VALUES</span>
          </div>
          <div className="assessment-farm">
            <span className="icon-box">
              <Icon name="farm" />
            </span>
            <div>
              <h3>{DEMO.farm}</h3>
              <p>500 dairy animals · NSW · Enclosed flare</p>
            </div>
          </div>
          <div className="eligibility-status">
            <Icon name="check" />
            <span>
              {DEMO.eligibility}{" "}
              <small>Preliminary route screening · subject to review</small>
            </span>
          </div>
          <dl className="assessment-metrics">
            <div>
              <dt>Net abatement</dt>
              <dd>
                {formatNumber(DEMO.abatement, 2)} <span>tCO₂-e / year</span>
              </dd>
            </div>
            <div>
              <dt>
                Indicative ACCU equivalent{" "}
                <Info label="indicative ACCU equivalent">
                  An Australian Carbon Credit Unit represents one tonne of
                  eligible CO₂-equivalent emissions reduction or removal.
                  Estimated reductions are not automatically issued as ACCUs.
                </Info>
              </dt>
              <dd>
                ~{formatNumber(DEMO.potentialAccus)} <span>/ year</span>
              </dd>
            </div>
            <div className="gross-value">
              <dt>Estimated gross carbon value</dt>
              <dd>
                {formatMoney(DEMO.grossValue)} <span>/ year</span>
              </dd>
              <small>
                At A${DEMO.price} / ACCU · demo assumption · before costs
              </small>
            </div>
          </dl>
          <div className="assessment-preparation">
            <ReadinessRing small />
            <div>
              <strong>
                Preparation progress{" "}
                <Info label="preparation progress">
                  Progress through the app’s evidence and implementation tasks.
                  It is not legal eligibility or regulatory certification.
                </Info>
              </strong>
              <p>{DEMO.preparation}</p>
              <span className="burden">
                Calculation <b>{DEMO.calculation}</b>
              </span>
            </div>
          </div>
          <dl className="preparation-phases">
            {DEMO.phases.map((phase) => (
              <div key={phase.label}>
                <dt>{phase.label}</dt>
                <dd>
                  {phase.complete} / {phase.total}
                  <span>{phase.progress}%</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="recommendation">
            <Icon name="sprout" />
            <div>
              <span>FINANCIAL SCENARIO</span>
              <strong>{DEMO.viability}</strong>
            </div>
          </div>
          <p className="assessment-note">
            Example only · projected inputs, not verified abatement. Planning
            equivalent, not credits you will receive. Actual results depend on
            farm data, applicable methodology, project design, verification and
            market conditions.
          </p>
        </article>
      </div>
    </section>
  );
}

function FinancialOpportunity() {
  const [price, setPrice] = useState(DEMO.price);
  const gross = formatMoney(DEMO.abatement * price);
  return (
    <section
      className="section financial-section"
      id="opportunity"
      aria-label="Financial opportunity"
    >
      <div className="container">
        <SectionHeading
          center
          title="Understand the opportunity before spending the money"
        >
          Potential carbon value is one part of the picture. What it takes to
          get there matters just as much.
        </SectionHeading>
        <div className="financial-grid">
          <div className="value-card">
            <div className="card-label">
              <Icon name="coin" />
              <h3>Potential value</h3>
              <span className="demo-tag">DEMO</span>
            </div>
            <p className="formula-label">
              Annual ACCU equivalent × price assumption
            </p>
            <div className="value-formula">
              <span>{formatNumber(DEMO.abatement, 2)}</span>
              <span className="operator">×</span>
              <span>A${price}</span>
            </div>
            <div className="price-control">
              <label htmlFor="accu-price">Explore a price assumption</label>
              <output htmlFor="accu-price">A${price} / ACCU</output>
              <input
                id="accu-price"
                type="range"
                min="10"
                max="70"
                step="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                aria-valuetext={`A${price} per ACCU, illustrative assumption`}
              />
              <div className="price-range">
                <span>A$10</span>
                <span>A$70</span>
              </div>
            </div>
            <div className="value-total">
              <span>Indicative gross carbon value</span>
              <strong aria-live="polite" aria-atomic="true">
                {gross}
                <small> / year</small>
              </strong>
              <p>
                Before costs. An indicative scenario, not a market price or
                profit forecast.
              </p>
            </div>
          </div>
          <div className="cost-card">
            <div className="card-label">
              <Icon name="clipboard" />
              <h3>What it may take to get there</h3>
            </div>
            <ul>
              {[
                "Equipment and implementation",
                "Monitoring and operating costs",
                "Reporting and record keeping",
                "Verification and compliance",
                "Professional and technical advice",
              ].map((text) => (
                <li key={text}>
                  <span className="cost-mark" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <p>
              These costs vary by farm and project. Gross carbon value is not
              profit, and eligibility is not a guarantee of returns.
            </p>
          </div>
        </div>
        <div className="financial-takeaway">
          <Icon name="leaf" />
          <p>
            A project can reduce methane and still not be economically
            attractive. Burping Cows helps you investigate that before making a
            major commitment.
          </p>
        </div>
      </div>
    </section>
  );
}

function ReadinessSection() {
  const checklist = [
    [true, "Confirm the waste pathway"],
    [true, "Identify site control"],
    [true, "Confirm project commencement timeline"],
    [false, "Prepare methane-flow monitoring"],
    [false, "Prepare gas-concentration measurement"],
    [false, "Prepare QA / monitoring plan"],
  ] as const;
  return (
    <section
      className="section readiness-section"
      aria-label="Implementation readiness"
    >
      <div className="container two-column readiness-layout">
        <div>
          <SectionHeading title="Eligibility is only part of the story.">
            A potentially suitable project may still have a few gaps to close.
            Readiness helps you see what’s in place — and what needs attention.
          </SectionHeading>
          <div className="readiness-summary">
            <ReadinessRing />
            <div>
              <span className="demo-tag">DEMO PREPARATION</span>
              <h3>
                Evidence needed.
                <br />A practical next step.
              </h3>
              <p>
                Preparation progress is decision support,
                <br />
                not regulatory certification.
              </p>
            </div>
          </div>
        </div>
        <div className="checklist-card">
          <div className="card-label">
            <Icon name="clipboard" />
            <h3>Your preparation checklist</h3>
          </div>
          <ul>
            {checklist.map(([complete, text]) => (
              <li
                key={text}
                className={complete ? "complete" : "needs-attention"}
              >
                <span className="checklist-icon">
                  <Icon name={complete ? "check" : "warning"} />
                </span>
                <span>
                  {text}
                  <small>{complete ? "In place" : "To prepare"}</small>
                </span>
              </li>
            ))}
          </ul>
          <p className="checklist-note">
            Selected tasks from this demo assessment. Your farm’s evidence
            requirements may differ.
          </p>
        </div>
      </div>
    </section>
  );
}

function AccuJourney() {
  const stages = [
    "Explore opportunity",
    "Check indicative eligibility",
    "Technical feasibility & project design",
    "ACCU project registration",
    "Implement + monitor",
    "Report + audit where required",
    "ACCU issuance",
  ];
  return (
    <section className="section journey-section" aria-label="The ACCU journey">
      <div className="container">
        <div className="journey-heading">
          <SectionHeading title="What happens after Burping Cows?" />
          <p>We help with the first decision — not the final certification.</p>
        </div>
        <ol className="journey">
          {stages.map((title, i) => (
            <li key={title} className={i < 2 ? "our-stage" : ""}>
              <span className="journey-number">{i + 1}</span>
              <h3>{title}</h3>
              {i === 0 && <span className="journey-badge">BURPING COWS</span>}
              {i === 1 && <span className="journey-badge">BURPING COWS</span>}
            </li>
          ))}
        </ol>
        <p className="journey-note">
          Later stages require the applicable method, technical advisers and
          Clean Energy Regulator processes. Burping Cows does not register
          projects or issue ACCUs.
        </p>
      </div>
    </section>
  );
}

function ClimateImpact() {
  return (
    <section
      className="section climate-section"
      id="about"
      aria-label="About Burping Cows"
    >
      <div className="container">
        <SectionHeading
          center
          title="More viable projects. Less uncertainty. Less methane."
        >
          Built for Australian dairy and piggery farmers who want a clearer path
          from possibility to action.
        </SectionHeading>
        <div className="impact-grid">
          {[
            [
              "rules",
              "Reduce uncertainty",
              "Translate complex requirements into understandable decisions.",
            ],
            [
              "shield",
              "Avoid wasted investment",
              "Identify obvious issues before major commitments are made.",
            ],
            [
              "sprout",
              "Accelerate methane action",
              "Help promising projects move toward implementation.",
            ],
          ].map(([icon, title, text]) => (
            <article key={title}>
              <span className="impact-icon">
                <Icon name={icon as "rules" | "shield" | "sprout"} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="cop-note">
          <span className="cop-badge">CLIMATE HACK-TION 2026</span>
          <p>
            Burping Cows supports the{" "}
            <a href={COP31_SOURCE_URL} target="_blank" rel="noreferrer">
              COP31 Zero Waste & Methane Reduction
            </a>{" "}
            priority by making methane-reduction opportunities easier to
            understand and act on.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      className="section get-app-section"
      id="get-app"
      aria-labelledby="get-app-title"
    >
      <div className="container two-column get-app-layout">
        <div>
          <h2 id="get-app-title">
            Get Burping Cows.
            <br />
            Put your farm in the picture.
          </h2>
          <p className="get-app-intro">
            The working demo app is available on GitHub. Download the source and
            run it in your browser on a computer to explore your own farm’s
            opportunity.
          </p>
          <div className="hero-actions">
            <a
              className="button"
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
            >
              View app on GitHub <Icon name="arrow" />
            </a>
            <a className="button button-secondary" href={SOURCE_DOWNLOAD_URL}>
              Download source
            </a>
          </div>
          <p className="get-app-note">
            This release runs locally and requires a computer for setup. Local
            demo mode works without a Supabase account; assessments are saved on
            your device.
          </p>
          <a
            className="setup-link"
            href={SETUP_GUIDE_URL}
            target="_blank"
            rel="noreferrer"
          >
            Read the full setup guide <Icon name="arrow" />
          </a>
        </div>
        <ol className="install-steps">
          <li>
            <h3>Get the project</h3>
            <p>
              Download and unzip the source. Install Node.js 22.13 or newer,
              then open a terminal in the project folder.
            </p>
          </li>
          <li>
            <h3>Install and launch</h3>
            <p>
              Run these commands to install the dependencies and start the
              assessment app in your browser.
            </p>
            <pre aria-label="Commands to run the assessment app">
              <code>{"npm install\nnpm run web"}</code>
            </pre>
          </li>
          <li>
            <h3>Explore your farm</h3>
            <p>
              Choose <strong>Use demo farm</strong> for a worked example, or
              enter your farm and project information to create your own
              assessment.
            </p>
          </li>
        </ol>
      </div>
      <div className="container mobile-setup-note">
        <Icon name="clipboard" />
        <p>
          <strong>Developing for iOS or Android?</strong> The repository
          includes the Expo app and platform launch commands. Follow the setup
          guide for your development environment.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Brand />
          <nav aria-label="Footer navigation">
            <AssessmentLink secondary>Get the app</AssessmentLink>
            <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="#how-it-works">How it works</a>
            <a href={ACCU_SCHEME_URL} target="_blank" rel="noreferrer">
              ACCU Scheme
            </a>
            <a href="#about">About</a>
          </nav>
        </div>
        <div className="disclaimer">
          <strong>Disclaimer</strong>
          <p>
            Burping Cows provides indicative pre-feasibility information only.
            It does not determine official ACCU eligibility, guarantee ACCU
            issuance or income, or replace Clean Energy Regulator guidance,
            registered auditors, carbon project developers, legal advisers or
            financial advisers.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Burping Cows</span>
          <span>Built for Climate Hack-tion 2026.</span>
          <span>Less methane. More possibility.</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    // Resolve direct section links after React has mounted the page content.
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView({ behavior: "instant" });
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <Navbar />
      <main id="main">
        <Hero />
        <ProblemSection />
        <AccuExplainer />
        <MarketExamples />
        <HowItWorks />
        <ExampleAssessment />
        <FinancialOpportunity />
        <ReadinessSection />
        <AccuJourney />
        <ClimateImpact />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
