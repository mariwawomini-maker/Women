import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  collectionTypes,
  collectionsPrinciples,
  contactDepartments,
  digitalMuseumFeatures,
  donationDesignations,
  eventFormats,
  heroineCategories,
  learningProgrammes,
  membershipTiers,
  missionGoals,
  museumGalleries,
  museumMenu,
  museumValues,
  newsCategories,
  newsletterInterestsList,
  oralHistorySteps,
  pageCopyGroups,
  partnerTypes,
  partnershipOpportunities,
  pressKitItems,
  researchServices,
  shopCategories,
  siteImageSlots,
  supportWays,
  teacherResourceTypes,
  volunteerAreas,
  whatWeDoList
} from './museum-content';

type SocialLink = { name: string; url: string };

type ContentEntry = {
  _id?: string;
  type: string;
  subtype: string;
  title: string;
  summary: string;
  body: string;
  date: string;
  place: string;
  attribution: string;
  accessionNumber: string;
  objectType: string;
  materials: string;
  dimensions: string;
  communityContext: string;
  acquisitionMethod: string;
  donor: string;
  condition: string;
  storageLocation: string;
  exhibitionHistory: string;
  provenance: string;
  rights: string;
  source: string;
  price: string;
  availability: string;
  maker: string;
  eventTime: string;
  audience: string;
  capacity: string;
  accessibility: string;
  registrationRequired: boolean;
  transcript: string;
  contentNotice: string;
  imageUrl: string;
  audioUrl: string;
  fileUrl: string;
  relatedIds: string[];
  owner: string;
  reviewDate: string;
  featured: boolean;
  status: 'draft' | 'published';
  cleared: boolean;
};

const emptyEntry = (): ContentEntry => ({
  type: 'exhibition',
  subtype: '',
  title: '',
  summary: '',
  body: '',
  date: '',
  place: '',
  attribution: '',
  accessionNumber: '',
  objectType: '',
  materials: '',
  dimensions: '',
  communityContext: '',
  acquisitionMethod: '',
  donor: '',
  condition: '',
  storageLocation: '',
  exhibitionHistory: '',
  provenance: '',
  rights: '',
  source: '',
  price: '',
  availability: '',
  maker: '',
  eventTime: '',
  audience: '',
  capacity: '',
  accessibility: '',
  registrationRequired: false,
  transcript: '',
  contentNotice: '',
  imageUrl: '',
  audioUrl: '',
  fileUrl: '',
  relatedIds: [],
  owner: '',
  reviewDate: '',
  featured: false,
  status: 'draft',
  cleared: false
});

@Component({
  selector: 'ss-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private http = inject(HttpClient);
  api = (window as Window & { __SHE_STANDS_API_URL__?: string }).__SHE_STANDS_API_URL__ || `${window.location.protocol}//${window.location.hostname}:4000/api`;

  isAdmin = false;
  isDonationPage = false;
  donationSlug = '';
  navOpen = false;
  helpOpen = false;
  activeNav = 'home';

  // Payment gateway availability
  paymentOptions: any = {
    mpesa: undefined,
    mpesaMode: 'unavailable',
    mpesaPaybill: '',
    mpesaAccountName: '',
    paypal: undefined,
    'google-pay': undefined,
    stripe: undefined
  };

  // Visual assets & editable copy
  heroImage = 'assets/hero-editorial-v2.png';
  mobileHeroImage = 'assets/hero-mobile-v2.jpg';
  heroOverride = '';
  heroAudio = '';
  siteImages: Record<string, string> = {};
  pageCopy: Record<string, string> = {};
  socials: SocialLink[] = [];

  // Master content lists
  museumMenu = museumMenu;
  missionGoals = missionGoals;
  whatWeDoList = whatWeDoList;
  museumGalleries = museumGalleries;
  museumValues = museumValues;
  collectionTypes = collectionTypes;
  collectionsPrinciples = collectionsPrinciples;
  digitalMuseumFeatures = digitalMuseumFeatures;
  heroineCategories = heroineCategories;
  oralHistorySteps = oralHistorySteps;
  learningProgrammes = learningProgrammes;
  teacherResourceTypes = teacherResourceTypes;
  researchServices = researchServices;
  eventFormats = eventFormats;
  shopCategories = shopCategories;
  supportWays = supportWays;
  donationDesignations = donationDesignations;
  membershipTiers = membershipTiers;
  volunteerAreas = volunteerAreas;
  partnerTypes = partnerTypes;
  partnershipOpportunities = partnershipOpportunities;
  newsCategories = newsCategories;
  pressKitItems = pressKitItems;
  contactDepartments = contactDepartments;
  newsletterInterestsList = newsletterInterestsList;
  siteImageSlots = siteImageSlots;
  pageCopyGroups = pageCopyGroups;

  publishedStories: any[] = [];
  publishedReflections: any[] = [];
  publicContent: ContentEntry[] = [];

  contentTypes = [
    { key: 'exhibition', label: 'Exhibitions' },
    { key: 'collection', label: 'Collections' },
    { key: 'heroine', label: 'Heroines' },
    { key: 'oral-history', label: 'Oral histories' },
    { key: 'education', label: 'Education & Teacher Resources' },
    { key: 'research', label: 'Research Centre' },
    { key: 'event', label: 'Events & Programmes' },
    { key: 'shop', label: 'Museum Shop' },
    { key: 'news', label: 'News & Stories' },
    { key: 'press', label: 'Media & Press' },
    { key: 'partner', label: 'Partners' },
    { key: 'timeline', label: 'Institutional History' },
    { key: 'team', label: 'Team & Governance' },
    { key: 'visit', label: 'Visit Updates' },
    { key: 'document', label: 'Documents & Downloads' }
  ];

  // Public interactive filters & drawers
  exhibitionFilter = 'all';
  collectionFilter = 'all';
  collectionSearch = '';
  heroineFilter = 'all';
  newsFilter = 'all';
  expandedGalleryKey = '';
  activeTranscriptEntry: ContentEntry | null = null;

  // Global search
  globalSearchOpen = false;
  globalSearchQuery = '';
  globalSearchType = 'all';

  // Unified Museum Enquiry & Booking Modal (covers all Section 37 forms)
  enquiryModalOpen = false;
  enquiryModalTitle = 'Museum Enquiry';
  enquiryConfirmed = false;
  enquiryConfirmationNote = '';
  enquirySending = false;
  enquiryError = '';
  enquiryForm = {
    formType: 'group-tour',
    name: '',
    email: '',
    phone: '',
    organisation: '',
    subject: '',
    preferredDate: '',
    participants: '',
    ageGrade: '',
    tourType: 'Guided gallery tour',
    learningObjectives: '',
    accessibilityNeeds: '',
    specialRequirements: '',
    interestArea: '',
    relatedItem: '',
    message: '',
    privacyConsent: false,
    _hp: ''
  };

  // Inline Contact Section Form (Section 34)
  contactForm = {
    formType: 'general',
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacyConsent: false,
    _hp: ''
  };
  contactStatus = '';
  contactSending = false;

  // Interactive Space & Hall of Remembrance Community Wall Form (Sections 8 & 11)
  reflectionForm = {
    promptType: 'remembrance',
    honoureeName: '',
    contributorName: '',
    contributorEmail: '',
    place: '',
    message: '',
    consent: false,
    _hp: ''
  };
  reflectionStatus = '';
  reflectionSending = false;

  // Dedicated Payment Experience State
  donation = {
    name: '',
    email: '',
    amount: 35,
    frequency: 'once',
    designation: 'General museum care',
    dedication: '',
    note: '',
    paymentMethod: 'stripe',
    phone: '',
    _hp: ''
  };
  manualReferenceNeeded = false;
  donationSubmitting = false;
  donationState: 'form' | 'pending' | 'done' = 'form';
  donationMessage = '';
  donationReference = '';
  donationId = '';
  donationPaybill = '';
  donationAccountName = '';

  // Floating Visitor Messages Chat
  messageForm = {
    name: localStorage.getItem('ss_chat_name') || '',
    email: localStorage.getItem('ss_chat_email') || '',
    message: '',
    _hp: ''
  };
  chatMessages: any[] = [{ from: 'team', text: 'Welcome to She Stands Women’s Museum. Ask us about visiting, sharing a story, research access or supporting the museum.' }];
  chatStatus = '';
  chatKey = localStorage.getItem('ss_chat_key') || '';

  // Share Your Story Form (Section 15)
  storyForm = {
    name: '',
    email: '',
    place: '',
    relationship: '',
    theme: '',
    interviewInterest: 'unsure',
    story: '',
    consent: false,
    _hp: ''
  };
  storyFile: File | null = null;
  storyStatus = '';

  // Newsletter (Section 38)
  newsletterName = '';
  newsletterEmail = '';
  newsletterInterests: string[] = [];
  newsletterStatus = '';
  newsletterConsent = false;
  newsletterMode: 'subscribe' | 'unsubscribe' = 'subscribe';
  newsletterHp = '';

  // Curator Admin Dashboard State
  adminToken = sessionStorage.getItem('ss_admin_token') || '';
  adminRole = sessionStorage.getItem('ss_admin_role') || 'administrator';
  adminRoleLabel = sessionStorage.getItem('ss_admin_role_label') || 'Museum Administrator';
  adminPermissions: string[] = JSON.parse(sessionStorage.getItem('ss_admin_permissions') || '[]');
  adminPassword = '';
  showAdminPassword = false;
  adminError = '';
  adminTab = 'overview';
  contentSubTab: 'library' | 'copy' = 'library';
  adminStats: any = {};
  adminAnalytics: any = { metrics: {}, enquiriesByType: [], donationsByMethod: [] };
  paymentStatus: any = null;
  adminDonations: any[] = [];
  donationStatusFilter = 'all';
  donationMethodFilter = 'all';
  adminEnquiries: any[] = [];
  enquiryDeptFilter = 'all';
  enquiryStatusFilter = 'all';
  enquiryNotesDraft: Record<string, string> = {};
  adminMedia: any[] = [];
  adminStories: any[] = [];
  adminStoryNotice: Record<string, string> = {};
  adminReflections: any[] = [];
  adminReflectionClearance: Record<string, boolean> = {};
  adminMessages: any[] = [];
  adminContent: ContentEntry[] = [];
  adminSubscribers: any[] = [];
  contentDraft: ContentEntry = emptyEntry();
  contentFilter = 'all';
  adminSocials: SocialLink[] = [];
  socialDraft: SocialLink = { name: '', url: '' };
  adminReply: Record<string, string> = {};
  adminStoryClearance: Record<string, boolean> = {};
  mediaSlotSelection: Record<string, string> = {};
  adminNotice = '';

  constructor() {
    this.syncRoute();
    const savedDraft = localStorage.getItem('ss_story_draft');
    if (savedDraft) {
      try {
        this.storyForm = { ...this.storyForm, ...JSON.parse(savedDraft) };
      } catch { /* ignore invalid draft */ }
    }

    const query = new URLSearchParams(window.location.search);
    if (query.get('cancelled')) {
      this.donationMessage = 'You returned before completing the payment. No charge was made.';
    }
    const paypalOrder = query.get('token');
    if (query.get('paypal') === 'success' && paypalOrder) {
      this.http.post<any>(`${this.api}/donations/paypal/capture`, { orderId: paypalOrder }).subscribe({
        next: (result) => {
          this.donationState = result.status === 'paid' ? 'done' : 'pending';
          this.donationMessage = result.status === 'paid'
            ? 'Your PayPal contribution is confirmed. Thank you for helping preserve women’s history.'
            : 'PayPal is finalising your confirmation. Your gift has been recorded.';
        },
        error: (error) => {
          this.donationState = 'pending';
          this.donationMessage = error.error?.message || 'Your PayPal contribution is awaiting confirmation.';
        }
      });
    }
    const stripeSession = query.get('session_id');
    if (stripeSession) {
      this.http.get<any>(`${this.api}/donations/session/${encodeURIComponent(stripeSession)}`).subscribe({
        next: (result) => {
          if (result.status === 'paid') {
            this.donationState = 'done';
            this.donationMessage = 'Your payment has been received and recorded in the museum ledger. Thank you.';
          }
        },
        error: () => undefined
      });
    }

    this.loadPublicData();
    if (this.isAdmin && this.adminToken) this.loadAdmin();
    if (!this.isAdmin && !this.isDonationPage) {
      this.track('site_views');
      if (window.location.hash) {
        let section = window.location.hash.slice(1);
        try { section = decodeURIComponent(section); } catch { /* keep raw */ }
        setTimeout(() => document.getElementById(section)?.scrollIntoView({ block: 'start' }), 250);
      }
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    this.syncRoute();
  }

  syncRoute() {
    const pathname = window.location.pathname || '/';
    this.isAdmin = pathname.startsWith('/admin');
    this.isDonationPage = pathname.startsWith('/donate');
    this.donationSlug = this.isDonationPage ? (pathname.split('/')[2] || '') : '';
    if (this.isDonationPage) {
      const method = this.donationSlug === 'card'
        ? 'stripe'
        : ['mpesa', 'paypal', 'google-pay'].includes(this.donationSlug)
          ? this.donationSlug
          : 'stripe';
      this.choosePayment(method);
      this.donationState = 'form';
      this.donationMessage = '';
    }
    if (this.isAdmin && this.adminToken) this.loadAdmin();
  }

  navigateTo(path: string, event?: Event) {
    event?.preventDefault();
    this.navOpen = false;
    window.history.pushState({}, '', path);
    this.syncRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadPublicData() {
    this.http.get<any>(`${this.api}/public/settings`).subscribe({
      next: (settings) => {
        if (settings.socials?.length) this.socials = settings.socials;
        this.heroOverride = settings.heroImage || '';
        this.heroAudio = settings.heroAudio || '';
        this.siteImages = Object.fromEntries(
          Object.entries(settings.siteImages || {}).filter(([key]) => this.siteImageSlots.some((slot) => slot.key === key))
        ) as Record<string, string>;
        this.pageCopy = settings.pageCopy || {};
        this.publishedStories = Array.isArray(settings.publishedStories) ? settings.publishedStories : [];
        this.publishedReflections = Array.isArray(settings.publishedReflections) ? settings.publishedReflections : [];
      },
      error: () => undefined
    });
    this.http.get<ContentEntry[]>(`${this.api}/public/content`).subscribe({
      next: (entries) => (this.publicContent = entries || []),
      error: () => undefined
    });
    this.http.get<any>(`${this.api}/public/payment-options`).subscribe({
      next: (options) => (this.paymentOptions = { ...this.paymentOptions, ...options }),
      error: () => undefined
    });
  }

  track(metric: string, label = '') {
    this.http.post(`${this.api}/public/track`, { metric, label }).subscribe({ error: () => undefined });
  }

  contentFor(type: string): ContentEntry[] {
    return this.publicContent.filter((entry) => entry.type === type);
  }

  get featuredHeroine(): ContentEntry | null {
    const heroines = this.contentFor('heroine');
    return heroines.find((item) => item.featured) || heroines[0] || null;
  }

  get featuredCollection(): ContentEntry | null {
    const items = this.contentFor('collection');
    return items.find((item) => item.featured) || items[0] || null;
  }

  get filteredExhibitions(): ContentEntry[] {
    const items = this.contentFor('exhibition');
    if (this.exhibitionFilter === 'all') return items;
    return items.filter((item) => (item.subtype || '').toLowerCase() === this.exhibitionFilter);
  }

  get filteredCollections(): ContentEntry[] {
    const items = [...this.contentFor('collection'), ...this.contentFor('document')];
    const q = this.collectionSearch.trim().toLowerCase();
    return items.filter((item) => {
      const typeOk = this.collectionFilter === 'all'
        || (item.objectType || item.subtype || '').toLowerCase().includes(this.collectionFilter.toLowerCase())
        || (this.collectionFilter === 'Documents' && item.type === 'document');
      const queryOk = !q || `${item.title} ${item.summary} ${item.accessionNumber} ${item.place} ${item.communityContext} ${item.materials} ${item.attribution}`.toLowerCase().includes(q);
      return typeOk && queryOk;
    });
  }

  get filteredHeroines(): ContentEntry[] {
    const items = this.contentFor('heroine');
    if (this.heroineFilter === 'all') return items;
    return items.filter((item) => (item.subtype || '').toLowerCase() === this.heroineFilter.toLowerCase());
  }

  get filteredPublishedStories(): any[] {
    if (this.heroineFilter === 'all') return this.publishedStories;
    return this.publishedStories.filter((story) => (story.theme || '').toLowerCase().includes(this.heroineFilter.toLowerCase()));
  }

  get filteredNews(): ContentEntry[] {
    const items = this.contentFor('news');
    if (this.newsFilter === 'all') return items;
    return items.filter((item) => (item.subtype || '').toLowerCase() === this.newsFilter.toLowerCase());
  }

  relatedEntriesFor(entry: ContentEntry): ContentEntry[] {
    if (!entry.relatedIds?.length) return [];
    return this.publicContent.filter((item) => item._id && entry.relatedIds.includes(item._id));
  }

  sectionForType(type: string): string {
    const map: Record<string, string> = {
      exhibition: 'galleries',
      collection: 'collections',
      document: 'collections',
      heroine: 'heroines',
      'oral-history': 'stories',
      education: 'education',
      research: 'research',
      event: 'events',
      shop: 'shop',
      news: 'news',
      press: 'news',
      partner: 'support',
      timeline: 'about',
      team: 'about',
      visit: 'visit'
    };
    return map[type] || 'home';
  }

  copy(key: string, fallback: string): string {
    return this.pageCopy[key]?.trim() || fallback;
  }

  contentLabel(type: string): string {
    return this.contentTypes.find((item) => item.key === type)?.label || type;
  }

  paymentUrl(method: string): string {
    return `/donate/${method === 'stripe' ? 'card' : method}`;
  }

  jump(id: string) {
    this.navOpen = false;
    if (this.isAdmin || this.isDonationPage) {
      window.history.pushState({}, '', `/#${id}`);
      this.syncRoute();
    }
    this.activeNav = id;
    if (id === 'visit') this.track('visit_info_views');
    if (id === 'galleries') this.track('exhibition_views');
    if (id === 'collections') this.track('collection_views');
    if (id === 'heroines') this.track('heroine_views');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  }

  // Unified Enquiry & Booking Modal (Section 21 & 37)
  openEnquiryModal(formType: string, title: string, relatedItem = '') {
    this.enquiryModalTitle = title;
    this.enquiryConfirmed = false;
    this.enquiryError = '';
    this.enquiryForm = {
      formType,
      name: '',
      email: '',
      phone: '',
      organisation: '',
      subject: title,
      preferredDate: '',
      participants: '',
      ageGrade: '',
      tourType: formType === 'school-visit' ? 'School guided gallery tour' : 'Guided gallery tour',
      learningObjectives: '',
      accessibilityNeeds: '',
      specialRequirements: '',
      interestArea: '',
      relatedItem,
      message: '',
      privacyConsent: false,
      _hp: ''
    };
    this.enquiryModalOpen = true;
  }

  submitEnquiry() {
    if (this.enquirySending) return;
    this.enquiryError = '';
    if (!this.enquiryForm.privacyConsent) {
      this.enquiryError = 'Please confirm the privacy notice so our team may respond to your request.';
      return;
    }
    this.enquirySending = true;
    this.http.post<any>(`${this.api}/enquiries`, this.enquiryForm).subscribe({
      next: () => {
        this.enquirySending = false;
        this.enquiryConfirmed = true;
        this.enquiryConfirmationNote = (this.enquiryForm.formType === 'school-visit' || this.enquiryForm.formType === 'group-tour')
          ? 'Thank you for requesting a visit to She Stands Women’s Museum. Our team will review your request and contact you to confirm availability, timing, group arrangements and visitor information.'
          : 'Thank you. Your submission has been routed to the appropriate museum team, who will respond using the contact details you supplied.';
      },
      error: (error) => {
        this.enquirySending = false;
        this.enquiryError = error.error?.message || 'We could not submit your request right now. You may email info@sswomensmuseum.org directly.';
      }
    });
  }

  submitContactForm() {
    if (this.contactSending) return;
    this.contactStatus = '';
    if (!this.contactForm.privacyConsent) {
      this.contactStatus = 'Please confirm the privacy notice before sending your enquiry.';
      return;
    }
    this.contactSending = true;
    this.http.post<any>(`${this.api}/enquiries`, this.contactForm).subscribe({
      next: (res) => {
        this.contactSending = false;
        this.contactStatus = `Your enquiry has been received and routed to our ${res.department} desk. We will respond shortly.`;
        this.contactForm = { formType: 'general', name: '', email: '', phone: '', subject: '', message: '', privacyConsent: false, _hp: '' };
      },
      error: (error) => {
        this.contactSending = false;
        this.contactStatus = error.error?.message || 'We could not send your enquiry just now. Please email info@sswomensmuseum.org.';
      }
    });
  }

  submitReflection() {
    if (this.reflectionSending) return;
    this.reflectionStatus = '';
    if (!this.reflectionForm.consent) {
      this.reflectionStatus = 'Please confirm that the museum may review your contribution before public display.';
      return;
    }
    this.reflectionSending = true;
    this.http.post<any>(`${this.api}/reflections`, this.reflectionForm).subscribe({
      next: () => {
        this.reflectionSending = false;
        this.reflectionStatus = 'Thank you. Your reflection has been received for ethical curatorial review before joining the community wall.';
        this.reflectionForm = { promptType: this.reflectionForm.promptType, honoureeName: '', contributorName: '', contributorEmail: '', place: '', message: '', consent: false, _hp: '' };
      },
      error: (error) => {
        this.reflectionSending = false;
        this.reflectionStatus = error.error?.message || 'We could not save your reflection right now. Please try again.';
      }
    });
  }

  // Enhanced Global Search across ALL museum records (Section 35)
  get globalSearchResults() {
    const q = this.globalSearchQuery.trim().toLowerCase();
    const contentItems = this.publicContent.map((entry) => ({
      kind: entry.type,
      type: this.contentLabel(entry.type),
      title: entry.title,
      subtitle: [entry.date, entry.place, entry.summary].filter(Boolean).join(' · ') || 'Published museum record',
      section: this.sectionForType(entry.type),
      searchable: `${entry.title} ${entry.summary} ${entry.body} ${entry.date} ${entry.place} ${entry.attribution} ${entry.communityContext} ${entry.subtype} ${entry.accessionNumber}`
    }));
    const galleries = this.museumGalleries.map((item) => ({
      kind: 'gallery',
      type: 'Permanent space',
      title: item.title,
      subtitle: item.summary,
      section: 'galleries',
      searchable: `${item.title} ${item.summary} ${item.description} ${item.themes.join(' ')}`
    }));
    const stories = this.publishedStories.map((item) => ({
      kind: 'story',
      type: 'Community memory',
      title: item.name,
      subtitle: `${item.theme || 'Shared story'} · ${item.place || 'South Sudan'}`,
      section: 'heroines',
      searchable: `${item.name} ${item.theme} ${item.place} ${item.story}`
    }));
    const sections = this.museumMenu.map((item) => ({
      kind: 'section',
      type: 'Museum section',
      title: item.label,
      subtitle: 'Go directly to this section',
      section: item.id,
      searchable: item.label
    }));
    const all = [...contentItems, ...galleries, ...stories, ...sections];
    return all.filter((item) => {
      const typeOk = this.globalSearchType === 'all' || item.kind === this.globalSearchType;
      const queryOk = !q || item.searchable.toLowerCase().includes(q) || item.type.toLowerCase().includes(q);
      return typeOk && queryOk;
    }).slice(0, 24);
  }

  openChat() {
    this.helpOpen = true;
    if (this.chatKey) this.refreshChat();
  }

  toggleChat() {
    this.helpOpen = !this.helpOpen;
    if (this.helpOpen && this.chatKey) this.refreshChat();
  }

  refreshChat() {
    if (!this.chatKey) return;
    this.http.get<any>(`${this.api}/messages/${encodeURIComponent(this.chatKey)}`).subscribe({
      next: (result) => (this.chatMessages = result.messages || this.chatMessages)
    });
  }

  choosePayment(method: string) {
    this.donation.paymentMethod = method;
    this.donation.frequency = method === 'stripe' || method === 'google-pay' ? this.donation.frequency : 'once';
    if (method === 'mpesa') this.donation.amount = 2500;
    else if (method === 'google-pay') this.donation.amount = 35;
    else if (method === 'paypal') this.donation.amount = 50;
    else this.donation.amount = 50;
  }

  makeDonation() {
    if (this.donationSubmitting) return;
    this.donationMessage = '';
    this.donationSubmitting = true;
    this.http.post<any>(`${this.api}/donations`, this.donation).subscribe({
      next: (result) => {
        this.donationSubmitting = false;
        this.donationId = result.id;
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }
        this.donationReference = result.reference || result.id;
        this.donationMessage = result.message;
        this.donationPaybill = result.paybill || '';
        this.donationAccountName = result.accountName || '';
        this.manualReferenceNeeded = result.pending === false;
        this.donationState = 'pending';
      },
      error: (error) => {
        this.donationSubmitting = false;
        this.donationMessage = error.error?.message || 'Online checkout is temporarily unavailable. You can use our Donation Enquiry form or write to info@sswomensmuseum.org.';
      }
    });
  }

  sendReference() {
    if (!this.donation.note.trim()) return;
    this.http.post<any>(`${this.api}/donations/${this.donationId}/reference`, { reference: this.donation.note }).subscribe({
      next: () => {
        this.donationState = 'done';
        this.donationMessage = 'Thank you. Your M-Pesa confirmation code is queued for reconciliation in the Curator Ledger.';
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
      error: (error) => (this.chatStatus = error.error?.message || 'Messaging is temporarily unavailable. You can email info@sswomensmuseum.org.')
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
        this.storyStatus = 'Your submission has been received for curatorial review. Our team will discuss consent and attribution before any public display.';
        this.storyForm = { name: '', email: '', place: '', relationship: '', theme: '', interviewInterest: 'unsure', story: '', consent: false, _hp: '' };
        this.storyFile = null;
      },
      error: (error) => (this.storyStatus = error.error?.message || 'We could not save your story just now. Please check all required fields and try again.')
    });
  }

  toggleNewsletterInterest(topic: string) {
    if (this.newsletterInterests.includes(topic)) {
      this.newsletterInterests = this.newsletterInterests.filter((t) => t !== topic);
    } else {
      this.newsletterInterests = [...this.newsletterInterests, topic];
    }
  }

  subscribe() {
    this.newsletterStatus = '';
    if (this.newsletterMode === 'subscribe' && !this.newsletterConsent) {
      this.newsletterStatus = 'Please agree to receive museum updates before subscribing.';
      return;
    }
    const endpoint = this.newsletterMode === 'subscribe' ? 'newsletter' : 'newsletter/unsubscribe';
    const body = this.newsletterMode === 'subscribe'
      ? { name: this.newsletterName, email: this.newsletterEmail, interests: this.newsletterInterests, _hp: this.newsletterHp }
      : { email: this.newsletterEmail };
    this.http.post<any>(`${this.api}/${endpoint}`, body).subscribe({
      next: () => {
        this.newsletterStatus = this.newsletterMode === 'subscribe'
          ? 'Thank you for subscribing to She Stands Women’s Museum updates.'
          : 'Your email has been removed from museum updates.';
        this.newsletterName = '';
        this.newsletterEmail = '';
        this.newsletterInterests = [];
      },
      error: (error) => (this.newsletterStatus = error.error?.message || 'Please enter a valid email address.')
    });
  }

  // ==================== CURATOR ADMIN DESK ====================
  httpOptions() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.adminToken}` }) };
  }

  can(permission: string): boolean {
    return this.adminRole === 'administrator' || !this.adminPermissions.length || this.adminPermissions.includes(permission);
  }

  openAdminDesk(event?: Event) {
    this.navigateTo('/admin', event);
  }

  closeAdminDesk(event?: Event) {
    this.navigateTo('/', event);
  }

  login() {
    this.adminError = '';
    this.http.post<any>(`${this.api}/admin/login`, { password: this.adminPassword }).subscribe({
      next: (result) => {
        this.adminToken = result.token;
        this.adminRole = result.role || 'administrator';
        this.adminRoleLabel = result.label || 'Museum Administrator';
        this.adminPermissions = result.permissions || [];
        sessionStorage.setItem('ss_admin_token', this.adminToken);
        sessionStorage.setItem('ss_admin_role', this.adminRole);
        sessionStorage.setItem('ss_admin_role_label', this.adminRoleLabel);
        sessionStorage.setItem('ss_admin_permissions', JSON.stringify(this.adminPermissions));
        this.adminPassword = '';
        this.loadAdmin();
      },
      error: (error) => (this.adminError = error.error?.message || 'Unable to reach the museum server to sign in.')
    });
  }

  logout() {
    sessionStorage.removeItem('ss_admin_token');
    sessionStorage.removeItem('ss_admin_role');
    sessionStorage.removeItem('ss_admin_role_label');
    sessionStorage.removeItem('ss_admin_permissions');
    this.adminToken = '';
    this.adminTab = 'overview';
  }

  loadAdmin() {
    if (!this.adminToken) return;
    const options = this.httpOptions();
    this.http.get<any>(`${this.api}/admin/me`, options).subscribe({
      next: (me) => {
        this.adminRole = me.role || 'administrator';
        this.adminRoleLabel = me.label || 'Museum Administrator';
        this.adminPermissions = me.permissions || [];
        this.fetchAuthorizedAdminData(options);
      },
      error: () => this.logout()
    });
  }

  private fetchAuthorizedAdminData(options: { headers: HttpHeaders }) {
    this.http.get<any>(`${this.api}/admin/overview`, options).subscribe({ next: (value) => (this.adminStats = value) });
    this.http.get<any>(`${this.api}/admin/analytics`, options).subscribe({ next: (value) => (this.adminAnalytics = value) });
    this.http.get<any>(`${this.api}/admin/payment-status`, options).subscribe({ next: (value) => (this.paymentStatus = value) });
    if (this.can('donations')) {
      this.http.get<any[]>(`${this.api}/admin/donations`, options).subscribe({ next: (value) => (this.adminDonations = value) });
    }
    if (this.can('enquiries')) {
      this.http.get<any[]>(`${this.api}/admin/enquiries`, options).subscribe({
        next: (value) => {
          this.adminEnquiries = value;
          value.forEach((item) => (this.enquiryNotesDraft[item._id] = item.staffNotes || ''));
        }
      });
    }
    if (this.can('media')) {
      this.http.get<any[]>(`${this.api}/admin/media`, options).subscribe({ next: (value) => (this.adminMedia = value) });
    }
    if (this.can('stories')) {
      this.http.get<any[]>(`${this.api}/admin/stories`, options).subscribe({
        next: (value) => {
          this.adminStories = value;
          value.forEach((item) => (this.adminStoryNotice[item._id] = item.contentNotice || ''));
        }
      });
    }
    if (this.can('reflections')) {
      this.http.get<any[]>(`${this.api}/admin/reflections`, options).subscribe({ next: (value) => (this.adminReflections = value) });
    }
    if (this.can('messages')) {
      this.http.get<any[]>(`${this.api}/admin/messages`, options).subscribe({ next: (value) => (this.adminMessages = value) });
    }
    if (this.can('content')) {
      this.http.get<ContentEntry[]>(`${this.api}/admin/content`, options).subscribe({ next: (value) => (this.adminContent = value) });
    }
    if (this.can('audience')) {
      this.http.get<any[]>(`${this.api}/admin/subscribers`, options).subscribe({ next: (value) => (this.adminSubscribers = value) });
    }
    this.http.get<any>(`${this.api}/public/settings`).subscribe({
      next: (value) => {
        this.adminSocials = value.socials || this.socials;
        this.siteImages = Object.fromEntries(
          Object.entries(value.siteImages || {}).filter(([key]) => this.siteImageSlots.some((slot) => slot.key === key))
        ) as Record<string, string>;
        this.pageCopy = value.pageCopy || {};
        this.heroOverride = value.heroImage || '';
        this.heroAudio = value.heroAudio || '';
      }
    });
  }

  get filteredAdminContent(): ContentEntry[] {
    return this.contentFilter === 'all' ? this.adminContent : this.adminContent.filter((entry) => entry.type === this.contentFilter);
  }

  get filteredAdminDonations(): any[] {
    return this.adminDonations.filter((gift) => {
      const statusOk = this.donationStatusFilter === 'all' || gift.status === this.donationStatusFilter;
      const methodOk = this.donationMethodFilter === 'all' || (gift.paymentMethod || 'stripe') === this.donationMethodFilter;
      return statusOk && methodOk;
    });
  }

  get filteredAdminEnquiries(): any[] {
    return this.adminEnquiries.filter((item) => {
      const deptOk = this.enquiryDeptFilter === 'all' || item.department === this.enquiryDeptFilter;
      const statusOk = this.enquiryStatusFilter === 'all' || item.status === this.enquiryStatusFilter;
      return deptOk && statusOk;
    });
  }

  editContent(entry: ContentEntry) {
    this.contentSubTab = 'library';
    this.contentDraft = { ...emptyEntry(), ...entry, relatedIds: [...(entry.relatedIds || [])] };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  newContent() {
    this.contentDraft = emptyEntry();
  }

  toggleRelatedId(id: string) {
    if (!id) return;
    if (this.contentDraft.relatedIds.includes(id)) {
      this.contentDraft.relatedIds = this.contentDraft.relatedIds.filter((item) => item !== id);
    } else {
      this.contentDraft.relatedIds = [...this.contentDraft.relatedIds, id];
    }
  }

  savePageCopy() {
    this.http.put<any>(`${this.api}/admin/settings`, { pageCopy: this.pageCopy }, this.httpOptions()).subscribe({
      next: (result) => {
        this.pageCopy = result.pageCopy || {};
        this.adminNotice = 'Public museum text and visitor details updated.';
      },
      error: (error) => (this.adminNotice = error.error?.message || 'The page text could not be saved.')
    });
  }

  saveContent() {
    this.adminNotice = '';
    const draft = this.contentDraft;
    const url = draft._id ? `${this.api}/admin/content/${draft._id}` : `${this.api}/admin/content`;
    const request = draft._id
      ? this.http.put<ContentEntry>(url, draft, this.httpOptions())
      : this.http.post<ContentEntry>(url, draft, this.httpOptions());
    request.subscribe({
      next: (saved) => {
        this.contentDraft = { ...emptyEntry(), ...saved };
        this.adminNotice = saved.status === 'published' ? 'Published record is now live on the museum site.' : 'Draft saved privately.';
        this.loadAdmin();
        this.loadPublicData();
      },
      error: (error) => (this.adminNotice = error.error?.message || 'The entry could not be saved.')
    });
  }

  removeContent(entry: ContentEntry) {
    if (!entry._id || !window.confirm(`Remove “${entry.title}”?`)) return;
    this.http.delete(`${this.api}/admin/content/${entry._id}`, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Record removed.';
        this.newContent();
        this.loadAdmin();
        this.loadPublicData();
      },
      error: (error) => (this.adminNotice = error.error?.message || 'The record could not be removed.')
    });
  }

  verifyDonation(id: string) {
    this.http.patch(`${this.api}/admin/donations/${id}/verify`, {}, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Contribution marked as received.';
        this.loadAdmin();
      }
    });
  }

  updateEnquiry(item: any, status: string) {
    this.http.patch(`${this.api}/admin/enquiries/${item._id}`, {
      status,
      staffNotes: this.enquiryNotesDraft[item._id] || ''
    }, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Enquiry status and notes saved.';
        this.loadAdmin();
      },
      error: (error) => (this.adminNotice = error.error?.message || 'Could not update enquiry.')
    });
  }

  deleteEnquiry(item: any) {
    if (!window.confirm(`Remove enquiry from ${item.name}?`)) return;
    this.http.delete(`${this.api}/admin/enquiries/${item._id}`, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Enquiry removed.';
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
    this.http.put(`${this.api}/admin/settings`, { heroImage: url }, this.httpOptions()).subscribe({
      next: () => {
        this.heroOverride = url;
        this.adminNotice = 'Homepage hero photograph updated.';
      }
    });
  }

  featureAudio(url: string) {
    this.http.put(`${this.api}/admin/settings`, { heroAudio: url }, this.httpOptions()).subscribe({
      next: () => {
        this.heroAudio = url;
        this.adminNotice = 'Featured oral history audio updated.';
      }
    });
  }

  placeMedia(publicId: string, url: string) {
    const slot = this.mediaSlotSelection[publicId];
    if (!slot) { this.adminNotice = 'Choose a page position first.'; return; }
    const siteImages = { ...this.siteImages, [slot]: url };
    this.http.put<any>(`${this.api}/admin/settings`, { siteImages }, this.httpOptions()).subscribe({
      next: () => { this.siteImages = siteImages; this.adminNotice = 'Page image updated.'; },
      error: (error) => (this.adminNotice = error.error?.message || 'The image could not be placed.')
    });
  }

  clearSiteImage(slot: string) {
    const siteImages = { ...this.siteImages, [slot]: '' };
    this.http.put<any>(`${this.api}/admin/settings`, { siteImages }, this.httpOptions()).subscribe({
      next: () => { this.siteImages = siteImages; this.adminNotice = 'Page image reset to default.'; },
      error: (error) => (this.adminNotice = error.error?.message || 'The image could not be reset.')
    });
  }

  deleteMedia(id: string) {
    this.http.delete(`${this.api}/admin/media/${encodeURIComponent(id)}`, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Media file removed.';
        this.loadAdmin();
      }
    });
  }

  reviewStory(id: string, status: string) {
    if (status === 'published' && !this.adminStoryClearance[id]) {
      this.adminNotice = 'Confirm identity, consent, rights and context before publishing.';
      return;
    }
    this.http.patch(`${this.api}/admin/stories/${id}`, {
      status,
      publicationCleared: status === 'published' && !!this.adminStoryClearance[id],
      contentNotice: this.adminStoryNotice[id] || ''
    }, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Story review saved.';
        this.loadAdmin();
        this.loadPublicData();
      },
      error: (error) => (this.adminNotice = error.error?.message || 'The review could not be saved.')
    });
  }

  reviewReflection(id: string, status: string) {
    if (status === 'published' && !this.adminReflectionClearance[id]) {
      this.adminNotice = 'Confirm ethical review and consent before publishing to the community wall.';
      return;
    }
    this.http.patch(`${this.api}/admin/reflections/${id}`, {
      status,
      publicationCleared: status === 'published' && !!this.adminReflectionClearance[id]
    }, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Community reflection updated.';
        this.loadAdmin();
        this.loadPublicData();
      },
      error: (error) => (this.adminNotice = error.error?.message || 'Could not update reflection.')
    });
  }

  deleteReflection(id: string) {
    if (!window.confirm('Remove this visitor reflection permanently?')) return;
    this.http.delete(`${this.api}/admin/reflections/${id}`, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Reflection removed.';
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
        this.adminNotice = 'Reply sent to visitor conversation.';
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
        this.adminNotice = 'Official social channels updated.';
      },
      error: (error) => (this.adminNotice = error.error?.message || 'Social links could not be saved.')
    });
  }

  removeSubscriber(id: string) {
    if (!window.confirm('Remove this subscriber from the mailing list?')) return;
    this.http.delete(`${this.api}/admin/subscribers/${id}`, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Subscriber removed.';
        this.loadAdmin();
      }
    });
  }

  downloadExport(scope: string, format: 'json' | 'csv') {
    this.http.get(`${this.api}/admin/export?scope=${encodeURIComponent(scope)}&format=${format}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.adminToken}` }),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `she-stands-${scope}-${new Date().toISOString().slice(0, 10)}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        this.adminNotice = `Exported ${scope} (${format.toUpperCase()}).`;
      },
      error: () => (this.adminNotice = 'Unable to export data right now.')
    });
  }
}
