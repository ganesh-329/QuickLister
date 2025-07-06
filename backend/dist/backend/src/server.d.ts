declare const app: import("express-serve-static-core").Express;
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const io: import("socket.io").Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
declare function startServer(): Promise<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>;
export { app, startServer, httpServer, io };
//# sourceMappingURL=server.d.ts.map