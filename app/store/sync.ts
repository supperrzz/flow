import { ApiPath, STORAGE_KEY, StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import {
  AppState,
  getLocalAppState,
  GetStoreState,
  mergeAppState,
  setLocalAppState,
} from "../utils/sync";
import { downloadAs, readFromFile } from "../utils";
import { showToast } from "../components/ui-lib";
import Locale from "../locales";
import { createSyncClient, ProviderType } from "../utils/cloud";
import { corsPath } from "../utils/cors";

export interface WebDavConfig {
  server: string;
  username: string;
  password: string;
}

export type SyncStore = GetStoreState<typeof useSyncStore>;

const DEFAULT_SYNC_STATE = {
  provider: ProviderType.Supabase,
  useProxy: true,
  proxyUrl: "",

  webdav: {
    endpoint: "",
    username: "",
    password: "",
  },

  upstash: {
    endpoint: "",
    username: STORAGE_KEY,
    apiKey: "",
  },

  supabase: {
    endpoint: "",
    apiKey: "",
  },

  lastSyncTime: 0,
  lastProvider: "",
};

export const useSyncStore = createPersistStore(
  DEFAULT_SYNC_STATE,
  (set, get) => ({
    coundSync() {
      const config = get()[get().provider];
      return Object.values(config).every((c) => c.toString().length > 0);
    },

    markSyncTime() {
      set({ lastSyncTime: Date.now(), lastProvider: get().provider });
    },

    export() {
      const state = getLocalAppState();
      const fileName = `Backup-${new Date().toLocaleString()}.json`;
      downloadAs(JSON.stringify(state), fileName);
    },

    async import() {
      const rawContent = await readFromFile();

      try {
        const remoteState = JSON.parse(rawContent) as AppState;
        const localState = getLocalAppState();
        mergeAppState(localState, remoteState);
        setLocalAppState(localState);
        await this.saveToRemote();
        location.reload();
      } catch (e) {
        console.error("[Import]", e);
        showToast(Locale.Settings.Sync.ImportFailed);
      }
    },

    getClient() {
      const client = createSyncClient(ProviderType.Supabase, get());
      return client;
    },

    async sync() {
      const localState = getLocalAppState();
      const provider = get().provider;
      const config = get()[provider];
      const client = this.getClient();

      try {
        const remoteState = JSON.parse(await client.get()) as AppState;
        mergeAppState(localState, remoteState);
        setLocalAppState(localState);
        console.log("[Sync] remote state synced successfully");
      } catch (e) {
        console.log("[Sync] failed to get remote state", e);
      }

      await client.set(JSON.stringify(localState));

      this.markSyncTime();
    },

    async saveToRemote() {
      const localState = getLocalAppState();
      const client = this.getClient();

      await client.set(JSON.stringify(localState));
      console.log("[Sync] local state saved to remote");
      this.markSyncTime();
    },

    async loadFromRemote() {
      const client = this.getClient();
      const remoteState = JSON.parse(await client.get()) as AppState;
      const localState = getLocalAppState();
      mergeAppState(localState, remoteState);
      setLocalAppState(localState);
      this.markSyncTime();
    },

    async check() {
      const client = this.getClient();
      return await client.check();
    },

    reset() {
      set(DEFAULT_SYNC_STATE);
    },
  }),
  {
    name: StoreKey.Sync,
    version: 1.1,

    migrate(persistedState, version) {
      const newState = persistedState as typeof DEFAULT_SYNC_STATE;

      if (version < 1.1) {
        newState.upstash.username = STORAGE_KEY;
      }

      return newState as any;
    },
  },
);
