import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const schemes = [
  {
    code: 'SCH-041',
    nameHi: 'महिला स्वास्थ्य जांच सहायता',
    nameEn: 'Women Health Check-up Support',
    descriptionHi: 'भोपाल और सागर जिले की महिलाओं के लिए निःशुल्क स्वास्थ्य जांच और परामर्श सहायता।',
    descriptionEn: 'Free health screening and counselling support for women in Bhopal and Sagar districts.',
    summaryHi: 'भोपाल और सागर की महिलाओं को स्वास्थ्य जांच और परामर्श सहायता मिलती है।',
    category: 'health',
    eligibility: { minAge: 18, maxAge: 65, district: ['Bhopal', 'Sagar'] },
    benefits: 'Free health screening and counselling',
    benefitsHi: 'निःशुल्क स्वास्थ्य जांच और परामर्श',
    documents: ['Aadhar Card', 'District Address Proof'],
    documentsHi: ['आधार कार्ड', 'जिले का पता प्रमाण'],
    applicationProcess: 'Register at the nearest participating health centre.',
    applicationProcessHi: 'निकटतम स्वास्थ्य केंद्र में पंजीकरण करें।',
    sourceUrl: 'https://mp.gov.in/schemes/women-health-checkup',
    lastCheckedDate: new Date('2026-10-12'),
    district: ['Bhopal', 'Sagar'],
    published: true,
  },
  {
    code: 'SCH-052',
    nameHi: 'ग्रामीण कौशल प्रशिक्षण योजना',
    nameEn: 'Rural Skills Training Scheme',
    descriptionHi: 'इंदौर और उज्जैन जिले की महिलाओं के लिए रोजगार-केंद्रित कौशल प्रशिक्षण।',
    descriptionEn: 'Employment-focused skills training for women in Indore and Ujjain districts.',
    summaryHi: 'इंदौर और उज्जैन की महिलाओं के लिए रोजगार से जुड़े कौशल प्रशिक्षण।',
    category: 'livelihood',
    eligibility: { minAge: 18, maxAge: 50, district: ['Indore', 'Ujjain'], requiresSHG: false },
    benefits: 'Free vocational training and completion certificate',
    benefitsHi: 'निःशुल्क व्यावसायिक प्रशिक्षण और प्रमाणपत्र',
    documents: ['Aadhar Card', 'Education Certificate'],
    documentsHi: ['आधार कार्ड', 'शैक्षणिक प्रमाणपत्र'],
    applicationProcess: 'Apply through the district training centre.',
    applicationProcessHi: 'जिला प्रशिक्षण केंद्र के माध्यम से आवेदन करें।',
    sourceUrl: 'https://mp.gov.in/schemes/rural-skills',
    lastCheckedDate: new Date('2026-09-28'),
    district: ['Indore', 'Ujjain'],
    published: true,
  },
  {
    code: 'SCH-063',
    nameHi: 'बालिका शिक्षा सहायता',
    nameEn: 'Girls Education Support',
    descriptionHi: 'ग्वालियर और रीवा जिले की कम आय वाले परिवारों की बालिकाओं के लिए शैक्षणिक सहायता।',
    descriptionEn: 'Education support for girls from low-income families in Gwalior and Rewa districts.',
    summaryHi: 'ग्वालियर और रीवा की बालिकाओं को शिक्षा सामग्री और शुल्क सहायता मिलती है।',
    category: 'education',
    eligibility: { minAge: 6, maxAge: 18, district: ['Gwalior', 'Rewa'], requiresBPL: true },
    benefits: 'Education materials and school fee support',
    benefitsHi: 'शिक्षा सामग्री और स्कूल शुल्क सहायता',
    documents: ['BPL Card', 'School ID', 'Aadhar Card'],
    documentsHi: ['बीपीएल कार्ड', 'स्कूल पहचान पत्र', 'आधार कार्ड'],
    applicationProcess: 'Submit the application through the school help desk.',
    applicationProcessHi: 'स्कूल सहायता डेस्क के माध्यम से आवेदन जमा करें।',
    sourceUrl: 'https://mp.gov.in/schemes/girls-education',
    lastCheckedDate: new Date('2026-10-01'),
    district: ['Gwalior', 'Rewa'],
    published: true,
  },
  {
    code: 'SCH-074',
    nameHi: 'मातृ पोषण सहायता',
    nameEn: 'Maternal Nutrition Support',
    descriptionHi: 'जबलपुर और सतना जिले की गर्भवती और स्तनपान कराने वाली महिलाओं के लिए पोषण सहायता।',
    descriptionEn: 'Nutrition support for pregnant and breastfeeding women in Jabalpur and Satna districts.',
    summaryHi: 'जबलपुर और सतना में पात्र महिलाओं को पोषण किट और परामर्श मिलता है।',
    category: 'health',
    eligibility: { minAge: 18, maxAge: 45, district: ['Jabalpur', 'Satna'], requiresPregnancy: true },
    benefits: 'Monthly nutrition kit and counselling',
    benefitsHi: 'मासिक पोषण किट और परामर्श',
    documents: ['Pregnancy Certificate', 'Aadhar Card', 'MCP Card'],
    documentsHi: ['गर्भावस्था प्रमाणपत्र', 'आधार कार्ड', 'एमसीपी कार्ड'],
    applicationProcess: 'Register at the nearest Anganwadi centre.',
    applicationProcessHi: 'निकटतम आंगनवाड़ी केंद्र में पंजीकरण करें।',
    sourceUrl: 'https://mp.gov.in/schemes/maternal-nutrition',
    lastCheckedDate: new Date('2026-10-08'),
    district: ['Jabalpur', 'Satna'],
    published: true,
  },
  {
    code: 'SCH-085',
    nameHi: 'महिला सूक्ष्म उद्यम सहायता',
    nameEn: 'Women Micro-enterprise Support',
    descriptionHi: 'छिंदवाड़ा जिले की महिलाओं को छोटे व्यवसाय शुरू करने के लिए मार्गदर्शन और सहायता।',
    descriptionEn: 'Guidance and support for women starting small businesses in Chhindwara district.',
    summaryHi: 'छिंदवाड़ा की महिलाओं को छोटे व्यवसाय के लिए प्रशिक्षण और मार्गदर्शन।',
    category: 'livelihood',
    eligibility: { minAge: 21, maxAge: 60, district: ['Chhindwara'], requiresSHG: true },
    benefits: 'Business training and market linkage support',
    benefitsHi: 'व्यवसाय प्रशिक्षण और बाजार से जोड़ने की सहायता',
    documents: ['SHG Member ID', 'Aadhar Card', 'Bank Passbook'],
    documentsHi: ['स्वयं सहायता समूह सदस्य पहचान पत्र', 'आधार कार्ड', 'बैंक पासबुक'],
    applicationProcess: 'Apply through the block livelihood office.',
    applicationProcessHi: 'ब्लॉक आजीविका कार्यालय के माध्यम से आवेदन करें।',
    sourceUrl: 'https://mp.gov.in/schemes/micro-enterprise',
    lastCheckedDate: new Date('2026-09-20'),
    district: ['Chhindwara'],
    published: true,
  },
];

async function main() {
  const helpCentres = await prisma.helpCentre.findMany({
    select: { id: true, district: true },
  });
  const helpCentreByDistrict = new Map(helpCentres.map((centre) => [centre.district, centre.id]));

  for (const scheme of schemes) {
    await prisma.scheme.upsert({
      where: { code: scheme.code },
      update: scheme,
      create: {
        ...scheme,
        helpCentreId: helpCentreByDistrict.get(scheme.district[0]),
      },
    });
  }

  console.log(`Added or updated ${schemes.length} district-specific sample schemes.`);
}

main()
  .catch((error) => {
    console.error('Supplemental scheme seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
