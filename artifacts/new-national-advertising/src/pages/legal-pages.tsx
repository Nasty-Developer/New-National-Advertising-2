import { useEffect } from "react";
import { useGetWebsiteContent, useGetPublicSettings } from "@workspace/api-client-react";

type PageKind = "privacy" | "terms";
type LegalSection = { title: string; paragraphs: string[] };

const privacySections: LegalSection[] = [
  {
    title: "Who we are",
    paragraphs: [
      "New National Advertising is an enquiry-based business for printing, advertising, signage and graphic-design requirements.",
      "For privacy questions, use the privacy contact email shown below. For other enquiries, use the current contact details shown on the website.",
    ],
  },
  {
    title: "Information you choose to share",
    paragraphs: [
      "The quote assistant can ask for your name, phone number, service, project details and approximate quantity. The contact section can also ask for your name, phone, email, service, project details and an optional file name.",
      "The current public quote flow prepares a message in your browser and opens WhatsApp only when you choose to continue. It does not upload the selected file or send the message until you send it in WhatsApp. WhatsApp then handles the information under its own terms and privacy policy.",
      "The application has quote and contact request endpoints that can store your name, phone, optional email, service, enquiry details, quantity, preferred date and, for a quote, an attachment reference and file name. The current public quote assistant does not submit its draft to those endpoints; it prepares a WhatsApp message instead.",
    ],
  },
  {
    title: "Why information is used",
    paragraphs: [
      "Information you send is used to understand your request, reply, discuss requirements and prepare a quotation. App-backed requests may also be shown to authorized administrators so the business can respond.",
      "Do not send sensitive personal, financial or identity-document information unless it is necessary and the business has explained how it will be handled.",
    ],
  },
  {
    title: "Storage, service providers and access",
    paragraphs: [
      "App-backed quote and contact records are stored using the project's existing data service (Firebase Firestore when configured). Development may use a local data file instead. Authorized administrators can review those records through the authenticated admin area.",
      "The site is hosted through Replit. Administrative sign-in uses Firebase Authentication. Cloudinary is used for website-managed media; the current public quote flow does not upload files. Google Fonts may load from Google. Following a WhatsApp link or using your email or phone app sends you to that provider, which has its own privacy terms.",
      "The reviewed public website code does not include an advertising pixel or analytics tracker. Hosting and service providers may still process technical request information needed to operate and protect their services.",
    ],
  },
  {
    title: "Cookies and browser storage",
    paragraphs: [
      "The public site uses browser local storage to remember whether its enquiry-assistant hint was dismissed. That preference does not contain your enquiry details. Firebase sign-in storage is used when an administrator accesses the protected admin area.",
    ],
  },
  {
    title: "Security, retention and your requests",
    paragraphs: [
      "Access to stored app-backed requests is restricted to authenticated administrators, and request fields are validated by the server. These measures reduce risk but cannot guarantee absolute security.",
      "The app does not currently publish or enforce a fixed retention period for enquiry records. Contact newnationaladv2022@gmail.com to ask about access, correction or deletion of information you sent. Requests are assessed under applicable law and any record-keeping obligations; this page does not promise a specific deletion deadline.",
    ],
  },
  {
    title: "Legal disclosures and updates",
    paragraphs: [
      "Information may be disclosed when required by applicable law or to operate the services described above. Applicable privacy and data-protection requirements in India continue to apply; this notice does not replace legal advice or establish compliance by itself.",
      "We may update this notice when the site's data practices change. The effective and last-updated date is shown above.",
    ],
  },
];

const termsSections: LegalSection[] = [
  {
    title: "Using this website",
    paragraphs: [
      "You may use this website to learn about New National Advertising's printing, advertising, signage and graphic-design offerings and to make an enquiry. Do not misuse the site, interfere with its operation, or submit unlawful, harmful or misleading material.",
      "Descriptions and images are general information. A displayed image may be illustrative and is not, by itself, a promise that a particular sample, material, finish or configuration is available.",
    ],
  },
  {
    title: "Enquiries and quotations",
    paragraphs: [
      "An enquiry is a request for discussion or a quotation; it is not an order, acceptance, production instruction or confirmation that payment was received. A quotation is effective only on the terms stated in it, including its scope, price, applicable taxes, validity and any other agreed conditions.",
      "Before accepting a quotation, ask for any project-specific payment, timing, cancellation, defect-resolution, reprint or refund terms that matter to you to be confirmed in writing. The website does not set a general cancellation fee, refund guarantee, warranty or production deadline.",
    ],
  },
  {
    title: "Custom work, proofs and production differences",
    paragraphs: [
      "Where a design proof or artwork approval is provided, check names, spelling, dimensions, colours, content and layout carefully before approving it. An enquiry alone is not approval. The parties should agree in writing on the approved artwork and production scope before work proceeds.",
      "Printing and fabrication can involve reasonable variation in colour, material, dimensions and finish because of screens, substrates, equipment and production tolerances. Any material tolerances or acceptance criteria should be agreed for the specific quotation.",
    ],
  },
  {
    title: "Customer materials and lawful content",
    paragraphs: [
      "You are responsible for having the rights and permissions needed for artwork, text, photographs, logos, trademarks and other material you ask the business to reproduce or use. You must not submit content that infringes another person's rights or is unlawful.",
      "You retain rights in materials you supply. Any use of those materials to discuss or produce your requested work is limited to that project. Ownership or licensing of newly created designs should be agreed in the project quotation.",
    ],
  },
  {
    title: "Prices, taxes and payment",
    paragraphs: [
      "This website does not provide online checkout or take payment. Any price displayed is not a substitute for a project-specific written quotation. Applicable taxes, payment terms and the total payable should be stated in the accepted quotation or applicable tax document. The site does not automatically add GST or state a verified GST registration number.",
    ],
  },
  {
    title: "No delivery or pickup service",
    paragraphs: [
      "New National Advertising does not provide delivery, shipping, dispatch, courier, home-delivery, collection or customer pickup services. This website does not offer a delivery or pickup option. Contact the business to discuss your requirements and obtain a quotation; no alternative fulfilment arrangement is promised here.",
    ],
  },
  {
    title: "Website content, third-party services and responsibility",
    paragraphs: [
      "Website text, branding and original site materials may not be copied or misrepresented without permission. Third-party names, marks and links belong to their respective owners; external services are governed by their own terms.",
      "The site is provided for general information and may change or be temporarily unavailable. Nothing in these terms excludes or limits a right, remedy or liability that cannot lawfully be excluded or limited, including applicable consumer rights.",
    ],
  },
  {
    title: "Complaints and applicable law",
    paragraphs: [
      "For an enquiry or complaint, use the complaint contact shown below and include enough information to identify the matter. The business has not supplied a separate complaint officer or response deadline for publication.",
      "These terms are governed by the laws of India. Any dispute may be brought before a court or consumer forum with jurisdiction under applicable law. Nothing here waives a statutory right or prevents a consumer from using a legally available forum.",
    ],
  },
];

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = content;
}

export function LegalPage({ kind }: { kind: PageKind }) {
  const content = useGetWebsiteContent();
  const settings = useGetPublicSettings();
  const isPrivacy = kind === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms & Conditions";
  const description = isPrivacy
    ? "How New National Advertising handles website enquiries and related information."
    : "Terms for using the New National Advertising website and requesting a quotation.";
  const customCopy = isPrivacy ? content.data?.privacyPolicyBody : content.data?.termsAndConditionsBody;
  const businessName = settings.data?.businessName || "New National Advertising";
  const contactAddress = isPrivacy
    ? settings.data?.businessInformation?.privacyContactEmail || settings.data?.email || "newnationaladv2022@gmail.com"
    : settings.data?.businessInformation?.customerComplaintContact || settings.data?.email || "newnationaladv2022@gmail.com";
  const contactIsPhone = !isPrivacy && /^[+()\d\s.-]{7,40}$/.test(contactAddress);
  const contactHref = contactIsPhone ? `tel:${contactAddress.replace(/[^\d+]/g, "")}` : `mailto:${contactAddress}`;
  const businessInfo = settings.data?.businessInformation;
  const businessFacts: string[] = [];
  if (businessInfo?.legalNameVerified && businessInfo.legalName) businessFacts.push(`Legal name: ${businessInfo.legalName}`);
  if (settings.data?.address && businessInfo?.addressVerified) businessFacts.push(`Business address: ${settings.data.address}`);
  if (businessInfo?.gstStatusVerified && businessInfo.gstRegistrationStatus && businessInfo.gstRegistrationStatus !== "unverified") {
    businessFacts.push(`GST registration status: ${businessInfo.gstRegistrationStatus.replaceAll("_", " ")}`);
  }
  if (businessInfo?.gstStatusVerified && businessInfo.gstRegistrationStatus === "registered" && businessInfo.gstinVerified && businessInfo.gstin) {
    businessFacts.push(`GSTIN: ${businessInfo.gstin}`);
  }
  if (businessInfo?.udyamVerified && businessInfo.udyamStatus === "registered" && businessInfo.udyamNumber) {
    businessFacts.push(`Udyam/MSME number: ${businessInfo.udyamNumber}`);
  }
  if (businessInfo?.maharashtraRegistrationVerified && businessInfo.maharashtraRegistrationIdentifier) {
    businessFacts.push(`Maharashtra registration: ${[businessInfo.maharashtraRegistrationType, businessInfo.maharashtraRegistrationIdentifier, businessInfo.maharashtraRegistrationStatus].filter(Boolean).join(" · ")}`);
  }
  if (businessInfo?.operatingHoursVerified && businessInfo.operatingHours) businessFacts.push(`Operating hours: ${businessInfo.operatingHours}`);

  useEffect(() => {
    document.title = `${title} | ${businessName}`;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", `${title} | ${businessName}`);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "twitter:title", `${title} | ${businessName}`);
    upsertMeta("name", "twitter:description", description);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}${window.location.pathname}`;
  }, [businessName, description, title]);

  const sections = isPrivacy ? privacySections : termsSections;
  return (
    <main className="min-h-[70vh] bg-[#f7f9fa] pb-16 pt-[100px] text-[#203954] sm:pb-24 sm:pt-[122px]">
      <article className="container-nna max-w-[900px]">
        <div className="rounded-[22px] border border-[#dce7ec] bg-white px-5 py-8 shadow-[0_14px_38px_rgba(24,52,82,.055)] sm:px-10 sm:py-12">
          <p className="eyebrow">New National Advertising · Legal information</p>
          <h1 className="display mt-3 text-4xl font-extrabold tracking-[-.06em] text-[#122641] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-[680px] text-[13px] leading-6 text-[#68798a]">{description}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-b border-[#e7eef1] pb-6 text-[11px] text-[#718394]">
            <span>Effective: 10 October 2026</span>
            <span>Last updated: 10 October 2026</span>
          </div>
          {isPrivacy && (
            <p className="mt-6 rounded-xl border border-[#d6e6ec] bg-[#f2f8fa] px-4 py-3 text-[12px] leading-5 text-[#526b7a]">
              This notice describes the website and enquiry flows reviewed on the date above. It is not a statement that this page alone establishes legal compliance.
            </p>
          )}
          {businessFacts.length > 0 && (
            <section className="mt-6 rounded-xl border border-[#d6e6ec] bg-[#f2f8fa] px-4 py-4">
              <h2 className="display text-base font-extrabold text-[#1b3854]">Verified business details</h2>
              <ul className="mt-2 space-y-1 text-[12px] leading-5 text-[#526b7a]">
                {businessFacts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            </section>
          )}
          {customCopy?.trim() ? (
            <div className="mt-8 whitespace-pre-line text-[13px] leading-7 text-[#536b7b]">{customCopy}</div>
          ) : (
            <div className="mt-8 space-y-8">
              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="display text-xl font-extrabold tracking-[-.035em] text-[#1b3854]">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-[13px] leading-7 text-[#536b7b]">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </section>
              ))}
            </div>
          )}
          <div className="mt-10 rounded-xl border border-[#e2ebef] bg-[#fbfcfd] p-4 text-[12px] leading-5 text-[#607584]">
            Questions or complaints: <a className="font-semibold text-[#1769aa] underline underline-offset-2" href={contactHref}>{contactAddress}</a>
          </div>
        </div>
      </article>
    </main>
  );
}
