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

export const Store = {
  base: StoreBase,
  1: StoreV1,
};

export const storeDefaults: {
  [T in keyof typeof Store]: Static<typeof Store[T]>;
} = {
  base: { version: 1 },
  1: { version: 1, bookmark: [], logs: [] },
};

export const LATEST = 1;

export const saveStore = (store: Static<typeof Store[typeof LATEST]>) => {
  localStorage.setItem("store", JSON.stringify(store));
};

export const loadStore = (): Static<typeof Store[typeof LATEST]> => {
  try {
    const store = localStorage.getItem("store");
    if (store) {
      const parsed = Store.base.check(JSON.parse(store));
      const version = parsed.version;
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
