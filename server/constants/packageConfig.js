export const DEFAULT_PACKAGE_TIERS = [
  { sessions: 3, discountPercent: 0, label: '3 Sessions' },
  { sessions: 5, discountPercent: 0, label: '5 Sessions' },
  { sessions: 10, discountPercent: 0, label: '10 Sessions' }
];

export const PACKAGE_CONFIG = {
  minSessions: 2,
  maxSessions: 20,
  defaultTiers: DEFAULT_PACKAGE_TIERS,
  slotHoldMinutes: 15,
  minGapDays: 0 // No mandatory gap by default
};
