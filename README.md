# SYG V34 Login Debug

Deploy this version if you cannot get past the password page.

Changes:
- Password entry is trimmed to remove accidental spaces.
- Login page now shows exact error:
  - 401 = wrong password
  - 404 = function not deployed
  - 500 = missing SYG_PASSWORD or server setup issue
- Netlify files are at repo root.
- Main app file is /syg/index.html.

After deploy, test:
1. https://darynfillis.com/.netlify/functions/deals
   Expected without password: Incorrect/Unauthorized response, not 404.
2. https://darynfillis.com/syg/
   Enter exact SYG_PASSWORD.
