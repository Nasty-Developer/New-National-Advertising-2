import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowDownRight, ArrowRight, Check, ChevronDown, CircleCheck, Clock3, FileText, Grid2X2, Lightbulb, Mail, MapPin, Menu, MessageCircle, PenLine, Phone, Printer, Ruler, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const whatsappUrl = 'https://wa.me/919555759677?text=Hello%20New%20National%20Advertising%2C%20I%20would%20like%20to%20enquire%20about%20your%20printing%20and%20advertising%20services.';

const services = [
  { title: 'Solvent Flex', description: 'Flex, vinyl, canvas, sunboard and backlit printing solutions.', items: ['Star Flex', 'Star Black Back', 'One Way Vision', 'Canvas', 'Gloss Vinyl', 'Matt Vinyl', 'Vinyl with Sunboard', 'Vinyl with Sunpack', 'Sunboard 3mm / 5mm', 'Backlight Printing'], image: '/hero-print-studio.jpg', icon: Printer },
  { title: 'Offset Printing', description: 'Professional printed materials for businesses, events and everyday needs.', items: ['Brochure & Catalogues', 'Calendar', 'Letterhead', 'Business Card', 'Bill Book', 'Envelope', 'Wedding Card', 'Flyer & Leaflet', 'Pavti Book', 'Menu Card'], image: '/design-materials.jpg', icon: FileText },
  { title: 'Screen Printing', description: 'Screen printing for apparel, stationery, promotional products and more.', items: ['Wedding Card', 'Visiting Card', 'Letterhead', 'T-Shirt', 'Envelope', 'Cap', 'Umbrella', 'Carry Bag', 'ID Ribbon', 'School Bag'], image: '/selected-work-grid.jpg', icon: PenLine },
  { title: 'Digital Printing', description: 'Fast, detailed digital printing for personal and business requirements.', items: ['Visiting Card', 'Brochure', 'Catalogue', 'Pamphlet', 'Poster', 'Annual Reports', 'UV Print', 'Hotel Menu', 'Hospital File', 'Trophy Sticker'], image: '/design-materials.jpg', icon: Sparkles },
  { title: 'Sign Boards', description: 'Professional signage and display solutions that help brands stand out.', items: ['Acrylic Clip-on Board', 'Crystal Letter', 'LED Signage', 'Steel & Brass Letter', 'Pixel LED', 'Backlit Signage', 'Iron Standee', 'Roll-up Standee', 'Sunboard Cutout'], image: '/signage-installation.jpg', icon: Ruler },
  { title: 'Graphics Design', description: 'Creative design solutions for branding, marketing and communication.', items: ['Logo Design', 'Social Media Posts', 'Hoarding Banner', 'Menu Card', 'Flyer', 'Product Packaging', 'Magazine Ads', 'Visiting Card', 'Invitation', 'Brochure', 'Calendar'], image: '/design-materials.jpg', icon: Grid2X2 },
];

const work = [
  { title: 'Storefront signage', category: 'Signage', position: 'left center' },
  { title: 'Printed brochure', category: 'Offset printing', position: 'center' },
  { title: 'Business cards', category: 'Digital printing', position: 'right center' },
  { title: 'Menu & collateral', category: 'Graphic design', position: 'bottom left' },
  { title: 'Apparel printing', category: 'Screen printing', position: 'bottom center' },
  { title: 'Packaging details', category: 'Selected work', position: 'bottom right' },
];

const process = [
  { number: '01', title: 'Discuss', copy: 'Share your requirements.', icon: MessageCircle },
  { number: '02', title: 'Design', copy: 'We create the design.', icon: PenLine },
  { number: '03', title: 'Print', copy: 'Professional production.', icon: Printer },
  { number: '04', title: 'Deliver', copy: 'Get your finished work.', icon: Clock3 },
];

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
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
    <div ref={elementRef} className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#home" aria-label="New National Advertising home" data-testid="link-logo" className={`leading-none ${light ? 'text-white' : 'text-[#122641]'}`}>
      <span className="block display text-[17px] font-extrabold tracking-[-.07em]">New National</span>
      <span className={`block mt-0.5 text-[8px] font-bold tracking-[.34em] ${light ? 'text-[#a9c9e2]' : 'text-[#2274ad]'}`}>ADVERTISING</span>
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

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-noise min-h-[100dvh] overflow-x-hidden bg-[#fbfcfd] text-[#122641]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'New National Advertising',
        description: 'Printing, advertising, signage and graphic design solutions.',
        address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressRegion: 'Maharashtra', addressCountry: 'IN' },
        telephone: '+919555759677',
        email: 'newnationaladv2022@gmail.com',
        areaServed: 'Mumbai, Maharashtra, India',
        makesOffer: services.map((service) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: service.title, description: service.description } })),
      }) }} />

      <header className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${scrolled ? 'border-[#dfe8ef] bg-white/95 shadow-[0_3px_18px_rgba(24,52,82,.07)] backdrop-blur-md' : 'border-transparent bg-white/88 backdrop-blur-sm'}`}>
        <div className="container-nna flex h-[70px] items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
            {['Home', 'Services', 'Our Work', 'About', 'Contact'].map((item) => (
              <a key={item} href={`#${item === 'Our Work' ? 'work' : item.toLowerCase()}`} data-testid={`link-nav-${item.toLowerCase().replace(' ', '-')}`} className="text-[11px] font-medium text-[#405268] transition hover:text-[#1669aa]">
                {item}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <a href="tel:+919555759677" data-testid="link-header-phone" className="flex items-center gap-2 text-[11px] font-semibold text-[#233952]"><Phone size={13} className="text-[#1669aa]" />9555759677</a>
            <PrimaryButton />
          </div>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} data-testid="button-mobile-menu" className="rounded-md p-2 text-[#17314d] hover:bg-[#edf4f8] md:hidden">
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-[#e4ebf0] bg-white px-5 pb-6 pt-4 shadow-lg md:hidden">
            <nav className="container-nna flex flex-col gap-1" aria-label="Mobile navigation">
              {['Home', 'Services', 'Our Work', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item === 'Our Work' ? 'work' : item.toLowerCase()}`} onClick={closeMenu} data-testid={`link-mobile-${item.toLowerCase().replace(' ', '-')}`} className="border-b border-[#edf1f4] py-3 text-sm font-semibold text-[#203954]">{item}</a>
              ))}
              <div className="mt-4"><PrimaryButton onClick={closeMenu} /></div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="relative isolate overflow-hidden border-b border-[#edf1f4] bg-[#f2f7fa] pt-[70px]">
          <div className="pointer-events-none absolute -left-28 top-[-130px] -z-10 h-[530px] w-[600px] rounded-full border border-[#dce9f0] bg-white/35" />
          <div className="pointer-events-none absolute right-[-180px] top-[28px] -z-10 h-[470px] w-[650px] rounded-[50%] border border-[#e1edf3] bg-[#eaf3f7]/70" />
          <div className="container-nna grid min-h-[580px] items-center gap-9 py-14 lg:grid-cols-[.89fr_1.11fr] lg:gap-4 lg:py-16">
            <Reveal className="relative z-10 max-w-[520px]">
              <p className="eyebrow mb-5">Print · Design · Signage · Advertising</p>
              <h1 className="display max-w-[530px] text-[clamp(2.7rem,5.7vw,5.4rem)] font-extrabold leading-[.93] text-[#11253e]">New National<br /><span className="text-[#1669aa]">Advertising</span></h1>
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
              <div className="relative aspect-[1.24/1] overflow-hidden rounded-[18px] bg-[#dbe8ef] shadow-[0_20px_55px_rgba(36,67,94,.17)]">
                <img src="/hero-print-studio.jpg" alt="Printed brochures, colour swatches and signage materials arranged in a bright studio" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0f2c4a]/38 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 rounded-sm bg-white/90 px-3 py-2 backdrop-blur"><p className="text-[9px] font-bold tracking-[.18em] text-[#1669aa]">YOUR IDEAS</p><p className="mt-0.5 text-[12px] font-semibold text-[#152a43]">Our print.</p></div>
                <div className="absolute bottom-5 right-5 max-w-[130px] border-l-2 border-[#4da0cd] pl-3 text-[11px] font-semibold leading-4 text-white">Print large.<br />Think bigger.</div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-[#dce8ee] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(31,61,87,.1)] sm:block">
                <p className="eyebrow text-[8px]">Made in Mumbai</p><p className="mt-1 text-[11px] font-semibold text-[#213951]">From ideas to impact.</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="services" className="bg-white py-20 lg:py-24">
          <div className="container-nna">
            <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="eyebrow">What we do</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[40px]">Our Services</h2></div>
              <div className="flex items-end gap-5"><p className="max-w-[330px] text-[12px] leading-5 text-[#718092]">From business cards to large-format signage, we provide complete printing and advertising solutions under one roof.</p><a href="#contact" data-testid="link-view-all-services" className="arrow-link hidden shrink-0 items-center gap-1 text-[11px] font-bold text-[#1669aa] sm:flex">View All Services <ArrowRight size={14} /></a></div>
            </Reveal>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => { const Icon = service.icon; return (
                <Reveal key={service.title} delay={index * 55} className="service-card group overflow-hidden rounded-[10px] border border-[#e2e9ee] bg-white">
                  <div className="relative h-[150px] overflow-hidden bg-[#e4edf1]"><img src={service.image} alt={`${service.title} printing materials`} className="h-full w-full object-cover" style={{ objectPosition: index === 4 ? 'center' : 'center' }} /><div className="absolute inset-0 bg-[#102941]/10" /><div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1669aa]"><Icon size={15} /></div></div>
                   <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="display text-[17px] font-extrabold text-[#162d47]">{service.title}</h3><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c9dae5] text-[#1669aa] transition group-hover:bg-[#1669aa] group-hover:text-white"><ArrowDownRight size={14} /></span></div><p className="mt-2 text-[11px] leading-5 text-[#6d7d8e]">{service.description}</p><p className="mt-4 border-t border-[#edf1f3] pt-3 text-[10px] font-semibold leading-4 text-[#93a0ac]">{service.items.slice(0, 3).join(' · ')}</p><details className="service-details mt-3"><summary className="cursor-pointer text-[10px] font-bold text-[#1669aa]">View full range</summary><p className="mt-2 text-[10px] leading-5 text-[#718092]">{service.items.join(' · ')}</p></details></div>
                </Reveal>
              ); })}
            </div>
            <div className="mt-5 rounded-[10px] border border-[#e2e9ee] bg-[#f8fafb] px-5 py-4 text-center text-[11px] text-[#647487]"><span className="font-bold text-[#263e57]">Other Services</span><span className="mx-2 text-[#b7c4cc]">/</span>Banner Printing · Sunboard / Sunpack · PVC Cards · Resume / Bio-Data · Wooden / MS Frames · Advertising Materials</div>
          </div>
        </section>

        <section className="bg-[#f2f6f8] py-16 lg:py-20">
          <div className="container-nna">
            <Reveal><p className="eyebrow">Why choose us</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[39px]">Quality in Every Print</h2></Reveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[['Quality Printing', 'Clear & vibrant results', CircleCheck], ['Wide Range of Services', 'All your printing needs', Grid2X2], ['Custom Solutions', 'Tailored for your requirements', PenLine], ['Reliable Service', 'Professional service', Clock3]].map(([title, copy, Icon], index) => (
                <Reveal key={title as string} delay={index * 60} className="flex items-start gap-3 rounded-[8px] border border-[#e0e8ed] bg-white px-4 py-4 shadow-[0_5px_16px_rgba(31,61,87,.035)]"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#edf6fb] text-[#1669aa]"><Icon size={16} /></div><div><h3 className="text-[11px] font-bold text-[#243b54]">{title as string}</h3><p className="mt-1 text-[10px] text-[#84919e]">{copy as string}</p></div></Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-white py-20 lg:py-24">
          <div className="container-nna grid items-center gap-10 lg:grid-cols-[.74fr_1.26fr] lg:gap-20">
            <Reveal><p className="eyebrow">About us</p><h2 className="display mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[48px]">New National<br />Advertising</h2><p className="mt-5 max-w-[360px] text-[13px] leading-6 text-[#68798a]">New National Advertising provides printing, signage, advertising and graphic design solutions for businesses, brands and individuals.</p><a href="#contact" data-testid="link-more-about" className="arrow-link mt-6 inline-flex items-center gap-2 rounded-full border border-[#99b8cb] px-4 py-2.5 text-[11px] font-semibold text-[#213c57]">More About Us <ArrowRight size={14} className="text-[#1669aa]" /></a></Reveal>
            <Reveal delay={110} className="grid grid-cols-[1.3fr_1fr_.75fr] gap-2 sm:gap-3">
              <div className="col-span-2 h-[190px] overflow-hidden rounded-[9px] sm:h-[250px]"><img src="/design-materials.jpg" alt="Printed design materials on a studio table" className="h-full w-full object-cover" /></div>
              <div className="h-[190px] overflow-hidden rounded-[9px] sm:h-[250px]"><img src="/hero-print-studio.jpg" alt="Printing press and colour print materials" className="h-full w-full object-cover" /></div>
              <div className="col-span-2 h-[100px] overflow-hidden rounded-[9px] sm:h-[120px]"><img src="/signage-installation.jpg" alt="Professional signage installation" className="h-full w-full object-cover object-center" /></div>
              <div className="flex h-[100px] flex-col justify-center rounded-[9px] bg-[#eef3f6] px-4 sm:h-[120px] sm:px-5"><p className="display text-[17px] font-bold leading-[1.05] text-[#273b51]">From ideas<br />to impact</p><span className="mt-3 h-px w-8 bg-[#1669aa]" /></div>
            </Reveal>
          </div>
        </section>

        <section id="work" className="bg-[#f7f9fa] py-20 lg:py-24">
          <div className="container-nna">
            <Reveal className="flex items-end justify-between gap-4"><div><p className="eyebrow">Our work</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[39px]">Selected Work</h2></div><p className="hidden text-[11px] text-[#7b8998] sm:block">A glimpse of what we create.</p></Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              {work.map((item, index) => (
                <Reveal key={item.title} delay={index * 45} className={`work-card group relative overflow-hidden rounded-[8px] border border-[#e1e7eb] bg-[#dae5eb] ${index === 0 ? 'md:row-span-2' : ''} ${index === 3 ? 'md:col-span-1' : ''}`}>
                  <div className={`relative ${index === 0 ? 'h-[250px] md:h-full' : 'h-[170px] md:h-[190px]'}`}><img src={index === 0 ? '/signage-installation.jpg' : index === 1 ? '/design-materials.jpg' : index === 2 ? '/hero-print-studio.jpg' : '/selected-work-grid.jpg'} alt={`${item.title} selected work`} className="h-full w-full object-cover" style={{ objectPosition: item.position }} /><div className="absolute inset-0 bg-gradient-to-t from-[#0d2238]/75 via-transparent to-transparent opacity-80" /><div className="absolute inset-x-0 bottom-0 p-4 text-white"><div className="flex items-end justify-between gap-2"><div><p className="text-[9px] font-medium uppercase tracking-[.14em] text-[#c3deee]">{item.category}</p><h3 className="mt-1 text-[13px] font-semibold">{item.title}</h3></div><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1669aa] transition group-hover:translate-x-1"><ArrowRight size={13} /></span></div></div></div>
                </Reveal>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-[#8b98a4]">Selected Work — representative printing, signage and design mockups.</p>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="container-nna">
            <Reveal className="text-center"><p className="eyebrow">Our process</p><h2 className="display mt-2 text-3xl font-extrabold tracking-[-.045em] text-[#122641] sm:text-[39px]">From Idea to Impact</h2></Reveal>
            <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              <div className="absolute left-[12%] right-[12%] top-6 hidden h-px bg-[#dce7ed] lg:block" />
              {process.map((step, index) => { const Icon = step.icon; return <Reveal key={step.number} delay={index * 70} className="relative flex gap-4 lg:block lg:text-center"><div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#bed6e4] bg-white text-[#1669aa] lg:mx-auto"><Icon size={18} /></div><div className="lg:mt-4"><p className="text-[10px] font-bold tracking-[.15em] text-[#1669aa]">{step.number}</p><h3 className="mt-1 text-[13px] font-bold uppercase text-[#223b55]">{step.title}</h3><p className="mt-1 text-[11px] text-[#8a98a4]">{step.copy}</p></div></Reveal>; })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#eaf3f7] py-20 lg:py-24">
          <div className="container-nna grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <Reveal><p className="eyebrow">Built for your brand</p><h2 className="display mt-3 max-w-[440px] text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[50px]">Design that supports your brand.</h2><p className="mt-5 max-w-[390px] text-[13px] leading-6 text-[#68798a]">From a first logo to the final printed piece, every detail has a job to do.</p><a href="#contact" data-testid="link-design-enquiry" className="arrow-link mt-6 inline-flex items-center gap-2 text-[11px] font-bold text-[#1669aa]">Start a design conversation <ArrowRight size={14} /></a></Reveal>
            <Reveal delay={100} className="relative min-h-[275px]"><div className="absolute left-0 top-7 h-[170px] w-[62%] overflow-hidden rounded-[9px] border-8 border-white bg-white shadow-[0_14px_30px_rgba(35,68,95,.13)] sm:h-[215px]"><img src="/design-materials.jpg" alt="Graphic design and brand materials" className="h-full w-full object-cover" /></div><div className="absolute right-0 top-0 w-[42%] rounded-[9px] border border-[#dae7ed] bg-white p-4 shadow-[0_12px_26px_rgba(35,68,95,.09)] sm:p-5"><div className="flex items-center justify-between"><span className="display text-[18px] font-extrabold tracking-[-.07em] text-[#152e49]">N</span><span className="text-[8px] font-bold tracking-[.18em] text-[#1669aa]">BRAND KIT</span></div><div className="mt-8 grid grid-cols-3 gap-1.5"><div className="h-7 rounded bg-[#162d48]" /><div className="h-7 rounded bg-[#277eaf]" /><div className="h-7 rounded bg-[#dce9ed]" /></div><p className="mt-3 text-[10px] font-semibold text-[#30465d]">Logo · Packaging<br />Brochure · Menu</p></div><div className="absolute bottom-1 right-[12%] rounded-[9px] bg-[#1669aa] px-4 py-3 text-white shadow-[0_10px_23px_rgba(22,105,170,.18)]"><p className="text-[9px] font-bold tracking-[.14em]">IDEAS</p><p className="mt-1 text-[16px] font-bold">In print.</p></div></Reveal>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="container-nna grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <Reveal className="order-2 overflow-hidden rounded-[12px] lg:order-1"><img src="/signage-installation.jpg" alt="Acrylic and illuminated sign board installation" className="h-[280px] w-full object-cover sm:h-[350px]" /></Reveal>
            <Reveal delay={100} className="order-1 lg:order-2"><p className="eyebrow">Signage solutions</p><h2 className="display mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[48px]">Make Your Brand Stand Out</h2><p className="mt-5 max-w-[390px] text-[13px] leading-6 text-[#68798a]">Professional signage designed to be seen clearly, day and night — from first sketch to final installation.</p><div className="mt-7 grid max-w-[380px] grid-cols-2 gap-x-7 gap-y-3 text-[11px] font-semibold text-[#354b61]">{['Acrylic', 'LED', 'Crystal Letters', 'Steel & Brass Letters', 'Pixel LED', 'Backlit Signage', 'Standee', 'Sunboard Cutouts'].map((item) => <div key={item} className="flex items-center gap-2"><Check size={13} className="text-[#1669aa]" />{item}</div>)}</div></Reveal>
          </div>
        </section>

        <section id="contact" className="bg-[#f1f6f8] py-20 lg:py-24">
          <div className="container-nna grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
            <Reveal><p className="eyebrow">Let's work together</p><h2 className="display mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.055em] text-[#122641] sm:text-[50px]">Get a Quote</h2><p className="mt-5 max-w-[330px] text-[13px] leading-6 text-[#68798a]">Have a printing, signage or design requirement? Get in touch with New National Advertising.</p><div className="mt-8 space-y-4 text-[12px] text-[#405268]"><a href="tel:+919555759677" data-testid="link-contact-primary" className="flex items-center gap-3 hover:text-[#1669aa]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><Phone size={14} /></span><span><strong className="block text-[#223b55]">9555759677</strong><span className="text-[10px] text-[#81909d]">Primary phone</span></span></a><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><Phone size={14} /></span><span>7506269783 &nbsp; / &nbsp; 8898805753</span></div><a href="mailto:newnationaladv2022@gmail.com" data-testid="link-contact-email" className="flex items-center gap-3 hover:text-[#1669aa]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><Mail size={14} /></span>{'newnationaladv2022@gmail.com'}</a><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebf4] text-[#1669aa]"><MapPin size={14} /></span>Mumbai, Maharashtra, India</div></div><div className="mt-7 flex flex-wrap gap-2"><a href={whatsappUrl} target="_blank" rel="noreferrer" data-testid="button-whatsapp" className="inline-flex items-center gap-2 rounded-full bg-[#2c9b70] px-4 py-2.5 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#23845f]"><MessageCircle size={14} />Chat on WhatsApp <ArrowRight size={12} /></a><a href="tel:+919555759677" data-testid="button-call-now" className="inline-flex items-center gap-2 rounded-full border border-[#9bb9ca] bg-white px-4 py-2.5 text-[10px] font-bold text-[#25425c] transition hover:-translate-y-0.5 hover:border-[#1669aa]"><Phone size={14} className="text-[#1669aa]" />Call Now</a><a href="mailto:newnationaladv2022@gmail.com" data-testid="button-email-us" className="inline-flex items-center gap-2 rounded-full border border-[#9bb9ca] bg-white px-4 py-2.5 text-[10px] font-bold text-[#25425c] transition hover:-translate-y-0.5 hover:border-[#1669aa]"><Mail size={14} className="text-[#1669aa]" />Email Us</a></div></Reveal>
            <Reveal delay={100}><form onSubmit={handleSubmit} className="rounded-[12px] border border-[#dce6eb] bg-white p-5 shadow-[0_10px_30px_rgba(31,61,87,.06)] sm:p-7" aria-label="Request a quote form"><div className="grid gap-4 sm:grid-cols-2"><label className="text-[10px] font-bold text-[#445a70]">Name<input required name="name" placeholder="Your name" data-testid="input-name" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Phone Number<input required name="phone" type="tel" placeholder="Your phone number" data-testid="input-phone" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Email<input required name="email" type="email" placeholder="Your email" data-testid="input-email" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Service<select required name="service" defaultValue="" data-testid="select-service" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none focus:border-[#1669aa]"><option value="" disabled>Select a service</option>{services.map((service) => <option key={service.title}>{service.title}</option>)}<option>Other Services</option></select></label><label className="text-[10px] font-bold text-[#445a70] sm:col-span-2">Project Details<textarea required name="details" rows={3} placeholder="Tell us about your requirement..." data-testid="textarea-details" className="mt-1.5 w-full resize-none rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Quantity<input name="quantity" placeholder="e.g. 100" data-testid="input-quantity" className="mt-1.5 w-full rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-2.5 text-[12px] font-normal text-[#203950] outline-none transition placeholder:text-[#a7b1b9] focus:border-[#1669aa] focus:ring-2 focus:ring-[#1669aa]/10" /></label><label className="text-[10px] font-bold text-[#445a70]">Upload File (Optional)<span className="mt-1.5 flex w-full cursor-pointer items-center rounded-[5px] border border-[#dbe5ea] bg-[#fcfdfe] px-3 py-[9px] text-[11px] font-normal text-[#8d9aa5]"><input type="file" name="file" data-testid="input-file" className="w-full text-[10px]" /></span></label></div><button type="submit" data-testid="button-submit-quote" className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#1669aa] py-3 text-[11px] font-bold text-white transition hover:bg-[#125b94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1669aa] focus-visible:ring-offset-2">{submitted ? 'Request received — we will be in touch' : 'Request a Quote'}<ArrowRight size={14} /></button>{submitted && <p role="status" data-testid="status-quote-submitted" className="mt-3 text-center text-[11px] font-semibold text-[#24734d]">Thank you. Please also use WhatsApp for the fastest response.</p>}</form></Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#102941] pb-24 text-white md:pb-0">
        <div className="container-nna grid gap-10 py-12 md:grid-cols-[1.35fr_1fr_1fr] md:py-14">
          <div><Logo light /><p className="mt-5 max-w-[250px] text-[10px] leading-5 text-[#a8bbca]">PRINT · DESIGN · SIGNAGE · ADVERTISING</p></div>
          <div><p className="eyebrow text-[#7fb5d4]">Explore</p><nav className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-[11px] text-[#c1ced8]">{['Home', 'Services', 'Our Work', 'About', 'Contact'].map((item) => <a key={item} href={`#${item === 'Our Work' ? 'work' : item.toLowerCase()}`} data-testid={`link-footer-${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white">{item}</a>)}</nav></div>
          <div><p className="eyebrow text-[#7fb5d4]">Contact</p><div className="mt-4 space-y-3 text-[11px] text-[#c1ced8]"><a href="tel:+919555759677" data-testid="link-footer-phone" className="block hover:text-white">9555759677</a><a href="mailto:newnationaladv2022@gmail.com" data-testid="link-footer-email" className="block break-all hover:text-white">newnationaladv2022@gmail.com</a><p>Mumbai, Maharashtra, India</p></div></div>
        </div>
        <div className="border-t border-white/10"><div className="container-nna flex flex-col gap-2 py-5 text-[10px] text-[#8da5b7] sm:flex-row sm:items-center sm:justify-between"><span>© New National Advertising. All rights reserved.</span><span>Printing, signage &amp; design solutions in Mumbai.</span></div></div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 grid h-[58px] grid-cols-3 border-t border-[#dbe5ea] bg-white/96 shadow-[0_-4px_20px_rgba(22,47,70,.1)] backdrop-blur md:hidden">
        <a href="tel:+919555759677" data-testid="mobile-bar-call" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><Phone size={16} className="text-[#1669aa]" />CALL</a>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" data-testid="mobile-bar-whatsapp" className="flex flex-col items-center justify-center gap-1 border-r border-[#e2e9ed] text-[9px] font-bold tracking-[.08em] text-[#26425c]"><MessageCircle size={16} className="text-[#2c9b70]" />WHATSAPP</a>
        <a href="#contact" data-testid="mobile-bar-quote" className="flex flex-col items-center justify-center gap-1 text-[9px] font-bold tracking-[.08em] text-[#26425c]"><FileText size={16} className="text-[#1669aa]" />QUOTE</a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>
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