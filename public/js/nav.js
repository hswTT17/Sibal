import { getSystemAlerts } from "./api.js";

export function initHeaderBell() {
  const bell = document.getElementById("headerBell");
  if (!bell) return;
  const alerts = getSystemAlerts();
  bell.classList.toggle("has-alert", Boolean(alerts.rewardReminder || alerts.hotDeal));
}
