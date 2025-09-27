How to edit your portfolio (no coding required)

1) Open data files in the data/ folder
   - projects.json: add new project objects (title, description, tags, github/demo, date)
   - experience.json: add experiences (role, org, start, end, description)
   - timeline.json: update your education timeline

2) Blog posts
   - Add a new entry in blog/index.json { slug, title, date }
   - Create blog/<slug>.md with your markdown content

3) Contact email
   - In scripts/script.js, replace your.email@example.com with your real email
   - Optional: configure EmailJS keys by adding these globals in index.html before scripts:
     <script>window.EMAILJS_PUBLIC_KEY='';window.EMAILJS_SERVICE_ID='';window.EMAILJS_TEMPLATE_ID='';</script>

4) Branding
   - Replace assets/cv.pdf with your CV
   - Update social links in index.html hero section

5) Run locally
   - On Windows, just open index.html in a browser. For blog markdown fetches, use a simple local server:
     PowerShell: cd into the folder, then:  python -m http.server 3000
     Replace 3000 with any free port you prefer.



