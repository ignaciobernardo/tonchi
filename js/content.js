/* ------------------------------------------------------------------
   All the editable text/content of the portfolio lives here.
   Replace the lorem ipsum with the real thing whenever you like.
------------------------------------------------------------------- */
window.CONTENT = {
  siteTitle: 'Tonchi Matta',

  // Home page paragraphs (first thing you see)
  home: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  ],

  // CV.txt
  cv: `TONCHI MATTA
Lorem ipsum dolor sit amet
hello@example.com  ·  instagram.com/tonchimatta

------------------------------------------------------------
ABOUT
------------------------------------------------------------
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua.

------------------------------------------------------------
EXPERIENCE
------------------------------------------------------------
2025 - now     Lorem Ipsum Studio
               Dolor sit amet, consectetur adipiscing elit.

2023 - 2025    Consectetur Co.
               Sed do eiusmod tempor incididunt ut labore.

2021 - 2023    Adipiscing Agency
               Ut enim ad minim veniam, quis nostrud.

------------------------------------------------------------
EDUCATION
------------------------------------------------------------
2017 - 2021    Lorem Ipsum University
               Bachelor of Dolor Sit Amet

------------------------------------------------------------
SKILLS
------------------------------------------------------------
Lorem, ipsum, dolor, sit amet, consectetur, adipiscing,
elit, sed do, eiusmod, tempor.

------------------------------------------------------------
CONTACT
------------------------------------------------------------
hello@example.com
instagram.com/tonchimatta
`,

  links: {
    instagram: 'https://www.instagram.com/tonchimatta',
    github: 'https://github.com/tonchimatta'
  },

  // Notes app: preloaded notes. (Edits are kept in memory only.)
  notes: [
    { date: '2026-11-03T10:12:00', title: 'Welcome', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { date: '2026-10-28T18:40:00', title: 'Ideas', body: '- Lorem ipsum dolor\n- Sit amet consectetur\n- Adipiscing elit sed do\n- Eiusmod tempor' },
    { date: '2026-10-12T09:05:00', title: 'Reading list', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    { date: '2026-09-30T21:30:00', title: 'Lorem ipsum', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }
  ],

  // Photos app: add image paths here (e.g. 'assets/photos/one.jpg')
  photos: [
    'assets/portrait.jpg'
  ],

  // Contacts app
  contacts: [
    {
      first: 'Trinidad', last: 'Matta Schilling', nickname: 'Tonchi', pronouns: 'she · her', posterName: 'Tonchi Matta Schilling',
      fields: [
        { label: 'Gmail', value: 'trinidadmattasch@gmail.com', link: 'mailto:trinidadmattasch@gmail.com' }
      ]
    }
  ],

  // Calendar events: { date: 'YYYY-MM-DD', title: '...' }
  events: [
    { date: '2026-11-12', title: 'Lorem ipsum' },
    { date: '2026-11-20', title: 'Dolor sit amet' },
    { date: '2026-12-05', title: 'Consectetur' }
  ],

  // Spotify: playlist id from open.spotify.com/playlist/<ID>
  spotifyPlaylist: '37i9dQZF1DXcBWIGoYBM5M'
};
