import { IPlugin } from 'fatina';
import { AnimatorManager } from './manager/animatorManager';
import { TickerManager } from './manager/tickerManager';

export function get(): IPlugin {
	return new FatinaPluginAnimator();
}

export interface IPluginAnimator {
	animatorManager: AnimatorManager;
	tickerManager: TickerManager;
}

export class FatinaPluginAnimator implements IPlugin {
	public readonly name = 'fatina-plugin-animator';
	private fatina: any;
	private initialized = false;

	public get tickerManager() {
		return this.fatina.plugin.tickerManager;
	}

	public get animatorManager() {
		return this.fatina.plugin.animatorManager;
	}

	public init(fatina: any) {
		if (this.initialized) {
			throw new Error('Try to init the plugin twice : ' + name);
		}

		if (fatina === undefined || fatina === null || fatina.plugin === null) {
			throw new Error('Try to init the plugin without fatina : ' + name);
		}

		this.fatina = fatina;
		this.initialized = true;
		fatina.plugin.animatorManager = new AnimatorManager(this);
		fatina.plugin.tickerManager = new TickerManager(this);
	}
}
