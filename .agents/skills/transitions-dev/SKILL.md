---
name: transitions-dev
description: >-
  Activate when implementing CSS/JS animation sequences, view transitions, page transitions,
  micro-interactions, spring physics, and fluid UI movement inspired by transitions.dev.
---

# 🪄 Transitions & Micro-Animations Skill

Guidance and standards for fluid web transitions and UI motion based on `transitions.dev`.

## Motion Principles
- **Purposeful Motion**: Every animation must communicate state change, spatial hierarchy, or user feedback. Avoid gratuitous motion.
- **Physics-Based Spring Timing**: Use cubic-bezier easing functions like `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) or spring-based transition curves (`cubic-bezier(0.34, 1.56, 0.64, 1)` for elastic feedback).
- **View Transitions API**: Leverage native View Transitions (`document.startViewTransition`) for morphing element containers across page navigations.
- **Hardware Acceleration**: Only animate `transform` and `opacity` to maintain 60 FPS performance without triggering browser layout shifts or repaints.
