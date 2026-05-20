export const VERIFICATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
};

export function isMerchantVerified(spot) {
  return spot?.verification_status === VERIFICATION_STATUS.VERIFIED;
}

export function merchantCanOperate(spot) {
  return isMerchantVerified(spot);
}
