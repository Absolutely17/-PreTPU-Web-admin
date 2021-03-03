export namespace CKEditor4 {

  export interface Config {
    [key: string]: any;
  }

  export interface Editor {
    [key: string]: any;
  }

  export const enum EditorType {
    INLINE = 'inline',
    CLASSIC = 'classic'
  }

  export interface EventInfo {
    readonly name: string;
    readonly editor: any;
    readonly data: {
      [key: string]: any;
    };
    readonly listenerData: {
      [key: string]: any;
    };
    readonly sender: {
      [key: string]: any;
    };

    cancel(): void;

    removeListener(): void;

    stop(): void;
  }
}
