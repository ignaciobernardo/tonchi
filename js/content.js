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

  // CV.txt (plain text, shown in the TextEdit-style window)
  cv: `TONCHI MATTA SCHILLING
Science communicator and public policy researcher.

---------------------------------------------------------------------------
EXPERIENCE
---------------------------------------------------------------------------

Aug 2026 - now       AI SAFETY INITIATIVE UC
                     Lead of Governance
                     - Organize events, talks, and discussion groups around
                       the future of AI in Chile.
                     - Coordinate research group on modeling the impacts of
                       frontier AI and AGI in middle powers.

Nov 2025 - Mar 2026  FUNDACIÓN KAMANAU
                     Intern
                     - Worked on research and drafting of the
                       recommendation for AI use in the courts of law for
                       the Inter-American Juridical Committee (CJI) of the
                       Organization for American States (OAS).
                     - Conducted comparative legal and policy research on
                       AI-assisted judicial decisions across multiple
                       jurisdictions.
                     - Arranged and led expert consultations with
                       specialists in AI, law, and the judiciary system;
                       synthesized findings into policy-ready documents.

Mar 2025 - Mar 2026  UNITED NATIONS
                     Youth Delegate Chile
                     - Advise UN system projects on youth participation,
                       technological governance, and digital transformation
                       for education.
                     - Consultant for the UN-Chile Cooperation Framework
                       for Sustainable Development (2026-2028),
                       contributing to policy design and cross-sector
                       coordination.

Aug 2022 - now       LABORATORY FOR AI, NEURORIGHTS, METAVERSE, AND DIGITAL
                     PLATFORMS, CHILEAN SENATE
                     Founding member
                     - Provide policy and regulatory analysis to Senate’s
                       “Commission for Future Challenges” on AI,
                       neurotechnologies, and emerging technologies.
                     - Draft technical evaluation of legislative projects.

Feb 2021 - now       FUNDACIÓN TREMENDAS
                     Advocacy leader
                     - Created and directed the implementation of
                       “Atómicas”, an educational program reaching 1,300
                       girls across 17 countries, with a focus on free and
                       accessible technology and science education.
                     - Led the initiative “10 Proposals by Girls and Youth”
                       within Chile’s Second Constitutional Process.
                     - Authored and defended a digital protection proposal
                       that passed the official citizen consultation
                       mechanism.

May 2023 - now       EDUCATIONAL CONTENT CREATOR
                     - Research, script, and write short-form educational
                       content about science, technology, and AI safety.
                     - 100K+ followers across social platforms.

Mar 2023 - Dec 2024  PONTIFICAL CATHOLIC UNIVERSITY OF CHILE
                     Teaching Assistant, Penta UC
                     - Designed and taught semester-long courses on
                       neuroscience, artificial intelligence and the mind,
                       and scientific communication to gifted students from
                       6th to 12th grade.

---------------------------------------------------------------------------
CERTIFICATIONS
---------------------------------------------------------------------------

2022                 FUNDAMENTALS OF NEUROSCIENCE
                     Harvard University

2022                 BLOCKCHAIN FUNDAMENTALS
                     UC Berkeley

2022                 PHILOSOPHY OF THE SCIENCES
                     University of Edinburgh

2024                 CS50
                     Harvard University

2026                 FRONTIER AI GOVERNANCE
                     Bluedot Impact

---------------------------------------------------------------------------
SKILLS
---------------------------------------------------------------------------

Academic writing, interdisciplinary research,
regulatory mapping, public policy, scientific
communication, social media content creation (90k+
followers across platforms), public speaking.

---------------------------------------------------------------------------
LANGUAGES
---------------------------------------------------------------------------

SPANISH              Native
ENGLISH              C2 (full proficiency)

---------------------------------------------------------------------------
AWARDS AND RECOGNITION
---------------------------------------------------------------------------

2023                 TOP 5 DEBATERS CHILE
                     World Schools Debating

2024                 “50 GENIAS DEL AÑO”
                     GENIAS

2024                 “OUR WORLD LEADERS”
                     Kid’s Choice awards Mexico, Nickelodeon

---------------------------------------------------------------------------
CONTACT
---------------------------------------------------------------------------

EMAIL                tmattas@estudiante.uc.cl
                     trinidadmattasch@gmail.com
LINKEDIN             https://www.linkedin.com/in/trinidadmatta/
INSTAGRAM            https://www.instagram.com/tonchimatta/
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
