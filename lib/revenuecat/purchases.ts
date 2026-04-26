import { Purchases } from "@revenuecat/purchases-js";

let purchases: Purchases | null = null;

export function initRevenueCat(userId: string) {
  if (purchases) return purchases;
  purchases = Purchases.configure(
    process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
    userId,
  );
  return purchases;
}

export async function getOfferings() {
  if (!purchases) throw new Error("RevenueCat not initialized");
  return await purchases.getOfferings();
}

export async function purchasePro(userId: string) {
  const rc = initRevenueCat(userId);
  const offerings = await rc.getOfferings();
  const proPackage = offerings.current?.availablePackages[0];
  if (!proPackage) throw new Error("No package found");
  return await rc.purchase({ rcPackage: proPackage });
}
