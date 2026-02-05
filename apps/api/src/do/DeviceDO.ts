import type { Env } from '../env';

export class DeviceDO implements DurableObject {
	private readonly state: DurableObjectState;
	private socket: WebSocket | null = null;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		void env;
	}

	async fetch(request: Request): Promise<Response> {
		if (request.headers.get('Upgrade') === 'websocket') {
			const pair = new WebSocketPair();
			const [client, server] = Object.values(pair);
			server.accept();

			this.socket = server;
			server.addEventListener('close', () => {
				if (this.socket === server) this.socket = null;
			});

			// Minimal: presence channel / future command routing.
			return new Response(null, { status: 101, webSocket: client });
		}

		const url = new URL(request.url);
		if (request.method === 'GET' && url.pathname === '/status') {
			return new Response(JSON.stringify({ connected: Boolean(this.socket) }), {
				status: 200,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		return new Response('not found', { status: 404 });
	}
}
