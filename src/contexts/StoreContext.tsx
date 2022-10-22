import { createContext, SetStateAction, useContext, useState } from "react";
import { Word } from "../types/word";
import { LATEST, loadStore, saveStore, storeDefaults } from "../utils/store";

type LatestStore = typeof storeDefaults[typeof LATEST];

interface ContextProps {
  store: LatestStore;
  setStore: (value: SetStateAction<LatestStore>) => void;
  bookmark: {
    list: Word[];
    add: (word: Word | Word[]) => void;
    remove: (word: string) => void;
    removeAll: () => void;
    has: (word: string) => boolean;
  };
  wrongLog: {
    list: Word[];
    add: (word: Word | Word[]) => void;
    remove: (word: string) => void;
    removeAll: () => void;
    has: (word: string) => boolean;
  };
}

export const StoreContext = createContext<ContextProps>(
  null as unknown as ContextProps
);

interface ProviderProps {
  children?: React.ReactNode;
}

export const StoreProvider = (props: ProviderProps) => {
  const { children } = props;
  const [memStore, setMemStore] = useState<LatestStore>(loadStore());

  const setStore = (newStore: SetStateAction<LatestStore>) => {
    if (typeof newStore === "function") {
      setMemStore((prevStore) => {
        const nextStore = newStore(prevStore);
        saveStore(nextStore);
        return nextStore;
      });
    } else {
      setMemStore(newStore);
      saveStore(newStore);
    }
  };

  const hasBookmark = (word: string) => {
    return memStore.bookmark.find((w) => w.word === word) !== undefined;
  };

  const addBookmark = (word: Word | Word[]) => {
    const words = Array.isArray(word) ? word : [word];
    const notInBookmarks = words.filter((w) => !hasBookmark(w.word));
    setStore((prevStore) => ({
      ...prevStore,
      bookmark: [...prevStore.bookmark, ...notInBookmarks],
    }));
  };

  const removeBookmark = (word: string) => {
    if (!hasBookmark(word)) return;
    setStore((prevStore) => ({
      ...prevStore,
      bookmark: prevStore.bookmark.filter((w) => w.word !== word),
    }));
  };

  const removeAllBookmarks = () => {
    setStore((prevStore) => ({
      ...prevStore,
      bookmark: [],
    }));
  };

  const hasWrongLog = (word: string) => {
    return memStore.wrongLogs.find((w) => w.word === word) !== undefined;
  };

  const addWrongLog = (word: Word | Word[]) => {
    const words = Array.isArray(word) ? word : [word];
    const notInWrongLogs = words.filter((w) => !hasWrongLog(w.word));
    setStore((prevStore) => ({
      ...prevStore,
      wrongLogs: [...prevStore.wrongLogs, ...notInWrongLogs],
    }));
  };

  const removeWrongLog = (word: string) => {
    if (!hasWrongLog(word)) return;
    setStore((prevStore) => ({
      ...prevStore,
      wrongLogs: prevStore.wrongLogs.filter((w) => w.word !== word),
    }));
  };

  const removeAllWrongLogs = () => {
    setStore((prevStore) => ({
      ...prevStore,
      wrongLogs: [],
    }));
  };

  return (
    <StoreContext.Provider
      value={{
        store: memStore,
        setStore,
        bookmark: {
          list: memStore.bookmark,
          add: addBookmark,
          has: hasBookmark,
          remove: removeBookmark,
          removeAll: removeAllBookmarks,
        },
        wrongLog: {
          list: memStore.wrongLogs,
          add: addWrongLog,
          has: hasWrongLog,
          remove: removeWrongLog,
          removeAll: removeAllWrongLogs,
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
