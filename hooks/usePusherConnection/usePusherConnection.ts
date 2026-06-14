import { useCallback, useEffect, useRef, useState } from "react";

import pusher from "@util/pusher";

export type PusherConnectionState =
	| "initialized"
	| "connecting"
	| "connected"
	| "disconnected"
	| "unavailable"
	| "failed"
	| "not set";

const DISCONNECTED_STATES: PusherConnectionState[] = [
	"disconnected",
	"unavailable",
	"failed",
];

const PENDING_STATES: PusherConnectionState[] = ["initialized", "connecting"];

type Options = {
	onReconnected?: () => void;
};

const readConnectionState = (): PusherConnectionState => {
	if (!pusher?.connection?.state) {
		return "not set";
	}
	return pusher.connection.state as PusherConnectionState;
};

const shouldAttemptConnect = (state: string) =>
	state === "disconnected" ||
	state === "unavailable" ||
	state === "failed" ||
	state === "initialized";

export const usePusherConnection = ({ onReconnected }: Options = {}) => {
	const [connectionState, setConnectionState] =
		useState<PusherConnectionState>(readConnectionState);
	const [hasConnectedOnce, setHasConnectedOnce] = useState(
		() => readConnectionState() === "connected",
	);
	const hadDisconnectedRef = useRef(false);
	const onReconnectedRef = useRef(onReconnected);

	onReconnectedRef.current = onReconnected;

	const attemptConnect = useCallback((client: NonNullable<typeof pusher>) => {
		if (!shouldAttemptConnect(client.connection.state)) {
			return;
		}

		try {
			client.connect();
		} catch {
			// Connection failures are surfaced in UI state; not logged as chat errors.
		}
	}, []);

	useEffect(() => {
		const client = pusher;
		if (!client) {
			return;
		}

		const syncConnectionState = () => {
			setConnectionState(readConnectionState());
		};

		const handleStateChange = (states: {
			previous: string;
			current: string;
		}) => {
			const current = states.current as PusherConnectionState;

			setConnectionState(current);

			if (current === "connected") {
				setHasConnectedOnce(true);

				if (hadDisconnectedRef.current) {
					hadDisconnectedRef.current = false;
					onReconnectedRef.current?.();
				}
				return;
			}

			if (DISCONNECTED_STATES.includes(current)) {
				hadDisconnectedRef.current = true;
				attemptConnect(client);
			}
		};

		syncConnectionState();
		if (client.connection.state === "connected") {
			setHasConnectedOnce(true);
		} else {
			attemptConnect(client);
		}

		client.connection.bind("state_change", handleStateChange);

		return () => {
			client.connection.unbind("state_change", handleStateChange);
		};
	}, [attemptConnect]);

	const retryConnection = useCallback(() => {
		const client = pusher;
		if (!client) {
			return;
		}

		try {
			client.connect();
		} catch {
			// User-initiated retry; UI banner reflects connection state.
		}
	}, []);

	const isPusherConnected = connectionState === "connected";
	const isPusherConnecting = connectionState === "connecting";
	const isPusherPending = PENDING_STATES.includes(connectionState);
	const isPusherDisconnected = DISCONNECTED_STATES.includes(connectionState);
	const isPusherReconnecting = isPusherConnecting && hasConnectedOnce;
	const isConnectingToPusher = isPusherConnecting && !hasConnectedOnce;
	const shouldShowConnectionBanner = !isPusherConnected && !isPusherPending;

	return {
		connectionState,
		hasConnectedOnce,
		isConnectingToPusher,
		isPusherConnected,
		isPusherConnecting,
		isPusherDisconnected,
		isPusherPending,
		isPusherReconnecting,
		pusherStatus: connectionState,
		retryConnection,
		shouldShowConnectionBanner,
	};
};
