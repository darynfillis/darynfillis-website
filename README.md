# SYG V35 Blobs Fix

Fixes MissingBlobsEnvironmentError by calling connectLambda(event) before getStore().

Required Netlify env var:
- SYG_PASSWORD

Deploy root files:
- /syg/index.html
- /netlify/functions/deals.js
- /netlify.toml
- /package.json

After deploy:
- Open /syg/
- Enter the password.
