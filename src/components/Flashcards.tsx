import { css, Global, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Button, Card, Space, Typo } from "@solved-ac/ui-react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IoArrowBack,
  IoChatbubbleEllipsesOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHelpCircleOutline,
  IoStar,
  IoStarOutline
} from "react-icons/io5";
import { useStore } from "../contexts/StoreContext";
import { useGranularEffect } from "../hooks/useGranularEffect";
import { Word } from "../types/word";
import { throwParty } from "../utils/confetti";

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
  position: relative;
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
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 0 1em;
`;

const WordWrapper = styled(Typo)`
  width: 100%;
`;

const MetaWrapper = styled(motion.div)`
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

interface Props {
  words: Word[];
  onShuffle: () => void;
}

const Flashcards = (props: Props) => {
  const uttrRef = useRef<SpeechSynthesisUtterance>(
    new SpeechSynthesisUtterance()
  );
  const store = useStore();
  const theme = useTheme();

  const { words, onShuffle } = props;

  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const item =
    index < words.length
      ? words[index]
      : { word: "", furigana: "", meaning: "" };
  const { word, furigana, meaning } = item;

  const bookmarked = useMemo(
    () => store.bookmark.has(word),
    [store.bookmark, word]
  );

  const wasWrong = useMemo(
    () => store.wrongLog.has(word),
    [store.wrongLog, word]
  );

  useEffect(() => {
    uttrRef.current.voice = window.speechSynthesis
      .getVoices()
      .filter((v) => v.lang.includes("ja"))[0];
  }, []);

  const speak = () => {
    uttrRef.current.text = word;
    speechSynthesis.speak(uttrRef.current);
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
                  <CardActions>
                    <div style={{ flex: "1 0 0" }}>
                      <Button
                        transparent
                        circle
                        disabled={index === 0}
                        onClick={() =>
                          setIndex((p) => {
                            setOpen(true);
                            return Math.max(0, p - 1);
                          })
                        }
                      >
                        <IoArrowBack />
                      </Button>
                    </div>
                    <div style={{ flex: "1 0 0" }}>
                      <span>
                        {index + 1} / {words.length}
                      </span>
                    </div>
                    <div style={{ flex: "1 0 0" }} />
                  </CardActions>
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
                      style={{ minWidth: "6em", fontSize: "1.5em" }}
                    >
                      <IoHelpCircleOutline />
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
                  <CardActions>
                    <div style={{ flex: "1 0 0" }}>
                      <Button
                        transparent
                        circle
                        disabled={index === 0}
                        onClick={() =>
                          setIndex((p) => {
                            setOpen(false);
                            return Math.max(0, p - 1);
                          })
                        }
                      >
                        <IoArrowBack />
                      </Button>
                    </div>
                    <div style={{ flex: "1 0 0" }}>
                      <span>
                        {index + 1} / {words.length}
                      </span>
                    </div>
                    <div style={{ flex: "1 0 0" }}>
                      <Button
                        transparent
                        circle
                        onClick={() =>
                          bookmarked
                            ? store.bookmark.remove(word)
                            : store.bookmark.add(item)
                        }
                      >
                        {bookmarked ? (
                          <IoStar color={theme.color.status.warn} />
                        ) : (
                          <IoStarOutline />
                        )}
                      </Button>
                    </div>
                  </CardActions>
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
                    <MotionConfig
                      transition={{ duration: 0.6, delayChildren: 0.2 }}
                    >
                      <MetaWrapper>
                        <FuriganaWrapper
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span
                            style={{
                              fontSize: `${Math.min(1, 8 / furigana.length)}em`,
                            }}
                          >
                            {furigana}
                          </span>
                          <Space w={8} />
                          <Button
                            transparent
                            circle
                            onClick={() => {
                              speak();
                            }}
                          >
                            <IoChatbubbleEllipsesOutline
                              color={theme.color.text.secondary.main}
                            />
                          </Button>
                        </FuriganaWrapper>
                        <MeaningWrapper
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {meaning}
                        </MeaningWrapper>
                        {wasWrong && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <Typo description>틀렸던 단어</Typo>
                          </motion.span>
                        )}
                      </MetaWrapper>
                    </MotionConfig>
                  </CardContents>
                  <CardActions>
                    <Button
                      style={{ minWidth: "3em", fontSize: "1.5em" }}
                      backgroundColor={theme.color.status.error}
                      onClick={() => {
                        setOpen(false);
                        word.length && store.wrongLog.add(item);
                        setIndex((p) => {
                          if (p + 1 < words.length) return p + 1;
                          onShuffle();
                          return 0;
                        });
                      }}
                    >
                      <IoCloseCircleOutline />
                    </Button>
                    <Button
                      style={{ minWidth: "3em", fontSize: "1.5em" }}
                      backgroundColor={theme.color.status.success}
                      onClick={() => {
                        setOpen(false);
                        if (wasWrong) {
                          throwParty({
                            colors: [
                              "#4DCFD6",
                              "#2CC1E0",
                              "#0090C9",
                              "#9BC3DE",
                              "#478CD6",
                            ],
                          });
                          store.wrongLog.remove(word);
                        }
                        setIndex((p) => {
                          if (p + 1 < words.length) return p + 1;
                          onShuffle();
                          return 0;
                        });
                      }}
                    >
                      <IoCheckmarkCircleOutline />
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
