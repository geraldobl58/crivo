const PLAN_COOKIE = "crivo_plan_type";
const PLAN_ID_COOKIE = "crivo_plan_id";
const MAX_AGE = 60 * 60; // 1 hour

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;path=/;max-age=0`;
}

export function savePlanSelection(planType: string, planId?: string) {
  setCookie(PLAN_COOKIE, planType, MAX_AGE);
  if (planId) setCookie(PLAN_ID_COOKIE, planId, MAX_AGE);
  // Keep sessionStorage as fallback
  try {
    sessionStorage.setItem("plan_type", planType);
    if (planId) sessionStorage.setItem("plan_id", planId);
  } catch {
    // SSR or storage blocked
  }
}

export function getPlanSelection(): {
  planType: string | null;
  planId: string | null;
} {
  // Cookie takes priority (survives auth redirects)
  const planType = getCookie(PLAN_COOKIE) ?? safeSessionGet("plan_type");
  const planId = getCookie(PLAN_ID_COOKIE) ?? safeSessionGet("plan_id");
  return { planType, planId };
}

export function clearPlanSelection() {
  deleteCookie(PLAN_COOKIE);
  deleteCookie(PLAN_ID_COOKIE);
  try {
    sessionStorage.removeItem("plan_type");
    sessionStorage.removeItem("plan_id");
  } catch {
    // SSR or storage blocked
  }
}

function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
