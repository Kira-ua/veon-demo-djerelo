// All texts and numbers come from veon/client.json (fact ids in comments). Nothing here is invented.

export const SOON = "Розділ у розробці";

// First line of each answer = a fact of the centre (concept: «відповідь фактом»).
export const answers = {
  // company.products_services, company.business_lines
  sytuacii: "Реабілітація після інсульту, травм, операцій, інфаркту чи COVID-19, догляд 24/7 і хоспіс. Оберіть свою ситуацію.",
  // C-004 (щоденний лікарський контроль), C-005 (5-разове харчування)
  umovy: "Лікар оглядає щодня, харчування 5 разів на день.",
  // C-022
  komanda: "Головний лікар — невролог Андрющенко Є. О.",
};

// C-009, company.contacts
export const phones = [
  { label: "+38 098 346 64 28", short: "098 346 64 28", tel: "+380983466428", telegram: "DjereloLifeAdmin" },
  { label: "+38 093 231 95 35", short: "093 231 95 35", tel: "+380932319535", telegram: "DjereloAdmin" },
  { label: "+38 066 459 88 23", short: "066 459 88 23", tel: "+380664598823", telegram: "DjereloAdmin2" },
] as const;

export const main = phones[0];

export const messengers = (p: (typeof phones)[number]) => [
  { name: "Viber", href: `viber://chat?number=%2B${p.tel.slice(1)}` },
  { name: "WhatsApp", href: `https://wa.me/${p.tel.slice(1)}` },
  { name: "Telegram", href: `https://t.me/${p.telegram}` },
];

export const email = "info@djerelo.life";
// company.contacts.addresses[0]
export const address = "Одеса, вул. Абрикосова, 1/2";
export const mapHref = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Україна, Одеса, вул. Абрикосова, 1/2");

// socials: only status "confirmed"
export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/djerelo_life/" },
  { name: "YouTube", href: "https://www.youtube.com/@DjereloLife" },
];

export const nav = [
  { id: "sytuacii", label: "Ситуації" },
  { id: "ciny", label: "Ціни" },
  { id: "umovy", label: "Умови" },
  { id: "komanda", label: "Команда" },
  { id: "kontakty", label: "Контакти" },
];

// C-018
export const hours = {
  visits: "10:00–18:00",
  visitsDays: "ПН–НД",
  consult: "ПН–ПТ 10:00–17:00",
  outpatient: "ПН–ПТ 09:00–18:00",
};

// C-019, C-020
export const priceTabs = [
  {
    id: "stay",
    tab: "З проживанням",
    rows: [
      { name: "Часткова реабілітація", price: "2500", unit: "грн/доба" },
      { name: "Повна реабілітація", price: "3000", unit: "грн/доба" },
      { name: "Повна реабілітація Комфорт", price: "3500", unit: "грн/доба" },
      { name: "ПІН Комфорт", price: "4500", unit: "грн/доба" },
    ],
  },
  {
    id: "day",
    tab: "Денний стаціонар",
    rows: [{ name: "Денний стаціонар, 10:00–18:00", price: "2000", unit: "грн/день" }],
  },
  {
    id: "care",
    tab: "Догляд і паліатив",
    rows: [
      { name: "Догляд за літніми", price: "1000–1500", unit: "грн/доба" },
      { name: "Паліативна допомога", price: "1500–4500", unit: "грн/доба" },
    ],
  },
  {
    id: "out",
    tab: "Амбулаторно",
    rows: [
      { name: "Індивідуальне заняття з реабілітологом (кінезіотерапія)", price: "700", unit: "грн/60 хв" },
      { name: "Загальний масаж", price: "1000", unit: "грн/60 хв" },
      { name: "ЕКГ з розшифруванням", price: "200", unit: "грн" },
    ],
    note: "Амбулаторні відвідування ПН–ПТ 09:00–18:00.",
  },
] as const;

// C-021, C-019
export const included = [
  "4-місне розміщення",
  "Багатофункціональні ліжка й протипролежневі матраци",
  "Кондиціонування й кварцування",
  "Догляд 24/7",
  "Багаторазове харчування",
  "Цілодобовий медичний моніторинг",
  "Консультації невролога, кардіолога, терапевта",
];

// C-022
export const team = {
  chief: "Андрющенко Євгеній Олександрович",
  chiefRole: "Лікар-невролог, лікар еферентної терапії",
  roles: [
    "Лікар-невролог",
    "Лікар-терапевт",
    "Нейропсихолог",
    "Терапевт мови та мовлення (логопед-афазіолог)",
    "Медичні сестри",
  ],
};

export const footerGroups = [
  { title: "Реабілітація", items: ["Фізична реабілітація", "Нейрореабілітація", "Ерготерапія", "Терапія мови та мовлення"] },
  { title: "Догляд", items: ["Догляд 24/7", "Хоспіс"] },
  { title: "Вдома та амбулаторно", items: ["Патронажна служба", "Реабілітація вдома", "Амбулаторне лікування", "Прокат медтехніки"] },
  { title: "Про центр", items: ["Повний прайс", "Команда", "Відгуки", "Блог", "Політика конфіденційності"] },
];
