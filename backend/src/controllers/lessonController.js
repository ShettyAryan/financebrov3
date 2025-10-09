import { supabase, supabaseAdmin } from '../config/database.js';
import { sendSuccess, sendError, sendNotFound, getPaginationMeta } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Seed beginner lessons with structured content (concept, example, quiz)
 * Adds lessons only if table is empty or missing the specific titles.
 */
export const seedLessons = asyncHandler(async (req, res) => {
  // Define 6 beginner lessons in fundamental analysis with chunked content
  const lessonsToSeed = [
    {
      title: "What is Fundamental Analysis?",
      description:
        "Learn what fundamental analysis means and how it differs from other investing approaches.",
      category: "fundamental_analysis",
      xp_reward: 50,
      order_index: 1,
      is_unlocked_by_default: true,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Fundamental Analysis",
            body: "Fundamental analysis is the process of evaluating a company’s financial health, business model, and future potential to determine its true value. Unlike technical analysis, which focuses on stock price movements and charts, fundamental analysis focuses on the company itself — its profits, assets, management, and growth prospects.",
          },
          {
            type: "example",
            title: "Real-life Example",
            body: "Imagine you’re deciding between investing in Tata Motors and a small new electric vehicle startup. A fundamental analyst would study Tata Motors’ financial statements, past performance, and EV strategy to estimate if the company is undervalued or overvalued — rather than just looking at its stock chart.",
          },
          {
            type: "quiz",
            title: "Quiz: What is Fundamental Analysis?",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Which of the following best describes fundamental analysis?",
                options: [
                  "Studying stock price charts to predict short-term moves",
                  "Evaluating a company’s financial health and business fundamentals",
                  "Using AI to automate stock trades",
                  "Tracking investor emotions and sentiment",
                ],
                answer: 1,
                solution_explanation:
                  "Fundamental analysis looks at a company’s actual performance, finances, and prospects — not price charts or trading patterns.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "What is the main difference between fundamental and technical analysis?",
                options: [
                  "Fundamental focuses on company performance; technical focuses on price charts",
                  "Both study only past prices",
                  "Technical focuses on management quality",
                  "Fundamental focuses on investor emotions",
                ],
                answer: 0,
                solution_explanation:
                  "Fundamental analysis studies a company’s financials and value, while technical analysis studies market price trends and patterns.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "An investor studying Infosys’ profit growth, balance sheet, and management team is performing what type of analysis?",
                options: [
                  "Technical analysis",
                  "Fundamental analysis",
                  "Quantitative trading",
                ],
                answer: 1,
                solution_explanation:
                  "Reviewing company fundamentals like profit and management is a hallmark of fundamental analysis.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Why Analyze Companies?",
      description:
        "Understand why company performance affects stock price and how value differs from price.",
      category: "fundamental_analysis",
      xp_reward: 60,
      order_index: 2,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "The Link Between Company Performance & Stock Price",
            body: "Over time, a company’s stock price tends to follow its financial performance. When profits rise consistently, investor confidence grows, pushing the price higher. Conversely, poor results often lead to falling prices.",
          },
          {
            type: "example",
            title: "Real-life Example",
            body: "When Apple consistently launched innovative products and grew its profits, its stock price increased steadily. But when companies like Nokia or Blackberry lost market share and revenue, their stock prices dropped.",
          },
          {
            type: "quiz",
            title: "Quiz: Why Analyze Companies?",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Why does a company’s stock price usually rise when profits increase?",
                options: [
                  "Because traders follow rumors",
                  "Because higher profits often mean higher value and investor demand",
                  "Because the stock exchange forces prices up",
                  "Because interest rates always fall",
                ],
                answer: 1,
                solution_explanation:
                  "Growing profits suggest business strength, which attracts investors — increasing demand and price.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "According to Warren Buffett’s saying, which statement best describes the difference between value and price?",
                options: [
                  "Price is what you pay; value is what you get",
                  "Value is what you pay; price is what you get",
                  "Both mean the same thing",
                  "Price only matters for short-term trading",
                ],
                answer: 0,
                solution_explanation:
                  "Warren Buffett’s quote — 'Price is what you pay; value is what you get' — explains that market price and real worth are not always equal.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If a company’s intrinsic value is ₹500 per share but the market price is ₹400, what does this suggest?",
                options: [
                  "The stock is overvalued",
                  "The stock is undervalued",
                  "The stock is fairly priced",
                ],
                answer: 1,
                solution_explanation:
                  "If the true value exceeds the market price, the stock may be undervalued — a potential buying opportunity.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Types of Fundamental Analysis",
      description:
        "Learn the two main approaches to analyzing a company — qualitative and quantitative.",
      category: "fundamental_analysis",
      xp_reward: 70,
      order_index: 3,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Qualitative vs. Quantitative Analysis",
            body: "Fundamental analysis has two parts: qualitative (the non-numerical aspects like management quality, business model, and brand strength) and quantitative (numbers like revenue, profit, ratios, and valuation). Both together give a complete view of the company.",
          },
          {
            type: "example",
            title: "Real-life Example",
            body: "When evaluating Hindustan Unilever, qualitative factors include its trusted brand and management quality, while quantitative analysis involves studying financial ratios like profit margin and return on equity.",
          },
          {
            type: "quiz",
            title: "Quiz: Types of Fundamental Analysis",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which of the following is a qualitative factor?",
                options: [
                  "Debt-to-Equity Ratio",
                  "Revenue Growth",
                  "Brand Strength",
                  "Profit Margin",
                ],
                answer: 2,
                solution_explanation:
                  "Brand strength relates to how customers perceive a company — a non-numerical qualitative factor.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which of the following is a common quantitative metric used in fundamental analysis?",
                options: [
                  "Earnings Per Share (EPS)",
                  "Brand Loyalty",
                  "Management Integrity",
                  "Company Mission Statement",
                ],
                answer: 0,
                solution_explanation:
                  "Quantitative metrics are number-based (e.g., EPS, ROE, Profit Margin). EPS is a standard quantitative metric; the other options are qualitative.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "When an investor studies both a company’s financials and leadership team, they are performing:",
                options: [
                  "Only technical analysis",
                  "Only qualitative analysis",
                  "Both qualitative and quantitative analysis",
                ],
                answer: 2,
                solution_explanation:
                  "Combining both perspectives gives a more balanced view of the company’s true value.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Reading a Company’s Business Model",
      description:
        "Understand how a company makes money and sustains its operations.",
      category: "fundamental_analysis",
      xp_reward: 80,
      order_index: 4,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "What Is a Business Model?",
            body: "A business model explains how a company creates, delivers, and captures value. It shows what the company sells, to whom, and how it earns profit. Understanding this helps investors know if the business is sustainable and scalable.",
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: "Swiggy’s business model connects restaurants and customers through its app. It earns commissions from restaurants and delivery fees from users. Its success depends on efficient logistics and strong customer loyalty.",
          },
          {
            type: "quiz",
            title: "Quiz: Business Model Basics",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "What does a company’s business model primarily describe?",
                options: [
                  "Its daily stock price movement",
                  "How it makes and delivers value to customers",
                  "Only its financial ratios",
                  "The size of its competitor base",
                ],
                answer: 1,
                solution_explanation:
                  "A business model focuses on how a company earns money and delivers value, not on share prices or ratios.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Netflix’s main revenue model is based on what type of service?",
                options: [
                  "Advertising",
                  "Streaming subscriptions",
                  "Hardware sales",
                  "Ticket bookings",
                ],
                answer: 1,
                solution_explanation:
                  "Netflix earns revenue primarily through monthly streaming subscriptions paid by users.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If Zomato introduces grocery delivery to expand revenue sources, what business model change is this?",
                options: [
                  "Cost reduction",
                  "Diversification",
                  "Monopoly creation",
                ],
                answer: 1,
                solution_explanation:
                  "Adding grocery delivery diversifies revenue streams beyond restaurant orders.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Industry Life Cycle (Growth, Mature, Decline)",
      description:
        "Learn how industries evolve over time and how it affects company prospects.",
      category: "fundamental_analysis",
      xp_reward: 90,
      order_index: 5,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Industry Life Cycles",
            body: "Every industry passes through stages—introduction, growth, maturity, and decline. Knowing which stage an industry is in helps investors gauge potential risks and opportunities.",
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: "The smartphone industry saw rapid growth from 2007–2015 (growth phase). It’s now mature, with slower innovation. Meanwhile, the electric vehicle industry is in the growth stage, attracting heavy investment.",
          },
          {
            type: "quiz",
            title: "Quiz: Industry Life Cycle",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Which stage of an industry usually sees the highest competition and slower growth?",
                options: ["Introduction", "Growth", "Maturity", "Decline"],
                answer: 2,
                solution_explanation:
                  "In maturity, growth stabilizes and competitors fight for market share.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which of the following industries in India is currently in the growth phase?",
                options: [
                  "Coal mining",
                  "Electric vehicles (EVs)",
                  "Typewriter manufacturing",
                  "Landline telephony",
                ],
                answer: 1,
                solution_explanation:
                  "Electric vehicles, renewable energy, and fintech are in the rapid expansion or growth phase in India.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If an investor sees a sector with shrinking sales and new technology replacing it, which phase is it likely in?",
                options: ["Growth", "Maturity", "Decline"],
                answer: 2,
                solution_explanation:
                  "Falling sales and technological obsolescence signal the decline phase.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Competitive Advantage (Moat)",
      description:
        "Discover what gives a company long-term protection from competitors.",
      category: "fundamental_analysis",
      xp_reward: 100,
      order_index: 6,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "What Is a Moat?",
            body: "A moat is a company’s unique advantage that protects it from competitors—like a strong brand, patents, cost efficiency, or network effects. Firms with wide moats can sustain high profits longer.",
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: "Apple’s ecosystem (iPhone, Mac, Watch, services) creates a moat through brand loyalty and seamless integration. It’s hard for users to switch, keeping competitors at bay.",
          },
          {
            type: "quiz",
            title: "Quiz: Competitive Advantage",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which of the following is a strong competitive moat?",
                options: [
                  "High short-term advertising spend",
                  "Unique patented technology difficult to copy",
                  "Frequent CEO changes",
                  "Rising debt levels",
                ],
                answer: 1,
                solution_explanation:
                  "Patents prevent competitors from copying products, giving a durable competitive advantage.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A company with strong customer loyalty and brand recognition has which type of moat?",
                options: [
                  "Brand moat",
                  "Cost moat",
                  "Network moat",
                  "Geographic moat",
                ],
                answer: 0,
                solution_explanation:
                  "Customer trust and recognition create a **brand moat**, which keeps competitors away and maintains pricing power.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "Why is having a wide moat valuable for long-term investors?",
                options: [
                  "It ensures high short-term trading profits",
                  "It helps the company sustain profits and market share over time",
                  "It eliminates all business risk",
                ],
                answer: 1,
                solution_explanation:
                  "A wide moat helps maintain profitability even when markets fluctuate or competitors emerge.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Porter’s Five Forces",
      description: "Analyze industry competition using Porter’s framework.",
      category: "fundamental_analysis",
      xp_reward: 110,
      order_index: 7,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Porter’s Five Forces",
            body: "Michael Porter’s model identifies five factors shaping industry competition: (1) threat of new entrants, (2) threat of substitutes, (3) bargaining power of suppliers, (4) bargaining power of buyers, and (5) rivalry among existing competitors.",
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: "In the airline industry, intense rivalry and high supplier power (fuel, aircraft) make profits thin. In contrast, Google’s search business faces few substitutes and high entry barriers, strengthening its position.",
          },
          {
            type: "quiz",
            title: "Quiz: Porter’s Five Forces",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Which of the following is NOT part of Porter’s Five Forces?",
                options: [
                  "Threat of new entrants",
                  "Bargaining power of suppliers",
                  "Government regulation",
                  "Rivalry among competitors",
                ],
                answer: 2,
                solution_explanation:
                  "Government regulation affects industries but isn’t one of Porter’s five core forces.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "In which of the following industries is the threat of new entrants LOW due to high capital requirements?",
                options: [
                  "Airlines",
                  "Restaurants",
                  "Online tutoring",
                  "Retail clothing",
                ],
                answer: 0,
                solution_explanation:
                  "Airlines, oil refining, and telecom need massive investments in infrastructure — deterring new competitors.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If customers can easily switch to substitutes, what happens to industry profitability?",
                options: ["It increases", "It decreases", "It stays the same"],
                answer: 1,
                solution_explanation:
                  "When substitutes are easily available, customers switch quickly, pressuring prices and profits.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "The Income Statement",
      description:
        "Learn how revenue, expenses, and profit are reported and interpreted.",
      category: "fundamental_analysis",
      xp_reward: 120,
      order_index: 8,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "What Is an Income Statement?",
            body: [
              "The income statement (also called the Profit & Loss statement) shows performance over a period — usually a quarter or a year.",
              "",
              "It answers: *Did the company make a profit?*",
              "",
              "Key elements:",
              "• **Revenue (Sales)** – total money earned from goods/services.",
              "• **Cost of Goods Sold (COGS)** – direct costs of producing goods.",
              "• **Gross Profit = Revenue − COGS**.",
              "• **Operating Expenses** – salaries, rent, marketing, admin.",
              "• **Operating Profit (EBIT) = Gross Profit − Operating Expenses**.",
              "• **Net Income = Operating Profit − Interest − Taxes.**",
              "",
              "High profits signal efficiency; falling profits warn of cost or demand issues.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Example: Tata Consumer Products FY2024",
            body: [
              "• Revenue: ₹15,000 crore",
              "• COGS: ₹9,000 crore → Gross Profit = ₹6,000 crore",
              "• Operating Expenses: ₹3,000 crore → EBIT = ₹3,000 crore",
              "• Interest + Taxes: ₹1,000 crore → Net Income = ₹2,000 crore.",
              "",
              "This shows the company earns ₹2,000 crore after covering all costs — a profit margin of roughly 13 %.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Income Statement",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which statement correctly defines *Net Income*?",
                options: [
                  "Revenue minus COGS",
                  "Operating Profit minus Interest and Taxes",
                  "Total Assets minus Total Liabilities",
                  "Cash Inflow from Operations",
                ],
                answer: 1,
                solution_explanation:
                  "Net Income = Operating Profit − Interest − Taxes.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A company reports Revenue ₹800 cr, COGS ₹500 cr, Operating Expenses ₹200 cr, and Interest+Tax ₹50 cr. What is its Net Income?",
                options: ["₹50 cr", "₹100 cr", "₹150 cr", "₹200 cr"],
                answer: 0,
                solution_explanation:
                  "Net Income = 800 − 500 − 200 − 50 = ₹50 cr. It’s the profit after all costs and taxes are deducted.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If expenses grow faster than revenue, what happens to net profit?",
                options: ["Increases", "Decreases", "Unchanged"],
                answer: 1,
                solution_explanation:
                  "Higher costs without matching sales reduce profit → Net Income falls.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "The Balance Sheet",
      description:
        "Understand what a company owns, owes, and the net worth (equity).",
      category: "fundamental_analysis",
      xp_reward: 130,
      order_index: 9,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "What Is a Balance Sheet?",
            body: [
              "A balance sheet shows a company’s financial position *on a specific date*.",
              "",
              "**Formula:** Assets = Liabilities + Shareholders’ Equity.",
              "",
              "• **Assets** – resources owned (cash, buildings, equipment).",
              "• **Liabilities** – debts or obligations (loans, payables).",
              "• **Equity** – residual value for owners after debts are paid.",
              "",
              "It helps investors gauge financial stability and leverage.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Example: Maruti Suzuki Snapshot",
            body: [
              "Assets ₹80,000 cr; Liabilities ₹30,000 cr → Equity = ₹50,000 cr.",
              "Assets = 30,000 + 50,000 = 80,000 ✅ Balanced.",
              "Healthy because more equity funding and low debt keep risk moderate.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Balance Sheet",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which equation always holds true for a balance sheet?",
                options: [
                  "Assets = Liabilities − Equity",
                  "Assets = Liabilities + Equity",
                  "Revenue = Assets + Liabilities",
                  "Equity = Cash + Inventory",
                ],
                answer: 1,
                solution_explanation:
                  "Assets = Liabilities + Equity is the fundamental accounting rule.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "If a company has Assets worth ₹500 cr and Liabilities worth ₹320 cr, what is its Equity?",
                options: ["₹820 cr", "₹180 cr", "₹320 cr", "₹500 cr"],
                answer: 1,
                solution_explanation:
                  "Equity = Assets − Liabilities = 500 − 320 = ₹180 cr.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If a firm borrows ₹50 cr to buy machines, how are the balance-sheet totals affected?",
                options: [
                  "Assets ↑ Liabilities ↑ by ₹50 cr",
                  "Assets ↓ Equity ↑",
                  "Liabilities ↓ Cash ↑",
                ],
                answer: 0,
                solution_explanation:
                  "Borrowing adds both an asset (machine) and a liability (loan).",
              },
            ],
          },
        ],
      },
    },
    {
      title: "The Cash Flow Statement",
      description:
        "Track how cash moves in and out through operating, investing, and financing activities.",
      category: "fundamental_analysis",
      xp_reward: 140,
      order_index: 10,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Cash Flow",
            body: [
              "Profit ≠ Cash. A company can show profit yet have little cash if payments are delayed.",
              "",
              "The cash flow statement groups movements into:",
              "1. **Operating Activities** – cash from core business (sales − payments).",
              "2. **Investing Activities** – buying/selling assets or investments.",
              "3. **Financing Activities** – loans, dividends, share issues.",
              "",
              "**Free Cash Flow (FCF)** = Operating Cash Flow − Capital Expenditure. It shows cash left for dividends, debt repayment, or reinvestment.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Example: Reliance Industries",
            body: [
              "• Operating Cash Flow: ₹1,20,000 cr",
              "• Capital Expenditure: ₹70,000 cr → FCF = ₹50,000 cr",
              "• Financing Outflows: ₹30,000 cr (loans repayment)",
              "→ Ending Cash increased by ₹20,000 cr.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Cash Flow",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which activity involves buying new equipment?",
                options: [
                  "Operating Activity",
                  "Investing Activity",
                  "Financing Activity",
                ],
                answer: 1,
                solution_explanation:
                  "Buying assets like machinery or equipment is considered an investing activity.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A company reports Operating Cash Flow ₹400 cr and Capital Expenditure (CapEx) ₹250 cr. What is its Free Cash Flow?",
                options: ["₹150 cr", "₹250 cr", "₹400 cr", "₹650 cr"],
                answer: 0,
                solution_explanation:
                  "Free Cash Flow = Operating Cash Flow − CapEx = 400 − 250 = ₹150 cr.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If profits rise but operating cash flow falls, what could be the reason?",
                options: [
                  "Customers paying late / more credit sales",
                  "Company earning more cash upfront",
                  "Depreciation expense fell",
                ],
                answer: 0,
                solution_explanation:
                  "When receivables rise (customers pay later), cash flow drops even if profits look strong.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Linking the 3 Statements",
      description:
        "Understand how profit, cash, and assets connect to form a full financial picture.",
      category: "fundamental_analysis",
      xp_reward: 150,
      order_index: 11,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "How the 3 Statements Connect",
            body: [
              "All statements talk to each other:",
              "1. **Net Income** from the Income Statement flows to **Retained Earnings** on the Balance Sheet.",
              "2. **Cash Flow Statement** starts with that Net Income and adjusts for non-cash items (e.g., depreciation).",
              "3. The final cash balance from Cash Flow appears under **Assets → Cash** on the Balance Sheet.",
              "",
              "This linkage ensures accounting consistency — every profit or expense eventually affects cash or equity.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Example: HDFC Bank",
            body: [
              "• Income Statement: Net Profit ₹5,000 cr.",
              "• Balance Sheet: Retained Earnings increase by ₹5,000 cr (less any dividends).",
              "• Cash Flow: Starts with ₹5,000 cr Net Income; after adjustments, shows actual cash change of ₹4,800 cr.",
              "",
              "Thus, profit links to equity and cash together.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Linking Statements",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Which item from the income statement feeds into retained earnings on the balance sheet?",
                options: ["Revenue", "Net Income", "Operating Expense"],
                answer: 1,
                solution_explanation:
                  "Net Income from the income statement increases Retained Earnings in the balance sheet.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "When a company keeps its profits instead of paying dividends, which section of the balance sheet grows?",
                options: [
                  "Retained Earnings",
                  "Liabilities",
                  "Inventory",
                  "Accounts Payable",
                ],
                answer: 0,
                solution_explanation:
                  "Undistributed profits accumulate in the Equity section as Retained Earnings.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "Depreciation reduces profit but adds back to cash flow because:",
                options: [
                  "It is a non-cash expense",
                  "It involves cash payment for assets",
                  "It increases liabilities",
                ],
                answer: 0,
                solution_explanation:
                  "Depreciation lowers accounting profit but doesn’t reduce cash — so it’s added back in the cash flow statement.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Profitability Ratios",
      description:
        "Measure how efficiently a company turns sales and capital into profit.",
      category: "fundamental_analysis",
      xp_reward: 160,
      order_index: 12,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Profitability Ratios",
            body: [
              "Profitability ratios show how well a company converts revenue and capital into profit.",
              "",
              "Key ratios taught here:",
              "1) Gross Margin = (Revenue − Cost of Goods Sold) ÷ Revenue.",
              "   • What it tells you: How much profit is left after direct costs of making the product/service.",
              "   • Simple view: Higher gross margin ⇒ better basic product economics.",
              "",
              "2) Operating Margin = Operating Profit (EBIT) ÷ Revenue.",
              "   • What it tells you: Profitability after operating costs (salaries, rent, marketing) but before interest and taxes.",
              "   • Simple view: Shows core business efficiency.",
              "",
              "3) ROE (Return on Equity) = Net Income ÷ Shareholders’ Equity.",
              "   • What it tells you: How effectively the company uses owners’ money to generate profit.",
              "   • Simple view: Higher ROE (sustainably) ⇒ management is using equity efficiently.",
              "",
              "4) ROA (Return on Assets) = Net Income ÷ Total Assets.",
              "   • What it tells you: How efficiently the company uses all assets to generate profit.",
              "   • Simple view: Useful when comparing asset-heavy vs. asset-light businesses.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Style Example",
            body: [
              "Imagine a consumer electronics retailer (like a large electronics chain).",
              "• Revenue = ₹1,000 crore; COGS = ₹700 crore → Gross Margin = (1,000 − 700) ÷ 1,000 = 30%.",
              "• Operating expenses (salaries, rent, ads) bring Operating Profit (EBIT) to ₹150 crore → Operating Margin = 150 ÷ 1,000 = 15%.",
              "• Net Income = ₹100 crore; Shareholders’ Equity = ₹500 crore → ROE = 100 ÷ 500 = 20%.",
              "• Total Assets = ₹1,250 crore → ROA = 100 ÷ 1,250 = 8%.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Profitability Ratios",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which formula correctly defines Gross Margin?",
                options: [
                  "COGS ÷ Revenue",
                  "(Revenue − COGS) ÷ Revenue",
                  "Operating Profit ÷ Revenue",
                  "Net Income ÷ Equity",
                ],
                answer: 1,
                solution_explanation:
                  "Gross Margin focuses on profit after direct costs: (Revenue − COGS) ÷ Revenue.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A company reports Net Income ₹60 crore and Equity ₹300 crore. What is its Return on Equity (ROE)?",
                options: ["10%", "15%", "20%", "25%"],
                answer: 2,
                solution_explanation:
                  "ROE = Net Income ÷ Equity = 60 ÷ 300 = 0.20 = 20%. A higher ROE indicates more efficient use of shareholders’ capital.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "Revenue ₹800 crore; Operating Profit (EBIT) ₹96 crore. What is Operating Margin (%)?",
                options: ["10%", "12%", "15%"],
                answer: 1,
                solution_explanation:
                  "Operating Margin = EBIT ÷ Revenue = 96 ÷ 800 = 0.12 = 12%.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Liquidity Ratios",
      description:
        "Check a company’s ability to pay short-term bills without stress.",
      category: "fundamental_analysis",
      xp_reward: 170,
      order_index: 13,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Liquidity Ratios",
            body: [
              "Liquidity ratios show if a company can meet near-term obligations.",
              "",
              "1) Current Ratio = Current Assets ÷ Current Liabilities.",
              "   • What it tells you: Can the company cover short-term liabilities using all current assets?",
              "   • Rule of thumb: Around 1.5–2.0 is often comfortable (varies by industry).",
              "",
              "2) Quick Ratio (Acid-Test) = (Current Assets − Inventory) ÷ Current Liabilities.",
              "   • What it tells you: Can the company pay short-term liabilities using the most liquid assets (cash, receivables), excluding inventory?",
              "   • Why exclude inventory? It may take time to sell and convert to cash.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Style Example",
            body: [
              "Consider a retailer that holds stock (inventory):",
              "• Current Assets ₹600 crore (includes Inventory ₹200 crore); Current Liabilities ₹300 crore.",
              "• Current Ratio = 600 ÷ 300 = 2.0 → Looks comfortable.",
              "• Quick Ratio = (600 − 200) ÷ 300 = 400 ÷ 300 ≈ 1.33 → Still decent even after excluding inventory.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Liquidity Ratios",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which item is excluded from the Quick Ratio?",
                options: ["Cash", "Accounts Receivable", "Inventory"],
                answer: 2,
                solution_explanation:
                  "Quick Ratio removes inventory to focus on the most liquid assets.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A company has Current Assets of ₹450 crore and Current Liabilities of ₹225 crore. What is its Current Ratio?",
                options: ["1.0", "1.5", "2.0", "3.0"],
                answer: 2,
                solution_explanation:
                  "Current Ratio = Current Assets ÷ Current Liabilities = 450 ÷ 225 = 2.0. It shows the firm can pay off liabilities twice over.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "Current Assets ₹900 crore (Inventory ₹300 crore), Current Liabilities ₹600 crore. What is the Quick Ratio?",
                options: ["0.8", "1.0", "1.2"],
                answer: 1,
                solution_explanation:
                  "Quick Ratio = (900 − 300) ÷ 600 = 600 ÷ 600 = 1.0.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Solvency Ratios",
      description:
        "Assess long-term financial stability and debt-servicing ability.",
      category: "fundamental_analysis",
      xp_reward: 180,
      order_index: 14,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Solvency Ratios",
            body: [
              "Solvency ratios look at long-term financial health and debt capacity.",
              "",
              "1) Debt-to-Equity (D/E) = Total Debt ÷ Shareholders’ Equity.",
              "   • What it tells you: How leveraged the company is. Higher D/E ⇒ more debt relative to equity.",
              "   • Simple view: Too much debt can increase risk during downturns.",
              "",
              "2) Interest Coverage Ratio = EBIT ÷ Interest Expense.",
              "   • What it tells you: How comfortably a company can pay interest out of operating profit.",
              "   • Rule of thumb: Above ~3× is generally comfortable (varies by industry/cycle).",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Style Example",
            body: [
              "Suppose an industrial firm has Total Debt ₹1,200 crore and Equity ₹800 crore → D/E = 1,200 ÷ 800 = 1.5.",
              "EBIT ₹600 crore; Interest Expense ₹150 crore → Interest Coverage = 600 ÷ 150 = 4× (comfortable).",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Solvency Ratios",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Which ratio measures the ability to pay interest from operating profit?",
                options: [
                  "Debt-to-Equity",
                  "Interest Coverage",
                  "Current Ratio",
                ],
                answer: 1,
                solution_explanation:
                  "Interest Coverage = EBIT ÷ Interest Expense shows how easily a company can service its interest payments.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A company has Total Debt ₹900 crore and Equity ₹600 crore. What is its Debt-to-Equity (D/E) Ratio?",
                options: ["0.6", "1.0", "1.5", "2.0"],
                answer: 2,
                solution_explanation:
                  "D/E = 900 ÷ 600 = 1.5. This means the company has ₹1.50 of debt for every ₹1 of equity — moderate leverage.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "EBIT ₹240 crore; Interest Expense ₹80 crore. Interest Coverage = ?",
                options: ["2×", "3×", "4×"],
                answer: 1,
                solution_explanation:
                  "Interest Coverage = 240 ÷ 80 = 3.0× → the firm earns 3× its interest cost before taxes.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Efficiency Ratios",
      description:
        "See how effectively a company uses its inventory and assets to generate sales.",
      category: "fundamental_analysis",
      xp_reward: 190,
      order_index: 15,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Efficiency Ratios",
            body: [
              "Efficiency ratios show how well resources generate sales.",
              "",
              "1) Inventory Turnover = COGS ÷ Average Inventory.",
              "   • What it tells you: How many times inventory is sold and replaced during a period.",
              "   • Simple view: Higher turnover (for similar businesses) ⇒ faster movement, less stock sitting idle.",
              "",
              "2) Asset Turnover = Revenue ÷ Average Total Assets.",
              "   • What it tells you: How efficiently total assets generate sales.",
              "   • Simple view: Higher asset turnover (within the same industry) ⇒ assets are being used more efficiently.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Style Example",
            body: [
              "A grocery chain typically has fast-moving goods:",
              "• COGS ₹1,200 crore; Average Inventory ₹200 crore → Inventory Turnover = 1,200 ÷ 200 = 6× (stock turns six times a year).",
              "• Revenue ₹2,000 crore; Average Assets ₹1,000 crore → Asset Turnover = 2,000 ÷ 1,000 = 2×.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Efficiency Ratios",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which is the correct formula for Inventory Turnover?",
                options: [
                  "Revenue ÷ Average Inventory",
                  "COGS ÷ Average Inventory",
                  "COGS ÷ Average Assets",
                ],
                answer: 1,
                solution_explanation:
                  "Inventory Turnover uses COGS in the numerator: COGS ÷ Average Inventory.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A company reports Revenue ₹1,800 crore and Average Assets ₹900 crore. What is its Asset Turnover Ratio?",
                options: ["1.0", "1.5", "2.0", "2.5"],
                answer: 2,
                solution_explanation:
                  "Asset Turnover = Revenue ÷ Average Assets = 1,800 ÷ 900 = 2.0. This means the firm generates ₹2 of sales per ₹1 of assets.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "COGS ₹900 crore; Average Inventory ₹300 crore. Inventory Turnover = ?",
                options: ["2×", "3×", "4×"],
                answer: 1,
                solution_explanation:
                  "Inventory Turnover = 900 ÷ 300 = 3×, showing inventory is sold and replaced three times a year.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Price vs. Value",
      description:
        "Learn the crucial difference between what a stock costs and what it’s really worth.",
      category: "fundamental_analysis",
      xp_reward: 160,
      order_index: 16,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Price vs. Value",
            body: [
              "Price is simply what the market is currently willing to pay for a share.",
              "Value (often called intrinsic value) is what the business is actually worth based on earnings power, assets, and future potential.",
              "",
              "A share can be:",
              "• **Undervalued** → Market price below intrinsic value → possible buy.",
              "• **Overvalued** → Market price above intrinsic value → caution or sell.",
              "",
              "Warren Buffett’s rule: *“Price is what you pay; value is what you get.”*",
              "Short-term price = opinion; long-term value = fundamentals.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "Suppose Company A’s true worth (based on earnings) is ₹500 per share, but it’s trading at ₹400.",
              "It’s likely **undervalued** — the market hasn’t fully recognized its strength.",
              "Conversely, a fashionable stock trading at ₹1,000 with weak profits may be **overvalued**.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Price vs. Value",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "If a company’s intrinsic value is ₹600 and its market price is ₹450, the stock is:",
                options: ["Overvalued", "Undervalued", "Fairly valued"],
                answer: 1,
                solution_explanation:
                  "When Market Price < Intrinsic Value, the stock is undervalued — a potential buying opportunity.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A stock’s intrinsic value is ₹900, and its market price is ₹1,200. By roughly what percentage is it overvalued?",
                options: ["10%", "20%", "30%", "40%"],
                answer: 2,
                solution_explanation:
                  "Overvalued % = (1,200 − 900) ÷ 900 × 100 = 33% (≈ 30%). The market price is one-third higher than its estimated value.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt: "Which best explains why prices differ from value?",
                options: [
                  "Investor emotions and market sentiment",
                  "Companies miscalculate profits",
                  "Accounting rules change daily",
                ],
                answer: 0,
                solution_explanation:
                  "Markets move on short-term emotions like fear and greed, while intrinsic value depends on long-term business performance.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Valuation Multiples (P/E, P/B, EV/EBITDA)",
      description:
        "Use common ratios to compare price to earnings, book value, and operating profits.",
      category: "fundamental_analysis",
      xp_reward: 170,
      order_index: 17,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Key Valuation Multiples Explained",
            body: [
              "**1. Price-to-Earnings (P/E)** = Share Price ÷ Earnings per Share (EPS)",
              " • Shows how much investors pay for ₹1 of earnings.",
              " • High P/E → growth expectations; Low P/E → cheap or risky.",
              "",
              "**2. Price-to-Book (P/B)** = Share Price ÷ Book Value per Share",
              " • Book Value ≈ Net assets (assets − liabilities).",
              " • Useful for asset-heavy businesses like banks.",
              "",
              "**3. Enterprise Value to EBITDA (EV/EBITDA)** = ( Market Cap + Debt − Cash ) ÷ EBITDA",
              " • Compares total business value to operating profit.",
              " • Preferred when companies have different debt levels.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Example: Comparing Two Companies",
            body: [
              "Company X: Price ₹200, EPS ₹10 → P/E = 20×.",
              "Company Y: Price ₹150, EPS ₹10 → P/E = 15× → cheaper per earnings.",
              "A bank trading at P/B = 1.0 is valued at its book value — reasonable if assets are sound.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Valuation Multiples",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Which multiple best compares companies with different debt levels?",
                options: ["P/E", "P/B", "EV/EBITDA"],
                answer: 2,
                solution_explanation:
                  "EV/EBITDA includes both debt and cash, making it ideal for comparing firms with different leverage levels.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "If a stock trades at ₹240 and its Earnings Per Share (EPS) is ₹12, what is its P/E ratio?",
                options: ["10×", "15×", "20×", "25×"],
                answer: 2,
                solution_explanation:
                  "P/E = Price ÷ EPS = 240 ÷ 12 = 20×. This means investors pay ₹20 for every ₹1 of earnings.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt: "A low P/B (< 1) can indicate what?",
                options: [
                  "The stock may be undervalued or assets are weak",
                  "High future growth",
                  "Strong brand premium",
                ],
                answer: 0,
                solution_explanation:
                  "A P/B below 1 suggests the market values the company less than its book value — it could be undervalued or facing business issues.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Discounted Cash Flow (DCF) Basics",
      description:
        "Estimate intrinsic value by projecting future cash flows and discounting them to today.",
      category: "fundamental_analysis",
      xp_reward: 180,
      order_index: 18,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding DCF",
            body: [
              "DCF (Discounted Cash Flow) values a company based on expected future cash flows brought to present value.",
              "",
              "**Steps:**",
              "1. Estimate future Free Cash Flows (FCF) for 5–10 years.",
              "2. Choose a discount rate (usually the required rate of return or WACC).",
              "3. Discount each year’s FCF to present value using PV = FCF ÷ (1 + r)^n.",
              "4. Add up all PV + Terminal Value → Intrinsic Value.",
              "",
              "If this value > market price → stock may be undervalued.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Simple DCF Illustration",
            body: [
              "Company projects FCF ₹100 cr per year for 5 years.",
              "Discount rate = 10%. PV ≈ ₹379 cr.",
              "Add terminal value ₹600 cr → Total ≈ ₹979 cr ≈ company’s intrinsic value.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: DCF Basics",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "The DCF method values a company based on what?",
                options: [
                  "Past profits",
                  "Future cash flows discounted to present value",
                  "Market trends and sentiment",
                ],
                answer: 1,
                solution_explanation:
                  "DCF (Discounted Cash Flow) values a company by estimating future cash flows and discounting them to present value.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "If next year’s Free Cash Flow (FCF) is ₹110 crore and the discount rate is 10%, what is the approximate Present Value (PV)?",
                options: ["₹90 cr", "₹100 cr", "₹110 cr", "₹121 cr"],
                answer: 1,
                solution_explanation:
                  "PV = 110 ÷ (1 + 0.10) = ₹100 crore (approx). A higher discount rate would lower this value further.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt: "Higher discount rate does what to present value?",
                options: ["Increases PV", "Decreases PV", "No effect"],
                answer: 1,
                solution_explanation:
                  "Higher required return (discount rate) reduces the present value of future cash flows.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Relative vs. Absolute Valuation",
      description: "Understand the two main approaches to valuing a company.",
      category: "fundamental_analysis",
      xp_reward: 190,
      order_index: 19,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Two Valuation Approaches",
            body: [
              "**Relative Valuation:**",
              " • Compares a company to peers using multiples (P/E, P/B, EV/EBITDA).",
              " • Fast and useful for market comparison.",
              "",
              "**Absolute Valuation:**",
              " • Finds intrinsic value using DCF or asset-based methods.",
              " • Independent of market prices.",
              "",
              "**Example:** A stock with P/E of 15 vs industry 20 may look cheap (relatively), but if its cash flows are weak, absolute valuation might show it’s fairly priced.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Comparison",
            body: [
              "Infosys vs TCS: Both IT giants operate similarly.",
              "• Relative: Compare P/E ratios (Infosys 25×, TCS 30×).",
              "• Absolute: Run DCF for each based on cash flows to estimate true worth.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Valuation Approaches",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Relative valuation compares a company to what?",
                options: [
                  "Its own past profits",
                  "Peer companies using ratios",
                  "Government bonds",
                ],
                answer: 1,
                solution_explanation:
                  "Relative valuation benchmarks a company against similar peers using ratios like P/E or P/B.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which of the following is an example of an absolute valuation method?",
                options: [
                  "Price-to-Earnings (P/E)",
                  "Enterprise Value to EBITDA (EV/EBITDA)",
                  "Discounted Cash Flow (DCF)",
                  "Price-to-Book (P/B)",
                ],
                answer: 2,
                solution_explanation:
                  "Absolute valuation determines intrinsic value from fundamentals, e.g., through Discounted Cash Flow (DCF) or asset-based valuation.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt: "Which is faster but more market-dependent?",
                options: [
                  "Relative valuation",
                  "Absolute valuation",
                  "Both same speed",
                ],
                answer: 0,
                solution_explanation:
                  "Relative valuation relies on market multiples, making it quick but sensitive to market sentiment and fluctuations.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Management Quality & Corporate Governance",
      description:
        "Learn how strong leadership and transparent governance drive sustainable growth.",
      category: "fundamental_analysis",
      xp_reward: 200,
      order_index: 20,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Why Management & Governance Matter",
            body: [
              "Even profitable businesses can fail if leadership is weak or unethical.",
              "Good management makes strategic decisions, allocates capital wisely, and maintains integrity.",
              "",
              "**Key points:**",
              "• **Management Quality** → leadership vision, experience, and decision-making consistency.",
              "• **Corporate Governance** → rules and systems ensuring accountability and fairness.",
              "• Transparent reporting, independent boards, and ethical practices protect shareholders.",
              "",
              "Strong governance builds trust; poor governance often leads to fraud or scandals.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "Infosys has long been respected for its transparent accounting and ethical culture — investors trust its leadership.",
              "In contrast, companies involved in financial scandals (like Satyam in 2009) show how poor governance can destroy value overnight.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Management & Governance",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which of these signals strong corporate governance?",
                options: [
                  "Frequent accounting restatements",
                  "Transparent disclosures and independent board",
                  "Hidden related-party transactions",
                ],
                answer: 1,
                solution_explanation:
                  "Good governance relies on transparency, independence, and fairness to protect shareholders and maintain trust.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Good management primarily focuses on creating long-term ______ for shareholders.",
                options: ["Profits", "Value", "Debt", "Stock volatility"],
                answer: 1,
                solution_explanation:
                  "Strong management aims to build sustainable long-term **value** for shareholders rather than chasing short-term stock movements.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "Why is corporate governance especially critical for listed companies?",
                options: [
                  "Because retail investors can directly run the business",
                  "Because public shareholders rely on management transparency",
                  "Because auditors handle all management duties",
                ],
                answer: 1,
                solution_explanation:
                  "Public investors cannot oversee daily operations, so they rely on management honesty, transparency, and accountability.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Brand Value & Moat Deep Dive",
      description:
        "Understand how strong brands and durable advantages protect profits over time.",
      category: "fundamental_analysis",
      xp_reward: 210,
      order_index: 21,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "What Builds Brand Value and Moats",
            body: [
              "A brand is more than a logo — it’s the trust customers place in a company.",
              "Brands with high recall and loyalty can charge premium prices and face less competition.",
              "",
              "**Types of Moats:**",
              "• **Brand Moat:** Consumer preference due to reputation (Apple, HUL).",
              "• **Cost Moat:** Lowest production or delivery costs (D-Mart).",
              "• **Network Moat:** More users → more value (Amazon, Flipkart).",
              "• **Switching-Cost Moat:** Hard for users to leave (Microsoft Office).",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "Apple customers stay loyal because of product quality and ecosystem integration.",
              "In India, HUL’s Dove and Surf Excel maintain dominance through consistent brand trust built over decades.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Brand & Moats",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "A 'network moat' usually means:",
                options: [
                  "The company owns many factories",
                  "The product becomes more valuable as more people use it",
                  "The company avoids using debt",
                ],
                answer: 1,
                solution_explanation:
                  "In a network moat, each new user adds value for others, strengthening the company's dominance.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which of the following Indian companies is best known for strong brand loyalty?",
                options: [
                  "Hindustan Unilever (HUL)",
                  "Oil and Natural Gas Corporation (ONGC)",
                  "Indian Railways",
                  "Power Grid Corporation",
                ],
                answer: 0,
                solution_explanation:
                  "Hindustan Unilever (HUL) has built iconic brands like Surf Excel and Dove, earning decades of consumer trust and loyalty.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "Why does a strong brand often allow higher profit margins?",
                options: [
                  "Because it reduces raw-material costs",
                  "Because loyal customers pay premium prices",
                  "Because it avoids taxes",
                ],
                answer: 1,
                solution_explanation:
                  "Brand trust enables premium pricing and consistent demand, resulting in higher profit margins.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Regulatory and Macro Factors",
      description:
        "See how government policy and the wider economy shape business performance.",
      category: "fundamental_analysis",
      xp_reward: 220,
      order_index: 22,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding External Influences",
            body: [
              "Companies don’t operate in isolation — regulation and macroeconomics can change outcomes dramatically.",
              "",
              "**Regulatory Factors:**",
              "• Taxes, import/export rules, labor laws, environmental standards.",
              "• Sudden regulation shifts can help or hurt profits.",
              "",
              "**Macro Factors:**",
              "• GDP growth, inflation, interest rates, currency strength.",
              "• High interest rates can raise borrowing costs; inflation erodes margins; strong GDP growth boosts demand.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "In 2016, India’s demonetization impacted cash-based businesses but boosted digital payment firms like Paytm.",
              "Recently, EV subsidies supported the electric-vehicle industry’s rapid growth.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Regulatory & Macro Factors",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "An increase in interest rates generally makes borrowing:",
                options: ["Cheaper", "Costlier", "Unchanged"],
                answer: 1,
                solution_explanation:
                  "Higher interest rates increase loan costs and can reduce company expansion plans.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which government action can positively impact renewable-energy companies?",
                options: [
                  "Higher import duties on solar panels",
                  "Subsidies or tax incentives",
                  "Increased fuel taxes",
                  "Interest rate hikes",
                ],
                answer: 1,
                solution_explanation:
                  "Government subsidies or tax breaks encourage investment and growth in renewable-energy sectors like solar and wind.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If inflation rises sharply, how might that affect most companies?",
                options: [
                  "Input costs increase and margins may shrink",
                  "Revenues automatically rise faster than costs",
                  "It has no effect on business",
                ],
                answer: 0,
                solution_explanation:
                  "Higher inflation raises input prices, squeezing profits unless companies can pass costs to customers.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Red Flags (Fraud, Aggressive Accounting, Poor Governance)",
      description:
        "Spot warning signs that indicate risk or unethical practices in a company.",
      category: "fundamental_analysis",
      xp_reward: 230,
      order_index: 23,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Recognizing Red Flags",
            body: [
              "Red flags are signals that a company’s reported numbers or behavior might be misleading.",
              "",
              "**Common Red Flags:**",
              "1. **Frequent restatements** of financial results.",
              "2. **Unusually high receivables** compared to sales (possible fake revenues).",
              "3. **Rapidly rising debt** without clear reason.",
              "4. **Management changing auditors** often or giving vague disclosures.",
              "5. **Aggressive accounting** — booking income early or delaying expenses.",
              "6. **Insider selling** — promoters reducing stake before bad news.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "Satyam Computers (2009) inflated profits for years before admitting fraud — wiping out investor wealth.",
              "Learning to detect these red flags helps investors exit before trouble surfaces.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Red Flags",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "A sudden jump in receivables while sales stay flat may mean:",
                options: [
                  "Customers are paying faster",
                  "Revenue may be overstated",
                  "Company reduced prices",
                ],
                answer: 1,
                solution_explanation:
                  "Rising receivables without matching sales often indicate fake or delayed collections — a possible sign of manipulation.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which of the following behaviors might signal poor corporate governance?",
                options: [
                  "Frequent auditor changes",
                  "Consistent dividend payouts",
                  "Transparent financial disclosures",
                  "Independent board oversight",
                ],
                answer: 0,
                solution_explanation:
                  "Frequent auditor changes may suggest management is avoiding scrutiny or hiding irregularities — a classic governance red flag.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt: "Why are red flags important for investors to monitor?",
                options: [
                  "They guarantee higher returns",
                  "They help detect potential frauds early",
                  "They show good brand value",
                ],
                answer: 1,
                solution_explanation:
                  "Spotting red flags early helps investors avoid risky or dishonest companies before major financial losses occur.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Economic Indicators (GDP, Inflation, Interest Rates)",
      description:
        "Learn how key economic indicators affect businesses and stock performance.",
      category: "fundamental_analysis",
      xp_reward: 240,
      order_index: 24,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Economic Indicators",
            body: [
              "Economic indicators show the health and direction of a country’s economy.",
              "They influence company performance, investor confidence, and stock prices.",
              "",
              "**Main Indicators:**",
              "• **GDP (Gross Domestic Product):** Total value of goods and services produced. High GDP growth → strong economy → higher corporate earnings.",
              "• **Inflation:** Measures how fast prices of goods and services are rising. Moderate inflation (2–5%) is healthy; too high reduces purchasing power.",
              "• **Interest Rates:** Set by central banks (e.g., RBI). Higher rates make loans expensive, slowing spending and growth; lower rates boost borrowing and investment.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "When India’s GDP growth hit 8%, sectors like banking and consumer goods thrived due to rising demand.",
              "Conversely, in 2020 when rates were cut to historic lows, borrowing became cheaper — boosting housing and auto sales.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Economic Indicators",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "High interest rates usually have what effect on company borrowing?",
                options: [
                  "Make borrowing cheaper",
                  "Make borrowing more expensive",
                  "No effect",
                ],
                answer: 1,
                solution_explanation:
                  "Higher interest rates increase borrowing costs, often slowing expansion and investment.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "If inflation rises sharply, what usually happens to people’s purchasing power?",
                options: [
                  "It increases",
                  "It decreases",
                  "It remains the same",
                  "It depends on GDP",
                ],
                answer: 1,
                solution_explanation:
                  "When prices rise faster than incomes, purchasing power falls — people can buy fewer goods with the same money.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If GDP grows steadily year after year, what does it usually indicate?",
                options: [
                  "Economic expansion and rising corporate profits",
                  "High unemployment",
                  "Falling consumer spending",
                ],
                answer: 0,
                solution_explanation:
                  "Consistent GDP growth reflects a strong, expanding economy where companies and jobs typically grow.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Cyclical vs. Defensive Sectors",
      description:
        "Differentiate between industries that rise and fall with the economy and those that stay steady.",
      category: "fundamental_analysis",
      xp_reward: 250,
      order_index: 25,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Understanding Sector Types",
            body: [
              "Industries react differently to economic cycles.",
              "",
              "**Cyclical Sectors:**",
              "• Their performance depends heavily on economic growth.",
              "• Examples: Automobiles, Real Estate, Hotels, Metals.",
              "• Sales rise in booms and drop in slowdowns.",
              "",
              "**Defensive Sectors:**",
              "• Demand stays stable regardless of the economy.",
              "• Examples: FMCG, Healthcare, Utilities.",
              "• People still buy essentials and medicines even during recessions.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "During the 2020 pandemic slowdown, FMCG firms like HUL and ITC performed steadily (defensive).",
              "In contrast, auto and real estate sales fell sharply (cyclical).",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Sector Cyclicality",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Which of the following is a defensive sector?",
                options: ["Automobiles", "Hotels", "FMCG"],
                answer: 2,
                solution_explanation:
                  "FMCG (Fast-Moving Consumer Goods) is defensive because people continue buying essential goods even during downturns.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which of the following is an example of a cyclical sector?",
                options: ["Automobile", "Pharmaceuticals", "Utilities", "FMCG"],
                answer: 0,
                solution_explanation:
                  "Automobiles, real estate, and luxury goods are cyclical — their sales rise in booms and drop during recessions.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If the economy enters a downturn, which sector tends to hold up better?",
                options: [
                  "Cyclical sectors",
                  "Defensive sectors",
                  "Commodity sectors",
                ],
                answer: 1,
                solution_explanation:
                  "Defensive sectors like FMCG and healthcare maintain demand even in economic slowdowns, offering stability to investors.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Impact of Global Events (Oil, Trade Wars, Rates)",
      description:
        "Understand how international events ripple through markets and industries.",
      category: "fundamental_analysis",
      xp_reward: 260,
      order_index: 26,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Global Events and Their Influence",
            body: [
              "In a globalized world, events abroad can affect local markets too.",
              "",
              "**Common Global Influences:**",
              "• **Oil Prices:** High oil prices raise transport and manufacturing costs; good for oil producers, bad for airlines and logistics.",
              "• **Trade Wars:** Tariffs between nations increase input costs, hurt exporters, and slow global trade.",
              "• **Interest Rate Moves by the US Federal Reserve:** Higher US rates attract global capital to the US, weakening emerging-market currencies.",
              "",
              "Investors must track these global signals as they can move stock prices even without company-specific news.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "When oil prices rose above $100 in 2022, airline companies saw profits fall, while energy firms gained.",
              "During the US-China trade war, many Indian exporters benefited as global buyers diversified supply chains.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Global Impacts",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "High crude oil prices usually hurt which industry the most?",
                options: ["Oil exploration", "Airlines", "Energy producers"],
                answer: 1,
                solution_explanation:
                  "Airlines’ fuel expenses rise sharply when crude oil prices increase, reducing profit margins.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "When the US Federal Reserve raises interest rates, what usually happens to emerging market currencies?",
                options: [
                  "They strengthen",
                  "They weaken",
                  "They remain stable",
                  "They appreciate temporarily",
                ],
                answer: 1,
                solution_explanation:
                  "Higher US rates attract global capital toward the US, reducing demand for emerging market currencies — causing them to weaken.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt: "A trade war between two major economies can lead to:",
                options: [
                  "Lower global trade and higher tariffs",
                  "Increased exports everywhere",
                  "Stable international relations",
                ],
                answer: 0,
                solution_explanation:
                  "Trade wars disrupt supply chains and reduce global trade volumes due to higher tariffs and uncertainty.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "The Investment Checklist",
      description:
        "Learn how to systematically evaluate a company before investing.",
      category: "fundamental_analysis",
      xp_reward: 270,
      order_index: 27,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Building an Investment Checklist",
            body: [
              "Before investing, it’s crucial to analyze a company from multiple angles — financial, qualitative, and macro.",
              "",
              "**Key items in a good checklist:**",
              "1. **Business Model:** Do you understand how the company earns money?",
              "2. **Industry Position:** Is it a market leader or a small player?",
              "3. **Financial Health:** Check profitability, debt, and cash flow trends.",
              "4. **Valuation:** Is the stock priced below its intrinsic value?",
              "5. **Management Quality:** Is leadership transparent and consistent?",
              "6. **Growth Drivers:** Are there future catalysts (new products, markets)?",
              "7. **Risks:** What could go wrong (competition, regulation, disruption)?",
              "",
              "A structured checklist reduces emotional decisions and helps you stay objective.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Example: Applying a Checklist to HDFC Bank",
            body: [
              "• Business Model: Retail & corporate banking – stable and proven.",
              "• Financials: Consistent ROE ~17–18%, strong profits.",
              "• Valuation: Reasonable P/E compared to peers.",
              "• Management: Known for disciplined lending and transparency.",
              "→ Verdict: Fits long-term quality investment profile.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Investment Checklist",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "Which of the following is NOT part of a good investment checklist?",
                options: [
                  "Understanding how the company earns money",
                  "Checking management integrity",
                  "Predicting exact daily stock prices",
                ],
                answer: 2,
                solution_explanation:
                  "No one can reliably predict daily stock prices — investing focuses on long-term fundamentals.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "A good investment checklist helps reduce ______ decisions and maintain discipline.",
                options: ["Emotional", "Financial", "Technical", "Legal"],
                answer: 0,
                solution_explanation:
                  "Checklists reduce emotional decisions — preventing fear or greed from influencing investment choices.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "Which of these checklist points directly tests financial strength?",
                options: [
                  "Debt-to-Equity and Cash Flow Analysis",
                  "Management Reputation",
                  "Customer Reviews",
                ],
                answer: 0,
                solution_explanation:
                  "Debt-to-Equity and Cash Flow ratios reveal a company's ability to manage obligations and sustain operations.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Case Study: Analyzing Apple, Tesla, or a Local Company",
      description:
        "See how fundamental analysis works step-by-step on a real business.",
      category: "fundamental_analysis",
      xp_reward: 280,
      order_index: 28,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Conducting a Case Study",
            body: [
              "The best way to learn investing is to apply the framework to a real company.",
              "We’ll use Apple as an example — you can do the same for any Indian stock like Infosys, TCS, or Maruti.",
              "",
              "**Steps to Analyze:**",
              "1. **Business Understanding:** Apple sells hardware + services (iPhone, Mac, iCloud).",
              "2. **Financials:** Revenue and profit growth have been steady; strong cash flows.",
              "3. **Moat:** Brand loyalty + ecosystem lock-in.",
              "4. **Valuation:** P/E ~25–30×; justified by growth & profitability.",
              "5. **Risks:** Supply-chain dependency, regulation, global competition.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Exercise: Apply This Yourself",
            body: [
              "Pick one company you know — for example, Titan, Zomato, or Asian Paints.",
              "• Read its annual report (financials + management discussion).",
              "• Identify revenue growth, debt, margins, and cash flow trends.",
              "• Check P/E vs peers and note qualitative strengths like brand or customer trust.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Case Study Application",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Apple’s main moat comes from which factor?",
                options: [
                  "Commodity pricing",
                  "Strong ecosystem and brand loyalty",
                  "Dependence on one product only",
                ],
                answer: 1,
                solution_explanation:
                  "Apple’s ecosystem of devices, software, and services creates strong customer loyalty and pricing power.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Which of the following is a major risk that even a great company like Apple can face?",
                options: [
                  "Supply chain disruption",
                  "Too much customer loyalty",
                  "Falling inflation",
                  "Lack of brand awareness",
                ],
                answer: 0,
                solution_explanation:
                  "Even strong companies face risks like supply chain disruptions, regulatory challenges, or shifting consumer demand.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If an investor finds a company with a strong moat, rising profits, and fair valuation, the likely action is:",
                options: [
                  "Consider it for long-term investment",
                  "Avoid it completely",
                  "Short-sell it",
                ],
                answer: 0,
                solution_explanation:
                  "When a company has sustainable advantages and fair pricing, it often signals a good long-term investment opportunity.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Margin of Safety",
      description:
        "Understand how buying below intrinsic value reduces investment risk.",
      category: "fundamental_analysis",
      xp_reward: 290,
      order_index: 29,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "What Is Margin of Safety?",
            body: [
              "Coined by Benjamin Graham, the margin of safety means buying a stock significantly below its estimated intrinsic value.",
              "",
              "**Why it matters:**",
              "• It provides a cushion against analysis errors or unforeseen events.",
              "• The bigger the margin, the safer the investment.",
              "",
              "**Formula:**",
              "Margin of Safety (%) = (Intrinsic Value − Market Price) ÷ Intrinsic Value × 100.",
              "",
              "For example, if value = ₹500 and price = ₹400, Margin = (500−400)/500 = 20%.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Real-Life Example",
            body: [
              "Investor finds a stock worth ₹1,000 (based on DCF) trading at ₹700.",
              "Margin of Safety = (1,000−700)/1,000 = 30%.",
              "Even if intrinsic value estimate is slightly off, the investor still has a buffer.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Margin of Safety",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt:
                  "The concept of 'margin of safety' mainly helps investors:",
                options: [
                  "Take more risk",
                  "Reduce downside risk and build protection",
                  "Speculate on price moves",
                ],
                answer: 1,
                solution_explanation:
                  "Buying below intrinsic value creates a safety cushion against estimation errors or market volatility.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "If a stock’s intrinsic value is ₹600 and its market price is ₹480, what is the Margin of Safety (%)?",
                options: ["10%", "15%", "20%", "25%"],
                answer: 2,
                solution_explanation:
                  "Margin of Safety = (Intrinsic Value − Market Price) ÷ Intrinsic Value × 100 = (600 − 480) ÷ 600 × 100 = 20%.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "If an investor pays exactly the intrinsic value of a stock, what is the margin of safety?",
                options: ["Zero", "Ten percent", "Infinite"],
                answer: 0,
                solution_explanation:
                  "Paying intrinsic value means there’s no discount — hence, no margin of safety or buffer against mistakes.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Building a Watchlist & Tracking Investments",
      description:
        "Learn how to monitor stocks and stay disciplined after investing.",
      category: "fundamental_analysis",
      xp_reward: 300,
      order_index: 30,
      is_unlocked_by_default: false,
      content: {
        sections: [
          {
            type: "concept",
            title: "Creating and Managing a Watchlist",
            body: [
              "A watchlist helps investors stay ready for opportunities without impulsive buying.",
              "",
              "**How to Build It:**",
              "• Identify quality companies you understand.",
              "• Record key metrics: P/E, ROE, Debt, Cash Flow, Intrinsic Value.",
              "• Set a 'target buy price' — often below fair value for a margin of safety.",
              "",
              "**Tracking Investments:**",
              "• Review quarterly results and annual reports.",
              "• Track management commentary and new developments.",
              "• Avoid reacting to short-term volatility — focus on fundamentals.",
            ].join("\n"),
          },
          {
            type: "example",
            title: "Example: Personal Watchlist",
            body: [
              "An investor tracks 5 companies: HDFC Bank, Infosys, Titan, Maruti, and NTPC.",
              "They note valuations, growth rates, and keep alerts when any trade below fair price.",
              "This disciplined approach prevents FOMO and ensures buying quality at value.",
            ].join("\n"),
          },
          {
            type: "quiz",
            title: "Quiz: Watchlist & Tracking",
            questions: [
              {
                id: "q1",
                format: "mcq",
                prompt: "Why maintain a stock watchlist?",
                options: [
                  "To chase every market rally",
                  "To monitor good companies and buy at the right price",
                  "To avoid fundamental analysis",
                ],
                answer: 1,
                solution_explanation:
                  "A watchlist helps investors track quality companies and act when prices fall to attractive levels — promoting patience and discipline.",
              },
              {
                id: "q2",
                format: "mcq",
                prompt:
                  "Long-term investors should focus on company ______, not short-term price movements.",
                options: [
                  "Headlines",
                  "Fundamentals",
                  "Rumors",
                  "Market gossip",
                ],
                answer: 1,
                solution_explanation:
                  "Focusing on fundamentals — profits, management, cash flow — keeps decisions rational and long-term oriented.",
              },
              {
                id: "q3",
                format: "mixed",
                prompt:
                  "After buying a stock, how often should you ideally review its performance?",
                options: [
                  "Every few hours",
                  "Quarterly or after major announcements",
                  "Never review again",
                ],
                answer: 1,
                solution_explanation:
                  "Quarterly or event-based reviews help investors stay informed without emotional overtrading or panic selling.",
              },
            ],
          },
        ],
      },
    },
  ];

  // Check existing lessons by title
  const titles = lessonsToSeed.map(l => l.title);
  // Use admin client to bypass RLS for seed operations
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('lessons')
    .select('id, title');

  if (existingError) {
    console.error('Seed check error:', existingError);
    return sendError(res, 'Failed to check existing lessons', 500);
  }

  const existingTitles = new Set((existing || []).map(l => l.title));
  const toInsert = lessonsToSeed.filter(l => !existingTitles.has(l.title));

  if (toInsert.length === 0) {
    return sendSuccess(res, 'Lessons already seeded', { inserted: 0, total: existing?.length || 0 });
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('lessons')
    .insert(toInsert)
    .select('id, title, order_index');

  if (insertError) {
    console.error('Seed insert error:', insertError);
    return sendError(res, 'Failed to seed lessons', 500);
  }

  sendSuccess(res, 'Lessons seeded successfully', { inserted: inserted?.length || 0 });
});

/**
 * Get all lessons with user progress
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllLessons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const userId = req.user?.id; // Optional auth for public access

  // Build query
  let query = supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      category,
      xp_reward,
      order_index,
      is_unlocked_by_default,
      content,
      created_at
    `)
    .order('order_index', { ascending: true });

  // Filter by category if provided
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Get total count for pagination
  const { count, error: countError } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Count error:', countError);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: lessons, error } = await query;

  if (error) {
    console.error('Lessons fetch error:', error);
    return sendError(res, 'Failed to fetch lessons', 500);
  }

  // Get user progress if authenticated
  let userProgress = {};
  if (userId) {
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('lesson_id, status, score, completed_at')
      .eq('user_id', userId);

    if (!progressError && progress) {
      userProgress = progress.reduce((acc, p) => {
        acc[p.lesson_id] = {
          status: p.status,
          score: p.score,
          completedAt: p.completed_at
        };
        return acc;
      }, {});
    }
  }

  // Determine lesson unlock status
  const lessonsWithStatus = lessons.map(lesson => {
    const progress = userProgress[lesson.id];
    let isUnlocked = lesson.is_unlocked_by_default;
    let isCompleted = false;

    if (progress) {
      isCompleted = progress.status === 'completed';
    }

    // Unlock logic: first lesson is always unlocked, others unlock when previous is completed
    if (!lesson.is_unlocked_by_default && userId) {
      // Check if previous lesson is completed
      const previousLessonIndex = lessons.findIndex(l => l.order_index === lesson.order_index - 1);
      if (previousLessonIndex >= 0) {
        const previousLesson = lessons[previousLessonIndex];
        const previousProgress = userProgress[previousLesson.id];
        isUnlocked = previousProgress && previousProgress.status === 'completed';
      }
    }

    // Return chunked content metadata to support step-by-step UI without overloading
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      xpReward: lesson.xp_reward,
      orderIndex: lesson.order_index,
      content: lesson.content || null,
      isUnlocked,
      isCompleted,
      status: progress?.status || 'not_started',
      score: progress?.score || 0,
      completedAt: progress?.completedAt || null,
      createdAt: lesson.created_at
    };
  });

  const meta = getPaginationMeta(parseInt(page), parseInt(limit), count || 0);

  sendSuccess(res, 'Lessons retrieved successfully', lessonsWithStatus, meta);
});

/**
 * Get a specific lesson by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLessonById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id; // Optional auth

  // Get lesson details
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lesson) {
    return sendNotFound(res, 'Lesson');
  }

  // Get user progress if authenticated
  let userProgress = null;
  if (userId) {
    const { data: progress, error: progressError } = await supabase
      .from('progress')
      .select('status, score, completed_at, created_at, updated_at')
      .eq('user_id', userId)
      .eq('lesson_id', id)
      .single();

    if (!progressError && progress) {
      userProgress = {
        status: progress.status,
        score: progress.score,
        completedAt: progress.completed_at,
        createdAt: progress.created_at,
        updatedAt: progress.updated_at
      };
    }
  }

  // Check if lesson is unlocked
  let isUnlocked = lesson.is_unlocked_by_default;
  if (!lesson.is_unlocked_by_default && userId) {
    // Get previous lesson
    const { data: previousLesson, error: prevError } = await supabase
      .from('lessons')
      .select('id')
      .eq('order_index', lesson.order_index - 1)
      .single();

    if (!prevError && previousLesson) {
      // Check if previous lesson is completed
      const { data: prevProgress, error: prevProgressError } = await supabase
        .from('progress')
        .select('status')
        .eq('user_id', userId)
        .eq('lesson_id', previousLesson.id)
        .single();

      isUnlocked = !prevProgressError && prevProgress && prevProgress.status === 'completed';
    }
  }

  sendSuccess(res, 'Lesson retrieved successfully', {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    xpReward: lesson.xp_reward,
    orderIndex: lesson.order_index,
    content: lesson.content,
    isUnlocked,
    isCompleted: userProgress?.status === 'completed',
    userProgress,
    createdAt: lesson.created_at,
    updatedAt: lesson.updated_at
  });
});

/**
 * Unlock next lesson for user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const unlockNextLesson = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's completed lessons
  const { data: completedLessons, error: completedError } = await supabase
    .from('progress')
    .select(`
      lesson_id,
      lessons!inner(order_index)
    `)
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (completedError) {
    console.error('Completed lessons fetch error:', completedError);
    return sendError(res, 'Failed to fetch user progress', 500);
  }

  // Find the highest order index of completed lessons
  const completedOrderIndexes = completedLessons?.map(p => p.lessons.order_index) || [];
  const maxCompletedOrder = completedOrderIndexes.length > 0 ? Math.max(...completedOrderIndexes) : 0;

  // Find the next lesson to unlock
  const { data: nextLesson, error: nextError } = await supabase
    .from('lessons')
    .select('id, title, order_index')
    .eq('order_index', maxCompletedOrder + 1)
    .single();

  if (nextError || !nextLesson) {
    return sendSuccess(res, 'No new lessons to unlock', {
      unlocked: false,
      message: 'You have completed all available lessons!'
    });
  }

  // Check if lesson is already unlocked (has progress record)
  const { data: existingProgress, error: progressError } = await supabase
    .from('progress')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', nextLesson.id)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    console.error('Progress check error:', progressError);
    return sendError(res, 'Failed to check lesson progress', 500);
  }

  if (existingProgress) {
    return sendSuccess(res, 'Lesson already unlocked', {
      unlocked: false,
      lesson: {
        id: nextLesson.id,
        title: nextLesson.title,
        orderIndex: nextLesson.order_index
      }
    });
  }

  // Create progress record to unlock the lesson
  const { data: newProgress, error: createError } = await supabase
    .from('progress')
    .insert([
      {
        user_id: userId,
        lesson_id: nextLesson.id,
        status: 'not_started',
        score: 0
      }
    ])
    .select('id, status, created_at')
    .single();

  if (createError) {
    console.error('Progress creation error:', createError);
    return sendError(res, 'Failed to unlock lesson', 500);
  }

  sendSuccess(res, 'Lesson unlocked successfully', {
    unlocked: true,
    lesson: {
      id: nextLesson.id,
      title: nextLesson.title,
      orderIndex: nextLesson.order_index
    },
    progress: {
      id: newProgress.id,
      status: newProgress.status,
      createdAt: newProgress.created_at
    }
  });
});

/**
 * Get lesson categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getLessonCategories = asyncHandler(async (req, res) => {
  const { data: categories, error } = await supabase
    .from('lessons')
    .select('category')
    .order('category');

  if (error) {
    console.error('Categories fetch error:', error);
    return sendError(res, 'Failed to fetch categories', 500);
  }

  // Get unique categories with counts
  const categoryCounts = categories.reduce((acc, lesson) => {
    acc[lesson.category] = (acc[lesson.category] || 0) + 1;
    return acc;
  }, {});

  const uniqueCategories = Object.keys(categoryCounts).map(category => ({
    name: category,
    count: categoryCounts[category]
  }));

  sendSuccess(res, 'Categories retrieved successfully', uniqueCategories);
});
