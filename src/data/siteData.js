// Local demo data used as a fallback until the Node.js backend is connected.
// Shapes here mirror what the real API is expected to return so swapping
// over later requires no component changes.

// Demo-only credentials for local development while the real backend auth
// endpoints are being built. Never used as the production auth system —
// AuthAPI always tries the real API first (see services/api.js) and only
// falls back to checking against these when that call fails.
export const demoAccounts = {
  customer: {
    email: 'customer@saitrust.demo',
    password: 'Customer@123',
    user: {
      id: 'c1', name: 'Demo Student', email: 'customer@saitrust.demo', phone: '9025116369',
      studentId: 'SAI-STU-1042', avatar: null,
    },
  },
  staff: {
    email: 'staff@saitrust.demo',
    password: 'Staff@123',
    user: {
      id: 's1', name: 'Demo Staff', email: 'staff@saitrust.demo', phone: '9150981734',
      staffId: 'SAI-STAFF-07', avatar: null,
    },
  },
};

export const heroImage = null; // set by admin upload via /api/settings; ArtPanel is the fallback

export const settings = {
  trustName: 'SAI International Social Service Trust',
  address: 'Kovilpatti, Thoothukudi District, Tamil Nadu',
  phones: ['+91 90251 16369', '+91 91509 81734'],
  email: 'info@saitrustkovilpatti.org',
  whatsapp: '919025116369',
  social: { instagram: '#', facebook: '#', youtube: '#' },
  // Where staff/admin users land after login. The real admin dashboard is
  // built and hosted separately (Developer 2) — point this at it via env.
  staffDashboardUrl: import.meta.env.VITE_STAFF_DASHBOARD_URL || '/staff/pending',
};

export const posts = [
  {
    id: 'p1',
    type: 'image',
    title: 'New Batch Admissions Open',
    titleTa: 'புதிய பேட்ச் சேர்க்கை தொடங்கியது',
    category: 'Admissions',
    date: '2026-08-18',
    description: 'Admissions are currently open for our upcoming training programs across all four courses.',
    descriptionTa: 'எங்கள் நான்கு படிப்புகளுக்கும் வரவிருக்கும் பயிற்சி திட்டங்களுக்கான சேர்க்கை தற்போது திறந்துள்ளது.',
  },
  {
    id: 'p2',
    type: 'video',
    title: 'Aari Embroidery Training Session',
    titleTa: 'ஆரி எம்பிராய்டரி பயிற்சி அமர்வு',
    category: 'Training',
    date: '2026-08-10',
    description: 'A glimpse into our hands-on Aari embroidery training sessions for bridal blouse designs.',
    descriptionTa: 'மணப்பெண் ரவிக்கை வடிவமைப்புகளுக்கான ஆரி எம்பிராய்டரி பயிற்சி அமர்வுகளின் ஒரு காட்சி.',
    videoUrl: '',
  },
  {
    id: 'p3',
    type: 'image',
    title: 'Certificate Distribution Day',
    titleTa: 'சான்றிதழ் வழங்கும் நாள்',
    category: 'Events',
    date: '2026-07-28',
    description: 'Celebrating our graduating students with ISO certified practice certificates.',
    descriptionTa: 'ISO சான்றளிக்கப்பட்ட நடைமுறை சான்றிதழ்களுடன் பட்டம் பெறும் மாணவர்களைக் கொண்டாடுகிறோம்.',
  },
];

export const videos = [
  {
    id: 'v1',
    title: 'Our Training & Activities',
    description: 'A short look at daily classes across tailoring, embroidery, beauty and baking.',
    date: '2026-08-12',
    url: '',
  },
];

export const courses = [
  {
    id: 1,
    slug: 'tailoring-garment-design',
    icon: 'scissors',
    name: 'Tailoring & Garment Design',
    nameTa: 'தையல் & ஆடை வடிவமைப்பு',
    duration: '3 Months',
    durationTa: '3 மாதங்கள்',
    tagline: 'For Beginners',
    taglineTa: 'ஆரம்பநிலையாளர்களுக்கு',
    description:
      'Learn pattern making, cutting and stitching to design and tailor everyday and festive wear from scratch.',
    descriptionTa:
      'அன்றாட மற்றும் விழா ஆடைகளை வடிவமைத்து தைக்க பேட்டர்ன் தயாரித்தல், வெட்டுதல் மற்றும் தையல் கற்றுக்கொள்ளுங்கள்.',
    modules: [
      'Basic to advanced hand & machine stitching',
      'Blouse, salwar & frock pattern making',
      'Cutting techniques for different fabrics',
      'Alterations and finishing',
    ],
    modulesTa: [
      'அடிப்படை முதல் மேம்பட்ட கை & மெஷின் தையல்',
      'ரவிக்கை, சல்வார் & பிராக் பேட்டர்ன் தயாரித்தல்',
      'பல்வேறு துணிகளுக்கான வெட்டுதல் நுட்பங்கள்',
      'மாற்றங்கள் மற்றும் இறுதி செய்தல்',
    ],
    practicalProject: 'Stitch and finish a complete festive blouse and salwar set.',
    practicalProjectTa: 'ஒரு முழுமையான விழா ரவிக்கை & சல்வார் செட்டை தைத்து முடிக்கவும்.',
    benefits: [
      'Start a home tailoring business',
      'Take up boutique or alteration work',
      'Reduce dependency on outside tailors',
    ],
    benefitsTa: [
      'வீட்டிலேயே தையல் தொழில் தொடங்கலாம்',
      'பூட்டிக் அல்லது மாற்று வேலை செய்யலாம்',
      'வெளி தையல்காரர் மீதான சார்பை குறைக்கலாம்',
    ],
  },
  {
    id: 2,
    slug: 'aari-embroidery-work',
    icon: 'needle',
    name: 'Aari Embroidery Work',
    nameTa: 'ஆரி எம்பிராய்டரி வேலை',
    duration: '2 Months',
    durationTa: '2 மாதங்கள்',
    tagline: 'Bridal Specialist',
    taglineTa: 'மணப்பெண் நிபுணத்துவம்',
    description:
      'Master traditional Aari hook embroidery, from foundational stitches to intricate bridal blouse designs.',
    descriptionTa:
      'அடிப்படை தையல்களில் இருந்து நுட்பமான மணப்பெண் ரவிக்கை வடிவமைப்புகள் வரை பாரம்பரிய ஆரி ஹுக் எம்பிராய்டரியில் தேர்ச்சி பெறுங்கள்.',
    modules: [
      '20+ Aari stitches',
      'Zardosi & bead work',
      'Lace work',
      'Bridal blouse designs',
    ],
    modulesTa: [
      '20+ ஆரி தையல்கள்',
      'சர்தோசி & மணி வேலை',
      'லேஸ் வேலை',
      'மணப்பெண் ரவிக்கை வடிவமைப்புகள்',
    ],
    practicalProject: 'Design and complete a hand-embroidered bridal blouse.',
    practicalProjectTa: 'கை எம்பிராய்டரி செய்யப்பட்ட மணப்பெண் ரவிக்கையை வடிவமைத்து முடிக்கவும்.',
    benefits: [
      'Offer bridal & boutique embroidery services',
      'Work on order-based freelance projects',
      'Build a home-based embroidery unit',
    ],
    benefitsTa: [
      'மணப்பெண் & பூட்டிக் எம்பிராய்டரி சேவைகளை வழங்கலாம்',
      'ஆர்டர் அடிப்படையிலான ஃப்ரீலான்ஸ் வேலை செய்யலாம்',
      'வீட்டிலேயே எம்பிராய்டரி யூனிட் அமைக்கலாம்',
    ],
  },
  {
    id: 3,
    slug: 'beautician-makeup-artistry',
    icon: 'sparkle',
    name: 'Beautician & Makeup Artistry',
    nameTa: 'பியூட்டீஷியன் & மேக்கப் கலை',
    duration: '2 Months',
    durationTa: '2 மாதங்கள்',
    tagline: 'Trending',
    taglineTa: 'பிரபலமானது',
    description:
      'Hands-on training in skincare, hairstyling and bridal makeup to launch your own beauty parlour or freelance career.',
    descriptionTa:
      'உங்கள் சொந்த பியூட்டி பார்லர் அல்லது ஃப்ரீலான்ஸ் தொழிலைத் தொடங்க தோல் பராமரிப்பு, முடி அலங்காரம் மற்றும் மணப்பெண் மேக்கப்பில் நடைமுறை பயிற்சி.',
    modules: [
      'Skin & hair care fundamentals',
      'Party & bridal makeup',
      'Hairstyling and draping',
      'Parlour hygiene & client handling',
    ],
    modulesTa: [
      'தோல் & முடி பராமரிப்பு அடிப்படைகள்',
      'பார்ட்டி & மணப்பெண் மேக்கப்',
      'முடி அலங்காரம் மற்றும் புடவை உடுத்துதல்',
      'பார்லர் சுகாதாரம் & வாடிக்கையாளர் கையாளுதல்',
    ],
    practicalProject: 'Complete a full bridal look on a live model.',
    practicalProjectTa: 'ஒரு நேரடி மாடலுக்கு முழுமையான மணப்பெண் லுக்கை முடிக்கவும்.',
    benefits: [
      'Open a home or shop-based beauty parlour',
      'Freelance for weddings & events',
      'Work in established salons',
    ],
    benefitsTa: [
      'வீடு அல்லது கடை அடிப்படையிலான பியூட்டி பார்லர் திறக்கலாம்',
      'திருமணங்கள் & நிகழ்வுகளுக்கு ஃப்ரீலான்ஸ் செய்யலாம்',
      'நிறுவப்பட்ட சலூன்களில் வேலை செய்யலாம்',
    ],
  },
  {
    id: 4,
    slug: 'cake-baking-pastry-arts',
    icon: 'cake',
    name: 'Cake Baking & Pastry Arts',
    nameTa: 'கேக் பேக்கிங் & பேஸ்ட்ரி கலை',
    duration: '2 Months',
    durationTa: '2 மாதங்கள்',
    tagline: 'Home Business',
    taglineTa: 'வீட்டு தொழில்',
    description:
      'From basic sponge to themed fondant cakes and desserts, build the skills to run a home bakery.',
    descriptionTa:
      'அடிப்படை ஸ்பாஞ்ச் முதல் தீம் அடிப்படையிலான ஃபாண்டன்ட் கேக்குகள் மற்றும் இனிப்புகள் வரை, வீட்டு பேக்கரி நடத்த தேவையான திறமைகளை உருவாக்குங்கள்.',
    modules: [
      'Sponge, cream & fondant basics',
      'Themed & designer cakes',
      'Cupcakes, cookies & pastries',
      'Costing, packaging & orders',
    ],
    modulesTa: [
      'ஸ்பாஞ்ச், கிரீம் & ஃபாண்டன்ட் அடிப்படைகள்',
      'தீம் & டிசைனர் கேக்குகள்',
      'கப்கேக்குகள், குக்கீகள் & பேஸ்ட்ரிகள்',
      'விலை நிர்ணயம், பேக்கேஜிங் & ஆர்டர்கள்',
    ],
    practicalProject: 'Design and bake a themed fondant celebration cake.',
    practicalProjectTa: 'ஒரு தீம் அடிப்படையிலான ஃபாண்டன்ட் கொண்டாட்ட கேக்கை வடிவமைத்து பேக் செய்யவும்.',
    benefits: [
      'Start a home bakery business',
      'Take custom cake orders',
      'Supply local bakeries & cafes',
    ],
    benefitsTa: [
      'வீட்டு பேக்கரி தொழில் தொடங்கலாம்',
      'கஸ்டம் கேக் ஆர்டர்களை எடுக்கலாம்',
      'உள்ளூர் பேக்கரிகள் & கஃபேக்களுக்கு வழங்கலாம்',
    ],
  },
];

export const batches = [
  {
    id: 'b1',
    courseSlug: 'tailoring-garment-design',
    course: 'Tailoring Course',
    courseTa: 'தையல் படிப்பு',
    day: '09',
    month: 'JUN',
    slot: 'Morning Batch',
    slotTa: 'காலை பேட்ச்',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    seatsAvailable: 8,
    status: 'Seats Available',
    statusTa: 'இடங்கள் உள்ளன',
  },
  {
    id: 'b2',
    courseSlug: 'aari-embroidery-work',
    course: 'Aari Work Course',
    courseTa: 'ஆரி வேலை படிப்பு',
    day: '10',
    month: 'JUN',
    slot: 'Afternoon Batch',
    slotTa: 'மதிய பேட்ச்',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    seatsAvailable: 5,
    status: 'Seats Available',
    statusTa: 'இடங்கள் உள்ளன',
  },
  {
    id: 'b3',
    courseSlug: 'beautician-makeup-artistry',
    course: 'Beautician Course',
    courseTa: 'பியூட்டீஷியன் படிப்பு',
    day: '11',
    month: 'JUN',
    slot: 'Evening Batch',
    slotTa: 'மாலை பேட்ச்',
    startTime: '5:00 PM',
    endTime: '7:00 PM',
    seatsAvailable: 0,
    status: 'Filling Fast',
    statusTa: 'விரைவில் நிறைவடையும்',
  },
  {
    id: 'b4',
    courseSlug: 'cake-baking-pastry-arts',
    course: 'Cake Baking Course',
    courseTa: 'கேக் பேக்கிங் படிப்பு',
    day: '11',
    month: 'JUN',
    slot: 'Morning Batch',
    slotTa: 'காலை பேட்ச்',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    seatsAvailable: 6,
    status: 'Seats Available',
    statusTa: 'இடங்கள் உள்ளன',
  },
];

export const galleryImages = [
  { id: 1, category: 'Tailoring', caption: 'Pattern-making practice session' },
  { id: 2, category: 'Aari Embroidery', caption: 'Bridal blouse embroidery work' },
  { id: 3, category: 'Beautician', caption: 'Bridal makeup practical class' },
  { id: 4, category: 'Cake Baking', caption: 'Fondant cake decoration workshop' },
  { id: 5, category: 'Convocation', caption: 'Certificate distribution day' },
  { id: 6, category: 'Tailoring', caption: 'Students at the stitching lab' },
  { id: 7, category: 'Aari Embroidery', caption: 'Zardosi & bead work class' },
  { id: 8, category: 'Beautician', caption: 'Skincare & grooming session' },
  { id: 9, category: 'Cake Baking', caption: 'Themed cupcake batch' },
];
