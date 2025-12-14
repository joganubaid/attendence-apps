## 2024-05-22 - Nested Component Definitions Causing Re-mounts
**Learning:** Defining Stack Navigator components (or any functional components) inside the main App component causes them to be re-created on every App render (e.g., when state updates). This forces React to unmount and remount the entire component tree, leading to loss of navigation state, focus, and scrolling position, as well as significant performance degradation.
**Action:** Always define navigator components (and helper components) outside of the main component. If they need access to state, pass that state as props.
