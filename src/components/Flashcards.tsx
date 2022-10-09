import { css, Global, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Card, Space, Typo } from "@solved-ac/ui-react";
import axios from "axios";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import {
  IoChatbubbleEllipsesOutline,
  IoCheckmarkCircleOutline
} from "react-icons/io5";
import tsv from "tsv";
import { useGranularEffect } from "../hooks/useGranularEffect";
import { Word } from "../types/word";
import { shuffle } from "../utils/shuffle";

const Fullscreen = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  overflow: hidden;
  perspective: 1000px;
`;

const Flashcard = styled(motion(Card))`
  width: 20em;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 2 / 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2em 1em;
  box-shadow: ${({ theme }) => theme.styles.shadow(undefined, 32)};
`;

const CardContents = styled.div`
  flex: 4 0 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CardActions = styled.div`
  flex: 1 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0 1em;
`;

const WordWrapper = styled(Typo)`
  width: 100%;
`;

const MetaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em 0;
`;

const FuriganaWrapper = styled(motion.span)`
  flex: 1 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 1.5em;
  color: ${({ theme }) => theme.color.text.secondary.main};
`;

const MeaningWrapper = styled(motion.span)`
  flex: 1 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 1.5em;
  font-weight: 700;
`;

const Flashcards = () => {
  const theme = useTheme();

  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get("./words-a1.tsv")
      .then((res) => {
        const words = res.data;
        const shuffled = shuffle(
          (tsv.parse(words) as Word[]).filter((s) => s.word.length)
        );
        setWords(shuffled);
        console.log(shuffled);
      })
      .catch((err) => console.error(err));
  }, []);

  const { word, furigana, meaning } =
    index < words.length
      ? words[index]
      : { word: "", furigana: "", meaning: "" };

  const speak = () => {
    const uttr = new SpeechSynthesisUtterance(word);
    uttr.voice = window.speechSynthesis
      .getVoices()
      .filter((v) => v.lang.includes("ja"))[0];
    speechSynthesis.speak(uttr);
  };

  useGranularEffect(
    () => {
      if (!open) return;
      speak();
    },
    [open],
    [speak]
  );

  return (
    <>
      <MotionConfig transition={{ duration: 0.2 }}>
        <Fullscreen>
          <Global
            styles={css`
              html,
              body,
              div#root {
                width: 100%;
                height: 100%;
              }
            `}
          />
          <AnimatePresence mode="wait">
            {!open && (
              <Fullscreen
                key="back"
                initial={{ y: "50%", opacity: 0 }}
                animate={{ y: 0, opacity: 1, rotateY: 0 }}
                exit={{ rotateY: "90deg" }}
              >
                <Flashcard>
                  <CardContents>
                    <WordWrapper
                      kwy="word"
                      h1
                      no-margin
                      style={{
                        fontSize: `${Math.min(4, 16 / word.length)}em`,
                      }}
                    >
                      {word}
                    </WordWrapper>
                  </CardContents>
                  <CardActions>
                    <Button
                      backgroundColor={theme.color.status.success}
                      onClick={() => setOpen(true)}
                    >
                      <IoCheckmarkCircleOutline />
                    </Button>
                  </CardActions>
                </Flashcard>
              </Fullscreen>
            )}
            {open && (
              <Fullscreen
                key="front"
                initial={{
                  rotateY: "270deg",
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  rotateY: "360deg",
                }}
                exit={{ y: "50%", opacity: 0 }}
              >
                <Flashcard>
                  <CardContents>
                    <WordWrapper
                      kwy="word"
                      h1
                      no-margin
                      style={{
                        fontSize: `${Math.min(4, 16 / word.length)}em`,
                      }}
                      transition={{
                        height: { duration: 0.2 },
                      }}
                    >
                      {word}
                    </WordWrapper>
                    <Space h="2em" />
                    <MotionConfig transition={{ duration: 0.6 }}>
                      <MetaWrapper>
                        <FuriganaWrapper
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {furigana}
                        </FuriganaWrapper>
                        <MeaningWrapper
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {meaning}
                        </MeaningWrapper>
                      </MetaWrapper>
                    </MotionConfig>
                  </CardContents>
                  <CardActions>
                    <Button
                      backgroundColor={theme.color.status.success}
                      onClick={() => {
                        setOpen(false);
                        setIndex((p) => {
                          if (p + 1 < words.length) return p + 1;
                          setWords((w) => shuffle(w));
                          return 0;
                        });
                      }}
                    >
                      <IoCheckmarkCircleOutline />
                    </Button>
                    <Button
                      backgroundColor={theme.color.status.warn}
                      onClick={() => {
                        speak();
                      }}
                    >
                      <IoChatbubbleEllipsesOutline />
                    </Button>
                  </CardActions>
                </Flashcard>
              </Fullscreen>
            )}
          </AnimatePresence>
        </Fullscreen>
      </MotionConfig>
    </>
  );
};

export default Flashcards;
