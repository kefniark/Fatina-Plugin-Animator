import { IControl} from 'fatina';
import { AnimatorManager } from '../manager/animatorManager';

export interface IAnimationParams {
	group?: string;
	unstoppable?: boolean;
	finalValue?: boolean;
	next?: string
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
	private object: any;
	private currentAnimName: { [id: string]: string } = {};
	private animatorManager: AnimatorManager;
	private animGroupMap: { [id: string]: string } = {};
	private animTransitionMap: { [id: string]: string } = {};
	private animFinalValueMap: { [id: string]: boolean } = {};
	private animUnstoppableMap: { [id: string]: boolean } = {};

	// events
	private eventStart: { [id: string]: {(): void}[] } = {};
	private eventOnceStart: { [id: string]: {(): void}[] } = {};
	private eventComplete: { [id: string]: {(): void}[] } = {};
	private eventOnceComplete: { [id: string]: {(): void}[] } = {};

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
	public AddAnimation(name: string, animationName: string, options?: IAnimationParams | any, params?: any): Animator {
		const anim: any = this.animatorManager.Instantiate(animationName, this.object, params);
		return this.AddCustomAnimation(name, options || {}, anim);
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
	public AddCustomAnimation(name: string, options: IAnimationParams | any, tween: IControl): Animator {
		const anim: any = tween;
		anim.OnStart(() => {
			this.EmitEvent(this.eventStart[name]);
			if (name in this.eventOnceStart) {
				this.EmitEvent(this.eventOnceStart[name])
				this.eventOnceStart[name] = [];
			}
		});
		anim.OnKilled(() => {
			anim.Recycle();
			this.EmitEvent(this.eventComplete[name])
			if (name in this.eventOnceComplete) {
				this.EmitEvent(this.eventOnceComplete[name])
				this.eventOnceComplete[name] = [];
			}
		});
		anim.OnComplete(() => {
			anim.Recycle();

			this.EmitEvent(this.eventComplete[name])
			if (name in this.eventOnceComplete) {
				this.EmitEvent(this.eventOnceComplete[name])
				this.eventOnceComplete[name] = [];
			}

			if (name in this.animTransitionMap) {
				this.Play(this.animTransitionMap[name]);
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

	private Emit(func: any, args: any) {
		try {
			func.apply(this, args);
		} catch (e) {
			console.warn(e);
		}
	}

	private EmitEvent(listeners: any, args?: any) {
		if (!listeners) {
			return;
		}

		for (let i = 0; i < listeners.length; i++) {
			this.Emit(listeners[i], args);
		}
	}

	public OnStartAll(name: string, cb: () => void): Animator {
		if (name in this.eventStart) {
			this.eventStart[name].push(cb);
		} else {
			this.eventStart[name] = [cb];
		}
		return this;
	}

	public OnStart(name: string, cb: () => void): Animator {
		if (name in this.eventOnceStart) {
			this.eventOnceStart[name].push(cb);
		} else {
			this.eventOnceStart[name] = [cb];
		}
		return this;
	}

	public OnCompleteAll(name: string, cb: () => void): Animator {
		if (name in this.eventComplete) {
			this.eventComplete[name].push(cb);
		} else {
			this.eventComplete[name] = [cb];
		}
		return this;
	}

	public OnComplete(name: string, cb: () => void): Animator {
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
	public Play(name: string, onComplete?: () => void): void {
		if (!(name in this.animations)) {
			throw new Error('this animation doesnt exist ' + name);
		}

		const layerName = this.animGroupMap[name];
		let current = this.current[layerName];

		// Block any unstoppable running anim
		if (current && current.IsRunning() && this.animUnstoppableMap[this.currentAnimName[layerName]]) {
			console.log('This animation already run and is unstoppable', this.currentAnimName[layerName], '->', name);
			return;
		}

		// Stop any previous animation on this layer
		if (current && (current.IsRunning() || current.IsPaused())) {
			const currentAnimName = this.currentAnimName[layerName];
			(current as any).Skip(this.animFinalValueMap[currentAnimName]);
			this.current[layerName] = undefined;
		}

		// Start the right animation
		current = this.animations[name];
		this.current[layerName] = current;
		this.currentAnimName[layerName] = name;

		if (onComplete) {
			this.OnComplete(name, onComplete);
		}

		current.Start();
		return;
	}

	public Pause(group?: string): void {
		const layerName = !group ? 'default' : group;
		const current = this.current[layerName];
		if (current && current.IsRunning()) {
			current.Pause();
		}
	}

	public PauseAll() {
		for (const layerId of this.groups) {
			this.Pause(layerId);
		}
	}

	public Resume(group?: string): void {
		const layerName = !group ? 'default' : group;
		const current = this.current[layerName];
		if (current && current.IsPaused()) {
			current.Resume();
		}
	}

	public ResumeAll() {
		for (const layerId of this.groups) {
			this.Resume(layerId);
		}
	}

	public Stop(group?: string): void {
		const layerName = !group ? 'default' : group;
		const current = this.current[layerName];
		if (current && !current.IsFinished()) {
			const currentAnimName = this.currentAnimName[layerName];
			(current as any).Skip(this.animFinalValueMap[currentAnimName]);
			this.current[layerName] = undefined;
		}
	}

	public StopAll() {
		for (const layerId of this.groups) {
			this.Stop(layerId);
		}
	}

	/**
	 * Used to destroy this animation and stop all the tweens
	 *
	 * @memberOf Animator
	 */
	public Destroy() {
		for (const layerId of this.groups) {
			const current = this.current[layerId];
			if (current && !current.IsFinished()) {
				current.Kill();
			}
		}

		this.animations = {};
		this.animGroupMap = {};
		this.animFinalValueMap = {};
		this.animUnstoppableMap = {};
		this.current = {};
		this.currentAnimName = {};
		delete this.object.Animator;
	}
}
