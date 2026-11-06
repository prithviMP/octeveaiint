# AI Interview Coach – Product Requirements Document (PRD)

**Version:** 1.0  
**Project Type:** Academic Capstone Project  
**Product Category:** EdTech / Interview Preparation  
**Document Status:** Initial MVP Specification

---

## 1. Project Overview

### 1.1 Product Vision

AI Interview Coach is a web-based interview preparation platform designed to help students and aspiring software engineers practice technical interviews in a structured environment.

Users can select technical subjects they want to prepare for, attempt multiple-choice questions (MCQs), and evaluate their performance based on their answers.

The initial version will focus on providing a simple, intuitive interview practice experience using predefined questions.

The long-term vision is to evolve the platform into an AI-powered interview preparation system capable of conducting realistic technical interviews, evaluating answers, and providing personalized feedback.

### 1.2 Problem Statement

Students preparing for software engineering interviews often struggle with:

- Finding structured interview practice material.
- Identifying their strengths and weaknesses across technical subjects.
- Practicing questions in an interview-like environment.
- Tracking their preparation progress.
- Getting consistent feedback on their knowledge.

AI Interview Coach aims to address these challenges through an accessible, structured, and interactive interview preparation platform.

### 1.3 Project Objectives

The primary objectives of the MVP are:

1. Build a functional interview preparation web application.
2. Allow users to start practicing without registration or login.
3. Allow users to enter their name.
4. Allow users to select one or multiple technical subjects.
5. Present predefined MCQs based on selected subjects.
6. Allow users to submit answers and navigate through questions.
7. Calculate and display the final interview score.
8. Provide a basic performance summary.
9. Establish a foundation for future AI-powered capabilities.

---

## 2. Target Audience

The primary target audience includes:

- Computer Science students.
- Fresh graduates preparing for technical interviews.
- Entry-level software engineers.
- Developers preparing for job switches.
- Students preparing for coding and technical assessments.

---

## 3. MVP Scope and Features

The MVP will focus exclusively on multiple-choice technical interview questions.

### 3.1 Landing Page

The landing page will introduce the platform and provide a clear call to action.

**Requirements:**

- Display the product name and logo.
- Display a short description of the platform.
- Display a Start Interview or Start Practicing button.
- Provide a clean and modern user interface.
- Make the application responsive across desktop and mobile devices.

**Expected user experience:**

The user visits the website and clicks the Start Practicing button to begin.

### 3.2 User Information

No registration or authentication will be required in the MVP.

Before starting an interview, users will provide basic information.

**Required fields:**

- Student name.

**Requirements:**

- Name must not be empty.
- Validate the input.
- Provide an option to continue.
- Pass the entered name to the interview session.

The name will be used to personalize the interview experience and display the user's name on the results page.

### 3.3 Subject Selection

Users will be able to select one or multiple technical subjects.

**Initial supported subjects:**

| Category | Subjects |
|---|---|
| Data Structures & Algorithms | DSA |
| System Design | Low-Level Design (LLD) |
| System Design | High-Level Design (HLD) |
| Programming Languages | Python, Java, JavaScript |
| Frameworks | React.js, Next.js, FastAPI |

The subject list can be expanded in future versions.

**Requirements:**

- Display subjects in an organized layout.
- Allow multiple subject selections.
- Visually distinguish selected subjects.
- Require at least one subject.
- Provide a Continue button.
- Pass selected subjects to the interview session.

### 3.4 Interview Configuration

After selecting subjects, users should be able to configure their practice session.

**Initial configuration options:**

| Configuration | MVP Behaviour |
|---|---|
| Number of questions | 10 questions (default) |
| Question type | Multiple Choice |
| Difficulty | Easy, Medium, Hard (where available) |
| Selected subjects | Based on user selection |
| Timer | Optional; not required for initial MVP |

The initial question count should be configurable in the frontend, but the default should be 10.

### 3.5 Interview Session

This is the primary feature of the application.

Users will receive multiple-choice questions based on their selected subjects.

**Question interface requirements:**

- Display the user's name.
- Display the current question number.
- Display the total number of questions.
- Display the question text.
- Display four answer options.
- Allow users to select only one answer.
- Highlight the selected answer.
- Provide a Next Question button.
- Provide a Previous Question button.
- Display interview progress.
- Prevent submission without selecting an answer.

**Example:**

Question 1 of 10

Subject: Data Structures & Algorithms

What is the time complexity of searching for an element in a balanced Binary Search Tree?

A. O(1)

B. O(log n)

C. O(n)

D. O(n log n)

Correct answer: B. O(log n)

*Note: The correct answer must not be exposed to the user before the interview is submitted.*

### 3.6 Question Management

For the MVP, questions will be hardcoded.

No AI-generated questions or external question-generation services will be required initially.

**Question data structure:**

Each question should contain:

- Question ID.
- Subject.
- Topic.
- Difficulty.
- Question text.
- Option A.
- Option B.
- Option C.
- Option D.
- Correct answer.
- Explanation.

**Example JSON structure:**

```json
{
  "id": 1,
  "subject": "DSA",
  "topic": "Binary Search Tree",
  "difficulty": "Medium",
  "question": "What is the time complexity of searching in a balanced BST?",
  "options": [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)"
  ],
  "correct_answer": "B",
  "explanation": "A balanced BST has a height of O(log n), allowing logarithmic search."
}
```

Questions should be maintained in a centralized backend question dataset rather than scattered throughout frontend components.

### 3.7 Interview Submission

After answering the questions, users can submit their interview.

**Requirements:**

- Display a confirmation before final submission.
- Calculate the total number of correct answers.
- Calculate the total number of incorrect answers.
- Calculate the final percentage score.
- Generate a basic performance summary.
- Redirect the user to the results page.

### 3.8 Results and Performance Summary

After submission, users should see their interview performance.

**Results page requirements:**

Display:

- Student name.
- Selected subjects.
- Total questions attempted.
- Correct answers.
- Incorrect answers.
- Final score.
- Percentage.
- Basic performance assessment.

**Example:**

| Metric | Result |
|---|---|
| Student | Rahul |
| Total Questions | 10 |
| Correct Answers | 8 |
| Incorrect Answers | 2 |
| Score | 8/10 |
| Percentage | 80% |

**Performance feedback:**

- 90–100%: Excellent performance.
- 75–89%: Good performance.
- 50–74%: Average performance.
- Below 50%: Needs improvement.

The results page should also provide:

- Review Answers button.
- Retry Interview button.
- Return to Home button.

### 3.9 Answer Review

Users should be able to review their submitted answers.

For every question, display:

- Question text.
- User's selected answer.
- Correct answer.
- Whether the answer was correct or incorrect.
- Explanation.

This feature will help students understand their mistakes.

---

## 4. Technology Stack

The following technology stack will be used throughout the project.

### 4.1 Frontend

**Framework: Next.js**

Purpose: Building the user interface and frontend application.

Proposed technologies:

- Next.js (App Router).
- React.js.
- TypeScript.
- Tailwind CSS.
- Axios or native Fetch API.
- Lucide React for icons.

Responsibilities:

- Landing page.
- User information collection.
- Subject selection.
- Interview configuration.
- MCQ interface.
- Interview navigation.
- Results dashboard.
- Answer review.

Hosting: Vercel.

### 4.2 Backend

**Framework: FastAPI (Python)**

Purpose: Providing REST APIs and handling application business logic.

Proposed technologies:

- Python 3.12+.
- FastAPI.
- Pydantic.
- SQLAlchemy.
- Uvicorn.

Responsibilities:

- Question retrieval.
- Subject filtering.
- Interview session management.
- Answer submission.
- Score calculation.
- Results generation.
- Data validation.
- Database operations.

Hosting: Render.com.

### 4.3 Database

**Database: SQLite**

Purpose: Storing application data.

Proposed technologies:

- SQLite.
- SQLAlchemy ORM.

Potential database entities:

1. Questions.
2. Interview Sessions.
3. Interview Responses.
4. Subjects.

Although questions will initially be hardcoded, keeping the question structure database-compatible will make future migration easier.

### 4.4 Hosting and Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render.com |
| Database | SQLite |
| Source Code | GitHub |
| Version Control | Git |

### 4.5 Technology Stack Summary

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js |
| Frontend Language | TypeScript |
| UI Library | React.js |
| Styling | Tailwind CSS |
| Backend Framework | FastAPI |
| Backend Language | Python |
| API Communication | REST API |
| Database | SQLite |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Frontend Hosting | Vercel |
| Backend Hosting | Render.com |
| Repository | GitHub |

---

## 5. System Architecture

The application will follow a simple frontend-backend architecture with clear separation of responsibilities.

### 5.1 High-Level Architecture

```text
             STUDENT
                |
                v
       +------------------+
       |   Next.js UI     |
       |    (Vercel)      |
       +------------------+
                |
                | HTTPS / REST API
                |
                v
       +------------------+
       |   FastAPI        |
       |    (Render)      |
       +------------------+
                |
                v
       +------------------+
       | Business Logic   |
       |                  |
       | - Question       |
       |   Management     |
       | - Session        |
       |   Management     |
       | - Score          |
       |   Calculation   |
       +------------------+
                |
                v
       +------------------+
       |     SQLite       |
       |                  |
       | - Questions      |
       | - Sessions       |
       | - Responses      |
       +------------------+
```

### 5.2 Application Flow

1. Student opens the Next.js application.
2. Student clicks Start Practicing.
3. Student enters their name.
4. Student selects one or multiple subjects.
5. Student configures the interview.
6. Frontend requests questions from FastAPI.
7. Backend retrieves relevant questions.
8. Backend creates an interview session.
9. Frontend displays questions.
10. Student submits answers.
11. Backend evaluates the answers.
12. Backend calculates the final score.
13. Frontend displays the results.

---

## 6. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Users can access the platform without registration. | High |
| FR-02 | Users can enter their name. | High |
| FR-03 | Users can select multiple subjects. | High |
| FR-04 | Users can configure the question count. | Medium |
| FR-05 | Users can start an interview. | High |
| FR-06 | Questions are retrieved based on selected subjects. | High |
| FR-07 | Users can select one answer per question. | High |
| FR-08 | Users can navigate between questions. | High |
| FR-09 | Users can submit their interview. | High |
| FR-10 | The backend calculates interview scores. | High |
| FR-11 | Users can view their results. | High |
| FR-12 | Users can review submitted answers. | Medium |
| FR-13 | Users can retry an interview. | Medium |
| FR-14 | Users can return to the home page. | Medium |

---

## 7. Non-Functional Requirements

### 7.1 Performance

- Pages should load quickly.
- API responses should be efficient.
- Question retrieval should avoid unnecessary database queries.
- The interface should remain responsive during interview sessions.

### 7.2 Security

- Backend APIs should validate incoming requests.
- Correct answers should not be exposed before submission.
- CORS should allow only configured frontend origins in production.
- Sensitive configuration should be stored in environment variables.
- API errors should return appropriate HTTP status codes.
- User input should be validated before processing.

### 7.3 Usability

- The interface should be simple and intuitive.
- Students should be able to start an interview without unnecessary steps.
- Selected answers should be visually distinguishable.
- Interview progress should be clearly displayed.
- The platform should work on mobile and desktop.

### 7.4 Maintainability

- Frontend and backend code should be maintained separately.
- Backend logic should follow a modular structure.
- API endpoints should follow REST conventions.
- Question data should be maintained centrally.
- Code should be version-controlled using GitHub.

---

## 8. Proposed API Requirements

The FastAPI backend will expose the following REST endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/subjects` | Retrieve available subjects |
| GET | `/api/questions` | Retrieve questions based on filters |
| POST | `/api/interviews` | Create an interview session |
| GET | `/api/interviews/{id}` | Retrieve an interview session |
| POST | `/api/interviews/{id}/submit` | Submit interview answers |
| GET | `/api/interviews/{id}/results` | Retrieve interview results |
| GET | `/api/interviews/{id}/review` | Retrieve answer review |

**Important implementation detail:**

The question retrieval endpoint must not expose correct answers or explanations to the frontend before submission.

The backend should retain the answer key and perform score calculations server-side.

---

## 9. Proposed Database Design

Even though the first version will use hardcoded questions, the following database design will support future expansion.

### 9.1 Questions Table

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| subject | String | Technical subject |
| topic | String | Question topic |
| difficulty | String | Easy/Medium/Hard |
| question_text | Text | Question |
| option_a | String | Option A |
| option_b | String | Option B |
| option_c | String | Option C |
| option_d | String | Option D |
| correct_answer | String | Correct option |
| explanation | Text | Answer explanation |

### 9.2 Interview Sessions Table

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| student_name | String | Student name |
| selected_subjects | JSON/Text | Selected subjects |
| total_questions | Integer | Number of questions |
| score | Integer | Number of correct answers |
| percentage | Float | Final percentage |
| status | String | In progress/Completed |
| created_at | DateTime | Session creation time |

### 9.3 Interview Responses Table

| Column | Type | Description |
|---|---|---|
| id | Integer | Primary key |
| session_id | Integer | Interview session ID |
| question_id | Integer | Question ID |
| selected_answer | String | Student's answer |
| is_correct | Boolean | Answer correctness |

**Database design note:** The question IDs and answer keys should be stored server-side. Responses should be associated with a session so that results can be reconstructed reliably.

---

## 10. Frontend Pages and UI Requirements

The MVP should contain the following screens.

| Screen | Description |
|---|---|
| Home Page | Introduction and Start Practicing button |
| User Details Page | Collect student's name |
| Subject Selection Page | Select technical subjects |
| Interview Configuration Page | Configure question count and difficulty |
| Interview Page | Display and navigate MCQs |
| Results Page | Display performance summary |
| Answer Review Page | Display submitted answers and explanations |

### Suggested UI Design Direction

- Modern SaaS-style interface.
- Clean typography.
- Minimal visual clutter.
- Professional color palette.
- Responsive layouts.
- Progress indicators.
- Cards for subject selection.
- Clear visual feedback for selected answers.
- Consistent button styles.

The design should prioritize usability over unnecessary animations or complex visual effects.

---

## 11. Project Directory Structure

### 11.1 Frontend – Next.js

```text
frontend/
│
├── app/
│   ├── page.tsx
│   ├── user-details/
│   │   └── page.tsx
│   ├── subjects/
│   │   └── page.tsx
│   ├── configure/
│   │   └── page.tsx
│   ├── interview/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── results/
│   │   └── [id]/
│   │       └── page.tsx
│   └── review/
│       └── [id]/
│           └── page.tsx
│
├── components/
│   ├── ui/
│   ├── interview/
│   ├── subjects/
│   └── results/
│
├── services/
│   └── api.ts
│
├── types/
│
├── hooks/
│
└── package.json
```

### 11.2 Backend – FastAPI

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── routes/
│   │       ├── health.py
│   │       ├── subjects.py
│   │       ├── questions.py
│   │       └── interviews.py
│   │
│   ├── core/
│   │   └── config.py
│   │
│   ├── models/
│   │   ├── question.py
│   │   ├── interview.py
│   │   └── response.py
│   │
│   ├── schemas/
│   │   ├── question.py
│   │   └── interview.py
│   │
│   ├── services/
│   │   ├── question_service.py
│   │   ├── interview_service.py
│   │   └── scoring_service.py
│   │
│   └── db/
│       ├── database.py
│       └── seed.py
│
├── tests/
│
├── requirements.txt
└── README.md
```

---

## 12. GitHub and Deployment Strategy

The entire source code will be maintained in GitHub.

### Recommended Repository Structure

```text
ai-interview-coach/
│
├── frontend/
├── backend/
├── docs/
│   └── PRD.md
│
├── .gitignore
└── README.md
```

### Deployment Workflow

**Frontend:**

1. Develop the Next.js application.
2. Push frontend changes to GitHub.
3. Connect the GitHub repository to Vercel.
4. Configure the backend API URL.
5. Deploy the frontend.

**Backend:**

1. Develop the FastAPI application.
2. Push backend changes to GitHub.
3. Connect the repository to Render.
4. Configure Python build and start commands.
5. Configure environment variables.
6. Deploy the backend.

### Important SQLite Hosting Consideration

SQLite is suitable for this MVP, but its storage needs special attention on Render.

Render's default application filesystem is ephemeral. Therefore:

- Use a persistent disk for the SQLite database if the deployment plan supports it.
- Store the SQLite database on the mounted persistent disk.
- Ensure only one backend instance writes to the database.
- Maintain database backups.
- Do not store the database inside a temporary deployment directory.

If persistent storage is not available or the application needs multiple backend instances, consider migrating to PostgreSQL in a later phase.

---

## 13. MVP Out of Scope

To prevent scope creep, the following features will NOT be included in the first release.

| Feature | Status |
|---|---|
| User registration | Not included |
| User login/authentication | Not included |
| AI-generated questions | Not included |
| AI-powered answer evaluation | Not included |
| Code editor | Not included |
| Coding problem execution | Not included |
| Live interview simulation | Not included |
| Voice-based interviews | Not included |
| Speech recognition | Not included |
| Resume analysis | Not included |
| Personalized AI recommendations | Not included |
| Leaderboard | Not included |
| Payment integration | Not included |
| Admin dashboard | Not included |

These features may be considered for future versions.

---

## 14. Future Enhancements and Product Roadmap

The application should be designed so that additional capabilities can be introduced without significantly changing the existing architecture.

### Phase 1 – MVP (Current Scope)

- Landing page.
- Student name collection.
- Subject selection.
- Hardcoded MCQ questions.
- Interview session management.
- Answer submission.
- Score calculation.
- Results dashboard.
- Answer review.
- Deployment.

### Phase 2 – AI-Powered Question Generation

- Integrate an LLM API.
- Generate questions dynamically.
- Generate questions based on difficulty.
- Generate subject-specific questions.
- Generate explanations for answers.
- Expand the question bank.

### Phase 3 – Coding Interview Module

- Integrate a code editor.
- Add coding challenges.
- Support programming languages.
- Execute code using a secure execution service.
- Evaluate test cases.
- Provide coding feedback.

### Phase 4 – AI Interview Evaluation

- AI-based answer evaluation.
- Personalized feedback.
- Identify weak technical areas.
- Recommend topics for improvement.
- Generate interview performance reports.

### Phase 5 – Advanced Interview Experience

- Voice-based interviews.
- Real-time AI interviewer.
- Behavioral interview preparation.
- Resume-based interview questions.
- User accounts and historical performance.
- Progress tracking.

---

## 15. MVP Acceptance Criteria

The MVP will be considered successfully completed when all the following conditions are satisfied.

| ID | Acceptance Criteria |
|---|---|
| AC-01 | A student can access the application without logging in. |
| AC-02 | A student can enter their name. |
| AC-03 | A student can select multiple technical subjects. |
| AC-04 | The application retrieves relevant questions. |
| AC-05 | Each question displays four options. |
| AC-06 | A student can select one answer per question. |
| AC-07 | A student can navigate between questions. |
| AC-08 | The application prevents empty interview submissions. |
| AC-09 | The backend calculates the correct score. |
| AC-10 | The results page displays the final score and percentage. |
| AC-11 | A student can review submitted answers. |
| AC-12 | The application is deployed and accessible online. |
| AC-13 | The application works on desktop and mobile. |
| AC-14 | The backend does not expose correct answers before submission. |

---

## 16. Suggested Development Timeline

An indicative four-week development plan is proposed.

| Week | Development Activities |
|---|---|
| Week 1 | Project setup, UI design, landing page, user details, subject selection |
| Week 2 | FastAPI setup, question data, APIs, database structure, interview session |
| Week 3 | MCQ interface, navigation, submission, scoring, results and review |
| Week 4 | Testing, bug fixing, responsive design, GitHub integration and deployment |

The timeline can be adjusted depending on available development time.

---

## 17. Risks and Technical Considerations

| Risk | Mitigation |
|---|---|
| Hardcoded questions become difficult to manage | Centralize question data and use a consistent schema |
| SQLite data loss on deployment | Configure persistent storage and backups |
| Correct answers exposed through APIs | Keep answer keys server-side |
| Multiple submissions | Validate session status and make submission idempotent |
| Invalid user input | Use Pydantic validation |
| API connectivity issues | Handle API errors and display appropriate frontend messages |
| Scope expansion | Follow the defined MVP boundaries |

---

## 18. Success Metrics

The MVP will be evaluated based on the following measurable outcomes:

1. A student can start an interview without creating an account.
2. The complete interview workflow works from start to finish.
3. Questions are correctly filtered according to selected subjects.
4. Score calculations are accurate.
5. Results are displayed correctly.
6. The application is accessible through its deployed URL.
7. No critical functional bugs remain.

---

## 19. Final MVP Deliverables

At the end of the project, the following deliverables should be available:

1. Fully functional Next.js frontend.
2. Functional FastAPI backend.
3. SQLite database setup.
4. Hardcoded MCQ question bank.
5. REST API documentation.
6. Interview session workflow.
7. Score calculation functionality.
8. Results and answer review pages.
9. GitHub repository containing the complete codebase.
10. Deployed frontend on Vercel.
11. Deployed backend on Render.
12. Project documentation and README.

---

## 20. Final Product Definition

The initial version of AI Interview Coach will be a web application that allows students to practice technical interview questions without registration.

A student will enter their name, select one or more technical subjects, configure an interview, answer multiple-choice questions, submit their responses, and view their performance.

The initial question bank will be hardcoded to simplify development and allow the team to focus on the user experience, frontend implementation, backend APIs, and interview workflow.

The system will use Next.js for the frontend, FastAPI for the backend, SQLite for the database, Vercel for frontend hosting, Render for backend hosting, and GitHub for source code management.

**The primary goal of the MVP is to validate the complete interview preparation experience before introducing advanced AI capabilities.**

---

**Document End**

*Prepared for: AI Interview Coach – Capstone Project*  
*Version: 1.0*