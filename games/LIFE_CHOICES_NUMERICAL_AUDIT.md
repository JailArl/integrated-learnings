# Life Choices Game — Numerical Values Audit
## Singapore 2024–2025 Real-Life Accuracy Check

**File:** `games/life-choices.html` (4,967 lines)  
**Game:** Singapore Financial Literacy Simulator, Age 17→65

---

## 1. FINANCIAL INSTRUMENTS & INVESTMENT RETURNS

| Instrument | Nominal Yield | Real Return | Risk | Min Invest | Other | Lines |
|---|---|---|---|---|---|---|
| High-Yield Bank Savings | 3.5% | 0.5% | Safe | $3,000 | Below $3K → 0.05% base | ~553–565 |
| CPF-SA Voluntary Top-Up | 4.0% | 1.0% | Safe | — | Max $8,000/yr tax relief, locked till 55 | ~566–574 |
| Fixed Deposit (FD) | 3.8% | 0.8% | Low | $1,000 | 2-year lock, cannot sell | ~575–583 |
| STI ETF | 7.0% | 4.0% | Medium | $500 | Brokerage $5/trade, can go negative | ~584–592 |
| S-REIT | 6.5% | 3.5% | Medium | $500 | Brokerage $5/trade, can go negative | ~593–600 |
| DBS/OCBC Stock | 6.5% | 3.5% | Medium | $1,000 | Brokerage $5/trade | ~601–608 |
| Individual Stocks | 9.0% | 6.0% | High | $500 | Brokerage $5/trade | ~609–618 |

### Dynamic Return Floors (Line ~993–1015)
| Instrument | Floor |
|---|---|
| Bank Savings | ≥ 1% |
| CPF-SA | Always exactly 4% |
| FD | ≥ 2.5% |
| REIT | ≥ −18% |
| DBS/OCBC Stock | ≥ −20% |
| ETF | ≥ −28% |
| Individual Stocks | ≥ −40% |

### Dividend Yields (Line ~1015–1025)
| Instrument | Div Yield | Crash Modifier | Recession | Bull | Normal |
|---|---|---|---|---|---|
| REIT | 5% | 0.5× | 0.7× | 1.2× | 1.0× |
| Stocks | 4% | 0.5× | 0.7× | 1.2× | 1.0× |
| ETF | 1.5% | 0.5× | 0.7× | 1.2× | 1.0× |

### Random Variance (Line ~1000)
- All returns get ±1.5% random variance: `(Math.random()-0.5)*0.03`
- Business field bonus: +10% to all investment returns (`invBonus=0.10`, line ~380)

---

## 2. INFLATION & COST MODIFIERS

| Parameter | Value | Line |
|---|---|---|
| **Base Inflation Rate** | **3%/yr** | ~551 (`INFLATION_RATE=0.03`) |
| Inflation multiplier cap per year | min 1.0, max 1.04 | ~3462 |
| `inflationMult` compounding | Cumulative each year via `newsForInflation.costMod` | ~3462 |

### News-Driven Cost Modifiers (Lines ~823–900)
| News Event | Salary Mod | Cost Mod |
|---|---|---|
| Bull Market | 1.05× | 1.02× |
| Stable | 1.03× | 1.03× |
| Rates Up | 1.02× | 1.04× |
| Tech Boom | 1.08× | 1.03× |
| Property Boom | 1.03× | 1.05× |
| Recession | 0.95× | 1.02× |
| Market Crash | 0.90× | 1.01× |
| Budget Year | 1.02× | 1.02× |
| Inflation Crisis | 1.01× | 1.07× |
| Pandemic | 0.60× | 1.01× |

---

## 3. SALARIES & CAREER PROGRESSION

### Career Fields (Lines ~355–505)

**Engineering** (`hiPerYear=15`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | Junior Technician | $15,000 | — |
| 1 | Senior Technician | $24,000 | NITEC |
| 2 | Engineering Asst | $32,000 | Higher NITEC |
| 3 | Junior Engineer | $48,000 | Diploma |
| 4 | Engineer | $72,000 | Degree |
| 5 | Senior Engineer | $95,000 | Degree + 5yr |
| 6 | Principal Engineer | $110,000 | Degree + 10yr |

**Business/Finance** (`hiPerYear=5`, `invBonus=0.10`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | Admin Clerk | $18,000 | — |
| 1 | Accounts Assistant | $24,000 | NITEC |
| 2 | Senior Admin | $30,000 | Higher NITEC |
| 3 | Executive | $42,000 | Diploma |
| 4 | Manager | $72,000 | Degree |
| 5 | Senior Manager | $110,000 | Degree + 5yr |
| 6 | Director | $160,000 | Degree + 10yr |

**IT/Tech** (`hiPerYear=20`, `itBonus=true`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | IT Support | $22,000 | — |
| 1 | Junior Dev | $30,000 | NITEC |
| 2 | Web Dev | $38,000 | Higher NITEC |
| 3 | Software Dev | $54,000 | Diploma |
| 4 | Senior Dev | $84,000 | Degree |
| 5 | Tech Lead | $120,000 | Degree + 5yr |
| 6 | CTO/VP Eng | $150,000 | Degree + 10yr |

**Hospitality & F&B** (`hiPerYear=25`, `noUni=true`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | Service Crew | $18,000 | — |
| 1 | Captain | $26,000 | NITEC |
| 2 | Asst Manager | $36,000 | Higher NITEC |
| 3 | F&B Manager | $52,000 | Diploma |
| 4 | Director of Ops | $80,000 | Diploma + 10yr |

**Creative & Media** (`hiPerYear=30`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | Junior Designer | $14,000 | — |
| 1 | Graphic Designer | $24,000 | NITEC |
| 2 | Senior Designer | $32,000 | Higher NITEC |
| 3 | Art Director | $48,000 | Diploma |
| 4 | Creative Director | $72,000 | Degree |
| 5 | Head of Creative | $95,000 | Degree + 5yr |

**Medicine** (`hiPerYear=20`, `jcOnly`, `noRetrenched`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | Medical Officer | $65,000 | Medical Degree |
| 1 | Registrar | $120,000 | Medical Degree + 3yr |
| 2 | Specialist | $250,000 | Medical Degree + 8yr |
| 3 | Senior Consultant | $350,000 | Medical Degree + 15yr |

**Law** (`hiPerYear=8`, `jcOnly`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | Associate | $70,000 | Law Degree |
| 1 | Senior Associate | $120,000 | Law Degree + 3yr |
| 2 | Partner (Junior) | $250,000 | Law Degree + 8yr |
| 3 | Senior Partner | $350,000 | Law Degree + 15yr |

**Government/Civil Service** (`hiPerYear=18`, `noRetrenched`, `nsOnly`, `noMoonlight`)
| Level | Role | Salary | Requirement |
|---|---|---|---|
| 0 | Clerical Officer | $22,000 | — |
| 1 | Executive | $30,000 | NITEC |
| 2 | Senior Executive | $38,000 | Higher NITEC |
| 3 | Asst Director | $60,000 | Diploma |
| 4 | Deputy Director | $90,000 | Degree |
| 5 | Director | $130,000 | Degree + 5yr |
| 6 | Perm Secretary | $155,000 | Degree + 10yr |

### Salary Growth (Line ~1013)
- Annual increment: **3%/yr** compounding on base (`salWithGrowth = job.sal × 1.03^yearsAtLevel`)

### Universal (Non-Field) Jobs (Lines ~507–520)
| Job | Annual Salary | CPF | Self-Employed | Growth |
|---|---|---|---|---|
| Hawker | $42,000 | No | Yes | 3%/yr |
| Grab Full-Time | $30,000 | No | Yes | 1%/yr |
| Content Creator FT | $24,000 | No | Yes | 5%/yr |

### Side Gigs (Lines ~522–530)
| Gig | Extra Salary | HI Cost | CPF |
|---|---|---|---|
| Grab Delivery | $9,600/yr | −20 HI/yr | No |
| Content Creator | $6,000/yr | −15 HI/yr | No |

### Salary Negotiation (Lines ~4298–4350)
- Available every 3 years
- **Success (50%):** +8% salary, +120 HI
- **Fail (40%):** No raise, −30 HI
- **Backfire (10%):** Lose job, salary reset, −150 HI

---

## 4. CPF (Central Provident Fund)

| Parameter | Value | Line |
|---|---|---|
| CPF OW Ceiling | $81,600/yr | ~932 |
| Employee contribution | 20% of min(salary, $81,600) | ~934 |
| Employer contribution | 17% of min(salary, $81,600) | ~936 |
| CPF OA interest rate | 2.5%/yr | ~3340 |
| CPF-SA interest rate | 4.0%/yr (fixed) | ~566, ~1000 |
| CPF-SA voluntary top-up max | $8,000/yr | ~568 |
| CPF-SA tax relief estimate | ~3.5% of top-up amount | ~3234 |
| Full Retirement Sum (FRS) | $205,800 | ~4527 |
| CPF LIFE payout estimate | `min(CPF, FRS) / 240` per month | ~3076, 4538 |
| CPF withdrawal at 55 | `max(0, CPF − $205,800)` | ~4528 |
| CPF withdrawal HI bonus | +80 HI | ~4558 |

---

## 5. LIVING COSTS

| Cost | Annual Amount | Notes | Line |
|---|---|---|---|
| Food (hawker, base) | $1,800/yr | Included in base living | ~2334 |
| Transport (MRT/Bus) | $1,440/yr | $0 if owns car | ~2334 |
| Clothing/necessities | $600/yr | Part of base $3,240 | ~2334 |
| **Total base living** | **$3,240/yr** | Adjusted by `inflationMult` | ~2334, 3069 |
| Eating out lifestyle | $3,000/yr extra | "Comfort" lifestyle choice | ~1014, 2611 |
| Housing (rent, no property) | $7,200/yr | ~$600/month | ~2703, 3069, 4203 |
| Utilities (own property) | $2,160/yr | ~$180/month (elec + water) | ~3434 |
| Child costs | $12,000/yr | Childcare, milk powder, clothes | ~4569 |
| Insurance premium | $2,400/yr | Personal insurance | ~3004, 3349 |
| Pocket money (until age 21) | $2,400/yr | During study phase | ~2148 |
| Ang bao (study years) | $300/yr | One-time | ~2148 |
| Personal expenses (NS) | $2,400/yr | During National Service | ~1558 |
| FF minimum living costs | $24,000/yr | Floor for financial freedom check | ~3468 |

---

## 6. STUDY / EDUCATION COSTS

### Education Paths (Lines ~533–580)
| Path | Duration (FT) | Cost (FT) | Duration (PT) | Cost (PT) | Grants/Qualification |
|---|---|---|---|---|---|
| ITE NITEC | 2 yr | $1,000 | 3 yr | $800 | NITEC |
| Higher NITEC | 2 yr | $1,500 | 3 yr | $1,200 | Higher NITEC (req NITEC) |
| Poly Diploma | 3 yr | $9,000 | 4 yr | $7,000 | Diploma |
| Poly Advanced Entry | 2 yr | $6,000 | 3 yr | $5,000 | Diploma (req Higher NITEC) |
| JC A-Levels | 2 yr | $500 | N/A | — | A-Levels |
| University (from JC) | 4 yr | $32,000 | 6 yr | $28,000 | Degree (req A-Levels) |
| University (from Poly) | 3 yr | $15,000 | 4 yr | $13,000 | Degree (req Diploma) |
| Medical School | 5 yr | $150,000 | N/A | — | Medical Degree (req A-Levels) |
| Law School | 4 yr | $100,000 | N/A | — | Law Degree (req A-Levels) |

### Study-Related Costs/Income
| Item | Value | Line |
|---|---|---|
| PT salary reduction | 85% of normal (−15%) | ~2500 |
| Study loan interest rate | 5%/yr (MOE TFL, 3M SORA ~3.5% + 1.5%) | ~3318 |
| Study loan min repayment | $1,200/yr ($100/month) | ~3324 |
| Study loan tenure (Degree/Med/Law) | 20 years | ~2200, 3315 |
| Study loan tenure (others) | 10 years | ~2200 |
| Study stress HI (FT) | −20/yr | ~2167 |
| Study stress HI (PT) | −10/yr | ~2167 |
| Loan anxiety HI (>$20K) | −25/yr | ~2172 |
| Loan anxiety HI (>$10K) | −15/yr | ~2172 |
| Loan anxiety HI (else) | −8/yr | ~2172 |
| Graduation HI bonus | +200 | ~2176 |

### Certifications (Lines ~583–590)
| Cert | Cost | Age | Effect |
|---|---|---|---|
| Driving Licence | $3,500 | 18+ | Unlocks car purchase |
| Swimming Coach | $2,000 | 18–40 | +$5,000/yr side income |
| SkillsFuture | $500 | 21+ | +$2,000/yr salary boost |
| Insurance Licence | $1,500 | 21+ | +$4,000/yr, 50% off premiums |

- Cert acquisition HI: +30 each (line ~3828 in renderCert click handler → `G.hi+=30`)

---

## 7. PROPERTY

### Properties (Lines ~918–930)
| Property | Price | Down % | Loan Rate | Loan Years | Growth | HI | Rent/Month | MOP |
|---|---|---|---|---|---|---|---|---|
| HDB 4-Room | $450,000 | 25% | 2.6% | 25 | 3.5%/yr | +200 | $2,800 | 5 yr |
| HDB 5-Room | $520,000 | 25% | 2.6% | 25 | 3.5%/yr | +250 | $3,200 | 5 yr |
| Condo | $900,000 | 25% | 3.5% | 25 | 4.0%/yr | +300 | $3,800 | — |
| Luxury Condo | $1,800,000 | 25% | 3.5% | 25 | 4.5%/yr | +400 | $6,000 | — |

### ABSD (Additional Buyer's Stamp Duty) — Singapore Citizens (Line ~926)
| Property # | ABSD Rate |
|---|---|
| 1st | 0% |
| 2nd | 20% |
| 3rd+ | 30% |

### HDB BTO Ballot (Lines ~2736–2800)
| Parameter | Value |
|---|---|
| Base success chance | 25% |
| Per-attempt bonus | +5% each previous attempt |
| Max success chance | 70% |
| Success HI | +200 |
| Failure HI | −100 |
| Max ballot applications | 2 per household |
| Down payment source | CPF OA can cover all 25% for HDB loan |

### Mortgage (Lines ~3380–3420)
- Amortized reducing balance calculation
- Mortgage paid off HI: +500 (1st property, line ~3399), +200 (2nd+ property)
- Property appreciation: compounding each year by `propData.grow`
- MOP completion: +50 HI (line ~3456)
- Property upgrade: requires HDB MOP 5 years before selling

### Rental Income
- Only from **2nd property onwards** (you live in #1)
- Annual rental = `propData.rent × 12`
- Private property can rent immediately; HDB requires MOP 5 years

---

## 8. CAR OWNERSHIP

### Cars (Lines ~593–630)
| Car | Base Price | COE Base | ARF | Down % | HI |
|---|---|---|---|---|---|
| Toyota Vios (Basic) | $48,000 | $105,000 | $18,000 | 40% | +60 |
| Honda CR-V (Mid) | $78,000 | $115,000 | $38,000 | 40% | +100 |
| BMW 3-Series (Luxury) | $155,000 | $120,000 | $95,000 | 40% | +150 |

### Running Costs (Annual, Lines ~593–630)
| Cost Item | Basic | Mid | Luxury |
|---|---|---|---|
| Fuel | $2,400 | $3,600 | $5,400 |
| Road Tax | $742 | $1,212 | $2,000 |
| Insurance | $1,600 | $2,200 | $3,500 |
| Servicing | $700 | $1,100 | $2,800 |
| Parking | $1,800 | $1,800 | $1,800 |
| Cashcard | $360 | $360 | $480 |
| ERP | $480 | $600 | $720 |

### Servicing Multiplier (Line ~543)
- Car age ≥ 6 years: servicing cost × 2.5

### Car Loan (Line ~630, 639)
| Parameter | Value |
|---|---|
| `CAR_LOAN_RATE` | 2.8% flat rate |
| Max tenure | 7 years (MAS rule) |
| Loan-to-value | 60% (100% − 40% down) |
| Repayment method | Flat rate on original principal |

### Car Depreciation / PARF Rebate (Lines ~1035–1055)
| Car Age | PARF Rebate |
|---|---|
| < 5 years | ARF × 0.75 |
| 5–7 years | ARF × 0.65 |
| 8–9 years | ARF × 0.55 (capped at $60,000) |
| ≥ 10 years (scrap) | min(ARF × 0.5, $60,000) |

### COE Value
- `coeBase × coeLevel × (10 − ageYears) / 10`

### COE Market Fluctuation (Line ~3304–3308)
| Roll (random) | Effect |
|---|---|
| < 0.15 (15%) | COE drops: `coeLevel × 0.82` (min 0.6) |
| 0.15–0.35 (20%) | COE surges: `coeLevel × 1.18` (max 1.5) |
| Otherwise (65%) | Slow drift toward 1.0 |

### COE Expiry (age 10)
- Renew: pay `coeLevel × coeBase`, servicing +25% increase
- Scrap: receive `min(ARF × 0.5, $60,000)`
- Go MRT: −30 HI (miss convenience)
- Car loan paid off bonus: +100 HI (line ~3297)

---

## 9. WEDDING / MARRIAGE

| Parameter | Value | Line |
|---|---|---|
| Wedding cost | $50,000 | ~4494 |
| Wedding HI bonus | +200 HI (event) + +300 HI (marriage) = +500 total | ~4534 |
| Marriage triggers HDB BTO eligibility | — | ~4535 |
| Marriage age window | 28–42 (yearly prompt) | ~4492 |
| Late marriage window | 43–50 | ~4507 |
| Wedding loan option | Covers shortfall | ~4549 |
| Wedding loan interest rate | 8%/yr | ~3367 |
| Wedding loan min repayment | max($2,400, loan/5) per year | ~3371 |
| Wedding loan paid off HI | +100 | ~3373 |
| Wedding loan stress penalty | −50 HI when taken | ~4552 |
| Property loan discount on marriage | 10% reduction on `propLoan` | ~4536 |
| Married family bonus HI | +30/yr | ~3440 |

### Baby (Lines ~4560–4570)
| Parameter | Value |
|---|---|
| Baby cost (first year) | $25,000 |
| Baby HI bonus | +400 HI (+200 base × 2) |
| Ongoing child costs | $12,000/yr |
| Child HI bonus (age ≤18) | +100/yr |
| Child HI bonus (age >18) | +20/yr |
| Baby trigger | 1–3 years after marriage |

### Luxury Multipliers for Family (Line ~2856)
| Status | Cost & HI Multiplier |
|---|---|
| Single | 1.0× |
| Married (no kids) | 1.5× |
| With children | 2.0× |

---

## 10. LOANS & DEBT

### Loan Types & Interest Rates
| Loan | Rate | Repayment Method | Line |
|---|---|---|---|
| Study Loan (MOE TFL) | 5%/yr | Reducing balance, amortized | ~3318 |
| HDB Mortgage | 2.6%/yr | Reducing balance, amortized | ~918 |
| Condo Mortgage | 3.5%/yr | Reducing balance, amortized | ~924 |
| Car Loan | 2.8% flat | Flat on original principal, 7yr | ~630, 639 |
| Wedding Loan | 8%/yr | min($2,400, loan/5)/yr | ~3367 |
| Credit Card Debt | 26%/yr | Compounding annually | ~3354 |
| Emergency Debt | 26%/yr | Compounding annually | ~3361 |

### Debt Payoff HI Bonuses
| Event | HI Bonus | Line |
|---|---|---|
| All loans cleared | +300 | ~3266 |
| Study loan paid off | +200 | ~3335 |
| Mortgage #1 paid off | +500 | ~3399 |
| Mortgage #2+ paid off | +200 | ~3399 |
| Car loan paid off | +100 | ~3297 |
| Wedding loan cleared | +100 | ~3373 |
| CC debt cleared | +150 | ~3032 |
| Emergency debt cleared | +150 | ~3021 |

### Emergency Borrowing (Line ~977–1000)
- Order: Emergency Fund → Bank savings → ETF → REIT → DBS/OCBC → Stocks → Emergency debt (26%)
- Emergency borrow: −40 HI

---

## 11. SIDE GIGS

(Same as Section 3 sidebar — consolidated here for reference)

| Gig | Extra Salary | HI Cost/yr | CPF | Line |
|---|---|---|---|---|
| Grab Delivery | $9,600 | −20 | No | ~524 |
| Content Creator | $6,000 | −15 | No | ~528 |
| Rest (no gig) | $0 | $0 | — | ~2742 |

- Government servants cannot moonlight (`noMoonlight=true`, line ~460)
- No CPF on side gig income
- Available only when employed FT and not studying

---

## 12. LUXURY PURCHASES

### One-Time Items (Lines ~903–915)
| Item | Cost | HI Boost | Regret Score | 
|---|---|---|---|
| Japan Trip | $4,000 | +60 | 30 |
| Korea Trip | $3,000 | +50 | 22 |
| Bali Trip | $2,000 | +40 | 15 |
| Concert | $800 | +30 | 6 |
| Designer Bag | $3,500 | +45 | 26 |
| Luxury Watch | $5,000 | +50 | 37 |
| Gaming Setup | $2,500 | +55 | 18 |
| Fine Dining | $500 | +25 | 4 |
| Luxury Staycation | $1,500 | +35 | 11 |
| Latest Gadget | $1,800 | +35 | 13 |

- Family multiplier applies (1.5× married, 2.0× with kids) to both cost AND HI
- Regret calculation: `cost × 1.07^(65 − age)` — opportunity cost at 7% growth

---

## 13. NEWS/MACRO EVENTS & INVESTMENT RETURN OVERRIDES

### News Types (Lines ~823–900)
| News ID | Name | Salary Mod | Cost Mod | Special |
|---|---|---|---|---|
| `bull` | Bull Market | 1.05× | 1.02× | ETF=18%, REIT=12%, Stock=25% |
| `stable` | Stable Economy | 1.03× | 1.03× | ETF=7%, REIT=6.5%, Stock=7% |
| `rates_up` | Interest Rates Up | 1.02× | 1.04× | Bank=5.5%, FD=6%, ETF=2%, REIT=−5%, Stock=−8% |
| `tech_boom` | Tech Boom | 1.08× | 1.03× | ETF=15%, Stock=35% |
| `property_boom` | Property Boom | 1.03× | 1.05× | REIT=15%, propBonus=+10% |
| `recession` | Recession | 0.95× | 1.02× | ETF=−12%, Stock=−22% |
| `crash` | Market Crash | 0.90× | 1.01× | ETF=−28%, Stock=−40% |
| `budget_year` | Budget Year | 1.02× | 1.02× | Cash bonus=$1,500 |
| `inflation` | Inflation Crisis | 1.01× | 1.07× | FD=4.8%, Stock=−5%, propBonus=+4% |
| `pandemic` | Pandemic | 0.60× | 1.01× | ETF=−18%, Stock=−25% (once only) |

### Random Life Events (Lines ~705–780)
| Event | Type | Money Impact | HI Change | Special |
|---|---|---|---|---|
| Bonus | Good | +15% of salary | +250 | — |
| Salary Negotiation Win | Good | +8% salary raise | +150 | — |
| New Baby (event) | Good | −$30,000 | +200 | — |
| Promoted | Good | +$15,000 | +300 | — |
| TOTO Win | Good | +$80,000 | +200 | — |
| CDC Vouchers | Good | +$1,500 | +100 | — |
| Dividend Windfall | Good | +4% of portfolio | +100 | — |
| Property Appreciation | Good | +12% propVal | +150 | — |
| HDB BTO Won | Good | — | +200 | Unlocks HDB purchase |
| **Retrenched** | Bad | +25% salary (severance) | −300/−80 | Lose job; −80 if has EF |
| Serious Illness | Bad | −$20,000 | −250 | Insurable (80% covered) |
| Car Accident | Bad | −$8,000 | −200 | Car owners only |
| Parent Hospitalisation | Bad | −$20,000 | −150 | Insurable (80% covered) |
| Market Crash (event) | Bad | −30% of portfolio | −150 | — |
| HDB Ballot Fail | Bad | — | −100 | — |
| Dengue Fever | Bad | −$3,000 | −100 | Insurable |
| Pandemic (event) | Bad | −50% salary | −120 | Once only |
| War | Bad | −20% all investments | −180 | Once only |
| COE Spike | Bad | — | −80 | COE × 1.3 |
| SingPass Scam | Danger | −$10,000 | −300 | $0 if SkillsFuture cert |
| Telegram Scheme | Danger | −$8,000 | −250 | $0 if SkillsFuture cert |
| TikTok Crypto | Danger | −$5,000 | −150 | $0 if SkillsFuture cert |
| CC Debt Trap | Danger | −$500 + $5K CC debt | −200 | 26% interest on CC debt |
| Quiet Year | Neutral | $0 | 0 | — |
| SkillsFuture Credit | Neutral | +$500 | +80 | — |

### Insurance Protection
- Personal insurance covers **80%** of insurable event costs
- Emergency fund absorbs **50%** if no insurance
- Insurance licence cert: same protection as insurance

---

## 14. HAPPINESS INDEX (HI) — COMPREHENSIVE

### Starting & Base
| Parameter | Value | Line |
|---|---|---|
| Starting HI | 60 | ~1055 |

### Career HI (per year while working in field)
| Field | HI/Year |
|---|---|
| Engineering | +15 |
| Business | +5 |
| IT/Tech | +20 |
| Hospitality | +25 |
| Creative | +30 |
| Medicine | +20 |
| Law | +8 |
| Government | +18 |

### National Service
| Event | HI |
|---|---|
| NS Year 1 | +100 |
| NS completion | +200 |
| NS savings: spend | +50 |
| NS savings: save | +20 |
| NS savings: invest | −10 |

### Study Phase
| Event | HI |
|---|---|
| Study stress (FT) | −20/yr |
| Study stress (PT) | −10/yr |
| Loan anxiety (>$20K) | −25/yr |
| Loan anxiety (>$10K) | −15/yr |
| Loan anxiety (else) | −8/yr |
| Graduation | +200 |

### Ang Bao Choices
| Phase | Spend | Save | Invest |
|---|---|---|---|
| Study | +50 | +20 | −5 |
| Work (unmarried, ≤30) | +80 | +40 | −15 |

### Investment Actions
| Action | HI |
|---|---|
| CPF-SA top-up | +15 |
| Bank savings (≥$3K) | +20 |
| Bank savings (<$3K) | +10 |
| FD deposit | +30 |
| FD matured | +50 |
| Cert acquisition | +30 |

### Life Events HI
| Event | HI |
|---|---|
| Get married | +500 total (+200 + +300) |
| Baby born | +400 (+200 × 2) |
| Married family bonus | +30/yr |
| Children (≤18) family bonus | +100/yr |
| Children (>18) family bonus | +20/yr |
| Property MOP completed | +50 |

### Milestone Bonuses (Lines ~3941–3947)
| Milestone | Bonus (months salary) | HI |
|---|---|---|
| 5-Year | 2 months | +100 |
| 10-Year | 3 months | +180 |
| 15-Year | 4 months | +280 |
| 20-Year | 6 months | +400 |

### Work-First HI (Lines ~3487–3500)
| Years Worked | HI Bonus |
|---|---|
| < 4 years | +20/yr |
| 4–7 years | +10/yr |
| ≥ 8 years | 0 |
| Stuck at entry ≥3yr (no qual) | −25/yr |

### Financial Freedom (Line ~3468–3476)
| Event | HI |
|---|---|
| FF achieved (age ≥35, yield ≥ living costs) | +500 (one-time) |
| FF ongoing (each year) | +50 |

### Debt-Related HI
| Event | HI |
|---|---|
| CC debt interest burden | −30/yr |
| Emergency debt burden | −40/yr |
| Wedding loan debt stress | −50 (on taking) |
| Emergency borrowing | −40 |

### Lifestyle HI
| Choice | HI |
|---|---|
| Eating out ("comfort") | +50 when deducted (line ~3275) |
| Go back to MRT (lose car) | −30 |

### Retirement Plan
| Event | HI |
|---|---|
| Setting retirement plan | +30 |

---

## 15. ADDITIONAL GAME PARAMETERS

### Tax Brackets — SG YA2024 (Lines ~962–990)
| Chargeable Income | Rate |
|---|---|
| ≤ $20,000 | 0% |
| $20,001–$30,000 | 2% |
| $30,001–$40,000 | 3.5% |
| $40,001–$80,000 | 7% |
| $80,001–$120,000 | 11.5% |
| $120,001–$160,000 | 15% |
| $160,001–$200,000 | 18% |
| $200,001–$240,000 | 19% |
| $240,001–$280,000 | 19.5% |
| $280,001–$320,000 | 20% |
| > $320,000 | 22% |

### Tax Reliefs (Line ~963–970)
| Relief | Amount |
|---|---|
| Earned Income Relief (<55) | $1,000 |
| Earned Income Relief (55–59) | $6,000 |
| Earned Income Relief (60+) | $8,000 |
| Spouse Relief | $2,000 |
| Child Relief | $4,000/child |
| CPF-SA top-up deduction | max $8,000 |

### Retirement Lifestyles (Lines ~4000–4005)
| Lifestyle | Monthly | Yearly |
|---|---|---|
| Basic | $2,000 | $24,000 |
| Comfortable | $3,500 | $42,000 |
| Premium | $5,500 | $66,000 |
| Luxury | $8,000 | $96,000 |

### Retirement Planning Assumptions
| Parameter | Value |
|---|---|
| Life expectancy (planning) | Age 90 |
| Investment growth projection | 6%/yr |
| CPF growth projection | 2.5%/yr |
| Property growth projection | 3%/yr |
| CPF LIFE period | Age 65–90 (25 years) |

### Score Calculation (Lines ~1016–1048)
| Goal | Formula |
|---|---|
| FF Earliest | `(65 − ffAge) × 500` ; fallback `NW / 500` |
| Highest NW | `max(0, NW)` |
| Highest HI | `max(0, HI × 100)` |
| Highest CPF | `max(0, CPF)` |
| Balanced Life | Complex: wealth(≤4000) + HI(≤3000) + CPF(≤1000) + FF + Life bonuses − penalties |
| Combined (default) | `NW/200 + HI×5 + CPF/500 + (ffAge ? (65-ffAge)×200 : 0)` |

### Game State Initial Values (Line ~1055)
| Parameter | Start Value |
|---|---|
| Age | 17 |
| Cash | $500 |
| HI | 60 |
| CPF | $0 |
| COE Level | 1.0 |
| Inflation Multiplier | 1.0 |

### NS Allowance (Lines ~1558–1570)
| Year | Allowance |
|---|---|
| NS Year 1 | $10,800/yr |
| NS Year 2 | $14,400/yr |
| Food provided (value) | $3,600 |
| Lodging provided (value) | $6,000 |

### Quiz Reward (Line ~4151)
- Correct answer: +$500, +50 HI

---

*Generated for audit against Singapore 2024–2025 actuals.*
