import { css, Global, ThemeProvider } from "@emotion/react";
import {
  List,
  ListItem,
  SolvedGlobalStyles,
  solvedThemes,
} from "@solved-ac/ui-react";
import axios from "axios";
import emotionReset from "emotion-reset";
import { useState } from "react";
import tsv from "tsv";
import Flashcards from "./components/Flashcards";
import { StoreProvider } from "./contexts/StoreContext";
import { Word } from "./types/word";
import { shuffle } from "./utils/shuffle";
import { loadStore } from "./utils/store";

const App = () => {
  const [key, setKey] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);

  const loadWords = async (key: string) => {
    if (key === "bookmarks") {
      return loadStore().bookmark;
    }
    if (key === "wrongLog") {
      return loadStore().wrongLogs;
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

  return (
    <StoreProvider>
      <ThemeProvider theme={solvedThemes.light}>
        <SolvedGlobalStyles />
        <Global
          styles={css`
            ${emotionReset}

            html {
              font-family: "Pretendard Variable", "Pretendard JP", Pretendard,
                -apple-system, BlinkMacSystemFont, system-ui, Roboto,
                "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo",
                "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji",
                "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
              font-size: calc(10px + 0.7vmin);
              letter-spacing: -0.05ch;
            }

            *,
            *::after,
            *::before {
              box-sizing: border-box;
              -moz-osx-font-smoothing: grayscale;
              -webkit-font-smoothing: antialiased;
              font-smoothing: antialiased;
            }
          `}
        />
        {key === null ? (
          <List>
            <ListItem
              onClick={() => handleChangeWordset("bookmarks")}
              clickable
            >
              북마크
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("wrongLog")} clickable>
              틀렸던 단어들
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("1a")} clickable>
              단어 리스트: 1A
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("1a-2")} clickable>
              단어 리스트: 1A 누락
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("s1a")} clickable>
              문장 리스트: 1A-1, 2
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("s1a2")} clickable>
              문장 리스트: 1A-3, 5, 6
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("1b")} clickable>
              단어 리스트: 1B
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("1b-1")} clickable>
              단어 리스트 (분할): 1B-1
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("1b-2")} clickable>
              단어 리스트 (분할): 1B-2
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("1b-3")} clickable>
              단어 리스트 (분할): 1B-3
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("1b-4")} clickable>
              단어 리스트 (분할): 1B-4
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("s1b1")} clickable>
              문장 리스트 (분할): 1B-1
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("s1b2")} clickable>
              문장 리스트 (분할): 1B-2
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("s1c1")} clickable>
              문장 리스트 (분할): 1C-1
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("s1c2")} clickable>
              문장 리스트 (분할): 1C-2
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("g1a1")} clickable>
              예문 리스트: 1A-1
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("g1a2")} clickable>
              예문 리스트: 1A-2
            </ListItem>
            <ListItem onClick={() => handleChangeWordset("g1a3")} clickable>
              예문 리스트: 1A-3
            </ListItem>
          </List>
        ) : (
          <Flashcards words={words} onShuffle={handleShuffle} />
        )}
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
