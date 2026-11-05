import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SocialLink = { name: string; url: string };

export interface StoryItem {
  id: string;
  archiveId: string;
  tag: string;
  SpotlightTag: string;
  category: string;
  title: string;
  spotlightTitle: string;
  quote: string;
  body: string;
  spotlightBody: string;
  duration: string;
  durationSeconds: number;
  image: string;
  spotlightImage: string;
  location: string;
  year: string;
  narrator: string;
  interviewer: string;
  transcript: { time: string; speaker: string; text: string }[];
}

export interface ArchiveRecord {
  id: string;
  title: string;
  type: 'Oral histories' | 'Photographs' | 'Objects' | 'Documents';
  person: string;
  place: string;
  theme: string;
  decade: string;
  summary: string;
  image: string;
}

@Component({
  selector: 'ss-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {
  private http = inject(HttpClient);
  api = (window as Window & { __SHE_STANDS_API_URL__?: string }).__SHE_STANDS_API_URL__ || `${window.location.protocol}//${window.location.hostname}:4000/api`;
  isAdmin = window.location.pathname.startsWith('/admin');
  navOpen = false;
  helpOpen = false;
  activeNav = 'home';

  heroImage = 'assets/hero-editorial-v2.png';
  heroOverride = '';
  heroAudio = '';
  siteImages: Record<string, string> = {};
  socials: SocialLink[] = [{ name: '@sswomensmuseum.ss', url: 'https://www.instagram.com/sswomensmuseum.ss/' }];

  navItems: [string, string][] = [
    ['Home', 'home'],
    ['About', 'about'],
    ['Stories', 'stories'],
    ['Collections', 'collections'],
    ['Exhibitions', 'exhibitions'],
    ['Learn', 'learn'],
    ['Visit', 'visit'],
    ['Get Involved', 'involved']
  ];

  stories: StoryItem[] = [
    {
      id: 'nyandeng',
      archiveId: 'SSWM-OH-018',
      tag: 'ORAL HISTORY',
      SpotlightTag: 'ORAL HISTORY • LIBERATION & MEMORY',
      category: 'Liberation',
      title: 'Nyandeng: Keeper of Memory',
      spotlightTitle: 'NYANDENG:\nKEEPER OF MEMORY',
      quote: '“When we carried our children across the rivers, we also carried the songs and names of every grandmother before us.”',
      body: 'A story of community, ceremony and the strength passed from mother to daughter.',
      spotlightBody: 'Recorded in Bor and Juba. This testimony traces how elder women preserved lineage songs, seed grain and community ceremonies across decades of upheaval.',
      duration: '14:22',
      durationSeconds: 862,
      image: 'assets/pdf-story-1.png',
      spotlightImage: 'assets/pdf-story-1.png',
      location: 'Bor & Juba, South Sudan',
      year: '2025',
      narrator: 'Mama Nyandeng Chol (b. 1952)',
      interviewer: 'Achol Philip Archive Team',
      transcript: [
        { time: '00:00', speaker: 'Archivist', text: 'Recording SSWM-OH-018 at Hai Jalaba Studio, Juba. Mama Nyandeng, thank you for sitting with us today.' },
        { time: '01:14', speaker: 'Nyandeng', text: 'My mother taught me that a home is not only mud and thatch. A home is the memory kept by the women who cook, sing and settle disputes under the tamarind tree.' },
        { time: '04:50', speaker: 'Nyandeng', text: 'During the years of displacement, we sewed seeds and small brass beads into the hems of our wraps so our daughters would know where they came from.' },
        { time: '09:35', speaker: 'Nyandeng', text: 'When young women visit this museum today, I want them to stand tall and know their grandmothers never surrendered their dignity.' }
      ]
    },
    {
      id: 'achol',
      archiveId: 'SSWM-OH-024',
      tag: 'PEACEBUILDING',
      SpotlightTag: 'ORAL HISTORY • PEACEBUILDING',
      category: 'Peacebuilding',
      title: 'Achol: Listening for Peace',
      spotlightTitle: 'ACHOL:\nLISTENING FOR PEACE',
      quote: '“Our stories are not only about what happened. They are also about what we chose to build afterward.”',
      body: 'An intimate conversation about dialogue, dignity and women at the peace table.',
      spotlightBody: 'Recorded in Juba. This story traces women’s work in community dialogue, reconciliation and the patient rebuilding of trust.',
      duration: '12:48',
      durationSeconds: 768,
      image: 'assets/pdf-story-2.png',
      spotlightImage: 'assets/pdf-oral-history.png',
      location: 'Juba, South Sudan',
      year: '2025',
      narrator: 'Achol Deng (Peace Mediator)',
      interviewer: 'She Stands Oral History Studio',
      transcript: [
        { time: '00:00', speaker: 'Archivist', text: 'Archive recording SSWM-OH-024, recorded in Juba. Conversation with community mediator Achol Deng on women-led peace circles.' },
        { time: '02:08', speaker: 'Achol', text: 'Before formal treaties are signed in halls, women have already walked between cattle camps and neighborhoods to reopen markets and shared wells.' },
        { time: '06:19', speaker: 'Achol', text: 'Our stories are not only about what happened. They are also about what we chose to build afterward—how we listened when everyone else was shouting.' },
        { time: '10:42', speaker: 'Achol', text: 'Peace is daily work. It lives in how we teach our sons and daughters to remember without hatred.' }
      ]
    },
    {
      id: 'mary',
      archiveId: 'SSWM-OH-031',
      tag: 'CULTURE',
      SpotlightTag: 'ORAL HISTORY • CULTURE & IDENTITY',
      category: 'Culture',
      title: 'Mary: Threads of Identity',
      spotlightTitle: 'MARY:\nTHREADS OF IDENTITY',
      quote: '“Every bead pattern has a grammar. In red, white and black, a woman writes the history of her family.”',
      body: 'Adornment, craft and song become a living archive of belonging.',
      spotlightBody: 'Recorded in Wau and Juba. Master beadworker and educator Mary Kiden explains how corsetry, woven baskets and ceremonial textiles encode generational history.',
      duration: '11:05',
      durationSeconds: 665,
      image: 'assets/pdf-story-3.png',
      spotlightImage: 'assets/pdf-story-3.png',
      location: 'Wau, South Sudan',
      year: '2025',
      narrator: 'Mary Kiden (Master Artisan)',
      interviewer: 'She Stands Curatorial Desk',
      transcript: [
        { time: '00:00', speaker: 'Archivist', text: 'Recording SSWM-OH-031 with master artisan Mary Kiden, examining beaded collars from the permanent collection.' },
        { time: '02:40', speaker: 'Mary', text: 'When you look closely at a beaded collar or a woven winnowing tray, you are reading a document older than paper.' },
        { time: '07:12', speaker: 'Mary', text: 'Young women in our workshops learn both the craft and the proverbs that accompany each stitch.' }
      ]
    },
    {
      id: 'future',
      archiveId: 'SSWM-OH-042',
      tag: 'NATION-BUILDING',
      SpotlightTag: 'ORAL HISTORY • EDUCATION & LEADERSHIP',
      category: 'Leadership',
      title: 'Her Voice, Our Future',
      spotlightTitle: 'HER VOICE,\nOUR FUTURE',
      quote: '“We stand on the shoulders of women who built classrooms under trees so that we could lead a nation.”',
      body: 'Young women inherit a history of courage - and carry it forward.',
      spotlightBody: 'Recorded in Juba. Intergenerational dialogue between pioneering teachers, student leaders and archivists shaping South Sudan’s civic future.',
      duration: '15:10',
      durationSeconds: 910,
      image: 'assets/pdf-story-4.png',
      spotlightImage: 'assets/pdf-hero.png',
      location: 'Hai Jalaba, Juba',
      year: '2026',
      narrator: 'Abuk & Mama Rebecca (Intergenerational Dialogue)',
      interviewer: 'She Stands Education Programme',
      transcript: [
        { time: '00:00', speaker: 'Archivist', text: 'Recording SSWM-OH-042 at the She Stands Women’s Museum gallery, Hai Jalaba.' },
        { time: '03:15', speaker: 'Abuk', text: 'Standing beside my grandmother in this gallery changed how I see my own education. History is not distant—it is standing right next to us.' },
        { time: '08:50', speaker: 'Mama Rebecca', text: 'We planted the trees in hard soil. Now our daughters and granddaughters will gather the harvest in knowledge and leadership.' }
      ]
    }
  ];

  activeStory: StoryItem = this.stories[1]; // Default to "Achol: Listening for Peace" as in PDF Page 4

  // Audio player state for Page 4 Oral History Studio
  isPlayingAudio = false;
  audioProgress = 28; // matches the visual progress position in PDF Page 4
  audioCurrentSeconds = 215;
  private audioTimer: any = null;
  private htmlAudio: HTMLAudioElement | null = null;

  collections = [
    { name: 'ORAL HISTORIES', key: 'Oral histories', count: '126 records', image: 'assets/pdf-col-oral.png', detail: 'First-person audio and video testimonies recorded across all ten states.' },
    { name: 'PHOTOGRAPHS', key: 'Photographs', count: '2,430 records', image: 'assets/pdf-col-photos.png', detail: 'Studio portraits, family albums, liberation archives and community gatherings.' },
    { name: 'OBJECTS', key: 'Objects', count: '384 records', image: 'assets/pdf-col-objects.png', detail: 'Beadwork, terracotta sculpture, woven vessels, ceremonial dress and tools.' },
    { name: 'DOCUMENTS', key: 'Documents', count: '917 records', image: 'assets/pdf-col-docs.png', detail: 'Letters, conference resolutions, school registers, songs and personal papers.' }
  ];

  archiveRecords: ArchiveRecord[] = [
    { id: 'SSWM-OH-024', title: 'Achol: Listening for Peace (Audio & Transcript)', type: 'Oral histories', person: 'Achol Deng', place: 'Juba', theme: 'Peacebuilding', decade: '2020s', summary: 'First-person testimony on women’s grass-roots peace tables and community reconciliation in Central Equatoria.', image: 'assets/pdf-col-oral.png' },
    { id: 'SSWM-OH-018', title: 'Nyandeng: Keeper of Memory', type: 'Oral histories', person: 'Mama Nyandeng Chol', place: 'Bor', theme: 'Liberation', decade: '1980s', summary: 'Oral history recounting how women safeguarded children, seed stores and lineage songs during displacement.', image: 'assets/pdf-story-1.png' },
    { id: 'SSWM-PH-104', title: 'Women’s Peace Delegation Portrait, 1999', type: 'Photographs', person: 'Wunlit Women Delegates', place: 'Bahr el Ghazal', theme: 'Peacebuilding', decade: '1990s', summary: 'Archival gelatin silver print of women elders and mediators arriving for people-to-people peace talks.', image: 'assets/pdf-col-photos.png' },
    { id: 'SSWM-PH-219', title: 'Two Generations in Ceremonial Beadwork', type: 'Photographs', person: 'Mama Rebecca & Abuk', place: 'Juba', theme: 'Culture', decade: '2020s', summary: 'Contemporary portrait celebrating intergenerational pride and textile heritage at She Stands.', image: 'assets/pdf-support-hero.png' },
    { id: 'SSWM-OB-052', title: 'Mother & Child Limestone and Clay Relief', type: 'Objects', person: 'Women Artisans Collective', place: 'Wau', theme: 'Culture', decade: '2010s', summary: 'Hand-carved sculptural relief honoring maternal resilience and community care.', image: 'assets/pdf-col-objects.png' },
    { id: 'SSWM-OB-089', title: 'Multi-Strand Beaded Ceremonial Collar', type: 'Objects', person: 'Mary Kiden', place: 'Torit', theme: 'Culture', decade: '1970s', summary: 'Glass, ostrich-eggshell and brass beadwork collar worn during milestone community ceremonies.', image: 'assets/pdf-story-3.png' },
    { id: 'SSWM-DC-311', title: 'Grassroots Women’s Education Charter, 2005', type: 'Documents', person: 'South Sudan Women’s Teachers Network', place: 'Yei', theme: 'Education', decade: '2000s', summary: 'Hand-annotated resolution establishing community girls’ scholarships and adult literacy circles.', image: 'assets/pdf-col-docs.png' },
    { id: 'SSWM-DC-408', title: 'Notebook of Liberation Songs & Proverbs', type: 'Documents', person: 'Helena Ajak', place: 'Malakal', theme: 'Leadership', decade: '1990s', summary: 'Manuscript exercise book containing 42 transcribed women’s songs of courage and solidarity.', image: 'assets/pdf-banners.png' }
  ];

  collectionSearch = '';
  activeCollectionFilter = '';
  activeBrowseDimension = '';
  showCollectionDrawer = false;

  exhibitions = [
    {
      state: 'NOW SHOWING',
      name: 'Daughters of the Struggle',
      note: 'Women of liberation and resistance.',
      color: 'clay',
      dates: 'Current Exhibition · Main Gallery, Hai Jalaba',
      curatorNote: 'Through rare photographs, field recordings, personal garments and letters, Daughters of the Struggle honors the seen and unseen labor of South Sudanese women who sustained families, organized relief, and demanded a voice in self-determination.',
      highlights: ['48 archival portraits & field dispatches', '6 listening stations with bilingual transcripts', 'Personal artifacts loaned by families across 10 states'],
      image: 'assets/pdf-hero.png'
    },
    {
      state: 'PERMANENT GALLERY',
      name: 'Hall of Remembrance',
      note: 'A dignified space for memory and tribute.',
      color: 'green',
      dates: 'Permanent Installation · East Wing',
      curatorNote: 'A contemplative architectural sanctuary inscribed with the names, oral testimonies and portraits of women whose sacrifice built communities and held the nation together.',
      highlights: ['Inscribed Wall of Names & Community Tributes', 'Sculptural centerpiece by South Sudanese women artisans', 'Interactive family genealogy & memory registry'],
      image: 'assets/pdf-banners.png'
    },
    {
      state: 'COMING NEXT',
      name: 'Mothers of the Camps',
      note: 'Survival, care and leadership in displacement.',
      color: 'gold',
      dates: 'Opening Next Season · Gallery II',
      curatorNote: 'Examining how women transformed sites of displacement into centers of schooling, mutual aid, midwifery and cultural preservation.',
      highlights: ['Oral histories from Kakuma, Mangateen and regional camps', 'Handmade classroom teaching aids & community ledgers', 'Youth photography workshop responses'],
      image: 'assets/pdf-col-objects.png'
    },
    {
      state: 'ROTATING SERIES',
      name: 'Women in Peace Talks',
      note: 'Voices from dialogue and nation-building.',
      color: 'ink',
      dates: 'Rotating Archival Series · Dialogue Room',
      curatorNote: 'From local customary courts and Wunlit people-to-people conferences to national constitutional negotiations, this series documents how women shaped peace agreements.',
      highlights: ['Original signed declarations & marginalia', 'Audio recordings of women mediators', 'Monthly intergenerational policy & peace roundtables'],
      image: 'assets/pdf-col-oral.png'
    }
  ];

  resources = [
    {
      audience: 'FOR TEACHERS',
      title: 'Classroom stories toolkit',
      body: 'Discussion guides, primary sources and activities for secondary schools.',
      color: 'green',
      details: 'Includes 12 printable lesson plans aligned with secondary history and citizenship curricula, primary source photograph cards, and guided listening worksheets for classroom dialogue.'
    },
    {
      audience: 'FOR FAMILIES',
      title: "Children's Discovery Area",
      body: 'Prompts and creative activities for learning across generations.',
      color: 'clay',
      details: 'Hands-on storytelling cards, beadwork pattern sheets, family tree templates, and weekend gallery activity packs designed for children and elders to explore together.'
    },
    {
      audience: 'FOR RESEARCHERS',
      title: 'Resource Library & Archive',
      body: 'Catalogues, finding aids and guidance for responsible research.',
      color: 'gold',
      details: 'Full digital finding aids for 3,857 catalogued records, citation standards, community consent protocols, and reading-room appointment booking in Hai Jalaba.'
    }
  ];

  news = [
    {
      kicker: 'MUSEUM NEWS',
      title: "A new home for women’s history",
      body: 'Behind the vision for a national place of memory, learning and encounter.',
      image: 'assets/pdf-col-photos.png',
      date: 'October 2026 · Hai Jalaba, Juba',
      fullText: 'Supported and financed by The Achol Philip Foundation, She Stands Women’s Museum opens its doors in Hai Jalaba as a living national institution dedicated to South Sudanese women. Designed as both a sanctuary for remembrance and an active civic classroom, the museum brings together oral history studios, permanent and rotating galleries, conservation storage, and community gathering spaces.'
    },
    {
      kicker: 'FROM THE ARCHIVE',
      title: 'Why oral history matters',
      body: 'Listening is a method of preservation - and an act of respect.',
      image: 'assets/pdf-col-oral.png',
      date: 'Archive Journal · Issue 04',
      fullText: 'Much of South Sudan’s women’s history was carried in voice, song, proverb and lived memory rather than official state paper. In our Oral History Studio, trained community interviewers sit with elders in their own languages, ensuring every recording is preserved with informed consent, contextual metadata, and family access.'
    },
    {
      kicker: 'COMMUNITY',
      title: 'Call for stories and family archives',
      body: 'Help identify women, photographs and records that belong in the national story.',
      image: 'assets/pdf-support-hero.png',
      date: 'Open Community Call',
      fullText: 'Do you hold a photograph, letter, song recording, or memory of a mother, grandmother, teacher, midwife, artisan or community leader? Bring your material to Family Archive Day in Hai Jalaba or submit her story online. Our curatorial team digitizes family photographs free of charge while originals remain safely with your family.'
    }
  ];

  supportPillars = [
    { num: '01', title: 'GIVE', body: 'Fund collections care and public access.', action: 'give' },
    { num: '02', title: 'PARTNER', body: 'Build programmes with schools and communities.', action: 'partner' },
    { num: '03', title: 'VOLUNTEER', body: 'Offer time, skills and local knowledge.', action: 'volunteer' },
    { num: '04', title: 'CONTRIBUTE', body: 'Share records, photographs and oral histories.', action: 'contribute' }
  ];

  events = [
    { day: '18 OCT', title: 'Community Story Circle', note: 'Elders and young women in conversation', featured: true },
    { day: '02 NOV', title: 'Gallery Talk: Daughters of the Struggle', note: 'Curator-led exhibition tour', featured: false },
    { day: '16 NOV', title: 'Family Archive Day', note: 'Bring a photograph. Share a memory.', featured: false }
  ];

  // Search & filters
  storySearch = '';
  storyCategory = 'ALL STORIES';
  storyCategories = ['ALL STORIES', 'LIBERATION', 'PEACEBUILDING', 'CULTURE', 'EDUCATION', 'LEADERSHIP'];
  resourceSearch = '';
  globalSearchOpen = false;
  globalSearchQuery = '';

  // Modals
  transcriptModalOpen = false;
  activeModalTitle = '';
  activeModalSubtitle = '';
  activeModalBody = '';
  activeModalHighlights: string[] = [];
  activeModalImage = '';
  infoModalOpen = false;

  // Visit reservation modal
  visitModalOpen = false;
  visitBooking = { type: 'General / Group Visit', date: '', name: '', email: '', guests: '2', notes: '' };
  visitBookingConfirmed = false;

  // Donation & Checkout Studio
  showDonationStudio = true;
  donation = { name: '', email: '', amount: 50, frequency: 'once', note: '', paymentMethod: 'mpesa', phone: '' };
  manualReferenceNeeded = false;
  donationState: 'form' | 'pending' | 'done' = 'form';
  donationMessage = '';
  donationReference = '';
  donationId = '';

  // Chat
  messageForm = { name: localStorage.getItem('ss_chat_name') || '', email: localStorage.getItem('ss_chat_email') || '', message: '' };
  chatMessages: any[] = [{ from: 'team', text: 'Welcome to She Stands Women’s Museum. Ask us about visiting Hai Jalaba, contributing to the archive, or supporting our programmes.' }];
  chatStatus = '';
  chatKey = localStorage.getItem('ss_chat_key') || '';

  // Story submission + Draft persistence (Page 9)
  storyForm = { name: '', place: '', relationship: '', theme: '', story: '', consent: false };
  storyFile: File | null = null;
  storyStatus = '';

  // Newsletter (Page 11)
  newsletterEmail = '';
  newsletterStatus = '';

  // Admin state
  adminToken = sessionStorage.getItem('ss_admin_token') || '';
  adminPassword = '';
  adminError = '';
  adminTab = 'overview';
  adminStats: any = {};
  adminDonations: any[] = [];
  adminMedia: any[] = [];
  adminStories: any[] = [];
  adminMessages: any[] = [];
  adminSocials: SocialLink[] = [];
  socialDraft: SocialLink = { name: '', url: '' };
  adminReply: Record<string, string> = {};
  adminNotice = '';

  constructor() {
    this.choosePayment('mpesa');
    const savedDraft = localStorage.getItem('ss_story_draft');
    if (savedDraft) {
      try {
        this.storyForm = { ...this.storyForm, ...JSON.parse(savedDraft) };
      } catch { /* ignore invalid draft */ }
    }

    const query = new URLSearchParams(window.location.search);
    const paypalOrder = query.get('token');
    if (query.get('paypal') === 'success' && paypalOrder) {
      this.showDonationStudio = true;
      this.http.post<any>(`${this.api}/donations/paypal/capture`, { orderId: paypalOrder }).subscribe({
        next: (result) => {
          this.donationState = result.status === 'paid' ? 'done' : 'pending';
          this.donationMessage = result.status === 'paid'
            ? 'Your PayPal gift is confirmed. Thank you for standing with the archive.'
            : 'PayPal is confirming your payment. The gift is safely recorded.';
        },
        error: (error) => {
          this.donationState = 'pending';
          this.donationMessage = error.error?.message || 'Your PayPal gift is awaiting confirmation.';
        }
      });
    }
    const stripeSession = query.get('session_id');
    if (stripeSession) {
      this.showDonationStudio = true;
      this.http.get<any>(`${this.api}/donations/session/${encodeURIComponent(stripeSession)}`).subscribe({
        next: (result) => {
          if (result.status === 'paid') {
            this.donationState = 'done';
            this.donationMessage = 'Your payment has been received. Thank you for standing with the archive.';
          }
        },
        error: () => undefined
      });
    }

    this.http.get<any>(`${this.api}/public/settings`).subscribe({
      next: (settings) => {
        if (settings.socials?.length) this.socials = settings.socials;
        this.heroOverride = settings.heroImage || '';
        this.heroAudio = settings.heroAudio || '';
        if (Array.isArray(settings.publishedStories) && settings.publishedStories.length) {
          const existingTitles = new Set(this.stories.map((s) => s.title.toLowerCase()));
          settings.publishedStories.forEach((pub: any, idx: number) => {
            if (!existingTitles.has(String(pub.name).toLowerCase())) {
              this.stories.push({
                id: `pub-${pub._id || idx}`,
                archiveId: `SSWM-CM-${100 + idx}`,
                tag: String(pub.theme || 'COMMUNITY STORY').toUpperCase(),
                SpotlightTag: `COMMUNITY ARCHIVE • ${String(pub.theme || 'MEMORY').toUpperCase()}`,
                category: pub.theme || 'Culture',
                title: pub.name,
                spotlightTitle: String(pub.name).toUpperCase(),
                quote: `“${String(pub.story).slice(0, 140)}${String(pub.story).length > 140 ? '…' : ''}”`,
                body: String(pub.story).slice(0, 115) + (String(pub.story).length > 115 ? '…' : ''),
                spotlightBody: pub.story,
                duration: '08:30',
                durationSeconds: 510,
                image: pub.fileUrl || 'assets/pdf-story-1.png',
                spotlightImage: pub.fileUrl || 'assets/pdf-oral-history.png',
                location: pub.place || 'South Sudan',
                year: '2026',
                narrator: pub.name,
                interviewer: `Contributed by ${pub.relationship || 'Community Member'}`,
                transcript: [
                  { time: '00:00', speaker: 'Community Archive', text: `Contributed memory for ${pub.name} from ${pub.place}.` },
                  { time: '01:00', speaker: pub.relationship || 'Narrator', text: pub.story }
                ]
              });
            }
          });
        }
        if (this.isAdmin && this.adminToken) this.loadAdmin();
      },
      error: () => {
        if (this.isAdmin && this.adminToken) this.loadAdmin();
      }
    });
    if (this.isAdmin && this.adminToken) this.loadAdmin();
  }

  ngOnDestroy() {
    this.stopAudio();
  }

  jump(id: string) {
    this.navOpen = false;
    this.activeNav = id;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  selectStory(story: StoryItem, scrollToSpotlight = true) {
    this.stopAudio();
    this.activeStory = story;
    this.audioProgress = 0;
    this.audioCurrentSeconds = 0;
    if (scrollToSpotlight) {
      document.getElementById('story-spotlight')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleAudio() {
    if (this.isPlayingAudio) {
      this.stopAudio();
      return;
    }
    this.isPlayingAudio = true;
    if (this.heroAudio) {
      if (!this.htmlAudio) {
        this.htmlAudio = new Audio(this.heroAudio);
        this.htmlAudio.addEventListener('ended', () => this.stopAudio());
      }
      this.htmlAudio.play().catch(() => undefined);
    } else if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          `${this.activeStory.title}. ${this.activeStory.quote} ${this.activeStory.spotlightBody}`
        );
        utterance.rate = 0.94;
        window.speechSynthesis.speak(utterance);
      } catch { /* ignore speech synthesis errors */ }
    }
    this.audioTimer = setInterval(() => {
      if (this.audioCurrentSeconds < this.activeStory.durationSeconds) {
        this.audioCurrentSeconds += 1;
        this.audioProgress = Math.min(100, (this.audioCurrentSeconds / this.activeStory.durationSeconds) * 100);
      } else {
        this.stopAudio();
      }
    }, 1000);
  }

  stopAudio() {
    this.isPlayingAudio = false;
    if (this.audioTimer) {
      clearInterval(this.audioTimer);
      this.audioTimer = null;
    }
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    }
  }

  seekAudio(event: MouseEvent) {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    this.audioProgress = Math.round(ratio * 100);
    this.audioCurrentSeconds = Math.round(ratio * this.activeStory.durationSeconds);
  }

  get formattedAudioTime(): string {
    if (!this.isPlayingAudio && this.audioCurrentSeconds === 215 && this.activeStory.id === 'achol') {
      return this.activeStory.duration;
    }
    const mins = Math.floor(this.audioCurrentSeconds / 60);
    const secs = this.audioCurrentSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} / ${this.activeStory.duration}`;
  }

  openTranscriptModal() {
    this.transcriptModalOpen = true;
  }

  openExhibitionModal(show: any) {
    this.activeModalSubtitle = `${show.state} · ${show.dates}`;
    this.activeModalTitle = show.name;
    this.activeModalBody = show.curatorNote;
    this.activeModalHighlights = show.highlights || [];
    this.activeModalImage = show.image || 'assets/pdf-banners.png';
    this.infoModalOpen = true;
  }

  openResourceModal(resource: any) {
    this.activeModalSubtitle = `LEARNING ARCHIVE · ${resource.audience}`;
    this.activeModalTitle = resource.title;
    this.activeModalBody = resource.details;
    this.activeModalHighlights = [
      'Free download for educators, students and families in South Sudan',
      'Bilingual facilitation prompts & primary source archive cards',
      'Developed with South Sudanese historians and community elders'
    ];
    this.activeModalImage = 'assets/pdf-banners.png';
    this.infoModalOpen = true;
  }

  openOralHistoryGuide() {
    this.activeModalSubtitle = 'SHE STANDS ORAL HISTORY STUDIO · FIELD GUIDE';
    this.activeModalTitle = 'Learn how to listen, record and preserve.';
    this.activeModalBody = 'Our Ethical Oral History Field Guide equips community researchers, students and families with step-by-step methods for preparing interviews, obtaining informed consent, recording clear audio, and archiving metadata with dignity and care.';
    this.activeModalHighlights = [
      '1. Before the interview: Prior informed consent & narrator rights',
      '2. Listening with respect: Open-ended prompts for intergenerational dialogue',
      '3. Archival care: Labelling photographs, dates, places and languages',
      '4. Deposit options: Keep originals with your family while sharing digital copies'
    ];
    this.activeModalImage = 'assets/pdf-oral-history.png';
    this.infoModalOpen = true;
  }

  openNewsModal(item: any) {
    this.activeModalSubtitle = `${item.kicker} · ${item.date}`;
    this.activeModalTitle = item.title;
    this.activeModalBody = item.fullText;
    this.activeModalHighlights = [];
    this.activeModalImage = item.image;
    this.infoModalOpen = true;
  }

  openAboutStoryModal() {
    this.activeModalSubtitle = 'ABOUT THE MUSEUM · OUR CHARTER';
    this.activeModalTitle = 'Her story belongs in the national story.';
    this.activeModalBody = 'Located in Hai Jalaba, South Sudan, and supported and financed by The Achol Philip Foundation, She Stands Women’s Museum is a permanent home for women’s memory, courage and creativity. We document oral histories, safeguard material culture, curate public exhibitions, and convene elders and youth so that women’s contributions remain central to South Sudan’s past, present and future.';
    this.activeModalHighlights = [
      '01 PRESERVE — Oral histories, photographs, artifacts and community memory',
      '02 HONOR — Women of liberation, peacebuilding, art and community care',
      '03 EMPOWER — New generations of South Sudanese women to speak and lead'
    ];
    this.activeModalImage = 'assets/pdf-banners.png';
    this.infoModalOpen = true;
  }

  openVisitModal(eventTitle = 'General / Group Visit') {
    this.visitBooking.type = eventTitle;
    this.visitBookingConfirmed = false;
    this.visitModalOpen = true;
  }

  submitVisitBooking() {
    if (!this.visitBooking.name || !this.visitBooking.email) return;
    this.visitBookingConfirmed = true;
    this.http.post<any>(`${this.api}/messages`, {
      name: this.visitBooking.name,
      email: this.visitBooking.email,
      message: `[Visit / Event Reservation: ${this.visitBooking.type}] Date: ${this.visitBooking.date || 'Flexible'} | Guests: ${this.visitBooking.guests} | Notes: ${this.visitBooking.notes || 'None'}`
    }).subscribe({ error: () => undefined });
  }

  browseCollectionBy(dimension: string) {
    this.activeBrowseDimension = this.activeBrowseDimension === dimension ? '' : dimension;
    this.showCollectionDrawer = true;
  }

  exploreCollectionCategory(categoryKey: string) {
    this.activeCollectionFilter = this.activeCollectionFilter === categoryKey ? '' : categoryKey;
    this.showCollectionDrawer = true;
  }

  get filteredArchiveRecords(): ArchiveRecord[] {
    const q = this.collectionSearch.trim().toLowerCase();
    return this.archiveRecords.filter((rec) => {
      const matchType = !this.activeCollectionFilter || rec.type.toLowerCase() === this.activeCollectionFilter.toLowerCase();
      const matchQuery = !q || `${rec.id} ${rec.title} ${rec.person} ${rec.place} ${rec.theme} ${rec.decade} ${rec.summary}`.toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  }

  get filteredStories(): StoryItem[] {
    const query = this.storySearch.trim().toLowerCase();
    return this.stories.filter((story) => {
      const cat = this.storyCategory.toUpperCase();
      const matchesCat =
        cat === 'ALL STORIES' ||
        story.tag.toUpperCase().includes(cat) ||
        story.category.toUpperCase().includes(cat) ||
        story.SpotlightTag.toUpperCase().includes(cat) ||
        (cat === 'LIBERATION' && story.id === 'nyandeng') ||
        (cat === 'EDUCATION' && story.id === 'future');
      const matchesQuery =
        !query ||
        `${story.title} ${story.tag} ${story.body} ${story.location} ${story.narrator}`.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }

  get filteredResources() {
    const query = this.resourceSearch.trim().toLowerCase();
    return this.resources.filter(
      (resource) => !query || `${resource.title} ${resource.audience} ${resource.body}`.toLowerCase().includes(query)
    );
  }

  get globalSearchResults() {
    const q = this.globalSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { type: string; title: string; subtitle: string; section: string }[] = [];
    this.stories.forEach((s) => {
      if (`${s.title} ${s.body} ${s.tag} ${s.location}`.toLowerCase().includes(q)) {
        results.push({ type: 'Story Archive', title: s.title, subtitle: `${s.tag} · ${s.archiveId}`, section: 'stories' });
      }
    });
    this.archiveRecords.forEach((r) => {
      if (`${r.title} ${r.person} ${r.place} ${r.theme} ${r.id}`.toLowerCase().includes(q)) {
        results.push({ type: r.type, title: r.title, subtitle: `${r.id} · ${r.place} (${r.decade})`, section: 'collections' });
      }
    });
    this.exhibitions.forEach((e) => {
      if (`${e.name} ${e.note} ${e.curatorNote}`.toLowerCase().includes(q)) {
        results.push({ type: 'Exhibition', title: e.name, subtitle: e.state, section: 'exhibitions' });
      }
    });
    this.resources.forEach((res) => {
      if (`${res.title} ${res.audience} ${res.body}`.toLowerCase().includes(q)) {
        results.push({ type: 'Learning Resource', title: res.title, subtitle: res.audience, section: 'learn' });
      }
    });
    return results;
  }

  handleSupportAction(action: string) {
    if (action === 'give') {
      this.showDonationStudio = true;
      setTimeout(() => document.getElementById('donation-studio')?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else if (action === 'contribute') {
      this.jump('involved');
    } else if (action === 'partner') {
      this.openVisitModal('Institutional / School Partnership Inquiry');
    } else if (action === 'volunteer') {
      this.openVisitModal('Archive Volunteer & Skills Programme');
    }
  }

  openChat() {
    this.helpOpen = !this.helpOpen;
    if (this.helpOpen && this.chatKey) this.refreshChat();
  }

  refreshChat() {
    if (!this.chatKey) return;
    this.http.get<any>(`${this.api}/messages/${encodeURIComponent(this.chatKey)}`).subscribe({
      next: (result) => (this.chatMessages = result.messages || this.chatMessages)
    });
  }

  httpOptions() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.adminToken}` }) };
  }

  scrollDonate() {
    this.showDonationStudio = true;
    this.jump('support');
    setTimeout(() => document.getElementById('donation-studio')?.scrollIntoView({ behavior: 'smooth' }), 150);
  }

  openDonationFor(method: string) {
    this.choosePayment(method);
    this.donationState = 'form';
    this.scrollDonate();
  }

  choosePayment(method: string) {
    this.donation.paymentMethod = method;
    this.donation.frequency = method === 'stripe' || method === 'google-pay' ? this.donation.frequency : 'once';
    this.donation.amount = method === 'mpesa' ? 2500 : 35;
  }

  makeDonation() {
    this.donationMessage = '';
    this.http.post<any>(`${this.api}/donations`, this.donation).subscribe({
      next: (result) => {
        this.donationId = result.id;
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }
        this.donationReference = result.reference || result.id;
        this.donationMessage = result.message;
        this.manualReferenceNeeded = result.pending === false;
        this.donationState = 'pending';
      },
      error: (error) =>
        (this.donationMessage =
          error.error?.message || 'Donations are temporarily unavailable. Please contact info@sswomensmuseum.org.')
    });
  }

  sendReference() {
    this.http.post<any>(`${this.api}/donations/${this.donationId}/reference`, { reference: this.donation.note }).subscribe({
      next: () => {
        this.donationState = 'done';
        this.donationMessage = 'Thank you. The museum team will review your receipt and confirm your gift.';
      },
      error: (error) => (this.donationMessage = error.error?.message || 'We could not send that reference. Please try again.')
    });
  }

  sendMessage() {
    this.chatStatus = '';
    if (!this.messageForm.name || !this.messageForm.email || !this.messageForm.message) return;
    this.http.post<any>(`${this.api}/messages`, { ...this.messageForm, conversationKey: this.chatKey }).subscribe({
      next: (result) => {
        this.chatKey = result.conversationKey;
        localStorage.setItem('ss_chat_key', this.chatKey);
        localStorage.setItem('ss_chat_name', this.messageForm.name);
        localStorage.setItem('ss_chat_email', this.messageForm.email);
        this.chatMessages = result.messages || this.chatMessages;
        this.messageForm.message = '';
        this.chatStatus = 'Your message is with the museum team.';
      },
      error: (error) =>
        (this.chatStatus = error.error?.message || 'Messaging is temporarily unavailable. You can email info@sswomensmuseum.org.')
    });
  }

  rememberFile(event: Event) {
    this.storyFile = (event.target as HTMLInputElement).files?.[0] || null;
  }

  saveStoryDraft() {
    localStorage.setItem('ss_story_draft', JSON.stringify(this.storyForm));
    this.storyStatus = 'Draft saved on this device. You can return anytime to finish and submit her story.';
  }

  submitStory() {
    this.storyStatus = '';
    const data = new FormData();
    Object.entries(this.storyForm).forEach(([key, value]) => data.append(key, String(value)));
    if (this.storyFile) data.append('file', this.storyFile);
    this.http.post<any>(`${this.api}/stories`, data).subscribe({
      next: () => {
        localStorage.removeItem('ss_story_draft');
        this.storyStatus = 'Your story has been submitted for curatorial review. Thank you for helping preserve her place in history.';
        this.storyForm = { name: '', place: '', relationship: '', theme: '', story: '', consent: false };
        this.storyFile = null;
      },
      error: (error) => (this.storyStatus = error.error?.message || 'We could not save your story just now. Please check all fields and try again.')
    });
  }

  subscribe() {
    this.newsletterStatus = '';
    this.http.post<any>(`${this.api}/newsletter`, { email: this.newsletterEmail }).subscribe({
      next: () => {
        this.newsletterStatus = 'Thank you for subscribing to She Stands updates and exhibition invitations.';
        this.newsletterEmail = '';
      },
      error: (error) => (this.newsletterStatus = error.error?.message || 'Please enter a valid email address.')
    });
  }

  openAdminDesk(event?: Event) {
    event?.preventDefault();
    this.isAdmin = true;
    window.history.pushState({}, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.adminToken) this.loadAdmin();
  }

  closeAdminDesk(event?: Event) {
    event?.preventDefault();
    this.isAdmin = false;
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  login() {
    this.adminError = '';
    this.http.post<any>(`${this.api}/admin/login`, { password: this.adminPassword }).subscribe({
      next: (result) => {
        this.adminToken = result.token;
        sessionStorage.setItem('ss_admin_token', this.adminToken);
        this.loadAdmin();
      },
      error: (error) => (this.adminError = error.error?.message || 'Unable to sign in.')
    });
  }

  logout() {
    sessionStorage.removeItem('ss_admin_token');
    this.adminToken = '';
    this.adminTab = 'overview';
  }

  loadAdmin() {
    if (!this.adminToken) return;
    const options = this.httpOptions();
    this.http.get<any>(`${this.api}/admin/overview`, options).subscribe({ next: (value) => (this.adminStats = value), error: () => this.logout() });
    this.http.get<any[]>(`${this.api}/admin/donations`, options).subscribe({ next: (value) => (this.adminDonations = value) });
    this.http.get<any[]>(`${this.api}/admin/media`, options).subscribe({ next: (value) => (this.adminMedia = value) });
    this.http.get<any[]>(`${this.api}/admin/stories`, options).subscribe({ next: (value) => (this.adminStories = value) });
    this.http.get<any[]>(`${this.api}/admin/messages`, options).subscribe({ next: (value) => (this.adminMessages = value) });
    this.http.get<any>(`${this.api}/public/settings`).subscribe({ next: (value) => (this.adminSocials = value.socials || this.socials) });
  }

  verifyDonation(id: string) {
    this.http.patch(`${this.api}/admin/donations/${id}/verify`, {}, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Payment marked as received.';
        this.loadAdmin();
      }
    });
  }

  uploadMedia(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    this.http.post<any>(`${this.api}/admin/media`, data, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'File uploaded to the media library.';
        this.loadAdmin();
      },
      error: (error) => (this.adminNotice = error.error?.message || 'The file could not be uploaded.')
    });
  }

  featureMedia(url: string) {
    this.http.put(`${this.api}/admin/settings`, { heroImage: url, socials: this.adminSocials }, this.httpOptions()).subscribe({
      next: () => {
        this.heroOverride = url;
        this.adminNotice = 'Homepage feature image updated.';
      }
    });
  }

  featureAudio(url: string) {
    this.http.put(`${this.api}/admin/settings`, { heroAudio: url, socials: this.adminSocials }, this.httpOptions()).subscribe({
      next: () => {
        this.heroAudio = url;
        this.adminNotice = 'Oral history audio updated.';
      }
    });
  }

  deleteMedia(id: string) {
    this.http.delete(`${this.api}/admin/media/${encodeURIComponent(id)}`, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'File removed.';
        this.loadAdmin();
      }
    });
  }

  reviewStory(id: string, status: string) {
    this.http.patch(`${this.api}/admin/stories/${id}`, { status }, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Story review saved.';
        this.loadAdmin();
      }
    });
  }

  replyMessage(conversation: any) {
    const text = this.adminReply[conversation._id]?.trim();
    if (!text) return;
    this.http.post(`${this.api}/admin/messages/${conversation._id}/reply`, { text }, this.httpOptions()).subscribe({
      next: () => {
        this.adminReply[conversation._id] = '';
        this.loadAdmin();
      }
    });
  }

  addSocial() {
    if (!this.socialDraft.name || !this.socialDraft.url) return;
    this.adminSocials = [...this.adminSocials, { ...this.socialDraft }];
    this.socialDraft = { name: '', url: '' };
  }

  removeSocial(index: number) {
    this.adminSocials = this.adminSocials.filter((_, i) => i !== index);
  }

  saveSocials() {
    this.http.put(`${this.api}/admin/settings`, { socials: this.adminSocials }, this.httpOptions()).subscribe({
      next: () => {
        this.socials = this.adminSocials;
        this.adminNotice = 'Social links saved.';
      }
    });
  }
}
