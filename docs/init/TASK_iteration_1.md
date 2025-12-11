# TASK_iteration_1

## 任务清单

### 1. Refactor System Management
- [ ] **Task-1.1**: Create `SystemCard` component.
- [ ] **Task-1.2**: Update `Systems.tsx` to use Grid layout + `SystemCard` instead of Table.

### 2. Enhance Timeline View
- [ ] **Task-2.1**: Implement `PlanRow` component (visualizing a single plan's lifecycle).
- [ ] **Task-2.2**: Update `TimelineView` to support `viewMode` toggle ('resource' | 'plan').
- [ ] **Task-2.3**: Update `Dashboard.tsx` to include the enhanced `TimelineView`.

### 3. Quick Conflict Check
- [ ] **Task-3.1**: Refactor `ConflictEngine` to export a standalone checking function `checkAvailability`.
- [ ] **Task-3.2**: Create `QuickCheckWidget` component (Form + Result Display).
- [ ] **Task-3.3**: Integrate `QuickCheckWidget` into Dashboard (top section).

### 4. Verification
- [ ] **Task-4.1**: Verify Plan View rendering.
- [ ] **Task-4.2**: Verify Quick Check logic with various date ranges.
- [ ] **Task-4.3**: Verify System Card operations (Edit/Delete).
