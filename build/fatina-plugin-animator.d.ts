// Generated by dts-bundle v0.7.2
// Dependencies for this module:
//   ../fatina

import { IPlugin } from 'fatina';
import { IControl } from 'fatina';
import { ITicker } from 'fatina';

export function Get(): IPlugin;
export interface IPluginAnimator {
    AnimatorManager: AnimatorManager;
    TickerManager: TickerManager;
}
export class FatinaPluginAnimator implements IPlugin {
    readonly name: string;
    fatina: any;
    readonly TickerManager: any;
    readonly AnimatorManager: any;
    Init(fatina: any): void;
}

export class AnimatorManager {
    readonly Animations: string[];
    readonly Labels: string[];
    constructor(plugin: FatinaPluginAnimator);
    Register(name: string, onCreate: (object: any, params?: any) => IControl, label?: string): AnimatorManager;
    Instantiate(name: string, object: any, params?: any): IControl;
    AddAnimatorTo(obj: any): Animator;
}

export class TickerManager {
    constructor(plugin: IPluginAnimator);
    Get(name: string): ITicker;
    PauseAll(name: string): void;
    ResumeAll(name: string): void;
    KillAll(name: string): void;
}

export interface IAnimationParams {
    group?: string;
    unstoppable?: boolean;
    finalValue?: boolean;
}
export class Animator {
    animations: {
        [id: string]: IControl;
    };
    current: {
        [id: string]: IControl | undefined;
    };
    layers: string[];
    constructor(obj: any, animatorManager: AnimatorManager);
    AddAnimation(name: string, animationName: string, options?: IAnimationParams | any, params?: any): Animator;
    AddTransition(name1: string, name2: string): Animator;
    AddCustomAnimation(name: string, options: IAnimationParams | any, tween: IControl): Animator;
    Play(name: string): IControl;
    Pause(layer?: string): void;
    PauseAll(): void;
    Resume(layer?: string): void;
    ResumeAll(): void;
    Stop(layer?: string): void;
    StopAll(): void;
    Destroy(): void;
}

