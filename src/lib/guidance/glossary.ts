// Phase 7 — plain-language tax glossary (TH/EN), ported verbatim from the
// design handoff prototype (design_handoff_phase7_guidance_onboarding/
// prototype/phase7/p7-data.jsx, GLOSSARY object).
//
// WHY A TS MODULE, NOT messages/{locale}.json:
//   Entries carry per-term structure that next-intl messages can't express —
//   string arrays (`facts`, `notes`), object arrays (`rates`), nullable
//   fields (`more`), and intentional locale asymmetries (`tin` facts differ
//   between TH and EN; `taxResidency`/`corpTax`/`dividendWht` have
//   `more: null` in TH but a string in EN). Precedent for bilingual domain
//   copy in a typed module: src/lib/documents/wht-types.ts.
//
// DRAFT GATE:
//   ALL copy here is draft pending Dsign CPA sign-off. Every term ships with
//   `draft: true`; flipping `draft: false` per term, after a CPA reviews it,
//   is the release gate (badge rendering is controlled by
//   src/lib/guidance/draft-mode.ts).
//
// COPY CHANGES vs. THE PROTOTYPE (state-claim stripping — static copy must
// never assert the reading user's CURRENT configuration, because the same
// copy is shown to VAT-registered users with VAT on). For design-owner
// review, every deviation from the prototype source:
//
//   vat.th.plain
//     original: "…— ถ้ายังไม่ถึง ปล่อยปิดไว้ได้เลย เราตั้งให้แล้ว"
//     new:      "…— ถ้ายังไม่ได้จด ปิดไว้ได้เลย เป็นค่าเริ่มต้นที่ปลอดภัย"
//   vat.en.plain
//     original: "…— under that, leave it off. We’ve done that for you."
//     new:      "…If you’re not registered, leave it off — that’s the safe
//               default."
//   vatThreshold.th.plain
//     original: "…เราจะเตือนคุณล่วงหน้าก่อนถึงจุดนั้น"
//     new:      "…เราจะเตือนคุณล่วงหน้าก่อนถึงจุดนั้น — โดยดูจากเอกสารที่คุณออกใน Dsign"
//   vatThreshold.en.plain
//     original: "…We’ll warn you before you get there."
//     new:      "…We’ll warn you as you approach it — based on the documents
//               you issue in Dsign."
//
//   The remaining 16 terms were scanned for similar current-state assertions
//   and contain none ("we’ll prepare the 50-ทวิ certificate" in whtIssued is
//   an unconditional product capability, not a claim about the reader's
//   configuration) — they are ported character-for-character.

import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  Building,
  Building2,
  Coins,
  FilePenLine,
  FileText,
  Hash,
  Landmark,
  Percent,
  Plane,
  Scale,
  Scissors,
  ScrollText,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";

export type GlossaryLocaleEntry = {
  plain: string;
  real: string;
  more: string | null;
  facts: string[];
  rates?: { rate: string; detail: string }[];
  notes?: string[];
};

export type GlossaryTerm = {
  icon: LucideIcon;
  draft: boolean;
  foreign?: true;
  th: GlossaryLocaleEntry;
  en: GlossaryLocaleEntry;
};

export type GlossaryTermKey =
  | "vat"
  | "whtReceived"
  | "whtIssued"
  | "taxInvoice"
  | "tin"
  | "branch"
  | "quotation"
  | "netPayable"
  | "juristic"
  | "vatThreshold"
  | "pit"
  | "taxResidency"
  | "foreignBusinessAct"
  | "minCapital"
  | "boi"
  | "corpTax"
  | "dividendWht"
  | "workPermit";

export const GLOSSARY: Record<GlossaryTermKey, GlossaryTerm> = {
  vat: {
    icon: Percent,
    draft: true,
    th: {
      plain:
        "ภาษี 7% ที่บวกเพิ่มจากยอดขาย คุณจะเก็บก็ต่อเมื่อยอดขายต่อปีเกิน 1.8 ล้านบาท และจดทะเบียนแล้ว — ถ้ายังไม่ได้จด ปิดไว้ได้เลย เป็นค่าเริ่มต้นที่ปลอดภัย",
      real: "ภาษีมูลค่าเพิ่ม",
      more: "VAT คืออะไร และต้องจดเมื่อไร",
      facts: ["อัตรา 7%", "จดเมื่อยอดเกิน ฿1.8 ล้าน/ปี", "ยื่น ภ.พ.30 ทุกเดือน"],
    },
    en: {
      plain:
        "A 7% tax added on sales. You only charge it once your yearly sales pass ฿1.8M and you’ve registered. If you’re not registered, leave it off — that’s the safe default.",
      real: "Value-added tax (VAT)",
      more: "What VAT is, and when to register",
      facts: ["Rate 7%", "Register above ฿1.8M / yr", "File PP30 monthly"],
    },
  },
  whtReceived: {
    icon: Scissors,
    draft: true,
    th: {
      plain:
        "เมื่อบริษัทจ่ายเงินให้คุณ เขาจะหักไว้นิดหน่อย (มัก 3%) แล้วนำส่งกรมสรรพากรแทนคุณ เงินนี้ไม่ได้หาย — ขอคืนได้ตอนยื่นภาษี เก็บหนังสือรับรองที่เขาให้ไว้",
      real: "ถูกหัก ณ ที่จ่าย",
      more: "วิธีขอคืนภาษีที่ถูกหักไว้",
      facts: ["ปกติ 3%", "ขอคืนได้ตอนยื่นภาษี", "เก็บหนังสือรับรอง (50 ทวิ)"],
    },
    en: {
      plain:
        "When a company pays you, they hold back a small % (usually 3%) and send it to the Revenue Department for you. It’s not lost — you claim it back when you file. Keep the slip they give you.",
      real: "Withholding tax received",
      more: "How to claim withheld tax back",
      facts: ["Usually 3%", "Claim it back when you file", "Keep the 50-ทวิ slip"],
    },
  },
  whtIssued: {
    icon: ScrollText,
    draft: true,
    th: {
      plain:
        "เมื่อคุณเป็นคนจ่ายค่าบางอย่าง (ค่าบริการ ค่าเช่า) คุณต้องหักเงินไว้ส่วนหนึ่งก่อนจ่าย แล้วนำส่งกรมสรรพากรแทนผู้รับ อัตราที่หักไม่เท่ากัน — ขึ้นกับ “ประเภทของเงินได้” และ “ผู้รับเงิน” เราจะช่วยออกหนังสือรับรอง (50 ทวิ) ให้คนที่คุณจ่าย",
      real: "หัก ณ ที่จ่าย",
      more: "อัตราการหัก ณ ที่จ่ายแต่ละประเภท",
      facts: ["นำส่งภายในวันที่ 7 เดือนถัดไป", "ออกหนังสือรับรอง 50 ทวิ"],
      rates: [
        { rate: "1%", detail: "ค่าขนส่ง · ค่าสาธารณูปโภค (โทรศัพท์ · น้ำ · ไฟ)" },
        {
          rate: "3%",
          detail:
            "ค่าจ้างทำของ/รับเหมา · ค่าบริการทั่วไป · วิชาชีพอิสระ (ออกแบบ · สอบบัญชี · ทำบัญชี)",
        },
        {
          rate: "5%",
          detail:
            "ค่าเช่าอสังหาริมทรัพย์ (บ้าน · อาคาร · สำนักงาน) · เงินรางวัลจากการประกวดแข่งขัน",
        },
        {
          rate: "ก้าวหน้า",
          detail: "เงินเดือน · ค่าจ้างแรงงาน (คำนวณแบบภาษีเงินได้บุคคลธรรมดา)",
        },
      ],
      notes: [
        "อัตราขึ้นกับลักษณะงาน: เช่าสถานที่พร้อมกุญแจ (มีสิทธิ์ครอบครอง) = “ค่าเช่า” หัก 5% แต่เช่าจัดอีเวนต์ชั่วคราวไม่มีสิทธิ์ครอบครอง = “ค่าบริการ” หัก 3%",
        "บุคคลธรรมดา vs นิติบุคคล: เมื่อนิติบุคคลเป็นผู้จ่าย มักต้องหักตามอัตราข้างต้น แต่ถ้าผู้รับเป็นบุคคลธรรมดาและกฎหมายไม่ได้กำหนดไว้ มักไม่ต้องหัก",
      ],
    },
    en: {
      plain:
        "When you pay for certain things (services, rent), you hold back a % before paying and remit it to the Revenue Department for the recipient. The rate varies — it depends on the type of income and who the payee is. We’ll prepare the 50-ทวิ certificate for the person you paid.",
      real: "Withholding tax issued",
      more: "Withholding rates by income type",
      facts: ["Remit by the 7th of next month", "Issue a 50-ทวิ certificate"],
      rates: [
        { rate: "1%", detail: "Transport · utilities (phone, water, electricity)" },
        {
          rate: "3%",
          detail:
            "Hire-of-work/subcontract · general services · professional fees (design, audit, bookkeeping)",
        },
        {
          rate: "5%",
          detail:
            "Property rent (house, building, office) · contest & competition prizes",
        },
        {
          rate: "Tiered",
          detail: "Salary · wages (computed like personal income tax)",
        },
      ],
      notes: [
        "The rate follows the nature of the work: a space rented with the keys (you possess it) = “rent” at 5%, but booking a venue for a one-off event with no possession = “service” at 3%.",
        "Individual vs. juristic: when a company is the payer it usually withholds at the rates above; if the payee is an individual and the law doesn’t require it, often no withholding applies.",
      ],
    },
  },
  taxInvoice: {
    icon: FileText,
    draft: true,
    th: {
      plain:
        "ใบกำกับภาษีแสดง VAT และใช้สำหรับผู้ขายที่จด VAT ส่วนใบเสร็จเป็นเพียงหลักฐานว่าได้รับเงินแล้ว",
      real: "ใบกำกับภาษี กับ ใบเสร็จรับเงิน",
      more: "ใช้เอกสารแบบไหน เมื่อไร",
      facts: ["ใบกำกับภาษี = ผู้ขายจด VAT", "ใบเสร็จ = หลักฐานรับเงิน"],
    },
    en: {
      plain:
        "A tax invoice shows VAT and is for VAT-registered sellers. A receipt just proves you got paid.",
      real: "Tax invoice vs. receipt",
      more: "Which document to use, when",
      facts: ["Tax invoice = VAT-registered seller", "Receipt = proof of payment"],
    },
  },
  tin: {
    icon: Hash,
    draft: true,
    th: {
      plain:
        "เลขประจำตัวผู้เสียภาษีของคุณ ถ้าเป็นบุคคลธรรมดาคือเลขบัตรประชาชน 13 หลัก ถ้าเป็นบริษัทจะได้เลข 13 หลักตอนจดทะเบียน",
      real: "เลขประจำตัวผู้เสียภาษี",
      more: null,
      facts: ["13 หลัก", "บุคคล = เลขบัตรประชาชน"],
    },
    en: {
      plain:
        "Your tax ID. If you’re an individual, it’s your national ID number. A company gets a 13-digit number when it registers.",
      real: "Taxpayer ID number (TIN)",
      more: null,
      facts: ["13 digits", "Foreigners get one from the Revenue Dept."],
    },
  },
  branch: {
    icon: Building2,
    draft: true,
    th: {
      plain: "00000 หมายถึงสำนักงานใหญ่ ธุรกิจขนาดเล็กเกือบทั้งหมดใช้ 00000",
      real: "รหัสสาขา",
      more: null,
      facts: ["สำนักงานใหญ่ = 00000"],
    },
    en: {
      plain: "00000 means head office. Almost every small business uses 00000.",
      real: "Branch code",
      more: null,
      facts: ["Head office = 00000"],
    },
  },
  quotation: {
    icon: FilePenLine,
    draft: true,
    th: {
      plain:
        "ใบเสนอราคาคือการเสนอราคาที่คุณส่งให้ลูกค้า ก่อน เริ่มงาน ยังไม่ใช่การเรียกเก็บเงิน",
      real: "ใบเสนอราคา",
      more: null,
      facts: ["ส่งก่อนเริ่มงาน", "ยังไม่ใช่การเรียกเก็บเงิน"],
    },
    en: {
      plain: "A price offer you send before the work. Not a bill yet.",
      real: "Quotation",
      more: null,
      facts: ["Sent before the work", "Not a bill yet"],
    },
  },
  netPayable: {
    icon: Wallet,
    draft: true,
    th: {
      plain: "ยอดที่ลูกค้าจ่ายจริง — หลังบวก VAT และหักภาษี ณ ที่จ่ายออกแล้ว",
      real: "ยอดสุทธิที่ต้องชำระ",
      more: null,
      facts: ["= ยอด + VAT − หัก ณ ที่จ่าย"],
    },
    en: {
      plain:
        "What the customer actually pays — after VAT is added and any withholding tax is taken out.",
      real: "Net payable",
      more: null,
      facts: ["= subtotal + VAT − withholding"],
    },
  },
  juristic: {
    icon: Users,
    draft: true,
    th: {
      plain:
        "บริษัทที่จดทะเบียนคือ “นิติบุคคล” ส่วนคนทั่วไปคือ “บุคคลธรรมดา” ต่างกันตรงที่ใช้แบบภาษีคนละแบบ",
      real: "นิติบุคคล กับ บุคคลธรรมดา",
      more: null,
      facts: ["บริษัท → ภ.ง.ด.50/51", "บุคคล → ภ.ง.ด.90/91"],
    },
    en: {
      plain:
        "A registered company is a “juristic person.” A person is an “individual.” It changes which tax forms apply.",
      real: "Juristic vs. individual",
      more: null,
      facts: ["Company → ภ.ง.ด.50/51", "Person → ภ.ง.ด.90/91"],
    },
  },
  vatThreshold: {
    icon: TrendingUp,
    draft: true,
    th: {
      plain:
        "เมื่อยอดขายต่อปีเกิน 1.8 ล้านบาท คุณต้องจดทะเบียน VAT ภายใน 30 วัน เราจะเตือนคุณล่วงหน้าก่อนถึงจุดนั้น — โดยดูจากเอกสารที่คุณออกใน Dsign",
      real: "จุดบังคับจด VAT (฿1.8 ล้าน)",
      more: "เตรียมตัวจด VAT อย่างไร",
      facts: ["เกณฑ์ ฿1.8 ล้าน/ปี", "ต้องจดภายใน 30 วัน"],
    },
    en: {
      plain:
        "Once your sales pass ฿1.8M in a year, you must register for VAT within 30 days. We’ll warn you as you approach it — based on the documents you issue in Dsign.",
      real: "VAT threshold (฿1.8M)",
      more: "How to prepare for VAT registration",
      facts: ["฿1.8M / year", "Register within 30 days"],
    },
  },
  pit: {
    icon: User,
    draft: true,
    th: {
      plain:
        "ภาษีเงินได้บุคคลธรรมดา ยื่นปีละครั้ง แบบ 91 สำหรับเงินเดือนอย่างเดียว แบบ 90 สำหรับรายได้อื่นๆ",
      real: "ภ.ง.ด.90/91",
      more: null,
      facts: ["ยื่นปีละครั้ง", "91 = เงินเดือน · 90 = รายได้อื่น"],
    },
    en: {
      plain:
        "Personal income tax — what an individual files once a year. 91 is salary-only; 90 is everything else.",
      real: "PIT (ภ.ง.ด.90/91)",
      more: null,
      facts: ["Filed once a year", "91 = salary · 90 = other income"],
    },
  },
  taxResidency: {
    icon: Plane,
    draft: true,
    foreign: true,
    th: {
      plain:
        "ถ้าคุณอยู่ในไทยรวม 180 วันขึ้นไปในปีภาษีหนึ่ง คุณถือเป็นผู้มีถิ่นที่อยู่เพื่อเสียภาษี และต้องเสียภาษีเงินได้บุคคลธรรมดาในไทย เงินที่นำเข้ามาในไทยอาจถูกประเมินด้วย",
      real: "ถิ่นที่อยู่ทางภาษี (180 วัน)",
      more: null,
      facts: ["อยู่ ≥ 180 วัน/ปี = ผู้มีถิ่นที่อยู่", "เสีย PIT แบบขั้นบันได 0–35%"],
    },
    en: {
      plain:
        "Spend 180 days or more in Thailand in a tax year and you’re a tax resident — you pay Thai personal income tax, and foreign income you bring in can be assessed too.",
      real: "Tax residency (the 180-day rule)",
      more: "How the 180-day rule works",
      facts: ["≥ 180 days/yr = resident", "PIT is tiered 0–35%"],
    },
  },
  foreignBusinessAct: {
    icon: Scale,
    draft: true,
    foreign: true,
    th: {
      plain:
        "พ.ร.บ. การประกอบธุรกิจของคนต่างด้าว จำกัดให้ชาวต่างชาติถือหุ้นได้ไม่เกิน 49% ในธุรกิจหลายประเภท — เว้นแต่ได้รับการส่งเสริมจาก BOI หรือใช้สิทธิสนธิสัญญา จึงถือได้มากกว่านั้น",
      real: "พ.ร.บ. ต่างด้าว (FBA)",
      more: "ธุรกิจที่ต่างชาติทำได้/ไม่ได้",
      facts: ["ถือหุ้นต่างชาติ ≤ 49% โดยทั่วไป", "BOI / สนธิสัญญา = ถือได้มากกว่า"],
    },
    en: {
      plain:
        "The Foreign Business Act caps foreign ownership at 49% in many activities — unless you’re BOI-promoted or use a treaty, which can lift that limit. It’s the first thing to settle.",
      real: "Foreign Business Act (FBA)",
      more: "Which activities foreigners can do",
      facts: ["Foreign ownership ≤ 49% by default", "BOI / treaty can raise it"],
    },
  },
  minCapital: {
    icon: Landmark,
    draft: true,
    foreign: true,
    th: {
      plain:
        "บริษัทที่มีเจ้าของต่างชาติและจ้างชาวต่างชาติ มักต้องมีทุนจดทะเบียน 2 ล้านบาทต่อใบอนุญาตทำงาน 1 ใบ (ธุรกิจที่ต่างชาติถือหุ้นข้างมากอาจสูงกว่า) เป็นฐานของวีซ่าและใบอนุญาตทำงาน",
      real: "ทุนจดทะเบียนขั้นต่ำ",
      more: null,
      facts: ["฿2 ล้าน ต่อใบอนุญาตทำงาน", "ฐานของวีซ่า Non-B + Work Permit"],
    },
    en: {
      plain:
        "A foreign-owned company that employs foreigners usually needs ฿2M registered capital per work permit (more if majority-foreign-owned). It underpins your Non-B visa and work permit.",
      real: "Minimum registered capital",
      more: null,
      facts: ["฿2M per work permit", "Underpins Non-B visa + permit"],
    },
  },
  boi: {
    icon: Award,
    draft: true,
    foreign: true,
    th: {
      plain:
        "การส่งเสริมการลงทุนจาก BOI ให้สิทธิประโยชน์ เช่น ถือหุ้นต่างชาติได้ 100% ยกเว้น/ลดภาษีเงินได้นิติบุคคลหลายปี และทำใบอนุญาตทำงานง่ายขึ้น — เหมาะกับธุรกิจเป้าหมายของรัฐ",
      real: "การส่งเสริมการลงทุน (BOI)",
      more: "ธุรกิจแบบไหนขอ BOI ได้",
      facts: [
        "ถือหุ้นต่างชาติได้ 100%",
        "ยกเว้นภาษีนิติบุคคลถึง 8 ปี",
        "ทำ Work Permit ง่ายขึ้น",
      ],
    },
    en: {
      plain:
        "A BOI promotion grants perks: up to 100% foreign ownership, corporate-tax holidays for several years, and easier work permits — for activities the government wants to attract.",
      real: "BOI investment promotion",
      more: "Which activities qualify for BOI",
      facts: [
        "Up to 100% foreign ownership",
        "CIT exemption up to 8 yrs",
        "Easier work permits",
      ],
    },
  },
  corpTax: {
    icon: Building,
    draft: true,
    foreign: true,
    th: {
      plain:
        "บริษัทไทยเสียภาษีเงินได้นิติบุคคลจากกำไรสุทธิ โดยทั่วไป 20% (SME ได้อัตราลดหย่อนช่วงแรก) ยื่นกลางปีและสิ้นปี",
      real: "ภาษีเงินได้นิติบุคคล",
      more: null,
      facts: ["ทั่วไป 20%", "SME แบบขั้นบันได 0–15%", "ภ.ง.ด.51 กลางปี · 50 สิ้นปี"],
    },
    en: {
      plain:
        "A Thai company pays corporate income tax on net profit — generally 20% (SMEs get reduced early-stage rates). Filed mid-year and year-end.",
      real: "Corporate income tax (ภ.ง.ด.50/51)",
      more: "CIT rates & filing dates",
      facts: ["20% standard", "SME tiered 0–15%", "ภ.ง.ด.51 mid-yr · 50 year-end"],
    },
  },
  dividendWht: {
    icon: Coins,
    draft: true,
    foreign: true,
    th: {
      plain:
        "เมื่อบริษัทจ่ายเงินปันผลให้ผู้ถือหุ้น จะถูกหักภาษี ณ ที่จ่าย 10% สำหรับผู้ถือหุ้นต่างชาติอาจมีอนุสัญญาภาษีซ้อนช่วยลดอัตรา",
      real: "ภาษีหัก ณ ที่จ่ายจากเงินปันผล",
      more: null,
      facts: ["หัก 10% เริ่มต้น", "อนุสัญญาภาษีซ้อนอาจลดให้", "ยื่น ภ.ง.ด.2"],
    },
    en: {
      plain:
        "When the company pays a dividend to shareholders, 10% withholding tax applies. A tax treaty may reduce the rate for foreign shareholders.",
      real: "Dividend withholding tax",
      more: "Treaty relief for foreign shareholders",
      facts: ["10% default", "Treaty may reduce it", "Filed via ภ.ง.ด.2"],
    },
  },
  workPermit: {
    icon: BadgeCheck,
    draft: true,
    foreign: true,
    th: {
      plain:
        "หากคุณทำงานในบริษัทไทยของตัวเอง คุณต้องมีใบอนุญาตทำงาน ซึ่งผูกกับเงินเดือนขั้นต่ำและจำนวนพนักงานไทย — มีผลต่อภาษีเงินเดือนและประกันสังคม",
      real: "ใบอนุญาตทำงาน",
      more: "เกณฑ์เงินเดือนและสัดส่วนพนักงาน",
      facts: [
        "พนักงานไทย 4 คน : ต่างชาติ 1 คน",
        "เงินเดือนขั้นต่ำตามสัญชาติ",
        "คู่กับวีซ่า Non-B",
      ],
    },
    en: {
      plain:
        "If you work in your own Thai company, you need a work permit — tied to a minimum salary and Thai-employee ratio, which drives payroll tax and social security.",
      real: "Work permit obligations",
      more: "Work-permit salary & ratio rules",
      facts: [
        "4 Thai staff : 1 foreigner",
        "Min salary by nationality",
        "Pairs with a Non-B visa",
      ],
    },
  },
};

export const GLOSSARY_KEYS = Object.keys(GLOSSARY) as GlossaryTermKey[];

export function glossaryEntry(
  term: GlossaryTermKey,
  locale: string,
): { term: GlossaryTerm; entry: GlossaryLocaleEntry } {
  const g = GLOSSARY[term];
  return { term: g, entry: locale === "en" ? g.en : g.th };
}
