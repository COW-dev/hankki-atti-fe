# AGENTS.md

This repository is maintained by multiple developers and AI coding agents.

The primary goal is to keep the project structure predictable, modular, and easy to understand for new contributors.

## Core Principle

The folder structure should act as documentation.

A new developer should be able to understand where code belongs simply by looking at the repository structure.

---

# Repository Structure

```text
root/
├─ apps/
│  └─ web/
│
├─ packages/
│  ├─ ui/
│  ├─ tokens/
│  └─ icons/
│
├─ .storybook/
├─ docs/
└─ README.md
```

## `apps/web`

Contains the actual product application.

Place here:

- pages
- routes
- features
- API integration
- business logic
- application-specific components
- application state
- service-specific utilities

Do not place reusable design-system components here.

---

## `packages/ui`

Contains reusable UI components shared across the project.

Examples:

- Button
- Input
- Select
- Card
- Modal
- Dialog
- Badge
- Tabs
- Checkbox
- Radio
- Tooltip

Components in this package should remain as independent from business logic as possible.

Prefer this structure:

```text
packages/ui/src/Button/
├─ Button.tsx
├─ Button.stories.tsx
├─ Button.test.tsx
└─ index.ts
```

Before creating a new component, always check whether a similar component already exists.

Do not create duplicate UI components.

---

# Component Placement Rules

Use the following decision rule.

```text
Reusable visual component
→ packages/ui

Used across multiple pages
→ packages/ui

Pure presentation component
→ packages/ui

Specific to one feature
→ apps/web

Contains business logic
→ apps/web

Strongly coupled to API/domain logic
→ apps/web
```

Do not move every component into the design system.

Only components that are reasonably reusable should belong in `packages/ui`.

---

# Design Tokens

Design tokens should be managed through:

```text
packages/tokens
```

Examples include:

- colors
- spacing
- typography
- font sizes
- border radius
- shadows
- breakpoints
- z-index

Avoid repeatedly hardcoding arbitrary visual values when an existing design token can be used.

Before adding a new token, check whether an equivalent token already exists.

---

# Icons

Shared icons belong in:

```text
packages/icons
```

Do not duplicate the same SVG or icon implementation across the application.

---

# Storybook

Storybook is used to document and validate the shared UI system.

Storybook configuration belongs in:

```text
.storybook/
```

Stories should generally live next to their components.

Example:

```text
packages/ui/src/Button/
├─ Button.tsx
└─ Button.stories.tsx
```

Storybook must render the same components used by the actual application.

Never create separate Storybook-only copies of UI components.

The intended relationship is:

```text
Storybook
    ↓
packages/ui
    ↑
apps/web
```

Both the application and Storybook must consume the same source components.

---

# Story Requirements

When adding or significantly changing a reusable UI component, update its Storybook stories.

Include relevant states when applicable:

- Default
- Disabled
- Loading
- Error
- Focus
- Size variants
- Visual variants
- Empty states
- Edge cases

Do not create unnecessary stories for trivial implementation details.

---

# Working With Existing Code

Do not perform large-scale restructuring without first understanding the existing repository.

Before modifying architecture:

1. Inspect the current folder structure.
2. Identify existing patterns.
3. Check for reusable components.
4. Check for duplicate implementations.
5. Check existing design tokens.
6. Determine the smallest reasonable change.

Prefer incremental refactoring over large rewrites.

Avoid breaking existing imports unnecessarily.

---

# When Creating New Features

Follow this order before writing new code:

1. Check whether the required component already exists.
2. Check whether an existing component can be extended.
3. Check whether a design token already exists.
4. Decide whether the code belongs to the application or design system.
5. Implement the smallest reusable abstraction necessary.

Do not abstract prematurely.

---

# Import Boundaries

Application code may depend on shared packages.

```text
apps/web
  ↓
packages/ui
packages/tokens
packages/icons
```

Shared packages should not depend on application-specific code.

Avoid dependencies such as:

```text
packages/ui
  ↓
apps/web
```

This direction is not allowed.

The design system must remain independent from product-specific business logic.

---

# Naming and Organization

Use predictable and descriptive names.

Avoid folders such as:

```text
common/
misc/
others/
temp/
new/
backup/
```

unless there is a strong reason.

Prefer names that describe responsibility.

Example:

```text
components/
features/
hooks/
services/
utils/
```

Keep files close to the feature or component that owns them.

---

# Documentation

Architecture-related decisions should be documented under:

```text
docs/
```

Recommended files:

```text
docs/
├─ architecture.md
├─ design-system.md
└─ conventions.md
```

When changing an important structural rule, update the relevant documentation.

---

# AI Agent Guidelines

When acting as an AI coding agent:

Do not immediately create new files.

First inspect the repository and reuse existing patterns whenever possible.

Before implementing a task:

1. Locate related files.
2. Inspect nearby implementations.
3. Search for existing reusable components.
4. Search for existing design tokens.
5. Identify existing conventions.
6. Make the smallest coherent change.

Do not introduce a new architecture pattern when an established pattern already exists.

Do not duplicate components simply because creating a new one is easier.

Prefer consistency with the repository over personal implementation preference.

---

# Refactoring Rules

Refactoring is encouraged when it improves maintainability, but it must remain scoped to the requested task.

Avoid unrelated refactoring.

Do not rename or move large numbers of files unless necessary.

When moving files:

- update imports
- preserve functionality
- check type errors
- check build errors
- update tests
- update Storybook when relevant

---

# Completion Checklist

Before considering a task complete, verify:

- No unnecessary duplicate component was introduced.
- The file is located in the correct architectural layer.
- Existing design tokens were reused where appropriate.
- Shared components remain independent from business logic.
- Imports follow the intended dependency direction.
- Relevant Storybook stories were updated.
- Existing behavior was not unintentionally broken.
- Documentation was updated if architecture changed.

---

# Priority

When there is uncertainty, prioritize decisions in this order:

1. Existing project conventions
2. Maintainability
3. Reusability
4. Simplicity
5. Developer convenience

Do not optimize only for the fastest implementation.

The repository is expected to be maintained by developers who may not be familiar with previous implementation decisions.

## Application in this repository

Development follows this document together with [design-system.md](design-system.md): architecture owns placement and dependency direction; the design-system document owns tokens, typography, size modes, components, and accessibility.

- The pnpm workspace contains `@hankki/web`, `@hankki/ui`, `@hankki/tokens`, and `@hankki/icons`. Packages are private and export source without a separate build step. Root scripts run the app and shared checks.
- `apps/web` owns routes, authentication, API code, environment files, brand imagery, and product-specific layout/settings components. Its `@/` alias resolves to the app root. Shared packages use package names externally and relative imports internally.
- Generic Button/ButtonLink, TextField, ErrorNotice, and Block live in `packages/ui/src`. Icon lives in `packages/icons/src`, and original SVGs live in `packages/icons/svg`. The app's public icons symlink preserves `/icons/*.svg`.
- PageShell, TopBar, StudentTabBar, Footer, Logo, and A11yToggle stay in the app because they own product layout, navigation, branding, or device settings. They still have colocated Storybook stories.
- Storybook stays at the repository root and consumes package and app component stories. Application and Storybook CSS import the same token/style entry point and explicitly scan shared package sources.
