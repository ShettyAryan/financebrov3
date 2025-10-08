-- FinanceBro Seed Data
-- This file contains initial data for the FinanceBro MVP

-- Insert sample lessons
INSERT INTO lessons (id, title, description, category, xp_reward, order_index, is_unlocked_by_default, content) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Introduction to Financial Statements',
    'Learn the three core financial statements every investor must understand',
    'basics',
    50,
    1,
    true,
    '{
        "intro": {
            "headline": "What are Financial Statements?",
            "content": "Financial statements are formal records of the financial activities and position of a business, person, or other entity. They provide a summary of a company''s financial condition.",
            "formula": "Assets = Liabilities + Shareholders'' Equity"
        },
        "example": {
            "headline": "Real-World Example",
            "scenario": "Company ABC has $1M in assets, $600K in liabilities, and $400K in shareholders'' equity. This balances perfectly: $1M = $600K + $400K.",
            "interpretation": "This shows the company is financially stable with a healthy equity position."
        },
        "quiz": {
            "question": "If a company has $2M in assets and $1.2M in liabilities, what is the shareholders'' equity?",
            "options": ["$800K", "$1.2M", "$2M", "$3.2M"],
            "correctAnswer": "$800K",
            "feedback": "Correct! Shareholders'' Equity = Assets - Liabilities = $2M - $1.2M = $800K"
        }
    }'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Understanding P/E Ratio',
    'Master how to evaluate stock valuation using the Price-to-Earnings ratio',
    'ratios',
    60,
    2,
    false,
    '{
        "intro": {
            "headline": "What is the P/E Ratio?",
            "content": "The Price-to-Earnings (P/E) ratio is one of the most widely used metrics for stock valuation. It tells you how much investors are willing to pay for each dollar of earnings.",
            "formula": "P/E Ratio = Stock Price ÷ Earnings Per Share (EPS)"
        },
        "example": {
            "headline": "Real-World Example",
            "scenario": "Company ABC has a stock price of $100 and an EPS of $5. This gives us a P/E ratio of 20. This means investors are paying $20 for every $1 of earnings.",
            "interpretation": "A P/E of 20 suggests moderate valuation. Compare this to the industry average to determine if the stock is overvalued or undervalued."
        },
        "quiz": {
            "question": "If a stock is priced at $150 and has an EPS of $10, what is its P/E ratio?",
            "options": ["10", "15", "20", "25"],
            "correctAnswer": "15",
            "feedback": "Correct! P/E = $150 ÷ $10 = 15. This stock has a moderate valuation. Always compare P/E ratios within the same industry for meaningful insights."
        }
    }'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Reading Balance Sheets',
    'Analyze a company''s assets, liabilities, and shareholder equity',
    'statements',
    75,
    3,
    false,
    '{
        "intro": {
            "headline": "Understanding Balance Sheets",
            "content": "A balance sheet provides a snapshot of a company''s financial position at a specific point in time, showing what it owns (assets) and what it owes (liabilities).",
            "formula": "Total Assets = Total Liabilities + Total Shareholders'' Equity"
        },
        "example": {
            "headline": "Real-World Example",
            "scenario": "TechCorp shows $5M in current assets, $3M in fixed assets, $2M in current liabilities, and $4M in long-term debt. Shareholders'' equity is $2M.",
            "interpretation": "The company has $8M in total assets and $6M in total liabilities, leaving $2M in shareholders'' equity."
        },
        "quiz": {
            "question": "What does a high current ratio (current assets/current liabilities) typically indicate?",
            "options": ["Poor liquidity", "Good liquidity", "High debt", "Low profitability"],
            "correctAnswer": "Good liquidity",
            "feedback": "Correct! A high current ratio indicates the company can easily pay its short-term obligations, showing good liquidity."
        }
    }'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Cash Flow Analysis',
    'Track how cash moves in and out of a business over time',
    'statements',
    80,
    4,
    false,
    '{
        "intro": {
            "headline": "Understanding Cash Flow",
            "content": "Cash flow statements show how cash moves in and out of a business through operating, investing, and financing activities.",
            "formula": "Net Cash Flow = Cash from Operations + Cash from Investing + Cash from Financing"
        },
        "example": {
            "headline": "Real-World Example",
            "scenario": "StartupXYZ shows $500K cash from operations, -$200K from investing (equipment purchases), and $300K from financing (investor funding). Net cash flow is $600K.",
            "interpretation": "The company is generating positive operating cash flow and raised additional funding, but is investing in growth through equipment purchases."
        },
        "quiz": {
            "question": "Which cash flow activity includes buying new equipment?",
            "options": ["Operating", "Investing", "Financing", "None of the above"],
            "correctAnswer": "Investing",
            "feedback": "Correct! Purchasing equipment is an investing activity as it involves acquiring long-term assets."
        }
    }'::jsonb
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Advanced Valuation Techniques',
    'Dive deep into DCF models and intrinsic value calculations',
    'ratios',
    100,
    5,
    false,
    '{
        "intro": {
            "headline": "Discounted Cash Flow (DCF) Analysis",
            "content": "DCF analysis estimates the value of an investment based on its expected future cash flows, discounted to present value.",
            "formula": "DCF Value = Σ [CFt / (1 + r)^t] where CFt = cash flow in year t, r = discount rate"
        },
        "example": {
            "headline": "Real-World Example",
            "scenario": "Company DEF expects $1M cash flow next year, growing 5% annually. With a 10% discount rate, the present value is $1M / (1.10) = $909K.",
            "interpretation": "DCF helps determine if a stock is undervalued by comparing the calculated intrinsic value to the current market price."
        },
        "quiz": {
            "question": "What happens to DCF value when the discount rate increases?",
            "options": ["Increases", "Decreases", "Stays the same", "Depends on cash flows"],
            "correctAnswer": "Decreases",
            "feedback": "Correct! Higher discount rates reduce the present value of future cash flows, lowering the DCF valuation."
        }
    }'::jsonb
);

-- Insert sample practice scenarios
INSERT INTO practice (id, user_id, lesson_id, coins_earned, coins_lost, attempts, last_feedback, session_data) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '00000000-0000-0000-0000-000000000000', -- Placeholder user ID
    '550e8400-e29b-41d4-a716-446655440001',
    25,
    0,
    1,
    'Great job on understanding the basic concepts!',
    '{
        "scenario": "Tech Startup Analysis",
        "question": "Should you invest based on fundamental analysis?",
        "userAnswer": "Yes, high P/E indicates strong growth potential",
        "correctAnswer": "Yes, high P/E indicates strong growth potential",
        "isCorrect": true
    }'::jsonb
);

-- Create a sample user for testing (password: 'password123')
-- Note: In production, this should be removed and users should register through the API
INSERT INTO users (id, username, email, password_hash, xp, coins, streak) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'testuser',
    'test@financebro.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'password123'
    1250,
    340,
    7
);

-- Insert sample progress for the test user
INSERT INTO progress (user_id, lesson_id, status, score, completed_at) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '550e8400-e29b-41d4-a716-446655440001',
    'completed',
    95,
    NOW() - INTERVAL '2 days'
),
(
    '00000000-0000-0000-0000-000000000000',
    '550e8400-e29b-41d4-a716-446655440002',
    'in_progress',
    0,
    NULL
);

-- Insert sample achievements
INSERT INTO achievements (user_id, achievement_type, achievement_data) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'first_lesson',
    '{"title": "First Lesson", "description": "Completed your first lesson", "icon": "🎓"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    'week_streak',
    '{"title": "Week Streak", "description": "Maintained a 7-day learning streak", "icon": "🔥"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    'practice_pro',
    '{"title": "Practice Pro", "description": "Completed 10 practice scenarios", "icon": "🎯"}'::jsonb
);
