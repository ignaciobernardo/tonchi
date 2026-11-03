/* Backend settings for shared Photo Booth photos (Supabase).
   Leave both empty and photos stay on each visitor's own device.
   Fill them in after following backend/README.md.
   The anon key is meant to be public – the database rules (backend/supabase.sql) are what protect the data. */
window.BACKEND = {
  supabaseUrl: '',        // e.g. 'https://abcdxyz.supabase.co'
  supabaseAnonKey: ''     // the "anon / public" key from Project Settings → API
};
