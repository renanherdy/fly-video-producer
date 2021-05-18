import io from "socket.io-client";

export async function produceScene(scene: {
  name: string,
  event: { payload: { outSceneName: string } };
}): Promise<{ outSceneName: string; resultPath: string }> {
  return new Promise((resolve, reject) => {
    const socket = io("ws://localhost:3001", {
      transports: ["websocket"],
      reconnection: false
    });
    scene.event.payload.outSceneName = scene.name;
    socket.emit("start-cutIntoSlices", scene.event.payload);
    socket.on(
      "end-cutIntoSlices-" + scene.event.payload.outSceneName,
      (payload: any) => {
        socket.close();
        resolve(payload);
      }
    );
  });
}
