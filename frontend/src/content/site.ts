/**
 * Editable content for the DAS & CO public website.
 * Update copy, services, portfolio items, testimonials and FAQs here.
 */

import ring from "@/assets/hero-ring.jpg";
import cad from "@/assets/about-cad.jpg";
import earrings from "@/assets/p-earrings.jpg";
import pendant from "@/assets/p-pendant.jpg";
import bracelet from "@/assets/p-bracelet.jpg";

export const brand = {
  name: "DAS & CO",
  tagline: "Luxury Jewelry CAD Design Studio",
  email: "connect@dasandco.online",
  location: "India",
};

export const images = { ring, cad, earrings, pendant, bracelet };

export const navLinks = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "process", label: "Process" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export const services = [
  {
    icon: "Gem",
    title: "Jewelry CAD Design",
    copy: "Precision CAD modelling of complex jewelry structures, engineered for manufacturing.",
    points: [
      "Precision CAD modelling",
      "Complex jewelry structures",
      "Manufacturing-ready designs",
      "High-detail digital craftsmanship",
    ],
  },
  {
    icon: "Sparkles",
    title: "Custom Jewelry Development",
    copy: "Concepts transformed into refined, wearable designs through creative collaboration.",
    points: [
      "Concept transformation",
      "Creative collaboration",
      "Unique design solutions",
      "Custom jewellery workflows",
    ],
  },
  {
    icon: "Box",
    title: "3D Jewellery Visualization",
    copy: "Photoreal renders that present a design long before the first gram of gold is poured.",
    points: [
      "Realistic digital previews",
      "High-quality renders",
      "Product visualization",
      "Presentation-ready outputs",
    ],
  },
  {
    icon: "Ruler",
    title: "Manufacturing Ready Files",
    copy: "Production-focused geometry with accurate dimensions and industry-standard output.",
    points: [
      "Accurate dimensions",
      "Production-focused designs",
      "Industry-standard workflows",
      "Precision engineering",
    ],
  },
  {
    icon: "Compass",
    title: "Design Consultation",
    copy: "Professional guidance that sharpens a design before it reaches the bench.",
    points: [
      "Professional guidance",
      "Design refinement",
      "Technical recommendations",
      "Creative improvements",
    ],
  },
];

export const pillars = [
  {
    n: "01",
    title: "Precision",
    copy: "Every curve, angle and detail is carefully engineered before it ever reaches production.",
  },
  {
    n: "02",
    title: "Craftsmanship",
    copy: "Digital design combined with genuine jewelry expertise and an eye trained on the bench.",
  },
  {
    n: "03",
    title: "Innovation",
    copy: "Modern CAD workflows paired with creative thinking and a restless pursuit of better.",
  },
  {
    n: "04",
    title: "Reliability",
    copy: "Consistent quality, clear communication and professional delivery, project after project.",
  },
  {
    n: "05",
    title: "Detail Focus",
    copy: "Every element receives exceptional attention — because luxury lives in the millimetre.",
  },
];

export const portfolioCategories = [
  "All",
  "Rings",
  "Earrings",
  "Pendants",
  "Bracelets",
  "Custom Designs",
  "Luxury Collections",
] as const;

export const portfolio = [
  {
    id: 1,
    title: "Solitaire Aurum",
    category: "Rings",
    src: ring,
    span: "tall",
    alt: "Diamond solitaire ring in yellow gold, photorealistic CAD render",
  },
  {
    id: 2,
    title: "Emerald Reliquary",
    category: "Pendants",
    src: pendant,
    span: "wide",
    alt: "Ornate gold pendant with emerald centre stone",
  },
  {
    id: 3,
    title: "Pear Cascade",
    category: "Earrings",
    src: earrings,
    span: "tall",
    alt: "Pear-cut diamond drop earrings in gold",
  },
  {
    id: 4,
    title: "Linea Eternal",
    category: "Bracelets",
    src: bracelet,
    span: "tall",
    alt: "Diamond tennis bracelet in yellow gold",
  },
  {
    id: 5,
    title: "Wireframe to Wearable",
    category: "Custom Designs",
    src: cad,
    span: "tall",
    alt: "Gold ring shown half as CAD wireframe, half as finished render",
  },
  {
    id: 6,
    title: "Maison Signature",
    category: "Luxury Collections",
    src: pendant,
    span: "wide",
    alt: "Signature luxury pendant collection render",
  },
];

export const processSteps = [
  { n: "01", title: "Concept", copy: "Understanding the vision, the wearer and the requirements." },
  {
    n: "02",
    title: "Design Development",
    copy: "Creating precise digital models with production intent from the first curve.",
  },
  {
    n: "03",
    title: "Refinement",
    copy: "Improving details, proportions and accuracy until nothing is left to chance.",
  },
  {
    n: "04",
    title: "Final CAD Delivery",
    copy: "Providing production-ready designs your manufacturer can trust.",
  },
];

export const technology = [
  { title: "Advanced CAD Workflow", copy: "Parametric, revision-friendly modelling built for iteration." },
  { title: "Precision Modelling", copy: "Tolerances respected down to the stone seat and prong." },
  { title: "Digital Craftsmanship", copy: "Hand-finished detail translated into clean digital geometry." },
  { title: "Modern Visualization", copy: "Physically based rendering for true-to-metal presentation." },
  { title: "Production Focus", copy: "Files validated against real casting and printing constraints." },
];

export const testimonials = [
  {
    quote:
      "The level of detail we receive is consistently manufacturing-ready. It removed an entire revision cycle from our process.",
    name: "Design Partner",
    role: "Jewellery Manufacturer",
  },
  {
    quote:
      "Communication is precise and the CAD files are clean. Working with the studio feels like an extension of our own bench.",
    name: "Studio Client",
    role: "Independent Designer",
  },
  {
    quote:
      "Concepts were translated faithfully, then improved. That combination is rare.",
    name: "Brand Client",
    role: "Luxury Retail Brand",
  },
];

export const faqs = [
  {
    q: "What does DAS & CO specialize in?",
    a: "Jewelry CAD design, digital modelling, visualization, and production-ready design solutions.",
  },
  {
    q: "Can you create custom jewellery designs?",
    a: "Yes, DAS & CO works on custom concepts and transforms ideas into detailed CAD designs.",
  },
  {
    q: "What industries do you support?",
    a: "Jewelry brands, manufacturers, designers, and businesses requiring professional CAD solutions.",
  },
  {
    q: "How can I start a project?",
    a: "Visitors can contact DAS & CO through the enquiry form.",
  },
];

export const projectTypes = [
  "Jewelry CAD Design",
  "Custom Jewelry Development",
  "3D Visualization",
  "Manufacturing Ready Files",
  "Design Consultation",
  "Other",
];
