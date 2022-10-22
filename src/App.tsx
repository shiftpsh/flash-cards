import { css, Global, ThemeProvider } from "@emotion/react";
import {
  SolvedGlobalStyles,
  solvedThemes
} from "@solved-ac/ui-react";
import emotionReset from "emotion-reset";
import WordsList from "./components/WordsList";
import { StoreProvider } from "./contexts/StoreContext";

const App = () => {
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
        <WordsList />
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
