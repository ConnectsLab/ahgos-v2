You are working on **Ahgos**, a customer feedback platform for businesses.

The backend/review-analysis pipeline already exists and is working. I built the core review submission and analysis logic myself, so **do not rewrite or redesign the existing business logic unless absolutely necessary**.

Your job is now to build the **Ahgos V1 application UI/UX**, implement minimal authentication with **Better Auth**, and connect the existing UI to the existing data/API layer.

---

# 1. Product

Ahgos helps businesses answer one simple question:

> **What are my customers saying about my business?**

A customer submits feedback/reviews.

Ahgos analyzes the feedback and extracts useful information such as:

- overall sentiment
- topics/aspects
- sentiment toward each topic
- evidence from the customer's review

The business should then be able to understand the feedback through a simple dashboard.

The underlying technology may involve LLMs, sentiment analysis, SQL aggregation, and eventually ML, but **the user should not need to understand any of that**.

Do NOT position Ahgos as an "AI app".

The product should feel like a **customer feedback/business intelligence tool**.

Use simple business language such as:

- Customer feedback
- Reviews
- What customers like
- What customers complain about
- Customer sentiment
- Common topics
- Recent feedback
- Trends
- Insights

Avoid unnecessary technical terminology such as:

- LLM
- embeddings
- vectors
- RAG
- inference
- NLP
- aspect extraction
- AI pipeline

unless it is genuinely necessary in an internal/admin context.

---

# 2. Target user

The initial target is Nigerian businesses and SMEs.

The user may not be technically sophisticated.

The application therefore needs to feel:

- simple
- obvious
- calm
- trustworthy
- professional
- fast
- useful

The business owner should not need a tutorial to understand the main dashboard.

---

# 3. Design philosophy

The most important design requirement:

> **Do not make Ahgos look like vibe-coded SaaS slop.**

The application should look like a real software product that someone deliberately designed.

Use **shadcn/ui** and the project's existing design system.

Prefer:

- strong typography
- clear visual hierarchy
- whitespace
- restrained borders
- consistent spacing
- meaningful charts
- simple tables
- subtle states
- good empty states
- useful loading states
- intentional responsive behavior

Avoid:

- excessive cards
- cards inside cards inside cards
- gradients everywhere
- glowing effects
- unnecessary illustrations
- giant dashboard headings
- fake statistics
- meaningless charts
- excessive badges
- excessive icons
- excessive rounded containers
- unnecessary animations
- "AI-powered" everywhere
- marketing copy inside the application
- generic SaaS dashboard templates

Do not add visual elements simply because they are common in AI-generated dashboards.

Every UI element should have a purpose.

---

# 4. Existing project

Before making changes:

1. Inspect the existing project structure.
2. Inspect the existing routes.
3. Inspect the existing components.
4. Inspect the existing shadcn configuration.
5. Inspect the existing database schema.
6. Inspect the existing API routes.
7. Inspect the existing review submission flow.
8. Inspect the existing LLM integration.
9. Inspect the existing project/business relationships.
10. Determine what is already implemented.

Do NOT rewrite working code merely because you would implement it differently.

Reuse the existing:

- fonts
- colors
- spacing
- components
- database
- API layer
- review pipeline
- design decisions

Do not create a second competing architecture.

---

# 5. Dependencies

I want to manually approve new dependencies.

Before installing ANY new package:

1. Check whether the functionality can be implemented using the existing stack.
2. Check whether shadcn/ui already provides the required component.
3. Check whether a native browser/API solution is sufficient.
4. If a dependency is genuinely necessary, STOP and tell me:
   - package name
   - what it does
   - why Ahgos needs it
   - whether there is a simpler alternative

**Do not silently install new dependencies.**

This applies to UI libraries, charting libraries, authentication packages, state management libraries, icon libraries, etc.

I will install approved dependencies myself.

---

# 6. Authentication — Better Auth

Ahgos V1 should have authentication now because business data needs to belong to the correct user/business/project.

Use **Better Auth**.

Before implementing it, inspect the project to determine whether Better Auth is already installed or partially configured.

If Better Auth is not installed, **do not install it yourself**.

Tell me that it is missing and explain what needs to be installed/configured. I will approve and install it.

## V1 authentication

Implement:

- Email/password sign up
- Email/password sign in
- Sign out
- Session management
- Protected application routes
- Authenticated user available to server-side application code
- User ownership of Ahgos business/project data

## Do NOT implement yet

Do not implement:

- Google OAuth
- GitHub OAuth
- Apple login
- magic links
- passkeys
- SSO
- MFA
- team invitations
- advanced RBAC
- billing
- subscriptions
- enterprise permissions

Social login can be added later.

The authentication architecture should not make adding Google OAuth later difficult, but **social login is not part of V1**.

## Auth UI

Keep authentication simple.

Sign up:

- name if required by the existing user model
- email
- password
- password confirmation if appropriate

Sign in:

- email
- password

The auth screens should feel like part of Ahgos.

Do not create a marketing-style auth page.

Use the existing Ahgos design language and shadcn components.

## Route protection

Authenticated application pages should be protected.

Unauthenticated users should not be able to access the business dashboard or private customer data.

The public customer feedback page must remain accessible without authentication.

Follow the existing routing conventions rather than blindly creating routes.

## Data ownership

Inspect the existing database schema before creating relationships.

The architecture should follow:

```text
User
  ↓
Business / Project
  ↓
Reviews
  ↓
Review Aspects
```

The exact implementation should follow the existing schema.

Do not create a second competing business/project model.

A user must never be able to access another user's private reviews or business data.

---

# 7. Application structure

Keep the initial application small.

The core navigation should be approximately:

- Dashboard
- Reviews
- Collect Feedback
- Settings

Do not add pages simply to make Ahgos appear larger.

Do not build:

- landing page
- pricing page
- marketing site
- blog
- documentation site
- team management
- billing
- enterprise settings

Those are future concerns.

---

# 8. App shell

Create a clean authenticated application shell.

It should include:

- Ahgos branding
- primary navigation
- current user/account area
- sign out
- responsive navigation

Desktop can use a sidebar if it fits the existing design.

Mobile should have an appropriate navigation pattern.

Do not over-design the shell.

The navigation should make the application immediately understandable.

---

# 9. Dashboard

The dashboard should answer:

> **What is happening with my customer feedback?**

Use actual database data.

Potential sections:

### Overview

- total reviews
- average rating
- positive reviews
- neutral reviews
- negative reviews

### What customers are talking about

Show commonly occurring aspects/topics.

For example:

```text
Food
72% positive

Service
41% positive

Price
63% positive
```

Use real aggregated data.

Do not ask the LLM to calculate aggregate statistics.

The application/database should handle aggregation.

### Recent feedback

Show recent reviews with:

- rating
- review text
- sentiment
- date

### Useful insights

If the available data is sufficient, surface simple understandable observations.

For example:

> Service is the most frequently mentioned topic.

or:

> Customers have mentioned slow service several times recently.

Do not manufacture insights.

Do not create a complicated AI-generated "executive summary" unless the existing backend already supports it.

---

# 10. Empty dashboard

The dashboard must look intentional with zero reviews.

Do NOT show:

- fake numbers
- fake charts
- placeholder reviews
- fabricated insights

Instead show a useful state such as:

> **No customer feedback yet.**
>
> Share your feedback link with customers to start learning what they think about your business.

Provide an obvious action:

> Collect feedback

The empty dashboard should still look polished.

---

# 11. Reviews page

Create a proper review list.

Each review should show:

- rating
- review text
- date
- overall sentiment
- analysis status

Use a table on desktop if appropriate.

Use a better mobile representation on small screens rather than forcing a wide desktop table.

The page should support basic useful filtering if the existing data/API makes this straightforward.

Do NOT overbuild search/filtering for V1.

---

# 12. Review detail

Clicking a review should reveal:

### Customer feedback

The original review exactly as submitted.

### Overall sentiment

Example:

> Mixed

### Topics

Example:

```text
Service
Negative

"had to wait for more than 3 seconds..."

Interface
Positive

"I do like the interface"

Design
Negative

"the design is bulky"
```

The UI should make this understandable to a normal business owner.

Do NOT expose raw JSON.

Do NOT expose raw LLM responses.

Do NOT expose technical model information.

---

# 13. Analysis status

The existing backend analyzes reviews asynchronously.

The review lifecycle is:

```text
PENDING
   ↓
DONE
```

or:

```text
PENDING
   ↓
FAILED
```

The UI must correctly represent these states.

### PENDING

Show something like:

> Analyzing feedback...

Use a subtle loading/skeleton state where appropriate.

### DONE

Show the analysis.

### FAILED

Show something like:

> We couldn't analyze this feedback yet.

Do not make the customer wait for the LLM analysis before their review is submitted.

The review itself should already exist even while analysis is pending.

---

# 14. Collect Feedback

Create a page that helps the business collect customer feedback.

The business should be able to:

- see their public feedback URL
- copy the URL
- open/preview the public feedback page

If QR code functionality already exists, integrate it.

If QR functionality requires a new dependency, STOP and ask before installing it.

Do not overbuild this page.

The main objective is:

> Give a business an easy way to start collecting feedback.

---

# 15. Public customer feedback page

This is one of the most important parts of V1.

A customer may reach it through:

- WhatsApp
- Instagram
- a QR code
- a direct link

Therefore it must be **excellent on mobile**.

The page should be extremely simple.

Something approximately like:

```text
[Business Name]

How was your experience?

★★★★★

Tell us about your experience

[                         ]

[ Submit feedback ]
```

Do not require customers to create an account.

Do not introduce unnecessary fields.

Keep the submission experience frictionless.

The customer should not need to understand Ahgos.

---

# 16. Settings

Keep Settings minimal.

Include only what is actually needed for V1.

Potential sections:

### Business

- business name
- basic business information

### Account

- email
- name
- sign out

Do not build:

- billing settings
- teams
- permissions
- integrations marketplace
- advanced notification systems
- API management
- enterprise configuration

---

# 17. Loading states

Every data-dependent page must have a deliberate loading state.

Use shadcn skeletons where appropriate.

Do not leave blank screens while data loads.

Loading states should feel subtle and professional.

---

# 18. Error states

Every important data-dependent operation needs a useful error state.

Do not simply show:

> Error

Instead provide understandable feedback.

For example:

> Something went wrong while loading your reviews.

with an appropriate retry action when possible.

Do not expose internal stack traces to users.

---

# 19. Empty states

Empty states are part of the product design.

Examples:

### No reviews

> No customer feedback yet.
>
> Share your feedback link to start collecting responses.

### Not enough data

> Keep collecting feedback.
>
> More responses will help reveal meaningful patterns.

### No negative feedback

> No major complaints yet.

Do not force charts or metrics when there is insufficient data to make them meaningful.

---

# 20. Responsive design

The public customer feedback page is **mobile-first**.

The dashboard should be responsive as well.

Test the UI at approximately:

- mobile
- tablet
- desktop

Do not simply shrink the desktop layout.

Navigation, tables, cards, text, buttons, and forms should adapt appropriately.

---

# 21. Charts

Only use charts when they communicate something useful.

Do not add charts because dashboards "usually have charts".

If a charting dependency is needed, ask before installing it.

Simple data can often be communicated better through:

- percentages
- lists
- progress indicators
- tables
- concise visual summaries

Prefer clarity over visual complexity.

---

# 22. AI/LLM boundaries

The existing architecture is intentionally simple.

Do NOT introduce:

- Redis
- BullMQ
- Inngest
- Trigger.dev
- microservices
- Python services
- vector databases
- embeddings
- pgvector
- Kubernetes
- background worker infrastructure
- complex state-management libraries

The current review-analysis flow already uses Next.js `after()` for post-response processing.

Keep that architecture.

Do not replace it with a queue unless there is an existing concrete requirement.

---

# 23. Existing review architecture

The current flow is approximately:

```text
Customer submits review
        ↓
Review stored immediately
        ↓
analysisStatus = PENDING
        ↓
HTTP response returned
        ↓
Next.js after()
        ↓
Groq / LLM analysis
        ↓
Zod validation
        ↓
overall sentiment + aspects
        ↓
Database
        ↓
analysisStatus = DONE
```

If analysis fails:

```text
PENDING
   ↓
FAILED
```

Do not rewrite this architecture.

The UI should be built around it.

---

# 24. Database responsibility

The LLM extracts information from an individual review.

The database/application should handle:

- storing reviews
- storing aspects
- counting reviews
- calculating percentages
- calculating averages
- grouping aspects
- filtering
- sorting
- trends

Do not send all reviews to the LLM just to calculate dashboard statistics.

Keep business logic deterministic where possible.

---

# 25. Component philosophy

Do not over-abstract the frontend.

Avoid:

- giant generic component libraries
- dozens of unnecessary wrappers
- components that only exist to wrap one element
- premature design-system engineering
- excessive custom hooks
- unnecessary state management

Create reusable components where reuse is real.

The code should be easy for me to read and understand.

I am using this project to become a better engineer, so do not hide important application behavior behind unnecessary abstractions.

---

# 26. Existing code ownership

The following parts are considered existing working infrastructure:

- review submission
- review database insertion
- LLM analysis
- Zod validation
- review aspect extraction
- asynchronous analysis using `after()`
- Drizzle database setup
- Supabase/Postgres

Inspect these before modifying anything.

If something is already working, integrate with it.

Do not replace it just because you prefer another approach.

---

# 27. Implementation strategy

Do NOT attempt to build everything in one enormous change.

Work in stages.

### Stage 1

Inspect the existing codebase and report:

- current structure
- existing routes
- existing UI
- existing database relationships
- authentication status
- missing dependencies
- proposed implementation plan

Do not make major changes yet.

### Stage 2

Implement Better Auth after required dependency approval.

Implement:

- sign up
- sign in
- sign out
- sessions
- protected routes
- user ownership

### Stage 3

Build the authenticated application shell.

### Stage 4

Build Dashboard.

### Stage 5

Build Reviews list and Review detail.

### Stage 6

Build Collect Feedback.

### Stage 7

Build public customer feedback page.

### Stage 8

Build Settings.

### Stage 9

Add loading, error, and empty states.

### Stage 10

Responsive/mobile refinement.

### Stage 11

Perform a visual consistency pass.

After each major stage, keep the application runnable.

---

# 28. No landing page

Do NOT create a landing page.

When an unauthenticated user visits the application, the primary experience should be authentication.

The public feedback route is separate and should remain accessible without authentication.

We will build the marketing site later.

---

# 29. No fake product maturity

Ahgos is an early product.

Do not make it pretend to have:

- millions of customers
- advanced enterprise analytics
- dozens of integrations
- complex AI capabilities
- sophisticated forecasting
- mature team management

The interface should feel **small but polished**.

A focused product is better than an empty-looking enterprise dashboard.

---

# 30. Nigerian context

Do not stereotypically design the application as a "Nigerian app".

The product should look professional and globally credible.

However, remember how businesses and customers may actually use it.

Customers may arrive through:

- WhatsApp
- Instagram
- QR codes
- direct links
- mobile devices

The customer submission flow therefore needs to be extremely easy.

Avoid assuming that every business has a website, mobile application, or technically sophisticated staff.

---

# 31. Final quality bar

Before considering V1 complete, evaluate the application honestly.

Ask:

### Product

- Can a non-technical business owner understand what Ahgos does within a few seconds?
- Can they collect their first review without confusion?
- Can they understand what their customers are saying?

### UX

- Is the customer submission flow frictionless?
- Does the dashboard make sense with zero reviews?
- Does it make sense with ten reviews?
- Does it remain usable with hundreds of reviews?
- Are loading and error states intentional?

### Design

- Does it look deliberately designed?
- Does it avoid generic AI-generated SaaS aesthetics?
- Is the typography good?
- Is spacing consistent?
- Are the visual hierarchy and information architecture clear?
- Are there unnecessary cards, badges, icons, charts, or animations?

### Engineering

- Is the existing backend logic preserved?
- Is authentication properly connected to data ownership?
- Are private routes protected?
- Is public feedback still accessible without authentication?
- Is real database data being used?
- Are there any fake metrics?
- Are there unnecessary dependencies?
- Is the code understandable?

If something exists only because:

> "SaaS dashboards usually have this"

remove it.

---

# 32. Most important constraint

**Do not optimize for how much UI you can generate.**

Optimize for:

> **How little UI is necessary to make Ahgos genuinely useful.**

The final product should feel like a small, serious, intentionally designed customer-feedback application.

The underlying technology can become much more sophisticated later.

For V1, keep the experience simple.
