// Public editorial structure adapted from the museum content master.
// Names, collection records, dates and prices are deliberately omitted until approved.
export const museumMenu = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Visit', id: 'visit' },
  { label: 'Exhibitions', id: 'galleries' },
  { label: 'Collections', id: 'collections' },
  { label: 'Meet the Heroines', id: 'heroines' },
  { label: 'Education', id: 'education' },
  { label: 'Research', id: 'research' },
  { label: 'Events', id: 'events' },
  { label: 'Museum Shop', id: 'shop' },
  { label: 'Support Us', id: 'support' },
  { label: 'News & Stories', id: 'news' },
  { label: 'Contact', id: 'contact' }
];

export const museumValues = [
  'Historical integrity', 'Dignity and respect', 'Recognition and justice',
  'Inclusivity and representation', 'Intergenerational responsibility',
  'Community stewardship', 'Healing and remembrance',
  'Independent and ethical governance', 'Empowerment through knowledge'
];

export const museumGalleries = [
  {
    number: '01', title: 'Hall of Liberation', image: 'assets/pdf-hero.png',
    description: 'Women’s experiences of struggle, community survival, leadership, displacement, care and nation-building are considered together, without reducing any life to one role.',
    themes: 'Liberation · community survival · leadership · resilience'
  },
  {
    number: '02', title: 'Hall of Remembrance', image: 'assets/pdf-banners.png',
    description: 'A space for memory and reflection, including lives and contributions held quietly within families and communities.',
    themes: 'Commemoration · personal histories · reflection'
  },
  {
    number: '03', title: 'Cultural Heritage Room', image: 'assets/pdf-col-objects.png',
    description: 'Clothing, beadwork, baskets, weaving, stories and other practices open conversations about identity and knowledge passed across generations.',
    themes: 'Material culture · craft · identity · teaching'
  },
  {
    number: '04', title: 'Her Voice Now', image: 'assets/pdf-support-hero.png',
    description: 'Contemporary women’s work in education, public life, science, business, the arts, sport, advocacy and community development shows history being made now.',
    themes: 'Contemporary voices · leadership · creative life'
  },
  {
    number: '05', title: 'Interactive Space', image: 'assets/learning-visit.jpg',
    description: 'Questions, listening, timelines and visitor contributions invite people to take part in the work of remembering.',
    themes: 'Participation · learning · shared memory'
  }
];

export const collectionTypes = [
  { title: 'Photographs', slot: 'collectionPhotographs', image: 'assets/pdf-col-photos.png', body: 'Family photographs, portraits and documentary images, shared with context and permission.' },
  { title: 'Objects', slot: 'collectionObjects', image: 'assets/pdf-col-objects.png', body: 'Clothing, beadwork, baskets, artworks and personal objects carry lived histories.' },
  { title: 'Documents', slot: 'collectionDocuments', image: 'assets/pdf-col-docs.png', body: 'Letters, books, papers and records help connect personal memory with historical evidence.' },
  { title: 'Oral histories', slot: 'collectionOralHistories', image: 'assets/pdf-col-oral.png', body: 'Recorded memories preserve voices when people have chosen to share them.' }
];

export const heroineCategories = [
  'Leadership', 'Education', 'Culture', 'Arts', 'Business', 'Community development',
  'Public service', 'Peacebuilding', 'Health', 'Sport', 'Media',
  'Science and technology', 'Humanitarian work', 'Advocacy'
];

export const learningProgrammes = [
  'Primary school museum discovery', 'Secondary school women’s history',
  'University research visits', 'Teacher development',
  'Youth leadership and identity', 'Heritage and culture workshops',
  'Oral-history projects', 'Creative museum workshops'
];

export const researchServices = [
  'Research enquiries', 'Collection access requests', 'Reference assistance',
  'Publication and citation guidance', 'Academic partnerships',
  'Oral-history research guidance'
];

export const eventFormats = [
  'Public talks', 'Workshops', 'Community dialogues', 'Heritage events',
  'Research talks', 'Film screenings', 'Youth programmes', 'Partner events'
];

export const shopCategories = [
  'Publications', 'T-shirts', 'Mugs', 'Scarves and head wraps',
  'Beadwork', 'Baskets and woven mats', 'Vases', 'Souvenirs'
];

export const supportWays = [
  'One-time and recurring gifts', 'Exhibition sponsorship', 'Education sponsorship',
  'Digital preservation', 'Oral-history support', 'Object donation',
  'In-kind support', 'Corporate partnership', 'Legacy giving'
];

export const newsCategories = [
  'Museum news', 'Women’s history', 'Object stories', 'Heroine profiles',
  'Exhibition stories', 'Education', 'Research', 'Community voices',
  'Events', 'Partnerships'
];

export const siteImageSlots = [
  { key: 'homeFeature', label: 'Home story feature' },
  { key: 'gallery01', label: 'Hall of Liberation' },
  { key: 'gallery02', label: 'Hall of Remembrance' },
  { key: 'gallery03', label: 'Cultural Heritage Room' },
  { key: 'gallery04', label: 'Her Voice Now' },
  { key: 'gallery05', label: 'Interactive Space' },
  { key: 'collectionPhotographs', label: 'Photographs collection' },
  { key: 'collectionObjects', label: 'Objects collection' },
  { key: 'collectionDocuments', label: 'Documents collection' },
  { key: 'collectionOralHistories', label: 'Oral histories collection' },
  { key: 'learning', label: 'Education feature' },
  { key: 'visit', label: 'Visit feature' }
];
