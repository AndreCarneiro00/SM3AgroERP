# Execution Plans

For large or cross-domain tasks, create an execution plan under:

docs/plans/<feature-name>.md

Before creating the plan:

1. Read the relevant domain documentation.
2. Inspect the existing implementation.
3. Identify affected modules.
4. Identify dependencies and risks.

The execution plan must contain:

- Goal
- Current state
- Design decisions
- Implementation steps
- Dependencies
- Validation
- Progress
- Discoveries

Keep the plan updated while implementing the task.

Do not mark a step as complete until it has actually been implemented.

If implementation reveals that the original plan is incorrect,
update the plan and record the reason.

Before considering the task complete:

1. Review the final diff.
2. Run relevant tests.
3. Verify the original requirements.
4. Update the plan with the final state.