import { createContext, SetStateAction, useContext, useState } from "react";
import { Word } from "../types/word";
import { LATEST, loadStore, saveStore, storeDefaults } from "../utils/store";

type LatestStore = typeof storeDefaults[typeof LATEST];

interface ContextProps {
  store: LatestStore;
  setStore: (value: SetStateAction<LatestStore>) => void;
  bookmark: {
    add: (word: Word) => void;
    remove: (word: string) => void;
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

  const addBookmark = (word: Word) => {
    if (hasBookmark(word.word)) return;
    setStore((prevStore) => ({
      ...prevStore,
      bookmark: [...prevStore.bookmark, word],
    }));
  };

  const removeBookmark = (word: string) => {
    if (!hasBookmark(word)) return;
    setStore((prevStore) => ({
      ...prevStore,
      bookmark: prevStore.bookmark.filter((w) => w.word !== word),
    }));
  };

  return (
    <StoreContext.Provider
      value={{
        store: memStore,
        setStore,
        bookmark: {
          add: addBookmark,
          has: hasBookmark,
          remove: removeBookmark,
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
