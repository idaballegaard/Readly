# Book-API

[![Playwright PR Checks](https://github.com/idaballegaard/Book-API/actions/workflows/playwright-pr.yaml/badge.svg)](https://github.com/idaballegaard/Book-API/actions/workflows/playwright-pr.yaml)

## CI Requirements

The pull request workflow runs both backend and frontend Playwright tests automatically.

Required repository secrets (names only):

- DBHOST
- TOKEN_SECRET

Notes:

- Do not store secret values in source files or README.
- Configure secrets in GitHub repository settings under Secrets and variables -> Actions.
