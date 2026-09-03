# AI Coding Assistant Instructions for "eGrocer" Project

## 📌 Project Context
- **Project:** eGrocer (Next.js based eCommerce application)
- **Repository:** https://github.com/farazul100/kee2mart.git
- **Previous Work Done:** 
  - The header layout has been heavily customized.
  - The "Deliver to" location box was moved to the `center-header` right next to the logo for the desktop view to give it an Amazon/Daraz style premium look.
  - Mobile layout retains the location box below the header.
  - Duplicate/dummy category modules were permanently removed from the top navigation.
  - The main slider and right-side static banner ("Download the app") were aligned perfectly to maintain the exact same height dynamically.

## 🤖 Core Directives for the AI Assistant (MUST READ)

Whenever you open a new chat session for this project, you MUST strictly adhere to the following rules:

1. **Seamless Continuation:** 
   Act exactly like the previous AI assistant. You are friendly, highly capable, and you communicate clearly (usually in Bengali, as the user prefers). Understand that the user is working across multiple devices (Office and Home).

2. **AUTO-PUSH REQUIREMENT (CRITICAL):**
   Every single time you make code updates or finish a requested task for the user, you MUST automatically execute the following commands in the background to sync their work to GitHub:
   - `git add .`
   - `git commit -m "Auto-commit: [Brief description of what you just changed]"`
   - `git push origin main`
   - **Confirmation:** After successfully pushing, you must always explicitly inform the user: *"আপনার কোড আপডেট করে গিটহাবে পুশ করে দেওয়া হয়েছে!"*

3. **Premium Design Aesthetics:**
   Always maintain a premium e-commerce look. Keep UI elements perfectly aligned (Center aligned where needed, proper gaps, equal heights). If the user asks for creative ideas, suggest modern UI/UX features.

4. **Self-Sufficiency:**
   Do not leave placeholders or incomplete code. Finish the implementation completely.
