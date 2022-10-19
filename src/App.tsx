import { css, Global, ThemeProvider } from "@emotion/react";
import {
  List,
  ListItem,
  SolvedGlobalStyles,
  solvedThemes
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

const template = [
  ["bookmarks", "북마크"],
  ["wrongLog", "틀렸던 단어들"],
  ["1a", "단어 리스트: 1A"],
  ["1a-2", "단어 리스트: 1A 누락"],
  ["s1a", "문장 리스트: 1A-1, 2"],
  ["s1a2", "문장 리스트: 1A-3, 5, 6"],
  ["1b", "문장 리스트: 1B"],
  ["1b-1", "단어 리스트 (분할): 1B-1"],
  ["1b-2", "단어 리스트 (분할): 1B-2"],
  ["1b-3", "단어 리스트 (분할): 1B-3"],
  ["1b-4", "단어 리스트 (분할): 1B-4"],
  ["s1b1", "문장 리스트 (분할): 1B-1"],
  ["s1b2", "문장 리스트 (분할): 1B-2"],
  ["s1c1", "문장 리스트 (분할): 1C-1"],
  ["s1c2", "문장 리스트 (분할): 1C-2"],
  ["g1a", "문법 리스트: 1A"],
  ["g1b", "문법 리스트: 1B"],
  ["g1c", "문법 리스트: 1C"],
  ["g1a1", "예문 리스트: 1A-1"],
  ["g1a2", "예문 리스트: 1A-2"],
  ["g1a3", "예문 리스트: 1A-3"],
  ["g1b1", "예문 리스트: 1B-1"],
  ["g1b2", "예문 리스트: 1B-2"],
  ["g1c1", "예문 리스트: 1C"],
];

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
            {template.map(([k, v]) => (
              <ListItem onClick={() => handleChangeWordset(k)} clickable>
                {v}
              </ListItem>
            ))}
          </List>
        ) : (
          <Flashcards words={words} onShuffle={handleShuffle} />
        )}
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
