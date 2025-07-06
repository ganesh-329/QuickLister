import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
interface ServerOptions {
    httpServer: HTTPServer;
}
export declare function createSocketService({ httpServer }: ServerOptions): IOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export {};
//# sourceMappingURL=socketService.d.ts.map