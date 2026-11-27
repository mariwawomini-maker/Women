// Public editorial architecture adapted from the She Stands Women’s Museum Content Master.
// Institutional dates, biographies, collection metadata and prices are published only through the Curator Desk once verified.

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

export const missionGoals = [
  'Restore women to their rightful place in national history.',
  'Safeguard women’s stories for future generations.',
  'Promote historical truth, dignity and remembrance.',
  'Inspire civic pride, gender equity and intergenerational learning.',
  'Serve as a platform for research, dialogue and recognition of national female heroines.'
];

export const whatWeDoList = [
  'Collect and care for objects and documentary material.',
  'Record and preserve oral histories where consent has been provided.',
  'Develop exhibitions and public programmes.',
  'Provide learning experiences for schools, universities and communities.',
  'Support responsible research.',
  'Create opportunities for communities to contribute knowledge.',
  'Promote intergenerational dialogue.',
  'Develop digital resources that expand access.'
];

export const museumValues = [
  {
    title: 'Historical integrity',
    body: 'Committed to accuracy, evidence-based interpretation and ethical documentation so women’s histories are preserved truthfully and without distortion.'
  },
  {
    title: 'Dignity and respect',
    body: 'Honouring lived experiences, sacrifices and agency with cultural sensitivity, consent and respect for survivors, families and communities.'
  },
  {
    title: 'Recognition and justice',
    body: 'Correcting historical omission by formally acknowledging women’s roles in liberation, peacebuilding, leadership and cultural preservation.'
  },
  {
    title: 'Inclusivity and representation',
    body: 'Representing women from all regions, communities, ethnic groups and generations of South Sudan so no single story defines national memory.'
  },
  {
    title: 'Intergenerational responsibility',
    body: 'Safeguarding women’s histories for future generations through education, knowledge transmission and youth engagement.'
  },
  {
    title: 'Community stewardship',
    body: 'Working in partnership with communities, veterans, elders, artists, scholars and families as custodians of shared heritage.'
  },
  {
    title: 'Healing and remembrance',
    body: 'Providing spaces for reflection, remembrance and healing while recognising the emotional weight of conflict, loss and resilience.'
  },
  {
    title: 'Independence and ethical governance',
    body: 'Operating with institutional independence, transparency and accountability in keeping with professional museum ethics.'
  },
  {
    title: 'Empowerment through knowledge',
    body: 'Strengthening national identity and gender equity through deeper public understanding of women’s historical contributions.'
  }
];

export const museumGalleries = [
  {
    number: '01',
    key: 'liberation',
    title: 'Hall of Liberation',
    image: 'assets/real-gallery-liberation.jpg',
    alt: 'Original museum painting portraying South Sudanese women liberation fighters',
    summary: 'Women, struggle, courage, sacrifice and nation-building.',
    description: 'Explores the many ways women participated in periods of struggle and transformation. Women carried families, supported communities, preserved information, provided care, contributed to movements and endured displacement and loss.',
    themes: [
      'Women and liberation',
      'Community survival',
      'Leadership under pressure',
      'Displacement and resilience',
      'Care and sacrifice',
      'Women’s participation in public life',
      'Memory and historical interpretation'
    ],
    features: ['Interactive timeline', 'Photographic stories', 'Oral-history excerpts', 'Document viewer', 'Featured biographies', 'Related artefacts']
  },
  {
    number: '02',
    key: 'remembrance',
    title: 'Hall of Remembrance',
    image: 'assets/real-gallery-remembrance.jpg',
    alt: 'Visitors and dignitaries reflecting beside the golden Hall of Remembrance plaques wall inside She Stands Women’s Museum',
    summary: 'Memory, commemoration, personal histories and reflection.',
    description: 'A quiet space recognising women whose lives and work deserve to remain part of collective memory — both public figures and those held quietly within families and communities.',
    themes: ['Commemoration', 'Personal histories', 'Family memory', 'Quiet persistence', 'Healing and reflection'],
    features: [
      'Who is a woman whose story should never be forgotten?',
      'What did she change, and what did she teach you?',
      'What would you want the next generation to know about her?'
    ]
  },
  {
    number: '03',
    key: 'heritage',
    title: 'Cultural Heritage Room',
    image: 'assets/real-gallery-heritage.jpg',
    alt: 'Cultural Heritage Room exhibition wall featuring woven baskets, calabashes, clay pottery and mats inside She Stands Women’s Museum',
    summary: 'Communities, identity, material culture and intergenerational knowledge.',
    description: 'Culture lives through people. Through clothing, beadwork, baskets, weaving, domestic objects, music and storytelling, this room explores how women preserve and pass cultural knowledge across generations.',
    themes: [
      'Textiles and dress', 'Beadwork and adornment', 'Basketry and weaving',
      'Household knowledge', 'Food and agricultural traditions', 'Storytelling',
      'Music and performance', 'Family traditions', 'Craft and livelihood', 'Intergenerational teaching'
    ],
    features: ['Contextualised community displays informed by cultural knowledge holders — no single object speaks for an entire community.']
  },
  {
    number: '04',
    key: 'contemporary',
    title: 'Her Voice Now',
    image: 'assets/real-gallery-voice-now.jpg',
    alt: 'Contemporary South Sudanese women leaders addressing audiences at the She Stands Women’s Museum launch podium',
    summary: 'Contemporary women shaping South Sudan today.',
    description: 'Brings women’s history into the present, highlighting contemporary women whose work shapes public life, education, science, business, arts, media, sport, advocacy and community development.',
    themes: ['Public life', 'Education & science', 'Business & enterprise', 'Arts, culture & media', 'Sport & advocacy', 'Community development'],
    features: ['Verified portraits', 'Key milestones', 'Approved interviews & quotations', 'Related themes & further reading']
  },
  {
    number: '05',
    key: 'interactive',
    title: 'Interactive Space',
    image: 'assets/real-gallery-interactive.jpg',
    alt: 'South Sudanese students participating in an interactive museum youth debate and dialogue session',
    summary: 'Questions, participation, learning and community contributions.',
    description: 'Asks visitors not only to learn about history, but to participate in it through listening stations, timelines, object stories, reflection prompts and the community memory wall.',
    themes: ['Community memory wall', 'Listening stations', 'Messages for future generations', 'Interactive timelines', 'Object-to-story discovery'],
    features: ['Add a memory to the community wall', 'Leave a message for future generations', 'Listen to an oral history', 'Explore women by field of contribution']
  }
];

export const collectionTypes = [
  {
    key: 'Photographs',
    title: 'Photographs',
    slot: 'collectionPhotographs',
    image: 'assets/real-col-photographs.jpg',
    alt: 'South Sudanese elder woman standing beside the golden memorial wall of honoured women at She Stands Women’s Museum',
    body: 'Family photographs, portraits and documentary images shared with historical context, attribution and permission.'
  },
  {
    key: 'Objects',
    title: 'Objects',
    slot: 'collectionObjects',
    image: 'assets/real-col-objects.jpg',
    alt: 'Hand-painted South Sudanese craft bowls, carvings and artisanal objects preserved at She Stands Women’s Museum',
    body: 'Clothing, beadwork, baskets, artworks and personal belongings carrying lived family and community histories.'
  },
  {
    key: 'Documents',
    title: 'Documents',
    slot: 'collectionDocuments',
    image: 'assets/real-col-documents.jpg',
    alt: 'Visitors exploring curated historical wall panels and glossary displays with audio headsets inside the museum',
    body: 'Letters, books, manuscripts, community records and personal papers linking lived memory with documentary evidence.'
  },
  {
    key: 'Oral histories',
    title: 'Oral histories',
    slot: 'collectionOralHistories',
    image: 'assets/real-col-oral.jpg',
    alt: 'Community speaker recording an oral-history interview outside the She Stands Women’s Museum entrance',
    body: 'Recorded interviews and transcripts preserving voices, songs and testimony shared with informed consent.'
  }
];

export const collectionsPrinciples = [
  'Document each object accurately with a stable catalogue identifier.',
  'Record provenance and ownership wherever available.',
  'Respect donor restrictions and community protocols.',
  'Record cultural context alongside physical description.',
  'Maintain appropriate storage and conservation care.',
  'Publish only material cleared for public access.',
  'Review sensitive material carefully before digitisation.',
  'Credit creators, donors and rights holders consistently.'
];

export const digitalMuseumFeatures = [
  'Digital exhibitions', 'Selected collection stories', 'Oral-history excerpts',
  'Searchable digital collections', 'Interactive timelines', 'Audio guides & transcripts',
  'QR-linked gallery content', 'Educational resources & downloads'
];

export const heroineCategories = [
  'Leadership', 'Education', 'Culture', 'Arts', 'Business', 'Community development',
  'Politics/public service', 'Peacebuilding', 'Health', 'Sport', 'Media',
  'Science and technology', 'Humanitarian work', 'Advocacy', 'Other contributions'
];

export const oralHistorySteps = [
  'Tell us what story, photograph, document or object you hold.',
  'Share basic context about the woman, place and period.',
  'Indicate whether you are open to a recorded interview or prefer to register the material.',
  'Museum curatorial staff review your submission carefully.',
  'Where appropriate, the team contacts you directly.',
  'Informed consent, rights and attribution are discussed before any recording or public use.',
  'Approved material is documented and preserved according to museum standards.'
];

export const learningProgrammes = [
  'Primary school museum discovery',
  'Secondary school women’s history',
  'University research visits',
  'Teacher development',
  'Youth leadership and identity',
  'Heritage and culture workshops',
  'Oral-history projects',
  'Creative museum workshops'
];

export const teacherResourceTypes = [
  'Pre-visit guide', 'Museum map', 'Gallery worksheet', 'Vocabulary sheet',
  'Discussion questions', 'Post-visit activity', 'Research topics', 'Teacher feedback form'
];

export const researchServices = [
  'Research enquiries',
  'Collection access requests',
  'Reference assistance',
  'Publication and citation guidance',
  'Academic partnerships',
  'Oral-history research guidance',
  'Researcher registration'
];

export const eventFormats = [
  'Exhibition openings', 'Public talks', 'School programmes', 'Workshops',
  'Community dialogues', 'Heritage events', 'Research talks', 'Film screenings',
  'Youth programmes', 'Special commemorations', 'Partner events'
];

export const shopCategories = [
  'Books and publications', 'Beadwork', 'Woven baskets and mats', 'Baskets',
  'Scarves', 'Head wraps', 'Moulded vases', 'T-shirts', 'Mugs', 'Souvenirs'
];

export const supportWays = [
  'One-time donation', 'Recurring donation', 'Exhibition sponsorship', 'Education sponsorship',
  'Digital preservation', 'Oral-history support', 'Object donation', 'In-kind support',
  'Corporate partnership', 'Legacy giving'
];

export const donationDesignations = [
  'General museum care',
  'Collections & conservation',
  'Oral-history documentation',
  'Exhibitions & galleries',
  'Education & school visits',
  'Digital preservation'
];

export const membershipTiers = [
  { name: 'Individual', note: 'For supporters connecting personally with exhibitions, talks and museum updates.' },
  { name: 'Student', note: 'Accessible membership supporting learners, university students and emerging researchers.' },
  { name: 'Family', note: 'Designed for households visiting galleries and intergenerational community programmes together.' },
  { name: 'Patron', note: 'Sustained patronage strengthening acquisitions care, oral-history recording and exhibitions.' },
  { name: 'Corporate / Institutional', note: 'Long-term organisational backing for heritage, learning and public access.' }
];

export const volunteerAreas = [
  'Visitor support', 'Museum guiding', 'Research', 'Education', 'Events',
  'Community outreach', 'Digital content', 'Photography', 'Translation', 'Collections support'
];

export const partnerTypes = [
  'Companies', 'Embassies & diplomatic missions', 'Foundations', 'Universities',
  'Schools', 'Cultural institutions', 'Development organisations', 'Media organisations',
  'Community organisations'
];

export const partnershipOpportunities = [
  'Exhibition sponsorship', 'Education sponsorship', 'Digital preservation',
  'Research collaboration', 'Public events', 'Community outreach',
  'In-kind support', 'Corporate volunteering', 'Cultural heritage projects'
];

export const newsCategories = [
  'Museum news', 'Women’s history', 'Object stories', 'Heroine profiles',
  'Exhibition stories', 'Education', 'Research', 'Community voices', 'Events', 'Partnerships'
];

export const pressKitItems = [
  'Museum fact sheet', 'Press releases', 'Approved biographies', 'Logo files',
  'Approved photographs', 'Exhibition descriptions', 'Media contact', 'Media coverage archive'
];

export const contactDepartments = [
  { key: 'general', label: 'General enquiry' },
  { key: 'group-tour', label: 'Visit / group booking' },
  { key: 'school-visit', label: 'School visit & education' },
  { key: 'research', label: 'Research & archive access' },
  { key: 'partnership', label: 'Partnerships & sponsorship' },
  { key: 'media', label: 'Media & press' },
  { key: 'donation', label: 'Donations & patronage' },
  { key: 'oral-history', label: 'Collections & oral histories' },
  { key: 'shop', label: 'Museum shop' },
  { key: 'rights-correction', label: 'Corrections, concerns & reproduction rights' }
];

export const newsletterInterestsList = [
  'Museum news', 'Exhibitions', 'Events & talks', 'Education & schools', 'Collections & research', 'Support & membership'
];

export const siteImageSlots = [
  { key: 'homeFeature', label: 'Home story feature' },
  { key: 'gallery01', label: '01 · Hall of Liberation' },
  { key: 'gallery02', label: '02 · Hall of Remembrance' },
  { key: 'gallery03', label: '03 · Cultural Heritage Room' },
  { key: 'gallery04', label: '04 · Her Voice Now' },
  { key: 'gallery05', label: '05 · Interactive Space' },
  { key: 'collectionPhotographs', label: 'Collection · Photographs' },
  { key: 'collectionObjects', label: 'Collection · Objects' },
  { key: 'collectionDocuments', label: 'Collection · Documents' },
  { key: 'collectionOralHistories', label: 'Collection · Oral histories' },
  { key: 'oralHistory', label: 'Oral history feature' },
  { key: 'learning', label: 'Education feature' },
  { key: 'visit', label: 'Visit feature' }
];

export const pageCopyGroups = [
  {
    title: 'Identity & Homepage',
    fields: [
      { key: 'positioningLine', label: 'Positioning line' },
      { key: 'foundationNote', label: 'Institutional positioning (Achol Philip Foundation)' },
      { key: 'heroTitle', label: 'Homepage headline' },
      { key: 'heroIntro', label: 'Homepage introduction' },
      { key: 'welcomeTitle', label: 'Welcome heading' },
      { key: 'welcomeBody', label: 'Welcome copy' },
      { key: 'brandPromise', label: 'Brand promise' },
      { key: 'closingCta', label: 'Closing call to action' }
    ]
  },
  {
    title: 'About, Mission & Vision',
    fields: [
      { key: 'aboutTitle', label: 'About heading' },
      { key: 'aboutIntro', label: 'About introduction' },
      { key: 'whyMuseum', label: 'Why a women’s museum?' },
      { key: 'mission', label: 'Mission statement' },
      { key: 'vision', label: 'Vision statement' }
    ]
  },
  {
    title: 'Galleries, Collections & Heroines',
    fields: [
      { key: 'galleriesTitle', label: 'Galleries heading' },
      { key: 'galleriesIntro', label: 'Galleries introduction' },
      { key: 'collectionsTitle', label: 'Collections heading' },
      { key: 'collectionsIntro', label: 'Collections introduction' },
      { key: 'heroinesTitle', label: 'Heroines heading' },
      { key: 'heroinesIntro', label: 'Heroines introduction' },
      { key: 'storiesTitle', label: 'Oral history heading' },
      { key: 'storiesIntro', label: 'Oral history introduction' }
    ]
  },
  {
    title: 'Visitor Operations, Hours & Access',
    fields: [
      { key: 'visitTitle', label: 'Visit heading' },
      { key: 'visitIntro', label: 'Visit introduction' },
      { key: 'address', label: 'Museum address' },
      { key: 'directions', label: 'Directions & arrival notes' },
      { key: 'visitHours', label: 'Opening hours' },
      { key: 'admissionInfo', label: 'Admission categories & fees' },
      { key: 'guidedToursInfo', label: 'Guided tours information' },
      { key: 'accessibilityInfo', label: 'Physical accessibility details' },
      { key: 'photographyRules', label: 'Photography & filming guidance' },
      { key: 'visitorConduct', label: 'Visitor conduct & care' }
    ]
  },
  {
    title: 'Learning, Research, Events, Shop & Support',
    fields: [
      { key: 'educationTitle', label: 'Education heading' },
      { key: 'educationIntro', label: 'Education introduction' },
      { key: 'researchTitle', label: 'Research heading' },
      { key: 'researchIntro', label: 'Research introduction' },
      { key: 'eventsTitle', label: 'Events heading' },
      { key: 'eventsIntro', label: 'Events introduction' },
      { key: 'shopTitle', label: 'Shop heading' },
      { key: 'shopIntro', label: 'Shop introduction' },
      { key: 'shopOrderingNote', label: 'Shop ordering & collection note' },
      { key: 'supportTitle', label: 'Support heading' },
      { key: 'supportIntro', label: 'Support introduction' },
      { key: 'membershipTerms', label: 'Membership fees & renewal terms' }
    ]
  },
  {
    title: 'News, Press, Contact & Policies',
    fields: [
      { key: 'newsTitle', label: 'News heading' },
      { key: 'newsIntro', label: 'News introduction' },
      { key: 'pressContact', label: 'Media & press contact note' },
      { key: 'contactTitle', label: 'Contact heading' },
      { key: 'contactIntro', label: 'Contact introduction' },
      { key: 'phone', label: 'Official phone number' },
      { key: 'email', label: 'Official email address' },
      { key: 'ethicalStatement', label: 'Ethical storytelling policy' },
      { key: 'copyrightPolicy', label: 'Copyright & reproduction policy' },
      { key: 'privacyPolicy', label: 'Privacy & consent notice' },
      { key: 'termsOfUse', label: 'Terms of use' }
    ]
  }
];
