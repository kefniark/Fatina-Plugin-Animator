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
	private animations: { [id: string]: (object: any, params?: any) => IControl; } = {};
	private tickerMap: { [id: string]: string; } = {};

	public get Animations(): string[] {
		return Object.keys(this.animations);
	}

	public get Labels(): string[] {
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
	public Register(name: string, onCreate: (object: any, params?: any) => IControl, tickerName?: string): AnimatorManager {
		if (this.animations[name] && this.tickerMap[name]) {
			delete this.tickerMap[name];
		}
		this.animations[name] = onCreate;
		if (tickerName) {
			this.tickerMap[name] = tickerName;
		}
		return this;
	}

	public Instantiate(name: string, object: any, params?: any): IControl {
		if (!(name in this.animations)) {
			throw new Error('this animation doesnt exist ' + name);
		}

		const tween = this.animations[name](object, params);
		if (this.tickerMap[name]) {
			(tween as any).SetParent(this.plugin.TickerManager.Get(this.tickerMap[name]));
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
	public AddAnimatorTo(obj: any): Animator {
		if (!obj.Animator) {
			obj.Animator = new Animator(obj, this);
		}
		return obj.Animator;
	}
}
