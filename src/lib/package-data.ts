// Package size tiers. Only "Medium" (₦1,200) is confirmed, backed out from
// the Send a Package screenshot's total (₦2,800 base + ₦1,200 size +
// ₦500 fragile = ₦4,500 ✓). The other three tiers' fees are estimated on
// a reasonable increasing scale — flag before launch.
export const PACKAGE_SIZES = [
  { id: "small", label: "Small", range: "Up to 2kg", feeNaira: 0 },
  { id: "medium", label: "Medium", range: "2 – 8kg", feeNaira: 1200 },
  { id: "large", label: "Large", range: "8 – 20kg", feeNaira: 2200 },
  { id: "bulk", label: "Bulk", range: "20kg +", feeNaira: 3500 },
] as const;

export const FRAGILE_HANDLING_FEE = 500;

export const PACKAGE_CATEGORIES = [
  "Documents & electronics",
  "Clothing & textiles",
  "Food & perishables",
  "Books & stationery",
  "Other",
];
