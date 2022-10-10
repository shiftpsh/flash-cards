import {
  Array as ArrayType,
  Literal,
  Number as NumberType,
  Record,
  Static,
  String as StringType
} from "runtypes";

const Integer = NumberType.withConstraint((n) => Number.isInteger(n));

const StoreBase = Record({
  version: Integer.withConstraint((x) => x >= 1),
});

const StoreV1 = StoreBase.extend({
  version: Literal(1),
  bookmark: ArrayType(
    Record({
      word: StringType,
      furigana: StringType,
      meaning: StringType,
    })
  ),
  logs: ArrayType(
    Record({
      word: StringType,
      o: Integer,
      x: Integer,
    })
  ),
});

const StoreV2 = StoreBase.extend({
  version: Literal(2),
  bookmark: ArrayType(
    Record({
      word: StringType,
      furigana: StringType,
      meaning: StringType,
    })
  ),
  wrongLogs: ArrayType(
    Record({
      word: StringType,
      furigana: StringType,
      meaning: StringType,
    })
  ),
});

export const Store = {
  base: StoreBase,
  1: StoreV1,
  2: StoreV2,
};

export const storeDefaults: {
  [T in keyof typeof Store]: Static<typeof Store[T]>;
} = {
  base: { version: 1 },
  1: { version: 1, bookmark: [], logs: [] },
  2: { version: 2, bookmark: [], wrongLogs: [] },
};

export const LATEST = 2;

export const saveStore = (store: Static<typeof Store[typeof LATEST]>) => {
  localStorage.setItem("store", JSON.stringify(store));
};

export const loadStore = (): Static<typeof Store[typeof LATEST]> => {
  try {
    const store = localStorage.getItem("store");
    if (store) {
      const parsed = Store.base.check(JSON.parse(store));
      const version = parsed.version;
      if (version === 1) {
        const { bookmark } = Store[version].check(parsed);
        const migrated = { version: 2 as const, bookmark, wrongLogs: [] };
        saveStore(migrated);
        return migrated;
      }
      if (version === LATEST) {
        return Store[LATEST].check(parsed);
      }
      // TODO: handle migration
    }
  } catch (e) {
    saveStore(storeDefaults[LATEST]);
  }
  return storeDefaults[LATEST];
};
