export function trackEvent(eventName, params = {}) {
	try {
		// Replace with real analytics (e.g., Segment, Amplitude, Supabase)
		console.log(`[analytics] ${eventName}`, params);
	} catch {}
}