import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create help centres
  const hc1 = await prisma.helpCentre.create({
    data: {
      name: 'Bhopal Women Help Centre',
      nameHi: 'भोपाल महिला सहायता केंद्र',
      address: 'MP Nagar, Zone 1, Bhopal',
      addressHi: 'एमपी नगर, जोन 1, भोपाल',
      phone: '0755-2551234',
      district: 'Bhopal',
    },
  });

  const hc2 = await prisma.helpCentre.create({
    data: {
      name: 'Indore Welfare Office',
      nameHi: 'इंदौर कल्याण कार्यालय',
      address: 'Rajwada Road, Indore',
      addressHi: 'राजवाड़ा रोड, इंदौर',
      phone: '0731-2471234',
      district: 'Indore',
    },
  });

  const hc3 = await prisma.helpCentre.create({
    data: {
      name: 'Gwalior District Office',
      nameHi: 'ग्वालियर जिला कार्यालय',
      address: 'City Centre, Gwalior',
      addressHi: 'सिटी सेंटर, ग्वालियर',
      phone: '0751-2321234',
      district: 'Gwalior',
    },
  });

  // Create schemes
  await prisma.scheme.createMany({
    data: [
      {
        code: 'SCH-014',
        nameHi: 'राज्य विधवा पेंशन योजना',
        nameEn: 'State Widow Pension',
        descriptionHi: 'यह योजना 18-79 वर्ष की विधवा महिलाओं को मासिक पेंशन प्रदान करती है जिनके पास बीपीएल कार्ड है। प्रत्येक माह ₹600 की सहायता राशि सीधे बैंक खाते में जमा की जाती है।',
        descriptionEn: 'This scheme provides monthly pension to widow women aged 18-79 who hold a BPL card. ₹600 per month is directly transferred to their bank account.',
        summaryHi: 'विधवा महिलाओं (18-79 वर्ष) को बीपीएल कार्ड होने पर ₹600 प्रति माह पेंशन मिलती है। आवेदन जिला कार्यालय में करें।',
        summaryApproved: true,
        category: 'pension',
        eligibility: {
          minAge: 18,
          maxAge: 79,
          maritalStatus: ['widow'],
          requiresBPL: true,
          district: ['all'],
        },
        benefits: '₹600/month pension',
        benefitsHi: '₹600 प्रति माह पेंशन',
        documents: ['BPL Card', 'Death Certificate of Husband', 'Aadhar Card', 'Bank Passbook'],
        documentsHi: ['बीपीएल कार्ड', 'पति का मृत्यु प्रमाणपत्र', 'आधार कार्ड', 'बैंक पासबुक'],
        applicationProcess: 'Apply at the district welfare office with required documents. Verification takes 30-45 days.',
        applicationProcessHi: 'आवश्यक दस्तावेजों के साथ जिला कल्याण कार्यालय में आवेदन करें। सत्यापन में 30-45 दिन लगते हैं।',
        sourceUrl: 'https://mp.gov.in/schemes/widow-pension',
        lastCheckedDate: new Date('2026-09-12'),
        helpCentreId: hc1.id,
        published: true,
        district: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Chhindwara'],
      },
      {
        code: 'SCH-022',
        nameHi: 'स्वयं सहायता समूह ऋण सहायता',
        nameEn: 'SHG Loan Support',
        descriptionHi: 'पंजीकृत स्वयं सहायता समूह की सदस्य महिलाओं को कम ब्याज दर पर ₹3 लाख तक का ऋण उपलब्ध है। यह योजना महिलाओं को आजीविका के लिए सशक्त बनाती है।',
        descriptionEn: 'Registered SHG member women can avail loans up to ₹3 lakh at lower interest rates. This scheme empowers women for livelihood.',
        summaryHi: 'स्वयं सहायता समूह सदस्य महिलाओं को ₹3 लाख तक कम ब्याज पर ऋण। पंजीकृत समूह की सदस्यता आवश्यक।',
        summaryApproved: true,
        category: 'livelihood',
        eligibility: {
          requiresSHG: true,
          district: ['all'],
          minAge: 18,
          maxAge: 65,
        },
        benefits: 'Loan up to ₹3 lakh at lower interest rate',
        benefitsHi: '₹3 लाख तक कम ब्याज दर पर ऋण',
        documents: ['SHG Registration Certificate', 'Member ID', 'Aadhar Card', 'Bank Passbook'],
        documentsHi: ['समूह पंजीकरण प्रमाणपत्र', 'सदस्य पहचान पत्र', 'आधार कार्ड', 'बैंक पासबुक'],
        applicationProcess: 'Apply through your SHG group leader. The application is forwarded to the block office for approval.',
        applicationProcessHi: 'अपने समूह की अध्यक्ष के माध्यम से आवेदन करें। आवेदन ब्लॉक कार्यालय को अनुमोदन के लिए भेजा जाता है।',
        sourceUrl: 'https://mp.gov.in/schemes/shg-loan',
        lastCheckedDate: new Date('2026-08-30'),
        helpCentreId: hc2.id,
        published: true,
        district: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Chhindwara'],
      },
      {
        code: 'SCH-031',
        nameHi: 'मातृत्व नकद लाभ योजना',
        nameEn: 'Maternity Cash Benefit',
        descriptionHi: 'पहली बार गर्भवती महिलाओं को किस्तों में ₹5,000 की नकद सहायता दी जाती है। यह राशि प्रसव पूर्व जांच और संस्थागत प्रसव को बढ़ावा देने के लिए है।',
        descriptionEn: 'First-time pregnant women receive ₹5,000 in instalments. This amount promotes antenatal checkups and institutional delivery.',
        summaryHi: 'पहली गर्भावस्था पर ₹5,000 किस्तों में। प्रसव पूर्व जांच और अस्पताल में प्रसव अनिवार्य।',
        summaryApproved: true,
        category: 'health',
        eligibility: {
          requiresPregnancy: true,
          district: ['all'],
          minAge: 18,
          maxAge: 45,
        },
        benefits: '₹5,000 in instalments for first pregnancy',
        benefitsHi: 'पहली गर्भावस्था के लिए ₹5,000 किस्तों में',
        documents: ['Pregnancy Certificate', 'Aadhar Card', 'Bank Passbook', 'MCP Card'],
        documentsHi: ['गर्भावस्था प्रमाणपत्र', 'आधार कार्ड', 'बैंक पासबुक', 'एमसीपी कार्ड'],
        applicationProcess: 'Register at your nearest Anganwadi centre or PHC. Instalments are linked to checkup milestones.',
        applicationProcessHi: 'निकटतम आंगनवाड़ी केंद्र या पीएचसी में पंजीकरण करें। किस्तें जांच के पड़ावों से जुड़ी हैं।',
        sourceUrl: 'https://mp.gov.in/schemes/maternity-benefit',
        lastCheckedDate: new Date('2026-10-05'),
        helpCentreId: hc1.id,
        published: true,
        district: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Chhindwara'],
      },
    ],
  });

  // Create admin user
  const adminHash = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@companya.org',
      passwordHash: adminHash,
      name: 'Trust Admin',
      phone: '9876543210',
      role: 'ADMIN',
    },
  });

  // Create donor users
  const donorHash = await bcrypt.hash('donor123456', 12);
  const donor1 = await prisma.user.create({
    data: {
      email: 'rajesh@example.com',
      passwordHash: donorHash,
      name: 'Rajesh Kumar',
      phone: '9876543211',
      pan: 'ABCDE1234F',
      role: 'DONOR',
    },
  });

  const donor2 = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      passwordHash: donorHash,
      name: 'Priya Sharma',
      phone: '9876543212',
      pan: 'FGHIJ5678K',
      role: 'DONOR',
    },
  });

  const donor3 = await prisma.user.create({
    data: {
      email: 'amit@example.com',
      passwordHash: donorHash,
      name: 'Amit Verma',
      phone: '9876543213',
      role: 'DONOR',
    },
  });

  // Create campaigns
  const camp1 = await prisma.campaign.create({
    data: {
      title: 'Education for 100 Girls',
      titleHi: '100 लड़कियों की शिक्षा',
      description: 'Help us provide quality education to 100 girls from underprivileged families in rural MP.',
      descriptionHi: 'ग्रामीण मध्य प्रदेश की वंचित परिवारों की 100 लड़कियों को गुणवत्तापूर्ण शिक्षा प्रदान करने में हमारी मदद करें।',
      targetAmount: 500000,
      raisedAmount: 187500,
      status: 'ACTIVE',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-03-31'),
    },
  });

  const camp2 = await prisma.campaign.create({
    data: {
      title: 'Health Camps in 9 Districts',
      titleHi: '9 जिलों में स्वास्थ्य शिविर',
      description: 'Organize free health check-up camps for women across 9 districts of MP.',
      descriptionHi: 'मध्य प्रदेश के 9 जिलों में महिलाओं के लिए मुफ्त स्वास्थ्य जांच शिविर आयोजित करें।',
      targetAmount: 300000,
      raisedAmount: 95000,
      status: 'ACTIVE',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-01-31'),
    },
  });

  const camp3 = await prisma.campaign.create({
    data: {
      title: 'SHG Livelihood Kits',
      titleHi: 'स्वयं सहायता समूह आजीविका किट',
      description: 'Provide livelihood starter kits to 200 SHG women for small business.',
      descriptionHi: '200 स्वयं सहायता समूह महिलाओं को छोटे व्यवसाय के लिए आजीविका स्टार्टर किट प्रदान करें।',
      targetAmount: 400000,
      raisedAmount: 260000,
      status: 'ACTIVE',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2027-02-28'),
    },
  });

  // Create receipt sequence
  await prisma.receiptSequence.create({
    data: {
      fiscalYear: '2026-2027',
      lastNumber: 3,
    },
  });

  // Create sample donations
  await prisma.donation.createMany({
    data: [
      {
        receiptNumber: 'REC-20262027-000001',
        donorId: donor1.id,
        campaignId: camp1.id,
        amount: 5000,
        type: 'ONE_TIME',
        status: 'SUCCESS',
        paymentId: 'PAY-DEMO-001',
        idempotencyKey: '11111111-1111-1111-1111-111111111111',
        donorName: 'Rajesh Kumar',
        donorEmail: 'rajesh@example.com',
        donorPhone: '9876543211',
        donorPan: 'ABCDE1234F',
        certificateNumber: '80G-20262027-000001',
        pdfGenerated: true,
      },
      {
        receiptNumber: 'REC-20262027-000002',
        donorId: donor2.id,
        campaignId: camp2.id,
        amount: 10000,
        type: 'ONE_TIME',
        status: 'SUCCESS',
        paymentId: 'PAY-DEMO-002',
        idempotencyKey: '22222222-2222-2222-2222-222222222222',
        donorName: 'Priya Sharma',
        donorEmail: 'priya@example.com',
        donorPhone: '9876543212',
        donorPan: 'FGHIJ5678K',
        certificateNumber: '80G-20262027-000002',
        pdfGenerated: true,
      },
      {
        receiptNumber: 'REC-20262027-000003',
        donorId: donor3.id,
        campaignId: camp3.id,
        amount: 2500,
        type: 'MONTHLY',
        status: 'SUCCESS',
        paymentId: 'PAY-DEMO-003',
        idempotencyKey: '33333333-3333-3333-3333-333333333333',
        donorName: 'Amit Verma',
        donorEmail: 'amit@example.com',
        donorPhone: '9876543213',
        certificateNumber: '80G-20262027-000003',
        pdfGenerated: true,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  Admin: admin@companya.org / admin123456');
  console.log('  Donor: rajesh@example.com / donor123456');
  console.log('  Donor: priya@example.com / donor123456');
  console.log('  Donor: amit@example.com / donor123456');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
