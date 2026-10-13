import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Pencil, Share2, Play, Pause, ChevronLeft, ChevronRight, Flag, Trash2, RotateCcw, Bell } from 'lucide-react-native';

import colors from '../utils/colors';
import { formatClock, formatDateTime, getElapsed, withAlpha } from '../utils/helpers';
import { getGameScore, getLeaderText, getSideName, getSideTeam } from '../utils/gameLogic';
import { getRules } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import TeamBadge from '../components/TeamBadge';
import LiveDot from '../components/LiveDot';
import PrimaryButton from '../components/PrimaryButton';
import SheetModal, { SheetOption } from '../components/SheetModal';
import EmptyState from '../components/EmptyState';

const LiveGameScreen = ({ navigation, route }) => {
  const { gameId } = route.params;
  const {
    games,
    teams,
    tournaments,
    customSports,
    startGame,
    toggleClock,
    setPeriod,
    addGameEvent,
    removeGameEvent,
    finishGame,
    reopenGame,
    setQuickResult,
    updateGame,
  } = useApp();

  const game = games.find((g) => g.id === gameId);
  const [, setTick] = useState(0);
  const [pending, setPending] = useState(null); // { side, action } waiting for player pick
  const [quickOpen, setQuickOpen] = useState(false);
  const [quick, setQuick] = useState({ home: '', away: '' });

  // Re-render every second while the clock runs
  useEffect(() => {
    if (!game?.clock?.running) return;
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [game?.clock?.running]);

  const rules = useMemo(() => (game ? getRules(game.sport, customSports) : null), [game, customSports]);

  if (!game || !rules) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Game" onBack={() => navigation.goBack()} />
        <EmptyState emoji="🤷" title="Game not found" />
      </SafeAreaView>
    );
  }

  const tournament = game.tournamentId ? tournaments.find((t) => t.id === game.tournamentId) : null;
  const isKnockout = tournament?.format === 'knockout';
  const homeName = getSideName(game, 'home', teams);
  const awayName = getSideName(game, 'away', teams);
  const homeTeam = getSideTeam(game, 'home', teams);
  const awayTeam = getSideTeam(game, 'away', teams);
  const homeColor = homeTeam?.color || colors.primary;
  const awayColor = awayTeam?.color || colors.accent;
  const score = getGameScore(game);
  const elapsed = getElapsed(game.clock);
  const isLive = game.status === 'live';
  const isFinished = game.status === 'finished';
  const periodLabel = `${rules.periodName} ${game.period}${game.period > rules.periods ? ' (OT)' : `/${rules.periods}`}`;

  /* ---------- actions ---------- */
  const recordEvent = (side, action, player = null) => {
    Haptics.impactAsync(action.points ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addGameEvent(game.id, {
      side,
      type: action.type,
      label: action.label,
      icon: action.icon,
      points: action.points,
      player,
      clock: getElapsed(game.clock),
    });
  };

  const onAction = (side, action) => {
    const team = side === 'home' ? homeTeam : awayTeam;
    if (team?.players?.length) setPending({ side, action, players: team.players });
    else recordEvent(side, action);
  };

  const askWinner = (onPick) =>
    Alert.alert('Tie — who won?', isKnockout ? 'Knockout games need a winner (e.g. after penalties).' : `${rules.name} games can't end in a draw.`, [
      { text: homeName, onPress: () => onPick('home') },
      { text: awayName, onPress: () => onPick('away') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const onFinish = () => {
    const tie = score.home === score.away;
    if (tie && (!rules.allowDraw || isKnockout)) {
      askWinner((side) => finishGame(game.id, { winnerSide: side }));
      return;
    }
    Alert.alert('Finish game?', `Final score ${score.home}–${score.away}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          finishGame(game.id, { winnerSide: null });
        },
      },
    ]);
  };

  const onQuickSave = () => {
    const h = Number(quick.home) || 0;
    const a = Number(quick.away) || 0;
    const done = (winnerSide = null) => {
      setQuickResult(game.id, h, a, winnerSide);
      setQuickOpen(false);
    };
    if (h === a && (!rules.allowDraw || isKnockout)) askWinner(done);
    else done();
  };

  const onDeleteEvent = (e) =>
    Alert.alert('Remove event?', `${e.icon} ${e.label}${e.player ? ` — ${e.player}` : ''}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeGameEvent(game.id, e.id) },
    ]);

  const onShare = () => {
    const status = isFinished ? 'Final' : isLive ? `LIVE ${periodLabel}` : formatDateTime(game.date);
    const lines = [`${rules.emoji} ${homeName} ${score.home}–${score.away} ${awayName}`, status];
    const scorers = (game.events || []).filter((e) => e.points > 0 && e.player);
    if (scorers.length) {
      lines.push('', ...scorers.map((e) => `${e.icon} ${e.player} (${e.side === 'home' ? homeName : awayName}) ${formatClock(e.clock || 0)}`));
    }
    Share.share({ message: `${lines.join('\n')}\n\nTracked with Benacion Sports` });
  };

  /* ---------- derived ---------- */
  const total = score.home + score.away;
  const homeShare = total ? score.home / total : 0.5;
  const timeline = [...(game.events || [])].reverse();

  const statRows = rules.actions
    .map((a) => {
      const count = (side) => (game.events || []).filter((e) => e.type === a.type && e.side === side).length;
      return { ...a, home: count('home'), away: count('away') };
    })
    .filter((r) => r.home || r.away);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={`${rules.emoji} ${rules.name}`}
        subtitle={tournament ? `${tournament.name} · Round ${game.round}` : formatDateTime(game.date)}
        onBack={() => navigation.goBack()}
        right={
          <>
            <HeaderButton icon={Share2} onPress={onShare} />
            <HeaderButton icon={Pencil} onPress={() => navigation.navigate('AddEditGame', { gameId: game.id })} />
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* SCOREBOARD */}
        <View style={[styles.board, isLive && { borderColor: colors.live }]}>
          <View style={styles.boardStatus}>
            {isLive ? <LiveDot /> : <Text style={styles.statusText}>{isFinished ? 'FULL TIME' : 'NOT STARTED'}</Text>}
            {isLive || isFinished ? <Text style={styles.period}>{periodLabel}</Text> : null}
          </View>

          <View style={styles.boardRow}>
            <TouchableOpacity
              style={styles.boardSide}
              disabled={!homeTeam}
              onPress={() => navigation.navigate('MyTeam', { teamId: homeTeam?.id })}
            >
              <TeamBadge uri={homeTeam?.logo || game.source?.homeBadge} name={homeName} color={homeColor} size={60} />
              <Text style={styles.boardName} numberOfLines={2}>
                {homeName}
              </Text>
            </TouchableOpacity>

            <View style={styles.boardCenter}>
              <Text style={styles.boardScore}>
                {score.home}
                <Text style={styles.boardColon}> : </Text>
                {score.away}
              </Text>
              {isLive || (isFinished && elapsed) ? (
                <Text style={[styles.clock, game.clock?.running && { color: colors.primary }]}>{formatClock(elapsed)}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.boardSide}
              disabled={!awayTeam}
              onPress={() => navigation.navigate('MyTeam', { teamId: awayTeam?.id })}
            >
              <TeamBadge uri={awayTeam?.logo || game.source?.awayBadge} name={awayName} color={awayColor} size={60} />
              <Text style={styles.boardName} numberOfLines={2}>
                {awayName}
              </Text>
            </TouchableOpacity>
          </View>

          {isLive || isFinished ? (
            <>
              <View style={styles.momentum}>
                <View style={{ flex: Math.max(0.02, homeShare), backgroundColor: homeColor }} />
                <View style={{ flex: Math.max(0.02, 1 - homeShare), backgroundColor: awayColor }} />
              </View>
              <Text style={styles.leader}>
                {game.winnerSide && score.home === score.away
                  ? `${game.winnerSide === 'home' ? homeName : awayName} won (decider)`
                  : getLeaderText(game, homeName, awayName)}
              </Text>
            </>
          ) : null}
        </View>

        {/* CONTROLS */}
        {game.status === 'scheduled' ? (
          <View style={styles.block}>
            <PrimaryButton title="Start game" icon={Play} onPress={() => startGame(game.id)} />
            <View style={styles.rowBtns}>
              <PrimaryButton
                title="Enter result"
                variant="secondary"
                small
                style={{ flex: 1 }}
                onPress={() => {
                  setQuick({ home: '', away: '' });
                  setQuickOpen(true);
                }}
              />
              <PrimaryButton
                title={game.remind ? 'Reminder on' : 'Remind me'}
                icon={Bell}
                variant={game.remind ? 'ghost' : 'secondary'}
                small
                style={{ flex: 1 }}
                onPress={() => updateGame(game.id, { remind: !game.remind })}
              />
            </View>
          </View>
        ) : null}

        {isLive ? (
          <>
            <View style={styles.clockRow}>
              <TouchableOpacity
                style={styles.periodBtn}
                onPress={() => setPeriod(game.id, game.period - 1)}
                disabled={game.period <= 1}
              >
                <ChevronLeft color={game.period <= 1 ? colors.textMuted : colors.text} size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.playBtn, game.clock?.running && styles.playBtnActive]}
                onPress={() => toggleClock(game.id)}
              >
                {game.clock?.running ? <Pause color={colors.onPrimary} size={22} /> : <Play color={colors.text} size={22} />}
                <Text style={[styles.playText, game.clock?.running && { color: colors.onPrimary }]}>
                  {game.clock?.running ? 'Pause clock' : 'Run clock'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.periodBtn}
                onPress={() =>
                  Alert.alert(`Start ${rules.periodName.toLowerCase()} ${game.period + 1}?`, 'The clock will reset.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Next', onPress: () => setPeriod(game.id, game.period + 1) },
                  ])
                }
              >
                <ChevronRight color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsWrap}>
              {[
                { side: 'home', name: homeName, color: homeColor },
                { side: 'away', name: awayName, color: awayColor },
              ].map(({ side, name, color }) => (
                <View key={side} style={styles.actionCol}>
                  <Text style={[styles.actionTeam, { color }]} numberOfLines={1}>
                    {name}
                  </Text>
                  {rules.actions.map((a) => (
                    <TouchableOpacity
                      key={a.type}
                      style={[
                        styles.actionBtn,
                        a.points > 0 && { backgroundColor: withAlpha(color, 0.16), borderColor: color },
                      ]}
                      onPress={() => onAction(side, a)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionIcon}>{a.icon}</Text>
                      <Text style={styles.actionLabel}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            <PrimaryButton title="Finish game" icon={Flag} variant="danger" onPress={onFinish} style={styles.finishBtn} />
          </>
        ) : null}

        {isFinished ? (
          <View style={styles.block}>
            <PrimaryButton
              title="Reopen game"
              icon={RotateCcw}
              variant="secondary"
              small
              onPress={() =>
                Alert.alert('Reopen game?', 'You can keep recording events and finish it again.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reopen', onPress: () => reopenGame(game.id) },
                ])
              }
            />
          </View>
        ) : null}

        {/* STATS */}
        {statRows.length ? (
          <>
            <SectionHeader title="Match stats" />
            <View style={styles.card}>
              {statRows.map((r) => {
                const sum = r.home + r.away;
                return (
                  <View key={r.type} style={styles.statRow}>
                    <View style={styles.statHead}>
                      <Text style={styles.statNum}>{r.home}</Text>
                      <Text style={styles.statLabel}>
                        {r.icon} {r.label}
                      </Text>
                      <Text style={styles.statNum}>{r.away}</Text>
                    </View>
                    <View style={styles.statBar}>
                      <View style={{ flex: r.home / sum || 0.001, backgroundColor: homeColor }} />
                      <View style={{ flex: r.away / sum || 0.001, backgroundColor: awayColor }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}

        {/* TIMELINE */}
        {game.status !== 'scheduled' ? (
          <>
            <SectionHeader title="Timeline" />
            {timeline.length ? (
              <View style={styles.card}>
                {timeline.map((e) => {
                  const isHome = e.side === 'home';
                  return (
                    <TouchableOpacity key={e.id} style={styles.tlRow} onLongPress={() => onDeleteEvent(e)} activeOpacity={0.8}>
                      <Text style={styles.tlTime}>
                        {rules.periodName[0]}
                        {e.period} · {formatClock(e.clock || 0)}
                      </Text>
                      <View style={[styles.tlDot, { backgroundColor: isHome ? homeColor : awayColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tlTitle}>
                          {e.icon} {e.label}
                          {e.points ? <Text style={{ color: colors.primary }}>{`  +${e.points}`}</Text> : null}
                        </Text>
                        <Text style={styles.tlSub} numberOfLines={1}>
                          {e.player ? `${e.player} · ` : ''}
                          {isHome ? homeName : awayName}
                        </Text>
                      </View>
                      <TouchableOpacity hitSlop={10} onPress={() => onDeleteEvent(e)}>
                        <Trash2 color={colors.textMuted} size={16} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.muted}>No events yet — tap an action above to record one.</Text>
            )}
          </>
        ) : null}

        {/* DETAILS */}
        {game.venue || game.notes ? (
          <>
            <SectionHeader title="Details" />
            <View style={[styles.card, { padding: 16 }]}>
              {game.venue ? <Text style={styles.detail}>📍 {game.venue}</Text> : null}
              {game.notes ? <Text style={[styles.detail, game.venue ? { marginTop: 8 } : null]}>{game.notes}</Text> : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* PLAYER PICKER */}
      <SheetModal
        visible={!!pending}
        onClose={() => setPending(null)}
        title={pending ? `${pending.action.icon} ${pending.action.label} — who?` : ''}
      >
        <SheetOption
          label="Skip — no player"
          onPress={() => {
            recordEvent(pending.side, pending.action);
            setPending(null);
          }}
        />
        {(pending?.players || []).map((p) => (
          <SheetOption
            key={p.id}
            label={p.name}
            sublabel={p.position}
            emoji={p.number ? `#${p.number}` : '👤'}
            onPress={() => {
              recordEvent(pending.side, pending.action, p.name);
              setPending(null);
            }}
          />
        ))}
      </SheetModal>

      {/* QUICK RESULT */}
      <SheetModal visible={quickOpen} onClose={() => setQuickOpen(false)} title="Enter final score">
        <View style={styles.quickRow}>
          <View style={styles.quickSide}>
            <Text style={styles.quickName} numberOfLines={1}>
              {homeName}
            </Text>
            <TextInput
              style={styles.quickInput}
              keyboardType="number-pad"
              value={quick.home}
              onChangeText={(v) => setQuick((q) => ({ ...q, home: v.replace(/\D/g, '') }))}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <Text style={styles.quickColon}>:</Text>
          <View style={styles.quickSide}>
            <Text style={styles.quickName} numberOfLines={1}>
              {awayName}
            </Text>
            <TextInput
              style={styles.quickInput}
              keyboardType="number-pad"
              value={quick.away}
              onChangeText={(v) => setQuick((q) => ({ ...q, away: v.replace(/\D/g, '') }))}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
        <PrimaryButton title="Save result" onPress={onQuickSave} style={{ marginTop: 16 }} />
      </SheetModal>
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
  board: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  boardStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusText: {
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 12,
  },
  period: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardSide: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  boardName: {
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  boardCenter: {
    alignItems: 'center',
    minWidth: 120,
  },
  boardScore: {
    color: colors.text,
    fontSize: 46,
    fontWeight: '900',
  },
  boardColon: {
    color: colors.textMuted,
  },
  clock: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  momentum: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 18,
    gap: 2,
  },
  leader: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 10,
  },
  block: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  rowBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  periodBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  playText: {
    color: colors.text,
    fontWeight: '800',
  },
  actionsWrap: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  actionCol: {
    flex: 1,
    gap: 8,
  },
  actionTeam: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  finishBtn: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
  },
  statRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNum: {
    color: colors.text,
    fontWeight: '900',
    width: 30,
    textAlign: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  statBar: {
    flexDirection: 'row',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  tlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tlTime: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    width: 64,
    fontVariant: ['tabular-nums'],
  },
  tlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tlTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  tlSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  muted: {
    color: colors.textMuted,
    paddingHorizontal: 16,
  },
  detail: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  quickSide: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickName: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  quickInput: {
    width: '100%',
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  quickColon: {
    color: colors.textMuted,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 14,
  },
});

export default LiveGameScreen;
