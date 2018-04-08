import { IControl} from 'fatina';
import { Animator } from '../animator/animator';
import { FatinaPluginAnimator } from '../index';

/**
 * This manager is there to store shared animations and instantiate them
 *
 * @export
 * @class AnimatorManager
 */
export class AnimatorManager {
	private plugin: FatinaPluginAnimator;
	private anims: { [id: string]: (object: any, params?: any) => IControl; } = {};
	private tickerMap: { [id: string]: string; } = {};

	public get animations(): string[] {
		return Object.keys(this.anims);
	}

	public get labels(): string[] {
		return Object.keys(this.tickerMap).map((x: string) => this.tickerMap[x]).filter((piece, index, self) => self.indexOf(piece) === index);
	}

	constructor(plugin: FatinaPluginAnimator) {
		this.plugin = plugin;
	}

	/**
	 * Method used to register a new animation
	 *
	 * @param {string} name
	 * @param {(object: any, params?: any) => IControl} onCreate
	 * @param {string} [tickerName]
	 * @returns {AnimatorManager}
	 *
	 * @memberOf AnimatorManager
	 */
	public register(name: string, onCreate: (object: any, params?: any) => IControl, tickerName?: string): AnimatorManager {
		if (this.anims[name] && this.tickerMap[name]) {
			delete this.tickerMap[name];
		}
		this.anims[name] = onCreate;
		if (tickerName) {
			this.tickerMap[name] = tickerName;
		}
		return this;
	}

	public instantiate(name: string, object: any, params?: any): IControl {
		if (!(name in this.anims)) {
			throw new Error('this animation doesnt exist ' + name);
		}

		const tween = this.anims[name](object, params);
		if (this.tickerMap[name]) {
			(tween as any).setParent(this.plugin.tickerManager.get(this.tickerMap[name]));
		}

		return tween;
	}

	/**
	 * Method used to add a component animator to any object
	 *
	 * @param {*} obj
	 * @returns {Animator}
	 *
	 * @memberOf AnimatorManager
	 */
	public addAnimatorTo(obj: any): Animator {
		if (!obj.animator) {
			obj.animator = new Animator(obj, this);
		}
		return obj.animator;
	}
}
