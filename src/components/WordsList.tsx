import {
  Card,
  Container,
  List,
  ListItem,
  Space,
  Typo
} from "@solved-ac/ui-react";
import axios from "axios";
import { useState } from "react";
import tsv from "tsv";
import { useStore } from "../contexts/StoreContext";
import { Word } from "../types/word";
import { shuffle } from "../utils/shuffle";
import { loadStore } from "../utils/store";
import Flashcards from "./Flashcards";

const template = [
  ["bookmarks", "북마크"],
  ["wrongLog", "틀렸던 단어들"],
  // ["1a", "단어 리스트: 1A"],
  // ["1a-2", "단어 리스트: 1A 누락"],
  // ["s1a", "문장 리스트: 1A-1, 2"],
  // ["s1a2", "문장 리스트: 1A-3, 5, 6"],
  // ["1b", "문장 리스트: 1B"],
  // ["1b-1", "단어 리스트 (분할): 1B-1"],
  // ["1b-2", "단어 리스트 (분할): 1B-2"],
  // ["1b-3", "단어 리스트 (분할): 1B-3"],
  // ["1b-4", "단어 리스트 (분할): 1B-4"],
  // ["s1b1", "문장 리스트 (분할): 1B-1"],
  // ["s1b2", "문장 리스트 (분할): 1B-2"],
  // ["s1c1", "문장 리스트 (분할): 1C-1"],
  // ["s1c2", "문장 리스트 (분할): 1C-2"],
  // ["g1a", "문법 리스트: 1A"],
  // ["g1b", "문법 리스트: 1B"],
  // ["g1c", "문법 리스트: 1C"],
  // ["g1a1", "예문 리스트: 1A-1"],
  // ["g1a2", "예문 리스트: 1A-2"],
  // ["g1a3", "예문 리스트: 1A-3"],
  // ["g1b1", "예문 리스트: 1B-1"],
  // ["g1b2", "예문 리스트: 1B-2"],
  // ["g1c1", "예문 리스트: 1C"],
  ["1d-1", "단어 리스트 (분할): 1D-1"],
  ["s1d1", "문장 리스트: 1D"],
  ["g1d1", "예문 리스트: 1D"],
  ["2a-1", "단어 리스트 (분할): 2A-1"],
  ["s2a1", "문장 리스트: 2A"],
  ["g2a1", "예문 리스트: 2A"],
  ["s2b1", "문장 리스트: 2B"],
  ["g2b1", "예문 리스트: 2B"],
  ["s", "🎵"],
] as const;

const WordsList = () => {
  const store = useStore();
  const [key, setKey] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);

  const loadWords = async (key: string) => {
    if (key === "bookmarks") {
      return store.bookmark.list;
    }
    if (key === "wrongLog") {
      return store.wrongLog.list;
    }

    const { data } = await axios.get<string>(`./words-${key}.tsv`);
    const parsedWords = tsv.parse(
      data
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x.length)
        .join("\n")
    ) as Word[];
    console.log(data);
    return parsedWords.filter((x) => x.word.length > 0);
  };

  const handleChangeWordset = (key: string) => {
    setKey(key);
    loadWords(key).then((words) => {
      setWords(shuffle(words));
    });
  };

  const handleShuffle = () => {
    if (key === "bookmarks") {
      setWords(shuffle(loadStore().bookmark));
      return;
    }
    if (key === "wrongLog") {
      setWords(shuffle(loadStore().wrongLogs));
      return;
    }
    setWords((w) => shuffle(w));
  };

  const addAllWrongsToBookmark = () => {
    store.bookmark.add(store.wrongLog.list);
  };

  return (
    <>
      {key === null ? (
        <Container>
          <List>
            {template.map(([k, v]) => (
              <ListItem onClick={() => handleChangeWordset(k)} clickable>
                {v}
              </ListItem>
            ))}
          </List>
          <Space h={64} />
          <Card padding="wide">
            <Typo h2>북마크</Typo>
            <List>
              <ListItem
                clickable
                onClick={() => {
                  addAllWrongsToBookmark();
                  alert("북마크에 추가되었습니다.");
                }}
              >
                틀렸던 문제 전부 북마크에 추가
              </ListItem>
              <ListItem
                clickable
                onClick={() => {
                  store.bookmark.removeAll();
                  alert("북마크를 모두 삭제했습니다.");
                }}
              >
                북마크 전체 해제
              </ListItem>
              <ListItem
                clickable
                onClick={() => {
                  store.wrongLog.removeAll();
                  alert("틀린 단어를 모두 삭제했습니다.");
                }}
              >
                틀렸던 문제 로그 전체 해제
              </ListItem>
            </List>
          </Card>
        </Container>
      ) : (
        <Flashcards words={words} onShuffle={handleShuffle} />
      )}
    </>
  );
};

export default WordsList;
