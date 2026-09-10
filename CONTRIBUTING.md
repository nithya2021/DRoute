# Contributing to DRoute

Thank you for your interest in contributing to DRoute! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others succeed
- Report issues responsibly

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/nithya2021/DRoute.git
cd DRoute
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
git checkout -b fix/your-bug-fix
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Development Setup
```bash
npm run dev
```

## Development Workflow

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Format with Prettier

```bash
npm run format
npm run lint
```

### Testing
Write tests for new features:
```bash
npm run test

# With coverage
npm run test:coverage
```

### Commit Messages
Use clear, descriptive commit messages:
```
feat: Add delivery status notifications
fix: Correct route optimization algorithm
docs: Update API documentation
test: Add tests for geocoding
refactor: Simplify route clustering logic
```

Format:
```
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Creating Pull Requests

### Before Creating PR
1. ✅ All tests pass: `npm run test`
2. ✅ No linting errors: `npm run lint`
3. ✅ Code formatted: `npm run format`
4. ✅ Branch is up to date with main

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## Testing
How to test the changes

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Code formatted
- [ ] Documentation updated
- [ ] No console errors
```

## Feature Development

### Backend Features (Server)
1. Add types to `packages/shared/src/types.ts`
2. Add API route handler
3. Add service layer if needed
4. Add tests to `packages/server/tests/`
5. Update documentation

### Frontend Features (Client)
1. Create component in `packages/client/src/components/`
2. Add styles to `src/styles/index.css`
3. Add API integration
4. Test in browser
5. Add unit tests if complex

### Database Schema Changes
1. Create migration file (when DB is added)
2. Update types
3. Update API handlers
4. Test migrations

## Testing Guidelines

### Test File Structure
```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = ...;
    
    // Assert
    expect(result).toBe(...);
  });
});
```

### Coverage Goals
- Aim for >80% code coverage
- Test error cases
- Test edge cases
- Test integration points

## Documentation

### Code Comments
- Explain WHY, not WHAT
- Use JSDoc for public APIs
- Keep comments up-to-date

### README Updates
- Update if adding new features
- Document API changes
- Add examples for complex features

### API Documentation
Document new endpoints:
```markdown
### POST /api/feature

Description of endpoint

**Request:**
```json
{
  "field": "value"
}
```

**Response:**
```json
{
  "success": true
}
```
```

## Performance Considerations

- Minimize bundle size
- Optimize database queries
- Use caching where appropriate
- Test with realistic data sizes
- Monitor memory usage

## Accessibility

- Ensure keyboard navigation works
- Use semantic HTML
- Add alt text to images
- Test with screen readers
- Maintain color contrast

## Security

- Validate all inputs
- Sanitize outputs
- Use parameterized queries
- Keep dependencies updated
- Report security issues privately

## Common Tasks

### Add a New API Endpoint
1. Create route in `packages/server/src/routes/`
2. Add types to shared
3. Add service logic
4. Add error handling
5. Add tests
6. Document endpoint

### Add a New Component
1. Create file in `packages/client/src/components/`
2. Import and use in main app or parent component
3. Add styling
4. Make responsive
5. Test in browser

### Update Dependencies
```bash
npm update
npm audit fix
npm run test
```

## Getting Help

- Check existing issues/discussions
- Read documentation
- Review similar code
- Ask in pull request comments
- Open a discussion for design questions

## Recognition

Contributors will be acknowledged in:
- README.md contributors section
- Release notes
- GitHub contributors page

## License

By contributing, you agree your code will be licensed under the project's license.

---

Thank you for contributing to DRoute!
