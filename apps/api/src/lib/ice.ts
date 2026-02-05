type IceServer = { urls: string[]; username?: string; credential?: string };

export function getIceServers(env: { ICE_SERVERS_JSON?: string }): IceServer[] {
	if (env.ICE_SERVERS_JSON) {
		try {
			const parsed = JSON.parse(env.ICE_SERVERS_JSON) as unknown;
			if (Array.isArray(parsed)) return parsed as IceServer[];
		} catch {
			// ignore
		}
	}
	return [{ urls: ['stun:stun.l.google.com:19302'] }];
}
