import { animate } from 'motion/mini';
import { inView } from 'motion';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MOBILE_QUERY = '(max-width: 640px)';
const REVEAL_SELECTOR = '[data-scroll-reveal]';
const DESKTOP_OFFSET_PX = 28;
const MOBILE_OFFSET_PX = 16;
const REVEAL_DURATION = 0.64;
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;
/*
 * reveal 판정 범위.
 *
 * margin 은 화면 아래쪽을 잘라 "충분히 올라온 뒤에" 드러나게 한다. 잘라낸 띠
 * 안에 통째로 들어간 섹션은 화면에 보이는데도 opacity 0 으로 남는다 — 즉 이
 * 값이 곧 빈 화면이 될 수 있는 최대 높이다.
 *
 * -30% 는 모바일(844px)에서 253px 이라 마지막 '참가 신청' 섹션(199px)이
 * 통째로 들어갔다. 실측: y=2200 에서 199px 전부가 화면에 보이는데 기준선과
 * 겹치는 부분이 14.8px(요소의 7.4%)뿐이라 amount 0.15 를 넘지 못해 빈 화면이
 * 됐다. -12% 로 줄이면 같은 지점에서 겹침이 166.7px(83.8%)이 되고 띠도
 * 101px 로 작아져 섹션이 통째로 들어갈 여지가 사실상 사라진다.
 *
 * amount 는 비율 대신 'some'(1px 이라도 겹치면)을 쓴다. 비율 기준은 짧은
 * 섹션일수록 불리해서, 화면에 다 보이는 섹션이 기준을 못 넘는 위 상황을 만든다.
 */
const VIEW_AMOUNT = 'some' as const;
const VIEW_MARGIN = '0px 0px -12% 0px';

type RevealState = 'pending' | 'animating' | 'revealed';

type RevealTarget = {
  readonly element: HTMLElement;
};

export function initScrollReveal(): void {
  const targets: RevealTarget[] = [];
  const activeControls = new Set<ReturnType<typeof animate>>();
  let stopInView: VoidFunction | null = null;
  let revealDisabled = false;
  const clearRevealStyles = (element: HTMLElement): void => {
    element.style.opacity = '';
    element.style.transform = '';
    element.style.willChange = '';
  };
  const setRevealState = (element: HTMLElement, state: RevealState): void => {
    element.dataset.revealState = state;
  };
  const forceReveal = (): void => {
    stopInView?.();
    stopInView = null;
    for (const control of activeControls) control.stop();
    activeControls.clear();
    for (const target of targets) {
      clearRevealStyles(target.element);
      setRevealState(target.element, 'revealed');
    }
  };
  const disableAndReveal = (): void => {
    revealDisabled = true;
    forceReveal();
  };
  // no-excuse-ok: catch — 브라우저 진입 경계에서는 실패해도 본문을 숨기지 않는다.
  try {
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    if (reducedMotionMedia.matches) return;

    const mobileMedia = window.matchMedia(MOBILE_QUERY);
    targets.push(
      ...[...document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)].map(
        (element): RevealTarget => ({ element }),
      ),
    );

    const offset = (): number => (mobileMedia.matches ? MOBILE_OFFSET_PX : DESKTOP_OFFSET_PX);
    const startReveal = (target: RevealTarget): void => {
      if (revealDisabled || target.element.dataset.revealState !== 'pending') return;

      setRevealState(target.element, 'animating');
      target.element.style.willChange = 'opacity, transform';
      let control: ReturnType<typeof animate> | null = null;
      try {
        control = animate(
          target.element,
          {
            opacity: [0, 1],
            transform: [`translateY(${offset()}px)`, 'translateY(0px)'],
          },
          {
            duration: REVEAL_DURATION,
            ease: REVEAL_EASE,
            onComplete: () => {
              if (control) activeControls.delete(control);
              clearRevealStyles(target.element);
              setRevealState(target.element, 'revealed');
            },
          },
        );
        activeControls.add(control);
      } catch (error: unknown) {
        disableAndReveal();
        if (import.meta.env.DEV) {
          console.warn('[scroll-reveal] 애니메이션을 시작하지 못해 콘텐츠를 즉시 표시합니다.', error);
        }
      }
    };

    for (const target of targets) {
      setRevealState(target.element, 'pending');
      target.element.style.opacity = '0';
      target.element.style.transform = `translateY(${offset()}px)`;
    }
    stopInView = inView(
      REVEAL_SELECTOR,
      (element) => {
        const target = targets.find((candidate) => candidate.element === element);
        if (target) startReveal(target);
      },
      { amount: VIEW_AMOUNT, margin: VIEW_MARGIN },
    );

    reducedMotionMedia.addEventListener('change', () => {
      if (!reducedMotionMedia.matches || revealDisabled) return;
      disableAndReveal();
    });
    mobileMedia.addEventListener('change', () => {
      if (revealDisabled) return;
      for (const target of targets) {
        if (target.element.dataset.revealState === 'pending') {
          target.element.style.transform = `translateY(${offset()}px)`;
        }
      }
    });
  } catch (error: unknown) {
    disableAndReveal();
    if (import.meta.env.DEV) {
      console.warn('[scroll-reveal] 초기화에 실패해 콘텐츠를 즉시 표시합니다.', error);
    }
  }
}
