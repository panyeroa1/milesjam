
# Miles by Master E: UI Design System

## 1. Aesthetic Philosophy: "The Sesame Vibe"
The UI is inspired by a "Warm Minimalist" aesthetic. It prioritizes calm, organic interaction over busy digital interfaces. The goal is to make the user feel like they are interacting with a loyal companion (Miles) rather than a cold machine.

### Core Principles
*   **Warmth:** Using off-whites and natural greens instead of harsh blacks or neon colors.
*   **Focus:** Removing unnecessary clutter to highlight the "Core" (the visualizer).
*   **Presence:** Miles feels alive through "breathing" animations and reactive line-weights.

---

## 2. Visual Language

### Color Palette
| Element | HEX | Color Name | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `#fdfcf8` | Cream Pearl | Primary app canvas |
| **Primary Text** | `#5c633a` | Muted Olive | Typography and primary icons |
| **Visualizer/Active** | `#c5d299` | Light Sage | The "Core" and pulsating rings |
| **Secondary Fill** | `#f5f4e8` | Beige Sand | Control pill background |
| **Alert/Stop** | `#ff4d4d` | Soft Coral | Reset button |

### Typography
*   **Primary Font:** System-ui Sans-serif (SF Pro / Inter / Roboto).
*   **Weighting:** 
    *   Header Title: 600 (Semi-bold)
    *   Header Subtext: 400 (Regular) with 0.6 opacity.
    *   Timer: Monospace-leaning sans for stability.

---

## 3. Component Architecture

### A. The Header
Centered layout containing:
*   **Visual Toggle:** A small framed button labeled "2D" or "3D" to switch visualization modes.
*   **Main Title:** "Miles" followed by a dynamic MM:SS timer.
*   **Sub-branding:** "by Master E" in lowercase, light-weight font.
*   **Utility Icons:** Minimalist 24px stroke icons for Info and User Profile.

### B. The Main Stage (Visualizer)
A centered canvas area featuring two modes:
1.  **2D Mode:** 
    *   **The Core:** A solid light sage circle (`#c5d299`) that scales up during output.
    *   **Reactive Rings:** 5 concentric outer rings that pulse with audio.
2.  **3D Mode:**
    *   **The Orb:** A complex displacement-mapped 3D sphere with emissive properties.
    *   **Environment:** A subtle depth-based backdrop using Cream Pearl hues.

### C. The Control Pill
A floating action bar at the bottom:
*   **Shape:** 32px border-radius (pill shape).
*   **Function:** Houses the Microphone toggle (Sage when active) and the Stop/Reset button.

---

## 4. Behavioral Aesthetics

### Interaction States
1.  **Chillin' (Idle):** The visualizer performs a subtle "breathing" sine-wave animation at low amplitude.
2.  **Listening (User Speaking):** The rings glow brighter (higher opacity) and ripple outwards, acknowledging the user's presence.
3.  **Vibing (Miles Speaking):** The central core scales up significantly, and the rings become thicker and more structured, conveying power and charisma.

### Transitions
*   All color changes and button states use a `0.2s ease` transition to ensure the interface feels soft and responsive.
*   The Canvas resize logic uses Device Pixel Ratio (DPR) scaling for crisp rendering on high-resolution displays.
*   **Audio Safety:** Audio contexts are explicitly resumed on user interaction to ensure voice output is never blocked by browser policies.
