import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brain, Flame, RotateCcw, Trophy } from 'lucide-react-native';

import colors from '../utils/colors';
import { shuffle, withAlpha } from '../utils/helpers';
import quizQuestions, { QUIZ_CATEGORIES } from '../data/quizQuestions';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../components/ScreenHeader';
import StatTile from '../components/StatTile';
import PrimaryButton from '../components/PrimaryButton';

const QUESTIONS_PER_ROUND = 10;
const SECONDS = 15;

const QuizScreen = ({ navigation }) => {
  const { quizStats, saveQuizResult } = useApp();

  const [phase, setPhase] = useState('menu'); // menu | play | result
  const [category, setCategory] = useState('mixed');
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const timerRef = useRef(null);

  const start = (cat) => {
    const pool = cat === 'mixed' ? quizQuestions : quizQuestions.filter((q) => q.category === cat);
    // shuffle options too, keeping track of the right answer
    const qs = shuffle(pool)
      .slice(0, QUESTIONS_PER_ROUND)
      .map((q) => {
        const opts = shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })));
        return { ...q, options: opts.map((o) => o.text), answer: opts.findIndex((o) => o.correct) };
      });
    setCategory(cat);
    setQuestions(qs);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(SECONDS);
    setPhase('play');
  };

  // countdown
  useEffect(() => {
    if (phase !== 'play' || selected !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setSelected(-1); // time out
          setStreak(0);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, index, selected]);

  const choose = (i) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(i);
    const q = questions[index];
    if (i === q.answer) {
      const newStreak = streak + 1;
      const points = 100 + timeLeft * 10 + (newStreak >= 3 ? 50 : 0);
      setScore((s) => s + points);
      setCorrect((c) => c + 1);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setStreak(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setIsRecord(score > quizStats.best);
      saveQuizResult({ category, score, correct, total: questions.length });
      setPhase('result');
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTimeLeft(SECONDS);
  };

  /* ---------------- MENU ---------------- */
  if (phase === 'menu') {
    const accuracy = quizStats.totalQuestions ? Math.round((quizStats.totalCorrect / quizStats.totalQuestions) * 100) : 0;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Sports Quiz" subtitle="10 questions · 15 seconds each" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.hero}>
            <Brain color={colors.primary} size={44} />
            <Text style={styles.heroTitle}>How well do you know sport?</Text>
            <Text style={styles.heroText}>Answer fast for bonus points. 3+ correct in a row = streak bonus 🔥</Text>
          </View>

          <View style={styles.tiles}>
            <StatTile label="Best score" value={quizStats.best} color={colors.primary} />
            <StatTile label="Played" value={quizStats.played} />
            <StatTile label="Accuracy" value={`${accuracy}%`} color={colors.info} />
          </View>

          <Text style={styles.sectionTitle}>Choose a category</Text>
          <View style={styles.grid}>
            {QUIZ_CATEGORIES.map((c) => {
              const count = c.key === 'mixed' ? quizQuestions.length : quizQuestions.filter((q) => q.category === c.key).length;
              const best = quizStats.byCategory[c.key];
              return (
                <TouchableOpacity key={c.key} style={styles.catCard} onPress={() => start(c.key)} activeOpacity={0.85}>
                  <Text style={styles.catEmoji}>{c.emoji}</Text>
                  <Text style={styles.catTitle}>{c.title}</Text>
                  <Text style={styles.catMeta}>{count} questions</Text>
                  {best ? <Text style={styles.catBest}>Best: {best}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {quizStats.history.length ? (
            <>
              <Text style={styles.sectionTitle}>Recent games</Text>
              {quizStats.history.slice(0, 5).map((h, i) => {
                const cat = QUIZ_CATEGORIES.find((c) => c.key === h.category);
                return (
                  <View key={`${h.date}${i}`} style={styles.historyRow}>
                    <Text style={styles.historyEmoji}>{cat?.emoji}</Text>
                    <Text style={styles.historyText}>
                      {cat?.title} · {h.correct}/{h.total}
                    </Text>
                    <Text style={styles.historyScore}>{h.score}</Text>
                  </View>
                );
              })}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------- RESULT ---------------- */
  if (phase === 'result') {
    const pct = Math.round((correct / questions.length) * 100);
    const verdict = pct >= 90 ? 'Legend! 🏆' : pct >= 70 ? 'Great job! 🔥' : pct >= 40 ? 'Not bad! 💪' : 'Keep training! 🏃';
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Results" onBack={() => setPhase('menu')} />
        <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'stretch' }]}>
          <View style={styles.resultCard}>
            {isRecord ? (
              <View style={styles.record}>
                <Trophy color={colors.onPrimary} size={14} />
                <Text style={styles.recordText}>NEW RECORD</Text>
              </View>
            ) : null}
            <Text style={styles.verdict}>{verdict}</Text>
            <Text style={styles.resultScore}>{score}</Text>
            <Text style={styles.resultLabel}>points</Text>
          </View>
          <View style={styles.tiles}>
            <StatTile label="Correct" value={`${correct}/${questions.length}`} color={colors.success} />
            <StatTile label="Accuracy" value={`${pct}%`} color={colors.info} />
            <StatTile label="Best streak" value={bestStreak} color={colors.accent} />
          </View>
          <PrimaryButton title="Play again" icon={RotateCcw} onPress={() => start(category)} style={{ marginHorizontal: 16, marginTop: 24 }} />
          <PrimaryButton title="Other category" variant="secondary" onPress={() => setPhase('menu')} style={{ marginHorizontal: 16, marginTop: 10 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ---------------- PLAY ---------------- */
  const q = questions[index];
  const timerColor = timeLeft > 8 ? colors.primary : timeLeft > 4 ? colors.warning : colors.danger;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={`Question ${index + 1}/${questions.length}`}
        subtitle={`${score} pts`}
        onBack={() => setPhase('menu')}
        right={
          streak >= 2 ? (
            <View style={styles.streak}>
              <Flame color={colors.accent} size={16} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.progress}>
        {questions.map((_, i) => (
          <View
            key={i}
            style={[styles.progressSeg, i < index && { backgroundColor: colors.primary }, i === index && { backgroundColor: colors.textSecondary }]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.playScroll}>
        <View style={[styles.timer, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text>
        </View>

        <Text style={styles.question}>{q.question}</Text>

        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === selected;
          let style = null;
          if (selected !== null && isAnswer) style = styles.optCorrect;
          else if (isPicked) style = styles.optWrong;
          return (
            <TouchableOpacity key={opt} style={[styles.option, style]} onPress={() => choose(i)} disabled={selected !== null} activeOpacity={0.8}>
              <View style={styles.optLetter}>
                <Text style={styles.optLetterText}>{'ABCD'[i]}</Text>
              </View>
              <Text style={styles.optText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {selected !== null ? (
          <>
            <Text style={[styles.feedback, { color: selected === q.answer ? colors.success : colors.danger }]}>
              {selected === q.answer ? 'Correct!' : selected === -1 ? "Time's up!" : 'Wrong answer'}
            </Text>
            <PrimaryButton
              title={index + 1 >= questions.length ? 'See results' : 'Next question'}
              onPress={next}
              style={{ marginTop: 12 }}
            />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 60,
  },
  hero: {
    marginHorizontal: 16,
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: withAlpha(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(colors.primary, 0.3),
  },
  heroTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 12,
    textAlign: 'center',
  },
  heroText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  tiles: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  catCard: {
    width: '48.5%',
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catEmoji: {
    fontSize: 30,
  },
  catTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginTop: 8,
  },
  catMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  catBest: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  historyEmoji: {
    fontSize: 20,
  },
  historyText: {
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '600',
  },
  historyScore: {
    color: colors.text,
    fontWeight: '900',
  },
  progress: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  playScroll: {
    padding: 16,
    paddingBottom: 60,
  },
  timer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 12,
  },
  timerText: {
    fontSize: 26,
    fontWeight: '900',
  },
  question: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 29,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
  },
  optCorrect: {
    borderColor: colors.success,
    backgroundColor: withAlpha(colors.success, 0.15),
  },
  optWrong: {
    borderColor: colors.danger,
    backgroundColor: withAlpha(colors.danger, 0.15),
  },
  optLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLetterText: {
    color: colors.textSecondary,
    fontWeight: '900',
  },
  optText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  feedback: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 18,
    marginTop: 8,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: withAlpha(colors.accent, 0.15),
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  streakText: {
    color: colors.accent,
    fontWeight: '900',
  },
  resultCard: {
    marginHorizontal: 16,
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  recordText: {
    color: colors.onPrimary,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  verdict: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  resultScore: {
    color: colors.primary,
    fontSize: 64,
    fontWeight: '900',
    marginTop: 8,
  },
  resultLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});

export default QuizScreen;
