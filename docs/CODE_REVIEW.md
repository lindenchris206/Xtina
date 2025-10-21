# Code Review Guidelines

This document outlines the standards and best practices for code review for the AI Crew Commander project.

## Principles

1.  **Clarity and Readability:** Code should be easy to understand. Use meaningful variable names and add comments for complex logic.
2.  **Consistency:** Adhere to the existing code style and project structure.
3.  **Performance:** Be mindful of performance implications. Avoid unnecessary re-renders in React and optimize backend queries.
4.  **Security:** All code should be written with security in mind. Sanitize inputs and validate data.

## Process

1.  **Create a Pull Request:** All new features and bug fixes should be submitted as pull requests.
2.  **Request a Review:** Tag at least one other developer to review your code.
3.  **Address Feedback:** Discuss and address any feedback provided by the reviewer.
4.  **Merge:** Once approved, the pull request can be merged into the main branch.

## Style Guide

- **Frontend:** React, TypeScript, TailwindCSS. Follow standard React hook rules.
- **Backend:** Node.js, Express. Use modern JavaScript (ESM modules).
- **Linting:** ESLint and Prettier are configured to enforce a consistent style.
