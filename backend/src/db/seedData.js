const { computeSubmissionHash } = require("../utils/validators");

function createSeedUsers() {
  const now = "2026-11-10T09:00:00.000Z";
  return [
    {
      id: "usr-demo-1",
      fullName: "Aarav Sharma",
      campusEmail: "aarav.sharma@university.edu",
      role: "student",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr-demo-2",
      fullName: "Maya Lin",
      campusEmail: "maya.lin@university.edu",
      role: "student",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr-demo-3",
      fullName: "Campus Desk Coordinator",
      campusEmail: "lostandfound@university.edu",
      role: "admin",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createSeedLostItems() {
  const raw = [
    {
      id: "lost-wallet",
      userId: "usr-demo-1",
      title: "Black Leather Wallet",
      category: "Wallets",
      campusZone: "Student Union",
      location: "Student Union, 1st Floor Lounge",
      dateLost: "2026-11-20",
      publicDescription:
        "Slim matte black bifold leather wallet last seen near the charging booths after lunch.",
      privateIdentifyingDetails: "Contains a green library punch card inside.",
      imageUrl: "/images/watch.webp",
      status: "available",
    },
    {
      id: "lost-airpods",
      userId: "usr-demo-2",
      title: "Apple AirPods Case",
      category: "Electronics",
      campusZone: "Science Library",
      location: "Science Library, 2nd Floor Study Tables",
      dateLost: "2026-11-20",
      publicDescription:
        "White wireless earbuds charging case left on an oak study table near the east windows.",
      privateIdentifyingDetails: "Small scuff mark near hinge.",
      imageUrl: "/images/airpods.webp",
      status: "available",
    },
    {
      id: "lost-backpack",
      userId: "usr-demo-1",
      title: "Blue College Backpack",
      category: "Bags",
      campusZone: "North Hall",
      location: "North Hall, Lecture Room 104",
      dateLost: "2026-11-19",
      publicDescription:
        "Deep navy-blue canvas backpack left under a middle-row seat after the 11 AM seminar.",
      privateIdentifyingDetails: "Rain jacket packed in side pocket.",
      imageUrl: "/images/bag.webp",
      status: "available",
    },
    {
      id: "lost-student-id",
      userId: "usr-demo-2",
      title: "Student ID Card",
      category: "ID & Cards",
      campusZone: "Commons Café",
      location: "Commons Café, Patio Tables",
      dateLost: "2026-11-19",
      publicDescription:
        "University student access card attached to a dark green woven lanyard near the patio.",
      privateIdentifyingDetails: "Owner initials on back of plastic sleeve.",
      imageUrl: "/images/id.webp",
      status: "claim_requested",
    },
    {
      id: "lost-bottle",
      userId: "usr-demo-1",
      title: "Silver Water Bottle",
      category: "Personal",
      campusZone: "West Quad",
      location: "West Quad Walkway Bench",
      dateLost: "2026-11-18",
      publicDescription:
        "Insulated stainless steel water bottle with loop cap left on a bench along West Quad.",
      privateIdentifyingDetails: "Small dent near the bottom rim.",
      imageUrl: "/images/silver bottle.png",
      status: "available",
    },
    {
      id: "lost-calculator",
      userId: "usr-demo-2",
      title: "Scientific Calculator",
      category: "Electronics",
      campusZone: "Engineering Courtyard",
      location: "Engineering Hall, Room 210",
      dateLost: "2026-11-17",
      publicDescription:
        "Non-graphing scientific calculator in a snap-on slide cover misplaced after a lab quiz.",
      privateIdentifyingDetails: "Yellow dot sticker on back battery door.",
      imageUrl: "/images/calculator.png",
      status: "available",
    },
    {
      id: "lost-charger",
      userId: "usr-demo-1",
      title: "Laptop Charger",
      category: "Electronics",
      campusZone: "Main Library",
      location: "Main Library, 3rd Floor Media Pod",
      dateLost: "2026-11-15",
      publicDescription:
        "65W USB-C power adapter with braided white cable left plugged into a media pod outlet.",
      privateIdentifyingDetails: "Dark silicone cable tie wrapped around cord.",
      imageUrl: "/images/laptop charger.png",
      status: "available",
    },
    {
      id: "lost-keys",
      userId: "usr-demo-2",
      title: "House Keys",
      category: "Keys",
      campusZone: "Humanities Study Hall",
      location: "Humanities Building, South Entrance",
      dateLost: "2026-11-12",
      publicDescription:
        "Key ring with two brass house keys and a dark leather fob dropped near the south steps.",
      privateIdentifyingDetails: "Small silver mailbox key included.",
      imageUrl: "/images/house key.png",
      status: "recovered",
    },
  ];

  return raw.map((item) => ({
    ...item,
    submissionHash: computeSubmissionHash([
      "lost",
      item.title,
      item.category,
      item.campusZone,
      item.dateLost,
    ]),
    createdAt: `${item.dateLost}T14:00:00.000Z`,
    updatedAt: `${item.dateLost}T14:00:00.000Z`,
  }));
}

function createSeedFoundItems() {
  const raw = [
    {
      id: "found-keys",
      userId: "usr-demo-3",
      title: "Dorm Key Set with Leather Fob",
      category: "Keys",
      campusZone: "Engineering Courtyard",
      location: "Engineering Courtyard Stone Ledge",
      dateFound: "2026-11-20",
      publicDescription:
        "Set of brass and silver keys with a dark leather fob found resting on a courtyard ledge.",
      privateVerificationDetails: "Three keys total including one numbered brass tag (B-14).",
      additionalNotes: "Held safely at the Engineering Front Desk for verified pickup.",
      imageUrl: "/images/keys.webp",
      status: "available",
    },
    {
      id: "found-glasses",
      userId: "usr-demo-3",
      title: "Tortoiseshell Reading Glasses",
      category: "Accessories",
      campusZone: "Main Library",
      location: "Main Library, Quiet Study Zone",
      dateFound: "2026-11-20",
      publicDescription:
        "Classic tortoiseshell eyeglasses found beside a slim matte-black case on a reading table.",
      privateVerificationDetails: "Microfiber cloth inside case is light blue with gold edge.",
      additionalNotes: "Turned in to the Main Library Circulation Desk.",
      imageUrl: "/images/glasses.webp",
      status: "available",
    },
    {
      id: "found-notebook",
      userId: "usr-demo-2",
      title: "Hardcover Notebook & Pen",
      category: "Stationery",
      campusZone: "Humanities Study Hall",
      location: "Humanities Study Hall, Desk 12",
      dateFound: "2026-11-19",
      publicDescription:
        "Forest-green hardcover notebook with elastic band and matte black pen left on Desk 12.",
      privateVerificationDetails: "Contains notes for Modern European History with green sticky tabs.",
      additionalNotes: "Available for verified campus handoff near Humanities Hall.",
      imageUrl: "/images/notebook.webp",
      status: "available",
    },
    {
      id: "found-watch",
      userId: "usr-demo-3",
      title: "Silver Analog Wristwatch",
      category: "Accessories",
      campusZone: "Student Union",
      location: "Student Union, Information Counter",
      dateFound: "2026-11-18",
      publicDescription:
        "Minimalist brushed-silver analog wristwatch with a brown leather strap found near the union.",
      privateVerificationDetails: "Engraved graduation year '2024' on back case.",
      additionalNotes: "Logged at the Student Union Information Desk.",
      imageUrl: "/images/watch.webp",
      status: "available",
    },
    {
      id: "found-earbuds",
      userId: "usr-demo-3",
      title: "Wireless Earbuds Charging Case",
      category: "Electronics",
      campusZone: "Science Library",
      location: "Science Library, 1st Floor Print Station",
      dateFound: "2026-11-17",
      publicDescription:
        "White wireless earbuds charging case discovered next to the self-service printer.",
      privateVerificationDetails: "Tiny crescent moon scratch inside the lid.",
      additionalNotes: "Secured at the Science Library Reference Desk.",
      imageUrl: "/images/airpods.webp",
      status: "available",
    },
    {
      id: "found-bottle",
      userId: "usr-demo-1",
      title: "Insulated Green Water Bottle",
      category: "Personal",
      campusZone: "West Quad",
      location: "West Quad, South Lawn Bench",
      dateFound: "2026-11-16",
      publicDescription:
        "Matte forest-green insulated stainless bottle found on a shaded bench along the lawn.",
      privateVerificationDetails: "Small compass sticker stuck underneath the base.",
      additionalNotes: "Held at the West Quad Recreation Center Lost & Found.",
      imageUrl: "/images/bottle.webp",
      status: "recovered",
    },
    {
      id: "found-backpack",
      userId: "usr-demo-3",
      title: "Charcoal Canvas Backpack",
      category: "Bags",
      campusZone: "North Hall",
      location: "North Hall, Atrium Seating",
      dateFound: "2026-11-14",
      publicDescription:
        "Minimalist dark canvas commuter backpack turned in after remaining in the atrium overnight.",
      privateVerificationDetails: "Contains an organic chemistry lab manual and blue zip pencil case.",
      additionalNotes: "Stored with Campus Security at North Hall Annex.",
      imageUrl: "/images/bag.webp",
      status: "claim_requested",
    },
    {
      id: "found-lanyard",
      userId: "usr-demo-3",
      title: "Campus Access Card & Lanyard",
      category: "ID & Cards",
      campusZone: "Commons Café",
      location: "Commons Café, Counter Pickup Area",
      dateFound: "2026-11-11",
      publicDescription:
        "Campus access card on a woven green lanyard turned in at the café counter.",
      privateVerificationDetails: "Cardholder identity verified only in person at Card Services.",
      additionalNotes: "Held securely at the Campus Card Services Office.",
      imageUrl: "/images/id.webp",
      status: "available",
    },
  ];

  return raw.map((item) => ({
    ...item,
    submissionHash: computeSubmissionHash([
      "found",
      item.title,
      item.category,
      item.campusZone,
      item.dateFound,
    ]),
    createdAt: `${item.dateFound}T16:00:00.000Z`,
    updatedAt: `${item.dateFound}T16:00:00.000Z`,
  }));
}

function createSeedClaims() {
  const raw = [
    {
      id: "clm-demo-1",
      itemType: "found",
      lostItemId: null,
      foundItemId: "found-backpack",
      claimantUserId: "usr-demo-1",
      claimantName: "Aarav Sharma",
      claimantEmail: "aarav.sharma@university.edu",
      approximateDateLost: "2026-11-14",
      locationLost: "North Hall Atrium near the east staircase",
      verificationDetails:
        "Inside the front pocket there is a blue zip pencil case and my organic chemistry lab manual.",
      additionalExplanation: "I left it after my Friday afternoon study session.",
      status: "claim_requested",
      reviewerNotes: null,
      handoverConfirmedAt: null,
      createdAt: "2026-11-15T10:30:00.000Z",
    },
    {
      id: "clm-demo-2",
      itemType: "found",
      lostItemId: null,
      foundItemId: "found-bottle",
      claimantUserId: "usr-demo-2",
      claimantName: "Maya Lin",
      claimantEmail: "maya.lin@university.edu",
      approximateDateLost: "2026-11-16",
      locationLost: "West Quad south lawn bench",
      verificationDetails:
        "It has a small compass decal stuck underneath the base.",
      additionalExplanation: null,
      status: "recovered",
      reviewerNotes: "Verified in person at West Quad desk and handed over.",
      handoverConfirmedAt: "2026-11-17T11:00:00.000Z",
      createdAt: "2026-11-17T09:15:00.000Z",
    },
  ];

  return raw.map((claim) => ({
    ...claim,
    submissionHash: computeSubmissionHash([
      "claim",
      claim.itemType,
      claim.lostItemId || claim.foundItemId,
      claim.claimantEmail || claim.claimantUserId || claim.claimantName,
    ]),
    updatedAt: claim.handoverConfirmedAt || claim.createdAt,
  }));
}

module.exports = {
  createSeedUsers,
  createSeedLostItems,
  createSeedFoundItems,
  createSeedClaims,
};
