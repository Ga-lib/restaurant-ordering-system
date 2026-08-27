export function getShareableMapLink(latitude, longitude) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export async function shareLocation(latitude, longitude, restaurantName) {
  const link = getShareableMapLink(latitude, longitude);
  const shareData = {
    title: restaurantName || "Restaurant Location",
    text: `Find us here: ${restaurantName || "our restaurant"}`,
    url: link,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return { method: "native" };
    } catch (err) {
      if (err.name === "AbortError") return { method: "cancelled" };
      // fall through to copy on other errors
    }
  }

  await navigator.clipboard.writeText(link);
  return { method: "copied" };
}