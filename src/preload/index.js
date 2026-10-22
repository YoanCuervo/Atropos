import { contextBridge } from "electron";

const atroposApi = {};

contextBridge.exposeInMainWorld("atropos", atroposApi);
