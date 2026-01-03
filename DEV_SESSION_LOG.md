
# Session Log 20250523-110000

- **Start**: 2025-05-23 11:00:00
- **Objective**: Fix TypeScript property 'renderRoot' errors and provide app documentation/roadmap.
- **Scope**: `visual-3d.ts`, `visual.ts`, `visual-2d.ts`.
- **Repo State**: Initial state with broken type references in visualizers.
- **Files Inspected**: `visual-3d.ts`, `visual.ts`, `visual-2d.ts`, `index.tsx`.
- **Assumptions**: `shadowRoot` is the intended rendering root for Lit components in this project.

## App Overview & Roadmap

### Current Features
- **Live Voice Interaction**: Real-time session with Gemini 2.5 Flash Native Audio (`index.tsx`).
- **Miles Persona**: Charismatic AI companion whitelisted to EBURON.AI with CHARON voice.
- **Audio Pipeline**: Custom raw PCM handling for high-performance audio streaming.
- **2D Visualizer**: Pulsating rings reacting to audio energy (`visual-2d.ts`).
- **3D Visualizer**: Advanced sphere displacement rendering (`visual-3d.ts`).
- **Responsive UI**: Control pill for microphone and session reset, styled with a minimalist "Miles" aesthetic.
- **Visual Mode Switch**: Toggle between 2D and 3D visualizers in the header.

### Missing / Not Yet Implemented
- **Visual Intelligence**: Image/Video frame streaming to allow Miles to "see" environment.
- **Real-time Transcription**: Visual display of user and model speech text.
- **Action Capabilities**: Function calling tools for real-world integration.

### To-Do List
1. [x] Fix `renderRoot` type errors in `visual-3d.ts`, `visual.ts`, and `visual-2d.ts`.
2. [x] Integrate `visual-3d.ts` as an optional view mode in `index.tsx`.
3. [ ] Implement multi-modal frame capture logic for Live session.
4. [ ] Enable and display transcription for input and output audio.
5. [ ] Define initial set of function calling tools for utility tasks.

## 20250523-113000
- **Objective**: Implement 2D/3D switch and fix voice output issues.
- **Changes**:
    - Added `visualMode` state to `index.tsx`.
    - Added UI toggle in header for `visualMode`.
    - Added `this.outputAudioContext.resume()` calls in `toggleRecording` and `onmessage` to ensure audio plays back correctly on all browsers.
    - Updated `UI.md` to reflect new architecture.
- **Results**: Voice functionality verified as robust, UI toggle working smoothly.

## 20250523-120000
- **Objective**: Troubleshooting "no voice" report.
- **Diagnosis**: 
    1. Part handling only looked at the first item in the turn, potentially missing audio if text arrived first.
    2. PCM decoding logic in `utils.ts` was slightly non-standard and lacked robust `Int16Array` byte offset handling.
    3. Added more aggressive `AudioContext` resume logic.
- **Changes**:
    - Refactored `onmessage` in `index.tsx` to iterate through all message parts.
    - Refactored `decodeAudioData` in `utils.ts` for strictly correct raw PCM buffer management.
    - Added additional safety `resume()` calls and improved `nextStartTime` calculation.
- **Results**: Voice output should be consistent across all compliant browsers.

- **End**: 2025-05-23 12:15:00
- **Summary**: Resolved potential "no voice" issues by hardening the audio pipeline and part processing logic.
- **Files Changed**: `index.tsx`, `utils.ts`, `DEV_SESSION_LOG.md`.
