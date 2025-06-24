# Agent Player Development Utilities

## 🔧 Makefile Commands

The project includes a comprehensive Makefile with automation commands:

```bash
# Get help with all available commands
make help

# Development workflow
make dev-setup          # Setup complete development environment
make run-backend        # Start backend server
make run-frontend       # Start frontend development server

# Rules management
make update-rules       # Update rules with current code structure
make validate-rules     # Validate rules completeness
make watch-rules        # Auto-update rules every 30 seconds

# Testing and quality
make test-all          # Run all tests (backend + frontend)
make lint-all          # Lint all code
make format-all        # Format all code

# Database operations
make db-migrate        # Run database migrations
make db-reset          # Reset database (WARNING: deletes data)

# Maintenance
make clean-logs        # Clean old log files
make status           # Show project status overview
```

## 🧪 Testing Utilities

- **test_rules.py**: Quick test script for the rules tracker system
  ```bash
  python test_rules.py
  ``` 