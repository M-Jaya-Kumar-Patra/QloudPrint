import SockJS from "sockjs-client";

import { Client } from "@stomp/stompjs";

const socket = new SockJS(
    `${import.meta.env.VITE_BASE_URL}/ws`
);

const stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
});

export default stompClient;