# Shared Photo Booth photos – setup (about 10 minutes, free)

Visitors take a photo in Photo Booth and choose **Save**. The photo is sent as *pending*.
Nobody sees it until you approve it in `/admin/`. Approved photos then show up in the
Photos app for every visitor.

1. Create a free project at https://supabase.com (any name, pick a region near you).
2. **SQL Editor → New query**, paste everything in `backend/supabase.sql`, **Run**.
   (If you log in with a different email than `trinidadmattasch@gmail.com`, change it in the file first.)
3. **Authentication → Users → Add user → Create new user**: your email + a password.
   Then **Authentication → Sign In / Providers → turn OFF "Allow new users to sign up"**.
4. **Project Settings → API**: copy the *Project URL* and the *anon / public* key
   into `js/config.js`. (The anon key is meant to be public; the rules in the SQL protect the data.)
5. Commit and push. Open `https://<your-site>/admin/`, log in, approve or reject photos.

Notes
- Photos are shrunk to ≤1000px wide before upload (~60–120 KB each); the free tier holds thousands.
- Anyone can submit a pending photo, so a bot could spam the queue. If that happens, delete them in
  /admin/ or ask me to add a captcha / rate limit.
- Photos are of strangers' faces: the Photo Booth prompt tells visitors they'll be shown publicly once approved.
