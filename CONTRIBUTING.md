# Contributing to FilmMuse

Thank you for your interest in contributing to FilmMuse!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Set up environment variables (see `.env.example`)
5. Create a branch: `git checkout -b feature/your-feature-name`

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use absolute imports (`@/components/...`)
- Prefer server components when possible
- Use client components only when necessary (interactivity, hooks)

## Component Guidelines

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use the service layer for API calls
- Follow accessibility best practices (ARIA, semantic HTML)

## Testing

- Write tests for new features
- Ensure all tests pass: `npm run test`
- Run E2E tests: `npm run test:e2e`

## Pull Request Process

1. Ensure all tests pass
2. Run linting: `npm run lint`
3. Run type checking: `npm run typecheck`
4. Update documentation if needed
5. Create a pull request with a clear description

## Commit Messages

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring
- `test:` for tests
- `chore:` for maintenance

Example: `feat: add user search functionality`

