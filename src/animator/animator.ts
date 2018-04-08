import { IControl } from 'fatina';
import { AnimatorManager } from '../manager/animatorManager';

export interface IAnimationParams {
	group?: string;
	unstoppable?: boolean;
	finalValue?: boolean;
	next?: string;
}

/**
 * Animator component applied on a object.
 * This store a list of animations and manage them for that object
 *
 * @export
 * @class Animator
 */
export class Animator {
	// public properties
	public animations: { [id: string]: IControl; } = {};
	public current: { [id: string]: IControl | undefined } = {};
	public groups = ['default'];

	// private properties
	private readonly object: any;
	private currentAnimName: { [id: string]: string } = {};
	private readonly animatorManager: AnimatorManager;
	private animGroupMap: { [id: string]: string } = {};
	private readonly animTransitionMap: { [id: string]: string } = {};
	private animFinalValueMap: { [id: string]: boolean } = {};
	private animUnstoppableMap: { [id: string]: boolean } = {};

	// events
	private readonly eventStart: { [id: string]: {(): void}[] } = {};
	private readonly eventOnceStart: { [id: string]: {(): void}[] } = {};
	private readonly eventComplete: { [id: string]: {(): void}[] } = {};
	private readonly eventOnceComplete: { [id: string]: {(): void}[] } = {};

	constructor(obj: any, animatorManager: AnimatorManager) {
		this.object = obj;
		this.animatorManager = animatorManager;
	}

	/**
	 * Add a new Animation to this object
	 *
	 * @param {string} name
	 * @param {string} animationName
	 * @param {(IAnimationParams | any)} [options]
	 * @param {*} [params]
	 * @returns {Animator}
	 * @memberOf Animator
	 */
	public addAnimation(name: string, animationName: string, options?: IAnimationParams | any, params?: any): Animator {
		const anim: any = this.animatorManager.instantiate(animationName, this.object, params);
		return this.addCustomAnimation(name, options || {}, anim);
	}

	/**
	 * Add a new Tween to this object
	 *
	 * @param {string} name
	 * @param {(IAnimationParams | any)} options
	 * @param {IControl} tween
	 * @returns {Animator}
	 * @memberOf Animator
	 */
	public addCustomAnimation(name: string, options: IAnimationParams | any, tween: IControl): Animator {
		const anim: any = tween;

		anim.onStart(() => {
			this.emitEvent(this.eventStart[name]);
			if (name in this.eventOnceStart) {
				this.emitEvent(this.eventOnceStart[name]);
				this.eventOnceStart[name] = [];
			}
		});

		anim.onKilled(() => {
			anim.recycle();
			this.emitEvent(this.eventComplete[name]);
			if (name in this.eventOnceComplete) {
				this.emitEvent(this.eventOnceComplete[name]);
				this.eventOnceComplete[name] = [];
			}
		});

		anim.onComplete(() => {
			anim.recycle();

			this.emitEvent(this.eventComplete[name]);
			if (name in this.eventOnceComplete) {
				this.emitEvent(this.eventOnceComplete[name]);
				this.eventOnceComplete[name] = [];
			}

			if (name in this.animTransitionMap) {
				this.play(this.animTransitionMap[name]);
			}
		});

		this.animations[name] = anim;
		this.animFinalValueMap[name] = options ? !!options.finalValue : false;
		this.animUnstoppableMap[name] = options ? !!options.unstoppable : false;
		this.animGroupMap[name] = (options && options.group) ? options.group : 'default';
		if (options && options.next) {
			this.animTransitionMap[name] = options.next;
		}

		if (this.groups.indexOf(this.animGroupMap[name]) === -1) {
			this.groups.push(this.animGroupMap[name]);
		}

		return this;
	}

	private emit(func: any, args: any) {
		try {
			func.apply(this, args);
		} catch (e) {
			console.warn(e);
		}
	}

	private emitEvent(listeners: any, args?: any) {
		if (!listeners) {
			return;
		}

		for (const listener of listeners) {
			this.emit(listener, args);
		}
	}

	public onStartAll(name: string, cb: () => void): Animator {
		if (name in this.eventStart) {
			this.eventStart[name].push(cb);
		} else {
			this.eventStart[name] = [cb];
		}
		return this;
	}

	public onStart(name: string, cb: () => void): Animator {
		if (name in this.eventOnceStart) {
			this.eventOnceStart[name].push(cb);
		} else {
			this.eventOnceStart[name] = [cb];
		}
		return this;
	}

	public onCompleteAll(name: string, cb: () => void): Animator {
		if (name in this.eventComplete) {
			this.eventComplete[name].push(cb);
		} else {
			this.eventComplete[name] = [cb];
		}
		return this;
	}

	public onComplete(name: string, cb: () => void): Animator {
		if (name in this.eventOnceComplete) {
			this.eventOnceComplete[name].push(cb);
		} else {
			this.eventOnceComplete[name] = [cb];
		}
		return this;
	}

	/**
	 * Method used to play an animation
	 *
	 * @param {string} name
	 * @param {() => void} [onComplete]
	 * @returns {void}
	 *
	 * @memberOf Animator
	 */
	public play(name: string, onComplete?: () => void): void {
		if (!(name in this.animations)) {
			throw new Error('this animation doesnt exist ' + name);
		}

		const layerName = this.animGroupMap[name];
		let current = this.current[layerName];

		// Block any unstoppable running anim
		if (current && current.isRunning && this.animUnstoppableMap[this.currentAnimName[layerName]]) {
			console.log('This animation already run and is unstoppable', this.currentAnimName[layerName], '->', name);
			return;
		}

		// Stop any previous animation on this layer
		if (current && (current.isRunning || current.isPaused)) {
			const currentAnimName = this.currentAnimName[layerName];
			(current as any).skip(this.animFinalValueMap[currentAnimName]);
			this.current[layerName] = undefined;
		}

		// Start the right animation
		current = this.animations[name];
		this.current[layerName] = current;
		this.currentAnimName[layerName] = name;

		if (onComplete) {
			this.onComplete(name, onComplete);
		}

		current.start();
		return;
	}

	public pause(group?: string): void {
		const layerName = !group ? 'default' : group;
		const current = this.current[layerName];
		if (current && current.isRunning) {
			current.pause();
		}
	}

	public pauseAll() {
		for (const layerId of this.groups) {
			this.pause(layerId);
		}
	}

	public resume(group?: string): void {
		const layerName = !group ? 'default' : group;
		const current = this.current[layerName];
		if (current && current.isPaused) {
			current.resume();
		}
	}

	public resumeAll() {
		for (const layerId of this.groups) {
			this.resume(layerId);
		}
	}

	public stop(group?: string): void {
		const layerName = !group ? 'default' : group;
		const current = this.current[layerName];
		if (current && !current.isFinished) {
			const currentAnimName = this.currentAnimName[layerName];
			(current as any).skip(this.animFinalValueMap[currentAnimName]);
			this.current[layerName] = undefined;
		}
	}

	public stopAll() {
		for (const layerId of this.groups) {
			this.stop(layerId);
		}
	}

	/**
	 * Used to destroy this animation and stop all the tweens
	 *
	 * @memberOf Animator
	 */
	public destroy() {
		for (const layerId of this.groups) {
			const current = this.current[layerId];
			if (current && !current.isFinished) {
				current.kill();
			}
		}

		this.animations = {};
		this.animGroupMap = {};
		this.animFinalValueMap = {};
		this.animUnstoppableMap = {};
		this.current = {};
		this.currentAnimName = {};
		delete this.object.animator;
	}
}
