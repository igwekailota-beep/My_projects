THEORA Application: Design Language Analysis

This document outlines the complete design language, color palettes, and component architecture for the THEORA web application.

1. Core Color Palette

The color system is the foundation of the design. It's built on a primary brand palette, standard semantic colors for user feedback, and a complete dual-theme (light/dark) system using CSS variables.

Brand & Semantic Colors

These colors are used consistently for branding, interactive elements, and user feedback (like success or error messages).

Purpose

CSS Variable

Hex Code

Description

Primary Blue

var(--primary-blue)

#00bcd4

The main brand color for buttons, links, and highlights.

Gradient Start

var(--gradient-start)

#00e0ff

Neon cyan, used in gradients for the logo and progress bars.

Gradient End

var(--gradient-end)

#00bfa6

Deep teal, the second color in the signature gradient.

Success

var(--success)

#4caf50

Green, used for positive feedback (e.g., "Expense Logged").

Warning

var(--warning)

#ffc107

Yellow, used for cautions (e.g., budget alerts).

Error

var(--error)

#f44336

Red, used for alerts and high-priority items.

Dual-Theme System (Light & Dark)

The entire app supports both modes, with Dark Mode as the default. This is controlled by the data-theme attribute on the <html> tag.

Element

CSS Variable

Light Mode (:root)

Dark Mode ([data-theme="dark"])

Main Background

var(--bg-primary)

#f0f7fa (Light Sky Blue)

#00111E (Dark Navy)

Card Background

var(--bg-secondary)

#ffffff (White)

#021B34 (Midnight Blue)

Primary Text

var(--text-primary)

#00111E (Dark Navy)

#f5faff (Soft White)

Secondary Text

var(--text-secondary)

#5A6B7B (Gray-Blue)

rgba(245, 250, 255, 0.7)

Borders

var(--border-color)

#dbe9f0 (Light Gray)

rgba(0, 188, 212, 0.2)

2. Typography

Font Family: Inter, a clean, highly legible sans-serif font. This is loaded from Google Fonts and is standard for modern UI design.

Hierarchy: The type scale is clear and consistent:

Brand Title (h1): 28px, 700 weight (Bold).

Page Title (h2): 28px, 700 weight (Bold).

Section Title (h5): 20px, 700 weight (Bold).

Card/Item Title (h6): 14px, 600 weight (Semi-Bold).

Body Text: 1rem (approx 16px), 400 weight (Regular).

Form Labels: 600 weight (Semi-Bold).

3. Layout & Component System

The UI is built on a responsive grid and a "card-based" system.

Layout


Responsiveness: The layout is fully responsive, stacking elements on mobile and expanding on larger screens.

Container: The main content is centered in a max-width: 1200px container, which is a standard desktop-first approach.

Page Structure: The app is a "single-page application" (SPA) divided into three main views (#authPage, #dashboardPage, #copilotPage) that are shown/hidden with JavaScript.

Core Component: Cards

Almost every piece of content is held within a "card."

Style: All cards (.auth-card, .stat-card, .task-card) share a consistent style:

Rounded Corners: A large border-radius (15px to 20px).

Background: Use var(--bg-secondary) to "lift" them off the main var(--bg-primary) background.

Borders: Use var(--border-color) for subtle definition.

Interactivity: Cards like .stat-card have a "lift" effect on hover (transform: translateY(-5px)) and a border highlight, inviting interaction.

Buttons & Forms

These are the primary interactive elements.

Buttons:

Primary Action (.btn-primary): Uses the signature var(--gradient-text) background.

Secondary Actions (.btn-outline-*): Use the semantic colors (blue, green, yellow) for their borders and text.

Shape: All buttons have a border-radius: 10px to match the cards.

Forms:

Inputs (.form-control) are also rounded (10px) and fully themed.

They use the theme's background and border colors.

A clear blue box-shadow and border color are applied on :focus for accessibility.

4. Interactivity & User Feedback

The app is designed to be proactive and conversational, not just a static page.

Proactive Notifications: The app uses two types of non-blocking alerts:

.notification-toast: Slides in from the right for event-driven feedback (e.g., "Task Added!").

.ai-tip-card: Slides in from the top for proactive, contextual advice (e.g., budget warnings).

Theme Toggling: The sun/moon icon in the navbar provides instant switching between Light and Dark modes, with the choice saved to localStorage and cloud for persistence.