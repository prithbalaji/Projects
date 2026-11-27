# FORM — Workout Generator

A responsive, dependency-free workout planning interface. Choose a training goal, body area, level, equipment, and session duration to generate a sample workout, then use the built-in timer.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/workout-generator/>.

## Features

- Training goals: strength, speed, power, isometric, endurance, and mobility.
- Body areas: full body, upper body, lower body, and core.
- Adjustable duration, level, and equipment selections.
- Generated exercise list with sets/reps or holds and rest guidance.
- Workout timer overlay and saved light/dark theme preference.

## Safety

This project uses a small built-in exercise library; the level and equipment controls are planning inputs, not medical or professional coaching. Adapt movements to your experience and available equipment, stop if you feel pain, and consult a qualified professional if you have health concerns. The generated plan is a starting point, not individualized medical advice.
