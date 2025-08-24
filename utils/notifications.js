import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions() {
	const { status } = await Notifications.getPermissionsAsync();
	if (status !== 'granted') {
		await Notifications.requestPermissionsAsync();
	}
}

export async function sendImmediateNotification(title, body) {
	await Notifications.scheduleNotificationAsync({
		content: { title, body },
		trigger: null,
	});
}

export async function scheduleReminderNotification(title, body, secondsFromNow = 60) {
	await Notifications.scheduleNotificationAsync({
		content: { title, body },
		trigger: { seconds: secondsFromNow },
	});
}