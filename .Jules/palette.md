## 2024-05-23 - Accessibility Labels on Icon Buttons
**Learning:** The app heavily relies on icon-only buttons for critical actions (attendance marking, deletion) without providing text alternatives. This makes the app unusable for screen reader users.
**Action:** Always verify `IconButton` components have an `accessibilityLabel` prop. Add tooltips where possible for sighted users on larger screens or pointer devices.
