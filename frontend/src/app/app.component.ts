import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { collectionTypes, eventFormats, heroineCategories, learningProgrammes, museumGalleries, museumMenu, museumValues, newsCategories, researchServices, shopCategories, siteImageSlots, supportWays } from './museum-content';

type SocialLink = { name: string; url: string };

@Component({
  selector: 'ss-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private http = inject(HttpClient);
  api = (window as Window & { __SHE_STANDS_API_URL__?: string }).__SHE_STANDS_API_URL__ || `${window.location.protocol}//${window.location.hostname}:4000/api`;
  isAdmin = window.location.pathname.startsWith('/admin');
  navOpen = false;
  helpOpen = false;
  activeNav = 'home';

  heroImage = 'assets/hero-editorial-v2.png';
  mobileHeroImage = 'assets/hero-mobile-v2.jpg';
  heroOverride = '';
  heroAudio = '';
  siteImages: Record<string, string> = {};
  socials: SocialLink[] = [];
  museumMenu = museumMenu;
  museumGalleries = museumGalleries;
  museumValues = museumValues;
  collectionTypes = collectionTypes;
  heroineCategories = heroineCategories;
  learningProgrammes = learningProgrammes;
  researchServices = researchServices;
  eventFormats = eventFormats;
  shopCategories = shopCategories;
  supportWays = supportWays;
  newsCategories = newsCategories;
  siteImageSlots = siteImageSlots;
  publishedStories: any[] = [];

  globalSearchOpen = false;
  globalSearchQuery = '';

  // Visit reservation modal
  visitModalOpen = false;
  visitBooking = { type: 'General / Group Visit', date: '', name: '', email: '', guests: '2', notes: '' };
  visitBookingConfirmed = false;
  visitBookingSending = false;
  visitBookingError = '';

  // Donation & Checkout Studio
  donation = { name: '', email: '', amount: 50, frequency: 'once', note: '', paymentMethod: 'mpesa', phone: '' };
  manualReferenceNeeded = false;
  donationState: 'form' | 'pending' | 'done' = 'form';
  donationMessage = '';
  donationReference = '';
  donationId = '';

  // Chat
  messageForm = { name: localStorage.getItem('ss_chat_name') || '', email: localStorage.getItem('ss_chat_email') || '', message: '' };
  chatMessages: any[] = [{ from: 'team', text: 'Welcome to She Stands Women’s Museum. Ask us about visiting, contributing a story or supporting our programmes.' }];
  chatStatus = '';
  chatKey = localStorage.getItem('ss_chat_key') || '';

  // Story submission + Draft persistence (Page 9)
  storyForm = { name: '', email: '', place: '', relationship: '', theme: '', interviewInterest: 'unsure', story: '', consent: false };
  storyFile: File | null = null;
  storyStatus = '';

  // Newsletter (Page 11)
  newsletterEmail = '';
  newsletterStatus = '';
  newsletterConsent = false;
  newsletterMode: 'subscribe' | 'unsubscribe' = 'subscribe';

  // Admin state
  adminToken = sessionStorage.getItem('ss_admin_token') || '';
  adminPassword = '';
  showAdminPassword = false;
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
  adminStoryClearance: Record<string, boolean> = {};
  mediaSlotSelection: Record<string, string> = {};
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
        this.siteImages = Object.fromEntries(Object.entries(settings.siteImages || {}).filter(([key]) => this.siteImageSlots.some((slot) => slot.key === key))) as Record<string, string>;
        this.publishedStories = Array.isArray(settings.publishedStories) ? settings.publishedStories : [];
        if (this.isAdmin && this.adminToken) this.loadAdmin();
      },
      error: () => {
        if (this.isAdmin && this.adminToken) this.loadAdmin();
      }
    });
    if (this.isAdmin && this.adminToken) this.loadAdmin();
    if (!this.isAdmin && window.location.hash) {
      let section = window.location.hash.slice(1);
      try { section = decodeURIComponent(section); } catch { /* keep the raw fragment */ }
      setTimeout(() => document.getElementById(section)?.scrollIntoView({ block: 'start' }), 250);
    }
  }

  jump(id: string) {
    this.navOpen = false;
    this.activeNav = id;
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  openVisitModal(eventTitle = 'General / Group Visit') {
    this.visitBooking.type = eventTitle;
    this.visitBookingConfirmed = false;
    this.visitBookingError = '';
    this.visitModalOpen = true;
  }

  submitVisitBooking() {
    if (!this.visitBooking.name || !this.visitBooking.email || this.visitBookingSending) return;
    this.visitBookingSending = true;
    this.visitBookingError = '';
    this.http.post<any>(`${this.api}/messages`, {
      name: this.visitBooking.name,
      email: this.visitBooking.email,
      message: `[${this.visitBooking.type}] Preferred date: ${this.visitBooking.date || 'Flexible'} | Group size: ${this.visitBooking.guests} | Notes: ${this.visitBooking.notes || 'None'}`
    }).subscribe({
      next: () => { this.visitBookingSending = false; this.visitBookingConfirmed = true; },
      error: (error) => { this.visitBookingSending = false; this.visitBookingError = error.error?.message || 'We could not send your request. Please try again or contact the museum by email.'; }
    });
  }

  get globalSearchResults() {
    const q = this.globalSearchQuery.trim().toLowerCase();
    if (!q) return [];
    const sections = this.museumMenu.map((item) => ({ type: 'Museum section', title: item.label, subtitle: 'Explore the museum', section: item.id }));
    const galleries = this.museumGalleries.map((item) => ({ type: 'Gallery', title: item.title, subtitle: item.description, section: 'galleries' }));
    const stories = this.publishedStories.map((item) => ({ type: 'Community story', title: item.name, subtitle: item.theme || 'Shared memory', section: 'heroines' }));
    return [...sections, ...galleries, ...stories].filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(q));
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

  httpOptions() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.adminToken}` }) };
  }

  scrollDonate() {
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
        this.storyForm = { name: '', email: '', place: '', relationship: '', theme: '', interviewInterest: 'unsure', story: '', consent: false };
        this.storyFile = null;
      },
      error: (error) => (this.storyStatus = error.error?.message || 'We could not save your story just now. Please check all fields and try again.')
    });
  }

  subscribe() {
    this.newsletterStatus = '';
    if (this.newsletterMode === 'subscribe' && !this.newsletterConsent) { this.newsletterStatus = 'Please agree to receive museum updates before subscribing.'; return; }
    const endpoint = this.newsletterMode === 'subscribe' ? 'newsletter' : 'newsletter/unsubscribe';
    this.http.post<any>(`${this.api}/${endpoint}`, { email: this.newsletterEmail }).subscribe({
      next: () => {
        this.newsletterStatus = this.newsletterMode === 'subscribe' ? 'Thank you for subscribing to museum updates.' : 'Your unsubscribe request has been processed.';
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
    this.http.get<any>(`${this.api}/public/settings`).subscribe({ next: (value) => {
      this.adminSocials = value.socials || this.socials;
      this.siteImages = Object.fromEntries(Object.entries(value.siteImages || {}).filter(([key]) => this.siteImageSlots.some((slot) => slot.key === key))) as Record<string, string>;
      this.heroOverride = value.heroImage || '';
      this.heroAudio = value.heroAudio || '';
    } });
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
      next: () => { this.siteImages = siteImages; this.adminNotice = 'Page image reset.'; },
      error: (error) => (this.adminNotice = error.error?.message || 'The image could not be reset.')
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
    if (status === 'published' && !this.adminStoryClearance[id]) { this.adminNotice = 'Confirm identity, consent, rights and context before publishing.'; return; }
    this.http.patch(`${this.api}/admin/stories/${id}`, { status, publicationCleared: status === 'published' && !!this.adminStoryClearance[id] }, this.httpOptions()).subscribe({
      next: () => {
        this.adminNotice = 'Story review saved.';
        this.loadAdmin();
      },
      error: (error) => (this.adminNotice = error.error?.message || 'The review could not be saved.')
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
