import type { FaqItem, ProcessStep } from "@/types/item";

export const HOW_IT_WORKS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "Report",
    description:
      "Share a quick listing with a clear photo, the campus building where it was last seen or discovered, and key identifying details.",
  },
  {
    number: "02",
    title: "Discover",
    description:
      "Browse live lost and found feeds organized by location, category, and date so students and staff can spot matches immediately.",
  },
  {
    number: "03",
    title: "Reconnect",
    description:
      "Confirm ownership with private verification details and arrange a safe, convenient pickup right on campus.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do I report a lost item?",
    answer:
      "Open Report Lost Item, enter the item name, category, last seen campus location, date lost, and a brief public description. You can also upload a photo and add private identifying details that stay hidden from public listings.",
  },
  {
    question: "How do I report something I found?",
    answer:
      "Go to Report Found Item, describe the item's general appearance and where you found it, and store unique clues (like stickers, engravings, or inner contents) in the private verification field so only the rightful owner can claim it.",
  },
  {
    question: "How can I verify that an item belongs to me?",
    answer:
      "Open the found item's detail page, click Request Claim, and submit your approximate date lost, location lost, and private ownership verification answer. Authorized campus administrators compare your answer against confidential item clues.",
  },
  {
    question: "How do I track my claim?",
    answer:
      "Visit your User Dashboard or the item's detail page to see live status updates as your request moves from Claim Requested to Under Verification, Approved, and Recovered.",
  },
  {
    question: "What happens after my claim is approved?",
    answer:
      "Once an administrator approves your verification, visit the designated campus pickup desk with your student ID for physical handover. After handover is confirmed, the item is marked Recovered.",
  },
];
