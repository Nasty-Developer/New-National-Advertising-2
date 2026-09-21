import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bot, Check, ChevronDown, CircleCheck, Clock3, FileText, Grid2X2, Lightbulb, Mail, MapPin, Menu, MessageCircle, Package, PenLine, Phone, Printer, Ruler, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { useGetAdminSession, useGetPublicProducts } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import AdminPage from '@/pages/admin';
import AdminLogin from '@/pages/admin-login';

const queryClient = new QueryClient();

const whatsappUrl = 'https://wa.me/919555759677?text=Hello%20New%20National%20Advertising%2C%20I%20would%20like%20to%20enquire%20about%20your%20printing%20and%20advertising%20services.';
const googleMapsUrl = 'https://maps.app.goo.gl/fp4fTcaVwx2bojXz7';
const businessAddressLines = [
  'Room No. 3, New National Advertising',
  'Plot No. 47, Line No. K, Road No. 5',
  'Opposite Mahesh Jewellers, Nearby Ambedkar Garden',
  'Govandi (W), Govandi West',
  'Raman Mama Nagar, Shivaji Nagar',
  'Mumbai, Maharashtra - 400043, India',
];

const services = [
  {
    slug: 'sign-boards',
    title: 'Signage Board',
    category: 'Signage solutions',
    description: 'Professional signage solutions designed to make businesses, brands and storefronts visible and memorable.',
    whatIs: 'A Signage Board gives your storefront, office or event a clear visual identity. We help turn your brand into a physical display that is easy to notice in daylight and after dark.',
    items: ['Acrylic Clip-on Boards', 'Crystal Letters', 'LED Signage', 'Steel & Brass Letters', 'Pixel LED', 'Backlit Signage', 'Signage', 'Kitchen', 'Badge', 'Paper Bed', 'Sandwich'],
    applications: ['Shop Signage', 'Office Signage', 'Brand Displays', 'Promotional Displays', 'Indoor Signage', 'Outdoor Signage', 'Event Displays'],
    materials: ['Acrylic', 'Crystal letters', 'LED', 'Steel and brass'],
    whyChoose: ['Clearer brand visibility', 'Options for indoor and outdoor use', 'A choice of illuminated and non-illuminated finishes'],
    image: '/service-sign-boards.jpg',
    imageAlt: 'Modern storefront with acrylic and illuminated signage',
    icon: Ruler,
    accent: '#D7A918',
    tint: '#FFFCF0',
    seoTitle: 'Signage Board Services in Mumbai | New National Advertising',
    seoDescription: 'Professional signage board, acrylic, LED, backlit and storefront signage solutions from New National Advertising in Mumbai.',
    related: ['solvent-flex', 'banner-printing', 'graphics-design'],
  },
  {
    slug: 'banner-printing',
    title: 'Banner Printing',
    category: 'Advertising materials',
    description: 'Large-format advertising banners for businesses, promotions, events and outdoor visibility.',
    whatIs: 'Banner printing helps a message stay visible across storefronts, events, promotions and outdoor advertising placements. We produce banner artwork and printed advertising materials around the use case.',
    items: ['Banner Printing', 'Advertising Materials'],
    applications: ['Store promotions', 'Event backdrops', 'Outdoor advertising', 'Launch announcements', 'Directional displays'],
    materials: ['Printed banner material', 'Large-format graphics', 'Display-ready advertising artwork'],
    whyChoose: ['Clear communication from a distance', 'Flexible for promotions and events', 'Designed around the placement and viewing context'],
    image: '/service-banner-printing.jpg',
    imageAlt: 'Large-format advertising banner being printed in a commercial studio',
    icon: Printer,
    accent: '#F26B5B',
    tint: '#FFF5F2',
    seoTitle: 'Banner Printing in Mumbai | New National Advertising',
    seoDescription: 'Large-format advertising banner printing for businesses, promotions, events and outdoor visibility in Mumbai.',
    related: ['solvent-flex', 'sign-boards', 'digital-printing'],
  },
  {
    slug: 'solvent-flex',
    title: 'Eco Solvent Flex',
    category: 'Large-format printing',
    description: 'Large-format printing solutions for banners, displays, branding and promotional applications.',
    whatIs: 'Eco solvent flex printing is built for bold, visible graphics across banners, vinyl, window graphics and display materials. It is a practical way to carry a campaign from a storefront to a larger outdoor setting.',
    items: ['Star Flex', 'Star Black Back', 'One Way Vision', 'Canvas', 'Gloss Vinyl', 'Matt Vinyl', 'Vinyl with Sunboard', 'Vinyl with Sunpack', 'Sunboard 3mm / 5mm', 'Backlight Printing'],
    applications: ['Advertising Banners', 'Shop Branding', 'Outdoor Advertising', 'Window Graphics', 'Promotional Displays', 'Backlit Displays'],
    materials: ['Star flex', 'Black back flex', 'One way vision', 'Canvas', 'Gloss vinyl', 'Matt vinyl', 'Sunboard and sunpack'],
    whyChoose: ['Strong visual impact at larger sizes', 'Flexible options for windows, walls and displays', 'Suitable for colorful promotional artwork'],
    image: '/service-solvent-flex.jpg',
    imageAlt: 'Large-format flex banner and rolled vinyl beside a professional printer',
    icon: Printer,
    accent: '#00A8C6',
    tint: '#F1FBFC',
    seoTitle: 'Eco Solvent Flex & Large Format Printing in Mumbai | New National Advertising',
    seoDescription: 'Large-format eco solvent flex, vinyl, canvas, sunboard and backlit printing solutions from New National Advertising in Mumbai.',
    related: ['banner-printing', 'sign-boards', 'digital-printing'],
  },
  {
    slug: 'offset-printing',
    title: 'Offset Printing',
    category: 'Commercial printing',
    description: 'Professional printed materials for businesses, events, stationery and marketing requirements.',
    whatIs: 'Offset printing is a dependable choice for polished stationery and marketing collateral. It brings consistent color and a considered paper finish to the pieces your business uses every day.',
    items: ['Brochure & Catalogues', 'Calendars', 'Letterheads', 'Business Cards', 'Bill Books', 'Envelopes', 'Wedding Cards', 'Flyers & Leaflets', 'Pavti Books', 'Menu Cards'],
    applications: ['Business stationery', 'Marketing collateral', 'Event materials', 'Retail menus', 'Wedding and invitation suites'],
    materials: ['Paper stocks', 'Brochure paper', 'Card stocks', 'Envelopes', 'Finished and folded pieces'],
    whyChoose: ['Consistent color across a printed set', 'A professional finish for business materials', 'Suitable for coordinated stationery and collateral'],
    image: '/service-offset-printing.jpg',
    imageAlt: 'Stacks of brochures, business cards and letterheads in an offset print studio',
    icon: FileText,
    accent: '#1769AA',
    tint: '#F3F8FC',
    seoTitle: 'Offset Printing in Mumbai | New National Advertising',
    seoDescription: 'Offset printing for brochures, catalogues, stationery, business cards, menus and event materials in Mumbai.',
    related: ['digital-printing', 'graphics-design', 'screen-printing'],
  },
  {
    slug: 'screen-printing',
    title: 'Screen Printing',
    category: 'Custom print finishes',
    description: 'Custom screen printing for apparel, promotional products and printed materials.',
    whatIs: 'Screen printing places a distinct layer of ink onto a surface, making it a useful option for apparel, bags, stationery and promotional pieces that benefit from a tactile printed finish.',
    items: ['Wedding Cards', 'Visiting Cards', 'Letterheads', 'T-Shirts', 'Cup Print', 'Envelopes', 'Caps', 'Umbrellas', 'Carry Bags', 'ID Ribbons', 'School Bags'],
    applications: ['Apparel printing', 'Promotional products', 'School and event materials', 'Carry bags', 'Stationery'],
    materials: ['T-shirts', 'Caps', 'Carry bags', 'Umbrellas', 'Paper and stationery', 'School bags'],
    whyChoose: ['Tactile ink texture', 'Works across apparel and promotional materials', 'A practical fit for branded collections'],
    image: '/service-screen-printing.jpg',
    imageAlt: 'Screen-printed apparel, carry bags and promotional materials in a print studio',
    icon: PenLine,
    accent: '#D9468C',
    tint: '#FFF5F9',
    seoTitle: 'Screen Printing in Mumbai | New National Advertising',
    seoDescription: 'Custom screen printing for t-shirts, caps, bags, stationery, umbrellas and promotional materials in Mumbai.',
    related: ['graphics-design', 'offset-printing', 'digital-printing'],
  },
  {
    slug: 'graphics-design',
    title: 'Graphics Design',
    category: 'Brand and creative design',
    description: 'Professional creative design solutions for branding, marketing and communication.',
    whatIs: 'Graphics design shapes how your business looks across print, signage and digital touchpoints. We help organize your message into practical, ready-to-use visual assets.',
    items: ['Logo Design', 'Social Media Posts', 'Hoarding Banners', 'Menu Cards', 'Flyers', 'Product Packaging', 'Magazine Ads', 'Visiting Cards', 'Invitations', 'Brochures', 'Calendars'],
    applications: ['Brand identity', 'Social media communication', 'Retail and menu design', 'Packaging', 'Advertising campaigns'],
    materials: ['Logo systems', 'Print-ready artwork', 'Packaging layouts', 'Digital social formats', 'Marketing collateral'],
    whyChoose: ['A consistent visual language across materials', 'Design prepared for real print applications', 'Clearer communication for customers and teams'],
    image: '/service-graphics-design.jpg',
    imageAlt: 'Creative design desk with branding layouts, packaging and print materials',
    icon: Grid2X2,
    accent: '#3BA776',
    tint: '#F3FBF7',
    seoTitle: 'Graphics Design Services in Mumbai | New National Advertising',
    seoDescription: 'Graphics design for logos, packaging, social posts, menus, brochures, flyers and marketing communication in Mumbai.',
    related: ['offset-printing', 'digital-printing', 'sign-boards'],
  },
  {
    slug: 'digital-printing',
    title: 'Digital Printing',
    category: 'Fast, detailed printing',
    description: 'High-quality digital printing for business, promotional and everyday printing requirements.',
    whatIs: 'Digital printing is a flexible route for sharp, colorful business and marketing materials. It works well when you need polished printed pieces with a practical turnaround and a range of formats.',
    items: ['Visiting Cards', 'Bill Book', 'Wedding Card', 'Brochures', 'Catalogues', 'Pamphlets', 'Posters', 'Annual Reports', 'UV Print', 'Hotel Menus', 'Hospital Files', 'Trophy Stickers'],
    applications: ['Business cards', 'Marketing handouts', 'Posters and pamphlets', 'Menus and reports', 'Specialty printed pieces'],
    materials: ['Card stocks', 'Brochure paper', 'Poster paper', 'Menu materials', 'UV print surfaces'],
    whyChoose: ['Crisp detail for colorful artwork', 'Flexible for business and promotional formats', 'A practical option for everyday print requirements'],
    image: '/service-digital-printing.jpg',
    imageAlt: 'Digital printer producing colorful brochures, posters and marketing materials',
    icon: Sparkles,
    accent: '#F2994A',
    tint: '#FFF8F1',
    seoTitle: 'Digital Printing in Mumbai | New National Advertising',
    seoDescription: 'Digital printing for business cards, brochures, posters, menus, reports and promotional materials in Mumbai.',
    related: ['offset-printing', 'graphics-design', 'banner-printing'],
  },
];

const work = [
  { title: 'Storefront signage', category: 'Signage', position: 'left center', accent: '#F2C94C' },
  { title: 'Printed brochure', category: 'Offset printing', position: 'center', accent: '#1769AA' },
  { title: 'Business cards', category: 'Digital printing', position: 'right center', accent: '#F2994A' },
  { title: 'Menu & collateral', category: 'Graphic design', position: 'bottom left', accent: '#3BA776' },
  { title: 'Apparel printing', category: 'Screen printing', position: 'bottom center', accent: '#D9468C' },
  { title: 'Packaging details', category: 'Selected work', position: 'bottom right', accent: '#00A8C6' },
];

const process = [
  { number: '01', title: 'Discuss', copy: 'Share your requirements.', icon: MessageCircle, accent: '#1769AA' },
  { number: '02', title: 'Design', copy: 'We create the design.', icon: PenLine, accent: '#D9468C' },
  { number: '03', title: 'Print', copy: 'Professional production.', icon: Printer, accent: '#D7A918' },
  { number: '04', title: 'Deliver', copy: 'Get your finished work.', icon: Clock3, accent: '#3BA776' },
];

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'Our Work', href: '/#work' },
  { label: 'Machines', href: '/machines' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

const machines = [
  {
    name: 'Epson SureColor S80670',
    category: 'Large-Format Printing',
    description: 'A professional large-format printing system designed for high-quality wide-format production. The Epson SureColor S80670 shown here is built for detailed, vibrant large-format output and is suitable for producing high-impact advertising and display graphics.',
    image: '/machine-epson-surecolor-s80670.png',
    imageAlt: 'Epson SureColor S80670 large-format printer',
    related: [
      { label: 'Eco Solvent Flex', href: '/services/solvent-flex' },
      { label: 'Banner Printing', href: '/services/banner-printing' },
    ],
  },
  {
    name: 'Wide-Format Roll Laminator',
    category: 'Finishing Equipment',
    description: 'A wide-format roll laminating and finishing machine designed to handle large printed media through a controlled roller-based process. It is suitable for finishing printed materials used in advertising, signage, display graphics and other large-format applications.',
    image: '/machine-wide-format-laminator.png',
    imageAlt: 'Wide-format roll laminator',
    related: [
      { label: 'Eco Solvent Flex', href: '/services/solvent-flex' },
      { label: 'Banner Printing', href: '/services/banner-printing' },
      { label: 'Signage Board', href: '/services/sign-boards' },
    ],
  },
  {
    name: 'Large-Format Printing Machine',
    category: 'Wide-Format Production',
    description: 'A professional wide-format printing machine used for producing large printed graphics and advertising materials. The machine shown is actively handling roll media and producing large-format printed output, making it suitable for applications such as banners, signage graphics and other large visual advertising materials.',
    image: '/machine-large-format-printer.png',
    imageAlt: 'Large-format roll-to-roll printing machine',
    related: [
      { label: 'Eco Solvent Flex', href: '/services/solvent-flex' },
      { label: 'Banner Printing', href: '/services/banner-printing' },
      { label: 'Signage Board', href: '/services/sign-boards' },
    ],
  },
  {
    name: 'CO₂ Laser Cutting & Engraving Machine',
    category: 'Laser Cutting & Engraving',
    description: 'A professional laser cutting and engraving machine designed for precise cutting, engraving, and custom fabrication work. It is suitable for producing detailed signage elements, lettering, decorative pieces, panels, templates, and other customized advertising and display materials.',
    image: '/machine-co2-laser-cutter.png',
    imageAlt: 'CO₂ laser cutting and engraving machine',
    applications: [
      'Precision Laser Cutting',
      'Laser Engraving',
      'Custom Lettering & Shapes',
      'Signage Components',
      'Decorative Panels',
      'Advertising & Display Materials',
      'Custom Fabrication Work',
    ],
  },
];

type MachineRecord = {
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  applications?: string[];
  related?: Array<{ label: string; href: string }>;
  imageAlt?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

function usePublicMachines() {
  const [data, setData] = useState<MachineRecord[]>(machines.map((machine) => ({
    name: machine.name,
    category: machine.category,
    description: machine.description,
    imageUrl: machine.image,
    imageAlt: machine.imageAlt,
    applications: machine.applications,
    related: machine.related,
  })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`${apiBaseUrl}/api/machines`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load machines');
        return response.json() as Promise<Array<MachineRecord & { imageUrl?: string; image?: string }>>;
      })
      .then((records) => {
        if (!active || !records.length) return;
        setData(records.map((machine) => ({
          ...machine,
          imageUrl: machine.imageUrl || machine.image || '',
          imageAlt: machine.imageAlt || machine.name,
        })));
      })
      .catch(() => {
        // Keep the current public machine information visible while Firebase is empty
        // or the API is temporarily unavailable.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { data, loading };
}

function Reveal({ children, className = '', delay = 0, style }: { children: ReactNode; className?: string; delay?: number; style?: CSSProperties }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={elementRef} className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${className}`} style={{ ...style, transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Logo() {
  return (
    <a href="/" aria-label="New National Advertising home" data-testid="link-logo" className="inline-flex items-center">
      <img src="/new-national-advertising-logo.png" alt="New National Advertising" className="h-[52px] w-[94px] object-contain sm:h-[56px] sm:w-[102px]" />
    </a>
  );
}

function PrimaryButton({ href = '#contact', children = 'Get a Quote', onClick }: { href?: string; children?: ReactNode; onClick?: () => void }) {
  return (
    <a href={href} onClick={onClick} data-testid="button-primary-quote" className="button-arrow group inline-flex items-center justify-center gap-3 rounded-full bg-[#1669aa] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_7px_18px_rgba(22,105,170,.18)] transition hover:-translate-y-0.5 hover:bg-[#125b94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1669aa] focus-visible:ring-offset-2">
      {children}<ArrowRight size={15} className="transition-transform" />
    </a>
  );
}

function SecondaryButton({ href = '#services', children = 'View Services' }: { href?: string; children?: ReactNode }) {
  return (
    <a href={href} data-testid="button-secondary" className="button-arrow group inline-flex items-center justify-center gap-3 rounded-full border border-[#93b4cb] bg-white/85 px-5 py-3 text-[12px] font-semibold text-[#152a43] transition hover:-translate-y-0.5 hover:border-[#1669aa] hover:bg-[#f3f8fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1669aa] focus-visible:ring-offset-2">
      {children}<ArrowRight size={15} className="text-[#1669aa] transition-transform" />
    </a>
  );
}

function SiteHeader({ quoteHref = '/#contact' }: { quoteHref?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${scrolled ? 'border-[#dfe8ef] bg-white/95 shadow-[0_3px_18px_rgba(24,52,82,.07)] backdrop-blur-md' : 'border-transparent bg-white/88 backdrop-blur-sm'}`}>
      <div className="container-nna flex h-[70px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              data-testid={`link-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              aria-current={location === item.href || (item.label === 'Home' && location === '/') ? 'page' : undefined}
              className={`text-[12px] font-semibold tracking-[-.01em] transition hover:text-[#1669aa] ${((location === '/products' && item.label === 'Products') || (location === '/machines' && item.label === 'Machines')) ? 'text-[#1669aa]' : 'text-[#405268]'}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a href="tel:+919555759677" data-testid="link-header-phone" className="flex items-center gap-2 text-[11px] font-semibold text-[#233952]"><Phone size={13} className="text-[#1669aa]" />9555759677</a>
          <PrimaryButton href={quoteHref} />
        </div>
        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} data-testid="button-mobile-menu" className="rounded-md p-2 text-[#17314d] hover:bg-[#edf4f8] md:hidden">
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-[#e4ebf0] bg-white px-5 pb-6 pt-4 shadow-lg md:hidden">
          <nav className="container-nna flex flex-col gap-1" aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                data-testid={`link-mobile-${item.label.toLowerCase().replace(' ', '-')}`}
                aria-current={location === item.href ? 'page' : undefined}
                className={`border-b border-[#edf1f4] py-3 text-sm font-semibold ${((location === '/products' && item.label === 'Products') || (location === '/machines' && item.label === 'Machines')) ? 'text-[#1669aa]' : 'text-[#203954]'}`}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4"><PrimaryButton href={quoteHref} onClick={closeMenu} /></div>
          </nav>
        </div>
      )}
    </header>
  );
}

type ServiceRecord = typeof services[number];
type AssistantMessage = { role: 'assistant' | 'user'; text: string };
type QuoteStep = 'idle' | 'service' | 'need' | 'quantity' | 'name' | 'phone' | 'ready';
type QuoteDraft = { service: string; need: string; quantity: string; name: string; phone: string };

const emptyQuote: QuoteDraft = { service: '', need: '', quantity: '', name: '', phone: '' };

function getAssistantReply(question: string, contextService?: ServiceRecord) {
  const normalized = question.toLowerCase();
  const pricingQuestion = /\b(price|pricing|cost|rate|rates|budget|how much|quotation)\b/.test(normalized);
  if (pricingQuestion) {
    return 'Please contact New National Advertising for a current quote based on your requirements.';
  }

  const matchedService = services.find((service) =>
    normalized.includes(service.title.toLowerCase()) ||
    normalized.includes(service.slug.replaceAll('-', ' ')),
  );
  const offeringMatch = services
    .flatMap((service) => service.items.map((item) => ({ service, item })))
    .find(({ item }) => normalized.includes(item.toLowerCase()));

  if (offeringMatch) {
    return `${offeringMatch.item} is available under ${offeringMatch.service.title}. I can help you send an enquiry to New National Advertising.`;
  }
  if (normalized.includes('all printing')) {
    return 'New National Advertising offers an all printing solution for practical business, event and everyday print requirements, including visiting cards, bill books, wedding cards, pamphlets, t-shirt printing, cup printing and carry bag printing.';
  }
  if (contextService && /\b(need|require|looking|want|cards|banner|board|print|design)\b/.test(normalized)) {
    return `${contextService.title} is the current service context. I can help you send an enquiry for this requirement.`;
  }
  if (matchedService) {
    return `${matchedService.title}: ${matchedService.description} Offerings include ${matchedService.items.slice(0, 4).join(', ')} and more.`;
  }
  if (normalized.includes('service') || normalized.includes('printing') || normalized.includes('sign')) {
    return 'We offer Signage Board, Banner Printing, Eco Solvent Flex, Offset Printing, Screen Printing, Graphics Design and Digital Printing. Choose Explore Services to see the details.';
  }
  if (normalized.includes('quote') || normalized.includes('book') || normalized.includes('enquir')) {
    return 'Choose Get a Quote to share your service, requirement, quantity, name and phone number. You can then continue on WhatsApp.';
  }
  if (normalized.includes('contact') || normalized.includes('phone') || normalized.includes('call') || normalized.includes('email')) {
    return 'Call New National Advertising on +91 9555759677 or email newnationaladv2022@gmail.com. We are based in Mumbai, Maharashtra, India.';
  }
  if (normalized.includes('whatsapp')) {
    return 'You can continue a specific enquiry on WhatsApp using the green button below.';
  }
  return 'I can help with services, printing options, signage, quotes and contact details. Try asking about a specific service or choose an action below.';
}

function createQuoteWhatsAppUrl(quote: QuoteDraft, contextService?: ServiceRecord) {
  const serviceName = quote.service || contextService?.title || 'your services';
  const message = [
    'Hello New National Advertising,',
    `I am interested in ${serviceName}.`,
    '',
    `Requirement: ${quote.need || 'Please advise'}`,
    `Quantity: ${quote.quantity || 'Not specified'}`,
    `Name: ${quote.name || 'Not provided'}`,
    `Phone: ${quote.phone || 'Not provided'}`,
    '',
    'Please share the details and quotation.',
  ].join('\n');
  return `${whatsappUrl.split('?')[0]}?text=${encodeURIComponent(message)}`;
}

function FloatingContactActions({ quoteHref = '/#contact', contextService }: { quoteHref?: string; contextService?: ServiceRecord }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: 'assistant', text: 'Hello 👋\nHow can we help you today?' },
  ]);
  const [typing, setTyping] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [quoteStep, setQuoteStep] = useState<QuoteStep>('idle');
  const [quoteDraft, setQuoteDraft] = useState<QuoteDraft>(() => ({ ...emptyQuote, service: contextService?.title ?? '' }));
  const [quoteInput, setQuoteInput] = useState('');
  const reduceMotion = useReducedMotion();
  const typingTimer = useRef<number | undefined>(undefined);

  const dismissHint = () => {
    setHintVisible(false);
    try {
      window.localStorage.setItem('nna-assistant-hint-dismissed', '1');
    } catch {
      // Private browsing may block localStorage; the in-session dismissal still works.
    }
  };

  useEffect(() => {
    try {
      if (window.localStorage.getItem('nna-assistant-hint-dismissed')) return;
    } catch {
      // Continue with the timed hint when storage is unavailable.
    }
    const timer = window.setTimeout(() => setHintVisible(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const openAssistant = () => {
    dismissHint();
    setOpen(true);
  };

  const addAssistantReply = (text: string) => {
    setMessages((current) => [...current, { role: 'assistant', text }]);
  };

  const askPreset = (label: string, question: string) => {
    setMessages((current) => [...current, { role: 'user', text: label }, { role: 'assistant', text: getAssistantReply(question, contextService) }]);
  };

  const askAssistant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question || typing) return;
    setMessages((current) => [...current, { role: 'user', text: question }]);
    setDraft('');
    setTyping(true);
    typingTimer.current = window.setTimeout(() => {
      addAssistantReply(getAssistantReply(question, contextService));
      setTyping(false);
    }, 420);
  };

  const startQuoteFlow = () => {
    openAssistant();
    setQuoteDraft({ ...emptyQuote, service: contextService?.title ?? '' });
    setQuoteStep('service');
    addAssistantReply('What service do you need?');
  };

  const chooseQuoteService = (serviceName: string) => {
    setQuoteDraft((current) => ({ ...current, service: serviceName }));
    setQuoteStep('need');
    setMessages((current) => [...current, { role: 'user', text: serviceName }, { role: 'assistant', text: 'What do you need?' }]);
  };

  const submitQuoteField = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = quoteInput.trim();
    if (!value) return;
    const fieldMap: Record<'need' | 'quantity' | 'name' | 'phone', string> = {
      need: 'need',
      quantity: 'quantity',
      name: 'name',
      phone: 'phone',
    };
    const field = fieldMap[quoteStep as keyof typeof fieldMap];
    if (!field) return;
    const prompts: Record<typeof field, { next: QuoteStep; prompt: string }> = {
      need: { next: 'quantity', prompt: 'Approximately how many?' },
      quantity: { next: 'name', prompt: 'Your name?' },
      name: { next: 'phone', prompt: 'Your phone number?' },
      phone: { next: 'ready', prompt: 'Your enquiry is ready. Choose Send Enquiry, Continue on WhatsApp, or Call New National.' },
    };
    const next = prompts[field];
    setQuoteDraft((current) => ({ ...current, [field]: value }));
    setMessages((current) => [...current, { role: 'user', text: value }, { role: 'assistant', text: next.prompt }]);
    setQuoteInput('');
    setQuoteStep(next.next);
  };

  const sendQuoteToWhatsApp = () => {
    window.open(createQuoteWhatsAppUrl(quoteDraft, contextService), '_blank', 'noopener,noreferrer');
  };

  const serviceOptions = contextService
    ? [contextService.title, ...services.filter((service) => service.slug !== contextService.slug).map((service) => service.title), 'Other']
    : [...services.map((service) => service.title), 'Other'];

  return (
    <div className="fixed bottom-[76px] right-4 z-[60] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {hintVisible && !open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : .22 }}
          className="w-[260px] rounded-[12px] border border-[#dce6eb] bg-white p-3 shadow-[0_14px_35px_rgba(20,51,78,.14)]"
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold leading-4 text-[#263e57]">Need help choosing a service?</p>
            <button type="button" onClick={dismissHint} aria-label="Dismiss assistant suggestion" className="rounded-full p-0.5 text-[#93a1ac] transition hover:bg-[#edf4f8] hover:text-[#203950]"><X size={13} /></button>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={openAssistant} className="rounded-full bg-[#1669aa] px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#125b94]">Ask AI</button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={dismissHint} className="rounded-full border border-[#b8d9ca] px-3 py-1.5 text-[10px] font-bold text-[#24734d] transition hover:bg-[#f0faf4]">WhatsApp</a>
          </div>
        </motion.div>
      )}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: .98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : .24 }}
          className="w-[390px] max-w-[calc(100vw-24px)] overflow-hidden rounded-t-[18px] rounded-b-[16px] border border-[#dce6eb] bg-white shadow-[0_18px_50px_rgba(20,51,78,.18)] md:max-h-[calc(100dvh-96px)]"
          role="dialog"
          aria-modal="false"
          aria-label="New National Assistant"
        >
          <div className="bg-[#102941] px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#b9d9ed]"><Bot size={15} /></span>
                <div>
                  <p className="display text-[17px] font-extrabold tracking-[-.03em]">New National Assistant</p>
                  <p className="mt-1 text-[11px] text-[#b8cbd8]">Your guide to printing, signage &amp; design.</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1.5 text-[#c5d5df] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"><X size={16} /></button>
            </div>
          </div>
          <div className="max-h-[min(360px,calc(100dvh-360px))] space-y-3 overflow-y-auto bg-[#f7fafb] px-4 py-4 sm:max-h-[360px]" aria-live="polite">
            {messages.map((message, index) => (
              <motion.div key={`${message.role}-${index}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .18 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[88%] whitespace-pre-line rounded-[10px] px-3 py-2 text-[11px] leading-5 ${message.role === 'user' ? 'bg-[#1669aa] text-white' : 'border border-[#e1e9ee] bg-white text-[#53687a]'}`}>{message.text}</p>
              </motion.div>
            ))}
            {typing && <div className="flex justify-start"><div className="flex items-center gap-1 rounded-[10px] border border-[#e1e9ee] bg-white px-3 py-2" aria-label="Assistant is typing"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8fa7b7]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8fa7b7] [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8fa7b7] [animation-delay:240ms]" /></div></div>}
          </div>
          <div className="border-t border-[#e4ebef] bg-white px-4 py-3">
            {quoteStep === 'idle' && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <a href="/#services" onClick={() => setOpen(false)} className="rounded-full border border-[#d8e4ea] px-2 py-2 text-center text-[10px] font-bold text-[#31516a] transition hover:border-[#1669aa] hover:bg-[#f3f8fb] hover:text-[#1669aa]">🖨️ Explore Services</a>
                <button type="button" onClick={startQuoteFlow} className="rounded-full border border-[#d8e4ea] px-2 py-2 text-center text-[10px] font-bold text-[#31516a] transition hover:border-[#1669aa] hover:bg-[#f3f8fb] hover:text-[#1669aa]">📋 Get a Quote</button>
                <button type="button" onClick={() => askPreset('Signage Board', 'Tell me about Signage Board')} className="rounded-full border border-[#d8e4ea] px-2 py-2 text-center text-[10px] font-bold text-[#31516a] transition hover:border-[#1669aa] hover:bg-[#f3f8fb] hover:text-[#1669aa]">🏪 Signage Board</button>
                <button type="button" onClick={() => askPreset('Digital Printing', 'Tell me about Digital Printing')} className="rounded-full border border-[#d8e4ea] px-2 py-2 text-center text-[10px] font-bold text-[#31516a] transition hover:border-[#1669aa] hover:bg-[#f3f8fb] hover:text-[#1669aa]">🖨️ Digital Printing</button>
                <button type="button" onClick={() => askPreset('Graphics Design', 'Tell me about Graphics Design')} className="rounded-full border border-[#d8e4ea] px-2 py-2 text-center text-[10px] font-bold text-[#31516a] transition hover:border-[#1669aa] hover:bg-[#f3f8fb] hover:text-[#1669aa]">🎨 Graphics Design</button>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="rounded-full border border-[#b8d9ca] px-2 py-2 text-center text-[10px] font-bold text-[#24734d] transition hover:bg-[#f0faf4]">💬 Talk on WhatsApp</a>
              </div>
            )}
            {quoteStep === 'service' && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {serviceOptions.map((serviceName) => <button key={serviceName} type="button" onClick={() => chooseQuoteService(serviceName)} className="rounded-full border border-[#d8e4ea] px-2 py-2 text-[10px] font-bold text-[#31516a] transition hover:border-[#1669aa] hover:bg-[#f3f8fb] hover:text-[#1669aa]">{serviceName}</button>)}
              </div>
            )}
            {quoteStep !== 'idle' && quoteStep !== 'service' && quoteStep !== 'ready' && (
              <form onSubmit={submitQuoteField} className="mb-3 flex items-center gap-2">
                <input autoFocus value={quoteInput} onChange={(event) => setQuoteInput(event.target.value)} type={quoteStep === 'phone' ? 'tel' : 'text'} aria-label={`Quote ${quoteStep}`} placeholder={quoteStep === 'need' ? 'e.g. 100 visiting cards' : quoteStep === 'quantity' ? 'e.g. 100' : quoteStep === 'name' ? 'Your name' : 'Your phone number'} className="min-w-0 flex-1 rounded-full border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2 text-[11px] text-[#203950] outline-none placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" />
                <button type="submit" aria-label="Continue quote flow" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1669aa] text-white transition hover:bg-[#125b94]"><Send size={13} /></button>
              </form>
            )}
            {quoteStep === 'ready' && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={sendQuoteToWhatsApp} className="rounded-full bg-[#1669aa] px-2 py-2 text-[10px] font-bold text-white transition hover:bg-[#125b94]">SEND ENQUIRY</button>
                <button type="button" onClick={sendQuoteToWhatsApp} className="rounded-full bg-[#2c9b70] px-2 py-2 text-[10px] font-bold text-white transition hover:bg-[#23845f]">Continue on WhatsApp</button>
                <a href="tel:+919555759677" className="col-span-2 rounded-full border border-[#d8e4ea] px-2 py-2 text-center text-[10px] font-bold text-[#31516a] transition hover:border-[#1669aa] hover:bg-[#f3f8fb]">Call New National</a>
              </div>
            )}
            <form onSubmit={askAssistant} className="flex items-center gap-2">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Ask the assistant" placeholder="Ask about a service..." className="min-w-0 flex-1 rounded-full border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2 text-[11px] text-[#203950] outline-none placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" />
              <button type="submit" aria-label="Send question" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1669aa] text-white transition hover:bg-[#125b94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1669aa] focus-visible:ring-offset-2"><Send size={13} /></button>
            </form>
            <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
              {quoteStep === 'idle' && <button type="button" onClick={startQuoteFlow} className="font-bold text-[#1669aa] hover:underline">Get a Quote</button>}
              {quoteStep !== 'idle' && <button type="button" onClick={startQuoteFlow} className="font-bold text-[#1669aa] hover:underline">Restart quote</button>}
              <div className="flex items-center gap-3">
                <a href={quoteStep === 'ready' ? createQuoteWhatsAppUrl(quoteDraft, contextService) : whatsappUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="font-bold text-[#24734d] hover:underline">Continue on WhatsApp</a>
                <a href="tel:+919555759677" className="font-semibold text-[#5e7182] hover:text-[#1669aa]">Call New National</a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <div className="flex flex-col gap-3">
        <div className="group relative">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" data-testid="floating-whatsapp" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2c9b70] text-white shadow-[0_8px_22px_rgba(44,155,112,.28)] transition hover:-translate-y-0.5 hover:bg-[#23845f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c9b70] focus-visible:ring-offset-2">
            <MessageCircle size={19} />
          </a>
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#102941] px-3 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">Chat on WhatsApp</span>
        </div>
        <div className="group relative">
          <button type="button" onClick={open ? () => setOpen(false) : openAssistant} aria-label={open ? 'Close New National AI' : 'Ask New National AI'} aria-expanded={open} data-testid="floating-ai-chat" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1669aa] text-white shadow-[0_8px_22px_rgba(22,105,170,.28)] transition hover:-translate-y-0.5 hover:bg-[#125b94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1669aa] focus-visible:ring-offset-2">
            {open ? <X size={19} /> : <Bot size={19} />}
          </button>
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#102941] px-3 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">Ask New National AI</span>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = [
      'Hello New National Advertising, I would like to enquire about your services.',
      '',
      `Name: ${formData.get('name') ?? ''}`,
      `Phone: ${formData.get('phone') ?? ''}`,
      `Email: ${formData.get('email') ?? ''}`,
      `Service: ${formData.get('service') ?? ''}`,
      `Project details: ${formData.get('details') ?? ''}`,
      `Quantity: ${formData.get('quantity') || 'Not specified'}`,
      `Uploaded file: ${(formData.get('file') as File)?.name || 'None'}`,
    ].join('\n');
    window.open(`${whatsappUrl.split('?')[0]}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="site-noise min-h-[100dvh] overflow-x-hidden bg-[#fbfcfd] text-[#122641]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'New National Advertising',
        description: 'Printing, advertising, signage and graphic design solutions.',
         address: {
           '@type': 'PostalAddress',
           streetAddress: 'Room No. 3, New National Advertising, Plot No. 47, Line No. K, Road No. 5, Opposite Mahesh Jewellers, Nearby Ambedkar Garden, Raman Mama Nagar, Shivaji Nagar',
           addressLocality: 'Govandi West, Mumbai',
           addressRegion: 'Maharashtra',
           postalCode: '400043',
           addressCountry: 'IN',
         },
         hasMap: googleMapsUrl,
        telephone: '+919555759677',
        email: 'newnationaladv2022@gmail.com',
        areaServed: 'Mumbai, Maharashtra, India',
        makesOffer: services.map((service) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: service.title, description: service.description } })),
      }) }} />

      <SiteHeader />

      <main>
       <section id="home" className="relative isolate overflow-hidden border-b border-[#edf1f4] bg-[#f7f8fa] pt-[70px]">
          <div className="pointer-events-none absolute -left-28 top-[-130px] -z-10 h-[530px] w-[600px] rounded-full border border-[#dce9f0] bg-white/35" />
          <div className="pointer-events-none absolute right-[-180px] top-[28px] -z-10 h-[470px] w-[650px] rounded-[50%] border border-[#e1edf3] bg-[#eaf3f7]/70" />
          <div className="container-nna grid min-h-[580px] items-center gap-9 py-14 lg:grid-cols-[.89fr_1.11fr] lg:gap-4 lg:py-16">
             <Reveal className="relative z-10 max-w-[520px]">
               <p className="eyebrow mb-5">Print · Design · Signage · Advertising</p>
               <h1 className="display max-w-[530px] text-[clamp(2.7rem,5.7vw,5.4rem)] font-extrabold leading-[.93] text-[#14213d]">New National<br /><span className="text-[#1769aa]">Advertising</span></h1>
               <div className="mt-4 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.2em] text-[#81909d]"><span className="h-px w-9 bg-[#00a8c6]" /><span className="h-px w-5 bg-[#d9468c]" /><span className="h-px w-3 bg-[#f2c94c]" />Mumbai print studio</div>
              <p className="mt-6 text-lg font-semibold tracking-[-.02em] text-[#253b53]">Printing, Signage &amp; Design Solutions</p>
              <p className="mt-3 max-w-[430px] text-[13px] leading-6 text-[#657589]">Professional printing, advertising, signage and graphic design solutions for businesses, brands and individuals.</p>
              <div className="mt-7 flex flex-wrap gap-3"><PrimaryButton /><SecondaryButton /></div>
              <div className="mt-11 grid max-w-[480px] grid-cols-3 gap-3 border-t border-[#d7e3ea] pt-5">
                {[['Wide Range of Services', 'All your printing needs', Grid2X2], ['Quality Printing', 'Clear & vibrant results', CircleCheck], ['Reliable Service', 'Professional service', ShieldCheck]].map(([title, copy, Icon]) => (
                  <div key={title as string} className="flex gap-2"><Icon size={16} className="mt-0.5 shrink-0 text-[#2479b2]" /><div><p className="text-[10px] font-semibold leading-3 text-[#263d55]">{title as string}</p><p className="mt-1 text-[9px] leading-3 text-[#7a8997]">{copy as string}</p></div></div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120} className="relative mx-auto w-full max-w-[640px] lg:ml-auto">
                <div className="relative aspect-[1983/793] overflow-hidden rounded-[18px] shadow-[0_20px_55px_rgba(36,67,94,.17)]">
                 <img src="/hero-new-national-advertising.png" alt="New National Advertising storefront, printing services and signage display" className="h-full w-full object-contain" />
              </div>
               <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-[#dce8ee] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(31,61,87,.1)] sm:block">
                 <span className="crop-corner crop-corner--tl text-[#1769aa]" /><span className="crop-corner crop-corner--br text-[#1769aa]" />
                <p className="eyebrow text-[8px]">Made in Mumbai</p><p className="mt-1 text-[11px] font-semibold text-[#213951]">From ideas to impact.</p>
                 <div className="ink-strip mt-2 w-16"><span /><span /><span /><span /></div>
              </div>
            </Reveal>
          </div>
        </section>

         <section id="services" className="bg-white py-20 lg:py-24">
          <div className="container-nna">
            <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="eyebrow">What we do</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[40px]">Our Services</h2></div>
               <div className="flex items-end gap-5"><p className="max-w-[330px] text-[12px] leading-5 text-[#718092]">From business cards to large-format signage, we provide an all printing solution for practical business and event needs.</p><a href="#contact" data-testid="link-view-all-services" className="arrow-link hidden shrink-0 items-center gap-1 text-[11px] font-bold text-[#1669aa] sm:flex">View All Services <ArrowRight size={14} /></a></div>
            </Reveal>
             <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => { const Icon = service.icon; return (
                  <Reveal key={service.title} delay={index * 55} className="service-card group overflow-hidden rounded-[10px] border border-[#e2e9ee] bg-white" style={{ '--service-accent': service.accent, '--service-tint': service.tint } as CSSProperties}>
                    <Link href={`/services/${service.slug}`} data-testid={`link-service-${service.slug}`} className="block h-full">
                      <div className="relative h-[150px] overflow-hidden bg-[#e4edf1]"><img src={service.image} alt={service.imageAlt} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-[#102941]/10" /><div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 service-icon"><Icon size={15} /></div><span className="absolute bottom-0 left-4 h-1 w-12 rounded-full bg-[var(--service-accent)]" /></div>
                      <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="display text-[17px] font-extrabold text-[#162d47]">{service.title}</h3><span className="service-arrow flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition group-hover:bg-[var(--service-accent)] group-hover:text-white"><ArrowDownRight size={14} /></span></div><p className="mt-2 text-[11px] leading-5 text-[#6d7d8e]">{service.description}</p><p className="mt-4 border-t border-[#edf1f3] pt-3 text-[10px] font-semibold leading-4 text-[#93a0ac]">{service.items.slice(0, 3).join(' · ')}</p><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--service-accent)]">More Info <ArrowRight size={12} /></span></div>
                    </Link>
                 </Reveal>
               ); })}
             </div>
            <div className="mt-5 rounded-[10px] border border-[#e2e9ee] bg-[#f8fafb] px-5 py-4 text-center text-[11px] text-[#647487]"><span className="font-bold text-[#263e57]">Other Services</span><span className="mx-2 text-[#b7c4cc]">/</span>Sunboard / Sunpack · PVC Cards · Resume / Bio-Data · Wooden / MS Frames</div>
          </div>
        </section>

        <section className="bg-[#f2f6f8] py-16 lg:py-20">
          <div className="container-nna">
            <Reveal><p className="eyebrow">Why choose us</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[39px]">Quality in Every Print</h2></Reveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
               {[['Quality Printing', 'Clear & vibrant results', CircleCheck, '#1769AA', '#F1F7FC'], ['Wide Range of Services', 'All your printing needs', Grid2X2, '#00A8C6', '#F0FBFC'], ['Custom Solutions', 'Tailored for your requirements', PenLine, '#3BA776', '#F1FAF5'], ['Reliable Service', 'Professional service', Clock3, '#F2994A', '#FFF7EF']].map(([title, copy, Icon, accent, tint], index) => (
                 <Reveal key={title as string} delay={index * 60} className="flex items-start gap-3 rounded-[8px] border border-[#e0e8ed] bg-white px-4 py-4 shadow-[0_5px_16px_rgba(31,61,87,.035)]"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: tint as string, color: accent as string }}><Icon size={16} /></div><div><h3 className="text-[11px] font-bold text-[#243b54]">{title as string}</h3><p className="mt-1 text-[10px] text-[#84919e]">{copy as string}</p></div></Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-white py-20 lg:py-24">
          <div className="container-nna grid items-center gap-10 lg:grid-cols-[.74fr_1.26fr] lg:gap-20">
             <Reveal><p className="eyebrow">About us</p><h2 className="display mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[48px]">New National<br />Advertising</h2><p className="mt-5 max-w-[360px] text-[13px] leading-6 text-[#68798a]">New National Advertising provides printing, signage, advertising and graphic design solutions for businesses, brands and individuals.</p><a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex max-w-[360px] items-start gap-2 text-[11px] font-semibold leading-5 text-[#405268] hover:text-[#1669aa]" data-testid="link-about-address"><MapPin size={14} className="mt-0.5 shrink-0 text-[#1669aa]" /><span>Room No. 3, New National Advertising, Govandi West, Mumbai - 400043 <span className="text-[#1669aa]">View on Google Maps</span></span></a><a href="#contact" data-testid="link-more-about" className="arrow-link mt-6 inline-flex items-center gap-2 rounded-full border border-[#99b8cb] px-4 py-2.5 text-[11px] font-semibold text-[#213c57]">More About Us <ArrowRight size={14} className="text-[#1669aa]" /></a></Reveal>
            <Reveal delay={110} className="grid grid-cols-[1.3fr_1fr_.75fr] gap-2 sm:gap-3">
              <div className="col-span-2 h-[190px] overflow-hidden rounded-[9px] sm:h-[250px]"><img src="/design-materials.jpg" alt="Printed design materials on a studio table" className="h-full w-full object-cover" /></div>
              <div className="relative h-[190px] overflow-hidden rounded-[9px] sm:h-[250px]"><img src="/new-national-advertising-shop.png" alt="Printing solutions displayed at New National Advertising" className="h-full w-full object-cover object-center" /><span className="absolute inset-x-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-center text-[8px] font-bold text-[#263e57] shadow-sm">Printing solutions displayed at our shop</span></div>
              <div className="col-span-2 h-[100px] overflow-hidden rounded-[9px] sm:h-[120px]"><img src="/signage-installation.jpg" alt="Professional signage installation" className="h-full w-full object-cover object-center" /></div>
              <div className="flex h-[100px] flex-col justify-center rounded-[9px] bg-[#eef3f6] px-4 sm:h-[120px] sm:px-5"><p className="display text-[17px] font-bold leading-[1.05] text-[#273b51]">From ideas<br />to impact</p><span className="mt-3 h-px w-8 bg-[#1669aa]" /></div>
            </Reveal>
          </div>
        </section>

         <section id="work" className="bg-[#f7f8fa] py-20 lg:py-24">
          <div className="container-nna">
            <Reveal className="flex items-end justify-between gap-4"><div><p className="eyebrow">Our work</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[39px]">Selected Work</h2></div><p className="hidden text-[11px] text-[#7b8998] sm:block">A glimpse of what we create.</p></Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
               {work.map((item, index) => (
                 <Reveal key={item.title} delay={index * 45} className={`work-card group relative overflow-hidden rounded-[8px] border border-[#e1e7eb] bg-[#dae5eb] ${index === 0 ? 'md:row-span-2' : ''} ${index === 3 ? 'md:col-span-1' : ''}`} style={{ '--service-accent': item.accent } as CSSProperties}>
                   <div className={`relative ${index === 0 ? 'h-[250px] md:h-full' : 'h-[170px] md:h-[190px]'}`}><img src={index === 0 ? '/signage-installation.jpg' : index === 1 ? '/design-materials.jpg' : index === 2 ? '/hero-print-studio.jpg' : '/selected-work-grid.jpg'} alt={`${item.title} selected work`} className="h-full w-full object-cover" style={{ objectPosition: item.position }} /><div className="absolute inset-0 bg-gradient-to-t from-[#0d2238]/75 via-transparent to-transparent opacity-80" /><div className="absolute inset-x-0 bottom-0 p-4 text-white"><div className="flex items-end justify-between gap-2"><div><p className="text-[9px] font-medium uppercase tracking-[.14em]" style={{ color: item.accent }}>{item.category}</p><h3 className="mt-1 text-[13px] font-semibold">{item.title}</h3></div><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1769aa] transition group-hover:translate-x-1"><ArrowRight size={13} /></span></div></div></div>
                </Reveal>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-[#8b98a4]">Selected Work — representative printing, signage and design mockups.</p>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container-nna grid items-center gap-8 lg:grid-cols-[.78fr_1.22fr] lg:gap-14">
            <Reveal>
              <p className="eyebrow">The print studio</p>
              <h2 className="display mt-2 max-w-[380px] text-3xl font-extrabold leading-[.98] tracking-[-.05em] text-[#14213d] sm:text-[43px]">COLOR THAT<br /><span className="text-[#1769aa]">BRINGS IDEAS TO LIFE.</span></h2>
              <p className="mt-4 max-w-[350px] text-[12px] leading-6 text-[#68798a]">From the first proof to the final trim, we keep every color, edge and finish working for your brand.</p>
              <div className="mt-6 flex items-center gap-3"><div className="ink-strip w-28"><span /><span /><span /><span /></div><span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#7d8c99]">C · M · Y · K</span></div>
            </Reveal>
            <Reveal delay={100} className="relative">
              <div className="print-story-card relative overflow-hidden rounded-[12px] border border-[#e3e8eb] p-5 sm:p-7">
                <span className="crop-corner crop-corner--tl text-[#00a8c6]" /><span className="crop-corner crop-corner--br text-[#d9468c]" />
                <div className="relative z-10 grid gap-4 sm:grid-cols-[.78fr_1.22fr]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="swatch-cmyk h-24 rounded-[5px] bg-[#00a8c6] p-2 text-[9px] font-bold text-white">C / 01</div>
                    <div className="swatch-cmyk mt-4 h-24 rounded-[5px] bg-[#d9468c] p-2 text-[9px] font-bold text-white">M / 02</div>
                    <div className="swatch-cmyk -mt-2 h-24 rounded-[5px] bg-[#f2c94c] p-2 text-[9px] font-bold text-[#14213d]">Y / 03</div>
                    <div className="swatch-cmyk mt-2 h-24 rounded-[5px] bg-[#14213d] p-2 text-[9px] font-bold text-white">K / 04</div>
                  </div>
                  <div className="relative min-h-[205px] rounded-[6px] bg-[#f7f8fa] p-4">
                    <div className="absolute right-4 top-4 h-16 w-12 rotate-6 rounded-sm bg-white shadow-[0_5px_14px_rgba(20,33,61,.12)]"><span className="absolute left-2 top-3 h-2 w-8 bg-[#f2994a]" /><span className="absolute left-2 top-8 h-1.5 w-6 bg-[#00a8c6]" /><span className="absolute left-2 top-11 h-1.5 w-8 bg-[#14213d]" /></div>
                    <div className="absolute bottom-5 left-5 w-[68%] -rotate-3 rounded-sm bg-white p-4 shadow-[0_6px_15px_rgba(20,33,61,.13)]"><div className="ink-strip w-full"><span /><span /><span /><span /></div><p className="display mt-5 text-[22px] font-extrabold leading-none text-[#14213d]">Ideas<br /><span className="text-[#1769aa]">in print.</span></p><p className="mt-3 text-[8px] font-bold uppercase tracking-[.16em] text-[#8a969f]">paper / proof / finish</p></div>
                    <div className="absolute bottom-4 right-4 rounded-sm border border-[#dfe6e9] bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[.14em] text-[#1769aa]">Printed sample</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="container-nna">
            <Reveal className="text-center"><p className="eyebrow">Our process</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[39px]">From Idea to Impact</h2></Reveal>
            <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              <div className="absolute left-[12%] right-[12%] top-6 hidden h-px bg-[#dce7ed] lg:block" />
               {process.map((step, index) => { const Icon = step.icon; return <Reveal key={step.number} delay={index * 70} className="relative flex gap-4 lg:block lg:text-center"><div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-white lg:mx-auto" style={{ borderColor: `${step.accent}55`, color: step.accent }}><Icon size={18} /></div><div className="lg:mt-4"><p className="text-[10px] font-bold tracking-[.15em]" style={{ color: step.accent }}>{step.number}</p><h3 className="mt-1 text-[13px] font-bold uppercase text-[#223b55]">{step.title}</h3><p className="mt-1 text-[11px] text-[#8a98a4]">{step.copy}</p></div></Reveal>; })}
            </div>
          </div>
        </section>

         <section className="overflow-hidden bg-[#f3f7f8] py-20 lg:py-24">
          <div className="container-nna grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <Reveal><p className="eyebrow">Built for your brand</p><h2 className="display mt-3 max-w-[440px] text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[50px]">Design that supports your brand.</h2><p className="mt-5 max-w-[390px] text-[13px] leading-6 text-[#68798a]">From a first logo to the final printed piece, every detail has a job to do.</p><a href="#contact" data-testid="link-design-enquiry" className="arrow-link mt-6 inline-flex items-center gap-2 text-[11px] font-bold text-[#1669aa]">Start a design conversation <ArrowRight size={14} /></a></Reveal>
             <Reveal delay={100} className="relative min-h-[275px]"><div className="absolute left-0 top-7 h-[170px] w-[62%] overflow-hidden rounded-[9px] border-8 border-white bg-white shadow-[0_14px_30px_rgba(35,68,95,.13)] sm:h-[215px]"><img src="/design-materials.jpg" alt="Graphic design and brand materials" className="h-full w-full object-cover" /></div><div className="absolute right-0 top-0 w-[42%] rounded-[9px] border border-[#dae7ed] bg-white p-4 shadow-[0_12px_26px_rgba(35,68,95,.09)] sm:p-5"><div className="flex items-center justify-between"><span className="display text-[18px] font-extrabold tracking-[-.07em] text-[#152e49]">N</span><span className="text-[8px] font-bold tracking-[.18em] text-[#3ba776]">BRAND KIT</span></div><div className="mt-8 grid grid-cols-3 gap-1.5"><div className="h-7 rounded bg-[#14213d]" /><div className="h-7 rounded bg-[#d9468c]" /><div className="h-7 rounded bg-[#f2c94c]" /></div><p className="mt-3 text-[10px] font-semibold text-[#30465d]">Logo · Packaging<br />Brochure · Menu</p></div><div className="absolute bottom-1 right-[12%] rounded-[9px] bg-[#1769aa] px-4 py-3 text-white shadow-[0_10px_23px_rgba(22,105,170,.18)]"><p className="text-[9px] font-bold tracking-[.14em]">IDEAS</p><p className="mt-1 text-[16px] font-bold">In print.</p></div><div className="absolute bottom-0 left-[23%] flex gap-1 rounded-full border border-white bg-white/90 p-1 shadow-[0_6px_15px_rgba(20,33,61,.1)]"><span className="h-3 w-3 rounded-full bg-[#00a8c6]" /><span className="h-3 w-3 rounded-full bg-[#d9468c]" /><span className="h-3 w-3 rounded-full bg-[#f2994a]" /><span className="h-3 w-3 rounded-full bg-[#3ba776]" /></div></Reveal>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="container-nna grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
             <Reveal className="order-2 overflow-hidden rounded-[12px] lg:order-1"><div className="relative"><img src="/signage-installation.jpg" alt="Acrylic and illuminated signage installation" className="h-[280px] w-full object-cover sm:h-[350px]" /><div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-[8px] font-bold uppercase tracking-[.15em] text-[#14213d] shadow-[0_5px_14px_rgba(20,33,61,.12)]"><span className="h-2 w-2 rounded-full bg-[#f2c94c]" /><span className="h-2 w-2 rounded-full bg-[#f26b5b]" /><span className="h-2 w-2 rounded-full bg-[#00a8c6]" />Signage / daylight / night</div></div></Reveal>
             <Reveal delay={100} className="order-1 lg:order-2"><p className="eyebrow">Signage solutions</p><h2 className="display mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[48px]">Make Your Brand Stand Out</h2><p className="mt-5 max-w-[390px] text-[13px] leading-6 text-[#68798a]">Professional signage designed to be seen clearly, day and night — from first sketch to final installation.</p><div className="mt-7 grid max-w-[380px] grid-cols-2 gap-x-7 gap-y-3 text-[11px] font-semibold text-[#354b61]">{['Acrylic', 'LED', 'Crystal Letters', 'Steel & Brass Letters', 'Pixel LED', 'Backlit Signage', 'Standee', 'Sandwich'].map((item, index) => <div key={item} className="flex items-center gap-2"><Check size={13} style={{ color: ['#00A8C6', '#F2C94C', '#D9468C', '#1769AA'][index % 4] }} />{item}</div>)}</div></Reveal>
          </div>
        </section>

        <section id="contact" className="bg-[#f1f6f8] py-20 lg:py-24">
          <div className="container-nna grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
             <Reveal><p className="eyebrow">Let's work together</p><h2 className="display mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[50px]">Get a Quote</h2><p className="mt-5 max-w-[330px] text-[13px] leading-6 text-[#68798a]">Have a printing, signage or design requirement? Get in touch with New National Advertising.</p><div className="mt-8 space-y-4 text-[12px] text-[#405268]"><a href="tel:+919555759677" data-testid="link-contact-primary" className="flex items-center gap-3 hover:text-[#1669aa]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><Phone size={14} /></span><span><strong className="block text-[#223b55]">9555759677</strong><span className="text-[10px] text-[#81909d]">Primary phone</span></span></a><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><Phone size={14} /></span><span>7506269783 &nbsp; / &nbsp; 8898805753</span></div><a href="mailto:newnationaladv2022@gmail.com" data-testid="link-contact-email" className="flex items-center gap-3 hover:text-[#1669aa]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><Mail size={14} /></span>{'newnationaladv2022@gmail.com'}</a><address className="not-italic"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><MapPin size={14} /></span><span className="leading-5">{businessAddressLines.map((line) => <span key={line} className="block">{line}</span>)}<a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-[#1669aa] hover:underline" data-testid="link-contact-map">View on Google Maps</a></span></div></address></div><div className="mt-7 flex flex-wrap gap-2"><a href={whatsappUrl} target="_blank" rel="noreferrer" data-testid="button-whatsapp" className="inline-flex items-center gap-2 rounded-full bg-[#2c9b70] px-4 py-2.5 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#23845f]"><MessageCircle size={14} />Chat on WhatsApp <ArrowRight size={12} /></a><a href="tel:+919555759677" data-testid="button-call-now" className="inline-flex items-center gap-2 rounded-full border border-[#9bb9ca] bg-white px-4 py-2.5 text-[10px] font-bold text-[#25425c] transition hover:-translate-y-0.5 hover:border-[#1669aa]"><Phone size={14} className="text-[#1669aa]" />Call Now</a><a href="mailto:newnationaladv2022@gmail.com" data-testid="button-email-us" className="inline-flex items-center gap-2 rounded-full border border-[#9bb9ca] bg-white px-4 py-2.5 text-[10px] font-bold text-[#25425c] transition hover:-translate-y-0.5 hover:border-[#1669aa]"><Mail size={14} className="text-[#1669aa]" />Email Us</a></div></Reveal>
            <Reveal delay={100}><form onSubmit={handleSubmit} className="rounded-[12px] border border-[#dce6eb] bg-white p-5 shadow-[0_10px_30px_rgba(31,61,87,.06)] sm:p-7" aria-label="Request a quote form"><div className="grid gap-4 sm:grid-cols-2"><label className="text-[10px] font-bold text-[#445a70]">Name<input required name="name" placeholder="Your name" data-testid="input-name" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Phone Number<input required name="phone" type="tel" placeholder="Your phone number" data-testid="input-phone" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Email<input required name="email" type="email" placeholder="Your email" data-testid="input-email" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Service<select required name="service" defaultValue="" data-testid="select-service" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none focus:border-[#1669aa]"><option value="" disabled>Select a service</option>{services.map((service) => <option key={service.title}>{service.title}</option>)}<option>Other Services</option></select></label><label className="text-[10px] font-bold text-[#445a70] sm:col-span-2">Project Details<textarea required name="details" rows={3} placeholder="Tell us about your requirement..." data-testid="textarea-details" className="mt-1.5 w-full resize-none rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Quantity<input name="quantity" placeholder="e.g. 100" data-testid="input-quantity" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Upload File (Optional)<span className="mt-1.5 flex w-full cursor-pointer items-center rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-[9px] text-[11px] font-normal text-[#8d9aa5]"><input type="file" name="file" data-testid="input-file" className="w-full text-[10px]" /></span></label></div><button type="submit" data-testid="button-submit-quote" className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#1669aa] py-3 text-[11px] font-bold text-white transition hover:bg-[#125b94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1669aa] focus-visible:ring-offset-2">{submitted ? 'Request received — we will be in touch' : 'Request a Quote'}<ArrowRight size={14} /></button>{submitted && <p role="status" data-testid="status-quote-submitted" className="mt-3 text-center text-[11px] font-semibold text-[#24734d]">Thank you. Please also use WhatsApp for the fastest response.</p>}</form></Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#102941] pb-24 text-white md:pb-0">
        <div className="container-nna grid gap-10 py-12 md:grid-cols-[1.35fr_1fr_1fr] md:py-14">
           <div><Logo /><p className="mt-5 max-w-[250px] text-[10px] leading-5 text-[#a8bbca]">PRINT · DESIGN · SIGNAGE · ADVERTISING</p></div>
          <div><p className="eyebrow text-[#7fb5d4]">Explore</p><nav className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-[11px] text-[#c1ced8]">{navigationItems.map((item) => <a key={item.label} href={item.href} data-testid={`link-footer-${item.label.toLowerCase().replace(' ', '-')}`} className="hover:text-white">{item.label}</a>)}</nav></div>
           <div><p className="eyebrow text-[#7fb5d4]">Contact</p><div className="mt-4 space-y-3 text-[11px] leading-5 text-[#c1ced8]"><a href="tel:+919555759677" data-testid="link-footer-phone" className="block hover:text-white">9555759677</a><a href="mailto:newnationaladv2022@gmail.com" data-testid="link-footer-email" className="block break-all hover:text-white">newnationaladv2022@gmail.com</a><address className="not-italic">{businessAddressLines.map((line) => <span key={line} className="block">{line}</span>)}<a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-[#9bc8d8] hover:text-white" data-testid="link-footer-map">View on Google Maps</a></address></div></div>
        </div>
        <div className="border-t border-white/10"><div className="container-nna flex flex-col gap-2 py-5 text-[10px] text-[#8da5b7] sm:flex-row sm:items-center sm:justify-between"><span>© New National Advertising. All rights reserved.</span><span>Printing, signage &amp; design solutions in Mumbai.</span></div></div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 grid h-[58px] grid-cols-3 border-t border-[#dbe5ea] bg-white/96 shadow-[0_-4px_20px_rgba(22,47,70,.1)] backdrop-blur md:hidden">
        <a href="tel:+919555759677" data-testid="mobile-bar-call" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><Phone size={16} className="text-[#1669aa]" />CALL</a>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" data-testid="mobile-bar-whatsapp" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><MessageCircle size={16} className="text-[#2c9b70]" />WHATSAPP</a>
        <a href="#contact" data-testid="mobile-bar-quote" className="flex flex-col items-center justify-center gap-1 text-[9px] font-bold tracking-[.08em] text-[#26425c]"><FileText size={16} className="text-[#1669aa]" />QUOTE</a>
      </div>
      <FloatingContactActions quoteHref="#contact" />
    </div>
  );
}

function Products() {
  const products = useGetPublicProducts();

  return (
    <div className="site-noise min-h-[100dvh] overflow-x-hidden bg-[#fbfcfd] text-[#122641]">
      <SiteHeader quoteHref="/#contact" />
      <main className="pt-[70px]">
        <section className="border-b border-[#e4ebf0] bg-[#f3f7f8]">
          <div className="container-nna py-16 sm:py-20 lg:py-24">
            <p className="eyebrow">Products</p>
            <h1 className="display mt-4 max-w-[720px] text-[clamp(2.8rem,7vw,5.8rem)] font-extrabold leading-[.92] tracking-[-.075em] text-[#14213d]">Made for the work in front of you.</h1>
            <p className="mt-6 max-w-[610px] text-[15px] leading-7 text-[#607487]">Browse the current New National Advertising catalogue. Every item shown here is published from the studio workspace.</p>
          </div>
        </section>
        <section className="container-nna py-14 sm:py-20">
          {products.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading products" data-testid="state-public-products-loading">
              {[1, 2, 3].map((item) => <div key={item} className="admin-skeleton h-[330px] rounded-[14px] border border-[#e1eaee]" />)}
            </div>
          ) : products.isError ? (
            <div className="mx-auto max-w-[560px] rounded-[14px] border border-[#edcbc7] bg-[#fff5f3] px-6 py-12 text-center" role="alert" data-testid="state-public-products-error">
              <p className="eyebrow !text-[#a3443c]">Products</p>
              <h2 className="display mt-3 text-3xl font-extrabold tracking-[-.06em] text-[#703a36]">Catalogue unavailable</h2>
              <p className="mx-auto mt-4 max-w-[360px] text-[13px] leading-6 text-[#9a625c]">We could not load the current catalogue. Please try again shortly or contact us for help.</p>
            </div>
          ) : products.data?.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="public-product-grid">
              {products.data.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-[14px] border border-[#e0e8ed] bg-white shadow-[0_10px_28px_rgba(24,52,82,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(24,52,82,.1)]" data-testid={`public-product-${product.id}`}>
                  <div className="aspect-[1.3/1] overflow-hidden bg-[#edf4f6]">
                    {product.imagePath ? <img src={product.imagePath.startsWith('/api/') ? product.imagePath : `/api/storage${product.imagePath.startsWith('/') ? product.imagePath : `/${product.imagePath}`}`} alt={product.imageAlt || product.name} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-[#7fa3b0]"><PackageIllustration /></div>}
                  </div>
                  <div className="p-5">
                    <p className="eyebrow">{product.category}</p>
                    <h2 className="display mt-2 text-[22px] font-extrabold leading-tight tracking-[-.06em] text-[#203954]">{product.name}</h2>
                    <p className="mt-3 text-[13px] leading-6 text-[#68798a]">{product.shortDescription}</p>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#edf1f3] pt-4">
                      <span className="text-[12px] font-bold text-[#304a60]">{product.price === null || product.price === undefined ? 'Ask for a quote' : `₹${product.price.toLocaleString('en-IN')}`}</span>
                      <a href="/#contact" className="button-arrow inline-flex items-center gap-2 text-[11px] font-bold text-[#1769aa]">Enquire <ArrowRight size={14} /></a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-[560px] rounded-[14px] border border-[#e2e9ee] bg-white px-6 py-16 text-center shadow-[0_12px_34px_rgba(24,52,82,.06)] sm:px-10" data-testid="state-public-products-empty">
              <p className="eyebrow">Products</p>
              <h2 className="display mt-3 text-4xl font-extrabold tracking-[-.055em] text-[#122641] sm:text-[48px]">Products coming soon</h2>
              <p className="mx-auto mt-4 max-w-[360px] text-[13px] leading-6 text-[#68798a]">We’re preparing this collection. Check back soon for what’s new from New National Advertising.</p>
            </div>
          )}
        </section>
      </main>
      <FloatingContactActions quoteHref="/#contact" />
    </div>
  );
}

function PackageIllustration() {
  return <Package size={34} strokeWidth={1.3} />;
}

function Machines() {
  const publicMachines = usePublicMachines();
  useEffect(() => {
    const title = 'Machines | New National Advertising';
    const description = 'Explore the printing and finishing equipment used by New National Advertising for large-format printing, signage and advertising production.';
    const canonicalUrl = `${window.location.origin}/machines`;
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, []);

  return (
    <div className="site-noise min-h-[100dvh] overflow-x-hidden bg-[#fbfcfd] text-[#122641] pb-[58px] md:pb-0">
      <SiteHeader quoteHref="/#contact" />
      <main className="pt-[70px]">
        <section className="relative overflow-hidden border-b border-[#e4ebf0] bg-[#f3f7f8]">
          <div className="pointer-events-none absolute -left-28 top-[-170px] h-[520px] w-[520px] rounded-full border border-[#d7e8ee] bg-white/45" />
          <div className="pointer-events-none absolute right-[-180px] top-[-130px] h-[470px] w-[620px] rounded-[50%] border border-[#d9e9ee] bg-[#eaf3f7]/75" />
          <div className="container-nna relative py-20 sm:py-24 lg:py-28">
            <Reveal className="max-w-[760px]">
              <p className="eyebrow">Our Machines</p>
              <h1 className="display mt-4 max-w-[760px] text-[clamp(2.8rem,7vw,5.8rem)] font-extrabold leading-[.92] tracking-[-.075em] text-[#14213d]" data-testid="heading-machines">
                Printing Technology Behind Our Work
              </h1>
              <p className="mt-6 max-w-[610px] text-[15px] leading-7 text-[#607487]" data-testid="text-machines-intro">
                Explore the printing and finishing equipment used for producing high-quality large-format graphics, advertising materials and signage.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="machine-grid-heading">
          <div className="container-nna">
            <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Production equipment</p>
                <h2 id="machine-grid-heading" className="display mt-2 text-3xl font-extrabold tracking-[-.055em] text-[#122641] sm:text-[42px]">The equipment we present</h2>
              </div>
              <p className="max-w-[330px] text-[12px] leading-5 text-[#718394]">A look at the printing and finishing equipment involved in our large-format workflow.</p>
            </Reveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {publicMachines.loading && <div className="rounded-[16px] border border-[#dce7ec] bg-[#fffdf9] p-8 text-[12px] text-[#718394]">Loading equipment…</div>}
              {!publicMachines.loading && publicMachines.data.map((machine, index) => (
                <Reveal key={machine.name} delay={index * 90} className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-[#dce7ec] bg-[#fffdf9] shadow-[0_10px_28px_rgba(31,65,91,.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(31,65,91,.1)]" >
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-[#e4ecef] bg-[#eef3f3] p-3 sm:p-4">
                    <img src={machine.imageUrl} alt={machine.imageAlt || machine.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.015]" />
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#1b78ad]">{machine.category}</p>
                    <h3 className="display mt-2 text-[25px] font-extrabold leading-[1] tracking-[-.06em] text-[#172d49]" data-testid={`heading-machine-${index + 1}`}>{machine.name}</h3>
                    <p className="mt-4 text-[12px] leading-6 text-[#68798a]">{machine.description}</p>
                    <div className="mt-auto border-t border-[#e7eef1] pt-4">
                      <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#8999a4]">{machine.applications ? 'Applications' : 'Related services'}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {machine.applications
                          ? machine.applications.map((application) => (
                              <span key={application} className="inline-flex items-center rounded-full border border-[#c9dce5] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#2b5873]">
                                {application}
                              </span>
                            ))
                          : (machine.related ?? []).map((service) => (
                              <a key={service.href} href={service.href} className="inline-flex items-center gap-1 rounded-full border border-[#c9dce5] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#2b5873] transition hover:border-[#1669aa] hover:text-[#1669aa]" data-testid={`link-machine-${index + 1}-${service.label.toLowerCase().replaceAll(' ', '-')}`}>
                                {service.label}<ArrowUpRight size={11} />
                              </a>
                            ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f1f6f8] py-16 sm:py-20 lg:py-24">
          <div className="container-nna grid items-start gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
            <Reveal>
              <p className="eyebrow">Production workflow</p>
              <h2 className="display mt-3 max-w-[450px] text-4xl font-extrabold leading-[.98] tracking-[-.06em] text-[#122641] sm:text-[50px]">Built for Professional Print Production</h2>
            </Reveal>
            <Reveal delay={100} className="max-w-[650px]">
              <p className="text-[14px] leading-7 text-[#5f7183]">Our printing workflow combines large-format printing and finishing equipment to support a range of advertising, signage and printed-material requirements. The machines shown on this page represent the production equipment presented by New National Advertising.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ['01', 'Print', 'Large-format graphics and advertising output.'],
                  ['02', 'Finish', 'Finishing workflows for printed media.'],
                  ['03', 'Deliver', 'Materials prepared for your application.'],
                ].map(([number, title, copy]) => (
                  <div key={number} className="rounded-[12px] border border-[#d7e5ea] bg-white/75 p-4">
                    <span className="text-[10px] font-bold tracking-[.18em] text-[#1b78ad]">{number}</span>
                    <h3 className="display mt-3 text-[18px] font-extrabold tracking-[-.04em] text-[#1c3550]">{title}</h3>
                    <p className="mt-2 text-[11px] leading-5 text-[#718394]">{copy}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#102941] text-white">
        <div className="container-nna grid gap-8 py-10 sm:grid-cols-[1fr_1fr] sm:items-start sm:py-12 lg:grid-cols-[1fr_1fr_1fr]">
          <div><Logo /><p className="mt-3 text-[10px] tracking-[.16em] text-[#a8bbca]">PRINT · DESIGN · SIGNAGE · ADVERTISING</p></div>
          <div><p className="eyebrow text-[#7fb5d4]">Explore</p><nav className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] text-[#c1ced8]">{navigationItems.map((item) => <a key={item.label} href={item.href} className="hover:text-white">{item.label}</a>)}</nav></div>
          <div><p className="eyebrow text-[#7fb5d4]">Contact</p><div className="mt-4 space-y-2 text-[11px] leading-5 text-[#c1ced8]"><a href="tel:+919555759677" className="block hover:text-white">9555759677</a><a href="mailto:newnationaladv2022@gmail.com" className="block break-all hover:text-white">newnationaladv2022@gmail.com</a><address className="not-italic">{businessAddressLines.map((line) => <span key={line} className="block">{line}</span>)}<a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-[#9bc8d8] hover:text-white">View on Google Maps</a></address></div></div>
        </div>
        <div className="border-t border-white/10"><div className="container-nna py-5 text-[10px] text-[#8da5b7]">© New National Advertising. All rights reserved.</div></div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 grid h-[58px] grid-cols-3 border-t border-[#dbe5ea] bg-white/96 shadow-[0_-4px_20px_rgba(22,47,70,.1)] backdrop-blur md:hidden">
        <a href="tel:+919555759677" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><Phone size={16} className="text-[#1669aa]" />CALL</a>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><MessageCircle size={16} className="text-[#2c9b70]" />WHATSAPP</a>
        <a href="/#contact" className="flex flex-col items-center justify-center gap-1 text-[9px] font-bold tracking-[.08em] text-[#26425c]"><FileText size={16} className="text-[#1669aa]" />QUOTE</a>
      </div>
      <FloatingContactActions quoteHref="/#contact" />
    </div>
  );
}

function AdminRoute() {
  const { data, isLoading } = useGetAdminSession();

  if (isLoading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#f2f6f8] px-5 text-[#14213d]">
        <div className="rounded-[16px] border border-[#d8e4eb] bg-white px-6 py-5 text-center shadow-[0_12px_34px_rgba(24,52,82,.06)]" data-testid="state-admin-loading">
          <p className="eyebrow">Private workspace</p>
          <p className="mt-2 text-[13px] font-semibold text-[#405268]">Checking admin access…</p>
        </div>
      </main>
    );
  }

  return <AdminPage authenticated={data?.authenticated === true} />;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function ServiceDetailPage({ params }: { params: { slug?: string } }) {
  const [submitted, setSubmitted] = useState(false);
  const service = services.find((item) => item.slug === params.slug);

  useEffect(() => {
    if (!service) return;
    const canonicalUrl = `${window.location.origin}/services/${service.slug}`;
    document.title = service.seoTitle;
    upsertMeta('name', 'description', service.seoDescription);
    upsertMeta('property', 'og:title', service.seoTitle);
    upsertMeta('property', 'og:description', service.seoDescription);
    upsertMeta('property', 'og:url', canonicalUrl);
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [service]);

  if (!service) return <NotFound />;

  const relatedServices = service.related
    .map((slug) => services.find((item) => item.slug === slug))
    .filter((item): item is typeof services[number] => Boolean(item));
  const whatsappBookingUrl = `${whatsappUrl.split('?')[0]}?text=${encodeURIComponent(`Hello New National Advertising, I would like to book/enquire about ${service.title}.`)}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = [
      `Hello New National Advertising, I would like to book/enquire about ${service.title}.`,
      '',
      `Name: ${formData.get('name') ?? ''}`,
      `Phone: ${formData.get('phone') ?? ''}`,
      `Email: ${formData.get('email') ?? ''}`,
      `Service: ${formData.get('service') ?? service.title}`,
      `Requirement: ${formData.get('requirement') ?? ''}`,
      `Quantity: ${formData.get('quantity') || 'Not specified'}`,
      `Preferred date: ${formData.get('date') || 'Not specified'}`,
      `Uploaded file: ${(formData.get('file') as File)?.name || 'None'}`,
    ].join('\n');
    window.open(`${whatsappUrl.split('?')[0]}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="site-noise min-h-[100dvh] overflow-x-hidden bg-[#fbfcfd] text-[#122641] pb-[58px] md:pb-0">
      <SiteHeader quoteHref="#service-enquiry" />
      <main className="pt-[70px]">
        <section className="border-b border-[#e4ebf0] bg-[#f7f8fa]">
          <div className="container-nna py-8 sm:py-12">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#82909d]">
              <a href="/" className="transition hover:text-[#1669aa]">Home</a><ChevronDown size={11} className="-rotate-90 text-[#b1bec7]" />
              <a href="/#services" className="transition hover:text-[#1669aa]">Services</a><ChevronDown size={11} className="-rotate-90 text-[#b1bec7]" />
              <span className="text-[#1669aa]" aria-current="page">{service.title}</span>
            </nav>
            <a href="/#services" className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold text-[#1669aa] transition hover:gap-3"><ArrowRight size={14} className="rotate-180" />Back to Services</a>
            <div className="mt-8 grid items-center gap-9 lg:grid-cols-[.84fr_1.16fr] lg:gap-14">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
                <p className="eyebrow">New National Advertising · Services</p>
                <h1 className="display mt-4 max-w-[520px] text-5xl font-extrabold leading-[.94] tracking-[-.06em] text-[#14213d] sm:text-[clamp(3.2rem,6vw,5.7rem)]">{service.title}</h1>
                <p className="mt-6 max-w-[480px] text-[15px] leading-7 text-[#5f7183]">{service.description}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="#service-enquiry" className="button-arrow inline-flex items-center justify-center gap-3 rounded-full bg-[#1669aa] px-5 py-3 text-[11px] font-bold text-white shadow-[0_7px_18px_rgba(22,105,170,.18)] transition hover:-translate-y-0.5 hover:bg-[#125b94]">Book This Service <ArrowRight size={15} /></a>
                  <a href={whatsappBookingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#9bb9ca] bg-white px-5 py-3 text-[11px] font-bold text-[#25425c] transition hover:-translate-y-0.5 hover:border-[#1669aa]"><MessageCircle size={14} className="text-[#2c9b70]" />Book via WhatsApp</a>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7, delay: .08 }} className="relative">
                <div className="overflow-hidden rounded-[16px] border border-white bg-[#dbe8ef] shadow-[0_20px_55px_rgba(36,67,94,.17)]">
                  <img src={service.image} alt={service.imageAlt} className="aspect-[1.35/1] h-full w-full object-cover transition duration-700 hover:scale-[1.025]" />
                </div>
                <div className="absolute -bottom-4 left-4 rounded-[9px] border border-[#dce8ee] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(31,61,87,.1)] sm:left-7">
                  <p className="eyebrow text-[8px]" style={{ color: service.accent }}>Print / design / finish</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#213951]">Made for your brief.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container-nna grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="eyebrow">What is {service.title}?</p>
              <h2 className="display mt-3 text-3xl font-extrabold leading-[1] tracking-[-.05em] text-[#122641] sm:text-[42px]">A practical way to make your brand visible.</h2>
            </div>
            <div className="max-w-[610px]">
              <p className="text-[14px] leading-7 text-[#68798a]">{service.whatIs}</p>
              <div className="mt-7 flex items-center gap-3"><div className="ink-strip w-28"><span /><span /><span /><span /></div><span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#7d8c99]">C · M · Y · K</span></div>
            </div>
          </div>
        </section>

        <section className="bg-[#f2f6f8] py-16 lg:py-20">
          <div className="container-nna grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="rounded-[12px] border border-[#dfe8ed] bg-white p-6 sm:p-8">
              <p className="eyebrow">What we offer</p>
              <h2 className="display mt-2 text-3xl font-extrabold tracking-[-.05em] text-[#122641]">Available options</h2>
              <div className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {service.items.map((item, index) => <div key={item} className="flex items-start gap-2 text-[12px] font-semibold text-[#354b61]"><Check size={14} className="mt-0.5 shrink-0" style={{ color: [service.accent, '#00A8C6', '#D9468C', '#3BA776'][index % 4] }} />{item}</div>)}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#dfe8ed] bg-white p-6 sm:p-8">
              <p className="eyebrow">Materials and formats</p>
              <h2 className="display mt-2 text-3xl font-extrabold tracking-[-.05em] text-[#122641]">Choose what fits the job.</h2>
              <div className="mt-6 space-y-3">
                {service.materials.map((item, index) => <div key={item} className="flex items-center gap-3 border-b border-[#edf1f3] pb-3 text-[12px] font-semibold text-[#405268]"><span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: [service.accent, '#1769AA', '#3BA776', '#F2994A'][index % 4] }}>{String(index + 1).padStart(2, '0')}</span>{item}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container-nna grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
            <div>
              <p className="eyebrow">Where it works best</p>
              <h2 className="display mt-2 text-3xl font-extrabold tracking-[-.05em] text-[#122641] sm:text-[42px]">Built around the way you use it.</h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {service.applications.map((item, index) => <div key={item} className="flex items-center gap-3 rounded-[8px] border border-[#e1e8ed] bg-[#fbfcfd] px-4 py-3 text-[12px] font-semibold text-[#354b61]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: [service.accent, '#00A8C6', '#D9468C', '#F2994A'][index % 4] }} />{item}</div>)}
              </div>
            </div>
            <div className="rounded-[12px] bg-[#f3f7f8] p-6 sm:p-8">
              <p className="eyebrow">Why choose this service</p>
              <h2 className="display mt-2 text-3xl font-extrabold tracking-[-.05em] text-[#122641]">A considered finish.</h2>
              <div className="mt-6 space-y-4">
                {service.whyChoose.map((item) => <div key={item} className="flex items-start gap-3 text-[12px] leading-5 text-[#5f7183]"><Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: service.accent }} />{item}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="service-enquiry" className="scroll-mt-20 bg-[#f1f6f8] py-16 lg:py-20">
          <div className="container-nna grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="eyebrow">Let's work together</p>
              <h2 className="display mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[50px]">Book this service.</h2>
              <p className="mt-5 max-w-[350px] text-[13px] leading-6 text-[#68798a]">Share a few details and we’ll understand the requirement before we speak.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <a href={whatsappBookingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#2c9b70] px-4 py-2.5 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#23845f]"><MessageCircle size={14} />Book via WhatsApp</a>
                <a href="tel:+919555759677" className="inline-flex items-center gap-2 rounded-full border border-[#9bb9ca] bg-white px-4 py-2.5 text-[10px] font-bold text-[#25425c] transition hover:-translate-y-0.5 hover:border-[#1669aa]"><Phone size={14} className="text-[#1669aa]" />Call Now</a>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="rounded-[12px] border border-[#dce6eb] bg-white p-5 shadow-[0_10px_30px_rgba(31,61,87,.06)] sm:p-7" aria-label={`${service.title} enquiry form`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[10px] font-bold text-[#445a70]">Name<input required name="name" placeholder="Your name" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label>
                <label className="text-[10px] font-bold text-[#445a70]">Phone Number<input required name="phone" type="tel" placeholder="Your phone number" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label>
                <label className="text-[10px] font-bold text-[#445a70]">Email<input required name="email" type="email" placeholder="Your email" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label>
                <label className="text-[10px] font-bold text-[#445a70]">Service<input readOnly name="service" value={service.title} className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#f5f8fa] px-3 py-2.5 text-[12px] font-normal text-[#647487] outline-none" /></label>
                <label className="text-[10px] font-bold text-[#445a70] sm:col-span-2">Requirement<textarea required name="requirement" rows={3} placeholder={`Tell us about your ${service.title.toLowerCase()} requirement...`} className="mt-1.5 w-full resize-none rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label>
                <label className="text-[10px] font-bold text-[#445a70]">Quantity<input name="quantity" placeholder="e.g. 100" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label>
                <label className="text-[10px] font-bold text-[#445a70]">Preferred Date<input name="date" type="date" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label>
                <label className="text-[10px] font-bold text-[#445a70] sm:col-span-2">Upload File (Optional)<span className="mt-1.5 flex w-full cursor-pointer items-center rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-[9px] text-[11px] font-normal text-[#8d9aa5]"><input type="file" name="file" className="w-full text-[10px]" /></span></label>
              </div>
              <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#1669aa] py-3 text-[11px] font-bold text-white transition hover:bg-[#125b94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1669aa] focus-visible:ring-offset-2">{submitted ? 'Enquiry prepared — we will be in touch' : 'Send Enquiry'}<ArrowRight size={14} /></button>
              {submitted && <p role="status" className="mt-3 text-center text-[11px] font-semibold text-[#24734d]">Your enquiry was prepared for WhatsApp. Please send the message to complete the enquiry.</p>}
            </form>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-20">
          <div className="container-nna">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Continue exploring</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.05em] text-[#122641] sm:text-[40px]">You may also need</h2></div><a href="/#services" className="arrow-link inline-flex items-center gap-2 text-[11px] font-bold text-[#1669aa]">View all services <ArrowRight size={14} /></a></div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {relatedServices.map((related) => (
                <Link key={related.slug} href={`/services/${related.slug}`} className="service-card group overflow-hidden rounded-[10px] border border-[#e2e9ee] bg-white" style={{ '--service-accent': related.accent, '--service-tint': related.tint } as CSSProperties}>
                  <div className="relative h-[150px] overflow-hidden bg-[#e4edf1]"><img src={related.image} alt={related.imageAlt} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-[#102941]/10" /><span className="absolute bottom-0 left-4 h-1 w-12 rounded-full bg-[var(--service-accent)]" /></div>
                  <div className="flex items-center justify-between gap-3 p-5"><h3 className="display text-[17px] font-extrabold text-[#162d47]">{related.title}</h3><ArrowRight size={15} className="text-[var(--service-accent)] transition group-hover:translate-x-1" /></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#102941] text-white">
        <div className="container-nna flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between">
           <div><Logo /><p className="mt-3 text-[10px] tracking-[.16em] text-[#a8bbca]">PRINT · DESIGN · SIGNAGE · ADVERTISING</p></div>
           <div className="text-[11px] leading-5 text-[#c1ced8]"><div className="flex flex-wrap gap-4"><a href="tel:+919555759677" className="hover:text-white">9555759677</a><a href="mailto:newnationaladv2022@gmail.com" className="hover:text-white">newnationaladv2022@gmail.com</a></div><address className="mt-2 not-italic">{businessAddressLines.map((line) => <span key={line} className="block">{line}</span>)}<a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-[#9bc8d8] hover:text-white">View on Google Maps</a></address></div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 grid h-[58px] grid-cols-3 border-t border-[#dbe5ea] bg-white/96 shadow-[0_-4px_20px_rgba(22,47,70,.1)] backdrop-blur md:hidden">
        <a href="tel:+919555759677" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><Phone size={16} className="text-[#1669aa]" />CALL</a>
        <a href={whatsappBookingUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><MessageCircle size={16} className="text-[#2c9b70]" />WHATSAPP</a>
        <a href="#service-enquiry" className="flex flex-col items-center justify-center gap-1 text-[9px] font-bold tracking-[.08em] text-[#26425c]"><FileText size={16} className="text-[#1669aa]" />BOOK</a>
      </div>
      <FloatingContactActions quoteHref="#service-enquiry" contextService={service} />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch><Route path="/" component={Home} /><Route path="/machines" component={Machines} /><Route path="/products" component={Products} /><Route path="/admin/login" component={AdminLogin} /><Route path="/admin" component={AdminRoute} /><Route path="/services/:slug" component={ServiceDetailPage} /><Route component={NotFound} /></Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;