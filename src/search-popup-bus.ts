type Events = "click";

class PopupBus {
  private static instance: PopupBus; // 싱글톤 인스턴스
  private EventBus: EventTarget;
  /**
   * 싱글튼이라 접근이 불가능해야 함.
   * 외부에서 new 불가능
   */
  private constructor() {
    const EventBus = new EventTarget();
    this.EventBus = EventBus;
  }
  // 항상 같은 인스턴스 반환
  public static getInstance(): PopupBus {
    if (!PopupBus.instance) {
      PopupBus.instance = new PopupBus();
    }
    return PopupBus.instance;
  }

  public emit<T>(event: Events, detail: T): void {
    const customEvent = new CustomEvent<T>(event, { detail });
    this.EventBus.dispatchEvent(customEvent);
  }
  // 이벤트 구독
  public on<T>(event: Events, handler: (detail: T) => void): void {
    this.EventBus.addEventListener(event, (e) => {
      handler((e as CustomEvent<T>).detail);
    });
  }
  //   HandleOnClick = () => {
  //     this.EventBus.dispatchEvent(
  //       new CustomEvent("A:done", { detail: "A 실행 완료" }),
  //     );
  //   };
}

export default PopupBus;
