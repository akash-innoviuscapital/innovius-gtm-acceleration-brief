const BRIEF_DATA = {
  _history: [
    {
      _date: "March 22, 2026",
      _dateKey: "2026-03-22",
      _metrics: {
        slackMsgs: 20,
        emails: 2,
        granolaMeetings: 0,
        totalRetrieved: 22,
        sourcesCited: 38,
        coverage: "7/7",
        claimsKept: 38,
        dropped: 1,
        rewritten: 3,
        toolCallsA1: 16,
        toolCallsA2: 10,
        toolCallsB: 11,
        toolCallsC: 1
      },
      _hotSignals: [
        "CloudZero · Justin Moore (Innovius) confirmed new CEO role at CloudZero — LP/board-visible leadership transition; AI transformation narrative being finalized · #p-cloudzero",
        "Sewer AI · Q1 pacing to $1.8M vs $2.5M plan (28% miss); Akash cautioned Billy on presentation conduct during active fundraise · #p-sewerai",
        "Auditoria · SDR performance critically broken: <1% reply rates on 400+ weekly calls; mid-funnel conversion 11% vs 32% plan — board-visible pipeline quality issue · #p-auditoria",
        "RightRev · Personnel discussion pending between Justin [MAPPING AMBIGUOUS — verify: Justin Moore (Innovius) or Justin Ziccardi (Budburst)?] & Jagan; conversation not yet completed · #p-rightrev",
        "CloudZero · Greg [NOT ON CANONICAL ROSTER — CZ employee, identity unverified] being let go per Emerson mention; tied to recent layoff · DM Nicole Moscaret"
      ],
      _hotActions: [
        "Delightree · Finalize tech stack data source selection (Clay, ZoomInfo, LeadIQ) for ICP workshop — Akash committed by end of week; account scoring build blocked · Delightree team waiting · SOURCE: new · #delightree-gtm-acceleration · 2026-03-22",
        "Sewer AI · Confirm Billy's updated operating plan reflects Q1 miss narrative before next investor touch — fundraise is active, presentation integrity at risk · Billy waiting · SOURCE: new · #p-sewerai · 2026-03-22",
        "Innovius · Respond to Justin Moore's concern about sourcing velocity — team feels overwhelmed by outbound approach shift; alignment needed before morale compounds · Justin Moore waiting · SOURCE: new · DM Justin Moore · 2026-03-22",
        "RightRev · Drive MEDDPICC qualification alignment and MoF discussion in sales process workshop series — pipeline discipline at risk without Akash follow-through · RightRev team waiting · SOURCE: new · #rightrev-gtm-acceleration · 2026-03-22",
        "ClearML · Follow up with Moses on Scott Tecton advisor engagement — Moses non-responsive; engagement risks going cold · Moses waiting · SOURCE: new · #p-clearml · 2026-03-22"
      ],
      "Sewer AI": {
        engagement: "Active",
        lastTouch: "2026-03-22 · #p-sewerai",
        teamVisibility: "Billy, Dave Barden, Cole, Erik",
        hasSignal: true,
        know: [
          "Q1 pacing to $1.8M vs $2.5M plan — significant miss; operating plan being updated",
          "Akash cautioned Billy on presentation conduct during active fundraise — relationship and credibility risk if not corrected",
          "Q2 path looks strong: minimum $2.9M with upside to $3.5–4M; PG&E and Houston signing direct POs (Q1 PAYG trade-off contributing to Q1 shortfall)",
          "Sewer AI stand-up scheduled 2026-03-23 11:00–11:30 AM ET (Dave Barden, Cole, Erik) — informational"
        ],
        action: [
          "Verify Billy has updated operating plan and fundraise narrative before next investor interaction — Q1 miss needs clean framing"
        ]
      },
      "Auditoria": {
        engagement: "Active",
        lastTouch: "2026-03-22 · #p-auditoria, DM Xiaolei Cong",
        teamVisibility: "Roi, Dave Osborne, Rohit, Adina, Nick, Maya",
        hasSignal: true,
        know: [
          "SDR performance is critically broken: <1% reply rates on 400+ weekly calls; copy stale, targeting not curated; mid-funnel conversion 11% vs 32% plan — board-visible",
          "CMO search underway via Cole Group; website refresh underwhelming",
          "Workday partnership momentum strong post-SKO on Lights Out Finance integration — one positive signal",
          "Xiaolei (Innovius) concerned that consistent pipeline coverage issues are not translating to business performance; wants more effective support levers"
        ],
        action: [
          "Align with Xiaolei on Innovius intervention framing for Auditoria SDR copy and targeting — not an immediate Akash blocker but coordinated response needed"
        ]
      },
      "CloudZero": {
        engagement: "Active",
        lastTouch: "2026-03-22 · #p-cloudzero, DM Nicole Moscaret",
        teamVisibility: "Brady, Sharon, Scott, Bill, Dan Carducci, Miguel, Don, Chris Hogan",
        hasSignal: true,
        know: [
          "Justin Moore (Innovius) confirmed new CEO role at CloudZero — LP/board-visible leadership transition; AI transformation narrative being finalized",
          "Scott Castle (CPO at CloudZero) joining as Innovius Product Advisor for portfolio collaboration — announced ~3/6",
          "Greg [NOT ON CANONICAL ROSTER — CZ employee, identity unverified] being let go; tied to recent layoff referenced by Emerson [unverified]; Phil [unverified] reportedly had conflict with him"
        ],
        action: [
          "Monitor AI transformation narrative finalization ahead of any LP/board communication — no immediate Akash-blocking action"
        ]
      },
      "Delightree": {
        engagement: "Active",
        lastTouch: "2026-03-22 · #delightree-gtm-acceleration; 2026-03-21 · email (Doug)",
        teamVisibility: "Tushar, Doug, Griffin, Adrian",
        hasSignal: true,
        know: [
          "Q1 tracking on plan: closed $400K, weighted pipeline $550K, upsell from location growth $120–150K",
          "New Head of Finance finalizing plan next week",
          "Akash leading ICP workshop; tech stack evaluation (Clay, ZoomInfo, LeadIQ) with data source selection due end of this week",
          "Akash followed up with Doug (VP Sales) on three stalled hiring actions: (1) Will Frank's team do first-round vetting [Frank identity unverified], (2) dedicated 4-hour scheduling window, (3) EA support status — waiting on Doug's response"
        ],
        action: [
          "Deliver ICP workshop data source decision by end of week — committed timeline, Akash is the blocker",
          "Monitor Doug's response on hiring actions; if no reply by EOD Monday 2026-03-23, re-escalate — sales hiring stall has pipeline downstream risk"
        ]
      },
      "X-Cures": {
        engagement: "Monitoring",
        lastTouch: "2026-03-22 · #p-xcures",
        teamVisibility: "Mika, Bryan, Ben",
        hasSignal: true,
        know: [
          "Official portfolio company as of 2/25/2026; $12.2M invested (up from $10M on strong commercial traction); SPV structure under consideration",
          "Signed $2M minimum commit with Exact Sciences (expected usage $3–4M/year) — strong commercial signal",
          "CRO search via Cole Group kicked off; Williams Tison [external hiring contact] engaged on AE hiring"
        ],
        action: [
          "No immediate Akash-blocking action; CRO and AE hiring processes are in motion — monitor for next check-in need"
        ]
      },
      "ClearML": {
        engagement: "Monitoring",
        lastTouch: "2026-03-22 · #p-clearml",
        teamVisibility: "Alex, Moses, Noam",
        hasSignal: true,
        know: [
          "Moses non-responsive on Scott Tecton advisor engagement — Scott is an external advisor target from Tecton, not CloudZero's Scott Castle",
          "Zypsy discussions in progress but not yet signed"
        ],
        action: [
          "Nudge Moses on Scott Tecton advisor engagement — if no movement by EOD Monday 2026-03-23, Akash should direct-message Moses"
        ]
      },
      "RightRev": {
        engagement: "Active",
        lastTouch: "2026-03-22 · #p-rightrev, #rightrev-gtm-acceleration; 2026-03-21 · email (Pavel Reznikov)",
        teamVisibility: "Dan, Matthew, Joel, Joe, Jagan, Kathy",
        hasSignal: true,
        know: [
          "Personnel discussion pending between Justin [MAPPING AMBIGUOUS — verify: Justin Moore (Innovius) or Justin Ziccardi (Budburst)?] and Jagan — conversation scheduled but not yet completed; high urgency",
          "Sales process workshop series underway (4 parts planned); MEDDPICC qualification alignment needed; MoF discussion scheduled",
          "ICP meeting scheduled next Wednesday",
          "Tech stack audit in progress: potential $13–15K SFDC savings identified; ZoomInfo ~$50K spend being reviewed for pruning",
          "RightRev RevOps candidate Pavel Reznikov [external] interview confirmed for 4 PM Monday 2026-03-23 — informational, Akash is attending"
        ],
        action: [
          "Resolve Justin/Jagan personnel discussion ambiguity — identify which Justin is involved and confirm conversation has happened; unmonitored personnel risk until resolved",
          "Attend Pavel Reznikov interview Monday 4 PM ET — confirmed, no prep action needed"
        ]
      },
      _crossPortfolio: [
        "Cole Group is active across multiple companies simultaneously — CRO search (X-Cures) and CMO search (Auditoria) both via Cole Group; one coordinated check-in could yield status on both",
        "ICP/GTM workshop workload concentrated on Akash — direct owner of ICP work at Delightree (end-of-week deadline) and MEDDPICC/sales process workshops at RightRev; calendar pressure real",
        "Hiring is the dominant operational thread this week — CRO/AE hiring (X-Cures), CMO search (Auditoria), VP Sales hiring follow-up (Delightree), RevOps hire (RightRev)",
        "Leadership transitions at CloudZero — Justin Moore moving into CEO role while Scott Castle moves to Innovius advisor role; dual transition warrants LP/board communication readiness",
        "Sourcing velocity concern at Innovius level — Justin Moore's DM signals internal team stress about outbound approach shift; firm-level risk if not addressed"
      ]
    },
    {
      _date: "March 20, 2026",
      _dateKey: "2026-03-20",
      _metrics: {
        slackMsgs: 25,
        emails: 0,
        granolaMeetings: 3,
        totalRetrieved: 37,
        sourcesCited: 47,
        coverage: "7/7",
        claimsKept: 47,
        dropped: 0,
        rewritten: 0,
        toolCallsA1: 19,
        toolCallsA2: 7,
        toolCallsB: 6,
        toolCallsC: 4
      },
      _hotSignals: [
        "Sewer AI · Q1 revenue miss to $1.8M vs. $2.5M plan with active fundraise in flight · #p-sewerai + Slack search",
        "Auditoria · Industry classification accuracy ~50% (Innovius vs. Clay taxonomy mismatch) breaks core sourcing pipeline · Granola Athena meeting",
        "Auditoria · Three-engine pipeline growth structural gaps (Direct, SDR/BDR, Partners) limiting 3x growth trajectory · DM Xiaolei",
        "RightRev · GTM maturity lowest across portfolio; personnel discussion needed between Justin Moore & Jagan · #p-rightrev",
        "CloudZero · Justin Moore new CEO — external narrative alignment needed · #p-cloudzero",
        "Innovius · Harmonic data contract (30k/yr, 3-yr deal expiring EOY) single point of failure — loss = 2–3 week rebuild · Granola Athena meeting"
      ],
      _hotActions: [
        "Sewer AI · Confirm Q1 plan revision with Billy and finalize fundraise presentation strategy · Fundraise narrative hardens today/tomorrow · Billy waiting · SOURCE: carry-over 2026-03-16 + new Slack search 2026-03-20",
        "Auditoria · Sync 15-min call with Roi on industry classification taxonomy fix (Innovius vs. Clay) and close same day · Data integrity blocks sourcing · Nikhil + Roi waiting · SOURCE: new · Granola 2026-03-19",
        "ClearML · Follow up with Moses & Noam on Scott Castle Product Advisor decision — 48h window expired · Scott onboarding at risk · Moses/Noam waiting · SOURCE: carry-over · #p-clearml 2026-03-17",
        "Delightree · Confirm ICP signals assessment document delivery and schedule Griffin/Doug follow-up call · Akash committed in Granola · Griffin/Doug waiting · SOURCE: new · Granola 2026-03-19",
        "RightRev · Confirm ICP persona workshop details with Joseph Marshall (titles/levels) and champion definition enablement · Workshops next week; concepts undefined · Joseph waiting · SOURCE: new · #rightrev-gtm-acceleration 2026-03-18",
        "Innovius · Map org charts and prepare CXO Sales community infrastructure (Slack, distros, forms) · Justin Moore requested May/June launch · Akash owns setup · SOURCE: new · Granola 2026-03-19",
        "Innovius · Schedule Athena follow-up with Nikhil on Chrome/Chromium user save bug and Clay→ZoomInfo fallback · Dashboard adoption blocked · Nikhil waiting · SOURCE: new · Granola 2026-03-19",
        "Innovius · Request budget discussion with Justin Moore on 10-15k annual advisor compensation (CXO community) before May launch · Advisor model undefined · Justin waiting · SOURCE: new · Granola 2026-03-19"
      ],
      "Sewer AI": {
        engagement: "Active",
        lastTouch: "2026-03-17 · #p-sewerai + 2026-03-20 Slack search",
        teamVisibility: "Akash, Billy, Dave Barden, Turley, Erik, Cole",
        hasSignal: true,
        know: [
          "Q1 pacing to $1.8M vs. $2.5M plan; fundraise targeted $20-25M but appears to have underraised",
          "Q2 tracking strong: $2.9M minimum path, Dave Barden estimates $3.5-4M (PG&E + Houston moving to direct POs)",
          "Akash advised Billy on cautious presentation strategy during fundraise; Billy revising operating plan",
          "Candidate hire pending confirmation from Akash (high accept probability)"
        ],
        action: [
          "Finalize Q1 plan number with Billy and confirm revised fundraise presentation strategy (carry-over from Mar 16; new corroboration Mar 20)"
        ]
      },
      "Auditoria": {
        engagement: "Active",
        lastTouch: "2026-03-18 · DM Xiaolei + 2026-03-19 Granola",
        teamVisibility: "Akash, Roi, Dave Osborne, Xiaolei, Rohit, Adina, Nick, Maya",
        hasSignal: true,
        know: [
          "SDR performance at sub-1% reply rates vs. ~5% benchmark; mid-funnel conversion 11% vs. 32% plan",
          "Dave Osborne overextended (18 direct reports); behind on ToF target (~40-45/month vs. 90)",
          "Industry classification accuracy ~50% (Innovius taxonomy vs. Clay mismatch) — breaks lead quality signals",
          "Three-engine constraint: Direct Sales, SDR/BDR, and Marketing/Partners all have structural issues limiting 3x growth",
          "Akash recommends North America RVP hire and moving SDRs under Dave Osborne",
          "Website refresh underwhelming; Zypsy partnership not yet official"
        ],
        action: [
          "Schedule 15-min sync with Roi on industry classification taxonomy reconciliation (Innovius vs. Clay) and close same day per Granola commitment",
          "Coordinate follow-up with Clay Agency on account scoring migration plan once Roi finalizes (Akash owes process doc; carry-over from Mar 17)"
        ]
      },
      "CloudZero": {
        engagement: "Active",
        lastTouch: "2026-03-17 · #p-cloudzero",
        teamVisibility: "Akash, Justin Moore (new CEO), Brady, Sharon, Scott, Bill, Dan Carducci, Miguel, Don, Chris Hogan",
        hasSignal: true,
        know: [
          "Justin Moore officially new CEO as of mid-March",
          "Narrative alignment needed for external communications (board, investors, customers)",
          "Scott Castle (CPO, CloudZero) agreed to join as Innovius Product Advisor; structure/next steps TBD"
        ],
        action: [
          "Coordinate with Justin Moore on Scott Castle's pathway and role positioning (carry-over from Mar 18)"
        ]
      },
      "Delightree": {
        engagement: "Active",
        lastTouch: "2026-03-19 · Granola ICP Brainstorm + 2026-03-17 · #p-delightree",
        teamVisibility: "Akash, Tushar, Doug, Griffin, Adrian",
        hasSignal: true,
        know: [
          "Q1 tracking on plan: $400K closed, $550K weighted late-stage pipeline, $120-150K upsell from location growth",
          "Final annual plan ($12.9M-$13.9M) finalized next week by new Head of Finance",
          "5 priority workstreams launched Mar 9: RevOps leadership, territory segmentation, SDR comp model, CRM architecture, forecasting/analytics",
          "ICP initiative active: account scoring redesign beyond location count; coordinating with Griffin & Doug; Frandata quote pending"
        ],
        action: [
          "Document signal assessment and intelligence framework for ICP scoring; schedule follow-up call with Griffin & Doug (Granola commitment 2026-03-19)",
          "Initiate RevOps search to support 20+ rep scaling (carry-over, Month 1 priority from ~Mar 12)"
        ]
      },
      "X-Cures": {
        engagement: "Active",
        lastTouch: "2026-03-02 · #p-xcures",
        teamVisibility: "Akash, Mika, Bryan, Ben, Brian Michael (Budburst), Williams Tison",
        hasSignal: false,
        know: [
          "Officially portfolio company; $10M wire received; additional $2.2M arriving in coming weeks; SPV consideration given commercial traction",
          "Major commercial win: $2M minimum commit contract with Exact Sciences; expected usage $3-4M/year",
          "CRO search active: Gold Group contract signed (Brandon Herman leading); Brian Michael supporting CRO hiring + sales training",
          "Williams Tison hiring 11 AEs in 2 batches by May"
        ],
        action: [
          "Monitor CRO search progress and AE hiring pace (no hot blockers identified)"
        ]
      },
      "ClearML": {
        engagement: "Active",
        lastTouch: "2026-03-17 · #p-clearml",
        teamVisibility: "Akash, Moses, Noam, Alex, Williams Tison",
        hasSignal: true,
        know: [
          "Zypsy go-to-market launched; Williams Tison spinning up for AE/SE/RevOps hiring",
          "Akash supporting RevOps recruiting; meeting scheduled to activate Blitz the Market playbook after messaging/vision finalized",
          "Pending: Akash pinged Moses & Noam on Scott Castle Product Advisor 48h ago; no response (window expired 2026-03-19)"
        ],
        action: [
          "Follow up with Moses & Noam on Scott Product Advisor decision — response window expired; Scott's onboarding timing at risk"
        ]
      },
      "RightRev": {
        engagement: "Active",
        lastTouch: "2026-03-19 · #external-rightrev-innovius + 2026-03-18 · #p-rightrev",
        teamVisibility: "Akash, Jagan, Joseph Marshall, Dan, Matthew, Joel, Joe, Kathy, Brian Michael (Budburst)",
        hasSignal: true,
        know: [
          "Lowest GTM maturity across portfolio per Akash audit; personnel discussion needed between Justin Moore (Innovius) & Jagan",
          "Champion definition lacks consistency across team, impacting sales process discussions — enablement needed",
          "Joseph Marshall needs confirmation on ICP personas (titles/levels) from Akash",
          "Multiple sales process workshops scheduled for next week"
        ],
        action: [
          "Confirm ICP persona workshop details with Joseph Marshall (specific titles/levels) and provide champion definition enablement",
          "Coordinate with Jagan on GTM personnel conversation (partner with Justin Moore on timing/scope)"
        ]
      },
      _cross: [
        "ICP/Signals standardization: Delightree, RightRev, and Auditoria all need ICP workshop/persona clarification in parallel — Delightree signals framework could template others",
        "RevOps hiring bottleneck: Delightree RevOps search, ClearML AE/SE/RevOps hiring, X-Cures AE pipeline all moving in parallel; Akash and Brian Michael are shared resources",
        "Data integrity risk: Auditoria industry classification mismatch (Innovius vs. Clay) — recommend audit of other portfolio sourcing pipelines for similar false negatives",
        "Fundraise/operating plan cycle: Sewer AI revising Q1 numbers; may trigger subsequent revisions at other portfolio companies",
        "Advisor infrastructure: Scott Castle (CloudZero CPO) joining as Innovius Product Advisor; CXO community needs $10-15k annual compensation model to credibly engage advisors"
      ]
    },
    {
      _date: "March 19, 2026",
      _dateKey: "2026-03-19",
      _metrics: {
        slackMsgs: 18,
        emails: 0,
        granolaMeetings: 16,
        totalRetrieved: 34,
        sourcesCited: 46,
        coverage: "7/7",
        claimsKept: 46,
        dropped: 1,
        rewritten: 2,
        toolCallsA1: 18,
        toolCallsA2: 7,
        toolCallsB: 6,
        toolCallsC: 5
      },
      _hotSignals: [
        "ClearML · Scott Product Advisor decision escalation (48h window EXPIRED as of 3/19 11:37Z Wednesday; no response from Moses/Noam) · Slack channels",
        "CloudZero · Justin Moore confirmed as interim CEO (staying through year); CTO candidate interview Friday ex-Coinbase · Slack channels + Granola",
        "Auditoria · Board flagged pipeline growth slowing despite GTM investment; structural issues in Direct Sales, SDR, Marketing, Partners · Slack channels + Granola",
        "Sewer AI · Q1 pacing $1.8M vs $2.5M plan; Akash advised caution on presentation given active fundraise · Slack channels",
        "RightRev · Least mature GTM across portfolio; SDR quality crisis (sub-1% reply rates, 400+ weekly calls); mid-funnel 11% vs 32% target · Slack channels",
        "Auditoria · Dave Osborne overextended (18 direct reports); urgent need for North America RVP/1-line leader; SDR <1% reply rates · Slack channels",
        "Innovius · Ethan built 'Aries' (thematic sourcing + AI outreach) in ~4 hours, risking obsolescence of legacy Athena outbound module · Granola",
        "Innovius · Justin Moore pushing Akash to hire 1-2 GTM engineers to scale GTM Acceleration program · Slack channels"
      ],
      _hotActions: [
        "[ESCALATE PRIORITY] ClearML · Escalate Scott Product Advisor decision with Moses/Noam (48h window EXPIRED as of 3/19 11:37Z) · No response received; blocking ClearML advisory clarity",
        "[CARRY-OVER from 3/16] Sewer AI · Reach out to Billy re: Q1 plan number and presentation strategy given active fundraise · Timing sensitive; investor narrative needed before board/LP meetings",
        "CloudZero · Coordinate with Justin on Scott's pathway and role positioning (CTO candidate Friday complicates messaging) · Akash + Don commitment from 3/18 meeting; needed before candidate interview",
        "RightRev · Schedule ICP workshop for next week (week of 3/23) + coordinate personnel discussion (Justin/Jagan) on SDR quality crisis · Critical talent/compensation decisions pending",
        "Delightree · Schedule ICP workshop for next week (week of 3/23) + tech stack audit + email setup for Akash · GTM acceleration kicks off next week; blocking start",
        "[CARRY-OVER from 3/12] Delightree · RevOps hire search launch in Month 1 of engagement (growth to 20+ reps imminent) · Akash pushing to start now",
        "[CARRY-OVER from 3/18] Innovius · Decide next steps on Mehak Athena product/ML hybrid role (interview happened 3/18; hire blocks Fund 2 scaling) · Mehak's grad school sourcing underway; decision window closing",
        "Auditoria · Schedule customer health framework peer review (Roi → Adina) and approve account scoring migration plan · Board concern requires evidence of traction; delays downstream Clay Agency handoff",
        "[CARRY-OVER from 3/17] Auditoria · Hand off account scoring migration plan to Clay Agency once Roi finalizes (Akash owes process doc) · Blocking agency launch",
        "Innovius · Keep 'Aries' system under wraps; Ethan needs 10+ hours for production-ready build before Monday demo (3/23) · Competitive tool risk if mishandled",
        "Innovius · Consolidate all vibe-coded modules (Koby, Marci parallel work) into unified Athena wrapper · Infrastructure fragmentation risk",
        "[CARRY-OVER from 3/17] ClearML · Schedule in-person with Stu for roadmap/strategy discussion · No date set; relationship maintenance"
      ],
      "Auditoria": {
        engagement: "Active",
        lastTouch: "Mar 18 · Slack DM from Xiaolei + Granola (Auditoria AE pipeline discussion)",
        teamVisibility: "Akash, Xiaolei, Dave Osborne, Roi, Adina, Nick, Maya",
        hasSignal: true,
        know: [
          "Board signal: Pipeline growth slowing despite GTM investment; structural issues in Direct Sales, SDR, Marketing, Partners (Workday).",
          "Execution risks (FY27): Dave Osborne overextended with 18 direct reports; urgent need for North America RVP/1-line leader ASAP.",
          "SDR quality crisis: sub-1% reply rates (matching RightRev); critical performance gap.",
          "Website refresh underwhelming; CMO search underway (Cole Group engaged); Workday partnership momentum strong post-SKO with 'Lights Out Finance' integration potential.",
          "Account scoring migration plan pending Roi finalization; Clay Agency handoff awaiting Akash process doc."
        ],
        action: [
          "Schedule customer health framework peer review (Roi → Adina) and approve account scoring migration plan (board concerns require evidence of traction).",
          "Hand off account scoring migration plan to Clay Agency once Roi finalizes (Akash owes process doc).",
          "Support Dave's org expansion priority (North America RVP hire) given board visibility on pipeline risk."
        ]
      },
      "CloudZero": {
        engagement: "Active",
        lastTouch: "Mar 18 · Granola ([MW] Don | Akash Stand-up + QGM Run-Thru) + Slack",
        teamVisibility: "Akash, Justin Moore (CEO), Scott, Bill, Brady, Sharon, Don, Dan Carducci, Miguel, Chris Hogan",
        hasSignal: true,
        know: [
          "Justin Moore confirmed as interim CEO through end of year; team momentum improving (Bill, Brady, Sharon stepping up).",
          "CTO candidate interview Friday (ex-Coinbase hire with Bill's approval); active C-suite build-out.",
          "Scott moat insight: core infrastructure layer (MCP pipeline) customers can't build internally; built MCP pipeline architecture in 2 days (normally 6-month scope).",
          "Sophisticated customer base (Coinbase, Duolingo, American Airlines) won't build internally due to lack of durable pieces.",
          "Anthropic partnership now in PM phase; technical lead ownership unclear (Justin leading, but Bill + Scott both needed).",
          "Sales funnel: commercial conversion stronger than overall; AE quota attainment (12-13/month) is actual bottleneck, not conversion rate.",
          "Risk flagged: sales team may over-rotate to AI use cases before Q2 product ship; messaging guardrail needed."
        ],
        action: [
          "Coordinate with Justin on Scott's pathway and role positioning (CTO candidate Friday complicates leadership messaging; Don traveling for multi-day visit).",
          "Clarify technical lead ownership for Anthropic partnership (Justin primary, but Bill + Scott alignment required).",
          "Enforce 'what's on the truck' messaging with sales team to prevent AI over-rotation before product ships Q2.",
          "Support Justin/Xiaolei on external AI transformation narrative clarity."
        ]
      },
      "Delightree": {
        engagement: "Active",
        lastTouch: "Mar 18 · Granola (QGM Run-Thru with Tushar)",
        teamVisibility: "Akash, Tushar, Doug (VP Sales), Griffin, Adrian",
        hasSignal: true,
        know: [
          "Q1 pacing on plan; Head of Finance finalizing annual plan this week; currently closed $400K with $550K weighted late-stage pipeline.",
          "Tushar moat insight: built badge scanning app in 1 day using no-code (replacing $10k software purchase); AI velocity enabling franchisee product to compete on speed, not cost; non-technical franchisee buyer base = durable moat (2-4% tech spend tolerance).",
          "Tushar committed to participate in QGM LP presentation with prepared AI velocity examples.",
          "GTM acceleration starts next week (3/23 or later); ICP workshop needed for week of 3/23.",
          "Akash needs tech stack audit + email setup for GTM work launch.",
          "RevOps gap: rapid growth to 20+ reps; hire search should start Month 1 of engagement."
        ],
        action: [
          "Schedule ICP workshop for next week (week of 3/23) and confirm tech stack audit + Akash email setup before GTM kickoff.",
          "Initiate RevOps search (Month 1 priority per Akash) to support 20+ rep scaling."
        ]
      },
      "RightRev": {
        engagement: "Active",
        lastTouch: "Mar 18 · Slack (#rightrev-gtm-acceleration)",
        teamVisibility: "Akash, Justin Moore, Jagan, Dan, Matthew, Joel, Joe, Kathy, Brian Michael (Budburst)",
        hasSignal: true,
        know: [
          "Akash audit finding: RightRev is least mature in GTM across entire portfolio.",
          "SDR quality crisis: sub-1% reply rates, 400+ weekly calls per rep, mid-funnel conversion 11% vs 32% plan (same quality issue as Auditoria).",
          "Personnel discussion pending: Justin and Jagan need to meet on talent/compensation decisions.",
          "ICP workshop needs scheduling for next week."
        ],
        action: [
          "Schedule ICP workshop for next week (week of 3/23) and coordinate personnel discussion with Justin and Jagan on SDR underperformance (compensation, hiring, or role restructuring needed)."
        ]
      },
      "ClearML": {
        engagement: "Advisory",
        lastTouch: "Mar 17 · Slack (#p-clearml)",
        teamVisibility: "Akash, Moses, Noam, Alex, Stu (Innovius)",
        hasSignal: true,
        know: [
          "Scott Product Advisor inquiry: Akash pinged Moses and Noam; 48-hour response window EXPIRED as of today 3/19 11:37 UTC — no response received.",
          "[CARRY-OVER from 3/17] In-person roadmap/strategy discussion with Stu not yet scheduled."
        ],
        action: [
          "Escalate Scott Product Advisor decision with Moses/Noam (follow-up call or direct ask required; 48h window lapsed).",
          "Schedule in-person with Stu for roadmap/strategy discussion (relationship maintenance)."
        ]
      },
      "Sewer AI": {
        engagement: "Active",
        lastTouch: "Mar 17 · Slack (#p-sewerai)",
        teamVisibility: "Akash, Billy, Dave Barden, Cole, Turley",
        hasSignal: true,
        know: [
          "Q1 pacing to close at $1.8M vs $2.5M plan (down $700K); Q2 tracking strong at $2.9M-$4.0M.",
          "Akash advised caution on plan presentation strategy given active fundraise (investor/board optics sensitive).",
          "[CARRY-OVER from 3/16] Outreach to Billy on Q1 plan number and presentation strategy still unchecked."
        ],
        action: [
          "Reach out to Billy re: Q1 plan number and presentation strategy; timing critical before investor meetings/board discussions."
        ]
      },
      "X-Cures": {
        engagement: "Active",
        lastTouch: "Feb 11 · Slack (#p-xcures)",
        teamVisibility: "Akash, Mika, Bryan, Ben, Brandon Herman (Gold Group CRO search), Williams Tison (AE recruiter), Brian Michael (Budburst)",
        hasSignal: true,
        know: [
          "CRO search: contract signed with Gold Group (Brandon Herman leading).",
          "AE hiring: Williams Tison hired for 2 batches (11 total by May).",
          "Messaging support: Natalie and Brian Michael (Budburst) engaged.",
          "Exact Sciences partnership: signed $2M minimum commit contract (expected usage $3-4M/year); Series A increased to $12.2M with SPV consideration."
        ],
        action: [
          "No immediate actions flagged; hiring pipeline in progress with external partners."
        ]
      },
      _cross: [
        "SDR quality crisis (Auditoria + RightRev): both companies reporting sub-1% reply rates with 400+ weekly calls; suggests systematic outreach, targeting, or messaging problem—not volume. Consider cross-company SDR playbook comparison or third-party audit.",
        "'What's on the truck' messaging guardrail (CloudZero + Sewer AI): both companies at risk of over-promising AI capability before product ships. Akash coaching on realistic investor/buyer narratives.",
        "Organizational scaling friction (Auditoria + Delightree): Dave Osborne overextended (18 directs); Delightree needs RevOps hire; both companies hitting growth-stage leadership/ops gaps.",
        "Athena platform fragmentation (Innovius internal): Ethan's Aries + Koby/Marci vibe-coded modules = duplicate infrastructure risk. Monday demo deadline (3/23) for Aries consolidation.",
        "C-suite/advisor hire velocity: CloudZero CTO candidate Friday; Auditoria CMO search active; X-Cures CRO in motion; ClearML Product Advisor response overdue — multiple leadership gaps being filled in parallel."
      ]
    },
    {
      _date: "March 18, 2026",
      _dateKey: "2026-03-18",
      _metrics: {
        slackMsgs: 24,
        emails: 0,
        granolaMeetings: 58,
        totalRetrieved: 82,
        sourcesCited: 68,
        coverage: "7/7",
        claimsKept: 68,
        dropped: 0,
        rewritten: 7,
        toolCallsA1: 20,
        toolCallsA2: 7,
        toolCallsB: 10,
        toolCallsC: 13
      },
      _hotSignals: [
        "CloudZero · Anthropic partnership spinning up as major strategic initiative; could fundamentally change company trajectory · Granola ([MW] Don | Akash Stand-up 3/18)",
        "Auditoria · Critical GTM structural issues: Dave overextended (18 direct reports), SDR reply rates <1%, mid-funnel conversion 11% vs. 32% target · #p-auditoria",
        "SewerAI · Q1 pacing shortfall ($1.8M actual vs. $2.5M plan) during active fundraise; presentation recalibration needed · #p-sewerai",
        "RightRev · Sales team lacks conviction in own product; deep belief gap on differentiation despite workshopping · Granola (Budburst execution planning 3/17)",
        "Athena (Innovius) · Critical infrastructure single-point-of-failure: AWS/Vercel access locked in Nikhil's personal accounts; system collapse risk if account disabled · Granola (Athena Transition Plan 3/17)",
        "Delightree · HubSpot-to-Equals data sync not yet configured; blocking dashboard/forecast visibility · #equals-delightree (3/18 13:01Z)",
        "X-Cures · Sales team ramping fast (11 AEs across April/May cohorts) ahead of RevOps process definition; chaotic ops risk during CRO search · Group DM xCures team (3/18)"
      ],
      _hotActions: [
        "CloudZero · Practice defensibility questions with Scott for QGM fireside chat (build-vs-buy moat); presentation this week · Akash [CRITICAL]",
        "CloudZero · Unblock Doug's calendar: 4 hours/week for second-stage interviews; candidates sitting 2+ weeks with competitor offers inbound · Akash + Techtonic [CRITICAL]",
        "Delightree · Confirm HubSpot data sync with Griffin; Equals pipeline activation requested 3/18 13:01Z same-day · Akash + Griffin [CRITICAL]",
        "RightRev · Call Jagan with Brian this week; brief on sales process alignment (moving forward despite Dan's reluctance) · Akash [HIGH]",
        "Delightree · Activate Griffin on transaction hygiene/lead assignment; 90-day embedded engagement kicks off now · Akash [HIGH]",
        "Auditoria · Schedule intentional discussion with Xiaolei next week on deploying collective Innovius resources · Akash [HIGH]",
        "CloudZero · Build reverse funnel dashboard (per-AE discovery call targets, Salesforce auto-refresh) + forward forecast model · Akash [HIGH]",
        "X-Cures · Decide with Stu: hire RevOps now or wait for CRO + concurrent Akash involvement; team scaling fast · Akash + Stu",
        "RightRev · Build ICP signals workshop; Justin sourcing target account list via Clay · Akash",
        "Innovius · Prepare Claude Code show-and-tell demo for Monday (6-layer parallel agent system) · Akash",
        "Innovius · Schedule 4 Athena deep-dive sessions with Nikhil (Scoring, Efficiency, Infrastructure, Account Scoring) · Akash",
        "ClearML · Monitor 48-hour response window from Moses/Noam on Scott Product Advisor (opened 3/17 11:37Z) · Akash",
        "Delightree · Approve admin support + EA contractor ($50/hr) · Akash",
        "Innovius · GTM Engineering role: Betts Recruiting kickoff March 23 · Akash (hiring pipeline)"
      ],
      "Auditoria": {
        engagement: "Active",
        lastTouch: "Mar 17 · Granola (Roi customer health brainstorm) + Mar 10 last Slack",
        teamVisibility: "Akash, Xiaolei, Dave, Roi",
        hasSignal: true,
        know: [
          "GTM structural risks: Dave managing 18 direct reports; SDR reply rates <1%; mid-funnel 11% vs. 32% plan.",
          "Website refresh underwhelming; Zypsy partnership not formalized; CMO search with Cole Group not kicked off.",
          "Pipeline growth slowing (Xiaolei); intentional Innovius resource discussion scheduled.",
          "Customer health framework (30 signals across 5 categories) in development with Roi; account scoring being handed to Clay Agency."
        ],
        action: [
          "Schedule intentional discussion with Xiaolei next week on deploying Innovius resources.",
          "Hand off account scoring migration plan to Clay Agency once Roi finalizes (Akash owes process doc)."
        ]
      },
      "CloudZero": {
        engagement: "Active",
        lastTouch: "Mar 18 · Granola (4 meetings: Don stand-up, Chris KPIs, Brady architecture, Hiring sync)",
        teamVisibility: "Akash, Justin (CEO confirmed), Scott (President), Don, Chris, Brady, Bill, Doug",
        hasSignal: true,
        know: [
          "Justin confirmed as CEO with 1-year board commitment; Scott elevated to President (competitive tension to motivate).",
          "CTO candidate evaluation underway; Bill and Brady stepping up significantly.",
          "Anthropic partnership spinning up — major strategic initiative; Scott and Bill to lead technical side.",
          "Sales over-rotation risk: team gravitating toward AI use cases not yet shipping in Q2; must sell FinOps.",
          "Volume problem: ~36 discovery calls/month vs. 76 needed; commercial requires 13 calls/AE/month.",
          "Recruiting bottleneck: Doug slow on second-stage interviews; 6–8 candidates ready; competitor offer risk."
        ],
        action: [
          "Build reverse funnel dashboard (per-AE discovery call targets vs. actuals, Salesforce auto-refresh).",
          "Build forward forecast model showing year-end position based on current unit production.",
          "Unblock Doug's calendar: 4 hours/week; Curtis + EA to own scheduling 48h in advance.",
          "Practice QGM defensibility with Scott (build-vs-buy moat; LP fireside this week).",
          "Coordinate with Justin on Scott's pathway and role positioning.",
          "Send Brady Cowork codebase + architecture diagram for his parallel agent system build."
        ]
      },
      "Delightree": {
        engagement: "Active (embedded 2 days/week × 90 days, $13k/month)",
        lastTouch: "Mar 18 · #equals-delightree + Granola (Tushar 1:1 and Budburst weekly status 3/17)",
        teamVisibility: "Akash, Tushar, Griffin, Doug, Erin, Zac (recovering from gallbladder surgery)",
        hasSignal: true,
        know: [
          "Q1 on track: $400K closed, $550K weighted late-stage pipeline, $120–150K from upsells; annual plan ($12.9M–$13.9M) finalizing next week.",
          "Griffin lacks confidence; 25% of deals have no activity (poor handoff, lead hygiene issues).",
          "Pandadoc rollout next week; $18k/location vs. $18k total confusion causing surprise renewal terms.",
          "HubSpot-to-Equals data sync not set up; forecast dashboard blocked.",
          "ICP workshop Thursday with Erin; differentiation workshop Mon/Tue if Zac recovers from surgery."
        ],
        action: [
          "Confirm HubSpot data sync with Griffin; coordinate Equals pipeline activation (urgent, same-day request).",
          "Support Griffin on transaction hygiene, lead assignment, deal qualification.",
          "Build custom agent/dashboard system for Delightree; share codebase.",
          "Approve admin support + EA contractor ($50/hr).",
          "Run ICP signals workshop Thursday with Erin.",
          "Send Nicole engagement invoices to Adrian monthly."
        ]
      },
      "RightRev": {
        engagement: "Active",
        lastTouch: "Mar 17 · Granola (Budburst execution planning) + #p-rightrev 3/16",
        teamVisibility: "Akash, Brian (Budburst), Jagan (CEO), Dan, Joel, Matthew, Jamaica, Justin",
        hasSignal: true,
        know: [
          "Alignment completed with Joel and Matthew; Dan not engaged (only cares about Salesforce partnership).",
          "Deep conviction gap: sales team doesn't believe in product value; Dan claims already doing what's being proposed.",
          "Real differentiator (complexity at scale for consumption-driven businesses) — team cannot articulate it.",
          "ICP workshop + target account list are P0 before sales process rollout; Clay license confirmation pending.",
          "GTM staff meetings not established; Justin/Jagan personnel conversation needed (Xiaolei flagged 3/16)."
        ],
        action: [
          "Call Jagan with Brian this week (moving forward despite Dan's reluctance).",
          "Build ICP signals workshop; Justin sources target account list via Clay.",
          "Create enablement materials: challenge questions, solutions hypothesis, business case/ROI (Jamaica/Justin support).",
          "Share Auditoria/Sewer AI materials as reference templates.",
          "Set up bi-weekly check-in cadence."
        ]
      },
      "ClearML": {
        engagement: "Advisory",
        lastTouch: "Mar 17 · #p-clearml + DM with Stu",
        teamVisibility: "Akash, Moses, Noam, Scott (proposed Product Advisor), Williams Tison",
        hasSignal: true,
        know: [
          "Scott (ex-Tecton CPO) confirmed as Innovius Product Advisor; activation plan under exploration.",
          "48-hour response window opened 3/17 11:37Z for Moses/Noam on Scott engagement; Justin/Stu escalate if no response.",
          "Williams Tison spinning up AE, SE, RevOps hiring; Zypsy messaging alignment with top candidate getting close."
        ],
        action: [
          "Monitor 48-hour window; escalate to Justin/Stu by 3/19 if no response from Moses/Noam.",
          "Schedule in-person roadmap discussion with Stu + ClearML leadership."
        ]
      },
      "Sewer AI": {
        engagement: "Active",
        lastTouch: "Mar 17 · #p-sewerai",
        teamVisibility: "Akash, Billy, Dave",
        hasSignal: true,
        know: [
          "Q1 shortfall: pacing $1.8M vs. $2.5M plan — flagged during active fundraise; presentation recalibrated.",
          "Q2 recovery strong: minimum $2.9M path, Dave believes $3.5–4M with PG&E and Houston direct POs.",
          "No Granola meetings in last 24h; no email signal."
        ],
        action: [
          "Reach out to Billy re: revised Q1 number and fundraise narrative (carry-over from Mon Mar 16, still unchecked)."
        ]
      },
      "X-Cures": {
        engagement: "Active",
        lastTouch: "Mar 18 · Group DM xCures team + DM with Stu",
        teamVisibility: "Akash, Stu, Williams Tison, Natalie Wolf",
        hasSignal: true,
        know: [
          "Exact Sciences $2M minimum commit with expected $3–4M annual usage — major validation.",
          "CRO search via Gold Group; Williams Tison hiring 11 AEs across April/May cohorts.",
          "Sales process stages, forecasting methodology, territory divisions, and CRM tools NOT yet defined — team ramping into a process vacuum.",
          "Stu recommending RevOps hire (vs. consultant) now for continuity."
        ],
        action: [
          "Decide with Stu on RevOps timing (hire now or wait for CRO); define process framework in parallel with AE ramp.",
          "CRM rollout, forecasting methodology, territory design — all needed before April cohort goes live."
        ]
      },
      _cross: [
        "RevOps as critical bottleneck across 3 companies: Delightree (HubSpot-Equals sync blocking forecast), X-Cures (process definition vacuum with 11 AEs ramping in April), RightRev (sales process undefined). Akash's GTM Acceleration capacity is the constraint — contractor model and services partner exploration underway.",
        "Sales enablement is about belief as much as process: RightRev conviction gap is the clearest case but pattern exists across CloudZero (AI vs. FinOps over-rotation) and Delightree (contract chaos undermining simple pitch).",
        "Athena sprawl accelerating fragmentation: Ethan built Aries independently (Claude-powered autonomous sourcing); Koby and Marcy building separate modules. Olympus wrapper architecture decision needed before consolidation becomes impossible. Nikhil departure makes this time-sensitive.",
        "QGM this week is LP-visible: CloudZero (Scott) and Delightree (Tushar) in fireside format. Core question: what's the defensible moat when everyone can build software? System-of-record / business context layer is the thesis. Akash must practice with both executives.",
        "Hiring PM candidate pipeline: two interviews today (Mehak and Cassandra), neither confirmed as hire. Mehak lacks ML ops production experience; Cassandra advancing to round 2. Role requires hybrid PM/ML ops — Mehak tapping grad school network for ML candidates."
      ]
    },
    {
      _date: "March 17, 2026",
      _dateKey: "2026-03-17",
      _metrics: {
        slackMsgs: 20,
        emails: 7,
        totalRetrieved: 60,
        sourcesCited: 68,
        coverage: "7/7",
        claimsKept: 68,
        dropped: 3,
        rewritten: 3
      },
      _hotSignals: [
        "Sewer AI · CEO Billy requesting high-conviction strategic POV on raise vs. hold vs. sell; board meeting Friday AM · Slack channels",
        "Auditoria · Sales org at critical breaking point: VP Sales Dave overextended (18 direct reports), SDR sub-1% reply rates, mid-funnel conversion 11% vs 32% plan · Slack channels",
        "Auditoria · Pipeline growth slowing; board deck flagged by Xiaolei; AE manager hiring showing cracks · Slack + DM convergence",
        "X-Cures · 22 AEs hiring through May, Mika asking when Akash can start GTM engagement (3-week lag since Feb 25 portfolio entry) · Slack channels",
        "RightRev · Flagged as least mature GTM across portfolio; 4-part sales process workshop in flight (Parts 1-2 complete) · Slack channels",
        "CloudZero · Dual OKR system created duplicate work; AI pricing model shift projected 170% NRR vs 120% historical; 6-month scope done in 2 days · Granola",
        "CloudZero · CEO path unclear: Justin may stay figurehead through year-end; Scott positioned as President if Blake Brennan doesn't materialize · Granola",
        "Delightree · Multiple recruiters flagging slow interview scheduling and lost candidates; committed to dedicated talent coordinator + EA/Chief of Staff hire · Gmail + Slack convergence",
        "ClearML · RevOps hiring in motion with Williams Tison; Blitz the Market playbook activation pending messaging/vision work · Slack channels",
        "Innovius · Justin requesting Claude Code show-and-tell Monday; emphasizes competitive ceiling for portfolio evaluation · Slack channels",
        "Innovius · Athena product lacks PMF on core scoring module; Fund 2 closing end of Q1 (~75% closed); Mehak follow-up Wednesday 9–9:45am · Granola"
      ],
      _hotActions: [
        "Sewer AI · Provide strategic POV to Billy (raise/hold/sell) — board meeting Friday AM; Billy waiting · ASAP",
        "Auditoria · Drive North America RVP hiring urgently — Dave overextended, SDR metrics critical, mid-funnel 11% vs plan · Leadership team waiting",
        "X-Cures · Schedule GTM engagement kickoff with Mika — 3+ week gap, 22 AEs ramping April/May · Mika waiting",
        "RightRev · Complete personnel interview with Jagan — required for GTM restructuring; Parts 3-4 workshop pending · Team waiting",
        "CloudZero · Coordinate 36-hour OKR app testing window — Bill needs confirmation by EOD March 17 · Bill/Scott/Miguel waiting",
        "CloudZero · Push daily intelligence dashboard to eltbriefing.brunakash.com; give Brenna access EOD March 17; hand off to Matt/Ari · Brenna + engineering waiting",
        "CloudZero · Host after-action review on OKR rollout issues — prevent duplicate builds; migration end of week · Engineering/product team",
        "Delightree · Advocate for EA/Chief of Staff hire — recruitment bottleneck compounding; dedicated talent coordinator already committed · Doug/Tushar waiting",
        "Innovius · Prepare Claude Code show-and-tell for Monday team meeting — Justin requesting; 72h window · Justin waiting",
        "Innovius · Complete Wednesday 9–9:45am Mehak follow-up on Athena product/engineering role — Fund 2 scaling blocker · Mehak waiting [CARRY-OVER from 2026-03-16]"
      ],
      "Auditoria": {
        engagement: "Active",
        lastTouch: "Mar 17 · Gmail (customer health brainstorm with Roi, 3–3:30pm EDT today)",
        teamVisibility: "Akash, Roi Shukrun, Dave (VP Sales), Xiaolei",
        hasSignal: true,
        know: [
          "Sales org at breaking point: Dave overextended with 18 direct reports; SDR sub-1% reply rates (10 meetings/month from 400+ calls); mid-funnel conversion 11% vs 32% plan.",
          "North America RVP hire flagged ASAP.",
          "Pipeline growth slowing (board deck); Xiaolei concerned; wants to discuss how Innovius can help more.",
          "Website refresh underwhelming; CMO search active with Cole Group.",
          "Workday partnership momentum strong; Smart Research PLG motion being explored.",
          "Historical pacing discrepancy on Equals dashboard ($623K variance); Roi committed to review.",
          "AE manager hiring showing cracks; marketing slower than expected; Head of Product search kicking off early April.",
          "Customer health brainstorm scheduled today March 17 3–3:30pm EDT with Roi."
        ],
        action: [
          "Drive North America RVP hiring urgently (capacity bottleneck compounding sales metrics failure).",
          "Support Xiaolei discussion on how Innovius can help more effectively on pipeline growth."
        ]
      },
      "CloudZero": {
        engagement: "Active",
        lastTouch: "Mar 16 · Granola (dual stand-ups with Don and Brenna)",
        teamVisibility: "Akash, Scott Castle, Don, Bill, Ari, Matt Norgren, Brenna, Eric Weiss, Miguel Valdez",
        hasSignal: true,
        know: [
          "OKR platform confusion resolved: dual system (Larry/Kevin vs. Ari teams) creating duplicate work; migration to Ari's system by end of week.",
          "New AI pricing model: shift from percentage-of-cloud-bill to API/inference call-based billing; projected 170% NRR vs. historical 120% (telemetry-first architecture built in 2-day sprint).",
          "Product velocity dramatically increased: 6-month scope completed in 2 days.",
          "CEO transition path unclear: Justin may stay as figurehead through year-end; Scott positioned as President if external CEO (Blake Brennan) doesn't materialize.",
          "One red KR (AI Native focus), two yellow KRs (ICP focus) need SLT discussion.",
          "Scott backing out of Human X conference to focus on CloudZero priorities.",
          "AI Champions program launching; metrics/goals unclear before scaling.",
          "Clozd vs. Sybill trade-off: premium interviews vs. auto-recorded calls; Miguel concerned about Clozd feature differentiation.",
          "Akash built daily AI-powered intelligence dashboard (Claude agents: retriever, analyzer, validator); currently runs on personal computer 9am daily.",
          "QGM with Scott Castle and Tushar Mishra scheduled Thursday March 19, 8:10–8:45am PDT."
        ],
        action: [
          "Coordinate 36-hour OKR app testing window (Bill coordinating; confirm by EOD March 17).",
          "Push daily intelligence dashboard to eltbriefing.brunakash.com; give Brenna access by EOD March 17; hand off to Matt/Ari for productization.",
          "Host after-action review on OKR rollout to prevent duplicate builds going forward.",
          "Message team on SLT agenda: values, red/yellow KR discussion (20 min), remaining topics.",
          "Coordinate one-on-one between Don and Justin (Friday) on CEO/President path (ping Jasmine/Nicole for scheduling).",
          "Support Scott on Snowflake partnership discussion (Monday SLT)."
        ]
      },
      "Delightree": {
        engagement: "Active",
        lastTouch: "Mar 16 · Gmail (Aligning on Delightree Hiring with Doug)",
        teamVisibility: "Akash, Tushar Mishra, Doug Gabbard, Techtonic Partners, Williams Tison, Budburst",
        hasSignal: true,
        know: [
          "Akash completed comprehensive GTM audit (strongest results across portfolio); 5 workstreams kicked off March 9: RevOps leadership, territory segmentation, SDR comp model, CRM/systems migration, forecasting/analytics.",
          "GTM engagement with Budburst: needs tech stack details, ICP workshop (90 min), account scoring signals from leadership.",
          "Hiring velocity bottleneck: multiple recruiters flagging slow interview scheduling and lost candidates.",
          "Company committed to dedicated talent coordinator hire.",
          "Akash advocating for EA/Chief of Staff hire to unblock scheduling.",
          "Quarterly GTM meeting scheduled Thursday March 19, 8:10–8:45am PDT (Nicole confirmed)."
        ],
        action: [
          "Advocate for EA/Chief of Staff hire (hiring bottleneck compounding recruitment delays).",
          "Support ICP workshop and Budburst engagement details (tech stack, account scoring).",
          "Attend Quarterly GTM meeting Thursday March 19, 8:10–8:45am PDT."
        ]
      },
      "RightRev": {
        engagement: "Active",
        lastTouch: "Mar 16 · Granola (GTM Sales Process - Value and Gates meeting)",
        teamVisibility: "Akash, Jagan (personnel interview pending)",
        hasSignal: true,
        know: [
          "Flagged as least mature GTM across portfolio (Slack Feb 18).",
          "Multiple personnel discussions required; interview with Jagan pending.",
          "4-part sales process workshop: Parts 1–2 completed this week; Parts 3–4 pending.",
          "MEDDPICC qualification framework being implemented with updated probability percentages.",
          "Must quantify ROI more aggressively to compete against AI-native solutions in market.",
          "Sales process requires clear value articulation and quantifiable ROI metrics to win deals."
        ],
        action: [
          "Complete personnel interview with Jagan.",
          "Progress Parts 3–4 of sales process workshop.",
          "Support ROI quantification and competitive positioning against AI solutions."
        ]
      },
      "ClearML": {
        engagement: "Active",
        lastTouch: "Mar 16 · Granola (stand-up)",
        teamVisibility: "Akash, Williams Tison, Zypsy (CMO candidate)",
        hasSignal: true,
        know: [
          "Officially closed October 2025; Series C formal close confirmed.",
          "Zypsy close to alignment as top CMO choice.",
          "Williams Tison spinning up AE/SE/RevOps hiring.",
          "Akash supporting RevOps recruiting.",
          "Blitz the Market playbook activation pending messaging/vision work."
        ],
        action: [
          "Get status update from leadership on Zypsy CMO alignment and messaging/vision work completion for playbook activation."
        ]
      },
      "Sewer AI": {
        engagement: "Advisory",
        lastTouch: "Mar 16 · Granola (MWF stand-up)",
        teamVisibility: "Akash, Billy (CEO), Stu, Justin",
        hasSignal: true,
        know: [
          "GTM engagement active: sales process, enablement, territory analysis, loss code cleanup live.",
          "New sales process went live; Sybill tool implemented; cleaned loss codes under review.",
          "Strategic decision pending: Billy seeking high-conviction POV from leadership on raise vs. hold vs. sell (board wishy-washy).",
          "Follow-up board meeting scheduled Friday AM."
        ],
        action: [
          "Provide strategic recommendation to Billy before Friday board meeting."
        ]
      },
      "X-Cures": {
        engagement: "Active",
        lastTouch: "Mar 16 · Slack (RevOps contractor urgency flagged by Stu)",
        teamVisibility: "Akash, Mika (CEO), Brandon Herman (CRO search), Natalie (messaging), Williams Tison",
        hasSignal: true,
        know: [
          "Officially portfolio company (Feb 25); $12.2M deployed, $2M minimum Exact Sciences contract locked (expected usage $3–4M/year).",
          "CRO search active with Gold Group (Brandon Herman leading); Natalie plugged in for messaging.",
          "AE hiring: 2 batches of 11 total (22 AEs) by May (April/May cohorts).",
          "Mika asking when Akash can start engagement (flagged Feb 25, 3+ weeks gap).",
          "Stu suggesting contractor under Akash supervision for RevOps to move things forward ASAP."
        ],
        action: [
          "Schedule GTM engagement kickoff with Mika (timing critical with 22 AE hires ramping April/May).",
          "Determine RevOps contractor approach: hire directly or coordinate contractor under Akash supervision per Stu's suggestion."
        ]
      },
      _cross: [
        "Hiring bottlenecks across portfolio (Delightree, Auditoria, RightRev, X-Cures, ClearML): Multiple companies facing recruitment velocity and capacity constraints. Delightree's dedicated talent coordinator + EA/Chief of Staff hire model may be replicable pattern. Williams Tison active across 4+ companies.",
        "GTM audit → execution cycle: Delightree completed audit (strongest results) with 5 workstreams live (March 9). Auditoria and RightRev in diagnosis/early intervention phases. X-Cures awaiting engagement kickoff (3+ week gap).",
        "AI-native competitive threats: RightRev requires ROI quantification to compete; CloudZero shipping AI-powered telemetry architecture; Sewer AI board considering strategic options in AI-native market.",
        "CEO/leadership transition risk: CloudZero CEO path unclear (Justin figurehead vs. Scott President); Sewer AI strategic decision pending; Auditoria AE manager cracks showing.",
        "RevOps as bottleneck: X-Cures flagging RevOps ASAP (contractor suggested); CloudZero OKR platform migration; Auditoria Equals dashboard discrepancy. RevOps maturity directly linked to sales predictability.",
        "Innovius internal capacity constraints: Dylan departing (severance dispute), Nikhil leaving for Raylu.ai (competitive product), Justin asking how to scale GTM Acceleration sourcing. Mehak hire (Athena product) critical for Fund 2 scaling."
      ]
    },
    {
      _date: "March 16, 2026",
      _dateKey: "2026-03-16",
      _metrics: {
        slackMsgs: 10,
        emails: 15,
        totalRetrieved: 62,
        sourcesCited: 78,
        coverage: "7/7",
        claimsKept: 78,
        dropped: 9,
        rewritten: 3
      },
      _hotSignals: [
        "RightRev · CFO Dan functioning as de facto COO creating engagement/retention risk · Slack + Granola",
        "Delightree · Hiring pipeline stalled with 4 candidate losses; dedicated resource arriving late this week · Slack + Gmail",
        "Auditoria · SDR reply rates sub-1% + mid-funnel conversion 11% vs 32% target + $623K forecast delta · Slack + Gmail",
        "CloudZero · Dual OKR system builds + parallel architecture decisions executed without company-wide visibility · Slack + Granola",
        "CloudZero · Sales team retention risk if focus shifts entirely to AI away from core cloud cost product · Granola",
        "CloudZero · CEO figurehead model + Scott president path not yet confirmed; Blake Brennan external candidate creating morale risk · Granola",
        "Innovius · Nikhil departing March 27; last day confirmed · Slack",
        "Innovius · Fund 2 at 75% closed ($128–150M soft commitments); Athena platform trust gap blocking scale · Slack + Granola"
      ],
      _hotActions: [
        "Innovius · Nudge Dylan on amended agreement signature — T-1 day deadline, Nicole Moscaret waiting, legal blocker · SAME-DAY URGENT",
        "RightRev · Confirm attendance + prep for 4-part sales process restructuring workshop — Dan + sales team waiting, 24–48h window",
        "Delightree · Confirm dedicated talent resource start time + finalize hiring pipeline recovery plan with Doug — candidates continue to slip, 24–48h window",
        "Auditoria · Investigate $623K forecast delta + root-cause SDR performance (sub-1% reply rates) — Roi + GTM team waiting, impacts Q1 guidance, 24–48h window",
        "CloudZero · Schedule in-person conversation with Justin on figurehead CEO role + Scott president path — Scott's retention at risk if clarity delayed, 24–48h window",
        "CloudZero · Run 20–30 min after-action on dual OKR builds; establish serial decision-making norms — team waiting, prevents recurrence, 24–48h window",
        "CloudZero · Have telemetry demo ready for Shutterstock (design partner priority) by week-end — 48h window",
        "Innovius · Follow-up Wednesday 9:00–9:45am with Mehak on Athena product/engineering role fit — hire blocks Fund 2 scaling, 24h window",
        "Innovius · Schedule Don–Justin 1:1 on Friday via Jasmine/Nicole — CEO/COO alignment on figurehead model + org structure, 48h window"
      ],
      "Auditoria": {
        engagement: "Active",
        lastTouch: "Mar 16 · Slack + Gmail",
        teamVisibility: "Akash, Roi Shukrun",
        hasSignal: true,
        know: [
          "Website refresh underperforming: SDR reply rates sub-1% (benchmark: 5–8%), mid-funnel conversion 11% vs 32% plan.",
          "Forecast data discrepancy: historical pacing chart shows $623K delta vs Commit/Most Likely; Roi investigating with Equals tool.",
          "Workday partnership showing momentum — partial offset to GTM underperformance.",
          "Akash provided detailed rebuttal on KPI tracking methodology; raw data sources verified."
        ],
        action: [
          "[HOT] Root-cause SDR performance: website, messaging, or funnel design failure? Prevent Q1 guidance miss.",
          "Confirm Roi's forecast delta investigation timeline — when is Equals output expected?",
          "Assess whether Workday partnership can accelerate mid-funnel conversion or if GTM restructure needed in parallel."
        ]
      },
      "CloudZero": {
        engagement: "Active",
        lastTouch: "Mar 16 · Slack + Gmail + Granola",
        teamVisibility: "Akash, Scott Castle, Tushar, Don, Justin, Bill, Eric Weiss, Brady, Ari",
        hasSignal: true,
        know: [
          "Product momentum: End-to-end LLM telemetry pipeline built in 2 days (historical: 6 months); new AI pricing model (per API/inference call) projects NRR at 170% vs historical 120%.",
          "Org friction: Dual OKR platforms built independently (Kevin/Larry vs. Ari); resolved to consolidate on Ari's version by EOW. Rocky rollout, missed handoffs, after-action needed.",
          "GTM risk: Sales team may abandon core cloud cost intelligence for AI offerings; need concurrent selling strategy. Salesperson retention risk if shift is total.",
          "Leadership gap: Justin figurehead model + Scott president path not formally confirmed. Scott bi-weekly Boston travel at risk. Blake Brennan external CEO candidate in interviews; internal team concerned about morale.",
          "Red/yellow flags: Akbert (AI native initiative) = RED; ICP coverage = YELLOW. Brady/Scott attention needed.",
          "QGM confirmed: Scott + Tushar, Thursday Mar 19, 11:30am EDT."
        ],
        action: [
          "[HOT] Schedule in-person conversation with Justin on figurehead CEO role and Scott president path.",
          "[HOT] Run 20–30 min after-action on dual OKR builds; establish serial decision-making norms.",
          "[HOT] Have telemetry demo ready for Shutterstock (design partner) by week-end.",
          "Define concurrent selling strategy: cloud cost intelligence co-selling with AI pricing model.",
          "Brady/Scott to address Akbert (RED) and ICP coverage (YELLOW) before QGM Thursday.",
          "Discuss after-action learning culture with Bill/Scott/Eric/Justin."
        ]
      },
      "Delightree": {
        engagement: "Active",
        lastTouch: "Mar 16 · Slack + Gmail",
        teamVisibility: "Akash, Doug Gabbard, Xiaolei Cong",
        hasSignal: true,
        know: [
          "GTM audit completed; 5 workstreams launching Monday: RevOps, territory design, SDR compensation, CRM migration, forecasting.",
          "Hiring pipeline stalled: 4 candidates lost to competitors; multiple interview stages unscheduled. Dedicated admin/talent resource contracted to start late this week.",
          "Google Workspace setup in motion (expired activation link resent)."
        ],
        action: [
          "[HOT] Confirm dedicated talent resource start time + align on hiring pipeline recovery plan with Doug. Prevent further candidate slippage.",
          "Finalize 5 workstream kickoff materials for Monday launch.",
          "Doug to brief Akash on which interview stages are blocking; expedite scheduling."
        ]
      },
      "RightRev": {
        engagement: "Active",
        lastTouch: "Mar 16 · Slack + Granola",
        teamVisibility: "Akash, Dan (CFO/de facto COO), Joseph Marshall, Mitch Larson",
        hasSignal: true,
        know: [
          "CFO Dan functioning as de facto COO — engagement risk. 4-part sales process restructuring workshop planned with Akash.",
          "Market shift: RightRev positioning against AI for budget; NYC CFO conversations indicate buyers now prioritizing AI ROI. Traditional ROI metrics may not move the needle — need new high-ROI vendor framing.",
          "Joseph Marshall shared ICP account sourcing doc + sample pain outputs spreadsheet for Akash review.",
          "Mitch Larson (candidate) received challenge round materials via Betts Recruiting — in process."
        ],
        action: [
          "[HOT] Confirm attendance + prep for 4-part sales process restructuring workshop with Dan.",
          "Review Joseph Marshall's ICP sourcing + pain outputs docs to inform positioning refresh.",
          "Brief Dan on AI ROI positioning thread — does RightRev have an AI-native narrative or need to reframe ROI for AI buyer personas?"
        ]
      },
      "ClearML": {
        engagement: "Advisory",
        lastTouch: "Mar 16 · Gmail",
        teamVisibility: "Akash, Kevin Venturino, Alex Paquette",
        hasSignal: true,
        know: [
          "Kevin Venturino in take-home challenge for RevOps role; 48-hour turnaround in progress. Alex Paquette involved."
        ],
        action: [
          "Monitor Kevin's challenge completion — no Akash blocker currently identified."
        ]
      },
      "Sewer AI": {
        engagement: "Monitoring",
        lastTouch: "Mar 16 · Granola (stand-up)",
        teamVisibility: "Akash",
        hasSignal: false,
        noSignalMsg: "No material signals this cycle. MWF stand-up completed Mar 16 with no open items surfaced."
      },
      "X-Cures": {
        engagement: "Advisory",
        lastTouch: "Mar 16 · Slack",
        teamVisibility: "Akash",
        hasSignal: true,
        know: [
          "Portfolio close completed: $10M wire + $2.2M additional funds received.",
          "CRO search active via Gold Group recruiter.",
          "Sales hiring accelerating: 11 AEs expected by May."
        ],
        action: [
          "Monitor CRO search progress via Gold Group; follow up mid-cycle if needed."
        ]
      },
      _cross: [
        "Hiring as portfolio-wide bottleneck: Delightree (4 candidate losses, pipeline stalled), Innovius Athena (hire blocks Fund 2 scaling), ClearML (RevOps challenge in progress) — talent acquisition velocity is limiting execution across 3 companies simultaneously.",
        "CEO/leadership clarity gaps: CloudZero (Justin figurehead + Scott president path pending) and Innovius (Athena hire critical to Fund 2) both hinge on founder/exec clarity; both carry retention and strategic direction risk.",
        "GTM health divergence: Auditoria (SDR sub-1%, conversion 11% vs 32%) vs X-Cures ($12.2M close, 11 AEs by May) — execution variance widening. RightRev AI positioning challenge suggests broader market shift all GTM teams need to address.",
        "Parallel build friction: CloudZero (dual OKR systems) shows pattern of fast execution → missed handoffs → after-action required. Governance for architecture decisions needed.",
        "AI-native momentum accelerating: CloudZero telemetry pipeline (2 days vs 6 months), new AI pricing model (NRR 170% projected), Claude Code portfolio automation — tooling velocity high; infrastructure and auth layer risks if not operationalized properly."
      ]
    }
  ]
};