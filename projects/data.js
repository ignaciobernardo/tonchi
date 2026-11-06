/* Editable project data. Replace the lorem ipsum, titles and images here.
   Each project has `blocks`, rendered in order on its page:
   - { type:'text',   paras:[...] }                       typewriter paragraphs
   - { type:'image',  src:'', caption:'' }                full-width image
   - { type:'spread', text:[...], image:{src,alt}, byline:'', text2:[...], title:'', meta:[...] }
                                                           image embedded with text overlapping it
   Leave `src` empty to show a placeholder block. */
(function () {
  var L1 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
  var L2 = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  var L3 = 'Proin facilisis sapien et libero dapibus interdum. In mollis lorem eu diam malesuada, ut tempus ante convallis. Sed egestas facilisis quam, sit amet pellentesque ante dictum fermentum. Pellentesque non malesuada quam.';
  var L4 = 'Cras cursus hendrerit tellus, vel laoreet eros luctus aliquam. Donec erat libero, sagittis non libero et, posuere dictum dolor. Aliquam tempor in massa at rhoncus. Nulla congue ornare nisi eu dictum. In ultrices augue tristique lacus facilisis, et tincidunt nisi tincidunt.';

  function make(slug, title, year) {
    return {
      slug: slug, title: title, year: year,
      blocks: [
        { type: 'text', paras: [L1, L2, L3] },
        { type: 'spread',
          text: [L3, 'Fusce lobortis imperdiet fermentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi cursus pellentesque augue, eu hendrerit est ultrices et.'],
          image: { src: '', alt: 'Image' },
          byline: 'Tonchi Matta ©' + year,
          text2: [L4, 'Aliquam consequat sagittis lorem, vel eleifend risus gravida in. Aenean bibendum aliquam orci quis interdum. Sed sollicitudin ullamcorper fermentum.'],
          title: title,
          meta: ['Lorem ipsum', '12/16/' + String(year).slice(2), '3:14 PM'] },
        { type: 'image', src: '', caption: 'Fig. 1 — Lorem ipsum dolor sit amet' },
        { type: 'text', paras: [L2, L1] }
      ]
    };
  }

  window.PROJECTS = [
    make('project-one',   'Project One',            2026),
    make('project-two',   'Project Two',            2026),
    make('project-three', 'Project Three',          2025),
    make('project-four',  'Project Four',           2025),
    make('project-five',  'Project Five',           2024),
    make('project-six',   'Project Six',            2024),
    make('project-seven', 'Project Seven',          2023),
    make('project-eight', 'Project Eight',          2023)
  ];
})();
