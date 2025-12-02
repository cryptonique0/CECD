# CECD Backend

## Overview
The backend for CECD is built with Motoko for the Internet Computer.

## Structure
- `main.mo` - Main backend logic
- `migration.mo` - Database migration helpers
- `authorization/access-control.mo` - Access control system

## Development

### Prerequisites
- dfx SDK
- Motoko compiler

### Running Locally
```bash
dfx start --background
dfx deploy
```

### Testing
```bash
dfx canister call backend_canister test_function
```

## API Documentation
Coming soon...

## Contributing
See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
