import * as Fatina from 'fatina';
import * as test from 'tape';
import { Test } from 'tape';
import * as animator from '../src/index';
import { IPluginAnimator } from '../src/index';

Fatina.init(false);
Fatina.loadPlugin(animator.get());

const animatorPlugin = Fatina.plugin as IPluginAnimator;

function GetSprite(id: string): any {
	return { name: id, position: { x: 0, y: 0 }, alpha: 1 };
}

test('[Fatina.Animator] Test Init', (t: Test) => {
	const fatinaObj: any = {
		plugin: {}
	};
	const plugin = animator.get();

	t.throws(() => plugin.init(undefined), 'Check the plugin cant be init without fatina');

	plugin.init(fatinaObj);

	t.notEqual((plugin as any).tickerManager, undefined);
	t.notEqual((plugin as any).animatorManager, undefined);
	t.throws(() => plugin.init(fatinaObj), 'Check the plugin cant be init twice');

	t.end();
});

test ('[Fatina.Animator] Register new animations', (t: Test) => {
	// Register animations
	animatorPlugin.animatorManager
		.register('move', (obj: any) => Fatina.tween(obj, ['x']).to({ x: 2 }, 500))
		.register('jump', (obj: any) => {
			return Fatina.sequence()
				.append(Fatina.tween(obj.position, ['y']).setRelative(true).to({y: 5}, 200).setEasing('inQuad'))
				.append(Fatina.tween(obj.position, ['y']).to({y: 0}, 200).setEasing('outQuad'));
			})
		.register('blink', (obj: any) => {
			return Fatina.tween(obj, ['alpha']).to({alpha: 0}, 100).yoyo(3).setEasing('inOutSine');
		}, 'alpha')
		.register('fade', (obj: any, params: any) => {
			return Fatina.tween(obj, ['alpha']).to({alpha: params}, 250).setEasing('outQuad');
		}, 'alpha');

	t.equal(animatorPlugin.animatorManager.animations.length, 4, 'check all the animations are registered');
	t.equal(animatorPlugin.animatorManager.labels.length, 1, 'check there is one label registered');

	t.end();
});

test('[Fatina.Animator] Use animation', (t: Test) => {
	let started = 0;
	let updated = 0;
	let killed = 0;
	let completed = 0;

	// overwrite the previous move animation
	animatorPlugin.animatorManager.register('move', (obj: any, params: any) => {
		return Fatina.tween(obj.position, ['x']).setRelative(true).to({ x: params }, 500)
			.onStart(() => started++)
			.onUpdate(() => updated++)
			.onKilled(() => killed++)
			.onComplete(() => completed++);
	});

	// Use that on a sprite
	const sprite: any = GetSprite('testAnimation');
	const anim = animatorPlugin.animatorManager.addAnimatorTo(sprite)
		.addAnimation('moveRight', 'move', { group: 'move' }, 5)
		.addAnimation('moveLeft', 'move', { group: 'move' }, -5)
		.addAnimation('blink', 'blink', { finalValue: true})
		.addAnimation('blinkSkipable', 'blink');

	t.throws(() => anim.addAnimation('test', 'shouldcrash'));

	// Use it
	anim.play('moveLeft');
	Fatina.update(100);

	sprite.Animator.play('moveRight');
	Fatina.update(100);

	sprite.Animator.stop();
	sprite.Animator.play('moveLeft');

	Fatina.update(100);

	sprite.Animator.play('moveLeft');

	Fatina.update(100);

	sprite.Animator.stop();
	sprite.Animator.play('moveLeft');

	Fatina.update(600);

	t.equal(started, 5, 'check 4 move tween were started');
	t.equal(killed, 0, 'check no tween were killed');
	t.equal(completed, 5, 'check the were all completed');
	t.equal(sprite.position.x, -7, 'check the final position');

	t.throws(() => anim.play('unknown'));
	anim.stopAll();

	t.end();
});

test('[Fatina.Animator] Default Test', (t: Test) => {
	const sprite: any = GetSprite('testFinalValues');
	const anim = animatorPlugin.animatorManager.addAnimatorTo(sprite)
		.addCustomAnimation('test', undefined, Fatina.tween(sprite.position, ['x']).to({ x: 1}, 500));

	anim.play('test');
	Fatina.update(50);
	anim.pause();
	anim.resume();
	Fatina.update(50);
	anim.stop();

	t.equal(sprite.position.x, 0.2);
	t.end();
});

test('[Fatina.Animator] Test final values', (t: Test) => {
	const sprite: any = GetSprite('testFinalValues');
	const anim = animatorPlugin.animatorManager.addAnimatorTo(sprite)
		.addAnimation('blink', 'blink')
		.addAnimation('fadeIn', 'fade', { finalValue: true}, 1)
		.addAnimation('fadeOut', 'fade', { finalValue: true}, 0);

	anim.play('fadeOut');
	Fatina.update(50);
	anim.play('fadeIn');
	Fatina.update(50);
	anim.stop();

	t.equal(sprite.alpha, 1);

	anim.play('blink');
	Fatina.update(50);
	anim.stop();

	t.equal(sprite.alpha, 0.5);

	t.end();
});

test('[Fatina.Animator] Test Animator label', (t: Test) => {
	const sprite: any = GetSprite('testAnimatorLabel');
	const anim = animatorPlugin.animatorManager.addAnimatorTo(sprite)
		.addAnimation('moveRight', 'move', { group: 'move' }, 5)
		.addAnimation('moveLeft', 'move', { group: 'move' }, -5)
		.addAnimation('fadeIn', 'fade', { finalValue: true, group: 'alpha' }, 1)
		.addAnimation('fadeOut', 'fade', { finalValue: true, group: 'alpha' }, 0);

	anim.play('fadeOut');
	anim.play('moveRight');
	Fatina.update(125);

	t.equal(sprite.alpha, 0.25);
	t.equal(sprite.position.x, 1.25);

	anim.pause('alpha');
	Fatina.update(125);

	t.equal(sprite.alpha, 0.25);
	t.equal(sprite.position.x, 2.5);

	anim.resume('alpha');
	Fatina.update(25);
	anim.pauseAll();
	Fatina.update(100);
	anim.resumeAll();
	Fatina.update(100);

	t.equal(sprite.alpha, 0);
	t.equal(sprite.position.x, 3.75);

	anim.destroy();

	t.end();
});

test('[Fatina.Animator] Test TickManager label', (t: Test) => {
	const sprite1: any = GetSprite('testLabel');
	const sprite2: any = GetSprite('testLabel');
	const anim1 = animatorPlugin.animatorManager.addAnimatorTo(sprite1)
		.addAnimation('moveRight', 'move', { group: 'move' }, 5)
		.addAnimation('moveLeft', 'move', { group: 'move' }, -5)
		.addAnimation('fadeIn', 'fade', { finalValue: true, group: 'alpha' }, 1)
		.addAnimation('fadeOut', 'fade', { finalValue: true, group: 'alpha' }, 0);
	const anim2 = animatorPlugin.animatorManager.addAnimatorTo(sprite2)
		.addAnimation('moveRight', 'move', { group: 'move' }, 5)
		.addAnimation('moveLeft', 'move', { group: 'move' }, -5)
		.addAnimation('fadeIn', 'fade', { finalValue: true, group: 'alpha' }, 1)
		.addAnimation('fadeOut', 'fade', { finalValue: true, group: 'alpha' }, 0);

	anim1.play('fadeOut');
	anim1.play('moveLeft');
	anim2.play('fadeOut');
	anim2.play('moveRight');

	Fatina.update(50);

	animatorPlugin.tickerManager.pauseAll('alpha');

	Fatina.update(50);

	t.equal(sprite1.alpha, 0.64);
	t.equal(sprite2.alpha, 0.64);
	t.equal(sprite1.position.x, -1);
	t.equal(sprite2.position.x, 1);

	animatorPlugin.tickerManager.resumeAll('alpha');
	Fatina.update(50);

	t.equal(sprite1.alpha, 0.36);
	t.equal(sprite2.alpha, 0.36);
	t.equal(sprite1.position.x, -1.5);
	t.equal(sprite2.position.x, 1.5);

	animatorPlugin.tickerManager.killAll('alpha');
	Fatina.update(50);

	t.equal(sprite1.alpha, 0.36);
	t.equal(sprite2.alpha, 0.36);
	t.equal(sprite1.position.x, -2);
	t.equal(sprite2.position.x, 2);

	t.end();
});

test('[Fatina.Animator] Test Double Animation', (t: Test) => {
	let started = 0;
	let updated = 0;
	let killed = 0;
	let completed = 0;

	animatorPlugin.animatorManager.register('move', (obj: any, params: any) => {
		return Fatina.tween(obj.position, ['x']).setRelative(true).to({ x: params }, 500)
			.onStart(() => started++)
			.onUpdate(() => updated++)
			.onKilled(() => killed++)
			.onComplete(() => completed++);
	});

	const sprite1: any = GetSprite('testDouble');
	const anim1 = animatorPlugin.animatorManager.addAnimatorTo(sprite1)
		.addAnimation('moveRight', 'move', { group: 'move' }, 5)
		.addAnimation('moveLeft', 'move', { group: 'move' }, -5);

	anim1.play('moveLeft');
	Fatina.update(50);
	anim1.play('moveLeft');
	Fatina.update(500);
	Fatina.update(1);

	t.equal(started, 2);
	t.equal(killed, 0);
	t.equal(updated, 2);
	t.equal(completed, 2);
	t.equal(sprite1.position.x, -5.5, 'check the final position');

	t.end();
});

test('[Fatina.Animator] Test Transition', (t: Test) => {
	animatorPlugin.animatorManager.register('move', (obj: any, params: any) => {
		return Fatina.tween(obj.position, ['x']).setRelative(true).to({ x: params }, 500);
	}, 'newTicker');

	const sprite1: any = GetSprite('testTransition');
	const anim1 = animatorPlugin.animatorManager.addAnimatorTo(sprite1)
		.addAnimation('moveRight', 'move', { group: 'move', next: 'moveLeft' }, 5)
		.addAnimation('moveLeft', 'move', { group: 'move' }, -5)
		.onStartAll('moveRight', () => console.log('right start', sprite1.position))
		.onCompleteAll('moveRight', () => console.log('right complete', sprite1.position))
		.onStartAll('moveLeft', () => console.log('left start', sprite1.position))
		.onCompleteAll('moveLeft', () => console.log('left complete', sprite1.position));

	anim1.play('moveRight');
	Fatina.update(50);
	t.notEqual(sprite1.position.x, 0);
	Fatina.update(500);
	t.equal(sprite1.position.x, 5)

	Fatina.update(500);
	t.equal(sprite1.position.x, 0, 'check the final position');

	t.end();
});

test('[Fatina.Animator] Add Callback', (t: Test) => {
	animatorPlugin.animatorManager.register('move', (obj: any, params: any) => {
		return Fatina.tween(obj.position, ['x']).setRelative(true).to({ x: params }, 500);
	});

	let onStartRight = 0;
	let onStartRightOnce = 0;
	let onCompleteInline = 0;
	let onCompleteRight = 0;
	let onCompleteRightOnce = 0;
	const sprite1: any = GetSprite('testCallback');
	const anim1 = animatorPlugin.animatorManager.addAnimatorTo(sprite1)
		.addAnimation('moveRight', 'move', { group: 'move' }, 5)
		.addAnimation('moveLeft', 'move', { group: 'move' }, -5)
		.onStartAll('moveRight', () => onStartRight++)
		.onStartAll('moveRight', () => onStartRight++)
		.onStart('moveRight', () => onStartRightOnce++)
		.onStart('moveRight', () => onStartRightOnce++)
		.onCompleteAll('moveRight', () => onCompleteRight++)
		.onCompleteAll('moveRight', () => onCompleteRight++)
		.onComplete('moveRight', () => {
			throw new Error();
		})
		.onComplete('moveRight', () => onCompleteRightOnce++)
		.onComplete('moveRight', () => onCompleteRightOnce++)

	anim1.play('moveRight', () => onCompleteInline++);
	Fatina.update(50);
	t.equal(onStartRight, 2);
	t.equal(onStartRightOnce, 2);

	Fatina.update(500);
	t.equal(onStartRight, 2);
	t.equal(onStartRightOnce, 2);
	t.equal(onCompleteInline, 1);
	t.equal(onCompleteRight, 2);
	t.equal(onCompleteRightOnce, 2);

	anim1.play('moveRight');
	Fatina.update(600);

	t.equal(onStartRight, 4);
	t.equal(onStartRightOnce, 2);
	t.equal(onCompleteInline, 1);
	t.equal(onCompleteRight, 4);
	t.equal(onCompleteRightOnce, 2);

	anim1.play('moveRight', () => onCompleteInline++);
	Fatina.update(300);
	anim1.destroy();
	t.equal(onCompleteInline, 2);

	t.end();
});
