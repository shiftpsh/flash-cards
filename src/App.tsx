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

const App = () => {
  const [key, setKey] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);

  const loadWords = async (key: string) => {
    if (key === "bookmarks") {
      return loadStore().bookmark;
    }

    const { data } = await axios.get<string>(`./words-${key}.tsv`);
    const parsedWords = tsv.parse(
      data
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x.length)
        .join("\n")
    ) as Word[];
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
    } else {
      setWords((w) => shuffle(w));
    }
  };

  return (
    <StoreProvider>
      <ThemeProvider theme={solvedThemes.light}>
        <SolvedGlobalStyles />
        <Global
          styles={css`
            ${emotionReset}

            html {
              font-family: "Pretendard Variable", Pretendard, -apple-system,
                BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue",
                "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR",
                "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji",
                "Segoe UI Symbol", sans-serif;
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
            <ListItem onClick={() => handleChangeWordset("a1")} clickable>
              A1
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
