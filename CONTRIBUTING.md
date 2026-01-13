# Contributing to HTMLify

**Contributions are welcome!**

Thank you for your interest in contributing to HTMLify!  

Before contributing, please take a moment to **read the guidelines** below.  
Following these ensures that your contributions are easier to review, maintain, and merge.

1. **Fork the repository**.
2. **Create a new branch** (`git checkout -b feature/your-feature`).
3. **Make your changes and commit them** (`git commit -m "Add feature"`).
4. **Push to the branch** (`git push origin feature/your-feature`).
5. **Create a Pull Request**.

---

## Philosophy

* Keep the system simple and explicit, like HTML
* The platform should remain predictable and stable
* New features should align with code/project sharing
* When in doubt, follow the existing patterns in the codebase
* Avoid unnecessary abstractions
* Avoid unnecessary dependencies
* Avoid introducing dependencies for small or isolated functionality  
  If a dependency is only used for a single feature, consider implementing  
  the functionality directly instead, or at least consider doing so
* Respect the existing architecture
* Rules can bend, but that does not mean they should be bent

---

## Contribution Guidelines

To keep the repository clean, secure, and maintainable, please follow these guidelines:

* **Do not commit binary files** unless explicitly requested by a maintainer.
* **Do not add new dependencies or vendor libraries** without prior discussion with a maintainer.
* **Do not commit vendor libraries**, vendors should be setup via setup script.
* **Do not do major UI changes** without prior discussion with a maintainer.
* **Low-effort AI-generated content ("AI slop") is not acceptable**. Utilizing AI is acceptable.  
  Submitting unreviewed, poorly structured, irrelevant, or bloated AI output is not.

---

## Coding Conventions

While contributing, consider following guidelines for that specific language or the section.  

> **Note**  
> These conventions are **suggestions, not strict requirements**.  
> Contributions will not be rejected solely for not following them, but following these  
> conventions helps keeping the codebase consistent, readable, and easier to maintain.  

### General Principles

* Prefer clarity over brevity
* Avoid abbreviations unless they are well-known
* Names should describe what, not how
* If the scope of a variable is large, use a more descriptive name
* Try to follow the existing style in the surrounding code
* Comment complex logic, not obvious code
* Use 4 Space Indenting

---

### Python

Python being the main programming language, responsible for the backend.

* For naming variables and functions, use `snake_case`.
* For naming classes, use `PascalCase`.
* For naming constant variables, use `UPPER_SNAKE_CASE`.
* For naming files, use `snake_case`.

---

### JavaScript

For the frontend interactivity JavaScript is utilized.

* For naming variables and functions, use `camelCase`.
* For naming classes, use `PascalCase`.
* For naming constants, use `UPPER_SNAKE_CASE`.
* For naming files, use `kebab-case`.

---

### HTML

HTMLify without HTML?  
HTMLify uses Jinja2 as its template engine.  
When we refer to HTML in this project, we primarily mean Jinja templates.  
Python conventions are applicable for Jinja logic, rest HTML.

* Use semantic HTML, whenever possible.
* Use lowercase tag names.
* For naming `id` of elements, use `kebab-case`.
* For naming files, use `kebab-case`.

---

### CSS

CSS is used for styling and layout.

* For class names, use `kebab-case`.
* For naming files, use `kebab-case`.
* Try to keep styles modular and reusable

