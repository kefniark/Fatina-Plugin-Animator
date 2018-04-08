import { ITicker } from 'fatina';
import { IPluginAnimator } from '../index';

/**
 * This manager is just there to keep reference to ticker by name
 *
 * @export
 * @class TickerManager
 */
export class TickerManager {
	private readonly plugin: IPluginAnimator;
	private readonly tickers: { [id: string]: ITicker } = {};

	constructor(plugin: IPluginAnimator) {
		this.plugin = plugin;
	}

	public get(name: string): ITicker {
		if (this.tickers[name]) {
			return this.tickers[name];
		}

		this.tickers[name] = (this.plugin as any).fatina.ticker();
		return this.tickers[name];
	}

	public pauseAll(name: string): void {
		if (this.tickers[name]) {
			this.tickers[name].pause();
		}
	}

	public resumeAll(name: string): void {
		if (this.tickers[name]) {
			this.tickers[name].resume();
		}
	}

	public killAll(name: string): void {
		if (this.tickers[name]) {
			this.tickers[name].kill();
			delete this.tickers[name];
		}
	}
}
