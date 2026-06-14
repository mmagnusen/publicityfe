import Pusher from "pusher-js";

let pusher: Pusher | null = null;

declare global {
	interface Window {
		pusher: any;
	}
}

if (typeof window !== "undefined") {
	if (!window.pusher) {
		window.pusher = new Pusher(String(process.env.NEXT_PUBLIC_PUSHER_KEY), {
			cluster: String(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
		});
	}
	pusher = window?.pusher;
}

export default pusher;
