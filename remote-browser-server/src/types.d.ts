declare module 'express' {
  interface Request {
    url?: string;
    body?: any;
    params: Record<string, string>;
    headers: Record<string, string | undefined>;
  }
  interface Response {
    json(body: any): Response;
    status(code: number): Response;
  }
  interface Application {
    use(middleware: any): void;
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void;
    delete(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void;
    listen(port: number, callback?: () => void): any;
  }
  function express(): Application;
  namespace express {
    function json(options?: { limit?: string }): any;
  }
  export = express;
}

declare module 'cors' {
  function cors(): any;
  export = cors;
}

declare module 'ws' {
  import { EventEmitter } from 'events';
  class WebSocket extends EventEmitter {
    close(): void;
    send(data: string | Buffer): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  class WebSocketServer extends EventEmitter {
    constructor(options: { server: any; path?: string });
    on(event: string, listener: (...args: any[]) => void): this;
  }
  export default WebSocket;
  export { WebSocket, WebSocketServer };
}
